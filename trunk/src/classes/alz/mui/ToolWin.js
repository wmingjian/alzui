_package("alz.mui");

_import("alz.mui.Component");

_class("ToolWin", Component, function(){
	this._init = function(){
		_super._init.call(this);
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
});