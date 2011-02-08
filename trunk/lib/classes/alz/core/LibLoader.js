_package("alz.core");

_import("alz.core.ScriptLoader");

/**
 * LibLoader
 * �ļ��������棬ʹ��script����link����js��css�ļ�
 * ����js�ļ����������(conf,lib,tpl)
 */
_class("LibLoader", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._libs = [];
		this._libExt = ".js";  //���ļ�Ĭ�ϵĺ�׺��
		this._codeProvider = "";
		this._index = 0;
		this._agent = null;
		this._funName = "";
	};
	this.dispose = function(){
		this._agent = null;
		this._libs = [];
		_super.dispose.apply(this);
	};
	/**
	 * @param libs {String} ���ŷָ�Ŀ����б�
	 * @param agent {WebRuntime}
	 * @param funName {String}
	 * �ص�����������ʽ��fun(lib, libConf, loaded)
	 * lib     = ���ļ�����Ϣ
	 * libConf = ��������Ϣ
	 * loaded  = ��Դ��������Ƿ�������
	 */
	this.init = function(libs, codeProvider, agent, funName){  //���ؿ����
		this._libs = libs;
		this._codeProvider = codeProvider;
		this._agent = agent;
		this._funName = funName;
		this._start();
	};
	this._start = function(){
		var _this = this;
		runtime._win.setTimeout(function(){
			_this._loadLib();
		}, 10);
	};
	/**
	 * ���ݿ��������Ӧ��url��ַ
	 * @param {String} name lib��tpl������
	 */
	this.getUrlByName = function(name){
		/*
		var libUrl = "http://www.alzui.net/build/lib.php";
		if(name.substr(0, 1) != "#"){
			return libUrl + "?lib=" + name;
		}else{
			return libUrl + "?lib=" + name.substr(1);
		}
		*/
		var src;
		if(this._codeProvider != ""){
			src = this._codeProvider.replace(/\{libname\}/g, name.substr(0, 1) != "#" ? name : name.substr(1));
		}else{
			var path;
			var ext;  //.lib|.tpl
			if(name.charAt(0) != "#"){  //�ں���չ��
				path = runtime.pathLib;
			}else{  //��汾��صĿ�
				name = name.substr(1);
				path = runtime._config["pathapp"] || runtime.pathLib;
			}
			var p = name.lastIndexOf(".");
			if(p == -1){
				ext = ".lib";
			}else{
				ext = name.substr(p);
				name = name.substring(0, p);
			}
			src = path + name + ext + this._libExt;
		}
		return src;
	};
	this._loadLib = function(){
		if(this._index >= this._libs.length){  //���û�п���룬��ֱ��ִ�лص�
			this._agent[this._funName]();  //ע��û�п���
			return;
		}
		/*
		this._doc.write("<sc" + "ript"
			+ " type=\"text/javascript\""
			+ " src=\"" + this.pathLib + libs[i] + ".lib.js\""
			+ " charset=\"utf-8\""
			+ "></sc"+"ript>");
		*/
		this.loadLibScript(this._libs[this._index]);
	};
	this.loadLibScript = function(libName, agent, fun){
		var _this = this;
		if(runtime._host.xul){
			if(libName.substr(0, 1) == "#") libName = libName.substr(1);
			//<script type="text/javascript" src="/sinamail-dev/build/file.php?f=/rny/sinamail52/js/090731/{$libName}.lib.js"/>
			//var url = this.getUrlByName(libName);
			var url = "/sinamail-dev/build/file.php?f=/rny/sinamail52/js/090731/" + libName + ".lib.js";
			var http = new XMLHttpRequest();
			http.open("GET", url, false);
			http.onreadystatechange = function(){
				if(http.readyState != 4) return;
				if(http.status == 0 || (http.status >= 200 && http.status < 300)){
					var code = http.responseText;
					eval(code);
					if(agent){
						fun.call(agent, libName, runtime._libManager._hash[libName]);
					}else{
						_this._onLoad();
					}
				}
				http.onreadystatechange = null;
			};
			http.send("");  //FF�������null����ʡ��
		}else{
			var loader = new ScriptLoader();
			loader.create(this, function(){
				if(agent){
					fun.call(agent, libName, runtime._libManager._hash[libName]);
				}else{
					this._onLoad();
				}
			});
			loader.load(this.getUrlByName(libName), "", true);
			loader = null;
		}
	};
	this._onLoad = function(){
		var name = this._libs[this._index].replace(/#/g, "");
		var argv = [name, runtime._libManager._hash[name]];
		var fun = typeof this._funName == "function" ? this._funName : this._agent[this._funName];
		fun.apply(this._agent, argv);
		this._index++;
		if(this._index < this._libs.length){
			if(this._index == 1 && (name == "core" && runtime._conf["product"])){  //�в�Ʒ���õĻ������ز�Ʒ��������
				var loader = new ScriptLoader();
				loader.create(this, function(){
					this._start();
					loader = null;
				});
				loader.load(runtime._config["pathlib"] + runtime._conf["product"], "", true);
			}else{
				this._start();
			}
		}else{  //�������
			fun.apply(this._agent);  //ע��û�п���
		}
		fun = null;
	};
});