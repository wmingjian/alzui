_package("alz.mui");

_import("alz.mui.Component");

/**
 * 列表项目
 */
_class("ListItem", Component, function(){
	this._css = {
		normal: {},
		active: {},
		_hover: {}
	};
	this._init = function(){
		_super._init.call(this);
		this._data = null;
		this._active = false;
		this._itemDom = null;  //响应 ListItem 相关事件的 DOM 元素，不一定是 ListItem._self
		this._checked = false;  //是否被选中
		this._checkbox = null;
		this._label = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._itemDom = this._self;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._label = null;
		this._checkbox = null;
		this._itemDom = null;
		this._data = null;
		_super.dispose.apply(this);
	};
	this.getData = function(){
		return this._data;
	};
	this.setData = function(v){
		this._data = v;
	};
	this.setChecked = function(v, force){
		if(this._checked == v && !force) return;
		this._checked = v;
		if(this._checkbox){
			this._checkbox.checked = v;
		}
	};
	this.getIndex = function(){
		return this._parent.getItemIndex(this);
	};
	this.updateStyle = function(style){
		for(var k in style){
			if(k.charAt(0) == "_") continue;
			(k == "className" ? this._self : this._self.style)[k] = style[k];
		}
	};
	this.activate = function(force){
		if(this._active && !force) return;  //已经激活，则不进行任何操作（性能优化）
		this._active = true;
		this.setChecked(true);
		if(this._self){
			this.updateStyle(this._css.active);
			try{this._self.focus();}catch(ex){}  //能保证Item可以被看到
		}
		if(this.onActive) this.onActive();
	};
	this.deactivate = function(force){
		if(!this._active && !force) return;
		this._active = false;
		this.setChecked(false);
		if(this._self){
			this.updateStyle(this._css.normal);
		}
		if(this.onActive) this.onActive();
	};
});