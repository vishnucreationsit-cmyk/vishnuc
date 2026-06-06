/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          900: '#0c4a6e',
        },
        leather: {
          900: '#2c1e16',
          800: '#4a3325',
          700: '#5c3a21',
          600: '#755139',
          500: '#8b5a2b',
          400: '#a67b5b',
          100: '#f5efe6',
        },
        gold: {
          600: '#B8860B',
          500: '#D4AF37',
          400: '#F3E5AB',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
