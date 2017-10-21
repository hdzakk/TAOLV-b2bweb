define(['jquery','script/index/load_init','script/utils/req','script/utils/layer'],function($, LOAD , req, layer){
   
	var aInpt = $('#name,#password,#phone,#passwords,#validCode');
	var reData = {
			customer: {
				phone: '13878185525',
				source: '网站'
			},
			customerPwd: {
				name: '465339482',
				password: 'aa123'
			}
		}

	aInpt.blur(function() {

	        switch (this.id) {
		        case "name":
		          inputVerification.name($(this));
		          break;
		        case "password":
		          inputVerification.password($(this));
		          break;
		        case "passwords":
		          inputVerification.passwords($(this));
		          break;
		        case "phone":
		          inputVerification.phone($(this));
		          break;
		        case "validCode":
		          inputVerification.validCode($(this));
		          break;
	        }
      });
	
	var inputVerification = {
		name: function(obj){
			var reg = /[@#!！\$%\^&\*\s]+/g;
			var mail =  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			var val = $.trim (obj.val());
			var numReg = /^\d+$/g;
			var phoneReg = /^1([3,5,7,8]\d|4[5,7])\d{8}$/g;
			obj.data('s',false)
			if (val == '') {
				layer.tips('请输入用户名', obj, {tips: [2, '#f62d13']});
				
			 	return;
			}else if(numReg.test(val)){
				if (!phoneReg.test(val)) {
					layer.tips('用户名不能全部都是数字', obj, {tips: [2, '#f62d13']});
					
					return;
				};
			}else if(val.length<6){
				layer.tips('用户名长度不能小于6位', obj, {tips: [2, '#f62d13']});
				
			 	return;
			}else if(reg.test(val)){
				if (!mail.test(val)) {
					layer.tips('用户名不能包含非法字符', obj, {tips: [2, '#f62d13']});
					
					return;
				};
			}
			//验证账号是否存在
			req.jsonp({
				url:base_url + "/customer/customerIsExisNotToken.do",
				data: {name: val },
				success: function(d){
					if (d.code == "BUS0000") {
						layer.tips('账号已存在！', obj, {tips: [2, '#f62d13']});
						
					}else{
						obj.data('s',true);
						reData.customerPwd.name = val;
					}
				},
				error: function(e){
					layer.closeAll();  
					layer.msg('服务器繁忙，请稍后再试！', {icon: 5,shade:[0.1, '#333']});
				}
			})
			
		},
		password: function(obj){
			var val = obj.val();
			var passReg = /[^0-9a-zA-Z_]/g; 
			// if (!$('#name').data('s')) return;
			obj.data('s',false);
			if (val == '') {
				layer.tips('密码不能为空', obj, {tips: [2, '#f62d13']});
				
			 	obj.data('s',false)
			 	return;
			}else if(passReg.test(val)){
				layer.tips('密码不能包含特殊字符', obj, {tips: [2, '#f62d13']});
				
			 	
			 	return;
			 }else if(val.length<6||val.length>20){
				layer.tips('密码长度为6-20个字符', obj, {tips: [2, '#f62d13']});
				
			 	return;
			};
			obj.data('s',true);
		},
		passwords: function(obj){
			var val1 = obj.val() , val2 = $('#password').val() ;
      		if (val1!=val2||val1==''){
      			layer.tips('密码不一致', obj, {tips: [2, '#f62d13']});
      			obj.data('s',false);
      			
			 	return;
      		}
      		obj.data('s',true);
      		reData.customerPwd.password = val2;
		},
		phone: function(obj){
			var val = obj.val();
			var reg = /^1([3,5,7,8]\d|4[5,7])\d{8}$/g;

			if (val == '') {
				layer.tips('请输入手机号码', obj, {tips: [1, '#f62d13']});
			 	obj.data('s',false)
			 	
			 	return;
			};

			if (!reg.test(val)) {
				layer.tips('您输入的手机号格式不正确', obj, {tips: [1, '#f62d13']});
			 	obj.data('s',false)
			 	
			 	return;
			};
			obj.data('s',true);
			reData.customer.phone = val;
		},
		validCode: function(obj){
			var val = obj.val();
			obj.data('s',false)
			if (val == '') {
				layer.tips('请输入验证码', obj, {tips: [2, '#f62d13'] });
			 	return;
			};
			obj.data('s',true)
		}
	}

	//手机验证
	$('.verification_code').click(function(event) {
		var codeObj = $(this).siblings('input').blur();
		var This = this;
		var _this = $(This);
		This.time = !This.time ? 60 : This.time;
		if (!codeObj.data('s') || This.time!=60) return;

		LOAD.countTime(This);//验证码倒计时
	    req.jsonp({
			url:base_url + "/customer/sendPhoneVerificationCode.do",
			data: {phone: codeObj.val() ,captcha: 'BUST000001',"event":"PB"},//event判断该手机号是否存在
			success: function(d){
				if (d.code != "BUS0000") {
					layer.msg(d.msg, {icon: 5,shade:[0.1, '#333']});
					LOAD.countTime(This,true);//手机发送频繁 true为停止倒计时
				}
			},
			error: function(e){
				layer.closeAll();  
				layer.msg('服务器繁忙，手机发送失败！', {icon: 5,shade:[0.1, '#333']});
				_this.html('获取验证码').removeClass('disabled');
				clearInterval(Interval);
				time = 60;
			}
		})

	});
	
	//提交注册信息
	var $registered_btn = $('.registered_btn');
	$registered_btn.click(function(event) {

		
		for (var i = 0; i < aInpt.length; i++) {
			if (!aInpt.eq(i).data('s')) {
				aInpt.eq(i).blur();
				return;
			};
		};

		if (!$('.agreed').is(':checked')) {
			layer.tips('请勾选 已阅读并同意', $('.method'), {tips: [2, '#f62d13']});
			return;
		};
   		//layer.load(0);
   		layer.msg('请稍后，加载中...', {icon: 16,shade:[0.1, '#333'],time:100000});
   		LOAD.sendPhoneCode('validCode',reData.customer.phone).done(function(){
   			//提交注册
   			 req.jsonp({
				url: base_url + "/customer/register.do",
				data: { reData: JSON.stringify( reData ) },
				success: function(d){
					layer.closeAll();  
		        	if (d.code == 'BUS0000') {
		        		layer.msg('恭喜您，注册成功！即将跳转...', {icon: 6,shade:[0.1, '#333']});
		        		window.localStorage.setItem("www_token", d.data.token );
		        		window.localStorage.setItem("log", JSON.stringify(d) );
		        		setTimeout(function(){
		        			window.location.href = '/page/user';
		        		},2000)
		        	}else{
		        		layer.msg(d.msg, {icon: 5,shade:[0.1, '#333']});
		        	}
				},
				error: function(e){
					layer.closeAll();  
					layer.msg('服务器繁忙，请稍后注册！', {icon: 5,shade:[0.1, '#333']});
				}
			})
			//alert('成功');
		}).fail(function(){
			//alert('失败');
		})
	});
	$(document).keydown(function(event) {
		if (!aInpt.is(':focus')) return;
		if (event.keyCode == 13) $registered_btn.trigger("click");
	});
	
});