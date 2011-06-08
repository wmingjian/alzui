_package("alz.core");

_import("alz.core.Plugin");
_import("alz.template.TemplateObject");

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
	this.regXmlTags = function(node){
		var nodes = node.childNodes;
		for(var i = 0, len = nodes.length; i < len; i++){
			var node = nodes[i];
			var k = node.tagName;
			var tpl = new TemplateObject();
			tpl.create(node.firstChild);
			this._hash[k] = {
				"id"   : k,
				"clazz": node.getAttribute("clazz"),
				"node" : node,
				"template": tpl
			};
		}
	};
	this.mapTagClass = function(tag){
		return this._hash[tag].clazz;
	};
	this.getTagConf = function(tag){
		return tag in this._hash ? this._hash[tag] : null;
	};
});