import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../core/contexts/ToastContext';
import UniversalLoadingBar from './ui/UniversalLoadingBar';
import CommandPalette from './ui/CommandPalette';
import ContextMenu from './ui/ContextMenu';

const GlobalContainer = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  // 1. Scroll Restoration & Universal Loading Bar Simulation
  useEffect(() => {
    // Scroll to top instantly
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Universal top loading bar animation
    setLoadingProgress(10);
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 80);

    const finishTimeout = setTimeout(() => {
      clearInterval(interval);
      setLoadingProgress(100);
      setTimeout(() => setLoadingProgress(0), 200);
    }, 350);

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimeout);
    };
  }, [location.pathname]);

  // 2. Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle Command Palette (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }

      // Quick Navigations (Alt + Key)
      if (e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'd') {
          e.preventDefault();
          navigate('/dashboard');
        } else if (key === 'p') {
          e.preventDefault();
          navigate('/profile');
        } else if (key === 's') {
          e.preventDefault();
          navigate('/search');
        } else if (key === 'c') {
          e.preventDefault();
          navigate('/communities');
        } else if (key === 'e') {
          e.preventDefault();
          navigate('/events');
        } else if (key === '?') {
          e.preventDefault();
          setGuideOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <>
      {/* Top Universal Loader */}
      <UniversalLoadingBar progress={loadingProgress} />

      {/* Handcrafted Context Menu */}
      <ContextMenu
        onOpenPalette={() => setPaletteOpen(true)}
        onOpenShortcuts={() => setGuideOpen(true)}
        toast={toast}
      />

      {/* Global Command Palette */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Keyboard Shortcuts Guide Dialog Modal */}
      {guideOpen && (
        <div
          onClick={() => setGuideOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999995,
            animation: 'fadeIn 200ms ease forwards',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '90%',
              maxWidth: '450px',
              background: 'rgba(13, 13, 26, 0.96)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 20,
              padding: '24px 28px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              animation: 'slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#f0f0fa', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 16px 0' }}>
              ⌨️ Keyboard Shortcuts Guide
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#6b6b85', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              PhilixMate features premium navigation hooks. Use these combinations to move faster:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {[
                { keys: 'Ctrl + K', desc: 'Toggle Command Palette' },
                { keys: 'Alt + D', desc: 'Navigate to Cinema Match Dashboard' },
                { keys: 'Alt + S', desc: 'Navigate to Search Catalog' },
                { keys: 'Alt + C', desc: 'Navigate to Communities' },
                { keys: 'Alt + E', desc: 'Navigate to Events' },
                { keys: 'Alt + P', desc: 'Navigate to User Profile' },
                { keys: 'Alt + ?', desc: 'Toggle this Shortcuts Guide' },
              ].map((shortcut) => (
                <div
                  key={shortcut.keys}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 8,
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    fontSize: '0.8125rem'
                  }}
                >
                  <span style={{ color: '#a8a8c0' }}>{shortcut.desc}</span>
                  <kbd style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    color: '#f5a623',
                    fontFamily: 'monospace',
                    fontWeight: 700
                  }}>
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>

            <button
              onClick={() => setGuideOpen(false)}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#f0f0fa',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 200ms ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              Dismiss Guide
            </button>
          </div>
        </div>
      )}

      {/* Main app contents */}
      {children}
    </>
  );
};

export default GlobalContainer;
