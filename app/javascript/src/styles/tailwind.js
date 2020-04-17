// https://tailwindcss.com/docs/theme/

const { lighten, darken } = require('polished')

const baseGray = '#ccc'
let grayColors = {}

const nums = [
  { label:100, amount: 0},
  { label:200, amount: 0.06},
  { label:300, amount: 0.2},
  { label:400, amount: 0.3},
  { label:500, amount: 0.4},
  { label:600, amount: 0.5},
  { label:700, amount: 0.6},
  { label:800, amount: 0.7},
  { label:900, amount: 0.8}
]
nums.map(
  (c) => {
    grayColors[c.label] = darken(c.amount, '#f7f7f7')
})

module.exports = {
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    fontFamily: {
      display: ['Inter', 'sans-serif'],
      body: ['Inter', 'sans-serif'],
    },
    borderWidth: {
      default: '1px',
      '0': '0',
      '2': '2px',
      '4': '4px',
    },
    extend: {
      colors: {
        cyan: '#9cdbff',
        gray: grayColors,
        /*gray: {
          100: '#f7f7f7',
          200: '#e8e8e8',
          300: '#e2e8f0',
          400: '#cbd5e0',
          500: '#a0aec0',
          600: '#718096',
          700: '#4a5568',
          800: '#2d3748',
          900: '#1a202c'
        }*/
      },
      spacing: {
        '96': '24rem',
        '128': '32rem',
      }
    }
  },
  variants: {},
  plugins: []
}
