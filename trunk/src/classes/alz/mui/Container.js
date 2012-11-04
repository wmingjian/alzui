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
	this.init = function(el){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._nodes.length; i < len; i++){
			this._nodes[i].dispose();
			this._nodes[i] = null;
		}
		this._nodes.length = 0;
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
			var el = nodes[i];
			switch(el.getAlign()){
			case "top":
				el.moveTo(rect.x, rect.y);
				el.resize(rect.w, el._dockRect.h);
				rect.y += el._dockRect.h;
				rect.h -= el._dockRect.h;
				break;
			}
		}
		//调整下停靠的组件
		for(var i = nodes.length - 1; i >= 0; i--){
			var el = nodes[i];
			switch(el.getAlign()){
			case "bottom":
				el.moveTo(rect.x, rect.y + rect.h - el._dockRect.h);
				el.resize(rect.w, el._dockRect.h);
				rect.h -= el._dockRect.h;
				break;
			}
		}
		//调整左停靠的组件
		for(var i = 0, len = nodes.length; i < len; i++){
			var el = nodes[i];
			switch(el.getAlign()){
			case "left":
				el.moveTo(rect.x, rect.y);
				el.resize(el._dockRect.w, rect.h);  //"100%"
				rect.x += el._dockRect.w;
				rect.w -= el._dockRect.w;
				break;
			}
		}
		//调整右停靠的组件
		for(var i = nodes.length - 1; i >= 0; i--){
			var el = nodes[i];
			switch(el.getAlign()){
			case "right":
				el.moveTo(rect.x + rect.w - el._dockRect.w, rect.y);
				el.resize(el._dockRect.w, rect.h);  //"100%"
				rect.w -= el._dockRect.w;
				break;
			}
		}
		//调整居中停靠的组件
		for(var i = 0, len = nodes.length; i < len; i++){
			var el = nodes[i];
			switch(el.getAlign()){
			case "client":
				//最后调整align == "client"的组件的大小
				el.moveTo(rect.x, rect.y);
				el.resize(rect.w, rect.h);
				break;
			}
		}
	};
});