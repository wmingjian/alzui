_package("alz.app.demo.pane");

_import("alz.mui.Pane");
_import("alz.mui.Window");

/**
 * 窗体组件面板
 */
_class("PaneWindow", Pane, function(){
	this._init = function(){
		_super._init.call(this);
		this._tpl = "pane_window.xml";
		this._win1 = null;
		this._win2 = null;
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
		this._win1 = new Window();
		this._win1.bind($("win1"));
		this._win1._self.style.zIndex = runtime.getNextZIndex();
		this._win2 = new Window();
		this._win2.bind($("win2"));
		this._win2._self.style.zIndex = runtime.getNextZIndex();
		var _this = this;
		this._win1._self.getElementsByTagName("input")[0].checked = true;
		this._win1._self.getElementsByTagName("input")[0].onclick = function(){
			_this._win1.setResizable(this.checked);
		};
		this._win2._self.getElementsByTagName("input")[0].checked = true;
		this._win2._self.getElementsByTagName("input")[0].onclick = function(){
			_this._win2.setResizable(this.checked);
		};
		this.resize($("main1").clientWidth, $("main1").clientHeight);
	};
	this.dispose = function(){
		this._win2.dispose();
		this._win2 = null;
		this._win1.dispose();
		this._win1 = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resize = function(w, h){
		w -= 220;
		h -= 220;
		this._win1.resize(w, h);
		this._win2.resize(w, h);
	};
});