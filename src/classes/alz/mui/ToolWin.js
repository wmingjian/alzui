_package("alz.mui");

_import("alz.mui.BaseWindow");

/**
 * 工具窗体
 */
_class("ToolWin", BaseWindow, function(){
	this._init = function(){
		_super._init.call(this);
		this._dock = false;
	};
	this.rendered = function(){
		_super.rendered.apply(this);
		runtime.dom.addClass(this._self, "undock");
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this.initActionElements();
	};
	this.dispose = function(){
		if(this._disposed) return;
	};
});