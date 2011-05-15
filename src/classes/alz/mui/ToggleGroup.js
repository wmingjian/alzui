_package("alz.mui");

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
	this.toggle = function(btn){
		if(this._activeButton){
			this._activeButton.setToggled(false);
		}
		btn.setToggled(true);
		this._activeButton = btn;
	};
});