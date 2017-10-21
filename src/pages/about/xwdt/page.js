require('commons'); 
require('lessDir/about/about_header.less');
require('lessDir/about/about.less');

define(['jquery','script/index/load_init','script/utils/angular','script/utils/angular-route.1.2.9.min','script/utils/angular-sanitize.1.2.9.min','script/utils/req','script/about/zx_common'],function($ , LOAD, angular,route,sanitize,req,zx_common){
	var about_data;
	var url = LOAD.getUrlParams(window.location.href,'?');
	angular.module('about',['ngRoute','ngSanitize','zxCommon']).
	run(['$rootScope','$location', function($rootScope,$location) {
		var $s = $rootScope;
		$rootScope.recordsFiltered ='';//分页请求的总条数
		$rootScope.addgyData = [];//社会公益累加
		var _hash
		$rootScope.abuo = function(){
			window.location.reload();
		}
		$rootScope.about_data = about_data;
		var _stateFn = function(){
			_hash = $location.$$path.substr(7,4);
			$('#a_'+_hash).addClass('on').siblings('li').removeClass('on');
		}
		setTimeout(_stateFn,100);
		$rootScope.pageLoading = true;
		$rootScope.lod = true;
		//新闻动态推荐位请求列表
		$rootScope.dynamic_desh = function(recommendedBitSn){
			if(!$rootScope.lod) layer.load(0,{shade:[0.1, '#fff']});
			req.jsonp({
				url:base_url + "/recommendedBitNewsRelation/getRecommendedBitNewsByRecommendedBitSn",
				data: {recommendedBitSn:recommendedBitSn,start:1,length:6},
				success: function(d){
					$rootScope.recordsFiltered = d.recordsFiltered;
					$rootScope.total_article = d.data; 
					//console.log($rootScope.total_article) 
		        	$rootScope.$apply();
		        	setTimeout(function(){
					  	layer.closeAll();
					},200)
				},
				error: function(e){
					alert('请求失败！')
				}
			});
		}
		$s.about_click = function(event){
			$rootScope.lod = false;
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
			.when('/about_xwd3/:sn',{
				template : document.getElementById('xwd3_view').innerHTML,
				controller: 'about_xwd3'
			})
			.when('/about_xwd2/:sn',{
				template : document.getElementById('xwd2_view').innerHTML,
				controller: 'about_xwd2'
			})
			.when('/about_xwd1/:sn',{
				template : document.getElementById('xwd1_view').innerHTML,
				controller: 'about_xwd1'
			})
			.otherwise({
				redirectTo : 'about_xwd1/'+about_data[0].sn,
				controller: 'about_xwd1'
			});
	}])
	.controller('about_xwd1',['$scope','$routeParams',function($scope,$routeParams){
		$scope.dynamic_desh($routeParams.sn)
	}])
	.controller('about_xwd2',['$scope','$routeParams',function($scope,$routeParams){
		$scope.dynamic_desh($routeParams.sn)
	}])
	.controller('about_xwd3',['$scope','$routeParams',function($scope,$routeParams){
		$scope.dynamic_desh($routeParams.sn)
		req.jsonp({
			url:base_url + "/recommendedBitNewsRelation/getRecommendedBitNewsBySite.do",
			data: {belongSite:'关于我们-新闻动态-媒体报道'},
			success: function(d){
				
				$scope.hgsp_data = d.data.XGSP;
				// //console.log($scope.hgsp_data)
				// //console.log(123)
	        	$scope.$apply();
	        	// $(".slideTxtBox").slide({titCell:".hd ul",mainCell:".bd ul",autoPage:true,effect:"left",autoPlay:false,vis:4});
			},
			error: function(e){
				alert('请求失败！')
			}
		});
	}])
	//初始化
	angular.element(document).ready(function() {
		//新闻动态--淘绿动态请求
		req.jsonp({
			url:base_url + "/recommendedBitNewsRelation/getRecommendedBitNewsBySite.do",
			data: {belongSite:'关于我们-新闻动态'},
			success: function(d){
				//console.log(d.data)
				if (d.code == 'BUS0000') {
		        	var arr = [];
					for(var attr in d.data){
						if (d.data[attr].showName =='社会公益') {
							arr.unshift(d.data[attr]);
						}else{
							arr.push(d.data[attr]);
						}
					};
		        	$.map(arr,function(o,i){
						o.code = 'xwd'+(i+1);
						return o;
					})
					about_data=arr;
					//console.log(about_data)
		        	angular.bootstrap(document, ['about']);
	        	}else{
	        		alert('请求失败！');
	        	}
			}
		});
	});
})



