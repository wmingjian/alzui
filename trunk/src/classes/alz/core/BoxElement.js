_package("alz.core");

_class("BoxElement", "", function(){
	this._init = function(el, dom){
		_super._init.call(this);
		this._dom = dom;
		this._self = null;
		this.init(el);
	};
	this.init = function(obj){
		obj.__ptr__ = this;
		this._self = obj;
		//chrome,safari下marginRight等属性会自动变化，所以使用缓存，不再重新获取
		var sc = runtime.chrome || runtime.safari;
		if(sc && obj.__properties__){
			for(var k in obj.__properties__){
				this[k] = obj.__properties__[k];
			}
		}else{
			//初始化应用到的属性，从DOM对象中解析出实际的值，只读方式使用
			var properties = [
				"width","height",
				"marginBottom","marginLeft","marginRight","marginTop",
				"borderBottomWidth","borderLeftWidth","borderRightWidth","borderTopWidth",
				"paddingBottom","paddingLeft","paddingRight","paddingTop"
			];
			/*
			var hash = {};
			for(var i = 0, len = properties.length; i < len; i++){
				var key = properties[i];
				if(!("_" + key in this)){
					this["_" + key] = this._dom.getStyleProperty(obj, key);
					if(sc){
						hash["_" + key] = this["_" + key];
					}
				}
			}
			*/
			var hash = {},
				_this = this,
				dom = this._dom,
				style = dom.getStyle(obj);
			for(var i = 0, key; key = properties[i++];){
				if(!("_" + key in _this)){
					_this["_" + key] = dom.parseNum(style[key]);
					if(sc){
						hash["_" + key] = _this["_" + key];
					}
				}
			}
			if(sc){
				obj.__properties__ = hash;
			}
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		/*if(this._self.__layout){
			this._self.__layout.dispose();
			this._self.__layout = null;
		}*/
		try{
			this._self.__ptr__ = null;
		}catch(ex){
		}
		this._self = null;
		this._dom = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
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
		/*
		var h = this._height;
		if(h != this._dom.getHeight(this._self)){
			runtime.log(this._self.className + ":" + h + "!=" + this._dom.getHeight(this._self));
		}
		return this._height;
		*/
		return this._dom.getHeight(this._self);
	};
	this.setHeight = function(h){
		this._dom.setHeight(this._self, h);
	};
	this.getInnerWidth = function(){
		return this._width;
	};
	this.setInnerWidth = function(w, skip){
		//绝对定位，marginRight没有作用
		//this.setWidth(w/*- this._marginLeft - this._marginRight*/);
		this._self.style.width = Math.max(0, w
			- (skip ? 0 : (this._marginLeft + this._marginRight))
			- this._borderLeftWidth - this._borderRightWidth
			- this._paddingLeft - this._paddingRight
		) + "px";
		if(this._self.__onWidthChange){
			this._self.__onWidthChange.call(this);
		}
	};
	this.getInnerHeight = function(){
		return this._height;
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
		if(!this._layout){
			this._layout = this._self.getAttribute("_layout");
		}
		return this._layout;
	};
	/*
	this.layout = function(){
		//this._self.style.overflow = "hidden";
		if(!this._self.__layout){
			var clazz = __context__[this._layout];  //"alz.layout." + this._layout  //BorderLayout
			this._self.__layout = new clazz();
			this._self.__layout.init(this._self);
		}
		this._self.__layout.layoutElement(
			this._self.clientWidth - this._paddingLeft - this._paddingRight,
			this._self.clientHeight - this._paddingTop - this._paddingBottom
		);
	};
	*/
	this.layout = function(){
		//this._self.style.overflow = "hidden";
		var clazz = __context__.__classes__["alz.layout." + this._layout];  //BorderLayout
		var self = this._self;
		var layout = new clazz();
		layout.init(self);
		layout.layoutElement(
			self.clientWidth - this._paddingLeft - this._paddingRight,
			self.clientHeight - this._paddingTop - this._paddingBottom
		);
		layout.dispose();
	};
});