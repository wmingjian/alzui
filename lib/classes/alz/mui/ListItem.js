_package("alz.mui");

_import("alz.mui.Component");

_class("ListItem", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._icon = null;
		this._label = null;
	};
	this.__init = function(obj, domBuildType){
		_super.__init.apply(this, arguments);
		//alert(this._self.firstChild.nodeType);
		this._self.style.verticalAlign = "middle";
		this._self.onselectstart = function(ev){return false;};

		this._icon = this._createElement("img");
		this._icon.src = "skin/Icon_delete.gif";
		this._icon.style.border = "0px";
		this._icon.style.width = "16px";
		this._icon.style.height = "15px";
		this._icon.style.verticalAlign = "middle";

		var text = this._self.removeChild(this._self.firstChild);
		var size = runtime.getTextSize(text.data, "12px ËÎÌו");

		this._label = this._createElement("label");
		this._label.style.backgroundColor = "#CCCCCC";
		this._label.style.width = (size.w + 10) + "px";
		//this._label.style.height = (size.h + 2) + "px";
		//this._label.style.padding = "1px";
		this._label.style.textAlign = "center";
		this._label.style.lineHeight = "100%";
		this._label.appendChild(text);

		this._self.appendChild(this._icon);
		this._self.appendChild(this._label);
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
});