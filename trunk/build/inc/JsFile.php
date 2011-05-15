<?php

/**
 * JS文件(lib,tpl)
 */
class JsFile {
	var $name = '';     //文件名
	var $filepath = '';  //文件实际路径
	var $data = '';     //文件内容
	var $conf = '';     //对应的配置文件名
	var $cache = null;  //代码文件依赖关系信息缓存
	function __construct($name, $filepath){
		$this->name = $name;
		$this->filepath = $filepath;
	}
	function log($str){
		//echo $str;
	}
	function loadData(){
		if(!file_exists($this->filepath)){
			$this->log("\n");
			$this->log("[warning]source file not exist(" . $this->filepath . ")");
		}
		$this->data = file_get_contents($this->filepath);
	}
	function process(){
		$this->loadData();
		return $this->data;
	}
	/**
	 * 加载json配置文件
	 */
	function loadJsonConf(){
		global $G_cfg;
		$type = $this->conf['type'];
		$path = $G_cfg['path_dev'] . 'js/' . ($type == 'lib' || $type == 'tpl' ? 'lib' : $type) . '/' . $this->conf['json'] . '.json';  //必须是.json后缀
		if(!file_exists($path)){  //模板文件不存在
			echo 'json file no exist(' . $path . ')';
			return array();
		}else{
			$file = file_get_contents($path);
			include_once("Json.php");
			$json = new Services_JSON();
			return $json->decode($file);
		}
	}
}