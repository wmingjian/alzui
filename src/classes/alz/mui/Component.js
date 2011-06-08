_package("alz.mui");

_import("alz.core.EventTarget");

/**
 * UI组件应该实现BoxElement的接口
 * @class Component
 * @extends alz.core.EventTarget
 * @desc ss
 */
_class("Component", EventTarget, function(){
	/*
	 0 : obj[k] = v;
	 1 : obj.setAttribute(k, v);
	 2 : obj.style[k] = v;
	*/
	var ATTR = function(arr){
		var hash = {};
		for(var i = 0, len = arr.length; i < len; i++){
			var a = arr[i].split(",");
			for(var j = 0, len1 = a.length; j < len1; j++){
				hash[a[j]] = i;
			}
		}
		return hash;
	}([
		/*0*/"href,htmlFor,id,name,innerHTML,onclick,ondragstart,onmousedown,tabIndex,title,type,maxLength,cellPadding,cellSpacing",
		/*1*/"value,nowrap,src,unselectable,_action,_action1,_align,_fid,_layout,_name,_position,_showArrow,_needSel,scrolling,frameBorder,frameSpacing",
		/*2*/"backgroundColor,backgroundPosition,backgroundRepeat,border,borderBottom,color,cursor,display,filter,font,fontWeight,fontFamily,fontSize,height,left,lineHeight,overflow,overflowX,padding,position,styleFloat,textAlign,top,whiteSpace,width,verticalAlign,zIndex,tableLayout,zoom"
	]);
	this._init = function(){
		_super._init.call(this);
		//runtime._components.push(this);
		this._tag = "Component";
		this._domCreate = false;
		this._domBuildType = 0;  //0=create,1=bind,2=build(xml),3=build(json),4=build(format text)
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
		this._dockRect = {"x": 0, "y": 0, "w": 0, "h": 0};  //停靠以后组件的位置信息
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
	/**
	 * @method toString
	 * @return {String}
	 * @desc 重写的toString()方法，形式为{tag:类名, align:对齐方式}
	 */
	this.toString = function(){
		return "{tag:'" + this._className + "',align:'" + this._align + "'}";
	};
	/**
	 * @method setParent2
	 * @param {Document} parent document对象
	 * @desc 初始化window，document等环境
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
	/**
	 * @method getDoc
	 * @return {Document}
	 * @desc 获取document对象
	 */
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
			(parent._self || parent).appendChild(obj);
		}
		return obj;
	};
	this._renderElement = function(parent, obj){
		if(parent.getContainer){
			parent = parent.getContainer();
		}
		if(this.__insert){
			parent.insertBefore(obj, this.__insert);
		}else{
			parent.appendChild(obj);
		}
	};
	this.createDomElement = function(parent, html, exp){
		var obj = runtime.createDomElement(html, exp);
		if(parent){
			this._renderElement(parent, obj);
		}
		return obj;
	};
	/**
	 * @method parseNum
	 * @param {String} v
	 * @return {Number}
	 * @desc 把 v 转换成十进制表示的数字
	 */
	this.parseNum = function(tag, v){
		return this._dom.parseNum(tag, v);
	};
	this.getPropertyValue = function(style, name){
		return this._dom.getPropertyValue(style, name);
	};
	/**
	 * @method bind
	 * @param {Element} obj
	 * @desc 调用该方法初始化的组件的所有属性从DOM元素中动态获取
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
					"x": this._left,
					"y": this._top,
					"w": this._width,
					"h": this._height
				};
			}
		}
		this.__init(obj, 1);
	};
	/**
	 * @method create
	 * @param {Element} parent
	 * @return {Element}
	 * @desc 创建一个 parent 容器的子元素
	 */
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
	/**
	 * @method init
	 * @param {Element} obj
	 * @desc 以create方式初始化一个DOM元素
	 */
	this.init = function(obj){
		//_super.init.apply(this, arguments);
		this.__init(obj, 0);
		//runtime.actionManager.add(this);
		//this.setVisible(this._visible);
	};
	/**
	 * @method dispose
	 * @desc 析构方法
	 */
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
	this.query = function(xpath/*, context*/){
		/*
		context = context || this._self;
		if(context == null){
			runtime.error("[Component::query]context is null!");
		}
		*/
		if(runtime.ie){
			return runtime._xpq.query(xpath, this._self);
		}else{
			return this._self.querySelectorAll(xpath);
		}
	};
	this.find = function(xpath/*, context*/){
		//return this.query(xpath, context)[0];
		if(runtime.ie){
			return runtime._xpq.query(xpath, this._self)[0];
		}else{
			return this._self.querySelector(xpath);
		}
	};
	this.setData = function(v){
		this._data = v;
	};
	/**
	 * @method getElement
	 * @return {Element}
	 * @desc 获取组件关联的DOM元素
	 */
	this.getElement = function(){
		return this._self;
	};
	this.getContainer = function(){
		return this._containerNode;
	};
	/**
	 * @method getData
	 * @return {Object}
	 * @desc 获取节点的json数据
	 */
	this.getData = function(){
		return this._data;
	};
	/**
	 * @method setJsonData
	 * @param {Object} v
	 * @desc 设置节点的json数据
	 */
	this.setJsonData = function(v){
		this._jsonData = v;
	};
	/**
	 * @method setParent
	 * @param {Element} v 父容器
	 * @param {Element} obj 插入的元素
	 * @desc 把 obj 插入 v 中，如果obj之前已被加入DOM树，先进行移除。
	 */
	this.setParent = function(v, obj){
		if(!v) v = runtime._workspace;  //obj.parentNode
		//this._parent = v;
		_super.setParent.apply(this, arguments);
		if(obj){
			var parent = v._self ? v : (
				v._ptr ? v._ptr : (
					v === this.getDoc().body ? {"_containerNode": v} : null
				)
			);
			if(!parent) throw "找不到父组件的 DOM 元素";
			if(obj.parentNode){
				obj.parentNode.removeChild(obj);
			}
			parent._containerNode.appendChild(obj);
		}
	};
	/**
	 * @method getOwner
	 * @return {Component}
	 * @desc ???
	 */
	this.getOwner = function(){
		return this._owner;
	};
	/**
	 * @method setOwner
	 * @return {Component} v
	 * @desc ???
	 */
	this.setOwner = function(v){
		this._owner = v;
	};
	/**
	 * @method setStyleProperty
	 * @param {Strinng} name 样式名称
	 * @param {Object} value 样式值
	 * @desc  设置组件所关联的DOM元素的 name 样式值
	 */
	this.setStyleProperty = function(name, value){
		try{
			if(this._self){
				this._self.style[name] = value;
			}
		}catch(ex){
			window.alert(ex.description + "\n" + name + "=" + value);
		}
	};
	/**
	 * @method setAttribute
	 * @param {Element} el DOM元素
	 * @param {Object} hash 属性哈希表
	 * @desc  批量设置 el 的属性
	 */
	this.setAttribute = function(el, hash){
		for(var attr in hash){
			el.setAttribute(attr,hash[attr]);
		}
		return el;
	};
	/**
	 * @method getAlign
	 * @return {String}
	 * @desc  获取组件的对齐方式
	 */
	this.getAlign = function(){
		return this._align;
	};
	/**
	 * @method getLeft
	 * @return {Number}
	 * @desc  获取组件的x坐标
	 */
	this.getLeft = function(){
		return this._left;
	};
	/**
	 * @method setLeft
	 * @param {Number} v
	 * @desc  设置组件的x坐标
	 */
	this.setLeft = function(v){
		this._left = v;
		//v += this._paddingLeft;
		this.setStyleProperty("left", v + "px");
		if(this._myLayer){
			this._myLayer.style.left = v + "px";
		}
	};
	/**
	 * @method getTop
	 * @return {Number}
	 * @desc  获取组件的y坐标
	 */
	this.getTop = function(){
		return this._top;
	};
	/**
	 * @method setTop
	 * @param {Number} v
	 * @desc  设置组件的y坐标
	 */
	this.setTop = function(v){
		this._top = v;
		//v += this._paddingTop;
		this.setStyleProperty("top", v + "px");
		if(this._myLayer){
			this._myLayer.style.top = v + "px";
		}
	};
	/**
	 * @method getInnerWidth
	 * @param {Number} v 宽度值[可选]
	 * @return {Number}
	 * @desc  获取组件的可见宽度
	 */
	this.getInnerWidth = function(v){
		if(!v) v = this._width;
		return Math.max(0, v - this._borderLeftWidth - this._borderRightWidth - this._paddingLeft - this._paddingRight);
		//return Math.max(0, runtime.getBoxModel() == 0 ? v : v - this._borderLeftWidth - this._borderRightWidth - this._paddingLeft - this._paddingRight);
	};
	/**
	 * @method getInnerHeight
	 * @param {Number} v 高度值[可选]
	 * @return {Number}
	 * @desc  获取组件的可见高度
	 */
	this.getInnerHeight = function(v){
		if(!v) v = this._height;
		return Math.max(0, v - this._borderTopWidth - this._borderBottomWidth - this._paddingTop - this._paddingBottom);
		//return Math.max(0, runtime.getBoxModel() == 0 ? v : v - this._borderTopWidth - this._borderBottomWidth - this._paddingTop - this._paddingBottom);
	};
	/**
	 * @method getWidth
	 * @return {Number}
	 * @desc  获取组件的宽度
	 */
	this.getWidth = function(){
		return this._width;
	};
	/**
	 * @method setWidth
	 * @param {Number} v 宽度值
	 * @desc  设置组件的宽度
	 */
	this.setWidth = function(v){
		v = Math.max(v, 0);
		this._width = v;
		if(this._dockRect.w == 0) this._dockRect.w = v;
		var w = this.getInnerWidth(v);
		this._setWidth(w);
	};
	/**
	 * @method getHeight
	 * @return {Number}
	 * @desc  获取组件的高度
	 */
	this.getHeight = function(){
		return this._height;
	};
	/**
	 * @method setHeight
	 * @param {Number} v 宽度值
	 * @desc  设置组件的高度
	 */
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
	/**
	 * @method setBgColor
	 * @param {String} v 背景色
	 * @desc  设置组件的背景色
	 */
	this.setBgColor = function(v){
		this.setStyleProperty("backgroundColor", v);
	};
	/**
	 * @method getVisible
	 * @return {Boolean}
	 * @desc  组件是否可见
	 */
	this.getVisible = function(){
		return this._visible;
	};
	/**
	 * @method setVisible
	 * @param {Boolean} v
	 * @desc  设置组件是否可见
	 */
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
	/**
	 * @method getZIndex
	 * @return {Number}
	 * @desc  获取组件的z坐标
	 */
	this.getZIndex = function(){
		return this._zIndex;
	};
	/**
	 * @method setZIndex
	 * @param {Number} zIndex
	 * @desc  设置组件的z坐标，大值会遮挡小值
	 */
	this.setZIndex = function(zIndex){
		this._zIndex = zIndex;
		this.setStyleProperty("zIndex", zIndex);
	};
	/**
	 * @method getOpacity
	 * @return {Number}
	 * @desc  获取组件的不透明度
	 */
	this.getOpacity = function(){
		return this._opacity;
	};
	/**
	 * @method setOpacity
	 * @param {Number} v
	 * @desc  设置组件的不透明度，可用值为0-1
	 */
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
	/**
	 * @method getCapture
	 * @return {Boolean}
	 * @desc  ??
	 */
	this.getCapture = function(){
		return this._capture;
	};
	/**
	 * @method setCapture
	 * @param {Boolean} bCapture
	 * @desc  ??
	 */
	this.setCapture = function(bCapture){  //设置为事件焦点组件
		this._capture = bCapture;
		runtime._workspace.setCaptureComponent(bCapture ? this : null);
		//this.getContext().getGuiManager().setCaptureComponent(bCapture ? this : null);
	};
	/**
	 * @method resize
	 * @param {Number} w
	 * @param {Number} h
	 * @desc  重置组件大小
	 */
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
	/**
	 * @method getViewPort
	 * @return {Object}
	 * @desc   获取组件的矩形信息，包括x，y，宽度和高度等。
	 */
	this.getViewPort = function(){
		return {
			"x": this._self.scrollLeft,
			"y": this._self.scrollTop,
			"w": this._self.clientWidth,  //Math.max(this._self.clientWidth || this._self.scrollWidth)
			"h": Math.max(this._self.clientHeight, this._self.parentNode.clientHeight)  //Math.max(this._self.clientHeight || this._self.scrollHeight)
		};
	};
	/**
	 * @method moveTo
	 * @param {Number} x x坐标
	 * @param {Number} y y坐标
	 * @desc   把组件移动到(x, y)位置
	 */
	this.moveTo = function(x, y){
		this.setLeft(x);
		this.setTop(y);
	};
	/**
	 * @method moveToCenter
	 * @desc   把组件移动到父容器的中心位置
	 */
	this.moveToCenter = function(){
		var rect = this._parent.getViewPort
			? this._parent.getViewPort()
			: runtime._workspace.getViewPort();
		var dw = this.getWidth() || this._self.offsetWidth;
		var dh = this.getHeight() || this._self.offsetHeight;
		this.moveTo(
			rect.x + Math.round((rect.w - dw) / 2),
			rect.y + Math.round((rect.h - dh) / 2)
		);
	};
	/**
	 * @method getPosition
	 * @param {Event} ev 事件对象
	 * @param {Number} type 事件类型
	 * @return {Object}
	 * @desc   获得事件的全局坐标位置
	 */
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
	/**
	 * @method showModal
	 * @param {Boolean} v 是否显示遮罩
	 * @desc   是否显示遮罩
	 */
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
	/**
	 * @method setElementRect
	 * @param {Element} obj DOM元素
	 * @param {Number} x x坐标
	 * @param {Number} y y坐标
	 * @param {Number} w 宽度
	 * @param {Number} h 高度
	 * @param {String} bg 背景
	 * @desc   设置 obj 的矩形信息
	 */
	this.setElementRect = function(obj, x, y, w, h, bg){
		obj.style.left   = x + "px";
		obj.style.top    = y + "px";
		obj.style.width  = w + "px";
		obj.style.height = h + "px";
	};
	/**
	 * @method setState
	 * @param {String} v 状态类型
	 * @desc   设置状态类型，比如error状态
	 */
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
	/**
	 * @method applyCssStyle
	 * @param {Element} el DOM元素
	 * @param {Object} css 样式信息
	 * @param {String} className class名称
	 * @desc   为 el 应用传入的样式
	 */
	this.applyCssStyle = function(el, css, className){
		var style = css[(el.className == "error" ? "error-" : "") + className];
		for(var k in style){
			if(k.charAt(0) == "_"){
				var obj = el.getElementsByTagName(k.substr(1))[0];
				for(var key in style[k]){
					var name = this._cssKeyToJsKey(key);
					if(obj.style[name] != style[k][key]){
						obj.style[name] = style[k][key];
					}
				}
				obj = null;
			}else{
				var name = this._cssKeyToJsKey(k);
				if(el.style[name] != style[k]){
					el.style[name] = style[k];
				}
			}
		}
	};
	/**
	 * @method hasClass
	 * @param {String} cls class名称
	 * @return {Boolean}
	 * @desc   与组件关联的DOM元素是否有指定的className
	 */
	this.hasClass = function(cls){
		return this._dom.hasClass(this._self, cls);
	};
	/**
	 * @method addClass
	 * @param {String} cls class名称
	 * @return {String}
	 * @desc   为该组件关联的DOM元素添加className
	 */
	this.addClass = function(cls){
		return this._dom.addClass(this._self, cls);
	};
	/**
	 * @method removeClass
	 * @param {String} cls class名称
	 * @return {String}
	 * @desc   为该组件关联的DOM元素删除className
	 */
	this.removeClass = function(cls){
		return this._dom.removeClass(this._self, cls);
	};
	/**
	 * @method show
	 * @param {Boolean} useVisibility 是否使用visibility
	 * @desc   显示该组件
	 */
	this.show = function(useVisibility){
		this._dom.show(this._self, useVisibility);
	};
	/**
	 * @method hide
	 * @param {Boolean} useVisibility 是否使用visibility
	 * @desc   隐藏该组件
	 */
	this.hide = function(useVisibility){
		this._dom.hide(this._self, useVisibility);
	};
	/**
	 * @method getControl
	 * @param {Element} el DOM元素
	 * @return {Component}
	 * @desc   通过判断是否绑定有 js 组件对象来确定UI组件
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
	/**
	 * @method dispatchEvent
	 * @param {String} name 事件名(不包括on)
	 * @param {Array} params 参数列表
	 * @desc  触发事件
	 */
	this.dispatchEvent = function(name, params){
		var type = "on" + name;
		if(type in this && typeof this[type] == "function"){
			this[type].apply(this, params);
		}
	};
});