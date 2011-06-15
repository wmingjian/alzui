_package("alz.lang");

/**
 * @class AObject
 * @extends Object
 * @desc 根类 AObject
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
	/**
	 * @method dispose
	 * @desc 析构方法
	 */
	this.dispose = function(){
		//[memleak]delete AObject.__hash__[this.__hashid__];
		this._disposed = true;
	};
	this.destroy = function(){
	};
	/**
	 * @method toString
	 * @return {String}
	 * @desc 对象的字符串形式，为[object xxx]
	 */
	this.toString = function(){
		if(this._className){
			return "[object " + this._className + "]";
		}
		return "[object Object]";
	};
	//运行时方法，可以在定制框架时，适当的缩减掉一些方法
	/**
	 * 获取对象对应的类
	 * @return {Class}
	 */
	this.getClass = function(){
		//return this._class;
		//return eval(this._className);
		//return __class__;  //error!!!不是上下文环境中的这个类，是this._className对应的类
		//return __classes__[this._className];  //避免使用eval方法
		return this.__cls__.getClass();
		//return runtime._classManager.getClassByName(this._className).getClazz();
	};
	/**
	 * 获取对象对应的父类
	 * @return {Class}
	 */
	this.getSuperClass = function(){
		return this.__cls__.getSuperClass();
	};
	/**
	 * @method getClassName
	 * @return {String}
	 * @desc 获取对象的类名
	 */
	this.getClassName = function(){
		return this._className;
	};
	/**
	 * @method setClassName
	 * @param {Object} v 类名
	 * @return {String} v
	 * @desc 设置对象的类名
	 */
	this.setClassName = function(v){
		this._className = v;
	};
	/**
	 * @method getProperty
	 * @param {String} name 属性名
	 * @return {Object}
	 * @desc 获取对象的指定的属性值
	 */
	this.getProperty = function(name){
		var key = "get" + name.capitalize();
		if(typeof this[key] == "function"){
			return this[key]();
		}
		throw new Error("No such property, " + name);
	};
	/**
	 * @method setProperty
	 * @param {String} name 属性名
	 * @param {Object} value 属性值
	 * @desc 设置对象的指定的属性
	 */
	this.setProperty = function(name, value){
		var key = "set" + name.capitalize();
		if(typeof this[key] == "function"){
			this[key](value);
		}else{
			throw new Error("No such property, " + name);
		}
	};
	//模拟 instanceof, typeof 操作符
	/**
	 * @method instanceOf
	 * @param {Class|String} clazz 类或者类的名称
	 * @return {Boolean}
	 * @desc 判断当前对象是否某个类的实例，根据 prototype 链工作
	 */
	this.instanceOf = function(clazz){
		/*
		//原始的算法，通过比较字符串实现，效率相对较低
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
		return this.__cls__.contains(clazz);
	};
	/**
	 * 获取当前对象的类型
	 * @return {String} 对象类型的字符串表示
	 */
	this.typeOf = function(){
		return this._className;
	};
});