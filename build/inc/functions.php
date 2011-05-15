<?php
/**
 * Smarty配置文件
 */
function newTpl(){
	global $G_cfg, $G_config, $G_mail_config;
	$aaa = $G_config->getenv('path_cache');
	$path_cache = $aaa . "http-" . $G_cfg['product'] . "/";
	checkFilePath($aaa, "http-" . $G_cfg['product'] . "/");
	checkFilePath($path_cache, "smarty/templates_c/");
	checkFilePath($path_cache, "smarty/configs/");
	checkFilePath($path_cache, "smarty/cache/");
	include_once("Smarty/Smarty.class.php");
	$tpl = new Smarty();
	//$tpl->caching    = true;
	//$tpl->debugging  = true;
	//$tpl->debug_tpl  = 'debug.tpl';
	$G_cfg['product'] = str_replace('sinamail-ent', 'sinamail-5.7', $G_cfg['product']);
	$tpl->template_dir = $G_cfg['path_dev'] . "products/" . $G_cfg['product'] . "/tmpl/";
	$tpl->compile_dir  = $path_cache . "smarty/templates_c/";
	$tpl->config_dir   = $path_cache . "smarty/configs/";
	$tpl->cache_dir    = $path_cache . "smarty/cache/";
	$tpl->left_delimiter  = '<{';
	$tpl->right_delimiter = '}>';
	foreach($G_mail_config as $k => $v){
		$tpl->assign($k, $v);
	}
	//$tpl->assign('check_time', md5(date("Y-m-d H:i:s")));
	//$tpl->assign('PATH_CSS', "/sinamail-dev/products/webdev/css/");

	/*
	$tpl->assign('_CSS_PATH_', DEF_CSS_PATH);
	$tpl->assign('_IMAGE_PATH_', DEF_IMAGE_PATH);
	if(defined('DEF_BASIC_CSS_PATH') && defined('DEF_BASIC_IMAGE_PATH')){
		$tpl->assign('_BASIC_CSS_PATH_', DEF_BASIC_CSS_PATH);
		$tpl->assign('_BASIC_IMAGE_PATH_', DEF_BASIC_IMAGE_PATH);
	}
	$tpl->assign('_CSS_VERSION_', DEF_CVS_VERSION);
	$tpl->assign('_JS_VERSION_', DEF_JS_PATH);
	$tpl->assign('_CGI_PATH_', DEF_CGI_PATH);
	$tpl->assign('_ROTATECHANNEL_PATH_', DEF_ROTATECHANNEL_PATH);
	*/
	return $tpl;
}
/**
 * 检查目录是否存在，不存在则创建
 */
function checkFilePath($root, $file){
	$arr = explode('/', $file);
	$arr_path = array();
	for($i = 0, $len = count($arr) - 1; $i < $len; $i++){
		array_push($arr_path, $arr[$i]);
		$dir = $root . join('/', $arr_path);
		if(!file_exists($dir)){
			mkdir($dir);
		}
	}
	//return array($arr_path, $filename, array_pop($arr));
}