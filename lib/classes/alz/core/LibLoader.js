_package("alz.core");

_import("alz.core.ScriptLoader");

/**
 * LibLoader
 * 文件加载引擎，使用script或者link加载js和css文件
 * 其中js文件的种类包括(conf,lib,tpl)
 */
_class("LibLoader", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._libs = [];
		this._libExt = ".lib.js";  //库文件默认的后缀名
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
	 * @param libs {String} 逗号分割的库名列表
	 * @param agent {WebRuntime}
	 * @param funName {String}
	 * 回调函数参数格式：fun(lib, libConf, loaded)
	 * lib     = 库文件名信息
	 * libConf = 库配置信息
	 * loaded  = 资源请求队列是否加载完毕
	 */
	this.init = function(libs, codeProvider, agent, funName){  //加载库代码
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
			if(name.substr(0, 1) != "#"){
				src = runtime.pathLib + name + this._libExt;  //内核扩展库
			}else{
				src = (runtime._config["pathapp"] || runtime.pathLib) + name.substr(1) + this._libExt;  //与版本相关的库
			}
		}
		return src;
	};
	this._loadLib = function(){
		if(this._index >= this._libs.length){  //如果没有库代码，则直接执行回调
			this._agent[this._funName]();  //注意没有库名
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
			http.send("");  //FF下面参数null不能省略
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
			if(this._index == 1 && (name == "core" && runtime._conf["product"])){  //有产品配置的话，加载产品配置数据
				var loader = new ScriptLoader();
				loader.create(this, function(){
					this._start();
					loader = null;
				});
				loader.load(runtime._config["pathlib"] + runtime._conf["product"], "", true);
			}else{
				this._start();
			}
		}else{  //加载完毕
			fun.apply(this._agent);  //注意没有库名
		}
		fun = null;
	};
});