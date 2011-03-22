<?php
require_once('_inc.php');

$path_classes = $path_root . '/' . $install_dir . '/lib/classes/';
$map = array(
	'aui.lib.js'          => array(),  //单文件框架
	'__init__mini.lib.js' => array(),
	'core.lib.js'         => array(),
	'ui.lib.js'           => array(),
	'ui_action.lib.js'    => array(),
	//                             lib目录            app目录
	'test_win.lib.js' => array('/apps/test/src/', '/apps/test/src/classes/'),
	'docs.lib.js'     => array('/docs/src/'     , '/docs/src/classes/'),
	'demos.lib.js'    => array('/demos/lib/'    , '/demos/lib/classes/')
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