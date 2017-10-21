require('commons'); 
require('lessDir/zixun/zixun_header.less');
require('lessDir/zixun/zixun.less');


define(['jquery','script/utils/angular', 'script/utils/angular-sanitize.1.2.9.min', 'script/index/load_init','script/utils/req','script/utils/layer','script/zixun/zx_common'],function($, angular, sanitize, LOAD, req ,layer, zx_common){
		
	var url = LOAD.getUrlParams(window.location.href,'?');
	angular.module('zixun_list',['ngSanitize','zxCommon'])
	
	.run(['$rootScope', function($rootScope) {
	  	//文章列表
	  	var start = 1;//从第几条开始
	  	var length = 5;//条数
	  	var recordsFiltered; //总条数
	  	var list = [];
	  	var getNewsBySearchContent = function(find_content){//文章搜索
	  	
	  		req.jsonp({
				url:base_url + "/news/getNewsByTitle.do",
				data: {newsTypeCode:'HYZX',start:start,length:length,title:decodeURIComponent(find_content)},
				success: function(d){
					if (d.code == 'BUS0000') {
						var lm = decodeURIComponent(url.lm);

						recordsFiltered = d.recordsFiltered;
						Array.prototype.push.apply(list, d.data); 
						$rootScope.list = list;
						
						$rootScope.pageLoading = true;
						$rootScope.mlHtml = '搜索结果';
						$rootScope.isMore = recordsFiltered<=length?false:true;
						$rootScope.$apply();
					}
					console.log(d)
				},
				error: function(e){
					alert('失败！')
				}
			})
	  	}

	  	//加载更多
		$rootScope.loadMore = function($event){
			start += length;
			if (start>recordsFiltered) {
				$event.currentTarget.innerHTML = '没有更多数据了！'
				$rootScope.isMore = false;
				return;
			};
			getRecommendedBitNewsByRecommendedBitSn(start);
		}
	  	

	  	var getRecommendedBitNewsByRecommendedBitSn = function(start){
	  		req.jsonp({
				url:base_url + "/news/getNewsByTypeSnList",
				data: {typeSn: url.typeSn, start: start, length: length},
				success: function(d){
					if (d.code == 'BUS0000') {
						var lm = decodeURIComponent(url.lm);

						recordsFiltered = d.recordsFiltered;
						Array.prototype.push.apply(list, d.data); 
						$rootScope.list = list;
						
						$rootScope.pageLoading = true;
						$rootScope.lm = lm?lm:'';//栏目标题

						var mlHtml = "<a href='/page/zixun'>行业资讯</a><span>></span><a>"+lm+"</a>";
						$rootScope.mlHtml = mlHtml;
						
						$rootScope.isMore = recordsFiltered<=length?false:true;
						$rootScope.$apply();
					};
		        	console.log(d)
				},
				error: function(e){
					alert('失败！')
				}
			})
	  	}
	  	if (url.search==''||url.search) {
	  		getNewsBySearchContent(url.search);//搜索
	  	}else{
	  		getRecommendedBitNewsByRecommendedBitSn(start);
	  	}

	  	
		//右侧阅读排行
		req.jsonp({
			url:base_url + "/recommendedBitNewsRelation/getRecommendedBitNewsBySite.do",
			data: {belongSite: '行业资讯子页面'}, 
			success: function(d){
				if (d.code == 'BUS0000') {
					$rootScope.ph = d.data;
					$rootScope.$apply();
				};
			},
			error: function(e){
				alert('失败！')
			}
		});

	}])
	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['zixun_list']);
	});
	
})

