/**
 * 单文件框架库
 */
/**
 * alzui-mini JavaScript Framework, v__VERSION__
 * Copyright (c) 2009-2011 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
/*<file name="alz/util.js">*/
function $(id){
	return document.getElementById(id);
}
function $E(id){
	return document.getElementById(id);
}
/*</file>*/
(function(__global){  // Using a closure to keep global namespace clean.

//import alz.changelog;
/*<file name="alz/Profile.js">*/
/**
 * 性能剖析工具
 */
function Profile(){
	this._methods = {};     //统计类方法调用次数、执行时间等数据用的哈希
	this._callstack = [];   //模拟调用栈
	this._logLock = false;  //日志锁，决定是否输出日志
	this._log = false;      //日志开关
	this._list = null;
	this._hash = {};        //统计数据
	this._stack = [];
}
(function(){
	this.reset = function(){
		for(var k in this._hash){
			delete this._hash[k];
		}
		if(this._stack.length > 0){
			this._stack.splice(0, this._stack.length - 1);
		}
	};
	this.setLog = function(v){
		this._log = v;
		if(v){
			this.reset();
		}else{
			//[TODO]显示结果
			this._list = this.formatLogData();
			this.showLogData(this._list);
		}
	};
	this.formatLogData = function(){
		var arr = [];
		for(var k in this._hash){
			var v = this._hash[k];
			arr.push({
				"id"     : k,
				"count"  : v.count,
				"time"   : v.time,
				"avgTime": Math.round(v.time * 100 / v.count) / 100
			});
		}
		return arr;
	};
	this.sortField = function(arr, k){
		arr.sort(function(a, b){
			var ak = a[k];
			var bk = b[k];
			return -(ak > bk ? 1 : (ak < bk ? -1 : 0));
		});
	};
	this.showLogData = function(arr, key){
		this.sortField(arr, key);
		var sb = [];
		sb.push('<table>');
		sb.push('<tr><th>id</th><th>count</th><th>time</th><th>avgTime</th></tr>');
		for(var i = 0, len = arr.length; i < len; i++){
			var v = arr[i];
			sb.push('<tr>'
				+ '<td>' + v.id + '</td>'
				+ '<td class="num">' + v.count + '</td>'
				+ '<td class="num">' + v.time + '</td>'
				+ '<td class="num">' + v.avgTime + '</td>'
				+ '</tr>');
		}
		sb.push('</table>');
		var el = document.getElementById("total");
		el.innerHTML = sb.join("");
		var _this = this;
		var cells = el.getElementsByTagName("th");
		for(var i = 0, len = cells.length; i < len; i++){
			cells[i].onclick = function(){
				_this.showLogData(_this._list, this.innerHTML);
			};
		}
	};
	/**
	 * 骇客一个类，把其原型上的方法全部替换掉
	 * @param {Class} clazz 要剖析的类
	 * @param {Object} proto 类的原型
	 */
	this.hackClass = function(clazz, proto){
		for(var k in proto){
			var m = proto[k];
			if(k == "_clazz") continue;
			if(typeof m == "function" && !("__id" in m)){  //是方法且没有hack过
				var f = (function(_this){
					return function(){
						return _this.callMethod(this, arguments);
					};
				})(this);
				var id = clazz._className + "::" + k;  //方法名
				f.__id = id;
				proto[k] = f;  //替换掉原始方法
				this._methods[id] = {
					"id"    : id,
					"method": m,  //原始方法
					"mm"    : {}, //内部调用的其他方法
					"count" : 0,  //执行次数
					"time"  : 0   //累计执行时间
				};
			}
		}
	};
	var hash = {
		"alz.LibContext::_package"          : 0,
		"alz.LibContext::_import"           : 0,
		"alz.LibContext::_class"            : 0,
		"alz.LibContext::_extension"        : 0,
		"alz.core.WebRuntime::startTimer"   : 1,
		"alz.core.WebRuntime::addThread"    : 1,
		"alz.core.TaskSchedule::runloop"    : 1,
		"alz.core.TaskSchedule::checkThread": 1,
		"alz.core.WebRuntime::eventHandle"      : 1,
		"alz.mui.Workspace::eventHandle"        : 1,
		"alz.mui.Workspace::_mousemoveForNormal": 1,
		"alz.mui.Workspace::eventHandle"        : 1
	};
	/**
	 * 调用对象真实的方法，并正确传递参数
	 * @param {Object} obj 方法所属对象
	 * @param {Array} args 传给方法的参数数组
	 */
	this.callMethod = function(obj, args){
		var id = args.callee.__id;
		var need = this.needLog(id);
		var m = this._methods[id];
		var p;
		if(this._callstack.length > 0){
			p = this._callstack[this._callstack.length - 1];
			var mm = p.mm;
			if(id in mm){
				mm[id]++;
			}else{
				mm[id] = 1;
			}
		}
		var total, pp;
		if(need){
			if(!(id in this._hash)){
				total = this._hash[id] = {
					"count": 0,  //执行次数
					"time" : 0   //累计执行时间
				};
			}else{
				total = this._hash[id];
			}
			if(this._stack.length > 0){
				pp = this._stack[this._stack.length - 1];
			}
			this.logCall(id, args);  //输出调用日志
			this._stack.push(total);
		}
		this._callstack.push(m);
		m.count++;  //执行次数增量
		var t0 = new Date().getTime();
		var ret;
		try{
			ret = m.method.apply(obj, args);  //执行原始方法
		}catch(ex){
			window.alert(
				"method=" + id + ","
				+ "\nclassName=" + obj._className + ","
				+ "\nmessage=" + ex.message
			);
		}
		var t = new Date().getTime() - t0;
		m.time += t;  //累计执行时间
		if(p){
			p.time -= t;  //把对调用者的时间影响去掉
		}
		this._callstack.pop();
		if(need){
			var total;
			if(!(id in this._hash)){
				total = this._hash[id] = {
					"count": 0,  //执行次数
					"time" : 0   //累计执行时间
				};
			}else{
				total = this._hash[id];
			}
			total.count++;
			total.time += t;
			if(pp){
				pp.time -= t;  //把对调用者的时间影响去掉
			}
			this._stack.pop();
		}
		return ret;
	};
	this.sort = function(key){
		var a = [];
		for(var k in this._methods){
			a.push(this._methods[k]);
		}
		a.sort(function(a, b){
			return b[key] - a[key];
		});
		return a;
	};
	this.getData = function(key){
		var sb = [];
		var arr = this.sort(key);
		for(var i = 0, len = arr.length; i < len; i++){
			var a = arr[i];
			sb.push("{id:\"" + a.id + "\",count:" + a.count + ",time:" + a.time + "}");
		}
		return "[" + sb.join(",") + "]";
	};
	this.needLog = function(id){
		return window.runtime && !this._logLock && this._log && !(id in hash);
	};
	this.logCall = function(id, args){
		this._logLock = true;
		var sb = [];
		for(var i = 0, len = args.length; i < len; i++){
			sb.push(typeof args[i]);
		}
		runtime.log("call " + id + "(" + sb.join(",") + ")");
		this._logLock = false;
	};
}).apply(Profile.prototype);
/*</file>*/
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
var __empty = function(){};
if(!window.console){
	window.console = {
		log: __empty,
		warn: __empty,
		error: __empty
	};
}

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
function str2hash(str){
	var hash = {};
	var arr = str.split(",");
	for(var i = 0, len = arr.length; i < len; i++){
		hash[arr[i]] = true;
	}
	return hash;
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
				var from = idx === undefined ? 0 : (idx < 0 ? Math.max(0, this.length + idx) : idx);
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
			/**
			 * 移除数组中的第i个对象
			 */
			removeAt: function(i){
				this.splice(i, 1);
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
/*</file>*/
/*<file name="alz/Clazz.js">*/
//定义类
function Clazz(cxt, pkgName, className, superClass, superProto, classImp){
	if(typeof classImp !== "function"){
		console.log("error");
	}
	var fullName = __pkgName + "." + className;
	this._context    = cxt;         //类所属LibContext
	this._pkgName    = __pkgName;   //所属包名
	this._className  = className;   //类名
	this._fullName   = fullName;    //全名
	this._parent     = superClass.__cls__ || null;
	this._superClass = superClass;  //父类
	this._super      = superProto;  //父类原型
	var clazz = fullName == "alz.LibContext" ? LibContext : this.createClass();
	this._clazz      = clazz;           //当前类
	this._proto      = clazz[__proto];  //类原型
	this._classImp   = classImp;        //类的实现代码
	this._methods    = {};  //类的所有方法的meta数据(针对调用而优化)
	this._exts       = [];  //类的扩展代码
	this._imps       = [];  //类实现的接口
	this.init(this._clazz, this._proto);
}
(function(){
	//0=逆序,1=正序
	var __methods = {  //str2hash("_init,destroy,dispose,init,__conf__")
		"_init"   : 1,  //构造函数
		"destroy" : 0,  //析构函数(销毁)
		"dispose" : 0,  //组件UI废弃函数
		"init"    : 1,  //初始化函数
	//"__conf__": 1,  //配置数据注册方法
		"bind"    : 1,  //组件创建方法
		"build"   : 1,  //
		"create"  : 1,  //
		"rendered": 1
	};
	this.getClass = function(){
		return this._clazz;
	};
	this.getSuperClass = function(){
		return this._superClass;
	};
	//查找 _parent 链
	this.contains = function(clazz){
		for(var c = this; c; c = c._parent){
			if(c._clazz === clazz){
				return true;
			}
		}
		return false;
	};
	/**
	 * 创建并返回类的原型或者说类对象自身
	 */
	this.createClass = function(){
		//返回一个函数对象等价于创建一个Function实例，所以以后的模拟每个类的构造函数才
		//会是不同的function对象，如果使用相同的function对象OO模拟在继承时将存在致命的
		//问题，其他的像prototype,jQuery,mootools等，模拟OO的核心思想都和这里是一致的。
		//return new Function("this._init.apply(this, arguments);");  //anonymous code
		//"F" + new Date().getTime()
		var clazz = function(){
			//如果处于类声明过程中，直接返回，仅仅建立原型链，不需要调用实际的构造函数
			if(__inDeclare) return;

			//执行接口的构造函数
			//this.__cls__.callVMethods(this, "_init", arguments);

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
			//if(arguments.length != 0 && this.create){  //this._className.indexOf("alz.ui.") == 0
			//	this.create.apply(this, arguments);  //调用create方法并传递参数
			//}
		};
		__inDeclare = true;
		clazz[__proto] = new this._superClass();  //通过原型实现继承
		__inDeclare = false;
		return clazz;
	};
	//隐藏式方法
	this.init = function(clazz, proto){
		//类及属性定义(静态属性) ！！！类定义，非实例
		clazz.__cls__    = this;
		clazz._super     = this._super;  //绑定 _super 属性到类上面（Object[__proto]）
		clazz._className = this._fullName;

		//clazz.toString = function(){
		//	return "[class " + this._className + "]";
		//};

		//原型及属性定义（所有实例共享这些属性）
		proto.constructor = clazz;  //proto._init;  //初始化构造器
		if(!proto.__proto__){
			proto.__proto__ = proto;  //fixed for ie
		}
		proto._className = this._fullName;  //className
		proto._clazz = clazz;
		proto.__cls__ = this;

		//类绑定
		//保存起来便于管理
		__all__[this._fullName] = clazz;
		this._context.alz[this._className] = clazz;  //将类绑定到根包上面
		this._context.__classes__[this._fullName] = clazz;
		this._context.__context__[this._className] = clazz;  //绑定到当前上下文环境（作用域）之上
		//var rt = this._context.runtime;
		//rt._contextList[rt._name][this._className] = clazz;  //绑定到核心上下文环境之上
		//__global[this._className] = clazz;  //暴露到全局命名空间下

		//执行类的实现代码
		if(this._fullName !== "alz.LibContext"){
			this._classImp.apply(proto, [this._super, __super__]);  //function(_super){};  //初始化类对象
		}
		for(var i = 0, len = this._imps.length; i < len; i++){
			this.initVMethods(this._imps[i], "vlist");
		}
		if(typeof __profile !== "undefined"){
			__profile.hackClass(clazz, proto);
		}
	};
	function __super__(obj, name, args){
		obj.__cls__.callSuper(obj, name, args);
	}
	//调用父类同名方法的辅助函数
	this.callSuper = function(obj, name, args){
		var s = this._super;
		if(name == "_init"){  //构造函数
			/*
			var arr = [];
			for(var i = 2, len = arguments.length; i < len; i++){
				arr.push(arguments[i]);
			}
			*/
			var arr = Array[__proto].slice.call(arguments, 2);
			s[name].apply(obj, arr);
		}else{
			if(arguments.length == 2){
				s[name].apply(obj);
			}else{
				s[name].apply(obj, args);
			}
		}
	};
	//调用接口的同名方法
	this.callVMethods = function(obj, name, args){
		var imps = this._imps;
		for(var i = 0, len = imps.length; i < len; i++){
			imps[i][name].apply(obj, args);
		}
	};
	this.getProto = function(proto, k){
		for(var p = proto; p; p = p.__proto__){
			if(proto.hasOwnProperty(k)){
				return proto;
			}
		}
		return null;
	};
	this.createMethodMeta = function(name, proto){
		var pm;
		if(name in proto){
			if(typeof proto[name] !== "function"){
				console.log("error");
			}
			pm = proto[name];
		}else{
			pm = null;
		}
		proto[name] = this.createMethod(name, proto);  //创建虚函数
		return {  //方法元数据
			"name" : name,  //方法名
			"func"  : pm,    //原方法实体
			"vlist": [],    //虚方法表(before方式执行)
			"elist": []     //扩展方法表(after方式执行)
		};
	};
	this.initMeta0 = function(proto, k, m, key){
		var p = this.getProto(proto, k);
		if(p){
			p.__cls__.initMeta(p, k, m, key);
		}else{
			this.initMeta(proto, k, m, key);
		}
	};
	this.initMeta = function(proto, k, m, key){
		var meta;
		if(!(k in this._methods)){  //还没有创建虚函数
			meta = this.createMethodMeta(k, proto);
			this._methods[k] = meta;
		}else{
			meta = this._methods[k];
		}
		if(meta.func == null && key == "elist"){
			meta.func = m;  //第一个扩展可作为方法实体
		}else{
			meta[key].push(m);
		}
	};
	this.copyMethod = function(proto, k, m){
		if(proto.hasOwnProperty(k)){  //k in proto
			console.log("warning override method " + k);
		}
		proto[k] = m;  //直接拷贝覆盖
	};
	//初始化虚函数表
	this.initVMethods = function(obj, key, pre){
		var proto = this._proto;
		//[TODO]应该考虑父类方法问题
		for(var k in obj){
			var m = obj[k];
			if((pre && key == "vlist" || key != "vlist") && typeof m !== "function"){  //属性
				if(typeof proto[k] === "function"){
					console.log("error");
				}
				proto[k] = m;  //直接拷贝覆盖
			}else{
				var f = k in __methods;
				if(key == "vlist"){
					if(!pre && f){  //只针对关键方法虚函数化，用于提高性能
						this.initMeta0(proto, k, m, key);
					}else if(pre && !f){
						this.copyMethod(proto, k, m);
					}
				}else{
					if(f){  //只针对关键方法虚函数化，用于提高性能
						this.initMeta0(proto, k, m, key);
					}else{
						this.copyMethod(proto, k, m);
					}
				}
			}
		}
		/*
		for(var k in __methods){  //如果关键方法不存在，则补上，保证调用不出错
			if(!(k in obj)){
				obj[k] = __empty;
			}
		}
		//将普通方法(不在__methods内)拷贝到原型上面
		for(var k in obj){
			var m = obj[k];
			if(!(k in __methods)/ * && typeof m === "function"* /){
				proto[k] = m;
			}
		}
		*/
		/*
		if(exts.length == 0){  //如果还没有被扩展过，保存扩展之前原始的关键方法
			//重定义关键方法，保证能够顺利执行扩展的代码
			var ext = {};
			for(var k in __methods){
				if(k in proto){
					ext[k] = proto[k];
					proto[k] = this.createMethod(k, proto);
				}
			}
			exts.push(ext);
		}
		for(var k in obj){
			if(k in __methods) continue;  //忽略关键方法
			proto[k] = obj[k];  //其他的方法直接绑定到原型上
		}
		*/
	};
	//创建一个虚方法并返回
	this.createMethod = function(name, proto){
		var _this = this;
		var method = function(){
			return _this.callMethod(this, name, arguments);
		};
		method._proto = proto;
		return method;
	};
	/**
	 * 使用用特定的参数调用一个指定名称的方法
	 * @param {Object} obj 实例对象
	 * @param {String} name 方法名
	 * @param {Array} args 传给方法的参数
	 */
	this.callMethod = function(obj, name, args){
		var order = name in __methods ? __methods[name] : 1;
		//for(var clazz = obj.__cls__; clazz; clazz = clazz._parent){
			//if(!(name in clazz._methods)) continue;
			//var clazz = obj.__cls__;  //[TODO]有可能是子类实例
			var clazz = args.callee._proto.__cls__;
			if(!(name in clazz._methods)) return;
			var m = clazz._methods[name];
			var ret;
			if(m.func){
				ret = m.func.apply(obj, args);
			}
			var list = m.vlist;
			if(order === 0){  //逆序执行的扩展
				for(var i = list.length - 1; i >= 0; i--){
					list[i].apply(obj, args);
				}
			}else{  //正序执行的扩展
				for(var i = 0, len = list.length; i < len; i++){
					list[i].apply(obj, args);
				}
			}
			list = m.elist;
			if(order === 0){  //逆序执行的扩展
				for(var i = list.length - 1; i >= 0; i--){
					list[i].apply(obj, args);
				}
			}else{  //正序执行的扩展
				for(var i = 0, len = list.length; i < len; i++){
					list[i].apply(obj, args);
				}
			}
			return ret;
			/*
			//执行扩展
			var exts = clazz._exts;
			if(exts){
				if(order === 0){  //逆序执行的扩展
					for(var i = exts.length - 1; i >= 0; i--){
						var ext = exts[i];
						if(name in ext){
							ext[name].apply(obj, args);
						}
					}
				}else{  //正序执行的扩展
					for(var i = 0, len = exts.length; i < len; i++){
						var ext = exts[i];
						if(name in ext){
							ext[name].apply(obj, args);
						}
					}
				}
			}
			*/
		//}
	};
}).call(Clazz.prototype);
/*</file>*/
/*<file name="alz/LibContext.js">*/
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
_class("Context", null, function(_super, _event){
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
			if(typeof superClass === "string"){
				if(superClass === ""){
					superClass = this.__classes__["alz.lang.AObject"];
				}else{
					superClass = this.__context__[superClass];
				}
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
/*</file>*/

}(this)).regLib("aui", "", function(){with(arguments[0]){

/*<file name="alz/core/IConfigurable.js">*/
_package("alz.core");

/**
 * 接口: 可配置的
 */
_interface("IConfigurable", "", function(_property){
	/*
	 * 配置信息
	 */
	this.__conf = {
		"plugin": {},  //插件       格式: {id:s,clazz:s}
		"model" : {},  //数据模型   格式: {id:s,clazz:s}
		"taglib": {},  //标签库     格式: {id:s,clazz:s}
		"popup" : {},  //弹出式组件 格式: {id:s,clazz:s,tpl:s}
		"dialog": {},  //对话框组件 格式: {id:s,clazz:s,tpl:s}
		"pane"  : {}   //面板组件   格式: {id:s,clazz:s,tpl:s}
	};
	/**
	 * 注册配置数据
	 * @param {LibContext} cxt 上下文环境
	 * @param {Object} data 配置数据
	 */
	this.__conf__ = function(cxt, data){
		for(var k in data){
			var hash;
			if(!(k in this.__conf)){
				hash = this.__conf[k] = {};
			}else{
				hash = this.__conf[k];
			}
			for(var i = 0, len = data[k].length; i < len; i++){
				var item = data[k][i];
				var name = item.clazz;
				if(typeof name === "string"){
					if(name in cxt && typeof cxt[name] === "function"){
						item.clazz = cxt[name];
					}else{
						console.log("[IConfigurable::__conf__]clazz not found");
					}
				}
				hash[item.id] = item;
			}
		}
	};
	this.findConf = function(type, k){
		if(arguments.length == 1){
			return this.__conf[type];
		}else{
			var hash = this.__conf[type];
			return hash[k in hash ? k : type];  //默认值和type参数一直
		}
	};
});
/*</file>*/
/*<file name="alz/core/IMetaTable.js">*/
_package("alz.core");

/**
 * 元表接口
 */
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
 * @class AObject
 * @extends Object
 * @desc 根类 AObject
 */
_class("AObject", null, function(_super, _event){
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
/*</file>*/
/*<file name="alz/lang/Exception.js">*/
_package("alz.lang");

//import alz.native.Error;

/**
 * 异常基类
 */
//class Exception(Error){
_class("Exception", "", function(_super, _event){
	this._init = function(msg){
		_super._init.call(this);
		this._message = this._formatMsg(msg, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
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
/*<file name="alz/core/ManagerBase.js">*/
_package("alz.core");

/**
 * 管理者基类
 */
_class("ManagerBase", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._context = null;
		this._hash = {};
		this._list = [];
	};
	this.create = function(context){
		this._context = context;
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i] = null;
		}
		this._list.length = 0;
		for(var k in this._hash){
			this._hash[k].dispose();
			delete this._hash[k];
		}
		_super.dispose.apply(this);
	};
	this.getContext = function(){
		return this._context;
	};
	this.getItem = function(k){
		return this._hash[k];
	};
});
/*</file>*/
/*<file name="alz/core/EventBase.js">*/
_package("alz.core");

/**
 * 事件基类
 */
_class("EventBase", "", function(_super, _event){
	this._init = function(type, data){
		_super._init.call(this);
		this._type = type || "";
		if(data){
			for(var k in data){
				this[k] = data[k];
			}
		}
	};
	this.getType = function(){
		return this._type;
	};
});
/*</file>*/
/*<file name="alz/core/DataChangeEvent.js">*/
_package("alz.core");

_import("alz.core.EventBase");

/**
 * 数据变化事件
 */
_class("DataChangeEvent", EventBase, function(_super, _event){
	this._init = function(act, data){
		_super._init.call(this);
		this._type = "dataChange";
		this.act = act;
		this.data = data;
	};
});
/*</file>*/
/*<file name="alz/core/EventTarget.js">*/
_package("alz.core");

/**
 * @class EventTarget
 * @extends alz.lang.AObject
 * @desc DOM事件模型
 DOM Event Model
 《Document Object Model (DOM) Level 2 Events Specification》
 http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113
 * @example
var _dom = new DOMUtil();
 */
_class("EventTarget", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		/**
		 * 所有的事件响应函数都不与组件对象绑定，而是存储在这个映射表中
		 * [注意]不能将该属性放到原型属性里面去，不然两个对象会共享之
		 */
		this._eventMaps = {};  //事件映射表
		//this._listeners = {};
		this._listener = {};
		this._enableEvent = true;
		this._parent = null;  //组件所属的父组件
		this._disabled = false;
	};
	/**
	 * @method dispose
	 * @desc 析构方法
	 */
	this.dispose = function(){
		if(this._disposed) return;
		this._parent = null;
		for(var k in this._listener){
			delete this._listener[k];
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * @method setEnableEvent
	 * @param {Boolean} v
	 * @desc 设置是否禁用事件
	 */
	this.setEnableEvent = function(v){
		this._enableEvent = v;
	};
	/**
	 * @method getParent
	 * @return {Object}
	 * @desc 获取组件所属的父组件
	 */
	this.getParent = function(){
		return this._parent;
	};
	/**
	 * @method setParent
	 * @return {Object} v
	 * @desc 设置组件所属的父组件
	 */
	this.setParent = function(v){
		this._parent = v;
	};
	/**
	 * @method getDisabled
	 * @return {Boolean}
	 * @desc 不知道_disabled是什么东东
	 */
	this.getDisabled = function(){
		return this._disabled;
	};
	/**
	 * @method setDisabled
	 * @param {Boolean} v
	 * @desc 不知道_disabled是什么东东
	 */
	this.setDisabled = function(v){
		if(this._disabled == v) return;
		this._disabled = v;
	};
	/**
	 * @method addEventGroupListener
	 * @param {String} eventMap 事件名的序列，用,隔开，也可传入mouseevent或keyevent，这表示一个事件集
	 * @param {Function} listener 事件响应函数
	 * @desc 注册事件侦听器
	 */
	/*
	this.addEventListener1 =
	this.addEventGroupListener = function(eventMap, listener){
		if(eventMap == "mouseevent"){
			eventMap = "mousedown,mouseup,mousemove,mouseover,mouseout,click,dblclick";
		}else if(eventMap == "keyevent"){
			eventMap = "keydown,keypress,keypressup";
		}
		//var maps = eventMap.split(",");
		//for(var i = 0, len = maps.length; i < len; i++){
		if(this._self){
			for(var k in listener){
				if(!(k in this._listener)){
					this._self.addEventListener(k, function(ev){
						return this._ptr.fireEvent1(ev || runtime.getWindow().event);
					}, false);
				}
				this._listener[k] = listener[k];
			}
		}
	};
	*/
	this.fireEvent1 = function(ev){
		if(!this._enableEvent) return;
		//如果启用了事件相应机制，则触发事件
		var type = ev.type;
		//if(type == "mousedown") window.alert(121);
		var ret;
		for(var el = this._self; el; el = el.parentNode){
			var c = el._ptr;
			if(c && c._listener && type in c._listener){
				ret = c._listener[type].call(c, ev);
				break;
			}
		}
		return ret;
	};
	/**
	 * @method removeEventGroupListener
	 * @param {String} eventMap 事件名的序列，用,隔开，也可传入mouseevent或keyevent，这表示一个事件集
	 * @desc 移除事件侦听器
	 */
	/*
	this.removeEventListener1 =
	this.removeEventGroupListener = function(eventMap){
		if(eventMap == "mouseevent"){
			eventMap = "mousedown,mouseup,mousemove,mouseover,mouseout,click,dblclick";
		}else if(eventMap == "keyevent"){
			eventMap = "keydown,keypress,keypressup";
		}
		var maps = eventMap.split(",");
		for(var i = 0, len = maps.length; i < len; i++){
			if(this._self){
				//this._self.removeEventListener(maps[i], null, false);
			}
		}
		//this._listener = null;
	};
	*/
	/**
	 * 此方法允许在事件目标上注册事件侦听器。
	 * @java void addEventListener(String type, EventListener listener, boolean useCapture);
	 * [TODO]检查type的合法值
	 * [TODO]同一个事件响应函数不应该被绑定两次
	 * @method addEventListener
	 * @param {String} type 事件类型
	 * @param {Function} eventHandle 事件处理函数
	 * @param {Boolean} useCapture
	 * @desc 在EventTarget上注册事件侦听器
	 */
	this.addEventListener = function(type, eventHandle, useCapture){
		if(!this._eventMaps[type]){
			this._eventMaps[type] = [];  //[TODO]使用{}来模拟多个事件执行顺序的无关性
		}
		this._eventMaps[type].push(eventHandle);
	};
	/**
	 * @method removeEventListener
	 * @param {String} type 事件类型
	 * @param {Function} eventHandle 事件处理函数
	 * @param {Boolean} useCapture
	 * @desc 在EventTarget上移除事件侦听器
	 */
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
	this.addListener = function(type, agent, func){
		this.addEventListener(type, function(ev){
			return agent[func].call(agent, ev);
		}, false);
	};
	this.dispatchEvent = function(ev){
		var type = ev.type || ev.getType();
		var ret = true;
		for(var obj = this; obj; obj = obj.getParent()){  //默认事件传递顺序为有内向外
			if(obj.getDisabled()){
				ev.cancelBubble = true;
				ret = false;
				break;  //continue;
			}
			if(obj["on" + type]){  //如果组件的时间响应方法存在
				ret = obj["on" + type](ev);  //应该判断事件响应函数的返回值并做些工作
				if(ev.cancelBubble){
					return ret;  //如果禁止冒泡，则退出
				}
			}else{
				var map = obj._eventMaps[type];
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
			//try{
				switch(arguments.length){
				case 1: return this[name](ev);
				case 2: return this[name].apply(this, [ev].concat(argv));
				case 3: return this[name].apply(this, arguments);
				}
			//}catch(ex){  //屏蔽事件中的错误
			//	//runtime.showException(ex, "[" + this._className + "::onInit]");
			//	return false;
			//}
		}
	};
	/**
	 * @method getEvent
	 * @param {Event} ev 事件对象
	 * @return {Event}
	 * @desc 获取兼容的事件对象
	 */
	this.getEvent = function(ev){
		return ev || runtime.getWindow().event;
	};
	/**
	 * @method preventDefault
	 * @param {Event} ev 事件对象
	 * @desc 阻止默认行为
	 */
	this.preventDefault = function(ev){
		ev = this.getEvent(ev);
		if(ev.preventDefault) {
			ev.preventDefault();
		}else{
			ev.returnValue = false;
		}
	};
	/**
	 * @method stopPropagation
	 * @param {Event} ev 事件对象
	 * @desc 阻止事件流继续冒泡
	 */
	this.stopPropagation = function(ev){
		ev = this.getEvent(ev);
		if(ev.stopPropagation){
			ev.stopPropagation();
		}else{
			ev.cancelBubble = true;
		}
	};
	/**
	 * @method stopEvent
	 * @param {Event} ev 事件对象
	 * @desc 停止当前事件对象的一切活动
	 */
	this.stopEvent = function(ev){
		this.preventDefault(ev);
		this.stopPropagation(ev);
	};
});
/*</file>*/
/*<file name="alz/core/Plugin.js">*/
_package("alz.core");

_import("alz.core.EventTarget");

/**
 * 针对Application的插件基类
 */
_class("Plugin", EventTarget, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._app = null;  //插件所属的应用(Application)或管理者{PluginManager}
		this._id = "";     //插件的名字(ID标识)
	};
	this.create = function(id, app){
		this._app = app;
		this._id = id;
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
	this.getName =
	this.getId = function(){
		return this._id;
	};
	this.getApp = function(){
		return this._app;
	};
});
/*</file>*/
/*<file name="alz/core/PluginManager.js">*/
_package("alz.core");

_import("alz.core.ManagerBase");
_import("alz.core.Plugin");

/**
 * 插件管理者(面向WebRuntime,Application)
 */
_class("PluginManager", ManagerBase, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._plugins = {};
	};
	/*
	this.create = function(context){
		_super.create.apply(this, arguments);
	};
	*/
	this.create = function(target, data){
		for(var k in data){
			var plugin = new data[k].clazz();
			plugin.create(k, target);
			this.register(plugin);  //注册插件
			var name = "_" + k;
			if(name in target){
				console.log("[PluginManager::create]对象(class=" + target._className + "已经有属性:" + name);
			}
			target[name] = plugin;  //默认安装到runtime对象上面
		}
	};
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
		this._plugins[plugin.getId()] = plugin;
	};
	/**
	 * 通过名字获取一个已经注册的插件实例
	 */
	this.getPlugIn = function(id){
		return this._plugins[id];
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
/*<file name="alz/core/LibManager.js">*/
_package("alz.core");

_import("alz.core.ManagerBase");

_class("LibManager", ManagerBase, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._hash = {};
		this._libs = [];
		this._libExt = ".lib.js";  //库文件默认的后缀名
	};
	//this.create = function(context){_super.create.apply(this, arguments);};
	this.dispose = function(){
		if(this._disposed) return;
		//卸载库模块
		/*
		var arr = this._config["lib"].replace(/#/g, "").split(",");
		for(var i = 0, len = arr.length; i < len; i++){
			if(arr[i] == "") continue;
			this._libs[arr[i]].dispose.apply(this);
			delete this._libs[arr[i]];
		}
		*/
		for(var i = 0, len = this._libs.length; i < len; i++){
			this._libs[i] = null;
		}
		this._libs.length = 0;
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
_class("ScriptLoader", EventTarget, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._event = runtime.ie ? "onreadystatechange" : "onload";
		this._scripts = [];
		this._agent = null;
		this._func = null;
		this._urls = null;
		this._index = 0;
	};
	this.create = function(agent, func){
		this._agent = agent;
		this._func = func;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._func = null;
		this._agent = null;
		for(var i = 0, len = this._scripts.length; i < len; i++){
			this._scripts[i][this._event] = null;
			this._scripts[i] = null;
		}
		this._scripts.length = 0;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.createScript = function(parent, url){
		var _this = this;
		var el = runtime.getDocument().createElement("script");
		el.type = "text/javascript";
		el.charset = "utf-8";
		el[this._event] = function(){
			//脚本如果缓存状态为 complete，否则为 loaded
			if(runtime.ie && !(this.readyState == "loaded" || this.readyState == "complete")){
				return;
			}
			_this.fireEvent({type: "load"});
		};
		el.src = url;
		this._scripts.push(el);
		parent.appendChild(el);
		return el;
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
			this._func.apply(this._agent);
			this.dispose();
		}else{
			this.createScript(runtime._domScript.parentNode, this._urls[this._index++]);
		}
	};
});
/*</file>*/
/*<file name="alz/core/IframeLoader.js">*/
_package("alz.core");

/**
 * 使用IFRAME工作的json数据加载器
 */
_class("IframeLoader", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._event = runtime.ie ? "onreadystatechange" : "onload";
		this._win = window;
		this._doc = this._win.document;
		this._self = null;
		this._name = "";
		this.loaded = 0;//加载状态：0-未开始，1-正在加载，2-加载完成
	};
	this.create = function(parent, name, agent, func){
		this._name = name;
		this._agent = agent;
		this._func = func;
		var _this = this;
		var firstLoad = true;
		var el = this._doc.createElement("iframe");
		el.id = name;
		el.name = name;
		el.style.display = "none";
		el[this._event] = function(){
			if(runtime.ie && !(this.readyState == "loaded" || this.readyState == "complete")){
				return;
			}
			_this.loaded = 2;
			if(firstLoad){
				firstLoad = false;
				try{  //FF下面报错
					this.contentWindow.name = name;
				}catch(ex){
				}
				return;
			}
			var json;
			try{
				var doc = this.contentDocument || this.contentWindow.document;
				var jsonHTML = doc.body.innerHTML;
				if(jsonHTML == ""){
					json = {"result":false,"errno":1,"msg":"服务器内部错误","data":null};
				}else if(/^\{.*\}$/.test(jsonHTML)){
					json = runtime.parseJson(jsonHTML);
				}else{
					json = null;  //runtime.parseJson(doc.body.innerHTML)
				}
			}catch(ex){
				//_this._win.alert("通信失败！\n原因：" + runtime.forIn(ex).join("\n"));
				json = null;
			}
			if(typeof _this._func == "function"){
				_this._func.apply(_this._agent, [json]);
			}else{
				_this._agent[_this._func](json);
			}
			//_this.dispose();
		};
		el.src = "about:blank";
		this._self = parent.appendChild(el);
		return el;
	};
	this.reset = function(){
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._func = null;
		this._agent = null;
		if(this._self.parentNode){
			this._self.parentNode.removeChild(this._self);
		}
		this._self[this._event] = null;
		this._self = null;
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/core/LibLoader.js">*/
_package("alz.core");

_import("alz.core.ScriptLoader");

/**
 * FileLoader
 * 文件加载引擎，使用script或者link加载js和css文件
 * 其中js文件的种类包括(conf,lib,tpl)
 */
_class("LibLoader", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._libs = [];
		this._fileExt = ".js";  //库文件默认的后缀名
		this._codeProvider = "";
		this._appConf = null;
		this._index = 0;
		this._agent = null;
		this._func = "";
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._agent = null;
		this._libs.length = 0;
		this._appConf = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * @param {String} libs 逗号分割的库名列表
	 * @param {String|Object} codeProvider|appConf
	 * @param {WebRuntime} agent
	 * @param {String} func
	 * 回调函数参数格式：func(lib, libConf, loaded)
	 * lib     = 库文件名信息
	 * libConf = 库配置信息
	 * loaded  = 资源请求队列是否加载完毕
	 */
	this.init = function(libs, codeProvider, agent, func){  //加载库代码
		for(var i = 0, len = libs.length; i < len; i++){
			var lib = libs[i];
			if(typeof lib == "string"){
				if(lib == "") continue;
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
		if(typeof codeProvider == "string"){
			this._codeProvider = codeProvider;
		}else{
			this._appConf = codeProvider;
		}
		this._agent = agent;
		this._func = func;
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
				path = runtime._pathLib;  //内核扩展库
			}else{  //从应用目录下加载库文件
				path = this._appConf ? this._appConf.pathlib : (runtime.getConfigData("pathapp") || runtime._pathLib);  //具体应用库
			}
			src = path + lib.name + "." + lib.type + this._fileExt;
		}
		return src;
	};
	this._loadLib = function(){
		if(this._index >= this._libs.length){  //如果没有库代码，则直接执行回调
			var argv = [null, null, true];  //注意没有库名
			var func = typeof this._func == "function" ? this._func : this._agent[this._func];
			func.apply(this._agent, argv);
			return;
		}
		//var url = runtime._pathLib + libs[i] + ".lib.js";
		//this._doc.write('<script type="text/javascript" src="' + url + '" charset="utf-8"></script>');
		this.loadLibScript(this._libs[this._index]);
	};
	this.loadLibScript = function(lib, agent, func){
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
						func.apply(agent, [lib, _this.getLibConf(lib), false]);
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
					func.apply(agent, [lib, this.getLibConf(lib), false]);
				}else{
					this._onLoad();
				}
			});
			loader.load([this.getUrlByName(lib)], "", true);
		}
	};
	this._onLoad = function(){
		var lib = this._libs[this._index];
		//var name = lib.name.replace(/#/g, "");
		var argv = [lib, this.getLibConf(lib), false];
		var func = typeof this._func == "function" ? this._func : this._agent[this._func];
		func.apply(this._agent, argv);
		this._index++;
		if(this._index < this._libs.length){
			if(this._index == 1 && (lib.name == "core" && runtime.getConfData("product"))){  //有产品配置的话，加载产品配置数据
				var loader = new ScriptLoader();
				loader.create(this, function(){
					this._start();  //加载完毕，再开始加载剩余的库文件
				});
				loader.load([runtime.getConfigData("pathlib") + runtime.getConfData("product")], "", true);
			}else{
				this._start();
			}
		}else{  //加载完毕
			argv[2] = true;  //表示加载完毕
			func.apply(this._agent, argv);
		}
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
/*<file name="alz/core/ThreadPool.js">*/
_package("alz.core");

_import("alz.core.Plugin");

/**
 * 伪线程池，线程调度管理器
 */
_class("ThreadPool", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._suspend = false;  //是否暂停整个运行时环境
		this._tid = 1;          //线程唯一编号
		this._hash = {};        //模拟线程池(哈希表)
	};
	this.dispose = function(){
		for(var k in this._hash){
			this._hash[k].func = null;
			this._hash[k].agent = null;
			//this._hash[k].dispose();
			delete this._hash[k];
		}
		_super.dispose.apply(this);
	};
	/**
	 * 创建并启动一个线程
	 * @param {Number} msec 启动延迟时间
	 * @param {Object} agent 代理对象
	 * @param {Function|String} func 匿名函数或者代理对象的方法名
	 * @param {Boolean} system 是否系统级线程
	 * @return {Number} 定时器id
	 */
	this._createThread = function(msec, agent, func, system){
		var f = typeof func == "string" ? agent[func] : func;
		//var cbid = runtime._task.add(agent, func);
		var thread = {
		//"cbid"    : cbid,        //回调任务编号
			"id"      : this._tid++, //线程编号
			"system"  : system || false,  //是否系统级线程
			"type"    : "",          //类型
			"status"  : "wait",      //状态(wait|ready|done|cancel|quit) -- 和任务对象的状态保持一致，方便以后实现统一
			"agent"   : agent,       //代理对象
			"func"    : f,           //要执行的代码
			"timer"   : 0,           //定时器句柄
			"msec"    : msec,        //时间间隔
			"time_add": new Date().getTime()  //当前时间
		};
		this._hash[thread.id] = thread;
		if(!this._suspend || system){
			this._start(thread);
		}
		return thread;
	};
	/**
	 * 暂停所有线程的执行
	 */
	this.suspend = function(){
		if(this._suspend) return false;
		this._suspend = true;
		//暂停池子里还没有执行的线程
		for(var k in this._hash){
			var thread = this._hash[k];
			if(thread.timer != 0){
				window.clearTimeout(thread.timer);
				thread.timer = 0;
			}
		}
		return true;
	};
	/**
	 * 恢复所有线程的执行
	 */
	this.resume = function(){
		if(!this._suspend) return false;
		this._suspend = false;
		//恢复池子里暂停的线程
		for(var k in this._hash){
			var thread = this._hash[k];
			switch(thread.status){
			case "ready":
				this.run(thread);
				break;
			case "wait":
			default:
				this._start(thread);
				break;
			}
			//delete this._hash[k];
		}
		return true;
	};
	/**
	 * 启动一个线程
	 */
	this._start = function(thread){
		var _this = this;
		thread.status = "wait";
		thread.timer = window.setTimeout(function(){
			thread.status = "ready";
			if(!_this._suspend || thread.system){
				_this.run(thread);
			}
		}, thread.msec);
	};
	/**
	 * 重新启动一个线程
	 */
	this._restart = function(thread){
		this._start(thread);
	};
	/**
	 * 停止一个线程
	 */
	this._stop = function(thread, reserve){
		thread.status = "done";
		if(!reserve){
			delete this._hash[thread.id];  //移除
		}
		if(thread.timer != 0){
			window.clearTimeout(thread.timer);
			thread.timer = 0;
			return true;
		}
		return false;
	};
	/**
	 * 运行一个线程
	 */
	this.run = function(thread){
		var ret;
		if(runtime.getConfData("core_shield")){
			try{
				ret = thread.func.apply(thread.agent);
				//ret = runtime._task.execute(thread.cbid);
			}catch(ex){
				runtime.log("[ThreadPool::startTimer*]" + ex.message);
				runtime.getActiveApp().showOperationFailed();  //[TODO]不一定是APP的错误
			}
		}else{
			ret = thread.func.apply(thread.agent);
			//ret = runtime._task.execute(thread.cbid);
		}
		if(ret === true){
			this._restart(thread);  //重新启动
		}else{
			this._stop(thread);
		}
	};
	/**
	 * 重启一个线程(停止&启动)
	 */
	this.restart = function(tid){
		if(tid in this._hash){
			var thread = this._hash[tid];
			this._stop(thread, true);
			this._start(thread);
		}
	};
	/**
	 * 启动一个定时器
	 * [TODO]msec == 0时，是不是需要特别考虑一下
	 * @param {Number} msec 启动延迟时间(毫秒)
	 * @param {Object} agent 代理对象
	 * @param {Function|String} func 匿名函数或者代理对象的方法名
	 * @param {Boolean} system 是否系统级线程
	 * @return {Number} 定时器id
	 */
	this.startThread = function(msec, agent, func, system){
		return this._createThread(msec, agent, func, system).id;
	};
	/**
	 * 停止一个定时器
	 */
	this.stopThread = function(tid){
		if(tid <= 0 || tid >= this._tid){  //tid超出正常范围
			console.error("[ThreadPool::stopThread]tid=" + tid);
			return false;
		}
		if(tid in this._hash){
			return this._stop(this._hash[tid]);
		}
		return false;
	};
});
/*</file>*/
/*<file name="alz/core/Task.js">*/
_package("alz.core");

/**
 * 一个任务对象
 * 一个任务的状态：
 * wait
 * ready  done
 * cancel quit
 */
_class("Task", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._parent = null;
		this.id         = 0;       //任务编号
		this.type       = "";      //任务类型(event=事件响应任务)
		this.status     = "wait";  //任务状态(wait|ready|done|cancel|quit|hold=保留)
		this.dependence = [];      //任务依赖的其他任务
		this.agent      = null;    //代理对象
		this.func       = null;    //回调函数
		this.args       = [];      //回调传递的参数
		this.ret        = null;    //返回结果（临时存储地）
		this.time_add   = 0;       //添加时间戳
		this.time_begin = 0;       //开始执行时间戳
		this.time_end   = 0;       //结束执行时间戳

		this.total_count = 0;      //累积执行次数
		this.total_time  = 0;      //累积执行时间
	//this.waitfor    = [];      //依赖的其他cbid(当其他的回调执行完毕，当前的回调才会执行)
	};
	this.create = function(parent, id, agent, func, args, type){
		this._parent = parent;
		this.id = id;
		this.agent = agent;
		this.func = func;
		if(args) this.args = args;
		if(type) this.type = type;
		this.time_add = new Date().getTime();
	};
	this.dispose = function(){
		this.ret = null;
		this.args.length = 0;
		this.func = null;
		this.agent = null;
		this._parent = null;
		_super.dispose.apply(this);
	};
	this.setStatus = function(v){
		//runtime.log("[Task::setStatus]" + v + "(" + this.id + ")");
		if(this.status == v) return;
		this.status = v;
	};
	this.invoke = function(args){
		var ret;
		if(this.status != "wait" && this.status != "ready" && this.status != "hold"){
			console.log("invoke----", this);
		}
		var argv = args ? args.concat(this.args) : this.args;
		var result = true;
		for(var i = 0, len = this.dependence.length; i < len; i++){
			result = result && this._parent.execute(this.dependence[i], argv);
		}
		if(result){  //所有依赖任务成功，才执行当前任务
			if(runtime.getConfData("core_shield")){
				try{
					this.time_begin = new Date().getTime();
					ret = this.func.apply(this.agent, argv);
					this.time_end = new Date().getTime();
				}catch(ex){
					runtime.error("[Task::invoke]" + ex.message);
					runtime.getActiveApp().showOperationFailed();  //[TODO]不一定是APP的错误
				}
			}else{
				this.time_begin = new Date().getTime();
				ret = this.func.apply(this.agent, argv);
				this.time_end = new Date().getTime();
			}
			this.total_count++;  //执行次数
			this.total_time += this.time_end - this.time_begin;  //执行时间
		}else{
			ret = false;
		}
		if(this.type == "event" || this.status == "hold"){  //保留事件响应型和明确指定保留状态的任务
			this.status = "wait";
		}else{
			this.status = "done";  //标识回调已经执行完毕
		}
		return ret;
	};
});
/*</file>*/
/*<file name="alz/core/TaskSchedule.js">*/
_package("alz.core");

_import("alz.core.Task");
_import("alz.core.Plugin");

/**
 * 任务调度器
 * 单个JS操作花费的总时间（最大值）不应该超过100毫秒。——摘自《高性能JavaScript》
 */
_class("TaskSchedule", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._status = "free";   //调度循环的状态(free|planned|running)
		this._tid = 1;           //任务唯一编号
		this._hash = {};         //待执行任务列表(数据请求的回调队列){agent,func}
		this._undoHash = {};     //需要要处理的任务列表
		//this._undoQueue = [];  //未完成任务队列
		//this._stack = [];      //当前任务栈
	};
	this.create = function(name, app){
		_super.create.apply(this, arguments);
		//这是全局第一个定时器
		runtime.startTimer(60, this, function(){
			//if(this._undoHash.length > 0){  //有任务才检查
				this.checkThread();
			//}
			return true;
		});
	};
	this.dispose = function(){
		//this._stack 应该为空
		//this._undoHash 应该为空
		/*
		for(var i = 0, len = this._undoQueue.length; i < len; i++){
			this._undoQueue[i] = null;
		}
		this._undoQueue.length = 0;
		*/
		for(var k in this._hash){
			this._hash[k].dispose();
			delete this._hash[k];
		}
		_super.dispose.apply(this);
	};
	/* *
	 * 添加一条任务
	 */
	/*
	this.addTask = function(type, agent, func){
		this._undoQueue.push({
			"type"  : type,    //任务类型
			"status": "wait",  //状态(wait,done)
			"agent" : agent,   //代理对象
			"func"  : func     //回调函数
		});
	};
	*/
	/* *
	 * 运行任务调度算法
	 */
	/*
	this.run = function(type){
		var tasks = [];
		for(var i = 0, len = this._undoQueue.length; i < len; i++){
			var task = this._undoQueue[i];
			if(task.type == type && task.status == "wait"){
				tasks.push(task);  //[TODO]需要从队列中移除
			}
		}
		for(var i = 0, len = tasks.length; i < len; i++){
			var task = tasks[i];
			task.func.apply(task.agent);
			task.setStatus("done");
		}
		if(this._undoQueue.length >= 20){  //延迟批量清理策略
			var i = 0;
			while(i < this._undoQueue.length){
				var task = this._undoQueue[i];
				if(task.type == type && (task.status == "done" || task.status == "quit")){
					this._undoQueue.splice(i, 1);
				}else{
					i++;
				}
			}
		}
	};
	*/
	//this.addWaitFor = function(){
	//};
	/**
	 * 添加一个任务依赖的其他任务
	 * @param {Number} tid
	 * @param {Object} agent
	 * @param {Function|String} func
	 */
	this.addDependence = function(tid, agent, func){
		var tid2 = this.add(agent, func);
		this._hash[tid].dependence.push(tid2);
	};
	/**
	 * 添加一个任务
	 */
	this.add = function(agent, func, args, type){
		var tid;
		switch(typeof agent){
		case "number":  //tid
			return agent;
			//tid = agent;
			//break;
		case "object":
			switch(typeof func){
			case "function": /*func = func;*/break;
			case "string"  :
				if(agent === null){
					runtime.error("[TaskSchedule::add]param type error(agent === null)");
				}
				func = agent[func];
				break;
			default:
				runtime.error("[TaskSchedule::add]param type error(func)");
				break;
			}
			tid = this._tid++;
			break;
		case "function":
			func = agent;
			agent = null;
			tid = this._tid++;
			break;
		case "undefined":
		default:
			runtime.error("[TaskSchedule::add]param type error (agent)");
			break;
		}
		//this.addTask("", agent, func);
		var task = new Task();
		task.create(this, tid, agent, func, args, type);
		this._hash[tid] = task;
		return tid;
	};
	/**
	 * 移除一个任务
	 */
	this.remove = function(tid){
		if(!(tid in this._hash)){
			console.log("----error");
		}
		if(tid in this._undoHash){
			console.log("####error");
		}
		this._hash[tid].dispose();
		delete this._hash[tid];
	};
	/**
	 * 执行一个任务
	 */
	this.execute = function(tid, args){
		var task = this._hash[tid];
		var ret = task.invoke(args);  //task.staus = "done";
		if(task.type != "event"){
			this.addUndo(tid, task);
			this.checkThread();
		}
		return ret;
	};
	this.addUndo = function(tid, task){
		if(tid in this._undoHash) return;
		this._undoHash[tid] = task;
	};
	/**
	 * 向任务发送所需数据(状态会变更为ready)
	 */
	this.send = function(tid, data, isArray){
		//console.log("send " + tid);
		var task = this._hash[tid];
		if(task.status != "wait" && task.status != "hold"){
			console.log("[TaskSchedule::send]task status error(task.status=" + task.status + ")");
		}
		if(isArray){
			for(var i = 0, len = data.length; i < len; i++){
				task.args.push(data[i]);
			}
			//task.ret = data instanceof Array ? data : [data];
		}else{
			task.ret = data;
		}
		task.setStatus("ready");
		this.addUndo(tid, task);
	};
	/**
	 * 任务准备就绪
	 */
	this.ready = function(tid){
		//console.log("ready " + tid);
		var task = this._hash[tid];
		task.setStatus("ready");
		this.addUndo(tid, task);
	};
	/**
	 * 取消任务
	 */
	this.cancel = function(tid){
		//console.log("cancel " + tid);
		var task = this._hash[tid];
		task.setStatus("cancel");
		this.addUndo(tid, task);
	};
	/**
	 * 完成任务
	 */
	this.done = function(tid){
		//console.log("done " + tid);
		this._hash[tid].setStatus("done");
	};
	/**
	 * 保留一个任务
	 */
	this.hold = function(tid){
		var task = this._hash[tid];
		task.setStatus("hold");
		for(var i = 0, len = task.dependence.length; i < len; i++){
			this.hold(task.dependence[i]);
		}
	};
	this.checkThread = function(){
		switch(this._status){
		case "free":
			//if(this._undoHash.length > 0){  //有任务才启动执行计划
				runtime.startTimer(0, this, "runloop");
				this._status = "planned";
			//}
			break;
		case "planned":
		case "running":
			break;
		}
	};
	/**
	 * 检查栈顶任务是否已有返回值？
	 */
	this.runloop = function(){
		this._status = "running";
		var hash = this._undoHash;
		this._undoHash = {};
		for(var tid in hash){
			//if(!(tid in this._hash)){
			//	console.log("error=" + tid);
			//	continue;
			//}
			var task = hash[tid];
			switch(task.status){
			case "cancel":
				task.time_begin =
				task.time_end = new Date();
				task.setStatus("quit");  //放弃
				this.remove(tid);
				break;
			case "ready":
				task.invoke(task.ret ? [task.ret] : []);
				task.ret = null;
				if(task.status != "wait"){  //有可能被保留下来
					this.remove(tid);
				}
				break;
			case "quit":
			case "done":
				this.remove(tid);
				break;
			case "wait":
			case "hold":
				break;
			default:
				console.log("[warning]runloop status error(" + task.status + ")");
				break;
			}
			delete hash[tid];
		}
		/*
		for(var tid in this._undoHash){
			console.log("====" + tid);
		}
		*/
		this._status = "free";
		/*
		if(window.__deck){
			var visible = false;
			for(var k in __deck._hash){
				if(__deck._hash[k].getVisible()){
					visible = true;
				}
			}
			if(!visible){
				console.log("visible==false");
			}
		}
		*/
	};
	/*
	//检查栈顶任务是否已有返回值？
	this.runloop = function(){
		this._status = "running";
		var exit = false;
		while(this._stack.length > 0 && !exit){
			var task = this.top();
			switch(task.status){
			case "cancel":
				this.pop();
				task.time_begin =
				task.time_end = new Date();
				task.setStatus("quit");  //放弃
				break;
			case "ready":
				this.pop();  //提前出栈，放置后面的流程有压栈动作
				task.invoke(task.ret ? [task.ret] : []);
				task.ret = null;
				break;
			case "quit":
			case "done":
				this.pop();
				break;
			case "wait":
			default:
				exit = true;  //退出
				if(task.status != "wait"){
					console.log("[warning]runloop status error(" + task.status + ")");
				}
				break;
			}
		}
		this._status = "free";
	};
	this.top = function(){
		return this._stack[this._stack.length - 1];
	};
	this.pop = function(){
		//console.log("pop " + this.top().id);
		return this._stack.pop();
	};
	//任务压栈
	this.pushtask = function(agent, func, args){
		var tid;
		if(typeof agent == "number"){  //要和顶部的任务一致才行
			tid = agent;
		}else{
			tid = this.add(agent, func, args);
			//console.log("pushtask " + tid);
			this._stack.push(this._hash[tid]);  //任务压栈
		}
		return tid;
	};
	/ **
	 * 遇到错误结果时，任务出栈
	 * /
	this.poptask = function(tid, data){
		var task = this.top();
		if(task.id == tid){
			this.pop();  //提前出栈，放置后面的流程有压栈动作
			if(task.status == "cancel"){  //已经取消的任务，放弃处理
				task.time_begin =
				task.time_end = new Date();
				task.setStatus("quit");  //放弃
			}else if(task.status == "done"){
			}else{
				task.invoke(data ? [data] : []);
			}
			this.checkThread();
		}else{
			//console.log("[poptask]error");
		}
	};
	//取消栈顶任务
	this.cancelTop = function(){
		if(this._stack.length > 0){
			var task = this.top();
			task.setStatus("cancel");
			return task.id;
		}
	};
	this.begin = function(){
	};
	this.end = function(){
	};
	*/
});
/*</file>*/
/*<file name="alz/core/TableIndex.js">*/
_package("alz.core");

_import("alz.core.EventTarget");
_import("alz.core.DataChangeEvent");

/**
 * 数据表索引对象
 */
_class("TableIndex", EventTarget, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._table = null;  //所属数据表
		this._pkey = "";     //表的主键
		this._asc = "+";  //排序顺序(+:正序,-:逆序)
		this._key = "";  //排序字段
		this._sortFunc = null;  //排序函数
		this._list = null;  //列表数据
	};
	this.create = function(table, key){
		this._table = table;
		this._pkey = this._table.getPrimaryKey();
		var asc = key.charAt(0);
		this._asc = asc == "-" ? "-" : "+";
		this._key = asc == "+" || asc == "-" ? key.substr(1) : key;
		this._sortFunc = this.genSortFunc(this._asc, this._key);
		var arr;
		if(this._asc == "+" && this._key == this._pkey){
			arr = [];
		}else{
			var list = this._table.getList();
			if(list && list.length > 0){
				arr = list.slice(0);  //正序主键索引就是主索引
				arr.sort(this._sortFunc);
			}else{
				arr = [];
			}
		}
		this._list = arr;
	};
	this.dispose = function(){
		this._list = null;
		this._sortFunc = null;
		//this._key = "";
		//this._asc = "";
		this._table = null;
		_super.dispose.apply(this);
	};
	this.getList = function(){
		return this._list;
	};
	this.genSortFunc = function(asc, k){
		var p = this._pkey;
		function sort_p0(a, b){  //主索引使用的比较方法
			var ak = a[p], bk = b[p];
			return ak > bk ? 1 : (ak < bk ? -1 : 0);
		}
		function sort_p1(a, b){
			var ak = a[p], bk = b[p];
			return ak < bk ? 1 : (ak > bk ? -1 : 0);
		}
		if(asc == "+"){  //正序
			return k == p ? sort_p0 : function(a, b){  //其他索引使用的比较方法
				var ak = a[k], bk = b[k];
				return ak > bk ? 1 : (ak < bk ? -1 : sort_p0(a, b));
			};
		}else{  //逆序
			return k == p ? sort_p1 : function(a, b){
				var ak = a[k], bk = b[k];
				return ak < bk ? 1 : (ak > bk ? -1 : sort_p1(a, b));
			};
		}
	};
	/**
	 * 从排序后的数组中使用二分法查找一条记录
	 * @param {Array} list 排过序的数组
	 * @param {Object} item 要查找的记录
	 * @param {Function} func 记录比较函数
	 * @param {String} k 要比较的记录的字段
	 */
	this.binaryFind = function(list, item, func, k){
		if(list.length == 0) return 0;
		var low = 0;
		var high = list.length - 1;
		while(low <= high){
			var mid = Math.floor((low + high) / 2);
			var v = func(list[mid], item, k);
			if(v == 0){
				return mid;
			}
			if(v == 1){
				if(low == high || low == high - 1){  //受floor影响，必须考虑low == high - 1的情况
					return mid;
				}
				high = mid - 1;
			}else{  //v == -1
				if(low == high){
					return mid + 1;
				}
				low = mid + 1;
			}
		}
		return -1;
	};
	this.dumpId = function(){
		var a = [];
		for(var i = 0, len = this._list.length; i < len; i++){
			a.push(this._list[i][this._pkey]);
		}
		console.log(a);
	};
	/**
	 * 更新一个索引对象
	 */
	this.updateIndex = function(act, item){
		//console.log("updateIndex(" + act + "," + item[this._pkey]);
		//二分法查找效率更高
		//var n = this._list.indexOf(item);  //[TODO]记录在主索引中的位置
		var n = this.binaryFind(this._list, item, this._sortFunc, this._key);
		switch(act){
		case "add":
			if(n == -1){
				runtime.error("[TableIndex::updateIndex(add)]error");
			}else if(n >= 0 && n < this._list.length){
				if(this._list[n] === item){
					runtime.error("[TableIndex::updateIndex(add)]数据表存在相等记录");
				}
				this._list.splice(n, 0, item);  //插入记录
			}else{  //n >= this._list.length
				this._list.push(item);
			}
			//this.dumpId();
			//[TODO]怎么传递视图组件中添加记录的位置？
			var ev = new DataChangeEvent(this._table.getId() + "_add", item);
			ev.pos = n;
			this.dispatchEvent(ev);
			break;
		case "mod":
			if(n == -1 || n >= this._list.length){
				runtime.error("[TableIndex::updateIndex(mod)]error");
			}else{  //n >= 0 && n < this._list.length
				//console.log("[TODO]更新索引");
				this.dispatchEvent(new DataChangeEvent(this._table.getId() + "_mod", item));
			}
			break;
		case "del":
			if(n == -1 || n >= this._list.length){
				runtime.error("[TableIndex::updateIndex(del)]error");
			}else{  //n >= 0 && n < this._list.length
				this.dispatchEvent(new DataChangeEvent(this._table.getId() + "_del", item));
				this._list.splice(n, 1);  //删除记录
			}
			break;
		}
	};
	this.dispatchExistRecords = function(){
		for(var i = 0, len = this._list.length; i < len; i++){
			var ev = new DataChangeEvent(this._table.getId() + "_add", this._list[i]);
			ev.pos = i;
			this.dispatchEvent(ev);
		}
	};
	this.getRecordPos = function(id){
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i][this._pkey] == id){
				return i;
			}
		}
		return -1;
	};
});
/*</file>*/
/*<file name="alz/core/TableFilter.js">*/
_package("alz.core");

_import("alz.core.TableIndex");

/**
 * 数据表过滤器对象
 */
_class("TableFilter", TableIndex, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/core/MetaTable.js">*/
_package("alz.core");

_import("alz.core.EventTarget");
_import("alz.core.TableIndex");
_import("alz.core.TableFilter");
_import("alz.core.DataChangeEvent");

/**
 * 元数据表
 */
_class("MetaTable", EventTarget, function(_super, _event){
	this._init = function(pid){
		_super._init.call(this);
	//this._parent = null;
	//this._listeners = [];     //数据监听组件列表
		this._conf = null;        //配置信息
		this._id = "";            //数据表ID标识
		this._primaryKey = pid || "id";  //主键
		this._hash = {};          //(哈希表)数据列表
		this._list = null;        //数据数组(当含有排序信息后，可以当作主索引使用)
		this._hashIndex = {};     //索引哈希(每个元素是一个TableIndex对象)
		this._filters = {};       //过滤器及过滤器对应的结果
		this._maxId = 0;          //最大ID
	};
	this.create = function(parent, id, path){
		var index = this.createIndex("+" + this._primaryKey);
		this._list = index.getList();  //主索引
		this._parent = parent;
		this._id = id;
		this._path = path;
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var k in this._filters){
			this._filters[k] = null;
			delete this._filters[k];
		}
		for(var k in this._hashIndex){
			this._hashIndex[k].dispose();
			delete this._hashIndex[k];
		}
		/*
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i] = null;
		}
		*/
		this._list = null;
		for(var k in this._hash){
			delete this._hash[k];
		}
		//this._parent = null;
		_super.dispose.apply(this);
	};
	this.exists = function(id){
		return id in this._hash;
	};
	this.setConf = function(v){
		this._conf = v;
	};
	this.getId = function(){
		return this._id;
	};
	this.getPrimaryKey = function(){
		return this._primaryKey;
	};
	this.getMaxId = function(){
		return this._maxId;
	};
	this.getLength = function(){
		return this._list.length;
	};
	this.getItem = function(id){
		return this._hash[id];
	};
	this.getList = function(){
		return this._list;
	};
	this.getListByFilter = function(filter){
		var arr = [];
		for(var i = 0, len = this._list.length; i < len; i++){
			var item = this._list[i];
			if(filter(item)){
				arr.push(item);
			}
		}
		return arr;
	};
	this.getIndex2 = function(key){
		if(key in this._hashIndex){
			return this._hashIndex[key];
		}else{
			return this.createIndex(key);
		}
	};
	/**
	 * 创建一个索引
	 * @param {String} 要索引的key
	 * @return {TableIndex}
	 */
	this.createIndex = function(key){
		var ti = new TableIndex();
		ti.create(this, key);
		this._hashIndex[key] = ti;
		return ti;
	};
	/**
	 * 创建一个过滤器
	 * @param {String} key 排序的字段
	 * @param {Function} filter 过滤器函数
	 * @return {TableFilter}
	 */
	this.createFilter = function(key, filter){
		var tf = new TableFilter();
		tf.create(this, key, filter);
		this._filters[key] = tf;
		return tf;
	};
	this._insertIndex = function(item){
		var key = this._primaryKey;
		var id = item[key];
		var list = this._list;
		for(var i = 0, len = list.length; i < len; i++){
			if(list[i][key] > id){
				return i;
			}
		}
		return list.length;
	};
	//在有序表R[1..n]中进行二分查找，成功时返回结点的位置，失败时返回零
	this.binSearch = function(K, start, end){
		var R = this._list;
		var key = this._primaryKey;
		var low = start || 0;
		var high = end || R.length - 1;
		if(R.length == 0) return 0;
		if(low == high){
			return K < R[low][key] ? low : low + 1;
		}else{
			if(K < R[low][key]) return low;
			if(K > R[high][key]) return high + 1;
			var mid;  //置当前查找区间上、下界的初值
			while(low <= high){  //当前查找区间R[low..high]非空
				mid = Math.floor((low + high) / 2);
				if(K == R[mid][key]){
					//alert("[MetaTable::binSearch]error");
					return mid;  //查找成功返回
				}
				if(K < R[mid][key]){
					if(mid == low){
						return mid;
					}
					//high = mid - 1;  //继续在R[low..mid-1]中查找
					high = mid;
				}else{
					if(mid == low){
						return mid + 1;
					}
					//low = mid + 1;  //继续在R[mid+1..high]中查找
					low = mid;
				}
			}
		}
		return 0;  //当low>high时表示查找区间为空，查找失败
	};
	this._append = function(item){
		var key = this._primaryKey;
		var id = item[key];
		if(id in this._hash) return null;
		this._hash[id] = item;
		//插入元素到对应的位置
		//var n = this._insertIndex(item);
		var n = this.binSearch(id);
		if(n == 0){
			this._list.unshift(item);
		}else if(n >= this._list.length){
			this._list.push(item);
		}else{
			var arr0 = this._list.slice(0, n);
			var arr1 = this._list.slice(n);
			this._list = arr0.concat(item, arr1);
		}
		return item;
	};
	/**
	 * 添加一条记录
	 */
	this.append = function(item){
		var ret = this._append(item);
		if(ret){
			/*
			var ev = new Event("ItemAdd");
			ev.data = ret;
			this.dispatchEvent(ev);
			*/
		}
		return ret;
	};
	/**
	 * 添加N条记录
	 */
	this.appends = function(items){
		var arr = [];
		for(var i = 0, len = items.length; i < len; i++){
			var ret = this._append(items[i]);
			if(ret){
				arr.push(ret);
			}
		}
		if(arr.length > 0){
			/*
			var ev = new Event("ItemsAdd");
			ev.data = arr;
			this.dispatchEvent(ev);
			*/
		}
	};
	/**
	 * 更新一条记录
	 */
	/**
	 * 删除N条记录
	 * @param ids {Array}
	 */
	this.deleteRecords = function(ids){
		for(var i = 0, len = ids.length; i < len; i++){
			this.deleteRecord(ids[i]);
		}
	};
	this.pop = function(){
		var item = this._list.pop();
		delete this._hash[item[this._primaryKey]];
		return item;
	};
	this.dump = function(){
		var sb = [];
		for(var i = 0, len = this._list.length; i < len; i++){
			sb.push(this._list[i][this._primaryKey]);
		}
		return sb;
	};
	/**
	 * 执行回调函数
	 * @param {Number} cbid 回调函数编号
	 * @param {JsonObject} data 传递给回调函数的参数
	 */
	this.callback = function(cbid, data){
		runtime._task.execute(cbid, [data]);
	};
	/**
	 * 添加一条记录
	 */
	this.insertRecord = function(data, list){
		var id = data[this._primaryKey];
		if(/^\d+$/.test(id)){
			id = data[this._primaryKey] = parseInt(id);  //默认主键数字型
		}
		//1)保证主键(id)唯一性
		if(id in this._hash){  //如果已经存在，忽略
			runtime.warning("新增记录(type=" + this._id + ")已经存在id=" + id);
		}else{  //新增
			var item = data;  //runtime.clone(data);
			if(id > this._maxId){
				this._maxId = id;
			}
			this._hash[id] = item;  //2)存储到hash中
			//3)更新主索引和其他索引
			//var n = this.insertPos(this._list, item, this._primaryKey);
			for(var k in this._hashIndex){
				this._hashIndex[k].updateIndex("add", item);
			}
			//[TODO]4)更新过滤器
			if(list){  //批量添加忽略数据监听
				//this._list.push(item);
				list.push(item);
			}else{
				this.dispatchEvent(new DataChangeEvent(this._id + "_add", item));
			}
		}
		/* for test
		function dump(list){
			var sb = [];
			for(var i = 0, len = list.length; i < len; i++){
				sb.push(list[i][this._primaryKey]);
			}
			runtime.log(sb.join(","));
		}
		dump(this._list);
		*/
		return this._hash[id];
	};
	/**
	 * 添加N条记录
	 */
	this.insertRecords = function(data){
		var list = [];
		for(var i = 0, len = data.length; i < len; i++){
			var record = data[i];
			this.insertRecord(record, list);
		}
		/* for test
		var n = 0;
		for(var i = 0, len = data.length; i < len;){
			if(n % 2 == 1){
				this.insertRecord(data[i], list);
				i++;
			}else{
				this.insertRecord(data[len - 1], list);
				len--;
			}
			n++;
		}
		*/
		this.dispatchEvent(new DataChangeEvent(this._id + "_adds", list));
	};
});
/*</file>*/
/*<file name="alz/core/DataModel.js">*/
_package("alz.core");

_import("alz.core.Plugin");

_class("DataModel", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._path = "";
		//[TODO]针对联系人按照手机号码建立一个hash映射
		this._models = {};  //数据模型对象，所有数据模型的哈希表
		this._hash = {};  //model_conf哈希存储
		this._conf = null;  //键值对数据
	};
	this.create = function(name, app, data){
		//_super.create.apply(this, arguments);
		this._app = app;
		this._path = app._pathRoot;
	};
	this.dispose = function(){
		/*
		for(var k in this._conf){
			delete this._conf[k];
		}
		*/
		this._conf = null;
		for(var k in this._hash){
			delete this._hash[k];
		}
		for(var k in this._models){
			this._models[k].dispose();
			delete this._models[k];
		}
		this._app = null;
		_super.dispose.apply(this);
	};
	this.regModels = function(models){
		for(var k in models){
			this.regModel(models[k]);
		}
	};
	this.regModel = function(m){
		var id = m.id;
		var model = new m.clazz();
		model.setConf(m);
		model.create(this, id, m.path);
		this._models[id] = model;
		this._hash[id] = m;
	};
	this.getModel = function(key){
		return this._models[key];
	};
	this.getModelClass = function(key){
		return this._hash[key].clazz;
	};
	this.getConfData = function(key){
		return this._conf ? this._conf[key] : null;
	};
	this.setConfData = function(key, value){
		this._conf[key] = value;
	};
	this.getCache = function(key){
		var data = this.getConfData(key);
		if(data && (data.expire == -1 || new Date().getTime() <= data.expire || !this._app.isNetAvailable())){
			return data.value;
		}else{
			return null;
		}
	};
	this.setCache = function(key, value, expire){
		this._conf[key] = {
			"value" : value,
			"expire": typeof expire == "number" ? new Date().getTime() + expire : -1
		};
	};
	this.getConf = function(){
		return this._conf;
	};
	this.setConf = function(v){
		this._conf = v;
	};
	this.netInvoke = function(){
		this._app.netInvoke.apply(this._app, arguments);
	};
	this.checkJsonData = function(json, silent){
		return this._app.checkJsonData(json, silent);
	};
	/**
	 * 执行回调函数
	 * @param {Number} cbid 回调函数编号
	 * @param {JsonObject} data 传递给回调函数的参数
	 */
	this.callback = function(cbid, data){
		runtime._task.execute(cbid, [data]);
	};
	/**
	 * 数据调用接口
	 * @param {String} cmd 命令
	 * @param {Object} params 调用参数(__args是特殊参数，不传递给服务器)
	 * @param {Object} agent 代理对象
	 * @param {Function|String} func 回调函数
	 */
	this.dataInvoke = function(cmd, params, agent, func){
		var cbid;
		if("__args" in params){
			cbid = runtime._task.add(agent, func, params["__args"]);
			delete params["__args"];
		}else{
			cbid = runtime._task.add(agent, func);
		}
		var name = "di_" + cmd;
		if(name in this){
			this[name](cmd, params, cbid);
		}else{
			var type = cmd.split("_")[0];
			if(type in this._models){
				var model = this._models[type];
				if(name in model){
					model[name](cmd, params, cbid);
				}else{
					runtime.error("[TODO]数据调用接口" + name + "尚未实现");
				}
			}else{
				runtime.error("[TODO]数据接口调用时没有找到对应的模型" + type);
			}
		}
	};
});
/*</file>*/
/*<file name="alz/template/TemplateElement.js">*/
_package("alz.template");

/**
 * 通过模板创建的DOM元素(可以包含子节点)
 */
_class("TemplateElement", "", function(_super, _event){
	var RE_TVAR = /\{\$(\w+)\}/g;  //模板变量语法
	this._init = function(){
		_super._init.call(this);
		this._tpldoc = null;  //所属文档对象
		this._tplobj = null;  //元素创建时参照的模板对象
		this._confStack = null;  //TagConf堆栈
		this._component = null;  //对应的组件实例
		this._self = null;    //关联的DOM元素
		this._container = null;
		this._vars = {};    //所有的模板变量(key关联DOM更新信息)
		this._attributes = null;
		this._hash = null;  //批量更新临时存储
	};
	/**
	 * [TODO]存在子类化问题
	 * panemain 继承自 pane 组件，所以 pane 需要使用 PaneMain 类来实例化
	 */
	this.create = function(tpldoc, tagConf, xmlNode, clazz){
		var tplobj = tagConf.tplobj;
		var tagName = xmlNode.tagName;
		this._confStack = tpldoc.getStack(tagConf);
		this._tpldoc = tpldoc;
		this._tplobj = tplobj;
		this._attributes = tpldoc.getAttrs(xmlNode);
		tplobj.regTplEl(this);  //注册模板元素
		clazz = clazz || tagConf.getClass(xmlNode.getAttribute("clazz"));
		var el = tpldoc.createElementByXmlNode(this, tplobj.getRoot(), this._confStack, {
			"xmlnode": xmlNode,
			"clazz": clazz,
			"tplel": clazz ? this : null
		});
		tpldoc._node.appendChild(el);
		this.init(el);
		this.update(this._attributes);  //应用attributes
		if(clazz){
			//console.log("build <" + tagName + "> " + clazz.__cls__._fullName);
			var c = new clazz();
			if(c.setApp) c.setApp(tpldoc._app);
			c.build(this);
			this._component = c;
		}
		return el;
	};
	this.init = function(el){
		el._ptr = this;
		this._self = el;
	};
	this.dispose = function(){
		this._hash = null;
		this._attributes = null;
		for(var k in this._vars){
			var v = this._vars[k];
			var refs = v.refs;
			for(var i = 0, len = refs.length; i < len; i++){
				var ref = refs[i];
				ref.el = null;  //断开DOM元素的引用关系
				ref.val = null;
				refs[i] = null;
			}
			v.refs = null;
			v.value = "";
			delete this._vars[k];
		}
		this._tplobj = null;
		this._self._ptr = null;
		this._self = null;
		this._component = null;
		this._confStack = null;
		this._tpldoc = null;
		_super.dispose.apply(this);
	};
	this.getTplObj = function(){
		return this._tplobj;
	};
	this.setTplObj = function(v){
		this._tplobj = v;
	};
	this.getTplDoc = function(){
		return this._tpldoc;
	};
	this.onAttr = function(type, el, name, value){
		this._tplobj.onAttr(this, type, el, name, value);
	};
	/**
	 * 添加一个模板变量引用
	 * [TO-DO]如何区分不用实例的模板变量引用
	 */
	this.addRef = function(name, ref){
		if(!(name in this._vars)){
			this._vars[name] = {  //{TplVarRef}
				"id"   : name,  //变量名
				"value": "",    //变量值(默认字符串类型)
				"refs" : []     //引用该变量的节点列表
			};
		}
		this._vars[name].refs.push(ref);
		//this._tplobj.addRef(name, ref);
	};
	this.updateBegin = function(){
		this._hash = {};
	};
	this.add = function(key, value){
		this._hash[key] = value;
	};
	this.updateEnd = function(){
		this.update(this._hash);
		this._hash = null;
	};
	/**
	 * 更新一组模版变量的值
	 */
	this.update = function(attributes){
		for(var k in attributes){
			var v = attributes[k];
			if(k in this._vars){
				this._setVar(k, v, attributes);
			}else{
				//console.log("[TemplateElement::update]有多余字段" + k);
			}
		}
	};
	/**
	 * 更新一个模版变量的值
	 */
	this._setVar = function(key, value, attributes){
		var v = this._vars[key];
		v.value = value;  //[TODO]需要检查和原值是否相等，避免重复更新
		var refs = v.refs;
		for(var i = 0, len = refs.length; i < len; i++){
			var ref = refs[i];
			switch(ref.type){
			case "attr":  //属性值
				ref.el.setAttribute(ref.name, this._calcValue(ref.val, attributes));
				break;
			case "text":  //文本节点
				ref.el.nodeValue = this._calcValue(ref.val, attributes);
				break;
			case "style":  //css属性值
				ref.el.style[ref.name] = this._calcCssValue(ref, attributes);
				break;
			}
		}
	};
	this._calcValue = function(val, attributes){
		return val.value.replace(RE_TVAR, function(_0, key){
			return attributes[key];
		});
	};
	this._calcCssValue = function(ref, attributes){
		return ref.val.value.replace(RE_TVAR, function(_0, key){
			var value = attributes[key];
			switch(typeof value){
			case "boolean":
				switch(ref.name){
				case "display": value = value ? "" : "none";
				}
				break;
			}
			return value;
		});
	};
});
/*</file>*/
/*<file name="alz/template/TplDocument.js">*/
_package("alz.template");

/**
 * 基于模板的文档对象
 */
_class("TplDocument", "", function(_super, _event){
	function str2hash(str, sep){
		var hash = {};
		var arr = str.split(sep || ",");
		for(var i = 0, len = arr.length; i < len; i++){
			hash[arr[i]] = true;
		}
		return hash;
	}
	this._htmlTags = str2hash("a,-address,-applet,-area,"
		+ "b,-base,-basefont,-bgsound,-big,blockquote,-body,-br,button,"
		+ "caption,-center,cite,code,-col,-colgroup,-comment,"
		+ "dd,-dfn,-dir,div,dl,dt,"
		+ "em,-embed,"
		+ "fieldset,-font,form,-frame,-frameset,"
		+ "h1,h2,h3,h4,h5,h6,-head,-hr,-html,"
		+ "i,-iframe,img,input,"
		+ "-kbd,"
		+ "label,legend,li,-link,-listing,"
		+ "-map,-marquee,-menu,-meta,"
		+ "-nobr,-noframes,-noscript,"
		+ "-object,ol,option,"
		+ "p,-param,-plaintext,pre,"
		+ "-s,-samp,-script,select,-small,span,-strike,strong,-style,sub,sup,"
		+ "table,tbody,td,textarea,tfoot,th,thead,-title,tr,-tt,"
		+ "u,ul,"
		+ "-var,-wbr,-xmp"
	);
	this._init = function(parent, app){
		this._app = app || null;
		this._doc = document;
		this._stack = [parent];
		this._node = parent;
		this._all = {};
	};
	this.dispose = function(){
		for(var k in this._all){
			delete this._all[k];
		}
		this._node = null;
		if(this._stack.length != 0){
			runtime.log("[TplDocument::dispose]this._stack.length != 0");
		}
		this._doc = null;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.getActiveNode = function(){
		return this._node;
	};
	this.push = function(v){
		this._stack.push(v);
		this._node = v;
	};
	this.pop = function(){
		this._stack.pop();
		this._node = this._stack[this._stack.length - 1];
	};
	this.$ = function(id){
		return id in this._all ? (this._all[id]._component ? this._all[id]._component : this._all[id]) : null;
	};
	this.createElement = function(tag){
		if(tag == undefined){
			console.log("[TplDocument::createElement]" + tag);
		}
		return this._doc.createElement(tag);
	};
	this.createTextNode = function(data){
		return this._doc.createTextNode(data);
	};
	this.createCDATASection = function(data){
		return this._doc.createCDATASection(data);
	};
	this.createComment = function(data){
		return this._doc.createComment(data);
	};
	/*
	this.render = function(parent, attributes){
		return this.createTplElement(...);
	};
	*/
	this.getAttrs = function(xmlnode){
		var attributes = {};
		var attrs = xmlnode.attributes;
		for(var i = 0, len = attrs.length; i < len; i++){
			var attr = attrs[i];
			var name = attr.nodeName;
			var value = attr.nodeValue;
			attributes[name] = value;
		}
		return attributes;
	};
	this.getAttrsList = function(stack){
		var attributes = {};
		for(var i = stack.length - 1; i >= 0; i--){
			var attrs = stack[i].tplobj.getRoot().attributes;
			for(var j = 0, len1 = attrs.length; j < len1; j++){
				var attr = attrs[j];
				var name = attr.nodeName;
				var value = attr.nodeValue;
				attributes[name] = value;
			}
		}
		return attributes;
	};
	this.createTplElement2 = function(parent, tpl, argv){
		var template = this._app.getTpl(tpl);
		var tag = template.tplobj._tag;
		var conf = this._app._taglib.getTagConf(tag);
		if(!conf){
			console.error("[TplDocument::createTplElement2]tag error(" + tag + ")");
			return null;
		}
		if(parent.getContainer){
			parent = parent.getContainer();
		}
		this.push(parent);  //设置当前父节点
		var tplEl = this.createTplElement(conf, template.tplobj.getRoot(), argv);
		this.pop();
		return tplEl;
	};
	this.createTplElement = function(tagConf, xmlNode, argv){
		var tplEl = new TemplateElement();
		tplEl.create(this, tagConf, xmlNode);
		var c = tplEl._component;
		if(argv && c){
			c.create2.apply(c, argv);
			c.init(c._self);
			if(c.rendered){
				c.rendered();
			}
		}
		return tplEl;
	};
	this.createAdvTag = function(tagConf, xmlNode){
		var tplEl = this.createTplElement(tagConf, xmlNode);
		var attributes = tplEl._attributes;  //id,class,dock
		if(attributes.id){
			this._all[attributes.id] = tplEl;  //注册TplElement
			tplEl._self.setAttribute("id", attributes.id);
		}
		if(attributes["class"]){
			runtime.dom.addClass(tplEl._container, attributes["class"]);
		}
		return tplEl;
	};
	this.createHtmlTag = function(tagName, xmlnode, attrs, tplEl){
		var tmpEl = {  //临时的假的TplElement对象
			"_component": null,
			"_self"     : null,
			"_container": null
		};
		var node = tmpEl._container = this.createElement(tagName);
		for(var k in attrs){
			var value = attrs[k];
			if(tplEl){  //如果需要细化属性内容？
				if(k == "container" && value == "true"){
					tplEl._container = node;
					continue;
				}
				switch(k){
				case "_datasrc":
				case "_action":
				case "_tag":
				default:
					tplEl.onAttr("attr", node, k, value);
					if(k == "style"){
						var hash = tplEl.getTplObj().parseStyle(value);
						for(var k in hash){
							node.style[k] = hash[k];
						}
					}else{
						node.setAttribute(k, value);
					}
					break;
				}
			}else{
				node.setAttribute(k, value);
			}
		}
		tmpEl._self = this._node.appendChild(node);
		return tmpEl;
	};
	this.createNode = function(tplEl, xmlnode, stack, proto){
		var tmpEl;
		if(stack && stack.length > 1){
			var node = stack[stack.length - 1].tplobj.getRoot();
			var attrs = this.getAttrsList(stack);
			tmpEl = this.createHtmlTag(node.tagName, node, attrs, tplEl);
			//遍历原型子节点
			if(xmlnode.hasChildNodes()){
				this.push(tmpEl._container);
				var nodes = xmlnode.childNodes;
				for(var i = 0, len = nodes.length; i < len; i++){
					this.createElementByXmlNode(tplEl, nodes[i]);
				}
				this.pop();
			}
		}else{
			var tagName = xmlnode.tagName;
			var conf = this._app._taglib.getTagConf(tagName);
			if(conf){
				tmpEl = this.createAdvTag(conf, xmlnode, {
					"proto"  : proto,
					"clazz"  : proto ? proto.clazz : null
				});
			}else if(tagName in this._htmlTags){
				var attrs = this.getAttrs(xmlnode);
				tmpEl = this.createHtmlTag(tagName, xmlnode, attrs, tplEl);
				//遍历原型子节点
				if(xmlnode.hasChildNodes()){
					this.push(tmpEl._container);
					var nodes = xmlnode.childNodes;
					for(var i = 0, len = nodes.length; i < len; i++){
						this.createElementByXmlNode(tplEl, nodes[i]);
					}
					this.pop();
				}
			}else{
				console.error("---- unknown tag " + tagName);
			}
		}
		//此时当前TplElement已创建完毕
		//遍历实例子节点
		if(proto && proto.xmlnode.hasChildNodes()){
			this.push(tplEl._container);
			var nodes = proto.xmlnode.childNodes;
			for(var i = 0, len = nodes.length; i < len; i++){
				this.createElementByXmlNode(tplEl, nodes[i]);
			}
			this.pop();
		}
		if(tmpEl._component && tmpEl._component.rendered){
			tmpEl._component.rendered();
		}
		return tmpEl._self;
	};
	this.createElementByXmlNode = function(tplEl, xmlnode, stack, proto){
		var node;
		switch(xmlnode.nodeType){
		case 1:  //NODE_ELEMENT
			node = this.createNode(tplEl, xmlnode, stack, proto);
			break;
		case 3:  //NODE_TEXT
			var value = xmlnode.nodeValue;
			node = this.createTextNode(value);
			if(tplEl){
				tplEl.onAttr("text", node, "", value);
			}
			this._node.appendChild(node);
			break;
		case 4:  //NODE_CDATA_SECTION
			var value = xmlnode.data;
			node = this.createCDATASection(value);
			/*
			if(tplEl){
				tplEl.onAttr("cdata", node, "", value);
			}
			*/
			this._node.appendChild(node);
			break;
		case 8:  //NODE_COMMENT
			//var value = xmlnode.data;
			//node = this.createComment(value);
			/*
			if(tplEl){
				tplEl.onAttr("comment", node, "", value);
			}
			*/
			//this._node.appendChild(node);
			break;
		default:
			//runtime.warning("无法处理的nodeType" + xmlnode.nodeType + "\n");
			break;
		}
		return node;
	};
	this.getStack = function(tagconf){
		var stack = [];
		var conf = tagconf;
		for(;;){
			stack.push(conf);
			if(conf.tag in this._htmlTags) break;  //找到html标签则退出
			conf = this._app._taglib.getTagConf(conf.tag);
		}
		return stack;
	};
});
/*</file>*/
/*<file name="alz/template/TemplateObject.js">*/
_package("alz.template");

_import("alz.template.TemplateElement");
_import("alz.template.TplDocument");

/**
 * 一个模板文件或者文件片段的封装对象
 * 1)支持xml语法
 * 2)支持模板变量
 * 3)支持数据绑定
 * 4)支持数据动态更新
 */
_class("TemplateObject", "", function(_super, _event){
	/*
	function TplVar(){  //模板变量
	}
	function TplValue(){  //模板值
	}
	function TplRef(){  //模板引用
	}
	*/
	var RE_TVAR = /\{\$(\w+)\}/g;  //模板变量语法
	this._hashTag = {"meta": 1, "link": 1, "img": 1, "input": 1, "br": 1};
	this._init = function(){
		_super._init.call(this);
		this._xmldoc   = null;  //{XMLDocument}
		this._root     = null;
		this._tag      = "";
	//this._tagConf  = null;
		this._elements = [];  //{TemplateElement} 所有模板元素实例(内部包装了对应的DOM元素)
		this._vars     = {};  //所有的模板变量
		this._uid      = 0;   //value对象编号
		this._hash     = {};  //用于value排重
		this._values   = {};  //所有的value依赖的相关key
	};
	this.create = function(xml){
		if(typeof xml == "string"){
			this._xmldoc = this.createXMLDocument(xml);
			this._root = this._xmldoc.documentElement;
		}else{
			this._root = xml;
		}
		this._tag = this._root.tagName;
	};
	this.dispose = function(){
		for(var k in this._values){
			//this._values[k].vars
			delete this._values[k];
		}
		for(var k in this._hash){
			delete this._hash[k];
		}
		for(var k in this._vars){
			//this._vars[k].refs;
			delete this._vars[k];
		}
		for(var i = 0, len = this._elements.length; i < len; i++){
			this._elements[i].dispose();
			this._elements[i] = null;
		}
		this._elements.length = 0;
		this._root = null;
		this._xmldoc = null;
		_super.dispose.apply(this);
	};
	this.createXMLDocument = function(xml){
		if(runtime.ie){
			var xmldoc = new ActiveXObject("Msxml.DOMDocument");
			xmldoc.async = false;
			xmldoc.loadXML(xml);
			return xmldoc;  //.documentElement
		}else if(window.DOMParser){
			var p = new DOMParser();
			return p.parseFromString(xml, "text/xml");
		}else{
			console.log("浏览器不支持XMLDocument对象");
			return null;
		}
	};
	//注册模板元素
	this.regTplEl = function(v){
		this._elements.push(v);
	};
	this.onAttr = function(element, type, el, name, value){
		if(!this.hasVar(value)) return;  //快速判断是否包含模板变量
		if(type == "attr" && name == "style"){
			var hash = this.parseStyle(value, true);
			for(var k in hash){
				this.createTplRef(element, "style", el, k, hash[k]);
			}
		}else{
			this.createTplRef(element, type, el, name, value);
		}
	};
	this.createTplRef = function(element, type, el, name, value){
		var val = this.parseValue(value);
		var ref = {  //{TplRef}
			"type": type,  //位置类型(attr=属性值,text=文本节点,style=CSS属性)
			"el"  : el,    //所属元素(保存引用以备更新之用)
			"name": name,  //属性名
			"val" : val    //属性值
		};
		for(var key in val.vars){
			element.addRef(key, ref);
		}
	};
	this.getRoot = function(){
		return this._root;
	};
	this.parse = function(){
	};
	this.node2html = function(node){
		var sb = [];
		switch(node.nodeType){
		case 1:  //NODE_ELEMENT
			var tagName = node.tagName;
			sb.push("<" + tagName);
			for(var i = 0, len = node.attributes.length; i < len; i++){
				var attr = node.attributes[i];
				var name = attr.nodeName;
				var value = attr.nodeValue;
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
	this.hasVar = function(str){
		return str.indexOf("{$") != -1;
	};
	/**
	 * style内容简单解析过程
	 */
	this.parseStyle = function(str, has){
		var hash = {};
		var arr = str.split(";");
		for(var i = 0, len = arr.length; i < len; i++){
			if(arr[i] === "") continue;  //最后一个分号问题
			var prop = arr[i].split(":");
			var p = this.hasVar(prop[1]);  //快速判断是否包含模板变量
			if(has && p || !has && !p){
				hash[prop[0]] = prop[1];
			}
		}
		return hash;
	};
	/**
	 * 解析一个值对象
	 * [TODO]如何表示一个val只与一个模板变量关联，并且仅仅是模板变量的值
	 * [TO-DO]对同一个value不应该重复进行模板变量检查
	 */
	this.parseValue = function(value){
		var val;
		if(value in this._hash){
			val = this._hash[value];
		}else{
			val = {  //{TplValue}
				"id"   : this._uid,  //编号，方便索引
				"value": value,      //value原值
				"vars" : {}          //value依赖的模板变量(方便更新)
			};
			this._values[this._uid] = val;
			this._uid++;
			this._hash[value] = val;
			var _this = this;
			value.replace(RE_TVAR, function(_0, key){
				if(!(key in _this._vars)){
					_this.addVar(key, {  //模板变量
						"id"   : key   //变量名
					//"value": "",   //变量值
					//"refs" : []    //引用该变量的节点列表
					});
				}
				val.vars[key] = _this._vars[key];
			});
		}
		return val;
	};
	//添加一个模板变量
	this.addVar = function(name, v){
		this._vars[name] = v;
	};
	//添加一个变量引用
	/*
	this.addRef = function(name, ref){
		this._vars[name].refs.push(ref);
	};
	*/
});
/*</file>*/
/*<file name="alz/core/TagLib.js">*/
_package("alz.core");

_import("alz.core.Plugin");
_import("alz.template.TemplateObject");

/**
 * 标签库
 */
_class("TagLib", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._hash = {};
	};
	this.create = function(name, app){
		_super.create.apply(this, arguments);
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.reg = function(tag, clazz){
		this._hash[tag] = {
			"tag"  : tag,
			"clazz": clazz
		};
	};
	this.regTags = function(tags){
		for(var k in tags){
			this._hash[k] = tags[k];
		}
	};
	this.regXmlTags = function(node){
		var nodes = node.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			var k = node.tagName;
			var tplobj;  //{TemplateObject}
			if(node.getAttribute("tpl")){
				tplobj = this.getApp()._template.getTplObj(node.getAttribute("tpl"));
			}else{
				tplobj = new TemplateObject();
				tplobj.create(node.firstChild);
			}
			this._hash[k] = {  //{TagConf}
				"id"      : k,     //{String}
				"clazz"   : node.getAttribute("clazz"),
				"class"   : null,  //{Clazz}用的时候再去查找
				"node"    : node,  //{XMLNode}
				"tag"     : tplobj.getRoot().tagName,
				"tplobj"  : tplobj,  //{TemplateObject}
				getClass  : function(clazz){
					var name = clazz || this.clazz;
					return name && name in __classes__ ? __classes__[name] : null;
					/*
					if(!this["class"]){
						this["class"] = name && name in __classes__ ? __classes__[name] : null;
					}
					return this["class"];
					*/
				}
			};
		}
	};
	this.mapTagClass = function(tag){
		return this._hash[tag].clazz;
	};
	this.getTagConf = function(tag){
		return tag in this._hash ? this._hash[tag] : null;
	};
});
/*</file>*/
/*<file name="alz/template/TrimPath.js">*/
_package("alz.template");

//importMethod Array.pop,Array.push;
/*
try{
	String.prototype.process = function(context, optFlags){
		var template = new TrimPath().parseTemplate(this, null);
		if(template != null){
			return template.process(context, optFlags);
		}
		return this;
	};
}catch(ex){  // Swallow exception, such as when String.prototype is sealed.
}
*/

/**
 * Trimpath JavaScript Template wrapped in dojo.
 */
_class("TrimPath", "", function(_super, _event){
	this._init = function(){
	};
	this.evalEx = function(src){
		return eval(src);
	};
	/**
	 * @param tmplContent 模板内容
	 * @param optTmplName [可选]模板的名字
	 * @param optEtc      [可选]设置选项
	 */
	this.parseTemplate = function(tmplContent, optTmplName, optEtc){
		var tpl = new Template(optTmplName, tmplContent, optEtc || this.etc);
		if(tpl.parse()){
			return tpl;
		}
		delete tpl;
		return null;
	};
	// The DOM helper functions depend on DOM/DHTML, so they only work in a browser.
	// However, these are not considered core to the engine.
	//
	this.parseDOMTemplate = function(elementId, optDocument, optEtc){
		if(optDocument == null){
			optDocument = document;
		}
		var element = optDocument.getElementById(elementId);
		var content = element.value;  // Like textarea.value.
		if(content == null){
			content = element.innerHTML;  // Like textarea.innerHTML.
		}
		content = content.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
		return this.parseTemplate(content, elementId, optEtc);
	};
	this.processDOMTemplate = function(elementId, context, optFlags, optDocument, optEtc){
		return this.parseDOMTemplate(elementId, optDocument, optEtc).process(context, optFlags);
	};
	this.etc = new function(){  // Exposed for extensibility.
		//this.Template = Template;
		//this.ParseError = ParseError;
		this.statementTag = "forelse|for|if|elseif|else";
		this.statementDef = {  // Lookup table for statement tags.
			"if"     : {delta:  1, prefix: "if(", suffix: "){", paramMin: 1 },
			"else"   : {delta:  0, prefix: "}else{" },
			"elseif" : {delta:  0, prefix: "}else if(", suffix: "){", paramDefault: "true" },
			"/if"    : {delta: -1, prefix: "}" },
			"for"    : {delta:  1, paramMin: 3,
				prefixFunc: function(stmtParts, state, tmplName, etc){
					if(stmtParts[2] != "in"){
						throw new ParseError(tmplName, state.line, "bad for loop statement: " + stmtParts.join(' '));
					}
					var iterVar = stmtParts[1];
					var listVar = "__LIST__" + iterVar;
					return [
						"var ", listVar, " = ", stmtParts[3], ";",
						// Fix from Ross Shaull for hash looping, make sure that we have an array of loop lengths to treat like a stack.
						"var __LENGTH_STACK__;",
						"if(typeof(__LENGTH_STACK__) == 'undefined' || !__LENGTH_STACK__.length) __LENGTH_STACK__ = [];",
						"__LENGTH_STACK__[__LENGTH_STACK__.length] = 0;", // Push a new for-loop onto the stack of loop lengths.
						"if((", listVar, ") != null){ ",
							"var ", iterVar, "_ct = 0;",       // iterVar_ct variable, added by B. Bittman
							"for(var ", iterVar, "_index in ", listVar, "){ ",
								iterVar, "_ct++;",
								"if(typeof(", listVar, "[", iterVar, "_index]) == 'function'){continue;}", // IE 5.x fix from Igor Poteryaev.
								"__LENGTH_STACK__[__LENGTH_STACK__.length - 1]++;",
							"var ", iterVar, " = ", listVar, "[", iterVar, "_index];"
					].join("");
				}
			},
			"forelse" : { delta:  0, prefix: "}} if(__LENGTH_STACK__[__LENGTH_STACK__.length - 1] == 0){if(", suffix: "){", paramDefault: "true"},
			"/for"    : { delta: -1, prefix: "}}; delete __LENGTH_STACK__[__LENGTH_STACK__.length - 1];"} // Remove the just-finished for-loop from the stack of loop lengths.
		};
	};
});
/*</file>*/
/*<file name="alz/template/Template.js">*/
_package("alz.template");

/**
 * @param name 模板名
 * @param content 模板内容
 * @param etc 配置信息
 */
_class("Template", "", function(_super, _event){
	this._init = function(name, content, etc){
		this._name = name;
		this._source = content;
		this._etc = etc;
		this._sourceFunc = "";
		this._func = null;
		this._buffer = [];
	};
	this.toString = function(){
		return "TrimPath.Template [" + this._name + "]";
	};
	this.process = function(context, flags){
		context = context || {};  //check context
		flags = flags || {};

		if(context.defined == null){
			context.defined = function(str){
				return context[str] != undefined;
			};
		}
		// added by Ding Shunjia, if context[str] == undefined, return blank str
		if(context.trim == null){
			context.trim = function(str){
				if(context[str] == undefined){
					return "";
				}else{
					return context[str];
				}
			};
		}

		var sb = [];
		var resultOut = {
			write: function(m){sb.push(m);}
		};
		try{
			var func = this._func;
			func(resultOut, context, flags);
		}catch(ex){
			if(flags.throwExceptions == true){
				throw ex;
			}
			var result = new String(sb.join("") + "[ERROR: " + ex.toString() + (ex.message ? '; ' + ex.message : '') + "]");
			result["exception"] = ex;
			return result;
		}
		return sb.join("");
	};
	/**
	 * 解析模板并生成一个匿名函数代码字符串
	 * @return {boolean} 解析结果(true=成功,false=失败)
	 */
	this.parse = function(){
		this._source = this._cleanWhiteSpace(this._source);
		this._buffer.push("function(_OUT, _CONTEXT, _FLAGS){with(_CONTEXT){");
		var state = {stack: [], line: 1};  // TODO: Fix line number counting.
		var endStmtPrev = -1;
		while(endStmtPrev + 1 < this._source.length){
			var begStmt = endStmtPrev;
			// Scan until we find some statement markup.
			begStmt = this._source.indexOf("{", begStmt + 1);
			while(begStmt >= 0){
				var endStmt = this._source.indexOf('}', begStmt + 1);
				var stmt = this._source.substring(begStmt, endStmt);
				var blockrx = stmt.match(/^\{(cdata|minify|eval)/);  // From B. Bittman, minify/eval/cdata implementation.
				if(blockrx){
					var blockType = blockrx[1];
					var blockMarkerBeg = begStmt + blockType.length + 1;
					var blockMarkerEnd = this._source.indexOf('}', blockMarkerBeg);
					if(blockMarkerEnd >= 0){
						var blockMarker;
						if(blockMarkerEnd - blockMarkerBeg <= 0){
							blockMarker = "{/" + blockType + "}";
						}else{
							blockMarker = this._source.substring(blockMarkerBeg + 1, blockMarkerEnd);
						}
						var blockEnd = this._source.indexOf(blockMarker, blockMarkerEnd + 1);
						if(blockEnd >= 0){
							this._emitSectionText(this._source.substring(endStmtPrev + 1, begStmt), sb);
							var blockText = this._source.substring(blockMarkerEnd + 1, blockEnd);
							if(blockType == 'cdata'){
								this._emitText(blockText, sb);
							}else if(blockType == 'minify'){
								this._emitText(this._scrubWhiteSpace(blockText), sb);
							}else if(blockType == 'eval'){
								if(blockText != null && blockText.length > 0){  // From B. Bittman, eval should not execute until process().
									this._buffer.push('_OUT.write((function(){ ' + blockText + ' })() );');
								}
							}
							begStmt = endStmtPrev = blockEnd + blockMarker.length - 1;
						}
					}
				}else if(this._source.charAt(begStmt - 1) != '$' &&               // Not an expression or backslashed,
						this._source.charAt(begStmt - 1) != '\\'){                    // so check if it is a statement tag.
					var offset = (this._source.charAt(begStmt + 1) == '/' ? 2 : 1); // Close tags offset of 2 skips '/'.
					                                                                // 10 is larger than maximum statement tag length.
					if(this._source.substring(begStmt + offset, begStmt + 10 + offset).search(TrimPath.prototype.etc.statementTag) == 0){
						break;  // Found a match.
					}
				}
				begStmt = this._source.indexOf("{", begStmt + 1);
			}
			if(begStmt < 0){  // In "a{for}c", begStmt will be 1.
				break;
			}
			var endStmt = this._source.indexOf("}", begStmt + 1);  // In "a{for}c", endStmt will be 5.
			if(endStmt < 0){
				break;
			}
			this._emitSectionText(this._source.substring(endStmtPrev + 1, begStmt));
			this._emitStatement(this._source.substring(begStmt, endStmt + 1), state);
			endStmtPrev = endStmt;
		}
		this._emitSectionText(this._source.substring(endStmtPrev + 1));
		if(state.stack.length != 0){
			throw new ParseError(this._name, state.line, "unclosed, unmatched statement(s): " + state.stack.join(","));
		}
		this._buffer.push("}}");
		this._sourceFunc = this._buffer.join("");
		var func;
		try{
			//func = TrimPath.evalEx(this._sourceFunc, this._name, 1);
			eval("func = " + this._sourceFunc + ";");
		}catch(ex){
			func = null;
		}
		if(func != null){
			this._func = func;
			return true;  //解析成功
		}
		return false;  //解析失败
	};
	this._emitStatement = function(stmtStr, state){
		var parts = stmtStr.slice(1, -1).split(' ');
		var stmt = this._etc.statementDef[parts[0]];  // Here, parts[0] == for/if/else/...
		if(stmt == null){  // Not a real statement.
			this._emitSectionText(stmtStr);
			return;
		}
		if(stmt.delta < 0){
			if(state.stack.length <= 0){
				throw new ParseError(this._name, state.line, "close tag does not match any previous statement: " + stmtStr);
			}
			state.stack.pop();
		}
		if(stmt.delta > 0){
			state.stack.push(stmtStr);
		}
		if(stmt.paramMin != null && stmt.paramMin >= parts.length){
			throw new ParseError(this._name, state.line, "statement needs more parameters: " + stmtStr);
		}
		if(stmt.prefixFunc != null){
			this._buffer.push(stmt.prefixFunc(parts, state, this._name, this._etc));
		}else{
			this._buffer.push(stmt.prefix);
		}
		if(stmt.suffix != null){
			if(parts.length <= 1){
				if(stmt.paramDefault != null){
					this._buffer.push(stmt.paramDefault);
				}
			}else{
				for(var i = 1; i < parts.length; i++){
					if(i > 1){
						this._buffer.push(' ');
					}
					this._buffer.push(parts[i]);
				}
			}
			this._buffer.push(stmt.suffix);
		}
	};
	this._emitSectionText = function(text){
		if(text.length <= 0) return;
		var nlPrefix = 0;               // Index to first non-newline in prefix.
		var nlSuffix = text.length - 1; // Index to first non-space/tab in suffix.
		while(nlPrefix < text.length && (text.charAt(nlPrefix) == '\n')){
			nlPrefix++;
		}
		while(nlSuffix >= 0 && (text.charAt(nlSuffix) == ' ' || text.charAt(nlSuffix) == '\t')){
			nlSuffix--;
		}
		if(nlSuffix < nlPrefix){
			nlSuffix = nlPrefix;
		}
		if(nlPrefix > 0){
			this._buffer.push('if(_FLAGS.keepWhitespace == true) _OUT.write("');
			var s = text.substring(0, nlPrefix).replace('\n', '\\n');  // A macro IE fix from BJessen.
			if(s.charAt(s.length - 1) == '\n'){
				s = s.substring(0, s.length - 1);
			}
			this._buffer.push(s);
			this._buffer.push('");');
		}
		var lines = text.substring(nlPrefix, nlSuffix + 1).split('\n');
		for(var i = 0, len = lines.length; i < len; i++){
			this._emitSectionTextLine(lines[i]);
			if(i < lines.length - 1){
				this._buffer.push('_OUT.write("\\n");\n');
			}
		}
		if(nlSuffix + 1 < text.length){
			this._buffer.push('if(_FLAGS.keepWhitespace == true) _OUT.write("');
			var s = text.substring(nlSuffix + 1).replace('\n', '\\n');
			if(s.charAt(s.length - 1) == '\n'){
				s = s.substring(0, s.length - 1);
			}
			this._buffer.push(s);
			this._buffer.push('");');
		}
	};
	this._emitSectionTextLine = function(line){
		var endMarkPrev = '}';
		var endExprPrev = -1;
		while(endExprPrev + endMarkPrev.length < line.length){
			var begMark = "${", endMark = "}";
			var begExpr = line.indexOf(begMark, endExprPrev + endMarkPrev.length);  // In "a${b}c", begExpr == 1
			if(begExpr < 0){
				break;
			}
			if(line.charAt(begExpr + 2) == '%'){
				begMark = "${%";
				endMark = "%}";
			}
			var endExpr = line.indexOf(endMark, begExpr + begMark.length);         // In "a${b}c", endExpr == 4;
			if(endExpr < 0){
				break;
			}
			this._emitText(line.substring(endExprPrev + endMarkPrev.length, begExpr));
			// Example: exprs == 'firstName|default:"John Doe"|capitalize'.split('|')
			var exprArr = line.substring(begExpr + begMark.length, endExpr).replace(/\|\|/g, "#@@#").split('|');
			for(var k in exprArr){
				if(exprArr[k].replace){  // IE 5.x fix from Igor Poteryaev.
					exprArr[k] = exprArr[k].replace(/#@@#/g, '||');
				}
			}
			this._buffer.push('_OUT.write(');
			this._emitExpression(exprArr, exprArr.length - 1);
			this._buffer.push(');');
			endExprPrev = endExpr;
			endMarkPrev = endMark;
		}
		this._emitText(line.substring(endExprPrev + endMarkPrev.length));
	};
	this._emitText = function(text){
		if(text == null || text.length <= 0){
			return;
		}
		text = text.replace(/\\/g, '\\\\')
			.replace(/\n/g, '\\n')
			.replace(/\"/g,  '\\"');
		this._buffer.push('_OUT.write("');
		this._buffer.push(text);
		this._buffer.push('");');
	};
	this._emitExpression = function(exprArr, index){
		// Ex: foo|a:x|b:y1,y2|c:z1,z2 is emitted as c(b(a(foo,x),y1,y2),z1,z2)
		var expr = exprArr[index];  // Ex: exprArr == [firstName,capitalize,default:"John Doe"]
		if(index <= 0){  // Ex: expr == 'default:"John Doe"'
			this._buffer.push(expr);
			return;
		}
	};
	this._cleanWhiteSpace = function(str){
		return str.replace(/\t/g, "    ")
			.replace(/\r\n/g, "\n")
			.replace(/\r/g, "\n")
			.replace(/^(\s*\S*(\s+\S+)*)\s*$/, "$1");  // Right trim by Igor Poteryaev.
	};
	this._scrubWhiteSpace = function(str){
		return str.replace(/^\s+/g, "")
			.replace(/\s+$/g, "")
			.replace(/\s+/g, " ")
			.replace(/^(\s*\S*(\s+\S+)*)\s*$/, "$1");  // Right trim by Igor Poteryaev.
	};
});
/*</file>*/
/*<file name="alz/template/ParseError.js">*/
_package("alz.template");

/**
 * 模板解析异常类
 */
_class("ParseError", "", function(_super, _event){
	this._init = function(name, line, message){
		_super._init.call(this);
		this.name = name;
		this.line = line;
		this.message = message;
	};
	this.toString = function(){
		return "TrimPath template ParseError in " + this.name + ": line " + this.line + ", " + this.message;
	};
});
/*</file>*/
/*<file name="alz/template/TemplateManager.js">*/
_package("alz.template");

_import("alz.core.Plugin");
_import("alz.template.TrimPath");
_import("alz.template.TemplateObject");
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
_class("TemplateManager", Plugin, function(_super, _event){
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
	/**
	 * 检查模版的语法
	 */
	this.checkSyntax = function(xml){
		if(runtime.ie){
			try{
				var xmldoc = new ActiveXObject("Msxml.DOMDocument");
				xmldoc.async = false;
				xmldoc.loadXML(xml);
				//return xmldoc;  //.documentElement
				return true;
			}catch(ex){
				console.error("html代码格式不复合xml语法规范", ex, xml);
				return false;
			}
		}else if(window.DOMParser){
			var p = new DOMParser();
			var xmldoc = p.parseFromString(xml, "text/xml");
			if(xmldoc.documentElement.getElementsByTagName("parsererror").length > 0){
				console.error("html代码格式不复合xml语法规范", xml);
				return false;
			}
			return true;
		}else{
			runtime.error("浏览器不支持xmldom");
			return false;
		}
	};
	this.createXMLDocument = function(xml){
		if(runtime.ie){
			var xmldoc = new ActiveXObject("Msxml.DOMDocument");
			xmldoc.async = false;
			xmldoc.loadXML(xml);
			return xmldoc;  //.documentElement
		}else if(window.DOMParser){
			var p = new DOMParser();
			return p.parseFromString(xml, "text/xml");
		}else{
			console.log("浏览器不支持XMLDocument对象");
			return null;
		}
	};
	this.reg = function(tpls){
		var arr = [];
		for(var k in tpls){
			var v = tpls[k];
			if(v === null){  //和PHP程序约定为模板不存在
				v = '<div style="color:red;">模板(' + k + ')不存在</div>';
				arr.push(k);
			}else{
				this.checkSyntax(v);
			}
			var tplobj = new TemplateObject();
			tplobj.create(v);
			this._hash[k] = {
				"type"  : "xml",
				"name"  : k,
				"data"  : v,
				"tplobj": tplobj
			};
		}
		if(arr.length > 0){
			runtime.error("下列这些模板不存在，请检查：" + arr.join(","));
		}
	};
	this.exist = function(name){
		return name in this._hash;
	};
	this.getTpl = function(name){
		return this._hash[name];
	};
	this.getTplObj = function(name){
		return this._hash[name].tplobj;
	};
	this.getTplData = function(name){
		if(!(name in this._hash)){
			runtime.error("[ERROR]模版库中没有指定的模板(name=" + name + ")");
			return "";
		}
		return this._hash[name].data;
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
	 * @param {Function} func 回调函数
	 * /
	this.load = function(data, agent, func){
		this.appendItems(data);
		func.call(agent);
	};
	this.loadData = function(url, agent, func){
		new Ajax().netInvoke("POST", url, "", "json", this, function(json){
			this.load(json, this, function(){
				func.apply(agent);
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
	this.addTemplate =  //[nouse]
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
	//[profile]runtime.__tpl = {};
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
			//[profile]if(!(name in runtime.__tpl)){
			//[profile]	runtime.__tpl[name] = 0;
			//[profile]}
			switch(tpl.type){  //根据模板的类型，使用不同的方式生成 HTML 代码
			case "html":  //直接输出
				html = tpl.data;
				break;
			case "tpl":  //使用正则替换
				//[profile]var t0 = new Date().getTime();
				html = this.callTpl(tpl.data, arguments[1]);
				//[profile]runtime.__tpl[name] += new Date().getTime() - t0;
				break;
			case "asp":  //执行函数调用
				//[profile]var t0 = new Date().getTime();
				var arr = Array.prototype.slice.call(arguments, 1);
				html = this._hash[name].func.apply(null, arr);
				//[profile]runtime.__tpl[name] += new Date().getTime() - t0;
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
//import alz.core.TemplateManager;
/*<file name="alz/core/HistoryManager.js">*/
_package("alz.core");

_import("alz.core.Plugin");

/**
 * 历史记录管理
 */
_class("HistoryManager", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._stack = [];  //{pid:"",params:{navmode:"normal",...}}
	};
	this.create = function(name, app){
		_super.create.apply(this, arguments);
	};
	this.dispose = function(){
		for(var i = 0, len = this._stack.length; i < len; i++){
			this._stack[i] = null;
		}
		this._stack.length = 0;
		_super.dispose.apply(this);
	};
	//[TODO]监控调试信息
	this.watchData = function(){
		if(runtime._debugPane){
			var arr = [];
			for(var i = 0, len = this._stack.length; i < len; i++){
				arr.push(this._stack[i].pid);
			}
			runtime._debugPane.updateHistory(arr);
		}
	};
	this.clear = function(){
		while(this._stack.length){
			this._stack.pop();
		}
		this.watchData();
	};
	this.push = function(item){
		this._stack.push(item);
		this.watchData();
	};
	this.pop = function(){
		var ret = this._stack.pop();
		this.watchData();
		return ret;
	};
	this.put = function(item, offset){
		if(offset <= 0){
			var n = this._stack.length + offset;
			this._stack[n] = item;
			this._stack.length = n;
			this.watchData();
		}else{  //offset >= 1
			this.push(item);
		}
	};
	this.getItem = function(offset){
		var n = this._stack.length - 1 + offset;
		if(n < 0 || offset >= 1){  //n < 0 || n >= this._stack.length
			return null;
		}else{
			return this._stack[n];
		}
	};
	this.getPrevious = function(){
		return this.getItem(-1);
	};
	this.getCurrent = function(){
		return this.getItem(0);
	};
});
/*</file>*/
/*<file name="alz/core/Application.js">*/
_package("alz.core");

_import("alz.core.IConfigurable");
_import("alz.core.EventTarget");
_import("alz.core.PluginManager");
//_import("alz.core.LocalStorage");
_import("alz.core.DataModel");
_import("alz.core.TagLib");
_import("alz.template.TemplateManager");
//_import("alz.core.TemplateManager");
_import("alz.core.HistoryManager");
_import("alz.template.TplDocument");

/**
 * [TODO]
 * 1)application 变量在 runtime.createApp 方法返回之后被覆盖了
 */
_class("Application", EventTarget, function(_super, _event){
	_implements(this, IConfigurable);
	this.__conf__(__context__, {
		"plugin": [  //插件配置列表
		//{"id": "storage" , "clazz": "LocalStorage"   },
			{"id": "model"   , "clazz": "DataModel"      },
			{"id": "taglib"  , "clazz": "TagLib"         },
			{"id": "template", "clazz": "TemplateManager"},
			{"id": "history" , "clazz": "HistoryManager" }
		]
	});
	this._init = function(){
		__context__.application = this;  //绑定到lib上下文环境上
		_super._init.call(this);
		this._context = __context__;
		this._appconf = null;  //应用配置信息
		this._parentApp = null;  //父应用
		this._historyIndex = -1;
		this._params = null;  //传递给应用的参数
		this._workspace = null;  //工作区组件
		this._hotkey = {};  //热键
		this._doc = runtime.getDocument();
		this._domTemp = null;
		this._pluginManager = null;  //插件管理者
		this._tpldoc = null;
		this._contentPane = null;
		//this._template = null;  //模版引擎
		//this._template = runtime.getTemplate();  //模版引擎
		this.__keydown = null;
		/*
		this._cache = {  //参考了 prototype 的实现
			findOrStore: function(value){
				return this[value] = this[value] || function(){
					return value.apply(null, [this].concat(runtime.toArray(arguments)));
				};
			}
		};
		*/
		this._appworkspace = null;  //子窗体工作区
		this._windows = {};    //所有子窗体组件
		this._mainwin = null;  //主窗体组件
		this._dialogs = {};    //所有对话框组件
		this._popups = {};     //弹出式组件
	};
	this.init = function(){
		//_super.init.apply(this, arguments);
		this._pluginManager = new PluginManager();
		this._pluginManager.create(this, this.findConf("plugin"));
		this._workspace = runtime._workspace;
		if(!Application._hotkey){
			//注册系统热键
			this.__keydown = function(ev){
				ev = ev || runtime.getWindow().event;
				var key = ev.keyCode;
				if(key in this._hotkey){  //如果存在热键，则执行回掉函数
					var ret, o = this._hotkey[key];
					switch(o.type){
					case 0: ret = o.agent(ev);break;
					case 1: ret = o.agent[o.func](ev);break;
					case 2: ret = o.func.apply(o.agent, [ev]);break;
					}
					return ret;
				}
			};
			runtime.getDom().addEventListener(runtime.getDocument(), "keydown", this.__keydown, this);
			Application._hotkey = true;
		}
		//this._template = runtime.getTemplate();  //模版引擎
		this._tpldoc = new TplDocument(runtime.getWorkspace().getContainer(), this);
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var k in this._popups){
			this._popups[k].dispose();
			delete this._popups[k];
		}
		for(var k in this._dialogs){
			this._dialogs[k].dispose();
			delete this._dialogs[k];
		}
		this._mainwin = null;
		for(var k in this._windows){
			this._windows[k].dispose();
			delete this._windows[k];
		}
		this._appworkspace = null;
		if(this.__keydown){
			this.__keydown = null;
			runtime.getDom().removeEventListener(runtime.getDocument(), "keydown", this.__keydown);
		}
		this._pluginManager.dispose();
		this._pluginManager = null;
		this._contentPane = null;
		this._tpldoc = null;
		this._domTemp = null;
		this._doc = null;
		//runtime.getDocument().onkeydown = null;
		for(var k in this._hotkey){
			delete this._hotkey[k];
		}
		this._workspace = null;
		this._params = null;
		this._parentApp = null;
		this._appconf = null;
		this._context = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.onContentLoad = function(){
	};
	this.initConf = function(tpl){
		//注册数据模型
		this._model.regModels(this.findConf("model"));
		//注册组件的自定义标签
		this._taglib.regTags(this.findConf("taglib"));
		//注册模板库
		this._template.reg(runtime.getTplData(tpl));

		var str = runtime.getTplData("aui.tpl")["ui.xml"];
		this._taglib.regXmlTags(this._template.createXMLDocument(str).documentElement);
		if(this._template.exist("ui.xml")){
			str = this._template.getTplData("ui.xml");
			if(str){
				this._taglib.regXmlTags(this._template.createXMLDocument(str).documentElement);
			}
		}
	};
	/**
	 * 注册系统热键
	 * @param {Number} keyCode 热键编码
	 * @param {Object} agent 代理对象
	 * @param {Function} func 回调函数
	 */
	this.regHotKey = function(keyCode, agent, func){
		var type;
		if(typeof agent == "function"){
			type = 0;
		}else if(typeof agent == "object" && typeof func == "string"){
			type = 1;
		}else if(typeof agent == "object" && typeof func == "function"){
			type = 2;
		}else{
			runtime.showException("回调参数错误");
			return;
		}
		if(!this._hotkey[keyCode]){
			this._hotkey[keyCode] = {
				"type" : type,
				"agent": agent,
				"func" : func
			};
		}
	};
	this.createDomElement = function(html, doc){
		doc = doc || this._doc;  //可能在不同的document对象中执行
		if(!this._domTemp){
			this._domTemp = doc.createElement("div");
			//doc.documentElement.appendChild(this._domTemp);
		}
		this._domTemp.innerHTML = html.replace(/^[\s\r\n]+/, "");
		return this._domTemp.removeChild(this._domTemp.firstChild);  //childNodes[0]
	};
	this.setParentApp = function(v){
		this._parentApp = v;
	};
	this.getAppManager = function(){
		return runtime.getAppManager();
	};
	this.setHistoryIndex = function(v){
		this._historyIndex = v;
	};
	this.getParams = function(){
		return this._params;
	};
	this.getTplDoc = function(){
		return this._tpldoc;
	};
	this.cc = function(id){
		return this._tpldoc.$(id);
	};
	this.setContentPane = function(v){
		this._contentPane = v;
	};
	this.setContext = function(v){
		this._context = v;
	};
	this.findClass = function(name){
		if(name in this._context){
			return this._context[name];
		}else{
			return null;
		}
	};
	this.getModel = function(key){
		return this._model.getModel(key);
	};
	this.getTpl = function(name){
		return this._template.getTpl(name);
	};
	this.getTplData = function(name){
		return this._template.getTplData(name);
	};
	this.navPane = function(pid, params){
	};
	this.getAppWorkspace = function(){
		return this._contentPane ? this._contentPane.find(".ui-appworkspace")._ptr : this._workspace;
	};
	/**
	 * 创建一个窗体组件
	 */
	this.createWindow = function(name, app, params){
		var key = name.split("#")[0];
		var win = this._windows[name];
		if(!win){
			var conf = this.findConf("dialog", key);
			var parent = params.main ? this._workspace : this.getAppWorkspace();
			/*
			win = new conf.clazz();
			if(params.main){
				this._mainwin = win;
			}
			win.setConf(conf);
			win.create(parent, app || this, params, conf.tpl);
			*/
			var tplEl = this._tpldoc.createTplElement2(parent, conf.tpl, [conf, parent, this, params]);
			win = tplEl._component;
			this._windows[name] = win;
		}
		win.setZIndex(runtime.getNextZIndex());
		win.setVisible(true);
		return win;
	};
	/**
	 * 调用一个对话框组件（创建，重置）
	 * @param {String} name 要创建的对话框的名字（类名 + "#" + id）
	 * @param {Application} app 对话框所属的应用
	 * @param {Hash} params 创建参数
	 *   params["p2" ] 这是一个附加的参数[TODO]需要重构掉
	 *   params["act"]
	 *   params["url"] urlCode
	 * @param {Object} agent 回调代理对象
	 * @param {String|Function} func 回调函数
	 */
	this.dlgInvoke = function(name, app, params, agent, func){
		var key = name.split("#")[0];
		var dlg = this._dialogs[name];
		if(!dlg){
			var conf = this.findConf("dialog", key);
			//dlg = new conf.clazz();
			//dlg.setConf(conf);
			//dlg.setOwnerApp(this);
			//dlg.create(runtime.getWorkspace(), app || this, params, conf.tpl);
			var parent = runtime.getWorkspace();
			var tplEl = this._tpldoc.createTplElement2(parent, conf.tpl, [conf, parent, app || this, params, this]);
			dlg = tplEl._component;
			this._dialogs[name] = dlg;
		}
		if(agent){
			dlg.setReq({
				"agent": agent,
				"func" : typeof func == "string" ? agent[func] : func
			});
		}
		dlg.showModal(true);
		dlg.reset(params);
		return dlg;
	};
	/**
	 * 调用一个弹出式组件（创建，重置）
	 * @param {String} name 要创建的弹出式组件的名字
	 * @param {Component} owner 弹出式组件所属的组件
	 * @param {Hash} params 创建参数
	 * @param {Object} agent 回调代理对象
	 * @param {String|Function} func 回调函数
	 * @return {Popup}
	 */
	this.popInvoke = function(name, owner, params, agent, func){
		var popup = this._popups[name];
		if(!popup){
			var conf = this.findConf("popup", name);
			//popup = new conf.clazz();
			//popup.create(runtime.getWorkspace(), this, owner, params, conf.tpl);
			var parent = runtime.getWorkspace();
			var tplEl = this._tpldoc.createTplElement2(parent, conf.tpl, [conf, parent, this, params, owner]);
			popup = tplEl._component;
			this._popups[name] = popup;
		}
		if(agent){
			popup.setReq({
				"agent": agent,
				"func" : typeof func == "string" ? agent[func] : func
			});
		}
		popup.show();
		popup.reset(params);
		return popup;
	};
	this.popupInvoke = this.popInvoke;
	/**
	 * 创建一个面板组件
	 * @param {String} name
	 * @param {Component} parent
	 * @param {Application} app
	 * @param {Hash} params
	 * @return {Pane}
	 */
	this.createPane = function(name, parent, app, params){
	};
	this.doAction = function(act, sender){
		if("execAction" in this){
			var flag = this.execAction(act, sender);
			if(flag){
				return true;
			}
		}
		var key = "do_" + act;
		if(key in this && typeof this[key] == "function"){
			var ret = this[key](act, sender);
			return typeof ret == "boolean" ? ret : false;
		}else{
			runtime.error("[Application::doAction]未定义的act=" + act);
			return false;
		}
	};
	/**
	 * @see AjaxEngine::netInvoke
	 */
	this.netInvoke = function(method, url, params, type, agent, func){
		return runtime._ajax.netInvoke.apply(runtime._ajax, arguments);
	};
});
/*</file>*/
/*<file name="alz/core/AppManager.js">*/
_package("alz.core");

_import("alz.core.Plugin");
_import("alz.core.LibLoader");
_import("alz.core.Application");

/**
 * 应用管理者
 */
_class("AppManager", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._confList = {};  //APP配置数据
		this._activeAppName = "";
		this._activeAppConf = null;  //当前的应用配置
		this._hash = {};
		this._list = [];
		this._mainApp = null;
	};
	/**
	 * 初始化所有应用
	 */
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
		this._list.length = 0;
		for(var k in this._hash){
			//this._hash[k].dispose();
			delete this._hash[k];
		}
		this._activeAppConf = null;
		for(var k in this._confList){
			delete this._confList[k];
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * 调整所有应用的大小
	 */
	this.onResize = function(ev){
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i].onResize){
				try{
					this._list[i].onResize(ev);
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
		return this._mainApp;
		//return this._list[0];
	};
	this.setMainApp = function(v){
		this._mainApp = v;
	};
	/**
	 * 注册一个应用
	 */
	this.regApp = function(name, conf){
		if(name in this._confList){
			runtime.error("[AppManager::regApp]应用重名name=" + name + "，注册失败");
			return;
		}
		this._confList[name] = conf;
		if(conf.active){
			this._activeAppName = name;
			this._activeAppConf = conf;
		}
	};
	/**
	 * 创建并注册一个应用的实例
	 * @param {String} appClassName 要创建的应用的类名
	 * @param {Application} parentApp 可选，所属的父类
	 * @param {Number} len 在历史记录中的位置
	 */
	this.createApp = function(context, appClassName, parentApp, len){
		var conf = this.getAppConfByClassName(appClassName);
		if(conf){
			if(conf.appnum == 1){
				runtime.getWindow().alert("简化版中每个App类只能创建一个实例");
				return null;
			}
			conf.appnum++;
		}
		//需要保证多于一个参数，阻止create方法自动执行
		var clazz = this.getClazzByName(appClassName);
		var app = new clazz();
		app.setContext(context);
		if(arguments.length == 3 && parentApp){
			app.setParentApp(parentApp);  //设置父类
			app.setHistoryIndex(len);  //设置所在历史记录的位置
		}else if(app.getMainWindow){
			var appManager = app.getMainWindow().runtime._appManager;
			parentApp = appManager.getMainApp() || null;
			app.setParentApp(parentApp);
			//if(parentApp){
			//	app.setHistoryIndex(parentApp._history.getLength());
			//}
		}
		//注册APP
		if(conf){
			this._hash[conf.id] = app;
		}
		this._list.push(app);
		//app.init();
		return app;
	};
	this.getClazzByName = function(name){
		for(var k in __classes__){
			if(k.split(".").pop() == name){
				return __classes__[k];
			}
		}
		return null;
	};
	this.getAppConf = function(appid){
		return this._confList[appid];
	};
	this.getAppConfByClassName = function(className){
		for(var k in this._confList){
			var conf = this._confList[k];
			if(conf.className == className){
				return conf;
			}
		}
		return null;
	};
	this.getAppByClassName = function(className){
		for(var i = 0, len = this._list.length; i < len; i++){
			var item = this._list[i];
			if(item._className == className || item._className.indexOf("." + className) != -1){
				return item;
			}
		}
		return null;
	};
	this._processFiles = function(conf){
		var styles = conf.css.split(",");
		var head = document.getElementsByTagName("head")[0];
		for(var i = 0, len = styles.length; i < len; i++){
			var el = document.createElement("link");
			el.type = "text/css";
			el.rel = "stylesheet";
			el.href = conf.pathcss + styles[i];
			head.appendChild(el);
		}
		var libs = [];
		if(conf.tpl){
			libs = libs.concat(conf.tpl.split(","));
		}
		if(conf.lib){
			libs = libs.concat(conf.lib.split(","));
		}
		var files = [];  //数组结构: [{type:"lib",name:"",inApp:false},...]
		for(var i = 0, len = libs.length; i < len; i++){
			var f = libs[i];
			if(/\.js$/.test(f)){  //直接加载js文件
				runtime.dynamicLoadFile("js", f.indexOf("http://") == 0 ? "" : app._pathJs, [f]);
			}else if(/\.(tpl|lib)$/.test(f)){  //加载lib,tpl文件
				var arr = f.split(".");
				var name = arr[0];  //name.replace(/\.lib$/, "");  //过滤掉lib后缀名
				var type = arr[1];  //类型，后缀名
				var inApp = name.substr(0, 1) == "#";
				if(inApp){  //过滤掉名字开头可能存在的"#"
					name = name.substr(1);
				}
				if(!(name in runtime._libManager._hash)){
					files.push({"type": type, "name": name, "inApp": true/*inApp*/});
				}
			}
		}
		return files;
	};
	/**
	 * 加载一个lib所依赖的其他lib和tpl资源
	 */
	this.loadAppLibs =
	this.loadAppFiles = function(libName, app, agent, func){
		var n = app ? app._history.getLength() - 1 : 0;
		var conf = this._confList[libName];
		var files = this._processFiles(conf);
		//加载tpl文件
		/*
		if("tpl" in conf){
			runtime.dynamicLoadFile("js", runtime.getConfigData("pathlib"), [conf["tpl"]]);
		}
		*/
		if(files.length == 0){
			return false;
		}else{
			var libLoader = new LibLoader();
			//runtime.getConfigData("codeprovider")
			libLoader.init(files, conf, this, function(lib, libConf, loaded){
				//runtime._libLoader.loadLibScript(lib0, this, function(lib){
				//});
				if(!loaded){
					if(lib.type == "lib"){
						if(typeof libConf == "function"){
							libConf.call(runtime, app, n);
						}else{  //typeof libConf.init == "function"
							libConf.init.call(runtime, app, n);
						}
					}
				}else{  //全部加载
					if(lib.type == "lib"){
						func.apply(agent, [this.getAppByClassName(conf.className)]);
						libLoader.dispose();
					}else{  //lib.type == "tpl"
						//window.alert("load tpl callback");
					}
				}
			});
			return true;
		}
	};
});
/*</file>*/
/*<file name="alz/core/Element.js">*/
_package("alz.core");

_import("alz.core.Plugin");

/**
 * DOM元素操作类
 */
_class("Element", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._key = "aui_uid";
		this._uid = 1;
		this._cache = {};  //DOM元素扩展数据缓存
	};
	this.create = function(name, app){
		_super.create.apply(this, arguments);
	};
	this.dispose = function(){
		for(var k in this._cache){
			for(var key in this._cache[k]){
				delete this._cache[k][key];
			}
			delete this._cache[k];
		}
		_super.dispose.apply(this);
	};
	function csskey(key){
		return key.replace(/[A-Z]/g, function(m){
			return "-" + m.toLowerCase();
		});
	}
	var view = document.defaultView;
	if(view){  //!runtime.ie
		this.getStyle = function(el, key){
			//this._data.element.currentStyle || this.getComputedStyle(this._data.element, null)
			var style = view.getComputedStyle(el, "");
			return style.getPropertyValue(csskey(key));
		};
		this.style = function(el, key){
			//var style = this.getStyle(el);
			var style = view.getComputedStyle(el, "");
			if(!key){
				return style;
			}
			//return style.getPropertyValue(key.replace(/([A-Z])/g, "-$1").toLowerCase());
			return style.getPropertyValue(csskey(key));
		};
	}else{
		this.getStyle = function(el, key){
			return el.currentStyle[key];
		};
		this.style = function(el, key){
			var style = el.currentStyle;
			if(!key){
				return style;
			}
			return style[key];
		};
	}
	/**
	 * 获取DOM元素的全局唯一ID标识
	 * @param {HTMLElement} el 目标元素
	 * @return {String} 全局唯一ID标识
	 */
	this.getUid = function(el){
		return el.getAttribute(this._key);  //el[this._key]
	};
	/**
	 * 读取或保存一个DOM元素的附加属性数据
	 * @param {HTMLElement} el 目标元素
	 * @param {String} key 属性名
	 * @param {Object} value 属性值
	 * @return {Object} (读取时)属性值
	 */
	this.data = function(el, key, value){
		//var id = el[this._key];
		var id = el.getAttribute(this._key);
		if(!id){
			id = this._uid++;
			//el[this._key] = id;
			el.setAttribute(this._key, id);
		}
		var cache;
		if(!(id in this._cache)){
			cache = this._cache[id] = {};
		}else{
			cache = this._cache[id];
		}
		if(value){
			cache[key] = value;
		}
		/*
		if(value){
			console.log("set " + id + "." + key + "=" + value);
		}else{
			console.log("get " + id + "." + key);
		}
		*/
		return key in cache ? cache[key] : this.style(el, key);
	};
	/**
	 * 读取或保存一个DOM元素的CSS属性
	 * @param {HTMLElement} el 目标元素
	 * @param {String} key CSS属性名
	 * @param {Object} value CSS属性值
	 * @return {Object} (读取时)CSS属性值
	 */
	this.css = function(el, key, val){
		if(arguments.length == 3){
			switch(key){
			case "left":
			case "top":
			case "width":
			case "height":
				el.style[key] = parseInt(val) + "px";
				break;
			case "opacity":
			case "overflow":
			default:
				el.style[key] = val;
				break;
			}
		}else{
			return this.style(el, key);
		}
	};
	this.width = function(el, size){
		var orig = this.css(el, "width"), ret = parseFloat(orig);
		return isNaN(ret) ? orig : ret;
		//return this.css(el, "width", typeof size === "string" ? size : size + "px");
	};
	this.height = function(el, size){
		var orig = this.css(el, "height"), ret = parseFloat(orig);
		return isNaN(ret) ? orig : ret;
		//return this.css(el, "height", typeof size === "string" ? size : size + "px");
	};
	/**
	 * 获取一个元素相对于一个父元素的位置
	 * @param {HTMLElement} el 目标元素
	 * @param {HTMLElement} refEl 参考的父元素
	 * @return {Postion} 位置坐标{x:n,y:n}
	 */
	this.getPos = function(el, refEl){
		var pos = {"x": 0, "y": 0};
		for(var o = el; o && o != refEl; o = o.offsetParent){
			var bl, bt, x, y;
			if(o != el){
				bl = parseInt(this.getStyle(o, "borderLeftWidth"));
				bt = parseInt(this.getStyle(o, "borderTopWidth"));
				x = isNaN(bl) ? 0 : bl;
				y = isNaN(bt) ? 0 : bt;
				bl = parseInt(this.getStyle(o, "paddingLeftWidth"));
				bt = parseInt(this.getStyle(o, "paddingTopWidth"));
				x += isNaN(bl) ? 0 : bl;
				y += isNaN(bt) ? 0 : bt;
			}
			pos.x += o.offsetLeft + (o != el ? x : 0);
			pos.y += o.offsetTop + (o != el ? y : 0);
		}
		return pos;
	};
	/**
	 * 向DOM元素添加一个class样式
	 * @param {HTMLElement} el 操作的目标元素
	 * @param {String} cls 添加的样式
	 */
	this.addClass = function(el, cls){
		el.className = el.className ? el.className + " " + cls : cls;
	};
	/**
	 * 移除DOM元素上指定名字的样式
	 * @param {HTMLElement} el 操作的目标元素
	 * @param {String} cls 要移除的样式名
	 */
	this.removeClass = function(el, cls){
		var arr = el.className.replace(/ +/g, " ").split(" ");
		var sb = [];
		for(var i = 0, len = arr.length; i < len; i++){
			var a = arr[i];
			if(a != ""){
				if(a != cls){
					sb.push(a);
				}
			}
		}
		el.className = sb.join(" ");
	};
	/**
	 * 替换DOM元素上指定名字的样式
	 * @param {HTMLElement} el 操作的目标元素
	 * @param {String} oldCls 要移除的样式名
	 * @param {String} newCls 替换后新的样式名
	 */
	this.replaceClass = function(el, oldCls, newCls){
		var arr = el.className.replace(/ +/g, " ").split(" ");
		var sb = [];
		for(var i = 0, len = arr.length; i < len; i++){
			var a = arr[i];
			if(a != ""){
				sb.push(a != oldCls ? a : newCls);
			}
		}
		el.className = sb.join(" ");
	};
});
/*</file>*/
/*<file name="alz/core/EventManager.js">*/
_package("alz.core");

_import("alz.core.EventTarget");
_import("alz.core.Plugin");

/**
 * 全局事件管理者
 */
_class("EventManager", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	/**
	 * 给组件内的DOM元素或子组件添加事件
	 * @param {HTMLElement|EventTarget} obj 要添加事件的对象
	 * @param {String} type 事件类型
	 * @param {Object} agent 事件代理对象
	 * @param {String|Function} func 事件响应函数
	 */
	this.addListener = function(obj, type, agent, func){
		var cbid = runtime._task.add(agent, func, null, "event");
		if(obj instanceof EventTarget){
			//obj.addEventListener(type, agent, false);
			var listener = {
				"obj" : obj,
				"cbid": cbid,
				"wrap": this.createListenerWrap(obj, type, cbid)
			};
			obj.addEventListener(type, listener, false);
		}else if(runtime.ie && obj.tagName || obj instanceof HTMLElement){
			var listeners = runtime._element.data(obj, "listeners");
			if(!listeners){
				listeners = runtime._element.data(obj, "listeners", {});
			}
			//var touch = this._touchRe.test(type);
			var touch = false;
			var listener = {
				"obj" : obj,
				"cbid": cbid,
				"wrap": this.createListenerWrap(obj, type, cbid, touch)
			};
			listeners[type] = listener;
			if(touch){
				runtime._gestureManager.addEventListener(obj, type, listener);
			}else{
				obj.addEventListener(type, listener.wrap, false);
			}
		}
	};
	/**
	 * 移除组件内的DOM元素或子组件绑定的事件
	 * @param {HTMLElement|EventTarget} obj 要添加事件的对象
	 * @param {String} type 事件类型
	 */
	this.removeListener = function(obj, type){
		if(obj instanceof EventTarget){
			obj.removeEventListener(type);  //移除所有type类型事件
		}else/* if(obj instanceof Element)*/{
			var listeners = runtime._element.data(obj, "listeners");
			if(listeners){
				var listener = listeners[type];
				for(var k in listener){
					listener[k] = null;  //obj,cbid,wrap
				}
				delete listeners[type];
			}
		}
	};
	this.createListenerWrap = function(dom, type, cbid, touch){
		return function(ev, args){
			ev || (ev = window.event);
			if(touch){
				ev = new TouchEventObjectImpl(ev);
			}/*else{
				ev = Ext.EventObject.setEvent(ev);
			}*/
			return runtime._task.execute(cbid, [ev]);
		};
	};
});
/*</file>*/
/*<file name="alz/core/WebRuntime.js">*/
_package("alz.core");

_import("alz.core.IConfigurable");
_import("alz.lang.Exception");
_import("alz.core.PluginManager");
_import("alz.core.ThreadPool");
_import("alz.core.TaskSchedule");
_import("alz.core.AppManager");
_import("alz.core.Element");
_import("alz.core.EventManager");
//_import("alz.core.DOMUtil");
//_import("alz.core.AjaxEngine");
//_import("alz.mui.Component");
//_import("alz.mui.Workspace");

/**
 * WEB运行时环境
 */
_class("WebRuntime", "", function(_super, _event){
	_implements(this, IConfigurable);
	this.__conf__(__context__, {
		"plugin": [  //插件配置列表
			{"id": "thread"      , "clazz": "ThreadPool"  },  //伪线程池
			{"id": "task"        , "clazz": "TaskSchedule"},  //任务调度器
		//{"id": "appManager"  , "clazz": "AppManager"  },  //应用管理者
			{"id": "element"     , "clazz": "Element"     },  //DOM元素操作
			{"id": "eventManager", "clazz": "EventManager"}   //事件管理
		]
	});
	this._init = function(){
		_super._init.call(this);
		//调试及其它各种开关选项
		this._startTime = new Date().getTime();   //__start 系统代码开始执行的时间戳
		this._debug = false;         //系统是否处于调试状态
		this._globalName = "__runtime__";  //多Runtime环境下的全局唯一变量的名字

		//路径配置
		this._pathSep   = "/";  //目录分割符
		this._pathAui   = "/alzui/";     //alzui内核所在目录("http://www.iiios.net:8081/alzui/")
		this._classpath = this._pathAui + "classes/";     //默认的类文件存储目录
		this._pathLib   = this._pathAui + "lib/";         //默认的类库包存储目录
		this._pathApp   = this._pathAui + "netapp/";      //app所在根目录
		this._pathSrv   = this._pathAui + "data/";        //服务端程序的根目录
		this._pathHtml  = this._pathAui + "html/";        //HtmlApp 目录
		this._pathTpl   = this._pathLib + "res/tpl/";     //tpl模版文件目录
		this._pathCss   = this._pathLib + "res/css/";     //css文件目录
		this._pathImg   = this._pathLib + "res/images/";  //图片资源
		this._pathSkin  = this._pathLib + "skin/win2k/";  //皮肤(图标)
		this._pathPlugin = this._pathAui + "plugins/";    //插件目录

		//运行时环境所在的宿主，为运行时环境提供统一的环境接口
		this._global   = null;  //保存唯一的一个全局 this 的指针
		this._host     = null;  //运行时环境的宿主对象（宿主环境）
		this._hostenv  = "";    //宿主环境(特别的宿主:hta,chm)
		this._config   = {};    //系统配置变量（含义参见文档说明）
		/*
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
		this._plugins = {};       //注册的插件列表
		this.dom = null;
		this._libManager = null;  //库文件管理者
		this._libLoader = null;   //库文件加载器
		this._pluginManager = null;  //插件管理者
		this._appManager = null;  //应用管理者
		this._contextList = {};   //上下文环境对象列表
		this._libContext = null;  //当前lib的上下文环境对象
		this._log = [];  //日志缓存

		//浏览器环境下在可能有的接口
		this._win       = null;  //运行时环境所在的 window 对象
		this._doc       = null;
		this._docView   = null;
		this._domScript = null;  //script DOM 对象
		this.isStrict = null; //是否严格模式
		this.ie       = false;  //是否IE浏览器
		this.ff       = false;  //是否FireFox
		this.ns       = false;  //是否Netscape
		this.opera    = false;  //是否Opera
		this.safari   = false;  //是否Safari
		this.chrome   = false;  //是否谷歌浏览器
		this.moz      = false;  //是否Mozilla系列浏览器
		this.ie5      = false;  //是否IE5
		this.ie55     = false;  //是否IE5.5
		this.ie6      = false;  //是否IE6
		this.ie7      = false;  //是否IE7
		this.ie8      = false;  //是否IE8
		this.ie9      = false;  //是否IE9
		this.ie678    = false;  //是否IE6/7/8
		this.ff1      = false;  //是否FF1
		this.ff2      = false;  //是否FF2
		this.ff3      = false;  //是否FF3
		this.max      = false;  //是否Maxthon
		this.tt       = false;  //是否TencentTraveler

		//探测是否 Gadget 运行环境
		this.inGadget = false;
		this.option = {  //Gadget相关属性
			"timer"     : 2000,  //检查新邮件的时间间隔
			"newMailNum": 0      //新邮件数量
		};
		this._files = {};  //已经加载的js或css文件
		this._boxModel = 0;
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
	this.init = function(global, cxt){
		this._win = global;
		this._doc = this._win.document;
		this._docView = this._doc.defaultView;
		this._checkBrowser();
		this.inGadget = !!(this._win.System && this._win.System.Gadget);  //typeof System != "undefined"
		this._boxModel = this.ie ? 0 : 1;
		var _this = this;
		this.__eventHandle = function(ev){
			_this.eventHandle(ev || _this._win.event);
			/*
			if(ev.type == "unload"){
				var win = window.open("/sinamail-dev/demos/profile.html", "_blank", "toolbar=no");
				var a = [];
				for(var k in runtime.__tpl){
					a.push(k + "=" + runtime.__tpl[k]);
				}
				a.push(__profile._methods["MailModel::formatMailData"].time);
				window.alert(a.join("\n"));
				window.alert("window.onunload");
			}
			*/
		};
		this.exportInterface(this._win);  //导出全局变量
		this._checkHostEnv();
		this._pathCss = this._config["pathcss"];
		//this._pathCss = this._products[this._productName].pathCss;
		this._pathSkin = this._config["pathskin"];
		this._pathPlugin = this._config["pathplugin"];
		this._libManager = new LibManager();
		this._pluginManager = new PluginManager();
		this._appManager = new AppManager();
		if(this._config["skin"]){
			var url = this._pathLib + "skin/" + this._config["skin"] + "/skin.css";
			this._doc.write('<link type="text/css" rel="stylesheet" href="' + url + '" />');
		}
		this._preLoadFile("css", this._pathCss, this._config["css"].split(","), this._pathSkin);
		if(this._config["plugin"]){  //如果有插件，加载插件的CSS文件
			this.loadPluginRes(this._config["plugin"].split(","));
		}
		if(this._config["autotest"]){  //加载自动测试文件
			this._doc.write('<script type="text/javascript" src="' + this._config["autotest"] + '" charset=\"utf-8\"></sc'+'ript>');
		}
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
		/*
		if(this._win.onKernelLoaded){
			this._win.onKernelLoaded();
		}
		*/
		if(this._doc.body){
			this.onContentLoaded();
		}
	};
	this.loadPluginRes = function(plugins){
		for(var i = 0, len = plugins.length; i < len; i++){
			var plugin = plugins[i];
			this._preLoadFile("css", this._pathPlugin + plugin + "/css/", [plugin + ".css"]);
			this._preLoadFile("js" , this._pathPlugin + plugin + "/js/" , [plugin + ".js" ]);
		}
	};
	/**
	 * @param {Boolean} newWorkspace
	 */
	this.onContentLoaded = function(ev, newWorkspace){
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
		//var clazz = this.__cls__;
		//for(var i = 1, len = clazz._exts.length; i < len; i++){
		//	clazz._exts[i].init.call(this);
		//}
		this._pluginManager.create(this, this.findConf("plugin"));
		this._libManager.initLoadLib();
		this._newWorkspace = newWorkspace;
		//this._workspace = new Screen();
		//this._workspace[this._newWorkspace ? "create" : "bind"](this.getBody());
		if(this.ie){  //IE在此时触发 resize
			this.eventHandle({"type": "resize"});  //主动触发一次 resize 事件
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
		this._libContext = null;
		for(var i = 0, len = this._components.length; i < len; i++){
			this._components[i].dispose();
			this._components[i] = null;
		}
		this._components.length = 0;
		this._testDiv = null;
		this._info = null;
		this._appManager.dispose();
		this._appManager = null;
		this._pluginManager.dispose();
		this._pluginManager = null;
		this._libLoader.dispose();
		this._libLoader = null;
		this._libManager.dispose();
		this._libManager = null;
		if(this.dom){
			this.dom.dispose();
			this.dom = null;
		}
		for(var k in this._plugins){
			this._plugins[k].dispose();
			delete this._plugins[k];
		}
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
			"mbsafari": /Version\/(\d+(?:\.\d+)+)\x20Mobile\/(\d|\D)+\x20Safari\/(\d+(?:\.\d+)+)/,
			"mf"    : /Minefield\/(\d+(?:\.\d+)+)/  //Minefield/3.0b4pre
		};
		var ua = nav.userAgent;
		var host = {"os":"unix","env":"unknown","ver":"0","compatMode":"","osver":""};
		if(nav.platform == "Win32" || nav.platform == "Windows"){
			//"Window NT 5.0" win2k
			//"Window NT 5.1" winxp
			host.os = "win";
			if(/Windows NT 5\.1/.test(ua)){
				host.osver = "win2k";
			}else if(/Windows NT 6\.1/.test(ua)){
				host.osver = "win7";
			}else if(/Windows NT 5\.0/.test(ua)){
				host.osver = "win2k";
			}else if(/Windows NT 6\.0/.test(ua)){
				host.osver = "vista";
			}
		}else if(nav.platform == "Mac68K" || nav.platform == "MacPPC" || nav.platform == "Macintosh"){
			host.os = "mac";
		}else if(nav.platform == "X11"){
			host.os = "unix";
		}else if(nav.platform == "iPad" || nav.platform == "iPhone"){
			host.os = "iPhoneOS";  //[TODO]
		}
		for(var k in re){
			var arr = re[k].exec(ua);
			if(arr){  //re[k].test(ua)
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
			this.log("[WebRuntime::getHostenv]未知的宿主环境，userAgent:" + ua);
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
		this.isStrict = this._doc.compatMode == "CSS1Compat";
		this.ie = this._hostenv == "ie";
		this.ff = this._hostenv == "ff";
		this.ns = this._hostenv == "ns";
		this.opera = this._hostenv == "opera";
		this.safari = this._hostenv == "safari" || this._hostenv == "mbsafari";
		this.chrome = this._hostenv == "chrome";
		this.moz = this.ns || this.ff;  //nav.product == "Gecko";
		var ua = nav.userAgent;
		this.ie6 = ua.indexOf("MSIE 6.0") != -1;
		this.ie7 = ua.indexOf("MSIE 7.0") != -1;
		this.ie8 = ua.indexOf("MSIE 8.0") != -1;
		this.ie9 = ua.indexOf("MSIE 9.0") != -1;
		this.ie678 = this.ie6 || this.ie7 || this.ie8;
		this.ff1 = ua.indexOf("Firefox/1.0") != -1;
		this.ff2 = ua.indexOf("Firefox/2.0") != -1;
		this.ff3 = ua.indexOf("Firefox/3.0") != -1;
		this.max = ua.indexOf("Maxthon") != -1;
		this.tt = ua.indexOf("TencentTraveler") != -1;
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

		//路径检测

		//定位 alzui 系统路径
		var path = this._config["src"];
		var arr = (/^(.+)(\\|\/)[^\\\/]+$/ig).exec(path);  //this._win.location
		if(arr){
			this._pathSep  = arr[2];
			this._pathAui = arr[1] + arr[2];
			//path = path.substring(0, path.lastIndexOf(this._pathSep) + 1).replace(/lib\/$/, "")
			this._setPathAui(path.substring(0, path.lastIndexOf(this._pathSep) + 1).replace(/lib\/$/, ""));
		}else{
			this.showException("未能正确定位 alzui 系统位置");
			return;
		}
		//定位 WebApp 的路径
		var url = "" + window.location;
		this._pathApp = url.substr(0, url.lastIndexOf("/") + 1);  //[TODO]pathApp的含义已经改变

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
					var el = this._doc.createElement("script");
					el.type = "text/javascript";
					el.charset = "utf-8";
					el.src = url;
					this._doc.documentElement.appendChild(el);
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
			}else if(ext == "js"){
				var loader = new ScriptLoader();
				loader.create(this, function(){});
				loader.load(url, "", true);  //this.getUrlByName(lib)
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
					// add by zhout 11-02-23
					// 增加了对Firefox的处理，手机号绑定时FF下提示脚本执行缓慢直至卡死
					if((this.chrome || this.safari || this.ff) && !this._testCrossDomainWindow(w, 3)){  //测试location属性访问
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
		this._pathAui   = v;
		this._classpath = v + "classes/";
		this._pathLib   = this._config["pathlib"] || v + "lib/";
		this._pathSrv   = v + "data/";
		var ext = this._win && this._win.location.port == "8081" ? ".jsp" : ".asp";
		this._srvFiles["service"] = "service" + ext;
		this._srvFiles["tool"]    = "tool" + ext;
		this._srvFiles["vfs"]     = "vfs" + ext;
		this._pathHtml  = v + "html/";
		this._pathImg   = this._pathLib + "images/";
		this._pathSkin  = this._pathLib + "skin/win2k/";
	};
	/**
	 * 系统对象方法扩展
	 */
	this._extendSystemObject = function(){
		//if(typeof HTMLElement != "undefined" && !window.opera){
		if(this.moz){  //window.HTMLElement
			var __proto = "prototype";
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
				while(n && n.nodeType != 1){
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
	};
	this.addOnLoad = function(agent, func){
		this._funs.push({
			"agent": agent,
			"func" : func
		});
	};
	this.createDelegate = function(obj, fn, args, appendArgs){
		if(!this.getConfData("core_shield")){
			return function(){
				var ap = Array.prototype;
				var callArgs = args || arguments;
				if(appendArgs === true){
					callArgs = ap.slice.call(arguments, 0);
					callArgs = callArgs.concat(args);
				}else if(typeof appendArgs == "number"){
					callArgs = ap.slice.call(arguments, 0);
					// copy arguments first
					var applyArgs = [appendArgs, 0].concat(args);
					// create method call params
					ap.splice.apply(callArgs, applyArgs);
					// splice them in
				}
				return obj[fn].apply(obj || window, callArgs);
			};
		}else{
			var _this = this;
			return function(){
				var ap = Array.prototype;
				try{
					var callArgs = args || arguments;
					if(appendArgs === true){
						callArgs = ap.slice.call(arguments, 0);
						callArgs = callArgs.concat(args);
					}else if(typeof appendArgs == "number"){
						callArgs = ap.slice.call(arguments, 0);
						// copy arguments first
						var applyArgs = [appendArgs, 0].concat(args);
						// create method call params
						ap.splice.apply(callArgs, applyArgs);
						// splice them in
					}
					return obj[fn].apply(obj || window, callArgs);
				}catch(ex){
					_this.error("[WebRuntime::createDelegate*]" + ex.message);
					_this.getActiveApp().showOperationFailed();  //[TODO]不一定是APP的错误
				}
			};
		}
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
	this.fireEvent = function(ev){
		var name = "on" + ev.type.capitalize();
		if(typeof this[name] == "function"){
			this[name](ev);
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
			this.fireEvent({"type": "contentLoaded"});
			//this.init();  //系统初始化
			//window.alert(this.getBrowser().getTestMode());
			break;
		case "unload":
			//try{  //屏蔽页面onunload时可能产生的错误
				if(!this._disposed){  //iframe内的runtime可能被提前执行过了
					this.dispose();
				}
				/*
				var hash = {
					"alz.core.BoxElement"    : true
				};
				for(var k in AObject.__hash__){
					var obj = AObject.__hash__[k];
					if(obj._className in hash && !obj._disposed){
						obj.dispose();
						delete AObject.__hash__[k];
					}
				}
				alert("check memleak");
				*/
			//}catch(ex){
			//	this.log("[WebRuntime::dispose]exception");
			//}
			//if(application) application = null;
			break;
		case "resize":
			this.fireEvent({
				"type": "resize",
				"w"   : document.documentElement.clientWidth,
				"h"   : document.documentElement.clientHeight
			});
			break;
		/*
		case "contextmenu":
		case "mousedown":
		case "mousemove":
		case "mouseup":
		*/
		default:
			if(this._workspace && this._workspace.eventHandle){
				return this._workspace.eventHandle(ev);
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
	this.getAppManager = function(){
		return this._appManager;
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
		var cxt = new LibContext(name, this);
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
	//日志输出接口
	/**
	 * 记录一条日志信息
	 */
	this.log = function(msg){
		this._log.push(msg);
		if(console){
			console.log(msg);
		}
	};
	/**
	 * 记录一条警告信息
	 */
	this.warning = function(msg){
		this._log.push("[warning]" + msg);
		if(console){
			console.warn(msg);
		}
	};
	/**
	 * 记录一条错误信息
	 */
	this.error = function(msg){
		this._log.push("[error]" + msg);
		if(console){
			console.error(msg);
		}
	};
	/**
	 * 注册一个应用
	 * @param {String} name 应用名称
	 * @param {Object} conf 应用的配置信息
	 */
	this.regApp = function(name, conf){
		this._appManager.regApp(name, conf);
	};
	this.createApp = function(context, appClassName, parentApp, len){
		return this._appManager.createApp(context, appClassName, parentApp, len);
	};
	/*
	this.regLib = function(name, lib){
		if(name == "aui" || name == "__init__"){
			this._contextList[name] = __context__;
			this.setLibContext(__context__);
			this.init(this._global);  //初始化最简的运行时环境
		}else{
			if(this._libManager.exists(name)){
				this.error("库(name=" + name + ")已经存在，请检查是否重名？");
				return;
			}
			this._libManager.reg(name, lib);
		}
	};
	*/
	/**
	 * 注册一个 lib 对象
	 * 每个lib应该默认最多存在一个Application的子类，appName若指定了APP类，则在lib
	 * 创建完毕时自动创建对应的APP类的实例。
	 * @param {String} name 库名
	 * @param {String} appName 库中应用的类名
	 * @param {Function} libImp 库实现函数
	 */
	this.regLib = function(name, appName, libImp){
		//this.createContext("alc")
		//this.createApp("alz.util.alc.AppAlc")
		var cxt = this.createContext(name);
		libImp(cxt);
		if(appName != ""){
			cxt.__context__.application = this.createApp(cxt, appName);  //第一个参数是新创建的Context实例
		}
		if(this._libManager.exists(name)){
			this.error("库(name=" + name + ")已经存在，请检查是否重名？");
		}
		this._libManager.reg(name.replace(/\.\w+$/, ""), {"context": cxt});
		return cxt;
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
			}
		}else{  //找不到，则认为库已经加载完毕
			console.log(lib);
			this._appManager.loadAppFiles(this._appManager._activeAppName, null, this, function(){
				if(lib && (lib.type == "lib" || lib.type == "tpl") || !lib){
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
			});
		}
	};
	/**
	 * 导出接口到对象 obj 上面
	 */
	this.exportInterface = function(scope){
		scope.runtime = this;  //导出全局对象 runtime
		/*
		 * 这个函数是为了过渡性考虑因素，模拟 Prototype 等系统而设计的，在这里并不建
		 * 议使用这样的系统函数。在获取 DOM 元素之后，仍然建议通过脚本组件操作 DOM元
		 * 素的相关属性。
		 */
		//scope.$ = function(id){return this.runtime.getElement(id);};
		/*
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
		var el = this._doc.createElement("div");
		el.style.position = "absolute";
		el.style.left = "-2000px";
		el.style.top = "-2000px";
		//el.style.font = "8pt tahoma";
		if(this._host.xul == true){
			return this._doc.documentElement.appendChild(el);
		}else{
			return this._doc.body.appendChild(el);
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
		var style = this._testDiv.style;
		style.width = "100px";
		style.height = "100px";
		style.border = "1px solid #000000";
		style.padding = "1px";
		var nType = this._testDiv.offsetWidth == 104 ? 1 : 0;
		style.width = "";
		style.height = "";
		style.border = "";
		style.padding = "";
		//this._doc.body.removeChild(this._testDiv);
		return nType;
	};
	this.getTextSize = function(text, font){
		if(!this._testDiv){
			this._testDiv = this._createTestDiv();
		}
		this._testDiv.style.font = font || "8pt tahoma";
		this._testDiv.innerHTML = this.encodeHTML(text);
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
		var el = this._doc.getElementById(id);
		if(!el) return null;
		if(!el._ptr){
			var c = new Component();
			c.init(el);
		}
		return el;
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
			var ai = Math.round(191 + 64 * Math.random()).toString(16);
			a[i] = ai.length < 2 ? "0" + ai : ai;
		}
		return "#" + a.join("");
	};
	this.getViewPort = function(element){
		var rect = {
			"x": element.scrollLeft,
			"y": element.scrollTop,
			"w": element.clientWidth,  //Math.max(element.clientWidth || element.scrollWidth)
			"h": Math.max(element.clientHeight, element.parentNode.clientHeight)  //Math.max(element.clientHeight || element.scrollHeight)
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
		//try{
		//	return JSON.parse(data);
		//}catch(ex){
			try{
				return eval("(" + data + ")");
			}catch(ex){  //json 解析错误
				if(this._debug){
					this.showException(ex, "parse json data error");
				}
				return null;
			}
		//}
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
	 * 模板替换函数
	 * @param {String} tpl 模板内容
	 * @param {Object} json 局部变量区
	 * @param {Object} hash 全局变量区
	 */
	this.formatTpl = function(tpl, json, hash){
		hash = hash || {};
		return tpl.replace(/\{\$(\w+)\}/ig, function(_0, _1){
			//return _1 in json ? json[_1] : (hash ? hash[_1] : _0);
			return _1 in hash ? hash[_1] : (_1 in json ? json[_1] : _0);
		});
	};
	this.tpl_replace = this.formatTpl;
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
	this.addThread = function(msec, agent, func){
		var f = typeof func == "string" ? agent[func] : func;
		/*
		_pool.push({
			"agent": agent,       //代理对象
			"func" : f,           //要执行的代码
			"time" : new Date(),  //当前时间
			"msec" : msec         //时间间隔
		});
		*/
		return window.setTimeout(function(){
			f.apply(agent);
		}, msec);
	};
	this.startTimer = function(msec, agent, func){
		var f = typeof func == "string" ? agent[func] : func;
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
	/*
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
	*/
	this.toArray = function(arrayLike){
		var rs = [];
		try{
			rs = [].slice.call(arrayLike, 0);
		}catch(e){  //for IE6/7/8
			for(var i = 0; j = arrayLike[i++];){
				rs.push(j);
			}
		}
		return rs;
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
			var el = this._doc.createElement("div");
			el.className = "ui-loging";
			el.style.display = "none";
			this._info = body.appendChild(el);
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

}});

runtime.regLib("core", "", function(){with(arguments[0]){

/*<file name="alz/core/XPathQuery.js">*/
_package("alz.core");

_import("alz.core.Plugin");

/**
 * 只是包装了一下Sizzle选择器
 */
_class("XPathQuery", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.create = function(name, app){
		_super.apply(this, arguments);
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.query = function(selector, context){
		return Sizzle(selector, context);
	};
//------------------------------------------------------------------------------
/*!
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function(){
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function(selector, context, results, seed) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var parts = [], m, set, checkSet, extra, prune = true, contextXML = Sizzle.isXML(context),
		soFar = selector, ret, cur, pop, i;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec("");
		m = chunker.exec(soFar);

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}
	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
			set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray(set);
			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}
		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );
		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function(results){
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort(sortOrder);

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[i-1] ) {
					results.splice(i--, 1);
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
	var set;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i], match;
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice(1,1);

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
	var old = expr, result = [], curLoop = set, match, anyFound,
		isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var filter = Expr.filter[ type ], found, item, left = match[1];
				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;
					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;
								} else {
									curLoop[i] = false;
								}
							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );
			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+\-]*)\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},
	leftMatch: {},
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},
	attrHandle: {
		href: function(elem){
			return elem.getAttribute("href");
		}
	},
	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test(part),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part){
			var isPartStr = typeof part === "string",
				elem, i = 0, l = checkSet.length;

			if ( isPartStr && !/\W/.test(part) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}
			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck, nodeCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck, nodeCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
		}
	},
	find: {
		ID: function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},
		NAME: function(match, context){
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [], results = context.getElementsByName(match[1]);

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match, curLoop, inplace, result, not, isXML){
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},
		ID: function(match){
			return match[1].replace(/\\/g, "");
		},
		TAG: function(match, curLoop){
			return match[1].toLowerCase();
		},
		CHILD: function(match){
			if ( match[1] === "nth" ) {
				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},
		ATTR: function(match, curLoop, inplace, result, not, isXML){
			var name = match[1].replace(/\\/g, "");
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match, curLoop, inplace, result, not){
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);
				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
					if ( !inplace ) {
						result.push.apply( result, ret );
					}
					return false;
				}
			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return (/h\d/i).test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
		},
		input: function(elem){
			return (/input|select|textarea|button/i).test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 === i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;
			} else {
				Sizzle.error( "Syntax error, unrecognized expression: " + name );
			}
		},
		CHILD: function(elem, match){
			var type = match[1], node = elem;
			switch (type) {
				case 'only':
				case 'first':
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}
					if ( type === "first" ) { 
						return true; 
					}
					node = elem;
				case 'last':
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}
					return true;
				case 'nth':
					var first = match[2], last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 
						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;
					if ( first === 0 ) {
						return diff === 0;
					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		CLASS: function(elem, match){
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},
		ATTR: function(elem, match){
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch(e){
	makeArray = function(array, results) {
		var ret = results || [], i = 0;

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};
} else {
	sortOrder = function( a, b ) {
		var ap = [], bp = [], aup = a.parentNode, bup = b.parentNode,
			cur = aup, al, bl;

		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// If the nodes are siblings (or identical) we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += Sizzle.getText( elem.childNodes );
		}
	}

	return ret;
};

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime();
	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
	root = form = null; // release memory in IE
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {
		Expr.attrHandle.href = function(elem){
			return elem.getAttribute("href", 2);
		};
	}

	div = null; // release memory in IE
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle, div = document.createElement("div");
		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function(query, context, extra, seed){
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && context.nodeType === 9 && !Sizzle.isXML(context) ) {
				try {
					return makeArray( context.querySelectorAll(query), extra );
				} catch(e){}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		div = null; // release memory in IE
	})();
}

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context, isXML) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	div = null; // release memory in IE
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

Sizzle.contains = document.compareDocumentPosition ? function(a, b){
	return !!(a.compareDocumentPosition(b) & 16);
} : function(a, b){
	return a !== b && (a.contains ? a.contains(b) : true);
};

Sizzle.isXML = function(elem){
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function(selector, context){
	var tmpSet = [], later = "", match,
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE

window.Sizzle = Sizzle;

})();
//------------------------------------------------------------------------------
});
/*</file>*/
/*<file name="alz/core/DOMUtil.js">*/
_package("alz.core");

_import("alz.core.Plugin");

/**
 * @class DOMUtil
 * @extends alz.lang.AObject
 * @desc 关于DOM操作的一些工具方法的集合
 * @example
var _dom = new DOMUtil();
 */
_class("DOMUtil", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._components = [];
		this._nodes = [];
		this._domTemp = null;
		this._css = null;
	};
	/**
	 * @method dispose
	 * @desc 析构方法
	 */
	this.dispose = function(){
		if(this._disposed) return;
		this._css = null;
		this._domTemp = null;
		//解除所有DOM元素和脚本对象的绑定关系
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i].dispose();
			this._nodes[i] = null;
		}
		this._nodes.length = 0;
		for(var i = 0, len = this._components.length; i < len; i++){
			this._components[i].dispose();
			this._components[i] = null;
		}
		this._components.length = 0;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.createDomElement = function(html, parent){
		if(!this._domTemp){
			this._domTemp = document.createElement("div");
		}
		this._domTemp.innerHTML = html;
		var el = this._domTemp.removeChild(this._domTemp.childNodes[0]);
		if(parent){
			parent.appendChild(el);
			/*
			//滞后加载图片
			var imgs = el.getElementsByTagName("img");
			for(var i = 0, len = imgs.length; i < len; i++){
				imgs[i].src = imgs[i].getAttribute("src0");
			}
			*/
		}
		return el;
	};
	/**
	 * @method getPos
	 * @param {Element} el DOM元素
	 * @param {Element} refElement el的容器元素
	 * @desc 计算 el 相对于 refElement 的位置，一定要保证 refElement 包含 el
	 * [TODO]如何计算绝对定位的元素？相对于外部的位置
	 */
	/*
	this.getPos = function(el, refElement){
		try{
		var pos = {"x": 0, "y": 0};
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
			/ *
			if(o != el && runtime.getBoxModel() == 0){
				x += this.parseNum(o.tagName, style.paddingLeft);
				y += this.parseNum(o.tagName, style.paddingTop);
			}
			* /
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
				//sb.push(s);
				break;
			}
			//sb.push(s);
			if(o.tagName == "BODY" || o.tagName == "HTML") break;
		}
		//$("log_off").value += "\n" + sb.join("\n");
		}catch(ex){
			window.alert(ex.message);
		}
		return pos;
	};
	*/
	this.getPos = function(el, refElement){
		try{
		var pos = {"x": 0, "y": 0};
		for(var o = el; o; o = o.offsetParent){
			var s = "tagName=" + o.tagName + ",className=" + o.className;
			var x = 0, y = 0, a, b;
			if(o != el && o != refElement){
				var border = this.getBorder(o);
				a = border.left;
				b = border.top;
				x += a;
				y += b;
			}
			if(o != refElement){
				pos.x += o.offsetLeft + (o != el ? x : 0);
				pos.y += o.offsetTop + (o != el ? y : 0);
			}else{
				var border = this.getBorder(o);
				a = border.left;
				b = border.top;
				pos.x += a;
				pos.y += b;
				break;
			}
			if(o.tagName == "BODY" || o.tagName == "HTML") break;
		}
		}catch(ex){
			window.alert(ex.message);
		}
		return pos;
	};
	/**
	 * @method getPos1
	 * @param {Event} ev 事件对象
	 * @param {Number} type 事件类型
	 * @param {Element} refElement 事件target的父容器
	 * @return {Object}
	 * @desc 相对于refElement容器，计算事件发生的坐标位置
	 */
	this.getPos1 = function(ev, type, refElement){
		var pos = type == 1 ? (
			runtime.ie ? {"x": ev.offsetX, "y": ev.offsetY} : {"x": ev.layerX, "y": ev.layerY}
		) : {"x": 0, "y": 0};
		refElement = refElement || runtime.getDocument().body;
		var el = ev.srcElement || ev.target;
		while(el && el != refElement){
			pos.x += el.offsetLeft;
			pos.y += el.offsetTop;
			el = el.offsetParent;
		}
		return pos;
	};
	/**
	 * 统一 IE 和 Moz 系列浏览器的差异
	 * @method parseNum
	 * @param {String} v
	 * @return {Number}
	 * @desc 把 v 转换成十进制表示的数字
	 */
	this.parseNum = function(/*tag, */v){
		/*
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
		*/
		var a = parseInt(v, 10);
		return isNaN(a) ? 0 : a;
	};
	/**
	 * 统一 IE 和 Moz 系列浏览器的差异
	 */
	this.getPropertyValue = function(style, name){
		//return runtime.ie ? style[name] : style.getPropertyValue(name);
		//return runtime.ie ? style[name] : (style.getPropertyValue(name) || style.getPropertyCSSValue(name));
		return style[name];
	};
	/**
	 * @method getStyle
	 * @param {Element} el
	 * @return {Object}
	 * @desc 获取 el 元素的所有样式
	 */
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
	/**
	 * @method getWH
	 * @param {Element} el DOM元素
	 * @return {Object}
	 * @desc 获取 el 的宽高
	 */
	this.getWH = function(el){
		var style = this.getStyle(el),
			width = this.parseNum(style["width"]),
			height = this.parseNum(style["height"]);
		return {
			w: width,
			h: height
		};
	};
	/**
	 * @method getPadding
	 * @param {Element} el DOM元素
	 * @desc 获取 el 的四个padding值
	 */
	this.getPadding = function(el){
		var style = this.getStyle(el),
			top = this.parseNum(style["paddingTop"]),
			right = this.parseNum(style["paddingRight"]),
			bottom = this.parseNum(style["paddingBottom"]),
			left = this.parseNum(style["paddingLeft"]);
		return {
			top: top,
			right: right,
			bottom: bottom,
			left: left
		};
	};
	/**
	 * @method getBorder
	 * @param {Element} el DOM元素
	 * @desc 获取 el 的四个border值
	 */
	this.getBorder = function(el){
		var style = this.getStyle(el),
			top = this.parseNum(style["borderTopWidth"]),
			right = this.parseNum(style["borderRightWidth"]),
			bottom = this.parseNum(style["borderBottomWidth"]),
			left = this.parseNum(style["borderLeftWidth"]);
		return {
			top: top,
			right: right,
			bottom: bottom,
			left: left
		};
	};
	/**
	 * @method getStyleProperty
	 * @param {Element} el DOM元素
	 * @param {String} name 样式名称
	 * @return {Number}
	 * @desc  获取 el 元素的 name 样式值
	 */
	this.getStyleProperty = function(el, name){
		var style = this.getStyle(el);
		return this.parseNum(/*el.tagName, */this.getPropertyValue(style, name) || el.style[name]);
	};
	/**
	 * @method setStyleProperty
	 * @param {Element} el DOM元素
	 * @param {Strinng} name 样式名称
	 * @param {Object} value 样式值
	 * @desc  设置 el 元素的 name 样式值为 value
	 */
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
	/**
	 * @method getObj
	 * @param {Element} el DOM元素
	 * @return {alz.mui.Component}
	 * @desc 获取绑定了 el 的Component实例
	 */
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
	/**
	 * @method getObj1
	 * @param {Element} el DOM元素
	 * @return {BoxElement}
	 * @desc 获取绑定了 el 的BoxElement实例
	 */
	this.getObj1 = function(el){
		var obj;
		if("__ptr__" in el && el.__ptr__){
			obj = el.__ptr__;
		}else{
			obj = new BoxElement(el, this);
			/*
			obj = {
				"_self": el,
				"dispose": function(){
					this._self.__ptr__ = null;
					this._self = null;
				}
			};
			el.__ptr__ = obj;
			*/
			this._nodes.push(obj);
		}
		return obj;
	};
	this._create = function(tag){
		return document.createElement(tag);
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
	/**
	 * @method getWidth
	 * @param {Element} el DOM元素
	 * @return {Number}
	 * @desc   获得 el 的可见宽度
	 */
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
	};
	/**
	 * @method getHeight
	 * @param  {Element} el DOM元素
	 * @return {Number}
	 * @desc   获得 el 的可见高度
	 */
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
	};
	/**
	 * @method setWidth
	 * @param {Element} el DOM元素
	 * @param {Number} v 宽度值[可选]
	 * @desc 设置 el 的 width 样式值
	 */
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
	};
	/**
	 * @method setHeight
	 * @param {Element} el DOM元素
	 * @param {Number} v 高度值[可选]
	 * @desc 设置 el 的 height 样式值
	 */
	this.setHeight = function(el, v){
		var obj = this.getObj1(el);
		if(!("_height" in obj)) obj._height = 0;
		v = Math.max(v/* - obj._marginTop - obj._marginBottom*/, 0);
		if(obj._height != v){
			obj._height = v;
			var w = this.getInnerHeight(el, v);
			this._setHeight(el, w);
		}
	};
	/**
	 * @method getInnerWidth
	 * @param  {Element} el DOM元素
	 * @param  {Number} v 宽度值[可选]
	 * @return {Number}
	 * @desc   获取 el 元素的 width 样式值
	 */
	this.getInnerWidth = function(el, v){
		var obj = this.getObj1(el);
		if(!v) v = obj._width;
		var innerWidth = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v - obj._borderLeftWidth - obj._borderRightWidth - obj._paddingLeft - obj._paddingRight);
		//var innerWidth = Math.max(0, runtime.getBoxModel() == 0 ? v : v - this._borderLeftWidth - this._borderRightWidth - this._paddingLeft - this._paddingRight);
		if(isNaN(innerWidth)) runtime.log("DomUtil::getInnerWidth isNaN(innerWidth)");
		return innerWidth;
	};
	/**
	 * @method getInnerHeight
	 * @param  {Element} el DOM元素
	 * @param  {Number} v 高度值[可选]
	 * @return {Number}
	 * @desc   获取 el 元素的 height 样式值
	 */
	this.getInnerHeight = function(el, v){
		var obj = this.getObj1(el);
		if(!v) v = obj._height || el.offsetHeight;
		var innerHeight = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v - obj._borderTopWidth - obj._borderBottomWidth - obj._paddingTop - obj._paddingBottom);
		if(isNaN(innerHeight)) runtime.log("DomUtil::getInnerHeight isNaN(innerHeight)");
		return innerHeight;
	};
	/**
	 * @method getOuterWidth
	 * @param  {Element} el DOM元素
	 * @param  {Number} v 宽度值[可选]
	 * @return {Number}
	 * @desc   获取 el 元素的占位宽度，包括 margin
	 */
	this.getOuterWidth = function(el, v){
		var obj = this.getObj1(el);
		if(!v) v = this.getWidth(el);
		var outerWidth = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v + obj._marginLeft + obj._marginRight);
		if(isNaN(outerWidth)) window.alert("DomUtil::getOuterWidth isNaN(outerWidth)");
		return outerWidth;
	};
	/**
	 * @method getOuterHeight
	 * @param  {Element} el DOM元素
	 * @param  {Number} v 宽度值[可选]
	 * @return {Number}
	 * @desc   获取 el 元素的占位高度，包括 margin
	 */
	this.getOuterHeight = function(el, v){
		var obj = this.getObj1(el);
		if(!v) v = this.getHeight(el);
		var outerHeight = Math.max(0, runtime._host.compatMode == "BackCompat" ? v : v + obj._marginTop + obj._marginBottom);
		if(isNaN(outerHeight)) window.alert("DomUtil::getOuterHeight isNaN(outerHeight)");
		return outerHeight;
	};
	/*
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
		/ *
		//if(runtime.getBoxModel() == 1){
			return Math.max(0, el.offsetWidth - this.getStyleProperty(el, "borderLeftWidth") - this.getStyleProperty(el, "paddingLeft") - this.getStyleProperty(el, "paddingRight") - this.getStyleProperty(el, "borderRightWidth"));
		//}
		* /
	};
	this.getInnerHeight = function(el){
		if(!el._ptr) this.getObj(el);
		return el._ptr.getInnerHeight();
	};
	*/
	/**
	 * @method resize
	 * @param  {Element} el DOM元素
	 * @param  {Number} w 宽度值
	 * @param  {Number} h 高度值
	 * @param  {Boolean} reDoSelf 是否调整自身大小
	 * @desc   调整大小
	 */
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
	/**
	 * @method resizeElement
	 * @param  {Element} el DOM元素
	 * @param  {Number} w 宽度值
	 * @param  {Number} h 高度值
	 * @desc   重置 el 宽高
	 */
	this.resizeElement = function(el, w, h){
		el.style.width = Math.max(0, w) + "px";
		el.style.height = Math.max(0, h) + "px";
	};
	/**
	 * @method moveElement
	 * @param  {Element} el DOM元素
	 * @param  {Number} x x坐标
	 * @param  {Number} y y坐标
	 * @desc   把 el 移动到(x, y)位置
	 */
	this.moveElement = function(el, x, y){
		el.style.left = Math.max(0, x) + "px";
		el.style.top = Math.max(0, y) + "px";
	};
	/**
	 * @method moveTo
	 * @param  {Element} el DOM元素
	 * @param  {Number} x x坐标
	 * @param  {Number} y y坐标
	 * @desc   把 el 移动到x, y)位置
	 */
	this.moveTo = function(el, x, y){
		var obj = this.getObj1(el);
		if(!("_left" in obj)) obj._left = 0;
		if(!("_top" in obj)) obj._top = 0;
		obj._left = x;
		this.setStyleProperty(el, "left", x + "px");
		obj._top = y;
		this.setStyleProperty(el, "top", y + "px");
	};
	/**
	 * @method setOpacity
	 * @param  {Element} el DOM元素
	 * @param  {Number} v 不透明度
	 * @desc   设置 el 的不透明度
	 */
	this.setOpacity = function(el, v){
		var obj = this.getObj1(el);
		if(!("_opacity" in obj)) obj._opacity = 0;
		if(obj._opacity != v || v === 0){
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
	};
	/**
	 * @method selectNodes
	 * @param  {Element} el DOM元素
	 * @param  {String} xpath xpath
	 * @desc   用xpath选取 el 的子节点
	 */
	this.selectNodes = function(el, xpath){
		return runtime.ie ? el.childNodes : el.selectNodes(xpath);
	};
	/**
	 * @method getViewPort
	 * @param  {Element} el DOM元素
	 * @return {Object}
	 * @desc   获取 el 的矩形信息，包括x，y，宽度和高度等。
	 */
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
	 * @method addEventListener
	 * @param {Element} el 要绑定事件侦听的DOM元素
	 * @param {String} type 事件类型，如果参数func为事件监听对象，则该参数将被忽略
	 * @param {Function|Object} func 事件响应函数或事件侦听对象
	 * @param obj 回调函数中的this指代对象，如果没有该参数，默认为el
	 * @desc 添加事件侦听器
	 */
	//[memleak]DOMUtil.__hash__ = {};
	//[memleak]DOMUtil.__id__ = 0;
	this.addEventListener = function(el, type, func, obj){
		//[memleak]el.__hashid__ = "_" + (DOMUtil.__id__++);
		//[memleak]DOMUtil.__hash__[el.__hashid__] = {el:el,type:type,func:func,obj:obj};
		switch(typeof func){
		case "function":
			el.__callback = (function(cb, obj){
				return function(ev){
					return cb.call(obj, ev || window.event);  //保证回调函数中的this是当前DOM对象或者对应的脚本组件
				};
			})(func, obj || el);
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
			})(func, obj || el);
			for(var k in func){
				if(el.attachEvent){
					el.attachEvent("on" + k, el.__callback);
				}else{
					el.addEventListener(k, el.__callback, false);
				}
			}
			break;
		}
	};
	/**
	 * @method removeEventListener
	 * @param {Element} el 要取消事件侦听的DOM元素
	 * @param {String} type 事件类型，如果参数func为事件监听对象，则该参数将被忽略
	 * @param {Function|Object} func 事件响应函数或事件侦听对象
	 * @desc 取消事件侦听
	 */
	this.removeEventListener = function(el, type, func){
		if(!el.__callback) return;
		//[memleak]delete DOMUtil.__hash__[el.__hashid__];
		switch(typeof func){
		case "function":
			if(el.detachEvent){
				el.detachEvent("on" + type, el.__callback);
			}else{
				el.removeEventListener(type, el.__callback, false);
			}
			break;
		case "object":
			for(var k in func){
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
	/**
	 * @method trigger
	 * @param {Element} el 要触发事件的目标元素
	 * @param {String} type 事件类型
	 * @desc 触发 type 事件
	 */
	this.trigger = function(el, type){
		try{
			if(el.dispatchEvent){
				var evt = document.createEvent('Event');
				evt.initEvent(type, true, true);
				el.dispatchEvent(evt);
			}else if(el.fireEvent){
				el.fireEvent("on" + type);
			}else{
				el[ type ]();
			}
		}catch(ex){
			window.alert(ex);
		}
	};
	/**
	 * @method contains
	 * @param {Element} el DOM元素
	 * @param {Element} obj DOM元素
	 * @return {Boolean}
	 * @desc el 元素是否包含 obj 元素
	 */
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
	/**
	 * @method parseRule
	 */
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
	/**
	 * @method parseCss
	 */
	this.parseCss = function(rules){
		var hash = {};
		for(var i = 0, len = rules.length; i < len; i++){
			var rule = rules[i];
			if(rule.type == 2) continue;
			//rule.selectorText + "{" + rule.style.cssText + "}"
			this.parseRule(hash, rule.selectorText.split(" "), rule.style);
		}
		return hash;
	};
	/**
	 * @method cssKeyToJsKey
	 * @param {String} str CSS样式名称
	 * @desc 把CSS样式名称转换为JS表示法
	 */
	this.cssKeyToJsKey = function(str){
		return str.replace(/-([a-z])/g, function(_0, _1){
			return _1.toUpperCase();
		});
	};
	/**
	 * @method applyCssStyle
	 * @param {Element} el 要控制的DOM元素
	 * @param {JsonCssData} css json格式的CSS数据
	 * @param {String} className 样式名称(class属性值)
	 * @desc 应用json格式的css样式控制DOM元素的外观
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
				}else{
					var name = this.cssKeyToJsKey(k);
					if(el._self.style[name] != v){
						el._self.style[name] = v;
					}
				}
			}
		}
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
				}
			}
		}
	};
	this.addClass = function(el, cls){
		el.className = el.className ? el.className + " " + cls : cls;
	};
	this.removeClass = function(el, cls){
		var arr = el.className.replace(/ +/g, " ").split(" ");
		var sb = [];
		for(var i = 0, len = arr.length; i < len; i++){
			var a = arr[i];
			if(a != ""){
				if(a != cls){
					sb.push(a);
				}
			}
		}
		el.className = sb.join(" ");
	};
	this.replaceClass = function(el, oldCls, newCls){
		var arr = el.className.replace(/ +/g, " ").split(" ");
		var sb = [];
		for(var i = 0, len = arr.length; i < len; i++){
			var a = arr[i];
			if(a != ""){
				sb.push(a != oldCls ? a : newCls);
			}
		}
		el.className = sb.join(" ");
	};
});
/*</file>*/
/*<file name="alz/core/BoxElement.js">*/
_package("alz.core");

_class("BoxElement", "", function(_super, _event){
	this._init = function(el, dom){
		_super._init.call(this);
		this._dom = dom;
		this._self = null;
		this.init(el);
	};
	this.init = function(obj){
		obj.__ptr__ = this;
		this._self = obj;
		//chrome,safari下marginRight等属性会自动变化，所以使用缓存，不再重新获取
		var sc = runtime.chrome || runtime.safari;
		if(sc && obj.__properties__){
			for(var k in obj.__properties__){
				this[k] = obj.__properties__[k];
			}
		}else{
			//初始化应用到的属性，从DOM对象中解析出实际的值，只读方式使用
			var properties = [
				"width","height",
				"marginBottom","marginLeft","marginRight","marginTop",
				"borderBottomWidth","borderLeftWidth","borderRightWidth","borderTopWidth",
				"paddingBottom","paddingLeft","paddingRight","paddingTop"
			];
			/*
			var hash = {};
			for(var i = 0, len = properties.length; i < len; i++){
				var key = properties[i];
				if(!("_" + key in this)){
					this["_" + key] = this._dom.getStyleProperty(obj, key);
					if(sc){
						hash["_" + key] = this["_" + key];
					}
				}
			}
			*/
			var hash = {},
				_this = this,
				dom = this._dom,
				style = dom.getStyle(obj);
			for(var i = 0, key; key = properties[i++];){
				if(!("_" + key in _this)){
					_this["_" + key] = dom.parseNum(style[key]);
					if(sc){
						hash["_" + key] = _this["_" + key];
					}
				}
			}
			if(sc){
				obj.__properties__ = hash;
			}
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		/*if(this._self.__layout){
			this._self.__layout.dispose();
			this._self.__layout = null;
		}*/
		try{
			this._self.__ptr__ = null;
		}catch(ex){
		}
		this._self = null;
		this._dom = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setLeft = function(x){
		this._self.style.left = x + "px";
	};
	this.setTop = function(y){
		this._self.style.top = y + "px";
	};
	this.getWidth = function(){
		return this._dom.getWidth(this._self);
	};
	this.setWidth = function(w){
		this._dom.setWidth(this._self, w);
	};
	this.getHeight = function(){
		/*
		var h = this._height;
		if(h != this._dom.getHeight(this._self)){
			runtime.log(this._self.className + ":" + h + "!=" + this._dom.getHeight(this._self));
		}
		return this._height;
		*/
		return this._dom.getHeight(this._self);
	};
	this.setHeight = function(h){
		this._dom.setHeight(this._self, h);
	};
	this.getInnerWidth = function(){
		return this._width;
	};
	this.setInnerWidth = function(w, skip){
		//绝对定位，marginRight没有作用
		//this.setWidth(w/*- this._marginLeft - this._marginRight*/);
		this._self.style.width = Math.max(0, w
			- (skip ? 0 : (this._marginLeft + this._marginRight))
			- this._borderLeftWidth - this._borderRightWidth
			- this._paddingLeft - this._paddingRight
		) + "px";
		if(this._self.__onWidthChange){
			this._self.__onWidthChange.call(this);
		}
	};
	this.getInnerHeight = function(){
		return this._height;
	};
	this.setInnerHeight = function(h){
		//this.setHeight(h - this._marginTop - this._marginBottom);
		this._self.style.height = Math.max(0, h
			- this._marginTop - this._marginBottom
			- this._borderTopWidth - this._borderBottomWidth
			- this._paddingTop - this._paddingBottom
		) + "px";
	};
	this.hasLayout = function(){
		if(!this._layout){
			this._layout = this._self.getAttribute("_layout");
		}
		return this._layout;
	};
	/*
	this.layout = function(){
		//this._self.style.overflow = "hidden";
		if(!this._self.__layout){
			var clazz = __context__[this._layout];  //"alz.layout." + this._layout  //BorderLayout
			this._self.__layout = new clazz();
			this._self.__layout.init(this._self);
		}
		this._self.__layout.layoutElement(
			this._self.clientWidth - this._paddingLeft - this._paddingRight,
			this._self.clientHeight - this._paddingTop - this._paddingBottom
		);
	};
	*/
	this.layout = function(){
		//this._self.style.overflow = "hidden";
		var clazz = __context__.__classes__["alz.layout." + this._layout];  //BorderLayout
		var self = this._self;
		var layout = new clazz();
		layout.init(self);
		layout.layoutElement(
			self.clientWidth - this._paddingLeft - this._paddingRight,
			self.clientHeight - this._paddingTop - this._paddingBottom
		);
		layout.dispose();
	};
});
/*</file>*/
/*<file name="alz/layout/AbstractLayout.js">*/
_package("alz.layout");

_class("AbstractLayout", "", function(_super, _event){
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
		if(this._disposed) return;
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

_class("BorderLayout", AbstractLayout, function(_super, _event){
	var TAGS = {"NOSCRIPT": 1, "INPUT": 1};
	var CLASSES = {"ui-modalpanel": 1, "ui-dialog": 1};
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
			var node = nodes[i];
			if(node.nodeType != 1) continue;  //NODE_ELEMENT
			if(node.tagName in TAGS) continue;
			if(node.className in CLASSES) continue;
			if(node.style.display == "none") continue;
			var align = node.__ptr__ && node.__ptr__._align || node.getAttribute("_align");
			if(!align){
				runtime.log("[WARNING]使用布局的结点(tagName=" + node.tagName + ",class=" + node.className + ")缺少_align属性，默认为_align=top");
				align = "top";
			}
			if(align == "none") continue;
			if(align == "client"){
				if(this._clientNode){
					runtime.log("[WARNING]使用布局的结点只能有一个_align=client的子结点");
				}
				this._clientNode = node;
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
			this._nodes.push(node);
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
				var node = this._nodes[i];
				node.style.position = "absolute";
				node.style.styleFloat = "";
				//node.style.overflow = "auto";
			}
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._clientNode = null;
		var nodes = this._nodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			//if(nodes[i]._self){
			//	nodes[i].dispose();  //[TODO]应该在DomUtil::dispose中处理
			//}
			nodes[i] = null;
		}
		this._nodes.length = 0;
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
		//if(this._self.className == "wui-PaneContactTable"){
		//	window.alert(w + "," + h);
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
				}
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
				}
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
		}
		return this._nodes;
	};
	*/
	/**
	 * 获取参与布局的结点
	 */
	/*
	this._getAlignNodes = function(){
		//this._getNodes();
		var nodes = [];
		for(var i = 0, len = this._nodes.length; i < len; i++){
			var node = this._nodes[i];
			if(node.style.display == "none") continue;
			if(!node.__ptr__){
				node.__ptr__ = new BoxElement(node, runtime.dom);
			}
			nodes.push(node.__ptr__);
		}
		return nodes;
	};
	*/
	this._getAlignNodes = function(){
		var dom = runtime.dom;
		var nodes = [];
		for(var i = 0, len = this._nodes.length; i < len; i++){
			var node = this._nodes[i];
			if(node.style.display == "none") continue;
			nodes.push(new BoxElement(node, dom));
		}
		return nodes;
	};
	this.getClientNodeWidth = function(w, nodes){
		//var nn = runtime.dom.getStyleProperty(this._self, "paddingLeft");  //考虑paddingLeft
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
		}
		return w - nn;
	};
	this.getClientNodeHeight = function(h, nodes){
		//var nn = runtime.dom.getStyleProperty(this._self, "paddingTop");  //考虑paddingTop
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
//			var top = runtime.dom.getStyleProperty(node._self, "top");
//			console.log(top);
//			if(top == -23){
//				nn += top;
//				console.log(nn)
//			}
//			nn += top;
		}
		return h - nn;
	};
	this.updateDock =
	this.layoutElement = function(w, h){
		//if(this._width == w && this._height == h) return;
		//this._width = w;
		//this._height = h;
		this._component.resizeTo(w, h);
		if(this._self && this._self.__ptr__){
			this._self.__ptr__._height = h;
		}
		//if(this._self.className == "ff_cntas_list"){
		//	window.alert(w + "," + h);
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
			*/
			return;
		}else if(this._self.tagName != "BODY" && this._self.tagName != "TD"){
			//window.alert(this._self.tagName + "," + w + "," + h);
			//高度和宽度已经被父元素调整过了
			//if(w) runtime.dom.setWidth(this._self, w);
			//if(h) runtime.dom.setHeight(this._self, h);
			//if(w) w = runtime.dom.getInnerWidth(this._self);  //this._self.clientWidth - this._paddingLeft - this._paddingRight;
			//h = runtime.dom.getInnerHeight(this._self);  //this._self.clientHeight - this._paddingTop - this._paddingBottom;
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
			}
		}
		for(var i = 0, len = nodes.length; i < len; i++){
			nodes[i].dispose();
			nodes[i] = null;
		}
	};
});
/*</file>*/
//import alz.core.DomUtil2;
/*<file name="alz/core/AjaxEngine.js">*/
_package("alz.core");

//_import("alz.core.Exception");
_import("alz.core.Plugin");
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
_class("AjaxEngine", Plugin, function(_super, _event){
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
		if(this._disposed) return;
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
		this._queue.length = 0;
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
			http.setRequestHeader("HTTP-X-Requested-With", "XMLHttpRequest");
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
	 * @param {Function} func 回调函数
	 * @param {Array} cbAgrs 传给回调方法的参数
	 * @return {String|XmlDocument}
	 */
	this.netInvoke1 = function(method, url, postData, type, func){
		try{
			var async = (typeof func != "undefined" && func != null) ? true : false;
			if(async){  //如果是异步请求，使用请求队列工作模式
				return this.netInvoke(method, url, postData, type, func);
			}else{
				var http = this._openHttp(method, url, async);
				/*
				var el = document.createElement("div");
				el.style.backgroundColor = "#EEEEEE";
				el.innerHTML = url + "&" + postData;
				im_history.appendChild(el);
				*/
				http.send(postData);  //FF下面参数null不能省略
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
			if(typeof VBS_bytes2BStr == "undefined"){
				runtime.getWindow().execScript(AjaxEngine._vbsCode, "VBScript");
			}
			return VBS_bytes2BStr(http.responseBody);
		}else{
			//[TODO]直接返回 responseText 会有因 UTF-8 编码而引起的乱码问题
			return http.responseText;
		}
	};
	//供加载类库代码使用的方法
	this.netInvoke2 = function(method, url, postData, charset, agent, func, args){
		var async = (typeof agent != "undefined" && agent != null) ? true : false;
		if(async){  //如果是异步请求，使用请求队列工作模式
			return this.netInvoke(method, url, postData, type, agent, func, args);
		}else{
			var http = this._openHttp(method, url, async);
			if(runtime.getHostenv() == "safari" || runtime.getHostenv() == "chrome"){  //Safari下面需要这一句
				http.onreadystatechange = null;
			}
			/*if(async){
				http.onreadystatechange = function(){
					if(http.readyState != 4) return;
					if(typeof agent[func] == "function"){
						agent[func](http.responseText);
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
			return data;
			//}
		}
	};
	/**
	 * 可以复用HTTP组件的网络调用
	 * @param {String} method 提交方法(GET|POST)
	 * @param {String} url 网络调用的url
	 * @param {String|Object} postData 请求数据
	 * @param {String} type 返回只类型(text|json|xml)
	 * @param {Object|Function} agent 回调代理对象或者函数对象
	 * @param {Function|String} func 回调代理对象的回调方法名称
	 * @param {Array} cbAgrs 传给回调方法的参数
	 * @return {String|XmlDocument}
	 * [TODO]
	 *   1)检查 agent 和 agent[func] 必须有一个是 Function 对象
	 */
	this.netInvoke = function(method, url, postData, type, agent, func, cbArgs){
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
		//	check typeof agent || agent[func] == "function"
		//}
		var req = {
			"uniqueid": ++this._uniqueId,  //先加后用
			"action"  : runtime._actionCollection.getActiveAction(),  //关联当前的action对象
			"method"  : method,
			"url"     : url,
			"data"    : (typeof postData == "string" ? postData : json2str(postData)),
			"type"    : type,
			"agent"   : agent,
			"func"    : func,
			"args"    : cbArgs
		};
		if(method == "GET" && req.data != ""){
			req.url = req.url + (req.url.indexOf("?") == -1 ? "?" : "&") + req.data;
			req.data = "";
		}
		this._queue.push(req);
		if(this._timer == 0){
			this._startAjaxThread();
		}
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
		this._timer = runtime.startTimer(msec || this._msec, this, "_ajaxThread");
	};
	this._checkAjaxThread = function(retry){
		if(this._queue.length != 0){
			this._startAjaxThread(retry ? this._retryMsec : this._msec);
		}else{
			this.pauseAjaxThread();
		}
	};
	this._ajaxThread = function(){
		var req  = this._queue[0];
		if(runtime._testCaseWin){
			runtime._testCaseWin.log(req.url + "?" + req.data);
		}
		if(this._testCase && this._testCase.doFilter(req.url)){
			var o = this._testCase.doService(req.url, this._testCase.getRequest(req.data));
			if(o){
				runtime.startTimer(0, this, function(){
					this._onTestCaseCallback(o);
				});
			}
		}else{
			var _this = this;
			if(req.type == "script_json"){
				var loader = this._getScriptLoader();
				loader.setCallback(function(){
					_this._onScriptCallback();
				});
				loader.load(req.url, req.data);
			}else{
				var http = this._openHttp(req.method, req.url, true);
				http.onreadystatechange = function(){
					//try{
						_this._onAsyncCallback();
					//}catch(ex){  //屏蔽异步请求错误
					//	alert(ex.message);
					//}
				};
				http.send(req.data);
			}
		}
		return;
	};
	this._onTestCaseCallback = function(o){
		var req = this._queue[0];
		//调用真实的回调函数
		if(typeof req.agent == "function"){
			req.agent(o, req.args);
		}else if(typeof req.func == "function"){
			req.func.call(req.agent, o, req.args);
		}else{
			req.agent[req.func](o, req.args);
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
			if(typeof req.agent == "function"){
				//try{
					req.agent(o, req.args);
				//}catch(ex){
				//	if(ex.message != this._ignoreMessages[0]){
				//		throw ex;
				//	}
				//}
			}else if(typeof req.func == "function"){
				//try{
					req.func.call(req.agent, o, req.args);
				//}catch(ex){
				//	if(ex.message != this._ignoreMessages[0]){
				//		throw ex;
				//	}
				//}
			}else{
				//try{
					req.agent[req.func](o, req.args);
				//}catch(ex){
				//	if(ex.message != this._ignoreMessages[0]){
				//		throw ex;
				//	}
				//}
			}
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
		if(typeof req.agent == "function"){
			//try{
				req.agent(o, req.args);
			//}catch(ex){
			//	if(ex.message != this._ignoreMessages[0]){
			//		throw ex;
			//	}
			//}
		}else if(typeof req.func == "function"){
			//try{
				req.func.call(req.agent, o, req.args);
			//}catch(ex){
			//	if(ex.message != this._ignoreMessages[0]){
			//		throw ex;
			//	}
			//}
		}else{
			//try{
				req.agent[req.func](o, req.args);
			//}catch(ex){
			//	if(ex.message != this._ignoreMessages[0]){
			//		throw ex;
			//	}
			//}
		}
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
	this.netInvoke = function(method, url, postData, type, func){
		try{
			var async = func ? true : false;
			this._http.open(method, url, async);
			if(async){
				var _this = this;
				this._http.onreadystatechange = function(){
					if(_this._http.readyState == 4){
						_this.onreadystatechange(type, func);
					}
				};
			}
			/ *
			var el = runtime.getDocument().createElement("div");
			el.style.backgroundColor = "#EEEEEE";
			el.innerHTML = url + "&" + postData;
			im_history.appendChild(el);
			* /
			if(method == "POST"){
				this._http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				this._http.setRequestHeader("HTTP-X-Requested-With", "XMLHttpRequest");
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
	this.onreadystatechange = function(type, func){
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
		if(func){
			func(o);
		}else{
			return o;
		}
	};
	*/
	/**
	 * 调用一个请求队列
	 * @param {Array} queue 请求队列数组
	 * @param {Object} agent 回调代理对象
	 * @param {Function} func 回调函数
	 */
	this.netInvokeQueue = function(queue, agent, func){
		var i = 0;
		function cb(){
			if(i < queue.length){
				var req = queue[i];
				//netInvoke(method, url, postData, type, agent, func)
				this.netInvoke(req[0], req[1], req[2], req[3], this, function(data){
					var agent = req[4];
					var func  = req[5];
					//调用真实的回调函数
					if(typeof agent == "function"){
						agent(data, req[6]);
					}else if(typeof func == "function"){
						func.call(agent, data, req[6]);
					}else{
						agent[func](data, req[6]);
					}
					i++;
					runtime.startTimer(0, this, cb);  //调用下一个
				});
			}else{  //队列完成
				func.apply(agent);
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
_class("Ajax", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._ajax = runtime.getAjax();
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._ajax = null;
		//[memleak]this.__caller__ = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	//具体参数含义参考AjaxEngine对应的方法
	this.netInvoke = function(method, url, postData, type, agent, func, cbArgs){
		//[memleak]this.__caller__ = method + "," + url + "," + postData + "," + type + "," + agent + "," + func + "," + cbArgs;
		var ret = this._ajax.netInvoke.apply(this._ajax, arguments);
		this.dispose();
		return ret;
	};
	this.netInvokeQueue = function(queue, agent, callback){
		this._ajax.netInvokeQueue.apply(this._ajax, arguments);
		this.dispose();
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
/*<file name="alz/core/AbstractModel.js">*/
_package("alz.core");

/**
 * ftype含义
 * 1=系统邮件夹
 * 0=自建邮件夹
 * 2=代收邮件夹
 * [TOOD]是否应该让子类实现如下接口？
 *   dataFormat
 *   appendItem
 *   updateItem
 *   removeItem
 *   appendItems
 *   removeItems
 */
_class("AbstractModel", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._parent = null;
		this._parentModel = null;  //父数据模型
		this._primaryKey = "";  //主键
		this._hash = {};  //(哈希表)数据列表
		this._list = [];  //数据数组(当含有排序信息后，可以当作主索引使用)
		this._hashIndexs = {};  //索引哈希(每个元素是一个数组)
		this._listeners = [];  //数据监听组件列表
	};
	this.create = function(parent){
		this._parent = parent;
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._listeners.length; i < len; i++){
			this._listeners[i] = null;
		}
		this._listeners.length = 0;
		for(var k in this._hashIndexs){
			for(var i = 0, len = this._hashIndexs.length; i < len; i++){
				this._hashIndexs[k][i] = null;
			}
			delete this._hashIndexs[k];
		}
		this.dataReset();  //重置数据对象
		this._parentModel = null;
		this._parent = null;
		_super.dispose.apply(this);
	};
	this.getPrimaryKey = function(){
		return this._primaryKey;
	};
	this.getListByFilter = function(filter){
		var arr = [];
		for(var i = 0, len = this._list.length; i < len; i++){
			var item = this._list[i];
			if(filter(item)){
				arr.push(item);
			}
		}
		return arr;
	};
	/**
	 * 添加一个数据监听对象
	 * @param listener {FolderListView} 实现了onDateChange接口的视图组件
	 */
	this.addDataListener = function(listener){
		this._listeners.push(listener);
	};
	this.removeDataListener = function(listener){
		this._listeners.removeAt(this._listeners.indexOf(listener));
	};
	/**
	 * 分派数据变化（事件）
	 * @param act {String}
	 * @param data {JsonObject}
	 * @param olddata {JsonObject}
	 */
	this.dispatchDataChange = function(act, data, olddata){
		for(var i = 0, len = this._listeners.length; i < len; i++){
			//[TODO]未释放的脚本对象
			try{
				var listener = this._listeners[i];
				var action = act.split("_")[1];
				switch(action){
				case "add":
					if(!listener.getFilter || listener.getFilter()(data)){  //有过滤器的话，需要先通过过滤器，才添加
						listener.onDataChange.apply(listener, arguments);
					}
					break;
				case "mod":
					//if(!listener.getFilter || listener.getFilter()(data)){  //有过滤器的话，情况比较复杂，先交给“视图组件”来自行处理
					listener.onDataChange.apply(listener, arguments);
					//}
					break;
				case "del":
					if(!listener.getFilter || listener.getFilter()(data)){  //有过滤器的话，需要先通过过滤器，才删除
						listener.onDataChange.apply(listener, arguments);
					}
					break;
				/*
				case "remove":
				case "update":
				case "delete":
				case "clear":
				case "up":
				case "adds":
				case "clean":
				*/
				default:
					listener.onDataChange.apply(listener, arguments);
					break;
				}
			}catch(ex){
			}
		}
	};
	//子类必须实现的接口方法
	_abstract(this, "onDataChange");
	_abstract(this, "dataFormat", function(listData){});
	_abstract(this, "appendItem", function(data){});
	_abstract(this, "updateItem", function(data){});
	_abstract(this, "removeItem", function(id){});
	_abstract(this, "appendItems", function(data){});
	_abstract(this, "updateItems", function(data){});
	_abstract(this, "removeItems", function(ids){});
	/*
	this.dataFormat = function(dataList){};
	this.appendItem = function(data){};  //添加一条数据
	this.updateItem = function(data){};  //更新一条数据
	this.removeItem = function(id){};    //删除一条数据
	this.appendItems = function(data){};  //添加N条数据
	this.updateItems = function(data){};  //更新N条数据
	this.removeItems = function(ids){};  //删除N条数据
	*/
	this.dataReset = function(){
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i] = null;
		}
		this._list.length = 0;
		for(var k in this._hash){
			delete this._hash[k];
		}
	};
	this.checkJsonData = function(json, silent){
		return this._parent._app.checkJsonData(json, silent);
	};
	this.callback = function(agent, func, json){
		if(typeof func == "function"){
			func.call(agent, json);
		}else{
			agent[func](json);
		}
	};
});
/*</file>*/
/*<file name="alz/core/ActionStack.js">*/
_package("alz.core");

/**
 * 动作栈，管理APP内部的前进、后退功能
 */
_class("ActionStack", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._stack = [];  //动作栈
		this._oldAction = null;  //前一个动作
		this._activeAction = null;  //当前活动的动作
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activeAction = null;
		this._oldAction = null;
		for(var i = 0, len = this._stack.length; i < len; i++){
			this._stack[i] = null;
		}
		this._stack.length = 0;
		_super.dispose.apply(this);
	};
	/**
	 * @param action {type:"",data:null}
	 */
	this.push = function(action){
		this._stack.push(action);
	};
	this.pop = function(){
		var action;
		if(this._stack.length > 1){
			action = this._stack.pop();  //最后一个动作出栈
			this._activeAction = this.top();
			this._oldAction = this._stack.length < 2 ? "" : this._stack[this._stack.length - 2];
		}else{
			runtime.log("动作栈已经被清空，您没有后路可退啦！");
		}
		return action;
	};
	this.top = function(){
		return this._stack[this._stack.length - 1];
	};
	this.__item__ = function(index){
		return this._stack[index];
	};
	this.getLength = function(){
		return this._stack.length;
	};
	this.getOldAction = function(){
		return this._oldAction;
	};
	this.setOldAction = function(v){
		this._oldAction = v;
	};
	this.getActiveAction = function(){
		return this._activeAction;
	};
	this.setActiveAction = function(v){
		this.setOldAction(this.top());
		this._activeAction = v;
	};
});
/*</file>*/
/*<file name="alz/core/ActionManager.js">*/
_package("alz.core");

/**
 * Action管理者类(Pane专用元素管理类)
 */
_class("ActionManager", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._actionEngine = null;  //动作执行引擎，实现了doAction接口的类的实例
		this._nodes = {};  //所管理的全部action组件
		this._components = [];
		this._focusbutton = null
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
		this._components.length = 0;
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
	/**
	 * 获取action响应类
	 */
	this.getActionEngine = function(){
		return this._actionEngine;
	};
	this.setFocusButton = function(btn){
		this._focusbutton = btn;
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
	};*/
	/**
	 * 启用名字为name对的action(可能是一组)
	 */
	this.enable = function(name){
		this.updateState(name, {"disabled": false});
	};
	/**
	 * 禁用名字为name对的action(可能是一组)
	 */
	this.disable = function(name){
		this.updateState(name, {"disabled": true});
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
			var node = nodes[i];
			for(var k in state){  //visible,disabled
				var name = "set" + k.charAt(0).toUpperCase() + k.substr(1);
				if(name in node){
					node[name](state[k]);
				}
			}
		}
	};
	/**
	 * 分派一个action
	 * @param {String} name action的名字
	 * @param {Element} sender action发送者
	 * @param {Event} ev 原始的事件
	 */
	this.dispatchAction = function(name, sender, ev){
		if(this._actionEngine.doAction){
			return this._actionEngine.doAction(name, sender, ev);
		}
	};
});
/*</file>*/
/*<file name="alz/core/ActionCollection.js">*/
_package("alz.core");

_import("alz.core.Plugin");

/**
 * action收集器
 */
_class("ActionCollection", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._list = [];
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
	this.append = function(action){
		this._list.push(action);
	};
	this.onDispatchAction = function(action, sender, ev){
		this.append({
			"ts"     : new Date().getTime(),
			"name"   : action,
			"sender" : sender,
			"result" : true,
			"usetime": 0,
			"feature": {
				"net_num": 0,
				"dat_num": 0,
				"flow"   : false
			}
		});
		this.showList();
	};
	this.showList = function(){
		var sb = [];
		for(var i = 0, len = this._list.length; i < len; i++){
			var item = this._list[i];
			sb.push(
				item.ts + ","
				+ item.name + ","
				+ (item.sender ? item.sender.tagName : "") + ","
				+ item.result + ","
				+ item.usetime
			);
		}
		//window.alert(sb.join("\n"));
	};
	/**
	 * 获取当前的action对象，该方法不能在action被触发之后的某个异步过程之中使用
	 */
	this.getActiveAction = function(){
		return this._list[this._list.length - 1];
	};
});
/*</file>*/
/*<file name="alz/core/ProductManager.js">*/
_package("alz.core");

_import("alz.core.Plugin");

/**
 * 产品配置信息管理者类
 */
_class("ProductManager", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		/**
		 * 产品配置数据
		 * {
		 *   name: "sinamail-5.0",  //产品名称
		 *   tpl: [],   //模板
		 *   skin: [],  //皮肤
		 *   paper: []  //信纸
		 * }
		 */
		this._products = {};  //产品配置数据，格式[{name:"",tpl:[],skin:[],paper:[]},...]
		this._activeProduct = null;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activeProduct = null;
		for(var k in this._products){
			delete this._products[k];
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * 注册一个产品配置数据
	 * @param {JsonObject} data 产品配置对象
	 */
	this.regProduct = function(data){
		if(data.name in this._products){
			window.alert("[ERROR]产品" + data.name + "已经注册过了");
		}else{
			this._products[data.name] = data;
			this._activeProduct = data;
		}
	};
	this.getActiveProduct = function(){
		if(this._activeProduct){
			return this._activeProduct;
		}
		for(var k in this._products){
			return this._products[k];
		}
		runtime.log("[WebRuntime::getProduct]data_xxx.js未能正确加载，系统无法正常运行，请检查！");
		return {
			"name" : "",  //产品名称
			"tpl"  : [],  //模板
			"skin" : [],  //皮肤
			"paper": [],  //信纸
			"app"  : []   //APP配置
		};
		//return null;
	};
});
/*</file>*/
/*<file name="alz/core/ToggleGroup.js">*/
_package("alz.core");

/**
 * 状态按钮分组
 */
_class("ToggleGroup", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._buttons = [];
		this._activeButton = null;
	};
	this.append = function(btn){
		this._buttons.push(btn);
	};
	this.toggle = function(v){
		if(this._activeButton == v){
			if(this._activeButton){
				this._activeButton.setToggled(false);
				this._activeButton = null;
			}
			return;
		}
		if(this._activeButton){
			this._activeButton.setToggled(false);
		}
		v.setToggled(true);
		this._activeButton = v;
	};
});
/*</file>*/
/*<file name="alz/core/ToggleManager.js">*/
_package("alz.core");

_import("alz.core.ToggleGroup");

/**
 * 双态按钮管理者
 */
_class("ToggleManager", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._groups = {};
	};
	this.add = function(btn){
		var groupid = btn.getGroupId();
		if(!this._groups[groupid]){
			this._groups[groupid] = new ToggleGroup();
		}
		this._groups[groupid].append(btn);
	};
	this.toggle = function(btn){
		this._groups[btn.getGroupId()].toggle(btn);
	};
});
/*</file>*/
/*<file name="alz/core/Animate.js">*/
_package("alz.core");

/**
 * 一个元素的一个动画效果代理
 */
_class("Animate", "", function(_super, _event){
	this.props = ("backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth "
		+ "borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize "
		+ "fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight "
		+ "maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft "
		+ "paddingRight paddingTop right textIndent top width wordSpacing zIndex "
		+ "borderBottomLeftRadius borderTopRightRadius borderTopLeftRadius borderTopRightRadius").split(" ");
	var div = document.createElement("div");
	/*
	var divStyle = div.style;
	var transTag = divStyle.MozTransform === "" ? "Moz" :
			(divStyle.WebkitTransform === "" ? "Webki" :
			(divStyle.OTransform === "" ? "O" :
			false)),
	var matrixFilter = !transTag && divStyle.filter === "",
	*/
	this._init = function(engine, data){
		_super._init.call(this);
		this._engine = engine;  //动画引擎
		this._data = data;    //动画数据
		this._func = null;    //动画函数
		this._target = null;  //目标值
		this._current = {};   //当前值
		this._dur = 0;        //时长
		this._startTime = 0;
		this._start = 0;      //开始时间
		this._stop = 0;       //结束时间

		this._started = false;
		this._stopped = false;

		this._msec = 10;      //定时器步长
		this._timer = 0;      //定时器
	};
	this.init = function(){
		var comp = runtime._element.style(this._data.element);  //实际值
		this._target = this.normalize(this._data.style);
		this._func = this._engine.getEffectFunc(this._data.func);
		for(var k in this._target){
			this._current[k] = this.parse(comp[k]);
		}
		this._dur = this._data.speed || 200;
		this._startTime = new Date().getTime();
		this._start = this._data.start || 0;
		this._stop  = this._data.start + this._dur;
		//this.start();
	};
	this.dispose = function(){
		for(var k in this._current){
			delete this._current[k];
		}
		this._target = null;
		this._func = null;
		this._data = null;
		this._engine = null;
		_super.dispose.apply(this);
	};
	/*
	 * from:http://github.com/madrobby/emile/
	 */
	this.interpolate = function(source, target, pos){
		if(isNaN(source)){
			source = 0;
		}
		return (source + (target - source) * pos).toFixed(3);
	};
	/*
	 * 转换为rgb(255,255,255)格式
	 */
	this.color = function(source, target, pos){
		function s(str, p, c){
			if(typeof str != "string"){
				str = "" + str;
			}
			return str.substr(p, c || 1);
		}
		var i = 2, j, c, tmp, v = [], r = [];
		while(j = 3, c = arguments[i - 1], i--){
			if(s(c, 0) == "r"){
				c = c.match(/\d+/g);
				while(j--){
					v.push(~ ~c[j]);
				}
			}else{
				if(c.length == 4){
					c = "#" + s(c, 1) + s(c, 1) + s(c, 2) + s(c, 2) + s(c, 3) + s(c, 3);
				}
				while(j--){
					v.push(parseInt(s(c, 1 + j * 2, 2), 16));
				}
			}
		}
		while(j--){
			tmp = ~ ~(v[j + 3] + (v[j] - v[j + 3]) * pos);
			r.push(tmp < 0 ? 0 : tmp > 255 ? 255 : tmp);
		}
		return "rgb(" + r.join(",") + ")";
	};
	this.parse = function(prop){
		if(!prop){
			prop = "0";  //IE下取不到没有设定的样式
		}
		var p = parseFloat(prop);
		var q = prop.replace(/^[\-\d\.]+/, "");
		return isNaN(p)
			? {"a": this, "f": "color"      , "v": q, "u": ""}
			: {"a": this, "f": "interpolate", "v": p, "u": q };
	};
	/**
	 * 把json描述的样式应用到实际元素el上计算出实际的字符串表示的样式
	 * [TODO]这种属性值还不能正确解析(border-top-right-radius:0px 0px;)
	 * @param {HTMLElement} el
	 * @param {Object} style
	 */
	this._formatStyle = function(el, style){
		var comp = runtime._element.style(this._data.element);
		var sb = [];
		for(var k in style){
			var v = style[k];
			if(v.charAt(1) == "="){  //相对数值计算
				var a = parseInt(comp[k]);
				var b = parseInt(v.substr(2));
				v = (v.charAt(0) == "-" ? a - b : a + b) + "px";
			}
			sb.push(k + ":" + v);
		}
		return sb.join(";");
	};
	/**
	 * 样式名标准化
	 */
	this.normalize = function(style){
		if(typeof style == "object"){
			style = this._formatStyle(this._data.element, style);
		}
		var rules = {};
		div.innerHTML = '<div style="' + style + '"></div>';
		var style = div.childNodes[0].style;
		for(var i = 0, len = this.props.length; i < len; i++){
			var k = this.props[i];
			var v = style[k];
			if(v){
				rules[k] = this.parse(v);
			}
		}
		return rules;
	};
	/**
	 * 开始播放动画
	 */
	this.start = function(){
		var _this = this;
		this._timer = window.setInterval(function(){
			_this.step();
		}, this._msec);
	};
	/**
	 * 停止播放动画
	 */
	this.stop = function(){
		this.onStop();
		this._engine.deQueue(this._data.element, "fx");
	};
	/**
	 * 播放一帧动画
	 */
	this.step = function(){
		var t = new Date().getTime() - this._startTime;  //当前时间距开始时间的差
		this.onStep(t);
		if(t > this._stop){  //判断是否结束
			this.stop();
		}
	};
	this.onStart = function(){
		this._started = true;
		if(this._data["onstart"]){
			this._data["onstart"].apply(this._data.element);
		}
		//在onstart事件执行完毕之后才能正确获取元素的实际样式
		var comp = runtime._element.style(this._data.element);  //实际值
		this._target = this.normalize(this._data.style);
		this._func = this._engine.getEffectFunc(this._data.func);
		for(var k in this._target){
			this._current[k] = this.parse(comp[k]);
		}
	};
	this.onStop = function(){
		if(this._stopped) return;
		this._stopped = true;
		if(this._timer != 0){
			window.clearInterval(this._timer);
			this._timer = 0;
		}
		if(this._data["onstop"]){
			this._data["onstop"].apply(this._data.element);
		}
	};
	/**
	 * [TODO]通过对onStep的同步来达到复杂动画的内部协同
	 * @param {Date} t 当前时间
	 */
	this.onStep = function(t){
		if(this._data["onstep"]){
			this._data["onstep"].apply(this._data.element);
		}
		var x = t <= this._stop ? (t - this._start) / this._dur : 1;  //x坐标[0-1]
		//console.log("x=" + x);
		for(var k in this._target){
			var o = this._target[k];
			var n = o.a[o.f].call(o.a, this._current[k].v, o.v, this._func(x));
			/*
			this.arr.push({"t": t, "s": this._func(x)});
			if(k == "opacity"){
				console.log(
					"t=" + t
					+ ",x=" + x
					+ ",c.v=" + this._current[k].v
					+ ",o.v=" + o.v
					+ ",this._func(x)=" + this._func(x)
					+ ",n=" + n
				);
				console.log(k + "=" + (n + o.u));
			}
			*/
			runtime._element.css(this._data.element, k, n + o.u);  //调整一个style属性
		}
		return x;
	};
});
/*</file>*/
/*<file name="alz/core/AnimateData.js">*/
_package("alz.core");

_import("alz.core.Animate");

/**
 * 一组动画
 */
_class("AnimateData", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._engine = null;
		this._cbid = -1;
		this._msec = 10;  //定时器步长
		this._timer = 0;  //定时器
		this._startTime = 0;  //总开始时间
		this._stopTime = 0;   //总结束时间
		this._list = [];  //一组动画列表
		//this._startList = [];  //按开始时间排序的动画列表
		//this._stopList = [];   //按结束时间排序的动画列表
		this._stopped = false;
	};
	this.create = function(engine, data, cbid){
		this._engine = engine;
		this._cbid = cbid || -1;
		this._startTime = new Date().getTime();
		for(var i = 0, len = data.length; i < len; i++){
			this.add(data[i]);
			//var a = data[i];
			//this.animate(a[0], a[1], a[3], a[4], a[5]);
		}
	};
	this.dispose = function(){
		if(this._timer != 0){
			this.stop();
		}
		/*
		for(var i = 0, len = this._stopList.length; i < len; i++){
			this._stopList[i] = null;
		}
		this._stopList.length = 0;
		for(var i = 0, len = this._startList.length; i < len; i++){
			this._startList[i] = null;
		}
		this._startList.length = 0;
		*/
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i].dispose();
			this._list[i] = null;
		}
		this._list.length = 0;
		this._startTime = 0;
		this._stopTime = 0;
		this._engine = null;
		_super.dispose.apply(this);
	};
	this.add = function(data){
		if(typeof data[4] != "string") data[4] = "easeNone";
		var nodes = data[0] instanceof Array ? data[0] : [data[0]];  //jQuery
		for(var i = 0, len = nodes.length; i < len; i++){
			var adata = {
				"element" : nodes[i]._self || nodes[i],  //目标元素
				"style"   : data[1],  //目标值
				"start"   : data[2],  //开始时间
				"speed"   : data[3],  //时长
				"func"    : data[4],  //动画效果
				"onstart" : data[5],  //onstart回调函数
				"onstop"  : data[6],  //onstop回调函数  [TODO]回调函数被重复执行了多次
				"onstep"  : data[7]   //onstep回调函数
			};
			var obj = new Animate(this._engine, adata);
			obj.init();
			//obj.start();
			//this.enQueue(nodes[i], "fx", {"agent": obj, "func": "init"});
			this._stopTime  = Math.max(obj._stop, this._stopTime);
			this._list.push(obj);
			//this._startList.push(obj);
			//this._stopList.push(obj);
		}
	};
	this._start = function(){
		this._d1 = new Date().getTime();
		if(this.step()){
			if(this._timer == 0){
				this._timer = runtime.startTimer(this._msec, this, "_start");
			}
			return true;
		}else{
			this.stop();
			this.dispose();
		}
	};
	/**
	 * 开始播放动画
	 */
	this.start = function(){
		//console.log("start");
		this._start();
	};
	/**
	 * 停止播放动画
	 */
	this.stop = function(){
		if(this._stopped) return;
		this._stopped = true;
		runtime.stopTimer(this._timer);
		for(var i = 0, len = this._list.length; i < len; i++){
			var a = this._list[i];
			if(!a._stopped){
				a.onStop();
			}
		}
		if(this._cbid != -1){
			runtime._task.execute(this._cbid);
		}
	};
	/**
	 * 播放一帧动画
	 */
	this.step = function(){
		this._d2 = new Date().getTime();
		this._startTime += this._d2 - this._d1;  //为了step方法能够设置断点
		var t = new Date().getTime() - this._startTime;  //当前时间距开始时间的差
		for(var i = 0, len = this._list.length; i < len; i++){
			var a = this._list[i];
			//console.log("----a._start=" + a._start + ",t=" + t + ",a._stop=" + a._stop);
			if(t < a._start){
			}else if(a._start <= t && t <= a._stop){
				if(!a._started){
					//a.arr = [];
					a.onStart();
				}
				var x = a.onStep(t, this._msec);
				if(x === 1){
					a.onStop();
					//this._stopped = true;
				}
			}else if(t > a._stop){  //结束后，只需执行一次onStep
				if(!this._stopped){
					var x = a.onStep(t, this._msec);  //[TO-DO]可能会重复一次x=1的情况
					runtime.assert(x === 1, "error");
					a.onStop();
					//this._stopped = true;
				}
				a.onStop();
				//runtime._debugPane.showTable(a.arr);
			}
		}
		//console.log(t + "<" + this._stopTime + "=" + (t < this._stopTime));
		return t < this._stopTime;  //判断是否结束
	};
});
/*</file>*/
/*<file name="alz/core/AnimationEngine.js">*/
_package("alz.core");

_import("alz.core.Plugin");
_import("alz.core.AnimateData");

/**
 * 由陈超群同学提供，参考部分jQuery，madrobby/emile源码，整合Easing效果库
 *
 * 动画引擎 animate 动画效果模块(插件)
 * 动画组件，使元素可以产生动画效果
 *
 * TO:CSS3支持,rotate旋转支持,目前还没有实现如jquery的队列机制,同时执行好几个动画会有问题
 */
_class("AnimationEngine", Plugin, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._ad = null;  //{AnimateData}
	};
	this.create = function(name, app){
		_super.create.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._ad){
			this._ad.dispose();
			this._ad = null;
		}
		_super.dispose.apply(this);
	};
	this._easing = (function(){
		var PI = Math.PI;
		var abs = Math.abs;
		var pow = Math.pow;
		var sin = Math.sin;
		var cos = Math.cos;
		var sqrt = Math.sqrt;
		var asin = Math.asin;
		var BACK_CONST = 1.70158;
		var Easing = {
			/**
			 * Uniform speed between points.
			 */
			easeNone: function(t){
				//return t;
				return (-cos(t * PI) / 2) + 0.5;
			},
			/**
			 * Begins slowly and accelerates towards end. (quadratic)
			 */
			easeIn: function(t){
				return t * t;
			},
			/**
			 * Begins quickly and decelerates towards end.  (quadratic)
			 */
			easeOut: function(t){
				return (2 - t) * t;
			},
			/**
			 * Begins slowly and decelerates towards end. (quadratic)
			 */
			easeBoth: function(t){
				return (t *= 2) < 1 ?
					.5 * t * t :
					.5 * (1 - (--t) * (t - 2));
			},
			/**
			 * Begins slowly and accelerates towards end. (quartic)
			 */
			easeInStrong: function(t){
				return t * t * t * t;
			},
			/**
			 * Begins quickly and decelerates towards end.  (quartic)
			 */
			easeOutStrong: function(t){
				return 1 - (--t) * t * t * t;
			},
			/**
			 * Begins slowly and decelerates towards end. (quartic)
			 */
			easeBothStrong: function(t){
				return (t *= 2) < 1 ?
					.5 * t * t * t * t :
					.5 * (2 - (t -= 2) * t * t * t);
			},
			/**
			 * Snap in elastic effect.
			 */
			elasticIn: function(t){
				var p = .3, s = p / 4;
				if(t === 0 || t === 1) return t;
				return -(pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
			},
			/**
			 * Snap out elastic effect.
			 */
			elasticOut: function(t){
				var p = .3, s = p / 4;
				if(t === 0 || t === 1) return t;
				return pow(2, -10 * t) * sin((t - s) * (2 * PI) / p) + 1;
			},
			/**
			 * Snap both elastic effect.
			 */
			elasticBoth: function(t){
				var p = .45, s = p / 4;
				if(t === 0 || (t *= 2) === 2) return t;
				if(t < 1){
					return -.5 * (pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
				}
				return pow(2, -10 * (t -= 1)) * sin((t - s) * (2 * PI) / p) * .5 + 1;
			},
			/**
			 * Backtracks slightly, then reverses direction and moves to end.
			 */
			backIn: function(t){
				if(t === 1) t -= .001;
				return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
			},
			/**
			 * Overshoots end, then reverses and comes back to end.
			 */
			backOut: function(t){
				return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
			},
			/**
			* Backtracks slightly, then reverses direction, overshoots end,
			* then reverses and comes back to end.
			*/
			backBoth: function(t){
				if((t *= 2) < 1){
					return .5 * (t * t * (((BACK_CONST *= (1.525)) + 1) * t - BACK_CONST));
				}
				return .5 * ((t -= 2) * t * (((BACK_CONST *= (1.525)) + 1) * t + BACK_CONST) + 2);
			},
			/**
			 * Bounce off of start.
			 */
			bounceIn: function(t){
				return 1 - Easing.bounceOut(1 - t);
			},
			/**
			* Bounces off end.
			*/
			bounceOut: function(t){
				var s = 7.5625, r;
				if(t < (1 / 2.75)){
					r = s * t * t;
				}else if(t < (2 / 2.75)){
					r = s * (t -= (1.5 / 2.75)) * t + .75;
				}else if(t < (2.5 / 2.75)){
					r = s * (t -= (2.25 / 2.75)) * t + .9375;
				}else{
					r = s * (t -= (2.625 / 2.75)) * t + .984375;
				}
				return r;
			},
			/**
			 * Bounces off start and end.
			 */
			bounceBoth: function(t){
				if(t < .5){
					return Easing.bounceIn(t * 2) * .5;
				}
				return Easing.bounceOut(t * 2 - 1) * .5 + .5;
			}
			/*
			// simple linear tweening - no easing
			// t: current time, b: beginning value, c: change in value, d: duration
			linearTween, function(t, b, c, d){
				return c*t/d + b;
			},
			///////////// QUADRATIC EASING: t^2 ///////////////////
			// quadratic easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in value, d: duration
			// t and d can be in frames or seconds/milliseconds
			easeInQuad: function(t, b, c, d){
				return c*(t/=d)*t + b;
			},
			// quadratic easing out - decelerating to zero velocity
			easeOutQuad: function(t, b, c, d){
				return -c *(t/=d)*(t-2) + b;
			},
			// quadratic easing in/out - acceleration until halfway, then deceleration
			easeInOutQuad: function(t, b, c, d){
				if((t/=d/2) < 1) return c/2*t*t + b;
				return -c/2 * ((--t)*(t-2) - 1) + b;
			},
			///////////// CUBIC EASING: t^3 ///////////////////////
			// cubic easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in value, d: duration
			// t and d can be frames or seconds/milliseconds
			easeInCubic: function(t, b, c, d){
				return c*(t/=d)*t*t + b;
			},
			// cubic easing out - decelerating to zero velocity
			easeOutCubic: function(t, b, c, d){
				return c*((t=t/d-1)*t*t + 1) + b;
			},
			// cubic easing in/out - acceleration until halfway, then deceleration
			easeInOutCubic: function(t, b, c, d){
				if((t/=d/2) < 1) return c/2*t*t*t + b;
				return c/2*((t-=2)*t*t + 2) + b;
			},
			///////////// QUARTIC EASING: t^4 /////////////////////
			// quartic easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in value, d: duration
			// t and d can be frames or seconds/milliseconds
			easeInQuart: function(t, b, c, d){
				return c*(t/=d)*t*t*t + b;
			},
			// quartic easing out - decelerating to zero velocity
			easeOutQuart: function(t, b, c, d){
				return -c * ((t=t/d-1)*t*t*t - 1) + b;
			},
			// quartic easing in/out - acceleration until halfway, then deceleration
			easeInOutQuart: function(t, b, c, d){
				if((t/=d/2) < 1) return c/2*t*t*t*t + b;
				return -c/2 * ((t-=2)*t*t*t - 2) + b;
			},
			///////////// QUINTIC EASING: t^5  ////////////////////
			// quintic easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in value, d: duration
			// t and d can be frames or seconds/milliseconds
			easeInQuint: function(t, b, c, d){
				return c*(t/=d)*t*t*t*t + b;
			},
			// quintic easing out - decelerating to zero velocity
			easeOutQuint: function(t, b, c, d){
				return c*((t=t/d-1)*t*t*t*t + 1) + b;
			},
			// quintic easing in/out - acceleration until halfway, then deceleration
			easeInOutQuint: function(t, b, c, d){
				if((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
				return c/2*((t-=2)*t*t*t*t + 2) + b;
			},
			///////////// SINUSOIDAL EASING: sin(t) ///////////////
			// sinusoidal easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in position, d: duration
			easeInSine: function(t, b, c, d){
				return -c * cos(t/d * (PI/2)) + c + b;
			},
			// sinusoidal easing out - decelerating to zero velocity
			easeOutSine: function(t, b, c, d){
				return c * sin(t/d * (PI/2)) + b;
			},
			// sinusoidal easing in/out - accelerating until halfway, then decelerating
			easeInOutSine: function(t, b, c, d){
				return -c/2 * (cos(PI*t/d) - 1) + b;
			},
			///////////// EXPONENTIAL EASING: 2^t /////////////////
			// exponential easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in position, d: duration
			easeInExpo: function(t, b, c, d){
				return (t==0) ? b : c * pow(2, 10 * (t/d - 1)) + b;
			},
			// exponential easing out - decelerating to zero velocity
			easeOutExpo: function(t, b, c, d){
				return (t==d) ? b+c : c * (-pow(2, -10 * t/d) + 1) + b;
			},
			// exponential easing in/out - accelerating until halfway, then decelerating
			easeInOutExpo: function(t, b, c, d){
				if(t==0) return b;
				if(t==d) return b+c;
				if((t/=d/2) < 1) return c/2 * pow(2, 10 * (t - 1)) + b;
				return c/2 * (-pow(2, -10 * --t) + 2) + b;
			},
			/////////// CIRCULAR EASING: sqrt(1-t^2) //////////////
			// circular easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in position, d: duration
			easeInCirc: function(t, b, c, d){
				return -c * (sqrt(1 - (t/=d)*t) - 1) + b;
			},
			// circular easing out - decelerating to zero velocity
			easeOutCirc: function(t, b, c, d){
				return c * sqrt(1 - (t=t/d-1)*t) + b;
			},
			// circular easing in/out - acceleration until halfway, then deceleration
			easeInOutCirc: function(t, b, c, d){
				if((t/=d/2) < 1) return -c/2 * (sqrt(1 - t*t) - 1) + b;
				return c/2 * (sqrt(1 - (t-=2)*t) + 1) + b;
			},
			/////////// ELASTIC EASING: exponentially decaying sine wave  //////////////
			// t: current time, b: beginning value, c: change in value, d: duration, a: amplitude (optional), p: period (optional)
			// t and d can be in frames or seconds/milliseconds
			easeInElastic: function(t, b, c, d, a, p){
				if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
				if(a < abs(c)){ a=c; var s=p/4; }
				else var s = p/(2*PI) * asin(c/a);
				return -(a*pow(2,10*(t-=1)) * sin( (t*d-s)*(2*PI)/p )) + b;
			},
			easeOutElastic: function(t, b, c, d, a, p){
				if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
				if(a < abs(c)){ a=c; var s=p/4; }
				else var s = p/(2*PI) * asin(c/a);
				return a*pow(2,-10*t) * sin( (t*d-s)*(2*PI)/p ) + c + b;
			},
			easeInOutElastic: function(t, b, c, d, a, p){
				if(t==0) return b;  if((t/=d/2)==2) return b+c;  if(!p) p=d*(.3*1.5);
				if(a < abs(c)){ a=c; var s=p/4; }
				else var s = p/(2*PI) * asin(c/a);
				if(t < 1) return -.5*(a*pow(2,10*(t-=1)) * sin( (t*d-s)*(2*PI)/p )) + b;
				return a*pow(2,-10*(t-=1)) * sin( (t*d-s)*(2*PI)/p )*.5 + c + b;
			},
			/////////// BACK EASING: overshooting cubic easing: (s+1)*t^3 - s*t^2  //////////////
			// back easing in - backtracking slightly, then reversing direction and moving to target
			// t: current time, b: beginning value, c: change in value, d: duration, s: overshoot amount (optional)
			// t and d can be in frames or seconds/milliseconds
			// s controls the amount of overshoot: higher s means greater overshoot
			// s has a default value of 1.70158, which produces an overshoot of 10 percent
			// s==0 produces cubic easing with no overshoot
			easeInBack: function(t, b, c, d, s){
				if(s == undefined) s = 1.70158;
				return c*(t/=d)*t*((s+1)*t - s) + b;
			},
			// back easing out - moving towards target, overshooting it slightly, then reversing and coming back to target
			easeOutBack: function(t, b, c, d, s){
				if(s == undefined) s = 1.70158;
				return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
			},
			// back easing in/out - backtracking slightly, then reversing direction and moving to target,
			// then overshooting target, reversing, and finally coming back to target
			easeInOutBack: function(t, b, c, d, s){
				if(s == undefined) s = 1.70158;
				if((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
				return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
			},
			/////////// BOUNCE EASING: exponentially decaying parabolic bounce  //////////////
			// bounce easing in
			// t: current time, b: beginning value, c: change in position, d: duration
			easeInBounce: function(t, b, c, d){
				return c - Easing.easeOutBounce (d-t, 0, c, d) + b;
			},
			// bounce easing out
			easeOutBounce: function(t, b, c, d){
				if((t/=d) < (1/2.75)){
					return c*(7.5625*t*t) + b;
				}else if(t < (2/2.75)){
					return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
				}else if(t < (2.5/2.75)){
					return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
				}else{
					return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
				}
			},
			// bounce easing in/out
			easeInOutBounce: function(t, b, c, d){
				if(t < d/2) return Easing.easeInBounce (t*2, 0, c, d) * .5 + b;
				return Easing.easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
			}
			*/
		};
		return Easing;
	})();
	this.getEffectFunc = function(name){
		return this._easing[name in this._easing ? name : "easeNone"];
	};
	//针对单个元素动画的队列
	this.getQueue = function(el, type){
		var q = runtime._element.data(el, type);
		//Speed up dequeue by getting out quickly if this is just a lookup
		return q || [];
	};
	/**
	 * 入队
	 * @param {HTMLElement} el
	 * @param {String} type "fx"
	 * @param {Function} data
	 */
	this.enQueue = function(el, type, data){
		var q = runtime._element.data(el, type) || runtime._element.data(el, type, data instanceof Array ? data : [data]);
		q.push(data);
		if(this.getQueue(el, "fx")[0] !== "inprogress"){
			this.deQueue(el, type);
		}
		return q;
	};
	//出队
	this.deQueue = function(el, type){
		var queue = this.getQueue(el, type);
		var obj = queue.shift();
		//如果fx队列正在dequeued，删除队首的哨兵
		if(obj === "inprogress"){
			obj = queue.shift();
		}
		if(obj){
			//添加一个哨兵，用来防止自动出队
			if(type === "fx"){
				queue.unshift("inprogress");
			}
			obj.agent[obj.func].call(obj.agent, el/*, this, function(){this.deQueue(el, type);}*/);
		}
	};
	/**
	 * 运行批量动画
	 * @param {Array} data [el, style, start, speed, easingfun, onstart, onstop, onstep]
	 */
	this.run = function(data, agent, func){
		var cbid = runtime._task.add(agent, func);
		if(this._ad){
			this._ad.dispose();
		}
		this._ad = new AnimateData();
		this._ad.create(this, data, cbid);
		this._ad.start();
	};
	/**
	 * 动画主函数
	 * animate(el, "width:100px", 5, "bounceOut", function(){});
	 */
	this.animate = function(el, style, speed, easingfun, agent, func){
		var data = [[el, style, 0, speed, easingfun, null, null, null]];
		this.run(data, agent, func);
	};
	/*
	 * 旋转
	 */
	this.rotate = function(){
		//暂时未实现
	};
	//Node animate
	var speeds = {
		"slow"    : 600,
		"fast"    : 200,
		"_default": 400  //Default speed
	};
	var FX = {
		"show" : ["overflow", "opacity", "height", "width"],
		"fade" : ["opacity"],
		"slide": ["overflow", "height"]
	};
	var effects = {
		"show"     : ["show"  , 1],
		"hide"     : ["show"  , 0],
		"toggle"   : ["toggle"],
		"fadeIn"   : ["fade"  , 1],
		"fadeOut"  : ["fade"  , 0],
		"slideDown": ["slide" , 1],
		"slideUp"  : ["slide" , 0]
	};
	function createFunc(k){
		return function(el, speed, agent, func){
			if(typeof el != "object"){
				runtime.error("[AnimationEngine::createFunc*]error");
				return;
			}
			/*
			if(k == "fadeIn"){  //[TODO]fixed
				el.style.opacity = "1";
				el.style.display = "";
			}else if(k == "fadeOut"){
				el.style.opacity = "0";
				el.style.display = "none";
			}
			*/
			var element = runtime._element;
			//if(!element.data(el, "height")){
				element.data(el, "height" , element.height(el));
				element.data(el, "width"  , element.width(el));
				element.data(el, "opacity", element.css(el, "opacity"));
			//}
			if(!speed){
				speed = speeds._default;
			}else if(typeof speed == "string"){
				speed = speeds[speed];
			}else if(typeof speed == "function" || typeof speed == "object"){
				func = agent;
				agent = speed;
			}
			this._runFx(el, effects[k][0], speed, effects[k][1], agent, func/*, [el]*/);
		};
	}
	for(var k in effects){
		this[k] = createFunc(k);
	}
	this._runFx = function(el, action, speed, display, agent, func){
		/*
		if(display || action === "toggle"){
			el.style.display = "";
		}
		*/
		if(action === "toggle"){
			display = runtime._element.css(el, "height") === "0px" ? 1 : 0;
			action = "show";
		}
		var style = [];
		var oldW = runtime._element.data(el, "width");
		var oldH = runtime._element.data(el, "height");
		var oldOp = runtime._element.data(el, "opacity");
		//var _this = this;
		//FX[action].forEach(function(p){});
		var arr = FX[action];
		for(var i = 0, len = arr.length; i < len; i++){
			switch(arr[i]){
			case "overflow":
				runtime._element.css(el, "overflow", "hidden");
				break;
			case "opacity":
				var s = display ? oldOp + ";" : "0;";
				style.push("opacity:" + s);
				if(display) runtime._element.css(el, "opacity", "0");
				break;
			case "height":
				var s = display ? oldH + "px;" : "0px;";
				style.push("height:" + s);
				if(display) runtime._element.css(el, "height", "0px");
				break;
			case "width":
				var s = display ? oldW + "px;" : "0px";
				style.push("width:" + s);
				if(display) runtime._element.css(el, "width", "0px");
				break;
			}
		}
		//分析最终样式后进行动画
		this.animate(el, style.join(""), speed, "easeIn", agent, func);
		//this, function(){if(!display){el.style.display = "none";}}
	};
	/*
	/ *
	 * 链式
	 * /
	["hide","show","slideDown","slideUp","fadeIn","fadeOut","animate"].forEach(function(p){
		B.extend(p, function(){
			for(var i = 0, len = this.nodes.length; i < len; i++){
				var el = this.nodes[i];
				B[p].apply(el, [el].concat(arguments));
			}
			return this;
		});
	});
	*/
});
/*</file>*/
/*<file name="alz/core/WebRuntime_core.js">*/
_package("alz.core");

_import("alz.core.DOMUtil");
//_import("alz.core.DOMUtil2");
_import("alz.core.AjaxEngine");
_import("alz.core.XPathQuery");
_import("alz.template.TemplateManager");
_import("alz.core.ActionCollection");
_import("alz.core.ProductManager");

_extension("WebRuntime", function(){  //注册 WebRuntime 扩展
	var properties = ["_ajax", "_template", "_actionCollection", "_productManager"];
	this.__conf__({
		"plugin": [  //插件配置列表
			{"id": "ajax"            , "clazz": "AjaxEngine"      },  //异步请求引擎
			{"id": "dom"             , "clazz": "DOMUtil"         },  //DOM操作工具
		//{"id": "element"         , "clazz": "Element"         },  //DOM元素操作
		//{"id": "animation"       , "clazz": "AnimationEngine" },  //动画引擎
		//{"id": "eventManager"    , "clazz": "EventManager"    },  //事件管理
		//{"id": "gestureManager"  , "clazz": "GestureManager"  },  //手势管理
			{"id": "xpq"             , "clazz": "XPathQuery"      },  //xpath选择器
			{"id": "template"        , "clazz": "TemplateManager" },  //模版引擎
			{"id": "actionCollection", "clazz": "ActionCollection"},  //用户行为动作收集器
			{"id": "productManager"  , "clazz": "ProductManager"  }   //产品管理者
		]
	});
	this._init = function(){  //加载之后的初始化工作
		//创建插件
		//this._pluginManager.create(this, this.findConf("plugin"));
		this._xpq = new XPathQuery();
		//this.regPlugin("dom", DOMUtil);
		this.dom = new DOMUtil();
		//this.domutil = new DomUtil2();
		if(!this.getParentRuntime()){
			this._ajax = new AjaxEngine();  //异步交互引擎
			this._template = new TemplateManager();  //模版引擎
			this._actionCollection = new ActionCollection();
			//[TODO]一个运行时环境需要管理多个产品配置信息么？
			this._productManager = new ProductManager();
		}else{
			for(var i = 0, len = properties.length; i < len; i++){
				var k = properties[i];
				this[k] = this._parentRuntime["get" + k.charAt(1).toUpperCase() + k.substr(2)]();
			}
			/*
			this._ajax = this._parentRuntime.getAjax();
			this._template = this._parentRuntime.getTemplate();
			this._actionCollection = this._parentRuntime.getActionCollection();
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
			document.onmousedown = function(ev){
				ev = ev || window.event;
				if(ev.ctrlKey){
					var target = ev.target || ev.srcElement;
					for(var el = target; el; el = el.parentNode){
						if(el.__ptr__){
							var arr = runtime.forIn(el.__ptr__);
							arr.push("class=" + el.className);
							arr.push("tagName=" + el.tagName);
							window.alert(arr.join("\n"));
							break;
						}
					}
				}
			};
		}
		//if(typeof sinamail_data != "undefined"){
		//	this.regProduct(sinamail_data);
		//}
	};
	this.dispose = function(){
		this._productManager.dispose();
		this._productManager = null;
		if(this._debug){
			document.onmousedown = null;
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
		/*
		if(this.dom){
			this.dom.dispose();
			this.dom = null;
		}
		*/
		this._xpq.dispose();
		this._xpq = null;
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
	this.getTemplate = function(){
		return this._template;
	};
	this.getActionCollection = function(){
		return this._actionCollection;
	};
	this.getProductManager = function(){
		return this._productManager;
	};
	/**
	 * 去除字符串前后的空白字符
	 * @param {String} str 要处理的字符串
	 */
	this.trim = function(str){
		return str.replace(/(^\s*)|(\s*$)/g, "");
	};
	this.closure = function(o, func, p1, p2){
		return function(){
			if(typeof o == "object" && typeof func == "string" && typeof o[func] == "function"){
				return o[func](p1, p2);
			}else if(typeof o == "function"){
				return o(func, p1, p2);
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
	/**
	 * 注册产品
	 */
	this.regProduct = function(v){
		this._productManager.regProduct(v);
		this._appManager.setConfList(v.app);
		this._template.init("tpl/");  //模板
		this._template.appendItems(v.tpl);
	};
	/**
	 * 注册一组模板列表数据
	 */
	/*
	this.regTpl = function(data){
		this._template.appendItems(data);
	};
	*/
	/**
	 * 注册一个动态创建的模板
	 */
	this.__tpl__ = function(name, type, data){
		this._template.appendItem(name, type, data);
	};
	/*
	//检查组件上的DOM属性及其事件是否清理干净
	this.checkDomClean = function(component){
		//this.checkEvents(component._self);
		/ *
		var hash = component;
		for(var k in hash){
			if(typeof hash[k] == "obj"){
			}
		}
		* /
	};
	this._alert = window.alert;
	this.checkEvents = function(el){
		if(el.__checked__) return;
		var a = [];
		for(var k in el){
			a.push(k);
			if(k == "__checked__") continue;
			if(k == "_ptr") break;
			if(k.substr(0, 2) == "on" && typeof el[k] == "function"){
				if(this._alert){
					this._alert(el);
				}
			}
			try{
			if(el.hasChildNodes && el.hasChildNodes()){
				var nodes = el.childNodes;
				for(var i = 0, len = nodes.length; i < len; i++){
					this.checkEvents(nodes[i]);
				}
			}
			}catch(ex){
				window.alert(ex);
			}
		}
		el.__checked__ = true;
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
	*/
	/**
	 * 根据 className 获取相应的 DOM 元素
	 * @return {Array} 符合条件的元素组成的数组
	 * [TODO]效率极低，有待优化
	 */
	/*
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
	*/
});
/*</file>*/

}});

runtime.regLib("ui", "", function(){with(arguments[0]){

/*<file name="alz/mui/IBoxModel.js">*/
_package("alz.mui");

/**
 * 盒子模型接口
 */
_interface("IBoxModel", "", function(){
	/*
	var PROPS = "color,cursor,display,visibility,opacity,zIndex,"
		+ "overflow,position,"
		+ "left,top,bottom,right,width,height,"
		+ "marginBottom,marginLeft,marginRight,marginTop,"
		+ "borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth,"
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
	var PROPS = {
		"left"             : [1, "offsetLeft"  ],
		"top"              : [1, "offsetTop"   ],
		"width"            : [1, "offsetWidth" ],
		"height"           : [1, "offsetHeight"],
		"marginTop"        : [0],
		"marginRight"      : [0],
		"marginBottom"     : [0],
		"marginLeft"       : [0],
		"borderTopWidth"   : [2],
		"borderRightWidth" : [2],
		"borderBottomWidth": [2],
		"borderLeftWidth"  : [2],
		"paddingTop"       : [2],
		"paddingRight"     : [2],
		"paddingBottom"    : [2],
		"paddingLeft"      : [2]
	};
	this._init = function(){
		this._left = 0;
		this._top = 0;
		this._width = 0;
		this._height = 0;
		this._marginTop = 0;
		this._marginRight = 0;
		this._marginBottom = 0;
		this._marginLeft = 0;
		this._borderLeftWidth = 0;
		this._borderTopWidth = 0;
		this._borderRightWidth = 0;
		this._borderBottomWidth = 0;
		this._paddingLeft = 0;
		this._paddingTop = 0;
		this._paddingRight = 0;
		this._paddingBottom = 0;
	};
	this.init = function(obj){
		var style = this._dom.getStyle(obj);
		/*
		var arr = PROPS.split(",");
		for(var i = 0, len = arr.length; i < len; i++){
			this._currentPropertys[arr[i]] = this.getPropertyValue(style, arr[i]);
		}
		*/
		for(var k in PROPS){
			var v0 = PROPS[k][0];
			if(v0 == 0) continue;
			var key = "_" + k;
			this[key] = this.parseNum(/*obj.tagName, */this.getPropertyValue(style, k) || obj.style[k]);
			if(v0 == 1){
				this[key] = this[key] || obj[PROPS[k][1]];
			}
		}
	};
	/**
	 * @method getLeft
	 * @return {Number}
	 * @desc  获取组件的x坐标
	 */
	this.getLeft = function(){
		return this._left;
	};
	/**
	 * @method setLeft
	 * @param {Number} v
	 * @desc  设置组件的x坐标
	 */
	this.setLeft = function(v){
		this._left = v;
		//v += this._paddingLeft;
		this.setStyleProperty("left", v + "px");
	};
	/**
	 * @method getTop
	 * @return {Number}
	 * @desc  获取组件的y坐标
	 */
	this.getTop = function(){
		return this._top;
	};
	/**
	 * @method setTop
	 * @param {Number} v
	 * @desc  设置组件的y坐标
	 */
	this.setTop = function(v){
		this._top = v;
		//v += this._paddingTop;
		this.setStyleProperty("top", v + "px");
	};
	this._setWidth = function(v){
		v = Math.max(v, 0);
		this.setStyleProperty("width", v + "px");
	};
	this._setHeight = function(v){
		v = Math.max(v, 0);
		this.setStyleProperty("height", v + "px");
	};
	/**
	 * @method getInnerWidth
	 * @param {Number} v 宽度值[可选]
	 * @return {Number}
	 * @desc  获取组件的可见宽度
	 */
	this.getInnerWidth = function(v){
		if(!v) v = this._width;
		return Math.max(0, v - this._borderLeftWidth - this._borderRightWidth - this._paddingLeft - this._paddingRight);
		//return Math.max(0, runtime.getBoxModel() == 0 ? v : v - this._borderLeftWidth - this._borderRightWidth - this._paddingLeft - this._paddingRight);
	};
	/**
	 * @method getInnerHeight
	 * @param {Number} v 高度值[可选]
	 * @return {Number}
	 * @desc  获取组件的可见高度
	 */
	this.getInnerHeight = function(v){
		if(!v) v = this._height;
		return Math.max(0, v - this._borderTopWidth - this._borderBottomWidth - this._paddingTop - this._paddingBottom);
		//return Math.max(0, runtime.getBoxModel() == 0 ? v : v - this._borderTopWidth - this._borderBottomWidth - this._paddingTop - this._paddingBottom);
	};
	/**
	 * @method getWidth
	 * @return {Number}
	 * @desc  获取组件的宽度
	 */
	this.getWidth = function(){
		return this._width;
	};
	/**
	 * @method setWidth
	 * @param {Number} v 宽度值
	 * @desc  设置组件的宽度
	 */
	this.setWidth = function(v){
		v = Math.max(v, 0);
		this._width = v;
		if(this._dockRect.w == 0) this._dockRect.w = v;
		var w = this.getInnerWidth(v);
		this._setWidth(w);
	};
	/**
	 * @method getHeight
	 * @return {Number}
	 * @desc  获取组件的高度
	 */
	this.getHeight = function(){
		return this._height;
	};
	/**
	 * @method setHeight
	 * @param {Number} v 宽度值
	 * @desc  设置组件的高度
	 */
	this.setHeight = function(v){
		v = Math.max(v, 0);
		this._height = v;
		if(this._dockRect.h == 0) this._dockRect.h = v;
		var h = this.getInnerHeight(v);
		this._setHeight(h);
	};
});
/*</file>*/
//import alz.mui.IDesignable;
/*<file name="alz/mui/SelectionManager.js">*/
_package("alz.mui");

/**
 * 列表条目选择动作管理
 */
_class("SelectionManager", "", function(_super, _event){
	var listener = {
		"mouseover": function(ev){
			//this._parent._activeItems.indexOf(this) == -1
			if(!this._active){  //如果不是焦点
				if(this._css.hover && this._css.hover.className){  //hover状态可能不存在
					this._self.className = this._css.hover.className;
				}
			}
		},
		"mouseout": function(ev){
			if(!this._active){  //如果不是焦点
				if(this._css.normal && this._css.normal.className){
					this._self.className = this._css.normal.className;
				}
			}
		},
		"mousedown": function(ev){
			var ctrlKey = ev.ctrlKey;
			var shiftKey = ev.shiftKey;
			if(!this._parent._multiple){
				ctrlKey = false;
				shiftKey = false;
			}
			this._parent._selectMgr.selectItem(this, ctrlKey, shiftKey);
			if(this._parent.onMousedown){
				this._parent.onMousedown(ev);
			}
		},
		"click": function(ev){
			ev.cancelBubble = true;
			return false;
		}
	};
	SelectionManager.SINGLE   = 1;
	SelectionManager.MULTIPLE = 2;
	this._init = function(){
		_super._init.call(this);
		this._list = null;  //{GroupList}
		this._activeItems = [];  //当前激活的列表项目
		this._lastActiveItem = null;  //{GroupItem}最后一次单选激活的列表项目
		this._defaultSelectMode = SelectionManager.SINGLE;
	};
	this.init = function(index){
		if(typeof index == "number"){
			this._lastActiveItem = this._list.getItem(index);  //默认激活第一个列表项目
			this.selectItem(this._list.getItem(index));
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		this.unbindEvent();
		this._lastActiveItem = null;
		this._activeItems.length = 0;
		this._list = null;
		_super.dispose.apply(this);
	};
	this.setBindList = function(list){
		this._list = list;
	};
	this.itemBindEvent = function(item){
		if(!item._evFlag){
			item._evFlag = true;
			runtime.getDom().addEventListener(item._itemDom, "", listener, item);
		}
	};
	this.itemUnbindEvent = function(item){
		if(item._evFlag){
			runtime.getDom().removeEventListener(item._itemDom, "", listener, item);
			item._evFlag = false;
		}
	};
	this.bindEvent = function(){
		var items = this._list.getItems();
		for(var i = 0, len = items.length; i < len; i++){
			this.itemBindEvent(items[i]);
		}
	};
	this.unbindEvent = function(){
		var items = this._list.getItems();
		for(var i = 0, len = items.length; i < len; i++){
			if(items[i]._evFlag){
				if(items[i]._itemDom){ //RQFM-6383 IE7通讯录首页，查找功能有的时候搜索结果不准确
					runtime.getDom().removeEventListener(items[i]._itemDom, "", listener, items[i]);
				}
				items[i]._evFlag = false;
			}
		}
	};
	this.getActiveItems = function(){
		return this._activeItems;
	};
	this.getActiveNums = function(){
		return this._activeItems.length;
	};
	this.getListener = function(){
		return listener;
	};
	/**
	 * 选择指定的列表项目
	 * @param item {HTMLElement} 要选择的列表项目
	 * @param ctrlKey {Boolean} Ctrl键是否按下，支持多选时使用
	 * @param shiftKey {Boolean} Shift键是否按下，支持多选时使用
	 * @param fireChangeEvent {Boolean} 是否触发 onselectchanage 事件
	 * @param forceSelect {Boolean} 是否强制选择
	 */
	this.selectItem = function(item, ctrlKey, shiftKey, fireChangeEvent, forceSelect){
		if(typeof fireChangeEvent == "undefined"){
			fireChangeEvent = true;
		}
		forceSelect = forceSelect || false;

		if(!ctrlKey && !shiftKey){
			this._lastActiveItem = item;
		}
		/*
		if(this._list._selectionMode == 1){
			if(item._active){
				this._list.activeItem(item, false);
				this._activeItems.removeAt(this._activeItems.indexOf(item));
			}else{
				this._list.activeItem(item, true);
				this._activeItems.push(item);  //[TODO]是否保存列表条目的原始顺序？
			}
		}else{
		*/
			if(!this._list._multiple){  //如果不允许多选
				ctrlKey = false;
				shiftKey = false;
			}else{
				ctrlKey = ctrlKey || this._defaultSelectMode == SelectionManager.MULTIPLE;
			}
			var start, end;
			if(shiftKey){
				start = Math.min(this._lastActiveItem.getIndex(), item.getIndex());
				end = Math.max(this._lastActiveItem.getIndex(), item.getIndex());
			}
			var list = [];   //活动的列表项目
			var list0 = [];  //每个列表项目的状态(true|false)
			var items = this._list.getItems();
			for(var i = 0, len = items.length; i < len; i++){
				var obj = items[i];
				if(shiftKey && i >= start && i <= end){
					list.push(obj);
					list0.push(true);
					continue;
				}
				if(ctrlKey){
					if(obj == item){
						if(!obj._active) list.push(obj);
						list0.push(!obj._active);
					}else{
						if(obj._active) list.push(obj);
						list0.push(obj._active);
					}
					continue;
				}
				if(this._list._selectionMode == 0){
					if(obj == item) list.push(obj);
					list0.push(obj == item);
				}else{  //this._list._selectionMode == 1
					if(obj == item){
						if(!obj._active || forceSelect){  //不活动的 或 强制活动的
							list.push(obj);
						}
						list0.push(!obj._active || forceSelect);
					}else{
						if(obj._active){
							list.push(obj);
						}
						if(this._list._multiple){
							list0.push(obj._active);  //其他 Item 不变化
						}else{
							list0.push(false);
						}
					}
				}
			}
			this.selectItems(list, list0);
		//}
		if(this._list.onItemCancel && !item._active){
			this._list.onItemCancel(item);
		}
		if(this._list.onSelectChange && fireChangeEvent){
			this._list.onSelectChange(item._active ? item : this._activeItems[0]);
		}
	};
	/**
	 * 选择一组项目
	 */
	this.selectItems = function(list, list0){
		this._activeItems = list;
		//[TODO]如何对上面过程进行优化，对不需要调整的 Item，应该可以不进行操作
		var items = this._list.getItems();
		for(var i = 0, len = list0.length; i < len; i++){
			this._list.activeItem(items[i], list0[i]);
		}
	};
	/**
	 * 把全部项目设置为选中或非选中状态
	 * @param checked {Boolean} 是否选中
	 */
	this.selectAllItems = function(checked){
		var items0 = [];
		var items = this._list.getItems();
		for(var i = 0, len = items.length; i < len; i++){
			this._list.activeItem(items[i], checked);
			items0.push(items[i]);
		}
		if(checked){
			//不能使用items这个引用，因为它是 this._list 的一个属性，在全选删除一个组
			//的联系人的时候会产生删除两次的错误
			this._activeItems = items0;
			this._lastActiveItem = this._activeItems[this._activeItems.length - 1];
		}else{
			this._activeItems = [];
			this._lastActiveItem = null;
		}
		if(this._list.onSelectChange){
			this._list.onSelectChange(this._lastActiveItem);
		}
	};
	/**
	 * 把全部项目置为非选中状态
	 */
	this.cancelAllActiveItems = function(){
		var items = this._activeItems;
		for(var i = 0, len = items.length; i < len; i++){
			this._list.activeItem(items[i], false);
		}
		this._activeItems.length = 0;
	};
	/**
	 * 把某个项目置为非选中状态
	 */
	this.cancelItem = function(item){
		this._list.activeItem(item, false);
		for(var i = 0, len = this._activeItems.length; i < len; i++){
			if(this._activeItems[i] == item){
				this._activeItems.removeAt(i);
			}
		}
	};
});
/*</file>*/
/*<file name="alz/mui/Component.js">*/
_package("alz.mui");

_import("alz.core.EventTarget");
_import("alz.mui.IBoxModel");
_import("alz.mui.IDesignable");

/**
 * UI组件应该实现BoxElement的接口
 * @class Component
 * @extends alz.core.EventTarget
 * @desc ss
 */
_class("Component", EventTarget, function(_super, _event){
	_implements(this, IBoxModel/*, IDesignable*/);
	/*
	 0 : el[k] = v;
	 1 : el.setAttribute(k, v);
	 2 : el.style[k] = v;
	*/
	var ATTR = function(arr){
		var hash = {};
		for(var i = 0, len = arr.length; i < len; i++){
			var a = arr[i].split(",");
			for(var j = 0, len1 = a.length; j < len1; j++){
				hash[a[j]] = i;
			}
		}
		return hash;
	}([
		/*0*/"href,htmlFor,id,name,innerHTML,onclick,ondragstart,onmousedown,tabIndex,title,type,maxLength,cellPadding,cellSpacing",
		/*1*/"value,nowrap,src,unselectable,_action,_action1,_align,_fid,_layout,_name,_position,_showArrow,_needSel,scrolling,frameBorder,frameSpacing",
		/*2*/"backgroundColor,backgroundPosition,backgroundRepeat,border,borderBottom,color,cursor,display,filter,font,fontWeight,fontFamily,fontSize,height,left,lineHeight,overflow,overflowX,padding,position,styleFloat,textAlign,top,whiteSpace,width,verticalAlign,zIndex,tableLayout,zoom"
	]);
	this._cursors = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
	this._init = function(){
		_super._init.call(this);
		//console.log("new " + this._className);
		this._tag = "Component";
		this._domCreate = false;
		/*
		 * 创建方式
		 * 0 = create
		 * 1 = bind
		 * 2 = build(xml)
		 * 3 = build(json)
		 * 4 = build(format text)
		 */
		this._domBuildType = 0;
		this._win = null;  //runtime.getWindow();
		this._doc = null;  //runtime.getDocument();  //this._win.document
		this._dom = runtime.getDom();
		//this._parent = null;
		this._owner = null;
		//this._id = null;
		this._tagName = "div";
		this._tplel = null;
		this._self = null;  //组件所关联的DOM元素
		this._containerNode = null;
		this._jsonData = null;
		this._data = null;  //结点的json数据
		this._attributes = {};  //纯字符串的属性值
		this._propertys = {};   //具体类型的属性值

		//盒模型相关属性

		this._align = "none";
		this._dockRect = {"x": 0, "y": 0, "w": 0, "h": 0};  //停靠以后组件的位置信息
		this._visible = null;  //false(boolean)
		this._zIndex = 0;
		this._opacity = 0;
		this._position = "";  //"relative"
		this._modal = false;
		this._ee = {};
		this._cssName = "";  //组件自身的DOM元素的className的替代名称
		this._xpath = "";
		this._state = "normal";
		/*
		UI组件插件
		key    名字   影响属性
		box    盒模型 left,top,width,height,margin*,border*,padding*
		action 动作   _action
		layout 布局   position,overflow,float,(box)
		align  停靠   (box)
		effect 效果   background,text,font
		*/
		this._plugins = {};
		//组件状态
		this._destroyed = false;  //是否已销毁
		//this._disposed = false;   //是否已部署
		this._created = false;    //是否已创建
		this._inited = false;     //是否已初始化
	};
	this.build = function(el){
		el._component = this;
		this._tplel = el;
		this._self = el._self;
		this._self._ptr = this;
		this._containerNode = el._container;
		/*
		var attributes = el._attributes;
		if(attributes.id){
			this._self.setAttribute("id", attributes.id);
		}
		if(attributes["class"]){
			runtime.dom.addClass(this._containerNode, attributes["class"]);
		}
		if(attributes.size){
			this.setSize(attributes.size);
		}
		*/
	};
	/**
	 * @method bind
	 * @param {Element} el
	 * @desc 调用该方法初始化的组件的所有属性从DOM元素中动态获取
	 * 设计该方法的思想和 init 方法完全相反，init方法从脚本组件角度考虑问题，bind
	 * 方法从 DOM 元素角度考虑问题。
	 */
	this.bind = function(el){
		this.setParent2(el.parentNode);
		var style = this._dom.getStyle(el);
		//if(this._className == "DlgPageTool") window.alert("123");

		//调用一遍实现的接口
		var imps = this.__cls__._imps;
		for(var i = 0, len = imps.length; i < len; i++){
			imps[i].init.call(this, el, style);  //执行接口的init方法
		}

		this._position = this.getPropertyValue(style, "position");
		this._visible = this.getPropertyValue(style, "display") != "none";
		if(this._jsonData){  //_jsonData 优先级最高
			for(var k in this._jsonData){
				if(this._jsonData[k]){
					this["_" + k] = this._jsonData[k];
				}
			}
			if(this._align != "none"){
				this._position = "absolute";
				this._dockRect.x = this._left;
				this._dockRect.y = this._top;
				this._dockRect.w = this._width;
				this._dockRect.h = this._height;
			}
		}
		this.__init(el, 1);
	};
	/**
	 * @method create
	 * @param {Element} parent
	 * @return {Element}
	 * @desc 创建一个 parent 容器的子元素
	 */
	this.create = function(parent){
		this.setParent2(parent);
		var el = this._createElement(this._tagName || "div");
		if(parent) this.setParent(parent, el);
		this.init(el);
		return el;
	};
	this.__init = function(el, domBuildType){
		if(this._parent && this._parent.add){  //容器类实例有该方法
			this._parent.add(this);
		}
		this._domBuildType = domBuildType;
		el._ptr = this;
		this._self = el;
		this._containerNode = el;  //基础组件默认_self就是具体的容器节点
		//this._self._ptr = this;
		//this._id = "__dlg__" + Math.round(10000 * Math.random());
		//this._self.id = this._id;
		if(this._position){
			this._self.style.position = this._position;
		}
	};
	/**
	 * @method init
	 * @param {Element} el
	 * @desc 以create方式初始化一个DOM元素
	 */
	this.init = function(el){
		if(this._inited){
			if(this._self !== el){
				console.log("[Component::init]error");
			}else{
				console.log("[Component::init]repeated");
			}
			return;
		}
		//_super.init.apply(this, arguments);
		this.__init(el, 0);
		//runtime.actionManager.add(this);
		//this.setVisible(this._visible);
		this._inited = true;
	};
	this.rendered = function(){
	};
	/**
	 * @method dispose
	 * @desc 析构方法
	 */
	this.dispose = function(){
		if(this._disposed) return;
		for(var k in this._plugins){
			this._plugins[k].dispose();
			delete this._plugins[k];
		}
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
		this._tplel = null;
		this._owner = null;
		//this._parent = null;
		this._dom = null;
		this._doc = null;
		this._win = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * @method toString
	 * @return {String}
	 * @desc 重写的toString()方法，形式为{tag:类名, align:对齐方式}
	 */
	this.toString = function(){
		return "{tag:'" + this._className + "'}";  //,align:'" + this._align + "'
	};
	/**
	 * @method setParent2
	 * @param {Document} parent document对象
	 * @desc 初始化window，document等环境
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
			console.error("[Component::setParent2]未能正确识别DocEnv环境，默认使用runtime.getDocument()");
			this._doc = runtime.getDocument();  //this._win.document
		}
		this._win = this._doc.parentWindow || this._doc.defaultView;  //runtime.getWindow();
	};
	/**
	 * @method getDoc
	 * @return {Document}
	 * @desc 获取document对象
	 */
	this.getDoc = function(){
		if(!this._doc){
			//this.initDocEnv(this._self/*, this._parent*/);
			this._doc = this._self.ownerDocument;
			this._win = this._doc.parentWindow || this._doc.defaultView;
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
		var el = this._createElement(tag);
		if(cls){
			el.className = cls;
		}
		if(style){
			for(var k in style){
				//if(k.charAt(0) == "_") 1;
				switch(ATTR[k]){
				case 0: el[k] = style[k];break;
				case 1: el.setAttribute(k, style[k]);break;
				case 2: el.style[k] = style[k];break;
				}
			}
		}
		if(parent){
			(parent._self || parent).appendChild(el);
		}
		return el;
	};
	this._renderElement = function(parent, el){
		if(parent.getContainer){
			parent = parent.getContainer();
		}
		if(this.__insert){
			parent.insertBefore(el, this.__insert);
		}else{
			parent.appendChild(el);
		}
	};
	this.createDomElement = function(parent, html, exp){
		var el = runtime.createDomElement(html, exp);
		if(parent){
			this._renderElement(parent, el);
		}
		return el;
	};
	/**
	 * @method parseNum
	 * @param {String} v
	 * @return {Number}
	 * @desc 把 v 转换成十进制表示的数字
	 */
	this.parseNum = function(v){  //(tag, v)
		return this._dom.parseNum(/*tag, */v);
	};
	this.getPropertyValue = function(style, name){
		return this._dom.getPropertyValue(style, name);
	};
	this.query = function(xpath/*, context*/){
		/*
		context = context || this._self;
		if(context == null){
			runtime.error("[Component::query]context is null!");
		}
		*/
		if(runtime.ie){
			return runtime._xpq.query(xpath, this._self);
		}else{
			return this._self.querySelectorAll(xpath);
		}
	};
	this.find = function(xpath/*, context*/){
		//return this.query(xpath, context)[0];
		if(runtime.ie){
			return runtime._xpq.query(xpath, this._self)[0];
		}else{
			return this._self.querySelector(xpath);
		}
	};
	this.setData = function(v){
		this._data = v;
	};
	/**
	 * @method getElement
	 * @return {Element}
	 * @desc 获取组件关联的DOM元素
	 */
	this.getElement = function(){
		return this._self;
	};
	this.getContainer = function(){
		return this._containerNode;
	};
	/**
	 * @method getData
	 * @return {Object}
	 * @desc 获取节点的json数据
	 */
	this.getData = function(){
		return this._data;
	};
	/**
	 * @method setJsonData
	 * @param {Object} v
	 * @desc 设置节点的json数据
	 */
	this.setJsonData = function(v){
		this._jsonData = v;
	};
	/**
	 * @method setParent
	 * @param {Element} v 父容器
	 * @param {Element} el 插入的元素
	 * @desc 把 el 插入 v 中，如果 el 之前已被加入DOM树，先进行移除。
	 */
	this.setParent = function(v, el){
		if(!v) v = runtime._workspace;  //el.parentNode
		//this._parent = v;
		_super.setParent.apply(this, arguments);
		if(el){
			var parent = v._self ? v : (
				v._ptr ? v._ptr : (
					v === this.getDoc().body ? {"_containerNode": v} : null
				)
			);
			if(!parent) throw "找不到父组件的 DOM 元素";
			if(el.parentNode){
				el.parentNode.removeChild(el);
			}
			parent._containerNode.appendChild(el);
		}
	};
	/**
	 * @method getOwner
	 * @return {Component}
	 * @desc 获取组件所有者
	 */
	this.getOwner = function(){
		return this._owner;
	};
	/**
	 * @method setOwner
	 * @return {Component} v
	 * @desc 设置组件所有者
	 */
	this.setOwner = function(v){
		this._owner = v;
	};
	/**
	 * @method setStyleProperty
	 * @param {Strinng} name 样式名称
	 * @param {Object} value 样式值
	 * @desc  设置组件所关联的DOM元素的 name 样式值
	 */
	this.setStyleProperty = function(name, value){
		try{
			if(this._self){
				this._self.style[name] = value;
			}
		}catch(ex){
			window.alert(ex.message + "\n" + name + "=" + value);
		}
	};
	/**
	 * @method setAttribute
	 * @param {Element} el DOM元素
	 * @param {Object} attributes 属性哈希表
	 * @desc  批量设置 el 的属性
	 */
	this.setAttribute = function(el, attributes){
		for(var attr in attributes){
			el.setAttribute(attr, attributes[attr]);
		}
		return el;
	};
	/**
	 * @method getAlign
	 * @return {String}
	 * @desc  获取组件的对齐方式
	 */
	this.getAlign = function(){
		return this._align;
	};
	/**
	 * @method setBgColor
	 * @param {String} v 背景色
	 * @desc  设置组件的背景色
	 */
	this.setBgColor = function(v){
		this.setStyleProperty("backgroundColor", v);
	};
	/**
	 * @method getVisible
	 * @return {Boolean}
	 * @desc  组件是否可见
	 */
	this.getVisible = function(){
		return this._visible;
	};
	/**
	 * @method setVisible
	 * @param {Boolean} v
	 * @desc  设置组件是否可见
	 */
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
	/**
	 * @method getZIndex
	 * @return {Number}
	 * @desc  获取组件的z坐标
	 */
	this.getZIndex = function(){
		return this._zIndex;
	};
	/**
	 * @method setZIndex
	 * @param {Number} zIndex
	 * @desc  设置组件的z坐标，大值会遮挡小值
	 */
	this.setZIndex = function(zIndex){
		this._zIndex = zIndex;
		this.setStyleProperty("zIndex", zIndex);
	};
	/**
	 * @method getOpacity
	 * @return {Number}
	 * @desc  获取组件的不透明度
	 */
	this.getOpacity = function(){
		return this._opacity;
	};
	/**
	 * @method setOpacity
	 * @param {Number} v
	 * @desc  设置组件的不透明度，可用值为0-1
	 */
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
	/**
	 * @method getCapture
	 * @return {Boolean}
	 * @desc  获取组件是否已经捕获焦点属性
	 */
	this.getCapture = function(){
		return this._capture;
	};
	/**
	 * @method setCapture
	 * @param {Boolean} bCapture
	 * @desc  ??
	 */
	this.setCapture = function(bCapture){  //设置为事件焦点组件
		this._capture = bCapture;
		runtime._workspace.setCaptureComponent(bCapture ? this : null);
		//this.getContext().getGuiManager().setCaptureComponent(bCapture ? this : null);
	};
	/**
	 * @method resize
	 * @param {Number} w
	 * @param {Number} h
	 * @desc  重置组件大小
	 */
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
	/**
	 * @method getViewPort
	 * @return {Object}
	 * @desc   获取组件的矩形信息，包括x，y，宽度和高度等。
	 */
	this.getViewPort = function(){
		return {
			"x": this._self.scrollLeft,
			"y": this._self.scrollTop,
			"w": this._self.clientWidth,  //Math.max(this._self.clientWidth || this._self.scrollWidth)
			"h": Math.max(this._self.clientHeight, this._self.parentNode.clientHeight)  //Math.max(this._self.clientHeight || this._self.scrollHeight)
		};
	};
	/**
	 * @method moveTo
	 * @param {Number} x x坐标
	 * @param {Number} y y坐标
	 * @desc   把组件移动到(x, y)位置
	 */
	this.moveTo = function(x, y){
		this.setLeft(x);
		this.setTop(y);
	};
	/**
	 * @method moveToCenter
	 * @desc   把组件移动到父容器的中心位置
	 */
	this.moveToCenter = function(){
		var rect = this._parent.getViewPort
			? this._parent.getViewPort()
			: runtime._workspace.getViewPort();
		var dw = this.getWidth() || this._self.offsetWidth;
		var dh = this.getHeight() || this._self.offsetHeight;
		this.moveTo(
			rect.x + Math.round((rect.w - dw) / 2),
			rect.y + Math.round((rect.h - dh) / 2)
		);
	};
	/**
	 * @method getPosition
	 * @param {Event} ev 事件对象
	 * @param {Number} type 事件类型
	 * @return {Object}
	 * @desc   获得事件的全局坐标位置
	 */
	this.getPosition = function(ev, type){
		var pos = type == 1
			? {"x": ev.offsetX, "y": ev.offsetY}
			: {"x": 0, "y": 0};
		var refElement = runtime._workspace._self;
		var el = ev.srcElement || ev.target;
		while(el && el != refElement){
			pos.x += el.offsetLeft;
			pos.y += el.offsetTop;
			el = el.offsetParent;
		}
		return pos;
	};
	/**
	 * 显示模态组件(对话框)
	 * @method showModal
	 * @param {Boolean} v 是否显示遮罩
	 * @desc   是否显示遮罩
	 */
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
	};
	/**
	 * @method setElementRect
	 * @param {Element} el DOM元素
	 * @param {Number} x x坐标
	 * @param {Number} y y坐标
	 * @param {Number} w 宽度
	 * @param {Number} h 高度
	 * @param {String} bg 背景
	 * @desc   设置 el 的矩形信息
	 */
	this.setElementRect = function(el, x, y, w, h, bg){
		el.style.left   = x + "px";
		el.style.top    = y + "px";
		el.style.width  = w + "px";
		el.style.height = h + "px";
	};
	/**
	 * @method setState
	 * @param {String} v 状态类型
	 * @desc   设置状态类型，比如error状态
	 */
	this.setState = function(v){
		if(v == this._state) return;
		this._state = v;
		//runtime.dom.applyCssStyle1(this, this._xpath, v);
	};
	this._cssKeyToJsKey = function(str){
		return str.replace(/-([a-z])/g, function(_0, _1){
			return _1.toUpperCase();
		});
	};
	/**
	 * @method applyCssStyle
	 * @param {Element} el DOM元素
	 * @param {Object} css 样式信息
	 * @param {String} className class名称
	 * @desc   为 el 应用传入的样式
	 */
	this.applyCssStyle = function(el, css, className){
		var style = css[(el.className == "error" ? "error-" : "") + className];
		for(var k in style){
			if(k.charAt(0) == "_"){
				var el = el.getElementsByTagName(k.substr(1))[0];
				for(var key in style[k]){
					var name = this._cssKeyToJsKey(key);
					if(el.style[name] != style[k][key]){
						el.style[name] = style[k][key];
					}
				}
			}else{
				var name = this._cssKeyToJsKey(k);
				if(el.style[name] != style[k]){
					el.style[name] = style[k];
				}
			}
		}
	};
	/**
	 * @method hasClass
	 * @param {String} cls class名称
	 * @return {Boolean}
	 * @desc   与组件关联的DOM元素是否有指定的className
	 */
	this.hasClass = function(cls){
		return this._dom.hasClass(this._self, cls);
	};
	/**
	 * @method addClass
	 * @param {String} cls class名称
	 * @return {String}
	 * @desc   为该组件关联的DOM元素添加className
	 */
	this.addClass = function(cls){
		return this._dom.addClass(this._self, cls);
	};
	/**
	 * @method removeClass
	 * @param {String} cls class名称
	 * @return {String}
	 * @desc   为该组件关联的DOM元素删除className
	 */
	this.removeClass = function(cls){
		return this._dom.removeClass(this._self, cls);
	};
	/**
	 * @method show
	 * @param {Boolean} useVisibility 是否使用visibility
	 * @desc   显示该组件
	 */
	this.show = function(useVisibility){
		this._dom.show(this._self, useVisibility);
	};
	/**
	 * @method hide
	 * @param {Boolean} useVisibility 是否使用visibility
	 * @desc   隐藏该组件
	 */
	this.hide = function(useVisibility){
		this._dom.hide(this._self, useVisibility);
	};
	/**
	 * @method getControl
	 * @param {Element} el DOM元素
	 * @return {Component}
	 * @desc   通过判断是否绑定有 js 组件对象来确定UI组件
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
	//事件绑定接口
	this.addListener = function(el, type, agent, func){
		runtime._eventManager.addListener(el, type, agent, func);
	};
	this.removeListener = function(el, type){
		runtime._eventManager.removeListener(el, type);
	};
	/**
	 * @method dispatchEvent
	 * @param {String} name 事件名(不包括on)
	 * @param {Array} params 参数列表
	 * @desc  触发事件
	 */
	this.dispatchEvent = function(name, params){
		var type = "on" + name;
		if(type in this && typeof this[type] == "function"){
			this[type].apply(this, params);
		}
	};
	this.setSize = function(v){
		var s = v.split(",");
		this._self.style.width = s[0] + "px";
		this._self.style.height = s[1] + "px";
	};
});
/*</file>*/
/*<file name="alz/action/ActionElement.js">*/
_package("alz.action");

_import("alz.mui.Component");

/**
 * 具有action特性的组件的基类
 */
_class("ActionElement", Component, function(_super, _event){
	ActionElement.hash = {       //free        cn
		"ActionElement"   : null,
		"FormElement"     : null,
		"LinkLabel"       : null,
		"ComboBox"        : null,  //["ComboBox", "FolderSelect", "GroupSelect"]
		"TextField"       : null,
		"UploadFileButton": null,
		"Button"          : null,  //["Button","SilverButton"]
		"CheckBox"        : null,
		"Radio"           : null
	};
	ActionElement.create = function(name){
		return new this.hash[name]();
	};
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
	this.bind = function(obj, actionManager){
		this._actionManager = actionManager;
		var c = obj._ptr;
		this.init(obj);
		if(c && c instanceof Component){
			c._plugins["action"] = this;
			obj._ptr = c;  //还原DOM元素的_ptr属性值
		}
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var data = {
			"disabled": this._self.getAttribute("_disabled") == "true",
			"action"  : this._self.getAttribute("_action")
		};
		this._disabled = data.disabled;
		this.setAction(data.action);
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
		if(this._self){
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
/*<file name="alz/action/BitButton.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * 带图标的按钮（表格实现
 */
_class("BitButton", ActionElement, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._visible = true;
	};
	this.init = function(obj, actionManager){
		_super.init.apply(this, arguments);
		this._actionManager = actionManager;
		/*
		var btn = $(arr[i]);
		btn.onmousemove = function(){this.getElementsByTagName("tr")[0].className = "onHover";};
		btn.onmouseout = function(){this.getElementsByTagName("tr")[0].className = "normal";};
		*/
		this._disabled = this._self.getAttribute("_disabled") == "true";
		this.setAction(this._self.getAttribute("_action"));
		var _this = this;
		if(this._action){
			this._self.onclick = function(ev){
				if(_this._disabled) return;
				_this._actionManager.dispatchAction(_this._action, this, ev || window.event);
				return false;
			};
		}
		var rows = this._self.rows;
		if(rows.length != 1){
			throw "[UI_ERROR]组件BitButton只能有一个TR";
		}
		this._self.onmouseover = function(){
			if(_this._disabled) return;
			_this._self.rows[0].className = "onHover";
		};
		this._self.onmouseout = function(){
			if(_this._disabled) return;
			_this._self.rows[0].className = "normal";
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onmouseover = null;
		this._self.onmouseout = null;
		_super.dispose.apply(this);
	};
	this.setStyleProperty = function(name, value){
		try{
			if(this._self){
				this._self.style[name] = value;
			}
		}catch(ex){
			window.alert(ex.message + "\n" + name + "=" + value);
		}
	};
	this.setDisabled = function(v){
		_super.setDisabled.apply(this, arguments);
		if(this._self){
			this._self.rows[0].className = v ? "OnDisable" : "normal";
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
/*<file name="alz/action/ComboBox_1.js">*/
_package("alz.action");

_import("alz.action.BitButton");

/**
 * 带下拉菜单的按钮类
 */
_class("ComboBox", BitButton, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._popmenu = null;
		this._popmenu_visible = false;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var rows = this._self.rows;
		if(rows.length != 1) throw "[UI_ERROR]组件BitButton只能有一个TR";
		var menuId = this._self.getAttribute("_popmenu");
		if(!menuId) throw "[UI_ERROR]组件ComboBox缺少属性_popmenu，请检查相关的HTML代码";
		this._popmenu = $(menuId);
		if(!this._popmenu) throw "[UI_ERROR]无法找到ComboBox组件的popmenu(id=" + menuId + ")，请检查相关的HTML代码";
		this.setAction(this._self.getAttribute("_action"));
		/*
		if(this._action){
			if(window[this._action] && typeof window[this._action] == "function"){
				;
			}else{
				throw "[UI_ERROR]组件ComboBox的属性_action的值不是一个函数，请检查相关的HTML代码";
			}
		}
		*/
		var _this = this;
		this._self.onmouseover = function(){
			if(_this._disabled) return;
			_this._self.rows[0].className = "onHover";
			_this.showMenu(true);
		};
		this._self.onmouseout = function(){
			if(_this._disabled) return;
			_this._self.rows[0].className = "normal";
			_this.showMenu(false);
		};
		this._popmenu.onmouseover = function(){
			_this._self.rows[0].className = "onHover";
			_this.showMenu(true);
		};
		this._popmenu.onmouseout = function(){
			_this._self.rows[0].className = "normal";
			_this.showMenu(false);
		};
		/*
		this._popmenu.onclick = function(ev){
			_this.showMenu(false);
			ev = ev || window.event;
			var target = ev.target || ev.srcElement;
			if(target.tagName == "A"){
				target = target.parentNode;
			}
			if(_this._self.onChange){
				_this._self.onChange(target);
			}
			ev.cancelBubble = true;
			return false;
		};
		*/
	};
	this.dispose = function(){
		if(this._disposed) return;
		//this._popmenu.onclick = null;
		this._popmenu.onmouseout = null;
		this._popmenu.onmouseover = null;
		this._popmenu = null;
		this._self.onmouseout = null;
		this._self.onmouseover = null;
		_super.dispose.apply(this);
	};
	this.showMenu = function(v){
		if(this._popmenu_visible == v) return;
		this._popmenu_visible = v;
		if(v){
			var pos = util_getPosition(this._self);
			if(this._popmenu.offsetWidth < this._self.offsetWidth){
				this._popmenu.style.width = (this._self.offsetWidth - 2/* - 10*/) + "px";  //padding(8) + border(2)
			}
			this._popmenu.style.left = pos.x + "px";
			this._popmenu.style.top = (pos.y + this._self.offsetHeight - 1) + "px";
			this._popmenu.style.display = "";
		}else{
			this._popmenu.style.display = "none";
		}
	};
	this.appendItem = function(text, value){
		var ul = util_selectNodes(this._popmenu, "*")[0];
		var li = this._createElement2(ul, "li");
		li._value = value;
		li._text = text;
		var _this = this;
		li.onclick = function(ev){
			_this._actionManager.dispatchAction(_this._action, this, ev || window.event);
		};
		var a = this._createElement2(li, "a", "", {
			"href": "#"
		});
		a.appendChild(this._createTextNode(text));
	};
});
/*</file>*/
/*<file name="alz/action/LinkLabel.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * 超链接(a)元素的封装
 */
_class("LinkLabel", ActionElement, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
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
/*<file name="alz/action/TextField.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * input:text元素的封装
 */
_class("TextField", ActionElement, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onblur = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onblur = null;
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/action/Button.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * input:button元素的封装
 */
_class("Button", ActionElement, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
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
		this.setDisabled(v);  //强制更新
		/*
		var rows = this._self.rows;
		for(var i = 0, len = rows.length; i < len; i++){
			rows[i].onmouseover = function(){if(_this._disabled) return; this.className = "onHover";};
			rows[i].onmouseout = function(){if(_this._disabled) return; this.className = "normal";};
		}
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
		if(this._self){
			this._self.style.color = v ? "gray" : "";
			//this._self.rows[0].className = v ? "OnDisable" : "normal";
			/*if(v){
				var btn = this._self.getElementsByTagName("div")[0];
				if(btn) btn.style.backgroundImage = "url(http://www.sinaimg.cn/rny/sinamail421/images/comm/icon_btn.gif)";
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
_class("CheckBox", ActionElement, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this.setAction(this._action.split("|"));
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
_class("ComboBox", ActionElement, function(_super, _event){
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
/*<file name="alz/action/Select.js">*/
_package("alz.action");

_import("alz.action.ComboBox");

/**
 * select元素的封装
 */
_class("Select", ComboBox, function(_super, _event){
	this._init = function(obj){
		_super._init.call(this);
		this._select = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._select = this._self;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._select = null;
		_super.dispose.apply(this);
	};
	this.reset = function(pageCount, pageNo){
		this._initListPage(pageCount, pageNo);
		//this._select.value = pageNo;
	};
	//[TODO]页数很多的时候会出现性能问题
	this._initListPage = function(pageCount, pageNo){
		var options = this._select.options;
		//var len = options.length;
		this._select.style.display = "";
		/*
		if(len > pageCount){
			while(options.length > pageCount){
				this._select.remove(options.length - 1);
			}
		}else if(len < pageCount){
			for(var i = Math.max(1, len); i <= pageCount; i++){
				options[options.length] = new Option(i + "/" + pageCount, i);
			}
		}*/
		while(options.length){
			this._select.removeChild(options[0]);
		}
		for(var i = 1; i <= pageCount; i++){
			var option = new Option(i + "/" + pageCount, i);
			options[options.length] = option;
			if(i == pageNo){
				option.selected = true;
			}
		}
		if(options.length == 0){
			this._select.style.display = "none";
		}
	};
});
/*</file>*/
/*<file name="alz/action/FormElement.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

/**
 * form元素的封装
 */
_class("FormElement", ActionElement, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._elements = [];
		this._app = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onsubmit = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
		this.initCustomElements();
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._app = null;
		for(var i = 0, len = this._elements.length; i < len; i++){
			this._elements[i].dispose();
			this._elements[i] = null;
		}
		this._elements.length = 0;
		this._self.onsubmit = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resetSelf = function(){
		this._self.reset();
	};
	this.getApp = function(){
		if(!this._app){
			for(var el = this._self; el && el._ptr; el = el.parentNode){
				if(el._ptr.instanceOf("mail.ui.Pane")){
					this._app = el._ptr.getApp();
					break;
				}
			}
		}
		return this._app;
	};
	/**
	 * 初始化自定义的表单元素
	 */
	this.initCustomElements = function(){
		//提前收集表单元素，防止后面处理自定义元素时，可能往表单中添加新元素而引起问题
		var elements = [];
		var nodes = this._self.elements;
		for(var i = 0, len = nodes.length; i < len; i++){
			elements.push(nodes[i]);
		}
		for(var i = 0, len = elements.length; i < len; i++){
			var el = elements[i];
			switch(el.tagName){
			case "INPUT":
				switch(el.type){
				case "text":
				case "hidden":
					var className = el.getAttribute("_ui");
					if(className){  //只处理有_ui属性的元素
						if(el.type == "text"){
							el.style.display = "none";
						}
						var clazz = __context__.__classes__[className];
						var component = new clazz();
						component.bindElement(el, this.getApp());
						this._elements.push(component);
					}
					break;
				}
				break;
			}
		}
	};
});
/*</file>*/
/*<file name="alz/mui/IAction.js">*/
_package("alz.mui");

_import("alz.core.ActionManager");
_import("alz.action.ActionElement");
_import("alz.action.FormElement");
_import("alz.action.LinkLabel");
_import("alz.action.ComboBox");
_import("alz.action.Select");
_import("alz.action.TextField");
_import("alz.action.Button");
_import("alz.action.CheckBox");

/**
 * Action接口
 */
_interface("IAction", "", function(){
	var list = [
		{"id": "a"             , "type": "click" , "clazz": "LinkLabel"  },
		{"id": "form"          , "type": "submit", "clazz": "FormElement"},
		{"id": "select"        , "type": "change", "clazz": "ComboBox"   },
		{"id": "button"        , "type": "click" , "clazz": "Button"     },
		{"id": "input#button"  , "type": "click" , "clazz": "Button"     },
		{"id": "input#checkbox", "type": "click" , "clazz": "CheckBox"   }
	];
	var map = {};
	for(var i = 0, len = list.length; i < len; i++){
		var item = list[i];
		item.clazz = __context__[item.clazz];
		map[item.id] = item;
	}
	this._init = function(){
		this._actionManager = null;
		this._currentSender = null;
		this._lastTime = 0;
		//this._lastAct = "";
	};
	this.init = function(){
		if(!this._actionManager){
			this._actionManager = new ActionManager();
			this._actionManager.init(this);
		}
	};
	this.rendered = function(){
		console.log("[IAction::rendered]");
		if(!this._actionManager){
			this._actionManager = new ActionManager();
			this._actionManager.init(this);
		}
		this.initActionElements();
	};
	this.dispose = function(){
		if(this._actionManager){
			this._actionManager.dispose();
			this._actionManager = null;
		}
	};
	this.getActionEngine = function(){
		return this;
	};
	this.getCurrentSender = function(){
		return this._currentSender;
	};
	/**
	 * 初始化组件中的动作元素，使这些元素可以响应默认事件触发其action
	 * [TODO]如何避免已经初始化过的元素重复初始化？
	 * @param {HTMLElement} element
	 * @param {Object} owner
	 * @param {Array} customTags 自定义支持action的标签
	 */
	this.initActionElements = function(element, owner, customTags){
		//owner = owner || this.getActionEngine();
		this.initComponents(element, customTags);
	};
	/**
	 * 初始化组件中的 Action 动作组件
	 * 支持的 Action 动作组件有：
	 *   表单  ： FORM
	 *   超链接： A
	 *   按钮  ： INPUT(type=button)
	 *   复选框： INPUT(type=checkbox)
	 *   列表框： SELECT
	 * 支持增量初始化运行方式
	 */
	this.initComponents = function(element, customTagList){
		element = element || this._self;
		customTagList = customTagList || [];
		var customNodes = [];
		var tags = ["form", "a", "select", "button", "input"].concat(customTagList);
		for(var i = 0, len = tags.length; i < len; i++){
			var tag = tags[i];
			var nodes = element.getElementsByTagName(tag);
			for(var j = 0, len1 = nodes.length; j < len1; j++){
				var node = nodes[j];
				var act = node.getAttribute("_action");
				if(act){
					var key = "a";
					switch(tag){
					case "form":
					case "a":
					case "select": key = tag;break;
					case "input":
						switch(node.type){
						//case "text"  :
						case "button"  :
						case "checkbox": key = tag + "#" + node.type;break;
						default        : key = "";continue;
						}
						//application._buttons[btn._action] = btn;
						break;
					default:  //li,label等标签
						break;
					}
					if(key != ""){
						var clazz = map[key].clazz;
						var plugin = new clazz();
						plugin.bind(node, this._actionManager);
						this._actionManager.add(plugin);
					}
				}
			}
		}
		return customNodes;
	};
	/**
	 * Action 工作模型
	 * [TODO]
	 * 1)级联激发的 Action 动作只把最初的动作压入动作栈，这样能够保证正确的动作回
	 *   退机制。
	 */
	this.doAction = function(act, sender){
		var skip = false;
		if(act == "pop_show"){
			skip = true;
		}
		var time = new Date().getTime();
		if(!skip && time < this._lastTime + 500){
			this._lastTime = time;
			return false;
		}
		//if(time < this._lastTime + 800 && this._lastAct == act){
		//	return false;
		//}
		this._lastTime = time;
		//this._lastAct = act;
		this._currentSender = sender;
		var ret, key = "do_" + act;
		if(key in this && typeof this[key] == "function"){
			ret = this[key](act, sender);
		}else{  //自己处理不了的交给APP处理
			ret = this._app.doAction.apply(this._app, arguments);  //[TODO]
			//runtime.error("[Pane::doAction]未定义的act=" + act);
			//ret = false;
		}
		this._currentSender = null;
		//[TODO]应该在动画播完之后运行，如何保证呢？
		/*
		runtime.startTimer(10, this, function(){
			this._taskSchedule.run("page_unload");
		});
		*/
		return typeof ret == "boolean" ? ret : false;
	};
});
/*</file>*/
/*<file name="alz/mui/ListItem.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 列表项目
 */
_class("ListItem", Component, function(_super, _event){
	this._css = {
		"normal": {},
		"active": {},
		"_hover": {}
	};
	this._init = function(){
		_super._init.call(this);
		this._data = null;
		this._active = false;
		this._itemDom = null;  //响应 ListItem 相关事件的 DOM 元素，不一定是 ListItem._self
		this._checked = false;  //是否被选中
		this._checkbox = null;
		this._label = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._itemDom = this._self;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._label = null;
		this._checkbox = null;
		this._itemDom = null;
		this._data = null;
		_super.dispose.apply(this);
	};
	this.getData = function(){
		return this._data;
	};
	this.setData = function(v){
		this._data = v;
	};
	this.setChecked = function(v, force){
		if(this._checked == v && !force) return;
		this._checked = v;
		if(this._checkbox){
			this._checkbox.checked = v;
		}
	};
	this.getIndex = function(){
		return this._parent.getItemIndex(this);
	};
	this.updateStyle = function(style){
		for(var k in style){
			if(k.charAt(0) == "_") continue;
			(k == "className" ? this._self : this._self.style)[k] = style[k];
		}
	};
	this.activate = function(force){
		if(this._active && !force) return;  //已经激活，则不进行任何操作（性能优化）
		this._active = true;
		this.setChecked(true);
		if(this._self){
			this.updateStyle(this._css.active);
			try{this._self.focus();}catch(ex){}  //能保证Item可以被看到
		}
		if(this.onActive) this.onActive();
	};
	this.deactivate = function(force){
		if(!this._active && !force) return;
		this._active = false;
		this.setChecked(false);
		if(this._self){
			this.updateStyle(this._css.normal);
		}
		if(this.onActive) this.onActive();
	};
});
/*</file>*/
/*<file name="alz/mui/ListBox.js">*/
_package("alz.mui");

_import("alz.mui.SelectionManager");
_import("alz.mui.Component");

/**
 * 列表框组件
 * protected boolean selectionMode = 0;
 * 0 = (默认)配合ctrl,shift按键可以方便的进行多选的常规模式，仿 window 资源管理器文件选择的行为
 * 1 = ctrl,shift仍然可用，不过默认单击为复选模式，再次单击改为取消复选（目的为了不使用ctrl,shift键依然可以进行多选操作）
 */
_class("ListBox", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._data = null;
		this._model = null;  //数据源
		this._tableIndex = null;
		this._useSelectionMode = false;  //{Boolean}是否使用 SelectionManager
		this._multiple         = false;  //{Boolean}默认不支持多选
		this._selectionMode    = 0;      //{Number}列表项目多选模式
		this._hash = {};   //哈希表
		this._list = [];  //列表项目
		this._activeItem = null;
		this._selectMgr = null;
	};
	this.bind = function(obj, model){
		this.setParent2(obj.parentNode);
		this.setModel(model, "+id");
		this.init(obj);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._self.onselectstart = function(){return false;};
		this._selectMgr = new SelectionManager();
		//this._useSelectionMode = true;  //{Boolean}是否使用 SelectionManager
		//this._multiple         = true;  //{Boolean}默认不支持多选
		//this._selectionMode    = 1;     //{Number}列表项目多选模式
		this._selectMgr.setBindList(this);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._selectMgr.dispose();
		this._selectMgr = null;
		if(this._activeItem){
			this._activeItem.deactivate();
			this._activeItem = null;
		}
		for(var i = 0, len = this._list.length; i < len; i++){
			//this._list[i].dispose();
			this._list[i] = null;
		}
		this._list.length = 0;
		for(var k in this._hash){
			this._hash[k].dispose();
			delete this._hash[k];
		}
		if(this._tableIndex){
			this._tableIndex.removeEventListener("dataChange", this);
			this._tableIndex = null;
		}
		this._model = null;
		this._data = null;
		this._self.onselectstart = null;
		_super.dispose.apply(this);
	};
	this.getData = function(){
		return this._data;
	};
	this.setData = function(v){
		this._data = v;
	};
	this.setModel = function(v, filter){
		this._model = v;
		var index = v.getIndex2(filter);
		this._tableIndex = index;
		index.addListener("dataChange", this, "onDataChange");
		runtime.startTimer(0, index, "dispatchExistRecords");  //滞后加载已有的数据，因为相关组件的_self属性可能还不存在
	};
	this.getActiveItem = function(){
		return this._activeItem;
	};
	this.setActiveItem = function(v){
		if(this._activeItem == v) return;
		if(this._activeItem){
			this._activeItem.deactivate();
		}
		if(v){
			v.activate();
		}
		this._activeItem = v;
		//if(this.onSelectChange) this.onSelectChange(v);
	};
	this.getActiveNums = function(){
		return this._selectMgr.getActiveNums();
	};
	this.getActiveItems = function(){
		return this._selectMgr.getActiveItems();
	};
	this.cancelAllActiveItems = function(){
		return this._selectMgr.cancelAllActiveItems();
	};
	this.pushItem = function(item){
		var k = item._data[this._model.getPrimaryKey()];
		if(!(k in this._hash)){
			this._hash[k] = item;
			this._list.push(item);
		}
	};
	this.unshiftItem = function(item){
		var k = item._data[this._model.getPrimaryKey()];
		if(!(k in this._hash)){
			this._hash[k] = item;
			this._list.unshift(item);
		}
	};
	/**
	 * 移除一个列表项目
	 * @param n {Number|ListItem}
	 * @param cache {boolean}  是否缓存列表项目
	 * [TODO]更新 _selectMgr 中的相关信息
	 */
	this.removeItem = function(n, cache){
		if(typeof n != "number"){
			n = this._list.indexOf(n);
		}
		if(n != -1){
			var item = this._list[n];
			if(item == this._activeItem){
				this._activeItem = null;
			}
			var p = this._selectMgr._activeItems.indexOf(item);
			if(p != -1){
				this._selectMgr._activeItems.removeAt(p);
			}
			if(this.onItemRemove){
				this.onItemRemove();  //针对 ContactList 的处理
			}
			//var uid = item._data.uid;
			//app.getModel("group").removeAllGroupMember(uid);  //移除每个组中的成员索引信息
			//delete hash[item._data.uid];  //移除 ContactItem._data 信息
			//移除 Item
			delete this._hash[item._data[this._model.getPrimaryKey()]];
			if(cache){  //如果缓存，只需从父节点移出
				if(item._self && item._self.parentNode != null){
					item._self.parentNode.removeChild(item._self);
				}
			}else{
				item.dispose();
			}
			this._list[n] = null;
			this._list.removeAt(n);
		}
	};
	/**
	 * 删除活动的 ContactItem
	 * [TODO]通过建立合理的数据结构，下面的循环都是可以优化的
	 */
	this.removeActiveItems = function(app){
		for(var i = 0; i < this._list.length;){
			if(this._list[i]._active){
				this.removeItem(i);
				continue;
			}
			i++;
		}
		//app._groupList.updateAllGroup();  //更新所有组的成员数
	};
	this.indexOf_key = function(data, key){
		var n = -1;
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i][key] == data){
				n = i;
				break;
			}
		}
		return n;
	};
	this.getItemIndex = function(item){
		var n = -1;
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i] == item){
				n = i;
				break;
			}
		}
		return n;
	};
	this.getItemByKey = function(key){
		return key in this._hash ? this._hash[key] : null;
	};
	//--------------------------------
	//interface MultiSelect
	//下面的方法是允许多选的接口方法
	//--------------------------------
	/**
	 * 获取组建的列表项目数组
	 */
	this.getItems = function(){
		return this._list;
	};
	/**
	 * 获取一个列表项目
	 */
	this.getItem = function(n){
		return this._list[n];
	};
	/**
	 * 激活指定的列表项目，支持多选
	 * @param item {HTMLElement} 要激活的列表项目
	 * @param active {Boolean} 是否激活该列表项目
	 */
	this.activeItem = function(item, active){
		if(!this._useSelectionMode){
			if(this._activeItem == item) return;
			if(this._activeItem){
				this._activeItem.deactivate();
			}
			item.activate();
			this._activeItem = item;
			if(this.onSelectChange) this.onSelectChange(item);
		}else{
			if(active){
				item.activate();
			}else{
				item.deactivate();
			}
		}
	};
	/**
	 * 通过过滤器函数来选择相关的项目
	 */
	this.selectByFilter = function(func){
		var list = [];   //活动的列表项目
		var list0 = [];  //每个列表项目的状态(true|false)
		var items = this._list;
		for(var i = 0, len = items.length; i < len; i++){
			var v = func(items[i]);
			if(v){
				list.push(items[i]);
			}
			list0.push(v);
		}
		this._selectMgr.selectItems(list, list0);
	};
	/**
	 * 数据变更响应事件，主要用来分派数据变化
	 * @param {DataChangeEvent} ev 数据变更事件
	 */
	this.onDataChange = function(ev){
		var act = ev.act;
		var data = ev.data;
		//var olddata = ev.olddata;
		var a = act.split("_")[1];
		switch(a){
		case "adds":  //批量添加
			this.insertItems(data, ev.pos);
			break;
		case "add":
			if(!this._filter || this._filter(data)){  //有过滤器的话，需要先通过过滤器，才添加
				var id = data[this._model.getPrimaryKey()];
				if(!(id in this._hash)){
					this.insertItem(data, ev.pos);
				}
			}
			break;
		case "mod": 
			//if(!this._filter || this._filter(data)){  //有过滤器的话，情况比较复杂，先交给“视图组件”来自行处理
				//this.onDataChange.apply(this, arguments);
				var id = data[this._model.getPrimaryKey()];
				if(id in this._hash){
					this.updateItem(data);
				}
			//}
			break;
		case "del":
		case "remove":
			if(!this._filter || this._filter(data)){  //有过滤器的话，需要先通过过滤器，才删除
				//this.onDataChange.apply(this, arguments);
				this.deleteItem(data);
			}
			break;
		/*
		case "update":
		case "delete":
		case "clear":
		case "up":
		case "adds":
		case "clean":
		*/
		default:
			//_super.onDataChange.apply(this, arguments);
			break;
		}
	};
	this._insertItem = function(data, pos){
		console.log("_insertItem");
	};
	this.insertItem = function(data, pos){
		this._insertItem(data, pos);
	};
	this.insertItems = function(data, pos){
		for(var i = 0, len = data.length; i < len; i++){
			this._insertItem(data[i], pos + i);
		}
	};
	this.updateItem = function(data){
	};
	this._deleteItem = function(data){
		var id = data[this._model.getPrimaryKey()];
		if(id in this._hash){
			var item = this._hash[id];
			if(item == this._activeItem){
				this._activeItem = null;
			}
			item._self.parentNode.removeChild(item._self);
			var n = this._list.indexOf(item);
			if(n != -1){
				this._list[n] = null;
				this._list.removeAt(n);
			}
			delete this._hash[id];
			item.dispose();
		}
	};
	this.deleteItem = function(data){
		this._deleteItem(data);
	};
	this.deleteAllItems = function(){
		this._activeItem = null;
		for(var i = 0, len = this._list.length; i < len; i++){
			if(!this._list[i]._disposed){
				this._list[i].dispose();
			}
			this._list[i] = null;
		}
		this._list.length = 0;
		for(var k in this._hash){
			//this._hash[k].dispose();
			delete this._hash[k];
		}
	};
});
/*</file>*/
/*<file name="alz/mui/DataRow.js">*/
_package("alz.mui");

_import("alz.mui.ListItem");

/**
 * 数据行组件(视图)
 */
_class("DataRow", ListItem, function(_super, _event){
	/**
	 * 根据cell结构数据创建一组cell对象
	 */
	this.createCells = function(cellsInfo){
		for(var i = 0, len = cellsInfo.length; i < len; i++){
			this._createElement2(this._self, "td", cellsInfo[i][0], {
				"innerHTML": cellsInfo[i][1]
			});
		}
		//this._checkbox = this._self.childNodes[0].childNodes[0].childNodes[0];
	};
	this.init_callback = function(){
		this._checkbox.onmousedown = function(ev){
			ev = ev || window.event;
			ev.cancelBubble = true;
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._checkbox){
			this._checkbox.onmousedown = null;
		}
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/mui/DataTable.js">*/
_package("alz.mui");

_import("alz.mui.ListBox");

/**
 * 数据表格组件(视图)
 */
_class("DataTable", ListBox, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._hashIndexs = {};  //索引哈希(每个元素是一个数组)
		this._dataModel = null;  //数据模型
		this._checkall = null;  //全选复选框
		this._table = null;     //关键的table
		this._tbody = null;
		this._sortKey = this._key;
		this._activeSortField = null;  //当前活动的字段
		this._sort = {  //存储当前排序状态
			"by"      : "",
			"sorttype" : ""
		};
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._hashIndexs[this._key] = this._items;  //把this._items看作主索引
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._tbody = null;
		this._table = null;
		this._checkall = null;
		this._dataModel = null;
		for(var k in this._hashIndexs){
			for(var i = 0, len = this._hashIndexs.length; i < len; i++){
				this._hashIndexs[k][i] = null;
			}
			delete this._hashIndexs[k];
		}
		_super.dispose.apply(this);
	};
	/**
	 * @param {String} key 要排序的字段
	 */
	this.getSortItems = function(key){
		return this._items.sort(function(a, b){
			if(a._data[key] > b._data[key]) return 1;
			if(a._data[key] < b._data[key]) return -1;
			return 0;
		});
	};
	/**
	 * 按照当前排序规则，在正确的位置上插入一个数据项
	 * 该方法是具有排序特性的组件针对 ListBox::pushItem 的替代方法
	 */
	//this.pushItem =
	this.insertItem = function(item){
		//_super.pushItem.apply(this, arguments);
		if(this._key == "") window.alert("[ListBox::pushItem]key == ''");
		var k = item._data[this._key];
		var key = this._sortKey || this._key;
		if(!(k in this._hash)){
			this._hash[k] = item;
			//this._items.push(item);
			var n = this.halfFind(this._items, item, function(a, b){
				runtime.log("====" + a._data[key] + ">" + b._data[key] + "=" + (a._data[key] > b._data[key]));
				if(a._data[key] > b._data[key]) return 1;
				if(a._data[key] < b._data[key]) return -1;
				return 0;
			});
			if(n.ret == -1){
				runtime.log("====" + n.pos);
				this._items.splice(n.pos, 0, item);  //插入一个元素
			}else{
				window.alert("[DataTable::insertItem]数据有重复");
				//runtime.log("[DataTable::pushItem]当前要插入的元素已经存在");
			}
		}
	};
	//二分查找算法
	this.halfFind = function(arr, item, f){
		var i = 1;
		var low = 0;
		var high = arr.length - 1;
		if(high == -1){
			return {"ret": -1, "pos": 0};
		}
		var t = Math.floor((high + low) / 2);
		while(low < high && f(arr[t], item) * f(arr[low], item) * f(arr[high], item) != 0){
			//runtime.log("第" + i + "次查找 -> " + t + "的位置：low=" + low + " high=" + high);
			if(f(item, arr[t]) == 1){  //item > arr[t]
				low = t + 1;
			}else{
				high = t - 1;
			}
			t = Math.floor((high + low) / 2);
			i++;
		}
		if(high == -1){
			return {"ret": -1, "pos": 0};
		}
		if(low >= high && f(arr[t], item) * f(arr[low], item) * f(arr[high], item) != 0){
			//runtime.log("第" + i + "次查找 -> " + t + "的位置：失败！low=" + low + " high=" + high);
			return {
				"ret": -1,
				"pos": f(item, arr[low]) == -1 ? low : low + 1
			};
		}else{
			if(f(arr[t], item) == 0){  //arr[t] == item
				tt = t;
			}else if(f(arr[low], item) == 0){  //arr[low] == item
				tt = low;
			}else{
				tt = high;
			}
			//runtime.log("第" + i + "次查找 -> " + tt + "的位置：找到！low=" + low + " high=" + high);
			return {
				"ret": t,
				"pos": t
			};
		}
		//return t;
	};
	//希尔排序算法
	this.shellSort = function(arr, func){
		for(var step = arr.length >> 1; step > 0; step >>= 1){
			for(var i = 0; i < step; ++i){
				for(var j = i + step; j < arr.length; j += step){
					var k = j, value = arr[j];
					while(k >= step && func(arr[k - step], value) > 0){
						arr[k] = arr[k - step];
						k -= step;
					}
					arr[k] = value;
				}
			}
		}
		//return arr;
	};
	this.activeSortField = function(sender, force){
		var dom = runtime.dom;
		//id         :"number",  //可排序
		//filename   :"string",  //可排序
		//filesize   :"number",  //可排序
		//status     :"number",  //可排序
		//downloadcnt:"number",  //可排序
		//leftdays   :"number",  //可排序
		//token      :"string",
		//url        :"string"
		var key = sender.getAttribute("_by");
		if(force){  //第一次初始化过程中使用强制模式，保证不反转by和sorttype参数
			//this._sort.by = key;
			//this._sort.sorttype = "desc";
			dom.addClass(sender, this._sort.sorttype == "asc" ? "sort_down" : "sort_up");
		}else{
			if(this._activeSortField){
				dom.removeClass(this._activeSortField, "sort_down");
				dom.removeClass(this._activeSortField, "sort_up");
			}
			this._sort.by = key;  //记住排序状态
			this._sort.sorttype = key == this._sort.by ? (this._sort.sorttype == "asc" ? "desc" : "asc") : "asc";
			dom.addClass(sender, key == this._sort.by ? (this._sort.sorttype == "asc" ? "sort_down" : "sort_up") : "sort_up");
		}
		this._activeSortField = sender;
		this.drawTable(this.getSortItems(key));
	};
	this.drawTable = function(items){
		if(this._sort.sorttype == "asc"){
			for(var i = 0, len = items.length; i < len; i++){
				var item = items[i];
				item._self.parentNode.appendChild(item._self);
				item.setChecked(item._active, true);
			}
		}else{
			for(var i = items.length - 1; i >= 0; i--){
				var item = items[i];
				item._self.parentNode.appendChild(item._self);
				item.setChecked(item._active, true);
			}
		}
	};
	/**
	 * 选中符合条件的行，func决定是否符合条件
	 */
	this.selectRows = function(func, table){
		for(var i = 0, len = this._items.length; i < len; i++){
			if(table && this._items[i]._self.parentNode.parentNode != table){
				continue;
			}
			var row = this._items[i];
			if(func(row)){
				row.activate();
			}else{
				row.deactivate();
			}
		}
	};
	/**
	 * @param {Boolean} checked 是否选中
	 */
	this.selectAll = function(checked){
		this._selectMgr.selectAllItems(checked);
		this.dispatchEvent("ItemSelectChange", [this.getActiveNums()]);
	};
	this.cancelAll = function(){
		this._selectMgr.cancelAllActiveItems();
		this._checkall.checked = false;
		this.dispatchEvent("ItemSelectChange", [0]);
	};
	//this.cancelAllActiveItems
});
/*</file>*/
/*<file name="alz/mui/TextHistory.js">*/
_package("alz.mui");

/**
 * 命令历史纪录
 */
_class("TextHistory", "", function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._historys = [];
		this._curIndex = 0;  //历史记录的位置
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._historys.length; i < len; i++){
			this._historys[i] = null;
		}
		this._historys.length = 0;
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

_class("TextItem", Component, function(_super, _event){
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
		var el = document.createElement("span");
		el.className = this._type;
		parent._self.appendChild(el);
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		this.update();
	};
	this.dispose = function(){
		if(this._disposed) return;
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
_class("LineEdit", Component, function(_super, _event){
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
		var selection = document.selection;
		var rng = selection.createRange();
		this._self.select();
		rng.setEndPoint("StartToStart", selection.createRange());
		this._pos = rng.text.length;
		document.title = this._pos;
		rng.collapse(false);  //移到后面
		rng.select();
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
		var el = this._createElement2(parent ? parent._self : null, "div", "ui-lineedit");
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		var _this = this;
		if(this._useInput){
			this._input = this._createElement2(null, "input", "input", {
				"type"     : "text",
				"maxLength": "78"
			});
			//if(debug) this._input.style.backgroundColor = "#444444";
			this.addListener(this._input, "keydown", this, "onKeyDown1");
			this.addListener(this._input, "keyup", this, function(){
				//this._timer = runtime.addThread(200, this, getCursorIndex);
			});
			this.addListener(this._input, "keypress", this, "onKeyPress");
			//this._input.onfocus = function(){};
			//this._input.onblur = function(){};
			this.addListener(this._input, "dblclick", this, function(ev){
				if(this._timer != 0){
					window.clearTimeout(this._timer);
					this._timer = 0;
				}
			});
			this.addListener(this._input, "click", this, function(ev){
				//this._timer = runtime.addThread(200, this, getCursorIndex);
				ev.cancelBubble = true;
			});
		}else{
			/*
			if(runtime.moz){
				document.onkeydown = function(ev){
					return _this.onKeyDown(ev || window.event, _this._self);
				};
			}else{
				this.addListener(this._self, "keydown", this, "onKeyDown");
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
		this._items.length = 0;
		this._col = 0;
		this.print(this._parent.getPrompt(), "sys");
		this.setIomode("in");
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activeItem = null;
		for(var i = 0, len = this._items.length; i < len; i++){
			this._items[i].dispose();
			this._items[i] = null;
		}
		this._items.length = 0;
		this._app = null;
		if(this._useInput){
			this.removeListener(this._input, "click");
			this.removeListener(this._input, "dblclick");
			//this._input.onblur = null;
			//this._input.onfocus = null;
			this.removeListener(this._input, "keypress");
			this.removeListener(this._input, "keyup");
			this.removeListener(this._input, "keydown");
			this._input = null;
		}else{
			this.removeListener(this._self, "keydown");
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
				this._items.length = 0;
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
		var s = document.selection.createRange();
		s.setEndPoint("StartToStart", this._input.createTextRange());
		return s.text;
	};
	this.addInputText = function(text, value){
		//var rng = this._input.createTextRange();
		//rng.moveEnd("character");
		var rng = document.selection.createRange();
		if(value && value.length > 0){
			rng.moveStart("character", -value.length);
		}
		rng.text = text;
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
	this.onKeyDown1 = function(ev){
		var sender = this._input;
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
	this.onKeyUp = function(ev){
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
_class("Console", Component, function(_super, _event){
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
		var el = this._createElement2(parent, "div", "ui-console");
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		//<div class="ui-lineedit">&gt;<input class="input" type="text" value="" /></div>
		//this.setFont("12px 宋体");
		/*
		this._lastLine = this._createElement2("div", "ui-lineedit", {
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
			document.addEventListener("keydown", this.__onkeydown, false);
		}else{
			this.addListener(this._self, "keydown", this._lineEdit, "onKeyDown");
		}
		//this._lastLine = this._lineEdit._self;
		this._lineEdit.setIomode("out");
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._interpret = null;
		if(this._lineEdit){
			this._lineEdit.dispose();
			this._lineEdit = null;
		}
		//this._lastLine = null;
		for(var i = 0, len = this._lines.length; i < len; i++){
			this._lines[i] = null;
		}
		this._lines.length = 0;
		this._app = null;
		if(!runtime.ie){
			document.removeEventListener("keydown", this.__onkeydown, false);
		}else{
			this.removeListener(this._self, "keydown");
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
		//var w = document.body.clientWidth - 14 - 100;
		//this._self.style.width = (document.body.clientWidth - 14) + "px";
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
	this.start = function(agent, func){
		var _this = this;
		this.getLineInput(function(text){
			func.call(agent, text);
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
		var line = this._createElement2(this._self, "div", "ui-lineedit");
		this._lines.push(line);
		return line;
	};
	this.insertLine = function(text, refNode, type){
		var line = this._createElement("div");
		line.className = "ui-lineedit";
		if(text){
			//line.innerHTML = runtime.encodeHTML(text);
			var span = this._createElement2(line, "span", type);
			span.appendChild(this._createTextNode(text));
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
/*<file name="alz/mui/Iframe.js">*/
_package("alz.mui");

_import("alz.mui.Component");

_class("Iframe", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._event = runtime.ie ? "onreadystatechange" : "onload";
		this._skipCallback = false;  //标志，忽略回调处理
		this._type = "text";
		this._agent = null;
		this._callback = null;
	};
	this.create = function(parent, name, type, agent, callback){
		this.setParent2(parent);
		this._type = type;
		this._agent = agent;
		this._callback = typeof callback == "function" ? callback : agent[callback];
		obj = this._createElement2(parent, "iframe", "", {
			//"id"   : name,
			//"name" : name,
			"display": "none"
		});
		var firstLoad = true;
		var _this = this;
		obj[this._event] = function(){
			if(runtime.ie && !(this.readyState == "loaded" || this.readyState == "complete")){
				return;
			}
			if(firstLoad){
				firstLoad = false;
				try{  //FF下面报错
					this.contentWindow.name = name;
				}catch(ex){
				}
				if(typeof _this.onLoad == "function"){
					_this.onLoad();
				}
				return;
			}
			_this.onCallback();
		};
		obj.src = "about:blank";
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._callback = null;
		this._agent = null;
		_super.dispose.apply(this);
	};
	this.onCallback = function(){
		if(this._skipCallback){  //如果需要忽略回调
			this._skipCallback = false;
		}else{
			var data;
			switch(this._type){
			case "json":
				try{
					var text = this.getResponseText();
					if(text == ""){
						data = {"result": false, "msg": "服务器内部错误"};
					}else{
						data = runtime.parseJson(text);
						if(data === null){
							data = {
								"result": false,
								"errno" : 0,
								"msg"   : "[Iframe::onCallback]服务端返回的json数据格式有问题" + text,
								"data"  : null
							};
						}
					}
				}catch(ex){
					//根据要求暂时修改提示信息，通过firebug来log错误信息
					window.alert("网络连接失败，请重试！ ");
					if(window.console && console.log){
						cosole.log("通信失败！\n原因：" + runtime.forIn(ex).join("\n"));
					}
					//window.alert("通信失败！\n原因：" + runtime.forIn(ex).join("\n"));
					data = {};
				}
				break;
			case "text":
				data = this.getResponseText();
				break;
			}
			this._callback.call(this._agent, data);
			this._skipCallback = true;  //标志，忽略回调处理
			this._self.contentWindow.location.replace("about:blank");
		}
	};
	this.getDocument = function(){
		return this._self.contentDocument || this._self.contentWindow.document;
	};
	this.getResponseText = function(){
		var text = this.getDocument().body.innerHTML;
		if(runtime.moz){
			text = text.replace(/<br \\=\"\">/g, "<br />");  //FF可能存在需要处理的BR标签
		}
		return text;
	};
});
/*</file>*/
/*<file name="alz/mui/CodeEditor.js">*/
_package("alz.mui");

_import("alz.mui.Component");
//CodeMirror
//MirrorFrame

/**
 * 代码编辑器
 */
_class("CodeEditor", Component, function(_super, _event){
	this._eid = 0;
	this._editors = {};
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._editor = null;
	};
	this.build = function(el){
		_super.build.apply(this, arguments);
		this.bind(this._self, "");
	};
	this.bind = function(obj, code){
		var _this = this;
		var path = runtime.getConfigData("pathlib");
		//this._editor = new MirrorFrame(CodeMirror.replace(obj), {
		this._editor = CodeMirror.fromTextArea(obj, {
			"height"    : "450px",
			"content"   : code,
			"path"      : path + "codemirror/js/",
			"parserfile": ["tokenizejavascript.js", "parsejavascript.js"],
			"stylesheet": path + "codemirror/css/jscolors.css",
			"autoMatchParens": true,
			// add Zen Coding support
			"syntax": "html",
			"onLoad": function(editor){
				editor.win.document.addEventListener("mousedown", function(ev){
					runtime.eventHandle(ev);
				}, false);
				zen_editor.bind(editor);
				//editor.setCode(win._params.code);
				_this._app.loadFile(editor);
			}
		});
		this._editor.wrapping.className = "ui-codeeditor";
		this._editor._eid = this._eid++;
		this._editors[this._editor._eid] = this._editor;
		this.init(this._editor.wrapping);
	};
	this.dispose = function(){
		//this._editor.win.document.removeEventListener("mousedown", xxx);
		delete this._editors[this._editor._eid];
		this._editor = null;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.setCode = function(v){
		this._editor.setCode(v);
	};
	this.setApp = function(v){
		this._app = v;
	};
});
/*</file>*/
/*<file name="alz/mui/ToolButton.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 工具栏按钮
 */
_class("ToolButton", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._label = null;
	};
	this.create = function(parent, data){
		this.setParent2(parent);
		this.setData(data);
		var el = this._createElement2(parent, "li", "ui-toolbutton");
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		this._self.title = this._data.title;
		this._self.setAttribute("_action", this._data.action);
		this._label = this._createElement2(this, "label", "", {
			"backgroundPosition": (-this._data.id * 16) + "px 0px"
		});
	};
	this.dispose = function(){
		this._label = null;
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/mui/BitButton.js">*/
_package("alz.mui");

_import("alz.mui.ToolButton");

/**
 * 带图标的按钮组件
 */
_class("BitButton", ToolButton, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._icon = "";
		this._disabled = false;
		this._app = null;
	};
	this.bind = function(obj, app){
		this._app = app;
		this.init(obj);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		//this._label = this._self.childNodes[1];
		this.setDisabled(this._self.getAttribute("_disabled") == "true");
		this._icon = this._self.getAttribute("_icon") || "";
		if(this._icon != ""){
			this._self.style.background = "url(" + this._self.getAttribute("_icon") + ") 2px 2px no-repeat";
		}
		this._tip = this._self.getAttribute("_tip") || "";
		if(this._tip != ""){
			this._self.title = this._tip;
		}
		this.addListener(this._self, "mouseover", this, "onMouseOver");
		this.addListener(this._self, "mouseout", this, "onMouseOut");
		this.addListener(this._self, "mousedown", this, "onMouseDown");
		this.addListener(this._self, "mouseup", this, "onMouseUp");
		//this.addListener(this._self, "click", this, "onClick");
	};
	this.dispose = function(){
		if(this._disposed) return;
		this.removeListener(this._self, "mouseover", this, "onMouseOver");
		this.removeListener(this._self, "mouseout", this, "onMouseOut");
		this.removeListener(this._self, "mousedown", this, "onMouseDown");
		this.removeListener(this._self, "mouseup", this, "onMouseUp");
		//this.removeListener(this._self, "click", this, "onClick");
		this._app = null;
		this._label = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setDisabled = function(v){
		_super.setDisabled.apply(this, arguments);
		this.setEnableEvent(!v);
		if(this._self){
			this._self.style.filter = v ? "gray" : "";
			this._label.disabled = v;
		}
	};
	this.onMouseOver = function(ev){
		runtime.dom.addClass(this._self, "hover");
		/*
		this._self.style.borderLeft = "1px solid buttonhighlight";
		this._self.style.borderTop = "1px solid buttonhighlight";
		this._self.style.borderRight = "1px solid buttonshadow";
		this._self.style.borderBottom = "1px solid buttonshadow";
		*/
	};
	this.onMouseOut = function(ev){
		var target = ev.target || ev.toElement;
		if(!runtime.dom.contains(this._self, target)){
			runtime.dom.removeClass(this._self, "hover");
			runtime.dom.removeClass(this._self, "active");
			//this._self.style.border = "1px solid buttonface";
		}
	};
	this.onMouseDown = function(ev){
		runtime.dom.addClass(this._self, "active");
		/*
		this._self.style.borderLeft = "1px solid buttonshadow";
		this._self.style.borderTop = "1px solid buttonshadow";
		this._self.style.borderRight = "1px solid buttonhighlight";
		this._self.style.borderBottom = "1px solid buttonhighlight";
		*/
		var sender = ev.target || ev.srcElement;
		//this._app.doAction(sender.getAttribute("_action"), sender);
	};
	this.onMouseUp = function(ev){
		runtime.dom.replaceClass(this._self, "active", "hover");
		/*
		this._self.style.borderLeft = "1px solid buttonhighlight";
		this._self.style.borderTop = "1px solid buttonhighlight";
		this._self.style.borderRight = "1px solid buttonshadow";
		this._self.style.borderBottom = "1px solid buttonshadow";
		*/
	};
	/*
	this.onClick = function(ev){
		var sender = ev.target || ev.srcElement;
		this._app.doAction(sender.getAttribute("_action"), sender);
	};
	*/
});
/*</file>*/
/*<file name="alz/mui/ToggleButton.js">*/
_package("alz.mui");

_import("alz.mui.BitButton");

/**
 * 工具栏按钮
 */
_class("ToggleButton", BitButton, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._groupId = "";
		this._toggled = false;
	};
	this.create = function(parent, data){
		this.setParent2(parent);
		this.setData(data);
		var el = this._createElement2(parent, "li", "ui-toolbutton");
		this.init(el);
		return el;
	};
	this.bind = function(el, app){
		this.init(el);
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		var data = {
			"groupid": this._self.getAttribute("_groupid"),
			"toggled": this._self.getAttribute("_toggled") == "true",
		};
		if(data.groupid){
			this._groupId = data.groupid;
		}
		//if(!this._groupId) throw "ToggleButton 组件缺少 _groupid 属性";
		this.addListener(this._self, "mouseover", this, "onMouseOver");
		this.addListener(this._self, "mouseout", this, "onMouseOut");
		this.addListener(this._self, "click", this, "onClick");
		runtime.toggleMgr.add(this);
		if(data.toggled){
			runtime.toggleMgr.toggle(this);
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		this.removeListener(this._self, "mouseover");
		this.removeListener(this._self, "mouseout");
		this.removeListener(this._self, "click");
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getGroupId = function(){
		return this._groupId;
	};
	this.setToggled = function(v){
		if(this._toggled == v) return;
		this._toggled = v;
		if(v){
			runtime.dom.addClass(this._self, "active");
			/*
			this._self.style.borderLeft = "1px solid buttonshadow";
			this._self.style.borderTop = "1px solid buttonshadow";
			this._self.style.borderRight = "1px solid buttonhighlight";
			this._self.style.borderBottom = "1px solid buttonhighlight";
			*/
			//this._app.doAction(this._self.getAttribute("_action"));
		}else{
			runtime.dom.removeClass(this._self, "active");
			runtime.dom.removeClass(this._self, "hover");
			//this._self.style.border = "1px solid buttonface";
		}
	};
	this.onMouseOver = function(ev){
		if(this._toggled) return;
		runtime.dom.addClass(this._self, "hover");
		/*
		this._self.style.borderLeft = "1px solid buttonhighlight";
		this._self.style.borderTop = "1px solid buttonhighlight";
		this._self.style.borderRight = "1px solid buttonshadow";
		this._self.style.borderBottom = "1px solid buttonshadow";
		*/
	};
	this.onMouseOut = function(ev){
		if(this._toggled) return;
		var target = ev.target || ev.toElement;
		//if(!runtime.dom.contains(this._self, target)){
			runtime.dom.removeClass(this._self, "active");
			runtime.dom.removeClass(this._self, "hover");
			//this._self.style.border = "1px solid buttonface";
		//}
	};
	this.onClick = function(ev){
		runtime.toggleMgr.toggle(this);
	};
});
/*</file>*/
/*<file name="alz/mui/ToolBar.js">*/
_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.ToolButton");
_import("alz.mui.BitButton");
_import("alz.mui.ToggleButton");

/**
 * 工具栏组件
 */
_class("ToolBar", Component, function(_super, _event){
	var HASH = {
		"ui-toolbutton"  : ToolButton,
		"ui-bitbutton"   : BitButton,
		"ui-togglebutton": ToggleButton
	};
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._buttons = [];
	};
	this.bind = function(obj, parent, app, data, hash){
		this.setParent2(parent);
		this._app = app;
		this.init(obj);
		if(data){
			this.createButtons(data, hash);
		}
	};
	this.init = function(obj, app){
		_super.init.apply(this, arguments);
		//var nodes = this._self.childNodes;
		var nodes = obj.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			if(node.nodeType != 1) continue;
			if(node.className in HASH){
				var clazz = HASH[node.className];
				var btn = new clazz();
				btn.bind(node, this._app);  //[TO-DO]改用bind实现
				this._buttons.push(btn);
			}
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._buttons.length; i < len; i++){
			this._buttons[i].dispose();
			this._buttons[i] = null;
		}
		this._buttons.length = 0;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setApp = function(v){
		this._app = v;
	};
	this.createButtons = function(data, hash){
		for(var i = 0, len = data.length; i < len; i++){
			var k = data[i];
			var t = k.charAt(0);
			switch(t){
			case "-":
				this._createElement2(this, "li", "sep");
				break;
			case "#":
				k = k.substr(1);
				var btn = new ToggleButton();
				btn.create(this, hash[k]);
				this._buttons.push(btn);
				runtime.toggleMgr.add(btn);
				break;
			default:
				var btn = new ToolButton();
				btn.create(this, hash[k]);
				this._buttons.push(btn);
				break;
			}
		}
	};
});
/*</file>*/
/*<file name="alz/mui/MenuItem.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 菜单项
 */
_class("MenuItem", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.build = function(el){
		_super.build.apply(this, arguments);
		//[TODO]使用文本类型模板更新TextNode
		var attributes = el._attributes;
		var sb = [];
		if(attributes.text){
			sb.push(attributes.text);
		}
		if(attributes.key){
			sb.push("(<u>" + attributes.key + "</u>)");
		}
		if(attributes.more){
			sb.push(attributes.more);
		}
		console.log(sb.join(""));
		this._self.childNodes[0].innerHTML = sb.join("");
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/mui/MenuButton.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 菜单栏按钮
 */
_class("MenuButton", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/mui/MenuBar.js">*/
_package("alz.mui");

_import("alz.mui.ListBox");

/**
 * 菜单栏
 */
_class("MenuBar", ListBox, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._activeItem1 = null;
	};
	this.bind = function(obj){
		this.init(obj);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		this._activeItem1 = null;
		_super.dispose.apply(this);
	};
	this.activeItem = function(v){
		if(this._activeItem1 === v) return;
		if(this._activeItem1){
			runtime.dom.removeClass(this._activeItem1._self, "active");
		}
		runtime.dom.addClass(v._self, "active");
		v._actionManager.dispatchAction(v._action, v._self);
		this._activeItem1 = v;
	};
});
/*</file>*/
/*<file name="alz/mui/ModalPanel.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 模态对话框使用的遮挡面板组件
 */
_class("ModalPanel", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._targetList = [];
		this._activeTarget = null;
		this._iframe = null;  //用来遮挡SELECT等DIV遮挡不住的组件
		this._panel = null;   //再用这个DIV遮挡在IFRAME上面
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._self.className = "ui-modalpanel";
		this.moveTo(0, 0);
		this.setOpacity(0.01);
		if(runtime.ie){
			this._iframe = this._createElement2(this._self, "iframe", "", {
				"scrolling": "no",
				"frameBorder": "0",
				"frameSpacing": "0",
				//"allowTransparency": "true",
				"src": "about:blank",
				"display": "none",
				"position": "absolute",
				"width": "100%",
				"height": "100%"
			});
		}
		this._panel = this._createElement2(this._self, "div", "", {
			"display": "none",
			"position": "absolute",
			"left": "0px",
			"top": "0px"
		});
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._panel = null;
		this._iframe = null;
		this._activeTarget = null;
		for(var i = 0, len = this._targetList.length; i < len; i++){
			this._targetList[i] = null;
		}
		this._targetList.length = 0;
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
		if(this._activeTarget.moveToCenter){
			this._activeTarget.moveToCenter();
		}
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
_class("Container", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._nodes = [];
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i].dispose();
			this._nodes[i] = null;
		}
		this._nodes.length = 0;
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
			var el = nodes[i];
			switch(el.getAlign()){
			case "top":
				el.moveTo(rect.x, rect.y);
				el.resize(rect.w, el._dockRect.h);
				rect.y += el._dockRect.h;
				rect.h -= el._dockRect.h;
				break;
			}
		}
		//调整下停靠的组件
		for(var i = nodes.length - 1; i >= 0; i--){
			var el = nodes[i];
			switch(el.getAlign()){
			case "bottom":
				el.moveTo(rect.x, rect.y + rect.h - el._dockRect.h);
				el.resize(rect.w, el._dockRect.h);
				rect.h -= el._dockRect.h;
				break;
			}
		}
		//调整左停靠的组件
		for(var i = 0, len = nodes.length; i < len; i++){
			var el = nodes[i];
			switch(el.getAlign()){
			case "left":
				el.moveTo(rect.x, rect.y);
				el.resize(el._dockRect.w, rect.h);  //"100%"
				rect.x += el._dockRect.w;
				rect.w -= el._dockRect.w;
				break;
			}
		}
		//调整右停靠的组件
		for(var i = nodes.length - 1; i >= 0; i--){
			var el = nodes[i];
			switch(el.getAlign()){
			case "right":
				el.moveTo(rect.x + rect.w - el._dockRect.w, rect.y);
				el.resize(el._dockRect.w, rect.h);  //"100%"
				rect.w -= el._dockRect.w;
				break;
			}
		}
		//调整居中停靠的组件
		for(var i = 0, len = nodes.length; i < len; i++){
			var el = nodes[i];
			switch(el.getAlign()){
			case "client":
				//最后调整align == "client"的组件的大小
				el.moveTo(rect.x, rect.y);
				el.resize(rect.w, rect.h);
				break;
			}
		}
	};
});
/*</file>*/
/*<file name="alz/mui/Panel.js">*/
_package("alz.mui");

_import("alz.mui.Container");

/**
 * 面板组件，支持布局自适应特性的面板
 */
_class("Panel", Container, function(_super, _event){
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
_import("alz.mui.IAction");

/**
 * 可独立工作的面板组件
 */
_class("Pane", Container, function(_super, _event){
	_implements(this, IAction);
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._params = null;  //参数
		this._pid = "";       //pageid
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getApp = function(){
		return this._app;
	};
	this.setApp = function(v){
		this._app = v;
	};
	this.setParams = function(v){
		this._params = v;
	};
	this.getPid = function(){
		return this._pid;
	};
	this.setPid = function(v){
		this._pid = v;
	};
	/**
	 * 通过模板名创建一组DOM元素
	 * @param {Element} parent 父元素
	 * @param {String} tpl 模板名
	 * @return {Element}
	 */
	this.createTplElement = function(parent, tpl, app){
		app = app || this._app;
		var tag;
		var str = app.getTplData(tpl);
		str.replace(/^<([a-z0-9]+)[ >]/, function(_0, _1){
			tag = _1;
		});
		var conf = app._taglib.getTagConf(tag);
		if(conf){
			if(parent.getContainer){
				parent = parent.getContainer();
			}
			var tpldoc = app.getTplDoc();
			tpldoc.push(parent);  //设置当前父节点
			var rootNode = app._template.createXMLDocument(str).documentElement;
			var tplEl = tpldoc.createTplElement(conf, rootNode);
			tpldoc.pop();
			return tplEl._self;
		}else{
			return this.createDomElement(parent, str/*, ".module"*/);
		}
	};
});
/*</file>*/
/*<file name="alz/mui/DeckPane.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 层叠面板管理组件(N个Pane组件层叠)
 */
_class("DeckPane", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._conf = {};  //Pane类配置信息
		this._hash = {};
		this._activePane = null;  //当前活动的Pane页
	};
	this.bind = function(obj, app){
		this._app = app;
		this.init(obj);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activePane = null;
		for(var k in this._hash){
			this._hash[k].dispose();
			delete this._hash[k];
		}
		this._app = null;
		_super.dispose.apply(this);
	};
	this.exist = function(key){
		return key in this._hash;
	};
	this.getPane = function(key){
		return this._hash[key];
	};
	/**
	 * 基于延迟创建的考虑
	 */
	this.getPane2 = function(key, params){
		var pane;
		if(!this.exist(key)){
			pane = this.createPane(null, key, params);
		}else{
			pane = this.getPane(key);
			pane.setParams(params);
		}
		return pane;
	};
	this.createPane = function(parent, key, params/*, html*/){
		parent = parent || this;  //runtime.getWorkspace()
		var k = key.split("#")[0];
		var conf = this._app.findConf("pane", k);
		var pane = new conf.clazz();
		pane.setPid(k);
		pane.setData(conf);
		pane.setParams(params);
		if(parent instanceof Pane){
			pane.setParentPane(parent);
		}
		pane.create(parent, this._app, conf.tpl);
		//this.pushItem1(key, pane);
		this._hash[key] = pane;
		return pane;
	};
	this.navPane = function(pid, params){
		params = params || {};
		var pane = this.getPane2(pid, params);
		if(this._activePane == pane){
			pane.setVisible(true);
			pane.reset(params);
			return;
		}
		if(this._activePane){
			this._activePane.setVisible(false);
		}
		pane.setVisible(true);
		pane.reset(params);
		this._activePane = pane;
	};
});
/*</file>*/
/*<file name="alz/mui/Workspace.js">*/
_package("alz.mui");

_import("alz.mui.Container");
_import("alz.mui.ModalPanel");

/**
 * 工作区组件
 */
_class("Workspace", Container, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._fixedX = 0;
		this._fixedY = 0;
		this._fixedOff = null;
		this._fixed = null;
		this._testFixDiv = null;
		this._modalPanel = null;
		this._captureComponent = null;
		this._tipMouse = null;
		this._activePopup = null;
		this._activeDialog = null;
		this._types = {
			"workspace" : {},
			"window"    : {},
			"dialog"    : {},
			"pane"      : {},
			"button"    : {},
			"checkbox"  : {},
			"radio"     : {},
			"combobox"  : {},
			"richeditor": {},
			"codeeditor": {},
			"icon"      : {},
			"popup"     : {},
			"popmenu"   : {},
			"rebar"     : {},
			"menubar"   : {},
			"toolbar"   : {},
			"statusbar" : {},
			"menu"      : {},
			"menuitem"  : {},
			"panel"     : {},
			"toolbutton": {}
		};
	};
	this.create = function(parent){
		this.setParent2(parent);
		var el = this._createElement2(parent, "div", "ui-workspace wui-PaneApp");
		this.init(el);
		return el;
	};
	this.__init = function(el, domBuildType){
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
	this.init = function(el){
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
		this._activePopup = null;
		this._tipMouse = null;
		this._captureComponent = null;
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
		if(!this._inited) return;  //[TODO]
		_super.resize.call(this, w, h);
		if(this._modalPanel && this._modalPanel.getVisible()){
			this._modalPanel.resize(w, h);  //调整模态面板的大小
		}
	};
	this.getModalPanel = function(){
		return this._modalPanel;
	};
	this.setActiveDialog = function(v){
		this._activeDialog = v;
	};
	this.setActivePopup = function(v){
		if(this._activePopup === v) return;
		if(this._activePopup){
			//[TODO]还原蒙板
			runtime.dom.removeClass(this._activePopup.getOwner(), "active");
			this._activePopup.setVisible(false);
			//this._activePopup.setZIndex(1);
		}
		if(v){
			v.setZIndex(10);
			runtime.dom.addClass(v.getOwner(), "active");
			v.setVisible(true);
		}
		this._activePopup = v;
	};
	this.setCaptureComponent = function(v){
		this._captureComponent = v;
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
		if(this._activePopup){
			switch(this._activePopup._className){
			case "alz.mui.Popup":
			case "alz.mui.PopupMenu":
				var target = ev.target || ev.srcElement;
				if(this._activePopup._self == target || this._activePopup._self.contains(target)){
					//交给组件自己处理
				}else if(this._activePopup.getVisible()){
					this.setActivePopup(null);
				}
				if(ev.stopPropagation){
					ev.stopPropagation();
				}else{
					ev.cancelBubble = true;
				}
				return false;
			case "alz.mui.Dialog":
				break;
			}
		}
	};
	this.onMouseMove = null;
	this.onMouseUp = function(ev){
	};
	/*
	 * 偏移量的修正依赖于 getPos 方法的正确性，如果本身计算就不正确，修正结果也将不对
	 * [TODO]在第一次onMouseMove事件中执行修正偏移量的计算
	 */
	/*
	this._mousemoveForFixed = function(ev){
		var el = runtime._testDiv;
		var pos = this._dom.getPos(el, this._self);
		if(this._fixed == null){
			//window.alert((pos.x + ev.offsetX) + "," + (pos.y + ev.offsetY) + "|" + ev.clientX + "," + ev.clientY);
			this._offsetX = ev.offsetX;
			this._offsetY = ev.offsetY;
			this._fixedOff = {"x": pos.x + ev.offsetX, "y": pos.y + ev.offsetY};
			this._fixed = "fixing";
			//this.onMouseMove(ev);
			var rect = this.getViewPort();
			var x = rect.x + Math.min(rect.w - this._paddingLeft, Math.max(0, ev.clientX - this._borderLeftWidth)) - this._fixedX - this._offsetX - this._paddingLeft;
			var y = rect.y + Math.min(rect.h - this._paddingTop, Math.max(0, ev.clientY - this._borderTopWidth)) - this._fixedY - this._offsetY - this._paddingTop;
			el.style.left = (-2000 + x) + "px";
			el.style.top = (-2000 + y) + "px";
			this._mousemoveForFixed(ev);
		}else if(this._fixed == "fixing"){
			//this._fixedOff = {"x": ev.clientX, "y": ev.clientY};
			this._fixedX = pos.x + ev.offsetX - this._fixedOff.x;
			this._fixedY = pos.y + ev.offsetY - this._fixedOff.y;
			//window.alert("&&&&" + this._fixedX + "," + this._fixedY);
			this._fixed = "fixed";
			this.onMouseMove = this._mousemoveForNormal;  //转换成正常的事件
		}else{  //fixed
			ev.cancelBubble = true;
		}
	};
	*/
	this._mousemoveForFixed = function(dlg, ev){
		var el = ev.srcElement;
		var pos = dlg._dom.getPos(el, this._self);
		if(this._fixed == null){
			//window.alert((pos.x + ev.offsetX) + "," + (pos.y + ev.offsetY) + "|" + ev.clientX + "," + ev.clientY);
			this._fixedOff = {
				"pos_x"     : pos.x,
				"pos_y"     : pos.y,
				"o"         : ev.srcElement,
				"ev_offsetX": ev.offsetX,
				"ev_offsetY": ev.offsetY,
				"x"         : pos.x + ev.offsetX,
				"y"         : pos.y + ev.offsetY
			};
			this._fixed = "fixing";
			dlg.onMouseMove(ev);
		}else if(this._fixed == "fixing"){
			if(ev.srcElement != this._fixedOff.o || ev.offsetX != this._fixedOff.ev_offsetX || ev.offsetY != this._fixedOff.ev_offsetY){
				console.warn("[Workspace::_mousemoveForFixed]fixing unexpect");
			}
			this._fixedX = pos.x - this._fixedOff.pos_x;  //pos.x + ev.offsetX - (this._fixedOff.pos_x + this._fixedOff.ev_offsetX)
			this._fixedY = pos.y - this._fixedOff.pos_y;  //pos.y + ev.offsetY - (this._fixedOff.pos_y + this._fixedOff.ev_offsetY)
			//document.title = this._fixedX + "," + this._fixedY + "|" + dlg._borderLeftWidth + "," + dlg._borderTopWidth;
			this._fixed = "fixed";
			dlg.onMouseMove(ev);
			this._mousemoveForFixed = null;
		}
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
			var off = {"x": 0, "y": 0};
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
		if(this._activePopup){
			var target = ev.target || ev.srcElement;
			var bar = this._activePopup.getOwner().parentNode;
			if(bar.className == "ui-menubar" && bar.contains(target)){
				var item = this.getMenuItem(bar, target);
				if(item && item._ptr){
					bar._ptr.activeItem(item._ptr);
				}
			}
		}
	};
	this.getMenuItem = function(bar, obj){
		var el = obj;
		for(; el && el.parentNode != bar; el = el.parentNode){
		}
		return el;
	};
});
/*</file>*/
/*<file name="alz/mui/DropDown.js">*/
_package("alz.mui");

_import("alz.mui.Component");

_class("DropDown", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._menu = null;
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
		this.removeListener(this._self, "mousedown");
		this._self.onclick = null;
		if(this._menu){
			this._menu.dispose();
			this._menu = null;
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this._bindDrop = function(){
		if(!this._menu){
			var id = this._dropid;  //this._self.getAttribute("dropid")
			if(!id) runtime.getWindow()._alert("组件DropDown缺少属性dropid");
			this._menu = runtime.initComponent(runtime._workspace, id);
			if(!this._menu) throw "未找到DropDown组件的下拉列表[Popup,id=\"" + id + "\"]";
			this._menu.setVisible(false);
			this.addListener(this._self, "mousedown", this, "onMouseDown");
			this._self.onclick = function(ev){return false;};
			this._menu._self.onmousedown = function(ev){
				ev = ev || this._ptr._win.event;
				window.alert((ev.srcElement || ev.target).innerHTML);
			};
		}
	};
	this.onMouseDown = function(ev){
		if(this._menu.getVisible()){
			runtime._workspace.setActivePopup(null);
		}else{
			this._menu.setWidth(Math.max(this.getWidth(), this._menu.getWidth()));
			runtime._workspace.setActivePopup(this._menu);
			var pos = this.getPosition(ev, 0);
			this._menu.moveTo(pos.x, pos.y + this.getHeight());
		}
		ev.cancelBubble = true;
		return false;
	};
});
/*</file>*/
/*<file name="alz/mui/Popup.js">*/
_package("alz.mui");

_import("alz.mui.Pane");

/**
 * 弹出式组件
 */
_class("Popup", Pane, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._conf = null;
		this._app = null;
		this._params = null;
		this._owner = null;  //所有者(必须是一个UI组件)
		this._req = null;
	};
	this.create2 = function(conf, parent, app, params, owner){
		this.setConf(conf);
		this.setParent2(parent);
		this.setApp(app);
		this.setParams(params);
		this.setOwner(owner);
	};
	this.create = function(parent, app, owner, params, tpl){
		this.setParent2(parent);
		this.setApp(app);
		this.setOwner(owner);
		this.setParams(params);
		var el = this.createTplElement(parent, tpl);
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		/*
		this._self.onmousedown = function(ev){
			ev = ev || this._ptr._win.event;
			ev.cancelBubble = true;
			return false;
		};
		*/
	};
	this.reset = function(params){
		this._params = params;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._req = null;
		this._owner = null;
		this._params = null;
		this._app = null;
		//this._self.onmousedown = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setConf = function(v){
		this._conf = v;
	};
	this.setApp = function(v){
		this._app = v;
	};
	this.getOwner = function(){
		return this._owner;
	};
	this.setOwner = function(v){
		this._owner = v;
	};
	this.setParams = function(v){
		this._params = v;
	};
	this.setReq = function(v){
		this._req = v;
	};
	this.setVisible = function(v){
		_super.setVisible.apply(this, arguments);
		//this._regOnFrame(window.top, "mousedown", !v);  //[TODO]对跨域iframe的处理还不到位
	};
	this._isOutterElement = function(el){
		var doc = el.ownerDocument;
		var win = doc.parentWindow || doc.defaultView;
		return !(win == this._win && runtime.dom.contains(this._self, el));
	};
	this._onDocumentClick = function(ev){
		var target = ev.target || ev.srcElement;
		if(this._isOutterElement(target)){
			runtime.addThread(0, this, runtime.closure(this, "setVisible", false));
		}
	};
	/**
	 * 在指定窗体和所有子窗体中注册/销毁事件侦听器
	 * [TODO]存在跨域问题
	 */
	this._regOnFrame = function(frame, type, isRemove){
		try{
			runtime.dom[(isRemove ? "remove" : "add") + "EventListener"](frame.document, type, this._onDocumentClick, this);
			//RQFM-5643 当邮件正在打开过程中，点击"更多功能"，弹出JS错误
			var frames = frame.frames;
			for(var i = 0, len = frames.length; i < len; i++){
				this._regOnFrame(frames[i], type, isRemove);
			}
		}catch(ex){
		}
	};
	/**
	 * @method getPosition
	 * @return {Object}
	 * @desc   获得事件的全局坐标位置
	 */
	this.getPosition = function(sender){
		var pos = {"x": 0, "y": 0};
		var refElement = runtime._workspace._self;
		var el = sender;
		while(el && el != refElement){
			pos.x += el.offsetLeft;
			pos.y += el.offsetTop;
			el = el.offsetParent;
		}
		return pos;
	};
	this.getPos = function(el, refObj){
		var pos = {"x": 0, "y": 0};
		var dom = runtime.dom;
		for(var o = el; o && o != refObj; o = o.offsetParent){
			var bl, bt, x, y;
			if(o != el){
				bl = dom.getStyleProperty(o, "borderLeftWidth");
				bt = dom.getStyleProperty(o, "borderTopWidth");
				x = isNaN(bl) ? 0 : bl;
				y = isNaN(bt) ? 0 : bt;
				bl = dom.getStyleProperty(o, "paddingLeftWidth");
				bt = dom.getStyleProperty(o, "paddingTopWidth");
				x += isNaN(bl) ? 0 : bl;
				y += isNaN(bt) ? 0 : bt;
			}
			pos.x += o.offsetLeft + (o != el ? x : 0);
			pos.y += o.offsetTop + (o != el ? y : 0);
		}
		return pos;
	};
	this.show = function(){
		runtime._workspace.setActivePopup(this);
		var pos = this.getPos(this._owner);
		this.moveTo(pos.x, pos.y + this._owner.offsetHeight);
	};
	this.hide = function(){
		runtime._workspace.setActivePopup(null);
	};
	this.callback = function(){
		var args = [this];  //回调函数的第一个参数一定是对话框组件本身
		for(var i = 0, len = arguments.length; i < len; i++){
			args.push(arguments[i]);
		}
		if(this._req){
			this._req.func.apply(this._req.agent, args);
			this._req = null;  //只允许被调用一次
		}
	};
	this.doAction = function(act, sender){
		this.hide();
		this.callback(act, sender);
		return false;
	};
});
/*</file>*/
/*<file name="alz/mui/Menu.js">*/
_package("alz.mui");

_import("alz.mui.Popup");

/**
 * 菜单组件
 */
_class("Menu", Popup, function(_super, _event){
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
});
/*</file>*/
/*<file name="alz/mui/PopupMenu.js">*/
_package("alz.mui");

_import("alz.mui.Popup");

/**
 * 弹出式菜单
 */
_class("PopupMenu", Popup, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this.setVisible(false);
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/mui/TableView.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 表视图组件
 */
_class("TableView", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.create = function(parent){
		var sb = [];
		sb.push('<table class="ui-table" border="1" bordercolor="gray" cellspacing="0" cellpadding="1">');
		sb.push('<thead>');
		sb.push('<tr><th>id</th><th>name</th><th>value</th><th>col3</th><th>col4</th><th>col5</th><th>col6</th><th>col7</th><th>col8</th><th>col9</th><th>col10</th></tr>');
		sb.push('</thead>');
		sb.push('<tbody>');
		for(var i = 0, len = 100; i < len; i++){
			sb.push('<tr><td>' + i + '</td><td>name' + i + '</td><td>value' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td></tr>');
		}
		sb.push('</tbody>');
		sb.push('</table>');
		var tpl = sb.join("");
		var el = runtime.dom.createDomElement(tpl, parent._self);
		//parent.appendChild(el);
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
});
/*</file>*/
/*<file name="alz/util/FileType.js">*/
_package("alz.util");

/**
 * 文件类型
 */
_class("FileType", "", function(_super, _event){
	var _mapIcon = {
		"jsc"      :{index: 0,isDir:1},
		"js"       :{index: 1,isDir:1},
		"json"     :{index: 2,isDir:1},
		"htm"      :{index: 3,isDir:1}, "html":{index: 3,isDir:1},
		"tpl"      :{index: 4,isDir:1},
		"tmpl"     :{index: 5,isDir:1}, "xml":{index: 5,isDir:1},
		"jpg"      :{index: 6,isDir:1},
		"gif"      :{index: 7,isDir:1},
		"jpg1"     :{index: 8,isDir:1},
		"gif1"     :{index: 9,isDir:1},
		"css"      :{index:10,isDir:1}, "ini":{index:10,isDir:1},
		"close"    :{index:11,isDir:1},
		"open"     :{index:12,isDir:1},
		"event"    :{index:13,isDir:0},
		"enum"     :{index:14,isDir:1},
		"const"    :{index:15,isDir:1},
		"class"    :{index:16,isDir:0},
		"property" :{index:17,isDir:0},
		"package"  :{index:18,isDir:1},
		"module"   :{index:19,isDir:1},
		"interface":{index:20,isDir:1},
		"function" :{index:21,isDir:0},
		"txt"      :{index:22,isDir:0},
		"reg"      :{index:23,isDir:0},
		"hta"      :{index:24,isDir:0}, "exe":{index:24,isDir:0},
		"unknown"  :{index:25,isDir:0},
		"asp"      :{index:26,isDir:0},
		"jar"      :{index:27,isDir:0},
		"bat"      :{index:28,isDir:0},
		"swf"      :{index:29,isDir:0},
		"zip"      :{index:30,isDir:0},"tar":{index:30,isDir:0},"gz":{index:30,isDir:0},"xpi":{index:30,isDir:0},"gz":{index:30,isDir:0},"gadget":{index:30,isDir:0},
		"php"      :{index:31,isDir:0},
		"url"      :{index:32,isDir:0},
		"site"     :{index:33,isDir:0}
	};
	FileType.getIconIndex = function(type){
		return type in _mapIcon ? _mapIcon[type].index : 25;  //18,16
	};
	this._init = function(){
	};
});
/*</file>*/
/*<file name="alz/mui/Label.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * TreeView中使用的标签组件
 */
_class("Label", Component, function(_super, _event){
	var _css = {
		"normal"  : {"color":"#000000","border":"1px solid #EEEEEE" ,"background-color":""       ,"text-decoration":"none"     },
		"over"    : {"color":"#0000FF","border":"1px solid #EEEEEE" ,"background-color":"#FFF5CC","text-decoration":"underline"},
		"dragover": {"color":"#FFFFFF","border":"1px solid #0A246A" ,"background-color":"#0A246A","text-decoration":"none"     },
		"active"  : {"color":"#FFFFFF","border":"1px dotted #F5DB95","background-color":"#0A246A","text-decoration":"none"     }
	};
	this._init = function(){
		_super._init.call(this);
		this._text = "";
	};
	this.create = function(parent, text){
		this.setParent2(parent);
		this._text = text;
		var el = this._createElement("label");
		//var el = this._createElement("a");
		//el.href = "#";
		el.appendChild(this._createTextNode(text));
		this._parent._self.appendChild(el);
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		var _this = this;
		//this._self.ondragstart = function(){return false;};
		this._self.onselectstart = function(){return false;};
		this._self.onmouseover = function(){
			var node = _this._parent;
			if(node._tree.getActiveNode() == node) return;
			if(node._tree._draging && node._data.isDir && node._tree.getActiveNode().getParentNode() != node){
				node._tree._dragOverNode = node;
				this._ptr.applyCssStyle(this, _css, "dragover");
			}else{
				this._ptr.applyCssStyle(this, _css, "over");
			}
		};
		this._self.onmouseout = function(){
			if(_this._parent._tree.getActiveNode() == _this._parent) return;
			this._ptr.applyCssStyle(this, _css, "normal");
		};
		this.setState("normal");
	};
	this.dispose = function(){
		this._self.onmouseout = null;
		this._self.onmouseover = null;
		//this._self.onclick = null;
		//this._self.onmousedown = null;
		//this._self.onmouseup = null;
		this._self.onselectstart = null;
		//this._self.ondragstart = null;
	};
	this.getText = function(){
		return this._text;
	};
	this.setText = function(v){
		this._text = v;
		this._self.innerHTML = v;
	};
	this.setState = function(v){
		this.applyCssStyle(this._self, _css, v);
	};
	this.handleEvent = function(ev, target){
		var ret = false;
		var tree = this._parent._tree;
		switch(ev.type){
		case "mousemove":
			this.applyCssStyle(this._self, _css, "normal");
			if(!tree.getReadonly()){
				//tree.startDraging(this._parent);
				tree.startDrag(ev, target, this._parent);
			}
			break;
		case "mousedown":
			tree._self.onmousemove = function(ev){  //准备响应拖拽动作
				return this._ptr.eventHandle(ev || window.event);
			};
			if(!tree.getReadonly() && tree.getActiveNode() == this._parent){
				this._prepareEdit = true;  //准备进入编辑状态
			}else{
				tree.setActiveNode(this._parent);
			}
			break;
		case "mouseup":
			tree._self.onmousemove = null;
			if(tree._draging){
				this.applyCssStyle(this._self, _css, "active");
				if(tree._dragOverNode){
					this.applyCssStyle(tree._dragOverNode._label.getElement(), _css, "over");
				}
				tree.stopDrag();
			}else{
				if(this._prepareEdit && tree.getActiveNode() == this._parent){
					this._prepareEdit = false;
					if(target == tree.getActiveNode()._label.getElement()){
						this._parent.rename();
					}else{
						//runtime.error("[TODO]move node");
					}
				}
			}
			break;
		case "click":
			if(target == this._self && !tree._draging){
				ret = this._parent.openNode();
			}
			break;
		}
		ev.cancelBubble = true;
		return ret;
	};
});
/*</file>*/
/*<file name="alz/mui/TreeNode.js">*/
_package("alz.mui");

_import("alz.util.FileType");
_import("alz.mui.Component");
_import("alz.mui.Label");
_import("alz.mui.TreeView");
_import("alz.core.Ajax");

/**
 * TreeNode 类
 */
_class("TreeNode", Component, function(_super, _event){
	TreeNode.iconCache = {};  //树节点图标缓存
	this._init = function(){
		_super._init.call(this);
		//this._parent = null;   //TreeView组件(父DOM元素)
		this._parentNode = null;  //父TreeNode组件
		this._tree = null;     //所属的 treeView 组件
		this._leaf = false;    //是否叶结点
		this._preIndex = 0;    //
		this._preIcon = null;  //状态图标
		this._icon = null;     //结点图标
		this._label = null;    //文字标签
		this._subTree = null;  //子树
		this._bFirst = true;   //是否第一个结点？
		this._bLast = false;   //是否同级同分之下的兄弟结点中的最后一个结点？
		this._modify = false;  //是否处于编辑状态
	};
	this.create = function(parent, data, bFirst, bLast){
		this.setParent2(parent);
		if(!("isDir" in data)){
			if("nodes" in data && data.nodes.length > 0){
				data["isDir"] = true;
			}
		}
		data.type = data.type || data.name.split(".").pop();
		this._data = data;
		this._leaf = !data.isDir;
		this._bFirst = bFirst;
		this._bLast = bLast;
		var el = this._createElement("li");
		if(parent){
			this._parentNode = parent._parent;
			this._parent._self.appendChild(el);
		}
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		var _this = this;
		if(!("preIcon" in TreeNode.iconCache)){
			TreeNode.useImg = true;
			var obj;
			if(TreeNode.useImg){
				obj = this._createElement("img");
				//obj.src = this._tree._pathSkin + "win2k_tree_add.gif";
				obj.src = this._tree._pathSkin + "win2k_tree_blank.gif";
			}else{
				obj = this._createElement2(null, "span", "icon16"/*, {
					"styleFloat"   : "left",
					"display"      : "block",
					"width"        : "16px",
					"height"       : "16px",
					"verticalAlign": runtime.moz ? "bottom !important" : "middle"
				}*/);
			}
			obj.style.display = "none";
			obj.style.backgroundImage = "url(" + this._tree._pathSkin + "imagelist_treeview.gif)";
			TreeNode.iconCache["preIcon"] = document.body.appendChild(obj);
			if(TreeNode.useImg){
				obj = this._createElement("img");
				obj.src = this._tree._pathSkin + "win2k_tree_blank.gif";  //this._tree._pathSkin + "win2k_" + type + ".gif"
			}else{
				obj = this._createElement2(null, "span", "icon16"/*, {
					"styleFloat"   : "left",
					"display"      : "block",
					"width"        : "16px",
					"height"       : "16px",
					"verticalAlign": runtime.moz ? "bottom !important" : "middle"
				}*/);
			}
			obj.style.marginRight = "3px";
			obj.style.display = "none";
			obj.style.backgroundImage = "url(" + this._tree._pathSkin + "imagelist_build.gif)";
			TreeNode.iconCache["icon"] = document.body.appendChild(obj);
		}

		this._preIcon = TreeNode.iconCache["preIcon"].cloneNode(true);
		this._self.appendChild(this._preIcon);
		this._preIcon.style.display = "";
		var index;
		if(this._bFirst && this._bLast && parent == this._tree){
			index = 2;
		}else if(this._bFirst && parent == this._tree){
			index = 4;
		}else if(this._bLast){
			index = 6;
		}else{
			index = 5;
		}
		this._preIndex = index + (this._leaf ? 9 : 0);
		this._preIcon.style.backgroundPosition = "-" + (this._preIndex * 16) + "px 0px";
		var _this = this;
		this._preIcon.ondragstart = function(){return false;};

		this._icon = TreeNode.iconCache["icon"].cloneNode(true);
		this._self.appendChild(this._icon);
		this._icon.style.display = "";
		this._icon.style.backgroundPosition = "-" + (FileType.getIconIndex(this._data.type) * 16) + "px 0px";
		this._icon.ondragstart = function(){return false;};

		var text = this._data.type == "class" ? this._data.name.replace(/\.js$/, "") : this._data.name;
		this._label = new Label();
		this._label.create(this, text);
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._subTree){
			this._subTree.dispose();
			this._subTree = null;
		}
		this._label.dispose();
		this._label = null;
		this._icon.style.backgroundImage = "none";
		this._icon.onmousedown = null;
		this._icon.ondragstart = null;
		this._icon = null;
		this._preIcon.style.backgroundImage = "none";
		this._preIcon.onclick = null;
		this._preIcon.ondragstart = null;
		this._preIcon = null;
		_super.dispose.apply(this);
	};
	this.setTree = function(v){
		this._tree = v;
	};
	this.createSubTree = function(){
		var subTree = new TreeView();
		subTree.setTree(this._tree);
		subTree.create(this, this._data.nodes);
		if(this._bLast){
			subTree._self.style.backgroundImage = "none";
		}
		return subTree;
	};
	//this.isLeaf = function(){
	//	return this._data.type in _mapIcon ? _mapIcon[this._data.type].isDir == 0 : false;
	//};
	//this.getIconIndex = function(){
	//	return this._tree.getIconIndex(this._data.type);
	//};
	this.handleEvent = function(ev, target){
		switch(ev.type){
		case "mousedown":
			if(target == this._icon){
				this._tree.setActiveNode(this);
				ev.cancelBubble = true;
				//this._tree.startDraging(this);
			}
			break;
		case "mouseup":
			break;
		case "click":
			if(!this._leaf){
				if(target == this._preIcon){
					this.onIconClick();
				}else if(target == this._icon){
					this.openNode();
				}
			}
			break;
		case "dblclick":
			if(target == this._icon){
				this.openNode();
			}
			break;
		}
	};
	this.onIconClick = function(){
		if(!this._leaf){
			if(!this._data.nodes || this._data.nodes.length == 0){
				//this._data.nodes = path2json(this._path, this._data.type);
				//this.onIconClick();
				this._tree.loadData(this, function(json){
					this._data.nodes = json;
					this.onIconClick();
				});
				return;
			}
			if(!this._subTree){
				this._subTree = this.createSubTree();
				this._subTree.setVisible(false);
			}
			this._subTree.setVisible(!this._subTree.getVisible());  //&& this._subTree.childNodes.length > 0
			this._preIndex += this._subTree.getVisible() ? 6 : -6;
			this._preIcon.style.backgroundPosition = "-" + (this._preIndex * 16) + "px 0px";
		}
		return false;
	};
	this.onLabelClick = function(){
		if(this._data._node){
			if(this._tree._activeElement){
				this._tree._activeElement.style.backgroundColor = this._tree.oldBgColor;
			}
			this._tree.oldBgColor = this._data._node.style.backgroundColor;
			this._data._node.style.backgroundColor = "gray";
			this._tree._activeElement = this._data._node;
		}
		return false;
	};
	this.activate = function(){
		this._label.setState("active");
	};
	this.deactivate = function(){
		this._label.setState("normal");
	};
	this.getParentNode = function(){
		//return this._parent._self.parentNode._ptr;
		//return this._parent._parent;
		return this._parentNode;
	};
	this.getText = function(){
		return this._label.getText();
	};
	this.getPath = function(){
		var sb = [];
		for(var node = this; node && node._data; node = node.getParentNode()){  //node._parent._parent
			sb.unshift(node._data.name);
		}
		return "/" + sb.join("/");
	};
	this.rename = function(){
		this._modify = true;
		var input = this._tree.getInput(this._label.getText());
		if(this._label.getElement().nextSibling){
			this._self.insertBefore(input, this._label.getElement().nextSibling);
		}else{
			this._self.appendChild(input);
		}
		runtime.addThread(0, this, function(){
			input.select();
		});
		this._label.setVisible(false);
	};
	this.cancelRename = function(){
		this._label.setVisible(true);
		if(this._tree._input.parentNode != this._self){
			runtime.error(this._tree._input.parentNode.outerHTML);
		}
		this._self.removeChild(this._tree._input);
		this._tree._input.style.display = "none";
		this._modify = false;
	};
	this.doRename = function(name){
		//assert(this._tree._input.value == name);
		if(this.getText() == name){  //如果值发生改变
			this.cancelRename();
		}else{
			//[TODO]需要检查是否和其他文件重名
			//if(this._tree._input && this._tree._input.style.display == "")
			var path = this.getPath();
			//assert(path == this._data.url);
			var params = {
				"act" : "mod",
				"path": path,
				"name": name
			};
			new Ajax().netInvoke("POST", "../data/file.php", params, "json", this, function(json){
				if(json == true){
					this._data.name = name;
					//if(this._data.isDir){
					//	this._data.url = this._data.url.replace(/\/[^\/]+\/?$/, "/" + name + "/");
					//}
					this._label.setText(name);
				}else{
					runtime.error("[ERROR]改名失败");
				}
				this.cancelRename();
			});
		}
	};
	this.openNode = function(){
		if(this._tree._activeNode1 && this._tree._activeNode1._data.isDir){
			this._tree._activeNode1._icon.style.backgroundPosition = "-" + (FileType.getIconIndex("close") * 16) + "px 0px";
		}
		if(this._data.isDir){
			this._icon.style.backgroundPosition = "-" + (FileType.getIconIndex("open") * 16) + "px 0px";
		}
		if(this._tree.onLabelClick){
			return this._tree.onLabelClick(this);
		}
		return this.onLabelClick();
	};
});
/*</file>*/
/*<file name="alz/mui/TreeView.js">*/
_package("alz.mui");

_import("alz.util.FileType");
_import("alz.mui.Component");
_import("alz.mui.TreeNode");

/**
 * TreeView 类
 */
_class("TreeView", Component, function(_super, _event){
	var KEY_TAB       = 9;   //'\t'
	var KEY_ENTER     = 13;  //'\n'
	var KEY_ESC       = 27;
	this._init = function(){
		_super._init.call(this);
		this._pathSkin = "images/";
		this._tree = null;
		this._nodes = [];
		this._activeNode = null;
		this._activeDragNode = null;
		this._input = null;
		this._draging = false;
		this._dragOverNode = null;
		this._captureComponent = null;
		this._activePopup = null;
		this._readonly = true;
	};
	this.create = function(parent, data, w, h){
		this.setParent2(parent);
		if(data) this._data = data;
		var el = this._createElement2(null, "ul", !this._tree ? "ui-treeview" : "", {  //只有最外层的 TreeView 才有该样式
			"display": "none"
		});
		if(w) el.style.width = typeof w == "string" ? w : w + "px";
		if(h) el.style.height = typeof h == "string" ? h : h + "px";
		if(parent){
			if(this._parent._self){
				this._parent._self.appendChild(el);
			}else{
				this._parent.appendChild(el);
			}
		}
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		if(!this._tree){
			this._self.onselectstart = function(){return false;};
			this._self.onmousedown =
			this._self.onmouseup =
			this._self.onclick =
			this._self.ondblclick = function(ev){
				return this._ptr.eventHandle(ev || window.event);
			};
		}
		var nodes = this._data;
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = new TreeNode();
			node.setTree(this._tree || this);
			node.create(this, nodes[i], i == 0, i == len - 1);
			this._nodes.push(node);
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activePopup = null;
		this._captureComponent = null;
		this._dragOverNode = null;
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i].dispose();
			this._nodes[i] = null;
		}
		this._nodes.length = 0;
		if(!this._tree){
			this._self.ondblclick = null;
			this._self.onclick = null;
			this._self.onmouseup = null;
			this._self.onmousedown = null;
			this._self.onselectstart = null;
			this._tree = null;
		}
		_super.dispose.apply(this);
	};
	this.getReadonly = function(){
		return this._readonly;
	};
	this.setTree = function(v){
		this._tree = v;
	};
	this.loadData = function(){
		runtime.error("[TreeView::loadData]当前方法必须被使用者重载，以实现特定的数据加载方式");
	};
	this.getActiveNode = function(){
		return this._activeNode;
	};
	this.setActiveNode = function(node){
		if(this._activeNode == node) return;
		if(this._activeNode){
			this._activeNode.deactivate();
		}
		if(node){
			node.activate();
		}
		this._activeNode1 = this._activeNode;
		this._activeNode = node;
	};
	this.getInput = function(value){
		if(!this._input){
			this._input = this._createElement("input");
			this._input.type = "text";
			this.addListener(this._input, "keydown", this, "onKeyDown");
			var _this = this;
			this._input.handleEvent = function(ev, target){
				switch(ev.type){
				case "mousedown":
					if(!_this._readonly){
						if(target != this){  //&& _this._activeNode && _this._activeNode._modify
							_this._activeNode.doRename(this.value);
						}
					}
					break;
				case "mouseup":
					//ev.cancelBubble = true;
					break;
				case "click":
					//!!!也不能是LI，因为mousedown不来源自input
					if(!_this._activeNode) runtime.error("error");
					if(target == this.parentNode) runtime.error("[input]target == this.parentNode");
					if(target != this && target != this.parentNode && target != _this._activeNode._label.getElement()){
						_this._activePopup = null;
					}
					ev.cancelBubble = true;
					return false;
				}
			};
			this._input.onkeypress = function(ev){
				runtime.addThread(0, _this, "autoSizeInput");
			};
		}
		this._input.value = value;
		this._input.style.display = "";
		this._activePopup = this._input;
		this._captureComponent = null;  //只要有this._activePopup, _captureComponent便失效
		this.autoSizeInput();
		return this._input;
	};
	this.onKeyDown = function(ev){
		runtime.addThread(0, this, "autoSizeInput");
		switch(ev.keyCode){
		case KEY_ESC:
			if(this._activeNode){
				this._activeNode.cancelRename();
				this._activePopup = null;
			}
			ev.cancelBubble = true;
			return false;
		case KEY_TAB:
		case KEY_ENTER:
			if(!this._readonly){
				if(this._activeNode){
					this._activeNode.doRename(this.value);
					this._activePopup = null;
				}
			}
			break;
		}
		return true;
	};
	this.autoSizeInput = function(){
		var size = runtime.getTextSize(this._input.value, "12px 宋体");
		this._input.style.width = Math.max(28/*32*/, Math.min(90, size.w + 11)) + "px";  //max-width: this._self.offsetWidth - 14
		//this._input.style.backgroundColor = "#EEEEEE";
	};
	this.eventHandle = function(ev){
		var target = ev.target || ev.srcElement;
		runtime.log(target.tagName + "." + ev.type);
		var ret;
		var control = this.getControl(target) || this;
		if(/*ev.type == "mousedown" && */this._activePopup){
			ret = this._activePopup.handleEvent(ev, target);
		}else{
			if(ev.type == "mousedown" && control && !this._captureComponent){
				this._captureComponent = control;
			}
			if(this._captureComponent){
				control = this._captureComponent;
			}
			if(control && control.handleEvent){
				ret = control.handleEvent(ev, target);
			}
			if(ev.type == "click"){
				this._captureComponent = null;
			}
		}
		/*else{
			switch(ev.type){
			case "mousedown":
			case "mouseup":
			case "click":
				if(typeof control["on" + ev.type] == "function"){
					ret = control["on" + ev.type](ev, target);
				}
				break;
			}
		}*/
		return ret;
	};
	this.handleEvent = function(ev, target){
		switch(ev.type){
		case "mousedown":
			break;
		case "click":
			break;
		}
	};
	this.startDraging = function(treeNode){
		runtime.log("start drag");
		this._draging = true;
		this._activeDragNode = treeNode;
		var _this = this;
		document.onmousemove = function(ev){
			if(_this._draging){
			}
		};
		document.onmouseup = function(ev){
			ev = ev || window.event;
			var target = ev.target || ev.srcElement;
			if(target.tagName != "LI") target = target.parentNode;
			if(target != _this._activeDragNode._self){
				target.parentNode.insertBefore(_this._activeDragNode._self, target);
			}
			runtime.log("end drag");
			_this._draging = false;
			document.onmousemove = null;
			document.onmouseup = null;
		};
	};
	this.startDrag = function(ev, target, node){
		this._draging = true;
		var rect = this.getDragRect();
		rect.style.display = "";
		rect.style.font = "12px 宋体";
		var text = runtime.encodeHTML(node.getText());
		var size = runtime.getTextSize(text, "12px 宋体");
		rect.style.width = size.w + "px";
		rect.style.height = size.h + "px";
		rect.innerHTML = text;
		var pos = this.getPos(target, this._self);
		rect.style.left = (pos.x + ev.offsetX + (target.tagName == "LABEL" ? -33 : 0) + 1) + "px";
		rect.style.top  = (pos.y + ev.offsetY + (target.tagName == "LABEL" ? 1 : 0) + 1) + "px";
	};
	this.stopDrag = function(){
		this.getDragRect().style.display = "none";
		this._dragOverNode = null;
		this._draging = false;
	};
	this.getDragRect = function(){
		var rect;
		if(!this._dragRect){
			this._dragRect =
			rect = this._createElement2(this._self, "div", "DragRect");
		}else{
			rect = this._dragRect;
		}
		return rect;
	};
	this.getPos = function(el, refObj){
		var pos = {"x": 0, "y": 0};
		var dom = runtime.dom;
		for(var o = el; o && o != refObj; o = o.offsetParent){
			var bl, bt, x, y;
			if(o != el){
				bl = dom.getStyleProperty(o, "borderLeftWidth");
				bt = dom.getStyleProperty(o, "borderTopWidth");
				x = isNaN(bl) ? 0 : bl;
				y = isNaN(bt) ? 0 : bt;
				bl = dom.getStyleProperty(o, "paddingLeftWidth");
				bt = dom.getStyleProperty(o, "paddingTopWidth");
				x += isNaN(bl) ? 0 : bl;
				y += isNaN(bt) ? 0 : bt;
			}
			pos.x += o.offsetLeft + (o != el ? x : 0);
			pos.y += o.offsetTop + (o != el ? y : 0);
		}
		return pos;
	};
});
/*</file>*/
/*<file name="alz/mui/BaseWindow.js">*/
_package("alz.mui");

_import("alz.mui.Pane");
_import("alz.mui.SysBtn");

/**
 * 窗体基类
 */
_class("BaseWindow", Pane, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._conf = null;
		this._app = null;
		this._params = null;
		this._req = null;
		this._head = null;
		this._title = null;
		this._closebtn = null;
		this._body = null;
		this._borders = null;   //{Array}
		this._state = "normal";  //normal|max|min
	};
	this.create2 = function(conf, parent, app, params){
		this.setConf(conf);
		this.setParent2(parent);
		this.setApp(app);
		this.setParams(params);
	};
	this.rendered = function(){
		_super.rendered.apply(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var data = {
			"caption": this._params.caption
				|| (this._tplel ? this._tplel._attributes.caption : "")
				|| obj.getAttribute("_caption")
				|| "标题栏"
		};
		this._body = this.find(".win-body");
		this._head = this.find(".win-head");
		var _this = this;
		var falseFunc = function(){return false;};
		this._head.ondragstart = falseFunc;
		this._head.onselectstart = falseFunc;
		this.addListener(this._head, "mousedown", this, "onMouseDown");
		this._title = this.find(".win-head label");
		this._title.ondragstart = falseFunc;
		this._title.onselectstart = falseFunc;
		this._title.innerHTML = data.caption;
		this._closebtn = new SysBtn();
		this._closebtn.init(this.find(".icon-close"), this);
	};
	this.reset = function(params){
		this.setParams(params);
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._borders){
			for(var i = 0, len = this._borders.length; i < len; i++){
				this._borders[i] = null;
			}
			this._borders = null;
		}
		this._closebtn.dispose();
		this._closebtn = null;
		this._title.onselectstart = null;
		this._title.ondragstart = null;
		this.removeListener(this._head, "mousedown");
		this._head.onselectstart = null;
		this._head.ondragstart = null;
		this._head = null;
		this._req = null;
		this._params = null;
		this._app = null;
		this._conf = null;
		_super.dispose.apply(this);
	};
	this.setConf = function(v){
		this._conf = v;
	};
	this.setApp = function(v){
		this._app = v;
	};
	this.setParams = function(v){
		this._params = v;
	};
	this.setReq = function(v){
		this._req = v;
	};
	this.onMouseDown = function(ev){
		if(this._state != "normal") return;
		this._self.style.zIndex = runtime.getNextZIndex();
		//this._head.setCapture(true);
		var pos = runtime.dom.getPos1(ev, 1, this._self);
		this._offsetX = pos.x;  //ev.offsetX;  //ns 浏览器的问题
		this._offsetY = pos.y;  //ev.offsetY;
		this.setCapture(true);
		/*
		var _this = this;
		var body = document.body;
		if(runtime._host.env == "ie"){
			body.setCapture();
		}
		this.addListener(body, "mousemove", this, "onMouseMove");
		this.addListener(body, "mouseup", this, "onMouseUp");
		*/
	};
	this.onMouseMove = function(ev){
		var rect = runtime.dom.getViewPort(document.body);
		//[TODO]是否需要考虑BODY元素的边框宽度？
		var x = rect.x + Math.min(rect.w - 10, Math.max(10, ev.clientX)) - this._offsetX/* - 2*/;
		var y = rect.y + Math.min(rect.h - 10, Math.max(10, ev.clientY)) - this._offsetY/* - 2*/;
		this.moveTo(x, y);
	};
	this.onMouseUp = function(ev){
		this.setCapture(false);
		/*
		var body = document.body;
		this.removeListener(body, "mousemove");
		this.removeListener(body, "mouseup");
		if(runtime._host.env == "ie"){
			body.releaseCapture();
		}
		*/
		//if(runtime.ie) this._head.releaseCapture();
		//this.setCapture(false);
	};
	this.close = function(){
		this.setVisible(false);
	};
	this.callback = function(){
		var args = [this];  //回调函数的第一个参数一定是对话框组件本身
		for(var i = 0, len = arguments.length; i < len; i++){
			args.push(arguments[i]);
		}
		if(this._req){
			this._req.func.apply(this._req.agent, args);
			this._req = null;  //只允许被调用一次
		}
	};
	this.do_win_close = function(act, sender){
		this.setVisible(false);
		this.callback(act, sender);
	};
	this.createBorders = function(){
		this._borders = [];
		for(var i = 0, len = this._cursors.length; i < len; i++){
			var o = this._createElement2(this._self, "div", "border", {
				"cursor": this._cursors[i] + "-resize"
			});
			//if(i % 2 == 0) o.style.backgroundColor = "red";
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
		}
	};
	this.showBorder = function(){
		for(var i = 0, len = this._borders.length; i < len; i++){
			this._borders[i].style.display = "";
		}
	};
	this.hideBorder = function(){
		for(var i = 0, len = this._borders.length; i < len; i++){
			this._borders[i].style.display = "none";
		}
	};
	this.resizeBorder = function(w, h){
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
});
/*</file>*/
/*<file name="alz/mui/Dialog.js">*/
_package("alz.mui");

_import("alz.mui.BaseWindow");

/**
 * 对话框组件
 */
_class("Dialog", BaseWindow, function(_super, _event){
	var KEY_ESC = 27;
	this._init = function(){
		_super._init.call(this);
		//对话框的双态特性，和PaneAppContent相似，主要用来屏蔽环境差异
		this._ownerApp = null;  //身在曹营
		//this._app = null;     //心在汉
		this._skin = null;
		this._caption = "对话框标题";
	};
	this.create2 = function(conf, parent, app, params, ownerApp){
		_super.create2.apply(this, arguments);
		this.setOwnerApp(ownerApp);
	};
	this.create = function(parent, app, params, tpl){
		this.setParent2(parent);
		//this.setOwnerApp(ownerApp);
		this.setApp(app);
		var el = this.createTplElement(parent, tpl);  //"dialog2.xml"
		/*
		tpl = runtime.formatTpl(tpl, {
			"caption": params.caption,
			"pathAui": runtime._pathAui
		});
		*/
		if(this._conf.bg){
			el.style.backgroundImage = "url(res/images/dlg/" + this._conf.bg + ")";
		}
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		//this._skin = this._createElement("div");
		//this._self.appendChild(this._skin);
		//this.fixedOffset();  //计算坐标修正的偏移量
		this.initActionElements();
		//this._skin = this._self.childNodes[0];
		if(this._btnClose){
			var _this = this;
			this._btnClose.style.backgroundPosition = "-48px 0px";
			this._btnClose.onselectstart = function(ev){return false;};
			this._btnClose.ondragstart = function(ev){return false;};
			this._btnClose.onmousedown = function(ev){
				ev = ev || window.event;
				//this.src = runtime._pathAui + "lib/images/AWindow_closedown.gif";
				this.style.backgroundPosition = "-48px -14px";
				if(runtime.ie) this.setCapture();
				this.onMouseMove = function(ev){
					ev = ev || window.event;
					var target = ev.srcElement || ev.target;
					if(target == this){
						//this.src = runtime._pathAui + "lib/images/AWindow_closedown.gif";
						this.style.backgroundPosition = "-48px -14px";
					}else{
						//this.src = runtime._pathAui + "lib/images/AWindow_closeup.gif";
						this.style.backgroundPosition = "-48px 0px";
					}
				};
				this.onMouseUp = function(ev){
					ev = ev || window.event;
					var target = ev.srcElement || ev.target;
					//this.src = runtime._pathAui + "lib/images/AWindow_closeup.gif";
					this.style.backgroundPosition = "-48px 0px";
					this.onMouseMove = null;
					this.onMouseUp = null;
					if(runtime.ie){
						this.releaseCapture();
					}
					if(target == this){
						_this.close();  //关闭对话框
					}
				};
				ev.cancelBubble = true;
			};
		}
		//this.createBorders();
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._btnClose){
			this._btnClose.onmousedown = null;
			this._btnClose.ondragstart = null;
			this._btnClose.onselectstart = null;
			this._btnClose = null;
		}
		this._ownerApp = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setOwnerApp = function(v){
		this._ownerApp = v;
	};
	this.showModal = function(v){
		_super.showModal.apply(this, arguments);
		this.moveToCenter();
		runtime._workspace.setActiveDialog(v ? this : null);
	};
	this.show = function(){
		this.setVisible(true);
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
			this.resizeBorder(w, h);
		}
	};
	this.close = function(){
		if(this._modal){
			this.showModal(false);
		}else{
			this.setVisible(false);
		}
	};
	/*
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
		//var _this = this;
		//this.addListener(this._head, "mousemove", this, "onMouseMove");
		//this.addListener(this._head, "mouseup", this, "onMouseUp");
		this.setCapture(true);
		//var pos = this._dom.getPos(ev.srcElement, this._self);
		//document.title = pos.x + "+" + ev.offsetX + "=" + (pos.x + ev.offsetX) + "#" + ev.clientX
		//								+ "|" + pos.y + "+" + ev.offsetY + "=" + (pos.y + ev.offsetY) + "#" + ev.clientY;
		this._offsetX = ev.offsetX;  //ns 浏览器的问题
		this._offsetY = ev.offsetY;
		var workspace = runtime._workspace;
		if(workspace._fixed != "fixed"){
			if(workspace._mousemoveForFixed){
				workspace._mousemoveForFixed(this, ev);
			}
			/* 直接使用默认值，可以省去自动修正过程，但是不能保证一定是通用的
			if(runtime.ie || runtime.safari){
				workspace._fixedX = 0;
				workspace._fixedY = 0;
				workspace._fixed = "fixed";
			}else if(runtime.opera){
				workspace._fixedX = 2;
				workspace._fixedY = 2;
				workspace._fixed = "fixed";
			}else{  //runtime.moz
				if(this._mousemoveForFixed) this._mousemoveForFixed(ev);
			}
			*/
		}
	};
	this.onMouseMove = function(ev){
		var workspace = runtime._workspace;
		var rect = workspace.getViewPort();
		var x = rect.x + Math.min(rect.w - this._paddingLeft, Math.max(0, ev.clientX - workspace._borderLeftWidth)) - workspace._fixedX - this._offsetX - this._paddingLeft;
		var y = rect.y + Math.min(rect.h - this._paddingTop, Math.max(0, ev.clientY - workspace._borderTopWidth)) - workspace._fixedY - this._offsetY - this._paddingTop;
		if(runtime.ie || runtime.safari || runtime.chrome || runtime.opera){
			x -= this._borderLeftWidth;
			y -= this._borderTopWidth;
		}else if(runtime.moz){
		}
		/*
		var str = "boxModel=" + runtime.getBoxModel()
			//+ "\nrect={x:" + rect.x + ",y:" + rect.y + ",w:" + rect.w + ",h:" + rect.h + "}"
			+ "\nfixedX=" + workspace._fixedX + ",_borderLeftWidth=" + this._borderLeftWidth
			+ "\nfixedY=" + workspace._fixedY + ",_borderTopWidth=" + this._borderTopWidth
			//+ "\nworkspace._borderLeftWidth=" + workspace._borderLeftWidth
			//+ "\nworkspace._borderTopWidth=" + workspace._borderTopWidth
			+ "\nthis._offsetX=" + this._offsetX
			+ "\nthis._offsetY=" + this._offsetY
			+ "\nev.clientX=" + ev.clientX + ",x=" + x + ","
			+ "\nev.clientY=" + ev.clientY + ",y=" + y + ",";
		this._body.childNodes[1].value = str;
		*/
		this.moveTo(x, y);
	};
	this.onMouseUp = function(ev){
		//this.removeListener(this._head, "mousemove");
		//this.removeListener(this._head, "mouseup");
		//if(runtime.ie) this._head.releaseCapture();
		this.setCapture(false);
	};
	this.setCaption = function(v){
		if(this._caption === v) return;
		this._caption = v;
		if(this._self){
			this._title.innerHTML = runtime.encodeHTML(v);
		}
	};
	this.onKeyUp = function(ev){
		switch(ev.keyCode){
		case KEY_ESC:
			this.close();  //关闭对话框
			break;
		}
	};
	this.setClientBgColor = function(color){
		this._body.style.backgroundColor = color;
	};
	this.do_dlg_ok = function(act, sender){
		this.callback(act, sender);
	};
	//点击取消
	this.do_dlg_cancel = function(act, sender){
		this.showModal(false);
		this.callback(act, sender);
	};
});
/*</file>*/
//import alz.mui.Dialog1;
/*<file name="alz/mui/TabPage.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 选项卡组件
 */
_class("TabPage", Component, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._tabs = [];
		this._activeTab = null;
		this._head = null;
		this._body = null;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		this._head = this._createElement2(this._self, "div", "ui-tabpage-head");
		this._body = this._createElement2(this._self, "div", "ui-tabpage-body");
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
		this._tabs.length = 0;
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
	};
	this.add = function(text){
		var el = document.createElement("label");
		el._parent = this;
		el.tagIndex = this._tabs.length + 1;
		el.innerHTML = text + "[0]";
		el.onclick = function(){this._parent.activate(this);};
		this._head.appendChild(el);
		this._tabs.push(el);
		this.activate(el);
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
	<div class="ui-skin">
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
_class("WindowSkinWINXP", Component, function(_super, _event){
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
		var el = this._createElement2(parent ? parent._self : null, "div", "ui-skin");
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		this._xpath = ".ui-window-winxp";
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
		this._title1.ondragstart = function(){return false;};
		this._title2.ondragstart = function(){return false;};
		this.addListener(this._title1, "mousedown", this._parent, "onMouseDown");
		this.addListener(this._title2, "mousedown", this._parent, "onMouseDown");
		this.setState("resizable");
		//runtime.dom.applyCssStyle(this, _cssName, "resizable");
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._title = null;
		this.removeListener(this._title1, "mousedown");
		this.removeListener(this._title2, "mousedown");
		this._title1.ondragstart = null;
		this._title2.ondragstart = null;
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
	this.setState = function(v){
		if(v == this._state) return;
		this._state = v;
		//runtime.dom.applyCssStyle1(this, this._xpath, v);
		runtime.dom.applyCssStyle(this, this._cssData, v);
	};
});
/*</file>*/
/*<file name="alz/mui/WindowSkinWIN2K.js">*/
_package("alz.mui");

_import("alz.mui.Component");

_class("WindowSkinWIN2K", Component, function(_super, _event){
	this._cssData = {
		"resizable":{
			/*
			"_skin1" :{"background-position":"0px -10px"},
			"_skin2" :{"background-position":"-10px 0px"},
			"_skin3" :{"background-position":"0px 0px"},
			"_skin4" :{"background-position":"-4px 0px"},
			"_skin5" :{"background-position":"0px -33px"},
			"_skin6" :{"background-position":"0px -3px"},
			"_skin7" :{"background-position":"-9px -33px"}
			*/
		},
		"normal":{
			/*
			"_skin1" :{"background-position":"0px -7px"},
			"_skin2" :{"background-position":"-11px 0px"},
			"_skin3" :{"background-position":"-8px 0px"},
			"_skin4" :{"background-position":"-11px 0px"},
			"_skin5" :{"background-position":"0px -30px"},
			"_skin6" :{"background-position":"0px 0px"},
			"_skin7" :{"background-position":"-10px -30px"}
			*/
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
		var el = this._createElement2(parent ? parent._self : null, "div", "ui-skin");
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		this._xpath = ".ui-window-win2k";
		if(runtime.ie){
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
				"src": runtime.getConfigData("pathimg") + "win-2k-title-bg.gif"
			});
			this._title.ondragstart = function(){return false;};
			this.addListener(this._title, "mousedown", this._parent, "onMouseDown");
		}
		//runtime.dom.applyCssStyle(this, _cssName, "resizable");
		this.setState("resizable");
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(runtime.ie){
			this.removeListener(this._title, "mousedown");
			this._title.ondragstart = null;
			this._title = null;
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resize = function(w, h){
		//if(_super.resize.apply(this, arguments)) return true;
		_super.resize.apply(this, arguments);
		if(runtime.ie){
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
			this.setElementRect(this._title     ,   w1 ,   h0 , w-2*w1 , h1-h0-1);
			this.setElementRect(this._ee["_skin2"], w-w1 ,    0 ,     w1 ,      h1);

			this.setElementRect(this._ee["_skin3"],    0 ,   h1 ,     w2 , h-h1-h3);
			this.setElementRect(this._ee["_skin4"], w-w2 ,   h1 ,     w2 , h-h1-h3);

			this.setElementRect(this._ee["_skin5"],    0 , h-h3 ,     w3 ,      h3);
			this.setElementRect(this._ee["_skin6"],   w3 , h-h3 , w-2*w3 ,      h3);
			this.setElementRect(this._ee["_skin7"], w-w3 , h-h3 ,     w3 ,      h3);
		}
	};
	this.onResizableChange = function(){
		//runtime.dom.applyCssStyle(this, _cssName, this._parent.getResizable() ? "resizable" : "normal");
		this.setState(this._parent.getResizable() ? "resizable" : "normal");
		this.resize(this._width, this._height);
	};
	this.setState = function(v){
		if(v == this._state) return;
		this._state = v;
		//runtime.dom.applyCssStyle1(this, this._xpath, v);
		runtime.dom.applyCssStyle(this, this._cssData, v);
	};
	this.showBorder = function(){
		this._dom.removeClass(this._self, "none");
	};
	this.hideBorder = function(){
		this._dom.addClass(this._self, "none");
	};
});
/*</file>*/
/*<file name="alz/mui/SysBtn.js">*/
_package("alz.mui");

_import("alz.mui.Component");

/**
 * 窗体组件上的系统按钮组件
 */
_class("SysBtn", Component, function(_super, _event){
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
		this.addListener(this._self, "click", this, "onClick1");
		this.addListener(this._self, "mousedown", this, "onMouseDown1");
		this.addListener(this._self, "mouseup", this, "onMouseUp1");
		//this.addListener(this._self, "mouseover", this, "onMouseOver1");
		//this.addListener(this._self, "mouseout", this, "onMouseOut1");
	}
	this.dispose = function(){
		if(this._disposed) return;
		//this.removeListener(this._self, "mouseout");
		//this.removeListener(this._self, "mouseover");
		//this.removeListener(this._self, "mouseup");
		this.removeListener(this._self, "mousedown");
		this.removeListener(this._self, "click");
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.onMouseDown1 = function(ev){
		this._dom.addClass(this._self, "active");
		this._capture = true;
		this.setState("active");
		if(runtime.ie){
			this._self.setCapture();
			ev.cancelBubble = true;
		}else{
			ev.stopPropagation();
		}
		return false;
	};
	this.onMouseUp1 = function(ev){
		this._dom.removeClass(this._self, "active");
		this._capture = false;
		this.setState("normal");
		if(runtime.ie){
			this._self.releaseCapture();
			ev.cancelBubble = true;
		}else{
			ev.stopPropagation();
		}
		return false;
	};
	this.onMouseOver1 = function(ev){
		document.title = "over";
		if(this._capture){
			this.setState("active");
		}else{
			//this.setState("normal");
		}
		//return false;
	};
	this.onMouseOut1 = function(ev){
		document.title = "out";
		if(this._capture){
			this.setState("normal");
		}else{
			//this.setState("normal");
		}
		//return false;
	};
	this.onClick1 = function(ev){
	};
	this.onMouseDown = function(ev){
		this.setCapture(true);
		/*
		var _this = this;
		var body = document.body;
		if(runtime._host.env == "ie"){
			body.setCapture();
		}
		this.addListener(body, "mousemove", this, "onMouseMove");
		this.addListener(body, "mouseup", this, "onMouseUp");
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
		var body = document.body;
		this.removeListener(body, "mousemove");
		this.removeListener(body, "mouseup");
		if(runtime._host.env == "ie"){
			body.releaseCapture();
		}
		*/
	};
});
/*</file>*/
/*<file name="alz/mui/Window.js">*/
_package("alz.mui");

_import("alz.mui.BaseWindow");
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
_class("Window", BaseWindow, function(_super, _event){
	//<input type="checkbox" checked="checked" /> Resizable
	this._init = function(){
		_super._init.call(this);
		this._icon = null;
		this._minbtn = null;
		this._maxbtn = null;
		this._skin = null;
		this._resizable = false;
		this._width = 0;
		this._height = 0;
		this._lastRect = null;
	};
	this.build = function(el){
		_super.build.apply(this, arguments);
		var attributes = el._attributes;
		if(attributes.dock){
			if(attributes.dock == "true"){
				runtime.dom.removeClass(this._self, "undock");
			}else{
				runtime.dom.addClass(this._self, "undock");
			}
		}
		this.setParent2(this._self.parentNode);
		this._params = {};
	};
	this.create = function(parent, app, params, tpl){
		this.setParent2(parent);
		this.setApp(app);
		this.setParams(params || {});
		var el = this.createTplElement(parent, tpl);
		this.init(el);
		return el;
	};
	this.bind = function(el){
		this.setParent2(el.parentNode);
		this._params = {};
		this.init(el);
	};
	this.init = function(el){
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
		//_icon="{$pathimg}win-icon.gif" _caption="alzui调试器 - Windown 2000" _align="none"
		var data = {
			"icon"   : el.getAttribute("_icon") || "",
			"caption": this._params.caption || el.getAttribute("_caption") || "标题栏"
		};
		this._cssName = "." + this._self.className;
		this._xpath = this._cssName;
		var _this = this;
		this._icon = this.find(".icon");
		this._icon.src = data.icon.replace(/^images\//, runtime.getConfigData("pathimg"));
		this._icon.ondragstart = function(){return false;};
		this._minbtn = new SysBtn();
		this._minbtn.init(this.find(".icon-min"), this);
		this._maxbtn = new SysBtn();
		this._maxbtn.init(this.find(".icon-max"), this);
		if(this._self.className == "ui-window-winxp"){
			this._skin = new WindowSkinWINXP();
		}else{
			this._skin = new WindowSkinWIN2K();
		}
		this.createBorders();
		this._skin.create(this);

		this.resize(800, 600);
		this.showBorder();
		this.setResizable(true);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._skin.dispose();
		this._skin = null;
		this._minbtn.dispose();
		this._minbtn = null;
		this._maxbtn.dispose();
		this._maxbtn = null;
		this._icon.ondragstart = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/*this.xquery = function(xpath){
		return runtime._xpq.query(xpath, this._self);
	};*/
	this.getResizable = function(){
		return this._resizable;
	};
	this.setResizable = function(v){
		if(v == this._resizable) return;
		this._resizable = v;
		this.tune(this._width, this._height);
		if(v){
			this.showBorder();
			this._skin.showBorder();
		}else{
			this.hideBorder();
			this._skin.hideBorder();
		}
		this._skin.onResizableChange();
	};
	this.resize = function(w, h){
		if(w < this._skin._model["min_width"] ) w = this._skin._model["min_width"];
		if(h < this._skin._model["min_height"]) h = this._skin._model["min_height"];
		if(_super.resize.apply(this, arguments)) return true;
		//this.tune(w, h);
		if(/*this._resizable && */this._borders){
			this.resizeBorder(w, h);
		}
		this._skin.resize(w, h);
	};
	this.tune = function(w, h){
		var m = this._skin._model;
		var n = this._resizable ? 4 : (this._state == "normal" ? 3 : 0);  //this._borderTopWidth + this._paddingTop;
		var h0 = m["head_height"];
		this.setElementRect(this._head, n, n, w - 2 * n, (this._state == "normal" ? h0 - n - 1 : 18));
		this.setElementRect(this._body, n, n, w - 2 * n, h - h0 - n    );
		this._title.style.width = (w - 2 * n - m["icon_width"] - m["sbtn_width"] * 3 - 2 * m["sep_num"]) + "px";
	};
	//窗体最大化
	this.do_win_max = function(act, sender){
		console.log("[TODO]do_win_max");
		if(this._state == "normal"){
			this._state = "max";
			this._lastRect = {
				"x": this._left,
				"y": this._top,
				"w": this._width,
				"h": this._height
			};
			this.hideBorder();
			this.moveTo(0, 0);
			var rect = this.getParent().getViewPort();
			this.resize(rect.w, rect.h);
			this.setResizable(false);
		}else{
			this._state = "normal";
			this.showBorder();
			var rect = this._lastRect;
			this.moveTo(rect.x, rect.y);
			this.resize(rect.w, rect.h);
			this._lastRect = null;
			this.setResizable(true);
		}
	};
	//窗体最小化
	this.do_win_min = function(act, sender){
		console.log("[TODO]do_win_min");
	};
});
/*</file>*/
/*<file name="alz/mui/ToolWin.js">*/
_package("alz.mui");

_import("alz.mui.BaseWindow");

/**
 * 工具窗体
 */
_class("ToolWin", BaseWindow, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
		this._dock = false;
	};
	this.rendered = function(){
		_super.rendered.apply(this);
		runtime.dom.addClass(this._self, "undock");
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this.initActionElements();
	};
	this.dispose = function(){
		if(this._disposed) return;
	};
});
/*</file>*/
/*<file name="alz/mui/AppWorkspace.js">*/
_package("alz.mui");

_import("alz.mui.Container");

/**
 * 应用的子窗体工作区组件
 */
_class("AppWorkspace", Container, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.build = function(el){
		_super.build.apply(this, arguments);
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.rendered = function(){
		_super.rendered.apply(this);
		console.log("AppWorkspace::rendered");
	};
});
/*</file>*/
/*<file name="alz/mui/PaneBase.js">*/
_package("alz.mui");

_import("alz.mui.Pane");

/**
 * 面板基类
 */
_class("PaneBase", Pane, function(_super, _event){
	this._init = function(){
		_super._init.call(this);
	};
	this.create = function(parent, app, tpl){
		this.setParent2(parent);
		this.setApp(app);
		var el = this.createTplElement(parent, tpl);
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		//this.initComponents();  //初始化内部组件
		this.initActionElements(/*this._self, this*/);  //初始化动作元素
	};
	this.reset = function(params){
		if(this._params !== params){
			this.setParams(params);
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._params = null;
		_super.dispose.apply(this);
	};
	this.setActionState = function(act, v, next){
		var nodes = this._actionManager._nodes[act];
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			switch(v){
			case "show":
			case "hide":
				node.setVisible(v == "show");
				if(next){
					node._self.nextSibling.style.display = v == "show" ? "" : "none";
				}
			}
		}
	};
});
/*</file>*/
/*<file name="alz/core/WebRuntime_ui.js">*/
_package("alz.core");

//_import("alz.core.ActionManager");
_import("alz.core.ToggleManager");
_import("alz.mui.Workspace");
_import("alz.mui.Dialog");

_extension("WebRuntime", function(){  //注册 WebRuntime 扩展
	this._init = function(){  //加载之后的初始化工作
		this._domTemp = null;
		this.toggleMgr = new ToggleManager();
		//this.actionManager = new ActionManager();
		this._workspace = new Workspace();
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
	this.onLoad = function(ev){
		if(true || this._newWorkspace){
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
				this._body.appendChild(div);
			};
		}
	};
	/**
	 * 根据一段HTML代码字符串创建一个DOM对象
	 * @param {String} html HTML代码字符串
	 * @return {Element} 新创建的DOM对象
	 */
	this.createDomElement = function(html, parent/*|exp*/){
		if(!this._domTemp){
			this._domTemp = this._doc.createElement("div");
		}
		this._domTemp.innerHTML = html;
		var el = this._domTemp.removeChild(this._domTemp.childNodes[0]);
		if(typeof parent == "string" || typeof parent == "undefined"){
			//return jQuery.find(exp, div)[0];
			/*
			var nodes = div.childNodes;
			for(var i = 0, len = nodes.length; i < len; i++){
				if(nodes[i].className == "main"){
					return div.removeChild(nodes[i]);
				}
			}
			return null;
			*/
		}else if(parent){  //HTMLElement
			parent.appendChild(el);
			/*
			//滞后加载图片
			var imgs = el.getElementsByTagName("img");
			for(var i = 0, len = imgs.length; i < len; i++){
				imgs[i].src = imgs[i].getAttribute("src0");
			}
			*/
		}
		return el;
	};
	this.getWorkspace = function(){
		return this._workspace;
	};
	this.getViewPort = function(element){
		var rect = {
			"x": element.scrollLeft,
			"y": element.scrollTop,
			//"w": element.clientWidth,  //Math.max(element.clientWidth || element.scrollWidth)
			"w": Math.max(element.clientWidth, element.parentNode.clientWidth),
			"h": Math.max(element.clientHeight, element.parentNode.clientHeight)  //Math.max(element.clientHeight || element.scrollHeight)
		};
		//if(this.ff){}
		//rect.w = Math.max(element.clientWidth, element.parentNode.clientWidth);
		//rect.h = Math.max(element.clientHeight, element.parentNode.clientHeight);
		return rect;
	};
	this.onResize = function(ev){
		var rect = this.getViewPort(this.getBody());  //this._workspace.getViewPort()
		if(this._workspace){
			this._workspace.resize(rect.w, rect.h);
		}
		/*
		if(typeof app_onResize != "undefined"){  //提前触发应用的resize事件
			app_onResize(rect.w, rect.h);
		}
		*/
		if(this._appManager){
			this._appManager.onResize({
				"type": "resize",
				"w"   : rect.w,
				"h"   : rect.h
			});  //调整所有应用的大小
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
		var el = typeof id == "string" ? this.getElement(id) : id;
		if(!el) throw "未找到指定id的DOM元素";
		if(!el._ptr){
			var className, aui;
			var sAui = el.getAttribute("aui");
			if(sAui != "-"){
				aui = eval("(" + sAui + ")");
				if(aui.tag){
					className = aui.tag;
				}else{
					className = el.getAttribute("tag");
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
			c.setParent(parent, el);
			c.bind(el);
			//var color = this.getRandomColor();
			//c._self.style.backgroundColor = color;
			this._components.push(c);
			if(el.getAttribute("html") != "true"){  //如果初始化子组件的话
				var nodes = el.childNodes;
				for(var i = 0, len = nodes.length; i < len; i++){
					if(nodes[i].nodeType == 1 && nodes[i].getAttribute("aui")){  //NODE_ELEMENT
						this.initComponent(c, nodes[i], true);
					}
				}
			}
		}
		return el._ptr;
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
			}
		}
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
			var el = this.getComponentById(id);  //可能的组件是 Popup,Dialog
			el.moveToCenter();
			el.showModal(true);
		}/*else{
			el.showModal(false);
		}*/
	};
	this.getModalPanel = function(){
		return this._workspace.getModalPanel();
	};
});
/*</file>*/

}});