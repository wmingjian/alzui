_package("alz.core");

_import("alz.core.DOMUtil");
//_import("alz.core.DOMUtil2");
_import("alz.core.AjaxEngine");
_import("alz.core.XPathQuery");
_import("alz.template.TemplateManager");
_import("alz.core.ActionCollection");
_import("alz.core.ProductManager");

_extension("WebRuntime", function(){  //注册 WebRuntime 扩展
	var properties = ["_ajax", "_template", "_actionCollection", "_productManager"];
	this.__conf__({
		"plugin": [  //插件配置列表
			{"id": "ajax"            , "clazz": "AjaxEngine"      },  //异步请求引擎
			{"id": "dom"             , "clazz": "DOMUtil"         },  //DOM操作工具
		//{"id": "element"         , "clazz": "Element"         },  //DOM元素操作
		//{"id": "animation"       , "clazz": "AnimationEngine" },  //动画引擎
		//{"id": "eventManager"    , "clazz": "EventManager"    },  //事件管理
		//{"id": "gestureManager"  , "clazz": "GestureManager"  },  //手势管理
			{"id": "xpq"             , "clazz": "XPathQuery"      },  //xpath选择器
			{"id": "template"        , "clazz": "TemplateManager" },  //模版引擎
			{"id": "actionCollection", "clazz": "ActionCollection"},  //用户行为动作收集器
			{"id": "productManager"  , "clazz": "ProductManager"  }   //产品管理者
		]
	});
	this._init = function(){  //加载之后的初始化工作
		//创建插件
		//this._pluginManager.create(this, this.findConf("plugin"));
		this._xpq = new XPathQuery();
		//this.regPlugin("dom", DOMUtil);
		this.dom = new DOMUtil();
		//this.domutil = new DomUtil2();
		if(!this.getParentRuntime()){
			this._ajax = new AjaxEngine();  //异步交互引擎
			this._template = new TemplateManager();  //模版引擎
			this._actionCollection = new ActionCollection();
			//[TODO]一个运行时环境需要管理多个产品配置信息么？
			this._productManager = new ProductManager();
		}else{
			for(var i = 0, len = properties.length; i < len; i++){
				var k = properties[i];
				this[k] = this._parentRuntime["get" + k.charAt(1).toUpperCase() + k.substr(2)]();
			}
			/*
			this._ajax = this._parentRuntime.getAjax();
			this._template = this._parentRuntime.getTemplate();
			this._actionCollection = this._parentRuntime.getActionCollection();
			*/
		}
		//this._ajax._userinfo = true;
		//设置测试用例
		/*
		var win = this.getMainWindow();
		if(win && typeof win.runtime != "unknown" && typeof win.runtime != "undefined"){  //winxp下需要检测 win.runtime
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
		//if(typeof sinamail_data != "undefined"){
		//	this.regProduct(sinamail_data);
		//}
	};
	this.dispose = function(){
		this._productManager.dispose();
		this._productManager = null;
		if(this._debug){
			window.document.onmousedown = null;
		}
		for(var i = 0, len = properties.length; i < len; i++){
			var k = properties[i];
			if(this[k]){
				if(!this._parentRuntime){
					this[k].dispose();
				}
				this[k] = null;
			}
		}
		//this.domutil.dispose();
		//this.domutil = null;
		/*
		if(this.dom){
			this.dom.dispose();
			this.dom = null;
		}
		*/
		this._xpq.dispose();
		this._xpq = null;
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
		return this._ajax;
	};
	this.getTemplate = function(){
		return this._template;
	};
	this.getActionCollection = function(){
		return this._actionCollection;
	};
	this.getProductManager = function(){
		return this._productManager;
	};
	/**
	 * 去除字符串前后的空白字符
	 * @param {String} str 要处理的字符串
	 */
	this.trim = function(str){
		return str.replace(/(^\s*)|(\s*$)/g, "");
	};
	this.closure = function(o, func, p1, p2){
		return function(){
			if(typeof o == "object" && typeof func == "string" && typeof o[func] == "function"){
				return o[func](p1, p2);
			}else if(typeof o == "function"){
				return o(func, p1, p2);
			}else{
				runtime.log("[ERROR]闭包使用错误！");
			}
		};
	};
	/**
	 * HTML 代码编码方法
	 * @param {String} html 要编码的 HTML 代码字符串
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
	 * HTML 代码解码方法
	 * @param {String} html 要解码的 HTML 代码字符串
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
	 * 根据参数 progid 创建一个 ActiveXObject，成功返回对象，失败返回 null
	 * @param {String} progid ActiveXObject 控件的 PROGID
	 */
	this.createComObject = function(progid){
		try{
			if(this._hostenv == "ie" && this._win.host){
				return this._win.host.createComObject(progid);
			}else{
				return new ActiveXObject(progid);
			}
		}catch(ex){
			this.showException(ex, "创建 {0} 组件失败".replace(/\{0\}/, progid));
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
	this.openDialog = function(url, width, height){
		var screen = {
			"w": this._win.screen.availWidth,
			"h": this._win.screen.availHeight
		};
		var features = "fullscreen=0,channelmode=0,toolbar=0,location=0,"
			+ "directories=0,status=0,menubar=0,scrollbars=0,resizable=1"
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
	/**
	 * 注册产品
	 */
	this.regProduct = function(v){
		this._productManager.regProduct(v);
		this._appManager.setConfList(v.app);
		this._template.init("tpl/");  //模板
		this._template.appendItems(v.tpl);
	};
	/**
	 * 注册一组模板列表数据
	 */
	/*
	this.regTpl = function(data){
		this._template.appendItems(data);
	};
	*/
	/**
	 * 注册一个动态创建的模板
	 */
	this.__tpl__ = function(name, type, data){
		this._template.appendItem(name, type, data);
	};
	/*
	//检查组件上的DOM属性及其事件是否清理干净
	this.checkDomClean = function(component){
		//this.checkEvents(component._self);
		/ *
		var hash = component;
		for(var k in hash){
			if(typeof hash[k] == "obj"){
			}
		}
		* /
	};
	this._alert = window.alert;
	this.checkEvents = function(el){
		if(el.__checked__) return;
		var a = [];
		for(var k in el){
			a.push(k);
			if(k == "__checked__") continue;
			if(k == "_ptr") break;
			if(k.substr(0, 2) == "on" && typeof el[k] == "function"){
				if(this._alert){
					this._alert(el);
				}
			}
			try{
			if(el.hasChildNodes && el.hasChildNodes()){
				var nodes = el.childNodes;
				for(var i = 0, len = nodes.length; i < len; i++){
					this.checkEvents(nodes[i]);
				}
				nodes = null;
			}
			}catch(ex){
				window.alert(ex);
			}
		}
		el.__checked__ = true;
	};
	this.getProduct = function(){
		if(!this._product){
			runtime.log("[WebRuntime::getProduct]data_xxx.js未能正确加载，系统无法正常运行，请检查！");
			this._product = {
				"name" : "",  //产品名称
				"tpl"  : [],  //模板
				"skin" : [],  //皮肤
				"paper": [],  //信纸
				"app"  : []   //APP配置
			};
		}
		return this._product;
	};
	*/
	/**
	 * 根据 className 获取相应的 DOM 元素
	 * @return {Array} 符合条件的元素组成的数组
	 * [TODO]效率极低，有待优化
	 */
	/*
	this.getElementsByClassName = function(className){
		var a = [];
		var nodes = this._doc.getElementsByTagName("*");
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			if(node.className.indexOf(className) != -1){
				a.push(node);
			}
		}
		return a;
	};
	*/
});