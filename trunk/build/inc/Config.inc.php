<?php

/**
 * 配置类
 */
class Config {
	var $pid        = -1;
	var $path_db    = "{#path_dev}classic\\mic.mdb";  //ADODB使用
	var $path_tpl   = "tpl/";     //tpl模版所在的目录
	var $path_tmpl  = "tmpl/";    //tmpl模版所在的目录
	var $path_skin  = "skins/";   //皮肤数据所在的目录
	var $path_lib   = "../js/";            //lib文件信息路径
	var $path_jar   = "../netapp/autobuild/jar_info/";  //jar文件信息路径
	var $map_short_name = array(
		"sinamail-5.0"  => 'free',  //[1]free
		"sinamail-5.2"  => 'cn'  ,  //[3]cn
		"sinamail-uc"   => 'uc'  ,  //[4]uc
		"sinamail-vip"  => 'vip' ,  //[5]vip
		"sinamail-2008" => '08'  ,  //[6]08
		"sinamail-ent"  => 'ent' ,  //[7]ent
		"sinamail-5.7"  => '57'     //[8]5.7
	);
	function init($product=''){
		global $G_cfg;
		if($product === ''){
			$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
			if(substr($host, 0, 4) == "www."){
				$this->pid = $this->getProductId();
			}else{
				$this->pid = substr($host, 1, 1);
			}
			$product = $G_cfg['product_list'][$this->pid*1];
		}else{
			for($i = 0, $len = count($G_cfg['product_list']); $i < $len; $i++){
				if($G_cfg['product_list'][$i] == $product){
					$this->pid = $i;
				}
			}
		}
		$G_cfg['product'] = $product;
		$G_cfg['path_tpl' ] = 'products/'.$G_cfg['product'].'/'.$this->path_tpl;
		$G_cfg['path_tmpl'] = 'products/'.$G_cfg['product'].'/'.$this->path_tmpl;
		$G_cfg['path_skin'] = $G_cfg['path_dev'] . $this->path_skin;
		$this->loadConfig();
	}
	function loadConfig(){
		global $G_cfg, $G_mail_config;
		$file = $G_cfg['path_dev'] . "build/cfg-" . ($G_cfg["debug"] ? $G_cfg["product"] : "my") . ".php";
		include_once($file);
	}
	//自动创建缓存目录
	function install(){
		global $G_cfg;
		$dirs = $G_cfg['cache_dirs'];
		for($i = 0, $len = count($dirs); $i < $len; $i++){
			$dir = $this->getenv('path_cache') . $dirs[$i];
			if(!file_exists($dir)){
				mkdir($dir);
			}
		}
		return true;
	}
	/**
	 *
	 */
	function getProductId(){
		global $_REQUEST, $_COOKIE, $G_cfg;
		$name = '_pid';
		if(isset($_COOKIE[$name])){
			return $_COOKIE[$name];
		}else{
			$conf = $this->getenv('path_cache') . 'product.conf';
			if(!file_exists($conf)){
				if(!isset($_REQUEST[$name])){
					header("Content-Type: text/html; charset=utf-8");
					echo file_get_contents($G_cfg['path_dev'] . 'products/index.tmpl');
					exit;
				}else{
					$pid = $_REQUEST[$name];
					setcookie($name, $pid, 0, "/", $G_cfg['domain']);
					file_put_contents($conf, $pid);
					return $pid;
				}
			}else{
				if(isset($_REQUEST[$name])){
					$pid = $_REQUEST[$name];
					setcookie($name, $pid, 0, "/", $G_cfg['domain']);
					file_put_contents($conf, $pid);
				}else{
					$pid = file_get_contents($conf);
				}
				return $pid;
			}
		}
	}
	function getenv($key){
		global $G_cfg;
		switch($key){
		//case 'path_cache'    : return $G_cfg['path_dev'] . '../' . $G_cfg[$key];
		case 'path_cache'    : return $G_cfg['path_root'] . $G_cfg[$key];
		case 'path_class'    : return $G_cfg['path_dev'] . 'js/classes/';
		//case 'path_product': return $G_cfg["path_cache"], 'http-' . $G_cfg["product"];
		default              : return $G_cfg['path_dev'] . 'build/' . $G_cfg[$key];
		}
	}
	/**
	 * @param data: null    //返回的真实数据：null | {...}
	 * @param result: true, //返回结果true|false
	 * @param errno: 1,     //错误编号
	 * @param msg: "",      //错误提示信息
	 */
	function formatJsonData($data, $result=true, $errno=0, $msg=""){
		if(is_string($data)){
			return "{\"result\":".($result ? "true" : "false").",\"errno\":$errno,\"msg\":\"$msg\",\"info\":\"\",\"data\":$data}";
		}else{
			$data = array(
				"result" => $result,
				"errno"  => $errno,
				"msg"    => $msg,
				"data"   => $data
			);
			include_once("inc/Json.php");
			$json = new Services_JSON();
			return $json->encode($data);
		}
	}
}