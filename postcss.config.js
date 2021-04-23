// postcss.config.js

let environment = {
  plugins: [
    require('tailwindcss')('./app/javascript/src/styles/tailwind.js'),
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

// Only run PurgeCSS in production (you can also add staging here)
//if (process.env.RAILS_ENV === "production") {

//environment.plugins.push(
//    require('@fullhuman/postcss-purgecss')({
//      content: [
//        './app/**/*.html.erb',
//        './app/**/*.erb',
//        './app/javascript/**/*.scss',
//        './app/helpers/**/*.rb',
//        './app/javascript/**/*.js',
//        './app/javascript/**/*.jsx',
//        './node_modules/rc-tooltip/**/*.js',
//        './node_modules/rc-tooltip/**/*.css',
//      ],
//      defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
//    })
//  )
//}

module.exports = environment