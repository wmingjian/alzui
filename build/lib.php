<?php
require_once('_inc.php');

$path_classes = $path_root . '/' . $install_dir . '/lib/classes/';
$map = array(
	'__init__mini.lib.js' => array(),
	'aui.lib.js' => array(
		'/apps/citylife/lib/',          //lib目录
		'/apps/citylife/lib/classes/',  //app目录
		'aui.lib.js'                    //合并标识文件
	),
	'citylife.lib.js' => array(
		'/apps/citylife/lib/',
		'/apps/citylife/lib/classes/',
		'citylife.lib.js'
	)
);

header("Content-Type: text/javascript; charset=utf-8");
echo '/* autogen by file.php */';
echo "\n";
$f = strtolower($_GET['f']);
$code = file_get_contents($path_root . preg_replace('/\/lib\//', "/lib/lib/", $f));
$code = preg_replace_callback('/\nimport ([\w\.]+);/', "do_import", $code);  //'/\nimport (\w+(?:\.\w+)+);/'
$code = mb_convert_encoding($code, 'utf-8', 'gb2312');
if($autoGenFile){
	$name = preg_replace('/\.lib\.js/', ".lib0.js", $f);
	//$name = $f;
	file_put_contents($path_root . $name, $code);
}
echo $code;

function do_import($matches){
	global $path_classes;
	$name = preg_replace('/\./', "/", $matches[1]) . '.js';
	$fdata = file_get_contents($path_classes . $name);
	$fdata = preg_replace('/_class\(\"(\w+)\", (\w+|\"\"), function\(\)\{/', '_class("\1", \2, function(_super){', $fdata);
	return "\n/*<file name=\"" . $name . "\">*/"
		. "\n" . $fdata
		. "\n/*</file>*/";
}