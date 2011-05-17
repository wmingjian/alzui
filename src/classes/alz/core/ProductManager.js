_package("alz.core");

_import("alz.core.Plugin");

/**
 * 产品配置信息管理者类
 */
_class("ProductManager", Plugin, function(){
	this._init = function(){
		_super._init.call(this);
		/**
		 * 产品配置数据
		 * {
		 *   name: "sinamail-5.0",  //产品名称
		 *   tpl: [],   //模板
		 *   skin: [],  //皮肤
		 *   paper: []  //信纸
		 * }
		 */
		this._products = {};  //产品配置数据，格式[{name:"",tpl:[],skin:[],paper:[]},...]
		this._activeProduct = null;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activeProduct = null;
		for(var k in this._products){
			delete this._products[k];
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * 注册一个产品配置数据
	 * @param {JsonObject} data 产品配置对象
	 */
	this.regProduct = function(data){
		if(data.name in this._products){
			window.alert("[ERROR]产品" + data.name + "已经注册过了");
		}else{
			this._products[data.name] = data;
			this._activeProduct = data;
		}
	};
	this.getActiveProduct = function(){
		if(this._activeProduct){
			return this._activeProduct;
		}
		for(var k in this._products){
			return this._products[k];
		}
		runtime.log("[WebRuntime::getProduct]data_xxx.js未能正确加载，系统无法正常运行，请检查！");
		return {
			"name" : "",  //产品名称
			"tpl"  : [],  //模板
			"skin" : [],  //皮肤
			"paper": [],  //信纸
			"app"  : []   //APP配置
		};
		//return null;
	};
});