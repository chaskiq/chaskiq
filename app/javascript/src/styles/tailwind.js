// https://tailwindcss.com/docs/theme/

const { lighten, darken } = require('polished')

const baseGray = '#ccc'
const grayColors = {}

const nums = [
  { label: 100, amount: 0 },
  { label: 200, amount: 0.06 },
  { label: 300, amount: 0.2 },
  { label: 400, amount: 0.3 },
  { label: 500, amount: 0.4 },
  { label: 600, amount: 0.5 },
  { label: 700, amount: 0.6 },
  { label: 800, amount: 0.7 },
  { label: 900, amount: 0.8 }
]
/* nums.map(
  (c) => {
    grayColors[c.label] = darken(c.amount, '#f7f7f7')
  }) */

module.exports = {
  darkMode: 'media',
  experimental: {},
  theme: {
    minWidth: {
      0: '0',
      '1/4': '25%',
      '1/2': '50%',
      '3/4': '75%',
      full: '100%'
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px'
    },
    fontFamily: {
      display: ['Inter', 'sans-serif'],
      body: ['Inter', 'sans-serif']
    },
    /* borderWidth: {
      default: '1px',
      0: '0',
      2: '2px',
      4: '4px'
    }, */
    extend: {
      colors: {
        cyan: '#9cdbff',
        gray: grayColors
        /* gray: {
          100: '#f7f7f7',
          200: '#e8e8e8',
          300: '#e2e8f0',
          400: '#cbd5e0',
          500: '#a0aec0',
          600: '#718096',
          700: '#4a5568',
          800: '#2d3748',
          900: '#1a202c'
        } */
      },
      spacing: {
        px: '1px',
        0: '0',
        0.5: '0.125rem',
        1: '0.25rem',
        1.5: '0.375rem',
        2: '0.5rem',
        2.5: '0.625rem',
        3: '0.75rem',
        3.5: '0.875rem',
        96: '24rem',
        128: '32rem'
      },
      boxShadow: {
        xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
        solid: '0 0 0 2px currentColor',
        outline: '0 0 0 3px rgba(156, 163, 175, .5)',
        'outline-gray': '0 0 0 3px rgba(254, 202, 202, .5)',
        'outline-blue': '0 0 0 3px rgba(191, 219, 254, .5)',
        'outline-green': '0 0 0 3px rgba(167, 243, 208, .5)',
        'outline-yellow': '0 0 0 3px rgba(253, 230, 138, .5)',
        'outline-red': '0 0 0 3px rgba(254, 202, 202, .5)',
        'outline-pink': '0 0 0 3px rgba(251, 207, 232, .5)',
        'outline-purple': '0 0 0 3px rgba(221, 214, 254,, .5)',
        'outline-indigo': '0 0 0 3px rgba(199, 210, 254, .5)'
      }
    }
  },
  variants: {},
  corePlugins: {
    // ...
  },
  plugins: [
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/aspect-ratio')
  ]
}
