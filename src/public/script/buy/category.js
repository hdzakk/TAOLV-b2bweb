define(['jquery','script/index/load_init','script/utils/angular','script/utils/req','script/utils/layer'],function($, LOAD, angular, req, layer){

	var token = getStorageToken();
	Array.prototype.unique = function(){//数组去重和排序方法
		 var res = [this[0]];
		 for(var i = 1; i < this.length; i++){
		  var repeat = false;
		  for(var j = 0; j < res.length; j++){
		   if(this[i] == res[j]){
		    repeat = true;
		    break;
		   }
		  }
		  if(!repeat){
		    res.push(this[i]);
		  }
		 }
		 return res.sort(function(a,b){
             return parseFloat(a) - parseFloat(b)
		 })
	}
	angular.module('category',[])
	.filter('unique', function() {
	   return function(collection, keyname) {
	      var output = [], 
	          keys = [];

	      angular.forEach(collection, function(item) {
	          var key = item[keyname];
	          if(keys.indexOf(key) === -1) {
	              keys.push(key);
	              output.push(item);
	          }
	      });

	      return output;
	   };
	})
	.run(['$rootScope','$templateCache','$cacheFactory','$compile', function($rootScope,$templateCache,$cacheFactory,$compile) {
		var $s = $rootScope;

		// var cachetest = $cacheFactory('cache');

		// ////console.log(cachetest)
  //       cachetest.put('a', '啦啦啦啦啦阿里');

  //       ////console.log(cachetest.get('a'))


  		$s.classifyInfoWatch = function(d){
  			////console.log(d)
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
				//监听报价只能输入数字
				$s.$watch('typeList['+i+'].maxPrice',function(newVal,oldVal){
					var reg = /^\d+\.?\d*$/;
					try{
						if (reg.test(newVal)) {
							$s.typeList[i].maxPrice = newVal;
						}else{
							$s.typeList[i].maxPrice = parseFloat(newVal);
						}
					}catch(e){}
				},true);
			})
  		}
  		window.sessionStorage.clear();
		//获取货物相关信息
		var getSellClassifyInfo = function(name){
			var _name = window.sessionStorage.getItem(name);
			if (_name) {
				$s.classifyInfoWatch(JSON.parse(_name));
				return;
			};
			//第一次进来不执行
			if (name!='手机') layer.load(0,{shade:[0.1, '#fff']});
			req.jsonp({
				url:base_url_admin + "/systemset/sellManage/selectByProCategory.do",
				data: {productCategory: name},
				success: function(d){
					if (d.code == 'BUS0000') {
						$.map(d.data,function(o,i){
							o.gradeSn = _gradeSn;
							return o;
						})
						$s.classifyInfoWatch(d.data);
						$s.pageLoading = true;
						$s.$apply();
						layer.closeAll();
						window.sessionStorage.setItem(name, JSON.stringify(d.data));
					};
		        	////console.log(d)
				},
				error: function(e){
					alert('页面加载失败！')
				}
			});
		}
		
		// 获取二手品类信息
		var getSecondCategoryInfo = function(){
			var _name = window.sessionStorage.getItem('二手');
			if (_name) {
				$s.secondList = JSON.parse(_name);
				return;
			};
			layer.load(0,{shade:[0.1, '#fff']});
			req.jsonp({
				url:base_url_admin + "/systemset/categoryManage/brandList.do",
				success: function(d){
					if (d.code == 'BUS0000') {
						$s.secondList = d.data;
						$s.$apply();
						window.sessionStorage.setItem('二手', JSON.stringify(d.data));
					};
					layer.closeAll();
				},
				error: function(e){
					layer.closeAll();
					alert('页面加载失败！')
				}
			});
		}
		var second = {
			typeName: '二手'
		}
		//货物类型
		// req.jsonp({
		// 	url:base_url_admin + "/systemset/sellManage/types.do",
		// 	success: function(d){
		// 		if (d.code == 'BUS0000') {
		// 			//d.data.shift();//删除第一条
		// 			for (var i = 0; i < d.data.length; i++) {//删除掉手机统货
		// 				if (d.data[i].typeName=="手机统货") {
		// 					d.data.splice(i,1);
		// 					break;
		// 				};
		// 			};
					

		// 			$s.categoryList = [
		// 				{'typeName':'废料手机'},
		// 				{'typeName':'二手'},
		// 				{'typeName':'平板数码'},
		// 				{'typeName':'大家电'},
		// 				{'typeName':'内存卡'},
		// 				{'typeName':'小家电'}
		// 			]
		// 			d.data.splice(1,0,second);//我要买货新添加二手
		// 			$s.categoryList = d.data;
		// 			$s.$apply();
		// 			getSellClassifyInfo( d.data[0].typeName );//默认获取第一条信息
		// 		};

		// 		////console.log(d.data)

		// 	},
		// 	error: function(e){
		// 		alert('页面加载失败！')
		// 	}
		// });

		$s.categoryList = [
			{'typeName':'手机'},
			{'typeName':'二手'},
			{'typeName':'平板数码'},
			{'typeName':'大家电'},
			{'typeName':'内存卡'},
			{'typeName':'小家电'}
		]
		

		//获取E等级列表
  		var _gradeSn = "DJGL16110416131445EV83v2p2TH88R81478247194579";
		req.jsonp({
			url:base_url + "/systemset/gradeManage/findAll.do",
			data:{token:token,gradeName:'E'},
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
		$s.getSellClassifyInfo = function(name,$event,index){
			$($event.currentTarget).addClass('active').siblings('a').removeClass('active');
			if (index==1) {//二手
				$('#gradeless').hide().siblings('div[data-toggle="content"]').show();
				getSecondCategoryInfo();
				//$s.selectedGoodsList = [];//已选好的货物清空
				//$s.showGoodsList = [];//点击更多显示的货物列表清空
				$s.phoneModelArr = [];//已选好的型号清空
				$s.modelEllipsis = [];
				isCheckJson = {};//恢复为空，以便可以在选择
				$s.flow = 1;
			}else{
				$('#second_hand').hide().siblings('div[data-toggle="content"]').show();
				getSellClassifyInfo(name);
				
				
			}
		}

		// var vm = new Vue({
		//   el: '#buy_content',
		//   data: {
		//     modelList:[],
		//     modelChecked:false
		//   },
		//   methods:{
		//   },
		//   created(){
		  	
		//   },
		//   mounted(){

		//   },
		//   delimiters:['((', '))']  
		// })


		//以下是二手品类选择代码
		
		//第一步选择品牌下面的型号
		var brand = '';//品牌
		var arrModel = [];//全部型号临时存储
		var prebrandJson = {};//存放各个
		//判断有没有选中
		$s.isCheckedFn = function(data){
			for (var i = 0; i < data.length; i++) {
				data[i].checked = false;//默认不选中
				for (var j = 0; j < $s.phoneModelArr.length; j++) {
					if (data[i].promodelName == $s.phoneModelArr[j].promodelName) {
						data[i].checked = true;//已选择的型号
					}
				}
			}
			$s.modelList = data;
			$s.flow = 2;
			$s.model = false;
			arrModel = $.extend([],true,data);
		}
		var _categoryManageSn = '';//品牌sn
		$s.choiceBrand = function(d){
			brand = d.brand;
			var key = d.sn;
			$s.modelChecked = false;//型号不全选恢复
			$s.specChecked = false;//规格不全选恢复

			$s.phoneStandard.length = 0;//选择的手机型号内存的总个数
			choiceStandardArr.length = 0;//选择的内存
			standardNameJson = {};//规格
			
			if (prebrandJson[key]) {
				$s.isCheckedFn(prebrandJson[key]);
				return;
			}
			
			//$s.phoneModelArr.length = 0;//选择的型号
			
			$('.select_specifications .selected').removeClass('selected');//购买渠道样式删除

			$s.searchVal = '';
			_categoryManageSn = d.sn;
			//获取品牌型号
			layer.load(0,{shade:[0.1, '#fff']});
			req.jsonp({
				url:base_url_admin + "/systemset/modelManage/modelList.do",
				data: {categoryManageSn: d.sn},
				success: function(d){
					layer.closeAll();
					if (d.code == 'BUS0000') {
						if (d.data.length!=0) {
							var data = $.extend(true, [], d.data);
							$s.isCheckedFn(data);
							if (!prebrandJson[key]) {
								prebrandJson[key] = data;
							}
							setTimeout(function(){
								$('body,html').animate({scrollTop:$('.navigation').offset().top + 60},600); 
							},200)
							//$s.modelList = data;
							$s.$apply();
						}else{
							layer.msg('该品牌还未添加型号')
						}
					};
		        	////console.log(d)
				},
				error: function(e){
					layer.closeAll();
					layer.msg('数据请求失败！')
				}
			});
		}

		//已选择型号弹框（查看更多）
		$s.lookMoreGoods = function(){
			//$s.showSelectedGoodsList = $.extend(true, [], $s.showGoodsList);
			layer.open({
				title: '已选品牌型号',
				// width: '550px',
				// height: 'auto',
				fixed: true,
				btn: ['确定','取消'],
				// skin: 'demo-class',
				area: ['490px','520px'],
				content: `
						<div class="lookMoreBox" ng-init="goodsSearchVal=''">
							<div class="goodsSearch">
								<input id="goodsSearchVal" class="fl" type="text" ng-model="goodsSearchVal" placeholder="请输入关键词">
								<i class="fl" ng-click="modelGoodsSearch()"><img src="${require('images/buy/2.png')}" alt=""></i>
							</div>
							<p class="more_title">已选 <i>{{arrKey.length||0}}</i> 个品牌，<i>{{phoneModelArr.length||0}}</i> 个型号</p>

							<div class="warpGoods scrollBar" ng-style="{'padding-right':(showSelectedModelList.length>=8?'10px':'0px')}">
								<table cellpadding="0" cellspacing="0" border="0">
									<thead>
										<th>序号</th>
										<th>品牌</th>
										<th>型号</th>
										<th>操作</th>
									</thead>
									<tbody>
										<tr ng-repeat="d in showSelectedModelList track by $index">
											<td style="width:40px;">{{$index+1}}</td>
											<td>{{d.brand}}</td>
											<td>{{d.promodelName}}</td>
											<td style="width:40px;"><a href="javascript:;" ng-click="modelGoodsDelete(d,$index)">删除</a></td>
										</tr>
										<tr ng-if="showSelectedModelList.length==0">
											<td colspan="4">暂无相关的品牌型号</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
				`,
				success:function(obj,q){
					var template = angular.element(obj[0]);
					$compile(template)($s);
					
				}
			});
		}
		//查看更多的搜索
		$s.showSelectedModelList = [];
		$s.modelGoodsSearch = function(){
			$s.showSelectedModelList = [];
			for (var i = 0; i < $s.phoneModelArr.length; i++) {
				var d = $s.phoneModelArr[i];
				var val = $s.goodsSearchVal.toLowerCase();
				var brand = d.brand.toLowerCase();
				var model = d.promodelName.toLowerCase();
				if (brand.indexOf(val)>=0||model.indexOf(val)>=0||(brand+''+model).indexOf(val)>=0||val=='') {
					$s.showSelectedModelList.push(d)
				}
			}
			console.log($s.showSelectedModelList);

		}
		//查看更多删除
		$s.modelGoodsDelete = function(d,index){//promodelName
			$s.showSelectedModelList.splice(index,1);

			//找到对应的型号取消选中
			for (var i = 0; i < $s.modelList.length; i++) {
				if ($s.modelList[i].promodelName == d.promodelName) {
					$s.modelList[i].checked = false;
				}
			}
			//删除已选型号
			for (var j = 0; j < $s.phoneModelArr.length; j++) {
				if ($s.phoneModelArr[j].promodelName == d.promodelName) {
					$s.phoneModelArr.splice(j,1);
				}
			}
		}

		//去空格
		function Trim(str,is_global){
            var result;
            result = str.replace(/(^\s+)|(\s+$)/g,"");
            if(is_global.toLowerCase()=="g"){
                result = result.replace(/\s/g,"");
            }
            return result;
		}
		//型号搜索
		var searchCalculation = function(data){
			data = data?data:[];
			// var result = [];
			// if ($s.searchVal) {
			// 	var val = Trim($s.searchVal.toLowerCase(),'g');
			// 	for (var i = 0; i < arrModel.length; i++) {
			// 		var model = $.trim(arrModel[i].brand.toLowerCase() + arrModel[i].promodelName.toLowerCase());
			// 		if (model.indexOf(val)>=0) {
			// 			result.push(arrModel[i]);
			// 		};
			// 	};
			// }else{
			// 	result = arrModel;
			// }
			for (var k = 0; k < data.length; k++) {
				data[k].checked = false;//默认不选中
				for (var j = 0; j < $s.phoneModelArr.length; j++) {
					if (data[k].promodelName == $s.phoneModelArr[j].promodelName) {
						data[k].checked = true;//已选择的型号
					}
				}
			}

			$s.modelList =  data ;
			$s.$apply();
		}
		$s.modelSearch = function(){ 

			//if ($s.searchVal) {
				layer.load(0,{shade:[0.1, '#fff']});
				req.jsonp({
					url:base_url_admin + "/systemset/modelManage/modelList.do",
					data: {categoryManageSn: _categoryManageSn,key:$s.searchVal},
					success: function(d){
						layer.closeAll();
						if (d.code == 'BUS0000') {
							if (d.data.length!=0) {
								var data = $.extend(true, [], d.data);
								searchCalculation(data);
							}else{
								searchCalculation([]);
							}
						};
			        	console.log(d)
					},
					error: function(e){
						
					}
				});
			// }else{
			// 	searchCalculation([]);
			// }
		}
		$(document).on('keydown',function(){
			if ($('#searchVal').is(':focus')) {
				if (event.keyCode == 13) $s.modelSearch();
			}
			if ($('#goodsSearchVal').is(':focus')) {
				if (event.keyCode == 13) $s.modelGoodsSearch();
			}
			$s.$apply();
			
		})

		// 选择采购的型号（多选）
		$s.phoneModelArr = [];//已选好的型号先存在这里
		var isCheckJson = {};//判断型号有没有选上
		$s.choicePhoneModel = function(d,event){
			

			d.checked = !d.checked;
			// console.log(d)
			// console.log($s.phoneModelArr.indexOf(d))
			if (d.checked) {//添加
				// if ($s.phoneModelArr.indexOf(d)==-1) {
				// 	$s.phoneModelArr.push(d);
				// }
				if (!isCheckJson[d.sn]) {
					isCheckJson[d.sn] = true;
					$s.phoneModelArr.push(d);
				}

			}else{//删除
				// if ($s.phoneModelArr.indexOf(d)>=0) {
				// 	var index = $s.phoneModelArr.indexOf(d);
				// 	$s.phoneModelArr.splice(index,1);
				// }
				for (var i = 0; i < $s.phoneModelArr.length; i++) {
					if ($s.phoneModelArr[i].sn == d.sn) {
						delete isCheckJson[d.sn];
						$s.phoneModelArr.splice(i,1);
						i--;
					}
				}
			}

			$s.showSelectedModelList = $.extend(true, [], $s.phoneModelArr).reverse();
			

			$s.getBrandNun();
			//console.log($s.phoneModelArr)
		}


		//型号全选与全不选
		$s.all_cancelled = function(){
			
			$s.modelChecked = !$s.modelChecked;
			for (var i = 0; i < $s.modelList.length; i++) {
				$s.modelList[i].checked = $s.modelChecked;
				if ($s.modelChecked) {//全选添加
					// if ($s.phoneModelArr.indexOf($s.modelList[i])==-1) {
					// 	$s.phoneModelArr.push($s.modelList[i]);
					// }
					if (!isCheckJson[$s.modelList[i].sn]) {
						isCheckJson[$s.modelList[i].sn] = true;
						$s.phoneModelArr.push($s.modelList[i]);
					}
				}else{//全选删除
					// if ($s.phoneModelArr.indexOf($s.modelList[i])>=0) {
					// 	var index = $s.phoneModelArr.indexOf($s.modelList[i]);
					// 	$s.phoneModelArr.splice(index,1);
					// }
					for (var j = 0; j < $s.phoneModelArr.length; j++) {
						if ($s.phoneModelArr[j].sn == $s.modelList[i].sn) {
							delete isCheckJson[$s.modelList[i].sn];
							$s.phoneModelArr.splice(j,1);
							j--;
						}
					}

				}
			}
			$s.showSelectedModelList = $.extend(true, [], $s.phoneModelArr).reverse();
			$s.getBrandNun();
			//console.log($s.phoneModelArr)
		}

		$s.modelEllipsis = [];//已选型号过了省略
		//获取已选品牌数量
		$s.getBrandNun = function(){
			//获取所选品牌数
		   $s.arrKey = [];
		   $s.modelEllipsis = [];
		   for (var j = 0,len = $s.phoneModelArr.length; j < len; j++) {
		   		if ($s.arrKey.indexOf($s.phoneModelArr[j].brand)==-1) {
		   			$s.arrKey.push($s.phoneModelArr[j].brand);
		   		}

		   		if (j<=10) {//取出前10条
		   			$s.modelEllipsis.push($s.phoneModelArr[j]);
		   		}
		   }


		}

		//获取手机规格信息
		// var getPhoneInfo = function(arr,name){
		// 	for (var i = 0; i < arr.length; i++) {
		// 		if (arr[i].name == name) {
		// 			return $.extend(true,[],JSON.parse(arr[i].list));
		// 		};
		// 	};
		// }

		var standardNameJson = {};
		//去重
		var duplicateRemoval = function(obj,arr){
			for (var i = 0; i < arr.length; i++) {
				if (obj.indexOf(arr[i])==-1) {
					obj.push(arr[i]);
				};
			};

			return obj;
		}
		var getSpecifiDetailList = function(arr){//从规格里取出name
			var newArr = [];
			for (var i = 0; i < arr.length; i++) {
				newArr.push(arr[i].name);
			}
			return newArr;
		}
		var getPhoneStandard = function(arr){
			for (var i = 0; i < arr.length; i++) {
				if (!standardNameJson[arr[i]['name']]) {
					standardNameJson[arr[i]['name']] = []
				};
				var list = arr[i]['specifiDetailList'];
				if (typeof arr[i]['specifiDetailList'] != 'object') {
					list = JSON.parse(arr[i]['specifiDetailList']);
				};
				
				if (arr[i]['specifiDetailList'].length>0) {
					standardNameJson[arr[i]['name']] = duplicateRemoval( standardNameJson[arr[i]['name']],getSpecifiDetailList(list) );
					
				};
			};

			//console.log(standardNameJson)
		}
		//已选好的型号
		$s.phoneStandard = [];//手机的存储空间（内存）先存在这里

		// 获取扣款原因
		$s.defaultSelecteds = [1,2,3,4,5,8];//默认选中1 2 3 4 5 8
		var getYourReason = function(obj,j,fn){
			req.jsonp({
				url:base_url + "/systemset/withholdReasonAdd/reasonAddList.do",
				data:{
					linkSn: obj.sn,//型号sn
					parentSn: obj.categoryManageSn,//品牌sn
					typeValue: 2,
					token:token
				},
				success: function(d){
					if (d.code == 'BUS0000') {
						d = d.data;
						var reasonArr = [];
						
						for (var i = 0; i < d.length; i++) {
							reasonArr.push({
								name: d[i].reason,
								checked: true,//扣款原因默认全选
								sn: d[i].sn
							})
						};
						obj.reason = $.extend(true,[],reasonArr);
						//console.log(obj.reason)
						fn&&fn(j);
					};
				},
				error: function(e){
					
				}
			});
		}
		//获取等级列表
		var getGradeList = function(){
			//获取等级列表
			req.jsonp({
				url:base_url + "/systemset/gradeManage/findAll.do",
				data:{token:token},
				success: function(d){
					if (d.code == 'BUS0000') {
						// for (var j = 0; j < d.data.length; j++) {
						// 	if (d.data[j].gradeName=='E') {
						// 		d.data.splice(j,1);
						// 		j--;
						// 	};
						// };
						$s.gradeList = d.data;
						$.map($s.gradeList,function(o,i){
							o.price = '';
							o.number = '';
							o.grade = o.gradeName;
							o.checked = false;//默认全部不选中
							return o;
						});
						$s.isStandardValue = false;
						//console.log($s.phoneModelArr)
						//console.log(1122)
						for (var i = 0; i < $s.phoneModelArr.length; i++) {
							if (!!$s.phoneModelArr[i].standardValue&&$s.phoneModelArr[i].standardValue!='[]') {
								$s.isStandardValue = true;
								break;
							};
						};
						layer.closeAll();
						
						
						if (!$s.isStandardValue) {//如果没有规格值则直接跳过第3步
							$s.confirmSpecification();
						}else{
							$s.flow = 3;
						}
						$s.$apply();
					};
					////console.log($s.phoneModelArr)
					////console.log('------')
				},
				error: function(e){
					
				}
			});
		}
		$s.selectedModel = function(){

			// for (var k = 0; k < $s.modelList.length; k++) {
			// 	if ($s.modelList[k].checked) {
			// 		$s.phoneModelArr.push($.extend(true, [], $s.modelList[k]));
			// 	}
			// }
			if ($s.phoneModelArr.length==0) {
				layer.msg('请选择手机型号！');return;
			};
			layer.load(0,{shade:[0.1, '#fff']});
			$s.phoneStandard.length = 0;
			choiceStandardJson = {};//规格
			for (var i = 0; i < $s.phoneModelArr.length; i++) {
				var _v = $s.phoneModelArr[i].standardValue;
				getYourReason($s.phoneModelArr[i],i,function(j){
					if (j == $s.phoneModelArr.length-1) {
						getGradeList();
					};
				});//获取扣款原因
				if ( _v.indexOf('[')>=0 ) {
					var arr = JSON.parse( _v );
					if (arr.length>0) getPhoneStandard(arr)
				};

			};

			// console.log(standardNameJson)
			for(var attr in standardNameJson){
				$s.phoneStandard.push({
					name: attr,
					list: function(){
						var arr = standardNameJson[attr].unique();
						var newArr = [];
						for (var i = 0; i < arr.length; i++) {
							newArr.push({
								 spec:arr[i],
								 checked:false
							})
						}
						return newArr;
					}()
				})
			}

			//console.log($s.phoneStandard)
			//console.log(11)
			
		}

		//选择规格
		var choiceStandardArr = [];//选择的规格
		var choiceStandardJson = {};//选择的规格Json
		$s.choiceMemory = function(c,name,event){

			c.checked = !c.checked;

			if (!choiceStandardJson[name]) {
				choiceStandardJson[name] = [];
			};

			if (c.checked) {
				choiceStandardJson[name].push(c.spec)
			}else{
				choiceStandardJson[name].splice(choiceStandardJson[name].indexOf(c.spec),1)
			}

			if (choiceStandardJson[name].length==0) {
				delete choiceStandardJson[name];
			};

			console.log(choiceStandardJson)
		}
		//规格全选与不选
		$s.all_spec = function(){
			
			$s.specChecked = !$s.specChecked;
			
			for (var i = 0; i < $s.phoneStandard.length; i++) {
				var d = $s.phoneStandard[i];
				choiceStandardJson[d.name] = [];
				for (var j = 0; j < d.list.length; j++) {
					var c = d.list[j];
					c.checked = $s.specChecked;
					if ($s.specChecked) {//全选
						choiceStandardJson[d.name].push(c.spec);
					}else{//全不选
						choiceStandardJson = {};
					}
				}
			}
			console.log(choiceStandardJson)
		}
		
		//把规格拼接在一起
		function doExchange(doubleArrays,arr){
			// console.log(doubleArrays)
		    var len=doubleArrays.length;
		    if(len>=2){
		        var len1=doubleArrays[0].length;
		        var len2=doubleArrays[1].length;
		        var newlen=len1*len2;
		        var temp=new Array(newlen);
		        var index=0;
		        for(var i=0;i<len1;i++){
		            for(var j=0;j<len2;j++){
	               		 temp[index]=doubleArrays[0][i]+ '//'+doubleArrays[1][j];
	               		 index++;
		            }
		        }
		        var newArray=new Array(len-1);
		        for(var i=2;i<len;i++){
		            newArray[i-1]= doubleArrays[i];
		        }

		        newArray[0]=temp;
		        return doExchange(newArray,arr);
		    }else{

		        return doubleArrays[0];
		    }
		}
		var duplicate = function(brr,str){//去掉没有的规格
			if (brr.length==0) return '';//没有规格
			var arr = str.split('//');
			for (var i = 0; i < arr.length; i++) {
				if (brr.indexOf(arr[i])==-1) {
					arr.splice(i,1);
					i--;
				};
			};

			var spec = arr.join('//');
			
			if (brr.length>0&&spec=='') {
				return 'false';//如果有规格的 spec还是为空的话说明匹配不到 返回'false'作为判断
			}
			return spec;
		}
		
		var guigeFn = function(json){//把该型号的是所有规格都弄到一个数组里
			var arr = [];
			json = json==''?'[]':json;
			if (typeof json == 'string') {
				json = JSON.parse( json );
			};
			for (var i = 0; i < json.length; i++) {
				if (typeof json[i].specifiDetailList == 'string') {
					json[i].specifiDetailList = JSON.parse(json[i].specifiDetailList);
				};
				// Array.prototype.push.apply(arr, json[i].specifiDetailList );  
				Array.prototype.push.apply(arr, getSpecifiDetailList(json[i].specifiDetailList) );  
			};
			return arr;
		}
		//第4步确认规格
		var btnOff = false;
		$s.gradeSelect = function(c,index){//等级全选与不选
			//var _checked = $(event.currentTarget).prop('checked');
			btnOff = true;
			c.checked = !c.checked
			var _checked = true;
			for (var i = 0; i < $s.phoneSpecification.length; i++) {
				var d = $s.phoneSpecification[i];
				for (var j = 0; j < d.offerList.length; j++) {
					if (c.gradeName == d.offerList[j].gradeName && !d.offerList[j].checked) {
						_checked = false;
						break;
					}
				}
			}
			$s.checkboxChoiceList[index].checked = _checked;
			
		}
		$s.setBtnOff = function(){
			btnOff = false;
		}

		$s.allGradeSelect = function(allSelect){
			btnOff = false;
			for (var i = 0; i < $s.checkboxChoiceList.length; i++) {
				$s.checkboxChoiceList[i].checked = !allSelect;
			}
		}
		$s.phoneSpecification = [];
		$s.confirmSpecification = function(){
			if ($s.phoneModelArr.length==0) {
				layer.msg('您还未选中品牌型号');return;
			}
			layer.load(0,{shade:[0.1, '#fff']});
			
			setTimeout(function(){
				var arr = [];
				for(var attr in choiceStandardJson){
					arr.push(choiceStandardJson[attr])
				}
				console.log(arr)
				//['S7562i//16G','S7562i//32G']
				var specificationArr = doExchange( $.extend(true, [], arr) )||[];
				//console.log(specificationArr)

				// if (specificationArr.length==0) {
				// 	layer.msg('请至少选择一项');return;
				// };
				$s.phoneSpecification.length = 0;

				$s.checkboxChoiceList = $.extend(true, [], $s.gradeList);//checkbox选择等级专用

				//监听勾选状态
				$.map($s.checkboxChoiceList,function(o,i){
					$s.$watch('checkboxChoiceList['+i+'].checked',function(newVal,oldVal){
						//console.log(btnOff)
						var checked = true;
						for (var i = 0; i < $s.phoneSpecification.length; i++) {
							var d = $s.phoneSpecification[i];
							for (var j = 0; j < d.offerList.length; j++) {
								if (o.gradeName == d.offerList[j].gradeName && !btnOff) {
									d.offerList[j].checked = newVal;
								}
								if (!d.offerList[j].checked) {
									checked = false;
								}
							}
						}
						$s.allSelect = checked;
						//console.log(o)
					},true);
				})

				var specificationUnique = {};//去除重复用
				for (var i = 0,p_len =  $s.phoneModelArr.length; i < p_len; i++) {//型号

					//本身的规格如['16G','32G']
					var itselfSpecificationArr = guigeFn( $s.phoneModelArr[i].standardValue );
					
					var _brand = $s.phoneModelArr[i].brand;//手机品牌
					var _phone = $s.phoneModelArr[i].promodelName;//手机型号 把多余的空格去掉
					var _v = $s.phoneModelArr[i].standardValue;
					var _sn = $s.phoneModelArr[i].sn;
					var _parentSn = $s.phoneModelArr[i].categoryManageSn;
					var _reason = $s.phoneModelArr[i].reason||[]; //扣款原因
					//console.log(itselfSpecificationArr)
					
					if (specificationArr.length==0) {//所有机型都没有规格值走这里
						$s.phoneSpecification.push({
							phoneName: _brand+' '+ _phone,
							sn: _sn,//型号sn
							parentSn: _parentSn,//品牌sn
							offerList: $.extend(true,[],$s.gradeList), //等级列表
							reason: $.extend(true,[],_reason) //扣款原因
						})
					}else{
						for (var j = 0,s_len=specificationArr.length; j < s_len; j++) {
							// console.log(itselfSpecificationArr)
							var specVal = duplicate( itselfSpecificationArr, specificationArr[j] );

							if (specVal!="false") {//为false的话就是有规格的型号缺没有匹配到规格
								
								var phoneName = _brand+' '+_phone+' '+specVal.replace(/\/\//g,' ');
								var key = phoneName.replace(/\s+/g,'');

								if (!specificationUnique[key]) {//重复的就不需要进来了
									specificationUnique[key] = true;
									$s.phoneSpecification.push({
										phoneName: phoneName,
										spec: specVal,//规格
										sn: _sn,//型号sn
										parentSn: _parentSn,//品牌sn
										offerList: $.extend(true,[],$s.gradeList), //等级列表
										reason: $.extend(true,[],_reason) //扣款原因
									})
								}
							}
						};	
					}
				};
				//console.log($s.phoneSpecification.length)
				setTimeout(function(){
					$.placeholder($('.delete_line input'));
					layer.closeAll();
				},5)
				$s.flow = 4;
				$s.$apply();
			},500)
		}

		//已选货物导出
		$s.goodsExport = function(){
			// layer.load(0,{shade:[0.1, '#fff']});
			// console.log(JSON.stringify( $s.phonePurchase ))
			// return
			req.form({
				url:base_url +"/systemset/modelManage/exportOffer.do",
				type:'post',
				export:true,
				data: {
					goodsMapList:JSON.stringify( $s.phonePurchase )
				},
				success: function(d){
					layer.closeAll();
					if (d.code == "BUS0000") {
						
					}else{
						layer.msg(d.msg||'服务器繁忙，订单提交失败！');
					}
				},
				error: function(e){
					//layer.msg('服务器繁忙，订单提交失败！', {icon: 5,shade:[0.1, '#333'],time:2000});
					// alert('失败！')
				}
			});
		}

		//已选货物导入
		$('#goodsImportFile').change(function(){
			var $this = $(this);
			layer.msg('请稍后，导入中...', {icon: 16,shade:[0.1, '#333'],time:200000});
			req.form({
				url: base_url + "/systemset/modelManage/importOffer.do",
				formId: 'goodsImportForm',
				type: 'post',
				success: function(data){
					console.log(22)
					console.log(data)
					layer.closeAll();
					if (data.code == "BUS0000") {
						$s.phonePurchase = data.data;
						$s.$apply();
					}else{
						layer.msg(data.msg);
					}
					$this.val('');
				},
				error: function(data){
					console.log('错误：'+data)
					$this.val('');
					layer.closeAll();
					layer.msg('服务器无响应，导入失败！', {icon: 5,shade:[0.1, '#333']});
				}
			});
		})

		//添加更多机型
		//$s.selectedGoodsList = [];//已选好的货物
		//$s.showGoodsList = [];//点击更多显示的货物列表
		$s.addMoreGoods = function(){
		   $s.flow = 4;
		   // $s.selectedGoodsList = $.extend(true, [], $s.phonePurchase);
		   // $s.showGoodsList = [];//点击更多显示的货物列表
		   // //去掉品牌和型号重复的
		   // var jsonKey = {};
		   // for (var i = 0; i < $s.selectedGoodsList.length; i++) {
		   // 		if (!jsonKey[$s.selectedGoodsList[i].brand+''+$s.selectedGoodsList[i].promodelName]) {
		   // 			jsonKey[$s.selectedGoodsList[i].brand+''+$s.selectedGoodsList[i].promodelName] = true;
		   // 			$s.showGoodsList.push($s.selectedGoodsList[i]);
		   // 		}
		   // }
		   //console.log($s.showGoodsList)
		}


		//重新选择型号提示弹框
		$s.againChoicePrompt = function(){
			layer.open({
				title: '温馨提示',
				// width: '550px',
				// height: 'auto',
				fixed: true,
				btn: ['确定','取消'],
				area: ['500px','200px'],
				content: `
						<p style='text-align: center;'>
							本操作将会把之前已选择的机型信息清空，确定要重新选择机型吗？
						</p>
						<p style='text-align: center;margin-top:8px;'>
							<span style='color: #f62d13;'>提醒：</span>如果要在现有机型基础上添加机型请选择<span style='color: #0eb83a;'>“添加更多机型”</span>。
						</p>
				`,
				success:function(obj,q){
					// var template = angular.element(obj[0]);
					// $compile(template)($s);
				},
				yes:function(){
					layer.closeAll();
					setTimeout(function(){
						$s.flow = 1;
						//$s.selectedGoodsList = [];//已选好的货物清空
						//$s.showGoodsList = [];//点击更多显示的货物列表清空
						$s.phoneModelArr = [];//已选好的型号清空
						$s.modelEllipsis = [];
					    $s.$apply();
					},200)
				}
			});
		}

		//删除规格
		$s.deleteGood = function(d){
			$s.phoneSpecification.splice($s.phoneSpecification.indexOf(d),1)
		}
		//删除货物
		$s.deleteModel = function(d){
			$s.phonePurchase.splice($s.phonePurchase.indexOf(d),1);
			if ($s.phonePurchase.length==0) {
				$s.phoneModelArr = [];//清空
			}
		}
		//确定采购
		$s.phonePurchase = [];
		//获取规格key
		var getKeyInfo = function(val){
			if (!val) return '';
			for(var attr in choiceStandardJson){
				for (var i = 0; i < choiceStandardJson[attr].length; i++) {
					if (choiceStandardJson[attr][i] == val) {
						return attr;
					}
				};
			}
		}
		$s.confirmPurchase = function(){
			layer.load(0,{shade:[0.1, '#fff']});

			setTimeout(function(){
				var list = $.extend(true,[],$s.phoneSpecification);
				//console.log($s.phoneSpecification)
				$s.phonePurchase = [];
				for (var i = 0; i < list.length; i++) {
					var phoneName = list[i].phoneName;
					var goodSn = list[i].sn;
					var reason = list[i].reason;
					var spec = list[i].spec;//规格
					for (var j = 0; j < list[i].offerList.length; j++) {
						var obj = list[i].offerList[j];
						if (obj.checked) {
							//getYourReason(list[i],obj);
							// var jsonData = 
							$s.phonePurchase.push({
								classifyName: phoneName,
								brand:brand,//品牌
								model:phoneName.split(' ')[1], //型号
								promodelName:phoneName.split(' ')[1], //型号
								grade: obj.grade,
								maxPrice: obj.price,
								number: obj.number,
								unitValue:'台',
								productCategory:'二手',
								sn: goodSn, //货物sn
								gradeSn: obj.sn,//等级sn
								goodsExplainJson: $.extend(true,[],reason), //扣款原因
								specItemJson: function(){//规格
									var itemJson = {};
									if (spec) {//有规格值
										var _name = spec.split('//');
										for (var i = 0; i < _name.length; i++) {
											var _key = getKeyInfo(_name[i]);
											if (_key) {
												itemJson[_key] = _name[i];
											}
										};
									}
									return JSON.stringify( itemJson );
								}()
							});

							//监听输入框
							(function(){
								var len = $s.phonePurchase.length-1;
								//监听报价只能输入浮点数
								$s.$watch('phonePurchase['+len+'].maxPrice',function(newVal,oldVal){
									var reg = /^\d+\.?\d*$/;
									if (newVal) {
										if (reg.test(newVal)) {
											$s.phonePurchase[len].maxPrice = newVal;
										}else{
											$s.phonePurchase[len].maxPrice = parseFloat(newVal);
										}
									};
								},true);
								//监听数量只能输入数字
								$s.$watch('phonePurchase['+len+'].number',function(newVal,oldVal){
									if (newVal) {
										$s.phonePurchase[len].number = parseInt(newVal);
									};
								},true);
							})()
							
						};
					};
				};

				if ($s.phonePurchase.length==0) {
					layer.closeAll();
					layer.msg('请至少选择一个货物的等级！');return;
				};
				console.log(11)
				console.log($s.phonePurchase)
				$s.flow = 5;
				$s.$apply();
				layer.closeAll();
			},500)
			// $s.model = true;
			// setTimeout(function(){
			// 	$('html,body').animate({'scrollTop':$('.choose_model').offset().top-15},500)
			// },50)
			
		}

		//二手原因修改
		$s.reason_modify = function(d,index){
			$s.reason = $.extend(true,[],d);
			$s.goodIndex = index;
		}
		//选择原因确定
		$s.determineReason = function(){
			$s.phonePurchase[$s.goodIndex].goodsExplainJson = $s.reason;
			$s.reason = false;//隐藏弹出框
		}
		
		$s.go_order_info = function(type){
			// if ($s.phonePurchase.length==0) {
			// 	layer.msg('您还未选择货物');
			// 	return;
			// }
			var typeList = [];
			if (type==1) {
				typeList = $.extend(true,[],$s.typeList);
			}else if(type==2){//二手
				typeList = $.extend(true,[],$s.phonePurchase);


			}

			for (var i = 0; i < typeList.length; i++) {

				if (type==2) {
					if (!typeList[i].maxPrice||typeList[i].maxPrice=='0') {
						layer.msg('报价和数量不能为空或0');
						$('.price'+i).focus();
						return;
					}
					if (!typeList[i].number||typeList[i].number=='0') {
						layer.msg('报价和数量不能为空或0');
						$('.number'+i).focus();
						return;
					}
				}

				if (!typeList[i].number) {
					typeList.splice(i,1)
					i--;
				}else if (typeList[i].maxPrice) {
					typeList[i].maxPrice = Number(typeList[i].maxPrice).toFixed(2)
				};
			};

			if (typeList.length==0) {
				layer.msg('请至少选择一个货物的数量');
				var _input = $('.buyInput');

				for (var j = 0; j < _input.length; j++) {
					if (!_input.get(j).value) {
						_input.get(j).focus();
						return;
					};
				};
				return;
			};
			// console.log(typeList)
			// return;
			LOAD.getUserInfo.done(function(d){
				window.sessionStorage.setItem("typeList", JSON.stringify( typeList ) );
				window.location.href = '/page/buy/order_info.html';
			}).fail(function(){
				LOAD.login('/page/buy/order_info.html',function(){
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