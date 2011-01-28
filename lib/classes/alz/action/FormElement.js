_package("alz.action");

_import("alz.action.ActionElement");

_class("FormElement", ActionElement, function(_super){
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onsubmit = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onsubmit = null;
		_super.dispose.apply(this);
	};
	this.resetSelf = function(){
		this._self.reset();
	};
});