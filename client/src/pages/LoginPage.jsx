import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setAccessToken, setIsLoggedIn, setRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/auth/login', { email, password }, { withCredentials: true });
      setAccessToken(response.data.accessToken);
      setIsLoggedIn(true);
      const decoded = jwtDecode(response.data.accessToken);
      setRole(decoded.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

        .lp-root {
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
        .lp-left {
          display: none;
          flex: 1;
          position: relative;
          overflow: hidden;
          background: #111118;
        }
        @media (min-width: 900px) { .lp-left { display: flex; flex-direction: column; justify-content: space-between; padding: 48px; } }

        .lp-left-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 70% at 20% 60%, rgba(232,82,26,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 80% 20%, rgba(247,201,72,0.10) 0%, transparent 55%);
          pointer-events: none;
        }
        .lp-left-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.5;
          pointer-events: none;
        }

        .lp-left-top { position: relative; z-index: 1; }
        .lp-left-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .lp-left-logo-mark {
          width: 36px; height: 36px;
          background: var(--accent);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-size: 14px; font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
        }
        .lp-left-logo-text {
          font-family: var(--font-display);
          font-size: 18px; font-weight: 700;
          color: #f5f4f0;
          letter-spacing: -0.02em;
        }
        .lp-left-logo-text span { color: var(--accent); }

        .lp-left-bottom { position: relative; z-index: 1; }
        .lp-left-quote {
          font-family: var(--font-display);
          font-size: clamp(26px, 3vw, 38px);
          font-weight: 800;
          color: #f5f4f0;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
        }
        .lp-left-quote em { font-style: normal; color: var(--accent); }
        .lp-left-sub {
          font-size: 14px;
          color: rgba(245,244,240,0.45);
          font-weight: 400;
          line-height: 1.6;
          max-width: 340px;
        }

        /* Decorative orbs */
        .lp-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .lp-orb1 {
          width: 300px; height: 300px;
          background: rgba(232,82,26,0.08);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          filter: blur(60px);
        }
        .lp-orb2 {
          width: 180px; height: 180px;
          background: rgba(247,201,72,0.07);
          top: 20%; right: 10%;
          filter: blur(40px);
        }

        /* ── RIGHT PANEL ── */
        .lp-right {
          flex: none;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background: var(--surface);
          opacity: 0;
          transform: translateX(20px);
          transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1);
        }
        @media (min-width: 900px) { .lp-right { width: 440px; flex-shrink: 0; } }
        .lp-right.visible { opacity: 1; transform: translateX(0); }

        .lp-card {
          width: 100%;
          max-width: 380px;
        }

        /* Header */
        .lp-header { margin-bottom: 32px; }
        .lp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 12px;
        }
        .lp-eyebrow-line { width: 20px; height: 1.5px; background: var(--accent); border-radius: 2px; }
        .lp-title {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 8px;
        }
        .lp-subtitle { font-size: 13.5px; color: var(--muted); font-weight: 400; line-height: 1.5; }

        /* Form */
        .lp-form { display: flex; flex-direction: column; gap: 14px; }

        .lp-field { display: flex; flex-direction: column; gap: 6px; }
        .lp-label {
          font-size: 12px;
          font-weight: 600;
          color: #4a4a56;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .lp-input-wrap { position: relative; }
        .lp-input-icon {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
          pointer-events: none;
          transition: color 0.2s ease;
        }
        .lp-input-wrap:focus-within .lp-input-icon { color: var(--accent); }
        .lp-input {
          width: 100%;
          padding: 11px 14px 11px 40px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--ink);
          background: #fff;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .lp-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(232,82,26,0.10);
        }
        .lp-input:disabled { opacity: 0.6; cursor: not-allowed; background: var(--surface2); }
        .lp-input::placeholder { color: var(--muted); }

        /* Password toggle */
        .lp-pw-toggle {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--muted);
          padding: 4px;
          border-radius: 5px;
          transition: color 0.15s ease;
          display: flex; align-items: center;
        }
        .lp-pw-toggle:hover { color: var(--ink); }

        /* Submit */
        .lp-submit {
          margin-top: 4px;
          width: 100%;
          padding: 12px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: var(--ink);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          letter-spacing: 0.01em;
        }
        .lp-submit:hover:not(:disabled) {
          background: var(--accent);
          box-shadow: 0 6px 20px rgba(232,82,26,0.3);
          transform: translateY(-1px);
        }
        .lp-submit:active:not(:disabled) { transform: translateY(0); }
        .lp-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .lp-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lp-spin 0.7s linear infinite;
        }
        @keyframes lp-spin { to { transform: rotate(360deg); } }

        /* Error */
        .lp-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(192,57,43,0.08);
          border: 1px solid rgba(192,57,43,0.18);
          border-radius: 9px;
          font-size: 13px;
          color: #c0392b;
          font-weight: 500;
        }

        /* Divider */
        .lp-or {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
          font-size: 12px;
          color: var(--muted);
          font-weight: 400;
        }
        .lp-or::before, .lp-or::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        /* Footer link */
        .lp-footer-link {
          text-align: center;
          font-size: 13px;
          color: var(--muted);
        }
        .lp-footer-link a {
          color: var(--accent);
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s ease;
        }
        .lp-footer-link a:hover { opacity: 0.8; }

        /* Mobile logo */
        .lp-mobile-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
          text-decoration: none;
        }
        .lp-mobile-logo-mark {
          width: 32px; height: 32px;
          background: var(--accent);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-size: 13px; font-weight: 800;
          color: #fff;
        }
        .lp-mobile-logo-text {
          font-family: var(--font-display);
          font-size: 16px; font-weight: 700;
          color: var(--ink); letter-spacing: -0.02em;
        }
        .lp-mobile-logo-text span { color: var(--accent); }
        @media (min-width: 900px) { .lp-mobile-logo { display: none; } }
      `}</style>

      <div className="lp-root">
        {/* ── LEFT DECORATIVE PANEL ── */}
        <div className="lp-left">
          <div className="lp-left-bg" />
          <div className="lp-left-noise" />
          <div className="lp-orb lp-orb1" />
          <div className="lp-orb lp-orb2" />

          <div className="lp-left-top">
            <Link to="/" className="lp-left-logo">
              <div className="lp-left-logo-mark">IV</div>
              <span className="lp-left-logo-text">Inter<span>VJTI</span></span>
            </Link>
          </div>

          <div className="lp-left-bottom">
            <p className="lp-left-quote">
              Real stories from<br /><em>real students</em><br />who made it.
            </p>
            <p className="lp-left-sub">
              Access hundreds of placement experiences shared by VJTI alumni — interviews, tips, and honest takes.
            </p>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className={`lp-right${visible ? " visible" : ""}`}>
          <div className="lp-card">

            {/* Mobile logo */}
            <Link to="/" className="lp-mobile-logo">
              <div className="lp-mobile-logo-mark">IV</div>
              <span className="lp-mobile-logo-text">Inter<span>VJTI</span></span>
            </Link>

            <div className="lp-header">
              <div className="lp-eyebrow">
                <span className="lp-eyebrow-line" />
                Welcome back
              </div>
              <h1 className="lp-title">Sign in to<br />your account</h1>
              <p className="lp-subtitle">Enter your credentials to continue</p>
            </div>

            <form className="lp-form" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="lp-field">
                <label className="lp-label">Email</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    className="lp-input"
                    type="email"
                    placeholder="you@vjti.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="lp-field">
                <label className="lp-label">Password</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    className="lp-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    className="lp-pw-toggle"
                    onClick={() => setShowPassword(p => !p)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="lp-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                className="lp-submit"
                type="submit"
                disabled={!email || !password || loading}
              >
                {loading ? (
                  <><div className="lp-spinner" /> Signing you in…</>
                ) : (
                  <>
                    Continue
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>

              <div className="lp-or">or</div>

              <p className="lp-footer-link">
                Don't have an account? <Link to="/signup">Sign up</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}