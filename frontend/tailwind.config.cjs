/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // dùng class .dark trên html
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
