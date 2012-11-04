_package("alz.app.doc");

/**
 * 描述一个JS类文件
 */
_class("ClassFile", "", function(){
	var re_class  = /\n_class\(\"(\w+)\", \"?(\w*)\"?, function\(\)\{/;
	var re_method = /\n\t(this|\w+)\.(\w+)\s*=\s*function\s*\(([\w, ]*)\)\s*\{/g;
	this._init = function(){
		_super._init.call(this);
		this._mtime = 0;
		this._source = "";
		this._meta = {};  //type=package|import|class|method
		this._meta_class = null;
		this._methods = null;
	};
	this.init = function(text){
		var p = text.indexOf("\n");
		if(p == -1){
			this._mtime = parseInt(text, 10);
		}else{
			this._mtime = parseInt(text.substr(0, p), 10);
			this._source = text.substr(p + 1);
		}
	};
	this.dispose = function(){
		this._methods = null;
		this._meta_class = null;
		for(var k in this._meta){
			delete this._meta[k];
		}
		this._source = "";
		this._mtime = 0;
		_super.dispose.apply(this);
	};
	this.genDoc = function(parent){
		//alert(this.getLines().join("\n"));
		this.parseClass();
		this.parseMethods();
		this.parseDocComments();
		parent.innerHTML = this.gen_html();
	};
	this.getLines = function(){
		var lines = [];
		var p1 = -1, p2;
		while(true){
			p1++;  //忽略"\n"
			p2 = this._source.indexOf("\n", p1);
			if(p2 != -1){
				lines.push(this._source.substring(p1, p2));
				p1 = p2;
				continue;
			}else{
				lines.push(this._source.substring(p1));
				break;
			}
		}
		return lines;
	};
	this.parseDocComments = function(){
		var p2 = -2, p1;
		while(true){
			p2 += 2;
			p1 = this._source.indexOf("/**", p2);
			if(p1 != -1){
				p2 = this._source.indexOf("*/", p1);
				var doc = this._source.substring(p1, p2 + 2);
				var obj = this.mergeDocComment(p2 + 2, doc);
				if(obj === null || typeof obj == "string"){
					alert(doc);
				}
				continue;
			}else{
				break;
			}
		}
	};
	/**
	 * 将注释文档合并到相应的meta对象中，如果找不到会alert提示
	 */
	this.mergeDocComment = function(p, doc){
		var p1 = this._source.indexOf("\n", p);
		if(p1 == -1){
			return null;
		}else{
			p1++;
			if(p1 in this._meta){  //如果已经存在通过正则解析过的meta对象，则直接保存，无需再次解析
				this._meta[p1].doc = this.parseComment(doc);
				return this._meta[p1];
			}else{
				var p2 = this._source.indexOf("\n", p1);
				if(p2 == -1){
					return this._source.substring(p1);
				}else{
					return this._source.substring(p1, p2);
				}
			}
		}
	};
	/**
	 * 解析一段注释文档
	 * author       标识代码作者
	 * class        标识该函数是一个类的构造函数
	 * constant     声明常量
	 * constructor  同class
	 * default      默认值
	 * deprecated   声明已弃用的对象
	 * description  对象描述
	 * event        事件函数
	 * example      例子代码
	 * fileOverview Javascript文件总体描述
	 * ignore       忽略有这个标记的函数
	 * link         与其他JsDoc对象关联
	 * name         显示声明JsDoc不能自动检测的对象
	 * namespace    声明命名空间
	 * param        参数
	 * private      声明私有对象
	 * property     显式声明一个属性
	 * public       声明公开对象
	 * requires     声明所依赖的对象或文件
	 * returns      返回值
	 * see          声明可参考的其它对象
	 * since        声明对象从指定版本开始生效
	 * static       显式声明一个静态对象
	 * throws       声明函数执行过程中可能抛出的异常
	 * type         声明变量类型或者函数返回值类型
	 * version      版本号
	 */
	this.parseComment = function(str){
		var doc = {
			"text"  : [],
			"nodes" : [],
			"hash"  : {},  //param
			"return": null
		};
		var lines = str.split("\n");
		for(var i = 1, len = lines.length - 1; i < len; i++){
			var line = lines[i];
			var p = line.indexOf("*");
			var ch = line.charAt(p + 2);
			if(ch == "@"){
				var arr = line.substr(p + 3).split(" ");
				var param;
				switch(arr[0]){
				case "author"      : //标识代码作者
				case "class"       : //标识该函数是一个类的构造函数
				case "constant"    : //声明常量
				case "constructor" : //同class
				case "default"     : //默认值
				case "deprecated"  : //声明已弃用的对象
					console.log(arr[0]);
					break;
				case "desc":
				case "description" : //对象描述
					param = {
						"type"    : "param",
						"key"     : arr[0],
						"datatype": "",
						"name"    : "",
						"text"    : arr.slice(1).join(" ")
					};
					doc.text.push(param.text);
					break;
				case "event"       : //事件函数
				case "example"     : //例子代码
				case "fileOverview": //Javascript文件总体描述
				case "ignore"      : //忽略有这个标记的函数
				case "link"        : //与其他JsDoc对象关联
				case "name"        : //显示声明JsDoc不能自动检测的对象
					console.log(arr[0]);
					break;
				case "namespace"   : //声明命名空间
					param = {
						"type"    : "param",
						"key"     : arr[0],
						"datatype": "",
						"name"    : "",
						"text"    : ""
					};
					break;
				case "param"       : //参数
					param = {
						"type"    : "param",
						"key"     : arr[0],  //param,return
						"datatype": arr[1].substring(1, arr[1].length - 1),
						"name"    : arr[2],
						"text"    : arr.slice(3).join(" ")
					};
					doc.hash[param.name] = param;
					break;
				case "private"     : //声明私有对象
				case "property"    : //显式声明一个属性
				case "public"      : //声明公开对象
				case "requires"    : //声明所依赖的对象或文件
				case "return"     :
				case "returns"     : //返回值
					param = {
						"type"    : "param",
						"key"     : arr[0],  //param,return
						"datatype": arr[1].substring(1, arr[1].length - 1),
						"name"    : "",
						"text"    : arr.slice(2).join(" ")
					};
					doc["return"] = param;
					break;
				case "see"         : //声明可参考的其它对象
				case "since"       : //声明对象从指定版本开始生效
				case "static"      : //显式声明一个静态对象
				case "throws"      : //声明函数执行过程中可能抛出的异常
				case "type"        : //声明变量类型或者函数返回值类型
				case "version"     : //版本号
				case "param":
				case "class":
				case "constructor":
				case "method":
					param = {
						"type"    : "param",
						"key"     : arr[0],
						"datatype": "",
						"name"    : arr[1],
						"text"    : ""
					};
					break;
				}
				doc.nodes.push(param);
			}else{
				doc.text.push(line.substr(p + 2));
			}
		}
		doc.text = doc.text.join("\n");
		return doc;
	};
	this.parseClass = function(){
		var _this = this;
		this._source.replace(re_class, function(_0, _1, _2){
			var c = {
				"type"  : "class",
				"access": "public",
				"name"  : _1,
				"super" : _2 == "null" ? "Object" : (_2 == "" ? "AObject" : _2),
				"index" : RegExp.leftContext.length + 1,
				"doc"   : "[doc]"
			};
			_this._meta[c.index] = c;
			_this._meta_class = c;
		});
	};
	this.parseMethods = function(){
		this._methods = [];
		var _this = this;
		this._source.replace(re_method, function(_0, _1, _2, _3){
			//_1 == 类名,静态方法
			var m = {
				"type"  : "method",
				"access": _2.charAt(0) == "_" ? "protected" : "public",
				"name"  : _2,
				"params": _3,
				"index" : RegExp.leftContext.length + 1,
				"doc"   : ""
			};
			_this._meta[m.index] = m;
			_this._methods.push(m);
		});
	};
	this.gen_html = function(){
		var sb = [];
		sb.push('<h1>Class ' + this._meta_class["name"] + '(' + this._meta_class["super"] + ')</h1>');
		sb.push('<div>');
		sb.push('<p>' + this._meta_class["doc"].text + '</p>');
		sb.push('</div>');
		sb.push(this.gen_html_methods());
		return sb.join("");
	};
	//生成方法列表
	this.gen_html_methods = function(){
		var sb = [], list = [];
		sb.push('<div>');
		sb.push('<h2>方法列表</h2>');
		sb.push('<table width="100%" border="1" bordercolor="gray" cellpadding="1">');
		sb.push('<tr><th width="70">访问权限</th><th width="100">方法名</th><th>参数</th></tr>');
		for(var i = 0, len = this._methods.length; i < len; i++){
			var method = this._methods[i];
			sb.push('<tr>');
			sb.push('<td align="right">' + method["access"] + '&nbsp;</td>');
			sb.push('<td title="' + method["index"] + '">' + method["name"] + '</td>');
			sb.push('<td>(' + method["params"] + ')</td>');
			sb.push('</tr>');
			list.push(this.gen_doc(method));
		}
		sb.push('</table>');
		sb.push('</div>');
		sb.push(list.join(""));
		return sb.join("");
	};
	//生成着色代码
	this.gen_html_color_code = function(){
		
	};
	this.gen_doc = function(method){
		//<p>' + (method["doc"] ? method["doc"].text : "") + '</p>
		var doc = method["doc"];
		var type;
		if(/^on[A-Z]/.test(method.name)){
			type = "事件";
		}else{
			type = "函数";
		}
		var sb = [];
		sb.push('<h1>' + method.name + ' ' + type + '</h1>');
		sb.push('<div>');
		sb.push('<h2>定义和用法</h2>');
		console.log(doc);
		sb.push('<p>' + (doc ? doc.text.replace(/\n/g, "<br />") : '<span style="color:red;">缺少方法功能描述</span>') + '</p>');
		sb.push('<h3>语法</h3>');
		sb.push('<pre>obj.' + method.name + '(');
		var s1 = [], s2 = [];
		if(method.params != ""){
			var params = method.params.replace(/ /g, "").split(",");
			for(var i = 0, len = params.length; i < len; i++){
				var pname = params[i];
				var para = {
					"name": pname,
					"type": "未知",
					"desc": '<span style="color:red;">缺少参数描述</span>'
				};
				if(typeof doc == "object" && pname in doc.hash){
					para.type = doc.hash[pname].datatype;
					para.desc = doc.hash[pname].text;
				}
				s1.push('<i>' + para.name + '</i>');
				s2.push('<tr>'
					+ '<td>' + para.name + '</td>'
					+ '<td>' + para.type + '</td>'
					+ '<td>' + para.desc + '</td>'
					+ '</tr>');
			}
		}
		sb.push(s1.join(", "));
		sb.push(')</pre>');
		if(s2.length > 0){
			sb.push('<table class="dataintable">');
			sb.push('<tr><th>参数</th><th>类型</th><th>描述</th></tr>');
			sb.push(s2.join(""));
			sb.push('</table>');
		}
		sb.push('<h3>返回值</h3>');
		var v = doc["return"];
		sb.push('<p>' + (v ? v.datatype + " " + v.text : "") + '</p>');
		sb.push('<h3>说明</h3>');
		sb.push('<p>' + '</p>');
		sb.push('</div>');
		return sb.join("");
	};
});