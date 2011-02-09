_package("alz.core");

//_import("alz.core.Exception");
_import("alz.core.ScriptLoader");
//_import("alz.core.IframeLoader");

//依赖于 runtime, runtime.getBrowser()
//[TODO]
//  1)添加防错误处理机制，保证请求队列的持续工作
//  2)短路所有的异步请求，保证单机环境下能够正常工作

/**
 * 异步数据调用引擎
 * [TODO]跨页面工作
 */
_class("AjaxEngine", "", function(){
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
		this._scriptLoader = null;
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
		//if(this._disposed) return;
		this._data = null;
		if(this._scriptLoader){
			this._scriptLoader.dispose();
			this._scriptLoader = null;
		}
		this._testCase = null;
		this._timer = 0;
		this._http = null;
		for(var i = 0, len = this._queue.length; i < len; i++){
			this._queue[i] = null;
		}
		this._queue = [];
		_super.dispose.apply(this);
	};
	this.getTestCase = function(){
		return this._testCase;
	};
	this.setTestCase = function(v){
		this._testCase = v;
	};
	this._getScriptLoader = function(){
		if(runtime.moz || !this._scriptLoader){
			this._scriptLoader = new ScriptLoader();
			this._scriptLoader.create();
		}
		return this._scriptLoader;
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
			if(async){  //如果是异步请求，使用请求队列工作模式
				return this.netInvoke(method, url, postData, type, callback);
			}else{
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
		if(runtime.getWindow() && charset == "utf-8"){
			return "" + http.responseText;
		}else if(runtime.getWindow() && runtime.getWindow().execScript){  //FF 不支持 execScript
			if(typeof(VBS_bytes2BStr) == "undefined"){
				runtime.getWindow().execScript(AjaxEngine._vbsCode, "VBScript");
			}
			return VBS_bytes2BStr(http.responseBody);
		}else{
			//[TODO]直接返回 responseText 会有因 UTF-8 编码而引起的乱码问题
			return http.responseText;
		}
	};
	//供加载类库代码使用的方法
	this.netInvoke2 = function(method, url, postData, charset, agent, funName, args){
		var async = (typeof(agent) != "undefined" && agent != null) ? true : false;
		if(async){  //如果是异步请求，使用请求队列工作模式
			return this.netInvoke(method, url, postData, type, agent, funName, args);
		}else{
			var http = this._openHttp(method, url, async);
			if(runtime.getHostenv() == "safari" || runtime.getHostenv() == "chrome"){  //Safari下面需要这一句
				http.onreadystatechange = null;
			}
			/*if(async){
				http.onreadystatechange = function(){
					if(http.readyState != 4) return;
					if(typeof(agent[funName]) == "function"){
						agent[funName](http.responseText);
					}else{
						agent(http.responseText);
					}
				};
			}*/
			http.send("");  //没有 "" 的话 FF 下面会报错
			//if(!async){
			var data;
			if(http.status && (200 > http.status || 300 <= http.status)){
				throw new alz.core.Exception(runtime._lang.unable_to_load_file, url, http.status);
			}else if(http.readyState && http.readyState != 4){
				throw new alz.core.Exception(runtime._lang.resource_load_failure, uri);
			}else{
				data = this._encodeData(http, charset);  //args
			}
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
	/**
	 * 暂停异步请求的工作线程
	 * @param abort {boolean} 是否中断当前的请求
	 */
	this.pauseAjaxThread = function(abort){
		if(abort){
			this._http.abort();  //中止当前请求
		}
		runtime.getWindow().clearTimeout(this._timer);  //结束定时器
		this._timer = 0;
	};
	/**
	 * 开始异步请求的工作线程
	 */
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
			this.pauseAjaxThread();
		}
	};
	this._ajaxThread = function(){
		var req  = this._queue[0];
		if(runtime._testCaseWin){
			runtime._testCaseWin.log(req.url + "?" + req.data);
		}
		var _this = this;
		if(this._testCase && this._testCase.doFilter(req.url)){
			var o = this._testCase.doService(req.url, this._testCase.getRequest(req.data));
			if(o){
				window.setTimeout(function(){_this._onTestCaseCallback(o)}, 0);
			}
		}else{
			if(req.type == "script_json"){
				var loader = this._getScriptLoader();
				loader.setCallback(function(){
					_this._onScriptCallback();
				});
				loader.load(req.url, req.data);
				loader = null;
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
		if(typeof(req.agent) == "function"){
			req.agent(o, req.args);
		}else if(typeof(req.fun) == "function"){
			var fun = req.fun;
			fun.call(req.agent, o, req.args);
			fun = null;
		}else{
			req.agent[req.fun](o, req.args);
		}
		this._queue[0] = null;
		this._queue.shift();  //清除队列第一个元素
		this._checkAjaxThread();
	};
	/**
	 * 同步回调函数
	 */
	this._onSyncCallback = function(type){
		if(this._http.readyState != 4){
			throw "资源文件加载失败";
		}
		//检查状态 this._http.readyState 和 this._http.status
		var status = this._http.status;
		if(status == 0 || (status >= 200 && status < 300)){
			return this._getResponseData(type, this._http);
		}else{
			try{
				switch(status){
				case 12002: // Server timeout
				case 12007:
				case 12029: // 12029 to 12031 correspond to dropped connections.
				case 12030: // See above comments for variable status.
				case 12031: // Internet connection reset error.
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
				switch(status){
				case 12002: // Server timeout
				case 12007:
				case 12029: // 12029 to 12031 correspond to dropped connections.
				case 12030: // See above comments for variable status.
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
			}else{
				o = http.responseXML;
			}
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
			if(method == "POST"){
				this._http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			}
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
		if(callback){
			callback(o);
		}else{
			return o;
		}
	};
	*/
	/**
	 * 调用一个请求队列
	 * @param queue {Array} 请求队列数组
	 * @param agent {Object} 回调代理对象
	 * @param callback {Function} 回调函数
	 */
	this.netInvokeQueue = function(queue, agent, callback){
		var i = 0;
		var _this = this;
		function cb(){
			if(i < queue.length){
				var req = queue[i];
				//netInvoke(method, url, postData, type, agent, funName)
				_this.netInvoke.call(_this, req[0], req[1], req[2], req[3], function(data){
					var agent = req[4];
					var fun   = req[5];
					//调用真实的回调函数
					if(typeof(agent) == "function"){
						agent(data, req[6]);
					}else if(typeof(fun) == "function"){
						fun.call(agent, data, req[6]);
					}else{
						agent[fun](data, req[6]);
					}
					fun = null;
					agent = null;
					req = null;
					i++;
					runtime.getWindow().setTimeout(cb, 0);  //调用下一个
				});
			}else{  //队列完成
				callback.apply(agent);
			}
		}
		cb.call(this);
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