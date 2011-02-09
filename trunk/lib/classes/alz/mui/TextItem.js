_package("alz.mui");

_import("alz.mui.Component");

_class("TextItem", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._type = "sys";  //当前文本的类型
		this._text = "";     //文本内容
		this._active = false;  //当前文本是否处于活动状态之下
		this._cursor = -1;     //如果处在活动状态下，当前光标位置
		//this.create(parent, type, text);
	};
	this.create = function(parent, type, text){
		this._parent = parent;
		this._type = type;
		this._text = text;
		var obj = window.document.createElement("span");
		obj.className = this._type;
		parent._self.appendChild(obj);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this.update();
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.getTextLength = function(){
		return this._text.length;
	};
	this.getText = function(){
		return this._text;
	};
	this.setText = function(text){
		this._text = text;
		this._cursor = text.length;
		this.update();
	};
	this.getCursor = function(){
		return this._cursor;
	};
	this.setCursor = function(v){
		this._cursor = v;
		this.update();
	};
	this.appendText = function(text){
		if(this._cursor == -1 || this._cursor == this._text.length){
			this._text += text;
		}else{
			this._text = this._text.substr(0, this._cursor) + text + this._text.substr(this._cursor);
		}
		this._cursor += text.length;
		this.update();
	};
	this.removeChar = function(n){
		if(n == -1){  //backspace
			this._text = this._text.substr(0, this._cursor - 1) + this._text.substr(this._cursor);
			this._cursor--;
		}else{  //del
			this._text = this._text.substr(0, this._cursor) + this._text.substr(this._cursor + 1);
		}
		this.update();
	};
	this.update = function(){
		if(!runtime._host.xul){
			this._self.innerHTML = this.getInnerHTML();
		}else{
			while(this._self.hasChildNodes()){
				this._self.removeChild(this._self.childNodes[0]);
			}
			if(this._active && this._type == "in"){
				var type = this._parent.getCursorType();
				var cursor = type ? 'cursor ' + type : 'cursor';
				this._self.appendChild(this._createTextNode(this._text.substr(0, this._cursor)));
				var span = this._createElement2(this._self, "span", cursor);
				span.appendChild(this._createTextNode(this._text.charAt(this._cursor) || " "));
				this._self.appendChild(this._createTextNode(this._text.substr(this._cursor + 1)));
			}else{
				this._self.appendChild(this._createTextNode(this._text));
			}
		}
	};
	/*
	var html = '<span class="sys">' + runtime.encodeHTML(this._text.substr(0, this._start)) + '</span>'
		+ '<span class="in">'
		+ runtime.encodeHTML(this._text.substr(this._start, this._col))
		+ '<span class="cursor">' + runtime.encodeHTML(this._text.charAt(this._col) || " ") + '</span>'
		+ this._text.substr(this._col + 1)
		+ '</span>';
	this._self.innerHTML = html;
	*/
	this.toHTML = function(){
		return '<span class="' + this._type + '">' + this.getInnerHTML() + '</span>';
	};
	this.getInnerHTML = function(){
		if(this._active && this._type == "in"){
			var type = this._parent.getCursorType();
			var cursor = type ? 'cursor ' + type : 'cursor';
			return runtime.encodeHTML(this._text.substr(0, this._cursor))
				+ '<span class="' + cursor + '">'
				+ runtime.encodeHTML(this._text.charAt(this._cursor) || " ")
				+ '</span>'
				+ this._text.substr(this._cursor + 1);
		}else{
			return runtime.encodeHTML(this._text);
		}
	};
	this.deactivate = function(){
		this._active = false;
		this._cursor = -1;
	};
	this.activate = function(){
		this._active = true;
		if(this._type == "in"){
			this._cursor = this._text.length;
		}
	};
});