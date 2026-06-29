/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      // ─── ENTERPRISE COLOR SYSTEM ──────────────────────────────────────────
      colors: {
        // Base layers
        void:       '#05050a',
        'bg-deep':  '#080810',
        'bg-base':  '#0d0d1a',
        'bg-raised':'#111122',
        'bg-card':  '#141428',
        'bg-float': '#1a1a35',

        // Surface / Glass
        surface:    'rgba(255,255,255,0.04)',
        'surface-2':'rgba(255,255,255,0.07)',
        'surface-3':'rgba(255,255,255,0.11)',
        glass:      'rgba(255,255,255,0.06)',
        'glass-2':  'rgba(255,255,255,0.10)',
        'glass-border':'rgba(255,255,255,0.10)',
        'glass-border-2':'rgba(255,255,255,0.16)',

        // Brand — Crimson Cinema
        primary: {
          DEFAULT: '#e8102a',
          50:  '#fff1f2',
          100: '#ffe1e3',
          200: '#ffc8cc',
          300: '#ff9aa1',
          400: '#ff5f6a',
          500: '#e8102a',
          600: '#d10d24',
          700: '#b00a1e',
          800: '#930c1b',
          900: '#7a0e19',
          950: '#42050c',
        },

        // Accent — Cinematic Gold
        accent: {
          DEFAULT: '#f5a623',
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f5a623',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },

        // Signal colors
        success: {
          DEFAULT: '#10b981',
          light:   '#34d399',
          muted:   'rgba(16,185,129,0.15)',
          border:  'rgba(16,185,129,0.25)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light:   '#fbbf24',
          muted:   'rgba(245,158,11,0.15)',
          border:  'rgba(245,158,11,0.25)',
        },
        danger: {
          DEFAULT: '#ef4444',
          light:   '#f87171',
          muted:   'rgba(239,68,68,0.15)',
          border:  'rgba(239,68,68,0.25)',
        },
        info: {
          DEFAULT: '#3b82f6',
          light:   '#60a5fa',
          muted:   'rgba(59,130,246,0.15)',
          border:  'rgba(59,130,246,0.25)',
        },

        // Typography
        'text-primary':   '#f0f0fa',
        'text-secondary': '#a8a8c0',
        'text-muted':     '#6b6b85',
        'text-subtle':    '#4a4a60',
        'text-disabled':  '#35354a',

        // Interactive states
        hover:    'rgba(255,255,255,0.06)',
        pressed:  'rgba(255,255,255,0.03)',
        focus:    'rgba(232,16,42,0.35)',
        disabled: 'rgba(255,255,255,0.12)',

        // Gradients (used as bg colors in some contexts)
        'grad-start': '#e8102a',
        'grad-end':   '#ff5f6a',

        // Avatar palette
        'avatar-1': '#e8102a',
        'avatar-2': '#3b82f6',
        'avatar-3': '#10b981',
        'avatar-4': '#f59e0b',
        'avatar-5': '#8b5cf6',
        'avatar-6': '#ec4899',
      },

      // ─── TYPOGRAPHY SYSTEM ────────────────────────────────────────────────
      fontFamily: {
        display: ['Outfit', 'Inter', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs':      ['0.75rem',  { lineHeight: '1rem',    letterSpacing: '0.025em' }],
        'sm':      ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em'  }],
        'base':    ['1rem',     { lineHeight: '1.5rem',  letterSpacing: '0'       }],
        'lg':      ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'xl':      ['1.25rem',  { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl':     ['1.5rem',   { lineHeight: '2rem',    letterSpacing: '-0.02em' }],
        '3xl':     ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl':     ['2.25rem',  { lineHeight: '2.5rem',  letterSpacing: '-0.03em' }],
        '5xl':     ['3rem',     { lineHeight: '1',       letterSpacing: '-0.03em' }],
        '6xl':     ['3.75rem',  { lineHeight: '1',       letterSpacing: '-0.04em' }],
        '7xl':     ['4.5rem',   { lineHeight: '1',       letterSpacing: '-0.04em' }],
        '8xl':     ['6rem',     { lineHeight: '1',       letterSpacing: '-0.05em' }],
        'display': ['7rem',     { lineHeight: '0.9',     letterSpacing: '-0.06em' }],
      },

      // ─── SPACING (8-point grid) ───────────────────────────────────────────
      spacing: {
        '0.5': '4px',
        '1':   '8px',
        '1.5': '12px',
        '2':   '16px',
        '2.5': '20px',
        '3':   '24px',
        '4':   '32px',
        '5':   '40px',
        '6':   '48px',
        '7':   '56px',
        '8':   '64px',
        '9':   '72px',
        '10':  '80px',
        '11':  '88px',
        '12':  '96px',
        '14':  '112px',
        '16':  '128px',
        '20':  '160px',
        '24':  '192px',
        '28':  '224px',
        '32':  '256px',
      },

      // ─── BORDER RADIUS ────────────────────────────────────────────────────
      borderRadius: {
        'none':  '0',
        'xs':    '4px',
        'sm':    '8px',
        DEFAULT: '12px',
        'md':    '12px',
        'lg':    '16px',
        'xl':    '20px',
        '2xl':   '24px',
        '3xl':   '32px',
        '4xl':   '40px',
        'pill':  '9999px',
        'card':  '20px',
        'modal': '28px',
      },

      // ─── BOX SHADOWS ─────────────────────────────────────────────────────
      boxShadow: {
        'none':     'none',
        'xs':       '0 1px 2px rgba(0,0,0,0.4)',
        'sm':       '0 2px 8px rgba(0,0,0,0.5)',
        'md':       '0 4px 16px rgba(0,0,0,0.5)',
        'lg':       '0 8px 32px rgba(0,0,0,0.6)',
        'xl':       '0 16px 48px rgba(0,0,0,0.7)',
        '2xl':      '0 24px 64px rgba(0,0,0,0.8)',
        'card':     '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
        'float':    '0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
        'modal':    '0 24px 80px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.5)',
        'glow':     '0 0 20px rgba(232,16,42,0.3), 0 0 60px rgba(232,16,42,0.1)',
        'glow-sm':  '0 0 12px rgba(232,16,42,0.25)',
        'glow-lg':  '0 0 40px rgba(232,16,42,0.4), 0 0 100px rgba(232,16,42,0.15)',
        'glow-accent':'0 0 20px rgba(245,166,35,0.3)',
        'inner':    'inset 0 2px 8px rgba(0,0,0,0.5)',
        'inset-glow':'inset 0 0 24px rgba(232,16,42,0.08)',
        'cinematic':'0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.6), 0 32px 80px rgba(0,0,0,0.4)',
      },

      // ─── BACKDROP BLUR ───────────────────────────────────────────────────
      backdropBlur: {
        'none': '0',
        'xs':   '4px',
        'sm':   '8px',
        DEFAULT:'12px',
        'md':   '16px',
        'lg':   '24px',
        'xl':   '40px',
        '2xl':  '64px',
        'glass':'12px',
        'frost':'20px',
      },

      // ─── ANIMATIONS & KEYFRAMES ───────────────────────────────────────────
      keyframes: {
        // Entrance
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInFast: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%':   { opacity: '0', transform: 'translateX(32px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-32px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Loading
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        spin: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        ping: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        // Decorative
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':      { transform: 'translateY(-8px) rotate(2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(232,16,42,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(232,16,42,0.6)' },
        },
        radarPing: {
          '0%':   { transform: 'scale(0)', opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        gradientShift: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        // Toast
        slideInRight: {
          '0%':   { transform: 'translateX(110%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          '0%':   { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(110%)', opacity: '0' },
        },
        // Confetti
        confettiFall: {
          '0%':   { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        // Typewriter cursor
        blink: {
          '0%, 100%': { borderColor: 'transparent' },
          '50%':      { borderColor: 'currentColor' },
        },
        // Number counter
        countUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      animation: {
        // Entrance
        'fade-in':       'fadeIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in-fast':  'fadeInFast 0.3s ease forwards',
        'slide-up':      'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-down':    'slideDown 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-left':    'slideLeft 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-right':   'slideRight 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'scale-in':      'scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        // Loading
        'shimmer':       'shimmer 2s linear infinite',
        'spin':          'spin 1s linear infinite',
        'spin-slow':     'spin 3s linear infinite',
        'ping':          'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
        'pulse':         'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        // Decorative
        'float':         'float 4s ease-in-out infinite',
        'float-slow':    'floatSlow 6s ease-in-out infinite',
        'pulse-glow':    'pulseGlow 2s ease-in-out infinite',
        'radar-ping':    'radarPing 2s ease-out infinite',
        'gradient-shift':'gradientShift 6s ease infinite',
        // UI
        'slide-in-right':'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-out-right':'slideOutRight 0.3s ease-in forwards',
        'confetti-fall': 'confettiFall 3s ease-in forwards',
        'blink':         'blink 1s step-end infinite',
        'count-up':      'countUp 0.5s ease forwards',
      },

      // ─── TRANSITIONS ─────────────────────────────────────────────────────
      transitionTimingFunction: {
        'spring':    'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth':    'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '700': '700ms',
      },

      // ─── Z-INDEX ─────────────────────────────────────────────────────────
      zIndex: {
        'below':  '-1',
        'base':   '0',
        'raised': '10',
        'nav':    '40',
        'modal':  '50',
        'toast':  '60',
        'tip':    '70',
      },

      // ─── MISC ─────────────────────────────────────────────────────────────
      maxWidth: {
        'screen-xs': '480px',
        'screen-sm': '640px',
        'screen-md': '768px',
        'screen-lg': '1024px',
        'screen-xl': '1280px',
        'content':   '1200px',
        'narrow':    '640px',
        'wide':      '1400px',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl':'1536px',
        '3xl':'1920px',
      },
    },
  },
  plugins: [],
};
