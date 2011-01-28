_package("alz.core");

_import("alz.core.EventTarget");

/**
 * [TODO]
 * 1)application 变量在 runtime.createApp 方法返回之后被覆盖了
 */
_class("Application", EventTarget, function(_super){
	/*
	var __exts = [];
	Application.regExt = function(fun){  //注册应用的扩展
		var o = new fun();
		__exts.push(o);
		for(var k in o){
			if(k == "_init") continue;  //[TODO]
			if(k == "init" || k == "dispose") continue;  //忽略构造或析构函数
				Application.prototype[k] = o[k];  //绑定到原型上
		}
		o = null;
	};
	*/
	this._init = function(){
		__context__.application = this;
		_super._init.call(this);
		this._appconf = null;  //应用配置信息
		this._parentApp = null;
		this._historyIndex = -1;
		this.params = null;
		this._workspace = null;
		this._hotkey = {};  //热键
		this._domTemp = null;
		/*
		this._cache = {  //参考了 prototype 的实现
			findOrStore: function(value){
				return this[value] = this[value] || function(){
					return value.apply(null, [this].concat(runtime.toArray(arguments)));
				};
			}
		};
		*/
		//执行构造扩展
		//for(var i = 0, len = __exts.length; i < len; i++){
		//	__exts[i]._init.call(this);
		//}
	};
	this.init = function(){
		//_super.init.apply(this, arguments);
		this._workspace = runtime._workspace;
		//注册系统热键
		runtime.getDom().addEventListener(runtime.getDocument(), "keydown", function(ev){
			ev = ev || runtime.getWindow().event;
			if("_" + ev.keyCode in this._hotkey){  //如果存在热键，则执行回掉函数
				var ret, o = this._hotkey["_" + ev.keyCode];
				switch(o.type){
				case 0: ret = o.agent(ev);break;
				case 1: ret = o.agent[o.cb](ev);break;
				case 2: ret = o.cb.apply(o.agent, [ev]);break;
				}
				o = null;
				return ret;
			}
		}, this);
		//执行初始化扩展
		//for(var i = 0, len = __exts.length; i < len; i++){
		//	__exts[i].init.apply(this, arguments);
		//}
	};
	this.dispose = function(){
		if(this._disposed) return;
		//执行析构扩展
		//for(var i = 0, len = __exts.length; i < len; i++){
		//	__exts[i].dispose.apply(this, arguments);
		//}
		this._domTemp = null;
		//runtime.getDocument().onkeydown = null;
		for(var k in this._hotkey){
			delete this._hotkey[k];
		}
		this._workspace = null;
		this.params = null;
		this._parentApp = null;
		this._appconf = null;
		_super.dispose.apply(this);
	};
	this.onContentLoad = function(){
	};
	/**
	 * 注册系统热键
	 * @param keyCode {Number} 热键编码
	 * @param callback {Function} 回调函数
	 */
	this.regHotKey = function(keyCode, agent, callback){
		var type;
		if(typeof(agent) == "function"){
			type = 0;
		}else if(typeof(agent) == "object" && typeof(callback) == "string"){
			type = 1;
		}else if(typeof(agent) == "object" && typeof(callback) == "function"){
			type = 2;
		}else{
			runtime.showException("回调参数错误");
			return;
		}
		if(!this._hotkey["_" + keyCode]){
			this._hotkey["_" + keyCode] = {type: type, agent: agent, cb: callback};
		}
	};
	this.createDomElement = function(html){
		if(!this._domTemp){
			this._domTemp = window.document.createElement("div");
		}
		this._domTemp.innerHTML = html;
		return this._domTemp.removeChild(this._domTemp.childNodes[0]);
	};
	this.setParentApp = function(v){
		this._parentApp = v;
	};
	this.setHistoryIndex = function(v){
		this._historyIndex = v;
	};
});