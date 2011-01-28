_package("alz.lang");

/**
 * ���� AObject
 */
_class("AObject", null, function(){
	//[memleak]AObject.__hash__ = {};
	//[memleak]AObject.__id__ = 0;
	//this._className = "";  //static property
	this._init = function(){
		//Object.call(this);
		this._disposed = false;
		//[memleak]this.__hashid__ = "_" + (AObject.__id__++);
		//[memleak]AObject.__hash__[this.__hashid__] = this;
	};
	this.dispose = function(){
		//[memleak]delete AObject.__hash__[this.__hashid__];
		this._disposed = true;
	};
	this.toString = function(){
		if(this._className){
			return "[object " + this._className + "]";
		}
		return "[object Object]";
	};
	//����ʱ�����������ڶ��ƿ��ʱ���ʵ���������һЩ����
	this.getClass = function(){
		//return this._class;
		//return eval(this._className);
		//return __class__;  //error!!!���������Ļ����е�����࣬��this._className��Ӧ����
		return __classes__[this._className];  //����ʹ��eval����
		//return runtime._classManager.getClassByName(this._className).getClazz();
	};
	this.getSuperClass = function(){
		return this.getClass()._super.getClass();
	};
	this.getClassName = function(){
		return this._className;
	};
	this.setClassName = function(v){
		this._className = v;
	};
	this.getProperty = function(sPropertyName){
		var getterName = "get" + sPropertyName.capitalize();
		if(typeof this[getterName] == "function"){
			return this[getterName]();
		}
		throw new Error("No such property, " + sPropertyName);
	};
	this.setProperty = function(sPropertyName, oValue){
		var setterName = "set" + sPropertyName.capitalize();
		if(typeof this[setterName] == "function"){
			this[setterName](oValue);
		}else{
			throw new Error("No such property, " + sPropertyName);
		}
	};
	//ģ�� instanceof, typeof ������
	/**
	 * �жϵ�ǰ�����Ƿ�ĳ�����ʵ��
	 * ���� prototype ������
	 * @param clazz {Class|String} ������������
	 */
	this.instanceOf = function(clazz){
		/*
		//ԭʼ���㷨��ͨ���Ƚ��ַ���ʵ�֣�Ч����Խϵ�
		for(var p = this; p && p.getClassName() != "alz.lang.Object"; p = p.getClass()._super){
			if(!p._clazz) window.alert("p._clazz");
			if(!p._clazz._super) window.alert("p._clazz._super");
			if(p._className == clazz) return true;
		}
		*/
		if(typeof clazz == "string"){
			clazz = __classes__[clazz];
			//clazz = runtime._classManager.getClassByName(this._className).getClazz();
		}
		//���� _clazz._super ��
		for(var obj = this; obj; obj = obj._clazz._super){
			if(obj._clazz == clazz) return true;
		}
		return false;
	};
	/**
	 * ��ȡ��ǰ���������
	 * @return {String} �������͵��ַ�����ʾ
	 */
	this.typeOf = function(){
		return this._className;
	};
});