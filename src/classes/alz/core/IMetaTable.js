_package("alz.core");

/**
 * 元表接口
 */
_interface("IMetaTable", "", function(_property){
	_property(this, {
		_hash: {},
		_list: []
	});
	this.exists = function(id){
		return id in this._hash;
	};
	this.getItem = function(id){
		return this._hash[id];
	};
	this.appendItem = function(item){
	};
	this.appendItems = function(items){
	};
	this.removeItem = function(id){
	};
});