_package("alz.layout");

_class("AbstractLayout", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._component = null;  //���øò��ֵ����
		this._self = null;       //���øò��ֵ�DOMԪ��
	};
	this.init = function(obj){
		this._self = obj;
		this._component = obj.__ptr__;
	};
	this.dispose = function(){
		this._self = null;
		this._component = null;
		_super.dispose.apply(this);
	};
	/**
	 * ʹ�õ�ǰ���֣�����һ��Ԫ�ص��ڲ���Ԫ��
	 */
	this.layoutElement = function(){
	};
});