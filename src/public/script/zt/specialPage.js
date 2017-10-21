define(['jquery', 'script/index/load_init', 'script/utils/jquery.fullPage'], function($, LOAD, fullPage) {
    var img = new Image();
    img.src = require('images/zt/z1.png');
    img.onload = function(){
       
        setTimeout(function(){
            $('.page-loading').remove();
            $('#fullpage').css({opacity:1})
             pullPageInit();
        },200)
        // $('#fullpage').addClass('show');
    }

    function pullPageInit(){
        var timer;
        var flag = true;
        function lock() {
            clearTimeout(timer);
            flag = false;
            timer = setTimeout(function() {
                flag = true;
            }, 200);
        }
        $('#fullpage').fullpage({
            sectionsColor: // 背景色
                [
                '#F2F2F2', '#3BCB86', '#F2F2F2', '#55C3F4','#3BCB86', '#FFE469', '#AD9BFF'
            ],
            navigation: true, // 显示导航
            loopBottom: false, // 顶部轮滚
            loopTop: false, // 顶部轮滚
            css3: true, // 开启CSS3动画
            afterRender: function () {
              
             },
            afterLoad: function(anchorLink, index){
               
                 
            },
            onLeave: function(index, nextIndex, direction) {
               $('.section').eq(index-1).addClass('active').siblings('.section').removeClass('active');
            }
        })
         
    }

})
