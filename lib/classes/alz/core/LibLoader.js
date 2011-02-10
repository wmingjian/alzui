_package("alz.core");

_import("alz.core.ScriptLoader");

/**
 * LibLoader
 * �ļ��������棬ʹ��script����link����js��css�ļ�
 * ����js�ļ����������(conf,lib,tpl)
 */
_class("LibLoader", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._libs = [];
		this._fileExt = ".js";  //���ļ�Ĭ�ϵĺ�׺��
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
	 * @param {String} libs ���ŷָ�Ŀ����б�
	 * @param {WebRuntime} agent
	 * @param {String} funName
	 * �ص�����������ʽ��fun(lib, libConf, loaded)
	 * lib     = ���ļ�����Ϣ
	 * libConf = ��������Ϣ
	 * loaded  = ��Դ��������Ƿ�������
	 */
	this.init = function(libs, codeProvider, agent, funName){  //���ؿ����
		for(var i = 0, len = libs.length; i < len; i++){
			var lib = libs[i];
			if(typeof lib == "string"){
				var type;  //lib|tpl
				var name = lib;
				var inApp = name.charAt(0) == "#";
				if(inApp){
					name = name.substr(1);  //���˵����ֿ�ͷ��"#"
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
	 * ���ݿ��������Ӧ��url��ַ
	 * @param {String} name lib��tpl������
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
				path = runtime.pathLib;  //�ں���չ��
			}else{  //��Ӧ��Ŀ¼�¼��ؿ��ļ�
				path = runtime.getConfigData("pathapp") || runtime.pathLib;  //����Ӧ�ÿ�
			}
			src = path + lib.name + "." + lib.type + this._fileExt;
		}
		return src;
	};
	this._loadLib = function(){
		if(this._index >= this._libs.length){  //���û�п���룬��ֱ��ִ�лص�
			this._agent[this._funName]();  //ע��û�п���
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
			http.send("");  //FF�������null����ʡ��
		}else{  //����(lib.js,tpl.js)�ļ�
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
			if(this._index == 1 && (lib.name == "core" && runtime.getConfData("product"))){  //�в�Ʒ���õĻ������ز�Ʒ��������
				var loader = new ScriptLoader();
				loader.create(this, function(){
					this._start();  //������ϣ��ٿ�ʼ����ʣ��Ŀ��ļ�
					loader = null;
				});
				loader.load([runtime.getConfigData("pathlib") + runtime.getConfData("product")], "", true);
			}else{
				this._start();
			}
		}else{  //�������
			argv[2] = true;  //��ʾ�������
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