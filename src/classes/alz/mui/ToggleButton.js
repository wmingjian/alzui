_package("alz.mui");

_import("alz.mui.BitButton");

_class("ToggleButton", BitButton, function(){
	this._init = function(){
		_super._init.call(this);
		this._groupid = "";
		this._toggled = false;
	};
	this.init = function(obj, app){
		_super.init.apply(this, arguments);
		this._groupid = this._self.getAttribute("_groupid");
		if(!this._groupid) throw "ToggleButton 组件缺少 _groupid 属性";
		runtime.toggleMgr.add(this);
		this.removeEventGroupListener("mouseevent");  //[TODO]
		this.addEventGroupListener("mouseevent", {
			mouseover: function(ev){
				if(this._toggled) return;
				this._self.style.borderLeft = "1px solid buttonhighlight";
				this._self.style.borderTop = "1px solid buttonhighlight";
				this._self.style.borderRight = "1px solid buttonshadow";
				this._self.style.borderBottom = "1px solid buttonshadow";
			},
			mouseout: function(ev){
				if(this._toggled) return;
				var target = ev.target || ev.toElement;
				if(!this._dom.contains(this._self, target)){
					this._self.style.border = "1px solid buttonface";
				}
			},
			click: function(ev){
				runtime.toggleMgr.toggle(this);
			}
		});
		if(this._self.getAttribute("_toggled") == "true"){
			runtime.toggleMgr.toggle(this);
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setToggled = function(v){
		if(this._toggled == v) return;
		this._toggled = v;
		if(v){
			this._self.style.borderLeft = "1px solid buttonshadow";
			this._self.style.borderTop = "1px solid buttonshadow";
			this._self.style.borderRight = "1px solid buttonhighlight";
			this._self.style.borderBottom = "1px solid buttonhighlight";
			this._app.doAction(this._self.getAttribute("_action"));
		}else{
			this._self.style.border = "1px solid buttonface";
		}
	};
});