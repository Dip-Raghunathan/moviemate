// Premium Toggle — accessible switch replacing the raw button[role=switch]
/**
 * Toggle
 * @param {boolean} checked
 * @param {function} onChange
 * @param {boolean} disabled
 * @param {string} label
 * @param {string} id
 */
const Toggle = ({ checked, onChange, disabled = false, label, id, className = '' }) => {
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) onChange(!checked);
    }
  };

  return (
    <button
      id={id}
      role="switch"
      type="button"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      tabIndex={0}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={handleKeyDown}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        background: 'none',
        border: 'none',
        padding: 0,
        outline: 'none',
      }}
    >
      {/* Track */}
      <div
        style={{
          width: 44,
          height: 24,
          borderRadius: 9999,
          background: checked ? '#e8102a' : 'rgba(255,255,255,0.15)',
          boxShadow: checked ? '0 0 12px rgba(232,16,42,0.4)' : 'none',
          position: 'relative',
          transition: 'background 250ms cubic-bezier(0.4,0,0.2,1), box-shadow 250ms ease',
          flexShrink: 0,
        }}
      >
        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: 3,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform 250ms cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>
    </button>
  );
};

export default Toggle;
