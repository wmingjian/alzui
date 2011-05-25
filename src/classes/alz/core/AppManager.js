_package("alz.core");

_import("alz.core.Plugin");
_import("alz.core.LibLoader");
_import("alz.core.Application");

/**
 * 应用管理者
 */
_class("AppManager", Plugin, function(){
	this._init = function(){
		_super._init.call(this);
		this._confList = {};  //APP配置数据
		this._activeAppName = "";
		this._activeAppConf = null;  //当前的应用配置
		this._hash = {};
		this._list = [];
		this._mainApp = null;
	};
	/**
	 * 初始化所有应用
	 */
	this.init = function(){
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i].init){
				this._list[i].init();
			}
		}
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i].onContentLoad();
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._mainApp = null;
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i].dispose();
			this._list[i] = null;
		}
		this._list = [];
		for(var k in this._hash){
			//this._hash[k].dispose();
			delete this._hash[k];
		}
		this._activeAppConf = null;
		for(var k in this._confList){
			delete this._confList[k];
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * 调整所有应用的大小
	 */
	this.onResize = function(w, h){
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i].onResize){
				try{
					this._list[i].onResize(w, h);
				}catch(ex){
				}
			}
		}
	};
	this.setConfList = function(list){
		for(var i = 0, len = list.length; i < len; i++){
			if(list[i].id in this._confList){
				window.alert("[warning]appid(" + list[i].id + ")重复");
			}
			list[i].appnum = 0;
			this._confList[list[i].id] = list[i];
		}
	};
	this.getMainApp = function(){
		return this._mainApp;
		//return this._list[0];
	};
	this.setMainApp = function(v){
		this._mainApp = v;
	};
	/**
	 * 注册一个应用
	 */
	this.regApp = function(name, conf){
		if(name in this._confList){
			runtime.error("[AppManager::regApp]应用重名name=" + name + "，注册失败");
			return;
		}
		this._confList[name] = conf;
		if(conf.active){
			this._activeAppName = name;
			this._activeAppConf = conf;
		}
	};
	/**
	 * 创建并注册一个应用的实例
	 * @param {String} appClassName 要创建的应用的类名
	 * @param {Application} parentApp 可选，所属的父类
	 * @param {Number} len 在历史记录中的位置
	 */
	this.createApp = function(context, appClassName, parentApp, len){
		var conf = this.getAppConfByClassName(appClassName);
		if(conf){
			if(conf.appnum == 1){
				runtime.getWindow().alert("简化版中每个App类只能创建一个实例");
				return null;
			}
			conf.appnum++;
		}
		//需要保证多于一个参数，阻止create方法自动执行
		var clazz = this.getClazzByName(appClassName);
		var app = new clazz();
		app.setContext(context);
		if(arguments.length == 3 && parentApp){
			app.setParentApp(parentApp);  //设置父类
			app.setHistoryIndex(len);  //设置所在历史记录的位置
		}else if(app.getMainWindow){
			var appManager = app.getMainWindow().runtime._appManager;
			parentApp = appManager.getMainApp() || null;
			app.setParentApp(parentApp);
			//if(parentApp){
			//	app.setHistoryIndex(parentApp._history.getLength());
			//}
			appManager = null;
		}
		//注册APP
		if(conf){
			this._hash[conf.id] = app;
		}
		this._list.push(app);
		//app.init();
		conf = null;
		return app;
	};
	this.getClazzByName = function(name){
		for(var k in __classes__){
			if(k.split(".").pop() == name){
				return __classes__[k];
			}
		}
		return null;
	};
	this.getAppConf = function(appid){
		return this._confList[appid];
	};
	this.getAppConfByClassName = function(className){
		for(var k in this._confList){
			var conf = this._confList[k];
			if(conf.className == className){
				return conf;
			}
		}
		return null;
	};
	this.getAppByClassName = function(className){
		for(var i = 0, len = this._list.length; i < len; i++){
			var item = this._list[i];
			if(item._className == className || item._className.indexOf("." + className) != -1){
				return item;
			}
		}
		return null;
	};
	this._processFiles = function(conf){
		var styles = conf.css.split(",");
		var head = document.getElementsByTagName("head")[0];
		for(var i = 0, len = styles.length; i < len; i++){
			var obj = document.createElement("link");
			obj.type = "text/css";
			obj.rel = "stylesheet";
			obj.href = conf.pathcss + styles[i];
			head.appendChild(obj);
		}
		var libs = [];
		if(conf.tpl){
			libs = libs.concat(conf.tpl.split(","));
		}
		if(conf.lib){
			libs = libs.concat(conf.lib.split(","));
		}
		var files = [];  //数组结构: [{type:"lib",name:"",inApp:false},...]
		for(var i = 0, len = libs.length; i < len; i++){
			var f = libs[i];
			if(/\.js$/.test(f)){  //直接加载js文件
				runtime.dynamicLoadFile("js", f.indexOf("http://") == 0 ? "" : app._pathJs, [f]);
			}else if(/\.(tpl|lib)$/.test(f)){  //加载lib,tpl文件
				var arr = f.split(".");
				var name = arr[0];  //name.replace(/\.lib$/, "");  //过滤掉lib后缀名
				var type = arr[1];  //类型，后缀名
				var inApp = name.substr(0, 1) == "#";
				if(inApp){  //过滤掉名字开头可能存在的"#"
					name = name.substr(1);
				}
				if(!(name in runtime._libManager._hash)){
					files.push({"type": type, "name": name, "inApp": true/*inApp*/});
				}
			}
		}
		return files;
	};
	/**
	 * 加载一个lib所依赖的其他lib和tpl资源
	 */
	this.loadAppLibs =
	this.loadAppFiles = function(libName, app, agent, func){
		var n = app ? app._history.getLength() - 1 : 0;
		var conf = this._confList[libName];
		var files = this._processFiles(conf);
		//加载tpl文件
		/*
		if("tpl" in conf){
			runtime.dynamicLoadFile("js", runtime.getConfigData("pathlib"), [conf["tpl"]]);
		}
		*/
		if(files.length == 0){
			return false;
		}else{
			var libLoader = new LibLoader();
			//runtime.getConfigData("codeprovider")
			libLoader.init(files, conf, this, function(lib, libConf, loaded){
				//runtime._libLoader.loadLibScript(lib0, this, function(lib){
				//});
				if(!loaded){
					if(lib.type == "lib"){
						if(typeof libConf == "function"){
							libConf.call(runtime, app, n);
						}else{  //typeof libConf.init == "function"
							libConf.init.call(runtime, app, n);
						}
					}
				}else{  //全部加载
					if(lib.type == "lib"){
						func.apply(agent, [this.getAppByClassName(conf.className)]);
						libLoader.dispose();
						libLoader = null;
					}else{  //lib.type == "tpl"
						//window.alert("load tpl callback");
					}
				}
			});
			return true;
		}
	};
});