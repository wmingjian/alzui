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

//var __version = "__VERSION__";  //当前版本信息，格式:"主版本号.副版本号.修订版本号"
//var __buildtime = __BUILD_TIME__;
//var __start = new Date().getTime();  //记录开始时间
//var __global = window;
var __proto = "prototype";
var __inDeclare  = false;  //标识是否处于类声明过程中
var __all__      = {};  //所有的类和接口
var __interfaces = {};  //所有接口
var __pkgName    = "";  //当前类（或接口,扩展）所在的包的名字

var __toString  = Object[__proto].toString,
	__rwhite    = /\s/,
	__trimLeft  = /^\s+/,
	__trimRight = /\s+$/;
// IE6/7/8 return false
if(!__rwhite.test("\xA0")){
	__trimLeft = /^[\s\xA0]+/;
	__trimRight = /[\s\xA0]+$/;
}
initNative();
//var __profile = __global.__profile = new Profile();

function applyIf(o, c){
	if(o){
		for(var p in c){
			if(typeof o[p] == "undefined"){
				o[p] = c[p];
			}
		}
	}
	return o;
}
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
		__all__["alz.native." + k] = hash[k];
	}
	(function(map){
		for(var key in map){
			var p = hash[key][__proto];
			var methods = map[key];
			for(var k in methods){
				if(!p[k]){
					p[k] = methods[k];
				}
			}
		}
	})({
		"String": {
			/*
			repeat: function(n){
				var s = "", t = this + s;
				while(--n >= 0){
					s += t;
				}
				return s;
			},
			*/
			capitalize: function(){
				return this.charAt(0).toUpperCase() + this.substr(1);
			},
			trimLeft: function(){
				return this.replace(__trimLeft, "");
			},
			trimRight: function(s){
				return this.replace(__trimRight, "");
			},
			trim: function(){
				return this.replace(__trimLeft,"").replace(__trimRight,"");
			},
			startsWith: function(prefix){
				return this.lastIndexOf(prefix, 0) == 0;
			},
			endsWith: function(suffix){
				var l = this.length - suffix.length;
				return l >= 0 && this.indexOf(suffix, l) == l;
			}
		},
		"Array": {
			/**
			 * 移除数组中的第i个对象
			 */
			removeAt: function(i){
				this.splice(i, 1);
			},
			// 如果不考虑IE5.5下版本浏览器，该方法可考虑丢弃
			// IE 5.x fix from Igor Poteryaev.
			pop: function(){
				var UNDEFINED;
				if(this.length === 0){
					return UNDEFINED;
				}
				return this[--this.length];
			},
			// 如果不考虑IE5.5下版本浏览器，该方法可考虑丢弃
			// IE 5.x fix from Igor Poteryaev.
			push: function(){
				for(var i = 0, len = arguments.length; i < len; i++){
					this[this.length] = arguments[i];
				}
				return this.length;
			},
			// 返回(默认从第一个元素开始查找)指定元素的索引，如果不存在返回-1
			indexOf: function(obj, idx){
				var from = idx === undefined ? 0 : (idx < 0 ? Math.max(0, arr.length + idx) : idx);
				for(var i = from, l = this.length; i < l; i++){
					if(i in this && this[i] === obj){
						return i;
					}
				}
				return -1;
			},
			// 返回(默认从最后一个元素开始查找)指定元素的索引，如果不存在返回-1
			lastIndexOf: function(obj, idx){
				var l = this.length, from = idx == null ? l - 1 : idx;
				if(from < 0){
					from = Math.max(0, l + from);
				}
				for(var i = from; i >= 0; i--){
					if(i in this && this[i] === obj){
						return i;
					}
				}
				return -1;
			},
			// 检查数组元素是否都符合某个条件，只要有一个不符合返回false，否则返回true
			every: function(fn, thisObj){
				var l = this.length;
				for(var i = 0; i < l; i++){
					if(i in this && !fn.call(thisObj, this[i], i, this)){
						return false;
					}
				}
				return true;
			},
			// 检查数组中元素是否符合某个条件，只要有一个符合返回true，否则返回false
			some: function(fn, thisObj){
				var l = this.length;
				for(var i = 0; i < l; i++){
					if(i in this && fn.call(thisObj, this[i], i, this)){
						return true;
					}
				}
				return false;
			},
			// 在数组中的每个项上运行一个函数，并将函数返回真值的项作为数组返回
			filter: function(fn, thisObj){
				var l = this.length, res = [], resLength = 0;
				for(var i = 0; i < l; i++){
					if(i in this){
						var val = this[i];
						if(fn.call(thisObj, val, i, this)){
							res[resLength++] = val;
						}
					}
				}
				return res;
			},
			// 在数组中的每个项上运行一个函数，并将全部结果作为数组返回
			map: function(fn, thisObj){
				var l = this.length, res = [];
				for(var i = 0; i < l; i++){
					if(i in this){
						res[i] = fn.call(thisObj, this[i], i, this);
					}
				}
				return res;
			},
			// 在数组中的每个项上运行一个函数
			forEach: function(fn, thisObj){
				var l = this.length;
				for(var i = 0; i < l; i++){
					if(i in this) {
						fn.call(thisObj, this[i], i, this);
					}
				}
			}
		},
		"Date": {
			toMyString: function(type){
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
			}
		},
		/**
		 * IE5.01不支持apply,call方法，所以在此需要自定义来修正它们
		 * 本框架模拟OOP严重依赖这两个东东，不得不重视它们的存在，同时也把框架对浏览器和
		 * JS引擎的版本要求降到了足够低的程度！^_^
		 */
		"Function": {
			apply: function(thisObj, args){
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
			},
			call: function(thisObj){
				var args = [];  //copy all arguments but the first
				for(var i = 1, len = arguments.length; i < len; i++){
					args[i - 1] = arguments[i];
				}
				return this.apply(thisObj, args);
			}
		}
	});
}

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
(function(){
	/**
	 * 核心类包定义
	 * 在这里不直接定义为 WebRuntime 的成员，主要目的是为了解决在当前的命名空间
	 * 内不可以直接通过 alz 引用脚本类的问题。
	 * 定义在原型上，是为了所有上下文环境共享同一个对象
	 */
	this.alz         = {};  //保证所有命名空间下指向同一个根包
	this.__classes__ = {};  //所有的类
	//var _exts      = {};  //所有类的扩展
	/**
	 * 创建并返回类的原型或者说类对象自身
	 */
	function createClass(){
		//返回一个函数对象等价于创建一个Function实例，所以以后的模拟每个类的构造函数才
		//会是不同的function对象，如果使用相同的function对象OO模拟在继承时将存在致命的
		//问题，其他的像prototype,jQuery,mootools等，模拟OO的核心思想都和这里是一致的。
		//return new Function("this._init.apply(this, arguments);");  //anonymous code
		return function(){  //"F" + new Date().getTime()
			//如果处于类声明过程中，直接返回，仅仅建立原型链，不需要调用实际的构造函数
			if(__inDeclare) return;

			//调用一遍实现的接口
			var imps = this._clazz._imps;
			for(var i = 0, len = imps.length; i < len; i++){
				imps[i]._init.call(this);  //执行接口的构造函数
			}
			imps = null;

			//检查构造函数是否存在，基于类的严格性只做有无的检查，不做是否是函数的检查，
			//以后为了提高性能可以考虑忽略该检查
			//if(typeof this._init == "function"){
				//调用OOP模拟中实际的构造函数，并传递参数
				this._init.apply(this, arguments);
			/*}else{
				throw "类 " + name + " 定义中缺少构造函数 _init";
			}*/

			//在以后高级的UI组件类中this.create方法是类内部属性实际构造的地方，构造函数其
			//实只是一个属性声明的集中地，真正的create动作在这个方法内部实现，并期望它不
			//仅仅是一个参数。
			//如果参数个数不为0，执行 create 方法
			if(arguments.length != 0 && this.create){  //this._className.indexOf("alz.ui.") == 0
				this.create.apply(this, arguments);  //调用create方法并传递参数
			}
		};
	}
	//创建一个方法并返回
	function createMethod(name){
		return function(){
			return callMethod(this, name, arguments);
		};
	}
	//使用用特定的参数调用一个指定名称的方法
	function callMethod(obj, name, args){
		if(obj._clazz._exts !== obj._clazz[__proto]._clazz._exts){
			window.alert("callMethod error");
		}
		//op = object or prototype
		for(var op = obj; op && op._clazz._exts; op = op._clazz._super){
			var exts = op._clazz._exts;
			if(name == "dispose"){
				for(var i = exts.length - 1; i >= 0; i--){  //逆序执行析构方法的扩展
					var ext = exts[i];
					if(name in ext){
						ext[name].apply(obj, args);
					}
				}
			}else{
				for(var i = 0, len = exts.length; i < len; i++){  //按顺序执行方法的扩展（构造、析构）
					var ext = exts[i];
					if(name in ext){
						ext[name].apply(obj, args);
					}
				}
			}
			exts = null;
		}
	}
	this._init = function(name, rt){
		this.__name = name || "anonymous";  //Context的名字
		this.__context__ = this;
		this.runtime = rt || null;  //这个是将要导出的全局唯一对象
		this.application = null;  //针对每一个应用的唯一 application 对象
		//this._super = null;  //当前类的父类
	};
	//调用父类同名方法的辅助函数
	function __super__(obj, name, argv){
		var s = obj._clazz._super;
		if(name == "_init"){  //构造函数
			/*
			var arr = [];
			for(var i = 2, len = arguments.length; i < len; i++){
				arr.push(arguments[i]);
			}
			*/
			var arr = Array.prototype.slice.call(arguments, 2);
			s[name].apply(obj, arr);
			arr = null;
		}else{
			if(arguments.length == 2){
				s[name].apply(obj);
			}else{
				s[name].apply(obj, argv);
			}
		}
	}
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
		var _s, fullClassName = __pkgName + "." + className;
		if(superClass === null){  //默认继承 JS 的原生根对象
			_s = null;  //保证根类 _super 属性为 null
			superClass = Object;  //[TODO]如果框架没有扩展Object，则无需继承Object
		}else{
			if(superClass === ""){
				superClass = this.__classes__["alz.lang.AObject"];
			}
			_s = superClass[__proto];
		}

		//类及属性定义(静态属性) ！！！类定义，非实例
		var clazz = createClass();  //定义类
		clazz._super = _s;  //绑定 _super 属性到类上面（Object.prototype）
		clazz._className = fullClassName;
		clazz._clazzImp = classImp;  //类的实现代码
		clazz._exts = [];  //类的扩展代码
		clazz._imps = [];  //类实现的接口
		clazz.toString = function(){return "[class " + this._className + "]"};

		//原型及属性定义（所有实例共享这些属性）
		__inDeclare = true;
		var _p = clazz[__proto] = new superClass();  //通过原型实现继承
		__inDeclare = false;
		_p.constructor = clazz;  //_p._init;  //初始化构造器
		if(!_p.__proto__){
			_p.__proto__ = _p;  //fixed for ie
		}
		_p._className = fullClassName;  //className
		_p._clazz = clazz;

		//类绑定
		//保存起来便于管理
		this.alz[className] = clazz;  //将类绑定到根包上面
		__all__[fullClassName] = clazz;
		this.__context__[className] = clazz;  //绑定到当前上下文环境（作用域）之上
		this.__classes__[fullClassName] = clazz;
		//this.runtime._contextList[this.runtime._name][className] = clazz;  //绑定到核心上下文环境之上
		//__global[className] = clazz;  //暴露到全局命名空间下

		//执行类的实现代码
		if(typeof classImp == "function"){
			classImp.apply(_p, [_s, __super__]);  //function(_super){};  //初始化类对象
		}
		//__profile.hackClass(clazz, _p);
		_p = null;
		_s = null;
		//clazz = null;
		return clazz;
	};
	this._clazz = LibContext;
	this._clazz._super = null;
	this._clazz._className = "alz.LibContext";
	this._clazz._clazzImp = arguments.callee;
	this._clazz._exts = [];
	this._clazz._imps = [];
	this._clazz.toString = function(){return "[class " + this._className + "]"};
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
		proto[name] = methodImp || function(){};
	};
	this._implements = function(proto/*, interfaces*/){
		var len = arguments.length;
		if(len < 2){
			window.alert("[_implements]arguments.length error");
		}else{
			var imps = proto._clazz._imps;
			for(var i = 1; i < len; i++){
				var func = arguments[i];
				var obj = new func();
				if(!("_init" in obj)){
					obj["_init"] = function(){};
				}
				//var obj = {"_init": function(){}};
				//func.call(obj);
				imps.push(obj);
				//将构造函数_init之外的方法拷贝到原型上面
				for(var k in obj){
					var m = obj[k];
					if(k != "_init"/* && typeof m === "function"*/){
						proto[k] = m;
					}
				}
			}
		}
	};
	/**
	 * 为类提供一个扩展机制
	 * @param {String} className 被扩展的类的名字
	 * @param {Function} extImp 扩展的实现代码
	 * [TODO]可以按照这个扩展的工作原理，并且通过替换原型上相关的方法，为每一个类
	 * 设计扩展一种机制。
	 * WebRuntime.regExt = function(clazz){};
	 */
	this._extension = function(className, extImp){
		var name = __pkgName + "." + className;
		var clazz = this.__classes__[name];
		if(!clazz){
			throw "类" + name + "还不存在，请检查包和类名的定义是否正确";
		}
		//if(!(name in _exts)){
		//	_exts[name] = [];
		//}
		var methods = {
			"_init"   : 1,  //构造函数
			"init"    : 1,  //初始化函数
			"dispose" : 1,  //析构函数
			"__conf__": 1   //配置数据注册方法
		};
		var p = clazz[__proto];
		var exts = p._clazz._exts;  //_exts[name]
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
		//var o = new extImp();  //创建扩展的一个实例（只需创建一个）
		var o = {
			"__conf__": function(){}
		};
		extImp.call(o);  //调用扩展实现
		exts.push(o);  //注册扩展
		for(var k in o){
			if(k in methods) continue;  //忽略关键方法
			p[k] = o[k];  //其他的方法直接绑定到原型上
		}
		//如果是扩展的WebRuntime类，保证全局唯一对象runtime能够被扩展
		//[TO-DO]onContentLoad之后再执行WebRuntime的类扩展
		if(className == "WebRuntime"){
			if(o._init){
				o._init.call(this.runtime);
			}
		}
		o = null;
		exts = null;
		p = null;
	};
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
}).apply(LibContext.prototype);

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
		var className = "LibContext";
		var cxt = new LibContext(name);
		//保证aui命名空间下可以访问到
		cxt.__context__[className] =  //绑定到当前上下文环境（作用域）之上
		cxt.__classes__["alz." + className] = LibContext;
		//__global[className] = LibContext;
		libImp(cxt);
		var clazz = cxt.__context__["WebRuntime"];
		var rt = cxt.runtime = __global.runtime = new clazz();
		rt.init(__global, cxt);
	}
};