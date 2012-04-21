_package("alz.action");

_import("alz.action.ActionElement");

/**
 * 带图标的按钮（表格实现
 */
_class("BitButton", ActionElement, function(){
	this._init = function(){
		_super._init.call(this);
		this._visible = true;
	};
	this.init = function(obj, actionManager){
		_super.init.apply(this, arguments);
		this._actionManager = actionManager;
		/*
		var btn = $(arr[i]);
		btn.onmousemove = function(){this.getElementsByTagName("tr")[0].className = "onHover";};
		btn.onmouseout = function(){this.getElementsByTagName("tr")[0].className = "normal";};
		*/
		this._disabled = this._self.getAttribute("_disabled") == "true";
		this.setAction(this._self.getAttribute("_action"));
		var _this = this;
		if(this._action){
			this._self.onclick = function(ev){
				if(_this._disabled) return;
				_this._actionManager.dispatchAction(_this._action, this, ev || window.event);
				return false;
			};
		}
		var rows = this._self.rows;
		if(rows.length != 1){
			throw "[UI_ERROR]组件BitButton只能有一个TR";
		}
		this._self.onmouseover = function(){
			if(_this._disabled) return;
			_this._self.rows[0].className = "onHover";
		};
		this._self.onmouseout = function(){
			if(_this._disabled) return;
			_this._self.rows[0].className = "normal";
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.onmouseover = null;
		this._self.onmouseout = null;
		_super.dispose.apply(this);
	};
	this.setStyleProperty = function(name, value){
		try{
			if(this._self){
				this._self.style[name] = value;
			}
		}catch(ex){
			window.alert(ex.message + "\n" + name + "=" + value);
		}
	};
	this.setDisabled = function(v){
		_super.setDisabled.apply(this, arguments);
		if(this._self){
			this._self.rows[0].className = v ? "OnDisable" : "normal";
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