_package("alz.template");

/**
 * 模板解析异常类
 */
_class("ParseError", "", function(){
	this._init = function(name, line, message){
		_super._init.call(this);
		this.name = name;
		this.line = line;
		this.message = message;
	};
	this.toString = function(){
		return "TrimPath template ParseError in " + this.name + ": line " + this.line + ", " + this.message;
	};
});