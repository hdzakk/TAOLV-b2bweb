require('commons'); 
require('lessDir/about/about_header.less');
require('lessDir/about/about.less');

define(['jquery','script/index/load_init','script/utils/angular','script/utils/angular-route.1.2.9.min','script/utils/angular-sanitize.1.2.9.min','script/utils/req','script/about/zx_common'],function($ , LOAD, angular,route,sanitize,req,zx_common){
	var url = LOAD.getUrlParams(window.location.href,'?');
	angular.module('about',['ngRoute','ngSanitize','zxCommon']).
	run(['$rootScope','$location', function($rootScope,$location) {
			var gethead = function(){
				req.jsonp({
					url:base_url + "/news/getNewsByTypeSnList",
					data: {typeSn : url.typeSn , start :1 , length: 1},
					success: function(d){
			        	if(d.data.length>0){
		        			$rootScope.total_data = d.data;
		        			console.log($rootScope.total_data)
		        			var sn = d.data[0].sn;
				        	$rootScope.getContent(url.typeSn,sn)
		        			$rootScope.$apply();
						}else{
							layer.msg('没有数据')
						}
					},
					error: function(e){
						layer.msg('请求失败！')
					}
				});
			}	
			//请求列表也
			gethead();
			req.jsonp({
				url:base_url + "/news/getNewsByTypeSnList",
				data: {typeSn : url.typeSn , start :1 , length: 1},
				success: function(d){
					
		        	if(d.data.length>0){
	        			$rootScope.total_data = d.data;
	        			console.log($rootScope.total_data)
	        			var sn = d.data[0].sn;
			        	$rootScope.getContent(url.typeSn,sn)
	        			$rootScope.$apply();
					}else{
						layer.msg('没有数据')
					}
					setTimeout(function(){
					  	layer.closeAll();
					},200)
				},
				error: function(e){
					layer.msg('请求失败！')
				}
			});
			$rootScope.abuo = function(){
				window.location.reload();
			}	
		//请求详情页
		$rootScope.getContent = function(typesn,sn){
			req.jsonp({
				url:base_url + "/news/getNewsByTypeSn",
				data: {typeSn:typesn, sn:sn},
				success: function(d){
					$rootScope.pageLoading = true;
		        	console.log(d)
					$rootScope.tljj = d.data;
					$('#webBody').html(d.data.webBody.replace(/(&nbsp;)+/g,''))
					console.log($rootScope.tljj)
					$rootScope.$apply();
				},
				error: function(e){
					layer.msg('请求失败！')
				}
			});
		}
	}])
	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['about']);
	});
})



