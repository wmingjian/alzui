/**
 * alzui-mini JavaScript Framework, v__VERSION__
 * Copyright (c) 2009-2011 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
/**
 * 框架基础库
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

}(this)).regLib("__init__", "", function(){with(arguments[0]){

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