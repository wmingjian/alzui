_package("alz.core");

_class("ScriptLoader", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._event = runtime.ie ? "onreadystatechange" : "onload";
		this._script = null;
		this._agent = null;
		this._fun = null;
	};
	this.create = function(agent, fun){
		this._agent = agent;
		this._fun = fun;
		var _this = this;
		var obj = runtime.getDocument().createElement("script");
		obj.type = "text/javascript";
		obj.charset = "utf-8";
		obj[this._event] = function(){
			//脚本如果缓存状态为 complete，否则为 loaded
			if(runtime.ie && !(this.readyState == "loaded" || this.readyState == "complete")){
				return;
			}
			_this._fun.apply(_this._agent);
			_this.dispose();
		};
		this._script = obj;
		obj = null;
	};
	this.dispose = function(){
		this._fun = null;
		this._agent = null;
		this._script[this._event] = null;
		this._script = null;
		_super.dispose.apply(this);
	};
	this.load = function(url, data, skipcb){
		if(!skipcb){
			url = url + "?"
				+ "_cb_=0,runtime.ajax._data"  //0=(变量赋值，n=v),1=(函数回调，f(v))
				+ "&ts=" + new Date().getTime()
				+ (data ? "&" + data : "");
		}
		this._script.src = url;
		if(!this._script.parentNode){
			runtime._domScript.parentNode.appendChild(this._script/*, runtime._domScript*/);
		}
	};
});