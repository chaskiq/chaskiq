// postcss.config.js

let environment = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss/nesting'),
    require('tailwindcss')('./config/tailwind.config.js'),
    require('autoprefixer')
  ]
}
module.exports = environment