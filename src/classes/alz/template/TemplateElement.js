_package("alz.template");

/**
 * 通过模板创建的DOM元素(可以包含子节点)
 */
_class("TemplateElement", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._tpl  = null;  //元素创建时参照的模板对象
		this._doc  = document;
		this._self = null;
		this._vars = {};  //所有的key关联DOM更新信息
	};
	this.create = function(tpl, argv){
		this._tpl = tpl;
		var obj = this._tpl.node2element(tpl.getRoot(), this._doc, this, function(type, el, name, value){
			var val = this._tpl.parseValue(value);
			var ref = {
				"type": type,  //位置类型(attr=属性值,text=文本节点)
				"el"  : el,    //所属元素(保存引用以备更新之用)
				"name": name,  //属性名
				"val" : val    //属性值
			};
			for(var key in val.vars){
				this.addRef(key, ref);
			}
		});
		//应用argv参数
		this._self = obj;
		this.update(argv);
		return obj;
	};
	this.dispose = function(){
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
		this._self = null;
		this._doc = null;
		this._tpl = null;
		_super.dispose.apply(this);
	};
	/**
	 * [TO-DO]如何区分不用实例的模板变量引用
	 */
	this.addRef = function(name, ref){
		if(!(name in this._vars)){
			this._vars[name] = {
				"id"   : name,  //变量名
				"value": "",    //变量值(默认字符串类型)
				"refs" : []     //引用该变量的节点列表
			};
		}
		this._vars[name].refs.push(ref);
		//this._tpl.addRef(name, ref);
	};
	this.update = function(data){
		for(var k in data){
			var v = data[k];
			if(k in this._vars){
				this.setValue(k, v, data);
			}else{
				console.log("[TemplateElement::update]有多余字段" + k);
			}
		}
	};
	this.setValue = function(key, value, hash){
		var v = this._vars[key];
		v.value = value;  //[TODO]需要检查和原值是否相等，避免重复更新
		var refs = v.refs;
		for(var i = 0, len = refs.length; i < len; i++){
			var ref = refs[i];
			switch(ref.type){
			case "attr":  //属性值
				ref.el.setAttribute(ref.name, this.calcValue(ref.val, hash));
				break;
			case "text":  //文本节点
				ref.el.nodeValue = this.calcValue(ref.val, hash);
				break;
			}
		}
	};
	this.calcValue = function(val, data){
		return val.value.replace(/\{\$(\w+)\}/g, function(_0, key){
			return data[key];
		});
	};
});