/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAF8F5',
        taupe: {
          DEFAULT: '#C4A882',
          50: '#FAF6EF',
          100: '#F2EADC',
          200: '#E4D6BC',
          300: '#D6C29C',
          400: '#C4A882',
          500: '#AD8E66',
          600: '#8E7351',
          700: '#6B563D'
        },
        ink: '#1C1C1E',
        blush: {
          DEFAULT: '#F0D9D0',
          50: '#FBF4F1',
          100: '#F0D9D0',
          200: '#E5BFB1',
          300: '#D9A492'
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(28, 28, 30, 0.18)',
        lift: '0 24px 60px -28px rgba(28, 28, 30, 0.30)'
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'slide-up': {
          '0%': { transform: 'translateY(24px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 260ms cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-in-right': 'slide-in-right 280ms cubic-bezier(0.22, 1, 0.36, 1)'
      }
    }
  },
  plugins: []
};
