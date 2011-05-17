_package("alz.app.demo.pane");

_import("alz.mui.Pane");
_import("alz.mui.TableView");

/**
 * 表格组件面板
 */
_class("PaneTable", Pane, function(){
	this._init = function(){
		_super._init.call(this);
		this._tpl = "pane_table.xml";
		this._table = null;
	};
	this.create = function(parent, app){
		var data = [];
		for(var i = 0, len = 100; i < len; i++){
			data.push({
				"id"   : i,
				"name" : "name" + i,
				"value": "value" + i,
				"col3" : i,
				"col4" : i,
				"col5" : i,
				"col6" : i,
				"col7" : i,
				"col8" : i,
				"col9" : i
			});
		}
		this.setParent2(parent);
		this._data = data;
		this.setApp(app);
		var obj = this.createTplElement(parent, this._tpl);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._table = new TableView();
		this._table.create(this, this._data);
	};
	this.dispose = function(){
		this._table.dispose();
		this._table = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
});