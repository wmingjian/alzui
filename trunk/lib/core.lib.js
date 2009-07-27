/*
 * alzui-mini JavaScript Framework, v0.0.1
 * Copyright (c) 2009 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
(function(){with(runtime.createContext("core")){

//_import("AObject,ui.Component");
//_export("DOMUtil,AjaxEngine,EventTarget,Application");

/*#file begin=alz.core.DOMUtil.js*/
_package("alz.core");

_class("DOMUtil", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._components = [];
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._components.length; i < len; i++){
			this._components[i].dispose();
			this._components[i] = null;
		}
		this._components = [];
		_super.dispose.apply(this);
	};
	/**
	 * 计算 element 相对于 refElement 的位置，一定要保证 refElement 包含 element
	 * [TODO]如何计算绝对定位的元素？相对于外部的位置
	 */
	this.getPos = function(element, refElement){
		try{
		var pos = {x: 0, y: 0};
		//var sb = [];
		for(var o = element; o; o = o.offsetParent){
			var s = "tagName=" + o.tagName;
			var x = 0, y = 0, a, b;
			var style = this.getStyle(o);
			if(o != element && o != refElement){
				//a = this.parseInt(style.borderLeftWidth);
				//b = this.parseInt(style.borderTopWidth);
				a = this.getStyleProperty(o, "borderLeftWidth");
				b = this.getStyleProperty(o, "borderTopWidth");
				x += isNaN(a) ? 0 : a;
				y += isNaN(b) ? 0 : b;
				//s += ",borderLeftWidth=" + a + ",borderTopWidth=" + b;
			}
			/*
			if(o != element && runtime.getBoxModel() == 0){
				x += this.parseInt(style.paddingLeft);
				y += this.parseInt(style.paddingTop);
			}
			*/
			if(o != refElement){
				pos.x += o.offsetLeft + (o != element ? x : 0);
				pos.y += o.offsetTop + (o != element ? y : 0);
				//s += ",offsetLeft=" + o.offsetLeft + ",offsetTop=" + o.offsetTop;
			}else{
				a = this.getStyleProperty(o, "borderLeftWidth");
				b = this.getStyleProperty(o, "borderTopWidth");
				//pos.x += this.parseInt(style.borderLeftWidth);
				//pos.y += this.parseInt(style.borderTopWidth);
				pos.x += a;
				pos.y += b;
				//s += ",borderLeftWidth=" + a + ",borderTopWidth=" + b;
				style = null;
				//sb.push(s);
				break;
			}
			//sb.push(s);
			if(o.tagName == "BODY" || o.tagName == "HTML") break;
			style = null;
		}
		//$("log_off").value += "\n" + sb.join("\n");
		}catch(ex){
			window.alert(ex.message);
		}
		return pos;
	};
	this.parseInt = function(v){
		switch(v){
		case "medium": return 2;
		case "thin": return 1;
		case "thick": return 1;
		default:
			var a = parseInt(v);
			return isNaN(a) ? 0 : a;
		}
	};
	/**
	 * 统一 IE 和 Moz 系列浏览器的差异
	 */
	this.getPropertyValue = function(style, name){
		return runtime.ie ? style[name] : style.getPropertyValue(name);
	};
	this.getStyle = function(element){
		var style;
		if(runtime.getDocument().defaultView && runtime.getDocument().defaultView.getComputedStyle)
			style = runtime.getDocument().defaultView.getComputedStyle(element, null);
		else if(element.currentStyle)
			style = element.currentStyle;
		else
			throw "无法动态获取DOM的实际样式属性";
		return style;
	};
	this.getStyleProperty = function(element, name){
		var style = this.getStyle(element);
		return this.parseInt(this.getPropertyValue(style, name) || element.style[name]);
	};
	this._setStyleProperty = function(element, name, value){
		try{
		switch(name){
		case "width":
			if(runtime.getBoxModel() == 1){
				value -= this.getStyleProperty(element, "borderLeftWidth")
							 + this.getStyleProperty(element, "paddingLeft")
							 + this.getStyleProperty(element, "paddingRight")
							 + this.getStyleProperty(element, "borderRightWidth");
			}
			element.style[name] = Math.max(0, value) + "px";
			break;
		case "height":
			if(runtime.getBoxModel() == 1)
				value -= this.getStyleProperty(element, "paddingTop") + this.getStyleProperty(element, "paddingBottom");
			element.style[name] = Math.max(0, value) + "px";
			break;
		}
		}catch(ex){
			window.alert(ex.message);
		}
	};
	this.initElement = function(element){
		var component = new Component();
		component._domCreate = true;
		this._components.push(component);  //注册 component
		component.bind(element);  //绑定 DOM 元素
	};
	this.getWidth = function(element){
		if(!element._ptr) this.initElement(element);
		return element._ptr.getWidth();
	};
	this.setWidth = function(element, w){
		if(!element._ptr) this.initElement(element);
		element._ptr.setWidth(w);
		//this._setStyleProperty(element, "width", w);
	};
	this.getHeight = function(element){
		if(!element._ptr) this.initElement(element);
		return element._ptr.getHeight();
	};
	this.setHeight = function(element, h){
		if(!element._ptr) this.initElement(element);
		element._ptr.setHeight(h);
		//this._setStyleProperty(element, "height", h);
	};
	this.getInnerWidth = function(element){
		if(!element._ptr) this.initElement(element);
		return element._ptr.getInnerWidth();
		/*
		//if(runtime.getBoxModel() == 1){
			return Math.max(0, element.offsetWidth - this.getStyleProperty(element, "borderLeftWidth") - this.getStyleProperty(element, "paddingLeft") - this.getStyleProperty(element, "paddingRight") - this.getStyleProperty(element, "borderRightWidth"));
		//}
		*/
	};
	this.getInnerHeight = function(element){
		if(!element._ptr) this.initElement(element);
		return element._ptr.getInnerHeight();
	};
	this.resize = function(element, w, h, reDoSelf){
		if(!element._ptr) this.initElement(element);
		if(reDoSelf) element._ptr.resize(w, h);  //是否调整自身的大小
		//if(element.getAttribute("id") != "") alert(element.id);
		var nodes = element.childNodes;
		//if(element.getAttribute("html") == "true") alert();
		if(element.getAttribute("aui") != "" &&
			!(element.getAttribute("noresize") == "true" ||
				element.getAttribute("html") == "true") &&
			nodes.length > 0){  //忽略 head 内元素
			var ww = this.getInnerWidth(element);
			var hh = this.getInnerHeight(element);
			for(var i = 0, len = nodes.length; i < len; i++){
				if(nodes[i].nodeType != 1)  //NODE_ELEMENT
					continue;
				var w0 = this.getWidth(nodes[i]);
				var h0 = this.getHeight(nodes[i]);
				//if(nodes[i].id == "dlgBody") alert(w0);
				this.setWidth(nodes[i], w0);
				//this.setHeight(nodes[i], h0);
				this.resize(nodes[i], ww, h0, true);
			}
		}
	};
	this.resizeElement = function(element, w, h){
		element.style.width = Math.max(0, w) + "px";
		element.style.height = Math.max(0, h) + "px";
	};
	this.moveElement = function(element, x, y){
		element.style.left = Math.max(0, x) + "px";
		element.style.top = Math.max(0, y) + "px";
	};
	this.selectNodes = function(element, xpath){
		return runtime.ie ? element.childNodes : element.selectNodes(xpath);
	};
	this.getViewPort = function(element){
		/*return {
			x: 0,
			y: 0,
			w: element.clientWidth,
			h: element.clientHeight,
			//w1: element.scrollWidth,
			//h1: element.scrollHeight
		};*/
		return {
			x: element.scrollLeft,
			y: element.scrollTop,
			w: element.clientWidth,  //Math.max(element.clientWidth || element.scrollWidth)
			h: Math.max(element.clientHeight, element.parentNode.clientHeight)  //Math.max(element.clientHeight || element.scrollHeight)
		};
	};
	/**
	 * @param element 要绑定事件的DOM元素
	 * @param type 事件类型，如果参数fun为事件监听对象，则该参数将被忽略
	 * @param fun 事件响应函数或者事件监听对象
	 * @param obj 回调函数中的this指代对象，如果没有该参数，缺省为element
	 */
	this.addEventListener = function(element, type, fun, obj){
		switch(typeof(fun)){
		case "function":
			element.__callback = (function(cb, obj){
				return function(ev){
					return cb.call(obj, ev || window.event);  //保证回调函数中的this是当前DOM对象或者对应的脚本组件
				};
			})(fun, obj || element);
			if(element.attachEvent)
				element.attachEvent("on" + type, element.__callback);
			else
				element.addEventListener(type, element.__callback, false);
			break;
		case "object":
			element.__callback = (function(listener, obj){
				return function(ev){
					return listener[ev.type].call(obj, ev || window.event);  //保证回调函数中的this是当前DOM对象或者对应的脚本组件
				};
			})(fun, obj || element);
			for(var k in fun){
				if(element.attachEvent)
					element.attachEvent("on" + k, element.__callback);
				else
					element.addEventListener(k, element.__callback, false);
			}
			break;
		}
	};
	this.removeEventListener = function(element, type, fun){
		switch(typeof(fun)){
		case "function":
			if(element.detachEvent)
				element.detachEvent("on" + type, element.__callback);
			else
				element.removeEventListener(type, element.__callback, false);
			break;
		case "object":
			for(var k in fun){
				if(element.detachEvent)
					element.detachEvent("on" + k, element.__callback);
				else
					element.removeEventListener(k, element.__callback, false);
			}
			break;
		}
		element.__callback = null;
	};
	this.contains = function(element, obj){
		if(element.contains)
			return element.contains(obj);
		else{
			for(var o = obj; o; o = o.parentNode){
				if(o == element) return true;
				if(!o.parentNode) return false;
			}
			return false;
		}
	};
});
/*#file end*/
/*#file begin=alz.core.AjaxEngine.js*/
_package("alz.core");

//_import("alz.core.Exception");
//依赖于 runtime, runtime.getBrowser()
//[TODO]
//  1)添加防错误处理机制，保证请求队列的持续工作
//  2)短路所有的异步请求，保证单机环境下能够正常工作

/**
 * 异步数据调用引擎
 * [TODO]跨页面工作
 */
_class("AjaxEngine", "", function(_super){
	AjaxEngine._version = "1.01.0001";  //Ajax引擎的当前版本
	AjaxEngine._PROGIDS = [
		"Microsoft.XMLHTTP",
		"Msxml2.XMLHTTP",
		"Msxml2.XMLHTTP.4.0",
		"MSXML3.XMLHTTP",
		"MSXML.XMLHTTP",
		"MSXML2.ServerXMLHTTP"
	];
	//VBS版本的 UTF-8 解码函数，大数据量情况下效率低下，甚用！
	AjaxEngine._vbsCode = "Function VBS_bytes2BStr(vIn)"
		+ "\n  Dim sReturn, i, nThisChar, nNextChar"
		+ "\n  sReturn = \"\""
		+ "\n  For i = 1 To LenB(vIn)"
		+ "\n    nThisChar = AscB(MidB(vIn, i, 1))"
		+ "\n    If nThisChar < &H80 Then"
		+ "\n      sReturn = sReturn & Chr(nThisChar)"
		+ "\n    Else"
		+ "\n      nNextChar = AscB(MidB(vIn, i + 1, 1))"
		+ "\n      sReturn = sReturn & Chr(CLng(nThisChar) * &H100 + CInt(nNextChar))"
		+ "\n      i = i + 1"
		+ "\n    End If"
		+ "\n  Next"
		+ "\n  VBS_bytes2BStr = sReturn"
		+ "\nEnd Function";
	AjaxEngine.getXmlHttpObject = function(){
		var http, err;
		if(typeof XMLHttpRequest != "undefined"){
			try{
				http = new XMLHttpRequest();
				//http.overrideMimeType("text/xml");
				return http;
			}catch(ex){}
		}
		if(!http){
			for(var i = 0, len = this._PROGIDS.length; i < len; i++){
				var progid = this._PROGIDS[i];
				try{
					http = runtime.createComObject(progid);
				}catch(ex){
					err = ex;
				}
				if(http){
					this._PROGIDS = [progid];
					break;  //return http;
				}
			}
		}
		if(!http){
			//throw err;
			runtime.showException(err, "XMLHTTP not available");
		}
		return http;
	};
	this._init = function(){
		_super._init.call(this);
		this._timer = 0;
		this._msec = 10;
		this._retryMsec = 2000;  //请求失败重试的时间间隔
		this._http = null;  //[TODO]这个对象应该仅供异步请求队列使用
		this._queue = [];  //异步请求队列
		this._uniqueId = 0;  //每个请求的全局唯一编号的种子
		this._userinfo = false;
		this._testCase = null;  //测试用例
		this._retryCount = 0;
		this._scriptDom = null;
		this._data = null;  //script-src方法获取的数据临时存储地
		this._ignoreMessages = [
			"不能执行已释放 Script 的代码"
			//"完成该操作所需的数据还不可使用。"
		];
	};
	this.init = function(){
		this._http = AjaxEngine.getXmlHttpObject();
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._data = null;
		this._scriptDom = null;
		this._testCase = null;
		this._timer = 0;
		this._http = null;
		for(var i = 0, len = this._queue.length; i < len; i++){
			this._queue[i] = null;
		}
		this._queue = [];
		_super.dispose.apply(this);
	};
	this.getTestCase = function(){return this._testCase;};
	this.setTestCase = function(v){this._testCase = v;};
	this._getScriptDom = function(){
		if(runtime.moz || !this._scriptDom){
			var obj = runtime.getDocument().createElement("script");
			obj.type = "text/javascript";
			obj.charset = "utf-8";
			this._scriptDom = obj;
			obj = null;
		}
		return this._scriptDom;
	};
	this._openHttp = function(method, url, async){
		if(!this._http) this._http = AjaxEngine.getXmlHttpObject();
		var http = this._http;
		//url = url.replace(/\?/, "?rnd=" + Math.random() + "&");
		runtime.log("http.open(\"" + method + "\",\"" + url + "\"," + async + ");");
		http.open(method, url, async);
		if(method == "POST"){
			http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			if(this._userinfo){
				http.setRequestHeader("SESSIONID", "10000");
				http.setRequestHeader("USERNAME", runtime.getUser().getName());
			}
		}
		//if(runtime.getWindow().Event){  //FF 和 NS 支持 Event 对象
		if(runtime.moz){  //FF
			var ext = url.substr(url.lastIndexOf("."));
			if(ext == ".xml" || ext == ".aul"){
				http.overrideMimeType("text/xml; charset=gb2312");  //用于将 UTF-8 转换为 gb2312
			}else{
				http.overrideMimeType("text/xml");
				//http.setRequestHeader("Content-Type", "text/xml");
				//http.setRequestHeader("Content-Type", "gb2312");
			}
		}
		return http;
	};
	/**
	 * @param method {String} 提交方法(GET|POST)
	 * @param url {String} 网络调用的url
	 * @param postData {String|Object} 请求数据
	 * @param type {String} 返回只类型(text|xml)
	 * @param callback {Function} 回调函数
	 * @param cbAgrs {Array} 传给回调方法的参数
	 * @return {String|XmlDocument}
	 */
	this.netInvoke1 = function(method, url, postData, type, callback){
		try{
			var async = (typeof(callback) != "undefined" && callback != null) ? true : false;
			if(async)  //如果是异步请求，使用请求队列工作模式
				return this.netInvoke(method, url, postData, type, callback);
			else{
				var http = this._openHttp(method, url, async);
				/*
				var div = window.document.createElement("div");
				div.style.backgroundColor = "#EEEEEE";
				div.innerHTML = url + "&" + postData;
				im_history.appendChild(div);
				*/
				http.send(postData);  //FF下面参数null不能省略
				http = null;
				return this._onSyncCallback(type);
			}
		}catch(ex){
			runtime.showException(ex, "[AjaxEngine::netInvoke1]");
			return;
		}
	};
	//内嵌函数
	this._encodeData = function(http, charset){
		if(runtime.getWindow() && charset == "utf-8")
			return "" + http.responseText;
		else if(runtime.getWindow() && runtime.getWindow().execScript){  //FF 不支持 execScript
			if(typeof(VBS_bytes2BStr) == "undefined")
				runtime.getWindow().execScript(AjaxEngine._vbsCode, "VBScript");
			return VBS_bytes2BStr(http.responseBody);
		}else{
			//[TODO]直接返回 responseText 会有因 UTF-8 编码而引起的乱码问题
			return http.responseText;
		}
	};
	//供加载类库代码使用的方法
	this.netInvoke2 = function(method, url, postData, charset, agent, funName, args){
		var async = (typeof(agent) != "undefined" && agent != null) ? true : false;
		if(async)  //如果是异步请求，使用请求队列工作模式
			return this.netInvoke(method, url, postData, type, agent, funName, args);
		else{
			var http = this._openHttp(method, url, async);
			if(runtime.getHostenv() == "safari" || runtime.getHostenv() == "chrome")  //Safari下面需要这一句
				http.onreadystatechange = null;
			/*if(async){
				http.onreadystatechange = function(){
					if(http.readyState != 4) return;
					if(typeof(agent[funName]) == "function")
						agent[funName](http.responseText);
					else
						agent(http.responseText);
				};
			}*/
			http.send("");  //没有 "" 的话 FF 下面会报错
			//if(!async){
			var data;
			if(http.status && (200 > http.status || 300 <= http.status))
				throw new alz.core.Exception(runtime._lang.unable_to_load_file, url, http.status);
			else if(http.readyState && http.readyState != 4)
				throw new alz.core.Exception(runtime._lang.resource_load_failure, uri);
			else
				data = this._encodeData(http, charset);  //args
			http = null;
			return data;
			//}
		}
	};
	/**
	 * 可以复用HTTP组件的网络调用
	 * @param method {String} 提交方法(GET|POST)
	 * @param url {String} 网络调用的url
	 * @param postData {String|Object} 请求数据
	 * @param type {String} 返回只类型(text|xml)
	 * @param agent {Object|Function} 回调代理对象或者函数对象
	 * @param funName {String} 回调代理对象的回调方法名称
	 * @param cbAgrs {Array} 传给回调方法的参数
	 * @return {String|XmlDocument}
	 * [TODO]
	 *   1)检查 agent 和 agent[funName] 必须有一个是 Function 对象
	 */
	this.netInvoke = function(method, url, postData, type, agent, funName, cbArgs){
		//inner function
		function json2str(json){
			var sb = [];
			for(var k in json){
				//下面的改进，支持跨window的json对象传递，改进逻辑参考clone方法实现
				switch(typeof json[k]){
				//case "undefined": break;  //目前不支持undefined值
				case "boolean":
				case "number":
				case "string":
					sb.push(k + "=" + encodeURIComponent(json[k]));
					break;
				case "object":
					if(json[k] === null){  //null
						//目前不支持null值
					}else{
						//因为跨 window 操作，所以不能使用 instanceof 运算符
						//if(json[k] instanceof Array){
						if("length" in json[k]){  //array
							//把js数组转换成PHP能够接收的PHP数组
							for(var i = 0, len = json[k].length; i < len; i++){
								sb.push(k + "=" + encodeURIComponent(json[k][i]));
							}
						}else{  //object
							//目前不支持object类型的参数
						}
					}
					break;
				}
			}
			return sb.join("&");
		}
		//if(runtime._debug){
		//	check typeof agent || agent[funName] == "function"
		//}
		var req = {
			uniqueid: ++this._uniqueId,  //先加后用
			method  : method,
			url     : url,
			data    : (typeof postData == "string" ? postData : json2str(postData)),
			type    : type,
			agent   : agent,
			fun     : funName,
			args    : cbArgs
		};
		this._queue.push(req);
		req = null;
		if(this._timer == 0) this._startAjaxThread();
		return this._uniqueId;
	};
	this._startAjaxThread = function(msec){
		var _this = this;
		this._timer = runtime.getWindow().setTimeout(function(){
			_this._ajaxThread();
		}, msec || this._msec);
	};
	this._checkAjaxThread = function(retry){
		if(this._queue.length != 0){
			this._startAjaxThread(retry ? this._retryMsec : null);
		}else{
			runtime.getWindow().clearTimeout(this._timer);
			this._timer = 0;
		}
	};
	this._ajaxThread = function(){
		var req  = this._queue[0];
		if(runtime._testCaseWin)
			runtime._testCaseWin.log(req.url + "?" + req.data);
		var _this = this;
		if(this._testCase && this._testCase.doFilter(req.url)){
			var o = this._testCase.doService(req.url, this._testCase.getRequest(req.data));
			if(o){
				window.setTimeout(function(){_this._onTestCaseCallback(o)}, 0);
			}
		}else{
			if(req.type == "script_json"){
				var script = this._getScriptDom();
				script[runtime.ie ? "onreadystatechange" : "onload"] = function(){
					//脚本如果缓存状态为 complete，否则为 loaded
					if(runtime.ie && !(this.readyState == "loaded" || this.readyState == "complete")) return;
					_this._onScriptCallback();
					this[runtime.ie ? "onreadystatechange" : "onload"] = null;
				};
				script.src = req.url + "?"
					+ "_cb_=0,runtime.ajax._data"  //0=(变量赋值，n=v),1=(函数回调，f(v))
					+ "&ts=" + new Date().getTime()
					+ (req.data ? "&" + req.data : "");
				if(!script.parentNode)
					runtime._domScript.parentNode.appendChild(script);
				script = null;
			}else{
				var http = this._openHttp(req.method, req.url, true);
				var _this = this;
				http.onreadystatechange = function(){_this._onAsyncCallback();};
				http.send(req.data);
				http = null;
			}
		}
		req = null;
		return;
	};
	this._onTestCaseCallback = function(o){
		var req = this._queue[0];
		//调用真实的回调函数
		if(typeof(req.agent) == "function")
			req.agent(o, req.args);
		else if(typeof(req.fun) == "function"){
			var fun = req.fun;
			fun.call(req.agent, o, req.args);
			fun = null;
		}else
			req.agent[req.fun](o, req.args);
		this._queue[0] = null;
		this._queue.shift();  //清除队列第一个元素
		this._checkAjaxThread();
	};
	/**
	 * 同步回调函数
	 */
	this._onSyncCallback = function(type){
		if(this._http.readyState != 4)
			throw "资源文件加载失败";
		//检查状态 this._http.readyState 和 this._http.status
		var status = this._http.status;
		if(status == 0 || (status >= 200 && status < 300)){
			return this._getResponseData(type, this._http);
		}else{
			try{
				switch(status){  // The following cases are wininet.dll error codes that may be encountered.
				case 12002: // Server timeout
				case 12007: // (无法解析服务器的名称或地址)The server name or address could not be resolved. Often times caused by a Personal Firewall blocking the Agent.
				case 12029: // 12029 to 12031 correspond to dropped connections.
				case 12030:
				case 12031:
				case 12152: // Connection closed by server.
				case 13030: // See above comments for variable status.
				default:
					runtime.showException("同步请求错误"
						+ "\nstatus=" + status
						+ "\nstatusText=" + this._http.statusText
					);
					break;
				}
			}catch(ex){
			}
		}
	};
	/**
	 * 异步回调函数
	 * [TODO]
	 *   1)把当前出错的请求移动到队列的末尾去，应该更好，但是如果相邻的请求有先后
	 * 依赖关系则不建议这么做。
	 *   2)增加简单的是否重试的确认机制。
	 */
	this._onAsyncCallback = function(){
		if(this._http.readyState != 4) return;
		var retry = false;
		var status = this._http.status;
		if(status == 0 || (status >= 200 && status < 300)){
			this._retryCount = 0;  //只要成功一次，就置零
			var req  = this._queue[0];
			var o = this._getResponseData(req.type, this._http);
			//调用真实的回调函数
			if(typeof(req.agent) == "function"){
				//try{
					req.agent(o, req.args);
				//}catch(ex){
				//	if(ex.message != this._ignoreMessages[0]){
				//		throw ex;
				//	}
				//}
			}else if(typeof(req.fun) == "function"){
				//try{
					var fun = req.fun;
					fun.call(req.agent, o, req.args);
					fun = null;
				//}catch(ex){
				//	if(ex.message != this._ignoreMessages[0]){
				//		throw ex;
				//	}
				//}
			}else{
				//try{
					req.agent[req.fun](o, req.args);
				//}catch(ex){
				//	if(ex.message != this._ignoreMessages[0]){
				//		throw ex;
				//	}
				//}
			}
			req = null;
			this._queue[0] = null;
			this._queue.shift();  //清除队列第一个元素
		}else{
			/*
			try{
				switch(status){  // The following cases are wininet.dll error codes that may be encountered.
				case 12002: // Server timeout
				case 12007: // (无法解析服务器的名称或地址)The server name or address could not be resolved. Often times caused by a Personal Firewall blocking the Agent.
				case 12029: // 12029 to 12031 correspond to dropped connections.
				case 12030:
				case 12031:
				case 12152: // Connection closed by server.
				case 13030: // See above comments for variable status.
					runtime.showException("异步请求错误"
						+ "\nstatus=" + status
						+ "\nstatusText=" + this._http.statusText
					);
					break;
				default:
					break;
				}
			}catch(ex){
			}
			*/
			this._retryCount++;
			if(this._retryCount <= 3){  //重试三次
				retry = true;
			}else{
				retry = runtime.getWindow().confirm("异步请求错误："  //runtime.showException
					+ "\nstatus=" + status
					+ "\nstatusText=" + this._http.statusText
					+ "\n是否重试本次请求？"
				);
			}
			this._http.abort();  //中止当前出错的请求
			if(!retry){  //如果不需要重试的话
				this._queue[0] = null;
				this._queue.shift();  //清除队列第一个元素
			}
		}
		this._checkAjaxThread(retry);
	};
	/**
	 * SCRIPT-src 异步回调函数
	 */
	this._onScriptCallback = function(){
		this._retryCount = 0;  //只要成功一次，就置零
		var req  = this._queue[0];
		var o = this._data;
		this._data = null;  //保证不对其他的请求产生影响
		//调用真实的回调函数
		if(typeof(req.agent) == "function"){
			//try{
				req.agent(o, req.args);
			//}catch(ex){
			//	if(ex.message != this._ignoreMessages[0]){
			//		throw ex;
			//	}
			//}
		}else if(typeof(req.fun) == "function"){
			//try{
				var fun = req.fun;
				fun.call(req.agent, o, req.args);
				fun = null;
			//}catch(ex){
			//	if(ex.message != this._ignoreMessages[0]){
			//		throw ex;
			//	}
			//}
		}else{
			//try{
				req.agent[req.fun](o, req.args);
			//}catch(ex){
			//	if(ex.message != this._ignoreMessages[0]){
			//		throw ex;
			//	}
			//}
		}
		req = null;
		this._queue[0] = null;
		this._queue.shift();  //清除队列第一个元素
		this._checkAjaxThread();
	};
	this._getResponseData = function(type, http){
		var o;  //o = Bytes2BStr(this._http.responseBody);
		switch(type){
		case "text": o = "" + http.responseText;break;
		case "json": o = runtime.parseJson(http.responseText);break;
		case "xml":
		default:
			if(runtime.ie){
				var xmlDoc = runtime.createComObject("Msxml.DOMDocument");
				xmlDoc.async = false;
				xmlDoc.loadXML(http.responseText);
				o = xmlDoc;  //.documentElement
			}else
				o = http.responseXML;
			break;
		}
		return o;
	};
	/*
	this.netInvoke = function(method, url, postData, type, callback){
		try{
			var async = callback ? true : false;
			this._http.open(method, url, async);
			if(async){
				var _this = this;
				this._http.onreadystatechange = function(){
					if(_this._http.readyState == 4){
						_this.onreadystatechange(type, callback);
					}
				};
			}
			/ *
			var div = runtime.getDocument().createElement("div");
			div.style.backgroundColor = "#EEEEEE";
			div.innerHTML = url + "&" + postData;
			im_history.appendChild(div);
			* /
			if(method == "POST")
				this._http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			this._http.send(postData);  //FF下面参数null不能省略
			if(async){
				return;
			}else{
				//检查状态 this._http.readyState 和 this._http.status
				if(this._http.readyState != 4){
					runtime.getWindow().alert("资源文件加载失败");
					return;
				}else{
					return this.onreadystatechange(type);
				}
			}
		}catch(ex){
			var a = [];
			for(var k in ex){
				a.push(k + "=" + ex[k]);
			}
			runtime.getWindow().alert(a.join("\n"));
			return;
		}
	};
	this.onreadystatechange = function(type, callback){
		//code = Bytes2BStr(this._http.responseBody);
		var o;
		switch(type){
		case "text":
			o = "" + this._http.responseText;
			break;
		case "xml":
		default:
			o = this._http.responseXML;
			break;
		}
		if(callback)
			callback(o);
		else
			return o;
	};
	*/
	/**
	 * 调用一个请求队列
	 * @param queue {Array} 请求队列数组
	 * @param callback {Function} 回调函数
	 */
	this.netInvokeQueue = function(queue, callback){
		var i = 0;
		var _this = this;
		function cb(){
			if(i < queue.length){
				var req = queue[i];
				//                        (method, url, postData, type, agent, funName)
				_this.netInvoke.call(_this, req[0], req[1], req[2], req[3], function(data){
					var agent = req[4];
					var fun   = req[5];
					//调用真实的回调函数
					if(typeof(agent) == "function")
						agent(data);
					else if(typeof(fun) == "function"){
						fun.call(agent, data);
					}else
						agent[fun](data);
					fun = null;
					agent = null;
					req = null;
					i++;
					runtime.getWindow().setTimeout(cb, 0);  //调用下一个
				});
			}else{  //队列完成
				callback();
			}
		}
		cb();
	};
	this.getReqIndex = function(uniqueid){
		for(var i = 0, len = this._queue.length; i < len; i++){
			if(this._queue[i].uniqueid == uniqueid){
				return i;
			}
		}
		return -1;
	};
	/**
	 * 终止指定的 uniqueid 的某个请求，队列正常运转
	 * @param uniqueid {number} 每个请求的全局唯一编号
	 */
	this.abort = function(uniqueid){
		var n = this.getReqIndex(uniqueid);
		if(n == -1) return;
		if(n == 0){  //如果是当前请求
			this._http.abort();  //中止当前请求
			this._queue[n] = null;
			this._queue.shift();  //清除队列第一个元素
			this._checkAjaxThread();
		}else{
			this._queue[n] = null;
			this._queue.removeAt(n);
		}
	};
});
/*#file end*/
/*#file begin=alz.core.EventTarget.js*/
_package("alz.core");

_class("EventTarget", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		/**
		 * 所有的事件响应函数都不与组件对象绑定，而是存储在这个映射表中
		 * [注意]不能将该属性放到原型属性里面去，不然两个对象会共享之
		 */
		this._eventMaps = {};  //事件映射表
		//this._listeners = {};
		this._listener = null;
		this._enableEvent = true;
		this._parent = null;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._parent = null;
		this._listener = null;
		_super.dispose.apply(this);
	};
	this.setEnableEvent = function(v){
		this._enableEvent = v;
	};
	this.getParent = function(){
		return this._parent;
	};
	this.setParent = function(v){
		this._parent = v;
	};
	this.addEventListener1 = function(eventMap, listener){
		this._listener = listener;
		if(eventMap == "mouseevent")
			eventMap = "mousedown,mouseup,mousemove,mouseover,mouseout,click,dblclick";
		else if(eventMap == "keyevent")
			eventMap = "keydown,keypress,keypressup";
		var maps = eventMap.split(",");
		for(var i = 0, len = maps.length; i < len; i++){
			if(this._self){
				this._self["on" + maps[i]] = function(ev){
					ev = ev || runtime.getWindow().event;
					//if(ev.type == "mousedown") alert(121);
					if(this._ptr._enableEvent)  //如果启用了事件相应机制，则触发事件
						if(ev.type in this._ptr._listener)
							this._ptr._listener[ev.type].call(this._ptr, ev);
				};
			}
		}
		maps = null;
	};
	this.removeEventListener1 = function(eventMap){
		if(eventMap == "mouseevent")
			eventMap = "mousedown,mouseup,mousemove,mouseover,mouseout,click,dblclick";
		else if(eventMap == "keyevent")
			eventMap = "keydown,keypress,keypressup";
		var maps = eventMap.split(",");
		for(var i = 0, len = maps.length; i < len; i++){
			if(this._self){
				this._self["on" + maps[i]] = null;
			}
		}
		maps = null;
		this._listener = null;
	};
	/**
	 * 此方法允许在事件目标上注册事件侦听器。
	 * @java void addEventListener(String type, EventListener listener, boolean useCapture);
	 * [TODO]检查type的合法值
	 * [TODO]同一个事件响应函数不应该被绑定两次
	 */
	this.addEventListener = function(type, eventHandle, useCapture){
		if(!this._eventMaps[type])
			this._eventMaps[type] = [];  //[TODO]使用{}来模拟多个事件执行顺序的无关性
		this._eventMaps[type].push(eventHandle);
	};
	this.removeEventListener = function(type, eventHandle, useCapture){
		if(this._eventMaps[type]){
			var arr = this._eventMaps[type];
			for(var i = 0, len = arr.length; i < len; i++){
				if(eventHandle == null){  //移除所有事件
					arr[i] = null;
					arr.removeAt(i, 1);
				}else if(arr[i] == eventHandle){
					arr[i] = null;
					arr.removeAt(i, 1);  //移除元素
					break;
				}
			}
		}
	};
	this.dispatchEvent = function(ev){
		var ret = true;
		for(var obj = this; obj; obj = obj.getParent()){  //默认事件传递顺序为有内向外
			if(obj.getDisabled()){
				ev.cancelBubble = true;
				ret = false;
				break;  //continue;
			}
			if(obj["on" + ev.type]){  //如果组件的时间响应方法存在
				ret = obj["on" + ev.type](ev);  //应该判断事件响应函数的返回值并做些工作
				if(ev.cancelBubble)
					return ret;  //如果禁止冒泡，则退出
			}else{
				var map = obj._eventMaps[ev.type];
				if(map){  //检查事件映射表中是否有对应的事件
					var bCancel = false;
					ev.cancelBubble = false;  //还原
					for(var i = 0, len = map.length; i < len; i++){
						ret = map[i].call(obj, ev);
						bCancel = bCancel || ev.cancelBubble;  //有一个为真，则停止冒泡
					}
					ev.cancelBubble = false;  //还原
					if(bCancel)
						return ret;  //如果禁止冒泡，则退出
				}
			}
			//[TODO]事件变更发送者的时候，offsetX,offsetY属性也要随着发生遍化
			ev.sender = obj;
			if(obj._self){  //[TODO] obj 有可能是designBox，而它没有_self属性
				ev.offsetX += obj._self.offsetLeft;
				ev.offsetY += obj._self.offsetTop;
			}
		}
		return ret;
	};
});
/*#file end*/
/*#file begin=alz.core.AppManager.js*/
_package("alz.core");

_class("AppManager", "", function(_super){
	this._init = function(){
		_super._init.call(this);
		this._apps = [];
		this._defaultApp = null;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._defaultApp = null;
		for(var i = 0, len = this._apps.length; i < len; i++){
			this._apps[i] = null;
		}
		this._apps = [];
		_super.dispose.apply(this);
	};
	this.setDefaultApp = function(v){
		this._defaultApp = v;
	};
});
/*#file end*/
/*#file begin=alz.core.Application.js*/
_package("alz.core");

_import("alz.core.EventTarget");

/**
 * [TODO]
 * 1)application 变量在 runtime.createApp 方法返回之后被覆盖了
 */
_class("Application", EventTarget, function(_super){
	var __exts = [];
	Application.regExt = function(fun){  //注册应用的扩展
		var o = new fun();
		__exts.push(o);
		for(var k in o){
			if(k == "_init") continue;  //[TODO]
			if(k == "init" || k == "dispose") continue;  //忽略构造或析构函数
				Application.prototype[k] = o[k];  //绑定到原型上
		}
		o = null;
	};
	this._init = function(){
		__context__.application = this;
		_super._init.call(this);
		this._workspace = null;
		this._hotkey = {};  //热键
		this._domTemp = null;
		/*
		this._cache = {  //参考了 prototype 的实现
			findOrStore: function(value){
				return this[value] = this[value] || function(){
					return value.apply(null, [this].concat(runtime.toArray(arguments)));
				};
			}
		};
		*/
		//执行构造扩展
		for(var i = 0, len = __exts.length; i < len; i++){
			__exts[i]._init.call(this, arguments);
		}
	};
	this.init = function(){
		//_super.init.apply(this, arguments);
		this._workspace = runtime._workspace;
		//注册系统热键
		runtime.getDom().addEventListener(runtime.getDocument(), "keydown", function(ev){
			ev = ev || runtime.getWindow().event;
			if("_" + ev.keyCode in this._hotkey){  //如果存在热键，则执行回掉函数
				var ret, o = this._hotkey["_" + ev.keyCode];
				switch(o.type){
				case 0: ret = o.agent(ev);break;
				case 1: ret = o.agent[o.cb](ev);break;
				case 2: ret = o.cb.apply(o.agent, [ev]);break;
				}
				o = null;
				return ret;
			}
		}, this);
		//执行初始化扩展
		for(var i = 0, len = __exts.length; i < len; i++){
			__exts[i].init.apply(this, arguments);
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		//执行析构扩展
		for(var i = 0, len = __exts.length; i < len; i++){
			__exts[i].dispose.apply(this, arguments);
		}
		this._domTemp = null;
		runtime.getDocument().onkeydown = null;
		for(var k in this._hotkey){
			delete this._hotkey[k];
		}
		this._workspace = null;
		_super.dispose.apply(this);
	};
	this.onContentLoad = function(){
	};
	/**
	 * 注册系统热键
	 * @param keyCode {Number} 热键编码
	 * @param callback {Function} 回调函数
	 */
	this.regHotKey = function(keyCode, agent, callback){
		var type;
		if(typeof(agent) == "function")
			type = 0;
		else if(typeof(agent) == "object" && typeof(callback) == "string")
			type = 1;
		else if(typeof(agent) == "object" && typeof(callback) == "function")
			type = 2;
		else{
			runtime.showException("回调参数错误");
			return;
		}
		if(!this._hotkey["_" + keyCode])
			this._hotkey["_" + keyCode] = {type: type, agent: agent, cb: callback};
	};
	this.createDomElement = function(html){
		if(!this._domTemp)
			this._domTemp = window.document.createElement("div");
		this._domTemp.innerHTML = html;
		return this._domTemp.removeChild(this._domTemp.childNodes[0]);
	};
});
/*#file end*/
/*#file begin=alz.core.WebAppRuntime_core.js*/
_package("alz.core");

_import("alz.core.DOMUtil");
_import("alz.core.AjaxEngine");

_extension("WebAppRuntime", function(){  //注册 WebAppRuntime 扩展
	this.init = function(){  //加载之后的初始化工作
		this.dom = new DOMUtil();
		this.ajax = this.getParentRuntime() ? this._parentRuntime.getAjax() : new AjaxEngine();
		//this.ajax._userinfo = true;
		//设置测试用例
		/*
		var win = this.getMainWindow();
		if(win && typeof(win.runtime) != "unknown" && typeof(win.runtime) != "undefined"){  //winxp下需要检测 win.runtime
			this.ajax.setTestCase(win.runtime.ajax.getTestCase());
		}
		*/
	};
	this.dispose = function(){
		if(this.dom){
			this.dom.dispose();
			this.dom = null;
		}
		if(this.ajax){
			if(!this._parentRuntime)
				this.ajax.dispose();
			this.ajax = null;
		}
	};
	/**
	 * 返回用于操作DOM元素的工具类对象
	 */
	this.getDom = function(){
		return this.dom;
	};
	/**
	 * 返回用于异步交互的异步交互引擎
	 */
	this.getAjax = function(){
		return this.ajax;
	};
	/**
	 * 去除字符串前后的空白字符
	 * @param str {String} 要处理的字符串
	 */
	this.trim = function(str){
		return str.replace(/(^\s*)|(\s*$)/g, "");
	};
	this.closure = function(o, fun, p1, p2){
		return function(){
			if(typeof(o) == "object" && typeof(fun) == "string" && typeof(o[fun]) == "function")
				return o[fun](p1, p2);
			else if(typeof(o) == "function")
				return o(fun, p1, p2);
			else
				showMessage("[ERROR]闭包使用错误！");
		};
	};
	/**
	 * HTML 代码编码方法
	 * @param html {String} 要编码的 HTML 代码字符串
	 */
	this.encodeHTML = function(html){
		if(!html)
			return "";
		else
			return html
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/\"/g, "&quot;")
				//.replace(/\'/g, "&apos;")
				.replace(/ /g, "&nbsp;")
				.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
				.replace(/\r?\n/g, "<br />");
	};
	/**
	 * HTML 代码解码方法
	 * @param html {String} 要解码的 HTML 代码字符串
	 */
	this.decodeHTML = function(html){
		return html
			//.replace(/&#37;/ig, '%')
			.replace(/&nbsp;/ig, " ")
			.replace(/&quot;/ig, "\"")
			//.replace(/&apos;/ig, "\'")
			.replace(/&gt;/ig, ">")
			.replace(/&lt;/ig, "<")
			.replace(/&#(\d{2}|\d{4});/ig, function($0, $1){
				return String.fromCharCode($1);
			})
			.replace(/&amp;/ig, "&");
	};
	/**
	 * 根据参数 progid 创建一个 ActiveXObject，成功返回对象，失败返回 null
	 * @param progid {String} ActiveXObject 控件的 PROGID
	 */
	this.createComObject = function(progid){
		try{
			if(this._hostenv == "ie" && this._win.host)
				return this._win.host.createComObject(progid);
			else
				return new ActiveXObject(progid);
		}catch(ex){
			this.showException(ex, "创建 {0} 组件失败".replace(/\{0\}/, progid));
			return null;
		}
	};
	/*this.getMainWindow = function(){
		var win;
		if(!this.inGadget){
			if(this._win.opener) win = this._win.opener;
			//else ;
		}else
			win = System.Gadget.document.parentWindow;
		return win;
	};*/
	this.getParentWindow = function(){
		return this.getMainWindow();
	};
	/**
	 * 根据 className 获取相应的 DOM 元素
	 * @return {Array} 符合条件的元素组成的数组
	 * @todo 效率极低，有待优化
	 */
	this.getElementsByClassName = function(className){
		var a = [];
		var els = this._doc.getElementsByTagName("*");
		for(var i = 0, len = els.length; i < len; i++){
			if(els[i].className.indexOf(className) != -1){
				a.push(els[i]);
			}
		}
		return a;
	};
	this.openDialog = function(url, width, height){
		var screen = {
			w: this._win.screen.availWidth,
			h: this._win.screen.availHeight
		};
		var features = "fullscreen=0,channelmode=0,toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=0,resizable=1"
			+ ",left=" + Math.round((screen.w - width) / 2)
			+ ",top=" + Math.round((screen.h - height) / 2)
			+ ",width=" + width
			+ ",height=" + height;
		//return this._win.showModelessDialog(url, "123", "dialogTop:100px;dialogLeft:100px;dialogWidth:400px;dialogHeight:580px;resizable:1;status:0;help:0;edge:raised;");
		return this._win.open(url, "_blank", features);
	};
	this.createEvent = function(ev){
		var o = {};
		//o.sender = ev.sender || null;  //事件发送者
		o.type = ev.type;
		o.target = ev.srcElement || ev.target;  //IE和FF的差别
		o.reason = ev.reason;
		o.cancelBubble = ev.cancelBubble;
		o.returnValue = ev.returnValue;
		o.srcFilter = ev.srcFilter;
		o.fromElement = ev.fromElement;
		o.toElement = ev.toElement;
		//mouse event
		o.button = ev.button;
		o.screenX = ev.screenX;
		o.screenY = ev.screenY;
		o.clientX = ev.clientX;
		o.clientY = ev.clientY;
		o.offsetX = ev.offsetX || 0;
		o.offsetY = ev.offsetY || 0;
		o.x = ev.x || ev.clientX;
		o.y = ev.y || ev.clientY;
		//key event
		o.altKey = ev.altKey;
		o.ctrlKey = ev.ctrlKey;
		o.shiftKey = ev.shiftKey;
		o.keyCode = ev.keyCode;
		return o;
	};
});
/*#file end*/

runtime.regLib("core", function(){  //加载之后的初始化工作

});

}})(this);