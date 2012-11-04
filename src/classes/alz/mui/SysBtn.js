_package("alz.mui");

_import("alz.mui.Component");

/**
 * 窗体组件上的系统按钮组件
 */
_class("SysBtn", Component, function(){
	//#_interface("IActionSource");
	this._init = function(){
		_super._init.call(this);
		this._win = null;
	};
	this.init = function(obj, win, css){
		_super.init.apply(this, arguments);
		this._win = win;
		this._cssName = "." + this._self.className;
		this._xpath = this._win._cssName + " .head " + this._cssName;
		this._capture = false;
		this.addListener(this._self, "click", this, "onClick1");
		this.addListener(this._self, "mousedown", this, "onMouseDown1");
		this.addListener(this._self, "mouseup", this, "onMouseUp1");
		//this.addListener(this._self, "mouseover", this, "onMouseOver1");
		//this.addListener(this._self, "mouseout", this, "onMouseOut1");
	}
	this.dispose = function(){
		if(this._disposed) return;
		//this.removeListener(this._self, "mouseout");
		//this.removeListener(this._self, "mouseover");
		//this.removeListener(this._self, "mouseup");
		this.removeListener(this._self, "mousedown");
		this.removeListener(this._self, "click");
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.onMouseDown1 = function(ev){
		this._dom.addClass(this._self, "active");
		this._capture = true;
		this.setState("active");
		if(runtime.ie){
			this._self.setCapture();
			ev.cancelBubble = true;
		}else{
			ev.stopPropagation();
		}
		return false;
	};
	this.onMouseUp1 = function(ev){
		this._dom.removeClass(this._self, "active");
		this._capture = false;
		this.setState("normal");
		if(runtime.ie){
			this._self.releaseCapture();
			ev.cancelBubble = true;
		}else{
			ev.stopPropagation();
		}
		return false;
	};
	this.onMouseOver1 = function(ev){
		document.title = "over";
		if(this._capture){
			this.setState("active");
		}else{
			//this.setState("normal");
		}
		//return false;
	};
	this.onMouseOut1 = function(ev){
		document.title = "out";
		if(this._capture){
			this.setState("normal");
		}else{
			//this.setState("normal");
		}
		//return false;
	};
	this.onClick1 = function(ev){
	};
	this.onMouseDown = function(ev){
		this.setCapture(true);
		/*
		var _this = this;
		var body = document.body;
		if(runtime._host.env == "ie"){
			body.setCapture();
		}
		this.addListener(body, "mousemove", this, "onMouseMove");
		this.addListener(body, "mouseup", this, "onMouseUp");
		*/
		this.setState("active");
		ev.cancelBubble = true;
		return false;
	};
	this.onMouseMove = function(ev){
		var target = ev.srcElement || ev.target;
		this.setState(target == this._self ? "active" : "normal");
	};
	this.onMouseUp = function(ev){
		this.setState("normal");
		this.setCapture(false);
		/*
		var body = document.body;
		this.removeListener(body, "mousemove");
		this.removeListener(body, "mouseup");
		if(runtime._host.env == "ie"){
			body.releaseCapture();
		}
		*/
	};
});