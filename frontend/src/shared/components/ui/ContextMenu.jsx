import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PremiumIcon } from '../icons/IconComponents';

const ContextMenu = ({ onOpenPalette, onOpenShortcuts, toast }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);

  useEffect(() => {
    const handleContextMenu = (e) => {
      // Exclude text input fields so user can copy-paste normally
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) {
        return;
      }
      e.preventDefault();
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setVisible(false);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setVisible(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  if (!visible) return null;

  const handleAction = (type) => {
    setVisible(false);
    if (type === 'copy-url') {
      navigator.clipboard.writeText(window.location.href);
      toast?.success('Page URL copied to clipboard!', 'Share URL');
    } else if (type === 'clear-cache') {
      // Mock clearing caches
      localStorage.removeItem('api_cache');
      toast?.success('Local cache storage purged successfully.', 'Cache Cleared');
    } else if (type === 'home') {
      navigate('/dashboard');
    } else if (type === 'profile') {
      navigate('/profile');
    } else if (type === 'palette') {
      onOpenPalette();
    } else if (type === 'shortcuts') {
      onOpenShortcuts();
    }
  };

  // Adjust position to keep menu inside viewport bounds
  const x = Math.min(position.x, window.innerWidth - 190);
  const y = Math.min(position.y, window.innerHeight - 220);

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Context Menu"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        background: 'rgba(13, 13, 26, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 14,
        padding: '6px',
        width: 180,
        boxShadow: '0 8px 32px rgba(0,0,0,0.65), 0 2px 10px rgba(0,0,0,0.3)',
        zIndex: 999999,
        animation: 'fadeIn 120ms ease forwards',
      }}
    >
      {[
        { label: 'Open Palette', icon: 'rocket', action: 'palette' },
        { label: 'Go to Profile', icon: 'user', action: 'profile' },
        { label: 'Movie Dashboard', icon: 'movie', action: 'home' },
        { label: 'Copy URL', icon: 'verified', action: 'copy-url' },
        { label: 'Purge Page Cache', icon: 'cross', action: 'clear-cache' },
        { label: 'Shortcuts Guide', icon: 'key', action: 'shortcuts' },
      ].map((item, idx) => {
        const buttonContent = (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PremiumIcon name={item.icon} size={14} color="currentColor" />
            {item.label}
          </span>
        );

        if (idx === 3) {
          // Divider
          return (
            <React.Fragment key={item.action}>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
              <button
                role="menuitem"
                onClick={() => handleAction(item.action)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  color: '#a8a8c0',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '8px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#f0f0fa'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#a8a8c0'; }}
              >
                {buttonContent}
              </button>
            </React.Fragment>
          );
        }
        return (
          <button
            key={item.action}
            role="menuitem"
            onClick={() => handleAction(item.action)}
            style={{
              width: '100%',
              textAlign: 'left',
              background: 'none',
              border: 'none',
              color: '#a8a8c0',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#f0f0fa'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#a8a8c0'; }}
          >
            {buttonContent}
          </button>
        );
      })}
    </div>
  );
};

export default ContextMenu;
