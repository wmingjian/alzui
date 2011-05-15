_package("alz.mui");

_import("alz.mui.Component");

_class("Iframe", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._event = runtime.ie ? "onreadystatechange" : "onload";
		this._skipCallback = false;  //标志，忽略回调处理
		this._type = "text";
		this._agent = null;
		this._callback = null;
	};
	this.create = function(parent, name, type, agent, callback){
		this.setParent2(parent);
		this._type = type;
		this._agent = agent;
		this._callback = typeof callback == "function" ? callback : agent[callback];
		obj = this._createElement2(parent, "iframe", "", {
			//"id"   : name,
			//"name" : name,
			"display": "none"
		});
		var firstLoad = true;
		var _this = this;
		obj[this._event] = function(){
			if(runtime.ie && !(this.readyState == "loaded" || this.readyState == "complete")){
				return;
			}
			if(firstLoad){
				firstLoad = false;
				try{  //FF下面报错
					this.contentWindow.name = name;
				}catch(ex){
				}
				if(typeof _this.onLoad == "function"){
					_this.onLoad();
				}
				return;
			}
			_this.onCallback();
		};
		obj.src = "about:blank";
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._callback = null;
		this._agent = null;
		_super.dispose.apply(this);
	};
	this.onCallback = function(){
		if(this._skipCallback){  //如果需要忽略回调
			this._skipCallback = false;
		}else{
			var data;
			switch(this._type){
			case "json":
				try{
					var text = this.getResponseText();
					if(text == ""){
						data = {"result": false, "msg": "服务器内部错误"};
					}else{
						data = runtime.parseJson(text);
						if(data === null){
							data = {
								"result": false,
								"errno" : 0,
								"msg"   : "[Iframe::onCallback]服务端返回的json数据格式有问题" + text,
								"data"  : null
							};
						}
					}
				}catch(ex){
					//根据要求暂时修改提示信息，通过firebug来log错误信息
					window.alert("网络连接失败，请重试！ ");
					if(window.console && console.log){
						cosole.log("通信失败！\n原因：" + runtime.forIn(ex).join("\n"));
					}
					//window.alert("通信失败！\n原因：" + runtime.forIn(ex).join("\n"));
					data = {};
				}
				break;
			case "text":
				data = this.getResponseText();
				break;
			}
			this._callback.call(this._agent, data);
			this._skipCallback = true;  //标志，忽略回调处理
			this._self.contentWindow.location.replace("about:blank");
		}
	};
	this.getDocument = function(){
		return this._self.contentDocument || this._self.contentWindow.document;
	};
	this.getResponseText = function(){
		var text = this.getDocument().body.innerHTML;
		if(runtime.moz){
			text = text.replace(/<br \\=\"\">/g, "<br />");  //FF可能存在需要处理的BR标签
		}
		return text;
	};
});