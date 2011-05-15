_package("alz.core");

/**
 * 管理者基类
 */
_class("ManagerBase", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._context = null;
		this._hash = {};
		this._list = [];
	};
	this.create = function(context){
		this._context = context;
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i] = null;
		}
		this._list = [];
		for(var k in this._hash){
			this._hash[k].dispose();
			delete this._hash[k];
		}
		_super.dispose.apply(this);
	};
	this.getContext = function(){
		return this._context;
	};
	this.getItem = function(k){
		return this._hash[k];
	};
});