_package("alz.template");

_import("alz.template.TemplateElement");

/**
 * 一个模板对象
 * 1)支持xml语法
 * 2)支持模板变量
 * 3)支持数据绑定
 * 4)支持数据动态更新
 */
_class("TemplateObject", "", function(){
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
		this._elements = [];
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
	this.createElement = function(parent, element){
		var obj = this.node2element(this.getRoot(), element.getDoc(), element, this, function(type, el, name, value){
			if(!this.hasVar(value)) return;  //快速判断是否包含模板变量
			if(type == "attr" && name == "style"){
				var hash = this.parseStyle(value, true);
				for(var k in hash){
					this.createTplRef(element, "style", el, k, hash[k]);
				}
			}else{
				this.createTplRef(element, type, el, name, value);
			}
		});
		if(parent){
			parent.appendChild(obj);
		}
		return obj;
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
	this.render = function(parent, attributes){
		var el = new TemplateElement();
		this._elements.push(el);  //注册模板元素
		el.create(parent, this, attributes);
		return el;
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
	this.node2element = function(node, doc, element, agent, func){
		var el;
		switch(node.nodeType){
		case 1:  //NODE_ELEMENT
			var tagName = node.tagName;
			el = doc.createElement(tagName);
			var attributes = node.attributes;
			for(var i = 0, len = attributes.length; i < len; i++){
				var attr = attributes[i];
				var name = attr.nodeName;
				var value = attr.nodeValue;
				if(name == "container" && value == "true"){
					element._container = el;
					continue;
				}
				switch(name){
				case "_datasrc":
					break;
				case "_action":
				case "_tag":
				default:
					func.call(agent, "attr", el, name, value);
					if(name == "style"){
						var hash = this.parseStyle(value);
						for(var k in hash){
							el.style[k] = hash[k];
						}
					}else{
						el.setAttribute(name, value);
					}
					break;
				}
			}
			if(node.hasChildNodes()){
				var nodes = node.childNodes;
				for(var i = 0, len = nodes.length; i < len; i++){
					el.appendChild(this.node2element(nodes[i], doc, element, agent, func));
				}
			}
			break;
		case 3:  //NODE_TEXT
			var value = node.nodeValue;
			el = doc.createTextNode(value);
			func.call(agent, "text", el, "", value);
			break;
		case 4:  //NODE_CDATA_SECTION
			//var value = node.data;
			//el = doc.createCDATASection(value);
			//func.call(agent, "cdata", el, "", value);
			//sb.push("<![CDATA[" + value + "]]>");
			break;
		case 8:  //NODE_COMMENT
			//var value = node.data;
			//el = doc.createComment(value);
			//func.call(agent, "comment", el, "", value);
			//sb.push("<!--" + value + "-->");
			break;
		default:
			//runtime.warning("无法处理的nodeType" + node.nodeType + "\n");
			break;
		}
		return el;
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