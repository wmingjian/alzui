_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.SysBtn");
_import("alz.mui.WindowSkinWINXP");
_import("alz.mui.WindowSkinWIN2K");

/*
	<div class="head">
		<img src="images/win-icon.gif" />
		<label>窗体组件标题栏 - Windown XP</label>
		<div class="sysbtn">
			<div class="icon-min"></div>
			<div class="icon-max"></div>
			<div class="icon-close"></div>
		</div>
	</div>
	<div class="head">
		<img src="images/win-icon.gif" />
		<label>窗体组件标题栏 - Windown 2000</label>
		<div class="sysbtn">
			<div class="icon-min"></div>
			<div class="icon-max"></div>
			<div class="icon-close"></div>
		</div>
	</div>
*/
_class("Window", Component, function(){
	var TPL_WIN = '<div id="win2" class="aui-Window-win2k" _icon="{$pathimg}win-icon.gif" _caption="alzui调试器 - Windown 2000" _align="none">'
		+ '<div class="body">'
		//+ '<input type="checkbox" checked="checked" /> Resizable'
		+ '</div></div>';
	var TPL_HEAD = '<div class="head">'
		+ '<img />'
		+ '<label></label>'
		+ '<div class="sysbtn">'
		+ '<div class="icon-min" title="最小化"></div>'
		+ '<div class="icon-max" title="最大化"></div>'
		+ '<div class="icon-close" title="关闭"></div>'
		+ '</div>'
		+ '</div>';
	this._init = function(){
		_super._init.call(this);
		this._head = null;
		this._icon = null;
		this._title = null;
		this._minbtn = null;
		this._maxbtn = null;
		this._closebtn = null;
		this._body = null;
		this._skin = null;
		this._borders = null;
		this._resizable = true;
		this._width = 0;
		this._height = 0;
	};
	this.create = function(parent){
		this.setParent2(parent);
		var tpl = tpl_replace(TPL_WIN, {"pathimg": "../alzui/res/images/"});
		var obj = runtime.createDomElement(tpl);
		if(parent){
			parent.appendChild(obj);
		}
		this.init(obj);
		return obj;
	};
	this.bind = function(obj){
		this.setParent2(obj.parentNode);
		this.init(obj);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		/*
		body     .body
		head     .head
		icon     .head > img
		title    .head > label
		minbtn   .head > .sysbtn > .icon-min
		maxbtn   .head > .sysbtn > .icon-max
		closebtn .head > .sysbtn > .icon-close
		*/
		this._cssName = "." + this._self.className;
		this._xpath = this._cssName;
		this._body = this._self.childNodes[0];
		this._head = runtime.createDomElement(TPL_HEAD, this._self);
		this._head._dlg = this;
		this._head.onselectstart = function(){return false;};
		this._head.onmousedown = function(ev){return this._dlg.onMouseDown(ev || window.event);};
		this._icon = this._head.childNodes[0];  //this._head.getElementsByTagName("img")[0];
		this._icon.src = obj.getAttribute("_icon").replace(/^images\//, runtime.getConfigData("pathimg"));
		this._icon.ondragstart = function(){return false;};
		this._title = this._head.childNodes[1];  //this._head.getElementsByTagName("label")[0];
		this._title.innerHTML = obj.getAttribute("_caption");
		this._title.onselectstart = function(){return false;};
		this._minbtn = new SysBtn();
		this._minbtn.init(this._head.childNodes[2].childNodes[0], this);
		this._maxbtn = new SysBtn();
		this._maxbtn.init(this._head.childNodes[2].childNodes[1], this);
		this._closebtn = new SysBtn();
		this._closebtn.init(this._head.childNodes[2].childNodes[2], this);
		if(this._self.className == "aui-Window-winxp"){
			this._skin = new WindowSkinWINXP();
		}else{
			this._skin = new WindowSkinWIN2K();
		}
		this._createBorders();
		this._skin.create(this);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._skin.dispose();
		this._skin = null;
		this._minbtn.dispose();
		this._minbtn = null;
		this._maxbtn.dispose();
		this._maxbtn = null;
		this._closebtn.dispose();
		this._closebtn = null;
		this._title.onselectstart = null;
		this._icon.ondragstart = null;
		this._head.onmousedown = null;
		this._head.onselectstart = null;
		this._head._dlg = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/*this.xquery = function(xpath){
		return runtime._xpq.query(xpath, this._self);
	};*/
	this.getResizable = function(){
		return this._resizable;
	};
	this.setResizable = function(v){
		if(v == this._resizable) return;
		this._resizable = v;
		this.tune(this._width, this._height);
		for(var i = 0, len = this._borders.length; i < len; i++){
			this._borders[i].style.display = v ? "" : "none";
		}
		this._skin.onResizableChange();
	};
	this._createBorders = function(){
		this._borders = [];
		for(var i = 0, len = this._cursors.length; i < len; i++){
			var o = this._createElement2(this._self, "div", "", {
				"position": "absolute",
				"overflow": "hidden",
				"zIndex"  : 3,
				"cursor"  : this._cursors[i] + "-resize"
			});
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
	this._resizeBorder = function(w, h){
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
	this.resize = function(w, h){
		if(w < this._skin._model["min_width"] ) w = this._skin._model["min_width"];
		if(h < this._skin._model["min_height"]) h = this._skin._model["min_height"];
		if(_super.resize.apply(this, arguments)) return true;
		this.tune(w, h);
		this._resizeBorder(w, h);
		this._skin.resize(w, h);
	};
	this.tune = function(w, h){
		var m = this._skin._model;
		var n, h0;
		if(this._resizable){
			n = 4;
			h0 = m["head_height"];
		}else{
			n = 3;
			h0 = m["head_height"] - 1;
		}
		this.setElementRect(this._head, n,  n, w - 2 * n,     h0 - n - 1);
		this.setElementRect(this._body, n, h0, w - 2 * n, h - h0 - n    );
		this._title.style.width = (w - 2 * n - m["icon_width"] - m["sbtn_width"] * 3 - 2 * m["sep_num"]) + "px";
		m = null;
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
		body.onmousemove = function(ev){_this.onMouseMove(ev || window.event);};
		body.onmouseup = function(ev){_this.onMouseUp(ev || window.event);};
		body = null;
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
		body.onmousemove = null;
		body.onmouseup = null;
		if(runtime._host.env == "ie"){
			body.releaseCapture();
		}
		body = null;
		*/
		//if(runtime.ie) this._head.releaseCapture();
		//this.setCapture(false);
	};
});