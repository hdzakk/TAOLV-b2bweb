define(['script/utils/angular','script/index/load_init','script/utils/req'],function(angular, LOAD ,req){
	var url = LOAD.getUrlParams(window.location.href,'?');
	angular.module('zxCommon', [])
	//类型
	.filter('typeUrl', function() {
		return function(d) {
			if (!d) return;
			var href = '';
			if (d.templateCode == "WZ") {
				href = '/page/about/news_details.html?typeSn='+d.typeSn+'&sn='+d.sn+'&code='+url.code +'&lm=' +url.lm;
			}else if (d.templateCode == "SP") {
				href = '/page/about/vid_details.html?typeSn='+d.typeSn+'&sn='+d.sn+'&code='+url.code +'&lm=' +url.lm;
			}else{
				href = d.jumpUrl;
			}
			return href;
		}
	})
	//推荐位
	.filter('bitUrl', function() {
		return function(d, bitSn, lm) {
			if (!d) return;
			var sn = d.newsSn ? d.newsSn : d.sn;
			var href = '';
			if (d.templateCode == "WZ") {
				href = '/page/zixun/recommended_details.html?bitSn='+bitSn+'&sn='+sn+'&lm='+lm;
			}else if (d.templateCode == "SP") {
				href = '/page/zixun/vid_details.html?bitSn='+bitSn+'&sn='+sn+'&lm='+lm;//+'&playUrl='+d.url;
			}else{
				href = d.url;
			}

			return href;
		}
	})
	//更多
	.filter('moreUrl', function() {
		return function(d) {
			if (!d) return;
			var href = '';
			if (d.jumpUrl!='') {
				if (d.jumpUrl.indexOf('http://')==-1) {
					d.jumpUrl = 'http://' + d.jumpUrl;
				};
				href = d.jumpUrl;
			}else{
				href="/page/zixun/recommended_list.html?bitSn="+d.sn+"&lm="+d.showName;
			}

			return href;
		}
	})
	//文字切割
	.filter('text', function() {
		return function(text) {
			return $.trim(text.substring(0,70));
		}
	})
	//时间戳转日期
	.filter('toDate', function() {
		return function(perDate) {
			var date = new Date(perDate);
			Y = date.getFullYear() + '年';
			M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '月';
			D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + '日';
			var afterDate = Y+M+D;
			return afterDate;
		}
	})
	//订单状态
	.filter('toStart', function() {
		return function(perDate) {
			if(perDate==10){
				return '已下单|待审核';
			}else if (perDate==11) {
				return '审核不通过|订单作废';
			}else if (perDate==12) {
				return '已发货|审核通过';
			}else if (perDate==13) {
				return '待签收|已发货';
			}else if (perDate==14) {
				return '已取消';
			}else if (perDate==20) {
				return '已签收|待派单';
			}else if (perDate==21) {
				return '已派单|待分检';
			}else if (perDate==22) {
				return '已分检';
			}else if (perDate==30) {
				return '待匹配报价|已审分检';
			}else if (perDate==31) {
				return '待审交易数据|已审分检';
			}else if (perDate==32) {
				return '审核通过|确认报价|已报价|价格是否合适';
			}else if (perDate==40) {
				return '申请退货';
			}else if (perDate==41) {
				return '退货审核不通过';
			}else if (perDate==42) {
				return '退货审核通过|待退货';
			}else if (perDate==43) {
				return '已退货';
			}else if (perDate==45) {
				return '暂存';
			}else if (perDate==50) {
				return '交易待审核';
			}else if (perDate==51) {
				return '审核不通过';
			}else if (perDate==52) {
				return '审核通过|已确认交易';
			}else if (perDate==60) {
				return '审核通过|(确认)待入库|已确认交易';
			}else if (perDate==61) {
				return '(入库)审核不通过';
			}else if (perDate==62) {
				return '已入库|审核通过|待付款';
			}else if (perDate==63) {
				return '已付款';
			}

		}
	})

	//点击量
	if (url.sn) req.jsonp({ url:base_url + "/news/newsClick.do",data: {sn:  url.sn}, });

})