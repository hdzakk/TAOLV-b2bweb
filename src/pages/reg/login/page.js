require('commons'); 

define(['jquery','script/index/load_init'],function($, LOAD){
	var url = LOAD.getUrlParams(window.location.href,'?')
	LOAD.validate($('#login_content'),url.url);
})