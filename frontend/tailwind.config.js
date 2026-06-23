/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#141414',
        'primary-red': '#E50914',
        'primary-hover': '#b81d24',
        'text-light': '#f5f5f5',
        'text-muted': '#aaaaaa',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      backdropBlur: {
        glass: '12px',
      },
      borderRadius: {
        card: '16px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease forwards',
        spin: 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
};
