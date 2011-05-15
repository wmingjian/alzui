_package("alz.mui");

_import("alz.mui.Popup");

/**
 * 弹出式菜单
 */
_class("PopupMenu", Popup, function(){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._owner = null;  //所有者(必须是一个UI组件)
		this._params = null;
		this._req = null;
	};
	this.create = function(parent, app, owner, params, tpl){
		this.setParent(parent);
		this.setApp(app);
		this._owner = owner;
		this._params = params;
		var html = this._app._template.getTpl(tpl);
		var obj = this.createDomElement(parent, html);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this.setVisible(false);
	};
	this.reset = function(params){
		this._params = params;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._req = null;
		this._params = null;
		this._owner = null;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.setApp = function(v){
		this._app = v;
	};
	this.setReq = function(v){
		this._req = v;
	};
	/**
	 * @method getPosition
	 * @return {Object}
	 * @desc   获得事件的全局坐标位置
	 */
	this.getPosition = function(sender){
		var pos = {"x": 0, "y": 0};
		var refElement = runtime._workspace._self;
		var obj = sender;
		while(obj && obj != refElement){
			pos.x += obj.offsetLeft;
			pos.y += obj.offsetTop;
			obj = obj.offsetParent;
		}
		return pos;
	};
	this.show = function(){
		runtime._workspace.setActivePopup(this);
		var pos = this.getPosition(this._owner);
		this.moveTo(pos.x, pos.y + this._owner.offsetHeight);
	};
	this.hide = function(){
		runtime._workspace.setActivePopup(null);
	};
});