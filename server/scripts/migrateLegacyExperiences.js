require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const sanitizeHtml = require('sanitize-html');
const striptags = require('striptags');

// pdf-parse's export shape has changed between major versions (v1.x
// exports the function directly; some v2.x builds wrap it under
// `.default`). Handle both so a version mismatch fails fast with a
// clear message instead of silently breaking every PDF.
const pdfParseModule = require('pdf-parse');
const pdfParse = typeof pdfParseModule === 'function'
	? pdfParseModule
	: (pdfParseModule && typeof pdfParseModule.default === 'function' ? pdfParseModule.default : null);

if (!pdfParse) {
	throw new Error(
		"pdf-parse did not export a callable function. Run `npm install pdf-parse@1.1.1 --save-exact` " +
		"in the server folder to pin the stable v1 API, then re-run this script."
	);
}

const connectDB = require('../config/db.js');
const User = require('../models/User.js');
const Experience = require('../models/Experience.js');
const { extractExperienceMetadata } = require('../services/embeddingServices.js');

// ============================================================
// CONFIG — edit these before running
// ============================================================

// Absolute path to the root folder on YOUR machine (Windows path is fine).
const ROOT_DIR = 'C:\\Users\\shivk\\Downloads\\Internship Guide - CoC';

// Status assigned to every imported experience. Set to 'approved' since
// this content already lived publicly on the official CoC site and
// doesn't need re-review through the admin queue.
const IMPORT_STATUS = 'approved';

// Dedicated system user that all migrated experiences are attached to.
const LEGACY_USER_EMAIL = 'legacy-import@intervjti.local';

const MAX_CONTENT_LENGTH = Number(process.env.MAX_CONTENT_LENGTH) || 20000;

// Delay between Gemini metadata calls to stay within free-tier rate
// limits across ~500+ files. Increase if you see repeated retries.
const DELAY_BETWEEN_GEMINI_CALLS_MS = 1000;

// How much of the extracted document text to send to Gemini for
// metadata extraction. Enough to reach an intro/company mention
// without sending the whole (possibly 20k-char) document every time.
const METADATA_TEXT_EXCERPT_LENGTH = 1500;

// Set to true to only analyze and write a CSV report — no DB writes.
const DRY_RUN = process.argv.includes('--dry-run');

// ============================================================
// Path-based filtering — folders that are NOT interview experiences
// ============================================================

// Exact folder-name matches (case-insensitive) to skip entirely.
const EXCLUDE_SEGMENT_EQUALS = ['material', 'books', 'old', 'study material'];

// Substring matches (case-insensitive) anywhere in the path to skip.
const EXCLUDE_PATH_SUBSTRINGS = [
	'sample resume',
	'mock interview',
	'interview prep session',
	'domain-wise database'
];

// Folder names that are organizational buckets, not company names —
// skipped when looking for a "company" folder in the path.
const BUCKET_SEGMENTS = new Set([
	'internship guide - coc',
	'internship', 'internships',
	'placement', 'placements',
	'interview experience', 'interview experiences',
	'internship experience', 'internship experiences',
	'fte', 'ppo',
	'final placement',
	'placements upto 2017'
]);

// Broader keyword-based check: real company names essentially never
// contain these words, so treat any folder containing them as an
// organizational bucket rather than requiring an exact name match
// (this is what catches folders we didn't anticipate, like
// "Pre placement Interview during Internship" or "Campus").
const BUCKET_KEYWORDS = ['interview', 'internship', 'placement', 'experience', 'fte', 'campus', 'ppo'];

function isBucketFolderName(seg) {
	const lower = seg.toLowerCase().trim();
	if (BUCKET_SEGMENTS.has(lower)) return true;
	return BUCKET_KEYWORDS.some((kw) => lower.includes(kw));
}

// Words that indicate a filename is describing the submission itself
// ("... Interview Experience") rather than containing a real person's
// or company's name.
const GENERIC_KEYWORDS = [
	'interview experience', 'internship experience',
	'interview exp', 'internship exp',
	'interview', 'internship', 'experience',
	'placement', 'placements', 'fte', 'ppo',
	'final year', 'final placement'
];

function containsGenericKeyword(text) {
	const lower = text.toLowerCase();
	return GENERIC_KEYWORDS.some((kw) => lower.includes(kw));
}

function stripGenericKeywords(text) {
	let result = text;
	for (const kw of GENERIC_KEYWORDS) {
		const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		result = result.replace(new RegExp(escaped, 'ig'), ' ');
	}
	return result;
}

// General cleanup: strip a leading rank-number prefix ("03 ", "12. "),
// collapse separator punctuation into spaces, collapse whitespace.
function cleanupText(text) {
	return text
		.replace(/^\d+\.?\s*/, '')
		.replace(/[_\-.,()]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

// Known duplicate/casing variants of the same company, collapsed to
// one canonical form so the site doesn't show 3-4 spellings of the
// same employer. Keys are lowercase, already-cleaned strings.
const COMPANY_ALIASES = {
	'ibm': 'IBM',
	'microsoft': 'Microsoft',
	'cisco': 'Cisco',
	'goldman': 'Goldman Sachs',
	'hilti': 'Hilti',
	'visa': 'Visa',
	'vistaar': 'Vistaar',
	'citicorp': 'Citi',
	'citi corp': 'Citi',
	'de shaw': 'D.E. Shaw',
	'd e shaw': 'D.E. Shaw',
	'deustche bank': 'Deutsche Bank',
	'bank of america': 'Bank of America'
};

function normalizeCompanyName(rawName) {
	const cleaned = cleanupText(rawName);
	const alias = COMPANY_ALIASES[cleaned.toLowerCase()];
	return alias || cleaned;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retries transient Gemini errors (rate limits, 5xx) with exponential
// backoff. Non-retryable errors (e.g. a JSON parse failure) are
// thrown immediately so the caller's heuristic fallback kicks in.
async function withRetry(fn, retries = 3, backoffMs = 3000) {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			return await fn();
		} catch (err) {
			const message = err.message || '';
			const isRetryable = /429|500|502|503|rate.?limit/i.test(message);
			if (attempt === retries || !isRetryable) throw err;
			console.warn(`Gemini call failed (attempt ${attempt}/${retries}, retrying in ${backoffMs}ms): ${message}`);
			await sleep(backoffMs);
			backoffMs *= 2;
		}
	}
}

// Heuristic fallback, used only if the Gemini call fails outright
// after retries (network issue, quota exhausted, bad response, etc.)
// so a file is never skipped just because one API call failed.
function heuristicMetadataFallback(segments, filenameNoExt) {
	const folderCompany = parseCompanyFromFolders(segments);
	if (folderCompany) {
		return { companyName: folderCompany, studentName: cleanStudentName(filenameNoExt, folderCompany) };
	}
	const parsed = parseFromFilename(filenameNoExt);
	return {
		companyName: parsed.companyName || 'Unknown',
		studentName: parsed.studentName || 'Unknown'
	};
}

const SUPPORTED_EXTENSIONS = new Set(['.pdf', '.docx']);

// ============================================================
// Helpers
// ============================================================

function shouldExclude(relPath) {
	const lower = relPath.toLowerCase();
	const segments = relPath.split(path.sep).map((s) => s.toLowerCase());

	if (segments.some((seg) => EXCLUDE_SEGMENT_EQUALS.includes(seg))) return true;
	if (EXCLUDE_PATH_SUBSTRINGS.some((sub) => lower.includes(sub))) return true;

	return false;
}

// Walk a directory recursively, returning absolute file paths.
function walk(dir, results = []) {
	const entries = fs.readdirSync(toLongPath(dir), { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walk(fullPath, results);
		} else {
			results.push(fullPath);
		}
	}
	return results;
}

// Windows has a 260-character MAX_PATH limit by default — fs calls on
// longer paths fail (often with a confusing ENOENT) even though the
// file clearly exists. Prefixing with \\?\ (or \\?\UNC\ for network
// paths) tells Windows to bypass that limit. No-op on other platforms.
function toLongPath(absPath) {
	if (process.platform !== 'win32') return absPath;
	if (absPath.startsWith('\\\\?\\')) return absPath;
	if (absPath.startsWith('\\\\')) return '\\\\?\\UNC\\' + absPath.slice(2);
	return '\\\\?\\' + absPath;
}

// Try to find a "batch" (year or year-range) anywhere in the path,
// deepest folder first — e.g. "Placements 2009-10" -> "2009-10",
// "2018 Experiences" -> "2018", "Pre 2018 Experiences" -> "Pre-2018".
function parseBatch(segments) {
	for (let i = segments.length - 1; i >= 0; i--) {
		const seg = segments[i];

		const rangeMatch = seg.match(/((19|20)\d{2})\s*-\s*(\d{2,4})/);
		if (rangeMatch) return rangeMatch[0].replace(/\s+/g, '');

		if (/^pre\s*(19|20)\d{2}/i.test(seg)) {
			const yearMatch = seg.match(/(19|20)\d{2}/);
			if (yearMatch) return `Pre-${yearMatch[0]}`;
		}

		if (/^upto\s*(19|20)\d{2}/i.test(seg) || /placements upto/i.test(seg)) {
			const yearMatch = seg.match(/(19|20)\d{2}/);
			if (yearMatch) return `Upto-${yearMatch[0]}`;
		}

		const yearMatch = seg.match(/\b(19|20)\d{2}\b/);
		if (yearMatch) return yearMatch[0];
	}
	return 'Unknown';
}

// Try to find a company-named folder in the path, deepest first,
// skipping generic bucket folder names and batch/year-looking folders.
function parseCompanyFromFolders(segments) {
	for (let i = segments.length - 1; i >= 0; i--) {
		const seg = segments[i];

		if (isBucketFolderName(seg)) continue;
		if (/(19|20)\d{2}/.test(seg)) continue; // looks like a year/batch folder
		if (/^placements?\s/i.test(seg)) continue;

		const cleaned = cleanupText(seg);
		if (cleaned) return cleaned;
	}
	return null;
}

// A company folder was found — now isolate the real student name (if
// any) from the filename by removing the company name and generic
// submission-description words. If nothing meaningful survives, the
// file just doesn't record a student name.
function cleanStudentName(filenameNoExt, companyName) {
	let text = filenameNoExt;

	const escapedCompany = companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	text = text.replace(new RegExp(escapedCompany, 'ig'), ' ');
	text = stripGenericKeywords(text);
	text = text.replace(/\b(19|20)\d{2}(-\d{2,4})?\b/g, ' '); // stray years
	text = cleanupText(text);

	return text.length >= 3 ? text : 'Unknown';
}

// Fallback (no company folder found): parse from the filename itself.
// Handles two shapes seen in this dataset:
//   "Company_ StudentName.ext"     -> confident split
//   "Company.ext" (no underscore, no generic words, short) -> the
//     whole filename is just the company name, no student recorded
// Anything else is genuinely ambiguous (e.g. "FirstName LastName -
// Company.ext" vs "Company - description.ext" look identical
// structurally) and is reported as low-confidence for manual review
// rather than guessed at.
function parseFromFilename(filenameNoExt) {
	const cleaned = filenameNoExt.trim();

	if (cleaned.includes('_')) {
		const parts = cleaned.split('_').map((p) => p.trim()).filter(Boolean);
		if (parts.length >= 2) {
			const companyName = cleanupText(parts[0]);
			const studentName = cleanupText(parts.slice(1).join(' '));
			// Reject candidates like "Internship Experience_ Name" — the
			// part before the underscore is describing the submission,
			// not naming a company, even though it structurally matches
			// the "Company_Name" pattern.
			if (companyName && studentName && !containsGenericKeyword(companyName)) {
				// 3+ parts, or a "student name" that itself contains a
				// generic keyword (e.g. "Jishnu Bandodkar_HSBC Interview
				// Experience"), signals the assumed Company_Name split
				// may be reversed or otherwise unreliable here.
				const lowConfidence = parts.length > 2 || containsGenericKeyword(studentName);
				return { companyName, studentName, lowConfidence };
			}
		}
	}

	if (!containsGenericKeyword(cleaned) && cleaned.split(/\s+/).length <= 4) {
		return { companyName: cleanupText(cleaned), studentName: 'Unknown', lowConfidence: false };
	}

	return { companyName: null, studentName: null, lowConfidence: true };
}

function buildPreview(plainText) {
	return plainText.length > 200
		? plainText.slice(0, 200).split(' ').slice(0, -1).join(' ') + '...'
		: plainText;
}

function textToHtml(rawText) {
	const escaped = rawText
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

	const paragraphs = escaped
		.split(/\r?\n+/)
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => `<p>${line}</p>`);

	return paragraphs.join('');
}

async function extractText(filePath) {
	const ext = path.extname(filePath).toLowerCase();

	if (ext === '.docx') {
		const result = await mammoth.extractRawText({ path: toLongPath(filePath) });
		return result.value;
	}

	if (ext === '.pdf') {
		const buffer = fs.readFileSync(toLongPath(filePath));
		const data = await withSuppressedWarnings(() => pdfParse(buffer));
		return data.text;
	}

	throw new Error(`Unsupported extension: ${ext}`);
}

// pdf.js (used internally by pdf-parse) prints noisy "TT: undefined
// function" / "invalid function id" warnings to the console for PDFs
// with malformed embedded fonts. They're harmless — text extraction
// still works fine — but flood the terminal, so silence them.
async function withSuppressedWarnings(fn) {
	const originalWarn = console.warn;
	console.warn = () => {};
	try {
		return await fn();
	} finally {
		console.warn = originalWarn;
	}
}

async function getOrCreateLegacyUser() {
	let user = await User.findOne({ email: LEGACY_USER_EMAIL });
	if (!user) {
		user = await User.create({
			email: LEGACY_USER_EMAIL,
			role: 'student'
			// name is auto-derived from email by the User pre-save hook
		});
		console.log(`Created legacy import user: ${user._id}`);
	}
	return user;
}

// ============================================================
// Main
// ============================================================

const migrateLegacyExperiences = async () => {
	if (!fs.existsSync(toLongPath(ROOT_DIR))) {
		console.error(`ROOT_DIR does not exist: ${ROOT_DIR}`);
		process.exit(1);
	}

	const allFiles = walk(ROOT_DIR);
	const candidateFiles = allFiles.filter((absPath) => {
		const relPath = path.relative(ROOT_DIR, absPath);
		const ext = path.extname(absPath).toLowerCase();
		if (!SUPPORTED_EXTENSIONS.has(ext)) return false;
		if (shouldExclude(relPath)) return false;
		return true;
	});

	console.log(`Found ${allFiles.length} total files, ${candidateFiles.length} candidates after filtering.`);

	let legacyUser = null;
	if (!DRY_RUN) {
		await connectDB();
		legacyUser = await getOrCreateLegacyUser();
	}

	// status column values: 'gemini' (metadata came from Gemini),
	// 'heuristic-fallback' (Gemini call failed, folder/filename used
	// instead), 'skipped-empty', or 'failed:<error>'.
	const csvRows = ['relativePath,batch,companyName,studentName,textLength,status'];

	let created = 0;
	let skippedDuplicate = 0;
	let skippedEmpty = 0;
	let failed = 0;

	for (const absPath of candidateFiles) {
		const relPath = path.relative(ROOT_DIR, absPath);

		try {
			if (!DRY_RUN) {
				const exists = await Experience.exists({ importSourcePath: relPath });
				if (exists) {
					skippedDuplicate++;
					continue;
				}
			}

			const segments = relPath.split(path.sep).slice(0, -1); // exclude filename
			const filenameNoExt = path.basename(absPath, path.extname(absPath));

			const batch = parseBatch(segments.length ? segments : [path.basename(ROOT_DIR)]);

			// Extract text FIRST — both to feed Gemini and so we don't
			// waste an API call on a file with no usable content.
			const rawText = await extractText(absPath);
			const html = textToHtml(rawText);
			const cleanContent = sanitizeHtml(html, {
				allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
				allowedAttributes: {
					a: ['href', 'target'],
					img: ['src']
				}
			});

			const plainText = striptags(cleanContent).replace(/\s+/g, ' ').trim();

			if (plainText.length < 30) {
				skippedEmpty++;
				csvRows.push(`"${relPath}","${batch}","","",${plainText.length},skipped-empty`);
				continue;
			}

			// Gemini is the primary source for companyName/studentName —
			// it reads the actual document text, which is far more
			// reliable than filename/folder string-matching. The
			// folder/filename heuristics are only used as a fallback
			// if the Gemini call fails outright after retries.
			let companyName;
			let studentName;
			let metadataSource;

			try {
				const folderHints = segments.join(' / ');
				const textExcerpt = plainText.slice(0, METADATA_TEXT_EXCERPT_LENGTH);
				const meta = await withRetry(() => extractExperienceMetadata(filenameNoExt, folderHints, textExcerpt));
				companyName = meta.companyName;
				studentName = meta.studentName;
				metadataSource = 'gemini';
			} catch (err) {
				console.warn(`Gemini metadata extraction failed for ${relPath} (${err.message}) — using folder/filename heuristics instead.`);
				const fallback = heuristicMetadataFallback(segments, filenameNoExt);
				companyName = fallback.companyName;
				studentName = fallback.studentName;
				metadataSource = 'heuristic-fallback';
			}

			companyName = normalizeCompanyName(companyName);
			await sleep(DELAY_BETWEEN_GEMINI_CALLS_MS);

			let finalContent = cleanContent;
			if (finalContent.length > MAX_CONTENT_LENGTH) {
				console.warn(`Truncating oversized content: ${relPath}`);
				finalContent = finalContent.slice(0, MAX_CONTENT_LENGTH);
			}

			const preview = buildPreview(plainText);

			csvRows.push(`"${relPath}","${batch}","${companyName}","${studentName}",${plainText.length},${metadataSource}`);

			if (DRY_RUN) {
				continue;
			}

			await Experience.create({
				userId: legacyUser._id,
				studentName,
				companyName,
				batch,
				preview,
				content: finalContent,
				status: IMPORT_STATUS,
				importSourcePath: relPath
			});

			created++;
			if (created % 25 === 0) console.log(`Imported ${created} so far...`);
		} catch (err) {
			failed++;
			console.error(`[FAILED] ${relPath}: ${err.message}`);
			csvRows.push(`"${relPath}","","","",0,failed:${err.message.replace(/"/g, "'")}`);
		}
	}

	const reportPath = path.join(
		__dirname,
		`${DRY_RUN ? 'migration-dry-run-report' : 'migration-report'}-${Date.now()}.csv`
	);
	const csvContent = csvRows.join('\n');

	try {
		fs.writeFileSync(reportPath, csvContent);
		console.log(`Report written to: ${reportPath}`);
	} catch (err) {
		console.error(`Could not write report to ${reportPath}: ${err.message}`);
		const fallbackPath = path.join(require('os').tmpdir(), path.basename(reportPath));
		try {
			fs.writeFileSync(fallbackPath, csvContent);
			console.log(`Report written to fallback path instead: ${fallbackPath}`);
		} catch (err2) {
			console.error(`Fallback write also failed (${err2.message}). Printing report inline below:`);
			console.log(csvContent);
		}
	}

	console.log('--- Migration summary ---');
	console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no DB writes)' : 'LIVE'}`);
	console.log(`Candidates processed: ${candidateFiles.length}`);
	if (!DRY_RUN) console.log(`Created: ${created}`);
	console.log(`Skipped (duplicate): ${skippedDuplicate}`);
	console.log(`Skipped (empty/too short extraction): ${skippedEmpty}`);
	console.log(`Failed: ${failed}`);

	process.exit(0);
};

migrateLegacyExperiences().catch((err) => {
	console.error('Migration script crashed:', err);
	process.exit(1);
});