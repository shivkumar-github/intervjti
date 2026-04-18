import ExperienceCard from "../components/ExperienceCard";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../api/axios";

function SkeletonCard() {
  return (
    <div className="mep-skeleton">
      <div className="mep-skel-img" />
      <div className="mep-skel-body">
        <div className="mep-skel-line w-60" />
        <div className="mep-skel-line w-40" />
        <div className="mep-skel-line w-full" />
        <div className="mep-skel-line w-80" />
      </div>
    </div>
  );
}

export default function MyExperiencesPage() {
  const { accessToken } = useAuth();
  const [userExps, setUserExps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (!accessToken) return;
    const getAllUserExps = async () => {
      try {
        const response = await api.get('/api/experiences/users/me/experiences', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setUserExps(response.data.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    getAllUserExps();
  }, [accessToken]);

  const approved = userExps.filter(e => e.status === 'approved').length;
  const pending  = userExps.filter(e => e.status === 'pending').length;
  const rejected = userExps.filter(e => e.status === 'rejected').length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

        .mep-root {
          --ink: #0d0d12;
          --surface: #f5f4f0;
          --surface2: #eeecea;
          --accent: #e8521a;
          --accent2: #f7c948;
          --muted: #8a8a96;
          --border: rgba(0,0,0,0.08);
          --font-display: 'Syne', sans-serif;
          --font-body: 'Outfit', sans-serif;
          --radius: 14px;

          min-height: 100vh;
          background: var(--surface);
          font-family: var(--font-body);
          color: var(--ink);
        }

        /* ── HERO ── */
        .mep-hero {
          background: var(--ink); position: relative; overflow: hidden;
          padding: 44px 24px 72px;
        }
        .mep-hero::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 55% 80% at 5% 70%, rgba(232,82,26,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 92% 10%, rgba(247,201,72,0.08) 0%, transparent 55%);
          pointer-events: none;
        }
        .mep-hero-noise {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4; pointer-events: none;
        }
        .mep-hero-inner {
          position: relative; max-width: 1100px; margin: 0 auto;
          display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; flex-wrap: wrap;
        }
        .mep-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--accent); margin-bottom: 12px;
        }
        .mep-eyebrow-line { width: 20px; height: 1.5px; background: var(--accent); border-radius: 2px; }
        .mep-hero h1 {
          font-family: var(--font-display);
          font-size: clamp(28px, 5vw, 52px); font-weight: 800;
          color: #f5f4f0; letter-spacing: -0.03em; line-height: 1.05; margin-bottom: 10px;
        }
        .mep-hero h1 em { font-style: normal; color: var(--accent); }
        .mep-hero-sub { font-size: 14px; color: rgba(245,244,240,0.45); font-weight: 400; line-height: 1.6; }
        .mep-hero-cta {
          flex-shrink: 0; display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 22px; border-radius: 10px;
          background: var(--accent); color: #fff;
          font-family: var(--font-body); font-size: 13px; font-weight: 700;
          text-decoration: none; letter-spacing: 0.01em;
          transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
          border: none; cursor: pointer;
        }
        .mep-hero-cta:hover { background: #d44716; box-shadow: 0 6px 20px rgba(232,82,26,0.35); transform: translateY(-1px); }

        /* ── STATS BAR ── */
        .mep-stats-wrap {
          max-width: 1100px; margin: -24px auto 0; padding: 0 24px;
          position: relative; z-index: 10;
        }
        .mep-stats {
          background: #fff; border-radius: var(--radius);
          box-shadow: 0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06);
          display: flex; flex-wrap: wrap; overflow: hidden;
        }
        .mep-stat {
          flex: 1; min-width: 100px; padding: 18px 24px;
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 2px;
        }
        .mep-stat:last-child { border-right: none; }
        .mep-stat-num {
          font-family: var(--font-display); font-size: 26px; font-weight: 800;
          color: var(--ink); letter-spacing: -0.04em; line-height: 1;
        }
        .mep-stat-label { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }

        /* ── BODY ── */
        .mep-body {
          max-width: 1100px; margin: 32px auto 0; padding: 0 24px 80px;
          opacity: 0; transform: translateY(12px);
          transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .mep-body.visible { opacity: 1; transform: translateY(0); }

        .mep-section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
        }
        .mep-section-title {
          font-family: var(--font-display); font-size: 20px; font-weight: 700;
          color: var(--ink); letter-spacing: -0.02em;
        }
        .mep-count { font-size: 13px; color: var(--muted); }
        .mep-count strong { color: var(--ink); font-weight: 600; }

        /* ── GRID ── */
        .mep-grid {
          display: grid; gap: 18px;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }
        .mep-card-wrap {
          opacity: 0; transform: translateY(20px);
          animation: mep-card-in 0.45s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes mep-card-in { to { opacity: 1; transform: translateY(0); } }

        /* ── EMPTY STATE ── */
        .mep-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 72px 24px; text-align: center;
          background: #fff; border: 1.5px solid var(--border);
          border-radius: var(--radius); gap: 12px;
        }
        .mep-empty-icon {
          width: 64px; height: 64px; background: var(--surface2);
          border-radius: 20px; display: flex; align-items: center;
          justify-content: center; font-size: 28px; margin-bottom: 4px;
        }
        .mep-empty h3 {
          font-family: var(--font-display); font-size: 20px; font-weight: 700;
          color: var(--ink); letter-spacing: -0.02em;
        }
        .mep-empty p { font-size: 13.5px; color: var(--muted); max-width: 300px; line-height: 1.6; }
        .mep-empty-cta {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 22px; border-radius: 10px;
          background: var(--ink); color: #fff;
          font-family: var(--font-body); font-size: 13px; font-weight: 600;
          text-decoration: none; margin-top: 4px;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .mep-empty-cta:hover { background: var(--accent); transform: translateY(-1px); }

        /* ── SKELETON ── */
        .mep-skeleton {
          background: #fff; border-radius: var(--radius); overflow: hidden;
          border: 1.5px solid var(--border);
        }
        .mep-skel-img {
          width: 100%; height: 160px;
          background: linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%);
          background-size: 200% 100%; animation: mep-shimmer 1.5s infinite;
        }
        .mep-skel-body { padding: 18px; display: flex; flex-direction: column; gap: 10px; }
        .mep-skel-line {
          height: 11px; border-radius: 6px;
          background: linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%);
          background-size: 200% 100%; animation: mep-shimmer 1.5s infinite;
        }
        .w-60 { width: 60%; } .w-40 { width: 40%; } .w-full { width: 100%; } .w-80 { width: 80%; }
        @keyframes mep-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* ── LOADING FULL PAGE ── */
        .mep-loading {
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 14px; background: var(--surface);
          font-family: var(--font-body);
        }
        .mep-loading-spinner {
          width: 36px; height: 36px;
          border: 3px solid var(--border); border-top-color: var(--accent);
          border-radius: 50%; animation: mep-spin 0.8s linear infinite;
        }
        @keyframes mep-spin { to { transform: rotate(360deg); } }
        .mep-loading-text { font-size: 14px; color: var(--muted); font-weight: 500; }

        @media (max-width: 640px) {
          .mep-hero { padding: 36px 20px 64px; }
          .mep-hero-cta { display: none; }
          .mep-stats { flex-direction: row; }
          .mep-stat { min-width: 80px; padding: 14px 16px; }
          .mep-stat-num { font-size: 22px; }
          .mep-body { padding: 0 16px 60px; }
          .mep-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {loading ? (
        <div className="mep-loading">
          <div className="mep-loading-spinner" />
          <span className="mep-loading-text">Loading your experiences…</span>
        </div>
      ) : (
        <div className="mep-root">
          {/* ── HERO ── */}
          <div className="mep-hero">
            <div className="mep-hero-noise" />
            <div className="mep-hero-inner">
              <div>
                <div className="mep-eyebrow"><span className="mep-eyebrow-line" />Student Portal</div>
                <h1>My <em>Experiences</em></h1>
                <p className="mep-hero-sub">Track your submissions and their approval status.</p>
              </div>
              <Link to="/uploadpage" className="mep-hero-cta">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Share New Experience
              </Link>
            </div>
          </div>

          {/* ── STATS ── */}
          {userExps.length > 0 && (
            <div className="mep-stats-wrap">
              <div className="mep-stats">
                <div className="mep-stat">
                  <div className="mep-stat-num">{userExps.length}</div>
                  <div className="mep-stat-label">Total</div>
                </div>
                <div className="mep-stat">
                  <div className="mep-stat-num" style={{ color: '#1a7a4a' }}>{approved}</div>
                  <div className="mep-stat-label">Approved</div>
                </div>
                <div className="mep-stat">
                  <div className="mep-stat-num" style={{ color: 'var(--accent)' }}>{pending}</div>
                  <div className="mep-stat-label">Pending</div>
                </div>
                <div className="mep-stat">
                  <div className="mep-stat-num" style={{ color: '#c0392b' }}>{rejected}</div>
                  <div className="mep-stat-label">Rejected</div>
                </div>
              </div>
            </div>
          )}

          {/* ── CONTENT ── */}
          <div className={`mep-body${visible ? ' visible' : ''}`}>
            {userExps.length === 0 ? (
              <div className="mep-empty">
                <div className="mep-empty-icon">📝</div>
                <h3>No experiences yet</h3>
                <p>You haven't shared any placement experiences. Be the first to help your juniors!</p>
                <Link to="/uploadpage" className="mep-empty-cta">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Share Your First Experience
                </Link>
              </div>
            ) : (
              <>
                <div className="mep-section-header">
                  <h2 className="mep-section-title">Your Submissions</h2>
                  <span className="mep-count"><strong>{userExps.length}</strong> total · <strong style={{ color: 'var(--accent)' }}>{pending}</strong> pending review</span>
                </div>
                <div className="mep-grid">
                  {userExps.map((exp, i) => (
                    <div
                      key={exp._id || exp.id}
                      className="mep-card-wrap"
                      style={{ animationDelay: `${Math.min(i * 55, 380)}ms` }}
                    >
                      <ExperienceCard {...exp} showAdminActions={false} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}