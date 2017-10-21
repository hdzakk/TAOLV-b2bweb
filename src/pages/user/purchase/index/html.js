const content = require('./content.ejs');
const layout = require('layout');
const nav = require('components/userNav/html.ejs'); // 由于部分页面的导航栏不一样所以个个页面单独引入
const config = require('configModule');
module.exports = layout.init({
  pageTitle: '会员中心 - 委托采购',
}).run(content({
  content: '淘绿网',
  config:config,
  nav:nav()
}));
