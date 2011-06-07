_package("alz.mui");

_import("alz.mui.ListBox");

/**
 * 菜单栏
 */
_class("MenuBar", ListBox, function(){
	this._init = function(){
		_super._init.call(this);
		this._activeItem1 = null;
	};
	this.bind = function(obj){
		this.init(obj);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		this._activeItem1 = null;
		_super.dispose.apply(this);
	};
	this.activeItem = function(v){
		if(this._activeItem1 === v) return;
		if(this._activeItem1){
			runtime.dom.removeClass(this._activeItem1._self, "active");
		}
		runtime.dom.addClass(v._self, "active");
		v._actionManager.dispatchAction(v._action, v._self);
		this._activeItem1 = v;
	};
});