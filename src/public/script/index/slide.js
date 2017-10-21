define(['jquery'],function($){
	
	function Slide(options){
		this.opt = options;
		this.advert = options.obj;
		this.init();
	}
	Slide.prototype = {
		init : function(){

			this.wrap_slide = this.advert.find('.wrap-slide');
			this.slide = this.wrap_slide.children();
			this.iw = this.slide.width();
			this.objLen = this.slide.length;
			this.rou = this.advert.find('.j_ro');
			this.i = 0;//索引
			this.off = true;
			this.winSize(this.iw);
			this.execute();
			this.opt.contact&&this.slide.length>1&&this.createContact();
			this.slideFn();
		},
		execute : function(){

			var _window = $(window) , _this = this;
			_window.on('resize',function(){
				if (_this.advert.parent().width()<1200) return;//如果不是全屏轮播的则返回
				_this.iw = _window.width();
				if (_this.iw<=1200) _this.iw = 1200;
				_this.winSize(_this.iw);
			});

			this.xg().slide1();

		},
		winSize : function(w){
			this.wrap_slide.children().width(w);
			this.wrap_slide.width(this.objLen * w);

			if (!this.ifIe()) {
				this.wrap_slide.css({left:-this.i*this.iw});
				return;
			};
			this.wrap_slide.css({
				 transition:'none'
				,transform:'translate3d('+-this.i*this.iw+'px,0,0)'
			});
		},
		createContact : function(){//创建节点
			this.ul = $('<ul>');
			this.ul.addClass('contact');
			// this.ul.css('marginLeft',-this.objLen*24/2)
			for (var i = 0; i < this.objLen; i++){
				this.ul.append('<li '+(i==0 ? 'class=cur' : '') +'></li>')
			};
			this.advert.append(this.ul);
			this.ul.css('width',this.objLen*28);
			this.ul.css('marginLeft',-this.ul.width()/2);
		},
		slideFn : function(){


			if (this.slide.length<=1) return;//只有一张图

			var _this = this , ie = this.ifIe() , time = null;

			this.ul&&this.ul.on('mouseover','li',function(){
				if ($(this).index()==_this.i) return;//防止多次
				_this.i = $(this).index();
				$(this).addClass('cur').siblings().removeClass('cur');
				( ie==true ? s.stand(_this.i) : s.ie(_this.i) );

			});
			var $next = this.advert.find('.next') ,  $last = this.advert.find('.last');
			$next.on('click',function(){
				autosetIn()
			});

			 if (this.opt.auto) {
				 time = setInterval(autosetIn,5000);
				 function over(){
				 	clearInterval(time);
				 }
				 function out(){
				 	time = setInterval(autosetIn,5000);
				 }

				 this.ul&&this.ul.on({'mouseover':over,'mouseout':out});
				 $next.on({'mouseover':over,'mouseout':out});
				 $last.on({'mouseover':over,'mouseout':out});
			 };

			function autosetIn(){
				if (!_this.off) return;
				_this.off = false;
				_this.i++;
				if (_this.i>=_this.objLen) {
					_this.slide.eq(0).css({
						position:'relative',
						left:_this.iw*_this.objLen
					});
				};
				_this.ul&&_this.ul.children().eq(_this.i==_this.objLen?0:_this.i).addClass('cur').siblings().removeClass('cur');

				( ie==true ? s.stand(_this.i) : s.ie(_this.i) );
			}


			$last.on('click',function(){
				if (!_this.off) return;

				_this.i--;
				if (_this.i<0) {
					_this.slide.eq(_this.objLen-1).css({
						position:'relative',
						left:-_this.iw*_this.objLen
					});
				};
				_this.ul&&_this.ul.children().eq(_this.i<0?(_this.objLen-1):_this.i).addClass('cur').siblings().removeClass('cur');
				( ie==true ? s.stand(_this.i) : s.ie(_this.i) );
				_this.off = false;
			})

			if (this.opt.btnHover) {
				this.advert.hover(function(){
					$last.stop().css({opacity:1})
					$next.stop().css({opacity:1})
				},function(){
					$last.stop().css({opacity:0})
					$next.stop().css({opacity:0})
				});
			};

			var s = {
				stand : function(i){

					var This = this;
					_this.wrap_slide.css({
						 transition : '0.5s'
						,transform:'translate3d('+-_this.i*_this.iw+'px,0,0)'
					});

					_this.rou.removeClass('show');//第一张小圈圈隐藏
					setTimeout(function(){
						This.moveEnd();
					},i==0?0:500);
					// this.addEnd(_this.wrap_slide,this.moveEnd);
				},
				ie : function(){
					var This = this;
					 _this.wrap_slide.stop().animate({left:-_this.i*_this.iw},function(){
					 	This.moveEnd();
					 })
				},
				moveEnd : function(){
					if (ie) {//标准

						_this.slide.eq(_this.i%_this.objLen).addClass('effect').siblings().removeClass('effect');
						// if ((_this.i != 0) && _this.i != _this.objLen) {
						// 	_this.rou.removeClass('show');
						// }else{
						// 	_this.xg().slide1();
						// }
					}else{
						//if (Number($.browser.version)==9) {//针对ie9
							_this.slide.addClass('effect');

						//}
					}
					_this.opt.callback&&_this.opt.callback(_this.i==_this.objLen?0:_this.i);//回调

					if(_this.i == _this.objLen){//无缝滚动右

						if (!_this.ifIe()) {
							_this.wrap_slide.css({left:0});
						}else{
							_this.wrap_slide.css({
							 transition:'none'
							,transform:'translate3d('+0+'px,0,0)'
							});
						}
						// _this.slide.eq(0).attr('style','width:'+_this.iw+'px')
						_this.slide.eq(0).css({'width':_this.iw,'position':'static'});
						_this.i = 0;
					}else if(_this.i < 0){//无缝滚动左

						if (!_this.ifIe()) {
							_this.wrap_slide.css({left:-(_this.objLen-1)*_this.iw});
						}else{
							_this.wrap_slide.css({
							 transition:'none'
							,transform:'translate3d('+-(_this.objLen-1)*_this.iw+'px,0,0)'
							});
						}
						// _this.slide.eq(_this.objLen-1).attr('style','width:'+_this.iw+'px')
						_this.slide.eq(_this.objLen-1).css({'width':_this.iw,'position':'static'});
						_this.i = _this.objLen-1;

					}

					_this.off = true;
					$(this).off();
				},
				addEnd : function(obj,fn){
					$(obj).on('WebkitTransitionend',fn);
					$(obj).on('transitionend',fn);
				}
			}
		    s.stand(_this.i);

		},
		xg : function(){
			var _this = this,iNow = 0 , timer = null;
			return {
				slide1 : function(){
					//第一张5个小圆圆效果
					setTimeout(function(){
						timer = setInterval(function(){
						 _this.rou.eq(iNow).addClass('show');
						 if (iNow>=3) {clearInterval(timer)}else{iNow ++};
					   },120);
					},1000)
				}
			};
		},
		ifIe : function(){

				if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/7./i)=="7.") 
				{ 
				return false;
				} 
				else if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/8./i)=="8.") 
				{ 
				return false;
				} 
				else if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/9./i)=="9.") 
				{ 
				return false;
				} 
				else if(navigator.appName == "Microsoft Internet Explorer") 
				{ 
				return false;
				} 
				// if ( $.browser.msie ) {
				// 	if (Number($.browser.version)<=9) return false;
				// }
				return true; 
		}
	}
	function photoSlide(options) {
		return new Slide(options);
	}

	return photoSlide;
})




