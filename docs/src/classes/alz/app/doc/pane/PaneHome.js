_package("alz.app.doc.pane");

_import("alz.mui.TreeView");
_import("alz.app.doc.ui.PaneBase");

/**
 * 主面板
 */
_class("PaneHome", PaneBase, function(){
	this._init = function(){
		_super._init.call(this);
		this._treeview = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this.initActionElements();
		this._treeview = new TreeView();
		this._treeview._pathSkin = runtime.getConfigData("pathimg");
		var params = {
			"act": "tree"
		};
		this._app.netInvoke("GET", "doc.php", params, "json", this, function(json){
			this._treeview.create($E("left1"), json);
			this._treeview.setVisible(true);
		});
		var _this = this;
		this._treeview.onLabelClick = function(node){
			if(!node.getData().isDir){
				if(node._parentNode.getData){  //[TODO]
					var className = node._parentNode.getData().name + "." + node.getData().name;
					_this._app.parseClassFile(className);
				}
			}
		};
	};
	this.dispose = function(){
		this._treeview.dispose();
		this._treeview = null;
		_super.dispose.apply(this);
	};
	this.do_app_list = function(act, sender){
		this._app.navPane("app_list");
	};
	this.do_app_add = function(act, sender){
		this._app.navPane("app_add");
	};
	this.do_app_pkg = function(act, sender){
		this._app.navPane("app_pkg");
	};
	this.do_app_check = function(act, sender){
		this._app.navPane("app_check");
	};
});