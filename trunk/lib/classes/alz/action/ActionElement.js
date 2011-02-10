_package("alz.action");

_import("alz.mui.Component");

/**
 * ����action���Ե�����Ļ���
 */
_class("ActionElement", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._actionManager = null;
		this._action = "";
		this._timer = 0;  //��ʱ������ֹ�û�����ظ����
	};
	this.create = function(parent, obj, actionManager){
		this.setParent2(parent);
		this._actionManager = actionManager;
		obj.style.position = "";
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
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
		if(!this._disabled && this._self){
			this._self.disabled = v;
		}
	};
	this.dispatchAction = function(sender, ev){
		//try{
			if(this._disabled) return false;
			var d = new Date().getTime();
			if(this._timer != 0){
				if(d - this._timer <= 500){  //���ε������������500����
					runtime.log("cancel");
					this._timer = d;
					return false;
				}
			}
			this._timer = d;
			//if(this._self.tagName == "INPUT" && this._self.type == "checkbox"){
			//onDispatchAction����������¼�û�����������Ϊ�����Դ˽��С��û���Ϊ������
			if(typeof this.onDispatchAction == "function"){
				this.onDispatchAction(this._action, sender, ev);
			}
			if(this._className == "CheckBox"){
				this._actionManager.dispatchAction(this._action[sender.checked ? 0 : 1], sender, ev);
			}else{
				return this._actionManager.dispatchAction(this._action, sender, ev);
			}
		/*}catch(ex){  //������action�������߼������Ĵ�������ݴ���
			var sb = [];
			for(var k in ex){
				sb.push(k + "=" + ex[k]);
			}
			window.alert("[ActionElement::dispatchAction]\n" + sb.join("\n"));
		}*/
	};
	this.onDispatchAction = function(action, sender, ev){
		//[TODO]iframe ģʽ��_actionCollection δ����
		//runtime._actionCollection.onDispatchAction(action, sender);
	};
});