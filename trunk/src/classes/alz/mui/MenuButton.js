_package("alz.mui");

_import("alz.mui.Component");

/**
 * 菜单栏按钮
 */
_class("MenuButton", Component, function(){
	this._init = function(){
		_super._init.call(this);
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
});