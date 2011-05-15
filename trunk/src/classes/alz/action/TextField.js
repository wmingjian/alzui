_package("alz.action");

_import("alz.action.ActionElement");

/**
 * input:text元素的封装
 */
_class("TextField", ActionElement, function(){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onblur = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onblur = null;
		_super.dispose.apply(this);
	};
});