_package("alz.action");

_import("alz.action.ComboBox");

/**
 * select元素的封装
 */
_class("Select", ComboBox, function(){
	this._init = function(obj){
		_super._init.call(this);
		this._select = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._select = this._self;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._select = null;
		_super.dispose.apply(this);
	};
	this.reset = function(pageCount, pageNo){
		this._initListPage(pageCount, pageNo);
		//this._select.value = pageNo;
	};
	//[TODO]页数很多的时候会出现性能问题
	this._initListPage = function(pageCount, pageNo){
		var options = this._select.options;
		//var len = options.length;
		this._select.style.display = "";
		/*
		if(len > pageCount){
			while(options.length > pageCount){
				this._select.remove(options.length - 1);
			}
		}else if(len < pageCount){
			for(var i = Math.max(1, len); i <= pageCount; i++){
				options[options.length] = new Option(i + "/" + pageCount, i);
			}
		}*/
		while(options.length){
			this._select.removeChild(options[0]);
		}
		for(var i = 1; i <= pageCount; i++){
			var option = new Option(i + "/" + pageCount, i);
			options[options.length] = option;
			if(i == pageNo){
				option.selected = true;
			}
			option = null;
		}
		if(options.length == 0){
			this._select.style.display = "none";
		}
		options = null;
	};
});