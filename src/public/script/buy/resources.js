define(['jquery','index/load_init','utils/pagination'],function($, LOAD, pagination){

	$(".wrap_btn>a").click(function(){
		$(this).addClass('cur').siblings().removeClass('cur');
	});

	$(".conter_head>tr>th>i").click(function(){
		if (!this.off) {
			$(this).addClass('up');
		}else{
			$(this).removeClass('up');
		}
		this.off = !this.off;
	});
	$("#Pagination").pagination(100, {
		num_edge_entries: 1, //边缘页数
		num_display_entries: 4, //主体页数
		items_per_page:1, //每页显示1项
		prev_text:"上一页",
	    next_text:"下一页"
	});
	function pageselectCallback(page_index, jq){
		var new_content = $("#hiddenresult div.result:eq("+page_index+")").clone();
		$("#Searchresult").empty().append(new_content); //装载对应分页的内容
		return false;
	}
});