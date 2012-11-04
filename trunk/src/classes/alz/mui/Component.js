_package("alz.mui");

_import("alz.core.EventTarget");
_import("alz.mui.IBoxModel");
_import("alz.mui.IDesignable");

/**
 * UI组件应该实现BoxElement的接口
 * @class Component
 * @extends alz.core.EventTarget
 * @desc ss
 */
_class("Component", EventTarget, function(){
	_implements(this, IBoxModel/*, IDesignable*/);
	/*
	 0 : el[k] = v;
	 1 : el.setAttribute(k, v);
	 2 : el.style[k] = v;
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
	this._cursors = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
	this._init = function(){
		_super._init.call(this);
		//console.log("new " + this._className);
		this._tag = "Component";
		this._domCreate = false;
		/*
		 * 创建方式
		 * 0 = create
		 * 1 = bind
		 * 2 = build(xml)
		 * 3 = build(json)
		 * 4 = build(format text)
		 */
		this._domBuildType = 0;
		this._win = null;  //runtime.getWindow();
		this._doc = null;  //runtime.getDocument();  //this._win.document
		this._dom = runtime.getDom();
		//this._parent = null;
		this._owner = null;
		//this._id = null;
		this._tagName = "div";
		this._tplel = null;
		this._self = null;  //组件所关联的DOM元素
		this._containerNode = null;
		this._jsonData = null;
		this._data = null;  //结点的json数据
		this._attributes = {};  //纯字符串的属性值
		this._propertys = {};   //具体类型的属性值

		//盒模型相关属性

		this._align = "none";
		this._dockRect = {"x": 0, "y": 0, "w": 0, "h": 0};  //停靠以后组件的位置信息
		this._visible = null;  //false(boolean)
		this._zIndex = 0;
		this._opacity = 0;
		this._position = "";  //"relative"
		this._modal = false;
		this._ee = {};
		this._cssName = "";  //组件自身的DOM元素的className的替代名称
		this._xpath = "";
		this._state = "normal";
		/*
		UI组件插件
		key    名字   影响属性
		box    盒模型 left,top,width,height,margin*,border*,padding*
		action 动作   _action
		layout 布局   position,overflow,float,(box)
		align  停靠   (box)
		effect 效果   background,text,font
		*/
		this._plugins = {};
		//组件状态
		this._destroyed = false;  //是否已销毁
		//this._disposed = false;   //是否已部署
		this._created = false;    //是否已创建
		this._inited = false;     //是否已初始化
	};
	this.build = function(el){
		el._component = this;
		this._tplel = el;
		this._self = el._self;
		this._self._ptr = this;
		this._containerNode = el._container;
		/*
		var attributes = el._attributes;
		if(attributes.id){
			this._self.setAttribute("id", attributes.id);
		}
		if(attributes["class"]){
			runtime.dom.addClass(this._containerNode, attributes["class"]);
		}
		if(attributes.size){
			this.setSize(attributes.size);
		}
		*/
	};
	/**
	 * @method bind
	 * @param {Element} el
	 * @desc 调用该方法初始化的组件的所有属性从DOM元素中动态获取
	 * 设计该方法的思想和 init 方法完全相反，init方法从脚本组件角度考虑问题，bind
	 * 方法从 DOM 元素角度考虑问题。
	 */
	this.bind = function(el){
		this.setParent2(el.parentNode);
		var style = this._dom.getStyle(el);
		//if(this._className == "DlgPageTool") window.alert("123");

		//调用一遍实现的接口
		var imps = this.__cls__._imps;
		for(var i = 0, len = imps.length; i < len; i++){
			imps[i].init.call(this, el, style);  //执行接口的init方法
		}

		this._position = this.getPropertyValue(style, "position");
		this._visible = this.getPropertyValue(style, "display") != "none";
		if(this._jsonData){  //_jsonData 优先级最高
			for(var k in this._jsonData){
				if(this._jsonData[k]){
					this["_" + k] = this._jsonData[k];
				}
			}
			if(this._align != "none"){
				this._position = "absolute";
				this._dockRect.x = this._left;
				this._dockRect.y = this._top;
				this._dockRect.w = this._width;
				this._dockRect.h = this._height;
			}
		}
		this.__init(el, 1);
	};
	/**
	 * @method create
	 * @param {Element} parent
	 * @return {Element}
	 * @desc 创建一个 parent 容器的子元素
	 */
	this.create = function(parent){
		this.setParent2(parent);
		var el = this._createElement(this._tagName || "div");
		if(parent) this.setParent(parent, el);
		this.init(el);
		return el;
	};
	this.__init = function(el, domBuildType){
		if(this._parent && this._parent.add){  //容器类实例有该方法
			this._parent.add(this);
		}
		this._domBuildType = domBuildType;
		el._ptr = this;
		this._self = el;
		this._containerNode = el;  //基础组件默认_self就是具体的容器节点
		//this._self._ptr = this;
		//this._id = "__dlg__" + Math.round(10000 * Math.random());
		//this._self.id = this._id;
		if(this._position){
			this._self.style.position = this._position;
		}
	};
	/**
	 * @method init
	 * @param {Element} el
	 * @desc 以create方式初始化一个DOM元素
	 */
	this.init = function(el){
		if(this._inited){
			if(this._self !== el){
				console.log("[Component::init]error");
			}else{
				console.log("[Component::init]repeated");
			}
			return;
		}
		//_super.init.apply(this, arguments);
		this.__init(el, 0);
		//runtime.actionManager.add(this);
		//this.setVisible(this._visible);
		this._inited = true;
	};
	this.rendered = function(){
	};
	/**
	 * @method dispose
	 * @desc 析构方法
	 */
	this.dispose = function(){
		if(this._disposed) return;
		for(var k in this._plugins){
			this._plugins[k].dispose();
			delete this._plugins[k];
		}
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
		this._tplel = null;
		this._owner = null;
		//this._parent = null;
		this._dom = null;
		this._doc = null;
		this._win = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * @method toString
	 * @return {String}
	 * @desc 重写的toString()方法，形式为{tag:类名, align:对齐方式}
	 */
	this.toString = function(){
		return "{tag:'" + this._className + "'}";  //,align:'" + this._align + "'
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
			console.error("[Component::setParent2]未能正确识别DocEnv环境，默认使用runtime.getDocument()");
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
			//this.initDocEnv(this._self/*, this._parent*/);
			this._doc = this._self.ownerDocument;
			this._win = this._doc.parentWindow || this._doc.defaultView;
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
		var el = this._createElement(tag);
		if(cls){
			el.className = cls;
		}
		if(style){
			for(var k in style){
				//if(k.charAt(0) == "_") 1;
				switch(ATTR[k]){
				case 0: el[k] = style[k];break;
				case 1: el.setAttribute(k, style[k]);break;
				case 2: el.style[k] = style[k];break;
				}
			}
		}
		if(parent){
			(parent._self || parent).appendChild(el);
		}
		return el;
	};
	this._renderElement = function(parent, el){
		if(parent.getContainer){
			parent = parent.getContainer();
		}
		if(this.__insert){
			parent.insertBefore(el, this.__insert);
		}else{
			parent.appendChild(el);
		}
	};
	this.createDomElement = function(parent, html, exp){
		var el = runtime.createDomElement(html, exp);
		if(parent){
			this._renderElement(parent, el);
		}
		return el;
	};
	/**
	 * @method parseNum
	 * @param {String} v
	 * @return {Number}
	 * @desc 把 v 转换成十进制表示的数字
	 */
	this.parseNum = function(v){  //(tag, v)
		return this._dom.parseNum(/*tag, */v);
	};
	this.getPropertyValue = function(style, name){
		return this._dom.getPropertyValue(style, name);
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
	 * @param {Element} el 插入的元素
	 * @desc 把 el 插入 v 中，如果 el 之前已被加入DOM树，先进行移除。
	 */
	this.setParent = function(v, el){
		if(!v) v = runtime._workspace;  //el.parentNode
		//this._parent = v;
		_super.setParent.apply(this, arguments);
		if(el){
			var parent = v._self ? v : (
				v._ptr ? v._ptr : (
					v === this.getDoc().body ? {"_containerNode": v} : null
				)
			);
			if(!parent) throw "找不到父组件的 DOM 元素";
			if(el.parentNode){
				el.parentNode.removeChild(el);
			}
			parent._containerNode.appendChild(el);
		}
	};
	/**
	 * @method getOwner
	 * @return {Component}
	 * @desc 获取组件所有者
	 */
	this.getOwner = function(){
		return this._owner;
	};
	/**
	 * @method setOwner
	 * @return {Component} v
	 * @desc 设置组件所有者
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
			window.alert(ex.message + "\n" + name + "=" + value);
		}
	};
	/**
	 * @method setAttribute
	 * @param {Element} el DOM元素
	 * @param {Object} attributes 属性哈希表
	 * @desc  批量设置 el 的属性
	 */
	this.setAttribute = function(el, attributes){
		for(var attr in attributes){
			el.setAttribute(attr, attributes[attr]);
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
	 * @desc  获取组件是否已经捕获焦点属性
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
		var el = ev.srcElement || ev.target;
		while(el && el != refElement){
			pos.x += el.offsetLeft;
			pos.y += el.offsetTop;
			el = el.offsetParent;
		}
		return pos;
	};
	/**
	 * 显示模态组件(对话框)
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
	};
	/**
	 * @method setElementRect
	 * @param {Element} el DOM元素
	 * @param {Number} x x坐标
	 * @param {Number} y y坐标
	 * @param {Number} w 宽度
	 * @param {Number} h 高度
	 * @param {String} bg 背景
	 * @desc   设置 el 的矩形信息
	 */
	this.setElementRect = function(el, x, y, w, h, bg){
		el.style.left   = x + "px";
		el.style.top    = y + "px";
		el.style.width  = w + "px";
		el.style.height = h + "px";
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
				var el = el.getElementsByTagName(k.substr(1))[0];
				for(var key in style[k]){
					var name = this._cssKeyToJsKey(key);
					if(el.style[name] != style[k][key]){
						el.style[name] = style[k][key];
					}
				}
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
	//事件绑定接口
	this.addListener = function(el, type, agent, func){
		runtime._eventManager.addListener(el, type, agent, func);
	};
	this.removeListener = function(el, type){
		runtime._eventManager.removeListener(el, type);
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
	this.setSize = function(v){
		var s = v.split(",");
		this._self.style.width = s[0] + "px";
		this._self.style.height = s[1] + "px";
	};
});