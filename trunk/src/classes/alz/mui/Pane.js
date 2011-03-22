_package("alz.mui");

_import("alz.mui.Container");
//_import("alz.action.ActionElement");
_import("alz.action.FormElement");
_import("alz.action.LinkLabel");
_import("alz.action.ComboBox");
//_import("alz.action.TextField");
_import("alz.action.Button");
_import("alz.action.CheckBox");

_class("Pane", Container, function(){
	this._init = function(){
		_super._init.call(this);
		this._components = [];
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._components.length; i < len; i++){
			this._components[i].dispose();
			this._components[i] = null;
		}
		this._components = [];
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * 初始化组件中的 Action 动作组件
	 * 支持的 Action 动作组件有：
	 *   表单  ： FORM
	 *   超链接： A
	 *   按钮  ： INPUT(type=button)
	 *   复选框： INPUT(type=checkbox)
	 *   列表框： SELECT
	 */
	this.initComponents = function(element){
		var tags = ["form", "a", "select", "input"];
		for(var i = 0, len = tags.length; i < len; i++){
			var nodes = element.getElementsByTagName(tags[i]);
			for(var j = 0, len1 = nodes.length; j < len1; j++){
				var node = nodes[j];
				if(node.getAttribute("_action")){
					var component;
					switch(tags[i]){
					case "form":
						component = new FormElement();
						break;
					case "a":
						component = new LinkLabel();
						break;
					case "select":
						component = new ComboBox();
						break;
					case "input":
						switch(node.type){
						//case "text":
						case "button":
							component = new Button();
							break;
						case "checkbox":
							component = new CheckBox();
							break;
						default:
							continue;
						}
						//application._buttons[btn._action] = btn;
						break;
					//default:
					//	break;
					}
					component.init(node);
					//application._actionManager.add(component);
					this._components.push(component);
				}
				node = null;
			}
			nodes = null;
		}
	};
	/**
	 * Action 工作模型
	 * [TODO]
	 * 1)级联激发的 Action 动作只把最初的动作压入动作栈，这样能够保证正确的动作回
	 *   退机制。
	 */
	this.doAction = function(action){
	};
});