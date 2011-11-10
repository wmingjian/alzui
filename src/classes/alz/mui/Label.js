_package("alz.mui");

_import("alz.mui.Component");

/**
 * TreeView中使用的标签组件
 */
_class("Label", Component, function(){
	var _css = {
		"normal"  : {"color":"#000000","border":"1px solid #EEEEEE" ,"background-color":""       ,"text-decoration":"none"     },
		"over"    : {"color":"#0000FF","border":"1px solid #EEEEEE" ,"background-color":"#FFF5CC","text-decoration":"underline"},
		"dragover": {"color":"#FFFFFF","border":"1px solid #0A246A" ,"background-color":"#0A246A","text-decoration":"none"     },
		"active"  : {"color":"#FFFFFF","border":"1px dotted #F5DB95","background-color":"#0A246A","text-decoration":"none"     }
	};
	this._init = function(){
		_super._init.call(this);
		this._text = "";
	};
	this.create = function(parent, text){
		this.setParent2(parent);
		this._text = text;
		var obj = this._createElement("label");
		//var obj = this._createElement("a");
		//obj.href = "#";
		obj.appendChild(this._createTextNode(text));
		this._parent._self.appendChild(obj);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		//this._self.ondragstart = function(){return false;};
		this._self.onselectstart = function(){return false;};
		this._self.onmouseover = function(){
			var node = _this._parent;
			if(node._tree.getActiveNode() == node) return;
			if(node._tree._draging && node._data.isDir && node._tree.getActiveNode().getParentNode() != node){
				node._tree._dragOverNode = node;
				this._ptr.applyCssStyle(this, _css, "dragover");
			}else{
				this._ptr.applyCssStyle(this, _css, "over");
			}
			node = null;
		};
		this._self.onmouseout = function(){
			if(_this._parent._tree.getActiveNode() == _this._parent) return;
			this._ptr.applyCssStyle(this, _css, "normal");
		};
		this.setState("normal");
	};
	this.dispose = function(){
		this._self.onmouseout = null;
		this._self.onmouseover = null;
		//this._self.onclick = null;
		//this._self.onmousedown = null;
		//this._self.onmouseup = null;
		this._self.onselectstart = null;
		//this._self.ondragstart = null;
	};
	this.getText = function(){
		return this._text;
	};
	this.setText = function(v){
		this._text = v;
		this._self.innerHTML = v;
	};
	this.setState = function(v){
		this.applyCssStyle(this._self, _css, v);
	};
	this.handleEvent = function(ev, target){
		var ret = false;
		var tree = this._parent._tree;
		switch(ev.type){
		case "mousemove":
			this.applyCssStyle(this._self, _css, "normal");
			if(!tree.getReadonly()){
				//tree.startDraging(this._parent);
				tree.startDrag(ev, target, this._parent);
			}
			break;
		case "mousedown":
			tree._self.onmousemove = function(ev){  //准备响应拖拽动作
				return this._ptr.eventHandle(ev || window.event);
			};
			if(!tree.getReadonly() && tree.getActiveNode() == this._parent){
				this._prepareEdit = true;  //准备进入编辑状态
			}else{
				tree.setActiveNode(this._parent);
			}
			break;
		case "mouseup":
			tree._self.onmousemove = null;
			if(tree._draging){
				this.applyCssStyle(this._self, _css, "active");
				if(tree._dragOverNode){
					this.applyCssStyle(tree._dragOverNode._label.getElement(), _css, "over");
				}
				tree.stopDrag();
			}else{
				if(this._prepareEdit && tree.getActiveNode() == this._parent){
					this._prepareEdit = false;
					if(target == tree.getActiveNode()._label.getElement()){
						this._parent.rename();
					}else{
						//runtime.error("[TODO]move node");
					}
				}
			}
			break;
		case "click":
			if(target == this._self && !tree._draging){
				ret = this._parent.openNode();
			}
			break;
		}
		ev.cancelBubble = true;
		return ret;
	};
});