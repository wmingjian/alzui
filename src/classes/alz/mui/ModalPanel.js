_package("alz.mui");

_import("alz.mui.Component");

/**
 * 模态对话框使用的遮挡面板组件
 */
_class("ModalPanel", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._targetList = [];
		this._activeTarget = null;
		this._iframe = null;  //用来遮挡SELECT等DIV遮挡不住的组件
		this._panel = null;   //再用这个DIV遮挡在IFRAME上面
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._self.className = "ui-modalpanel";
		this.moveTo(0, 0);
		this.setOpacity(0.01);
		if(runtime.ie){
			this._iframe = this._createElement2(this._self, "iframe", "", {
				"scrolling": "no",
				"frameBorder": "0",
				"frameSpacing": "0",
				//"allowTransparency": "true",
				"src": "about:blank",
				"display": "none",
				"position": "absolute",
				"width": "100%",
				"height": "100%"
			});
		}
		this._panel = this._createElement2(this._self, "div", "", {
			"display": "none",
			"position": "absolute",
			"left": "0px",
			"top": "0px"
		});
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._panel = null;
		this._iframe = null;
		this._activeTarget = null;
		for(var i = 0, len = this._targetList.length; i < len; i++){
			this._targetList[i] = null;
		}
		this._targetList = [];
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setVisible = function(v){
		_super.setVisible.apply(this, arguments);
		if(this._iframe){
			this._iframe.style.display = v ? "" : "none";
		}
		this._panel.style.display = v ? "" : "none";
		if(this._visible){  //如果面板已经显示
			//this.getActiveTarget().setVisible(false);
		}else{
		}
	};
	this.resize = function(w, h){
		_super.resize.apply(this, arguments);
		this._panel.style.width = w + "px";
		this._panel.style.height = h + "px";
		if(this._activeTarget.moveToCenter){
			this._activeTarget.moveToCenter();
		}
	};
	this.pushTarget = function(v){
		this._activeTarget = v;
		this._targetList.push(v);
		var rect = runtime._workspace.getViewPort();
		this.resize(rect.w, rect.h);
		//var screen = runtime.getBody();
		/* 是否需要移动呢？
		var rect = this._parent.getViewPort();
		this.moveTo(rect.x, rect.y);
		*/
		//this.resize(screen.clientWidth, screen.clientHeight);
		//this.resize(
		//	Math.max(screen.scrollWidth, screen.clientWidth),
		//	Math.max(screen.scrollHeight, screen.clientHeight)
		//);
		//screen = null;
		this.setVisible(true);  //!!v
		this.setZIndex(runtime.getNextZIndex());
	};
	this.popTarget = function(v){
		this._targetList.pop();
		this._activeTarget = this._targetList[this._targetList.length - 1];
		if(this._targetList.length == 0){
			this.setVisible(false);
		}else{
			this.getActiveTarget().setZIndex(runtime.getNextZIndex());
		}
	};
	this.getActiveTarget = function(){
		return this._activeTarget;  //this._targetList[this._targetList.length - 1];
	};
});