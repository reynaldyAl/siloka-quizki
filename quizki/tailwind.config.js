/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e40af", // Deep blue
        secondary: "#4f46e5", // Indigo
        accent: "#7c3aed", // Purple
      },
    },
  },
  plugins: [],
}