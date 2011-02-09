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
		var _p = Array[__proto];
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
	 * @param className {String} 类的名字
	 * @param superClass {Class} 父类对象
	 * @param classImp {Function} 类的实现代码
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
_class("Context", null, function(){
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
	 * @param name {String} 接口的名字
	 * @param superInterface {Interface} 父接口
	 * @param interfaceImp {Function} 接口的实现，可以是虚实现
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
	 * @param className {String} 被扩展的类的名字
	 * @param extImp {Function} 扩展的实现代码
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
			if(o._init) o._init.call(this.runtime);
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