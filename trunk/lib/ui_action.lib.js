/**
 * alzui-mini JavaScript Framework, v0.0.8
 * Copyright (c) 2009 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
(function(){with(runtime.createContext("ui_action")){

//import alz.mui.ThemeManager;
/*<file name="alz/mui/ActionManager.js">*/
_package("alz.mui");

_class("ActionManager", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._actionEngine = null;  //动作执行引擎，实现了doAction接口的类的实例
		this._actions = {};
	};
	this.init = function(actionEngine){
		this._actionEngine = actionEngine;
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var k in this._actions){
			for(var i = 0, len = this._actions[k].length; i < len; i++){
				this._actions[k][i] = null;  //再此无需调用 dispose 方法
			}
			delete this._actions[k];
		}
		this._actionEngine = null;
		_super.dispose.apply(this);
	};
	this.add = function(component){
		//var act = component._self.getAttribute("_action");
		var act = component.getAction();
		if(!this._actions[act]){
			this._actions[act] = [];
		}
		this._actions[act].push(component);
	};
	/*this.enable = function(action){
		var nodes = this._actions[action];
		if(!nodes) return;
		for(var i = 0, len = nodes.length; i < len; i++){
			nodes[i].setDisabled(false);
		}
		nodes = null;
	};*/
	this.enable = function(action){
		this.updateState(action, {"disabled":false});
	};
	this.disable = function(action){
		this.updateState(action, {"disabled":true});
	};
	this.updateState = function(action, state){
		if(action){
			this.update(action, state);
		}else{
			for(var k in this._actions){
				this.update(k, state);
			}
		}
	};
	this.multipleUpdateState = function(actions){
		for(var k in actions){
			this.update(k, actions[k]);
		}
	};
	this.update = function(action, state){
		var nodes = this._actions[action];
		if(!nodes) return;
		for(var i = 0, len = nodes.length; i < len; i++){
			for(var k in state){  //visible,disabled
				var name = "set" + k.charAt(0).toUpperCase() + k.substr(1);
				if(name in nodes[i]) nodes[i][name](state[k]);
			}
		}
		nodes = null;
	};
	this.dispatchAction = function(action, sender, ev){
		if(this._actionEngine.doAction){
			return this._actionEngine.doAction(action, sender, ev);
		}
	};
});
/*</file>*/
/*<file name="alz/template/TemplateManager.js">*/
_package("alz.template");

_import("alz.template.TrimPath");

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
_class("TemplateManager", "", function(_super){
	//var RE_TPL = /<!-- template name=\"(\w+\.tpl)\" type=\"(html|tpl|asp)\"( title=\"[^\"]+\")* -->/;
	var RE_TPL = /<template name=\"(\w+\.tpl)\" type=\"(html|tpl|asp|tmpl|xml)\"(?: params=\"([^\"]+)\")*( title=\"[^\"]+\")*>/;
	function str2xmldoc(str){
		var xmldoc;
		if(runtime.ie){
			xmldoc = runtime.createComObject("Msxml.DOMDocument");
			xmldoc.async = false;
			xmldoc.loadXML(str);
		}else{
			xmldoc = (new DOMParser()).parseFromString(str, "text/xml");
		}
		return xmldoc;
	}
	this._init = function(){
		_super._init.call(this);
		this._path = "";
		this._templates = {};  //模板库 "name":{tpl:"",func:null}
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
		for(var k in this._templates){
			this._templates[k].data = null;
			this._templates[k].func = null;
			delete this._templates[k];
		}
		_super.dispose.apply(this);
	};
	this.load1 = function(tpls, callback){
		var i = 0;
		var _this = this;
		function cb(data){
			_this.addTemplate(tpls[i], "asp", data);
			i++;
			if(i < tpls.length){
				window.setTimeout(function(){
					runtime.getAjax().netInvoke("GET", _this._path + tpls[i], "", "text", cb);
				}, 0);
			}else{
				callback();  //模板加载完毕后，执行回调函数
			}
		}
		runtime.getAjax().netInvoke("GET", this._path + tpls[i], "", "text", cb);
	};
	this.load2 = function(tpls, callback){
		var arr = $("tpldata").innerHTML.split("$$$$");
		for(var i = 0, len = arr.length; i < len; i++){
			this.addTemplate(tpls[i], "asp", arr[i]);
		}
		callback();
	};
	/**
	 * 使用脚本解析原始的模版文件
	 */
	this.load3 = function(tplData, callback){
		var arr = tplData.split("$$$$");
		for(var i = 0, len = arr.length; i < len; i++){
			/*
			if(runtime.opera){
				arr[i] = runtime.decodeHTML(arr[i]);
			}
			*/
			var a = RE_TPL.exec(arr[i]);
			if(a){
				this.addTemplate(a[1], a[2], arr[i]);
			}else{
				window.alert("找不到模板的 name 属性");
			}
		}
		callback();
	};
	/**
	 * @param data {Array} 数组类型的模板列表
	 * @param agent {Object} 回调代理对象
	 * @param fun {Function} 回调函数
	 */
	this.load = function(data, agent, fun){
		for(var i = 0, len = data.length; i < len; i++){
			/*
			var a = RE_TPL.exec(data[i]);
			if(a){
				this.addTemplate(a[1], a[2], data[i]);
			}else{
				window.alert("找不到模板的 name 属性");
			}
			*/
			this.addTemplate1(data[i]);
		}
		fun.call(agent);
	};
	this.loadData = function(url, agent, funName){
		runtime.getAjax().netInvoke("POST", url, "", "json", this, function(json){
			this.load(json, this, function(){
				funName.apply(agent);
			});
		});
	};
	/**
	 * 添加一个模板到模板管理类中
	 * @param name {String} 必选，要添加的模板的名称
	 * @param type {String} 必选，模板的类型，参见说明
	 * @param data {String} 必选，模板内容
	 * @return {void} 原始的模板内容
	 */
	this.addTemplate = function(name, type, data){
		if(this._templates[name]){
			window.alert("模板 " + name + " 已经存在！");
		}else{
			var tpl = {"name":name, "data":data, "type":type, "func": null};
			if(type == "asp"){  //html,tpl 类型模板，不需要编译
				with(this._context){
					eval("var func = " + this.parse(data) + ";");
				}
				tpl.func = func;
			}
			this._templates[name] = tpl;
		}
	};
	this.addTemplate1 = function(data){
		var name = data.name;
		var type = data.type;
		var tpl = data.tpl;
		if(this._templates[name]){
			window.alert("模板 " + name + " 已经存在！");
		}else{
			var template = {"name":name, "data":tpl, "type":type, "func": null};
			if(type == "asp"){  //html,tpl 类型模板，不需要编译
				with(this._context){
					eval("var func = " + this.parse(tpl, data.params) + ";");
				}
				template.func = func;
			}
			this._templates[name] = template;
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
	this.getTemplate = function(name){
		if(this._templates[name].type == "xml"){
			return str2xmldoc(this._templates[name].data);
		}else{
			return this._templates[name].data;
		}
	};
	this.invoke = function(name){
		var arr = [];
		for(var i = 1, len = arguments.length; i < len; i++){
			arr.push(arguments[i]);
		}
		var html, tpl = this._templates[name];
		if(!tpl){
			window.alert("请确认模板" + name + "已经存在");
		}else{
			switch(tpl.type){  //根据模板的类型，使用不同的方式生成 HTML 代码
			case "html":  //直接输出
				html = tpl.data;
				break;
			case "tpl":  //使用正则替换
				html = this.callTpl(tpl.data, arr[0]);
				break;
			case "asp":  //执行函数调用
				html = this._templates[name].func.apply(null, arr);
				break;
			case "tmpl":
				html = this._trimPath.parseTemplate(this._templates[name].data).process(arguments[1]);
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
		var arr = [];
		for(var i = 1, len = arguments.length; i < len; i++){
			arr.push(arguments[i]);
		}
		element.innerHTML = this.invoke.apply(this, arr);  //arr[0] = tplName;
	};
	/**
	 * 如果使用追加方式需要考虑，追加的模版是不是_align="client"停靠的面板，以便于
	 * 方便的布局的正常工作
	 */
	this.render2 = function(element, tplName){
		var arr = [];
		for(var i = 1, len = arguments.length; i < len; i++){
			arr.push(arguments[i]);
		}
		var tpl = this.invoke.apply(this, arr);  //arr[0] = tplName;
		element.appendChild(runtime.createDomElement(tpl));
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
	function dumpTag(t){
		alert(t.tag + "," + t.len + "," + t.p);
	}
	function findTag(code, t, start){  //indexOf
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
			return {"tag":"#tag#","len":0,"p":-1};
		}else{
			return t;
		}
	}
	/**
	 * 将字符串转换成可以被字符串表示符号(",')括起来已表示原来字符串意义的字符串
	 * @param str {String} 要转换的字符串内容
	 */
	this.toJsString = function(str){
		if(typeof(str) != "string") return "";
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
		var t0 = findTag(code, "start", 0);  //寻找开始标签
		//dumpTag(t0);
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
			t1 = findTag(code, "end", t0.p + t0.len);  //寻找结束标签
			//dumpTag(t1);
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
			t0 = findTag(code, "start", t1.p + t1.len);  //寻找开始标签
			//dumpTag(t0);
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
					print("[warning]" + tagName + "含有自定义属性" + name+ "=\"" + value + "\"\n");
				}else if(name == "style"){
					print("[warning]" + tagName + "含有属性" + name+ "=\"" + value + "\"\n");
				}else if(name.substr(0, 2) == "on"){
					print("[warning]" + tagName + "含有事件代码" + name+ "=\"" + value + "\"\n");
				}else if(!(name in this._att)){
					print("[error]" + tagName + "含有未知属性" + name+ "=\"" + value + "\"\n");
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
					//print("[warning]" + tagName + "是空标签\n");
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
			//print("[warning]无法处理的nodeType" + node.nodeType + "\n");
			break;
		}
		return sb.join("");
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
_class("TrimPath", "", function(_super){
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
			content = element.innerHTML; // Like textarea.innerHTML.
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
		this.statementDef = { // Lookup table for statement tags.
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
_class("Template", "", function(_super){
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
			func = null;
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
				var blockrx = stmt.match(/^\{(cdata|minify|eval)/); // From B. Bittman, minify/eval/cdata implementation.
				if(blockrx){
					var blockType = blockrx[1];
					var blockMarkerBeg = begStmt + blockType.length + 1;
					var blockMarkerEnd = this._source.indexOf('}', blockMarkerBeg);
					if(blockMarkerEnd >= 0){
						var blockMarker;
						if( blockMarkerEnd - blockMarkerBeg <= 0 ){
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
			var endStmt = this._source.indexOf("}", begStmt + 1); // In "a{for}c", endStmt will be 5.
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
		var stmt = this._etc.statementDef[parts[0]]; // Here, parts[0] == for/if/else/...
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
			var s = text.substring(0, nlPrefix).replace('\n', '\\n'); // A macro IE fix from BJessen.
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
			var begExpr = line.indexOf(begMark, endExprPrev + endMarkPrev.length); // In "a${b}c", begExpr == 1
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
		var expr = exprArr[index]; // Ex: exprArr == [firstName,capitalize,default:"John Doe"]
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
			.replace(/^(\s*\S*(\s+\S+)*)\s*$/, "$1"); // Right trim by Igor Poteryaev.
	};
});
/*</file>*/
/*<file name="alz/template/ParseError.js">*/
_package("alz.template");

_class("ParseError", "", function(_super){
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
//import alz.mui.Component;
/*<file name="alz/action/ActionElement.js">*/
_package("alz.action");

_import("alz.mui.Component");

_class("ActionElement", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._actionManager = null;
		this._action = "";
		this._disabled = false;
	};
	this.init = function(obj, actionManager){
		_super.init.apply(this, arguments);
		this._actionManager = actionManager;
		this._self.style.position = "";
		this._disabled = this._self.getAttribute("_disabled") == "true";
		this._action = this._self.getAttribute("_action");
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
	this.getAction = function(){
		return this._action;
	};
	this.setAction = function(v){
		this._action = v;
	};
	this.getDisabled = function(){
		return this._disabled;
	};
	this.setDisabled = function(v){
		if(this._disabled == v) return;
		this._disabled = v;
		if(this._self){
			this._self.disabled = v;
		}
	};
	this.dispatchAction = function(sender, ev){
		if(this._disabled) return false;
		//if(this._self.tagName == "INPUT" && this._self.type == "checkbox"){
		//onDispatchAction可以用来记录用户的完整的行为，并对此进行“用户行为分析”
		if(typeof this.onDispatchAction == "function"){
			this.onDispatchAction(action, sender, ev);
		}
		if(this._className == "CheckBox"){
			this._actionManager.dispatchAction(this._action[sender.checked ? 0 : 1], sender, ev);
		}else{
			return this._actionManager.dispatchAction(this._action, sender, ev);
		}
	};
});
/*</file>*/
/*<file name="alz/action/LinkLabel.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

_class("LinkLabel", ActionElement, function(_super){
	this.init = function(obj){
		_super.init.apply(this, arguments);
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
});
/*</file>*/
/*<file name="alz/action/Button.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

_class("Button", ActionElement, function(_super){
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onclick = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
		/*
		var rows = this._self.rows;
		for(var i = 0, len = rows.length; i < len; i++){
			rows[i].onmouseover = function(){if(_this._disabled) return; this.className = "onHover";};
			rows[i].onmouseout = function(){if(_this._disabled) return; this.className = "normal";};
		}
		rows = null;
		*/
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
	this.setDisabled = function(v){
		if(this._disabled == v) return;
		this._disabled = v;
		if(this._self){
			this._self.disabled = v;
			this._self.style.color = v ? "gray" : "";
			//this._self.rows[0].className = v ? "OnDisable" : "normal";
			/*if(v){
				var btn = this._self.getElementsByTagName("div")[0];
				if(btn) btn.style.backgroundImage = "url(http://www.sinaimg.cn/rny/sinamail421/images/comm/icon_btn.gif)";
				btn = null;
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

_class("CheckBox", ActionElement, function(_super){
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._action = this._action.split("|");
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
});
/*</file>*/
/*<file name="alz/action/ComboBox.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

_class("ComboBox", ActionElement, function(_super){
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
});
/*</file>*/
/*<file name="alz/action/FormElement.js">*/
_package("alz.action");

_import("alz.action.ActionElement");

_class("FormElement", ActionElement, function(_super){
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onsubmit = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onsubmit = null;
		_super.dispose.apply(this);
	};
	this.resetSelf = function(){
		this._self.reset();
	};
});
/*</file>*/
//import alz.mui.Pane;
/*<file name="alz/core/Application_action.js">*/
_package("alz.core");

_extension("Application", function(){  //注册 Application 扩展(action)
	this._init = function(){
		this._actionManager = null;
	};
	this.init = function(){
		this._actionManager = new ActionManager();
		this._actionManager.init();
	};
	this.dispose = function(){
		this._actionManager.dispose();
		this._actionManager = null;
	};
	//实现动作接口: {initActionElements:null,doAction:null}
	this.initActionElements = function(element, owner){
		element = element || (this._contentPane ? this._contentPane._self : window.document);
		owner = owner || this;
		function onAction(ev){
			alert(123);
			ev = ev || window.event;
			var ret = owner.doAction(this.getAttribute("_action"), this);
			ev.cancelBubble = true;
			return ret;
		}
		var tags = ["a", "input", "form", "select"];
		for(var i = 0, len = tags.length; i < len; i++){
			var nodes = element.getElementsByTagName(tags[i]);
			for(var j = 0, len1 = nodes.length; j < len1; j++){
				var action = nodes[j].getAttribute("_action");
				if(action){
					switch(tags[i]){
					case "a":
						nodes[j].onclick = onAction;
						break;
					case "input":
						if(nodes[j].type == "button" || nodes[j].type == "submit" || nodes[j].type == "reset" || nodes[j].type == "checkbox"){
							nodes[j].onclick = onAction;
						}
						break;
					case "form":
						nodes[j].onsubmit = onAction;
						break;
					case "select":
						nodes[j].onchange = onAction;
						break;
					}
				}
			}
			nodes = null;
		}
	};
	this.doAction = function(action, sender){
	};
});
/*</file>*/

runtime.regLib("ui_action", function(){  //加载之后的初始化工作

});

}})(this);