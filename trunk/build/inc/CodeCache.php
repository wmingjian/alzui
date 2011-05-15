<?php
require_once("Json.php");

/**
 * 代码缓存类
 */
class CodeCache {
	var $filename = 'code.dat';
	var $modified = false;  //缓存是否修改过
	var $json     = null;   //
	var $classes  = null;   //类状态列表
	var $libs     = null;   //库状态列表
	var $fileClass = null;
	function __construct($fileClass){
		global $G_config;
		$this->fileClass = $fileClass;
		$this->filename = $G_config->getenv('path_cache') . $this->filename;
		$this->json = new Services_JSON();
		if(file_exists($this->filename)){
			$arr = unserialize(file_get_contents($this->filename));  //生成缓存文件
			$this->classes = array_key_exists('classes', $arr) ? $arr['classes'] : array();
			$this->libs = array_key_exists('libs', $arr) ? $arr['libs'] : array();
		}else{
			$this->classes = array();
			$this->libs = array();
		}
		$this->loadAllLibs();
	}
	function loadAllLibs(){
		global $G_cfg;
		$path = $G_cfg['path_dev'] . 'alzui/src/lib/';
		foreach(glob($path . "*.lib.json") as $file){
			$name = str_replace('.lib.json', '', basename($file));
			$this->addLib($name, $file);
		}
		$path = $G_cfg['path_dev'] . 'js/lib/';
		foreach(glob($path . "*.lib.json") as $file){
			$name = str_replace('.lib.json', '', basename($file));
			$this->addLib($name, $file);
		}
	}
	function classExists($name){
		return array_key_exists($name, $this->classes);
	}
	function addClass($name, $file){
		$this->modified = true;
		$this->classes[$name] = array(
			'mtime' => filemtime($file),  //文件修改时间
			"lib"   => '',                //所在的库(应该是唯一的)
			'files' => array()            //依赖的类
		);
		//$this->classes[$name]['mtime'] = filemtime($file);
	}
	function addDependClass($name, $className){
		$this->modified = true;
		$this->classes[$name]['files'][] = $className;  //保存依赖的文件
	}
	function libExists($name){
		return array_key_exists($name, $this->libs);
	}
	function addLib($name, $file){
		//echo 'add lib ---> ' . $file . "\n";
		$mtime = filemtime($file);
		if(!array_key_exists($name, $this->libs)){  //不存在则添加
			$this->libs[$name] = array('mtime' => 0);  //保证修改时间判断逻辑正确执行
		}
		$l = &$this->libs[$name];
		if($l['mtime'] < $mtime){  //如果lib修改过了，则更新缓存
			$data = file_get_contents($file);
			//$data = mb_convert_encoding($data, "gb2312", "utf-8");
			$data = preg_replace('/\/\/[^\n]+\n/', '', $data);
			$lib = $this->json->decode($data);
			if($lib->name != $name){
				echo "[error].lib.json文件名必须和属性name保持一致(" . $name . ")\n";
			}
			/*
			for($i = 0, $len = count($lib->classes); $i < $len; $i++){
				echo "\t" . $lib->classes[$i] . "\n";
			}
			*/
			$l['name'   ] = $name;             //lib的名字
			$l['mtime'  ] = $mtime;            //文件修改时间
			$l['app'    ] = $lib->app;         //主APP类
			$l['libs'   ] = $lib->libs;        //依赖的其他的lib
			$l['classes'] = $lib->classes;     //依赖的其他的class
		//$l['include'] = '';                //依赖的函数
			$l['files'  ] = array();           //依赖的类(实际计算所得)
			$this->modified = true;
		}
	}
	function addDependLib($name, $libName){
		$this->modified = true;
		$this->libs[$name]['files'][] = $libName;  //保存依赖的文件
	}
	function getLibByName($name){
		return $this->libs[$name];
	}
	function getClassByName($name){
		if(!array_key_exists($name, $this->classes)){
			//echo "[error]" . $name . "\n";
			$this->fileClass->analyzeClassFile($name);
		}
		return $this->classes[$name];
	}
	/**
	 * 保存依赖关系数据
	 */
	function save($force=false){
		if($force || $this->modified){  //如果强制保存或者缓存被修改过，则保存
			ksort($this->classes);
			ksort($this->libs);
			$arr = array(
				'classes' => $this->classes,
				'libs'    => $this->libs
			);
			file_put_contents($this->filename, serialize($arr));  //保存缓存文件
		}
	}
}