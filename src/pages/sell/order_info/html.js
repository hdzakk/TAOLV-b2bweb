const content = require('./content.ejs');
const layout = require('layout');
const nav = require('components/nav/html.ejs'); // 由于部分页面的导航栏不一样所以个个页面单独引入

module.exports = layout.init({
  pageTitle: '淘绿网 - 我要卖货',
}).run(content({
  content: '淘绿网',
  nav:nav()
}));
