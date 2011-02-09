_package("alz.core");

_import("alz.lang.Exception");
//_import("alz.core.DOMUtil");
//_import("alz.core.AjaxEngine");
//_import("alz.mui.Component");
//_import("alz.mui.Workspace");

_class("WebRuntime", "", function(){
	this._init = function(){
		_super._init.call(this);
		//���Լ��������ֿ���ѡ��
		this._startTime = __start;   //ϵͳ���뿪ʼִ�е�ʱ���
		this._debug = false;         //ϵͳ�Ƿ��ڵ���״̬
		this._globalName = "__runtime__";  //��Runtime�����µ�ȫ��Ψһ����������

		//·������
		this.pathSep   = "/";  //Ŀ¼�ָ��
		this.pathAui   = "/alzui/";     //alzui�ں�����Ŀ¼("http://www.iiios.net:8081/alzui/")
		this.classpath = this.pathAui + "classes/";     //Ĭ�ϵ����ļ��洢Ŀ¼
		this.pathLib   = this.pathAui + "lib/";         //Ĭ�ϵ������洢Ŀ¼
		this.pathApp   = this.pathAui + "netapp/";      //app���ڸ�Ŀ¼
		this.pathSrv   = this.pathAui + "data/";        //����˳���ĸ�Ŀ¼
		this.pathHtml  = this.pathAui + "html/";        //HtmlApp Ŀ¼
		this.pathTpl   = this.pathLib + "res/tpl/";     //tplģ���ļ�Ŀ¼
		this.pathCss   = this.pathLib + "res/css/";     //css�ļ�Ŀ¼
		this.pathImg   = this.pathLib + "res/images/";  //ͼƬ��Դ
		this.pathSkin  = this.pathLib + "skin/win2k/";  //Ƥ��(ͼ��)
		this.pathPlugin = this.pathAui + "plugins/";    //���Ŀ¼

		//����ʱ�������ڵ�������Ϊ����ʱ�����ṩͳһ�Ļ����ӿ�
		this._global   = null;  //����Ψһ��һ��ȫ�� this ��ָ��
		this._host     = null;  //����ʱ������������������������
		this._hostenv  = "";    //��������(�ر������:hta,chm)
		this._config   = {};    //ϵͳ���ñ���������μ��ĵ�˵����
		/**
		 * conf������Ϣ˵��
		 * debug   boolean �Ƿ����״̬
		 * runmode number  ����ģʽ
		 * skinid  string  Ĭ��Ƥ��id
		 * action  string  Ĭ�ϴ����Ķ���(mini��ʹ��)
		 * aulFile string  Ĭ��������aul�ļ�
		 * screen  string  ������Ļ�����DOM����id
		 */
		this._conf = {};
		this._tpls = {};       //ģ��⼯��
		this._srvFiles = {};  //������ļ��б�
		this._parentRuntime = null;  //��WebRuntime����
		this._libManager = null;  //���ļ�������
		this._libLoader = null;   //���ļ�������
		this._contextList = {};   //�����Ļ��������б�
		this._libContext = null;  //��ǰlib�������Ļ�������
		this._plugins = {};       //ע��Ĳ���б�
		this._log = [];  //��־����

		//������������ڿ����еĽӿ�
		this._win      = null;  //����ʱ�������ڵ� window ����
		this._doc      = null;
		this._domScript = null;  //script DOM ����
		this.ie = false;      //�Ƿ�IE�����
		this.ff = false;      //�Ƿ�FireFox
		this.ns = false;      //�Ƿ�Netscape
		this.opera = false;   //�Ƿ�Opera
		this.safari = false;  //�Ƿ�Safari
		this.chrome = false;  //�Ƿ�ȸ������
		this.moz = false;     //�Ƿ�Mozillaϵ�������
		this.ie5 = false;     //�Ƿ�IE5
		this.ie55 = false;    //�Ƿ�IE5.5
		this.ie6 = false;     //�Ƿ�IE6
		this.ie7 = false;     //�Ƿ�IE7
		this.ff1 = false;     //�Ƿ�FF1
		this.ff2 = false;     //�Ƿ�FF2
		this.max = false;     //�Ƿ�Maxthon
		this.tt = false;      //�Ƿ�TencentTraveler

		this._win = __global;
		this._doc = this._win.document;
		this._checkBrowser();

		//̽���Ƿ� Gadget ���л���
		this.inGadget = !!(this._win.System && this._win.System.Gadget);  //typeof System != "undefined"
		this.option = {  //Gadget�������
			timer:2000,  //������ʼ���ʱ����
			newMailNum:0  //���ʼ�����
		};
		this._files = {};  //�Ѿ����ص�js��css�ļ�
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
		this.exportInterface(this._win);  //����ȫ�ֱ���
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
		if(this._config["plugin"]){  //����в�������ز����CSS�ļ�
			var plugins = this._config["plugin"].split(",");
			for(var i = 0, len = plugins.length; i < len; i++){
				var plugin = plugins[i];
				this._preLoadFile("css", this.pathPlugin + plugin + "/css/", [plugin + ".css"]);
				this._preLoadFile("js" , this.pathPlugin + plugin + "/js/" , [plugin + ".js" ]);
				plugin = null;
			}
			plugins = null;
		}
		if(this._config["autotest"]){  //�����Զ������ļ�
			this._doc.write('<script type="text/javascript" src="' + this._config["autotest"] + '" charset=\"utf-8\"></sc'+'ript>');
		}

		var _this = this;
		this.__eventHandle = function(ev){
			_this.eventHandle(ev || _this._win.event);
		};
		if(this._doc.attachEvent){
			try{  //���������WinXP+IE6�±������Լ��Ϸ�����
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
		//��˳��ִ�й�����չ
		//for(var i = 1, len = this._exts.length; i < len; i++){
		//	this._exts[i].init.call(this);
		//}
		this._libManager.initLoadLib();
		this._newWorkspace = bNewWorkspace;
		//this._workspace = new Screen();
		//this._workspace[this._newWorkspace ? "create" : "bind"](this.getBody());
		if(this.ie){  //IE�ڴ�ʱ���� resize
			this.eventHandle({type:"resize"});  //��������һ�� resize �¼�
		}
		//var _this = this;
		//this.addEventListener(this._win, "mousemove", function(ev){_this.eventHandle(ev || _this._win.event);});
		//this.addEventListener(this._doc.body, "mousemove", function(ev){_this.eventHandle(ev || _this._win.event);});
		this._boxModel = this._testBoxModel();  //̽���ģ��
		//[TODO]�����ļ���ʱ��Ӧ�ø���Ŷԣ�����Ҫ�� onContentLoaded ֮ǰ��������ڳ�ʼ���ű����ز���ʼ����ϵ�ʱ��
		var libs = this._config["lib"];  //.replace(/^core,ui,/, "");  //����core,ui�����
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
	 * ��������ƥ�� window.navigator.userAgent ����ȡ�����������
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
			runtime.log("[WebRuntime::getHostenv]δ֪������������userAgent:" + nav.userAgent);
		}
		return host;
	};
	/**
	 * ������������
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
						"��ͬʱ������Maxthon����ѶTT����������������"
				+ "\n���ܻ��໥Ӱ�쵼��ϵͳ����һЩС���⡣"
				+ "\n������������ȴ�Maxthon��Ȼ���ٴ���ѶTT��"
			);
		}
		*/
	};
	/**
	 * ��Ⲣ��ʼ������������ script ��ǩ�������������Ϣ
	 * [TODO]
	 *  1)���ҳ���Ƕ�̬���ɣ�����ֱ��һ����д��ģ��ᵼ���޷���ȷ��λ alzui ϵͳ
	 *    λ�ã�ԭ�����ڶ� script Ԫ�صĲ�ѯĬ�����һ�����⡣
	 */
	this._checkHostEnv = function(){
		//·������
		if(!this._domScript){
			var ol = this._doc.getElementsByTagName("script");
			this._domScript = ol[ol.length - 1];  //���һ��script��ǩ
		}
		//�ж��Ƿ������ǰ�����Ļ��������֣��Ϳ�����ʶ�������ʼ���ļ���SCRIPT��ǩ��
		var url = this._domScript.src || this._domScript.getAttribute("src");
		if(url.indexOf(__context__.__name) == -1){
			while(true){
				this._domScript = this._domScript.nextSibling;
				if(this._domScript.nodeType == 1 && this._domScript.tagName == "SCRIPT"){
					break;
				}
			}
		}

		//������Ϣ
		var keys = [
			"src",
			"pathlib", "pathapp", "pathcss", "pathskin", "pathimg", "pathtpl", "pathplugin",
			"css", "lib", "plugin",
			"conf", "runmode", "skinid", "skin", "codeprovider", "autotest", "action",
			"onstartloading"  //��ʼ����ʱִ�еĴ���
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

		//·�����

		//��λ alzui ϵͳ·��
		var path = this._config["src"];
		var arr = (/^(.+)(\\|\/)[^\\\/]+$/ig).exec(path);  //this._win.location
		if(arr){
			this.pathSep  = arr[2];
			this.pathAui = arr[1] + arr[2];
			//path = path.substring(0, path.lastIndexOf(this.pathSep) + 1).replace(/lib\/$/, "")
			this._setPathAui(path.substring(0, path.lastIndexOf(this.pathSep) + 1).replace(/lib\/$/, ""));
		}else{
			this.showException("δ����ȷ��λ alzui ϵͳλ��");
			return;
		}
		//��λ WebApp ��·��
		var url = "" + window.location;
		this.pathApp = url.substr(0, url.lastIndexOf("/") + 1);  //[TODO]pathApp�ĺ����Ѿ��ı�

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
			this._files[url] = true;  //��ʶ�Ѿ�����
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
			if(file.charAt(0) == "#"){  //Ƥ���ļ�
				file = file.substr(1).replace(/(\d+)\.css$/, "$1/_skin.css");
				skin = true;
			}
			var url = (skin ? pathSkin : path) + file;
			if(url in this._files) continue;  //����Ѿ����أ������
			this._files[url] = true;  //��ʶ�Ѿ�����
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
	 * ���Կ����п�������Ĵ���
	 */
	this._testCrossDomainWindow = function(win, type){
		try{
			switch(type){
			case 0:  //����parent����
				var p = win.parent && win.runtime;
				break;
			case 1:  //����__main__flag����
				if(win.__main__flag && win.runtime){
					return true;
				}else{
					return false;
				}
			case 2:  //��__main__flag��ֵ
				if(win.runtime){
					win.__main__flag = true;
				}else{
					throw new Exception("[WebRuntime::_testCrossDomainWindow]");
				}
				break;
			case 3:  //����location���Է���
				win.locaiton.pathname.indexOf("/");
				break;
			}
			return true;
		}catch(ex){
			return false;
		}
	};
	/**
	 * ��ȡͬ��Ķ��� window ����
	 * �����𼶲��� window.parent ���󣬲����Ը�ֵ��˼·ʵ��
	 * NOTICE!!!�����Կ��Ǻ�΢�Ӱ��Ҳ�ܴ����������޸�
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
				//����ĳ��ҳ����Զ����Լ�Ϊ���㴰�壬��Ҫ�Լ�ʵ�����ݴ洢�ӿ�
				if(this._testCrossDomainWindow(w, 1)){  //�������__main__flag���ԣ�ֱ�ӷ���
					return w;
				}
				if(this._testCrossDomainWindow(w, 2)){  //������Զ�__main__flag��ֵ
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
	 * ����������� Vista Gadget С������ƣ��п�����ݴ��жϣ��ȶ���Ӧ�ò����ˣ�
	 * ��Ҫ�ظ���������װ���̡�
	 * __main__flag ��ʾ window �����ǵ�ǰӦ�õĶ��� window ����
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
					//[2009-8-14] chrome������£�ǰ��Ĳ��Ծ���ͨ������location���ʴ�����
					//�⣬�����ڴ˲���location�Ŀɷ����ԡ�
					if((this.chrome || this.safari) && !this._testCrossDomainWindow(w, 3)){  //����location���Է���
						return win;
					}
					win = w;
				}
			}catch(ex){  //��ֹ window.opener ����Ĵ���
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
	 * ϵͳ���󷽷���չ
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
			throw new Exception("[WebRuntime::addEventListener]��������޷��� DOM Ԫ�ذ��¼�");
		}
	};
	this.removeEventListener = function(obj, type, eventHandle){
		if(obj.detachEvent){
			obj.detachEvent("on" + type, eventHandle);
		}else if(obj.removeEventListener){
			obj.removeEventListener(type, eventHandle, false);
		}else{
			throw new Exception("[WebRuntime::removeEventListenerEventListener]��������޷��� DOM Ԫ�ذ��¼�");
		}
	};
	/**
	 * ȫ���¼���Ӧ����
	 * [TODO]
	 *   1)Workspace�����һЩ��������ϵͳ���ģ�������Component�����
	 *   2)this.getViewPort �� DOMUtil.getViewPort ����һ��
	 *   3)��������Ĵ���һ�� resize �¼���ͬʱ��Ӧ�ó�ʼ������ٴ���һ��
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
			//this.init();  //ϵͳ��ʼ��
			//window.alert(runtime.getBrowser().getTestMode());
			break;
		case "unload":
			//try{  //����ҳ��onunloadʱ���ܲ����Ĵ���
				if(!this._disposed){  //iframe�ڵ�runtime���ܱ���ǰִ�й���
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
	 * ��ȡ��ǰlib(__init__mini.lib)���ڵ������Ļ���
	 */
	this.getLibContext = function(){
		return this._libContext;
	};
	this.setLibContext = function(v){
		this._libContext = v;
	};
	/**
	 * ����һ�������Ļ�������
	 * @param name {String} ����
	 * @param libs {String} ��ǰ�������Ŀ��б�
	 * ÿһ��lib�ļ���Ȼ������__init__.lib������libs�����к��������lib
	 */
	this.createContext = function(name, libs){
		//return this.getLibContext();
		if(name in this._contextList){
			throw new Exception("[WebRuntime::createContext]�����Ļ��� " + name + " �Ѿ����ڣ������Ƿ�������");
		}
		var cxt = new Context(name, this);
		//cxt.__name = name;  //���ÿ������
		//cxt.runtime = this;    //��֤ runtime ��ȫ��Ψһ����
		//Ĭ�ϵ��������Ѿ����ص��ࣨ���ƺ��� context ������ൽ�½��� context �У�
		//[TODO]���ղ����չ���ƣ������޶�������
		/*
		for(var k in this._libContext.alz){
			if(!(k in cxt)){
				cxt[k] = this._libContext.alz[k];
			}
		}
		*/
		this._contextList[name] = cxt;  //ע�������Ļ���
		return cxt;
	};
	this.regLib = function(name, lib){
		if(name == "__init__"){
			this._contextList[name] = __context__;
			this.setLibContext(__context__);
			this.init();
		}else{
			if(this._libManager.exists(name)){
				this._win.alert("��(name=" + name + ")�Ѿ����ڣ������Ƿ�������");
				return;
			}
			this._libManager.reg(name, lib);
		}
	};
	this.regTpl = function(name, tplData){
		if(name in this._tpls){
			this.error("[WebRuntime::regTpl]ģ�������name=" + name);
		}
		this._tpls[name] = tplData;
	};
	this.getTplData = function(name){
		return this._tpls[name];
	};
	/**
	 * ÿ��lib�ļ��������ʱ�Ļص�����
	 * @param {String} libName core|ui|...
	 * @param {Lib} lib {type:"",name:"",inApp:false}
	 * @param {LibConf} libConf lib������Ϣ
	 */
	this.onLibLoad = function(lib, libConf, loaded){
		if(!loaded){
			if(lib.type == "lib"){
				var libConf = this._libManager.getLib(lib.name);
				if(libConf){
					libConf.init.apply(this);  //���� runtime �������棬���Ƕ�runtime�����һ����չ����
					libConf._inited = true;
				}
				libConf = null;
			}
		}else{  //�Ҳ���������Ϊ���Ѿ��������
			if(lib.type == "lib" || lib.type == "tpl"){
				if(typeof this.onLoad == "function"){
					this.onLoad();
				}
				for(var i = 0, len = this._funs.length; i < len; i++){
					this._funs[i]();  //���ε��ð󶨵ĺ���
				}
				if(this._appManager){
					this._appManager.init();  //��ʼ������Ӧ��
				}
				//if(!this.ie){  //�� IE �ڴ�ʱ���� resize
					this.eventHandle({type:"resize"});  //��������һ�� resize �¼�
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
	 * ��־����ӿ�
	 */
	this.log = function(str){
		this._log.push(str);
	};
	this.warning = function(str){
	};
	this.error = function(str){
	};
	/**
	 * �����ӿڵ����� obj ����
	 */
	this.exportInterface = function(scope){
		scope.runtime = this;  //����ȫ�ֶ��� runtime
		/**
		 * ���������Ϊ�˹����Կ������أ�ģ�� Prototype ��ϵͳ����Ƶģ������ﲢ����
		 * ��ʹ��������ϵͳ�������ڻ�ȡ DOM Ԫ��֮����Ȼ����ͨ���ű�������� DOMԪ
		 * �ص�������ԡ�
		 */
		/*scope.$ = function(id){return this.runtime.getElement(id);};*/
		/**
		 * ��ȡ DOM Ԫ�ض�Ӧ�Ľű����
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
	 * ȡ�õ�ǰ�ĵ�ʹ�õĺ�ģ��
	 * @return {number} 0=��ģ�ͣ�1=��ģ��
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
	 * ��⵱ǰ���������ǰ�ĵ�����֧�ֵĺ�ģ��
	 * @return number ��ģ�͵ĵ����ֱ�ʶ
	 *         0 = �����ĺ�ģ��
	 *         1 = �����ĺ�ģ��
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
	 * ע��һ�����
	 */
	this.regPlugin = function(name, clazz){
		this._plugins[name] = new clazz();
	};
	/**
	 * ����һ�����
	 * @param url {String} ���JS��URL��ַ
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
	 * ��һ��JSON�ַ�������Ϊ json ���󣬳ɹ����� json ����ʧ�ܷ��� null
	 * @param data {String} [JsonCode]���� JSON Э��� js ����
	 */
	this.parseJson = function(data){
		if(data == "") return null;  //��ֹ�����ݱ���
		try{
			return eval("(" + data + ")");
		}catch(ex){  //json ��������
			if(this._debug){
				this.showException(ex, "parse json data error");
			}
			return null;
		}
	};
	/**
	 * ���ַ���ת���ɿ��Ա��ַ�����ʾ����(",')�������ѱ�ʾԭ���ַ���������ַ���
	 * @param str {String} Ҫת�����ַ�������
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
	 * ��ģ�����Ϊһ�� JS �����Ĵ�����ʽ
	 * @param code {String} ģ�������
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
				case '=':  //������ʽ���ѱ��ʽ�Ľ�����浽 __sb ��
					sb.push("__sb.push(" + code.substring(p1 + 3, p2) + ");");
					break;
				default:  //��ͨ�Ĵ��룬���ֲ���
					sb.push(code.substring(p1 + 2, p2));
					break;
				}
			}else{
				return "ģ���е�'" + sBegin + "'��'" + sEnd + "'��ƥ�䣡";
			}
			p1 = code.indexOf(sBegin, p2 + 2);
		}
		if(p2 != -2 && p2 + 2 < code.length){  //���������־֮��Ĵ���
			sb.push("__sb.push(\"" + this.toJsString(code.substr(p2 + 2)) + "\");");
		}
		sb.push("return __sb.join(\"\");");
		sb.push("\n}");
		return sb.join("");
		//return eval("(" + sb.join("\n") + ")")();
	};
	//var _pool = [];  //ģ���̳߳�
	//��Ӳ�����һ���߳�
	this.addThread = function(msec, agent, fun){
		var f = typeof fun == "string" ? agent[fun] : fun;
		/*
		_pool.push({
			"agent": agent,       //�������
			"fun"  : f,           //Ҫִ�еĴ���
			"time" : new Date(),  //��ǰʱ��
			"msec" : msec         //ʱ����
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