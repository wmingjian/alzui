_package("alz.app.doc");

_import("alz.core.Application");
_import("alz.mui.DeckPane");
_import("alz.app.doc.ClassFile");
_import("alz.app.doc.pane.PaneHome");
_import("alz.app.doc.pane.PaneAppAdd");

/**
 * 框架文档应用
 */
_class("AppDocs", Application, function(){
	this.__conf__(__context__, {
		"pane": [  //插件配置列表
			{"id": "home"     , "clazz": "PaneHome"  , "tpl": "home.xml"     },
			{"id": "doclet"   , "clazz": "PaneDoclet", "tpl": "doc.xml"      },
			{"id": "app_list" , "clazz": "PaneBase"  , "tpl": "app_list.xml" },
			{"id": "app_add"  , "clazz": "PaneAppAdd", "tpl": "app_add.xml"  },
			{"id": "app_pkg"  , "clazz": "PaneBase"  , "tpl": "app_pkg.xml"  },
			{"id": "app_check", "clazz": "PaneBase"  , "tpl": "app_check.xml"}
		]
	});
	this._init = function(){
		_super._init.call(this);
		this._path = "../build/";
		this._deckPane = null;
		this._classes = {};
	};
	this.init = function(){
		_super.init.apply(this);
		//注册模板库
		this._template.reg(runtime.getTplData("docs.tpl"));
		var pane = new PaneHome();
		pane.create(runtime.getWorkspace(), this, "home.xml");
		//this.navPane("home");
		this._deckPane = new DeckPane();
		this._deckPane.bind($E("deck_pane"), this);
		//this.createClassList($E("list"));
		var _this = this;
		window.onresize = function(){
			var delay = 50;
			var executionTimer;
			return function(){
				if(!!executionTimer){
					window.clearTimeout(executionTimer);
				}
				executionTimer = window.setTimeout(function(){
					_this.resize();
				}, delay);
			};
		}();
		window.onresize();
	};
	this.dispose = function(){
		for(var k in this._classes){
			this._classes[k].dispose();
			delete this._classes[k];
		}
		this._deckPane.dispose();
		this._deckPane = null;
		_super.dispose.apply(this);
	};
	this.resize = function(){
		this.onResize({
			"type": "resize",
			"w"   : document.documentElement.clientWidth,
			"h"   : document.documentElement.clientHeight
		});
	};
	this.onResize = function(ev){
		var left = $E("left1");
		var panemain = left.parentNode;
		var deck_pane = $E("deck_pane");
		var hh = panemain.previousSibling.offsetHeight;
		deck_pane.style.width = (ev.w - 180) + "px";
		panemain.style.height = (ev.h - hh) + "px";
		left.style.height =
		deck_pane.style.height = (ev.h - hh) + "px";
	};
	/*
	this.createClassList = function(parent){
		var classes = [];
		var _this = this;
		for(var i = 0, len = classes.length; i < len; i++){
			var item = document.createElement("li");
			item.innerHTML = '<a href="#">' + classes[i] + '</a>';
			item.childNodes[0].onclick = function(){
				_this.parseClassFile(this.innerHTML);
				return false;
			};
			parent.appendChild(item);
		}
	};
	*/
	this.parseClassFile = function(className){
		if(className in this._classes){
			var file = this._classes[className];
			var params = {
				"act": "check",
				"c"  : className,
				"t"  : file._mtime
			};
			this.netInvoke("GET", this._path + "gen_doc.php", params, "text", this, function(text){
				file.init(text);
				this._deckPane.getPane2("doclet").showFile(file);
			});
		}else{
			var params = {
				"act": "file",
				"c"  : className
			};
			this.netInvoke("GET", this._path + "gen_doc.php", params, "text", this, function(text){
				var file = new ClassFile(text);
				file.init(text);
				this._classes[className] = file;
				this._deckPane.getPane2("doclet").showFile(file);
			});
		}
	};
	this.navPane = function(id){
		this._deckPane.navPane(id);
	};
});