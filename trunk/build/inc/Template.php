<?php
/**
 * 模板引擎
 */
class Template{
	var $path_js;
	var $path_test;
	var $path_tmpl;
	var $path_tpl;
	var $path_class;
	var $path_json;
	function init(){
		global $G_cfg;
		//pathcss="/html<{$_CSS_PATH_}>"
		//pathlib="http://www.sina-img.cn/rny/ria/lib/"
		//pathapp="http://www.sina-img.cn/rny/ria/4_2_1/"
		$this->path_js    = $G_cfg['path_dev'] . "js/";
		$this->path_test  = $G_cfg['path_dev'] . "test/";
		$this->path_tmpl  = $G_cfg['path_dev'] . $G_cfg["path_tmpl"];
		$this->path_tpl   = $G_cfg['path_dev'] . $G_cfg["path_tpl" ];
		$this->path_class = $G_cfg['path_dev'] . "src/classes/";
		$this->path_json  = $G_cfg['path_dev'] . "src/json/";
	}
	//模拟smarty引擎的接口
	function assign($key, $value){
		global $G_mail_config;
		$G_mail_config[$key] = $value;
	}
	function display($name){
		echo $this->loadTmpl($name);
	}
	/**
	 * 处理模板的逻辑在 Smarty 变量处理之前，这样就可以在模板中使用 Smarty 变量了
	 * @param $name 模板名，带tmpl后缀
	 * @param $hashtable 存储模板变量的哈希表
	 */
	function loadTmpl($name, $hashtable=null){
		global $G_cfg, $G_config, $G_mail_config;

		if(!file_exists($this->path_tmpl.$name)){
			echo "模板文件 " . $name . " 不存在";
		}

		$fdata = file_get_contents($this->path_tmpl . $name);
		$fdata = mb_convert_encoding($fdata, "gb2312", "utf-8");

		//预处理调试状态下加载的脚本库
		if($G_cfg["debug"] && $name == "index.tmpl"){
			if($G_cfg["debug"]){
				//$script_code = " codeprovider=\"/build/lib.php?lib={filename}\"";
				$script_code = " codeprovider=\"".$G_mail_config['_JS_VERSION_']."{filename}.js\"";
			}else{
				$script_code = "";
			}
			//$script_config = "<script type=\"text/javascript\" src=\"/classic/mailconfig.php\"></script>";
			$script_config = "";
			$script_init   = "<script type=\"text/javascript\" src=\"<{\$_JS_VERSION_}>__init__mini.lib.js\"";
			$fdata = str_replace($script_init, $script_config . "\r\n" . $script_init . $script_code, $fdata);
		}
		//$fdata = str_replace('__init__mini.js', '__init__mini.lib.js', $fdata);
		if(false && $G_cfg["debug"]){  //如果在调试模式下，则加载调试脚本库
			$fdata = str_replace('lib="core,ui,mailui', 'lib="core,ui,debug,mailui', $fdata);
		}

		//预处理模板包含指令
		$fdata = preg_replace_callback("/<!-- template name=\"(\w+\.tpl)\" -->/", array($this, "pre_template"), $fdata);

		//生成缓存的 tmpl 模板
		if($G_cfg["gen_tmpl"]){
			$fcache = $G_config->getenv('path_cache') . "tmpl/" . $name;
			file_put_contents($fcache, mb_convert_encoding($fdata, "utf-8", "gb2312"));
		}

		$hash = $G_mail_config;
		foreach($hash as $k => $v){
			//echo $k . "=" . $v;
			//preg_replace('/<\{\$(\w+)\}>/', "\n", $fdata);
			$fdata = preg_replace('/<\{\$' . $k . '\}>/', $v, $fdata);
		}
		if($hashtable != null){
			$hash = $hashtable;
			foreach($hash as $k => $v){
				$fdata = preg_replace('/<\{\$' . $k . '\}>/', $v, $fdata);
			}
		}
		$fdata = mb_convert_encoding($fdata, "utf-8", "gb2312");

		//生成缓存的 html 模板
		if($G_cfg["gen_html"]){
			$fcache = $G_config->getenv('path_cache') . "html/" . str_replace(".tmpl", ".html", $name);
			file_put_contents($fcache, $fdata);
		}
		return $fdata;
	}
	/**
	 * 通常：$matches[0] 是完整的匹配项
	 * $matches[1] 是第一个括号中的子模式的匹配项
	 * 以此类推
	 */
	function pre_template($matches){
		$file = $this->path_tpl.$matches[1];
		//echo $file."\n";
		return file_get_contents($file);
	}
}