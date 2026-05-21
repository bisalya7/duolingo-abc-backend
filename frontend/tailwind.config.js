/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF4B4B",    
        secondary: "#4B96FF",   
        success: "#32C832",    
        warning: "#FFD200",  
        background: "#F7F9FC",  
      },
      fontFamily: {
        sans: ['"Nunito"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}