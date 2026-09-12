/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // FORGE 3D Signature Industrial Forge Amber
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#151f30',
          900: '#0f172a', // Deep Charcoal Slate
          950: '#090d16',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1.05rem' }],
        'xs': ['0.825rem', { lineHeight: '1.25rem' }],
        'sm': ['0.95rem', { lineHeight: '1.45rem' }],
        'base': ['1.075rem', { lineHeight: '1.65rem' }],
        'lg': ['1.22rem', { lineHeight: '1.75rem' }],
        'xl': ['1.4rem', { lineHeight: '1.85rem' }],
        '2xl': ['1.7rem', { lineHeight: '2.15rem' }],
        '3xl': ['2.15rem', { lineHeight: '2.5rem' }],
        '4xl': ['2.65rem', { lineHeight: '2.95rem' }],
        '5xl': ['3.4rem', { lineHeight: '1.15' }],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 16px -2px rgba(15, 23, 42, 0.05), 0 2px 4px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 12px 28px -4px rgba(15, 23, 42, 0.1), 0 4px 8px -2px rgba(15, 23, 42, 0.04)',
        'brand-glow': '0 0 25px -4px rgba(249, 115, 22, 0.35)',
        'cobalt-glow': '0 0 25px -4px rgba(249, 115, 22, 0.35)',
      },
      maxWidth: {
        'page': '1380px',
      }
    },
  },
  plugins: [],
}
