/**
 * alzui-mini JavaScript Framework, v0.0.8
 * Copyright (c) 2009 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
(function(){with(runtime.createContext("ui", "core")){

var _tmpl = {
	"dialog": "<div html=\"true\" aui=\"{align:'top',height:18;}\" style=\"width:100%;height:18px;background-color:activecaption;border:0px;padding:0px;\">"
		+ "<label style=\"position:absolute;height:14px;background-color:gray;left:4px;top:4px;font:bold 12px 宋体;line-height:100%;color:white;text-align:left;cursor:default;padding-top:2px;\">{$caption}</label>"
		+ "<img style=\"position:absolute;width:16px;height:14px;top:4px;right:4px;vertical-align:middle;background-color:buttonface;\" src=\"{$pathAui}lib/images/AWindow_closeup.gif\" />"
		+ "</div>"
		+ "<div id=\"dlgBody\" aui=\"{align:'client'}\" style=\"position:absolute;top:21px;width:100%;height:300px;background-color:#666666;border:0px;padding:0px;\"></div>"
};

/*<file name="alz/mui/ToggleGroup.js">*/
_package("alz.mui");

/**
 * 状态按钮分组
 */
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
/*</file>*/
/*<file name="alz/mui/ToggleManager.js">*/
_package("alz.mui");

_import("alz.mui.ToggleGroup");

/**
 * 双态按钮管理者
 */
_class("ToggleManager", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._groups = {};
	};
	this.add = function(btn){
		var groupid = btn._groupid;
		if(!this._groups[groupid]){
			this._groups[groupid] = new ToggleGroup();
		}
		this._groups[groupid].append(btn);
	};
	this.toggle = function(btn){
		this._groups[btn._groupid].toggle(btn);
	};
});
/*</file>*/
/*<file name="alz/mui/Component.js">*/
_package("alz.mui");

_import("alz.core.EventTarget");

/**
 * UI组件应该实现BoxElement的接口
 */
_class("Component", EventTarget, function(_super){
	/*
	 0 : obj[k] = v;
	 1 : obj.setAttribute(k, v);
	 2 : obj.style[k] = v;
	*/
	var ATTR = {
		"href"            : 0,
		"htmlFor"         : 0,
		"id"              : 0,
		"name"            : 0,
		"innerHTML"       : 0,
		"onclick"         : 0,
		"ondragstart"     : 0,
		"onmousedown"     : 0,
		"tabIndex"        : 0,
		"title"           : 0,
		"type"            : 0,
		"maxLength"       : 0,
		"nowrap"          : 1,
		"src"             : 1,
		"unselectable"    : 1,
		"_action"         : 1,
		"_action1"        : 1,
		"_align"          : 1,
		"_fid"            : 1,
		"_layout"         : 1,
		"_name"           : 1,
		"backgroundColor" : 2,
		"backgroundRepeat": 2,
		"border"          : 2,
		"borderBottom"    : 2,
		"color"           : 2,
		"cursor"          : 2,
		"display"         : 2,
		"filter"          : 2,
		"font"            : 2,
		"fontWeight"      : 2,
		"height"          : 2,
		"left"            : 2,
		"lineHeight"      : 2,
		"overflow"        : 2,
		"overflowX"       : 2,
		"padding"         : 2,
		"position"        : 2,
		"styleFloat"      : 2,
		"textAlign"       : 2,
		"top"             : 2,
		"whiteSpace"      : 2,
		"width"           : 2,
		"verticalAlign"   : 2,
		"zIndex"          : 2,
		"zoom"            : 2
	};
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
		this._tagName = "div";
		this._self = null;  //组件所关联的DOM元素
		this._containerNode = null;
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
		this._cssName = "";  //组件自身的DOM元素的className的替代名称
		this._xpath = "";
		this._state = "normal";
		this._cursors = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
		this._created = false;
		this._inited = false;
	};
	this.toString = function(){
		return "{tag:'" + this._className + "',align:'" + this._align + "'}";
	};
	this.getDoc = function(){
		if(!this._doc){
			this.initDocEnv(this._self/*, this._parent*/);
		}
		return this._doc;
	};
	this._createTextNode = function(text){
		return this.getDoc().createTextNode(text);
	};
	this._createElement = function(tag){
		return this.getDoc().createElement(tag);
	};
	this._createElement2 = function(parent, tag, cls, style){
		var obj = this._createElement(tag);
		if(cls){
			obj.className = cls;
		}
		if(style){
			for(var k in style){
				//if(k.charAt(0) == "_") 1;
				switch(ATTR[k]){
				case 0: obj[k] = style[k];break;
				case 1: obj.setAttribute(k, style[k]);break;
				case 2: obj.style[k] = style[k];break;
				}
			}
		}
		if(parent){
			parent.appendChild(obj);
		}
		return obj;
	};
	this.parseNum = function(tag, v){
		return this._dom.parseNum(tag, v);
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
		var props = "color,cursor,display,visibility,opacity,zIndex,"
			+ "overflow,position,"
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
		this._left = this.parseNum(obj.tagName, this.getPropertyValue(style, "left")) || obj.offsetLeft;
		this._top = this.parseNum(obj.tagName, this.getPropertyValue(style, "top")) || obj.offsetTop;
		this._width = this.parseNum(obj.tagName, this.getPropertyValue(style, "width")) || obj.offsetWidth;
		this._height = this.parseNum(obj.tagName, this.getPropertyValue(style, "height")) || obj.offsetHeight;

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
			if(props[k] == 1){
				this["_" + k] = this.parseNum(obj.tagName, this.getPropertyValue(style, k) || obj.style[k]);
			}
		}
		if(this._jsonData){  //_jsonData 优先级最高
			for(var k in this._jsonData){
				if(this._jsonData[k]){
					this["_" + k] = this._jsonData[k];
				}
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
		var obj = this._createElement(this._tagName || "div");
		//obj.style.border = "1px solid #000000";
		if(parent) this.setParent(parent, obj);
		this.init(obj);
		return obj;
	};
	this.__init = function(obj, domBuildType){
		if(this._parent && this._parent.add){  //容器类实例有该方法
			this._parent.add(this);
		}
		this._domBuildType = domBuildType;
		obj._ptr = this;
		this._self = obj;
		this._containerNode = obj;  //基础组件默认_self就是具体的容器节点
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
		this._containerNode = null;
		if(this._self){
			if(this._self._ptr){
				this._self._ptr = null;
			}
			if(this._self.tagName != "BODY" && this._self.parentNode){  // && this._domBuildType == 0)
				var o = this._self.parentNode.removeChild(this._self);
				delete o;
				if(runtime.ie){
					this._self.outerHTML = "";
				}
			}
			//runtime.checkDomClean(this);
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
		if(obj.parentNode){
			obj.parentNode.removeChild(obj);
		}
		parent._containerNode.appendChild(obj);
	};
	this.getOwner = function(){
		return this._owner;
	};
	this.setOwner = function(v){
		this._owner = v;
	};
	this.setStyleProperty = function(name, value){
		try{
			if(this._self){
				this._self.style[name] = value;
			}
		}catch(ex){
			window.alert(ex.description + "\n" + name + "=" + value);
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
		if(this._myLayer){
			this._myLayer.style.left = v + "px";
		}
	};
	this.getTop = function(){
		return this._top;
	};
	this.setTop = function(v){
		this._top = v;
		//v += this._paddingTop;
		this.setStyleProperty("top", v + "px");
		if(this._myLayer){
			this._myLayer.style.top = v + "px";
		}
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
		if(this._myLayer){
			this._myLayer.style.width = v + "px";
		}
	};
	this._setHeight = function(v){
		v = Math.max(v, 0);
		this.setStyleProperty("height", v + "px");
		if(this._myLayer){
			this._myLayer.style.height = v + "px";
		}
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
			if(this._self.style.display == "none"){
				this.setStyleProperty("display", "block");
			}
			this.setWidth(w);
			this.setHeight(h);
			if(this._domCreate){
				this._dom.resize(this._self);
			}
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
			"x": this._self.scrollLeft,
			"y": this._self.scrollTop,
			"w": this._self.clientWidth,  //Math.max(this._self.clientWidth || this._self.scrollWidth)
			"h": Math.max(this._self.clientHeight, this._self.parentNode.clientHeight)  //Math.max(this._self.clientHeight || this._self.scrollHeight)
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
		var pos = type == 1
			? {"x": ev.offsetX, "y": ev.offsetY}
			: {"x": 0, "y": 0};
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
	this._cssKeyToJsKey = function(str){
		return str.replace(/-([a-z])/g, function(_0, _1){
			return _1.toUpperCase();
		});
	};
	this.applyCssStyle = function(element, css, className){
		var style = css[(element.className == "error" ? "error-" : "") + className];
		for(var k in style){
			if(k.charAt(0) == "_"){
				var obj = element.getElementsByTagName(k.substr(1))[0];
				for(var key in style[k]){
					var name = this._cssKeyToJsKey(key);
					if(obj.style[name] != style[k][key]){
						obj.style[name] = style[k][key];
					}
				}
				obj = null;
			}else{
				var name = this._cssKeyToJsKey(k);
				if(element.style[name] != style[k]){
					element.style[name] = style[k];
				}
			}
		}
	};
	/**
	 * 通过判断是否绑定有 js 组件对象来确定UI组件
	 */
	this.getControl = function(el){
		while(!el._ptr){
			el = el.parentNode;
			if(!el || el.tagName == "BODY" || el.tagName == "HTML"){
				return null;
			}
		}
		return el._ptr;
	};
	this.dispatchEvent = function(name, params){
		var type = "on" + name;
		if(type in this && typeof this[type] == "function"){
			this[type].apply(this, params);
		}
	};
});
/*</file>*/
/*<file name="alz/mui/TextHistory.js">*/
_package("alz.mui");

/**
 * 命令历史纪录
 */
_class("TextHistory", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._historys = [];
		this._curIndex = 0;  //历史记录的位置
	};
	this.dispose = function(){
		for(var i = 0, len = this._historys.length; i < len; i++){
			this._historys[i] = null;
		}
		this._historys = [];
		_super.dispose.apply(this);
	};
	this.getText = function(num){
		if(num == -1 && this._historys.length - 1 == 0){  //特殊处理这种情况
			return this._historys[0];
		}else if(this._historys.length - 1 > 0){
			var n = Math.max(0, Math.min(this._historys.length - 1, this._curIndex + num));
			if(this._curIndex != n){
				this._curIndex = n;
				return this._historys[n];
			}
		}
	};
	this.append = function(text){
		this._historys.push(text);
		this._curIndex = this._historys.length;
	};
});
/*</file>*/
/*<file name="alz/mui/TextItem.js">*/
_package("alz.mui");

_import("alz.mui.Component");

_class("TextItem", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._type = "sys";  //当前文本的类型
		this._text = "";     //文本内容
		this._active = false;  //当前文本是否处于活动状态之下
		this._cursor = -1;     //如果处在活动状态下，当前光标位置
		//this.create(parent, type, text);
	};
	this.create = function(parent, type, text){
		this._parent = parent;
		this._type = type;
		this._text = text;
		var obj = window.document.createElement("span");
		obj.className = this._type;
		parent._self.appendChild(obj);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this.update();
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.getTextLength = function(){
		return this._text.length;
	};
	this.getText = function(){
		return this._text;
	};
	this.setText = function(text){
		this._text = text;
		this._cursor = text.length;
		this.update();
	};
	this.getCursor = function(){
		return this._cursor;
	};
	this.setCursor = function(v){
		this._cursor = v;
		this.update();
	};
	this.appendText = function(text){
		if(this._cursor == -1 || this._cursor == this._text.length){
			this._text += text;
		}else{
			this._text = this._text.substr(0, this._cursor) + text + this._text.substr(this._cursor);
		}
		this._cursor += text.length;
		this.update();
	};
	this.removeChar = function(n){
		if(n == -1){  //backspace
			this._text = this._text.substr(0, this._cursor - 1) + this._text.substr(this._cursor);
			this._cursor--;
		}else{  //del
			this._text = this._text.substr(0, this._cursor) + this._text.substr(this._cursor + 1);
		}
		this.update();
	};
	this.update = function(){
		if(!runtime._host.xul){
			this._self.innerHTML = this.getInnerHTML();
		}else{
			while(this._self.hasChildNodes()){
				this._self.removeChild(this._self.childNodes[0]);
			}
			if(this._active && this._type == "in"){
				var type = this._parent.getCursorType();
				var cursor = type ? 'cursor ' + type : 'cursor';
				this._self.appendChild(this._createTextNode(this._text.substr(0, this._cursor)));
				var span = this._createElement2(this._self, "span", cursor);
				span.appendChild(this._createTextNode(this._text.charAt(this._cursor) || " "));
				this._self.appendChild(this._createTextNode(this._text.substr(this._cursor + 1)));
			}else{
				this._self.appendChild(this._createTextNode(this._text));
			}
		}
	};
	/*
	var html = '<span class="sys">' + runtime.encodeHTML(this._text.substr(0, this._start)) + '</span>'
		+ '<span class="in">'
		+ runtime.encodeHTML(this._text.substr(this._start, this._col))
		+ '<span class="cursor">' + runtime.encodeHTML(this._text.charAt(this._col) || " ") + '</span>'
		+ this._text.substr(this._col + 1)
		+ '</span>';
	this._self.innerHTML = html;
	*/
	this.toHTML = function(){
		return '<span class="' + this._type + '">' + this.getInnerHTML() + '</span>';
	};
	this.getInnerHTML = function(){
		if(this._active && this._type == "in"){
			var type = this._parent.getCursorType();
			var cursor = type ? 'cursor ' + type : 'cursor';
			return runtime.encodeHTML(this._text.substr(0, this._cursor))
				+ '<span class="' + cursor + '">'
				+ runtime.encodeHTML(this._text.charAt(this._cursor) || " ")
				+ '</span>'
				+ this._text.substr(this._cursor + 1);
		}else{
			return runtime.encodeHTML(this._text);
		}
	};
	this.deactivate = function(){
		this._active = false;
		this._cursor = -1;
	};
	this.activate = function(){
		this._active = true;
		if(this._type == "in"){
			this._cursor = this._text.length;
		}
	};
});
/*</file>*/
/*<file name="alz/mui/LineEdit.js">*/
_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.TextHistory");
_import("alz.mui.TextItem");

/**
 * 行编辑器组件
 * <div id="d1" class="LineEdit">&gt;window.<span class="cursor">a</span>lert("aaaa");</div>
 */
_class("LineEdit", Component, function(_super){
	var KEY_BACKSPACE = 8;
	var KEY_TAB       = 9;   //\t
	var KEY_ENTER     = 13;  //\n
	var KEY_SHIFT     = 16;
	var KEY_CTRL      = 17;
	var KEY_ALT       = 18;
	var KEY_CAPSLOCK  = 20;
	var KEY_ESC       = 27;
	var KEY_SPACE     = 32;  //" "
	var KEY_PAGE_UP   = 33;
	var KEY_PAGE_DOWN = 34;
	var KEY_END       = 35;
	var KEY_HOME      = 36;
	var KEY_LEFT      = 37;
	var KEY_UP        = 38;
	var KEY_RIGHT     = 39;
	var KEY_DOWN      = 40;
	var KEY_INS       = 45;
	var KEY_DEL       = 46;
	var KEY_CH_0      = 48;
	var KEY_CH_9      = 57;
	var KEY_SEMICOLON = 59;   //;
	var KEY_CH_A      = 65;
	var KEY_CH_Z      = 90;
	var KEY_F1        = 110;  //
	var KEY_F2        = 111;  //
	var KEY_F3        = 112;  //!!!系统搜索键
	var KEY_F4        = 113;  //!!!Drop 地址栏
	var KEY_F5        = 114;  //!!!刷新
	var KEY_F6        = 115;  //!!!输入焦点转入地址栏
	var KEY_F7        = 116;  //
	var KEY_F8        = 117;  //
	var KEY_F9        = 118;  //
	var KEY_F10       = 119;  //
	var KEY_F11       = 120;  //
	var KEY_F12       = 121;  //!!!输入焦点转入菜单
	var KEY_xxx       = 229;
	//var count = 0;
	this._number = "0123456789)!@#$%^&*(";
	this._letter = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	this.trim = function(str){  //strip
		return str.replace(/^\s+|[\s\xA0]+$/g, "");
	};
	/*
	this.getInputCursorIndex = function(){
		var s = document.selection.createRange();
		s.setEndPoint("StartToStart", this._input.createTextRange());
		window.alert('left:'+(s.text.length)+'\nright:'+(obj.value.length-s.text.length));
		var selection = document.selection;
		var rng = selection.createRange();
		this._input.select();
		rng.setEndPoint("StartToStart", selection.createRange());
		window.alert(rng.text);
		var pos = rng.text.length;
		rng.collapse(false);
		rng.select();
		return pos;
	};
	*/
	function getCursorIndex(){
		var selection = window.document.selection;
		var rng = selection.createRange();
		this._self.select();
		rng.setEndPoint("StartToStart", selection.createRange());
		this._pos = rng.text.length;
		window.document.title = this._pos;
		rng.collapse(false);  //移到后面
		rng.select();
		rng = null;
	}
	this._init = function(){
		_super._init.call(this);
		this._useInput = false;
		this._input = null;
		this._app = null;
		this._timer = 0;
		this._pos = 0;
		this._history = new TextHistory();  //历史记录管理
		this._cursorType = "gray";  //默认为gray
		this._items = [];
		this._activeItem = null;
		this._start = 0;
		this._end = 80;
		this._col = 4;
		this._iomode = "";  //in|out
	};
	this.create = function(parent, app){
		this._parent = parent;
		if(app) this._app = app;
		var obj = this._createElement2(parent ? parent._self : null, "div", "aui-LineEdit");
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		if(this._useInput){
			this._input = this._createElement2(null, "input", "input", {
				"type"     : "text",
				"maxLength": "78"
			});
			//if(debug) this._input.style.backgroundColor = "#444444";
			this._input.onkeydown = function(ev){
				return _this.onKeyDown1(ev || window.event, this);
			};
			this._input.onkeyup = function(){
				//_this._timer = runtime.addThread(200, this, getCursorIndex);
			};
			this._input.onkeypress = function(ev){
				return _this.onKeyPress(ev || window.event, this);
			};
			//this._input.onfocus = function(){};
			//this._input.onblur = function(){};
			this._input.ondblclick = function(){
				if(_this._timer != 0){
					window.clearTimeout(timer);
					_this._timer = 0;
				}
			};
			this._input.onclick = function(ev){
				ev = ev || window.event;
				//_this._timer = runtime.addThread(200, this, getCursorIndex);
				ev.cancelBubble = true;
			};
		}else{
			/*
			if(runtime.moz){
				document.onkeydown = function(ev){
					return _this.onKeyDown(ev || window.event, _this._self);
				};
			}else{
				this._self.onkeydown = function(ev){
					return this._ptr.onKeyDown(ev || window.event, this);
				};
			}
			*/
		}
	};
	this.reset = function(){
		this._activeItem = null;
		for(var i = 0, len = this._items.length; i < len; i++){
			this._items[i].dispose();
			this._items[i] = null;
		}
		this._items = [];
		this._col = 0;
		this.print(this._parent.getPrompt(), "sys");
		this.setIomode("in");
	};
	this.dispose = function(){
		this._activeItem = null;
		for(var i = 0, len = this._items.length; i < len; i++){
			this._items[i].dispose();
			this._items[i] = null;
		}
		this._items = [];
		this._app = null;
		if(this._useInput){
			this._input.onclick = null;
			this._input.ondblclick = null;
			//this._input.onblur = null;
			//this._input.onfocus = null;
			this._input.onkeypress = null;
			this._input.onkeyup = null;
			this._input.onkeydown = null;
			this._input = null;
		}else{
			this._self.onkeydown = null;
		}
		_super.dispose.apply(this);
	};
	this.setCursorType = function(v){
		this._cursorType = v;
	};
	this.getCursorType = function(){
		return this._cursorType;
	};
	this.getText = function(){
		var sb = [];
		for(var i = 0, len = this._items.length; i < len; i++){
			sb.push(this._items[i].getText());
		}
		return sb.join("");
	};
	this.appendItem = function(type, text){
		var item = new TextItem();
		item.create(this, type, text);
		this._items.push(item);
		this.activeItem(item);
		return item;
	};
	this.setIomode = function(v){
		var oldiomode = this._iomode;
		this._iomode = v;
		if(v == "in"){
			this.appendItem("in", "");
			this._start = this._col;
			this._parent._self.appendChild(this._self);
			this.setFocus();
		}else{  //out
			var item = this._activeItem;
			this.activeItem(null);
			if(oldiomode == "in"){
				item.update();
				var line = this._parent.insertBlankLine();
				this._activeItem = null;
				for(var i = 0, len = this._items.length; i < len; i++){
					var obj = this._items[i]._self;
					obj.parentNode.removeChild(obj);
					line.appendChild(obj);
					obj._ptr = null;
					this._items[i]._self = null;
					this._items[i].dispose();
					this._items[i] = null;
				}
				this._items = [];
			}
			this._parent._self.removeChild(this._self);
		}
		/*
		this._lineEdit.setParent(this._lastLine);
		var obj = this._lineEdit._self;
		if(!obj.parentNode){
			this._lastLine.appendChild(obj);
			this.resize();
		}
		obj = null;
		*/
	};
	this.setWidth = function(v){
		//this._input.style.width = Math.max(0, v) + "px";
	};
	this.getValue = function(){
		return this._input.value;
	};
	this.setValue = function(v){
		this._input.value = v;
	};
	this.getHistoryText = function(num){
		var text = this._history.getText(num);
		if(text){
			this._activeItem.setText(text);
			this._col = this._start + text.length;
		}
	};
	this.activeItem = function(item){
		if(this._activeItem == item) return;
		if(this._activeItem){
			this._activeItem.deactivate();
		}
		if(item){
			item.activate();
		}
		this._activeItem = item;
	};
	/*
	this.setText = function(v){
		var sb = [];
		for(var i = 0, len = this._items.length; i < len; i++){
			sb.push(this._items[i].getText());
		}
		if(v != sb.join("")) window.alert(123123);
		this._text = v;
	};
	this._formatLine = function(){
		var sb = [];
		for(var i = 0, len = this._items.length; i < len; i++){
			sb.push(this._items[i].toHTML());
		}
		return sb.join("");
	};
	this.updateLine = function(){
		this._self.innerHTML = this._formatLine();
		var sb = [];
		//sb.push("row=" + this._row);
		sb.push("col=" + this._col);
		sb.push("start=" + this._start);
		sb.push("curIndex=" + this._history._curIndex);
		sb.push("text=" + this.getText());
		window.status = sb.join(",");
	};
	*/
	this.setFocus = function(){
		if(this._useInput){
			if(!this._input.parentNode) return;
			var rng = this._input.createTextRange();
			rng.collapse(true);
			rng.moveStart('character', this._pos);
			rng.select();
			rng = null;
			runtime.addThread(0, this, function(){
				try{
					this._input.focus();
				}catch(ex){
				}
			});
		}else{
			if(!this._self.parentNode){
				this._parent._self.appendChild(this._self);
			}
			if(this._iomode == "in"){
				//try{
				//	this._self.focus();  //(通过焦点的转换,)重新定位光标的位置
				//}catch(ex){
				//}
				this._activeItem.update();
				this._parent.scrollToBottom();
			}
		}
	};
	this.getFrontText = function(){
		var s = window.document.selection.createRange();
		s.setEndPoint("StartToStart", this._input.createTextRange());
		var text = s.text;
		s = null;
		return text;
	};
	this.addInputText = function(text, value){
		//var rng = this._input.createTextRange();
		//rng.moveEnd("character");
		var rng = window.document.selection.createRange();
		if(value && value.length > 0){
			rng.moveStart("character", -value.length);
		}
		rng.text = text;
		rng = null;
	};
	this.getNumber = function(n){
		return this._number.substr(n, 1);
	};
	this.getChar = function(n){
		return this._letter.substr(n, 1);
	};
	this.isEndLine = function(row){
		//return (row == this._rows.length - 1);
		return true;
	};
	/**
	 * 往行编辑器里面打印一段文本
	 * @param str {String} 要打印的文件内容
	 * @param type {String} 文本的类型
	 *             sys 系统信息
	 *             dbg 调试信息
	 *             in  标准输入
	 *             out 标准输出
	 *             err 错误输出
	 *             log 日志信息
	 */
	this.print = function(str, type){
		if(typeof str == "undefined") window.alert(str);
		if(this._useInput){
			this._input.value = str;
		}else{
			str = str.replace(/\r?\n/g, "\n");
			if(str.indexOf("\n") == -1){
				this.printText(str, type);
			}else{
				var arr = str.split("\n");
				for(var i = 0, len = arr.length; i < len; i++){
					if(i < len - 1){
						this._parent.insertLine(arr[i], this._iomode == "in" ? this._self : null, type);
					}else{
						if(arr[i] != ""){
							this.printText(arr[i], type);
						}
					}
				}
				//this._lastLine = this.insertLine(arr[i]);
				//line.style.backgroundColor = getRandomColor();
				//line.innerHTML = runtime.encodeHTML(str);
				//this._self.insertBefore(line, _input.parentNode);
			}
		}
	};
	this.printText = function(str, type){
		this.appendItem(type, str);
		this._col += str.length;
		/*
		var span = this._createElement2(this._self, "span", type);
		span.appendChild(this._createTextNode(str));
		span = null;
		*/
	};
	this.incCol = function(n){
		if(this._col + n <= 80){
			this._col += n;
			return true;
		}else{
			return false;
		}
	};
	//插入一段不含回车符的字符串
	this.insertText = function(str){
		if(this.incCol(str.length)){
			if(this._col == this.getText().length + str.length){
				this._activeItem.appendText(str);
			}else{
				this._activeItem.appendText(str);
			}
		}
	};
	//事件处理函数
	this.onKeyPress = function(ev, sender){
		var ch = String.fromCharCode(ev.keyCode);
		var v = sender.value;
		if(ch == "\r" && this.trim(v) != ""){
			var text = v + "\n";
			sender.value = "";
			this._input.parentNode.removeChild(this._input);
			this._history.append(text);
			this.print(text, "in");
			this._parent.getCallback()(text);
		}else if(ch == "."){  //自动完成功能
			if(this._app){
				var nameChain = this._app.getNameChain(this.getFrontText());
				this._app.showFunTip(nameChain);
				//var name = nameChain || "#global";
			}
		}else if(ch == "("){  //语法提示功能
		}/*else if(ch == "\t"){
			window.alert(111);
		}*/
	};
	//使用input元素的实现
	this.onKeyDown1 = function(ev, sender){
		var redraw = true;
		var kc = ev.keyCode;
		if(this._app){
			var tip = this._app.getTip();
			if(tip && tip.getVisible()){
				return tip.onKeyDown(ev, sender);
			}
		}
		switch(kc){
		case KEY_TAB:
			this.addInputText("  ");  //'\t'
			ev.cancelBubble = true;
			return false;
		case KEY_ESC:
			this.setValue("");
			ev.cancelBubble = true;
			return false;
		case KEY_LEFT:
			break;
		case KEY_UP:
			if(this._curIndex >= 0){
				if(this._curIndex == this._historys.length){
					this.setValue(this._historys[--this._curIndex]);
				}else if(this._curIndex >= this._historys.length - 1){
					this.setValue(this._historys[--this._curIndex]);
				}else{
					this.setValue(this._historys[this._curIndex--]);
				}
			}
			break;
		case KEY_RIGHT:
			break;
		case KEY_DOWN:
			if(this._curIndex < this._historys.length - 1){
				while(this._curIndex <= -1){
					this._curIndex++;
				}
				this.setValue(this._historys[++this._curIndex]);
			}
			break;
		}
		return true;
	};
	//不使用input元素的实现
	this.onKeyDown = function(ev, sender){
		//var redraw = true;
		var ret;
		var kc = ev.keyCode;
		if(this._app){
			var tip = this._app.getTip();
			if(tip && tip.getVisible()){
				return tip.onKeyDown(ev, sender);
			}
		}
		if(kc >= KEY_CH_0 && kc <= KEY_CH_9){  //如果是数字(或相应特殊字符)
			this.insertText(this.getNumber(kc - KEY_CH_0 + (ev.shiftKey ? 10 : 0)));
		}else if(kc >= KEY_CH_A && kc <= KEY_CH_Z){  //如果是字母
			this.insertText(this.getChar(kc - KEY_CH_A + (ev.shiftKey ? 26 : 0)));
		}else if(kc == 61){
			this.insertText(ev.shiftKey ? "+" : "=");
		}else if(kc == 109){
			this.insertText(ev.shiftKey ? "_" : "-");
		}else if(kc == KEY_SEMICOLON){
			this.insertText(ev.shiftKey ? ":" : ";");
		}else if(kc >= 186 && kc <= 192){
			this.insertText((ev.shiftKey ? ":+<_>?~" : ";=,-./`").substr(kc - 186, 1));
		}else if(kc >= 219 && kc <= 222){
			this.insertText((ev.shiftKey ? "{|}\"" : "[\\]'").substr(kc - 219, 1));
		}else if(kc == KEY_TAB){
			this.insertText("\t");
		}else if(kc == KEY_SPACE){
			this.insertText(" ");
		}else{
			//redraw = this.do_control(ev);
			ret = this.do_control(ev);
		}
		if(this._col < 0){
			window.alert("Error");
		}
		//count++;
		//window.status = "Ln " + this._row + "   Col " + this._col + "|" + count;
		//if(redraw){
		//	this.drawViewPort();
		//}
		return ret || false;
	};
	this.do_control = function(ev){
		var kc = ev.keyCode;
		switch(kc){
		case KEY_ESC:
			if(this._activeItem.getText() == ""){
			}else{
				this._activeItem.setText("");
				this._col = this._start;
			}
			break;
		case KEY_ENTER:  //确定输入，而无论光标在哪里
			if(this._col > this._start){
				var text = this.getText().substr(this._start);
				this._history.append(text);
				this.setIomode("out");
				//this.print("\n", "in");
				//this._parent.insertLine(this.getText().substr(0, this._start) + text);
				this._parent.getCallback()(text + "\n");
				//this._parent.insertLine(text);
				//this.reset();
				/*
				var row = this._rows[this._row];
				var str = row._text.substr(this._col);  //保存行尾被截断的字符串
				row.setText(row._text.substring(0, this._col) + "\n");  //在此断行
				this._row++;  //指向下一行
				this.insertRow(this._row, str);  //插入一空行并赋值为上行截尾字符串
				this._col = 0;  //列定位于新行开始处
				*/
			}
			break;
		case KEY_BACKSPACE:
			if(this._col > this._start){  //如果没有在开始处
				this._activeItem.removeChar(-1);
				this._col--;
			}
			ev.returnValue = 0;  //防止chrome等浏览器的后退
			ev.cancelBubble = true;
			return false;  //阻止页面后退
		case KEY_DEL:
			if(this._col < this.getText().length){  //如果没有在行末
				this._activeItem.removeChar();
			}
			break;
		case KEY_HOME:
			this._activeItem.setCursor(0);
			this._col = this._start;
			return false;
		case KEY_END:
			this._activeItem.setCursor(this._activeItem.getTextLength());
			this._col = this.getText().length;
			return false;
		case KEY_LEFT:
			if(this._col > this._start){
				this._activeItem.setCursor(this._activeItem.getCursor() - 1);
				this._col--;
			}
			return false;
		case KEY_RIGHT:
			//if(this.isEndLine(this._row)){  //如果是最后一行的话
				if(this._col < this.getText().length){  //this._rows[this._row].getLength()
					this._activeItem.setCursor(this._activeItem.getCursor() + 1);
					this.incCol(1);
				}else{
					return;  //已在编辑文本的最末端
				}
			/*
			}else{
				if(this._col < this.getText().length - 1){  //this._rows[this._row].getLength() - 1
					this.incCol(1);
				}else{  //光标移到下一行开始
					this._col = 0;
					this._row++;
				}
			}
			*/
			return false;
		case KEY_UP:
			/*
			if(this._row > 0){
				var len = this._rows[this._row - 1].getLength();
				if(this._col > len - 1){  //如果大于上一行的长度
					this._col = len - 1;
				}
				this._row--;
				this.updateLine();
			}
			return false;
			*/
			this.getHistoryText(-1);
			break;
		case KEY_DOWN:
			/*
			if(!this.isEndLine(this._row)){  //如果不是最后一行
				var len = this._rows[this._row + 1].getLength();
				if(this.isEndLine(this._row + 1)){  //如果下一行是最后一行
					if(this._col > len - 1){
						this._col = len;
					}
				}else{
					if(this._col > len - 1){
						this._col = len - 1;  //如果大于下一行的长度
					}
				}
				this._row++;
				this.updateLine();
			}
			return false;
			*/
			this.getHistoryText(1);
			break;
		case KEY_SHIFT:
			this._selecting = true;
			this._row0 = this._row;
			this._col0 = this._col;
			return false;
		case KEY_CTRL:
			return false;
		case KEY_ALT:
			return false;
		case KEY_F1:
		case KEY_F2:
		case KEY_F3:  //!!!系统搜索键
		case KEY_F4:  //!!!Drop 地址栏
		case KEY_F5:  //!!!刷新
		case KEY_F6:  //!!!输入焦点转入地址栏
		case KEY_F7:
		case KEY_F8:
		case KEY_F9:
		case KEY_F10:
		case KEY_F11:
		case KEY_F12:  //!!!输入焦点转入菜单
			return;
		default:
			window.alert(kc);
			break;
		}
		return true;
	};
	this.onKeyUp = function(ev, sender){
	};
});
/*</file>*/
/*<file name="alz/mui/Console.js">*/
_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.LineEdit");

/**
 * 控制台组件
 */
_class("Console", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._lines = [];
		//this._lastLine = null;
		this._lineEdit = null;
		this._prompt = ">";
		this._interpret = null;
		this._callback = null;
		this._iomode = "";  //in|out
	};
	//this.build = function(parent, node){_super.build.apply(this, arguments);};
	this.create = function(parent, app){
		this._app = app;
		var obj = this._createElement2(parent, "div", "aui-Console");
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		//<div class="aui-LineEdit">&gt;<input class="input" type="text" value="" /></div>
		//this.setFont("12px 宋体");
		/*
		this._lastLine = this._createElement2("div", "aui-LineEdit", {
			"backgroundColor": "#888888",
			"innerHTML"      : encodeHTML(this._prompt)
		});
		*/
		this._lineEdit = new LineEdit();
		this._lineEdit.create(this, this._app);
		this._self.onclick = function(){
			//this.focus();
			this._ptr.activate();
		};
		this._self.onfocus = function(){
			this._ptr.activate();
		};
		this._self.onblur = function(){
			this._ptr.deactivate();
		};
		if(!runtime.ie){
			var _this = this;
			this.__onkeydown = function(ev){
				return _this._lineEdit.onKeyDown(ev || window.event, _this._lineEdit._self);
			};
			window.document.addEventListener("keydown", this.__onkeydown, false);
		}else{
			this._self.onkeydown = function(ev){
				return this._ptr._lineEdit.onKeyDown(ev || window.event, this._ptr._lineEdit._self);
			};
		}
		//this._lastLine = this._lineEdit._self;
		this._lineEdit.setIomode("out");
	};
	this.dispose = function(){
		this._interpret = null;
		if(this._lineEdit){
			this._lineEdit.dispose();
			this._lineEdit = null;
		}
		//this._lastLine = null;
		for(var i = 0, len = this._lines.length; i < len; i++){
			this._lines[i] = null;
		}
		this._lines = [];
		this._app = null;
		if(!runtime.ie){
			window.document.removeEventListener("keydown", this.__onkeydown, false);
		}else{
			this._self.onkeydown = null;
		}
		this._self.onblur = null;
		this._self.onfocus = null;
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
	this.resize = function(w, h){
		//this._lineEdit.setWidth(this._input.parentNode.offsetWidth) + "px";
		//this.print(this._self.clientWidth, "dbg");
		//var w = window.document.body.clientWidth - 14 - 100;
		//this._self.style.width = (window.document.body.clientWidth - 14) + "px";
		w = this._self.clientWidth - 14 - 8 - 20;
		this._lineEdit.setWidth(w);
	};
	this.activate = function(){
		this._lineEdit.setCursorType("");
		this._lineEdit.setFocus();
	};
	this.deactivate = function(){
		this._lineEdit.setCursorType("gray");
		this._lineEdit.setFocus();
	};
	this.getPrompt = function(){
		return this._prompt;
	};
	this.setInterpret = function(v){
		this._interpret = v;
		this.print(this._interpret.getWelcomeMessage(), "sys");
		this._prompt = this._interpret.getPrompt();
		//this.print(this._interpret.getPrompt(), "sys");
	};
	//默认的解释器接口
	this.interpret = function(text){
		this.print(text);
	};
	this.showPrompt = function(v){
		if(v){  //show
			this.start(this, function(text){
				this.interpret(text);
			});
		}else{  //hide
			//this._parent._self.focus();
			//this._lastLine.removeChild(this._lineEdit._self);
			//this._lastLine.removeChild(this._lastLine.lastChild);
		}
	};
	this.start = function(agent, fun){
		var _this = this;
		this.getLineInput(function(text){
			fun.call(agent, text);
			_this.getLineInput(arguments.callee);
		});
	};
	this.getLineInput = function(callback){
		if(callback){
			this._callback = callback;
		}
		this.resize();
		this._lineEdit.reset();
	};
	this.getLineEdit = function(){
		return this._lineEdit;
	};
	this.getCallback = function(){
		return this._callback;
	};
	this.insertBlankLine = function(){
		var line = this._createElement2(this._self, "div", "aui-LineEdit");
		this._lines.push(line);
		return line;
	};
	this.insertLine = function(text, refNode, type){
		var line = this._createElement("div");
		line.className = "aui-LineEdit";
		if(text){
			//line.innerHTML = runtime.encodeHTML(text);
			var span = this._createElement2(line, "span", type);
			span.appendChild(this._createTextNode(text));
			span = null;
		}
		if(refNode){
			this._self.insertBefore(line, refNode);
		}else{
			this._self.appendChild(line);
		}
		this._lines.push(line);
		return line;
	};
	/**
	 * 往shell文本屏幕上打印一段文本
	 * @param str {String} 要打印的文件内容
	 * @param type {String} 文本的类型
	 */
	this.print = function(str, type){
		type = type || "sys";
		if(typeof str != "string"){
			str = "" + str;
		}
		this._lineEdit.print(str, type);
	};
	//[TODO]XUL环境下不起作用
	this.scrollToBottom = function(){
		this._self.scrollTop = this._self.scrollHeight;
	};
});
/*</file>*/
/*<file name="alz/mui/BitButton.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 带图标的按钮组件
 */
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
		if(this._tip != ""){
			this._self.title = this._tip;
		}
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
		if(this._disposed) return;
		this._app = null;
		this._label = null;
		_super.dispose.apply(this);
	};
	this.setDisabled = function(v){
		_super.setDisabled.apply(this, arguments);
		this.setEnableEvent(!v);
		if(!this._disabled){
			if(v){
				this._self.style.filter = "gray";
				this._label.disabled = true;
			}else{
				this._self.style.filter = "";
				this._label.disabled = false;
			}
		}
	};
});
/*</file>*/
/*<file name="alz/mui/ToggleButton.js">*/
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
/*</file>*/
/*<file name="alz/mui/ToolBar.js">*/
_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.BitButton");
_import("alz.mui.ToggleButton");

/**
 * 工具栏组件
 */
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
				btn.init(nodes[i], this._app);  //[TODO]改用bind实现
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
/*</file>*/
/*<file name="alz/mui/ModalPanel.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 模态对话框使用的遮挡面板组件
 */
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
			this._iframe = this._createElement("iframe");
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
		this._panel = this._createElement("div");
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
		if(this._iframe){
			this._iframe.style.display = v ? "" : "none";
		}
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
/*</file>*/
/*<file name="alz/mui/Container.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 凡是具有_layout,_align属性的元素全部是该类或子类的实例
 */
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
			"x": 0,
			"y": 0,
			"w": this.getInnerWidth(),
			"h": this.getInnerHeight()
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
/*</file>*/
/*<file name="alz/mui/Panel.js">*/
_package("alz.mui");

_import("alz.mui.Container");

/**
 * 面板组件，支持布局自适应特性的面板
 */
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
/*</file>*/
/*<file name="alz/mui/Pane.js">*/
_package("alz.mui");

_import("alz.mui.Container");
//_import("alz.action.ActionElement");
_import("alz.action.FormElement");
_import("alz.action.LinkLabel");
_import("alz.action.ComboBox");
//_import("alz.action.TextField");
_import("alz.action.Button");
_import("alz.action.CheckBox");

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
					case "form":
						component = new FormElement();
						break;
					case "a":
						component = new LinkLabel();
						break;
					case "select":
						component = new ComboBox();
						break;
					case "input":
						switch(node.type){
						//case "text":
						case "button":
							component = new Button();
							break;
						case "checkbox":
							component = new CheckBox();
							break;
						default:
							continue;
						}
						//application._buttons[btn._action] = btn;
						break;
					//default:
					//	break;
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
/*</file>*/
/*<file name="alz/mui/Workspace.js">*/
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
		if(this._self.tagName == "BODY" && (name == "width" || name == "height")){
			return;  //忽略对 style 属性 width,height 的设置
		}
		_super.setStyleProperty.apply(this, arguments);
	};
	this.resize = function(w, h){
		_super.resize.call(this, w, h);
		if(this._modalPanel && this._modalPanel.getVisible()){
			this._modalPanel.resize(w, h);  //调整模态面板的大小
		}
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
	this.onMouseUp = function(ev){
	};
	/**
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
			//window.alert("&&&&" + this._fixedX + "," + this._fixedY);
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
			//window.alert((pos.x + ev.offsetX) + "," + (pos.y + ev.offsetY) + "|" + ev.clientX + "," + ev.clientY);
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
			if(ev.srcElement != this._fixedOff.o || ev.offsetX != this._fixedOff.ev_offsetX || ev.offsetY != this._fixedOff.ev_offsetY){
				window.alert("[Workspace::_mousemoveForFixed]fixing unexpect");
			}
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
			var off = {x:0,y:0};
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
	};
});
/*</file>*/
/*<file name="alz/mui/DropDown.js">*/
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
				window.alert((ev.srcElement || ev.target).innerHTML);
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
/*</file>*/
/*<file name="alz/mui/Popup.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 弹出式组件
 */
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
/*</file>*/
/*<file name="alz/mui/ListItem.js">*/
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
		//window.alert(this._self.firstChild.nodeType);
		this._self.style.verticalAlign = "middle";
		this._self.onselectstart = function(ev){return false;};
		var text = this._self.removeChild(this._self.firstChild);
		var size = runtime.getTextSize(text.data, "12px 宋体");
		this._icon = this._createElement2(this._self, "img", "", {
			"src"           : "skin/Icon_delete.gif",
			"border"        : "0px",
			"width"         : "16px",
			"height"        : "15px",
			"verticalAlign" : "middle"
		});
		this._label = this._createElement2(this._self, "label", "", {
			"backgroundColor": "#CCCCCC",
			"width"          : (size.w + 10) + "px",
		//"height"         : (size.h + 2) + "px",
		//"padding"        : "1px",
			"textAlign"      : "center",
			"lineHeight"     : "100%"
		});
		this._label.appendChild(text);
	};
	//this.bind = function(obj){};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._label = null;
		this._icon = null;
		this._self.onselectstart = null;
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/mui/Dialog.js">*/
_package("alz.mui");

_import("alz.mui.Component");

_class("Dialog", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
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
		//this._skin = this._createElement("div");
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
				//this.src = runtime.pathAui + "lib/images/AWindow_closedown.gif";
				this.style.backgroundPosition = "-48px -14px";
				if(runtime.ie) this.setCapture();
				this.onMouseMove = function(ev){
					ev = ev || this._dlg._win.event;
					var target = ev.srcElement || ev.target;
					if(target == this){
						//this.src = runtime.pathAui + "lib/images/AWindow_closedown.gif";
						this.style.backgroundPosition = "-48px -14px";
					}else{
						//this.src = runtime.pathAui + "lib/images/AWindow_closeup.gif";
						this.style.backgroundPosition = "-48px 0px";
					}
				};
				this.onMouseUp = function(ev){
					ev = ev || this._dlg._win.event;
					var target = ev.srcElement || ev.target;
					//this.src = runtime.pathAui + "lib/images/AWindow_closeup.gif";
					this.style.backgroundPosition = "-48px 0px";
					this.onMouseMove = null;
					this.onMouseUp = null;
					if(runtime.ie){
						this.releaseCapture();
					}
					if(target == this){
						this._dlg.close();  //关闭对话框
					}
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
		this._app = null;
		_super.dispose.apply(this);
	};
	this.setApp = function(v){
		this._app = v;
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
		if(this._modal){
			this.showModal(false);
		}else{
			this.setVisible(false);
		}
	};
	this._createBorders = function(){
		this._borders = [];
		var cursors = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
		for(var i = 0, len = cursors.length; i < len; i++){
			var o = this._createElement2(this._self, "div", "", {
				"position": "absolute",
				"overflow": "hidden",
				"zIndex"  : 3,
				"cursor"  : cursors[i] + "-resize"
			});
			//if(i % 2 == 0) o.style.backgroundColor = "red";
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
		//window.alert(runtime.getBoxModel() + "|" + runtime.ie + "|" + runtime.tt + "|" + this._borderLeftWidth);
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
			if(runtime._workspace._mousemoveForFixed){
				runtime._workspace._mousemoveForFixed(this, ev);
			}
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
/*</file>*/
/*<file name="alz/mui/TabPage.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 选项卡组件
 */
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
		this._head = this._createElement2(this._self, "div", "mui-TabPage-Head");
		this._body = this._createElement2(this._self, "div", "mui-TabPage-Body");
		this._body.innerHTML =
				'<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#869FA1"><tbody></tbody></table>'
			+ '<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#869FA1"><tbody></tbody></table>'
			+ '<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#FFCCB4"><tbody></tbody></table>'
			+ '<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#0A0064"><tbody></tbody></table>';
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
/*</file>*/
/*<file name="alz/mui/WindowSkinWINXP.js">*/
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
/*</file>*/
/*<file name="alz/mui/WindowSkinWIN2K.js">*/
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
/*</file>*/
/*<file name="alz/mui/SysBtn.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 窗体组件上的系统按钮组件
 */
_class("SysBtn", Component, function(_super){
	//#_interface("IActionSource");
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
		this._self.onclick = function(ev){
		};
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
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
	this.onMouseDown = function(ev){
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
		if(runtime._host.env == "ie"){
			body.releaseCapture();
		}
		body = null;
		*/
	};
});
/*</file>*/
/*<file name="alz/mui/Window.js">*/
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
	var TPL_WIN = '<div id="win2" class="mui-Window-win2k" _icon="images/win-icon.gif" _caption="alzui调试器 - Windown 2000" _align="none">'
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
		var obj = runtime.createDomElement(TPL_WIN);
		if(parent){
			parent.appendChild(obj);
		}
		this.init(obj);
		return obj;
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
	/*this.xquery = function(xpath){
		return runtime.selector.query(xpath, this._self);
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
/*</file>*/
/*<file name="alz/core/WebRuntime_ui.js">*/
_package("alz.core");

_import("alz.core.ActionManager");
_import("alz.mui.ToggleManager");
_import("alz.mui.Workspace");
_import("alz.mui.Dialog");

_extension("WebRuntime", function(){  //注册 WebRuntime 扩展
	this._init = function(){  //加载之后的初始化工作
		this._domTemp = null;
		this.toggleMgr = new ToggleManager();
		//this.actionManager = new ActionManager();
		this._workspace = new Workspace();
		if(this._newWorkspace){
			this._workspace.create(this.getBody());
		}else{
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
				var div = this._createElement2(null, "div", "", {
					"borderBottom": "1px solid #CCCCCC",
					"innerHTML"   : msg
				});
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
		//if(this.ff){}
		rect.w = Math.max(element.clientWidth, element.parentNode.clientWidth);
		rect.h = Math.max(element.clientHeight, element.parentNode.clientHeight);
		return rect;
	};
	this.onResize = function(){
		var rect = this.getViewPort(this.getBody());  //this._workspace.getViewPort()
		if(this._workspace){
			this._workspace.resize(rect.w, rect.h);
		}
		if(typeof app_onResize != "undefined"){  //提前触发应用的resize事件
			app_onResize(rect.w, rect.h);
		}
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
		var obj = typeof id == "string" ? this.getElement(id) : id;
		if(!obj) throw "未找到指定id的DOM元素";
		if(!obj._ptr){
			var className, aui;
			var sAui = obj.getAttribute("aui");
			if(sAui != "-"){
				aui = eval("(" + sAui + ")");
				if(aui.tag){
					className = aui.tag;
				}else{
					className = obj.getAttribute("tag");
					if(!className){
						className = "Component";
						//throw "找到的DOM元素没有tag属性，不能绑定脚本组件";
					}else{
						this._win.alert("使用DOM元素的tag属性决定组件类型");
					}
				}
			}
			if(!className){
				className = "Component";  //默认值
			}
			var c = new alz[className]();
			//c._domCreate = true;
			if(aui){
				c.setJsonData(aui);
			}
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
				var node = nodes[j];
				if(node.nodeType == 1 && node.getAttribute("aui")){  //NODE_ELEMENT
					this.initComponent(c, node, true);
				}
				node = null;
			}
			nodes = null;
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
/*</file>*/

runtime.regLib("ui", function(){  //加载之后的初始化工作

});

}})(this);