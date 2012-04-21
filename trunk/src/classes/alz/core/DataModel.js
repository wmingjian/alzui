_package("alz.core");

_import("alz.core.Plugin");

_class("DataModel", Plugin, function(){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._path = "";
		//[TODO]针对联系人按照手机号码建立一个hash映射
		this._models = {};  //数据模型对象，所有数据模型的哈希表
		this._hash = {};  //model_conf哈希存储
		this._conf = null;  //键值对数据
	};
	this.create = function(name, app, data){
		//_super.create.apply(this, arguments);
		this._app = app;
		this._path = app._pathRoot;
	};
	this.dispose = function(){
		/*
		for(var k in this._conf){
			delete this._conf[k];
		}
		*/
		this._conf = null;
		for(var k in this._hash){
			delete this._hash[k];
		}
		for(var k in this._models){
			this._models[k].dispose();
			delete this._models[k];
		}
		this._app = null;
		_super.dispose.apply(this);
	};
	this.regModels = function(models){
		for(var k in models){
			this.regModel(models[k]);
		}
	};
	this.regModel = function(m){
		var id = m.id;
		var model = new m.clazz();
		model.setConf(m);
		model.create(this, id, m.path);
		this._models[id] = model;
		this._hash[id] = m;
	};
	this.getModel = function(key){
		return this._models[key];
	};
	this.getModelClass = function(key){
		return this._hash[key].clazz;
	};
	this.getConfData = function(key){
		return this._conf ? this._conf[key] : null;
	};
	this.setConfData = function(key, value){
		this._conf[key] = value;
	};
	this.getCache = function(key){
		var data = this.getConfData(key);
		if(data && (data.expire == -1 || new Date().getTime() <= data.expire || !this._app.isNetAvailable())){
			return data.value;
		}else{
			return null;
		}
	};
	this.setCache = function(key, value, expire){
		this._conf[key] = {
			"value" : value,
			"expire": typeof expire == "number" ? new Date().getTime() + expire : -1
		};
	};
	this.getConf = function(){
		return this._conf;
	};
	this.setConf = function(v){
		this._conf = v;
	};
	this.netInvoke = function(){
		this._app.netInvoke.apply(this._app, arguments);
	};
	this.checkJsonData = function(json, silent){
		return this._app.checkJsonData(json, silent);
	};
	/**
	 * 执行回调函数
	 * @param {Number} cbid 回调函数编号
	 * @param {JsonObject} data 传递给回调函数的参数
	 */
	this.callback = function(cbid, data){
		runtime._task.execute(cbid, [data]);
	};
	/**
	 * 数据调用接口
	 * @param {String} cmd 命令
	 * @param {Object} params 调用参数(__args是特殊参数，不传递给服务器)
	 * @param {Object} agent 代理对象
	 * @param {Function|String} func 回调函数
	 */
	this.dataInvoke = function(cmd, params, agent, func){
		var cbid;
		if("__args" in params){
			cbid = runtime._task.add(agent, func, params["__args"]);
			delete params["__args"];
		}else{
			cbid = runtime._task.add(agent, func);
		}
		var name = "di_" + cmd;
		if(name in this){
			this[name](cmd, params, cbid);
		}else{
			var type = cmd.split("_")[0];
			if(type in this._models){
				var model = this._models[type];
				if(name in model){
					model[name](cmd, params, cbid);
				}else{
					runtime.error("[TODO]数据调用接口" + name + "尚未实现");
				}
			}else{
				runtime.error("[TODO]数据接口调用时没有找到对应的模型" + type);
			}
		}
	};
});