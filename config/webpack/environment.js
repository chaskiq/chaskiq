var path = require('path')
const { environment } = require('@rails/webpacker')
const erb =  require('./loaders/erb')

const NonDigestPlugin = require('non-digest-webpack-plugin');

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')


environment.config.merge({
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react')
    }
  }
})

// run this with 
if(process.env.ANALIZE_BUNDLE === 'true' && 
  process.env.NODE_ENV === 'production'){
  environment.plugins.append(
    'BundleAnalyzer',
    new BundleAnalyzerPlugin()
  )
}


//if(process.env.NODE_ENV === 'production')
//  environment.plugins.append('NonDigestPlugin', new NonDigestPlugin() );

//if (environment.plugins.getIndex('UglifyJs') !== -1) {
//  environment.plugins.get('UglifyJs').options.uglifyOptions.compress.collapse_vars = false
//}

environment.loaders.append('erb', erb)
module.exports = environment
