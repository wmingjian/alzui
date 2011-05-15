_package("alz.debug.pane");

_import("alz.core.ActionManager");
_import("alz.mui.Console");
_import("mail.ui.Pane");

/**
 * 调试面板组件
 */
_class("PaneDebug", Pane, function(){
	this._init = function(){
		_super._init.call(this);
		this._log = null;
		this._console = null;
		this._actionContainer = null;
	};
	this.create = function(parent, app){
		parent = parent || window.document.body;
		this.setParent2(parent);
		if(app){
			this._app = app;
			this._template = app._template;
			this._actionManager = new ActionManager();
			this._actionManager.init(this);
		}
		var obj = this._app.createDomElement(this._template.invoke("debug.tpl"));
		obj.style.display = "none";
		if(parent){
			parent.appendChild(obj);
		}
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._log = $("debug_log");  //this._self.childNodes[1].childNodes[0];
		this._actionContainer = $("debug_tree");  //this._self.childNodes[1].childNodes[1];
		this.initComponents(this._self);
		this.createConsole(this._log);
	};
	this.dispose = function(flag){
		if(this._disposed) return;
		this._actionContainer = null;
		this._console.dispose();
		this._console = null;
		this._log = null;
		this._actionManager.dispose();
		_super.dispose.apply(this, arguments);  //(flag)
	};
	this.getLogTime = function(){
		return "[" + new Date().toMyString(3) + "]";  //hh:mm:ss
	};
	this.createConsole = function(parent){
		this._console = new Console();
		this._console.create(parent, null/*this*/);
		this._console.setHeight(170);
		this._console._self.setAttribute("_align", "bottom");
		var _this = this;
		//打印之前缓存的日志信息
		for(var i = 0, len = runtime._log.length; i < len; i++){
			this._console.print(runtime._log[i] + "\n", "log");
		}
		//重定义系统级输出函数
		runtime.log = function(msg){
			//_this.log(msg);
			_this._console.print(_this.getLogTime() + msg + "\n", "log");
		};
		runtime.warning = function(msg){
			_this._console.print(msg + "\n", "warn");
		};
		runtime.error = function(msg){
			_this._console.print(msg + "\n", "err");
		};
		//控制台开始实际工作
		runtime.warning(this.getLogTime() + "Now start the actual work of the console.");
		this._console.start(this, function(text){
			this.interpret(text);
		});
	};
	this.interpret = function(text){
		try{
			var v = null;
			with(__context__){
				v = eval(text);
			}
			if(typeof v == "object" && v !== null){
				this._console.print(runtime.forIn(v).join("\n") + "\n");
			}
		}catch(ex){
			//window.alert(ex.message);
			this._console.print(runtime.forIn(ex).join("#") + "\n");
			return false;
		}
	};
	/*
	this.log = function(str){
		this._createElement2(this._log, "div", "", {
			"borderBottom": "1px solid #DDDDDD",
			"whiteSpace"  : "nowrap",
			"color"       : "black",
			"font"        : "12px 宋体",
			"innerHTML"   : runtime.encodeHTML(str)
		});
	};
	*/
	this.doAction = function(action, sender){
		switch(action){
		case "test_component": this.do_test_component(action, sender);break;
		case "reg_suc"       : this.do_reg_suc(action, sender);break;
		case "update_folders": this.do_update_folders(action, sender);break;
		case "plugin_demo"   : this.do_plugin_demo(action, sender);break;
		default              : return this._app.doAction.apply(this._app, arguments);
		}
		return false;
	};
	/**
	 * 组件测试功能
	 */
	this.do_test_component = function(action, sender){
		runtime.log("do_test_component");
	};
	/**
	 * 邮箱注册开通流程
	 */
	this.do_reg_suc = function(action, sender){
		this._app.navigate({
			"url"   : "/uc/gettpl.php?t=reg",
			"title" : "邮箱注册",
			"action": action
		});
	};
	/**
	 * 刷邮件夹列表
	 */
	this.do_update_folders = function(action, sender){
		this._app.config.updateFolders(false);
	};
	/**
	 * 插件演示
	 */
	this.do_plugin_demo = function(action, sender){
		//var url = "http://www.sinaimg.cn/rny/plugins/greeting/greeting.js";
		//var url = "http://www.sinaimg.cn/sinamail-dev/plugins/greeting/greeting.js";
		//var url = mailinfo["url_greeting"];
		//runtime.loadPlugin(url, function(plugin){});
		//this.loadJs(url, function(){
			var obj = {};
			var plugin = runtime._plugins["valentine"];
			if(plugin.create(obj)){  //插件创建成功的话
				plugin.init();
			}
			plugin = null;
			obj = null;
		//});
	};
});