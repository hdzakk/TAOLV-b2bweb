define(['jquery','script/index/load_init','script/utils/angular','script/utils/req','script/utils/layer'],function($, LOAD, angular, req, layer){

	angular.module('category',[])
	.run(['$rootScope', function($rootScope) {
		var $s = $rootScope;

		window.sessionStorage.clear();
		$s.classifyInfoWatch = function(d){
  			$s.typeList = d;
  			$.map($s.typeList,function(o,i){
				o.number = '';
				//监听数量只能输入数字
				$s.$watch('typeList['+i+'].number',function(newVal,oldVal){
					var reg = /^\d+\.?\d*$/;
					try{
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
						
					}catch(e){}
				},true);
			})
  		}
		var getSellClassifyInfo = function(name){
			var _name = window.sessionStorage.getItem(name);
			if (_name) {
				$s.classifyInfoWatch(JSON.parse(_name));
				return;
			};
			//第一次进来不执行
			if (name!='手机统货') layer.load(0,{shade:[0.1, '#fff']});
			//获取货物相关信息
			req.jsonp({
				url:base_url_admin + "/systemset/sellManage/selectByProCategory.do",
				data: {productCategory: name},
				success: function(d){
					layer.closeAll();
					if (d.code == 'BUS0000') {
						$.map(d.data,function(o,i){
							o.gradeSn = _gradeSn;
							o.gradeName = "E";
							return o;
						})
						$s.classifyInfoWatch(d.data);
						$rootScope.pageLoading = true;
						$s.$apply();
						window.sessionStorage.setItem(name, JSON.stringify(d.data));
					};
		        	console.log(d)
				},
				error: function(e){
					alert('页面加载失败！')
				}
			});
		}

		//货物类型
		// req.jsonp({
		// 	url:base_url_admin + "/systemset/sellManage/types.do",
		// 	success: function(d){
		// 		if (d.code == 'BUS0000') {
		// 			$rootScope.categoryList = d.data;
		// 			$rootScope.$apply();
		// 			getSellClassifyInfo( d.data[0].typeName );//默认获取第一条信息
		// 		};

		// 	},
		// 	error: function(e){
		// 		alert('页面加载失败！')
		// 	}
		// });
		$s.categoryList = [
			{'typeName':'手机统货'},
			{'typeName':'手机'},
			{'typeName':'平板数码'},
			{'typeName':'大家电'},
			{'typeName':'内存卡'},
			{'typeName':'小家电'}
		]
		

		//获取E等级列表
  		var _gradeSn = "DJGL16110416131445EV83v2p2TH88R81478247194579";
		req.jsonp({
			url:base_url + "/systemset/gradeManage/findAll.do",
			data:{gradeName:'E'},
			success: function(d){
				if (d.code == 'BUS0000') {
					_gradeSn = d.data[0].sn;
					getSellClassifyInfo( $s.categoryList[0].typeName );//默认获取第一条信息
				};
			},
			error: function(e){
				
			}
		});

		//获取每一项信息
		$rootScope.getSellClassifyInfo = function(name,$event){
			$($event.currentTarget).addClass('active').siblings('a').removeClass('active');
			getSellClassifyInfo(name);
		}

		$rootScope.go_order_info = function(){

			var typeList = $.extend(true,[],$s.typeList);

			for (var i = 0; i < typeList.length; i++) {
				if (!typeList[i].number) {
					typeList.splice(i,1)
					i--;
				};
			};
			if (typeList.length==0) {
				layer.msg('请至少选择一个货物的供货数量',{time:1500});
				var _input = $('.cargo_box input');
				for (var j = 0; j < _input.length; j++) {
					if (!_input.get(j).value) {
						_input.get(j).focus();
						return;
					};
				};
				return;
			};

			LOAD.getUserInfo.done(function(d){
				window.sessionStorage.setItem("typeList", JSON.stringify( typeList ) );
				window.location.href = '/page/sell/order_info.html';
			}).fail(function(){
				LOAD.login('/page/sell/order_info.html',function(){
					window.sessionStorage.setItem("typeList", JSON.stringify( typeList ) );
				})
			});
		}
	}])
	//初始化
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['category']);
	});

})