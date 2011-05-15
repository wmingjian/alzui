_package("alz.action");

_import("alz.action.ActionElement");

/**
 * select元素的封装
 */
_class("ComboBox", ActionElement, function(){
	this._init = function(obj){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onchange = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onchange = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});