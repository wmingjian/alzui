_package("alz.action");

_import("alz.action.ActionElement");

/**
 * input:checkbox元素的封装
 */
_class("CheckBox", ActionElement, function(){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this.setAction(this._action.split("|"));
		var _this = this;
		this._self.onclick = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});