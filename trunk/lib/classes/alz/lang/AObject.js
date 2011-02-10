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
	this.destroy = function(){
	};
	/**
	 * ��ȡ������ַ�����ʾ
	 * @return {String}
	 */
	this.toString = function(){
		if(this._className){
			return "[object " + this._className + "]";
		}
		return "[object Object]";
	};
	//����ʱ�����������ڶ��ƿ��ʱ���ʵ���������һЩ����
	/**
	 * ��ȡ�����Ӧ����
	 * @return {Class}
	 */
	this.getClass = function(){
		//return this._class;
		//return eval(this._className);
		//return __class__;  //error!!!���������Ļ����е�����࣬��this._className��Ӧ����
		return __classes__[this._className];  //����ʹ��eval����
		//return runtime._classManager.getClassByName(this._className).getClazz();
	};
	/**
	 * ��ȡ�����Ӧ�ĸ���
	 * @return {Class}
	 */
	this.getSuperClass = function(){
		return this.getClass()._super.getClass();
	};
	/**
	 * ��ȡ���������
	 * @return {String}
	 */
	this.getClassName = function(){
		return this._className;
	};
	/**
	 * ���ö��������
	 * @param {Object} v ����
	 */
	this.setClassName = function(v){
		this._className = v;
	};
	/**
	 * ��ȡ���������
	 * @param {String} name ������
	 * @return {Object}
	 */
	this.getProperty = function(name){
		var key = "get" + name.capitalize();
		if(typeof this[key] == "function"){
			return this[key]();
		}
		throw new Error("No such property, " + name);
	};
	/**
	 * ���ö��������
	 * @param {String} name ������
	 * @param {Object} value ����ֵ
	 */
	this.setProperty = function(name, value){
		var key = "set" + name.capitalize();
		if(typeof this[key] == "function"){
			this[key](value);
		}else{
			throw new Error("No such property, " + name);
		}
	};
	//ģ�� instanceof, typeof ������
	/**
	 * �жϵ�ǰ�����Ƿ�ĳ�����ʵ��
	 * ���� prototype ������
	 * @param {Class|String} clazz ������������
	 * @return {Boolean}
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