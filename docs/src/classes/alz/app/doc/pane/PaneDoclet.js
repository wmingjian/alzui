_package("alz.app.doc.pane");

_import("alz.app.doc.ui.PaneBase");

/**
 * 文档显示
 */
_class("PaneDoclet", PaneBase, function(){
	this.showFile = function(file){
		if(file._mtime == 0 && file._source == ""){
			//[TODO]文件不存在
		}else{
			file.genDoc(this._self);
			this._app.navPane(this._pid);
		}
	};
});