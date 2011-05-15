_package("alz.mui");

_import("alz.mui.SelectionManager");
_import("alz.mui.Component");

/**
 * 列表框组件
 * protected boolean selectionMode = 0;
 * 0 = (默认)配合ctrl,shift按键可以方便的进行多选的常规模式，仿 window 资源管理器文件选择的行为
 * 1 = ctrl,shift仍然可用，不过默认单击为复选模式，再次单击改为取消复选（目的为了不使用ctrl,shift键依然可以进行多选操作）
 */
_class("ListBox", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._data = null;
		this._useSelectionMode = false;  //{Boolean}是否使用 SelectionManager
		this._multiple         = false;  //{Boolean}默认不支持多选
		this._selectionMode    = 0;      //{Number}列表项目多选模式
		this._key = "";    //数据模型中的主键
		this._hash = {};   //哈希表
		this._items = [];  //列表项目
		this._activeItem = null;
		this._selectMgr = null;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._self.onselectstart = function(){return false;};
		this._selectMgr = new SelectionManager();
//		this._useSelectionMode = true;  //{Boolean}是否使用 SelectionManager
//		this._multiple         = true;  //{Boolean}默认不支持多选
//		this._selectionMode    = 1;      //{Number}列表项目多选模式
		this._selectMgr.setBindList(this);
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._selectMgr.dispose();
		this._selectMgr = null;
		if(this._activeItem){
			this._activeItem.deactivate();
			this._activeItem = null;
		}
		for(var i = 0, len = this._items.length; i < len; i++){
			//this._items[i].dispose();
			this._items[i] = null;
		}
		this._items = [];  //列表项目
		for(var k in this._hash){
			this._hash[k].dispose();
			delete this._hash[k];
		}
		this._data = null;
		this._self.onselectstart = null;
		_super.dispose.apply(this);
	};
	this.getData = function(){
		return this._data;
	};
	this.setData = function(v){
		this._data = v;
	};
	this.getActiveItem = function(){
		return this._activeItem;
	};
	this.setActiveItem = function(v){
		if(this._activeItem == v) return;
		if(this._activeItem){
			this._activeItem.deactivate();
		}
		if(v){
			v.activate();
		}
		this._activeItem = v;
		//if(this.onSelectChange) this.onSelectChange(v);
	};
	this.getActiveNums = function(){
		return this._selectMgr.getActiveNums();
	};
	this.getActiveItems = function(){
		return this._selectMgr.getActiveItems();
	};
	this.cancelAllActiveItems = function(){
		return this._selectMgr.cancelAllActiveItems();
	};
	this.pushItem = function(item){
		if(this._key == "") window.alert("[ListBox::pushItem]key == ''");
		var k = item._data[this._key];
		if(!(k in this._hash)){
			this._hash[k] = item;
			this._items.push(item);
		}
	};
	this.unshiftItem = function(item){
		if(this._key == "") window.alert("[ListBox::unshiftItem]key == ''");
		var k = item._data[this._key];
		if(!(k in this._hash)){
			this._hash[k] = item;
			this._items.unshift(item);
		}
	};
	/**
	 * @param n {Number|ListItem}
	 * @param bCache {boolean}
	 * [TODO]更新 _selectMgr 中的相关信息
	 */
	this.removeItem = function(n, bCache){
		if(typeof n != "number"){
			n = this._items.indexOf(n);
		}
		if(n != -1){
			var item = this._items[n];
			if(item == this._activeItem){
				this._activeItem = null;
			}
			var p = this._selectMgr._activeItems.indexOf(item);
			if(p != -1){
				this._selectMgr._activeItems.removeAt(p);
			}
			if(this.onItemRemove){
				this.onItemRemove();  //针对 ContactList 的处理
			}
			//var uid = item._data.uid;
			//app.getModel("group").removeAllGroupMember(uid);  //移除每个组中的成员索引信息
			//delete hash[item._data.uid];  //移除 ContactItem._data 信息
			//移除 Item
			delete this._hash[item._data[this._key]];
			if(bCache){  //如果缓存，只需从父节点移出
				if(item._self && item._self.parentNode != null){
					item._self.parentNode.removeChild(item._self);
				}
			}else{
				item.dispose();
			}
			this._items[n] = null;
			this._items.removeAt(n);
		}
	};
	/**
	 * 删除活动的 ContactItem
	 * [TODO]通过建立合理的数据结构，下面的循环都是可以优化的
	 */
	this.removeActiveItems = function(app){
		for(var i = 0; i < this._items.length;){
			if(this._items[i]._active){
				this.removeItem(i);
				continue;
			}
			i++;
		}
		//app._groupList.updateAllGroup();  //更新所有组的成员数
	};
	this.indexOf_key = function(data, key){
		var n = -1;
		for(var i = 0, len = this._items.length; i < len; i++){
			if(this._items[i][key] == data){
				n = i;
				break;
			}
		}
		return n;
	};
	this.getItemIndex = function(item){
		var n = -1;
		for(var i = 0, len = this._items.length; i < len; i++){
			if(this._items[i] == item){
				n = i;
				break;
			}
		}
		return n;
	};
	this.getItemByKey = function(key){
		return key in this._hash ? this._hash[key] : null;
	};
	//--------------------------------
	//interface MultiSelect
	//下面的方法是允许多选的接口方法
	//--------------------------------
	/**
	 * 获取组建的列表项目数组
	 */
	this.getItems = function(){
		return this._items;
	};
	/**
	 * 获取一个列表项目
	 */
	this.getItem = function(n){
		return this._items[n];
	};
	/**
	 * 激活指定的列表项目，支持多选
	 * @param item {HTMLElement} 要激活的列表项目
	 * @param active {Boolean} 是否激活该列表项目
	 */
	this.activeItem = function(item, active){
		if(!this._useSelectionMode){
			if(this._activeItem == item) return;
			if(this._activeItem){
				this._activeItem.deactivate();
			}
			item.activate();
			this._activeItem = item;
			if(this.onSelectChange) this.onSelectChange(item);
		}else{
			if(active){
				item.activate();
			}else{
				item.deactivate();
			}
		}
	};
	/**
	 * 通过过滤器函数来选择相关的项目
	 */
	this.selectByFilter = function(func){
		var list = [];   //活动的列表项目
		var list0 = [];  //每个列表项目的状态(true|false)
		var items = this._items;
		for(var i = 0, len = items.length; i < len; i++){
			var v = func(items[i]);
			if(v){
				list.push(items[i]);
			}
			list0.push(v);
		}
		items = null;
		this._selectMgr.selectItems(list, list0);
	};
});