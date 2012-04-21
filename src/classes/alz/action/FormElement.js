_package("alz.action");

_import("alz.action.ActionElement");

/**
 * form元素的封装
 */
_class("FormElement", ActionElement, function(){
	this._init = function(){
		_super._init.call(this);
		this._elements = [];
		this._app = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onsubmit = function(ev){
			return _this.dispatchAction(this, ev || window.event);
		};
		this.initCustomElements();
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._app = null;
		for(var i = 0, len = this._elements.length; i < len; i++){
			this._elements[i].dispose();
			this._elements[i] = null;
		}
		this._elements.length = 0;
		this._self.onsubmit = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resetSelf = function(){
		this._self.reset();
	};
	this.getApp = function(){
		if(!this._app){
			for(var el = this._self; el && el._ptr; el = el.parentNode){
				if(el._ptr.instanceOf("mail.ui.Pane")){
					this._app = el._ptr.getApp();
					break;
				}
			}
		}
		return this._app;
	};
	/**
	 * 初始化自定义的表单元素
	 */
	this.initCustomElements = function(){
		//提前收集表单元素，防止后面处理自定义元素时，可能往表单中添加新元素而引起问题
		var elements = [];
		var nodes = this._self.elements;
		for(var i = 0, len = nodes.length; i < len; i++){
			elements.push(nodes[i]);
		}
		for(var i = 0, len = elements.length; i < len; i++){
			var el = elements[i];
			switch(el.tagName){
			case "INPUT":
				switch(el.type){
				case "text":
				case "hidden":
					var className = el.getAttribute("_ui");
					if(className){  //只处理有_ui属性的元素
						if(el.type == "text"){
							el.style.display = "none";
						}
						var clazz = __context__.__classes__[className];
						var component = new clazz();
						component.bindElement(el, this.getApp());
						this._elements.push(component);
					}
					break;
				}
				break;
			}
		}
	};
});