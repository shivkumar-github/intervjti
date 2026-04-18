import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { onApprove } from '../api/experienceApi';

export default function ExperienceCard({ id, companyName, studentName, status: initialStatus, batch, preview, showAdminActions = false, refreshExps }) {
  const { accessToken, role } = useAuth();
  const [approveLoading, setApproveLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const navigate = useNavigate();

  const handleApprove = async () => {
    setApproveLoading(true);
    setError('');
    try {
      await onApprove(id, accessToken);
      setStatus('approved');
      refreshExps?.();
    } catch {
      setError('An error occurred while approving. Please try again.');
    } finally {
      setApproveLoading(false);
    }
  };

  const statusConfig = {
    approved: { label: 'Approved', dot: '#1a7a4a', bg: 'rgba(26,122,74,0.10)', color: '#1a7a4a', border: 'rgba(26,122,74,0.2)' },
    pending:  { label: 'Pending',  dot: '#b45309', bg: 'rgba(247,201,72,0.15)', color: '#92660a', border: 'rgba(247,201,72,0.35)' },
    rejected: { label: 'Rejected', dot: '#c0392b', bg: 'rgba(192,57,43,0.09)', color: '#c0392b', border: 'rgba(192,57,43,0.2)' },
  };
  const sc = statusConfig[status] || { label: status, dot: '#8a8a96', bg: 'rgba(138,138,150,0.1)', color: '#8a8a96', border: 'rgba(138,138,150,0.2)' };

  const initials = companyName
    ? companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

        .ec-root {
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

          font-family: var(--font-body);
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04);
          transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
          display: flex;
          flex-direction: column;
        }
        .ec-root:hover {
          box-shadow: 0 12px 36px rgba(0,0,0,0.10), 0 3px 8px rgba(0,0,0,0.06);
          border-color: rgba(0,0,0,0.13);
          transform: translateY(-3px);
        }

        .ec-link {
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 22px 22px 18px;
        }

        /* Company header row */
        .ec-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }
        .ec-company-row { display: flex; align-items: center; gap: 11px; min-width: 0; }
        .ec-logo {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: var(--ink);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
          letter-spacing: -0.03em;
        }
        .ec-company-name {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.02em;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Status badge */
        .ec-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          flex-shrink: 0;
          border: 1px solid;
        }
        .ec-badge-dot { width: 5px; height: 5px; border-radius: 50%; }

        /* Meta row */
        .ec-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .ec-meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--muted);
          font-weight: 400;
        }

        /* Divider */
        .ec-divider { height: 1px; background: var(--border); margin-bottom: 12px; }

        /* Preview text */
        .ec-preview {
          font-size: 13px;
          color: #4a4a56;
          line-height: 1.65;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          word-break: break-word;
          flex: 1;
        }

        /* Read more */
        .ec-readmore {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 10px;
          font-size: 12px;
          font-weight: 600;
          color: var(--accent);
          letter-spacing: 0.01em;
          transition: gap 0.2s ease;
        }
        .ec-root:hover .ec-readmore { gap: 7px; }

        /* Admin actions */
        .ec-actions {
          padding: 14px 22px 18px;
          border-top: 1px solid var(--border);
          background: var(--surface);
          display: flex;
          gap: 10px;
        }
        .ec-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 14px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          border: none;
          border-radius: 9px;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }
        .ec-btn-approve {
          background: var(--ink);
          color: #fff;
        }
        .ec-btn-approve:hover:not(:disabled) {
          background: #1a7a4a;
          box-shadow: 0 4px 14px rgba(26,122,74,0.25);
          transform: translateY(-1px);
        }
        .ec-btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }
        .ec-btn-reject {
          background: transparent;
          color: #c0392b;
          border: 1.5px solid rgba(192,57,43,0.25);
        }
        .ec-btn-reject:hover {
          background: rgba(192,57,43,0.07);
          border-color: rgba(192,57,43,0.4);
          transform: translateY(-1px);
        }

        .ec-spinner {
          width: 12px; height: 12px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: ec-spin 0.7s linear infinite;
        }
        @keyframes ec-spin { to { transform: rotate(360deg); } }

        .ec-error {
          margin: 0 22px 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #c0392b;
          background: rgba(192,57,43,0.07);
          border-radius: 8px;
          padding: 7px 10px;
        }
      `}</style>

      <div className="ec-root">
        {/* Clickable content area */}
        <Link to={`/experience/${id}`} className="ec-link">
          <div className="ec-top">
            <div className="ec-company-row">
              <div className="ec-logo">{initials}</div>
              <span className="ec-company-name">{companyName}</span>
            </div>
            <span
              className="ec-badge"
              style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}
            >
              <span className="ec-badge-dot" style={{ background: sc.dot }} />
              {sc.label}
            </span>
          </div>

          <div className="ec-meta">
            <span className="ec-meta-item">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              {studentName}
            </span>
            <span className="ec-meta-item">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Batch {batch}
            </span>
          </div>

          <div className="ec-divider" />

          <p className="ec-preview">{preview}</p>

          <span className="ec-readmore">
            Read more
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </span>
        </Link>

        {/* Admin actions */}
        {role === 'admin' && showAdminActions && (
          <div className="ec-actions">
            {status !== 'approved' && (
              <button className="ec-btn ec-btn-approve" onClick={handleApprove} disabled={approveLoading}>
                {approveLoading ? (
                  <><div className="ec-spinner" /> Approving…</>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Approve
                  </>
                )}
              </button>
            )}
            {status !== 'rejected' && (
              <button className="ec-btn ec-btn-reject" onClick={() => navigate(`/experience/${id}`)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Reject
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="ec-error">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}
      </div>
    </>
  );
}