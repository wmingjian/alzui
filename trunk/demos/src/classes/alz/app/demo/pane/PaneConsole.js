_package("alz.app.demo.pane");

_import("alz.mui.Pane");
_import("alz.mui.Console");

/**
 * 控制台面板
 */
_class("PaneConsole", Pane, function(){
	this._init = function(){
		_super._init.call(this);
		this._tpl = "pane_console.xml";
		this._console = null;
	};
	this.create = function(parent, app){
		this.setParent2(parent);
		this.setApp(app);
		//var obj = runtime.dom.createDomElement(this._app._template.getTpl(this._tpl));
		//parent.appendChild(obj);
		var obj = this.createTplElement(parent, this._tpl);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this.createConsole();
	};
	this.dispose = function(){
		this._console.dispose();
		this._console = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getLogTime = function(){
		return "[" + new Date().toMyString(3) + "]";  //hh:mm:ss
	};
	this.createConsole = function(){
		this._console = new Console();
		this._console.create(this._self, null/*this*/);
		this._console.resize(640, 100);
		//this._console._self.setAttribute("_align", "bottom");
		var _this = this;
		//打印之前缓存的日志信息
		for(var i = 0, len = runtime._log.length; i < len; i++){
			this._console.print(runtime._log[i] + "\n", "log");
		}
		//重定义系统级输出函数
		runtime.log = function(msg){
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
			//this._console.print(runtime.forIn(ex).join("#") + "\n");
			this._console.print(ex.name + "," + ex.message + "\n");
			return false;
		}
	};
});