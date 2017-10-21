const config = require('configModule');
$(() => {
  if (!IS_PRODUCTION) {
    console.log('此版本为开发版本');
    //console.log(config.API_ROOT);
  }
});

// 共用部分
require('iconfontDir/iconfont.css');
require('lessDir/base/base.less');

