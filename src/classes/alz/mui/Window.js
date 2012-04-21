_package("alz.mui");

_import("alz.mui.BaseWindow");
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
_class("Window", BaseWindow, function(){
	//<input type="checkbox" checked="checked" /> Resizable
	this._init = function(){
		_super._init.call(this);
		this._icon = null;
		this._minbtn = null;
		this._maxbtn = null;
		this._skin = null;
		this._resizable = true;
		this._width = 0;
		this._height = 0;
	};
	this.build = function(el){
		_super.build.apply(this, arguments);
		var attributes = el._attributes;
		if(attributes.dock){
			if(attributes.dock == "true"){
				runtime.dom.removeClass(this._self, "undock");
			}else{
				runtime.dom.addClass(this._self, "undock");
			}
		}
		this.setParent2(this._self.parentNode);
		this._params = {};
	};
	this.create = function(parent, app, params, tpl){
		this.setParent2(parent);
		this.setApp(app);
		this.setParams(params || {});
		var obj = this.createTplElement(parent, tpl);
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
		//_icon="{$pathimg}win-icon.gif" _caption="alzui调试器 - Windown 2000" _align="none"
		var data = {
			"icon"   : obj.getAttribute("_icon") || "",
			"caption": this._params.caption || obj.getAttribute("_caption") || "标题栏"
		};
		this._cssName = "." + this._self.className;
		this._xpath = this._cssName;
		var _this = this;
		this._icon = this.find(".icon");
		this._icon.src = data.icon.replace(/^images\//, runtime.getConfigData("pathimg"));
		this._icon.ondragstart = function(){return false;};
		this._minbtn = new SysBtn();
		this._minbtn.init(this.find(".icon-min"), this);
		this._maxbtn = new SysBtn();
		this._maxbtn.init(this.find(".icon-max"), this);
		if(this._self.className == "ui-window-winxp"){
			this._skin = new WindowSkinWINXP();
		}else{
			this._skin = new WindowSkinWIN2K();
		}
		this.createBorders();
		this._skin.create(this);
		this.resize(800, 600);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._skin.dispose();
		this._skin = null;
		this._minbtn.dispose();
		this._minbtn = null;
		this._maxbtn.dispose();
		this._maxbtn = null;
		this._icon.ondragstart = null;
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
		this.hideBorder();
		this._skin.onResizableChange();
	};
	this.resize = function(w, h){
		if(w < this._skin._model["min_width"] ) w = this._skin._model["min_width"];
		if(h < this._skin._model["min_height"]) h = this._skin._model["min_height"];
		if(_super.resize.apply(this, arguments)) return true;
		//this.tune(w, h);
		if(/*this._resizable && */this._borders){
			this.resizeBorder(w, h);
		}
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
	};
	//窗体最大化
	this.do_win_max = function(act, sender){
		console.log("[TODO]do_win_max");
		var rect = this.getParent().getViewPort();
		this.resize(rect.w, rect.h);
	};
	//窗体最小化
	this.do_win_min = function(act, sender){
		console.log("[TODO]do_win_min");
	};
});