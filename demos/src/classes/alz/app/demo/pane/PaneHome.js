_package("alz.app.demo.pane");

_import("alz.mui.Pane");

/**
 * Ĭ�����
 */
_class("PaneHome", Pane, function(){
	this._init = function(){
		_super._init.call(this);
		this._tpl = "pane_home.xml";
	};
	/*
		<li><a href="index.html">����</a></li>
		<li><a href="Window.html">Window���</a></li>
		<li><a href="Table.html">Table���</a></li>
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