<?php
require_once('_inc.php');

$tpls = array(
	"aui.tpl.js"      => array("aui"     , "/alzui-X201/res/tpl/"),
	"test_win.tpl.js" => array("test_win", "/alzui-X201/res/tpl/"),
	"docs.tpl.js"     => array("docs"    , "/alzui-X201/docs/src/tpl/"),
	"demos.tpl.js"    => array("demos"   , "/alzui-X201/demos/src/tpl/")
);

$f = strtolower($_GET['f']);
$basename = basename($f);
$path_xml = $path_root . $tpls[$basename][1];
/*
$arr = array();
foreach(glob($path_root . $tpls[$f][1] . "*.xml") as $file){
	$name = basename($file);
	if(substr($name, 0, 1) !== '_'){
		$arr[] = "\"" . $name . "\":\"" . toJsString(loadTplFile($file)) . "\"";
	}
}
$code = "__runtime__.regTpl(\"" . $tpls[$f][0] . "\", {\n"
	. join(",\n", $arr)
	. "\n});";
*/
$code = file_get_contents($path_root . preg_replace('/\/lib\//', "/lib/lib/", $f));
$code = mb_convert_encoding($code, 'utf-8', 'gb2312');
$code = preg_replace_callback('/\n(\w+\.xml)/', "do_import", $code);

header("Content-Type: text/javascript; charset=utf-8");
echo '/* autogen by tpl.php */';
echo "\n";
if($autoGenFile){
	$name = preg_replace('/\.tpl\.js/', ".tpl0.js", $f);
	//$name = $f;
	file_put_contents($path_root . $name, $code);
}
echo $code;

function do_import($matches){
	global $path_xml;
	$name = $matches[1];
	return "\n\"" . $name . "\":\"" . toJsString(loadTplFile($path_xml . $name)) . "\"";
}
function loadTplFile($file){
	$fdata = file_get_contents($file);
	$fdata = str_replace("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n", '', $fdata);
	$fdata = preg_replace('/>\n\t*</', "><", $fdata);
	return $fdata;
}

/**
 * 把 java 字符串转换为 js 字符串
 * @param s 要转换成 JS 字符串的 java 字符串
 */
function toJsString($s){
	$sb = array();
	for($i = 0, $len = strlen($s); $i < $len; $i++){
		$ch = substr($s, $i, 1);
		switch($ch){
		case "\\": array_push($sb, "\\\\");break;
		case "\r": array_push($sb, "\\r");break;
		case "\n": array_push($sb, "\\n");break;
		case "\t": array_push($sb, "\\t");break;
		case "\'": array_push($sb, "\\\'");break;
		case "\"": array_push($sb, "\\\"");break;
	//case "&": array_push($sb, "\\x26");break;
	//case "<": array_push($sb, "\\x3C");break;
	//case ">": array_push($sb, "\\x3E");break;
		default: array_push($sb, $ch);break;
		}
	}
	return join("", $sb);
}