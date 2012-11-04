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
		var el = this.createTplElement(parent, this._tpl);
		this.init(el);
		this.initActionElements();
		return el;
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.do_show_window = function(act, sender){
		console.log("do_show_window");
		var params = {
		};
		var win = this._app.createWindow("main", this._app, params);
		win.moveTo(20, 20);
	};
});