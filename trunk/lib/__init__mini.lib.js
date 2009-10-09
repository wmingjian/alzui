/*
 * alzui-mini JavaScript Framework, v0.0.8
 * Copyright (c) 2009 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
(function(__global){  // Using a closure to keep global namespace clean.

//_import("alz.changelog");
/*#file begin=alz.init.js*/
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
var __buildtime = 1255054776649;
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
	 * 在这里不直接定义为 WebAppRuntime 的成员，主要目的是为了解决在当前的命名空间
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
				var a = [];
				if(args){
					for(var i = 0, len = args.length; i < len; i++){
						a[i] = "args[" + i + "]";
					}
				}
				thisObj.__apply__ = this;
				a = "thisObj.__apply__(" + a.join(",") + ")";
				var r = eval(a);
				delete thisObj.__apply__;
				return r;
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
	 * @param sInterface {String} 接口的名字
	 * @param superInterface {Interface} 父接口
	 * @param interfaceImp {Function} 接口的实现，可以是虚实现
	 */
	this._interface = function(sInterface, superInterface, interfaceImp){
		interfaceImp.__name__ = sInterface;
		this.alz[sInterface] = interfaceImp;
		this[sInterface] = interfaceImp;
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
			for(var i = 0, len = exts.length; i < len; i++){  //按顺序执行方法的扩展（构造、析构）
				if(name in exts[i]){
					exts[i][name].apply(obj, args);
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
	 * WebAppRuntime.regExt = function(clazz){};
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
			if(k in methods) continue; //忽略关键方法
			p[k] = o[k];  //其他的方法直接绑定到原型上
		}
		//如果是扩展的WebAppRuntime类，保证全局唯一对象runtime能够被扩展
		//[TO-DO]onContentLoad之后再执行WebAppRuntime的类扩展
		if(className == "WebAppRuntime"){
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
/*#file end*/
with(createContext("__init__")){

/*#file begin=alz.lang.AObject.js*/
_package("alz.lang");

/**
 * 根类 AObject
 */
_class("AObject", null, function(){
	//this._className = "";  //static property
	this._init = function(){
		//Object.call(this);
		this._disposed = false;
	};
	this.dispose = function(){
		this._disposed = true;
	};
	this.toString = function(){
		if(this._className)
			return "[object " + this._className + "]";
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
		if(typeof this[getterName] == "function")
			return this[getterName]();
		throw new Error("No such property, " + sPropertyName);
	};
	this.setProperty = function(sPropertyName, oValue){
		var setterName = "set" + sPropertyName.capitalize();
		if(typeof this[setterName] == "function")
			this[setterName](oValue);
		else
			throw new Error("No such property, " + sPropertyName);
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
/*#file end*/
/*#file begin=alz.lang.Exception.js*/
_package("alz.lang");

_class("Exception", "", function(_super){
	this._init = function(msg){
		_super._init.call(this);
		this._message = this._formatMsg(msg, arguments);
	};
	this.dispose = function(){
		_super.dispose.apply(this);
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
/*#file end*/
/*#file begin=alz.core.WebAppRuntime.js*/
_package("alz.core");

_import("alz.lang.Exception");
//_import("alz.core.DOMUtil");
//_import("alz.core.AjaxEngine");
//_import("alz.mui.Component");
//_import("alz.mui.Workspace");

_class("WebAppRuntime", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		//调试及其它各种开关选项
		this._startTime = __start;   //系统代码开始执行的时间戳
		this._debug = false;         //系统是否处于调试状态
		this._parentRuntime = null;  //父WebAppRuntime对象
		this._host = null;           //宿主环境
		this._hostenv = "";
		this._win = __global;
		this._doc = this._win.document;

		this.ie = false;      //是否IE浏览器
		this.ff = false;      //是否FireFox
		this.ns = false;      //是否Netscape
		this.opera = false;   //是否Opera
		this.safari = false;  //是否Safari
		this.chrome = false;  //是否谷歌浏览器
		this.moz = false;     //是否Mozilla系列浏览器
		this.ie6 = false;     //是否IE6
		this.ie7 = false;     //是否IE7
		this.max = false;     //是否Maxthon
		this.tt = false;      //是否TencentTraveler

		this._checkBrowser();

		//探测是否 Gadget 运行环境
		this.inGadget = !!(this._win.System && this._win.System.Gadget);  //typeof System != "undefined"
		this.option = {  //Gadget相关属性
			timer:2000,  //检查新邮件的时间间隔
			newMailNum:0  //新邮件数量
		};

		this._boxModel = this.ie ? 0 : 1;
		this._domScript = null;
		this._config = {};
		this._conf = {};
		this._srvFiles = {};

		this.pathSep   = "/";  //目录分割符
		this.pathAui   = "/alzui/";     //alzui内核所在目录("http://www.iiios.net:8081/alzui/")
		this.classpath = this.pathAui + "classes/";     //默认的类文件存储目录
		this.pathLib   = this.pathAui + "lib/";         //默认的类库包存储目录
		this.pathApp   = this.pathAui + "netapp/";      //app所在根目录
		this.pathSrv   = this.pathAui + "data/";        //服务端程序的根目录
		this.pathHtml  = this.pathAui + "html/";        //HtmlApp 目录
		this.pathTpl   = this.pathLib + "src/tpl/";     //tpl模版文件目录
		this.pathCss   = this.pathLib + "src/css/";     //css文件目录
		this.pathImg   = this.pathLib + "src/";         //图片资源
		this.pathIcon  = this.pathLib + "src/icon/";    //图标
		this.pathSkin  = this.pathLib + "skin/win2k/";  //皮肤
		this.pathPlugin = this.pathAui + "plugins/";    //插件目录

		this._libManager = null;  //库文件管理者
		this._libLoader = null;   //库文件加载器
		this._contextList = {};   //上下文环境对象列表
		this._context = null;     //当前上下文环境对象
		this._plugins = {};       //注册的插件列表
		this._files = {};         //已经加载的js或css文件
		this._log = [];
		this._info = null;
		this._testDiv = null;
		this._zIndex = 0;
		this._components = [];

		//core.lib
		//this.dom = null;   //{DOMUtil}
		//this.ajax = null;  //{AjaxEngine}

		//ui.lib
		//this._workspace = null;

		this._funs = [];

		this._inited = false;
	};
	this.init = function(){
		var _this = this;
		function __eventHandle(ev){
			_this.eventHandle(ev || _this._win.event);
		}

		this.exportInterface(this._win);  //导出全局变量
		this._checkHostEnv();
		this._pathCss = this._config["pathcss"];
		//this._pathCss = this._products[this._productName].pathCss;
		this.pathPlugin = this._config["pathplugin"];

		this._libManager = new LibManager();

		if(this._config["skin"]){
			var url = this.pathLib + "skin/" + this._config["skin"] + "/skin.css";
			this._doc.write("<link"
				+ " rel=\"stylesheet\""
				+ " type=\"text/css\""
				+ " href=\"" + url + "\""
				+ " />");
		}
		this._preLoadFile("css", this._pathCss, this._config["css"].split(","));
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
		if(this._config["autotest"])  //加载自动测试文件
			this._doc.write('<script type="text/javascript" src="' + this._config["autotest"] + '" charset=\"utf-8\"></sc'+'ript>');

		if(this._doc.attachEvent){
			try{  //下面这句在WinXP+IE6下报错，所以加上防错处理
				this._doc.execCommand("BackgroundImageCache", false, true);
			}catch(ex){
			}
			this._doc.attachEvent("onreadystatechange", __eventHandle);
		}else{
			this._doc.addEventListener("DOMContentLoaded", __eventHandle, false);
		}
		if(this.safari || this.chrome)
			this.bindEventListener(this._win, "load", __eventHandle);
		this.bindEventListener(this._win, "unload", __eventHandle);
		this.bindEventListener(this._win, "resize", __eventHandle);
		var types = ["contextmenu", "mousedown", "mousemove", "mouseup", "keydown", "keypress", "keyup"];
		for(var i = 0, len = types.length; i < len; i++){
			this.bindEventListener(this._doc, types[i], __eventHandle);
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
		//按顺序执行构造扩展
		//for(var i = 1, len = this._exts.length; i < len; i++){
		//	this._exts[i].init.call(this);
		//}
		this._libManager.initLoadLib();
		this._newWorkspace = bNewWorkspace;
		//this._workspace = new Screen();
		//this._workspace[this._newWorkspace ? "create" : "bind"](this.getBody());
		if(this.ie)  //IE在此时触发 resize
			this.eventHandle({type:"resize"});  //主动触发一次 resize 事件
		//var _this = this;
		//this.bindEventListener(this._win, "mousemove", function(ev){_this.eventHandle(ev || _this._win.event);});
		//this.bindEventListener(this._doc.body, "mousemove", function(ev){_this.eventHandle(ev || _this._win.event);});
		this._boxModel = this._testBoxModel();  //探测盒模型
		//[TODO]库代码的加载时机应该更早才对，至少要在 onContentLoaded 之前，最好是在初始化脚本加载并初始化完毕的时候
		var libs = this._config["lib"];  //.replace(/^core,ui,/, "");  //忽略core,ui库代码
		this._libLoader = new LibLoader();
		this._libLoader.init(libs.split(","), this._config["codeprovider"], this, "onLibLoad");
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var k in this._plugins){
			this._plugins[k].dispose();
			delete this._plugins[k];
		}
		this._context = null;
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
	/**
	 * 利用正则匹配 window.navigator.userAgent 来获取浏览器的类型
	 * @param nav {Navigator}
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
			"safari": /Version\/(\d+(?:\.\d+)+) Safari\/(\d+(?:\.\d+)+)/, //Version/3.0.3 Safari/522.15.5
			"chrome": /Chrome\/(\d+(?:\.\d+)+) Safari\/(\d+(?:\.\d+)+)/,  //Chrome/0.2.149.27 Safari/525.13
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
		if(host.env == "unknown")
			runtime.log("[BorderLayout::getHostenv]未知的宿主环境，userAgent:" + nav.userAgent);
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
				if(this._domScript.nodeType == 1 && this._domScript.tagName == "SCRIPT")
					break;
			}
		}

		//配置信息
		var keys = [
			"src",
			"pathlib", "pathapp", "pathcss", "pathimg", "pathtpl", "pathplugin",
			"css", "lib", "plugin",
			"conf", "runmode", "skinid", "skin", "codeprovider", "autotest", "action"
		];
		for(var i = 0, len = keys.length; i < len; i++){
			var key = keys[i];
			var value = this._domScript.getAttribute(key);
			this._config[keys[i]] = value != null ? value : "";
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
						return "000".substr(0, 3 - no.length) + no;
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
	this._preLoadFile = function(ext, path, files){
		for(var i = 0, len = files.length; i < len; i++){
			var url = path + files[i];
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
	this.dynamicLoadFile = function(ext, path, files){
		for(var i = 0, len = files.length; i < len; i++){
			var url = path + files[i];
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
				loader.load(url, "", true);  //this.getUrlByName(libName)
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
				if(win.__main__flag && win.runtime)
					return true;
				else
					return false;
			case 2:  //对__main__flag赋值
				if(win.runtime)
					win.__main__flag = true;
				else
					throw new Exception("[WebAppRuntime::_testCrossDomainWindow]");
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
		this.pathImg   = this.pathLib + "src/";
		this.pathIcon  = this.pathLib + "src/icon/";
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
					if(a[i].specified)
						str += " " + a[i].name + '="' + a[i].value + '"';
				}
				if(!this.canHaveChildren)
					return str + " />";
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
				if(!b)
					this.preventDefault();
				return b;
			});*/
			_p.__defineSetter__("cancelBubble", function(b){
				if(b)
					this.stopPropagation();
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
				while(n.nodeType != 1)
					n = n.parentNode;
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
				while(res = result.iterateNext())
					found.push(res);
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
	this.addOnLoad = function(fun){
		this._funs.push(fun);
	};
	this.bindEventListener = function(obj, type, eventHandle){
		if(obj.attachEvent){
			obj.attachEvent("on" + type, eventHandle);
		}else if(obj.addEventListener){
			obj.addEventListener(type, eventHandle, false);
		}else{
			throw new Exception("[WebAppRuntime::bindEventListener]该浏览器无法对 DOM 元素绑定事件");
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
			if(this._win.attachEvent && this._doc.readyState != "complete")
				return;
		case "DOMContentLoaded":
			if(this._inited) return;
			this.onContentLoaded();
			//this.init();  //系统初始化
			//alert(runtime.getBrowser().getTestMode());
			break;
		case "unload":
			//try{  //屏蔽页面onunload时可能产生的错误
				this.dispose();
			//}catch(ex){
			//	this.log("[WebAppRuntime::dispose]exception");
			//}
			//if(application) application = null;
			break;
		case "resize":
			if(this.onResize)
				this.onResize(ev);
			break;
		/*
		case "contextmenu":
		case "mousedown":
		case "mousemove":
		case "mouseup":
		*/
		default:
			if(this._workspace && this._workspace.eventHandle)
				this._workspace.eventHandle(ev);
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
	this.getWindow = function(){return this._win;};
	this.setWindow = function(v){this._win = v;};
	this.getDocument = function(){return this._doc;};
	this.setDocument = function(v){this._doc = v;};
	this.getContext = function(){return this._context;};
	this.setContext = function(v){this._context = v;};
	/**
	 * 创建一个上下文环境对象
	 * @param name {String} 库名
	 * @param libs {String} 当前库依赖的库列表
	 * 每一个lib文件必然依赖于__init__.lib，所以libs参数中忽略了这个lib
	 */
	this.createContext = function(name, libs){
		//return this.getContext();
		if(name in this._contextList){
			throw new Exception("[WebAppRuntime::createContext]上下文环境 " + name + " 已经存在，请检查是否重名？");
		}
		var cxt = new Context(name, this);
		//cxt.__name = name;  //设置库的名称
		//cxt.runtime = this;    //保证 runtime 是全局唯一对象
		//默认导入所有已经加载的类（复制核心 context 引入的类到新建的 context 中）
		//[TODO]按照层层扩展机制，进行限定性引入
		/*
		for(var k in this._context.alz){
			if(!(k in cxt)){
				cxt[k] = this._context.alz[k];
			}
		}
		*/
		this._contextList[name] = cxt;  //注册上下文环境
		return cxt;
	};
	this.regLib = function(name, lib){
		if(name == "__init__"){
			this._contextList[name] = __context__;
			this.setContext(__context__);
			this.init();
		}else{
			if(this._libManager.exists(name)){
				this._win.alert("库(name=" + name + ")已经存在，请检查是否重名？");
				return;
			}
			this._libManager.reg(name, lib);
		}
	};
	/**
	 * @param libName {String} core|ui|...
	 */
	this.onLibLoad = function(libName){
		var lib = this._libManager.getLib(libName);
		if(lib){
			lib.init.apply(this);  //绑定在 runtime 对象上面，这是对runtime对象的一种扩展机制
			lib._inited = true;
		}else{  //找不到，则认为库已经加载完毕
			if(typeof this.onLoad == "function"){
				this.onLoad();
			}
			for(var i = 0, len = this._funs.length; i < len; i++){
				this._funs[i]();  //依次调用绑定的函数
			}
			if(this._appManager){
				this._appManager.init();  //初始化所有应用
			}
			//if(!this.ie)  //非 IE 在此时触发 resize
				this.eventHandle({type:"resize"});  //主动触发一次 resize 事件
			if(typeof this._win.onContentLoaded == "function"){
				this._win.onContentLoaded();
			}else if(this._win.__webpage__){
				new this._win.__webpage__().main();
			}
		}
		lib = null;
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
		scope.$get = function(id){return this.runtime.getComponentById(id);};
		scope.$init = function(ids){return this.runtime.initComponents(ids);};
		/*
		scope._alert = this.alert;
		scope.alert = function(msg){
			this._alert(msg);
			if(this.runtime)
				this.runtime.showInfo(msg);
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
		if(this._host.xul == true)
			return this._doc.documentElement.appendChild(obj);
		else
			return this._doc.body.appendChild(obj);
	};
	/**
	 * 检测当前浏览器，当前文档类型支持的盒模型
	 * @return number 盒模型的的数字标识
	 *         0 = 内缩的盒模型
	 *         1 = 外扩的盒模型
	 */
	this._testBoxModel = function(){
		if(!this._host.xul && !this._doc.body){
			throw new Exception("[WebAppRuntime::_testBoxModel]'document.body' have not ready now");
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
		this._testDiv.innerHTML = text;
		return {
			w: this._testDiv.offsetWidth,
			h: this._testDiv.offsetHeight
		};
	};
	this.getParentRuntime = function(){
		if(!this._parentRuntime){
			if(!this._win.parent)
				return null;
			if(this._win.parent == this._win)
				return null;
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
		if(this._host.xul)
			return this._doc.documentElement;
		else if(this.inGadget)
			return this._doc.body;
		else
			return this.getElement("body") || this._doc.body;
	};
	this.getUser = function(){
		if(this.getContext() && this.getContext().getUser)
			return this.getContext().getUser();
		else
			return this.getParentRuntime().getContext().getUser();
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
	 * @param url {String} 插件JS的URL地址
	 */
	this.loadPlugin = function(url){
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
		//if(this.ff)
		rect.w = Math.max(element.clientWidth, element.parentNode.clientWidth);
		rect.h = Math.max(element.clientHeight, element.parentNode.clientHeight);
		return rect;
	};
	/**
	 * 把一个JSON字符串解析为 json 对象，成功返回 json 对象，失败返回 null
	 * @param data {String} [JsonCode]符合 JSON 协议的 js 代码
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
	 * @param str {String} 要转换的字符串内容
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
	 * @param code {String} 模板的内容
	 */
	this.parseTemplate = function(code){
		var sBegin = "<" + "%", sEnd = "%" + ">";
		var sb = [];
		sb.push("function(){");
		sb.push("\nvar __sb = [];\n");
		var p1 = code.indexOf(sBegin);
		var p2 = -2;
		while(p1 != -1){
			if(p1 > p2 + 2)
				sb.push("__sb.push(\"" + this.toJsString(code.substring(p2 + 2, p1)) + "\");");
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
			}else
				return "模板中的'" + sBegin + "'与'" + sEnd + "'不匹配！";
			p1 = code.indexOf(sBegin, p2 + 2);
		}
		if(p2 != -2 && p2 + 2 < code.length)  //保存结束标志之后的代码
			sb.push("__sb.push(\"" + this.toJsString(code.substr(p2 + 2)) + "\");");
		sb.push("return __sb.join(\"\");");
		sb.push("\n}");
		return sb.join("");
		//return eval("(" + sb.join("\n") + ")")();
	};
});
/*#file end*/
/*#file begin=alz.core.LibManager.js*/
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
/*#file end*/
/*#file begin=alz.core.ScriptLoader.js*/
_package("alz.core");

_class("ScriptLoader", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._event = runtime.ie ? "onreadystatechange" : "onload";
		this._script = null;
		this._agent = null;
		this._fun = null;
	};
	this.create = function(agent, fun){
		this._agent = agent;
		this._fun = fun;
		var _this = this;
		var obj = runtime.getDocument().createElement("script");
		obj.type = "text/javascript";
		obj.charset = "utf-8";
		obj[this._event] = function(){
			//脚本如果缓存状态为 complete，否则为 loaded
			if(runtime.ie && !(this.readyState == "loaded" || this.readyState == "complete"))
				return;
			_this._fun.apply(_this._agent);
			_this.dispose();
		};
		this._script = obj;
		obj = null;
	};
	this.dispose = function(){
		this._fun = null;
		this._agent = null;
		this._script[this._event] = null;
		this._script = null;
		_super.dispose.apply(this);
	};
	this.load = function(url, data, skipcb){
		if(!skipcb){
			url = url + "?"
				+ "_cb_=0,runtime.ajax._data"  //0=(变量赋值，n=v),1=(函数回调，f(v))
				+ "&ts=" + new Date().getTime()
				+ (data ? "&" + data : "");
		}
		this._script.src = url;
		if(!this._script.parentNode){
			runtime._domScript.parentNode.appendChild(this._script/*, runtime._domScript*/);
		}
	};
});
/*#file end*/
/*#file begin=alz.core.LibLoader.js*/
_package("alz.core");

_import("alz.core.ScriptLoader");

_class("LibLoader", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._libs = [];
		this._libExt = ".lib.js";  //库文件默认的后缀名
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
	/**
	 * @param libs {String} 逗号分割的库名列表
	 * @param agent {WebAppRuntime}
	 * @param funName {String}
	 */
	this.init = function(libs, codeProvider, agent, funName){  //加载库代码
		this._libs = libs;
		this._codeProvider = codeProvider;
		this._agent = agent;
		this._funName = funName;
		this._start();
	};
	this._start = function(){
		var _this = this;
		runtime._win.setTimeout(function(){
			_this._loadLib();
		}, 10);
	};
	this.getUrlByName = function(name){
		/*
		var libUrl = "http://www.alzui.net/build/lib.php";
		if(name.substr(0, 1) != "#")
			return libUrl + "?lib=" + name;
		else
			return libUrl + "?lib=" + name.substr(1);
		*/
		var src;
		if(this._codeProvider != ""){
			src = this._codeProvider.replace(/\{libname\}/g, name.substr(0, 1) != "#" ? name : name.substr(1));
		}else{
			if(name.substr(0, 1) != "#")
				src = runtime.pathLib + name + this._libExt;  //内核扩展库
			else
				src = (runtime._config["pathapp"] || runtime.pathLib) + name.substr(1) + this._libExt;  //与版本相关的库
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
	this.loadLibScript = function(libName, agent, fun){
		var _this = this;
		if(runtime._host.xul){
			if(libName.substr(0, 1) == "#") libName = libName.substr(1);
			//<script type="text/javascript" src="/sinamail-dev/build/file.php?f=/rny/sinamail52/js/090731/{$libName}.lib.js"/>
			//var url = this.getUrlByName(libName);
			var url = "/sinamail-dev/build/file.php?f=/rny/sinamail52/js/090731/" + libName + ".lib.js";
			var http = new XMLHttpRequest();
			http.open("GET", url, false);
			http.onreadystatechange = function(){
				if(http.readyState != 4) return;
				if(http.status == 0 || (http.status >= 200 && http.status < 300)){
					var code = http.responseText;
					eval(code);
					if(agent)
						fun.call(agent, libName, runtime._libManager._hash[libName]);
					else
						_this._onLoad();
				}
				http.onreadystatechange = null;
			};
			http.send("");  //FF下面参数null不能省略
		}else{
			var loader = new ScriptLoader();
			loader.create(this, function(){
				if(agent)
					fun.call(agent, libName, runtime._libManager._hash[libName]);
				else
					this._onLoad();
			});
			loader.load(this.getUrlByName(libName), "", true);
			loader = null;
		}
	};
	this._onLoad = function(){
		var name = this._libs[this._index].replace(/#/g, "");
		var argv = [name, runtime._libManager._hash[name]];
		var fun = typeof this._funName == "function" ? this._funName : this._agent[this._funName];
		fun.apply(this._agent, argv);
		this._index++;
		if(this._index < this._libs.length){
			if(this._index == 1 && (name == "core" && runtime._conf["product"])){  //有产品配置的话，加载产品配置数据
				var loader = new ScriptLoader();
				loader.create(this, function(){
					this._start();
					loader = null;
				});
				loader.load(runtime._config["pathlib"] + runtime._conf["product"], "", true);
			}else{
				this._start();
			}
		}else{  //加载完毕
			fun.apply(this._agent);  //注意没有库名
		}
		fun = null;
	};
});
/*#file end*/
/*#file begin=alz.core.WebAppRuntime_init.js*/
_package("alz.core");

_extension("WebAppRuntime", function(){  //注册 WebAppRuntime 扩展
	//this._init = function(){};
	//this.dispose = function(){};
	this.addMethods = function(destination, source){
		for(var property in source){
			destination[property] = source[property];
		}
		return destination;
	};
	this.toArray = function(iterable){  //prototype $A 的实现代码
		if(!iterable) return [];
		if(iterable.toArray){
			return iterable.toArray();
		}else{
			var results = [];
			for(var i = 0, len = iterable.length; i < len; i++)
				results.push(iterable[i]);
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
		if(info) a.push(info);
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
		if(this._info)
			this._info.style.display = "none";
	};
});
/*#file end*/

runtime = new WebAppRuntime();
runtime.regLib("__init__", function(){  //加载之后的初始化工作

});

}})(this);