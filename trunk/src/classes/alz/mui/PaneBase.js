_package("alz.mui");

_import("alz.mui.Pane");

/**
 * 面板基类
 */
_class("PaneBase", Pane, function(){
	this._init = function(){
		_super._init.call(this);
		this._params = null;  //参数
		this._pid = "";       //pageid
	};
	this.create = function(parent, app, tpl){
		this.setParent2(parent);
		this.setApp(app);
		var obj = this.createTplElement(parent, tpl);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		//this.initComponents();  //初始化内部组件
		this.initActionElements(/*this._self, this*/);  //初始化动作元素
	};
	this.reset = function(params){
		if(this._params !== params){
			this.setParams(params);
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._params = null;
		_super.dispose.apply(this);
	};
	this.getPid = function(){
		return this._pid;
	};
	this.setPid = function(v){
		this._pid = v;
	};
	this.setParams = function(v){
		this._params = v;
	};
	this.setActionState = function(act, v, next){
		var nodes = this._actionManager._nodes[act];
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			switch(v){
			case "show":
			case "hide":
				node.setVisible(v == "show");
				if(next){
					node._self.nextSibling.style.display = v == "show" ? "" : "none";
				}
			}
		}
	};
});