_package("alz.mui");

_import("alz.mui.Pane");

/**
 * 面板基类
 */
_class("PaneBase", Pane, function(){
	this._init = function(){
		_super._init.call(this);
	};
	this.create = function(parent, app, tpl){
		this.setParent2(parent);
		this.setApp(app);
		var el = this.createTplElement(parent, tpl);
		this.init(el);
		return el;
	};
	this.init = function(el){
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