_package("alz.mui");

_class("ActionManager", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._actionEngine = null;  //动作执行引擎，实现了doAction接口的类的实例
		this._actions = {};
	};
	this.init = function(actionEngine){
		this._actionEngine = actionEngine;
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var k in this._actions){
			for(var i = 0, len = this._actions[k].length; i < len; i++){
				this._actions[k][i] = null;  //再此无需调用 dispose 方法
			}
			delete this._actions[k];
		}
		this._actionEngine = null;
		_super.dispose.apply(this);
	};
	this.add = function(component){
		//var act = component._self.getAttribute("_action");
		var act = component.getAction();
		if(!this._actions[act]){
			this._actions[act] = [];
		}
		this._actions[act].push(component);
	};
	/*this.enable = function(action){
		var nodes = this._actions[action];
		if(!nodes) return;
		for(var i = 0, len = nodes.length; i < len; i++){
			nodes[i].setDisabled(false);
		}
		nodes = null;
	};*/
	this.enable = function(action){
		this.updateState(action, {"disabled":false});
	};
	this.disable = function(action){
		this.updateState(action, {"disabled":true});
	};
	this.updateState = function(action, state){
		if(action){
			this.update(action, state);
		}else{
			for(var k in this._actions){
				this.update(k, state);
			}
		}
	};
	this.multipleUpdateState = function(actions){
		for(var k in actions){
			this.update(k, actions[k]);
		}
	};
	this.update = function(action, state){
		var nodes = this._actions[action];
		if(!nodes) return;
		for(var i = 0, len = nodes.length; i < len; i++){
			for(var k in state){  //visible,disabled
				var name = "set" + k.charAt(0).toUpperCase() + k.substr(1);
				if(name in nodes[i]) nodes[i][name](state[k]);
			}
		}
		nodes = null;
	};
	this.dispatchAction = function(action, sender, ev){
		if(this._actionEngine.doAction){
			return this._actionEngine.doAction(action, sender, ev);
		}
	};
});