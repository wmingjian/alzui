_package("alz.debug");

_import("alz.core.Application");
_import("alz.mui.Window");
_import("alz.debug.pane.PaneDebug");

/**
 * 内部方法可以当作命令使用
 * <div id="dlg_debug" aui="Component" style="position:absolute;right:0px;top:0px;width:18%;height:400px;background-color:#FFFFFF;border:1px solid gray;padding:1px;z-index:100;">
 *   <h1 style="height:24px;font:bold 12px 宋体;line-height:24px;background-color:#DDDDDD;">调试对话框</h1>
 *   <div>
 *     <textarea id="code1" wrap="off" style="width:220px;height:200px;"></textarea>
 *     <input class="button" type="button" value="执行" onclick="execCode('code1');" />
 *     <div id="panel1"></div>
 *   </div>
 * </div>
 */
_class("AppDebug", Application, function(){
	runtime.__tpl__("dlg_debug.tpl", "html", '<div id="dlg_debug" _align="none" aui="Component" style="position:absolute;display:none;right:0px;top:0px;width:640px;height:480px;background-color:#FFFFFF;border:2px solid gray;padding:2px;z-index:100;">'
		+ '<h1 style="height:22px;font:bold 12px 宋体;line-height:22px;background-color:#DDDDDD;">调试对话框</h1>'
		+ '<div>'
		+ '<div style="border:1px solid gray;height:320px;overflow:auto;">'
		+ '<div id="panel2" style="float:left;width:120px;height:100%;background-color:#EEEEEE;font:12px 宋体;"></div>'
		+ '<div id="panel1" style="margin-left:120px;height:100%;overflow:auto;font:12px 宋体;"></div>'
		+ '</div>'
		+ '<input id="debug_btn1" type="button" value="执行" />'
		+ '<textarea id="debug_code1" wrap="off" style="position:absolute;left:1px;bottom:0px;width:635px;height:100px;font:12px 宋体;"></textarea>'
		+ '</div>'
		+ '</div>');
	this._init = function(){
		_super._init.call(this);
		this._win = window;
		this._doc = window.document;
		this._debugWin = null;   //调试窗体组件
		this._debugPane = null;  //调试面板
		this._dlg = null;
	};
	this.init = function(){
		_super.init.apply(this, arguments);
		this.showDebugPane();
		//runtime.showModalDialog("dlg_debug");
		//var dlg = runtime.getComponentById("dlg_debug");
		//dlg.moveTo(10, 10);
		//dlg._self.focus();
		this._template.render2(this._doc.body, "dlg_debug.tpl");
		//var obj = this.createDomElement(this._template.invoke("dlg_debug.tpl"));
		//this._doc.body.appendChild(obj);
		/*
		application.stackWatch = function(){
			var sb = [];
			for(var i = 0, len = this._actionStack.getLength(); i < len; i++){
				sb.push(this._actionStack.__item__(i));
			}
			$("panel2").innerHTML = sb.join("<br />");
		};
		*/

		this._dlg = runtime.getComponentById("dlg_debug");
		this._dlg.moveToCenter();
		this._dlg.moveTo(100, 100);
		//this._dlg.showModal(true);
		//this._dlg.setVisible(true);

		var _this = this;
		$("debug_btn1").onclick = function(){
			_this.execCode($("debug_code1").value);
		};
		$("debug_code1").onkeypress = function(ev){
			ev = ev || window.event;
			if(ev.keyCode == 10){  //ev.keyCode == 13 && ev.ctrlKey
				_this.execCode(this.value);
				ev.cancelBubble = true;
				return false;
			}
		};
		this.regHotKey(/*ctrl + `*/192, this, function(ev){
			if(!ev.ctrlKey) return;
			//this._dlg.showModal(false);
			this._dlg.setVisible(!this._dlg.getVisible());
			ev.cancelBubble = true;
			return false;
		});
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._dlg = null;
		if(this._debugPane){
			this._debugPane.dispose();
			this._debugPane = null;
		}
		if(this._debugWin){
			this._debugWin.dispose();
			this._debugWin = null;
		}
		_super.dispose.apply(this);
	};
	this.showDebugPane = function(){
		if(!this._debugPane){
			this._debugPane = new PaneDebug();
			this._debugPane.create(null, this);
		}
		if(!this._debugWin){
			var win = new Window();
			win.create(this._doc.body);
			win.resize(640, 480);
			win._body.setAttribute("_layout", "BorderLayout");
			this._debugPane._self.setAttribute("_align", "client");
			this._debugPane._self.style.border = "0px";
			win._body.appendChild(this._debugPane._self);
			this._debugWin = win;
		}
		//显示和隐藏调试面板
		var v = !this._debugWin.getVisible();  //!this._debugPane.getVisible()
		this._debugWin.setVisible(v);
		this._debugPane.setVisible(v);
		/*
		if(this._debugWin && v){
			this.layoutElement(this._debugWin._body);
		}
		*/
	};
	this.forIn = function(o){
		var a = [];
		for(var k in o){
			a.push(k + "=" + (typeof o[k] == "function" ? "[function]" : o[k]));
		}
		return a;
	};
	this.dump = function(obj){
		this.print(this.forIn(obj).join("<br />"));
	};
	this.print = function(msg){
		$("panel1").innerHTML = msg;
	};
	this.execCode = function(code){
		try{
			with(this){
				eval(code);
			}
		}catch(ex){
			window.alert(this.forIn(ex).join("\n"));
		}
	};
});