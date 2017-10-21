define(['jquery','index/load_init','angular','angular-route','angular-sanitize','utils/pagination','utils/require','superSlide','about/zx_common'],function($ , LOAD, angular,route,sanitize,pagination, req,superSlide,zx_common){
	var url = LOAD.getUrlParams(window.location.href,'?');
	angular.module('about',['ngRoute','ngSanitize','zxCommon']).
	run(['$rootScope', function($rootScope) {
		$rootScope.recordsFiltered ='';//分页请求的总条数
		$rootScope.total_article = '';//分页请求的总条数
		$rootScope.listArr = [];
		$rootScope.arrData = [];//发展历程列表
		$rootScope.yearData = [];//发展历程年份
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
			$("#development_child>.course>ul:gt(0)").find('li:gt(1)').hide();
			$("#development_child>.course>ul:gt(0)").find('li:gt(0)').children('span:eq(0)').text('+ 展开');
			$('.open_show').click(function(){
				$(this).parent().siblings('.no_figure').slideToggle();
				if ($(this).text()=='- 收缩') {
					$(this).text('+ 展开');
				}else{
					$(this).text('- 收缩');
				}
				$(this).parent().parent().siblings().children('.no_figure:gt(0)').slideUp();
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
		//请求头部列表
		$rootScope.getList = function(code){
			req.jsonp({
				url:base_url + "/newsType/getDetailsNewsType.do",
				data: {code : code},
				success: function(d){
					$rootScope.pageLoading = true;
					if(d.data =='') return;
		        	$rootScope.about_data = d.data.childrenNewsType;
		        	var typesn = d.data.childrenNewsType[0].sn;
	        		$rootScope.arr_data = [];
	        		console.log($rootScope.about_data)
		        	$rootScope.arr_data.push($rootScope.about_data[0]);
		        	for (var i=0; i < $rootScope.about_data.length; i++) {
		        		if($rootScope.about_data[i].code == 'TLJJ'){
	        				$rootScope.arr_data[0]=$rootScope.about_data[i];
						}else{
							$rootScope.arr_data.push($rootScope.about_data[i])
						}
		    	 	};
		   			console.log($rootScope.arr_data)
		        	$rootScope.$apply();
		        	$rootScope.getContentList($rootScope.arr_data[0].sn,0,10);
				},
				error:errorMsg
			});
			req.jsonp({
				url:base_url + "/recommendedBitNewsRelation/getRecommendedBitNewsBySite.do",
				data: {belongSite:'关于我们-关于淘绿-社会责任'},
				success: function(d){
					$rootScope.jump_zr = d.data.SHZR.jumpUrl;
				},
				error: function(e){
					alert('失败！')
				}
			});
		}
		//请求列表也
		$rootScope.getContentList = function(typesn,start,length){
			layer.load(0,{shade:[0.1, '#fff']});
			var jsonData = {};	
			req.jsonp({
				url:base_url + "/news/getNewsByTypeSnList",
				data: {typeSn : typesn , start :start , length: length},
				success: function(d){
					$rootScope.pageLoading = true;
		        	if(d.data.length>0){
	        			$rootScope.recordsFiltered = d.recordsFiltered;
	        			$rootScope.total_data = d.data;
	        			console.log($rootScope.total_data)
	        			console.log($rootScope.total_data)
	        			console.log($rootScope.total_data)
	        			var sn = d.data[0].sn;
			        	$rootScope.getContent(typesn,sn)
			        	if(d.data.length>1){
		        			for (var i = d.data.length - 1; i >= 0; i--) {
		        				if (/\d+/g.test(d.data[i].findkey)) {
			        				var key = d.data[i].findkey.substring(0,4)
			        				$rootScope.yearData.push(key);
			        				$rootScope.yearData =unique($rootScope.yearData)
			        				if (!jsonData[key]) {
			        					jsonData[key] = [];
			        				};
			        				jsonData[key].push(d.data[i])
		        				};
		        			};
		        			for(var attr in jsonData){
		        				$rootScope.arrData.unshift( jsonData[attr] );
		        			};
		        			$rootScope.arrData;
		        			$rootScope.yearData.sort(function(a,b){ return b-a });
		        		};
	        			$rootScope.$apply();
	        			console.log($rootScope.yearData)
						gundong();
					}else{
						alert('没有请求到数据')
					}
					setTimeout(function(){
					  	layer.closeAll();
					},200)
					$('[data-toggle=tab]').click(function(event) {
						var _id = $(this).attr('href');
						$(_id).show().siblings('[data-toggle=content]').hide();
						$(this).addClass('cur active').siblings('[data-toggle=tab]').removeClass('cur active');
						return false;
					});
					$(".about_heade>ul>li>a").click(function(){
						$(this).addClass('on').parent().siblings().children().removeClass('on');
						if ($(this).parent().index()==2&&!this.off) {
							this.off = 1;
							
						};
					});
				},
				error: function(e){
					alert('失败！')
				}
			});
		}

		//请求详情页
		$rootScope.getContent = function(typesn,sn){
			req.jsonp({
				url:base_url + "/news/getNewsByTypeSn",
				data: {typeSn:typesn, sn:sn},
				success: function(d){
		        	console.log(d)
		        	console.log(d)
					$rootScope.tljj = d.data;
					$rootScope.$apply();
				},
				error: function(e){
					alert('失败！')
				}
			});
		}

		//新闻动态--淘绿动态请求
		$rootScope.dynamic = function(recommendedBitSn,start,length){
			req.jsonp({
				url:base_url + "/recommendedBitNewsRelation/getRecommendedBitNewsByRecommendedBitSn",
				data: {recommendedBitSn:recommendedBitSn,start:start,length:length},
				success: function(d){
					$rootScope.total_article = d.recordsFiltered;  
					recordsFiltered = d.recordsFiltered;
					Array.prototype.push.apply($rootScope.listArr, d.data); 
					$rootScope.list = $rootScope.listArr;
		        	$rootScope.$apply();
				},
				error: function(e){
					alert('失败！')
				}
			});
		}		
	}]).
	//关于淘绿
	controller('about_tl',['$scope','$location','$routeParams','$timeout','$http','$compile',function($scope,$location,$routeParams,$timeout,$http,$compile){
		var code = url.code; var typesn=url.typeSn;
		$scope.getList(code);
		$scope.point = function(typesn){
			type = typesn;
		 	$scope.getContentList(typesn,1,10);
		 	$scope.arrData.length =0;
		}
		var start = 1;
		var length = 3;
		var type = '';
		//关于淘绿-淘绿风采
		$scope.fencai = function(typesn){
			type=typesn;
			$scope.getContentList(type,start,length);
		}
		$scope.loadMore = function($event){
			start+=length;
			length+=length;
			if (start>$scope.recordsFiltered) {
				$event.currentTarget.innerHTML = '没有更多数据了！'
				return;
			};
			$scope.getContentList(type,start,length);
		}	
	}]).
	//服务范畴
	controller('category',['$scope','$location','$routeParams','$timeout','$http','$compile',function($scope,$location,$routeParams,$timeout,$http,$compile){
		var code = url.code;
		$scope.getList(code);
		 $scope.point = function(typesn){
		 	$scope.getContentList(typesn,1,5);
		 }
	}]).
	//新闻动态
	controller('dynamic',['$scope','$location','$routeParams','$timeout','$http','$compile',function($scope,$location,$routeParams,$timeout,$http,$compile){
		var code = url.code;
		$scope.getList(code);//社会公益-请求头部列表
		
		req.jsonp({
			url:base_url + "/recommendedBitNewsRelation/getRecommendedBitNewsBySite.do",
			data: {belongSite:'关于我们-新闻动态'},
			success: function(d){
				$scope.ldata = d.data;
				console.log(d)
				console.log(d)
			},
			error: function(e){
				alert('失败！')
			}
		});

		//淘绿动态
		var opne = 1;
		var how_many = 10;
		$scope.dynamic();//淘绿动态-请求推荐位
		
		$scope.dianji = function(sn,name){
			recommendedBitSn =sn;
			opne = 1;
			how_many = 10;
			$scope.listArr.length = 0;
			$scope.dynamic(recommendedBitSn,opne,how_many);
			console.log(name)
			if(name=='媒体报道'){
				req.jsonp({
					url:base_url + "/recommendedBitNewsRelation/getRecommendedBitNewsBySite.do",
					data: {belongSite:'关于我们-新闻动态-媒体报道'},
					success: function(d){
						console.log(d);	console.log(d);	console.log(d);	console.log(d);	  
						$scope.hgsp_data = d.data.XGSP;
						console.log($scope.hgsp_data)
			        	$scope.$apply();
			        	$(".slideTxtBox").slide({titCell:".hd ul",mainCell:".bd ul",autoPage:true,effect:"left",autoPlay:false,vis:4});
					},
					error: function(e){
						alert('失败！')
					}
				});
			}
		}
		$scope.addMore = function($event){
			//$('body,html').animate({scrollTop:$('.top_li').offset().top},500); 
			var page = Math.ceil($scope.total_article/how_many)
			opne += 1;
			if (opne>page) {
				$event.currentTarget.innerHTML = '没有更多数据了！'
				return;
			};
			$scope.dynamic(recommendedBitSn,opne,how_many);//淘绿动态-请求推荐位
		}


		//社会公益
		var start = 1;
		var length = 10;
		var type = '';
		//新闻动态-社会公益
		$scope.point = function(typesn){
			type = typesn;
			$scope.getContentList(type,start,length);
		}
		$scope.loadMore = function($event){
			start+=length;
			length+=length;
			if (start>$scope.recordsFiltered) {
				$event.currentTarget.innerHTML = '没有更多数据了！'
				return;
			};
			$scope.getContentList(type,start,length);
		}	
	}]).
	//隐私与版权
	controller('privacy',['$scope','$location','$routeParams','$timeout','$http','$compile',function($scope,$location,$routeParams,$timeout,$http,$compile){
		var code = url.code;
		$scope.getList(code);
		$scope.point = function(typesn){
		 	$scope.getContentList(typesn,1,5);
		}
	}]).
	//人才招聘
	controller('talent',['$scope','$location','$routeParams','$timeout','$http','$compile',function($scope,$location,$routeParams,$timeout,$http,$compile){
		var typesn = url.typeSn; 
		$scope.getContentList(typesn,0,1)
	}]).
	//联系我们
	controller('contact_me',['$scope','$location','$routeParams','$timeout','$http','$compile',function($scope,$location,$routeParams,$timeout,$http,$compile){
		var typesn = url.typeSn; 
		$scope.getContentList(typesn,0,1)
	}])
	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['about']);
	});
	$(".about_heade>ul>li>a").click(function(){
		$(this).addClass('on').parent().siblings().children().removeClass('on');
		if ($(this).parent().index()==2&&!this.off) {
			this.off = 1;
			
		};
	});
})