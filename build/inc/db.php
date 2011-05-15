<?php
/**
 * 数据库操作函数
 */
function openConn(){
	global $G_cfg;
	$connstr = $G_cfg['path_db'];
	$conn = new COM("ADODB.Connection");
	$conn->Open('DRIVER={Microsoft Access Driver (*.mdb)}; DBQ=' . $connstr .';');
	return $conn;
}
function rs2json($rs){
	$sb = array();
	for($i = 0, $len = $rs->Fields->Count(); $i < $len; $i++){
		$item = $rs->Fields($i);
		array_push($sb, $item->Name . ":" . formatValue($item->Type, $item->Value));
		$item = null;
	}
	return "{" . join(",", $sb) . "}";
}
function formatValue($type, $value){
	switch($type){
	//number
	case  16:  //TinyInt
	case   2:  //SmallInt
	case   3:  //Integer
	case  20:  //BigInt
	case  17:  //UnsignedTinyInt
	case  18:  //UnsignedSmallInt
	case  19:  //UnsignedInt
	case  21:  //UnsignedBigInt
	case   4:  //Single
	case   5:  //Double
		return "" . $value;
	//date
	case   7:  //Date
	case 133:  //DBDate
	case 134:  //DBTime
	case 135:  //DBTimeStamp
		return "new Date(" . new Date($value).getTime() . ")";
	//string
	case   0:  //Empty
	case   6:  //Currency
	case  14:  //Decimal
	case 131:  //Numeric
	case  11:  //Boolean
	case  10:  //Error
	case 132:  //UserDefined
	case  12:  //Variant
	case   9:  //IDispatch
	case  13:  //IUnknown
	case  72:  //GUID
	case   8:  //BSTR
	case 129:  //Char
	case 200:  //VarChar
	case 201:  //LongVarChar
	case 130:  //WChar
	case 202:  //VarWChar
	case 203:  //LongVarWChar
	case 128:  //Binary
	case 204:  //VarBinary
	case 205:  //LongVarBinary
	case 136:  //Chapter
	case  64:  //FileTime
	case 137:  //DBFileTime
	case 137:  //PropVariant
	case 139:  //VarNumeric
	default :
		return "'" . toJsString("" . $value) . "'";
	}
}
function toJsString($s){
	$sb = array();
	for($i = 0, $len = strlen($s); $i < $len; $i++){
		$c = substr($s, $i, 1);
		switch($c){
		case "\\": array_push($sb, "\\\\");break;
		case "\r": array_push($sb, "\\r");break;
		case "\n": array_push($sb, "\\n");break;
		case "\t": array_push($sb, "\\t");break;
		case "\"": array_push($sb, "\\\"");break;
		case "\'": array_push($sb, "\\\'");break;
		default  : array_push($sb, $c);break;
		}
	}
	return join("", $sb);
}