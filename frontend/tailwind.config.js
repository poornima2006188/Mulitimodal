/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#07121E',
          900: '#0B1B2B',
          800: '#13283E',
          700: '#1D3B5A',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        clinical: {
          bg: '#F5F8FB',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          subtle: '#F8FAFC',
          border: '#E2E8F0',
          borderDark: '#243242',
          text: '#0B1B2B',
          muted: '#64748B',
          primary: '#0D9488',
          primaryHover: '#0F766E',
          primaryLight: '#F0FDFA'
        }
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(11, 27, 43, 0.04), 0 1px 2px -1px rgba(11, 27, 43, 0.04)',
        'card': '0 2px 6px -1px rgba(11, 27, 43, 0.05), 0 1px 4px -2px rgba(11, 27, 43, 0.03)',
        'float': '0 10px 25px -5px rgba(11, 27, 43, 0.08), 0 8px 10px -6px rgba(11, 27, 43, 0.04)',
      }
    },
  },
  plugins: [],
}
