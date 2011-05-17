_package("alz.core");

/**
 * 事件基类
 */
_class("EventBase", "", function(){
	this._init = function(type, data){
		_super._init.call(this);
		this._type = type || "";
		if(data){
			for(var k in data){
				this[k] = data[k];
			}
		}
	};
	this.getType = function(){
		return this._type;
	};
});