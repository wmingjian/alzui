_package("alz.mui");

_import("alz.mui.Popup");

/**
 * 弹出式菜单
 */
_class("PopupMenu", Popup, function(){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this.setVisible(false);
		this.initActionElements();
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
});