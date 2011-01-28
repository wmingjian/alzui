_package("alz.mui");

_import("alz.mui.Component");

_class("SilverButton", Component, function(_super){
	var _css = {
		"normal":{"background-position":"0 0"     ,"_cite":{"background-position":"right -30px" ,"color":"#333"   }},
		"over"  :{"background-position":"0 -60px" ,"_cite":{"background-position":"right -90px" ,"color":"#000333"}},
		"active":{"background-position":"0 -120px","_cite":{"background-position":"right -150px","color":"#333"   }}
	};
	this._init = function(){
		_super._init.call(this);
		this._btn = null;
		this._cite = null;
	};
	this.create = function(btn){
		var obj = this._createElement("span");
		obj.className = "wui-SilverButton";
		if(btn){
			btn.parentNode.replaceChild(obj, btn);
			this._btn = obj.appendChild(btn);
		}
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var cite = this._createElement("cite");
		cite.appendChild(this._createTextNode(this._btn.value));
		this._ee["_cite"] =
		this._cite = this._self.appendChild(cite);
		cite = null;
		this._self.style.backgroundRepeat = "no-repeat";
		this._cite.style.backgroundRepeat = "no-repeat";
		this.setState("normal");
		this._self.onclick = function(){_alert("onclick");};
		this._self.onmousedown = function(){this._ptr.setState("active");};
		this._self.onmouseup = function(){this._ptr.setState("over");};
		this._self.onmouseover = function(){this._ptr.setState("over");};
		this._self.onmouseout = function(){this._ptr.setState("normal");};
	};
	this.dispose = function(){
		this._cite = null;
		this._btn = null;
		this._self.onclick = null;
		this._self.onmousedown = null;
		this._self.onmouseup = null;
		this._self.onmouseover = null;
		this._self.onmouseout = null;
		_super.dispose.apply(this);
	};
	this.setState = function(v){
		runtime.dom.applyCssStyle(this, _css, v);
	};
});