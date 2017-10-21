require('commons'); 
require('lessDir/reg/back_password.less');
define('back_password',['jquery','script/index/load_init','script/utils/req','script/utils/layer'],function($, LOAD, req ,layer){
	$(".email").click(function(e){
		e.preventDefault();
		$(".according_iphone").hide();
		$(".according_email").show();

	});
	$(".iphone").click(function(even){
		even.preventDefault();
		$(".according_iphone").show();
		$(".according_email").hide();
	});

    var _name = $('#name');
    var _phone = $('#phone');
    var token = '';

//          var _code = $('#code');
	// _code.click(function(event) {
	// 	_t = 'v'+Math.random().toString().substring(2);
	// 	$(this).attr('src',base_url+'/verify/getVerifyCodeImg.do?t='+_t);
	// }).attr('src',base_url+'/verify/getVerifyCodeImg.do?t='+_t);

	var _ver = $('.verification_input input');
	var _t = 't'+Math.random().toString().substring(2);
	var _code; 
	var getCode = function(){
		_t = 't'+Math.random().toString().substring(2);
		req.jsonp({
			url:base_url + "/verify/getVerifyCode.do",
			data:{
				t: _t
			},
			success: function(d){
				if (d.code=="BUS0000") {
					_ver.siblings('.code').find('i').html(d.data);
					_code = d.data;
				};
			}
		})
	 }
	_ver.siblings('.code').click(function(event) {
		getCode()
	}).on('mousedown',function(){
		return false;
	}).trigger('click');


	$('#verify_account').click(function(event) {
		
		if (!_name.val()) {
			layer.tips('请输入账号', _name, {tips: [2, '#f62d13'] });return;
		};
		req.jsonp({
			//url:base_url + "/customer/login",
			url:base_url + "/customer/customerIsExis",
			data: {name: _name.val() ,captcha: _t+_ver.val().toUpperCase()},
			success: function(d){
			
				if (d.code == 'BUS0000') {//成功
					$('#validation_identity').show().siblings('div').hide();
	        	}else{
	    			if (d.msg.indexOf('验证码')>=0) {
	    				layer.tips(d.msg, _ver, {tips: [2, '#f62d13'] });
	    				// _code.trigger("click");
	    			}else{
	    				layer.tips('账号不存在', _name, {tips: [2, '#f62d13'] });
	    			}
	        	}
			},
			error: function(e){
				
			}
		})
	});
	//手机验证码发送
	$('#validation_code_phone').click(function(event) {
		
		var This = this;
		var reg = /^1([3,5,7,8]\d|4[5,7])\d{8}$/g;
		if (!reg.test(_phone.val())) {
			layer.tips('手机号码格式有误', _phone, {tips: [1, '#f62d13'] });return;
		};
		This.time = !This.time ? 60 : This.time;
        if (This.time!=60) return;

		LOAD.countTime(This);//验证码倒计时
	    req.jsonp({
			url:base_url + "/customer/forgetPasswordSendPhoneVerificationCode.do",
			data: {name: _name.val(), phone: _phone.val(),captcha: 'BUST000002'},
			success: function(d){
				if (d.code != "BUS0000") {
					layer.msg(d.msg, {icon: 5,shade:[0.1, '#333']});
					LOAD.countTime(This,true);//手机发送频繁 true为停止倒计时
				}else{
					
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
	//验证验证码
	$('#verify_code').click(function(event) {

		var reg = /^1([3,5,7,8]\d|4[5,7])\d{8}$/g;
		if (!reg.test(_phone.val())) {
			layer.tips('手机号码格式有误', _phone, {tips: [1, '#f62d13'] });return;
		};

		// layer.msg('请稍后，加载中...', {icon: 16,shade:[0.1, '#333'],time:100000});
   		LOAD.sendPhoneCode('phone_code',_phone.val(),'backPass').done(function(d){
   			console.log(d)
   			token = d.data;
   			$('#panel_digital').show().siblings('div').hide();
		}).fail(function(){
			//alert('失败');
		})
	});
	//密码修改
	$('#revise_pass').click(function(event) {
		var _newPass = $('#newPass');
		var _conPass = $('#conPass');
		var passReg = /[^0-9a-zA-Z_]/g; 

		if (!_newPass.val()) {
			layer.tips('密码不能为空', _newPass, {tips: [2, '#f62d13']});return;
		}else if(passReg.test(_newPass.val())){
			layer.tips('密码不能包含特殊字符', _newPass, {tips: [2, '#f62d13']});return;
		}else if(_newPass.val().length<6||_newPass.val().length>20){
			layer.tips('密码长度为6-20个字符', _newPass, {tips: [2, '#f62d13']});return;
		}else if (_newPass.val()!=_conPass.val()){
  			layer.tips('两次输入的密码不一致', _conPass, {tips: [2, '#f62d13']});return;
  		}
		var pass = {
			customer: {
				phone: _phone.val(),
				token: token
			},
			customerPwd: {
				password: _conPass.val()
			}
		}
		req.jsonp({
			url: base_url + "/customer/forgetPassword.do",
			data: { reData: JSON.stringify( pass ) },
			success: function(d){
	        	if (d.code == 'BUS0000') {
	        		$('#all_electrical').show().siblings('div').hide();
	        		var num = 5;
	        		var _time = $('#time');
	        		setInterval(function(){
	        			num--
	        			if (num==1) {
	        				window.location.href = '/page/reg/login.html';
	        			};
	        			_time.html(num)
	        		},1000)
	        	}
			},
			error: function(e){
				layer.msg('服务器繁忙！', {icon: 5,shade:[0.1, '#333']});
			}
		})
	});

})