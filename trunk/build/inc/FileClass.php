<?php
require_once('CodeCache.php');

/**
 * 文件编译处理基类
 */
class FileClass {
	var $jsc_import = '/(?:^|\n)_import\(\"([\w\.]+)\"\);/';
	var $css_import = '/\n@import \"((?:[amw]ui-)?[\w\-]+\.css)\";/';
	var $re_class = '/_class\(\"(\w+)\", (\w+|\"\"), function\(\)\s*\{/';
	var $cache = null;
	var $names = array();
	function __construct(){
		$this->cache = new CodeCache($this);
	}
	function log($str){
		echo $str;
	}
	/**
	 * 判断JS文件是否属于框架中的文件
	 */
	function isAuiLib($name){
		switch($name){
		case '__init__mini.lib.js':
		case 'core.lib.js':
		case 'ui.lib.js':
		case 'ui_action.lib.js':
		case 'debug.lib.js':
			return true;
		default:
			return false;
		}
	}
	function createLibFile($libJson){
	}
	function getFileContent($className){
		global $G_cfg, $G_config;
		$arr = explode('.', $className);
		//[TODO]特殊处理mail.app.AppMailInfo类
		if($className == "mail.app.AppMailInfo"){
			$suffix = '_' . $G_config->map_short_name[$G_cfg['product']];
		}else{
			$suffix = '';
		}
		//$this->log("  import " . $className . "\n");
		$file = ($arr[0] == 'alz' ? $G_cfg["path_class0"] : $G_cfg["path_class"]) . str_replace('.', '/', $className) . $suffix . ".js";
		return file_get_contents($file);
	}
	/**
	 * 引入一个JS类文件
	 * 通常：$matches[0] 是完整的匹配项
	 * $matches[1] 是第一个括号中的子模式的匹配项
	 * 以此类推
	 */
	function importJsClass($matches){
		global $G_cfg;
		$className = $matches[1];
		$data = $this->getFileContent($className);
		$arr = explode('.', $className);
		if($className == "alz.copyright"){
			$data = preg_replace('/__VERSION__/', '0.0.8', $data);
		}else if($className == "mail.copyright"){
			$data = preg_replace('/__VERSION__/', '1.0.2.0018', $data);
		}else{
			//类文件，分析类依赖关系
			$this->analyzeClassFile($className);
		}
		if($arr[0] == 'alz'){
			//$data = mb_convert_encoding($data, 'utf-8', 'gb2312');
			$data = mb_convert_encoding($data, 'UTF-8', 'UTF-8,GB2312,CP936,ISO-8859-1');
		}else if($G_cfg['class_charset'] != 'utf-8'){
			$data = mb_convert_encoding($data, 'utf-8', $G_cfg['class_charset']);
		}
		$data = trim(preg_replace($this->re_class, '_class("\1", \2, function(_super){', $data));
		if($G_cfg['debug']){
			$data = preg_replace('/\n\tthis\.(\w+)(\s+=\s+)function\(/', "\n\tthis.\\1\\2function " . str_replace(".", "_", $className) . "\$\\1(", $data);
		}
		//$data = preg_replace($this->re_class, '_class("\1", \2, function(_super, __super__){', $data);
		//$data = preg_replace('/_super\._init\.call\(this\);/', '__super__(this, "_init");', $data);
		if($className == "alz.copyright" || $className == "mail.copyright"){
			return $data;
		}else{
			return "\n\n/*#file begin=" . $className . ".js" . "*/\n"
				. $data
				. "\n/*#file end*/";
		}
	}
	function aaa($name){
		global $G_cfg;
		$file = $G_cfg["path_class0"] . str_replace('.', '/', $name);
		if(file_exists($file . ".js")){
			$file .= ".js";
		}else if(file_exists($file . "_mini.js")){
			$file .= "_mini.js";
		}else{
			$file = $G_cfg["path_class"] . str_replace('.', '/', $name);
			if(file_exists($file . ".js")){
				$file .= ".js";
			}else if(file_exists($file . "_mini.js")){
				$file .= "_mini.js";
			}
		}
		return $file;
	}
	/**
	 * 分析一个JS类的依赖关系
	 */
	function analyzeClassFile($name){
		global $G_cfg, $G_config;
		//[TODO]特殊处理mail.app.AppMailInfo类
		if($name == "mail.app.AppMailInfo"){
			$name .= '_' . $G_config->map_short_name[$G_cfg['product']];
		}else{
			$name .= '';
		}
		if(!$this->cache->classExists($name)){  //类还没有分析过，才分析
			$file = $this->aaa($name);
			$this->cache->addClass($name, $file);
			$data = file_get_contents($file);
			array_push($this->names, $name);
			preg_replace_callback($this->jsc_import, array($this, 'importJsClass2'), $data);
			array_pop($this->names);
		}
	}
	/**
	 * 依赖关系分析中，引入一个JS类文件
	 */
	function importJsClass2($matches){
		$className = $matches[1];
		$name = $this->names[count($this->names) - 1];
		$this->cache->addDependClass($name, $className);  //添加依赖关系
		$this->analyzeClassFile($className);  //递归分析所有依赖的类
	}
	/**
	 * 检查目录是否存在，不存在则创建
	 */
	function checkFilePath($root, $file){
		$arr = explode('/', $file);
		$arr_path = array();
		for($i = 0, $len = count($arr) - 1; $i < $len; $i++){
			array_push($arr_path, $arr[$i]);
			$dir = $root . join('/', $arr_path);
			if(!file_exists($dir)){
				$this->log("[mkdir]" . $dir . "\n");
				mkdir($dir);
			}
		}
		//return array($arr_path, $filename, array_pop($arr));
	}
	/**
	 * 把 java 字符串转换为 js 字符串
	 * @param s 要转换成 JS 字符串的 java 字符串
	 */
	function toJsString($s){
		$sb = array();
		for($i = 0, $len = strlen($s); $i < $len; $i++){
			$ch = substr($s, $i, 1);
			switch($ch){
			case "\\": array_push($sb, "\\\\");break;
			case "\r": array_push($sb, "\\r");break;
			case "\n": array_push($sb, "\\n");break;
			case "\t": array_push($sb, "\\t");break;
			case "\'": array_push($sb, "\\\'");break;
			case "\"": array_push($sb, "\\\"");break;
		//case "&": array_push($sb, "\\x26");break;
		//case "<": array_push($sb, "\\x3C");break;
		//case ">": array_push($sb, "\\x3E");break;
			default: array_push($sb, $ch);break;
			}
		}
		return join("", $sb);
	}

	//
	// TODO: Remove the html structures been commented up.
	//
	function build_tpl($lib_name, $files){
		global $G_cfg;
		//$this->log("build tpl " . $lib_name . "\n");
		//$re_template = '/^<!-- template name=\"(\w+\.tpl)\" type=\"(html|tpl|asp|tmpl|xml)\"( params=\"[^\"]+\")*( title=\"[^\"]+\")* -->/';
		$re_template = '/<template name=\"(\w+\.tpl)\" type=\"(html|tpl|asp|tmpl|xml)\"(?: params=\"([^\"]+)\")*( title=\"[^\"]+\")*>/';
		$arr = array();
		for($i = 0, $len = count($files); $i < $len; $i++){
			//$this->log("  tpl " . $files[$i] . "\n");
			$file = $G_cfg['path_dev'] . $G_cfg["path_tpl"] . $files[$i];
			$file = str_replace("sinamail-ent", "sinamail-5.7", $file);
			if(!file_exists($file)) continue;
			$tpl = file_get_contents($file);
			$tpl = preg_replace('/\r?\n/'  , "\n" , $tpl);
			//$tpl = preg_replace('/\n\t+</', "\n<", $tpl);
			$tpl = preg_replace('/\n\t+/', "\n", $tpl);
			$tpl = str_replace("<" . "?xml version=\"1.0\" encoding=\"utf-8\"?" . ">", "", $tpl);
			if(preg_match($re_template, $tpl, $matches)){
				$tpl = preg_replace($re_template, "", $tpl);
				$tpl = preg_replace('/<\/template>/', "", $tpl);
				$tpl = preg_replace('/#(nbsp|quot|lt|gt|copy|emsp|deg|amp);/', "&\\1;", $tpl);  //处理改动过的HTML实体
				array_push($arr, "{"
					. "name:\"" . $matches[1] . "\","
					. "type:\"" . $matches[2] . "\","
					. ($matches[2] == "asp" && $matches[3] != null && $matches[3] != "" ? "params:\"" . $matches[3] . "\"," : "")
					. "tpl:\"" . $this->toJsString(trim($tpl)) . "\""
					. "}");
				//print(" end\n");
			}else{
				;//print("没有找到模板 " . $files[$i] . " 的标识信息\n");
			}
		}
		return "[\n\t" . join(",\n\t", $arr) . "\n]";
	}
	/**
	 * 引入一个CSS文件
	 */
	function importCssFile($matches){
		//$this->log("  import /" . $matches[1] . "\n");
		$data = file_get_contents($this->path_src . "/" . $matches[1]);
		#$data = preg_replace('/@charset \"utf-8\";/', '', $data);
		return "\n\n/*#file begin=" . $matches[1] . "*/\n"
			. $data
			. "\n/*#file end*/";
	}
	/**
	 * 收缩一段CSS代码
	 */
	function pack_css($data){
		$data = preg_replace('/\n( |\t)+/', "\n", $data);  //删除行首空白字符
		$data = preg_replace('/( |\t)+\n/', "\n", $data);  //删除行尾空白字符
		$data = preg_replace('/\r?\n/', "\n", $data);      //删除\r
		//$data = str_replace("\r", "", $data);    //删除\r
		//$data = str_replace("\n\t", "", $data);
		$data = preg_replace('/ +/', " ", $data);
		//$data = str_replace("  ", " ", $data);
		$data = str_replace("\t", " ", $data);   //"\t" 转换为 " "
		$data = str_replace("{\n", "{", $data);
		//$data = str_replace(";\n", ";", $data);
		$data = str_replace("\n}", "}", $data);
		$data = str_replace("{ ", "{", $data);
		$data = str_replace(": ", ":", $data);
		$data = str_replace("; ", ";", $data);
		$data = str_replace(" ,", ",", $data);
		$data = str_replace(", ", ",", $data);
		$data = str_replace(" {", "{", $data);
		$data = str_replace("}.", "}\n.", $data);
		$data = str_replace(",.", ",\n.", $data);
		//$data = str_replace(";}", "}", $data);
		//return $data;
		return $this->compress($data, 1);
	}
	/**
	 * Compress and optimize contents of a CSS buffer.
	 * add by allex (@xiaoniu, 04 December 2010, 11:15:11 PM)
	 */
	function compress($buffer, $mode)
	{
		// remove multiline comments, new lines, tabs and single line comments
		// $buffer = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $buffer);  
		$buffer = preg_replace_callback('/(\/\*.*?\*\/|\n|\t|\n\/\/.*?\n)/sim',
			create_function(
				'$matches',
				'return "";'
			), $buffer);
	 
		// remove all around in ",", ":" and "{"
		$buffer = preg_replace_callback('/\s?(,|{|:){1}\s?/sim',
			create_function(
				'$matches',
				'return $matches[1];'
			), $buffer);
	 
		// prevent triggering IE6 bug: http://www.crankygeek.com/ie6pebug/
		$buffer = preg_replace('/:first-l(etter|ine){/', ':first-l$1 {', $buffer);

		// add the semicolon where it's missing.
		$buffer = preg_replace('/([^;{}])}/sim', '$1;}', $buffer);

		// replace 0(px,em,%) with 0.
		$buffer = preg_replace('/([\s:])(0)(px|em|%|in|cm|mm|pc|pt|ex)/sim', '$1$2', $buffer);

		// Replace multiple semi-colons in a row by a single one
		$buffer = preg_replace('/;+/sim', ';', $buffer);

		// normalize all whitespace strings to single spaces. easier to work with that way.
		$buffer = preg_replace('/[\r\n\t]+/sim', ' ', $buffer);
		$buffer = preg_replace('/\s+/sim', ' ', $buffer);

		if ($mode == 1) {
			$buffer = str_replace("}", "}\n", $buffer);
			$buffer = preg_replace('/@(?:import|charset) [^;]+;/', "$0\n", $buffer);
		}

		return $buffer;
	}
}