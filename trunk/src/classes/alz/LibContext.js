/**
 * 命名空间和上下文环境的概念在这里并不严格区分，这个特殊的类的主要目的就是创建
 * 多个上下文环境对象并由此构造出一个个的命名空间来，并及由上下文环境对象区别于
 * 匿名函数局部作用域的可操作性，设计了OOP模拟原理。
 *
 * _package,_import,_class三个OOP关键特性的重要程度是反过来的。
 */
/*
//标准的_class声明形式，不过现在还不是在真实的上下文环境下
_package("alz.core");
_class("Context", null, function(){
});
*/
function LibContext(name, rt){
	this._init.apply(this, arguments);
}
function contextImp(/*_super*/){
	/**
	 * 核心类包定义
	 * 在这里不直接定义为 WebRuntime 的成员，主要目的是为了解决在当前的命名空间
	 * 内不可以直接通过 alz 引用脚本类的问题。
	 * 定义在原型上，是为了所有上下文环境共享同一个对象
	 */
	this.alz         = {};  //保证所有命名空间下指向同一个根包
	this.__classes__ = {};  //所有的类
	this._init = function(name, rt){
		this.__name = name || "anonymous";  //Context的名字
		this.__context__ = this;
		this.runtime = rt || null;  //这个是将要导出的全局唯一对象
		this.application = null;  //针对每一个应用的唯一 application 对象
	};
	this._package = function(name){
		__pkgName = name;  //记住当前所在的包
	};
	this._import = function(className){
		var clazz = __all__[className];
		var name = className.split(".").pop();
		if(!(name in this)){
			this[name] = clazz;  //短名
		}
		//if(!(className in this)){
		//	this[className] = clazz;  //全名
		//}
	};
	/**
	 * 模拟类的定义
	 * @param {String} className 类的名字
	 * @param {Class} superClass 父类对象
	 * @param {Function} classImp 类的实现代码
	 */
	this._class = function(className, superClass, classImp){
		var superProto;
		if(superClass === null){  //默认继承 JS 的原生根对象
			superProto = null;  //保证根类 _super 属性为 null
			superClass = Object;  //[TODO]如果框架没有扩展Object，则无需继承Object
		}else{
			if(superClass === ""){
				superClass = this.__classes__["alz.lang.AObject"];
			}
			superProto = superClass[__proto];
		}
		return new Clazz(this, __pkgName, className, superClass, superProto, classImp)._clazz;
	};
	/**
	 * 模拟接口的定义
	 * @param {String} name 接口的名字
	 * @param {Interface} superInterface 父接口
	 * @param {Function} imp 接口的实现，可以是虚实现
	 */
	this._interface = function(name, superInterface, imp){
		if(!/^I[A-Z]\w+$/.test(name)){
			//runtime.error("接口名不符合命名规范");
			throw "接口名不符合命名规范";
		}
		var fullClassName = __pkgName + "." + name;
		imp.__name__ = name;
		__all__[fullClassName] = imp;
		__interfaces[fullClassName] = imp;
		this.alz[name] = imp;
		this[name] = imp;
	};
	/**
	 * 定义类的抽象方法，框架会保证子类必须实现该方法
	 */
	this._abstract = function(proto, name, methodImp){
		proto[name] = methodImp || __empty;
	};
	this._implements = function(proto/*, interfaces*/){
		var len = arguments.length;
		if(len < 2){
			window.alert("[_implements]arguments.length error");
		}else{
			var clazz = proto.__cls__;
			var imps = clazz._imps;
			for(var i = 1; i < len; i++){
				var func = arguments[i];
				var obj = new func();  //隐式接口对象[TODO]如果没有属性，则重复实例化了
				imps.push(obj);  //注册接口实现
				clazz.initVMethods(obj, "vlist", true);
			}
		}
	};
	/**
	 * 为类提供一个扩展机制
	 * @param {String} className 被扩展的类的名字
	 * @param {Function} extImp 扩展的实现代码
	 * [TODO]可以按照这个扩展的工作原理，并且通过替换原型上相关的方法，为每一个类
	 * 设计扩展一种机制。
	 * [TODO]接口和扩展的区别？定义和执行时机不同，对原类的依赖性不同
	 * WebRuntime.regExt = function(clazz){};
	 */
	this._extension = function(className, extImp){
		var name = __pkgName + "." + className;
		if(!(name in this.__classes__)){
			throw "类" + name + "还不存在，请检查包和类名的定义是否正确";
		}
		var clazz = this.__classes__[name].__cls__;
		//var obj = new extImp();  //创建扩展的一个实例（只需创建一个）
		var obj = {
			"__conf__": __empty  //[TODO]以后用于保存类扩展中定义的配置数据
		};
		extImp.call(obj);  //调用扩展实现
		delete obj.__conf__;  //删除防止覆盖
		clazz._exts.push(obj);  //注册类扩展
		clazz.initVMethods(obj, "elist");
		//如果是扩展的WebRuntime类，保证全局唯一对象runtime能够被扩展
		//[TO-DO]onContentLoad之后再执行WebRuntime的类扩展
		if(className == "WebRuntime"){
			if(obj._init){
				obj._init.call(this.runtime);
			}
		}
		//obj = null;
		//p = null;
	};
	/*
	this.isArray = function(a){
		return __toString.call(a) === "[object Array]";
	};
	this.isPlainObject = function(a){
		if(!a || a === window || a === document || a === document.body){
			return false;
		}
		if(this.isPrimitive(a)){
			return false;
		}
		return "isPrototypeOf" in a && __toString.call(a) === "[object Object]";
	};
	this.isEmptyObject = function(o){
		for(var a in o){
			return false;
		}
		return true;
	};
	this.isWindow = function(a){
		return a && typeof a === "object" && "setInterval" in a;
	};
	this.isPrimitive = function(b){
		var a = typeof b;
		return !!(b === undefined || b === null || a == "boolean" || a == "number" || a == "string");
	};
	*/
}

/*
var Context = createClass();  //这其实是一个类定义
var _p = Context[__proto];
//contextImp.apply(_p);  //实现原型上的方法
_p.__apply__ = contextImp;
_p.__apply__(Context);
delete _p.__apply__;
delete _p;
//cxt.__name = name;
//cxt.runtime = null;
//contextImp.apply(cxt);
//this._init(name, null);
//----cxt._classes[fullName] = clazz;  //当前类本身
//引入 Context 类，保证以后使用和其他类一样是规范的
//cxt.alz["alz.core.Context"] = Context;
//cxt.Context = Context;
//----cxt._import(fullName);  //从第一个实例中引入
//runtime._contextList[name] = cxt;  //注册上下文环境
//清理上下文环境类
//delete clazz[__proto]._classes;
//delete this;
*/

return {
	//createContext: function(name/*, libs*/){},
	/**
	 * 这个函数只会被调用一次，仅用于创建核心 LibContext 实例，即第一个上下文环境
	 * 对象，是框架的自举(bootstrap)函数
	 */
	regLib: function(name, appName, libImp){
		//[TODO]禁止其他lib文件引入LibContext类，可以防止LibContext类被滥用
		contextImp.apply(LibContext[__proto]);
		var cxt = new LibContext(name);
		cxt._package("alz");
		cxt._class("LibContext", null, contextImp);  //保证aui命名空间下可以访问到
		libImp(cxt);
		var clazz = cxt.__context__["WebRuntime"];
		var rt = cxt.runtime = __global.runtime = new clazz();
		rt.init(__global, cxt);
	}
};