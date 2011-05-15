_package("alz.action");

_import("alz.action.BitButton");

/**
 * 带下拉菜单的按钮类
 */
_class("ComboBox", BitButton, function(){
	this._init = function(){
		_super._init.call(this);
		this._popmenu = null;
		this._popmenu_visible = false;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var rows = this._self.rows;
		if(rows.length != 1) throw "[UI_ERROR]组件BitButton只能有一个TR";
		rows = null;
		var menuId = this._self.getAttribute("_popmenu");
		if(!menuId) throw "[UI_ERROR]组件ComboBox缺少属性_popmenu，请检查相关的HTML代码";
		this._popmenu = $(menuId);
		if(!this._popmenu) throw "[UI_ERROR]无法找到ComboBox组件的popmenu(id=" + menuId + ")，请检查相关的HTML代码";
		this.setAction(this._self.getAttribute("_action"));
		/*
		if(this._action){
			if(window[this._action] && typeof window[this._action] == "function"){
				;
			}else{
				throw "[UI_ERROR]组件ComboBox的属性_action的值不是一个函数，请检查相关的HTML代码";
			}
		}
		*/
		var _this = this;
		this._self.onmouseover = function(){
			if(_this._disabled) return;
			_this._self.rows[0].className = "onHover";
			_this.showMenu(true);
		};
		this._self.onmouseout = function(){
			if(_this._disabled) return;
			_this._self.rows[0].className = "normal";
			_this.showMenu(false);
		};
		this._popmenu.onmouseover = function(){
			_this._self.rows[0].className = "onHover";
			_this.showMenu(true);
		};
		this._popmenu.onmouseout = function(){
			_this._self.rows[0].className = "normal";
			_this.showMenu(false);
		};
		/*
		this._popmenu.onclick = function(ev){
			_this.showMenu(false);
			ev = ev || window.event;
			var target = ev.target || ev.srcElement;
			if(target.tagName == "A"){
				target = target.parentNode;
			}
			if(_this._self.onChange){
				_this._self.onChange(target);
			}
			ev.cancelBubble = true;
			return false;
		};
		*/
	};
	this.dispose = function(){
		if(this._disposed) return;
		//this._popmenu.onclick = null;
		this._popmenu.onmouseout = null;
		this._popmenu.onmouseover = null;
		this._popmenu = null;
		this._self.onmouseout = null;
		this._self.onmouseover = null;
		_super.dispose.apply(this);
	};
	this.showMenu = function(v){
		if(this._popmenu_visible == v) return;
		this._popmenu_visible = v;
		if(v){
			var pos = util_getPosition(this._self);
			if(this._popmenu.offsetWidth < this._self.offsetWidth){
				this._popmenu.style.width = (this._self.offsetWidth - 2/* - 10*/) + "px";  //padding(8) + border(2)
			}
			this._popmenu.style.left = pos.x + "px";
			this._popmenu.style.top = (pos.y + this._self.offsetHeight - 1) + "px";
			this._popmenu.style.display = "";
		}else{
			this._popmenu.style.display = "none";
		}
	};
	this.appendItem = function(text, value){
		var ul = util_selectNodes(this._popmenu, "*")[0];
		var li = this._createElement2(ul, "li");
		li._value = value;
		li._text = text;
		var _this = this;
		li.onclick = function(ev){
			_this._actionManager.dispatchAction(_this._action, this, ev || window.event);
		};
		var a = this._createElement2(li, "a", "", {
			"href": "#"
		});
		a.appendChild(this._createTextNode(text));
		a = null;
		li = null;
		ul = null;
	};
});