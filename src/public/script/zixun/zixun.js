define(['jquery','script/index/load_init','script/utils/angular','script/utils/pagination','script/utils/superSlide','script/utils/req','script/utils/layer','script/zixun/zx_common'],function($, LOAD, angular, pagination, superSlide, req, layer, zx_common){
	angular.module('zinxun',['zxCommon'])
	.run(['$rootScope', function($rootScope) {
		//获取首页推荐文章	
		req.jsonp({
			url:base_url + "/recommendedBitNewsRelation/getRecommendedBitNewsBySite.do",
			data: {belongSite: '行业资讯首页'},
			success: function(d){
				if (d.code == 'BUS0000') {
					$rootScope.zx = d.data;
					$rootScope.pageLoading = true;
					$rootScope.$apply();
					zixunInit();

					$('.dynamic .tab_nav').on('click','a',function(){
						var _text = $(this).data('text');
						if (_text) {
							getQuoteListFn(_text);
							$(this).addClass('cur').siblings().removeClass('cur');
						};
					}).find('a:eq(0)').click();
				};
	        	//console.log(d)
			},
			error: errorMsg
		});


		//获取报价list
		var getQuoteListFn = function(title){
			var dateArr = getDateArr(6).reverse();
			var dateList = [];

			for (var i = 0; i < dateArr.length; i++) {
				dateList.push({
					time:dateArr[i],
					title:dateArr[i]+' '+title+"回收行情报价",
					productCategory:title
				})
			};

			//console.log(dateList)
			$rootScope.dateList = dateList;
			$rootScope.$apply();
			// var dailyQuote_html = template('dailyQuote', {data:dynamic});
			// $('#waste_phone').html( dailyQuote_html );
		}	
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

	}])
	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['zinxun']);
	});

	function zixunInit(){
		
		function pageselectCallback(page_index, jq){
			var new_content = $("#hiddenresult div.result:eq("+page_index+")").clone();
			$("#Searchresult").empty().append(new_content); //装载对应分页的内容
			return false;
		}
		$(".screening>ul>li>a").click(function(event){
			event.preventDefault();
			$(this).addClass('on').parent().siblings().children().removeClass('on'); 
		});

		$(".slideBox").slide({
			mainCell:".bd ul",
			autoPlay:true,
			interTime:5000,
			effect:"left"
		})
		$(".slideTxtBox").slide({titCell:".hd ul",mainCell:".bd ul",autoPage:true,effect:"left",autoPlay:false,vis:4});
	}
})