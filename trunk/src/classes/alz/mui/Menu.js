_package("alz.mui");

_import("alz.mui.Popup");

/**
 * 菜单组件
 */
_class("Menu", Popup, function(){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
});