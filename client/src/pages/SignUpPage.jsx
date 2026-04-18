import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios';

const STEPS = { EMAIL: 0, OTP: 1, PASSWORD: 2 };

function StepIndicator({ current }) {
  const steps = ['Email', 'Verify', 'Password'];
  return (
    <div className="su-steps">
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div className={`su-step${i < current ? ' done' : i === current ? ' active' : ''}`}>
            <div className="su-step-circle">
              {i < current ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className="su-step-label">{label}</span>
          </div>
          {i < steps.length - 1 && <div className={`su-step-line${i < current ? ' done' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function SignUpPage() {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [visible, setVisible] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const navigate = useNavigate();

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (!confirmPassword || !password || password === confirmPassword) setPasswordMatch('');
    else setPasswordMatch('Passwords do not match.');
  }, [password, confirmPassword]);

  // Reset OTP step if email changes
  useEffect(() => {
    if (step > STEPS.EMAIL) { setStep(STEPS.EMAIL); setOtp(''); }
  }, [email]);

  const sendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSendingOtp(true);
    try {
      await api.post('/api/auth/send-otp', { email });
      setStep(STEPS.OTP);
    } catch {
      setError('Failed to send OTP. Please check your email and try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setVerifyingOtp(true);
    try {
      await api.post('/api/auth/verify-otp', { email, otp });
      setStep(STEPS.PASSWORD);
    } catch {
      setError('Invalid OTP. Please check and try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordMatch) return;
    setError('');
    setCreatingAccount(true);
    try {
      await api.post('/api/auth/set-password', { email, password });
      setSuccess(true);
      setTimeout(() => navigate('/loginpage'), 1800);
    } catch {
      setError('Failed to create account. Please try again.');
    } finally {
      setCreatingAccount(false);
    }
  };

  const stepTitles = ['Create your account', 'Verify your email', 'Set your password'];
  const stepSubs = [
    'Enter your college email to get started.',
    `We sent a 6-digit code to ${email}`,
    'Choose a strong password to secure your account.',
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

        .su-root {
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
        .su-left {
          display: none;
          flex: 1; position: relative; overflow: hidden;
          background: #111118;
          flex-direction: column; justify-content: space-between; padding: 48px;
        }
        @media (min-width: 900px) { .su-left { display: flex; } }

        .su-left-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 65% 70% at 10% 70%, rgba(232,82,26,0.20) 0%, transparent 60%),
            radial-gradient(ellipse 45% 45% at 88% 12%, rgba(247,201,72,0.10) 0%, transparent 55%);
          pointer-events: none;
        }
        .su-left-noise {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4; pointer-events: none;
        }
        .su-orb {
          position: absolute; border-radius: 50%; pointer-events: none;
          width: 300px; height: 300px;
          background: rgba(232,82,26,0.07);
          top: 50%; left: 48%; transform: translate(-50%,-50%);
          filter: blur(70px);
        }

        .su-left-top { position: relative; z-index: 1; }
        .su-left-logo { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
        .su-logo-mark {
          width: 36px; height: 36px; background: var(--accent); border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 14px; font-weight: 800; color: #fff; letter-spacing: -0.03em;
        }
        .su-logo-text { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: #f5f4f0; letter-spacing: -0.02em; }
        .su-logo-text span { color: var(--accent); }

        .su-left-bottom { position: relative; z-index: 1; }
        .su-left-quote {
          font-family: var(--font-display);
          font-size: clamp(24px, 2.8vw, 36px); font-weight: 800;
          color: #f5f4f0; line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 18px;
        }
        .su-left-quote em { font-style: normal; color: var(--accent); }
        .su-left-sub { font-size: 14px; color: rgba(245,244,240,0.42); font-weight: 400; line-height: 1.65; max-width: 340px; }

        /* Perks list */
        .su-perks { display: flex; flex-direction: column; gap: 10px; margin-top: 28px; }
        .su-perk { display: flex; align-items: center; gap: 10px; font-size: 13px; color: rgba(245,244,240,0.5); }
        .su-perk-check {
          width: 20px; height: 20px; border-radius: 6px;
          background: rgba(232,82,26,0.15); border: 1px solid rgba(232,82,26,0.25);
          display: flex; align-items: center; justify-content: center;
          color: var(--accent); flex-shrink: 0;
        }

        /* ── RIGHT PANEL ── */
        .su-right {
          flex: none; width: 100%;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 24px;
          background: var(--surface);
          opacity: 0; transform: translateX(20px);
          transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1);
        }
        @media (min-width: 900px) { .su-right { width: 460px; flex-shrink: 0; } }
        .su-right.visible { opacity: 1; transform: translateX(0); }

        .su-card { width: 100%; max-width: 390px; }

        /* Mobile logo */
        .su-mobile-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; text-decoration: none; }
        .su-mobile-logo-mark {
          width: 32px; height: 32px; background: var(--accent); border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 13px; font-weight: 800; color: #fff;
        }
        .su-mobile-logo-text { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--ink); letter-spacing: -0.02em; }
        .su-mobile-logo-text span { color: var(--accent); }
        @media (min-width: 900px) { .su-mobile-logo { display: none; } }

        /* ── STEP INDICATOR ── */
        .su-steps {
          display: flex; align-items: center; gap: 0;
          margin-bottom: 28px;
        }
        .su-step { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
        .su-step-circle {
          width: 26px; height: 26px; border-radius: 50%;
          border: 2px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: var(--muted);
          background: #fff;
          transition: all 0.25s ease;
        }
        .su-step.active .su-step-circle { border-color: var(--accent); color: var(--accent); background: rgba(232,82,26,0.06); }
        .su-step.done .su-step-circle { border-color: #1a7a4a; background: rgba(26,122,74,0.10); color: #1a7a4a; }
        .su-step-label { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; transition: color 0.2s ease; }
        .su-step.active .su-step-label { color: var(--accent); }
        .su-step.done .su-step-label { color: #1a7a4a; }
        .su-step-line { flex: 1; height: 1.5px; background: var(--border); margin: 0 8px; min-width: 20px; transition: background 0.3s ease; }
        .su-step-line.done { background: #1a7a4a; }

        /* Header */
        .su-header { margin-bottom: 24px; }
        .su-eyebrow { display: inline-flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; }
        .su-eyebrow-line { width: 20px; height: 1.5px; background: var(--accent); border-radius: 2px; }
        .su-title { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--ink); letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 6px; }
        .su-subtitle { font-size: 13px; color: var(--muted); font-weight: 400; line-height: 1.5; }
        .su-subtitle strong { color: var(--ink); font-weight: 600; }

        /* Form */
        .su-form { display: flex; flex-direction: column; gap: 13px; }
        .su-field { display: flex; flex-direction: column; gap: 5px; }
        .su-label { font-size: 11px; font-weight: 700; color: #5a5a66; letter-spacing: 0.06em; text-transform: uppercase; }
        .su-input-wrap { position: relative; }
        .su-input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; transition: color 0.2s ease; }
        .su-input-wrap:focus-within .su-input-icon { color: var(--accent); }
        .su-input {
          width: 100%; padding: 11px 14px 11px 40px;
          border: 1.5px solid var(--border); border-radius: 10px;
          font-family: var(--font-body); font-size: 14px; color: var(--ink);
          background: #fff; outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .su-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(232,82,26,0.10); }
        .su-input:disabled { opacity: 0.55; cursor: not-allowed; background: var(--surface2); }
        .su-input::placeholder { color: var(--muted); }
        .su-pw-toggle {
          position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: var(--muted);
          padding: 4px; border-radius: 5px; transition: color 0.15s ease;
          display: flex; align-items: center;
        }
        .su-pw-toggle:hover { color: var(--ink); }

        /* OTP input — large digits feel */
        .su-otp-input {
          width: 100%; padding: 13px 14px 13px 40px;
          border: 1.5px solid var(--border); border-radius: 10px;
          font-family: var(--font-display); font-size: 20px; font-weight: 700;
          color: var(--ink); letter-spacing: 0.15em; text-align: center;
          background: #fff; outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .su-otp-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(232,82,26,0.10); }
        .su-otp-input::placeholder { font-size: 14px; letter-spacing: 0; font-family: var(--font-body); font-weight: 400; color: var(--muted); }

        /* Resend link */
        .su-resend {
          font-size: 12px; color: var(--muted); text-align: center;
        }
        .su-resend button {
          background: none; border: none; color: var(--accent); font-weight: 600;
          font-size: 12px; cursor: pointer; font-family: var(--font-body);
          padding: 0; transition: opacity 0.15s ease;
        }
        .su-resend button:hover { opacity: 0.75; }

        /* Password strength */
        .su-pw-strength { display: flex; gap: 4px; margin-top: -4px; }
        .su-pw-bar { flex: 1; height: 3px; border-radius: 3px; background: var(--border); transition: background 0.3s ease; }

        /* Submit */
        .su-submit {
          width: 100%; padding: 12px;
          font-family: var(--font-body); font-size: 14px; font-weight: 600;
          color: #fff; background: var(--ink);
          border: none; border-radius: 10px; cursor: pointer;
          transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          letter-spacing: 0.01em; margin-top: 2px;
        }
        .su-submit:hover:not(:disabled) { background: var(--accent); box-shadow: 0 6px 20px rgba(232,82,26,0.30); transform: translateY(-1px); }
        .su-submit:active:not(:disabled) { transform: translateY(0); }
        .su-submit:disabled { opacity: 0.45; cursor: not-allowed; }
        .su-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: su-spin 0.7s linear infinite; }
        @keyframes su-spin { to { transform: rotate(360deg); } }

        /* Feedback */
        .su-feedback {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 10px 12px; border-radius: 9px;
          font-size: 13px; font-weight: 500; line-height: 1.5;
        }
        .su-feedback.success { background: rgba(26,122,74,0.08); border: 1px solid rgba(26,122,74,0.18); color: #1a7a4a; }
        .su-feedback.error { background: rgba(192,57,43,0.08); border: 1px solid rgba(192,57,43,0.18); color: #c0392b; }
        .su-feedback-icon { flex-shrink: 0; margin-top: 1px; }

        .su-pw-err { font-size: 12px; color: #c0392b; font-weight: 500; display: flex; align-items: center; gap: 5px; }

        /* Footer */
        .su-footer-link { text-align: center; font-size: 13px; color: var(--muted); margin-top: 4px; }
        .su-footer-link a { color: var(--accent); font-weight: 600; text-decoration: none; transition: opacity 0.15s ease; }
        .su-footer-link a:hover { opacity: 0.8; }
      `}</style>

      <div className="su-root">
        {/* ── LEFT PANEL ── */}
        <div className="su-left">
          <div className="su-left-bg" /><div className="su-left-noise" /><div className="su-orb" />
          <div className="su-left-top">
            <Link to="/" className="su-left-logo">
              <div className="su-logo-mark">IV</div>
              <span className="su-logo-text">Inter<span>VJTI</span></span>
            </Link>
          </div>
          <div className="su-left-bottom">
            <p className="su-left-quote">Join the<br /><em>community</em><br />of achievers.</p>
            <p className="su-left-sub">Share your placement journey and help future VJTIans navigate theirs.</p>
            <div className="su-perks">
              {['Access all student experiences', 'Share your own interview story', 'Ask questions in real-time discussion', 'Help your juniors succeed'].map(p => (
                <div key={p} className="su-perk">
                  <div className="su-perk-check">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className={`su-right${visible ? ' visible' : ''}`}>
          <div className="su-card">

            {/* Mobile logo */}
            <Link to="/" className="su-mobile-logo">
              <div className="su-mobile-logo-mark">IV</div>
              <span className="su-mobile-logo-text">Inter<span>VJTI</span></span>
            </Link>

            <StepIndicator current={step} />

            <div className="su-header">
              <div className="su-eyebrow"><span className="su-eyebrow-line" />Step {step + 1} of 3</div>
              <h1 className="su-title">{stepTitles[step]}</h1>
              <p className="su-subtitle">{step === 1 ? <><strong>{email}</strong> — check your inbox.</> : stepSubs[step]}</p>
            </div>

            <form className="su-form" onSubmit={(e) => e.preventDefault()}>

              {/* ── STEP 0: EMAIL ── */}
              {step === STEPS.EMAIL && (
                <>
                  <div className="su-field">
                    <label className="su-label">College Email</label>
                    <div className="su-input-wrap">
                      <span className="su-input-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </span>
                      <input className="su-input" type="email" placeholder="you@vjti.ac.in" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required disabled={success} />
                    </div>
                  </div>
                  {error && <div className="su-feedback error"><span className="su-feedback-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></span>{error}</div>}
                  <button className="su-submit" onClick={sendOtp} disabled={sendingOtp || !email || success}>
                    {sendingOtp ? <><div className="su-spinner" />Sending OTP…</> : <>Send OTP <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></>}
                  </button>
                  <p className="su-footer-link">Already have an account? <Link to="/loginpage">Log in</Link></p>
                </>
              )}

              {/* ── STEP 1: OTP ── */}
              {step === STEPS.OTP && (
                <>
                  <div className="su-field">
                    <label className="su-label">6-Digit Code</label>
                    <input className="su-otp-input" type="text" inputMode="numeric" maxLength={6} placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} autoFocus required disabled={success} />
                  </div>
                  {error && <div className="su-feedback error"><span className="su-feedback-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></span>{error}</div>}
                  <button className="su-submit" onClick={verifyOtp} disabled={!otp || otp.length < 6 || verifyingOtp || success}>
                    {verifyingOtp ? <><div className="su-spinner" />Verifying…</> : <>Verify Code <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></>}
                  </button>
                  <p className="su-resend">Didn't get it? <button onClick={sendOtp} disabled={sendingOtp}>{sendingOtp ? 'Resending…' : 'Resend OTP'}</button></p>
                  <p className="su-footer-link"><button style={{ background:'none', border:'none', color:'var(--muted)', fontSize:12, cursor:'pointer', fontFamily:"var(--font-body)" }} onClick={() => { setStep(STEPS.EMAIL); setError(''); setOtp(''); }}>← Change email</button></p>
                </>
              )}

              {/* ── STEP 2: PASSWORD ── */}
              {step === STEPS.PASSWORD && (
                <>
                  <div className="su-field">
                    <label className="su-label">Password</label>
                    <div className="su-input-wrap">
                      <span className="su-input-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                      <input className="su-input" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required disabled={success} style={{ paddingRight: 40 }} />
                      <button type="button" className="su-pw-toggle" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                        {showPassword
                          ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                    {/* Strength bars */}
                    {password && (
                      <div className="su-pw-strength">
                        {[1,2,3,4].map(n => {
                          const str = Math.min(4, [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length);
                          const colors = ['#c0392b','#e8521a','#f7c948','#1a7a4a'];
                          return <div key={n} className="su-pw-bar" style={{ background: n <= str ? colors[str-1] : undefined }} />;
                        })}
                      </div>
                    )}
                  </div>

                  <div className="su-field">
                    <label className="su-label">Confirm Password</label>
                    <div className="su-input-wrap">
                      <span className="su-input-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                      <input className="su-input" type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={success} style={{ paddingRight: 40 }} />
                      <button type="button" className="su-pw-toggle" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                        {showConfirm
                          ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                    {passwordMatch && (
                      <p className="su-pw-err">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {passwordMatch}
                      </p>
                    )}
                  </div>

                  {error && <div className="su-feedback error"><span className="su-feedback-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></span>{error}</div>}

                  {success && (
                    <div className="su-feedback success">
                      <span className="su-feedback-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                      Account created! Redirecting to login…
                    </div>
                  )}

                  <button className="su-submit" onClick={handleSubmit} disabled={creatingAccount || !!passwordMatch || !password || !confirmPassword || success}>
                    {creatingAccount ? <><div className="su-spinner" />Creating account…</> : <>Create Account <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>}
                  </button>
                  <p className="su-footer-link">Already have an account? <Link to="/loginpage">Log in</Link></p>
                </>
              )}

            </form>
          </div>
        </div>
      </div>
    </>
  );
}