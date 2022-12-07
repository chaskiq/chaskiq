/* module.exports = {
  tailwind: {
    config: './app/javascript/src/styles/tailwind.js',
    format: 'auto'
  }
} */

module.exports = {
  twin: {
    // config: 'tailwind.config.js',
    config: './config/tailwind.config.js',
    preset: 'emotion',
    dataTwProp: true,
    debugPlugins: false,
    debug: false
  }
}
