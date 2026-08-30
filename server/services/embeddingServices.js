const { GoogleGenAI } = require("@google/genai");
const striptags = require("striptags");

const ai = new GoogleGenAI({
	apiKey:process.env.GEMINI_API_KEY
});

function extractMetadataFromPath(filePath, filenameNoExt, folderHints) {
    // Your existing folder/filename heuristic logic should go here.

    // Example:
    // folder:
    // 2021 Experiences/Internship/DE Shaw/
    //
    // filename:
    // Ravi_Maurya_DEShaw

    return {
        companyName: extractedCompanyName || "Unknown",
        studentName: extractedStudentName || "Unknown"
    };
}

async function generateEmbedding(text) {
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text,
        config: {
            outputDimensionality: 768
        }
    });

    return response.embeddings[0].values;
}
// Builds the text used for embedding an Experience document.
// content is stored as sanitized HTML, so we strip tags to keep
// the embedded text clean plain text (matches the pattern already
// used for `preview` generation in experienceController.js).
function buildExperienceEmbeddingText(experience) {
	const plainContent = striptags(experience.content)
		.replace(/\s+/g, ' ')
		.trim();

	return `Company: ${experience.companyName}\nBatch: ${experience.batch}\n\nInterview Experience:\n${plainContent}`;
}

// Uses Gemini's text-generation model (not the embedding model) to
// infer companyName/studentName for a legacy file, using the actual
// document text as the primary signal — far more reliable than
// filename/folder string-matching alone. Used only by the one-time
// legacy migration script.

let companyName;
let studentName;

// First try to extract metadata locally
const localMetadata = extractMetadataFromPath(
    filePath,
    filenameNoExt,
    folderHints
);

companyName = localMetadata.companyName;
studentName = localMetadata.studentName;

// Only use Gemini if local extraction is uncertain
if (companyName === "Unknown" || studentName === "Unknown") {
    const geminiMetadata = await extractExperienceMetadata(
        filenameNoExt,
        folderHints,
        textExcerpt
    );

    companyName = geminiMetadata.companyName;
    studentName = geminiMetadata.studentName;
}

module.exports = {
	generateEmbedding,
	buildExperienceEmbeddingText,
	extractExperienceMetadata
};