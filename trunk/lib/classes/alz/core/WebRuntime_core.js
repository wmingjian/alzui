_package("alz.core");

//_import("alz.core.XPathQuery");
_import("alz.core.DOMUtil");
//_import("alz.core.DOMUtil2");
_import("alz.core.AjaxEngine");
_import("alz.core.AppManager");

_extension("WebRuntime", function(){  //ע�� WebRuntime ��չ
	this._init = function(){  //����֮��ĳ�ʼ������
		//this.selector = new XPathQuery();
		this.dom = new DOMUtil();
		//this.domutil = new DomUtil2();
		this._ajax = this.getParentRuntime() ? this._parentRuntime.getAjax() : new AjaxEngine();
		//this._ajax._userinfo = true;
		//���ò�������
		/*
		var win = this.getMainWindow();
		if(win && typeof win.runtime != "unknown" && typeof win.runtime != "undefined"){  //winxp����Ҫ��� win.runtime
			this._ajax.setTestCase(win.runtime._ajax.getTestCase());
		}
		*/
		if(this._debug){
			window.document.onmousedown = function(ev){
				ev = ev || window.event;
				if(ev.ctrlKey){
					var target = ev.target || ev.srcElement;
					for(var el = target; el; el = el.parentNode){
						if(el.__ptr__){
							var arr = runtime.forIn(el.__ptr__);
							arr.push("class=" + el.className);
							arr.push("tagName=" + el.tagName);
							window.alert(arr.join("\n"));
							arr = null;
							break;
						}
					}
				}
			};
		}
		this._appManager = new AppManager();
		this._product = null;
		if(typeof sinamail_data != "undefined"){
			this.regProduct(sinamail_data);
		}
	};
	this.dispose = function(){
		this._product = null;
		this._appManager.dispose();
		this._appManager = null;
		if(this._debug){
			window.document.onmousedown = null;
		}
		if(this._ajax){
			if(!this._parentRuntime){
				this._ajax.dispose();
			}
			this._ajax = null;
		}
		//this.domutil.dispose();
		//this.domutil = null;
		if(this.dom){
			this.dom.dispose();
			this.dom = null;
		}
		//this.selector.dispose();
		//this.selector = null;
	};
	/**
	 * �������ڲ���DOMԪ�صĹ��������
	 */
	this.getDom = function(){
		return this.dom;
	};
	/**
	 * ���������첽�������첽��������
	 */
	this.getAjax = function(){
		return this._ajax;
	};
	this.getAppManager = function(){
		return this._appManager;
	};
	/**
	 * ȥ���ַ���ǰ��Ŀհ��ַ�
	 * @param str {String} Ҫ������ַ���
	 */
	this.trim = function(str){
		return str.replace(/(^\s*)|(\s*$)/g, "");
	};
	this.closure = function(o, fun, p1, p2){
		return function(){
			if(typeof o == "object" && typeof fun == "string" && typeof o[fun] == "function"){
				return o[fun](p1, p2);
			}else if(typeof o == "function"){
				return o(fun, p1, p2);
			}else{
				runtime.log("[ERROR]�հ�ʹ�ô���");
			}
		};
	};
	/**
	 * HTML ������뷽��
	 * @param html {String} Ҫ����� HTML �����ַ���
	 */
	this.encodeHTML = function(html){
		if(!html){
			return "";
		}else{
			return html
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/\"/g, "&quot;")
				//.replace(/\'/g, "&apos;")
				.replace(/ /g, "&nbsp;")
				.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
				.replace(/\r?\n/g, "<br />");
		}
	};
	/**
	 * HTML ������뷽��
	 * @param html {String} Ҫ����� HTML �����ַ���
	 */
	this.decodeHTML = function(html){
		if(!html){
			return "";
		}else{
			return html
				//.replace(/&#37;/ig, '%')
				.replace(/&nbsp;/ig, " ")
				.replace(/&quot;/ig, "\"")
				//.replace(/&apos;/ig, "\'")
				.replace(/&gt;/ig, ">")
				.replace(/&lt;/ig, "<")
				.replace(/&#(\d{2}|\d{4});/ig, function(_0, _1){
					return String.fromCharCode(_1);
				})
				.replace(/&amp;/ig, "&");
		}
	};
	/**
	 * ���ݲ��� progid ����һ�� ActiveXObject���ɹ����ض���ʧ�ܷ��� null
	 * @param progid {String} ActiveXObject �ؼ��� PROGID
	 */
	this.createComObject = function(progid){
		try{
			if(this._hostenv == "ie" && this._win.host){
				return this._win.host.createComObject(progid);
			}else{
				return new ActiveXObject(progid);
			}
		}catch(ex){
			this.showException(ex, "���� {0} ���ʧ��".replace(/\{0\}/, progid));
			return null;
		}
	};
	/*this.getMainWindow = function(){
		var win;
		if(!this.inGadget){
			if(this._win.opener){
				win = this._win.opener;
			}/ *else{
				;
			}* /
		}else{
			win = System.Gadget.document.parentWindow;
		}
		return win;
	};*/
	this.getParentWindow = function(){
		return this.getMainWindow();
	};
	/**
	 * ���� className ��ȡ��Ӧ�� DOM Ԫ��
	 * @return {Array} ����������Ԫ����ɵ�����
	 * [TODO]Ч�ʼ��ͣ��д��Ż�
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
		//o.sender = ev.sender || null;  //�¼�������
		o.type = ev.type;
		o.target = ev.srcElement || ev.target;  //IE��FF�Ĳ��
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
	this.createApp = function(appClassName, parentApp, len){
		return this._appManager.createApp(appClassName, parentApp, len);
	};
	/**
	 * ע���Ʒ
	 */
	this.regProduct = function(v){
		this._product = v;
		this._appManager.setConfList(v.app);
	};
	this.getProduct = function(){
		if(!this._product){
			runtime.log("[WebRuntime::getProduct]data_xxx.jsδ����ȷ���أ�ϵͳ�޷��������У����飡");
			this._product = {
				"name" : "",  //��Ʒ����
				"tpl"  : [],  //ģ��
				"skin" : [],  //Ƥ��
				"paper": [],  //��ֽ
				"app"  : []   //APP����
			};
		}
		return this._product;
	};
});