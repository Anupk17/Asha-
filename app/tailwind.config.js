/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          900: '#0B4F4A',
          700: '#136B64',
          100: '#E4EFEC',
        },
        saffron: {
          500: '#E8833A',
          100: '#FBE3CF',
        },
        cream: '#FAF6EE',
        surface: '#FFFFFF',
        ink: '#1F2A2A',
        muted: '#5B6B6A',
        line: '#D9D3C5',
        danger: '#C0392B',
        success: '#2E7D4F',
      },
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '28px',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(11, 79, 74, 0.06), 0 1px 4px -1px rgba(11, 79, 74, 0.04)',
        card: '0 4px 14px 0 rgba(31, 42, 42, 0.06)',
      },
      spacing: {
        'touch': '56px',
        'mic': '96px',
      }
    },
  },
  plugins: [],
}

