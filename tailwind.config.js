/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#2a8a7e',
          light: '#359f91',
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}