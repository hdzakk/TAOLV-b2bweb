define(['jquery','script/index/load_init','script/utils/angular','script/utils/angular-route.1.2.9.min','script/utils/req','script/utils/layer','script/utils/pagination','script/utils/superSlide','script/utils/laydate'],function($, LOAD, angular, route, req,layer, pagination, superSlide,laydate){

	var token = getStorageToken();
	var getDate = function(t){
		var dd = new Date(); 
		dd.setDate(dd.getDate()+t);
		var y = dd.getFullYear(); 
		var m = dd.getMonth()+1;
		var d = dd.getDate(); 
		return y+"-"+(m<10?'0'+m:m)+"-"+(d<10?'0'+d:d); 
	}
	//获取日期
	function GetDateStr(AddDayCount) { 
		var dd = new Date(); 
		dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期 
		var y = dd.getFullYear(); 
		var m = dd.getMonth()+1;//获取当前月份的日期 
		var d = dd.getDate(); 
		return y+"-"+m+"-"+d; 
	} 
	//加
	function accAdd(arg1, arg2) {
	    var r1, r2, m, c;
	    try {
	        r1 = arg1.toString().split(".")[1].length;
	    }
	    catch (e) {
	        r1 = 0;
	    }
	    try {
	        r2 = arg2.toString().split(".")[1].length;
	    }
	    catch (e) {
	        r2 = 0;
	    }
	    c = Math.abs(r1 - r2);
	    m = Math.pow(10, Math.max(r1, r2));
	    if (c > 0) {
	        var cm = Math.pow(10, c);
	        if (r1 > r2) {
	            arg1 = Number(arg1.toString().replace(".", ""));
	            arg2 = Number(arg2.toString().replace(".", "")) * cm;
	        } else {
	            arg1 = Number(arg1.toString().replace(".", "")) * cm;
	            arg2 = Number(arg2.toString().replace(".", ""));
	        }
	    } else {
	        arg1 = Number(arg1.toString().replace(".", ""));
	        arg2 = Number(arg2.toString().replace(".", ""));
	    }
	    return (arg1 + arg2) / m;
	}
	angular.module('tlUser_sales',['ngRoute']).
	config(['$routeProvider',function($routeProvider){
		$routeProvider
			.when('/details',{
				template : require('userDir/sales/details.ejs'),//详情
				controller: 'details'
			})
			.when('/confirm',{
				template : require('userDir/sales/confirm.ejs'),//确认交易
				controller: 'confirm'
			})
			.when('/zc_confirm',{
				template : require('userDir/sales/zc_confirm.ejs'),//暂存确认交易
				controller: 'zc_confirm'
			})
			.when('/my_inventory',{
				template : require('userDir/sales/my_inventory.ejs'),//我的库存
				controller: 'my_inventory'
			})
			.when('/refund_cargo',{
				template : require('userDir/sales/refund_cargo.ejs'),//退货订单
				controller: 'refund_cargo'
			})
			.when('/trading',{
				template : require('userDir/sales/trading.ejs'),//交易订单
				controller: 'trading'
			})
			.when('/sales_order',{
				template : require('userDir/sales/sales_order.ejs'),//委托销售订单
				controller: 'sales_order'
			})
			//返点管理
			.when('/rebate_admin',{
				template : 'rebate_admin.html',//委托销售订单
				controller: 'rebate_admin'
			})
			.otherwise({
				redirectTo : '/sales_order',//委托销售订单
				controller: 'sales_order'
			});
	}])
	//交易订单状态
	.filter('state', function() {
		return function(s,n) {
			if (!s) return;
			switch(s)
				{
				case '1':
				  return '待审核';
				case '2':
				  return '审核不通过';
				case '3':
				  return '审核通过';
				case '4':
				  return '审核通过';
				case '5':
				  return (n=='TH'?'已退货':'已付款');
				case '6':
				  return '已收货';
				}
		}
	}).
	filter('numFormat', function() {//转小数
		return function(num,unit) {
			if (!num) return '0';
			var rv = "";
			if(typeof(num) == "undefined" || num == null || num == ''){
				return rv;
			}
			if(unit == '公斤' || unit == '斤' || unit == '千克' || unit == 'kg'|| unit == 'KG' || unit == '元'){
				rv = (num*1).toFixed(2);
			}else{
				rv = (num*1).toFixed(0);
			}
			return rv;
		}
	}).
	//委托销售订单
	controller('sales_order',['$scope','$location','$routeParams','$timeout','$http','$compile',function($scope,$location,$routeParams,$timeout,$http,$compile){
		
		LOAD.getUserInfo.done(function(d){
			var menberSn =d.data.sn;
			var start = 0;
			var length =5;
			$scope.recordsFiltered = '';
			$scope.index = 0;//表格的序号
			
			//请求状态
			// req.jsonp({
			// 	url:base_url + "/order/saleOrder/orderStates",
			// 	data: {token:token},
			// 	success: function(d){
			// 		console.log(d)
			// 	},
			// });
			//获取列表信息 - 进入一开始请求
			function beginning(alldata){
				if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
				req.jsonp({
					url:base_url + "/order/saleOrder/dataBefore.do",
					data: {
						state: alldata.state,
						timeType: alldata.timeType,
						startDate: alldata.startDate,
						endDate: alldata.endDate,
						key: alldata.key,
						start:alldata.start, 
						length:alldata.length, 
						token:token
					},
					success: function(d){

						if (d.code == "BUS0000") {
							$scope.recordsFiltered= d.recordsFiltered;
							$scope.salesList=d.data
							$scope.pageLoadingFn();
				        	$scope.$apply();
				        	setTimeout(function(){
				        		layer.closeAll();
				        	},200)
						}else{
							layer.closeAll();
							$scope.pageLoadingFn();
							$scope.$apply();
							layer.msg(d.msg)
						}

						var page = $scope.recordsFiltered/length;
			        	$("#Pagination").pagination(page, {  //分页
							num_edge_entries: 1, //边缘页数
							num_display_entries: 4, //主体页数
							items_per_page:1, //每页显示1项
							current_page:Math.ceil(alldata.start/alldata.length),
							prev_text:"上一页",
						    next_text:"下一页",
						    callback:function(p){
						    	$scope.index = p*length;
						    	alldata.start = p*length;
						    	beginning(alldata);
						    }
						});
					},
					error: function(e){
						setTimeout(function(){
							layer.closeAll();
							$scope.pageLoadingFn();
							$scope.$apply();
							layer.msg('服务器请求失败')
						},200)
					}
				});
			}
			var alldata ={
				menberSn:d.data.sn,//会员sn
				state:'',//订单状态
				timeType:'',//最近多久
				startDate:'',//下单日期
				endDate:'',//结束日期
				key:'',//订单号
				start:start,//开始条数
				length:length //多少条
			}

			beginning(alldata);
			//查询
			$scope.check_polling = function(){
				alldata.state=$('.sales_noe>a.on').attr('data-star');
				alldata.timeType=$('.sales_two>a.cur').attr('data-day');
				alldata.startDate=$('.startDate').val();
				// alldata.endDate=$('.endDate').val();
				alldata.key=$('.key').val();
				alldata.start = 0;
				$scope.index = 0;
				beginning(alldata);
			}
			//取消订单
			$scope.renove_account = function(sn){
				layer.open({
					title:'取消订单',
					area: ['auto','auto'],
					btn: ['确定','取消'],
					content: '您确定要取消订单吗？',
					success:function(obj){
						
					},
					yes:function(){
						req.jsonp({
							url:base_url + "/order/saleOrder/remove.do",
							data: { saleOrderSn: sn ,token:token},
							success: function(d){
					        	if (d.code == 'BUS0000') {
									layer.msg('操作成功！',{time:600});
									setTimeout(function(){
										beginning(alldata);
					        			$scope.$apply();
									},600)
								}else{
									layer.msg(d.msg,{time:2000});
								}
							},
							error: function(e){
								setTimeout(function(){layer.closeAll();},200)
							}
						});
					}
				});
			}
			//确认交易
			$scope.confirm_trading = function(d){
				window.sessionStorage.setItem("confirm_trade_josn", JSON.stringify(d));

				if (d.orderState=='2') {//暂存单
					window.location.href="#zc_confirm"; 
				}else{//销售单
					window.location.href="#confirm"; 
				}
				
			}

			//时间选择
			var startDate = $('.startDate'), endDate = $('.endDate');
			$('.sales_head').on('click','.sales_noe a',function(){//状态
				var This = $(this);
				This.addClass('on').siblings('a').removeClass('on');
				alldata.state = This.data('star');
				$scope.check_polling();
			}).on('click','.sales_two a',function(){
				var This = $(this);
				var day = This.data('day');
				This.addClass('cur').siblings('a').removeClass('cur');
				startDate.val(getDate(day));
				endDate.val(getDate(0));
				alldata.endDate=getDate(0);
				$scope.check_polling();
			})

			//开始时间
			// laydate1.render({
			//   elem: startDate[0],
			//   theme: '#0eb83a',
			//   max: GetDateStr(0), //最大日期
			//   done: function(dates){
			//    	alldata.startDate = dates;
			// 	if (alldata.endDate&&new Date(alldata.startDate)<new Date(alldata.endDate)) {
			// 		$scope.check_polling();
			// 	};
			//   }
			// });
			
			startDate.on('click',function(){
				laydate({
		            elem: this,
		            max: GetDateStr(0), //最大日期
		            choose: function(dates){ //选择好日期的回调
 						alldata.startDate = dates;
						if (alldata.endDate&&new Date(alldata.startDate)<new Date(alldata.endDate)) {
							$scope.check_polling();
						};
  					}
		        });
			});
			//结束时间
			// laydate1.render({
	  //           elem: endDate[0],
	  //           theme: '#0eb83a',
	  //           max: GetDateStr(0), //最大日期
	  //           done: function(dates){ //选择好日期的回调
			// 		if (!alldata.startDate) {
			// 			setTimeout(function(){endDate.val('')},20)
			// 			layer.msg('请先选择开始时间',{time:1500});return;
			// 		};
			// 		if (new Date(alldata.startDate)>new Date(dates)) {
			// 			setTimeout(function(){endDate.val('')},20)
			// 			layer.msg('开始时间不能超过结束时间',{time:1500});return;
			// 		};
			// 		alldata.endDate = dates;
			// 		$scope.check_polling();
			// 	}
	  //       });
			endDate.on('click',function(){
				var $this = $(this);
				laydate({
		            elem: this,
		            max: GetDateStr(0), //最大日期
		            choose: function(dates){ //选择好日期的回调
 						if (!alldata.startDate) {
							setTimeout(function(){$this.val('')},20)
							layer.msg('请先选择开始时间',{time:1500});return;
						};
						if (new Date(alldata.startDate)>new Date(dates)) {
							setTimeout(function(){$this.val('')},20)
							layer.msg('开始时间不能超过结束时间',{time:1500});return;
						};
						alldata.endDate = dates;
						$scope.check_polling();
  					}
		        });
			})
		}).fail(signOut);
		$.placeholder();//给input加提示语
		
	}]).

	//确认交易	
	controller('confirm',['$scope','$location','$routeParams','$timeout','$http','$compile',function($scope,$location,$routeParams,$timeout,$http,$compile){
		if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
		var confirm_trade_josn = window.sessionStorage.getItem("confirm_trade_josn");
		if (confirm_trade_josn) {
			$scope.salesJson = JSON.parse(confirm_trade_josn)
		};
		console.log($scope.salesJson)



		var reqData = {
			 saleOrderTrade:{
			 	saleOrderSn: $scope.salesJson.saleOrderSn//订单号
			 	//matchSn: 'PP1011' //匹配号
			 }
			 // ,
			 // saleOrderTradeDetails: [
			 // 	{
				//  	detailGradeSn:'MXDJ1611171033003N1479349980182',//销售等级明细
				//  	surplusNum:'11',//数量
				//  	goodsUnit:'台',//单位
				//  	goodsPrice:'100'//报价
				// },
				// {
				//  	detailGradeSn:'MXDJ161117103300fi1479349980146',//销售等级明细
				//  	surplusNum:'11',//数量
				//  	goodsUnit:'公斤',//单位
				//  	goodsPrice:'500'//报价
				// }
			 // ],
			 // createDateStr:'2016-12-05 14:40:58:00'//时间
			
		}
		
		LOAD.getUserInfo.done(function(d){
			// 获取订单基本信息
			req.jsonp({
				url:base_url + "/order/saleOrder/basicBefore.do",
				data: { saleOrderSn: $scope.salesJson.saleOrderSn,token:token},
				success: function(d){
					if (d.code == "BUS0000") {
						
						if (d.code == "BUS0000") {
							$scope.basicInfo = d.data;
							//剩余时间
							LOAD.surplustime(document.getElementById('surplusTime'),{time:$scope.basicInfo.orderDetail.seconds,day:1})
							$scope.$apply();
							setTimeout(function(){
					    		layer.closeAll();
					    		$scope.pageLoadingFn();
					    		$scope.$apply();
					    	},200)
						};
						offerGoodResult();
					};
				},
				error: function(e){
					setTimeout(function(){layer.closeAll();},200)
				}
			});
			function offerGoodResult(){
				//货物报价明细
				req.jsonp({
					url:base_url + "/order/saleOrder/offerResult.do",
					data: { saleOrderSn: $scope.salesJson.saleOrderSn ,type:2,token:token},
					success: function(d){
						if (d.code == "BUS0000") {
							$scope.goodDetailList = d.data.list||[];
							$scope.lgsFee = d.data.lgsFee;//物流费
							//送货费
							$scope.orderFeeDeliver = (d.data.orderFeeDeliver*1||0).toFixed(2);

							//alert(d.data.orderMoneyOther)
							//其他费用
							$scope.orderMoneyOther = (d.data.orderMoneyOther*1||0).toFixed(2);
							//$scope.orderMoneyOther = ($scope.basicInfo.saleOrderSummary.orderMoneyOther*1||0).toFixed(2);
							
							for (var i = 0; i < $scope.goodDetailList.length; i++) {
								$scope.goodDetailList[i].check = false;
							};
							$scope.orderTradeAllNum = getCheckGoodsTradeNum(true);//数量总数量
							$scope.$apply();
						};
					},
					error: function(e){
						setTimeout(function(){layer.closeAll();},200)
					}
				});
			}
			//全选/全不选
			$scope.allGoodSelect = function(){
				for (var i = 0; i < $scope.goodDetailList.length; i++) {
					$scope.goodDetailList[i].check = $scope.allCheck;
				};
			}
			$scope.goodSelect = function(){
				var _check = true;
				for (var i = 0; i < $scope.goodDetailList.length; i++) {
					if (!$scope.goodDetailList[i].check) {
						_check = false;
					};
				};
				
				$scope.allCheck = _check;
			}
			var getSaleOrderDetails = function(){
				var saleOrderDetails = [];
				for (var i = 0; i < $scope.goodDetailList.length; i++) {
					if ($scope.goodDetailList[i].check) {
						saleOrderDetails.push({detailSn:$scope.goodDetailList[i].saleOrderDetailSn})
					};
				};
				return saleOrderDetails;
			}
			//获取勾选的货物数量汇总
			var getCheckGoodsTradeNum = function(f){

				var json = {}
				var unit = '';

				angular.forEach($scope.goodDetailList,function(o,i){
					if (o.check||f) {
						if (!json[o.goodsUnit]) {
							json[o.goodsUnit] = [o.goodsUnit,0];
						}
						json[o.goodsUnit][1] += parseFloat(o.goodsNum)
					}
				});

				var arr = [];
				for(var attr in json){
					arr.push( json[attr] )
				}
				
				for (var i = 0; i < arr.length; i++) {
					unit += (arr[i][1]||'')+''+(arr[i][0]||'')+ (i==arr.length-1?'':' / ');
				};
				return unit;
				
			}

			//确认交易
			$scope.add_address = function(prov,city,dist){
				var basicInfo = $scope.basicInfo;

				$scope.orderMoneyTrade = 0;//交易总额
				
				for (var i = 0; i < $scope.goodDetailList.length; i++) {
					if ($scope.goodDetailList[i].check) {
						$scope.orderMoneyTrade = accAdd($scope.orderMoneyTrade,$scope.goodDetailList[i].total);
					};
				};
				$scope.orderFeeService = ($scope.orderMoneyTrade/basicInfo.saleOrderSummary.orderMoney*basicInfo.saleOrderSummary.orderFeeService).toFixed(2);//服务费
				

				var saleOrderTradeSummary = {
					orderMoney:$scope.orderMoneyTrade.toFixed(2),//总金额
					orderFeeLogis:$scope.lgsFee,//物流费
					orderFeeService:$scope.orderFeeService,//服务费
					orderFeeDeliver:$scope.orderFeeDeliver,//送货费
					orderMoneyOther:$scope.orderMoneyOther,//其他费用
					orderPercentService:basicInfo.saleOrderSummary.orderPercentService,//服务费比例
					orderTypeService:basicInfo.orderDetail.paymentsType,//服务费类型:0-比例;1-金额
					// orderPay: basicInfo.saleOrderSummary.orderMoneyTrade-basicInfo.saleOrderSummary.orderFeeService-basicInfo.saleOrderSummary.orderFeeLogis//收款金额
					orderPay: ($scope.orderMoneyTrade-$scope.orderFeeService-$scope.lgsFee-$scope.orderFeeDeliver-$scope.orderMoneyOther).toFixed(2)//收款金额
				}
				
				var _reqData = $.extend(true,{},reqData);
				_reqData.saleOrderTradeSummary = saleOrderTradeSummary;
				_reqData.saleOrderDetails = getSaleOrderDetails();
				var isAll = $scope.allCheck?0:1; //0全选1非选项
				if (_reqData.saleOrderDetails.length==0) {
					layer.msg('请至少勾选一个货物',{titme:1500});
					return;
				};

				console.log(_reqData)
				
				$scope.orderTradeNum = getCheckGoodsTradeNum(false);//弹框后的数量汇总
				layer.open({
					title:'确认交易',
					area: ['540px','320px'],
					btn: ['确认','取消'],
					content: $('#confirm').html(),
					success:function(obj){
						var obj = obj[0];
						var template = angular.element(obj);
						$compile(template)($scope);
					},
					yes(){
						layer.load(0,{shade:[0.1, '#fff']});
						req.form({
							url:base_url + "/order/saleOrderTrade/tradeSave.do",
							type:'post',
							data: {json: JSON.stringify(_reqData),isAll:isAll, token: token},
							success: function(d){
								layer.closeAll();
								if (d.code == "BUS0000") {
									layer.msg('操作成功',{time:800});
									setTimeout(function(){
										window.location.href = '#sales_order';
									},800)
								}else{
									layer.msg(d.msg)
								}
							},
							error: function(e){
							}
						});
					}
				});
			}
			//退货
			$scope.saleOrderLogisBack = {
				type:'0',//类型：0-运费到付;1-自提;
				recoverUser:'',//收件人
				recoverPhone:'',//收件联系电话
				recoverAddress:'',//收件地址
				sendCompany:'德邦物流',//退货物流运输方式
				remark:''//退货备注
			} 
			// 获取收货地址
			var getGoodsReceiptAddress = function(fn){
				req.jsonp({
					url:base_url + "/customer/getCustomerAddress.do",
					data: { 
						cSn: d.data.sn,
						token: token
					},
					success: function(d){
						layer.closeAll();
						if (d.code == 'BUS0000') {
						   fn&&fn(d);
						   $scope.addressAll = d.data.reverse();
						    for (var i = 0; i < $scope.addressAll.length; i++) {
						   	  if ($scope.addressAll[i].isDefault==1) {
						   	  	var Default = $scope.addressAll.splice(i,1);
						   	  	$scope.addressAll.splice(0,0,Default[0]);
						   	  	break;
						   	  };
						   };
						   $scope.choiceDddress($scope.addressAll[0])
						   $scope.$apply();
			        	}else{
			        		layer.msg(d.msg);
			        		//$s.addressAll = [];
			        	}
					},
					error: function(e){
						//失败
					}
				});

				//物流
				LOAD.getLogistics().done(function(data){
					$scope.logisticList = data;
					$scope.$apply();
				}).fail(function(){
					console.log('物流信息获取失败')
				});
			}
			$scope.refund = function(){
				var basicInfo = $scope.basicInfo;
				$scope.orderMoneyTrade = 0;//交易总额
				for (var i = 0; i < $scope.goodDetailList.length; i++) {
					if ($scope.goodDetailList[i].check) {
						$scope.orderMoneyTrade+=$scope.goodDetailList[i].goodsNum*$scope.goodDetailList[i].goodsPrice;
					};
				};
				$scope.orderFeeService = ($scope.orderMoneyTrade/basicInfo.saleOrderSummary.orderMoney*basicInfo.saleOrderSummary.orderFeeService).toFixed(2);//服务费
				var saleOrderTradeSummary = {
					orderMoney:$scope.orderMoneyTrade,//总金额
					orderFeeLogis:$scope.lgsFee,//物流费
					orderFeeService:$scope.orderFeeService,//服务费
					orderPercentService:basicInfo.saleOrderSummary.orderPercentService,//服务费比例
					orderTypeService:basicInfo.orderDetail.paymentsType,//服务费类型:0-比例;1-金额
					// orderPay: basicInfo.saleOrderSummary.orderMoneyTrade-basicInfo.saleOrderSummary.orderFeeService-basicInfo.saleOrderSummary.orderFeeLogis//收款金额
					orderPay: ($scope.orderMoneyTrade-$scope.orderFeeService-$scope.lgsFee).toFixed(2)//收款金额
				}

				var _reqData = $.extend(true,{},reqData);
				_reqData.saleOrderLogisBack = $scope.saleOrderLogisBack;
				_reqData.saleOrderTradeSummary = saleOrderTradeSummary;
				_reqData.saleOrderDetails = getSaleOrderDetails();
				var isAll = $scope.allCheck?0:1; //0全选1非选项
				if (_reqData.saleOrderDetails.length==0) {
					layer.msg('请至少勾选一个货物',{titme:1500});
					return;
				};
				//$scope.saleOrderLogisBack.logisType = '0';
				layer.load(0,{shade:[0.1, '#fff']});
				getGoodsReceiptAddress(function(){
					layer.open({
						title:'确认退货',
						area: ['540px','550px'],
						btn: ['确认','取消'],
						//fix: false, //不固定 
						content: $('#refund').html(),
						success:function(obj){
							var obj = obj[0];
							var template = angular.element(obj);
							$compile(template)($scope);
						},
						yes(){
							// if (!$scope.saleOrderLogisBack.logisType) {
							// 	LOAD.msg({txt:'请选择物流收费方式'});
							// 	return;
							// };
							if (!$scope.saleOrderLogisBack.remark) {
								LOAD.msg({txt:'请选择退货原因'});
								return;
							}
							//if ($scope.saleOrderLogisBack.logisType=='0') {

								// if (!$scope.saleOrderLogisBack.recoverUser) {
								// 	LOAD.msg({txt:'请输入收货人'});
								// 	return;
								// };
								// if (!$scope.saleOrderLogisBack.recoverPhone) {
								// 	LOAD.msg({txt:'请输入收件联系电话'});
								// 	return;
								// };
								// if (!$scope.saleOrderLogisBack.recoverAddress) {
								// 	LOAD.msg({txt:'请输入收货地址'});
								// 	return;
								// };
							//};
							// console.log(_reqData)
							// return;
							layer.load(0,{shade:[0.1, '#fff']});
							req.form({
								url:base_url + "/order/saleOrderTrade/backGoods.do",
								type:'post',
								data: {json: JSON.stringify(_reqData),isAll:isAll, token: token},
								success: function(d){
									layer.closeAll();
									if (d.code == "BUS0000") {
										layer.msg('操作成功',{time:800});
										setTimeout(function(){
											window.location.href = '#sales_order';
										},800)
									}else{
										layer.msg(d.msg)
									}
								},
								error: function(e){
								}
							});
						}
					});
				})
				
			}
			$scope.choiceDddress = function(d,ev){
				if (ev) {
					$(ev.currentTarget).addClass('cur').siblings().removeClass('cur');
				}
				$scope.saleOrderLogisBack.recoverUser = d.name;//收件人
				$scope.saleOrderLogisBack.recoverPhone = d.phone;//联系分式
				$scope.saleOrderLogisBack.recoverAddress = d.province+''+d.city+''+d.district+''+d.address;//收货地址
			}
			//暂存
			$scope.temporary = function(){
				var basicInfo = $scope.basicInfo;
				$scope.orderMoneyTrade = 0;//交易总额
				for (var i = 0; i < $scope.goodDetailList.length; i++) {
					if ($scope.goodDetailList[i].check) {
						$scope.orderMoneyTrade+=$scope.goodDetailList[i].goodsNum*$scope.goodDetailList[i].goodsPrice;
					};
				};
				$scope.orderFeeService = ($scope.orderMoneyTrade/basicInfo.saleOrderSummary.orderMoney*basicInfo.saleOrderSummary.orderFeeService).toFixed(2);//服务费
				var saleOrderTradeSummary = {
					orderMoney:$scope.orderMoneyTrade,//总金额
					orderFeeLogis:$scope.lgsFee,//物流费
					orderFeeService:$scope.orderFeeService,//服务费
					orderPercentService:basicInfo.saleOrderSummary.orderPercentService,//服务费比例
					orderTypeService:basicInfo.orderDetail.paymentsType,//服务费类型:0-比例;1-金额
					// orderPay: basicInfo.saleOrderSummary.orderMoneyTrade-basicInfo.saleOrderSummary.orderFeeService-basicInfo.saleOrderSummary.orderFeeLogis//收款金额
					orderPay: ($scope.orderMoneyTrade-$scope.orderFeeService-$scope.lgsFee).toFixed(2)//收款金额
				}

				var _reqData = $.extend(true,{},reqData);
				_reqData.saleOrderTradeSummary = saleOrderTradeSummary;
				_reqData.saleOrderDetails = getSaleOrderDetails();
				var isAll = $scope.allCheck?0:1; //0全选1非选项
				if (_reqData.saleOrderDetails.length==0) {
					layer.msg('请至少勾选一个货物',{titme:1500});
					return;
				};
				console.log(_reqData)
				layer.open({
					title:'提示',
					area: ['auto','auto'],
					btn: ['确定','取消'],
					content: '确定要转暂存吗？',
					yes: function(){
						req.form({
							url:base_url + "/order/saleOrderTrade/temporarySave.do",
							type:'post',
							data: {json: JSON.stringify(_reqData),isAll:isAll, token: token},
							success: function(d){
								if (d.code == "BUS0000") {
									layer.msg('操作成功',{time:800});
									setTimeout(function(){
										window.location.href = '#sales_order';
									},800)
								}
							},
							error: function(e){
								alert('服务器繁忙')
							}
						});
					},
					success:function(obj){
					}
				});

			}
			//全选
			var selAll = document.getElementById("selAll"); 
			$scope.selectAll = function() { 
				var obj = document.getElementsByName("checkAll"); 
			  	if(document.getElementById("selAll").checked == false) { 
			  		for(var i=0; i<obj.length; i++) { 
			    		obj[i].checked=false; 
			 		} 
			  	}else { 
					for(var i=0; i<obj.length; i++) {	  
			   			obj[i].checked=true; 
			  		}	
			  	} 
			}
			//当选中所有的时候，全选按钮会勾上 
			$scope.setSelectAll = function() { 
				var obj=document.getElementsByName("checkAll"); 
				var count = obj.length; 
				var selectCount = 0; 
				for(var i = 0; i < count; i++) { 
					if(obj[i].checked == true) { 
						selectCount++;	
					} 
				} 
				if(count == selectCount) {	
					document.all.selAll.checked = true; 
				}else { 
					document.all.selAll.checked = false; 
				} 
			} 

			
		}).fail(signOut);
		
		$.placeholder();	
	}]).
	//暂存单确认交易
	controller('zc_confirm',['$scope','$location','$routeParams','$timeout','$http','$compile',function($scope,$location,$routeParams,$timeout,$http,$compile){
		if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
		var confirm_trade_josn = window.sessionStorage.getItem("confirm_trade_josn");
		if (confirm_trade_josn) {
			$scope.salesJson = JSON.parse(confirm_trade_josn)
		};
		console.log($scope.salesJson)

		var reqData = {
			 saleOrderTrade:{
			 	saleOrderSn: $scope.salesJson.saleOrderSn//订单号
			 	//matchSn: 'PP1011' //匹配号
			 }
			 // ,
			 // saleOrderTradeDetails: [
			 // 	{
				//  	detailGradeSn:'MXDJ1611171033003N1479349980182',//销售等级明细
				//  	surplusNum:'11',//数量
				//  	goodsUnit:'台',//单位
				//  	goodsPrice:'100'//报价
				// },
				// {
				//  	detailGradeSn:'MXDJ161117103300fi1479349980146',//销售等级明细
				//  	surplusNum:'11',//数量
				//  	goodsUnit:'公斤',//单位
				//  	goodsPrice:'500'//报价
				// }
			 // ],
			 // createDateStr:'2016-12-05 14:40:58:00'//时间
			
		}
		
		LOAD.getUserInfo.done(function(d){
			// 获取订单基本信息 /货物明细
			req.jsonp({
				url:base_url + "/order/saleOrder/stockResult.do",
				data: { sn: $scope.salesJson.sn,token:token},
				success: function(d){
					if (d.code == "BUS0000") {
						//剩余时间
						LOAD.surplustime(document.getElementById('surplusTime'),{time:d.data.seconds,day:1});

						// if (d.data.list&&d.data.list.length>0) {
						// 	for (var i = 0; i < d.data.list.length; i++) {
				 	// 			d.data.list[i].check = false;
				 	// 		};
			 		// 	};
			 			$scope.basicInfo = d.data;
						
						$scope.$apply();
						setTimeout(function(){
				    		layer.closeAll();
				    		$scope.pageLoadingFn();
				    		$scope.$apply();
				    	},200)
					
					}else{
						layer.closeAll();
						layer.msg(d.msg)
					}
				},
				error: function(e){
					setTimeout(function(){layer.closeAll();},200)
				}
			});

			//确认交易
			$scope.add_address = function(n){
				if (n==1) {
					layer.open({
						title:'确认交易',
						area: ['540px','360px'],
						btn: [],
						content: $('#confirm').html(),
						success:function(obj){
							var obj = obj[0];
							var template = angular.element(obj);
							$compile(template)($scope);

							$(obj).on('click','.determineBtn',function(){
								reqTradeZc(n)
							})
						}
					});
				}else if(n==2){
					layer.open({
						title:'取消交易',
						area: ['315px','auto'],
						btn: ['确定','取消'],
						content: '您确定要取消交易吗？',
						yes:function(obj){
							reqTradeZc(n);
						},
						success:function(obj){
							
						}
					});
				}
			}
			function reqTradeZc(n){
				layer.load(0,{shade:[0.1, '#fff']});
				req.jsonp({
					url:base_url + "/order/saleOrderTrade/tradeZc.do",
					type:'post',
					data: {
						sn: $scope.salesJson.sn,
						type: n, //1确认交易，2取消交易
						token: token
					},
					success: function(d){
						layer.closeAll();
						if (d.code == "BUS0000") {
							layer.msg('操作成功',{time:800});
							setTimeout(function(){
								//window.history.go(-1);
								setTimeout(function(){
									window.location.href = '#sales_order';
								},800)
							},800)
						}else{
							layer.msg(d.msg);
						}
					},
					error: function(e){
					}
				});
			}

			
		}).fail(signOut);
		
		$.placeholder();	
	}]).
	//订单详情	
	controller('details',['$scope','$location','$routeParams','$timeout','$http','$compile',function($scope,$location,$routeParams,$timeout,$http,$compile){
		if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
		LOAD.getUserInfo.done(function(d){
			var url = LOAD.getUrlParams(window.location.href,'?');
			//基本信息
			req.jsonp({
				url:base_url + "/order/saleOrder/basicBefore",
				data: { saleOrderSn: url.saleOrderSn,token:token},
				success: function(d){
					$scope.details_list = d.data;
					
					$scope.basic=$scope.details_list.orderDetail;
					$scope.sale=$scope.details_list.saleOrderSummary;
					$scope.logList = $scope.details_list.logList||[];

					//日志
					if ($scope.logList.length>0) {
						$scope.logList.sort(function(a,b){
							var arr1 = a.ruleSn.split('_');
							var arr2 = b.ruleSn.split('_');

							var _a = parseInt(arr1[arr1.length-1]);
							var _b = parseInt(arr2[arr2.length-1])

							return _a - _b;
						});

						var numArr = $scope.logList[$scope.logList.length-1].ruleSn.split('_');
						$scope.state_num = parseInt(numArr[numArr.length-1]);

						//处理越级部分
						for (var i = 0; i < $scope.state_num; i++) {

							if ($scope.logList[i]) {
								var soArr = $scope.logList[i].ruleSn.split('_');
								var _num = parseInt(soArr[soArr.length-1]);
								
							}
							if ((i+1)!=_num) {
								$scope.logList.splice(i,0,{
									ruleSn:'B2B_ORDER_sale_state_00'+(i+1),
									eventTime:'无'
								});
							};
						};

					};
					

					$scope.pageLoadingFn();
		        	$scope.$apply();
		        	setTimeout(function(){
		        		layer.closeAll();
		        	},200)
				},
				error: function(e){
					setTimeout(function(){layer.closeAll();},200)
				}
			});
			//下单明细
			req.jsonp({
				url:base_url + "/order/saleOrder/entrustDetailListBefore",
				data: { saleOrderSn: url.saleOrderSn,token:token},
				success: function(d){
					if (d.code == "BUS0000") {
						if (!d.data.entrustDetailList) {
							d.data.entrustDetailList = [];
						}
						$scope.entrustList = d.data;
		        		$scope.$apply();
					}
					
				},
				error: function(e){
					setTimeout(function(){layer.closeAll();},200)
				}
			});
			//报价记录
			req.jsonp({
				url:base_url + "/order/saleOrder/offerResult.do",
				data: { saleOrderSn: url.saleOrderSn ,type:3,token:token},
				success: function(d){
					if (d.code == "BUS0000") {
						$scope.goodOfferResult = d.data.list||[];
						
						$scope.$apply();
					};
				},
				error: function(e){
					setTimeout(function(){layer.closeAll();},200)
				}
			});
			//签收信息
			$scope.picArr = [];
			req.jsonp({
				url:base_url + "/order/saleOrder/receiveBefore.do",
				data: { saleOrderSn: url.saleOrderSn,token:token},
				//data: { saleOrderSn: 'WT1612060913058v1480986785073',token:token},
				success: function(d){
					console.log(d)
					console.log('-----')
					if (d.data.length>0) {
						$scope.receiveList = d.data[0];
						console.log($scope.receiveList)
						console.log(11)
						if ($scope.receiveList.packagePic) {
							$scope.picArr = $scope.receiveList.packagePic.split(',');
						};
			        	$scope.$apply();

			        	$(".slideBox").slide({
							mainCell:".bd ul",
							autoPlay:true,
							interTime:5000,
							effect:"left",
							hover:false
						})
		        	};
				},
				error: function(e){
					setTimeout(function(){layer.closeAll();},200)
				}
			});


			$scope.baojia = function(id){
				$('body,html').animate({scrollTop:$('#'+id).offset().top}); 
			}
		}).fail(signOut);
		$.placeholder();
		
		
		$('.shrinkage').click(function(){
			$(this).siblings('div').slideToggle();
			$(this).children('i').toggleClass("main")
		});
	}]).
	//交易订单	
	controller('trading',['$scope','$location','$routeParams','$timeout','$http','$compile',function($scope,$location,$routeParams,$timeout,$http,$compile){
		
		LOAD.getUserInfo.done(function(d){
			$scope.trading=false;
			
			$scope.shhi = function(){
				$scope.trading=false;
			}
			$scope.index = 0;
			//请求数据
			var reqData ={
				type: 0,//0-交易单;1-暂存单;2-退货单;
				state:'',//订单状态
				timeType:'',//最近多久
				startDate:'',//下单日期
				endDate:'',//结束日期
				key:'',//订单号
				start:0,//开始条数
				length:5, //多少条
				token:token
			},
			getDataList = function(data){
				if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
				req.jsonp({
					url:base_url + "/order/saleOrderTrade/data.do",
					data: data,
					success: function(d){
						if(d.code == "BUS0000"){
							if (d.data&&d.data.length>0) {
								$scope.dataList = d;
								
					        	$scope.$apply();
				        	}else{
				        		$scope.dataList = [];
				        	}
				        	setTimeout(function(){
					    		layer.closeAll();
					    		$scope.pageLoadingFn();
					    		$scope.$apply();
					    	},200)
				        }else{
				        	layer.closeAll();
				        	$scope.pageLoadingFn();
						    $scope.$apply();
				        	layer.msg(d.msg);
				        }
			        	var page = Math.ceil(parseInt(d.recordsFiltered)/parseInt(data.length))
			        	$("#Pagination").pagination(page, {
							num_edge_entries: 1, //边缘页数
							num_display_entries: 4, //主体页数
							items_per_page:1, //每页显示1项
							prev_text:"上一页",
						    next_text:"下一页",
						    current_page: Math.ceil(data.start/data.length),
						    callback: function(p){
						    	reqData.start = p*data.length;
						    	$scope.index = p*data.length;//序号累加
						    	getDataList(reqData,true);
						    }
						});
			        	
					},
					error: function(e){
						setTimeout(function(){
							layer.closeAll();
							$scope.pageLoadingFn();
							$scope.$apply();
							layer.msg('服务器请求失败')
						},200)
					}
				});
			}
			getDataList(reqData);
			//关键字查询
			$scope.check_polling = function(){
				reqData.key = $scope.keyWord || '';
				reqData.start = 0;
				$scope.index = 0;//序号累加
				getDataList(reqData);
			}
			//时间选择
			var startDate = $('.startDate'), endDate = $('.endDate');
			$('.sales_head').on('click','.sales_noe a',function(){//状态
				var This = $(this);
				This.addClass('on').siblings('a').removeClass('on');
				reqData.state = This.data('state');
				$scope.check_polling();
			}).on('click','.sales_two a',function(){
				var This = $(this);
				var day = This.data('day');
				This.addClass('cur').siblings('a').removeClass('cur');
				startDate.val(getDate(day));
				endDate.val(getDate(0));
				reqData.timeType = This.data('time'); 
				$scope.check_polling();
			})

			//开始时间
			startDate.on('click',function(){
				laydate({
		            elem: this,
		            max: GetDateStr(0), //最大日期
		            choose: function(dates){ //选择好日期的回调
 						reqData.startDate = dates;
						if (reqData.endDate&&new Date(reqData.startDate)<new Date(reqData.endDate)) {
							$scope.check_polling();
						};
  					}
		        });
			});
			//结束时间
			endDate.on('click',function(){
				var $this = $(this);
				laydate({
		            elem: this,
		            max: GetDateStr(0), //最大日期
		            choose: function(dates){ //选择好日期的回调
 						if (!reqData.startDate) {
							setTimeout(function(){$this.val('')},20)
							layer.msg('请先选择开始时间',{time:1500});return;
						};
						if (new Date(reqData.startDate)>new Date(dates)) {
							setTimeout(function(){$this.val('')},20)
							layer.msg('开始时间不能超过结束时间',{time:1500});return;
						};
						reqData.endDate = dates;
						$scope.check_polling();
  					}
		        });
			})

			// 交易详情
			$scope.view_details = function(tradeSn){
				if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
				req.jsonp({
					url:base_url + "/order/saleOrderTrade/tradeRecord.do",
					data: {
						tradeSn: tradeSn,
						token: token
					},
					success: function(d){
						$scope.trading = true;
						console.log(d)
						console.log('-----')
						if (d.code=='BUS0000') {
							$scope.details = d.data;

							$scope.logList = d.data.logList||[];
							//日志
							if ($scope.logList.length>0) {
								$scope.logList.sort(function(a,b){
									var arr1 = a.ruleSn.split('_');
									var arr2 = b.ruleSn.split('_');

									var _a = parseInt(arr1[arr1.length-1]);
									var _b = parseInt(arr2[arr2.length-1])

									return _a - _b;
								});

								var numArr = $scope.logList[$scope.logList.length-1].ruleSn.split('_');
								$scope.state_num = parseInt(numArr[numArr.length-1]);

								//处理越级部分
								for (var i = 0; i < $scope.state_num; i++) {

									if ($scope.logList[i]) {
										var soArr = $scope.logList[i].ruleSn.split('_');
										var _num = parseInt(soArr[soArr.length-1]);
										
									}
									if ((i+1)!=_num) {
										$scope.logList.splice(i,0,{
											ruleSn:'B2B_ORDER_sale_state_00'+(i+1),
											eventTime:'无'
										});
									};
								};
							};



			        	};
			        	$scope.$apply();
			        	setTimeout(function(){
				    		layer.closeAll();
				    	},200)
					},
					error: function(e){
						setTimeout(function(){layer.closeAll();},200)
					}
				});
			}
		}).fail(signOut);
		$.placeholder();
		
	}]).
	//退货订单	
	controller('refund_cargo',['$scope','$location','$routeParams','$timeout','$http','$compile',function($scope,$location,$routeParams,$timeout,$http,$compile){
		LOAD.getUserInfo.done(function(d){
			$scope.trading=false;
			
			$scope.shhi = function(){
				$scope.trading=false;
			}
			$scope.index = 0;
			//请求数据
			var reqData ={
				type: 2,//0-交易单;1-暂存单;2-退货单;
				state:'',//订单状态
				timeType:'',//最近多久
				startDate:'',//下单日期
				endDate:'',//结束日期
				key:'',//订单号
				start:0,//开始条数
				length:5, //多少条
				token:token
			},
			getDataList = function(data){
				if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
				req.jsonp({
					url:base_url + "/order/saleOrderTrade/data.do",
					data: data,
					success: function(d){
						if(d.code == "BUS0000"){
							if (d.data&&d.data.length>0) {

								$scope.dataList = d;

					        	$scope.$apply();
				        	}else{
				        		$scope.dataList = [];
				        	}
				        	setTimeout(function(){
				        		layer.closeAll();
				        		$scope.pageLoadingFn();
					    		$scope.$apply();
				        	},200)
				        }else{
				        	layer.closeAll();
			        		$scope.pageLoadingFn();
				    		$scope.$apply();
				        	layer.msg(d.msg)
				        }

						var page = Math.ceil(parseInt(d.recordsFiltered)/parseInt(data.length))
			        	$("#Pagination").pagination(page, {
							num_edge_entries: 1, //边缘页数
							num_display_entries: 4, //主体页数
							items_per_page:1, //每页显示1项
							prev_text:"上一页",
						    next_text:"下一页",
						    current_page: Math.ceil(data.start/data.length),
						    callback: function(p){
						    	reqData.start = p*data.length;
						    	$scope.index = p*data.length;//序号累加
						    	getDataList(reqData,true);
						    }
						});
			        	
					},
					error: function(e){
						setTimeout(function(){
							layer.closeAll();
							$scope.pageLoadingFn();
							$scope.$apply();
							layer.msg('服务器请求失败')
						},200)
					}
				});
			}
			getDataList(reqData);
			//关键字查询
			$scope.check_polling = function(){
				reqData.key = $scope.keyWord || '';
				reqData.start = 0;
				$scope.index = 0;//序号累加
				getDataList(reqData);
			}
			//时间选择
			var startDate = $('.startDate'), endDate = $('.endDate');
			$('.sales_head').on('click','.sales_noe a',function(){//状态
				var This = $(this);
				This.addClass('on').siblings('a').removeClass('on');
				reqData.state = This.data('state');
				$scope.check_polling();
			}).on('click','.sales_two a',function(){
				var This = $(this);
				var day = This.data('day');
				This.addClass('cur').siblings('a').removeClass('cur');
				startDate.val(getDate(day));
				endDate.val(getDate(0));
				reqData.timeType = This.data('time'); 
				$scope.check_polling();
			})

			//开始时间
			startDate.on('click',function(){
				laydate({
		            elem: this,
		            max: GetDateStr(0), //最大日期
		            choose: function(dates){ //选择好日期的回调
 						reqData.startDate = dates;
						if (reqData.endDate&&new Date(reqData.startDate)<new Date(reqData.endDate)) {
							$scope.check_polling();
						};
  					}
		        });
			});
			//结束时间
			endDate.on('click',function(){
				var $this = $(this);
				laydate({
		            elem: this,
		            max: GetDateStr(0), //最大日期
		            choose: function(dates){ //选择好日期的回调
 						if (!reqData.startDate) {
							setTimeout(function(){$this.val('')},20)
							layer.msg('请先选择开始时间',{time:1500});return;
						};
						if (new Date(reqData.startDate)>new Date(dates)) {
							setTimeout(function(){$this.val('')},20)
							layer.msg('开始时间不能超过结束时间',{time:1500});return;
						};
						reqData.endDate = dates;
						$scope.check_polling();
  					}
		        });
			})

			// 退货详情
			$scope.view_details = function(tradeSn){
				if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
				req.jsonp({
					url:base_url + "/order/saleOrderTrade/tradeRecord.do",
					data: {
						tradeSn: tradeSn,
						token: token
					},
					success: function(d){
						$scope.refund = true;
						console.log(d)
						console.log('-----')
						if (d.code=='BUS0000') {
							$scope.refundTotal = 0;
							for (var i = 0; i < d.data.list.length; i++) {
								$scope.refundTotal += d.data.list[i].goodsNum;
							}
							$scope.refundTotal = $scope.refundTotal + d.data.list[0].goodsUnit;

							$scope.details = d.data;

							$scope.logList = d.data.logList||[];
							//日志
							if ($scope.logList.length>0) {
								$scope.logList.sort(function(a,b){
									var arr1 = a.ruleSn.split('_');
									var arr2 = b.ruleSn.split('_');

									var _a = parseInt(arr1[arr1.length-1]);
									var _b = parseInt(arr2[arr2.length-1])

									return _a - _b;
								});

								var numArr = $scope.logList[$scope.logList.length-1].ruleSn.split('_');
								$scope.state_num = parseInt(numArr[numArr.length-1]);

								//处理越级部分
								for (var i = 0; i < $scope.state_num; i++) {

									if ($scope.logList[i]) {
										var soArr = $scope.logList[i].ruleSn.split('_');
										var _num = parseInt(soArr[soArr.length-1]);
										
									}
									if ((i+1)!=_num) {
										$scope.logList.splice(i,0,{
											ruleSn:'B2B_ORDER_sale_state_00'+(i+1),
											eventTime:'无'
										});
									};
								};
							};

							$scope.picArr = [];
							if (d.data.saleOrderLogisBack.packagePic) {
								$scope.picArr = d.data.saleOrderLogisBack.packagePic.split(',');
							};

							setTimeout(function(){
								$(".slideBox").slide({
									mainCell:".bd ul",
									autoPlay:true,
									interTime:5000,
									effect:"left",
									hover:false
								})
							},1000)
			        	}else{
			        		layer.msg(d.msg);
			        	}
			        	$scope.$apply();
			        	setTimeout(function(){
				    		layer.closeAll();
				    	},200)
					},
					error: function(e){
						setTimeout(function(){layer.closeAll();},200)
					}
				});
			}
		}).fail(signOut);
		$.placeholder();
	}]).
	//我的库存	
	controller('my_inventory',['$scope','$location','$routeParams','$timeout','$http','$compile',function($scope,$location,$routeParams,$timeout,$http,$compile){
		LOAD.getUserInfo.done(function(d){
			$scope.trading=false;
			
			$scope.shhi = function(){
				$scope.trading=false;
			}
			$scope.index = 0;
			//请求数据
			var reqData ={
				type: 1,//0-交易单;1-暂存单;2-退货单;
				state:'0',//订单状态
				timeType:'',//最近多久
				startDate:'',//下单日期
				endDate:'',//结束日期
				key:'',//订单号
				start:0,//开始条数
				length:5, //多少条
				token:token
			},
			getDataList = function(data){
				if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
				req.jsonp({
					url:base_url + "/order/saleOrderTrade/dataZc.do",
					data: data,
					success: function(d){
						
						if(d.code == "BUS0000"){
							if (d.data&&d.data.length>0) {
								$scope.dataList = d;
					        	$scope.$apply();
					        	
				        	}else{
				        		$scope.dataList = [];
				        	}
				        	setTimeout(function(){
					    		layer.closeAll();
					    		$scope.pageLoadingFn();
					    		$scope.$apply();
					    	},200)
				        }else{
				        	layer.closeAll();
				    		$scope.pageLoadingFn();
				    		$scope.$apply();
				        	layer.msg(d.msg);
				        }

			        	var page = Math.ceil(parseInt(d.recordsFiltered)/parseInt(data.length))
			        	$("#Pagination").pagination(page, {
							num_edge_entries: 1, //边缘页数
							num_display_entries: 4, //主体页数
							items_per_page:1, //每页显示1项
							prev_text:"上一页",
						    next_text:"下一页",
						    current_page: Math.ceil(data.start/data.length),
						    callback: function(p){
						    	reqData.start = p*data.length;
						    	$scope.index = p*data.length;//序号累加
						    	getDataList(reqData,true);
						    }
						});
			        	
					},
					error: function(e){
						setTimeout(function(){
							layer.closeAll();
							$scope.pageLoadingFn();
							$scope.$apply();
							layer.msg('服务器请求失败')
						},200)
					}
				});
			}
			getDataList(reqData);
			//关键字查询
			$scope.check_polling = function(){
				reqData.key = $scope.keyWord || '';
				reqData.start = 0;
				$scope.index = 0;//序号累加
				getDataList(reqData);
			}
			//时间选择
			var startDate = $('.startDate'), endDate = $('.endDate');
			$('.sales_head').on('click','.sales_noe a',function(){//状态
				var This = $(this);
				This.addClass('on').siblings('a').removeClass('on');
				reqData.state = This.data('state');
				$scope.check_polling();
			}).on('click','.sales_two a',function(){
				var This = $(this);
				var day = This.data('day');
				This.addClass('cur').siblings('a').removeClass('cur');
				startDate.val(getDate(day));
				endDate.val(getDate(0));
				reqData.timeType = This.data('time'); 
				$scope.check_polling();
			})

			//开始时间
			startDate.on('click',function(){
				laydate({
		            elem: this,
		            max: GetDateStr(0), //最大日期
		            choose: function(dates){ //选择好日期的回调
 						reqData.startDate = dates;
						if (reqData.endDate&&new Date(reqData.startDate)<new Date(reqData.endDate)) {
							$scope.check_polling();
						};
  					}
		        });
			});
			//结束时间
			endDate.on('click',function(){
				var $this = $(this);
				laydate({
		            elem: this,
		            max: GetDateStr(0), //最大日期
		            choose: function(dates){ //选择好日期的回调
 						if (!reqData.startDate) {
							setTimeout(function(){$this.val('')},20)
							layer.msg('请先选择开始时间',{time:1500});return;
						};
						if (new Date(reqData.startDate)>new Date(dates)) {
							setTimeout(function(){$this.val('')},20)
							layer.msg('开始时间不能超过结束时间',{time:1500});return;
						};
						reqData.endDate = dates;
						$scope.check_polling();
  					}
		        });
			})

			// 暂存详情
			var temporarySn;//暂存sn
			var index;
			$scope.btnShow = true;
			$scope.view_details = function(tradeSn,index,n){
				temporarySn = tradeSn;
				index = index;
				//window.location.hash = '/my_inventory?11';
				if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
				req.jsonp({
					url:base_url + "/order/saleOrderTrade/detailZc.do",
					data: {
						tradeSn: tradeSn,
						token: token
					},
					success: function(d){
						$scope.inventory = true;
						if (d.code=='BUS0000') {
							$scope.disabled = true;
							for (var i = 0; i < d.data.list.length; i++) {
								if (d.data.list[i].statusValue!='1') {
									$scope.disabled = false;
								}
								d.data.list[i].check = false;
							};
							$scope.details = d.data;
			        	};
			        	$scope.$apply();
			        	setTimeout(function(){
				    		layer.closeAll();
				    	},200)
					},
					error: function(e){
						setTimeout(function(){layer.closeAll();},200)
					}
				});

				$scope.btnShow = (n==1?true:false);
			}
			//转暂存
			$scope.turnTemporary = function(d){
				layer.open({
					title:'提示',
					area: ['auto','auto'],
					btn: ['确定','取消'],
					content: '确定要转暂存吗？',
					yes: function(){
						layer.load(0,{shade:[0.1, '#fff']});
						req.jsonp({
							url:base_url + "/order/saleOrderTrade/changeTemporary.do",
							data: {
								sn: d.sn,
								token: token
							},
							success: function(data){
								layer.closeAll();
								if (data.code == "BUS0000") {
									layer.msg('操作成功',{time:800});
									getDataList(reqData);
								}
							},
							error: function(e){
								alert('服务器繁忙')
							}
						});
					},
					success:function(obj){
					}
				});
			}
			//重新报价
			$scope.add_address = function(tradeSn){
				var list = $scope.details.list;
				var idsArr = [];
				for (var i = 0; i < list.length; i++) {
					if (list[i].check) {
						idsArr.push(list[i].id)
					};
				};
				if (idsArr.length==0) {
					layer.msg('请至少勾选一个货物',{time:1500});
					return;
				};
				
				layer.open({
					title:'提示',
					area: ['auto','auto'],
					btn: ['确定','取消'],
					yes: function(){
						layer.load(0,{shade:[0.1, '#fff']});
						req.jsonp({
							url:base_url + "/order/saleOrderTrade/repeatAll.do",
							data: {
								tradeSn: temporarySn,
								token: token,
								ids:idsArr.join(','),
								isAll:$scope.allCheck?0:1
							},
							success: function(d){
								layer.closeAll();
								if (d.code == "BUS0000") {
									layer.msg('操作成功',{time:800});
									setTimeout(function(){
										getDataList(reqData);
										$scope.inventory = false;
										$scope.$apply();
									},800);
								}else{
									layer.msg(d.msg,{time:800});
								}
							},
							error: function(e){
								layer.closeAll();
								alert('服务器繁忙')
							}
						});
					},
					content: '确定要重新报价吗？',
					success:function(obj){
					}
				});
			}

			// 获取收货地址
			var getGoodsReceiptAddress = function(fn){
				req.jsonp({
					url:base_url + "/customer/getCustomerAddress.do",
					data: { 
						cSn: d.data.sn,
						token: token
					},
					success: function(d){
						layer.closeAll();
						if (d.code == 'BUS0000') {
						   fn&&fn(d);
						   $scope.addressAll = d.data.reverse();
						    for (var i = 0; i < $scope.addressAll.length; i++) {
						   	  if ($scope.addressAll[i].isDefault==1) {
						   	  	var Default = $scope.addressAll.splice(i,1);
						   	  	$scope.addressAll.splice(0,0,Default[0]);
						   	  	break;
						   	  };
						   };
						   $scope.choiceDddress($scope.addressAll[0])
						   $scope.$apply();
			        	}else{
			        		layer.msg(d.msg);
			        		//$s.addressAll = [];
			        	}
					},
					error: function(e){
						//失败
					}
				});

				//物流
				LOAD.getLogistics().done(function(data){
					$scope.logisticList = data;
					$scope.$apply();
				}).fail(function(){
					console.log('物流信息获取失败')
				});
			}
			//生成退货单
			$scope.refund = function(){
				var list = $scope.details.list;
				var idsArr = [];
				for (var i = 0; i < list.length; i++) {
					if (list[i].check) {
						idsArr.push(list[i].id)
					};
				};
				if (idsArr.length==0) {
					layer.msg('请至少勾选一个货物',{time:1500});
					return;
				};
				$scope.backGoods = {
					tradeSn: temporarySn,//暂存单号
					logisType:'0',//类型：0-运费到付;1-自提;
					recoverUser:'',//收件人
					recoverPhone:'',//收件联系电话
					recoverAddress:'',//收件地址
					sendCompany:'德邦物流',//退货物流运输方式
					remark:'',//退货备注
					ids:idsArr.join(','),
					isAll:$scope.allCheck?0:1,
					token: token
				}
				layer.load(0,{shade:[0.1, '#fff']});
				getGoodsReceiptAddress(function(){
					layer.open({
						title:'确认退货',
						area: ['540px','550px'],
						btn: ['确认','取消'],
						content: $('#refund').html(),
						fix: false, //不固定 
						success:function(obj){
							var obj = obj[0];
							var template = angular.element(obj);
							$compile(template)($scope);
						},
						yes(){
							if (!$scope.backGoods.remark) {
								LOAD.msg({txt:'请选择退货原因'});
								return;
							}
							// console.log( $scope.backGoods )
							// return;
							var index = layer.load(0,{shade:[0.1, '#fff']});
							req.jsonp({
								url:base_url + "/order/saleOrderTrade/backGoodsSave.do",
								data: $scope.backGoods,
								success: function(d){
									layer.closeAll();
									if (d.code == "BUS0000") {
										layer.msg('操作成功',{time:800});
											setTimeout(function(){
											getDataList(reqData);
											$scope.inventory = false;
											$scope.$apply();
										},800);
									}else{
										layer.msg(d.msg);
									}
								},
								error: function(e){
									layer.closeAll();
									layer.msg('服务器请求失败');
								}
							});
						}
					});
				})
			}
			$scope.choiceDddress = function(d,ev){
				if (ev) {
					$(ev.currentTarget).addClass('cur').siblings().removeClass('cur');
				}
				$scope.backGoods.recoverUser = d.name;//收件人
				$scope.backGoods.recoverPhone = d.phone;//联系分式
				$scope.backGoods.recoverAddress = d.province+''+d.city+''+d.district+''+d.address;//收货地址
			}
			//全选/全不选
			$scope.allGoodSelect = function(){
				for (var i = 0; i < $scope.details.list.length; i++) {
					if ($scope.details.list[i].statusValue!='1') {
						$scope.details.list[i].check = $scope.allCheck;
					};
				};
			}
			$scope.goodSelect = function(){
				var _check = true;
				for (var i = 0; i < $scope.details.list.length; i++) {
					if (!$scope.details.list[i].check&&$scope.details.list[i].statusValue!='1') {
						_check = false;
					};
				};
				
				$scope.allCheck = _check;
			}

			//全选
			// var selAll = document.getElementById("selAll"); 
			// $scope.selectAll = function() { 
			// 	var obj = document.getElementsByName("checkAll"); 
			//   	if(document.getElementById("selAll").checked == false) { 
			//   		for(var i=0; i<obj.length; i++) { 
			//     		obj[i].checked=false; 
			//  		} 
			//   	}else { 
			// 		for(var i=0; i<obj.length; i++) {	  
			//    			obj[i].checked=true; 
			//   		}	
			//   	} 
			// }
			// //当选中所有的时候，全选按钮会勾上 
			// $scope.setSelectAll = function() { 
			// 	var obj=document.getElementsByName("checkAll"); 
			// 	var count = obj.length; 
			// 	var selectCount = 0; 
			// 	for(var i = 0; i < count; i++) { 
			// 		if(obj[i].checked == true) { 
			// 			selectCount++;	
			// 		} 
			// 	} 
			// 	if(count == selectCount) {	
			// 		document.all.selAll.checked = true; 
			// 	}else { 
			// 		document.all.selAll.checked = false; 
			// 	} 
			// } 
		}).fail(signOut);
		$.placeholder();
		
	}]).
	//返点管理
	controller('rebate_admin',['$scope','$location','$routeParams','$timeout','$http',function($scope,$location,$routeParams,$timeout,$http){
		var $s = $scope;
		$scope.pageLoadingFn();
		//筛选条件
		$s.orderData = {
			pageNum: 0,//条数
			pageSize: 5,//每页的条数
			json: {
				keyWord:'',//关键字
				orderStart:'',//开始时间
				orderEnd:'',//结束时间
				orderRecently:'',//1一周、2一个月、3三个月、4一年
				paymentStart:'',//返点开始时间
				paymentEnd:'',//返点结束时间
				paymentRecently:'',//返点1一周、2一个月、3三个月、4一年
				returnedState:''//状态
			}
		}

		var findFinanceSaleOrderReturnedForPage = function(){
			if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
			$s.orderData.json.keyWord = $s.keyWord || '';
			req.jsonp({
				url:base_url + "/orderReturnedFinance/findFinanceSaleOrderReturnedForPage.do",
				data: {
					start:$s.orderData.pageNum,
					length:$s.orderData.pageSize,
					json: JSON.stringify($s.orderData.json),
					token: token
				},
				success: function(d){
					if (d.code == "BUS0000") {
						$scope.recordsFiltered= d.recordsFiltered;
						$scope.orderList = d.data;
						$scope.pageLoadingFn();
			        	$scope.$apply();
			        	setTimeout(function(){
			        		layer.closeAll();
			        	},200)
					}else{
						layer.closeAll();
						$scope.pageLoadingFn();
						$scope.$apply();
						layer.msg(d.msg)
					}

					var page = $scope.recordsFiltered/$s.orderData.pageSize;
		        	$("#Pagination").pagination(page, {  //分页
						num_edge_entries: 1, //边缘页数
						num_display_entries: 4, //主体页数
						items_per_page:1, //每页显示1项
						current_page:Math.ceil($s.orderData.pageNum/$s.orderData.pageSize),
						prev_text:"上一页",
					    next_text:"下一页",
					    callback:function(p){
					    	$s.orderData.pageNum = p*$s.orderData.pageSize;
					    	findFinanceSaleOrderReturnedForPage($s.orderData,true);
					    }
					});
				},
				error: function(e){
					layer.msg('服务器请求失败！')
				}
			})
		}

		findFinanceSaleOrderReturnedForPage();

		var startDate = $('.startDate'), endDate = $('.endDate');
		$('.sales_head').on('click','.sales_noe a',function(){//状态
			var This = $(this);
			This.addClass('cur').siblings('a').removeClass('cur');
			var _val = This.attr('value');
			$s.orderData.pageNum = 0;//回到第一页
			// if (_val) {
			// 	$s.orderData.json.returnedState = _val;
			// }else{
			// 	$s.orderData.json.returnedState = '';
			// }
			
			$s.orderData.json = {
				keyWord:'',//关键字
				orderStart:'',//开始时间
				orderEnd:'',//结束时间
				orderRecently:'',//1一周、2一个月、3三个月、4一年
				paymentStart:'',//返点开始时间
				paymentEnd:'',//返点结束时间
				paymentRecently:'',//返点1一周、2一个月、3三个月、4一年
				returnedState:_val//状态
			}
		
			findFinanceSaleOrderReturnedForPage($s.orderData);
		}).on('click','.sales_two a',function(){
			var This = $(this);
			var day = This.data('day');
			var _val = This.attr('value');
			This.addClass('cur').siblings('a').removeClass('cur');

			var time = This.parent().data('time');
			if (time=='1') {
				$s.orderData.json.orderStart = getDate(day);//开始时间
				$s.orderData.json.orderEnd = getDate(0);//结束时间（今天）
				$s.orderData.json.orderRecently = _val;

				This.siblings('.startDate').val($s.orderData.json.orderStart);
				This.siblings('.endDate').val($s.orderData.json.orderEnd);
			}else if (time=='2'){
				$s.orderData.json.paymentStart = getDate(day);//返点开始时间
				$s.orderData.json.paymentEnd = getDate(0);//返点结束时间（今天）
				$s.orderData.json.paymentRecently = _val;

				This.siblings('.startDate').val($s.orderData.json.paymentStart);
				This.siblings('.endDate').val($s.orderData.json.paymentEnd);
			}

			$s.orderData.pageNum = 0;//回到第一页
			findFinanceSaleOrderReturnedForPage($s.orderData);
		})

		//关键字查询
		$s.check_polling = function(){
			$s.orderData.json.keyWord = $s.keyWord || '';
			$s.orderData.pageNum = 0;//回到第一页
			findFinanceSaleOrderReturnedForPage($s.orderData);
		}


		//开始时间
		startDate.on('click',function(){
			var $this = $(this);
			var time = $this.parent().data('time');	
			laydate({
	            elem: this,
	            max: GetDateStr(0), //最大日期
	            choose: function(dates){ //选择好日期的回调
					if (time=='1') {
						$s.orderData.json.orderStart = dates;
						if ($s.orderData.json.orderEnd&&new Date($s.orderData.json.orderStart)<new Date($s.orderData.json.orderEnd)) {
							$s.orderData.json.orderRecently = '';
							findFinanceSaleOrderReturnedForPage($s.orderData);
						};
					}else if (time=='2') {
						$s.orderData.json.paymentStart = dates;
						if ($s.orderData.json.paymentEnd&&new Date($s.orderData.json.paymentStart)<new Date($s.orderData.json.paymentEnd)) {
							$s.orderData.json.paymentRecently = '';
							findFinanceSaleOrderReturnedForPage($s.orderData);
						};
					}
				}
	        });
		});
		//结束时间
		endDate.on('click',function(){
			var $this = $(this);
			var time = $this.parent().data('time');	
			laydate({
	            elem: this,
	            max: GetDateStr(0), //最大日期
	            choose: function(dates){ //选择好日期的回调
					if (time=='1') {
						if (!$s.orderData.json.orderStart) {
							setTimeout(function(){$this.val('')},20)
							layer.msg('请先选择开始时间',{time:1500});return;
						};
						if (new Date($s.orderData.json.orderStart)>new Date(dates)) {
							setTimeout(function(){$this.val('')},20)
							layer.msg('开始时间不能超过结束时间',{time:2000});return;
						};
						$s.orderData.json.orderEnd = dates;
						$s.orderData.json.orderRecently = '';
					}else if(time=='2'){
						if (!$s.orderData.json.paymentStart) {
							setTimeout(function(){$this.val('')},20)
							layer.msg('请先选择开始时间',{time:1500});return;
						};
						if (new Date($s.orderData.json.paymentStart)>new Date(dates)) {
							setTimeout(function(){$this.val('')},20)
							layer.msg('返点开始时间不能超过返点结束时间',{time:2000});return;
						};
						$s.orderData.json.paymentEnd = dates;
						$s.orderData.json.paymentRecently = '';
					}
					findFinanceSaleOrderReturnedForPage($s.orderData);
				}
	        });
		})
	}]).
	run(['$rootScope', '$http', '$timeout', '$filter', '$document', '$templateCache', '$location','$compile', function($rootScope, $http, $timeout, $filter, $Document, $templateCache, $location,$compile) {
		$rootScope.pageLoadingFn = function(){
			$rootScope.pageLoading = true;
		}
		LOAD.getUserInfo.done(function(d){
			var urlPath = '';
			if (d.data.imageUrl) {
				urlPath = d.data.imageUrl.indexOf('http')==-1?'../':'';
			};
        	$('#user_image').attr('src',d.data.imageUrl?urlPath+d.data.imageUrl:require('images/user/user_image.png'));
        	// setTimeout(function(){
        	// 	layer.closeAll();
        	// },200)
		}).fail(signOut);
	}])

	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['tlUser_sales']);
		//左侧菜单选中
		var _user_menu = $('.user_menu');
		var _hash = window.location.hash.substring(2);
		_user_menu.find('dd').on('click',function(){
			var _this = $(this);
			_this.addClass('cur').siblings('dd').removeClass('cur');
		});
		if (_hash) {
			_user_menu.find('a[href="#'+_hash+'"]').parent().click();
		}else{
			_user_menu.find('dd').eq(0).click();
		}
	});	

})