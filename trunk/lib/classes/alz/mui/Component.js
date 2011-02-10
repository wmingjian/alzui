_package("alz.mui");

_import("alz.core.EventTarget");

/**
 * UI组件应该实现BoxElement的接口
 */
_class("Component", EventTarget, function(){
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
		"fontFamily"      : 2,
		"fontSize"        : 2,
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
		this._win = null;  //runtime.getWindow();
		this._doc = null;  //runtime.getDocument();  //this._win.document
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
	/**
	 * 初始化window,document等环境
	 */
	this.setParent2 = function(parent){
		if(parent){
			this._parent = parent;
			if(parent.ownerDocument){
				this._doc = parent.ownerDocument;
			}else if(parent._self){
				this._doc = parent._self.ownerDocument;
			}
		}
		if(!this._doc){
			window.alert("[Component::setParent2]未能正确识别DocEnv环境，默认使用runtime.getDocument()");
			this._doc = runtime.getDocument();  //this._win.document
		}
		this._win = this._doc.parentWindow || this._doc.defaultView;  //runtime.getWindow();
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
		this.setParent2(obj.parentNode);
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
	this.create = function(parent){
		this.setParent2(parent);
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
	this.destroy = function(){
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
	/*
	this.resizeTo = function(w, h){
		if(this._self){
			this._self.style.width = Math.max(w, 0) + "px";
			this._self.style.height = Math.max(h, 0) + "px";
		}
	};
	*/
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