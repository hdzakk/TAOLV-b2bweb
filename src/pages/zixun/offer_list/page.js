require('commons'); 
require('lessDir/zixun/zixun_header.less');
require('lessDir/zixun/zixun.less');
define(['jquery','script/utils/angular', 'script/utils/angular-sanitize.1.2.9.min', 'script/index/load_init','script/utils/req','script/utils/layer','script/zixun/zx_common'],function($, angular, sanitize, LOAD, req ,layer, zx_common){
				
		var url = LOAD.getUrlParams(window.location.href,'?');
		angular.module('zixun_list',['ngSanitize','zxCommon'])
		
		.run(['$rootScope', function($rootScope) {
			//获取以往日期
			var getDateArr = function(day){
				var day = day?day:6;
				var myDate = new Date(); //获取今天日期
				myDate.setDate(myDate.getDate() - day);
				var dateArray = []; 
				var dateTemp; 
				var flag = 1; 
				var d = function(d){
					return d<10? '0'+d : d;
				}
				for (var i = 0; i < day+1; i++) {
				    dateTemp = myDate.getFullYear()+"-"+d((myDate.getMonth()+1))+"-"+d(myDate.getDate());
				    dateArray.push(dateTemp);
				    myDate.setDate(myDate.getDate() + flag);
				} 
				return dateArray;
			}
		  	var start = 1;//从第几条开始
		  	var length = 10;//条数
		  	var recordsFiltered; //总条数
		  	$rootScope.list = [];
		  	var generateOffer = function(start){
		  		var date = getDateArr(start*length).reverse();
		  		$rootScope.list = [];
		  		for (var i = 0; i < date.length; i++) {
		  			$rootScope.list.push(
			  			{
				  			title: date[i] + '废旧手机回收价格行情',
				  			time: date[i],
				  			productCategory: '废旧手机'
				  		},
				  		{
				  			title: date[i] + '废旧电脑回收价格行情',
				  			time: date[i],
				  			productCategory: '废旧电脑'
				  		},
				  		{
				  			title: date[i] + '手机内存卡回收价格行情',
				  			time: date[i],
				  			productCategory:'内存卡'
				  		}
			  		)
		  		};
		  		$rootScope.$apply();
		  	}
		  	generateOffer(start);
		    
		    $rootScope.isMore = true;
		  	//加载更多
			$rootScope.loadMore = function($event){
				start++;
				generateOffer(start);
			}
		  	
			//右侧阅读排行
			req.jsonp({
				url:base_url + "/recommendedBitNewsRelation/getRecommendedBitNewsBySite.do",
				data: {belongSite: '行业资讯子页面'}, 
				success: function(d){
					$rootScope.pageLoading = true;
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

