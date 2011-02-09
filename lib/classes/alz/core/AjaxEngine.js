_package("alz.core");

//_import("alz.core.Exception");
_import("alz.core.ScriptLoader");
//_import("alz.core.IframeLoader");

//������ runtime, runtime.getBrowser()
//[TODO]
//  1)��ӷ���������ƣ���֤������еĳ�������
//  2)��·���е��첽���󣬱�֤�����������ܹ���������

/**
 * �첽���ݵ�������
 * [TODO]��ҳ�湤��
 */
_class("AjaxEngine", "", function(){
	AjaxEngine._version = "1.01.0001";  //Ajax����ĵ�ǰ�汾
	AjaxEngine._PROGIDS = [
		"Microsoft.XMLHTTP",
		"Msxml2.XMLHTTP",
		"Msxml2.XMLHTTP.4.0",
		"MSXML3.XMLHTTP",
		"MSXML.XMLHTTP",
		"MSXML2.ServerXMLHTTP"
	];
	//VBS�汾�� UTF-8 ���뺯�����������������Ч�ʵ��£����ã�
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
		this._retryMsec = 2000;  //����ʧ�����Ե�ʱ����
		this._http = null;  //[TODO]�������Ӧ�ý����첽�������ʹ��
		this._queue = [];  //�첽�������
		this._uniqueId = 0;  //ÿ�������ȫ��Ψһ��ŵ�����
		this._userinfo = false;
		this._testCase = null;  //��������
		this._retryCount = 0;
		this._scriptLoader = null;
		this._data = null;  //script-src������ȡ��������ʱ�洢��
		this._ignoreMessages = [
			"����ִ�����ͷ� Script �Ĵ���"
			//"��ɸò�����������ݻ�����ʹ�á�"
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
		//if(runtime.getWindow().Event){  //FF �� NS ֧�� Event ����
		if(runtime.moz){  //FF
			var ext = url.substr(url.lastIndexOf("."));
			if(ext == ".xml" || ext == ".aul"){
				http.overrideMimeType("text/xml; charset=gb2312");  //���ڽ� UTF-8 ת��Ϊ gb2312
			}else{
				http.overrideMimeType("text/xml");
				//http.setRequestHeader("Content-Type", "text/xml");
				//http.setRequestHeader("Content-Type", "gb2312");
			}
		}
		return http;
	};
	/**
	 * @param method {String} �ύ����(GET|POST)
	 * @param url {String} ������õ�url
	 * @param postData {String|Object} ��������
	 * @param type {String} ����ֻ����(text|xml)
	 * @param callback {Function} �ص�����
	 * @param cbAgrs {Array} �����ص������Ĳ���
	 * @return {String|XmlDocument}
	 */
	this.netInvoke1 = function(method, url, postData, type, callback){
		try{
			var async = (typeof(callback) != "undefined" && callback != null) ? true : false;
			if(async){  //������첽����ʹ��������й���ģʽ
				return this.netInvoke(method, url, postData, type, callback);
			}else{
				var http = this._openHttp(method, url, async);
				/*
				var div = window.document.createElement("div");
				div.style.backgroundColor = "#EEEEEE";
				div.innerHTML = url + "&" + postData;
				im_history.appendChild(div);
				*/
				http.send(postData);  //FF�������null����ʡ��
				http = null;
				return this._onSyncCallback(type);
			}
		}catch(ex){
			runtime.showException(ex, "[AjaxEngine::netInvoke1]");
			return;
		}
	};
	//��Ƕ����
	this._encodeData = function(http, charset){
		if(runtime.getWindow() && charset == "utf-8"){
			return "" + http.responseText;
		}else if(runtime.getWindow() && runtime.getWindow().execScript){  //FF ��֧�� execScript
			if(typeof(VBS_bytes2BStr) == "undefined"){
				runtime.getWindow().execScript(AjaxEngine._vbsCode, "VBScript");
			}
			return VBS_bytes2BStr(http.responseBody);
		}else{
			//[TODO]ֱ�ӷ��� responseText ������ UTF-8 ������������������
			return http.responseText;
		}
	};
	//������������ʹ�õķ���
	this.netInvoke2 = function(method, url, postData, charset, agent, funName, args){
		var async = (typeof(agent) != "undefined" && agent != null) ? true : false;
		if(async){  //������첽����ʹ��������й���ģʽ
			return this.netInvoke(method, url, postData, type, agent, funName, args);
		}else{
			var http = this._openHttp(method, url, async);
			if(runtime.getHostenv() == "safari" || runtime.getHostenv() == "chrome"){  //Safari������Ҫ��һ��
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
			http.send("");  //û�� "" �Ļ� FF ����ᱨ��
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
	 * ���Ը���HTTP������������
	 * @param method {String} �ύ����(GET|POST)
	 * @param url {String} ������õ�url
	 * @param postData {String|Object} ��������
	 * @param type {String} ����ֻ����(text|xml)
	 * @param agent {Object|Function} �ص����������ߺ�������
	 * @param funName {String} �ص��������Ļص���������
	 * @param cbAgrs {Array} �����ص������Ĳ���
	 * @return {String|XmlDocument}
	 * [TODO]
	 *   1)��� agent �� agent[funName] ������һ���� Function ����
	 */
	this.netInvoke = function(method, url, postData, type, agent, funName, cbArgs){
		//inner function
		function json2str(json){
			var sb = [];
			for(var k in json){
				//����ĸĽ���֧�ֿ�window��json���󴫵ݣ��Ľ��߼��ο�clone����ʵ��
				switch(typeof json[k]){
				//case "undefined": break;  //Ŀǰ��֧��undefinedֵ
				case "boolean":
				case "number":
				case "string":
					sb.push(k + "=" + encodeURIComponent(json[k]));
					break;
				case "object":
					if(json[k] === null){  //null
						//Ŀǰ��֧��nullֵ
					}else{
						//��Ϊ�� window ���������Բ���ʹ�� instanceof �����
						//if(json[k] instanceof Array){
						if("length" in json[k]){  //array
							//��js����ת����PHP�ܹ����յ�PHP����
							for(var i = 0, len = json[k].length; i < len; i++){
								sb.push(k + "=" + encodeURIComponent(json[k][i]));
							}
						}else{  //object
							//Ŀǰ��֧��object���͵Ĳ���
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
			uniqueid: ++this._uniqueId,  //�ȼӺ���
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
	 * ��ͣ�첽����Ĺ����߳�
	 * @param abort {boolean} �Ƿ��жϵ�ǰ������
	 */
	this.pauseAjaxThread = function(abort){
		if(abort){
			this._http.abort();  //��ֹ��ǰ����
		}
		runtime.getWindow().clearTimeout(this._timer);  //������ʱ��
		this._timer = 0;
	};
	/**
	 * ��ʼ�첽����Ĺ����߳�
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
		//������ʵ�Ļص�����
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
		this._queue.shift();  //������е�һ��Ԫ��
		this._checkAjaxThread();
	};
	/**
	 * ͬ���ص�����
	 */
	this._onSyncCallback = function(type){
		if(this._http.readyState != 4){
			throw "��Դ�ļ�����ʧ��";
		}
		//���״̬ this._http.readyState �� this._http.status
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
					runtime.showException("ͬ���������"
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
	 * �첽�ص�����
	 * [TODO]
	 *   1)�ѵ�ǰ����������ƶ������е�ĩβȥ��Ӧ�ø��ã�����������ڵ��������Ⱥ�
	 * ������ϵ�򲻽�����ô����
	 *   2)���Ӽ򵥵��Ƿ����Ե�ȷ�ϻ��ơ�
	 */
	this._onAsyncCallback = function(){
		if(this._http.readyState != 4) return;
		var retry = false;
		var status = this._http.status;
		if(status == 0 || (status >= 200 && status < 300)){
			this._retryCount = 0;  //ֻҪ�ɹ�һ�Σ�������
			var req  = this._queue[0];
			var o = this._getResponseData(req.type, this._http);
			//������ʵ�Ļص�����
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
			this._queue.shift();  //������е�һ��Ԫ��
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
					runtime.showException("�첽�������"
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
			if(this._retryCount <= 3){  //��������
				retry = true;
			}else{
				retry = runtime.getWindow().confirm("�첽�������"  //runtime.showException
					+ "\nstatus=" + status
					+ "\nstatusText=" + this._http.statusText
					+ "\n�Ƿ����Ա�������"
				);
			}
			this._http.abort();  //��ֹ��ǰ���������
			if(!retry){  //�������Ҫ���ԵĻ�
				this._queue[0] = null;
				this._queue.shift();  //������е�һ��Ԫ��
			}
		}
		this._checkAjaxThread(retry);
	};
	/**
	 * SCRIPT-src �첽�ص�����
	 */
	this._onScriptCallback = function(){
		this._retryCount = 0;  //ֻҪ�ɹ�һ�Σ�������
		var req  = this._queue[0];
		var o = this._data;
		this._data = null;  //��֤�����������������Ӱ��
		//������ʵ�Ļص�����
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
		this._queue.shift();  //������е�һ��Ԫ��
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
			this._http.send(postData);  //FF�������null����ʡ��
			if(async){
				return;
			}else{
				//���״̬ this._http.readyState �� this._http.status
				if(this._http.readyState != 4){
					runtime.getWindow().alert("��Դ�ļ�����ʧ��");
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
	 * ����һ���������
	 * @param queue {Array} �����������
	 * @param agent {Object} �ص��������
	 * @param callback {Function} �ص�����
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
					//������ʵ�Ļص�����
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
					runtime.getWindow().setTimeout(cb, 0);  //������һ��
				});
			}else{  //�������
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
	 * ��ָֹ���� uniqueid ��ĳ�����󣬶���������ת
	 * @param uniqueid {number} ÿ�������ȫ��Ψһ���
	 */
	this.abort = function(uniqueid){
		var n = this.getReqIndex(uniqueid);
		if(n == -1) return;
		if(n == 0){  //����ǵ�ǰ����
			this._http.abort();  //��ֹ��ǰ����
			this._queue[n] = null;
			this._queue.shift();  //������е�һ��Ԫ��
			this._checkAjaxThread();
		}else{
			this._queue[n] = null;
			this._queue.removeAt(n);
		}
	};
});