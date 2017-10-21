<template>	
	<div id="second_hand" class="second_hand">
		<!-- 第一步 -->
		<div class="middle brand_models select_brand" v-show="flow==1">
			<div class="iPhone_model" style="line-height: 33px;">
				<p class='model_title'>
					<span class='fl' style="color: #333;font-size: 16px;">第一步：选择品牌型号</span>
					<span class='fr' :style="{'padding-right':modelEllipsis.length>0?'100px':'0'}">已选型号：<font v-for="(d,$index) of modelEllipsis">{{d.brand+''+d.promodelName}}<i v-if="$index<modelEllipsis.length-1">，</i></font><font v-if="modelEllipsis.length==0">无</font></span>
					<button v-show="modelEllipsis.length>0" class="look" @click="lookMoreGoods()">查看更多</button>
				</p>
				<p class='tips'>请选择要采购的品牌</p>
			</div>
			<div class="choose_brand ">
				<button :title="d.brand" class='no' v-for="d of secondList" @click="choiceBrand(d)">
					<img :src="d.brandLogo"/>
				</button>
			</div>
		</div>

		<!-- 第二步 -->
		<div class="middle brand_models select_models" v-show="flow==2">
			<div class="iPhone_model">
				<p class='model_title'>
					<span class='fl' style="color: #333;font-size: 16px;">第一步：选择品牌型号</span>
					<span class='fr' :style="{'padding-right':modelEllipsis.length>0?'100px':'0'}">已选型号：<font v-for="(d,$index) of modelEllipsis">{{d.brand+''+d.promodelName}}<i v-if="$index<modelEllipsis.length-1">，</i></font><font v-if="modelEllipsis.length==0">无</font></span>
					<button v-show="modelEllipsis.length>0" class="look" @click="lookMoreGoods()">查看更多</button>
				</p>
				<div>
					<p class="fl" style="color: #0eb83b;">请选择要采购的型号（单击选择）</p>
					<input id="searchVal" class="fl" type="text" ng-model="searchVal" placeholder="请输入关键词">
					<i class="fl" ng-click="modelSearch()"><img src="../../images/buy/2.png" alt=""></i>
				</div>
				<!-- <p class="fr"><button ng-click="flow=1" class="again">重新选择品牌</button></p> -->
			</div>
			<div class="mobilePhone_model scrollBar">
				<a @click="choicePhoneModel(d,$event)" v-for="d of modelList" :key="d.sn" :class="{on:d.checked}">
					<img :src="d.productPic">
					<!-- <b style="background-image:url(((d.productPic)))"></b> -->
					<p>{{d.brand}} {{d.promodelName}}</p>
				</a> 
	
				<!-- <a ng-click="choicePhoneModel(d,$event)" v-for="d of modelList" :class="{on:d.checked}">
					<img :src="((d.productPic))">
					<p>((d.brand)) ((d.promodelName))</p>
				</a> -->

				<p v-if="modelList.length==0" style="text-align: center;margin-top: 40px;font-size: 16px;margin-bottom: 30px;">找不到与<em style="color:#f62d13;">“((searchVal))”</em>相关的型号</p>
			</div>
			<div class="future_generations">
				<button class="been_chosen" @click="flow=1;searchVal='';">添加其他品牌</button>
				<button class="all_cancelled" @click="all_cancelled()" v-show="modelList.length>0">全选/取消</button>
				<button class="been_chosen" @click="selectedModel()">下一步</button>
			</div>
		</div>
		<!-- 第三步 -->
		<div class="middle brand_models select_specifications select_models" v-show="flow==3">
			<!-- <div class="information">
				<p class="fl" style="color: #0eb83b;">第二步：选择对应型号要采购的规格信息</p>
				<p class="fr"><button ng-click="flow=1" class="again">重新选择品牌</button></p>
			</div> -->
			<div class="iPhone_model">
				<p class='model_title'>
					<span class='fl' style="color: #333;font-size: 16px;">第一步：选择品牌型号</span>
					<span class='fr' :style="{'padding-right':modelEllipsis.length>0?'100px':'0'}">已选型号：<font v-for="(d,$index) of modelEllipsis">{{d.brand+''+d.promodelName}}<i v-if="$index<modelEllipsis.length-1">，</i></font><font v-if="modelEllipsis.length==0">无</font></span>
					<button v-show="modelEllipsis.length>0" class="look" @click="lookMoreGoods()">查看更多</button>
				</p>
				<!-- <div>
					<p class="fl" style="color: #0eb83b;">请选择要采购的型号（单击选择）</p>
					<input id="searchVal" class="fl" type="text" ng-model="searchVal" placeholder="请输入关键词">
					<i class="fl" ng-click="modelSearch()"><img src="<%= require('images/buy/2.png')%>" alt=""></i>
				</div> -->
			</div>

			<p ng-repeat="d in phoneStandard track by $index" style="(($index==0?'margin-top:25px;':''))">
				<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;((d.name))：</span>
				<em>
					<button ng-repeat="c in d.list track by $index" ng-click="choiceMemory(c,d.name,$event)" ng-class="{selected:c.checked}">((c.spec))</button>
				</em>
			</p>
			
			<p style="text-align:center;margin-top:30px;" ng-init="specChecked=false;">
				<a class="confirm" ng-click="flow=1">选择更多型号</a>
				<a class="confirm all_spec" ng-click="all_spec()">全选/取消</a>
				<a class="confirm" ng-click="confirmSpecification()">下一步</a>
			</p>
		</div>
		<!-- 第四步 -->
		<div class="middle brand_models select_level" v-show="flow==4">
			<div class="level_purchasing">
				<div style="height:40px;lien-height:40px;">
					<p class="fl" style="color: #333;font-size: 16px;">第三步：选择采购等级</p>
					<!-- <p class="fr"><button ng-click="flow=1" class="again">重新选择品牌</button></p> -->
				</div>
				<div>
					<span class='fl'>等级说明：</span>
					<p class='fr' style="width: 93%;">
						<i ng-repeat="d in gradeList track by $index">【((d.gradeName))】((d.describeValue))。</i>
					</p>
				</div>
				
			</div>
			<table cellpadding="0" cellspacing="1" border="0" class="purchasing_form" bgcolor="#ddd">
				<thead style="background:#ddd;">
					<th style="min-width:250px;max-width:250px;">货物名称</th>
					<th style="min-width:730px;max-width:730px;">请选择要采购的等级</th>
					<th style="width:85px;">操作</th>
				</thead>
				<tbody class="delete_line">
					<tr ng-repeat="d in phoneSpecification track by $index">
						<td>((d.phoneName))</td>
						<!-- <td>
							<em ng-repeat="c in d.offerList track by $index">
								&nbsp;((c.grade)) <input ng-model="c.price" type="text" placeholder="报价">&nbsp;<input ng-model="c.number" type="text"placeholder="数量">
							</em>
						</td> -->
						<td>
							<button ng-repeat="c in d.offerList track by $index" ng-class='{selected:c.checked}' ng-click="gradeSelect(c,$index)"> 
								((c.grade))等级
							</button>
						</td>
						<td><a href="javascript:;" ng-click="deleteGood(d)">删除</a></td>
					</tr>
				</tbody>
			</table>
			<div class='choiceGrade'>
				<ul class='g_center'>
					<li ng-repeat="d in checkboxChoiceList track by $index">
						<label>
							<input ng-click="setBtnOff()" ng-model="d.checked" value="checkbox" type="checkbox"><i>✓</i>((d.grade))全选
						</label>
					</li>
				</ul>
				<p class='whole' ng-init="allSelect = false;">
					<label>
						<input ng-model="allSelect" value="checkbox" type="checkbox" ng-click="allGradeSelect(allSelect)"><i>✓</i>全选选择
					</label>
				</p>
			</div>
			<div class="confirm_rating">
				<button ng-click="flow=(isStandardValue?3:1)">((isStandardValue?'重选规格信息':'重新选择品牌'))</button>
				<button ng-click="confirmPurchase()">确定采购等级</button>
			</div>
		</div>
		<!-- 已采购型号 -->
		<div class="middle choose_model" v-show="flow==5">
			<!-- <p>已选采购型号</p> -->
			<div class="iPhone_model" style="height:40px;lien-height:40px;margin-top:6px;">
				<p style="color: #333;font-size: 16px;">
					<span class='fl'>第四步：确认已选采购型号</span>
					<span class='fr'>
						<button ng-click="addMoreGoods()">添加更多机型</button>
						<button ng-click="againChoicePrompt()">重新选择型号</button>
					</span>
				</p>
			</div>
			<table class="add_table" cellpadding="0" cellspacing="0" border="0">
				<thead>
					<th>货物名称</th>
					<th>等级</th>
					<th>报价(元)</th>
					<th>采购数量</th>
					<th>单位</th>
					<th><span style="color: #f62d13;">请选择您可以接受的扣款原因</span>
					<!-- ，默认选择<span ng-repeat="val in defaultSelecteds">(($index!=0?',':''))((val))</span> --></th>
					<th>操作</th>
				</thead>
				<tbody>
					<tr ng-repeat="d in phonePurchase track by $index">
						<td>((d.classifyName))</td>
						<td class="level_good">((d.grade))</td>
						<td class="offer"><input ng-model="d.maxPrice" type="text"></td>
						<td class="purchase_quantity"><input ng-model="d.number" type="text"></td>
						<td class="unit">((d.unitValue))</td>
						<td class="goods_that">
							<!-- <label ng-repeat="n in d.goodsExplainJson"><input ng-model="n.checked" ng-checked="n.checked" type="checkbox">((n.name))</label> -->
							<a ng-click="reason_modify(d.goodsExplainJson,$index)" class="reason_modify" href="javascript:;">查看扣款项</a>
						</td>
						<td class="operation" style="width:50px;">
							<a href="javascript:;" ng-click="deleteModel(d)">删除</a>
						</td>
					</tr>
					<tr ng-if="phonePurchase.length==0">
						<td colspan="7">请选择货物</td>
					</tr>
				</tbody>
			</table>
			<div class="jump">
				<a href="javascript:;" @click="go_order_info(2)">委托采购</a>
				<a href="/page/buy/index.html" class="gray">查看现货资源</a>
			</div>
		</div>
		
		<!-- 已选品牌型号查看更多 -->
		<!-- <div id="lookMoreBox">
			<div class="lookMoreBox">
				<div class="goodsSearch">
					<input id="goodsSearchVal" class="fl" type="text" v-model="goodsSearchVal" placeholder="请输入关键词">
					<i class="fl" @click="modelGoodsSearch()"><img src="../../images/buy/2.png" alt=""></i>
				</div>
				<p class="more_title">已选 <i>{{arrKey.length||0}}</i> 个品牌，<i>{{phoneModelArr.length||0}}</i> 个型号</p>

				<div class="warpGoods scrollBar" :style="{'padding-right':(showSelectedModelList.length>=8?'10px':'0px')}">
					<table cellpadding="0" cellspacing="0" border="0">
						<thead>
							<th>序号</th>
							<th>品牌</th>
							<th>型号</th>
							<th>操作</th>
						</thead>
						<tbody>
							<tr v-for="d of showSelectedModelList">
								<td style="width:40px;">{{$index+1}}</td>
								<td>{{d.brand}}</td>
								<td>{{d.promodelName}}</td>
								<td style="width:40px;"><a href="javascript:;" @click="modelGoodsDelete(d,$index)">删除</a></td>
							</tr>
							<tr v-if="showSelectedModelList.length==0">
								<td colspan="4">暂无相关的品牌型号</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div> -->
	</div>
</template>
<style lang="less">
	#order_info{
		font-size: 20px;
		color: red;
	}
</style>
<script>
	import LOAD from 'script/index/load_init';
	import req from 'script/utils/req';
	let brand = '';//品牌
	let arrModel = [];//全部型号临时存储
	let prebrandJson = {};//存放各个
	let _categoryManageSn = '';//品牌sn
	let choiceStandardArr = [];//选择的规格
	let choiceStandardJson = {};//选择的规格Json
	let standardNameJson = {};
	let isCheckJson = {};//判断型号有没有选上
	export default{
		data(){
			return {
				flow:1,//步骤
				secondList:[],//品牌型号列表
				modelChecked:false,//型号全部/不全选
				specChecked:false,//规格全部/不全选
				modelList:[],//型号列表
				phoneStandard:[],//手机的存储空间（内存）
				phoneModelArr:[],//已选择的型号
				arrKey:[],//已选择额品牌
				showSelectedModelList:[],//查看更多已选机型列表
				goodsSearchVal:'',//查看更多已选型号搜索的关键字
				modelEllipsis:[],//已选型号展示  -- 省略
			}
		},
		methods:{
			//获取品牌
			getSecondCategoryInfo(){
				var vm = this;
				var _name = window.sessionStorage.getItem('二手');
				if (_name) {
					vm.secondList = JSON.parse(_name);
					return;
				};
				layer.load(0,{shade:[0.1, '#fff']});
				req.jsonp({
					url:base_url_admin + "/systemset/categoryManage/brandList.do",
					success: function(d){
						if (d.code == 'BUS0000') {
							vm.secondList = d.data;
							window.sessionStorage.setItem('二手', JSON.stringify(d.data));
						};
						layer.closeAll();
			        	////console.log(d)
					},
					error: function(e){
						layer.closeAll();
						alert('页面加载失败！')
					}
				});
			},
			//判断有没有选中
			isCheckedFn(data){
				for (var i = 0; i < data.length; i++) {
					data[i].checked = false;//默认不选中
					for (var j = 0; j < this.phoneModelArr.length; j++) {
						if (data[i].promodelName == this.phoneModelArr[j].promodelName) {
							data[i].checked = true;//已选择的型号
						}
					}
				}
				this.modelList = data;
				this.flow = 2;
				arrModel = $.extend([],true,data);
			},
			//选择品牌
			choiceBrand(d){
				var vm = this;
				var key = d.sn;
				brand = d.brand;
				vm.modelChecked = false;//型号不全选恢复
				vm.specChecked = false;//规格不全选恢复

				vm.phoneStandard.length = 0;//选择的手机型号内存的总个数
				choiceStandardArr.length = 0;//选择的内存
				standardNameJson = {};//规格
				
				if (prebrandJson[key]) {
					vm.isCheckedFn(prebrandJson[key]);
					return;
				}
				
				//vm.phoneModelArr.length = 0;//选择的型号
				
				$('.select_specifications .selected').removeClass('selected');//购买渠道样式删除

				vm.searchVal = '';
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
								vm.isCheckedFn(data);
								if (!prebrandJson[key]) {
									prebrandJson[key] = data;
								}
								setTimeout(function(){
									$('body,html').animate({scrollTop:$('.navigation').offset().top + 60},600); 
								},200)
								//vm.modelList = data;
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
			},
			//选择型号
			choicePhoneModel(d,event){
				d.checked = !d.checked;
				if (d.checked) {//添加
					if (!isCheckJson[d.sn]) {
						isCheckJson[d.sn] = true;
						this.phoneModelArr.push(d);
					}
				}else{//删除
					for (var i = 0; i < this.phoneModelArr.length; i++) {
						if (this.phoneModelArr[i].sn == d.sn) {
							delete isCheckJson[d.sn];
							this.phoneModelArr.splice(i,1);
							i--;
						}
					}
				}

				this.showSelectedModelList = $.extend(true, [], this.phoneModelArr).reverse();
				this.getBrandNun();
				//console.log($s.phoneModelArr)
			},
			//型号全选与全不选
			all_cancelled(){
				this.modelChecked = !this.modelChecked;
				for (var i = 0; i < this.modelList.length; i++) {
					this.modelList[i].checked = this.modelChecked;
					if (this.modelChecked) {//全选添加
						if (!isCheckJson[this.modelList[i].sn]) {
							isCheckJson[this.modelList[i].sn] = true;
							this.phoneModelArr.push(this.modelList[i]);
						}
					}else{//全选删除
						for (var j = 0; j < this.phoneModelArr.length; j++) {
							if (this.phoneModelArr[j].sn == this.modelList[i].sn) {
								delete isCheckJson[this.modelList[i].sn];
								this.phoneModelArr.splice(j,1);
								j--;
							}
						}

					}
				}
				this.showSelectedModelList = $.extend(true, [], this.phoneModelArr).reverse();
				this.getBrandNun();
				//console.log($s.phoneModelArr)
			},
			//获取已选品牌数量
			getBrandNun(){
				this.arrKey = [];
			    for (var j = 0; j < this.phoneModelArr.length; j++) {
			   		if (this.arrKey.indexOf(this.phoneModelArr[j].brand)==-1) {
			   			this.arrKey.push(this.phoneModelArr[j].brand);
			   		}
			    }
			},
			//已选择型号弹框（查看更多）
			lookMoreGoods(){
				layer.open({
					title: '已选品牌型号',
					// width: '550px',
					// height: 'auto',
					fixed: true,
					btn: ['确定','取消'],
					// skin: 'demo-class',
					area: ['490px','520px'],
					content: $('#lookMoreBox').html(),
					success:function(obj,q){
						// var template = angular.element(obj[0]);
						// $compile(template)($s);
						
					}
				});
			}
		},
		filters:{
			modelTen(v){
				console.log(v)
				return v;
			}
		},
		// created(){
		// },
		// computed:{
		// },  
		// mounted: function(){
		// },
		// components:{
		// }
	}
</script>