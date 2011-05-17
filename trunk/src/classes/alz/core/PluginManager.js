_package("alz.core");

_import("alz.core.ManagerBase");
_import("alz.core.Plugin");

/**
 * 插件管理者(面向WebRuntime,Application)
 */
_class("PluginManager", ManagerBase, function(){
	this._init = function(){
		_super._init.call(this);
		this._plugins = {};
	};
	/*
	this.create = function(context){
		_super.create.apply(this, arguments);
	};
	*/
	this.create = function(target, data){
		for(var k in data){
			var plugin = new data[k].clazz();
			plugin.create(k, this);
			this.register(plugin);  //注册插件
			var name = "_" + k;
			if(name in target){
				console.log("[PluginManager::create]对象(class=" + target._className + "已经有属性:" + name);
			}
			target[name] = plugin;  //默认安装到runtime对象上面
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		//[TODO]多个应用的插件注册到同一个地方，则跨窗口应用的插件卸载时会报错
		for(var k in this._plugins){
			this._plugins[k].dispose();
			delete this._plugins[k];
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * 判断一个插件是否已经存在
	 */
	this.exists = function(name){
		return name in this._plugins;
	};
	/**
	 * 注册一个插件，每个APP下所有插件不能重名
	 * @param {PlugIn} plugin 插件的实例
	 */
	this.register = function(plugin){
		this._plugins[plugin.getId()] = plugin;
	};
	/**
	 * 通过名字获取一个已经注册的插件实例
	 */
	this.getPlugIn = function(id){
		return this._plugins[id];
	};
	/**
	 * 调用插件的onResize事件
	 * 给所有插件一个调整自身布局的机会
	 */
	this.onResize = function(ev){
		for(var k in this._plugins){
			this._plugins[k].fireEvent(ev);
		}
	};
});