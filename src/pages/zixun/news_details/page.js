require('commons'); 
require('lessDir/zixun/zixun_header.less');
require('lessDir/zixun/zixun.less');

define(['jquery','script/utils/angular', 'script/utils/angular-sanitize.1.2.9.min', 'script/index/load_init','script/utils/req','script/utils/layer','script/zixun/zx_common'],function($, angular, sanitize, LOAD, req ,layer, zx_common){
				
	var url = LOAD.getUrlParams(window.location.href,'?');
	angular.module('zixun_details',['ngSanitize','zxCommon'])

	.run(['$rootScope', function($rootScope) {
	    url.sn = url.sn?url.sn:url['amp;sn'];
		req.jsonp({
			url:base_url + "/news/getNewsByTypeSn.do",
			data: {sn: url.sn, typeSn: url.typeSn},
			success: function(d){
				if (d.code == 'BUS0000') {
					var lm = decodeURIComponent(url.lm);
					d.data.lm = lm?lm:'';
					$rootScope.detail = d.data;
					$('#webBody').html(d.data.webBody);
					$rootScope.pageLoading = true;
					$rootScope.lm = url.lm;//栏目标题
					$rootScope.bitSn = url.bitSn;//栏目的sn
					$rootScope.nextNews = d.data.nextNews;//下一篇
					$rootScope.upNews = d.data.upNews;//上一篇

					var typeNavigation = d.data.typeNavigation.split('-->');//目录
					var mlHtml = '';
					var href = url.code == "RDZT" ? 'redian_list' : (url.code=="TLBK"?'video_list':'news_list');
					for (var i = 0; i < typeNavigation.length; i++) {
						if (i==0) {
							mlHtml += "<a href='/page/zixun'>"+typeNavigation[i]+"</a>"
						}else{
							mlHtml += "<span>></span><a href='/page/zixun/"+href+".html?typeSn="+url.typeSn+"&code="+url.code+"&lm="+lm+"'>"+typeNavigation[i]+"</a>"
						}
					};
					mlHtml += "<a>内容详情</a>"
					$rootScope.mlHtml = mlHtml;
					

					$rootScope.$apply();
				};
				console.log(d)
			},
			error: function(e){
				alert('失败！')
			}
		})
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
		// 底部相关资讯
		req.jsonp({
			url:base_url + "/recommendedBitNewsRelation/getRecommendedBitNewsBySite.do",
			data: {belongSite: '行业资讯文章内页'},
			success: function(d){
				if (d.code == 'BUS0000') {
					$rootScope.xg = d.data;
					$rootScope.$apply();
				};
			},
			error: function(e){
				alert('失败！')
			}
		});

		// //分享代码
		// window._bd_share_config={"common":{"bdSnsKey":{},"bdText":"","bdMini":"2","bdMiniList":false,"bdPic":"","bdStyle":"0","bdSize":"24"},"share":{},"image":{"viewList":["qzone","tsina","tqq","weixin","renren"],"viewText":"分享到：","viewSize":"16"},"selectShare":{"bdContainerClass":null,"bdSelectMiniList":["qzone","tsina","tqq","weixin","renren"]}};with(document)0[(getElementsByTagName('head')[0]||body).appendChild(createElement('script')).src='http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion='+~(-new Date()/36e5)];
	}])
	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['zixun_details']);
	});
})
