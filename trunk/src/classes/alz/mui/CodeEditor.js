_package("alz.mui");

_import("alz.mui.Component");
//CodeMirror
//MirrorFrame

/**
 * 代码编辑器
 */
_class("CodeEditor", Component, function(){
	this._eid = 0;
	this._editors = {};
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._editor = null;
	};
	this.build = function(el){
		_super.build.apply(this, arguments);
		this.bind(this._self, "");
	};
	this.bind = function(obj, code){
		var _this = this;
		var path = runtime.getConfigData("pathlib");
		//this._editor = new MirrorFrame(CodeMirror.replace(obj), {
		this._editor = CodeMirror.fromTextArea(obj, {
			"height"    : "450px",
			"content"   : code,
			"path"      : path + "codemirror/js/",
			"parserfile": ["tokenizejavascript.js", "parsejavascript.js"],
			"stylesheet": path + "codemirror/css/jscolors.css",
			"autoMatchParens": true,
			// add Zen Coding support
			"syntax": "html",
			"onLoad": function(editor){
				editor.win.document.addEventListener("mousedown", function(ev){
					runtime.eventHandle(ev);
				}, false);
				zen_editor.bind(editor);
				var code = _this._app._testcode;  //win._params.code;
				editor.setCode(code);
			}
		});
		this._editor.wrapping.className = "ui-codeeditor";
		this._editor._eid = this._eid++;
		this._editors[this._editor._eid] = this._editor;
		this.init(this._editor.wrapping);
	};
	this.dispose = function(){
		//this._editor.win.document.removeEventListener("mousedown", xxx);
		delete this._editors[this._editor._eid];
		this._editor = null;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.setCode = function(v){
		this._editor.setCode(v);
	};
	this.setApp = function(v){
		this._app = v;
	};
});