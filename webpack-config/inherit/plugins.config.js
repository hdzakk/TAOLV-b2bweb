var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');
var dirVars = require('../base/dir-vars.config.js');
var pageArr = require('../base/page-entries.config.js');

var HashOutput = require('webpack-plugin-hash-output');

// var es3ifyWebpackPlugin = require('es3ify-webpack-plugin');

var configPlugins = [

  /* 全局shimming */
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    'window.jQuery': 'jquery',
    'window.$': 'jquery',
    // Vue: 'vue',
    // vue: 'vue',
  }),
  /* 抽取出所有通用的部分 */
  new webpack.optimize.CommonsChunkPlugin({
    name: 'commons',      // 需要注意的是，chunk的name不能相同！！！
    filename: 'js/commons/[chunkhash].commons.js',
    minChunks: 22,
  }),
  /* 抽取出webpack的runtime代码()，避免稍微修改一下入口文件就会改动commonChunk，导致原本有效的浏览器缓存失效 */
  new webpack.optimize.CommonsChunkPlugin({
    name: 'runtime',
    filename: 'js/commons/[hash].runtime.js',
  }),
  /* 抽取出chunk的css */
  new ExtractTextPlugin('css/[contenthash].[name].css'),
  /* 配置好Dll */
  // new webpack.DllReferencePlugin({
  //   context: dirVars.staticRootDir, // 指定一个路径作为上下文环境，需要与DllPlugin的context参数保持一致，建议统一设置为项目根目录
  //   manifest: require('../../manifest.json'), // 指定manifest.json
  //   name: 'dll',  // 当前Dll的所有内容都会存放在这个参数指定变量名的一个全局变量下，注意与DllPlugin的name参数保持一致
  // }),
  new HashOutput({
    manifestFiles: 'runtime', // 指定包含 manifest 在内的 chunk
  }),
  // new es3ifyWebpackPlugin(),
];

pageArr.forEach((page) => {
  var key = page.split('/').join('_');
  const htmlPlugin = new HtmlWebpackPlugin({
    filename: page == 'index/index' ? 'index.html' : `page/${page}.html`,
    template: path.resolve(dirVars.pagesDir, `./${page}/html.js`),
    chunks: [key, 'runtime' ,'commons'],
    hash: false, // 为静态资源生成hash值
    xhtml: true,
    inject: 'body', // js插入位置
    minify: {
      caseSensitive:true,
      collapseBooleanAttributes:true,
      collapseInlineTagWhitespace:true,
      collapseWhitespace:true,
      decodeEntities:true,
      conservativeCollapse:true,
      removeAttributeQuotes:true,
      removeStyleLinkTypeAttributes:true,
      trimCustomFragments:true,
      customAttrSurround:true,
      customEventAttributes:true,
      processConditionalComments:true
    },
  });
  configPlugins.push(htmlPlugin);
});

module.exports = configPlugins;
