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
		this._self.onclick = function(ev){
		};
		this._self.onmousedown = function(ev){
			return this._ptr.onMouseDown(ev || window.event);
			/*
			ev = ev || window.event;
			//this.style.backgroundPosition = "0px -" + _win._skin._model["sbtn_height"] + "px";
			this._ptr._capture = true;
			this.setCapture();
			this._ptr.setState("active");
			ev.cancelBubble = true;
			return false;
			*/
		};
		/*
		this._self.onmouseup = function(ev){
			ev = ev || window.event;
			//this.style.backgroundPosition = "0px 0px";
			this._ptr.setState("normal");
			this.releaseCapture();
			this._ptr._capture = false;
			ev.cancelBubble = true;
			return false;
		};
		this._self.onmouseover = function(ev){
			ev = ev || window.event;
			_doc.title = "over";
			if(this._ptr._capture){
				this._ptr.setState("active");
			}else{
				//this._ptr.setState("normal");
			}
			//return false;
		};
		this._self.onmouseout = function(ev){
			ev = ev || window.event;
			_doc.title = "out";
			if(this._ptr._capture){
				this._ptr.setState("normal");
			}else{
				//this._ptr.setState("normal");
			}
			//return false;
		};
		*/
	}
	this.dispose = function(){
		this._self.onmouseout = null;
		this._self.onmouseover = null;
		this._self.onmousedown = null;
		this._self.onmouseup = null;
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
	this.onMouseDown = function(ev){
		this.setCapture(true);
		/*
		var _this = this;
		var body = window.document.body;
		if(runtime._host.env == "ie"){
			body.setCapture();
		}
		body.onmousemove = function(ev){_this.onMouseMove(ev || window.event);};
		body.onmouseup = function(ev){_this.onMouseUp(ev || window.event);};
		body = null;
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
		var body = window.document.body;
		body.onmousemove = null;
		body.onmouseup = null;
		if(runtime._host.env == "ie"){
			body.releaseCapture();
		}
		body = null;
		*/
	};
});