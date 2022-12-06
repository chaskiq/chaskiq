// https://tailwindcss.com/docs/theme/
const colors = require('tailwindcss/colors');
const grayColors = {};

module.exports = {
  darkMode: 'class',
  mode: 'jit',
  experimental: {},
  //purge: {
    //enabled: false,
    //enabled: ['production', 'staging'].includes(process.env.NODE_ENV),
    content: [
      './app/**/*.html.erb',
      './app/**/*.erb',
      './app/javascript/**/*.scss',
      './app/helpers/**/*.rb',
      './app/services/message_apis/**/presenter.rb',
      './app/javascript/**/*.js',
      './app/javascript/**/*.jsx',
      './app/javascript/**/*.ts',
      './app/javascript/**/*.tsx',
      './node_modules/rc-tooltip/**/*.js',
      './node_modules/rc-tooltip/**/*.css',
    ],
  //},
  theme: {
    minWidth: {
      0: '0',
      '1/4': '25%',
      '1/2': '50%',
      '3/4': '75%',
      full: '100%',
    },
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
    colors: colors,

    extend: {
      colorsDisabled: {
        cyan: '#9cdbff',
        gray: grayColors,
      },
      colors: {
        brand: '#2668eb',
        'gradientHero': {
            100: '#2668eb',
            200: '#1e4abb',
            DEFAULT: '#04309d',
        },
        transparent: 'transparent',
        current: 'currentColor',
        black: colors.black,
        white: colors.white,
        gray: colors.zinc,
        indigo: colors.indigo,
        red: colors.rose,
        green: colors.emerald,
        yellow: colors.amber,
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
        128: '32rem',
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
        'outline-indigo': '0 0 0 3px rgba(199, 210, 254, .5)',
      },
      height: {
        generalHeight: 'calc(100vh)',
        //generalHeight: 'calc(75vh)' // for horizontal menu
      },
      margin: {
        generalTop: '0',
        // generalTop: '12rem 0 0 0', // for horizontal menu
      },
    }
  },
  variants: {},
  corePlugins: {
    // ...
  },
  plugins: [
    //require('@tailwindcss/forms'),
    //require('@tailwindcss/typography'),
    //require('@tailwindcss/aspect-ratio'),
  ],
};