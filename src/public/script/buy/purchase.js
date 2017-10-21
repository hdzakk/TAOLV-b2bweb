// import wasteGoodsTemplate from 'components/buy/wasteGoodsTemplate.vue';
import secondHandGoodsTemplate from 'components/buy/secondHandGoodsTemplate.vue';//二手
define(['jquery','script/index/load_init','script/utils/angular','script/utils/req','script/utils/layer','vueDir'],function($, LOAD, angular, req, layer, Vue){
	var token = getStorageToken();
	var _gradeSn = "";//等级sn

	//货物分类模板
	var goodsClassifyTemplate = {
	  template: `
		<tr>
			<td style="width:210px;">{{obj.classifyName}}</td>
			<td style="width:530px;" class='txt'><input class="instructions" type="text" v-model="obj.goodsExplain" value=""></td>
			<td style="width:180px;"><input type="text" class='buyInput' style="color:#f62d13;" v-model="obj.maxPrice" value=""></td>
			<td style="width:60px;">{{obj.unitValue}}</td>
			<td style="width:220px;"><input type="text" class='buyInput' v-model="obj.number" value=""></td>
		</tr>
	  `,
	   props: {
	  	obj:{
	  		type: Object,
	  	}
	  },
	  watch:{
	  	 obj:{
	  	 	handler:(obj)=>{
	  	 		var reg = /^\d+\.?\d*$/;
                //数量
                
					var unit = obj.unitValue;
					if (obj.number!='') {
						if (/\d+\.?/.test(obj.number)) {
							if(unit == '公斤' || unit == '斤' || unit == '千克' || unit == 'kg'){
								if (!reg.test(obj.number)&&obj.number) {
									obj.number = parseFloat(obj.number);
								}
							}else{
								obj.number = parseInt(obj.number);
							}

						}else{
							obj.number = obj.number.replace(/[^\d+]/,'');
						}
					}
				
				//报价
				if (obj.maxPrice) {
					if (/\d+\.?/.test(obj.maxPrice)) {
						if (!reg.test(obj.maxPrice)&&obj.maxPrice) {
							obj.maxPrice = parseFloat(obj.maxPrice);
						}
					}else{
						obj.maxPrice = obj.maxPrice.replace(/[^\d+]/,'');
					}
				}
	  	 	},  
            deep:true//对象内部的字段监听，深度监听  
	  	 }
	  }
	}
	var vm = new Vue({
	  el: '#buy_content',
	  data: {
	  	categoryList:[
			{'typeName':'手机'},
			{'typeName':'二手'},
			{'typeName':'平板数码'},
			{'typeName':'大家电'},
			{'typeName':'内存卡'},
			{'typeName':'小家电'}
		],
		isSecond:false,//显示二手还是分类 默认显示第一条分类
		pageLoading:false,//默认隐藏等待数据加载完才显示内容
		typeList:[]//货物分类名称列表
	  },
	  methods:{
	  	init(){
	  		window.sessionStorage.clear();
	  		req.jsonp({
				url:base_url + "/systemset/gradeManage/findAll.do",
				data:{token:token,gradeName:'E'},
				success: function(d){
					if (d.code == 'BUS0000') {
						_gradeSn = d.data[0].sn;
						vm.getSellClassifyInfo( vm.categoryList[0].typeName );//默认获取第一条信息
					};
				},
				error: function(e){
					
				}
			});
	  	},
	  	//tab货物分类切换
	  	clickSellClassifyInfo(name,$event,index){
	  		$($event.currentTarget).addClass('active').siblings('a').removeClass('active');
			if (index==1) {//二手
				vm.isSecond = true;
				//getSecondCategoryInfo();
				// $s.phoneModelArr = [];//已选好的型号清空
				// $s.flow = 1;
				vm.$refs.second.$children[0].getSecondCategoryInfo();//获取品牌
			}else{//货物分类
				vm.isSecond = false;
				vm.getSellClassifyInfo(name);
			}
	  	},
	  	//获取货物分类
	  	getSellClassifyInfo(name){
	  		var _name = window.sessionStorage.getItem(name);
			if (_name) {
				//vm.classifyInfoWatch(JSON.parse(_name));
				this.typeList = JSON.parse(_name);
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
							o.number = "";//数量默认为空
							return o;
						})
						//vm.classifyInfoWatch(d.data);
						vm.typeList = d.data;
						vm.pageLoading = true;
						layer.closeAll();
						window.sessionStorage.setItem(name, JSON.stringify(d.data));
						$('.page-loading').hide();//隐藏loding
					};
				},
				error: function(e){
					
				}
			});
	  	},
	  	//选好下单
		go_order_info(type){
			var typeList = [];
			if (type==1) {
				typeList = $.extend(true,[],vm.typeList);
			}else if(type==2){//二手
				typeList = $.extend(true,[],vm.phonePurchase);
			}

			for (var i = 0; i < typeList.length; i++) {
				if (type==2) {
					if (!typeList[i].number||typeList[i].number=='0') {
						layer.msg('报价和数量不能为空或0');
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
	  },
	  components: {
	    'tr-component': goodsClassifyTemplate,
	    'second-hand': {
	    	render: h => h(secondHandGoodsTemplate)
	    }
	    // 'second-hand': datum
	  },
	  created(){
	  	this.init();
	  },
	  mounted(){
	  },
	  delimiters:['((', '))']  
	})
})