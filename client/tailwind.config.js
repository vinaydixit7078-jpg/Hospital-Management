/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          600: 'var(--primary-hover)'
        },
        base: 'var(--bg-base)',
        card: 'var(--bg-card)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        heading: 'var(--text-heading)',
        body: 'var(--text-body)',
        muted: 'var(--text-muted)',
        secondary: 'var(--secondary)',
        clinic: {
          light: '#F8FAFC',
          lighter: '#F9FAFB',
          card: '#FFFFFF',
          border: '#E2E8F0'
        },
        status: {
          confirmed: '#16A34A',
          pending: '#D97706',
          cancelled: '#DC2626',
          info: '#3B82F6',
          purple: '#7C3AED'
        },
        muted: {
          500: '#64748B',
          400: '#94A3B8'
        }
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem'
      },
      boxShadow: {
        soft: 'var(--shadow-soft)'
      }
    },
  },
  plugins: [],
};
