_package("alz.core");

/**
 * 动作栈，管理APP内部的前进、后退功能
 */
_class("ActionStack", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._stack = [];  //动作栈
		this._oldAction = null;  //前一个动作
		this._activeAction = null;  //当前活动的动作
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activeAction = null;
		this._oldAction = null;
		for(var i = 0, len = this._stack.length; i < len; i++){
			this._stack[i] = null;
		}
		this._stack = [];
		_super.dispose.apply(this);
	};
	/**
	 * @param action {type:"",data:null}
	 */
	this.push = function(action){
		this._stack.push(action);
	};
	this.pop = function(){
		var action;
		if(this._stack.length > 1){
			action = this._stack.pop();  //最后一个动作出栈
			this._activeAction = this.top();
			this._oldAction = this._stack.length < 2 ? "" : this._stack[this._stack.length - 2];
		}else{
			runtime.log("动作栈已经被清空，您没有后路可退啦！");
			action = null;
		}
		return action;
	};
	this.top = function(){
		return this._stack[this._stack.length - 1];
	};
	this.__item__ = function(index){
		return this._stack[index];
	};
	this.getLength = function(){
		return this._stack.length;
	};
	this.getOldAction = function(){
		return this._oldAction;
	};
	this.setOldAction = function(v){
		this._oldAction = v;
	};
	this.getActiveAction = function(){
		return this._activeAction;
	};
	this.setActiveAction = function(v){
		this.setOldAction(this.top());
		this._activeAction = v;
	};
});