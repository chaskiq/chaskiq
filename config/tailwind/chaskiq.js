const colors = require('tailwindcss/colors');

const colorTheme = {
  brand: '#2668eb',
  'gradientHero': {
    100: '#2668eb',
    200: '#1e4abb',
    DEFAULT: '#04309d',
  },
  transparent: 'transparent',
  current: 'currentColor',
  black: "#101114",
  white: colors.white,
  gray: colors.stone,
  indigo: colors.indigo,
  red: colors.rose,
  green: colors.emerald,
  yellow: colors.amber,
  tahiti: {
    light: '#67e8f9',
    DEFAULT: '#06b6d4',
    dark: '#0e7490',
  }
}

const grayColors = {}

module.exports = {
  colorTheme, grayColors, colors
}
