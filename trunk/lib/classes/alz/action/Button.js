_package("alz.action");

_import("alz.action.ActionElement");

_class("Button", ActionElement, function(_super){
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onclick = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
		/*
		var rows = this._self.rows;
		for(var i = 0, len = rows.length; i < len; i++){
			rows[i].onmouseover = function(){if(_this._disabled) return; this.className = "onHover";};
			rows[i].onmouseout = function(){if(_this._disabled) return; this.className = "normal";};
		}
		rows = null;
		*/
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
	this.setDisabled = function(v){
		if(this._disabled == v) return;
		this._disabled = v;
		if(this._self){
			this._self.disabled = v;
			this._self.style.color = v ? "gray" : "";
			//this._self.rows[0].className = v ? "OnDisable" : "normal";
			/*if(v){
				var btn = this._self.getElementsByTagName("div")[0];
				if(btn) btn.style.backgroundImage = "url(http://www.sinaimg.cn/rny/sinamail421/images/comm/icon_btn.gif)";
				btn = null;
			}*/
		}
	};
	this.setVisible = function(v){
		if(this._visible == v) return;
		this._visible = v;
		if(v){
			this.setStyleProperty("visibility", "visible");
			this.setStyleProperty("display", "");
		}else{
			this.setStyleProperty("visibility", "hidden");
			this.setStyleProperty("display", "none");
		}
	};
});