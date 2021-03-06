_package("alz.mui");

_import("alz.mui.Pane");

/**
 * 弹出式组件
 */
_class("Popup", Pane, function(){
	this._init = function(){
		_super._init.call(this);
		this._conf = null;
		this._app = null;
		this._params = null;
		this._owner = null;  //所有者(必须是一个UI组件)
		this._req = null;
	};
	this.create2 = function(conf, parent, app, params, owner){
		this.setConf(conf);
		this.setParent2(parent);
		this.setApp(app);
		this.setParams(params);
		this.setOwner(owner);
	};
	this.create = function(parent, app, owner, params, tpl){
		this.setParent2(parent);
		this.setApp(app);
		this.setOwner(owner);
		this.setParams(params);
		var el = this.createTplElement(parent, tpl);
		this.init(el);
		return el;
	};
	this.init = function(el){
		_super.init.apply(this, arguments);
		/*
		this._self.onmousedown = function(ev){
			ev = ev || this._ptr._win.event;
			ev.cancelBubble = true;
			return false;
		};
		*/
	};
	this.reset = function(params){
		this._params = params;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._req = null;
		this._owner = null;
		this._params = null;
		this._app = null;
		//this._self.onmousedown = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setConf = function(v){
		this._conf = v;
	};
	this.setApp = function(v){
		this._app = v;
	};
	this.getOwner = function(){
		return this._owner;
	};
	this.setOwner = function(v){
		this._owner = v;
	};
	this.setParams = function(v){
		this._params = v;
	};
	this.setReq = function(v){
		this._req = v;
	};
	this.setVisible = function(v){
		_super.setVisible.apply(this, arguments);
		//this._regOnFrame(window.top, "mousedown", !v);  //[TODO]对跨域iframe的处理还不到位
	};
	this._isOutterElement = function(el){
		var doc = el.ownerDocument;
		var win = doc.parentWindow || doc.defaultView;
		return !(win == this._win && runtime.dom.contains(this._self, el));
	};
	this._onDocumentClick = function(ev){
		var target = ev.target || ev.srcElement;
		if(this._isOutterElement(target)){
			runtime.addThread(0, this, runtime.closure(this, "setVisible", false));
		}
	};
	/**
	 * 在指定窗体和所有子窗体中注册/销毁事件侦听器
	 * [TODO]存在跨域问题
	 */
	this._regOnFrame = function(frame, type, isRemove){
		try{
			runtime.dom[(isRemove ? "remove" : "add") + "EventListener"](frame.document, type, this._onDocumentClick, this);
			//RQFM-5643 当邮件正在打开过程中，点击"更多功能"，弹出JS错误
			var frames = frame.frames;
			for(var i = 0, len = frames.length; i < len; i++){
				this._regOnFrame(frames[i], type, isRemove);
			}
		}catch(ex){
		}
	};
	/**
	 * @method getPosition
	 * @return {Object}
	 * @desc   获得事件的全局坐标位置
	 */
	this.getPosition = function(sender){
		var pos = {"x": 0, "y": 0};
		var refElement = runtime._workspace._self;
		var el = sender;
		while(el && el != refElement){
			pos.x += el.offsetLeft;
			pos.y += el.offsetTop;
			el = el.offsetParent;
		}
		return pos;
	};
	this.getPos = function(el, refObj){
		var pos = {"x": 0, "y": 0};
		var dom = runtime.dom;
		for(var o = el; o && o != refObj; o = o.offsetParent){
			var bl, bt, x, y;
			if(o != el){
				bl = dom.getStyleProperty(o, "borderLeftWidth");
				bt = dom.getStyleProperty(o, "borderTopWidth");
				x = isNaN(bl) ? 0 : bl;
				y = isNaN(bt) ? 0 : bt;
				bl = dom.getStyleProperty(o, "paddingLeftWidth");
				bt = dom.getStyleProperty(o, "paddingTopWidth");
				x += isNaN(bl) ? 0 : bl;
				y += isNaN(bt) ? 0 : bt;
			}
			pos.x += o.offsetLeft + (o != el ? x : 0);
			pos.y += o.offsetTop + (o != el ? y : 0);
		}
		return pos;
	};
	this.show = function(){
		runtime._workspace.setActivePopup(this);
		var pos = this.getPos(this._owner);
		this.moveTo(pos.x, pos.y + this._owner.offsetHeight);
	};
	this.hide = function(){
		runtime._workspace.setActivePopup(null);
	};
	this.callback = function(){
		var args = [this];  //回调函数的第一个参数一定是对话框组件本身
		for(var i = 0, len = arguments.length; i < len; i++){
			args.push(arguments[i]);
		}
		if(this._req){
			this._req.func.apply(this._req.agent, args);
			this._req = null;  //只允许被调用一次
		}
	};
	this.doAction = function(act, sender){
		this.hide();
		this.callback(act, sender);
		return false;
	};
});