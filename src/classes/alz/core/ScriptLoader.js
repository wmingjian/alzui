_package("alz.core");

_import("alz.core.EventTarget");

/**
 * JS文件加载器
 */
_class("ScriptLoader", EventTarget, function(){
	this._init = function(){
		_super._init.call(this);
		this._event = runtime.ie ? "onreadystatechange" : "onload";
		this._scripts = [];
		this._agent = null;
		this._func = null;
		this._urls = null;
		this._index = 0;
	};
	this.create = function(agent, func){
		this._agent = agent;
		this._func = func;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._func = null;
		this._agent = null;
		for(var i = 0, len = this._scripts.length; i < len; i++){
			this._scripts[i][this._event] = null;
			this._scripts[i] = null;
		}
		this._scripts.length = 0;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.createScript = function(parent, url){
		var _this = this;
		var el = runtime.getDocument().createElement("script");
		el.type = "text/javascript";
		el.charset = "utf-8";
		el[this._event] = function(){
			//脚本如果缓存状态为 complete，否则为 loaded
			if(runtime.ie && !(this.readyState == "loaded" || this.readyState == "complete")){
				return;
			}
			_this.fireEvent({type: "load"});
		};
		el.src = url;
		this._scripts.push(el);
		parent.appendChild(el);
		return el;
	};
	/**
	 * 一次加载一个或多个脚本
	 */
	this.load = function(urls, data, skipcb){
		if(!skipcb){
			for(var i = 0, len = urls.length; i < len; i++){
				urls[i] += "?"
					+ "_cb_=0,runtime._ajax._data"  //0=(变量赋值，n=v),1=(函数回调，f(v))
					+ "&ts=" + new Date().getTime()
					+ (data ? "&" + data : "");
			}
		}
		this._urls = urls;
		this.onLoad();
	};
	this.onLoad = function(ev){
		if(this._index >= this._urls.length){  //完成
			this._func.apply(this._agent);
			this.dispose();
		}else{
			this.createScript(runtime._domScript.parentNode, this._urls[this._index++]);
		}
	};
});