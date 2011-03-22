_package("alz.core");

_import("alz.core.AjaxEngine");

/**
 * 异步数据调用引擎的封装版，主要目的是屏蔽并减少runtime对象的使用
 */
_class("Ajax", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._ajax = runtime.getAjax();
	};
	this.dispose = function(){
		this._ajax = null;
		//[memleak]this.__caller__ = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	//具体参数含义参考AjaxEngine对应的方法
	this.netInvoke = function(method, url, postData, type, agent, funName, cbArgs){
		//[memleak]this.__caller__ = method + "," + url + "," + postData + "," + type + "," + agent + "," + funName + "," + cbArgs;
		return this._ajax.netInvoke.apply(this._ajax, arguments);
	};
	this.netInvokeQueue = function(queue, agent, callback){
		this._ajax.netInvokeQueue.apply(this._ajax, arguments);
	};
	this.abort = function(uniqueid){
		this._ajax.abort(uniqueid);
	};
	this.pauseAjaxThread = function(abort){
		this._ajax.pauseAjaxThread(abort);
	};
	this.getTestCase = function(){
		return this._ajax.getTestCase();
	};
	this.setTestCase = function(v){
		this._ajax.setTestCase(v);
	};
});