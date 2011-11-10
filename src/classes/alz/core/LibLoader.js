_package("alz.core");

_import("alz.core.ScriptLoader");

/**
 * FileLoader
 * 文件加载引擎，使用script或者link加载js和css文件
 * 其中js文件的种类包括(conf,lib,tpl)
 */
_class("LibLoader", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._libs = [];
		this._fileExt = ".js";  //库文件默认的后缀名
		this._codeProvider = "";
		this._appConf = null;
		this._index = 0;
		this._agent = null;
		this._func = "";
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._agent = null;
		this._libs = [];
		this._appConf = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * @param {String} libs 逗号分割的库名列表
	 * @param {String|Object} codeProvider|appConf
	 * @param {WebRuntime} agent
	 * @param {String} func
	 * 回调函数参数格式：func(lib, libConf, loaded)
	 * lib     = 库文件名信息
	 * libConf = 库配置信息
	 * loaded  = 资源请求队列是否加载完毕
	 */
	this.init = function(libs, codeProvider, agent, func){  //加载库代码
		for(var i = 0, len = libs.length; i < len; i++){
			var lib = libs[i];
			if(typeof lib == "string"){
				if(lib == "") continue;
				var type;  //lib|tpl
				var name = lib;
				var inApp = name.charAt(0) == "#";
				if(inApp){
					name = name.substr(1);  //过滤掉名字开头的"#"
				}
				var p = name.lastIndexOf(".");
				if(p == -1){
					type = "lib";
				}else{
					type = name.substr(p + 1);
					name = name.substring(0, p);
				}
				this._libs.push({"type": type, "name": name, "inApp": inApp});
			}else{
				this._libs.push(lib);
			}
		}
		if(typeof codeProvider == "string"){
			this._codeProvider = codeProvider;
		}else{
			this._appConf = codeProvider;
		}
		this._agent = agent;
		this._func = func;
		this._start();
	};
	this._start = function(){
		runtime.addThread(10, this, "_loadLib");
	};
	/**
	 * 根据库名计算对应的url地址
	 * @param {String} name lib或tpl库名称
	 */
	this.getUrlByName = function(lib){
		/*
		var libUrl = "http://www.alzui.net/build/lib.php";
		if(!lib.inApp){  //lib.name.charAt(0) != "#"
			return libUrl + "?lib=" + lib.name;
		}else{
			return libUrl + "?lib=" + lib.name.substr(1);
		}
		*/
		var src;
		if(this._codeProvider != ""){
			src = this._codeProvider.replace(/\{filename\}/g, lib.name + "." + lib.type);
		}else{
			var path;
			if(!lib.inApp){  //lib.name.charAt(0) != "#"
				path = runtime._pathLib;  //内核扩展库
			}else{  //从应用目录下加载库文件
				path = this._appConf ? this._appConf.pathlib : (runtime.getConfigData("pathapp") || runtime._pathLib);  //具体应用库
			}
			src = path + lib.name + "." + lib.type + this._fileExt;
		}
		return src;
	};
	this._loadLib = function(){
		if(this._index >= this._libs.length){  //如果没有库代码，则直接执行回调
			var argv = [null, null, true];  //注意没有库名
			var func = typeof this._func == "function" ? this._func : this._agent[this._func];
			func.apply(this._agent, argv);
			return;
		}
		//var url = runtime._pathLib + libs[i] + ".lib.js";
		//this._doc.write('<script type="text/javascript" src="' + url + '" charset="utf-8"></script>');
		this.loadLibScript(this._libs[this._index]);
	};
	this.loadLibScript = function(lib, agent, func){
		var name = lib.name;
		var _this = this;
		if(runtime._host.xul){
			//if(lib.inApp){  //name.charAt(0) == "#"
			//	lib.name = name.substr(1);
			//}
			//<script type="text/javascript" src="/sinamail-dev/build/file.php?f=/rny/sinamail52/js/090731/{$name}.lib.js"/>
			//var url = this.getUrlByName(lib);
			var url = "/sinamail-dev/build/file.php?f=/rny/sinamail52/js/090731/" + name + ".lib.js";
			var http = new XMLHttpRequest();
			http.open("GET", url, false);
			http.onreadystatechange = function(){
				if(http.readyState != 4) return;
				if(http.status == 0 || (http.status >= 200 && http.status < 300)){
					var code = http.responseText;
					eval(code);
					if(agent){
						func.apply(agent, [lib, _this.getLibConf(lib), false]);
					}else{
						_this._onLoad();
					}
				}
				http.onreadystatechange = null;
			};
			http.send("");  //FF下面参数null不能省略
		}else{  //加载(lib.js,tpl.js)文件
			var loader = new ScriptLoader();
			loader.create(this, function(){
				if(agent){
					func.apply(agent, [lib, this.getLibConf(lib), false]);
				}else{
					this._onLoad();
				}
			});
			loader.load([this.getUrlByName(lib)], "", true);
			loader = null;
		}
	};
	this._onLoad = function(){
		var lib = this._libs[this._index];
		//var name = lib.name.replace(/#/g, "");
		var argv = [lib, this.getLibConf(lib), false];
		var func = typeof this._func == "function" ? this._func : this._agent[this._func];
		func.apply(this._agent, argv);
		this._index++;
		if(this._index < this._libs.length){
			if(this._index == 1 && (lib.name == "core" && runtime.getConfData("product"))){  //有产品配置的话，加载产品配置数据
				var loader = new ScriptLoader();
				loader.create(this, function(){
					this._start();  //加载完毕，再开始加载剩余的库文件
					loader = null;
				});
				loader.load([runtime.getConfigData("pathlib") + runtime.getConfData("product")], "", true);
			}else{
				this._start();
			}
		}else{  //加载完毕
			argv[2] = true;  //表示加载完毕
			func.apply(this._agent, argv);
		}
		func = null;
	};
	this.getLibConf = function(lib){
		if(lib.type == "tpl"){
			return null;  //runtime._libManager._hash[lib.name]
		}else{
			return runtime._libManager._hash[lib.name];
		}
	};
});