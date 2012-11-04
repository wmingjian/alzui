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