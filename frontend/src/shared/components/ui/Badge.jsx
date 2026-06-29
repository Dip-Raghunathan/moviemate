// Badge — status and label badges
const VARIANTS = {
  pro:      { bg: 'linear-gradient(135deg,#f5a623,#e8102a)', color: 'white', text: 'PRO' },
  verified: { bg: 'rgba(59,130,246,0.18)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', text: '✓ Verified' },
  new:      { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)', text: 'NEW' },
  online:   { bg: 'rgba(16,185,129,0.15)', color: '#34d399', text: '● Online' },
  offline:  { bg: 'rgba(255,255,255,0.06)', color: '#6b6b85', text: '○ Offline' },
  hot:      { bg: 'linear-gradient(135deg,#ef4444,#f97316)', color: 'white', text: 'HOT' },
  beta:     { bg: 'rgba(139,92,246,0.18)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', text: 'BETA' },
  full:     { bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', text: 'FULL' },
  open:     { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.22)', text: 'OPEN' },
};

/**
 * Badge
 * @param {'pro'|'verified'|'new'|'online'|'offline'|'hot'|'beta'|'full'|'open'} variant
 * @param {string} label - override text
 * @param {string} className
 */
const Badge = ({ variant = 'new', label, className = '', style = {} }) => {
  const v = VARIANTS[variant] || VARIANTS.new;
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: 9999,
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        fontFamily: 'Inter, sans-serif',
        userSelect: 'none',
        background: v.bg,
        color: v.color,
        border: v.border || 'none',
        boxShadow: variant === 'pro' ? '0 0 12px rgba(245,166,35,0.25)' : 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {label || v.text}
    </span>
  );
};

export default Badge;
