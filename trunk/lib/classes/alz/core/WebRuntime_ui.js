_package("alz.core");

_import("alz.mui.ToggleManager");
_import("alz.mui.ActionManager");
_import("alz.mui.Workspace");
_import("alz.mui.Dialog");

_extension("WebRuntime", function(){  //ע�� WebRuntime ��չ
	this._init = function(){  //����֮��ĳ�ʼ������
		this._domTemp = null;
		this.toggleMgr = new ToggleManager();
		//this.actionManager = new ActionManager();
		this._workspace = new Workspace();
		if(this._newWorkspace){
			this._workspace.create(this.getBody());
		}else{
			this._workspace.bind(this.getBody());
		}
		this._workspace.setVisible(true);
		if(this.debug){  //����������Կ���
			this._testCaseWin = new Dialog();
			this._testCaseWin._domCreate = true;
			this._testCaseWin.create(this._workspace._self, "Test Case Listener");
			this._testCaseWin.moveTo(500, 50);
			this._testCaseWin.resize(500, 300);
			this._testCaseWin.setClientBgColor("#FFFFFF");
			this._testCaseWin.log = function(msg){
				var div = this._createElement("div");
				div.style.borderBottom = "1px solid #CCCCCC";
				div.innerHTML = msg;
				this._body.appendChild(div, this._body.childNodes[0]);
				div = null;
			};
		}
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
	this.createDomElement = function(html, parent){
		if(!this._domTemp){
			this._domTemp = this._doc.createElement("div");
		}
		this._domTemp.innerHTML = html;
		var obj = this._domTemp.removeChild(this._domTemp.childNodes[0]);
		if(parent){
			parent.appendChild(obj);
			/*
			//�ͺ����ͼƬ
			var imgs = obj.getElementsByTagName("img");
			for(var i = 0, len = imgs.length; i < len; i++){
				imgs[i].src = imgs[i].getAttribute("src0");
			}
			imgs = null;
			*/
		}
		return obj;
	};
	this.getWorkspace = function(){
		return this._workspace;
	};
	this.getViewPort = function(element){
		var rect = {
			x: element.scrollLeft,
			y: element.scrollTop,
			w: element.clientWidth,  //Math.max(element.clientWidth || element.scrollWidth)
			h: Math.max(element.clientHeight, element.parentNode.clientHeight)  //Math.max(element.clientHeight || element.scrollHeight)
		};
		//if(this.ff){}
		rect.w = Math.max(element.clientWidth, element.parentNode.clientWidth);
		rect.h = Math.max(element.clientHeight, element.parentNode.clientHeight);
		return rect;
	};
	this.onResize = function(){
		var rect = this.getViewPort(this.getBody());  //this._workspace.getViewPort()
		if(this._workspace){
			this._workspace.resize(rect.w, rect.h);
		}
		if(typeof app_onResize != "undefined"){  //��ǰ����Ӧ�õ�resize�¼�
			app_onResize(rect.w, rect.h);
		}
		this._appManager.onResize(rect.w, rect.h);  //��������Ӧ�õĴ�С
	};
	/**
	 * ����DOMԪ�ص�ID������ʹ�ø�DOMԪ�ش���һ���ű����
	 * @param id {String} �ű�������󶨵�DOMԪ�ص�ID
	 */
	this.getComponentById = function(id){
		return this.initComponent(null, id);
	};
	/**
	 * ����ͨ���ú�����������DOMԪ�ض����һ���ű�������󣬲�ͨ���ýű��������
	 * ����Ĳ���DOMԪ�ص����ԡ�
	 * @param parent {Component} �����
	 * @param id {String|Component} ���Ҫ�󶨵�DOMԪ�ص�id
	 * -@param initChild {Boolean} �Ƿ��ʼ����DOMԪ��
	 */
	this.initComponent = function(parent, id){
		var obj = typeof id == "string" ? this.getElement(id) : id;
		if(!obj) throw "δ�ҵ�ָ��id��DOMԪ��";
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
						//throw "�ҵ���DOMԪ��û��tag���ԣ����ܰ󶨽ű����";
					}else{
						this._win.alert("ʹ��DOMԪ�ص�tag���Ծ����������");
					}
				}
			}
			if(!className){
				className = "Component";  //Ĭ��ֵ
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
			if(obj.getAttribute("html") != "true"){  //�����ʼ��������Ļ�
				var nodes = obj.childNodes;
				for(var i = 0, len = nodes.length; i < len; i++){
					if(nodes[i].nodeType == 1 && nodes[i].getAttribute("aui")){  //NODE_ELEMENT
						this.initComponent(c, nodes[i], true);
					}
				}
				nodes = null;
			}
			c = null;
		}
		return obj._ptr;
	};
	/**
	 * @param id {String} DOMԪ�ص�ID�б����ŷָ�
	 * @return {undefined}
	 */
	this.initComponents = function(id){
		var arr = id.split(",");
		for(var i = 0, len = arr.length; i < len; i++){
			var c = this.initComponent(runtime._workspace, arr[i]);
			var nodes = c._self.childNodes;
			for(var j = 0, len1 = nodes.length; j < len1; j++){
				var node = nodes[j];
				if(node.nodeType == 1 && node.getAttribute("aui")){  //NODE_ELEMENT
					this.initComponent(c, node, true);
				}
				node = null;
			}
			nodes = null;
			c = null;
		}
		arr = null;
	};
	/**
	 * ��ʾһ��ģ̬�Ի���
	 * @param id {String} �Ի����ID
	 * @param ownerId {String} �öԻ���������ߵı��
	 * @return {undefined}
	 */
	this.showModalDialog = function(id, ownerId){
		if(id){
			if(ownerId){
				var owner = this.getComponentById(ownerId);
				this._workspace.getModalPanel().setOwner(owner);
			}
			var obj = this.getComponentById(id);  //���ܵ������ Popup,Dialog
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