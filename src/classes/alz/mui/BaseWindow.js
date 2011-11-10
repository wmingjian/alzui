_package("alz.mui");

_import("alz.mui.Pane");
_import("alz.mui.SysBtn");

/**
 * 窗体基类
 */
_class("BaseWindow", Pane, function(){
	this._init = function(){
		_super._init.call(this);
		this._conf = null;
		this._app = null;
		this._params = null;
		this._req = null;
		this._head = null;
		this._title = null;
		this._closebtn = null;
		this._body = null;
		this._borders = null;   //{Array}
	};
	this.create2 = function(conf, parent, app, params){
		this.setConf(conf);
		this.setParent2(parent);
		this.setApp(app);
		this.setParams(params);
	};
	this.rendered = function(){
		_super.rendered.apply(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var data = {
			"caption": this._params.caption ||
				this._tplel._attributes.caption ||
				obj.getAttribute("_caption") ||
				"标题栏"
		};
		this._body = this.find(".win-body");
		this._head = this.find(".win-head");
		var _this = this;
		this._head.onselectstart = function(ev){return false;};
		this.addListener(this._head, "mousedown", this, "onMouseDown");
		this._title = this.find(".win-head label");
		this._title.onselectstart = function(){return false;};
		this._title.innerHTML = data.caption;
		this._closebtn = new SysBtn();
		this._closebtn.init(this.find(".icon-close"), this);
	};
	this.reset = function(params){
		this.setParams(params);
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._borders){
			for(var i = 0, len = this._borders.length; i < len; i++){
				this._borders[i] = null;
			}
		}
		this._closebtn.dispose();
		this._closebtn = null;
		this._title.onselectstart = null;
		this.removeListener(this._head, "mousedown");
		this._head.onselectstart = null;
		this._head = null;
		this._req = null;
		this._params = null;
		this._app = null;
		this._conf = null;
		_super.dispose.apply(this);
	};
	this.setConf = function(v){
		this._conf = v;
	};
	this.setApp = function(v){
		this._app = v;
	};
	this.setParams = function(v){
		this._params = v;
	};
	this.setReq = function(v){
		this._req = v;
	};
	this.onMouseDown = function(ev){
		this._self.style.zIndex = runtime.getNextZIndex();
		//this._head.setCapture(true);
		var pos = runtime.dom.getPos1(ev, 1, this._self);
		this._offsetX = pos.x;  //ev.offsetX;  //ns 浏览器的问题
		this._offsetY = pos.y;  //ev.offsetY;
		this.setCapture(true);
		/*
		var _this = this;
		var body = window.document.body;
		if(runtime._host.env == "ie"){
			body.setCapture();
		}
		this.addListener(body, "mousemove", this, "onMouseMove");
		this.addListener(body, "mouseup", this, "onMouseUp");
		*/
	};
	this.onMouseMove = function(ev){
		var rect = runtime.dom.getViewPort(window.document.body);
		//[TODO]是否需要考虑BODY元素的边框宽度？
		var x = rect.x + Math.min(rect.w - 10, Math.max(10, ev.clientX)) - this._offsetX/* - 2*/;
		var y = rect.y + Math.min(rect.h - 10, Math.max(10, ev.clientY)) - this._offsetY/* - 2*/;
		runtime.dom.moveTo(this._self, x, y);
	};
	this.onMouseUp = function(ev){
		this.setCapture(false);
		/*
		var body = window.document.body;
		this.removeListener(body, "mousemove");
		this.removeListener(body, "mouseup");
		if(runtime._host.env == "ie"){
			body.releaseCapture();
		}
		body = null;
		*/
		//if(runtime.ie) this._head.releaseCapture();
		//this.setCapture(false);
	};
	this.close = function(){
		this.setVisible(false);
	};
	this.callback = function(){
		var args = [this];  //回调函数的第一个参数一定是对话框组件本身
		for(var i = 0, len = arguments.length; i < len; i++){
			args.push(arguments[i]);
		}
		if(this._req){
			this._req.func.apply(this._req.agent, args);
			this._req = null;  //只允许被调用一次
		}
	};
	this.do_win_close = function(act, sender){
		this.setVisible(false);
		this.callback(act, sender);
	};
	this.createBorders = function(){
		this._borders = [];
		for(var i = 0, len = this._cursors.length; i < len; i++){
			var o = this._createElement2(this._self, "div", "border", {
				"cursor": this._cursors[i] + "-resize"
			});
			//if(i % 2 == 0) o.style.backgroundColor = "red";
			if(runtime._debug && !(runtime._host.env == "opera" && runtime._host.ver == "8.00")){
				o.style.backgroundColor = "#000000";
				//o.style.filter = "Alpha(Opacity=30)";
				runtime.dom.setOpacity(o, 0.3);
			}else{
				if(i == 1 && this._skin._model["top_use_opacity"] && !(runtime._host.env == "opera" && runtime._host.ver == "8.00")){
					o.style.backgroundColor = "#000000";
					runtime.dom.setOpacity(o, 0.01);
				}
			}
			this._borders.push(o);
			o = null;
		}
	};
	this.hideBorder = function(){
		for(var i = 0, len = this._borders.length; i < len; i++){
			this._borders[i].style.display = v ? "" : "none";
		}
	};
	this.resizeBorder = function(w, h){
		var bw4 = 4, bw8 = 8;
		this.setElementRect(this._borders[0], 0    , 0    , bw8    , bw8);
		this.setElementRect(this._borders[1], bw8  , 0    , w-2*bw8, bw4);
		this.setElementRect(this._borders[2], w-bw8, 0    , bw8    , bw8);

		this.setElementRect(this._borders[3], 0    , bw8  , bw4    , h-2*bw8);
		this.setElementRect(this._borders[4], w-bw4, bw8  , bw4    , h-2*bw8);

		this.setElementRect(this._borders[5], 0    , h-bw8, bw8    , bw8);
		this.setElementRect(this._borders[6], bw8  , h-bw4, w-2*bw8, bw4);
		this.setElementRect(this._borders[7], w-bw8, h-bw8, bw8    , bw8);
	};
});