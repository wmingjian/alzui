_package("alz.mui");

_import("alz.mui.Component");

/*
	<div class="wui-skin">
		<div class="nw"></div>
		<div class="n"></div>
		<div class="ne"></div>
		<div class="w"></div>
		<div class="e"></div>
		<div class="sw"></div>
		<div class="s"></div>
		<div class="se"></div>
	</div>

一个窗体组件的几种BorderStyle：
	bsDialog
	bsNone
	bsSingle
	bsSizeable
	bsSizeToolWin
	bsToolWindow
*/
_class("WindowSkinWINXP", Component, function(){
	this._cssData = {
		"normal":{
			"_title1":{"display":"none"},
			"_title2":{"display":""},
			"_skin3" :{"background-position":"-8px 0px"},
			"_skin4" :{"background-position":"-11px 0px"},
			"_skin5" :{"background-position":"0px -30px"},
			"_skin6" :{"background-position":"0px 0px"},
			"_skin7" :{"background-position":"-10px -30px"}
		},
		"resizable":{
			"_title1":{"display":""},
			"_title2":{"display":"none"},
			"_skin3" :{"background-position":"0px 0px"},
			"_skin4" :{"background-position":"-4px 0px"},
			"_skin5" :{"background-position":"0px -33px"},
			"_skin6" :{"background-position":"0px -3px"},
			"_skin7" :{"background-position":"-9px -33px"}
		}
	};
	this._cssHash = {
		"_minbtn":{
			"normal"  :{"background-position":"0px 0px"},
			"active"  :{"background-position":"0px -21px"},
			"disabled":{"background-position":"0px -42px"}
		},
		"_maxbtn":{
			"normal"  :{"background-position":"-42px 0px"},
			"active"  :{"background-position":"-42px -21px"},
			"disabled":{"background-position":"-42px -42px"}
		},
		"_closebtn":{
			"normal"  :{"background-position":"-63px 0px"},
			"active"  :{"background-position":"-63px -21px"},
			"disabled":{"background-position":"-63px -42px"}
		}
	};
	this._init = function(){
		_super._init.call(this);
		//this._skins = null;
		this._title = null;
		this._title1 = null;
		this._title2 = null;
		this._width = 0;
		this._height = 0;
		this._model = {
			"min_width"  : 123,
			"min_height" : 34,
			"head_height": 30,
			"sbtn_width" : 21,
			"sbtn_height" : 21,
			"icon_width" : 16,
			"sep_num"    : 7,
			"top_use_opacity": true  //顶部上调区域是否需要使用透明度，受标题栏IMG标签影响
		};
	};
	this.create = function(parent){
		if(parent){
			this._parent = parent;
			for(var k in this._cssHash){
				this._parent[k]._cssData = this._cssHash[k];
			}
		}
		var obj = this._createElement2(parent ? parent._self : null, "div", "wui-skin");
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._xpath = ".mui-Window-winxp";
		//this._skins = [];
		for(var i = 0, len = this._cursors.length; i < len; i++){
			var o = this._createElement2(this._self, "div", this._cursors[i]/*, {
				"position"       : "absolute",
				"overflow"       : "hidden",
				"backgroundColor": "#000000",
				"filter"         : "Alpha(Opacity=20)",
				"zIndex"         : 10,
				"cursor"         : this._cursors[i] + "-resize"
			}*/);
			//this._skins.push(o);
			this._ee["_skin" + i] = o;
			o = null;
		}
		this._ee["_title1"] =
		this._title =
		this._title1 = this._createElement("img");
		this._ee["_title2"] =
		this._title2 = this._createElement("img");
		this._self.appendChild(this._title1);
		this._self.appendChild(this._title2);
		this._title1.src = runtime.getConfigData("pathimg") + "win-xp-title-bg1.gif";
		this._title2.src = runtime.getConfigData("pathimg") + "win-xp-title-bg2.gif";
		this._title1._dlg = this;
		this._title2._dlg = this;
		this._title1.ondragstart = function(){return false;};
		this._title2.ondragstart = function(){return false;};
		this._title1.onmousedown =
		this._title2.onmousedown = function(ev){
			this._dlg._parent.onMouseDown(ev || window.event);
		};
		this.setState("resizable");
		//runtime.dom.applyCssStyle(this, _cssName, "resizable");
	};
	this.dispose = function(){
		this._title = null;
		this._title1.onmousedown = null;
		this._title2.onmousedown = null;
		this._title1.ondragstart = null;
		this._title2.ondragstart = null;
		this._title1._dlg = null;
		this._title2._dlg = null;
		_super.dispose.apply(this);
	};
	this.resize = function(w, h){
		//if(_super.resize.apply(this, arguments)) return true;
		_super.resize.apply(this, arguments);
		if(this._parent.getResizable()){
			var w1 =  7;  //顶宽
			var w2 =  4;  //中宽
			var w3 =  5;  //底宽
			var h1 = 30;  //顶高
			var h3 =  4;  //底高
		}else{
			var w1 =  7;  //顶宽
			var w2 =  3;  //中宽
			var w3 =  4;  //底宽
			var h1 = 29;  //顶高
			var h3 =  3;  //底高
		}
		this.setElementRect(this._ee["_skin0"],    0 ,    0 ,     w1 ,      h1);
		this.setElementRect(this._ee["_skin1"],   w1 ,    0 , w-2*w1 ,      h1);
		this.setElementRect(this._title       ,   w1 ,    0 , w-2*w1 ,      h1);
		this.setElementRect(this._ee["_skin2"], w-w1 ,    0 ,     w1 ,      h1);

		this.setElementRect(this._ee["_skin3"],    0 ,   h1 ,     w2 , h-h1-h3);
		this.setElementRect(this._ee["_skin4"], w-w2 ,   h1 ,     w2 , h-h1-h3);

		this.setElementRect(this._ee["_skin5"],    0 , h-h3 ,     w3 ,      h3);
		this.setElementRect(this._ee["_skin6"],   w3 , h-h3 , w-2*w3 ,      h3);
		this.setElementRect(this._ee["_skin7"], w-w3 , h-h3 ,     w3 ,      h3);
	};
	this.onResizableChange = function(){
		if(this._parent.getResizable()){
			this.setState("resizable");
			this._title = this._title1;
		}else{
			this.setState("normal");
			this._title = this._title2;
		}
		this.resize(this._width, this._height);
	};
});