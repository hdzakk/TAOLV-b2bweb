define(['jquery','script/index/load_init','script/utils/req','script/utils/angular','script/utils/layer'],function($, LOAD ,req ,angular,layer){
	
	angular.module('buy',[]).
	run(['$rootScope','$compile', function($rootScope,$compile) {
		var url = LOAD.getUrlParams(window.location.href,'#');
		var $s = $rootScope;
		$s.historys = [];//历史搜索
		$s.hotList = [];//热搜内容
		$s.keyWord = url.search?decodeURIComponent(url.search):'';//搜索关键字
		$s.step = 1;
		var num = 0;

		var filterOffer = function(d){//过滤没有报价的
			for (var i = 0; i < d.length; i++) {
				if (d[i].value=='') {
					d.splice(i, 1);
					i--;
				};  
			};
			return d;
		}
		$s.go_offer_search = function(goodsName){
			
			if ($s.pageLoading) {
				layer.load(0,{shade:[0.1, '#fff']});
				window.location.hash = 'search='+encodeURI(goodsName);
			}
			
			// goodsName = goodsName == "苹果"?'iphone':goodsName;
			req.jsonp({
				url:base_url + "/systemset/sellHistory/priceList.do",
				data: {key: goodsName == "苹果"?'iphone':goodsName},
				success: function(d){
					if (d.code == 'BUS0000') {
						$s.keyWord = goodsName;
						for (var i = 0; i < d.data.length; i++) {

							if (d.data[i].grade) {
								d.data[i].grade = JSON.parse(d.data[i].grade);
								var _data = filterOffer(d.data[i].grade);
								if (_data.length>0) {
									d.data[i].first = _data[0];
									_data.splice(0, 1);
								}else{
									d.data.splice(i, 1);//没有报价删除掉
									i--;
								}
							};
						};
					
						$s.goodsOfferList = d.data;
						
						//历史记录
						var list = window.localStorage.getItem("historyList");
						if (list) {
							list = JSON.parse(list);
							for (var i = 0; i < list.length; i++) {
								if (list[i].goodsName==$s.keyWord) {
									list.splice(i,1);//已经存在的删除
								};
							};
							list.unshift({
								goodsName: goodsName
							});

							window.localStorage.setItem("historyList",JSON.stringify(list));
						}else{
							list = [{
								goodsName: goodsName
							}];
							window.localStorage.setItem("historyList",JSON.stringify(list));
						}

						// $s.historys = list;
						$s.$apply();

						// $('body,html').animate({
						// 	scrollTop: 180
						// },500);
					}else{
						
					}

					//window.location.href = '/page/search/?search='+encodeURI(goodsName);
					layer.closeAll();
					loadComplete();
				},
				error: function(e){
					//loading.msg('服务器请求失败');
				}
			});
		}
		$s.go_offer_search($s.keyWord);
		//热搜内容
		req.jsonp({
			url:base_url + "/systemset/sellHistory/hotList.do",
			data: {},
			success: function(d){
				if (d.code == 'BUS0000') {
					$s.hotList = d.data;
				}else{
					$s.hotList = [];
					// loading.msg(d.msg);
				}
				loadComplete();
				$s.$apply();
			},
			error: function(e){
				//loading.msg('服务器请求失败');
			}
		});
		//搜索历史
		(function(){
			//window.localStorage.clear();
			var list = window.localStorage.getItem("historyList");
			if (list) {
				list = JSON.parse(list);
				if (list.length>20) {
					list.length = 20;
				};
			}else{
				list = [];
			}
			$s.historys = list;
			console.log($s.historys)
			$s.$apply();
		})();

		var _searchKeyWord = $('#searchKeyWord');
		$(document).keydown(function(event) {
			if (!_searchKeyWord.is(':focus')) return;
			if (event.keyCode == 13) {
				$s.go_offer_search(_searchKeyWord.val());
				$s.$apply();
			}
		});

		function loadComplete(){
			num++;
			if (num==2) {
				$s.pageLoading = true;
				$s.$apply();
			};
		}

		//热搜内容涨开
		$s.visible = function(event){
			var $wrap_btn = $(event.currentTarget).siblings('li').find('.wrap_btn')
			$wrap_btn.toggleClass('visible');
			if ($wrap_btn.hasClass('visible')) {
				$(event.currentTarget).html('点击隐藏')
			}else{
				$(event.currentTarget).html('点击展开')
			}
		}
		//点击到规格页面
		var goodSn = '';
		$s.goResult = function(d){
			//window.sessionStorage.setItem("offerList", JSON.stringify(d));
			$s.keyWords = d.goodsName;
			// $s.goodsOfferResuitList.push(d)
			goodSn = d.sn;
			document.body.scrollTop = 0;
			req.jsonp({
				url:base_url + "/systemset/sellHistory/standard.do",
				data: {
					sn:d.sn
				},
				success: function(d){
					if (d.code == 'BUS0000') {

						if ( d.data.standardValue.indexOf('[')>=0 && d.data.standardValue != '[]') {
							var arr = JSON.parse( d.data.standardValue );
							for (var i = 0; i < arr.length; i++) {
								if (arr[i].list.indexOf('[')>=0) {
									arr[i].list = JSON.parse(arr[i].list);
								};
							};
							$s.step = 2;
							$s.phoneStandard = arr;
							$s.$apply();
						}else{//没有规格
							$s.step = 3;
							gradePriceList($s.keyWords);
						}
					}else{
						layer.msg(d.msg)
					}
					
					$s.$apply();
				},
				error: function(e){
					//loading.msg('服务器请求失败');
				}
			});
		}

		var choiceStandardJson = {};//选择的规格Json

		$s.returnFn = function(){
			$s.step = 1;
			choiceStandardJson = {};
		}

		$s.choiceMemory = function(t,name,event){

			$(event.currentTarget).toggleClass('cur').siblings().removeClass('cur');
			choiceStandardJson[name] = t;

			var i = 0;
			for(var attr in choiceStandardJson){
				i++;
			}

			if (i==this.phoneStandard.length) {//全部选好则到下一步
				
				for(var attr in choiceStandardJson){
					$s.keyWords += ' '+choiceStandardJson[attr];
				}
				gradePriceList($s.keyWords);
			};
		}

		function gradePriceList(goodsName){
			req.jsonp({
				url:base_url + "/systemset/sellHistory/gradePriceList.do",
				data: {
					sn:goodSn,
					goodsName:goodsName
				},
				success: function(d){
					
					if (d.code == 'BUS0000') {
						for (var i = 0; i < d.data.length; i++) {
							var arr = [];
							for(var j in d.data[i]){
								if(j.length==6&&j.indexOf('grade')>=0&&d.data[i][j]>=0){
									console.log(j)
									arr.push({
										name: j.substring(5),
										value: Number(d.data[i][j]).toFixed(2)
									})
								}
							}
							d.data[i].grade = arr;
						};

						for (var i = 0; i < d.data.length; i++) {
							if (d.data[i].grade) {
								var _data = d.data[i].grade;
								if (_data.length>0) {
									d.data[i].first = _data[0];
									_data.splice(0, 1);
								}else{
									d.data.splice(i, 1);//没有报价删除掉
									i--;
								}
							};
						}

						$s.goodsOfferResuitList = d.data;
						$s.step = 3;
						console.log(d)
					}else{
						layer.msg(d.msg)
					}
					
					$s.$apply();
				},
				error: function(e){
					//loading.msg('服务器请求失败');
				}
			});
		}


		//规格
		
		// $s.pageLoading = true;

		//查看等级说明
		$s.lookGrade = function(){
			var index = layer.load(0,{shade:[0.1, '#fff']});
			req.jsonp({
				url:base_url + "/systemset/gradeManage/findAll.do",
				data: {},
				success: function(d){
					if (d.code == "BUS0000") {
						layer.open({
							title: '等级说明',
							fixed: true,
							btn: false,
							skin: 'demo-class',
							area: ['770px','330px'],
							content: $('#gradeExplain').html(),
							success:function(obj,q){
								layer.close(index);
								var template = angular.element(obj[0]);
								$compile(template)($s);
								console.log(d)
								$s.gradeList = d.data;
								$s.$apply();
							}
						});
					}else{
						layer.msg(d.msg);
					}
				}
			})
		}

	}])
	
	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['buy']);
	});
})