_package("alz.mui");

_import("alz.mui.ToolButton");

/**
 * 带图标的按钮组件
 */
_class("BitButton", ToolButton, function(){
	this._init = function(){
		_super._init.call(this);
		this._icon = "";
		this._disabled = false;
		this._app = null;
	};
	this.bind = function(obj, app){
		this._app = app;
		this.init(obj);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		//this._label = this._self.childNodes[1];
		this.setDisabled(this._self.getAttribute("_disabled") == "true");
		this._icon = this._self.getAttribute("_icon") || "";
		if(this._icon != ""){
			this._self.style.background = "url(" + this._self.getAttribute("_icon") + ") 2px 2px no-repeat";
		}
		this._tip = this._self.getAttribute("_tip") || "";
		if(this._tip != ""){
			this._self.title = this._tip;
		}
		this.addListener(this._self, "mouseover", this, "onMouseOver");
		this.addListener(this._self, "mouseout", this, "onMouseOut");
		this.addListener(this._self, "mousedown", this, "onMouseDown");
		this.addListener(this._self, "mouseup", this, "onMouseUp");
		//this.addListener(this._self, "click", this, "onClick");
	};
	this.dispose = function(){
		if(this._disposed) return;
		this.removeListener(this._self, "mouseover", this, "onMouseOver");
		this.removeListener(this._self, "mouseout", this, "onMouseOut");
		this.removeListener(this._self, "mousedown", this, "onMouseDown");
		this.removeListener(this._self, "mouseup", this, "onMouseUp");
		//this.removeListener(this._self, "click", this, "onClick");
		this._app = null;
		this._label = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setDisabled = function(v){
		_super.setDisabled.apply(this, arguments);
		this.setEnableEvent(!v);
		if(this._self){
			this._self.style.filter = v ? "gray" : "";
			this._label.disabled = v;
		}
	};
	this.onMouseOver = function(ev){
		runtime.dom.addClass(this._self, "hover");
		/*
		this._self.style.borderLeft = "1px solid buttonhighlight";
		this._self.style.borderTop = "1px solid buttonhighlight";
		this._self.style.borderRight = "1px solid buttonshadow";
		this._self.style.borderBottom = "1px solid buttonshadow";
		*/
	};
	this.onMouseOut = function(ev){
		var target = ev.target || ev.toElement;
		if(!runtime.dom.contains(this._self, target)){
			runtime.dom.removeClass(this._self, "hover");
			runtime.dom.removeClass(this._self, "active");
			//this._self.style.border = "1px solid buttonface";
		}
	};
	this.onMouseDown = function(ev){
		runtime.dom.addClass(this._self, "active");
		/*
		this._self.style.borderLeft = "1px solid buttonshadow";
		this._self.style.borderTop = "1px solid buttonshadow";
		this._self.style.borderRight = "1px solid buttonhighlight";
		this._self.style.borderBottom = "1px solid buttonhighlight";
		*/
		var sender = ev.target || ev.srcElement;
		//this._app.doAction(sender.getAttribute("_action"), sender);
	};
	this.onMouseUp = function(ev){
		runtime.dom.replaceClass(this._self, "active", "hover");
		/*
		this._self.style.borderLeft = "1px solid buttonhighlight";
		this._self.style.borderTop = "1px solid buttonhighlight";
		this._self.style.borderRight = "1px solid buttonshadow";
		this._self.style.borderBottom = "1px solid buttonshadow";
		*/
	};
	/*
	this.onClick = function(ev){
		var sender = ev.target || ev.srcElement;
		this._app.doAction(sender.getAttribute("_action"), sender);
	};
	*/
});