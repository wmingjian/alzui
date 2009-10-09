/*
 * alzui-mini JavaScript Framework, v0.0.8
 * Copyright (c) 2009 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
(function(){with(runtime.createContext("core")){

/*#file begin=alz.core.DOMUtil.js*/
_package("alz.core");

_class("DOMUtil", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._components = [];
		this._nodes = [];
		this._css = null;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._css = null;
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
				//a = this.parseInt(style.borderLeftWidth);
				//b = this.parseInt(style.borderTopWidth);
				a = this.getStyleProperty(o, "borderLeftWidth");
				b = this.getStyleProperty(o, "borderTopWidth");
				x += isNaN(a) ? 0 : a;
				y += isNaN(b) ? 0 : b;
				//s += ",borderLeftWidth=" + a + ",borderTopWidth=" + b;
			}
			/*
			if(o != el && runtime.getBoxModel() == 0){
				x += this.parseInt(style.paddingLeft);
				y += this.parseInt(style.paddingTop);
			}
			*/
			if(o != refElement){
				pos.x += o.offsetLeft + (o != el ? x : 0);
				pos.y += o.offsetTop + (o != el ? y : 0);
				//s += ",offsetLeft=" + o.offsetLeft + ",offsetTop=" + o.offsetTop;
			}else{
				a = this.getStyleProperty(o, "borderLeftWidth");
				b = this.getStyleProperty(o, "borderTopWidth");
				//pos.x += this.parseInt(style.borderLeftWidth);
				//pos.y += this.parseInt(style.borderTopWidth);
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
			? {x: ev.offsetX, y: ev.offsetY}
			: {x: ev.layerX, y: ev.layerY}
		) : {x: 0, y: 0};
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
	this.parseInt = function(v){
		switch(v){
		case "medium": return 2;
		case "thin": return 1;
		case "thick": return 1;
		default:
			var a = parseInt(v);
			return isNaN(a) ? 0 : a;
		}
	};
	/**
	 * 统一 IE 和 Moz 系列浏览器的差异
	 */
	this.getPropertyValue = function(style, name){
		return runtime.ie ? style[name] : style.getPropertyValue(name);
	};
	this.getStyle = function(el){
		var style;
		if(runtime.getDocument().defaultView && runtime.getDocument().defaultView.getComputedStyle)
			style = runtime.getDocument().defaultView.getComputedStyle(el, null);
		else if(el.currentStyle)
			style = el.currentStyle;
		else
			throw "无法动态获取DOM的实际样式属性";
		return style;
	};
	this.getStyleProperty = function(el, name){
		var style = this.getStyle(el);
		return this.parseInt(this.getPropertyValue(style, name) || el.style[name]);
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
			if(runtime.getBoxModel() == 1)
				value -= this.getStyleProperty(el, "paddingTop") + this.getStyleProperty(el, "paddingBottom");
			el.style[name] = Math.max(0, value) + "px";
			break;
		}
		}catch(ex){
			window.alert(ex.message);
		}
	};
	this.getObj = function(el){
		var component = new Component();
		component._domCreate = true;
		this._components.push(component);  //注册 component
		component.bind(el);  //绑定 DOM 元素
	};
	this.getObj1 = function(el){
		var obj;
		if(!("__ptr__" in el)){
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
		//if(el.getAttribute("id") != "") alert(el.id);
		var nodes = el.childNodes;
		//if(el.getAttribute("html") == "true") alert();
		if(el.getAttribute("aui") != "" &&
			!(el.getAttribute("noresize") == "true" ||
				el.getAttribute("html") == "true") &&
			nodes.length > 0){  //忽略 head 内元素
			var ww = this.getInnerWidth(el);
			var hh = this.getInnerHeight(el);
			for(var i = 0, len = nodes.length; i < len; i++){
				if(nodes[i].nodeType != 1)  //NODE_ELEMENT
					continue;
				var w0 = this.getWidth(nodes[i]);
				var h0 = this.getHeight(nodes[i]);
				//if(nodes[i].id == "dlgBody") alert(w0);
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
			x: 0,
			y: 0,
			w: el.clientWidth,
			h: el.clientHeight,
			//w1: el.scrollWidth,
			//h1: el.scrollHeight
		};*/
		return {
			x: el.scrollLeft,
			y: el.scrollTop,
			w: el.clientWidth,  //Math.max(el.clientWidth || el.scrollWidth)
			h: Math.max(el.clientHeight, el.parentNode.clientHeight)  //Math.max(el.clientHeight || el.scrollHeight)
		};
	};
	/**
	 * @param el 要绑定事件的DOM元素
	 * @param type 事件类型，如果参数fun为事件监听对象，则该参数将被忽略
	 * @param fun 事件响应函数或者事件监听对象
	 * @param obj 回调函数中的this指代对象，如果没有该参数，缺省为el
	 */
	this.addEventListener = function(el, type, fun, obj){
		switch(typeof(fun)){
		case "function":
			el.__callback = (function(cb, obj){
				return function(ev){
					return cb.call(obj, ev || window.event);  //保证回调函数中的this是当前DOM对象或者对应的脚本组件
				};
			})(fun, obj || el);
			if(el.attachEvent)
				el.attachEvent("on" + type, el.__callback);
			else
				el.addEventListener(type, el.__callback, false);
			break;
		case "object":
			el.__callback = (function(listener, obj){
				return function(ev){
					return listener[ev.type].call(obj, ev || window.event);  //保证回调函数中的this是当前DOM对象或者对应的脚本组件
				};
			})(fun, obj || el);
			for(var k in fun){
				if(el.attachEvent)
					el.attachEvent("on" + k, el.__callback);
				else
					el.addEventListener(k, el.__callback, false);
			}
			break;
		}
	};
	this.removeEventListener = function(el, type, fun){
		if(!el.__callback) return;
		switch(typeof(fun)){
		case "function":
			if(el.detachEvent)
				el.detachEvent("on" + type, el.__callback);
			else
				el.removeEventListener(type, el.__callback, false);
			break;
		case "object":
			for(var k in fun){
				if(el.detachEvent)
					el.detachEvent("on" + k, el.__callback);
				else
					el.removeEventListener(k, el.__callback, false);
			}
			break;
		}
		el.__callback = null;
	};
	this.contains = function(el, obj){
		if(el.contains)
			return el.contains(obj);
		else{
			for(var o = obj; o; o = o.parentNode){
				if(o == el) return true;
				if(!o.parentNode) return false;
			}
			return false;
		}
	};
	function parseRule(hash, arr, style){
		var key = arr[0];
		if(key in hash){
			//alert("merge css");
		}else{
			if(key.indexOf("_") != -1){
				var arr1 = key.split("_");
				parseRule(hash[arr1[0]]["__state"], arr1.slice(1), style);
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
			parseRule(hash[key], arr.slice(1), style);
		}
	}
	this.parseCss = function(rules){
		var hash = {};
		for(var i = 0, len = rules.length; i < len; i++){
			if(rules[i].type == 2) continue;
			//rules[i].selectorText + "{" + rules[i].style.cssText + "}"
			parseRule(hash, rules[i].selectorText.split(" "), rules[i].style);
		}
		return hash;
	};
	function cssKeyToJsKey(str){
		return str.replace(/-([a-z])/g, function(_0, _1){
			return _1.toUpperCase();
		});
	}
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
						var name = cssKeyToJsKey(key);
						if(obj.style[name] != v[key]){
							obj.style[name] = v[key];
						}
					}
					obj = null;
				}else{
					var name = cssKeyToJsKey(k);
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
						var name = cssKeyToJsKey(key);
						if(obj.style[name] != v[key]){
							obj.style[name] = v[key];
						}
					}
					obj = null;
				}else{
					var name = cssKeyToJsKey(k);
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
						var name = cssKeyToJsKey(key);
						if(obj.style[name] != v[key]){
							obj.style[name] = v[key];
						}
					}
					obj = null;
				}else{
					var name = cssKeyToJsKey(k);
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
/*#file end*/
/*#file begin=alz.core.BoxElement.js*/
_package("alz.core");

_class("BoxElement", "", function(_super){
	this._init = function(el, dom){
		_super._init.call(this);
		this._dom = dom;
		this._self = null;
		this.init(el);
	};
	this.init = function(obj){
		obj.__ptr__ = this;
		this._self = obj;
		//初始化应用到的属性，从DOM对象中解析出实际的值，只读方式使用
		var properties = [
			"width",
			"height",
			"marginBottom",
			"marginLeft",
			"marginRight",
			"marginTop",
			"borderBottomWidth",
			"borderLeftWidth",
			"borderRightWidth",
			"borderTopWidth",
			"paddingBottom",
			"paddingLeft",
			"paddingRight",
			"paddingTop"
		];
		for(var i = 0, len = properties.length; i < len; i++){
			var key = properties[i];
			if(!("_" + key in this)){
				this["_" + key] = this._dom.getStyleProperty(obj, key);
			}
		}
	};
	this.dispose = function(){
		this._self.__ptr__ = null;
		this._self = null;
		this._dom = null;
		_super.dispose.apply(this);
	};
	this.setLeft = function(x){
		this._self.style.left = x + "px";
	};
	this.setTop = function(y){
		this._self.style.top = y + "px";
	};
	this.getWidth = function(){
		return this._dom.getWidth(this._self);
	};
	this.setWidth = function(w){
		this._dom.setWidth(this._self, w);
	};
	this.getHeight = function(){
		var h = this._height;
		if(h != this._dom.getHeight(this._self)){
			runtime.log(this._self.className + ":" + h + "!=" + this._dom.getHeight(this._self));
		}
		return this._height;
	};
	this.setHeight = function(h){
		this._dom.setHeight(this._self, h);
	};
	this.setInnerWidth = function(w, skip){
		//绝对定位，marginRight没有作用
		//this.setWidth(w/*- this._marginLeft - this._marginRight*/);
		this._self.style.width = Math.max(0, w
			- (skip ? 0 : (this._marginLeft + this._marginRight))
			- this._borderLeftWidth - this._borderRightWidth
			- this._paddingLeft - this._paddingRight
		) + "px";
	};
	this.setInnerHeight = function(h){
		//this.setHeight(h - this._marginTop - this._marginBottom);
		this._self.style.height = Math.max(0, h
			- this._marginTop - this._marginBottom
			- this._borderTopWidth - this._borderBottomWidth
			- this._paddingTop - this._paddingBottom
		) + "px";
	};
	this.hasLayout = function(){
		this._layout = this._self.getAttribute("_layout");
		return this._layout;
	};
	this.layout = function(){
		//this._self.style.overflow = "hidden";
		_import("alz.layout." + this._layout);  //BorderLayout
		var layout = new __context__[this._layout]();
		layout.init(this._self);
		layout.updateDock(
			this._self.clientWidth - this._paddingLeft - this._paddingRight,
			this._self.clientHeight - this._paddingTop - this._paddingBottom
		);
		layout.dispose();
		layout = null;
	};
});
/*#file end*/
/*#file begin=alz.core.DomUtil2.js*/
_package("alz.core");

_class("DomUtil2", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._nodes = [];
		this._domTemp = null;
	}
	this.dispose = function(){
		this._domTemp = null;
		//解除所有DOM元素和脚本对象的绑定关系
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i].dispose();
			this._nodes[i] = null;
		}
		this._nodes = [];
		_super.dispose.apply(this);
	};
	this.createDomElement = function(html, parent){
		if(!this._domTemp)
			this._domTemp = window.document.createElement("div");
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
	 * 统一 IE 和 Moz 系列浏览器的差异
	 */
	this.parseInt = function(tag, v){
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
	this.getStyle = function(el){
		var style, view = window.document.defaultView;
		if(view && view.getComputedStyle)
			style = view.getComputedStyle(el, null);
		else if(el.currentStyle)
			style = el.currentStyle;
		else
			throw "无法动态获取DOM的实际样式属性";
		return style;
	};
	this.getPropertyValue = function(style, name){
		//return runtime._host.env == "ie" ? style[name] : (style.getPropertyValue(name) || style.getPropertyCSSValue(name));
		return style[name];
	};
	this.getStyleProperty = function(el, name){
		var style = this.getStyle(el);
		return this.parseInt(el.tagName, this.getPropertyValue(style, name) || el.style[name]);
	};
	this.setStyleProperty = function(el, name, value){
		el.style[name] = value;
	};
	this.getObj = function(el){
		var obj;
		if(!("__ptr__" in el)){
			obj = new BoxElement(el, this);
			this._nodes.push(obj);
		}else{
			obj = el.__ptr__;
		}
		return obj;
	};
	this.moveTo = function(el, x, y){
		var obj = this.getObj(el);
		if(!("_left" in obj)) obj._left = 0;
		if(!("_top" in obj)) obj._top = 0;

		obj._left = x;
		this.setStyleProperty(el, "left", x + "px");

		obj._top = y;
		this.setStyleProperty(el, "top", y + "px");
	};
	this.setOpacity = function(el, v){
		var obj = this.getObj(el);
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
	this._setWidth = function(el, v){
		//if(runtime._host.compatMode != "BackCompat"){
		//	//alert("+" + forIn(this.getStyle(el)).join("\n"));
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
	this.getWidth = function(el){
		var obj = this.getObj(el);
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
	this.getHeight = function(el){
		var obj = this.getObj(el);
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
	this.setWidth = function(el, v){
		var obj = this.getObj(el);
		if(!("_width" in obj)) obj._width = 0;
		v = Math.max(v/* - obj._marginLeft - obj._marginRight*/, 0);
		//if(el.className == "pane-top") alert(obj._width + "!=" + v);
		//if(obj._width != v){
			obj._width = v;
			var w = this.getInnerWidth(el, v);
			this._setWidth(el, w);
		//}
		obj = null;
	};
	this.setHeight = function(el, v){
		var obj = this.getObj(el);
		if(!("_height" in obj)) obj._height = 0;
		v = Math.max(v/* - obj._marginTop - obj._marginBottom*/, 0);
		if(obj._height != v){
			obj._height = v;
			var w = this.getInnerHeight(el, v);
			this._setHeight(el, w);
		}
		obj = null;
	};
	this.getInnerWidth = function(el, v){
		var obj = this.getObj(el);
		if(!v) v = obj._width;
		var innerWidth = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v - obj._borderLeftWidth - obj._borderRightWidth - obj._paddingLeft - obj._paddingRight);
		//var innerWidth = Math.max(0, runtime.getBoxModel() == 0 ? v : v - this._borderLeftWidth - this._borderRightWidth - this._paddingLeft - this._paddingRight);
		obj = null;
		if(isNaN(innerWidth)) runtime.log("DomUtil::getInnerWidth isNaN(innerWidth)");
		return innerWidth;
	};
	this.getInnerHeight = function(el, v){
		var obj = this.getObj(el);
		if(!v) v = obj._height || el.offsetHeight;
		var innerHeight = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v - obj._borderTopWidth - obj._borderBottomWidth - obj._paddingTop - obj._paddingBottom);
		obj = null;
		if(isNaN(innerHeight)) runtime.log("DomUtil::getInnerHeight isNaN(innerHeight)");
		return innerHeight;
	};
	this.getOuterWidth = function(el, v){
		var obj = this.getObj(el);
		if(!v) v = this.getWidth(el);
		var outerWidth = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v + obj._marginLeft + obj._marginRight);
		obj = null;
		if(isNaN(outerWidth)) window.alert("DomUtil::getOuterWidth isNaN(outerWidth)");
		return outerWidth;
	};
	this.getOuterHeight = function(el, v){
		var obj = this.getObj(el);
		if(!v) v = this.getHeight(el);
		var outerHeight = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v + obj._marginTop + obj._marginBottom);
		obj = null;
		if(isNaN(outerHeight)) window.alert("DomUtil::getOuterHeight isNaN(outerHeight)");
		return outerHeight;
	};
});
/*#file end*/
/*#file begin=alz.core.AjaxEngine.js*/
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
	this.getTestCase = function(){return this._testCase;};
	this.setTestCase = function(v){this._testCase = v;};
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
			if(async)  //如果是异步请求，使用请求队列工作模式
				return this.netInvoke(method, url, postData, type, callback);
			else{
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
		if(runtime.getWindow() && charset == "utf-8")
			return "" + http.responseText;
		else if(runtime.getWindow() && runtime.getWindow().execScript){  //FF 不支持 execScript
			if(typeof(VBS_bytes2BStr) == "undefined")
				runtime.getWindow().execScript(AjaxEngine._vbsCode, "VBScript");
			return VBS_bytes2BStr(http.responseBody);
		}else{
			//[TODO]直接返回 responseText 会有因 UTF-8 编码而引起的乱码问题
			return http.responseText;
		}
	};
	//供加载类库代码使用的方法
	this.netInvoke2 = function(method, url, postData, charset, agent, funName, args){
		var async = (typeof(agent) != "undefined" && agent != null) ? true : false;
		if(async)  //如果是异步请求，使用请求队列工作模式
			return this.netInvoke(method, url, postData, type, agent, funName, args);
		else{
			var http = this._openHttp(method, url, async);
			if(runtime.getHostenv() == "safari" || runtime.getHostenv() == "chrome")  //Safari下面需要这一句
				http.onreadystatechange = null;
			/*if(async){
				http.onreadystatechange = function(){
					if(http.readyState != 4) return;
					if(typeof(agent[funName]) == "function")
						agent[funName](http.responseText);
					else
						agent(http.responseText);
				};
			}*/
			http.send("");  //没有 "" 的话 FF 下面会报错
			//if(!async){
			var data;
			if(http.status && (200 > http.status || 300 <= http.status))
				throw new alz.core.Exception(runtime._lang.unable_to_load_file, url, http.status);
			else if(http.readyState && http.readyState != 4)
				throw new alz.core.Exception(runtime._lang.resource_load_failure, uri);
			else
				data = this._encodeData(http, charset);  //args
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
			runtime.getWindow().clearTimeout(this._timer);
			this._timer = 0;
		}
	};
	this._ajaxThread = function(){
		var req  = this._queue[0];
		if(runtime._testCaseWin)
			runtime._testCaseWin.log(req.url + "?" + req.data);
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
		if(typeof(req.agent) == "function")
			req.agent(o, req.args);
		else if(typeof(req.fun) == "function"){
			var fun = req.fun;
			fun.call(req.agent, o, req.args);
			fun = null;
		}else
			req.agent[req.fun](o, req.args);
		this._queue[0] = null;
		this._queue.shift();  //清除队列第一个元素
		this._checkAjaxThread();
	};
	/**
	 * 同步回调函数
	 */
	this._onSyncCallback = function(type){
		if(this._http.readyState != 4)
			throw "资源文件加载失败";
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
			}else
				o = http.responseXML;
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
			if(method == "POST")
				this._http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
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
		if(callback)
			callback(o);
		else
			return o;
	};
	*/
	/**
	 * 调用一个请求队列
	 * @param queue {Array} 请求队列数组
	 * @param callback {Function} 回调函数
	 */
	this.netInvokeQueue = function(queue, callback){
		var i = 0;
		var _this = this;
		function cb(){
			if(i < queue.length){
				var req = queue[i];
				//                        (method, url, postData, type, agent, funName)
				_this.netInvoke.call(_this, req[0], req[1], req[2], req[3], function(data){
					var agent = req[4];
					var fun   = req[5];
					//调用真实的回调函数
					if(typeof(agent) == "function")
						agent(data);
					else if(typeof(fun) == "function"){
						fun.call(agent, data);
					}else
						agent[fun](data);
					fun = null;
					agent = null;
					req = null;
					i++;
					runtime.getWindow().setTimeout(cb, 0);  //调用下一个
				});
			}else{  //队列完成
				callback();
			}
		}
		cb();
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
/*#file end*/
/*#file begin=alz.core.EventTarget.js*/
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
		if(eventMap == "mouseevent")
			eventMap = "mousedown,mouseup,mousemove,mouseover,mouseout,click,dblclick";
		else if(eventMap == "keyevent")
			eventMap = "keydown,keypress,keypressup";
		var maps = eventMap.split(",");
		for(var i = 0, len = maps.length; i < len; i++){
			if(this._self){
				this._self["on" + maps[i]] = function(ev){
					ev = ev || runtime.getWindow().event;
					//if(ev.type == "mousedown") alert(121);
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
		if(eventMap == "mouseevent")
			eventMap = "mousedown,mouseup,mousemove,mouseover,mouseout,click,dblclick";
		else if(eventMap == "keyevent")
			eventMap = "keydown,keypress,keypressup";
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
		if(!this._eventMaps[type])
			this._eventMaps[type] = [];  //[TODO]使用{}来模拟多个事件执行顺序的无关性
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
				if(ev.cancelBubble)
					return ret;  //如果禁止冒泡，则退出
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
					if(bCancel)
						return ret;  //如果禁止冒泡，则退出
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
/*#file end*/
/*#file begin=alz.core.AppManager.js*/
_package("alz.core");

_import("alz.core.LibLoader");

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
		var app = new __classes__[appClassName](parentApp, len);
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
			if(this._confList[k].className == className)
				return this._confList[k];
		}
		return null;
	};
	this.getAppByClassName = function(className){
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i]._className == className)
				return this._list[i];
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
				if(typeof lib == "function")
					lib.call(runtime, app, n);
				else  //typeof lib.init == "function"
					lib.init.call(runtime, app, n);
			}else{  //全部加载
				fun.apply(agent);
				libLoader.dispose();
				libLoader = null;
			}
		});
	};
});
/*#file end*/
/*#file begin=alz.core.Application.js*/
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
		if(!this._domTemp)
			this._domTemp = window.document.createElement("div");
		this._domTemp.innerHTML = html;
		return this._domTemp.removeChild(this._domTemp.childNodes[0]);
	};
});
/*#file end*/
/*#file begin=alz.core.WebAppRuntime_core.js*/
_package("alz.core");

_import("alz.core.DOMUtil");
_import("alz.core.DOMUtil2");
_import("alz.core.AjaxEngine");
_import("alz.core.AppManager");

_extension("WebAppRuntime", function(){  //注册 WebAppRuntime 扩展
	this._init = function(){  //加载之后的初始化工作
		this.dom = new DOMUtil();
		this.domutil = new DomUtil2();
		this.ajax = this.getParentRuntime() ? this._parentRuntime.getAjax() : new AjaxEngine();
		//this.ajax._userinfo = true;
		//设置测试用例
		/*
		var win = this.getMainWindow();
		if(win && typeof(win.runtime) != "unknown" && typeof(win.runtime) != "undefined"){  //winxp下需要检测 win.runtime
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
			if(!this._parentRuntime)
				this.ajax.dispose();
			this.ajax = null;
		}
		this.domutil.dispose();
		this.domutil = null;
		if(this.dom){
			this.dom.dispose();
			this.dom = null;
		}
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
			if(typeof(o) == "object" && typeof(fun) == "string" && typeof(o[fun]) == "function")
				return o[fun](p1, p2);
			else if(typeof(o) == "function")
				return o(fun, p1, p2);
			else
				showMessage("[ERROR]闭包使用错误！");
		};
	};
	/**
	 * HTML 代码编码方法
	 * @param html {String} 要编码的 HTML 代码字符串
	 */
	this.encodeHTML = function(html){
		if(!html)
			return "";
		else
			return html
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/\"/g, "&quot;")
				//.replace(/\'/g, "&apos;")
				.replace(/ /g, "&nbsp;")
				.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
				.replace(/\r?\n/g, "<br />");
	};
	/**
	 * HTML 代码解码方法
	 * @param html {String} 要解码的 HTML 代码字符串
	 */
	this.decodeHTML = function(html){
		if(!html)
			return "";
		else
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
	};
	/**
	 * 根据参数 progid 创建一个 ActiveXObject，成功返回对象，失败返回 null
	 * @param progid {String} ActiveXObject 控件的 PROGID
	 */
	this.createComObject = function(progid){
		try{
			if(this._hostenv == "ie" && this._win.host)
				return this._win.host.createComObject(progid);
			else
				return new ActiveXObject(progid);
		}catch(ex){
			this.showException(ex, "创建 {0} 组件失败".replace(/\{0\}/, progid));
			return null;
		}
	};
	/*this.getMainWindow = function(){
		var win;
		if(!this.inGadget){
			if(this._win.opener) win = this._win.opener;
			//else ;
		}else
			win = System.Gadget.document.parentWindow;
		return win;
	};*/
	this.getParentWindow = function(){
		return this.getMainWindow();
	};
	/**
	 * 根据 className 获取相应的 DOM 元素
	 * @return {Array} 符合条件的元素组成的数组
	 * @todo 效率极低，有待优化
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
			runtime.log("[WebAppRuntime::getProduct]data_xxx.js未能正确加载，系统无法正常运行，请检查！");
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
/*#file end*/

runtime.regLib("core", function(){  //加载之后的初始化工作

});

}})(this);