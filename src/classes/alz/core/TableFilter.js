_package("alz.core");

_import("alz.core.TableIndex");

/**
 * 数据表过滤器对象
 */
_class("TableFilter", TableIndex, function(){
	this._init = function(){
		_super._init.call(this);
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
});