_package("alz.mui");

_import("alz.mui.Component");

_class("Workspace", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._captureComponent = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._self.onmousedown =
		this._self.onmousemove =
		this._self.onmouseup = function(ev){
			return this._ptr.eventHandle(ev || window.event);
		};
	};
	this.dispose = function(){
		this._captureComponent = null;
		this._self.onmouseup = null;
		this._self.onmousemove = null;
		this._self.onmousedown = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resize = function(w, h){
		if(this._width == w && this._height == h) return true;
		this._width = w;
		this._height = h;
	};
	this.eventHandle = function(ev){
		//_doc.title = ev.srcElement.tagName;
		var etype = {
			"mousedown": "MouseDown",
			"mouseup"  : "MouseUp",
			"mousemove": "MouseMove"
		};
		if(this._captureComponent){
			if(runtime._host.env == "ie" && ev.type == "mousedown"){
				this._self.setCapture();
			}else if(runtime._host.env == "ie" && ev.type == "mouseup"){
				this._self.releaseCapture();
			}
			var ename = "on" + etype[ev.type];
			if(typeof this._captureComponent[ename] == "function"){
				return this._captureComponent[ename](ev);
			}
		}
		switch(ev.type){
		case "mousedown":
		case "mouseup"  :
		case "mousemove":
			break;
		default:
			break;
		}
	};
});