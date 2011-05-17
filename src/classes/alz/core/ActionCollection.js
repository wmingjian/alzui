_package("alz.core");

_import("alz.core.Plugin");

/**
 * action收集器
 */
_class("ActionCollection", Plugin, function(){
	this._init = function(){
		_super._init.call(this);
		this._list = [];
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
	this.append = function(action){
		this._list.push(action);
	};
	this.onDispatchAction = function(action, sender, ev){
		this.append({
			"ts"     : new Date().getTime(),
			"name"   : action,
			"sender" : sender,
			"result" : true,
			"usetime": 0,
			"feature": {
				"net_num": 0,
				"dat_num": 0,
				"flow"   : false
			}
		});
		this.showList();
	};
	this.showList = function(){
		var sb = [];
		for(var i = 0, len = this._list.length; i < len; i++){
			var item = this._list[i];
			sb.push(
				item.ts + ","
				+ item.name + ","
				+ (item.sender ? item.sender.tagName : "") + ","
				+ item.result + ","
				+ item.usetime
			);
		}
		//window.alert(sb.join("\n"));
	};
	/**
	 * 获取当前的action对象，该方法不能在action被触发之后的某个异步过程之中使用
	 */
	this.getActiveAction = function(){
		return this._list[this._list.length - 1];
	};
});