_package("alz.test");

_import("alz.mui.Pane");

/**
 * 默认面板
 */
_class("PaneHome", Pane, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._tpl = "pane_home.xml";
	};
	/*
		<li><a href="index.html">介绍</a></li>
		<li><a href="Window.html">Window组件</a></li>
		<li><a href="Table.html">Table组件</a></li>
	*/
	this.create = function(parent, app){
		this._app = app;
		var obj = runtime.dom.createDomElement(this._app._template.getTpl(this._tpl));
		parent.appendChild(obj);
		this.init(obj);
		return obj;
	};
	this.dispose = function(){
		this._app = null;
		_super.dispose.apply(this);
	};
});