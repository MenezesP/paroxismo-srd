/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./js/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: '#050505',
        abyss: '#0a0a0a',
        blood: '#e21b23',
        iron: '#161616',
        steel: '#8e95a5'
      }
    }
  },
  plugins: [],
};