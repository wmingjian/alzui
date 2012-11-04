_package("alz.app.demo.pane");

_import("alz.mui.Pane");

/**
 * 网址管理面板
 */
_class("PaneUrlMan", Pane, function(){
	this._init = function(){
		_super._init.call(this);
		this._tpl = "pane_urlman.xml";
	};
	this.create = function(parent, app){
		this.setParent2(parent);
		this.setApp(app);
		var el = this.createTplElement(parent, this._tpl);
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});