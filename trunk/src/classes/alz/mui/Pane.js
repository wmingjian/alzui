_package("alz.mui");

_import("alz.core.ActionManager");
_import("alz.mui.Container");
_import("alz.action.ActionElement");
_import("alz.action.FormElement");
_import("alz.action.LinkLabel");
_import("alz.action.ComboBox");
_import("alz.action.Select");
_import("alz.action.TextField");
_import("alz.action.Button");
_import("alz.action.CheckBox");

/**
 * 可独立工作的面板组件
 */
_class("Pane", Container, function(){
	this._init = function(){
		_super._init.call(this);
		//this._components = [];
		this._actionManager = null;
		this._app = null;
		this._currentSender = null;
		this._lastTime = 0;
		//this._lastAct = "";
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._actionManager = new ActionManager();
		this._actionManager.init(this);
	};
	this.dispose = function(){
		if(this._disposed) return;
		/*
		for(var i = 0, len = this._components.length; i < len; i++){
			this._components[i].dispose();
			this._components[i] = null;
		}
		this._components = [];
		*/
		this._app = null;
		this._actionManager.dispose();
		this._actionManager = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getApp = function(){
		return this._app;
	};
	this.setApp = function(v){
		this._app = v;
	};
	this.getActionEngine = function(){
		return this;
	};
	this.getCurrentSender = function(){
		return this._currentSender;
	};
	/**
	 * 通过模板名创建一组DOM元素
	 * @param {Element} parent 父元素
	 * @param {String} tpl 模板名
	 * @return {Element}
	 */
	this.createTplElement = function(parent, tpl, app){
		return this.createDomElement(parent, (app || this._app).getTpl(tpl)/*, ".module"*/);
	};
	/**
	 * 初始化组件中的动作元素，使这些元素可以响应默认事件触发其action
	 * [TODO]如何避免已经初始化过的元素重复初始化？
	 * @param {HTMLElement} element
	 * @param {Object} owner
	 * @param {Array} customTags 自定义支持action的标签
	 */
	this.initActionElements = function(element, owner, customTags){
		owner = owner || this.getActionEngine();
		this.initComponents();
	};
	/**
	 * 初始化组件中的 Action 动作组件
	 * 支持的 Action 动作组件有：
	 *   表单  ： FORM
	 *   超链接： A
	 *   按钮  ： INPUT(type=button)
	 *   复选框： INPUT(type=checkbox)
	 *   列表框： SELECT
	 * 支持增量初始化运行方式
	 */
	this.initComponents = function(element, customTagList){
		element = element || this._self;
		customTagList = customTagList || [];
		var customNodes = [];
		var tags = ["form", "a", "select", "input"].concat(customTagList);
		for(var i = 0, len = tags.length; i < len; i++){
			var nodes = element.getElementsByTagName(tags[i]);
			for(var j = 0, len1 = nodes.length; j < len1; j++){
				var node = nodes[j];
				var act = node.getAttribute("_action");
				if(act){
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
					component.bind(node, this._actionManager);
					this._actionManager.add(component);
					//this._components.push(component);
				}
				node = null;
			}
			nodes = null;
		}
		return customNodes;
	};
	/**
	 * Action 工作模型
	 * [TODO]
	 * 1)级联激发的 Action 动作只把最初的动作压入动作栈，这样能够保证正确的动作回
	 *   退机制。
	 */
	this.doAction = function(act, sender){
		var time = new Date().getTime();
		if(time < this._lastTime + 500){
			this._lastTime = time;
			return false;
		}
		//if(time < this._lastTime + 800 && this._lastAct == act){
		//	return false;
		//}
		this._lastTime = time;
		//this._lastAct = act;
		this._currentSender = sender;
		var ret, key = "do_" + act;
		if(key in this && typeof this[key] == "function"){
			ret = this[key](act, sender);
		}else{  //自己处理不了的交给APP处理
			ret = this._app.doAction.apply(this._app, arguments);
			//runtime.error("[Pane::doAction]未定义的act=" + act);
			//ret = false;
		}
		this._currentSender = null;
		//[TODO]应该在动画播完之后运行，如何保证呢？
		/*
		runtime.startTimer(10, this, function(){
			this._taskSchedule.run("page_unload");
		});
		*/
		return typeof ret == "boolean" ? ret : false;
	};
});