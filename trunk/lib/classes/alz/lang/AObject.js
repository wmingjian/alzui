_package("alz.lang");

/**
 * 根类 AObject
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
	//运行时方法，可以在定制框架时，适当的缩减掉一些方法
	this.getClass = function(){
		//return this._class;
		//return eval(this._className);
		//return __class__;  //error!!!不是上下文环境中的这个类，是this._className对应的类
		return __classes__[this._className];  //避免使用eval方法
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
	//模拟 instanceof, typeof 操作符
	/**
	 * 判断当前对象是否某个类的实例
	 * 根据 prototype 链工作
	 * @param clazz {Class|String} 类或者类的名称
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
		//查找 _clazz._super 链
		for(var obj = this; obj; obj = obj._clazz._super){
			if(obj._clazz == clazz) return true;
		}
		return false;
	};
	/**
	 * 获取当前对象的类型
	 * @return {String} 对象类型的字符串表示
	 */
	this.typeOf = function(){
		return this._className;
	};
});