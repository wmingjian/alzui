<?php
require_once('JsFile.php');

/**
 * 模板文件类
 */
class JsTplFile extends JsFile {
	var $json = null;
	var $util = null;
	function __construct($name, $filepath, $conf, $util){
		parent::__construct($name, $filepath);
		$this->conf = $conf;
		$this->json = $this->loadJsonConf();
		$this->util = $util;
	}
	function process(){
		//$str = $this->data;
		$str = "runtime.regTpl(__TPL__);";
		$str = str_replace('__TPL__', $this->createTpl($this->name), $str);
		return $str;
	}
	/**
	 * 创建一个模板数据文件
	 */
	function createTpl($name){
		global $G_cfg;
		$files = $this->json->tpl;  //tpl属性内存储的是文件列表
		if(count($files) == 0){  //没有内容
			$tpl = '[]';
		}else{
			$tpl = $this->util->build_tpl($name, $files);
			if($G_cfg['tpl_charset'] != 'utf-8'){  // && function_exists('mb_convert_encoding')
				$tpl = mb_convert_encoding($tpl, 'utf-8', $G_cfg['tpl_charset']);
			}
		}
		return $tpl;
	}
}