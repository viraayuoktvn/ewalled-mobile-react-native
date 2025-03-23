/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["OpenSans_Regular", "sans-serif"],
        bold: ["OpenSans_Bold", "sans-serif"],
      },
    },
  },
  darkMode: "class", // Tambahkan ini
};