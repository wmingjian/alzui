_package("alz.mui");

_import("alz.mui.Component");

/**
 * 菜单项
 */
_class("MenuItem", Component, function(){
	this._init = function(){
		_super._init.call(this);
	};
	this.build = function(el){
		_super.build.apply(this, arguments);
		//[TODO]使用文本类型模板更新TextNode
		var attributes = el._attributes;
		var sb = [];
		if(attributes.text){
			sb.push(attributes.text);
		}
		if(attributes.key){
			sb.push("(<u>" + attributes.key + "</u>)");
		}
		if(attributes.more){
			sb.push(attributes.more);
		}
		console.log(sb.join(""));
		this._self.childNodes[0].innerHTML = sb.join("");
	};
	this.dispose = function(){
		if(this._disposed) return;
		_super.dispose.apply(this);
	};
});