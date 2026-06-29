// Skeleton — shimmer loading placeholder
/**
 * Skeleton
 * @param {string} className
 * @param {string|number} width
 * @param {string|number} height
 * @param {'rect'|'circle'|'text'} variant
 * @param {number} lines - number of text lines (for 'text' variant)
 */
const Skeleton = ({ className = '', width, height, variant = 'rect', lines = 3, style = {} }) => {
  const baseStyle = {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.8s ease-in-out infinite',
    borderRadius: variant === 'circle' ? '50%' : '8px',
    ...style,
  };

  if (variant === 'circle') {
    const sz = width || height || 40;
    return (
      <div
        className={className}
        style={{ ...baseStyle, width: sz, height: sz, borderRadius: '50%', flexShrink: 0 }}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex flex-col gap-2 ${className}`} aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            style={{
              ...baseStyle,
              height: height || 16,
              width: i === lines - 1 ? '60%' : (width || '100%'),
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{ ...baseStyle, width: width || '100%', height: height || 16 }}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
