/*
 * alzui-mini JavaScript Framework, v0.0.4
 * Copyright (c) 2009 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
(function(){with(runtime.createContext("test_win", "core,ui")){

function $(id){return window.document.getElementById(id);}

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
//_import("alz.mui.Component2");
/*#file begin=alz.mui.Workspace2.js*/
_package("alz.mui");

_import("alz.mui.Component");

_class("Workspace", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._captureComponent = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._self.onmousedown =
		this._self.onmousemove =
		this._self.onmouseup = function(ev){
			return this._ptr.eventHandle(ev || window.event);
		};
	};
	this.dispose = function(){
		this._captureComponent = null;
		this._self.onmouseup = null;
		this._self.onmousemove = null;
		this._self.onmousedown = null;
		_super.dispose.apply(this);
	};
	this.resize = function(w, h){
		if(this._width == w && this._height == h) return true;
		this._width = w;
		this._height = h;
	};
	this.eventHandle = function(ev){
		//_doc.title = ev.srcElement.tagName;
		var etype = {
			"mousedown": "MouseDown",
			"mouseup"  : "MouseUp",
			"mousemove": "MouseMove"
		};
		if(this._captureComponent){
			if(runtime._host.env == "ie" && ev.type == "mousedown"){
				this._self.setCapture();
			}else if(runtime._host.env == "ie" && ev.type == "mouseup"){
				this._self.releaseCapture();
			}
			var ename = "on" + etype[ev.type];
			if(typeof this._captureComponent[ename] == "function"){
				return this._captureComponent[ename](ev);
			}
		}
		switch(ev.type){
		case "mousedown":
		case "mouseup"  :
		case "mousemove":
			break;
		default:
			break;
		}
	};
});
/*#file end*/
/*#file begin=alz.mui.SilverButton.js*/
_package("alz.mui");

_import("alz.mui.Component");

_class("SilverButton", Component, function(_super){
	var _css = {
		"normal":{"background-position":"0 0"     ,"_cite":{"background-position":"right -30px" ,"color":"#333"   }},
		"over"  :{"background-position":"0 -60px" ,"_cite":{"background-position":"right -90px" ,"color":"#000333"}},
		"active":{"background-position":"0 -120px","_cite":{"background-position":"right -150px","color":"#333"   }}
	};
	this._init = function(){
		_super._init.call(this);
		this._btn = null;
		this._cite = null;
	};
	this.create = function(btn){
		var obj = this._create("span");
		obj.className = "wui-SilverButton";
		if(btn){
			btn.parentNode.replaceChild(obj, btn);
			this._btn = obj.appendChild(btn);
		}
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var cite = this._create("cite");
		cite.appendChild(_doc.createTextNode(this._btn.value));
		this._ee["_cite"] =
		this._cite = this._self.appendChild(cite);
		cite = null;
		this._self.style.backgroundRepeat = "no-repeat";
		this._cite.style.backgroundRepeat = "no-repeat";
		this.setState("normal");
		this._self.onclick = function(){_alert("onclick");};
		this._self.onmousedown = function(){this._ptr.setState("active");};
		this._self.onmouseup = function(){this._ptr.setState("over");};
		this._self.onmouseover = function(){this._ptr.setState("over");};
		this._self.onmouseout = function(){this._ptr.setState("normal");};
	};
	this.dispose = function(){
		this._cite = null;
		this._btn = null;
		this._self.onclick = null;
		this._self.onmousedown = null;
		this._self.onmouseup = null;
		this._self.onmouseover = null;
		this._self.onmouseout = null;
		_super.dispose.apply(this);
	};
	this.setState = function(v){
		runtime.dom.applyCssStyle(this, _css, v);
	};
});
/*#file end*/
/*#file begin=alz.layout.BorderLayout.js*/
_package("alz.layout");

_import("alz.core.BoxElement");

_class("BorderLayout", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._self = null;
		this._direction = "";  //vertical|horizontal
		this._nodes = [];
		this._clientNode = null;
		this._width = 0;
		this._height = 0;
	};
	this.init = function(obj){
		this._self = obj;
		if(this._self.tagName != "TD"){
			//this._self.style.position = "absolute";
			this._self.style.overflow = "hidden";
		}
		//this._self.style.backgroundColor = getColor();
		var tags = {"NOSCRIPT":1,"INPUT":1};
		var classes = {"wui-ModalPanel":1,"wui-Dialog":1};
		var nodes = obj.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			if(nodes[i].nodeType != 1) continue;  //NODE_ELEMENT
			if(nodes[i].tagName in tags) continue;
			if(nodes[i].className in classes) continue;
			if(nodes[i].style.display == "none") continue;
			var align = nodes[i].getAttribute("_align");
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
				this._nodes[i].style.styleFloat = "";
				this._nodes[i].style.position = "absolute";
				//this._nodes[i].style.overflow = "auto";
			}
		}
		nodes = null;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._clientNode = null;
		for(var i = 0, len = this._nodes.length; i < len; i++){
			//if(this._nodes[i]._self)
			//	this._nodes[i].dispose();  //[TODO]应该在DomUtil::dispose中处理
			this._nodes[i] = null;
		}
		this._nodes = [];
		this._self = null;
		_super.dispose.apply(this);
	};
	this.updateDock = function(w, h){
		if(this._width == w && this._height == h) return;
		this._width = w;
		this._height = h;
		//if(this._self.className == "ff_cntas_list")
		//	alert(w + "," + h);
		if(this._self.tagName != "BODY" && this._self.tagName != "TD"){
			if(w) runtime.domutil.setWidth(this._self, w);
			if(h) runtime.domutil.setHeight(this._self, h);
		}
		if(this._direction == "vertical"){
			var hh = 0, h_client = 0;
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				if(node.style.display == "none") continue;
				//node.style.top = hh + "px";
				if(node != this._clientNode){
					hh += runtime.domutil.getHeight(node);
				}
				node = null;
			}
			var h_client = h - hh;
			hh = 0;
			if(w) runtime.domutil.setWidth(this._clientNode, w);
			runtime.domutil.setHeight(this._clientNode, h_client);
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				var layout = node.getAttribute("_layout");
				if(layout == "BorderLayout"){
					//node.style.overflow = "hidden";
					var borderLayout = new BorderLayout();
					borderLayout.init(node);
					borderLayout.updateDock(node.clientWidth, node.clientHeight);
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
					ww += runtime.domutil.getWidth(node);
				}
				node = null;
			}
			var w_client = w - ww;
			ww = 0;
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				node.style.left = ww + "px";
				if(node == this._clientNode){
					runtime.domutil.setWidth(this._clientNode, w_client);
					ww += w_client;
				}else{
					ww += runtime.domutil.getWidth(node);
				}
				var h_fix = 0;
				if(this._self.className == "ff_contact_client"){
					h_fix = -2;  //(临时解决办法)RQFM-4934 通讯录页面有一个相素的缺
				}
				if(h) runtime.domutil.setHeight(node, h - h_fix);
				var layout = node.getAttribute("_layout");
				if(layout == "BorderLayout"){
					//node.style.overflow = "hidden";
					var borderLayout = new BorderLayout();
					borderLayout.init(node);
					borderLayout.updateDock(node.clientWidth, node.clientHeight);
					borderLayout.dispose();
					borderLayout = null;
				}
				node = null;
			}
		}
	};
	//获取参与布局的结点
	this._getAlignNodes = function(){
		var nodes = [];
		for(var i = 0, len = this._nodes.length; i < len; i++){
			if(this._nodes[i].style.display == "none") continue;
			nodes.push(new BoxElement(this._nodes[i], runtime.domutil));
		}
		return nodes;
	};
	this.getClientNodeWidth = function(w, nodes){
		var nn = runtime.domutil.getStyleProperty(this._self, "paddingLeft");  //考虑paddingLeft
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
		var nn = runtime.domutil.getStyleProperty(this._self, "paddingTop");  //考虑paddingTop
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
	this.updateDock = function(w, h){
		if(this._width == w && this._height == h) return;
		this._width = w;
		this._height = h;
		//if(this._self.className == "ff_cntas_list")
		//	alert(w + "," + h);
		if(this._self.tagName != "BODY" && this._self.tagName != "TD"){
			//alert(this._self.tagName + "," + w + "," + h);
			//高度和宽度已经被父元素调整过了
			//if(w) runtime.domutil.setWidth(this._self, w);
			//if(h) runtime.domutil.setHeight(this._self, h);
			//if(w) w = runtime.domutil.getInnerWidth(this._self);  //this._self.clientWidth - this._paddingLeft - this._paddingRight;
			h = runtime.domutil.getInnerHeight(this._self);  //this._self.clientHeight - this._paddingTop - this._paddingBottom;
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
			var n_client = this.getClientNodeWidth(w, nodes);  //w - nn + runtime.domutil.getStyleProperty(this._self, "paddingLeft");  //补上考虑paddingRight值
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
/*#file end*/
/*#file begin=alz.tools.AppTestWin.js*/
_package("alz.tools");

_import("alz.core.Application");
_import("alz.mui.Window");

_class("AppTestWin", Application, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._win1 = null;
		this._win2 = null;
	};
	this.init = function(){
		_super.init.apply(this, arguments);
		switch(runtime.getConfData("action")){
		case "index" : this.test_index();break;
		case "window": this.test_window();break;
		case "table" : this.test_table();break;
		}
	};
	this.dispose = function(){
		if(this._win1){
			this._win2.dispose();
			this._win2 = null;
			this._win1.dispose();
			this._win1 = null;
		}
		_super.dispose.apply(this);
	};
	this.onResize = function(w, h){
		if(this._win1){
			w -= 220;
			h -= 220;
			this._win1.resize(w, h);
			this._win2.resize(w, h);
		}
	};
	this.test_index = function(){
	};
	this.test_window = function(){
		this._win1 = new Window();
		this._win1.init($("win1"), $("body1"));
		this._win1._self.style.zIndex = runtime.getNextZIndex();
		this._win2 = new Window();
		this._win2.init($("win2"), $("body2"));
		this._win2._self.style.zIndex = runtime.getNextZIndex();
		var _this = this;
		this._win1._self.getElementsByTagName("input")[0].checked = true;
		this._win1._self.getElementsByTagName("input")[0].onclick = function(){
			_this._win1.setResizable(this.checked);
		};
		this._win2._self.getElementsByTagName("input")[0].checked = true;
		this._win2._self.getElementsByTagName("input")[0].onclick = function(){
			_this._win2.setResizable(this.checked);
		};
	};
	this.test_table = function(){
		var sb = [];
		sb.push('<table class="wui-Table" border="0" cellspacing="0" cellpadding="0">');
		sb.push('<thead>');
		sb.push('<tr><th>id</th><th>name</th><th>value</th><th>col3</th><th>col4</th><th>col5</th><th>col6</th><th>col7</th><th>col8</th><th>col9</th><th>col10</th></tr>');
		sb.push('</thead>');
		sb.push('<tbody>');
		for(var i = 0, len = 100; i < len; i++){
			sb.push('<tr><td>' + i + '</td><td>name' + i + '</td><td>value' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td></tr>');
		}
		sb.push('</tbody>');
		sb.push('</table>');
		$("tbl1").innerHTML = sb.join("");
	};
});
/*#file end*/

runtime.regLib("test_win", function(){
	application = runtime.createApp("alz.tools.AppTestWin");
});

}})(this);