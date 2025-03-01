/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',  // Enable dark mode by default (class-based for explicit control)
  theme: {
    extend: {
      colors: {
        purple: {
          500: '#5B3AC8',
          600: '#4E31B0',
          700: '#412A94',
          900: '#3A2080',
        },
        teal: {
          500: '#0BC5B6',
          600: '#09A69A',
        },
        gray: {
          100: '#f7fafc',  // Lightest gray (optional for contrast)
          200: '#edf2f7',
          300: '#e2e8f0',
          400: '#a0aec0',  // For secondary text, borders
          500: '#718096',
          600: '#4a5568',
          700: '#2A2A2A',  // Your existing gray-700
          750: '#232323',  // Your existing gray-750
          800: '#1A1A1A',  // Your existing gray-800
          900: '#121212',  // Your existing gray-900 (background)
        },
        green: {
          400: '#48bb78',  // For growth metrics (e.g., +18%)
        },
        red: {
          600: '#e53e3e',  // For potential negative metrics (optional)
        },
        yellow: {
          400: '#d69e2e',  // For warnings or other indicators (optional)
        },
      },
    },
  },
  plugins: [],
};