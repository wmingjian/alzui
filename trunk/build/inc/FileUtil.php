<?php
require_once('FileClass.php');
//require_once('Cache.php');

/**
 * 基于HTTP请求的文件生成工具
 */
class FileUtil extends FileClass {
	//路径设置
	var $path_src = "";      //源目录   $path_css
	var $path_dest = "";     //目标目录
	//真实的www.sinimg.cn的IP地址
	#var $host_sinaimg_ip = "61.135.153.190";  //家里
	#var $host_sinaimg_ip = "202.108.33.122";  //公司里1
	var $host_sinaimg_ip = "202.108.43.230";   //公司里2
	var $re_name = "/.*\/([^\/]+)\$/";
	var $re_ext  = "/.*\.([^\.]+)\$/";
	var $mimetype = array(
		/*"bmp"  => "image/x-xbitmap",*/
		"gif"  => "image/gif",
		"jpg"  => "image/jpg",
		"png"  => "image/png",
		"js"   => "text/javascript",
		"css"  => "text/css",
		"xml"  => "text/xml",
		"htm"  => "text/html",
		"html" => "text/html"
	);
	var $patterns = array(
		'css'    => array('/\/rny\/sinamail\d{2}\/css\/\d+(_\d+)*\//'            , 'css/'     ),
		'images' => array('/\/rny\/sinamail\d{2}\/images\/\d+(_\d+)*\//'         , 'images/'  ),
		'skins'  => array('/\/rny\/sinamail\d{2}\/skins\/\d+\/(\d+)\//'          , 'skins/$1/'),
		'js'     => array('/\/rny\/sinamail\d{2}\/js\/(\d+(_\d+)*)\//'           , 'js/'      ),
		'app'    => array('/\/rny\/sinamail\d{2}\/webface\/(\w)(_\d+(_\d+)*)*\//', '$1/'      )
	);
	var $color = null;
	function log($str){
		//echo $str;
	}
	function mappath($file){
		global $G_cfg, $G_files;
		$type = '';
		$realfile = '';
		$name = preg_replace($this->re_name, "\\1", $file);
		$ext  = preg_replace($this->re_ext , "\\1", $file);
		$conf = null;
		foreach($this->patterns as $k => $v){
			if(preg_match($v[0], $file, $matches)){  //css
				$type = $k;
				$file = preg_replace($v[0], $v[1], $file);
				break;
			}
		}
		/*
		//某个特殊日期的映射到对应日期的目录中，主要用于调试线上扒下来的代码
		$file = preg_replace('/\/rny\/sinamail\d{2}\/090409\//'      , "js/090409/" , $file);
		//$file = preg_replace('/\/rny\/ria\/sinamail\d{2}\/(\d+)\//', "js/"        , $file);
		*/
		if($type == "app"){
			$realfile = "products/cn_mailapp" . $file;
			echo $realfile;
		}else if($type == "css" || $type == "images"){
			$realfile = "products/" . $G_cfg['product'] . "/" . $file;
		}else if($type == "js"){
			if(strpos($file, ".lib.js") !== false){  //如果是lib文件
				$realfile = preg_replace('/^js\//', ($this->isAuiLib($name) ? 'alzui/src/' : 'js/') . 'lib/', $file);
			}else if(strpos($file, ".tpl.js") !== false){  //如果是tpl文件
				$realfile = preg_replace('/^js\//', 'js/lib/', $file) . "on";  //js->json
			}else{
				$realfile = $file;
			}
			//js文件有配置信息
			$conf = array_key_exists($name, $G_files) ? $G_files[$name] : 1;  //需要进行预处理的文件
		}else{
			$realfile = $file;
		}
		return array(
			'type'     => $type,
			'file'     => $file,
			'realfile' => $realfile,
			'conf'     => $conf,
			'name'     => $name,
			'ext'      => $ext
		);
	}
	function do_get($file){
		global $G_cfg, $G_config, $G_files;
		$G_config->loadConfig();
		$basepath = $G_cfg['path_dev'];
		if(strpos($file, "/rny/") !== false){
			//data_xxx_xx.js => data_xxx.js
			$file = preg_replace('/data_(\w+)_\d+\.js$/', 'data_$1.js', $file);
			if(file_exists($G_cfg['path_root'] . $file)){
				$ext = preg_replace($this->re_ext , "\\1", $file);
				header("Content-Type: " . $this->mimetype[$ext] . ($ext == "js" ? "; charset=utf-8" : ""));
				echo file_get_contents($G_cfg['path_root'] . $file);
			}else{
				//if($G_cfg['product'] == "sinamail-5.2"){  //复用5.0的css和images
				//	$path_product = 'products/sinamail-5.0/';
				//}
				$F = $this->mappath($file);
				$ct = $F['conf']['type'];
				$filename = $basepath . $F['realfile'];
				if(($ct == 'lib' || $ct == 'tpl') && file_exists($filename . 'on') || file_exists($filename)){
					header("Content-Type: " . $this->mimetype[$F['ext']] . ($F['ext'] == "js" ? "; charset=utf-8" : ""));
					switch($F['type']){
					case "js":
					case "json":
						$F['name'] = strtolower($F['name']);
						$F['ext'] = strtolower($F['ext']);
						//[TODO]这种获取$F['name']的方式有问题
						//$F['name'] = str_replace('js/lib/', '', $F['realfile']);
						//$F['name'] = str_replace('js/tpl/', '', $F['name']);
						//$F['name'] = str_replace('js/', '', $F['name']);
						if(preg_match('/\/js\/\d+\//', $F['file'])){  //调试线上代码用的分支
							echo file_get_contents($filename);
						}else{
							$this->path_root = $basepath;
							switch($ct){  //标志是否lib,tpl文件
							case 'lib':
							case 'tpl':
								$this->path_src = $G_cfg[$this->isAuiLib($F['name']) ? "path_lib0" : "path_lib"] . 'lib/';
								break;
							default:
								$this->path_src = $G_cfg["path_lib"];
								break;
							}
							$this->checkFilePath($G_config->getenv('path_cache'), 'http-' . $G_cfg["product"] . '/js/src/' . $F['name']);
							$this->path_dest = $G_config->getenv('path_cache') . 'http-' . $G_cfg["product"] . '/js/src/';
							echo $this->do_jsFile($F['name'], $F['conf']);
						}
						break;
					case "skins":
						if($F['ext'] == "css"){
							$dir = preg_replace('/_skin\.css$/', '', $F['realfile']);
							$this->path_src = $basepath . $dir;
							$this->checkFilePath($G_config->getenv('path_cache'), 'http-' . $G_cfg["product"] . '/' . $dir);
							$this->path_dest = $G_config->getenv('path_cache') . 'http-' . $G_cfg["product"] . '/' . $dir;
							$this->do_cssFile($F['realfile'], $F['name']);
						}else{  //皮肤中的图片
							echo file_get_contents($filename);
						}
						break;
					case "css":
						$this->path_src = $basepath . "products/" . $G_cfg['product'] . '/css';
						$this->checkFilePath($G_config->getenv('path_cache'), 'http-' . $G_cfg["product"] . '/css/');
						$this->path_dest = $G_config->getenv('path_cache') . 'http-' . $G_cfg["product"] . '/css/';
						$this->do_cssFile($F['realfile'], $F['name']);
						break;
					case "images":
					default:
						echo file_get_contents($filename);
						break;
					}
				}else{
					header("HTTP/1.1 404 Not Found");
					//die(header("HTTP/1.1 404 Not Found"));
				}
			}
			$this->cache->save();
		}elseif(strpos($file, "/pay/") !== false){
			$ext = strtolower(preg_replace($this->re_ext, "\\1", $file));
			header("Content-Type: " . $this->mimetype[$ext]);
			echo file_get_contents($basepath . $file);
		}elseif(strpos($file, "/shtml/") !== false){
			$ext = strtolower(preg_replace($this->re_ext, "\\1", $file));
			header("Content-Type: " . $this->mimetype[$ext]);
			echo file_get_contents($basepath . $file);
		}else{
			//[TODO]缓存真实服务器上面的文件
			$ext = strtolower(preg_replace($this->re_ext, "\\1", $file));
			header("Content-Type: " . $this->mimetype[$ext]);
			echo $this->get_file("http://www.sinaimg.cn" . $file);
			//echo file_get_contents("http://" . $this->host_sinaimg_ip . $file);
		}
	}
	/*
	function do_get($file){
		global $G_cfg, $G_files;
		if(strpos($file, "/rny/") !== false){
			$file = preg_replace("/\/rny\/sinamail5\d\/images\/(\d+)\//", $G_cfg['path_dev'] . "images/"   , $file);
			$file = preg_replace("/\/rny\/sinamail5\d\/css\/(\d+)\//"   , $G_cfg['path_dev'] . "css/"      , $file);
			//$file = preg_replace("/\/rny\/ria\/sinamail5\d\/081231\//", $G_cfg['path_dev'] . "js/081231/", $file);
			$file = preg_replace("/\/rny\/ria\/sinamail5\d\/(\d+)\//"   , $G_cfg['path_dev'] . "js/"       , $file);
			if(file_exists($G_cfg['path_root'] . $file)){
				$name = strtolower(preg_replace($re_name, "\\1", $file));
				$ext  = strtolower(preg_replace($re_ext , "\\1", $file));
				header("Content-Type: " . $mimetype[$ext] . ($ext == "js" ? "; charset=utf-8" : ""));
				if($ext == "js" && array_key_exists($name, $G_files) && $G_files[$name] != 1){  //自动 build .lib.js 代码
					echo $this->do_jsFile($name);
				}else
					echo file_get_contents($G_cfg['path_root'] . $file);
			}else{
				header("HTTP/1.1 404 Not Found");
				//die(header("HTTP/1.1 404 Not Found"));
			}
		}elseif(strpos($file, "/pay/") !== false){
			$ext = strtolower(preg_replace($re_ext, "\\1", $file));
			header("Content-Type: " . $mimetype[$ext]);
			echo file_get_contents($G_cfg['path_root'] . $file);
		}else{
			//[TODO]缓存真实服务器上面的文件
			$ext = strtolower(preg_replace($re_ext, "\\1", $file));
			header("Content-Type: " . $mimetype[$ext]);
			echo $this->get_file("http://www.sinaimg.cn" . $file);
			//echo file_get_contents("http://" . $host_sinaimg_ip . $file);
		}
	}
	*/
	function get_file($url){
		$request = "GET " . $url . " HTTP/1.1\r\n"
			."Accept: image/gif, image/x-xbitmap, image/jpeg, image/pjpeg, application/x-shockwave-flash, */*\r\n"
			//, application/msword, application/vnd.ms-excel, application/x-ms-application, application/x-ms-xbap, application/vnd.ms-xpsdocument, application/xaml+xml
			."Accept-Language: zh-cn\r\n"
			."Accept-Encoding: gzip, deflate\r\n"
			."User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)\r\n"
			."Host: www.sinaimg.cn\r\n"
			//."Keep-Alive: 300\r\n"
			//."Connection: Keep-Alive\r\n"
			."\r\n";
		$socket = @fsockopen($this->host_sinaimg_ip, 80, $err_no, $err_str, 30);
		if($socket === false){
			echo $err_no . "|" . $err_str;
			exit;
		}
		fwrite($socket, $request);

		$response_headers = array();
		$response_keys    = array();
		$line = fgets($socket, 8192);
		while(strspn($line, "\r\n") !== strlen($line)){
			//echo $line;
			@list($name, $value) = explode(':', $line, 2);
			$name = trim($name);
			$response_headers[strtolower($name)][] = trim($value);
			$response_keys[strtolower($name)] = $name;
			$line = fgets($socket, 8192);
		}
		sscanf(current($response_keys), '%s %s', $_http_version, $_response_code);
		$response_body = fread($socket, (int)$response_headers['content-length'][0]);
		$code = $this->unGzip($response_body);
		fclose($socket);
		return $code;
	}
	function unGzip($content){
		$singal = "\x1F\x8B\x08";
		$slen = strlen($singal);
		if(substr($content, 0, $slen) == $singal){
			$content = substr($content, 10);
			$content = gzinflate($content);
		}
		return $content;
	}
	function canSkip($file){
		return false;
	}
	/**
	 * 处理一个文件
	 * 该函数可以处理的文件后缀名的含义如下：
	 * .css     样式表文件
	 * .conf.js 产品配置文件
	 * .lib.js  脚本库文件
	 * .tpl.js  模板数据文件
	 */
	function do_jsFile($path, $conf=null){
		global $G_cfg, $G_files;
		$this->log("build file " . $path);
		$filepath = $this->path_src . $path;
		$name = basename($filepath);  //$name = $path;
		if(!$G_cfg["gen_lib"] && file_exists($this->path_dest . $path)){  //如果缓存存在，则直接输出缓存文件
			return "/* cache */" . file_get_contents($this->path_dest . $path);
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
					//$filename = $G_cfg['path_root'] . $file;
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
		global $G_cfg, $G_mail_config;
		$fsrc  = $G_cfg['path_dev'] . $file;  //源文件
		$fdest = $this->path_dest . $name;  //目标文件
		$t0 = filemtime($fsrc);
		if(file_exists($this->path_dest . $name)){
			$t1 = filemtime($fdest);
		}else{
			$t1 = 0;
		}
		if(true || $t0 > $t1){  //如果修改过的话，则生成缓存文件
			$data = file_get_contents($fsrc);

			//简单处理CSS文件中引用的图片路径
			$data = preg_replace_callback($this->css_import, array($this, "importCssFile"), $data);
			$data = $this->pack_css($data);
			//$data = preg_replace('/www\.sinaimg\.cn/', 'www.sina-img.cn', $data);
			$path_img = $G_mail_config['_IMAGE_PATH_'];
			$data = preg_replace('/([\(\'\"])\.\.\/images\//', '\1' . $path_img, $data);

			if(preg_match('/\d+\/_skin\.css$/', $file)){  //如果是皮肤文件的话
				$data = $this->processSkinFile($file, $data);
			}/*else{
				$data = preg_replace('/([\(\'\"])\.\.\/\.\.\/images\//', '\1' . $path_img, $data);
			}*/
			file_put_contents($fdest, $data);  //保存到缓存目录
			touch($fdest, $t0, $t0);  //标记时间
			echo $data;  //输出文件内容
		}else{  //直接使用缓存
			echo file_get_contents($fdest);
		}
	}
	function doSkinFile(){
		
	}
	//处理一个皮肤文件
	function processSkinFile($file, $data){
		global $G_cfg, $G_config, $skin_color, $G_mail_config;
		include_once($G_cfg['path_skin'] . 'colors.php');
		preg_match('/\/(\d+)\/_skin\.css$/', $file, $matches);
		$skinid = $matches[1];
		/*
		$G_config->loadConfig();
		$skinid = $G_mail_config['_SKIN_ID_'] + 1;
		$skinid = ($skinid >= 10 ? 'skin0' : 'skin00') . $skinid;
		*/
		$data = preg_replace('/([\(\'\"])images\//', '\1' . $G_mail_config['_PATH_SKIN_'], $data);
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
}