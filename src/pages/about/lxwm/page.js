require('commons'); 
require('lessDir/about/about_header.less');
require('lessDir/about/about.less');

define(['jquery','script/index/load_init','script/utils/angular','script/utils/angular-route.1.2.9.min','script/utils/angular-sanitize.1.2.9.min','script/utils/req','script/about/zx_common'],function($ , LOAD, angular,route,sanitize,req,zx_common){
	var url = LOAD.getUrlParams(window.location.href,'?');
	angular.module('about',['ngRoute','ngSanitize','zxCommon']).
	run(['$rootScope','$location', function($rootScope,$location) {
		//请求列表也
		var jsonData = {};
		req.jsonp({
			url:base_url + "/news/getNewsByTypeSnList",
			data: {typeSn : url.typeSn , start :1 , length: 2},
			success: function(d){
				//console.log(d)
				$rootScope.pageLoading = true;
	        	if(d.data.length>0){
        			$rootScope.total_data = d.data;
        			//console.log($rootScope.total_data)
        			//console.log('------')
        			if ($rootScope.total_data.length>=2) {
	        			req.jsonp({
							url:base_url + "/news/getNewsByTypeSn",
							data: {typeSn:url.typeSn, sn:$rootScope.total_data[1].sn},
							success: function(d){
								$rootScope.tljj = d.data;
								//console.log($rootScope.tljj)
								$rootScope.$apply();
							},
							error: function(e){
								alert('请求失败！')
							}
						});
					};
					if ($rootScope.total_data.length>=1) {
						req.jsonp({
							url:base_url + "/news/getNewsByTypeSn",
							data: {typeSn:url.typeSn, sn:$rootScope.total_data[0].sn},
							success: function(d){
								$rootScope.tjtl = d.data;
								//console.log($rootScope.tjtl)
								$rootScope.$apply();
							},
							error: function(e){
								alert('请求失败！')
							}
						});
					}
        			$rootScope.$apply();
				}else{
					alert('没有数据')
				}
			},
			error: function(e){
				alert('请求失败！')
			}
		});
		$rootScope.abuo = function(){
			window.location.reload();
		}
		//请求详情页
	}])
	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['about']);
	});
})



