require('commons'); 
require('lessDir/zixun/zixun_header.less');
require('lessDir/zixun/zixun.less');

define(['jquery','script/utils/angular', 'script/utils/angular-sanitize.1.2.9.min', 'script/index/load_init','script/utils/req','script/utils/layer','script/utils/pagination','script/zixun/zx_common'],function($, angular, sanitize, LOAD, req ,layer,pagination,zx_common){
				
	var url = LOAD.getUrlParams(window.location.href,'?');
	angular.module('video_list',['ngSanitize','zxCommon'])

	.run(['$rootScope', function($rootScope) {
		$rootScope.code = url.code;
		// 获取视频子类型
		req.jsonp({
			url:base_url + "/newsType/getNewsTypeChildrenList.do",
			data: {code: url.code},
			success: function(d){
				if (d.code == 'BUS0000') {
					$rootScope.childrenType = d.data;
					$rootScope.$apply();
				};
			},
			error: function(e){
				alert('失败！')
			}
		})
	  	//文章列表
	  	var start = 1;//从第几条开始
	  	var length = 8;//条数
	  	var recordsFiltered; //总条数
	  	var getRecommendedBitNewsByRecommendedBitSn = function(start){
	  		req.jsonp({
				url:base_url + "/news/getNewsByTitle.do",
				data: {newsTypeCode: url.code ,start: start, length: length},
				success: function(d){
					if (d.code == 'BUS0000') {
						var lm = decodeURIComponent(url.lm);
						recordsFiltered = d.recordsFiltered;
						$rootScope.list = d.data;
						$rootScope.pageLoading = true;
						$rootScope.lm = lm?lm:'';//栏目标题

						var mlHtml = "<a href='/page/zixun'>行业资讯</a><span>></span><a>"+lm+"</a>";
						$rootScope.mlHtml = mlHtml;

						$rootScope.$apply();

						$("#Pagination").show().pagination(Math.ceil(recordsFiltered/length), {
							num_edge_entries: 1, //边缘页数
							num_display_entries: 4, //主体页数
							items_per_page:1, //每页显示1项
							prev_text:"上一页",
						    next_text:"下一页",
						    current_page: start-1,
						    callback: function(p){
						    	getRecommendedBitNewsByRecommendedBitSn(p+1);
						    }
						});
					};
					console.log(d)
				},
				error: function(e){
					alert('失败！')
				}
			})
	  	}
	  	getRecommendedBitNewsByRecommendedBitSn(start);

	  	//按子类型搜素
	  	var searchChildrenList = function(sn,start){//没分页
	  		req.jsonp({
				url:base_url + "/news/getNewsByTypeSnList.do",
				data: {typeSn:sn,start:start,length:length},
				success: function(d){
					if (d.code == 'BUS0000') {
						$rootScope.list = d.data;
						$rootScope.$apply();
						$("#Pagination").hide();

						// $("#Pagination").pagination(Math.ceil(recordsFiltered/length), {
						// 	num_edge_entries: 1, //边缘页数
						// 	num_display_entries: 4, //主体页数
						// 	items_per_page:1, //每页显示1项
						// 	prev_text:"上一页",
						//     next_text:"下一页",
						//     current_page: start-1,
						//     callback: function(p){
						//     	searchChildrenList(sn,p+1);
						//     }
						// });

					};
		        	
				},
				error: function(e){
					alert('失败！')
				}
			})
	  	}
	  	$rootScope.getVideoChildrenList = function(sn,$event){
	  		start = 1;
	  	 	$($event.currentTarget).addClass('cur').siblings('.btnLi').removeClass('cur');
	  	 	if (sn=='all') {
	  	 		getRecommendedBitNewsByRecommendedBitSn(start);
	  	 		return;
	  	 	};
	  	 	searchChildrenList(sn,start);
	  	 }

	}])
	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['video_list']);
	});
	
})
