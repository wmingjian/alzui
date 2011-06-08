_package("alz.template");

/**
 * 通过模板创建的DOM元素(可以包含子节点)
 */
_class("TemplateElement", "", function(){
	var RE_TVAR = /\{\$(\w+)\}/g;  //模板变量语法
	this._init = function(){
		_super._init.call(this);
		this._doc  = document;  //所属文档对象
		this._self = null;  //关联的DOM元素
		this._container = null;
		//this._tpl  = null;  //元素创建时参照的模板对象
		this._vars = {};    //所有的模板变量(key关联DOM更新信息)
		this._hash = null;  //批量更新临时存储
	};
	this.create = function(parent, tpl, argv){
		//this._tpl = tpl;
		var obj = tpl.createElement(parent, this);
		this.init(obj);
		this.update(argv);  //应用argv参数
		return obj;
	};
	this.init = function(obj){
		obj._ptr = this;
		this._self = obj;
	};
	this.dispose = function(){
		this._hash = null;
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
		//this._tpl = null;
		this._self._ptr = null;
		this._self = null;
		this._doc = null;
		_super.dispose.apply(this);
	};
	this.getDoc = function(){
		return this._doc;
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
		//this._tpl.addRef(name, ref);
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
	this.update = function(data){
		for(var k in data){
			var v = data[k];
			if(k in this._vars){
				this._setVar(k, v, data);
			}else{
				console.log("[TemplateElement::update]有多余字段" + k);
			}
		}
	};
	/**
	 * 更新一个模版变量的值
	 */
	this._setVar = function(key, value, hash){
		var v = this._vars[key];
		v.value = value;  //[TODO]需要检查和原值是否相等，避免重复更新
		var refs = v.refs;
		for(var i = 0, len = refs.length; i < len; i++){
			var ref = refs[i];
			switch(ref.type){
			case "attr":  //属性值
				ref.el.setAttribute(ref.name, this._calcValue(ref.val, hash));
				break;
			case "text":  //文本节点
				ref.el.nodeValue = this._calcValue(ref.val, hash);
				break;
			case "style":  //css属性值
				ref.el.style[ref.name] = this._calcCssValue(ref, hash);
				break;
			}
		}
	};
	this._calcValue = function(val, hash){
		return val.value.replace(RE_TVAR, function(_0, key){
			return hash[key];
		});
	};
	this._calcCssValue = function(ref, hash){
		return ref.val.value.replace(RE_TVAR, function(_0, key){
			var value = hash[key];
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