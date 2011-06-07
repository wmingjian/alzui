_package("alz.mui");

_import("alz.mui.Component");
//CodeMirror
//MirrorFrame

/**
 * 代码编辑器
 */
_class("CodeEditor", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._editor = null;
	};
	this.bind = function(obj, code){
		//this._editor = new MirrorFrame(CodeMirror.replace(obj), {
		this._editor = CodeMirror.fromTextArea(obj, {
			"height"    : "450px",
			"content"   : code,
			"path"      : "codemirror/js/",
			"parserfile": ["tokenizejavascript.js", "parsejavascript.js"],
			"stylesheet": "codemirror/css/jscolors.css",
			"autoMatchParens": true,
			// add Zen Coding support
			"syntax": "html",
			"onLoad": function(editor){
				zen_editor.bind(editor);
			}
		});
		this.init(this._editor.wrapping);
	};
	this.dispose = function(){
		this._editor = null;
		_super.dispose.apply(this);
	};
});