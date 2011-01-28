_package("alz.core");

_extension("WebRuntime", function(){  //注册 WebRuntime 扩展
	//this._init = function(){};
	//this.dispose = function(){};
	this.addMethods = function(destination, source){
		for(var property in source){
			destination[property] = source[property];
		}
		return destination;
	};
	this.toArray = function(iterable){  //prototype $A 的实现代码
		if(!iterable) return [];
		if(iterable.toArray){
			return iterable.toArray();
		}else{
			var results = [];
			for(var i = 0, len = iterable.length; i < len; i++){
				results.push(iterable[i]);
			}
			return results;
		}
	};
	/**
	 * 遍历一个对象，并返回格式化的字符串
	 */
	this.forIn = function(obj){
		if(typeof obj == "string") return [obj];  //FF 兼容问题
		var a = [];
		for(var k in obj){
			a.push(k + "=" + (typeof obj[k] == "function" ? "[function]" : obj[k]));
		}
		return a;
	};
	this.showException = function(e, info){
		var a = this.forIn(e);
		if(info) a.push(info);
		this._win.alert(a.join("\n"));
	};
	/**
	 * 显示信息
	 * 使用了必须 document.body 对象，必须在 onContentLoaded 之后使用
	 */
	this.showInfo = function(info){
		//this._win.alert(info);
		if(!this._info){
			var body = this.getBody();
			var obj = this._doc.createElement("div");
			obj.className = "wui-Loging";
			obj.style.display = "none";
			this._info = body.appendChild(obj);
			obj = null;
			body = null;
		}
		this._info.innerHTML = info;
		if(this._info.style.display == "none"){
			this._info.style.display = "block";
			//显示的时候重新定义宽度
			this._info.style.width = (this.getBody().offsetWidth - 20) + "px";
		}
	};
	this.hideInfo = function(){
		if(this._info){
			this._info.style.display = "none";
		}
	};
});