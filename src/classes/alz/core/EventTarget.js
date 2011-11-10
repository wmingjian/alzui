_package("alz.core");

/**
 * @class EventTarget
 * @extends alz.lang.AObject
 * @desc DOM事件模型
 DOM Event Model
 《Document Object Model (DOM) Level 2 Events Specification》
 http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113
 * @example
var _dom = new DOMUtil();
 */
_class("EventTarget", "", function(){
	this._init = function(){
		_super._init.call(this);
		/**
		 * 所有的事件响应函数都不与组件对象绑定，而是存储在这个映射表中
		 * [注意]不能将该属性放到原型属性里面去，不然两个对象会共享之
		 */
		this._eventMaps = {};  //事件映射表
		//this._listeners = {};
		this._listener = {};
		this._enableEvent = true;
		this._parent = null;  //组件所属的父组件
		this._disabled = false;
	};
	/**
	 * @method dispose
	 * @desc 析构方法
	 */
	this.dispose = function(){
		if(this._disposed) return;
		this._parent = null;
		for(var k in this._listener){
			delete this._listener[k];
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * @method setEnableEvent
	 * @param {Boolean} v
	 * @desc 设置是否禁用事件
	 */
	this.setEnableEvent = function(v){
		this._enableEvent = v;
	};
	/**
	 * @method getParent
	 * @return {Object}
	 * @desc 获取组件所属的父组件
	 */
	this.getParent = function(){
		return this._parent;
	};
	/**
	 * @method setParent
	 * @return {Object} v
	 * @desc 设置组件所属的父组件
	 */
	this.setParent = function(v){
		this._parent = v;
	};
	/**
	 * @method getDisabled
	 * @return {Boolean}
	 * @desc 不知道_disabled是什么东东
	 */
	this.getDisabled = function(){
		return this._disabled;
	};
	/**
	 * @method setDisabled
	 * @param {Boolean} v
	 * @desc 不知道_disabled是什么东东
	 */
	this.setDisabled = function(v){
		if(this._disabled == v) return;
		this._disabled = v;
	};
	/**
	 * @method addEventGroupListener
	 * @param {String} eventMap 事件名的序列，用,隔开，也可传入mouseevent或keyevent，这表示一个事件集
	 * @param {Function} listener 事件响应函数
	 * @desc 注册事件侦听器
	 */
	/*
	this.addEventListener1 =
	this.addEventGroupListener = function(eventMap, listener){
		if(eventMap == "mouseevent"){
			eventMap = "mousedown,mouseup,mousemove,mouseover,mouseout,click,dblclick";
		}else if(eventMap == "keyevent"){
			eventMap = "keydown,keypress,keypressup";
		}
		//var maps = eventMap.split(",");
		//for(var i = 0, len = maps.length; i < len; i++){
		if(this._self){
			for(var k in listener){
				if(!(k in this._listener)){
					this._self.addEventListener(k, function(ev){
						return this._ptr.fireEvent1(ev || runtime.getWindow().event);
					}, false);
				}
				this._listener[k] = listener[k];
			}
		}
		//maps = null;
	};
	*/
	this.fireEvent1 = function(ev){
		if(!this._enableEvent) return;
		//如果启用了事件相应机制，则触发事件
		var type = ev.type;
		//if(type == "mousedown") window.alert(121);
		var ret;
		for(var el = this._self; el; el = el.parentNode){
			var c = el._ptr;
			if(c && c._listener && type in c._listener){
				ret = c._listener[type].call(c, ev);
				break;
			}
		}
		return ret;
	};
	/**
	 * @method removeEventGroupListener
	 * @param {String} eventMap 事件名的序列，用,隔开，也可传入mouseevent或keyevent，这表示一个事件集
	 * @desc 移除事件侦听器
	 */
	/*
	this.removeEventListener1 =
	this.removeEventGroupListener = function(eventMap){
		if(eventMap == "mouseevent"){
			eventMap = "mousedown,mouseup,mousemove,mouseover,mouseout,click,dblclick";
		}else if(eventMap == "keyevent"){
			eventMap = "keydown,keypress,keypressup";
		}
		var maps = eventMap.split(",");
		for(var i = 0, len = maps.length; i < len; i++){
			if(this._self){
				//this._self.removeEventListener(maps[i], null, false);
			}
		}
		maps = null;
		//this._listener = null;
	};
	*/
	/**
	 * 此方法允许在事件目标上注册事件侦听器。
	 * @java void addEventListener(String type, EventListener listener, boolean useCapture);
	 * [TODO]检查type的合法值
	 * [TODO]同一个事件响应函数不应该被绑定两次
	 * @method addEventListener
	 * @param {String} type 事件类型
	 * @param {Function} eventHandle 事件处理函数
	 * @param {Boolean} useCapture
	 * @desc 在EventTarget上注册事件侦听器
	 */
	this.addEventListener = function(type, eventHandle, useCapture){
		if(!this._eventMaps[type]){
			this._eventMaps[type] = [];  //[TODO]使用{}来模拟多个事件执行顺序的无关性
		}
		this._eventMaps[type].push(eventHandle);
	};
	/**
	 * @method removeEventListener
	 * @param {String} type 事件类型
	 * @param {Function} eventHandle 事件处理函数
	 * @param {Boolean} useCapture
	 * @desc 在EventTarget上移除事件侦听器
	 */
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
	this.addListener = function(type, agent, func){
		this.addEventListener(type, function(ev){
			return agent[func].call(agent, ev);
		}, false);
	};
	this.dispatchEvent = function(ev){
		var type = ev.type || ev.getType();
		var ret = true;
		for(var obj = this; obj; obj = obj.getParent()){  //默认事件传递顺序为有内向外
			if(obj.getDisabled()){
				ev.cancelBubble = true;
				ret = false;
				break;  //continue;
			}
			if(obj["on" + type]){  //如果组件的时间响应方法存在
				ret = obj["on" + type](ev);  //应该判断事件响应函数的返回值并做些工作
				if(ev.cancelBubble){
					return ret;  //如果禁止冒泡，则退出
				}
			}else{
				var map = obj._eventMaps[type];
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
	this.fireEvent = function(ev, argv){
		var name = "on" + ev.type.capitalize();
		if(typeof this[name] == "function"){
			//try{
				switch(arguments.length){
				case 1: return this[name](ev);
				case 2: return this[name].apply(this, [ev].concat(argv));
				case 3: return this[name].apply(this, arguments);
				}
			//}catch(ex){  //屏蔽事件中的错误
			//	//runtime.showException(ex, "[" + this._className + "::onInit]");
			//	return false;
			//}
		}
	};
	/**
	 * @method getEvent
	 * @param {Event} ev 事件对象
	 * @return {Event}
	 * @desc 获取兼容的事件对象
	 */
	this.getEvent = function(ev){
		return ev || runtime.getWindow().event;
	};
	/**
	 * @method preventDefault
	 * @param {Event} ev 事件对象
	 * @desc 阻止默认行为
	 */
	this.preventDefault = function(ev){
		ev = this.getEvent(ev);
		if(ev.preventDefault) {
			ev.preventDefault();
		}else{
			ev.returnValue = false;
		}
	};
	/**
	 * @method stopPropagation
	 * @param {Event} ev 事件对象
	 * @desc 阻止事件流继续冒泡
	 */
	this.stopPropagation = function(ev){
		ev = this.getEvent(ev);
		if(ev.stopPropagation){
			ev.stopPropagation();
		}else{
			ev.cancelBubble = true;
		}
	};
	/**
	 * @method stopEvent
	 * @param {Event} ev 事件对象
	 * @desc 停止当前事件对象的一切活动
	 */
	this.stopEvent = function(ev){
		this.preventDefault(ev);
		this.stopPropagation(ev);
	};
});