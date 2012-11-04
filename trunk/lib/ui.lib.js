/**
 * alzui-mini JavaScript Framework, v__VERSION__
 * Copyright (c) 2009-2011 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
/**
 * 框架UI基础库
 * @require core
 */
runtime.regLib("ui", "", function(){with(arguments[0]){

/*<file name="alz/mui/IBoxModel.js">*/
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
			this[key] = this.parseNum(/*obj.tagName, */this.getPropertyValue(style, k) || obj.style[k]);
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
/*</file>*/
//import alz.mui.IDesignable;
/*<file name="alz/mui/SelectionManager.js">*/
_package("alz.mui");

/**
 * 列表条目选择动作管理
 */
_class("SelectionManager", "", function(_super, _event){
	var listener = {
		"mouseover": function(ev){
			//this._parent._activeItems.indexOf(this) == -1
			if(!this._active){  //如果不是焦点
				if(this._css.hover && this._css.hover.className){  //hover状态可能不存在
					this._self.className = this._css.hover.className;
				}
			}
		},
		"mouseout": function(ev){
			if(!this._active){  //如果不是焦点
				if(this._css.normal && this._css.normal.className){
					this._self.className = this._css.normal.className;
				}
			}
		},
		"mousedown": function(ev){
			var ctrlKey = ev.ctrlKey;
			var shiftKey = ev.shiftKey;
			if(!this._parent._multiple){
				ctrlKey = false;
				shiftKey = false;
			}
			this._parent._selectMgr.selectItem(this, ctrlKey, shiftKey);
			if(this._parent.onMousedown){
				this._parent.onMousedown(ev);
			}
		},
		"click": function(ev){
			ev.cancelBubble = true;
			return false;
		}
	};
	SelectionManager.SINGLE   = 1;
	SelectionManager.MULTIPLE = 2;
	this._init = function(){
		_super._init.call(this);
		this._list = null;  //{GroupList}
		this._activeItems = [];  //当前激活的列表项目
		this._lastActiveItem = null;  //{GroupItem}最后一次单选激活的列表项目
		this._defaultSelectMode = SelectionManager.SINGLE;
	};
	this.init = function(index){
		if(typeof index == "number"){
			this._lastActiveItem = this._list.getItem(index);  //默认激活第一个列表项目
			this.selectItem(this._list.getItem(index));
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		this.unbindEvent();
		this._lastActiveItem = null;
		this._activeItems.length = 0;
		this._list = null;
		_super.dispose.apply(this);
	};
	this.setBindList = function(list){
		this._list = list;
	};
	this.itemBindEvent = function(item){
		if(!item._evFlag){
			item._evFlag = true;
			runtime.getDom().addEventListener(item._itemDom, "", listener, item);
		}
	};
	this.itemUnbindEvent = function(item){
		if(item._evFlag){
			runtime.getDom().removeEventListener(item._itemDom, "", listener, item);
			item._evFlag = false;
		}
	};
	this.bindEvent = function(){
		var items = this._list.getItems();
		for(var i = 0, len = items.length; i < len; i++){
			this.itemBindEvent(items[i]);
		}
	};
	this.unbindEvent = function(){
		var items = this._list.getItems();
		for(var i = 0, len = items.length; i < len; i++){
			if(items[i]._evFlag){
				if(items[i]._itemDom){ //RQFM-6383 IE7通讯录首页，查找功能有的时候搜索结果不准确
					runtime.getDom().removeEventListener(items[i]._itemDom, "", listener, items[i]);
				}
				items[i]._evFlag = false;
			}
		}
	};
	this.getActiveItems = function(){
		return this._activeItems;
	};
	this.getActiveNums = function(){
		return this._activeItems.length;
	};
	this.getListener = function(){
		return listener;
	};
	/**
	 * 选择指定的列表项目
	 * @param item {HTMLElement} 要选择的列表项目
	 * @param ctrlKey {Boolean} Ctrl键是否按下，支持多选时使用
	 * @param shiftKey {Boolean} Shift键是否按下，支持多选时使用
	 * @param fireChangeEvent {Boolean} 是否触发 onselectchanage 事件
	 * @param forceSelect {Boolean} 是否强制选择
	 */
	this.selectItem = function(item, ctrlKey, shiftKey, fireChangeEvent, forceSelect){
		if(typeof fireChangeEvent == "undefined"){
			fireChangeEvent = true;
		}
		forceSelect = forceSelect || false;

		if(!ctrlKey && !shiftKey){
			this._lastActiveItem = item;
		}
		/*
		if(this._list._selectionMode == 1){
			if(item._active){
				this._list.activeItem(item, false);
				this._activeItems.removeAt(this._activeItems.indexOf(item));
			}else{
				this._list.activeItem(item, true);
				this._activeItems.push(item);  //[TODO]是否保存列表条目的原始顺序？
			}
		}else{
		*/
			if(!this._list._multiple){  //如果不允许多选
				ctrlKey = false;
				shiftKey = false;
			}else{
				ctrlKey = ctrlKey || this._defaultSelectMode == SelectionManager.MULTIPLE;
			}
			var start, end;
			if(shiftKey){
				start = Math.min(this._lastActiveItem.getIndex(), item.getIndex());
				end = Math.max(this._lastActiveItem.getIndex(), item.getIndex());
			}
			var list = [];   //活动的列表项目
			var list0 = [];  //每个列表项目的状态(true|false)
			var items = this._list.getItems();
			for(var i = 0, len = items.length; i < len; i++){
				var obj = items[i];
				if(shiftKey && i >= start && i <= end){
					list.push(obj);
					list0.push(true);
					continue;
				}
				if(ctrlKey){
					if(obj == item){
						if(!obj._active) list.push(obj);
						list0.push(!obj._active);
					}else{
						if(obj._active) list.push(obj);
						list0.push(obj._active);
					}
					continue;
				}
				if(this._list._selectionMode == 0){
					if(obj == item) list.push(obj);
					list0.push(obj == item);
				}else{  //this._list._selectionMode == 1
					if(obj == item){
						if(!obj._active || forceSelect){  //不活动的 或 强制活动的
							list.push(obj);
						}
						list0.push(!obj._active || forceSelect);
					}else{
						if(obj._active){
							list.push(obj);
						}
						if(this._list._multiple){
							list0.push(obj._active);  //其他 Item 不变化
						}else{
							list0.push(false);
						}
					}
				}
			}
			this.selectItems(list, list0);
		//}
		if(this._list.onItemCancel && !item._active){
			this._list.onItemCancel(item);
		}
		if(this._list.onSelectChange && fireChangeEvent){
			this._list.onSelectChange(item._active ? item : this._activeItems[0]);
		}
	};
	/**
	 * 选择一组项目
	 */
	this.selectItems = function(list, list0){
		this._activeItems = list;
		//[TODO]如何对上面过程进行优化，对不需要调整的 Item，应该可以不进行操作
		var items = this._list.getItems();
		for(var i = 0, len = list0.length; i < len; i++){
			this._list.activeItem(items[i], list0[i]);
		}
	};
	/**
	 * 把全部项目设置为选中或非选中状态
	 * @param checked {Boolean} 是否选中
	 */
	this.selectAllItems = function(checked){
		var items0 = [];
		var items = this._list.getItems();
		for(var i = 0, len = items.length; i < len; i++){
			this._list.activeItem(items[i], checked);
			items0.push(items[i]);
		}
		if(checked){
			//不能使用items这个引用，因为它是 this._list 的一个属性，在全选删除一个组
			//的联系人的时候会产生删除两次的错误
			this._activeItems = items0;
			this._lastActiveItem = this._activeItems[this._activeItems.length - 1];
		}else{
			this._activeItems = [];
			this._lastActiveItem = null;
		}
		if(this._list.onSelectChange){
			this._list.onSelectChange(this._lastActiveItem);
		}
	};
	/**
	 * 把全部项目置为非选中状态
	 */
	this.cancelAllActiveItems = function(){
		var items = this._activeItems;
		for(var i = 0, len = items.length; i < len; i++){
			this._list.activeItem(items[i], false);
		}
		this._activeItems.length = 0;
	};
	/**
	 * 把某个项目置为非选中状态
	 */
	this.cancelItem = function(item){
		this._list.activeItem(item, false);
		for(var i = 0, len = this._activeItems.length; i < len; i++){
			if(this._activeItems[i] == item){
				this._activeItems.removeAt(i);
			}
		}
	};
});
/*</file>*/
/*<file name="alz/mui/Component.js">*/
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
_class("Component", EventTarget, function(_super, _event){
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
/*</file>*/
/*<file name="alz/action/ActionElement.js">*/
_package("alz.action");

_import("alz.mui.Component");

/**
 * 具有action特性的组件的基类
 */
_class("ActionElement", Component, function(_super, _event){
	ActionElement.hash = {       //free        cn
		"ActionElement"   : null,
		"FormElement"     : null,
		"LinkLabel"       : null,
		"ComboBox"        : null,  //["ComboBox", "FolderSelect", "GroupSelect"]
		"TextField"       : null,
		"UploadFileButton": null,
		"Button"          : null,  //["Button","SilverButton"]
		"CheckBox"        : null,
		"Radio"           : null
	};
	ActionElement.create = function(name){
		return new this.hash[name]();
	};
	this._init = function(){
		_super._init.call(this);
		this._actionManager = null;
		this._action = "";
		this._timer = 0;  //计时器，防止用户多次重复点击
	};
	this.create = function(parent, obj, actionManager){
		this.setParent2(parent);
		this._actionManager = actionManager;
		obj.style.position = "";
		this.init(obj);
		return obj;
	};
	this.bind = function(obj, actionManager){
		this._actionManager = actionManager;
		var c = obj._ptr;
		this.init(obj);
		if(c && c instanceof Component){
			c._plugins["action"] = this;
			obj._ptr = c;  //还原DOM元素的_ptr属性值
		}
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var data = {
			"disabled": this._self.getAttribute("_disabled") == "true",
			"action"  : this._self.getAttribute("_action")
		};
		this._disabled = data.disabled;
		this.setAction(data.action);
		if(this._className == "ActionElement"){
			var _this = this;
			this._self.onclick = function(ev){
				return _this.dispatchAction(this, ev || window.event);
			};
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._className == "ActionElement"){
			this._self.onclick = null;
		}
		this._actionManager = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getAction = function(){
		return this._action;
	};
	this.setAction = function(v){
		this._action = v;
	};
	this.setDisabled = function(v){
		_super.setDisabled.apply(this, arguments);
		if(this._self){
			this._self.disabled = v;
		}
	};
	this.dispatchAction = function(sender, ev){
		//try{
			if(this._disabled) return false;
			var d = new Date().getTime();
			if(this._timer != 0){
				if(d - this._timer <= 500){  //两次点击间隔必须大于500毫秒
					runtime.log("cancel");
					this._timer = d;
					return false;
				}
			}
			this._timer = d;
			//if(this._self.tagName == "INPUT" && this._self.type == "checkbox"){
			//onDispatchAction可以用来记录用户的完整的行为，并对此进行“用户行为分析”
			if(typeof this.onDispatchAction == "function"){
				this.onDispatchAction(this._action, sender, ev);
			}
			if(this._className == "CheckBox"){
				this._actionManager.dispatchAction(this._action[sender.checked ? 0 : 1], sender, ev);
			}else{
				return this._actionManager.dispatchAction(this._action, sender, ev);
			}
		/*}catch(ex){  //对所有action触发的逻辑产生的错误进行容错处理
			var sb = [];
			for(var k in ex){
				sb.push(k + "=" + ex[k]);
			}
			window.alert("[ActionElement::dispatchAction]\n" + sb.join("\n"));
		}*/
	};
	this.onDispatchAction = function(action, sender, ev){
		//[TODO]iframe 模式下_actionCollection 未定义
		//runtime._actionCollection.onDispatchAction(action, sender);
	};
});
/*</file>*/
/*<file name="alz/action/BitButton.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * 带图标的按钮（表格实现
 */
_class("BitButton", ActionElement, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._visible = true;
	};
	this.init = function(obj, actionManager){
		_super.init.apply(this, arguments);
		this._actionManager = actionManager;
		/*
		var btn = $(arr[i]);
		btn.onmousemove = function(){this.getElementsByTagName("tr")[0].className = "onHover";};
		btn.onmouseout = function(){this.getElementsByTagName("tr")[0].className = "normal";};
		*/
		this._disabled = this._self.getAttribute("_disabled") == "true";
		this.setAction(this._self.getAttribute("_action"));
		var _this = this;
		if(this._action){
			this._self.onclick = function(ev){
				if(_this._disabled) return;
				_this._actionManager.dispatchAction(_this._action, this, ev || window.event);
				return false;
			};
		}
		var rows = this._self.rows;
		if(rows.length != 1){
			throw "[UI_ERROR]组件BitButton只能有一个TR";
		}
		this._self.onmouseover = function(){
			if(_this._disabled) return;
			_this._self.rows[0].className = "onHover";
		};
		this._self.onmouseout = function(){
			if(_this._disabled) return;
			_this._self.rows[0].className = "normal";
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onmouseover = null;
		this._self.onmouseout = null;
		_super.dispose.apply(this);
	};
	this.setStyleProperty = function(name, value){
		try{
			if(this._self){
				this._self.style[name] = value;
			}
		}catch(ex){
			window.alert(ex.message + "\n" + name + "=" + value);
		}
	};
	this.setDisabled = function(v){
		_super.setDisabled.apply(this, arguments);
		if(this._self){
			this._self.rows[0].className = v ? "OnDisable" : "normal";
		}
	};
	this.setVisible = function(v){
		if(this._visible == v) return;
		this._visible = v;
		if(v){
			this.setStyleProperty("visibility", "visible");
			this.setStyleProperty("display", "");
		}else{
			this.setStyleProperty("visibility", "hidden");
			this.setStyleProperty("display", "none");
		}
	};
});
/*</file>*/
/*<file name="alz/action/ComboBox_1.js">*/
_package("alz.action");

_import("alz.action.BitButton");

/**
 * 带下拉菜单的按钮类
 */
_class("ComboBox", BitButton, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._popmenu = null;
		this._popmenu_visible = false;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var rows = this._self.rows;
		if(rows.length != 1) throw "[UI_ERROR]组件BitButton只能有一个TR";
		var menuId = this._self.getAttribute("_popmenu");
		if(!menuId) throw "[UI_ERROR]组件ComboBox缺少属性_popmenu，请检查相关的HTML代码";
		this._popmenu = $(menuId);
		if(!this._popmenu) throw "[UI_ERROR]无法找到ComboBox组件的popmenu(id=" + menuId + ")，请检查相关的HTML代码";
		this.setAction(this._self.getAttribute("_action"));
		/*
		if(this._action){
			if(window[this._action] && typeof window[this._action] == "function"){
				;
			}else{
				throw "[UI_ERROR]组件ComboBox的属性_action的值不是一个函数，请检查相关的HTML代码";
			}
		}
		*/
		var _this = this;
		this._self.onmouseover = function(){
			if(_this._disabled) return;
			_this._self.rows[0].className = "onHover";
			_this.showMenu(true);
		};
		this._self.onmouseout = function(){
			if(_this._disabled) return;
			_this._self.rows[0].className = "normal";
			_this.showMenu(false);
		};
		this._popmenu.onmouseover = function(){
			_this._self.rows[0].className = "onHover";
			_this.showMenu(true);
		};
		this._popmenu.onmouseout = function(){
			_this._self.rows[0].className = "normal";
			_this.showMenu(false);
		};
		/*
		this._popmenu.onclick = function(ev){
			_this.showMenu(false);
			ev = ev || window.event;
			var target = ev.target || ev.srcElement;
			if(target.tagName == "A"){
				target = target.parentNode;
			}
			if(_this._self.onChange){
				_this._self.onChange(target);
			}
			ev.cancelBubble = true;
			return false;
		};
		*/
	};
	this.dispose = function(){
		if(this._disposed) return;
		//this._popmenu.onclick = null;
		this._popmenu.onmouseout = null;
		this._popmenu.onmouseover = null;
		this._popmenu = null;
		this._self.onmouseout = null;
		this._self.onmouseover = null;
		_super.dispose.apply(this);
	};
	this.showMenu = function(v){
		if(this._popmenu_visible == v) return;
		this._popmenu_visible = v;
		if(v){
			var pos = util_getPosition(this._self);
			if(this._popmenu.offsetWidth < this._self.offsetWidth){
				this._popmenu.style.width = (this._self.offsetWidth - 2/* - 10*/) + "px";  //padding(8) + border(2)
			}
			this._popmenu.style.left = pos.x + "px";
			this._popmenu.style.top = (pos.y + this._self.offsetHeight - 1) + "px";
			this._popmenu.style.display = "";
		}else{
			this._popmenu.style.display = "none";
		}
	};
	this.appendItem = function(text, value){
		var ul = util_selectNodes(this._popmenu, "*")[0];
		var li = this._createElement2(ul, "li");
		li._value = value;
		li._text = text;
		var _this = this;
		li.onclick = function(ev){
			_this._actionManager.dispatchAction(_this._action, this, ev || window.event);
		};
		var a = this._createElement2(li, "a", "", {
			"href": "#"
		});
		a.appendChild(this._createTextNode(text));
	};
});
/*</file>*/
/*<file name="alz/action/LinkLabel.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * 超链接(a)元素的封装
 */
_class("LinkLabel", ActionElement, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onclick = function(ev, sender){  //sender 代表要替换的伪装的 sender 参数
			ev = ev || window.event;
			ev.cancelBubble = true;
			return _this.dispatchAction(sender || this, ev);
		};
		this._self.oncontextmenu = function(ev){
			ev = ev || window.event;
			ev.cancelBubble = true;
			return false;
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.oncontextmenu = null;
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});
/*</file>*/
/*<file name="alz/action/TextField.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * input:text元素的封装
 */
_class("TextField", ActionElement, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onblur = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onblur = null;
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/action/Button.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * input:button元素的封装
 */
_class("Button", ActionElement, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onclick = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
		//[TODO]因为setDisabled中的优化考虑，这里目前只能使用如此笨拙的方式驱动
		//setDisabled工作，其他地方相对成熟的方式是添加强制更新的参数。
		var v = this._disabled;
		this._disabled = null;
		this.setDisabled(v);  //强制更新
		/*
		var rows = this._self.rows;
		for(var i = 0, len = rows.length; i < len; i++){
			rows[i].onmouseover = function(){if(_this._disabled) return; this.className = "onHover";};
			rows[i].onmouseout = function(){if(_this._disabled) return; this.className = "normal";};
		}
		*/
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setDisabled = function(v){
		_super.setDisabled.apply(this, arguments);
		if(this._self){
			this._self.style.color = v ? "gray" : "";
			//this._self.rows[0].className = v ? "OnDisable" : "normal";
			/*if(v){
				var btn = this._self.getElementsByTagName("div")[0];
				if(btn) btn.style.backgroundImage = "url(http://www.sinaimg.cn/rny/sinamail421/images/comm/icon_btn.gif)";
			}*/
		}
	};
	this.setVisible = function(v){
		if(this._visible == v) return;
		this._visible = v;
		if(v){
			this.setStyleProperty("visibility", "visible");
			this.setStyleProperty("display", "");
		}else{
			this.setStyleProperty("visibility", "hidden");
			this.setStyleProperty("display", "none");
		}
	};
});
/*</file>*/
/*<file name="alz/action/CheckBox.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * input:checkbox元素的封装
 */
_class("CheckBox", ActionElement, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this.setAction(this._action.split("|"));
		var _this = this;
		this._self.onclick = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});
/*</file>*/
/*<file name="alz/action/ComboBox.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * select元素的封装
 */
_class("ComboBox", ActionElement, function(_super, _event){
	this._init = function(obj){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onchange = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onchange = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});
/*</file>*/
/*<file name="alz/action/Select.js">*/
_package("alz.action");

_import("alz.action.ComboBox");

/**
 * select元素的封装
 */
_class("Select", ComboBox, function(_super, _event){
	this._init = function(obj){
		_super._init.call(this);
		this._select = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._select = this._self;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._select = null;
		_super.dispose.apply(this);
	};
	this.reset = function(pageCount, pageNo){
		this._initListPage(pageCount, pageNo);
		//this._select.value = pageNo;
	};
	//[TODO]页数很多的时候会出现性能问题
	this._initListPage = function(pageCount, pageNo){
		var options = this._select.options;
		//var len = options.length;
		this._select.style.display = "";
		/*
		if(len > pageCount){
			while(options.length > pageCount){
				this._select.remove(options.length - 1);
			}
		}else if(len < pageCount){
			for(var i = Math.max(1, len); i <= pageCount; i++){
				options[options.length] = new Option(i + "/" + pageCount, i);
			}
		}*/
		while(options.length){
			this._select.removeChild(options[0]);
		}
		for(var i = 1; i <= pageCount; i++){
			var option = new Option(i + "/" + pageCount, i);
			options[options.length] = option;
			if(i == pageNo){
				option.selected = true;
			}
		}
		if(options.length == 0){
			this._select.style.display = "none";
		}
	};
});
/*</file>*/
/*<file name="alz/action/FormElement.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * form元素的封装
 */
_class("FormElement", ActionElement, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._elements = [];
		this._app = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onsubmit = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
		this.initCustomElements();
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._app = null;
		for(var i = 0, len = this._elements.length; i < len; i++){
			this._elements[i].dispose();
			this._elements[i] = null;
		}
		this._elements.length = 0;
		this._self.onsubmit = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resetSelf = function(){
		this._self.reset();
	};
	this.getApp = function(){
		if(!this._app){
			for(var el = this._self; el && el._ptr; el = el.parentNode){
				if(el._ptr.instanceOf("mail.ui.Pane")){
					this._app = el._ptr.getApp();
					break;
				}
			}
		}
		return this._app;
	};
	/**
	 * 初始化自定义的表单元素
	 */
	this.initCustomElements = function(){
		//提前收集表单元素，防止后面处理自定义元素时，可能往表单中添加新元素而引起问题
		var elements = [];
		var nodes = this._self.elements;
		for(var i = 0, len = nodes.length; i < len; i++){
			elements.push(nodes[i]);
		}
		for(var i = 0, len = elements.length; i < len; i++){
			var el = elements[i];
			switch(el.tagName){
			case "INPUT":
				switch(el.type){
				case "text":
				case "hidden":
					var className = el.getAttribute("_ui");
					if(className){  //只处理有_ui属性的元素
						if(el.type == "text"){
							el.style.display = "none";
						}
						var clazz = __context__.__classes__[className];
						var component = new clazz();
						component.bindElement(el, this.getApp());
						this._elements.push(component);
					}
					break;
				}
				break;
			}
		}
	};
});
/*</file>*/
/*<file name="alz/mui/IAction.js">*/
_package("alz.mui");

_import("alz.core.ActionManager");
_import("alz.action.ActionElement");
_import("alz.action.FormElement");
_import("alz.action.LinkLabel");
_import("alz.action.ComboBox");
_import("alz.action.Select");
_import("alz.action.TextField");
_import("alz.action.Button");
_import("alz.action.CheckBox");

/**
 * Action接口
 */
_interface("IAction", "", function(){
	var list = [
		{"id": "a"             , "type": "click" , "clazz": "LinkLabel"  },
		{"id": "form"          , "type": "submit", "clazz": "FormElement"},
		{"id": "select"        , "type": "change", "clazz": "ComboBox"   },
		{"id": "button"        , "type": "click" , "clazz": "Button"     },
		{"id": "input#button"  , "type": "click" , "clazz": "Button"     },
		{"id": "input#checkbox", "type": "click" , "clazz": "CheckBox"   }
	];
	var map = {};
	for(var i = 0, len = list.length; i < len; i++){
		var item = list[i];
		item.clazz = __context__[item.clazz];
		map[item.id] = item;
	}
	this._init = function(){
		this._actionManager = null;
		this._currentSender = null;
		this._lastTime = 0;
		//this._lastAct = "";
	};
	this.init = function(){
		if(!this._actionManager){
			this._actionManager = new ActionManager();
			this._actionManager.init(this);
		}
	};
	this.rendered = function(){
		console.log("[IAction::rendered]");
		if(!this._actionManager){
			this._actionManager = new ActionManager();
			this._actionManager.init(this);
		}
		this.initActionElements();
	};
	this.dispose = function(){
		if(this._actionManager){
			this._actionManager.dispose();
			this._actionManager = null;
		}
	};
	this.getActionEngine = function(){
		return this;
	};
	this.getCurrentSender = function(){
		return this._currentSender;
	};
	/**
	 * 初始化组件中的动作元素，使这些元素可以响应默认事件触发其action
	 * [TODO]如何避免已经初始化过的元素重复初始化？
	 * @param {HTMLElement} element
	 * @param {Object} owner
	 * @param {Array} customTags 自定义支持action的标签
	 */
	this.initActionElements = function(element, owner, customTags){
		//owner = owner || this.getActionEngine();
		this.initComponents(element, customTags);
	};
	/**
	 * 初始化组件中的 Action 动作组件
	 * 支持的 Action 动作组件有：
	 *   表单  ： FORM
	 *   超链接： A
	 *   按钮  ： INPUT(type=button)
	 *   复选框： INPUT(type=checkbox)
	 *   列表框： SELECT
	 * 支持增量初始化运行方式
	 */
	this.initComponents = function(element, customTagList){
		element = element || this._self;
		customTagList = customTagList || [];
		var customNodes = [];
		var tags = ["form", "a", "select", "button", "input"].concat(customTagList);
		for(var i = 0, len = tags.length; i < len; i++){
			var tag = tags[i];
			var nodes = element.getElementsByTagName(tag);
			for(var j = 0, len1 = nodes.length; j < len1; j++){
				var node = nodes[j];
				var act = node.getAttribute("_action");
				if(act){
					var key = "a";
					switch(tag){
					case "form":
					case "a":
					case "select": key = tag;break;
					case "input":
						switch(node.type){
						//case "text"  :
						case "button"  :
						case "checkbox": key = tag + "#" + node.type;break;
						default        : key = "";continue;
						}
						//application._buttons[btn._action] = btn;
						break;
					default:  //li,label等标签
						break;
					}
					if(key != ""){
						var clazz = map[key].clazz;
						var plugin = new clazz();
						plugin.bind(node, this._actionManager);
						this._actionManager.add(plugin);
					}
				}
			}
		}
		return customNodes;
	};
	/**
	 * Action 工作模型
	 * [TODO]
	 * 1)级联激发的 Action 动作只把最初的动作压入动作栈，这样能够保证正确的动作回
	 *   退机制。
	 */
	this.doAction = function(act, sender){
		var skip = false;
		if(act == "pop_show"){
			skip = true;
		}
		var time = new Date().getTime();
		if(!skip && time < this._lastTime + 500){
			this._lastTime = time;
			return false;
		}
		//if(time < this._lastTime + 800 && this._lastAct == act){
		//	return false;
		//}
		this._lastTime = time;
		//this._lastAct = act;
		this._currentSender = sender;
		var ret, key = "do_" + act;
		if(key in this && typeof this[key] == "function"){
			ret = this[key](act, sender);
		}else{  //自己处理不了的交给APP处理
			ret = this._app.doAction.apply(this._app, arguments);  //[TODO]
			//runtime.error("[Pane::doAction]未定义的act=" + act);
			//ret = false;
		}
		this._currentSender = null;
		//[TODO]应该在动画播完之后运行，如何保证呢？
		/*
		runtime.startTimer(10, this, function(){
			this._taskSchedule.run("page_unload");
		});
		*/
		return typeof ret == "boolean" ? ret : false;
	};
});
/*</file>*/
/*<file name="alz/mui/ListItem.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 列表项目
 */
_class("ListItem", Component, function(_super, _event){
	this._css = {
		"normal": {},
		"active": {},
		"_hover": {}
	};
	this._init = function(){
		_super._init.call(this);
		this._data = null;
		this._active = false;
		this._itemDom = null;  //响应 ListItem 相关事件的 DOM 元素，不一定是 ListItem._self
		this._checked = false;  //是否被选中
		this._checkbox = null;
		this._label = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._itemDom = this._self;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._label = null;
		this._checkbox = null;
		this._itemDom = null;
		this._data = null;
		_super.dispose.apply(this);
	};
	this.getData = function(){
		return this._data;
	};
	this.setData = function(v){
		this._data = v;
	};
	this.setChecked = function(v, force){
		if(this._checked == v && !force) return;
		this._checked = v;
		if(this._checkbox){
			this._checkbox.checked = v;
		}
	};
	this.getIndex = function(){
		return this._parent.getItemIndex(this);
	};
	this.updateStyle = function(style){
		for(var k in style){
			if(k.charAt(0) == "_") continue;
			(k == "className" ? this._self : this._self.style)[k] = style[k];
		}
	};
	this.activate = function(force){
		if(this._active && !force) return;  //已经激活，则不进行任何操作（性能优化）
		this._active = true;
		this.setChecked(true);
		if(this._self){
			this.updateStyle(this._css.active);
			try{this._self.focus();}catch(ex){}  //能保证Item可以被看到
		}
		if(this.onActive) this.onActive();
	};
	this.deactivate = function(force){
		if(!this._active && !force) return;
		this._active = false;
		this.setChecked(false);
		if(this._self){
			this.updateStyle(this._css.normal);
		}
		if(this.onActive) this.onActive();
	};
});
/*</file>*/
/*<file name="alz/mui/ListBox.js">*/
_package("alz.mui");

_import("alz.mui.SelectionManager");
_import("alz.mui.Component");

/**
 * 列表框组件
 * protected boolean selectionMode = 0;
 * 0 = (默认)配合ctrl,shift按键可以方便的进行多选的常规模式，仿 window 资源管理器文件选择的行为
 * 1 = ctrl,shift仍然可用，不过默认单击为复选模式，再次单击改为取消复选（目的为了不使用ctrl,shift键依然可以进行多选操作）
 */
_class("ListBox", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._data = null;
		this._model = null;  //数据源
		this._tableIndex = null;
		this._useSelectionMode = false;  //{Boolean}是否使用 SelectionManager
		this._multiple         = false;  //{Boolean}默认不支持多选
		this._selectionMode    = 0;      //{Number}列表项目多选模式
		this._hash = {};   //哈希表
		this._list = [];  //列表项目
		this._activeItem = null;
		this._selectMgr = null;
	};
	this.bind = function(obj, model){
		this.setParent2(obj.parentNode);
		this.setModel(model, "+id");
		this.init(obj);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._self.onselectstart = function(){return false;};
		this._selectMgr = new SelectionManager();
		//this._useSelectionMode = true;  //{Boolean}是否使用 SelectionManager
		//this._multiple         = true;  //{Boolean}默认不支持多选
		//this._selectionMode    = 1;     //{Number}列表项目多选模式
		this._selectMgr.setBindList(this);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._selectMgr.dispose();
		this._selectMgr = null;
		if(this._activeItem){
			this._activeItem.deactivate();
			this._activeItem = null;
		}
		for(var i = 0, len = this._list.length; i < len; i++){
			//this._list[i].dispose();
			this._list[i] = null;
		}
		this._list.length = 0;
		for(var k in this._hash){
			this._hash[k].dispose();
			delete this._hash[k];
		}
		if(this._tableIndex){
			this._tableIndex.removeEventListener("dataChange", this);
			this._tableIndex = null;
		}
		this._model = null;
		this._data = null;
		this._self.onselectstart = null;
		_super.dispose.apply(this);
	};
	this.getData = function(){
		return this._data;
	};
	this.setData = function(v){
		this._data = v;
	};
	this.setModel = function(v, filter){
		this._model = v;
		var index = v.getIndex2(filter);
		this._tableIndex = index;
		index.addListener("dataChange", this, "onDataChange");
		runtime.startTimer(0, index, "dispatchExistRecords");  //滞后加载已有的数据，因为相关组件的_self属性可能还不存在
	};
	this.getActiveItem = function(){
		return this._activeItem;
	};
	this.setActiveItem = function(v){
		if(this._activeItem == v) return;
		if(this._activeItem){
			this._activeItem.deactivate();
		}
		if(v){
			v.activate();
		}
		this._activeItem = v;
		//if(this.onSelectChange) this.onSelectChange(v);
	};
	this.getActiveNums = function(){
		return this._selectMgr.getActiveNums();
	};
	this.getActiveItems = function(){
		return this._selectMgr.getActiveItems();
	};
	this.cancelAllActiveItems = function(){
		return this._selectMgr.cancelAllActiveItems();
	};
	this.pushItem = function(item){
		var k = item._data[this._model.getPrimaryKey()];
		if(!(k in this._hash)){
			this._hash[k] = item;
			this._list.push(item);
		}
	};
	this.unshiftItem = function(item){
		var k = item._data[this._model.getPrimaryKey()];
		if(!(k in this._hash)){
			this._hash[k] = item;
			this._list.unshift(item);
		}
	};
	/**
	 * 移除一个列表项目
	 * @param n {Number|ListItem}
	 * @param cache {boolean}  是否缓存列表项目
	 * [TODO]更新 _selectMgr 中的相关信息
	 */
	this.removeItem = function(n, cache){
		if(typeof n != "number"){
			n = this._list.indexOf(n);
		}
		if(n != -1){
			var item = this._list[n];
			if(item == this._activeItem){
				this._activeItem = null;
			}
			var p = this._selectMgr._activeItems.indexOf(item);
			if(p != -1){
				this._selectMgr._activeItems.removeAt(p);
			}
			if(this.onItemRemove){
				this.onItemRemove();  //针对 ContactList 的处理
			}
			//var uid = item._data.uid;
			//app.getModel("group").removeAllGroupMember(uid);  //移除每个组中的成员索引信息
			//delete hash[item._data.uid];  //移除 ContactItem._data 信息
			//移除 Item
			delete this._hash[item._data[this._model.getPrimaryKey()]];
			if(cache){  //如果缓存，只需从父节点移出
				if(item._self && item._self.parentNode != null){
					item._self.parentNode.removeChild(item._self);
				}
			}else{
				item.dispose();
			}
			this._list[n] = null;
			this._list.removeAt(n);
		}
	};
	/**
	 * 删除活动的 ContactItem
	 * [TODO]通过建立合理的数据结构，下面的循环都是可以优化的
	 */
	this.removeActiveItems = function(app){
		for(var i = 0; i < this._list.length;){
			if(this._list[i]._active){
				this.removeItem(i);
				continue;
			}
			i++;
		}
		//app._groupList.updateAllGroup();  //更新所有组的成员数
	};
	this.indexOf_key = function(data, key){
		var n = -1;
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i][key] == data){
				n = i;
				break;
			}
		}
		return n;
	};
	this.getItemIndex = function(item){
		var n = -1;
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i] == item){
				n = i;
				break;
			}
		}
		return n;
	};
	this.getItemByKey = function(key){
		return key in this._hash ? this._hash[key] : null;
	};
	//--------------------------------
	//interface MultiSelect
	//下面的方法是允许多选的接口方法
	//--------------------------------
	/**
	 * 获取组建的列表项目数组
	 */
	this.getItems = function(){
		return this._list;
	};
	/**
	 * 获取一个列表项目
	 */
	this.getItem = function(n){
		return this._list[n];
	};
	/**
	 * 激活指定的列表项目，支持多选
	 * @param item {HTMLElement} 要激活的列表项目
	 * @param active {Boolean} 是否激活该列表项目
	 */
	this.activeItem = function(item, active){
		if(!this._useSelectionMode){
			if(this._activeItem == item) return;
			if(this._activeItem){
				this._activeItem.deactivate();
			}
			item.activate();
			this._activeItem = item;
			if(this.onSelectChange) this.onSelectChange(item);
		}else{
			if(active){
				item.activate();
			}else{
				item.deactivate();
			}
		}
	};
	/**
	 * 通过过滤器函数来选择相关的项目
	 */
	this.selectByFilter = function(func){
		var list = [];   //活动的列表项目
		var list0 = [];  //每个列表项目的状态(true|false)
		var items = this._list;
		for(var i = 0, len = items.length; i < len; i++){
			var v = func(items[i]);
			if(v){
				list.push(items[i]);
			}
			list0.push(v);
		}
		this._selectMgr.selectItems(list, list0);
	};
	/**
	 * 数据变更响应事件，主要用来分派数据变化
	 * @param {DataChangeEvent} ev 数据变更事件
	 */
	this.onDataChange = function(ev){
		var act = ev.act;
		var data = ev.data;
		//var olddata = ev.olddata;
		var a = act.split("_")[1];
		switch(a){
		case "adds":  //批量添加
			this.insertItems(data, ev.pos);
			break;
		case "add":
			if(!this._filter || this._filter(data)){  //有过滤器的话，需要先通过过滤器，才添加
				var id = data[this._model.getPrimaryKey()];
				if(!(id in this._hash)){
					this.insertItem(data, ev.pos);
				}
			}
			break;
		case "mod": 
			//if(!this._filter || this._filter(data)){  //有过滤器的话，情况比较复杂，先交给“视图组件”来自行处理
				//this.onDataChange.apply(this, arguments);
				var id = data[this._model.getPrimaryKey()];
				if(id in this._hash){
					this.updateItem(data);
				}
			//}
			break;
		case "del":
		case "remove":
			if(!this._filter || this._filter(data)){  //有过滤器的话，需要先通过过滤器，才删除
				//this.onDataChange.apply(this, arguments);
				this.deleteItem(data);
			}
			break;
		/*
		case "update":
		case "delete":
		case "clear":
		case "up":
		case "adds":
		case "clean":
		*/
		default:
			//_super.onDataChange.apply(this, arguments);
			break;
		}
	};
	this._insertItem = function(data, pos){
		console.log("_insertItem");
	};
	this.insertItem = function(data, pos){
		this._insertItem(data, pos);
	};
	this.insertItems = function(data, pos){
		for(var i = 0, len = data.length; i < len; i++){
			this._insertItem(data[i], pos + i);
		}
	};
	this.updateItem = function(data){
	};
	this._deleteItem = function(data){
		var id = data[this._model.getPrimaryKey()];
		if(id in this._hash){
			var item = this._hash[id];
			if(item == this._activeItem){
				this._activeItem = null;
			}
			item._self.parentNode.removeChild(item._self);
			var n = this._list.indexOf(item);
			if(n != -1){
				this._list[n] = null;
				this._list.removeAt(n);
			}
			delete this._hash[id];
			item.dispose();
		}
	};
	this.deleteItem = function(data){
		this._deleteItem(data);
	};
	this.deleteAllItems = function(){
		this._activeItem = null;
		for(var i = 0, len = this._list.length; i < len; i++){
			if(!this._list[i]._disposed){
				this._list[i].dispose();
			}
			this._list[i] = null;
		}
		this._list.length = 0;
		for(var k in this._hash){
			//this._hash[k].dispose();
			delete this._hash[k];
		}
	};
});
/*</file>*/
/*<file name="alz/mui/DataRow.js">*/
_package("alz.mui");

_import("alz.mui.ListItem");

/**
 * 数据行组件(视图)
 */
_class("DataRow", ListItem, function(_super, _event){
	/**
	 * 根据cell结构数据创建一组cell对象
	 */
	this.createCells = function(cellsInfo){
		for(var i = 0, len = cellsInfo.length; i < len; i++){
			this._createElement2(this._self, "td", cellsInfo[i][0], {
				"innerHTML": cellsInfo[i][1]
			});
		}
		//this._checkbox = this._self.childNodes[0].childNodes[0].childNodes[0];
	};
	this.init_callback = function(){
		this._checkbox.onmousedown = function(ev){
			ev = ev || window.event;
			ev.cancelBubble = true;
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._checkbox){
			this._checkbox.onmousedown = null;
		}
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/mui/DataTable.js">*/
_package("alz.mui");

_import("alz.mui.ListBox");

/**
 * 数据表格组件(视图)
 */
_class("DataTable", ListBox, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._hashIndexs = {};  //索引哈希(每个元素是一个数组)
		this._dataModel = null;  //数据模型
		this._checkall = null;  //全选复选框
		this._table = null;     //关键的table
		this._tbody = null;
		this._sortKey = this._key;
		this._activeSortField = null;  //当前活动的字段
		this._sort = {  //存储当前排序状态
			"by"      : "",
			"sorttype" : ""
		};
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._hashIndexs[this._key] = this._items;  //把this._items看作主索引
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._tbody = null;
		this._table = null;
		this._checkall = null;
		this._dataModel = null;
		for(var k in this._hashIndexs){
			for(var i = 0, len = this._hashIndexs.length; i < len; i++){
				this._hashIndexs[k][i] = null;
			}
			delete this._hashIndexs[k];
		}
		_super.dispose.apply(this);
	};
	/**
	 * @param {String} key 要排序的字段
	 */
	this.getSortItems = function(key){
		return this._items.sort(function(a, b){
			if(a._data[key] > b._data[key]) return 1;
			if(a._data[key] < b._data[key]) return -1;
			return 0;
		});
	};
	/**
	 * 按照当前排序规则，在正确的位置上插入一个数据项
	 * 该方法是具有排序特性的组件针对 ListBox::pushItem 的替代方法
	 */
	//this.pushItem =
	this.insertItem = function(item){
		//_super.pushItem.apply(this, arguments);
		if(this._key == "") window.alert("[ListBox::pushItem]key == ''");
		var k = item._data[this._key];
		var key = this._sortKey || this._key;
		if(!(k in this._hash)){
			this._hash[k] = item;
			//this._items.push(item);
			var n = this.halfFind(this._items, item, function(a, b){
				runtime.log("====" + a._data[key] + ">" + b._data[key] + "=" + (a._data[key] > b._data[key]));
				if(a._data[key] > b._data[key]) return 1;
				if(a._data[key] < b._data[key]) return -1;
				return 0;
			});
			if(n.ret == -1){
				runtime.log("====" + n.pos);
				this._items.splice(n.pos, 0, item);  //插入一个元素
			}else{
				window.alert("[DataTable::insertItem]数据有重复");
				//runtime.log("[DataTable::pushItem]当前要插入的元素已经存在");
			}
		}
	};
	//二分查找算法
	this.halfFind = function(arr, item, f){
		var i = 1;
		var low = 0;
		var high = arr.length - 1;
		if(high == -1){
			return {"ret": -1, "pos": 0};
		}
		var t = Math.floor((high + low) / 2);
		while(low < high && f(arr[t], item) * f(arr[low], item) * f(arr[high], item) != 0){
			//runtime.log("第" + i + "次查找 -> " + t + "的位置：low=" + low + " high=" + high);
			if(f(item, arr[t]) == 1){  //item > arr[t]
				low = t + 1;
			}else{
				high = t - 1;
			}
			t = Math.floor((high + low) / 2);
			i++;
		}
		if(high == -1){
			return {"ret": -1, "pos": 0};
		}
		if(low >= high && f(arr[t], item) * f(arr[low], item) * f(arr[high], item) != 0){
			//runtime.log("第" + i + "次查找 -> " + t + "的位置：失败！low=" + low + " high=" + high);
			return {
				"ret": -1,
				"pos": f(item, arr[low]) == -1 ? low : low + 1
			};
		}else{
			if(f(arr[t], item) == 0){  //arr[t] == item
				tt = t;
			}else if(f(arr[low], item) == 0){  //arr[low] == item
				tt = low;
			}else{
				tt = high;
			}
			//runtime.log("第" + i + "次查找 -> " + tt + "的位置：找到！low=" + low + " high=" + high);
			return {
				"ret": t,
				"pos": t
			};
		}
		//return t;
	};
	//希尔排序算法
	this.shellSort = function(arr, func){
		for(var step = arr.length >> 1; step > 0; step >>= 1){
			for(var i = 0; i < step; ++i){
				for(var j = i + step; j < arr.length; j += step){
					var k = j, value = arr[j];
					while(k >= step && func(arr[k - step], value) > 0){
						arr[k] = arr[k - step];
						k -= step;
					}
					arr[k] = value;
				}
			}
		}
		//return arr;
	};
	this.activeSortField = function(sender, force){
		var dom = runtime.dom;
		//id         :"number",  //可排序
		//filename   :"string",  //可排序
		//filesize   :"number",  //可排序
		//status     :"number",  //可排序
		//downloadcnt:"number",  //可排序
		//leftdays   :"number",  //可排序
		//token      :"string",
		//url        :"string"
		var key = sender.getAttribute("_by");
		if(force){  //第一次初始化过程中使用强制模式，保证不反转by和sorttype参数
			//this._sort.by = key;
			//this._sort.sorttype = "desc";
			dom.addClass(sender, this._sort.sorttype == "asc" ? "sort_down" : "sort_up");
		}else{
			if(this._activeSortField){
				dom.removeClass(this._activeSortField, "sort_down");
				dom.removeClass(this._activeSortField, "sort_up");
			}
			this._sort.by = key;  //记住排序状态
			this._sort.sorttype = key == this._sort.by ? (this._sort.sorttype == "asc" ? "desc" : "asc") : "asc";
			dom.addClass(sender, key == this._sort.by ? (this._sort.sorttype == "asc" ? "sort_down" : "sort_up") : "sort_up");
		}
		this._activeSortField = sender;
		this.drawTable(this.getSortItems(key));
	};
	this.drawTable = function(items){
		if(this._sort.sorttype == "asc"){
			for(var i = 0, len = items.length; i < len; i++){
				var item = items[i];
				item._self.parentNode.appendChild(item._self);
				item.setChecked(item._active, true);
			}
		}else{
			for(var i = items.length - 1; i >= 0; i--){
				var item = items[i];
				item._self.parentNode.appendChild(item._self);
				item.setChecked(item._active, true);
			}
		}
	};
	/**
	 * 选中符合条件的行，func决定是否符合条件
	 */
	this.selectRows = function(func, table){
		for(var i = 0, len = this._items.length; i < len; i++){
			if(table && this._items[i]._self.parentNode.parentNode != table){
				continue;
			}
			var row = this._items[i];
			if(func(row)){
				row.activate();
			}else{
				row.deactivate();
			}
		}
	};
	/**
	 * @param {Boolean} checked 是否选中
	 */
	this.selectAll = function(checked){
		this._selectMgr.selectAllItems(checked);
		this.dispatchEvent("ItemSelectChange", [this.getActiveNums()]);
	};
	this.cancelAll = function(){
		this._selectMgr.cancelAllActiveItems();
		this._checkall.checked = false;
		this.dispatchEvent("ItemSelectChange", [0]);
	};
	//this.cancelAllActiveItems
});
/*</file>*/
/*<file name="alz/mui/TextHistory.js">*/
_package("alz.mui");

/**
 * 命令历史纪录
 */
_class("TextHistory", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._historys = [];
		this._curIndex = 0;  //历史记录的位置
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._historys.length; i < len; i++){
			this._historys[i] = null;
		}
		this._historys.length = 0;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getText = function(num){
		if(num == -1 && this._historys.length - 1 == 0){  //特殊处理这种情况
			return this._historys[0];
		}else if(this._historys.length - 1 > 0){
			var n = Math.max(0, Math.min(this._historys.length - 1, this._curIndex + num));
			if(this._curIndex != n){
				this._curIndex = n;
				return this._historys[n];
			}
		}
	};
	this.append = function(text){
		this._historys.push(text);
		this._curIndex = this._historys.length;
	};
});
/*</file>*/
/*<file name="alz/mui/TextItem.js">*/
_package("alz.mui");

_import("alz.mui.Component");

_class("TextItem", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._type = "sys";  //当前文本的类型
		this._text = "";     //文本内容
		this._active = false;  //当前文本是否处于活动状态之下
		this._cursor = -1;     //如果处在活动状态下，当前光标位置
		//this.create(parent, type, text);
	};
	this.create = function(parent, type, text){
		this.setParent2(parent);
		this._type = type;
		this._text = text;
		var el = document.createElement("span");
		el.className = this._type;
		parent._self.appendChild(el);
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		this.update();
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getTextLength = function(){
		return this._text.length;
	};
	this.getText = function(){
		return this._text;
	};
	this.setText = function(text){
		this._text = text;
		this._cursor = text.length;
		this.update();
	};
	this.getCursor = function(){
		return this._cursor;
	};
	this.setCursor = function(v){
		this._cursor = v;
		this.update();
	};
	this.appendText = function(text){
		if(this._cursor == -1 || this._cursor == this._text.length){
			this._text += text;
		}else{
			this._text = this._text.substr(0, this._cursor) + text + this._text.substr(this._cursor);
		}
		this._cursor += text.length;
		this.update();
	};
	this.removeChar = function(n){
		if(n == -1){  //backspace
			this._text = this._text.substr(0, this._cursor - 1) + this._text.substr(this._cursor);
			this._cursor--;
		}else{  //del
			this._text = this._text.substr(0, this._cursor) + this._text.substr(this._cursor + 1);
		}
		this.update();
	};
	this.update = function(){
		if(!runtime._host.xul){
			this._self.innerHTML = this.getInnerHTML();
		}else{
			while(this._self.hasChildNodes()){
				this._self.removeChild(this._self.childNodes[0]);
			}
			if(this._active && this._type == "in"){
				var type = this._parent.getCursorType();
				var cursor = type ? 'cursor ' + type : 'cursor';
				this._self.appendChild(this._createTextNode(this._text.substr(0, this._cursor)));
				var span = this._createElement2(this._self, "span", cursor);
				span.appendChild(this._createTextNode(this._text.charAt(this._cursor) || " "));
				this._self.appendChild(this._createTextNode(this._text.substr(this._cursor + 1)));
			}else{
				this._self.appendChild(this._createTextNode(this._text));
			}
		}
	};
	/*
	var html = '<span class="sys">' + runtime.encodeHTML(this._text.substr(0, this._start)) + '</span>'
		+ '<span class="in">'
		+ runtime.encodeHTML(this._text.substr(this._start, this._col))
		+ '<span class="cursor">' + runtime.encodeHTML(this._text.charAt(this._col) || " ") + '</span>'
		+ this._text.substr(this._col + 1)
		+ '</span>';
	this._self.innerHTML = html;
	*/
	this.toHTML = function(){
		return '<span class="' + this._type + '">' + this.getInnerHTML() + '</span>';
	};
	this.getInnerHTML = function(){
		if(this._active && this._type == "in"){
			var type = this._parent.getCursorType();
			var cursor = type ? 'cursor ' + type : 'cursor';
			return runtime.encodeHTML(this._text.substr(0, this._cursor))
				+ '<span class="' + cursor + '">'
				+ runtime.encodeHTML(this._text.charAt(this._cursor) || " ")
				+ '</span>'
				+ this._text.substr(this._cursor + 1);
		}else{
			return runtime.encodeHTML(this._text);
		}
	};
	this.deactivate = function(){
		this._active = false;
		this._cursor = -1;
	};
	this.activate = function(){
		this._active = true;
		if(this._type == "in"){
			this._cursor = this._text.length;
		}
	};
});
/*</file>*/
/*<file name="alz/mui/LineEdit.js">*/
_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.TextHistory");
_import("alz.mui.TextItem");

/**
 * 行编辑器组件
 * <div id="d1" class="LineEdit">&gt;window.<span class="cursor">a</span>lert("aaaa");</div>
 */
_class("LineEdit", Component, function(_super, _event){
	var KEY_BACKSPACE = 8;
	var KEY_TAB       = 9;   //\t
	var KEY_ENTER     = 13;  //\n
	var KEY_SHIFT     = 16;
	var KEY_CTRL      = 17;
	var KEY_ALT       = 18;
	var KEY_CAPSLOCK  = 20;
	var KEY_ESC       = 27;
	var KEY_SPACE     = 32;  //" "
	var KEY_PAGE_UP   = 33;
	var KEY_PAGE_DOWN = 34;
	var KEY_END       = 35;
	var KEY_HOME      = 36;
	var KEY_LEFT      = 37;
	var KEY_UP        = 38;
	var KEY_RIGHT     = 39;
	var KEY_DOWN      = 40;
	var KEY_INS       = 45;
	var KEY_DEL       = 46;
	var KEY_CH_0      = 48;
	var KEY_CH_9      = 57;
	var KEY_SEMICOLON = 59;   //;
	var KEY_CH_A      = 65;
	var KEY_CH_Z      = 90;
	var KEY_F1        = 110;  //
	var KEY_F2        = 111;  //
	var KEY_F3        = 112;  //!!!系统搜索键
	var KEY_F4        = 113;  //!!!Drop 地址栏
	var KEY_F5        = 114;  //!!!刷新
	var KEY_F6        = 115;  //!!!输入焦点转入地址栏
	var KEY_F7        = 116;  //
	var KEY_F8        = 117;  //
	var KEY_F9        = 118;  //
	var KEY_F10       = 119;  //
	var KEY_F11       = 120;  //
	var KEY_F12       = 121;  //!!!输入焦点转入菜单
	var KEY_xxx       = 229;
	//var count = 0;
	this._number = "0123456789)!@#$%^&*(";
	this._letter = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	this.trim = function(str){  //strip
		return str.replace(/^\s+|[\s\xA0]+$/g, "");
	};
	/*
	this.getInputCursorIndex = function(){
		var s = document.selection.createRange();
		s.setEndPoint("StartToStart", this._input.createTextRange());
		window.alert('left:'+(s.text.length)+'\nright:'+(obj.value.length-s.text.length));
		var selection = document.selection;
		var rng = selection.createRange();
		this._input.select();
		rng.setEndPoint("StartToStart", selection.createRange());
		window.alert(rng.text);
		var pos = rng.text.length;
		rng.collapse(false);
		rng.select();
		return pos;
	};
	*/
	function getCursorIndex(){
		var selection = document.selection;
		var rng = selection.createRange();
		this._self.select();
		rng.setEndPoint("StartToStart", selection.createRange());
		this._pos = rng.text.length;
		document.title = this._pos;
		rng.collapse(false);  //移到后面
		rng.select();
	}
	this._init = function(){
		_super._init.call(this);
		this._useInput = false;
		this._input = null;
		this._app = null;
		this._timer = 0;
		this._pos = 0;
		this._history = new TextHistory();  //历史记录管理
		this._cursorType = "gray";  //默认为gray
		this._items = [];
		this._activeItem = null;
		this._start = 0;
		this._end = 80;
		this._col = 4;
		this._iomode = "";  //in|out
	};
	this.create = function(parent, app){
		this.setParent2(parent);
		if(app) this._app = app;
		var el = this._createElement2(parent ? parent._self : null, "div", "ui-lineedit");
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		var _this = this;
		if(this._useInput){
			this._input = this._createElement2(null, "input", "input", {
				"type"     : "text",
				"maxLength": "78"
			});
			//if(debug) this._input.style.backgroundColor = "#444444";
			this.addListener(this._input, "keydown", this, "onKeyDown1");
			this.addListener(this._input, "keyup", this, function(){
				//this._timer = runtime.addThread(200, this, getCursorIndex);
			});
			this.addListener(this._input, "keypress", this, "onKeyPress");
			//this._input.onfocus = function(){};
			//this._input.onblur = function(){};
			this.addListener(this._input, "dblclick", this, function(ev){
				if(this._timer != 0){
					window.clearTimeout(this._timer);
					this._timer = 0;
				}
			});
			this.addListener(this._input, "click", this, function(ev){
				//this._timer = runtime.addThread(200, this, getCursorIndex);
				ev.cancelBubble = true;
			});
		}else{
			/*
			if(runtime.moz){
				document.onkeydown = function(ev){
					return _this.onKeyDown(ev || window.event, _this._self);
				};
			}else{
				this.addListener(this._self, "keydown", this, "onKeyDown");
			}
			*/
		}
	};
	this.reset = function(){
		this._activeItem = null;
		for(var i = 0, len = this._items.length; i < len; i++){
			this._items[i].dispose();
			this._items[i] = null;
		}
		this._items.length = 0;
		this._col = 0;
		this.print(this._parent.getPrompt(), "sys");
		this.setIomode("in");
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activeItem = null;
		for(var i = 0, len = this._items.length; i < len; i++){
			this._items[i].dispose();
			this._items[i] = null;
		}
		this._items.length = 0;
		this._app = null;
		if(this._useInput){
			this.removeListener(this._input, "click");
			this.removeListener(this._input, "dblclick");
			//this._input.onblur = null;
			//this._input.onfocus = null;
			this.removeListener(this._input, "keypress");
			this.removeListener(this._input, "keyup");
			this.removeListener(this._input, "keydown");
			this._input = null;
		}else{
			this.removeListener(this._self, "keydown");
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setCursorType = function(v){
		this._cursorType = v;
	};
	this.getCursorType = function(){
		return this._cursorType;
	};
	this.getText = function(){
		var sb = [];
		for(var i = 0, len = this._items.length; i < len; i++){
			sb.push(this._items[i].getText());
		}
		return sb.join("");
	};
	this.appendItem = function(type, text){
		var item = new TextItem();
		item.create(this, type, text);
		this._items.push(item);
		this.activeItem(item);
		return item;
	};
	this.setIomode = function(v){
		var oldiomode = this._iomode;
		this._iomode = v;
		if(v == "in"){
			this.appendItem("in", "");
			this._start = this._col;
			this._parent._self.appendChild(this._self);
			this.setFocus();
		}else{  //out
			var item = this._activeItem;
			this.activeItem(null);
			if(oldiomode == "in"){
				item.update();
				var line = this._parent.insertBlankLine();
				this._activeItem = null;
				for(var i = 0, len = this._items.length; i < len; i++){
					var obj = this._items[i]._self;
					obj.parentNode.removeChild(obj);
					line.appendChild(obj);
					obj._ptr = null;
					this._items[i]._self = null;
					this._items[i].dispose();
					this._items[i] = null;
				}
				this._items.length = 0;
			}
			this._parent._self.removeChild(this._self);
		}
		/*
		this._lineEdit.setParent(this._lastLine);
		var obj = this._lineEdit._self;
		if(!obj.parentNode){
			this._lastLine.appendChild(obj);
			this.resize();
		}
		*/
	};
	this.setWidth = function(v){
		//this._input.style.width = Math.max(0, v) + "px";
	};
	this.getValue = function(){
		return this._input.value;
	};
	this.setValue = function(v){
		this._input.value = v;
	};
	this.getHistoryText = function(num){
		var text = this._history.getText(num);
		if(text){
			this._activeItem.setText(text);
			this._col = this._start + text.length;
		}
	};
	this.activeItem = function(item){
		if(this._activeItem == item) return;
		if(this._activeItem){
			this._activeItem.deactivate();
		}
		if(item){
			item.activate();
		}
		this._activeItem = item;
	};
	/*
	this.setText = function(v){
		var sb = [];
		for(var i = 0, len = this._items.length; i < len; i++){
			sb.push(this._items[i].getText());
		}
		if(v != sb.join("")) window.alert(123123);
		this._text = v;
	};
	this._formatLine = function(){
		var sb = [];
		for(var i = 0, len = this._items.length; i < len; i++){
			sb.push(this._items[i].toHTML());
		}
		return sb.join("");
	};
	this.updateLine = function(){
		this._self.innerHTML = this._formatLine();
		var sb = [];
		//sb.push("row=" + this._row);
		sb.push("col=" + this._col);
		sb.push("start=" + this._start);
		sb.push("curIndex=" + this._history._curIndex);
		sb.push("text=" + this.getText());
		window.status = sb.join(",");
	};
	*/
	this.setFocus = function(){
		if(this._useInput){
			if(!this._input.parentNode) return;
			var rng = this._input.createTextRange();
			rng.collapse(true);
			rng.moveStart('character', this._pos);
			rng.select();
			runtime.addThread(0, this, function(){
				try{
					this._input.focus();
				}catch(ex){
				}
			});
		}else{
			if(!this._self.parentNode){
				this._parent._self.appendChild(this._self);
			}
			if(this._iomode == "in"){
				//try{
				//	this._self.focus();  //(通过焦点的转换,)重新定位光标的位置
				//}catch(ex){
				//}
				this._activeItem.update();
				this._parent.scrollToBottom();
			}
		}
	};
	this.getFrontText = function(){
		var s = document.selection.createRange();
		s.setEndPoint("StartToStart", this._input.createTextRange());
		return s.text;
	};
	this.addInputText = function(text, value){
		//var rng = this._input.createTextRange();
		//rng.moveEnd("character");
		var rng = document.selection.createRange();
		if(value && value.length > 0){
			rng.moveStart("character", -value.length);
		}
		rng.text = text;
	};
	this.getNumber = function(n){
		return this._number.substr(n, 1);
	};
	this.getChar = function(n){
		return this._letter.substr(n, 1);
	};
	this.isEndLine = function(row){
		//return (row == this._rows.length - 1);
		return true;
	};
	/**
	 * 往行编辑器里面打印一段文本
	 * @param {String} str 要打印的文件内容
	 * @param {String} type 文本的类型
	 *             sys 系统信息
	 *             dbg 调试信息
	 *             in  标准输入
	 *             out 标准输出
	 *             err 错误输出
	 *             log 日志信息
	 */
	this.print = function(str, type){
		if(typeof str == "undefined") window.alert(str);
		if(this._useInput){
			this._input.value = str;
		}else{
			str = str.replace(/\r?\n/g, "\n");
			if(str.indexOf("\n") == -1){
				this.printText(str, type);
			}else{
				var arr = str.split("\n");
				for(var i = 0, len = arr.length; i < len; i++){
					if(i < len - 1){
						this._parent.insertLine(arr[i], this._iomode == "in" ? this._self : null, type);
					}else{
						if(arr[i] != ""){
							this.printText(arr[i], type);
						}
					}
				}
				//this._lastLine = this.insertLine(arr[i]);
				//line.style.backgroundColor = getRandomColor();
				//line.innerHTML = runtime.encodeHTML(str);
				//this._self.insertBefore(line, _input.parentNode);
			}
		}
	};
	this.printText = function(str, type){
		this.appendItem(type, str);
		this._col += str.length;
		/*
		var span = this._createElement2(this._self, "span", type);
		span.appendChild(this._createTextNode(str));
		*/
	};
	this.incCol = function(n){
		if(this._col + n <= 80){
			this._col += n;
			return true;
		}else{
			return false;
		}
	};
	//插入一段不含回车符的字符串
	this.insertText = function(str){
		if(this.incCol(str.length)){
			if(this._col == this.getText().length + str.length){
				this._activeItem.appendText(str);
			}else{
				this._activeItem.appendText(str);
			}
		}
	};
	//事件处理函数
	this.onKeyPress = function(ev, sender){
		var ch = String.fromCharCode(ev.keyCode);
		var v = sender.value;
		if(ch == "\r" && this.trim(v) != ""){
			var text = v + "\n";
			sender.value = "";
			this._input.parentNode.removeChild(this._input);
			this._history.append(text);
			this.print(text, "in");
			this._parent.getCallback()(text);
		}else if(ch == "."){  //自动完成功能
			if(this._app){
				var nameChain = this._app.getNameChain(this.getFrontText());
				this._app.showFunTip(nameChain);
				//var name = nameChain || "#global";
			}
		}else if(ch == "("){  //语法提示功能
		}/*else if(ch == "\t"){
			window.alert(111);
		}*/
	};
	//使用input元素的实现
	this.onKeyDown1 = function(ev){
		var sender = this._input;
		var redraw = true;
		var kc = ev.keyCode;
		if(this._app){
			var tip = this._app.getTip();
			if(tip && tip.getVisible()){
				return tip.onKeyDown(ev, sender);
			}
		}
		switch(kc){
		case KEY_TAB:
			this.addInputText("  ");  //'\t'
			ev.cancelBubble = true;
			return false;
		case KEY_ESC:
			this.setValue("");
			ev.cancelBubble = true;
			return false;
		case KEY_LEFT:
			break;
		case KEY_UP:
			if(this._curIndex >= 0){
				if(this._curIndex == this._historys.length){
					this.setValue(this._historys[--this._curIndex]);
				}else if(this._curIndex >= this._historys.length - 1){
					this.setValue(this._historys[--this._curIndex]);
				}else{
					this.setValue(this._historys[this._curIndex--]);
				}
			}
			break;
		case KEY_RIGHT:
			break;
		case KEY_DOWN:
			if(this._curIndex < this._historys.length - 1){
				while(this._curIndex <= -1){
					this._curIndex++;
				}
				this.setValue(this._historys[++this._curIndex]);
			}
			break;
		}
		return true;
	};
	//不使用input元素的实现
	this.onKeyDown = function(ev, sender){
		//var redraw = true;
		var ret;
		var kc = ev.keyCode;
		if(this._app){
			var tip = this._app.getTip();
			if(tip && tip.getVisible()){
				return tip.onKeyDown(ev, sender);
			}
		}
		if(kc >= KEY_CH_0 && kc <= KEY_CH_9){  //如果是数字(或相应特殊字符)
			this.insertText(this.getNumber(kc - KEY_CH_0 + (ev.shiftKey ? 10 : 0)));
		}else if(kc >= KEY_CH_A && kc <= KEY_CH_Z){  //如果是字母
			this.insertText(this.getChar(kc - KEY_CH_A + (ev.shiftKey ? 26 : 0)));
		}else if(kc == 61){
			this.insertText(ev.shiftKey ? "+" : "=");
		}else if(kc == 109){
			this.insertText(ev.shiftKey ? "_" : "-");
		}else if(kc == KEY_SEMICOLON){
			this.insertText(ev.shiftKey ? ":" : ";");
		}else if(kc >= 186 && kc <= 192){
			this.insertText((ev.shiftKey ? ":+<_>?~" : ";=,-./`").substr(kc - 186, 1));
		}else if(kc >= 219 && kc <= 222){
			this.insertText((ev.shiftKey ? "{|}\"" : "[\\]'").substr(kc - 219, 1));
		}else if(kc == KEY_TAB){
			this.insertText("\t");
		}else if(kc == KEY_SPACE){
			this.insertText(" ");
		}else{
			//redraw = this.do_control(ev);
			ret = this.do_control(ev);
		}
		if(this._col < 0){
			window.alert("Error");
		}
		//count++;
		//window.status = "Ln " + this._row + "   Col " + this._col + "|" + count;
		//if(redraw){
		//	this.drawViewPort();
		//}
		return ret || false;
	};
	this.do_control = function(ev){
		var kc = ev.keyCode;
		switch(kc){
		case KEY_ESC:
			if(this._activeItem.getText() == ""){
			}else{
				this._activeItem.setText("");
				this._col = this._start;
			}
			break;
		case KEY_ENTER:  //确定输入，而无论光标在哪里
			if(this._col > this._start){
				var text = this.getText().substr(this._start);
				this._history.append(text);
				this.setIomode("out");
				//this.print("\n", "in");
				//this._parent.insertLine(this.getText().substr(0, this._start) + text);
				this._parent.getCallback()(text + "\n");
				//this._parent.insertLine(text);
				//this.reset();
				/*
				var row = this._rows[this._row];
				var str = row._text.substr(this._col);  //保存行尾被截断的字符串
				row.setText(row._text.substring(0, this._col) + "\n");  //在此断行
				this._row++;  //指向下一行
				this.insertRow(this._row, str);  //插入一空行并赋值为上行截尾字符串
				this._col = 0;  //列定位于新行开始处
				*/
			}
			break;
		case KEY_BACKSPACE:
			if(this._col > this._start){  //如果没有在开始处
				this._activeItem.removeChar(-1);
				this._col--;
			}
			ev.returnValue = 0;  //防止chrome等浏览器的后退
			ev.cancelBubble = true;
			return false;  //阻止页面后退
		case KEY_DEL:
			if(this._col < this.getText().length){  //如果没有在行末
				this._activeItem.removeChar();
			}
			break;
		case KEY_HOME:
			this._activeItem.setCursor(0);
			this._col = this._start;
			return false;
		case KEY_END:
			this._activeItem.setCursor(this._activeItem.getTextLength());
			this._col = this.getText().length;
			return false;
		case KEY_LEFT:
			if(this._col > this._start){
				this._activeItem.setCursor(this._activeItem.getCursor() - 1);
				this._col--;
			}
			return false;
		case KEY_RIGHT:
			//if(this.isEndLine(this._row)){  //如果是最后一行的话
				if(this._col < this.getText().length){  //this._rows[this._row].getLength()
					this._activeItem.setCursor(this._activeItem.getCursor() + 1);
					this.incCol(1);
				}else{
					return;  //已在编辑文本的最末端
				}
			/*
			}else{
				if(this._col < this.getText().length - 1){  //this._rows[this._row].getLength() - 1
					this.incCol(1);
				}else{  //光标移到下一行开始
					this._col = 0;
					this._row++;
				}
			}
			*/
			return false;
		case KEY_UP:
			/*
			if(this._row > 0){
				var len = this._rows[this._row - 1].getLength();
				if(this._col > len - 1){  //如果大于上一行的长度
					this._col = len - 1;
				}
				this._row--;
				this.updateLine();
			}
			return false;
			*/
			this.getHistoryText(-1);
			break;
		case KEY_DOWN:
			/*
			if(!this.isEndLine(this._row)){  //如果不是最后一行
				var len = this._rows[this._row + 1].getLength();
				if(this.isEndLine(this._row + 1)){  //如果下一行是最后一行
					if(this._col > len - 1){
						this._col = len;
					}
				}else{
					if(this._col > len - 1){
						this._col = len - 1;  //如果大于下一行的长度
					}
				}
				this._row++;
				this.updateLine();
			}
			return false;
			*/
			this.getHistoryText(1);
			break;
		case KEY_SHIFT:
			this._selecting = true;
			this._row0 = this._row;
			this._col0 = this._col;
			return false;
		case KEY_CTRL:
			return false;
		case KEY_ALT:
			return false;
		case KEY_F1:
		case KEY_F2:
		case KEY_F3:  //!!!系统搜索键
		case KEY_F4:  //!!!Drop 地址栏
		case KEY_F5:  //!!!刷新
		case KEY_F6:  //!!!输入焦点转入地址栏
		case KEY_F7:
		case KEY_F8:
		case KEY_F9:
		case KEY_F10:
		case KEY_F11:
		case KEY_F12:  //!!!输入焦点转入菜单
			return;
		default:
			window.alert(kc);
			break;
		}
		return true;
	};
	this.onKeyUp = function(ev){
	};
});
/*</file>*/
/*<file name="alz/mui/Console.js">*/
_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.LineEdit");

/**
 * 控制台组件
 */
_class("Console", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._lines = [];
		//this._lastLine = null;
		this._lineEdit = null;
		this._prompt = ">";
		this._interpret = null;
		this._callback = null;
		this._iomode = "";  //in|out
	};
	//this.build = function(parent, node){_super.build.apply(this, arguments);};
	this.create = function(parent, app){
		this.setParent2(parent);
		this._app = app;
		var el = this._createElement2(parent, "div", "ui-console");
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		//<div class="ui-lineedit">&gt;<input class="input" type="text" value="" /></div>
		//this.setFont("12px 宋体");
		/*
		this._lastLine = this._createElement2("div", "ui-lineedit", {
			"backgroundColor": "#888888",
			"innerHTML"      : encodeHTML(this._prompt)
		});
		*/
		this._lineEdit = new LineEdit();
		this._lineEdit.create(this, this._app);
		this._self.onclick = function(){
			//this.focus();
			this._ptr.activate();
		};
		this._self.onfocus = function(){
			this._ptr.activate();
		};
		this._self.onblur = function(){
			this._ptr.deactivate();
		};
		if(!runtime.ie){
			var _this = this;
			this.__onkeydown = function(ev){
				return _this._lineEdit.onKeyDown(ev || window.event, _this._lineEdit._self);
			};
			document.addEventListener("keydown", this.__onkeydown, false);
		}else{
			this.addListener(this._self, "keydown", this._lineEdit, "onKeyDown");
		}
		//this._lastLine = this._lineEdit._self;
		this._lineEdit.setIomode("out");
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._interpret = null;
		if(this._lineEdit){
			this._lineEdit.dispose();
			this._lineEdit = null;
		}
		//this._lastLine = null;
		for(var i = 0, len = this._lines.length; i < len; i++){
			this._lines[i] = null;
		}
		this._lines.length = 0;
		this._app = null;
		if(!runtime.ie){
			document.removeEventListener("keydown", this.__onkeydown, false);
		}else{
			this.removeListener(this._self, "keydown");
		}
		this._self.onblur = null;
		this._self.onfocus = null;
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resize = function(w, h){
		//this._lineEdit.setWidth(this._input.parentNode.offsetWidth) + "px";
		//this.print(this._self.clientWidth, "dbg");
		//var w = document.body.clientWidth - 14 - 100;
		//this._self.style.width = (document.body.clientWidth - 14) + "px";
		w = this._self.clientWidth - 14 - 8 - 20;
		this._lineEdit.setWidth(w);
	};
	this.activate = function(){
		this._lineEdit.setCursorType("");
		this._lineEdit.setFocus();
	};
	this.deactivate = function(){
		this._lineEdit.setCursorType("gray");
		this._lineEdit.setFocus();
	};
	this.getPrompt = function(){
		return this._prompt;
	};
	this.setInterpret = function(v){
		this._interpret = v;
		this.print(this._interpret.getWelcomeMessage(), "sys");
		this._prompt = this._interpret.getPrompt();
		//this.print(this._interpret.getPrompt(), "sys");
	};
	//默认的解释器接口
	this.interpret = function(text){
		this.print(text);
	};
	this.showPrompt = function(v){
		if(v){  //show
			this.start(this, function(text){
				this.interpret(text);
			});
		}else{  //hide
			//this._parent._self.focus();
			//this._lastLine.removeChild(this._lineEdit._self);
			//this._lastLine.removeChild(this._lastLine.lastChild);
		}
	};
	this.start = function(agent, func){
		var _this = this;
		this.getLineInput(function(text){
			func.call(agent, text);
			_this.getLineInput(arguments.callee);
		});
	};
	this.getLineInput = function(callback){
		if(callback){
			this._callback = callback;
		}
		this.resize();
		this._lineEdit.reset();
	};
	this.getLineEdit = function(){
		return this._lineEdit;
	};
	this.getCallback = function(){
		return this._callback;
	};
	this.insertBlankLine = function(){
		var line = this._createElement2(this._self, "div", "ui-lineedit");
		this._lines.push(line);
		return line;
	};
	this.insertLine = function(text, refNode, type){
		var line = this._createElement("div");
		line.className = "ui-lineedit";
		if(text){
			//line.innerHTML = runtime.encodeHTML(text);
			var span = this._createElement2(line, "span", type);
			span.appendChild(this._createTextNode(text));
		}
		if(refNode){
			this._self.insertBefore(line, refNode);
		}else{
			this._self.appendChild(line);
		}
		this._lines.push(line);
		return line;
	};
	/**
	 * 往shell文本屏幕上打印一段文本
	 * @param {String} str 要打印的文件内容
	 * @param {String} type 文本的类型
	 */
	this.print = function(str, type){
		type = type || "sys";
		if(typeof str != "string"){
			str = "" + str;
		}
		this._lineEdit.print(str, type);
	};
	//[TODO]XUL环境下不起作用
	this.scrollToBottom = function(){
		this._self.scrollTop = this._self.scrollHeight;
	};
});
/*</file>*/
/*<file name="alz/mui/Iframe.js">*/
_package("alz.mui");

_import("alz.mui.Component");

_class("Iframe", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._event = runtime.ie ? "onreadystatechange" : "onload";
		this._skipCallback = false;  //标志，忽略回调处理
		this._type = "text";
		this._agent = null;
		this._callback = null;
	};
	this.create = function(parent, name, type, agent, callback){
		this.setParent2(parent);
		this._type = type;
		this._agent = agent;
		this._callback = typeof callback == "function" ? callback : agent[callback];
		obj = this._createElement2(parent, "iframe", "", {
			//"id"   : name,
			//"name" : name,
			"display": "none"
		});
		var firstLoad = true;
		var _this = this;
		obj[this._event] = function(){
			if(runtime.ie && !(this.readyState == "loaded" || this.readyState == "complete")){
				return;
			}
			if(firstLoad){
				firstLoad = false;
				try{  //FF下面报错
					this.contentWindow.name = name;
				}catch(ex){
				}
				if(typeof _this.onLoad == "function"){
					_this.onLoad();
				}
				return;
			}
			_this.onCallback();
		};
		obj.src = "about:blank";
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._callback = null;
		this._agent = null;
		_super.dispose.apply(this);
	};
	this.onCallback = function(){
		if(this._skipCallback){  //如果需要忽略回调
			this._skipCallback = false;
		}else{
			var data;
			switch(this._type){
			case "json":
				try{
					var text = this.getResponseText();
					if(text == ""){
						data = {"result": false, "msg": "服务器内部错误"};
					}else{
						data = runtime.parseJson(text);
						if(data === null){
							data = {
								"result": false,
								"errno" : 0,
								"msg"   : "[Iframe::onCallback]服务端返回的json数据格式有问题" + text,
								"data"  : null
							};
						}
					}
				}catch(ex){
					//根据要求暂时修改提示信息，通过firebug来log错误信息
					window.alert("网络连接失败，请重试！ ");
					if(window.console && console.log){
						cosole.log("通信失败！\n原因：" + runtime.forIn(ex).join("\n"));
					}
					//window.alert("通信失败！\n原因：" + runtime.forIn(ex).join("\n"));
					data = {};
				}
				break;
			case "text":
				data = this.getResponseText();
				break;
			}
			this._callback.call(this._agent, data);
			this._skipCallback = true;  //标志，忽略回调处理
			this._self.contentWindow.location.replace("about:blank");
		}
	};
	this.getDocument = function(){
		return this._self.contentDocument || this._self.contentWindow.document;
	};
	this.getResponseText = function(){
		var text = this.getDocument().body.innerHTML;
		if(runtime.moz){
			text = text.replace(/<br \\=\"\">/g, "<br />");  //FF可能存在需要处理的BR标签
		}
		return text;
	};
});
/*</file>*/
/*<file name="alz/mui/CodeEditor.js">*/
_package("alz.mui");

_import("alz.mui.Component");
//CodeMirror
//MirrorFrame

/**
 * 代码编辑器
 */
_class("CodeEditor", Component, function(_super, _event){
	this._eid = 0;
	this._editors = {};
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._editor = null;
	};
	this.build = function(el){
		_super.build.apply(this, arguments);
		this.bind(this._self, "");
	};
	this.bind = function(obj, code){
		var _this = this;
		var path = runtime.getConfigData("pathlib");
		//this._editor = new MirrorFrame(CodeMirror.replace(obj), {
		this._editor = CodeMirror.fromTextArea(obj, {
			"height"    : "450px",
			"content"   : code,
			"path"      : path + "codemirror/js/",
			"parserfile": ["tokenizejavascript.js", "parsejavascript.js"],
			"stylesheet": path + "codemirror/css/jscolors.css",
			"autoMatchParens": true,
			// add Zen Coding support
			"syntax": "html",
			"onLoad": function(editor){
				editor.win.document.addEventListener("mousedown", function(ev){
					runtime.eventHandle(ev);
				}, false);
				zen_editor.bind(editor);
				//editor.setCode(win._params.code);
				_this._app.loadFile(editor);
			}
		});
		this._editor.wrapping.className = "ui-codeeditor";
		this._editor._eid = this._eid++;
		this._editors[this._editor._eid] = this._editor;
		this.init(this._editor.wrapping);
	};
	this.dispose = function(){
		//this._editor.win.document.removeEventListener("mousedown", xxx);
		delete this._editors[this._editor._eid];
		this._editor = null;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.setCode = function(v){
		this._editor.setCode(v);
	};
	this.setApp = function(v){
		this._app = v;
	};
});
/*</file>*/
/*<file name="alz/mui/ToolButton.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 工具栏按钮
 */
_class("ToolButton", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._label = null;
	};
	this.create = function(parent, data){
		this.setParent2(parent);
		this.setData(data);
		var el = this._createElement2(parent, "li", "ui-toolbutton");
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		this._self.title = this._data.title;
		this._self.setAttribute("_action", this._data.action);
		this._label = this._createElement2(this, "label", "", {
			"backgroundPosition": (-this._data.id * 16) + "px 0px"
		});
	};
	this.dispose = function(){
		this._label = null;
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/mui/BitButton.js">*/
_package("alz.mui");

_import("alz.mui.ToolButton");

/**
 * 带图标的按钮组件
 */
_class("BitButton", ToolButton, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._icon = "";
		this._disabled = false;
		this._app = null;
	};
	this.bind = function(obj, app){
		this._app = app;
		this.init(obj);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		//this._label = this._self.childNodes[1];
		this.setDisabled(this._self.getAttribute("_disabled") == "true");
		this._icon = this._self.getAttribute("_icon") || "";
		if(this._icon != ""){
			this._self.style.background = "url(" + this._self.getAttribute("_icon") + ") 2px 2px no-repeat";
		}
		this._tip = this._self.getAttribute("_tip") || "";
		if(this._tip != ""){
			this._self.title = this._tip;
		}
		this.addListener(this._self, "mouseover", this, "onMouseOver");
		this.addListener(this._self, "mouseout", this, "onMouseOut");
		this.addListener(this._self, "mousedown", this, "onMouseDown");
		this.addListener(this._self, "mouseup", this, "onMouseUp");
		//this.addListener(this._self, "click", this, "onClick");
	};
	this.dispose = function(){
		if(this._disposed) return;
		this.removeListener(this._self, "mouseover", this, "onMouseOver");
		this.removeListener(this._self, "mouseout", this, "onMouseOut");
		this.removeListener(this._self, "mousedown", this, "onMouseDown");
		this.removeListener(this._self, "mouseup", this, "onMouseUp");
		//this.removeListener(this._self, "click", this, "onClick");
		this._app = null;
		this._label = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setDisabled = function(v){
		_super.setDisabled.apply(this, arguments);
		this.setEnableEvent(!v);
		if(this._self){
			this._self.style.filter = v ? "gray" : "";
			this._label.disabled = v;
		}
	};
	this.onMouseOver = function(ev){
		runtime.dom.addClass(this._self, "hover");
		/*
		this._self.style.borderLeft = "1px solid buttonhighlight";
		this._self.style.borderTop = "1px solid buttonhighlight";
		this._self.style.borderRight = "1px solid buttonshadow";
		this._self.style.borderBottom = "1px solid buttonshadow";
		*/
	};
	this.onMouseOut = function(ev){
		var target = ev.target || ev.toElement;
		if(!runtime.dom.contains(this._self, target)){
			runtime.dom.removeClass(this._self, "hover");
			runtime.dom.removeClass(this._self, "active");
			//this._self.style.border = "1px solid buttonface";
		}
	};
	this.onMouseDown = function(ev){
		runtime.dom.addClass(this._self, "active");
		/*
		this._self.style.borderLeft = "1px solid buttonshadow";
		this._self.style.borderTop = "1px solid buttonshadow";
		this._self.style.borderRight = "1px solid buttonhighlight";
		this._self.style.borderBottom = "1px solid buttonhighlight";
		*/
		var sender = ev.target || ev.srcElement;
		//this._app.doAction(sender.getAttribute("_action"), sender);
	};
	this.onMouseUp = function(ev){
		runtime.dom.replaceClass(this._self, "active", "hover");
		/*
		this._self.style.borderLeft = "1px solid buttonhighlight";
		this._self.style.borderTop = "1px solid buttonhighlight";
		this._self.style.borderRight = "1px solid buttonshadow";
		this._self.style.borderBottom = "1px solid buttonshadow";
		*/
	};
	/*
	this.onClick = function(ev){
		var sender = ev.target || ev.srcElement;
		this._app.doAction(sender.getAttribute("_action"), sender);
	};
	*/
});
/*</file>*/
/*<file name="alz/mui/ToggleButton.js">*/
_package("alz.mui");

_import("alz.mui.BitButton");

/**
 * 工具栏按钮
 */
_class("ToggleButton", BitButton, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._groupId = "";
		this._toggled = false;
	};
	this.create = function(parent, data){
		this.setParent2(parent);
		this.setData(data);
		var el = this._createElement2(parent, "li", "ui-toolbutton");
		this.init(el);
		return el;
	};
	this.bind = function(el, app){
		this.init(el);
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		var data = {
			"groupid": this._self.getAttribute("_groupid"),
			"toggled": this._self.getAttribute("_toggled") == "true",
		};
		if(data.groupid){
			this._groupId = data.groupid;
		}
		//if(!this._groupId) throw "ToggleButton 组件缺少 _groupid 属性";
		this.addListener(this._self, "mouseover", this, "onMouseOver");
		this.addListener(this._self, "mouseout", this, "onMouseOut");
		this.addListener(this._self, "click", this, "onClick");
		runtime.toggleMgr.add(this);
		if(data.toggled){
			runtime.toggleMgr.toggle(this);
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		this.removeListener(this._self, "mouseover");
		this.removeListener(this._self, "mouseout");
		this.removeListener(this._self, "click");
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getGroupId = function(){
		return this._groupId;
	};
	this.setToggled = function(v){
		if(this._toggled == v) return;
		this._toggled = v;
		if(v){
			runtime.dom.addClass(this._self, "active");
			/*
			this._self.style.borderLeft = "1px solid buttonshadow";
			this._self.style.borderTop = "1px solid buttonshadow";
			this._self.style.borderRight = "1px solid buttonhighlight";
			this._self.style.borderBottom = "1px solid buttonhighlight";
			*/
			//this._app.doAction(this._self.getAttribute("_action"));
		}else{
			runtime.dom.removeClass(this._self, "active");
			runtime.dom.removeClass(this._self, "hover");
			//this._self.style.border = "1px solid buttonface";
		}
	};
	this.onMouseOver = function(ev){
		if(this._toggled) return;
		runtime.dom.addClass(this._self, "hover");
		/*
		this._self.style.borderLeft = "1px solid buttonhighlight";
		this._self.style.borderTop = "1px solid buttonhighlight";
		this._self.style.borderRight = "1px solid buttonshadow";
		this._self.style.borderBottom = "1px solid buttonshadow";
		*/
	};
	this.onMouseOut = function(ev){
		if(this._toggled) return;
		var target = ev.target || ev.toElement;
		//if(!runtime.dom.contains(this._self, target)){
			runtime.dom.removeClass(this._self, "active");
			runtime.dom.removeClass(this._self, "hover");
			//this._self.style.border = "1px solid buttonface";
		//}
	};
	this.onClick = function(ev){
		runtime.toggleMgr.toggle(this);
	};
});
/*</file>*/
/*<file name="alz/mui/ToolBar.js">*/
_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.ToolButton");
_import("alz.mui.BitButton");
_import("alz.mui.ToggleButton");

/**
 * 工具栏组件
 */
_class("ToolBar", Component, function(_super, _event){
	var HASH = {
		"ui-toolbutton"  : ToolButton,
		"ui-bitbutton"   : BitButton,
		"ui-togglebutton": ToggleButton
	};
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._buttons = [];
	};
	this.bind = function(obj, parent, app, data, hash){
		this.setParent2(parent);
		this._app = app;
		this.init(obj);
		if(data){
			this.createButtons(data, hash);
		}
	};
	this.init = function(obj, app){
		_super.init.apply(this, arguments);
		//var nodes = this._self.childNodes;
		var nodes = obj.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			if(node.nodeType != 1) continue;
			if(node.className in HASH){
				var clazz = HASH[node.className];
				var btn = new clazz();
				btn.bind(node, this._app);  //[TO-DO]改用bind实现
				this._buttons.push(btn);
			}
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._buttons.length; i < len; i++){
			this._buttons[i].dispose();
			this._buttons[i] = null;
		}
		this._buttons.length = 0;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setApp = function(v){
		this._app = v;
	};
	this.createButtons = function(data, hash){
		for(var i = 0, len = data.length; i < len; i++){
			var k = data[i];
			var t = k.charAt(0);
			switch(t){
			case "-":
				this._createElement2(this, "li", "sep");
				break;
			case "#":
				k = k.substr(1);
				var btn = new ToggleButton();
				btn.create(this, hash[k]);
				this._buttons.push(btn);
				runtime.toggleMgr.add(btn);
				break;
			default:
				var btn = new ToolButton();
				btn.create(this, hash[k]);
				this._buttons.push(btn);
				break;
			}
		}
	};
});
/*</file>*/
/*<file name="alz/mui/MenuItem.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 菜单项
 */
_class("MenuItem", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.build = function(el){
		_super.build.apply(this, arguments);
		//[TODO]使用文本类型模板更新TextNode
		var attributes = el._attributes;
		var sb = [];
		if(attributes.text){
			sb.push(attributes.text);
		}
		if(attributes.key){
			sb.push("(<u>" + attributes.key + "</u>)");
		}
		if(attributes.more){
			sb.push(attributes.more);
		}
		console.log(sb.join(""));
		this._self.childNodes[0].innerHTML = sb.join("");
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/mui/MenuButton.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 菜单栏按钮
 */
_class("MenuButton", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/mui/MenuBar.js">*/
_package("alz.mui");

_import("alz.mui.ListBox");

/**
 * 菜单栏
 */
_class("MenuBar", ListBox, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._activeItem1 = null;
	};
	this.bind = function(obj){
		this.init(obj);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		this._activeItem1 = null;
		_super.dispose.apply(this);
	};
	this.activeItem = function(v){
		if(this._activeItem1 === v) return;
		if(this._activeItem1){
			runtime.dom.removeClass(this._activeItem1._self, "active");
		}
		runtime.dom.addClass(v._self, "active");
		v._actionManager.dispatchAction(v._action, v._self);
		this._activeItem1 = v;
	};
});
/*</file>*/
/*<file name="alz/mui/ModalPanel.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 模态对话框使用的遮挡面板组件
 */
_class("ModalPanel", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._targetList = [];
		this._activeTarget = null;
		this._iframe = null;  //用来遮挡SELECT等DIV遮挡不住的组件
		this._panel = null;   //再用这个DIV遮挡在IFRAME上面
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._self.className = "ui-modalpanel";
		this.moveTo(0, 0);
		this.setOpacity(0.01);
		if(runtime.ie){
			this._iframe = this._createElement2(this._self, "iframe", "", {
				"scrolling": "no",
				"frameBorder": "0",
				"frameSpacing": "0",
				//"allowTransparency": "true",
				"src": "about:blank",
				"display": "none",
				"position": "absolute",
				"width": "100%",
				"height": "100%"
			});
		}
		this._panel = this._createElement2(this._self, "div", "", {
			"display": "none",
			"position": "absolute",
			"left": "0px",
			"top": "0px"
		});
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._panel = null;
		this._iframe = null;
		this._activeTarget = null;
		for(var i = 0, len = this._targetList.length; i < len; i++){
			this._targetList[i] = null;
		}
		this._targetList.length = 0;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setVisible = function(v){
		_super.setVisible.apply(this, arguments);
		if(this._iframe){
			this._iframe.style.display = v ? "" : "none";
		}
		this._panel.style.display = v ? "" : "none";
		if(this._visible){  //如果面板已经显示
			//this.getActiveTarget().setVisible(false);
		}else{
		}
	};
	this.resize = function(w, h){
		_super.resize.apply(this, arguments);
		this._panel.style.width = w + "px";
		this._panel.style.height = h + "px";
		if(this._activeTarget.moveToCenter){
			this._activeTarget.moveToCenter();
		}
	};
	this.pushTarget = function(v){
		this._activeTarget = v;
		this._targetList.push(v);
		var rect = runtime._workspace.getViewPort();
		this.resize(rect.w, rect.h);
		//var screen = runtime.getBody();
		/* 是否需要移动呢？
		var rect = this._parent.getViewPort();
		this.moveTo(rect.x, rect.y);
		*/
		//this.resize(screen.clientWidth, screen.clientHeight);
		//this.resize(
		//	Math.max(screen.scrollWidth, screen.clientWidth),
		//	Math.max(screen.scrollHeight, screen.clientHeight)
		//);
		this.setVisible(true);  //!!v
		this.setZIndex(runtime.getNextZIndex());
	};
	this.popTarget = function(v){
		this._targetList.pop();
		this._activeTarget = this._targetList[this._targetList.length - 1];
		if(this._targetList.length == 0){
			this.setVisible(false);
		}else{
			this.getActiveTarget().setZIndex(runtime.getNextZIndex());
		}
	};
	this.getActiveTarget = function(){
		return this._activeTarget;  //this._targetList[this._targetList.length - 1];
	};
});
/*</file>*/
/*<file name="alz/mui/Container.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 凡是具有_layout,_align属性的元素全部是该类或子类的实例
 */
_class("Container", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._nodes = [];
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i].dispose();
			this._nodes[i] = null;
		}
		this._nodes.length = 0;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resize = function(w, h){
		_super.resize.apply(this, arguments);
		this.updateDock();
	};
	this.add = function(component){
		this._nodes.push(component);
	};
	/**
	 * 会被 DockPanel 组件重载，以实现特殊的布局定义
	 */
	this.getDockRect = function(){
		return {
			"x": 0,
			"y": 0,
			"w": this.getInnerWidth(),
			"h": this.getInnerHeight()
		};
	};
	/**
	 * 按照停靠的优先顺序：1)上下；2)左右；3)居中，更新停靠组件的位置信息
	 */
	this.updateDock = function(){
		var rect = this.getDockRect();
		var nodes = this._nodes;
		//调整上停靠的组件
		for(var i = 0, len = nodes.length; i < len; i++){
			var el = nodes[i];
			switch(el.getAlign()){
			case "top":
				el.moveTo(rect.x, rect.y);
				el.resize(rect.w, el._dockRect.h);
				rect.y += el._dockRect.h;
				rect.h -= el._dockRect.h;
				break;
			}
		}
		//调整下停靠的组件
		for(var i = nodes.length - 1; i >= 0; i--){
			var el = nodes[i];
			switch(el.getAlign()){
			case "bottom":
				el.moveTo(rect.x, rect.y + rect.h - el._dockRect.h);
				el.resize(rect.w, el._dockRect.h);
				rect.h -= el._dockRect.h;
				break;
			}
		}
		//调整左停靠的组件
		for(var i = 0, len = nodes.length; i < len; i++){
			var el = nodes[i];
			switch(el.getAlign()){
			case "left":
				el.moveTo(rect.x, rect.y);
				el.resize(el._dockRect.w, rect.h);  //"100%"
				rect.x += el._dockRect.w;
				rect.w -= el._dockRect.w;
				break;
			}
		}
		//调整右停靠的组件
		for(var i = nodes.length - 1; i >= 0; i--){
			var el = nodes[i];
			switch(el.getAlign()){
			case "right":
				el.moveTo(rect.x + rect.w - el._dockRect.w, rect.y);
				el.resize(el._dockRect.w, rect.h);  //"100%"
				rect.w -= el._dockRect.w;
				break;
			}
		}
		//调整居中停靠的组件
		for(var i = 0, len = nodes.length; i < len; i++){
			var el = nodes[i];
			switch(el.getAlign()){
			case "client":
				//最后调整align == "client"的组件的大小
				el.moveTo(rect.x, rect.y);
				el.resize(rect.w, rect.h);
				break;
			}
		}
	};
});
/*</file>*/
/*<file name="alz/mui/Panel.js">*/
_package("alz.mui");

_import("alz.mui.Container");

/**
 * 面板组件，支持布局自适应特性的面板
 */
_class("Panel", Container, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});
/*</file>*/
/*<file name="alz/mui/Pane.js">*/
_package("alz.mui");

_import("alz.mui.Container");
_import("alz.mui.IAction");

/**
 * 可独立工作的面板组件
 */
_class("Pane", Container, function(_super, _event){
	_implements(this, IAction);
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._params = null;  //参数
		this._pid = "";       //pageid
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getApp = function(){
		return this._app;
	};
	this.setApp = function(v){
		this._app = v;
	};
	this.setParams = function(v){
		this._params = v;
	};
	this.getPid = function(){
		return this._pid;
	};
	this.setPid = function(v){
		this._pid = v;
	};
	/**
	 * 通过模板名创建一组DOM元素
	 * @param {Element} parent 父元素
	 * @param {String} tpl 模板名
	 * @return {Element}
	 */
	this.createTplElement = function(parent, tpl, app){
		app = app || this._app;
		var tag;
		var str = app.getTplData(tpl);
		str.replace(/^<([a-z0-9]+)[ >]/, function(_0, _1){
			tag = _1;
		});
		var conf = app._taglib.getTagConf(tag);
		if(conf){
			if(parent.getContainer){
				parent = parent.getContainer();
			}
			var tpldoc = app.getTplDoc();
			tpldoc.push(parent);  //设置当前父节点
			var rootNode = app._template.createXMLDocument(str).documentElement;
			var tplEl = tpldoc.createTplElement(conf, rootNode);
			tpldoc.pop();
			return tplEl._self;
		}else{
			return this.createDomElement(parent, str/*, ".module"*/);
		}
	};
});
/*</file>*/
/*<file name="alz/mui/DeckPane.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 层叠面板管理组件(N个Pane组件层叠)
 */
_class("DeckPane", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._conf = {};  //Pane类配置信息
		this._hash = {};
		this._activePane = null;  //当前活动的Pane页
	};
	this.bind = function(obj, app){
		this._app = app;
		this.init(obj);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activePane = null;
		for(var k in this._hash){
			this._hash[k].dispose();
			delete this._hash[k];
		}
		this._app = null;
		_super.dispose.apply(this);
	};
	this.exist = function(key){
		return key in this._hash;
	};
	this.getPane = function(key){
		return this._hash[key];
	};
	/**
	 * 基于延迟创建的考虑
	 */
	this.getPane2 = function(key, params){
		var pane;
		if(!this.exist(key)){
			pane = this.createPane(null, key, params);
		}else{
			pane = this.getPane(key);
			pane.setParams(params);
		}
		return pane;
	};
	this.createPane = function(parent, key, params/*, html*/){
		parent = parent || this;  //runtime.getWorkspace()
		var k = key.split("#")[0];
		var conf = this._app.findConf("pane", k);
		var pane = new conf.clazz();
		pane.setPid(k);
		pane.setData(conf);
		pane.setParams(params);
		if(parent instanceof Pane){
			pane.setParentPane(parent);
		}
		pane.create(parent, this._app, conf.tpl);
		//this.pushItem1(key, pane);
		this._hash[key] = pane;
		return pane;
	};
	this.navPane = function(pid, params){
		params = params || {};
		var pane = this.getPane2(pid, params);
		if(this._activePane == pane){
			pane.setVisible(true);
			pane.reset(params);
			return;
		}
		if(this._activePane){
			this._activePane.setVisible(false);
		}
		pane.setVisible(true);
		pane.reset(params);
		this._activePane = pane;
	};
});
/*</file>*/
/*<file name="alz/mui/Workspace.js">*/
_package("alz.mui");

_import("alz.mui.Container");
_import("alz.mui.ModalPanel");

/**
 * 工作区组件
 */
_class("Workspace", Container, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._fixedX = 0;
		this._fixedY = 0;
		this._fixedOff = null;
		this._fixed = null;
		this._testFixDiv = null;
		this._modalPanel = null;
		this._captureComponent = null;
		this._tipMouse = null;
		this._activePopup = null;
		this._activeDialog = null;
		this._types = {
			"workspace" : {},
			"window"    : {},
			"dialog"    : {},
			"pane"      : {},
			"button"    : {},
			"checkbox"  : {},
			"radio"     : {},
			"combobox"  : {},
			"richeditor": {},
			"codeeditor": {},
			"icon"      : {},
			"popup"     : {},
			"popmenu"   : {},
			"rebar"     : {},
			"menubar"   : {},
			"toolbar"   : {},
			"statusbar" : {},
			"menu"      : {},
			"menuitem"  : {},
			"panel"     : {},
			"toolbutton": {}
		};
	};
	this.create = function(parent){
		this.setParent2(parent);
		var el = this._createElement2(parent, "div", "ui-workspace wui-PaneApp");
		this.init(el);
		return el;
	};
	this.__init = function(el, domBuildType){
		_super.__init.apply(this, arguments);
		this.onMouseMove = this._mousemoveForNormal;
		//this.onMouseMove = this._mousemoveForFixed;
		//this._self.ondragstart = function(ev){return false;};
		//this._self.onselectstart = function(ev){return false;};
		this._modalPanel = new ModalPanel();
		this._modalPanel.create(this);
		this._modalPanel.setVisible(false);
		/*
		var rect = this.getViewPort();
		//window.alert(rect.x + "," + rect.y + "," + rect.w + "," + rect.h);
		this._testFixDiv = this._createElement2(this._self, "div", "", {
			"position"       : "absolute",
			"border"         : "10px",
			"left"           : (rect.x - 10) + "px",
			"top"            : (rect.y - 10) + "px",
			"width"          : (rect.w + 20) + "px",
			"height"         : (rect.h + 20) + "px",
			"backgroundColor": "#DDDDDD",
			"zIndex"         : "200"  // + runtime.getNextZIndex()
		});
		var _this = this;
		var d = this._createElement2(this._testFixDiv, "div", "", {
			"width"          : "100%",
			"height"         : "100px",
			"backgroundColor": "#AAAAAA",
			"onmousedown"    : function(ev){return _this._mousemoveForFixed(ev || runtime.getWindow().event);}
		});
		this.onMouseDown = this._mousemoveForFixed;
		*/
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		//在这里绑定工作区所有可能用到的事件
		//……
		/*
		runtime.addEventListener(this._self, "resize", function(ev){
			window.alert();
		});
		*/
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activeDialog = null;
		this._activePopup = null;
		this._tipMouse = null;
		this._captureComponent = null;
		if(this._modalPanel){
			this._modalPanel.dispose();
			this._modalPanel = null;  //模态对话框用的模态面板
		}
		this._testFixDiv = null;
		//this._self.onselectstart = null;
		//this._self.ondragstart = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setStyleProperty = function(name, value){
		if(this._self.tagName == "BODY" && (name == "width" || name == "height")){
			return;  //忽略对 style 属性 width,height 的设置
		}
		_super.setStyleProperty.apply(this, arguments);
	};
	this.resize = function(w, h){
		if(!this._inited) return;  //[TODO]
		_super.resize.call(this, w, h);
		if(this._modalPanel && this._modalPanel.getVisible()){
			this._modalPanel.resize(w, h);  //调整模态面板的大小
		}
	};
	this.getModalPanel = function(){
		return this._modalPanel;
	};
	this.setActiveDialog = function(v){
		this._activeDialog = v;
	};
	this.setActivePopup = function(v){
		if(this._activePopup === v) return;
		if(this._activePopup){
			//[TODO]还原蒙板
			runtime.dom.removeClass(this._activePopup.getOwner(), "active");
			this._activePopup.setVisible(false);
			//this._activePopup.setZIndex(1);
		}
		if(v){
			v.setZIndex(10);
			runtime.dom.addClass(v.getOwner(), "active");
			v.setVisible(true);
		}
		this._activePopup = v;
	};
	this.setCaptureComponent = function(v){
		this._captureComponent = v;
	};
	this.eventHandle = function(ev){
		var ret;
		var type = {
			"keydown"  : "KeyDown",
			"keypress" : "KeyPress",
			"keyup"    : "KeyUp",
			"mousedown": "MouseDown",
			"mousemove": "MouseMove",
			"mouseup"  : "MouseUp"
		};
		var evtype = "on" + type[ev.type];
		if(this._captureComponent && this._captureComponent[evtype]){
			this.onMouseMove(ev);
			return this._captureComponent[evtype](ev);
		}
		if(typeof this[evtype] == "function"){
			ret = this[evtype](ev);
		}
		return ret;
	};
	this.onKeyUp = function(ev){
		var ret;
		if(this._activeDialog && this._activeDialog.onKeyUp){
			ret = this._activeDialog.onKeyUp(ev);
		}
		return ret;
	};
	this.onMouseDown = function(ev){
		if(this._activePopup){
			switch(this._activePopup._className){
			case "alz.mui.Popup":
			case "alz.mui.PopupMenu":
				var target = ev.target || ev.srcElement;
				if(this._activePopup._self == target || this._activePopup._self.contains(target)){
					//交给组件自己处理
				}else if(this._activePopup.getVisible()){
					this.setActivePopup(null);
				}
				if(ev.stopPropagation){
					ev.stopPropagation();
				}else{
					ev.cancelBubble = true;
				}
				return false;
			case "alz.mui.Dialog":
				break;
			}
		}
	};
	this.onMouseMove = null;
	this.onMouseUp = function(ev){
	};
	/*
	 * 偏移量的修正依赖于 getPos 方法的正确性，如果本身计算就不正确，修正结果也将不对
	 * [TODO]在第一次onMouseMove事件中执行修正偏移量的计算
	 */
	/*
	this._mousemoveForFixed = function(ev){
		var el = runtime._testDiv;
		var pos = this._dom.getPos(el, this._self);
		if(this._fixed == null){
			//window.alert((pos.x + ev.offsetX) + "," + (pos.y + ev.offsetY) + "|" + ev.clientX + "," + ev.clientY);
			this._offsetX = ev.offsetX;
			this._offsetY = ev.offsetY;
			this._fixedOff = {"x": pos.x + ev.offsetX, "y": pos.y + ev.offsetY};
			this._fixed = "fixing";
			//this.onMouseMove(ev);
			var rect = this.getViewPort();
			var x = rect.x + Math.min(rect.w - this._paddingLeft, Math.max(0, ev.clientX - this._borderLeftWidth)) - this._fixedX - this._offsetX - this._paddingLeft;
			var y = rect.y + Math.min(rect.h - this._paddingTop, Math.max(0, ev.clientY - this._borderTopWidth)) - this._fixedY - this._offsetY - this._paddingTop;
			el.style.left = (-2000 + x) + "px";
			el.style.top = (-2000 + y) + "px";
			this._mousemoveForFixed(ev);
		}else if(this._fixed == "fixing"){
			//this._fixedOff = {"x": ev.clientX, "y": ev.clientY};
			this._fixedX = pos.x + ev.offsetX - this._fixedOff.x;
			this._fixedY = pos.y + ev.offsetY - this._fixedOff.y;
			//window.alert("&&&&" + this._fixedX + "," + this._fixedY);
			this._fixed = "fixed";
			this.onMouseMove = this._mousemoveForNormal;  //转换成正常的事件
		}else{  //fixed
			ev.cancelBubble = true;
		}
	};
	*/
	this._mousemoveForFixed = function(dlg, ev){
		var el = ev.srcElement;
		var pos = dlg._dom.getPos(el, this._self);
		if(this._fixed == null){
			//window.alert((pos.x + ev.offsetX) + "," + (pos.y + ev.offsetY) + "|" + ev.clientX + "," + ev.clientY);
			this._fixedOff = {
				"pos_x"     : pos.x,
				"pos_y"     : pos.y,
				"o"         : ev.srcElement,
				"ev_offsetX": ev.offsetX,
				"ev_offsetY": ev.offsetY,
				"x"         : pos.x + ev.offsetX,
				"y"         : pos.y + ev.offsetY
			};
			this._fixed = "fixing";
			dlg.onMouseMove(ev);
		}else if(this._fixed == "fixing"){
			if(ev.srcElement != this._fixedOff.o || ev.offsetX != this._fixedOff.ev_offsetX || ev.offsetY != this._fixedOff.ev_offsetY){
				console.warn("[Workspace::_mousemoveForFixed]fixing unexpect");
			}
			this._fixedX = pos.x - this._fixedOff.pos_x;  //pos.x + ev.offsetX - (this._fixedOff.pos_x + this._fixedOff.ev_offsetX)
			this._fixedY = pos.y - this._fixedOff.pos_y;  //pos.y + ev.offsetY - (this._fixedOff.pos_y + this._fixedOff.ev_offsetY)
			//document.title = this._fixedX + "," + this._fixedY + "|" + dlg._borderLeftWidth + "," + dlg._borderTopWidth;
			this._fixed = "fixed";
			dlg.onMouseMove(ev);
			this._mousemoveForFixed = null;
		}
	};
	this._mousemoveForNormal = function(ev){
		if(runtime._debug){  //如果调试状态的话，更新 MouseEvent 的信息
			if(!this._tipMouse){
				this._tipMouse = this._createElement2(this._self, !runtime.ns ? "div" : "textarea", "", {  //NS 有性能问题，改用 textarea
					"position"       : "absolute",
					"border"         : "1px solid #AAAAAA",
					"font"           : "12px 宋体",
					"zIndex"         : "1000"/*,
					"backgroundColor": "buttonface",
					"filter"         : "Alpha(Opacity=90)"*/
				});
				if(runtime.ns){
					this._tipMouse.readOnly = true;
					this._tipMouse.style.width = "150px";
					this._tipMouse.style.height = "300px";
				}
			}
			var o = {
				/*
				"type":1,
				"target":1,
				"reason":1,
				"cancelBubble":1,
				"returnValue":1,
				"srcFilter":1,
				"fromElement":1,
				"toElement":1,
				*/
				//mouse event
				"button":1,
				"screenX":1,
				"screenY":1,
				"clientX":1,
				"clientY":1,
				"offsetX":1,
				"offsetY":1,
				"x":1,
				"y":1/*,
				//key event
				"altKey":1,
				"ctrlKey":1,
				"shiftKey":1,
				"keyCode":1
				*/
			};
			//var a = this.forIn(ev);
			var a = [];
			for(var k in o) a.push(k + "=" + ev[k]);
			var off = {"x": 0, "y": 0};
			for(var el = ev.srcElement; el; el = el.offsetParent){
				off.x += el.offsetLeft + parseInt0(el.currentStyle.borderLeftWidth);
				off.y += el.offsetTop + parseInt0(el.currentStyle.borderTopWidth);
				a.push("off(x=" + el.offsetLeft + ",y=" + el.offsetTop + "),border(blw=" + parseInt0(el.currentStyle.borderLeftWidth) + ",btw=" + parseInt0(el.currentStyle.borderTopWidth) + ")");
			}
			a.push("OFF(x=" + off.x + ",y=" + off.y + "),OFF+offset(x=" + (off.x + ev.offsetX) + ",y=" + (off.y + ev.offsetY) + ")");
			this._tipMouse.style.left = (ev.clientX - this._borderLeftWidth + 4) + "px";
			this._tipMouse.style.top = (ev.clientY - this._borderTopWidth + 4) + "px";
			if(runtime.ns){
				this._tipMouse.value = a.join("\n");
			}else{
				this._tipMouse.innerHTML = a.join("<br />");
			}
		}
		if(this._activePopup){
			var target = ev.target || ev.srcElement;
			var bar = this._activePopup.getOwner().parentNode;
			if(bar.className == "ui-menubar" && bar.contains(target)){
				var item = this.getMenuItem(bar, target);
				if(item && item._ptr){
					bar._ptr.activeItem(item._ptr);
				}
			}
		}
	};
	this.getMenuItem = function(bar, obj){
		var el = obj;
		for(; el && el.parentNode != bar; el = el.parentNode){
		}
		return el;
	};
});
/*</file>*/
/*<file name="alz/mui/DropDown.js">*/
_package("alz.mui");

_import("alz.mui.Component");

_class("DropDown", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._menu = null;
	};
	this.bind = function(obj){
		_super.bind.apply(this, arguments);
		this._bindDrop();
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._bindDrop();
	};
	this.dispose = function(){
		if(this._disposed) return;
		this.removeListener(this._self, "mousedown");
		this._self.onclick = null;
		if(this._menu){
			this._menu.dispose();
			this._menu = null;
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this._bindDrop = function(){
		if(!this._menu){
			var id = this._dropid;  //this._self.getAttribute("dropid")
			if(!id) runtime.getWindow()._alert("组件DropDown缺少属性dropid");
			this._menu = runtime.initComponent(runtime._workspace, id);
			if(!this._menu) throw "未找到DropDown组件的下拉列表[Popup,id=\"" + id + "\"]";
			this._menu.setVisible(false);
			this.addListener(this._self, "mousedown", this, "onMouseDown");
			this._self.onclick = function(ev){return false;};
			this._menu._self.onmousedown = function(ev){
				ev = ev || this._ptr._win.event;
				window.alert((ev.srcElement || ev.target).innerHTML);
			};
		}
	};
	this.onMouseDown = function(ev){
		if(this._menu.getVisible()){
			runtime._workspace.setActivePopup(null);
		}else{
			this._menu.setWidth(Math.max(this.getWidth(), this._menu.getWidth()));
			runtime._workspace.setActivePopup(this._menu);
			var pos = this.getPosition(ev, 0);
			this._menu.moveTo(pos.x, pos.y + this.getHeight());
		}
		ev.cancelBubble = true;
		return false;
	};
});
/*</file>*/
/*<file name="alz/mui/Popup.js">*/
_package("alz.mui");

_import("alz.mui.Pane");

/**
 * 弹出式组件
 */
_class("Popup", Pane, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._conf = null;
		this._app = null;
		this._params = null;
		this._owner = null;  //所有者(必须是一个UI组件)
		this._req = null;
	};
	this.create2 = function(conf, parent, app, params, owner){
		this.setConf(conf);
		this.setParent2(parent);
		this.setApp(app);
		this.setParams(params);
		this.setOwner(owner);
	};
	this.create = function(parent, app, owner, params, tpl){
		this.setParent2(parent);
		this.setApp(app);
		this.setOwner(owner);
		this.setParams(params);
		var el = this.createTplElement(parent, tpl);
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		/*
		this._self.onmousedown = function(ev){
			ev = ev || this._ptr._win.event;
			ev.cancelBubble = true;
			return false;
		};
		*/
	};
	this.reset = function(params){
		this._params = params;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._req = null;
		this._owner = null;
		this._params = null;
		this._app = null;
		//this._self.onmousedown = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setConf = function(v){
		this._conf = v;
	};
	this.setApp = function(v){
		this._app = v;
	};
	this.getOwner = function(){
		return this._owner;
	};
	this.setOwner = function(v){
		this._owner = v;
	};
	this.setParams = function(v){
		this._params = v;
	};
	this.setReq = function(v){
		this._req = v;
	};
	this.setVisible = function(v){
		_super.setVisible.apply(this, arguments);
		//this._regOnFrame(window.top, "mousedown", !v);  //[TODO]对跨域iframe的处理还不到位
	};
	this._isOutterElement = function(el){
		var doc = el.ownerDocument;
		var win = doc.parentWindow || doc.defaultView;
		return !(win == this._win && runtime.dom.contains(this._self, el));
	};
	this._onDocumentClick = function(ev){
		var target = ev.target || ev.srcElement;
		if(this._isOutterElement(target)){
			runtime.addThread(0, this, runtime.closure(this, "setVisible", false));
		}
	};
	/**
	 * 在指定窗体和所有子窗体中注册/销毁事件侦听器
	 * [TODO]存在跨域问题
	 */
	this._regOnFrame = function(frame, type, isRemove){
		try{
			runtime.dom[(isRemove ? "remove" : "add") + "EventListener"](frame.document, type, this._onDocumentClick, this);
			//RQFM-5643 当邮件正在打开过程中，点击"更多功能"，弹出JS错误
			var frames = frame.frames;
			for(var i = 0, len = frames.length; i < len; i++){
				this._regOnFrame(frames[i], type, isRemove);
			}
		}catch(ex){
		}
	};
	/**
	 * @method getPosition
	 * @return {Object}
	 * @desc   获得事件的全局坐标位置
	 */
	this.getPosition = function(sender){
		var pos = {"x": 0, "y": 0};
		var refElement = runtime._workspace._self;
		var el = sender;
		while(el && el != refElement){
			pos.x += el.offsetLeft;
			pos.y += el.offsetTop;
			el = el.offsetParent;
		}
		return pos;
	};
	this.getPos = function(el, refObj){
		var pos = {"x": 0, "y": 0};
		var dom = runtime.dom;
		for(var o = el; o && o != refObj; o = o.offsetParent){
			var bl, bt, x, y;
			if(o != el){
				bl = dom.getStyleProperty(o, "borderLeftWidth");
				bt = dom.getStyleProperty(o, "borderTopWidth");
				x = isNaN(bl) ? 0 : bl;
				y = isNaN(bt) ? 0 : bt;
				bl = dom.getStyleProperty(o, "paddingLeftWidth");
				bt = dom.getStyleProperty(o, "paddingTopWidth");
				x += isNaN(bl) ? 0 : bl;
				y += isNaN(bt) ? 0 : bt;
			}
			pos.x += o.offsetLeft + (o != el ? x : 0);
			pos.y += o.offsetTop + (o != el ? y : 0);
		}
		return pos;
	};
	this.show = function(){
		runtime._workspace.setActivePopup(this);
		var pos = this.getPos(this._owner);
		this.moveTo(pos.x, pos.y + this._owner.offsetHeight);
	};
	this.hide = function(){
		runtime._workspace.setActivePopup(null);
	};
	this.callback = function(){
		var args = [this];  //回调函数的第一个参数一定是对话框组件本身
		for(var i = 0, len = arguments.length; i < len; i++){
			args.push(arguments[i]);
		}
		if(this._req){
			this._req.func.apply(this._req.agent, args);
			this._req = null;  //只允许被调用一次
		}
	};
	this.doAction = function(act, sender){
		this.hide();
		this.callback(act, sender);
		return false;
	};
});
/*</file>*/
/*<file name="alz/mui/Menu.js">*/
_package("alz.mui");

_import("alz.mui.Popup");

/**
 * 菜单组件
 */
_class("Menu", Popup, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/mui/PopupMenu.js">*/
_package("alz.mui");

_import("alz.mui.Popup");

/**
 * 弹出式菜单
 */
_class("PopupMenu", Popup, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this.setVisible(false);
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/mui/TableView.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 表视图组件
 */
_class("TableView", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.create = function(parent){
		var sb = [];
		sb.push('<table class="ui-table" border="1" bordercolor="gray" cellspacing="0" cellpadding="1">');
		sb.push('<thead>');
		sb.push('<tr><th>id</th><th>name</th><th>value</th><th>col3</th><th>col4</th><th>col5</th><th>col6</th><th>col7</th><th>col8</th><th>col9</th><th>col10</th></tr>');
		sb.push('</thead>');
		sb.push('<tbody>');
		for(var i = 0, len = 100; i < len; i++){
			sb.push('<tr><td>' + i + '</td><td>name' + i + '</td><td>value' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td></tr>');
		}
		sb.push('</tbody>');
		sb.push('</table>');
		var tpl = sb.join("");
		var el = runtime.dom.createDomElement(tpl, parent._self);
		//parent.appendChild(el);
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/util/FileType.js">*/
_package("alz.util");

/**
 * 文件类型
 */
_class("FileType", "", function(_super, _event){
	var _mapIcon = {
		"jsc"      :{index: 0,isDir:1},
		"js"       :{index: 1,isDir:1},
		"json"     :{index: 2,isDir:1},
		"htm"      :{index: 3,isDir:1}, "html":{index: 3,isDir:1},
		"tpl"      :{index: 4,isDir:1},
		"tmpl"     :{index: 5,isDir:1}, "xml":{index: 5,isDir:1},
		"jpg"      :{index: 6,isDir:1},
		"gif"      :{index: 7,isDir:1},
		"jpg1"     :{index: 8,isDir:1},
		"gif1"     :{index: 9,isDir:1},
		"css"      :{index:10,isDir:1}, "ini":{index:10,isDir:1},
		"close"    :{index:11,isDir:1},
		"open"     :{index:12,isDir:1},
		"event"    :{index:13,isDir:0},
		"enum"     :{index:14,isDir:1},
		"const"    :{index:15,isDir:1},
		"class"    :{index:16,isDir:0},
		"property" :{index:17,isDir:0},
		"package"  :{index:18,isDir:1},
		"module"   :{index:19,isDir:1},
		"interface":{index:20,isDir:1},
		"function" :{index:21,isDir:0},
		"txt"      :{index:22,isDir:0},
		"reg"      :{index:23,isDir:0},
		"hta"      :{index:24,isDir:0}, "exe":{index:24,isDir:0},
		"unknown"  :{index:25,isDir:0},
		"asp"      :{index:26,isDir:0},
		"jar"      :{index:27,isDir:0},
		"bat"      :{index:28,isDir:0},
		"swf"      :{index:29,isDir:0},
		"zip"      :{index:30,isDir:0},"tar":{index:30,isDir:0},"gz":{index:30,isDir:0},"xpi":{index:30,isDir:0},"gz":{index:30,isDir:0},"gadget":{index:30,isDir:0},
		"php"      :{index:31,isDir:0},
		"url"      :{index:32,isDir:0},
		"site"     :{index:33,isDir:0}
	};
	FileType.getIconIndex = function(type){
		return type in _mapIcon ? _mapIcon[type].index : 25;  //18,16
	};
	this._init = function(){
	};
});
/*</file>*/
/*<file name="alz/mui/Label.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * TreeView中使用的标签组件
 */
_class("Label", Component, function(_super, _event){
	var _css = {
		"normal"  : {"color":"#000000","border":"1px solid #EEEEEE" ,"background-color":""       ,"text-decoration":"none"     },
		"over"    : {"color":"#0000FF","border":"1px solid #EEEEEE" ,"background-color":"#FFF5CC","text-decoration":"underline"},
		"dragover": {"color":"#FFFFFF","border":"1px solid #0A246A" ,"background-color":"#0A246A","text-decoration":"none"     },
		"active"  : {"color":"#FFFFFF","border":"1px dotted #F5DB95","background-color":"#0A246A","text-decoration":"none"     }
	};
	this._init = function(){
		_super._init.call(this);
		this._text = "";
	};
	this.create = function(parent, text){
		this.setParent2(parent);
		this._text = text;
		var el = this._createElement("label");
		//var el = this._createElement("a");
		//el.href = "#";
		el.appendChild(this._createTextNode(text));
		this._parent._self.appendChild(el);
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		var _this = this;
		//this._self.ondragstart = function(){return false;};
		this._self.onselectstart = function(){return false;};
		this._self.onmouseover = function(){
			var node = _this._parent;
			if(node._tree.getActiveNode() == node) return;
			if(node._tree._draging && node._data.isDir && node._tree.getActiveNode().getParentNode() != node){
				node._tree._dragOverNode = node;
				this._ptr.applyCssStyle(this, _css, "dragover");
			}else{
				this._ptr.applyCssStyle(this, _css, "over");
			}
		};
		this._self.onmouseout = function(){
			if(_this._parent._tree.getActiveNode() == _this._parent) return;
			this._ptr.applyCssStyle(this, _css, "normal");
		};
		this.setState("normal");
	};
	this.dispose = function(){
		this._self.onmouseout = null;
		this._self.onmouseover = null;
		//this._self.onclick = null;
		//this._self.onmousedown = null;
		//this._self.onmouseup = null;
		this._self.onselectstart = null;
		//this._self.ondragstart = null;
	};
	this.getText = function(){
		return this._text;
	};
	this.setText = function(v){
		this._text = v;
		this._self.innerHTML = v;
	};
	this.setState = function(v){
		this.applyCssStyle(this._self, _css, v);
	};
	this.handleEvent = function(ev, target){
		var ret = false;
		var tree = this._parent._tree;
		switch(ev.type){
		case "mousemove":
			this.applyCssStyle(this._self, _css, "normal");
			if(!tree.getReadonly()){
				//tree.startDraging(this._parent);
				tree.startDrag(ev, target, this._parent);
			}
			break;
		case "mousedown":
			tree._self.onmousemove = function(ev){  //准备响应拖拽动作
				return this._ptr.eventHandle(ev || window.event);
			};
			if(!tree.getReadonly() && tree.getActiveNode() == this._parent){
				this._prepareEdit = true;  //准备进入编辑状态
			}else{
				tree.setActiveNode(this._parent);
			}
			break;
		case "mouseup":
			tree._self.onmousemove = null;
			if(tree._draging){
				this.applyCssStyle(this._self, _css, "active");
				if(tree._dragOverNode){
					this.applyCssStyle(tree._dragOverNode._label.getElement(), _css, "over");
				}
				tree.stopDrag();
			}else{
				if(this._prepareEdit && tree.getActiveNode() == this._parent){
					this._prepareEdit = false;
					if(target == tree.getActiveNode()._label.getElement()){
						this._parent.rename();
					}else{
						//runtime.error("[TODO]move node");
					}
				}
			}
			break;
		case "click":
			if(target == this._self && !tree._draging){
				ret = this._parent.openNode();
			}
			break;
		}
		ev.cancelBubble = true;
		return ret;
	};
});
/*</file>*/
/*<file name="alz/mui/TreeNode.js">*/
_package("alz.mui");

_import("alz.util.FileType");
_import("alz.mui.Component");
_import("alz.mui.Label");
_import("alz.mui.TreeView");
_import("alz.core.Ajax");

/**
 * TreeNode 类
 */
_class("TreeNode", Component, function(_super, _event){
	TreeNode.iconCache = {};  //树节点图标缓存
	this._init = function(){
		_super._init.call(this);
		//this._parent = null;   //TreeView组件(父DOM元素)
		this._parentNode = null;  //父TreeNode组件
		this._tree = null;     //所属的 treeView 组件
		this._leaf = false;    //是否叶结点
		this._preIndex = 0;    //
		this._preIcon = null;  //状态图标
		this._icon = null;     //结点图标
		this._label = null;    //文字标签
		this._subTree = null;  //子树
		this._bFirst = true;   //是否第一个结点？
		this._bLast = false;   //是否同级同分之下的兄弟结点中的最后一个结点？
		this._modify = false;  //是否处于编辑状态
	};
	this.create = function(parent, data, bFirst, bLast){
		this.setParent2(parent);
		if(!("isDir" in data)){
			if("nodes" in data && data.nodes.length > 0){
				data["isDir"] = true;
			}
		}
		data.type = data.type || data.name.split(".").pop();
		this._data = data;
		this._leaf = !data.isDir;
		this._bFirst = bFirst;
		this._bLast = bLast;
		var el = this._createElement("li");
		if(parent){
			this._parentNode = parent._parent;
			this._parent._self.appendChild(el);
		}
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		var _this = this;
		if(!("preIcon" in TreeNode.iconCache)){
			TreeNode.useImg = true;
			var obj;
			if(TreeNode.useImg){
				obj = this._createElement("img");
				//obj.src = this._tree._pathSkin + "win2k_tree_add.gif";
				obj.src = this._tree._pathSkin + "win2k_tree_blank.gif";
			}else{
				obj = this._createElement2(null, "span", "icon16"/*, {
					"styleFloat"   : "left",
					"display"      : "block",
					"width"        : "16px",
					"height"       : "16px",
					"verticalAlign": runtime.moz ? "bottom !important" : "middle"
				}*/);
			}
			obj.style.display = "none";
			obj.style.backgroundImage = "url(" + this._tree._pathSkin + "imagelist_treeview.gif)";
			TreeNode.iconCache["preIcon"] = document.body.appendChild(obj);
			if(TreeNode.useImg){
				obj = this._createElement("img");
				obj.src = this._tree._pathSkin + "win2k_tree_blank.gif";  //this._tree._pathSkin + "win2k_" + type + ".gif"
			}else{
				obj = this._createElement2(null, "span", "icon16"/*, {
					"styleFloat"   : "left",
					"display"      : "block",
					"width"        : "16px",
					"height"       : "16px",
					"verticalAlign": runtime.moz ? "bottom !important" : "middle"
				}*/);
			}
			obj.style.marginRight = "3px";
			obj.style.display = "none";
			obj.style.backgroundImage = "url(" + this._tree._pathSkin + "imagelist_build.gif)";
			TreeNode.iconCache["icon"] = document.body.appendChild(obj);
		}

		this._preIcon = TreeNode.iconCache["preIcon"].cloneNode(true);
		this._self.appendChild(this._preIcon);
		this._preIcon.style.display = "";
		var index;
		if(this._bFirst && this._bLast && parent == this._tree){
			index = 2;
		}else if(this._bFirst && parent == this._tree){
			index = 4;
		}else if(this._bLast){
			index = 6;
		}else{
			index = 5;
		}
		this._preIndex = index + (this._leaf ? 9 : 0);
		this._preIcon.style.backgroundPosition = "-" + (this._preIndex * 16) + "px 0px";
		var _this = this;
		this._preIcon.ondragstart = function(){return false;};

		this._icon = TreeNode.iconCache["icon"].cloneNode(true);
		this._self.appendChild(this._icon);
		this._icon.style.display = "";
		this._icon.style.backgroundPosition = "-" + (FileType.getIconIndex(this._data.type) * 16) + "px 0px";
		this._icon.ondragstart = function(){return false;};

		var text = this._data.type == "class" ? this._data.name.replace(/\.js$/, "") : this._data.name;
		this._label = new Label();
		this._label.create(this, text);
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._subTree){
			this._subTree.dispose();
			this._subTree = null;
		}
		this._label.dispose();
		this._label = null;
		this._icon.style.backgroundImage = "none";
		this._icon.onmousedown = null;
		this._icon.ondragstart = null;
		this._icon = null;
		this._preIcon.style.backgroundImage = "none";
		this._preIcon.onclick = null;
		this._preIcon.ondragstart = null;
		this._preIcon = null;
		_super.dispose.apply(this);
	};
	this.setTree = function(v){
		this._tree = v;
	};
	this.createSubTree = function(){
		var subTree = new TreeView();
		subTree.setTree(this._tree);
		subTree.create(this, this._data.nodes);
		if(this._bLast){
			subTree._self.style.backgroundImage = "none";
		}
		return subTree;
	};
	//this.isLeaf = function(){
	//	return this._data.type in _mapIcon ? _mapIcon[this._data.type].isDir == 0 : false;
	//};
	//this.getIconIndex = function(){
	//	return this._tree.getIconIndex(this._data.type);
	//};
	this.handleEvent = function(ev, target){
		switch(ev.type){
		case "mousedown":
			if(target == this._icon){
				this._tree.setActiveNode(this);
				ev.cancelBubble = true;
				//this._tree.startDraging(this);
			}
			break;
		case "mouseup":
			break;
		case "click":
			if(!this._leaf){
				if(target == this._preIcon){
					this.onIconClick();
				}else if(target == this._icon){
					this.openNode();
				}
			}
			break;
		case "dblclick":
			if(target == this._icon){
				this.openNode();
			}
			break;
		}
	};
	this.onIconClick = function(){
		if(!this._leaf){
			if(!this._data.nodes || this._data.nodes.length == 0){
				//this._data.nodes = path2json(this._path, this._data.type);
				//this.onIconClick();
				this._tree.loadData(this, function(json){
					this._data.nodes = json;
					this.onIconClick();
				});
				return;
			}
			if(!this._subTree){
				this._subTree = this.createSubTree();
				this._subTree.setVisible(false);
			}
			this._subTree.setVisible(!this._subTree.getVisible());  //&& this._subTree.childNodes.length > 0
			this._preIndex += this._subTree.getVisible() ? 6 : -6;
			this._preIcon.style.backgroundPosition = "-" + (this._preIndex * 16) + "px 0px";
		}
		return false;
	};
	this.onLabelClick = function(){
		if(this._data._node){
			if(this._tree._activeElement){
				this._tree._activeElement.style.backgroundColor = this._tree.oldBgColor;
			}
			this._tree.oldBgColor = this._data._node.style.backgroundColor;
			this._data._node.style.backgroundColor = "gray";
			this._tree._activeElement = this._data._node;
		}
		return false;
	};
	this.activate = function(){
		this._label.setState("active");
	};
	this.deactivate = function(){
		this._label.setState("normal");
	};
	this.getParentNode = function(){
		//return this._parent._self.parentNode._ptr;
		//return this._parent._parent;
		return this._parentNode;
	};
	this.getText = function(){
		return this._label.getText();
	};
	this.getPath = function(){
		var sb = [];
		for(var node = this; node && node._data; node = node.getParentNode()){  //node._parent._parent
			sb.unshift(node._data.name);
		}
		return "/" + sb.join("/");
	};
	this.rename = function(){
		this._modify = true;
		var input = this._tree.getInput(this._label.getText());
		if(this._label.getElement().nextSibling){
			this._self.insertBefore(input, this._label.getElement().nextSibling);
		}else{
			this._self.appendChild(input);
		}
		runtime.addThread(0, this, function(){
			input.select();
		});
		this._label.setVisible(false);
	};
	this.cancelRename = function(){
		this._label.setVisible(true);
		if(this._tree._input.parentNode != this._self){
			runtime.error(this._tree._input.parentNode.outerHTML);
		}
		this._self.removeChild(this._tree._input);
		this._tree._input.style.display = "none";
		this._modify = false;
	};
	this.doRename = function(name){
		//assert(this._tree._input.value == name);
		if(this.getText() == name){  //如果值发生改变
			this.cancelRename();
		}else{
			//[TODO]需要检查是否和其他文件重名
			//if(this._tree._input && this._tree._input.style.display == "")
			var path = this.getPath();
			//assert(path == this._data.url);
			var params = {
				"act" : "mod",
				"path": path,
				"name": name
			};
			new Ajax().netInvoke("POST", "../data/file.php", params, "json", this, function(json){
				if(json == true){
					this._data.name = name;
					//if(this._data.isDir){
					//	this._data.url = this._data.url.replace(/\/[^\/]+\/?$/, "/" + name + "/");
					//}
					this._label.setText(name);
				}else{
					runtime.error("[ERROR]改名失败");
				}
				this.cancelRename();
			});
		}
	};
	this.openNode = function(){
		if(this._tree._activeNode1 && this._tree._activeNode1._data.isDir){
			this._tree._activeNode1._icon.style.backgroundPosition = "-" + (FileType.getIconIndex("close") * 16) + "px 0px";
		}
		if(this._data.isDir){
			this._icon.style.backgroundPosition = "-" + (FileType.getIconIndex("open") * 16) + "px 0px";
		}
		if(this._tree.onLabelClick){
			return this._tree.onLabelClick(this);
		}
		return this.onLabelClick();
	};
});
/*</file>*/
/*<file name="alz/mui/TreeView.js">*/
_package("alz.mui");

_import("alz.util.FileType");
_import("alz.mui.Component");
_import("alz.mui.TreeNode");

/**
 * TreeView 类
 */
_class("TreeView", Component, function(_super, _event){
	var KEY_TAB       = 9;   //'\t'
	var KEY_ENTER     = 13;  //'\n'
	var KEY_ESC       = 27;
	this._init = function(){
		_super._init.call(this);
		this._pathSkin = "images/";
		this._tree = null;
		this._nodes = [];
		this._activeNode = null;
		this._activeDragNode = null;
		this._input = null;
		this._draging = false;
		this._dragOverNode = null;
		this._captureComponent = null;
		this._activePopup = null;
		this._readonly = true;
	};
	this.create = function(parent, data, w, h){
		this.setParent2(parent);
		if(data) this._data = data;
		var el = this._createElement2(null, "ul", !this._tree ? "ui-treeview" : "", {  //只有最外层的 TreeView 才有该样式
			"display": "none"
		});
		if(w) el.style.width = typeof w == "string" ? w : w + "px";
		if(h) el.style.height = typeof h == "string" ? h : h + "px";
		if(parent){
			if(this._parent._self){
				this._parent._self.appendChild(el);
			}else{
				this._parent.appendChild(el);
			}
		}
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		if(!this._tree){
			this._self.onselectstart = function(){return false;};
			this._self.onmousedown =
			this._self.onmouseup =
			this._self.onclick =
			this._self.ondblclick = function(ev){
				return this._ptr.eventHandle(ev || window.event);
			};
		}
		var nodes = this._data;
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = new TreeNode();
			node.setTree(this._tree || this);
			node.create(this, nodes[i], i == 0, i == len - 1);
			this._nodes.push(node);
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activePopup = null;
		this._captureComponent = null;
		this._dragOverNode = null;
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i].dispose();
			this._nodes[i] = null;
		}
		this._nodes.length = 0;
		if(!this._tree){
			this._self.ondblclick = null;
			this._self.onclick = null;
			this._self.onmouseup = null;
			this._self.onmousedown = null;
			this._self.onselectstart = null;
			this._tree = null;
		}
		_super.dispose.apply(this);
	};
	this.getReadonly = function(){
		return this._readonly;
	};
	this.setTree = function(v){
		this._tree = v;
	};
	this.loadData = function(){
		runtime.error("[TreeView::loadData]当前方法必须被使用者重载，以实现特定的数据加载方式");
	};
	this.getActiveNode = function(){
		return this._activeNode;
	};
	this.setActiveNode = function(node){
		if(this._activeNode == node) return;
		if(this._activeNode){
			this._activeNode.deactivate();
		}
		if(node){
			node.activate();
		}
		this._activeNode1 = this._activeNode;
		this._activeNode = node;
	};
	this.getInput = function(value){
		if(!this._input){
			this._input = this._createElement("input");
			this._input.type = "text";
			this.addListener(this._input, "keydown", this, "onKeyDown");
			var _this = this;
			this._input.handleEvent = function(ev, target){
				switch(ev.type){
				case "mousedown":
					if(!_this._readonly){
						if(target != this){  //&& _this._activeNode && _this._activeNode._modify
							_this._activeNode.doRename(this.value);
						}
					}
					break;
				case "mouseup":
					//ev.cancelBubble = true;
					break;
				case "click":
					//!!!也不能是LI，因为mousedown不来源自input
					if(!_this._activeNode) runtime.error("error");
					if(target == this.parentNode) runtime.error("[input]target == this.parentNode");
					if(target != this && target != this.parentNode && target != _this._activeNode._label.getElement()){
						_this._activePopup = null;
					}
					ev.cancelBubble = true;
					return false;
				}
			};
			this._input.onkeypress = function(ev){
				runtime.addThread(0, _this, "autoSizeInput");
			};
		}
		this._input.value = value;
		this._input.style.display = "";
		this._activePopup = this._input;
		this._captureComponent = null;  //只要有this._activePopup, _captureComponent便失效
		this.autoSizeInput();
		return this._input;
	};
	this.onKeyDown = function(ev){
		runtime.addThread(0, this, "autoSizeInput");
		switch(ev.keyCode){
		case KEY_ESC:
			if(this._activeNode){
				this._activeNode.cancelRename();
				this._activePopup = null;
			}
			ev.cancelBubble = true;
			return false;
		case KEY_TAB:
		case KEY_ENTER:
			if(!this._readonly){
				if(this._activeNode){
					this._activeNode.doRename(this.value);
					this._activePopup = null;
				}
			}
			break;
		}
		return true;
	};
	this.autoSizeInput = function(){
		var size = runtime.getTextSize(this._input.value, "12px 宋体");
		this._input.style.width = Math.max(28/*32*/, Math.min(90, size.w + 11)) + "px";  //max-width: this._self.offsetWidth - 14
		//this._input.style.backgroundColor = "#EEEEEE";
	};
	this.eventHandle = function(ev){
		var target = ev.target || ev.srcElement;
		runtime.log(target.tagName + "." + ev.type);
		var ret;
		var control = this.getControl(target) || this;
		if(/*ev.type == "mousedown" && */this._activePopup){
			ret = this._activePopup.handleEvent(ev, target);
		}else{
			if(ev.type == "mousedown" && control && !this._captureComponent){
				this._captureComponent = control;
			}
			if(this._captureComponent){
				control = this._captureComponent;
			}
			if(control && control.handleEvent){
				ret = control.handleEvent(ev, target);
			}
			if(ev.type == "click"){
				this._captureComponent = null;
			}
		}
		/*else{
			switch(ev.type){
			case "mousedown":
			case "mouseup":
			case "click":
				if(typeof control["on" + ev.type] == "function"){
					ret = control["on" + ev.type](ev, target);
				}
				break;
			}
		}*/
		return ret;
	};
	this.handleEvent = function(ev, target){
		switch(ev.type){
		case "mousedown":
			break;
		case "click":
			break;
		}
	};
	this.startDraging = function(treeNode){
		runtime.log("start drag");
		this._draging = true;
		this._activeDragNode = treeNode;
		var _this = this;
		document.onmousemove = function(ev){
			if(_this._draging){
			}
		};
		document.onmouseup = function(ev){
			ev = ev || window.event;
			var target = ev.target || ev.srcElement;
			if(target.tagName != "LI") target = target.parentNode;
			if(target != _this._activeDragNode._self){
				target.parentNode.insertBefore(_this._activeDragNode._self, target);
			}
			runtime.log("end drag");
			_this._draging = false;
			document.onmousemove = null;
			document.onmouseup = null;
		};
	};
	this.startDrag = function(ev, target, node){
		this._draging = true;
		var rect = this.getDragRect();
		rect.style.display = "";
		rect.style.font = "12px 宋体";
		var text = runtime.encodeHTML(node.getText());
		var size = runtime.getTextSize(text, "12px 宋体");
		rect.style.width = size.w + "px";
		rect.style.height = size.h + "px";
		rect.innerHTML = text;
		var pos = this.getPos(target, this._self);
		rect.style.left = (pos.x + ev.offsetX + (target.tagName == "LABEL" ? -33 : 0) + 1) + "px";
		rect.style.top  = (pos.y + ev.offsetY + (target.tagName == "LABEL" ? 1 : 0) + 1) + "px";
	};
	this.stopDrag = function(){
		this.getDragRect().style.display = "none";
		this._dragOverNode = null;
		this._draging = false;
	};
	this.getDragRect = function(){
		var rect;
		if(!this._dragRect){
			this._dragRect =
			rect = this._createElement2(this._self, "div", "DragRect");
		}else{
			rect = this._dragRect;
		}
		return rect;
	};
	this.getPos = function(el, refObj){
		var pos = {"x": 0, "y": 0};
		var dom = runtime.dom;
		for(var o = el; o && o != refObj; o = o.offsetParent){
			var bl, bt, x, y;
			if(o != el){
				bl = dom.getStyleProperty(o, "borderLeftWidth");
				bt = dom.getStyleProperty(o, "borderTopWidth");
				x = isNaN(bl) ? 0 : bl;
				y = isNaN(bt) ? 0 : bt;
				bl = dom.getStyleProperty(o, "paddingLeftWidth");
				bt = dom.getStyleProperty(o, "paddingTopWidth");
				x += isNaN(bl) ? 0 : bl;
				y += isNaN(bt) ? 0 : bt;
			}
			pos.x += o.offsetLeft + (o != el ? x : 0);
			pos.y += o.offsetTop + (o != el ? y : 0);
		}
		return pos;
	};
});
/*</file>*/
/*<file name="alz/mui/BaseWindow.js">*/
_package("alz.mui");

_import("alz.mui.Pane");
_import("alz.mui.SysBtn");

/**
 * 窗体基类
 */
_class("BaseWindow", Pane, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._conf = null;
		this._app = null;
		this._params = null;
		this._req = null;
		this._head = null;
		this._title = null;
		this._closebtn = null;
		this._body = null;
		this._borders = null;   //{Array}
		this._state = "normal";  //normal|max|min
	};
	this.create2 = function(conf, parent, app, params){
		this.setConf(conf);
		this.setParent2(parent);
		this.setApp(app);
		this.setParams(params);
	};
	this.rendered = function(){
		_super.rendered.apply(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var data = {
			"caption": this._params.caption
				|| (this._tplel ? this._tplel._attributes.caption : "")
				|| obj.getAttribute("_caption")
				|| "标题栏"
		};
		this._body = this.find(".win-body");
		this._head = this.find(".win-head");
		var _this = this;
		var falseFunc = function(){return false;};
		this._head.ondragstart = falseFunc;
		this._head.onselectstart = falseFunc;
		this.addListener(this._head, "mousedown", this, "onMouseDown");
		this._title = this.find(".win-head label");
		this._title.ondragstart = falseFunc;
		this._title.onselectstart = falseFunc;
		this._title.innerHTML = data.caption;
		this._closebtn = new SysBtn();
		this._closebtn.init(this.find(".icon-close"), this);
	};
	this.reset = function(params){
		this.setParams(params);
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._borders){
			for(var i = 0, len = this._borders.length; i < len; i++){
				this._borders[i] = null;
			}
			this._borders = null;
		}
		this._closebtn.dispose();
		this._closebtn = null;
		this._title.onselectstart = null;
		this._title.ondragstart = null;
		this.removeListener(this._head, "mousedown");
		this._head.onselectstart = null;
		this._head.ondragstart = null;
		this._head = null;
		this._req = null;
		this._params = null;
		this._app = null;
		this._conf = null;
		_super.dispose.apply(this);
	};
	this.setConf = function(v){
		this._conf = v;
	};
	this.setApp = function(v){
		this._app = v;
	};
	this.setParams = function(v){
		this._params = v;
	};
	this.setReq = function(v){
		this._req = v;
	};
	this.onMouseDown = function(ev){
		if(this._state != "normal") return;
		this._self.style.zIndex = runtime.getNextZIndex();
		//this._head.setCapture(true);
		var pos = runtime.dom.getPos1(ev, 1, this._self);
		this._offsetX = pos.x;  //ev.offsetX;  //ns 浏览器的问题
		this._offsetY = pos.y;  //ev.offsetY;
		this.setCapture(true);
		/*
		var _this = this;
		var body = document.body;
		if(runtime._host.env == "ie"){
			body.setCapture();
		}
		this.addListener(body, "mousemove", this, "onMouseMove");
		this.addListener(body, "mouseup", this, "onMouseUp");
		*/
	};
	this.onMouseMove = function(ev){
		var rect = runtime.dom.getViewPort(document.body);
		//[TODO]是否需要考虑BODY元素的边框宽度？
		var x = rect.x + Math.min(rect.w - 10, Math.max(10, ev.clientX)) - this._offsetX/* - 2*/;
		var y = rect.y + Math.min(rect.h - 10, Math.max(10, ev.clientY)) - this._offsetY/* - 2*/;
		this.moveTo(x, y);
	};
	this.onMouseUp = function(ev){
		this.setCapture(false);
		/*
		var body = document.body;
		this.removeListener(body, "mousemove");
		this.removeListener(body, "mouseup");
		if(runtime._host.env == "ie"){
			body.releaseCapture();
		}
		*/
		//if(runtime.ie) this._head.releaseCapture();
		//this.setCapture(false);
	};
	this.close = function(){
		this.setVisible(false);
	};
	this.callback = function(){
		var args = [this];  //回调函数的第一个参数一定是对话框组件本身
		for(var i = 0, len = arguments.length; i < len; i++){
			args.push(arguments[i]);
		}
		if(this._req){
			this._req.func.apply(this._req.agent, args);
			this._req = null;  //只允许被调用一次
		}
	};
	this.do_win_close = function(act, sender){
		this.setVisible(false);
		this.callback(act, sender);
	};
	this.createBorders = function(){
		this._borders = [];
		for(var i = 0, len = this._cursors.length; i < len; i++){
			var o = this._createElement2(this._self, "div", "border", {
				"cursor": this._cursors[i] + "-resize"
			});
			//if(i % 2 == 0) o.style.backgroundColor = "red";
			if(runtime._debug && !(runtime._host.env == "opera" && runtime._host.ver == "8.00")){
				o.style.backgroundColor = "#000000";
				//o.style.filter = "Alpha(Opacity=30)";
				runtime.dom.setOpacity(o, 0.3);
			}else{
				if(i == 1 && this._skin._model["top_use_opacity"] && !(runtime._host.env == "opera" && runtime._host.ver == "8.00")){
					o.style.backgroundColor = "#000000";
					runtime.dom.setOpacity(o, 0.01);
				}
			}
			this._borders.push(o);
		}
	};
	this.showBorder = function(){
		for(var i = 0, len = this._borders.length; i < len; i++){
			this._borders[i].style.display = "";
		}
	};
	this.hideBorder = function(){
		for(var i = 0, len = this._borders.length; i < len; i++){
			this._borders[i].style.display = "none";
		}
	};
	this.resizeBorder = function(w, h){
		var bw4 = 4, bw8 = 8;
		this.setElementRect(this._borders[0], 0    , 0    , bw8    , bw8);
		this.setElementRect(this._borders[1], bw8  , 0    , w-2*bw8, bw4);
		this.setElementRect(this._borders[2], w-bw8, 0    , bw8    , bw8);

		this.setElementRect(this._borders[3], 0    , bw8  , bw4    , h-2*bw8);
		this.setElementRect(this._borders[4], w-bw4, bw8  , bw4    , h-2*bw8);

		this.setElementRect(this._borders[5], 0    , h-bw8, bw8    , bw8);
		this.setElementRect(this._borders[6], bw8  , h-bw4, w-2*bw8, bw4);
		this.setElementRect(this._borders[7], w-bw8, h-bw8, bw8    , bw8);
	};
});
/*</file>*/
/*<file name="alz/mui/Dialog.js">*/
_package("alz.mui");

_import("alz.mui.BaseWindow");

/**
 * 对话框组件
 */
_class("Dialog", BaseWindow, function(_super, _event){
	var KEY_ESC = 27;
	this._init = function(){
		_super._init.call(this);
		//对话框的双态特性，和PaneAppContent相似，主要用来屏蔽环境差异
		this._ownerApp = null;  //身在曹营
		//this._app = null;     //心在汉
		this._skin = null;
		this._caption = "对话框标题";
	};
	this.create2 = function(conf, parent, app, params, ownerApp){
		_super.create2.apply(this, arguments);
		this.setOwnerApp(ownerApp);
	};
	this.create = function(parent, app, params, tpl){
		this.setParent2(parent);
		//this.setOwnerApp(ownerApp);
		this.setApp(app);
		var el = this.createTplElement(parent, tpl);  //"dialog2.xml"
		/*
		tpl = runtime.formatTpl(tpl, {
			"caption": params.caption,
			"pathAui": runtime._pathAui
		});
		*/
		if(this._conf.bg){
			el.style.backgroundImage = "url(res/images/dlg/" + this._conf.bg + ")";
		}
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		//this._skin = this._createElement("div");
		//this._self.appendChild(this._skin);
		//this.fixedOffset();  //计算坐标修正的偏移量
		this.initActionElements();
		//this._skin = this._self.childNodes[0];
		if(this._btnClose){
			var _this = this;
			this._btnClose.style.backgroundPosition = "-48px 0px";
			this._btnClose.onselectstart = function(ev){return false;};
			this._btnClose.ondragstart = function(ev){return false;};
			this._btnClose.onmousedown = function(ev){
				ev = ev || window.event;
				//this.src = runtime._pathAui + "lib/images/AWindow_closedown.gif";
				this.style.backgroundPosition = "-48px -14px";
				if(runtime.ie) this.setCapture();
				this.onMouseMove = function(ev){
					ev = ev || window.event;
					var target = ev.srcElement || ev.target;
					if(target == this){
						//this.src = runtime._pathAui + "lib/images/AWindow_closedown.gif";
						this.style.backgroundPosition = "-48px -14px";
					}else{
						//this.src = runtime._pathAui + "lib/images/AWindow_closeup.gif";
						this.style.backgroundPosition = "-48px 0px";
					}
				};
				this.onMouseUp = function(ev){
					ev = ev || window.event;
					var target = ev.srcElement || ev.target;
					//this.src = runtime._pathAui + "lib/images/AWindow_closeup.gif";
					this.style.backgroundPosition = "-48px 0px";
					this.onMouseMove = null;
					this.onMouseUp = null;
					if(runtime.ie){
						this.releaseCapture();
					}
					if(target == this){
						_this.close();  //关闭对话框
					}
				};
				ev.cancelBubble = true;
			};
		}
		//this.createBorders();
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._btnClose){
			this._btnClose.onmousedown = null;
			this._btnClose.ondragstart = null;
			this._btnClose.onselectstart = null;
			this._btnClose = null;
		}
		this._ownerApp = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setOwnerApp = function(v){
		this._ownerApp = v;
	};
	this.showModal = function(v){
		_super.showModal.apply(this, arguments);
		this.moveToCenter();
		runtime._workspace.setActiveDialog(v ? this : null);
	};
	this.show = function(){
		this.setVisible(true);
	};
	this.resize = function(w, h){
		//_super.resize.apply(this, arguments);
		this._dom.resizeElement(this._self, w, h);
		var ww = this.getInnerWidth();
		var hh = this.getInnerHeight();
		//this._dom.resize(this._self);
		this._dom.setWidth(this._head, w - 8);
		this._dom.setWidth(this._body, w - 8);
		this._dom.setHeight(this._body, hh - 4 - 19);
		this._dom.resizeElement(this._skin, w, h);
		if(/*this._resizable && */this._borders){
			this.resizeBorder(w, h);
		}
	};
	this.close = function(){
		if(this._modal){
			this.showModal(false);
		}else{
			this.setVisible(false);
		}
	};
	/*
	 * [TODO]TT差出来的这两像素可能是由于 BODY 的默认边框宽度计算不准确导致的
	 */
	/*
	this.fixedOffset = function(){
		//window.alert(runtime.getBoxModel() + "|" + runtime.ie + "|" + runtime.tt + "|" + this._borderLeftWidth);
		if(runtime.getBoxModel() == 0){
			if(runtime.ie){
				this._fixedX = this._borderLeftWidth - (runtime.tt ? 2 : 0);
				this._fixedY = this._borderTopWidth - (runtime.tt ? 2 : 0);
			}else if(runtime.moz){
				this._fixedX = -5;
				this._fixedY = -5;
			}else if(runtime.opera){
				this._fixedX = -5;
				this._fixedY = -5;
			}else{  //safari [TODO]
				this._fixedX = -5;
				this._fixedY = -5;
			}
		}else{
			if(runtime.ie){
				this._fixedX = this._borderLeftWidth - (runtime.tt ? 2 : 0);
				this._fixedY = this._borderTopWidth - (runtime.tt ? 2 : 0);
			}else if(runtime.moz){
				this._fixedX = this._paddingLeft - (runtime.ff ? 5 : 4);
				this._fixedY = this._paddingTop - (runtime.ff ? 5 : 4);
			}else if(runtime.opera){
				this._fixedX = this._paddingLeft + 2;
				this._fixedY = this._paddingTop + 2;
			}else{  //safari
				this._fixedX = this._paddingLeft;
				this._fixedY = this._paddingTop;
			}
		}
	};
	*/
	this.onMouseDown = function(ev){
		//if(runtime.ie) this._head.setCapture();
		//var _this = this;
		//this.addListener(this._head, "mousemove", this, "onMouseMove");
		//this.addListener(this._head, "mouseup", this, "onMouseUp");
		this.setCapture(true);
		//var pos = this._dom.getPos(ev.srcElement, this._self);
		//document.title = pos.x + "+" + ev.offsetX + "=" + (pos.x + ev.offsetX) + "#" + ev.clientX
		//								+ "|" + pos.y + "+" + ev.offsetY + "=" + (pos.y + ev.offsetY) + "#" + ev.clientY;
		this._offsetX = ev.offsetX;  //ns 浏览器的问题
		this._offsetY = ev.offsetY;
		var workspace = runtime._workspace;
		if(workspace._fixed != "fixed"){
			if(workspace._mousemoveForFixed){
				workspace._mousemoveForFixed(this, ev);
			}
			/* 直接使用默认值，可以省去自动修正过程，但是不能保证一定是通用的
			if(runtime.ie || runtime.safari){
				workspace._fixedX = 0;
				workspace._fixedY = 0;
				workspace._fixed = "fixed";
			}else if(runtime.opera){
				workspace._fixedX = 2;
				workspace._fixedY = 2;
				workspace._fixed = "fixed";
			}else{  //runtime.moz
				if(this._mousemoveForFixed) this._mousemoveForFixed(ev);
			}
			*/
		}
	};
	this.onMouseMove = function(ev){
		var workspace = runtime._workspace;
		var rect = workspace.getViewPort();
		var x = rect.x + Math.min(rect.w - this._paddingLeft, Math.max(0, ev.clientX - workspace._borderLeftWidth)) - workspace._fixedX - this._offsetX - this._paddingLeft;
		var y = rect.y + Math.min(rect.h - this._paddingTop, Math.max(0, ev.clientY - workspace._borderTopWidth)) - workspace._fixedY - this._offsetY - this._paddingTop;
		if(runtime.ie || runtime.safari || runtime.chrome || runtime.opera){
			x -= this._borderLeftWidth;
			y -= this._borderTopWidth;
		}else if(runtime.moz){
		}
		/*
		var str = "boxModel=" + runtime.getBoxModel()
			//+ "\nrect={x:" + rect.x + ",y:" + rect.y + ",w:" + rect.w + ",h:" + rect.h + "}"
			+ "\nfixedX=" + workspace._fixedX + ",_borderLeftWidth=" + this._borderLeftWidth
			+ "\nfixedY=" + workspace._fixedY + ",_borderTopWidth=" + this._borderTopWidth
			//+ "\nworkspace._borderLeftWidth=" + workspace._borderLeftWidth
			//+ "\nworkspace._borderTopWidth=" + workspace._borderTopWidth
			+ "\nthis._offsetX=" + this._offsetX
			+ "\nthis._offsetY=" + this._offsetY
			+ "\nev.clientX=" + ev.clientX + ",x=" + x + ","
			+ "\nev.clientY=" + ev.clientY + ",y=" + y + ",";
		this._body.childNodes[1].value = str;
		*/
		this.moveTo(x, y);
	};
	this.onMouseUp = function(ev){
		//this.removeListener(this._head, "mousemove");
		//this.removeListener(this._head, "mouseup");
		//if(runtime.ie) this._head.releaseCapture();
		this.setCapture(false);
	};
	this.setCaption = function(v){
		if(this._caption === v) return;
		this._caption = v;
		if(this._self){
			this._title.innerHTML = runtime.encodeHTML(v);
		}
	};
	this.onKeyUp = function(ev){
		switch(ev.keyCode){
		case KEY_ESC:
			this.close();  //关闭对话框
			break;
		}
	};
	this.setClientBgColor = function(color){
		this._body.style.backgroundColor = color;
	};
	this.do_dlg_ok = function(act, sender){
		this.callback(act, sender);
	};
	//点击取消
	this.do_dlg_cancel = function(act, sender){
		this.showModal(false);
		this.callback(act, sender);
	};
});
/*</file>*/
//import alz.mui.Dialog1;
/*<file name="alz/mui/TabPage.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 选项卡组件
 */
_class("TabPage", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._tabs = [];
		this._activeTab = null;
		this._head = null;
		this._body = null;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		this._head = this._createElement2(this._self, "div", "ui-tabpage-head");
		this._body = this._createElement2(this._self, "div", "ui-tabpage-body");
		this._body.innerHTML =
				'<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#869FA1"><tbody></tbody></table>'
			+ '<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#869FA1"><tbody></tbody></table>'
			+ '<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#FFCCB4"><tbody></tbody></table>'
			+ '<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#0A0064"><tbody></tbody></table>';
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._body = null;
		this._head = null;
		this._activeTab = null;
		for(var i = 0, len = this._tabs.length; i < len; i++){
			this._tabs[i].onfocus = null;
			this._tabs[i]._parent = this;
			this._tabs[i] = null;
		}
		this._tabs.length = 0;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resize = function(w, h){
		this._self.style.width = w + "px";
		this._self.style.height = h + "px";
		this._body.style.width = (w - 4) + "px";
		this._body.style.height = (h - 18 - 4) + "px";
		var nodes = this._body.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			nodes[i].style.width = (w - 4 - 16) + "px";
			nodes[i].style.height = (h - 18 - 4) + "px";
		}
	};
	this.add = function(text){
		var el = document.createElement("label");
		el._parent = this;
		el.tagIndex = this._tabs.length + 1;
		el.innerHTML = text + "[0]";
		el.onclick = function(){this._parent.activate(this);};
		this._head.appendChild(el);
		this._tabs.push(el);
		this.activate(el);
	};
	this.activate = function(tab){
		if(this._activeTab != null){
			this._activeTab.className = "";
			this._body.childNodes[this._activeTab.tagIndex - 1].style.display = "none";
		}
		tab.className = "focus";
		this._body.childNodes[tab.tagIndex - 1].style.display = "block";
		this._activeTab = tab;
	};
});
/*</file>*/
/*<file name="alz/mui/WindowSkinWINXP.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/*
	<div class="ui-skin">
		<div class="nw"></div>
		<div class="n"></div>
		<div class="ne"></div>
		<div class="w"></div>
		<div class="e"></div>
		<div class="sw"></div>
		<div class="s"></div>
		<div class="se"></div>
	</div>

一个窗体组件的几种BorderStyle：
	bsDialog
	bsNone
	bsSingle
	bsSizeable
	bsSizeToolWin
	bsToolWindow
*/
_class("WindowSkinWINXP", Component, function(_super, _event){
	this._cssData = {
		"normal":{
			"_title1":{"display":"none"},
			"_title2":{"display":""},
			"_skin3" :{"background-position":"-8px 0px"},
			"_skin4" :{"background-position":"-11px 0px"},
			"_skin5" :{"background-position":"0px -30px"},
			"_skin6" :{"background-position":"0px 0px"},
			"_skin7" :{"background-position":"-10px -30px"}
		},
		"resizable":{
			"_title1":{"display":""},
			"_title2":{"display":"none"},
			"_skin3" :{"background-position":"0px 0px"},
			"_skin4" :{"background-position":"-4px 0px"},
			"_skin5" :{"background-position":"0px -33px"},
			"_skin6" :{"background-position":"0px -3px"},
			"_skin7" :{"background-position":"-9px -33px"}
		}
	};
	this._cssHash = {
		"_minbtn":{
			"normal"  :{"background-position":"0px 0px"},
			"active"  :{"background-position":"0px -21px"},
			"disabled":{"background-position":"0px -42px"}
		},
		"_maxbtn":{
			"normal"  :{"background-position":"-42px 0px"},
			"active"  :{"background-position":"-42px -21px"},
			"disabled":{"background-position":"-42px -42px"}
		},
		"_closebtn":{
			"normal"  :{"background-position":"-63px 0px"},
			"active"  :{"background-position":"-63px -21px"},
			"disabled":{"background-position":"-63px -42px"}
		}
	};
	this._init = function(){
		_super._init.call(this);
		//this._skins = null;
		this._title = null;
		this._title1 = null;
		this._title2 = null;
		this._width = 0;
		this._height = 0;
		this._model = {
			"min_width"  : 123,
			"min_height" : 34,
			"head_height": 30,
			"sbtn_width" : 21,
			"sbtn_height" : 21,
			"icon_width" : 16,
			"sep_num"    : 7,
			"top_use_opacity": true  //顶部上调区域是否需要使用透明度，受标题栏IMG标签影响
		};
	};
	this.create = function(parent){
		this.setParent2(parent);
		if(parent){
			for(var k in this._cssHash){
				this._parent[k]._cssData = this._cssHash[k];
			}
		}
		var el = this._createElement2(parent ? parent._self : null, "div", "ui-skin");
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		this._xpath = ".ui-window-winxp";
		//this._skins = [];
		for(var i = 0, len = this._cursors.length; i < len; i++){
			var o = this._createElement2(this._self, "div", this._cursors[i]/*, {
				"position"       : "absolute",
				"overflow"       : "hidden",
				"backgroundColor": "#000000",
				"filter"         : "Alpha(Opacity=20)",
				"zIndex"         : 10,
				"cursor"         : this._cursors[i] + "-resize"
			}*/);
			//this._skins.push(o);
			this._ee["_skin" + i] = o;
		}
		this._ee["_title1"] =
		this._title =
		this._title1 = this._createElement("img");
		this._ee["_title2"] =
		this._title2 = this._createElement("img");
		this._self.appendChild(this._title1);
		this._self.appendChild(this._title2);
		this._title1.src = runtime.getConfigData("pathimg") + "win-xp-title-bg1.gif";
		this._title2.src = runtime.getConfigData("pathimg") + "win-xp-title-bg2.gif";
		this._title1.ondragstart = function(){return false;};
		this._title2.ondragstart = function(){return false;};
		this.addListener(this._title1, "mousedown", this._parent, "onMouseDown");
		this.addListener(this._title2, "mousedown", this._parent, "onMouseDown");
		this.setState("resizable");
		//runtime.dom.applyCssStyle(this, _cssName, "resizable");
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._title = null;
		this.removeListener(this._title1, "mousedown");
		this.removeListener(this._title2, "mousedown");
		this._title1.ondragstart = null;
		this._title2.ondragstart = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resize = function(w, h){
		//if(_super.resize.apply(this, arguments)) return true;
		_super.resize.apply(this, arguments);
		if(this._parent.getResizable()){
			var w1 =  7;  //顶宽
			var w2 =  4;  //中宽
			var w3 =  5;  //底宽
			var h1 = 30;  //顶高
			var h3 =  4;  //底高
		}else{
			var w1 =  7;  //顶宽
			var w2 =  3;  //中宽
			var w3 =  4;  //底宽
			var h1 = 29;  //顶高
			var h3 =  3;  //底高
		}
		this.setElementRect(this._ee["_skin0"],    0 ,    0 ,     w1 ,      h1);
		this.setElementRect(this._ee["_skin1"],   w1 ,    0 , w-2*w1 ,      h1);
		this.setElementRect(this._title       ,   w1 ,    0 , w-2*w1 ,      h1);
		this.setElementRect(this._ee["_skin2"], w-w1 ,    0 ,     w1 ,      h1);

		this.setElementRect(this._ee["_skin3"],    0 ,   h1 ,     w2 , h-h1-h3);
		this.setElementRect(this._ee["_skin4"], w-w2 ,   h1 ,     w2 , h-h1-h3);

		this.setElementRect(this._ee["_skin5"],    0 , h-h3 ,     w3 ,      h3);
		this.setElementRect(this._ee["_skin6"],   w3 , h-h3 , w-2*w3 ,      h3);
		this.setElementRect(this._ee["_skin7"], w-w3 , h-h3 ,     w3 ,      h3);
	};
	this.onResizableChange = function(){
		if(this._parent.getResizable()){
			this.setState("resizable");
			this._title = this._title1;
		}else{
			this.setState("normal");
			this._title = this._title2;
		}
		this.resize(this._width, this._height);
	};
	this.setState = function(v){
		if(v == this._state) return;
		this._state = v;
		//runtime.dom.applyCssStyle1(this, this._xpath, v);
		runtime.dom.applyCssStyle(this, this._cssData, v);
	};
});
/*</file>*/
/*<file name="alz/mui/WindowSkinWIN2K.js">*/
_package("alz.mui");

_import("alz.mui.Component");

_class("WindowSkinWIN2K", Component, function(_super, _event){
	this._cssData = {
		"resizable":{
			/*
			"_skin1" :{"background-position":"0px -10px"},
			"_skin2" :{"background-position":"-10px 0px"},
			"_skin3" :{"background-position":"0px 0px"},
			"_skin4" :{"background-position":"-4px 0px"},
			"_skin5" :{"background-position":"0px -33px"},
			"_skin6" :{"background-position":"0px -3px"},
			"_skin7" :{"background-position":"-9px -33px"}
			*/
		},
		"normal":{
			/*
			"_skin1" :{"background-position":"0px -7px"},
			"_skin2" :{"background-position":"-11px 0px"},
			"_skin3" :{"background-position":"-8px 0px"},
			"_skin4" :{"background-position":"-11px 0px"},
			"_skin5" :{"background-position":"0px -30px"},
			"_skin6" :{"background-position":"0px 0px"},
			"_skin7" :{"background-position":"-10px -30px"}
			*/
		}
	};
	this._cssHash = {
		"_minbtn": {
			"normal"  :{"background-position":"0px 0px"},
			"active"  :{"background-position":"0px -14px"},
			"disabled":{"background-position":"0px -28px"}
		},
		"_maxbtn":{
			"normal"  :{"background-position":"-32px 0px"},
			"active"  :{"background-position":"-32px -14px"},
			"disabled":{"background-position":"-32px -28px"}
		},
		"_closebtn":{
			"normal"  :{"background-position":"-48px 0px"},
			"active"  :{"background-position":"-48px -14px"},
			"disabled":{"background-position":"-48px -28px"}
		}
	};
	this._init = function(){
		_super._init.call(this);
		this._title = null;
		this._width = 0;
		this._height = 0;
		this._model = {
			"min_width"  : 112,
			"min_height" : 27,
			"head_height": 23,
			"sbtn_width" : 16,
			"sbtn_height": 14,
			"icon_width" : 16,
			"sep_num"    : 5,
			"top_use_opacity": false  //顶部上调区域是否需要使用透明度，受标题栏IMG标签影响
		};
	};
	this.create = function(parent){
		this.setParent2(parent);
		if(parent){
			for(var k in this._cssHash){
				this._parent[k]._cssData = this._cssHash[k];
			}
		}
		var el = this._createElement2(parent ? parent._self : null, "div", "ui-skin");
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		this._xpath = ".ui-window-win2k";
		if(runtime.ie){
			for(var i = 0, len = this._cursors.length; i < len; i++){
				var o = this._createElement2(this._self, "div", this._cursors[i]/*, {
					"position"       : "absolute",
					"overflow"       : "hidden",
					"backgroundColor": "#000000",
					"filter"         : "Alpha(Opacity=20)",
					"zIndex"         : 10,
					"cursor"         : this._cursors[i] + "-resize"
				}*/);
				this._ee["_skin" + i] = o;
			}
			this._title = this._createElement2(this._self, "img", "", {
				"src": runtime.getConfigData("pathimg") + "win-2k-title-bg.gif"
			});
			this._title.ondragstart = function(){return false;};
			this.addListener(this._title, "mousedown", this._parent, "onMouseDown");
		}
		//runtime.dom.applyCssStyle(this, _cssName, "resizable");
		this.setState("resizable");
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(runtime.ie){
			this.removeListener(this._title, "mousedown");
			this._title.ondragstart = null;
			this._title = null;
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resize = function(w, h){
		//if(_super.resize.apply(this, arguments)) return true;
		_super.resize.apply(this, arguments);
		if(runtime.ie){
			if(this._parent.getResizable()){
				var w1 =  4;  //顶宽
				var w2 =  4;  //中宽
				var w3 =  5;  //底宽
				var h0 =  4   //顶高
				var h1 = 23;  //顶高
				var h3 =  4;  //底高
			}else{
				var w1 =  3;  //顶宽
				var w2 =  3;  //中宽
				var w3 =  4;  //底宽
				var h0 =  3   //顶高
				var h1 = 22;  //顶高
				var h3 =  3;  //底高
			}
			this.setElementRect(this._ee["_skin0"],    0 ,    0 ,     w1 ,      h1);
			this.setElementRect(this._ee["_skin1"],   w1 ,    0 , w-2*w1 ,      h0);
			this.setElementRect(this._title     ,   w1 ,   h0 , w-2*w1 , h1-h0-1);
			this.setElementRect(this._ee["_skin2"], w-w1 ,    0 ,     w1 ,      h1);

			this.setElementRect(this._ee["_skin3"],    0 ,   h1 ,     w2 , h-h1-h3);
			this.setElementRect(this._ee["_skin4"], w-w2 ,   h1 ,     w2 , h-h1-h3);

			this.setElementRect(this._ee["_skin5"],    0 , h-h3 ,     w3 ,      h3);
			this.setElementRect(this._ee["_skin6"],   w3 , h-h3 , w-2*w3 ,      h3);
			this.setElementRect(this._ee["_skin7"], w-w3 , h-h3 ,     w3 ,      h3);
		}
	};
	this.onResizableChange = function(){
		//runtime.dom.applyCssStyle(this, _cssName, this._parent.getResizable() ? "resizable" : "normal");
		this.setState(this._parent.getResizable() ? "resizable" : "normal");
		this.resize(this._width, this._height);
	};
	this.setState = function(v){
		if(v == this._state) return;
		this._state = v;
		//runtime.dom.applyCssStyle1(this, this._xpath, v);
		runtime.dom.applyCssStyle(this, this._cssData, v);
	};
	this.showBorder = function(){
		this._dom.removeClass(this._self, "none");
	};
	this.hideBorder = function(){
		this._dom.addClass(this._self, "none");
	};
});
/*</file>*/
/*<file name="alz/mui/SysBtn.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 窗体组件上的系统按钮组件
 */
_class("SysBtn", Component, function(_super, _event){
	//#_interface("IActionSource");
	this._init = function(){
		_super._init.call(this);
		this._win = null;
	};
	this.init = function(obj, win, css){
		_super.init.apply(this, arguments);
		this._win = win;
		this._cssName = "." + this._self.className;
		this._xpath = this._win._cssName + " .head " + this._cssName;
		this._capture = false;
		this.addListener(this._self, "click", this, "onClick1");
		this.addListener(this._self, "mousedown", this, "onMouseDown1");
		this.addListener(this._self, "mouseup", this, "onMouseUp1");
		//this.addListener(this._self, "mouseover", this, "onMouseOver1");
		//this.addListener(this._self, "mouseout", this, "onMouseOut1");
	}
	this.dispose = function(){
		if(this._disposed) return;
		//this.removeListener(this._self, "mouseout");
		//this.removeListener(this._self, "mouseover");
		//this.removeListener(this._self, "mouseup");
		this.removeListener(this._self, "mousedown");
		this.removeListener(this._self, "click");
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.onMouseDown1 = function(ev){
		this._dom.addClass(this._self, "active");
		this._capture = true;
		this.setState("active");
		if(runtime.ie){
			this._self.setCapture();
			ev.cancelBubble = true;
		}else{
			ev.stopPropagation();
		}
		return false;
	};
	this.onMouseUp1 = function(ev){
		this._dom.removeClass(this._self, "active");
		this._capture = false;
		this.setState("normal");
		if(runtime.ie){
			this._self.releaseCapture();
			ev.cancelBubble = true;
		}else{
			ev.stopPropagation();
		}
		return false;
	};
	this.onMouseOver1 = function(ev){
		document.title = "over";
		if(this._capture){
			this.setState("active");
		}else{
			//this.setState("normal");
		}
		//return false;
	};
	this.onMouseOut1 = function(ev){
		document.title = "out";
		if(this._capture){
			this.setState("normal");
		}else{
			//this.setState("normal");
		}
		//return false;
	};
	this.onClick1 = function(ev){
	};
	this.onMouseDown = function(ev){
		this.setCapture(true);
		/*
		var _this = this;
		var body = document.body;
		if(runtime._host.env == "ie"){
			body.setCapture();
		}
		this.addListener(body, "mousemove", this, "onMouseMove");
		this.addListener(body, "mouseup", this, "onMouseUp");
		*/
		this.setState("active");
		ev.cancelBubble = true;
		return false;
	};
	this.onMouseMove = function(ev){
		var target = ev.srcElement || ev.target;
		this.setState(target == this._self ? "active" : "normal");
	};
	this.onMouseUp = function(ev){
		this.setState("normal");
		this.setCapture(false);
		/*
		var body = document.body;
		this.removeListener(body, "mousemove");
		this.removeListener(body, "mouseup");
		if(runtime._host.env == "ie"){
			body.releaseCapture();
		}
		*/
	};
});
/*</file>*/
/*<file name="alz/mui/Window.js">*/
_package("alz.mui");

_import("alz.mui.BaseWindow");
_import("alz.mui.SysBtn");
_import("alz.mui.WindowSkinWINXP");
_import("alz.mui.WindowSkinWIN2K");

/*
	<div class="head">
		<img src="images/win-icon.gif" />
		<label>窗体组件标题栏 - Windown XP</label>
		<div class="sysbtn">
			<div class="icon-min"></div>
			<div class="icon-max"></div>
			<div class="icon-close"></div>
		</div>
	</div>
	<div class="head">
		<img src="images/win-icon.gif" />
		<label>窗体组件标题栏 - Windown 2000</label>
		<div class="sysbtn">
			<div class="icon-min"></div>
			<div class="icon-max"></div>
			<div class="icon-close"></div>
		</div>
	</div>
*/
_class("Window", BaseWindow, function(_super, _event){
	//<input type="checkbox" checked="checked" /> Resizable
	this._init = function(){
		_super._init.call(this);
		this._icon = null;
		this._minbtn = null;
		this._maxbtn = null;
		this._skin = null;
		this._resizable = false;
		this._width = 0;
		this._height = 0;
		this._lastRect = null;
	};
	this.build = function(el){
		_super.build.apply(this, arguments);
		var attributes = el._attributes;
		if(attributes.dock){
			if(attributes.dock == "true"){
				runtime.dom.removeClass(this._self, "undock");
			}else{
				runtime.dom.addClass(this._self, "undock");
			}
		}
		this.setParent2(this._self.parentNode);
		this._params = {};
	};
	this.create = function(parent, app, params, tpl){
		this.setParent2(parent);
		this.setApp(app);
		this.setParams(params || {});
		var el = this.createTplElement(parent, tpl);
		this.init(el);
		return el;
	};
	this.bind = function(el){
		this.setParent2(el.parentNode);
		this._params = {};
		this.init(el);
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		/*
		body     .body
		head     .head
		icon     .head > img
		title    .head > label
		minbtn   .head > .sysbtn > .icon-min
		maxbtn   .head > .sysbtn > .icon-max
		closebtn .head > .sysbtn > .icon-close
		*/
		//_icon="{$pathimg}win-icon.gif" _caption="alzui调试器 - Windown 2000" _align="none"
		var data = {
			"icon"   : el.getAttribute("_icon") || "",
			"caption": this._params.caption || el.getAttribute("_caption") || "标题栏"
		};
		this._cssName = "." + this._self.className;
		this._xpath = this._cssName;
		var _this = this;
		this._icon = this.find(".icon");
		this._icon.src = data.icon.replace(/^images\//, runtime.getConfigData("pathimg"));
		this._icon.ondragstart = function(){return false;};
		this._minbtn = new SysBtn();
		this._minbtn.init(this.find(".icon-min"), this);
		this._maxbtn = new SysBtn();
		this._maxbtn.init(this.find(".icon-max"), this);
		if(this._self.className == "ui-window-winxp"){
			this._skin = new WindowSkinWINXP();
		}else{
			this._skin = new WindowSkinWIN2K();
		}
		this.createBorders();
		this._skin.create(this);

		this.resize(800, 600);
		this.showBorder();
		this.setResizable(true);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._skin.dispose();
		this._skin = null;
		this._minbtn.dispose();
		this._minbtn = null;
		this._maxbtn.dispose();
		this._maxbtn = null;
		this._icon.ondragstart = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/*this.xquery = function(xpath){
		return runtime._xpq.query(xpath, this._self);
	};*/
	this.getResizable = function(){
		return this._resizable;
	};
	this.setResizable = function(v){
		if(v == this._resizable) return;
		this._resizable = v;
		this.tune(this._width, this._height);
		if(v){
			this.showBorder();
			this._skin.showBorder();
		}else{
			this.hideBorder();
			this._skin.hideBorder();
		}
		this._skin.onResizableChange();
	};
	this.resize = function(w, h){
		if(w < this._skin._model["min_width"] ) w = this._skin._model["min_width"];
		if(h < this._skin._model["min_height"]) h = this._skin._model["min_height"];
		if(_super.resize.apply(this, arguments)) return true;
		//this.tune(w, h);
		if(/*this._resizable && */this._borders){
			this.resizeBorder(w, h);
		}
		this._skin.resize(w, h);
	};
	this.tune = function(w, h){
		var m = this._skin._model;
		var n = this._resizable ? 4 : (this._state == "normal" ? 3 : 0);  //this._borderTopWidth + this._paddingTop;
		var h0 = m["head_height"];
		this.setElementRect(this._head, n, n, w - 2 * n, (this._state == "normal" ? h0 - n - 1 : 18));
		this.setElementRect(this._body, n, n, w - 2 * n, h - h0 - n    );
		this._title.style.width = (w - 2 * n - m["icon_width"] - m["sbtn_width"] * 3 - 2 * m["sep_num"]) + "px";
	};
	//窗体最大化
	this.do_win_max = function(act, sender){
		console.log("[TODO]do_win_max");
		if(this._state == "normal"){
			this._state = "max";
			this._lastRect = {
				"x": this._left,
				"y": this._top,
				"w": this._width,
				"h": this._height
			};
			this.hideBorder();
			this.moveTo(0, 0);
			var rect = this.getParent().getViewPort();
			this.resize(rect.w, rect.h);
			this.setResizable(false);
		}else{
			this._state = "normal";
			this.showBorder();
			var rect = this._lastRect;
			this.moveTo(rect.x, rect.y);
			this.resize(rect.w, rect.h);
			this._lastRect = null;
			this.setResizable(true);
		}
	};
	//窗体最小化
	this.do_win_min = function(act, sender){
		console.log("[TODO]do_win_min");
	};
});
/*</file>*/
/*<file name="alz/mui/ToolWin.js">*/
_package("alz.mui");

_import("alz.mui.BaseWindow");

/**
 * 工具窗体
 */
_class("ToolWin", BaseWindow, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._dock = false;
	};
	this.rendered = function(){
		_super.rendered.apply(this);
		runtime.dom.addClass(this._self, "undock");
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this.initActionElements();
	};
	this.dispose = function(){
		if(this._disposed) return;
	};
});
/*</file>*/
/*<file name="alz/mui/AppWorkspace.js">*/
_package("alz.mui");

_import("alz.mui.Container");

/**
 * 应用的子窗体工作区组件
 */
_class("AppWorkspace", Container, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.build = function(el){
		_super.build.apply(this, arguments);
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.rendered = function(){
		_super.rendered.apply(this);
		console.log("AppWorkspace::rendered");
	};
});
/*</file>*/
/*<file name="alz/mui/PaneBase.js">*/
_package("alz.mui");

_import("alz.mui.Pane");

/**
 * 面板基类
 */
_class("PaneBase", Pane, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.create = function(parent, app, tpl){
		this.setParent2(parent);
		this.setApp(app);
		var el = this.createTplElement(parent, tpl);
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		//this.initComponents();  //初始化内部组件
		this.initActionElements(/*this._self, this*/);  //初始化动作元素
	};
	this.reset = function(params){
		if(this._params !== params){
			this.setParams(params);
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._params = null;
		_super.dispose.apply(this);
	};
	this.setActionState = function(act, v, next){
		var nodes = this._actionManager._nodes[act];
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			switch(v){
			case "show":
			case "hide":
				node.setVisible(v == "show");
				if(next){
					node._self.nextSibling.style.display = v == "show" ? "" : "none";
				}
			}
		}
	};
});
/*</file>*/
/*<file name="alz/core/WebRuntime_ui.js">*/
_package("alz.core");

//_import("alz.core.ActionManager");
_import("alz.core.ToggleManager");
_import("alz.mui.Workspace");
_import("alz.mui.Dialog");

_extension("WebRuntime", function(){  //注册 WebRuntime 扩展
	this._init = function(){  //加载之后的初始化工作
		this._domTemp = null;
		this.toggleMgr = new ToggleManager();
		//this.actionManager = new ActionManager();
		this._workspace = new Workspace();
	};
	this.dispose = function(){
		if(this._workspace){
			this._workspace.dispose();
			this._workspace = null;
		}
		if(this._testCaseWin){
			this._testCaseWin.dispose();
			this._testCaseWin = null;
		}
		this.toggleMgr.dispose();
		this.toggleMgr = null;
		//this.actionManager.dispose();
		//this.actionManager = null;
		this._domTemp = null;
	};
	this.onLoad = function(ev){
		if(true || this._newWorkspace){
			this._workspace.create(this.getBody());
		}else{
			this._workspace.bind(this.getBody());
		}
		this._workspace.setVisible(true);
		if(this.debug){  //如果开启调试开关
			this._testCaseWin = new Dialog();
			this._testCaseWin._domCreate = true;
			this._testCaseWin.create(this._workspace._self, "Test Case Listener");
			this._testCaseWin.moveTo(500, 50);
			this._testCaseWin.resize(500, 300);
			this._testCaseWin.setClientBgColor("#FFFFFF");
			this._testCaseWin.log = function(msg){
				var div = this._createElement2(null, "div", "", {
					"borderBottom": "1px solid #CCCCCC",
					"innerHTML"   : msg
				});
				this._body.appendChild(div);
			};
		}
	};
	/**
	 * 根据一段HTML代码字符串创建一个DOM对象
	 * @param {String} html HTML代码字符串
	 * @return {Element} 新创建的DOM对象
	 */
	this.createDomElement = function(html, parent/*|exp*/){
		if(!this._domTemp){
			this._domTemp = this._doc.createElement("div");
		}
		this._domTemp.innerHTML = html;
		var el = this._domTemp.removeChild(this._domTemp.childNodes[0]);
		if(typeof parent == "string" || typeof parent == "undefined"){
			//return jQuery.find(exp, div)[0];
			/*
			var nodes = div.childNodes;
			for(var i = 0, len = nodes.length; i < len; i++){
				if(nodes[i].className == "main"){
					return div.removeChild(nodes[i]);
				}
			}
			return null;
			*/
		}else if(parent){  //HTMLElement
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
	this.getWorkspace = function(){
		return this._workspace;
	};
	this.getViewPort = function(element){
		var rect = {
			"x": element.scrollLeft,
			"y": element.scrollTop,
			//"w": element.clientWidth,  //Math.max(element.clientWidth || element.scrollWidth)
			"w": Math.max(element.clientWidth, element.parentNode.clientWidth),
			"h": Math.max(element.clientHeight, element.parentNode.clientHeight)  //Math.max(element.clientHeight || element.scrollHeight)
		};
		//if(this.ff){}
		//rect.w = Math.max(element.clientWidth, element.parentNode.clientWidth);
		//rect.h = Math.max(element.clientHeight, element.parentNode.clientHeight);
		return rect;
	};
	this.onResize = function(ev){
		var rect = this.getViewPort(this.getBody());  //this._workspace.getViewPort()
		if(this._workspace){
			this._workspace.resize(rect.w, rect.h);
		}
		/*
		if(typeof app_onResize != "undefined"){  //提前触发应用的resize事件
			app_onResize(rect.w, rect.h);
		}
		*/
		if(this._appManager){
			this._appManager.onResize({
				"type": "resize",
				"w"   : rect.w,
				"h"   : rect.h
			});  //调整所有应用的大小
		}
	};
	/**
	 * 根据DOM元素的ID，并且使用该DOM元素创建一个脚本组件
	 * @param {String} id 脚本组件所绑定的DOM元素的ID
	 */
	this.getComponentById = function(id){
		return this.initComponent(null, id);
	};
	/**
	 * 所有通过该函数操作过的DOM元素都会绑定一个脚本组件对象，并通过该脚本组件可以
	 * 方便的操作DOM元素的属性。
	 * @param {Component} parent 父组件
	 * @param {String|Component} id 组件要绑定的DOM元素的id
	 * -@param {Boolean} initChild 是否初始化子DOM元素
	 */
	this.initComponent = function(parent, id){
		var el = typeof id == "string" ? this.getElement(id) : id;
		if(!el) throw "未找到指定id的DOM元素";
		if(!el._ptr){
			var className, aui;
			var sAui = el.getAttribute("aui");
			if(sAui != "-"){
				aui = eval("(" + sAui + ")");
				if(aui.tag){
					className = aui.tag;
				}else{
					className = el.getAttribute("tag");
					if(!className){
						className = "Component";
						//throw "找到的DOM元素没有tag属性，不能绑定脚本组件";
					}else{
						this._win.alert("使用DOM元素的tag属性决定组件类型");
					}
				}
			}
			if(!className){
				className = "Component";  //默认值
			}
			var c = new alz[className]();
			//c._domCreate = true;
			if(aui){
				c.setJsonData(aui);
			}
			c.setParent(parent, el);
			c.bind(el);
			//var color = this.getRandomColor();
			//c._self.style.backgroundColor = color;
			this._components.push(c);
			if(el.getAttribute("html") != "true"){  //如果初始化子组件的话
				var nodes = el.childNodes;
				for(var i = 0, len = nodes.length; i < len; i++){
					if(nodes[i].nodeType == 1 && nodes[i].getAttribute("aui")){  //NODE_ELEMENT
						this.initComponent(c, nodes[i], true);
					}
				}
			}
		}
		return el._ptr;
	};
	/**
	 * @param {String} id DOM元素的ID列表，逗号分隔
	 * @return {undefined}
	 */
	this.initComponents = function(id){
		var arr = id.split(",");
		for(var i = 0, len = arr.length; i < len; i++){
			var c = this.initComponent(this._workspace, arr[i]);
			var nodes = c._self.childNodes;
			for(var j = 0, len1 = nodes.length; j < len1; j++){
				var node = nodes[j];
				if(node.nodeType == 1 && node.getAttribute("aui")){  //NODE_ELEMENT
					this.initComponent(c, node, true);
				}
			}
		}
	};
	/**
	 * 显示一个模态对话框
	 * @param {String} id 对话框的ID
	 * @param {String} ownerId 该对话框的所有者的编号
	 * @return {undefined}
	 */
	this.showModalDialog = function(id, ownerId){
		if(id){
			if(ownerId){
				var owner = this.getComponentById(ownerId);
				this._workspace.getModalPanel().setOwner(owner);
			}
			var el = this.getComponentById(id);  //可能的组件是 Popup,Dialog
			el.moveToCenter();
			el.showModal(true);
		}/*else{
			el.showModal(false);
		}*/
	};
	this.getModalPanel = function(){
		return this._workspace.getModalPanel();
	};
});
/*</file>*/

}});