_package("alz.mui");

_import("alz.mui.Component");

_class("DropDown", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._menu = null;
	};
	this.bind = function(obj){
		_super.bind.apply(this, arguments);
		this._bindDrop();
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._bindDrop();
	};
	this.dispose = function(){
		if(this._disposed) return;
		this.removeListener(this._self, "mousedown");
		this._self.onclick = null;
		if(this._menu){
			this._menu.dispose();
			this._menu = null;
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this._bindDrop = function(){
		if(!this._menu){
			var id = this._dropid;  //this._self.getAttribute("dropid")
			if(!id) runtime.getWindow()._alert("组件DropDown缺少属性dropid");
			this._menu = runtime.initComponent(runtime._workspace, id);
			if(!this._menu) throw "未找到DropDown组件的下拉列表[Popup,id=\"" + id + "\"]";
			this._menu.setVisible(false);
			this.addListener(this._self, "mousedown", this, "onMouseDown");
			this._self.onclick = function(ev){return false;};
			this._menu._self.onmousedown = function(ev){
				ev = ev || this._ptr._win.event;
				window.alert((ev.srcElement || ev.target).innerHTML);
			};
		}
	};
	this.onMouseDown = function(ev){
		if(this._menu.getVisible()){
			runtime._workspace.setActivePopup(null);
		}else{
			this._menu.setWidth(Math.max(this.getWidth(), this._menu.getWidth()));
			runtime._workspace.setActivePopup(this._menu);
			var pos = this.getPosition(ev, 0);
			this._menu.moveTo(pos.x, pos.y + this.getHeight());
		}
		ev.cancelBubble = true;
		return false;
	};
});