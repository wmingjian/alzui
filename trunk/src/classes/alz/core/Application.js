_package("alz.core");

_import("alz.core.IConfigurable");
_import("alz.core.EventTarget");
_import("alz.core.PluginManager");
//_import("alz.core.LocalStorage");
_import("alz.core.DataModel");
_import("alz.core.TagLib");
_import("alz.template.TemplateManager");
//_import("alz.core.TemplateManager");
_import("alz.core.HistoryManager");

/**
 * [TODO]
 * 1)application 变量在 runtime.createApp 方法返回之后被覆盖了
 */
_class("Application", EventTarget, function(){
	_implements(this, IConfigurable);
	this.__conf__(__context__, {
		"plugin": [  //插件配置列表
		//{"id": "storage" , "clazz": "LocalStorage"   },
			{"id": "model"   , "clazz": "DataModel"      },
			{"id": "taglib"  , "clazz": "TagLib"         },
			{"id": "template", "clazz": "TemplateManager"},
			{"id": "history" , "clazz": "HistoryManager" }
		]
	});
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
		this._pluginManager = null;  //插件管理者
		this._contentPane = null;
		//this._template = null;  //模版引擎
		//this._template = runtime.getTemplate();  //模版引擎
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
	};
	this.init = function(){
		//_super.init.apply(this, arguments);
		this._pluginManager = new PluginManager();
		this._pluginManager.create(this, this.findConf("plugin"));
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
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this.__keydown){
			this.__keydown = null;
			runtime.getDom().removeEventListener(runtime.getDocument(), "keydown", this.__keydown);
		}
		this._pluginManager.dispose();
		this._pluginManager = null;
		this._contentPane = null;
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
	this.initConf = function(tpl){
		//注册数据模型
		this._model.regModels(this.findConf("model"));
		//注册组件的自定义标签
		this._taglib.regTags(this.findConf("tags"));
		//注册模板库
		this._template.reg(runtime.getTplData(tpl));
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
	this.getTpl = function(name){
		return this._template.getTpl(name);
	};
});