var glob = require('glob');
var dirVars = require('./dir-vars.config.js');
// var options = {
//   cwd: dirVars.pagesDir, // 在pages目录里找
//   sync: true, // 这里不能异步，只能同步
// };
// var globInstance = new glob.Glob('!(_)*/!(_)*', options); // 考虑到多个页面共用HTML等资源的情况，跳过以'_'开头的目录
// console.log(dirVars.pagesDir)
// module.exports = globInstance.found; // 一个数组，形如['index/index', 'index/login', 'alert/index']

const fs = require('fs');
let datas = [];
var aa = 0;
let walk = (path) => {
    files = fs.readdirSync(path);
    files.forEach((item) => {
        let tmpath = path + '\\' + item;
        let stats = fs.statSync(tmpath);
        if (stats.isDirectory()) {
            walk(tmpath);
        } else {
        	var str = tmpath.replace(item, "");
        	var str1 = str.replace(dirVars.pagesDir+'\\', "");
        	var str2 = str1.replace(/\\\b/g, "/");
        	var str3 = str2.replace(/\\/g, "");
        	if (datas.indexOf( str3 )==-1) {
            	datas.push(str3);
            }
        };
    });
};
walk(dirVars.pagesDir);

//module.exports = datas;
//module.exports = ['index/index','special/purchase','special/flowSale','special/flowBuy'];
module.exports = ['index/index','buy/category','buy/order_info'];



