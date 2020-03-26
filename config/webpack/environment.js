var path = require('path')
var webpack = require('webpack')
const { environment } = require('@rails/webpacker')

const NonDigestPlugin = require('non-digest-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

/*const dotenv = require('dotenv')
const dotenvFiles = [
  `.env.${process.env.NODE_ENV}.local`,
  '.env.local',
  `.env.${process.env.NODE_ENV}`,
  '.env'
]
dotenvFiles.forEach((dotenvFile) => {
  dotenv.config({ path: dotenvFile, silent: true })
})*/

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

/*
console.log("CHASKIQ ENV VAR FOR DOMAIN: ",  process.env.HOST)
if(!process.env.HOST){
  console.error("!!!!THERE IS NOT DOMAIN SET AS HOME ENV VAR!!!!")
}

environment.plugins.prepend(
  "Environment",
  new webpack.EnvironmentPlugin(
    JSON.parse(
      JSON.stringify({
        HOST: process.env.HOST,
        // add as many env vars as you need
      })
    )
  )
);*/



//if(process.env.NODE_ENV === 'production')
//  environment.plugins.append('NonDigestPlugin', new NonDigestPlugin() );

//if (environment.plugins.getIndex('UglifyJs') !== -1) {
//  environment.plugins.get('UglifyJs').options.uglifyOptions.compress.collapse_vars = false
//}

module.exports = environment
