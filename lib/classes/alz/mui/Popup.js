_package("alz.mui");

_import("alz.mui.Component");

/**
 * 弹出式组件
 */
_class("Popup", Component, function(){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		/*
		this._self.onmousedown = function(ev){
			ev = ev || this._ptr._win.event;
			ev.cancelBubble = true;
			return false;
		};
		*/
	};
	this.dispose = function(){
		if(this._disposed) return;
		//this._self.onmousedown = null;
		_super.dispose.apply(this);
	};
});