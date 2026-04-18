import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { onApprove, onReject } from '../api/experienceApi';
import api from '../api/axios';
import { createSocket } from "../socket";
import { formatDistanceToNow } from 'date-fns';

const rejectionReasons = ['SPA', 'DUPLICATE', 'INCOMPLETE DETAILS', 'OTHER'];

const statusConfig = {
  approved: { label: 'Approved', dot: '#1a7a4a', bg: 'rgba(26,122,74,0.10)', color: '#1a7a4a', border: 'rgba(26,122,74,0.2)' },
  pending:  { label: 'Pending',  dot: '#b45309', bg: 'rgba(247,201,72,0.15)', color: '#92660a', border: 'rgba(247,201,72,0.35)' },
  rejected: { label: 'Rejected', dot: '#c0392b', bg: 'rgba(192,57,43,0.09)', color: '#c0392b', border: 'rgba(192,57,43,0.2)' },
};

export default function ExperienceDetailsPage() {
  const { id } = useParams();
  const { accessToken, role } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [actionError, setActionError] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  // Fetch experience
  useEffect(() => {
    const getExperience = async () => {
      try {
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
        const res = await api.get(`/api/experiences/${id}`, { headers });
        setExperience(res.data.experience);
      } catch (err) {
        if (err.response?.status === 403) setError("You are not allowed to view this experience.");
        else if (err.response?.status === 404) setError("Experience not found.");
        else setError("Something went wrong!");
      } finally {
        setLoading(false);
      }
    };
    getExperience();
  }, [id, accessToken]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/messages/${id}`);
        setMessages(res.data.data);
      } catch {}
    };
    fetchMessages();
  }, [id]);

  // Socket setup
  useEffect(() => {
    if (!accessToken) return;
    const newSocket = createSocket(accessToken);
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [accessToken]);

  useEffect(() => {
    if (!socket) return;
    socket.on('connect', () => socket.emit('joinRoom', id));
    socket.on('connect_error', () => {});
    return () => { socket.off('connect'); socket.off('connect_error'); };
  }, [id, socket]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data) => setMessages(prev => [data, ...prev]);
    socket.on('receiveMessage', handler);
    return () => socket.off('receiveMessage', handler);
  }, [socket]);

  const handleApprove = async () => {
    setApproving(true);
    setActionError('');
    try {
      await onApprove(id, accessToken);
      setExperience(prev => ({ ...prev, status: 'approved', remark: null, reason: null }));
      navigate('/admindashboard');
    } catch { setActionError('Failed to approve. Please try again.'); }
    finally { setApproving(false); }
  };

  const handleReject = async () => {
    if (!reason) { setActionError('Please select a rejection reason.'); return; }
    setSubmitting(true);
    setActionError('');
    try {
      await onReject(id, accessToken, reason, remark);
      setExperience(prev => ({ ...prev, status: 'rejected', reason, remark }));
      navigate('/admindashboard');
    } catch { setActionError('Failed to reject. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const sendMessage = () => {
    if (!message.trim() || !socket) return;
    socket.emit('sendMessage', { experienceId: id, text: message });
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const sc = statusConfig[experience?.status] || { label: experience?.status, dot: '#8a8a96', bg: 'rgba(138,138,150,0.1)', color: '#8a8a96', border: 'rgba(138,138,150,0.2)' };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: '#f5f4f0', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(0,0,0,0.08)', borderTopColor: '#e8521a', borderRadius: '50%', animation: 'edp-spin 0.8s linear infinite' }} />
      <style>{`@keyframes edp-spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: 14, color: '#8a8a96', fontWeight: 500 }}>Loading experience…</span>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#f5f4f0', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ width: 52, height: 52, background: 'rgba(192,57,43,0.08)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚠️</div>
      <p style={{ fontSize: 15, color: '#c0392b', fontWeight: 500 }}>{error}</p>
      <button onClick={() => navigate(-1)} style={{ marginTop: 4, fontSize: 13, color: '#8a8a96', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Go back</button>
    </div>
  );

  const initials = experience?.companyName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

        .edp-root {
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

        /* ── HERO BANNER ── */
        .edp-hero {
          background: var(--ink);
          position: relative;
          overflow: hidden;
          padding: 44px 24px 64px;
        }
        .edp-hero::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 55% 80% at 5% 70%, rgba(232,82,26,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 95% 10%, rgba(247,201,72,0.08) 0%, transparent 55%);
          pointer-events: none;
        }
        .edp-hero-noise {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4; pointer-events: none;
        }
        .edp-hero-inner {
          position: relative;
          max-width: 800px; margin: 0 auto;
          display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
        }
        .edp-hero-logo {
          width: 52px; height: 52px; border-radius: 13px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-size: 18px; font-weight: 800; color: #f5f4f0;
          letter-spacing: -0.03em; flex-shrink: 0;
        }
        .edp-hero-text { flex: 1; min-width: 0; }
        .edp-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600; color: rgba(245,244,240,0.4);
          background: none; border: none; cursor: pointer;
          letter-spacing: 0.05em; text-transform: uppercase;
          transition: color 0.2s ease; padding: 0; margin-bottom: 12px;
        }
        .edp-back-btn:hover { color: rgba(245,244,240,0.75); }
        .edp-hero h1 {
          font-family: var(--font-display);
          font-size: clamp(22px, 4vw, 34px); font-weight: 800;
          color: #f5f4f0; letter-spacing: -0.03em; line-height: 1.1;
          margin-bottom: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .edp-hero-meta {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .edp-meta-item {
          display: flex; align-items: center; gap: 5px;
          font-size: 13px; color: rgba(245,244,240,0.45); font-weight: 400;
        }
        .edp-status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px; border-radius: 100px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.05em;
          text-transform: uppercase; border: 1px solid;
        }
        .edp-badge-dot { width: 5px; height: 5px; border-radius: 50%; }

        /* ── MAIN LAYOUT ── */
        .edp-body {
          max-width: 800px; margin: 0 auto; padding: 32px 24px 80px;
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .edp-body.visible { opacity: 1; transform: translateY(0); }

        /* ── CONTENT CARD ── */
        .edp-card {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          padding: 32px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        /* Prose styles */
        .edp-prose { font-size: 15px; line-height: 1.75; color: #2a2a36; }
        .edp-prose h1,.edp-prose h2,.edp-prose h3 { font-family: var(--font-display); color: var(--ink); letter-spacing: -0.02em; margin: 20px 0 8px; }
        .edp-prose h1 { font-size: 22px; font-weight: 800; }
        .edp-prose h2 { font-size: 18px; font-weight: 700; }
        .edp-prose h3 { font-size: 15px; font-weight: 700; }
        .edp-prose p { margin: 0 0 12px; }
        .edp-prose p:last-child { margin-bottom: 0; }
        .edp-prose strong { font-weight: 700; color: var(--ink); }
        .edp-prose em { font-style: italic; }
        .edp-prose ul,.edp-prose ol { padding-left: 22px; margin: 8px 0 12px; }
        .edp-prose li { margin-bottom: 4px; }
        .edp-prose ul li::marker { color: var(--accent); }
        .edp-prose ol li::marker { color: var(--accent); font-weight: 600; }
        .edp-prose blockquote {
          border-left: 3px solid var(--accent);
          margin: 12px 0; padding: 8px 16px;
          background: rgba(232,82,26,0.04);
          border-radius: 0 8px 8px 0;
          color: #5a5a66; font-style: italic;
        }
        .edp-prose code {
          font-size: 12px; background: var(--surface2);
          border: 1px solid var(--border); border-radius: 5px;
          padding: 1px 6px; font-family: 'SF Mono', monospace; color: var(--accent);
        }
        .edp-prose pre { background: var(--ink); border-radius: 10px; padding: 14px 16px; overflow-x: auto; margin: 10px 0; }
        .edp-prose pre code { background: none; border: none; color: #f5f4f0; padding: 0; }
        .edp-prose hr { border: none; border-top: 1px solid var(--border); margin: 18px 0; }

        /* ── REJECTION NOTICE ── */
        .edp-rejection {
          background: rgba(192,57,43,0.06);
          border: 1.5px solid rgba(192,57,43,0.18);
          border-radius: 11px; padding: 16px 18px; margin-top: 24px;
          display: flex; gap: 12px;
        }
        .edp-rejection-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(192,57,43,0.12);
          display: flex; align-items: center; justify-content: center;
          color: #c0392b; flex-shrink: 0;
        }
        .edp-rejection-title { font-size: 13px; font-weight: 700; color: #c0392b; margin-bottom: 4px; }
        .edp-rejection-text { font-size: 13px; color: #9b3a2d; line-height: 1.5; }

        /* ── ADMIN ACTIONS ── */
        .edp-admin-card {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .edp-admin-header {
          padding: 14px 20px;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          font-size: 11px; font-weight: 700; color: var(--muted);
          text-transform: uppercase; letter-spacing: 0.08em;
          display: flex; align-items: center; gap: 7px;
        }
        .edp-admin-body { padding: 18px 20px; }
        .edp-action-row { display: flex; gap: 10px; }
        .edp-btn {
          flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px 16px; font-family: var(--font-body); font-size: 13px; font-weight: 600;
          border: none; border-radius: 9px; cursor: pointer;
          transition: all 0.2s ease; letter-spacing: 0.01em;
        }
        .edp-btn-approve { background: var(--ink); color: #fff; }
        .edp-btn-approve:hover:not(:disabled) { background: #1a7a4a; box-shadow: 0 4px 14px rgba(26,122,74,0.25); transform: translateY(-1px); }
        .edp-btn-reject { background: transparent; color: #c0392b; border: 1.5px solid rgba(192,57,43,0.25); }
        .edp-btn-reject:hover { background: rgba(192,57,43,0.07); border-color: rgba(192,57,43,0.4); transform: translateY(-1px); }
        .edp-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
        .edp-btn-submit { width: 100%; background: var(--ink); color: #fff; }
        .edp-btn-submit:hover:not(:disabled) { background: var(--accent); box-shadow: 0 4px 14px rgba(232,82,26,0.3); }

        .edp-reject-form { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); }
        .edp-reject-label { font-size: 11px; font-weight: 700; color: #5a5a66; text-transform: uppercase; letter-spacing: 0.06em; }
        .edp-select, .edp-remark-input {
          width: 100%; padding: 10px 13px;
          border: 1.5px solid var(--border); border-radius: 9px;
          font-family: var(--font-body); font-size: 14px; color: var(--ink);
          background: var(--surface); outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .edp-select:focus, .edp-remark-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(232,82,26,0.10);
          background: #fff;
        }
        .edp-remark-input::placeholder { color: var(--muted); }

        .edp-action-error {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 12px; border-radius: 8px;
          background: rgba(192,57,43,0.07);
          border: 1px solid rgba(192,57,43,0.16);
          font-size: 13px; color: #c0392b; font-weight: 500;
        }

        .edp-spinner {
          width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: edp-spin 0.7s linear infinite;
        }
        @keyframes edp-spin { to { transform: rotate(360deg); } }

        /* ── DISCUSSION ── */
        .edp-discussion-card {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .edp-discussion-header {
          padding: 16px 22px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .edp-discussion-title {
          font-family: var(--font-display);
          font-size: 16px; font-weight: 700; color: var(--ink);
          letter-spacing: -0.02em;
          display: flex; align-items: center; gap: 8px;
        }
        .edp-msg-count {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 20px; height: 20px; padding: 0 6px;
          background: var(--surface2); border-radius: 100px;
          font-size: 11px; font-weight: 700; color: var(--muted);
        }

        .edp-messages {
          max-height: 300px; overflow-y: auto;
          padding: 16px 20px; display: flex; flex-direction: column; gap: 10px;
        }
        .edp-messages::-webkit-scrollbar { width: 4px; }
        .edp-messages::-webkit-scrollbar-track { background: transparent; }
        .edp-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

        .edp-msg {
          display: flex; gap: 10px; align-items: flex-start;
        }
        .edp-msg-avatar {
          width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, var(--ink) 0%, #3a3a56 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 11px; font-weight: 700; color: #fff;
        }
        .edp-msg-bubble {
          flex: 1; background: var(--surface); border: 1px solid var(--border);
          border-radius: 4px 12px 12px 12px;
          padding: 10px 13px;
        }
        .edp-msg-top {
          display: flex; align-items: center; justify-content: space-between;
          gap: 8px; margin-bottom: 5px;
        }
        .edp-msg-name { font-size: 12px; font-weight: 700; color: var(--ink); }
        .edp-msg-time { font-size: 11px; color: var(--muted); }
        .edp-msg-text { font-size: 13.5px; color: #3a3a44; line-height: 1.55; white-space: pre-wrap; word-break: break-word; }

        .edp-empty-msgs {
          padding: 32px 20px; text-align: center;
          font-size: 13px; color: var(--muted);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .edp-empty-msgs-icon {
          width: 40px; height: 40px; background: var(--surface2); border-radius: 12px;
          display: flex; align-items: center; justify-content: center; font-size: 18px;
        }

        /* Input row */
        .edp-input-row {
          padding: 14px 20px;
          border-top: 1px solid var(--border);
          display: flex; gap: 10px; align-items: flex-end;
          background: var(--surface);
        }
        .edp-chat-input {
          flex: 1; padding: 10px 14px;
          border: 1.5px solid var(--border); border-radius: 10px;
          font-family: var(--font-body); font-size: 14px; color: var(--ink);
          background: #fff; outline: none; resize: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          min-height: 40px; max-height: 100px; line-height: 1.5;
        }
        .edp-chat-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(232,82,26,0.10);
        }
        .edp-chat-input::placeholder { color: var(--muted); }
        .edp-send-btn {
          width: 40px; height: 40px; border-radius: 10px; border: none;
          background: var(--ink); color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.2s ease, transform 0.15s ease;
          flex-shrink: 0;
        }
        .edp-send-btn:hover { background: var(--accent); transform: scale(1.05); }
        .edp-send-btn:active { transform: scale(0.97); }
        .edp-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        @media (max-width: 640px) {
          .edp-hero { padding: 36px 20px 56px; }
          .edp-body { padding: 24px 16px 60px; }
          .edp-card { padding: 20px; }
          .edp-action-row { flex-direction: column; }
        }
      `}</style>

      <div className="edp-root">
        {/* ── HERO ── */}
        <div className="edp-hero">
          <div className="edp-hero-noise" />
          <div className="edp-hero-inner">
            <div className="edp-hero-logo">{initials}</div>
            <div className="edp-hero-text">
              <button className="edp-back-btn" onClick={() => navigate(-1)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                Back
              </button>
              <h1>{experience?.companyName}</h1>
              <div className="edp-hero-meta">
                <span className="edp-meta-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  {experience?.studentName}
                </span>
                <span style={{ color: 'rgba(245,244,240,0.2)' }}>·</span>
                <span className="edp-meta-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Batch {experience?.batch}
                </span>
                <span style={{ color: 'rgba(245,244,240,0.2)' }}>·</span>
                <span
                  className="edp-status-badge"
                  style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}
                >
                  <span className="edp-badge-dot" style={{ background: sc.dot }} />
                  {sc.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className={`edp-body${visible ? ' visible' : ''}`}>

          {/* Content card */}
          <div className="edp-card">
            <div
              className="edp-prose"
              dangerouslySetInnerHTML={{ __html: experience?.content }}
            />

            {experience?.status === 'rejected' && (
              <div className="edp-rejection">
                <div className="edp-rejection-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div>
                  <p className="edp-rejection-title">Rejected — {experience?.reason}</p>
                  {experience?.remark && <p className="edp-rejection-text">{experience.remark}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Admin actions */}
          {role === 'admin' && (
            <div className="edp-admin-card">
              <div className="edp-admin-header">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Admin Actions
              </div>
              <div className="edp-admin-body">
                <div className="edp-action-row">
                  {experience?.status !== 'approved' && (
                    <button className="edp-btn edp-btn-approve" onClick={handleApprove} disabled={approving}>
                      {approving ? <><div className="edp-spinner" /> Approving…</> : (
                        <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Approve</>
                      )}
                    </button>
                  )}
                  {experience?.status !== 'rejected' && (
                    <button className="edp-btn edp-btn-reject" onClick={() => { setRejecting(r => !r); setActionError(''); }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      {rejecting ? 'Cancel' : 'Reject'}
                    </button>
                  )}
                </div>

                {rejecting && (
                  <div className="edp-reject-form">
                    <label className="edp-reject-label">Rejection Reason</label>
                    <select className="edp-select" value={reason} onChange={(e) => setReason(e.target.value)} required>
                      <option value="">Select a reason…</option>
                      {rejectionReasons.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <label className="edp-reject-label">Remark (optional)</label>
                    <input
                      className="edp-remark-input"
                      type="text"
                      placeholder="Add a remark for the student…"
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                    />
                    <button className="edp-btn edp-btn-submit" onClick={handleReject} disabled={submitting}>
                      {submitting ? <><div className="edp-spinner" /> Submitting…</> : 'Confirm Rejection'}
                    </button>
                  </div>
                )}

                {actionError && (
                  <div className="edp-action-error" style={{ marginTop: 12 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {actionError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Discussion */}
          <div className="edp-discussion-card">
            <div className="edp-discussion-header">
              <span className="edp-discussion-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                Discussion
                <span className="edp-msg-count">{messages.length}</span>
              </span>
            </div>

            {messages.length === 0 ? (
              <div className="edp-empty-msgs">
                <div className="edp-empty-msgs-icon">💬</div>
                <p>No comments yet — be the first to ask!</p>
              </div>
            ) : (
              <div className="edp-messages">
                {[...messages].reverse().map((msg, i) => {
                  const name = msg.userId?.name || 'Anonymous';
                  const initial = name.charAt(0).toUpperCase();
                  return (
                    <div key={i} className="edp-msg">
                      <div className="edp-msg-avatar">{initial}</div>
                      <div className="edp-msg-bubble">
                        <div className="edp-msg-top">
                          <span className="edp-msg-name">{name}</span>
                          <span className="edp-msg-time">
                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="edp-msg-text">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}

            <div className="edp-input-row">
              <textarea
                className="edp-chat-input"
                placeholder="Write a comment or ask a question…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className="edp-send-btn"
                onClick={sendMessage}
                disabled={!message.trim() || !socket}
                title="Send (Enter)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}