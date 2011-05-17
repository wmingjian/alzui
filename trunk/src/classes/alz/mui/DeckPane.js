_package("alz.mui");

_import("alz.mui.Component");

/**
 * 层叠面板管理组件(N个Pane组件层叠)
 */
_class("DeckPane", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._hash = {};
		this._activePane = null;  //当前活动的Pane页
	};
	this.bind = function(obj, app){
		this._app = app;
		this.init(obj);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activePane = null;
		for(var k in this._hash){
			this._hash[k].dispose();
			delete this._hash[k];
		}
		this._app = null;
		_super.dispose.apply(this);
	};
	this.exist = function(key){
		return key in this._hash;
	};
	this.getPane = function(key){
		return this._hash[key];
	};
	/**
	 * 基于延迟创建的考虑
	 */
	this.getPane2 = function(key, params){
		var pane;
		if(!this.exist(key)){
			pane = this.createPane(null, key, params);
		}else{
			pane = this.getPane(key);
			pane.setParams(params);
		}
		return pane;
	};
	this.createPane = function(parent, key, params/*, html*/){
		parent = parent || this;  //runtime.getWorkspace()
		var k = key.split("#")[0];
		var conf = this._app.findConf("pane", k);
		var pane = new conf.clazz();
		pane.setData(conf);
		pane.setParams(params);
		if(parent instanceof Pane){
			pane.setParentPane(parent);
		}
		pane.create(parent, this._app, conf.tpl);
		//this.pushItem1(key, pane);
		this._hash[key] = pane;
		return pane;
	};
	this.navPane = function(pid, params){
		var pane = this.getPane2(pid, params);
		if(this._activePane == pane){
			pane.reset(params);
			return;
		}
		if(this._activePane){
			this._activePane.setVisible(false);
		}
		pane.setVisible(true);
		pane.reset(params);
		this._activePane = pane;
	};
});