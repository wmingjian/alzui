_package("alz.core");

_import("alz.core.Plugin");

/**
 * 历史记录管理
 */
_class("HistoryManager", Plugin, function(){
	this._init = function(){
		_super._init.call(this);
		this._stack = [];  //{pid:"",params:{navmode:"normal",...}}
	};
	this.create = function(name, app){
		_super.create.apply(this, arguments);
	};
	this.dispose = function(){
		for(var i = 0, len = this._stack.length; i < len; i++){
			this._stack[i] = null;
		}
		this._stack.length = 0;
		_super.dispose.apply(this);
	};
	//[TODO]监控调试信息
	this.watchData = function(){
		if(runtime._debugPane){
			var arr = [];
			for(var i = 0, len = this._stack.length; i < len; i++){
				arr.push(this._stack[i].pid);
			}
			runtime._debugPane.updateHistory(arr);
		}
	};
	this.clear = function(){
		while(this._stack.length){
			this._stack.pop();
		}
		this.watchData();
	};
	this.push = function(item){
		this._stack.push(item);
		this.watchData();
	};
	this.pop = function(){
		var ret = this._stack.pop();
		this.watchData();
		return ret;
	};
	this.put = function(item, offset){
		if(offset <= 0){
			var n = this._stack.length + offset;
			this._stack[n] = item;
			this._stack.length = n;
			this.watchData();
		}else{  //offset >= 1
			this.push(item);
		}
	};
	this.getItem = function(offset){
		var n = this._stack.length - 1 + offset;
		if(n < 0 || offset >= 1){  //n < 0 || n >= this._stack.length
			return null;
		}else{
			return this._stack[n];
		}
	};
	this.getPrevious = function(){
		return this.getItem(-1);
	};
	this.getCurrent = function(){
		return this.getItem(0);
	};
});