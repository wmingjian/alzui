_package("alz.core");

_import("alz.core.Plugin");

/**
 * @class DOMUtil
 * @extends alz.lang.AObject
 * @desc 关于DOM操作的一些工具方法的集合
 * @example
var _dom = new DOMUtil();
 */
_class("DOMUtil", Plugin, function(){
	this._init = function(){
		_super._init.call(this);
		this._components = [];
		this._nodes = [];
		this._domTemp = null;
		this._css = null;
	};
	/**
	 * @method dispose
	 * @desc 析构方法
	 */
	this.dispose = function(){
		if(this._disposed) return;
		this._css = null;
		this._domTemp = null;
		//解除所有DOM元素和脚本对象的绑定关系
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i].dispose();
			this._nodes[i] = null;
		}
		this._nodes = [];
		for(var i = 0, len = this._components.length; i < len; i++){
			this._components[i].dispose();
			this._components[i] = null;
		}
		this._components = [];
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.createDomElement = function(html, parent){
		if(!this._domTemp){
			this._domTemp = window.document.createElement("div");
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
	/**
	 * @method getPos
	 * @param {Element} el DOM元素
	 * @param {Element} refElement el的容器元素
	 * @desc 计算 el 相对于 refElement 的位置，一定要保证 refElement 包含 el
	 * [TODO]如何计算绝对定位的元素？相对于外部的位置
	 */
	/*
	this.getPos = function(el, refElement){
		try{
		var pos = {x: 0, y: 0};
		//var sb = [];
		for(var o = el; o; o = o.offsetParent){
			var s = "tagName=" + o.tagName + ",className=" + o.className;
			var x = 0, y = 0, a, b;
			var style = this.getStyle(o);
			if(o != el && o != refElement){
				//a = this.parseNum(o.tagName, style.borderLeftWidth);
				//b = this.parseNum(o.tagName, style.borderTopWidth);
				a = this.getStyleProperty(o, "borderLeftWidth");
				b = this.getStyleProperty(o, "borderTopWidth");
				x += isNaN(a) ? 0 : a;
				y += isNaN(b) ? 0 : b;
				//s += ",borderLeftWidth=" + a + ",borderTopWidth=" + b;
			}
			/ *
			if(o != el && runtime.getBoxModel() == 0){
				x += this.parseNum(o.tagName, style.paddingLeft);
				y += this.parseNum(o.tagName, style.paddingTop);
			}
			* /
			if(o != refElement){
				pos.x += o.offsetLeft + (o != el ? x : 0);
				pos.y += o.offsetTop + (o != el ? y : 0);
				//s += ",offsetLeft=" + o.offsetLeft + ",offsetTop=" + o.offsetTop;
			}else{
				a = this.getStyleProperty(o, "borderLeftWidth");
				b = this.getStyleProperty(o, "borderTopWidth");
				//pos.x += this.parseNum(o.tagName, style.borderLeftWidth);
				//pos.y += this.parseNum(o.tagName, style.borderTopWidth);
				pos.x += a;
				pos.y += b;
				//s += ",borderLeftWidth=" + a + ",borderTopWidth=" + b;
				style = null;
				//sb.push(s);
				break;
			}
			//sb.push(s);
			if(o.tagName == "BODY" || o.tagName == "HTML") break;
			style = null;
		}
		//$("log_off").value += "\n" + sb.join("\n");
		}catch(ex){
			window.alert(ex.message);
		}
		return pos;
	};
	*/
	this.getPos = function(el, refElement){
		try{
		var pos = {x: 0, y: 0};
		for(var o = el; o; o = o.offsetParent){
			var s = "tagName=" + o.tagName + ",className=" + o.className;
			var x = 0, y = 0, a, b;
			if(o != el && o != refElement){
				var border = this.getBorder(o);
				a = border.left;
				b = border.top;
				x += a;
				y += b;
			}
			if(o != refElement){
				pos.x += o.offsetLeft + (o != el ? x : 0);
				pos.y += o.offsetTop + (o != el ? y : 0);
			}else{
				var border = this.getBorder(o);
				a = border.left;
				b = border.top;
				pos.x += a;
				pos.y += b;
				break;
			}
			if(o.tagName == "BODY" || o.tagName == "HTML") break;
		}
		}catch(ex){
			window.alert(ex.message);
		}
		return pos;
	};
	/**
	 * @method getPos1
	 * @param {Event} ev 事件对象
	 * @param {Number} type 事件类型
	 * @param {Element} refElement 事件target的父容器
	 * @return {Object}
	 * @desc 相对于refElement容器，计算事件发生的坐标位置
	 */
	this.getPos1 = function(ev, type, refElement){
		var pos = type == 1 ? (
			runtime.ie ? {"x": ev.offsetX, "y": ev.offsetY} : {"x": ev.layerX, "y": ev.layerY}
		) : {"x": 0, "y": 0};
		refElement = refElement || runtime.getDocument().body;
		var obj = ev.srcElement || ev.target;
		while(obj && obj != refElement){
			pos.x += obj.offsetLeft;
			pos.y += obj.offsetTop;
			obj = obj.offsetParent;
		}
		return pos;
	};
	/**
	 * 统一 IE 和 Moz 系列浏览器的差异
	 * @method parseNum
	 * @param {String} v
	 * @return {Number}
	 * @desc 把 v 转换成十进制表示的数字
	 */
	this.parseNum = function(/*tag, */v){
		/*
		switch(v){
		case "medium":
			return tag == "DIV" ? 0 : 2;
		case "thin":
			return tag == "DIV" ? 0 : 1;
		case "thick":
			return tag == "DIV" ? 0 : 1;
		default:
			var a = parseInt(v);
			return isNaN(a) ? 0 : a;
		}
		*/
		var a = parseInt(v, 10);
		return isNaN(a) ? 0 : a;
	};
	/**
	 * 统一 IE 和 Moz 系列浏览器的差异
	 */
	this.getPropertyValue = function(style, name){
		//return runtime.ie ? style[name] : style.getPropertyValue(name);
		//return runtime.ie ? style[name] : (style.getPropertyValue(name) || style.getPropertyCSSValue(name));
		return style[name];
	};
	/**
	 * @method getStyle
	 * @param {Element} el
	 * @return {Object}
	 * @desc 获取 el 元素的所有样式
	 */
	this.getStyle = function(el){
		var style, view = runtime.getDocument().defaultView;
		if(view && view.getComputedStyle){
			style = view.getComputedStyle(el, null);
		}else if(el.currentStyle){
			style = el.currentStyle;
		}else{
			throw "无法动态获取DOM的实际样式属性";
		}
		return style;
	};
	/**
	 * @method getWH
	 * @param {Element} el DOM元素
	 * @return {Object}
	 * @desc 获取 el 的宽高
	 */
	this.getWH = function(el){
		var style = this.getStyle(el),
			width = this.parseNum(style["width"]),
			height = this.parseNum(style["height"]);
		return {
			w: width,
			h: height
		};
	};
	/**
	 * @method getPadding
	 * @param {Element} el DOM元素
	 * @desc 获取 el 的四个padding值
	 */
	this.getPadding = function(el){
		var style = this.getStyle(el),
			top = this.parseNum(style["paddingTop"]),
			right = this.parseNum(style["paddingRight"]),
			bottom = this.parseNum(style["paddingBottom"]),
			left = this.parseNum(style["paddingLeft"]);
		return {
			top: top,
			right: right,
			bottom: bottom,
			left: left
		};
	};
	/**
	 * @method getBorder
	 * @param {Element} el DOM元素
	 * @desc 获取 el 的四个border值
	 */
	this.getBorder = function(el){
		var style = this.getStyle(el),
			top = this.parseNum(style["borderTopWidth"]),
			right = this.parseNum(style["borderRightWidth"]),
			bottom = this.parseNum(style["borderBottomWidth"]),
			left = this.parseNum(style["borderLeftWidth"]);
		return {
			top: top,
			right: right,
			bottom: bottom,
			left: left
		};
	};
	/**
	 * @method getStyleProperty
	 * @param {Element} el DOM元素
	 * @param {String} name 样式名称
	 * @return {Number}
	 * @desc  获取 el 元素的 name 样式值
	 */
	this.getStyleProperty = function(el, name){
		var style = this.getStyle(el);
		return this.parseNum(el.tagName, this.getPropertyValue(style, name) || el.style[name]);
	};
	/**
	 * @method setStyleProperty
	 * @param {Element} el DOM元素
	 * @param {Strinng} name 样式名称
	 * @param {Object} value 样式值
	 * @desc  设置 el 元素的 name 样式值为 value
	 */
	this.setStyleProperty = function(el, name, value){
		el.style[name] = value;
	};
	this._setStyleProperty = function(el, name, value){
		try{
		switch(name){
		case "width":
			if(runtime.getBoxModel() == 1){
				value -= this.getStyleProperty(el, "borderLeftWidth")
							 + this.getStyleProperty(el, "paddingLeft")
							 + this.getStyleProperty(el, "paddingRight")
							 + this.getStyleProperty(el, "borderRightWidth");
			}
			el.style[name] = Math.max(0, value) + "px";
			break;
		case "height":
			if(runtime.getBoxModel() == 1){
				value -= this.getStyleProperty(el, "paddingTop") + this.getStyleProperty(el, "paddingBottom");
			}
			el.style[name] = Math.max(0, value) + "px";
			break;
		}
		}catch(ex){
			window.alert(ex.message);
		}
	};
	/**
	 * @method getObj
	 * @param {Element} el DOM元素
	 * @return {alz.mui.Component}
	 * @desc 获取绑定了 el 的Component实例
	 */
	this.getObj = function(el){
		var clazz = __context__.__classes__["alz.mui.Component"];
		var component = new clazz();
		component._domCreate = true;
		this._components.push(component);  //注册 component
		component.bind(el);  //绑定 DOM 元素
		return component;
	};
	this.getObj = function(el){
		var obj;
		if(!("__ptr__" in el)){
			obj = new BoxElement();
			obj._dom = this;
			obj.init(el);
			this._nodes.push(obj);
		}else{
			obj = el.__ptr__;
		}
		return obj;
	};
	/**
	 * @method getObj1
	 * @param {Element} el DOM元素
	 * @return {BoxElement}
	 * @desc 获取绑定了 el 的BoxElement实例
	 */
	this.getObj1 = function(el){
		var obj;
		if("__ptr__" in el && el.__ptr__){
			obj = el.__ptr__;
		}else{
			obj = new BoxElement(el, this);
			/*
			obj = {
				_self: el,
				dispose: function(){
					this._self.__ptr__ = null;
					this._self = null;
				}
			};
			el.__ptr__ = obj;
			*/
			this._nodes.push(obj);
		}
		return obj;
	};
	this._create = function(tag){
		return window.document.createElement(tag);
	};
	this._setWidth = function(el, v){
		//if(runtime._host.compatMode != "BackCompat"){
		//	//window.alert("+" + forIn(this.getStyle(el)).join("\n"));
		//	v -= this.getStyleProperty(el, "borderLeftWidth") + this.getStyleProperty(el, "borderRightWidth");
		//}
		v = Math.max(0, v);
		this.setStyleProperty(el, "width", v + "px");
	};
	this._setHeight = function(el, v){
		//if(runtime._host.compatMode != "BackCompat"){
		//	v -= this.getStyleProperty(el, "borderTopWidth") + this.getStyleProperty(el, "borderBottomWidth");
		//}
		v = Math.max(0, v);
		this.setStyleProperty(el, "height", v + "px");
	};
	/**
	 * @method getWidth
	 * @param {Element} el DOM元素
	 * @return {Number}
	 * @desc   获得 el 的可见宽度
	 */
	this.getWidth = function(el){
		var obj = this.getObj1(el);
		//if(!("_width" in obj)){
			if(runtime._host.compatMode != "BackCompat"){
				obj._width = el.offsetWidth;  // - (runtime._host.env == "ie" ? 0 : this.getStyleProperty(el, "borderLeftWidth") + this.getStyleProperty(el, "borderRightWidth"))
			}else{
				obj._width = this.getStyleProperty(el, "borderLeftWidth")
					+ el.offsetWidth  //this.getStyleProperty(el, "width")
					+ this.getStyleProperty(el, "borderRightWidth");
			}
		//}
		return obj._width;
		//obj = null;
	};
	/**
	 * @method getHeight
	 * @param  {Element} el DOM元素
	 * @return {Number}
	 * @desc   获得 el 的可见高度
	 */
	this.getHeight = function(el){
		var obj = this.getObj1(el);
		//if(!("_height" in obj)){
			if(runtime._host.compatMode != "BackCompat"){
				obj._height = el.offsetHeight;
			}else{
				obj._height = this.getStyleProperty(el, "borderTopWidth")
					+ el.offsetHeight  //this.getStyleProperty(el, "height")
					+ this.getStyleProperty(el, "borderBottomWidth");
			}
		//}
		return obj._height;
		//obj = null;
	};
	/**
	 * @method setWidth
	 * @param {Element} el DOM元素
	 * @param {Number} v 宽度值[可选]
	 * @desc 设置 el 的 width 样式值
	 */
	this.setWidth = function(el, v){
		var obj = this.getObj1(el);
		if(!("_width" in obj)) obj._width = 0;
		v = Math.max(v/* - obj._marginLeft - obj._marginRight*/, 0);
		//if(el.className == "pane-top") window.alert(obj._width + "!=" + v);
		//if(obj._width != v){
			obj._width = v;
			var w = this.getInnerWidth(el, v);
			this._setWidth(el, w);
		//}
		obj = null;
	};
	/**
	 * @method setHeight
	 * @param {Element} el DOM元素
	 * @param {Number} v 高度值[可选]
	 * @desc 设置 el 的 height 样式值
	 */
	this.setHeight = function(el, v){
		var obj = this.getObj1(el);
		if(!("_height" in obj)) obj._height = 0;
		v = Math.max(v/* - obj._marginTop - obj._marginBottom*/, 0);
		if(obj._height != v){
			obj._height = v;
			var w = this.getInnerHeight(el, v);
			this._setHeight(el, w);
		}
		obj = null;
	};
	/**
	 * @method getInnerWidth
	 * @param  {Element} el DOM元素
	 * @param  {Number} v 宽度值[可选]
	 * @return {Number}
	 * @desc   获取 el 元素的 width 样式值
	 */
	this.getInnerWidth = function(el, v){
		var obj = this.getObj1(el);
		if(!v) v = obj._width;
		var innerWidth = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v - obj._borderLeftWidth - obj._borderRightWidth - obj._paddingLeft - obj._paddingRight);
		//var innerWidth = Math.max(0, runtime.getBoxModel() == 0 ? v : v - this._borderLeftWidth - this._borderRightWidth - this._paddingLeft - this._paddingRight);
		obj = null;
		if(isNaN(innerWidth)) runtime.log("DomUtil::getInnerWidth isNaN(innerWidth)");
		return innerWidth;
	};
	/**
	 * @method getInnerHeight
	 * @param  {Element} el DOM元素
	 * @param  {Number} v 高度值[可选]
	 * @return {Number}
	 * @desc   获取 el 元素的 height 样式值
	 */
	this.getInnerHeight = function(el, v){
		var obj = this.getObj1(el);
		if(!v) v = obj._height || el.offsetHeight;
		var innerHeight = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v - obj._borderTopWidth - obj._borderBottomWidth - obj._paddingTop - obj._paddingBottom);
		obj = null;
		if(isNaN(innerHeight)) runtime.log("DomUtil::getInnerHeight isNaN(innerHeight)");
		return innerHeight;
	};
	/**
	 * @method getOuterWidth
	 * @param  {Element} el DOM元素
	 * @param  {Number} v 宽度值[可选]
	 * @return {Number}
	 * @desc   获取 el 元素的占位宽度，包括 margin
	 */
	this.getOuterWidth = function(el, v){
		var obj = this.getObj1(el);
		if(!v) v = this.getWidth(el);
		var outerWidth = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v + obj._marginLeft + obj._marginRight);
		obj = null;
		if(isNaN(outerWidth)) window.alert("DomUtil::getOuterWidth isNaN(outerWidth)");
		return outerWidth;
	};
	/**
	 * @method getOuterHeight
	 * @param  {Element} el DOM元素
	 * @param  {Number} v 宽度值[可选]
	 * @return {Number}
	 * @desc   获取 el 元素的占位高度，包括 margin
	 */
	this.getOuterHeight = function(el, v){
		var obj = this.getObj1(el);
		if(!v) v = this.getHeight(el);
		var outerHeight = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v + obj._marginTop + obj._marginBottom);
		obj = null;
		if(isNaN(outerHeight)) window.alert("DomUtil::getOuterHeight isNaN(outerHeight)");
		return outerHeight;
	};
	/*
	this.getWidth = function(el){
		if(!el._ptr) this.getObj(el);
		return el._ptr.getWidth();
	};
	this.setWidth = function(el, w){
		if(!el._ptr) this.getObj(el);
		el._ptr.setWidth(w);
		//this._setStyleProperty(el, "width", w);
	};
	this.getHeight = function(el){
		if(!el._ptr) this.getObj(el);
		return el._ptr.getHeight();
	};
	this.setHeight = function(el, h){
		if(!el._ptr) this.getObj(el);
		el._ptr.setHeight(h);
		//this._setStyleProperty(el, "height", h);
	};
	this.getInnerWidth = function(el){
		if(!el._ptr) this.getObj(el);
		return el._ptr.getInnerWidth();
		/ *
		//if(runtime.getBoxModel() == 1){
			return Math.max(0, el.offsetWidth - this.getStyleProperty(el, "borderLeftWidth") - this.getStyleProperty(el, "paddingLeft") - this.getStyleProperty(el, "paddingRight") - this.getStyleProperty(el, "borderRightWidth"));
		//}
		* /
	};
	this.getInnerHeight = function(el){
		if(!el._ptr) this.getObj(el);
		return el._ptr.getInnerHeight();
	};
	*/
	/**
	 * @method resize
	 * @param  {Element} el DOM元素
	 * @param  {Number} w 宽度值
	 * @param  {Number} h 高度值
	 * @param  {Boolean} reDoSelf 是否调整自身大小
	 * @desc   调整大小
	 */
	this.resize = function(el, w, h, reDoSelf){
		if(!el._ptr) this.getObj(el);
		if(reDoSelf) el._ptr.resize(w, h);  //是否调整自身的大小
		//if(el.getAttribute("id") != "") window.alert(el.id);
		var nodes = el.childNodes;
		//if(el.getAttribute("html") == "true") window.alert("123");
		if(el.getAttribute("aui") != "" &&
			!(el.getAttribute("noresize") == "true" ||
				el.getAttribute("html") == "true") &&
			nodes.length > 0){  //忽略 head 内元素
			var ww = this.getInnerWidth(el);
			var hh = this.getInnerHeight(el);
			for(var i = 0, len = nodes.length; i < len; i++){
				if(nodes[i].nodeType != 1){  //NODE_ELEMENT
					continue;
				}
				var w0 = this.getWidth(nodes[i]);
				var h0 = this.getHeight(nodes[i]);
				//if(nodes[i].id == "dlgBody") window.alert(w0);
				this.setWidth(nodes[i], w0);
				//this.setHeight(nodes[i], h0);
				this.resize(nodes[i], ww, h0, true);
			}
		}
	};
	/**
	 * @method resizeElement
	 * @param  {Element} el DOM元素
	 * @param  {Number} w 宽度值
	 * @param  {Number} h 高度值
	 * @desc   重置 el 宽高
	 */
	this.resizeElement = function(el, w, h){
		el.style.width = Math.max(0, w) + "px";
		el.style.height = Math.max(0, h) + "px";
	};
	/**
	 * @method moveElement
	 * @param  {Element} el DOM元素
	 * @param  {Number} x x坐标
	 * @param  {Number} y y坐标
	 * @desc   把 el 移动到(x, y)位置
	 */
	this.moveElement = function(el, x, y){
		el.style.left = Math.max(0, x) + "px";
		el.style.top = Math.max(0, y) + "px";
	};
	/**
	 * @method moveTo
	 * @param  {Element} el DOM元素
	 * @param  {Number} x x坐标
	 * @param  {Number} y y坐标
	 * @desc   把 el 移动到x, y)位置
	 */
	this.moveTo = function(el, x, y){
		var obj = this.getObj1(el);
		if(!("_left" in obj)) obj._left = 0;
		if(!("_top" in obj)) obj._top = 0;
		obj._left = x;
		this.setStyleProperty(el, "left", x + "px");
		obj._top = y;
		this.setStyleProperty(el, "top", y + "px");
	};
	/**
	 * @method setOpacity
	 * @param  {Element} el DOM元素
	 * @param  {Number} v 不透明度
	 * @desc   设置 el 的不透明度
	 */
	this.setOpacity = function(el, v){
		var obj = this.getObj1(el);
		if(!("_opacity" in obj)) obj._opacity = 0;
		if(obj._opacity != v || v === 0){
			v = Math.max(0, Math.min(1, v));
			obj._opacity = v;
			switch(runtime._host.env){
			case "ie":
				v = Math.round(v * 100);
				this.setStyleProperty(el, "filter", v == 100 ? "" : "Alpha(Opacity=" + v + ")");
				break;
			case "ff":
			case "ns":
				this.setStyleProperty(el, "MozOpacity", v == 1 ? "" : v);
				break;
			case "opera":
			case "safari":
			case "chrome":
				this.setStyleProperty(el, "opacity", v == 1 ? "" : v);
				break;
			}
		}
		obj = null;
	};
	/**
	 * @method selectNodes
	 * @param  {Element} el DOM元素
	 * @param  {String} xpath xpath
	 * @desc   用xpath选取 el 的子节点
	 */
	this.selectNodes = function(el, xpath){
		return runtime.ie ? el.childNodes : el.selectNodes(xpath);
	};
	/**
	 * @method getViewPort
	 * @param  {Element} el DOM元素
	 * @return {Object}
	 * @desc   获取 el 的矩形信息，包括x，y，宽度和高度等。
	 */
	this.getViewPort = function(el){
		/*return {
			"x": 0,
			"y": 0,
			"w": el.clientWidth,
			"h": el.clientHeight,
			//"w1": el.scrollWidth,
			//"h1": el.scrollHeight
		};*/
		var rect = {
			"x": el.scrollLeft,
			"y": el.scrollTop,
			"w": el.clientWidth,  //Math.max(el.clientWidth || el.scrollWidth)
			"h": Math.max(el.clientHeight, el.parentNode.clientHeight)  //Math.max(el.clientHeight || el.scrollHeight)
		};
		rect.w = Math.max(el.clientWidth, el.parentNode.clientWidth);
		rect.h = Math.max(el.clientHeight, el.parentNode.clientHeight);
		return rect;
	};
	/**
	 * @method addEventListener
	 * @param {Element} el 要绑定事件侦听的DOM元素
	 * @param {String} type 事件类型，如果参数func为事件监听对象，则该参数将被忽略
	 * @param {Function|Object} func 事件响应函数或事件侦听对象
	 * @param obj 回调函数中的this指代对象，如果没有该参数，默认为el
	 * @desc 添加事件侦听器
	 */
	//[memleak]DOMUtil.__hash__ = {};
	//[memleak]DOMUtil.__id__ = 0;
	this.addEventListener = function(el, type, func, obj){
		//[memleak]el.__hashid__ = "_" + (DOMUtil.__id__++);
		//[memleak]DOMUtil.__hash__[el.__hashid__] = {el:el,type:type,func:func,obj:obj};
		switch(typeof func){
		case "function":
			el.__callback = (function(cb, obj){
				return function(ev){
					return cb.call(obj, ev || window.event);  //保证回调函数中的this是当前DOM对象或者对应的脚本组件
				};
			})(func, obj || el);
			if(el.attachEvent){
				el.attachEvent("on" + type, el.__callback);
			}else{
				el.addEventListener(type, el.__callback, false);
			}
			break;
		case "object":
			el.__callback = (function(listener, obj){
				return function(ev){
					return listener[ev.type].call(obj, ev || window.event);  //保证回调函数中的this是当前DOM对象或者对应的脚本组件
				};
			})(func, obj || el);
			for(var k in func){
				if(el.attachEvent){
					el.attachEvent("on" + k, el.__callback);
				}else{
					el.addEventListener(k, el.__callback, false);
				}
			}
			break;
		}
	};
	/**
	 * @method removeEventListener
	 * @param {Element} el 要取消事件侦听的DOM元素
	 * @param {String} type 事件类型，如果参数func为事件监听对象，则该参数将被忽略
	 * @param {Function|Object} func 事件响应函数或事件侦听对象
	 * @desc 取消事件侦听
	 */
	this.removeEventListener = function(el, type, func){
		if(!el.__callback) return;
		//[memleak]delete DOMUtil.__hash__[el.__hashid__];
		switch(typeof func){
		case "function":
			if(el.detachEvent){
				el.detachEvent("on" + type, el.__callback);
			}else{
				el.removeEventListener(type, el.__callback, false);
			}
			break;
		case "object":
			for(var k in func){
				if(el.detachEvent){
					el.detachEvent("on" + k, el.__callback);
				}else{
					el.removeEventListener(k, el.__callback, false);
				}
			}
			break;
		}
		el.__callback = null;
	};
	/**
	 * @method trigger
	 * @param {Element} el 要触发事件的目标元素
	 * @param {String} type 事件类型
	 * @desc 触发 type 事件
	 */
	this.trigger = function(el, type){
		try{
			if(el.dispatchEvent){
				var evt = document.createEvent('Event');
				evt.initEvent(type, true, true);
				el.dispatchEvent(evt);
			}else if(el.fireEvent){
				el.fireEvent("on" + type);
			}else{
				el[ type ]();
			}
		}catch(ex){
			window.alert(ex);
		}
	};
	/**
	 * @method contains
	 * @param {Element} el DOM元素
	 * @param {Element} obj DOM元素
	 * @return {Boolean}
	 * @desc el 元素是否包含 obj 元素
	 */
	this.contains = function(el, obj){
		if(el.contains){
			return el.contains(obj);
		}else{
			for(var o = obj; o; o = o.parentNode){
				if(o == el) return true;
				if(!o.parentNode) return false;
			}
			return false;
		}
	};
	/**
	 * @method parseRule
	 */
	this.parseRule = function(hash, arr, style){
		var key = arr[0];
		if(key in hash){
			//window.alert("merge css");
		}else{
			if(key.indexOf("_") != -1){
				var arr1 = key.split("_");
				this.parseRule(hash[arr1[0]]["__state"], arr1.slice(1), style);
			}else{
				//精简css样式
				var map = {"cssText":1,"length":1,"parentRule":1,"background-image":1};
				var style0 = {};
				if(arr.length == 1){
					for(var k in style){
						if(k in map || style[k] == "") continue;
						style0[k] = style[k];
					}
				}
				var obj = {};
				obj["__nodes"] = [];  //使用这个样式的元素
				//obj["__selectorText"] = arr.slice(1).join(" ");
				obj["__style"] = style0;
				obj["__state"] = {};
				hash[key] = obj;
			}
		}
		if(arr.length > 1){
			this.parseRule(hash[key], arr.slice(1), style);
		}
	};
	/**
	 * @method parseCss
	 */
	this.parseCss = function(rules){
		var hash = {};
		for(var i = 0, len = rules.length; i < len; i++){
			var rule = rules[i];
			if(rule.type == 2) continue;
			//rule.selectorText + "{" + rule.style.cssText + "}"
			this.parseRule(hash, rule.selectorText.split(" "), rule.style);
		}
		return hash;
	};
	/**
	 * @method cssKeyToJsKey
	 * @param {String} str CSS样式名称
	 * @desc 把CSS样式名称转换为JS表示法
	 */
	this.cssKeyToJsKey = function(str){
		return str.replace(/-([a-z])/g, function(_0, _1){
			return _1.toUpperCase();
		});
	};
	/**
	 * @method applyCssStyle
	 * @param {Element} el 要控制的DOM元素
	 * @param {JsonCssData} css json格式的CSS数据
	 * @param {String} className 样式名称(class属性值)
	 * @desc 应用json格式的css样式控制DOM元素的外观
	 */
	this.applyCssStyle = function(el, css, className){
		var style = css[(el.className == "error" ? "error-" : "") + className];
		if(el.__ptr__){
			for(var k in style){
				var v = style[k];
				if(k.charAt(0) == "_"){
					var obj = el.getElementsByTagName(k.substr(1))[0];
					for(var key in v){
						var name = this.cssKeyToJsKey(key);
						if(obj.style[name] != v[key]){
							obj.style[name] = v[key];
						}
					}
					obj = null;
				}else{
					var name = this.cssKeyToJsKey(k);
					if(el.style[name] != v){
						el.style[name] = v;
					}
				}
			}
		}else{
			for(var k in style){
				var v = style[k];
				if(k.charAt(0) == "_"){
					var obj = el._ee[k];
					for(var key in v){
						var name = this.cssKeyToJsKey(key);
						if(obj.style[name] != v[key]){
							obj.style[name] = v[key];
						}
					}
					obj = null;
				}else{
					var name = this.cssKeyToJsKey(k);
					if(el._self.style[name] != v){
						el._self.style[name] = v;
					}
				}
			}
		}
		style = null;
	};
	this.applyCssStyle1 = function(el, xpath, className){
		if(!this._css){
			this._css = this.parseCss(runtime._doc.styleSheets[1][runtime.ie ? "rules" : "cssRules"]);
		}
		var css;
		var arr = xpath.split(" ");
		if(arr.length == 1){
			css = this._css[xpath].__state;
		}else{
			for(var i = 0, len = arr.length, css = this._css; i < len; i++){
				css = css[arr[i]];
			}
			css = css.__state;
		}
		var style = css[(el.className == "error" ? "error-" : "") + className];
		if(el.__ptr__){
			for(var k in style){
				var v = style[k];
				if(k.charAt(0) == "_"){
					var obj = el.getElementsByTagName(k.substr(1))[0];
					for(var key in v){
						var name = this.cssKeyToJsKey(key);
						if(obj.style[name] != v[key]){
							obj.style[name] = v[key];
						}
					}
					obj = null;
				}else{
					var name = this.cssKeyToJsKey(k);
					if(el.style[name] != v){
						el.style[name] = v;
					}
				}
			}
		}else{
			for(var k in style){
				if(k == "__nodes" || k == "__state") continue;
				if(k == "__style"){
					var o = style[k];
					for(var m in o){
						if(el._self.style[m] != o[m]){
							el._self.style[m] = o[m];
						}
					}
				}else{
					var v = style[k]["__style"];
					var obj = el._ee["_" + k];
					for(var key in v){
						var name = key;
						if(obj.style[name] != v[key]){
							obj.style[name] = v[key];
						}
					}
					obj = null;
				}
			}
		}
		style = null;
	};
});