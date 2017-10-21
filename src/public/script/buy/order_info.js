
define(['jquery','script/index/load_init','script/utils/angular','script/utils/req','script/utils/layer','script/utils/city'],function($, LOAD, angular, req, layer ,city){
	var token = getStorageToken();
	function changeStorage(key,callback){
		window.onstorage = null;
		window.onstorage = function(event){
			if (event.key == key) {
				callback&&callback(event)
			};
			console.log(event)
		}
	}
	angular.module('order_info',[])
	.filter('totalMoney', function() {
		return function(d) {
			if (!d) return;
			var money = 0;
			angular.forEach(d,function(o,i){
				if (o.maxPrice&&o.number) {
					money += parseFloat(o.maxPrice)*parseFloat(o.number);
				};
			})
			return money.toFixed(2);
		}
	})
	.filter('parseFloat', function() {
		return function(num) {
			if (num.toString().indexOf('.')>0) {
				return num.toFixed(2);
			}else{
				return num.toFixed(2);
			}
		}
	})
	.filter('units', function() { //168000 台/1000 公斤
		return function(d) {
			if (!d) return;
			var json = {}
			var unit = '';

			angular.forEach(d,function(o,i){
				if (!json[o.unitValue]) {
					json[o.unitValue] = [o.unitValue,0];
				}
				json[o.unitValue][1] += parseFloat(o.number);
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
	})
	//扣款原因
	.filter('debitReason', function() { 
		return function(d,resource) {
			if (!d) return;
			var debit = ''
			if (!resource) {//正常下单
				angular.forEach(d,function(o,i){ 
					if (o.checked) {
						//debit += o.name.substring(0,o.name.indexOf('.')) + (i<d.length-1?',':'');
						debit += o.name + '/';
					};
				})
			}else{//现货资源页面下单
				angular.forEach(d,function(o,i){
					debit += o.name + '/';
				})
			}
			
			debit = debit.substring(0,debit.length-1);
			return debit; 
		}
	})
	.run(['$rootScope','$compile', function($rootScope,$compile) {

		var $s = $rootScope;
		// 下单字段 
		$s.buyOrder = {  
			orderSn:'',//采购单号
			orderRemark:'',//备注
			createDateStr:'',//时间
			buyOrderEntrustDetailExtendList: [ //委托采购明细信息
				// {
				// 	goodsSn: '',//货物编号
				// 	goodsCategory: '',//货物类型
				// 	goodsName: '',//货物名称
				// 	goodsNum: '',//货物数量
				// 	goodsUnit: '',//货物单位
				//specItemJson: '',//规格
				// 	buyOrderEntrustDetailGradeList: [//委托采购详细等级信息
				// 		{
				//			gradeNum:''
				// 			gradeName: '',//货物等级
				// 			gradeWithhold: '',//扣款原因
				// 			gradeRemark: '',//委托等级说明
				// 			buyNum: '',//数量
				// 			buyPrice:'',//等级价格
				// 			buyCycle:''//采购周期

				// 		}
				// 	],
				// }
			],
            buyOrderPayments: {//支付信息 
            	customerAccountSn:'',//支付sn
            	paymentsType:'',//付款账号类型
            	paymentsAccountName:'',//付款账号名称
            	paymentsAccountNo:'',//付款账号
            	paymentsRemark:''//支付说明
            },
			buyOrderLogis: {//物流信息
				recoverSn:'',//收货sn
				triageCenterSn:'',//分捡中心sn
				recoverProvince:'',//收货省份/提货省份
				recoverCity:'',//收货市/提货市
				recoverArea:'',//收货区域/提货区域
				recoverAddress:'',//收货具体地址/提货具体地址
				recoverUser:'',//收货人
				recoverZipcode:'',//收件邮编
				recoverPhone:'',//手机号
				recoverTel:'',//收件联系电话
				extractWay:'',//提货方式：0快递、1自提
				batchesNum:'2'//分批数量：1一次、n.N次 默认1次
			}
		}
		
		function selectGoodsAddress(d,mode){//收货地址
			if (d) {
				$s.buyOrder.buyOrderLogis.recoverSn = d.sn;
				$s.buyOrder.buyOrderLogis.recoverProvince = d.province;
				$s.buyOrder.buyOrderLogis.recoverCity = d.city;
				$s.buyOrder.buyOrderLogis.recoverArea = d.district;
				$s.buyOrder.buyOrderLogis.recoverAddress = d.address;
				$s.buyOrder.buyOrderLogis.recoverUser = d.name;
				$s.buyOrder.buyOrderLogis.recoverZipcode = d.postCode;
				$s.buyOrder.buyOrderLogis.recoverTel = d.telephone;
				$s.buyOrder.buyOrderLogis.recoverPhone = d.phone;
				$s.buyOrder.buyOrderLogis.extractWay = mode?mode:'0';
			};
		}
		function generateOrderNumber(){//生成订单号/时间
			req.jsonp({
				url:base_url + "/order/saleOrder/basicParams.do",
				data: {
					token: token,
					type:'0'
				},
				success: function(d){
					if (d.code == "BUS0000") {
						$s.pageLoading = true;
						$s.buyOrder.orderSn = d.data.saleOrderSn;//订单号
						$s.buyOrder.createDateStr = d.data.createDateStr;//订单时间
					};
					$s.$apply();
				},
				error: function(e){
					//layer.msg('订单号获取失败！', {time:1500});
					window.location.reload();
				}
			});
		}
		LOAD.getUserInfo.done(function(d){
			var d = d.data;
			
			var url = LOAD.getUrlParams(window.location.href,"?");
			$s.typeList = window.sessionStorage.getItem("typeList");
			if ($s.typeList) $s.typeList = JSON.parse( $s.typeList );
			console.log($s.typeList)

			$.map($s.typeList,function(o,i){
				o.buyCycle = o.buyCycle?o.buyCycle:'30';//采购周期

				//监听报价只能输入浮点数
				$s.$watch('typeList['+i+'].maxPrice',function(newVal,oldVal,o){
					var reg = /^\d+\.?\d*$/;
					if (newVal) {
						if (reg.test(newVal)) {
							$s.typeList[i].maxPrice =newVal;
						}else{
							$s.typeList[i].maxPrice = parseFloat(newVal);
						}
					}
				},true);
				// aa.focus();
				//监听采购数量只能输入数字
				$s.$watch('typeList['+i+'].number',function(newVal,oldVal){
					var reg = /^\d+\.?\d*$/;
					var unit = $s.typeList[i].unitValue;

					if(unit == '公斤' || unit == '斤' || unit == '千克' || unit == 'kg'){
						if (reg.test(newVal)) {
							$s.typeList[i].number = newVal;
						}else{
							$s.typeList[i].number = parseFloat(newVal);
						}
					}else{
						$s.typeList[i].number = parseInt(newVal);
					}

					if ($s.typeList[i].maxNum) {//从现货报价进来的
						if ($s.typeList[i].number>$s.typeList[i].maxNum) {
							layer.msg('数量不能大于'+$s.typeList[i].maxNum);
							$s.typeList[i].number = $s.typeList[i].maxNum;
						};
					};
					
				},true);
				//监听采购周期只能输入数字
				$s.$watch('typeList['+i+'].buyCycle',function(newVal,oldVal){
					$s.typeList[i].buyCycle = parseInt(newVal);
				},true);
			});
			
			//获取订单号/时间
			generateOrderNumber();
			
			// 获取收货地址
			var getGoodsReceiptAddress = function(){
				req.jsonp({
					url:base_url + "/customer/getCustomerAddress.do",
					data: { 
						cSn: d.sn,
						token: token
					},
					success: function(d){
						console.log(d)
						console.log(1122)
						if (d.code == 'BUS0000') {
							
						   $s.addressAll = d.data.reverse();

						   for (var i = 0; i < $s.addressAll.length; i++) {
						   	  if ($s.addressAll[i].isDefault==1) {
						   	  	var Default = $s.addressAll.splice(i,1);
						   	  	$s.addressAll.splice(0,0,Default[0]);
						   	  	break;
						   	  };
						   };
						  
						   selectGoodsAddress($s.addressAll[0]);
						  
						  
						   if ($s.addressAll.length>4) {
							   $('.showWhole').on('click',function(){
									if (!this.off) {
										$(this).html('隐藏部分地址')
									}else{
										$(this).html('显示全部地址')
									}
									this.off = !this.off;
									$('.addressUl').toggleClass('hidden');
								});
						   };
			        	}else{
			        		$s.addressAll = [];
			        	}

			        	 $s.$apply();
					},
					error: function(e){
						//失败
					}
				});
			}
			getGoodsReceiptAddress();
			
			
			//获取支付账户信息
			var getAccountPayInfo = function(){
				req.jsonp({
					url:base_url + "/customer/getCustomerAccountList.do",
					data: {cSn: d.sn,token:token},
					success: function(d){
						if (d.code == "BUS0000") {
							$s.accountList = d.data;
							$s.choiceAccount(d.data[0]);
							
						};
						$s.$apply();
					},
					error: function(e){
						alert('失败！')
					}
				});
			}
			//getAccountPayInfo();
			

			//获取分拣中心
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
					$s.pickAddress={
					    "address": data.address +' ' +data['name'],
					    "city": data.city,
					    "district": data.area,
					    "id": 128,
					    "name": data.principal,
					    "phone": data.telphone,
					    "postCode": data.postalcode,
					    "province": data.province,
					    "sn": data.sn,
					    "telephone": data.phone
					}
					$s.buyOrder.buyOrderLogis.triageCenterSn = data.sn;//分拣中心sn
					$s.$apply();
				},
				error: function(e){
					
				}
			});

			if (!$s.$$phase) $s.$apply(); //angular赃捡

			//点击管理收货地址的时候监听 or 点击管理账号信息的时候监听
			$('.administration').on('click',function(){
				var key = $(this).data('key');
				if (key=='storage_address') {
					changeStorage(key,getGoodsReceiptAddress);
				}else if(key == 'storage_account'){
					changeStorage(key,getAccountPayInfo);
				}
			});

			
			
		}).fail(signOut);
		//二手原因修改
		$s.reason_modify = function(d,index){
			$s.reason = true;
			$s.reason = $.extend(true,[],d);
			$s.goodIndex = index;
		}
		//选择原因确定
		$s.determineReason = function(){
			$s.typeList[$s.goodIndex].goodsExplainJson = $s.reason;
			$s.reason = false;//隐藏弹出框
		}
		//地址选择
		// $s.pickAddress = {"address":"和平路24号","addressAlias":"家里","billDateEnd":"","billDateStart":"","cSn":"CXX161018124127kdq6x2J41476765687096","city":"深圳","createDate":1478102400000,"district":"龙华区","id":128,"isDefault":1,"name":"何道臻","phone":"13878185525","postCode":"536000","province":"广东","sn":"CDZ161103175413083Z75441478166853755","status":0,"telephone":"0755-8506518","token":""}//提货地址

		$s.selectAddress = function(d,event,mode){
			
			$(event.currentTarget).addClass('cur').siblings('li').removeClass('cur');
			$(event.currentTarget).parent().siblings('.wrap_address').find('li').removeClass('cur');
			selectGoodsAddress(d,mode);
			
		}
		//分配发货监听只能输入整数
		$s.$watch('buyOrder.buyOrderLogis.batchesNum',function(newVal,oldVal){
			$s.buyOrder.buyOrderLogis.batchesNum = parseInt(newVal);
		});
		//分批发货选择
		$s.frequency = function(n,event){
			if (n=='1') {
				$s.buyOrder.buyOrderLogis.batchesNum = n;
				$s.inhibit = true;
			}else{
				$s.inhibit = false;
			}
		}
		//选择支付信息
		$s.choiceAccount = function(d){
			if (d) {
				$s.buyOrder.buyOrderPayments = {//支付信息
	            	customerAccountSn: d.sn,//用户收款账号SN
	            	paymentsType: d.bankName,//收款账号类型:0-网银转账 1-支付宝转账 2-E商贸通
	            	paymentsAccountName: d.belongsName,//收款用户名称
	            	paymentsAccountNo: d.bankAccount,//收款账号/支付宝账号
	            	paymentsRemark: d.bewrite//支付说明
	            }
            };
		}
		// 订单提交
		var temporaryJson = {};
		$s.buySubmitOrser = function(){

			if ($s.buyOrder.buyOrderLogis.recoverProvince=='') {//用省份字段判断收货地址是否为空
				layer.msg('您还未设置收货地址！', {time:1500});return;
			}
			// else if($s.buyOrder.buyOrderPayments.paymentsAccountName==''){
			// 	layer.msg('请先添加支付信息！', {time:1500});return;
			else if($s.buyOrder.orderRemark.length>50){
				layer.msg('备注内容长度最多50个字符！', {time:1500});return;
			}
			if (!$('#orderChecked').is(':checked')) {
				layer.msg('请勾选用户协议');
				return;
			};


			$s.buyOrder.buyOrderEntrustDetailExtendList.length = 0;
			layer.msg('请稍后，提交中...', {icon: 16,shade:[0.1, '#333'],time:200000});
			//委托采购明细信息
			var resource = false;//现货资源页面下单为true;
			for (var i = 0, len = $s.typeList.length; i < len; i++) {
				var This = $s.typeList[i];
				resource = This.resource;
				if (!temporaryJson[This.classifyName]) {
					temporaryJson[This.classifyName] = {
						goodsSn: This.classificationSaleSn||This.sn,//货物编号
						goodsCategoryName: This.productCategory,//货物类型
						goodsCategorySn: '',
						goodsName: This.classifyName,//货物名称
						goodsNum: This.number,//货物数量
						goodsUnit: This.unitValue,//货物单位
						specItemJson: This.specItemJson,//货物规格
						buyOrderEntrustDetailGradeList: []//委托采购详细等级信息
					}
				};
				if (!This.maxPrice) {
					layer.msg('报价不能为空', {time:2000});
					return;
				};
				if (!This.number) {
					layer.msg('采购数量不能为空', {time:2000});
					return;
				};
				if (!This.buyCycle) {
					layer.msg('采购周期不能为空', {time:2000});
					return;
				};
				if ((!$s.buyOrder.buyOrderLogis.batchesNum||$s.buyOrder.buyOrderLogis.batchesNum<2)&&!$s.inhibit) {
					layer.msg('分批发货需大于1', {time:2000});
					return;
				};
				if (typeof This.goodsExplainJson == 'object') {
					This.goodsExplainJson = JSON.stringify(This.goodsExplainJson);
				};
				temporaryJson[This.classifyName].buyOrderEntrustDetailGradeList.push({
					gradeName: This.grade ? This.grade : 'E',//货物等级
					gradeWithhold: This.goodsExplainJson,//扣款原因
					gradeRemark: This.goodsExplain ? This.goodsExplain : '',//委托等级说明
					buyNum: This.number,//数量
					buyPrice: Number(This.maxPrice).toFixed(2),//等级价格
					buyCycle: This.buyCycle,//采购周期
					gradeNum: This.gradeSn //等级sn
				})
				
			};
			for(var attr in temporaryJson){
				$s.buyOrder.buyOrderEntrustDetailExtendList.push(temporaryJson[attr])
			}

			var reqData = {};
			if (resource) {//现货资源下单
				$s.buyOrder.orderType = 'SPOTGOODS';
				$s.buyOrder.buyOrderLogis.triageCenterSn = $s.typeList[0].triageCenterSn;//分拣中心sn
				reqData = {
					token: token,
					buyOrderExtend: JSON.stringify( $s.buyOrder ),
					buyOrderSpotGoods:JSON.stringify({bindingSn: $s.typeList[0].bindingSn,businessSn: $s.typeList[0].businessSn})
				}
			}else{//正常下单
				reqData = {
					buyOrderExtend: JSON.stringify( $s.buyOrder ),
					buyOrderSpotGoods:'',
					token: token
				}
			}
			// console.log($s.buyOrder)
			// return;

			req.form({
				url:base_url +"/buyOrder/addBuyOrderEntrustDetailAndGrade.do",
				type:'post',
				data: reqData,
				success: function(d){
					layer.closeAll();
					if (d.code == "BUS0000") {
						window.location.href = '/page/buy/procurement_successful.html';
					}else{
						layer.msg(d.msg||'服务器繁忙，订单提交失败！');
						generateOrderNumber();//重新生成单号
					}
					console.log(d)
					$s.$apply();
				},
				error: function(e){
					layer.msg('服务器繁忙，订单提交失败！', {icon: 5,shade:[0.1, '#333'],time:2000});
					// alert('失败！')
				}
			});
		}

		//onstorage
		
		

	}])
	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['order_info']);
	});


	$('.wrap_info').on('click','.modify',function(){
		LOAD.open({
			title:'温馨提示',
			width: 870,
			height: 'auto',
			content: $('.sorting_core').clone(),
			head: false,
			success:function(obj){

			}
		});
	});

})