require('commons'); 
require('lessDir/base/jquery.fullPage.less');

define('zt/purchase',['jquery', 'script/index/load_init', 'script/utils/jquery.fullPage'], function($, LOAD, fullPage) {
    var img = new Image();
    img.src = require('images/zt/c1.png');
    img.onload = function(){
        pullPageInit();
        setTimeout(function(){
            $('.page-loading').remove();
            $('#fullpage').css({opacity:1})
        },200)
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
                '#55C3F4', '#FFE469', '#3BCB86', '#FFE469','#55C3F4', '#4A88E5'
            ],
            navigation: true, // 显示导航
            loopBottom: false, // 顶部轮滚
            loopTop: false, // 顶部轮滚
            css3: true, // 开启CSS3动画
            onLeave: function(index, nextIndex, direction) {
                return flag
            }
        })
    }

    
})



