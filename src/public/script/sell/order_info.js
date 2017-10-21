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
	//判断只能输入数字
	.filter('checkNumber', function() {
		return function(num) {
			console.log(num)
			return 11;
		}
	})
	.filter('units', function() { //168000 台/1000 公斤
		return function(d) {
			if (!d) return;
			var json = {}
			var unit = '';

			angular.forEach(d,function(o,i){
				if (!json[o.goodsUnit]) {
					json[o.goodsUnit] = [o.goodsUnit,0];
				}
				json[o.goodsUnit][1] += parseInt(o.goodsNum)
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
	.run(['$rootScope','$timeout', function($rootScope,$timeout) {
		var $s = $rootScope;
		// 下单字段
		$s.sellOrder = { 
			 //销售订单实体
			saleOrder: {
			 	orderSn: '', //订单号
			 	orderRemark: '' //订单备注
			},
			//销售单物流实体
			saleOrderLogis: {
				sendProvince: '请选择',//发货省份
				sendCity: '请选择',//发货市
				sendArea: '请选择',//发货区
				sendAddress: '',//发货地址
				sendLogisticsCompany: '',//发货货物物流公司
				sendLogisticsNo: '',//发货物流单号
				recoverProvince: '广东',//收货省
				recoverCity: '深圳',//收货市
				recoverArea: '福田区',//收货区
				recoverAddress: '',//收货地址
				recoverUser: '淘绿网',//收件人
				recoverCode: '518031',//收件邮编
				recoverTel: '400-188-5167',//收件联系电话
				recoverPhone:'13823566794',
				triageCenterSn: ''//分捡中心sn
			},
			saleOrderEntrustDetails: [
				// {
				// 	goodsSn: '',//货物sn
				// 	goodsName: '',//货物名称
				// 	referencePrice: '',//参考价
				// 	unit: '',//单位
				// 	goodsNum: '',//数量/重量 
				// 	detailRemark: '',//备注
				// 	goodsCategory: ''//货物分类
				// }
			],
			saleOrderPayments: {
				paymentsType: '',//收款账号类型:0-网银转账 1-支付宝转账 2-E商贸通
				customerAccountSn: '',//用户收款账号SN
				paymentsAccountName: '',//收款账号名称
				paymentsAccountUser: '',//收款人/开户人
				paymentsAccountNo: '',//收款账号/支付宝账号
				paymentsRemark: ''//收款备注
			},
			createDateStr: ''//下单日期
		}
		//选择支付信息
		$s.choiceAccount = function(d){
			$s.sellOrder.saleOrderPayments = {
				paymentsType: '0',//收款账号类型:0-网银转账 1-支付宝转账 2-E商贸通
				customerAccountSn: d.sn,//用户收款账号SN
				paymentsAccountName: d.bankName,//收款账号名称
				paymentsAccountUser: d.belongsName,//收款人/开户人
				paymentsAccountNo: d.bankAccount,//收款账号/支付宝账号
				paymentsRemark: d.bewrite//收款备注
			}
		}
		LOAD.getUserInfo.done(function(d){
			var d = d.data;
			
			//获取支付账户信息
			var getAccountPayInfo = function(){
				req.jsonp({
					url:base_url + "/customer/getCustomerAccountList.do",
					data: {cSn: d.sn,token:token},
					success: function(d){
						if (d.code == "BUS0000") {
							$s.accountList = d.data;
							if (d.data&&d.data.length!=0) {
								$s.sellOrder.saleOrderPayments = {
									paymentsType: '0',//收款账号类型:0-网银转账 1-支付宝转账 2-E商贸通
									customerAccountSn: d.data[0].sn,//用户收款账号SN
									paymentsAccountName: d.data[0].bankName,//收款账号名称
									paymentsAccountUser: d.data[0].belongsName,//收款人/开户人
									paymentsAccountNo: d.data[0].bankAccount,//收款账号/支付宝账号
									paymentsRemark: d.data[0].bewrite//收款备注
								}
							};
							
						};
						$s.$apply($s.accountList);
						console.log()
					},
					error: function(e){
						alert('失败！')
					}
				});
			}
			getAccountPayInfo();

			//点击管理账号信息的时候监听
			$('.administration').on('click',function(){
				var key = $(this).data('key');
				changeStorage(key,getAccountPayInfo);
			});

			//获取订单号/时间
			req.jsonp({
				url:base_url + "/order/saleOrder/basicParams.do",
				data: {
					token: token,
					type:'1'
				},
				success: function(d){
					if (d.code == "BUS0000") {
						$s.sellOrder.saleOrder.orderSn = d.data.saleOrderSn;//订单号
						$s.sellOrder.createDateStr = d.data.createDateStr;//订单时间
						$s.pageLoading = true;
					};
					$s.$apply();
				},
				error: function(e){
					alert('失败！')
				}
			});
			//获取分拣中心(省份)

			//默认
			$s.sortingProvince = '广东';
			$s.sortingCity = '深圳';
			$s.sortingArea = '龙华新区';
			$s.fjCenter = '深圳分拣中心';
			$s.sortingName = true;
			var findSoritng = function(data,fn){
				req.jsonp({
					//url:base_url + "/order/saleOrder/basicParams.do",
					url:base_url_sorting + "/sortingInfo/findSorting.do",
					data: data||{},
					success: function(d){
						fn&&fn(d);
						$s.$apply();
					},
					error: function(e){
						
					}
				});
			}

			//获取默认
			findSoritng({province:$s.sortingProvince,city:$s.sortingCity},function(d){
				var d = d.data[0];
				$s.sortingName = d;
				getFjCenter();
				$s.$apply();
			})

			//获取省份
			findSoritng({},function(d){
				if (d.code == "BUS0000") {
					var isProvince = {};
					for (var i = 0; i < d.data.length; i++) {
						if (!isProvince[d.data[i].province]) {
							isProvince[d.data[i].province] = true;
						}else{
							d.data.splice(i,1);
							i--;
						}
					};
					$s.province = d.data;
				};
			})
			
			// 改变省份
			$s.changeProvince = function(province){
				province = province?province:$s.sortingProvince;
				$s.sortingName = false;
				if (!province) {
					return;
				}
				findSoritng({province: province},function(d){
					if (d.code == "BUS0000") {
						var isCity = {};
						for (var i = 0; i < d.data.length; i++) {
							if (!isCity[d.data[i].city]) {
								isCity[d.data[i].city] = true;
							}else{
								d.data.splice(i,1);
								i--;
							}
						};
						$s.city = d.data;
					};
				})
			}
			$s.changeProvince('广东');
			// 改变市
			$s.changeCity = function(province,city){
				province = province?province:$s.sortingProvince;
				city = city?city:$s.sortingCity;
				$s.sortingName = false;
				if (!city) {
					return;
				}
				findSoritng({
					province: province,
					city: city
				},function(d){
					if (d.code == "BUS0000") {
						var isArea = {};
						for (var i = 0; i < d.data.length; i++) {
							if (!isArea[d.data[i].area]) {
								isArea[d.data[i].area] = true;
							}else{
								d.data.splice(i,1);
								i--;
							}
						};
						$s.area = d.data;
					};
				})
			}
			$s.changeCity('广东','深圳');
			// 改变区
			$s.changeArea = function(province,city,area){
				province = province?province:$s.sortingProvince;
				city = city?city:$s.sortingCity;
				area = area?area:$s.sortingArea;
				$s.sortingName = false;
				if (!area) {
					return;
				}
				findSoritng({
					province: province,
					city: city,
					area: area,
				},function(d){
					if (d.code == "BUS0000") {
						$s.nameData = d.data;
						$s.$apply()
					};
				})
			}
			$s.changeArea('广东','深圳','龙华新区');
			// 改变分拣中心
			var getFjCenter = function(){
				if (!$s.sortingName) return;
				$s.sellOrder.saleOrderLogis.recoverProvince = $s.sortingName.province;//收货省
				$s.sellOrder.saleOrderLogis.recoverCity = $s.sortingName.city;//收货市
				$s.sellOrder.saleOrderLogis.recoverArea = $s.sortingName.area;//收货区
				$s.sellOrder.saleOrderLogis.recoverAddress = $s.sortingName.address + ' ' +$s.sortingName.name;//收货地址
				$s.sellOrder.saleOrderLogis.recoverUser = $s.sortingName.principal;//收件人
				// $s.sellOrder.saleOrderLogis.telphone = $s.sortingName.telphone;//收件电话
				$s.sellOrder.saleOrderLogis.recoverCode = $s.sortingName.postalcode;//收件邮编
				$s.sellOrder.saleOrderLogis.recoverTel = $s.sortingName.phone;//收件联系电话
				$s.sellOrder.saleOrderLogis.recoverPhone = $s.sortingName.telphone;//收件联系电话
				$s.sellOrder.saleOrderLogis.triageCenterSn = $s.sortingName.sn;//分捡中心sn
			}
			$s.changeName = function(d){
				
				if (!$s.fjCenter) {
					$s.sortingName = false;
					return;
				}
				for (var i = 0; i < $s.nameData.length; i++) {
					if ($s.nameData[i].name == $s.fjCenter) {
						$s.sortingName = $s.nameData[i];
					};
				};
				getFjCenter();
			}

			//基本信息
			$s.typeList = window.sessionStorage.getItem("typeList");
			if ($s.typeList) $s.typeList = JSON.parse($s.typeList);
			console.log($s.typeList)
			angular.forEach($s.typeList,function(o,i){
				$s.sellOrder.saleOrderEntrustDetails.push({
					goodsSn: o.sn,//货物sn
					goodsName: o.classifyName,//货物名称
					referencePrice: o.referencePrice||'',//参考价
					goodsUnit: o.unitValue,//单位
					goodsNum: o.number,//数量/重量 
					detailRemark: o.goodsExplain,//备注
					goodsExplain: o.goodsExplain,//货物说明
					goodsCategory: o.productCategory,//货物分类
					gradeName: o.gradeName,//等级
					gradeSn:o.gradeSn //等级sn

				});
				//监听输入框只能输入数字
				$s.$watch('sellOrder.saleOrderEntrustDetails['+i+'].goodsNum',function(newVal,oldVal){
					var reg = /^\d+\.?\d*$/;
					var unit = $s.sellOrder.saleOrderEntrustDetails[i].goodsUnit;
					if(unit == '公斤' || unit == '斤' || unit == '千克' || unit == 'kg'){
						if (reg.test(newVal)) {
							$s.sellOrder.saleOrderEntrustDetails[i].goodsNum =newVal;
						}else{
							$s.sellOrder.saleOrderEntrustDetails[i].goodsNum = parseFloat(newVal);
						}
					}else{
						$s.sellOrder.saleOrderEntrustDetails[i].goodsNum = parseInt(newVal);
					}
				},true);
			});

			if (!$s.$$phase) $s.$apply(); //angular赃捡

			// 初始化地区
			$.citySelect({
				obj:$('.choice_region,.div_select'),
				json:city,
				prov:"请选择", 
				city:"请选择", 
				dist:"请选择",
				nodata:'none'
			});
		}).fail(signOut);

		// 订单提交
		$s.sellSubmitOrser = function(){
			// console.log($s.sellOrder.saleOrderLogis)
			// return

			for (var i = 0; i < $s.sellOrder.saleOrderEntrustDetails.length; i++) {
				if (!$s.sellOrder.saleOrderEntrustDetails[i].goodsNum) {
					layer.msg('供货数量不能为空', {time:2000});
					return;
				};
			};
			if ($s.sellOrder.saleOrderLogis.sendProvince=="请选择") {
				layer.msg('请选择货物所在区域');
				return;
			};
			if (!$s.sellOrder.saleOrderPayments.paymentsAccountName) {
				layer.msg('请先添加收款信息！', {time:2000});
				return;
			};
			var fjSelect = $('.div_select .form-control');
			for (var i = 0; i < fjSelect.length; i++) {
				var _text = fjSelect.eq(i).find("option:selected").text();
				if (_text=='请选择') {
					layer.msg('请选择货物要发往的分拣中心');
					return;
				};
			};
			// if (!$s.sortingName) {
			// 	layer.msg('请选择货物要发往的分拣中心');
			// 	return;
			// };
			if ($s.sellOrder.saleOrder.orderRemark.length>50) {
				layer.msg('备注内容长度最多50个字符！');
				return;
			};
			if (!$('#orderChecked').is(':checked')) {
				// layer.tips('请勾选用户协议', $('#orderChecked').parent(), {tips: [2, '#f62d13']});
				layer.msg('请勾选用户协议');
				return;
			};
			
			layer.msg('请稍后，提交中...', {icon: 16,shade:[0.1, '#333'],time:200000});

			$s.sellOrder.saleOrderLogis.sendCity = $('.choice_region .city').val();//市
			$s.sellOrder.saleOrderLogis.sendArea = $('.choice_region .dist').val();//区
			// console.log( $s.sellOrder );
			// return;
			req.form({
				url:base_url + "/order/saleOrder/addSave.do",
				type:'post',
				data: {json: JSON.stringify( $s.sellOrder ),token: token},
				success: function(d){
					if (d.code == "BUS0000") {
						window.location.href = '/page/sell/order_success.html';
						window.sessionStorage.setItem("saleOrderLogis", JSON.stringify($s.sellOrder.saleOrderLogis));
						layer.closeAll();
					}else{
						layer.msg(d.msg);
					}
					console.log(d)
					$s.$apply();
				},
				error: function(e){
					layer.msg('服务器繁忙，订单提交失败！', {icon: 5,shade:[0.1, '#333'],time:2000});
				}
			});
		}

	}])
	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['order_info']);
	});

})