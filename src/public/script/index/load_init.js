define(['jquery','script/utils/req','script/utils/layer'],function($,req,layer){
	$.msie = (navigator.userAgent.indexOf('MSIE') >= 0) && (navigator.userAgent.indexOf('Opera') < 0);
	document.body.scrollTop = 0;
	$.cookie = function(name, value, options){
	       if (typeof value != 'undefined') { // name and value given, set cookie
				options = options || {};
				if (value === null) {
					value = '';
					options.expires = -1;
				}
				var expires = '';
				if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
					var date;
					if (typeof options.expires == 'number') {
						date = new Date();
						date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
					} else {
						date = options.expires;
					}
					expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
				}
				var path = options.path ? '; path=' + options.path: '';
				var domain = options.domain ? '; domain=' + options.domain: '';
				var secure = options.secure ? '; secure': '';
				document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
			} else { // only name given, get cookie
				var cookieValue = null;
				if (document.cookie && document.cookie != '') {
					var cookies = document.cookie.split(';');
					for (var i = 0; i < cookies.length; i++) {
						var cookie = cookies[i].replace(/(^[ ]+)|([ ]+$)/ig,'');
						// Does this cookie string begin with the name we want?
						if (cookie.substring(0, name.length + 1) == (name + '=')) {
							cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
							break;
						}
					}
				}
				return cookieValue;
			}
		}
	if (!Array.prototype.indexOf){//ie8下没有indexof方法 
		  Array.prototype.indexOf = function(elt , from)
		  {
		    var len = this.length >>> 0;
		    var from = Number(arguments[1]) || 0;
		    from = (from < 0)
		         ? Math.ceil(from)
		         : Math.floor(from);
		    if (from < 0)
		      from += len;
		    for (; from < len; from++)
		    {
		      if (from in this &&
		          this[from] === elt)
		        return from;
		    }
		    return -1;
		  };
	}
	//没登录时的提示
	window.signOut = function(d){
		setTimeout(function(){
			if (d) {
				layer.msg('登录已超时，请重新登录！', {icon: 5,shade:[0.1, '#333'],time:2500});
			}else{
				layer.msg('您还未登录，请先登录！', {icon: 5,shade:[0.1, '#333'],time:2500});
			}
			
			window.localStorage.removeItem("www_token");
			window.localStorage.removeItem("log");
			setTimeout(function(){
				window.location.href = '/page/reg/login.html?url='+window.location.href;
			},2000)
		},300)
   	}
   	window.errorMsg = function(){
   		layer.closeAll();
   		layer.msg('服务器繁忙，请稍后再试！', {icon: 5,shade:[0.1, '#333'],time:100000});
   	}
   	window.getStorageToken = function(token){//token
		return window.localStorage.getItem("www_token")
	}
	//登录框
	var $login = $(`<div id='login'>
		 <div class='pop_sign'>
		 	 <div class='sign_head'>
		 	 	<span class='fl'>您尚未登录</span>
		 	 	<i class='fr close iconfont'>&#xe652;</i>
		 	 </div>
		 	 <div class='sign_body'>
		 	 	<p class='login_title'>
		 	 		<b class='fl'>登录</b>
		 	 		<span class='fr'>还没有账号？<a target='_blank' href='/page/reg/registered.html'>立即注册</a></span>
		 	 	</p>
		 	 	<div class='account_input'>
		 	 		<input class='text' type='text' placeholder='用户名/手机号'>
		 	 	</div>
		 	 	<div class='password_input'>
		 	 		<input class='text' type='password' placeholder='密码'>
		 	 	</div>
		 	 	<div class='verification_input'>
		 	 		<input class='text' type='text' placeholder='验证码'>
		 	 		<span class='code'>
		 	 			<!--<img src='/images/blank.gif' height='35' width='109'>-->
		 	 			<i title='点击刷新' class='showCode'></i>
		 	 		</span>
		 	 	</div>
		 	 	<div class='remember_account'>
		 	 		<label class='fl'>
		 	 			<input type='checkbox'>
		 	 			记住账号
		 	 		</label>
		 	 		<a class='fr' href='/page/reg/back_password.html'>忘记密码？</a>
		 	 	</div>
		 	 	<div class='submit_btn'>
		 	 		 登 录
		 	 	</div>
		 	 	<!--<div class='third_login'>
		 	 		<span>使用第三方账号登录：</span>
		 	 		<a href='javascript:;' class='iconfont xl'></a>
		 	 		<a href='javascript:;' class='iconfont qq'></a>
		 	 		<a href='javascript:;' class='iconfont wx'></a>
		 	 	</div>-->
		 	 </div>
		 </div>
	</div>`);
	//客服
	var $kefu = $(`<div id='kefu'>
		<ul class='kf_ul'>
			<li class='go_top iconfont'>
				&#xe67e;
			</li>
			<li class='tel'>
				<i class='iconfont'>&#xe603;</i><br/>
				电话咨询
				<div class='show_box'>
					<p class='kf_tel'>
						客服热线<br/>
						<span>400-188-5167</span>
					</p>
					<p class='kf_time'>
						工作时间<br/>
						<span>周一到周六 9:00-18：00</span>
					</p>
				</div>
			</li>
			<li class='qq' id='kfQQ1'>
				<i class='iconfont'>&#xe648;</i><br/>
				在线咨询
			</li>
			<!-- <li>
				<i class='iconfont'>&#xe661;</i><br/>
				微博
			</li> -->
			<li class='code iconfont'>
				&#xe6e6;
				<div class='show_box'>
					<img src='${require('images/fwh_code.jpg')}' height='129' width='129'>
					<p>扫一扫关注微信</p>
				</div>
			</li>
			<li class='feedback' id='shangqiao'>
				<i class='iconfont'>&#xe624;</i><br/>
				在线反馈
			</li>
		</ul>
	</div>`);
	//弹层

	var $body = $('body').append(window.location.href.search(/(user|special)/)==-1?$kefu:'');
    var $pop_sign = $login.find('.pop_sign');
    $.extend({
		tab: function(){
			// $('.nav_tabs').children()
			$('[data-toggle=tab]').click(function(event) {
				var _id = $(this).attr('href');
				$(_id).show().siblings('[data-toggle=content]').hide();
				$(this).addClass('cur active').siblings('[data-toggle=tab]').removeClass('cur active');
				return false;
			});
		},
		//生日日期选择
		datePicker: function (options) {
                var defaults = {
                    YearSelector: "#sel_year",
                    MonthSelector: "#sel_month",
                    DaySelector: "#sel_day",
                    FirstText: "--",
                    FirstValue: 0
                };
                var opts = $.extend({}, defaults, options);
                var $YearSelector = $(opts.YearSelector);
                var $MonthSelector = $(opts.MonthSelector);
                var $DaySelector = $(opts.DaySelector);
                var FirstText = opts.FirstText;
                var FirstValue = opts.FirstValue;

                // 初始化
                // var str = "<option value=\"" + FirstValue + "\">" + FirstText + "</option>";
                // $YearSelector.html(str);
                // $MonthSelector.html(str);
                // $DaySelector.html(str);

                // 年份列表
                var yearNow = new Date().getFullYear();
    			var yearSel = $YearSelector.attr("rel");
    			$YearSelector.append("<option value='0'>请选择</option>");
                for (var i = yearNow; i >= 1900; i--) {
    				var sed = yearSel==i?"selected":"";
    				var yearStr = "<option value=\"" + i + "\" " + sed+">" + i + "</option>";
                    $YearSelector.append(yearStr);
                }

                // 月份列表
                $MonthSelector.append("<option value='0'>请选择</option>");
    			var monthSel = $MonthSelector.attr("rel");
                for (var i = 1; i <= 12; i++) {
    				var sed = monthSel==i?"selected":"";
                    var monthStr = "<option value=\"" + i + "\" "+sed+">" + (i<10?'0'+i:i) + "</option>";
                    $MonthSelector.append(monthStr);
                }

                // 日列表(仅当选择了年月)
               $DaySelector.append("<option value='0'>请选择</option>");
                function BuildDay() {
                    if ($YearSelector.val() == 0 || $MonthSelector.val() == 0) {
                        // 未选择年份或者月份
                        //$DaySelector.html(str);
                    } else {
                        //$DaySelector.html(str);
                        var year = parseInt($YearSelector.val());
                        var month = parseInt($MonthSelector.val());
                        var dayCount = 0;
                        switch (month) {
                            case 1:
                            case 3:
                            case 5:
                            case 7:
                            case 8:
                            case 10:
                            case 12:
                                dayCount = 31;
                                break;
                            case 4:
                            case 6:
                            case 9:
                            case 11:
                                dayCount = 30;
                                break;
                            case 2:
                                dayCount = 28;
                                if ((year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0)) {
                                    dayCount = 29;
                                }
                                break;
                            default:
                                break;
                        }
    					
    					var daySel = $DaySelector.attr("rel");
                        for (var i = 1; i <= dayCount; i++) {
    						var sed = daySel==i?"selected":"";
    						var dayStr = "<option value=\"" + i + "\" "+sed+">" + (i<10?'0'+i:i) + "</option>";
                            $DaySelector.append(dayStr);
                        }
                    }
                }
                $MonthSelector.change(function () {
                    BuildDay();
                });
                $YearSelector.change(function () {
                    BuildDay();
                });
    			if($DaySelector.attr("rel")!=""){
    				BuildDay();
    			}
            },
        //地区选择
        citySelect: function(settings){
			if(settings.obj<1){return;};
			// 默认值
			settings=$.extend({
				json:{},
				prov:null,
				city:null,
				dist:null,
				nodata:null,
				required:true
			},settings);


			var box_obj=settings.obj;
			var prov_obj=box_obj.find(".prov");
			var city_obj=box_obj.find(".city");
			var dist_obj=box_obj.find(".dist");
			var prov_val=settings.prov;
			var city_val=settings.city;
			var dist_val=settings.dist;
			var select_prehtml=(settings.required) ? "" : "<option value=''>请选择</option>";
			var city_json;
			var temp_html;
			// 赋值市级函数
			var cityStart=function(){
				var prov_id=prov_obj.get(0).selectedIndex;
				if(!settings.required){
					prov_id--;
				};
				city_obj.empty().attr("disabled",true);
				dist_obj.empty().attr("disabled",true);

				if(prov_id<0||typeof(city_json.citylist[prov_id].c)=="undefined"){
					if(settings.nodata=="none"){
						city_obj.css("display","none");
						dist_obj.css("display","none");
					}else if(settings.nodata=="hidden"){
						city_obj.css("visibility","hidden");
						dist_obj.css("visibility","hidden");
					};
					return;
				};
				
				// 遍历赋值市级下拉列表
				temp_html=select_prehtml;
				$.each(city_json.citylist[prov_id].c,function(i,city){
					temp_html+="<option value='"+city.n+"'>"+city.n+"</option>";
				});
				city_obj.html(temp_html).attr("disabled",false).css({"display":"","visibility":""});
				distStart();
			};

			// 赋值地区（县）函数
			var distStart=function(){
				var prov_id=prov_obj.get(0).selectedIndex;
				var city_id=city_obj.get(0).selectedIndex;
				if(!settings.required){
					prov_id--;
					city_id--;
				};
				dist_obj.empty().attr("disabled",true);

				if(prov_id<0||city_id<0||typeof(city_json.citylist[prov_id].c[city_id].a)=="undefined"){
					if(settings.nodata=="none"){
						dist_obj.css("display","none");
					}else if(settings.nodata=="hidden"){
						dist_obj.css("visibility","hidden");
					};
					return;
				};
				
				// 遍历赋值市级下拉列表
				temp_html=select_prehtml;
				$.each(city_json.citylist[prov_id].c[city_id].a,function(i,dist){
					temp_html+="<option value='"+dist.s+"'>"+dist.s+"</option>";
				});
				dist_obj.html(temp_html).attr("disabled",false).css({"display":"","visibility":""});
			};

			var init=function(){
				// 遍历赋值省份下拉列表
				temp_html=select_prehtml;
				$.each(city_json.citylist,function(i,prov){
					temp_html+="<option value='"+prov.p+"'>"+prov.p+"</option>";
				});
				prov_obj.html(temp_html);

				// 若有传入省份与市级的值，则选中。（setTimeout为兼容IE6而设置）
				setTimeout(function(){
					if(settings.prov!=null){
						prov_obj.val(settings.prov);
						cityStart();
						setTimeout(function(){
							if(settings.city!=null){
								city_obj.val(settings.city);
								distStart();
								setTimeout(function(){
									if(settings.dist!=null){
										dist_obj.val(settings.dist);
									};
								},1);
							};
						},1);
					};
				},1);

				// 选择省份时发生事件
				prov_obj.bind("change",function(){
					cityStart();
				});

				// 选择市级时发生事件
				city_obj.bind("change",function(){
					distStart();
				});
			};

			// 设置省市json数据
			if(typeof(settings.url)=="string"){
				$.getJSON(settings.url,function(json){
					city_json=json;
					init();
				});
			}else{
				city_json=settings.json;
				init();
			};
        },
        //给input加placeholder文字提示
        placeholder: function(input){
        	var i = document.createElement('input'),
			placeholdersupport = 'placeholder' in i;
			if(!placeholdersupport){
				var $input = input ? input : $('input[placeholder]');

				$input.each(function(){
					var input = $(this);
					if (!input.is(':visible')) return;//隐藏的input不做处理
					if (input.parent().css("position") == 'static') {
						input.parent().css({'position':'relative'})
					};
					
					var text = input.attr('placeholder'),
						height = input.outerHeight(),
						width = input.outerWidth(),
						paddingLeft = parseInt(input.css('paddingLeft')) + 2,
						left = input.position().left+paddingLeft + parseInt(input.css('marginLeft')),
						top = input.position().top,
						textAlign = input.css('textAlign'),
						placeholder = $('<span class="phTips">'+text+'</span>');
						// input.removeAttr('placeholder');
					
					placeholder.css({'height':height,'line-height':height+"px",'position':'absolute', 'color': "#A9A9A9", 'font-size' : "14px",'width':width-paddingLeft,left:left,top:top,"textAlign":textAlign,"cursor":"text","background":'transparent','padding':'0','margin':'0'});
					placeholder.off().click(function(){
						input.focus();
					});
					if(input.val() != ""){
						placeholder.css({display:'none'});
					}else{
						placeholder.css({display:'inline'});
					}
					if (input.prev('.phTips').length>0) {
						input.prev('.phTips').remove();
					}
					// placeholder.insertAfter(input);
					input.before(placeholder)
					input.keyup(function(e){
						if($(this).val() != ""){
							placeholder.css({display:'none'});
						}else{
							placeholder.css({display:'inline'});
						}
					});
				});
			}
			return this;
        }
	});

	$.tab();
	$.placeholder();

	//退出登录
	$('#out_login').on('click',function(){
		window.localStorage.removeItem("www_token");
		// $.cookie('token', null, {path: '/'});
		window.localStorage.removeItem("log");
		window.location.href = '/page/reg/login.html';
	})
	//在线客服
	$('#shangqiao').click(function(){
		var url = 'http://qiao.baidu.com/v3/?module=default&controller=webim&action=index&siteid=2640319'
		,iWidth=816
		,iHeight=565 
		,iTop = (window.screen.availHeight-30-iHeight)/2
		,iLeft = (window.screen.availWidth-10-iWidth)/2
		,timestamp = new Date().getTime();
		window.open(url,"win"+ timestamp,"height="+iHeight+",width="+iWidth+",toolbar=no,location=no,status=no,menubar=no,resizable=no,alwaysRaised=yes,top="+iTop+", left="+iLeft);
	});

	var INIT = function(){}
	INIT.prototype = {
		
		common: function(){
			//头部搜索
			$('.search_tab').on('click','li:gt(0)',function(){
				var $this = $(this);
				var _txt = $this.text();
				var _sibTxt = $this.siblings('.cur').text();
				$this.siblings('.cur').text(_txt);
				$this.text(_sibTxt);
				$this.parents('.search_tab').css({'overflow':'hidden'})
			}).on('mouseover',function(){
				$(this).css({'overflow':'visible'})
			}).on('mouseout',function(){
				$(this).css({'overflow':'hidden'})
			});
			var start=1,length=5;
			$('.tl_search').on('click','a',function(){
				var find_content=$(this).siblings('input').val();
				var text = $('.txt_ul li').eq(0).text();
				if (text=='资讯') {
					window.open('/page/zixun/news_list.html?search='+encodeURI(find_content))
				}else{
					window.open('/page/search/#search='+encodeURI(find_content))
				}
			})
			// 网站导航
			
			// $('.tl_btn_nav .nav').mouseenter(function(){
			// 	if (!this.off) {
			// 		this.off = true;
					req.jsonp({
						url:base_url + "/newsType/getNewsTypeTree.do",
						data: {},
						success: function(d){
							if (d.code == 'BUS0000') {//成功
								var websiteNav = $('.websiteNav');
								websiteNav.html('');
								$.each(d.data,function(index, el) {
									var dl = $('<dl><dt>'+el.text+'</dt></dl>');
									var dd = $('<dd>');
									var aHtml = '';

									$.each(el.nodes,function(index, el) {
										var url = 'http://'+window.location.host+''+el.data.url+'?typeSn='+el.data.sn+'&code='+el.data.code+'&lm='+el.data.name;
										aHtml+='<a target="_blank" href='+url+'>'+el.text+'</a>';
										if (el.text=='每日报价') {
											$('.homeQuote').attr('href',url);
										};
									});
									dd.append(aHtml);
									dl.append(dd);
									websiteNav.append(dl);
								});
				        	}
						},
						error: function(e){
						}
					});
				// };
			// })
			// 底部导航 关于我们
			req.jsonp({
				url:base_url + "/newsType/getDetailsNewsType.do",
				data: {code:'GYWM'},
				success: function(d){
					if (d.code == 'BUS0000') {//成功
						var dd = '';
						$.each(d.data.childrenNewsType,function(index, el) {
							if (el.name!='新闻动态'&&el.name!='联系我们') {
								dd += '<dd><a target="_blank" href="'+el.url+'?typeSn='+el.sn+'&code='+el.code+'&lm='+el.name+'">'+el.name+'</a></dd>'
							};
						});
						$('.foot_gywm').append(dd);
		        	}
				},
				error: function(e){
				}
			});
			// 点击查看用户协议
			$('.submit_order label a').click(function(event) {
				var _title = $(this).html();
				req.jsonp({
					url:base_url + "/news/getNewsByTitle.do",
					data: {newsTypeCode:'YHXY',start:1,length:2,title:_title},
					success: function(data){
						if (data.code == 'BUS0000') {
							var d = data.data[0];
							if (d) {
								req.jsonp({
									url:base_url + "/news/getNewsByTypeSn.do",
									data: {sn: d.sn, typeSn: d.typeSn},
									success: function(d){
										if (d.code == 'BUS0000') {
											layer.open({
												title: '用户协议',
												fixed: true,
												btn: false,
												skin: 'demo-class',
												area: ['800px','600px'],
												content: d.data.webBody,
												success:function(obj,q){
												}
											});
										};
										console.log(d)
									},
									error: function(e){
									}
								})
							}else{
								layer.msg("错误: 未找到 " +_title+" 相关文章");  
								console.error("错误: 未找到 " +_title+" 相关文章");
							}
						}
						//console.log(d)
					},
					error: function(e){
						alert('失败！')
					}
				})
			});
			//以下针对会员中心的
			if (window.location.href.indexOf('user')==-1) return;
			setTimeout(function(){
				var _window = $(window);
				if (_window.height()<=720) return;
				_window.on('scroll',function(){
					if ($(this).scrollTop()>=135) {
						$('#user_content').addClass('fixed').removeClass('show hide');
					}else{
						$('#user_content').removeClass('fixed');
					}
				})
			},5000)

		}(),
		login: function(url,fn){
			$login.on('click','.close',$.proxy( this, 'loginRemove' ) );
			$body.append($login);
			$login.animate({"opacity":1},300).find('.account_input input').focus();
			$pop_sign.animate({"opacity":1,top:'50%'},300);
			this.validate($('#login'),url,fn);
			$.placeholder();
		},
		loginRemove: function(){
			$login.css({'opacity':0}).remove();
			$pop_sign.css({"opacity":0,top:'0%'});
		},
		//验证登录
		validate: function(obj,url,fn){

			var _acc = obj.find('.account_input input');
			var _pss = obj.find('.password_input input');
			var _ver = obj.find('.verification_input input');
			var wrapTipsObj = obj.find('.sign_body');

			// _ver.siblings('.code').find('img').click(function(event) {
			// 	_t = 't'+Math.random().toString().substring(2);
			// 	$(this).attr('src',base_url+'/verify/getVerifyCodeImg.do?t='+_t);
			// }).attr('src',base_url+'/verify/getVerifyCodeImg.do?t='+_t);

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

			var account = $.cookie('account');//记住账号

			if (!!account) {//记住账号
				_acc.val( account );
				$('.remember_account input').attr('checked',true);
			};

			obj.find('.submit_btn').off().click(function(event) {
				var token = getStorageToken();
				if (!$('.yes_log').is(":hidden")) {
					LOAD.msg({
						obj: wrapTipsObj,
						txt: '您已登录，请先退出',
						time: 2000
					});
					return;
				};
				
				if (!_acc.val()) {
					LOAD.msg({
						obj: wrapTipsObj,
						txt: '请输入账号',
						time: 2000
					});
					_acc.focus();
					return;
				}else if(!_pss.val()){
					LOAD.msg({
						obj: wrapTipsObj,
						txt: '请输入密码',
						time: 2000
					});
					_pss.focus();
					return;
				}
				var test = window.location.href.indexOf('192.168')>=0;

				if (!test) {
					if(!_ver.val()){
						LOAD.msg({
							obj: wrapTipsObj,
							txt: '请输入验证码',
							time: 2000
						});
						_ver.focus();
						return;
					}else if(_code.toUpperCase()!=_ver.val().toUpperCase()){
						LOAD.msg({
							obj: wrapTipsObj,
							txt: '验证码不正确',
							time: 2000
						});
						_ver.siblings('.code').trigger("click");
						_ver.focus();
						return;
					}
				}else{//测试的不用输入验证码自动输入
					_ver.val(_code);
				}

				
				layer.msg('请稍后，登录中...', {icon: 16,shade:[0.1, '#333'],time:200000});
				//obj.find('.submit_btn').html('登录中...')
				
			    req.jsonp({
					url:base_url + "/customer/login",
					data: {name: $.trim(_acc.val()) , password: $.trim(_pss.val()),captcha: _t+_ver.val().toUpperCase()},
					success: function(d){
						if (d.code == 'BUS0000') {//成功
							// if (lay) {//弹窗登录提示
							// 	LOAD.msg({
							// 		obj: wrapTipsObj,
							// 		txt: '登录成功！',
							// 		time: 2000
							// 	});
							// }else{
								
							// }
							layer.closeAll();
			   				layer.msg('登录成功！即将跳转...', {icon: 6,shade:[0.1, '#333'],time:1000});

			   				if ($('.remember_account input').is(':checked')) {
			        			$.cookie('account', $.trim(_acc.val()), {expires: 30, path: '/'});
			        		}else{
			        			$.cookie('account', null, {path: '/'});
			        		}
			        		//window.localStorage.clear();                  
			        		window.localStorage.setItem("www_token", d.data.token );
			        		window.localStorage.setItem("log", JSON.stringify(d) );
			        		setTimeout(function(){
			        			window.location.href = url?url:'/page/user';
			        		},1000);
			        		fn&&fn();//成功后的回调
			        	}else{
			    //     		LOAD.msg({
							// 	obj: wrapTipsObj,
							// 	txt: '账号或密码不正确',
							// 	time: 2000
							// });
							// _ver.siblings('.code').trigger("click");
			    			layer.closeAll();
			    			layer.msg(d.msg, {icon: 5,time:2000});
			        	}
			        	console.log(d)
					},
					error: function(e){
						this.log = false;
						layer.closeAll();
						layer.msg('服务器繁忙，登录失败！', {icon: 5,shade:[0.1, '#333'],time:2000});
						// LOAD.msg({
						// 	obj: wrapTipsObj,
						// 	txt: '服务器繁忙，登录失败！',
						// 	time: 2000
						// });
					}
				})

				
			});
			$(document).on('keydown',function(event){
				if (!$('.sign_body input').is(':focus')) return;
				if (event.keyCode == 13) obj.find('.submit_btn').trigger("click");
			})
		},
		// 弹窗
		open: function(opt){

			var opt = $.extend({
				title: '操作提示',
				width: 300,
				height: 200,
				content:'还未添加内容',
				head: true, //是否显示头部条;
				success: function(){}
			},opt);
			opt.content = typeof opt.content == 'object'?opt.content[0]:opt.content;
			opt.width = typeof opt.width=='number' ? opt.width+'px' : opt.width;
			opt.height = opt.height=='auto' ? opt.height : opt.height =='number' ? opt.height+'px' : opt.height;

			this.layer = $("<div id='tl_layer'>\
							<div class='layer_content' style='width:"+opt.width+";height:"+opt.height+";'>\
							    <div class='layer_head' style='display:"+(!opt.head?'none':'')+"'>\
							    	<span class='fl'>"+opt.title+"</span>\
							    	<i class='fr close iconfont'></i>\
							    </div>\
							    <div class='layer_body'></div>\
							</div>\
						</div>");

			this.layer.on('click','.close',$.proxy( this, 'remove' ));
			var layer_body = this.layer.find('.layer_body').html(opt.content).children().show();
			var layer_content = this.layer.find('.layer_content');
			
			$('body').append(this.layer);
			var windowHeight = $(window).height();
			var layerHeight = layer_content.outerHeight(true);
			
			if (layerHeight>=windowHeight) {//屏幕高度比较小的时候
				layer_body.parent().addClass('scroll').height(windowHeight-100);
				layer_content.height(windowHeight-50)
			}
			setTimeout(function(){
				opt.success(layer_body);
			},500)
		},
		// 提示
		msg: function(opt){
			var This = this;
			this._msg&&this._msg.remove();
			this._msg = $('<div class="taolv_msg ">'+opt.txt+'</div>');
			var opt = $.extend({
				obj: $('body'),
				txt:'还未添加内容',
				time: 2000
			},opt);

			opt.obj.append(this._msg);
			if (opt.obj.css('position')=='static'){
				opt.obj.css('position','relative');
			};
			This._msg.addClass('layer-anim')

			This._msg.css({
				left: (opt.obj.outerWidth() - This._msg.outerWidth())/2,
				top: (opt.obj.outerHeight() - This._msg.outerHeight())/2 - 50
			});
			clearTimeout(this._msgTime)
			this._msgTime = setTimeout(function(){
				This._msg.remove();
			},opt.time)
		},
		//删除弹窗
		remove:function(){
			this.layer.remove();
		},
		//返回顶部
		goTop: function(top){
			$kefu.on('click','.go_top',function(){
				$('body,html').animate({scrollTop:0}); 
			});
		}(),
		//获取url参数
		getUrlParams: function(url,cut){
			url = !url ? win.location.href : url;
			cut = cut || "?";
			var end = cut === "?" ? "?" : "#"
				, obj = {}
				, arr;
			cut = url.indexOf(cut);
			end = url.indexOf(end);
			if(cut >= 0){
				cut++;
				url = url.substr(cut,end>cut?end-cut:url.length);
				url = url.split("&");
				for(var i = 0; i < url.length; i++){
					var reg = url[i].match(/^([\S]*)\=([\S]*)$/);
					if(reg !== null){
						obj[reg[1]] = reg[2];
					};
				};
			}
			return obj;
		},
		//下拉框
		selectInit: function(){
			var selects=$('select[selectStyle]').hide();//获取select
			$('.select_box').remove();
			selects.each(function(index, el) {
				createSelect(el,index);
			});
			function createSelect(select_container,index){
				
				//创建select容器，class为select_box，插入到select标签前
				var tag_select=$('<div></div>');//div相当于select标签
				tag_select.attr('class','select_box');
				tag_select.insertBefore(select_container);
				//显示框class为select_showbox,插入到创建的tag_select中
				var select_showbox=$('<div></div>');//显示框
				select_showbox.css('cursor','pointer').attr('class','select_showbox').appendTo(tag_select);
				//创建option容器，class为select_option，插入到创建的tag_select中
				var ul_option=$('<div></div>');//创建option列表
				ul_option.attr('class','select_option');
				ul_option.appendTo(tag_select);
				createOptions(index,ul_option);//创建option
				//点击显示框
				tag_select.click(function(event) {
					if (!this.show) {
						ul_option.show();
					}else{
						ul_option.hide();
					}
					this.show = !this.show
				}).mouseleave(function(){
						ul_option.hide();
						this.show = false;
					});;
				var li_option=ul_option.find('i');
				li_option.on('click',function(){
					$(this).addClass('selected').siblings().removeClass('selected');
					var value=$(this).text();
					select_container.value = value;
					select_showbox.text(value);
					ul_option.hide();
				});
				li_option.hover(function(){
					$(this).addClass('hover').siblings().removeClass('hover');
				},function(){
					li_option.removeClass('hover');
				});
			}
			function createOptions(index,ul_list){
				//获取被选中的元素并将其值赋值到显示框中
				var options=selects.eq(index).find('option'),
					selected_option=options.filter(':selected'),
					selected_index=selected_option.index(),
					showbox=ul_list.prev();
					showbox.text(selected_option.text());
				//为每个option建立个li并赋值
				for(var n=0;n<options.length;n++){

					var tag_option=$('<i></i>'),//li相当于option
						txt_option=options.eq(n).text();
					if (txt_option) tag_option.text(txt_option).css('cursor','pointer').appendTo(ul_list);
					//为被选中的元素添加class为selected
					if(n==selected_index){
						tag_option.attr('class','selected');
					}
				}
			}
		},
		//手机验证码验证
		sendPhoneCode: function(codeId,phone,back){
			var promise = $.Deferred();
			var obj = $('#'+codeId);
			var url = base_url + "/customer/checkVerificationCode.do";

			if (back) {//找回密码验证接口
				url = base_url + "/customer/forgetPasswordCheckVerificationCode.do"
			};

			req.jsonp({
				url:url,
				data: {phone: phone, captcha: obj.val() },
				success: function(d){ 
					console.log(d)
		        	if (d.code == 'BUS0000') {//验证码成功
		        		obj.data('s',true);
		        		promise.resolve(d);
		        	}else{
		        		layer.closeAll();  
		        		layer.tips(d.msg, obj, {tips: [2, '#f62d13'] });
		        		obj.data('s',false);
		        		promise.reject();
		        	}
				},
				error: function(e){
					layer.closeAll();  
					layer.msg('服务器繁忙，手机验证码验证失败！', {icon: 5,shade:[0.1, '#333'],time:3000});
					promise.reject();
				}
			})

			return promise;
		},
		//手机验证码发送倒计时
		countTime: function(This,stop){
			var obj = $(This);
			if (!stop) {
				This.time = 60;
				obj.html(This.time+'秒后重新发送').addClass('disabled');
				This.Interval = setInterval(function(){
					This.time -- ;
					obj.html(This.time+'秒后重新发送');
					if (This.time==0) {
						This.time = 60;
						obj.html('获取验证码').removeClass('disabled');
						clearInterval(This.Interval);
					};
				},1000)
			}else{
				obj.html('获取验证码').removeClass('disabled');
				clearInterval(This.Interval);
			}
		},
		//获取用户信息
		getUserInfo: function(){
			var log = false;
			if (window.localStorage.getItem("log")) {
				log = JSON.parse(window.localStorage.getItem("log"));
			};
			var token = getStorageToken();
			var promise = $.Deferred();
			// window.localStorage.removeItem("token");
			// window.localStorage.removeItem("log");
			if (token&&log) {
				// promise.resolve(log);
				req.jsonp({
					url:base_url + "/customer/getCustomer.do",
					data: { sn: log.data.sn , token: token , userInfo: true},
					success: function(d){
						
						if (d.code == 'BUS0000') {
							console.log('获取用户信息成功')
							//window.localStorage.setItem("log", JSON.stringify(d.data) );//更新用户数据到本地
							$('.yes_log').show().siblings('.no_log').hide();
							$('.yes_log').find('.name').html(d.data.name);
			        		setTimeout(function(){//$scope会报错所以暂时加个定时器
			        			promise.resolve(d);//用户已登录成功
			        		},80)
			        	}else{
			        		// $.cookie('token',null);
			        		window.localStorage.removeItem("token");//
			        		window.localStorage.removeItem("log");//在本地删除用户数据（因为服务器检测用户登录已超时或没有查询到用户数据）
			        		promise.reject(d);//失败
			        		//layer.msg('登录超时，请重新登录！', {icon: 5,shade:[0.1, '#333']});
							// setTimeout(function(){
							// 	window.location.href = '/page/reg/login.html';
							// },2000)
			        	}
					},
					error: function(e){
						console.log('获取用户信息失败！');
						window.localStorage.removeItem("token");
						window.localStorage.removeItem("log");
						promise.reject(false);//失败``
					}
				})
			}else{
				promise.reject(false);//失败
			}
		   
		    return promise;
		}(),
		surplustime: function(el,data){
			// alert(data.value.time)
			if (data.time) {
				var time = null;
				var _day = data.day?data.day:1;
				var _time = 0;
				data.time = parseInt(data.time);
				var surplusTime = function(){
					// var stamp = data.time.replace(/\-/g,'/');
					// var date=(new Date(stamp).getTime()+_day*24*60*60*1000)-new Date().getTime()  //时间差的毫秒数
					// //计算出相差天数
					// var days=Math.floor(date/(24*3600*1000))
					// //计算出小时数
					// var leave1=date%(24*3600*1000)    //计算天数后剩余的毫秒数
					// var hours=Math.floor(leave1/(3600*1000))
					// //计算相差分钟数
					// var leave2=leave1%(3600*1000)        //计算小时数后剩余的毫秒数
					// var minutes=Math.floor(leave2/(60*1000))

					// //计算相差秒数
					// var leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
					// var seconds=Math.round(leave3/1000)
					 
					// //document.getElementById('time').innerHTML = days+"天"+hours+"小时"+minutes+"分钟"+seconds+"秒";
					
					// if (days<0) {
					// 	clearInterval(time); 
					// 	el.innerHTML = '00:00:00'; 
					// }else{
					// 	el.innerHTML = (days>0?days+"天":"")+(hours>0?hours+"时":"")+(minutes>0?minutes+"分":"")+seconds+"秒";
					// 	//time = setTimeout(surplusTime,1000);  
					// }

					var theTime = parseInt(data.time--);// 秒
				    var theTime1 = 0;// 分
				    var theTime2 = 0;// 小时
				    if(theTime > 60) {
				        theTime1 = parseInt(theTime/60);
				        theTime = parseInt(theTime%60);
				            if(theTime1 > 60) {
					            theTime2 = parseInt(theTime1/60);
					            theTime1 = parseInt(theTime1%60);
				            }
				    }
			        var result = ""+parseInt(theTime)+"秒";
			        if(theTime1 > 0) {
			        	result = ""+parseInt(theTime1)+"分"+result;
			        }
			        if(theTime2 > 0) {
			        	result = ""+parseInt(theTime2)+"小时"+result;
			        }

			        if (data.time>0) {
			        	el.innerHTML = result;
			        }else{
			        	clearInterval(time); 
						el.innerHTML = '00:00:00'; 
			        }
				}
				surplusTime();
				time = setInterval(surplusTime,1000);
				
			}else{
				el.style.display = 'none';
			}
		},
		//获取物流信息
		getLogistics(){
			var promise = $.Deferred();
			req.jsonp({
				url:base_url_admin + "/systemset/expressManage/getExpress.do",
				data: {},
				success: function(d){
					if (d.code == 'BUS0000') {
						promise.resolve(d.data);//用户已登录成功
			    	}else{
			    		promise.reject(d);//失败
			    	}
				},
				error: function(e){
					//loading.msg('服务器请求失败');
				}
			});

			return promise;
		}
		
	}
    window.LOAD = new INIT();

    //搜索
    var $headSearchKeyWord = $('#headSearchKeyWord');
	$(document).on('keydown',function(event){
		if (!$headSearchKeyWord.is(':focus')) return;
		if (event.keyCode == 13) $headSearchKeyWord.siblings('a').trigger("click");
	})
    //qq联系客服
    $('#kfQQ1').off().hover(function(event) {
    	
		if (!this.Opera) {
			this.Opera = true;
			var head= document.getElementsByTagName('head')[0]; 
			var script= document.createElement('script'); 
			script.type= 'text/javascript'; 
			script.onload = script.onreadystatechange = function() { 
				if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete" ) { 
				
					script.onload = script.onreadystatechange = null; 
					BizQQWPA.addCustom([{
					    aty: '1',
					    a: '1001',
					    nameAccount: '4001885167',
					    selector: 'kfQQ2'
					}, {
					    aty: '1',
					    a: '1002',
					    nameAccount: '4001885167',
					    selector: 'kfQQ1'
					}]);
					BizQQWPA.visitor({ nameAccount: '4001885167' });
				} 
			}; 
			script.src= '/js/commons/qq.js'; 
			head.appendChild(script); 
		}
	
		// setTimeout(function(){//联系客服
	 // 		$('#kfQQ1').off().trigger("click");
	 // 	},500)
	 
    });


 	
	return LOAD;
})