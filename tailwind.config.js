/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {

    extend: {
      colors: {
        // dark1: 'rgb(56,60,74)',
        // dark2: 'rgb(42,46,56)',
        dark1: '#222',
        dark2: '#111',
        softBlue: 'rgb(0,149,246)'
      },
      spacing: {
        'story': '52px'
      },
      fontFamily: {
        merriweather: ['Merriweather', 'sans-serif']
      },
      screens: {
        'xs': '480px'
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp')
  ],
}