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
			$rootScope.listArr = [];
			var _hash
			$rootScope.abuo = function(){
   				window.location.reload();
			}
			//请求头部列表
			var gethead = function(){
				
				$rootScope.pageLoading = true;
				if(about_data =='') return;
	        	$rootScope.about_data = about_data.childrenNewsType;
	        	for (var i = $rootScope.about_data.length - 1; i >= 0; i--) {
	        		if ($rootScope.about_data[i].code =="HSFW") {
	        			$rootScope.listArr.unshift($rootScope.about_data[i]);
	        		}else{
	        			$rootScope.listArr.push($rootScope.about_data[i]);
	        		}
	        	};
	        	_hash = $location.$$path.substr(7,4);
				$('#a_'+_hash).addClass('on').siblings('li').removeClass('on');
					
			}
			gethead();

			var _stateFn = function(){
				_hash = $location.$$path.substr(7,4);
				$('#a_'+_hash).addClass('on').siblings('li').removeClass('on');
			}
			setTimeout(_stateFn,100);
			$rootScope.lod = true;
			//请求列表也

			$rootScope.getContentList = function(typesn){
				if(!$rootScope.lod) layer.load(0,{shade:[0.1, '#fff']});
				var jsonData = {};	
				req.jsonp({
					url:base_url + "/news/getNewsByTypeSnList",
					data: {typeSn : typesn , start :1 , length:1},
					success: function(d){
						//console.log(d)
						$rootScope.pageLoading = true;
			        	if(d.data.length>0){
		        			$rootScope.recordsFiltered = d.recordsFiltered;
		        			$rootScope.total_data = d.data;
		        			var sn = d.data[0].sn;
		        			//console.log(sn)
		        			$rootScope.getContent(url.typeSn,sn);
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
						//console.log($rootScope.tljj)
						$rootScope.$apply();
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
		.config(['$routeProvider',function($routeProvider){
			$routeProvider
				.when('/about_hsfw/:sn',{
					template : document.getElementById('hsfw_view').innerHTML,
					controller: 'about_hsfw'
				})
				.when('/about_shfw/:sn',{
					template : document.getElementById('shfw_view').innerHTML,
					controller: 'about_shfw'
				}).otherwise({
					redirectTo : 'about_hsfw/'+about_data.childrenNewsType[0].sn,
					controller: 'about_hsfw'
				});
		}])
		.controller('about_hsfw',['$scope','$routeParams',function($scope,$routeParams){
			$scope.getContentList($routeParams.sn)
		}])
		.controller('about_shfw',['$scope','$routeParams',function($scope,$routeParams){
			$scope.getContentList($routeParams.sn)
		}])
		//初始化
		angular.element(document).ready(function() {
			req.jsonp({
				url:base_url + "/newsType/getDetailsNewsType.do",
				data: {code : url.code},
				success: function(d){
					if (d.code == "BUS0000") {

						about_data = d.data;
						
						angular.bootstrap(document, ['about']);
					};
				}
			});
			//angular.bootstrap(document, ['about']);
		});
	})



