_package("alz.core");

_import("alz.core.EventTarget");
_import("alz.core.Plugin");

/**
 * 全局事件管理者
 */
_class("EventManager", Plugin, function(){
	this._init = function(){
		_super._init.call(this);
	};
	/**
	 * 给组件内的DOM元素或子组件添加事件
	 * @param {HTMLElement|EventTarget} obj 要添加事件的对象
	 * @param {String} type 事件类型
	 * @param {Object} agent 事件代理对象
	 * @param {String|Function} func 事件响应函数
	 */
	this.addListener = function(obj, type, agent, func){
		var cbid = runtime._task.add(agent, func, null, "event");
		if(obj instanceof EventTarget){
			//obj.addEventListener(type, agent, false);
			var listener = {
				"obj" : obj,
				"cbid": cbid,
				"wrap": this.createListenerWrap(obj, type, cbid)
			};
			obj.addEventListener(type, listener, false);
		}else if(runtime.ie && obj.tagName || obj instanceof HTMLElement){
			var listeners = runtime._element.data(obj, "listeners");
			if(!listeners){
				listeners = runtime._element.data(obj, "listeners", {});
			}
			//var touch = this._touchRe.test(type);
			var touch = false;
			var listener = {
				"obj" : obj,
				"cbid": cbid,
				"wrap": this.createListenerWrap(obj, type, cbid, touch)
			};
			listeners[type] = listener;
			if(touch){
				runtime._gestureManager.addEventListener(obj, type, listener);
			}else{
				obj.addEventListener(type, listener.wrap, false);
			}
		}
	};
	/**
	 * 移除组件内的DOM元素或子组件绑定的事件
	 * @param {HTMLElement|EventTarget} obj 要添加事件的对象
	 * @param {String} type 事件类型
	 */
	this.removeListener = function(obj, type){
		if(obj instanceof EventTarget){
			obj.removeEventListener(type);  //移除所有type类型事件
		}else/* if(obj instanceof Element)*/{
			var listeners = runtime._element.data(obj, "listeners");
			if(listeners){
				var listener = listeners[type];
				for(var k in listener){
					listener[k] = null;  //obj,cbid,wrap
				}
				delete listeners[type];
			}
		}
	};
	this.createListenerWrap = function(dom, type, cbid, touch){
		return function(ev, args){
			ev || (ev = window.event);
			if(touch){
				ev = new TouchEventObjectImpl(ev);
			}/*else{
				ev = Ext.EventObject.setEvent(ev);
			}*/
			return runtime._task.execute(cbid, [ev]);
		};
	};
});