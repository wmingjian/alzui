_package("alz.mui");

_import("alz.mui.Component");

/**
 * 工具栏按钮
 */
_class("ToolButton", Component, function(){
	this._init = function(){
		_super._init.call(this);
	};
	this.create = function(parent, data){
		this.setParent2(parent);
		this.setData(data);
		var obj = this._createElement2(parent, "li", "ui-toolbutton");
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._self.title = this._data.title;
		this._self.setAttribute("_action", this._data.action);
		//this._label = 
		this._createElement2(this, "label", "", {
			"backgroundPosition": (-this._data.id * 16) + "px 0px"
		});
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
});