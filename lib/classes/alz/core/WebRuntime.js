_package("alz.core");

_import("alz.lang.Exception");
//_import("alz.core.DOMUtil");
//_import("alz.core.AjaxEngine");
//_import("alz.mui.Component");
//_import("alz.mui.Workspace");

_class("WebRuntime", "", function(){
	this._init = function(){
		_super._init.call(this);
		//调试及其它各种开关选项
		this._startTime = __start;   //系统代码开始执行的时间戳
		this._debug = false;         //系统是否处于调试状态
		this._globalName = "__runtime__";  //多Runtime环境下的全局唯一变量的名字

		//路径配置
		this.pathSep   = "/";  //目录分割符
		this.pathAui   = "/alzui/";     //alzui内核所在目录("http://www.iiios.net:8081/alzui/")
		this.classpath = this.pathAui + "classes/";     //默认的类文件存储目录
		this.pathLib   = this.pathAui + "lib/";         //默认的类库包存储目录
		this.pathApp   = this.pathAui + "netapp/";      //app所在根目录
		this.pathSrv   = this.pathAui + "data/";        //服务端程序的根目录
		this.pathHtml  = this.pathAui + "html/";        //HtmlApp 目录
		this.pathTpl   = this.pathLib + "res/tpl/";     //tpl模版文件目录
		this.pathCss   = this.pathLib + "res/css/";     //css文件目录
		this.pathImg   = this.pathLib + "res/images/";  //图片资源
		this.pathSkin  = this.pathLib + "skin/win2k/";  //皮肤(图标)
		this.pathPlugin = this.pathAui + "plugins/";    //插件目录

		//运行时环境所在的宿主，为运行时环境提供统一的环境接口
		this._global   = null;  //保存唯一的一个全局 this 的指针
		this._host     = null;  //运行时环境的宿主对象（宿主环境）
		this._hostenv  = "";    //宿主环境(特别的宿主:hta,chm)
		this._config   = {};    //系统配置变量（含义参见文档说明）
		/**
		 * conf配置信息说明
		 * debug   boolean 是否调试状态
		 * runmode number  运行模式
		 * skinid  string  默认皮肤id
		 * action  string  默认触发的动作(mini版使用)
		 * aulFile string  默认启动的aul文件
		 * screen  string  桌面屏幕组件的DOM容器id
		 */
		this._conf = {};
		this._tpls = {};       //模板库集合
		this._srvFiles = {};  //服务的文件列表
		this._parentRuntime = null;  //父WebRuntime对象
		this._libManager = null;  //库文件管理者
		this._libLoader = null;   //库文件加载器
		this._contextList = {};   //上下文环境对象列表
		this._libContext = null;  //当前lib的上下文环境对象
		this._plugins = {};       //注册的插件列表
		this._log = [];  //日志缓存

		//浏览器环境下在可能有的接口
		this._win      = null;  //运行时环境所在的 window 对象
		this._doc      = null;
		this._domScript = null;  //script DOM 对象
		this.ie = false;      //是否IE浏览器
		this.ff = false;      //是否FireFox
		this.ns = false;      //是否Netscape
		this.opera = false;   //是否Opera
		this.safari = false;  //是否Safari
		this.chrome = false;  //是否谷歌浏览器
		this.moz = false;     //是否Mozilla系列浏览器
		this.ie5 = false;     //是否IE5
		this.ie55 = false;    //是否IE5.5
		this.ie6 = false;     //是否IE6
		this.ie7 = false;     //是否IE7
		this.ff1 = false;     //是否FF1
		this.ff2 = false;     //是否FF2
		this.max = false;     //是否Maxthon
		this.tt = false;      //是否TencentTraveler

		this._win = __global;
		this._doc = this._win.document;
		this._checkBrowser();

		//探测是否 Gadget 运行环境
		this.inGadget = !!(this._win.System && this._win.System.Gadget);  //typeof System != "undefined"
		this.option = {  //Gadget相关属性
			timer:2000,  //检查新邮件的时间间隔
			newMailNum:0  //新邮件数量
		};
		this._files = {};  //已经加载的js或css文件
		this._boxModel = this.ie ? 0 : 1;
		this._info = null;
		this._testDiv = null;
		this._zIndex = 0;
		this._components = [];

		//core.lib
		//this.dom = null;   //{DOMUtil}
		//this._ajax = null;  //{AjaxEngine}

		//ui.lib
		//this._workspace = null;

		this._funs = [];
		this.__eventHandle = null;
		this._inited = false;
	};
	this.init = function(){
		this.exportInterface(this._win);  //导出全局变量
		this._checkHostEnv();
		this._pathCss = this._config["pathcss"];
		//this._pathCss = this._products[this._productName].pathCss;
		this._pathSkin = this._config["pathskin"];
		this.pathPlugin = this._config["pathplugin"];

		this._libManager = new LibManager();

		if(this._config["skin"]){
			var url = this.pathLib + "skin/" + this._config["skin"] + "/skin.css";
			this._doc.write("<link"
				+ " rel=\"stylesheet\""
				+ " type=\"text/css\""
				+ " href=\"" + url + "\""
				+ " />");
		}
		this._preLoadFile("css", this._pathCss, this._config["css"].split(","), this._pathSkin);
		if(this._config["plugin"]){  //如果有插件，加载插件的CSS文件
			var plugins = this._config["plugin"].split(",");
			for(var i = 0, len = plugins.length; i < len; i++){
				var plugin = plugins[i];
				this._preLoadFile("css", this.pathPlugin + plugin + "/css/", [plugin + ".css"]);
				this._preLoadFile("js" , this.pathPlugin + plugin + "/js/" , [plugin + ".js" ]);
				plugin = null;
			}
			plugins = null;
		}
		if(this._config["autotest"]){  //加载自动测试文件
			this._doc.write('<script type="text/javascript" src="' + this._config["autotest"] + '" charset=\"utf-8\"></sc'+'ript>');
		}

		var _this = this;
		this.__eventHandle = function(ev){
			_this.eventHandle(ev || _this._win.event);
		};
		if(this._doc.attachEvent){
			try{  //下面这句在WinXP+IE6下报错，所以加上防错处理
				this._doc.execCommand("BackgroundImageCache", false, true);
			}catch(ex){
			}
			this._doc.attachEvent("onreadystatechange", this.__eventHandle);
		}else{
			this._doc.addEventListener("DOMContentLoaded", this.__eventHandle, false);
		}
		if(this.safari || this.chrome){
			this.addEventListener(this._win, "load", this.__eventHandle);
		}
		this.addEventListener(this._win, "unload", this.__eventHandle);
		this.addEventListener(this._win, "resize", this.__eventHandle);
		var types = ["contextmenu", "mousedown", "mousemove", "mouseup", "keydown", "keypress", "keyup"];
		for(var i = 0, len = types.length; i < len; i++){
			this.addEventListener(this._doc, types[i], this.__eventHandle);
		}

		if(this._conf["runmode"] == "11"){
			this.onContentLoaded();  //true
			//this._workspace._self.style.position = "absolute";
			//this._workspace.setOpacity(0.9);
			//this._workspace.moveTo(10, 10);
			//this._workspace.resize(640, 480);
			//if(this._win.onContentLoaded) this._win.onContentLoaded();
		}
		if(this._win.onKernelLoaded){
			this._win.onKernelLoaded();
		}
		if(this._doc.body){
			this.onContentLoaded();
		}
	};
	this.onContentLoaded = function(bNewWorkspace){
		if(this._inited) return;
		this._inited = true;
		var code = this._config["onstartloading"];
		if(code){
			try{
				eval(code);
			}catch(ex){
			}
		}
		//按顺序执行构造扩展
		//for(var i = 1, len = this._exts.length; i < len; i++){
		//	this._exts[i].init.call(this);
		//}
		this._libManager.initLoadLib();
		this._newWorkspace = bNewWorkspace;
		//this._workspace = new Screen();
		//this._workspace[this._newWorkspace ? "create" : "bind"](this.getBody());
		if(this.ie){  //IE在此时触发 resize
			this.eventHandle({type:"resize"});  //主动触发一次 resize 事件
		}
		//var _this = this;
		//this.addEventListener(this._win, "mousemove", function(ev){_this.eventHandle(ev || _this._win.event);});
		//this.addEventListener(this._doc.body, "mousemove", function(ev){_this.eventHandle(ev || _this._win.event);});
		this._boxModel = this._testBoxModel();  //探测盒模型
		//[TODO]库代码的加载时机应该更早才对，至少要在 onContentLoaded 之前，最好是在初始化脚本加载并初始化完毕的时候
		var libs = this._config["lib"];  //.replace(/^core,ui,/, "");  //忽略core,ui库代码
		this._libLoader = new LibLoader();
		this._libLoader.init(libs.split(","), this._config["codeprovider"], this, "onLibLoad");
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._doc.detachEvent){
			this._doc.detachEvent("onreadystatechange", this.__eventHandle);
		}else{
			this._doc.removeEventListener("DOMContentLoaded", this.__eventHandle, false);
		}
		if(this.safari || this.chrome){
			this.removeEventListener(this._win, "load", this.__eventHandle);
		}
		this.removeEventListener(this._win, "unload", this.__eventHandle);
		this.removeEventListener(this._win, "resize", this.__eventHandle);
		var types = ["contextmenu", "mousedown", "mousemove", "mouseup", "keydown", "keypress", "keyup"];
		for(var i = 0, len = types.length; i < len; i++){
			this.removeEventListener(this._doc, types[i], this.__eventHandle);
		}
		this.__eventHandle = null;
		for(var k in this._plugins){
			this._plugins[k].dispose();
			delete this._plugins[k];
		}
		this._libContext = null;
		for(var i = 0, len = this._components.length; i < len; i++){
			this._components[i].dispose();
			this._components[i] = null;
		}
		this._components = [];
		this._testDiv = null;
		this._info = null;
		this._libLoader.dispose();
		this._libLoader = null;
		this._libManager.dispose();
		this._libManager = null;
		this._domScript = null;
		this._doc = null;
		this._win = null;
		this._host = null;
		this._parentRuntime = null;
		_super.dispose.apply(this);
	};
	/**
	 * 利用正则匹配 window.navigator.userAgent 来获取浏览器的类型
	 * @param nav {Navigator}
	 * Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; en) Opera 8.00
	 * Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9b4pre) Gecko/2008022005 Minefield/3.0b4pre (.NET CLR 3.5.30729)
	 * Mozilla/5.0 (iPhone; U; CPU iPhone OS 2_2_1 like Mac OS X; zh-cn) AppleWebKit/525.18.1 (KHTML, like Gecko) Version/3.1.1 Mobile/5H11 Safari/525.20
	 */
	this.getHostenv = function(nav){
		//window.alert(this.forIn(nav).join("\n"));
		//window.prompt("", nav.appVersion);  //nav.userAgent
		var re = {
		//"opera" : /Opera\/(\d+(?:\.\d+)+)/,      //Opera/9.10
			"opera" : /Opera[\/\x20](\d+(?:\.\d+)+)/,  //Opera/9.10,Opera 8.00
			"ie"    : /MSIE\x20(\d+(?:\.\d+)+)/,    //MSIE 6.0
			"ff"    : /Firefox\/(\d+(?:\.\d+)+)/,   //Firefox/2.0.0.2
			"ns"    : /Netscape\/(\d+(?:\.\d+)+)/,  //Netscape/7.0
			"safari": /Version\/(\d+(?:\.\d+)+)\x20Safari\/(\d+(?:\.\d+)+)/, //Version/3.0.3 Safari/522.15.5
			"chrome": /Chrome\/(\d+(?:\.\d+)+)\x20Safari\/(\d+(?:\.\d+)+)/,  //Chrome/0.2.149.27 Safari/525.13
			"mf"    : /Minefield\/(\d+(?:\.\d+)+)/  //Minefield/3.0b4pre
		};
		var host = {"os":"unix","env":"unknown","ver":"0","compatMode":""};
		if(nav.platform == "Win32" || nav.platform == "Windows"){
			//"Window NT 5.0" win2k
			//"Window NT 5.1" winxp
			host.os = "win";
		}else if(nav.platform == "Mac68K" || nav.platform == "MacPPC" || nav.platform == "Macintosh"){
			host.os = "mac";
		}else if(nav.platform == "X11"){
			host.os = "unix";
		}
		for(var k in re){
			var arr = re[k].exec(nav.userAgent);
			if(arr){  //re[k].test(nav.userAgent)
				host.env = k == "mf" ? "ff": k;
				host.ver = arr[1];
				host.compatMode = host.env == "ie" && this._doc.compatMode == "BackCompat" ? "BackCompat" : "CSS1Compat";
				if(host.env == "ff" || host.env == "ns"){
					var url = window.location.href;
					if(url.substr(url.length - 4).toLowerCase() == ".xul"){
						host.xul = true;
					}
				}
				break;
			}
		}
		if(host.env == "unknown"){
			runtime.log("[WebRuntime::getHostenv]未知的宿主环境，userAgent:" + nav.userAgent);
		}
		return host;
	};
	/**
	 * 检测浏览器类型
	 */
	this._checkBrowser = function(){
		var nav = this._win.navigator;
		this._host = this.getHostenv(nav);
		this._hostenv = this._host.env;
		this.ie = this._hostenv == "ie";
		this.ff = this._hostenv == "ff";
		this.ns = this._hostenv == "ns";
		this.opera = this._hostenv == "opera";
		this.safari = this._hostenv == "safari";
		this.chrome = this._hostenv == "chrome";
		this.moz = this.ns || this.ff;  //nav.product == "Gecko";
		this.ie6 = nav.userAgent.indexOf("MSIE 6.0") != -1;
		this.ie7 = nav.userAgent.indexOf("MSIE 7.0") != -1;
		this.ff1 = nav.userAgent.indexOf("Firefox/1.0") != -1;
		this.ff2 = nav.userAgent.indexOf("Firefox/2.0") != -1;
		this.max = nav.userAgent.indexOf("Maxthon") != -1;
		this.tt = nav.userAgent.indexOf("TencentTraveler") != -1;
		/*
		if(this.ie && this.max && this.tt){
			this._win.alert(
						"您同时开启了Maxthon和腾讯TT浏览器，两个浏览器"
				+ "\n可能会相互影响导致系统出现一些小问题。"
				+ "\n解决方法：请先打开Maxthon，然后再打开腾讯TT。"
			);
		}
		*/
	};
	/**
	 * 检测并初始化宿主环境中 script 标签所定义的配置信息
	 * [TODO]
	 *  1)如果页面是动态生成，并且直接一次性写入的，会导致无法正确定位 alzui 系统
	 *    位置，原因在于对 script 元素的查询默认最后一个问题。
	 */
	this._checkHostEnv = function(){
		//路径设置
		if(!this._domScript){
			var ol = this._doc.getElementsByTagName("script");
			this._domScript = ol[ol.length - 1];  //最后一个script标签
		}
		//判断是否包含当前上下文环境的名字，就靠它来识别引入初始化文件的SCRIPT标签的
		var url = this._domScript.src || this._domScript.getAttribute("src");
		if(url.indexOf(__context__.__name) == -1){
			while(true){
				this._domScript = this._domScript.nextSibling;
				if(this._domScript.nodeType == 1 && this._domScript.tagName == "SCRIPT"){
					break;
				}
			}
		}

		//配置信息
		var keys = [
			"src",
			"pathlib", "pathapp", "pathcss", "pathskin", "pathimg", "pathtpl", "pathplugin",
			"css", "lib", "plugin",
			"conf", "runmode", "skinid", "skin", "codeprovider", "autotest", "action",
			"onstartloading"  //开始加载时执行的代码
		];
		for(var i = 0, len = keys.length; i < len; i++){
			var key = keys[i];
			var value = this._domScript.getAttribute(key);
			this._config[key] = value != null ? value : "";
		}
		this._conf = this.parseJson(this._config["conf"] || "{}");
		var rt = this.getMainWindow().runtime;
		if(rt && !("skinid" in this._conf)){
			this._conf["skinid"] = rt._conf["skinid"];
		}
		if(rt && this._config["codeprovider"] == ""){
			this._config["codeprovider"] = rt._config["codeprovider"];
		}
		rt = null;
		var config = this._config;
		var conf = this._conf;
		for(var k in config){
			if(typeof config[k] != "string") continue;
			config[k] = config[k].replace(/\{\$(\w+)\}/g, function(_0, _1){
				if(_1 in conf){
					if(_1 == "skinid"){
						var no = "" + (parseInt(conf[_1]) + 1);
						//return "000".substr(0, 3 - no.length) + no;
						return no;
					}else{
						return conf[_1];
					}
				}else{
					return _0;
				}
			});
		}
		conf = null;
		config = null;

		//路径检测

		//定位 alzui 系统路径
		var path = this._config["src"];
		var arr = (/^(.+)(\\|\/)[^\\\/]+$/ig).exec(path);  //this._win.location
		if(arr){
			this.pathSep  = arr[2];
			this.pathAui = arr[1] + arr[2];
			//path = path.substring(0, path.lastIndexOf(this.pathSep) + 1).replace(/lib\/$/, "")
			this._setPathAui(path.substring(0, path.lastIndexOf(this.pathSep) + 1).replace(/lib\/$/, ""));
		}else{
			this.showException("未能正确定位 alzui 系统位置");
			return;
		}
		//定位 WebApp 的路径
		var url = "" + window.location;
		this.pathApp = url.substr(0, url.lastIndexOf("/") + 1);  //[TODO]pathApp的含义已经改变

		this._extendSystemObject();
	};
	this._preLoadFile = function(ext, path, files, pathSkin){
		for(var i = 0, len = files.length; i < len; i++){
			var file = files[i], skin = false;
			if(file.charAt(0) == "#"){
				file = file.substr(1).replace(/(\d+)\.css$/, "$1/_skin.css");
				skin = true;
			}
			var url = (skin ? pathSkin : path) + file;
			this._files[url] = true;  //标识已经加载
			if(ext == "css"){
				if(!this._host.xul){
					this._doc.write('<link rel="stylesheet" type="text/css" media="all" href="' + url /*+ '?' + new Date().getTime()*/ + '" />');
				}
			}else if(ext == "js"){
				if(!this._host.xul){
					this._doc.write('<script type="text/javascript" charset=\"utf-8\" src="' + url /*+ '?' + new Date().getTime()*/ + '"></sc'+'ript>');
				}else{
					var obj = this._doc.createElement("script");
					obj.type = "text/javascript";
					obj.charset = "utf-8";
					obj.src = url;
					this._doc.documentElement.appendChild(obj);
					obj = null;
				}
			}
		}
	};
	this.dynamicLoadFile = function(ext, path, files, pathSkin){
		for(var i = 0, len = files.length; i < len; i++){
			var file = files[i], skin = false;
			if(file.charAt(0) == "#"){  //皮肤文件
				file = file.substr(1).replace(/(\d+)\.css$/, "$1/_skin.css");
				skin = true;
			}
			var url = (skin ? pathSkin : path) + file;
			if(url in this._files) continue;  //如果已经加载，则忽略
			this._files[url] = true;  //标识已经加载
			if(ext == "css"){
				var link = this._doc.createElement("link");
				link.type  = "text/css";
				link.rel   = "stylesheet";
				link.media = "all";
				link.href  = url;
				this._domScript.parentNode.appendChild(link, this._domScript);
				link = null;
			}else if(ext == "js"){
				var loader = new ScriptLoader();
				loader.create(this, function(){});
				loader.load(url, "", true);  //this.getUrlByName(lib)
				loader = null;
			}
		}
	};
	/**
	 * 测试可能有跨域问题的代码
	 */
	this._testCrossDomainWindow = function(win, type){
		try{
			switch(type){
			case 0:  //访问parent属性
				var p = win.parent && win.runtime;
				break;
			case 1:  //访问__main__flag属性
				if(win.__main__flag && win.runtime){
					return true;
				}else{
					return false;
				}
			case 2:  //对__main__flag赋值
				if(win.runtime){
					win.__main__flag = true;
				}else{
					throw new Exception("[WebRuntime::_testCrossDomainWindow]");
				}
				break;
			case 3:  //测试location属性访问
				win.locaiton.pathname.indexOf("/");
				break;
			}
			return true;
		}catch(ex){
			return false;
		}
	};
	/**
	 * 获取同域的顶层 window 对象
	 * 按照逐级查找 window.parent 对象，并测试赋值的思路实现
	 * NOTICE!!!兼容性考虑很微妙，影响也很大，请勿随意修改
	 */
	this._getSameDomainTopWindow = function(win){
		var w, p;
		while(true){
			w = p || win;
			if(!this._testCrossDomainWindow(w, 0)){
				return null;
			}
			//if(!this._testCrossDomainWindow(w, 3)){
			//	return null;
			//}
			p = w.parent;
			if(p == null) break;
			if(p == w){
				//允许某个页面可以定义自己为顶层窗体，需要自己实现数据存储接口
				if(this._testCrossDomainWindow(w, 1)){  //如果存在__main__flag属性，直接返回
					return w;
				}
				if(this._testCrossDomainWindow(w, 2)){  //如果可以对__main__flag赋值
					return w;
				}else{
					return null;
				}
			}
			if(!this._testCrossDomainWindow(p, 2)){
				if(this._testCrossDomainWindow(w, 2)){
					return w;
				}else{
					return null;
				}
			}
			p.__main__flag = null;  //delete p.__main__flag;
		}
		return w;
	};
	/**
	 * 这个函数兼容 Vista Gadget 小程序设计，有跨域的容错判断，稳定性应该不错了，
	 * 不要重复设计这个封装过程。
	 * __main__flag 标示 window 对象是当前应用的顶层 window 对象
	 */
	this.getMainWindow = function(){
		var win = this._getSameDomainTopWindow(window);
		if(!this.inGadget){
			try{
				while(win.opener != null){
					var w = this._getSameDomainTopWindow(win.opener);
					if(!w){
						return win;
					}
					//[2009-8-14] chrome浏览器下，前面的测试均可通过，但location访问存在问
					//题，所以在此测试location的可访问性。
					if((this.chrome || this.safari) && !this._testCrossDomainWindow(w, 3)){  //测试location属性访问
						return win;
					}
					win = w;
				}
			}catch(ex){  //防止 window.opener 跨域的错误
			}
		}else{
			win = System.Gadget.document.parentWindow;
			win.__main__flag = true;
		}
		return win;
	};
	this._setPathAui = function(v){
		this.pathAui   = v;
		this.classpath = v + "classes/";
		this.pathLib   = this._config["pathlib"] || v + "lib/";
		this.pathSrv   = v + "data/";
		var ext = this._win && this._win.location.port == "8081" ? ".jsp" : ".asp";
		this._srvFiles["service"] = "service" + ext;
		this._srvFiles["tool"]    = "tool" + ext;
		this._srvFiles["vfs"]     = "vfs" + ext;
		this.pathHtml  = v + "html/";
		this.pathImg   = this.pathLib + "images/";
		this.pathSkin  = this.pathLib + "skin/win2k/";
	};
	/**
	 * 系统对象方法扩展
	 */
	this._extendSystemObject = function(){
		//if(typeof HTMLElement != "undefined" && !window.opera){
		if(this.moz){  //window.HTMLElement
			_p = HTMLElement[__proto];
			_p.__defineGetter__("outerHTML", function(){
				var str = "<" + this.tagName;
				var a = this.attributes;
				for(var i = 0, len = a.length; i < len; i++){
					if(a[i].specified){
						str += " " + a[i].name + '="' + a[i].value + '"';
					}
				}
				if(!this.canHaveChildren){
					return str + " />";
				}
				return str + ">" + this.innerHTML + "</" + this.tagName + ">";
			});
			_p.__defineSetter__("outerHTML", function(s){
				var r = this.ownerDocument.createRange();
				r.setStartBefore(this);
				var df = r.createContextualFragment(s);
				this.parentNode.replaceChild(df, this);
				return s;
			});
			_p.__defineGetter__("canHaveChildren", function(){
				return !/^(area|base|basefont|col|frame|hr|img|br|input|isindex|link|meta|param)$/.test(this.tagName.toLowerCase());
			});
			//if(typeof Event!="undefined" && !window.opera){
			_p = Event[__proto];
			/*_p.__defineSetter__("returnValue", function(b){
				if(!b){
					this.preventDefault();
				}
				return b;
			});*/
			_p.__defineSetter__("cancelBubble", function(b){
				if(b){
					this.stopPropagation();
				}
				return b;
			});
			_p.__defineGetter__("offsetX", function(){
				return this.layerX;
			});
			_p.__defineGetter__("offsetY", function(){
				return this.layerY;
			});
			_p.__defineGetter__("srcElement", function(){
				var n = this.target;
				while(n.nodeType != 1){
					n = n.parentNode;
				}
				return n;
			});
			//}
			XMLDocument[__proto].selectNodes =
			Element[__proto].selectNodes = function(xpath){
				var xpe = new XPathEvaluator();
				var nsResolver = xpe.createNSResolver(this.ownerDocument == null
					? this.documentElement
					: this.ownerDocument.documentElement);
				var result = xpe.evaluate(xpath, this, nsResolver, 0, null);
				var found = [];
				var res;
				while(res = result.iterateNext()){
					found.push(res);
				}
				return found;
			};
			XMLDocument[__proto].selectSingleNode =
			Element[__proto].selectSingleNode = function(xpath){
				var x = this.selectNodes(xpath);
				if(!x || x.length < 1) return null;
				return  x[0];
			};
		}
		_p = null;
	};
	this.addOnLoad = function(fun){
		this._funs.push(fun);
	};
	this.addEventListener = function(obj, type, eventHandle){
		if(obj.attachEvent){
			obj.attachEvent("on" + type, eventHandle);
		}else if(obj.addEventListener){
			obj.addEventListener(type, eventHandle, false);
		}else{
			throw new Exception("[WebRuntime::addEventListener]该浏览器无法对 DOM 元素绑定事件");
		}
	};
	this.removeEventListener = function(obj, type, eventHandle){
		if(obj.detachEvent){
			obj.detachEvent("on" + type, eventHandle);
		}else if(obj.removeEventListener){
			obj.removeEventListener(type, eventHandle, false);
		}else{
			throw new Exception("[WebRuntime::removeEventListenerEventListener]该浏览器无法对 DOM 元素绑定事件");
		}
	};
	/**
	 * 全局事件响应函数
	 * [TODO]
	 *   1)Workspace组件的一些方法属于系统级的，而不是Component组件的
	 *   2)this.getViewPort 和 DOMUtil.getViewPort 代码一致
	 *   3)尽可能早的触发一次 resize 事件，同时在应用初始化完毕再触发一次
	 */
	this.eventHandle = function(ev){
		switch(ev.type){
		case "load":
			if(!(this.safari || this.chrome)) break;
		case "readystatechange":
			if(this._win.attachEvent && this._doc.readyState != "complete"){
				return;
			}
		case "DOMContentLoaded":
			if(this._inited) return;
			this.onContentLoaded();
			//this.init();  //系统初始化
			//window.alert(runtime.getBrowser().getTestMode());
			break;
		case "unload":
			//try{  //屏蔽页面onunload时可能产生的错误
				if(!this._disposed){  //iframe内的runtime可能被提前执行过了
					this.dispose();
				}
			//}catch(ex){
			//	this.log("[WebRuntime::dispose]exception");
			//}
			//if(application) application = null;
			break;
		case "resize":
			if(this.onResize){
				this.onResize(ev);
			}
			break;
		/*
		case "contextmenu":
		case "mousedown":
		case "mousemove":
		case "mouseup":
		*/
		default:
			if(this._workspace && this._workspace.eventHandle){
				this._workspace.eventHandle(ev);
			}
			break;
		}
	};
	//getter and setter
	this.getConfigData = function(key){
		return this._config[key];
	};
	this.setConfigData = function(key, value){
		this._config[key] = value;
	};
	this.getConfData = function(key){
		return this._conf[key];
	};
	this.setConfData = function(key, value){
		this._conf[key] = value;
	};
	this.getStartTime = function(){
		return this._startTime;
	};
	this.getWindow = function(){
		return this._win;
	};
	this.setWindow = function(v){
		this._win = v;
	};
	this.getDocument = function(){
		return this._doc;
	};
	this.setDocument = function(v){
		this._doc = v;
	};
	/**
	 * 获取当前lib(__init__mini.lib)所在的上下文环境
	 */
	this.getLibContext = function(){
		return this._libContext;
	};
	this.setLibContext = function(v){
		this._libContext = v;
	};
	/**
	 * 创建一个上下文环境对象
	 * @param name {String} 库名
	 * @param libs {String} 当前库依赖的库列表
	 * 每一个lib文件必然依赖于__init__.lib，所以libs参数中忽略了这个lib
	 */
	this.createContext = function(name, libs){
		//return this.getLibContext();
		if(name in this._contextList){
			throw new Exception("[WebRuntime::createContext]上下文环境 " + name + " 已经存在，请检查是否重名？");
		}
		var cxt = new Context(name, this);
		//cxt.__name = name;  //设置库的名称
		//cxt.runtime = this;    //保证 runtime 是全局唯一对象
		//默认导入所有已经加载的类（复制核心 context 引入的类到新建的 context 中）
		//[TODO]按照层层扩展机制，进行限定性引入
		/*
		for(var k in this._libContext.alz){
			if(!(k in cxt)){
				cxt[k] = this._libContext.alz[k];
			}
		}
		*/
		this._contextList[name] = cxt;  //注册上下文环境
		return cxt;
	};
	this.regLib = function(name, lib){
		if(name == "__init__"){
			this._contextList[name] = __context__;
			this.setLibContext(__context__);
			this.init();
		}else{
			if(this._libManager.exists(name)){
				this._win.alert("库(name=" + name + ")已经存在，请检查是否重名？");
				return;
			}
			this._libManager.reg(name, lib);
		}
	};
	this.regTpl = function(name, tplData){
		if(name in this._tpls){
			this.error("[WebRuntime::regTpl]模版库重名name=" + name);
		}
		this._tpls[name] = tplData;
	};
	this.getTplData = function(name){
		return this._tpls[name];
	};
	/**
	 * 每个lib文件加载完成时的回调方法
	 * @param {String} libName core|ui|...
	 * @param {Lib} lib {type:"",name:"",inApp:false}
	 * @param {LibConf} libConf lib配置信息
	 */
	this.onLibLoad = function(lib, libConf, loaded){
		if(!loaded){
			if(lib.type == "lib"){
				var libConf = this._libManager.getLib(lib.name);
				if(libConf){
					libConf.init.apply(this);  //绑定在 runtime 对象上面，这是对runtime对象的一种扩展机制
					libConf._inited = true;
				}
				libConf = null;
			}
		}else{  //找不到，则认为库已经加载完毕
			if(lib.type == "lib" || lib.type == "tpl"){
				if(typeof this.onLoad == "function"){
					this.onLoad();
				}
				for(var i = 0, len = this._funs.length; i < len; i++){
					this._funs[i]();  //依次调用绑定的函数
				}
				if(this._appManager){
					this._appManager.init();  //初始化所有应用
				}
				//if(!this.ie){  //非 IE 在此时触发 resize
					this.eventHandle({type:"resize"});  //主动触发一次 resize 事件
				//}
				if(typeof this._win.onContentLoaded == "function"){
					this._win.onContentLoaded();
				}else if(this._win.__webpage__){
					new this._win.__webpage__().main();
				}
			}
		}
	};
	/**
	 * 日志输出接口
	 */
	this.log = function(str){
		this._log.push(str);
	};
	this.warning = function(str){
	};
	this.error = function(str){
	};
	/**
	 * 导出接口到对象 obj 上面
	 */
	this.exportInterface = function(scope){
		scope.runtime = this;  //导出全局对象 runtime
		/**
		 * 这个函数是为了过渡性考虑因素，模拟 Prototype 等系统而设计的，在这里并不建
		 * 议使用这样的系统函数。在获取 DOM 元素之后，仍然建议通过脚本组件操作 DOM元
		 * 素的相关属性。
		 */
		/*scope.$ = function(id){return this.runtime.getElement(id);};*/
		/**
		 * 获取 DOM 元素对应的脚本组件
		 */
		//scope.$get = function(id){return this.runtime.getComponentById(id);};
		//scope.$init = function(ids){return this.runtime.initComponents(ids);};
		/*
		scope._alert = this.alert;
		scope.alert = function(msg){
			this._alert(msg);
			if(this.runtime){
				this.runtime.showInfo(msg);
			}
		};
		scope.onerror = function(msg, url, lineno){
			this._alert("msg=" + msg
				+ "\nurl=" + url
				+ "\nlineno=" + lineno
			);
		};
		*/
	};
	/**
	 * 取得当前文档使用的盒模型
	 * @return {number} 0=外模型，1=内模型
	 */
	this.getBoxModel = function(){
		return this._boxModel;
	};
	this._createTestDiv = function(){
		var obj = this._doc.createElement("div");
		obj.style.position = "absolute";
		obj.style.left = "-2000px";
		obj.style.top = "-2000px";
		//obj.style.font = "8pt tahoma";
		if(this._host.xul == true){
			return this._doc.documentElement.appendChild(obj);
		}else{
			return this._doc.body.appendChild(obj);
		}
	};
	/**
	 * 检测当前浏览器，当前文档类型支持的盒模型
	 * @return number 盒模型的的数字标识
	 *         0 = 内缩的盒模型
	 *         1 = 外扩的盒模型
	 */
	this._testBoxModel = function(){
		if(!this._host.xul && !this._doc.body){
			throw new Exception("[WebRuntime::_testBoxModel]'document.body' have not ready now");
		}
		if(!this._testDiv){
			this._testDiv = this._createTestDiv();
		}
		this._testDiv.style.width = "100px";
		this._testDiv.style.height = "100px";
		this._testDiv.style.border = "1px solid #000000";
		this._testDiv.style.padding = "1px";
		var nType = this._testDiv.offsetWidth == 104 ? 1 : 0;
		this._testDiv.style.width = "";
		this._testDiv.style.height = "";
		this._testDiv.style.border = "";
		this._testDiv.style.padding = "";
		//this._doc.body.removeChild(this._testDiv);
		return nType;
	};
	this.getTextSize = function(text, font){
		if(!this._testDiv){
			this._testDiv = this._createTestDiv();
		}
		this._testDiv.style.font = font || "8pt tahoma";
		this._testDiv.innerHTML = runtime.encodeHTML(text);
		return {
			"w": this._testDiv.offsetWidth,
			"h": this._testDiv.offsetHeight
		};
	};
	this.getParentRuntime = function(){
		if(!this._parentRuntime){
			if(!this._win.parent){
				return null;
			}
			if(this._win.parent == this._win){
				return null;
			}
			this._parentRuntime = this._win.parent.runtime;
		}
		return this._parentRuntime;
	};
	this.getElement = function(id){
		return this._doc.getElementById(id);
		/*
		var obj = this._doc.getElementById(id);
		if(!obj) return null;
		if(!obj._ptr){
			var c = new Component();
			c.init(obj);
		}
		return obj;
		*/
	};
	this.getBody = function(){
		if(this._host.xul){
			return this._doc.documentElement;
		}else if(this.inGadget){
			return this._doc.body;
		}else{
			return this.getElement("body") || this._doc.body;
		}
	};
	this.getUser = function(){
		if(this.getContext() && this.getContext().getUser){
			return this.getContext().getUser();
		}else{
			return this.getParentRuntime().getContext().getUser();
		}
	};
	this.getNextZIndex = function(){
		return ++this._zIndex;
	};
	/**
	 * 注册一个插件
	 */
	this.regPlugin = function(name, clazz){
		this._plugins[name] = new clazz();
	};
	/**
	 * 加载一个插件
	 * @param url {String} 插件JS的URL地址
	 */
	this.loadPlugin = function(url){
	};
	this.getPlugin = function(name){
		return this._plugins[name];
	};
	this.getRandomColor = function(){
		var a = [];
		for(var i = 0; i < 3; i++){
			a[i] = Math.round(191 + 64 * Math.random()).toString(16);
			if(a[i].length < 2) a[i] = "0" + a[i];
		}
		return "#" + a.join("");
	};
	this.getViewPort = function(element){
		var rect = {
			x: element.scrollLeft,
			y: element.scrollTop,
			w: element.clientWidth,  //Math.max(element.clientWidth || element.scrollWidth)
			h: Math.max(element.clientHeight, element.parentNode.clientHeight)  //Math.max(element.clientHeight || element.scrollHeight)
		};
		//if(this.ff){}
		rect.w = Math.max(element.clientWidth, element.parentNode.clientWidth);
		rect.h = Math.max(element.clientHeight, element.parentNode.clientHeight);
		return rect;
	};
	/**
	 * 把一个JSON字符串解析为 json 对象，成功返回 json 对象，失败返回 null
	 * @param data {String} [JsonCode]符合 JSON 协议的 js 代码
	 */
	this.parseJson = function(data){
		if(data == "") return null;  //防止空数据报错
		try{
			return eval("(" + data + ")");
		}catch(ex){  //json 解析错误
			if(this._debug){
				this.showException(ex, "parse json data error");
			}
			return null;
		}
	};
	/**
	 * 将字符串转换成可以被字符串表示符号(",')括起来已表示原来字符串意义的字符串
	 * @param str {String} 要转换的字符串内容
	 */
	this.toJsString = function(str){
		if(typeof str != "string") return "";
		return str.replace(/[\\\'\"\r\n]/g, function(_0){
			switch(_0){
			case "\\": return "\\\\";
			case "\'": return "\\\'";
			case "\"": return "\\\"";
			case "\n": return "\\n";
			case "\r": return "\\r";
			}
		});
	};
	/**
	 * 将模板解析为一个 JS 函数的代码形式
	 * @param code {String} 模板的内容
	 */
	this.parseTemplate = function(code){
		var sBegin = "<" + "%", sEnd = "%" + ">";
		var sb = [];
		sb.push("function(){");
		sb.push("\nvar __sb = [];\n");
		var p1 = code.indexOf(sBegin);
		var p2 = -2;
		while(p1 != -1){
			if(p1 > p2 + 2){
				sb.push("__sb.push(\"" + this.toJsString(code.substring(p2 + 2, p1)) + "\");");
			}
			p2 = code.indexOf(sEnd, p1 + 2);
			if(p2 != -1){
				switch(code.charAt(p1 + 2)){
				case '=':  //如果表达式，把表达式的结果缓存到 __sb 中
					sb.push("__sb.push(" + code.substring(p1 + 3, p2) + ");");
					break;
				default:  //普通的代码，保持不变
					sb.push(code.substring(p1 + 2, p2));
					break;
				}
			}else{
				return "模板中的'" + sBegin + "'与'" + sEnd + "'不匹配！";
			}
			p1 = code.indexOf(sBegin, p2 + 2);
		}
		if(p2 != -2 && p2 + 2 < code.length){  //保存结束标志之后的代码
			sb.push("__sb.push(\"" + this.toJsString(code.substr(p2 + 2)) + "\");");
		}
		sb.push("return __sb.join(\"\");");
		sb.push("\n}");
		return sb.join("");
		//return eval("(" + sb.join("\n") + ")")();
	};
	//var _pool = [];  //模拟线程池
	//添加并启动一个线程
	this.addThread = function(msec, agent, fun){
		var f = typeof fun == "string" ? agent[fun] : fun;
		/*
		_pool.push({
			"agent": agent,       //代理对象
			"fun"  : f,           //要执行的代码
			"time" : new Date(),  //当前时间
			"msec" : msec         //时间间隔
		});
		*/
		return window.setTimeout(function(){
			f.apply(agent);
		}, msec);
	};
	this.startTimer = function(msec, agent, fun){
		var f = typeof fun == "string" ? agent[fun] : fun;
		var timer = runtime.addThread(msec, this, function(){
			try{
				var ret = f.apply(agent);
				if(ret === true){
					timer = runtime.addThread(msec, this, arguments.callee);
				}else{
					window.clearTimeout(timer);
					timer = 0;
				}
			}catch(ex){
				runtime.log("[WebRuntime::startTimer]" + ex.message);
			}
		});
		return timer;
	};
});