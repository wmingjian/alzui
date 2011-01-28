_package("alz.core");

_import("alz.core.LibLoader");
_import("alz.core.Application");

_class("AppManager", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._confList = {};  //APP配置数据
		this._hash = {};
		this._list = [];
		this._mainApp = null;
	};
	//初始化所有应用
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
		_super.dispose.apply(this);
	};
	//调整所有应用的大小
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
		//return this._mainApp;
		return this._list[0];
	};
	this.setMainApp = function(v){
		this._mainApp = v;
	};
	/**
	 * 创建并注册一个应用的实例
	 * @param appClassName {String} 要创建的应用的类名
	 * @param parentApp {Application} 可选，所属的父类
	 * @param len {Number} 在历史记录中的位置
	 */
	this.createApp = function(appClassName, parentApp, len){
		var conf = this.getAppConfByClassName(appClassName);
		if(conf){
			if(conf.appnum == 1){
				runtime.getWindow().alert("简化版中每个App类只能创建一个实例");
				return null;
			}
			conf.appnum++;
		}
		//需要保证多于一个参数，阻止create方法自动执行
		var app = new __classes__[appClassName]();
		if(arguments.length == 3 && parentApp){
			app.setParentApp(parentApp);  //设置父类
			app.setHistoryIndex(len);  //设置所在历史记录的位置
		}else if(app.getMainWindow){
			var appManager = app.getMainWindow().runtime._appManager;
			parentApp = appManager._list[0] || null;
			app.setParentApp(parentApp);
			//if(parentApp){
			//	app.setHistoryIndex(parentApp.historyManager.getLength());
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
	this.getAppConf = function(appid){
		return this._confList[appid];
	};
	this.getAppConfByClassName = function(className){
		for(var k in this._confList){
			if(this._confList[k].className == className){
				return this._confList[k];
			}
		}
		return null;
	};
	this.getAppByClassName = function(className){
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i]._className == className){
				return this._list[i];
			}
		}
		return null;
	};
	this.loadAppLibs = function(libName, app, agent, fun){
		var n = app.historyManager.getLength();
		var libs = this._confList[libName].lib.split(",");
		var arr = [];
		for(var i = 0, len = libs.length; i < len; i++){
			var name = libs[i];
			if(/\.js$/.test(name)){  //直接加载js文件
				runtime.dynamicLoadFile("js", app._pathJs, [name]);
			}else if(/\.lib$/.test(name)){  //加载lib文件
				name = name.replace(/\.lib$/, "");
				var name0 = name;
				if(name0.substr(0, 1) == "#") name0 = name0.substr(1);
				if(!(name0 in runtime._libManager._hash)){
					arr.push(name);
				}
			}
		}
		var libLoader = new LibLoader();
		libLoader.init(arr, runtime._config["codeprovider"], this, function(name, lib){
			//runtime._libLoader.loadLibScript(name, this, function(lib){
			//});
			if(lib){
				if(typeof lib == "function"){
					lib.call(runtime, app, n);
				}else{  //typeof lib.init == "function"
					lib.init.call(runtime, app, n);
				}
			}else{  //全部加载
				fun.apply(agent);
				libLoader.dispose();
				libLoader = null;
			}
		});
	};
});