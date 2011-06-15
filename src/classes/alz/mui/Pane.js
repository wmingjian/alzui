_package("alz.mui");

_import("alz.mui.Container");
_import("alz.mui.IAction");

/**
 * 可独立工作的面板组件
 */
_class("Pane", Container, function(){
	_implements(this, IAction);
	this._init = function(){
		_super._init.call(this);
		this._app = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.getApp = function(){
		return this._app;
	};
	this.setApp = function(v){
		this._app = v;
	};
	/**
	 * 通过模板名创建一组DOM元素
	 * @param {Element} parent 父元素
	 * @param {String} tpl 模板名
	 * @return {Element}
	 */
	this.createTplElement = function(parent, tpl, app){
		app = app || this._app;
		var tag;
		var str = app.getTpl(tpl);
		str.replace(/^<([a-z0-9]+)[ >]/, function(_0, _1){
			tag = _1;
		});
		var conf = app._taglib.getTagConf(tag);
		if(conf){
			if(parent.getContainer){
				parent = parent.getContainer();
			}
			var node = app._template.createXMLDocument(str).documentElement;
			return this.createElementByXmlNode(parent, node, app/*, {}*/);
		}else{
			return this.createDomElement(parent, str/*, ".module"*/);
		}
	};
});