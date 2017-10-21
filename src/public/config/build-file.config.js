require('!!file-loader?name=404.html!../../404.html');
require('!!file-loader?name=assembly.xml!../../assembly.xml');
require('!!file-loader?name=pom.xml!../../pom.xml');
module.exports = {
  js: {
    // html5shiv: require('!!file-loader?name=js/commons/[name].[ext]!../../../vendor/ie-fix/html5shiv.min.js'),
    // respond: require('!!file-loader?name=js/commons/[name].[ext]!../../../vendor/ie-fix/respond.min.js'),
    config: require('!!file-loader?name=scripts/config.js!../../config.js'),
    jquery: require('!!file-loader?name=js/commons/[name].[ext]!jquery/dist/jquery.min.js'),
    bdMap: require('!!file-loader?name=js/commons/[name].[ext]!script/about/bdMap.js'),
    qq: require('!!file-loader?name=js/commons/[name].[ext]!script/utils/qq.js'),
    // es5Shim: require('!!file-loader?name=js/commons/[name].[ext]!../../../vendor/ie-fix/es5-shim.min.js'),
    // es5Sham: require('!!file-loader?name=js/commons/[name].[ext]!../../../vendor/ie-fix/es5-sham.min.js'),
  },
  images: {
    // 'login-bg': require('!!file-loader?name=images/[name].[ext]!../imgs/login-bg.jpg'),
  },
  // dll: {
  //   js: require('!!file-loader?name=dll/dll.js!../../dll/dll.js'),
  //   css: require('!file-loader?name=dll/dll.css!../../dll/dll.css'),
  // },
};

