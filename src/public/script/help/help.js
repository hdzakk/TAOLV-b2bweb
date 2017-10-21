define(['jquery','script/index/load_init','script/utils/angular','script/utils/angular-sanitize.1.2.9.min','script/utils/pagination','script/utils/req','script/utils/layer'],function($, LOAD, angular, route, pagination, req,layer){

	angular.module('help',['ngSanitize'])
	.run(['$rootScope', '$http', '$timeout', '$filter', '$document', '$templateCache', '$location','$compile', function($rootScope, $http, $timeout, $filter, $Document, $templateCache, $location,$compile) {
		var url = LOAD.getUrlParams(window.location.href,'?');
		//帮助中心一进来请求
		req.jsonp({
			url:base_url + "/newsType/getDetailsNewsType",
			data: {code:'BZZX'},
			success: function(d){
				console.log(d)
	        	$rootScope.headData = d.data.childrenNewsType;
	        	var code = d.data.childrenNewsType[0].code;
	        	getMune(url.code?url.code:'CJWD');//进入帮助中心默认请求
	        	$rootScope.pageLoading = true;
	        	$rootScope.$apply();
			},
			error: errorMsg
		})
		var getMune = function(code){//请求左侧数据方法
			req.jsonp({
				url:base_url + "/newsType/getDetailsNewsType",
				data: {code:code},
				success: function(d){
					console.log(d)
		        	if (d.data) {
		        		if (d.data.childrenNewsType.length>0) {
		        			$rootScope.data = d.data;
				        	$rootScope.noun = d.data.childrenNewsType;
				        	$rootScope.zn_name = $rootScope.noun[0].name;
				        	console.log($rootScope.zn_name)
				        	$rootScope.name=$rootScope.noun[0].childrenNewsType[0].name;
				        	var sn=$rootScope.noun[0].childrenNewsType[0].sn;
				        	getData(sn,start,true);//进入帮助中心默认请求
				        	$rootScope.$apply();
				        	$('.'+code).addClass('choose').siblings().removeClass('choose');
		        		}else{
		        			layer.msg('没有数据', {icon: 5,shade:[0.1, '#333'],time:1000});
		        		}
		        	}else{
		        		layer.msg('请求失败无数据！', {icon: 5,shade:[0.1, '#333'],time:1000});
		        	}
				},
				error: function(e){
					layer.msg('请求失败！', {icon: 5,shade:[0.1, '#333'],time:1000});
				}
			})
		}
		$(".help_heart").on('click', 'li', function(event) {
			event.preventDefault();
			$(this).addClass('choose').siblings().removeClass('choose');
		});
		$rootScope.lod = true;

		//请求右侧数据方法
		var getData = function(typeSn,start,off){
			if(!$rootScope.lod) layer.load(0,{shade:[0.1, '#333']});
			var length = 5;
			req.jsonp({
				url:base_url + "/news/getNewsByTypeSnList",
				data: {typeSn:typeSn,start:start,length:length},
				success: function(d){
				    $rootScope.dataAll = d.data;
				    var recordsFiltered = d.recordsFiltered;
				  
				    $rootScope.$apply();
				    var page = recordsFiltered/length;
				    $("#Pagination").pagination(page, {  //分页
						num_edge_entries: 1, //边缘页数
						num_display_entries: 4, //主体页数
						items_per_page:1, //每页显示1项
						current_page: start-1,
						prev_text:"上一页",
					    next_text:"下一页",
					    callback:function(p){	
					    	start = p+1;
					    	getData(typeSn,start);
					    }
					});
					if (!off) {
						$body.animate({scrollTop:$('#wrapHelp').offset().top},500); 
					};
					$('.switch>ul').off().on('click', 'li', function(event) {
						event.preventDefault();
						$(this).addClass('cut').siblings().removeClass('cut');
					});
				    setTimeout(function(){
						layer.closeAll();
					},200)
				},
				error: function(e){
					alert('失败！')
				}
			})
		}
		
		var start = 1;//分页起始页

		//上侧点击请求左侧列表
		$rootScope.problem = function(code){
			//window.location.href ='?code='+code+'';
			window.location.hash = 'code='+code;
			getMune(code);
			$rootScope.isShow = true;
		}
		var $body = $('body,html');
		//左侧点击请求右侧列表
		$rootScope.jump=function(typeSn,name,dname){
			$rootScope.lod = false;
			$rootScope.name = name;
			$rootScope.isShow = true;
			console.log($rootScope.noun)
			$rootScope.zn_name = dname;

			if (name=="手机质检术语") {
				$rootScope.term = true;//针对手机质检术语内容的显示
			}else{
				$rootScope.term = false;
				getData(typeSn,start);
			}
		}
		$rootScope.termTab = function(index,event){
			$(event.target).addClass('cur').siblings().removeClass('cur');
			$body.animate({scrollTop:$('.phoneTerm .term_box').eq(index).offset().top-$('.box_head').height()},500); 
		}

		//右侧列表点击请求具体数据
		$rootScope.obtain=function(webBody,title,typeSn){
			$('#webBody').html('');
			$rootScope.webBody = webBody;
			$rootScope.title=title;
			$rootScope.isShow = false;
			//if(!$rootScope.lod) layer.load(0,{shade:[0.1, '#333']});
			layer.load(0,{shade:[0.1, '#333']});
			req.jsonp({
				url:base_url + "/news/getNewsBySn",
				data: {sn:typeSn},
				success: function(d){
				    $rootScope.dataList = d.data;
				    $rootScope.$apply();
				    $('#webBody').html(d.data.webBody);
				   setTimeout(function(){
						layer.closeAll();
					},200)
				},
				error: function(e){
					alert('失败！')
				}
			})
		}
		$('#help_right').on('click','.return_back',function(){
			$body.animate({scrollTop:$('#wrapHelp').offset().top},500); 
		})  

		//帮助中心查询请求数据
		var help_hqu = function(start){
		 	$rootScope.isShow = true;
			var find_content=$('.find').val();
			if(find_content){
				var length=5;
				req.jsonp({
					url:base_url + "/news/getNewsByTitle.do",
					data: {newsTypeCode:'BZZX',start:start,length:length,title:find_content},
					success: function(d){
						$rootScope.zn_name ="关于“"+find_content +"”,共找到 “"+d.recordsTotal+"”条相关问题";
						$rootScope.name ="";
						$rootScope.dataAll = d.data;
						var recordsFiltered = d.recordsFiltered;
						$rootScope.$apply();
						var page = recordsFiltered/length;
						$("#Pagination").pagination(page, {  //分页
							num_edge_entries: 1, //边缘页数
							num_display_entries: 4, //主体页数
							items_per_page:1, //每页显示1项
							current_page: start-1,
							prev_text:"上一页",
							next_text:"下一页",
							callback:function(p){	
								start = p+1;
							    help_hqu(start);
							}
						});
					},
					error: function(e){
						alert('失败！')
					}
				})
			}else{
				layer.msg('请输入查询内容', {icon: 5,shade:[0.1, '#333'],time:1000});
			}
		 }
		 //帮助中心点击查询请求数据
		$rootScope.help_find=function(){
			help_hqu(start);
		}
		//帮助中心回车查询请求数据
		$(document).keydown(function(event) {
			if (!$('body input').is(':focus')) return;
			if (event.keyCode == 13) {
				help_hqu(start);
			}
		});
   		//右侧显示隐藏
		$rootScope.isShow = true;
   		$('#user_content').show();
		//左侧淡入谈出
		$('.guide>ul').on('click','p',function(){
			$(this).siblings('ul').slideToggle();
			$(this).children('b').toggleClass('cur');
			$(this).parent().siblings().children('ul').slideUp();
			$(this).parent().siblings().children('p').children('b').removeClass('cur');
			$(this).parent().siblings().children('ul').children().removeClass('point');
		});
	}])

	//初始化
	$(document).ready(function() {
		angular.bootstrap(document, ['help']);
	});
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

	var _window = $(window);
	// alert(_window.height())
	// if (_window.height()<=720) return;
	_window.on('scroll',function(){
		if ($(this).scrollTop()>=280) {
			$('#wrapHelp').addClass('fixed').removeClass('show hide');
		}else{
			$('#wrapHelp').removeClass('fixed');
		}
	})
})