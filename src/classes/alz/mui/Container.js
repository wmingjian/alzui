_package("alz.mui");

_import("alz.mui.Component");

/**
 * ���Ǿ���_layout,_align���Ե�Ԫ��ȫ���Ǹ���������ʵ��
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
	 * �ᱻ DockPanel ������أ���ʵ������Ĳ��ֶ���
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
	 * ����ͣ��������˳��1)���£�2)���ң�3)���У�����ͣ�������λ����Ϣ
	 */
	this.updateDock = function(){
		var rect = this.getDockRect();
		var nodes = this._nodes;
		//������ͣ�������
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
		//������ͣ�������
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
		//������ͣ�������
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
		//������ͣ�������
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
		//��������ͣ�������
		for(var i = 0, len = nodes.length; i < len; i++){
			var obj = nodes[i];
			switch(obj.getAlign()){
			case "client":
				//������align == "client"������Ĵ�С
				obj.moveTo(rect.x, rect.y);
				obj.resize(rect.w, rect.h);
				break;
			}
		}
		nodes = null;
	};
});