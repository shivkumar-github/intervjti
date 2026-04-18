import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios';

export default function ContactCard({ id, name, email, message, isRead: initialIsRead }) {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [isRead, setIsRead] = useState(initialIsRead);

  const handleMarkRead = async () => {
    setStatus(null);
    setLoading(true);
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      await api.patch(`/api/contact/${id}`, {}, { headers });
      setIsRead(true);
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap');

        .cc-root {
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
          padding: 22px 24px 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04);
          transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .cc-root::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 3px;
          height: 100%;
          background: var(--accent);
          opacity: 0;
          transition: opacity 0.25s ease;
          border-radius: 3px 0 0 3px;
        }
        .cc-root:hover {
          box-shadow: 0 8px 28px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.05);
          border-color: rgba(0,0,0,0.13);
          transform: translateY(-2px);
        }
        .cc-root:hover::before { opacity: 1; }
        .cc-root.cc-unread { border-color: rgba(232,82,26,0.2); background: #fffcfb; }
        .cc-root.cc-unread::before { opacity: 1; }

        .cc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 14px;
        }
        .cc-identity { display: flex; align-items: center; gap: 12px; }
        .cc-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          letter-spacing: -0.02em;
        }
        .cc-name {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 2px;
        }
        .cc-email {
          font-size: 12px;
          color: var(--muted);
          font-weight: 400;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .cc-badge {
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
        }
        .cc-badge.unread {
          background: rgba(232,82,26,0.10);
          color: var(--accent);
          border: 1px solid rgba(232,82,26,0.2);
        }
        .cc-badge.read {
          background: var(--surface2);
          color: var(--muted);
          border: 1px solid var(--border);
        }
        .cc-badge-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .cc-divider {
          height: 1px;
          background: var(--border);
          margin: 0 0 14px;
        }

        .cc-message {
          font-size: 13.5px;
          color: #3a3a44;
          line-height: 1.65;
          white-space: pre-line;
          font-weight: 400;
        }

        .cc-footer {
          margin-top: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .cc-feedback {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 500;
          border-radius: 8px;
          padding: 6px 10px;
        }
        .cc-feedback.success {
          color: #1a7a4a;
          background: rgba(26,122,74,0.08);
        }
        .cc-feedback.error {
          color: #c0392b;
          background: rgba(192,57,43,0.08);
        }

        .cc-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 18px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          background: var(--ink);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }
        .cc-btn:hover:not(:disabled) {
          background: var(--accent);
          box-shadow: 0 4px 14px rgba(232,82,26,0.3);
          transform: translateY(-1px);
        }
        .cc-btn:active:not(:disabled) { transform: translateY(0); }
        .cc-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .cc-btn-spinner {
          width: 12px; height: 12px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: cc-spin 0.7s linear infinite;
        }
        @keyframes cc-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className={`cc-root${!isRead ? " cc-unread" : ""}`}>
        {/* Header */}
        <div className="cc-header">
          <div className="cc-identity">
            <div className="cc-avatar">
              {name ? name.charAt(0).toUpperCase() : "?"}
            </div>
            <div>
              <div className="cc-name">{name}</div>
              <div className="cc-email">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                {email}
              </div>
            </div>
          </div>
          <span className={`cc-badge ${isRead ? "read" : "unread"}`}>
            <span className="cc-badge-dot" />
            {isRead ? "Read" : "Unread"}
          </span>
        </div>

        <div className="cc-divider" />

        {/* Message */}
        <p className="cc-message">{message}</p>

        {/* Footer */}
        {(!isRead || status) && (
          <div className="cc-footer">
            {status === 'success' && (
              <span className="cc-feedback success">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Marked as read
              </span>
            )}
            {status === 'error' && (
              <span className="cc-feedback error">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Something went wrong — try again
              </span>
            )}
            {!isRead && (
              <button className="cc-btn" onClick={handleMarkRead} disabled={loading}>
                {loading ? (
                  <><div className="cc-btn-spinner" /> Marking…</>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Mark as Read
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}