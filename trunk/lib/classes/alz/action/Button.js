_package("alz.action");

_import("alz.action.ActionElement");

/**
 * input:button元素的封装
 */
_class("Button", ActionElement, function(){
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onclick = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
		//[TODO]因为setDisabled中的优化考虑，这里目前只能使用如此笨拙的方式驱动
		//setDisabled工作，其他地方相对成熟的方式是添加强制更新的参数。
		var v = this._disabled;
		this._disabled = null;
		this.setDisabled(v);
		v = null;
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
		_super.setDisabled.apply(this, arguments);
		if(!this._disabled && this._self){
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