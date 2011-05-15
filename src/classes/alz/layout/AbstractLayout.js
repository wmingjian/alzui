_package("alz.layout");

_class("AbstractLayout", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._component = null;  //启用该布局的组件
		this._self = null;       //启用该布局的DOM元素
	};
	this.init = function(obj){
		this._self = obj;
		this._component = obj.__ptr__;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self = null;
		this._component = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * 使用当前布局，布置一个元素的内部子元素
	 */
	this.layoutElement = function(){
	};
});