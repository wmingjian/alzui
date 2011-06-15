_package("alz.core");

/**
 * 状态按钮分组
 */
_class("ToggleGroup", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._buttons = [];
		this._activeButton = null;
	};
	this.append = function(btn){
		this._buttons.push(btn);
	};
	this.toggle = function(v){
		if(this._activeButton == v){
			if(this._activeButton){
				this._activeButton.setToggled(false);
				this._activeButton = null;
			}
			return;
		}
		if(this._activeButton){
			this._activeButton.setToggled(false);
		}
		v.setToggled(true);
		this._activeButton = v;
	};
});