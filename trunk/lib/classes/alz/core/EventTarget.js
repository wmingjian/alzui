_package("alz.core");

/**
 * DOM Event Model
 * 《Document Object Model (DOM) Level 2 Events Specification》
 * http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113
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
		if(this._disabled == v) return;
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