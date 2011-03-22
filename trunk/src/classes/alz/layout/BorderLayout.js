_package("alz.layout");

_import("alz.core.BoxElement");
_import("alz.layout.AbstractLayout");

_class("BorderLayout", AbstractLayout, function(){
	var TAGS = {"NOSCRIPT":1,"INPUT":1};
	var CLASSES = {"wui-ModalPanel":1,"wui-Dialog":1};
	this._init = function(){
		_super._init.call(this);
		this._component = null;
		this._self = null;
		this._direction = "";  //vertical|horizontal
		this._nodes = [];
		this._clientNode = null;
		this._width = 0;
		this._height = 0;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._component = obj.__ptr__;
		if(this._self.tagName != "TD"){
			//this._self.style.position = "absolute";
			this._self.style.overflow = "hidden";
		}
		//this._self.style.backgroundColor = runtime.getColor();
		var nodes = obj.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			if(nodes[i].nodeType != 1) continue;  //NODE_ELEMENT
			if(nodes[i].tagName in TAGS) continue;
			if(nodes[i].className in CLASSES) continue;
			if(nodes[i].style.display == "none") continue;
			var align = nodes[i].__ptr__ && nodes[i].__ptr__._align || nodes[i].getAttribute("_align");
			if(!align){
				runtime.log("[WARNING]ʹ�ò��ֵĽ��(tagName=" + nodes[i].tagName + ",class=" + nodes[i].className + ")ȱ��_align���ԣ�Ĭ��Ϊ_align=top");
				align = "top";
			}
			if(align == "none") continue;
			if(align == "client"){
				if(this._clientNode){
					runtime.log("[WARNING]ʹ�ò��ֵĽ��ֻ����һ��_align=client���ӽ��");
				}
				this._clientNode = nodes[i];
				this._clientNode.style.position = "relative";  //[TODO]
				//this._clientNode.style.overflowX = "hidden";
				//this._clientNode.style.overflowY = "auto";
			}else{
				if(this._direction == ""){
					if(align == "top" || align == "bottom"){
						this._direction = "vertical";
					}else if(align == "left" || align == "right"){
						this._direction = "horizontal";
					}else{
						runtime.log("[WARNING]������ʹ����δ֪��_align����ֵ(" + align + ")");
					}
				}else if(this._direction == "vertical" && (align == "left" || align == "right")){
					runtime.log("[WARNING]�����Ѿ�Ϊ(vertical)������ʹ��left��right��Ϊ_align����ֵ");
				}else if(this._direction == "horizontal" && (align == "top" || align == "bottom")){
					runtime.log("[WARNING]�����Ѿ�Ϊ(horizontal)������ʹ��top��bottom��Ϊ_align����ֵ");
				}
			}
			this._nodes.push(nodes[i]);
		}
		if(this._direction == ""){
			//if(this._self.tagName != "BODY"){
			//	runtime.log("[WARNING]δ����ȷʶ�𲼾ַ�������ʹ�ò��ֵ�Ԫ�ص���Ԫ�ظ����ǲ���ֻ��һ����_align=client");
			//}
			this._direction = "vertical";
		}
		if(this._direction == "horizontal"){
			//this._self.style.overflow = "hidden";
			for(var i = 0, len = this._nodes.length; i < len; i++){
				//ˮƽ��BorderLayout������Ҫ�滻��ԭ����float���֣����ɾ��Զ�λ����ʵ��
				this._nodes[i].style.position = "absolute";
				this._nodes[i].style.styleFloat = "";
				//this._nodes[i].style.overflow = "auto";
			}
		}
		nodes = null;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._clientNode = null;
		for(var i = 0, len = this._nodes.length; i < len; i++){
			//if(this._nodes[i]._self){
			//	this._nodes[i].dispose();  //[TODO]Ӧ����DOMUtil::dispose�д���
			//}
			this._nodes[i] = null;
		}
		this._nodes = [];
		this._self = null;
		this._component = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/*
	this.layoutElement = function(w, h){
		if(this._width == w && this._height == h) return;
		this._width = w;
		this._height = h;
		//if(this._self.className == "ff_cntas_list"){
		//	alert(w + "," + h);
		//}
		if(this._self.tagName == "TABLE"){
			var tbl = this._self;
			tbl.style.border = "1px solid red";
			tbl.style.width = w + "px";
			tbl.style.height = h + "px";
			var cell = tbl.childNodes[0].rows[1].cells[1];
			cell.style.width = (w - 12) + "px";
			cell.style.height = (h - 22) + "px";
			var layout = new BorderLayout();
			layout.init(cell);
			layout.layoutElement(Math.max(0, w - 12), Math.max(0, h - 22));
			layout.dispose();
			layout = null;
			cell = null;
			tbl = null;
		}else if(this._self.tagName != "BODY" && this._self.tagName != "TD"){
			if(w) runtime.dom.setWidth(this._self, w);
			if(h) runtime.dom.setHeight(this._self, h);
		}
		if(this._direction == "vertical"){
			var hh = 0, h_client = 0;
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				if(node.style.display == "none") continue;
				//node.style.top = hh + "px";
				if(node != this._clientNode){
					hh += runtime.dom.getHeight(node);
				}
				node = null;
			}
			var h_client = h - hh;
			hh = 0;
			if(w) runtime.dom.setWidth(this._clientNode, w);
			runtime.dom.setHeight(this._clientNode, h_client);
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				var layout = node.getAttribute("_layout");
				if(layout == "BorderLayout"){
					//node.style.overflow = "hidden";
					var borderLayout = new BorderLayout();
					borderLayout.init(node);
					borderLayout.layoutElement(node.clientWidth, node.clientHeight);
					borderLayout.dispose();
					borderLayout = null;
				}
				node = null;
			}
		}else{  //this._direction == "horizontal"
			//���򲼾�ʹ�þ��Զ�λ��marginRight�����в�����ʲôʵ�ʵ����ã�ֻ���ڼ����������֮��marginʱ����
			//��λԪ��left����ʱ����Ҫ��ȥ����marginLeft���Ե�ֵ
			var ww = 0, w_client = 0;
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				if(node.style.display == "none") continue;
				node.style.left = ww + "px";
				if(node != this._clientNode){
					ww += runtime.dom.getWidth(node);
				}
				node = null;
			}
			var w_client = w - ww;
			ww = 0;
			for(var i = 0, len = this._nodes.length; i < len; i++){
				var node = this._nodes[i];
				node.style.left = ww + "px";
				if(node == this._clientNode){
					runtime.dom.setWidth(this._clientNode, w_client);
					ww += w_client;
				}else{
					ww += runtime.dom.getWidth(node);
				}
				var h_fix = 0;
				if(this._self.className == "ff_contact_client"){
					h_fix = -2;  //(��ʱ����취)RQFM-4934 ͨѶ¼ҳ����һ�����ص�ȱ
				}
				if(h) runtime.dom.setHeight(node, h - h_fix);
				var layout = node.getAttribute("_layout");
				if(layout == "BorderLayout"){
					//node.style.overflow = "hidden";
					var borderLayout = new BorderLayout();
					borderLayout.init(node);
					borderLayout.layoutElement(node.clientWidth, node.clientHeight);
					borderLayout.dispose();
					borderLayout = null;
				}
				node = null;
			}
		}
	};
	this.setClientNode = function(node){
		this._clientNode = node;
	};
	this.appendNode = function(node){
		this._nodes.push(node);
	};
	*/
	/*
	this._getNodes = function(){
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i] = null;
		}
		this._nodes.splice(0, len);
		var nodes0 = this._self.childNodes;
		for(var i = 0, len = nodes0.length; i < len; i++){
			var node = nodes0[i];
			if(node.nodeType != 1) continue;  //NODE_ELEMENT
			if(node.tagName in TAGS) continue;
			if(node.className in CLASSES) continue;
			if(node.style.display == "none") continue;
			this._nodes.push(node);
			node = null;
		}
		return this._nodes;
	};
	*/
	/**
	 * ��ȡ���벼�ֵĽ��
	 */
	this._getAlignNodes = function(){
		var nodes = [];
		for(var i = 0, len = this._nodes.length; i < len; i++){
			if(this._nodes[i].style.display == "none") continue;
			if(this._nodes[i].__ptr__){
				nodes.push(this._nodes[i].__ptr__);
			}
			//nodes.push(new BoxElement(this._nodes[i]));
		}
		return nodes;
	};
	this.getClientNodeWidth = function(w, nodes){
		var nn = this._component.getProperty("paddingLeft");  //����paddingLeft
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			if(i == 0){  //���ǵ�һ��Ԫ�ص�marginLeft
				nn += node._marginLeft;
			}
			//node.setLeft(nn);
			nn += (node._self == this._clientNode ? 0 : node.getWidth());  //node._self.offsetWidth
			if(i < len - 1){
				nn += Math.max(node._marginRight, nodes[i + 1]._marginLeft);  //ȡ����Ԫ�ص�margin���ֵ
			}else{  //i == len - 1 �������һ��Ԫ�ص�marginRight
				nn += node._marginRight;
			}
			node = null;
		}
		return w - nn;
	};
	this.getClientNodeHeight = function(h, nodes){
		var nn = this._component.getProperty("paddingTop");  //����paddingTop
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			if(i == 0){  //���ǵ�һ��Ԫ�ص�marginTop
				nn += node._marginTop;
			}
			//node.setTop(nn);
			nn += (node._self == this._clientNode ? 0 : node.getHeight());  //node._self.offsetHeight
			if(i < len - 1){
				nn += Math.max(node._marginBottom, nodes[i + 1]._marginTop);  //ȡ����Ԫ�ص�margin���ֵ
			}else{  //i == len - 1 �������һ��Ԫ�ص�marginBottom
				nn += node._marginBottom;
			}
			node = null;
		}
		return h - nn;
	};
	this.updateDock =
	this.layoutElement = function(w, h){
		//if(this._width == w && this._height == h) return;
		this._component.resizeTo(w, h);
		//if(this._self.className == "ff_cntas_list"){
		//	alert(w + "," + h);
		//}
		if(this._self.tagName == "TABLE"){
			var tbl = this._self;
			var cell = tbl.childNodes[0].rows[1].cells[1];
			//cell.style.border = "1px solid gray";
			cell.style.width = Math.max(0, w - 12) + "px";
			cell.style.height = Math.max(0, h - 22) + "px";
			/*
			var layout = new BorderLayout();
			layout.init(cell);
			layout.layoutElement(Math.max(0, w - 12), Math.max(0, h - 22));
			layout.dispose();
			layout = null;
			*/
			cell = null;
			tbl = null;
			return;
		}else if(this._self.tagName != "BODY" && this._self.tagName != "TD"){
			//alert(this._self.tagName + "," + w + "," + h);
			//�߶ȺͿ���Ѿ�����Ԫ�ص�������
			//if(w) runtime.dom.setWidth(this._self, w);
			//if(h) runtime.dom.setHeight(this._self, h);
			//if(w) w = runtime.dom.getInnerWidth(this._self);  //this._self.clientWidth - this._paddingLeft - this._paddingRight;
			h = this._component.getInnerHeight();  //this._self.clientHeight - this._paddingTop - this._paddingBottom;
		}
		var nodes = this._getAlignNodes();
		if(this._direction == "vertical"){
			var n_client = this.getClientNodeHeight(h, nodes);
			var nn = 0;
			for(var i = 0, len = nodes.length; i < len; i++){
				var node = nodes[i];
				if(i == 0){  //���ǵ�һ��Ԫ�ص�marginTop
					nn += node._marginTop;
				}
				//node.setTop(nn);
				if(node._self == this._clientNode){
					//var b = this._self.className == "wui-PaneContactTable" ? 2 : 0;
					node.setHeight(n_client/* - b*/);
				}
				nn += node._self == this._clientNode ? n_client : node.getHeight();
				if(w){
					node.setInnerWidth(w);
				}
				if(node.hasLayout()){
					node.layout();
				}
				if(i < len - 1){
					nn += Math.max(node._marginBottom, nodes[i + 1]._marginTop);  //ȡ����Ԫ�ص�margin���ֵ
				}else{  //i == len - 1 �������һ��Ԫ�ص�marginBottom
					nn += node._marginBottom;
				}
				node = null;
			}
		}else{  //this._direction == "horizontal"
			//���򲼾�ʹ�þ��Զ�λ��marginRight�����в�����ʲôʵ�ʵ����ã�ֻ���ڼ����������֮��marginʱ����
			//��λԪ��left����ʱ����Ҫ��ȥ����marginLeft���Ե�ֵ
			var n_client = this.getClientNodeWidth(w, nodes);  //w - nn + runtime.dom.getStyleProperty(this._self, "paddingLeft");  //���Ͽ���paddingRightֵ
			var nn = 0;
			for(var i = 0, len = nodes.length; i < len; i++){
				var node = nodes[i];
				node.setLeft(nn);
				if(i == 0){  //���ǵ�һ��Ԫ�ص�marginLeft
					nn += node._marginLeft;
				}
				if(node._self == this._clientNode){
					node.setInnerWidth(n_client, true);
				}
				nn += node._self == this._clientNode ? n_client : node.getWidth();
				if(h){
					node.setInnerHeight(h);
				}
				if(node.hasLayout()){
					node.layout();
				}
				if(i < len - 1){
					nn += Math.max(node._marginRight, nodes[i + 1]._marginLeft);  //ȡ����Ԫ�ص�margin���ֵ
				}else{  //i == len - 1 �������һ��Ԫ�ص�marginRight
					nn += node._marginRight;
				}
				node = null;
			}
		}
		/*
		for(var i = 0, len = nodes.length; i < len; i++){
			nodes[i].dispose();
			nodes[i] = null;
		}
		*/
		nodes = null;
	};
});