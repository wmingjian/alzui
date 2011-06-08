_package("alz.core");

_import("alz.core.EventTarget");

/**
 * 针对Application的插件基类
 */
_class("Plugin", EventTarget, function(){
	this._init = function(){
		_super._init.call(this);
		this._app = null;  //插件所属的应用(Application)或管理者{PluginManager}
		this._id = "";     //插件的名字(ID标识)
	};
	this.create = function(id, app){
		this._app = app;
		this._id = id;
	};
	this.reset = function(){
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getName =
	this.getId = function(){
		return this._id;
	};
	this.getApp = function(){
		return this._app;
	};
});