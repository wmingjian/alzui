_package("alz.core");

_class("LibManager", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._hash = {};
		this._libs = [];
		this._libExt = ".lib.js";  //���ļ�Ĭ�ϵĺ�׺��
	};
	this.dispose = function(){
		//ж�ؿ�ģ��
		/*
		var arr = this._config["lib"].replace(/#/g, "").split(",");
		for(var i = 0, len = arr.length; i < len; i++){
			if(arr[i] == "") continue;
			this._libs[arr[i]].dispose.apply(this);
			delete this._libs[arr[i]];
		}
		arr = null;
		*/
		for(var i = 0, len = this._libs.length; i < len; i++){
			this._libs[i] = null;
		}
		this._libs = [];
		for(var k in this._hash){
			this._hash[k].dispose.apply(runtime);
			delete this._hash[k];
		}
		_super.dispose.apply(this);
	};
	this.getLib = function(name){
		return this._hash[name];
	};
	this.exists = function(name){
		return name in this._hash;
	};
	this.reg = function(name, lib){
		var library = {
			"_inited": false,
			"init": function(){},
			"dispose": function(){}
		};
		if(typeof lib == "function"){  //������core.lib,ui.lib�Ѿ�����Ϊfunction����
			library.init = lib;
		}else if(typeof lib == "object"){
			if(typeof lib.init == "function"){
				library.init = lib.init;
			}
			if(typeof lib.dispose == "function"){
				library.dispose = lib.dispose;
			}
		}
		this._hash[name] = library;
		this._libs.push(library);
		library = null;
	};
	/**
	 * ִ�кͳ�ʼ���ļ�һ����ز�����δ��ʼ���Ŀ����
	 */
	this.initLoadLib = function(){
		for(var i = 0, len = this._libs.length; i < len; i++){
			var lib = this._libs[i];
			if(!lib._inited){
				lib.init.apply(runtime);
				lib._inited = true;
			}
			lib = null;
		}
	};
});