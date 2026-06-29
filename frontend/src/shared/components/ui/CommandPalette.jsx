import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PremiumIcon } from '../icons/IconComponents';

const OPTIONS = [
  { id: 'dashboard', category: 'Navigation', label: 'Find Companion (Dashboard)', path: '/dashboard' },
  { id: 'search', category: 'Navigation', label: 'Search Movie Catalog', path: '/search' },
  { id: 'communities', category: 'Navigation', label: 'Movie Communities', path: '/communities' },
  { id: 'events', category: 'Navigation', label: 'Screening Events', path: '/events' },
  { id: 'profile', category: 'Navigation', label: 'View My Profile', path: '/profile' },
  { id: 'sessions', category: 'Security', label: 'Manage Active Sessions', path: '/sessions' },
  { id: 'upgrade', category: 'Billing', label: 'Upgrade to PhilixMate Pro', path: '/upgrade' },
  { id: 'contrast', category: 'Accessibility', label: 'Toggle High Contrast Filter', action: 'toggle-contrast' },
  { id: 'motion', category: 'Accessibility', label: 'Toggle Reduced Motion Mode', action: 'toggle-motion' },
];

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = OPTIONS.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    opt.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option) => {
    if (option.path) {
      navigate(option.path);
      onClose();
    } else if (option.action) {
      if (option.action === 'toggle-contrast') {
        const hc = document.body.style.filter === 'contrast(1.2) saturate(1.1)';
        document.body.style.filter = hc ? '' : 'contrast(1.2) saturate(1.1)';
      } else if (option.action === 'toggle-motion') {
        const rm = document.documentElement.style.scrollBehavior === 'auto';
        document.documentElement.style.scrollBehavior = rm ? 'smooth' : 'auto';
      }
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) {
        handleSelect(filtered[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        zIndex: 99990,
        animation: 'fadeIn 200ms ease forwards',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        style={{
          width: '90%',
          maxWidth: '600px',
          background: 'rgba(13, 13, 26, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
          overflow: 'hidden',
          animation: 'slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <PremiumIcon name="key" size={18} color="#6b6b85" style={{ marginRight: 12 }} />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls="command-palette-listbox"
            aria-activedescendant={filtered[activeIndex] ? 'opt-' + filtered[activeIndex].id : undefined}
            placeholder="Type a command or page name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f0f0fa',
              fontSize: '1rem',
              fontFamily: 'Inter, sans-serif',
            }}
          />
        </div>

        {/* Options List */}
        <div 
          id="command-palette-listbox"
          role="listbox"
          aria-label="Commands"
          style={{ maxHeight: '350px', overflowY: 'auto', padding: 8 }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6b6b85', fontSize: '0.875rem' }}>
              No commands found. Try 'profile' or 'search'.
            </div>
          ) : (
            filtered.map((opt, i) => {
              const active = activeIndex === i;
              return (
                <div
                  key={opt.id}
                  id={'opt-' + opt.id}
                  role="option"
                  aria-selected={active}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setActiveIndex(i)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    background: active ? 'rgba(232, 16, 42, 0.1)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(232, 16, 42, 0.2)' : 'transparent'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 150ms ease',
                  }}
                >
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#ff6b7a' : '#a8a8c0',
                  }}>
                    {opt.label}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: active ? 'rgba(232, 16, 42, 0.5)' : '#4a4a60',
                    fontWeight: 700,
                  }}>
                    {opt.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div style={{
          padding: '10px 20px',
          background: 'rgba(0,0,0,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: '#4a4a60',
        }}>
          <span>Use <kbd style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 4px', borderRadius: 4 }}>↑↓</kbd> to navigate, <kbd style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 4px', borderRadius: 4 }}>Enter</kbd> to select</span>
          <span>Press <kbd style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 4px', borderRadius: 4 }}>Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
