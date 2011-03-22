_package("alz.core");

_import("alz.core.EventTarget");

/**
 * JS�ļ�������
 */
_class("ScriptLoader", EventTarget, function(){
	this._init = function(){
		_super._init.call(this);
		this._event = runtime.ie ? "onreadystatechange" : "onload";
		this._scripts = [];
		this._agent = null;
		this._fun = null;
		this._urls = null;
		this._index = 0;
	};
	this.create = function(agent, fun){
		this._agent = agent;
		this._fun = fun;
	};
	this.dispose = function(){
		this._fun = null;
		this._agent = null;
		for(var i = 0, len = this._scripts.length; i < len; i++){
			this._scripts[i][this._event] = null;
			this._scripts[i] = null;
		}
		this._scripts = [];
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.createScript = function(parent, url){
		var _this = this;
		var obj = runtime.getDocument().createElement("script");
		obj.type = "text/javascript";
		obj.charset = "utf-8";
		obj[this._event] = function(){
			//�ű��������״̬Ϊ complete������Ϊ loaded
			if(runtime.ie && !(this.readyState == "loaded" || this.readyState == "complete")){
				return;
			}
			_this.fireEvent({type: "load"});
		};
		obj.src = url;
		this._scripts.push(obj);
		parent.appendChild(obj);
		return obj;
	};
	/**
	 * һ�μ���һ�������ű�
	 */
	this.load = function(urls, data, skipcb){
		if(!skipcb){
			for(var i = 0, len = urls.length; i < len; i++){
				urls[i] += "?"
					+ "_cb_=0,runtime._ajax._data"  //0=(������ֵ��n=v),1=(�����ص���f(v))
					+ "&ts=" + new Date().getTime()
					+ (data ? "&" + data : "");
			}
		}
		this._urls = urls;
		this.onLoad();
	};
	this.onLoad = function(ev){
		if(this._index >= this._urls.length){  //���
			this._fun.apply(this._agent);
			this.dispose();
		}else{
			this.createScript(runtime._domScript.parentNode, this._urls[this._index++]);
		}
	};
});