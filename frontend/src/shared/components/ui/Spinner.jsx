// Spinner — multiple variants for different loading contexts
/**
 * Spinner
 * @param {'ring'|'dots'|'bars'|'reel'} variant
 * @param {'sm'|'md'|'lg'|'xl'} size
 * @param {string} color
 * @param {string} className
 */
const Spinner = ({ variant = 'ring', size = 'md', color = '#e8102a', className = '' }) => {
  const sizes = { sm: 20, md: 32, lg: 48, xl: 64 };
  const px = sizes[size] || sizes.md;

  if (variant === 'dots') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`} role="status" aria-label="Loading">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: px / 4,
              height: px / 4,
              borderRadius: '50%',
              background: color,
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className={`flex items-end gap-1 ${className}`} role="status" aria-label="Loading" style={{ height: px }}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              width: px / 6,
              background: color,
              borderRadius: 2,
              animation: `pulse 1s ease-in-out ${i * 0.1}s infinite`,
              height: `${[60, 100, 80, 40][i]}%`,
            }}
          />
        ))}
      </div>
    );
  }

  // Default: ring
  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{
        width: px,
        height: px,
        borderRadius: '50%',
        border: `${Math.max(2, px / 12)}px solid rgba(255,255,255,0.1)`,
        borderTopColor: color,
        animation: 'spin 0.8s linear infinite',
        flexShrink: 0,
      }}
    />
  );
};

export default Spinner;
