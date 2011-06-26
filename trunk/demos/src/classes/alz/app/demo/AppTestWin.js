_package("alz.app.demo");

_import("alz.core.Application");
_import("alz.app.demo.pane.PaneHome");
_import("alz.app.demo.pane.PaneWindow");
_import("alz.app.demo.pane.PaneTable");
_import("alz.app.demo.pane.PaneForm");
_import("alz.app.demo.pane.PaneUrlMan");

_class("AppTestWin", Application, function(){
	var pane_conf = [
		{"id": "home"   , "name":"介绍"      , "title": "默认页"  , "clazz": "PaneHome"   },
		{"id": "console", "name":"控制台"    , "title": "控制台"  , "clazz": "PaneConsole"},
		{"id": "win"    , "name":"Window组件", "title": "窗体皮肤", "clazz": "PaneWindow" },
		{"id": "table"  , "name":"Table组件" , "title": "表格组件", "clazz": "PaneTable"  },
		{"id": "form"   , "name":"通用表单"  , "title": "通用表单", "clazz": "PaneForm"   },
		{"id": "urlman" , "name":"网址管理"  , "title": "网址管理", "clazz": "PaneUrlMan" }
	];
	var pane_hash = {};
	this._init = function(){
		_super._init.call(this);
		this._template = {
			getTpl: function(name){
				return runtime.getTplData("demos.tpl")[name];
			}
		};
		this._panes = {};
		this._activePane = null;
	};
	this.init = function(){
		_super.init.apply(this, arguments);
		var obj = runtime.dom.createDomElement(this._template.getTplData("pane_main.xml"));
		document.body.appendChild(obj);
		var sb = [];
		for(var i = 0, len = pane_conf.length; i < len; i++){
			var item = pane_conf[i];
			pane_hash[item.id] = item;
			sb.push('<li _id="' + item.id + '"><a href="#">' + item.name + '</a></li>');
		}
		$("left1").innerHTML = sb.join("");
		var _this = this;
		function handle_click(ev){
			_this.getPane2(this.getAttribute("_id"));
			return false;
		}
		var nodes = $("left1").getElementsByTagName("li");
		for(var i = 0, len = nodes.length; i < len; i++){
			nodes[i].onclick = handle_click;
		}
		switch(runtime.getConfData("action")){
		case "home": this.getPane2("home");break;
		}
	};
	this.dispose = function(){
		this._activePane = null;
		for(var k in this._panes){
			this._panes[k].dispose();
			delete this._panes[k];
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.onResize = function(w, h){
		var mw = Math.max(0, w - $("left1").offsetWidth);
		$("left1").style.height = h + "px";
		$("main1").style.width = mw + "px";
		$("main1").style.height = h + "px";
		if(this._activePane && this._activePane.resize){
			this._activePane.resize(mw, h);
		}
	};
	this.getPane2 = function(id){
		if(!(id in this._panes)){
			var clazz = __context__[pane_hash[id].clazz];
			var pane = new clazz();
			pane.create($("main1"), this);
			this._panes[id] = pane;
		}
		this.setActivePane(this._panes[id]);
	};
	this.setActivePane = function(v){
		if(this._activePane == v) return;
		if(this._activePane){
			this._activePane._self.style.display = "none";
		}
		v._self.style.display = "";
		this._activePane = v;
	};
});