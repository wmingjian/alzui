_package("alz.mui");

_import("alz.mui.Container");

/**
 * 应用的子窗体工作区组件
 */
_class("AppWorkspace", Container, function(){
	this._init = function(){
		_super._init.call(this);
	};
	this.build = function(el){
		_super.build.apply(this, arguments);
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.rendered = function(){
		_super.rendered.apply(this);
		console.log("AppWorkspace::rendered");
	};
});