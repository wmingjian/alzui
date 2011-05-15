<?php
require_once('_inc.php');
require_once('inc/FileCompile.php');
require_once('inc/Publish.php');

/**
 * 批量文件生成
 * usage:
 * options:
 * example:
 */
if(count($argv) != 3){
	echo "[usage]: php build.php mod product";
	echo "\n\tmod     all|js|jsmin|css|img|tpl";
	echo "\n\tproduct 5.0|5.2|uc|vip";
	echo "\nexample:";
	echo "\n\tphp build.php all sinamail-uc";
	echo "\n\tphp build.php jsmin sinamail-vip";
}else{
	$pub = new Publish();
	$pub->main($argc, $argv);
}