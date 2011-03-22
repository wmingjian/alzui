_package("alz.mui");

_import("alz.mui.Component");

/**
 * 凡是具有_layout,_align属性的元素全部是该类或子类的实例
 */
_class("Container", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._nodes = [];
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i].dispose();
			this._nodes[i] = null;
		}
		this._nodes = [];
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.resize = function(w, h){
		_super.resize.apply(this, arguments);
		this.updateDock();
	};
	this.add = function(component){
		this._nodes.push(component);
	};
	/**
	 * 会被 DockPanel 组件重载，以实现特殊的布局定义
	 */
	this.getDockRect = function(){
		return {
			"x": 0,
			"y": 0,
			"w": this.getInnerWidth(),
			"h": this.getInnerHeight()
		};
	};
	/**
	 * 按照停靠的优先顺序：1)上下；2)左右；3)居中，更新停靠组件的位置信息
	 */
	this.updateDock = function(){
		var rect = this.getDockRect();
		var nodes = this._nodes;
		//调整上停靠的组件
		for(var i = 0, len = nodes.length; i < len; i++){
			var obj = nodes[i];
			switch(obj.getAlign()){
			case "top":
				obj.moveTo(rect.x, rect.y);
				obj.resize(rect.w, obj._dockRect.h);
				rect.y += obj._dockRect.h;
				rect.h -= obj._dockRect.h;
				break;
			}
		}
		//调整下停靠的组件
		for(var i = nodes.length - 1; i >= 0; i--){
			var obj = nodes[i];
			switch(obj.getAlign()){
			case "bottom":
				obj.moveTo(rect.x, rect.y + rect.h - obj._dockRect.h);
				obj.resize(rect.w, obj._dockRect.h);
				rect.h -= obj._dockRect.h;
				break;
			}
		}
		//调整左停靠的组件
		for(var i = 0, len = nodes.length; i < len; i++){
			var obj = nodes[i];
			switch(obj.getAlign()){
			case "left":
				obj.moveTo(rect.x, rect.y);
				obj.resize(obj._dockRect.w, rect.h);  //"100%"
				rect.x += obj._dockRect.w;
				rect.w -= obj._dockRect.w;
				break;
			}
		}
		//调整右停靠的组件
		for(var i = nodes.length - 1; i >= 0; i--){
			var obj = nodes[i];
			switch(obj.getAlign()){
			case "right":
				obj.moveTo(rect.x + rect.w - obj._dockRect.w, rect.y);
				obj.resize(obj._dockRect.w, rect.h);  //"100%"
				rect.w -= obj._dockRect.w;
				break;
			}
		}
		//调整居中停靠的组件
		for(var i = 0, len = nodes.length; i < len; i++){
			var obj = nodes[i];
			switch(obj.getAlign()){
			case "client":
				//最后调整align == "client"的组件的大小
				obj.moveTo(rect.x, rect.y);
				obj.resize(rect.w, rect.h);
				break;
			}
		}
		nodes = null;
	};
});