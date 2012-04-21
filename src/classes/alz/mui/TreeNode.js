_package("alz.mui");

_import("alz.util.FileType");
_import("alz.mui.Component");
_import("alz.mui.Label");
_import("alz.mui.TreeView");
_import("alz.core.Ajax");

/**
 * TreeNode 类
 */
_class("TreeNode", Component, function(){
	TreeNode.iconCache = {};  //树节点图标缓存
	this._init = function(){
		_super._init.call(this);
		//this._parent = null;   //TreeView组件(父DOM元素)
		this._parentNode = null;  //父TreeNode组件
		this._tree = null;     //所属的 treeView 组件
		this._leaf = false;    //是否叶结点
		this._preIndex = 0;    //
		this._preIcon = null;  //状态图标
		this._icon = null;     //结点图标
		this._label = null;    //文字标签
		this._subTree = null;  //子树
		this._bFirst = true;   //是否第一个结点？
		this._bLast = false;   //是否同级同分之下的兄弟结点中的最后一个结点？
		this._modify = false;  //是否处于编辑状态
	};
	this.create = function(parent, data, bFirst, bLast){
		this.setParent2(parent);
		if(!("isDir" in data)){
			if("nodes" in data && data.nodes.length > 0){
				data["isDir"] = true;
			}
		}
		data.type = data.type || data.name.split(".").pop();
		this._data = data;
		this._leaf = !data.isDir;
		this._bFirst = bFirst;
		this._bLast = bLast;
		var obj = this._createElement("li");
		if(parent){
			this._parentNode = parent._parent;
			this._parent._self.appendChild(obj);
		}
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		if(!("preIcon" in TreeNode.iconCache)){
			TreeNode.useImg = true;
			var obj;
			if(TreeNode.useImg){
				obj = this._createElement("img");
				//obj.src = this._tree._pathSkin + "win2k_tree_add.gif";
				obj.src = this._tree._pathSkin + "win2k_tree_blank.gif";
			}else{
				obj = this._createElement2(null, "span", "icon16"/*, {
					"styleFloat"   : "left",
					"display"      : "block",
					"width"        : "16px",
					"height"       : "16px",
					"verticalAlign": runtime.moz ? "bottom !important" : "middle"
				}*/);
			}
			obj.style.display = "none";
			obj.style.backgroundImage = "url(" + this._tree._pathSkin + "imagelist_treeview.gif)";
			TreeNode.iconCache["preIcon"] = document.body.appendChild(obj);
			if(TreeNode.useImg){
				obj = this._createElement("img");
				obj.src = this._tree._pathSkin + "win2k_tree_blank.gif";  //this._tree._pathSkin + "win2k_" + type + ".gif"
			}else{
				obj = this._createElement2(null, "span", "icon16"/*, {
					"styleFloat"   : "left",
					"display"      : "block",
					"width"        : "16px",
					"height"       : "16px",
					"verticalAlign": runtime.moz ? "bottom !important" : "middle"
				}*/);
			}
			obj.style.marginRight = "3px";
			obj.style.display = "none";
			obj.style.backgroundImage = "url(" + this._tree._pathSkin + "imagelist_build.gif)";
			TreeNode.iconCache["icon"] = document.body.appendChild(obj);
		}

		this._preIcon = TreeNode.iconCache["preIcon"].cloneNode(true);
		this._self.appendChild(this._preIcon);
		this._preIcon.style.display = "";
		var index;
		if(this._bFirst && this._bLast && parent == this._tree){
			index = 2;
		}else if(this._bFirst && parent == this._tree){
			index = 4;
		}else if(this._bLast){
			index = 6;
		}else{
			index = 5;
		}
		this._preIndex = index + (this._leaf ? 9 : 0);
		this._preIcon.style.backgroundPosition = "-" + (this._preIndex * 16) + "px 0px";
		var _this = this;
		this._preIcon.ondragstart = function(){return false;};

		this._icon = TreeNode.iconCache["icon"].cloneNode(true);
		this._self.appendChild(this._icon);
		this._icon.style.display = "";
		this._icon.style.backgroundPosition = "-" + (FileType.getIconIndex(this._data.type) * 16) + "px 0px";
		this._icon.ondragstart = function(){return false;};

		var text = this._data.type == "class" ? this._data.name.replace(/\.js$/, "") : this._data.name;
		this._label = new Label();
		this._label.create(this, text);
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._subTree){
			this._subTree.dispose();
			this._subTree = null;
		}
		this._label.dispose();
		this._label = null;
		this._icon.style.backgroundImage = "none";
		this._icon.onmousedown = null;
		this._icon.ondragstart = null;
		this._icon = null;
		this._preIcon.style.backgroundImage = "none";
		this._preIcon.onclick = null;
		this._preIcon.ondragstart = null;
		this._preIcon = null;
		_super.dispose.apply(this);
	};
	this.setTree = function(v){
		this._tree = v;
	};
	this.createSubTree = function(){
		var subTree = new TreeView();
		subTree.setTree(this._tree);
		subTree.create(this, this._data.nodes);
		if(this._bLast){
			subTree._self.style.backgroundImage = "none";
		}
		return subTree;
	};
	//this.isLeaf = function(){
	//	return this._data.type in _mapIcon ? _mapIcon[this._data.type].isDir == 0 : false;
	//};
	//this.getIconIndex = function(){
	//	return this._tree.getIconIndex(this._data.type);
	//};
	this.handleEvent = function(ev, target){
		switch(ev.type){
		case "mousedown":
			if(target == this._icon){
				this._tree.setActiveNode(this);
				ev.cancelBubble = true;
				//this._tree.startDraging(this);
			}
			break;
		case "mouseup":
			break;
		case "click":
			if(!this._leaf){
				if(target == this._preIcon){
					this.onIconClick();
				}else if(target == this._icon){
					this.openNode();
				}
			}
			break;
		case "dblclick":
			if(target == this._icon){
				this.openNode();
			}
			break;
		}
	};
	this.onIconClick = function(){
		if(!this._leaf){
			if(!this._data.nodes || this._data.nodes.length == 0){
				//this._data.nodes = path2json(this._path, this._data.type);
				//this.onIconClick();
				this._tree.loadData(this, function(json){
					this._data.nodes = json;
					this.onIconClick();
				});
				return;
			}
			if(!this._subTree){
				this._subTree = this.createSubTree();
				this._subTree.setVisible(false);
			}
			this._subTree.setVisible(!this._subTree.getVisible());  //&& this._subTree.childNodes.length > 0
			this._preIndex += this._subTree.getVisible() ? 6 : -6;
			this._preIcon.style.backgroundPosition = "-" + (this._preIndex * 16) + "px 0px";
		}
		return false;
	};
	this.onLabelClick = function(){
		if(this._data._node){
			if(this._tree._activeElement){
				this._tree._activeElement.style.backgroundColor = this._tree.oldBgColor;
			}
			this._tree.oldBgColor = this._data._node.style.backgroundColor;
			this._data._node.style.backgroundColor = "gray";
			this._tree._activeElement = this._data._node;
		}
		return false;
	};
	this.activate = function(){
		this._label.setState("active");
	};
	this.deactivate = function(){
		this._label.setState("normal");
	};
	this.getParentNode = function(){
		//return this._parent._self.parentNode._ptr;
		//return this._parent._parent;
		return this._parentNode;
	};
	this.getText = function(){
		return this._label.getText();
	};
	this.getPath = function(){
		var sb = [];
		for(var node = this; node && node._data; node = node.getParentNode()){  //node._parent._parent
			sb.unshift(node._data.name);
		}
		return "/" + sb.join("/");
	};
	this.rename = function(){
		this._modify = true;
		var input = this._tree.getInput(this._label.getText());
		if(this._label.getElement().nextSibling){
			this._self.insertBefore(input, this._label.getElement().nextSibling);
		}else{
			this._self.appendChild(input);
		}
		runtime.addThread(0, this, function(){
			input.select();
		});
		this._label.setVisible(false);
	};
	this.cancelRename = function(){
		this._label.setVisible(true);
		if(this._tree._input.parentNode != this._self){
			runtime.error(this._tree._input.parentNode.outerHTML);
		}
		this._self.removeChild(this._tree._input);
		this._tree._input.style.display = "none";
		this._modify = false;
	};
	this.doRename = function(name){
		//assert(this._tree._input.value == name);
		if(this.getText() == name){  //如果值发生改变
			this.cancelRename();
		}else{
			//[TODO]需要检查是否和其他文件重名
			//if(this._tree._input && this._tree._input.style.display == "")
			var path = this.getPath();
			//assert(path == this._data.url);
			var params = {
				"act" : "mod",
				"path": path,
				"name": name
			};
			new Ajax().netInvoke("POST", "../data/file.php", params, "json", this, function(json){
				if(json == true){
					this._data.name = name;
					//if(this._data.isDir){
					//	this._data.url = this._data.url.replace(/\/[^\/]+\/?$/, "/" + name + "/");
					//}
					this._label.setText(name);
				}else{
					runtime.error("[ERROR]改名失败");
				}
				this.cancelRename();
			});
		}
	};
	this.openNode = function(){
		if(this._tree._activeNode1 && this._tree._activeNode1._data.isDir){
			this._tree._activeNode1._icon.style.backgroundPosition = "-" + (FileType.getIconIndex("close") * 16) + "px 0px";
		}
		if(this._data.isDir){
			this._icon.style.backgroundPosition = "-" + (FileType.getIconIndex("open") * 16) + "px 0px";
		}
		if(this._tree.onLabelClick){
			return this._tree.onLabelClick(this);
		}
		return this.onLabelClick();
	};
});