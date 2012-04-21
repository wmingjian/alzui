_package("alz.core");

//_import("alz.core.ActionManager");
_import("alz.core.ToggleManager");
_import("alz.mui.Workspace");
_import("alz.mui.Dialog");

_extension("WebRuntime", function(){  //注册 WebRuntime 扩展
	this._init = function(){  //加载之后的初始化工作
		this._domTemp = null;
		this.toggleMgr = new ToggleManager();
		//this.actionManager = new ActionManager();
		this._workspace = new Workspace();
	};
	this.dispose = function(){
		if(this._workspace){
			this._workspace.dispose();
			this._workspace = null;
		}
		if(this._testCaseWin){
			this._testCaseWin.dispose();
			this._testCaseWin = null;
		}
		this.toggleMgr.dispose();
		this.toggleMgr = null;
		//this.actionManager.dispose();
		//this.actionManager = null;
		this._domTemp = null;
	};
	this.onLoad = function(ev){
		if(true || this._newWorkspace){
			this._workspace.create(this.getBody());
		}else{
			this._workspace.bind(this.getBody());
		}
		this._workspace.setVisible(true);
		if(this.debug){  //如果开启调试开关
			this._testCaseWin = new Dialog();
			this._testCaseWin._domCreate = true;
			this._testCaseWin.create(this._workspace._self, "Test Case Listener");
			this._testCaseWin.moveTo(500, 50);
			this._testCaseWin.resize(500, 300);
			this._testCaseWin.setClientBgColor("#FFFFFF");
			this._testCaseWin.log = function(msg){
				var div = this._createElement2(null, "div", "", {
					"borderBottom": "1px solid #CCCCCC",
					"innerHTML"   : msg
				});
				this._body.appendChild(div);
			};
		}
	};
	/**
	 * 根据一段HTML代码字符串创建一个DOM对象
	 * @param {String} html HTML代码字符串
	 * @return {Element} 新创建的DOM对象
	 */
	this.createDomElement = function(html, parent/*|exp*/){
		if(!this._domTemp){
			this._domTemp = this._doc.createElement("div");
		}
		this._domTemp.innerHTML = html;
		var obj = this._domTemp.removeChild(this._domTemp.childNodes[0]);
		if(typeof parent == "string" || typeof parent == "undefined"){
			//return jQuery.find(exp, div)[0];
			/*
			var nodes = div.childNodes;
			for(var i = 0, len = nodes.length; i < len; i++){
				if(nodes[i].className == "main"){
					return div.removeChild(nodes[i]);
				}
			}
			return null;
			*/
		}else if(parent){  //HTMLElement
			parent.appendChild(obj);
			/*
			//滞后加载图片
			var imgs = obj.getElementsByTagName("img");
			for(var i = 0, len = imgs.length; i < len; i++){
				imgs[i].src = imgs[i].getAttribute("src0");
			}
			*/
		}
		return obj;
	};
	this.getWorkspace = function(){
		return this._workspace;
	};
	this.getViewPort = function(element){
		var rect = {
			"x": element.scrollLeft,
			"y": element.scrollTop,
			//"w": element.clientWidth,  //Math.max(element.clientWidth || element.scrollWidth)
			"w": Math.max(element.clientWidth, element.parentNode.clientWidth),
			"h": Math.max(element.clientHeight, element.parentNode.clientHeight)  //Math.max(element.clientHeight || element.scrollHeight)
		};
		//if(this.ff){}
		//rect.w = Math.max(element.clientWidth, element.parentNode.clientWidth);
		//rect.h = Math.max(element.clientHeight, element.parentNode.clientHeight);
		return rect;
	};
	this.onResize = function(ev){
		var rect = this.getViewPort(this.getBody());  //this._workspace.getViewPort()
		if(this._workspace){
			this._workspace.resize(rect.w, rect.h);
		}
		/*
		if(typeof app_onResize != "undefined"){  //提前触发应用的resize事件
			app_onResize(rect.w, rect.h);
		}
		*/
		if(this._appManager){
			this._appManager.onResize({
				"type": "resize",
				"w"   : rect.w,
				"h"   : rect.h
			});  //调整所有应用的大小
		}
	};
	/**
	 * 根据DOM元素的ID，并且使用该DOM元素创建一个脚本组件
	 * @param {String} id 脚本组件所绑定的DOM元素的ID
	 */
	this.getComponentById = function(id){
		return this.initComponent(null, id);
	};
	/**
	 * 所有通过该函数操作过的DOM元素都会绑定一个脚本组件对象，并通过该脚本组件可以
	 * 方便的操作DOM元素的属性。
	 * @param {Component} parent 父组件
	 * @param {String|Component} id 组件要绑定的DOM元素的id
	 * -@param {Boolean} initChild 是否初始化子DOM元素
	 */
	this.initComponent = function(parent, id){
		var obj = typeof id == "string" ? this.getElement(id) : id;
		if(!obj) throw "未找到指定id的DOM元素";
		if(!obj._ptr){
			var className, aui;
			var sAui = obj.getAttribute("aui");
			if(sAui != "-"){
				aui = eval("(" + sAui + ")");
				if(aui.tag){
					className = aui.tag;
				}else{
					className = obj.getAttribute("tag");
					if(!className){
						className = "Component";
						//throw "找到的DOM元素没有tag属性，不能绑定脚本组件";
					}else{
						this._win.alert("使用DOM元素的tag属性决定组件类型");
					}
				}
			}
			if(!className){
				className = "Component";  //默认值
			}
			var c = new alz[className]();
			//c._domCreate = true;
			if(aui){
				c.setJsonData(aui);
			}
			c.setParent(parent, obj);
			c.bind(obj);
			//var color = this.getRandomColor();
			//c._self.style.backgroundColor = color;
			this._components.push(c);
			if(obj.getAttribute("html") != "true"){  //如果初始化子组件的话
				var nodes = obj.childNodes;
				for(var i = 0, len = nodes.length; i < len; i++){
					if(nodes[i].nodeType == 1 && nodes[i].getAttribute("aui")){  //NODE_ELEMENT
						this.initComponent(c, nodes[i], true);
					}
				}
			}
		}
		return obj._ptr;
	};
	/**
	 * @param {String} id DOM元素的ID列表，逗号分隔
	 * @return {undefined}
	 */
	this.initComponents = function(id){
		var arr = id.split(",");
		for(var i = 0, len = arr.length; i < len; i++){
			var c = this.initComponent(this._workspace, arr[i]);
			var nodes = c._self.childNodes;
			for(var j = 0, len1 = nodes.length; j < len1; j++){
				var node = nodes[j];
				if(node.nodeType == 1 && node.getAttribute("aui")){  //NODE_ELEMENT
					this.initComponent(c, node, true);
				}
			}
		}
	};
	/**
	 * 显示一个模态对话框
	 * @param {String} id 对话框的ID
	 * @param {String} ownerId 该对话框的所有者的编号
	 * @return {undefined}
	 */
	this.showModalDialog = function(id, ownerId){
		if(id){
			if(ownerId){
				var owner = this.getComponentById(ownerId);
				this._workspace.getModalPanel().setOwner(owner);
			}
			var obj = this.getComponentById(id);  //可能的组件是 Popup,Dialog
			obj.moveToCenter();
			obj.showModal(true);
		}/*else{
			obj.showModal(false);
		}*/
	};
	this.getModalPanel = function(){
		return this._workspace.getModalPanel();
	};
});