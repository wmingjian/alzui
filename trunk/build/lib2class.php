<?php
require_once("_inc.php");

/*
[usage]php lib2class.php [option] src_dir dest_dir
*/

//debug,mailinfo,
//"__init__mini,core,ui,mailui,addresslist,index50,mailbox,maillist5,reader,writer,editor,reg,space"
$arr = explode(",", "__init__mini,core,ui,ui_action,demos");
for($i = 0, $len = count($arr); $i < $len; $i++){
	lib2class($arr[$i] . ".lib.js");
}

function lib2class($file){
	global $path_root, $install_dir;
	//global $G_cfg;
	//$path_lib = $G_cfg["path_cache"];
	//$path_lib = '/www/_sinamail/_svn_mailtech/sinamail-5.0/ria/smr/js/sinamail50/source/';
	$path_lib = $path_root . '/' . $install_dir . '/build/cache/';
	$fdata = file_get_contents($path_lib . $file);
	//$fdata = mb_convert_encoding($fdata, "gbk", "utf-8");
	$f1 = "\n/*<file name=\"";
	$f2 = "*/\n";
	$f3 = "\n/*</file>*/";
	$p1 = 0;
	$p2 = 0;
	$p3 = 0;
	for($p1 = strpos($fdata, $f1, $p3); $p1 !== false; $p1 = strpos($fdata, $f1, $p3)){
		$p2 = strpos($fdata, $f2, $p1);
		if($p2 === false){
			echo "\nerror -----";
			break;
		}
		$p3 = strpos($fdata, $f3, $p2);
		if($p3 !== false){
			$f1_len = strlen($f1);
			$f2_len = strlen($f2);
			$fn = substr($fdata, $p1 + $f1_len, $p2 - $p1 - $f1_len);
			$fd = substr($fdata, $p2 + $f2_len, $p3 - $p2 - $f2_len);

			$fn = preg_replace('/\.js\">$/', '', $fn);
			//$fn = preg_replace('/\./', '/', $fn);
			$fn .= '.js';

			echo $fn, "\t", strlen($fd), "\n";
			$file = $path_lib . 'classes/' . $fn;
			checkFilePath($path_lib . 'classes/', $fn);
			if(!file_exists($file)){
				file_put_contents($file, $fd);  //mb_convert_encoding($fd, "gb2312", "utf-8")
			}
		}else{
			break;
		}
	}
}

/**
 * 检查目录是否存在
 */
function checkFilePath($root, $file){
	$arr = explode('/', $file);
	$arr_path = array();
	for($i = 0, $len = count($arr) - 1; $i < $len; $i++){
		array_push($arr_path, $arr[$i]);
		$dir = $root . join('/', $arr_path);
		if(!file_exists($dir)){
			echo "[mkdir]" . $dir . "\n";
			mkdir($dir);
		}
	}
	//return array($arr_path, $filename, array_pop($arr));
}