_package("alz.mui");

/**
 * 组件可设计性接口
 */
_interface("IDesignable", "", function(){
	this._init = function(){
		this._layer = null;
	};
	this.setLeft = function(v){
		this._layer.style.left = v + "px";
	};
	this.setTop = function(v){
		this._layer.style.top = v + "px";
	};
	this._setWidth = function(v){
		this._layer.style.width = v + "px";
	};
	this._setHeight = function(v){
		this._layer.style.height = v + "px";
	};
});