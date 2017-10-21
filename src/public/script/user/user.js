define(['jquery','script/index/load_init','script/utils/angular','script/utils/angular-route.1.2.9.min','script/utils/req','script/utils/layer'],function($, LOAD, angular, route, req ,layer){
   	var token = getStorageToken();
   	
	angular.module('tlUser',['ngRoute']).
	//时间戳转日期
	filter('toDate', function() {
		return function(perDate) {
			if (!perDate) return;
			var date = new Date(perDate);
			Y = date.getFullYear() + '-';
			M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
			D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
			h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':';
			m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':';
			s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()):date.getSeconds()); 
			var afterDate = Y+M+D;

			return afterDate;
		}
	}).
	config(['$routeProvider',function($routeProvider){
		
		$routeProvider
			//我的资料
			.when('/account/datum',{
				template : require('userDir/account/datum.ejs'),
				controller: 'account_datum'
			})
			//安全中心
			.when('/account/safe',{
				template : require('userDir/account/safe.ejs'),
				controller: 'account_safe'
			})
			//地址管理
			.when('/account/address',{
				template : require('userDir/account/address.ejs'),
				controller: 'account_address'
			})
			//我的消息
			.when('/account/news',{
				templateUrl : 'account/news.html',
				controller: 'account_news'
			})
			//消息订阅
			.when('/account/subscribe',{
				templateUrl : 'account/subscribe.html',
				controller: 'account_subscribe'
			})
			//账号绑定
			.when('/account/binding',{
				templateUrl : 'account/binding.html',
				controller: 'account_binding'
			})
			//支付账户信息
			.when('/account/payment',{
				template : require('userDir/account/payment.ejs'),
				controller: 'assets_payment'
			})
			.otherwise({
				redirectTo : '/account/datum',
				controller: 'account_datum'
			});
		
	}]).
	//我的资料
	controller('account_datum',['$scope','$location','$routeParams','$timeout','$http',function($scope,$location,$routeParams,$timeout,$http){
		if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
		// var index = layer.load(0);
		$scope.infoShow = true;
		
		LOAD.getUserInfo.done(function(d){
			$scope.datum = true;//显示用户资料
			$scope.user_datum = d.data;
			$scope.pageLoadingFn();
			$scope.user_datum.birthday=$scope.user_datum.birthday=='0-0-0'?'':$scope.user_datum.birthday;

        	$scope.birthdayArr = $scope.user_datum.birthday&&$scope.user_datum.birthday.split('-')||[0,0,0];//日期切割
        	$scope.birthdayArr = $scope.birthdayArr[0]==0?[0,0,0]:$scope.birthdayArr;


        	//详细地址
        	if (d.data.province!='请选择') {
        		$scope.address = (d.data.province||'')+' '+(d.data.city||'')+' '+(d.data.district||'')+' '+(d.data.address||'');
        		$scope.address = $.trim($scope.address);
        	};

        	if (!$scope.$$phase) $scope.$apply();

        	$('#user_image').attr('src',d.data.imageUrl?d.data.imageUrl:require('images/user/user_image.png'));

			$scope.revise_info = function(){
				$scope.infoShow = false;
				$('body,html').animate({scrollTop:0},500); 
				$.placeholder();

				$('#sel_year,#sel_month,#sel_day').html('');
				$.datePicker();//生日
				require(['script/utils/city'],function(json){
					console.log(d.data.province)
					$.citySelect({
						obj:$('.citySelect'),
						json:json,
						prov:d.data.province||'广东', 
						city:d.data.city||'深圳', 
						dist:d.data.district||'福田区',
						nodata:'none'
					});
				})
			}
			setTimeout(function(){

        		layer.closeAll();
        	},200)
		}).fail(signOut);
		
		
		//上传用户头像
		$('#upUserPortrait').change(function(){
			layer.msg('请稍后，上传中...', {icon: 16,shade:[0.1, '#333'],time:200000});
			req.form({
				//url:"http://192.168.103.38:8080/b2b.admin-3.0.0/file/filesUpload.do",
				url: base_url + "/file/filesUpload.do?token="+token+"&space=customer&method=post",
				formId: 'UserPortraitForm',
				type: 'post',
				success: function(data){
					if (data.state=='SUCCESS') {
						var Img = new Image();
						Img.src = data.url;
						Img.onload = function(){
							// opts.Img.attr('src',data.url).css({'opacity':1,width:'100%',height:'100%'});
							// _this.data('url',data.url);
							$('#showImage').attr('src',data.url).data('url',data.url);
							layer.closeAll();
						}
					}else{
						layer.msg(data.state, {time:2000});
					}
				},
				error: function(data){
					console.log('错误：'+data)
					layer.closeAll();
					layer.msg('服务器无响应，上传失败！', {icon: 5,shade:[0.1, '#333']});
				}
			});
		})
		//保存
		$scope.preservation_user_info = function(){
			
				
				var s = $scope;
				// var district = $('.prov').val() + ' ' + $('.city').val() + ' ' +$('.dist').val();
				var detailed_address = $('.detailed_address').val();
				var imageUrl = $('#showImage').attr('src');
				var sel_year = parseInt($('#sel_year').val());
				var sel_month = parseInt($('#sel_month').val());
				var sel_day = parseInt($('#sel_day').val());
				if (sel_year&&sel_month&&sel_day) {
					s.user_datum.birthday = sel_year + '-' + sel_month + '-' +sel_day;
				}else{
					s.user_datum.birthday = '';
				}
				s.user_datum.sex = parseInt($('.sex input:checked').val());
				s.user_datum.telephone = $('.telephone').val();
				s.user_datum.postCode = $('.postCode').val();
				s.user_datum.city = $('.city').val()||'';
				s.user_datum.district = $('.dist').val()||'';
				s.user_datum.province = $('.prov').val()||'';
				s.user_datum.nickName = $('.nickName').val();
				s.user_datum.address = detailed_address;
				s.user_datum.imageUrl = imageUrl.indexOf('http://')>=0?imageUrl:'';//头像


				if (s.user_datum.nickName.length>10) {
					layer.msg('真实姓名长度不能大于10位');
					return;
				};
				// if (!/^\d{6}$/g.test(s.user_datum.postCode)) {
				// 	layer.msg('邮政编码由6位数字组成');
				// 	return;
				// };
				var index = layer.load(0);
				$scope.address = s.user_datum.province+' '+s.user_datum.city+' '+s.user_datum.district+' '+s.user_datum.address;
				var user_data = {
					sex : s.user_datum.sex,
					birthday: s.user_datum.birthday==''?'0-0-0':s.user_datum.birthday,
					telephone: s.user_datum.telephone,
					postCode: s.user_datum.postCode,
					city: s.user_datum.city,
					district: s.user_datum.district,
					province: s.user_datum.province,
					nickName: s.user_datum.nickName,
					address: s.user_datum.address,
					imageUrl: s.user_datum.imageUrl,
					sn: s.user_datum.sn,
					token: token
				}

			    req.jsonp({
					url:base_url + "/customer/updateCustomer.do",
					data: user_data,
					success: function(d){
						layer.close(index);  
			        	layer.msg('资料修改成功！', {icon: 6,shade:[0.1, '#333'],time:1000});
			        	$('#user_image').attr('src',imageUrl);
			        	setTimeout(function(){
			        		$scope.infoShow = true;
			        	    $scope.$apply();
			        	},1000)
			        	console.log(d)
					},
					error: function(e){
						layer.close(index);
						layer.msg('信息修改失败！', {icon: 5,shade:[0.1, '#333'],time:1000});
					}
				})
		}
		//返回
		$scope.backP = function(){
			$scope.infoShow = true;
			var s = $scope;
			
			$('.telephone').val(s.user_datum.telephone);
			$('.postCode').val(s.user_datum.postCode);
			$('.nickName').val(s.user_datum.nickName);
			$('.detailed_address').val(s.user_datum.address);
		}
	}]).
	//我的消息
	controller('account_news',['$scope','$location','$routeParams','$timeout','$http',function($scope,$location,$routeParams,$timeout,$http){
		if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
		//$scope.newShow = false;
		var index;
		$('.news_head').on('click','button',function(){
			index = $(this).index();
			$(this).addClass('cur').siblings('button').removeClass('cur');
			$('.news_list_ul').eq(index).show().siblings('.news_list_ul').hide();
			$('.emptyNew').eq(index).show().siblings('.emptyNew').hide();
		});

		LOAD.getUserInfo.done(function(d){
			var d = d.data;
			//获取系统通知信息
			req.jsonp({
				url: base_url_admin + "/instation/getInform.do",
				success: function(d){
					console.log(d)
					$scope.systemMsg = d.data;
					$scope.isNew = true;
					$scope.pageLoadingFn();
					$scope.$apply();
					setTimeout(function(){
		        		layer.closeAll();
		        	},200)
				},
				error: function(e){
					alert('获取消息失败！')
				}
			});
			//屏蔽/删除系统通知信息
			$scope.shieldSystemMsg = function(sn,index){
				
				layer.msg('您确定要屏蔽吗？', {
			       icon: 3
			      ,btn: ['确定','取消']
			      ,shade:[0.1, '#333']
			      ,time: 100000
			      ,yes: function(){
						req.jsonp({
							url: base_url_admin + "/instation/changeInformStatus.do",
							data: {sn:sn},
							success: function(d){
								console.log(d)
								$scope.systemMsg.splice(index,1);
								$scope.$apply();
								layer.msg('操作成功！',{time:1000});
							},
							error: function(e){
								alert('失败！')
							}
						})
			      }
			    });
			}
			// 获取站内信息
			req.jsonp({
				url: base_url_admin + "/instation/getInstation.do",
				success: function(d){
					console.log(d)
					$scope.instationMsg = d.data;
					$scope.isNew = false;
					$scope.$apply();
				},
				error: function(e){
					alert('获取消息失败！')
				}
			});
			//屏蔽/删除站内信息
			$scope.shieldInstationMsg = function(sn,index){
				
				layer.msg('您确定要屏蔽吗？', {
			       icon: 3
			      ,btn: ['确定','取消']
			      ,shade:[0.1, '#333']
			      ,time: 100000
			      ,yes: function(){
					req.jsonp({
						url: base_url_admin + "/instation/changeInstation.do",
						data: {sn:sn,state:'D'},
						success: function(d){
							$scope.instationMsg.splice(index,1);
							$scope.$apply();
							console.log(d)
							layer.msg('操作成功！',{time:1000});
						},
						error: function(e){
							alert('失败！')
						}
					})
			      }
			    });
			}
			//清空所有站内信息
			var url;
			$scope.clearInstation = function(sn){
				
				if (index==1) {//站内信息
					url = base_url_admin + '/instation/clearInstation.do'
				}else{//系统信息
					url = base_url_admin + '/instation/clearInformStatus.do'
				}

				layer.msg('您确定要清空吗？', {
			       icon: 3
			      ,btn: ['确定','取消']
			      ,shade:[0.1, '#333']
			      ,time: 100000
			      ,yes: function(){
					req.jsonp({
						url: url,
						data: {token:token,state:'D'},
						success: function(d){
							if (index==1) {
								$scope.instationMsg = [];
							}else{
								$scope.systemMsg = [];
							}
							$scope.$apply();
							layer.msg('操作成功！',{time:1000});
						},
						error: function(e){
							alert('失败！')
						}
					})
			      }
			    });
			}
		}).fail(signOut);
	}]).
	//地址管理
	controller('account_address',['$scope','$location','$routeParams','$timeout','$http','$compile',function($scope,$location,$routeParams,$timeout,$http,$compile){

		

		if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
		$scope.add_address = function(prov,city,dist){
			if (prov) {
				$scope.editOff = true;//判断是否是编辑还是新添加 true为编辑
			}else{
				$scope.editOff = false;
				if ($scope.addressAll.length>=20) {
					layer.msg('最多只能添加20条地址！');
					return;
				};
			}
			layer.open({
				title: $scope.editOff?'编辑地址':'添加地址',
				// width: '550px',
				// height: 'auto',
				fixed: true,
				btn: false,
				skin: 'demo-class',
				area: ['550px','auto'],
				content: $('#newly_added').html(),
				success:function(obj,q){
					
					var template = angular.element(obj[0]);
					$compile(template)($scope);
					if (!prov) $scope.editData = {};
					
					//$scope.$apply();
					// angular.element('.address_btn').on('click',function(){
					// 	alert($scope.name)
					// })
					require(['script/utils/city'],function(json){
						$.citySelect({
							obj:$('.citySelect'),
							json:json,
							prov:prov||"广东", 
							city:city||"深圳", 
							dist:dist||"福田区",
							nodata:'none'
						});
					})
				}
			});
		}

		//获取收货地址
		var getCustomerAddress = function(){
			LOAD.getUserInfo.done(function(d){
				var d = d.data;
				req.jsonp({
					url:base_url + "/customer/getCustomerAddress.do",
					data: { 
						cSn: d.sn,
						token: token
					},
					success: function(d){
						
						if (d.code == 'BUS0000') {
						   $scope.addressAll = d.data;
			        	}else{
			        		$scope.addressAll = [];
			        	}

			        	$scope.pageLoadingFn();
						$scope.$apply();
			        	setTimeout(function(){
			        		layer.closeAll();
			        	},200)
					},
					error: function(e){
						//失败
					}
				})
			}).fail(signOut)
		}
		getCustomerAddress();

		//添加地址
		$scope.preservation_address = function(){
			var s = $scope;
			var phoneReg = /^1([3,5,7,8]\d|4[5,7])\d{8}$/g;
			var _name = $('#name'),
			    _prov = $('#prov'),
			    _city = $('#city'),
			    _dist = $('#dist'),
			    _detailed_address = $('#detailed_address'),
			    _postcode = $('#postcode'),
			    _phone = $('#phone'),
			   _addressAlias = $('#addressAlias'),
			   _telephone = $('#telephone');

			var yzReg = /^[1-9]\d{5}$/;//邮政编码
			var cyReg = /^[a-zA-Z\u4e00-\u9fa5 ]{2,20}$/;
			if (_name.val()=='') {
				LOAD.msg({obj: $('.newly_added'),txt: '请输入姓名',});return;
			}else if (!cyReg.test(_name.val())) {
				LOAD.msg({obj: $('.newly_added'),txt: '姓名格式有误！',});return;
			}else if((!_prov.val()||!_city.val())&&_prov.val()!='国外'){
				LOAD.msg({obj: $('.newly_added'),txt: '所在地区有误',});return;
			}else if(!_detailed_address.val()){
				LOAD.msg({obj: $('.newly_added'),txt: '请输入详细地址',});return;
			}else if(_detailed_address.val().length>50){
				LOAD.msg({obj: $('.newly_added'),txt: '详细地址最长为50个字符！',});return;
			}
			// else if(_postcode.val()==''){
			// 	LOAD.msg({obj: $('.newly_added'),txt: '请输入邮政编码'});return;
			// }else if(!yzReg.test(_postcode.val())){
			// 	LOAD.msg({obj: $('.newly_added'),txt: '请输入正确的邮政编码'});return;
			// }
			else if(_phone.val()==''){
				LOAD.msg({obj: $('.newly_added'),txt: '请输入手机号'});return;
			}else if(!phoneReg.test(_phone.val())){
				LOAD.msg({obj: $('.newly_added'),txt: '手机号码格式有误'});return;
			}
			var index = layer.load(0,{shade:[0.1, '#333']});
			LOAD.getUserInfo.done(function(d){
				var d = d.data;
				var data = {} , url = '';
				if ($scope.editOff) {
					//编辑状态
					url = base_url + '/customer/updateCustomerAddress';
					data = {
						name: _name.val() , 
						province: _prov.val(), //省份
						city: _city.val(), //城市
						district: _dist.val(), //地区
						address: _detailed_address.val(), //详细地址
						postCode: _postcode.val(), //邮政编码
						phone: _phone.val(), //手机
						addressAlias: _addressAlias.val(), //别名
						telephone: _telephone.val(), //电话
						sn: s.sn,
						token: token
					}
				}else{
					//新添加地址
					url = base_url + '/customer/addCustomerAddress.do';
					data = {
						name: _name.val() , 
						province: _prov.val(), //省份
						city: _city.val(), //城市
						district: _dist.val()||"", //地区
						address: _detailed_address.val(), //详细地址
						postCode: _postcode.val(), //邮政编码
						phone: _phone.val(), //手机
						addressAlias: _addressAlias.val(), //别名
						telephone: _telephone.val(), //电话
						cSn: d.sn,
						token: token
					}
				}

				req.jsonp({
					url: url,
					data: data,
					success: function(d){
						layer.close(index);
						if (d.code == 'BUS0000') {
						   layer.msg($scope.editOff?'修改成功！':'添加成功！',{time:1000});
						   window.localStorage.setItem('storage_address', Math.random());
						   setTimeout(function(){
						   	  getCustomerAddress();
						   },1000)
						   // LOAD.remove();
			        	}else{
			        		LOAD.msg({obj: $('.newly_added'),txt: d.msg,});
			        	}
					},
					error: function(e){
						alert('失败！')
					}
				})
			}).fail(signOut);
		}
		//编辑地址
		$scope.edit_address = function(sn,index){
			$scope.editData = $scope.addressAll[index];
			$scope.sn = sn;
			$scope.add_address($scope.editData.province,$scope.editData.city,$scope.editData.district);
			console.log($scope.editData)
		}
		//设置默认地址
		$scope.set_default = function(sn,index){
			LOAD.getUserInfo.done(function(d){
				var d = d.data;
				req.jsonp({
					url: base_url + "/customer/updateCustomerAddressDefault",
					data: {sn:sn ,cSn: d.sn,token:token},
					success: function(d){
						if (d.code == 'BUS0000') {
							getCustomerAddress();
							layer.msg('设置成功！',{time:1500});
						   //layer.msg('设置默认地址成功！', {icon: 6,shade:[0.1, '#333']});
			        	}else{
			        		layer.msg(d.msg, {tips: [2, '#f62d13']});
			        	}
					},
					error: function(e){
						alert('失败！')
					}
				})
			}).fail(signOut);
			
		}
		//删除地址
		$scope.delete_address = function(sn,index){
			layer.msg('您确定要删除吗？', {
		       icon: 3
		      ,btn: ['确定','取消']
		      ,shade:[0.1, '#333']
		      ,time: 100000
		      ,yes: function(){
		      	LOAD.getUserInfo.done(function(d){
					var d = d.data;
					req.jsonp({
						url: base_url + "/customer/updateCustomerAddressStatus.do",
						data: {sn:sn ,status: 1,token:token},
						success: function(d){
							if (d.code == 'BUS0000') {
								getCustomerAddress();
								layer.msg('删除成功！',{time:1500});
				        	}else{
				        		layer.msg(d.msg, {tips: [2, '#f62d13']});
				        	}
						},
						error: function(e){
							alert('失败！')
						}
					})
				}).fail(signOut);
		      }
		    });
		}
	}]).
	//支付账户信息
	controller('assets_payment',['$scope','$location','$routeParams','$timeout','$http','$compile',function($scope,$location,$routeParams,$timeout,$http,$compile){
		if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
		LOAD.getUserInfo.done(function(d){
			var d = d.data;
			$scope.phone = d.phone.substr(0,3)+"****"+d.phone.substr(7);
			var getAccountInfo = function(){

				req.jsonp({
					url:base_url + "/customer/getCustomerAccountList.do",
					data: {cSn: d.sn,token:token},
					success: function(d){
						if (d.code == "BUS0000") {
							$scope.accountList = d.data;
						};
						$scope.pageLoadingFn();
						$scope.$apply();
					},
					error: function(e){
						alert('失败！')
					}
				});
			}
			getAccountInfo();
			// 获取身份证信息
			req.jsonp({
				url:base_url + "/customer/getCustomerCards.do",
				data: { cSn: d.sn , token: token},
				success: function(d){
					if (d.code == 'BUS0000') {
					    var d = d.data;
					    $scope.status = d.status; //0是还未审核 1审核通过 2未通过
					    if (d.status=='1') {
					    	$scope.idCard = d.idCard.substr(0,3)+"***********"+d.idCard.substr(14,18);
					    	$scope.cardData = d;
					    };
		        	}else{
		        		$scope.status = '-1';//还未上传身份证信息
		        	}

		        	if (!$scope.$$phase) $scope.$apply();
		        	setTimeout(function(){
		        		layer.closeAll();
		        	},200)
				},
				error: function(e){
					//失败
				}
			});
			//获取验证码
			var $timeBtn;
			$scope.get_phone_code = function($event){
				$timeBtn = $event.target;
				$event.target.time = !$event.target.time ? 60 : $event.target.time;
				if ($event.target.time!==60) return;
				LOAD.countTime($event.target);//验证码倒计时
				req.jsonp({
					url:base_url + "/customer/sendPhoneVerificationCode.do",
					data: {phone: d.phone,captcha: 'BUST000003'},
					success: function(d){
						if (d.code != "BUS0000") {
							layer.msg(d.msg, {icon: 5,shade:[0.1, '#333']});
							LOAD.countTime($event.target,true);//手机发送频繁 true为停止倒计时
						}
					},
					error: function(e){
						layer.msg('服务器繁忙，手机发送失败！', {icon: 5,shade:[0.1, '#333']});
						$($event.target).html('获取验证码').removeClass('disabled');
						clearInterval($event.target.Interval);
						time = 60;
					}
				})
			}

			// 修改账号信息
			$scope.reviseData = []
			$scope.revise_account = function(i,sn){
				$('.accountInfo input,.accountInfo textarea').val('');
				$scope.editOff = true;//判断是否是编辑还是新添加 true为编辑
				$scope.show = true;
				$scope.sn = sn;
				$scope.reviseData = $scope.accountList[i];

				setTimeout(function(){//刚添加时就修改没值 先这样
					if ($('#bankName').val()=='') {
						$('#bankName').val($scope.reviseData.bankName)
						$('#bankAccount').val($scope.reviseData.bankAccount)
						$('#belongsName').val($scope.reviseData.belongsName)
						$('#belongsPhone').val($scope.reviseData.belongsPhone)
						$('#bewrite').val($scope.reviseData.bewrite)
					};
				},100)
			}
			//显示添加账户信息
			$scope.addAccountInfoBtn = function(){
				$scope.show=true;
				$scope.editOff=false;
				$scope.reviseData=[];
				$('.accountInfo input,.accountInfo textarea').val('');
			}
			//删除账号信息
			$scope.renove_account = function(sn){
				layer.msg('您确定要删除吗？', {
			       icon: 3
			      ,btn: ['确定','取消']
			      ,shade:[0.1, '#333']
			      ,time: 100000
			      ,yes: function(){
			      	LOAD.getUserInfo.done(function(d){
						var d = d.data;
						req.jsonp({
							url: base_url + "/customer/updateCustomerAccountStatus.do",
							data: {sn:sn ,status: 1,token:token},
							success: function(d){
								if (d.code == 'BUS0000') {
									getAccountInfo();
									layer.msg('删除成功！',{time:1500});
					        	}else{
					        		layer.msg(d.msg, {tips: [2, '#f62d13']});
					        	}
							},
							error: function(e){
								alert('失败！')
							}
						})
					})
			      }
			    });
			}
			// 添加账户信息
			$scope.addCustomerAccount = function(i){

				var s = $scope;
				var reg = /^1([3,5,7,8]\d|4[5,7])\d{8}$/g;
				var bankReg = /^(\d{16}|\d{19})$/;
				var chineseReg =/^[\u4E00-\u9FA5]+$/;
				var cyReg = /^([a-zA-Z]){2,6}$|^([\u4e00-\u9fa5]){2,20}$/;
				var mail =  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
				// var english = /^[a-zA-Z]{1,20}$/
				var bankName = $('#bankName'), //持卡所属
				    bankAccount = $('#bankAccount'), //持卡账号
				    belongsName = $('#belongsName'), //持卡人姓名
				    belongsPhone = $('#belongsPhone'), //持卡手机号
				    bewrite = $('#bewrite') //备注

				    if (bankName.val()=='') {
				    	layer.tips('请输入持卡的银行', bankName, {tips: [2, '#f62d13']});return;
				    }else if (!chineseReg.test(bankName.val())) {
				    	layer.tips('输入有误，只能输入中文', bankName, {tips: [2, '#f62d13']});return;
				    }else if(bankAccount.val()==''){
				    	layer.tips('请输入账号', bankAccount, {tips: [2, '#f62d13']});return;
				    }else if(!/^\d+$/g.test(bankAccount.val())&&!mail.test(bankAccount.val())){
				    	layer.tips('账号输入有误', bankAccount, {tips: [2, '#f62d13']});return;
				    }else if(!belongsName.val()){
				    	layer.tips('请输入姓名', belongsName, {tips: [2, '#f62d13']});return;
				    }else if(!cyReg.test(belongsName.val())){
				    	layer.tips('姓名格式有误！', belongsName, {tips: [2, '#f62d13']});return;
				    }else if(!belongsPhone.val()){
				    	layer.tips('请输入手机号', belongsPhone, {tips: [2, '#f62d13']});return;
				    }else if(!reg.test(belongsPhone.val())){
				    	layer.tips('手机号格式有误', belongsPhone, {tips: [2, '#f62d13']});return;
				    }else if(bewrite.val().length>30){
				    	layer.tips('备注不能超过30个字符！', bewrite, {tips: [2, '#f62d13']});return;
				    }
				    var account_data, url;
				    if (s.editOff) {//编辑
				       url = "/customer/updateCustomerAccount.do";
					   account_data = {
					    	bankName: bankName.val(),
					    	bankAccount: bankAccount.val(),
					    	belongsName: belongsName.val(),
					    	belongsPhone: belongsPhone.val(),
					    	bewrite: bewrite.val(),
					    	cSn: d.cSn,
					    	sn: s.sn,
					    	token:token
					    }
				    }else{//新增
				    	url = "/customer/addCustomerAccount.do";
				    	account_data = {
					    	bankName: bankName.val(),
					    	bankAccount: bankAccount.val(),
					    	belongsName: belongsName.val(),
					    	belongsPhone: belongsPhone.val(),
					    	bewrite: bewrite.val(),
					    	cSn: d.sn,
					    	token:token
					    }
				    }
				    layer.load(0,{shade:[0.1, '#333']});
				    LOAD.sendPhoneCode('phoneCode',d.phone).done(function(){
			   			 req.jsonp({
							url:base_url + url,
							data: account_data,
							success: function(d){
								$timeout(function(){
									layer.closeAll();
								},200)
								if (d.code == "BUS0000") {
									// if (s.editOff) {//编辑
									// 	getAccountInfo();
									// }else{
									// 	//s.accountList.push(account_data)
									// }
									getAccountInfo();
									window.localStorage.setItem('storage_account', Math.random());
									$timeout(function(){
										layer.msg(s.editOff?'修改成功！':'添加成功！', {time:1500});
									},200)
									
									$timeout(function(){
										$scope.show = false;
									},1500)
									
								}else{
									$timeout(function(){
										layer.msg(d.msg, {time:1500});
									},200)
									
								}
								$($timeBtn).html('获取验证码').removeClass('disabled');
								clearInterval($timeBtn.Interval);
								$timeBtn.time = 60;
								$scope.$apply();
							},
							error: function(e){

								alert('失败！')
							}
						})
					}).fail(function(){
						//alert('失败');
					})
			}

			//返回
			$scope.backP = function(){
				$scope.show=false;
				$scope.reviseData=[];
				getAccountInfo();
			}
		}).fail(function(){
			layer.msg('您还未登录！', {icon: 5,shade:[0.1, '#333']});
			setTimeout(function(){
				window.location.href = '/page/reg/login.html';
			},2000)
		})
	}]).
	//安全中心
	controller('account_safe',['$scope','$location','$routeParams','$timeout','$http',function($scope,$location,$routeParams,$timeout,$http){
		if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
		LOAD.getUserInfo.done(function(d){
			$scope.pageLoadingFn();
		})
		
		//var url = LOAD.getUrlParams(window.location.href,'?');
		var url = $location.$$search;
		if (url.id) {
			
			//修改按钮跳转进来处理
			var obj = $('#'+url.id);
			obj.find('.safe_revise').show();
			obj.find('.revise_btn').hide();
			$('body,html').animate({scrollTop:$('.user_content_view').offset().top}); 
			$('a[href="#account/safe"]').parent().click();
		};
		$('.safe_info_ul').on('click','.revise_btn',function(){
			// if ($(this).parents('li').index()==2) {
			// 	layer.msg('抱歉，该功能暂未开放！', {tips: [2, '#f62d13']});
			// 	return;
			// };

			var parent = $(this).parent();
			parent.parent().siblings('li').find('.safe_revise').slideUp();
			parent.siblings('.safe_revise').slideToggle();

			window.location.hash = $location.$$path;
			$('body,html').animate({scrollTop:$('.user_content_view').offset().top},400); 

		
			$.placeholder( parent.siblings().find('input') );//ie专用

		}).on('click','.cancel_btn',function(){
			$(this).parents('.safe_revise').slideUp();
			window.location.hash = $location.$$path;
			$('body,html').animate({scrollTop:0}); 
		})

		 
		//获取身份实名信息
		$scope.getUserIdentityInfo();
		$scope.safe = {
			//修改密码
			revisePassword: function(){
				var passReg = /[^0-9a-zA-Z_]/g; 
				if (!$scope.usedPass) {
					layer.tips('请输入旧密码', $('#usedPass'), {tips: [2, '#f62d13']});return;
				}else if(passReg.test($scope.newPass)){
					layer.tips('密码不能包含特殊字符', $('#newPass'), {tips: [2, '#f62d13']});return;
				}else if($scope.newPass.length<6||$scope.newPass.length>20){
					layer.tips('密码长度为6-20个字符', $('#newPass'), {tips: [2, '#f62d13']});return;
				}else if(!$scope.confirmPass){
					layer.tips('请输入确认密码', $('#confirmPass'), {tips: [2, '#f62d13']});return;
				}else if($scope.newPass!=$scope.confirmPass){
					layer.tips('新密码与确认密码不一致', $('#confirmPass'), {tips: [2, '#f62d13']});return;
				}

				LOAD.getUserInfo.done(function(d){
					var d = d.data;
					req.jsonp({
						url:base_url + "/customer/updateCustomerPwd.do",
						data: { name: d.name , password: $scope.usedPass, newPassword: $scope.confirmPass, token: token},
						success: function(d){
							if (d.code == 'BUS0000') {
							   layer.msg('密码修改成功！', {icon: 6,shade:[0.1, '#333'],time:1000});
							   setTimeout(function(){
							   		$('.cancel_btn').parents('.safe_revise').slideUp();
							   		setTimeout(function(){
							   			$scope.usedPass = '';
								   		$scope.newPass = '';
								   		$scope.confirmPass = '';
								   		$scope.$apply();
							   		},1000)
							   },1200)
				        	}else{
				        		layer.msg(d.msg);
				        	}
						},
						error: function(e){
							//失败
						}
					})
				}).fail(signOut)
			},
			//绑定手机
			bangdingPhone: function(i){
				//i为1是绑定手机
				if (i==1) {
					var reg = /^1([3,5,8]\d|4[5,7])\d{8}$/g;
					if (!reg.test($scope.newPhone)) {
						layer.tips('您输入的手机号格式不正确', $('#phone'), {tips: [2, '#f62d13']});return;
					};
				};

				LOAD.getUserInfo.done(function(d){
					var codeId = (i==0?'primaryValidCode':'validCode');
					var phone = (i==0?d.data.phone:$scope.newPhone);

					LOAD.sendPhoneCode(codeId,phone).done(function(){
			   			 if (i==1) {
				   			 req.jsonp({
								url: base_url + "/customer/phoneBinding.do",
								data: { phone: $scope.newPhone, sn: d.data.sn, token: token},
								success: function(d){
									layer.closeAll();  
						        	if (d.code == 'BUS0000') {
						        		
						        		layer.msg('手机号修改成功！', {icon: 6,shade:[0.1, '#333']});
						        		setTimeout(function(){//修改完成需要重新登录
						        			window.localStorage.removeItem("token");
											window.localStorage.removeItem("log");
											window.location.href = '/page/reg/login.html';
						        		},2000)
							        	
						        	}else{
						        		layer.msg(d.msg, {icon: 5,shade:[0.1, '#333']});
						        	}
								},
								error: function(e){
									layer.closeAll();  
									layer.msg('服务器繁忙！', {icon: 5,shade:[0.1, '#333']});
								}
							})
			   			}else{
			   				$scope.bangdingPhoneUl = true;
			   				if (!$scope.$$phase) $scope.$apply();
			   			}
					//alert('成功');
					}).fail(function(){
						//alert('失败');
					})
				}).fail(signOut)
			},
			//获取手机验证码
			get_phone_code: function($event,i){
				// if (time!==60) return;
				var reg = /^1([3,5,8]\d|4[5,7])\d{8}$/g;
				$event.target.time = !$event.target.time ? 60 : $event.target.time;

				if (i==1) {
					if (!$scope.newPhone || !reg.test($scope.newPhone)) {
						layer.tips('您输入的手机号格式不正确', $('#phone'), {tips: [2, '#f62d13']});return;
					};
				};

				if ($event.target.time!==60) return;

				LOAD.getUserInfo.done(function(d){
					var data = {};
					if (i==0) {//第一步发送已绑定的手机号
						data = {
							phone : d.data.phone,
							captcha: 'BUST000003'
						}
					}else{//第二步发送新绑定的手机号
						data = {
							phone : $scope.newPhone,
							captcha: 'BUST000003',
							event: "PB" //这个参数判断手机号是否存在
						}
					}
					LOAD.countTime($event.target);//验证码倒计时
					req.jsonp({
						url:base_url + "/customer/sendPhoneVerificationCode.do",
						data: data,
						success: function(d){
							if (d.code != "BUS0000") {
								layer.msg(d.msg, {icon: 5,shade:[0.1, '#333']});
								LOAD.countTime($event.target,true);//手机发送频繁 true为停止倒计时
							}
						},
						error: function(e){
							layer.msg('服务器繁忙，手机发送失败！', {icon: 5,shade:[0.1, '#333']});
							$($event.target).html('获取验证码').removeClass('disabled');
							clearInterval($event.target.Interval);
							time = 60;
						}
					})
				}).fail(signOut)

			},
			//判定邮箱
			bindingEmail: function(){

			},
			get_email_code: function(){

			},
			bindingCards: function(){
				var $frontPhotoUrl = $('#frontPhotoUrl');
				var $backPhotoUrl = $('#backPhotoUrl');
				var cardsReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;  
				var nameReg = /^[\u4e00-\u9fa5]{2,10}$/;
				var cardsName = $('#cardsName');
				var cardsCode = $('#cardsCode');

				if (!nameReg.test(cardsName.val())) {
					layer.tips('请输入真实姓名', cardsName, {tips: [2, '#f62d13']});return;
				}else if(!cardsReg.test(cardsCode.val())){
					layer.tips('身份证号码有误', cardsCode, {tips: [2, '#f62d13']});return;
				}else if(!$frontPhotoUrl.data('url')){
					layer.tips('请上传正面身份证照片', $frontPhotoUrl, {tips: [1, '#f62d13']});return;
				}else if(!$backPhotoUrl.data('url')){
					layer.tips('请上传背面身份证照片', $backPhotoUrl, {tips: [1, '#f62d13']});return;
				}

				LOAD.getUserInfo.done(function(d){
					var d = d.data;
					var data,url;
					if ($scope.status=='2') {//审核未通过需修改
						url = '/customer/updateCustomerCards.do'
						data = { 
								frontPhotoUrl: $frontPhotoUrl.data('url'),//正面照片
								backPhotoUrl: $backPhotoUrl.data('url'),//背面照片
								idCard: cardsCode.val(),//身份证号
								name: cardsName.val(),//真实姓名
								sn: $scope.cardData.sn,
								status: '0',
								token: token
							}
					}else{//添加
						url = '/customer/cardsBinding.do'
						data = { 
								frontPhotoUrl: $frontPhotoUrl.data('url'),//正面照片
								backPhotoUrl: $backPhotoUrl.data('url'),//背面照片
								idCard: cardsCode.val(),//身份证号
								name: cardsName.val(),//真实姓名
								cSn: d.sn,
								token: token
							}
					}
					req.jsonp({
						url:base_url + url,
						data: data,
						success: function(d){
							if (d.code == "BUS0000") {
								layer.msg('提交认证成功，等待工作人员审核！', {icon: 6,shade:[0.1, '#333'],time:3000});
								setTimeout(function(){
									window.location.reload() 
								},2000)
							}else{
								layer.msg(d.msg, {icon: 5,shade:[0.1, '#333']});
							}
						},
						error: function(e){
							layer.msg('服务器繁忙！', {icon: 5,shade:[0.1, '#333']});
						}
					})
				}).fail(signOut)
			},
			// 上传身份证照片
			uploadCards: function(formId,$event){

				   var _self = $event.target,
 					   _this = $(_self),
 					opts = $.extend({
 						Img: $(_self).siblings('img'),
 						Width: 300,
 						Height: 150,
 						ImgType: ["jpeg", "jpg", "bmp", "png"]
 					}, opts || {});
 					_self.getObjectURL = function(file) {
 						var url = null;
 						if (window.createObjectURL != undefined) {
 							url = window.createObjectURL(file)
 						} else if (window.URL != undefined) {
 							url = window.URL.createObjectURL(file)
 						} else if (window.webkitURL != undefined) {
 							url = window.webkitURL.createObjectURL(file)
 						}
 						return url
 					};

 					_this.off().change(function() {
 						
 						if (this.value) {
 							if (!RegExp("\.(" + opts.ImgType.join("|") + ")$", "i").test(this.value.toLowerCase())) {
 								// layer.msg("选择文件错误,图片类型必须是" + opts.ImgType.join("，") + "中的一种",{time:2000});
 								layer.msg("不支持该文件上传！", {
 									time: 2000
 								});
 								this.value = "";
 								return false
 							}

 							try {
 								if ((this.files[0].size / 1024).toFixed(2) >= 5000) {
 									layer.msg("上传头像不能超过5M！", {
 										time: 2500
 									});
 									return;
 								};
 							} catch (e) {}


	 						layer.msg('请稍后，上传中...', {icon: 16,shade:[0.1, '#333'],time:200000});
	 						req.form({
								//url:"http://192.168.103.38:8080/b2b.admin-3.0.0/file/filesUpload.do",
								url: base_url + "/file/filesUpload.do?token="+token+"&space=customer&method=post",
								formId: formId,
								type: 'post',
								success: function(data){
									if (data.state=='SUCCESS') {
										var Img = new Image();
										Img.src = data.url;
										Img.onload = function(){
											console.log(data.url);
											opts.Img.attr('src',data.url).css({'opacity':1,width:'100%',height:'100%'});
											_this.data('url',data.url);
											layer.closeAll();
										}
									}else{
										layer.msg(data.state, {time:2000});
									}
								},
								error: function(data){
									console.log('错误：'+data)
									layer.closeAll();
									layer.msg('服务器无响应，上传失败！', {icon: 5,shade:[0.1, '#333']});
								}
							});
 						}
 					})
			}
		}
	}]).
	//消息订阅
	controller('account_subscribe',['$scope','$location','$routeParams','$timeout','$http','$compile',function($scope,$location,$routeParams,$timeout,$http,$compile){
		if ($scope.pageLoading) layer.load(0,{shade:[0.1, '#fff']});
		LOAD.getUserInfo.done(function(d){
			var d = d.data;
			$scope.userData = d;
			
			if (d.ckPhone==1) {//手机已验证
				$scope.phone = d.phone.substr(0,3)+"****"+d.phone.substr(7);
			};
			if (d.ckEmail==1) {//邮箱已验证
				$scope.email = "****"+d.email.substr(4,d.email.length);
			}
			

			$scope.msgData = [
				{'typeId':'01','name':'订单状态','PUSH001':true,'PUSH002':true,'PUSH003':true,'PUSH004':true},
				{'typeId':'02','name':'汇款提醒','PUSH001':true,'PUSH002':true,'PUSH003':true,'PUSH004':true},
				{'typeId':'03','name':'淘绿活动提醒','PUSH001':false,'PUSH002':false,'PUSH003':false,'PUSH004':false},
				{'typeId':'04','name':'最新资讯提醒','PUSH001':false,'PUSH002':false,'PUSH003':false,'PUSH004':false},
				{'typeId':'05','name':'最新报价提醒','PUSH001':false,'PUSH002':false,'PUSH003':false,'PUSH004':false}
			]
			

			req.jsonp({
				url:base_url_admin +"/msgSet/getUserSet",
				data: { 
					token: token
				},
				success: function(d){
					console.log(d)
					if (d.code == "BUS0000") {
						if (d.data.msgtype) {
							$scope.msgData = eval(d.data.msgtype);
							$scope.pageLoadingFn();
						}
					};

					if (!$scope.$$phase) $scope.$apply();
					setTimeout(function(){
			    		layer.closeAll();
			    	},200)
				},
				error: function(e){
					//失败
				}
			})

			$scope.modifyUserSet = function(){
				
				req.jsonp({
					url:base_url_admin + "/msgSet/modifyUserSet.do",
					data: { 
						msgtype: JSON.stringify($scope.msgData),
						token: token
					},
					success: function(d){
						layer.msg('操作成功！',{time:1500});
					},
					error: function(e){
						layer.msg('操作失败！',{time:1500});
					}
				})
			}

			if (!$scope.$$phase) $scope.$apply();

		})
	}])	
	.run(['$rootScope', '$http', '$timeout', '$filter', '$document', '$templateCache', '$location','$compile', function($rootScope, $http, $timeout, $filter, $Document, $templateCache, $location,$compile) {
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
		$scope.pageLoadingFn = function(){
			$scope.pageLoading = true;
		}

		$scope.getUserIdentityInfo = function(){
			//获取身份实名信息
			LOAD.getUserInfo.done(function(d){
				var data = d.data;
				$scope.phone = data.phone.substr(0,3)+"****"+data.phone.substr(7);
				req.jsonp({
					url:base_url + "/customer/getCustomerCards.do",
					data: { cSn: data.sn , token: token},
					success: function(d){
						if (d.code == 'BUS0000') {
						    var d = d.data;
						    $scope.status = d.status; //0是还未审核 1审核通过 2未通过
						    if ($scope.status=='1') {
						    	$scope.idCard = d.idCard.substr(0,3)+"***********"+d.idCard.substr(14,18);
						    };
						    if ($scope.status=='2') {
						    	$scope.cardData = d;
						    }
			        	}else{
			        		$scope.status = '-1';//还未上传身份证信息
			        	}

			        	//设置安全等级
					    if ( data.ckEmail=='1'&&$scope.status=='1') {//邮箱身份证已验证
					    	$('.level_div span').addClass('s100').siblings('font').html('高');
					    	$('.level_p span').html('帐户安全等级高，请继续保持哦!');
					    }else if(data.ckEmail=='1'||$scope.status=='1'){
					    	$('.level_div span').addClass('s75');
					    }else{
					    	$('.level_div span').addClass('s50');
					    }

			        	if (!$scope.$$phase) $scope.$apply();

			        	setTimeout(function(){
			        		layer.closeAll();
			        	},200)

					},
					error: function(e){
						//失败
					}
				});
				
			}).fail(signOut)
		}
		$scope.getUserIdentityInfo();

		LOAD.getUserInfo.done(function(d){
        	$('#user_image').attr('src',d.data.imageUrl?d.data.imageUrl:require('images/user/user_image.png'));
        	setTimeout(function(){
        		layer.closeAll();
        	},200)
		}).fail(signOut);
			
	}])

	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['tlUser']);
	});

})