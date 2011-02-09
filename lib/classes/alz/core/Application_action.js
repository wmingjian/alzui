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
			alert(123);
			ev = ev || window.event;
			var ret = owner.doAction(this.getAttribute("_action"), this);
			ev.cancelBubble = true;
			return ret;
		}
		var tags = ["a", "input", "form", "select"];
		for(var i = 0, len = tags.length; i < len; i++){
			var nodes = element.getElementsByTagName(tags[i]);
			for(var j = 0, len1 = nodes.length; j < len1; j++){
				var action = nodes[j].getAttribute("_action");
				if(action){
					switch(tags[i]){
					case "a":
						nodes[j].onclick = onAction;
						break;
					case "input":
						if(nodes[j].type == "button" || nodes[j].type == "submit" || nodes[j].type == "reset" || nodes[j].type == "checkbox"){
							nodes[j].onclick = onAction;
						}
						break;
					case "form":
						nodes[j].onsubmit = onAction;
						break;
					case "select":
						nodes[j].onchange = onAction;
						break;
					}
				}
			}
			nodes = null;
		}
	};
	this.doAction = function(action, sender){
	};
});