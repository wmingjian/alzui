_package("alz.app.doc.pane");

_import("alz.app.doc.ui.PaneBase");

/**
 * 新建应用
 */
_class("PaneAppAdd", PaneBase, function(){
	this.create = function(parent, app, tpl){
		this.setParent(parent);
		this.setApp(app);
		var obj = this.createTplElement(parent, tpl);
		this.init(obj);
		return obj;
	};
});