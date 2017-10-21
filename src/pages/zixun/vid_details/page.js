require('commons'); 
require('lessDir/zixun/zixun_header.less');
require('lessDir/zixun/zixun.less');

define(['jquery','script/utils/angular', 'script/utils/angular-sanitize.1.2.9.min', 'script/index/load_init','script/utils/req','script/utils/layer','script/zixun/zx_common'],function($, angular, sanitize, LOAD, req ,layer,zx_common){
				
	var url = LOAD.getUrlParams(window.location.href,'?');
	angular.module('video_details',['ngSanitize','zxCommon'])
	
	.directive('embedSrc', function () {  
	  return {  
	    restrict: 'A',  
	    link: function (scope, element, attrs) { 
	      var current = element;  
	      scope.$watch(function() {
	      	 return attrs.embedSrc;
	       }, function () {  
	       		if (attrs.embedSrc) {
		       		 var clone = element.clone().attr('src', attrs.embedSrc).attr('width','800').attr('height','500');  
		       		 current.replaceWith(clone);  
		       		 current = clone; 
	       		}; 
	      });  
	    }  
	  };  
	})
	.run(['$rootScope', function($rootScope) {
	  
	    url.sn = url.sn?url.sn:url['amp;sn'];
	    var data = {};
	    var _url = '';
	    if (url.typeSn) {//类型
	    	_url = "/news/getNewsByTypeSn.do"
	    	data = {
	    		typeSn: url.typeSn,
	    		sn: url.sn
	    	}
	    	$rootScope.typeSn = true;
	    }else{//推荐位
	    	_url = "/news/getRecommendedBitNews.do"
	    	data = {
	    		recommendedBitSn: url.bitSn,
	    		sn: url.sn
	    	}
	    	$rootScope.typeSn = false;
	    }

		req.jsonp({
			url:base_url + _url,
			data: data,
			success: function(d){
				if (d.code == 'BUS0000') {
					var lm = decodeURIComponent(url.lm);
					d.data.lm = lm?lm:'';
					$rootScope.detail = d.data;
					if (d.data.jumpUrl.indexOf('iframe')>=0) {
						$('.video_box').html(d.data.jumpUrl.replace(/(width|height)+/gi,''));
					}else{
						$('.video_box').remove();
					}
					
					$('#webBody').html(d.data.webBody);
					$rootScope.pageLoading = true;
					
					$rootScope.lm = url.lm;//栏目标题
					$rootScope.bitSn = url.bitSn;//栏目的sn

					$rootScope.nextNews = d.data.nextNews;//下一篇
					if ($rootScope.nextNews) {
						if (!$rootScope.nextNews.typeSn) {
							$rootScope.nextNews.typeSn = d.data.typeSn;
						};
					};

					$rootScope.upNews = d.data.upNews;//下一篇
					if ($rootScope.upNews) {
						if (!$rootScope.upNews.typeSn) {
							$rootScope.upNews.typeSn = d.data.typeSn;
						};
					};

					var typeNavigation = d.data.typeNavigation.split('-->');//目录
					var mlHtml = '';
					if (url.typeSn) {
						for (var i = 0; i < typeNavigation.length; i++) {
							if (i==0) {
								mlHtml += "<a href='/page/zixun'>"+typeNavigation[i]+"</a>"
							}else{
								mlHtml += "<span>></span><a href='/page/zixun/video_list.html?typeSn="+url.typeSn+"&code="+url.code+"&lm="+lm+"'>"+typeNavigation[i]+"</a>"
							}
						};
						mlHtml += "<a>内容详情</a>"
						$rootScope.mlHtml = mlHtml;
					}else{
						$rootScope.mlHtml = decodeURIComponent(url.lm);
					}
					$rootScope.$apply();
				};
				console.log(d)
			},
			error: function(e){
				alert('失败！')
			}
		})

		$rootScope.openUrl = function(bitSn,sn,lm){
			window.location.href = 'tl_details.html?bitSn='+bitSn+'&sn='+sn+'&lm='+lm;
		}
		
	}])
	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['video_details']);
	});
})