var path = require('path')
var webpack = require('webpack')
const { environment } = require('@rails/webpacker')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

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

// run this with
if (process.env.ANALIZE_BUNDLE === 'true' &&
  process.env.NODE_ENV === 'production') {
  environment.plugins.append(
    'BundleAnalyzer',
    new BundleAnalyzerPlugin()
  )
}

module.exports = environment
