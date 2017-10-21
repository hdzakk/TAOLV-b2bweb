define(['jquery','script/index/load_init','script/utils/angular','script/utils/angular-route.1.2.9.min','script/utils/req','script/utils/layer','script/utils/pagination','script/utils/laydate'],function($, LOAD, angular, route, req ,layer ,pagination ,laydate){

   	var token = getStorageToken();
   	var url = LOAD.getUrlParams(window.location.href,'?');
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
	angular.module('userPurchase',['ngRoute'])
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
	//字符串截取（订单号截取）
	.filter('intercept', function() {
		return function(t) {
			if (!t) return;
			var date = t.substr(0,4) +""+ t.substr(12,t.length);
			return date;
		}
	})
	//订单状态
	.filter('orderState', function() {
		return function(n) {
			return n;
		}
	})
	//报价管理的扣款原因
	.filter('withhodName', function() {
		return function(n) {
			if (!n||n=='[]') return '无';
			return n.replace(/[\[\]\']/g,'');
		}
	})
	//货物说明格式化
	.filter('gradeWithhold', function() {
		return function(d) {
			if (!d) return;
			var str = '';
			var obj = JSON.parse(d);
			for (var i = 0; i < obj.length; i++) {
				if (obj[i]['checked']) {
					str += obj[i].name;
				};
			};
			return str;
		}
	})
	.filter('numFormat', function() {
		return function(num,unit) {
			if (!num) return '0';
			var rv = "";
			if(typeof(num) == "undefined" || num == null || num == ''){
				return rv;
			}
			if(unit == '公斤' || unit == '斤' || unit == '千克' || unit == 'kg' || unit == '元'){
				rv = (num*1).toFixed(2);
			}else{
				rv = (num*1).toFixed(0);
			}
			return rv;
		}
	})
	//扣款原因
	.filter('debitReason', function() { 
		return function(d) {
			if (!d) return;
			var debit = ''
			if (typeof d == "string") {
				d = JSON.parse(d);
			}
			angular.forEach(d,function(o,i){ 
				if (o.checked||o.checked==undefined) {//undefined是现货资源下单的 因为现货自然下单没有了checked字段
					//debit += o.name.substring(0,o.name.indexOf('.')) + (i<d.length-1?',':'');
					debit += o.name + '/';
				};
			})
			debit = debit.substring(0,debit.length-1);
			return debit; 
		}
	})
	.config(['$routeProvider',function($routeProvider){
		$routeProvider
			//采购订单
			.when('/purchase/pur_order',{
				template : require('userDir/purchase/pur_order.ejs'),
				controller: 'pur_order'
			})
			//重新开始
			.when('/purchase/again_start',{
				template : require('userDir/purchase/again_start.ejs'),
				controller: 'again_start'
			})
			//退款申请
			.when('/purchase/refund_apply',{
				template : require('userDir/purchase/refund_apply.ejs'),
				controller: 'refund_apply'
			})
			//确认报价
			.when('/purchase/confirm_quotation',{
				template : require('userDir/purchase/confirm_quotation.ejs'),
				controller: 'confirm_quotation'
			})
			//订单详情
			.when('/purchase/pur_details',{
				template : require('userDir/purchase/pur_details.ejs'),
				controller: 'pur_details'
			})
			//采购信息
			.when('/purchase/pur_info',{
				template : require('userDir/purchase/pur_info.ejs'),
				controller: 'pur_info'
			})
			//报价管理
			.when('/purchase/quote_admin',{
				template : require('userDir/purchase/quote_admin.ejs'),
				controller: 'quote_admin'
			})
			//出货记录
			.when('/purchase/clear_record',{
				template : require('userDir/purchase/clear_record.ejs'),
				controller: 'clear_record'
			})
			//出货单详情
			.when('/purchase/clear_details',{
				template : require('userDir/purchase/clear_details.ejs'),
				controller: 'clear_details'
			})
			//退货申请
			.when('/purchase/retreat_apply',{
				template : require('userDir/purchase/retreat_apply.ejs'),
				controller: 'retreat_apply'
			})
			//新增退货申请
			.when('/purchase/added_retreat_apply',{
				template : require('userDir/purchase/added_retreat_apply.ejs'),
				controller: 'added_retreat_apply'
			})
			//返点管理
			.when('/purchase/rebate_admin',{
				template : require('userDir/purchase/rebate_admin.ejs'),
				controller: 'rebate_admin'
			})
			.otherwise({
				redirectTo : '/purchase/pur_order',
				controller: 'pur_order'
			});
	}])
	//采购订单
	.controller('pur_order',['$scope','$location','$routeParams','$timeout','$http','$templateCache',function($scope,$location,$routeParams,$timeout,$http,$templateCache){
		$.placeholder( $('.sales_head input') );//ie专用
		var $s = $scope;
		// $templateCache.put('module', 'aaaa')
		//筛选条件
		var orderData = {
			pageNum: 1,//页数
			pageSize: 5,//每页的条数
			json: {
				keyWord:'',//关键字
				startDate  :'',//开始时间
				endDate:'',//结束时间
				doState:'',//状态
				recentlyDate:''
			}
		}

		//获取采购订单列表
		$s.serialNumber = 0;
		var findBuyOrderInfoByPage = function(orderData){
			if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
			orderData.json.keyWord = $s.keyWord || '';
			
			orderData.json.startDate = $('.startDate').val();//开始时间
			orderData.json.endDate = $('.endDate').val();//结束时间

			req.jsonp({
				url:base_url + "/buyOrder/findBuyOrderInfoByPage.do",
				data: {
					pageNum:orderData.pageNum,
					pageSize:orderData.pageSize,
					json: JSON.stringify(orderData.json),
					token: token
				},
				success: function(d){
					//console.log(d)
					//console.log('---')
					if (d.code == 'BUS0000') {
						$s.orderList = d;
						$s.serialNumber = (orderData.pageNum-1)*orderData.pageSize;//序号累加
						$s.$apply();
						setTimeout(function(){
			        		layer.closeAll();
			        		$scope.pageLoadingFn();
				    		$scope.$apply();
			        	},200)
						var totalPage = Math.ceil(parseInt(d.recordsFiltered)/parseInt(orderData.pageSize))
						$("#Pagination").pagination(totalPage, {
							num_edge_entries: 1, //边缘页数
							num_display_entries: 4, //主体页数
							items_per_page:1, //每页显示1项
							prev_text:"上一页",
						    next_text:"下一页",
						    current_page: orderData.pageNum - 1,
						    callback: function(p){
						    	orderData.pageNum = p+1;
						    	findBuyOrderInfoByPage(orderData,true);
						    	//if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
						    }
						});
					}else{
						$s.errorMsg = d.msg;
						$scope.pageLoadingFn();
				    	$scope.$apply();
				    	layer.closeAll();
				    	layer.msg(d.msg);
					}
				},
				error: function(e){
					layer.msg('服务器请求失败！')
				}
			})
		}
		findBuyOrderInfoByPage(orderData);
		//关键字查询
		$s.check_polling = function(){
			orderData.json.keyWord = $s.keyWord || '';
			orderData.pageNum = 1;
			findBuyOrderInfoByPage(orderData);
		}
		
		
		//时间选择
		var startDate = $('.startDate'), endDate = $('.endDate');
		$('.sales_head').on('click','.sales_noe a',function(){//状态
			var This = $(this);
			This.addClass('cur').siblings('a').removeClass('cur');
			var _val = This.attr('value');
			if (_val) {
				orderData.json.doState = _val;
			}else{
				orderData.json.doState = '';
			}

			$s.check_polling();
		}).on('click','.sales_two a',function(){
			var This = $(this);
			var day = This.data('day');
			var _val = This.attr('value');
			This.addClass('cur').siblings('a').removeClass('cur');
			orderData.json.startDate = getDate(day);//开始时间
			orderData.json.endDate = getDate(0);//结束时间（今天）

			startDate.val(orderData.json.startDate);
			endDate.val(orderData.json.endDate);
			orderData.json.recentlyDate = _val;

			$s.check_polling();
		})

		//开始时间
		startDate.on('click',function(){
			laydate({
	            elem: this,
	            max: GetDateStr(0), //最大日期
	            choose: function(dates){ //选择好日期的回调
					orderData.json.startDate = dates;
					if (orderData.json.endDate&&new Date(orderData.json.startDate)<new Date(orderData.json.endDate)) {
						orderData.json.recentlyDate = '';
						$s.check_polling();
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
					if (!orderData.json.startDate) {
						setTimeout(function(){$this.val('')},20)
						layer.msg('请先选择开始时间',{time:1500});return;
					};
					if (new Date(orderData.json.startDate)>new Date(dates)) {
						setTimeout(function(){$this.val('')},20)
						layer.msg('开始时间不能超过结束时间',{time:1500});return;
					};
					orderData.json.endDate = dates;
					orderData.json.recentlyDate = '';
					$s.check_polling();
				}
	        });
		})

	}])
	//重新开始
	.controller('again_start',['$scope','$location','$routeParams','$timeout','$http','$templateCache',function($scope,$location,$routeParams,$timeout,$http,$templateCache){
		var $s = $scope;
		var url = LOAD.getUrlParams(window.location.href,'?');
		if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
		req.jsonp({
			url:base_url + "/buyOrderAuditing/findBuyOrderForRestartOrRefund.do",
			data: {
				orderSn:url.orderSn,
				detailGradeSn:url.detailGradeSn||'',
				token:token
			},
			success: function(d){
				//console.log(d)
				//console.log('---')
				layer.closeAll();
				if (d.code == 'BUS0000') {
					if (d.data.shipmentForNum) {
						for (var i = 0; i < d.data.shipmentForNum.length; i++) {
							d.data.shipmentForNum[i].addBuyCycle = '1';
							d.data.shipmentForNum[i].cycleName = false;
						};
					};
					$scope.cycleData = d.data;
					$scope.retreat = false;
					$scope.pageLoadingFn();
					$scope.$apply();
				}else{
					layer.msg(d.msg)
				}
			},
			error: function(e){
				layer.msg('服务器请求失败！')
			}
		})

		//提交周期
		$s.commitCycle = function(){
			var r = /^\+?[1-9][0-9]*$/;　
			var gradeList = [];
			for (var i = 0; i < $s.cycleData.shipmentForNum.length; i++) {
				
				if ($s.cycleData.shipmentForNum[i].stateType!=='3'&&$s.cycleData.shipmentForNum[i].addBuyCycle!='') {

					if (!r.test($s.cycleData.shipmentForNum[i].addBuyCycle)) {
						layer.msg('采购周期只能输入正整数');
						$('.cycleInput_'+i).focus();
						return;
					};
					gradeList.push({
						detailGradeSn:$s.cycleData.shipmentForNum[i].detailGradeSn,
						buyCycle:$s.cycleData.shipmentForNum[i].addBuyCycle
					})
				};
				
			};
			if (gradeList.length==0) {
				$('.cycleInput_0').focus();
				layer.msg('请至少填写一个货物的采购周期');
				return;
			};
		
			layer.load(0,{shade:[0.1, '#fff']});
			req.jsonp({
				url:base_url + "/buyOrderAuditing/updateBuyOrderDetailGradeForBuyCycle.do",
				data: {
					orderSn:$s.cycleData.orderSn,
					gradeList:JSON.stringify(gradeList),
					token:token
				},
				success: function(d){
					layer.closeAll();
					if (d.code == 'BUS0000') {
						// findBuyOrderInfoByPage(orderData);
						// $s.retreat = true;
						window.history.go(-1);
						$s.$apply();
					}else{
						layer.msg(d.msg)
					}
				},
				error: function(e){
					layer.msg('服务器请求失败！')
				}
			})
		}
		
	}])
	//退款申请
	.controller('refund_apply',['$scope','$location','$routeParams','$timeout','$http','$templateCache',function($scope,$location,$routeParams,$timeout,$http,$templateCache){
		if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
		var $s = $scope;
		var url = LOAD.getUrlParams(window.location.href,'?');
		 //获取url带过来的参数 
		 var url = LOAD.getUrlParams(window.location.href,'?');
		 var orderSn = url.orderSn ;
		 $scope.pageLoadingFn();
		 req.jsonp({
			url:base_url + "/buyOrderAuditing/findBuyOrderForRestartOrRefund.do",
	        data:{"orderSn":orderSn,token:token},
	        success:function(d, status){
	        	
		        if(d.code == "BUS0000"){
		            //处理信息
		          	$scope.refundData = d.data;
		          	$scope.$apply();
		        }else{
		           layer.msg(d.msg);
		        }
	        }
		 })
		 //确认退款
		 $s.refund_apply_Prompt = function(d){
			layer.open({
				title:'取消订单',
				btn: ['确定','取消'],
				content: '您确定要申请退款吗？',
				yes: function(){
					layer.load(0,{shade:[0.1, '#fff']});
					req.jsonp({
						url:base_url + "/buyOrderFinance/addBuyOrderFinanceForRefund.do",
				        data: {
				        	orderSn:url.orderSn,
				        	remark:$("#textarea").val(),
				        	refundFee:$scope.refundData.prepayFee,
				        	token:token
				        } ,
				        success:function(d, status){
				        	if(d.code == "BUS0000"){
				        		layer.closeAll();
								layer.msg('操作成功')
				        		setTimeout(function(){
				        			layer.closeAll();
				        			window.history.go(-1);//返回上一页刷新
				        		},1000)
				        	}else{
				        		layer.msg(d.msg)	
				        	}
				        }
					})
				},
				success:function(obj){

				}
			});
		}
	}])
	//订单详情
	.controller('pur_details',['$scope','$location','$routeParams','$timeout','$http',function($scope,$location,$routeParams,$timeout,$http){
		var $s = $scope;
		// if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
		$('.pur_details').on('click','.title',function(){
			$(this).toggleClass('open').siblings('.pur_content').slideToggle();
		})

		// .on('click','.tabBtn',function(){
		// 	var This = $(this);
		// 	if (this.off) {
		// 		This.html('查看出货明细')
		// 	}else{
		// 		This.html('隐藏出货明细')
		// 	}
		// 	This.parents('tr').siblings('tr').slideToggle(0);
		// 	this.off = !this.off;
		// });
		// alert(url.orderSn)
		// if (!url.orderSn) {
		// 	alert('参数错误！');
		// 	return;
		// };
		// 下单信息
		var findBuyOrderDetailsForInfo = function(){

			var url = LOAD.getUrlParams(window.location.href,'?');
			req.jsonp({
				url:base_url + "/buyOrderDetails/findBuyOrderDetailsForInfo.do",
				data: {
					orderSn: url.orderSn,
					token: token
				},
				success: function(d){
					if (d.code == 'BUS0000') {
						$scope.orderType = d.data.orderType; //SPOTGOODS为现货资源下的单
						$scope.orderDetails = d.data;
						$scope.logList = d.data.stateNum||[];
						//日志
						if (d.data.stateNum&&d.data.stateNum.length>0) {
							$scope.logList.sort(function(a,b){
								return parseInt(a.num) - parseInt(b.num);
							});

							$scope.state_num = parseInt($scope.logList[$scope.logList.length-1].num);

							var _number = $scope.orderType == 'SPOTGOODS' ? 5 : 6;
							
							if ($scope.orderType=='SPOTGOODS') {
								if ($scope.state_num==6) {//越级了
									$scope.state_num = 5
								}
							}

							if ($scope.state_num<_number) {
								var len = _number-$scope.logList.length;
								for (var i = 0; i < len; i++) {
									$scope.logList.push({
										num:'',
										time:' '
									})
								};
							};

							//处理越级部分
							// for (var i = 0; i < $scope.state_num; i++) {

							// 	if ($scope.logList[i]) {
							// 		var soArr = $scope.logList[i].ruleSn.split('_');
							// 		var _num = parseInt(soArr[soArr.length-1]);
									
							// 	}
							// 	if ((i+1)!=_num) {
							// 		$scope.logList.splice(i,0,{
							// 			ruleSn:'B2B_ORDER_sale_state_00'+(i+1),
							// 			eventTime:'无'
							// 		});
							// 	};
							// };

						};

						$scope.pageLoadingFn();
						$scope.$apply();
						// //console.log($scope.orderDetails)
					}else{
						layer.msg(d.msg);
					}
				},
				error: function(e){
					layer.msg('服务器请求失败！')
				}
			})
		}
		findBuyOrderDetailsForInfo();


		//申请出货
		var findBuyOrderDetailGradeForShipment = function(){
			var url = LOAD.getUrlParams(window.location.href,'?');
			req.jsonp({
				url:base_url + "/buyOrderDetails/findBuyOrderDetailsForBuyOrderInfo.do",
				data: {
					orderSn: url.orderSn,
					token: token
				},
				success: function(d){
					if (d.code == 'BUS0000') {
						$scope.applyShipment = d.data;
						$scope.goodsReason = false;
						for (var i = 0; i < d.data.length; i++)  {
							if (d.data[i].gradeWithhold) {
								$scope.goodsReason = true;
								break;
							}
						}
						$scope.$apply();
						//console.log($scope.applyShipment)
					}else{
						layer.msg(d.msg);
					}
				},
				error: function(e){
					layer.msg('服务器请求失败！')
				}
			})
		}

		findBuyOrderDetailGradeForShipment()

		//出货收款
		var findBuyOrderShipmentListForPage = function(){
			var url = LOAD.getUrlParams(window.location.href,'?');
			if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
			req.jsonp({
				url:base_url + "/buyOrderDetails/findBuyOrderDetailsForShipmentInfo.do",
				data: {
					token: token,
					orderSn: url.orderSn
				},
				success: function(d){
					if (d.code == 'BUS0000') {
						$scope.shipmentList = d.data;
						$scope.$apply();
						setTimeout(function(){
			        		layer.closeAll();
			       //  		$scope.pageLoadingFn();
				    		// $scope.$apply();
			        	},200)
					}else{
						layer.msg(d.msg);
					}
				},
				error: function(e){
					layer.msg('服务器请求失败！')
				}
			})
		}
		findBuyOrderShipmentListForPage()

		// req.jsonp({
		// 	url:base_url + "/buyOrderAuditing/findBuyOrderByOrderSn.do",
		// 	data: {
		// 		orderSn: url.orderSn,
		// 		token: token
		// 	},
		// 	success: function(d){//console.log(d)
		// 		if (d.code == 'BUS0000') {
		// 			window.localStorage.setItem("orderDetails", JSON.stringify(d));
		// 			$scope.orderDetails = d.data;
		// 			$scope.pageLoadingFn();
		// 			$scope.$apply();
		// 		};
		// 	},
		// 	error: function(e){
		// 		layer.msg('服务器请求失败！')
		// 	}
		// })
	}])
	//确认报价
	.controller('confirm_quotation',['$scope','$compile','$templateCache',function($scope,$compile,$templateCache){
		// if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
		//确认采购 
		var url = LOAD.getUrlParams(window.location.href,'?');
		
		
		$scope.procu = function(){
			// alert($templateCache.get('module'))
			// /if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});

			layer.open({
				title:'支付定金',
				area: ['430px','290px'],
				btn: ['支付定金','取消'],
				content: $('#procu').html(),
				success:function(obj){
					var template = angular.element(obj[0]);
					$compile(template)($scope);
					// $scope.$apply();
				},
				yes(){
					layer.load(0,{shade:[0.1, '#fff']});
					req.jsonp({
						url:base_url + "/buyOrderFinance/addBuyOrderPaymentForExamine.do",
						data: {
							businessSn: url.orderSn,
							receivableFee: ($scope.orderQuotation.buyOrderSummary.prepayFee*1||0).toFixed(2),
							token: token
						},
						success: function(d){
							layer.closeAll();
							if (d.code == 'BUS0000') {
								layer.msg('操作成功！',{time:1000});
								confirm_pay_fn();
								setTimeout(function(){
									window.history.go(-1);
								},1000);
							}else{
								layer.msg(d.msg,{time:1000});
							}
						},
						error: function(e){
							layer.msg('服务器请求失败！')
						}
					})
				}
			});
			//支付预付款
			function confirm_pay_fn(){
				req.jsonp({
					url:base_url + "/buyOrderAuditing/auditingByOrderInfoForBuyIsPass.do",
					data: {
						orderSn: url.orderSn,
						token: token
					},
					success: function(d){
						layer.closeAll();
						if (d.code == 'BUS0000') {
							//layer.msg('操作成功！',{time:1000});
							
							/*setTimeout(function(){
								window.history.go(-1);
							},1000)*/
						}else{
							layer.msg('该订单您已采购！',{time:1500});
						}
						//console.log(d)
					},
					error: function(e){
						layer.msg('服务器请求失败！')
					}
				})
			}

		}

		

		var url = LOAD.getUrlParams(window.location.href,'?');
		if (!url.orderSn) {
			alert('参数错误！');
			return;
		};
		LOAD.getUserInfo.done(function(d){
			req.jsonp({
				url:base_url + "/buyOrderAuditing/findBuyOrderByOrderSn.do",
				data: {
					orderSn: url.orderSn,
					token: token
				},
				success: function(d){
					if (d.code == 'BUS0000') {
						$scope.orderQuotation = d.data;
						//console.log('11')
						//console.log(d.data)
						//console.log('11')
						$scope.pageLoadingFn();
				    	//剩余时间
						LOAD.surplustime(document.getElementById('surplusTime'),{time:d.data.buyOrderWait.surplusTime,day:1})
						$scope.$apply();
					};
					//console.log(d.data)
				},
				error: function(e){
					layer.msg('服务器请求失败！')
				}
			})
		}).fail(signOut);
		
	}])
	//采购信息
	.controller('pur_info',['$scope','$compile','$routeParams','$timeout','$http',function($scope,$compile,$routeParams,$timeout,$http){
		$.placeholder( $('.sales_head input') );//ie专用
		var $s = $scope;
		//筛选条件
		var orderData = {
			pageNum: 1,//页数
			pageSize: 5,//每页的条数
			json: {
				keyWord:'',//关键字
				startTime  :'',//开始时间
				endTime:'',//结束时间
				finishState:'',//状态
				recentlyDate:''
			}
		}
		//获取采购订单列表
		$s.serialNumber = 0;
		var findBuyOrderDetailGradeListByPage = function(orderData){
			if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
			orderData.json.keyWord = $s.keyWord || '';
			req.jsonp({
				url:base_url + "/buyOrderDetail/findBuyOrderDetailGradeListByPage.do",
				data: {
					pageNum:orderData.pageNum,
					pageSize:orderData.pageSize,
					json: JSON.stringify(orderData.json),
					token: token
				},
				success: function(d){
					
					if (d.code == 'BUS0000') {
						$s.orderList = d;
						$s.serialNumber = (orderData.pageNum-1)*orderData.pageSize;//序号累加
						$s.$apply();
						var totalPage = Math.ceil(parseInt(d.recordsFiltered)/parseInt(orderData.pageSize))
						$("#Pagination").pagination(totalPage, {
							num_edge_entries: 1, //边缘页数
							num_display_entries: 4, //主体页数
							items_per_page:1, //每页显示1项
							prev_text:"上一页",
						    next_text:"下一页",
						    current_page: orderData.pageNum - 1,
						    callback: function(p){
						    	orderData.pageNum = p+1;
						    	findBuyOrderDetailGradeListByPage(orderData,true);
						    	//if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
						    }
						});
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
					
					//console.log(d.data)
				},
				error: function(e){
					layer.msg('服务器请求失败！')
				}
			})
		}
		findBuyOrderDetailGradeListByPage(orderData);
		//关键字查询
		$s.check_polling = function(){
			orderData.json.keyWord = $s.keyWord || '';
			orderData.pageNum = 1;
			findBuyOrderDetailGradeListByPage(orderData);
		}
		//时间选择
		var startDate = $('.startDate'), endDate = $('.endDate');
		$('.sales_head').on('click','.sales_noe a',function(){//状态
			var This = $(this);
			This.addClass('cur').siblings('a').removeClass('cur');
			var _val = This.attr('value');
			if (_val) {
				orderData.json.finishState = _val;
			}else{
				orderData.json.finishState = '';
			}

			$s.check_polling();
		}).on('click','.sales_two a',function(){
			var This = $(this);
			var day = This.data('day');
			var _val = This.attr('value');
			This.addClass('cur').siblings('a').removeClass('cur');
			orderData.json.startDate = getDate(day);//开始时间
			orderData.json.endDate = getDate(0);//结束时间（今天）

			startDate.val(orderData.json.startDate);
			endDate.val(orderData.json.endDate);
			orderData.json.recentlyDate = _val;

			$s.check_polling();
		})

		//开始时间
		startDate.on('click',function(){
			laydate({
	            elem: this,
	            max: GetDateStr(0), //最大日期
	            choose: function(dates){ //选择好日期的回调
					orderData.json.startDate = dates;
					if (orderData.json.endDate&&new Date(orderData.json.startDate)<new Date(orderData.json.endDate)) {
						orderData.json.recentlyDate = '';
						$s.check_polling();
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
					if (!orderData.json.startDate) {
						setTimeout(function(){$this.val('')},20)
						layer.msg('请先选择开始时间',{time:1500});return;
					};
					if (new Date(orderData.json.startDate)>new Date(dates)) {
						setTimeout(function(){$this.val('')},20)
						layer.msg('开始时间不能超过结束时间',{time:1500});return;
					};
					orderData.json.endDate = dates;
					orderData.json.recentlyDate = '';
					$s.check_polling();
				}
	        });
		})
		
		//停止采购
		$scope.refund = function(gradeSn){
			//if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
			layer.open({
				title:'提示',
				btn: ['确定','取消'],
				content: '您确定停止该品类的采购吗？',
				yes: function(){
					req.jsonp({
						url:base_url + "/buyOrderAuditing/auditingBuyOrderGradeForStop.do",
						data: {
							gradeSn: gradeSn,
							token: token
						},
						success: function(d){
							layer.closeAll();
							if (d.code == 'BUS0000') {
								layer.msg('操作成功！',{time:1000});
								setTimeout(function(){
									findBuyOrderDetailGradeListByPage(orderData);
								},1000)
							}else{
								layer.msg(d.msg,{time:1500});
							}
							//console.log(d)
						},
						error: function(e){
						
						}
					})
				},
				success:function(obj){

				}
			});
		}
		//开始采购
		$scope.stfund = function(gradeSn){
			//if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
			layer.open({
				title:'提示',
				btn: ['确定','取消'],
				content: '您确定开始采购吗？',
				yes: function(){
					req.jsonp({
						url:base_url + "/buyOrderAuditing/auditingBuyOrderGradeForStart.do",
						data: {
							gradeSn: gradeSn,
							token: token
						},
						success: function(d){
							layer.closeAll();
							if (d.code == 'BUS0000') {
								layer.msg('操作成功！',{time:1000});
								setTimeout(function(){
									findBuyOrderDetailGradeListByPage(orderData);
								},1000)
							}else{
								layer.msg(d.msg,{time:1500});
							}
							//console.log(d)
						},
						error: function(e){
						
						}
					})
				},
				success:function(obj){

				}
			});
		}
		//修改报价
		$scope.again = function(d){
			var obj;
			layer.open({
				title:'修改报价',
				area: ['540px','450px'],
				btn: ['确认','取消'],
				content: $('#again').html(),
				success:function(obj){
					obj = obj[0];
					var template = angular.element(obj);
					$compile(template)($scope);
					$scope.modifyData = d;
					//console.log(d)
					
				},
				yes(){
					var servicePrice = $('#servicePrice');
					if (!Number(servicePrice.val())) {
						LOAD.msg({txt:'只能输入数字'});
						return
					};
					layer.load(0,{shade:[0.1, '#fff']});
					req.jsonp({
						url:base_url + "/buyOrderAuditing/auditingBuyOrderGradeForUpadePrice.do",
						data: {
							gradeSn: d.detailGradeSn,
							buyPrice: servicePrice.val(),
							remark: $('#modifyRemark').val(),
							token: token
						},
						success: function(d){
							layer.closeAll();
							if (d.code == 'BUS0000') {
								layer.msg('修改成功',{time:500});
								setTimeout(function(){
									findBuyOrderDetailGradeListByPage(orderData);
								},500)
								// $scope.modifyData.servicePrice = servicePrice.val();
								// $scope.$apply();
							}else{
								layer.msg(d.msg,{time:1500});
							}
						},
						error: function(e){
							layer.msg('服务器请求失败！')
						}
					})
				}
			});
		}
	}])
	//报价管理
	.controller('quote_admin',['$scope','$compile','$routeParams','$timeout','$http',function($scope,$compile,$routeParams,$timeout,$http){
		$.placeholder( $('.sales_head input') );//ie专用
		var $s = $scope;
		//筛选条件
		var orderData = {
			pageNum: 1,//页数
			pageSize: 5,//每页的条数
			type:'',
			json: {
				keyWord:'',//关键字
				startTime  :'',//开始时间
				endTime:'',//结束时间
				finishState:'',//状态
				recentlyDate:''
			}
		}
		
		//获取采购报价列表
		$s.serialNumber = 0;
		var findOrderMakeMatchForPriceByCustSn = function(type,keyWord){
			if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
			 var keyWord = keyWord?keyWord:$scope.quoteOrderSn;
			// return;
			console.log($s.phoneBrand)
			req.jsonp({
				url:base_url + "/buyOrderMatchBidDetail/findOrderMatchBidDetailForList.do",
				data: {
					// pageNum:orderData.pageNum,
					// pageSize:orderData.pageSize,
					// json: JSON.stringify(orderData.json),
					// type:type?type:'',
					token: token,
					// json: JSON.stringify({"keyWord": keyWord?keyWord:''})
					// token: '3c614585b8c84662985cc0f04f015515'

					goodsName:$s.phoneBrand?$s.phoneBrand.brand:'',
					state:type?type:'',
					keyWord:keyWord?keyWord:''
				},
				success: function(data){
				
					if (data.code == 'BUS0000') {
						$s.quoteList = data;
						if (!$s.quoteList.data) {
							$s.quoteList.data = []
						};
						$.map($s.quoteList.data,function(o,i){
							//监听报价只能输入浮点数
							$s.$watch('quoteList["data"]['+i+'].buyRecentPrice',function(newVal,oldVal,o){
								var reg = /^\d+\.?\d*$/;
								//console.log(12)
								if (newVal) {
									if (reg.test(newVal)) {
										$s.quoteList.data[i].buyRecentPrice =newVal;
									}else{
										$s.quoteList.data[i].buyRecentPrice = parseFloat(newVal);
									}
								}
							},true);
							o.buyRecentPrice = o.buyRecentPrice==0?'':o.buyRecentPrice;
							// if (i==2) {
							// 	o.matchState = '3';
							// };
							return o;
						});

						setTimeout(function(){
							layer.closeAll();	
			        		$scope.pageLoadingFn();
				    		$scope.$apply();
			        	},200)
					}else{
						layer.closeAll();	
						$scope.pageLoadingFn();
				    	$scope.$apply();
						layer.msg(data.msg)
					}
					
				},
				error: function(e){
					//layer.msg('服务器请求失败！')
				}
			})
		}
		findOrderMakeMatchForPriceByCustSn();
		//关键字查询
		$s.check_polling = function(){
			findOrderMakeMatchForPriceByCustSn();
		}

		var oldGoodsPrice = 0;
		var oldMatchState = 1;
		// $s.oldGoodsPrice = function(price){
		// 	oldGoodsPrice = price;
		// }
		// 修改报价
		$s.reviseQuote = function(d){
			//alert(num)
			if (d.buyRecentPrice=='') {
				if (oldMatchState==2||oldMatchState==3) {
					d.buyRecentPrice = oldGoodsPrice;
					d.state = oldMatchState;
					oldGoodsPrice = 0;
					oldMatchState = 1;
					layer.msg('修改价格不能为空',{time:1500});
				};
				return;
			}
			if (oldGoodsPrice==d.buyRecentPrice) {
				d.state = oldMatchState;
				return;//没修改过
			}
			
			if ((oldMatchState==2||oldMatchState==3)&&oldGoodsPrice==d.buyRecentPrice) {//没有改变过
				d.state = oldMatchState;
				return;
			};
			var reqData = [{
				// matchBidSn: d.sn,

				// goodsName: d.goodsName,
				// goodsSn: d.goodsSn,
				
				// gradeName: d.gradeName,
				// gradeSn: d.gradeSn,
				
				// withhodName: d.withhodName,
				// withhodSn: d.withhodSn,
				
				// specItemJson: d.specItemJson,
				// goodsUnit: d.goodsUnit,
					
				// goodsPrice: d.goodsPrice,
				// state: d.state,
				sn:d.sn,
				buyRecentPrice: d.buyRecentPrice
			}]
			
			//console.log(JSON.stringify(reqData));
			req.form({
				url:base_url + "/buyOrderMatchBidDetail/updateOrderMatchBidDetailForPrice.do",
				data: {
					// pageNum:orderData.pageNum,
					// pageSize:orderData.pageSize,
					matchBuyPriceList:JSON.stringify(reqData),
					//json: JSON.stringify(reqData),
					token: token
				},
				success: function(data){
					if (data.code=="BUS0000") {
						layer.msg('操作成功',{time:1500});
						d.state = 2;
						$s.$apply();
					}else{
						layer.msg(data.msg,{time:1500});
					}
				},
				error: function(e){
					layer.msg('服务器请求失败！')
				}
			})
		}
		var _input;
		$s.show_revise = function(ev,d){
			oldMatchState = d.state;
			oldGoodsPrice = d.buyRecentPrice;
			d.state = "1";
			_input = $(ev.target).siblings('input');
			setTimeout(function(){
				_input.focus();
			},50)
			
		}

		//品牌名
		req.jsonp({
			url:base_url + "/buyOrderMatchBidDetail/findBuyOrderAllForBuyPrice.do",
			//url:'http://192.168.103.25:8080/taolv_b2b_www/buyOrderMatchBidDetail/findBuyOrderAllForBuyPrice.do',
			data: {
				token: token
			},
			success: function(data){
				
				if (data.code == 'BUS0000' ) {
					$s.brandList = data.data;
					$s.$apply();
				}else{
				
				}

			},
			error: function(e){
				//layer.msg('服务器请求失败！')
			}
		})

		$s.changeGood = function(name){
			var type = $('.sales_noe .cur').attr('value');
			findOrderMakeMatchForPriceByCustSn(type,name?name:'');
		}

		$('.sales_head').on('click','.sales_noe a',function(){//状态
			var This = $(this);
			This.addClass('cur').siblings('a').removeClass('cur');
			var _val = This.attr('value');

			findOrderMakeMatchForPriceByCustSn(_val);
		})
		
	}])
	//出货记录
	.controller('clear_record',['$scope','$location','$routeParams','$timeout','$http',function($scope,$location,$routeParams,$timeout,$http){
		$.placeholder( $('.sales_head input') );//ie专用
		if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
		var $s = $scope;
		//筛选条件
		var orderData = {
			pageNum: 1,//页数
			pageSize: 5,//每页的条数
			json: {
				keyWord:'',//关键字
				startTime  :'',//开始时间
				endTime:'',//结束时间
				state:'',//状态
				recentlyDate:''
			}
		}
		//获取采购订单列表
		$s.serialNumber = 0;
		var findBuyOrderDetailGradeListByPage = function(orderData){
			if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
			orderData.json.keyWord = $s.keyWord || '';
			req.jsonp({
				url:base_url + "/buyOrderShipment/findBuyOrderShipmentListForPage.do",
				data: {
					pageNum:orderData.pageNum,
					pageSize:orderData.pageSize,
					json: JSON.stringify(orderData.json),
					token: token
				},
				success: function(d){
					
					
					if (d.code == 'BUS0000') {
						$s.recordList = d;
						$s.serialNumber = (orderData.pageNum-1)*orderData.pageSize;//序号累加
						$s.$apply();
						
						var totalPage = Math.ceil(parseInt(d.recordsFiltered)/parseInt(orderData.pageSize))
						$("#Pagination").pagination(totalPage, {
							num_edge_entries: 1, //边缘页数
							num_display_entries: 4, //主体页数
							items_per_page:1, //每页显示1项
							prev_text:"上一页",
						    next_text:"下一页",
						    current_page: orderData.pageNum - 1,
						    callback: function(p){
						    	orderData.pageNum = p+1;
						    	findBuyOrderDetailGradeListByPage(orderData,true);
						    	//if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
						    }
						});
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
				},
				error: function(e){
					layer.msg('服务器请求失败！')
				}
			})
		}
		findBuyOrderDetailGradeListByPage(orderData);
		// 确认收货
		$scope.confirmGoodsReceipt = function(shipmentSn){
			
			layer.open({
				title:'温馨提示',
				btn: ['确定','取消'],
				content: '您确定收货吗？',
				yes: function(){
					layer.load(0,{shade:[0.1, '#fff']});
					req.jsonp({
						url:base_url + "/buyOrderAuditing/auditingShipmentForFinishByMenmber.do",
						data: {
							shipmentSn: shipmentSn,
							token: token
						},
						success: function(data){
							layer.closeAll();
							if (data.code == 'BUS0000') {
								layer.msg('操作成功！',{time:800});
								setTimeout(function(){
									findBuyOrderDetailGradeListByPage(orderData);
									$s.$apply();
								},800)
							}else{
								layer.msg(data.msg,{time:1000});
							}
						},
						error: function(e){
							layer.closeAll();
							layer.msg('服务器请求失败！')
						}
					})
				},
				success:function(obj){

				}
			});
		}
		//关键字查询
		$s.check_polling = function(){
			orderData.json.keyWord = $s.keyWord || '';
			orderData.pageNum = 1;
			findBuyOrderDetailGradeListByPage(orderData);
		}
		//时间选择
		var startDate = $('.startDate'), endDate = $('.endDate');
		$('.sales_head').on('click','.sales_noe a',function(){//状态
			var This = $(this);
			This.addClass('cur').siblings('a').removeClass('cur');
			var _val = This.attr('value');
			if (_val) {
				orderData.json.finishState = _val;
			}else{
				orderData.json.finishState = '';
			}

			$s.check_polling();
		}).on('click','.sales_two a',function(){
			var This = $(this);
			var day = This.data('day');
			var _val = This.attr('value');
			This.addClass('cur').siblings('a').removeClass('cur');
			orderData.json.startDate = getDate(day);//开始时间
			orderData.json.endDate = getDate(0);//结束时间（今天）

			startDate.val(orderData.json.startDate);
			endDate.val(orderData.json.endDate);
			orderData.json.recentlyDate = _val;

			$s.check_polling();
		})

		//开始时间
		startDate.on('click',function(){
			laydate({
	            elem: this,
	            max: GetDateStr(0), //最大日期
	            choose: function(dates){ //选择好日期的回调
					orderData.json.startDate = dates;
					if (orderData.json.endDate&&new Date(orderData.json.startDate)<new Date(orderData.json.endDate)) {
						orderData.json.recentlyDate = '';
						$s.check_polling();
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
					if (!orderData.json.startDate) {
						setTimeout(function(){$this.val('')},20)
						layer.msg('请先选择开始时间',{time:1500});return;
					};
					if (new Date(orderData.json.startDate)>new Date(dates)) {
						setTimeout(function(){$this.val('')},20)
						layer.msg('开始时间不能超过结束时间',{time:1500});return;
					};
					orderData.json.endDate = dates;
					orderData.json.recentlyDate = '';
					$s.check_polling();
				}
	        });
		})

	}])
	//出货单详情
	.controller('clear_details',['$scope','$compile',function($scope,$compile){
		if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
		var url = LOAD.getUrlParams(window.location.href,'?');
		if (!url.shipmentSn) {
			alert('参数错误');
			return;
		};
		$scope.pay = url.pay == 0?false:true;//支付按钮是否显示  
		req.jsonp({
			url:base_url + "/buyOrderAuditing/auditingBuyOrderShipmentForShow.do",
			data: {
				shipmentSn: url.shipmentSn,
				token: token
			},
			success: function(d){
				//console.log(d)
				//console.log('---')
				if (d.code == 'BUS0000') {
					$scope.shDetails = d.data;
					
					setTimeout(function(){
		        		layer.closeAll();
		        		$scope.pageLoadingFn();
			    		$scope.$apply();
			    		//剩余时间
						 LOAD.surplustime(document.getElementById('surplusTime'),{time:d.data.buyOrderWait.surplusTime,day:1})
		        	},200)

					$scope.logList = d.data.shipmentLogsMapList||[];
					//日志
					if (d.data.shipmentLogsMapList&&d.data.shipmentLogsMapList.length>0) {
						$scope.logList.sort(function(a,b){
							return parseInt(a.num) - parseInt(b.num);
						});

						$scope.state_num = parseInt($scope.logList[$scope.logList.length-1].num);

						var _number = 6;
						if ($scope.state_num<_number) {
							var len = _number-$scope.logList.length;
							for (var i = 0; i < len; i++) {
								$scope.logList.push({
									num:'',
									time:' '
								})
							};
						};
					};

		        	$scope.$apply();
				};
			},
			error: function(e){
				layer.msg('服务器请求失败！')
			}
		});


		$scope.confirm_pay = function(){

			layer.open({
				title:'确认支付',
				area: ['380px','300px'],
				btn: ['确认支付','取消'],
				content: $('#confirm_pay_layer').html(),
				skin: 'wrap_confirm_pay',
				success:function(obj){

					var obj = obj[0];
					var template = angular.element(obj);
					$compile(template)($scope);
					
				},
				yes:function(){
					layer.load(0,{shade:[0.1, '#fff']})
					req.jsonp({
						url:base_url + "/buyOrderFinance/addBuyOrderShipmentForExamine.do",
						data: {
							businessSn: url.shipmentSn,
							receivableFee: ($scope.shDetails.buyOrderShipmentRate.logisFee*1+$scope.shDetails.buyOrderShipmentRate.barnFee*1+$scope.shDetails.buyOrderShipmentRate.goodsTotalFee*1+$scope.shDetails.buyOrderShipmentRate.shipmmentServiceFee*1-$scope.shDetails.buyOrderShipmentRate.guarantyFee*1).toFixed(2),
							token: token
						},
						success: function(d){
							layer.closeAll();
							if (d.code == 'BUS0000') {
								layer.msg('操作成功，待财务审核！');
								addBuyOrderShipmentForExamine();
							    // $scope.shDetails.stateType = 3;
							    setTimeout(function(){
									window.history.go(-1);
								},1000);
							}else{
								layer.msg(d.msg);
							}
						},
						error: function(e){
							layer.closeAll();
							layer.msg('服务器请求失败！')
						}
					});
				}
			});

			function addBuyOrderShipmentForExamine(){
				req.jsonp({
					url:base_url + "/buyOrderAuditing/auditingShipmentForPaymentByMenmber.do",
					data: {
						shipmentSn: url.shipmentSn,
						token: token
					},
					success: function(d){
						layer.closeAll();
						if (d.code == 'BUS0000') {
							
						}else{
							layer.msg(d.msg);
						}
					},
					error: function(e){
						layer.msg('服务器请求失败')
					}
				});
			}
		}
		// 获取收货地址
		var getGoodsReceiptAddress = function(fn){
			var d = window.localStorage.getItem("log");
			if (d) {
				d = JSON.parse(d);
			}
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
					   //$scope.choiceAddress(false,$scope.addressAll[0]);
					   $scope.$apply();
		        	}else{
		        		layer.msg(d.msg);
		        	}
				},
				error: function(e){
					//失败
				}
			});

			//分拣中心地址
			req.jsonp({
				url:base_url_sorting + "/sortingInfo/findSorting.do",
				data: {
					province: '广东',
					city: '深圳'
				},
				success: function(d){
					if (d.data.length==0) {
						console.log('分拣中心无数据');
						return;
					};
					
					var data = d.data[0];//
					console.log(data)
					$scope.pickAddress = {
					    "address": data.address,
					    "city": data.city,
					    "district": data.area,
					    "id": 128,
					    "name": data.name,
					    "phone": data.telphone,
					    "postCode": data.postalcode,
					    "province": data.province,
					    "sn": data.sn,
					    "telephone": data.phone,
					    "extractWay":1//1为自提
					}
					$scope.$apply();

				},
				error: function(e){
					
				}
			});
		}
		//地址修改
		$scope.modifyOpen = function(){
			$scope.recoverUser = '';//用作判断有没有勾选
			layer.load(0,{shade:[0.1, '#fff']});
			getGoodsReceiptAddress(function(d){
				// $scope.buyOrderSn = $scope.shDetails.buyOrderSn;//采购单号
				// $scope.recoverProvince = d.data[0].province;//省
				// $scope.recoverCity = d.data[0].city;//市
				// $scope.recoverArea = d.data[0].district;//区
				// $scope.recoverAddress = d.data[0].address;//详细地址
				// $scope.recoverUser = d.data[0].name;//收货人
				// $scope.recoverPhone = d.data[0].phone;//手机号码
				// $scope.recoverSn =  d.data[0].sn;//sn
				layer.open({
				title:'地址选择',
				area: ['500px','400px'],
				btn: ['确认','取消'],
				content: `
					<div class="modifyOpen"> 
						<div>
							<p><i>*</i>选择收货地址：<a onclick="layer.closeAll();" target="_blank" href="/page/user/#/account/address" class='fr'>管理收货地址</a></p>
							<ul class="address_ul">
								<li ng-click="choiceAddress($event,pickAddress)" >
								   <p class='name_p'>  
								   		<span class='fl'><b style="color:#0eb83a;">自提</b>&nbsp;&nbsp;{{pickAddress.name}}</span>
								   		<span class='fr'>{{pickAddress.phone}}</span>
								   </p>
								   <div class='ress'>
								   		{{pickAddress.province}} {{pickAddress.city}} {{pickAddress.district}} {{pickAddress.address}}
								   </div>
								</li>
								<li ng-click="choiceAddress($event,d)" ng-repeat='d in addressAll' >
								   <p class='name_p'>  
								   		<span class='fl'>{{d.name}}</span>
								   		<span class='fr'>{{d.phone}}</span>
								   </p>
								   <div class='ress'>
								   		{{d.province}} {{d.city}} {{d.district}} {{d.address}}
								   </div>
								</li>
							</ul>
						</div>
					</div>
				`,
				success:function(obj){
					var obj = obj[0];
					var template = angular.element(obj);
					$compile(template)($scope);
				},
				yes:function(){
					if (!$scope.recoverUser) {
						LOAD.msg({
							obj: $('.layui-layer'),
							txt: '请选择收货地址',
							time: 2000
						});
					}else{
						layer.load(0,{shade:[0.1, '#fff']})
						req.form({
							url:base_url + "/buyOrderDetail/modifyBuyOrderLogisForInfo.do",
							data: {
								buyOrderSn:$scope.buyOrderSn,//采购单号
								recoverSn:$scope.recoverSn,
								recoverProvince:$scope.recoverProvince,//省份
								recoverCity:$scope.recoverCity,//市
								recoverArea:$scope.recoverArea,//区
								recoverAddress:$scope.recoverAddress,//详细地址
								recoverUser:$scope.recoverUser,//收货人
								recoverPhone:$scope.recoverPhone,//手机号码
								extractWay:$scope.extractWay,//1为自提
								token: token,
								recoverDetailsAddress:$scope.recoverProvince+''+$scope.recoverCity+''+$scope.recoverArea+''+$scope.recoverAddress
							},
							success: function(d){
								layer.closeAll();
								if (d.code == 'BUS0000') {
									console.log(d)
								  $scope.shDetails.buyOrderLogis.recoverUser = $scope.recoverUser;
								  $scope.shDetails.buyOrderLogis.recoverPhone = $scope.recoverPhone;
								  $scope.shDetails.buyOrderLogis.recoverProvince = $scope.recoverProvince;
								  $scope.shDetails.buyOrderLogis.recoverCity = $scope.recoverCity;
								  $scope.shDetails.buyOrderLogis.recoverArea = $scope.recoverArea;
								  $scope.shDetails.buyOrderLogis.recoverAddress = $scope.recoverAddress;
								  $scope.shDetails.buyOrderLogis.extractWay = $scope.extractWay;
								  layer.msg('修改成功！',{time:1000});
								  $scope.$apply();
					        	}else{
					        		layer.msg(d.msg);
					        	}
							},
							error: function(e){
								//失败
							}
						});
					}
					

				}
			});
			})
		}

		$scope.choiceAddress = function(event,d){
			if (event) {
				$(event.currentTarget).addClass('cur').siblings('').removeClass('cur');
			}
			$scope.buyOrderSn = $scope.shDetails.buyOrderSn;//采购单号
			$scope.recoverProvince = d.province;//省
			$scope.recoverCity = d.city;//市
			$scope.recoverArea = d.district;//区
			$scope.recoverAddress = d.address;//详细地址
			$scope.recoverUser = d.name;//收货人
			$scope.recoverPhone = d.phone;//手机号码
			$scope.recoverSn =  d.sn;//sn
			$scope.extractWay = d.extractWay?1:0;//1自提

		}
	
	}])
	//退货申请
	.controller('retreat_apply',['$scope','$location','$routeParams','$timeout','$http',function($scope,$location,$routeParams,$timeout,$http){
		$.placeholder( $('.sales_head input') );//ie专用
		var $s = $scope;
		//筛选条件
		var orderData = {
			pageNum: 1,//页数
			pageSize: 5,//每页的条数
			json: {
				keyWord:'',//关键字
				startTime  :'',//开始时间
				endTime:'',//结束时间
				dispose:''//状态
				// recentlyDate:'1'
			}
		}
		//查看详情
		$s.lookDetails = function(d){
			$s.retreat = false;
			$s.showLook = false;
			$s.detailsContent = $.extend(true,{},d);
		}
		//同意处理
		var applySn = '';
		$s.agreeHandle = function(d){
			$s.retreat = false;
			$s.agree = false;
			$s.detailsContent = $.extend(true,{},d);
			applySn = d.applySn;
			//console.log(d)
		}
		$s.agreeHandleBtn = function(){
			layer.open({
				title:'温馨提示',
				btn: ['确定','取消'],
				content: '您确定同意处理吗？',
				yes: function(){
					req.jsonp({
						url:base_url + "/buyOrderReturn/updateBuyOrderReturnForPass.do",
						data: {
							applySn: applySn,
							token: token
						},
						success: function(data){
							if (data.code == 'BUS0000') {
								layer.msg('操作成功！',{time:800});
								setTimeout(function(){
									findBuyOrderReturnInfoByPage(orderData);
									$s.retreat=true;
									$s.agree=true;
									$s.$apply();
								},800)
							}else{
								layer.msg(data.msg,{time:1000});
							}
						},
						error: function(e){
							layer.msg('服务器请求失败！')
						}
					})
				},
				success:function(obj){

				}
			});
		}
		//取消退货
		$s.cancelReutrn = function(d){
			layer.open({
				title:'取消订单',
				btn: ['确定','取消'],
				content: '您确定要取消退货申请吗？',
				yes: function(){
					req.jsonp({
						url:base_url + "/buyOrderReturn/updateBuyOrderReturnInfo.do",
						data: {
							applySn: d.applySn,
							token: token
						},
						success: function(data){
							if (data.code == 'BUS0000') {
								layer.msg('操作成功！',{time:1500});
								d.disposeState = '已关闭';
								d.stateName = 0;
								$s.$apply();
							};
						},
						error: function(e){
							layer.msg('服务器请求失败！')
						}
					})
				},
				success:function(obj){

				}
			});
		}

		$s.serialNumber = 0;
		var findBuyOrderReturnInfoByPage = function(orderData){
			if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
			orderData.json.keyWord = $s.keyWord || '';
			req.jsonp({
				url:base_url + "/buyOrderReturn/findBuyOrderReturnInfoByPage.do",
				data: {
					PageNum:orderData.pageNum,
					PageSize:orderData.pageSize,
					json: JSON.stringify(orderData.json),
					token: token
				},
				success: function(d){
					if (d.code == 'BUS0000') {
						$s.returnGoodsList = d;
						$s.serialNumber = (orderData.pageNum-1)*orderData.pageSize;//序号累加
						$s.$apply();
						setTimeout(function(){
			        		layer.closeAll();
			        		$scope.pageLoadingFn();
				    		$scope.$apply();
			        	},200)
						var totalPage = Math.ceil(parseInt(d.recordsFiltered)/parseInt(orderData.pageSize))
						$("#Pagination").pagination(totalPage, {
							num_edge_entries: 1, //边缘页数
							num_display_entries: 4, //主体页数
							items_per_page:1, //每页显示1项
							prev_text:"上一页",
						    next_text:"下一页",
						    current_page: orderData.pageNum - 1,
						    callback: function(p){
						    	orderData.pageNum = p+1;
						    	findBuyOrderReturnInfoByPage(orderData,true);
						    }
						});
					}else{
						layer.closeAll();
		        		$scope.pageLoadingFn();
			    		$scope.$apply();
						layer.msg(d.msg)
					}
				},
				error: function(e){
					layer.msg('服务器请求失败！')
				}
			})
		}
		findBuyOrderReturnInfoByPage(orderData);

		//关键字查询
		$s.check_polling = function(){
			orderData.json.keyWord = $s.keyWord || '';
			orderData.pageNum = 1;
			findBuyOrderReturnInfoByPage(orderData);
		}
		//时间选择
		var startDate = $('.startDate'), endDate = $('.endDate');
		$('.sales_head').on('click','.sales_noe a',function(){//状态
			var This = $(this);
			var _val = This.attr('value')
			This.addClass('on').siblings('a').removeClass('on');
			orderData.json.dispose = _val;
			$s.check_polling();
		}).on('click','.sales_two a',function(){
			var This = $(this);
			var day = This.data('day');
			This.addClass('cur').siblings('a').removeClass('cur');
			orderData.json.startDate = getDate(day);//开始时间
			orderData.json.endDate = getDate(0);//结束时间（今天）
			startDate.val(orderData.json.startDate);
			endDate.val(orderData.json.endDate);
			$s.check_polling();
		})

		//开始时间
		startDate.on('click',function(){
			laydate({
	            elem: this,
	            max: GetDateStr(0), //最大日期
	            choose: function(dates){ //选择好日期的回调
					orderData.json.startDate = dates;
					if (orderData.json.endDate&&new Date(orderData.json.startDate)<new Date(orderData.json.endDate)) {
						orderData.json.recentlyDate = '';
						$s.check_polling();
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
					if (!orderData.json.startDate) {
						setTimeout(function(){$this.val('')},20)
						layer.msg('请先选择开始时间',{time:1500});return;
					};
					if (new Date(orderData.json.startDate)>new Date(dates)) {
						setTimeout(function(){$this.val('')},20)
						layer.msg('开始时间不能超过结束时间',{time:1500});return;
					};
					orderData.json.endDate = dates;
					orderData.json.recentlyDate = '';
					$s.check_polling();
				}
	        });
		})
	
	}])
	//新增退货申请
	.controller('added_retreat_apply',['$scope','$location','$routeParams','$timeout','$http',function($scope,$location,$routeParams,$timeout,$http){
		$scope.pageLoadingFn();
		
		$scope.added_retreat_apply_submit = function(){
			if (!$scope.buyOrderSn) {
				layer.msg('请输入采购单号');return;
			};
			if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});

			req.form({
				url:base_url + "/buyOrderReturn/addBuyOrderReturnInfo.do",
				type:'post',
				data: {
					json: JSON.stringify({
						buyOrderSn: $scope.buyOrderSn,
						applyName: $scope.applyName,
						returnCause: $scope.returnCause
					}),
					token: token
				},
				success: function(d){
					if (d.code == 'BUS0000') {
						layer.closeAll();
						layer.msg('添加成功',{time:1000});
						setTimeout(function(){
							window.history.go(-1);
						},1000)
						
					}else{
						layer.closeAll();
						layer.msg(d.msg,{time:1500});
					}
				},
				error: function(e){
					layer.msg('服务器请求失败！')
				}
			})
		}
	}])
	//返点管理
	.controller('rebate_admin',['$scope','$location','$routeParams','$timeout','$http',function($scope,$location,$routeParams,$timeout,$http){
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

		var findFinanceBuyOrderReturnedForPage = function(){
			if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
			$s.orderData.json.keyWord = $s.keyWord || '';
			req.jsonp({
				url:base_url + "/orderReturnedFinance/findFinanceBuyOrderReturnedForPage.do",
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
					    	findFinanceBuyOrderReturnedForPage($s.orderData,true);
					    }
					});
				},
				error: function(e){
					layer.msg('服务器请求失败！')
				}
			})
		}

		findFinanceBuyOrderReturnedForPage();

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
		
			findFinanceBuyOrderReturnedForPage($s.orderData);
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
			findFinanceBuyOrderReturnedForPage($s.orderData);
		})

		//关键字查询
		$s.check_polling = function(){
			$s.orderData.json.keyWord = $s.keyWord || '';
			$s.orderData.pageNum = 0;//回到第一页
			findFinanceBuyOrderReturnedForPage($s.orderData);
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
							findFinanceBuyOrderReturnedForPage($s.orderData);
						};
					}else if (time=='2') {
						$s.orderData.json.paymentStart = dates;
						if ($s.orderData.json.paymentEnd&&new Date($s.orderData.json.paymentStart)<new Date($s.orderData.json.paymentEnd)) {
							$s.orderData.json.paymentRecently = '';
							findFinanceBuyOrderReturnedForPage($s.orderData);
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
					
					findFinanceBuyOrderReturnedForPage($s.orderData);
				}
	        });
		})
	}])
	.run(['$rootScope', '$http', '$timeout', '$filter', '$document', '$templateCache', '$location','$compile', function($rootScope, $http, $timeout, $filter, $Document, $templateCache, $location,$compile) {
			$rootScope.pageLoadingFn = function(){
				$rootScope.pageLoading = true;
			}
			var $scope = $rootScope;
			//左侧菜单选中
			var _user_menu = $('.user_menu');
			var _hash = $location.$$path.substring(1);
			_user_menu.find('dd').on('click',function(){
				var _this = $(this);
				_this.addClass('cur').siblings('dd').removeClass('cur');
			});
			if (_hash) {
				_user_menu.find('a[href="#'+_hash+'"]').parent().click();
			}else{
				_user_menu.find('dd').eq(0).click();
			}

			LOAD.getUserInfo.done(function(d){
				var urlPath = '';
				if (d.data.imageUrl) {
					urlPath = d.data.imageUrl.indexOf('http')==-1?'../':'';
				};
	        	$('#user_image').attr('src',d.data.imageUrl?urlPath+d.data.imageUrl:require('images/user/user_image.png'));
			}).fail(signOut);

			//取消订单
			$scope.order_cancel = function(data){
				var url = LOAD.getUrlParams(window.location.href,'?');
				var orderSn = data?data.orderSn:url.orderSn;
				//if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
				layer.open({
					title:'取消订单',
					btn: ['确定','取消'],
					content: '您确定要取消订单吗？',
					yes: function(){
						req.jsonp({
							url:base_url + "/buyOrderAuditing/auditingByOrderInfoForRemove.do",
							data: {
								orderSn: orderSn,
								token: token
							},
							success: function(d){
								layer.closeAll();
								if (d.code == 'BUS0000') {
									layer.msg('操作成功！',{time:600});
									if (data) {
										data.stateType = '0';
										data.buyOrderState = '已取消';
										$scope.$apply();
									};
									setTimeout(function(){
										window.location.href = "/page/user/purchase/#/purchase/pur_order";
									},600)
								}else{
									layer.msg(d.msg,{time:2000});
								}
								//console.log(d)
							},
							error: function(e){
								layer.msg('服务器请求失败！')
							}
						})
					},
					success:function(obj){

					}
				});
			}
			//重新下单
			$scope.reOrder = function(buyGradeSn,orderSn){
				if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});

				var url = "";
				var data = {};
				if (orderSn) {//采购信息再来一单
					url = "/buyOrderAuditing/auditingBuyOrderGradeForAgain.do";
					data = {
						orderSn: orderSn,
						buyGradeSn:buyGradeSn,
						type: '',
						token: token
					}
				}else{//采购列表再来一单
					url = "/buyOrderAuditing/auditingByOrderInfoForAgain.do";
					data = {
						orderSn: buyGradeSn,
						type: 2,
						token: token
					}
				}

				req.jsonp({
					url:base_url + url,
					data: data,
					success: function(d){
						//console.log(d)
						var typeList = [];
						if (d.code == 'BUS0000') {
							if (orderSn) {//采购信息的再来一单
								typeList.push({
									buyCycle:d.data.buyCycle,//采购周期
									classifyName: d.data.buyOrderDetail.goodsName,//货物名称
									grade: d.data.gradeName,//等级
									gradeSn: d.data.gradeSn,//等级sn
									number: d.data.buyOrderDetail.goodsNum,//数量
									productCategory: d.data.buyOrderDetail.goodsCategoryName,//货物类型
									referencePrice: d.data.buyPrice,//报价
									sn: d.data.buyOrderDetail.goodsSn,//货物sn
									unitValue: d.data.buyOrderDetail.goodsUnit,//单位
									goodsExplain: d.data.gradeRemark,//货物说明
									goodsExplainJson: d.data.gradeWithhold?d.data.gradeWithhold.indexOf('[')>=0?JSON.parse(d.data.gradeWithhold) :'':'' //等级列表
								})
							}else{//采购列表的再来一单
								var list = d.data.buyOrderEntrustDetailExtendList;
								for (var i = 0; i < list.length; i++) {
									var g = list[i].buyOrderEntrustDetailGradeList;
									for (var j= 0; j < g.length; j++) {
										typeList.push({
											buyCycle: g[j].buyCycle,//采购周期
											classifyName: list[i].goodsName,//货物名称
											grade: g[j].gradeName,//等级
											gradeSn: g[j].gradeNum,//等级sn
											number: list[i].goodsNum,//数量
											productCategory: list[i].goodsCategory,//货物类型
											referencePrice: g[j].buyPrice,//报价
											sn: list[i].goodsSn,//货物sn
											unitValue: list[i].goodsUnit,//单位
											goodsExplain: g[j].gradeRemark,//货物说明
											goodsExplainJson: g[j].gradeWithhold?g[j].gradeWithhold.indexOf('[')>=0?JSON.parse(g[j].gradeWithhold) :'':'' //等级列表
										})
									};
								};
							}
							
							// //console.log(typeList)
							// return
							window.sessionStorage.setItem("typeList", JSON.stringify( typeList ) );
							window.location.href = '/page/buy/order_info.html';
						}else{
							layer.closeAll();
							layer.msg(d.msg);
						}
					},
					error: function(e){
						layer.closeAll();
						layer.msg('服务器繁忙')
					}
				})
			}
			
	}])

	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['userPurchase']);
	});

})

