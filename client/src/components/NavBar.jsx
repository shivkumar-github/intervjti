import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function NavBar() {
  const { isLoggedIn, role } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { to: "/", label: "Home", show: true },
    { to: "/admindashboard", label: "Admin Dashboard", show: role === "admin" },
    { to: "/loginpage", label: "Login", show: !isLoggedIn },
    { to: "/signup", label: "Sign Up", show: !isLoggedIn, cta: true },
    { to: "/myexperiencespage", label: "My Experiences", show: isLoggedIn && role === "student" },
    { to: "/uploadpage", label: "Upload", show: isLoggedIn, cta: true },
    { to: "/contactuspage", label: "Contact Us", show:role !== true },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLinkClick = () => setMenuOpen(false);

  const visible = navLinks.filter((l) => l.show);
  const normal = visible.filter((l) => !l.cta);
  const ctas = visible.filter((l) => l.cta);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

        :root {
          --ink: #0d0d12;
          --surface: #f5f4f0;
          --accent: #e8521a;
          --muted: #8a8a96;
          --border: rgba(0,0,0,0.09);
          --font-display: 'Syne', sans-serif;
          --font-body: 'Outfit', sans-serif;
          --nav-h: 64px;
          --transition: 0.25s cubic-bezier(0.4,0,0.2,1);
        }

        .nb-root {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--surface);
          border-bottom: 1px solid transparent;
          transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
          font-family: var(--font-body);
        }
        .nb-root.scrolled {
          background: rgba(245,244,240,0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom-color: var(--border);
          box-shadow: 0 2px 20px rgba(0,0,0,0.06);
        }

        .nb-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
          height: var(--nav-h);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        /* LOGO */
        .nb-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .nb-logo-mark {
          width: 34px; height: 34px;
          background: var(--ink);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          position: relative;
          overflow: hidden;
          transition: transform var(--transition);
        }
        .nb-logo-mark::after {
          content: '';
          position: absolute;
          bottom: -6px; right: -6px;
          width: 18px; height: 18px;
          background: var(--accent);
          border-radius: 50%;
        }
        .nb-logo:hover .nb-logo-mark { transform: rotate(-6deg) scale(1.06); }
        .nb-logo-mark svg { position: relative; z-index: 1; }
        .nb-logo-text {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.04em;
        }
        .nb-logo-text span { color: var(--accent); }

        /* DESKTOP LINKS */
        .nb-links {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin: 0; padding: 0;
        }
        .nb-link {
          padding: 7px 13px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--muted);
          text-decoration: none;
          transition: color var(--transition), background var(--transition);
          white-space: nowrap;
          position: relative;
        }
        .nb-link:hover { color: var(--ink); background: rgba(0,0,0,0.05); }
        .nb-link.active {
          color: var(--ink);
          font-weight: 600;
        }
        .nb-link.active::after {
          content: '';
          position: absolute;
          bottom: 3px; left: 50%; transform: translateX(-50%);
          width: 18px; height: 2px;
          background: var(--accent);
          border-radius: 2px;
        }

        /* CTA BUTTON */
        .nb-cta {
          padding: 8px 16px;
          border-radius: 9px;
          font-size: 13.5px;
          font-weight: 600;
          font-family: var(--font-body);
          text-decoration: none;
          background: var(--ink);
          color: #f5f4f0 !important;
          border: none;
          cursor: pointer;
          transition: background var(--transition), transform var(--transition), box-shadow var(--transition);
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .nb-cta:hover {
          background: var(--accent);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(232,82,26,0.28);
        }
        .nb-cta.active { background: var(--accent); }

        .nb-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        /* HAMBURGER */
        .nb-burger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 36px; height: 36px;
          background: none;
          border: 1.5px solid var(--border);
          border-radius: 9px;
          cursor: pointer;
          padding: 0;
          transition: border-color var(--transition), background var(--transition);
        }
        .nb-burger:hover { border-color: var(--ink); background: rgba(0,0,0,0.04); }
        .nb-burger span {
          display: block;
          width: 16px; height: 1.5px;
          background: var(--ink);
          border-radius: 2px;
          transition: transform 0.3s ease, opacity 0.3s ease;
          transform-origin: center;
        }
        .nb-burger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .nb-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .nb-burger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* MOBILE DRAWER */
        .nb-mobile {
          display: none;
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease;
          opacity: 0;
          border-top: 1px solid var(--border);
          background: rgba(245,244,240,0.97);
          backdrop-filter: blur(14px);
        }
        .nb-mobile.open { max-height: 480px; opacity: 1; }
        .nb-mobile-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 16px 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .nb-mobile-link {
          display: flex;
          align-items: center;
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          color: var(--muted);
          text-decoration: none;
          transition: all var(--transition);
        }
        .nb-mobile-link:hover { background: rgba(0,0,0,0.05); color: var(--ink); }
        .nb-mobile-link.active { background: rgba(0,0,0,0.05); color: var(--ink); font-weight: 600; }
        .nb-mobile-cta {
          margin-top: 8px;
          padding: 12px 16px;
          background: var(--ink);
          color: #f5f4f0 !important;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          text-align: center;
          transition: background var(--transition);
          display: block;
        }
        .nb-mobile-cta:hover { background: var(--accent); }

        @media (max-width: 768px) {
          .nb-links { display: none; }
          .nb-actions .nb-cta { display: none; }
          .nb-burger { display: flex; }
          .nb-mobile { display: block; }
        }
      `}</style>

      <nav className={`nb-root${scrolled ? " scrolled" : ""}`}>
        <div className="nb-inner">
          {/* Logo */}
          <NavLink to="/" className="nb-logo" onClick={handleLinkClick}>
            <div className="nb-logo-mark">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 12L8 4L13 12" stroke="#f5f4f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 9H11" stroke="#f5f4f0" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="nb-logo-text">Inter<span>VJTI</span></span>
          </NavLink>

          {/* Desktop nav links */}
          <ul className="nb-links">
            {normal.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) => `nb-link${isActive ? " active" : ""}`}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop CTAs + hamburger */}
          <div className="nb-actions">
            {ctas.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nb-cta${isActive ? " active" : ""}`}
              >
                {link.label === "Upload" && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                )}
                {link.label}
              </NavLink>
            ))}
            <button
              className={`nb-burger${menuOpen ? " open" : ""}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={`nb-mobile${menuOpen ? " open" : ""}`} aria-hidden={!menuOpen}>
          <div className="nb-mobile-inner">
            {normal.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nb-mobile-link${isActive ? " active" : ""}`}
                onClick={handleLinkClick}
              >
                {link.label}
              </NavLink>
            ))}
            {ctas.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="nb-mobile-cta"
                onClick={handleLinkClick}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}