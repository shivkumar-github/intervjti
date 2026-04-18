import { useState, useEffect } from "react"
import RichTextEditor from "../components/RichTextEditor";
import { useAuth } from '../context/AuthContext';
import api from "../api/axios";

const MIN_CHARS = 50;

export default function UploadPage() {
  const { accessToken } = useAuth();

  const [studentName, setStudentName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [batch, setBatch] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  const charCount = content.replace(/<[^>]*>/g, '').length;
  const progress = Math.min(100, Math.round((charCount / MIN_CHARS) * 100));
  const isContentValid = charCount >= MIN_CHARS;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    if (!isContentValid) { setError(`Please write at least ${MIN_CHARS} characters in your experience.`); return; }
    setLoading(true);
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      await api.post('/api/experiences', { studentName, companyName, batch, content }, { headers });
      setMessage("Experience submitted for approval! We'll review it shortly.");
      setStudentName(''); setCompanyName(''); setBatch(''); setContent('');
    } catch {
      setError("Failed to upload your experience. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Your Name', value: studentName, set: setStudentName, placeholder: 'e.g. Rahul Sharma', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { label: 'Company Name', value: companyName, set: setCompanyName, placeholder: 'e.g. Google, Infosys, TCS', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg> },
    { label: 'Your Batch', value: batch, set: setBatch, placeholder: 'e.g. 2024, 2025', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

        .up-root {
          --ink: #0d0d12;
          --surface: #f5f4f0;
          --surface2: #eeecea;
          --accent: #e8521a;
          --accent2: #f7c948;
          --muted: #8a8a96;
          --border: rgba(0,0,0,0.09);
          --font-display: 'Syne', sans-serif;
          --font-body: 'Outfit', sans-serif;
          --radius: 14px;

          min-height: 100vh;
          background: var(--surface);
          font-family: var(--font-body);
          color: var(--ink);
        }

        /* ── HERO ── */
        .up-hero {
          background: var(--ink);
          position: relative; overflow: hidden;
          padding: 44px 24px 72px;
        }
        .up-hero::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 55% 80% at 5% 70%, rgba(232,82,26,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 92% 10%, rgba(247,201,72,0.08) 0%, transparent 55%);
          pointer-events: none;
        }
        .up-hero-noise {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4; pointer-events: none;
        }
        .up-hero-inner {
          position: relative;
          max-width: 860px; margin: 0 auto;
        }
        .up-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--accent); margin-bottom: 12px;
        }
        .up-eyebrow-line { width: 20px; height: 1.5px; background: var(--accent); border-radius: 2px; }
        .up-hero h1 {
          font-family: var(--font-display);
          font-size: clamp(28px, 5vw, 52px); font-weight: 800;
          color: #f5f4f0; letter-spacing: -0.03em; line-height: 1.05; margin-bottom: 10px;
        }
        .up-hero h1 em { font-style: normal; color: var(--accent); }
        .up-hero-sub { font-size: 14px; color: rgba(245,244,240,0.45); font-weight: 400; line-height: 1.6; max-width: 480px; }

        /* ── FORM WRAPPER ── */
        .up-body {
          max-width: 860px; margin: -28px auto 0;
          padding: 0 24px 80px;
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .up-body.visible { opacity: 1; transform: translateY(0); }

        /* ── CARDS ── */
        .up-card {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          padding: 28px 28px 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
          margin-bottom: 16px;
        }
        .up-card-title {
          font-family: var(--font-display);
          font-size: 13px; font-weight: 700; color: var(--muted);
          text-transform: uppercase; letter-spacing: 0.08em;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 20px; padding-bottom: 14px;
          border-bottom: 1px solid var(--border);
        }
        .up-card-title-icon {
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(232,82,26,0.10);
          display: flex; align-items: center; justify-content: center;
          color: var(--accent);
        }

        /* ── FIELDS GRID ── */
        .up-fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 600px) { .up-fields-grid { grid-template-columns: 1fr; } }
        .up-field-full { grid-column: 1 / -1; }

        .up-field { display: flex; flex-direction: column; gap: 6px; }
        .up-label { font-size: 11px; font-weight: 700; color: #5a5a66; letter-spacing: 0.06em; text-transform: uppercase; }
        .up-input-wrap { position: relative; }
        .up-input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; transition: color 0.2s ease; }
        .up-input-wrap:focus-within .up-input-icon { color: var(--accent); }
        .up-input {
          width: 100%; padding: 11px 14px 11px 40px;
          border: 1.5px solid var(--border); border-radius: 10px;
          font-family: var(--font-body); font-size: 14px; color: var(--ink);
          background: #fff; outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .up-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(232,82,26,0.10); }
        .up-input:disabled { opacity: 0.55; background: var(--surface2); cursor: not-allowed; }
        .up-input::placeholder { color: var(--muted); }

        /* ── EDITOR CARD ── */
        .up-editor-wrap {
          border-radius: 10px;
          overflow: hidden;
          border: 1.5px solid var(--border);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .up-editor-wrap:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(232,82,26,0.10);
        }

        /* ── PROGRESS BAR ── */
        .up-progress-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; margin-top: 10px;
        }
        .up-progress-bar-wrap {
          flex: 1; height: 4px; background: var(--surface2); border-radius: 4px; overflow: hidden;
        }
        .up-progress-bar {
          height: 100%; border-radius: 4px;
          transition: width 0.3s ease, background 0.3s ease;
        }
        .up-progress-label { font-size: 11px; color: var(--muted); white-space: nowrap; }
        .up-progress-label strong { font-weight: 600; }
        .up-progress-label.valid { color: #1a7a4a; }

        /* ── FEEDBACK ── */
        .up-feedback {
          display: flex; align-items: flex-start; gap: 9px;
          padding: 12px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 500; line-height: 1.5;
        }
        .up-feedback.success { background: rgba(26,122,74,0.08); border: 1px solid rgba(26,122,74,0.18); color: #1a7a4a; }
        .up-feedback.error { background: rgba(192,57,43,0.08); border: 1px solid rgba(192,57,43,0.18); color: #c0392b; }

        /* ── SUBMIT CARD ── */
        .up-submit-card {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          padding: 20px 28px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          display: flex; flex-direction: column; gap: 14px;
        }
        .up-submit-hint {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: var(--muted); font-weight: 400;
        }
        .up-submit-hint-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }

        .up-submit-btn {
          width: 100%; padding: 13px;
          font-family: var(--font-body); font-size: 14px; font-weight: 700;
          color: #fff; background: var(--ink);
          border: none; border-radius: 10px; cursor: pointer;
          transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          letter-spacing: 0.01em;
        }
        .up-submit-btn:hover:not(:disabled) {
          background: var(--accent);
          box-shadow: 0 6px 22px rgba(232,82,26,0.32);
          transform: translateY(-1px);
        }
        .up-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .up-submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .up-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: up-spin 0.7s linear infinite; }
        @keyframes up-spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .up-hero { padding: 36px 20px 64px; }
          .up-body { padding: 0 16px 60px; }
          .up-card { padding: 20px; }
          .up-submit-card { padding: 16px 20px; }
        }
      `}</style>

      <div className="up-root">
        {/* ── HERO ── */}
        <div className="up-hero">
          <div className="up-hero-noise" />
          <div className="up-hero-inner">
            <div className="up-eyebrow"><span className="up-eyebrow-line" />Share Your Story</div>
            <h1>Upload Your <em>Experience</em></h1>
            <p className="up-hero-sub">Help your fellow VJTIans by sharing honest insights from your placement journey. Every story counts.</p>
          </div>
        </div>

        {/* ── FORM BODY ── */}
        <div className={`up-body${visible ? ' visible' : ''}`}>
          <form onSubmit={handleSubmit}>

            {/* ── BASIC INFO CARD ── */}
            <div className="up-card">
              <div className="up-card-title">
                <div className="up-card-title-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                Basic Information
              </div>
              <div className="up-fields-grid">
                {fields.map(({ label, value, set, placeholder, icon }) => (
                  <div key={label} className="up-field">
                    <label className="up-label">{label}</label>
                    <div className="up-input-wrap">
                      <span className="up-input-icon">{icon}</span>
                      <input
                        className="up-input"
                        type="text"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── EXPERIENCE CARD ── */}
            <div className="up-card">
              <div className="up-card-title">
                <div className="up-card-title-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                Your Experience
              </div>

              <div className="up-editor-wrap">
                <RichTextEditor content={content} onChange={setContent} />
              </div>

              <div className="up-progress-row">
                <div className="up-progress-bar-wrap">
                  <div
                    className="up-progress-bar"
                    style={{
                      width: `${progress}%`,
                      background: isContentValid
                        ? '#1a7a4a'
                        : progress > 60 ? 'var(--accent2)' : 'var(--accent)',
                    }}
                  />
                </div>
                <span className={`up-progress-label${isContentValid ? ' valid' : ''}`}>
                  {isContentValid
                    ? <><strong>✓</strong> Minimum length reached</>
                    : <><strong>{charCount}</strong> / {MIN_CHARS} min characters</>
                  }
                </span>
              </div>
            </div>

            {/* ── SUBMIT CARD ── */}
            <div className="up-submit-card">
              {message && (
                <div className="up-feedback success">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}><polyline points="20 6 9 17 4 12"/></svg>
                  {message}
                </div>
              )}
              {error && (
                <div className="up-feedback error">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <div className="up-submit-hint">
                <span className="up-submit-hint-dot" />
                Your experience will be reviewed by an admin before it goes live.
              </div>

              <button
                className="up-submit-btn"
                type="submit"
                disabled={loading || !studentName || !companyName || !batch || !isContentValid}
              >
                {loading ? (
                  <><div className="up-spinner" />Submitting…</>
                ) : (
                  <>
                    Submit Experience
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}