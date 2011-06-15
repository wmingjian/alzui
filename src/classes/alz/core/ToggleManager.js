_package("alz.core");

_import("alz.core.ToggleGroup");

/**
 * 双态按钮管理者
 */
_class("ToggleManager", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._groups = {};
	};
	this.add = function(btn){
		var groupid = btn.getGroupId();
		if(!this._groups[groupid]){
			this._groups[groupid] = new ToggleGroup();
		}
		this._groups[groupid].append(btn);
	};
	this.toggle = function(btn){
		this._groups[btn.getGroupId()].toggle(btn);
	};
});