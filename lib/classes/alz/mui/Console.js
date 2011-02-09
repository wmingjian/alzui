_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.LineEdit");

/**
 * ����̨���
 */
_class("Console", Component, function(){
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
		this._app = app;
		var obj = this._createElement2(parent, "div", "aui-Console");
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		//<div class="aui-LineEdit">&gt;<input class="input" type="text" value="" /></div>
		//this.setFont("12px ����");
		/*
		this._lastLine = this._createElement2("div", "aui-LineEdit", {
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
			window.document.addEventListener("keydown", this.__onkeydown, false);
		}else{
			this._self.onkeydown = function(ev){
				return this._ptr._lineEdit.onKeyDown(ev || window.event, this._ptr._lineEdit._self);
			};
		}
		//this._lastLine = this._lineEdit._self;
		this._lineEdit.setIomode("out");
	};
	this.dispose = function(){
		this._interpret = null;
		if(this._lineEdit){
			this._lineEdit.dispose();
			this._lineEdit = null;
		}
		//this._lastLine = null;
		for(var i = 0, len = this._lines.length; i < len; i++){
			this._lines[i] = null;
		}
		this._lines = [];
		this._app = null;
		if(!runtime.ie){
			window.document.removeEventListener("keydown", this.__onkeydown, false);
		}else{
			this._self.onkeydown = null;
		}
		this._self.onblur = null;
		this._self.onfocus = null;
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
	this.resize = function(w, h){
		//this._lineEdit.setWidth(this._input.parentNode.offsetWidth) + "px";
		//this.print(this._self.clientWidth, "dbg");
		//var w = window.document.body.clientWidth - 14 - 100;
		//this._self.style.width = (window.document.body.clientWidth - 14) + "px";
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
	//Ĭ�ϵĽ������ӿ�
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
	this.start = function(agent, fun){
		var _this = this;
		this.getLineInput(function(text){
			fun.call(agent, text);
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
		var line = this._createElement2(this._self, "div", "aui-LineEdit");
		this._lines.push(line);
		return line;
	};
	this.insertLine = function(text, refNode, type){
		var line = this._createElement("div");
		line.className = "aui-LineEdit";
		if(text){
			//line.innerHTML = runtime.encodeHTML(text);
			var span = this._createElement2(line, "span", type);
			span.appendChild(this._createTextNode(text));
			span = null;
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
	 * ��shell�ı���Ļ�ϴ�ӡһ���ı�
	 * @param str {String} Ҫ��ӡ���ļ�����
	 * @param type {String} �ı�������
	 */
	this.print = function(str, type){
		type = type || "sys";
		if(typeof str != "string"){
			str = "" + str;
		}
		this._lineEdit.print(str, type);
	};
	//[TODO]XUL�����²�������
	this.scrollToBottom = function(){
		this._self.scrollTop = this._self.scrollHeight;
	};
});