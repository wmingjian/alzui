_package("alz.mui");

_import("alz.mui.Component");

/**
 * 工具栏按钮
 */
_class("ToolButton", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._label = null;
	};
	this.create = function(parent, data){
		this.setParent2(parent);
		this.setData(data);
		var el = this._createElement2(parent, "li", "ui-toolbutton");
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		this._self.title = this._data.title;
		this._self.setAttribute("_action", this._data.action);
		this._label = this._createElement2(this, "label", "", {
			"backgroundPosition": (-this._data.id * 16) + "px 0px"
		});
	};
	this.dispose = function(){
		this._label = null;
		_super.dispose.apply(this);
	};
});