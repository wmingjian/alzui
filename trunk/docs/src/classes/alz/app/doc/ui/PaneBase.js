_package("alz.app.doc.ui");

_import("alz.mui.Pane");

/**
 * 面板基类
 */
_class("PaneBase", Pane, function(){
	this._init = function(){
		_super._init.call(this);
		this._pid = "";
		this._params = null;
	};
	this.create = function(parent, app, tpl){
		this.setParent(parent);
		this.setApp(app);
		var obj = this.createTplElement(parent, tpl);
		this.init(obj);
		return obj;
	};
	this.reset = function(params){
		this.setParams(params);
	};
	this.dispose = function(){
		this._params = null;
		_super.dispose.apply(this);
	};
	this.setParams = function(v){
		this._params = v;
	};
});