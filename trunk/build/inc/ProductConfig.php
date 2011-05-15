<?php
require_once('JsFile.php');

/**
 * 产品配置类
 */
class ProductConfig extends JsFile {
	var $json = null;
	var $util = null;
	function __construct($name, $filepath, $conf, $util){
		parent::__construct($name, $filepath);
		$this->conf = $conf;
		$this->json = $this->loadJsonConf();
		$this->util = $util;
	}
	function process(){
		$this->loadData();
		$str = $this->data;
		$str = str_replace('__TPL__'  , $this->createTpl($this->name), $str);
		$str = str_replace('__PAPER__', $this->createPaper($this->name), $str);
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
	/**
	 * 根据信纸配置信息创建产品配置文件中的信纸数据
	 * [TODO]
	 * (1)自动遍历文件夹下面的所有paperxx.html文件
	 * (2)信纸CSS中不应该{$path_img}
	 * (3)[END]path_img,path_out目前在程序中是写死的
	 */
	function createPaper($name){
		global $G_cfg, $G_config, $G_mail_config;
		$path_src = $G_cfg['path_dev'] . 'html/paper/';
		//$path_img = $this->_json->path_img;
		$path_out = $G_config->getenv('path_cache') . "css/paper/";
		$arr = array();
		$papers = $this->json->paper;  //信纸id列表
		for($i = 0, $len = count($papers); $i < $len; $i++){
			$id = $papers[$i];
			$fdata = file_get_contents($path_src . "paper" . $id . ".html");
			$fdata = preg_replace('/\r?\n/', "\n", $fdata);
			list($title)         = $this->get_str($fdata, array('<title>', '</title>'));
			list($thumb)         = $this->get_str($fdata, array('<meta name="thumb" content="', '" />'));
			list($xx, $width)    = $this->get_str($fdata, array('<table class="sinamailpaper-', '" width="', '"'));
			list($css, $a, $tpl) = $this->get_str($fdata, array('<style>', '</style>', '<body>', '</body>'));
			$css = $this->min_css($css);

			if(false){  //重写信纸css文件
				$cssdata = "@charset \"utf-8\";" . $css;
				$cssdata = preg_replace('/\{\$path_img\}/', $G_mail_config['_IMAGE_PATH_'], $cssdata);
				$cssdata = preg_replace('/(\.sinamailpaper)/', "\r\n$1" , $cssdata);
				file_put_contents($path_out . $id . ".css", $cssdata);
			}

			$tpl = preg_replace('/<table class=\"sinamailpaper-(\d+)\" width=\"([^\"]+)\"/', '<table class="{\$paperid}" width="{\$width}"', $tpl);
			$tpl = $this->rep_str($tpl, "<!-- begin content -->", "<!-- end content -->", "{\$content}");
			array_push($arr, "{"
				. "id:{$id},"
				. "title:\"" . $title . "\","
				. "style:\"paper/{$id}.css\","
				. "icon:\"paper/" . $thumb . "\","  //thumb{$id}.jpg //editor/ico_no.gif
				. "content:\"\","
				. "w:\"" . ($width != "" ? $width : "99%") . "\","
				. "css:'" . preg_replace('/\r?\n/', '', $this->min_css($css)) . "',"
				. "tpl:'" . $this->min_html($tpl) . "'"
				. "}");
		}
		return mb_convert_encoding('[' . join(",\n", $arr) . ']', 'utf-8', 'gb2312');
	}
	function get_str($str, $arr){
		$vars = array();
		$p2 = strpos($str, $arr[0]);
		if($p2 === false){
			for($i = 0, $len = count($arr) - 1; $i < $len; $i++){
				array_push($vars, "");
			}
		}else{
			for($i = 0, $len = count($arr) - 1; $i < $len; $i++){
				$s1 = $arr[$i];
				$s2 = $arr[$i + 1];
				$p1 = $p2;
				$p5 = $p1 + strlen($s1);
				$p2 = strpos($str, $s2, $p5);
				array_push($vars, substr($str, $p5, $p2 - $p5));
			}
		}
		return $vars;
	}
	function rep_str($str, $s1, $s2, $rep){
		$p1 = strpos($str, $s1);
		$p2 = strpos($str, $s2, $p1);
		$p3 = $p2 + strlen($s2);
		return substr($str, 0, $p1) . $rep . substr($str, $p3);
	}
	//"/http:\/\/www\.sinaimg\.cn\/rny\/sinamail50\/images\/(\d+\/)?/"
	function min_css($css){
		$search = array(
			//'/@charset \"utf-8\";/',
			'/images\//',
			'/\/\*[^\*]*\*\//',
			'/\r?\n/',
			'/\'/',
			'/\n[^\{]+\{\}/',  //去掉没有内容的样式条目
			'/\n+/'            //去掉多余的换行符
		);
		$replace = array(
			//"",
			"{\$path_img}",
			"",
			"\n",
			"\\\'",
			"\n",
			"\n"
		);
		return preg_replace($search, $replace, $css);
	}
	function min_html($tpl){
		$tpl = preg_replace('/>\n[\t ]*</', '><', $tpl);
		$search = array(
			'/images\//',
			'/\r?\n(\t+)*/',
			//'/sinamailpaper-\d+/',
			'/mail_stationery/',
			'/\'/'
		);
		$replace = array(
			"{\$path_img}",
			"",
			//"{$paperid}",
			"{\$stationery_id}",
			"\\\'"
		);
		return preg_replace($search, $replace, $tpl);
	}
}