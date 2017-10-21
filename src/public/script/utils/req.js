define(['jquery'],function($){
	var reqForm = function(opt) {  
		var url = opt.url;
		var successFn = opt.success;
		var errorFn = opt.error;
		var method = opt.type||'get';
		var data = opt.data||{};
		var formId = opt.formId;

		
  		var $formIframe = $('iframe[name=formIframe]');
        if ($formIframe.length>0) {
        	$formIframe.remove();
        }
       
        var iframe;
        try {//ie
		  iframe = document.createElement('<iframe name="formIframe">');
		} catch (ex) {
		  iframe = document.createElement('iframe');
		  iframe.name = 'formIframe'
		}
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        //表单
        var form;
        if (!formId) {
	        form = document.createElement("form");
			//创建表单数据
			if (data) {
				for(var key in data) {
					var input = document.createElement("input");
					input.type = "hidden";
					input.name = key;
					input.value = data[key];
					form.appendChild(input);
				}
			}
			document.body.appendChild(form);
		}else{
			form = document.getElementById(formId);
		}
		form.action = url;
        form.method = method;
        form.target = iframe.name;
        form.submit();

        var state = 1;
        var loadfn = function(){
            if(state){
            	
            	if (navigator.userAgent.indexOf('MSIE') >= 0) {
            		iframe.name = '';//兼容ie
					iframe.contentWindow.location = 'http://' + window.location.host + '/a';
				}else{
					iframe.contentWindow.location = 'about:blank';
				}
                state = 0;
            } else {
            	
            	var data = 0;
            	try{
					data = iframe.contentWindow.name == 'formIframe' ? 0 : iframe.contentWindow.name;
				}catch(e){
					data = 0;//请求失败
				}

				data = decodeURIComponent(data);
            	if (data != 0) {
            		try{
						data = JSON.parse( data );//标准的json格式 比如 '{"a":1,"b":2}'
						//console.log('标准的json格式');
					}catch(e){
						data = eval('('+data+')');//不标准的json格式 比如 '{a:1,b:2}'
						//console.log('不标准的json格式');
					}
					successFn&&successFn(data);
            	}else{
            		errorFn&&errorFn(data);
            	}
                
                iframe.contentWindow.document.write('');
                iframe.contentWindow.close();
                document.body.removeChild(iframe);
                if (!formId) document.body.removeChild(form);
            }
        };

        if(iframe.attachEvent){
            iframe.attachEvent('onload', loadfn);
        } else {
            iframe.onload = loadfn;
        }
        
	}
	return {
		form: function(data){
			reqForm(data);
		},
		ajax: function(data){
			$.ajax(data);
		},
		jsonp: function(opt){
		
			    var xhr = $.getJSON(opt.url + '?callback=?', opt.data||{}, function(d){
			    	if (d.code == 'BUS1004'&&!opt.data.userInfo) {
			    		signOut(d);//超时
			    	}else{
			    		opt.success&&opt.success(d);
			    	}
			    });
			 
			    xhr.fail(function(jqXHR, textStatus, ex) {//ie8
			        opt.error&&opt.error(jqXHR);
			    });

			    // 标准
			    var head = document.head || $('head')[0] || document.documentElement; 
			    var script = $(head).find('script')[0];
			    script.onerror = function(evt) {
			        opt.error&&opt.error(evt);
			        if (script.parentNode) {
			            script.parentNode.removeChild(script);
			        }
			        var src = script.src || '';
			        var idx = src.indexOf('callback=');
			        if (idx != -1) {
			            var idx2 = src.indexOf('&',idx);
			            if (idx2 == -1) {
			                idx2 = src.length;
			            }
			            var jsonCallback = src.substring(idx+9, idx2);
			            delete window[jsonCallback];
			        }
			    };
		}
	}
})