/**
 * alzui-mini JavaScript Framework, v__VERSION__
 * Copyright (c) 2009-2011 wmingjian@gmail.com. All rights reserved.
 *
 * Licensed under the GNU General Public License v2.
 * For details, see: http://code.google.com/p/alzui/
 */
/**
 * ����ACTION��
 * @require core,ui
 */
runtime.regLib("ui_action", "", function(){with(arguments[0]){

//import alz.mui.ThemeManager;
//import alz.template.TemplateManager;
//import alz.template.TrimPath;
//import alz.template.Template;
//import alz.template.ParseError;
//import alz.mui.Component;
//import alz.action.ActionElement;
//import alz.action.LinkLabel;
//import alz.action.Button;
//import alz.action.CheckBox;
//import alz.action.ComboBox;
//import alz.action.FormElement;
//import alz.mui.Pane;
/*<file name="alz/core/Application_action.js">*/
_package("alz.core");

_import("alz.core.ActionManager");

_extension("Application", function(){  //注册 Application 扩展(action)
	this._init = function(){
		this._actionManager = null;
	};
	this.init = function(){
		this._actionManager = new ActionManager();
		this._actionManager.init();
	};
	this.dispose = function(){
		this._actionManager.dispose();
		this._actionManager = null;
	};
	//实现动作接口: {initActionElements:null,doAction:null}
	this.initActionElements = function(element, owner){
		element = element || (this._contentPane ? this._contentPane._self : document);
		owner = owner || this;
		function onAction(ev){
			ev = ev || window.event;
			var ret = owner.doAction(this.getAttribute("_action"), this);
			ev.cancelBubble = true;
			return ret;
		}
		var tags = ["a", "input", "form", "select"];
		for(var i = 0, len = tags.length; i < len; i++){
			var nodes = element.getElementsByTagName(tags[i]);
			for(var j = 0, len1 = nodes.length; j < len1; j++){
				var node = nodes[j];
				var act = node.getAttribute("_action");
				if(act){
					switch(tags[i]){
					case "a":
						node.onclick = onAction;
						break;
					case "input":
						switch(node.type){
						case "button":
						case "submit":
						case "reset":
						case "checkbox":
							node.onclick = onAction;
							break;
						}
						break;
					case "form":
						node.onsubmit = onAction;
						break;
					case "select":
						node.onchange = onAction;
						break;
					}
				}
			}
		}
	};
	this.doAction = function(act, sender){
	};
});
/*</file>*/

}});