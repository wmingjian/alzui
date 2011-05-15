<?php
$install_dir = 'alzui-X201';
/**
 * 全局配置信息
 */
$G_cfg = array(
	'autogen' => false,  //是否自动生成lib,tpl文件
	'single'  => false   //是否使用单文件工作模式
);
$path_base = $_SERVER['DOCUMENT_ROOT'];
$pos = strlen($path_base) - 1;
if(substr($path_base, $pos) == '/'){
	$path_base = substr($path_base, 0, $pos);
}
$path_base .= '/' . $install_dir;
#$path_root = '/www/alzui-dev';
$path_root    = $path_base . '/';
$path_cache   = $path_root . 'build/cache/';
$path_upload = $path_root . '/' . $install_dir . '/upload/';
$path_classes = array('/' . $install_dir . '/src/classes/');
$path_xml     = '';
if(!file_exists($path_cache)){
	mkdir($path_cache);
}

require_once('inc/Lib.php');

$libtool = new LibTool();

function js_dump($obj){
	echo '/*';
	var_dump($obj);
	echo '*/';
}
function html_dump($obj){
	echo '<!--';
	var_dump($obj);
	echo '-->';
}