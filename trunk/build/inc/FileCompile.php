<?php
require_once('FileClass.php');

/**
 * 基于批量发布的文件生成工具
 */
class FileCompile extends FileClass {
	//路径设置
	var $path_product = "";  //产品目录
	var $path_src = "";      //源目录   $path_css
	var $path_dest = "";     //目标目录
	//配置开关
	var $incSubDir = false;  //是否处理子目录
	var $virtual = false;    //是否虚拟目录
	var $type = "";          //要处理的文件类型
	var $act = "";           //执行的处理动作
	//文件列表
	var $files = array();      //待处理
	var $skipFiles = array();  //可忽略处理
	function log($str){
		echo $str;
	}
	function init($type, $subDir, $pathSrc, $pathCache, $pathDest, $virtual=false){
		global $G_cfg;
		$this->path_product = $G_cfg['path_dev'] . 'products/' . $G_cfg['product'] . '/';
		//$this->log("\n[dir] pathSrc=" . $pathSrc . ",pathDest=" . $pathDest);
		$this->type = $type;
		$this->incSubDir = $subDir;
		$this->path_src = $pathSrc;
		$this->path_dest = $pathCache . $pathDest;
		$this->checkFilePath($pathCache, $pathDest . "/");
		$this->files = $this->loadFiles();
	}
	function start($act = ""){
		$this->act = $act;
		switch($this->type){
		case ".js":
			$this->do_virtualDir('js/');
			//include_once("Json.php");
			//$json = new Services_JSON();
			//$json->encode
			$this->cache->save();
			break;
		default:
			$this->do_dir("/");
		}
	}
	/**
	 * 根据产品目录下的js/files.json文件加载需要处理的全部js文件
	 */
	function loadFiles(){
		include_once("Json.php");
		$json = new Services_JSON();
		return $json->decode(file_get_contents($this->mappath('js/files.json')));
	}
	function addSkipFile($name){
		array_push($this->skipFiles, $name);
	}
	function canSkip($name){
		for($i = 0, $len = count($this->skipFiles); $i < $len; $i++){
			if($name == $this->skipFiles[$i]){
				return true;
			}
		}
		return false;
	}
	/**
	 * 目录映射
	 */
	function mappath($vpath){
		return $this->path_product . $vpath;
	}
	/**
	 * 处理一个虚拟目录中的所有文件
	 */
	function do_virtualDir($path){
		include_once("Json.php");
		$json = new Services_JSON();
		$files = $json->decode(file_get_contents($this->mappath($path . 'files.json')));
		foreach($files as $k => $v){
			//echo $path . $k . "\n=>" . $v . "\n";
			$this->do_jsFile('/' . $k, $v);
		}
	}
	/**
	 * 处理一个目录(css,js)
	 */
	function do_dir($path){
		$this->log("build dir " . $path . "\n");
		foreach(glob($this->path_src . $path . "*") as $file){
			$name = basename($file);
			if($this->incSubDir && is_dir($file)){  //如果是子目录
				$dirname = $path . $name . "/";
				if(!file_exists($this->path_dest . $dirname)){
					$this->log("mkdir " . $dirname . "\n");
					mkdir($this->path_dest . $dirname);
				}
				$this->do_dir($dirname);
			}else{
				if(strpos($name, $this->type) === false) continue;
				switch($this->type){
				case ".css":
					$this->do_cssFile($path . $name, $name);
					break;
				case ".js" :
					if(array_key_exists($name, $this->files)){
						if($this->act == "min"){
							$this->do_zipJsFile($path . $name);
						}else{
							$this->do_jsFile($path . $name);
						}
					}
					break;
				case ".tpl.json":
					$this->do_tplFile($path . $name);
					break;
				case ".xml":
					if(substr($name, 0, 1) != "_"){
						$this->do_xmlFile($path . $name);
					}
					break;
				}
			}
		}
	}
	/**
	 * 处理一个XML模版文件(tpl)
	 */
	function do_xmlFile($path){
		$this->log("build file " . $path . "\n");
		$doc = new DOMDocument();
		$doc->load($this->path_src . $path);
		/*
		$items = $doc->getElementsByTagName("template");
		for($i = 0; $i < $items->length; $i++){
			//$this->log($items->item($i)->tagname() . "\n");
			print_r($items->item($i));
		}
		*/
		//print_r($nodes);
	}
	function do_zipJsFile($path){
		include_once('JSMin.php');
		$this->log("build file[zip js]" . $path . "\n");
		$jsMin = new JSMin($this->path_dest . $path);
		$jsMin->minfile($this->path_src . $path);
	}
	/**
	 * 处理一个文件(css,js)
	 */
	function do_tplFile($path){
		//echo $name . $this->type . "\n";
		$this->log("build file " . $path);
		$this->log("\n");
		echo $this->path_src . "\n";
		echo $this->path_dest . "\n";
	}
	/**
	 * 处理一个文件
	 * 该函数可以处理的文件后缀名的含义如下：
	 * .css     样式表文件
	 * .conf.js 产品配置文件
	 * .lib.js  脚本库文件
	 * .tpl.js  模板数据文件
	 */
	function do_jsFile($path, $realpath=''){
		global $G_cfg, $G_files;
		$this->log("build file " . $path);
		if($realpath == ''){
			$filepath = $this->path_src . $path;
		}else{
			$filepath = $G_cfg['path_dev'] . $realpath;
		}
		$name = basename($filepath);  //$name = $path;
		if($this->isAuiLib($name)){
			$filepath = $G_cfg['path_dev'] . 'alzui/src/lib/' . $name;
		}
		$skip = false;
		if($skip){
			$this->log(" [no process]\n");
		}else{
			$data = "";
			if($this->canSkip($name)){
				$this->log(" [no pack]\n");
				if(!file_exists($filepath)){
					$this->log("\n");
					$this->log("[warning]source file not exist(" . $filepath . ")");
				}
				$data = file_get_contents($filepath);
			}else{
				$this->log("\n");
				$fileutil = null;
				$conf = array_key_exists($name, $G_files) ? $G_files[$name] : 1;  //需要进行预处理的文件
				//工厂模式
				switch($conf['type']){
				case 'conf':  //产品配置文件
					include_once('ProductConfig.php');
					$fileutil = new ProductConfig($name, $filepath, $conf, $this);
					break;
				case 'lib':  //脚本库文件(lib.js)，自动构建库文件
					include_once('JsLib.php');
					$fileutil = new JsLibFile($name, $filepath, $this);
					break;
				case 'tpl':  //模板数据文件(tpl.js)
					include_once('JsTpl.php');
					$fileutil = new JsTplFile($name, $filepath, $conf, $this);
					break;
				case '':
				default:
					//$filename = $G_cfg['path_dev'] . $file;
					//copy($filename, $this->path_dest . basename($filename));
					//echo file_get_contents($filename);
					//copy($filepath, $this->path_dest . $path);
					include_once('JsFile.php');
					$fileutil = new JsFile($name, $filepath);
					break;
				}
				$data = $fileutil->process();
			}
			file_put_contents($this->path_dest . $path, $data);  //生成缓存文件
			return $data;
		}
	}
	function do_cssFile($file, $name){
		global $G_mail_config;
		$filepath = $this->path_src . $file;
		$name = basename($filepath);
		$skip = !(strpos($name, "wui-") === false && strpos($name, "aui-") === false);
		if(!$skip){
			$this->log("build file " . $file);
			$data = file_get_contents($filepath);
			if($this->canSkip($name)){
				$this->log(" [no pack]\n");
			}else{
				$this->log("\n");
				$data = preg_replace_callback($this->css_import, array($this, "importCssFile"), $data);
				$data = $this->pack_css($data);
			}
			//$data = preg_replace('/www\.sinaimg\.cn/', 'www.sina-img.cn', $data);
			$path_img = $G_mail_config['_IMAGE_PATH_'];
			$data = preg_replace('/([\(\'\"])\.\.\/images\//', '\1' . $path_img, $data);

			if(preg_match('/\d+\/_skin\.css$/', $file)){  //如果是皮肤文件的话
				//$G_mail_config['_PATH_SKIN_']
				$data = $this->processSkinFile($file, $data);
			}else{
				$data = preg_replace('/([\(\'\"])\.\.\/\.\.\/images\//', '\1' . $path_img, $data);
			}
			file_put_contents($this->path_dest . $file, $data);
		}
	}
	function doSkinFile(){
		
	}
	//处理一个皮肤文件
	function processSkinFile($file, $data){
		global $G_cfg, $skin_color, $G_mail_config;
		include_once($G_cfg['path_skin'] . 'colors.php');
		preg_match('/\/(\d+)\/_skin\.css$/', $file, $matches);
		$skinid = $matches[1];
		/*
		$G_config->loadConfig();
		$skinid = $G_mail_config['_SKIN_ID_'] + 1;
		$skinid = ($skinid >= 10 ? 'skin0' : 'skin00') . $skinid;
		*/
		$data = preg_replace('/([\(\'\"])images\/\$skinid\$\//', '\1' . $G_mail_config['_PATH_SKIN_']."\$skinid\$/", $data);
		$data = preg_replace('/\$skinid\$/', $skinid, $data);
		if(array_key_exists($skinid, $skin_color)){
			$this->colors = $skin_color[$skinid];
			$data = preg_replace_callback('/\$color(\d+)\$/', array($this, 'doColor'), $data);
			/*
			for($i = 0, $len = count($this->colors); $i < $len; $i++){
			}
			*/
		}
		return $data;
	}
	function doColor($matches){
		return '#' . $this->colors[(int)$matches[1]];
	}
	function precompile($path, $filename, $project){
		//return preg_replace(file_get_contents($filename), "/(\{|;|:)/", "$1");
		$data = file_get_contents($path . $filename);
		$data = $this->pack_css($data);
		if($project == "dotcn"){
			$data = str_replace("url(../images/skin001", "url(../../images/skin004", $data);
			$data = str_replace("url(../images", "url(../../images", $data);
		}else{
			$data = str_replace("url(http://www.sinaimg.cn/rny/sinamail421/images", "url(../../images", $data);
		}
		$data = str_replace("@charset \"utf-8\";", "", $data);
		$data = str_replace("/* CSS Document */\n", "", $data);
		return "/* ---- " . $filename . " ---------------------------------------------------------- */\n"
			. $data;
	}
}