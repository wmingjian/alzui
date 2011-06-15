_package("alz.mui");

_import("alz.mui.BitButton");

/**
 * 工具栏按钮
 */
_class("ToggleButton", BitButton, function(){
	this._init = function(){
		_super._init.call(this);
		this._groupId = "";
		this._toggled = false;
	};
	this.create = function(parent, data){
		this.setParent2(parent);
		this.setData(data);
		var obj = this._createElement2(parent, "li", "ui-toolbutton");
		this.init(obj);
		return obj;
	};
	this.bind = function(obj, app){
		this.init(obj);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var data = {
			"groupid": this._self.getAttribute("_groupid"),
			"toggled": this._self.getAttribute("_toggled") == "true",
		};
		if(data.groupid){
			this._groupId = data.groupid;
		}
		//if(!this._groupId) throw "ToggleButton 组件缺少 _groupid 属性";
		runtime.toggleMgr.add(this);
		this.addEventGroupListener("mouseevent", {
			mouseover: function(ev){
				if(this._toggled) return;
				runtime.dom.addClass(this._self, "hover");
				/*
				this._self.style.borderLeft = "1px solid buttonhighlight";
				this._self.style.borderTop = "1px solid buttonhighlight";
				this._self.style.borderRight = "1px solid buttonshadow";
				this._self.style.borderBottom = "1px solid buttonshadow";
				*/
			},
			mouseout: function(ev){
				if(this._toggled) return;
				var target = ev.target || ev.toElement;
				//if(!runtime.dom.contains(this._self, target)){
					runtime.dom.removeClass(this._self, "active");
					runtime.dom.removeClass(this._self, "hover");
					//this._self.style.border = "1px solid buttonface";
				//}
			},
			click: function(ev){
				runtime.toggleMgr.toggle(this);
			}
		});
		if(data.toggled){
			runtime.toggleMgr.toggle(this);
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getGroupId = function(){
		return this._groupId;
	};
	this.setToggled = function(v){
		if(this._toggled == v) return;
		this._toggled = v;
		if(v){
			runtime.dom.addClass(this._self, "active");
			/*
			this._self.style.borderLeft = "1px solid buttonshadow";
			this._self.style.borderTop = "1px solid buttonshadow";
			this._self.style.borderRight = "1px solid buttonhighlight";
			this._self.style.borderBottom = "1px solid buttonhighlight";
			*/
			//this._app.doAction(this._self.getAttribute("_action"));
		}else{
			runtime.dom.removeClass(this._self, "active");
			runtime.dom.removeClass(this._self, "hover");
			//this._self.style.border = "1px solid buttonface";
		}
	};
});