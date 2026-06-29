import { useState } from 'react';

// Avatar component — gradient initials, online indicator, size variants
const GRADIENT_PALETTES = [
  'linear-gradient(135deg, #e8102a, #ff5f6a)',
  'linear-gradient(135deg, #3b82f6, #6366f1)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #f59e0b, #f5a623)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
];

const SIZES = {
  xs:  { box: 28,  font: 11, ring: 2, dot: 8  },
  sm:  { box: 36,  font: 13, ring: 2, dot: 9  },
  md:  { box: 44,  font: 16, ring: 2, dot: 10 },
  lg:  { box: 56,  font: 20, ring: 3, dot: 12 },
  xl:  { box: 72,  font: 26, ring: 3, dot: 14 },
  '2xl':{ box: 96, font: 34, ring: 4, dot: 16 },
  '3xl':{ box: 128,font: 46, ring: 4, dot: 20 },
};

/**
 * Avatar
 * @param {string} name - User's full name (used for initials and gradient)
 * @param {string} src  - Optional image URL
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'} size
 * @param {'online'|'away'|'offline'|null} status - Online indicator
 * @param {boolean} ring - Show a colored ring around avatar
 * @param {string} className
 */
const Avatar = ({ name = '?', src, size = 'md', status, ring = false, className = '', style = {} }) => {
  const [imgError, setImgError] = useState(false);
  const s = SIZES[size] || SIZES.md;
  const initial = (name || '?')[0].toUpperCase();
  // Deterministic color based on name
  const paletteIndex = (name || '').charCodeAt(0) % GRADIENT_PALETTES.length;
  const gradient = GRADIENT_PALETTES[paletteIndex];

  const STATUS_COLORS = { online: '#10b981', away: '#f59e0b', offline: 'rgba(255,255,255,0.2)' };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Ring */}
      {ring && (
        <div style={{
          position: 'absolute', inset: `-${s.ring + 2}px`,
          background: 'linear-gradient(135deg, #e8102a, #ff5f6a)',
          borderRadius: '50%',
          zIndex: 0,
        }} />
      )}
      {ring && (
        <div style={{
          position: 'absolute', inset: `-${s.ring - 1}px`,
          background: '#0d0d1a',
          borderRadius: '50%',
          zIndex: 1,
        }} />
      )}

      {/* Avatar body */}
      <div
        aria-label={name}
        style={{
          width: s.box,
          height: s.box,
          borderRadius: '50%',
          background: src ? 'transparent' : gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: s.font,
          fontWeight: 700,
          fontFamily: 'Outfit, Inter, sans-serif',
          color: 'white',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2,
          flexShrink: 0,
          userSelect: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        {src && !imgError ? (
          <img src={src} alt={name} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          initial
        )}
      </div>

      {/* Status dot */}
      {status && (
        <div style={{
          position: 'absolute',
          bottom: ring ? 2 : 0,
          right: ring ? 2 : 0,
          width: s.dot,
          height: s.dot,
          borderRadius: '50%',
          background: STATUS_COLORS[status] || STATUS_COLORS.offline,
          border: `2px solid #0d0d1a`,
          zIndex: 3,
          boxShadow: status === 'online' ? '0 0 6px rgba(16,185,129,0.6)' : 'none',
        }} />
      )}
    </div>
  );
};

export default Avatar;
