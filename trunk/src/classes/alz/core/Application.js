_package("alz.core");

_import("alz.core.EventTarget");
_import("alz.template.TemplateManager");

/**
 * [TODO]
 * 1)application 变量在 runtime.createApp 方法返回之后被覆盖了
 */
_class("Application", EventTarget, function(){
	/*
	var __exts = [];
	Application.regExt = function(func){  //注册应用的扩展
		var o = new func();
		__exts.push(o);
		for(var k in o){
			if(k == "_init") continue;  //[TODO]
			if(k == "init" || k == "dispose") continue;  //忽略构造或析构函数
			Application.prototype[k] = o[k];  //绑定到原型上
		}
		o = null;
	};
	*/
	/*
	 * popup   弹出式组件配置信息
	 * dialog  对话框组件配置信息
	 * pane    面板组件配置信息
	 */
	this.__conf = {};
	/**
	 * 注册配置数据
	 */
	this.__conf__ = function(data){
		for(var k in data){
			var hash;
			if(!(k in this.__conf)){
				hash = this.__conf[k] = {};
			}else{
				hash = this.__conf[k];
			}
			for(var i = 0, len = data[k].length; i < len; i++){
				var item = data[k][i];
				hash[item.id] = item;
			}
		}
	};
	this._init = function(){
		__context__.application = this;  //绑定到lib上下文环境上
		_super._init.call(this);
		this._context = __context__;
		this._appconf = null;  //应用配置信息
		this._parentApp = null;  //父应用
		this._historyIndex = -1;
		this._params = null;  //传递给应用的参数
		this._workspace = null;  //工作区组件
		this._hotkey = {};  //热键
		this._domTemp = null;
		//this._template = null;  //模版引擎
		this._template = runtime.getTemplate();  //模版引擎
		this._contentPane = null;
		this.__keydown = null;
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
		if(!Application._hotkey){
			//注册系统热键
			this.__keydown = function(ev){
				ev = ev || runtime.getWindow().event;
				var key = ev.keyCode;
				if(key in this._hotkey){  //如果存在热键，则执行回掉函数
					var ret, o = this._hotkey[key];
					switch(o.type){
					case 0: ret = o.agent(ev);break;
					case 1: ret = o.agent[o.func](ev);break;
					case 2: ret = o.func.apply(o.agent, [ev]);break;
					}
					o = null;
					return ret;
				}
			};
			runtime.getDom().addEventListener(runtime.getDocument(), "keydown", this.__keydown, this);
			Application._hotkey = true;
		}
		//this._template = runtime.getTemplate();  //模版引擎
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
		if(this.__keydown){
			this.__keydown = null;
			runtime.getDom().removeEventListener(runtime.getDocument(), "keydown", this.__keydown);
		}
		this._contentPane = null;
		this._template = null;
		this._domTemp = null;
		//runtime.getDocument().onkeydown = null;
		for(var k in this._hotkey){
			delete this._hotkey[k];
		}
		this._workspace = null;
		this._params = null;
		this._parentApp = null;
		this._appconf = null;
		this._context = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.onContentLoad = function(){
	};
	/**
	 * 注册系统热键
	 * @param {Number} keyCode 热键编码
	 * @param {Object} agent 代理对象
	 * @param {Function} func 回调函数
	 */
	this.regHotKey = function(keyCode, agent, func){
		var type;
		if(typeof agent == "function"){
			type = 0;
		}else if(typeof agent == "object" && typeof func == "string"){
			type = 1;
		}else if(typeof agent == "object" && typeof func == "function"){
			type = 2;
		}else{
			runtime.showException("回调参数错误");
			return;
		}
		if(!this._hotkey[keyCode]){
			this._hotkey[keyCode] = {
				"type" : type,
				"agent": agent,
				"func" : func
			};
		}
	};
	this.createDomElement = function(html, doc){
		doc = doc || this._doc;  //可能在不同的document对象中执行
		if(!this._domTemp){
			this._domTemp = doc.createElement("div");
			//doc.documentElement.appendChild(this._domTemp);
		}
		this._domTemp.innerHTML = html.replace(/^[\s\r\n]+/, "");
		return this._domTemp.removeChild(this._domTemp.firstChild);  //childNodes[0]
	};
	this.setParentApp = function(v){
		this._parentApp = v;
	};
	this.getAppManager = function(){
		return runtime.getAppManager();
	};
	this.setHistoryIndex = function(v){
		this._historyIndex = v;
	};
	this.getParams = function(){
		return this._params;
	};
	this.setContentPane = function(v){
		this._contentPane = v;
	};
	this.setContext = function(v){
		this._context = v;
	};
	this.findClass = function(name){
		if(name in this._context){
			return this._context[name];
		}else{
			return null;
		}
	};
	this.findConf = function(type, k){
		var hash = this.__conf[type];
		return hash[k in hash ? k : type];  //默认值和type参数一直
	};
});