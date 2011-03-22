_package("alz.mui");

_import("alz.mui.Component");

/**
 * 带图标的按钮组件
 */
_class("BitButton", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._icon = "";
		this._disabled = false;
		this._app = null;
	};
	this.init = function(obj, app){
		this._app = app;
		_super.init.apply(this, arguments);
		this._label = this._self.childNodes[1];
		this.setDisabled(this._self.getAttribute("_disabled") == "true");
		this._icon = this._self.getAttribute("_icon") || "";
		if(this._icon != ""){
			this._self.style.background = "url(" + this._self.getAttribute("_icon") + ") 2px 2px no-repeat";
		}
		this._tip = this._self.getAttribute("_tip") || "";
		if(this._tip != ""){
			this._self.title = this._tip;
		}
		this.addEventGroupListener("mouseevent", {
			mouseover: function(ev){
				this._self.style.borderLeft = "1px solid buttonhighlight";
				this._self.style.borderTop = "1px solid buttonhighlight";
				this._self.style.borderRight = "1px solid buttonshadow";
				this._self.style.borderBottom = "1px solid buttonshadow";
			},
			mouseout: function(ev){
				var target = ev.target || ev.toElement;
				if(!this._dom.contains(this._self, target)){
					this._self.style.border = "1px solid buttonface";
				}
			},
			mousedown: function(ev){
				this._self.style.borderLeft = "1px solid buttonshadow";
				this._self.style.borderTop = "1px solid buttonshadow";
				this._self.style.borderRight = "1px solid buttonhighlight";
				this._self.style.borderBottom = "1px solid buttonhighlight";
				var sender = ev.target || ev.srcElement;
				this._app.doAction(sender.getAttribute("_action"), sender);
			},
			mouseup: function(ev){
				this._self.style.borderLeft = "1px solid buttonhighlight";
				this._self.style.borderTop = "1px solid buttonhighlight";
				this._self.style.borderRight = "1px solid buttonshadow";
				this._self.style.borderBottom = "1px solid buttonshadow";
			}/*,
			click: function(ev){
				var sender = ev.target || ev.srcElement;
				this._app.doAction(sender.getAttribute("_action"), sender);
			}*/
		});
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._app = null;
		this._label = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setDisabled = function(v){
		_super.setDisabled.apply(this, arguments);
		this.setEnableEvent(!v);
		if(!this._disabled){
			if(v){
				this._self.style.filter = "gray";
				this._label.disabled = true;
			}else{
				this._self.style.filter = "";
				this._label.disabled = false;
			}
		}
	};
});