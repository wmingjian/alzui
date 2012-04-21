_package("alz.core");

/**
 * 自定义事件类
 */
_class("CustomEvent", "", function(){
	function Subscriber(){this._init.apply(this, arguments);}
	(function(){
		this._init = function(fn, obj, overrideContext){
			this.fn = fn;
			this.obj = typeof obj == "undefined" ? null : obj;
			this.overrideContext = overrideContext;
		};
		this.dispose = function(){
			this.overrideContext = null;
			this.obj = null;
			this.fn = null;
		};
		this.toString = function(){
			return "Subscriber { obj: " + this.obj  + ", overrideContext: " + (this.overrideContext || "no") + " }";
		};
		this.getScope = function(defaultScope){
			if(this.overrideContext){
				if(this.overrideContext === true){
					return this.obj;
				}else{
					return this.overrideContext;
				}
			}
			return defaultScope;
		};
		this.contains = function(fn, obj){
			if(obj){
				return this.fn == fn && this.obj == obj;
			}else{
				return this.fn == fn;
			}
		};
	}).apply(Subscriber.prototype);
	this._init = function(type, context){
		_super._init.call(this);
		this.type = type;
		this.scope = context || window;
		this.fired = false;
		this.firedWith = null;
		this.subscribers = [];
		var onsubscribeType = "_CEOnSubscribe";
		if(type !== onsubscribeType){
			this.subscribeEvent = new CustomEvent(onsubscribeType, this);
		}
		this.lastError = null;
		this.signature = 1;
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this.subscribeEvent){
			this.subscribeEvent.dispose();
			this.subscribeEvent = null;
		}
		for(var i = 0, len = this.subscribers.length; i < len; i++){
			this.subscribers[i].dispose();
			this.subscribers[i] = null;
		}
		this.subscribers.length = 0;
		_super.dispose.apply(this);
	};
	this.toString = function(){
		return "CustomEvent: " + "'" + this.type  + "', " +
			"context: " + this.scope;
	};
	this.subscribe = function(fn, obj, overrideContext){
		if(!fn){
			throw new Error("Invalid callback for subscriber to '" + this.type + "'");
		}
		if(this.subscribeEvent){
			this.subscribeEvent.fire(fn, obj, overrideContext);
		}
		var s = new Subscriber(fn, obj, overrideContext);
		this.subscribers.push(s);
	};
	this.unsubscribe = function(fn, obj){
		if(!fn){
			return this.unsubscribeAll();
		}
		var found = false;
		for(var i = 0, len = this.subscribers.length; i < len; i++){
			var s = this.subscribers[i];
			if(s && s.contains(fn, obj)){
				this._delete(i);
				found = true;
			}
		}
		return found;
	};
	this.fire = function(){
		this.lastError = null;
		var errors = [], len = this.subscribers.length;
		var args=[].slice.call(arguments, 0), ret=true, i, rebuild=false;
		this.fired = true;
		//this.firedWith = args;

		// make a copy of the subscribers so that there are no index problems if one subscriber removes another.
		var subs = this.subscribers.slice();
		for(i = 0; i < len; i++){
			var s = subs[i];
			if(!s){
				rebuild=true;
			}else{
				ret = this.notify(s, args);
				if(false === ret){
					break;
				}
			}
		}
		return ret !== false;
	};
	this.notify = function(s, args){
		var ret, param=null, scope = s.getScope(this.scope);
		if(this.signature){
			if(args.length > 0){
				param = args[0];
			}
			try {
				ret = s.fn.call(scope, param, s.obj);
			} catch(e){
				this.lastError = e;
				throw e;
			}
		} else {
			try {
				ret = s.fn.call(scope, this.type, args, s.obj);
			} catch(ex){
				this.lastError = ex;
				throw ex;
			}
		}
		return ret;
	};
	this.unsubscribeAll = function(){
		var l = this.subscribers.length, i;
		for(i=l-1; i>-1; i--){
			this._delete(i);
		}
		this.subscribers=[];
		return l;
	};
	this._delete = function(index){
		var s = this.subscribers[index];
		if(s){
			delete s.fn;
			delete s.obj;
		}
		this.subscribers.splice(index, 1);
	};
});