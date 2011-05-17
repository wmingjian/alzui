_package("alz.core");

_import("alz.core.EventBase");

/**
 * 数据变化事件
 */
_class("DataChangeEvent", EventBase, function(){
	this._init = function(act, data){
		_super._init.call(this);
		this._type = "dataChange";
		this.act = act;
		this.data = data;
	};
});