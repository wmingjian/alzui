_package("alz.mui");

_import("alz.mui.Component");

/**
 * 列表项目
 */
_class("ListItem", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._icon = null;
		this._label = null;
	};
	this.__init = function(obj, domBuildType){
		_super.__init.apply(this, arguments);
		//window.alert(this._self.firstChild.nodeType);
		this._self.style.verticalAlign = "middle";
		this._self.onselectstart = function(ev){return false;};
		var text = this._self.removeChild(this._self.firstChild);
		var size = runtime.getTextSize(text.data, "12px 宋体");
		this._icon = this._createElement2(this._self, "img", "", {
			"src"           : "skin/Icon_delete.gif",
			"border"        : "0px",
			"width"         : "16px",
			"height"        : "15px",
			"verticalAlign" : "middle"
		});
		this._label = this._createElement2(this._self, "label", "", {
			"backgroundColor": "#CCCCCC",
			"width"          : (size.w + 10) + "px",
		//"height"         : (size.h + 2) + "px",
		//"padding"        : "1px",
			"textAlign"      : "center",
			"lineHeight"     : "100%"
		});
		this._label.appendChild(text);
	};
	//this.bind = function(obj){};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._label = null;
		this._icon = null;
		this._self.onselectstart = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});