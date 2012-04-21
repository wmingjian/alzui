_package("alz.core");

/**
 * ftype含义
 * 1=系统邮件夹
 * 0=自建邮件夹
 * 2=代收邮件夹
 * [TOOD]是否应该让子类实现如下接口？
 *   dataFormat
 *   appendItem
 *   updateItem
 *   removeItem
 *   appendItems
 *   removeItems
 */
_class("AbstractModel", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._parent = null;
		this._parentModel = null;  //父数据模型
		this._primaryKey = "";  //主键
		this._hash = {};  //(哈希表)数据列表
		this._list = [];  //数据数组(当含有排序信息后，可以当作主索引使用)
		this._hashIndexs = {};  //索引哈希(每个元素是一个数组)
		this._listeners = [];  //数据监听组件列表
	};
	this.create = function(parent){
		this._parent = parent;
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._listeners.length; i < len; i++){
			this._listeners[i] = null;
		}
		this._listeners.length = 0;
		for(var k in this._hashIndexs){
			for(var i = 0, len = this._hashIndexs.length; i < len; i++){
				this._hashIndexs[k][i] = null;
			}
			delete this._hashIndexs[k];
		}
		this.dataReset();  //重置数据对象
		this._parentModel = null;
		this._parent = null;
		_super.dispose.apply(this);
	};
	this.getPrimaryKey = function(){
		return this._primaryKey;
	};
	this.getListByFilter = function(filter){
		var arr = [];
		for(var i = 0, len = this._list.length; i < len; i++){
			var item = this._list[i];
			if(filter(item)){
				arr.push(item);
			}
		}
		return arr;
	};
	/**
	 * 添加一个数据监听对象
	 * @param listener {FolderListView} 实现了onDateChange接口的视图组件
	 */
	this.addDataListener = function(listener){
		this._listeners.push(listener);
	};
	this.removeDataListener = function(listener){
		this._listeners.removeAt(this._listeners.indexOf(listener));
	};
	/**
	 * 分派数据变化（事件）
	 * @param act {String}
	 * @param data {JsonObject}
	 * @param olddata {JsonObject}
	 */
	this.dispatchDataChange = function(act, data, olddata){
		for(var i = 0, len = this._listeners.length; i < len; i++){
			//[TODO]未释放的脚本对象
			try{
				var listener = this._listeners[i];
				var action = act.split("_")[1];
				switch(action){
				case "add":
					if(!listener.getFilter || listener.getFilter()(data)){  //有过滤器的话，需要先通过过滤器，才添加
						listener.onDataChange.apply(listener, arguments);
					}
					break;
				case "mod":
					//if(!listener.getFilter || listener.getFilter()(data)){  //有过滤器的话，情况比较复杂，先交给“视图组件”来自行处理
					listener.onDataChange.apply(listener, arguments);
					//}
					break;
				case "del":
					if(!listener.getFilter || listener.getFilter()(data)){  //有过滤器的话，需要先通过过滤器，才删除
						listener.onDataChange.apply(listener, arguments);
					}
					break;
				/*
				case "remove":
				case "update":
				case "delete":
				case "clear":
				case "up":
				case "adds":
				case "clean":
				*/
				default:
					listener.onDataChange.apply(listener, arguments);
					break;
				}
			}catch(ex){
			}
		}
	};
	//子类必须实现的接口方法
	_abstract(this, "onDataChange");
	_abstract(this, "dataFormat", function(listData){});
	_abstract(this, "appendItem", function(data){});
	_abstract(this, "updateItem", function(data){});
	_abstract(this, "removeItem", function(id){});
	_abstract(this, "appendItems", function(data){});
	_abstract(this, "updateItems", function(data){});
	_abstract(this, "removeItems", function(ids){});
	/*
	this.dataFormat = function(dataList){};
	this.appendItem = function(data){};  //添加一条数据
	this.updateItem = function(data){};  //更新一条数据
	this.removeItem = function(id){};    //删除一条数据
	this.appendItems = function(data){};  //添加N条数据
	this.updateItems = function(data){};  //更新N条数据
	this.removeItems = function(ids){};  //删除N条数据
	*/
	this.dataReset = function(){
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i] = null;
		}
		this._list.length = 0;
		for(var k in this._hash){
			delete this._hash[k];
		}
	};
	this.checkJsonData = function(json, silent){
		return this._parent._app.checkJsonData(json, silent);
	};
	this.callback = function(agent, func, json){
		if(typeof func == "function"){
			func.call(agent, json);
		}else{
			agent[func](json);
		}
	};
});