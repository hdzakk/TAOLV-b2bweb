require('commons'); 
require('lessDir/about/about_header.less');
require('lessDir/about/about.less');
require('lessDir/base/YLlightbox.less');

define(['jquery','script/index/load_init','script/utils/angular','script/utils/angular-route.1.2.9.min','script/utils/angular-sanitize.1.2.9.min','script/utils/req','script/about/zx_common'],function($, LOAD, angular,route,sanitize,req,zx_common){
		var url = LOAD.getUrlParams(window.location.href,'?');
		var about_data;
		angular.module('about',['ngRoute','ngSanitize','zxCommon']).
		run(['$rootScope','$location', function($rootScope,$location) {
			$rootScope.recordsFiltered;//分页请求的总条数
			$rootScope.arrData = [];//发展历程列表
			$rootScope.yearData = [];//发展历程年份
			var _hash;
			//请求头部列表
			$rootScope.about_data = about_data;
			var _stateFn = function(){
				_hash = $location.$$path.substr(7,4);
				$('#a_'+_hash).addClass('on').siblings('li').removeClass('on');
			}
			setTimeout(_stateFn,200);
			$rootScope.pageLoading = true;
			var gundong = function(){
				var $Window = $(window);
			 	var time;
				var fact = true;
			    var $common = $('.dynamic')
			       ,topArr = []; 
			      $common.map(function(i,obj){
				   		topArr.push($(obj).offset().top);
				   });
			    function _effect(){
			   		clearTimeout(time)
			   		time = setTimeout(function(){
				   		var _top = $Window.scrollTop();
				   		var _winH = $Window.height();
				   		var _h = _top+_winH;
				   		$common.each(function(index, el) {
					   			if (_h>(topArr[index]+100)) {
					   				$(el).addClass('effect');
					   			}else{
					   				if (_h<topArr[index]) {//不在可视区就删除effect
					   					$(el).removeClass('effect');
					   				};
					   			}
				   		});
			   		},200)
			   }
			   $Window.scroll(_effect);
			   _effect();
			   	$(".jump").click(function(){//查看更多
			   		$("#development_child").show();
			   		$(".development").hide();
			   		$('body,html').animate({scrollTop:$('.about_heade').offset().top},500); 
				});
				$(".jrmp").click(function(){//返回
			   		$("#development_child").hide();
			   		$(".development").show();
				});

				$("#development_child>.course>ul").find('li:gt(1)').hide();
				// $("#development_child>.course>ul:gt(0)").find('li:gt(0)').children('span:eq(0)').text('+ 展开');
				$('.open_show').click(function(){
					$(this).parent().siblings('.no_figure').slideToggle();
					if ($(this).text()=='- 收缩') {
						$(this).text('+ 展开');
					}else{
						$(this).text('- 收缩');
					}
					//$(this).parent().parent().siblings().children('.no_figure:gt(0)').slideUp();
				})
			}
			var unique = function(str) {
				var newArr = [],
				i = 0,
				len = str.length;
				for(; i < len; i++) {
					var a = str[i];
					if(newArr.indexOf(a) !== -1) {
						continue;
					}else {
						newArr[newArr.length] = a;
					}
				}
				return newArr;				
			}	
			$rootScope.abuo = function(){
				window.location.reload();
			}
			$rootScope.lod=true;

			// //请求列表也
			$rootScope.getContentList = function(typesn,start,length){
				if(!$rootScope.lod) layer.load(0,{shade:[0.1, '#fff']});
				req.jsonp({
					url:base_url + "/news/getNewsByTypeSnList",
					data: {typeSn : typesn , start :start , length: length},
					success: function(d){
						$rootScope.pageLoading = true;
			        	if(d.data.length>0){
		        			$rootScope.recordsFiltered = d.recordsFiltered;
		        			$rootScope.total_data = d.data;
		        			//请求详情页
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

						require(['script/utils/YLlightbox'],function(imgPreview){
							imgPreview();
						});
					},
					error: function(e){
						alert('请求失败！')
					}
				});
			}
			//推荐位请求头部列表
			req.jsonp({
				url:base_url + "/recommendedBitNewsRelation/getRecommendedBitNewsBySite.do",
				data: {belongSite:'关于我们-关于淘绿'},
				success: function(d){
					if (d.code == 'BUS0000') {
						$rootScope.tjData = d.data;
						$rootScope.$apply();
					}else{
		        		alert('请求失败');
		        	}
				}
			});
			//关于淘绿--推荐位请求列表页
			$rootScope.dynamic_desh = function(recommendedBitSn,start,length){
				if(!$rootScope.lod) layer.load(0,{shade:[0.1, '#fff']});
				req.jsonp({
					url:base_url + "/recommendedBitNewsRelation/getRecommendedBitNewsByRecommendedBitSn",
					data: {recommendedBitSn:recommendedBitSn,start:start,length:length},
					success: function(d){
						var jsonData = {};
						$rootScope.recordsFiltered = d.recordsFiltered;
						// 发展历程
			        	if(d.data.length>1){
		        			for (var i = d.data.length - 1; i >= 0; i--) {
		        				if (!isNaN(d.data[i].findKey)) {
		        					if (d.data[i].findKey) {
				        				var key = d.data[i].findKey.substr(0,4);
				        				$rootScope.yearData.push(key);
				        				$rootScope.yearData =unique($rootScope.yearData)
				        				if (!jsonData[key]) {
				        					jsonData[key] = [];
				        				};
				        				jsonData[key].push(d.data[i])
		        					}
			        			};
		        			};
		        			for(var attr in jsonData){
		        				$rootScope.arrData.unshift( jsonData[attr] );
		        			};
		        			$rootScope.arrData;
		        			$rootScope.yearData.sort(function(a,b){ return b-a });
		        		};
		        		//console.log('-------------')
		        		//console.log($rootScope.yearData)
		        		//console.log($rootScope.arrData)
	        			$rootScope.$apply();
						gundong();
			        	setTimeout(function(){
						  	layer.closeAll();
						},200)
					},
					error: function(e){
						alert('失败！')
					}
				});
			}	

			$rootScope.about_click = function(event){
				$rootScope.lod = false;
				$(event.currentTarget).addClass('on').siblings('li').removeClass('on');
			}
		}])
		.filter('numbera', function() {   
			return function(d) {
				if (!d) return;
				var data = deepCopy(d);
				//console.log(data)
				return data;
			}
		})
		.config(['$routeProvider',function($routeProvider){
			$routeProvider
				.when('/about_tljj/:sn',{
					template : document.getElementById('tljj_view').innerHTML,
					controller: 'about_tljj'
				})
				.when('/about_fzlc/:sn',{
					template : document.getElementById('fzlc_view').innerHTML,
					controller: 'about_fzlc'
				})
				.when('/about_ryzz/:sn',{
					template : document.getElementById('fyzz_view').innerHTML,
					controller: 'about_ryzz'
				})
				.when('/about_tlfc/:sn',{
					template : document.getElementById('tlfc_view').innerHTML,
					controller: 'about_tlfc'
				})
				.otherwise({
					redirectTo : 'about_tljj/'+about_data[0].sn,
					controller: 'about_tljj'
				});
		}])
		.controller('about_tljj',['$scope','$routeParams',function($scope,$routeParams){
			$scope.getContentList($routeParams.sn,1,1)
		}])
		.controller('about_fzlc',['$scope','$routeParams',function($scope,$routeParams){
			$scope.dynamic_desh($routeParams.sn,1,300);//300是极限了吧，
		}])
		.controller('about_ryzz',['$scope','$routeParams',function($scope,$routeParams){
			$scope.getContentList($routeParams.sn,1,1)
		}])
		.controller('about_tlfc',['$scope','$routeParams',function($scope,$routeParams){
			$scope.dynamic_desh($routeParams.sn,1,6)
		}])
		//初始化
		angular.element(document).ready(function() {
			//请求头部
			req.jsonp({
				url:base_url + "/newsType/getDetailsNewsType.do",
				data: {code : 'GYTL'},
				success: function(d){
					if (d.code == 'BUS0000') {
			        	about_data = d.data.childrenNewsType;
						angular.bootstrap(document, ['about']);
		        	}else{
		        		alert('请求失败');
		        	}
				}
			});

		});
	})




