_package("alz.test");

_import("alz.mui.Pane");

/**
 * Õ¯÷∑π‹¿Ì√Ê∞Â
 */
_class("PaneUrlMan", Pane, function(){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._tpl = "pane_urlman.xml";
	};
	this.create = function(parent, app){
		this.setParent2(parent);
		this._app = app;
		var obj = runtime.dom.createDomElement(this._app._template.getTpl(this._tpl));
		parent.appendChild(obj);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		this._app = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});