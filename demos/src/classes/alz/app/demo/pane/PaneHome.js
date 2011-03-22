_package("alz.app.demo.pane");

_import("alz.mui.Pane");

/**
 * Ĭ�����
 */
_class("PaneHome", Pane, function(){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._tpl = "pane_home.xml";
	};
	/*
		<li><a href="index.html">����</a></li>
		<li><a href="Window.html">Window���</a></li>
		<li><a href="Table.html">Table���</a></li>
	*/
	this.create = function(parent, app){
		this.setParent2(parent);
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
	this.destroy = function(){
	};
});