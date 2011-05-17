_package("alz.core");

_import("alz.core.Plugin");

/**
 * 标签库
 */
_class("TagLib", Plugin, function(){
	this._init = function(){
		_super._init.call(this);
		this._hash = {};
	};
	this.create = function(name, app){
		_super.create.apply(this, arguments);
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
	this.reg = function(tag, clazz){
		this._hash[tag] = {
			"tag"  : tag,
			"clazz": clazz
		};
	};
	this.regTags = function(tags){
		for(var k in tags){
			this._hash[k] = tags[k];
		}
	};
	this.mapTagClass = function(tag){
		return this._hash[tag].clazz;
	};
});