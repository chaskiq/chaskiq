var path = require('path')
const { environment } = require('@rails/webpacker')

environment.config.merge({
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react'),
    }
  }
})



module.exports = environment
