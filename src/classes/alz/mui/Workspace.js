_package("alz.mui");

_import("alz.mui.Container");
_import("alz.mui.ModalPanel");

/**
 * 工作区组件
 */
_class("Workspace", Container, function(){
	this._init = function(){
		_super._init.call(this);
		this._fixedX = 0;
		this._fixedY = 0;
		this._fixedOff = null;
		this._fixed = null;
		this._testFixDiv = null;
		this._modalPanel = null;
		this._captureComponent = null;
		this._tipMouse = null;
		this._activePopup = null;
		this._activeDialog = null;
		this._types = {
			"workspace" : {},
			"window"    : {},
			"dialog"    : {},
			"pane"      : {},
			"button"    : {},
			"checkbox"  : {},
			"radio"     : {},
			"combobox"  : {},
			"richeditor": {},
			"codeeditor": {},
			"icon"      : {},
			"popup"     : {},
			"popmenu"   : {},
			"rebar"     : {},
			"menubar"   : {},
			"toolbar"   : {},
			"statusbar" : {},
			"menu"      : {},
			"menuitem"  : {},
			"panel"     : {},
			"toolbutton": {}
		};
	};
	this.create = function(parent){
		this.setParent2(parent);
		var obj = this._createElement2(parent, "div", "ui-workspace wui-PaneApp");
		this.init(obj);
		return obj;
	};
	this.__init = function(obj, domBuildType){
		_super.__init.apply(this, arguments);
		this.onMouseMove = this._mousemoveForNormal;
		//this.onMouseMove = this._mousemoveForFixed;
		//this._self.ondragstart = function(ev){return false;};
		//this._self.onselectstart = function(ev){return false;};
		this._modalPanel = new ModalPanel();
		this._modalPanel.create(this);
		this._modalPanel.setVisible(false);
		/*
		var rect = this.getViewPort();
		//window.alert(rect.x + "," + rect.y + "," + rect.w + "," + rect.h);
		this._testFixDiv = this._createElement2(this._self, "div", "", {
			"position"       : "absolute",
			"border"         : "10px",
			"left"           : (rect.x - 10) + "px",
			"top"            : (rect.y - 10) + "px",
			"width"          : (rect.w + 20) + "px",
			"height"         : (rect.h + 20) + "px",
			"backgroundColor": "#DDDDDD",
			"zIndex"         : "200"  // + runtime.getNextZIndex()
		});
		var _this = this;
		var d = this._createElement2(this._testFixDiv, "div", "", {
			"width"          : "100%",
			"height"         : "100px",
			"backgroundColor": "#AAAAAA",
			"onmousedown"    : function(ev){return _this._mousemoveForFixed(ev || runtime.getWindow().event);}
		});
		this.onMouseDown = this._mousemoveForFixed;
		*/
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		//在这里绑定工作区所有可能用到的事件
		//……
		/*
		runtime.addEventListener(this._self, "resize", function(ev){
			window.alert();
		});
		*/
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activeDialog = null;
		this._activePopup = null;
		this._tipMouse = null;
		this._captureComponent = null;
		if(this._modalPanel){
			this._modalPanel.dispose();
			this._modalPanel = null;  //模态对话框用的模态面板
		}
		this._testFixDiv = null;
		//this._self.onselectstart = null;
		//this._self.ondragstart = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setStyleProperty = function(name, value){
		if(this._self.tagName == "BODY" && (name == "width" || name == "height")){
			return;  //忽略对 style 属性 width,height 的设置
		}
		_super.setStyleProperty.apply(this, arguments);
	};
	this.resize = function(w, h){
		if(!this._inited) return;  //[TODO]
		_super.resize.call(this, w, h);
		if(this._modalPanel && this._modalPanel.getVisible()){
			this._modalPanel.resize(w, h);  //调整模态面板的大小
		}
	};
	this.getModalPanel = function(){
		return this._modalPanel;
	};
	this.setActiveDialog = function(v){
		this._activeDialog = v;
	};
	this.setActivePopup = function(v){
		if(this._activePopup === v) return;
		if(this._activePopup){
			//[TODO]还原蒙板
			runtime.dom.removeClass(this._activePopup.getOwner(), "active");
			this._activePopup.setVisible(false);
			//this._activePopup.setZIndex(1);
		}
		if(v){
			v.setZIndex(10);
			runtime.dom.addClass(v.getOwner(), "active");
			v.setVisible(true);
		}
		this._activePopup = v;
	};
	this.setCaptureComponent = function(v){
		this._captureComponent = v;
	};
	this.eventHandle = function(ev){
		var ret;
		var type = {
			"keydown"  : "KeyDown",
			"keypress" : "KeyPress",
			"keyup"    : "KeyUp",
			"mousedown": "MouseDown",
			"mousemove": "MouseMove",
			"mouseup"  : "MouseUp"
		};
		var evtype = "on" + type[ev.type];
		if(this._captureComponent && this._captureComponent[evtype]){
			this.onMouseMove(ev);
			return this._captureComponent[evtype](ev);
		}
		if(typeof this[evtype] == "function"){
			ret = this[evtype](ev);
		}
		return ret;
	};
	this.onKeyUp = function(ev){
		var ret;
		if(this._activeDialog && this._activeDialog.onKeyUp){
			ret = this._activeDialog.onKeyUp(ev);
		}
		return ret;
	};
	this.onMouseDown = function(ev){
		if(this._activePopup){
			switch(this._activePopup._className){
			case "alz.mui.Popup":
			case "alz.mui.PopupMenu":
				var target = ev.target || ev.srcElement;
				if(this._activePopup._self == target || this._activePopup._self.contains(target)){
					//交给组件自己处理
				}else if(this._activePopup.getVisible()){
					this.setActivePopup(null);
				}
				if(ev.stopPropagation){
					ev.stopPropagation();
				}else{
					ev.cancelBubble = true;
				}
				return false;
			case "alz.mui.Dialog":
				break;
			}
		}
	};
	this.onMouseMove = null;
	this.onMouseUp = function(ev){
	};
	/*
	 * 偏移量的修正依赖于 getPos 方法的正确性，如果本身计算就不正确，修正结果也将不对
	 * [TODO]在第一次onMouseMove事件中执行修正偏移量的计算
	 */
	/*
	this._mousemoveForFixed = function(ev){
		var obj = runtime._testDiv;
		var pos = this._dom.getPos(obj, this._self);
		if(this._fixed == null){
			//window.alert((pos.x + ev.offsetX) + "," + (pos.y + ev.offsetY) + "|" + ev.clientX + "," + ev.clientY);
			this._offsetX = ev.offsetX;
			this._offsetY = ev.offsetY;
			this._fixedOff = {"x": pos.x + ev.offsetX, "y": pos.y + ev.offsetY};
			this._fixed = "fixing";
			//this.onMouseMove(ev);
			var rect = this.getViewPort();
			var x = rect.x + Math.min(rect.w - this._paddingLeft, Math.max(0, ev.clientX - this._borderLeftWidth)) - this._fixedX - this._offsetX - this._paddingLeft;
			var y = rect.y + Math.min(rect.h - this._paddingTop, Math.max(0, ev.clientY - this._borderTopWidth)) - this._fixedY - this._offsetY - this._paddingTop;
			obj.style.left = (-2000 + x) + "px";
			obj.style.top = (-2000 + y) + "px";
			this._mousemoveForFixed(ev);
		}else if(this._fixed == "fixing"){
			//this._fixedOff = {"x": ev.clientX, "y": ev.clientY};
			this._fixedX = pos.x + ev.offsetX - this._fixedOff.x;
			this._fixedY = pos.y + ev.offsetY - this._fixedOff.y;
			//window.alert("&&&&" + this._fixedX + "," + this._fixedY);
			this._fixed = "fixed";
			this.onMouseMove = this._mousemoveForNormal;  //转换成正常的事件
		}else{  //fixed
			ev.cancelBubble = true;
		}
	};
	*/
	this._mousemoveForFixed = function(dlg, ev){
		var obj = ev.srcElement;
		var pos = dlg._dom.getPos(obj, this._self);
		if(this._fixed == null){
			//window.alert((pos.x + ev.offsetX) + "," + (pos.y + ev.offsetY) + "|" + ev.clientX + "," + ev.clientY);
			this._fixedOff = {
				"pos_x"     : pos.x,
				"pos_y"     : pos.y,
				"o"         : ev.srcElement,
				"ev_offsetX": ev.offsetX,
				"ev_offsetY": ev.offsetY,
				"x"         : pos.x + ev.offsetX,
				"y"         : pos.y + ev.offsetY
			};
			this._fixed = "fixing";
			dlg.onMouseMove(ev);
		}else if(this._fixed == "fixing"){
			if(ev.srcElement != this._fixedOff.o || ev.offsetX != this._fixedOff.ev_offsetX || ev.offsetY != this._fixedOff.ev_offsetY){
				console.warn("[Workspace::_mousemoveForFixed]fixing unexpect");
			}
			this._fixedX = pos.x - this._fixedOff.pos_x;  //pos.x + ev.offsetX - (this._fixedOff.pos_x + this._fixedOff.ev_offsetX)
			this._fixedY = pos.y - this._fixedOff.pos_y;  //pos.y + ev.offsetY - (this._fixedOff.pos_y + this._fixedOff.ev_offsetY)
			//window.document.title = this._fixedX + "," + this._fixedY + "|" + dlg._borderLeftWidth + "," + dlg._borderTopWidth;
			this._fixed = "fixed";
			dlg.onMouseMove(ev);
			this._mousemoveForFixed = null;
		}
	};
	this._mousemoveForNormal = function(ev){
		if(runtime._debug){  //如果调试状态的话，更新 MouseEvent 的信息
			if(!this._tipMouse){
				this._tipMouse = this._createElement2(this._self, !runtime.ns ? "div" : "textarea", "", {  //NS 有性能问题，改用 textarea
					"position"       : "absolute",
					"border"         : "1px solid #AAAAAA",
					"font"           : "12px 宋体",
					"zIndex"         : "1000"/*,
					"backgroundColor": "buttonface",
					"filter"         : "Alpha(Opacity=90)"*/
				});
				if(runtime.ns){
					this._tipMouse.readOnly = true;
					this._tipMouse.style.width = "150px";
					this._tipMouse.style.height = "300px";
				}
			}
			var o = {
				/*
				"type":1,
				"target":1,
				"reason":1,
				"cancelBubble":1,
				"returnValue":1,
				"srcFilter":1,
				"fromElement":1,
				"toElement":1,
				*/
				//mouse event
				"button":1,
				"screenX":1,
				"screenY":1,
				"clientX":1,
				"clientY":1,
				"offsetX":1,
				"offsetY":1,
				"x":1,
				"y":1/*,
				//key event
				"altKey":1,
				"ctrlKey":1,
				"shiftKey":1,
				"keyCode":1
				*/
			};
			//var a = this.forIn(ev);
			var a = [];
			for(var k in o) a.push(k + "=" + ev[k]);
			var off = {"x": 0, "y": 0};
			for(var el = ev.srcElement; el; el = el.offsetParent){
				off.x += el.offsetLeft + parseInt0(el.currentStyle.borderLeftWidth);
				off.y += el.offsetTop + parseInt0(el.currentStyle.borderTopWidth);
				a.push("off(x=" + el.offsetLeft + ",y=" + el.offsetTop + "),border(blw=" + parseInt0(el.currentStyle.borderLeftWidth) + ",btw=" + parseInt0(el.currentStyle.borderTopWidth) + ")");
			}
			a.push("OFF(x=" + off.x + ",y=" + off.y + "),OFF+offset(x=" + (off.x + ev.offsetX) + ",y=" + (off.y + ev.offsetY) + ")");
			this._tipMouse.style.left = (ev.clientX - this._borderLeftWidth + 4) + "px";
			this._tipMouse.style.top = (ev.clientY - this._borderTopWidth + 4) + "px";
			if(runtime.ns){
				this._tipMouse.value = a.join("\n");
			}else{
				this._tipMouse.innerHTML = a.join("<br />");
			}
		}
		if(this._activePopup){
			var target = ev.target || ev.srcElement;
			var bar = this._activePopup.getOwner().parentNode;
			if(bar.className == "ui-menubar" && bar.contains(target)){
				var item = this.getMenuItem(bar, target);
				if(item && item._ptr){
					bar._ptr.activeItem(item._ptr);
				}
			}
		}
	};
	this.getMenuItem = function(bar, obj){
		var el = obj;
		for(; el && el.parentNode != bar; el = el.parentNode){
		}
		return el;
	};
});