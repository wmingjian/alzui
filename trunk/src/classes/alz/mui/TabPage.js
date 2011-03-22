_package("alz.mui");

_import("alz.mui.Component");

/**
 * 选项卡组件
 */
_class("TabPage", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._tabs = [];
		this._activeTab = null;
		this._head = null;
		this._body = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._head = this._createElement2(this._self, "div", "mui-TabPage-Head");
		this._body = this._createElement2(this._self, "div", "mui-TabPage-Body");
		this._body.innerHTML =
				'<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#869FA1"><tbody></tbody></table>'
			+ '<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#869FA1"><tbody></tbody></table>'
			+ '<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#FFCCB4"><tbody></tbody></table>'
			+ '<table width="95%" border="1" cellspacing="0" cellpadding="2" bordercolor="#0A0064"><tbody></tbody></table>';
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._body = null;
		this._head = null;
		this._activeTab = null;
		for(var i = 0, len = this._tabs.length; i < len; i++){
			this._tabs[i].onfocus = null;
			this._tabs[i]._parent = this;
			this._tabs[i] = null;
		}
		this._tabs = [];
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resize = function(w, h){
		this._self.style.width = w + "px";
		this._self.style.height = h + "px";
		this._body.style.width = (w - 4) + "px";
		this._body.style.height = (h - 18 - 4) + "px";
		var nodes = this._body.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			nodes[i].style.width = (w - 4 - 16) + "px";
			nodes[i].style.height = (h - 18 - 4) + "px";
		}
		nodes = null;
	};
	this.add = function(text){
		var obj = window.document.createElement("label");
		obj._parent = this;
		obj.tagIndex = this._tabs.length + 1;
		obj.innerHTML = text + "[0]";
		obj.onclick = function(){this._parent.activate(this);};
		this._head.appendChild(obj);
		this._tabs.push(obj);
		this.activate(obj);
	};
	this.activate = function(tab){
		if(this._activeTab != null){
			this._activeTab.className = "";
			this._body.childNodes[this._activeTab.tagIndex - 1].style.display = "none";
		}
		tab.className = "focus";
		this._body.childNodes[tab.tagIndex - 1].style.display = "block";
		this._activeTab = tab;
	};
});