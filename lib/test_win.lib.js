/**
 * alzui-mini JavaScript Framework, v0.0.8
 * Copyright (c) 2009 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
(function(){with(runtime.createContext("test_win", "core,ui")){

function $(id){return window.document.getElementById(id);}

/*#file begin=alz.core.DomUtil2.js*/

/*#file end*/
//_import("alz.mui.Component2");
/*#file begin=alz.mui.Workspace2.js*/
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
/*#file end*/
/*#file begin=alz.mui.SilverButton.js*/
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
		cite = null;
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
	this.setState = function(v){
		runtime.dom.applyCssStyle(this, _css, v);
	};
});
/*#file end*/
/*#file begin=alz.tools.AppTestWin.js*/
_package("alz.tools");

_import("alz.core.Application");
_import("alz.mui.Window");
_import("alz.mui.Console");

_class("AppTestWin", Application, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._console = null;
		this._win1 = null;
		this._win2 = null;
	};
	this.init = function(){
		_super.init.apply(this, arguments);
		this.createConsole();
		switch(runtime.getConfData("action")){
		case "index" : this.test_index();break;
		case "window": this.test_window();break;
		case "table" : this.test_table();break;
		}
	};
	this.dispose = function(){
		if(this._win1){
			this._win2.dispose();
			this._win2 = null;
			this._win1.dispose();
			this._win1 = null;
		}
		this._console.dispose();
		this._console = null;
		_super.dispose.apply(this);
	};
	this.onResize = function(w, h){
		if(this._win1){
			w -= 220;
			h -= 220;
			this._win1.resize(w, h);
			this._win2.resize(w, h);
		}
	};
	this.getLogTime = function(){
		return "[" + new Date().toMyString(3) + "]";  //hh:mm:ss
	};
	this.createConsole = function(){
		this._console = new Console();
		this._console.create(document.body, null/*this*/);
		this._console.resize(640, 100);
		this._console._self.setAttribute("_align", "bottom");
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
	this.test_index = function(){
	};
	this.test_window = function(){
		this._win1 = new Window();
		this._win1.init($("win1"), $("body1"));
		this._win1._self.style.zIndex = runtime.getNextZIndex();
		this._win2 = new Window();
		this._win2.init($("win2"), $("body2"));
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
	};
	this.test_table = function(){
		var sb = [];
		sb.push('<table class="wui-Table" border="0" cellspacing="0" cellpadding="0">');
		sb.push('<thead>');
		sb.push('<tr><th>id</th><th>name</th><th>value</th><th>col3</th><th>col4</th><th>col5</th><th>col6</th><th>col7</th><th>col8</th><th>col9</th><th>col10</th></tr>');
		sb.push('</thead>');
		sb.push('<tbody>');
		for(var i = 0, len = 100; i < len; i++){
			sb.push('<tr><td>' + i + '</td><td>name' + i + '</td><td>value' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td></tr>');
		}
		sb.push('</tbody>');
		sb.push('</table>');
		$("tbl1").innerHTML = sb.join("");
	};
});
/*#file end*/

runtime.regLib("test_win", function(){
	application = runtime.createApp("alz.tools.AppTestWin");
});

}})(this);