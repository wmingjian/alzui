_package("alz.core");

/**
 * 系统服务基类
 */
_class("ServiceBase", "", function(){
	this._init = function(){
		_super._init.call(this);
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
});