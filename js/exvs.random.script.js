var $arr_ms;
$arr_ms = new Array();
$arr_ms[1000] = new Array();
$arr_ms[2000] = new Array();
$arr_ms[2500] = new Array();
$arr_ms[3000] = new Array();
var $arr_cost = new Array(3000,2500,2000,1000);
var $max_ms_name = 0;
var $msset_keys = new Array();
var $$cookie_key_list_key = "keylist"
var $cookie_key_list = new Array()
var $csv = "";
var $CR = String.fromCharCode(13);
var $LF = String.fromCharCode(10);
var $CRLF = String.fromCharCode(13)+String.fromCharCode(10);
$(function(){
	//ファイル取得
	$.ajax({
		type: "GET",
		url: "data/ms.csv",
		dataType: "text",
		success: function($csv){
			handleResult($csv.split($LF));
		},
		error: function($msg){
			console.log($msg);
		}
	});
	//コスト全選択/全解除
	$(".costs").live('click', function() {
		var $check_status = $(this).attr('checked');
		if($check_status=="checked"){
			var $check_flag = true;
			$check_status = "1";
		}else{
			var $check_flag = false;
			$check_status = "0";
		}
		$('.checks'+$(this).attr('cost')).attr('checked',$check_flag);
		for ($idx in $arr_ms[$(this).attr('cost')]) {
			$arr_ms[$(this).attr('cost')][$idx]['checked'] = $check_status;
		}
	});
	//MS選択/解除
	$(".checks").live('click', function() {
		var $check_status = $(this).attr('checked');
		if($check_status=="checked"){
			$check_status="1";
		}else{
			$check_status="0";
		}
		$arr_ms[$(this).attr('cost')][$(this).attr('ms$idx')]['checked'] = $check_status;
	});
	//MS抽選
	$("#random-select-ms").click(function() {
		var $arr_selected_mss = new Array();
		var $rand_idx = 0;
		for(var i = 0; i < $arr_cost.length; i++){
			for ($idx in $arr_ms[$arr_cost[i]]) {
				if($arr_ms[$arr_cost[i]][$idx]['checked']==1){
					$arr_selected_mss[$rand_idx] = $arr_ms[$arr_cost[i]][$idx]['name'];
					$rand_idx++;
				}
			}
		}
		var $rand_keys = Math.floor(Math.random()*$arr_selected_mss.length);
		$('#selectedms').html($arr_selected_mss[$rand_keys]);
	});
	//設定保存
	$("#save-ms-set").click(function(){
		var COOKIE_PATH = '/';
		var $date = new Date();
		var $cookiename = $('#new-ms-set').val();
		var $cookieval = arrms2Bit();
		$date.setTime($date.getTime() + ( 1000 * 60 * 60 * 24 * 3 ));
		if($('#new-ms-set').val()!=""){
			// とりあえず"-"区切りで連結してcookieに格納
			if($('#mslists option').is('[value='+$cookiename+']')){
				jConfirm('同じ名前のセットが存在しますが上書きしますか？', '上書き確認ダイアログ', function(r) {
					if(r){
						$.cookie($cookiename, $cookieval, { expires: 365 });
						Notifier.success('設定:'+$cookiename+'を保存しました');
					}else{
						Notifier.info('保存を中止しました。');
					}
				});
			}else{
				$cookie_key_list.push($cookiename);
				$.cookie($$cookie_key_list_key, $cookie_key_list.toString(), { expires: 365 });
				$.cookie($cookiename, $cookieval, { expires: 365 });
				$('#mslists').append($('<option>').attr({ value: $cookiename }).text($cookiename));
				Notifier.success('設定:'+$cookiename+'を保存しました');
			}
		}else{
			alert("名前が入力されていません");
		}
	});
	//設定文字列表示
	$("#disp-ms-set").click(function(){
		$('#disp-ms-set-text').val(arrms2Bit());
		$('#disp-ms-set-text').focus();
		$('#disp-ms-set-text').select();
	});
	//設定文字列読込
	$("#load-ms-set-text").click(function(){
		var $val = $('#set-ms-set-text').val();
		Bit2arrms($val);
	});
	//設定文字列消去
	$("#clear-ms-set-text").click(function(){
		$('#set-ms-set-text').val("");
	});
	//設定読込
	$("#load-ms-set").click(function(){
		$cookiename = $('#mslists').val();
		var $val = $.cookie($cookiename);
		Bit2arrms($val);
		$('#new-ms-set').val($cookiename);
	});
	//設定削除
	$("#delete-ms-set").click(function(){
		$cookiename = $('#mslists').val();
		jConfirm('設定：'+$cookiename+'を削除しますか？', '削除確認ダイアログ', function(r) {
			if(r){
				$cookie_key_list.shift($cookiename);
				$("#mslists option:selected").remove();
-				$.cookie($cookiename, null);
				$.cookie($$cookie_key_list_key, $cookie_key_list.toString());
				Notifier.success('設定:'+$cookiename+'を削除しました');
			}else{
				Notifier.info('削除を中止しました。');
			}
		});
	});
	//$csvの配列読込
	function handleResult($csvData) {
		var $ms_cost;
		for(var i = 1; i < $csvData.length; i++){
			$getRow = $csvData[i].split(',');
			if($getRow[0].length<=0)break;
			$ms_cost = $getRow[2];
			$arr_ms[$ms_cost][$getRow[0]] = new Array();
			$arr_ms[$ms_cost][$getRow[0]]['name'] = $getRow[1];
			if($max_ms_name < $getRow[1].length){
				$max_ms_name = $getRow[1].length;
			}
			$arr_ms[$ms_cost][$getRow[0]]['checked'] = "1";
		}
		dispMsList();
	}
	//チェックボックスの出力
	function dispMsList(){
		var $disp_html = '<div id="ms-list">';
		var $rowCount  = 3;
		var $nowchecked = "";
		for(var i = 0; i < $arr_cost.length; i++){
			var $disp_count = 0;
			$disp_html += '<div id="cost'+$arr_cost[i]+'" class="clearfix cost-outer" style="clear:both">';
			$disp_html += '<div class="cost" style="float:left">'+$arr_cost[i]+'<br />';
			$disp_html += '<input id="check'+$arr_cost[i]+'" type="checkbox" class="costs" cost="'+$arr_cost[i]+'" checked="checkded" />';
			$disp_html += '</div><!--cost-->';
			$disp_html += '<div class="mslist" style="float:left;padding-left:30px;">';
			for ($idx in $arr_ms[$arr_cost[i]]) {
				$disp_count++;
				if($disp_count%$rowCount ==1)$disp_html += '<div class="clearfix">';
				$disp_html += '<div style="width:'+($max_ms_name)+'em;float:left">';
				if($arr_ms[$arr_cost[i]][$idx]['checked']=="1"){
					$nowchecked = 'checked="checkded"';
				}else{
					$nowchecked = ''
				}
				$disp_html += '<input type="checkbox" id="check-'+$idx+'" cost="'+$arr_cost[i]+'" ms$idx="'+$idx+'" class="checks'+$arr_cost[i]+' checks" value="'+$arr_ms[$arr_cost[i]][$idx]['name']+'" '+$nowchecked+' />';
				$disp_html += $arr_ms[$arr_cost[i]][$idx]['name']+'';
				$disp_html += '</div><!--ms-list-->';
				if($disp_count%$rowCount ==0)$disp_html += '</div>';
			}
			if($disp_count%$rowCount !=0)$disp_html += '</div>';
			$disp_html += '</div><!--ms-list-->';
			$disp_html += '</div>'<!--cost'+$arr_cost[i]+'-->';
		}
		$disp_html += '</div><!--ms-list-->';
		$("div#msselectform").html($disp_html);
		if($.cookie($$cookie_key_list_key)){
			savedatas = $.cookie($$cookie_key_list_key).split(",");
			for(var i = 0;i < savedatas.length;i++){
				$('#mslists').append($('<option>').attr({ value: savedatas[i] }).text(savedatas[i]));
				$cookie_key_list.push(savedatas[i]);
			}
		}
	}
	function arrms2Bit(){
		var $bit = new Array();
		for(var i = 0; i < $arr_cost.length; i++){
			$nowcost = $arr_cost[i];
			for ($idx in $arr_ms[$arr_cost[i]]) {
				$bit[$idx] = $arr_ms[$nowcost][$idx]['checked'];
			}
		}
		return $bit.toString();
	}
	function Bit2arrms($val){
		var $bin = $val.split(',');
		for ($idx in $bin) {
			for(var i = 0; i < $arr_cost.length; i++){
				if($arr_ms[$arr_cost[i]][$idx]){
					$arr_ms[$arr_cost[i]][$idx]['checked'] = $bin[$idx];
				}
			}
			$nowcheckbox = "#check-"+$idx;
			if($bin[$idx]==1){
				$($nowcheckbox).attr('checked',true);
			}else{
				$($nowcheckbox).attr('checked',false);
			}
		}
	}
});
