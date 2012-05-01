_package("alz.app.demo.pane");

_import("alz.mui.Pane");

/**
 * 默认面板
 */
_class("PaneHome", Pane, function(){
	this._init = function(){
		_super._init.call(this);
		this._tpl = "pane_home.xml";
	};
	/*
		<li><a href="index.html">介绍</a></li>
		<li><a href="Window.html">Window组件</a></li>
		<li><a href="Table.html">Table组件</a></li>
	*/
	this.create = function(parent, app){
		this.setParent2(parent);
		this.setApp(app);
		var obj = this.createTplElement(parent, this._tpl);
		this.init(obj);
		return obj;
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});