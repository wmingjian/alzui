_package("alz.core");

_import("alz.core.Plugin");

/**
 * 本地存储接口封装类
 */
_class("LocalStorage", Plugin, function(){
	this._init = function(data){
		_super._init.call(this);
		this._data = data || window.localStorage;
	};
	this.dispose = function(){
		this._data = null;
		_super.dispose.apply(this);
	};
	/**
	 * 当前存储的个数
	 */
	this.getLength = function(){
		return this._data.length;
	};
	/**
	 * 根据索引获取值
	 */
	this.key = function(index){
	};
	/**
	 * 获取 key 的值
	 */
	this.getItem = function(key){
		return this._data.getItem(key);
	};
	/**
	 * 设置 key 的值
	 */
	this.setItem = function(key, value){
		this._data.setItem(key, value);
	};
	/**
	 * 删除 key
	 */
	this.removeItem = function(key){
		this._data.removeItem(key);
	};
	/**
	 * 清除所有的key
	 */
	this.clear = function(){
		this._data.clear();
	};
});