<?php
require_once('FileCompile.php');
require_once("JSMin.php");
require_once("Archive.php");

/**
 * 邮箱前端代码发布工具
 */
class Publish{
	var $src_class;
	/**
	 * [TODO]可以选择性的压缩文件
	 */
	function main($argc, $argv){
		global $G_cfg, $G_config;
		$product = $argv[2];
		$G_config->init($product);  //重新初始化，覆盖product.conf文件中缓存的当前产品编号设置
		switch($argv[1]){
		case "all"   : $this->publish_all($product);break;
		case "jsmin" : $this->publish_jsmin($product);break;
		case "js"    : $this->publish_js($product);break;
		case "tpl"   : $this->publish_tpl($product);break;
		case "css"   : $this->publish_css($product);break;
		case "skin"  : $this->publish_skin($product);break;
		case "img"   : $this->publish_img($product);break;

		case "min_js"  : $this->min_js();break;
		case "min_css" : $this->min_css();break;
		case "pack_css": $this->pack_css($product, $argv[3]);break;
		case "pack"    : $this->pack_js ($product);break;
		default        : break;
		}
	}
	function publish_all($product){
		global $G_mail_config, $G_config;
		//保证和真实环境一致
		$G_mail_config['_IMAGE_PATH_'] = preg_replace('/(www|i\d+)\.sina-img\.cn/', 'www.sinaimg.cn', $G_mail_config['_IMAGE_PATH_']);
		$G_mail_config['_PATH_SKIN_'] = preg_replace('/(www|i\d+)\.sina-img\.cn/', 'www.sinaimg.cn', $G_mail_config['_PATH_SKIN_']);

		//编译(合并，预处理)JS文件
		echo "====publish js====\n";
		$this->publish_js($product);
		//$this->publish_jsmin($product);

		//echo "====publish tpl====\n";
		//$this->publish_tpl($product);  //在publish_js中一起发布了

		/*
		//压缩上面刚合并生成的JS文件
		echo "====publish js min file====\n";
		$src = $G_config->getenv('path_cache') . $product . '/js/src/';
		$out = $G_config->getenv('path_cache') . $product . '/js/min/';
		$file = new FileClass();
		$file->checkFilePath($G_config->getenv('path_cache'), $product . '/js/min/');
		$this->publish_jsmin($product, $src, $out);
		*/

		//发布CSS文件
		echo "====publish css====\n";
		$this->publish_css($product);

		//发布皮肤文件（不包含图片）
		echo "====publish skin====\n";
		$this->publish_skin($product);

		/*
		//生成要发布的zip包
		echo "====publish zip file====\n";
		$name = $G_config->map_short_name[$product];
		$date = date("ymd");
		$this->publish_zip("cache/js-$name-$date-src.zip", $G_config->getenv('path_cache') . $product . '/js/src');
		$this->publish_zip("cache/js-$name-$date-min.zip", $G_config->getenv('path_cache') . $product . '/js/min');
		$this->publish_zip("cache/css-$name-$date-src.zip", $G_config->getenv('path_cache') . $product . '/css');
		$this->publish_zip("cache/skins-$name-$date-src.zip", $G_config->getenv('path_cache') . $product . '/skins');
		*/

		echo "[END]Last updated on " . date("Y-m-d H:i:s");
	}
	function publish_zip($file, $path){
		echo "zip $file\n";
		$ziper = new zip_file($file);
		$ziper->set_options(array(
			'basedir'    => $path,
			'inmemory'   => 1,
			'recurse'    => 1,
			'storepaths' => 1
		));
		$ziper->add_files(array(
			"*.js",
			"*.css",
			"*.jpg",
			"*.jpeg",
			"*.gif",
			"*.png"
		));
		//$ziper->store_files("*.js");
		$ziper->create_archive();
		file_put_contents($file, $ziper->archive);
		//$ziper->download_file();  // Send archive to user for download
	}
	/**
	 * 发布压缩的js文件
	 */
	function publish_jsmin($product, $src='', $out=''){
		global $G_cfg, $G_mail_config, $G_config, $G_files;
		if($src == ''){
			$src = str_replace('{#path_svn}', $G_cfg['path_svn'], str_replace('{#path_root}', $G_cfg['path_root'] . "\\", $G_mail_config['_SRC_PATH_']));
		}
		if($out == ''){
			$out = str_replace('{#path_svn}', $G_cfg['path_svn'], str_replace('{#path_root}', $G_cfg['path_root'] . "\\", $G_mail_config['_OUT_PATH_']));
		}
		foreach($G_files as $k => $v){
			$c = substr($v['flag'], $G_config->pid, 1);
			if($c == " ") continue;  //忽略该文件
			if(!file_exists($src . $k)){
				echo '[error]missing file ' . $src . $k . "\n";
				continue;
			}
			$ext = substr($k, strlen($k) - 3);
			if($ext == ".js"){  //如果是js文件
				$t1 = $this->microtime_float();
				echo "build ".$k." ...\n";
				$comments = '';
				$jsMin = new JSMin($out . $k, $comments);
				switch($c){
				case "#":  //框架脚本
					$jsMin->putfile($G_config->getenv('path_class') . 'alz/copyright.js');
					$jsMin->putstr("\n");
					echo "  minfile " . $k . "\n";
					$jsMin->minfile($src . $k);  //压缩
					break;
				case ">":  //应用脚本
					$jsMin->putfile($G_config->getenv('path_class') . 'mail/copyright.js');
					$jsMin->putstr("\n");
					echo "  minfile " . $k . "\n";
					$jsMin->minfile($src . $k);  //压缩
					break;
				case "=":  //其他脚本
					echo "  putfile " . $k . "\n";
					//[TODO]应该直接复制文件，无需jsmin参与
					$jsMin->putfile($src . $k);  //不压缩
					break;
				}
				/*
				$files = explode("+", $v);
				for($i = 0, $len = count($files); $i < $len; $i++){
					if(strstr($files[$i], "copyright") != false){  // || strstr($k, "mailcore") != false
						echo "  putfile " . $files[$i]."\n";
						$jsMin->putfile($src . $files[$i]);
					}else{
						echo "  minfile " . $files[$i]."\n";
						$jsMin->minfile($src . $files[$i]);
					}
					$jsMin->putstr("\n");
				}
				*/
				echo "  end ".round(($this->microtime_float() - $t1) * 1000)." ms\n";
			}
		}
	}
	/**/
	/**
	 * 发布js文件
	 */
	function publish_jsmin1($product){
		global $G_cfg, $G_config;
		$compile = new FileCompile();
		$compile->init(".js", false,  //是否处理子目录
			$G_config->getenv('path_cache') . $product . '/js/src',
			$G_config->getenv('path_cache'), $product . '/js'
		);
		$compile->addSkipFile("data_50.js");
		$compile->addSkipFile("data_cn.js");
		$compile->addSkipFile("data_app.js");

		$compile->addSkipFile("aui.js");
		$compile->addSkipFile("console.js");
		$compile->addSkipFile("init.js");
		$compile->addSkipFile("mail_tray.js");
		$compile->addSkipFile("space_tray.js");
		$compile->start("min");
	}
	/**
	 * 发布js文件
	 */
	function publish_js($product){
		global $G_cfg, $G_config;
		$compile = new FileCompile();
		$compile->init(".js", false,  //是否处理子目录
			//$G_cfg['path_dev'] . 'js',
			$G_cfg['path_dev'] . 'products/' . $product . '/js',
			$G_config->getenv('path_cache'), $product . '/js/src',
			true  //是否虚拟目录
		);
		//$compile->addSkipFile("__init__mini.lib.js");
		//$compile->addSkipFile("core.lib.js");
		//$compile->addSkipFile("ui.lib.js");
		$compile->addSkipFile("mailcore_mini.js");
		$compile->start("compile");
	}
	/**
	 * 发布css文件
	 */
	function publish_css($product){
		global $G_cfg, $G_config;
		$compile = new FileCompile();
		$compile->init(".css", true,  //是否处理子目录
			$G_cfg['path_dev'] . 'products/' . $product . '/css',
			$G_config->getenv('path_cache'), $product . '/css'
		);
		$compile->addSkipFile("free42.css");
		$compile->addSkipFile("suggest.css");
		$compile->start();
	}
	/**
	 * 发布tpl文件
	 */
	function publish_tpl($product){
		global $G_cfg, $G_config;
		$compile = new FileCompile();
		$compile->init(".tpl.json", false,  //是否处理子目录
			$G_cfg['path_dev'] . 'js/tpl',
			$G_config->getenv('path_cache'), $product . '/tpl'
		);
		$compile->start();
	}
	/**
	 * 处理tpl文件
	 */
	function publish_tpl___($product){
		global $G_cfg, $G_config;
		$compile = new FileCompile();
		$compile->init(
			".xml",
			false,  //是否处理子目录
			$G_cfg['path_dev'] . substr($G_cfg["path_tpl"], 0, strlen($G_cfg["path_tpl"]) - 1),
			$G_config->getenv('path_cache'), $product . '/tpl'
		);
		$compile->start();
	}
	/**
	 * 发布皮肤文件(skin)
	 * [TODO]单独发布皮肤时需要加载cfg-sinamail-xx.php文件
	 */
	function publish_skin($product){
		global $G_cfg, $G_config;
		$compile = new FileCompile();
		$compile->init(".css", true,  //是否处理子目录
			$G_cfg['path_dev'] . 'skins',
			$G_config->getenv('path_cache'), $product . '/skins'
		);
		$compile->start();
	}
	/**
	 * 发布images文件
	 */
	function publish_img($product){
	}
	/**
	 * 工具函数
	 */
	function microtime_float(){
		list($usec, $sec) = explode(" ", microtime());
		return ((float)$usec + (float)$sec);
	}
	/**
	 * 合并脚本
	 */
	function pack_js($conf){
		include($conf);
		$src = $build["src"];
		$out = $build["out"];
		$this->src_class = $src . "../classes/";
		foreach($build as $k => $v){
			if($k == "src" || $k == "out") continue;
			$fsource = $src.$k.".lib0.js";
			$foutput = $out.$k.".lib.js";
			if(!file_exists($fsource)){
				echo "source file not exist(" . $fsource . ")\n";
			}else{
				$fdata = file_get_contents($fsource);
				$fdata = preg_replace_callback("/\n_import\(\"(\w+)\"\);/", array($this, "pre_import"), $fdata);
				$fdata = mb_convert_encoding($fdata, "utf-8", "gb2312");  //iconv("gb2312", "utf-8", $fdata)
				file_put_contents($foutput, $fdata);
			}
		}
	}
	/**
	 * 通常：$matches[0] 是完整的匹配项
	 * $matches[1] 是第一个括号中的子模式的匹配项
	 * 以此类推
	 */
	function pre_import($matches){
		global $G_cfg;
		$file = $G_cfg["path_class"] . $matches[1] . ".js";
		//echo $file."\n";
		return "\n/*#file begin=" . $matches[1].".js" . "*/\n"
			. file_get_contents($this->src_class . $file)
			. "\n/*#file end*/";
	}
	function min_js(){
		//$copy = file_get_contents("copyright.txt");
		$files = explode(",", "__init__mini.js,core.lib.js,ui.lib.js,mailui.lib.js,address.lib.js,addresslist.lib.js,prototype.js");
		$src = "..\\src\\";
		$out = ".\\debug\\";
		for($i = 0, $len = count($files); $i < $len; $i++){
			echo "\nbuild ".$out.$files[$i];
			system("type ".$src.($files[$i] != "prototype.js" ? "copyright.txt" : "copyright_prototype.txt")." > ".$out.$files[$i]);
			system("jsmin.exe < ".$src.$files[$i]." >> ".$out.$files[$i]);
		}
		system("php mailcore.php > ".$out."mailcore.js");
	}
	function min_css(){
	}
	function pack_css($product, $overlay){
		if($product == "dotcn"){
			$path = "d:\\workspace\\free3in1-dotcn\\css\\";
			$pathto = "d:\\usr\\local\\sinaimg\\rny\\sinamail421\\css\\dotcn\\";
		}else{
			$path = "d:\\workspace\\free3in1-4.2.1\\css\\";
			$pathto = "d:\\usr\\local\\sinaimg\\rny\\sinamail421\\css\\sinamail421\\";
		}
		$compile = new FileCompile();
		$c = "@charset \"utf-8\";"
			. "\n/* CSS Document */"
			. "\n" . $compile->precompile($path, "main.css")
			. "\n" . $compile->precompile($path, "contact.css")
			. "\n" . $compile->precompile($path, "maillist.css")
			. "\n" . $compile->precompile($path, "mailinfo.css")
			. "\n" . $compile->precompile($path, "popwin.css")
			. ($product == "dotcn" ? "\n" . $compile->precompile($path, "seed.css") : "")
			. "\n" . $compile->precompile($path, "skin001.css");
		if($overlay == "-o"){
			$cssFileName = "theme.css";
			$backupFileName = "theme_" . date("ymd_His") . "_backup" . ".css";
			if(rename($pathto . $cssFileName, $backupFileName)){
				echo $backupFileName . "backup end\n";
			}
		}else{
			$cssFileName = "theme_" . date("ymd_His") . ".css";
		}
		file_put_contents($pathto . $cssFileName, $c);
		echo $cssFileName . " merge end\n";
	}
}