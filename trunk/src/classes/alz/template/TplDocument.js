_package("alz.template");

/**
 * 基于模板的文档对象
 */
_class("TplDocument", "", function(){
	function str2hash(str, sep){
		var hash = {};
		var arr = str.split(sep || ",");
		for(var i = 0, len = arr.length; i < len; i++){
			hash[arr[i]] = true;
		}
		return hash;
	}
	this._htmlTags = str2hash("a,-address,-applet,-area,"
		+ "b,-base,-basefont,-bgsound,-big,blockquote,-body,-br,button,"
		+ "caption,-center,cite,code,-col,-colgroup,-comment,"
		+ "dd,-dfn,-dir,div,dl,dt,"
		+ "em,-embed,"
		+ "fieldset,-font,form,-frame,-frameset,"
		+ "h1,h2,h3,h4,h5,h6,-head,-hr,-html,"
		+ "i,-iframe,img,input,"
		+ "-kbd,"
		+ "label,legend,li,-link,-listing,"
		+ "-map,-marquee,-menu,-meta,"
		+ "-nobr,-noframes,-noscript,"
		+ "-object,ol,option,"
		+ "p,-param,-plaintext,pre,"
		+ "-s,-samp,-script,select,-small,span,-strike,strong,-style,sub,sup,"
		+ "table,tbody,td,textarea,tfoot,th,thead,-title,tr,-tt,"
		+ "u,ul,"
		+ "-var,-wbr,-xmp"
	);
	this._init = function(parent, app){
		this._app = app || null;
		this._doc = document;
		this._stack = [parent];
		this._node = parent;
		this._all = {};
	};
	this.dispose = function(){
		for(var k in this._all){
			delete this._all[k];
		}
		this._node = null;
		if(this._stack.length != 0){
			runtime.log("[TplDocument::dispose]this._stack.length != 0");
		}
		this._doc = null;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.getActiveNode = function(){
		return this._node;
	};
	this.push = function(v){
		this._stack.push(v);
		this._node = v;
	};
	this.pop = function(){
		this._stack.pop();
		this._node = this._stack[this._stack.length - 1];
	};
	this.$ = function(id){
		return id in this._all ? (this._all[id]._component ? this._all[id]._component : this._all[id]) : null;
	};
	this.createElement = function(tag){
		if(tag == undefined){
			console.log("[TplDocument::createElement]" + tag);
		}
		return this._doc.createElement(tag);
	};
	this.createTextNode = function(data){
		return this._doc.createTextNode(data);
	};
	this.createCDATASection = function(data){
		return this._doc.createCDATASection(data);
	};
	this.createComment = function(data){
		return this._doc.createComment(data);
	};
	/*
	this.render = function(parent, attributes){
		return this.createTplElement(...);
	};
	*/
	this.getAttrs = function(xmlnode){
		var attributes = {};
		var attrs = xmlnode.attributes;
		for(var i = 0, len = attrs.length; i < len; i++){
			var attr = attrs[i];
			var name = attr.nodeName;
			var value = attr.nodeValue;
			attributes[name] = value;
		}
		return attributes;
	};
	this.getAttrsList = function(stack){
		var attributes = {};
		for(var i = stack.length - 1; i >= 0; i--){
			var attrs = stack[i].tplobj.getRoot().attributes;
			for(var j = 0, len1 = attrs.length; j < len1; j++){
				var attr = attrs[j];
				var name = attr.nodeName;
				var value = attr.nodeValue;
				attributes[name] = value;
			}
		}
		return attributes;
	};
	this.createTplElement2 = function(parent, tpl, argv){
		var template = this._app.getTpl(tpl);
		var tag = template.tplobj._tag;
		var conf = this._app._taglib.getTagConf(tag);
		if(!conf){
			console.error("[TplDocument::createTplElement2]tag error(" + tag + ")");
			return null;
		}
		if(parent.getContainer){
			parent = parent.getContainer();
		}
		this.push(parent);  //设置当前父节点
		var tplEl = this.createTplElement(conf, template.tplobj.getRoot(), argv);
		this.pop();
		return tplEl;
	};
	this.createTplElement = function(tagConf, xmlNode, argv){
		var tplEl = new TemplateElement();
		tplEl.create(this, tagConf, xmlNode);
		var c = tplEl._component;
		if(argv && c){
			c.create2.apply(c, argv);
			c.init(c._self);
			if(c.rendered){
				c.rendered();
			}
		}
		return tplEl;
	};
	this.createAdvTag = function(tagConf, xmlNode){
		var tplEl = this.createTplElement(tagConf, xmlNode);
		var attributes = tplEl._attributes;  //id,class,dock
		if(attributes.id){
			this._all[attributes.id] = tplEl;  //注册TplElement
			tplEl._self.setAttribute("id", attributes.id);
		}
		if(attributes["class"]){
			runtime.dom.addClass(tplEl._container, attributes["class"]);
		}
		return tplEl;
	};
	this.createHtmlTag = function(tagName, xmlnode, attrs, tplEl){
		var tmpEl = {  //临时的假的TplElement对象
			"_component": null,
			"_self"     : null,
			"_container": null
		};
		var node = tmpEl._container = this.createElement(tagName);
		for(var k in attrs){
			var value = attrs[k];
			if(tplEl){  //如果需要细化属性内容？
				if(k == "container" && value == "true"){
					tplEl._container = node;
					continue;
				}
				switch(k){
				case "_datasrc":
				case "_action":
				case "_tag":
				default:
					tplEl.onAttr("attr", node, k, value);
					if(k == "style"){
						var hash = tplEl.getTplObj().parseStyle(value);
						for(var k in hash){
							node.style[k] = hash[k];
						}
					}else{
						node.setAttribute(k, value);
					}
					break;
				}
			}else{
				node.setAttribute(k, value);
			}
		}
		tmpEl._self = this._node.appendChild(node);
		return tmpEl;
	};
	this.createNode = function(tplEl, xmlnode, stack, proto){
		var tmpEl;
		if(stack && stack.length > 1){
			var node = stack[stack.length - 1].tplobj.getRoot();
			var attrs = this.getAttrsList(stack);
			tmpEl = this.createHtmlTag(node.tagName, node, attrs, tplEl);
			//遍历原型子节点
			if(xmlnode.hasChildNodes()){
				this.push(tmpEl._container);
				var nodes = xmlnode.childNodes;
				for(var i = 0, len = nodes.length; i < len; i++){
					this.createElementByXmlNode(tplEl, nodes[i]);
				}
				this.pop();
			}
		}else{
			var tagName = xmlnode.tagName;
			var conf = this._app._taglib.getTagConf(tagName);
			if(conf){
				tmpEl = this.createAdvTag(conf, xmlnode, {
					"proto"  : proto,
					"clazz"  : proto ? proto.clazz : null
				});
			}else if(tagName in this._htmlTags){
				var attrs = this.getAttrs(xmlnode);
				tmpEl = this.createHtmlTag(tagName, xmlnode, attrs, tplEl);
				//遍历原型子节点
				if(xmlnode.hasChildNodes()){
					this.push(tmpEl._container);
					var nodes = xmlnode.childNodes;
					for(var i = 0, len = nodes.length; i < len; i++){
						this.createElementByXmlNode(tplEl, nodes[i]);
					}
					this.pop();
				}
			}else{
				console.error("---- unknown tag " + tagName);
			}
		}
		//此时当前TplElement已创建完毕
		//遍历实例子节点
		if(proto && proto.xmlnode.hasChildNodes()){
			this.push(tplEl._container);
			var nodes = proto.xmlnode.childNodes;
			for(var i = 0, len = nodes.length; i < len; i++){
				this.createElementByXmlNode(tplEl, nodes[i]);
			}
			this.pop();
		}
		if(tmpEl._component && tmpEl._component.rendered){
			tmpEl._component.rendered();
		}
		return tmpEl._self;
	};
	this.createElementByXmlNode = function(tplEl, xmlnode, stack, proto){
		var node;
		switch(xmlnode.nodeType){
		case 1:  //NODE_ELEMENT
			node = this.createNode(tplEl, xmlnode, stack, proto);
			break;
		case 3:  //NODE_TEXT
			var value = xmlnode.nodeValue;
			node = this.createTextNode(value);
			if(tplEl){
				tplEl.onAttr("text", node, "", value);
			}
			this._node.appendChild(node);
			break;
		case 4:  //NODE_CDATA_SECTION
			var value = xmlnode.data;
			node = this.createCDATASection(value);
			/*
			if(tplEl){
				tplEl.onAttr("cdata", node, "", value);
			}
			*/
			this._node.appendChild(node);
			break;
		case 8:  //NODE_COMMENT
			//var value = xmlnode.data;
			//node = this.createComment(value);
			/*
			if(tplEl){
				tplEl.onAttr("comment", node, "", value);
			}
			*/
			//this._node.appendChild(node);
			break;
		default:
			//runtime.warning("无法处理的nodeType" + xmlnode.nodeType + "\n");
			break;
		}
		return node;
	};
	this.getStack = function(tagconf){
		var stack = [];
		var conf = tagconf;
		for(;;){
			stack.push(conf);
			if(conf.tag in this._htmlTags) break;  //找到html标签则退出
			conf = this._app._taglib.getTagConf(conf.tag);
		}
		return stack;
	};
});