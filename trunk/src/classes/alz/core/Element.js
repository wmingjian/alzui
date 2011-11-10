_package("alz.core");

_import("alz.core.Plugin");

/**
 * DOM元素操作类
 */
_class("Element", Plugin, function(){
	this._init = function(){
		_super._init.call(this);
		this._key = "aui_uid";
		this._uid = 1;
		this._cache = {};  //DOM元素扩展数据缓存
	};
	this.create = function(name, app){
		_super.create.apply(this, arguments);
	};
	this.dispose = function(){
		for(var k in this._cache){
			for(var key in this._cache[k]){
				delete this._cache[k][key];
			}
			delete this._cache[k];
		}
		_super.dispose.apply(this);
	};
	function csskey(key){
		return key.replace(/[A-Z]/g, function(m){
			return "-" + m.toLowerCase();
		});
	}
	var view = document.defaultView;
	if(view){  //!runtime.ie
		this.getStyle = function(el, key){
			//this._data.element.currentStyle || this.getComputedStyle(this._data.element, null)
			var style = view.getComputedStyle(el, "");
			return style.getPropertyValue(csskey(key));
		};
		this.style = function(el, key){
			//var style = this.getStyle(el);
			var style = view.getComputedStyle(el, "");
			if(!key){
				return style;
			}
			//return style.getPropertyValue(key.replace(/([A-Z])/g, "-$1").toLowerCase());
			return style.getPropertyValue(csskey(key));
		};
	}else{
		this.getStyle = function(el, key){
			return el.currentStyle[key];
		};
		this.style = function(el, key){
			var style = el.currentStyle;
			if(!key){
				return style;
			}
			return style[key];
		};
	}
	/**
	 * 获取DOM元素的全局唯一ID标识
	 * @param {HTMLElement} el 目标元素
	 * @return {String} 全局唯一ID标识
	 */
	this.getUid = function(el){
		return el.getAttribute(this._key);  //el[this._key]
	};
	/**
	 * 读取或保存一个DOM元素的附加属性数据
	 * @param {HTMLElement} el 目标元素
	 * @param {String} key 属性名
	 * @param {Object} value 属性值
	 * @return {Object} (读取时)属性值
	 */
	this.data = function(el, key, value){
		//var id = el[this._key];
		var id = el.getAttribute(this._key);
		if(!id){
			id = this._uid++;
			//el[this._key] = id;
			el.setAttribute(this._key, id);
		}
		var cache;
		if(!(id in this._cache)){
			cache = this._cache[id] = {};
		}else{
			cache = this._cache[id];
		}
		if(value){
			cache[key] = value;
		}
		/*
		if(value){
			console.log("set " + id + "." + key + "=" + value);
		}else{
			console.log("get " + id + "." + key);
		}
		*/
		return key in cache ? cache[key] : this.style(el, key);
	};
	/**
	 * 读取或保存一个DOM元素的CSS属性
	 * @param {HTMLElement} el 目标元素
	 * @param {String} key CSS属性名
	 * @param {Object} value CSS属性值
	 * @return {Object} (读取时)CSS属性值
	 */
	this.css = function(el, key, val){
		if(arguments.length == 3){
			switch(key){
			case "left":
			case "top":
			case "width":
			case "height":
				el.style[key] = parseInt(val) + "px";
				break;
			case "opacity":
			case "overflow":
			default:
				el.style[key] = val;
				break;
			}
		}else{
			return this.style(el, key);
		}
	};
	this.width = function(el, size){
		var orig = this.css(el, "width"), ret = parseFloat(orig);
		return isNaN(ret) ? orig : ret;
		//return this.css(el, "width", typeof size === "string" ? size : size + "px");
	};
	this.height = function(el, size){
		var orig = this.css(el, "height"), ret = parseFloat(orig);
		return isNaN(ret) ? orig : ret;
		//return this.css(el, "height", typeof size === "string" ? size : size + "px");
	};
	/**
	 * 获取一个元素相对于一个父元素的位置
	 * @param {HTMLElement} el 目标元素
	 * @param {HTMLElement} refEl 参考的父元素
	 * @return {Postion} 位置坐标{x:n,y:n}
	 */
	this.getPos = function(el, refEl){
		var pos = {"x": 0, "y": 0};
		for(var o = el; o && o != refEl; o = o.offsetParent){
			var bl, bt, x, y;
			if(o != el){
				bl = parseInt(this.getStyle(o, "borderLeftWidth"));
				bt = parseInt(this.getStyle(o, "borderTopWidth"));
				x = isNaN(bl) ? 0 : bl;
				y = isNaN(bt) ? 0 : bt;
				bl = parseInt(this.getStyle(o, "paddingLeftWidth"));
				bt = parseInt(this.getStyle(o, "paddingTopWidth"));
				x += isNaN(bl) ? 0 : bl;
				y += isNaN(bt) ? 0 : bt;
			}
			pos.x += o.offsetLeft + (o != el ? x : 0);
			pos.y += o.offsetTop + (o != el ? y : 0);
		}
		return pos;
	};
	/**
	 * 向DOM元素添加一个class样式
	 * @param {HTMLElement} el 操作的目标元素
	 * @param {String} cls 添加的样式
	 */
	this.addClass = function(el, cls){
		el.className = el.className ? el.className + " " + cls : cls;
	};
	/**
	 * 移除DOM元素上指定名字的样式
	 * @param {HTMLElement} el 操作的目标元素
	 * @param {String} cls 要移除的样式名
	 */
	this.removeClass = function(el, cls){
		var arr = el.className.replace(/ +/g, " ").split(" ");
		var sb = [];
		for(var i = 0, len = arr.length; i < len; i++){
			var a = arr[i];
			if(a != ""){
				if(a != cls){
					sb.push(a);
				}
			}
		}
		el.className = sb.join(" ");
	};
	/**
	 * 替换DOM元素上指定名字的样式
	 * @param {HTMLElement} el 操作的目标元素
	 * @param {String} oldCls 要移除的样式名
	 * @param {String} newCls 替换后新的样式名
	 */
	this.replaceClass = function(el, oldCls, newCls){
		var arr = el.className.replace(/ +/g, " ").split(" ");
		var sb = [];
		for(var i = 0, len = arr.length; i < len; i++){
			var a = arr[i];
			if(a != ""){
				sb.push(a != oldCls ? a : newCls);
			}
		}
		el.className = sb.join(" ");
	};
});