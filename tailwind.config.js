/** @type {import('tailwindcss').Config} */
const Colors = require('./constants/colors');

module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: Colors.primary,
        accent: Colors.accent,
        card: Colors.card,
        text: Colors.text,
      },
      fontFamily: {
        sans: ['Rubik_400Regular'],
        medium: ['Rubik_500Medium'],
        bold: ['Rubik_700Bold'],
      },
    },
  },
  plugins: [],
};
