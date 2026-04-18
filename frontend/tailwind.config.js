/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pup-red': '#8B0000',
        'pup-gold': '#FFD700',
        'pup-blue': '#003366',
      },
    },
  },
  plugins: [],
}