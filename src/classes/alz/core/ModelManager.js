_package("alz.core");

/**
 * 数据模型管理者
 */
_class("ModelManager", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._hash = {};
		this._list = [];
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
	/**
	 * 添加一个数据模型（注册）
	 * @param item {AbstractModel}
	 */
	this.appendItem = function(item){
		
	};
	/**
	 * 根据id获取并返回一个数据模型的实例
	 */
	this.getItem = function(id){
		return this._hash[id];
	};
});