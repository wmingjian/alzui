_package("alz.core");

_import("alz.core.Plugin");

/**
 * 插件管理者
 */
_class("PluginManager", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._plugins = {};
	};
	/*
	this.create = function(context){
		_super.create.apply(this, arguments);
	};
	*/
	this.create = function(rt, data){
		for(var i = 0, len = data.length; i < len; i++){
			var conf = data[i];
			var id = conf.id;
			var plugin = new conf.clazz();
			plugin.create(id, this);
			this.register(plugin);  //注册插件
			rt[id] = plugin;  //默认安装到runtime对象上面
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
		this._plugins[plugin.getName()] = plugin;
	};
	/**
	 * 通过名字获取一个已经注册的插件实例
	 */
	this.getPlugIn = function(name){
		return this._plugins[name];
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