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