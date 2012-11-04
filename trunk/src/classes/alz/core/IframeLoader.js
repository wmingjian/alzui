_package("alz.core");

/**
 * 使用IFRAME工作的json数据加载器
 */
_class("IframeLoader", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._event = runtime.ie ? "onreadystatechange" : "onload";
		this._win = window;
		this._doc = this._win.document;
		this._self = null;
		this._name = "";
		this.loaded = 0;//加载状态：0-未开始，1-正在加载，2-加载完成
	};
	this.create = function(parent, name, agent, func){
		this._name = name;
		this._agent = agent;
		this._func = func;
		var _this = this;
		var firstLoad = true;
		var el = this._doc.createElement("iframe");
		el.id = name;
		el.name = name;
		el.style.display = "none";
		el[this._event] = function(){
			if(runtime.ie && !(this.readyState == "loaded" || this.readyState == "complete")){
				return;
			}
			_this.loaded = 2;
			if(firstLoad){
				firstLoad = false;
				try{  //FF下面报错
					this.contentWindow.name = name;
				}catch(ex){
				}
				return;
			}
			var json;
			try{
				var doc = this.contentDocument || this.contentWindow.document;
				var jsonHTML = doc.body.innerHTML;
				if(jsonHTML == ""){
					json = {"result":false,"errno":1,"msg":"服务器内部错误","data":null};
				}else if(/^\{.*\}$/.test(jsonHTML)){
					json = runtime.parseJson(jsonHTML);
				}else{
					json = null;  //runtime.parseJson(doc.body.innerHTML)
				}
			}catch(ex){
				//_this._win.alert("通信失败！\n原因：" + runtime.forIn(ex).join("\n"));
				json = null;
			}
			if(typeof _this._func == "function"){
				_this._func.apply(_this._agent, [json]);
			}else{
				_this._agent[_this._func](json);
			}
			//_this.dispose();
		};
		el.src = "about:blank";
		this._self = parent.appendChild(el);
		return el;
	};
	this.reset = function(){
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._func = null;
		this._agent = null;
		if(this._self.parentNode){
			this._self.parentNode.removeChild(this._self);
		}
		this._self[this._event] = null;
		this._self = null;
		_super.dispose.apply(this);
	};
});