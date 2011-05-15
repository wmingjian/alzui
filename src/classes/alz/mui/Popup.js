_package("alz.mui");

_import("alz.mui.Component");

/**
 * 弹出式组件
 */
_class("Popup", Component, function(){
	this._init = function(){
		_super._init.call(this);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		/*
		this._self.onmousedown = function(ev){
			ev = ev || this._ptr._win.event;
			ev.cancelBubble = true;
			return false;
		};
		*/
	};
	this.dispose = function(){
		if(this._disposed) return;
		//this._self.onmousedown = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setVisible = function(v){
		_super.setVisible.apply(this, arguments);
		this._regOnFrame(window.top, "mousedown", !v);  //[TODO]对跨域iframe的处理还不到位
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
			frames = null;
		}catch(ex){
		}
	};
});