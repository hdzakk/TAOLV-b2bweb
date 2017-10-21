define(['jquery','script/index/slide','script/index/load_init','script/utils/req','script/utils/template-native','script/utils/superSlide'],function($, photoSlide, LOAD ,req ,template, superSlide){
	
	$('.index_main_info').on('click','button',function(){
		LOAD.login(true);//弹窗登录
	})

	// 我要买货
	function getBuyOrderInfoPage(data){
		var buyGood = 0;//货物列表
		req.jsonp({
			url:base_url + "/order/saleOrderDetail/gradeData.do",
			data: data,
			success: function(d){
				if (d.code == "BUS0000") {
					template.helper("filterName", function(name){  
						var reg = new RegExp("[^"+name.charAt(0)+"]+")
						return name.replace(reg,function(s){
							var str = '';
							for (var i = 0; i < s.length; i++) {
								str+='*';
							};
							return str;
						});
					});
					template.helper("filterTime", function(t){  
						var date = new Date(t);
						Y = date.getFullYear() + '-';
						M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
						D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + '';
						var afterDate = Y+M+D;
						return afterDate;
					})
					var buyersGoodsHtml = template('buyersGoods', d);
					if (!buyersGoodsHtml) {
						$('#good_list_tbody').html('<tr class="noHover" style="height: 270px;"><td colspan="8">暂无数据！</td></tr>');
					}else{
						$('#good_list_tbody').html( buyersGoodsHtml );
					}
					
					buyGood = d;
				};
				//console.log(d)
			},
			error: function(e){
				
			}
		});

		$('#good_list_tbody').on('click','a',function(){
			var index = $(this).data('index');
			var d = buyGood.data[index];
			if (d.goodsCategory!='二手') {
				d.withhold = '';//分类货物没有扣款原因
			};
			var j = [{
				classifyName:d.goodsName,
				goodsExplain:d.goodsExplain,
				id:1,
				number:d.goodsNum,
				productCategory:d.goodsCategory,
				maxPrice:d.goodsPrice,
				sn:d.goodsSn,
				gradeSn:d.gradeSn,
				goodsExplainJson:d.withhold.indexOf('[{')>=0?JSON.parse(d.withhold):d.withhold,
				unitValue:d.goodsUnit||'台',
				resource:true,//从资源页面下单为true
				bindingSn:d.sn,
				grade:d.gradeName||"E",
				businessSn:d.saleOrderSn,
				triageCenterSn:d.triageCenterSn,//分拣中心sn
				specItemJson:d.specItemJson,//规格
				maxNum: d.goodsNum //最大采购数量
			}]

			LOAD.getUserInfo.done(function(d){
				window.sessionStorage.setItem("typeList", JSON.stringify( j ) );
				window.open('/page/buy/order_info.html')
			}).fail(function(){
				LOAD.login('/page/buy/order_info.html',function(){
					window.sessionStorage.setItem("typeList", JSON.stringify( j ) );
				})
			});
		})
	}
	getBuyOrderInfoPage({
		start:1,
		length:7,
		goodsCategory: '',//货物分类
		goodsName: '',//货物名称
		recoverCity: ''//所在地
	})
	//我要卖货
	function getSellOrderInfoPage(data){
			var sellGood = 0;
			req.jsonp({
				url:base_url + "/buyOrderDetail/findBuyOrderDetailModelExtendListByOther.do",
				// url:"http://test.taolv365.me:8080/taolv_b2b_www/buyOrderDetail/findBuyOrderDetailModelExtendListByOther.do",
				data: {
					pageNum:data.pageNum,
					pageSize:data.pageSize,
					json: JSON.stringify(data.json)
				},
				success: function(d){
					if (d.code == "BUS0000") {
						template.helper("filterName", function(name){  
							var reg = new RegExp("[^"+name.charAt(0)+"]+")
							return name.replace(reg,function(s){
								var str = '';
								for (var i = 0; i < s.length; i++) {
									str+='*';
								};
								return str;
							});
						});
						template.helper("filterTime", function(t){  
							var date = new Date(t);
							Y = date.getFullYear() + '-';
							M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
							D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + '';
							var afterDate = Y+M+D;
							return afterDate;
						})

						var sellersGoodsHtml = template('sellersGoods', d);
						sellersGoodsHtml=sellersGoodsHtml?sellersGoodsHtml:'暂无数据！';
						if (!sellersGoodsHtml) {
							$('.good_list_ul').html( '<p style="text-align: center;height: 100%;line-height: 380px;">暂无数据！</p>' );
						}else{
							$('.good_list_ul').html( sellersGoodsHtml );
						}
						sellGood = d;
					};
					//console.log(d)
					//console.log(11)
				},
				error: function(e){
					
				}
			});

			$('.good_list_ul').on('click','.btn_supply',function(){
				var index = $(this).data('index');
				var d = sellGood.data[index];
				
				var j = [{
					classifyName:d.buyOrderDetail.goodsName,
	                goodsExplain:"",
	                id:d.id,
	                maxPrice:'',
	                minPrice:'',
	                number:d.buyNum,//数量
	                productCategory:d.buyOrderDetail.goodsCategoryName,//货物名称
	                referencePrice:d.buyPrice,//价格
	                sn:d.buyOrderDetail.goodsSn,//sn
	                unitValue:d.buyOrderDetail.goodsUnit,
	                gradeName:d.gradeName,//等级
					gradeSn:d.gradeSn //等级sn
				}]

				LOAD.getUserInfo.done(function(d){
					if (sellGood) {
						window.sessionStorage.setItem("typeList", JSON.stringify( j ) );
						window.open('/page/sell/order_info.html')
					};
				}).fail(function(){
					LOAD.login('/page/sell/order_info.html',function(){
						window.sessionStorage.setItem("typeList", JSON.stringify( j ) );
					})
				});
			})
	}
	getSellOrderInfoPage({
			pageNum:1,//页数
			pageSize:3,//每页的条数
			json: {
				goodsCategory:'',//货物类型
				goodsName  :'',//货物名称
				sendCity:''//交货地
			}
		});
	//资讯动态
	req.jsonp({
		url:base_url + "/recommendedBitNewsRelation/getRecommendedBitNewsBySite.do",
		data: {belongSite: '首页'},
		success: function(d){
			if (d.code == 'BUS0000') {
				if(d.data.SYLB){//首页轮播
					homeCarousel(d)
				}else{
					$('#wrap_home').addClass('show');
					$('.page-loading,#banner').remove();
				};
				taolvDongtai(d);//淘绿动态
				hezuoHuoban(d);//合作伙伴
			};
		},
		error: errorMsg
	});
	//首页轮播
	function homeCarousel(d){
		//console.log(d.data.SYLB)
		template.helper("bannerParameter", function(d,bitSn,lm){  
			// 获取跳转url
			if (!d) return;
	        var href = '';
			if (d.templateCode == "WZ") {
				href = '/page/zixun/recommended_details.html?bitSn='+bitSn+'&sn='+d.newsSn+'&lm='+lm;
			}else if (d.templateCode == "SP") {
				href = '/page/zixun/vid_details.html?bitSn='+bitSn+'&sn='+d.newsSn+'&lm='+lm;//+'&playUrl='+d.url;
			}else{
				href = d.url;
			}
			return {
				url: href
			}
	    });

	    if (d.data.SYLB.newsList.length>0&&d.data.SYLB.newsList) {
			var GGDT_html = template('script_banner', d.data);
			$('#home_banner').html( GGDT_html );
			photoSlide({
				obj:$('.slide'),
				contact:true,
				auto:true
			});
			var img = new Image();
			img.src = d.data.SYLB.newsList[0].imageUrl;

			img.onload = function(){
				$('#wrap_home').addClass('show');
			    $('.page-loading').remove();
			}
		}else{
			$('#banner').remove();
		}
		if (d.data.SYLB.status==1) {
			$('#banner').remove();
		};
	}
	//热门行情
	function hotMarket(data,fn){
		req.jsonp({
			url:base_url + "/systemset/phoneMarket/data.do",
			data: data,
			success: function(d){
				if (d.code == 'BUS0000') {
					fn&&fn(d);//废旧手机
				};
			},
			error: function(e){
				
			}
		});
	}
	//废旧手机
	hotMarket({type:2},function(d){
		if (d.data.length>0) {
			var script_waste = template('script_waste', d);
			$('#waste_phone_ul').html( script_waste );
			$(".waste_phone_slide").slide({titCell:".hd ul",mainCell:".bd ul",autoPage:true,effect:"left",autoPlay:false,vis:5});
		}else{
			$('#waste_phone_ul').html( '<p style="text-align: center;margin-top: 30px;">暂无数据！</p>' );
		}
	});

	//获取二手品牌
	var $tab_btn = $('.tab_btn');
	$tab_btn.on('click','i',function(){
		$(this).addClass('cur').siblings('i').removeClass('cur');
		var brandSn = $(this).data('sn');
		hotMarket({type:1,brandSn:brandSn},second_phone_html);//默认请求第一条
	})
	function second_phone_html(d){
		if (d.data.length>0) {
			var script_second = template('script_second', d);
			$('#second_phone_ul').html( script_second );
			$(".second_phone_slide").slide({titCell:".hd ul",mainCell:".bd ul",autoPage:true,effect:"left",autoPlay:false,vis:5});
		}else{
			$('#second_phone_ul').html( '<p style="text-align: center;margin-top: 30px;">暂无数据！</p>' );
		}
	}
	req.jsonp({
		url:base_url + "/systemset/phoneMarket/brandList.do",
		data: {type:1},
		success: function(d){
			if (d.code == 'BUS0000') {
				
				if (d.data.length>0) {
					var _i = '';
					for (var i = 0; i < d.data.length; i++) {
						var cur = i==0?'class="cur"':'';
						_i += '<i '+cur+'  data-sn='+d.data[i].brandSn+'>'+d.data[i].brand+'</i>'
					};
					$tab_btn.html(_i);
					hotMarket({type:1,brandSn:d.data[0].brandSn},second_phone_html);//默认请求第一条
				}else{
					$('#second_phone_ul').html( '<p style="text-align: center;margin-top: 30px;">暂无数据！</p>' );
				}
			};
		},
		error: function(e){
			
		}
	});

	//淘绿动态
	function taolvDongtai(d){
		template.helper("parameter", function(d,bitSn,lm){  
			// 获取跳转url
	        var href = '';
			if (d.templateCode == "WZ") {
				href = '/page/zixun/recommended_details.html?bitSn='+bitSn+'&sn='+d.newsSn+'&lm='+lm;
			}else if (d.templateCode == "SP") {
				href = '/page/zixun/vid_details.html?bitSn='+bitSn+'&sn='+d.newsSn+'&lm='+lm;//+'&playUrl='+d.url;
			}else{
				href = '';
			}

			//获取时间
			// var date = new Date(d.createDate);
			// Y = date.getFullYear() + '-';
			// M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
			// D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + '';
			// var afterDate = Y+M+D;
			return {
				url: href,
				time: d.createDate?d.createDate.substr(0,10):(d.releaseDate.substr(0,10))
			}
	    });
		var GGDT_html = template('tl_GGDT', d.data);
		GGDT_html = GGDT_html?GGDT_html:'<span style="text-align: center;display: block;margin-top: 5px;line-height: 25px;">暂无先关数据！</span>';

		$('.new_notice').html( GGDT_html );

		if (d.data.GGDT.status==1) {
			$('.new_notice').remove();
		};
	}
	// 每日报价
	// var getDailyQuote = function(title){
	// 	req.jsonp({
	// 		url:base_url + "/news/getNewsByTitle.do",
	// 		data: {newsTypeCode:'MRBJ',start:1,length:8,title:title},
	// 		success: function(d){
	// 			if (d.code == 'BUS0000') {
	// 				//console.log('--------');
	// 				//console.log(d)
	// 				template.helper("parameter1", function(d){  
	// 					// 获取跳转url
	// 			       var href = '';
	// 					if (d.templateCode == "WZ") {
	// 						href = '/page/zixun/news_details.html?typeSn='+d.typeSn+'&sn='+d.sn+'&code=MRBJ&lm=每日报价';
	// 					}else if (d.templateCode == "SP") {
	// 						href = '/page/zixun/vid_details.html?typeSn='+d.typeSn+'&sn='+d.sn+'&code=MRBJ&lm=每日报价';
	// 					}else{
	// 						href = d.jumpUrl;
	// 					}

	// 					//获取时间
	// 					// var date = new Date(d.createDate);
	// 					// Y = date.getFullYear() + '-';
	// 					// M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
	// 					// D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + '';
	// 					// var afterDate = Y+M+D;
						
	// 					return {
	// 						url: href,
	// 						time: d.createDate.substr(0,10)
	// 					}
	// 			    });
	// 				var dailyQuote_html = template('dailyQuote', d);
	// 				dailyQuote_html = dailyQuote_html?dailyQuote_html:'<span style="text-align: center;display: block;margin-top: 5px;line-height: 25px;">暂无数据！</span>';
	// 				if (d.data.length>0) {
	// 					$('.dailyQuoteMore').attr('href','/page/zixun/news_list.html?typeSn='+d.data[0].typeSn+'&code=MRBJ&lm=每日报价');
	// 				};
	// 				$('#waste_phone').html( dailyQuote_html );
	// 			}
	// 		},
	// 		error: function(e){
				
	// 		}
	// 	});

	// }
	//getDailyQuote('');
	//获取报价list
	var getQuoteListFn = function(title){
		var dateArr = getDateArr(7).reverse();
		var dateList = [];

		for (var i = 0; i < dateArr.length; i++) {
			dateList.push({
				time:dateArr[i],
				title:dateArr[i]+' '+title+"回收行情报价",
				productCategory:title
			})
		};

		var dailyQuote_html = template('dailyQuote', {data:dateList});
		$('#waste_phone').html( dailyQuote_html );
	}	
	//获取以往日期
	var getDateArr = function(day){
		var day = day?day:6;
		var myDate = new Date(); //获取今天日期
		myDate.setDate(myDate.getDate() - day);
		var dateArray = []; 
		var dateTemp; 
		var flag = 1; 
		var d = function(d){
			return d<10? '0'+d : d;
		}
		for (var i = 0; i < day+1; i++) {
		    dateTemp = myDate.getFullYear()+"-"+d((myDate.getMonth()+1))+"-"+d(myDate.getDate());
		    dateArray.push(dateTemp);
		    myDate.setDate(myDate.getDate() + flag);
		} 
		return dateArray;
	}
	$('.everyday_quote .tab_nav').on('click','a',function(){

		var _text = $(this).data('text');
		if (_text) {
			//getDailyQuote(_text);
			getQuoteListFn(_text);
			$(this).addClass('cur').siblings().removeClass('cur');
		};
	}).find('a:eq(0)').click();
	//合作伙伴
	function hezuoHuoban(d){
		
		if (d.data.HZHB.status==1) {
			$('.tl_partner').hide();
		};
		d.data.HZHB.len = Math.ceil( d.data.HZHB.newsList.length/10 );
		if (d.data.HZHB.len<=1) {
			$('.wrap_partner').find('.last,.next').hide();
		};
		var HZHB_html = template('tl_HZHB', d.data);
		$('#cooperationPartner').html( HZHB_html );
		
		photoSlide({
			obj:$('.partner_slide')
		});
	}

	//分类报价
	function classifiedQuotation(){
		var getDate7 = function(){
			var myDate = new Date(); //获取今天日期
			myDate.setDate(myDate.getDate() - 6);
			var dateArray = []; 
			var dateTemp; 
			var flag = 1; 
			var d = function(d){
				return d<10? '0'+d : d;
			}
			for (var i = 0; i < 7; i++) {
			    dateTemp = myDate.getFullYear()+"-"+d((myDate.getMonth()+1))+"-"+d(myDate.getDate());
			    dateArray.push(dateTemp);
			    myDate.setDate(myDate.getDate() + flag);
			} 
			return dateArray;
		}
		var dataArr = getDate7();
		var aLi = '';
		for (var i = 0; i < dataArr.length; i++) {
			var cur = i==dataArr.length-1?'cur':'';
			var mr = i==dataArr.length-1?'style="margin-right:0"':'';
			aLi+='<li '+mr+' class="'+cur+'" data-time="'+dataArr[i]+'">'+dataArr[i].substr(8,2)+'</li>'
		};
		
		var token = getStorageToken();
		var getSellHistoryData = function(time){
			req.jsonp({
				url:base_url + "/systemset/sellHistory/data.do",
				data: {time: time,token:token},
				success: function(d){
					if (d.code == 'BUS0000') {
						var classified = template('script_classified', d);
						$('.classify_list').html( classified );
					};
				},
				error: function(e){
				}
			});
		}
		getSellHistoryData(dataArr[6]);

		$('.date_tab').html(aLi).on('click','li',function(){
			$(this).addClass('cur').siblings().removeClass('cur');
			var time = $(this).data('time');
			getSellHistoryData(time);
		})
	}
	classifiedQuotation();

})