_package("alz.core");

_class("BoxElement", "", function(){
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
			}
			//runtime.log(this._self.tagName + "----" + this._nodes.length);
		}
		this._self.style.margin = "0px";
		this._self.style.padding = "0px";
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this.__layout){
			this.__layout.dispose();
			this.__layout = null;
		}
		this.__style = null;
		this._self.__ptr__ = null;
		this._self = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
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