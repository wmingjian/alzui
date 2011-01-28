/**
 * alzui-mini JavaScript Framework, v0.0.8
 * Copyright (c) 2009 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
(function(){with(runtime.createContext("core")){

//_import("alz.core.XPathQuery");
/*<file name="alz.core.DOMUtil">*/
_package("alz.core");

_class("DOMUtil", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._components = [];
		this._nodes = [];
		this._domTemp = null;
		this._css = null;
	};
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
	 * 计算 el 相对于 refElement 的位置，一定要保证 refElement 包含 el
	 * [TODO]如何计算绝对定位的元素？相对于外部的位置
	 */
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
			/*
			if(o != el && runtime.getBoxModel() == 0){
				x += this.parseNum(o.tagName, style.paddingLeft);
				y += this.parseNum(o.tagName, style.paddingTop);
			}
			*/
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
	this.getPos1 = function(ev, type, refElement){
		var pos = type == 1 ? (
			runtime._host.env == "ie"
			? {"x": ev.offsetX, "y": ev.offsetY}
			: {"x": ev.layerX, "y": ev.layerY}
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
	 */
	this.parseNum = function(tag, v){
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
	};
	/**
	 * 统一 IE 和 Moz 系列浏览器的差异
	 */
	this.getPropertyValue = function(style, name){
		//return runtime.ie ? style[name] : style.getPropertyValue(name);
		//return runtime._host.env == "ie" ? style[name] : (style.getPropertyValue(name) || style.getPropertyCSSValue(name));
		return style[name];
	};
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
	this.getStyleProperty = function(el, name){
		var style = this.getStyle(el);
		return this.parseNum(el.tagName, this.getPropertyValue(style, name) || el.style[name]);
	};
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
	this.getObj = function(el){
		var clazz = __context__.__classes__["alz.mui.Component"];
		var component = new clazz();
		component._domCreate = true;
		this._components.push(component);  //注册 component
		component.bind(el);  //绑定 DOM 元素
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
	this.getObj1 = function(el){
		var obj;
		if(!("__ptr__" in el)){
			//obj = new BoxElement(el, this);
			obj = {
				_self: el,
				dispose: function(){
					this._self.__ptr__ = null;
					this._self = null;
				}
			};
			el.__ptr__ = obj;
			this._nodes.push(obj);
		}else{
			obj = el.__ptr__;
		}
		return obj;
	};
	this._create = function(tag){
		return window.document.createElement(tag);
	};
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
		/*
		//if(runtime.getBoxModel() == 1){
			return Math.max(0, el.offsetWidth - this.getStyleProperty(el, "borderLeftWidth") - this.getStyleProperty(el, "paddingLeft") - this.getStyleProperty(el, "paddingRight") - this.getStyleProperty(el, "borderRightWidth"));
		//}
		*/
	};
	this.getInnerHeight = function(el){
		if(!el._ptr) this.getObj(el);
		return el._ptr.getInnerHeight();
	};
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
	this.resizeElement = function(el, w, h){
		el.style.width = Math.max(0, w) + "px";
		el.style.height = Math.max(0, h) + "px";
	};
	this.moveElement = function(el, x, y){
		el.style.left = Math.max(0, x) + "px";
		el.style.top = Math.max(0, y) + "px";
	};
	this.moveTo = function(el, x, y){
		var obj = this.getObj1(el);
		if(!("_left" in obj)) obj._left = 0;
		if(!("_top" in obj)) obj._top = 0;
		obj._left = x;
		this.setStyleProperty(el, "left", x + "px");
		obj._top = y;
		this.setStyleProperty(el, "top", y + "px");
	};
	this.setOpacity = function(el, v){
		var obj = this.getObj1(el);
		if(!("_opacity" in obj)) obj._opacity = 0;
		if(obj._opacity != v){
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
	this.selectNodes = function(el, xpath){
		return runtime.ie ? el.childNodes : el.selectNodes(xpath);
	};
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
	 * @param el 要绑定事件的DOM元素
	 * @param type 事件类型，如果参数fun为事件监听对象，则该参数将被忽略
	 * @param fun 事件响应函数或者事件监听对象
	 * @param obj 回调函数中的this指代对象，如果没有该参数，缺省为el
	 */
	//[memleak]DOMUtil.__hash__ = {};
	//[memleak]DOMUtil.__id__ = 0;
	this.addEventListener = function(el, type, fun, obj){
		//[memleak]el.__hashid__ = "_" + (DOMUtil.__id__++);
		//[memleak]DOMUtil.__hash__[el.__hashid__] = {el:el,type:type,fun:fun,obj:obj};
		switch(typeof fun){
		case "function":
			el.__callback = (function(cb, obj){
				return function(ev){
					return cb.call(obj, ev || window.event);  //保证回调函数中的this是当前DOM对象或者对应的脚本组件
				};
			})(fun, obj || el);
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
			})(fun, obj || el);
			for(var k in fun){
				if(el.attachEvent){
					el.attachEvent("on" + k, el.__callback);
				}else{
					el.addEventListener(k, el.__callback, false);
				}
			}
			break;
		}
	};
	this.removeEventListener = function(el, type, fun){
		if(!el.__callback) return;
		//[memleak]delete DOMUtil.__hash__[el.__hashid__];
		switch(typeof fun){
		case "function":
			if(el.detachEvent){
				el.detachEvent("on" + type, el.__callback);
			}else{
				el.removeEventListener(type, el.__callback, false);
			}
			break;
		case "object":
			for(var k in fun){
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
	this.parseCss = function(rules){
		var hash = {};
		for(var i = 0, len = rules.length; i < len; i++){
			if(rules[i].type == 2) continue;
			//rules[i].selectorText + "{" + rules[i].style.cssText + "}"
			this.parseRule(hash, rules[i].selectorText.split(" "), rules[i].style);
		}
		return hash;
	};
	this.cssKeyToJsKey = function(str){
		return str.replace(/-([a-z])/g, function(_0, _1){
			return _1.toUpperCase();
		});
	};
	/**
	 * 应用json格式的css样式控制DOM元素的外观
	 * @param el {HTMLELement} 要控制的DOM元素
	 * @param css {JsonCssData} json格式的CSS数据
	 * @param className {String} 样式名称
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
/*</file>*/
/*<file name="alz.core.BoxElement">*/
_package("alz.core");

_class("BoxElement", "", function(_super){
	//BoxElement._all_ = [];
	this._init = function(el, parent){
		_super._init.call(this);
		this._win = window;
		this._doc = window.document;
		this._parent = parent || null;
		this._self = null;
		this._nodes = [];
		this._style = {};
		this.__style = null;  //DOM元素的style属性
		this._currentStyle = {};
		this.__layout = null;  //{AbstractLayout}
		this._layout = "";
		this._align = "";
		this._boxmode = runtime._host.compatMode != "BackCompat";
		//BoxElement._all_.push(this);
		if(el){
			this.init(el);
		}
	};
	this._createElement = function(tag){
		return this._doc.createElement(tag);
	};
	this._createTextNode = function(text){
		return this._doc.createTextNode(text);
	};
	this.create = function(parent, data){
		if(data["__type__"] == "string"){
			var obj = this._createTextNode(data["__contain__"][0][""]);
			if(parent){
				this._parent = parent;
				parent._self.appendChild(obj);
				//parent._nodes.push(this);
				//this._self = obj;
				//parent.appendNode(this);
			}else{
				parent = this._doc.body;
				parent.appendChild(obj);
			}
			return obj;
		}
		var obj = this._createElement("div");
		obj.style.position = "absolute";
		obj.style.overflow = "hidden";
		//obj.style.width = "100%";
		//obj.style.height = "100%";
		if(parent){
			this._parent = parent;
			parent._self.appendChild(obj);
			//parent._nodes.push(this);
			//this._self = obj;
			//parent.appendNode(this);
		}else{
			parent = this._doc.body;
			parent.appendChild(obj);
		}
		this.init(obj);
		for(var k in data){
			if(k == "__contain__"){
				for(var i = 0, len = data[k].length; i < len; i++){
					var node = new BoxElement();
					node.create(this, data[k][i]);
					this.appendNode(node);
				}
			}else{
				this.setattr(k, data[k]);
			}
		}
		return obj;
	};
	this.init = function(obj){
		obj.__ptr__ = this;
		this._self = obj;
		this.__style = obj.style;
		//初始化应用到的属性，从DOM对象中解析出实际的值，只读方式使用
		var properties = [
			"width","height",
			"marginLeft","marginRight","marginTop","marginBottom",
			"borderLeftWidth","borderRightWidth","borderTopWidth","borderBottomWidth",
			"paddingLeft","paddingRight","paddingTop","paddingBottom"
		];
		for(var i = 0, len = properties.length; i < len; i++){
			var key = properties[i];
			if(!("_" + key in this)){
				this["_" + key] = this.getStyleProperty(key) || 0;
			}
		}
		this.setattr("align", this._self.getAttribute("_align") || "");
		this.setattr("layout", this._self.getAttribute("_layout") || "");
		if(this._layout){
			var nodes = this._self.childNodes;
			for(var i = 0, len = nodes.length; i < len; i++){
				var node = nodes[i];
				if(node.nodeType == 1 && node.getAttribute("_align")){
					this.appendNode(new BoxElement(node, this));
				}
				node = null;
			}
			nodes = null;
			//runtime.log(this._self.tagName + "----" + this._nodes.length);
		}
		this._self.style.margin = "0px";
		this._self.style.padding = "0px";
	};
	this.dispose = function(){
		if(this.__layout){
			this.__layout.dispose();
			this.__layout = null;
		}
		this._self.__ptr__ = null;
		this._self = null;
		_super.dispose.apply(this);
	};
	this.appendNode = function(node){
		if(node._self && node._self.parentNode == null){
			this._self.appendChild(node._self);
		}
		this._nodes.push(node);
	};
	/**
	 * 统一 IE 和 Moz 系列浏览器的差异
	 */
	this.parseInt = function(tag, v){
		switch(v){
		case "medium": return tag == "DIV" ? 0 : 2;
		case "thin"  : return tag == "DIV" ? 0 : 1;
		case "thick" : return tag == "DIV" ? 0 : 1;
		default:
			var a = parseInt(v);
			return isNaN(a) ? 0 : a;
		}
	};
	if(document.defaultView){
		this._getStyle = function(){
			return this._doc.defaultView.getComputedStyle(this._self, null);
		};
	}else{
		this._getStyle = function(){
			return this._self.currentStyle;
		};
	}
	/*
	this._getStyle = function(){
		var style, view = this._doc.defaultView;
		if(view && view.getComputedStyle){
			style = view.getComputedStyle(this._self, null);
		}else if(this._self.currentStyle){
			style = this._self.currentStyle;
		}else{
			throw "无法动态获取DOM的实际样式属性";
		}
		return style;
	};
	*/
	this._getPropertyValue = function(style, name){
		//return runtime._host.env == "ie" ? style[name] : (style.getPropertyValue(name) || style.getPropertyCSSValue(name));
		return style[name];
	};
	this.getStyleProperty = function(name){
		return this.parseInt(this._self.tagName, this._getPropertyValue(this._getStyle(), name) || this._self.style[name]);
	};
	this.setStyleProperty = function(name, value){
		this.__style[name] = value;
	};
	this.getProperty = function(name){
		return this["_" + name];
	};
	this.setLeft = function(x){
		this.setStyleProperty("left", x + "px");
		//this.__style.left = x + "px";
	};
	this.setTop = function(y){
		this.setStyleProperty("top", y + "px");
		//this.__style.top = y + "px";
	};
	this._setWidth = function(w){
		//if(this._boxmode){
		//	w -= this._borderLeftWidth + this._borderRightWidth;
		//}
		this.setStyleProperty("width", Math.max(0, w) + "px");
	};
	this._setHeight = function(h){
		//if(this._boxmode){
		//	h -= this._borderTopWidth + this._borderBottomWidth;
		//}
		this.setStyleProperty("height", Math.max(0, h) + "px");
	};
	this.getWidth = function(){
		//return this._dom.getWidth(this._self);
		// - (runtime._host.env == "ie" ? 0 : this._borderLeftWidth + this._borderRightWidth)
		this._width = this._self.offsetWidth || parseInt(this._getStyle().width, 16);  // + (this._boxmode ? this._borderLeftWidth + this._borderRightWidth : 0);
		return this._width;
	};
	this.setWidth = function(w){
		//this._dom.setWidth(this._self, w);
		if(this._width != w){
			w = Math.max(0, w/* - this._marginLeft - this._marginRight*/);
			this._width = w;
			this._setWidth(this._self.tagName == "TABLE" ? w : this.getInnerWidth(w));
		}
	};
	this.getHeight = function(){
		//return this._dom.getHeight(this._self);
		//if(this._style.height.indexOf("%") != -1){
		//	return Math.round(this._self.parentNode.clientHeight * parseInt(this._style.height, 10) / 100);
		//}else{
			this._height = this._self.offsetHeight || parseInt(this._getStyle().height, 16);  // + (this._boxmode ? this._borderTopWidth + this._borderBottomWidth : 0);
			return this._height;
		//}
	};
	this.setHeight = function(h){
		//this._dom.setHeight(this._self, h);
		if(this._height != h){
			h = Math.max(0, h/* - this._marginTop - this._marginBottom*/);
			this._height = h;
			this._setHeight(this._self.tagName == "TABLE" ? h : this.getInnerHeight(h));
		}
	};
	this.getInnerWidth = function(v){
		if(!v) v = this._width;
		var innerWidth = Math.max(0, !this._boxmode ? v : v - this._borderLeftWidth - this._borderRightWidth/* - this._paddingLeft - this._paddingRight*/);
		//var innerWidth = Math.max(0, runtime.getBoxModel() == 0 ? v : v - this._borderLeftWidth - this._borderRightWidth - this._paddingLeft - this._paddingRight);
		//if(isNaN(innerWidth)) runtime.log("BoxElement::getInnerWidth isNaN(innerWidth)");
		return innerWidth;
	};
	this.setInnerWidth = function(w, skip){
		//this.setWidth(w/*- this._marginLeft - this._marginRight*/);  //绝对定位，marginRight没有作用
		w = w - (skip ? 0 : (this._marginLeft + this._marginRight))
			- this._borderLeftWidth - this._borderRightWidth
			- this._paddingLeft - this._paddingRight;
		this.__style.width = Math.max(0, w) + "px";
	};
	this.getInnerHeight = function(v){
		if(!v) v = this._height || this._self.offsetHeight;
		var innerHeight = Math.max(0, !this._boxmode ? v : v - this._borderTopWidth - this._borderBottomWidth/* - this._paddingTop - this._paddingBottom*/);
		//if(isNaN(innerHeight)) runtime.log("BoxElement::getInnerHeight isNaN(innerHeight)");
		return innerHeight;
	};
	this.setInnerHeight = function(h){
		//this.setHeight(h - this._marginTop - this._marginBottom);
		h = h - this._marginTop - this._marginBottom
			- this._borderTopWidth - this._borderBottomWidth
			- this._paddingTop - this._paddingBottom;
		this.__style.height = Math.max(0, h) + "px";
	};
	this.getOuterWidth = function(v){
		if(!v) v = this.getWidth();
		var outerWidth = Math.max(0, this._boxmode ? v + this._marginLeft + this._marginRight : v);
		//if(isNaN(outerWidth)) runtime.log("BoxElement::getOuterWidth isNaN(outerWidth)");
		return outerWidth;
	};
	this.getOuterHeight = function(v){
		if(!v) v = this.getHeight();
		var outerHeight = Math.max(0, this._boxmode ? v + this._marginTop + this._marginBottom : v);
		//if(isNaN(outerHeight)) runtime.log("BoxElement::getOuterHeight isNaN(outerHeight)");
		return outerHeight;
	};
	this.getClientWidth = function(){
		return this._self.clientWidth || this._width;
	};
	this.getClientHeight = function(){
		return this._self.clientHeight || this._height;
	};
	this.moveTo = function(x, y){
		this.setLeft(x);
		this.setTop(y);
	};
	this.resizeTo = function(w, h){
		this.setWidth(w);
		this.setHeight(h);
	};
	this.resize = function(w, h){
		runtime.log(this._self.tagName + " resize(" + w + "," + h + ")");
		this.resizeTo(w, h);
		if(this._layout || this._style.layout){
			this._layout = this._style.layout;
			this.layout();
		}
	};
	this.setRect = function(x, y, w, h){
		this.moveTo(x, y);
		this.resizeTo(w, h);
	};
	this.hasLayout = function(){
		//if(!this._layout){
		//	this._layout = this._self.getAttribute("_layout");
		//}
		return this._layout;
	};
	this.layout = function(){
		//this.__style.overflow = "hidden";
		if(!this.__layout){
			_import("alz.layout." + this._layout);  //BorderLayout
			var clazz = (__context__ || __classes__)[this._layout];
			this.__layout = new clazz();
			this.__layout.init(this._self);
		}
		switch(this._self.tagName){
		case "BODY":
			this.__layout.layoutElement(this._self.clientWidth, this._self.clientHeight);
			break;
		case "TABLE":
			this.__layout.layoutElement(
				this._self.parentNode.clientWidth,
				this._self.parentNode.clientHeight - this._borderTopWidth - this._borderBottomWidth
			);
			break;
		default:
			this.__layout.layoutElement(
				this.getClientWidth() - this._paddingLeft - this._paddingRight,
				this.getClientHeight() - this._paddingTop - this._paddingBottom
			);
			break;
		}
	};
	this.setattr = function(name, value){
		this._style[name] = value;
		switch(name){
		case "id":
			this._id = value;
			break;
		case "layout":
			this._layout = value;
			//this._self.setAttribute("_" + name, value);
			break;
		case "align":
			this._align = value;
			//this._self.setAttribute("_" + name, value);
			break;
		case "z-index":
			this.__style.zIndex = value;
			break;
		case "float":
			this.__style.cssFloat = value;
			this.__style.styleFloat = value;
			break;
		case "border":
			this.__style.border = value;
			this._borderBottomWidth =
			this._borderLeftWidth =
			this._borderRightWidth =
			this._borderTopWidth = parseInt(value);
			break;
		case "bgcolor":
		case "background-color":
			this.__style.backgroundColor = value;
			break;
		case "width":
			this.__style.width = value;
			break;
		case "height":
			if(value.charAt(value.length - 1) == "%"){
				var h = Math.round(this._self.parentNode.clientHeight * parseInt(value, 10) / 100);
				this.setHeight(h);
			}else{
				this.setHeight(value);
			}
			break;
		default:
			this._self.setAttribute("_" + name, value);
			break;
		}
	};
});
/*</file>*/
/*<file name="alz.layout.AbstractLayout">*/
_package("alz.layout");

_class("AbstractLayout", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._component = null;  //启用该布局的组件
		this._self = null;       //启用该布局的DOM元素
	};
	this.init = function(obj){
		this._self = obj;
		this._component = obj.__ptr__;
	};
	this.dispose = function(){
		this._self = null;
		this._component = null;
		_super.dispose.apply(this);
	};
	/**
	 * 使用当前布局，布置一个元素的内部子元素
	 */
	this.layoutElement = function(){
	};
});
/*</file>*/
/*<file name="alz.layout.BorderLayout">*/
_package("alz.layout");

_import("alz.core.BoxElement");
_import("alz.layout.AbstractLayout");

_class("BorderLayout", AbstractLayout, function(_super){
	var TAGS = {"NOSCRIPT":1,"INPUT":1};
	var CLASSES = {"wui-ModalPanel":1,"wui-Dialog":1};
	this._init = function(){
		_super._init.call(this);
		this._component = null;
		this._self = null;
		this._direction = "";  //vertical|horizontal
		this._nodes = [];
		this._clientNode = null;
		this._width = 0;
		this._height = 0;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._component = obj.__ptr__;
		if(this._self.tagName != "TD"){
			//this._self.style.position = "absolute";
			this._self.style.overflow = "hidden";
		}
		//this._self.style.backgroundColor = getColor();
		var nodes = obj.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			if(nodes[i].nodeType != 1) continue;  //NODE_ELEMENT
			if(nodes[i].tagName in TAGS) continue;
			if(nodes[i].className in CLASSES) continue;
			if(nodes[i].style.display == "none") continue;
			var align = nodes[i].__ptr__ && nodes[i].__ptr__._align || nodes[i].getAttribute("_align");
			if(!align){
				runtime.log("[WARNING]使用布局的结点(tagName=" + nodes[i].tagName + ",class=" + nodes[i].className + ")缺少_align属性，默认为_align=top");
				align = "top";
			}
			if(align == "none") continue;
			if(align == "client"){
				if(this._clientNode){
					runtime.log("[WARNING]使用布局的结点只能有一个_align=client的子结点");
				}
				this._clientNode = nodes[i];
				this._clientNode.style.position = "relative";
				//this._clientNode.style.overflowX = "hidden";
				//this._clientNode.style.overflowY = "auto";
			}else{
				if(this._direction == ""){
					if(align == "top" || align == "bottom"){
						this._direction = "vertical";
					}else if(align == "left" || align == "right"){
						this._direction = "horizontal";
					}else{
						runtime.log("[WARNING]布局中使用了未知的_align属性值(" + align + ")");
					}
				}else if(this._direction == "vertical" && (align == "left" || align == "right")){
					runtime.log("[WARNING]布局已经为(vertical)，不能使用left或right作为_align属性值");
				}else if(this._direction == "horizontal" && (align == "top" || align == "bottom")){
					runtime.log("[WARNING]布局已经为(horizontal)，不能使用top或bottom作为_align属性值");
				}
			}
			this._nodes.push(nodes[i]);
		}
		if(this._direction == ""){
			//if(this._self.tagName != "BODY"){
			//	runtime.log("[WARNING]未能正确识别布局方向，请检查使用布局的元素的子元素个数是不是只有一个且_align=client");
			//}
			this._direction = "vertical";
		}
		if(this._direction == "horizontal"){
			//this._self.style.overflow = "hidden";
			for(var i = 0, len = this._nodes.length; i < len; i++){
				//水平的BorderLayout布局需要替换掉原来的float布局，改由绝对定位机制实现
				this._nodes[i].style.position = "absolute";
				this._nodes[i].style.styleFloat = "";
				//this._nodes[i].style.overflow = "auto";
			}
		}
		nodes = null;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._clientNode = null;
		for(var i = 0, len = this._nodes.length; i < len; i++){
			//if(this._nodes[i]._self){
			//	this._nodes[i].dispose();  //[TODO]应该在DOMUtil::dispose中处理
			//}
			this._nodes[i] = null;
		}
		this._nodes = [];
		this._self = null;
		this._component = null;
		_super.dispose.apply(this);
	};
	/*
	this.layoutElement = function(w, h){
		if(this._width == w && this._height == h) return;
		this._width = w;
		this._height = h;
		//if(this._self.className == "ff_cntas_list"){
		//	alert(w + "," + h);
		//}
		if(this._self.tagName == "TABLE"){
			var tbl = this._self;
			tbl.style.border = "1px solid red";
			tbl.style.width = w + "px";
			tbl.style.height = h + "px";
			var cell = tbl.childNodes[0].rows[1].cells[1];
			cell.style.width = (w - 12) + "px";
			cell.style.height = (h - 22) + "px";
			var layout = new BorderLayout();
			layout.init(cell);
			layout.layoutElement(Math.max(0, w - 12), Math.max(0, h - 22));
			layout.dispose();
			layout = null;
			cell = null;
			tbl = null;
		}else if(this._self.tagName != "BODY" && this._self.tagName != "TD"){
			if(w) runtime.dom.setWidth(this._self, w);
			if(h) runtime.dom.setHeight(this._self, h);
		}
		if(this._direction == "vertical"){
			var hh = 0, h_client = 0;
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				if(node.style.display == "none") continue;
				//node.style.top = hh + "px";
				if(node != this._clientNode){
					hh += runtime.dom.getHeight(node);
				}
				node = null;
			}
			var h_client = h - hh;
			hh = 0;
			if(w) runtime.dom.setWidth(this._clientNode, w);
			runtime.dom.setHeight(this._clientNode, h_client);
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				var layout = node.getAttribute("_layout");
				if(layout == "BorderLayout"){
					//node.style.overflow = "hidden";
					var borderLayout = new BorderLayout();
					borderLayout.init(node);
					borderLayout.layoutElement(node.clientWidth, node.clientHeight);
					borderLayout.dispose();
					borderLayout = null;
				}
				node = null;
			}
		}else{  //this._direction == "horizontal"
			//横向布局使用绝对定位，marginRight在其中并不起什么实际的作用，只是在计算两个结点之间margin时有用
			//定位元素left属性时，需要减去自身marginLeft属性的值
			var ww = 0, w_client = 0;
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				if(node.style.display == "none") continue;
				node.style.left = ww + "px";
				if(node != this._clientNode){
					ww += runtime.dom.getWidth(node);
				}
				node = null;
			}
			var w_client = w - ww;
			ww = 0;
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				node.style.left = ww + "px";
				if(node == this._clientNode){
					runtime.dom.setWidth(this._clientNode, w_client);
					ww += w_client;
				}else{
					ww += runtime.dom.getWidth(node);
				}
				var h_fix = 0;
				if(this._self.className == "ff_contact_client"){
					h_fix = -2;  //(临时解决办法)RQFM-4934 通讯录页面有一个相素的缺
				}
				if(h) runtime.dom.setHeight(node, h - h_fix);
				var layout = node.getAttribute("_layout");
				if(layout == "BorderLayout"){
					//node.style.overflow = "hidden";
					var borderLayout = new BorderLayout();
					borderLayout.init(node);
					borderLayout.layoutElement(node.clientWidth, node.clientHeight);
					borderLayout.dispose();
					borderLayout = null;
				}
				node = null;
			}
		}
	};
	this.setClientNode = function(node){
		this._clientNode = node;
	};
	this.appendNode = function(node){
		this._nodes.push(node);
	};
	*/
	//获取参与布局的结点
	this._getAlignNodes = function(){
		var nodes = [];
		for(var i = 0, len = this._nodes.length; i < len; i++){
			if(this._nodes[i].style.display == "none") continue;
			if(this._nodes[i].__ptr__){
				nodes.push(this._nodes[i].__ptr__);
			}
			//nodes.push(new BoxElement(this._nodes[i]));
		}
		return nodes;
	};
	this.getClientNodeWidth = function(w, nodes){
		var nn = this._component.getProperty("paddingLeft");  //考虑paddingLeft
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			if(i == 0){  //考虑第一个元素的marginLeft
				nn += node._marginLeft;
			}
			//node.setLeft(nn);
			nn += (node._self == this._clientNode ? 0 : node.getWidth());  //node._self.offsetWidth
			if(i < len - 1){
				nn += Math.max(node._marginRight, nodes[i + 1]._marginLeft);  //取两个元素的margin最大值
			}else{  //i == len - 1 考虑最后一个元素的marginRight
				nn += node._marginRight;
			}
			node = null;
		}
		return w - nn;
	};
	this.getClientNodeHeight = function(h, nodes){
		var nn = this._component.getProperty("paddingTop");  //考虑paddingTop
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			if(i == 0){  //考虑第一个元素的marginTop
				nn += node._marginTop;
			}
			//node.setTop(nn);
			nn += (node._self == this._clientNode ? 0 : node.getHeight());  //node._self.offsetHeight
			if(i < len - 1){
				nn += Math.max(node._marginBottom, nodes[i + 1]._marginTop);  //取两个元素的margin最大值
			}else{  //i == len - 1 考虑最后一个元素的marginBottom
				nn += node._marginBottom;
			}
			node = null;
		}
		return h - nn;
	};
	this.updateDock =
	this.layoutElement = function(w, h){
		//if(this._width == w && this._height == h) return;
		this._component.resizeTo(w, h);
		//if(this._self.className == "ff_cntas_list"){
		//	alert(w + "," + h);
		//}
		if(this._self.tagName == "TABLE"){
			var tbl = this._self;
			var cell = tbl.childNodes[0].rows[1].cells[1];
			//cell.style.border = "1px solid gray";
			cell.style.width = Math.max(0, w - 12) + "px";
			cell.style.height = Math.max(0, h - 22) + "px";
			/*
			var layout = new BorderLayout();
			layout.init(cell);
			layout.layoutElement(Math.max(0, w - 12), Math.max(0, h - 22));
			layout.dispose();
			layout = null;
			*/
			cell = null;
			tbl = null;
			return;
		}else if(this._self.tagName != "BODY" && this._self.tagName != "TD"){
			//alert(this._self.tagName + "," + w + "," + h);
			//高度和宽度已经被父元素调整过了
			//if(w) runtime.dom.setWidth(this._self, w);
			//if(h) runtime.dom.setHeight(this._self, h);
			//if(w) w = runtime.dom.getInnerWidth(this._self);  //this._self.clientWidth - this._paddingLeft - this._paddingRight;
			h = this._component.getInnerHeight();  //this._self.clientHeight - this._paddingTop - this._paddingBottom;
		}
		var nodes = this._getAlignNodes();
		if(this._direction == "vertical"){
			var n_client = this.getClientNodeHeight(h, nodes);
			var nn = 0;
			for(var i = 0, len = nodes.length; i < len; i++){
				var node = nodes[i];
				if(i == 0){  //考虑第一个元素的marginTop
					nn += node._marginTop;
				}
				//node.setTop(nn);
				if(node._self == this._clientNode){
					//var b = this._self.className == "ff_cntas_list" ? 2 : 0;
					node.setHeight(n_client/* - b*/);
				}
				nn += node._self == this._clientNode ? n_client : node.getHeight();
				if(w){
					node.setInnerWidth(w);
				}
				if(node.hasLayout()){
					node.layout();
				}
				if(i < len - 1){
					nn += Math.max(node._marginBottom, nodes[i + 1]._marginTop);  //取两个元素的margin最大值
				}else{  //i == len - 1 考虑最后一个元素的marginBottom
					nn += node._marginBottom;
				}
				node = null;
			}
		}else{  //this._direction == "horizontal"
			//横向布局使用绝对定位，marginRight在其中并不起什么实际的作用，只是在计算两个结点之间margin时有用
			//定位元素left属性时，需要减去自身marginLeft属性的值
			var n_client = this.getClientNodeWidth(w, nodes);  //w - nn + runtime.dom.getStyleProperty(this._self, "paddingLeft");  //补上考虑paddingRight值
			var nn = 0;
			for(var i = 0, len = nodes.length; i < len; i++){
				var node = nodes[i];
				node.setLeft(nn);
				if(i == 0){  //考虑第一个元素的marginLeft
					nn += node._marginLeft;
				}
				if(node._self == this._clientNode){
					node.setInnerWidth(n_client, true);
				}
				nn += node._self == this._clientNode ? n_client : node.getWidth();
				if(h){
					node.setInnerHeight(h);
				}
				if(node.hasLayout()){
					node.layout();
				}
				if(i < len - 1){
					nn += Math.max(node._marginRight, nodes[i + 1]._marginLeft);  //取两个元素的margin最大值
				}else{  //i == len - 1 考虑最后一个元素的marginRight
					nn += node._marginRight;
				}
				node = null;
			}
		}
		nodes = null;
	};
});
/*</file>*/
/*<file name="alz.core.DomUtil2">*/

/*</file>*/
/*<file name="alz.core.AjaxEngine">*/
_package("alz.core");

//_import("alz.core.Exception");
_import("alz.core.ScriptLoader");
//_import("alz.core.IframeLoader");

//依赖于 runtime, runtime.getBrowser()
//[TODO]
//  1)添加防错误处理机制，保证请求队列的持续工作
//  2)短路所有的异步请求，保证单机环境下能够正常工作

/**
 * 异步数据调用引擎
 * [TODO]跨页面工作
 */
_class("AjaxEngine", "", function(_super){
	AjaxEngine._version = "1.01.0001";  //Ajax引擎的当前版本
	AjaxEngine._PROGIDS = [
		"Microsoft.XMLHTTP",
		"Msxml2.XMLHTTP",
		"Msxml2.XMLHTTP.4.0",
		"MSXML3.XMLHTTP",
		"MSXML.XMLHTTP",
		"MSXML2.ServerXMLHTTP"
	];
	//VBS版本的 UTF-8 解码函数，大数据量情况下效率低下，甚用！
	AjaxEngine._vbsCode = "Function VBS_bytes2BStr(vIn)"
		+ "\n  Dim sReturn, i, nThisChar, nNextChar"
		+ "\n  sReturn = \"\""
		+ "\n  For i = 1 To LenB(vIn)"
		+ "\n    nThisChar = AscB(MidB(vIn, i, 1))"
		+ "\n    If nThisChar < &H80 Then"
		+ "\n      sReturn = sReturn & Chr(nThisChar)"
		+ "\n    Else"
		+ "\n      nNextChar = AscB(MidB(vIn, i + 1, 1))"
		+ "\n      sReturn = sReturn & Chr(CLng(nThisChar) * &H100 + CInt(nNextChar))"
		+ "\n      i = i + 1"
		+ "\n    End If"
		+ "\n  Next"
		+ "\n  VBS_bytes2BStr = sReturn"
		+ "\nEnd Function";
	AjaxEngine.getXmlHttpObject = function(){
		var http, err;
		if(typeof XMLHttpRequest != "undefined"){
			try{
				http = new XMLHttpRequest();
				//http.overrideMimeType("text/xml");
				return http;
			}catch(ex){}
		}
		if(!http){
			for(var i = 0, len = this._PROGIDS.length; i < len; i++){
				var progid = this._PROGIDS[i];
				try{
					http = runtime.createComObject(progid);
				}catch(ex){
					err = ex;
				}
				if(http){
					this._PROGIDS = [progid];
					break;  //return http;
				}
			}
		}
		if(!http){
			//throw err;
			runtime.showException(err, "XMLHTTP not available");
		}
		return http;
	};
	this._init = function(){
		_super._init.call(this);
		this._timer = 0;
		this._msec = 10;
		this._retryMsec = 2000;  //请求失败重试的时间间隔
		this._http = null;  //[TODO]这个对象应该仅供异步请求队列使用
		this._queue = [];  //异步请求队列
		this._uniqueId = 0;  //每个请求的全局唯一编号的种子
		this._userinfo = false;
		this._testCase = null;  //测试用例
		this._retryCount = 0;
		this._scriptLoader = null;
		this._data = null;  //script-src方法获取的数据临时存储地
		this._ignoreMessages = [
			"不能执行已释放 Script 的代码"
			//"完成该操作所需的数据还不可使用。"
		];
	};
	this.init = function(){
		this._http = AjaxEngine.getXmlHttpObject();
	};
	this.dispose = function(){
		//if(this._disposed) return;
		this._data = null;
		if(this._scriptLoader){
			this._scriptLoader.dispose();
			this._scriptLoader = null;
		}
		this._testCase = null;
		this._timer = 0;
		this._http = null;
		for(var i = 0, len = this._queue.length; i < len; i++){
			this._queue[i] = null;
		}
		this._queue = [];
		_super.dispose.apply(this);
	};
	this.getTestCase = function(){
		return this._testCase;
	};
	this.setTestCase = function(v){
		this._testCase = v;
	};
	this._getScriptLoader = function(){
		if(runtime.moz || !this._scriptLoader){
			this._scriptLoader = new ScriptLoader();
			this._scriptLoader.create();
		}
		return this._scriptLoader;
	};
	this._openHttp = function(method, url, async){
		if(!this._http) this._http = AjaxEngine.getXmlHttpObject();
		var http = this._http;
		//url = url.replace(/\?/, "?rnd=" + Math.random() + "&");
		runtime.log("http.open(\"" + method + "\",\"" + url + "\"," + async + ");");
		http.open(method, url, async);
		if(method == "POST"){
			http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			if(this._userinfo){
				http.setRequestHeader("SESSIONID", "10000");
				http.setRequestHeader("USERNAME", runtime.getUser().getName());
			}
		}
		//if(runtime.getWindow().Event){  //FF 和 NS 支持 Event 对象
		if(runtime.moz){  //FF
			var ext = url.substr(url.lastIndexOf("."));
			if(ext == ".xml" || ext == ".aul"){
				http.overrideMimeType("text/xml; charset=gb2312");  //用于将 UTF-8 转换为 gb2312
			}else{
				http.overrideMimeType("text/xml");
				//http.setRequestHeader("Content-Type", "text/xml");
				//http.setRequestHeader("Content-Type", "gb2312");
			}
		}
		return http;
	};
	/**
	 * @param method {String} 提交方法(GET|POST)
	 * @param url {String} 网络调用的url
	 * @param postData {String|Object} 请求数据
	 * @param type {String} 返回只类型(text|xml)
	 * @param callback {Function} 回调函数
	 * @param cbAgrs {Array} 传给回调方法的参数
	 * @return {String|XmlDocument}
	 */
	this.netInvoke1 = function(method, url, postData, type, callback){
		try{
			var async = (typeof(callback) != "undefined" && callback != null) ? true : false;
			if(async){  //如果是异步请求，使用请求队列工作模式
				return this.netInvoke(method, url, postData, type, callback);
			}else{
				var http = this._openHttp(method, url, async);
				/*
				var div = window.document.createElement("div");
				div.style.backgroundColor = "#EEEEEE";
				div.innerHTML = url + "&" + postData;
				im_history.appendChild(div);
				*/
				http.send(postData);  //FF下面参数null不能省略
				http = null;
				return this._onSyncCallback(type);
			}
		}catch(ex){
			runtime.showException(ex, "[AjaxEngine::netInvoke1]");
			return;
		}
	};
	//内嵌函数
	this._encodeData = function(http, charset){
		if(runtime.getWindow() && charset == "utf-8"){
			return "" + http.responseText;
		}else if(runtime.getWindow() && runtime.getWindow().execScript){  //FF 不支持 execScript
			if(typeof(VBS_bytes2BStr) == "undefined"){
				runtime.getWindow().execScript(AjaxEngine._vbsCode, "VBScript");
			}
			return VBS_bytes2BStr(http.responseBody);
		}else{
			//[TODO]直接返回 responseText 会有因 UTF-8 编码而引起的乱码问题
			return http.responseText;
		}
	};
	//供加载类库代码使用的方法
	this.netInvoke2 = function(method, url, postData, charset, agent, funName, args){
		var async = (typeof(agent) != "undefined" && agent != null) ? true : false;
		if(async){  //如果是异步请求，使用请求队列工作模式
			return this.netInvoke(method, url, postData, type, agent, funName, args);
		}else{
			var http = this._openHttp(method, url, async);
			if(runtime.getHostenv() == "safari" || runtime.getHostenv() == "chrome"){  //Safari下面需要这一句
				http.onreadystatechange = null;
			}
			/*if(async){
				http.onreadystatechange = function(){
					if(http.readyState != 4) return;
					if(typeof(agent[funName]) == "function"){
						agent[funName](http.responseText);
					}else{
						agent(http.responseText);
					}
				};
			}*/
			http.send("");  //没有 "" 的话 FF 下面会报错
			//if(!async){
			var data;
			if(http.status && (200 > http.status || 300 <= http.status)){
				throw new alz.core.Exception(runtime._lang.unable_to_load_file, url, http.status);
			}else if(http.readyState && http.readyState != 4){
				throw new alz.core.Exception(runtime._lang.resource_load_failure, uri);
			}else{
				data = this._encodeData(http, charset);  //args
			}
			http = null;
			return data;
			//}
		}
	};
	/**
	 * 可以复用HTTP组件的网络调用
	 * @param method {String} 提交方法(GET|POST)
	 * @param url {String} 网络调用的url
	 * @param postData {String|Object} 请求数据
	 * @param type {String} 返回只类型(text|xml)
	 * @param agent {Object|Function} 回调代理对象或者函数对象
	 * @param funName {String} 回调代理对象的回调方法名称
	 * @param cbAgrs {Array} 传给回调方法的参数
	 * @return {String|XmlDocument}
	 * [TODO]
	 *   1)检查 agent 和 agent[funName] 必须有一个是 Function 对象
	 */
	this.netInvoke = function(method, url, postData, type, agent, funName, cbArgs){
		//inner function
		function json2str(json){
			var sb = [];
			for(var k in json){
				//下面的改进，支持跨window的json对象传递，改进逻辑参考clone方法实现
				switch(typeof json[k]){
				//case "undefined": break;  //目前不支持undefined值
				case "boolean":
				case "number":
				case "string":
					sb.push(k + "=" + encodeURIComponent(json[k]));
					break;
				case "object":
					if(json[k] === null){  //null
						//目前不支持null值
					}else{
						//因为跨 window 操作，所以不能使用 instanceof 运算符
						//if(json[k] instanceof Array){
						if("length" in json[k]){  //array
							//把js数组转换成PHP能够接收的PHP数组
							for(var i = 0, len = json[k].length; i < len; i++){
								sb.push(k + "=" + encodeURIComponent(json[k][i]));
							}
						}else{  //object
							//目前不支持object类型的参数
						}
					}
					break;
				}
			}
			return sb.join("&");
		}
		//if(runtime._debug){
		//	check typeof agent || agent[funName] == "function"
		//}
		var req = {
			uniqueid: ++this._uniqueId,  //先加后用
			method  : method,
			url     : url,
			data    : (typeof postData == "string" ? postData : json2str(postData)),
			type    : type,
			agent   : agent,
			fun     : funName,
			args    : cbArgs
		};
		this._queue.push(req);
		req = null;
		if(this._timer == 0) this._startAjaxThread();
		return this._uniqueId;
	};
	/**
	 * 暂停异步请求的工作线程
	 * @param abort {boolean} 是否中断当前的请求
	 */
	this.pauseAjaxThread = function(abort){
		if(abort){
			this._http.abort();  //中止当前请求
		}
		runtime.getWindow().clearTimeout(this._timer);  //结束定时器
		this._timer = 0;
	};
	/**
	 * 开始异步请求的工作线程
	 */
	this._startAjaxThread = function(msec){
		var _this = this;
		this._timer = runtime.getWindow().setTimeout(function(){
			_this._ajaxThread();
		}, msec || this._msec);
	};
	this._checkAjaxThread = function(retry){
		if(this._queue.length != 0){
			this._startAjaxThread(retry ? this._retryMsec : null);
		}else{
			this.pauseAjaxThread();
		}
	};
	this._ajaxThread = function(){
		var req  = this._queue[0];
		if(runtime._testCaseWin){
			runtime._testCaseWin.log(req.url + "?" + req.data);
		}
		var _this = this;
		if(this._testCase && this._testCase.doFilter(req.url)){
			var o = this._testCase.doService(req.url, this._testCase.getRequest(req.data));
			if(o){
				window.setTimeout(function(){_this._onTestCaseCallback(o)}, 0);
			}
		}else{
			if(req.type == "script_json"){
				var loader = this._getScriptLoader();
				loader.setCallback(function(){
					_this._onScriptCallback();
				});
				loader.load(req.url, req.data);
				loader = null;
			}else{
				var http = this._openHttp(req.method, req.url, true);
				var _this = this;
				http.onreadystatechange = function(){_this._onAsyncCallback();};
				http.send(req.data);
				http = null;
			}
		}
		req = null;
		return;
	};
	this._onTestCaseCallback = function(o){
		var req = this._queue[0];
		//调用真实的回调函数
		if(typeof(req.agent) == "function"){
			req.agent(o, req.args);
		}else if(typeof(req.fun) == "function"){
			var fun = req.fun;
			fun.call(req.agent, o, req.args);
			fun = null;
		}else{
			req.agent[req.fun](o, req.args);
		}
		this._queue[0] = null;
		this._queue.shift();  //清除队列第一个元素
		this._checkAjaxThread();
	};
	/**
	 * 同步回调函数
	 */
	this._onSyncCallback = function(type){
		if(this._http.readyState != 4){
			throw "资源文件加载失败";
		}
		//检查状态 this._http.readyState 和 this._http.status
		var status = this._http.status;
		if(status == 0 || (status >= 200 && status < 300)){
			return this._getResponseData(type, this._http);
		}else{
			try{
				switch(status){
				case 12002: // Server timeout
				case 12007:
				case 12029: // 12029 to 12031 correspond to dropped connections.
				case 12030: // See above comments for variable status.
				case 12031: // Internet connection reset error.
				case 12152: // Connection closed by server.
				case 13030: // See above comments for variable status.
				default:
					runtime.showException("同步请求错误"
						+ "\nstatus=" + status
						+ "\nstatusText=" + this._http.statusText
					);
					break;
				}
			}catch(ex){
			}
		}
	};
	/**
	 * 异步回调函数
	 * [TODO]
	 *   1)把当前出错的请求移动到队列的末尾去，应该更好，但是如果相邻的请求有先后
	 * 依赖关系则不建议这么做。
	 *   2)增加简单的是否重试的确认机制。
	 */
	this._onAsyncCallback = function(){
		if(this._http.readyState != 4) return;
		var retry = false;
		var status = this._http.status;
		if(status == 0 || (status >= 200 && status < 300)){
			this._retryCount = 0;  //只要成功一次，就置零
			var req  = this._queue[0];
			var o = this._getResponseData(req.type, this._http);
			//调用真实的回调函数
			if(typeof(req.agent) == "function"){
				//try{
					req.agent(o, req.args);
				//}catch(ex){
				//	if(ex.message != this._ignoreMessages[0]){
				//		throw ex;
				//	}
				//}
			}else if(typeof(req.fun) == "function"){
				//try{
					var fun = req.fun;
					fun.call(req.agent, o, req.args);
					fun = null;
				//}catch(ex){
				//	if(ex.message != this._ignoreMessages[0]){
				//		throw ex;
				//	}
				//}
			}else{
				//try{
					req.agent[req.fun](o, req.args);
				//}catch(ex){
				//	if(ex.message != this._ignoreMessages[0]){
				//		throw ex;
				//	}
				//}
			}
			req = null;
			this._queue[0] = null;
			this._queue.shift();  //清除队列第一个元素
		}else{
			/*
			try{
				switch(status){
				case 12002: // Server timeout
				case 12007:
				case 12029: // 12029 to 12031 correspond to dropped connections.
				case 12030: // See above comments for variable status.
				case 12031:
				case 12152: // Connection closed by server.
				case 13030: // See above comments for variable status.
					runtime.showException("异步请求错误"
						+ "\nstatus=" + status
						+ "\nstatusText=" + this._http.statusText
					);
					break;
				default:
					break;
				}
			}catch(ex){
			}
			*/
			this._retryCount++;
			if(this._retryCount <= 3){  //重试三次
				retry = true;
			}else{
				retry = runtime.getWindow().confirm("异步请求错误："  //runtime.showException
					+ "\nstatus=" + status
					+ "\nstatusText=" + this._http.statusText
					+ "\n是否重试本次请求？"
				);
			}
			this._http.abort();  //中止当前出错的请求
			if(!retry){  //如果不需要重试的话
				this._queue[0] = null;
				this._queue.shift();  //清除队列第一个元素
			}
		}
		this._checkAjaxThread(retry);
	};
	/**
	 * SCRIPT-src 异步回调函数
	 */
	this._onScriptCallback = function(){
		this._retryCount = 0;  //只要成功一次，就置零
		var req  = this._queue[0];
		var o = this._data;
		this._data = null;  //保证不对其他的请求产生影响
		//调用真实的回调函数
		if(typeof(req.agent) == "function"){
			//try{
				req.agent(o, req.args);
			//}catch(ex){
			//	if(ex.message != this._ignoreMessages[0]){
			//		throw ex;
			//	}
			//}
		}else if(typeof(req.fun) == "function"){
			//try{
				var fun = req.fun;
				fun.call(req.agent, o, req.args);
				fun = null;
			//}catch(ex){
			//	if(ex.message != this._ignoreMessages[0]){
			//		throw ex;
			//	}
			//}
		}else{
			//try{
				req.agent[req.fun](o, req.args);
			//}catch(ex){
			//	if(ex.message != this._ignoreMessages[0]){
			//		throw ex;
			//	}
			//}
		}
		req = null;
		this._queue[0] = null;
		this._queue.shift();  //清除队列第一个元素
		this._checkAjaxThread();
	};
	this._getResponseData = function(type, http){
		var o;  //o = Bytes2BStr(this._http.responseBody);
		switch(type){
		case "text": o = "" + http.responseText;break;
		case "json": o = runtime.parseJson(http.responseText);break;
		case "xml":
		default:
			if(runtime.ie){
				var xmlDoc = runtime.createComObject("Msxml.DOMDocument");
				xmlDoc.async = false;
				xmlDoc.loadXML(http.responseText);
				o = xmlDoc;  //.documentElement
			}else{
				o = http.responseXML;
			}
			break;
		}
		return o;
	};
	/*
	this.netInvoke = function(method, url, postData, type, callback){
		try{
			var async = callback ? true : false;
			this._http.open(method, url, async);
			if(async){
				var _this = this;
				this._http.onreadystatechange = function(){
					if(_this._http.readyState == 4){
						_this.onreadystatechange(type, callback);
					}
				};
			}
			/ *
			var div = runtime.getDocument().createElement("div");
			div.style.backgroundColor = "#EEEEEE";
			div.innerHTML = url + "&" + postData;
			im_history.appendChild(div);
			* /
			if(method == "POST"){
				this._http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			}
			this._http.send(postData);  //FF下面参数null不能省略
			if(async){
				return;
			}else{
				//检查状态 this._http.readyState 和 this._http.status
				if(this._http.readyState != 4){
					runtime.getWindow().alert("资源文件加载失败");
					return;
				}else{
					return this.onreadystatechange(type);
				}
			}
		}catch(ex){
			var a = [];
			for(var k in ex){
				a.push(k + "=" + ex[k]);
			}
			runtime.getWindow().alert(a.join("\n"));
			return;
		}
	};
	this.onreadystatechange = function(type, callback){
		//code = Bytes2BStr(this._http.responseBody);
		var o;
		switch(type){
		case "text":
			o = "" + this._http.responseText;
			break;
		case "xml":
		default:
			o = this._http.responseXML;
			break;
		}
		if(callback){
			callback(o);
		}else{
			return o;
		}
	};
	*/
	/**
	 * 调用一个请求队列
	 * @param queue {Array} 请求队列数组
	 * @param agent {Object} 回调代理对象
	 * @param callback {Function} 回调函数
	 */
	this.netInvokeQueue = function(queue, agent, callback){
		var i = 0;
		var _this = this;
		function cb(){
			if(i < queue.length){
				var req = queue[i];
				//netInvoke(method, url, postData, type, agent, funName)
				_this.netInvoke.call(_this, req[0], req[1], req[2], req[3], function(data){
					var agent = req[4];
					var fun   = req[5];
					//调用真实的回调函数
					if(typeof(agent) == "function"){
						agent(data, req[6]);
					}else if(typeof(fun) == "function"){
						fun.call(agent, data, req[6]);
					}else{
						agent[fun](data, req[6]);
					}
					fun = null;
					agent = null;
					req = null;
					i++;
					runtime.getWindow().setTimeout(cb, 0);  //调用下一个
				});
			}else{  //队列完成
				callback.apply(agent);
			}
		}
		cb.call(this);
	};
	this.getReqIndex = function(uniqueid){
		for(var i = 0, len = this._queue.length; i < len; i++){
			if(this._queue[i].uniqueid == uniqueid){
				return i;
			}
		}
		return -1;
	};
	/**
	 * 终止指定的 uniqueid 的某个请求，队列正常运转
	 * @param uniqueid {number} 每个请求的全局唯一编号
	 */
	this.abort = function(uniqueid){
		var n = this.getReqIndex(uniqueid);
		if(n == -1) return;
		if(n == 0){  //如果是当前请求
			this._http.abort();  //中止当前请求
			this._queue[n] = null;
			this._queue.shift();  //清除队列第一个元素
			this._checkAjaxThread();
		}else{
			this._queue[n] = null;
			this._queue.removeAt(n);
		}
	};
});
/*</file>*/
/*<file name="alz.core.Ajax">*/

/*</file>*/
/*<file name="alz.template.TemplateManager">*/
_package("alz.template");

_import("alz.template.TrimPath");

/**
 * 提供对模板数据的管理支持，实现了对多种类型的前端模板的管理和方便的外部调用接
 * 口，达到分离前端开发过程中逻辑和界面的初步分离。
 *
 * [TODO]TrimPath 每次重复解析模板的性能问题还没有解决。
 *
 * 模板的类型
 * html = 纯 HTML 代码
 * tpl  = 符合 /\{[\$=]\w+\}/ 规则的简易模板
 * asp  = 仿 ASP 语法的模板
 */
_class("TemplateManager", "", function(_super){
	//var RE_TPL = /<!-- template name=\"(\w+\.tpl)\" type=\"(html|tpl|asp)\"( title=\"[^\"]+\")* -->/;
	var RE_TPL = /<template name=\"(\w+\.tpl)\" type=\"(html|tpl|asp|tmpl|xml)\"(?: params=\"([^\"]+)\")*( title=\"[^\"]+\")*>/;
	function str2xmldoc(str){
		var xmldoc;
		if(runtime.ie){
			xmldoc = runtime.createComObject("Msxml.DOMDocument");
			xmldoc.async = false;
			xmldoc.loadXML(str);
		}else{
			xmldoc = (new DOMParser()).parseFromString(str, "text/xml");
		}
		return xmldoc;
	}
	this._init = function(){
		_super._init.call(this);
		this._path = "";
		this._templates = {};  //模板库 "name":{tpl:"",func:null}
		this._func = null;
		this._trimPath = null;
		this._context = {  //[只读]模板编译后的函数公用的上下文环境对象
			"trim": function(str){return str.replace(/^\s+|[\s\xA0]+$/g, "");}
		};
	};
	this.init = function(path){
		this._path = path;
		this._trimPath = new TrimPath();
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var k in this._templates){
			this._templates[k].data = null;
			this._templates[k].func = null;
			delete this._templates[k];
		}
		_super.dispose.apply(this);
	};
	this.load1 = function(tpls, callback){
		var i = 0;
		var _this = this;
		function cb(data){
			_this.addTemplate(tpls[i], "asp", data);
			i++;
			if(i < tpls.length){
				window.setTimeout(function(){
					runtime.getAjax().netInvoke("GET", _this._path + tpls[i], "", "text", cb);
				}, 0);
			}else{
				callback();  //模板加载完毕后，执行回调函数
			}
		}
		runtime.getAjax().netInvoke("GET", this._path + tpls[i], "", "text", cb);
	};
	this.load2 = function(tpls, callback){
		var arr = $("tpldata").innerHTML.split("$$$$");
		for(var i = 0, len = arr.length; i < len; i++){
			this.addTemplate(tpls[i], "asp", arr[i]);
		}
		callback();
	};
	/**
	 * 使用脚本解析原始的模版文件
	 */
	this.load3 = function(tplData, callback){
		var arr = tplData.split("$$$$");
		for(var i = 0, len = arr.length; i < len; i++){
			//if(runtime.opera){
			//	arr[i] = runtime.decodeHTML(arr[i]);
			//}
			var a = RE_TPL.exec(arr[i]);
			if(a){
				this.addTemplate(a[1], a[2], arr[i]);
			}else{
				window.alert("找不到模板的 name 属性");
			}
		}
		callback();
	};
	/**
	 * @param data {Array} 数组类型的模板列表
	 * @param agent {Object} 回调代理对象
	 * @param fun {Function} 回调函数
	 */
	this.load = function(data, agent, fun){
		for(var i = 0, len = data.length; i < len; i++){
			/*
			var a = RE_TPL.exec(data[i]);
			if(a){
				this.addTemplate(a[1], a[2], data[i]);
			}else{
				window.alert("找不到模板的 name 属性");
			}
			*/
			this.addTemplate1(data[i]);
		}
		fun.call(agent);
	};
	this.loadData = function(url, agent, funName){
		runtime.getAjax().netInvoke("POST", url, "", "json", this, function(json){
			this.load(json, this, function(){
				funName.apply(agent);
			});
		});
	};
	/**
	 * 添加一个模板到模板管理类中
	 * @param name {String} 必选，要添加的模板的名称
	 * @param type {String} 必选，模板的类型，参见说明
	 * @param data {String} 必选，模板内容
	 * @return {void} 原始的模板内容
	 */
	this.addTemplate = function(name, type, data){
		if(this._templates[name]){
			window.alert("模板 " + name + " 已经存在！");
		}else{
			var tpl = {"name":name, "data":data, "type":type, "func": null};
			if(type == "asp"){  //html,tpl 类型模板，不需要编译
				with(this._context){
					eval("var func = " + this.parse(data) + ";");
				}
				tpl.func = func;
			}
			this._templates[name] = tpl;
		}
	};
	this.addTemplate1 = function(data){
		var name = data.name;
		var type = data.type;
		var tpl = data.tpl;
		if(this._templates[name]){
			window.alert("模板 " + name + " 已经存在！");
		}else{
			var template = {"name":name, "data":tpl, "type":type, "func": null};
			if(type == "asp"){  //html,tpl 类型模板，不需要编译
				with(this._context){
					eval("var func = " + this.parse(tpl, data.params) + ";");
				}
				template.func = func;
			}
			this._templates[name] = template;
		}
	};
	this.callTpl = function(html, json){
		if(!json) return html;
		var _this = this;
		return html.replace(/\{([\$=])(\w+)\}/g, function(_0, _1, _2){
			switch(_1){
			case "$":
				if(_2 in json){
					return json[_2];
				}else{
					return _0;
				}
			case "=":
				return _this.getTemplate(_2 + ".tpl");
			}
		});
	};
	this.getTemplate = function(name){
		if(this._templates[name].type == "xml"){
			return str2xmldoc(this._templates[name].data);
		}else{
			return this._templates[name].data;
		}
	};
	this.invoke = function(name){
		var arr = [];
		for(var i = 1, len = arguments.length; i < len; i++){
			arr.push(arguments[i]);
		}
		var html, tpl = this._templates[name];
		if(!tpl){
			window.alert("请确认模板" + name + "已经存在");
		}else{
			switch(tpl.type){  //根据模板的类型，使用不同的方式生成 HTML 代码
			case "html":  //直接输出
				html = tpl.data;
				break;
			case "tpl":  //使用正则替换
				html = this.callTpl(tpl.data, arr[0]);
				break;
			case "asp":  //执行函数调用
				html = this._templates[name].func.apply(null, arr);
				break;
			case "tmpl":
				html = this._trimPath.parseTemplate(this._templates[name].data).process(arguments[1]);
				break;
			case "xml":
				html = tpl.data;
				break;
			}
		}
		return html;
	};
	/**
	 * 在指定的DOM元素中渲染一个模板的内容
	 * @param element {HTMLElement}
	 * @param tplName {String}
	 */
	this.render = function(element, tplName){
		var arr = [];
		for(var i = 1, len = arguments.length; i < len; i++){
			arr.push(arguments[i]);
		}
		element.innerHTML = this.invoke.apply(this, arr);  //arr[0] = tplName;
	};
	/**
	 * 如果使用追加方式需要考虑，追加的模版是不是_align="client"停靠的面板，以便于
	 * 方便的布局的正常工作
	 */
	this.render2 = function(element, tplName){
		var arr = [];
		for(var i = 1, len = arguments.length; i < len; i++){
			arr.push(arguments[i]);
		}
		var tpl = this.invoke.apply(this, arr);  //arr[0] = tplName;
		element.appendChild(runtime.createDomElement(tpl));
	};
	/**
	 * 渲染指定的模板和数据到Pane组件中
	 * @param pane {Pane} Pane 类型组件
	 * @param tplName 模板名字
	 */
	this.renderPane = function(pane, tplName){
		this.render.apply(this, arguments);
		pane.initComponents();
	};
	var TAGS = {
		"start": [
			{"tag":"<!--%","len":5,"p":-1},
			{"tag":"(%"   ,"len":2,"p":-1}
		],
		"end": [
			{"tag":"%-->" ,"len":4,"p":-1},
			{"tag":"%)"   ,"len":2,"p":-1}
		]
	};
	function dumpTag(t){
		alert(t.tag + "," + t.len + "," + t.p);
	}
	function findTag(code, t, start){  //indexOf
		var tags = TAGS[t];
		var pos = Number.MAX_VALUE;
		var t = null;
		for(var i = 0, len = tags.length; i < len; i++){
			var p = code.indexOf(tags[i].tag, start);
			if(p != -1 && p < pos){
				t = tags[i];
				t.p = p;
				pos = p;
			}
		}
		if(t == null){
			return {"tag":"#tag#","len":0,"p":-1};
		}else{
			return t;
		}
	}
	/**
	 * 将字符串转换成可以被字符串表示符号(",')括起来已表示原来字符串意义的字符串
	 * @param str {String} 要转换的字符串内容
	 */
	this.toJsString = function(str){
		if(typeof(str) != "string") return "";
		return str.replace(/[\\\'\"\r\n]/g, function(_0){
			switch(_0){
			case "\\": return "\\\\";
			case "\'": return "\\\'";
			case "\"": return "\\\"";
			case "\t": return "\\t";
			case "\n": return "\\n";
			case "\r": return "\\r";
			}
		});
	};
	/**
	 * 将类似 ASP 代码的模板解析为一个 JS 函数的代码形式
	 * @param code {String} 模板的内容
	 * @param params {String} 模板编译“目标函数”参数列表的字符串形式表示
	 */
	this.parse = function(code, params){
		/*
		var tag0 = "<!" + "--%";
		var l0 = tag0.length;
		var p0 = code.indexOf(tag0, 0);
		var t0 = {"tag":tag0,"len":l0,"p":p0};
		*/
		var t0 = findTag(code, "start", 0);  //寻找开始标签
		//dumpTag(t0);
		var tag1 = "%--" + ">";
		var l1 = tag1.length;
		var p1 = -l1;
		var t1 = {"tag":tag1,"len":l1,"p":p1};
		var sb = [];
		sb.push("function(" + (params || "") + "){");
		sb.push("\nvar __sb = [];");
		var bExp = false;  //是否正在解析表达式
		while(t0.p != -1){
			if(t0.p > t1.p + t1.len){
				if(bExp){
					var s = sb.pop();
					s = s.substr(0, s.length - 2)
						+ " + \"" + this.toJsString(code.substring(t1.p + t1.len, t0.p)) + "\""
						+ s.substr(s.length - 2);
					sb.push(s);
				}else{
					sb.push("\n__sb.push(\"" + this.toJsString(code.substring(t1.p + t1.len, t0.p)) + "\");");
				}
			}
			t1 = findTag(code, "end", t0.p + t0.len);  //寻找结束标签
			//dumpTag(t1);
			//t1.p = code.indexOf(t1.tag, t0.p + t0.len);
			if(t1.p != -1){
				switch(code.charAt(t0.p + t0.len)){
				case "!":  //函数声明
					if(!params){  //忽略声明中的参数获取方式
						bExp = false;
						sb[0] = code.substring(t0.p + t0.len + 1, t1.p - 1) + "{";  //忽略声明结束的分号，并替换成 "{"
					}
					break;
				case '=':  //如果表达式，把表达式的结果缓存到 __sb 中
					bExp = true;
					var s = sb.pop();
					//把一部分属于js表达式的代码添加到前面一个__sb.push（还可能是'var __sb = [];'定义）中
					//s = s.substr(0, s.length - 2)
					//	+ (sb.length <= 2 ? "" : " + ")
					//	+ code.substring(t0.p + t0.len + 1, t1.p)
					//	+ s.substr(s.length - 2);
					s = s.substr(0, s.length - 2)                     //上一个__sb元素插入点之前的部分
						+ (s.charAt(s.length - 3) == "[" ? "" : " + ")  //处理特殊情况
						+ code.substring(t0.p + t0.len + 1, t1.p)       //表达式部分
						+ s.substr(s.length - 2);                       //上一个__sb元素插入点之后的部分
					sb.push(s);
					//sb.push("\n__sb.push(" + code.substring(t0.p + t0.len + 1, t1.p) + ");");
					break;
				default:  //普通的代码，保持不变
					bExp = false;
					sb.push(code.substring(t0.p + t0.len, t1.p));
					break;
				}
			}else{
				return "模板中的'" + t0.tag + "'与'" + t1.tag + "'不匹配！";
			}
			t0 = findTag(code, "start", t1.p + t1.len);  //寻找开始标签
			//dumpTag(t0);
			//t0.p = code.indexOf(t0.tag, t1.p + t1.len);
		}
		if(t1.p + t1.len >= 0 && t1.p + t1.len < code.length){  //保存结束标志之后的代码
			sb.push("\n__sb.push(\"" + this.toJsString(code.substr(t1.p + t1.len)) + "\");");
		}
		sb.push("\nreturn __sb.join(\"\");");
		sb.push("\n}");
		return sb.join("");
		//return parseJson(sb.join("\n"))();
	};
	this.getInnerHTML = function(node){
		var sb = [];
		var nodes = node.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			sb.push(this.node2html(nodes[i]));
		}
		nodes = null;
		return sb.join("");
	};
	this._hashTag = {"meta":1,"link":1,"img":1,"input":1,"br":1};
	this.node2html = function(node){
		var sb = [];
		switch(node.nodeType){
		case 1:  //NODE_ELEMENT
			var tagName = node.tagName;
			sb.push("<" + tagName);
			for(var i = 0, len = node.attributes.length; i < len; i++){
				var name = node.attributes[i].nodeName;
				var value = node.attributes[i].nodeValue;
				/*
				if(name in this._hashAAA){
					if(!(tagName in this._hashAAA[name])){
						print("[error]" + tagName + "不允许存在" + name+ "属性(value=" + value + ")\n");
					}
				}else if(name.charAt(0) == "_"){
					print("[warning]" + tagName + "含有自定义属性" + name+ "=\"" + value + "\"\n");
				}else if(name == "style"){
					print("[warning]" + tagName + "含有属性" + name+ "=\"" + value + "\"\n");
				}else if(name.substr(0, 2) == "on"){
					print("[warning]" + tagName + "含有事件代码" + name+ "=\"" + value + "\"\n");
				}else if(!(name in this._att)){
					print("[error]" + tagName + "含有未知属性" + name+ "=\"" + value + "\"\n");
				}
				*/
				sb.push(" " + name + "=\"" + value + "\"");
			}
			if(node.hasChildNodes()){
				sb.push(">");
				var nodes = node.childNodes;
				for(var i = 0, len = nodes.length; i < len; i++){
					sb.push(this.node2html(nodes[i]));
				}
				nodes = null;
				sb.push("</" + tagName + ">");
			}else{
				if(tagName in this._hashTag){
					sb.push(" />");
				}else{
					//print("[warning]" + tagName + "是空标签\n");
					sb.push("></" + tagName + ">");
				}
			}
			break;
		case 3:  //NODE_TEXT
			sb.push(node.nodeValue);
			break;
		case 4:  //NODE_CDATA_SECTION
			sb.push("<![CDATA[" + node.data + "]]>");
			break;
		case 8:  //NODE_COMMENT
			//sb.push("<!--" + node.data + "-->");
			break;
		default:
			//print("[warning]无法处理的nodeType" + node.nodeType + "\n");
			break;
		}
		return sb.join("");
	};
});
/*</file>*/
/*<file name="alz.core.EventTarget">*/
_package("alz.core");

_class("EventTarget", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		/**
		 * 所有的事件响应函数都不与组件对象绑定，而是存储在这个映射表中
		 * [注意]不能将该属性放到原型属性里面去，不然两个对象会共享之
		 */
		this._eventMaps = {};  //事件映射表
		//this._listeners = {};
		this._listener = null;
		this._enableEvent = true;
		this._parent = null;  //组件所属的父组件
		this._disabled = false;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._parent = null;
		this._listener = null;
		_super.dispose.apply(this);
	};
	this.setEnableEvent = function(v){
		this._enableEvent = v;
	};
	this.getParent = function(){
		return this._parent;
	};
	this.setParent = function(v){
		this._parent = v;
	};
	this.getDisabled = function(){
		return this._disabled;
	};
	this.setDisabled = function(v){
		this._disabled = v;
	};
	this.addEventListener1 = function(eventMap, listener){
		this._listener = listener;
		if(eventMap == "mouseevent"){
			eventMap = "mousedown,mouseup,mousemove,mouseover,mouseout,click,dblclick";
		}else if(eventMap == "keyevent"){
			eventMap = "keydown,keypress,keypressup";
		}
		var maps = eventMap.split(",");
		for(var i = 0, len = maps.length; i < len; i++){
			if(this._self){
				this._self["on" + maps[i]] = function(ev){
					ev = ev || runtime.getWindow().event;
					//if(ev.type == "mousedown") window.alert(121);
					if(this._ptr._enableEvent){  //如果启用了事件相应机制，则触发事件
						if(ev.type in this._ptr._listener){
							this._ptr._listener[ev.type].call(this._ptr, ev);
						}
					}
				};
			}
		}
		maps = null;
	};
	this.removeEventListener1 = function(eventMap){
		if(eventMap == "mouseevent"){
			eventMap = "mousedown,mouseup,mousemove,mouseover,mouseout,click,dblclick";
		}else if(eventMap == "keyevent"){
			eventMap = "keydown,keypress,keypressup";
		}
		var maps = eventMap.split(",");
		for(var i = 0, len = maps.length; i < len; i++){
			if(this._self){
				this._self["on" + maps[i]] = null;
			}
		}
		maps = null;
		this._listener = null;
	};
	/**
	 * 此方法允许在事件目标上注册事件侦听器。
	 * @java void addEventListener(String type, EventListener listener, boolean useCapture);
	 * [TODO]检查type的合法值
	 * [TODO]同一个事件响应函数不应该被绑定两次
	 */
	this.addEventListener = function(type, eventHandle, useCapture){
		if(!this._eventMaps[type]){
			this._eventMaps[type] = [];  //[TODO]使用{}来模拟多个事件执行顺序的无关性
		}
		this._eventMaps[type].push(eventHandle);
	};
	this.removeEventListener = function(type, eventHandle, useCapture){
		if(this._eventMaps[type]){
			var arr = this._eventMaps[type];
			for(var i = 0, len = arr.length; i < len; i++){
				if(eventHandle == null){  //移除所有事件
					arr[i] = null;
					arr.removeAt(i, 1);
				}else if(arr[i] == eventHandle){
					arr[i] = null;
					arr.removeAt(i, 1);  //移除元素
					break;
				}
			}
		}
	};
	this.dispatchEvent = function(ev){
		var ret = true;
		for(var obj = this; obj; obj = obj._parent){  //默认事件传递顺序为有内向外
			if(obj._disabled){
				ev.cancelBubble = true;
				ret = false;
				break;  //continue;
			}
			if(obj["on" + ev.type]){  //如果组件的时间响应方法存在
				ret = obj["on" + ev.type](ev);  //应该判断事件响应函数的返回值并做些工作
				if(ev.cancelBubble){
					return ret;  //如果禁止冒泡，则退出
				}
			}else{
				var map = obj._eventMaps[ev.type];
				if(map){  //检查事件映射表中是否有对应的事件
					var bCancel = false;
					ev.cancelBubble = false;  //还原
					for(var i = 0, len = map.length; i < len; i++){
						ret = map[i].call(obj, ev);
						bCancel = bCancel || ev.cancelBubble;  //有一个为真，则停止冒泡
					}
					ev.cancelBubble = false;  //还原
					if(bCancel){
						return ret;  //如果禁止冒泡，则退出
					}
				}
			}
			//[TODO]事件变更发送者的时候，offsetX,offsetY属性也要随着发生遍化
			ev.sender = obj;
			if(obj._self){  //[TODO] obj 有可能是designBox，而它没有_self属性
				ev.offsetX += obj._self.offsetLeft;
				ev.offsetY += obj._self.offsetTop;
			}
		}
		return ret;
	};
});
/*</file>*/
/*<file name="alz.core.Application">*/
_package("alz.core");

_import("alz.core.EventTarget");

/**
 * [TODO]
 * 1)application 变量在 runtime.createApp 方法返回之后被覆盖了
 */
_class("Application", EventTarget, function(_super){
	/*
	var __exts = [];
	Application.regExt = function(fun){  //注册应用的扩展
		var o = new fun();
		__exts.push(o);
		for(var k in o){
			if(k == "_init") continue;  //[TODO]
			if(k == "init" || k == "dispose") continue;  //忽略构造或析构函数
				Application.prototype[k] = o[k];  //绑定到原型上
		}
		o = null;
	};
	*/
	this._init = function(){
		__context__.application = this;
		_super._init.call(this);
		this._appconf = null;  //应用配置信息
		this._parentApp = null;
		this._historyIndex = -1;
		this.params = null;
		this._workspace = null;
		this._hotkey = {};  //热键
		this._domTemp = null;
		/*
		this._cache = {  //参考了 prototype 的实现
			findOrStore: function(value){
				return this[value] = this[value] || function(){
					return value.apply(null, [this].concat(runtime.toArray(arguments)));
				};
			}
		};
		*/
		//执行构造扩展
		//for(var i = 0, len = __exts.length; i < len; i++){
		//	__exts[i]._init.call(this);
		//}
	};
	this.init = function(){
		//_super.init.apply(this, arguments);
		this._workspace = runtime._workspace;
		//注册系统热键
		runtime.getDom().addEventListener(runtime.getDocument(), "keydown", function(ev){
			ev = ev || runtime.getWindow().event;
			if("_" + ev.keyCode in this._hotkey){  //如果存在热键，则执行回掉函数
				var ret, o = this._hotkey["_" + ev.keyCode];
				switch(o.type){
				case 0: ret = o.agent(ev);break;
				case 1: ret = o.agent[o.cb](ev);break;
				case 2: ret = o.cb.apply(o.agent, [ev]);break;
				}
				o = null;
				return ret;
			}
		}, this);
		//执行初始化扩展
		//for(var i = 0, len = __exts.length; i < len; i++){
		//	__exts[i].init.apply(this, arguments);
		//}
	};
	this.dispose = function(){
		if(this._disposed) return;
		//执行析构扩展
		//for(var i = 0, len = __exts.length; i < len; i++){
		//	__exts[i].dispose.apply(this, arguments);
		//}
		this._domTemp = null;
		//runtime.getDocument().onkeydown = null;
		for(var k in this._hotkey){
			delete this._hotkey[k];
		}
		this._workspace = null;
		this.params = null;
		this._parentApp = null;
		this._appconf = null;
		_super.dispose.apply(this);
	};
	this.onContentLoad = function(){
	};
	/**
	 * 注册系统热键
	 * @param keyCode {Number} 热键编码
	 * @param callback {Function} 回调函数
	 */
	this.regHotKey = function(keyCode, agent, callback){
		var type;
		if(typeof(agent) == "function"){
			type = 0;
		}else if(typeof(agent) == "object" && typeof(callback) == "string"){
			type = 1;
		}else if(typeof(agent) == "object" && typeof(callback) == "function"){
			type = 2;
		}else{
			runtime.showException("回调参数错误");
			return;
		}
		if(!this._hotkey["_" + keyCode]){
			this._hotkey["_" + keyCode] = {type: type, agent: agent, cb: callback};
		}
	};
	this.createDomElement = function(html){
		if(!this._domTemp){
			this._domTemp = window.document.createElement("div");
		}
		this._domTemp.innerHTML = html;
		return this._domTemp.removeChild(this._domTemp.childNodes[0]);
	};
	this.setParentApp = function(v){
		this._parentApp = v;
	};
	this.setHistoryIndex = function(v){
		this._historyIndex = v;
	};
});
/*</file>*/
/*<file name="alz.core.AppManager">*/
_package("alz.core");

_import("alz.core.LibLoader");
_import("alz.core.Application");

_class("AppManager", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._confList = {};  //APP配置数据
		this._hash = {};
		this._list = [];
		this._mainApp = null;
	};
	//初始化所有应用
	this.init = function(){
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i].init){
				this._list[i].init();
			}
		}
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i].onContentLoad();
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._mainApp = null;
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i].dispose();
			this._list[i] = null;
		}
		this._list = [];
		for(var k in this._hash){
			//this._hash[k].dispose();
			delete this._hash[k];
		}
		_super.dispose.apply(this);
	};
	//调整所有应用的大小
	this.onResize = function(w, h){
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i].onResize){
				try{
					this._list[i].onResize(w, h);
				}catch(ex){
				}
			}
		}
	};
	this.setConfList = function(list){
		for(var i = 0, len = list.length; i < len; i++){
			if(list[i].id in this._confList){
				window.alert("[warning]appid(" + list[i].id + ")重复");
			}
			list[i].appnum = 0;
			this._confList[list[i].id] = list[i];
		}
	};
	this.getMainApp = function(){
		//return this._mainApp;
		return this._list[0];
	};
	this.setMainApp = function(v){
		this._mainApp = v;
	};
	/**
	 * 创建并注册一个应用的实例
	 * @param appClassName {String} 要创建的应用的类名
	 * @param parentApp {Application} 可选，所属的父类
	 * @param len {Number} 在历史记录中的位置
	 */
	this.createApp = function(appClassName, parentApp, len){
		var conf = this.getAppConfByClassName(appClassName);
		if(conf){
			if(conf.appnum == 1){
				runtime.getWindow().alert("简化版中每个App类只能创建一个实例");
				return null;
			}
			conf.appnum++;
		}
		//需要保证多于一个参数，阻止create方法自动执行
		var app = new __classes__[appClassName]();
		if(arguments.length == 3 && parentApp){
			app.setParentApp(parentApp);  //设置父类
			app.setHistoryIndex(len);  //设置所在历史记录的位置
		}else if(app.getMainWindow){
			var appManager = app.getMainWindow().runtime._appManager;
			parentApp = appManager._list[0] || null;
			app.setParentApp(parentApp);
			//if(parentApp){
			//	app.setHistoryIndex(parentApp.historyManager.getLength());
			//}
			appManager = null;
		}
		//注册APP
		if(conf){
			this._hash[conf.id] = app;
		}
		this._list.push(app);
		//app.init();
		conf = null;
		return app;
	};
	this.getAppConf = function(appid){
		return this._confList[appid];
	};
	this.getAppConfByClassName = function(className){
		for(var k in this._confList){
			if(this._confList[k].className == className){
				return this._confList[k];
			}
		}
		return null;
	};
	this.getAppByClassName = function(className){
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i]._className == className){
				return this._list[i];
			}
		}
		return null;
	};
	this.loadAppLibs = function(libName, app, agent, fun){
		var n = app.historyManager.getLength();
		var libs = this._confList[libName].lib.split(",");
		var arr = [];
		for(var i = 0, len = libs.length; i < len; i++){
			var name = libs[i];
			if(/\.js$/.test(name)){  //直接加载js文件
				runtime.dynamicLoadFile("js", app._pathJs, [name]);
			}else if(/\.lib$/.test(name)){  //加载lib文件
				name = name.replace(/\.lib$/, "");
				var name0 = name;
				if(name0.substr(0, 1) == "#") name0 = name0.substr(1);
				if(!(name0 in runtime._libManager._hash)){
					arr.push(name);
				}
			}
		}
		var libLoader = new LibLoader();
		libLoader.init(arr, runtime._config["codeprovider"], this, function(name, lib){
			//runtime._libLoader.loadLibScript(name, this, function(lib){
			//});
			if(lib){
				if(typeof lib == "function"){
					lib.call(runtime, app, n);
				}else{  //typeof lib.init == "function"
					lib.init.call(runtime, app, n);
				}
			}else{  //全部加载
				fun.apply(agent);
				libLoader.dispose();
				libLoader = null;
			}
		});
	};
});
/*</file>*/
/*<file name="alz.core.Plugin">*/
_package("alz.core");

/**
 * 针对Application的插件基类
 */
_class("Plugin", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._app = null;  //插件所属的应用
		this._name = "";   //插件的名字
	};
	this.create = function(name, app){
		this._app = app;
		this._name = name;
	};
	this.reinit = function(){
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.getName = function(){
		return this._name;
	};
});
/*</file>*/
/*<file name="alz.core.PluginManager">*/
_package("alz.core");

_import("alz.core.Plugin");

/**
 * Application插件管理者类
 */
_class("PluginManager", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._plugins = {};
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var k in this._plugins){
			this._plugins[k].dispose();
			delete this._plugins[k];
		}
		_super.dispose.apply(this);
	};
	/**
	 * 判断一个插件是否已经存在
	 */
	this.exists = function(name){
		return name in this._plugins;
	};
	/**
	 * 注册一个插件，每个APP下所有插件不能重名
	 * @param plugin {PlugIn} 插件的实例
	 */
	this.register = function(plugin){
		this._plugins[plugin.getName()] = plugin;
	};
	/**
	 * 通过名字获取一个已经注册的插件实例
	 */
	this.getPlugIn = function(name){
		return this._plugins[name];
	};
	/**
	 * 调用插件的onResize事件
	 * 给所有插件一个调整自身布局的机会
	 */
	this.onResize = function(w, h){
		for(var k in this._plugins){
			if(this._plugins[k].onResize){
				this._plugins[k].onResize(w, h);
			}
		}
	};
});
/*</file>*/
/*<file name="alz.core.WebRuntime_core">*/
_package("alz.core");

//_import("alz.core.XPathQuery");
_import("alz.core.DOMUtil");
_import("alz.core.AjaxEngine");
_import("alz.core.AppManager");

_extension("WebRuntime", function(){  //注册 WebRuntime 扩展
	this._init = function(){  //加载之后的初始化工作
		//this.selector = new XPathQuery();
		this.dom = new DOMUtil();
		//this.domutil = new DomUtil2();
		this.ajax = this.getParentRuntime() ? this._parentRuntime.getAjax() : new AjaxEngine();
		//this.ajax._userinfo = true;
		//设置测试用例
		/*
		var win = this.getMainWindow();
		if(win && typeof win.runtime != "unknown" && typeof win.runtime != "undefined"){  //winxp下需要检测 win.runtime
			this.ajax.setTestCase(win.runtime.ajax.getTestCase());
		}
		*/
		if(this._debug){
			window.document.onmousedown = function(ev){
				ev = ev || window.event;
				if(ev.ctrlKey){
					var target = ev.target || ev.srcElement;
					for(var el = target; el; el = el.parentNode){
						if(el.__ptr__){
							var arr = runtime.forIn(el.__ptr__);
							arr.push("class=" + el.className);
							arr.push("tagName=" + el.tagName);
							window.alert(arr.join("\n"));
							arr = null;
							break;
						}
					}
				}
			};
		}
		this._appManager = new AppManager();
		this._product = null;
		if(typeof sinamail_data != "undefined"){
			this.regProduct(sinamail_data);
		}
	};
	this.dispose = function(){
		this._product = null;
		this._appManager.dispose();
		this._appManager = null;
		if(this._debug){
			window.document.onmousedown = null;
		}
		if(this.ajax){
			if(!this._parentRuntime){
				this.ajax.dispose();
			}
			this.ajax = null;
		}
		//this.domutil.dispose();
		//this.domutil = null;
		if(this.dom){
			this.dom.dispose();
			this.dom = null;
		}
		//this.selector.dispose();
		//this.selector = null;
	};
	/**
	 * 返回用于操作DOM元素的工具类对象
	 */
	this.getDom = function(){
		return this.dom;
	};
	/**
	 * 返回用于异步交互的异步交互引擎
	 */
	this.getAjax = function(){
		return this.ajax;
	};
	this.getAppManager = function(){
		return this._appManager;
	};
	/**
	 * 去除字符串前后的空白字符
	 * @param str {String} 要处理的字符串
	 */
	this.trim = function(str){
		return str.replace(/(^\s*)|(\s*$)/g, "");
	};
	this.closure = function(o, fun, p1, p2){
		return function(){
			if(typeof o == "object" && typeof fun == "string" && typeof o[fun] == "function"){
				return o[fun](p1, p2);
			}else if(typeof o == "function"){
				return o(fun, p1, p2);
			}else{
				runtime.log("[ERROR]闭包使用错误！");
			}
		};
	};
	/**
	 * HTML 代码编码方法
	 * @param html {String} 要编码的 HTML 代码字符串
	 */
	this.encodeHTML = function(html){
		if(!html){
			return "";
		}else{
			return html
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/\"/g, "&quot;")
				//.replace(/\'/g, "&apos;")
				.replace(/ /g, "&nbsp;")
				.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
				.replace(/\r?\n/g, "<br />");
		}
	};
	/**
	 * HTML 代码解码方法
	 * @param html {String} 要解码的 HTML 代码字符串
	 */
	this.decodeHTML = function(html){
		if(!html){
			return "";
		}else{
			return html
				//.replace(/&#37;/ig, '%')
				.replace(/&nbsp;/ig, " ")
				.replace(/&quot;/ig, "\"")
				//.replace(/&apos;/ig, "\'")
				.replace(/&gt;/ig, ">")
				.replace(/&lt;/ig, "<")
				.replace(/&#(\d{2}|\d{4});/ig, function(_0, _1){
					return String.fromCharCode(_1);
				})
				.replace(/&amp;/ig, "&");
		}
	};
	/**
	 * 根据参数 progid 创建一个 ActiveXObject，成功返回对象，失败返回 null
	 * @param progid {String} ActiveXObject 控件的 PROGID
	 */
	this.createComObject = function(progid){
		try{
			if(this._hostenv == "ie" && this._win.host){
				return this._win.host.createComObject(progid);
			}else{
				return new ActiveXObject(progid);
			}
		}catch(ex){
			this.showException(ex, "创建 {0} 组件失败".replace(/\{0\}/, progid));
			return null;
		}
	};
	/*this.getMainWindow = function(){
		var win;
		if(!this.inGadget){
			if(this._win.opener){
				win = this._win.opener;
			}/ *else{
			}* /
		}else{
			win = System.Gadget.document.parentWindow;
		}
		return win;
	};*/
	this.getParentWindow = function(){
		return this.getMainWindow();
	};
	/**
	 * 根据 className 获取相应的 DOM 元素
	 * @return {Array} 符合条件的元素组成的数组
	 * [TODO]效率极低，有待优化
	 */
	this.getElementsByClassName = function(className){
		var a = [];
		var els = this._doc.getElementsByTagName("*");
		for(var i = 0, len = els.length; i < len; i++){
			if(els[i].className.indexOf(className) != -1){
				a.push(els[i]);
			}
		}
		return a;
	};
	this.openDialog = function(url, width, height){
		var screen = {
			w: this._win.screen.availWidth,
			h: this._win.screen.availHeight
		};
		var features = "fullscreen=0,channelmode=0,toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=0,resizable=1"
			+ ",left=" + Math.round((screen.w - width) / 2)
			+ ",top=" + Math.round((screen.h - height) / 2)
			+ ",width=" + width
			+ ",height=" + height;
		//return this._win.showModelessDialog(url, "123", "dialogTop:100px;dialogLeft:100px;dialogWidth:400px;dialogHeight:580px;resizable:1;status:0;help:0;edge:raised;");
		return this._win.open(url, "_blank", features);
	};
	this.createEvent = function(ev){
		var o = {};
		//o.sender = ev.sender || null;  //事件发送者
		o.type = ev.type;
		o.target = ev.srcElement || ev.target;  //IE和FF的差别
		o.reason = ev.reason;
		o.cancelBubble = ev.cancelBubble;
		o.returnValue = ev.returnValue;
		o.srcFilter = ev.srcFilter;
		o.fromElement = ev.fromElement;
		o.toElement = ev.toElement;
		//mouse event
		o.button = ev.button;
		o.screenX = ev.screenX;
		o.screenY = ev.screenY;
		o.clientX = ev.clientX;
		o.clientY = ev.clientY;
		o.offsetX = ev.offsetX || 0;
		o.offsetY = ev.offsetY || 0;
		o.x = ev.x || ev.clientX;
		o.y = ev.y || ev.clientY;
		//key event
		o.altKey = ev.altKey;
		o.ctrlKey = ev.ctrlKey;
		o.shiftKey = ev.shiftKey;
		o.keyCode = ev.keyCode;
		return o;
	};
	this.createApp = function(appClassName, parentApp, len){
		return this._appManager.createApp(appClassName, parentApp, len);
	};
	this.regProduct = function(v){
		this._product = v;
		this._appManager.setConfList(v.app);
	};
	this.getProduct = function(){
		if(!this._product){
			runtime.log("[WebRuntime::getProduct]data_xxx.js未能正确加载，系统无法正常运行，请检查！");
			this._product = {
				"name" : "",  //产品名称
				"tpl"  : [],  //模板
				"skin" : [],  //皮肤
				"paper": [],  //信纸
				"app"  : []   //APP配置
			};
		}
		return this._product;
	};
});
/*</file>*/

runtime.regLib("core", function(){  //加载之后的初始化工作

});

}})(this);