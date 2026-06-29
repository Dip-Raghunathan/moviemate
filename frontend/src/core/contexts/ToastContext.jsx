import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// ─── Toast Context ────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="currentColor" fillOpacity="0.15"/>
      <path d="M6 10.5l2.5 2.5L14 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="currentColor" fillOpacity="0.15"/>
      <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="currentColor" fillOpacity="0.15"/>
      <path d="M10 6v5M10 13.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="currentColor" fillOpacity="0.15"/>
      <path d="M10 9v5M10 6.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

const TOAST_STYLES = {
  success: { color: '#34d399', borderColor: 'rgba(16,185,129,0.25)', bg: 'rgba(16,185,129,0.08)' },
  error:   { color: '#f87171', borderColor: 'rgba(239,68,68,0.25)',  bg: 'rgba(239,68,68,0.08)' },
  warning: { color: '#fbbf24', borderColor: 'rgba(245,158,11,0.25)', bg: 'rgba(245,158,11,0.08)' },
  info:    { color: '#60a5fa', borderColor: 'rgba(59,130,246,0.25)', bg: 'rgba(59,130,246,0.08)' },
};

// ─── Individual Toast ─────────────────────────────────────────────────────────
const Toast = ({ id, type = 'info', title, message, onRemove }) => {
  const [exiting, setExiting] = useState(false);
  const style = TOAST_STYLES[type] || TOAST_STYLES.info;

  const handleClose = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(id), 300);
  }, [id, onRemove]);

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        background: 'rgba(13,13,26,0.95)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${style.borderColor}`,
        borderRadius: '14px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        minWidth: '300px',
        maxWidth: '380px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
        animation: exiting
          ? 'slideOutRight 0.3s ease-in forwards'
          : 'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent line */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: '3px', background: style.color, borderRadius: '14px 0 0 14px',
      }} />

      {/* Icon */}
      <div style={{ color: style.color, flexShrink: 0, marginTop: '1px' }}>
        {ICONS[type]}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f0f0fa', marginBottom: '2px' }}>
            {title}
          </p>
        )}
        <p style={{ fontSize: '0.8125rem', color: '#a8a8c0', lineHeight: '1.4' }}>
          {message}
        </p>
      </div>

      {/* Close */}
      <button
        onClick={handleClose}
        aria-label="Dismiss notification"
        style={{
          color: 'rgba(255,255,255,0.3)',
          background: 'none', border: 'none',
          cursor: 'pointer', flexShrink: 0,
          padding: '2px', lineHeight: 1,
          transition: 'color 150ms ease',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
};

// ─── Toast Provider ───────────────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++counterRef.current;
    setToasts(prev => [...prev, { id, type, title, message }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const handleRateLimit = (e) => {
      addToast({
        type: 'error',
        title: 'Too Many Requests',
        message: e.detail?.message || 'You are sending requests too quickly. Please slow down.',
        duration: 5000
      });
    };
    window.addEventListener('api-rate-limit', handleRateLimit);
    return () => window.removeEventListener('api-rate-limit', handleRateLimit);
  }, [addToast]);

  const toast = {
    success: (message, title) => addToast({ type: 'success', title, message }),
    error:   (message, title) => addToast({ type: 'error',   title, message, duration: 5000 }),
    warning: (message, title) => addToast({ type: 'warning', title, message }),
    info:    (message, title) => addToast({ type: 'info',    title, message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <Toast {...t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
