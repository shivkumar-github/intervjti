import ExperienceCard from "../components/ExperienceCard";
import ContactCard from "../components/ContactCard";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="adp-stat">
      <div className="adp-stat-num" style={accent ? { color: 'var(--accent)' } : {}}>{value}</div>
      <div className="adp-stat-label">{label}</div>
      {sub && <div className="adp-stat-sub">{sub}</div>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="adp-skeleton">
      <div className="adp-skel-img" />
      <div className="adp-skel-body">
        <div className="adp-skel-line w-60" />
        <div className="adp-skel-line w-40" />
        <div className="adp-skel-line w-full" />
        <div className="adp-skel-line w-80" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { accessToken } = useAuth();
  const [allExps, setAllExps] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('experiences');
  const [visible, setVisible] = useState(false);

  const getAllExps = async () => {
    try {
      const response = await api.get('/api/experiences/adminExperiences', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setAllExps(response.data.data);
    } catch {
      console.error('Error fetching experiences');
    }
  };

  const getContactMessages = async () => {
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      const response = await api.get('/api/contact', { headers });
      setContactMessages(response.data.data);
    } catch {
      console.error('Error fetching contacts');
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    Promise.all([getAllExps(), getContactMessages()]).finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Derived stats
  const pending  = allExps.filter(e => e.status === 'pending').length;
  const approved = allExps.filter(e => e.status === 'approved').length;
  const rejected = allExps.filter(e => e.status === 'rejected').length;
  const unread   = contactMessages.filter(m => !m.isRead).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

        .adp-root {
          --ink: #0d0d12;
          --surface: #f5f4f0;
          --surface2: #eeecea;
          --accent: #e8521a;
          --accent2: #f7c948;
          --muted: #8a8a96;
          --border: rgba(0,0,0,0.08);
          --font-display: 'Syne', sans-serif;
          --font-body: 'Outfit', sans-serif;

          min-height: 100vh;
          background: var(--surface);
          font-family: var(--font-body);
          color: var(--ink);
        }

        /* ── HERO HEADER ── */
        .adp-hero {
          position: relative;
          background: var(--ink);
          overflow: hidden;
          padding: 48px 24px 72px;
        }
        .adp-hero::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 80% at 5% 60%, rgba(232,82,26,0.16) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 90% 10%, rgba(247,201,72,0.09) 0%, transparent 55%);
          pointer-events: none;
        }
        .adp-hero-noise {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4; pointer-events: none;
        }
        .adp-hero-inner {
          position: relative;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
        }
        .adp-hero-eyebrow {
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
        .adp-hero-eyebrow-line { width: 20px; height: 1.5px; background: var(--accent); border-radius: 2px; }
        .adp-hero h1 {
          font-family: var(--font-display);
          font-size: clamp(28px, 5vw, 52px);
          font-weight: 800;
          color: #f5f4f0;
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin-bottom: 10px;
        }
        .adp-hero h1 em { font-style: normal; color: var(--accent); }
        .adp-hero-sub {
          font-size: 14px;
          color: rgba(245,244,240,0.45);
          font-weight: 400;
          line-height: 1.6;
        }

        /* ── STATS ROW ── */
        .adp-stats-wrap {
          max-width: 1100px;
          margin: -28px auto 0;
          padding: 0 24px;
          position: relative;
          z-index: 10;
        }
        .adp-stats {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06);
          display: flex;
          align-items: stretch;
          flex-wrap: wrap;
          overflow: hidden;
        }
        .adp-stat {
          flex: 1;
          min-width: 120px;
          padding: 20px 24px;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .adp-stat:last-child { border-right: none; }
        .adp-stat-num {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .adp-stat-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .adp-stat-sub { font-size: 11px; color: #bbb; }

        /* ── TABS ── */
        .adp-tabs-wrap {
          max-width: 1100px;
          margin: 36px auto 0;
          padding: 0 24px;
        }
        .adp-tabs {
          display: inline-flex;
          background: var(--surface2);
          border-radius: 10px;
          padding: 4px;
          gap: 2px;
        }
        .adp-tab {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 18px;
          border-radius: 8px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .adp-tab:hover { color: var(--ink); }
        .adp-tab.active {
          background: #fff;
          color: var(--ink);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .adp-tab-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          background: var(--border);
          color: var(--muted);
        }
        .adp-tab.active .adp-tab-badge {
          background: var(--accent);
          color: #fff;
        }

        /* ── CONTENT ── */
        .adp-content {
          max-width: 1100px;
          margin: 28px auto 0;
          padding: 0 24px 80px;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .adp-content.visible { opacity: 1; transform: translateY(0); }

        .adp-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .adp-section-title {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.02em;
        }
        .adp-result-count {
          font-size: 13px;
          color: var(--muted);
        }
        .adp-result-count strong { color: var(--ink); font-weight: 600; }

        /* Grid */
        .adp-grid {
          display: grid;
          gap: 18px;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }
        .adp-card-wrap {
          opacity: 0;
          transform: translateY(20px);
          animation: adp-card-in 0.45s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes adp-card-in { to { opacity: 1; transform: translateY(0); } }

        /* Contact list */
        .adp-contact-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 720px;
        }

        /* Empty state */
        .adp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 24px;
          text-align: center;
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 14px;
          gap: 10px;
        }
        .adp-empty-icon {
          width: 56px; height: 56px;
          background: var(--surface2);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
          margin-bottom: 4px;
        }
        .adp-empty h3 {
          font-family: var(--font-display);
          font-size: 18px; font-weight: 700;
          color: var(--ink);
        }
        .adp-empty p { font-size: 13px; color: var(--muted); max-width: 280px; line-height: 1.6; }

        /* Skeleton */
        .adp-skeleton {
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
          border: 1.5px solid var(--border);
        }
        .adp-skel-img {
          width: 100%; height: 160px;
          background: linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%);
          background-size: 200% 100%;
          animation: adp-shimmer 1.5s infinite;
        }
        .adp-skel-body { padding: 18px; display: flex; flex-direction: column; gap: 10px; }
        .adp-skel-line {
          height: 11px; border-radius: 6px;
          background: linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%);
          background-size: 200% 100%;
          animation: adp-shimmer 1.5s infinite;
        }
        .w-60 { width: 60%; } .w-40 { width: 40%; } .w-full { width: 100%; } .w-80 { width: 80%; }
        @keyframes adp-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Loading full page */
        .adp-loading {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 14px;
          background: var(--surface);
          font-family: var(--font-body);
        }
        .adp-loading-spinner {
          width: 36px; height: 36px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: adp-spin 0.8s linear infinite;
        }
        @keyframes adp-spin { to { transform: rotate(360deg); } }
        .adp-loading-text { font-size: 14px; color: var(--muted); font-weight: 500; }

        @media (max-width: 640px) {
          .adp-hero { padding: 40px 20px 64px; }
          .adp-stats { flex-direction: row; }
          .adp-stat { min-width: 80px; padding: 14px 16px; }
          .adp-stat-num { font-size: 22px; }
          .adp-content { padding: 0 16px 60px; }
          .adp-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {loading ? (
        <div className="adp-loading" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <div className="adp-loading-spinner" />
          <span className="adp-loading-text">Loading dashboard…</span>
        </div>
      ) : (
        <div className="adp-root">
          {/* ── HERO ── */}
          <div className="adp-hero">
            <div className="adp-hero-noise" />
            <div className="adp-hero-inner">
              <div>
                <div className="adp-hero-eyebrow">
                  <span className="adp-hero-eyebrow-line" />
                  Admin Panel
                </div>
                <h1>Control <em>Center</em></h1>
                <p className="adp-hero-sub">Review, approve, and manage all student experiences and messages.</p>
              </div>
            </div>
          </div>

          {/* ── STATS ── */}
          <div className="adp-stats-wrap">
            <div className="adp-stats">
              <StatCard label="Total" value={allExps.length} />
              <StatCard label="Pending" value={pending} accent />
              <StatCard label="Approved" value={approved} />
              <StatCard label="Rejected" value={rejected} />
              <StatCard label="Unread Messages" value={unread} accent={unread > 0} />
            </div>
          </div>

          {/* ── TABS ── */}
          <div className="adp-tabs-wrap">
            <div className="adp-tabs">
              <button
                className={`adp-tab${activeTab === 'experiences' ? ' active' : ''}`}
                onClick={() => setActiveTab('experiences')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                Experiences
                <span className="adp-tab-badge">{allExps.length}</span>
              </button>
              <button
                className={`adp-tab${activeTab === 'messages' ? ' active' : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                Messages
                {unread > 0 && <span className="adp-tab-badge">{unread}</span>}
              </button>
            </div>
          </div>

          {/* ── CONTENT ── */}
          <div className={`adp-content${visible ? ' visible' : ''}`}>
            {activeTab === 'experiences' && (
              <>
                <div className="adp-section-header">
                  <h2 className="adp-section-title">All Experiences</h2>
                  <span className="adp-result-count">
                    <strong>{allExps.length}</strong> total · <strong style={{ color: 'var(--accent)' }}>{pending}</strong> pending
                  </span>
                </div>
                {allExps.length === 0 ? (
                  <div className="adp-empty">
                    <div className="adp-empty-icon">📋</div>
                    <h3>No experiences yet</h3>
                    <p>Student experiences will appear here once submitted.</p>
                  </div>
                ) : (
                  <div className="adp-grid">
                    {allExps.map((exp, i) => (
                      <div
                        key={exp._id || exp.id}
                        className="adp-card-wrap"
                        style={{ animationDelay: `${Math.min(i * 50, 350)}ms` }}
                      >
                        <ExperienceCard
                          {...exp}
                          showAdminActions={true}
                          refreshExps={getAllExps}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'messages' && (
              <>
                <div className="adp-section-header">
                  <h2 className="adp-section-title">Contact Messages</h2>
                  <span className="adp-result-count">
                    <strong>{contactMessages.length}</strong> total · <strong style={{ color: 'var(--accent)' }}>{unread}</strong> unread
                  </span>
                </div>
                {contactMessages.length === 0 ? (
                  <div className="adp-empty">
                    <div className="adp-empty-icon">✉️</div>
                    <h3>No messages yet</h3>
                    <p>Messages from the contact form will appear here.</p>
                  </div>
                ) : (
                  <div className="adp-contact-list">
                    {contactMessages.map((contact, i) => (
                      <div
                        key={contact._id || contact.id}
                        className="adp-card-wrap"
                        style={{ animationDelay: `${Math.min(i * 50, 350)}ms` }}
                      >
                        <ContactCard {...contact} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}