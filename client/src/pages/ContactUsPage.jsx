import React, { useState, useEffect } from 'react'
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const { accessToken } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage('');
    setError('');
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      await api.post('/api/contact', { name, email, message }, { headers });
      setResponseMessage('Your message has been delivered successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setError('Something went wrong while sending your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValid = name.trim() && email.trim() && message.trim();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

        .cu-root {
          --ink: #0d0d12;
          --surface: #f5f4f0;
          --surface2: #eeecea;
          --accent: #e8521a;
          --accent2: #f7c948;
          --muted: #8a8a96;
          --border: rgba(0,0,0,0.09);
          --font-display: 'Syne', sans-serif;
          --font-body: 'Outfit', sans-serif;

          min-height: 100vh;
          display: flex;
          font-family: var(--font-body);
          background: var(--ink);
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .cu-left {
          display: none;
          flex: 1;
          position: relative;
          overflow: hidden;
          background: #111118;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
        }
        @media (min-width: 900px) { .cu-left { display: flex; } }

        .cu-left-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 70% 70% at 15% 65%, rgba(232,82,26,0.2) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 85% 15%, rgba(247,201,72,0.10) 0%, transparent 55%);
          pointer-events: none;
        }
        .cu-left-noise {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4; pointer-events: none;
        }
        .cu-orb {
          position: absolute; border-radius: 50%; pointer-events: none;
          width: 280px; height: 280px;
          background: rgba(232,82,26,0.07);
          top: 50%; left: 45%;
          transform: translate(-50%,-50%);
          filter: blur(60px);
        }

        .cu-left-top { position: relative; z-index: 1; }
        .cu-left-logo {
          display: inline-flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .cu-logo-mark {
          width: 36px; height: 36px;
          background: var(--accent);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-size: 14px; font-weight: 800; color: #fff;
          letter-spacing: -0.03em;
        }
        .cu-logo-text {
          font-family: var(--font-display);
          font-size: 18px; font-weight: 700;
          color: #f5f4f0; letter-spacing: -0.02em;
        }
        .cu-logo-text span { color: var(--accent); }

        .cu-left-bottom { position: relative; z-index: 1; }
        .cu-left-quote {
          font-family: var(--font-display);
          font-size: clamp(24px, 2.8vw, 36px);
          font-weight: 800;
          color: #f5f4f0;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 18px;
        }
        .cu-left-quote em { font-style: normal; color: var(--accent); }
        .cu-left-sub {
          font-size: 14px; color: rgba(245,244,240,0.42);
          font-weight: 400; line-height: 1.65; max-width: 340px;
        }

        /* Info tiles */
        .cu-info-tiles {
          display: flex; flex-direction: column; gap: 10px;
          margin-top: 32px;
        }
        .cu-info-tile {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 12px 14px;
        }
        .cu-info-tile-icon {
          width: 32px; height: 32px;
          background: rgba(232,82,26,0.15);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: var(--accent);
        }
        .cu-info-tile-text { font-size: 13px; color: rgba(245,244,240,0.55); font-weight: 400; }
        .cu-info-tile-label { font-size: 11px; color: rgba(245,244,240,0.25); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }

        /* ── RIGHT PANEL ── */
        .cu-right {
          flex: none; width: 100%;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 24px;
          background: var(--surface);
          opacity: 0; transform: translateX(20px);
          transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1);
        }
        @media (min-width: 900px) { .cu-right { width: 460px; flex-shrink: 0; } }
        .cu-right.visible { opacity: 1; transform: translateX(0); }

        .cu-card { width: 100%; max-width: 400px; }

        /* Header */
        .cu-header { margin-bottom: 28px; }
        .cu-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--accent); margin-bottom: 12px;
        }
        .cu-eyebrow-line { width: 20px; height: 1.5px; background: var(--accent); border-radius: 2px; }
        .cu-title {
          font-family: var(--font-display);
          font-size: 26px; font-weight: 800;
          color: var(--ink); letter-spacing: -0.03em;
          line-height: 1.15; margin-bottom: 8px;
        }
        .cu-subtitle { font-size: 13.5px; color: var(--muted); font-weight: 400; line-height: 1.5; }

        /* Mobile logo */
        .cu-mobile-logo {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 28px; text-decoration: none;
        }
        .cu-mobile-logo-mark {
          width: 32px; height: 32px; background: var(--accent);
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 13px; font-weight: 800; color: #fff;
        }
        .cu-mobile-logo-text {
          font-family: var(--font-display); font-size: 16px; font-weight: 700;
          color: var(--ink); letter-spacing: -0.02em;
        }
        .cu-mobile-logo-text span { color: var(--accent); }
        @media (min-width: 900px) { .cu-mobile-logo { display: none; } }

        /* Form */
        .cu-form { display: flex; flex-direction: column; gap: 14px; }
        .cu-field { display: flex; flex-direction: column; gap: 6px; }
        .cu-label {
          font-size: 11px; font-weight: 700; color: #5a5a66;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .cu-input-wrap { position: relative; }
        .cu-input-icon {
          position: absolute; left: 13px; top: 50%;
          transform: translateY(-50%);
          color: var(--muted); pointer-events: none;
          transition: color 0.2s ease;
        }
        .cu-input-wrap:focus-within .cu-input-icon { color: var(--accent); }
        .cu-input {
          width: 100%; padding: 11px 14px 11px 40px;
          border: 1.5px solid var(--border); border-radius: 10px;
          font-family: var(--font-body); font-size: 14px;
          color: var(--ink); background: #fff; outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .cu-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(232,82,26,0.10);
        }
        .cu-input::placeholder { color: var(--muted); }
        .cu-textarea {
          width: 100%; padding: 12px 14px;
          border: 1.5px solid var(--border); border-radius: 10px;
          font-family: var(--font-body); font-size: 14px;
          color: var(--ink); background: #fff; outline: none;
          resize: vertical; min-height: 130px; line-height: 1.6;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .cu-textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(232,82,26,0.10);
        }
        .cu-textarea::placeholder { color: var(--muted); }

        /* Char count */
        .cu-char-count {
          text-align: right; font-size: 11px; color: var(--muted);
          margin-top: -8px;
        }

        /* Submit */
        .cu-submit {
          width: 100%; padding: 12px;
          font-family: var(--font-body); font-size: 14px; font-weight: 600;
          color: #fff; background: var(--ink);
          border: none; border-radius: 10px; cursor: pointer;
          transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          letter-spacing: 0.01em;
        }
        .cu-submit:hover:not(:disabled) {
          background: var(--accent);
          box-shadow: 0 6px 20px rgba(232,82,26,0.3);
          transform: translateY(-1px);
        }
        .cu-submit:active:not(:disabled) { transform: translateY(0); }
        .cu-submit:disabled { opacity: 0.45; cursor: not-allowed; }
        .cu-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: cu-spin 0.7s linear infinite;
        }
        @keyframes cu-spin { to { transform: rotate(360deg); } }

        /* Feedback */
        .cu-feedback {
          display: flex; align-items: flex-start; gap: 9px;
          padding: 11px 13px; border-radius: 10px;
          font-size: 13px; font-weight: 500; line-height: 1.5;
        }
        .cu-feedback.success {
          background: rgba(26,122,74,0.08);
          border: 1px solid rgba(26,122,74,0.18);
          color: #1a7a4a;
        }
        .cu-feedback.error {
          background: rgba(192,57,43,0.08);
          border: 1px solid rgba(192,57,43,0.18);
          color: #c0392b;
        }
        .cu-feedback-icon { flex-shrink: 0; margin-top: 1px; }
      `}</style>

      <div className="cu-root">
        {/* ── LEFT PANEL ── */}
        <div className="cu-left">
          <div className="cu-left-bg" />
          <div className="cu-left-noise" />
          <div className="cu-orb" />

          <div className="cu-left-top">
            <a href="/" className="cu-left-logo">
              <div className="cu-logo-mark">IV</div>
              <span className="cu-logo-text">Inter<span>VJTI</span></span>
            </a>
          </div>

          <div className="cu-left-bottom">
            <p className="cu-left-quote">
              Got a question?<br />We'd love to <em>hear</em><br />from you.
            </p>
            <p className="cu-left-sub">
              Reach out with any queries, suggestions, or feedback — we typically respond within 24 hours.
            </p>

            <div className="cu-info-tiles">
              <div className="cu-info-tile">
                <div className="cu-info-tile-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <div className="cu-info-tile-label">Email</div>
                  <div className="cu-info-tile-text">admin@intervjti.ac.in</div>
                </div>
              </div>
              <div className="cu-info-tile">
                <div className="cu-info-tile-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <div className="cu-info-tile-label">Response time</div>
                  <div className="cu-info-tile-text">Within 24 hours</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className={`cu-right${visible ? ' visible' : ''}`}>
          <div className="cu-card">

            {/* Mobile logo */}
            <a href="/" className="cu-mobile-logo">
              <div className="cu-mobile-logo-mark">IV</div>
              <span className="cu-mobile-logo-text">Inter<span>VJTI</span></span>
            </a>

            <div className="cu-header">
              <div className="cu-eyebrow">
                <span className="cu-eyebrow-line" />
                Get in touch
              </div>
              <h1 className="cu-title">Send us a<br />message</h1>
              <p className="cu-subtitle">Fill in the form and we'll get back to you shortly.</p>
            </div>

            <form className="cu-form" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="cu-field">
                <label className="cu-label">Your Name</label>
                <div className="cu-input-wrap">
                  <span className="cu-input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    className="cu-input"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="cu-field">
                <label className="cu-label">Email Address</label>
                <div className="cu-input-wrap">
                  <span className="cu-input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    className="cu-input"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="cu-field">
                <label className="cu-label">Message</label>
                <textarea
                  className="cu-textarea"
                  placeholder="Write your message here…"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                  rows={5}
                />
                <div className="cu-char-count">{message.length} characters</div>
              </div>

              {/* Feedback */}
              {responseMessage && (
                <div className="cu-feedback success">
                  <span className="cu-feedback-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  {responseMessage}
                </div>
              )}
              {error && (
                <div className="cu-feedback error">
                  <span className="cu-feedback-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </span>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button className="cu-submit" type="submit" disabled={loading || !isValid}>
                {loading ? (
                  <><div className="cu-spinner" /> Sending…</>
                ) : (
                  <>
                    Send Message
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactUs;