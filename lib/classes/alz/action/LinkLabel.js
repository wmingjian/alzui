_package("alz.action");

_import("alz.action.ActionElement");

/**
 * ������(a)Ԫ�صķ�װ
 */
_class("LinkLabel", ActionElement, function(){
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		this._self.onclick = function(ev, sender){  //sender ����Ҫ�滻��αװ�� sender ����
			ev = ev || window.event;
			ev.cancelBubble = true;
			return _this.dispatchAction(sender || this, ev);
		};
		this._self.oncontextmenu = function(ev){
			ev = ev || window.event;
			ev.cancelBubble = true;
			return false;
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._self.oncontextmenu = null;
		this._self.onclick = null;
		_super.dispose.apply(this);
	};
});