_package("alz.core");

_import("alz.core.LibLoader");
_import("alz.core.Application");

_class("AppManager", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._confList = {};  //APP��������
		this._hash = {};
		this._list = [];
		this._mainApp = null;
	};
	//��ʼ������Ӧ��
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
	//��������Ӧ�õĴ�С
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
				window.alert("[warning]appid(" + list[i].id + ")�ظ�");
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
	 * ������ע��һ��Ӧ�õ�ʵ��
	 * @param appClassName {String} Ҫ������Ӧ�õ�����
	 * @param parentApp {Application} ��ѡ�������ĸ���
	 * @param len {Number} ����ʷ��¼�е�λ��
	 */
	this.createApp = function(appClassName, parentApp, len){
		var conf = this.getAppConfByClassName(appClassName);
		if(conf){
			if(conf.appnum == 1){
				runtime.getWindow().alert("�򻯰���ÿ��App��ֻ�ܴ���һ��ʵ��");
				return null;
			}
			conf.appnum++;
		}
		//��Ҫ��֤����һ����������ֹcreate�����Զ�ִ��
		var app = new __classes__[appClassName]();
		if(arguments.length == 3 && parentApp){
			app.setParentApp(parentApp);  //���ø���
			app.setHistoryIndex(len);  //����������ʷ��¼��λ��
		}else if(app.getMainWindow){
			var appManager = app.getMainWindow().runtime._appManager;
			parentApp = appManager._list[0] || null;
			app.setParentApp(parentApp);
			//if(parentApp){
			//	app.setHistoryIndex(parentApp.historyManager.getLength());
			//}
			appManager = null;
		}
		//ע��APP
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
			if(/\.js$/.test(name)){  //ֱ�Ӽ���js�ļ�
				runtime.dynamicLoadFile("js", app._pathJs, [name]);
			}else if(/\.lib$/.test(name)){  //����lib�ļ�
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
			}else{  //ȫ������
				fun.apply(agent);
				libLoader.dispose();
				libLoader = null;
			}
		});
	};
});