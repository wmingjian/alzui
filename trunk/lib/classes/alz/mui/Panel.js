_package("alz.mui");

_import("alz.mui.Container");

/**
 * 面板组件，支持布局自适应特性的面板
 */
_class("Panel", Container, function(_super){
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