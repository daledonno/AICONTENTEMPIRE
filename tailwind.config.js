/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
          700: '#2A2A2A',
          750: '#232323',
          800: '#1A1A1A',
          900: '#121212',
        },
      },
    },
  },
  plugins: [],
}