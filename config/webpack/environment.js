var path = require('path')
var webpack = require('webpack')
const { environment } = require('@rails/webpacker')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

// Get the actual sass-loader config
const sassLoader = environment.loaders.get('sass')
const sassLoaderConfig = sassLoader.use.find(function (element) {
return element.loader == 'sass-loader'
})

// Use Dart-implementation of Sass (default is node-sass)
const options = sassLoaderConfig.options
options.implementation = require('sass')

function hotfixPostcssLoaderConfig(subloader) {
  const subloaderName = subloader.loader
  if (subloaderName === 'postcss-loader') {
    subloader.options.postcssOptions = subloader.options.config
    delete subloader.options.config
  }
}

environment.loaders.keys().forEach(loaderName => {
const loader = environment.loaders.get(loaderName)
loader.use.forEach(hotfixPostcssLoaderConfig)
})


environment.config.merge({
  resolve: {
    alias: {
      lodash: path.resolve('./node_modules/lodash'),
      immutable: path.resolve('./node_modules/immutable'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      react: path.resolve('./node_modules/react')
    }
  }
})

environment.loaders.get('file').test = /\.(jpg|jpeg|png|gif|tiff|ico|svg|eot|otf|ttf|woff|woff2|mp3|wav)$/i

// https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
environment.plugins.append(
  'ContextReplacementPlugin',
  new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|es/)
)

// run this with
if (process.env.ANALIZE_BUNDLE === 'true' &&
  process.env.NODE_ENV === 'production') {
  environment.plugins.append(
    'BundleAnalyzer',
    new BundleAnalyzerPlugin()
  )
}

module.exports = environment
