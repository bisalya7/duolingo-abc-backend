/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF4B4B",     // Красный (как у Duolingo)
        secondary: "#4B96FF",   // Синий
        success: "#32C832",     // Зеленый
        warning: "#FFD200",     // Желтый
        background: "#F7F9FC",  // Светло-серый фон
      },
      fontFamily: {
        sans: ['"Nunito"', 'sans-serif'], // Округлый, добрый шрифт
      }
    },
  },
  plugins: [],
}