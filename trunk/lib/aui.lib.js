/**
 * alzui-mini JavaScript Framework, v0.0.8
 * Copyright (c) 2009 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
(function(__global){  // Using a closure to keep global namespace clean.

//import alz.changelog;
/*<file name="alz/init.js">*/
/*
if(typeof __global.runtime != "undefined"){  //内嵌模式，重新初始化
	if(!__global.confirm("alzui系统已经加载完毕，确认要重新初始化吗？")){
		return;
	}else{
		__global.runtime.dispose();
		__global.runtime = null;
		if(application){
			application = null;
		}
	}
}
*/

var __version = "0.0.8";  //当前版本信息，格式:"主版本号.副版本号.修订版本号"
var __buildtime = 1263906485218;
var __start = new Date().getTime();  //记录开始时间
var __proto = "prototype";
var __inDeclare = false;  //标识是否处于类声明过程中
/**
 * 创建并返回类的原型或者说类对象自身
 */
function __newClass(){
	//返回一个函数对象等价于创建一个Function实例，所以以后的模拟每个类的构造函数才
	//会是不同的function对象，如果使用相同的function对象OO模拟在继承时将存在致命的
	//问题，其他的像prototype,jQuery,mootools等，模拟OO的核心思想都和这里是一致的。
	//return new Function("this._init.apply(this, arguments);");  //anonymous code
	return function(){  //"F" + new Date().getTime()
		//如果处于类声明过程中，直接返回，仅仅建立原型链，不需要调用实际的构造函数
		if(__inDeclare) return;

		//检查构造函数是否存在，基于类的严格性只做有无的检查，不做是否是函数的检查，
		//以后为了提高性能可以考虑忽略该检查
		if(typeof this._init == "function"){
			//调用OOP模拟中实际的构造函数，并传递参数
			this._init.apply(this, arguments);
		}/*else{
			throw "类 " + name + " 定义中缺少构造函数 _init";
		}*/

		//在以后高级的UI组件类中this.create方法是类内部属性实际构造的地方，构造函数其
		//实只是一个属性声明的集中地，真正的create动作在这个方法内部实现，并期望它不
		//仅仅是一个参数。
		//如果参数个数不为0，执行 create 方法
		if(arguments.length != 0 && typeof this.create == "function"){  //this._className.indexOf("alz.ui.") == 0
			this.create.apply(this, arguments);  //调用create方法并传递参数
		}
	};
}
/**
 * 这个函数只会被调用一次，仅用于创建核心 Context 实例，即第一个上下文环境对象
 */
function createContext(name/*, libs*/){  //bootstrap
	/**
	 * 核心类包定义
	 * 在这里不直接定义为 WebRuntime 的成员，主要目的是为了解决在当前的命名空间
	 * 内不可以直接通过 alz 引用脚本类的问题。
	 */
	var alz = {};  //定义在原型上，保证所有命名空间下指向同一个根包
	var _classes = {};  //所有的类
	var _pkg = "";      //当前类（或接口,扩展）所在的包的名字
	//var _exts = {};     //所有类的扩展
	var _cxt = null;

	function initNative(){
		var hash = {
			"Object"   : Object,
			"Array"    : Array,
			"Boolean"  : Boolean,
			"Number"   : Number,
			"String"   : String,
			"RegExp"   : RegExp,
			"Function" : Function,
			"Date"     : Date,
			"Math"     : Math,
			"Error"    : Error
			//"ActiveXObject"   : ActiveXObject,
			//"Dictionary"      : Dictionary,
			//"Enumerator"      : Enumerator,
			//"FileSystemObject": FileSystemObject,
			//"Global"          : Global,
			//"VBArray"         : VBArray
		};
		for(var k in hash){
			_classes["alz.native." + k] = hash[k];
		}
		var _p = String[__proto];
		_p.capitalize = function(){
			return this.charAt(0).toUpperCase() + this.substr(1);
		};
		_p = Array[__proto];
		/**
		 * 移除数组中的第i个对象
		 */
		_p.removeAt = function(i){
			this.splice(i, 1);
		};
		if(!_p.pop){  // IE 5.x fix from Igor Poteryaev.
			_p.pop = function(){
				var UNDEFINED;
				if(this.length === 0){
					return UNDEFINED;
				}
				return this[--this.length];
			};
		}
		if(!_p.push){  // IE 5.x fix from Igor Poteryaev.
			_p.push = function(){
				for(var i = 0, len = arguments.length; i < len; i++){
					this[this.length] = arguments[i];
				}
				return this.length;
			};
		}
		/**
		 * 在数组对象中搜索o的索引
		 */
		_p.indexOf = function(o){
			for(var i = 0, len = this.length; i < len; i++){
				if(this[i] == o)return i;
			}
			return -1;
		};
		_p = Date[__proto];
		_p.toMyString = function(type){
			var y = this.getFullYear();
			var m = this.getMonth() + 1;
			var d = this.getDate();
			var h = this.getHours();
			var n = this.getMinutes();
			var s = this.getSeconds();
			switch(type){
			case 1:  //2007年2月2日
				return y + "年" + m + "月" + d + "日";
			case 2:  //2007-2-2
				return y + "-" + m + "-" + d;
			case 3:  //0:01:05
				return h + ":" + n + ":" + s;
			case 4:  //00:01
				return n + ":" + s;
			case 5:  //2007-02-02
				return y
					+ "-" + (m < 10 ? "0" + m : m)
					+ "-" + (d < 10 ? "0" + d : d);
			case 6:  //0702
				return ("" + y).substr(2) + (m < 10 ? "0" + m : m);
			case 7:  //000105
				return "" + (h < 10 ? "0" + h : h)
					+ (n < 10 ? "0" + n : n)
					+ (s < 10 ? "0" + s : s);
			case 8:  //00:01 123
				return n + ":" + s + " " + this.getMilliseconds();
			case 9:  //2007年2月2日 0时01分05秒
				return y + "年" + m + "月" + d + "日 "
					+ h + "时"
					+ (n < 10 ? "0" + n : n) + "分"
					+ (s < 10 ? "0" + s : s) + "秒";
			case 10:  //2008年4月22日(星期二) 下午02:29
				return y + "年" + m + "月" + d + "日"
					+ "(星期" + ("日一二三四五六".charAt(this.getDay())) + ") "
					+ (["上午","下午"][this.getHours() < 12 ? 0 : 1])
					+ (h < 10 ? "0" + h : h) + ":"
					+ (n < 10 ? "0" + n : n);
			case 11:  //2007-2-2 0:01
				return y + "-" + m + "-" + d + " " + h + ":" + (n < 10 ? "0" + n : n);
			case 0:  //2007-2-2 0:01:05
			default:
				return y + "-" + m + "-" + d + " " + h + ":" + n + ":" + s;
			}
		};
		/**
		 * IE5.01不支持apply,call方法，所以在此需要自定义来修正它们
		 * 本框架模拟OOP严重依赖这两个东东，不得不重视它们的存在，同时也把框架对浏览器和
		 * JS引擎的版本要求降到了足够低的程度！^_^
		 */
		_p = Function[__proto];
		if(!_p.apply){
			_p.apply = function(thisObj, args){
				thisObj.__apply__ = this;
				var a = [];
				//if(args){
				if(arguments.length == 2 && args instanceof Array){
					for(var i = 0, len = args.length; i < len; i++){
						a[i] = args[i];
					}
				}
				var ret;
				switch(a.length){
				case 0: ret = thisObj.__apply__(); break;
				case 1: ret = thisObj.__apply__(a[0]); break;
				case 2: ret = thisObj.__apply__(a[0], a[1]); break;
				case 3: ret = thisObj.__apply__(a[0], a[1], a[2]); break;
				case 4: ret = thisObj.__apply__(a[0], a[1], a[2], a[3]); break;
				case 5: ret = thisObj.__apply__(a[0], a[1], a[2], a[3], a[4]); break;
				case 6: ret = thisObj.__apply__(a[0], a[1], a[2], a[3], a[4], a[5]); break;
				case 7: ret = thisObj.__apply__(a[0], a[1], a[2], a[3], a[4], a[5], a[6]); break;
				case 8: ret = thisObj.__apply__(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]); break;
				case 9: ret = thisObj.__apply__(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]); break;
				default:
					var arr = [];
					for(var i = 0, len = a.length; i < len; i++){
						arr[i] = "a[" + i + "]";
					}
					ret = eval("thisObj.__apply__(" + arr.join(",") + ");");
				}
				delete thisObj.__apply__;
				return ret;
			};
		}
		if(!_p.call){
			_p.call = function(thisObj){
				var args = [];  //copy all arguments but the first
				for(var i = 1, len = arguments.length; i < len; i++){
					args[i - 1] = arguments[i];
				}
				return this.apply(thisObj, args);
			};
		}
		_p = null;
	}
	function _init(name, rt){
		this.__name = name || "anonymous";  //Context的名字
		this.__context__ = this;
		this.runtime = rt || null;  //这个是将要导出的全局唯一对象
		this.application = null;  //针对每一个应用的唯一 application 对象
		//this._super = null;  //当前类的父类
	}
	function _package(sPackage){
		_pkg = sPackage;  //记住当前所在的包
	}
	/**
	 * 模拟类的定义
	 * @param {String} className 类的名字
	 * @param {Class} superClass 父类对象
	 * @param {Function} classImp 类的实现代码
	 */
	function _class(className, superClass, classImp){
		var _s;
		if(superClass === null){  //默认继承 JS 的原生根对象
			_s = null;  //保证根类 _super 属性为 null
			superClass = Object;  //[TODO]如果框架没有扩展Object，则无需继承Object
		}else{
			if(superClass === ""){
				superClass = _classes["alz.lang.AObject"];
			}
			_s = superClass[__proto];
		}

		//类及属性定义(静态属性)
		var clazz = __newClass();  //定义类
		clazz._super = _s;  //绑定 _super 属性到类上面（Object.prototype）
		clazz._className = className;
		clazz._clazzImp = classImp;
		clazz.toString = function(){return "[class " + this._className + "]"};

		//原型及属性定义（所有实例共享这些属性）
		__inDeclare = true;
		var _p =
		clazz[__proto] = new superClass();  //通过原型实现继承
		__inDeclare = false;
		_p.constructor = clazz;  //_p._init;  //初始化构造器
		if(!_p.__proto__){
			_p.__proto__ = _p;  //fixed for ie
		}
		_p._className = className;
		_p._clazz = clazz;
		_p._exts = [];  //类的扩展代码

		//类绑定
		alz[className] = clazz;  //将类绑定到根包上面
		_classes[_pkg + "." + className] = clazz;
		if(_cxt){
			this[className] = clazz;  //绑定到当前上下文环境（作用域）之上
		}
		//this.runtime._contextList[this.runtime._name][className] = clazz;  //绑定到核心上下文环境之上
		//__global[className] = clazz;

		//执行类的实现代码
		if(typeof classImp == "function"){
			classImp.apply(_p, [_s]);  //function(_super){};  //初始化类对象
		}
		_p = null;
		_s = null;
		//clazz = null;
		return clazz;
	}
	/**
	 * 上下文环境类的自举代码
	 */
	function bootstrap(){
		initNative();
		//标准的_class声明形式，不过现在还不实在真是的上下文环境下
//------------------------------------------------------------------------------
_package("alz.core");

/**
 * 命名空间和上下文环境的概念在这里并不严格区分，这个特殊的类的主要目的就是创建
 * 多个上下文环境对象并由此构造出一个个的命名空间来，并及由上下文环境对象区别于
 * 匿名函数局部作用域的可操作性，设计了OOP模拟原理。
 *
 * _package,_import,_class三个OOP关键特性的重要程度是反过来的。
 */
_class("Context", null, function(_super){
	this.__classes__ = _classes;
	this.alz = alz;
	this._init = _init;
	this._import = function(className){
		var clazz = _classes[className];
		var name = className.split(".").pop();
		if(!(name in this)){
			this[name] = clazz;  //短名
		}
		if(!(className in this)){
			this[className] = clazz;  //全名
		}
	};
	this._package = _package;  //前面已经定义，只需引入
	this._class = _class;  //前面已经定义，只需引入
	/**
	 * 模拟接口的定义
	 * @param {String} name 接口的名字
	 * @param {Interface} superInterface 父接口
	 * @param {Function} interfaceImp 接口的实现，可以是虚实现
	 */
	this._interface = function(name, superInterface, interfaceImp){
		interfaceImp.__name__ = name;
		this.alz[name] = interfaceImp;
		this[name] = interfaceImp;
	};
	//创建一个方法并返回
	function createMethod(name){
		return function(){
			return callMethod(this, name, arguments);
		};
	}
	//使用用特定的参数调用一个指定名称的方法
	function callMethod(obj, name, args){
		if(obj._exts !== obj._clazz[__proto]._exts){
			window.alert("callMethod error");
		}
		//op = object or prototype
		for(var op = obj; op && op._exts; op = op._clazz._super){
			var exts = op._exts;
			if(name == "dispose"){
				for(var i = exts.length - 1; i >= 0; i--){  //逆序执行析构方法的扩展
					if(name in exts[i]){
						exts[i][name].apply(obj, args);
					}
				}
			}else{
				for(var i = 0, len = exts.length; i < len; i++){  //按顺序执行方法的扩展（构造、析构）
					if(name in exts[i]){
						exts[i][name].apply(obj, args);
					}
				}
			}
			exts = null;
		}
	}
	/**
	 * 为类提供一个扩展机制
	 * @param {String} className 被扩展的类的名字
	 * @param {Function} extImp 扩展的实现代码
	 * [TODO]可以按照这个扩展的工作原理，并且通过替换原型上相关的方法，为每一个类
	 * 设计扩展一种机制。
	 * WebRuntime.regExt = function(clazz){};
	 */
	this._extension = function(className, extImp){
		var name = _pkg + "." + className;
		var clazz = _classes[name];
		if(!clazz){
			throw "类" + name + "还不存在，请检查包和类名的定义是否正确";
		}
		//if(!(name in _exts)){
		//	_exts[name] = [];
		//}
		var methods = {
			"_init"  : 1,  //构造函数
			"init"   : 1,  //初始化函数
			"dispose": 1   //析构函数
		};
		var p = clazz[__proto];
		var exts = p._exts;  //_exts[name]
		if(exts.length == 0){  //如果还没有被扩展过，保存扩展之前原始的关键方法
			//重定义关键方法，保证能够顺利执行扩展的代码
			var ext = {};
			for(var k in methods){
				if(k in p){
					ext[k] = p[k];
					p[k] = createMethod(k);
				}
			}
			exts.push(ext);
			ext = null;
		}
		var o = new extImp();  //创建扩展的一个实例（只需创建一个）
		exts.push(o);  //注册扩展
		for(var k in o){
			if(k in methods) continue;  //忽略关键方法
			p[k] = o[k];  //其他的方法直接绑定到原型上
		}
		//如果是扩展的WebRuntime类，保证全局唯一对象runtime能够被扩展
		//[TO-DO]onContentLoad之后再执行WebRuntime的类扩展
		if(className == "WebRuntime"){
			var rt = this.runtime;
			if(typeof o._init == "function"){
				if(rt._inited){
					o._init.call(rt);
				}else{
					rt.addOnLoad(rt, o._init);
				}
			}
			rt = null;
		}
		o = null;
		exts = null;
		p = null;
	};
	/**
	 * 定义类的抽象方法，框架会保证子类必须实现该方法
	 */
	this._abstract = function(proto, name, methodImp){
		proto[name] = methodImp || function(){};
	};
});
//------------------------------------------------------------------------------
		//[TODO]禁止其他lib文件引入Context类，可以防止Context类被滥用
		var className = "Context";
		var clazz = _classes[_pkg + "." + className];
		_cxt = new clazz(name, null);
		_cxt[className] = clazz;  //绑定到当前上下文环境（作用域）之上
		clazz = null;
		return _cxt;
		/*
		var Context = __newClass();  //这其实是一个类定义
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
	}
	return bootstrap();
}
/*</file>*/
with(createContext("aui")){

//__init__.lib
/*<file name="alz/core/IMetaTable.js">*/
_package("alz.core");

_interface("IMetaTable", "", function(_property){
	_property(this, {
		_hash: {},
		_list: []
	});
	this.exists = function(id){
		return id in this._hash;
	};
	this.getItem = function(id){
		return this._hash[id];
	};
	this.appendItem = function(item){
	};
	this.appendItems = function(items){
	};
	this.removeItem = function(id){
	};
});
/*</file>*/
/*<file name="alz/lang/AObject.js">*/
_package("alz.lang");

/**
 * 根类 AObject
 */
_class("AObject", null, function(_super){
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
	 * 获取对象的字符串表示
	 * @return {String}
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
		return __classes__[this._className];  //避免使用eval方法
		//return runtime._classManager.getClassByName(this._className).getClazz();
	};
	/**
	 * 获取对象对应的父类
	 * @return {Class}
	 */
	this.getSuperClass = function(){
		return this.getClass()._super.getClass();
	};
	/**
	 * 获取对象的类名
	 * @return {String}
	 */
	this.getClassName = function(){
		return this._className;
	};
	/**
	 * 设置对象的类名
	 * @param {Object} v 类名
	 */
	this.setClassName = function(v){
		this._className = v;
	};
	/**
	 * 获取对象的属性
	 * @param {String} name 属性名
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
	 * 设置对象的属性
	 * @param {String} name 属性名
	 * @param {Object} value 属性值
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
	 * 判断当前对象是否某个类的实例
	 * 根据 prototype 链工作
	 * @param {Class|String} clazz 类或者类的名称
	 * @return {Boolean}
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
/*</file>*/
/*<file name="alz/lang/Exception.js">*/
_package("alz.lang");

//import alz.native.Error;

/**
 * 异常基类
 */
//class Exception(Error){
_class("Exception", "", function(_super){
	this._init = function(msg){
		_super._init.call(this);
		this._message = this._formatMsg(msg, arguments);
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.toString = function(){
		return this._message;
	};
	this._formatMsg = function(msg, args){
		return msg.replace(/\{(\d+)\}/g, function(_0, _1){
			return args[parseInt(_1) - 1];
		});
	};
});
/*</file>*/
/*<file name="alz/core/EventTarget.js">*/
_package("alz.core");

/**
 * DOM Event Model
 * 《Document Object Model (DOM) Level 2 Events Specification》
 * http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113
 */
_class("EventTarget", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		/**
		 * 所有的事件响应函数都不与组件对象绑定，而是存储在这个映射表中
		 * [注意]不能将该属性放到原型属性里面去，不然两个对象会共享之
		 */
		this._eventMaps = {};  //事件映射表
		//this._listeners = {};
		this._listener = null;
		this._enableEvent = true;
		this._parent = null;  //组件所属的父组件
		this._disabled = false;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._parent = null;
		this._listener = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setEnableEvent = function(v){
		this._enableEvent = v;
	};
	this.getParent = function(){
		return this._parent;
	};
	this.setParent = function(v){
		this._parent = v;
	};
	this.getDisabled = function(){
		return this._disabled;
	};
	this.setDisabled = function(v){
		if(this._disabled == v) return;
		this._disabled = v;
	};
	this.addEventGroupListener = function(eventMap, listener){
		this._listener = listener;
		if(eventMap == "mouseevent"){
			eventMap = "mousedown,mouseup,mousemove,mouseover,mouseout,click,dblclick";
		}else if(eventMap == "keyevent"){
			eventMap = "keydown,keypress,keypressup";
		}
		var maps = eventMap.split(",");
		for(var i = 0, len = maps.length; i < len; i++){
			if(this._self){
				this._self["on" + maps[i]] = function(ev){
					ev = ev || runtime.getWindow().event;
					//if(ev.type == "mousedown") window.alert(121);
					if(this._ptr._enableEvent){  //如果启用了事件相应机制，则触发事件
						if(ev.type in this._ptr._listener){
							this._ptr._listener[ev.type].call(this._ptr, ev);
						}
					}
				};
			}
		}
		maps = null;
	};
	this.removeEventGroupListener = function(eventMap){
		if(eventMap == "mouseevent"){
			eventMap = "mousedown,mouseup,mousemove,mouseover,mouseout,click,dblclick";
		}else if(eventMap == "keyevent"){
			eventMap = "keydown,keypress,keypressup";
		}
		var maps = eventMap.split(",");
		for(var i = 0, len = maps.length; i < len; i++){
			if(this._self){
				this._self["on" + maps[i]] = null;
			}
		}
		maps = null;
		this._listener = null;
	};
	/**
	 * 此方法允许在事件目标上注册事件侦听器。
	 * @java void addEventListener(String type, EventListener listener, boolean useCapture);
	 * [TODO]检查type的合法值
	 * [TODO]同一个事件响应函数不应该被绑定两次
	 */
	this.addEventListener = function(type, eventHandle, useCapture){
		if(!this._eventMaps[type]){
			this._eventMaps[type] = [];  //[TODO]使用{}来模拟多个事件执行顺序的无关性
		}
		this._eventMaps[type].push(eventHandle);
	};
	this.removeEventListener = function(type, eventHandle, useCapture){
		if(this._eventMaps[type]){
			var arr = this._eventMaps[type];
			for(var i = 0, len = arr.length; i < len; i++){
				if(eventHandle == null){  //移除所有事件
					arr[i] = null;
					arr.removeAt(i, 1);
				}else if(arr[i] == eventHandle){
					arr[i] = null;
					arr.removeAt(i, 1);  //移除元素
					break;
				}
			}
		}
	};
	this.dispatchEvent = function(ev){
		var ret = true;
		for(var obj = this; obj; obj = obj.getParent()){  //默认事件传递顺序为有内向外
			if(obj.getDisabled()){
				ev.cancelBubble = true;
				ret = false;
				break;  //continue;
			}
			if(obj["on" + ev.type]){  //如果组件的时间响应方法存在
				ret = obj["on" + ev.type](ev);  //应该判断事件响应函数的返回值并做些工作
				if(ev.cancelBubble){
					return ret;  //如果禁止冒泡，则退出
				}
			}else{
				var map = obj._eventMaps[ev.type];
				if(map){  //检查事件映射表中是否有对应的事件
					var bCancel = false;
					ev.cancelBubble = false;  //还原
					for(var i = 0, len = map.length; i < len; i++){
						ret = map[i].call(obj, ev);
						bCancel = bCancel || ev.cancelBubble;  //有一个为真，则停止冒泡
					}
					ev.cancelBubble = false;  //还原
					if(bCancel){
						return ret;  //如果禁止冒泡，则退出
					}
				}
			}
			//[TODO]事件变更发送者的时候，offsetX,offsetY属性也要随着发生遍化
			ev.sender = obj;
			if(obj._self){  //[TODO] obj 有可能是designBox，而它没有_self属性
				ev.offsetX += obj._self.offsetLeft;
				ev.offsetY += obj._self.offsetTop;
			}
		}
		return ret;
	};
	this.fireEvent = function(ev, argv){
		var name = "on" + ev.type.capitalize();
		if(typeof this[name] == "function"){
			try{
				switch(arguments.length){
				case 1: return this[name](ev);
				case 2: return this[name].apply(this, [ev].concat(argv));
				case 3: return this[name].apply(this, arguments);
				}
			}catch(ex){  //屏蔽事件中的错误
				//runtime.showException(ex, "[" + this._className + "::onInit]");
				return false;
			}
		}
	};
});
/*</file>*/
/*<file name="alz/core/WebRuntime.js">*/
_package("alz.core");

_import("alz.lang.Exception");
//_import("alz.core.DOMUtil");
//_import("alz.core.AjaxEngine");
//_import("alz.mui.Component");
//_import("alz.mui.Workspace");

_class("WebRuntime", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		//调试及其它各种开关选项
		this._startTime = __start;   //系统代码开始执行的时间戳
		this._debug = false;         //系统是否处于调试状态
		this._globalName = "__runtime__";  //多Runtime环境下的全局唯一变量的名字

		//路径配置
		this.pathSep   = "/";  //目录分割符
		this.pathAui   = "/alzui/";     //alzui内核所在目录("http://www.iiios.net:8081/alzui/")
		this.classpath = this.pathAui + "classes/";     //默认的类文件存储目录
		this.pathLib   = this.pathAui + "lib/";         //默认的类库包存储目录
		this.pathApp   = this.pathAui + "netapp/";      //app所在根目录
		this.pathSrv   = this.pathAui + "data/";        //服务端程序的根目录
		this.pathHtml  = this.pathAui + "html/";        //HtmlApp 目录
		this.pathTpl   = this.pathLib + "res/tpl/";     //tpl模版文件目录
		this.pathCss   = this.pathLib + "res/css/";     //css文件目录
		this.pathImg   = this.pathLib + "res/images/";  //图片资源
		this.pathSkin  = this.pathLib + "skin/win2k/";  //皮肤(图标)
		this.pathPlugin = this.pathAui + "plugins/";    //插件目录

		//运行时环境所在的宿主，为运行时环境提供统一的环境接口
		this._global   = null;  //保存唯一的一个全局 this 的指针
		this._host     = null;  //运行时环境的宿主对象（宿主环境）
		this._hostenv  = "";    //宿主环境(特别的宿主:hta,chm)
		this._config   = {};    //系统配置变量（含义参见文档说明）
		/**
		 * conf配置信息说明
		 * debug   boolean 是否调试状态
		 * runmode number  运行模式
		 * skinid  string  默认皮肤id
		 * action  string  默认触发的动作(mini版使用)
		 * aulFile string  默认启动的aul文件
		 * screen  string  桌面屏幕组件的DOM容器id
		 */
		this._conf = {};
		this._tpls = {};       //模板库集合
		this._srvFiles = {};  //服务的文件列表
		this._parentRuntime = null;  //父WebRuntime对象
		this._libManager = null;  //库文件管理者
		this._libLoader = null;   //库文件加载器
		this._contextList = {};   //上下文环境对象列表
		this._libContext = null;  //当前lib的上下文环境对象
		this._plugins = {};       //注册的插件列表
		this._log = [];  //日志缓存

		//浏览器环境下在可能有的接口
		this._win      = null;  //运行时环境所在的 window 对象
		this._doc      = null;
		this._domScript = null;  //script DOM 对象
		this.ie = false;      //是否IE浏览器
		this.ff = false;      //是否FireFox
		this.ns = false;      //是否Netscape
		this.opera = false;   //是否Opera
		this.safari = false;  //是否Safari
		this.chrome = false;  //是否谷歌浏览器
		this.moz = false;     //是否Mozilla系列浏览器
		this.ie5 = false;     //是否IE5
		this.ie55 = false;    //是否IE5.5
		this.ie6 = false;     //是否IE6
		this.ie7 = false;     //是否IE7
		this.ff1 = false;     //是否FF1
		this.ff2 = false;     //是否FF2
		this.max = false;     //是否Maxthon
		this.tt = false;      //是否TencentTraveler

		this._win = __global;
		this._doc = this._win.document;
		this._checkBrowser();

		//探测是否 Gadget 运行环境
		this.inGadget = !!(this._win.System && this._win.System.Gadget);  //typeof System != "undefined"
		this.option = {  //Gadget相关属性
			timer     : 2000,  //检查新邮件的时间间隔
			newMailNum: 0      //新邮件数量
		};
		this._files = {};  //已经加载的js或css文件
		this._boxModel = this.ie ? 0 : 1;
		this._info = null;
		this._testDiv = null;
		this._zIndex = 0;
		this._components = [];

		//core.lib
		//this.dom = null;   //{DOMUtil}
		//this._ajax = null;  //{AjaxEngine}

		//ui.lib
		//this._workspace = null;

		this._funs = [];
		this.__eventHandle = null;
		this._inited = false;
	};
	this.init = function(){
		this.exportInterface(this._win);  //导出全局变量
		this._checkHostEnv();
		this._pathCss = this._config["pathcss"];
		//this._pathCss = this._products[this._productName].pathCss;
		this._pathSkin = this._config["pathskin"];
		this.pathPlugin = this._config["pathplugin"];

		this._libManager = new LibManager();

		if(this._config["skin"]){
			var url = this.pathLib + "skin/" + this._config["skin"] + "/skin.css";
			this._doc.write('<link type="text/css" rel="stylesheet" href="' + url + '" />');
		}
		this._preLoadFile("css", this._pathCss, this._config["css"].split(","), this._pathSkin);
		if(this._config["plugin"]){  //如果有插件，加载插件的CSS文件
			var plugins = this._config["plugin"].split(",");
			for(var i = 0, len = plugins.length; i < len; i++){
				var plugin = plugins[i];
				this._preLoadFile("css", this.pathPlugin + plugin + "/css/", [plugin + ".css"]);
				this._preLoadFile("js" , this.pathPlugin + plugin + "/js/" , [plugin + ".js" ]);
				plugin = null;
			}
			plugins = null;
		}
		if(this._config["autotest"]){  //加载自动测试文件
			this._doc.write('<script type="text/javascript" src="' + this._config["autotest"] + '" charset=\"utf-8\"></sc'+'ript>');
		}

		var _this = this;
		this.__eventHandle = function(ev){
			_this.eventHandle(ev || _this._win.event);
		};
		if(this._doc.attachEvent){
			try{  //下面这句在WinXP+IE6下报错，所以加上防错处理
				this._doc.execCommand("BackgroundImageCache", false, true);
			}catch(ex){
			}
			this._doc.attachEvent("onreadystatechange", this.__eventHandle);
		}else{
			this._doc.addEventListener("DOMContentLoaded", this.__eventHandle, false);
		}
		if(this.safari || this.chrome){
			this.addEventListener(this._win, "load", this.__eventHandle);
		}
		this.addEventListener(this._win, "unload", this.__eventHandle);
		this.addEventListener(this._win, "resize", this.__eventHandle);
		var types = ["contextmenu", "mousedown", "mousemove", "mouseup", "keydown", "keypress", "keyup"];
		for(var i = 0, len = types.length; i < len; i++){
			this.addEventListener(this._doc, types[i], this.__eventHandle);
		}

		if(this._conf["runmode"] == "11"){
			this.onContentLoaded();  //true
			//this._workspace._self.style.position = "absolute";
			//this._workspace.setOpacity(0.9);
			//this._workspace.moveTo(10, 10);
			//this._workspace.resize(640, 480);
			//if(this._win.onContentLoaded) this._win.onContentLoaded();
		}
		if(this._win.onKernelLoaded){
			this._win.onKernelLoaded();
		}
		if(this._doc.body){
			this.onContentLoaded();
		}
	};
	this.onContentLoaded = function(bNewWorkspace){
		if(this._inited) return;
		this._inited = true;
		var code = this._config["onstartloading"];
		if(code){
			try{
				eval(code);
			}catch(ex){
			}
		}
		//按顺序执行构造扩展
		//for(var i = 1, len = this._exts.length; i < len; i++){
		//	this._exts[i].init.call(this);
		//}
		this._libManager.initLoadLib();
		this._newWorkspace = bNewWorkspace;
		//this._workspace = new Screen();
		//this._workspace[this._newWorkspace ? "create" : "bind"](this.getBody());
		if(this.ie){  //IE在此时触发 resize
			this.eventHandle({type:"resize"});  //主动触发一次 resize 事件
		}
		//var _this = this;
		//this.addEventListener(this._win, "mousemove", function(ev){_this.eventHandle(ev || _this._win.event);});
		//this.addEventListener(this._doc.body, "mousemove", function(ev){_this.eventHandle(ev || _this._win.event);});
		this._boxModel = this._testBoxModel();  //探测盒模型
		//[TODO]库代码的加载时机应该更早才对，至少要在 onContentLoaded 之前，最好是在初始化脚本加载并初始化完毕的时候
		var libs = this._config["lib"];  //.replace(/^core,ui,/, "");  //忽略core,ui库代码
		this._libLoader = new LibLoader();
		this._libLoader.init(libs.split(","), this._config["codeprovider"], this, "onLibLoad");
		//依次调用绑定的函数
		for(var i = 0, len = this._funs.length; i < len; i++){
			var agent = this._funs[i].agent;
			var func = this._funs[i].func;
			if(typeof agent == "object"){
				func.call(agent);
			}else if(typeof agent == "function"){
				agent();
			}
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._doc.detachEvent){
			this._doc.detachEvent("onreadystatechange", this.__eventHandle);
		}else{
			this._doc.removeEventListener("DOMContentLoaded", this.__eventHandle, false);
		}
		if(this.safari || this.chrome){
			this.removeEventListener(this._win, "load", this.__eventHandle);
		}
		this.removeEventListener(this._win, "unload", this.__eventHandle);
		this.removeEventListener(this._win, "resize", this.__eventHandle);
		var types = ["contextmenu", "mousedown", "mousemove", "mouseup", "keydown", "keypress", "keyup"];
		for(var i = 0, len = types.length; i < len; i++){
			this.removeEventListener(this._doc, types[i], this.__eventHandle);
		}
		this.__eventHandle = null;
		for(var k in this._plugins){
			this._plugins[k].dispose();
			delete this._plugins[k];
		}
		this._libContext = null;
		for(var i = 0, len = this._components.length; i < len; i++){
			this._components[i].dispose();
			this._components[i] = null;
		}
		this._components = [];
		this._testDiv = null;
		this._info = null;
		this._libLoader.dispose();
		this._libLoader = null;
		this._libManager.dispose();
		this._libManager = null;
		this._domScript = null;
		this._doc = null;
		this._win = null;
		this._host = null;
		this._parentRuntime = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * 利用正则匹配 window.navigator.userAgent 来获取浏览器的类型
	 * @param {Navigator} nav
	 * Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; en) Opera 8.00
	 * Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9b4pre) Gecko/2008022005 Minefield/3.0b4pre (.NET CLR 3.5.30729)
	 * Mozilla/5.0 (iPhone; U; CPU iPhone OS 2_2_1 like Mac OS X; zh-cn) AppleWebKit/525.18.1 (KHTML, like Gecko) Version/3.1.1 Mobile/5H11 Safari/525.20
	 */
	this.getHostenv = function(nav){
		//window.alert(this.forIn(nav).join("\n"));
		//window.prompt("", nav.appVersion);  //nav.userAgent
		var re = {
		//"opera" : /Opera\/(\d+(?:\.\d+)+)/,      //Opera/9.10
			"opera" : /Opera[\/\x20](\d+(?:\.\d+)+)/,  //Opera/9.10,Opera 8.00
			"ie"    : /MSIE\x20(\d+(?:\.\d+)+)/,    //MSIE 6.0
			"ff"    : /Firefox\/(\d+(?:\.\d+)+)/,   //Firefox/2.0.0.2
			"ns"    : /Netscape\/(\d+(?:\.\d+)+)/,  //Netscape/7.0
			"safari": /Version\/(\d+(?:\.\d+)+)\x20Safari\/(\d+(?:\.\d+)+)/, //Version/3.0.3 Safari/522.15.5
			"chrome": /Chrome\/(\d+(?:\.\d+)+)\x20Safari\/(\d+(?:\.\d+)+)/,  //Chrome/0.2.149.27 Safari/525.13
			"mf"    : /Minefield\/(\d+(?:\.\d+)+)/  //Minefield/3.0b4pre
		};
		var host = {"os":"unix","env":"unknown","ver":"0","compatMode":""};
		if(nav.platform == "Win32" || nav.platform == "Windows"){
			//"Window NT 5.0" win2k
			//"Window NT 5.1" winxp
			host.os = "win";
		}else if(nav.platform == "Mac68K" || nav.platform == "MacPPC" || nav.platform == "Macintosh"){
			host.os = "mac";
		}else if(nav.platform == "X11"){
			host.os = "unix";
		}
		for(var k in re){
			var arr = re[k].exec(nav.userAgent);
			if(arr){  //re[k].test(nav.userAgent)
				host.env = k == "mf" ? "ff": k;
				host.ver = arr[1];
				host.compatMode = host.env == "ie" && this._doc.compatMode == "BackCompat" ? "BackCompat" : "CSS1Compat";
				if(host.env == "ff" || host.env == "ns"){
					var url = window.location.href;
					if(url.substr(url.length - 4).toLowerCase() == ".xul"){
						host.xul = true;
					}
				}
				break;
			}
		}
		if(host.env == "unknown"){
			runtime.log("[WebRuntime::getHostenv]未知的宿主环境，userAgent:" + nav.userAgent);
		}
		return host;
	};
	/**
	 * 检测浏览器类型
	 */
	this._checkBrowser = function(){
		var nav = this._win.navigator;
		this._host = this.getHostenv(nav);
		this._hostenv = this._host.env;
		this.ie = this._hostenv == "ie";
		this.ff = this._hostenv == "ff";
		this.ns = this._hostenv == "ns";
		this.opera = this._hostenv == "opera";
		this.safari = this._hostenv == "safari";
		this.chrome = this._hostenv == "chrome";
		this.moz = this.ns || this.ff;  //nav.product == "Gecko";
		this.ie6 = nav.userAgent.indexOf("MSIE 6.0") != -1;
		this.ie7 = nav.userAgent.indexOf("MSIE 7.0") != -1;
		this.ff1 = nav.userAgent.indexOf("Firefox/1.0") != -1;
		this.ff2 = nav.userAgent.indexOf("Firefox/2.0") != -1;
		this.max = nav.userAgent.indexOf("Maxthon") != -1;
		this.tt = nav.userAgent.indexOf("TencentTraveler") != -1;
		/*
		if(this.ie && this.max && this.tt){
			this._win.alert(
						"您同时开启了Maxthon和腾讯TT浏览器，两个浏览器"
				+ "\n可能会相互影响导致系统出现一些小问题。"
				+ "\n解决方法：请先打开Maxthon，然后再打开腾讯TT。"
			);
		}
		*/
	};
	/**
	 * 检测并初始化宿主环境中 script 标签所定义的配置信息
	 * [TODO]
	 *  1)如果页面是动态生成，并且直接一次性写入的，会导致无法正确定位 alzui 系统
	 *    位置，原因在于对 script 元素的查询默认最后一个问题。
	 */
	this._checkHostEnv = function(){
		//路径设置
		if(!this._domScript){
			var ol = this._doc.getElementsByTagName("script");
			this._domScript = ol[ol.length - 1];  //最后一个script标签
		}
		//判断是否包含当前上下文环境的名字，就靠它来识别引入初始化文件的SCRIPT标签的
		var url = this._domScript.src || this._domScript.getAttribute("src");
		if(url.indexOf(__context__.__name) == -1){
			while(true){
				this._domScript = this._domScript.nextSibling;
				if(this._domScript.nodeType == 1 && this._domScript.tagName == "SCRIPT"){
					break;
				}
			}
		}

		//配置信息
		var keys = [
			"src",
			"pathlib", "pathapp", "pathcss", "pathskin", "pathimg", "pathtpl", "pathplugin",
			"css", "lib", "plugin",
			"conf", "runmode", "skinid", "skin", "codeprovider", "autotest", "action",
			"onstartloading"  //开始加载时执行的代码
		];
		for(var i = 0, len = keys.length; i < len; i++){
			var key = keys[i];
			var value = this._domScript.getAttribute(key);
			this._config[key] = value != null ? value : "";
		}
		this._conf = this.parseJson(this._config["conf"] || "{}");
		var rt = this.getMainWindow().runtime;
		if(rt && !("skinid" in this._conf)){
			this._conf["skinid"] = rt._conf["skinid"];
		}
		if(rt && this._config["codeprovider"] == ""){
			this._config["codeprovider"] = rt._config["codeprovider"];
		}
		rt = null;
		var config = this._config;
		var conf = this._conf;
		for(var k in config){
			if(typeof config[k] != "string") continue;
			config[k] = config[k].replace(/\{\$(\w+)\}/g, function(_0, _1){
				if(_1 in conf){
					if(_1 == "skinid"){
						var no = "" + (parseInt(conf[_1]) + 1);
						//return "000".substr(0, 3 - no.length) + no;
						return no;
					}else{
						return conf[_1];
					}
				}else{
					return _0;
				}
			});
		}
		conf = null;
		config = null;

		//路径检测

		//定位 alzui 系统路径
		var path = this._config["src"];
		var arr = (/^(.+)(\\|\/)[^\\\/]+$/ig).exec(path);  //this._win.location
		if(arr){
			this.pathSep  = arr[2];
			this.pathAui = arr[1] + arr[2];
			//path = path.substring(0, path.lastIndexOf(this.pathSep) + 1).replace(/lib\/$/, "")
			this._setPathAui(path.substring(0, path.lastIndexOf(this.pathSep) + 1).replace(/lib\/$/, ""));
		}else{
			this.showException("未能正确定位 alzui 系统位置");
			return;
		}
		//定位 WebApp 的路径
		var url = "" + window.location;
		this.pathApp = url.substr(0, url.lastIndexOf("/") + 1);  //[TODO]pathApp的含义已经改变

		this._extendSystemObject();
	};
	this._preLoadFile = function(ext, path, files, pathSkin){
		for(var i = 0, len = files.length; i < len; i++){
			var file = files[i], skin = false;
			if(file.charAt(0) == "#"){
				file = file.substr(1).replace(/(\d+)\.css$/, "$1/_skin.css");
				skin = true;
			}
			var url = (skin ? pathSkin : path) + file;
			this._files[url] = true;  //标识已经加载
			if(ext == "css"){
				if(!this._host.xul){
					this._doc.write('<link rel="stylesheet" type="text/css" media="all" href="' + url /*+ '?' + new Date().getTime()*/ + '" />');
				}
			}else if(ext == "js"){
				if(!this._host.xul){
					this._doc.write('<script type="text/javascript" charset=\"utf-8\" src="' + url /*+ '?' + new Date().getTime()*/ + '"></sc'+'ript>');
				}else{
					var obj = this._doc.createElement("script");
					obj.type = "text/javascript";
					obj.charset = "utf-8";
					obj.src = url;
					this._doc.documentElement.appendChild(obj);
					obj = null;
				}
			}
		}
	};
	this.dynamicLoadFile = function(ext, path, files, pathSkin){
		for(var i = 0, len = files.length; i < len; i++){
			var file = files[i], skin = false;
			if(file.charAt(0) == "#"){  //皮肤文件
				file = file.substr(1).replace(/(\d+)\.css$/, "$1/_skin.css");
				skin = true;
			}
			var url = (skin ? pathSkin : path) + file;
			if(url in this._files) continue;  //如果已经加载，则忽略
			this._files[url] = true;  //标识已经加载
			if(ext == "css"){
				var link = this._doc.createElement("link");
				link.type  = "text/css";
				link.rel   = "stylesheet";
				link.media = "all";
				link.href  = url;
				this._domScript.parentNode.appendChild(link, this._domScript);
				link = null;
			}else if(ext == "js"){
				var loader = new ScriptLoader();
				loader.create(this, function(){});
				loader.load(url, "", true);  //this.getUrlByName(lib)
				loader = null;
			}
		}
	};
	/**
	 * 测试可能有跨域问题的代码
	 */
	this._testCrossDomainWindow = function(win, type){
		try{
			switch(type){
			case 0:  //访问parent属性
				var p = win.parent && win.runtime;
				break;
			case 1:  //访问__main__flag属性
				if(win.__main__flag && win.runtime){
					return true;
				}else{
					return false;
				}
			case 2:  //对__main__flag赋值
				if(win.runtime){
					win.__main__flag = true;
				}else{
					throw new Exception("[WebRuntime::_testCrossDomainWindow]");
				}
				break;
			case 3:  //测试location属性访问
				win.locaiton.pathname.indexOf("/");
				break;
			}
			return true;
		}catch(ex){
			return false;
		}
	};
	/**
	 * 获取同域的顶层 window 对象
	 * 按照逐级查找 window.parent 对象，并测试赋值的思路实现
	 * NOTICE!!!兼容性考虑很微妙，影响也很大，请勿随意修改
	 */
	this._getSameDomainTopWindow = function(win){
		var w, p;
		while(true){
			w = p || win;
			if(!this._testCrossDomainWindow(w, 0)){
				return null;
			}
			//if(!this._testCrossDomainWindow(w, 3)){
			//	return null;
			//}
			p = w.parent;
			if(p == null) break;
			if(p == w){
				//允许某个页面可以定义自己为顶层窗体，需要自己实现数据存储接口
				if(this._testCrossDomainWindow(w, 1)){  //如果存在__main__flag属性，直接返回
					return w;
				}
				if(this._testCrossDomainWindow(w, 2)){  //如果可以对__main__flag赋值
					return w;
				}else{
					return null;
				}
			}
			if(!this._testCrossDomainWindow(p, 2)){
				if(this._testCrossDomainWindow(w, 2)){
					return w;
				}else{
					return null;
				}
			}
			p.__main__flag = null;  //delete p.__main__flag;
		}
		return w;
	};
	/**
	 * 这个函数兼容 Vista Gadget 小程序设计，有跨域的容错判断，稳定性应该不错了，
	 * 不要重复设计这个封装过程。
	 * __main__flag 标示 window 对象是当前应用的顶层 window 对象
	 */
	this.getMainWindow = function(){
		var win = this._getSameDomainTopWindow(window);
		if(!this.inGadget){
			try{
				while(win.opener != null){
					var w = this._getSameDomainTopWindow(win.opener);
					if(!w){
						return win;
					}
					//[2009-8-14] chrome浏览器下，前面的测试均可通过，但location访问存在问
					//题，所以在此测试location的可访问性。
					if((this.chrome || this.safari) && !this._testCrossDomainWindow(w, 3)){  //测试location属性访问
						return win;
					}
					win = w;
				}
			}catch(ex){  //防止 window.opener 跨域的错误
			}
		}else{
			win = System.Gadget.document.parentWindow;
			win.__main__flag = true;
		}
		return win;
	};
	this._setPathAui = function(v){
		this.pathAui   = v;
		this.classpath = v + "classes/";
		this.pathLib   = this._config["pathlib"] || v + "lib/";
		this.pathSrv   = v + "data/";
		var ext = this._win && this._win.location.port == "8081" ? ".jsp" : ".asp";
		this._srvFiles["service"] = "service" + ext;
		this._srvFiles["tool"]    = "tool" + ext;
		this._srvFiles["vfs"]     = "vfs" + ext;
		this.pathHtml  = v + "html/";
		this.pathImg   = this.pathLib + "images/";
		this.pathSkin  = this.pathLib + "skin/win2k/";
	};
	/**
	 * 系统对象方法扩展
	 */
	this._extendSystemObject = function(){
		//if(typeof HTMLElement != "undefined" && !window.opera){
		if(this.moz){  //window.HTMLElement
			_p = HTMLElement[__proto];
			_p.__defineGetter__("outerHTML", function(){
				var str = "<" + this.tagName;
				var a = this.attributes;
				for(var i = 0, len = a.length; i < len; i++){
					if(a[i].specified){
						str += " " + a[i].name + '="' + a[i].value + '"';
					}
				}
				if(!this.canHaveChildren){
					return str + " />";
				}
				return str + ">" + this.innerHTML + "</" + this.tagName + ">";
			});
			_p.__defineSetter__("outerHTML", function(s){
				var r = this.ownerDocument.createRange();
				r.setStartBefore(this);
				var df = r.createContextualFragment(s);
				this.parentNode.replaceChild(df, this);
				return s;
			});
			_p.__defineGetter__("canHaveChildren", function(){
				return !/^(area|base|basefont|col|frame|hr|img|br|input|isindex|link|meta|param)$/.test(this.tagName.toLowerCase());
			});
			//if(typeof Event!="undefined" && !window.opera){
			_p = Event[__proto];
			/*_p.__defineSetter__("returnValue", function(b){
				if(!b){
					this.preventDefault();
				}
				return b;
			});*/
			_p.__defineSetter__("cancelBubble", function(b){
				if(b){
					this.stopPropagation();
				}
				return b;
			});
			_p.__defineGetter__("offsetX", function(){
				return this.layerX;
			});
			_p.__defineGetter__("offsetY", function(){
				return this.layerY;
			});
			_p.__defineGetter__("srcElement", function(){
				var n = this.target;
				while(n.nodeType != 1){
					n = n.parentNode;
				}
				return n;
			});
			//}
			XMLDocument[__proto].selectNodes =
			Element[__proto].selectNodes = function(xpath){
				var xpe = new XPathEvaluator();
				var nsResolver = xpe.createNSResolver(this.ownerDocument == null
					? this.documentElement
					: this.ownerDocument.documentElement);
				var result = xpe.evaluate(xpath, this, nsResolver, 0, null);
				var found = [];
				var res;
				while(res = result.iterateNext()){
					found.push(res);
				}
				return found;
			};
			XMLDocument[__proto].selectSingleNode =
			Element[__proto].selectSingleNode = function(xpath){
				var x = this.selectNodes(xpath);
				if(!x || x.length < 1) return null;
				return  x[0];
			};
		}
		_p = null;
	};
	this.addOnLoad = function(agent, func){
		this._funs.push({
			"agent": agent,
			"func" : func
		});
	};
	this.addEventListener = function(obj, type, eventHandle){
		if(obj.attachEvent){
			obj.attachEvent("on" + type, eventHandle);
		}else if(obj.addEventListener){
			obj.addEventListener(type, eventHandle, false);
		}else{
			throw new Exception("[WebRuntime::addEventListener]该浏览器无法对 DOM 元素绑定事件");
		}
	};
	this.removeEventListener = function(obj, type, eventHandle){
		if(obj.detachEvent){
			obj.detachEvent("on" + type, eventHandle);
		}else if(obj.removeEventListener){
			obj.removeEventListener(type, eventHandle, false);
		}else{
			throw new Exception("[WebRuntime::removeEventListenerEventListener]该浏览器无法对 DOM 元素绑定事件");
		}
	};
	/**
	 * 全局事件响应函数
	 * [TODO]
	 *   1)Workspace组件的一些方法属于系统级的，而不是Component组件的
	 *   2)this.getViewPort 和 DOMUtil.getViewPort 代码一致
	 *   3)尽可能早的触发一次 resize 事件，同时在应用初始化完毕再触发一次
	 */
	this.eventHandle = function(ev){
		switch(ev.type){
		case "load":
			if(!(this.safari || this.chrome)) break;
		case "readystatechange":
			if(this._win.attachEvent && this._doc.readyState != "complete"){
				return;
			}
		case "DOMContentLoaded":
			if(this._inited) return;
			this.onContentLoaded();
			//this.init();  //系统初始化
			//window.alert(runtime.getBrowser().getTestMode());
			break;
		case "unload":
			//try{  //屏蔽页面onunload时可能产生的错误
				if(!this._disposed){  //iframe内的runtime可能被提前执行过了
					this.dispose();
				}
			//}catch(ex){
			//	this.log("[WebRuntime::dispose]exception");
			//}
			//if(application) application = null;
			break;
		case "resize":
			if(this.onResize){
				this.onResize(ev);
			}
			break;
		/*
		case "contextmenu":
		case "mousedown":
		case "mousemove":
		case "mouseup":
		*/
		default:
			if(this._workspace && this._workspace.eventHandle){
				this._workspace.eventHandle(ev);
			}
			break;
		}
	};
	//getter and setter
	this.getConfigData = function(key){
		return this._config[key];
	};
	this.setConfigData = function(key, value){
		this._config[key] = value;
	};
	this.getConfData = function(key){
		return this._conf[key];
	};
	this.setConfData = function(key, value){
		this._conf[key] = value;
	};
	this.getStartTime = function(){
		return this._startTime;
	};
	this.getWindow = function(){
		return this._win;
	};
	this.setWindow = function(v){
		this._win = v;
	};
	this.getDocument = function(){
		return this._doc;
	};
	this.setDocument = function(v){
		this._doc = v;
	};
	/**
	 * 获取当前lib(__init__mini.lib)所在的上下文环境
	 */
	this.getLibContext = function(){
		return this._libContext;
	};
	this.setLibContext = function(v){
		this._libContext = v;
	};
	/**
	 * 创建一个上下文环境对象
	 * @param {String} name 库名
	 * @param {String} libs 当前库依赖的库列表
	 * 每一个lib文件必然依赖于__init__.lib，所以libs参数中忽略了这个lib
	 */
	this.createContext = function(name, libs){
		//return this.getLibContext();
		if(name in this._contextList){
			throw new Exception("[WebRuntime::createContext]上下文环境 " + name + " 已经存在，请检查是否重名？");
		}
		var cxt = new Context(name, this);
		//cxt.__name = name;  //设置库的名称
		//cxt.runtime = this;    //保证 runtime 是全局唯一对象
		//默认导入所有已经加载的类（复制核心 context 引入的类到新建的 context 中）
		//[TODO]按照层层扩展机制，进行限定性引入
		/*
		for(var k in this._libContext.alz){
			if(!(k in cxt)){
				cxt[k] = this._libContext.alz[k];
			}
		}
		*/
		this._contextList[name] = cxt;  //注册上下文环境
		return cxt;
	};
	this.regLib = function(name, lib){
		if(name == "aui" || name == "__init__"){
			this._contextList[name] = __context__;
			this.setLibContext(__context__);
			this.init();
		}else{
			if(this._libManager.exists(name)){
				this._win.alert("库(name=" + name + ")已经存在，请检查是否重名？");
				return;
			}
			this._libManager.reg(name, lib);
		}
	};
	this.regTpl = function(name, tplData){
		if(name in this._tpls){
			this.error("[WebRuntime::regTpl]模版库重名name=" + name);
		}
		this._tpls[name] = tplData;
	};
	this.getTplData = function(name){
		return this._tpls[name];
	};
	/**
	 * 每个lib文件加载完成时的回调方法
	 * @-param {String} libName core|ui|...
	 * @param {Lib} lib {type:"",name:"",inApp:false}
	 * @param {LibConf} libConf lib配置信息
	 */
	this.onLibLoad = function(lib, libConf, loaded){
		if(!loaded){
			if(lib.type == "lib"){
				var libConf = this._libManager.getLib(lib.name);
				if(libConf){
					libConf.init.apply(this);  //绑定在 runtime 对象上面，这是对runtime对象的一种扩展机制
					libConf._inited = true;
				}
				libConf = null;
			}
		}else{  //找不到，则认为库已经加载完毕
			if(lib.type == "lib" || lib.type == "tpl"){
				if(typeof this.onLoad == "function"){
					this.onLoad();
				}
				/*
				//依次调用绑定的函数
				for(var i = 0, len = this._funs.length; i < len; i++){
					var agent = this._funs[i].agent;
					var func = this._funs[i].func;
					if(typeof agent == "object"){
						func.call(agent);
					}else if(typeof agent == "function"){
						agent();
					}
				}
				*/
				if(this._appManager){
					this._appManager.init();  //初始化所有应用
				}
				//if(!this.ie){  //非 IE 在此时触发 resize
					this.eventHandle({type:"resize"});  //主动触发一次 resize 事件
				//}
				if(typeof this._win.onContentLoaded == "function"){
					this._win.onContentLoaded();
				}else if(this._win.__webpage__){
					new this._win.__webpage__().main();
				}
			}
		}
	};
	/**
	 * 日志输出接口
	 */
	this.log = function(str){
		this._log.push(str);
	};
	this.warning = function(str){
	};
	this.error = function(str){
	};
	/**
	 * 导出接口到对象 obj 上面
	 */
	this.exportInterface = function(scope){
		scope.runtime = this;  //导出全局对象 runtime
		/**
		 * 这个函数是为了过渡性考虑因素，模拟 Prototype 等系统而设计的，在这里并不建
		 * 议使用这样的系统函数。在获取 DOM 元素之后，仍然建议通过脚本组件操作 DOM元
		 * 素的相关属性。
		 */
		/*scope.$ = function(id){return this.runtime.getElement(id);};*/
		/**
		 * 获取 DOM 元素对应的脚本组件
		 */
		//scope.$get = function(id){return this.runtime.getComponentById(id);};
		//scope.$init = function(ids){return this.runtime.initComponents(ids);};
		/*
		scope._alert = this.alert;
		scope.alert = function(msg){
			this._alert(msg);
			if(this.runtime){
				this.runtime.showInfo(msg);
			}
		};
		scope.onerror = function(msg, url, lineno){
			this._alert("msg=" + msg
				+ "\nurl=" + url
				+ "\nlineno=" + lineno
			);
		};
		*/
	};
	/**
	 * 取得当前文档使用的盒模型
	 * @return {number} 0=外模型，1=内模型
	 */
	this.getBoxModel = function(){
		return this._boxModel;
	};
	this._createTestDiv = function(){
		var obj = this._doc.createElement("div");
		obj.style.position = "absolute";
		obj.style.left = "-2000px";
		obj.style.top = "-2000px";
		//obj.style.font = "8pt tahoma";
		if(this._host.xul == true){
			return this._doc.documentElement.appendChild(obj);
		}else{
			return this._doc.body.appendChild(obj);
		}
	};
	/**
	 * 检测当前浏览器，当前文档类型支持的盒模型
	 * @return number 盒模型的的数字标识
	 *         0 = 内缩的盒模型
	 *         1 = 外扩的盒模型
	 */
	this._testBoxModel = function(){
		if(!this._host.xul && !this._doc.body){
			throw new Exception("[WebRuntime::_testBoxModel]'document.body' have not ready now");
		}
		if(!this._testDiv){
			this._testDiv = this._createTestDiv();
		}
		this._testDiv.style.width = "100px";
		this._testDiv.style.height = "100px";
		this._testDiv.style.border = "1px solid #000000";
		this._testDiv.style.padding = "1px";
		var nType = this._testDiv.offsetWidth == 104 ? 1 : 0;
		this._testDiv.style.width = "";
		this._testDiv.style.height = "";
		this._testDiv.style.border = "";
		this._testDiv.style.padding = "";
		//this._doc.body.removeChild(this._testDiv);
		return nType;
	};
	this.getTextSize = function(text, font){
		if(!this._testDiv){
			this._testDiv = this._createTestDiv();
		}
		this._testDiv.style.font = font || "8pt tahoma";
		this._testDiv.innerHTML = runtime.encodeHTML(text);
		return {
			"w": this._testDiv.offsetWidth,
			"h": this._testDiv.offsetHeight
		};
	};
	this.getParentRuntime = function(){
		if(!this._parentRuntime){
			if(!this._win.parent){
				return null;
			}
			if(this._win.parent == this._win){
				return null;
			}
			this._parentRuntime = this._win.parent.runtime;
		}
		return this._parentRuntime;
	};
	this.getElement = function(id){
		return this._doc.getElementById(id);
		/*
		var obj = this._doc.getElementById(id);
		if(!obj) return null;
		if(!obj._ptr){
			var c = new Component();
			c.init(obj);
		}
		return obj;
		*/
	};
	this.getBody = function(){
		if(this._host.xul){
			return this._doc.documentElement;
		}else if(this.inGadget){
			return this._doc.body;
		}else{
			return this.getElement("body") || this._doc.body;
		}
	};
	this.getUser = function(){
		if(this.getContext() && this.getContext().getUser){
			return this.getContext().getUser();
		}else{
			return this.getParentRuntime().getContext().getUser();
		}
	};
	this.getNextZIndex = function(){
		return ++this._zIndex;
	};
	/**
	 * 注册一个插件
	 */
	this.regPlugin = function(name, clazz){
		this._plugins[name] = new clazz();
	};
	/**
	 * 加载一个插件
	 * @param {String} url 插件JS的URL地址
	 */
	this.loadPlugin = function(url){
	};
	this.getPlugin = function(name){
		return this._plugins[name];
	};
	this.getRandomColor = function(){
		var a = [];
		for(var i = 0; i < 3; i++){
			a[i] = Math.round(191 + 64 * Math.random()).toString(16);
			if(a[i].length < 2) a[i] = "0" + a[i];
		}
		return "#" + a.join("");
	};
	this.getViewPort = function(element){
		var rect = {
			x: element.scrollLeft,
			y: element.scrollTop,
			w: element.clientWidth,  //Math.max(element.clientWidth || element.scrollWidth)
			h: Math.max(element.clientHeight, element.parentNode.clientHeight)  //Math.max(element.clientHeight || element.scrollHeight)
		};
		//if(this.ff){}
		rect.w = Math.max(element.clientWidth, element.parentNode.clientWidth);
		rect.h = Math.max(element.clientHeight, element.parentNode.clientHeight);
		return rect;
	};
	/**
	 * 把一个JSON字符串解析为 json 对象，成功返回 json 对象，失败返回 null
	 * @param {String} data [JsonCode]符合 JSON 协议的 js 代码
	 */
	this.parseJson = function(data){
		if(data == "") return null;  //防止空数据报错
		try{
			return eval("(" + data + ")");
		}catch(ex){  //json 解析错误
			if(this._debug){
				this.showException(ex, "parse json data error");
			}
			return null;
		}
	};
	/**
	 * 将字符串转换成可以被字符串表示符号(",')括起来已表示原来字符串意义的字符串
	 * @param {String} str 要转换的字符串内容
	 */
	this.toJsString = function(str){
		if(typeof str != "string") return "";
		return str.replace(/[\\\'\"\r\n]/g, function(_0){
			switch(_0){
			case "\\": return "\\\\";
			case "\'": return "\\\'";
			case "\"": return "\\\"";
			case "\n": return "\\n";
			case "\r": return "\\r";
			}
		});
	};
	/**
	 * 将模板解析为一个 JS 函数的代码形式
	 * @param {String} code 模板的内容
	 */
	this.parseTemplate = function(code){
		var sBegin = "<" + "%", sEnd = "%" + ">";
		var sb = [];
		sb.push("function(){");
		sb.push("\nvar __sb = [];\n");
		var p1 = code.indexOf(sBegin);
		var p2 = -2;
		while(p1 != -1){
			if(p1 > p2 + 2){
				sb.push("__sb.push(\"" + this.toJsString(code.substring(p2 + 2, p1)) + "\");");
			}
			p2 = code.indexOf(sEnd, p1 + 2);
			if(p2 != -1){
				switch(code.charAt(p1 + 2)){
				case '=':  //如果表达式，把表达式的结果缓存到 __sb 中
					sb.push("__sb.push(" + code.substring(p1 + 3, p2) + ");");
					break;
				default:  //普通的代码，保持不变
					sb.push(code.substring(p1 + 2, p2));
					break;
				}
			}else{
				return "模板中的'" + sBegin + "'与'" + sEnd + "'不匹配！";
			}
			p1 = code.indexOf(sBegin, p2 + 2);
		}
		if(p2 != -2 && p2 + 2 < code.length){  //保存结束标志之后的代码
			sb.push("__sb.push(\"" + this.toJsString(code.substr(p2 + 2)) + "\");");
		}
		sb.push("return __sb.join(\"\");");
		sb.push("\n}");
		return sb.join("");
		//return eval("(" + sb.join("\n") + ")")();
	};
	//var _pool = [];  //模拟线程池
	//添加并启动一个线程
	this.addThread = function(msec, agent, fun){
		var f = typeof fun == "string" ? agent[fun] : fun;
		/*
		_pool.push({
			"agent": agent,       //代理对象
			"fun"  : f,           //要执行的代码
			"time" : new Date(),  //当前时间
			"msec" : msec         //时间间隔
		});
		*/
		return window.setTimeout(function(){
			f.apply(agent);
		}, msec);
	};
	this.startTimer = function(msec, agent, fun){
		var f = typeof fun == "string" ? agent[fun] : fun;
		var timer = this.addThread(msec, this, function(){
			try{
				var ret = f.apply(agent);
				if(ret === true){
					timer = this.addThread(msec, this, arguments.callee);
				}else{
					window.clearTimeout(timer);
					timer = 0;
				}
			}catch(ex){
				this.log("[WebRuntime::startTimer]" + ex.message);
			}
		});
		return timer;
	};
});
/*</file>*/
/*<file name="alz/core/LibManager.js">*/
_package("alz.core");

_class("LibManager", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._hash = {};
		this._libs = [];
		this._libExt = ".lib.js";  //库文件默认的后缀名
	};
	this.dispose = function(){
		//卸载库模块
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
	this.destroy = function(){
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
		if(typeof lib == "function"){  //基础库core.lib,ui.lib已经改造为function对象
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
	 * 执行和初始化文件一起加载并且尚未初始化的库代码
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
/*</file>*/
/*<file name="alz/core/ScriptLoader.js">*/
_package("alz.core");

_import("alz.core.EventTarget");

/**
 * JS文件加载器
 */
_class("ScriptLoader", EventTarget, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._event = runtime.ie ? "onreadystatechange" : "onload";
		this._scripts = [];
		this._agent = null;
		this._fun = null;
		this._urls = null;
		this._index = 0;
	};
	this.create = function(agent, fun){
		this._agent = agent;
		this._fun = fun;
	};
	this.dispose = function(){
		this._fun = null;
		this._agent = null;
		for(var i = 0, len = this._scripts.length; i < len; i++){
			this._scripts[i][this._event] = null;
			this._scripts[i] = null;
		}
		this._scripts = [];
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.createScript = function(parent, url){
		var _this = this;
		var obj = runtime.getDocument().createElement("script");
		obj.type = "text/javascript";
		obj.charset = "utf-8";
		obj[this._event] = function(){
			//脚本如果缓存状态为 complete，否则为 loaded
			if(runtime.ie && !(this.readyState == "loaded" || this.readyState == "complete")){
				return;
			}
			_this.fireEvent({type: "load"});
		};
		obj.src = url;
		this._scripts.push(obj);
		parent.appendChild(obj);
		return obj;
	};
	/**
	 * 一次加载一个或多个脚本
	 */
	this.load = function(urls, data, skipcb){
		if(!skipcb){
			for(var i = 0, len = urls.length; i < len; i++){
				urls[i] += "?"
					+ "_cb_=0,runtime._ajax._data"  //0=(变量赋值，n=v),1=(函数回调，f(v))
					+ "&ts=" + new Date().getTime()
					+ (data ? "&" + data : "");
			}
		}
		this._urls = urls;
		this.onLoad();
	};
	this.onLoad = function(ev){
		if(this._index >= this._urls.length){  //完成
			this._fun.apply(this._agent);
			this.dispose();
		}else{
			this.createScript(runtime._domScript.parentNode, this._urls[this._index++]);
		}
	};
});
/*</file>*/
/*<file name="alz/core/LibLoader.js">*/
_package("alz.core");

_import("alz.core.ScriptLoader");

/**
 * LibLoader
 * 文件加载引擎，使用script或者link加载js和css文件
 * 其中js文件的种类包括(conf,lib,tpl)
 */
_class("LibLoader", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._libs = [];
		this._fileExt = ".js";  //库文件默认的后缀名
		this._codeProvider = "";
		this._index = 0;
		this._agent = null;
		this._funName = "";
	};
	this.dispose = function(){
		this._agent = null;
		this._libs = [];
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * @param {String} libs 逗号分割的库名列表
	 * @param {WebRuntime} agent
	 * @param {String} funName
	 * 回调函数参数格式：fun(lib, libConf, loaded)
	 * lib     = 库文件名信息
	 * libConf = 库配置信息
	 * loaded  = 资源请求队列是否加载完毕
	 */
	this.init = function(libs, codeProvider, agent, funName){  //加载库代码
		for(var i = 0, len = libs.length; i < len; i++){
			var lib = libs[i];
			if(typeof lib == "string"){
				var type;  //lib|tpl
				var name = lib;
				var inApp = name.charAt(0) == "#";
				if(inApp){
					name = name.substr(1);  //过滤掉名字开头的"#"
				}
				var p = name.lastIndexOf(".");
				if(p == -1){
					type = "lib";
				}else{
					type = name.substr(p + 1);
					name = name.substring(0, p);
				}
				this._libs.push({"type": type, "name": name, "inApp": inApp});
			}else{
				this._libs.push(lib);
			}
		}
		this._codeProvider = codeProvider;
		this._agent = agent;
		this._funName = funName;
		this._start();
	};
	this._start = function(){
		runtime.addThread(10, this, "_loadLib");
	};
	/**
	 * 根据库名计算对应的url地址
	 * @param {String} name lib或tpl库名称
	 */
	this.getUrlByName = function(lib){
		/*
		var libUrl = "http://www.alzui.net/build/lib.php";
		if(!lib.inApp){  //lib.name.charAt(0) != "#"
			return libUrl + "?lib=" + lib.name;
		}else{
			return libUrl + "?lib=" + lib.name.substr(1);
		}
		*/
		var src;
		if(this._codeProvider != ""){
			src = this._codeProvider.replace(/\{filename\}/g, lib.name + "." + lib.type);
		}else{
			var path;
			if(!lib.inApp){  //lib.name.charAt(0) != "#"
				path = runtime.pathLib;  //内核扩展库
			}else{  //从应用目录下加载库文件
				path = runtime.getConfigData("pathapp") || runtime.pathLib;  //具体应用库
			}
			src = path + lib.name + "." + lib.type + this._fileExt;
		}
		return src;
	};
	this._loadLib = function(){
		if(this._index >= this._libs.length){  //如果没有库代码，则直接执行回调
			this._agent[this._funName]();  //注意没有库名
			return;
		}
		/*
		this._doc.write("<sc" + "ript"
			+ " type=\"text/javascript\""
			+ " src=\"" + this.pathLib + libs[i] + ".lib.js\""
			+ " charset=\"utf-8\""
			+ "></sc"+"ript>");
		*/
		this.loadLibScript(this._libs[this._index]);
	};
	this.loadLibScript = function(lib, agent, fun){
		var name = lib.name;
		var _this = this;
		if(runtime._host.xul){
			//if(lib.inApp){  //name.charAt(0) == "#"
			//	lib.name = name.substr(1);
			//}
			//<script type="text/javascript" src="/sinamail-dev/build/file.php?f=/rny/sinamail52/js/090731/{$name}.lib.js"/>
			//var url = this.getUrlByName(lib);
			var url = "/sinamail-dev/build/file.php?f=/rny/sinamail52/js/090731/" + name + ".lib.js";
			var http = new XMLHttpRequest();
			http.open("GET", url, false);
			http.onreadystatechange = function(){
				if(http.readyState != 4) return;
				if(http.status == 0 || (http.status >= 200 && http.status < 300)){
					var code = http.responseText;
					eval(code);
					if(agent){
						fun.apply(agent, [lib, _this.getLibConf(lib), false]);
					}else{
						_this._onLoad();
					}
				}
				http.onreadystatechange = null;
			};
			http.send("");  //FF下面参数null不能省略
		}else{  //加载(lib.js,tpl.js)文件
			var loader = new ScriptLoader();
			loader.create(this, function(){
				if(agent){
					fun.apply(agent, [lib, this.getLibConf(lib), false]);
				}else{
					this._onLoad();
				}
			});
			loader.load([this.getUrlByName(lib)], "", true);
			loader = null;
		}
	};
	this._onLoad = function(){
		var lib = this._libs[this._index];
		//var name = lib.name.replace(/#/g, "");
		var argv = [lib, this.getLibConf(lib), false];
		var fun = typeof this._funName == "function" ? this._funName : this._agent[this._funName];
		fun.apply(this._agent, argv);
		this._index++;
		if(this._index < this._libs.length){
			if(this._index == 1 && (lib.name == "core" && runtime.getConfData("product"))){  //有产品配置的话，加载产品配置数据
				var loader = new ScriptLoader();
				loader.create(this, function(){
					this._start();  //加载完毕，再开始加载剩余的库文件
					loader = null;
				});
				loader.load([runtime.getConfigData("pathlib") + runtime.getConfData("product")], "", true);
			}else{
				this._start();
			}
		}else{  //加载完毕
			argv[2] = true;  //表示加载完毕
			fun.apply(this._agent, argv);
		}
		fun = null;
	};
	this.getLibConf = function(lib){
		if(lib.type == "tpl"){
			return null;  //runtime._libManager._hash[lib.name]
		}else{
			return runtime._libManager._hash[lib.name];
		}
	};
});
/*</file>*/

//core.lib
//import alz.core.XPathQuery;
/*<file name="alz/core/DOMUtil.js">*/
_package("alz.core");

_class("DOMUtil", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._components = [];
		this._nodes = [];
		this._domTemp = null;
		this._css = null;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._css = null;
		this._domTemp = null;
		//解除所有DOM元素和脚本对象的绑定关系
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i].dispose();
			this._nodes[i] = null;
		}
		this._nodes = [];
		for(var i = 0, len = this._components.length; i < len; i++){
			this._components[i].dispose();
			this._components[i] = null;
		}
		this._components = [];
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.createDomElement = function(html, parent){
		if(!this._domTemp){
			this._domTemp = window.document.createElement("div");
		}
		this._domTemp.innerHTML = html;
		var obj = this._domTemp.removeChild(this._domTemp.childNodes[0]);
		if(parent){
			parent.appendChild(obj);
			/*
			//滞后加载图片
			var imgs = obj.getElementsByTagName("img");
			for(var i = 0, len = imgs.length; i < len; i++){
				imgs[i].src = imgs[i].getAttribute("src0");
			}
			imgs = null;
			*/
		}
		return obj;
	};
	/**
	 * 计算 el 相对于 refElement 的位置，一定要保证 refElement 包含 el
	 * [TODO]如何计算绝对定位的元素？相对于外部的位置
	 */
	this.getPos = function(el, refElement){
		try{
		var pos = {x: 0, y: 0};
		//var sb = [];
		for(var o = el; o; o = o.offsetParent){
			var s = "tagName=" + o.tagName + ",className=" + o.className;
			var x = 0, y = 0, a, b;
			var style = this.getStyle(o);
			if(o != el && o != refElement){
				//a = this.parseNum(o.tagName, style.borderLeftWidth);
				//b = this.parseNum(o.tagName, style.borderTopWidth);
				a = this.getStyleProperty(o, "borderLeftWidth");
				b = this.getStyleProperty(o, "borderTopWidth");
				x += isNaN(a) ? 0 : a;
				y += isNaN(b) ? 0 : b;
				//s += ",borderLeftWidth=" + a + ",borderTopWidth=" + b;
			}
			/*
			if(o != el && runtime.getBoxModel() == 0){
				x += this.parseNum(o.tagName, style.paddingLeft);
				y += this.parseNum(o.tagName, style.paddingTop);
			}
			*/
			if(o != refElement){
				pos.x += o.offsetLeft + (o != el ? x : 0);
				pos.y += o.offsetTop + (o != el ? y : 0);
				//s += ",offsetLeft=" + o.offsetLeft + ",offsetTop=" + o.offsetTop;
			}else{
				a = this.getStyleProperty(o, "borderLeftWidth");
				b = this.getStyleProperty(o, "borderTopWidth");
				//pos.x += this.parseNum(o.tagName, style.borderLeftWidth);
				//pos.y += this.parseNum(o.tagName, style.borderTopWidth);
				pos.x += a;
				pos.y += b;
				//s += ",borderLeftWidth=" + a + ",borderTopWidth=" + b;
				style = null;
				//sb.push(s);
				break;
			}
			//sb.push(s);
			if(o.tagName == "BODY" || o.tagName == "HTML") break;
			style = null;
		}
		//$("log_off").value += "\n" + sb.join("\n");
		}catch(ex){
			window.alert(ex.message);
		}
		return pos;
	};
	this.getPos1 = function(ev, type, refElement){
		var pos = type == 1 ? (
			runtime._host.env == "ie"
			? {"x": ev.offsetX, "y": ev.offsetY}
			: {"x": ev.layerX, "y": ev.layerY}
		) : {"x": 0, "y": 0};
		refElement = refElement || runtime.getDocument().body;
		var obj = ev.srcElement || ev.target;
		while(obj && obj != refElement){
			pos.x += obj.offsetLeft;
			pos.y += obj.offsetTop;
			obj = obj.offsetParent;
		}
		return pos;
	};
	/**
	 * 统一 IE 和 Moz 系列浏览器的差异
	 */
	this.parseNum = function(tag, v){
		switch(v){
		case "medium":
			return tag == "DIV" ? 0 : 2;
		case "thin":
			return tag == "DIV" ? 0 : 1;
		case "thick":
			return tag == "DIV" ? 0 : 1;
		default:
			var a = parseInt(v);
			return isNaN(a) ? 0 : a;
		}
	};
	/**
	 * 统一 IE 和 Moz 系列浏览器的差异
	 */
	this.getPropertyValue = function(style, name){
		//return runtime.ie ? style[name] : style.getPropertyValue(name);
		//return runtime._host.env == "ie" ? style[name] : (style.getPropertyValue(name) || style.getPropertyCSSValue(name));
		return style[name];
	};
	this.getStyle = function(el){
		var style, view = runtime.getDocument().defaultView;
		if(view && view.getComputedStyle){
			style = view.getComputedStyle(el, null);
		}else if(el.currentStyle){
			style = el.currentStyle;
		}else{
			throw "无法动态获取DOM的实际样式属性";
		}
		return style;
	};
	this.getStyleProperty = function(el, name){
		var style = this.getStyle(el);
		return this.parseNum(el.tagName, this.getPropertyValue(style, name) || el.style[name]);
	};
	this.setStyleProperty = function(el, name, value){
		el.style[name] = value;
	};
	this._setStyleProperty = function(el, name, value){
		try{
		switch(name){
		case "width":
			if(runtime.getBoxModel() == 1){
				value -= this.getStyleProperty(el, "borderLeftWidth")
							 + this.getStyleProperty(el, "paddingLeft")
							 + this.getStyleProperty(el, "paddingRight")
							 + this.getStyleProperty(el, "borderRightWidth");
			}
			el.style[name] = Math.max(0, value) + "px";
			break;
		case "height":
			if(runtime.getBoxModel() == 1){
				value -= this.getStyleProperty(el, "paddingTop") + this.getStyleProperty(el, "paddingBottom");
			}
			el.style[name] = Math.max(0, value) + "px";
			break;
		}
		}catch(ex){
			window.alert(ex.message);
		}
	};
	this.getObj = function(el){
		var clazz = __context__.__classes__["alz.mui.Component"];
		var component = new clazz();
		component._domCreate = true;
		this._components.push(component);  //注册 component
		component.bind(el);  //绑定 DOM 元素
		return component;
	};
	this.getObj = function(el){
		var obj;
		if(!("__ptr__" in el)){
			obj = new BoxElement();
			obj._dom = this;
			obj.init(el);
			this._nodes.push(obj);
		}else{
			obj = el.__ptr__;
		}
		return obj;
	};
	this.getObj1 = function(el){
		var obj;
		if(!("__ptr__" in el)){
			//obj = new BoxElement(el, this);
			obj = {
				_self: el,
				dispose: function(){
					this._self.__ptr__ = null;
					this._self = null;
				}
			};
			el.__ptr__ = obj;
			this._nodes.push(obj);
		}else{
			obj = el.__ptr__;
		}
		return obj;
	};
	this._create = function(tag){
		return window.document.createElement(tag);
	};
	this._setWidth = function(el, v){
		//if(runtime._host.compatMode != "BackCompat"){
		//	//window.alert("+" + forIn(this.getStyle(el)).join("\n"));
		//	v -= this.getStyleProperty(el, "borderLeftWidth") + this.getStyleProperty(el, "borderRightWidth");
		//}
		v = Math.max(0, v);
		this.setStyleProperty(el, "width", v + "px");
	};
	this._setHeight = function(el, v){
		//if(runtime._host.compatMode != "BackCompat"){
		//	v -= this.getStyleProperty(el, "borderTopWidth") + this.getStyleProperty(el, "borderBottomWidth");
		//}
		v = Math.max(0, v);
		this.setStyleProperty(el, "height", v + "px");
	};
	this.getWidth = function(el){
		var obj = this.getObj1(el);
		//if(!("_width" in obj)){
			if(runtime._host.compatMode != "BackCompat"){
				obj._width = el.offsetWidth;  // - (runtime._host.env == "ie" ? 0 : this.getStyleProperty(el, "borderLeftWidth") + this.getStyleProperty(el, "borderRightWidth"))
			}else{
				obj._width = this.getStyleProperty(el, "borderLeftWidth")
					+ el.offsetWidth  //this.getStyleProperty(el, "width")
					+ this.getStyleProperty(el, "borderRightWidth");
			}
		//}
		return obj._width;
		//obj = null;
	};
	this.getHeight = function(el){
		var obj = this.getObj1(el);
		//if(!("_height" in obj)){
			if(runtime._host.compatMode != "BackCompat"){
				obj._height = el.offsetHeight;
			}else{
				obj._height = this.getStyleProperty(el, "borderTopWidth")
					+ el.offsetHeight  //this.getStyleProperty(el, "height")
					+ this.getStyleProperty(el, "borderBottomWidth");
			}
		//}
		return obj._height;
		//obj = null;
	};
	this.setWidth = function(el, v){
		var obj = this.getObj1(el);
		if(!("_width" in obj)) obj._width = 0;
		v = Math.max(v/* - obj._marginLeft - obj._marginRight*/, 0);
		//if(el.className == "pane-top") window.alert(obj._width + "!=" + v);
		//if(obj._width != v){
			obj._width = v;
			var w = this.getInnerWidth(el, v);
			this._setWidth(el, w);
		//}
		obj = null;
	};
	this.setHeight = function(el, v){
		var obj = this.getObj1(el);
		if(!("_height" in obj)) obj._height = 0;
		v = Math.max(v/* - obj._marginTop - obj._marginBottom*/, 0);
		if(obj._height != v){
			obj._height = v;
			var w = this.getInnerHeight(el, v);
			this._setHeight(el, w);
		}
		obj = null;
	};
	this.getInnerWidth = function(el, v){
		var obj = this.getObj1(el);
		if(!v) v = obj._width;
		var innerWidth = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v - obj._borderLeftWidth - obj._borderRightWidth - obj._paddingLeft - obj._paddingRight);
		//var innerWidth = Math.max(0, runtime.getBoxModel() == 0 ? v : v - this._borderLeftWidth - this._borderRightWidth - this._paddingLeft - this._paddingRight);
		obj = null;
		if(isNaN(innerWidth)) runtime.log("DomUtil::getInnerWidth isNaN(innerWidth)");
		return innerWidth;
	};
	this.getInnerHeight = function(el, v){
		var obj = this.getObj1(el);
		if(!v) v = obj._height || el.offsetHeight;
		var innerHeight = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v - obj._borderTopWidth - obj._borderBottomWidth - obj._paddingTop - obj._paddingBottom);
		obj = null;
		if(isNaN(innerHeight)) runtime.log("DomUtil::getInnerHeight isNaN(innerHeight)");
		return innerHeight;
	};
	this.getOuterWidth = function(el, v){
		var obj = this.getObj1(el);
		if(!v) v = this.getWidth(el);
		var outerWidth = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v + obj._marginLeft + obj._marginRight);
		obj = null;
		if(isNaN(outerWidth)) window.alert("DomUtil::getOuterWidth isNaN(outerWidth)");
		return outerWidth;
	};
	this.getOuterHeight = function(el, v){
		var obj = this.getObj1(el);
		if(!v) v = this.getHeight(el);
		var outerHeight = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v + obj._marginTop + obj._marginBottom);
		obj = null;
		if(isNaN(outerHeight)) window.alert("DomUtil::getOuterHeight isNaN(outerHeight)");
		return outerHeight;
	};
	this.getWidth = function(el){
		if(!el._ptr) this.getObj(el);
		return el._ptr.getWidth();
	};
	this.setWidth = function(el, w){
		if(!el._ptr) this.getObj(el);
		el._ptr.setWidth(w);
		//this._setStyleProperty(el, "width", w);
	};
	this.getHeight = function(el){
		if(!el._ptr) this.getObj(el);
		return el._ptr.getHeight();
	};
	this.setHeight = function(el, h){
		if(!el._ptr) this.getObj(el);
		el._ptr.setHeight(h);
		//this._setStyleProperty(el, "height", h);
	};
	this.getInnerWidth = function(el){
		if(!el._ptr) this.getObj(el);
		return el._ptr.getInnerWidth();
		/*
		//if(runtime.getBoxModel() == 1){
			return Math.max(0, el.offsetWidth - this.getStyleProperty(el, "borderLeftWidth") - this.getStyleProperty(el, "paddingLeft") - this.getStyleProperty(el, "paddingRight") - this.getStyleProperty(el, "borderRightWidth"));
		//}
		*/
	};
	this.getInnerHeight = function(el){
		if(!el._ptr) this.getObj(el);
		return el._ptr.getInnerHeight();
	};
	this.resize = function(el, w, h, reDoSelf){
		if(!el._ptr) this.getObj(el);
		if(reDoSelf) el._ptr.resize(w, h);  //是否调整自身的大小
		//if(el.getAttribute("id") != "") window.alert(el.id);
		var nodes = el.childNodes;
		//if(el.getAttribute("html") == "true") window.alert("123");
		if(el.getAttribute("aui") != "" &&
			!(el.getAttribute("noresize") == "true" ||
				el.getAttribute("html") == "true") &&
			nodes.length > 0){  //忽略 head 内元素
			var ww = this.getInnerWidth(el);
			var hh = this.getInnerHeight(el);
			for(var i = 0, len = nodes.length; i < len; i++){
				if(nodes[i].nodeType != 1){  //NODE_ELEMENT
					continue;
				}
				var w0 = this.getWidth(nodes[i]);
				var h0 = this.getHeight(nodes[i]);
				//if(nodes[i].id == "dlgBody") window.alert(w0);
				this.setWidth(nodes[i], w0);
				//this.setHeight(nodes[i], h0);
				this.resize(nodes[i], ww, h0, true);
			}
		}
	};
	this.resizeElement = function(el, w, h){
		el.style.width = Math.max(0, w) + "px";
		el.style.height = Math.max(0, h) + "px";
	};
	this.moveElement = function(el, x, y){
		el.style.left = Math.max(0, x) + "px";
		el.style.top = Math.max(0, y) + "px";
	};
	this.moveTo = function(el, x, y){
		var obj = this.getObj1(el);
		if(!("_left" in obj)) obj._left = 0;
		if(!("_top" in obj)) obj._top = 0;
		obj._left = x;
		this.setStyleProperty(el, "left", x + "px");
		obj._top = y;
		this.setStyleProperty(el, "top", y + "px");
	};
	this.setOpacity = function(el, v){
		var obj = this.getObj1(el);
		if(!("_opacity" in obj)) obj._opacity = 0;
		if(obj._opacity != v){
			v = Math.max(0, Math.min(1, v));
			obj._opacity = v;
			switch(runtime._host.env){
			case "ie":
				v = Math.round(v * 100);
				this.setStyleProperty(el, "filter", v == 100 ? "" : "Alpha(Opacity=" + v + ")");
				break;
			case "ff":
			case "ns":
				this.setStyleProperty(el, "MozOpacity", v == 1 ? "" : v);
				break;
			case "opera":
			case "safari":
			case "chrome":
				this.setStyleProperty(el, "opacity", v == 1 ? "" : v);
				break;
			}
		}
		obj = null;
	};
	this.selectNodes = function(el, xpath){
		return runtime.ie ? el.childNodes : el.selectNodes(xpath);
	};
	this.getViewPort = function(el){
		/*return {
			"x": 0,
			"y": 0,
			"w": el.clientWidth,
			"h": el.clientHeight,
			//"w1": el.scrollWidth,
			//"h1": el.scrollHeight
		};*/
		var rect = {
			"x": el.scrollLeft,
			"y": el.scrollTop,
			"w": el.clientWidth,  //Math.max(el.clientWidth || el.scrollWidth)
			"h": Math.max(el.clientHeight, el.parentNode.clientHeight)  //Math.max(el.clientHeight || el.scrollHeight)
		};
		rect.w = Math.max(el.clientWidth, el.parentNode.clientWidth);
		rect.h = Math.max(el.clientHeight, el.parentNode.clientHeight);
		return rect;
	};
	/**
	 * @param el 要绑定事件的DOM元素
	 * @param type 事件类型，如果参数fun为事件监听对象，则该参数将被忽略
	 * @param fun 事件响应函数或者事件监听对象
	 * @param obj 回调函数中的this指代对象，如果没有该参数，缺省为el
	 */
	//[memleak]DOMUtil.__hash__ = {};
	//[memleak]DOMUtil.__id__ = 0;
	this.addEventListener = function(el, type, fun, obj){
		//[memleak]el.__hashid__ = "_" + (DOMUtil.__id__++);
		//[memleak]DOMUtil.__hash__[el.__hashid__] = {el:el,type:type,fun:fun,obj:obj};
		switch(typeof fun){
		case "function":
			el.__callback = (function(cb, obj){
				return function(ev){
					return cb.call(obj, ev || window.event);  //保证回调函数中的this是当前DOM对象或者对应的脚本组件
				};
			})(fun, obj || el);
			if(el.attachEvent){
				el.attachEvent("on" + type, el.__callback);
			}else{
				el.addEventListener(type, el.__callback, false);
			}
			break;
		case "object":
			el.__callback = (function(listener, obj){
				return function(ev){
					return listener[ev.type].call(obj, ev || window.event);  //保证回调函数中的this是当前DOM对象或者对应的脚本组件
				};
			})(fun, obj || el);
			for(var k in fun){
				if(el.attachEvent){
					el.attachEvent("on" + k, el.__callback);
				}else{
					el.addEventListener(k, el.__callback, false);
				}
			}
			break;
		}
	};
	this.removeEventListener = function(el, type, fun){
		if(!el.__callback) return;
		//[memleak]delete DOMUtil.__hash__[el.__hashid__];
		switch(typeof fun){
		case "function":
			if(el.detachEvent){
				el.detachEvent("on" + type, el.__callback);
			}else{
				el.removeEventListener(type, el.__callback, false);
			}
			break;
		case "object":
			for(var k in fun){
				if(el.detachEvent){
					el.detachEvent("on" + k, el.__callback);
				}else{
					el.removeEventListener(k, el.__callback, false);
				}
			}
			break;
		}
		el.__callback = null;
	};
	this.contains = function(el, obj){
		if(el.contains){
			return el.contains(obj);
		}else{
			for(var o = obj; o; o = o.parentNode){
				if(o == el) return true;
				if(!o.parentNode) return false;
			}
			return false;
		}
	};
	this.parseRule = function(hash, arr, style){
		var key = arr[0];
		if(key in hash){
			//window.alert("merge css");
		}else{
			if(key.indexOf("_") != -1){
				var arr1 = key.split("_");
				this.parseRule(hash[arr1[0]]["__state"], arr1.slice(1), style);
			}else{
				//精简css样式
				var map = {"cssText":1,"length":1,"parentRule":1,"background-image":1};
				var style0 = {};
				if(arr.length == 1){
					for(var k in style){
						if(k in map || style[k] == "") continue;
						style0[k] = style[k];
					}
				}

				var obj = {};
				obj["__nodes"] = [];  //使用这个样式的元素
				//obj["__selectorText"] = arr.slice(1).join(" ");
				obj["__style"] = style0;
				obj["__state"] = {};
				hash[key] = obj;
			}
		}
		if(arr.length > 1){
			this.parseRule(hash[key], arr.slice(1), style);
		}
	};
	this.parseCss = function(rules){
		var hash = {};
		for(var i = 0, len = rules.length; i < len; i++){
			if(rules[i].type == 2) continue;
			//rules[i].selectorText + "{" + rules[i].style.cssText + "}"
			this.parseRule(hash, rules[i].selectorText.split(" "), rules[i].style);
		}
		return hash;
	};
	this.cssKeyToJsKey = function(str){
		return str.replace(/-([a-z])/g, function(_0, _1){
			return _1.toUpperCase();
		});
	};
	/**
	 * 应用json格式的css样式控制DOM元素的外观
	 * @param {HTMLELement} el 要控制的DOM元素
	 * @param {JsonCssData} css json格式的CSS数据
	 * @param {String} className 样式名称
	 */
	this.applyCssStyle = function(el, css, className){
		var style = css[(el.className == "error" ? "error-" : "") + className];
		if(el.__ptr__){
			for(var k in style){
				var v = style[k];
				if(k.charAt(0) == "_"){
					var obj = el.getElementsByTagName(k.substr(1))[0];
					for(var key in v){
						var name = this.cssKeyToJsKey(key);
						if(obj.style[name] != v[key]){
							obj.style[name] = v[key];
						}
					}
					obj = null;
				}else{
					var name = this.cssKeyToJsKey(k);
					if(el.style[name] != v){
						el.style[name] = v;
					}
				}
			}
		}else{
			for(var k in style){
				var v = style[k];
				if(k.charAt(0) == "_"){
					var obj = el._ee[k];
					for(var key in v){
						var name = this.cssKeyToJsKey(key);
						if(obj.style[name] != v[key]){
							obj.style[name] = v[key];
						}
					}
					obj = null;
				}else{
					var name = this.cssKeyToJsKey(k);
					if(el._self.style[name] != v){
						el._self.style[name] = v;
					}
				}
			}
		}
		style = null;
	};
	this.applyCssStyle1 = function(el, xpath, className){
		if(!this._css){
			this._css = this.parseCss(runtime._doc.styleSheets[1][runtime.ie ? "rules" : "cssRules"]);
		}
		var css;
		var arr = xpath.split(" ");
		if(arr.length == 1){
			css = this._css[xpath].__state;
		}else{
			for(var i = 0, len = arr.length, css = this._css; i < len; i++){
				css = css[arr[i]];
			}
			css = css.__state;
		}
		var style = css[(el.className == "error" ? "error-" : "") + className];
		if(el.__ptr__){
			for(var k in style){
				var v = style[k];
				if(k.charAt(0) == "_"){
					var obj = el.getElementsByTagName(k.substr(1))[0];
					for(var key in v){
						var name = this.cssKeyToJsKey(key);
						if(obj.style[name] != v[key]){
							obj.style[name] = v[key];
						}
					}
					obj = null;
				}else{
					var name = this.cssKeyToJsKey(k);
					if(el.style[name] != v){
						el.style[name] = v;
					}
				}
			}
		}else{
			for(var k in style){
				if(k == "__nodes" || k == "__state") continue;
				if(k == "__style"){
					var o = style[k];
					for(var m in o){
						if(el._self.style[m] != o[m]){
							el._self.style[m] = o[m];
						}
					}
				}else{
					var v = style[k]["__style"];
					var obj = el._ee["_" + k];
					for(var key in v){
						var name = key;
						if(obj.style[name] != v[key]){
							obj.style[name] = v[key];
						}
					}
					obj = null;
				}
			}
		}
		style = null;
	};
});
/*</file>*/
/*<file name="alz/core/BoxElement.js">*/
_package("alz.core");

_class("BoxElement", "", function(_super){
	//BoxElement._all_ = [];
	this._init = function(el, parent){
		_super._init.call(this);
		this._win = window;
		this._doc = window.document;
		this._parent = parent || null;
		this._self = null;
		this._nodes = [];
		this._style = {};
		this.__style = null;  //DOM元素的style属性
		this._currentStyle = {};
		this.__layout = null;  //{AbstractLayout}
		this._layout = "";
		this._align = "";
		this._boxmode = runtime._host.compatMode != "BackCompat";
		//BoxElement._all_.push(this);
		if(el){
			this.init(el);
		}
	};
	this._createElement = function(tag){
		return this._doc.createElement(tag);
	};
	this._createTextNode = function(text){
		return this._doc.createTextNode(text);
	};
	this.create = function(parent, data){
		if(data["__type__"] == "string"){
			var obj = this._createTextNode(data["__contain__"][0][""]);
			if(parent){
				this._parent = parent;
				parent._self.appendChild(obj);
				//parent._nodes.push(this);
				//this._self = obj;
				//parent.appendNode(this);
			}else{
				parent = this._doc.body;
				parent.appendChild(obj);
			}
			return obj;
		}
		var obj = this._createElement("div");
		obj.style.position = "absolute";
		obj.style.overflow = "hidden";
		//obj.style.width = "100%";
		//obj.style.height = "100%";
		if(parent){
			this._parent = parent;
			parent._self.appendChild(obj);
			//parent._nodes.push(this);
			//this._self = obj;
			//parent.appendNode(this);
		}else{
			parent = this._doc.body;
			parent.appendChild(obj);
		}
		this.init(obj);
		for(var k in data){
			if(k == "__contain__"){
				for(var i = 0, len = data[k].length; i < len; i++){
					var node = new BoxElement();
					node.create(this, data[k][i]);
					this.appendNode(node);
					node = null;
				}
			}else{
				this.setattr(k, data[k]);
			}
		}
		return obj;
	};
	this.init = function(obj){
		obj.__ptr__ = this;
		this._self = obj;
		this.__style = obj.style;
		//初始化应用到的属性，从DOM对象中解析出实际的值，只读方式使用
		var properties = [
			"width","height",
			"marginLeft","marginRight","marginTop","marginBottom",
			"borderLeftWidth","borderRightWidth","borderTopWidth","borderBottomWidth",
			"paddingLeft","paddingRight","paddingTop","paddingBottom"
		];
		for(var i = 0, len = properties.length; i < len; i++){
			var key = properties[i];
			if(!("_" + key in this)){
				this["_" + key] = this.getStyleProperty(key) || 0;
			}
		}
		this.setattr("align", this._self.getAttribute("_align") || "");
		this.setattr("layout", this._self.getAttribute("_layout") || "");
		if(this._layout){
			var nodes = this._self.childNodes;
			for(var i = 0, len = nodes.length; i < len; i++){
				var node = nodes[i];
				if(node.nodeType == 1 && node.getAttribute("_align")){
					this.appendNode(new BoxElement(node, this));
				}
				node = null;
			}
			nodes = null;
			//runtime.log(this._self.tagName + "----" + this._nodes.length);
		}
		this._self.style.margin = "0px";
		this._self.style.padding = "0px";
	};
	this.dispose = function(){
		if(this.__layout){
			this.__layout.dispose();
			this.__layout = null;
		}
		this.__style = null;
		this._self.__ptr__ = null;
		this._self = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.appendNode = function(node){
		if(node._self && node._self.parentNode == null){
			this._self.appendChild(node._self);
		}
		this._nodes.push(node);
	};
	/**
	 * 统一 IE 和 Moz 系列浏览器的差异
	 */
	this.parseInt = function(tag, v){
		switch(v){
		case "medium": return tag == "DIV" ? 0 : 2;
		case "thin"  : return tag == "DIV" ? 0 : 1;
		case "thick" : return tag == "DIV" ? 0 : 1;
		default:
			var a = parseInt(v);
			return isNaN(a) ? 0 : a;
		}
	};
	if(document.defaultView){
		this._getStyle = function(){
			return this._doc.defaultView.getComputedStyle(this._self, null);
		};
	}else{
		this._getStyle = function(){
			return this._self.currentStyle;
		};
	}
	/*
	this._getStyle = function(){
		var style, view = this._doc.defaultView;
		if(view && view.getComputedStyle){
			style = view.getComputedStyle(this._self, null);
		}else if(this._self.currentStyle){
			style = this._self.currentStyle;
		}else{
			throw "无法动态获取DOM的实际样式属性";
		}
		return style;
	};
	*/
	this._getPropertyValue = function(style, name){
		//return runtime._host.env == "ie" ? style[name] : (style.getPropertyValue(name) || style.getPropertyCSSValue(name));
		return style[name];
	};
	this.getStyleProperty = function(name){
		return this.parseInt(this._self.tagName, this._getPropertyValue(this._getStyle(), name) || this._self.style[name]);
	};
	this.setStyleProperty = function(name, value){
		this.__style[name] = value;
	};
	this.getProperty = function(name){
		return this["_" + name];
	};
	this.setLeft = function(x){
		this.setStyleProperty("left", x + "px");
		//this.__style.left = x + "px";
	};
	this.setTop = function(y){
		this.setStyleProperty("top", y + "px");
		//this.__style.top = y + "px";
	};
	this._setWidth = function(w){
		//if(this._boxmode){
		//	w -= this._borderLeftWidth + this._borderRightWidth;
		//}
		this.setStyleProperty("width", Math.max(0, w) + "px");
	};
	this._setHeight = function(h){
		//if(this._boxmode){
		//	h -= this._borderTopWidth + this._borderBottomWidth;
		//}
		this.setStyleProperty("height", Math.max(0, h) + "px");
	};
	this.getWidth = function(){
		//return this._dom.getWidth(this._self);
		// - (runtime._host.env == "ie" ? 0 : this._borderLeftWidth + this._borderRightWidth)
		this._width = this._self.offsetWidth || parseInt(this._getStyle().width, 16);  // + (this._boxmode ? this._borderLeftWidth + this._borderRightWidth : 0);
		return this._width;
	};
	this.setWidth = function(w){
		//this._dom.setWidth(this._self, w);
		if(this._width != w){
			w = Math.max(0, w/* - this._marginLeft - this._marginRight*/);
			this._width = w;
			this._setWidth(this._self.tagName == "TABLE" ? w : this.getInnerWidth(w));
		}
	};
	this.getHeight = function(){
		//return this._dom.getHeight(this._self);
		//if(this._style.height.indexOf("%") != -1){
		//	return Math.round(this._self.parentNode.clientHeight * parseInt(this._style.height, 10) / 100);
		//}else{
			this._height = this._self.offsetHeight || parseInt(this._getStyle().height, 16);  // + (this._boxmode ? this._borderTopWidth + this._borderBottomWidth : 0);
			return this._height;
		//}
	};
	this.setHeight = function(h){
		//this._dom.setHeight(this._self, h);
		if(this._height != h){
			h = Math.max(0, h/* - this._marginTop - this._marginBottom*/);
			this._height = h;
			this._setHeight(this._self.tagName == "TABLE" ? h : this.getInnerHeight(h));
		}
	};
	this.getInnerWidth = function(v){
		if(!v) v = this._width;
		var innerWidth = Math.max(0, !this._boxmode ? v : v - this._borderLeftWidth - this._borderRightWidth/* - this._paddingLeft - this._paddingRight*/);
		//var innerWidth = Math.max(0, runtime.getBoxModel() == 0 ? v : v - this._borderLeftWidth - this._borderRightWidth - this._paddingLeft - this._paddingRight);
		//if(isNaN(innerWidth)) runtime.log("BoxElement::getInnerWidth isNaN(innerWidth)");
		return innerWidth;
	};
	this.setInnerWidth = function(w, skip){
		//this.setWidth(w/*- this._marginLeft - this._marginRight*/);  //绝对定位，marginRight没有作用
		w = w - (skip ? 0 : (this._marginLeft + this._marginRight))
			- this._borderLeftWidth - this._borderRightWidth
			- this._paddingLeft - this._paddingRight;
		this.__style.width = Math.max(0, w) + "px";
	};
	this.getInnerHeight = function(v){
		if(!v) v = this._height || this._self.offsetHeight;
		var innerHeight = Math.max(0, !this._boxmode ? v : v - this._borderTopWidth - this._borderBottomWidth/* - this._paddingTop - this._paddingBottom*/);
		//if(isNaN(innerHeight)) runtime.log("BoxElement::getInnerHeight isNaN(innerHeight)");
		return innerHeight;
	};
	this.setInnerHeight = function(h){
		//this.setHeight(h - this._marginTop - this._marginBottom);
		h = h - this._marginTop - this._marginBottom
			- this._borderTopWidth - this._borderBottomWidth
			- this._paddingTop - this._paddingBottom;
		this.__style.height = Math.max(0, h) + "px";
	};
	this.getOuterWidth = function(v){
		if(!v) v = this.getWidth();
		var outerWidth = Math.max(0, this._boxmode ? v + this._marginLeft + this._marginRight : v);
		//if(isNaN(outerWidth)) runtime.log("BoxElement::getOuterWidth isNaN(outerWidth)");
		return outerWidth;
	};
	this.getOuterHeight = function(v){
		if(!v) v = this.getHeight();
		var outerHeight = Math.max(0, this._boxmode ? v + this._marginTop + this._marginBottom : v);
		//if(isNaN(outerHeight)) runtime.log("BoxElement::getOuterHeight isNaN(outerHeight)");
		return outerHeight;
	};
	this.getClientWidth = function(){
		return this._self.clientWidth || this._width;
	};
	this.getClientHeight = function(){
		return this._self.clientHeight || this._height;
	};
	this.moveTo = function(x, y){
		this.setLeft(x);
		this.setTop(y);
	};
	this.resizeTo = function(w, h){
		this.setWidth(w);
		this.setHeight(h);
	};
	this.resize = function(w, h){
		runtime.log(this._self.tagName + " resize(" + w + "," + h + ")");
		this.resizeTo(w, h);
		if(this._layout || this._style.layout){
			this._layout = this._style.layout;
			this.layout();
		}
	};
	this.setRect = function(x, y, w, h){
		this.moveTo(x, y);
		this.resizeTo(w, h);
	};
	this.hasLayout = function(){
		//if(!this._layout){
		//	this._layout = this._self.getAttribute("_layout");
		//}
		return this._layout;
	};
	this.layout = function(){
		//this.__style.overflow = "hidden";
		if(!this.__layout){
			_import("alz.layout." + this._layout);  //BorderLayout
			var clazz = (__context__ || __classes__)[this._layout];
			this.__layout = new clazz();
			this.__layout.init(this._self);
		}
		switch(this._self.tagName){
		case "BODY":
			this.__layout.layoutElement(this._self.clientWidth, this._self.clientHeight);
			break;
		case "TABLE":
			this.__layout.layoutElement(
				this._self.parentNode.clientWidth,
				this._self.parentNode.clientHeight - this._borderTopWidth - this._borderBottomWidth
			);
			break;
		default:
			this.__layout.layoutElement(
				this.getClientWidth() - this._paddingLeft - this._paddingRight,
				this.getClientHeight() - this._paddingTop - this._paddingBottom
			);
			break;
		}
	};
	this.setattr = function(name, value){
		this._style[name] = value;
		switch(name){
		case "id":
			this._id = value;
			break;
		case "layout":
			this._layout = value;
			//this._self.setAttribute("_" + name, value);
			break;
		case "align":
			this._align = value;
			//this._self.setAttribute("_" + name, value);
			break;
		case "z-index":
			this.__style.zIndex = value;
			break;
		case "float":
			this.__style.cssFloat = value;
			this.__style.styleFloat = value;
			break;
		case "border":
			this.__style.border = value;
			this._borderBottomWidth =
			this._borderLeftWidth =
			this._borderRightWidth =
			this._borderTopWidth = parseInt(value);
			break;
		case "bgcolor":
		case "background-color":
			this.__style.backgroundColor = value;
			break;
		case "width":
			this.__style.width = value;
			break;
		case "height":
			if(value.charAt(value.length - 1) == "%"){
				var h = Math.round(this._self.parentNode.clientHeight * parseInt(value, 10) / 100);
				this.setHeight(h);
			}else{
				this.setHeight(value);
			}
			break;
		default:
			this._self.setAttribute("_" + name, value);
			break;
		}
	};
});
/*</file>*/
/*<file name="alz/layout/AbstractLayout.js">*/
_package("alz.layout");

_class("AbstractLayout", "", function(_super){
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
/*</file>*/
/*<file name="alz/layout/BorderLayout.js">*/
_package("alz.layout");

_import("alz.core.BoxElement");
_import("alz.layout.AbstractLayout");

_class("BorderLayout", AbstractLayout, function(_super){
	var TAGS = {"NOSCRIPT":1,"INPUT":1};
	var CLASSES = {"wui-ModalPanel":1,"wui-Dialog":1};
	this._init = function(){
		_super._init.call(this);
		this._component = null;
		this._self = null;
		this._direction = "";  //vertical|horizontal
		this._nodes = [];
		this._clientNode = null;
		this._width = 0;
		this._height = 0;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._component = obj.__ptr__;
		if(this._self.tagName != "TD"){
			//this._self.style.position = "absolute";
			this._self.style.overflow = "hidden";
		}
		//this._self.style.backgroundColor = runtime.getColor();
		var nodes = obj.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			if(nodes[i].nodeType != 1) continue;  //NODE_ELEMENT
			if(nodes[i].tagName in TAGS) continue;
			if(nodes[i].className in CLASSES) continue;
			if(nodes[i].style.display == "none") continue;
			var align = nodes[i].__ptr__ && nodes[i].__ptr__._align || nodes[i].getAttribute("_align");
			if(!align){
				runtime.log("[WARNING]使用布局的结点(tagName=" + nodes[i].tagName + ",class=" + nodes[i].className + ")缺少_align属性，默认为_align=top");
				align = "top";
			}
			if(align == "none") continue;
			if(align == "client"){
				if(this._clientNode){
					runtime.log("[WARNING]使用布局的结点只能有一个_align=client的子结点");
				}
				this._clientNode = nodes[i];
				this._clientNode.style.position = "relative";  //[TODO]
				//this._clientNode.style.overflowX = "hidden";
				//this._clientNode.style.overflowY = "auto";
			}else{
				if(this._direction == ""){
					if(align == "top" || align == "bottom"){
						this._direction = "vertical";
					}else if(align == "left" || align == "right"){
						this._direction = "horizontal";
					}else{
						runtime.log("[WARNING]布局中使用了未知的_align属性值(" + align + ")");
					}
				}else if(this._direction == "vertical" && (align == "left" || align == "right")){
					runtime.log("[WARNING]布局已经为(vertical)，不能使用left或right作为_align属性值");
				}else if(this._direction == "horizontal" && (align == "top" || align == "bottom")){
					runtime.log("[WARNING]布局已经为(horizontal)，不能使用top或bottom作为_align属性值");
				}
			}
			this._nodes.push(nodes[i]);
		}
		if(this._direction == ""){
			//if(this._self.tagName != "BODY"){
			//	runtime.log("[WARNING]未能正确识别布局方向，请检查使用布局的元素的子元素个数是不是只有一个且_align=client");
			//}
			this._direction = "vertical";
		}
		if(this._direction == "horizontal"){
			//this._self.style.overflow = "hidden";
			for(var i = 0, len = this._nodes.length; i < len; i++){
				//水平的BorderLayout布局需要替换掉原来的float布局，改由绝对定位机制实现
				this._nodes[i].style.position = "absolute";
				this._nodes[i].style.styleFloat = "";
				//this._nodes[i].style.overflow = "auto";
			}
		}
		nodes = null;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._clientNode = null;
		for(var i = 0, len = this._nodes.length; i < len; i++){
			//if(this._nodes[i]._self){
			//	this._nodes[i].dispose();  //[TODO]应该在DOMUtil::dispose中处理
			//}
			this._nodes[i] = null;
		}
		this._nodes = [];
		this._self = null;
		this._component = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/*
	this.layoutElement = function(w, h){
		if(this._width == w && this._height == h) return;
		this._width = w;
		this._height = h;
		//if(this._self.className == "ff_cntas_list"){
		//	alert(w + "," + h);
		//}
		if(this._self.tagName == "TABLE"){
			var tbl = this._self;
			tbl.style.border = "1px solid red";
			tbl.style.width = w + "px";
			tbl.style.height = h + "px";
			var cell = tbl.childNodes[0].rows[1].cells[1];
			cell.style.width = (w - 12) + "px";
			cell.style.height = (h - 22) + "px";
			var layout = new BorderLayout();
			layout.init(cell);
			layout.layoutElement(Math.max(0, w - 12), Math.max(0, h - 22));
			layout.dispose();
			layout = null;
			cell = null;
			tbl = null;
		}else if(this._self.tagName != "BODY" && this._self.tagName != "TD"){
			if(w) runtime.dom.setWidth(this._self, w);
			if(h) runtime.dom.setHeight(this._self, h);
		}
		if(this._direction == "vertical"){
			var hh = 0, h_client = 0;
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				if(node.style.display == "none") continue;
				//node.style.top = hh + "px";
				if(node != this._clientNode){
					hh += runtime.dom.getHeight(node);
				}
				node = null;
			}
			var h_client = h - hh;
			hh = 0;
			if(w) runtime.dom.setWidth(this._clientNode, w);
			runtime.dom.setHeight(this._clientNode, h_client);
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				var layout = node.getAttribute("_layout");
				if(layout == "BorderLayout"){
					//node.style.overflow = "hidden";
					var borderLayout = new BorderLayout();
					borderLayout.init(node);
					borderLayout.layoutElement(node.clientWidth, node.clientHeight);
					borderLayout.dispose();
					borderLayout = null;
				}
				node = null;
			}
		}else{  //this._direction == "horizontal"
			//横向布局使用绝对定位，marginRight在其中并不起什么实际的作用，只是在计算两个结点之间margin时有用
			//定位元素left属性时，需要减去自身marginLeft属性的值
			var ww = 0, w_client = 0;
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				if(node.style.display == "none") continue;
				node.style.left = ww + "px";
				if(node != this._clientNode){
					ww += runtime.dom.getWidth(node);
				}
				node = null;
			}
			var w_client = w - ww;
			ww = 0;
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				node.style.left = ww + "px";
				if(node == this._clientNode){
					runtime.dom.setWidth(this._clientNode, w_client);
					ww += w_client;
				}else{
					ww += runtime.dom.getWidth(node);
				}
				var h_fix = 0;
				if(this._self.className == "ff_contact_client"){
					h_fix = -2;  //(临时解决办法)RQFM-4934 通讯录页面有一个相素的缺
				}
				if(h) runtime.dom.setHeight(node, h - h_fix);
				var layout = node.getAttribute("_layout");
				if(layout == "BorderLayout"){
					//node.style.overflow = "hidden";
					var borderLayout = new BorderLayout();
					borderLayout.init(node);
					borderLayout.layoutElement(node.clientWidth, node.clientHeight);
					borderLayout.dispose();
					borderLayout = null;
				}
				node = null;
			}
		}
	};
	this.setClientNode = function(node){
		this._clientNode = node;
	};
	this.appendNode = function(node){
		this._nodes.push(node);
	};
	*/
	/*
	this._getNodes = function(){
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i] = null;
		}
		this._nodes.splice(0, len);
		var nodes0 = this._self.childNodes;
		for(var i = 0, len = nodes0.length; i < len; i++){
			var node = nodes0[i];
			if(node.nodeType != 1) continue;  //NODE_ELEMENT
			if(node.tagName in TAGS) continue;
			if(node.className in CLASSES) continue;
			if(node.style.display == "none") continue;
			this._nodes.push(node);
			node = null;
		}
		return this._nodes;
	};
	*/
	/**
	 * 获取参与布局的结点
	 */
	this._getAlignNodes = function(){
		var nodes = [];
		for(var i = 0, len = this._nodes.length; i < len; i++){
			if(this._nodes[i].style.display == "none") continue;
			if(this._nodes[i].__ptr__){
				nodes.push(this._nodes[i].__ptr__);
			}
			//nodes.push(new BoxElement(this._nodes[i]));
		}
		return nodes;
	};
	this.getClientNodeWidth = function(w, nodes){
		var nn = this._component.getProperty("paddingLeft");  //考虑paddingLeft
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			if(i == 0){  //考虑第一个元素的marginLeft
				nn += node._marginLeft;
			}
			//node.setLeft(nn);
			nn += (node._self == this._clientNode ? 0 : node.getWidth());  //node._self.offsetWidth
			if(i < len - 1){
				nn += Math.max(node._marginRight, nodes[i + 1]._marginLeft);  //取两个元素的margin最大值
			}else{  //i == len - 1 考虑最后一个元素的marginRight
				nn += node._marginRight;
			}
			node = null;
		}
		return w - nn;
	};
	this.getClientNodeHeight = function(h, nodes){
		var nn = this._component.getProperty("paddingTop");  //考虑paddingTop
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			if(i == 0){  //考虑第一个元素的marginTop
				nn += node._marginTop;
			}
			//node.setTop(nn);
			nn += (node._self == this._clientNode ? 0 : node.getHeight());  //node._self.offsetHeight
			if(i < len - 1){
				nn += Math.max(node._marginBottom, nodes[i + 1]._marginTop);  //取两个元素的margin最大值
			}else{  //i == len - 1 考虑最后一个元素的marginBottom
				nn += node._marginBottom;
			}
			node = null;
		}
		return h - nn;
	};
	this.updateDock =
	this.layoutElement = function(w, h){
		//if(this._width == w && this._height == h) return;
		this._component.resizeTo(w, h);
		//if(this._self.className == "ff_cntas_list"){
		//	alert(w + "," + h);
		//}
		if(this._self.tagName == "TABLE"){
			var tbl = this._self;
			var cell = tbl.childNodes[0].rows[1].cells[1];
			//cell.style.border = "1px solid gray";
			cell.style.width = Math.max(0, w - 12) + "px";
			cell.style.height = Math.max(0, h - 22) + "px";
			/*
			var layout = new BorderLayout();
			layout.init(cell);
			layout.layoutElement(Math.max(0, w - 12), Math.max(0, h - 22));
			layout.dispose();
			layout = null;
			*/
			cell = null;
			tbl = null;
			return;
		}else if(this._self.tagName != "BODY" && this._self.tagName != "TD"){
			//alert(this._self.tagName + "," + w + "," + h);
			//高度和宽度已经被父元素调整过了
			//if(w) runtime.dom.setWidth(this._self, w);
			//if(h) runtime.dom.setHeight(this._self, h);
			//if(w) w = runtime.dom.getInnerWidth(this._self);  //this._self.clientWidth - this._paddingLeft - this._paddingRight;
			h = this._component.getInnerHeight();  //this._self.clientHeight - this._paddingTop - this._paddingBottom;
		}
		var nodes = this._getAlignNodes();
		if(this._direction == "vertical"){
			var n_client = this.getClientNodeHeight(h, nodes);
			var nn = 0;
			for(var i = 0, len = nodes.length; i < len; i++){
				var node = nodes[i];
				if(i == 0){  //考虑第一个元素的marginTop
					nn += node._marginTop;
				}
				//node.setTop(nn);
				if(node._self == this._clientNode){
					//var b = this._self.className == "wui-PaneContactTable" ? 2 : 0;
					node.setHeight(n_client/* - b*/);
				}
				nn += node._self == this._clientNode ? n_client : node.getHeight();
				if(w){
					node.setInnerWidth(w);
				}
				if(node.hasLayout()){
					node.layout();
				}
				if(i < len - 1){
					nn += Math.max(node._marginBottom, nodes[i + 1]._marginTop);  //取两个元素的margin最大值
				}else{  //i == len - 1 考虑最后一个元素的marginBottom
					nn += node._marginBottom;
				}
				node = null;
			}
		}else{  //this._direction == "horizontal"
			//横向布局使用绝对定位，marginRight在其中并不起什么实际的作用，只是在计算两个结点之间margin时有用
			//定位元素left属性时，需要减去自身marginLeft属性的值
			var n_client = this.getClientNodeWidth(w, nodes);  //w - nn + runtime.dom.getStyleProperty(this._self, "paddingLeft");  //补上考虑paddingRight值
			var nn = 0;
			for(var i = 0, len = nodes.length; i < len; i++){
				var node = nodes[i];
				node.setLeft(nn);
				if(i == 0){  //考虑第一个元素的marginLeft
					nn += node._marginLeft;
				}
				if(node._self == this._clientNode){
					node.setInnerWidth(n_client, true);
				}
				nn += node._self == this._clientNode ? n_client : node.getWidth();
				if(h){
					node.setInnerHeight(h);
				}
				if(node.hasLayout()){
					node.layout();
				}
				if(i < len - 1){
					nn += Math.max(node._marginRight, nodes[i + 1]._marginLeft);  //取两个元素的margin最大值
				}else{  //i == len - 1 考虑最后一个元素的marginRight
					nn += node._marginRight;
				}
				node = null;
			}
		}
		/*
		for(var i = 0, len = nodes.length; i < len; i++){
			nodes[i].dispose();
			nodes[i] = null;
		}
		*/
		nodes = null;
	};
});
/*</file>*/
//import alz.core.DomUtil2;
/*<file name="alz/core/AjaxEngine.js">*/
_package("alz.core");

//_import("alz.core.Exception");
_import("alz.core.ScriptLoader");
//_import("alz.core.IframeLoader");

//依赖于 runtime, runtime.getBrowser()
//[TODO]
//  1)添加防错误处理机制，保证请求队列的持续工作
//  2)短路所有的异步请求，保证单机环境下能够正常工作

/**
 * 异步数据调用引擎
 * [TODO]跨页面工作
 */
_class("AjaxEngine", "", function(_super){
	AjaxEngine._version = "1.01.0001";  //Ajax引擎的当前版本
	AjaxEngine._PROGIDS = [
		"Microsoft.XMLHTTP",
		"Msxml2.XMLHTTP",
		"Msxml2.XMLHTTP.4.0",
		"MSXML3.XMLHTTP",
		"MSXML.XMLHTTP",
		"MSXML2.ServerXMLHTTP"
	];
	//VBS版本的 UTF-8 解码函数，大数据量情况下效率低下，甚用！
	AjaxEngine._vbsCode = "Function VBS_bytes2BStr(vIn)"
		+ "\n  Dim sReturn, i, nThisChar, nNextChar"
		+ "\n  sReturn = \"\""
		+ "\n  For i = 1 To LenB(vIn)"
		+ "\n    nThisChar = AscB(MidB(vIn, i, 1))"
		+ "\n    If nThisChar < &H80 Then"
		+ "\n      sReturn = sReturn & Chr(nThisChar)"
		+ "\n    Else"
		+ "\n      nNextChar = AscB(MidB(vIn, i + 1, 1))"
		+ "\n      sReturn = sReturn & Chr(CLng(nThisChar) * &H100 + CInt(nNextChar))"
		+ "\n      i = i + 1"
		+ "\n    End If"
		+ "\n  Next"
		+ "\n  VBS_bytes2BStr = sReturn"
		+ "\nEnd Function";
	AjaxEngine.getXmlHttpObject = function(){
		var http, err;
		if(typeof XMLHttpRequest != "undefined"){
			try{
				http = new XMLHttpRequest();
				//http.overrideMimeType("text/xml");
				return http;
			}catch(ex){}
		}
		if(!http){
			for(var i = 0, len = this._PROGIDS.length; i < len; i++){
				var progid = this._PROGIDS[i];
				try{
					http = runtime.createComObject(progid);
				}catch(ex){
					err = ex;
				}
				if(http){
					this._PROGIDS = [progid];
					break;  //return http;
				}
			}
		}
		if(!http){
			//throw err;
			runtime.showException(err, "XMLHTTP not available");
		}
		return http;
	};
	this._init = function(){
		_super._init.call(this);
		this._timer = 0;
		this._msec = 10;
		this._retryMsec = 2000;  //请求失败重试的时间间隔
		this._http = null;  //[TODO]这个对象应该仅供异步请求队列使用
		this._queue = [];  //异步请求队列
		this._uniqueId = 0;  //每个请求的全局唯一编号的种子
		this._userinfo = false;
		this._testCase = null;  //测试用例
		this._retryCount = 0;
		this._scriptLoader = null;
		this._data = null;  //script-src方法获取的数据临时存储地
		this._ignoreMessages = [
			"不能执行已释放 Script 的代码"
			//"完成该操作所需的数据还不可使用。"
		];
	};
	this.init = function(){
		this._http = AjaxEngine.getXmlHttpObject();
	};
	this.dispose = function(){
		//if(this._disposed) return;
		this._data = null;
		if(this._scriptLoader){
			this._scriptLoader.dispose();
			this._scriptLoader = null;
		}
		this._testCase = null;
		this._timer = 0;
		this._http = null;
		for(var i = 0, len = this._queue.length; i < len; i++){
			this._queue[i] = null;
		}
		this._queue = [];
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getTestCase = function(){
		return this._testCase;
	};
	this.setTestCase = function(v){
		this._testCase = v;
	};
	this._getScriptLoader = function(){
		if(runtime.moz || !this._scriptLoader){
			this._scriptLoader = new ScriptLoader();
			this._scriptLoader.create();
		}
		return this._scriptLoader;
	};
	this._openHttp = function(method, url, async){
		if(!this._http) this._http = AjaxEngine.getXmlHttpObject();
		var http = this._http;
		//url = url.replace(/\?/, "?rnd=" + Math.random() + "&");
		runtime.log("http.open(\"" + method + "\",\"" + url + "\"," + async + ");");
		http.open(method, url, async);
		if(method == "POST"){
			http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			if(this._userinfo){
				http.setRequestHeader("SESSIONID", "10000");
				http.setRequestHeader("USERNAME", runtime.getUser().getName());
			}
		}
		//if(runtime.getWindow().Event){  //FF 和 NS 支持 Event 对象
		if(runtime.moz){  //FF
			var ext = url.substr(url.lastIndexOf("."));
			if(ext == ".xml" || ext == ".aul"){
				http.overrideMimeType("text/xml; charset=gb2312");  //用于将 UTF-8 转换为 gb2312
			}else{
				http.overrideMimeType("text/xml");
				//http.setRequestHeader("Content-Type", "text/xml");
				//http.setRequestHeader("Content-Type", "gb2312");
			}
		}
		return http;
	};
	/**
	 * @param {String} method 提交方法(GET|POST)
	 * @param {String} url 网络调用的url
	 * @param {String|Object} postData 请求数据
	 * @param {String} type 返回只类型(text|xml)
	 * @param {Function} callback 回调函数
	 * @param {Array} cbAgrs 传给回调方法的参数
	 * @return {String|XmlDocument}
	 */
	this.netInvoke1 = function(method, url, postData, type, callback){
		try{
			var async = (typeof(callback) != "undefined" && callback != null) ? true : false;
			if(async){  //如果是异步请求，使用请求队列工作模式
				return this.netInvoke(method, url, postData, type, callback);
			}else{
				var http = this._openHttp(method, url, async);
				/*
				var div = window.document.createElement("div");
				div.style.backgroundColor = "#EEEEEE";
				div.innerHTML = url + "&" + postData;
				im_history.appendChild(div);
				*/
				http.send(postData);  //FF下面参数null不能省略
				http = null;
				return this._onSyncCallback(type);
			}
		}catch(ex){
			runtime.showException(ex, "[AjaxEngine::netInvoke1]");
			return;
		}
	};
	//内嵌函数
	this._encodeData = function(http, charset){
		if(runtime.getWindow() && charset == "utf-8"){
			return "" + http.responseText;
		}else if(runtime.getWindow() && runtime.getWindow().execScript){  //FF 不支持 execScript
			if(typeof(VBS_bytes2BStr) == "undefined"){
				runtime.getWindow().execScript(AjaxEngine._vbsCode, "VBScript");
			}
			return VBS_bytes2BStr(http.responseBody);
		}else{
			//[TODO]直接返回 responseText 会有因 UTF-8 编码而引起的乱码问题
			return http.responseText;
		}
	};
	//供加载类库代码使用的方法
	this.netInvoke2 = function(method, url, postData, charset, agent, funName, args){
		var async = (typeof(agent) != "undefined" && agent != null) ? true : false;
		if(async){  //如果是异步请求，使用请求队列工作模式
			return this.netInvoke(method, url, postData, type, agent, funName, args);
		}else{
			var http = this._openHttp(method, url, async);
			if(runtime.getHostenv() == "safari" || runtime.getHostenv() == "chrome"){  //Safari下面需要这一句
				http.onreadystatechange = null;
			}
			/*if(async){
				http.onreadystatechange = function(){
					if(http.readyState != 4) return;
					if(typeof(agent[funName]) == "function"){
						agent[funName](http.responseText);
					}else{
						agent(http.responseText);
					}
				};
			}*/
			http.send("");  //没有 "" 的话 FF 下面会报错
			//if(!async){
			var data;
			if(http.status && (200 > http.status || 300 <= http.status)){
				throw new alz.core.Exception(runtime._lang.unable_to_load_file, url, http.status);
			}else if(http.readyState && http.readyState != 4){
				throw new alz.core.Exception(runtime._lang.resource_load_failure, uri);
			}else{
				data = this._encodeData(http, charset);  //args
			}
			http = null;
			return data;
			//}
		}
	};
	/**
	 * 可以复用HTTP组件的网络调用
	 * @param {String} method 提交方法(GET|POST)
	 * @param {String} url 网络调用的url
	 * @param {String|Object} postData 请求数据
	 * @param {String} type 返回只类型(text|xml)
	 * @param {Object|Function} agent 回调代理对象或者函数对象
	 * @param {String} funName 回调代理对象的回调方法名称
	 * @param {Array} cbAgrs 传给回调方法的参数
	 * @return {String|XmlDocument}
	 * [TODO]
	 *   1)检查 agent 和 agent[funName] 必须有一个是 Function 对象
	 */
	this.netInvoke = function(method, url, postData, type, agent, funName, cbArgs){
		//inner function
		function json2str(json){
			var sb = [];
			for(var k in json){
				//下面的改进，支持跨window的json对象传递，改进逻辑参考clone方法实现
				switch(typeof json[k]){
				//case "undefined": break;  //目前不支持undefined值
				case "boolean":
				case "number":
				case "string":
					sb.push(k + "=" + encodeURIComponent(json[k]));
					break;
				case "object":
					if(json[k] === null){  //null
						//目前不支持null值
					}else{
						//因为跨 window 操作，所以不能使用 instanceof 运算符
						//if(json[k] instanceof Array){
						if("length" in json[k]){  //array
							//把js数组转换成PHP能够接收的PHP数组
							for(var i = 0, len = json[k].length; i < len; i++){
								sb.push(k + "=" + encodeURIComponent(json[k][i]));
							}
						}else{  //object
							//目前不支持object类型的参数
						}
					}
					break;
				}
			}
			return sb.join("&");
		}
		//if(runtime._debug){
		//	check typeof agent || agent[funName] == "function"
		//}
		var req = {
			uniqueid: ++this._uniqueId,  //先加后用
			method  : method,
			url     : url,
			data    : (typeof postData == "string" ? postData : json2str(postData)),
			type    : type,
			agent   : agent,
			fun     : funName,
			args    : cbArgs
		};
		this._queue.push(req);
		req = null;
		if(this._timer == 0) this._startAjaxThread();
		return this._uniqueId;
	};
	/**
	 * 暂停异步请求的工作线程
	 * @param {Boolean} abort 是否中断当前的请求
	 */
	this.pauseAjaxThread = function(abort){
		if(abort){
			this._http.abort();  //中止当前请求
		}
		runtime.getWindow().clearTimeout(this._timer);  //结束定时器
		this._timer = 0;
	};
	/**
	 * 开始异步请求的工作线程
	 */
	this._startAjaxThread = function(msec){
		this._timer = runtime.startTimer(msec || this._msec, this, function(){
			this._ajaxThread();
		});
	};
	this._checkAjaxThread = function(retry){
		if(this._queue.length != 0){
			this._startAjaxThread(retry ? this._retryMsec : null);
		}else{
			this.pauseAjaxThread();
		}
	};
	this._ajaxThread = function(){
		var req  = this._queue[0];
		if(runtime._testCaseWin){
			runtime._testCaseWin.log(req.url + "?" + req.data);
		}
		var _this = this;
		if(this._testCase && this._testCase.doFilter(req.url)){
			var o = this._testCase.doService(req.url, this._testCase.getRequest(req.data));
			if(o){
				window.setTimeout(function(){_this._onTestCaseCallback(o)}, 0);
			}
		}else{
			if(req.type == "script_json"){
				var loader = this._getScriptLoader();
				loader.setCallback(function(){
					_this._onScriptCallback();
				});
				loader.load(req.url, req.data);
				loader = null;
			}else{
				var http = this._openHttp(req.method, req.url, true);
				var _this = this;
				http.onreadystatechange = function(){_this._onAsyncCallback();};
				http.send(req.data);
				http = null;
			}
		}
		req = null;
		return;
	};
	this._onTestCaseCallback = function(o){
		var req = this._queue[0];
		//调用真实的回调函数
		if(typeof(req.agent) == "function"){
			req.agent(o, req.args);
		}else if(typeof(req.fun) == "function"){
			var fun = req.fun;
			fun.call(req.agent, o, req.args);
			fun = null;
		}else{
			req.agent[req.fun](o, req.args);
		}
		this._queue[0] = null;
		this._queue.shift();  //清除队列第一个元素
		this._checkAjaxThread();
	};
	/**
	 * 同步回调函数
	 */
	this._onSyncCallback = function(type){
		if(this._http.readyState != 4){
			throw "资源文件加载失败";
		}
		//检查状态 this._http.readyState 和 this._http.status
		var status = this._http.status;
		if(status == 0 || (status >= 200 && status < 300)){
			return this._getResponseData(type, this._http);
		}else{
			try{
				switch(status){
				case 12002: // Server timeout
				case 12007:
				case 12029: // 12029 to 12031 correspond to dropped connections.
				case 12030: // See above comments for variable status.
				case 12031: // Internet connection reset error.
				case 12152: // Connection closed by server.
				case 13030: // See above comments for variable status.
				default:
					runtime.showException("同步请求错误"
						+ "\nstatus=" + status
						+ "\nstatusText=" + this._http.statusText
					);
					break;
				}
			}catch(ex){
			}
		}
	};
	/**
	 * 异步回调函数
	 * [TODO]
	 *   1)把当前出错的请求移动到队列的末尾去，应该更好，但是如果相邻的请求有先后
	 * 依赖关系则不建议这么做。
	 *   2)增加简单的是否重试的确认机制。
	 */
	this._onAsyncCallback = function(){
		if(this._http.readyState != 4) return;
		var retry = false;
		var status = this._http.status;
		if(status == 0 || (status >= 200 && status < 300)){
			this._retryCount = 0;  //只要成功一次，就置零
			var req  = this._queue[0];
			var o = this._getResponseData(req.type, this._http);
			//调用真实的回调函数
			if(typeof(req.agent) == "function"){
				//try{
					req.agent(o, req.args);
				//}catch(ex){
				//	if(ex.message != this._ignoreMessages[0]){
				//		throw ex;
				//	}
				//}
			}else if(typeof(req.fun) == "function"){
				//try{
					var fun = req.fun;
					fun.call(req.agent, o, req.args);
					fun = null;
				//}catch(ex){
				//	if(ex.message != this._ignoreMessages[0]){
				//		throw ex;
				//	}
				//}
			}else{
				//try{
					req.agent[req.fun](o, req.args);
				//}catch(ex){
				//	if(ex.message != this._ignoreMessages[0]){
				//		throw ex;
				//	}
				//}
			}
			req = null;
			this._queue[0] = null;
			this._queue.shift();  //清除队列第一个元素
		}else{
			/*
			try{
				switch(status){
				case 12002: // Server timeout
				case 12007:
				case 12029: // 12029 to 12031 correspond to dropped connections.
				case 12030: // See above comments for variable status.
				case 12031:
				case 12152: // Connection closed by server.
				case 13030: // See above comments for variable status.
					runtime.showException("异步请求错误"
						+ "\nstatus=" + status
						+ "\nstatusText=" + this._http.statusText
					);
					break;
				default:
					break;
				}
			}catch(ex){
			}
			*/
			this._retryCount++;
			if(this._retryCount <= 3){  //重试三次
				retry = true;
			}else{
				retry = runtime.getWindow().confirm("异步请求错误："  //runtime.showException
					+ "\nstatus=" + status
					+ "\nstatusText=" + this._http.statusText
					+ "\n是否重试本次请求？"
				);
			}
			this._http.abort();  //中止当前出错的请求
			if(!retry){  //如果不需要重试的话
				this._queue[0] = null;
				this._queue.shift();  //清除队列第一个元素
			}
		}
		this._checkAjaxThread(retry);
	};
	/**
	 * SCRIPT-src 异步回调函数
	 */
	this._onScriptCallback = function(){
		this._retryCount = 0;  //只要成功一次，就置零
		var req  = this._queue[0];
		var o = this._data;
		this._data = null;  //保证不对其他的请求产生影响
		//调用真实的回调函数
		if(typeof(req.agent) == "function"){
			//try{
				req.agent(o, req.args);
			//}catch(ex){
			//	if(ex.message != this._ignoreMessages[0]){
			//		throw ex;
			//	}
			//}
		}else if(typeof(req.fun) == "function"){
			//try{
				var fun = req.fun;
				fun.call(req.agent, o, req.args);
				fun = null;
			//}catch(ex){
			//	if(ex.message != this._ignoreMessages[0]){
			//		throw ex;
			//	}
			//}
		}else{
			//try{
				req.agent[req.fun](o, req.args);
			//}catch(ex){
			//	if(ex.message != this._ignoreMessages[0]){
			//		throw ex;
			//	}
			//}
		}
		req = null;
		this._queue[0] = null;
		this._queue.shift();  //清除队列第一个元素
		this._checkAjaxThread();
	};
	this._getResponseData = function(type, http){
		var o;  //o = Bytes2BStr(this._http.responseBody);
		switch(type){
		case "text": o = "" + http.responseText;break;
		case "json": o = runtime.parseJson(http.responseText);break;
		case "xml":
		default:
			if(runtime.ie){
				var xmlDoc = runtime.createComObject("Msxml.DOMDocument");
				xmlDoc.async = false;
				xmlDoc.loadXML(http.responseText);
				o = xmlDoc;  //.documentElement
			}else{
				o = http.responseXML;
			}
			break;
		}
		return o;
	};
	/*
	this.netInvoke = function(method, url, postData, type, callback){
		try{
			var async = callback ? true : false;
			this._http.open(method, url, async);
			if(async){
				var _this = this;
				this._http.onreadystatechange = function(){
					if(_this._http.readyState == 4){
						_this.onreadystatechange(type, callback);
					}
				};
			}
			/ *
			var div = runtime.getDocument().createElement("div");
			div.style.backgroundColor = "#EEEEEE";
			div.innerHTML = url + "&" + postData;
			im_history.appendChild(div);
			* /
			if(method == "POST"){
				this._http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			}
			this._http.send(postData);  //FF下面参数null不能省略
			if(async){
				return;
			}else{
				//检查状态 this._http.readyState 和 this._http.status
				if(this._http.readyState != 4){
					runtime.getWindow().alert("资源文件加载失败");
					return;
				}else{
					return this.onreadystatechange(type);
				}
			}
		}catch(ex){
			var a = [];
			for(var k in ex){
				a.push(k + "=" + ex[k]);
			}
			runtime.getWindow().alert(a.join("\n"));
			return;
		}
	};
	this.onreadystatechange = function(type, callback){
		//code = Bytes2BStr(this._http.responseBody);
		var o;
		switch(type){
		case "text":
			o = "" + this._http.responseText;
			break;
		case "xml":
		default:
			o = this._http.responseXML;
			break;
		}
		if(callback){
			callback(o);
		}else{
			return o;
		}
	};
	*/
	/**
	 * 调用一个请求队列
	 * @param {Array} queue 请求队列数组
	 * @param {Object} agent 回调代理对象
	 * @param {Function} callback 回调函数
	 */
	this.netInvokeQueue = function(queue, agent, callback){
		var i = 0;
		var _this = this;
		function cb(){
			if(i < queue.length){
				var req = queue[i];
				//netInvoke(method, url, postData, type, agent, funName)
				_this.netInvoke.call(_this, req[0], req[1], req[2], req[3], function(data){
					var agent = req[4];
					var fun   = req[5];
					//调用真实的回调函数
					if(typeof(agent) == "function"){
						agent(data, req[6]);
					}else if(typeof(fun) == "function"){
						fun.call(agent, data, req[6]);
					}else{
						agent[fun](data, req[6]);
					}
					fun = null;
					agent = null;
					req = null;
					i++;
					runtime.startTimer(0, this, cb);  //调用下一个
				});
			}else{  //队列完成
				callback.apply(agent);
			}
		}
		cb.call(this);
	};
	this.getReqIndex = function(uniqueid){
		for(var i = 0, len = this._queue.length; i < len; i++){
			if(this._queue[i].uniqueid == uniqueid){
				return i;
			}
		}
		return -1;
	};
	/**
	 * 终止指定的 uniqueid 的某个请求，队列正常运转
	 * @param {Number} uniqueid 每个请求的全局唯一编号
	 */
	this.abort = function(uniqueid){
		var n = this.getReqIndex(uniqueid);
		if(n == -1) return;
		if(n == 0){  //如果是当前请求
			this._http.abort();  //中止当前请求
			this._queue[n] = null;
			this._queue.shift();  //清除队列第一个元素
			this._checkAjaxThread();
		}else{
			this._queue[n] = null;
			this._queue.removeAt(n);
		}
	};
});
/*</file>*/
/*<file name="alz/core/Ajax.js">*/
_package("alz.core");

_import("alz.core.AjaxEngine");

/**
 * 异步数据调用引擎的封装版，主要目的是屏蔽并减少runtime对象的使用
 */
_class("Ajax", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._ajax = runtime.getAjax();
	};
	this.dispose = function(){
		this._ajax = null;
		//[memleak]this.__caller__ = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	//具体参数含义参考AjaxEngine对应的方法
	this.netInvoke = function(method, url, postData, type, agent, funName, cbArgs){
		//[memleak]this.__caller__ = method + "," + url + "," + postData + "," + type + "," + agent + "," + funName + "," + cbArgs;
		return this._ajax.netInvoke.apply(this._ajax, arguments);
	};
	this.netInvokeQueue = function(queue, agent, callback){
		this._ajax.netInvokeQueue.apply(this._ajax, arguments);
	};
	this.abort = function(uniqueid){
		this._ajax.abort(uniqueid);
	};
	this.pauseAjaxThread = function(abort){
		this._ajax.pauseAjaxThread(abort);
	};
	this.getTestCase = function(){
		return this._ajax.getTestCase();
	};
	this.setTestCase = function(v){
		this._ajax.setTestCase(v);
	};
});
/*</file>*/
/*<file name="alz/template/TemplateManager.js">*/
_package("alz.template");

_import("alz.template.TrimPath");
//_import("alz.core.Ajax");

/**
 * 提供对模板数据的管理支持，实现了对多种类型的前端模板的管理和方便的外部调用接
 * 口，达到分离前端开发过程中逻辑和界面的初步分离。
 *
 * [TODO]TrimPath 每次重复解析模板的性能问题还没有解决。
 *
 * 模板的类型
 * html = 纯 HTML 代码
 * tpl  = 符合 /\{[\$=]\w+\}/ 规则的简易模板
 * asp  = 仿 ASP 语法的模板
 */
_class("TemplateManager", "", function(_super){
	//var RE_TPL = /<!-- template name=\"(\w+\.tpl)\" type=\"(html|tpl|asp)\"( title=\"[^\"]+\")* -->/;
	var RE_TPL = /<template name=\"(\w+\.tpl)\" type=\"(html|tpl|asp|tmpl|xml)\"(?: params=\"([^\"]+)\")*( title=\"[^\"]+\")*>/;
	this._init = function(){
		_super._init.call(this);
		this._path = "";
		this._hash = {};  //模板数据哈希表 {"name":{tpl:"",func:null},...}
		this._func = null;
		this._trimPath = null;
		this._context = {  //[只读]模板编译后的函数公用的上下文环境对象
			"trim": function(str){return str.replace(/^\s+|[\s\xA0]+$/g, "");}
		};
	};
	this.init = function(path){
		this._path = path;
		this._trimPath = new TrimPath();
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var k in this._hash){
			this._hash[k].data = null;
			this._hash[k].code = "";
			this._hash[k].func = null;
			delete this._hash[k];
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/*
	this.load1 = function(tpls, callback){
		var i = 0;
		var _this = this;
		function cb(data){
			_this.appendItem(tpls[i], "asp", data);
			i++;
			if(i < tpls.length){
				runtime.addThread(0, _this, function(){
					new Ajax().netInvoke("GET", this._path + tpls[i], "", "text", cb);
				});
			}else{
				callback();  //模板加载完毕后，执行回调函数
			}
		}
		new Ajax().netInvoke("GET", this._path + tpls[i], "", "text", cb);
	};
	this.load2 = function(tpls, callback){
		var arr = $("tpldata").innerHTML.split("$$$$");
		for(var i = 0, len = arr.length; i < len; i++){
			this.appendItem(tpls[i], "asp", arr[i]);
		}
		callback();
	};
	/ **
	 * 使用脚本解析原始的模版文件
	 * /
	this.load3 = function(tplData, callback){
		var arr = tplData.split("$$$$");
		for(var i = 0, len = arr.length; i < len; i++){
			/ *
			if(runtime.opera){
				arr[i] = runtime.decodeHTML(arr[i]);
			}
			* /
			var a = RE_TPL.exec(arr[i]);
			if(a){
				this.appendItem(a[1], a[2], arr[i]);
			}else{
				window.alert("找不到模板的 name 属性");
			}
		}
		callback();
	};
	/ **
	 * @param {Array} data 数组类型的模板列表
	 * @param {Object} agent 回调代理对象
	 * @param {Function} fun 回调函数
	 * /
	this.load = function(data, agent, fun){
		this.appendItems(data);
		fun.call(agent);
	};
	this.loadData = function(url, agent, funName){
		new Ajax().netInvoke("POST", url, "", "json", this, function(json){
			this.load(json, this, function(){
				funName.apply(agent);
			});
		});
	};
	*/
	/**
	 * 添加一个模板到模板管理类中
	 * @param {String} name 必选，要添加的模板的名称
	 * @param {String} type 必选，模板的类型，参见说明
	 * @param {String} data 必选，模板内容
	 * @return {void} 原始的模板内容
	 */
	this._appendItem = function(data){
		var name = data.name;
		var type = data.type;
		var tpl = data.tpl;
		if(this._hash[name]){
			runtime.warning("[TemplateManager::_appendItem]模板 " + name + " 已经存在！");
		}else{
			if(type == "html" || type == "tpl"){
				tpl = tpl
					.replace(/>\r?\n\t*</g, "><")
					.replace(/\r?\n\t*/g, " ");
			}
			var template = {
				"name": name,
				"data": tpl,
				"type": type,
				"code": "",
				"func": null
			};
			if(type == "asp"){  //html,tpl 类型模板，不需要编译
				template.code = "var func = " + this.parse(tpl, data.params) + ";";
				with(this._context){
					eval(template.code);
				}
				template.func = func;
			}
			this._hash[name] = template;
		}
	};
	this.appendItem = function(name, type, data){
		this._appendItem({
			"name": name,
			"type": type,
			"tpl" : data
		});
	};
	this.appendItems = function(data){
		for(var i = 0, len = data.length; i < len; i++){
			/*
			var a = RE_TPL.exec(data[i]);
			if(a){
				this.appendItem(a[1], a[2], data[i]);
			}else{
				window.alert("找不到模板的 name 属性");
			}
			*/
			this._appendItem(data[i]);
		}
	};
	this.callTpl = function(html, json){
		if(!json) return html;
		var _this = this;
		return html.replace(/\{([\$=])(\w+)\}/g, function(_0, _1, _2){
			switch(_1){
			case "$":
				return _2 in json ? json[_2] : _0;
			case "=":
				return _this.getTemplate(_2 + ".tpl");
			}
		});
	};
	/*
	this.callTpl = function(html, json){
		if(!json) return html;
		var sb = [];
		var p2 = 0;
		for(var p1 = html.indexOf("{", p2); p1 != -1; p1 = html.indexOf("{", ++p2)){
			var p = p1 + 1;
			var ch = html.charAt(p);
			if(ch == "$" || ch == "="){
				var p3 = html.indexOf("}", p);
				if(p3 != -1){
					sb.push(html.substring(p2, p1));
					var k = html.substring(p + 1, p3);
					if(ch == "$"){
						sb.push(k in json ? json[k] : "{$" + k + "}");
					}else{  //ch == "="
						sb.push(this.getTemplate(k + ".tpl"));
					}
					p2 = p3;
				}else{
					p2 = p;
				}
			}else{
				p2 = p1;
			}
		}
		//获取最后一个模板变量之后的内容
		//如果一个模板变量都没有，则获取整个字符串
		sb.push(html.substr(p2));
		return sb.join("");
	};
	*/
	this.str2xmldoc = function(str){
		var xmldoc;
		if(runtime.ie){
			xmldoc = runtime.createComObject("Msxml.DOMDocument");
			xmldoc.async = false;
			xmldoc.loadXML(str);
		}else{
			xmldoc = (new DOMParser()).parseFromString(str, "text/xml");
		}
		return xmldoc;
	};
	this.getTemplate = function(name){
		if(!(name in this._hash)){
			window.alert("[TemplateManager::getTemplate]请确认模板" + name + "已经存在");
		}else{
			if(this._hash[name].type == "xml"){
				return this.str2xmldoc(this._hash[name].data);
			}else{
				return this._hash[name].data;
			}
		}
	};
	this.invoke = function(name){
		/*
		var arr = [];
		for(var i = 1, len = arguments.length; i < len; i++){
			arr.push(arguments[i]);
		}
		var arr = Array.prototype.slice.call(arguments, 1);
		*/
		var html;
		if(!(name in this._hash)){
			window.alert("[TemplateManager::invoke]请确认模板" + name + "已经存在");
		}else{
			var tpl = this._hash[name];
			switch(tpl.type){  //根据模板的类型，使用不同的方式生成 HTML 代码
			case "html":  //直接输出
				html = tpl.data;
				break;
			case "tpl":  //使用正则替换
				html = this.callTpl(tpl.data, arguments[1]);
				break;
			case "asp":  //执行函数调用
				var arr = Array.prototype.slice.call(arguments, 1);
				html = this._hash[name].func.apply(null, arr);
				break;
			case "tmpl":
				html = this._trimPath.parseTemplate(this._hash[name].data).process(arguments[1]);
				break;
			case "xml":
				html = tpl.data;
				break;
			}
		}
		return html;
	};
	/**
	 * 在指定的DOM元素中渲染一个模板的内容
	 * @param {HTMLElement} element
	 * @param {String} tplName
	 */
	this.render = function(element, tplName){
		/*
		var arr = [];
		for(var i = 1, len = arguments.length; i < len; i++){
			arr.push(arguments[i]);
		}
		*/
		var arr = Array.prototype.slice.call(arguments, 1);
		element.innerHTML = this.invoke.apply(this, arr);  //arr[0] = tplName;
	};
	/**
	 * 如果使用追加方式需要考虑，追加的模版是不是_align="client"停靠的面板，以便于
	 * 方便的布局的正常工作
	 */
	this.render2 = function(element, tplName){
		/*
		var arr = [];
		for(var i = 1, len = arguments.length; i < len; i++){
			arr.push(arguments[i]);
		}
		*/
		var arr = Array.prototype.slice.call(arguments, 1);
		var tpl = this.invoke.apply(this, arr);  //arr[0] = tplName;
		return element.appendChild(runtime.createDomElement(tpl));
	};
	/**
	 * 渲染指定的模板和数据到Pane组件中
	 * @param {Pane} pane Pane 类型组件
	 * @param {String} tplName 模板名字
	 */
	this.renderPane = function(pane, tplName){
		this.render.apply(this, arguments);
		pane.initComponents();
	};
	/*
	this.createTplElement = function(tplName){
		return runtime.createDomElement(this.invoke(tplName));
	};
	*/
	var TAGS = {
		"start": [
			{"tag":"<!--%","len":5,"p":-1},
			{"tag":"(%"   ,"len":2,"p":-1}
		],
		"end": [
			{"tag":"%-->" ,"len":4,"p":-1},
			{"tag":"%)"   ,"len":2,"p":-1}
		]
	};
	this.dumpTag = function(t){
		window.alert(t.tag + "," + t.len + "," + t.p);
	};
	this.findTag = function(code, t, start){  //indexOf
		var tags = TAGS[t];
		var pos = Number.MAX_VALUE;
		var t = null;
		for(var i = 0, len = tags.length; i < len; i++){
			var p = code.indexOf(tags[i].tag, start);
			if(p != -1 && p < pos){
				t = tags[i];
				t.p = p;
				pos = p;
			}
		}
		if(t == null){
			return {"tag": "#tag#", "len": 0, "p": -1};
		}else{
			return t;
		}
	};
	/**
	 * 将字符串转换成可以被字符串表示符号(",')括起来已表示原来字符串意义的字符串
	 * @param {String} str 要转换的字符串内容
	 */
	this.toJsString = function(str){
		if(typeof str != "string") return "";
		return str.replace(/[\\\'\"\r\n]/g, function(_0){
			switch(_0){
			case "\\": return "\\\\";
			case "\'": return "\\\'";
			case "\"": return "\\\"";
			case "\t": return "\\t";
			case "\n": return "\\n";
			case "\r": return "\\r";
			}
		});
	};
	/**
	 * 将类似 ASP 代码的模板解析为一个 JS 函数的代码形式
	 * @param {String} code 模板的内容
	 * @param {String} params 模板编译“目标函数”参数列表的字符串形式表示
	 */
	this.parse = function(code, params){
		/*
		var tag0 = "<!" + "--%";
		var l0 = tag0.length;
		var p0 = code.indexOf(tag0, 0);
		var t0 = {"tag":tag0,"len":l0,"p":p0};
		*/
		var t0 = this.findTag(code, "start", 0);  //寻找开始标签
		//this.dumpTag(t0);
		var tag1 = "%--" + ">";
		var l1 = tag1.length;
		var p1 = -l1;
		var t1 = {"tag":tag1,"len":l1,"p":p1};
		var sb = [];
		sb.push("function(" + (params || "") + "){");
		sb.push("\nvar __sb = [];");
		var bExp = false;  //是否正在解析表达式
		while(t0.p != -1){
			if(t0.p > t1.p + t1.len){
				if(bExp){
					var s = sb.pop();
					s = s.substr(0, s.length - 2)
						+ " + \"" + this.toJsString(code.substring(t1.p + t1.len, t0.p)) + "\""
						+ s.substr(s.length - 2);
					sb.push(s);
				}else{
					sb.push("\n__sb.push(\"" + this.toJsString(code.substring(t1.p + t1.len, t0.p)) + "\");");
				}
			}
			t1 = this.findTag(code, "end", t0.p + t0.len);  //寻找结束标签
			//this.dumpTag(t1);
			//t1.p = code.indexOf(t1.tag, t0.p + t0.len);
			if(t1.p != -1){
				switch(code.charAt(t0.p + t0.len)){
				case "!":  //函数声明
					if(!params){  //忽略声明中的参数获取方式
						bExp = false;
						sb[0] = code.substring(t0.p + t0.len + 1, t1.p - 1) + "{";  //忽略声明结束的分号，并替换成 "{"
					}
					break;
				case '=':  //如果表达式，把表达式的结果缓存到 __sb 中
					bExp = true;
					var s = sb.pop();
					//把一部分属于js表达式的代码添加到前面一个__sb.push（还可能是'var __sb = [];'定义）中
					//s = s.substr(0, s.length - 2)
					//	+ (sb.length <= 2 ? "" : " + ")
					//	+ code.substring(t0.p + t0.len + 1, t1.p)
					//	+ s.substr(s.length - 2);
					s = s.substr(0, s.length - 2)                     //上一个__sb元素插入点之前的部分
						+ (s.charAt(s.length - 3) == "[" ? "" : " + ")  //处理特殊情况
						+ code.substring(t0.p + t0.len + 1, t1.p)       //表达式部分
						+ s.substr(s.length - 2);                       //上一个__sb元素插入点之后的部分
					sb.push(s);
					//sb.push("\n__sb.push(" + code.substring(t0.p + t0.len + 1, t1.p) + ");");
					break;
				default:  //普通的代码，保持不变
					bExp = false;
					sb.push(code.substring(t0.p + t0.len, t1.p));
					break;
				}
			}else{
				return "模板中的'" + t0.tag + "'与'" + t1.tag + "'不匹配！";
			}
			t0 = this.findTag(code, "start", t1.p + t1.len);  //寻找开始标签
			//this.dumpTag(t0);
			//t0.p = code.indexOf(t0.tag, t1.p + t1.len);
		}
		if(t1.p + t1.len >= 0 && t1.p + t1.len < code.length){  //保存结束标志之后的代码
			sb.push("\n__sb.push(\"" + this.toJsString(code.substr(t1.p + t1.len)) + "\");");
		}
		sb.push("\nreturn __sb.join(\"\");");
		sb.push("\n}");
		return sb.join("");
		//return parseJson(sb.join("\n"))();
	};
	this.getInnerHTML = function(node){
		var sb = [];
		var nodes = node.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			sb.push(this.node2html(nodes[i]));
		}
		nodes = null;
		return sb.join("");
	};
	this._hashTag = {"meta":1,"link":1,"img":1,"input":1,"br":1};
	this.node2html = function(node){
		var sb = [];
		switch(node.nodeType){
		case 1:  //NODE_ELEMENT
			var tagName = node.tagName;
			sb.push("<" + tagName);
			for(var i = 0, len = node.attributes.length; i < len; i++){
				var name = node.attributes[i].nodeName;
				var value = node.attributes[i].nodeValue;
				/*
				if(name in this._hashAAA){
					if(!(tagName in this._hashAAA[name])){
						print("[error]" + tagName + "不允许存在" + name+ "属性(value=" + value + ")\n");
					}
				}else if(name.charAt(0) == "_"){
					runtime.warning(tagName + "含有自定义属性" + name+ "=\"" + value + "\"\n");
				}else if(name == "style"){
					runtime.warning(tagName + "含有属性" + name+ "=\"" + value + "\"\n");
				}else if(name.substr(0, 2) == "on"){
					runtime.warning(tagName + "含有事件代码" + name+ "=\"" + value + "\"\n");
				}else if(!(name in this._att)){
					runtime.error(tagName + "含有未知属性" + name+ "=\"" + value + "\"\n");
				}
				*/
				sb.push(" " + name + "=\"" + value + "\"");
			}
			if(node.hasChildNodes()){
				sb.push(">");
				var nodes = node.childNodes;
				for(var i = 0, len = nodes.length; i < len; i++){
					sb.push(this.node2html(nodes[i]));
				}
				nodes = null;
				sb.push("</" + tagName + ">");
			}else{
				if(tagName in this._hashTag){
					sb.push(" />");
				}else{
					//runtime.warning(tagName + "是空标签\n");
					sb.push("></" + tagName + ">");
				}
			}
			break;
		case 3:  //NODE_TEXT
			sb.push(node.nodeValue);
			break;
		case 4:  //NODE_CDATA_SECTION
			sb.push("<![CDATA[" + node.data + "]]>");
			break;
		case 8:  //NODE_COMMENT
			//sb.push("<!--" + node.data + "-->");
			break;
		default:
			//runtime.warning("无法处理的nodeType" + node.nodeType + "\n");
			break;
		}
		return sb.join("");
	};
});
/*</file>*/
/*<file name="alz/core/Application.js">*/
_package("alz.core");

_import("alz.core.EventTarget");

/**
 * [TODO]
 * 1)application 变量在 runtime.createApp 方法返回之后被覆盖了
 */
_class("Application", EventTarget, function(_super){
	/*
	var __exts = [];
	Application.regExt = function(fun){  //注册应用的扩展
		var o = new fun();
		__exts.push(o);
		for(var k in o){
			if(k == "_init") continue;  //[TODO]
			if(k == "init" || k == "dispose") continue;  //忽略构造或析构函数
			Application.prototype[k] = o[k];  //绑定到原型上
		}
		o = null;
	};
	*/
	this._init = function(){
		__context__.application = this;  //绑定到lib上下文环境上
		_super._init.call(this);
		this._appconf = null;  //应用配置信息
		this._parentApp = null;  //父应用
		this._historyIndex = -1;
		this._params = null;  //传递给应用的参数
		this._workspace = null;  //工作区组件
		this._hotkey = {};  //热键
		this._domTemp = null;
		/*
		this._cache = {  //参考了 prototype 的实现
			findOrStore: function(value){
				return this[value] = this[value] || function(){
					return value.apply(null, [this].concat(runtime.toArray(arguments)));
				};
			}
		};
		*/
		//执行构造扩展
		//for(var i = 0, len = __exts.length; i < len; i++){
		//	__exts[i]._init.call(this);
		//}
	};
	this.init = function(){
		//_super.init.apply(this, arguments);
		this._workspace = runtime._workspace;
		//注册系统热键
		runtime.getDom().addEventListener(runtime.getDocument(), "keydown", function(ev){
			ev = ev || runtime.getWindow().event;
			if(ev.keyCode in this._hotkey){  //如果存在热键，则执行回掉函数
				var ret, o = this._hotkey[ev.keyCode];
				switch(o.type){
				case 0: ret = o.agent(ev);break;
				case 1: ret = o.agent[o.cb](ev);break;
				case 2: ret = o.cb.apply(o.agent, [ev]);break;
				}
				o = null;
				return ret;
			}
		}, this);
		//执行初始化扩展
		//for(var i = 0, len = __exts.length; i < len; i++){
		//	__exts[i].init.apply(this, arguments);
		//}
	};
	this.dispose = function(){
		if(this._disposed) return;
		//执行析构扩展
		//for(var i = 0, len = __exts.length; i < len; i++){
		//	__exts[i].dispose.apply(this, arguments);
		//}
		this._domTemp = null;
		//runtime.getDocument().onkeydown = null;
		for(var k in this._hotkey){
			delete this._hotkey[k];
		}
		this._workspace = null;
		this._params = null;
		this._parentApp = null;
		this._appconf = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.onContentLoad = function(){
	};
	/**
	 * 注册系统热键
	 * @param {Number} keyCode 热键编码
	 * @param {Function} callback 回调函数
	 */
	this.regHotKey = function(keyCode, agent, callback){
		var type;
		if(typeof agent == "function"){
			type = 0;
		}else if(typeof agent == "object" && typeof callback == "string"){
			type = 1;
		}else if(typeof agent == "object" && typeof callback == "function"){
			type = 2;
		}else{
			runtime.showException("回调参数错误");
			return;
		}
		if(!this._hotkey[keyCode]){
			this._hotkey[keyCode] = {
				"type" : type,
				"agent": agent,
				"cb"   : callback
			};
		}
	};
	this.createDomElement = function(html){
		if(!this._domTemp){
			this._domTemp = window.document.createElement("div");
		}
		this._domTemp.innerHTML = html;
		return this._domTemp.removeChild(this._domTemp.childNodes[0]);
	};
	this.setParentApp = function(v){
		this._parentApp = v;
	};
	this.setHistoryIndex = function(v){
		this._historyIndex = v;
	};
	this.getParams = function(){
		return this._params;
	};
});
/*</file>*/
/*<file name="alz/core/AppManager.js">*/
_package("alz.core");

_import("alz.core.LibLoader");
_import("alz.core.Application");

_class("AppManager", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._confList = {};  //APP配置数据
		this._hash = {};
		this._list = [];
		this._mainApp = null;
	};
	//初始化所有应用
	this.init = function(){
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i].init){
				this._list[i].init();
			}
		}
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i].onContentLoad();
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._mainApp = null;
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i].dispose();
			this._list[i] = null;
		}
		this._list = [];
		for(var k in this._hash){
			//this._hash[k].dispose();
			delete this._hash[k];
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	//调整所有应用的大小
	this.onResize = function(w, h){
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i].onResize){
				try{
					this._list[i].onResize(w, h);
				}catch(ex){
				}
			}
		}
	};
	this.setConfList = function(list){
		for(var i = 0, len = list.length; i < len; i++){
			if(list[i].id in this._confList){
				window.alert("[warning]appid(" + list[i].id + ")重复");
			}
			list[i].appnum = 0;
			this._confList[list[i].id] = list[i];
		}
	};
	this.getMainApp = function(){
		//return this._mainApp;
		return this._list[0];
	};
	this.setMainApp = function(v){
		this._mainApp = v;
	};
	/**
	 * 创建并注册一个应用的实例
	 * @param {String} appClassName 要创建的应用的类名
	 * @param {Application} parentApp 可选，所属的父类
	 * @param {Number} len 在历史记录中的位置
	 */
	this.createApp = function(appClassName, parentApp, len){
		var conf = this.getAppConfByClassName(appClassName);
		if(conf){
			if(conf.appnum == 1){
				runtime.getWindow().alert("简化版中每个App类只能创建一个实例");
				return null;
			}
			conf.appnum++;
		}
		//需要保证多于一个参数，阻止create方法自动执行
		var app = new __classes__[appClassName]();
		if(arguments.length == 3 && parentApp){
			app.setParentApp(parentApp);  //设置父类
			app.setHistoryIndex(len);  //设置所在历史记录的位置
		}else if(app.getMainWindow){
			var appManager = app.getMainWindow().runtime._appManager;
			parentApp = appManager._list[0] || null;
			app.setParentApp(parentApp);
			//if(parentApp){
			//	app.setHistoryIndex(parentApp.historyManager.getLength());
			//}
			appManager = null;
		}
		//注册APP
		if(conf){
			this._hash[conf.id] = app;
		}
		this._list.push(app);
		//app.init();
		conf = null;
		return app;
	};
	this.getAppConf = function(appid){
		return this._confList[appid];
	};
	this.getAppConfByClassName = function(className){
		for(var k in this._confList){
			if(this._confList[k].className == className){
				return this._confList[k];
			}
		}
		return null;
	};
	this.getAppByClassName = function(className){
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i]._className == className){
				return this._list[i];
			}
		}
		return null;
	};
	this.loadAppLibs = function(libName, app, agent, fun){
		var n = app.historyManager.getLength();
		var libs = this._confList[libName].lib.split(",");
		var arr = [];
		for(var i = 0, len = libs.length; i < len; i++){
			var name = libs[i];
			if(/\.js$/.test(name)){  //直接加载js文件
				runtime.dynamicLoadFile("js", app._pathJs, [name]);
			}else if(/\.lib$/.test(name)){  //加载lib文件
				name = name.replace(/\.lib$/, "");
				var name0 = name;
				if(name0.substr(0, 1) == "#") name0 = name0.substr(1);
				if(!(name0 in runtime._libManager._hash)){
					arr.push(name);
				}
			}
		}
		var libLoader = new LibLoader();
		libLoader.init(arr, runtime._config["codeprovider"], this, function(name, lib){
			//runtime._libLoader.loadLibScript(name, this, function(lib){
			//});
			if(lib){
				if(typeof lib == "function"){
					lib.call(runtime, app, n);
				}else{  //typeof lib.init == "function"
					lib.init.call(runtime, app, n);
				}
			}else{  //全部加载
				fun.apply(agent);
				libLoader.dispose();
				libLoader = null;
			}
		});
	};
});
/*</file>*/
/*<file name="alz/core/Plugin.js">*/
_package("alz.core");

_import("alz.core.EventTarget");

/**
 * 针对Application的插件基类
 */
_class("Plugin", EventTarget, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._app = null;  //插件所属的应用
		this._name = "";   //插件的名字
	};
	this.create = function(name, app){
		this._app = app;
		this._name = name;
	};
	this.reset = function(){
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getName = function(){
		return this._name;
	};
});
/*</file>*/
/*<file name="alz/core/PluginManager.js">*/
_package("alz.core");

_import("alz.core.Plugin");

/**
 * Application插件管理者类
 */
_class("PluginManager", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._plugins = {};
	};
	/*
	this.create = function(context){
		_super.create.apply(this, arguments);
	};
	*/
	this.dispose = function(){
		if(this._disposed) return;
		//[TODO]多个应用的插件注册到同一个地方，则跨窗口应用的插件卸载时会报错
		for(var k in this._plugins){
			this._plugins[k].dispose();
			delete this._plugins[k];
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * 判断一个插件是否已经存在
	 */
	this.exists = function(name){
		return name in this._plugins;
	};
	/**
	 * 注册一个插件，每个APP下所有插件不能重名
	 * @param {PlugIn} plugin 插件的实例
	 */
	this.register = function(plugin){
		this._plugins[plugin.getName()] = plugin;
	};
	/**
	 * 通过名字获取一个已经注册的插件实例
	 */
	this.getPlugIn = function(name){
		return this._plugins[name];
	};
	/**
	 * 调用插件的onResize事件
	 * 给所有插件一个调整自身布局的机会
	 */
	this.onResize = function(ev){
		for(var k in this._plugins){
			this._plugins[k].fireEvent(ev);
		}
	};
});
/*</file>*/
/*<file name="alz/core/ActionManager.js">*/
_package("alz.core");

/**
 * Action管理者类
 */
_class("ActionManager", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._actionEngine = null;  //动作执行引擎，实现了doAction接口的类的实例
		this._nodes = {};  //所管理的全部action组件
		this._components = [];
	};
	this.init = function(actionEngine){
		this._actionEngine = actionEngine;
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._components.length; i < len; i++){
			this._components[i].dispose();
			this._components[i] = null;
		}
		this._components = [];
		for(var k in this._nodes){
			for(var i = 0, len = this._nodes[k].length; i < len; i++){
				this._nodes[k][i] = null;  //再此无需调用 dispose 方法
			}
			delete this._nodes[k];
		}
		this._actionEngine = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.add = function(component){
		//var act = component._self.getAttribute("_action");
		var act = component.getAction();
		if(!this._nodes[act]){
			this._nodes[act] = [];
		}
		this._nodes[act].push(component);
		this._components.push(component);  //注册组件
	};
	/*this.enable = function(name){
		var nodes = this._nodes[name];
		if(!nodes) return;
		for(var i = 0, len = nodes.length; i < len; i++){
			nodes[i].setDisabled(false);
		}
		nodes = null;
	};*/
	/**
	 * 启用名字为name对的action(可能是一组)
	 */
	this.enable = function(name){
		this.updateState(name, {"disabled":false});
	};
	/**
	 * 禁用名字为name对的action(可能是一组)
	 */
	this.disable = function(name){
		this.updateState(name, {"disabled":true});
	};
	/**
	 * 更新名字为name的action的状态
	 */
	this.updateState = function(name, state){
		if(name){
			this.update(name, state);
		}else{
			for(var k in this._nodes){
				this.update(k, state);
			}
		}
	};
	this.multipleUpdateState = function(actions){
		for(var k in actions){
			this.update(k, actions[k]);
		}
	};
	this.update = function(name, state){
		var nodes = this._nodes[name];
		if(!nodes) return;
		for(var i = 0, len = nodes.length; i < len; i++){
			for(var k in state){  //visible,disabled
				var name = "set" + k.charAt(0).toUpperCase() + k.substr(1);
				if(name in nodes[i]) nodes[i][name](state[k]);
			}
		}
		nodes = null;
	};
	/**
	 * 分派一个action
	 */
	this.dispatchAction = function(name, sender, ev){
		if(this._actionEngine.doAction){
			return this._actionEngine.doAction(name, sender, ev);
		}
	};
});
/*</file>*/

//ui.lib
/*<file name="alz/mui/ToggleGroup.js">*/
_package("alz.mui");

/**
 * 状态按钮分组
 */
_class("ToggleGroup", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._buttons = [];
		this._activeButton = null;
	};
	this.append = function(btn){
		this._buttons.push(btn);
	};
	this.toggle = function(btn){
		if(this._activeButton){
			this._activeButton.setToggled(false);
		}
		btn.setToggled(true);
		this._activeButton = btn;
	};
});
/*</file>*/
/*<file name="alz/mui/ToggleManager.js">*/
_package("alz.mui");

_import("alz.mui.ToggleGroup");

/**
 * 双态按钮管理者
 */
_class("ToggleManager", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._groups = {};
	};
	this.add = function(btn){
		var groupid = btn._groupid;
		if(!this._groups[groupid]){
			this._groups[groupid] = new ToggleGroup();
		}
		this._groups[groupid].append(btn);
	};
	this.toggle = function(btn){
		this._groups[btn._groupid].toggle(btn);
	};
});
/*</file>*/
/*<file name="alz/mui/Component.js">*/
_package("alz.mui");

_import("alz.core.EventTarget");

/**
 * UI组件应该实现BoxElement的接口
 */
_class("Component", EventTarget, function(_super){
	/*
	 0 : obj[k] = v;
	 1 : obj.setAttribute(k, v);
	 2 : obj.style[k] = v;
	*/
	var ATTR = {
		"href"            : 0,
		"htmlFor"         : 0,
		"id"              : 0,
		"name"            : 0,
		"innerHTML"       : 0,
		"onclick"         : 0,
		"ondragstart"     : 0,
		"onmousedown"     : 0,
		"tabIndex"        : 0,
		"title"           : 0,
		"type"            : 0,
		"maxLength"       : 0,
		"nowrap"          : 1,
		"src"             : 1,
		"unselectable"    : 1,
		"_action"         : 1,
		"_action1"        : 1,
		"_align"          : 1,
		"_fid"            : 1,
		"_layout"         : 1,
		"_name"           : 1,
		"backgroundColor" : 2,
		"backgroundRepeat": 2,
		"border"          : 2,
		"borderBottom"    : 2,
		"color"           : 2,
		"cursor"          : 2,
		"display"         : 2,
		"filter"          : 2,
		"font"            : 2,
		"fontWeight"      : 2,
		"fontFamily"      : 2,
		"fontSize"        : 2,
		"height"          : 2,
		"left"            : 2,
		"lineHeight"      : 2,
		"overflow"        : 2,
		"overflowX"       : 2,
		"padding"         : 2,
		"position"        : 2,
		"styleFloat"      : 2,
		"textAlign"       : 2,
		"top"             : 2,
		"whiteSpace"      : 2,
		"width"           : 2,
		"verticalAlign"   : 2,
		"zIndex"          : 2,
		"zoom"            : 2
	};
	this._init = function(){
		_super._init.call(this);
		//runtime._components.push(this);
		this._tag = "Component";
		this._domCreate = false;
		this._domBuildType = 0;  //0=create,1=bind
		this._win = null;  //runtime.getWindow();
		this._doc = null;  //runtime.getDocument();  //this._win.document
		this._dom = runtime.getDom();
		//this._parent = null;
		this._owner = null;
		//this._id = null;
		this._tagName = "div";
		this._self = null;  //组件所关联的DOM元素
		this._containerNode = null;
		this._jsonData = null;
		this._data = null;  //结点的json数据
		this._currentPropertys = {};
		this._left = 0;
		this._top = 0;
		this._width = 0;
		this._height = 0;
		this._align = "none";
		this._dockRect = {x: 0, y: 0, w: 0, h: 0};  //停靠以后组件的位置信息
		this._borderLeftWidth = 0;
		this._borderTopWidth = 0;
		this._borderRightWidth = 0;
		this._borderBottomWidth = 0;
		this._paddingLeft = 0;
		this._paddingTop = 0;
		this._paddingRight = 0;
		this._paddingBottom = 0;
		//this._visible = false;
		this._visible = null;  //boolean
		this._zIndex = 0;
		this._opacity = 0;
		this._position = "";  //"relative"
		this._modal = false;
		this._ee = {};
		this._cssName = "";  //组件自身的DOM元素的className的替代名称
		this._xpath = "";
		this._state = "normal";
		this._cursors = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
		this._created = false;
		this._inited = false;
	};
	this.toString = function(){
		return "{tag:'" + this._className + "',align:'" + this._align + "'}";
	};
	/**
	 * 初始化window,document等环境
	 */
	this.setParent2 = function(parent){
		if(parent){
			this._parent = parent;
			if(parent.ownerDocument){
				this._doc = parent.ownerDocument;
			}else if(parent._self){
				this._doc = parent._self.ownerDocument;
			}
		}
		if(!this._doc){
			window.alert("[Component::setParent2]未能正确识别DocEnv环境，默认使用runtime.getDocument()");
			this._doc = runtime.getDocument();  //this._win.document
		}
		this._win = this._doc.parentWindow || this._doc.defaultView;  //runtime.getWindow();
	};
	this.getDoc = function(){
		if(!this._doc){
			this.initDocEnv(this._self/*, this._parent*/);
		}
		return this._doc;
	};
	this._createTextNode = function(text){
		return this.getDoc().createTextNode(text);
	};
	this._createElement = function(tag){
		return this.getDoc().createElement(tag);
	};
	this._createElement2 = function(parent, tag, cls, style){
		var obj = this._createElement(tag);
		if(cls){
			obj.className = cls;
		}
		if(style){
			for(var k in style){
				//if(k.charAt(0) == "_") 1;
				switch(ATTR[k]){
				case 0: obj[k] = style[k];break;
				case 1: obj.setAttribute(k, style[k]);break;
				case 2: obj.style[k] = style[k];break;
				}
			}
		}
		if(parent){
			parent.appendChild(obj);
		}
		return obj;
	};
	this.parseNum = function(tag, v){
		return this._dom.parseNum(tag, v);
	};
	this.getPropertyValue = function(style, name){
		return this._dom.getPropertyValue(style, name);
	};
	/**
	 * 调用该方法初始化的组件的所有属性从DOM元素中动态获取
	 * 设计该方法的思想和 init 方法完全相反，init方法从脚本组件角度考虑问题，bind
	 * 方法从 DOM 元素角度考虑问题。
	 */
	//this.build = function(data){};
	this.bind = function(obj){
		this.setParent2(obj.parentNode);
		/*
		var props = "color,cursor,display,visibility,opacity,zIndex,"
			+ "overflow,position,"
			+ "left,top,bottom,right,width,height,"
			+ "marginBottom,marginLeft,marginRight,marginTop,"
			+ "borderTopColor,borderTopStyle,borderTopWidth,"
			+ "borderRightColor,borderRightStyle,borderRightWidth,"
			+ "borderBottomColor,borderBottomStyle,borderBottomWidth,"
			+ "borderLeftColor,borderLeftStyle,borderLeftWidth,"
			+ "paddingBottom,paddingLeft,paddingRight,paddingTop,"
			+ "backgroundAttachment,backgroundColor,backgroundImage,backgroundPosition,backgroundRepeat";
		*/
		/*
		margin,border,padding
		borderTop,borderRight,borderBottom,borderLeft,
		borderColor,borderSpacing,borderStyle,borderWidth
		fontFamily,fontSize,fontSizeAdjust,fontStretch,fontStyle,fontVariant,fontWeight
		direction
		overflowX,overflowY
		textAlign,textDecoration,textIndent,textShadow,textTransform
		lineHeight,
		verticalAlign
		*/
		var style = this._dom.getStyle(obj);
		/*
		var arr = props.split(",");
		for(var i = 0, len = arr.length; i < len; i++){
			this._currentPropertys[arr[i]] = this.getPropertyValue(style, arr[i]);
		}
		*/
		this._position = this.getPropertyValue(style, "position");
		this._visible = this.getPropertyValue(style, "display") != "none";
		this._left = this.parseNum(obj.tagName, this.getPropertyValue(style, "left")) || obj.offsetLeft;
		this._top = this.parseNum(obj.tagName, this.getPropertyValue(style, "top")) || obj.offsetTop;
		this._width = this.parseNum(obj.tagName, this.getPropertyValue(style, "width")) || obj.offsetWidth;
		this._height = this.parseNum(obj.tagName, this.getPropertyValue(style, "height")) || obj.offsetHeight;

		//if(this._className == "DlgPageTool") window.alert("123");
		var props = {
			"marginTop":0,
			"marginRight":0,
			"marginBottom":0,
			"marginLeft":0,
			"borderTopWidth":1,
			"borderRightWidth":1,
			"borderBottomWidth":1,
			"borderLeftWidth":1,
			"paddingTop":1,
			"paddingRight":1,
			"paddingBottom":1,
			"paddingLeft":1
		}
		for(var k in props){
			if(props[k] == 1){
				this["_" + k] = this.parseNum(obj.tagName, this.getPropertyValue(style, k) || obj.style[k]);
			}
		}
		if(this._jsonData){  //_jsonData 优先级最高
			for(var k in this._jsonData){
				if(this._jsonData[k]){
					this["_" + k] = this._jsonData[k];
				}
			}
			if(this._align != "none"){
				this._position = "absolute";
				this._dockRect = {
					x: this._left,
					y: this._top,
					w: this._width,
					h: this._height
				};
			}
		}
		this.__init(obj, 1);
	};
	this.create = function(parent){
		this.setParent2(parent);
		var obj = this._createElement(this._tagName || "div");
		//obj.style.border = "1px solid #000000";
		if(parent) this.setParent(parent, obj);
		this.init(obj);
		return obj;
	};
	this.__init = function(obj, domBuildType){
		if(this._parent && this._parent.add){  //容器类实例有该方法
			this._parent.add(this);
		}
		this._domBuildType = domBuildType;
		obj._ptr = this;
		this._self = obj;
		this._containerNode = obj;  //基础组件默认_self就是具体的容器节点
		//this._self._ptr = this;
		//this._id = "__dlg__" + Math.round(10000 * Math.random());
		//this._self.id = this._id;
		if(this._position) this._self.style.position = this._position;
	};
	this.init = function(obj){
		//_super.init.apply(this, arguments);
		this.__init(obj, 0);
		//runtime.actionManager.add(this);
		//this.setVisible(this._visible);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._data = null;
		this._jsonData = null;
		this._containerNode = null;
		if(this._self){
			if(this._self._ptr){
				this._self._ptr = null;
			}
			if(this._self.tagName != "BODY" && this._self.parentNode){  // && this._domBuildType == 0)
				var o = this._self.parentNode.removeChild(this._self);
				delete o;
				if(runtime.ie){
					this._self.outerHTML = "";
				}
			}
			//runtime.checkDomClean(this);
			this._self = null;
		}
		this._owner = null;
		//this._parent = null;
		this._dom = null;
		this._doc = null;
		this._win = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getElement = function(){
		return this._self;
	};
	this.getData = function(){
		return this._data;
	};
	this.setJsonData = function(v){
		this._jsonData = v;
	};
	this.setParent = function(v, obj){
		if(!v) v = runtime._workspace;  //obj.parentNode
		//this._parent = v;
		_super.setParent.apply(this, arguments);
		var parent = v._self ? v : (v._ptr ? v._ptr : null);
		if(!parent) throw "找不到父组件的 DOM 元素";
		if(obj.parentNode){
			obj.parentNode.removeChild(obj);
		}
		parent._containerNode.appendChild(obj);
	};
	this.getOwner = function(){
		return this._owner;
	};
	this.setOwner = function(v){
		this._owner = v;
	};
	this.setStyleProperty = function(name, value){
		try{
			if(this._self){
				this._self.style[name] = value;
			}
		}catch(ex){
			window.alert(ex.description + "\n" + name + "=" + value);
		}
	};
	this.getAlign = function(){
		return this._align;
	};
	this.getLeft = function(){
		return this._left;
	};
	this.setLeft = function(v){
		this._left = v;
		//v += this._paddingLeft;
		this.setStyleProperty("left", v + "px");
		if(this._myLayer){
			this._myLayer.style.left = v + "px";
		}
	};
	this.getTop = function(){
		return this._top;
	};
	this.setTop = function(v){
		this._top = v;
		//v += this._paddingTop;
		this.setStyleProperty("top", v + "px");
		if(this._myLayer){
			this._myLayer.style.top = v + "px";
		}
	};
	this.getInnerWidth = function(v){
		if(!v) v = this._width;
		return Math.max(0, v - this._borderLeftWidth - this._borderRightWidth - this._paddingLeft - this._paddingRight);
		//return Math.max(0, runtime.getBoxModel() == 0 ? v : v - this._borderLeftWidth - this._borderRightWidth - this._paddingLeft - this._paddingRight);
	};
	this.getInnerHeight = function(v){
		if(!v) v = this._height;
		return Math.max(0, v - this._borderTopWidth - this._borderBottomWidth - this._paddingTop - this._paddingBottom);
		//return Math.max(0, runtime.getBoxModel() == 0 ? v : v - this._borderTopWidth - this._borderBottomWidth - this._paddingTop - this._paddingBottom);
	};
	this.getWidth = function(){
		return this._width;
	};
	this.setWidth = function(v){
		v = Math.max(v, 0);
		this._width = v;
		if(this._dockRect.w == 0) this._dockRect.w = v;
		var w = this.getInnerWidth(v);
		this._setWidth(w);
	};
	this.getHeight = function(){
		return this._height;
	};
	this.setHeight = function(v){
		v = Math.max(v, 0);
		this._height = v;
		if(this._dockRect.h == 0) this._dockRect.h = v;
		var h = this.getInnerHeight(v);
		this._setHeight(h);
	};
	this._setWidth = function(v){
		v = Math.max(v, 0);
		this.setStyleProperty("width", v + "px");
		if(this._myLayer){
			this._myLayer.style.width = v + "px";
		}
	};
	this._setHeight = function(v){
		v = Math.max(v, 0);
		this.setStyleProperty("height", v + "px");
		if(this._myLayer){
			this._myLayer.style.height = v + "px";
		}
	};
	this.setBgColor = function(v){
		this.setStyleProperty("backgroundColor", v);
	};
	this.getVisible = function(){
		return this._visible;
	};
	this.setVisible = function(v){
		if(v == this._visible) return;
		this._visible = v;
		if(v){
			this.setStyleProperty("visibility", "visible");
			this.setStyleProperty("display",
				",A,B,I,U,SPAN,INPUT,BUTTON,".indexOf(this._self.tagName) != -1
				? ""
				: "block");
		}else{
			this.setStyleProperty("visibility", "hidden");
			this.setStyleProperty("display", "none");
		}
	};
	this.getZIndex = function(){
		return this._zIndex;
	};
	this.setZIndex = function(zIndex){
		this._zIndex = zIndex;
		this.setStyleProperty("zIndex", zIndex);
	};
	this.getOpacity = function(){
		return this._opacity;
	};
	this.setOpacity = function(v){
		if(this._opacity != v){
			v = Math.max(0, Math.min(1, v));
			this._opacity = v;
			if(runtime.ie){
				v = Math.round(v * 100);
				this.setStyleProperty("filter", v == 100 ? "" : "Alpha(Opacity=" + v + ")");
			}else if(runtime.moz){
				this.setStyleProperty("MozOpacity", v == 1 ? "" : v);
			}else if(runtime.opera || runtime.safari || runtime.chrome){
				this.setStyleProperty("opacity", v == 1 ? "" : v);
			}
		}
	};
	this.getCapture = function(){
		return this._capture;
	};
	this.setCapture = function(bCapture){  //设置为事件焦点组件
		this._capture = bCapture;
		runtime._workspace.setCaptureComponent(bCapture ? this : null);
		//this.getContext().getGuiManager().setCaptureComponent(bCapture ? this : null);
	};
	this.resize = function(w, h){
		if(!h) h = this.getHeight();
		if(!w) w = this.getWidth();
		w = Math.max(0, w);
		h = Math.max(0, h);
		if(w == 0 || h == 0){
			this.setStyleProperty("display", "none");
		}else{
			if(this._self.style.display == "none"){
				this.setStyleProperty("display", "block");
			}
			this.setWidth(w);
			this.setHeight(h);
			if(this._domCreate){
				this._dom.resize(this._self);
			}
		}
	};
	/*
	this.resizeTo = function(w, h){
		if(this._self){
			this._self.style.width = Math.max(w, 0) + "px";
			this._self.style.height = Math.max(h, 0) + "px";
		}
	};
	*/
	this.getViewPort = function(){
		return {
			"x": this._self.scrollLeft,
			"y": this._self.scrollTop,
			"w": this._self.clientWidth,  //Math.max(this._self.clientWidth || this._self.scrollWidth)
			"h": Math.max(this._self.clientHeight, this._self.parentNode.clientHeight)  //Math.max(this._self.clientHeight || this._self.scrollHeight)
		};
	};
	this.moveTo = function(x, y){
		this.setLeft(x);
		this.setTop(y);
	};
	this.moveToCenter = function(){
		var rect = this._parent.getViewPort
			? this._parent.getViewPort()
			: runtime._workspace.getViewPort();
		var dw = "getWidth"  in this ? this.getWidth()  : this._self.offsetWidth;
		var dh = "getHeight" in this ? this.getHeight() : this._self.offsetHeight;
		this.moveTo(
			rect.x + Math.round((rect.w - dw) / 2),
			rect.y + Math.round((rect.h - dh) / 2)
		);
	};
	this.getPosition = function(ev, type){
		var pos = type == 1
			? {"x": ev.offsetX, "y": ev.offsetY}
			: {"x": 0, "y": 0};
		var refElement = runtime._workspace._self;
		var obj = ev.srcElement || ev.target;
		while(obj && obj != refElement){
			pos.x += obj.offsetLeft;
			pos.y += obj.offsetTop;
			obj = obj.offsetParent;
		}
		return pos;
	};
	this.showModal = function(v){
		var panel = this._parent && this._parent.getModalPanel
			? this._parent.getModalPanel()
			: runtime.getModalPanel();
		if(v){
			panel.pushTarget(this);
			this.setZIndex(runtime.getNextZIndex());
			//this._self.onclick = function(){this._ptr.showModal(false);};
		}else{
			panel.popTarget();
		}
		this._modal = v;
		panel.setVisible(v);
		this.setVisible(v);
		if(v){
			try{
				this._self.focus();  //设定焦点
			}catch(ex){
			}
		}
		panel = null;
	};
	this.setElementRect = function(obj, x, y, w, h, bg){
		obj.style.left   = x + "px";
		obj.style.top    = y + "px";
		obj.style.width  = w + "px";
		obj.style.height = h + "px";
	};
	this.setState = function(v){
		if(v == this._state) return;
		this._state = v;
		//runtime.dom.applyCssStyle1(this, this._xpath, v);
		runtime.dom.applyCssStyle(this, this._cssData, v);
	};
	this._cssKeyToJsKey = function(str){
		return str.replace(/-([a-z])/g, function(_0, _1){
			return _1.toUpperCase();
		});
	};
	this.applyCssStyle = function(element, css, className){
		var style = css[(element.className == "error" ? "error-" : "") + className];
		for(var k in style){
			if(k.charAt(0) == "_"){
				var obj = element.getElementsByTagName(k.substr(1))[0];
				for(var key in style[k]){
					var name = this._cssKeyToJsKey(key);
					if(obj.style[name] != style[k][key]){
						obj.style[name] = style[k][key];
					}
				}
				obj = null;
			}else{
				var name = this._cssKeyToJsKey(k);
				if(element.style[name] != style[k]){
					element.style[name] = style[k];
				}
			}
		}
	};
	/**
	 * 通过判断是否绑定有 js 组件对象来确定UI组件
	 */
	this.getControl = function(el){
		while(!el._ptr){
			el = el.parentNode;
			if(!el || el.tagName == "BODY" || el.tagName == "HTML"){
				return null;
			}
		}
		return el._ptr;
	};
	this.dispatchEvent = function(name, params){
		var type = "on" + name;
		if(type in this && typeof this[type] == "function"){
			this[type].apply(this, params);
		}
	};
});
/*</file>*/

/*<file name="alz/action/ActionElement.js">*/
_package("alz.action");

_import("alz.mui.Component");

/**
 * 具有action特性的组件的基类
 */
_class("ActionElement", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._actionManager = null;
		this._action = "";
		this._timer = 0;  //计时器，防止用户多次重复点击
	};
	this.create = function(parent, obj, actionManager){
		this.setParent2(parent);
		this._actionManager = actionManager;
		obj.style.position = "";
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._disabled = this._self.getAttribute("_disabled") == "true";
		this._action = this._self.getAttribute("_action");
		if(this._className == "ActionElement"){
			var _this = this;
			this._self.onclick = function(ev){
				return _this.dispatchAction(this, ev || window.event);
			};
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._className == "ActionElement"){
			this._self.onclick = null;
		}
		this._actionManager = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getAction = function(){
		return this._action;
	};
	this.setAction = function(v){
		this._action = v;
	};
	this.setDisabled = function(v){
		_super.setDisabled.apply(this, arguments);
		if(!this._disabled && this._self){
			this._self.disabled = v;
		}
	};
	this.dispatchAction = function(sender, ev){
		//try{
			if(this._disabled) return false;
			var d = new Date().getTime();
			if(this._timer != 0){
				if(d - this._timer <= 500){  //两次点击间隔必须大于500毫秒
					runtime.log("cancel");
					this._timer = d;
					return false;
				}
			}
			this._timer = d;
			//if(this._self.tagName == "INPUT" && this._self.type == "checkbox"){
			//onDispatchAction可以用来记录用户的完整的行为，并对此进行“用户行为分析”
			if(typeof this.onDispatchAction == "function"){
				this.onDispatchAction(this._action, sender, ev);
			}
			if(this._className == "CheckBox"){
				this._actionManager.dispatchAction(this._action[sender.checked ? 0 : 1], sender, ev);
			}else{
				return this._actionManager.dispatchAction(this._action, sender, ev);
			}
		/*}catch(ex){  //对所有action触发的逻辑产生的错误进行容错处理
			var sb = [];
			for(var k in ex){
				sb.push(k + "=" + ex[k]);
			}
			window.alert("[ActionElement::dispatchAction]\n" + sb.join("\n"));
		}*/
	};
	this.onDispatchAction = function(action, sender, ev){
		//[TODO]iframe 模式下_actionCollection 未定义
		//runtime._actionCollection.onDispatchAction(action, sender);
	};
});
/*</file>*/
/*<file name="alz/action/LinkLabel.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * 超链接(a)元素的封装
 */
_class("LinkLabel", ActionElement, function(_super){
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onclick = function(ev, sender){  //sender 代表要替换的伪装的 sender 参数
			ev = ev || window.event;
			ev.cancelBubble = true;
			return _this.dispatchAction(sender || this, ev);
		};
		this._self.oncontextmenu = function(ev){
			ev = ev || window.event;
			ev.cancelBubble = true;
			return false;
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.oncontextmenu = null;
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});
/*</file>*/
/*<file name="alz/action/Button.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * input:button元素的封装
 */
_class("Button", ActionElement, function(_super){
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onclick = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
		//[TODO]因为setDisabled中的优化考虑，这里目前只能使用如此笨拙的方式驱动
		//setDisabled工作，其他地方相对成熟的方式是添加强制更新的参数。
		var v = this._disabled;
		this._disabled = null;
		this.setDisabled(v);
		v = null;
		/*
		var rows = this._self.rows;
		for(var i = 0, len = rows.length; i < len; i++){
			rows[i].onmouseover = function(){if(_this._disabled) return; this.className = "onHover";};
			rows[i].onmouseout = function(){if(_this._disabled) return; this.className = "normal";};
		}
		rows = null;
		*/
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setDisabled = function(v){
		_super.setDisabled.apply(this, arguments);
		if(!this._disabled && this._self){
			this._self.disabled = v;
			this._self.style.color = v ? "gray" : "";
			//this._self.rows[0].className = v ? "OnDisable" : "normal";
			/*if(v){
				var btn = this._self.getElementsByTagName("div")[0];
				if(btn) btn.style.backgroundImage = "url(http://www.sinaimg.cn/rny/sinamail421/images/comm/icon_btn.gif)";
				btn = null;
			}*/
		}
	};
	this.setVisible = function(v){
		if(this._visible == v) return;
		this._visible = v;
		if(v){
			this.setStyleProperty("visibility", "visible");
			this.setStyleProperty("display", "");
		}else{
			this.setStyleProperty("visibility", "hidden");
			this.setStyleProperty("display", "none");
		}
	};
});
/*</file>*/
/*<file name="alz/action/CheckBox.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * input:checkbox元素的封装
 */
_class("CheckBox", ActionElement, function(_super){
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._action = this._action.split("|");
		var _this = this;
		this._self.onclick = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});
/*</file>*/
/*<file name="alz/action/ComboBox.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * select元素的封装
 */
_class("ComboBox", ActionElement, function(_super){
	this._init = function(obj){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onchange = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onchange = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});
/*</file>*/
/*<file name="alz/action/FormElement.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * form元素的封装
 */
_class("FormElement", ActionElement, function(_super){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onsubmit = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onsubmit = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resetSelf = function(){
		this._self.reset();
	};
});
/*</file>*/

/*<file name="alz/mui/TextHistory.js">*/
_package("alz.mui");

/**
 * 命令历史纪录
 */
_class("TextHistory", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._historys = [];
		this._curIndex = 0;  //历史记录的位置
	};
	this.dispose = function(){
		for(var i = 0, len = this._historys.length; i < len; i++){
			this._historys[i] = null;
		}
		this._historys = [];
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getText = function(num){
		if(num == -1 && this._historys.length - 1 == 0){  //特殊处理这种情况
			return this._historys[0];
		}else if(this._historys.length - 1 > 0){
			var n = Math.max(0, Math.min(this._historys.length - 1, this._curIndex + num));
			if(this._curIndex != n){
				this._curIndex = n;
				return this._historys[n];
			}
		}
	};
	this.append = function(text){
		this._historys.push(text);
		this._curIndex = this._historys.length;
	};
});
/*</file>*/
/*<file name="alz/mui/TextItem.js">*/
_package("alz.mui");

_import("alz.mui.Component");

_class("TextItem", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._type = "sys";  //当前文本的类型
		this._text = "";     //文本内容
		this._active = false;  //当前文本是否处于活动状态之下
		this._cursor = -1;     //如果处在活动状态下，当前光标位置
		//this.create(parent, type, text);
	};
	this.create = function(parent, type, text){
		this.setParent2(parent);
		this._type = type;
		this._text = text;
		var obj = window.document.createElement("span");
		obj.className = this._type;
		parent._self.appendChild(obj);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this.update();
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getTextLength = function(){
		return this._text.length;
	};
	this.getText = function(){
		return this._text;
	};
	this.setText = function(text){
		this._text = text;
		this._cursor = text.length;
		this.update();
	};
	this.getCursor = function(){
		return this._cursor;
	};
	this.setCursor = function(v){
		this._cursor = v;
		this.update();
	};
	this.appendText = function(text){
		if(this._cursor == -1 || this._cursor == this._text.length){
			this._text += text;
		}else{
			this._text = this._text.substr(0, this._cursor) + text + this._text.substr(this._cursor);
		}
		this._cursor += text.length;
		this.update();
	};
	this.removeChar = function(n){
		if(n == -1){  //backspace
			this._text = this._text.substr(0, this._cursor - 1) + this._text.substr(this._cursor);
			this._cursor--;
		}else{  //del
			this._text = this._text.substr(0, this._cursor) + this._text.substr(this._cursor + 1);
		}
		this.update();
	};
	this.update = function(){
		if(!runtime._host.xul){
			this._self.innerHTML = this.getInnerHTML();
		}else{
			while(this._self.hasChildNodes()){
				this._self.removeChild(this._self.childNodes[0]);
			}
			if(this._active && this._type == "in"){
				var type = this._parent.getCursorType();
				var cursor = type ? 'cursor ' + type : 'cursor';
				this._self.appendChild(this._createTextNode(this._text.substr(0, this._cursor)));
				var span = this._createElement2(this._self, "span", cursor);
				span.appendChild(this._createTextNode(this._text.charAt(this._cursor) || " "));
				this._self.appendChild(this._createTextNode(this._text.substr(this._cursor + 1)));
			}else{
				this._self.appendChild(this._createTextNode(this._text));
			}
		}
	};
	/*
	var html = '<span class="sys">' + runtime.encodeHTML(this._text.substr(0, this._start)) + '</span>'
		+ '<span class="in">'
		+ runtime.encodeHTML(this._text.substr(this._start, this._col))
		+ '<span class="cursor">' + runtime.encodeHTML(this._text.charAt(this._col) || " ") + '</span>'
		+ this._text.substr(this._col + 1)
		+ '</span>';
	this._self.innerHTML = html;
	*/
	this.toHTML = function(){
		return '<span class="' + this._type + '">' + this.getInnerHTML() + '</span>';
	};
	this.getInnerHTML = function(){
		if(this._active && this._type == "in"){
			var type = this._parent.getCursorType();
			var cursor = type ? 'cursor ' + type : 'cursor';
			return runtime.encodeHTML(this._text.substr(0, this._cursor))
				+ '<span class="' + cursor + '">'
				+ runtime.encodeHTML(this._text.charAt(this._cursor) || " ")
				+ '</span>'
				+ this._text.substr(this._cursor + 1);
		}else{
			return runtime.encodeHTML(this._text);
		}
	};
	this.deactivate = function(){
		this._active = false;
		this._cursor = -1;
	};
	this.activate = function(){
		this._active = true;
		if(this._type == "in"){
			this._cursor = this._text.length;
		}
	};
});
/*</file>*/
/*<file name="alz/mui/LineEdit.js">*/
_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.TextHistory");
_import("alz.mui.TextItem");

/**
 * 行编辑器组件
 * <div id="d1" class="LineEdit">&gt;window.<span class="cursor">a</span>lert("aaaa");</div>
 */
_class("LineEdit", Component, function(_super){
	var KEY_BACKSPACE = 8;
	var KEY_TAB       = 9;   //\t
	var KEY_ENTER     = 13;  //\n
	var KEY_SHIFT     = 16;
	var KEY_CTRL      = 17;
	var KEY_ALT       = 18;
	var KEY_CAPSLOCK  = 20;
	var KEY_ESC       = 27;
	var KEY_SPACE     = 32;  //" "
	var KEY_PAGE_UP   = 33;
	var KEY_PAGE_DOWN = 34;
	var KEY_END       = 35;
	var KEY_HOME      = 36;
	var KEY_LEFT      = 37;
	var KEY_UP        = 38;
	var KEY_RIGHT     = 39;
	var KEY_DOWN      = 40;
	var KEY_INS       = 45;
	var KEY_DEL       = 46;
	var KEY_CH_0      = 48;
	var KEY_CH_9      = 57;
	var KEY_SEMICOLON = 59;   //;
	var KEY_CH_A      = 65;
	var KEY_CH_Z      = 90;
	var KEY_F1        = 110;  //
	var KEY_F2        = 111;  //
	var KEY_F3        = 112;  //!!!系统搜索键
	var KEY_F4        = 113;  //!!!Drop 地址栏
	var KEY_F5        = 114;  //!!!刷新
	var KEY_F6        = 115;  //!!!输入焦点转入地址栏
	var KEY_F7        = 116;  //
	var KEY_F8        = 117;  //
	var KEY_F9        = 118;  //
	var KEY_F10       = 119;  //
	var KEY_F11       = 120;  //
	var KEY_F12       = 121;  //!!!输入焦点转入菜单
	var KEY_xxx       = 229;
	//var count = 0;
	this._number = "0123456789)!@#$%^&*(";
	this._letter = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	this.trim = function(str){  //strip
		return str.replace(/^\s+|[\s\xA0]+$/g, "");
	};
	/*
	this.getInputCursorIndex = function(){
		var s = document.selection.createRange();
		s.setEndPoint("StartToStart", this._input.createTextRange());
		window.alert('left:'+(s.text.length)+'\nright:'+(obj.value.length-s.text.length));
		var selection = document.selection;
		var rng = selection.createRange();
		this._input.select();
		rng.setEndPoint("StartToStart", selection.createRange());
		window.alert(rng.text);
		var pos = rng.text.length;
		rng.collapse(false);
		rng.select();
		return pos;
	};
	*/
	function getCursorIndex(){
		var selection = window.document.selection;
		var rng = selection.createRange();
		this._self.select();
		rng.setEndPoint("StartToStart", selection.createRange());
		this._pos = rng.text.length;
		window.document.title = this._pos;
		rng.collapse(false);  //移到后面
		rng.select();
		rng = null;
	}
	this._init = function(){
		_super._init.call(this);
		this._useInput = false;
		this._input = null;
		this._app = null;
		this._timer = 0;
		this._pos = 0;
		this._history = new TextHistory();  //历史记录管理
		this._cursorType = "gray";  //默认为gray
		this._items = [];
		this._activeItem = null;
		this._start = 0;
		this._end = 80;
		this._col = 4;
		this._iomode = "";  //in|out
	};
	this.create = function(parent, app){
		this.setParent2(parent);
		if(app) this._app = app;
		var obj = this._createElement2(parent ? parent._self : null, "div", "aui-LineEdit");
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		if(this._useInput){
			this._input = this._createElement2(null, "input", "input", {
				"type"     : "text",
				"maxLength": "78"
			});
			//if(debug) this._input.style.backgroundColor = "#444444";
			this._input.onkeydown = function(ev){
				return _this.onKeyDown1(ev || window.event, this);
			};
			this._input.onkeyup = function(){
				//_this._timer = runtime.addThread(200, this, getCursorIndex);
			};
			this._input.onkeypress = function(ev){
				return _this.onKeyPress(ev || window.event, this);
			};
			//this._input.onfocus = function(){};
			//this._input.onblur = function(){};
			this._input.ondblclick = function(){
				if(_this._timer != 0){
					window.clearTimeout(timer);
					_this._timer = 0;
				}
			};
			this._input.onclick = function(ev){
				ev = ev || window.event;
				//_this._timer = runtime.addThread(200, this, getCursorIndex);
				ev.cancelBubble = true;
			};
		}else{
			/*
			if(runtime.moz){
				document.onkeydown = function(ev){
					return _this.onKeyDown(ev || window.event, _this._self);
				};
			}else{
				this._self.onkeydown = function(ev){
					return this._ptr.onKeyDown(ev || window.event, this);
				};
			}
			*/
		}
	};
	this.reset = function(){
		this._activeItem = null;
		for(var i = 0, len = this._items.length; i < len; i++){
			this._items[i].dispose();
			this._items[i] = null;
		}
		this._items = [];
		this._col = 0;
		this.print(this._parent.getPrompt(), "sys");
		this.setIomode("in");
	};
	this.dispose = function(){
		this._activeItem = null;
		for(var i = 0, len = this._items.length; i < len; i++){
			this._items[i].dispose();
			this._items[i] = null;
		}
		this._items = [];
		this._app = null;
		if(this._useInput){
			this._input.onclick = null;
			this._input.ondblclick = null;
			//this._input.onblur = null;
			//this._input.onfocus = null;
			this._input.onkeypress = null;
			this._input.onkeyup = null;
			this._input.onkeydown = null;
			this._input = null;
		}else{
			this._self.onkeydown = null;
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setCursorType = function(v){
		this._cursorType = v;
	};
	this.getCursorType = function(){
		return this._cursorType;
	};
	this.getText = function(){
		var sb = [];
		for(var i = 0, len = this._items.length; i < len; i++){
			sb.push(this._items[i].getText());
		}
		return sb.join("");
	};
	this.appendItem = function(type, text){
		var item = new TextItem();
		item.create(this, type, text);
		this._items.push(item);
		this.activeItem(item);
		return item;
	};
	this.setIomode = function(v){
		var oldiomode = this._iomode;
		this._iomode = v;
		if(v == "in"){
			this.appendItem("in", "");
			this._start = this._col;
			this._parent._self.appendChild(this._self);
			this.setFocus();
		}else{  //out
			var item = this._activeItem;
			this.activeItem(null);
			if(oldiomode == "in"){
				item.update();
				var line = this._parent.insertBlankLine();
				this._activeItem = null;
				for(var i = 0, len = this._items.length; i < len; i++){
					var obj = this._items[i]._self;
					obj.parentNode.removeChild(obj);
					line.appendChild(obj);
					obj._ptr = null;
					this._items[i]._self = null;
					this._items[i].dispose();
					this._items[i] = null;
				}
				this._items = [];
			}
			this._parent._self.removeChild(this._self);
		}
		/*
		this._lineEdit.setParent(this._lastLine);
		var obj = this._lineEdit._self;
		if(!obj.parentNode){
			this._lastLine.appendChild(obj);
			this.resize();
		}
		obj = null;
		*/
	};
	this.setWidth = function(v){
		//this._input.style.width = Math.max(0, v) + "px";
	};
	this.getValue = function(){
		return this._input.value;
	};
	this.setValue = function(v){
		this._input.value = v;
	};
	this.getHistoryText = function(num){
		var text = this._history.getText(num);
		if(text){
			this._activeItem.setText(text);
			this._col = this._start + text.length;
		}
	};
	this.activeItem = function(item){
		if(this._activeItem == item) return;
		if(this._activeItem){
			this._activeItem.deactivate();
		}
		if(item){
			item.activate();
		}
		this._activeItem = item;
	};
	/*
	this.setText = function(v){
		var sb = [];
		for(var i = 0, len = this._items.length; i < len; i++){
			sb.push(this._items[i].getText());
		}
		if(v != sb.join("")) window.alert(123123);
		this._text = v;
	};
	this._formatLine = function(){
		var sb = [];
		for(var i = 0, len = this._items.length; i < len; i++){
			sb.push(this._items[i].toHTML());
		}
		return sb.join("");
	};
	this.updateLine = function(){
		this._self.innerHTML = this._formatLine();
		var sb = [];
		//sb.push("row=" + this._row);
		sb.push("col=" + this._col);
		sb.push("start=" + this._start);
		sb.push("curIndex=" + this._history._curIndex);
		sb.push("text=" + this.getText());
		window.status = sb.join(",");
	};
	*/
	this.setFocus = function(){
		if(this._useInput){
			if(!this._input.parentNode) return;
			var rng = this._input.createTextRange();
			rng.collapse(true);
			rng.moveStart('character', this._pos);
			rng.select();
			rng = null;
			runtime.addThread(0, this, function(){
				try{
					this._input.focus();
				}catch(ex){
				}
			});
		}else{
			if(!this._self.parentNode){
				this._parent._self.appendChild(this._self);
			}
			if(this._iomode == "in"){
				//try{
				//	this._self.focus();  //(通过焦点的转换,)重新定位光标的位置
				//}catch(ex){
				//}
				this._activeItem.update();
				this._parent.scrollToBottom();
			}
		}
	};
	this.getFrontText = function(){
		var s = window.document.selection.createRange();
		s.setEndPoint("StartToStart", this._input.createTextRange());
		var text = s.text;
		s = null;
		return text;
	};
	this.addInputText = function(text, value){
		//var rng = this._input.createTextRange();
		//rng.moveEnd("character");
		var rng = window.document.selection.createRange();
		if(value && value.length > 0){
			rng.moveStart("character", -value.length);
		}
		rng.text = text;
		rng = null;
	};
	this.getNumber = function(n){
		return this._number.substr(n, 1);
	};
	this.getChar = function(n){
		return this._letter.substr(n, 1);
	};
	this.isEndLine = function(row){
		//return (row == this._rows.length - 1);
		return true;
	};
	/**
	 * 往行编辑器里面打印一段文本
	 * @param {String} str 要打印的文件内容
	 * @param {String} type 文本的类型
	 *             sys 系统信息
	 *             dbg 调试信息
	 *             in  标准输入
	 *             out 标准输出
	 *             err 错误输出
	 *             log 日志信息
	 */
	this.print = function(str, type){
		if(typeof str == "undefined") window.alert(str);
		if(this._useInput){
			this._input.value = str;
		}else{
			str = str.replace(/\r?\n/g, "\n");
			if(str.indexOf("\n") == -1){
				this.printText(str, type);
			}else{
				var arr = str.split("\n");
				for(var i = 0, len = arr.length; i < len; i++){
					if(i < len - 1){
						this._parent.insertLine(arr[i], this._iomode == "in" ? this._self : null, type);
					}else{
						if(arr[i] != ""){
							this.printText(arr[i], type);
						}
					}
				}
				//this._lastLine = this.insertLine(arr[i]);
				//line.style.backgroundColor = getRandomColor();
				//line.innerHTML = runtime.encodeHTML(str);
				//this._self.insertBefore(line, _input.parentNode);
			}
		}
	};
	this.printText = function(str, type){
		this.appendItem(type, str);
		this._col += str.length;
		/*
		var span = this._createElement2(this._self, "span", type);
		span.appendChild(this._createTextNode(str));
		span = null;
		*/
	};
	this.incCol = function(n){
		if(this._col + n <= 80){
			this._col += n;
			return true;
		}else{
			return false;
		}
	};
	//插入一段不含回车符的字符串
	this.insertText = function(str){
		if(this.incCol(str.length)){
			if(this._col == this.getText().length + str.length){
				this._activeItem.appendText(str);
			}else{
				this._activeItem.appendText(str);
			}
		}
	};
	//事件处理函数
	this.onKeyPress = function(ev, sender){
		var ch = String.fromCharCode(ev.keyCode);
		var v = sender.value;
		if(ch == "\r" && this.trim(v) != ""){
			var text = v + "\n";
			sender.value = "";
			this._input.parentNode.removeChild(this._input);
			this._history.append(text);
			this.print(text, "in");
			this._parent.getCallback()(text);
		}else if(ch == "."){  //自动完成功能
			if(this._app){
				var nameChain = this._app.getNameChain(this.getFrontText());
				this._app.showFunTip(nameChain);
				//var name = nameChain || "#global";
			}
		}else if(ch == "("){  //语法提示功能
		}/*else if(ch == "\t"){
			window.alert(111);
		}*/
	};
	//使用input元素的实现
	this.onKeyDown1 = function(ev, sender){
		var redraw = true;
		var kc = ev.keyCode;
		if(this._app){
			var tip = this._app.getTip();
			if(tip && tip.getVisible()){
				return tip.onKeyDown(ev, sender);
			}
		}
		switch(kc){
		case KEY_TAB:
			this.addInputText("  ");  //'\t'
			ev.cancelBubble = true;
			return false;
		case KEY_ESC:
			this.setValue("");
			ev.cancelBubble = true;
			return false;
		case KEY_LEFT:
			break;
		case KEY_UP:
			if(this._curIndex >= 0){
				if(this._curIndex == this._historys.length){
					this.setValue(this._historys[--this._curIndex]);
				}else if(this._curIndex >= this._historys.length - 1){
					this.setValue(this._historys[--this._curIndex]);
				}else{
					this.setValue(this._historys[this._curIndex--]);
				}
			}
			break;
		case KEY_RIGHT:
			break;
		case KEY_DOWN:
			if(this._curIndex < this._historys.length - 1){
				while(this._curIndex <= -1){
					this._curIndex++;
				}
				this.setValue(this._historys[++this._curIndex]);
			}
			break;
		}
		return true;
	};
	//不使用input元素的实现
	this.onKeyDown = function(ev, sender){
		//var redraw = true;
		var ret;
		var kc = ev.keyCode;
		if(this._app){
			var tip = this._app.getTip();
			if(tip && tip.getVisible()){
				return tip.onKeyDown(ev, sender);
			}
		}
		if(kc >= KEY_CH_0 && kc <= KEY_CH_9){  //如果是数字(或相应特殊字符)
			this.insertText(this.getNumber(kc - KEY_CH_0 + (ev.shiftKey ? 10 : 0)));
		}else if(kc >= KEY_CH_A && kc <= KEY_CH_Z){  //如果是字母
			this.insertText(this.getChar(kc - KEY_CH_A + (ev.shiftKey ? 26 : 0)));
		}else if(kc == 61){
			this.insertText(ev.shiftKey ? "+" : "=");
		}else if(kc == 109){
			this.insertText(ev.shiftKey ? "_" : "-");
		}else if(kc == KEY_SEMICOLON){
			this.insertText(ev.shiftKey ? ":" : ";");
		}else if(kc >= 186 && kc <= 192){
			this.insertText((ev.shiftKey ? ":+<_>?~" : ";=,-./`").substr(kc - 186, 1));
		}else if(kc >= 219 && kc <= 222){
			this.insertText((ev.shiftKey ? "{|}\"" : "[\\]'").substr(kc - 219, 1));
		}else if(kc == KEY_TAB){
			this.insertText("\t");
		}else if(kc == KEY_SPACE){
			this.insertText(" ");
		}else{
			//redraw = this.do_control(ev);
			ret = this.do_control(ev);
		}
		if(this._col < 0){
			window.alert("Error");
		}
		//count++;
		//window.status = "Ln " + this._row + "   Col " + this._col + "|" + count;
		//if(redraw){
		//	this.drawViewPort();
		//}
		return ret || false;
	};
	this.do_control = function(ev){
		var kc = ev.keyCode;
		switch(kc){
		case KEY_ESC:
			if(this._activeItem.getText() == ""){
			}else{
				this._activeItem.setText("");
				this._col = this._start;
			}
			break;
		case KEY_ENTER:  //确定输入，而无论光标在哪里
			if(this._col > this._start){
				var text = this.getText().substr(this._start);
				this._history.append(text);
				this.setIomode("out");
				//this.print("\n", "in");
				//this._parent.insertLine(this.getText().substr(0, this._start) + text);
				this._parent.getCallback()(text + "\n");
				//this._parent.insertLine(text);
				//this.reset();
				/*
				var row = this._rows[this._row];
				var str = row._text.substr(this._col);  //保存行尾被截断的字符串
				row.setText(row._text.substring(0, this._col) + "\n");  //在此断行
				this._row++;  //指向下一行
				this.insertRow(this._row, str);  //插入一空行并赋值为上行截尾字符串
				this._col = 0;  //列定位于新行开始处
				*/
			}
			break;
		case KEY_BACKSPACE:
			if(this._col > this._start){  //如果没有在开始处
				this._activeItem.removeChar(-1);
				this._col--;
			}
			ev.returnValue = 0;  //防止chrome等浏览器的后退
			ev.cancelBubble = true;
			return false;  //阻止页面后退
		case KEY_DEL:
			if(this._col < this.getText().length){  //如果没有在行末
				this._activeItem.removeChar();
			}
			break;
		case KEY_HOME:
			this._activeItem.setCursor(0);
			this._col = this._start;
			return false;
		case KEY_END:
			this._activeItem.setCursor(this._activeItem.getTextLength());
			this._col = this.getText().length;
			return false;
		case KEY_LEFT:
			if(this._col > this._start){
				this._activeItem.setCursor(this._activeItem.getCursor() - 1);
				this._col--;
			}
			return false;
		case KEY_RIGHT:
			//if(this.isEndLine(this._row)){  //如果是最后一行的话
				if(this._col < this.getText().length){  //this._rows[this._row].getLength()
					this._activeItem.setCursor(this._activeItem.getCursor() + 1);
					this.incCol(1);
				}else{
					return;  //已在编辑文本的最末端
				}
			/*
			}else{
				if(this._col < this.getText().length - 1){  //this._rows[this._row].getLength() - 1
					this.incCol(1);
				}else{  //光标移到下一行开始
					this._col = 0;
					this._row++;
				}
			}
			*/
			return false;
		case KEY_UP:
			/*
			if(this._row > 0){
				var len = this._rows[this._row - 1].getLength();
				if(this._col > len - 1){  //如果大于上一行的长度
					this._col = len - 1;
				}
				this._row--;
				this.updateLine();
			}
			return false;
			*/
			this.getHistoryText(-1);
			break;
		case KEY_DOWN:
			/*
			if(!this.isEndLine(this._row)){  //如果不是最后一行
				var len = this._rows[this._row + 1].getLength();
				if(this.isEndLine(this._row + 1)){  //如果下一行是最后一行
					if(this._col > len - 1){
						this._col = len;
					}
				}else{
					if(this._col > len - 1){
						this._col = len - 1;  //如果大于下一行的长度
					}
				}
				this._row++;
				this.updateLine();
			}
			return false;
			*/
			this.getHistoryText(1);
			break;
		case KEY_SHIFT:
			this._selecting = true;
			this._row0 = this._row;
			this._col0 = this._col;
			return false;
		case KEY_CTRL:
			return false;
		case KEY_ALT:
			return false;
		case KEY_F1:
		case KEY_F2:
		case KEY_F3:  //!!!系统搜索键
		case KEY_F4:  //!!!Drop 地址栏
		case KEY_F5:  //!!!刷新
		case KEY_F6:  //!!!输入焦点转入地址栏
		case KEY_F7:
		case KEY_F8:
		case KEY_F9:
		case KEY_F10:
		case KEY_F11:
		case KEY_F12:  //!!!输入焦点转入菜单
			return;
		default:
			window.alert(kc);
			break;
		}
		return true;
	};
	this.onKeyUp = function(ev, sender){
	};
});
/*</file>*/
/*<file name="alz/mui/Console.js">*/
_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.LineEdit");

/**
 * 控制台组件
 */
_class("Console", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._lines = [];
		//this._lastLine = null;
		this._lineEdit = null;
		this._prompt = ">";
		this._interpret = null;
		this._callback = null;
		this._iomode = "";  //in|out
	};
	//this.build = function(parent, node){_super.build.apply(this, arguments);};
	this.create = function(parent, app){
		this.setParent2(parent);
		this._app = app;
		var obj = this._createElement2(parent, "div", "aui-Console");
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		//<div class="aui-LineEdit">&gt;<input class="input" type="text" value="" /></div>
		//this.setFont("12px 宋体");
		/*
		this._lastLine = this._createElement2("div", "aui-LineEdit", {
			"backgroundColor": "#888888",
			"innerHTML"      : encodeHTML(this._prompt)
		});
		*/
		this._lineEdit = new LineEdit();
		this._lineEdit.create(this, this._app);
		this._self.onclick = function(){
			//this.focus();
			this._ptr.activate();
		};
		this._self.onfocus = function(){
			this._ptr.activate();
		};
		this._self.onblur = function(){
			this._ptr.deactivate();
		};
		if(!runtime.ie){
			var _this = this;
			this.__onkeydown = function(ev){
				return _this._lineEdit.onKeyDown(ev || window.event, _this._lineEdit._self);
			};
			window.document.addEventListener("keydown", this.__onkeydown, false);
		}else{
			this._self.onkeydown = function(ev){
				return this._ptr._lineEdit.onKeyDown(ev || window.event, this._ptr._lineEdit._self);
			};
		}
		//this._lastLine = this._lineEdit._self;
		this._lineEdit.setIomode("out");
	};
	this.dispose = function(){
		this._interpret = null;
		if(this._lineEdit){
			this._lineEdit.dispose();
			this._lineEdit = null;
		}
		//this._lastLine = null;
		for(var i = 0, len = this._lines.length; i < len; i++){
			this._lines[i] = null;
		}
		this._lines = [];
		this._app = null;
		if(!runtime.ie){
			window.document.removeEventListener("keydown", this.__onkeydown, false);
		}else{
			this._self.onkeydown = null;
		}
		this._self.onblur = null;
		this._self.onfocus = null;
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resize = function(w, h){
		//this._lineEdit.setWidth(this._input.parentNode.offsetWidth) + "px";
		//this.print(this._self.clientWidth, "dbg");
		//var w = window.document.body.clientWidth - 14 - 100;
		//this._self.style.width = (window.document.body.clientWidth - 14) + "px";
		w = this._self.clientWidth - 14 - 8 - 20;
		this._lineEdit.setWidth(w);
	};
	this.activate = function(){
		this._lineEdit.setCursorType("");
		this._lineEdit.setFocus();
	};
	this.deactivate = function(){
		this._lineEdit.setCursorType("gray");
		this._lineEdit.setFocus();
	};
	this.getPrompt = function(){
		return this._prompt;
	};
	this.setInterpret = function(v){
		this._interpret = v;
		this.print(this._interpret.getWelcomeMessage(), "sys");
		this._prompt = this._interpret.getPrompt();
		//this.print(this._interpret.getPrompt(), "sys");
	};
	//默认的解释器接口
	this.interpret = function(text){
		this.print(text);
	};
	this.showPrompt = function(v){
		if(v){  //show
			this.start(this, function(text){
				this.interpret(text);
			});
		}else{  //hide
			//this._parent._self.focus();
			//this._lastLine.removeChild(this._lineEdit._self);
			//this._lastLine.removeChild(this._lastLine.lastChild);
		}
	};
	this.start = function(agent, fun){
		var _this = this;
		this.getLineInput(function(text){
			fun.call(agent, text);
			_this.getLineInput(arguments.callee);
		});
	};
	this.getLineInput = function(callback){
		if(callback){
			this._callback = callback;
		}
		this.resize();
		this._lineEdit.reset();
	};
	this.getLineEdit = function(){
		return this._lineEdit;
	};
	this.getCallback = function(){
		return this._callback;
	};
	this.insertBlankLine = function(){
		var line = this._createElement2(this._self, "div", "aui-LineEdit");
		this._lines.push(line);
		return line;
	};
	this.insertLine = function(text, refNode, type){
		var line = this._createElement("div");
		line.className = "aui-LineEdit";
		if(text){
			//line.innerHTML = runtime.encodeHTML(text);
			var span = this._createElement2(line, "span", type);
			span.appendChild(this._createTextNode(text));
			span = null;
		}
		if(refNode){
			this._self.insertBefore(line, refNode);
		}else{
			this._self.appendChild(line);
		}
		this._lines.push(line);
		return line;
	};
	/**
	 * 往shell文本屏幕上打印一段文本
	 * @param {String} str 要打印的文件内容
	 * @param {String} type 文本的类型
	 */
	this.print = function(str, type){
		type = type || "sys";
		if(typeof str != "string"){
			str = "" + str;
		}
		this._lineEdit.print(str, type);
	};
	//[TODO]XUL环境下不起作用
	this.scrollToBottom = function(){
		this._self.scrollTop = this._self.scrollHeight;
	};
});
/*</file>*/
/*<file name="alz/mui/BitButton.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 带图标的按钮组件
 */
_class("BitButton", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._icon = "";
		this._disabled = false;
		this._app = null;
	};
	this.init = function(obj, app){
		this._app = app;
		_super.init.apply(this, arguments);
		this._label = this._self.childNodes[1];
		this.setDisabled(this._self.getAttribute("_disabled") == "true");
		this._icon = this._self.getAttribute("_icon") || "";
		if(this._icon != ""){
			this._self.style.background = "url(" + this._self.getAttribute("_icon") + ") 2px 2px no-repeat";
		}
		this._tip = this._self.getAttribute("_tip") || "";
		if(this._tip != ""){
			this._self.title = this._tip;
		}
		this.addEventGroupListener("mouseevent", {
			mouseover: function(ev){
				this._self.style.borderLeft = "1px solid buttonhighlight";
				this._self.style.borderTop = "1px solid buttonhighlight";
				this._self.style.borderRight = "1px solid buttonshadow";
				this._self.style.borderBottom = "1px solid buttonshadow";
			},
			mouseout: function(ev){
				var target = ev.target || ev.toElement;
				if(!this._dom.contains(this._self, target)){
					this._self.style.border = "1px solid buttonface";
				}
			},
			mousedown: function(ev){
				this._self.style.borderLeft = "1px solid buttonshadow";
				this._self.style.borderTop = "1px solid buttonshadow";
				this._self.style.borderRight = "1px solid buttonhighlight";
				this._self.style.borderBottom = "1px solid buttonhighlight";
				var sender = ev.target || ev.srcElement;
				this._app.doAction(sender.getAttribute("_action"), sender);
			},
			mouseup: function(ev){
				this._self.style.borderLeft = "1px solid buttonhighlight";
				this._self.style.borderTop = "1px solid buttonhighlight";
				this._self.style.borderRight = "1px solid buttonshadow";
				this._self.style.borderBottom = "1px solid buttonshadow";
			}/*,
			click: function(ev){
				var sender = ev.target || ev.srcElement;
				this._app.doAction(sender.getAttribute("_action"), sender);
			}*/
		});
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._app = null;
		this._label = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setDisabled = function(v){
		_super.setDisabled.apply(this, arguments);
		this.setEnableEvent(!v);
		if(!this._disabled){
			if(v){
				this._self.style.filter = "gray";
				this._label.disabled = true;
			}else{
				this._self.style.filter = "";
				this._label.disabled = false;
			}
		}
	};
});
/*</file>*/
/*<file name="alz/mui/ToggleButton.js">*/
_package("alz.mui");

_import("alz.mui.BitButton");

_class("ToggleButton", BitButton, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._groupid = "";
		this._toggled = false;
	};
	this.init = function(obj, app){
		_super.init.apply(this, arguments);
		this._groupid = this._self.getAttribute("_groupid");
		if(!this._groupid) throw "ToggleButton 组件缺少 _groupid 属性";
		runtime.toggleMgr.add(this);
		this.removeEventGroupListener("mouseevent");  //[TODO]
		this.addEventGroupListener("mouseevent", {
			mouseover: function(ev){
				if(this._toggled) return;
				this._self.style.borderLeft = "1px solid buttonhighlight";
				this._self.style.borderTop = "1px solid buttonhighlight";
				this._self.style.borderRight = "1px solid buttonshadow";
				this._self.style.borderBottom = "1px solid buttonshadow";
			},
			mouseout: function(ev){
				if(this._toggled) return;
				var target = ev.target || ev.toElement;
				if(!this._dom.contains(this._self, target)){
					this._self.style.border = "1px solid buttonface";
				}
			},
			click: function(ev){
				runtime.toggleMgr.toggle(this);
			}
		});
		if(this._self.getAttribute("_toggled") == "true"){
			runtime.toggleMgr.toggle(this);
		}
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setToggled = function(v){
		if(this._toggled == v) return;
		this._toggled = v;
		if(v){
			this._self.style.borderLeft = "1px solid buttonshadow";
			this._self.style.borderTop = "1px solid buttonshadow";
			this._self.style.borderRight = "1px solid buttonhighlight";
			this._self.style.borderBottom = "1px solid buttonhighlight";
			this._app.doAction(this._self.getAttribute("_action"));
		}else{
			this._self.style.border = "1px solid buttonface";
		}
	};
});
/*</file>*/
/*<file name="alz/mui/ToolBar.js">*/
_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.BitButton");
_import("alz.mui.ToggleButton");

/**
 * 工具栏组件
 */
_class("ToolBar", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._buttons = [];
	};
	this.init = function(obj, app){
		this._app = app;
		//_super.init.apply(this, arguments);
		//var nodes = this._self.childNodes;
		var nodes = obj.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			if(nodes[i].nodeType != 1) continue;
			var btn;
			switch(nodes[i].className){
			case "wui-BitButton"   : btn = new BitButton();break;
			case "wui-ToggleButton": btn = new ToggleButton();break;
			}
			if(btn){
				btn.init(nodes[i], this._app);  //[TODO]改用bind实现
				this._buttons.push(btn);
			}
			btn = null;
		}
		nodes = null;
	};
	this.dispose = function(){
		for(var i = 0, len = this._buttons.length; i < len; i++){
			this._buttons[i].dispose();
			this._buttons[i] = null;
		}
		this._buttons = [];
		this._app = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});
/*</file>*/
/*<file name="alz/mui/ModalPanel.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 模态对话框使用的遮挡面板组件
 */
_class("ModalPanel", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._targetList = [];
		this._activeTarget = null;
		this._iframe = null;  //用来遮挡SELECT等DIV遮挡不住的组件
		this._panel = null;   //再用这个DIV遮挡在IFRAME上面
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._self.className = "wui-ModalPanel";
		this.moveTo(0, 0);
		this.setOpacity(0.2);
		if(runtime.ie){
			this._iframe = this._createElement("iframe");
			this._iframe.setAttribute("scrolling", "no");
			this._iframe.setAttribute("frameBorder", "0");
			this._iframe.setAttribute("frameSpacing", "0");
			//this._iframe.setAttribute("allowTransparency", "true");
			this._iframe.style.display = "none";
			this._iframe.style.width = "100%";
			this._iframe.style.height = "100%";
			this._iframe.src = "about:blank";
			this._self.appendChild(this._iframe);
		}
		this._panel = this._createElement("div");
		this._panel.style.display = "none";
		this._panel.style.position = "absolute";
		this._panel.style.left = "0px";
		this._panel.style.top = "0px";
		this._self.appendChild(this._panel);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._panel = null;
		this._iframe = null;
		this._activeTarget = null;
		for(var i = 0, len = this._targetList.length; i < len; i++){
			this._targetList[i] = null;
		}
		this._targetList = [];
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setVisible = function(v){
		_super.setVisible.apply(this, arguments);
		if(this._iframe){
			this._iframe.style.display = v ? "" : "none";
		}
		this._panel.style.display = v ? "" : "none";
		if(this._visible){  //如果面板已经显示
			//this.getActiveTarget().setVisible(false);
		}else{
		}
	};
	this.resize = function(w, h){
		_super.resize.apply(this, arguments);
		this._panel.style.width = w + "px";
		this._panel.style.height = h + "px";
	};
	this.pushTarget = function(v){
		this._activeTarget = v;
		this._targetList.push(v);
		var rect = runtime._workspace.getViewPort();
		this.resize(rect.w, rect.h);
		//var screen = runtime.getBody();
		/* 是否需要移动呢？
		var rect = this._parent.getViewPort();
		this.moveTo(rect.x, rect.y);
		*/
		//this.resize(screen.clientWidth, screen.clientHeight);
		//this.resize(
		//	Math.max(screen.scrollWidth, screen.clientWidth),
		//	Math.max(screen.scrollHeight, screen.clientHeight)
		//);
		//screen = null;
		this.setVisible(true);  //!!v
		this.setZIndex(runtime.getNextZIndex());
	};
	this.popTarget = function(v){
		this._targetList.pop();
		this._activeTarget = this._targetList[this._targetList.length - 1];
		if(this._targetList.length == 0){
			this.setVisible(false);
		}else{
			this.getActiveTarget().setZIndex(runtime.getNextZIndex());
		}
	};
	this.getActiveTarget = function(){
		return this._activeTarget;  //this._targetList[this._targetList.length - 1];
	};
});
/*</file>*/
/*<file name="alz/mui/Container.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 凡是具有_layout,_align属性的元素全部是该类或子类的实例
 */
_class("Container", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._nodes = [];
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i].dispose();
			this._nodes[i] = null;
		}
		this._nodes = [];
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resize = function(w, h){
		_super.resize.apply(this, arguments);
		this.updateDock();
	};
	this.add = function(component){
		this._nodes.push(component);
	};
	/**
	 * 会被 DockPanel 组件重载，以实现特殊的布局定义
	 */
	this.getDockRect = function(){
		return {
			"x": 0,
			"y": 0,
			"w": this.getInnerWidth(),
			"h": this.getInnerHeight()
		};
	};
	/**
	 * 按照停靠的优先顺序：1)上下；2)左右；3)居中，更新停靠组件的位置信息
	 */
	this.updateDock = function(){
		var rect = this.getDockRect();
		var nodes = this._nodes;
		//调整上停靠的组件
		for(var i = 0, len = nodes.length; i < len; i++){
			var obj = nodes[i];
			switch(obj.getAlign()){
			case "top":
				obj.moveTo(rect.x, rect.y);
				obj.resize(rect.w, obj._dockRect.h);
				rect.y += obj._dockRect.h;
				rect.h -= obj._dockRect.h;
				break;
			}
		}
		//调整下停靠的组件
		for(var i = nodes.length - 1; i >= 0; i--){
			var obj = nodes[i];
			switch(obj.getAlign()){
			case "bottom":
				obj.moveTo(rect.x, rect.y + rect.h - obj._dockRect.h);
				obj.resize(rect.w, obj._dockRect.h);
				rect.h -= obj._dockRect.h;
				break;
			}
		}
		//调整左停靠的组件
		for(var i = 0, len = nodes.length; i < len; i++){
			var obj = nodes[i];
			switch(obj.getAlign()){
			case "left":
				obj.moveTo(rect.x, rect.y);
				obj.resize(obj._dockRect.w, rect.h);  //"100%"
				rect.x += obj._dockRect.w;
				rect.w -= obj._dockRect.w;
				break;
			}
		}
		//调整右停靠的组件
		for(var i = nodes.length - 1; i >= 0; i--){
			var obj = nodes[i];
			switch(obj.getAlign()){
			case "right":
				obj.moveTo(rect.x + rect.w - obj._dockRect.w, rect.y);
				obj.resize(obj._dockRect.w, rect.h);  //"100%"
				rect.w -= obj._dockRect.w;
				break;
			}
		}
		//调整居中停靠的组件
		for(var i = 0, len = nodes.length; i < len; i++){
			var obj = nodes[i];
			switch(obj.getAlign()){
			case "client":
				//最后调整align == "client"的组件的大小
				obj.moveTo(rect.x, rect.y);
				obj.resize(rect.w, rect.h);
				break;
			}
		}
		nodes = null;
	};
});
/*</file>*/
/*<file name="alz/mui/Panel.js">*/
_package("alz.mui");

_import("alz.mui.Container");

/**
 * 面板组件，支持布局自适应特性的面板
 */
_class("Panel", Container, function(_super){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});
/*</file>*/
/*<file name="alz/mui/Pane.js">*/
_package("alz.mui");

_import("alz.mui.Container");
//_import("alz.action.ActionElement");
_import("alz.action.FormElement");
_import("alz.action.LinkLabel");
_import("alz.action.ComboBox");
//_import("alz.action.TextField");
_import("alz.action.Button");
_import("alz.action.CheckBox");

_class("Pane", Container, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._components = [];
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._components.length; i < len; i++){
			this._components[i].dispose();
			this._components[i] = null;
		}
		this._components = [];
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * 初始化组件中的 Action 动作组件
	 * 支持的 Action 动作组件有：
	 *   表单  ： FORM
	 *   超链接： A
	 *   按钮  ： INPUT(type=button)
	 *   复选框： INPUT(type=checkbox)
	 *   列表框： SELECT
	 */
	this.initComponents = function(element){
		var tags = ["form", "a", "select", "input"];
		for(var i = 0, len = tags.length; i < len; i++){
			var nodes = element.getElementsByTagName(tags[i]);
			for(var j = 0, len1 = nodes.length; j < len1; j++){
				var node = nodes[j];
				if(node.getAttribute("_action")){
					var component;
					switch(tags[i]){
					case "form":
						component = new FormElement();
						break;
					case "a":
						component = new LinkLabel();
						break;
					case "select":
						component = new ComboBox();
						break;
					case "input":
						switch(node.type){
						//case "text":
						case "button":
							component = new Button();
							break;
						case "checkbox":
							component = new CheckBox();
							break;
						default:
							continue;
						}
						//application._buttons[btn._action] = btn;
						break;
					//default:
					//	break;
					}
					component.init(node);
					//application._actionManager.add(component);
					this._components.push(component);
				}
				node = null;
			}
			nodes = null;
		}
	};
	/**
	 * Action 工作模型
	 * [TODO]
	 * 1)级联激发的 Action 动作只把最初的动作压入动作栈，这样能够保证正确的动作回
	 *   退机制。
	 */
	this.doAction = function(action){
	};
});
/*</file>*/
/*<file name="alz/mui/Workspace.js">*/
_package("alz.mui");

_import("alz.mui.Container");
_import("alz.mui.ModalPanel");

_class("Workspace", Container, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._fixedX = 0;
		this._fixedY = 0;
		this._fixedOff = null;
		this._fixed = null;
		this._testFixDiv = null;
		this._modalPanel = null;
		this._popup = null;
		this._captureComponent = null;
		this._tipMouse = null;
		this._activeDialog = null;
	};
	this.__init = function(obj, domBuildType){
		_super.__init.apply(this, arguments);
		this.onMouseMove = this._mousemoveForNormal;
		//this.onMouseMove = this._mousemoveForFixed;
		//this._self.ondragstart = function(ev){return false;};
		//this._self.onselectstart = function(ev){return false;};
		this._modalPanel = new ModalPanel();
		this._modalPanel.create(this);
		this._modalPanel.setVisible(false);
		/*
		var rect = this.getViewPort();
		//window.alert(rect.x + "," + rect.y + "," + rect.w + "," + rect.h);
		this._testFixDiv = this._createElement2(this._self, "div", "", {
			"position"       : "absolute",
			"border"         : "10px",
			"left"           : (rect.x - 10) + "px",
			"top"            : (rect.y - 10) + "px",
			"width"          : (rect.w + 20) + "px",
			"height"         : (rect.h + 20) + "px",
			"backgroundColor": "#DDDDDD",
			"zIndex"         : "200"  // + runtime.getNextZIndex()
		});
		var _this = this;
		var d = this._createElement2(this._testFixDiv, "div", "", {
			"width"          : "100%",
			"height"         : "100px",
			"backgroundColor": "#AAAAAA",
			"onmousedown"    : function(ev){return _this._mousemoveForFixed(ev || runtime.getWindow().event);}
		});
		this.onMouseDown = this._mousemoveForFixed;
		*/
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		//在这里绑定工作区所有可能用到的事件
		//……
		/*
		runtime.addEventListener(this._self, "resize", function(ev){
			window.alert();
		});
		*/
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activeDialog = null;
		this._tipMouse = null;
		this._captureComponent = null;
		this._popup = null;
		if(this._modalPanel){
			this._modalPanel.dispose();
			this._modalPanel = null;  //模态对话框用的模态面板
		}
		this._testFixDiv = null;
		//this._self.onselectstart = null;
		//this._self.ondragstart = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setStyleProperty = function(name, value){
		if(this._self.tagName == "BODY" && (name == "width" || name == "height")){
			return;  //忽略对 style 属性 width,height 的设置
		}
		_super.setStyleProperty.apply(this, arguments);
	};
	this.resize = function(w, h){
		_super.resize.call(this, w, h);
		if(this._modalPanel && this._modalPanel.getVisible()){
			this._modalPanel.resize(w, h);  //调整模态面板的大小
		}
	};
	this.getModalPanel = function(){
		return this._modalPanel;
	};
	this.setPopup = function(v, pos){
		try{
		if(v){
			if(this._popup){
				this._popup.setVisible(false);
				//this._popup.setZIndex(1);
				this._popup = null;
			}
			this._popup = v;
			this._popup.setZIndex(10);
			this._popup.setVisible(true);
			this._popup.moveTo(pos.x, pos.y);
		}else{  //还原蒙板
			this._popup.setVisible(false);
			//this._popup.setZIndex(1);
			this._popup = null;
		}
		}catch(ex){
			this._win._alert(ex.description);
		}
	};
	this.setCaptureComponent = function(v){
		this._captureComponent = v;
	};
	this.setActiveDialog = function(v){
		this._activeDialog = v;
	};
	this.eventHandle = function(ev){
		var ret;
		var type = {
			"keydown"  : "KeyDown",
			"keypress" : "KeyPress",
			"keyup"    : "KeyUp",
			"mousedown": "MouseDown",
			"mousemove": "MouseMove",
			"mouseup"  : "MouseUp"
		};
		var evtype = "on" + type[ev.type];
		if(this._captureComponent && this._captureComponent[evtype]){
			this.onMouseMove(ev);
			return this._captureComponent[evtype](ev);
		}
		if(typeof this[evtype] == "function"){
			ret = this[evtype](ev);
		}
		return ret;
	};
	this.onKeyUp = function(ev){
		var ret;
		if(this._activeDialog && this._activeDialog.onKeyUp){
			ret = this._activeDialog.onKeyUp(ev);
		}
		return ret;
	};
	this.onMouseDown = function(ev){
		if(this._popup){
			switch(this._popup._className){
			case "Popup":
				if(this._popup.getVisible()){
					this.setPopup(null);
				}
				break;
			case "Dialog":
				break;
			}
		}
	};
	this.onMouseMove = null;
	this.onMouseUp = function(ev){
	};
	/**
	 * 偏移量的修正依赖于 getPos 方法的正确性，如果本身计算就不正确，修正结果也将不对
	 * [TODO]在第一次onMouseMove事件中执行修正偏移量的计算
	 */
	/*
	this._mousemoveForFixed = function(ev){
		var obj = runtime._testDiv;
		var pos = this._dom.getPos(obj, this._self);
		if(this._fixed == null){
			//window.alert((pos.x + ev.offsetX) + "," + (pos.y + ev.offsetY) + "|" + ev.clientX + "," + ev.clientY);
			this._offsetX = ev.offsetX;
			this._offsetY = ev.offsetY;
			this._fixedOff = {x: pos.x + ev.offsetX, y: pos.y + ev.offsetY};
			this._fixed = "fixing";
			//this.onMouseMove(ev);
			var rect = this.getViewPort();
			var x = rect.x + Math.min(rect.w - this._paddingLeft, Math.max(0, ev.clientX - this._borderLeftWidth)) - this._fixedX - this._offsetX - this._paddingLeft;
			var y = rect.y + Math.min(rect.h - this._paddingTop, Math.max(0, ev.clientY - this._borderTopWidth)) - this._fixedY - this._offsetY - this._paddingTop;
			obj.style.left = (-2000 + x) + "px";
			obj.style.top = (-2000 + y) + "px";
			this._mousemoveForFixed(ev);
		}else if(this._fixed == "fixing"){
			//this._fixedOff = {x: ev.clientX, y: ev.clientY};
			this._fixedX = pos.x + ev.offsetX - this._fixedOff.x;
			this._fixedY = pos.y + ev.offsetY - this._fixedOff.y;
			//window.alert("&&&&" + this._fixedX + "," + this._fixedY);
			this._fixed = "fixed";
			this.onMouseMove = this._mousemoveForNormal;  //转换成正常的事件
		}else{  //fixed
			ev.cancelBubble = true;
		}
		obj = null;
	};
	*/
	this._mousemoveForFixed = function(dlg, ev){
		var obj = ev.srcElement;
		var pos = dlg._dom.getPos(obj, this._self);
		if(this._fixed == null){
			//window.alert((pos.x + ev.offsetX) + "," + (pos.y + ev.offsetY) + "|" + ev.clientX + "," + ev.clientY);
			this._fixedOff = {
				pos_x: pos.x,
				pos_y: pos.y,
				o: ev.srcElement,
				ev_offsetX: ev.offsetX,
				ev_offsetY: ev.offsetY,
				x: pos.x + ev.offsetX,
				y: pos.y + ev.offsetY
			};
			this._fixed = "fixing";
			dlg.onMouseMove(ev);
		}else if(this._fixed == "fixing"){
			if(ev.srcElement != this._fixedOff.o || ev.offsetX != this._fixedOff.ev_offsetX || ev.offsetY != this._fixedOff.ev_offsetY){
				window.alert("[Workspace::_mousemoveForFixed]fixing unexpect");
			}
			this._fixedX = pos.x - this._fixedOff.pos_x;  //pos.x + ev.offsetX - (this._fixedOff.pos_x + this._fixedOff.ev_offsetX)
			this._fixedY = pos.y - this._fixedOff.pos_y;  //pos.y + ev.offsetY - (this._fixedOff.pos_y + this._fixedOff.ev_offsetY)
			//window.document.title = this._fixedX + "," + this._fixedY + "|" + dlg._borderLeftWidth + "," + dlg._borderTopWidth;
			this._fixed = "fixed";
			dlg.onMouseMove(ev);
			this._mousemoveForFixed = null;
		}
		obj = null;
	};
	this._mousemoveForNormal = function(ev){
		if(runtime._debug){  //如果调试状态的话，更新 MouseEvent 的信息
			if(!this._tipMouse){
				this._tipMouse = this._createElement2(this._self, !runtime.ns ? "div" : "textarea", "", {  //NS 有性能问题，改用 textarea
					"position"       : "absolute",
					"border"         : "1px solid #AAAAAA",
					"font"           : "12px 宋体",
					"zIndex"         : "1000"/*,
					"backgroundColor": "buttonface",
					"filter"         : "Alpha(Opacity=90)"*/
				});
				if(runtime.ns){
					this._tipMouse.readOnly = true;
					this._tipMouse.style.width = "150px";
					this._tipMouse.style.height = "300px";
				}
			}
			var o = {
				/*
				"type":1,
				"target":1,
				"reason":1,
				"cancelBubble":1,
				"returnValue":1,
				"srcFilter":1,
				"fromElement":1,
				"toElement":1,
				*/
				//mouse event
				"button":1,
				"screenX":1,
				"screenY":1,
				"clientX":1,
				"clientY":1,
				"offsetX":1,
				"offsetY":1,
				"x":1,
				"y":1/*,
				//key event
				"altKey":1,
				"ctrlKey":1,
				"shiftKey":1,
				"keyCode":1
				*/
			};
			//var a = this.forIn(ev);
			var a = [];
			for(var k in o) a.push(k + "=" + ev[k]);
			var off = {x:0,y:0};
			for(var el = ev.srcElement; el; el = el.offsetParent){
				off.x += el.offsetLeft + parseInt0(el.currentStyle.borderLeftWidth);
				off.y += el.offsetTop + parseInt0(el.currentStyle.borderTopWidth);
				a.push("off(x=" + el.offsetLeft + ",y=" + el.offsetTop + "),border(blw=" + parseInt0(el.currentStyle.borderLeftWidth) + ",btw=" + parseInt0(el.currentStyle.borderTopWidth) + ")");
			}
			a.push("OFF(x=" + off.x + ",y=" + off.y + "),OFF+offset(x=" + (off.x + ev.offsetX) + ",y=" + (off.y + ev.offsetY) + ")");
			this._tipMouse.style.left = (ev.clientX - this._borderLeftWidth + 4) + "px";
			this._tipMouse.style.top = (ev.clientY - this._borderTopWidth + 4) + "px";
			if(runtime.ns){
				this._tipMouse.value = a.join("\n");
			}else{
				this._tipMouse.innerHTML = a.join("<br />");
			}
		}
	};
});
/*</file>*/
/*<file name="alz/mui/DropDown.js">*/
_package("alz.mui");

_import("alz.mui.Component");

_class("DropDown", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._drop = null;
	};
	this.bind = function(obj){
		_super.bind.apply(this, arguments);
		this._bindDrop();
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._bindDrop();
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onmousedown = null;
		this._self.onclick = null;
		if(this._drop){
			this._drop.dispose();
			this._drop = null;
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this._bindDrop = function(){
		if(!this._drop){
			var id = this._dropid;  //this._self.getAttribute("dropid")
			if(!id) runtime.getWindow()._alert("组件DropDown缺少属性dropid");
			this._drop = runtime.initComponent(runtime._workspace, id);
			if(!this._drop) throw "未找到DropDown组件的下拉列表[Popup,id=\"" + id + "\"]";
			this._drop.setVisible(false);
			this._self.onmousedown = function(ev){return this._ptr.onMouseDown(ev || this._ptr._win.event);};
			this._self.onclick = function(ev){return false;};
			this._drop._self.onmousedown = function(ev){
				ev = ev || this._ptr._win.event;
				window.alert((ev.srcElement || ev.target).innerHTML);
			};
		}
	};
	this.onMouseDown = function(ev){
		if(this._drop.getVisible()){
			runtime._workspace.setPopup(null);
		}else{
			var pos = this.getPosition(ev, 0);
			pos.y += this.getHeight();
			this._drop.setWidth(Math.max(this.getWidth(), this._drop.getWidth()));
			runtime._workspace.setPopup(this._drop, pos);
		}
		ev.cancelBubble = true;
		return false;
	};
});
/*</file>*/
/*<file name="alz/mui/Popup.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 弹出式组件
 */
_class("Popup", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		/*
		this._self.onmousedown = function(ev){
			ev = ev || this._ptr._win.event;
			ev.cancelBubble = true;
			return false;
		};
		*/
	};
	this.dispose = function(){
		if(this._disposed) return;
		//this._self.onmousedown = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});
/*</file>*/
/*<file name="alz/mui/ListItem.js">*/
_package("alz.mui");

_import("alz.mui.Component");

_class("ListItem", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._icon = null;
		this._label = null;
	};
	this.__init = function(obj, domBuildType){
		_super.__init.apply(this, arguments);
		//window.alert(this._self.firstChild.nodeType);
		this._self.style.verticalAlign = "middle";
		this._self.onselectstart = function(ev){return false;};
		var text = this._self.removeChild(this._self.firstChild);
		var size = runtime.getTextSize(text.data, "12px 宋体");
		this._icon = this._createElement2(this._self, "img", "", {
			"src"           : "skin/Icon_delete.gif",
			"border"        : "0px",
			"width"         : "16px",
			"height"        : "15px",
			"verticalAlign" : "middle"
		});
		this._label = this._createElement2(this._self, "label", "", {
			"backgroundColor": "#CCCCCC",
			"width"          : (size.w + 10) + "px",
		//"height"         : (size.h + 2) + "px",
		//"padding"        : "1px",
			"textAlign"      : "center",
			"lineHeight"     : "100%"
		});
		this._label.appendChild(text);
	};
	//this.bind = function(obj){};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._label = null;
		this._icon = null;
		this._self.onselectstart = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});
/*</file>*/
/*<file name="alz/mui/Dialog.js">*/
_package("alz.mui");

_import("alz.mui.Component");

_class("Dialog", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._skin = null;
		this._head = null;
		this._btnClose = null;
		this._body = null;
		this._borders = null;
	};
	this.create = function(parent, caption){
		this.setParent2(parent);
		this._caption = caption;
		return _super.create.apply(this, arguments);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		//this._skin = this._createElement("div");
		this._self.className = "wui-Dialog2";
		//this._self.appendChild(this._skin);
		//this.setStyleProperty("border", "2px outset");  //runtime.ie ? "2px outset" : "2px solid #97A4B2"
		//this.setStyleProperty("backgroundColor", "buttonface");  //runtime.ie ? "buttonface" : "#B9C4D0"
		if(runtime.ff){
			this.setStyleProperty("MozBorderLeftColors", "ThreeDLightShadow ThreeDHighlight");
			this.setStyleProperty("MozBorderTopColors", "ThreeDLightShadow ThreeDHighlight");
			this.setStyleProperty("MozBorderRightColors", "ThreeDDarkShadow ThreeDShadow");
			this.setStyleProperty("MozBorderBottomColors", "ThreeDDarkShadow ThreeDShadow");
		}
		var str = "<div class=\"skin\"></div>"
			+ "<div class=\"head\" html=\"true\" aui=\"{align:'top',height:18;}\">"
			+ "<label class=\"caption\">{$caption}</label><div class=\"icon\"></div>"
			+ "</div>"
			+ "<div class=\"body\" aui=\"{align:'client'}\"></div>";
		str = str.replace(/\{\$caption\}/g, this._caption);
		str = str.replace(/\{\$pathAui\}/g, runtime.pathAui);
		this._self.innerHTML = str;
		this.bind(obj);
		//this.setOpacity(0.7);
	};
	this.bind = function(obj){
		_super.bind.apply(this, arguments);
		//this.fixedOffset();  //计算坐标修正的偏移量
		var nodes = this._dom.selectNodes(this._self, "*");
		this._skin = nodes[0];
		this._head = nodes[1];
		this._btnClose = this._dom.selectNodes(this._head, "*")[1];
		this._body = nodes[2];
		this._head._dlg = this;
		this._head.onmousedown = function(ev){return this._dlg.onMouseDown(ev || this._dlg._win.event);};
		this._head.onselectstart = function(ev){return false;};
		if(this._btnClose){
			this._btnClose.style.backgroundPosition = "-48px 0px";
			this._btnClose._dlg = this;
			this._btnClose.onselectstart = function(ev){return false;};
			this._btnClose.ondragstart = function(ev){return false;};
			this._btnClose.onmousedown = function(ev){
				ev = ev || this._dlg._win.event;
				//this.src = runtime.pathAui + "lib/images/AWindow_closedown.gif";
				this.style.backgroundPosition = "-48px -14px";
				if(runtime.ie) this.setCapture();
				this.onMouseMove = function(ev){
					ev = ev || this._dlg._win.event;
					var target = ev.srcElement || ev.target;
					if(target == this){
						//this.src = runtime.pathAui + "lib/images/AWindow_closedown.gif";
						this.style.backgroundPosition = "-48px -14px";
					}else{
						//this.src = runtime.pathAui + "lib/images/AWindow_closeup.gif";
						this.style.backgroundPosition = "-48px 0px";
					}
				};
				this.onMouseUp = function(ev){
					ev = ev || this._dlg._win.event;
					var target = ev.srcElement || ev.target;
					//this.src = runtime.pathAui + "lib/images/AWindow_closeup.gif";
					this.style.backgroundPosition = "-48px 0px";
					this.onMouseMove = null;
					this.onMouseUp = null;
					if(runtime.ie){
						this.releaseCapture();
					}
					if(target == this){
						this._dlg.close();  //关闭对话框
					}
				};
				ev.cancelBubble = true;
			};
		}
		this._createBorders();
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._borders){
			for(var i = 0, len = this._borders.length; i < len; i++){
				this._borders[i] = null;
			}
		}
		this._body = null;
		this._btnClose.onmousedown = null;
		this._btnClose.ondragstart = null;
		this._btnClose.onselectstart = null;
		this._btnClose._dlg = null;
		this._btnClose = null;
		this._head.onselectstart = null;
		this._head.onmousedown = null;
		this._head._dlg = null;
		this._head = null;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setApp = function(v){
		this._app = v;
	};
	this.resize = function(w, h){
		//_super.resize.apply(this, arguments);
		this._dom.resizeElement(this._self, w, h);
		var ww = this.getInnerWidth();
		var hh = this.getInnerHeight();
		//this._dom.resize(this._self);
		this._dom.setWidth(this._head, w - 8);
		this._dom.setWidth(this._body, w - 8);
		this._dom.setHeight(this._body, hh - 4 - 19);
		this._dom.resizeElement(this._skin, w, h);
		if(/*this._resizable && */this._borders){
			this._resizeBorder(w, h);
		}
	};
	this.close = function(){
		if(this._modal){
			this.showModal(false);
		}else{
			this.setVisible(false);
		}
	};
	this._createBorders = function(){
		this._borders = [];
		var cursors = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
		for(var i = 0, len = cursors.length; i < len; i++){
			var o = this._createElement2(this._self, "div", "", {
				"position": "absolute",
				"overflow": "hidden",
				"zIndex"  : 3,
				"cursor"  : cursors[i] + "-resize"
			});
			//if(i % 2 == 0) o.style.backgroundColor = "red";
			this._borders.push(o);
			o = null;
		}
	};
	this._resizeBorder = function(w, h){
		var bw4 = 4, bw8 = 8;
		this._setElementRect(this._borders[0], 0    , 0    , bw8    , bw8);
		this._setElementRect(this._borders[1], bw8  , 0    , w-2*bw8, bw4);
		this._setElementRect(this._borders[2], w-bw8, 0    , bw8    , bw8);

		this._setElementRect(this._borders[3], 0    , bw8  , bw4    , h-2*bw8);
		this._setElementRect(this._borders[4], w-bw4, bw8  , bw4    , h-2*bw8);

		this._setElementRect(this._borders[5], 0    , h-bw8, bw8    , bw8);
		this._setElementRect(this._borders[6], bw8  , h-bw4, w-2*bw8, bw4);
		this._setElementRect(this._borders[7], w-bw8, h-bw8, bw8    , bw8);
	};
	this._setElementRect = function(obj, x, y, w, h, bg){
		obj.style.left   = x + "px";
		obj.style.top    = y + "px";
		obj.style.width  = w + "px";
		obj.style.height = h + "px";
	};
	/**
	 * [TODO]TT差出来的这两像素可能是由于 BODY 的默认边框宽度计算不准确导致的
	 */
	/*
	this.fixedOffset = function(){
		//window.alert(runtime.getBoxModel() + "|" + runtime.ie + "|" + runtime.tt + "|" + this._borderLeftWidth);
		if(runtime.getBoxModel() == 0){
			if(runtime.ie){
				this._fixedX = this._borderLeftWidth - (runtime.tt ? 2 : 0);
				this._fixedY = this._borderTopWidth - (runtime.tt ? 2 : 0);
			}else if(runtime.moz){
				this._fixedX = -5;
				this._fixedY = -5;
			}else if(runtime.opera){
				this._fixedX = -5;
				this._fixedY = -5;
			}else{  //safari [TODO]
				this._fixedX = -5;
				this._fixedY = -5;
			}
		}else{
			if(runtime.ie){
				this._fixedX = this._borderLeftWidth - (runtime.tt ? 2 : 0);
				this._fixedY = this._borderTopWidth - (runtime.tt ? 2 : 0);
			}else if(runtime.moz){
				this._fixedX = this._paddingLeft - (runtime.ff ? 5 : 4);
				this._fixedY = this._paddingTop - (runtime.ff ? 5 : 4);
			}else if(runtime.opera){
				this._fixedX = this._paddingLeft + 2;
				this._fixedY = this._paddingTop + 2;
			}else{  //safari
				this._fixedX = this._paddingLeft;
				this._fixedY = this._paddingTop;
			}
		}
	};
	*/
	this.onMouseDown = function(ev){
		//if(runtime.ie) this._head.setCapture();
		//this._head.onmousemove = function(ev){return this._dlg.onMouseMove(ev || this._dlg._win.event);};
		//this._head.onmouseup   = function(ev){return this._dlg.onMouseUp(ev || this._dlg._win.event);};
		this.setCapture(true);
		//var pos = this._dom.getPos(ev.srcElement, this._self);
		//window.document.title = pos.x + "+" + ev.offsetX + "=" + (pos.x + ev.offsetX) + "#" + ev.clientX
		//								+ "|" + pos.y + "+" + ev.offsetY + "=" + (pos.y + ev.offsetY) + "#" + ev.clientY;
		this._offsetX = ev.offsetX;  //ns 浏览器的问题
		this._offsetY = ev.offsetY;
		if(runtime._workspace._fixed != "fixed"){
			if(runtime._workspace._mousemoveForFixed){
				runtime._workspace._mousemoveForFixed(this, ev);
			}
			/* 直接使用默认值，可以省去自动修正过程，但是不能保证一定是通用的
			if(runtime.ie || runtime.safari){
				runtime._workspace._fixedX = 0;
				runtime._workspace._fixedY = 0;
				runtime._workspace._fixed = "fixed";
			}else if(runtime.opera){
				runtime._workspace._fixedX = 2;
				runtime._workspace._fixedY = 2;
				runtime._workspace._fixed = "fixed";
			}else{  //runtime.moz
				if(this._mousemoveForFixed) this._mousemoveForFixed(ev);
			}
			*/
		}
		//this.onMouseMove(ev);
	};
	this.onMouseMove = function(ev){
		var rect = runtime._workspace.getViewPort();
		var x = rect.x + Math.min(rect.w - this._paddingLeft, Math.max(0, ev.clientX - runtime._workspace._borderLeftWidth)) - runtime._workspace._fixedX - this._offsetX - this._paddingLeft;
		var y = rect.y + Math.min(rect.h - this._paddingTop, Math.max(0, ev.clientY - runtime._workspace._borderTopWidth)) - runtime._workspace._fixedY - this._offsetY - this._paddingTop;
		if(runtime.ie || runtime.safari || runtime.chrome || runtime.opera){
			x -= this._borderLeftWidth;
			y -= this._borderTopWidth;
		}else if(runtime.moz){
		}
		/*
		var str = "boxModel=" + runtime.getBoxModel()
			//+ "\nrect={x:" + rect.x + ",y:" + rect.y + ",w:" + rect.w + ",h:" + rect.h + "}"
			+ "\nfixedX=" + runtime._workspace._fixedX + ",_borderLeftWidth=" + this._borderLeftWidth
			+ "\nfixedY=" + runtime._workspace._fixedY + ",_borderTopWidth=" + this._borderTopWidth
			//+ "\nruntime._workspace._borderLeftWidth=" + runtime._workspace._borderLeftWidth
			//+ "\nruntime._workspace._borderTopWidth=" + runtime._workspace._borderTopWidth
			+ "\nthis._offsetX=" + this._offsetX
			+ "\nthis._offsetY=" + this._offsetY
			+ "\nev.clientX=" + ev.clientX + ",x=" + x + ","
			+ "\nev.clientY=" + ev.clientY + ",y=" + y + ",";
		this._body.childNodes[1].value = str;
		*/
		this.moveTo(x, y);
	};
	this.onMouseUp = function(ev){
		this._head.onmousemove = null;
		this._head.onmouseup = null;
		//if(runtime.ie) this._head.releaseCapture();
		this.setCapture(false);
	};
	this.setClientBgColor = function(color){
		this._body.style.backgroundColor = color;
	};
});
/*</file>*/
/*<file name="alz/mui/TabPage.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 选项卡组件
 */
_class("TabPage", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._tabs = [];
		this._activeTab = null;
		this._head = null;
		this._body = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._head = this._createElement2(this._self, "div", "mui-TabPage-Head");
		this._body = this._createElement2(this._self, "div", "mui-TabPage-Body");
		this._body.innerHTML =
				'<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#869FA1"><tbody></tbody></table>'
			+ '<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#869FA1"><tbody></tbody></table>'
			+ '<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#FFCCB4"><tbody></tbody></table>'
			+ '<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#0A0064"><tbody></tbody></table>';
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._body = null;
		this._head = null;
		this._activeTab = null;
		for(var i = 0, len = this._tabs.length; i < len; i++){
			this._tabs[i].onfocus = null;
			this._tabs[i]._parent = this;
			this._tabs[i] = null;
		}
		this._tabs = [];
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resize = function(w, h){
		this._self.style.width = w + "px";
		this._self.style.height = h + "px";
		this._body.style.width = (w - 4) + "px";
		this._body.style.height = (h - 18 - 4) + "px";
		var nodes = this._body.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			nodes[i].style.width = (w - 4 - 16) + "px";
			nodes[i].style.height = (h - 18 - 4) + "px";
		}
		nodes = null;
	};
	this.add = function(text){
		var obj = window.document.createElement("label");
		obj._parent = this;
		obj.tagIndex = this._tabs.length + 1;
		obj.innerHTML = text + "[0]";
		obj.onclick = function(){this._parent.activate(this);};
		this._head.appendChild(obj);
		this._tabs.push(obj);
		this.activate(obj);
	};
	this.activate = function(tab){
		if(this._activeTab != null){
			this._activeTab.className = "";
			this._body.childNodes[this._activeTab.tagIndex - 1].style.display = "none";
		}
		tab.className = "focus";
		this._body.childNodes[tab.tagIndex - 1].style.display = "block";
		this._activeTab = tab;
	};
});
/*</file>*/
/*<file name="alz/mui/WindowSkinWINXP.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/*
	<div class="wui-skin">
		<div class="nw"></div>
		<div class="n"></div>
		<div class="ne"></div>
		<div class="w"></div>
		<div class="e"></div>
		<div class="sw"></div>
		<div class="s"></div>
		<div class="se"></div>
	</div>

一个窗体组件的几种BorderStyle：
	bsDialog
	bsNone
	bsSingle
	bsSizeable
	bsSizeToolWin
	bsToolWindow
*/
_class("WindowSkinWINXP", Component, function(_super){
	this._cssData = {
		"normal":{
			"_title1":{"display":"none"},
			"_title2":{"display":""},
			"_skin3" :{"background-position":"-8px 0px"},
			"_skin4" :{"background-position":"-11px 0px"},
			"_skin5" :{"background-position":"0px -30px"},
			"_skin6" :{"background-position":"0px 0px"},
			"_skin7" :{"background-position":"-10px -30px"}
		},
		"resizable":{
			"_title1":{"display":""},
			"_title2":{"display":"none"},
			"_skin3" :{"background-position":"0px 0px"},
			"_skin4" :{"background-position":"-4px 0px"},
			"_skin5" :{"background-position":"0px -33px"},
			"_skin6" :{"background-position":"0px -3px"},
			"_skin7" :{"background-position":"-9px -33px"}
		}
	};
	this._cssHash = {
		"_minbtn":{
			"normal"  :{"background-position":"0px 0px"},
			"active"  :{"background-position":"0px -21px"},
			"disabled":{"background-position":"0px -42px"}
		},
		"_maxbtn":{
			"normal"  :{"background-position":"-42px 0px"},
			"active"  :{"background-position":"-42px -21px"},
			"disabled":{"background-position":"-42px -42px"}
		},
		"_closebtn":{
			"normal"  :{"background-position":"-63px 0px"},
			"active"  :{"background-position":"-63px -21px"},
			"disabled":{"background-position":"-63px -42px"}
		}
	};
	this._init = function(){
		_super._init.call(this);
		//this._skins = null;
		this._title = null;
		this._title1 = null;
		this._title2 = null;
		this._width = 0;
		this._height = 0;
		this._model = {
			"min_width"  : 123,
			"min_height" : 34,
			"head_height": 30,
			"sbtn_width" : 21,
			"sbtn_height" : 21,
			"icon_width" : 16,
			"sep_num"    : 7,
			"top_use_opacity": true  //顶部上调区域是否需要使用透明度，受标题栏IMG标签影响
		};
	};
	this.create = function(parent){
		this.setParent2(parent);
		if(parent){
			for(var k in this._cssHash){
				this._parent[k]._cssData = this._cssHash[k];
			}
		}
		var obj = this._createElement2(parent ? parent._self : null, "div", "wui-skin");
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._xpath = ".mui-Window-winxp";
		//this._skins = [];
		for(var i = 0, len = this._cursors.length; i < len; i++){
			var o = this._createElement2(this._self, "div", this._cursors[i]/*, {
				"position"       : "absolute",
				"overflow"       : "hidden",
				"backgroundColor": "#000000",
				"filter"         : "Alpha(Opacity=20)",
				"zIndex"         : 10,
				"cursor"         : this._cursors[i] + "-resize"
			}*/);
			//this._skins.push(o);
			this._ee["_skin" + i] = o;
			o = null;
		}
		this._ee["_title1"] =
		this._title =
		this._title1 = this._createElement("img");
		this._ee["_title2"] =
		this._title2 = this._createElement("img");
		this._self.appendChild(this._title1);
		this._self.appendChild(this._title2);
		this._title1.src = runtime.getConfigData("pathimg") + "win-xp-title-bg1.gif";
		this._title2.src = runtime.getConfigData("pathimg") + "win-xp-title-bg2.gif";
		this._title1._dlg = this;
		this._title2._dlg = this;
		this._title1.ondragstart = function(){return false;};
		this._title2.ondragstart = function(){return false;};
		this._title1.onmousedown =
		this._title2.onmousedown = function(ev){
			this._dlg._parent.onMouseDown(ev || window.event);
		};
		this.setState("resizable");
		//runtime.dom.applyCssStyle(this, _cssName, "resizable");
	};
	this.dispose = function(){
		this._title = null;
		this._title1.onmousedown = null;
		this._title2.onmousedown = null;
		this._title1.ondragstart = null;
		this._title2.ondragstart = null;
		this._title1._dlg = null;
		this._title2._dlg = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resize = function(w, h){
		//if(_super.resize.apply(this, arguments)) return true;
		_super.resize.apply(this, arguments);
		if(this._parent.getResizable()){
			var w1 =  7;  //顶宽
			var w2 =  4;  //中宽
			var w3 =  5;  //底宽
			var h1 = 30;  //顶高
			var h3 =  4;  //底高
		}else{
			var w1 =  7;  //顶宽
			var w2 =  3;  //中宽
			var w3 =  4;  //底宽
			var h1 = 29;  //顶高
			var h3 =  3;  //底高
		}
		this.setElementRect(this._ee["_skin0"],    0 ,    0 ,     w1 ,      h1);
		this.setElementRect(this._ee["_skin1"],   w1 ,    0 , w-2*w1 ,      h1);
		this.setElementRect(this._title       ,   w1 ,    0 , w-2*w1 ,      h1);
		this.setElementRect(this._ee["_skin2"], w-w1 ,    0 ,     w1 ,      h1);

		this.setElementRect(this._ee["_skin3"],    0 ,   h1 ,     w2 , h-h1-h3);
		this.setElementRect(this._ee["_skin4"], w-w2 ,   h1 ,     w2 , h-h1-h3);

		this.setElementRect(this._ee["_skin5"],    0 , h-h3 ,     w3 ,      h3);
		this.setElementRect(this._ee["_skin6"],   w3 , h-h3 , w-2*w3 ,      h3);
		this.setElementRect(this._ee["_skin7"], w-w3 , h-h3 ,     w3 ,      h3);
	};
	this.onResizableChange = function(){
		if(this._parent.getResizable()){
			this.setState("resizable");
			this._title = this._title1;
		}else{
			this.setState("normal");
			this._title = this._title2;
		}
		this.resize(this._width, this._height);
	};
});
/*</file>*/
/*<file name="alz/mui/WindowSkinWIN2K.js">*/
_package("alz.mui");

_import("alz.mui.Component");

_class("WindowSkinWIN2K", Component, function(_super){
	this._cssData = {
		"resizable":{
			"_skin1" :{"background-position":"0px -10px"},
			"_skin2" :{"background-position":"-10px 0px"},
			"_skin3" :{"background-position":"0px 0px"},
			"_skin4" :{"background-position":"-4px 0px"},
			"_skin5" :{"background-position":"0px -33px"},
			"_skin6" :{"background-position":"0px -3px"},
			"_skin7" :{"background-position":"-9px -33px"}
		},
		"normal":{
			"_skin1" :{"background-position":"0px -7px"},
			"_skin2" :{"background-position":"-11px 0px"},
			"_skin3" :{"background-position":"-8px 0px"},
			"_skin4" :{"background-position":"-11px 0px"},
			"_skin5" :{"background-position":"0px -30px"},
			"_skin6" :{"background-position":"0px 0px"},
			"_skin7" :{"background-position":"-10px -30px"}
		}
	};
	this._cssHash = {
		"_minbtn": {
			"normal"  :{"background-position":"0px 0px"},
			"active"  :{"background-position":"0px -14px"},
			"disabled":{"background-position":"0px -28px"}
		},
		"_maxbtn":{
			"normal"  :{"background-position":"-32px 0px"},
			"active"  :{"background-position":"-32px -14px"},
			"disabled":{"background-position":"-32px -28px"}
		},
		"_closebtn":{
			"normal"  :{"background-position":"-48px 0px"},
			"active"  :{"background-position":"-48px -14px"},
			"disabled":{"background-position":"-48px -28px"}
		}
	};
	this._init = function(){
		_super._init.call(this);
		this._title = null;
		this._width = 0;
		this._height = 0;
		this._model = {
			"min_width"  : 112,
			"min_height" : 27,
			"head_height": 23,
			"sbtn_width" : 16,
			"sbtn_height": 14,
			"icon_width" : 16,
			"sep_num"    : 5,
			"top_use_opacity": false  //顶部上调区域是否需要使用透明度，受标题栏IMG标签影响
		};
	};
	this.create = function(parent){
		this.setParent2(parent);
		if(parent){
			for(var k in this._cssHash){
				this._parent[k]._cssData = this._cssHash[k];
			}
		}
		var obj = this._createElement2(parent ? parent._self : null, "div", "wui-skin");
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._xpath = ".mui-Window-win2k";
		for(var i = 0, len = this._cursors.length; i < len; i++){
			var o = this._createElement2(this._self, "div", this._cursors[i]/*, {
				"position"       : "absolute",
				"overflow"       : "hidden",
				"backgroundColor": "#000000",
				"filter"         : "Alpha(Opacity=20)",
				"zIndex"         : 10,
				"cursor"         : this._cursors[i] + "-resize"
			}*/);
			this._ee["_skin" + i] = o;
		}
		this._title = this._createElement2(this._self, "img", "", {
			"src"        : runtime.getConfigData("pathimg") + "win-2k-title-bg.gif",
			"ondragstart": function(){return false;},
			"onmousedown": function(ev){this._dlg._parent.onMouseDown(ev || window.event);}
		});
		this._title._dlg = this;
		//runtime.dom.applyCssStyle(this, _cssName, "resizable");
		this.setState("resizable");
	};
	this.dispose = function(){
		this._title.onmousedown = null;
		this._title.ondragstart = null;
		this._title._dlg = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resize = function(w, h){
		//if(_super.resize.apply(this, arguments)) return true;
		_super.resize.apply(this, arguments);
		if(this._parent.getResizable()){
			var w1 =  4;  //顶宽
			var w2 =  4;  //中宽
			var w3 =  5;  //底宽
			var h0 =  4   //顶高
			var h1 = 23;  //顶高
			var h3 =  4;  //底高
		}else{
			var w1 =  3;  //顶宽
			var w2 =  3;  //中宽
			var w3 =  4;  //底宽
			var h0 =  3   //顶高
			var h1 = 22;  //顶高
			var h3 =  3;  //底高
		}
		this.setElementRect(this._ee["_skin0"],    0 ,    0 ,     w1 ,      h1);
		this.setElementRect(this._ee["_skin1"],   w1 ,    0 , w-2*w1 ,      h0);
		this.setElementRect(this._title       ,   w1 ,   h0 , w-2*w1 , h1-h0-1);
		this.setElementRect(this._ee["_skin2"], w-w1 ,    0 ,     w1 ,      h1);

		this.setElementRect(this._ee["_skin3"],    0 ,   h1 ,     w2 , h-h1-h3);
		this.setElementRect(this._ee["_skin4"], w-w2 ,   h1 ,     w2 , h-h1-h3);

		this.setElementRect(this._ee["_skin5"],    0 , h-h3 ,     w3 ,      h3);
		this.setElementRect(this._ee["_skin6"],   w3 , h-h3 , w-2*w3 ,      h3);
		this.setElementRect(this._ee["_skin7"], w-w3 , h-h3 ,     w3 ,      h3);
	};
	this.onResizableChange = function(){
		//runtime.dom.applyCssStyle(this, _cssName, this._parent.getResizable() ? "resizable" : "normal");
		this.setState(this._parent.getResizable() ? "resizable" : "normal");
		this.resize(this._width, this._height);
	};
});
/*</file>*/
/*<file name="alz/mui/SysBtn.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 窗体组件上的系统按钮组件
 */
_class("SysBtn", Component, function(_super){
	//#_interface("IActionSource");
	this._init = function(){
		_super._init.call(this);
		this._win = null;
	};
	this.init = function(obj, win, css){
		_super.init.apply(this, arguments);
		this._win = win;
		this._cssName = "." + this._self.className;
		this._xpath = this._win._cssName + " .head " + this._cssName;
		this._capture = false;
		this._self.onclick = function(ev){
		};
		this._self.onmousedown = function(ev){
			return this._ptr.onMouseDown(ev || window.event);
			/*
			ev = ev || window.event;
			//this.style.backgroundPosition = "0px -" + _win._skin._model["sbtn_height"] + "px";
			this._ptr._capture = true;
			this.setCapture();
			this._ptr.setState("active");
			ev.cancelBubble = true;
			return false;
			*/
		};
		/*
		this._self.onmouseup = function(ev){
			ev = ev || window.event;
			//this.style.backgroundPosition = "0px 0px";
			this._ptr.setState("normal");
			this.releaseCapture();
			this._ptr._capture = false;
			ev.cancelBubble = true;
			return false;
		};
		this._self.onmouseover = function(ev){
			ev = ev || window.event;
			_doc.title = "over";
			if(this._ptr._capture){
				this._ptr.setState("active");
			}else{
				//this._ptr.setState("normal");
			}
			//return false;
		};
		this._self.onmouseout = function(ev){
			ev = ev || window.event;
			_doc.title = "out";
			if(this._ptr._capture){
				this._ptr.setState("normal");
			}else{
				//this._ptr.setState("normal");
			}
			//return false;
		};
		*/
	}
	this.dispose = function(){
		this._self.onmouseout = null;
		this._self.onmouseover = null;
		this._self.onmousedown = null;
		this._self.onmouseup = null;
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.onMouseDown = function(ev){
		this.setCapture(true);
		/*
		var _this = this;
		var body = window.document.body;
		if(runtime._host.env == "ie"){
			body.setCapture();
		}
		body.onmousemove = function(ev){_this.onMouseMove(ev || window.event);};
		body.onmouseup = function(ev){_this.onMouseUp(ev || window.event);};
		body = null;
		*/
		this.setState("active");
		ev.cancelBubble = true;
		return false;
	};
	this.onMouseMove = function(ev){
		var target = ev.srcElement || ev.target;
		this.setState(target == this._self ? "active" : "normal");
	};
	this.onMouseUp = function(ev){
		this.setState("normal");
		this.setCapture(false);
		/*
		var body = window.document.body;
		body.onmousemove = null;
		body.onmouseup = null;
		if(runtime._host.env == "ie"){
			body.releaseCapture();
		}
		body = null;
		*/
	};
});
/*</file>*/
/*<file name="alz/mui/Window.js">*/
_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.SysBtn");
_import("alz.mui.WindowSkinWINXP");
_import("alz.mui.WindowSkinWIN2K");

/*
	<div class="head">
		<img src="images/win-icon.gif" />
		<label>窗体组件标题栏 - Windown XP</label>
		<div class="sysbtn">
			<div class="icon-min"></div>
			<div class="icon-max"></div>
			<div class="icon-close"></div>
		</div>
	</div>
	<div class="head">
		<img src="images/win-icon.gif" />
		<label>窗体组件标题栏 - Windown 2000</label>
		<div class="sysbtn">
			<div class="icon-min"></div>
			<div class="icon-max"></div>
			<div class="icon-close"></div>
		</div>
	</div>
*/
_class("Window", Component, function(_super){
	var TPL_WIN = '<div id="win2" class="mui-Window-win2k" _icon="images/win-icon.gif" _caption="alzui调试器 - Windown 2000" _align="none">'
		+ '<div class="body">'
		//+ '<input type="checkbox" checked="checked" /> Resizable'
		+ '</div></div>';
	var TPL_HEAD = '<div class="head">'
		+ '<img />'
		+ '<label></label>'
		+ '<div class="sysbtn">'
		+ '<div class="icon-min" title="最小化"></div>'
		+ '<div class="icon-max" title="最大化"></div>'
		+ '<div class="icon-close" title="关闭"></div>'
		+ '</div>'
		+ '</div>';
	this._init = function(){
		_super._init.call(this);
		this._head = null;
		this._icon = null;
		this._title = null;
		this._minbtn = null;
		this._maxbtn = null;
		this._closebtn = null;
		this._body = null;
		this._skin = null;
		this._borders = null;

		this._resizable = true;
		this._width = 0;
		this._height = 0;
	};
	this.create = function(parent){
		this.setParent2(parent);
		var obj = runtime.createDomElement(TPL_WIN);
		if(parent){
			parent.appendChild(obj);
		}
		this.init(obj);
		return obj;
	};
	this.bind = function(obj){
		this.setParent2(obj.parentNode);
		this.init(obj);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		/*
		body     .body
		head     .head
		icon     .head > img
		title    .head > label
		minbtn   .head > .sysbtn > .icon-min
		maxbtn   .head > .sysbtn > .icon-max
		closebtn .head > .sysbtn > .icon-close
		*/
		this._cssName = "." + this._self.className;
		this._xpath = this._cssName;
		this._body = this._self.childNodes[0];
		this._head = runtime.createDomElement(TPL_HEAD, this._self);
		this._head._dlg = this;
		this._head.onselectstart = function(){return false;};
		this._head.onmousedown = function(ev){return this._dlg.onMouseDown(ev || window.event);};
		this._icon = this._head.childNodes[0];  //this._head.getElementsByTagName("img")[0];
		this._icon.src = obj.getAttribute("_icon").replace(/^images\//, runtime.getConfigData("pathimg"));
		this._icon.ondragstart = function(){return false;};
		this._title = this._head.childNodes[1];  //this._head.getElementsByTagName("label")[0];
		this._title.innerHTML = obj.getAttribute("_caption");
		this._title.onselectstart = function(){return false;};
		this._minbtn = new SysBtn();
		this._minbtn.init(this._head.childNodes[2].childNodes[0], this);
		this._maxbtn = new SysBtn();
		this._maxbtn.init(this._head.childNodes[2].childNodes[1], this);
		this._closebtn = new SysBtn();
		this._closebtn.init(this._head.childNodes[2].childNodes[2], this);
		if(this._self.className == "mui-Window-winxp"){
			this._skin = new WindowSkinWINXP();
		}else{
			this._skin = new WindowSkinWIN2K();
		}
		this._createBorders();
		this._skin.create(this);
	};
	this.dispose = function(){
		this._skin.dispose();
		this._skin = null;
		this._minbtn.dispose();
		this._minbtn = null;
		this._maxbtn.dispose();
		this._maxbtn = null;
		this._closebtn.dispose();
		this._closebtn = null;
		this._title.onselectstart = null;
		this._icon.ondragstart = null;
		this._head.onmousedown = null;
		this._head.onselectstart = null;
		this._head._dlg = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/*this.xquery = function(xpath){
		return runtime.selector.query(xpath, this._self);
	};*/
	this.getResizable = function(){
		return this._resizable;
	};
	this.setResizable = function(v){
		if(v == this._resizable) return;
		this._resizable = v;
		this.tune(this._width, this._height);
		for(var i = 0, len = this._borders.length; i < len; i++){
			this._borders[i].style.display = v ? "" : "none";
		}
		this._skin.onResizableChange();
	};
	this._createBorders = function(){
		this._borders = [];
		for(var i = 0, len = this._cursors.length; i < len; i++){
			var o = this._createElement2(this._self, "div", "", {
				"position": "absolute",
				"overflow": "hidden",
				"zIndex"  : 3,
				"cursor"  : this._cursors[i] + "-resize"
			});
			if(runtime._debug && !(runtime._host.env == "opera" && runtime._host.ver == "8.00")){
				o.style.backgroundColor = "#000000";
				//o.style.filter = "Alpha(Opacity=30)";
				runtime.dom.setOpacity(o, 0.3);
			}else{
				if(i == 1 && this._skin._model["top_use_opacity"] && !(runtime._host.env == "opera" && runtime._host.ver == "8.00")){
					o.style.backgroundColor = "#000000";
					runtime.dom.setOpacity(o, 0.01);
				}
			}
			this._borders.push(o);
			o = null;
		}
	};
	this._resizeBorder = function(w, h){
		var bw4 = 4, bw8 = 8;
		this.setElementRect(this._borders[0], 0    , 0    , bw8    , bw8);
		this.setElementRect(this._borders[1], bw8  , 0    , w-2*bw8, bw4);
		this.setElementRect(this._borders[2], w-bw8, 0    , bw8    , bw8);

		this.setElementRect(this._borders[3], 0    , bw8  , bw4    , h-2*bw8);
		this.setElementRect(this._borders[4], w-bw4, bw8  , bw4    , h-2*bw8);

		this.setElementRect(this._borders[5], 0    , h-bw8, bw8    , bw8);
		this.setElementRect(this._borders[6], bw8  , h-bw4, w-2*bw8, bw4);
		this.setElementRect(this._borders[7], w-bw8, h-bw8, bw8    , bw8);
	};
	this.resize = function(w, h){
		if(w < this._skin._model["min_width"] ) w = this._skin._model["min_width"];
		if(h < this._skin._model["min_height"]) h = this._skin._model["min_height"];
		if(_super.resize.apply(this, arguments)) return true;
		this.tune(w, h);
		this._resizeBorder(w, h);
		this._skin.resize(w, h);
	};
	this.tune = function(w, h){
		var m = this._skin._model;
		var n, h0;
		if(this._resizable){
			n = 4;
			h0 = m["head_height"];
		}else{
			n = 3;
			h0 = m["head_height"] - 1;
		}
		this.setElementRect(this._head, n,  n, w - 2 * n,     h0 - n - 1);
		this.setElementRect(this._body, n, h0, w - 2 * n, h - h0 - n    );
		this._title.style.width = (w - 2 * n - m["icon_width"] - m["sbtn_width"] * 3 - 2 * m["sep_num"]) + "px";
		m = null;
	};
	this.onMouseDown = function(ev){
		this._self.style.zIndex = runtime.getNextZIndex();
		//this._head.setCapture(true);
		var pos = runtime.dom.getPos1(ev, 1, this._self);
		this._offsetX = pos.x;  //ev.offsetX;  //ns 浏览器的问题
		this._offsetY = pos.y;  //ev.offsetY;
		this.setCapture(true);
		/*
		var _this = this;
		var body = window.document.body;
		if(runtime._host.env == "ie"){
			body.setCapture();
		}
		body.onmousemove = function(ev){_this.onMouseMove(ev || window.event);};
		body.onmouseup = function(ev){_this.onMouseUp(ev || window.event);};
		body = null;
		*/
	};
	this.onMouseMove = function(ev){
		var rect = runtime.dom.getViewPort(window.document.body);
		//[TODO]是否需要考虑BODY元素的边框宽度？
		var x = rect.x + Math.min(rect.w - 10, Math.max(10, ev.clientX)) - this._offsetX/* - 2*/;
		var y = rect.y + Math.min(rect.h - 10, Math.max(10, ev.clientY)) - this._offsetY/* - 2*/;
		runtime.dom.moveTo(this._self, x, y);
	};
	this.onMouseUp = function(ev){
		this.setCapture(false);
		/*
		var body = window.document.body;
		body.onmousemove = null;
		body.onmouseup = null;
		if(runtime._host.env == "ie"){
			body.releaseCapture();
		}
		body = null;
		*/
		//if(runtime.ie) this._head.releaseCapture();
		//this.setCapture(false);
	};
});
/*</file>*/

runtime = new WebRuntime();

/*<file name="alz/core/WebRuntime_init.js">*/
_package("alz.core");

_extension("WebRuntime", function(){  //注册 WebRuntime 扩展
	/*
	this._init = function(){
	};
	this.dispose = function(){
	};
	*/
	this.addMethods = function(dest, src){
		for(var key in src){
			dest[key] = src[key];
		}
		return dest;
	};
	this.toArray = function(iterable){  //prototype $A 的实现代码
		if(!iterable) return [];
		if(iterable.toArray){
			return iterable.toArray();
		}else{
			var results = [];
			for(var i = 0, len = iterable.length; i < len; i++){
				results.push(iterable[i]);
			}
			return results;
		}
	};
	/**
	 * 遍历一个对象，并返回格式化的字符串
	 */
	this.forIn = function(obj){
		if(typeof obj == "string") return [obj];  //FF 兼容问题
		var a = [];
		for(var k in obj){
			a.push(k + "=" + (typeof obj[k] == "function" ? "[function]" : obj[k]));
		}
		return a;
	};
	this.showException = function(e, info){
		var a = this.forIn(e);
		if(info){
			a.push(info);
		}
		this._win.alert(a.join("\n"));
	};
	/**
	 * 显示信息
	 * 使用了必须 document.body 对象，必须在 onContentLoaded 之后使用
	 */
	this.showInfo = function(info){
		//this._win.alert(info);
		if(!this._info){
			var body = this.getBody();
			var obj = this._doc.createElement("div");
			obj.className = "wui-Loging";
			obj.style.display = "none";
			this._info = body.appendChild(obj);
			obj = null;
			body = null;
		}
		this._info.innerHTML = info;
		if(this._info.style.display == "none"){
			this._info.style.display = "block";
			//显示的时候重新定义宽度
			this._info.style.width = (this.getBody().offsetWidth - 20) + "px";
		}
	};
	this.hideInfo = function(){
		if(this._info){
			this._info.style.display = "none";
		}
	};
});
/*</file>*/
/*<file name="alz/core/WebRuntime_core.js">*/
_package("alz.core");

//_import("alz.core.XPathQuery");
_import("alz.core.DOMUtil");
//_import("alz.core.DOMUtil2");
_import("alz.core.AjaxEngine");
_import("alz.core.AppManager");
//_import("alz.core.ProductManager");
//_import("alz.core.ActionCollection");

_extension("WebRuntime", function(){  //注册 WebRuntime 扩展
	var properties = ["_ajax"];
	this._init = function(){  //加载之后的初始化工作
		//this.selector = new XPathQuery();
		this.dom = new DOMUtil();
		//this.domutil = new DomUtil2();
		if(!this.getParentRuntime()){
			this._ajax = new AjaxEngine();  //异步交互引擎
		}else{
			for(var i = 0, len = properties.length; i < len; i++){
				var k = properties[i];
				this[k] = this._parentRuntime["get" + k.charAt(1).toUpperCase() + k.substr(2)]();
			}
			/*
			this._ajax = this._parentRuntime.getAjax();
			*/
		}
		//this._ajax._userinfo = true;
		//设置测试用例
		/*
		var win = this.getMainWindow();
		if(win && typeof win.runtime != "unknown" && typeof win.runtime != "undefined"){  //winxp下需要检测 win.runtime
			this._ajax.setTestCase(win.runtime._ajax.getTestCase());
		}
		*/
		if(this._debug){
			window.document.onmousedown = function(ev){
				ev = ev || window.event;
				if(ev.ctrlKey){
					var target = ev.target || ev.srcElement;
					for(var el = target; el; el = el.parentNode){
						if(el.__ptr__){
							var arr = runtime.forIn(el.__ptr__);
							arr.push("class=" + el.className);
							arr.push("tagName=" + el.tagName);
							window.alert(arr.join("\n"));
							arr = null;
							break;
						}
					}
				}
			};
		}
		this._appManager = new AppManager();
		this._product = null;
		if(typeof sinamail_data != "undefined"){
			this.regProduct(sinamail_data);
		}
	};
	this.dispose = function(){
		this._product = null;
		this._appManager.dispose();
		this._appManager = null;
		if(this._debug){
			window.document.onmousedown = null;
		}
		for(var i = 0, len = properties.length; i < len; i++){
			var k = properties[i];
			if(this[k]){
				if(!this._parentRuntime){
					this[k].dispose();
				}
				this[k] = null;
			}
		}
		//this.domutil.dispose();
		//this.domutil = null;
		if(this.dom){
			this.dom.dispose();
			this.dom = null;
		}
		//this.selector.dispose();
		//this.selector = null;
	};
	/**
	 * 返回用于操作DOM元素的工具类对象
	 */
	this.getDom = function(){
		return this.dom;
	};
	/**
	 * 返回用于异步交互的异步交互引擎
	 */
	this.getAjax = function(){
		return this._ajax;
	};
	this.getAppManager = function(){
		return this._appManager;
	};
	/**
	 * 去除字符串前后的空白字符
	 * @param {String} str 要处理的字符串
	 */
	this.trim = function(str){
		return str.replace(/(^\s*)|(\s*$)/g, "");
	};
	this.closure = function(o, fun, p1, p2){
		return function(){
			if(typeof o == "object" && typeof fun == "string" && typeof o[fun] == "function"){
				return o[fun](p1, p2);
			}else if(typeof o == "function"){
				return o(fun, p1, p2);
			}else{
				runtime.log("[ERROR]闭包使用错误！");
			}
		};
	};
	/**
	 * HTML 代码编码方法
	 * @param {String} html 要编码的 HTML 代码字符串
	 */
	this.encodeHTML = function(html){
		if(!html){
			return "";
		}else{
			return html
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/\"/g, "&quot;")
				//.replace(/\'/g, "&apos;")
				.replace(/ /g, "&nbsp;")
				.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
				.replace(/\r?\n/g, "<br />");
		}
	};
	/**
	 * HTML 代码解码方法
	 * @param {String} html 要解码的 HTML 代码字符串
	 */
	this.decodeHTML = function(html){
		if(!html){
			return "";
		}else{
			return html
				//.replace(/&#37;/ig, '%')
				.replace(/&nbsp;/ig, " ")
				.replace(/&quot;/ig, "\"")
				//.replace(/&apos;/ig, "\'")
				.replace(/&gt;/ig, ">")
				.replace(/&lt;/ig, "<")
				.replace(/&#(\d{2}|\d{4});/ig, function(_0, _1){
					return String.fromCharCode(_1);
				})
				.replace(/&amp;/ig, "&");
		}
	};
	/**
	 * 根据参数 progid 创建一个 ActiveXObject，成功返回对象，失败返回 null
	 * @param {String} progid ActiveXObject 控件的 PROGID
	 */
	this.createComObject = function(progid){
		try{
			if(this._hostenv == "ie" && this._win.host){
				return this._win.host.createComObject(progid);
			}else{
				return new ActiveXObject(progid);
			}
		}catch(ex){
			this.showException(ex, "创建 {0} 组件失败".replace(/\{0\}/, progid));
			return null;
		}
	};
	/*this.getMainWindow = function(){
		var win;
		if(!this.inGadget){
			if(this._win.opener){
				win = this._win.opener;
			}/ *else{
				;
			}* /
		}else{
			win = System.Gadget.document.parentWindow;
		}
		return win;
	};*/
	this.getParentWindow = function(){
		return this.getMainWindow();
	};
	/**
	 * 根据 className 获取相应的 DOM 元素
	 * @return {Array} 符合条件的元素组成的数组
	 * [TODO]效率极低，有待优化
	 */
	this.getElementsByClassName = function(className){
		var a = [];
		var nodes = this._doc.getElementsByTagName("*");
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			if(node.className.indexOf(className) != -1){
				a.push(node);
			}
		}
		return a;
	};
	this.openDialog = function(url, width, height){
		var screen = {
			"w": this._win.screen.availWidth,
			"h": this._win.screen.availHeight
		};
		var features = "fullscreen=0,channelmode=0,toolbar=0,location=0,"
			+ "directories=0,status=0,menubar=0,scrollbars=0,resizable=1"
			+ ",left=" + Math.round((screen.w - width) / 2)
			+ ",top=" + Math.round((screen.h - height) / 2)
			+ ",width=" + width
			+ ",height=" + height;
		//return this._win.showModelessDialog(url, "123", "dialogTop:100px;dialogLeft:100px;dialogWidth:400px;dialogHeight:580px;resizable:1;status:0;help:0;edge:raised;");
		return this._win.open(url, "_blank", features);
	};
	this.createEvent = function(ev){
		var o = {};
		//o.sender = ev.sender || null;  //事件发送者
		o.type = ev.type;
		o.target = ev.srcElement || ev.target;  //IE和FF的差别
		o.reason = ev.reason;
		o.cancelBubble = ev.cancelBubble;
		o.returnValue = ev.returnValue;
		o.srcFilter = ev.srcFilter;
		o.fromElement = ev.fromElement;
		o.toElement = ev.toElement;
		//mouse event
		o.button = ev.button;
		o.screenX = ev.screenX;
		o.screenY = ev.screenY;
		o.clientX = ev.clientX;
		o.clientY = ev.clientY;
		o.offsetX = ev.offsetX || 0;
		o.offsetY = ev.offsetY || 0;
		o.x = ev.x || ev.clientX;
		o.y = ev.y || ev.clientY;
		//key event
		o.altKey = ev.altKey;
		o.ctrlKey = ev.ctrlKey;
		o.shiftKey = ev.shiftKey;
		o.keyCode = ev.keyCode;
		return o;
	};
	this.createApp = function(appClassName, parentApp, len){
		return this._appManager.createApp(appClassName, parentApp, len);
	};
	/**
	 * 注册产品
	 */
	this.regProduct = function(v){
		this._product = v;
		this._appManager.setConfList(v.app);
	};
	this.getProduct = function(){
		if(!this._product){
			runtime.log("[WebRuntime::getProduct]data_xxx.js未能正确加载，系统无法正常运行，请检查！");
			this._product = {
				"name" : "",  //产品名称
				"tpl"  : [],  //模板
				"skin" : [],  //皮肤
				"paper": [],  //信纸
				"app"  : []   //APP配置
			};
		}
		return this._product;
	};
});
/*</file>*/
/*<file name="alz/core/WebRuntime_ui.js">*/
_package("alz.core");

_import("alz.core.ActionManager");
_import("alz.mui.ToggleManager");
_import("alz.mui.Workspace");
_import("alz.mui.Dialog");

_extension("WebRuntime", function(){  //注册 WebRuntime 扩展
	this._init = function(){  //加载之后的初始化工作
		this._domTemp = null;
		this.toggleMgr = new ToggleManager();
		//this.actionManager = new ActionManager();
		this._workspace = new Workspace();
		if(this._newWorkspace){
			this._workspace.create(this.getBody());
		}else{
			this._workspace.bind(this.getBody());
		}
		this._workspace.setVisible(true);
		if(this.debug){  //如果开启调试开关
			this._testCaseWin = new Dialog();
			this._testCaseWin._domCreate = true;
			this._testCaseWin.create(this._workspace._self, "Test Case Listener");
			this._testCaseWin.moveTo(500, 50);
			this._testCaseWin.resize(500, 300);
			this._testCaseWin.setClientBgColor("#FFFFFF");
			this._testCaseWin.log = function(msg){
				var div = this._createElement2(null, "div", "", {
					"borderBottom": "1px solid #CCCCCC",
					"innerHTML"   : msg
				});
				this._body.appendChild(div, this._body.childNodes[0]);
				div = null;
			};
		}
	};
	this.dispose = function(){
		if(this._workspace){
			this._workspace.dispose();
			this._workspace = null;
		}
		if(this._testCaseWin){
			this._testCaseWin.dispose();
			this._testCaseWin = null;
		}
		this.toggleMgr.dispose();
		this.toggleMgr = null;
		//this.actionManager.dispose();
		//this.actionManager = null;
		this._domTemp = null;
	};
	this.createDomElement = function(html, parent){
		if(!this._domTemp){
			this._domTemp = this._doc.createElement("div");
		}
		this._domTemp.innerHTML = html;
		var obj = this._domTemp.removeChild(this._domTemp.childNodes[0]);
		if(parent){
			parent.appendChild(obj);
			/*
			//滞后加载图片
			var imgs = obj.getElementsByTagName("img");
			for(var i = 0, len = imgs.length; i < len; i++){
				imgs[i].src = imgs[i].getAttribute("src0");
			}
			imgs = null;
			*/
		}
		return obj;
	};
	this.getWorkspace = function(){
		return this._workspace;
	};
	this.getViewPort = function(element){
		var rect = {
			x: element.scrollLeft,
			y: element.scrollTop,
			w: element.clientWidth,  //Math.max(element.clientWidth || element.scrollWidth)
			h: Math.max(element.clientHeight, element.parentNode.clientHeight)  //Math.max(element.clientHeight || element.scrollHeight)
		};
		//if(this.ff){}
		rect.w = Math.max(element.clientWidth, element.parentNode.clientWidth);
		rect.h = Math.max(element.clientHeight, element.parentNode.clientHeight);
		return rect;
	};
	this.onResize = function(ev){
		var rect = this.getViewPort(this.getBody());  //this._workspace.getViewPort()
		if(this._workspace){
			this._workspace.resize(rect.w, rect.h);
		}
		if(typeof app_onResize != "undefined"){  //提前触发应用的resize事件
			app_onResize(rect.w, rect.h);
		}
		if(this._appManager){
			this._appManager.onResize(rect.w, rect.h);  //调整所有应用的大小
		}
	};
	/**
	 * 根据DOM元素的ID，并且使用该DOM元素创建一个脚本组件
	 * @param {String} id 脚本组件所绑定的DOM元素的ID
	 */
	this.getComponentById = function(id){
		return this.initComponent(null, id);
	};
	/**
	 * 所有通过该函数操作过的DOM元素都会绑定一个脚本组件对象，并通过该脚本组件可以
	 * 方便的操作DOM元素的属性。
	 * @param {Component} parent 父组件
	 * @param {String|Component} id 组件要绑定的DOM元素的id
	 * -@param {Boolean} initChild 是否初始化子DOM元素
	 */
	this.initComponent = function(parent, id){
		var obj = typeof id == "string" ? this.getElement(id) : id;
		if(!obj) throw "未找到指定id的DOM元素";
		if(!obj._ptr){
			var className, aui;
			var sAui = obj.getAttribute("aui");
			if(sAui != "-"){
				aui = eval("(" + sAui + ")");
				if(aui.tag){
					className = aui.tag;
				}else{
					className = obj.getAttribute("tag");
					if(!className){
						className = "Component";
						//throw "找到的DOM元素没有tag属性，不能绑定脚本组件";
					}else{
						this._win.alert("使用DOM元素的tag属性决定组件类型");
					}
				}
			}
			if(!className){
				className = "Component";  //默认值
			}
			var c = new alz[className]();
			//c._domCreate = true;
			if(aui){
				c.setJsonData(aui);
			}
			c.setParent(parent, obj);
			c.bind(obj);
			//var color = this.getRandomColor();
			//c._self.style.backgroundColor = color;
			this._components.push(c);
			if(obj.getAttribute("html") != "true"){  //如果初始化子组件的话
				var nodes = obj.childNodes;
				for(var i = 0, len = nodes.length; i < len; i++){
					if(nodes[i].nodeType == 1 && nodes[i].getAttribute("aui")){  //NODE_ELEMENT
						this.initComponent(c, nodes[i], true);
					}
				}
				nodes = null;
			}
			c = null;
		}
		return obj._ptr;
	};
	/**
	 * @param {String} id DOM元素的ID列表，逗号分隔
	 * @return {undefined}
	 */
	this.initComponents = function(id){
		var arr = id.split(",");
		for(var i = 0, len = arr.length; i < len; i++){
			var c = this.initComponent(this._workspace, arr[i]);
			var nodes = c._self.childNodes;
			for(var j = 0, len1 = nodes.length; j < len1; j++){
				var node = nodes[j];
				if(node.nodeType == 1 && node.getAttribute("aui")){  //NODE_ELEMENT
					this.initComponent(c, node, true);
				}
				node = null;
			}
			nodes = null;
			c = null;
		}
		arr = null;
	};
	/**
	 * 显示一个模态对话框
	 * @param {String} id 对话框的ID
	 * @param {String} ownerId 该对话框的所有者的编号
	 * @return {undefined}
	 */
	this.showModalDialog = function(id, ownerId){
		if(id){
			if(ownerId){
				var owner = this.getComponentById(ownerId);
				this._workspace.getModalPanel().setOwner(owner);
			}
			var obj = this.getComponentById(id);  //可能的组件是 Popup,Dialog
			obj.moveToCenter();
			obj.showModal(true);
		}/*else{
			obj.showModal(false);
		}*/
	};
	this.getModalPanel = function(){
		return this._workspace.getModalPanel();
	};
});
/*</file>*/

runtime.regLib("aui", function(){  //加载之后的初始化工作

});

}})(this);