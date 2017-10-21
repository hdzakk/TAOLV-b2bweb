require('commons'); 
require('lessDir/sell/order_info.less');

const config = require('configModule');
$(() => {
  if (!IS_PRODUCTION) {
    console.log('如果你看到这个Log，那么这个版本实际上是开发用的版本');
    console.log(config.API_ROOT);
  }
});


define('order_success',['jquery', 'script/index/load_init'],function($,LOAD){
	var saleOrderLogis = window.sessionStorage.getItem("saleOrderLogis");
	$('.page-loading').remove();
	if (saleOrderLogis) {
		saleOrderLogis = JSON.parse(saleOrderLogis);
		console.log(saleOrderLogis)
		$('#name').html(saleOrderLogis.recoverUser);
		$('#telphone').html(saleOrderLogis.telphone);
		$('#code').html(saleOrderLogis.recoverCode);
		$('#phone').html(saleOrderLogis.recoverTel);
		$('#addres').html(saleOrderLogis.recoverProvince+''+saleOrderLogis.recoverCity+''+saleOrderLogis.recoverArea+''+saleOrderLogis.recoverAddress);
	};
})
require(['order_success']);