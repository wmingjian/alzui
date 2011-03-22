_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.BitButton");
_import("alz.mui.ToggleButton");

/**
 * 工具栏组件
 */
_class("ToolBar", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._buttons = [];
	};
	this.init = function(obj, app){
		this._app = app;
		//_super.init.apply(this, arguments);
		//var nodes = this._self.childNodes;
		var nodes = obj.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			if(nodes[i].nodeType != 1) continue;
			var btn;
			switch(nodes[i].className){
			case "wui-BitButton"   : btn = new BitButton();break;
			case "wui-ToggleButton": btn = new ToggleButton();break;
			}
			if(btn){
				btn.init(nodes[i], this._app);  //[TODO]改用bind实现
				this._buttons.push(btn);
			}
			btn = null;
		}
		nodes = null;
	};
	this.dispose = function(){
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
});