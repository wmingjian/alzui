/*
 * alzui-mini JavaScript Framework, v0.0.4
 * Copyright (c) 2009 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
(function(){with(runtime.createContext("ui", "core")){

//_import("AObject,core.EventTarget");
//_export("Component,ModalPanel,Container,Panel,Pane,Workspace,DropDown,Popup,ListItem,Dialog,TabPage,MailList");

var _tmpl = {
	"dialog": "<div html=\"true\" aui=\"{align:'top',height:18;}\" style=\"width:100%;height:18px;background-color:activecaption;border:0px;padding:0px;\">"
		+ "<label style=\"position:absolute;height:14px;background-color:gray;left:4px;top:4px;font:bold 12px 宋体;line-height:100%;color:white;text-align:left;cursor:default;padding-top:2px;\">{$caption}</label>"
		+ "<img style=\"position:absolute;width:16px;height:14px;top:4px;right:4px;vertical-align:middle;background-color:buttonface;\" src=\"{$pathAui}lib/src/AWindow_closeup.gif\" />"
		+ "</div>"
		+ "<div id=\"dlgBody\" aui=\"{align:'client'}\" style=\"position:absolute;top:21px;width:100%;height:300px;background-color:#666666;border:0px;padding:0px;\"></div>"
};

/*#file begin=alz.mui.ToggleGroup.js*/
_package("alz.mui");

_class("ToggleGroup", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._buttons = [];
		this._activeButton = null;
	};
	this.append = function(btn){
		this._buttons.push(btn);
	};
	this.toggle = function(btn){
		if(this._activeButton){
			this._activeButton.setToggled(false);
		}
		btn.setToggled(true);
		this._activeButton = btn;
	};
});
/*#file end*/
/*#file begin=alz.mui.ToggleManager.js*/
_package("alz.mui");

_import("alz.mui.ToggleGroup");

_class("ToggleManager", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._groups = {};
	};
	this.add = function(btn){
		var groupid = btn._groupid;
		if(!this._groups[groupid])
			this._groups[groupid] = new ToggleGroup();
		this._groups[groupid].append(btn);
	};
	this.toggle = function(btn){
		this._groups[btn._groupid].toggle(btn);
	};
});
/*#file end*/
/*#file begin=alz.mui.ActionManager.js*/
_package("alz.mui");

_class("ActionManager", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._actionEngine = null;  //动作执行引擎，实现了doAction接口的类的实例
		this._actions = {};
	};
	this.init = function(actionEngine){
		this._actionEngine = actionEngine;
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var k in this._actions){
			for(var i = 0, len = this._actions[k].length; i < len; i++){
				this._actions[k][i] = null;  //再此无需调用 dispose 方法
			}
			delete this._actions[k];
		}
		this._actionEngine = null;
		_super.dispose.apply(this);
	};
	this.add = function(component){
		//var act = component._self.getAttribute("_action");
		var act = component.getAction();
		if(!this._actions[act])
			this._actions[act] = [];
		this._actions[act].push(component);
	};
	/*this.enable = function(action){
		var nodes = this._actions[action];
		if(!nodes) return;
		for(var i = 0, len = nodes.length; i < len; i++){
			nodes[i].setDisabled(false);
		}
		nodes = null;
	};*/
	this.enable = function(action){this.updateState(action, {"disabled":false});};
	this.disable = function(action){this.updateState(action, {"disabled":true});};
	this.updateState = function(action, state){
		if(action){
			this.update(action, state);
		}else{
			for(var k in this._actions){
				this.update(k, state);
			}
		}
	};
	this.multipleUpdateState = function(actions){
		for(var k in actions){
			this.update(k, actions[k]);
		}
	};
	this.update = function(action, state){
		var nodes = this._actions[action];
		if(!nodes) return;
		for(var i = 0, len = nodes.length; i < len; i++){
			for(var k in state){  //visible,disabled
				var name = "set" + k.charAt(0).toUpperCase() + k.substr(1);
				if(name in nodes[i]) nodes[i][name](state[k]);
			}
		}
		nodes = null;
	};
	this.dispatchAction = function(action, sender){
		if(this._actionEngine.doAction)
			return this._actionEngine.doAction(action, sender);
	};
});
/*#file end*/
/*#file begin=alz.mui.Component.js*/
_package("alz.mui");

_import("alz.core.EventTarget");

/**
 * UI组件应该实现BoxElement的接口
 */
_class("Component", EventTarget, function(_super){
	this._init = function(){
		_super._init.call(this);
		//runtime._components.push(this);
		this._tag = "Component";
		this._domCreate = false;
		this._domBuildType = 0;  //0=create,1=bind
		this._win = runtime.getWindow();
		this._doc = runtime.getDocument();  //this._win.document
		this._dom = runtime.getDom();
		//this._parent = null;
		this._owner = null;
		//this._id = null;
		this._self = null;  //组件所关联的DOM元素
		this._jsonData = null;
		this._data = null;  //结点的json数据
		this._currentPropertys = {};
		this._left = 0;
		this._top = 0;
		this._width = 0;
		this._height = 0;
		this._align = "none";
		this._dockRect = {x: 0, y: 0, w: 0, h: 0};  //停靠以后组件的位置信息
		this._borderLeftWidth = 0;
		this._borderTopWidth = 0;
		this._borderRightWidth = 0;
		this._borderBottomWidth = 0;
		this._paddingLeft = 0;
		this._paddingTop = 0;
		this._paddingRight = 0;
		this._paddingBottom = 0;
		//this._visible = false;
		this._visible = null;  //boolean
		this._zIndex = 0;
		this._opacity = 0;
		this._position = "";  //"relative"
		this._modal = false;
		this._ee = {};
		this._cssName = "";
		this._xpath = "";
		this._state = "normal";
		this._cursors = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
	};
	this.toString = function(){
		return "{tag:'" + this._className + "',align:'" + this._align + "'}";
	};
	this._create = function(tag){
		return this._doc.createElement(tag);
	};
	this.parseInt = function(v){
		return this._dom.parseInt(v);
	};
	this.getPropertyValue = function(style, name){
		return this._dom.getPropertyValue(style, name);
	};
	/**
	 * 调用该方法初始化的组件的所有属性从DOM元素中动态获取
	 * 设计该方法的思想和 init 方法完全相反，init方法从脚本组件角度考虑问题，bind
	 * 方法从 DOM 元素角度考虑问题。
	 */
	//this.build = function(data){};
	this.bind = function(obj){
		/*
		var props = "color,"
			+ "cursor,"
			+ "display,"
			+ "visibility,"
			+ "opacity,"
			+ "overflow,"
			+ "position,"
			+ "zIndex,"
			+ "left,top,bottom,right,width,height,"
			+ "marginBottom,marginLeft,marginRight,marginTop,"
			+ "borderTopColor,borderTopStyle,borderTopWidth,"
			+ "borderRightColor,borderRightStyle,borderRightWidth,"
			+ "borderBottomColor,borderBottomStyle,borderBottomWidth,"
			+ "borderLeftColor,borderLeftStyle,borderLeftWidth,"
			+ "paddingBottom,paddingLeft,paddingRight,paddingTop,"
			+ "backgroundAttachment,backgroundColor,backgroundImage,backgroundPosition,backgroundRepeat";
		*/
		/*
		margin,border,padding
		borderTop,borderRight,borderBottom,borderLeft,
		borderColor,borderSpacing,borderStyle,borderWidth
		fontFamily,fontSize,fontSizeAdjust,fontStretch,fontStyle,fontVariant,fontWeight
		direction
		overflowX,overflowY
		textAlign,textDecoration,textIndent,textShadow,textTransform
		lineHeight,
		verticalAlign
		*/
		var style = this._dom.getStyle(obj);
		/*
		var arr = props.split(",");
		for(var i = 0, len = arr.length; i < len; i++){
			this._currentPropertys[arr[i]] = this.getPropertyValue(style, arr[i]);
		}
		*/
		this._position = this.getPropertyValue(style, "position");
		this._visible = this.getPropertyValue(style, "display") != "none";
		this._left = this.parseInt(this.getPropertyValue(style, "left")) || obj.offsetLeft;
		this._top = this.parseInt(this.getPropertyValue(style, "top")) || obj.offsetTop;
		this._width = this.parseInt(this.getPropertyValue(style, "width")) || obj.offsetWidth;
		this._height = this.parseInt(this.getPropertyValue(style, "height")) || obj.offsetHeight;

		//if(this._className == "DlgPageTool") window.alert("123");
		var props = {
			"marginTop":0,
			"marginRight":0,
			"marginBottom":0,
			"marginLeft":0,
			"borderTopWidth":1,
			"borderRightWidth":1,
			"borderBottomWidth":1,
			"borderLeftWidth":1,
			"paddingTop":1,
			"paddingRight":1,
			"paddingBottom":1,
			"paddingLeft":1
		}
		for(var k in props){
			if(props[k] == 1)
				this["_" + k] = this.parseInt(this.getPropertyValue(style, k) || obj.style[k]);
		}
		if(this._jsonData){  //_jsonData 优先级最高
			for(var k in this._jsonData){
				if(this._jsonData[k])
					this["_" + k] = this._jsonData[k];
			}
			if(this._align != "none"){
				this._position = "absolute";
				this._dockRect = {
					x: this._left,
					y: this._top,
					w: this._width,
					h: this._height
				};
			}
		}
		this.__init(obj, 1);
	};
	//this.create = function(parent){
	//	this._parent = parent;
	//};
	this.create = function(parent){
		var obj = this._create(this._tagName || "div");
		//obj.style.border = "1px solid #000000";
		if(parent) this.setParent(parent, obj);
		this.init(obj);
		return obj;
	};
	this.__init = function(obj, domBuildType){
		if(this._parent && this._parent.add)  //容器类实例有该方法
			this._parent.add(this);
		this._domBuildType = domBuildType;
		obj._ptr = this;
		this._self = obj;
		//this._self._ptr = this;
		//this._id = "__dlg__" + Math.round(10000 * Math.random());
		//this._self.id = this._id;
		if(this._position) this._self.style.position = this._position;
	};
	this.init = function(obj){
		//_super.init.apply(this, arguments);
		this.__init(obj, 0);
		//runtime.actionManager.add(this);
		//this.setVisible(this._visible);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._data = null;
		this._jsonData = null;
		if(this._self){
			if(this._self._ptr)
				this._self._ptr = null;
			if(this._self.tagName != "BODY" && this._self.parentNode){  // && this._domBuildType == 0)
				var o = this._self.parentNode.removeChild(this._self);
				delete o;
				if(runtime.ie){
					this._self.outerHTML = "";
				}
			}
			this._self = null;
		}
		this._owner = null;
		//this._parent = null;
		this._dom = null;
		this._doc = null;
		this._win = null;
		_super.dispose.apply(this);
	};
	this.getElement = function(){
		return this._self;
	};
	this.getData = function(){
		return this._data;
	};
	this.setJsonData = function(v){
		this._jsonData = v;
	};
	this.setParent = function(v, obj){
		if(!v) v = runtime._workspace;  //obj.parentNode
		//this._parent = v;
		_super.setParent.apply(this, arguments);
		var parent = v._self ? v : (v._ptr ? v._ptr : null);
		if(!parent) throw "找不到父组件的 DOM 元素";
		if(!obj.parentNode)
			parent._self.appendChild(obj);
	};
	this.setOwner = function(v){
		this._owner = v;
	};
	this.setStyleProperty = function(name, value){
		try{
		if(this._self)
			this._self.style[name] = value;
		}catch(ex){
			alert(ex.description + "\n" + name + "=" + value);
		}
	};
	this.getAlign = function(){
		return this._align;
	};
	this.getLeft = function(){
		return this._left;
	};
	this.setLeft = function(v){
		this._left = v;
		//v += this._paddingLeft;
		this.setStyleProperty("left", v + "px");
		if(this._myLayer)
			this._myLayer.style.left = v + "px";
	};
	this.getTop = function(){
		return this._top;
	};
	this.setTop = function(v){
		this._top = v;
		//v += this._paddingTop;
		this.setStyleProperty("top", v + "px");
		if(this._myLayer)
			this._myLayer.style.top = v + "px";
	};
	this.getInnerWidth = function(v){
		if(!v) v = this._width;
		return Math.max(0, v - this._borderLeftWidth - this._borderRightWidth - this._paddingLeft - this._paddingRight);
		//return Math.max(0, runtime.getBoxModel() == 0 ? v : v - this._borderLeftWidth - this._borderRightWidth - this._paddingLeft - this._paddingRight);
	};
	this.getInnerHeight = function(v){
		if(!v) v = this._height;
		return Math.max(0, v - this._borderTopWidth - this._borderBottomWidth - this._paddingTop - this._paddingBottom);
		//return Math.max(0, runtime.getBoxModel() == 0 ? v : v - this._borderTopWidth - this._borderBottomWidth - this._paddingTop - this._paddingBottom);
	};
	this.getWidth = function(){
		return this._width;
	};
	this.setWidth = function(v){
		v = Math.max(v, 0);
		this._width = v;
		if(this._dockRect.w == 0) this._dockRect.w = v;
		var w = this.getInnerWidth(v);
		this._setWidth(w);
	};
	this.getHeight = function(){
		return this._height;
	};
	this.setHeight = function(v){
		v = Math.max(v, 0);
		this._height = v;
		if(this._dockRect.h == 0) this._dockRect.h = v;
		var h = this.getInnerHeight(v);
		this._setHeight(h);
	};
	this._setWidth = function(v){
		v = Math.max(v, 0);
		this.setStyleProperty("width", v + "px");
		if(this._myLayer)
			this._myLayer.style.width = v + "px";
	};
	this._setHeight = function(v){
		v = Math.max(v, 0);
		this.setStyleProperty("height", v + "px");
		if(this._myLayer)
			this._myLayer.style.height = v + "px";
	};
	this.setBgColor = function(v){
		this.setStyleProperty("backgroundColor", v);
	};
	this.getVisible = function(){
		return this._visible;
	};
	this.setVisible = function(v){
		if(v == this._visible) return;
		this._visible = v;
		if(v){
			this.setStyleProperty("visibility", "visible");
			this.setStyleProperty("display",
				",A,B,I,U,SPAN,INPUT,BUTTON,".indexOf(this._self.tagName) != -1
				? "" 
				: "block");
		}else{
			this.setStyleProperty("visibility", "hidden");
			this.setStyleProperty("display", "none");
		}
	};
	this.getZIndex = function(){
		return this._zIndex;
	};
	this.setZIndex = function(zIndex){
		this._zIndex = zIndex;
		this.setStyleProperty("zIndex", zIndex);
	};
	this.getOpacity = function(){
		return this._opacity;
	};
	this.setOpacity = function(v){
		if(this._opacity != v){
			v = Math.max(0, Math.min(1, v));
			this._opacity = v;
			if(runtime.ie){
				v = Math.round(v * 100);
				this.setStyleProperty("filter", v == 100 ? "" : "Alpha(Opacity=" + v + ")");
			}else if(runtime.moz){
				this.setStyleProperty("MozOpacity", v == 1 ? "" : v);
			}else if(runtime.opera || runtime.safari || runtime.chrome){
				this.setStyleProperty("opacity", v == 1 ? "" : v);
			}
		}
	};
	this.getCapture = function(){
		return this._capture;
	};
	this.setCapture = function(bCapture){  //设置为事件焦点组件
		this._capture = bCapture;
		runtime._workspace.setCaptureComponent(bCapture ? this : null);
		//this.getContext().getGuiManager().setCaptureComponent(bCapture ? this : null);
	};
	this.resize = function(w, h){
		if(!h) h = this.getHeight();
		if(!w) w = this.getWidth();
		w = Math.max(0, w);
		h = Math.max(0, h);
		if(w == 0 || h == 0){
			this.setStyleProperty("display", "none");
		}else{
			if(this._self.style.display == "none")
				this.setStyleProperty("display", "block");
			this.setWidth(w);
			this.setHeight(h);
			if(this._domCreate)
				this._dom.resize(this._self);
		}
	};
	/*this.resizeTo = function(w, h){
		if(this._self){
			this._self.style.width = Math.max(w, 0) + "px";
			this._self.style.height = Math.max(h, 0) + "px";
		}
	};*/
	this.getViewPort = function(){
		return {
			x: this._self.scrollLeft,
			y: this._self.scrollTop,
			w: this._self.clientWidth,  //Math.max(this._self.clientWidth || this._self.scrollWidth)
			h: Math.max(this._self.clientHeight, this._self.parentNode.clientHeight)  //Math.max(this._self.clientHeight || this._self.scrollHeight)
		};
	};
	this.moveTo = function(x, y){
		this.setLeft(x);
		this.setTop(y);
	};
	this.moveToCenter = function(){
		var rect = this._parent.getViewPort
			? this._parent.getViewPort()
			: runtime._workspace.getViewPort();
		var dw = "getWidth"  in this ? this.getWidth()  : this._self.offsetWidth;
		var dh = "getHeight" in this ? this.getHeight() : this._self.offsetHeight;
		this.moveTo(
			rect.x + Math.round((rect.w - dw) / 2),
			rect.y + Math.round((rect.h - dh) / 2)
		);
	};
	this.getPosition = function(ev, type){
		var pos = type == 1 ? {x: ev.offsetX, y: ev.offsetY} : {x: 0, y: 0};
		var refElement = runtime._workspace._self;
		var obj = ev.srcElement || ev.target;
		while(obj && obj != refElement){
			pos.x += obj.offsetLeft;
			pos.y += obj.offsetTop;
			obj = obj.offsetParent;
		}
		return pos;
	};
	this.showModal = function(v){
		var panel = this._parent && this._parent.getModalPanel
			? this._parent.getModalPanel()
			: runtime.getModalPanel();
		if(v){
			panel.pushTarget(this);
			this.setZIndex(runtime.getNextZIndex());
			//this._self.onclick = function(){this._ptr.showModal(false);};
		}else{
			panel.popTarget();
		}
		this._modal = v;
		panel.setVisible(v);
		this.setVisible(v);
		if(v){
			try{
				this._self.focus();  //设定焦点
			}catch(ex){
			}
		}
		panel = null;
	};
	this.setElementRect = function(obj, x, y, w, h, bg){
		obj.style.left   = x + "px";
		obj.style.top    = y + "px";
		obj.style.width  = w + "px";
		obj.style.height = h + "px";
	};
	this.setState = function(v){
		if(v == this._state) return;
		this._state = v;
		//runtime.dom.applyCssStyle1(this, this._xpath, v);
		runtime.dom.applyCssStyle(this, this._cssData, v);
	};
	function cssKeyToJsKey(str){
		return str.replace(/-([a-z])/g, function(_0, _1){
			return _1.toUpperCase();
		});
	}
	this.applyCssStyle = function(element, css, className){
		var style = css[(element.className == "error" ? "error-" : "") + className];
		for(var k in style){
			if(k.charAt(0) == "_"){
				var obj = element.getElementsByTagName(k.substr(1))[0];
				for(var key in style[k]){
					var name = cssKeyToJsKey(key);
					if(obj.style[name] != style[k][key])
						obj.style[name] = style[k][key];
				}
				obj = null;
			}else{
				var name = cssKeyToJsKey(k);
				if(element.style[name] != style[k])
					element.style[name] = style[k];
			}
		}
	};
	/**
	 * 通过判断是否绑定有 js 组件对象来确定UI组件
	 */
	this.getControl = function(el){
		while(!el._ptr){
			el = el.parentNode;
			if(!el || el.tagName == "BODY" || el.tagName == "HTML")
				return null;
		}
		return el._ptr;
	};
});
/*#file end*/
/*#file begin=alz.mui.BitButton.js*/
_package("alz.mui");

_import("alz.mui.Component");

_class("BitButton", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._icon = "";
		this._disabled = false;
		this._app = null;
	};
	this.init = function(obj, app){
		this._app = app;
		_super.init.apply(this, arguments);
		this._label = this._self.childNodes[1];
		this.setDisabled(this._self.getAttribute("_disabled") == "true");
		this._icon = this._self.getAttribute("_icon") || "";
		if(this._icon != ""){
			this._self.style.background = "url(" + this._self.getAttribute("_icon") + ") 2px 2px no-repeat";
		}
		this._tip = this._self.getAttribute("_tip") || "";
		if(this._tip != "")
			this._self.title = this._tip;
		this.addEventListener1("mouseevent", {
			mouseover: function(ev){
				this._self.style.borderLeft = "1px solid buttonhighlight";
				this._self.style.borderTop = "1px solid buttonhighlight";
				this._self.style.borderRight = "1px solid buttonshadow";
				this._self.style.borderBottom = "1px solid buttonshadow";
			},
			mouseout: function(ev){
				var target = ev.target || ev.toElement;
				if(!this._dom.contains(this._self, target)){
					this._self.style.border = "1px solid buttonface";
				}
			},
			mousedown: function(ev){
				this._self.style.borderLeft = "1px solid buttonshadow";
				this._self.style.borderTop = "1px solid buttonshadow";
				this._self.style.borderRight = "1px solid buttonhighlight";
				this._self.style.borderBottom = "1px solid buttonhighlight";
				var sender = ev.target || ev.srcElement;
				this._app.doAction(sender.getAttribute("_action"), sender);
			},
			mouseup: function(ev){
				this._self.style.borderLeft = "1px solid buttonhighlight";
				this._self.style.borderTop = "1px solid buttonhighlight";
				this._self.style.borderRight = "1px solid buttonshadow";
				this._self.style.borderBottom = "1px solid buttonshadow";
			}/*,
			click: function(ev){
				var sender = ev.target || ev.srcElement;
				this._app.doAction(sender.getAttribute("_action"), sender);
			}*/
		});
	};
	this.dispose = function(){
		this._app = null;
		this._label = null;
		_super.dispose.apply(this);
	};
	this.setDisabled = function(v){
		if(this._disabled == v) return;
		this._disabled = v;
		this.setEnableEvent(!v);
		if(v){
			this._self.style.filter = "gray";
			this._label.disabled = true;
		}else{
			this._self.style.filter = "";
			this._label.disabled = false;
		}
	};
});
/*#file end*/
/*#file begin=alz.mui.ToggleButton.js*/
_package("alz.mui");

_import("alz.mui.BitButton");

_class("ToggleButton", BitButton, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._groupid = "";
		this._toggled = false;
	};
	this.init = function(obj, app){
		_super.init.apply(this, arguments);
		this._groupid = this._self.getAttribute("_groupid");
		if(!this._groupid) throw "ToggleButton 组件缺少 _groupid 属性";
		runtime.toggleMgr.add(this);
		this.removeEventListener1("mouseevent");  //[TODO]
		this.addEventListener1("mouseevent", {
			mouseover: function(ev){
				if(this._toggled) return;
				this._self.style.borderLeft = "1px solid buttonhighlight";
				this._self.style.borderTop = "1px solid buttonhighlight";
				this._self.style.borderRight = "1px solid buttonshadow";
				this._self.style.borderBottom = "1px solid buttonshadow";
			},
			mouseout: function(ev){
				if(this._toggled) return;
				var target = ev.target || ev.toElement;
				if(!this._dom.contains(this._self, target)){
					this._self.style.border = "1px solid buttonface";
				}
			},
			click: function(ev){
				runtime.toggleMgr.toggle(this);
			}
		});
		if(this._self.getAttribute("_toggled") == "true"){
			runtime.toggleMgr.toggle(this);
		}
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.setToggled = function(v){
		if(this._toggled == v) return;
		this._toggled = v;
		if(v){
			this._self.style.borderLeft = "1px solid buttonshadow";
			this._self.style.borderTop = "1px solid buttonshadow";
			this._self.style.borderRight = "1px solid buttonhighlight";
			this._self.style.borderBottom = "1px solid buttonhighlight";
			this._app.doAction(this._self.getAttribute("_action"));
		}else{
			this._self.style.border = "1px solid buttonface";
		}
	};
});
/*#file end*/
/*#file begin=alz.mui.ToolBar.js*/
_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.BitButton");
_import("alz.mui.ToggleButton");

_class("ToolBar", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._buttons = [];
	};
	this.init = function(obj, app){
		this._app = app;
		//_super.init.apply(this, arguments);
		//var nodes = this._self.childNodes;
		var nodes = obj.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			if(nodes[i].nodeType != 1) continue;
			var btn;
			switch(nodes[i].className){
			case "wui-BitButton"   : btn = new BitButton();break;
			case "wui-ToggleButton": btn = new ToggleButton();break;
			}
			if(btn){
				btn.init(nodes[i], this._app);
				this._buttons.push(btn);
			}
			btn = null;
		}
		nodes = null;
	};
	this.dispose = function(){
		for(var i = 0, len = this._buttons.length; i < len; i++){
			this._buttons[i].dispose();
			this._buttons[i] = null;
		}
		this._buttons = [];
		this._app = null;
		_super.dispose.apply(this);
	};
});
/*#file end*/
/*#file begin=alz.mui.ModalPanel.js*/
_package("alz.mui");

_import("alz.mui.Component");

_class("ModalPanel", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._targetList = [];
		this._activeTarget = null;
		this._iframe = null;  //用来遮挡SELECT等DIV遮挡不住的组件
		this._panel = null;   //再用这个DIV遮挡在IFRAME上面
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._self.className = "wui-ModalPanel";
		this.moveTo(0, 0);
		this.setOpacity(0.2);
		if(runtime.ie){
			this._iframe = this._doc.createElement("iframe");
			this._iframe.setAttribute("scrolling", "no");
			this._iframe.setAttribute("frameBorder", "0");
			this._iframe.setAttribute("frameSpacing", "0");
			//this._iframe.setAttribute("allowTransparency", "true");
			this._iframe.style.display = "none";
			this._iframe.style.width = "100%";
			this._iframe.style.height = "100%";
			this._iframe.src = "about:blank";
			this._self.appendChild(this._iframe);
		}
		this._panel = this._doc.createElement("div");
		this._panel.style.display = "none";
		this._panel.style.position = "absolute";
		this._panel.style.left = "0px";
		this._panel.style.top = "0px";
		this._self.appendChild(this._panel);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._panel = null;
		this._iframe = null;
		this._activeTarget = null;
		for(var i = 0, len = this._targetList.length; i < len; i++){
			this._targetList[i] = null;
		}
		this._targetList = [];
		_super.dispose.apply(this);
	};
	this.setVisible = function(v){
		_super.setVisible.apply(this, arguments);
		if(this._iframe)
			this._iframe.style.display = v ? "" : "none";
		this._panel.style.display = v ? "" : "none";
		if(this._visible){  //如果面板已经显示
			//this.getActiveTarget().setVisible(false);
		}else{
		}
	};
	this.resize = function(w, h){
		_super.resize.apply(this, arguments);
		this._panel.style.width = w + "px";
		this._panel.style.height = h + "px";
	};
	this.pushTarget = function(v){
		this._activeTarget = v;
		this._targetList.push(v);
		var rect = runtime._workspace.getViewPort();
		this.resize(rect.w, rect.h);
		//var screen = runtime.getBody();
		/* 是否需要移动呢？
		var rect = this._parent.getViewPort();
		this.moveTo(rect.x, rect.y);
		*/
		//this.resize(screen.clientWidth, screen.clientHeight);
		//this.resize(
		//	Math.max(screen.scrollWidth, screen.clientWidth),
		//	Math.max(screen.scrollHeight, screen.clientHeight)
		//);
		//screen = null;
		this.setVisible(true);  //!!v
		this.setZIndex(runtime.getNextZIndex());
	};
	this.popTarget = function(v){
		this._targetList.pop();
		this._activeTarget = this._targetList[this._targetList.length - 1];
		if(this._targetList.length == 0){
			this.setVisible(false);
		}else{
			this.getActiveTarget().setZIndex(runtime.getNextZIndex());
		}
	};
	this.getActiveTarget = function(){
		return this._activeTarget;  //this._targetList[this._targetList.length - 1];
	};
});
/*#file end*/
/*#file begin=alz.mui.Container.js*/
_package("alz.mui");

_import("alz.mui.Component");

_class("Container", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._nodes = [];
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i].dispose();
			this._nodes[i] = null;
		}
		this._nodes = [];
		_super.dispose.apply(this);
	};
	this.resize = function(w, h){
		_super.resize.apply(this, arguments);
		this.updateDock();
	};
	this.add = function(component){
		this._nodes.push(component);
	};
	/**
	 * 会被 DockPanel 组件重载，以实现特殊的布局定义
	 */
	this.getDockRect = function(){
		return {
			x: 0,
			y: 0,
			w: this.getInnerWidth(),
			h: this.getInnerHeight()
		};
	};
	/**
	 * 按照停靠的优先顺序：1)上下；2)左右；3)居中，更新停靠组件的位置信息
	 */
	this.updateDock = function(){
		var rect = this.getDockRect();
		var nodes = this._nodes;
		//调整上停靠的组件
		for(var i = 0, len = nodes.length; i < len; i++){
			var obj = nodes[i];
			switch(obj.getAlign()){
			case "top":
				obj.moveTo(rect.x, rect.y);
				obj.resize(rect.w, obj._dockRect.h);
				rect.y += obj._dockRect.h;
				rect.h -= obj._dockRect.h;
				break;
			}
		}
		//调整下停靠的组件
		for(var i = nodes.length - 1; i >= 0; i--){
			var obj = nodes[i];
			switch(obj.getAlign()){
			case "bottom":
				obj.moveTo(rect.x, rect.y + rect.h - obj._dockRect.h);
				obj.resize(rect.w, obj._dockRect.h);
				rect.h -= obj._dockRect.h;
				break;
			}
		}
		//调整左停靠的组件
		for(var i = 0, len = nodes.length; i < len; i++){
			var obj = nodes[i];
			switch(obj.getAlign()){
			case "left":
				obj.moveTo(rect.x, rect.y);
				obj.resize(obj._dockRect.w, rect.h);  //"100%"
				rect.x += obj._dockRect.w;
				rect.w -= obj._dockRect.w;
				break;
			}
		}
		//调整右停靠的组件
		for(var i = nodes.length - 1; i >= 0; i--){
			var obj = nodes[i];
			switch(obj.getAlign()){
			case "right":
				obj.moveTo(rect.x + rect.w - obj._dockRect.w, rect.y);
				obj.resize(obj._dockRect.w, rect.h);  //"100%"
				rect.w -= obj._dockRect.w;
				break;
			}
		}
		//调整居中停靠的组件
		for(var i = 0, len = nodes.length; i < len; i++){
			var obj = nodes[i];
			switch(obj.getAlign()){
			case "client":
				//最后调整align == "client"的组件的大小
				obj.moveTo(rect.x, rect.y);
				obj.resize(rect.w, rect.h);
				break;
			}
		}
		nodes = null;
	};
});
/*#file end*/
/*#file begin=alz.mui.Panel.js*/
_package("alz.mui");

_import("alz.mui.Container");

_class("Panel", Container, function(_super){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
});
/*#file end*/
/*#file begin=alz.mui.Pane.js*/
_package("alz.mui");

_import("alz.mui.Container");

_class("Pane", Container, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._components = [];
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._components.length; i < len; i++){
			this._components[i].dispose();
			this._components[i] = null;
		}
		this._components = [];
		_super.dispose.apply(this);
	};
	/**
	 * 初始化组件中的 Action 动作组件
	 * 支持的 Action 动作组件有：
	 *   表单  ： FORM
	 *   超链接： A
	 *   按钮  ： INPUT(type=button)
	 *   复选框： INPUT(type=checkbox)
	 *   列表框： SELECT
	 */
	this.initComponents = function(element){
		var tags = ["form", "a", "select", "input"];
		for(var i = 0, len = tags.length; i < len; i++){
			var nodes = element.getElementsByTagName(tags[i]);
			for(var j = 0, len1 = nodes.length; j < len1; j++){
				var node = nodes[j];
				if(node.getAttribute("_action")){
					var component;
					switch(tags[i]){
					case "form"  : component = new FormElement();break;
					case "a"     : component = new LinkLabel();break;
					case "select": component = new ComboBox();break;
					case "input" :
						switch(node.type){
						case "button"  : component = new Button();break;
						case "checkbox": component = new CheckBox();break;
						default        : continue;
						}
						//application._buttons[btn._action] = btn;
						break;
					}
					component.init(node);
					//application._actionManager.add(component);
					this._components.push(component);
				}
				node = null;
			}
			nodes = null;
		}
	};
	/**
	 * Action 工作模型
	 * [TODO]
	 * 1)级联激发的 Action 动作只把最初的动作压入动作栈，这样能够保证正确的动作回
	 *   退机制。
	 */
	this.doAction = function(action){
	};
});
/*#file end*/
/*#file begin=alz.mui.Workspace.js*/
_package("alz.mui");

_import("alz.mui.Container");
_import("alz.mui.ModalPanel");

_class("Workspace", Container, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._fixedX = 0;
		this._fixedY = 0;
		this._fixedOff = null;
		this._fixed = null;
		this._testFixDiv = null;
		this._modalPanel = null;
		this._popup = null;
		this._captureComponent = null;
		this._tipMouse = null;
		this._activeDialog = null;
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
		//alert(rect.x + "," + rect.y + "," + rect.w + "," + rect.h);
		var div = this._create("div");
		div.style.position = "absolute";
		div.style.border = "10px";
		div.style.left = (rect.x - 10) + "px";
		div.style.top = (rect.y - 10) + "px";
		div.style.width = (rect.w + 20) + "px";
		div.style.height = (rect.h + 20) + "px";
		div.style.backgroundColor = "#DDDDDD";
		div.style.zIndex = "200";  // + runtime.getNextZIndex();
		var d = this._create("div");
		d.style.width = "100%";
		d.style.height = "100px";
		d.style.backgroundColor = "#AAAAAA";
		var _this = this;
		d.onmousedown = function(ev){return _this._mousemoveForFixed(ev || runtime.getWindow().event);};
		div.appendChild(d);
		this.onMouseDown = this._mousemoveForFixed;
		this._testFixDiv = this._self.appendChild(div);
		*/
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		//在这里绑定工作区所有可能用到的事件
		//……
		/*
		runtime.bindEventListener(this._self, "resize", function(ev){
			alert();
		});
		*/
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activeDialog = null;
		this._tipMouse = null;
		this._captureComponent = null;
		this._popup = null;
		if(this._modalPanel){
			this._modalPanel.dispose();
			this._modalPanel = null;  //模态对话框用的模态面板
		}
		this._testFixDiv = null;
		//this._self.onselectstart = null;
		//this._self.ondragstart = null;
		_super.dispose.apply(this);
	};
	this.setStyleProperty = function(name, value){
		if(this._self.tagName == "BODY" && (name == "width" || name == "height"))
			return;  //忽略对 style 属性 width,height 的设置
		_super.setStyleProperty.apply(this, arguments);
	};
	this.resize = function(w, h){
		_super.resize.call(this, w, h);
		if(this._modalPanel && this._modalPanel.getVisible())
			this._modalPanel.resize(w, h);  //调整模态面板的大小
	};
	this.getModalPanel = function(){
		return this._modalPanel;
	};
	this.setPopup = function(v, pos){
		try{
		if(v){
			if(this._popup){
				this._popup.setVisible(false);
				//this._popup.setZIndex(1);
				this._popup = null;
			}
			this._popup = v;
			this._popup.setZIndex(10);
			this._popup.setVisible(true);
			this._popup.moveTo(pos.x, pos.y);
		}else{  //还原蒙板
			this._popup.setVisible(false);
			//this._popup.setZIndex(1);
			this._popup = null;
		}
		}catch(ex){
			this._win._alert(ex.description);
		}
	};
	this.setCaptureComponent = function(v){
		this._captureComponent = v;
	};
	this.setActiveDialog = function(v){
		this._activeDialog = v;
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
		if(this._popup){
			switch(this._popup._className){
			case "Popup":
				if(this._popup.getVisible()){
					this.setPopup(null);
				}
				break;
			case "Dialog":
				break;
			}
		}
	};
	this.onMouseMove = null;
	this.onMouseUp = function(ev){};
	/**
	 * 偏移量的修正依赖于 getPos 方法的正确性，如果本身计算就不正确，修正结果也将不对
	 * [TODO]在第一次onMouseMove事件中执行修正偏移量的计算
	 */
	/*
	this._mousemoveForFixed = function(ev){
		var obj = runtime._testDiv;
		var pos = this._dom.getPos(obj, this._self);
		if(this._fixed == null){
			//alert((pos.x + ev.offsetX) + "," + (pos.y + ev.offsetY) + "|" + ev.clientX + "," + ev.clientY);
			this._offsetX = ev.offsetX;
			this._offsetY = ev.offsetY;
			this._fixedOff = {x: pos.x + ev.offsetX, y: pos.y + ev.offsetY};
			this._fixed = "fixing";
			//this.onMouseMove(ev);
			var rect = this.getViewPort();
			var x = rect.x + Math.min(rect.w - this._paddingLeft, Math.max(0, ev.clientX - this._borderLeftWidth)) - this._fixedX - this._offsetX - this._paddingLeft;
			var y = rect.y + Math.min(rect.h - this._paddingTop, Math.max(0, ev.clientY - this._borderTopWidth)) - this._fixedY - this._offsetY - this._paddingTop;
			obj.style.left = (-2000 + x) + "px";
			obj.style.top = (-2000 + y) + "px";
			this._mousemoveForFixed(ev);
		}else if(this._fixed == "fixing"){
			//this._fixedOff = {x: ev.clientX, y: ev.clientY};
			this._fixedX = pos.x + ev.offsetX - this._fixedOff.x;
			this._fixedY = pos.y + ev.offsetY - this._fixedOff.y;
			//alert("&&&&" + this._fixedX + "," + this._fixedY);
			this._fixed = "fixed";
			this.onMouseMove = this._mousemoveForNormal;  //转换成正常的事件
		}else{  //fixed
			ev.cancelBubble = true;
		}
		obj = null;
	};
	*/
	this._mousemoveForFixed = function(dlg, ev){
		var obj = ev.srcElement;
		var pos = dlg._dom.getPos(obj, this._self);
		if(this._fixed == null){
			//alert((pos.x + ev.offsetX) + "," + (pos.y + ev.offsetY) + "|" + ev.clientX + "," + ev.clientY);
			this._fixedOff = {
				pos_x: pos.x,
				pos_y: pos.y,
				o: ev.srcElement,
				ev_offsetX: ev.offsetX,
				ev_offsetY: ev.offsetY,
				x: pos.x + ev.offsetX,
				y: pos.y + ev.offsetY
			};
			this._fixed = "fixing";
			dlg.onMouseMove(ev);
		}else if(this._fixed == "fixing"){
			if(ev.srcElement != this._fixedOff.o || ev.offsetX != this._fixedOff.ev_offsetX || ev.offsetY != this._fixedOff.ev_offsetY)
				alert("[Workspace::_mousemoveForFixed]fixing unexpect");
			this._fixedX = pos.x - this._fixedOff.pos_x;  //pos.x + ev.offsetX - (this._fixedOff.pos_x + this._fixedOff.ev_offsetX)
			this._fixedY = pos.y - this._fixedOff.pos_y;  //pos.y + ev.offsetY - (this._fixedOff.pos_y + this._fixedOff.ev_offsetY)
			//window.document.title = this._fixedX + "," + this._fixedY + "|" + dlg._borderLeftWidth + "," + dlg._borderTopWidth;
			this._fixed = "fixed";
			dlg.onMouseMove(ev);
			this._mousemoveForFixed = null;
		}
		obj = null;
	};
	this._mousemoveForNormal = function(ev){
		if(runtime._debug){  //如果调试状态的话，更新 MouseEvent 的信息
			if(!this._tipMouse){
				this._tipMouse = this._create(!runtime.ns ? "div" : "textarea");  //NS 有性能问题，改用 textarea
				this._tipMouse.style.position = "absolute";
				this._tipMouse.style.border = "1px solid #AAAAAA";
				this._tipMouse.style.font = "12px 宋体";
				this._tipMouse.style.zIndex = "1000";
				//this._tipMouse.style.backgroundColor = "buttonface";
				//this._tipMouse.style.filter = "Alpha(Opacity=90)";
				if(runtime.ns){
					this._tipMouse.readOnly = true;
					this._tipMouse.style.width = "150px";
					this._tipMouse.style.height = "300px";
				}
				this._self.appendChild(this._tipMouse);
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
			var off = {x:0,y:0};
			for(var el = ev.srcElement; el; el = el.offsetParent){
				off.x += el.offsetLeft + parseInt0(el.currentStyle.borderLeftWidth);
				off.y += el.offsetTop + parseInt0(el.currentStyle.borderTopWidth);
				a.push("off(x=" + el.offsetLeft + ",y=" + el.offsetTop + "),border(blw=" + parseInt0(el.currentStyle.borderLeftWidth) + ",btw=" + parseInt0(el.currentStyle.borderTopWidth) + ")");
			}
			a.push("OFF(x=" + off.x + ",y=" + off.y + "),OFF+offset(x=" + (off.x + ev.offsetX) + ",y=" + (off.y + ev.offsetY) + ")");
			this._tipMouse.style.left = (ev.clientX - this._borderLeftWidth + 4) + "px";
			this._tipMouse.style.top = (ev.clientY - this._borderTopWidth + 4) + "px";
			if(runtime.ns)
				this._tipMouse.value = a.join("\n");
			else
				this._tipMouse.innerHTML = a.join("<br />");
		}
	};
});
/*#file end*/
/*#file begin=alz.mui.DropDown.js*/
_package("alz.mui");

_import("alz.mui.Component");

_class("DropDown", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._drop = null;
	};
	this.bind = function(obj){
		_super.bind.apply(this, arguments);
		this._bindDrop();
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._bindDrop();
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onmousedown = null;
		this._self.onclick = null;
		if(this._drop){
			this._drop.dispose();
			this._drop = null;
		}
		_super.dispose.apply(this);
	};
	this._bindDrop = function(){
		if(!this._drop){
			var id = this._dropid;  //this._self.getAttribute("dropid")
			if(!id) runtime.getWindow()._alert("组件DropDown缺少属性dropid");
			this._drop = runtime.initComponent(runtime._workspace, id);
			if(!this._drop) throw "未找到DropDown组件的下拉列表[Popup,id=\"" + id + "\"]";
			this._drop.setVisible(false);
			this._self.onmousedown = function(ev){return this._ptr.onMouseDown(ev || this._ptr._win.event);};
			this._self.onclick = function(ev){return false;};
			this._drop._self.onmousedown = function(ev){
				ev = ev || this._ptr._win.event;
				alert((ev.srcElement || ev.target).innerHTML);
			};
		}
	};
	this.onMouseDown = function(ev){
		if(this._drop.getVisible()){
			runtime._workspace.setPopup(null);
		}else{
			var pos = this.getPosition(ev, 0);
			pos.y += this.getHeight();
			this._drop.setWidth(Math.max(this.getWidth(), this._drop.getWidth()));
			runtime._workspace.setPopup(this._drop, pos);
		}
		ev.cancelBubble = true;
		return false;
	};
});
/*#file end*/
/*#file begin=alz.mui.Popup.js*/
_package("alz.mui");

_import("alz.mui.Component");

_class("Popup", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		/*
		this._self.onmousedown = function(ev){
			ev = ev || this._ptr._win.event;
			ev.cancelBubble = true;
			return false;
		};
		*/
	};
	this.dispose = function(){
		if(this._disposed) return;
		//this._self.onmousedown = null;
		_super.dispose.apply(this);
	};
});
/*#file end*/
/*#file begin=alz.mui.ListItem.js*/
_package("alz.mui");

_import("alz.mui.Component");

_class("ListItem", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._icon = null;
		this._label = null;
	};
	this.__init = function(obj, domBuildType){
		_super.__init.apply(this, arguments);
		//alert(this._self.firstChild.nodeType);
		this._self.style.verticalAlign = "middle";
		this._self.onselectstart = function(ev){return false;};

		this._icon = this._create("img");
		this._icon.src = "skin/Icon_delete.gif";
		this._icon.style.border = "0px";
		this._icon.style.width = "16px";
		this._icon.style.height = "15px";
		this._icon.style.verticalAlign = "middle";

		var text = this._self.removeChild(this._self.firstChild);
		var size = runtime.getTextSize(text.data, "12px 宋体");

		this._label = this._create("label");
		this._label.style.backgroundColor = "#CCCCCC";
		this._label.style.width = (size.w + 10) + "px";
		//this._label.style.height = (size.h + 2) + "px";
		//this._label.style.padding = "1px";
		this._label.style.textAlign = "center";
		this._label.style.lineHeight = "100%";
		this._label.appendChild(text);

		this._self.appendChild(this._icon);
		this._self.appendChild(this._label);
	};
	//this.bind = function(obj){};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._label = null;
		this._icon = null;
		_super.dispose.apply(this);
	};
});
/*#file end*/
/*#file begin=alz.mui.Dialog.js*/
_package("alz.mui");

_import("alz.mui.Component");

_class("Dialog", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._skin = null;
		this._head = null;
		this._btnClose = null;
		this._body = null;
		this._borders = null;
	};
	this.create = function(parent, caption){
		this._caption = caption;
		return _super.create.apply(this, arguments);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		//this._skin = this._create("div");
		this._self.className = "wui-Dialog2";
		//this._self.appendChild(this._skin);
		//this.setStyleProperty("border", "2px outset");  //runtime.ie ? "2px outset" : "2px solid #97A4B2"
		//this.setStyleProperty("backgroundColor", "buttonface");  //runtime.ie ? "buttonface" : "#B9C4D0"
		if(runtime.ff){
			this.setStyleProperty("MozBorderLeftColors", "ThreeDLightShadow ThreeDHighlight");
			this.setStyleProperty("MozBorderTopColors", "ThreeDLightShadow ThreeDHighlight");
			this.setStyleProperty("MozBorderRightColors", "ThreeDDarkShadow ThreeDShadow");
			this.setStyleProperty("MozBorderBottomColors", "ThreeDDarkShadow ThreeDShadow");
		}
		var str = "<div class=\"skin\"></div>"
			+ "<div class=\"head\" html=\"true\" aui=\"{align:'top',height:18;}\">"
			+ "<label class=\"caption\">{$caption}</label><div class=\"icon\"></div>"
			+ "</div>"
			+ "<div class=\"body\" aui=\"{align:'client'}\"></div>";
		str = str.replace(/\{\$caption\}/g, this._caption);
		str = str.replace(/\{\$pathAui\}/g, runtime.pathAui);
		this._self.innerHTML = str;
		this.bind(obj);
		//this.setOpacity(0.7);
	};
	this.bind = function(obj){
		_super.bind.apply(this, arguments);
		//this.fixedOffset();  //计算坐标修正的偏移量
		var nodes = this._dom.selectNodes(this._self, "*");
		this._skin = nodes[0];
		this._head = nodes[1];
		this._btnClose = this._dom.selectNodes(this._head, "*")[1];
		this._body = nodes[2];
		this._head._dlg = this;
		this._head.onmousedown = function(ev){return this._dlg.onMouseDown(ev || this._dlg._win.event);};
		this._head.onselectstart = function(ev){return false;};
		if(this._btnClose){
			this._btnClose.style.backgroundPosition = "-48px 0px";
			this._btnClose._dlg = this;
			this._btnClose.onselectstart = function(ev){return false;};
			this._btnClose.ondragstart = function(ev){return false;};
			this._btnClose.onmousedown = function(ev){
				ev = ev || this._dlg._win.event;
				//this.src = runtime.pathAui + "lib/src/AWindow_closedown.gif";
				this.style.backgroundPosition = "-48px -14px";
				if(runtime.ie) this.setCapture();
				this.onMouseMove = function(ev){
					ev = ev || this._dlg._win.event;
					var target = ev.srcElement || ev.target;
					if(target == this){
						//this.src = runtime.pathAui + "lib/src/AWindow_closedown.gif";
						this.style.backgroundPosition = "-48px -14px";
					}else{
						//this.src = runtime.pathAui + "lib/src/AWindow_closeup.gif";
						this.style.backgroundPosition = "-48px 0px";
					}
				};
				this.onMouseUp = function(ev){
					ev = ev || this._dlg._win.event;
					var target = ev.srcElement || ev.target;
					//this.src = runtime.pathAui + "lib/src/AWindow_closeup.gif";
					this.style.backgroundPosition = "-48px 0px";
					this.onMouseMove = null;
					this.onMouseUp = null;
					if(runtime.ie) this.releaseCapture();
					if(target == this)
						this._dlg.close();  //关闭对话框
				};
				ev.cancelBubble = true;
			};
		}
		this._createBorders();
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._borders){
			for(var i = 0, len = this._borders.length; i < len; i++){
				this._borders[i] = null;
			}
		}
		this._body = null;
		this._btnClose.onmousedown = null;
		this._btnClose.ondragstart = null;
		this._btnClose.onselectstart = null;
		this._btnClose._dlg = null;
		this._btnClose = null;
		this._head.onselectstart = null;
		this._head.onmousedown = null;
		this._head._dlg = null;
		this._head = null;
		_super.dispose.apply(this);
	};
	this.resize = function(w, h){
		//_super.resize.apply(this, arguments);
		this._dom.resizeElement(this._self, w, h);
		var ww = this.getInnerWidth();
		var hh = this.getInnerHeight();
		//this._dom.resize(this._self);
		this._dom.setWidth(this._head, w - 8);
		this._dom.setWidth(this._body, w - 8);
		this._dom.setHeight(this._body, hh - 4 - 19);
		this._dom.resizeElement(this._skin, w, h);
		if(/*this._resizable && */this._borders){
			this._resizeBorder(w, h);
		}
	};
	this.close = function(){
		if(this._modal)
			this.showModal(false);
		else
			this.setVisible(false);
	};
	this._createBorders = function(){
		this._borders = [];
		var cursors = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
		for(var i = 0, len = cursors.length; i < len; i++){
			var o = this._create("div");
			//if(i % 2 == 0) o.style.backgroundColor = "red";
			o.style.position = "absolute";
			o.style.overflow = "hidden";
			o.style.zIndex = 3;
			o.style.cursor = cursors[i] + "-resize";
			this._self.appendChild(o);
			this._borders.push(o);
			o = null;
		}
	};
	this._resizeBorder = function(w, h){
		var bw4 = 4, bw8 = 8;
		this._setElementRect(this._borders[0], 0    , 0    , bw8    , bw8);
		this._setElementRect(this._borders[1], bw8  , 0    , w-2*bw8, bw4);
		this._setElementRect(this._borders[2], w-bw8, 0    , bw8    , bw8);

		this._setElementRect(this._borders[3], 0    , bw8  , bw4    , h-2*bw8);
		this._setElementRect(this._borders[4], w-bw4, bw8  , bw4    , h-2*bw8);

		this._setElementRect(this._borders[5], 0    , h-bw8, bw8    , bw8);
		this._setElementRect(this._borders[6], bw8  , h-bw4, w-2*bw8, bw4);
		this._setElementRect(this._borders[7], w-bw8, h-bw8, bw8    , bw8);
	};
	this._setElementRect = function(obj, x, y, w, h, bg){
		obj.style.left   = x + "px";
		obj.style.top    = y + "px";
		obj.style.width  = w + "px";
		obj.style.height = h + "px";
	};
	/**
	 * [TODO]TT差出来的这两像素可能是由于 BODY 的默认边框宽度计算不准确导致的
	 */
	/*
	this.fixedOffset = function(){
		//alert(runtime.getBoxModel() + "|" + runtime.ie + "|" + runtime.tt + "|" + this._borderLeftWidth);
		if(runtime.getBoxModel() == 0){
			if(runtime.ie){
				this._fixedX = this._borderLeftWidth - (runtime.tt ? 2 : 0);
				this._fixedY = this._borderTopWidth - (runtime.tt ? 2 : 0);
			}else if(runtime.moz){
				this._fixedX = -5;
				this._fixedY = -5;
			}else if(runtime.opera){
				this._fixedX = -5;
				this._fixedY = -5;
			}else{  //safari [TODO]
				this._fixedX = -5;
				this._fixedY = -5;
			}
		}else{
			if(runtime.ie){
				this._fixedX = this._borderLeftWidth - (runtime.tt ? 2 : 0);
				this._fixedY = this._borderTopWidth - (runtime.tt ? 2 : 0);
			}else if(runtime.moz){
				this._fixedX = this._paddingLeft - (runtime.ff ? 5 : 4);
				this._fixedY = this._paddingTop - (runtime.ff ? 5 : 4);
			}else if(runtime.opera){
				this._fixedX = this._paddingLeft + 2;
				this._fixedY = this._paddingTop + 2;
			}else{  //safari
				this._fixedX = this._paddingLeft;
				this._fixedY = this._paddingTop;
			}
		}
	};
	*/
	this.onMouseDown = function(ev){
		//if(runtime.ie) this._head.setCapture();
		//this._head.onmousemove = function(ev){return this._dlg.onMouseMove(ev || this._dlg._win.event);};
		//this._head.onmouseup   = function(ev){return this._dlg.onMouseUp(ev || this._dlg._win.event);};
		this.setCapture(true);
		//var pos = this._dom.getPos(ev.srcElement, this._self);
		//window.document.title = pos.x + "+" + ev.offsetX + "=" + (pos.x + ev.offsetX) + "#" + ev.clientX
		//								+ "|" + pos.y + "+" + ev.offsetY + "=" + (pos.y + ev.offsetY) + "#" + ev.clientY;
		this._offsetX = ev.offsetX;  //ns 浏览器的问题
		this._offsetY = ev.offsetY;
		if(runtime._workspace._fixed != "fixed"){
			if(runtime._workspace._mousemoveForFixed)
				runtime._workspace._mousemoveForFixed(this, ev);
			/* 直接使用默认值，可以省去自动修正过程，但是不能保证一定是通用的
			if(runtime.ie || runtime.safari){
				runtime._workspace._fixedX = 0;
				runtime._workspace._fixedY = 0;
				runtime._workspace._fixed = "fixed";
			}else if(runtime.opera){
				runtime._workspace._fixedX = 2;
				runtime._workspace._fixedY = 2;
				runtime._workspace._fixed = "fixed";
			}else{  //runtime.moz
				if(this._mousemoveForFixed) this._mousemoveForFixed(ev);
			}
			*/
		}
		//this.onMouseMove(ev);
	};
	this.onMouseMove = function(ev){
		var rect = runtime._workspace.getViewPort();
		var x = rect.x + Math.min(rect.w - this._paddingLeft, Math.max(0, ev.clientX - runtime._workspace._borderLeftWidth)) - runtime._workspace._fixedX - this._offsetX - this._paddingLeft;
		var y = rect.y + Math.min(rect.h - this._paddingTop, Math.max(0, ev.clientY - runtime._workspace._borderTopWidth)) - runtime._workspace._fixedY - this._offsetY - this._paddingTop;
		if(runtime.ie || runtime.safari || runtime.chrome || runtime.opera){
			x -= this._borderLeftWidth;
			y -= this._borderTopWidth;
		}else if(runtime.moz){
		}
		/*
		var str = "boxModel=" + runtime.getBoxModel()
			//+ "\nrect={x:" + rect.x + ",y:" + rect.y + ",w:" + rect.w + ",h:" + rect.h + "}"
			+ "\nfixedX=" + runtime._workspace._fixedX + ",_borderLeftWidth=" + this._borderLeftWidth
			+ "\nfixedY=" + runtime._workspace._fixedY + ",_borderTopWidth=" + this._borderTopWidth
			//+ "\nruntime._workspace._borderLeftWidth=" + runtime._workspace._borderLeftWidth
			//+ "\nruntime._workspace._borderTopWidth=" + runtime._workspace._borderTopWidth
			+ "\nthis._offsetX=" + this._offsetX
			+ "\nthis._offsetY=" + this._offsetY
			+ "\nev.clientX=" + ev.clientX + ",x=" + x + ","
			+ "\nev.clientY=" + ev.clientY + ",y=" + y + ",";
		this._body.childNodes[1].value = str;
		*/
		this.moveTo(x, y);
	};
	this.onMouseUp = function(ev){
		this._head.onmousemove = null;
		this._head.onmouseup = null;
		//if(runtime.ie) this._head.releaseCapture();
		this.setCapture(false);
	};
	this.setClientBgColor = function(color){
		this._body.style.backgroundColor = color;
	};
});
/*#file end*/
/*#file begin=alz.mui.TabPage.js*/
_package("alz.mui");

_import("alz.mui.Component");

_class("TabPage", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._tabs = [];
		this._activeTab = null;
		this._head = null;
		this._body = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._head = runtime.getDocument().createElement("div");
		this._head.className = "mui-TabPage-Head";
		this._self.appendChild(this._head);
		this._body = runtime.getDocument().createElement("div");
		this._body.className = "mui-TabPage-Body";
		this._body.innerHTML =
				'<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#869FA1"><tbody></tbody></table>'
			+ '<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#869FA1"><tbody></tbody></table>'
			+ '<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#FFCCB4"><tbody></tbody></table>'
			+ '<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#0A0064"><tbody></tbody></table>';
		this._self.appendChild(this._body);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._body = null;
		this._head = null;
		this._activeTab = null;
		for(var i = 0, len = this._tabs.length; i < len; i++){
			this._tabs[i].onfocus = null;
			this._tabs[i]._parent = this;
			this._tabs[i] = null;
		}
		this._tabs = [];
		_super.dispose.apply(this);
	};
	this.resize = function(w, h){
		this._self.style.width = w + "px";
		this._self.style.height = h + "px";
		this._body.style.width = (w - 4) + "px";
		this._body.style.height = (h - 18 - 4) + "px";
		var nodes = this._body.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			nodes[i].style.width = (w - 4 - 16) + "px";
			nodes[i].style.height = (h - 18 - 4) + "px";
		}
		nodes = null;
	};
	this.add = function(text){
		var obj = window.document.createElement("label");
		obj._parent = this;
		obj.tagIndex = this._tabs.length + 1;
		obj.innerHTML = text + "[0]";
		obj.onclick = function(){this._parent.activate(this);};
		this._head.appendChild(obj);
		this._tabs.push(obj);
		this.activate(obj);
	};
	this.activate = function(tab){
		if(this._activeTab != null){
			this._activeTab.className = "";
			this._body.childNodes[this._activeTab.tagIndex - 1].style.display = "none";
		}
		tab.className = "focus";
		this._body.childNodes[tab.tagIndex - 1].style.display = "block";
		this._activeTab = tab;
	};
});
/*#file end*/
/*#file begin=alz.mui.WindowSkinWINXP.js*/
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
_class("WindowSkinWINXP", Component, function(_super){
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
		var obj = this._create("div");
		obj.className = "wui-skin";
		if(parent) parent._self.appendChild(obj);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._xpath = ".mui-Window-winxp";
		//this._skins = [];
		for(var i = 0, len = this._cursors.length; i < len; i++){
			var o = this._create("div");
			o.className = this._cursors[i];
			/*
			o.style.position = "absolute";
			o.style.overflow = "hidden";
			o.style.backgroundColor = "#000000";
			o.style.filter = "Alpha(Opacity=20)";
			o.style.zIndex = 10;
			o.style.cursor = this._cursors[i] + "-resize";
			*/
			this._self.appendChild(o);
			//this._skins.push(o);
			this._ee["_skin" + i] = o;
			o = null;
		}
		this._ee["_title1"] =
		this._title =
		this._title1 = this._create("img");
		this._ee["_title2"] =
		this._title2 = this._create("img");
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
/*#file end*/
/*#file begin=alz.mui.WindowSkinWIN2K.js*/
_package("alz.mui");

_import("alz.mui.Component");

_class("WindowSkinWIN2K", Component, function(_super){
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
			"top_use_opacity": false  //顶部上调区域是否需要使用透明度，受标题栏IMG标签影响
		};
	};
	this.create = function(parent){
		if(parent){
			this._parent = parent;
			for(var k in this._cssHash){
				this._parent[k]._cssData = this._cssHash[k];
			}
		}
		var obj = this._create("div");
		obj.className = "wui-skin";
		if(parent) parent._self.appendChild(obj);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._xpath = ".mui-Window-win2k";
		for(var i = 0, len = this._cursors.length; i < len; i++){
			var o = this._create("div");
			o.className = this._cursors[i];
			/*
			o.style.position = "absolute";
			o.style.overflow = "hidden";
			o.style.backgroundColor = "#000000";
			o.style.filter = "Alpha(Opacity=20)";
			o.style.zIndex = 10;
			o.style.cursor = this._cursors[i] + "-resize";
			*/
			this._self.appendChild(o);
			this._ee["_skin" + i] = o;
		}
		this._title = this._create("img");
		this._self.appendChild(this._title);
		this._title.src = runtime.getConfigData("pathimg") + "win-2k-title-bg.gif";
		this._title._dlg = this;
		this._title.ondragstart = function(){return false;};
		this._title.onmousedown = function(ev){
			this._dlg._parent.onMouseDown(ev || window.event);
		};
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
			var w1 =  4;  //顶宽
			var w2 =  4;  //中宽
			var w3 =  5;  //底宽
			var h0 =  4   //顶高
			var h1 = 23;  //顶高
			var h3 =  4;  //底高
		}else{
			var w1 =  3;  //顶宽
			var w2 =  3;  //中宽
			var w3 =  4;  //底宽
			var h0 =  3   //顶高
			var h1 = 22;  //顶高
			var h3 =  3;  //底高
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
/*#file end*/
/*#file begin=alz.mui.SysBtn.js*/
_package("alz.mui");

_import("alz.mui.Component");

_class("SysBtn", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._win = null;
	};
	this.init = function(obj, win, css){
		_super.init.apply(this, arguments);
		this._win = win;
		this._cssName = "." + this._self.className;
		this._xpath = this._win._cssName + " .head " + this._cssName;
		this._capture = false;
		this._self.onmousedown = function(ev){
			return this._ptr.onMouseDown(ev || window.event);
			/*
			ev = ev || window.event;
			//this.style.backgroundPosition = "0px -" + _win._skin._model["sbtn_height"] + "px";
			this._ptr._capture = true;
			this.setCapture();
			this._ptr.setState("active");
			ev.cancelBubble = true;
			return false;
			*/
		};
		/*
		this._self.onmouseup = function(ev){
			ev = ev || window.event;
			//this.style.backgroundPosition = "0px 0px";
			this._ptr.setState("normal");
			this.releaseCapture();
			this._ptr._capture = false;
			ev.cancelBubble = true;
			return false;
		};
		this._self.onmouseover = function(ev){
			ev = ev || window.event;
			_doc.title = "over";
			if(this._ptr._capture){
				this._ptr.setState("active");
			}else{
				//this._ptr.setState("normal");
			}
			//return false;
		};
		this._self.onmouseout = function(ev){
			ev = ev || window.event;
			_doc.title = "out";
			if(this._ptr._capture){
				this._ptr.setState("normal");
			}else{
				//this._ptr.setState("normal");
			}
			//return false;
		};
		*/
	}
	this.dispose = function(){
		this._self.onmouseout = null;
		this._self.onmouseover = null;
		this._self.onmousedown = null;
		this._self.onmouseup = null;
		_super.dispose.apply(this);
	};
	this.onMouseDown = function(ev){
		this.setCapture(true);
		/*
		var _this = this;
		var body = window.document.body;
		if(runtime._host.env == "ie")
			body.setCapture();
		body.onmousemove = function(ev){_this.onMouseMove(ev || window.event);};
		body.onmouseup = function(ev){_this.onMouseUp(ev || window.event);};
		body = null;
		*/
		this.setState("active");
		ev.cancelBubble = true;
		return false;
	};
	this.onMouseMove = function(ev){
		var target = ev.srcElement || ev.target;
		this.setState(target == this._self ? "active" : "normal");
	};
	this.onMouseUp = function(ev){
		this.setState("normal");
		this.setCapture(false);
		/*
		var body = window.document.body;
		body.onmousemove = null;
		body.onmouseup = null;
		if(runtime._host.env == "ie")
			body.releaseCapture();
		body = null;
		*/
	};
});
/*#file end*/
/*#file begin=alz.mui.Window.js*/
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
_class("Window", Component, function(_super){
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
		this._head_tpl = '<div class="head">'
			+ '<img />'
			+ '<label></label>'
			+ '<div class="sysbtn">'
			+ '<div class="icon-min" title="最小化"></div>'
			+ '<div class="icon-max" title="最大化"></div>'
			+ '<div class="icon-close" title="关闭"></div>'
			+ '</div>'
			+ '</div>';
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		/*
		body     div.body
		head     div.head
		icon     div.head > img
		title    div.head > label
		minbtn   div.head > div.sysbtn > div.icon-min
		maxbtn   div.head > div.sysbtn > div.icon-max
		closebtn div.head > div.sysbtn > div.icon-close
		*/
		this._cssName = "." + this._self.className;
		this._xpath = this._cssName;
		this._body = this._self.childNodes[0];
		this._head = runtime.createDomElement(this._head_tpl, this._self);
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
		if(this._self.className == "mui-Window-winxp"){
			this._skin = new WindowSkinWINXP();
		}else{
			this._skin = new WindowSkinWIN2K();
		}
		this._createBorders();
		this._skin.create(this);
	};
	this.dispose = function(){
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
			var o = this._create("div");
			o.style.position = "absolute";
			o.style.overflow = "hidden";
			o.style.zIndex = 3;
			o.style.cursor = this._cursors[i] + "-resize";
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
			this._self.appendChild(o);
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
		if(runtime._host.env == "ie")
			body.setCapture();
		body.onmousemove = function(ev){_this.onMouseMove(ev || window.event);};
		body.onmouseup = function(ev){_this.onMouseUp(ev || window.event);};
		body = null;
		*/
	};
	this.onMouseMove = function(ev){
		var rect = runtime.dom.getViewPort(window.document.body);
		var x = rect.x + Math.min(rect.w - 10, Math.max(10, ev.clientX)) - this._offsetX - 2;
		var y = rect.y + Math.min(rect.h - 10, Math.max(10, ev.clientY)) - this._offsetY - 2;
		runtime.dom.moveTo(this._self, x, y);
	};
	this.onMouseUp = function(ev){
		this.setCapture(false);
		/*
		var body = window.document.body;
		body.onmousemove = null;
		body.onmouseup = null;
		if(runtime._host.env == "ie")
			body.releaseCapture();
		body = null;
		*/
		//if(runtime.ie) this._head.releaseCapture();
		//this.setCapture(false);
	};
});
/*#file end*/
/*#file begin=alz.core.WebAppRuntime_ui.js*/
_package("alz.core");

_import("alz.mui.ToggleManager");
_import("alz.mui.ActionManager");
_import("alz.mui.Workspace");
_import("alz.mui.Dialog");

_extension("WebAppRuntime", function(){  //注册 WebAppRuntime 扩展
	this._init = function(){  //加载之后的初始化工作
		this._domTemp = null;
		this.toggleMgr = new ToggleManager();
		//this.actionManager = new ActionManager();
		this._workspace = new Workspace();
		if(this._newWorkspace)
			this._workspace.create(this.getBody());
		else{
			this._workspace.bind(this.getBody());
		}
		this._workspace.setVisible(true);
		if(this.debug){  //如果开启调试开关
			this._testCaseWin = new Dialog();
			this._testCaseWin._domCreate = true;
			this._testCaseWin.create(this._workspace._self, "Test Case Listener");
			this._testCaseWin.moveTo(500, 50);
			this._testCaseWin.resize(500, 300);
			this._testCaseWin.setClientBgColor("#FFFFFF");
			this._testCaseWin.log = function(msg){
				var div = this._create("div");
				div.style.borderBottom = "1px solid #CCCCCC";
				div.innerHTML = msg;
				this._body.appendChild(div, this._body.childNodes[0]);
				div = null;
			};
		}
	};
	this.dispose = function(){
		if(this._workspace){
			this._workspace.dispose();
			this._workspace = null;
		}
		if(this._testCaseWin){
			this._testCaseWin.dispose();
			this._testCaseWin = null;
		}
		this.toggleMgr.dispose();
		this.toggleMgr = null;
		//this.actionManager.dispose();
		//this.actionManager = null;
		this._domTemp = null;
	};
	this.createDomElement = function(html, parent){
		if(!this._domTemp){
			this._domTemp = this._doc.createElement("div");
		}
		this._domTemp.innerHTML = html;
		var obj = this._domTemp.removeChild(this._domTemp.childNodes[0]);
		if(parent){
			parent.appendChild(obj);
			/*
			//滞后加载图片
			var imgs = obj.getElementsByTagName("img");
			for(var i = 0, len = imgs.length; i < len; i++){
				imgs[i].src = imgs[i].getAttribute("src0");
			}
			imgs = null;
			*/
		}
		return obj;
	};
	this.getWorkspace = function(){
		return this._workspace;
	};
	this.getViewPort = function(element){
		var rect = {
			x: element.scrollLeft,
			y: element.scrollTop,
			w: element.clientWidth,  //Math.max(element.clientWidth || element.scrollWidth)
			h: Math.max(element.clientHeight, element.parentNode.clientHeight)  //Math.max(element.clientHeight || element.scrollHeight)
		};
		//if(this.ff)
		rect.w = Math.max(element.clientWidth, element.parentNode.clientWidth);
		rect.h = Math.max(element.clientHeight, element.parentNode.clientHeight);
		return rect;
	};
	this.onResize = function(){
		var rect = this.getViewPort(this.getBody());  //this._workspace.getViewPort()
		if(this._workspace)
			this._workspace.resize(rect.w, rect.h);
		if(typeof app_onResize != "undefined")  //提前触发应用的resize事件
			app_onResize(rect.w, rect.h);
		this._appManager.onResize(rect.w, rect.h);  //调整所有应用的大小
	};
	/**
	 * 根据DOM元素的ID，并且使用该DOM元素创建一个脚本组件
	 * @param id {String} 脚本组件所绑定的DOM元素的ID
	 */
	this.getComponentById = function(id){
		return this.initComponent(null, id);
	};
	/**
	 * 所有通过该函数操作过的DOM元素都会绑定一个脚本组件对象，并通过该脚本组件可以
	 * 方便的操作DOM元素的属性。
	 * @param parent {Component} 父组件
	 * @param id {String|Component} 组件要绑定的DOM元素的id
	 * -@param initChild {Boolean} 是否初始化子DOM元素
	 */
	this.initComponent = function(parent, id){
		var obj = typeof(id) == "string" ? this.getElement(id) : id;
		if(!obj) throw "未找到指定id的DOM元素";
		if(!obj._ptr){
			var className, aui;
			var sAui = obj.getAttribute("aui");
			if(sAui != "-"){
				aui = eval("(" + sAui + ")");
				if(aui.tag)
					className = aui.tag;
				else{
					className = obj.getAttribute("tag");
					if(!className){
						className = "Component";
						//throw "找到的DOM元素没有tag属性，不能绑定脚本组件";
					}else
						this._win.alert("使用DOM元素的tag属性决定组件类型");
				}
			}
			if(!className){
				className = "Component";  //默认值
			}
			var c = new alz[className]();
			//c._domCreate = true;
			if(aui)
				c.setJsonData(aui);
			c.setParent(parent, obj);
			c.bind(obj);
			//var color = this.getRandomColor();
			//c._self.style.backgroundColor = color;
			this._components.push(c);
			if(obj.getAttribute("html") != "true"){  //如果初始化子组件的话
				var nodes = obj.childNodes;
				for(var i = 0, len = nodes.length; i < len; i++){
					if(nodes[i].nodeType == 1 && nodes[i].getAttribute("aui")){  //NODE_ELEMENT
						this.initComponent(c, nodes[i], true);
					}
				}
				nodes = null;
			}
			c = null;
		}
		return obj._ptr;
	};
	/**
	 * @param id {String} DOM元素的ID列表，逗号分隔
	 * @return {undefined}
	 */
	this.initComponents = function(id){
		var arr = id.split(",");
		for(var i = 0, len = arr.length; i < len; i++){
			var c = this.initComponent(runtime._workspace, arr[i]);
			var nodes = c._self.childNodes;
			for(var j = 0, len1 = nodes.length; j < len1; j++){
				if(nodes[j].nodeType == 1 && nodes[j].getAttribute("aui")){  //NODE_ELEMENT
					this.initComponent(c, nodes[j], true);
				}
			}
			c = null;
		}
		arr = null;
	};
	/**
	 * 显示一个模态对话框
	 * @param id {String} 对话框的ID
	 * @param ownerId {String} 该对话框的所有者的编号
	 * @return {undefined}
	 */
	this.showModalDialog = function(id, ownerId){
		if(id){
			if(ownerId){
				var owner = this.getComponentById(ownerId);
				this._workspace.getModalPanel().setOwner(owner);
			}
			var obj = this.getComponentById(id);  //可能的组件是 Popup,Dialog
			obj.moveToCenter();
			obj.showModal(true);
		}/*else{
			obj.showModal(false);
		}*/
	};
	this.getModalPanel = function(){
		return this._workspace.getModalPanel();
	};
});
/*#file end*/

runtime.regLib("ui", function(){  //加载之后的初始化工作

});

}})(this);