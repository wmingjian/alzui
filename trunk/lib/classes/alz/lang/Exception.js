_package("alz.lang");

//import alz.native.Error;

/**
 * “Ï≥£ª˘¿‡
 */
//class Exception(Error){
_class("Exception", "", function(){
	this._init = function(msg){
		_super._init.call(this);
		this._message = this._formatMsg(msg, arguments);
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.toString = function(){
		return this._message;
	};
	this._formatMsg = function(msg, args){
		return msg.replace(/\{(\d+)\}/g, function(_0, _1){
			return args[parseInt(_1) - 1];
		});
	};
});