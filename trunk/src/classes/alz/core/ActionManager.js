_package("alz.core");

/**
 * Action管理者类(Pane专用元素管理类)
 */
_class("ActionManager", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._actionEngine = null;  //动作执行引擎，实现了doAction接口的类的实例
		this._nodes = {};  //所管理的全部action组件
		this._components = [];
		this._focusbutton = null
	};
	this.init = function(actionEngine){
		this._actionEngine = actionEngine;
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._components.length; i < len; i++){
			this._components[i].dispose();
			this._components[i] = null;
		}
		this._components = [];
		for(var k in this._nodes){
			for(var i = 0, len = this._nodes[k].length; i < len; i++){
				this._nodes[k][i] = null;  //再此无需调用 dispose 方法
			}
			delete this._nodes[k];
		}
		this._actionEngine = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * 获取action响应类
	 */
	this.getActionEngine = function(){
		return this._actionEngine;
	};
	this.setFocusButton = function(btn){
		this._focusbutton = btn;
	};
	this.add = function(component){
		//var act = component._self.getAttribute("_action");
		var act = component.getAction();
		if(!this._nodes[act]){
			this._nodes[act] = [];
		}
		this._nodes[act].push(component);
		this._components.push(component);  //注册组件
	};
	/*this.enable = function(name){
		var nodes = this._nodes[name];
		if(!nodes) return;
		for(var i = 0, len = nodes.length; i < len; i++){
			nodes[i].setDisabled(false);
		}
		nodes = null;
	};*/
	/**
	 * 启用名字为name对的action(可能是一组)
	 */
	this.enable = function(name){
		this.updateState(name, {"disabled": false});
	};
	/**
	 * 禁用名字为name对的action(可能是一组)
	 */
	this.disable = function(name){
		this.updateState(name, {"disabled": true});
	};
	/**
	 * 更新名字为name的action的状态
	 */
	this.updateState = function(name, state){
		if(name){
			this.update(name, state);
		}else{
			for(var k in this._nodes){
				this.update(k, state);
			}
		}
	};
	this.multipleUpdateState = function(actions){
		for(var k in actions){
			this.update(k, actions[k]);
		}
	};
	this.update = function(name, state){
		var nodes = this._nodes[name];
		if(!nodes) return;
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			for(var k in state){  //visible,disabled
				var name = "set" + k.charAt(0).toUpperCase() + k.substr(1);
				if(name in node){
					node[name](state[k]);
				}
			}
		}
		nodes = null;
	};
	/**
	 * 分派一个action
	 * @param {String} name action的名字
	 * @param {Element} sender action发送者
	 * @param {Event} ev 原始的事件
	 */
	this.dispatchAction = function(name, sender, ev){
		if(this._actionEngine.doAction){
			return this._actionEngine.doAction(name, sender, ev);
		}
	};
});