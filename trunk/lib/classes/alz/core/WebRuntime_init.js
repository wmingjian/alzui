_package("alz.core");

_extension("WebRuntime", function(){  //ע�� WebRuntime ��չ
	//this._init = function(){};
	//this.dispose = function(){};
	this.addMethods = function(destination, source){
		for(var property in source){
			destination[property] = source[property];
		}
		return destination;
	};
	this.toArray = function(iterable){  //prototype $A ��ʵ�ִ���
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
	 * ����һ�����󣬲����ظ�ʽ�����ַ���
	 */
	this.forIn = function(obj){
		if(typeof obj == "string") return [obj];  //FF ��������
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
	 * ��ʾ��Ϣ
	 * ʹ���˱��� document.body ���󣬱����� onContentLoaded ֮��ʹ��
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
			//��ʾ��ʱ�����¶�����
			this._info.style.width = (this.getBody().offsetWidth - 20) + "px";
		}
	};
	this.hideInfo = function(){
		if(this._info){
			this._info.style.display = "none";
		}
	};
});