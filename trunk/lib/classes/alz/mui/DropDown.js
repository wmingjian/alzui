_package("alz.mui");

_import("alz.mui.Component");

_class("DropDown", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._drop = null;
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
		this._self.onmousedown = null;
		this._self.onclick = null;
		if(this._drop){
			this._drop.dispose();
			this._drop = null;
		}
		_super.dispose.apply(this);
	};
	this._bindDrop = function(){
		if(!this._drop){
			var id = this._dropid;  //this._self.getAttribute("dropid")
			if(!id) runtime.getWindow()._alert("组件DropDown缺少属性dropid");
			this._drop = runtime.initComponent(runtime._workspace, id);
			if(!this._drop) throw "未找到DropDown组件的下拉列表[Popup,id=\"" + id + "\"]";
			this._drop.setVisible(false);
			this._self.onmousedown = function(ev){return this._ptr.onMouseDown(ev || this._ptr._win.event);};
			this._self.onclick = function(ev){return false;};
			this._drop._self.onmousedown = function(ev){
				ev = ev || this._ptr._win.event;
				window.alert((ev.srcElement || ev.target).innerHTML);
			};
		}
	};
	this.onMouseDown = function(ev){
		if(this._drop.getVisible()){
			runtime._workspace.setPopup(null);
		}else{
			var pos = this.getPosition(ev, 0);
			pos.y += this.getHeight();
			this._drop.setWidth(Math.max(this.getWidth(), this._drop.getWidth()));
			runtime._workspace.setPopup(this._drop, pos);
		}
		ev.cancelBubble = true;
		return false;
	};
});