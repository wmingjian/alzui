_package("alz.template");

/**
 * 通过模板创建的DOM元素(可以包含子节点)
 */
_class("TemplateElement", "", function(){
	var RE_TVAR = /\{\$(\w+)\}/g;  //模板变量语法
	this._init = function(){
		_super._init.call(this);
		this._tpldoc = null;  //所属文档对象
		this._tplobj = null;  //元素创建时参照的模板对象
		this._confStack = null;  //TagConf堆栈
		this._component = null;  //对应的组件实例
		this._self = null;    //关联的DOM元素
		this._container = null;
		this._vars = {};    //所有的模板变量(key关联DOM更新信息)
		this._attributes = null;
		this._hash = null;  //批量更新临时存储
	};
	/**
	 * [TODO]存在子类化问题
	 * panemain 继承自 pane 组件，所以 pane 需要使用 PaneMain 类来实例化
	 */
	this.create = function(tpldoc, tagConf, xmlNode, clazz){
		var tplobj = tagConf.tplobj;
		var tagName = xmlNode.tagName;
		this._confStack = tpldoc.getStack(tagConf);
		this._tpldoc = tpldoc;
		this._tplobj = tplobj;
		this._attributes = tpldoc.getAttrs(xmlNode);
		tplobj.regTplEl(this);  //注册模板元素
		clazz = clazz || tagConf.getClass(xmlNode.getAttribute("clazz"));
		var obj = tpldoc.createElementByXmlNode(this, tplobj.getRoot(), this._confStack, {
			"xmlnode": xmlNode,
			"clazz": clazz,
			"tplel": clazz ? this : null
		});
		tpldoc._node.appendChild(obj);
		this.init(obj);
		this.update(this._attributes);  //应用attributes
		if(clazz){
			//console.log("build <" + tagName + "> " + clazz.__cls__._fullName);
			var c = new clazz();
			if(c.setApp) c.setApp(tpldoc._app);
			c.build(this);
			this._component = c;
		}
		return obj;
	};
	this.init = function(obj){
		obj._ptr = this;
		this._self = obj;
	};
	this.dispose = function(){
		this._hash = null;
		this._attributes = null;
		for(var k in this._vars){
			var v = this._vars[k];
			var refs = v.refs;
			for(var i = 0, len = refs.length; i < len; i++){
				var ref = refs[i];
				ref.el = null;  //断开DOM元素的引用关系
				ref.val = null;
				refs[i] = null;
			}
			v.refs = null;
			v.value = "";
			delete this._vars[k];
		}
		this._tplobj = null;
		this._self._ptr = null;
		this._self = null;
		this._component = null;
		this._confStack = null;
		this._tpldoc = null;
		_super.dispose.apply(this);
	};
	this.getTplObj = function(){
		return this._tplobj;
	};
	this.setTplObj = function(v){
		this._tplobj = v;
	};
	this.getTplDoc = function(){
		return this._tpldoc;
	};
	this.onAttr = function(type, el, name, value){
		this._tplobj.onAttr(this, type, el, name, value);
	};
	/**
	 * 添加一个模板变量引用
	 * [TO-DO]如何区分不用实例的模板变量引用
	 */
	this.addRef = function(name, ref){
		if(!(name in this._vars)){
			this._vars[name] = {  //{TplVarRef}
				"id"   : name,  //变量名
				"value": "",    //变量值(默认字符串类型)
				"refs" : []     //引用该变量的节点列表
			};
		}
		this._vars[name].refs.push(ref);
		//this._tplobj.addRef(name, ref);
	};
	this.updateBegin = function(){
		this._hash = {};
	};
	this.add = function(key, value){
		this._hash[key] = value;
	};
	this.updateEnd = function(){
		this.update(this._hash);
		this._hash = null;
	};
	/**
	 * 更新一组模版变量的值
	 */
	this.update = function(attributes){
		for(var k in attributes){
			var v = attributes[k];
			if(k in this._vars){
				this._setVar(k, v, attributes);
			}else{
				//console.log("[TemplateElement::update]有多余字段" + k);
			}
		}
	};
	/**
	 * 更新一个模版变量的值
	 */
	this._setVar = function(key, value, attributes){
		var v = this._vars[key];
		v.value = value;  //[TODO]需要检查和原值是否相等，避免重复更新
		var refs = v.refs;
		for(var i = 0, len = refs.length; i < len; i++){
			var ref = refs[i];
			switch(ref.type){
			case "attr":  //属性值
				ref.el.setAttribute(ref.name, this._calcValue(ref.val, attributes));
				break;
			case "text":  //文本节点
				ref.el.nodeValue = this._calcValue(ref.val, attributes);
				break;
			case "style":  //css属性值
				ref.el.style[ref.name] = this._calcCssValue(ref, attributes);
				break;
			}
		}
	};
	this._calcValue = function(val, attributes){
		return val.value.replace(RE_TVAR, function(_0, key){
			return attributes[key];
		});
	};
	this._calcCssValue = function(ref, attributes){
		return ref.val.value.replace(RE_TVAR, function(_0, key){
			var value = attributes[key];
			switch(typeof value){
			case "boolean":
				switch(ref.name){
				case "display": value = value ? "" : "none";
				}
				break;
			}
			return value;
		});
	};
});