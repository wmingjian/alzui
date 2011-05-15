_package("alz.mui");

/**
 * 命令历史纪录
 */
_class("TextHistory", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._historys = [];
		this._curIndex = 0;  //历史记录的位置
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._historys.length; i < len; i++){
			this._historys[i] = null;
		}
		this._historys = [];
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getText = function(num){
		if(num == -1 && this._historys.length - 1 == 0){  //特殊处理这种情况
			return this._historys[0];
		}else if(this._historys.length - 1 > 0){
			var n = Math.max(0, Math.min(this._historys.length - 1, this._curIndex + num));
			if(this._curIndex != n){
				this._curIndex = n;
				return this._historys[n];
			}
		}
	};
	this.append = function(text){
		this._historys.push(text);
		this._curIndex = this._historys.length;
	};
});