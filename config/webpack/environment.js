var path = require('path')
const { environment } = require('@rails/webpacker')

const NonDigestPlugin = require('non-digest-webpack-plugin');

environment.config.merge({
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react'),
    }
  }
})

environment.plugins.append('NonDigestPlugin', new NonDigestPlugin() );

module.exports = environment
