_package("alz.core");

_class("DomUtil2", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._nodes = [];
		this._domTemp = null;
	}
	this.dispose = function(){
		if(this._disposed) return;
		this._domTemp = null;
		//解除所有DOM元素和脚本对象的绑定关系
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i].dispose();
			this._nodes[i] = null;
		}
		this._nodes.length = 0;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.createDomElement = function(html, parent){
		if(!this._domTemp){
			this._domTemp = document.createElement("div");
		}
		this._domTemp.innerHTML = html;
		var el = this._domTemp.removeChild(this._domTemp.childNodes[0]);
		if(parent){
			parent.appendChild(el);
			/*
			//滞后加载图片
			var imgs = el.getElementsByTagName("img");
			for(var i = 0, len = imgs.length; i < len; i++){
				imgs[i].src = imgs[i].getAttribute("src0");
			}
			*/
		}
		return el;
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
		var style, view = document.defaultView;
		if(view && view.getComputedStyle){
			style = view.getComputedStyle(el, null);
		}else if(el.currentStyle){
			style = el.currentStyle;
		}else{
			throw "无法动态获取DOM的实际样式属性";
		}
		return style;
	};
	this.getPropertyValue = function(style, name){
		//return runtime._host.env == "ie" ? style[name] : (style.getPropertyValue(name) || style.getPropertyCSSValue(name));
		return style[name];
	};
	this.getStyleProperty = function(el, name){
		var style = this.getStyle(el);
		return this.parseNum(/*el.tagName, */this.getPropertyValue(style, name) || el.style[name]);
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
	};
	this.getInnerWidth = function(el, v){
		var obj = this.getObj(el);
		if(!v) v = obj._width;
		var innerWidth = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v - obj._borderLeftWidth - obj._borderRightWidth - obj._paddingLeft - obj._paddingRight);
		//var innerWidth = Math.max(0, runtime.getBoxModel() == 0 ? v : v - this._borderLeftWidth - this._borderRightWidth - this._paddingLeft - this._paddingRight);
		if(isNaN(innerWidth)) runtime.log("DomUtil::getInnerWidth isNaN(innerWidth)");
		return innerWidth;
	};
	this.getInnerHeight = function(el, v){
		var obj = this.getObj(el);
		if(!v) v = obj._height || el.offsetHeight;
		var innerHeight = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v - obj._borderTopWidth - obj._borderBottomWidth - obj._paddingTop - obj._paddingBottom);
		if(isNaN(innerHeight)) runtime.log("DomUtil::getInnerHeight isNaN(innerHeight)");
		return innerHeight;
	};
	this.getOuterWidth = function(el, v){
		var obj = this.getObj(el);
		if(!v) v = this.getWidth(el);
		var outerWidth = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v + obj._marginLeft + obj._marginRight);
		if(isNaN(outerWidth)) window.alert("DomUtil::getOuterWidth isNaN(outerWidth)");
		return outerWidth;
	};
	this.getOuterHeight = function(el, v){
		var obj = this.getObj(el);
		if(!v) v = this.getHeight(el);
		var outerHeight = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v + obj._marginTop + obj._marginBottom);
		if(isNaN(outerHeight)) window.alert("DomUtil::getOuterHeight isNaN(outerHeight)");
		return outerHeight;
	};
});