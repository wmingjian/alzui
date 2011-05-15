_package("alz.action");

_import("alz.mui.Component");

/**
 * 具有action特性的组件的基类
 */
_class("ActionElement", Component, function(){
	ActionElement.hash = {       //free        cn
		"ActionElement"   : null,
		"FormElement"     : null,
		"LinkLabel"       : null,
		"ComboBox"        : null,  //["ComboBox", "FolderSelect", "GroupSelect"]
		"TextField"       : null,
		"UploadFileButton": null,
		"Button"          : null,  //["Button","SilverButton"]
		"CheckBox"        : null,
		"Radio"           : null
	};
	ActionElement.create = function(name){
		return new this.hash[name]();
	};
	this._init = function(){
		_super._init.call(this);
		this._actionManager = null;
		this._action = "";
		this._timer = 0;  //计时器，防止用户多次重复点击
	};
	this.create = function(parent, obj, actionManager){
		this.setParent2(parent);
		this._actionManager = actionManager;
		obj.style.position = "";
		this.init(obj);
		return obj;
	};
	this.bind = function(obj, actionManager){
		this._actionManager = actionManager;
		this.init(obj);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._disabled = this._self.getAttribute("_disabled") == "true";
		this.setAction(this._self.getAttribute("_action"));
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
	this.destroy = function(){
	};
	this.getAction = function(){
		return this._action;
	};
	this.setAction = function(v){
		this._action = v;
	};
	this.setDisabled = function(v){
		_super.setDisabled.apply(this, arguments);
		if(this._self){
			this._self.disabled = v;
		}
	};
	this.dispatchAction = function(sender, ev){
		//try{
			if(this._disabled) return false;
			var d = new Date().getTime();
			if(this._timer != 0){
				if(d - this._timer <= 500){  //两次点击间隔必须大于500毫秒
					runtime.log("cancel");
					this._timer = d;
					return false;
				}
			}
			this._timer = d;
			//if(this._self.tagName == "INPUT" && this._self.type == "checkbox"){
			//onDispatchAction可以用来记录用户的完整的行为，并对此进行“用户行为分析”
			if(typeof this.onDispatchAction == "function"){
				this.onDispatchAction(this._action, sender, ev);
			}
			if(this._className == "CheckBox"){
				this._actionManager.dispatchAction(this._action[sender.checked ? 0 : 1], sender, ev);
			}else{
				return this._actionManager.dispatchAction(this._action, sender, ev);
			}
		/*}catch(ex){  //对所有action触发的逻辑产生的错误进行容错处理
			var sb = [];
			for(var k in ex){
				sb.push(k + "=" + ex[k]);
			}
			window.alert("[ActionElement::dispatchAction]\n" + sb.join("\n"));
		}*/
	};
	this.onDispatchAction = function(action, sender, ev){
		//[TODO]iframe 模式下_actionCollection 未定义
		//runtime._actionCollection.onDispatchAction(action, sender);
	};
});