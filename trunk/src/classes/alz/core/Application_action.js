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
		element = element || (this._contentPane ? this._contentPane._self : window.document);
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
				node = null;
			}
			nodes = null;
		}
	};
	this.doAction = function(act, sender){
	};
});