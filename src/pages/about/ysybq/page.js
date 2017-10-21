require('commons'); 
require('lessDir/about/about_header.less');
require('lessDir/about/about.less');

define(['jquery','script/index/load_init','script/utils/angular','script/utils/angular-route.1.2.9.min','script/utils/angular-sanitize.1.2.9.min','script/utils/req','script/about/zx_common'],function($ , LOAD, angular,route,sanitize,req,zx_common){
	var url = LOAD.getUrlParams(window.location.href,'?');
	var about_data;
	angular.module('about',['ngRoute','ngSanitize','zxCommon']).
	run(['$rootScope','$location', function($rootScope,$location) {
		var $s = $rootScope;
		$rootScope.recordsFiltered ='';//分页请求的总条数
		var _hash
		$rootScope.abuo = function(){
				window.location.reload();
		}
		//请求头部列表
		$rootScope.about_data = about_data;

		var _stateFn = function(){
			_hash = $location.$$path.substr(7,4);
			if (!_hash) {
				$('#a_hsfw').addClass('on').siblings('li').removeClass('on');
			}else{
				$('#a_'+_hash).addClass('on').siblings('li').removeClass('on');
			}
		}
		setTimeout(_stateFn,100);

		$rootScope.lod = true;
		// //请求列表也
		$rootScope.getContentList = function(typesn,start,length){
			if(!$rootScope.lod) layer.load(0,{shade:[0.1, '#fff']});
			var jsonData = {};
			req.jsonp({
				url:base_url + "/news/getNewsByTypeSnList",
				data: {typeSn : typesn , start :start , length: length},
				success: function(d){
					//console.log(d)
					$rootScope.pageLoading = true;
		        	if(d.data.length>0){
	        			$rootScope.recordsFiltered = d.recordsFiltered;
	        			$rootScope.total_data = d.data;
	        			var sn = d.data[0].sn;
			        	$rootScope.getContent(typesn,sn)
	        			$rootScope.$apply();
					}else{
						alert('没有数据')
					}
					setTimeout(function(){
					  	layer.closeAll();
					},200)
				},
				error: function(e){
					alert('请求失败！')
				}
			});
		}
		//请求详情页
		$rootScope.getContent = function(typesn,sn){
			req.jsonp({
				url:base_url + "/news/getNewsByTypeSn",
				data: {typeSn:typesn, sn:sn},
				success: function(d){
					$rootScope.tljj = d.data;
					$rootScope.$apply();
				},
				error: function(e){
					alert('请求失败！')
				}
			});
		}

		$s.about_click = function(event){
			$rootScope.lod = false;
			$rootScope.tljj = '';
			$(event.currentTarget).addClass('on').siblings('li').removeClass('on');
		}
	}])
	.filter('idtxt', function() {
		return function(d) {
			if (!d) return;
			return d.substr(0,4).toLowerCase();
		}
	})
	.config(['$routeProvider',function($routeProvider){
		$routeProvider
			.when('/about_ysfwtk/:sn',{
				template : document.getElementById('ysfwtk_view').innerHTML,
				controller: 'about_ysfwtk'
			})
			.when('/about_yssm/:sn',{
				template : document.getElementById('yssm_view').innerHTML,
				controller: 'about_yssm'
			})
			.when('/about_flsm/:sn',{
				template : document.getElementById('flsm_view').innerHTML,
				controller: 'about_flsm'
			})
			.otherwise({
				redirectTo : 'about_flsm/'+about_data[0].sn,
				controller: 'about_flsm'
			});
	}])
	.controller('about_flsm',['$scope','$routeParams',function($scope,$routeParams){
		$scope.getContentList($routeParams.sn,1,1)
	}])
	.controller('about_yssm',['$scope','$routeParams',function($scope,$routeParams){
		$scope.getContentList($routeParams.sn,1,10)
	}])
	.controller('about_ysfwtk',['$scope','$routeParams',function($scope,$routeParams){

		$scope.getContentList($routeParams.sn,1,1)
	}])
	//初始化
	angular.element(document).ready(function() {
		//请求头部列表
		req.jsonp({
			url:base_url + "/newsType/getDetailsNewsType.do",
			data: {code : url.code},
			success: function(d){
				if (d.code == 'BUS0000') {
		        	about_data = d.data.childrenNewsType;
		        	angular.bootstrap(document, ['about']);
	        	}else{
	        		alert('请求失败！');
	        	}
			}
		});
		$('.wrap_content').on('click','.content_div>div',function(){
			// var index = $(this).index();
			// $('.tk_content').eq(index-1).show().siblings('.tk_content,.content_div').hide();
			var _title = $(this).find('p').text();
			req.jsonp({
				url:base_url + "/news/getNewsByTitle.do",
				data: {newsTypeCode:'YHXY',start:1,length:2,title:_title},
				success: function(d){
					//console.log(d)
					if (d.code == 'BUS0000') {
						var d = d.data[0];
						if (d) {
							req.jsonp({
								url:base_url + "/news/getNewsByTypeSn.do",
								data: {sn: d.sn, typeSn: d.typeSn},
								success: function(d){
									if (d.code == 'BUS0000') {
										layer.open({
											title: '用户协议',
											fixed: true,
											btn: false,
											skin: 'demo-class',
											area: ['800px','600px'],
											content: d.data.webBody,
											success:function(obj,q){
											}
										});
									};
									//console.log(d)
								},
								error: function(e){
								}
							})
						}else{
							layer.msg("错误: 未找到 " +_title+" 相关文章");  
						}
						
					}
					////console.log(d)
				},
				error: function(e){
					alert('失败！')
				}
			})
		}).on('click','.btn_default',function(){
			// $('.content_div').show().siblings('.tk_content').hide();
		})
	});
	
	
})



