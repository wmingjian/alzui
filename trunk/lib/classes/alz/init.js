/*
if(typeof __global.runtime != "undefined"){  //��Ƕģʽ�����³�ʼ��
	if(!__global.confirm("alzuiϵͳ�Ѿ�������ϣ�ȷ��Ҫ���³�ʼ����")){
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

var __version = "0.0.8";  //��ǰ�汾��Ϣ����ʽ:"���汾��.���汾��.�޶��汾��"
var __buildtime = 1263906485218;
var __start = new Date().getTime();  //��¼��ʼʱ��
var __proto = "prototype";
var __inDeclare = false;  //��ʶ�Ƿ���������������
/**
 * �������������ԭ�ͻ���˵���������
 */
function __newClass(){
	//����һ����������ȼ��ڴ���һ��Functionʵ���������Ժ��ģ��ÿ����Ĺ��캯����
	//���ǲ�ͬ��function�������ʹ����ͬ��function����OOģ���ڼ̳�ʱ������������
	//���⣬��������prototype,jQuery,mootools�ȣ�ģ��OO�ĺ���˼�붼��������һ�µġ�
	//return new Function("this._init.apply(this, arguments);");  //anonymous code
	return function(){  //"F" + new Date().getTime()
		//������������������У�ֱ�ӷ��أ���������ԭ����������Ҫ����ʵ�ʵĹ��캯��
		if(__inDeclare) return;

		//��鹹�캯���Ƿ���ڣ���������ϸ���ֻ�����޵ļ�飬�����Ƿ��Ǻ����ļ�飬
		//�Ժ�Ϊ��������ܿ��Կ��Ǻ��Ըü��
		if(typeof this._init == "function"){
			//����OOPģ����ʵ�ʵĹ��캯���������ݲ���
			this._init.apply(this, arguments);
		}/*else{
			throw "�� " + name + " ������ȱ�ٹ��캯�� _init";
		}*/

		//���Ժ�߼���UI�������this.create���������ڲ�����ʵ�ʹ���ĵط������캯����
		//ʵֻ��һ�����������ļ��еأ�������create��������������ڲ�ʵ�֣�����������
		//������һ��������
		//�������������Ϊ0��ִ�� create ����
		if(arguments.length != 0 && typeof this.create == "function"){  //this._className.indexOf("alz.ui.") == 0
			this.create.apply(this, arguments);  //����create���������ݲ���
		}
	};
}
/**
 * �������ֻ�ᱻ����һ�Σ������ڴ������� Context ʵ��������һ�������Ļ�������
 */
function createContext(name/*, libs*/){  //bootstrap
	/**
	 * �����������
	 * �����ﲻֱ�Ӷ���Ϊ WebRuntime �ĳ�Ա����ҪĿ����Ϊ�˽���ڵ�ǰ�������ռ�
	 * �ڲ�����ֱ��ͨ�� alz ���ýű�������⡣
	 */
	var alz = {};  //������ԭ���ϣ���֤���������ռ���ָ��ͬһ������
	var _classes = {};  //���е���
	var _pkg = "";      //��ǰ�ࣨ��ӿ�,��չ�����ڵİ�������
	//var _exts = {};     //���������չ
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
		 * �Ƴ������еĵ�i������
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
		 * ���������������o������
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
			case 1:  //2007��2��2��
				return y + "��" + m + "��" + d + "��";
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
			case 9:  //2007��2��2�� 0ʱ01��05��
				return y + "��" + m + "��" + d + "�� "
					+ h + "ʱ"
					+ (n < 10 ? "0" + n : n) + "��"
					+ (s < 10 ? "0" + s : s) + "��";
			case 10:  //2008��4��22��(���ڶ�) ����02:29
				return y + "��" + m + "��" + d + "��"
					+ "(����" + ("��һ����������".charAt(this.getDay())) + ") "
					+ (["����","����"][this.getHours() < 12 ? 0 : 1])
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
		 * IE5.01��֧��apply,call�����������ڴ���Ҫ�Զ�������������
		 * �����ģ��OOP�����������������������ò��������ǵĴ��ڣ�ͬʱҲ�ѿ�ܶ��������
		 * JS����İ汾Ҫ�󽵵����㹻�͵ĳ̶ȣ�^_^
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
		this.__name = name || "anonymous";  //Context������
		this.__context__ = this;
		this.runtime = rt || null;  //����ǽ�Ҫ������ȫ��Ψһ����
		this.application = null;  //���ÿһ��Ӧ�õ�Ψһ application ����
		//this._super = null;  //��ǰ��ĸ���
	}
	function _package(sPackage){
		_pkg = sPackage;  //��ס��ǰ���ڵİ�
	}
	/**
	 * ģ����Ķ���
	 * @param className {String} �������
	 * @param superClass {Class} �������
	 * @param classImp {Function} ���ʵ�ִ���
	 */
	function _class(className, superClass, classImp){
		var _s;
		if(superClass === null){  //Ĭ�ϼ̳� JS ��ԭ��������
			_s = null;  //��֤���� _super ����Ϊ null
			superClass = Object;  //[TODO]������û����չObject��������̳�Object
		}else{
			if(superClass === ""){
				superClass = _classes["alz.lang.AObject"];
			}
			_s = superClass[__proto];
		}

		//�༰���Զ���(��̬����)
		var clazz = __newClass();  //������
		clazz._super = _s;  //�� _super ���Ե������棨Object.prototype��
		clazz._className = className;
		clazz._clazzImp = classImp;
		clazz.toString = function(){return "[class " + this._className + "]"};

		//ԭ�ͼ����Զ��壨����ʵ��������Щ���ԣ�
		__inDeclare = true;
		var _p =
		clazz[__proto] = new superClass();  //ͨ��ԭ��ʵ�ּ̳�
		__inDeclare = false;
		_p.constructor = clazz;  //_p._init;  //��ʼ��������
		if(!_p.__proto__){
			_p.__proto__ = _p;  //fixed for ie
		}
		_p._className = className;
		_p._clazz = clazz;
		_p._exts = [];  //�����չ����

		//���
		alz[className] = clazz;  //����󶨵���������
		_classes[_pkg + "." + className] = clazz;
		if(_cxt){
			this[className] = clazz;  //�󶨵���ǰ�����Ļ�����������֮��
		}
		//this.runtime._contextList[this.runtime._name][className] = clazz;  //�󶨵����������Ļ���֮��
		//__global[className] = clazz;

		//ִ�����ʵ�ִ���
		if(typeof classImp == "function"){
			classImp.apply(_p, [_s]);  //function(_super){};  //��ʼ�������
		}
		_p = null;
		_s = null;
		//clazz = null;
		return clazz;
	}
	/**
	 * �����Ļ�������Ծٴ���
	 */
	function bootstrap(){
		initNative();
		//��׼��_class������ʽ���������ڻ���ʵ�����ǵ������Ļ�����
//------------------------------------------------------------------------------
_package("alz.core");

/**
 * �����ռ�������Ļ����ĸ��������ﲢ���ϸ����֣��������������ҪĿ�ľ��Ǵ���
 * ��������Ļ��������ɴ˹����һ�����������ռ����������������Ļ�������������
 * ���������ֲ�������Ŀɲ����ԣ������OOPģ��ԭ��
 *
 * _package,_import,_class����OOP�ؼ����Ե���Ҫ�̶��Ƿ������ġ�
 */
_class("Context", null, function(){
	this.__classes__ = _classes;
	this.alz = alz;
	this._init = _init;
	this._import = function(className){
		var clazz = _classes[className];
		var name = className.split(".").pop();
		if(!(name in this)){
			this[name] = clazz;  //����
		}
		if(!(className in this)){
			this[className] = clazz;  //ȫ��
		}
	};
	this._package = _package;  //ǰ���Ѿ����壬ֻ������
	this._class = _class;  //ǰ���Ѿ����壬ֻ������
	/**
	 * ģ��ӿڵĶ���
	 * @param name {String} �ӿڵ�����
	 * @param superInterface {Interface} ���ӿ�
	 * @param interfaceImp {Function} �ӿڵ�ʵ�֣���������ʵ��
	 */
	this._interface = function(name, superInterface, interfaceImp){
		interfaceImp.__name__ = name;
		this.alz[name] = interfaceImp;
		this[name] = interfaceImp;
	};
	//����һ������������
	function createMethod(name){
		return function(){
			return callMethod(this, name, arguments);
		};
	}
	//ʹ�����ض��Ĳ�������һ��ָ�����Ƶķ���
	function callMethod(obj, name, args){
		if(obj._exts !== obj._clazz[__proto]._exts){
			window.alert("callMethod error");
		}
		//op = object or prototype
		for(var op = obj; op && op._exts; op = op._clazz._super){
			var exts = op._exts;
			if(name == "dispose"){
				for(var i = exts.length - 1; i >= 0; i--){  //����ִ��������������չ
					if(name in exts[i]){
						exts[i][name].apply(obj, args);
					}
				}
			}else{
				for(var i = 0, len = exts.length; i < len; i++){  //��˳��ִ�з�������չ�����졢������
					if(name in exts[i]){
						exts[i][name].apply(obj, args);
					}
				}
			}
			exts = null;
		}
	}
	/**
	 * Ϊ���ṩһ����չ����
	 * @param className {String} ����չ���������
	 * @param extImp {Function} ��չ��ʵ�ִ���
	 * [TODO]���԰��������չ�Ĺ���ԭ������ͨ���滻ԭ������صķ�����Ϊÿһ����
	 * �����չһ�ֻ��ơ�
	 * WebRuntime.regExt = function(clazz){};
	 */
	this._extension = function(className, extImp){
		var name = _pkg + "." + className;
		var clazz = _classes[name];
		if(!clazz){
			throw "��" + name + "�������ڣ�������������Ķ����Ƿ���ȷ";
		}
		//if(!(name in _exts)){
		//	_exts[name] = [];
		//}
		var methods = {
			"_init"  : 1,  //���캯��
			"init"   : 1,  //��ʼ������
			"dispose": 1   //��������
		};
		var p = clazz[__proto];
		var exts = p._exts;  //_exts[name]
		if(exts.length == 0){  //�����û�б���չ����������չ֮ǰԭʼ�Ĺؼ�����
			//�ض���ؼ���������֤�ܹ�˳��ִ����չ�Ĵ���
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
		var o = new extImp();  //������չ��һ��ʵ����ֻ�贴��һ����
		exts.push(o);  //ע����չ
		for(var k in o){
			if(k in methods) continue;  //���Թؼ�����
			p[k] = o[k];  //�����ķ���ֱ�Ӱ󶨵�ԭ����
		}
		//�������չ��WebRuntime�࣬��֤ȫ��Ψһ����runtime�ܹ�����չ
		//[TO-DO]onContentLoad֮����ִ��WebRuntime������չ
		if(className == "WebRuntime"){
			if(o._init) o._init.call(this.runtime);
		}
		o = null;
		exts = null;
		p = null;
	};
	/**
	 * ������ĳ��󷽷�����ܻᱣ֤�������ʵ�ָ÷���
	 */
	this._abstract = function(proto, name, methodImp){
		proto[name] = methodImp || function(){};
	};
});
//------------------------------------------------------------------------------
		//[TODO]��ֹ����lib�ļ�����Context�࣬���Է�ֹContext�౻����
		var className = "Context";
		var clazz = _classes[_pkg + "." + className];
		_cxt = new clazz(name, null);
		_cxt[className] = clazz;  //�󶨵���ǰ�����Ļ�����������֮��
		clazz = null;
		return _cxt;
		/*
		var Context = __newClass();  //����ʵ��һ���ඨ��
		var _p = Context[__proto];
		//contextImp.apply(_p);  //ʵ��ԭ���ϵķ���
		_p.__apply__ = contextImp;
		_p.__apply__(Context);
		delete _p.__apply__;
		delete _p;
		//cxt.__name = name;
		//cxt.runtime = null;
		//contextImp.apply(cxt);
		//this._init(name, null);
		//----cxt._classes[fullName] = clazz;  //��ǰ�౾��
		//���� Context �࣬��֤�Ժ�ʹ�ú�������һ���ǹ淶��
		//cxt.alz["alz.core.Context"] = Context;
		//cxt.Context = Context;
		//----cxt._import(fullName);  //�ӵ�һ��ʵ��������
		//runtime._contextList[name] = cxt;  //ע�������Ļ���
		//���������Ļ�����
		//delete clazz[__proto]._classes;
		//delete this;
		*/
	}
	return bootstrap();
}