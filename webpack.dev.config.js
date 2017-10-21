require('./npm-scripts/before-build.script');
var resolve = require('./webpack-config/resolve.config.js');
resolve.alias.vueDir = 'vue/dist/vue.js';//这个是开发版本文件因此把vue改为开发版本（默认是生产版本vue）

module.exports = {
  entry: require('./webpack-config/entry.config.js'),

  output: require('./webpack-config/output.config.js'),

  module: require('./webpack-config/module.dev.config.js'),

  resolve: resolve,

  plugins: require('./webpack-config/plugins.dev.config.js'),

  externals: require('./webpack-config/externals.config.js'),
};
