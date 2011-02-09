_package("alz.mui");

_import("alz.mui.Component");

_class("WindowSkinWIN2K", Component, function(){
	this._cssData = {
		"resizable":{
			"_skin1" :{"background-position":"0px -10px"},
			"_skin2" :{"background-position":"-10px 0px"},
			"_skin3" :{"background-position":"0px 0px"},
			"_skin4" :{"background-position":"-4px 0px"},
			"_skin5" :{"background-position":"0px -33px"},
			"_skin6" :{"background-position":"0px -3px"},
			"_skin7" :{"background-position":"-9px -33px"}
		},
		"normal":{
			"_skin1" :{"background-position":"0px -7px"},
			"_skin2" :{"background-position":"-11px 0px"},
			"_skin3" :{"background-position":"-8px 0px"},
			"_skin4" :{"background-position":"-11px 0px"},
			"_skin5" :{"background-position":"0px -30px"},
			"_skin6" :{"background-position":"0px 0px"},
			"_skin7" :{"background-position":"-10px -30px"}
		}
	};
	this._cssHash = {
		"_minbtn": {
			"normal"  :{"background-position":"0px 0px"},
			"active"  :{"background-position":"0px -14px"},
			"disabled":{"background-position":"0px -28px"}
		},
		"_maxbtn":{
			"normal"  :{"background-position":"-32px 0px"},
			"active"  :{"background-position":"-32px -14px"},
			"disabled":{"background-position":"-32px -28px"}
		},
		"_closebtn":{
			"normal"  :{"background-position":"-48px 0px"},
			"active"  :{"background-position":"-48px -14px"},
			"disabled":{"background-position":"-48px -28px"}
		}
	};
	this._init = function(){
		_super._init.call(this);
		this._title = null;
		this._width = 0;
		this._height = 0;
		this._model = {
			"min_width"  : 112,
			"min_height" : 27,
			"head_height": 23,
			"sbtn_width" : 16,
			"sbtn_height": 14,
			"icon_width" : 16,
			"sep_num"    : 5,
			"top_use_opacity": false  //�����ϵ������Ƿ���Ҫʹ��͸���ȣ��ܱ�����IMG��ǩӰ��
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
		this._xpath = ".mui-Window-win2k";
		for(var i = 0, len = this._cursors.length; i < len; i++){
			var o = this._createElement2(this._self, "div", this._cursors[i]/*, {
				"position"       : "absolute",
				"overflow"       : "hidden",
				"backgroundColor": "#000000",
				"filter"         : "Alpha(Opacity=20)",
				"zIndex"         : 10,
				"cursor"         : this._cursors[i] + "-resize"
			}*/);
			this._ee["_skin" + i] = o;
		}
		this._title = this._createElement2(this._self, "img", "", {
			"src"        : runtime.getConfigData("pathimg") + "win-2k-title-bg.gif",
			"ondragstart": function(){return false;},
			"onmousedown": function(ev){this._dlg._parent.onMouseDown(ev || window.event);}
		});
		this._title._dlg = this;
		//runtime.dom.applyCssStyle(this, _cssName, "resizable");
		this.setState("resizable");
	};
	this.dispose = function(){
		this._title.onmousedown = null;
		this._title.ondragstart = null;
		this._title._dlg = null;
		_super.dispose.apply(this);
	};
	this.resize = function(w, h){
		//if(_super.resize.apply(this, arguments)) return true;
		_super.resize.apply(this, arguments);
		if(this._parent.getResizable()){
			var w1 =  4;  //����
			var w2 =  4;  //�п�
			var w3 =  5;  //�׿�
			var h0 =  4   //����
			var h1 = 23;  //����
			var h3 =  4;  //�׸�
		}else{
			var w1 =  3;  //����
			var w2 =  3;  //�п�
			var w3 =  4;  //�׿�
			var h0 =  3   //����
			var h1 = 22;  //����
			var h3 =  3;  //�׸�
		}
		this.setElementRect(this._ee["_skin0"],    0 ,    0 ,     w1 ,      h1);
		this.setElementRect(this._ee["_skin1"],   w1 ,    0 , w-2*w1 ,      h0);
		this.setElementRect(this._title       ,   w1 ,   h0 , w-2*w1 , h1-h0-1);
		this.setElementRect(this._ee["_skin2"], w-w1 ,    0 ,     w1 ,      h1);

		this.setElementRect(this._ee["_skin3"],    0 ,   h1 ,     w2 , h-h1-h3);
		this.setElementRect(this._ee["_skin4"], w-w2 ,   h1 ,     w2 , h-h1-h3);

		this.setElementRect(this._ee["_skin5"],    0 , h-h3 ,     w3 ,      h3);
		this.setElementRect(this._ee["_skin6"],   w3 , h-h3 , w-2*w3 ,      h3);
		this.setElementRect(this._ee["_skin7"], w-w3 , h-h3 ,     w3 ,      h3);
	};
	this.onResizableChange = function(){
		//runtime.dom.applyCssStyle(this, _cssName, this._parent.getResizable() ? "resizable" : "normal");
		this.setState(this._parent.getResizable() ? "resizable" : "normal");
		this.resize(this._width, this._height);
	};
});