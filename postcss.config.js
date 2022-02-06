// postcss.config.js

let environment = {
  plugins: [
    require('tailwindcss')('./config/tailwind.config.js'),
    require('autoprefixer'),
    require('postcss-import'),
    require('postcss-flexbugs-fixes'),
    require('postcss-preset-env')({
      autoprefixer: {
        flexbox: 'no-2009'
      },
      stage: 3
    }),
  ]
}
module.exports = environment