_package("alz.mui");

_import("alz.util.FileType");
_import("alz.mui.Component");
_import("alz.mui.TreeNode");

/**
 * TreeView 类
 */
_class("TreeView", Component, function(){
	var KEY_TAB       = 9;   //'\t'
	var KEY_ENTER     = 13;  //'\n'
	var KEY_ESC       = 27;
	this._init = function(){
		_super._init.call(this);
		this._pathSkin = "images/";
		this._tree = null;
		this._nodes = [];
		this._activeNode = null;
		this._activeDragNode = null;
		this._input = null;
		this._draging = false;
		this._dragOverNode = null;
		this._captureComponent = null;
		this._activePopup = null;
		this._readonly = true;
	};
	this.create = function(parent, data, w, h){
		this.setParent2(parent);
		if(data) this._data = data;
		var obj = this._createElement2(null, "ul", !this._tree ? "ui-treeview" : "", {  //只有最外层的 TreeView 才有该样式
			"display": "none"
		});
		if(w) obj.style.width = typeof w == "string" ? w : w + "px";
		if(h) obj.style.height = typeof h == "string" ? h : h + "px";
		if(parent){
			if(this._parent._self){
				this._parent._self.appendChild(obj);
			}else{
				this._parent.appendChild(obj);
			}
		}
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		if(!this._tree){
			this._self.onselectstart = function(){return false;};
			this._self.onmousedown =
			this._self.onmouseup =
			this._self.onclick =
			this._self.ondblclick = function(ev){
				return this._ptr.eventHandle(ev || window.event);
			};
		}
		var nodes = this._data;
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = new TreeNode();
			node.setTree(this._tree || this);
			node.create(this, nodes[i], i == 0, i == len - 1);
			this._nodes.push(node);
			node = null;
		}
		nodes = null;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activePopup = null;
		this._captureComponent = null;
		this._dragOverNode = null;
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i].dispose();
			this._nodes[i] = null;
		}
		this._nodes = [];
		if(!this._tree){
			this._self.ondblclick = null;
			this._self.onclick = null;
			this._self.onmouseup = null;
			this._self.onmousedown = null;
			this._self.onselectstart = null;
			this._tree = null;
		}
		_super.dispose.apply(this);
	};
	this.getReadonly = function(){
		return this._readonly;
	};
	this.setTree = function(v){
		this._tree = v;
	};
	this.loadData = function(){
		runtime.error("[TreeView::loadData]当前方法必须被使用者重载，以实现特定的数据加载方式");
	};
	this.getActiveNode = function(){
		return this._activeNode;
	};
	this.setActiveNode = function(node){
		if(this._activeNode == node) return;
		if(this._activeNode){
			this._activeNode.deactivate();
		}
		if(node){
			node.activate();
		}
		this._activeNode1 = this._activeNode;
		this._activeNode = node;
	};
	this.getInput = function(value){
		if(!this._input){
			this._input = this._createElement("input");
			this._input.type = "text";
			this.addListener(this._input, "keydown", this, "onKeyDown");
			var _this = this;
			this._input.handleEvent = function(ev, target){
				switch(ev.type){
				case "mousedown":
					if(!_this._readonly){
						if(target != this){  //&& _this._activeNode && _this._activeNode._modify
							_this._activeNode.doRename(this.value);
						}
					}
					break;
				case "mouseup":
					//ev.cancelBubble = true;
					break;
				case "click":
					//!!!也不能是LI，因为mousedown不来源自input
					if(!_this._activeNode) runtime.error("error");
					if(target == this.parentNode) runtime.error("[input]target == this.parentNode");
					if(target != this && target != this.parentNode && target != _this._activeNode._label.getElement()){
						_this._activePopup = null;
					}
					ev.cancelBubble = true;
					return false;
				}
			};
			this._input.onkeypress = function(ev){
				runtime.addThread(0, _this, "autoSizeInput");
			};
		}
		this._input.value = value;
		this._input.style.display = "";
		this._activePopup = this._input;
		this._captureComponent = null;  //只要有this._activePopup, _captureComponent便失效
		this.autoSizeInput();
		return this._input;
	};
	this.onKeyDown = function(ev){
		runtime.addThread(0, this, "autoSizeInput");
		switch(ev.keyCode){
		case KEY_ESC:
			if(this._activeNode){
				this._activeNode.cancelRename();
				this._activePopup = null;
			}
			ev.cancelBubble = true;
			return false;
		case KEY_TAB:
		case KEY_ENTER:
			if(!this._readonly){
				if(this._activeNode){
					this._activeNode.doRename(this.value);
					this._activePopup = null;
				}
			}
			break;
		}
		return true;
	};
	this.autoSizeInput = function(){
		var size = runtime.getTextSize(this._input.value, "12px 宋体");
		this._input.style.width = Math.max(28/*32*/, Math.min(90, size.w + 11)) + "px";  //max-width: this._self.offsetWidth - 14
		//this._input.style.backgroundColor = "#EEEEEE";
	};
	this.eventHandle = function(ev){
		var target = ev.target || ev.srcElement;
		runtime.log(target.tagName + "." + ev.type);
		var ret;
		var control = this.getControl(target) || this;
		if(/*ev.type == "mousedown" && */this._activePopup){
			ret = this._activePopup.handleEvent(ev, target);
		}else{
			if(ev.type == "mousedown" && control && !this._captureComponent){
				this._captureComponent = control;
			}
			if(this._captureComponent){
				control = this._captureComponent;
			}
			if(control && control.handleEvent){
				ret = control.handleEvent(ev, target);
			}
			if(ev.type == "click"){
				this._captureComponent = null;
			}
		}
		/*else{
			switch(ev.type){
			case "mousedown":
			case "mouseup":
			case "click":
				if(typeof control["on" + ev.type] == "function"){
					ret = control["on" + ev.type](ev, target);
				}
				break;
			}
		}*/
		control = null;
		return ret;
	};
	this.handleEvent = function(ev, target){
		switch(ev.type){
		case "mousedown":
			break;
		case "click":
			break;
		}
	};
	this.startDraging = function(treeNode){
		runtime.log("start drag");
		this._draging = true;
		this._activeDragNode = treeNode;
		var _this = this;
		window.document.onmousemove = function(ev){
			if(_this._draging){
			}
		};
		window.document.onmouseup = function(ev){
			ev = ev || window.event;
			var target = ev.target || ev.srcElement;
			if(target.tagName != "LI") target = target.parentNode;
			if(target != _this._activeDragNode._self){
				target.parentNode.insertBefore(_this._activeDragNode._self, target);
			}
			runtime.log("end drag");
			_this._draging = false;
			window.document.onmousemove = null;
			window.document.onmouseup = null;
		};
	};
	this.startDrag = function(ev, target, node){
		this._draging = true;
		var rect = this.getDragRect();
		rect.style.display = "";
		rect.style.font = "12px 宋体";
		var text = runtime.encodeHTML(node.getText());
		var size = runtime.getTextSize(text, "12px 宋体");
		rect.style.width = size.w + "px";
		rect.style.height = size.h + "px";
		rect.innerHTML = text;
		var pos = this.getPos(target, this._self);
		rect.style.left = (pos.x + ev.offsetX + (target.tagName == "LABEL" ? -33 : 0) + 1) + "px";
		rect.style.top  = (pos.y + ev.offsetY + (target.tagName == "LABEL" ? 1 : 0) + 1) + "px";
		pos = null;
		rect = null;
	};
	this.stopDrag = function(){
		this.getDragRect().style.display = "none";
		this._dragOverNode = null;
		this._draging = false;
	};
	this.getDragRect = function(){
		var rect;
		if(!this._dragRect){
			this._dragRect =
			rect = this._createElement2(this._self, "div", "DragRect");
		}else{
			rect = this._dragRect;
		}
		return rect;
	};
	this.getPos = function(obj, refObj){
		var pos = {"x": 0, "y": 0};
		var dom = runtime.dom;
		for(var o = obj; o && o != refObj; o = o.offsetParent){
			var bl, bt, x, y;
			if(o != obj){
				bl = dom.getStyleProperty(o, "borderLeftWidth");
				bt = dom.getStyleProperty(o, "borderTopWidth");
				x = isNaN(bl) ? 0 : bl;
				y = isNaN(bt) ? 0 : bt;
				bl = dom.getStyleProperty(o, "paddingLeftWidth");
				bt = dom.getStyleProperty(o, "paddingTopWidth");
				x += isNaN(bl) ? 0 : bl;
				y += isNaN(bt) ? 0 : bt;
			}
			pos.x += o.offsetLeft + (o != obj ? x : 0);
			pos.y += o.offsetTop + (o != obj ? y : 0);
		}
		return pos;
	};
});