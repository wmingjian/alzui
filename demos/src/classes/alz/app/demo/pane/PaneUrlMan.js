_package("alz.app.demo.pane");

_import("alz.mui.Pane");

/**
 * ��ַ�������
 */
_class("PaneUrlMan", Pane, function(){
	this._init = function(){
		_super._init.call(this);
		this._tpl = "pane_urlman.xml";
	};
	this.create = function(parent, app){
		this.setParent2(parent);
		this.setApp(app);
		var obj = this.createTplElement(parent, this._tpl);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});