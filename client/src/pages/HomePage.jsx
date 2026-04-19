import ExperienceCard from "../components/ExperienceCard";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// Animated counter hook
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// Strip HTML tags for searching inside content
function stripHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent || div.innerText || '';
}

// Skeleton card component
function SkeletonCard() {
  return (
    <div className="exp-skeleton">
      <div className="skel-img" />
      <div className="skel-body">
        <div className="skel-line w-60" />
        <div className="skel-line w-40" />
        <div className="skel-line w-full" />
        <div className="skel-line w-80" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [allExps, setAllExps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [visible, setVisible] = useState(false);
  const heroRef = useRef(null);
  const { accessToken } = useAuth();

  const countDisplay = useCountUp(allExps.length, 1000);

  useEffect(() => {
    const getAllExps = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/experiences");
        if (!response.data.success) return;
        setAllExps(response.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getAllExps();
  }, [accessToken]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Derive tags from data
  const tags = ["All", ...Array.from(new Set(allExps.map((e) => e.category || e.tag || e.type).filter(Boolean)))];

  // ✅ FIX: Search now works on companyName, studentName, batch, and content
  const filtered = allExps.filter((exp) => {
    if (activeTag !== "All" && (exp.category || exp.tag || exp.type) !== activeTag) return false;
    if (!search.trim()) return true;

    const q = search.toLowerCase();
    const plainContent = stripHTML(exp.content || exp.preview || '');

    return (
      (exp.companyName  && exp.companyName.toLowerCase().includes(q))  ||
      (exp.studentName  && exp.studentName.toLowerCase().includes(q))  ||
      (exp.batch        && String(exp.batch).toLowerCase().includes(q)) ||
      plainContent.toLowerCase().includes(q)
    );
  });

  // Highlight matched text helper
  function highlight(text, query) {
    if (!query.trim() || !text) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: 'rgba(232,82,26,0.18)', color: 'inherit', borderRadius: 3, padding: '0 1px' }}>
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #0d0d12;
          --ink2: #1c1c26;
          --surface: #f5f4f0;
          --surface2: #eeecea;
          --accent: #e8521a;
          --accent2: #f7c948;
          --muted: #8a8a96;
          --border: rgba(0,0,0,0.09);
          --card-bg: #ffffff;
          --radius: 16px;
          --font-display: 'Syne', sans-serif;
          --font-body: 'Outfit', sans-serif;
          --shadow-card: 0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          --shadow-hover: 0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
          --transition: 0.3s cubic-bezier(0.4,0,0.2,1);
        }

        .hp-root {
          min-height: 100vh;
          background: var(--surface);
          font-family: var(--font-body);
          color: var(--ink);
          overflow-x: hidden;
        }

        /* ── HERO ── */
        .hp-hero {
          position: relative;
          background: var(--ink);
          overflow: hidden;
          padding: 72px 24px 80px;
        }
        .hp-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 80% at 10% 50%, rgba(232,82,26,0.18) 0%, transparent 60%),
                      radial-gradient(ellipse 60% 60% at 90% 20%, rgba(247,201,72,0.12) 0%, transparent 55%);
          pointer-events: none;
        }
        .hp-hero-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4;
          pointer-events: none;
        }
        .hp-hero-inner {
          position: relative;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
        }
        .hp-hero-text { flex: 1; min-width: 280px; }
        .hp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(232,82,26,0.15);
          border: 1px solid rgba(232,82,26,0.3);
          border-radius: 100px;
          padding: 4px 14px;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 500;
          color: #f07a4e;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .hp-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
        .hp-hero h1 {
          font-family: var(--font-display);
          font-size: clamp(36px, 6vw, 72px);
          font-weight: 800;
          line-height: 1.0;
          letter-spacing: -0.03em;
          color: #f5f4f0;
          margin-bottom: 16px;
        }
        .hp-hero h1 em {
          font-style: normal;
          color: var(--accent);
        }
        .hp-hero-sub {
          font-size: 16px;
          color: rgba(245,244,240,0.55);
          font-weight: 300;
          line-height: 1.6;
          max-width: 440px;
        }
        .hp-hero-stats {
          display: flex;
          gap: 32px;
          align-items: flex-end;
          flex-wrap: wrap;
        }
        .hp-stat { text-align: right; }
        .hp-stat-num {
          font-family: var(--font-display);
          font-size: 48px;
          font-weight: 800;
          line-height: 1;
          color: var(--accent2);
          letter-spacing: -0.04em;
        }
        .hp-stat-label {
          font-size: 12px;
          color: rgba(245,244,240,0.4);
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 4px;
        }

        /* ── TOOLBAR ── */
        .hp-toolbar {
          max-width: 1100px;
          margin: -24px auto 0;
          padding: 0 24px;
          position: relative;
          z-index: 10;
        }
        .hp-toolbar-card {
          background: var(--card-bg);
          border-radius: var(--radius);
          box-shadow: 0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06);
          padding: 18px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .hp-search-wrap {
          flex: 1;
          min-width: 200px;
          position: relative;
        }
        .hp-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
          pointer-events: none;
        }
        .hp-search {
          width: 100%;
          padding: 10px 36px 10px 40px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--ink);
          background: var(--surface);
          outline: none;
          transition: border-color var(--transition), box-shadow var(--transition);
        }
        .hp-search:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(232,82,26,0.10);
          background: #fff;
        }
        .hp-search::placeholder { color: var(--muted); }

        /* Clear button */
        .hp-search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--muted);
          display: flex;
          align-items: center;
          padding: 2px;
          border-radius: 4px;
          transition: color 0.2s;
        }
        .hp-search-clear:hover { color: var(--ink); }

        .hp-divider { width: 1px; height: 32px; background: var(--border); flex-shrink: 0; }
        .hp-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }
        .hp-tag {
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-body);
          cursor: pointer;
          border: 1.5px solid var(--border);
          background: transparent;
          color: var(--muted);
          transition: all var(--transition);
          white-space: nowrap;
        }
        .hp-tag:hover { border-color: var(--accent); color: var(--accent); }
        .hp-tag.active {
          background: var(--ink);
          border-color: var(--ink);
          color: #fff;
        }

        /* ── SEARCH HINT ── */
        .hp-search-hint {
          max-width: 1100px;
          margin: 12px auto 0;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: var(--muted);
        }
        .hp-search-hint strong { color: var(--ink); font-weight: 600; }
        .hp-hint-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--surface2);
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 11.5px;
          font-weight: 500;
          color: #5a5a66;
          border: 1px solid var(--border);
        }

        /* ── GRID SECTION ── */
        .hp-section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }
        .hp-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .hp-section-title {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.02em;
        }
        .hp-result-count {
          font-size: 13px;
          color: var(--muted);
          font-weight: 400;
        }
        .hp-result-count strong {
          color: var(--ink);
          font-weight: 600;
        }

        /* ── EXPERIENCE GRID ── */
        .hp-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }

        /* Card entrance animation */
        .hp-card-wrap {
          opacity: 0;
          transform: translateY(24px);
          animation: card-in 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes card-in {
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── SKELETON ── */
        .exp-skeleton {
          background: var(--card-bg);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: var(--shadow-card);
        }
        .skel-img {
          width: 100%; height: 180px;
          background: linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .skel-body { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .skel-line {
          height: 12px;
          border-radius: 6px;
          background: linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .w-60 { width: 60%; }
        .w-40 { width: 40%; }
        .w-full { width: 100%; }
        .w-80 { width: 80%; }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── EMPTY STATE ── */
        .hp-empty {
          grid-column: 1/-1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          text-align: center;
          gap: 12px;
        }
        .hp-empty-icon {
          width: 64px; height: 64px;
          background: var(--surface2);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
          margin-bottom: 8px;
        }
        .hp-empty h3 {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: var(--ink);
        }
        .hp-empty p { font-size: 14px; color: var(--muted); max-width: 320px; line-height: 1.6; }
        .hp-empty-clear {
          margin-top: 8px;
          padding: 8px 20px;
          background: var(--ink);
          color: #fff;
          border: none;
          border-radius: 9px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .hp-empty-clear:hover { background: var(--accent); }

        /* ── PAGE-LEVEL FADE ── */
        .hp-root { opacity: 0; transition: opacity 0.4s ease; }
        .hp-root.visible { opacity: 1; }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .hp-hero { padding: 56px 20px 72px; }
          .hp-hero-stats { display: none; }
          .hp-toolbar-card { padding: 14px 16px; }
          .hp-divider { display: none; }
          .hp-tags { width: 100%; overflow-x: auto; flex-wrap: nowrap; padding-bottom: 2px; }
          .hp-grid { grid-template-columns: 1fr; }
          .hp-section { padding: 32px 16px 60px; }
        }
        @media (max-width: 900px) {
          .hp-hero-inner { align-items: flex-start; flex-direction: column; }
          .hp-hero-stats { align-self: flex-start; flex-direction: row; gap: 24px; }
          .hp-stat { text-align: left; }
        }
      `}</style>

      <div className={`hp-root${visible ? " visible" : ""}`}>
        {/* ── HERO ── */}
        <section className="hp-hero" ref={heroRef}>
          <div className="hp-hero-noise" />
          <div className="hp-hero-inner">
            <div className="hp-hero-text">
              <div className="hp-eyebrow">
                <span className="hp-eyebrow-dot" />
                Community Stories
              </div>
              <h1>
                Real <em>Experiences,</em><br />Real Insights
              </h1>
              <p className="hp-hero-sub">
                Discover curated stories from people who've been there — honest, unfiltered, and worth reading.
              </p>
            </div>
            <div className="hp-hero-stats">
              <div className="hp-stat">
                <div className="hp-stat-num">{loading ? "—" : countDisplay}</div>
                <div className="hp-stat-label">Experiences</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TOOLBAR ── */}
        <div className="hp-toolbar">
          <div className="hp-toolbar-card">
            <div className="hp-search-wrap">
              <svg className="hp-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="hp-search"
                type="text"
                placeholder="Search by company, student, batch…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="hp-search-clear" onClick={() => setSearch('')} title="Clear search">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
            {tags.length > 1 && (
              <>
                <div className="hp-divider" />
                <div className="hp-tags">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      className={`hp-tag${activeTag === tag ? " active" : ""}`}
                      onClick={() => setActiveTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── SEARCH HINT ── */}
        {!search && (
          <div className="hp-search-hint">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Search by
            <span className="hp-hint-tag">🏢 Company</span>
            <span className="hp-hint-tag">👤 Student</span>
            <span className="hp-hint-tag">📅 Batch</span>
            <span className="hp-hint-tag">📝 Content</span>
          </div>
        )}

        {/* ── GRID ── */}
        <section className="hp-section">
          <div className="hp-section-header">
            <h2 className="hp-section-title">
              {search
                ? <>Results for "<em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>{search}</em>"</>
                : 'Latest Experiences'
              }
            </h2>
            {!loading && (
              <span className="hp-result-count">
                Showing <strong>{filtered.length}</strong> of <strong>{allExps.length}</strong>
              </span>
            )}
          </div>

          <div className="hp-grid">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : filtered.length === 0
              ? (
                <div className="hp-empty">
                  <div className="hp-empty-icon">🔍</div>
                  <h3>No experiences found</h3>
                  <p>No results for "<strong>{search}</strong>". Try searching by company name, student name, or batch number.</p>
                  <button className="hp-empty-clear" onClick={() => { setSearch(''); setActiveTag('All'); }}>
                    Clear filters
                  </button>
                </div>
              )
              : filtered.map((exp, i) => (
                <div
                  key={exp.id || exp._id}
                  className="hp-card-wrap"
                  style={{ animationDelay: `${Math.min(i * 60, 400)}ms` }}
                >
                  <ExperienceCard {...exp} showAdminActions={false} />
                </div>
              ))
            }
          </div>
        </section>
      </div>
    </>
  );
}