_package("alz.mui");

/**
 * 盒子模型接口
 */
_interface("IBoxModel", "", function(){
	/*
	var PROPS = "color,cursor,display,visibility,opacity,zIndex,"
		+ "overflow,position,"
		+ "left,top,bottom,right,width,height,"
		+ "marginBottom,marginLeft,marginRight,marginTop,"
		+ "borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth,"
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
	var PROPS = {
		"left"             : [1, "offsetLeft"  ],
		"top"              : [1, "offsetTop"   ],
		"width"            : [1, "offsetWidth" ],
		"height"           : [1, "offsetHeight"],
		"marginTop"        : [0],
		"marginRight"      : [0],
		"marginBottom"     : [0],
		"marginLeft"       : [0],
		"borderTopWidth"   : [2],
		"borderRightWidth" : [2],
		"borderBottomWidth": [2],
		"borderLeftWidth"  : [2],
		"paddingTop"       : [2],
		"paddingRight"     : [2],
		"paddingBottom"    : [2],
		"paddingLeft"      : [2]
	};
	this._init = function(){
		this._left = 0;
		this._top = 0;
		this._width = 0;
		this._height = 0;
		this._marginTop = 0;
		this._marginRight = 0;
		this._marginBottom = 0;
		this._marginLeft = 0;
		this._borderLeftWidth = 0;
		this._borderTopWidth = 0;
		this._borderRightWidth = 0;
		this._borderBottomWidth = 0;
		this._paddingLeft = 0;
		this._paddingTop = 0;
		this._paddingRight = 0;
		this._paddingBottom = 0;
	};
	this.init = function(obj){
		var style = this._dom.getStyle(obj);
		/*
		var arr = PROPS.split(",");
		for(var i = 0, len = arr.length; i < len; i++){
			this._currentPropertys[arr[i]] = this.getPropertyValue(style, arr[i]);
		}
		*/
		for(var k in PROPS){
			var v0 = PROPS[k][0];
			if(v0 == 0) continue;
			var key = "_" + k;
			this[key] = this.parseNum(obj.tagName, this.getPropertyValue(style, k) || obj.style[k]);
			if(v0 == 1){
				this[key] = this[key] || obj[PROPS[k][1]];
			}
		}
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
	};
	this._setWidth = function(v){
		v = Math.max(v, 0);
		this.setStyleProperty("width", v + "px");
	};
	this._setHeight = function(v){
		v = Math.max(v, 0);
		this.setStyleProperty("height", v + "px");
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
});