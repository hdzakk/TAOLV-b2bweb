var path = require('path');
var dirVars = require('./base/dir-vars.config.js');
var pageArr = require('./base/page-entries.config.js');
var configEntry = {};

pageArr.forEach((page) => {
  var key = page.split('/').join('_');
  configEntry[key] = path.resolve(dirVars.pagesDir, page + '/page.js');
});

// console.log(configEntry)

module.exports = configEntry;
