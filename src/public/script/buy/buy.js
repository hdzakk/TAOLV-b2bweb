define(['jquery','script/index/load_init','script/utils/angular','script/utils/req','script/utils/layer','script/utils/pagination'],function($, LOAD, angular, req, layer ,pagination){
	var token = getStorageToken();
	angular.module('buy',[])
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
	//字符串截取
	.filter('intercept', function() {
		return function(name) {
			return name.substr(0,4) +""+ name.substr(12,name.length)
		}
	})
	.run(['$rootScope', function($rootScope) {
		var $s = $rootScope,
			pageNum = 1,//页数
			pageSize = 10,//每页的条数
			// 获得订单信息
		    getBuyOrderInfoPage = function(data,term){
		    	
		    	if (term) {//按条件搜索就有loding
		    		layer.load(0,{shade:[0.1, '#333']});
		    		// $('body,html').animate({scrollTop:$('.resources_list').offset().top-15}); 
		    	}
				req.jsonp({
					url:base_url + "/order/saleOrderDetail/gradeData.do",
					data: {
						start:data.pageNum,
						length:data.pageSize,
						goodsCategory: data.goodsCategory,//货物分类
						goodsName: data.goodsName,//货物名称
						recoverCity: data.recoverCity,//所在地
						key: data.key
					},
					success: function(d){
						
						if (d.code == "BUS0000") {
							setTimeout(function(){
				        		layer.closeAll();
				        	},500)
							$s.pageLoading = true;
							window.localStorage.setItem("buyOrderList", JSON.stringify(data) );
							$s.buyOrderList = d;
							//console.log(d)
							$s.$apply();
							var totalPage = Math.ceil(parseInt(d.recordsFiltered)/parseInt(data.pageSize))
							$("#Pagination").pagination(totalPage, {
								num_edge_entries: 1, //边缘页数
								num_display_entries: 4, //主体页数
								items_per_page:1, //每页显示1项
								prev_text:"上一页",
							    next_text:"下一页",
							    current_page: Math.ceil(data.pageNum/data.pageSize) - 1,
							    callback: function(p){
							    	submitData.pageNum = p*data.pageSize + 1;
							    	//$('body,html').animate({scrollTop:$('.resources_list').offset().top-15},function(){
							    		getBuyOrderInfoPage(submitData,true);
							    	//}); 
							    }
							});
						}else{
							layer.closeAll();
							layer.msg(d.msg)
						}
						//console.log(d)
					},
					error: function(e){
						
					}
				});
		},
		submitData = {
			pageNum: pageNum,//页数
			pageSize: pageSize,//每页的条数
			goodsCategory: '',//货物分类
			key: '',//货物名称
			recoverCity: ''//所在地
		}
		getBuyOrderInfoPage(submitData);
		//搜索
		$s.goodsSearch = function(){

			// if (!$s.searchText) {
			// 	layer.msg('请输入搜索内容',{time:1000});
			// 	document.querySelector('input[ng-model="searchText"]').focus();
			// 	return;
			// };
			submitData.pageNum = pageNum; 
			//submitData.pageSize = pageSize;
			submitData.goodsCategory = '';
			submitData.key = $s.searchText||'';
			getBuyOrderInfoPage(submitData,true);
		}
		//我要采购按钮
		$s.goGoodPurchaseBtn = function(d){
			if (d.goodsCategory!='二手') {
				d.withhold = '';//分类货物没有扣款原因
			};
			var j = [{
				classifyName:d.goodsName,
				goodsExplain:d.goodsExplain,
				id:1,
				number:d.goodsNum,
				productCategory:d.goodsCategory,
				maxPrice:d.goodsPrice,
				sn:d.goodsSn,
				gradeSn:d.gradeSn,
				goodsExplainJson:d.withhold.indexOf('[')>=0?JSON.parse(d.withhold):'',
				unitValue:d.goodsUnit||'台',
				resource:true,//从资源页面下单为true
				bindingSn:d.sn,
				grade:d.gradeName||"E",
				businessSn:d.saleOrderSn,
				triageCenterSn:d.triageCenterSn,//分拣中心sn
				specItemJson:d.specItemJson,//规格
				maxNum: d.goodsNum //最大采购数量
			}]

			LOAD.getUserInfo.done(function(d){
				window.sessionStorage.setItem("typeList", JSON.stringify( j ) );
				window.location.href = '/page/buy/order_info.html';
			}).fail(function(){
				LOAD.login('/page/buy/order_info.html',function(){
					window.sessionStorage.setItem("typeList", JSON.stringify( j ) );
				})
			});
		}

		

		//以下是筛选信息
		//获取货物类型
		// $s.getBuyClassifyInfo = function(name,$event,index){
			
		// 	if ($($event.currentTarget).hasClass('cur')) return;
		// 	$($event.currentTarget).addClass('cur').siblings('a').removeClass('cur');
  //           submitData.key = '';//货物名称
		// 	if (name == 'all') {//所有
		// 		$('li.drop_down').hide();
		// 		submitData.pageNum = pageNum;
		// 		submitData.pageSize = pageSize;
		// 		submitData.goodsCategory = '';
		// 		submitData.key = '';
		// 		getBuyOrderInfoPage(submitData,true);//搜索调用
		// 		return;
		// 	}else{
		// 		$('#goods_down').show().siblings('.drop_down').hide();
		// 		getBuyClassifyInfo(name);
		// 	}
		// 	submitData.goodsCategory = name;//货物类型
		// 	////console.log(submitData)


		// }
		//货物货物名称
		$s.getGoodName = function(goodName,$event){
			layer.load(0,{shade:[0.1, '#333']}); 
			$($event.currentTarget).addClass('cur').siblings('a').removeClass('cur');
			submitData.pageNum = pageNum;//初始化页数
			submitData.pageSize = pageSize;
			submitData.key = goodName;//货物名称
			getBuyOrderInfoPage(submitData,true);//搜索调用
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
		        	////console.log(d)
				},
				error: function(e){
					alert('数据请求失败！')
				}
			});
		}
		//获取二手品类名称（品类搜索）
		$s.getSecondGoodsName = function(){
			if ($s.phoneModel&&$s.secondGoodsName) {
				$s.searchText = '';//关键字为空
				submitData.pageNum = pageNum;//初始化页数
				submitData.pageSize = pageSize;
				submitData.goodsCategory = '二手';
				submitData.key = $s.phoneModel.brand +' '+ $s.secondGoodsName.promodelName;//货物名称
				getBuyOrderInfoPage(submitData,true);//搜索调用
			};
		}
		//获取交货地
		$s.getPlaceDelivery = function(name,$event){
			$($event.currentTarget).addClass('cur').siblings('a').removeClass('cur');
			submitData.pageNum = pageNum;//初始化页数
			submitData.pageSize = pageSize;
			submitData.recoverCity = name;//交货地
			getBuyOrderInfoPage(submitData,true);//搜索调用
		}

		//获取品类下面的货物名称
		var getBuyClassifyInfo = function(name){
			layer.load(0,{shade:[0.1, '#333']}); 
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
						submitData.key = '';//默认获取第一条
						getBuyOrderInfoPage(submitData,true);//搜索调用
					};
		        	////console.log(d)
				},
				error: errorMsg
			});
		}
		//获取货物类型
		$s.getBuyClassifyInfo = function(name,$event,index){
			$('#goods_down a').eq(0).addClass('cur');
			if ($($event.currentTarget).hasClass('cur')) return;
			$($event.currentTarget).addClass('cur').siblings('a').removeClass('cur');
            submitData.key = '';//货物名称
			if (name == 'all') {//所有
				$('li.drop_down').hide();
				submitData.pageNum = pageNum;
				submitData.pageSize = pageSize;
				submitData.goodsCategory = '';
				submitData.key = '';
				getBuyOrderInfoPage(submitData,true);//搜索调用
				return;
			}else{
				
				getBuyClassifyInfo(name);
			}
			$(event.currentTarget).parents('li').siblings('.drop_down').removeClass('visible').find('.openBtn').html('更多<i>∨</i');
			submitData.goodsCategory = name;//货物类型
			////console.log(submitData)
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
		// 获取二手品牌信息
		var getSecondCategoryInfo = function(){
			
			req.jsonp({
				url:base_url_admin + "/systemset/categoryManage/brandList.do",
				success: function(d){
					if (d.code == 'BUS0000') {
						$s.secondList = d.data;
						$s.$apply();
					};
		        	////console.log(d)
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
		req.jsonp({
			url:base_url_admin + "/systemset/sellManage/types.do",
			success: function(d){
				if (d.code == 'BUS0000') {
					//d.data.shift();//删除第一条
					//d.data.splice(1,0,second);//我要买货新添加二手
					for (var i = 0; i <  d.data.length; i++) {
						if (d.data[i].typeName=="手机统货") {
							d.data.splice(i,1);
						};
					};
					$s.categoryList = d.data;
					
					$s.$apply();

					//console.log(d)
					//getBuyClassifyInfo( d.data[0].typeName );//默认获取第一条信息
				};

			},
			error: errorMsg
		});
		
		//写死
		$s.categoryList = [
			{'typeName':'手机'},
			// {'typeName':'二手'},
			{'typeName':'平板数码'},
			{'typeName':'大家电'},
			{'typeName':'内存卡'},
			{'typeName':'小家电'}
		]

		//每页显示多少条选择
		$('.center_tip').on('click','a',function(){
			var This = $(this);
			if (This.hasClass('on')) return;
			This.addClass('on').siblings('a').removeClass('on');
			var _num = This.data('num');
			submitData.pageSize = _num;
			submitData.pageNum = 1;
			getBuyOrderInfoPage(submitData,true);
		});

		//交货地
		$s.cityList = [];
		req.jsonp({
			url:base_url + "/order/saleOrderDetail/city.do",
			data: {},
			success: function(d){
				if (d.code == 'BUS0000') {
					$s.cityList = d.data;
					$s.$apply();
				};
	        	////console.log(d)
			},
			error: function(e){
				
			}
		});
	}])
	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['buy']);
	});

})