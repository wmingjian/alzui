_package("alz.action");

_import("alz.mui.Component");

_class("ActionElement", Component, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._actionManager = null;
		this._action = "";
		this._disabled = false;
	};
	this.init = function(obj, actionManager){
		_super.init.apply(this, arguments);
		this._actionManager = actionManager;
		this._self.style.position = "";
		this._disabled = this._self.getAttribute("_disabled") == "true";
		this._action = this._self.getAttribute("_action");
		if(this._className == "ActionElement"){
			var _this = this;
			this._self.onclick = function(ev){
				return _this.dispatchAction(this, ev || window.event);
			};
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._className == "ActionElement"){
			this._self.onclick = null;
		}
		this._actionManager = null;
		_super.dispose.apply(this);
	};
	this.getAction = function(){
		return this._action;
	};
	this.setAction = function(v){
		this._action = v;
	};
	this.getDisabled = function(){
		return this._disabled;
	};
	this.setDisabled = function(v){
		if(this._disabled == v) return;
		this._disabled = v;
		if(this._self){
			this._self.disabled = v;
		}
	};
	this.dispatchAction = function(sender, ev){
		if(this._disabled) return false;
		//if(this._self.tagName == "INPUT" && this._self.type == "checkbox"){
		//onDispatchAction可以用来记录用户的完整的行为，并对此进行“用户行为分析”
		if(typeof this.onDispatchAction == "function"){
			this.onDispatchAction(action, sender, ev);
		}
		if(this._className == "CheckBox"){
			this._actionManager.dispatchAction(this._action[sender.checked ? 0 : 1], sender, ev);
		}else{
			return this._actionManager.dispatchAction(this._action, sender, ev);
		}
	};
});