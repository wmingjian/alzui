_package("alz.core");

/**
 * ���Application�Ĳ������
 */
_class("Plugin", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._app = null;  //���������Ӧ��
		this._name = "";   //���������
	};
	this.create = function(name, app){
		this._app = app;
		this._name = name;
	};
	this.reinit = function(){
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.getName = function(){
		return this._name;
	};
});