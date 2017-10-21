define(['jquery','script/index/load_init','script/utils/angular','script/utils/req','script/utils/layer','script/utils/pagination'],function($, LOAD, angular, req, layer ,pagination){
	var token = getStorageToken();
	var url = LOAD.getUrlParams(window.location.href,'?');
	angular.module('sellIndex',[])
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
	//名字过滤
	.filter('filterName', function() {
		return function(name) {
			var reg = new RegExp("[^"+name.charAt(0)+"]+")
			return name.replace(reg,function(s){
				var str = '';
				for (var i = 0; i < s.length; i++) {
					str+='*';
				};
				return str;
			});
		}
	})
	//字符串截取（订单号截取）
	.filter('intercept', function() {
		return function(name) {
			return name.substr(0,4) +""+ name.substr(12,name.length)
		}
	})
	.directive('percent', ['$timeout', function($timeout) {
		return {
			restrict: 'AE',
			scope: {
				val: "=percent",
			},
			link: function(scope, element, attrs, controller) {
				$(element).css({'width':scope.val+'%'})
			}
		};
	}])
	.run(['$rootScope', function($rootScope) {
		var $s = $rootScope,
			pageNum = 1,//页数
			pageSize = 5,//每页的条数
			// 获得订单信息
		    getSellOrderInfoPage = function(data,term){
		    	
		    	if (term) {//按条件搜索就有loding
		    		layer.load(0,{shade:[0.1, '#333']}); 
		    	}
				req.jsonp({
					url:base_url + "/buyOrderDetail/findBuyOrderDetailModelExtendListByOther.do",
					//url:"http://192.168.1.43:8080/b2b.www/buyOrderDetail/findBuyOrderDetailModelExtendListByOther.do",
					data: {
						pageNum:data.pageNum,
						pageSize:data.pageSize,
						json: JSON.stringify(data.json)
					},
					success: function(d){
						
						if (d.code == "BUS0000") {
							setTimeout(function(){
				        		layer.closeAll();
				        	},500)
							$s.pageLoading = true;
							if (!d.data) {
								d.data = [];
							};

							if (term) {
								// if (d.data.length>0) {
								// 	$('body,html').animate({scrollTop:$('.result_data').offset().top-10});
								// }else{
									$('body,html').animate({scrollTop:$('.good_screen').offset().top-10});
								// }
							};
							//window.localStorage.setItem("buyOrderList", JSON.stringify(data) );
							$s.buyOrderList = d;
							// $.map($s.buyOrderList.data,function(o,i){
							// 	o.finishDegree = 100;
							// 	return o;
							// })
							$s.$apply();
							var totalPage = Math.ceil(parseInt(d.recordsFiltered)/parseInt(data.pageSize))
							$("#Pagination").pagination(totalPage, {
								num_edge_entries: 1, //边缘页数
								num_display_entries: 4, //主体页数
								items_per_page:1, //每页显示1项
								prev_text:"上一页",
							    next_text:"下一页",
							    current_page: data.pageNum - 1,
							    callback: function(p){
							    	submitData.pageNum = p+1;
							    	// $('body,html').animate({scrollTop:420},300,function(){
							    		
							    	// }); 
							    	getSellOrderInfoPage(submitData,true);
							    	//layer.load(0,{shade:[0.1, '#333']});
							    }
							});
						}else{
							layer.closeAll();
							layer.msg(d.msg)
						}
						//console.log(d)
					},
					error: errorMsg
				});
		},
		submitData = {
			pageNum: pageNum,//页数
			pageSize: pageSize,//每页的条数
			json: {
				goodsCategory:'',//货物类型
				goodsName:url.search?decodeURIComponent(url.search):'',//货物名称
				sendCity:'',//交货地
				finishState:''//状态
			}
		}
		getSellOrderInfoPage(submitData);

		$s.listTitle = url.search?'搜索结果':'信息列表';
		$s.searchText = url.search?decodeURIComponent(url.search):'';
		//搜索

		$s.goodsSearch = function(){
			/*if (!$s.searchText) {
				layer.msg('请输入搜索内容',{time:1000});
				document.querySelector('input[ng-model="searchText"]').focus();
				return;
			};*/
			submitData.pageNum = pageNum;
			submitData.pageSize = pageSize;
			submitData.json.goodsCategory = '';
			submitData.json.goodsName = $s.searchText;
			getSellOrderInfoPage(submitData,true);
		}
		//我要供货
		$s.supplyCommodityBtn = function(d){
			//console.log(d)
			var j = [{
				classifyName:d.buyOrderDetail.goodsName,
                goodsExplain:"",
                id:d.id,
                maxPrice:'',
                minPrice:'',
                number:d.buyNum,//数量
                productCategory:d.buyOrderDetail.goodsCategoryName,//货物名称
                referencePrice:d.buyPrice,//价格
                sn:d.buyOrderDetail.goodsSn,//sn
                unitValue:d.buyOrderDetail.goodsUnit,
                gradeName:d.gradeName,//等级
				gradeSn:d.gradeSn //等级sn
			}]

			LOAD.getUserInfo.done(function(d){
				window.sessionStorage.setItem("typeList", JSON.stringify( j ) );
				window.location.href = '/page/sell/order_info.html';
			}).fail(function(){
				LOAD.login('/page/sell/order_info.html',function(){
					window.sessionStorage.setItem("typeList", JSON.stringify( j ) );
				})
			});
		}
		
		//以下是筛选信息
		//统货下单
		//获取E等级列表
  		var _gradeSn = "DJGL16110416131445EV83v2p2TH88R81478247194579";
		req.jsonp({
			url:base_url + "/systemset/gradeManage/findAll.do",
			data:{gradeName:'E'},
			success: function(d){
				if (d.code == 'BUS0000') {
					_gradeSn = d.data[0].sn;
				};
			},
			error: function(e){
				
			}
		});
		$s.gradelessXiad = function(){
			
			var _num = $.trim($s.gradelessNum)
			if (!/\d+/.test(_num)&&_num!=undefined&&_num!='') {
				layer.msg('只能输入数字');
				return;
			};
			layer.load(0,{shade:[0.1, '#333']});
			req.jsonp({
				url:base_url_admin + "/systemset/sellManage/selectByProCategory.do",
				data: {productCategory: '手机统货'},
				success: function(d){
					layer.closeAll();
					if (d.code == 'BUS0000') {
						var typeList = d.data;
						$.map(typeList,function(o,i){
							o.number = _num;
							o.gradeSn = _gradeSn;
							o.gradeName = "E";
						})
						LOAD.getUserInfo.done(function(d){
							window.sessionStorage.setItem("typeList", JSON.stringify( typeList ) );
							window.location.href = '/page/sell/order_info.html';
						}).fail(function(){
							LOAD.login('/page/sell/order_info.html',function(){
								window.sessionStorage.setItem("typeList", JSON.stringify( typeList ) );
							})
						});
					}else{
						layer.msg(d.msg);
					}
		        	//console.log(d)
				},
				error: function(e){
					alert('服务器繁忙！')
				}
			});
		}

		//获取货物类型
		$s.getSellClassifyInfo = function(name,$event,index){
			if ($($event.currentTarget).hasClass('cur')) return;
			$($event.currentTarget).addClass('cur').siblings('a').removeClass('cur');
            submitData.json.goodsName = '';//货物名称
			if (name == 'all') {//所有
				$('li.drop_down').hide();
				submitData.pageNum = pageNum;
				submitData.pageSize = pageSize;
				submitData.json.goodsCategory = '';
				submitData.json.goodsName = '';
				submitData.json.sendCity = '';
				getSellOrderInfoPage(submitData,true);//搜索调用
				return;
			}else{
				layer.load(0,{shade:[0.1, '#333']}); 
				getSellClassifyInfo(name);
			}
			$(event.currentTarget).parents('li').siblings('.drop_down').removeClass('visible').find('.openBtn').html('更多<i>∨</i');
			submitData.json.goodsCategory = name;//货物类型
			//console.log(submitData)
		}
		// 更多
		$s.showMore = function(event){ //visible
			var obj = $(event.currentTarget).parent();
			if (obj.hasClass('visible')) {
				$(event.currentTarget).html('更多<i>∨</i')
			}else{
				$(event.currentTarget).html('收起<i>∨</i')
			}
			obj.toggleClass('visible');
		}
		//货物货物名称
		$s.getGoodName = function(goodName,$event){
			layer.load(0,{shade:[0.1, '#333']}); 
			$($event.currentTarget).addClass('cur').siblings('a').removeClass('cur');
			submitData.pageNum = pageNum;//初始化页数
			submitData.pageSize = pageSize;
			submitData.json.goodsName = goodName;//货物名称
			submitData.json.goodsCategory = '';
			submitData.json.sendCity = '';
			getSellOrderInfoPage(submitData,true);//搜索调用
		}
		
		//获取二手手机型号
		$s.getPhoneModel = function(){
			if (!$s.phoneModel) {
				$s.modelList = [];
				return;
			}
			req.jsonp({
				url:base_url_admin + "/systemset/modelManage/modelList.do",
				data: {categoryManageSn: $s.phoneModel.sn},
				success: function(d){
					if (d.code == 'BUS0000') {
						$s.modelList = d.data;
						$s.$apply();
					};
		        	//console.log(d)
				},
				error: function(e){
					alert('数据请求失败！')
				}
			});
		}
		//获取二手品类名称（品类搜索）
		/*$s.getSecondGoodsName = function(){
			if ($s.phoneModel&&$s.secondGoodsName) {
				submitData.pageNum = pageNum;//初始化页数
				submitData.pageSize = pageSize;
				submitData.json.goodsCategory = '二手';
				submitData.json.goodsName = $s.phoneModel.brand +' '+ $s.secondGoodsName.promodelName;//货物名称
				getSellOrderInfoPage(submitData,true);//搜索调用
			};
		}*/
		//点击状态
		$s.getsellState = function(state,$event){
			$($event.currentTarget).addClass('cur').siblings('a').removeClass('cur');
			submitData.pageNum = pageNum;//初始化页数
			submitData.pageSize = pageSize;
			submitData.json.finishState = state;//交货地
			submitData.json.goodsCategory = '';
			submitData.json.goodsName = '';
			getSellOrderInfoPage(submitData,true);//搜索调用
		}
		//点击交货地
		$s.getPlaceDelivery = function(name,$event){
			$($event.currentTarget).addClass('cur').siblings('a').removeClass('cur');
			submitData.pageNum = pageNum;//初始化页数
			submitData.pageSize = pageSize;
			submitData.json.sendCity = name;//交货地
			submitData.json.goodsCategory = '';
			submitData.json.goodsName = '';
			getSellOrderInfoPage(submitData,true);//搜索调用
		}
		//获取交货地
		var getPlaceDelivery = function(){
			req.jsonp({
				url:base_url+"/buyOrderDetail/findSendCityForAll.do",
				data: {},
				success: function(d){
					if (d.code == 'BUS0000') {
						$s.sendCity = d.data;
						console.log($s.sendCity)
						$s.$apply();
					};
		        	//console.log(d)
				},
				error: function(e){
				}
			});
		}
		getPlaceDelivery();

		//获取品类下面的货物名称
		var getSellClassifyInfo = function(name){
			req.jsonp({
				url:base_url_admin + "/systemset/sellManage/selectByProCategory.do",
				data: {productCategory: name},
				success: function(d){
					if (d.code == 'BUS0000') {
						$s.goodsList = d.data;
						$.map($s.goodsList,function(o,i){
							o.number = '1';
						})
						$s.$apply();
						$('#goods_down').show().siblings('.drop_down').hide();
						submitData.pageNum = pageNum;//初始化页数
						submitData.pageSize = pageSize;
						submitData.json.goodsName = '';//默认获取第一条
						getSellOrderInfoPage(submitData,true);//搜索调用
					};
		        	//console.log(d)
				},
				error: function(e){
					alert('页面加载失败！')
				}
			});
		}
		// 获取二手品牌信息
		var getSecondCategoryInfo = function(){
			
			req.jsonp({
				url:base_url_admin + "/systemset/categoryManage/brandList.do",
				success: function(d){
					if (d.code == 'BUS0000') {
						$s.secondList = d.data;
						$s.$apply();
					};
		        	//console.log(d)
				},
				error: function(e){
					// alert('页面加载失败！')
				}
			});
		}
		getSecondCategoryInfo();



		//获取货物分类
		// var second = {
		// 	typeName: '二手'
		// }
		// req.jsonp({
		// 	url:base_url_admin + "/systemset/sellManage/types.do",
		// 	success: function(d){
		// 		if (d.code == 'BUS0000') {
		// 			//d.data.shift();//删除第一条
		// 			//d.data.splice(1,0,second);//我要买货新添加二手
		// 			$s.categoryList = d.data;
					
		// 			$s.$apply();

		// 			//console.log(d)
		// 			//getSellClassifyInfo( d.data[0].typeName );//默认获取第一条信息
		// 		};

		// 	},
		// 	error: function(e){
		// 		alert('页面加载失败！')
		// 	}
		// });

		//写死
		$s.categoryList = [
			// {'typeName':'手机统货'},
			{'typeName':'手机'},
			{'typeName':'平板数码'},
			{'typeName':'大家电'},
			{'typeName':'内存卡'},
			{'typeName':'小家电'}
		]
		// getSellClassifyInfo( $s.categoryList[0].typeName );//默认获取第一条信息
	}])
	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['sellIndex']);
	});

})