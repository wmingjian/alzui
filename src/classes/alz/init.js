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