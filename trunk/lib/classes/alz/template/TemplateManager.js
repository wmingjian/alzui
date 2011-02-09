_package("alz.template");

_import("alz.template.TrimPath");
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
_class("TemplateManager", "", function(){
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
	 * @param data {Array} 数组类型的模板列表
	 * @param agent {Object} 回调代理对象
	 * @param fun {Function} 回调函数
	 * /
	this.load = function(data, agent, fun){
		this.appendItems(data);
		fun.call(agent);
	};
	this.loadData = function(url, agent, funName){
		new Ajax().netInvoke("POST", url, "", "json", this, function(json){
			this.load(json, this, function(){
				funName.apply(agent);
			});
		});
	};
	*/
	/**
	 * 添加一个模板到模板管理类中
	 * @param name {String} 必选，要添加的模板的名称
	 * @param type {String} 必选，模板的类型，参见说明
	 * @param data {String} 必选，模板内容
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
			switch(tpl.type){  //根据模板的类型，使用不同的方式生成 HTML 代码
			case "html":  //直接输出
				html = tpl.data;
				break;
			case "tpl":  //使用正则替换
				html = this.callTpl(tpl.data, arguments[1]);
				break;
			case "asp":  //执行函数调用
				var arr = Array.prototype.slice.call(arguments, 1);
				html = this._hash[name].func.apply(null, arr);
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
	 * @param element {HTMLElement}
	 * @param tplName {String}
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
	 * @param pane {Pane} Pane 类型组件
	 * @param tplName 模板名字
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
	 * @param str {String} 要转换的字符串内容
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
	 * @param code {String} 模板的内容
	 * @param params {String} 模板编译“目标函数”参数列表的字符串形式表示
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
		nodes = null;
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
				nodes = null;
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