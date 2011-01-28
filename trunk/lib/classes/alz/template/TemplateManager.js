_package("alz.template");

_import("alz.template.TrimPath");

/**
 * �ṩ��ģ�����ݵĹ���֧�֣�ʵ���˶Զ������͵�ǰ��ģ��Ĺ���ͷ�����ⲿ���ý�
 * �ڣ��ﵽ����ǰ�˿����������߼��ͽ���ĳ������롣
 *
 * [TODO]TrimPath ÿ���ظ�����ģ����������⻹û�н����
 *
 * ģ�������
 * html = �� HTML ����
 * tpl  = ���� /\{[\$=]\w+\}/ ����ļ���ģ��
 * asp  = �� ASP �﷨��ģ��
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
		this._templates = {};  //ģ��� "name":{tpl:"",func:null}
		this._func = null;
		this._trimPath = null;
		this._context = {  //[ֻ��]ģ������ĺ������õ������Ļ�������
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
				callback();  //ģ�������Ϻ�ִ�лص�����
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
	 * ʹ�ýű�����ԭʼ��ģ���ļ�
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
				window.alert("�Ҳ���ģ��� name ����");
			}
		}
		callback();
	};
	/**
	 * @param data {Array} �������͵�ģ���б�
	 * @param agent {Object} �ص��������
	 * @param fun {Function} �ص�����
	 */
	this.load = function(data, agent, fun){
		for(var i = 0, len = data.length; i < len; i++){
			/*
			var a = RE_TPL.exec(data[i]);
			if(a){
				this.addTemplate(a[1], a[2], data[i]);
			}else{
				window.alert("�Ҳ���ģ��� name ����");
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
	 * ���һ��ģ�嵽ģ���������
	 * @param name {String} ��ѡ��Ҫ��ӵ�ģ�������
	 * @param type {String} ��ѡ��ģ������ͣ��μ�˵��
	 * @param data {String} ��ѡ��ģ������
	 * @return {void} ԭʼ��ģ������
	 */
	this.addTemplate = function(name, type, data){
		if(this._templates[name]){
			window.alert("ģ�� " + name + " �Ѿ����ڣ�");
		}else{
			var tpl = {"name":name, "data":data, "type":type, "func": null};
			if(type == "asp"){  //html,tpl ����ģ�壬����Ҫ����
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
			window.alert("ģ�� " + name + " �Ѿ����ڣ�");
		}else{
			var template = {"name":name, "data":tpl, "type":type, "func": null};
			if(type == "asp"){  //html,tpl ����ģ�壬����Ҫ����
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
			window.alert("��ȷ��ģ��" + name + "�Ѿ�����");
		}else{
			switch(tpl.type){  //����ģ������ͣ�ʹ�ò�ͬ�ķ�ʽ���� HTML ����
			case "html":  //ֱ�����
				html = tpl.data;
				break;
			case "tpl":  //ʹ�������滻
				html = this.callTpl(tpl.data, arr[0]);
				break;
			case "asp":  //ִ�к�������
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
	 * ��ָ����DOMԪ������Ⱦһ��ģ�������
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
	 * ���ʹ��׷�ӷ�ʽ��Ҫ���ǣ�׷�ӵ�ģ���ǲ���_align="client"ͣ������壬�Ա���
	 * ����Ĳ��ֵ���������
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
	 * ��Ⱦָ����ģ������ݵ�Pane�����
	 * @param pane {Pane} Pane �������
	 * @param tplName ģ������
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
	 * ���ַ���ת���ɿ��Ա��ַ�����ʾ����(",')�������ѱ�ʾԭ���ַ���������ַ���
	 * @param str {String} Ҫת�����ַ�������
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
	 * ������ ASP �����ģ�����Ϊһ�� JS �����Ĵ�����ʽ
	 * @param code {String} ģ�������
	 * @param params {String} ģ����롰Ŀ�꺯���������б���ַ�����ʽ��ʾ
	 */
	this.parse = function(code, params){
		/*
		var tag0 = "<!" + "--%";
		var l0 = tag0.length;
		var p0 = code.indexOf(tag0, 0);
		var t0 = {"tag":tag0,"len":l0,"p":p0};
		*/
		var t0 = findTag(code, "start", 0);  //Ѱ�ҿ�ʼ��ǩ
		//dumpTag(t0);
		var tag1 = "%--" + ">";
		var l1 = tag1.length;
		var p1 = -l1;
		var t1 = {"tag":tag1,"len":l1,"p":p1};
		var sb = [];
		sb.push("function(" + (params || "") + "){");
		sb.push("\nvar __sb = [];");
		var bExp = false;  //�Ƿ����ڽ������ʽ
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
			t1 = findTag(code, "end", t0.p + t0.len);  //Ѱ�ҽ�����ǩ
			//dumpTag(t1);
			//t1.p = code.indexOf(t1.tag, t0.p + t0.len);
			if(t1.p != -1){
				switch(code.charAt(t0.p + t0.len)){
				case "!":  //��������
					if(!params){  //���������еĲ�����ȡ��ʽ
						bExp = false;
						sb[0] = code.substring(t0.p + t0.len + 1, t1.p - 1) + "{";  //�������������ķֺţ����滻�� "{"
					}
					break;
				case '=':  //������ʽ���ѱ��ʽ�Ľ�����浽 __sb ��
					bExp = true;
					var s = sb.pop();
					//��һ��������js���ʽ�Ĵ�����ӵ�ǰ��һ��__sb.push����������'var __sb = [];'���壩��
					//s = s.substr(0, s.length - 2)
					//	+ (sb.length <= 2 ? "" : " + ")
					//	+ code.substring(t0.p + t0.len + 1, t1.p)
					//	+ s.substr(s.length - 2);
					s = s.substr(0, s.length - 2)                     //��һ��__sbԪ�ز����֮ǰ�Ĳ���
						+ (s.charAt(s.length - 3) == "[" ? "" : " + ")  //�����������
						+ code.substring(t0.p + t0.len + 1, t1.p)       //���ʽ����
						+ s.substr(s.length - 2);                       //��һ��__sbԪ�ز����֮��Ĳ���
					sb.push(s);
					//sb.push("\n__sb.push(" + code.substring(t0.p + t0.len + 1, t1.p) + ");");
					break;
				default:  //��ͨ�Ĵ��룬���ֲ���
					bExp = false;
					sb.push(code.substring(t0.p + t0.len, t1.p));
					break;
				}
			}else{
				return "ģ���е�'" + t0.tag + "'��'" + t1.tag + "'��ƥ�䣡";
			}
			t0 = findTag(code, "start", t1.p + t1.len);  //Ѱ�ҿ�ʼ��ǩ
			//dumpTag(t0);
			//t0.p = code.indexOf(t0.tag, t1.p + t1.len);
		}
		if(t1.p + t1.len >= 0 && t1.p + t1.len < code.length){  //���������־֮��Ĵ���
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
						print("[error]" + tagName + "���������" + name+ "����(value=" + value + ")\n");
					}
				}else if(name.charAt(0) == "_"){
					print("[warning]" + tagName + "�����Զ�������" + name+ "=\"" + value + "\"\n");
				}else if(name == "style"){
					print("[warning]" + tagName + "��������" + name+ "=\"" + value + "\"\n");
				}else if(name.substr(0, 2) == "on"){
					print("[warning]" + tagName + "�����¼�����" + name+ "=\"" + value + "\"\n");
				}else if(!(name in this._att)){
					print("[error]" + tagName + "����δ֪����" + name+ "=\"" + value + "\"\n");
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
					//print("[warning]" + tagName + "�ǿձ�ǩ\n");
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
			//print("[warning]�޷������nodeType" + node.nodeType + "\n");
			break;
		}
		return sb.join("");
	};
});