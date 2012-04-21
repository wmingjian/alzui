/**
 * alzui-mini JavaScript Framework, v0.0.8
 * Copyright (c) 2009 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
(function(){with(runtime.createContext("test_win", "core,ui")){

function $(id){return window.document.getElementById(id);}

//import alz.core.DomUtil2;
//import alz.mui.Component2;
/*<file name="alz/mui/Workspace2.js">*/
_package("alz.mui");

_import("alz.mui.Component");

_class("Workspace", Component, function(_super){
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
/*</file>*/
/*<file name="alz/mui/SilverButton.js">*/
_package("alz.mui");

_import("alz.mui.Component");

_class("SilverButton", Component, function(_super){
	var _css = {
		"normal":{"background-position":"0 0"     ,"_cite":{"background-position":"right -30px" ,"color":"#333"   }},
		"over"  :{"background-position":"0 -60px" ,"_cite":{"background-position":"right -90px" ,"color":"#000333"}},
		"active":{"background-position":"0 -120px","_cite":{"background-position":"right -150px","color":"#333"   }}
	};
	this._init = function(){
		_super._init.call(this);
		this._btn = null;
		this._cite = null;
	};
	this.create = function(btn){
		var obj = this._createElement("span");
		obj.className = "wui-SilverButton";
		if(btn){
			btn.parentNode.replaceChild(obj, btn);
			this._btn = obj.appendChild(btn);
		}
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var cite = this._createElement("cite");
		cite.appendChild(this._createTextNode(this._btn.value));
		this._ee["_cite"] =
		this._cite = this._self.appendChild(cite);
		this._self.style.backgroundRepeat = "no-repeat";
		this._cite.style.backgroundRepeat = "no-repeat";
		this.setState("normal");
		this._self.onclick = function(){_alert("onclick");};
		this._self.onmousedown = function(){this._ptr.setState("active");};
		this._self.onmouseup = function(){this._ptr.setState("over");};
		this._self.onmouseover = function(){this._ptr.setState("over");};
		this._self.onmouseout = function(){this._ptr.setState("normal");};
	};
	this.dispose = function(){
		this._cite = null;
		this._btn = null;
		this._self.onclick = null;
		this._self.onmousedown = null;
		this._self.onmouseup = null;
		this._self.onmouseover = null;
		this._self.onmouseout = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setState = function(v){
		runtime.dom.applyCssStyle(this, _css, v);
	};
});
/*</file>*/
/*<file name="alz/test/PaneHome.js">*/
_package("alz.test");

_import("alz.mui.Pane");

/**
 * 默认面板
 */
_class("PaneHome", Pane, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._tpl = "pane_home.xml";
	};
	/*
		<li><a href="index.html">介绍</a></li>
		<li><a href="Window.html">Window组件</a></li>
		<li><a href="Table.html">Table组件</a></li>
	*/
	this.create = function(parent, app){
		this.setParent2(parent);
		this._app = app;
		var obj = runtime.dom.createDomElement(this._app._template.getTpl(this._tpl));
		parent.appendChild(obj);
		this.init(obj);
		return obj;
	};
	this.dispose = function(){
		this._app = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});
/*</file>*/
/*<file name="alz/test/PaneConsole.js">*/
_package("alz.test");

_import("alz.mui.Pane");
_import("alz.mui.Console");

/**
 * 控制台面板
 */
_class("PaneConsole", Pane, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._tpl = "pane_console.xml";
		this._console = null;
	};
	this.create = function(parent, app){
		this.setParent2(parent);
		this._app = app;
		var obj = runtime.dom.createDomElement(this._app._template.getTpl(this._tpl));
		parent.appendChild(obj);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this.createConsole();
	};
	this.dispose = function(){
		this._console.dispose();
		this._console = null;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getLogTime = function(){
		return "[" + new Date().toMyString(3) + "]";  //hh:mm:ss
	};
	this.createConsole = function(){
		this._console = new Console();
		this._console.create(this._self, null/*this*/);
		this._console.resize(640, 100);
		//this._console._self.setAttribute("_align", "bottom");
		var _this = this;
		//打印之前缓存的日志信息
		for(var i = 0, len = runtime._log.length; i < len; i++){
			this._console.print(runtime._log[i] + "\n", "log");
		}
		//重定义系统级输出函数
		runtime.log = function(msg){
			_this._console.print(_this.getLogTime() + msg + "\n", "log");
		};
		runtime.warning = function(msg){
			_this._console.print(msg + "\n", "warn");
		};
		runtime.error = function(msg){
			_this._console.print(msg + "\n", "err");
		};
		//控制台开始实际工作
		runtime.warning(this.getLogTime() + "Now start the actual work of the console.");
		this._console.start(this, function(text){
			this.interpret(text);
		});
	};
	this.interpret = function(text){
		try{
			var v = null;
			with(__context__){
				v = eval(text);
			}
			if(typeof v == "object" && v !== null){
				this._console.print(runtime.forIn(v).join("\n") + "\n");
			}
		}catch(ex){
			//window.alert(ex.message);
			//this._console.print(runtime.forIn(ex).join("#") + "\n");
			this._console.print(ex.name + "," + ex.message + "\n");
			return false;
		}
	};
});
/*</file>*/
/*<file name="alz/test/PaneWindow.js">*/
_package("alz.test");

_import("alz.mui.Pane");
_import("alz.mui.Window");

/**
 * 窗体组件面板
 */
_class("PaneWindow", Pane, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._tpl = "pane_window.xml";
		this._win1 = null;
		this._win2 = null;
	};
	this.create = function(parent, app){
		this.setParent2(parent);
		this._app = app;
		var obj = runtime.dom.createDomElement(this._app._template.getTpl(this._tpl));
		parent.appendChild(obj);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._win1 = new Window();
		this._win1.bind($("win1"));
		this._win1._self.style.zIndex = runtime.getNextZIndex();
		this._win2 = new Window();
		this._win2.bind($("win2"));
		this._win2._self.style.zIndex = runtime.getNextZIndex();
		var _this = this;
		this._win1._self.getElementsByTagName("input")[0].checked = true;
		this._win1._self.getElementsByTagName("input")[0].onclick = function(){
			_this._win1.setResizable(this.checked);
		};
		this._win2._self.getElementsByTagName("input")[0].checked = true;
		this._win2._self.getElementsByTagName("input")[0].onclick = function(){
			_this._win2.setResizable(this.checked);
		};
		this.resize($("main1").clientWidth, $("main1").clientHeight);
	};
	this.dispose = function(){
		this._win2.dispose();
		this._win2 = null;
		this._win1.dispose();
		this._win1 = null;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resize = function(w, h){
		w -= 220;
		h -= 220;
		this._win1.resize(w, h);
		this._win2.resize(w, h);
	};
});
/*</file>*/
/*<file name="alz/test/PaneTable.js">*/
_package("alz.test");

_import("alz.mui.Pane");

/**
 * 表格组件面板
 */
_class("PaneTable", Pane, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._tpl = "pane_table.xml";
	};
	this.create = function(parent, app){
		this.setParent2(parent);
		this._app = app;
		var obj = runtime.dom.createDomElement(this._app._template.getTpl(this._tpl));
		parent.appendChild(obj);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var sb = [];
		sb.push('<table class="mui-Table" border="1" bordercolor="gray" cellspacing="0" cellpadding="1">');
		sb.push('<thead>');
		sb.push('<tr><th>id</th><th>name</th><th>value</th><th>col3</th><th>col4</th><th>col5</th><th>col6</th><th>col7</th><th>col8</th><th>col9</th><th>col10</th></tr>');
		sb.push('</thead>');
		sb.push('<tbody>');
		for(var i = 0, len = 100; i < len; i++){
			sb.push('<tr><td>' + i + '</td><td>name' + i + '</td><td>value' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td></tr>');
		}
		sb.push('</tbody>');
		sb.push('</table>');
		this._self.innerHTML = sb.join("");
	};
	this.dispose = function(){
		this._app = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});
/*</file>*/
/*<file name="alz/test/PaneForm.js">*/
_package("alz.test");

_import("alz.mui.Pane");

/**
 * 通用表单面板
 */
_class("PaneForm", Pane, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._tpl = "pane_form.xml";
	};
	this.create = function(parent, app){
		this.setParent2(parent);
		this._app = app;
		var obj = runtime.dom.createDomElement(this._app._template.getTpl(this._tpl));
		parent.appendChild(obj);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		this._app = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});
/*</file>*/
/*<file name="alz/test/AppTestWin.js">*/
_package("alz.test");

_import("alz.core.Application");
_import("alz.test.PaneHome");
_import("alz.test.PaneWindow");
_import("alz.test.PaneTable");
_import("alz.test.PaneForm");

_class("AppTestWin", Application, function(_super){
	var pane_conf = [
		{id: "home"   , name:"介绍"      , url: "index.html"  , title: "默认页"  , clazz: "PaneHome"   },
		{id: "console", name:"控制台"    , url: "console.html", title: "控制台"  , clazz: "PaneConsole"},
		{id: "win"    , name:"Window组件", url: "Window.html" , title: "窗体皮肤", clazz: "PaneWindow" },
		{id: "table"  , name:"Table组件" , url: "Table.html"  , title: "表格组件", clazz: "PaneTable"  },
		{id: "form"   , name:"通用表单"  , url: "Form.html"   , title: "通用表单", clazz: "PaneForm"   }
	];
	var pane_hash = {};
	this._init = function(){
		_super._init.call(this);
		this._template = {
			getTpl: function(name){
				return runtime.getTplData("test_win")[name];
			}
		};
		this._panes = {};
		this._activePane = null;
	};
	this.init = function(){
		_super.init.apply(this, arguments);
		var obj = runtime.dom.createDomElement(this._template.getTpl("pane_main.xml"));
		document.body.appendChild(obj);
		var sb = [];
		for(var i = 0, len = pane_conf.length; i < len; i++){
			var item = pane_conf[i];
			pane_hash[item.id] = item;
			sb.push('<li _id="' + item.id + '"><a href="' + item.url + '">' + item.name + '</a></li>');
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
/*</file>*/

runtime.regLib("test_win", function(){
	application = runtime.createApp("alz.test.AppTestWin");
});

}})(this);