_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.ToolButton");
_import("alz.mui.BitButton");
_import("alz.mui.ToggleButton");

/**
 * 工具栏组件
 */
_class("ToolBar", Component, function(){
	var HASH = {
		"ui-toolbutton"  : ToolButton,
		"ui-bitbutton"   : BitButton,
		"ui-togglebutton": ToggleButton
	};
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._buttons = [];
	};
	this.bind = function(obj, parent, app, data, hash){
		this.setParent2(parent);
		this._app = app;
		this.init(obj);
		if(data){
			this.createButtons(data, hash);
		}
	};
	this.init = function(obj, app){
		_super.init.apply(this, arguments);
		//var nodes = this._self.childNodes;
		var nodes = obj.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			if(node.nodeType != 1) continue;
			if(node.className in HASH){
				var clazz = HASH[node.className];
				var btn = new clazz();
				btn.bind(node, this._app);  //[TO-DO]改用bind实现
				this._buttons.push(btn);
				btn = null;
			}
		}
		nodes = null;
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._buttons.length; i < len; i++){
			this._buttons[i].dispose();
			this._buttons[i] = null;
		}
		this._buttons = [];
		this._app = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setApp = function(v){
		this._app = v;
	};
	this.createButtons = function(data, hash){
		for(var i = 0, len = data.length; i < len; i++){
			var k = data[i];
			var t = k.charAt(0);
			switch(t){
			case "-":
				this._createElement2(this, "li", "sep");
				break;
			case "#":
				k = k.substr(1);
				var btn = new ToggleButton();
				btn.create(this, hash[k]);
				this._buttons.push(btn);
				runtime.toggleMgr.add(btn);
				break;
			default:
				var btn = new ToolButton();
				btn.create(this, hash[k]);
				this._buttons.push(btn);
				break;
			}
		}
	};
});