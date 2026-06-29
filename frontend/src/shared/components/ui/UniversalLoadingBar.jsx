import React from 'react';

/**
 * UniversalLoadingBar — Handcrafted glowing top-of-page loader.
 * @param {number} progress - Value from 0 to 100
 */
const UniversalLoadingBar = ({ progress = 0 }) => {
  const visible = progress > 0 && progress < 100;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 99999,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms ease-out',
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #e8102a 0%, #ff5f6a 50%, #f5a623 100%)',
          boxShadow: '0 1px 10px rgba(232,16,42,0.6), 0 0 4px rgba(245,166,35,0.4)',
          transition: progress === 0 ? 'none' : 'width 300ms cubic-bezier(0.1, 0.8, 0.3, 1)',
        }}
      />
    </div>
  );
};

export default UniversalLoadingBar;
