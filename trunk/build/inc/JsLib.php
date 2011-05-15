<?php
require_once('JsFile.php');

/**
 * 类库文件类
 */
class JsLibFile extends JsFile {
	var $reJsImport = '/(?:^|\n)import ([\w\.]+);/';
	var $reLibBegin = '/\(function\(\)\{with\(runtime\.createContext\(\"(\w+)\", \"(\w+(?:,\w+)*)\"\)\)\{/';
	var $json = null;
	var $libs = '';
	var $util = null;
	var $hash = null;
	var $rootLibName = '__init__mini';  //最开始的lib文件名
	function __construct($name, $filepath, $util){
		parent::__construct($name, $filepath);
		$this->name = preg_replace('/\.lib\.js$/', '', $name);
		$this->util = $util;
		$this->cache = $util->cache;
		$this->json = $this->cache->getLibByName($this->name);
		$this->libs = $this->json['libs'];
		$this->hash = $this->getFiles();
		$this->loadData();
		preg_replace_callback($this->reLibBegin, array($this, "getLibs"), $this->data);
	}
	function getLibs($matches){
		if($matches[1] != $this->name || $matches[2] != $this->libs){
			echo '/*' . $matches[1] . '!=' . $this->name . '||' . $matches[2] . '!=' . $this->libs . '*/';
			echo 'alert("lib error(name,libs)");';
		}
		$this->name = $matches[1];
		$this->libs = $matches[2];
	}
	function process(){
		global $G_cfg, $G_config;
		$app_name = $this->json['app'];  //获取一个APP的类名
		if(/*false && */$app_name != ''){
			$keys = array();
			$arr = array();
			//array_push($arr, "mail.copyright");  //添加版权信息
			//[TODO]特殊处理mail.app.AppMailInfo类
			if($app_name == "mail.app.AppMailInfo"){
				$suffix = '_' . $G_config->map_short_name[$G_cfg['product']];
			}else{
				$suffix = '';
			}
			$this->getDependFiles($app_name. $suffix, $arr, $keys);
			array_push($arr, $app_name);
			$sb = array();
			/*
			array_push($sb, $this->util->importJsClass(array('_import("mail.copyright");', "mail.copyright")));
			array_push($sb, "\n");
			array_push($sb, '(function(){with(runtime.createContext("' . $this->name . '", "' . $this->libs . '")){');
			for($i = 0, $len = count($arr); $i < $len; $i++){
				array_push($sb, "\n");
				array_push($sb, $this->util->importJsClass(array('_import("'.$arr[$i].'");', $arr[$i])));
			}
			array_push($sb, "\n");
			array_push($sb, "\nruntime.regLib(\"" . $this->name . "\", function(parentApp, len){");  //加载之后的初始化工作
			array_push($sb, "\n\tapplication = runtime.createApp(\"" . $app_name . "\", parentApp, len);");
			array_push($sb, "\n});");
			array_push($sb, "\n");
			array_push($sb, "\n}})(this);");
			*/
			array_push($sb, $this->util->importJsClass(array('_import("mail.copyright");', "mail.copyright")));
			array_push($sb, "\n");
			array_push($sb, 'runtime.regLib("' . $this->name . '", "' . $app_name . '", function(){with(arguments[0]){');
			for($i = 0, $len = count($arr); $i < $len; $i++){
				array_push($sb, "\n");
				array_push($sb, $this->util->importJsClass(array('_import("'.$arr[$i].'");', $arr[$i])));
			}
			array_push($sb, "\n\n}});");
			return join('', $sb);
		}else{
			return preg_replace_callback($this->reJsImport, array($this->util, "importJsClass"), $this->data);
			//$data = $this->createLibFile($name . 'on');  //*.lib.json
		}
	}
	/**
	 * 获取APP类依赖的非依赖库中的类，供打成自己的库使用
	 */
	function getDependFiles($name, &$arr, &$keys){
		//[TODO]如何排除依赖库中的类呢？
		if(array_key_exists($name, $this->hash)){
			return false;
		}
		$class = $this->util->cache->getClassByName($name);
		$array = $class['files'];
		for($i = 0, $len = count($array); $i < $len; $i++){
			$k = $array[$i];
			if(!array_key_exists($k, $keys)){
				$ret = $this->getDependFiles($k, $arr, $keys);
				if($ret){
					array_push($arr, $k);
					$keys[$k] = true;
				}
			}
		}
		return true;
	}
	/**
	 * 获取所有依赖的库中的类的哈希
	 */
	function getFiles(){
		$hash = array();
		$libs = $this->libs == '' ? array() : explode(',', $this->libs);
		if($this->name != $this->rootLibName){  //默认其他的lib都依赖于初始lib文件
			array_unshift($libs, $this->rootLibName);
		}
		for($i = 0, $len = count($libs); $i < $len; $i++){
			$lib = $this->util->cache->getLibByName($libs[$i]);
			$classes = $lib['classes'];
			for($j = 0, $len1 = count($classes); $j < $len1; $j++){
				$hash[$classes[$j]] = true;
			}
		}
		return $hash;
	}
}