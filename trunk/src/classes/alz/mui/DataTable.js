_package("alz.mui");

_import("alz.mui.ListBox");

/**
 * 数据表格组件(视图)
 */
_class("DataTable", ListBox, function(){
	this._init = function(){
		_super._init.call(this);
		this._hashIndexs = {};  //索引哈希(每个元素是一个数组)
		this._dataModel = null;  //数据模型
		this._checkall = null;  //全选复选框
		this._table = null;     //关键的table
		this._tbody = null;
		this._sortKey = this._key;
		this._activeSortField = null;  //当前活动的字段
		this._sort = {  //存储当前排序状态
			"by"      : "",
			"sorttype" : ""
		};
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		this._hashIndexs[this._key] = this._items;  //把this._items看作主索引
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._tbody = null;
		this._table = null;
		this._checkall = null;
		this._dataModel = null;
		for(var k in this._hashIndexs){
			for(var i = 0, len = this._hashIndexs.length; i < len; i++){
				this._hashIndexs[k][i] = null;
			}
			delete this._hashIndexs[k];
		}
		_super.dispose.apply(this);
	};
	/**
	 * @param {String} key 要排序的字段
	 */
	this.getSortItems = function(key){
		return this._items.sort(function(a, b){
			if(a._data[key] > b._data[key]) return 1;
			if(a._data[key] < b._data[key]) return -1;
			return 0;
		});
	};
	/**
	 * 按照当前排序规则，在正确的位置上插入一个数据项
	 * 该方法是具有排序特性的组件针对 ListBox::pushItem 的替代方法
	 */
	//this.pushItem =
	this.insertItem = function(item){
		//_super.pushItem.apply(this, arguments);
		if(this._key == "") window.alert("[ListBox::pushItem]key == ''");
		var k = item._data[this._key];
		var key = this._sortKey || this._key;
		if(!(k in this._hash)){
			this._hash[k] = item;
			//this._items.push(item);
			var n = this.halfFind(this._items, item, function(a, b){
				runtime.log("====" + a._data[key] + ">" + b._data[key] + "=" + (a._data[key] > b._data[key]));
				if(a._data[key] > b._data[key]) return 1;
				if(a._data[key] < b._data[key]) return -1;
				return 0;
			});
			if(n.ret == -1){
				runtime.log("====" + n.pos);
				this._items.splice(n.pos, 0, item);  //插入一个元素
			}else{
				window.alert("[DataTable::insertItem]数据有重复");
				//runtime.log("[DataTable::pushItem]当前要插入的元素已经存在");
			}
		}
	};
	//二分查找算法
	this.halfFind = function(arr, item, f){
		var i = 1;
		var low = 0;
		var high = arr.length - 1;
		if(high == -1){
			return {"ret": -1, "pos": 0};
		}
		var t = Math.floor((high + low) / 2);
		while(low < high && f(arr[t], item) * f(arr[low], item) * f(arr[high], item) != 0){
			//runtime.log("第" + i + "次查找 -> " + t + "的位置：low=" + low + " high=" + high);
			if(f(item, arr[t]) == 1){  //item > arr[t]
				low = t + 1;
			}else{
				high = t - 1;
			}
			t = Math.floor((high + low) / 2);
			i++;
		}
		if(high == -1){
			return {"ret": -1, "pos": 0};
		}
		if(low >= high && f(arr[t], item) * f(arr[low], item) * f(arr[high], item) != 0){
			//runtime.log("第" + i + "次查找 -> " + t + "的位置：失败！low=" + low + " high=" + high);
			return {
				"ret": -1,
				"pos": f(item, arr[low]) == -1 ? low : low + 1
			};
		}else{
			if(f(arr[t], item) == 0){  //arr[t] == item
				tt = t;
			}else if(f(arr[low], item) == 0){  //arr[low] == item
				tt = low;
			}else{
				tt = high;
			}
			//runtime.log("第" + i + "次查找 -> " + tt + "的位置：找到！low=" + low + " high=" + high);
			return {
				"ret": t,
				"pos": t
			};
		}
		//return t;
	};
	//希尔排序算法
	this.shellSort = function(arr, func){
		for(var step = arr.length >> 1; step > 0; step >>= 1){
			for(var i = 0; i < step; ++i){
				for(var j = i + step; j < arr.length; j += step){
					var k = j, value = arr[j];
					while(k >= step && func(arr[k - step], value) > 0){
						arr[k] = arr[k - step];
						k -= step;
					}
					arr[k] = value;
				}
			}
		}
		//return arr;
	};
	this.activeSortField = function(sender, force){
		var dom = runtime.dom;
		//id         :"number",  //可排序
		//filename   :"string",  //可排序
		//filesize   :"number",  //可排序
		//status     :"number",  //可排序
		//downloadcnt:"number",  //可排序
		//leftdays   :"number",  //可排序
		//token      :"string",
		//url        :"string"
		var key = sender.getAttribute("_by");
		if(force){  //第一次初始化过程中使用强制模式，保证不反转by和sorttype参数
			//this._sort.by = key;
			//this._sort.sorttype = "desc";
			dom.addClass(sender, this._sort.sorttype == "asc" ? "sort_down" : "sort_up");
		}else{
			if(this._activeSortField){
				dom.removeClass(this._activeSortField, "sort_down");
				dom.removeClass(this._activeSortField, "sort_up");
			}
			this._sort.by = key;  //记住排序状态
			this._sort.sorttype = key == this._sort.by ? (this._sort.sorttype == "asc" ? "desc" : "asc") : "asc";
			dom.addClass(sender, key == this._sort.by ? (this._sort.sorttype == "asc" ? "sort_down" : "sort_up") : "sort_up");
		}
		this._activeSortField = sender;
		this.drawTable(this.getSortItems(key));
	};
	this.drawTable = function(items){
		if(this._sort.sorttype == "asc"){
			for(var i = 0, len = items.length; i < len; i++){
				var item = items[i];
				item._self.parentNode.appendChild(item._self);
				item.setChecked(item._active, true);
			}
		}else{
			for(var i = items.length - 1; i >= 0; i--){
				var item = items[i];
				item._self.parentNode.appendChild(item._self);
				item.setChecked(item._active, true);
			}
		}
	};
	/**
	 * 选中符合条件的行，func决定是否符合条件
	 */
	this.selectRows = function(func, table){
		for(var i = 0, len = this._items.length; i < len; i++){
			if(table && this._items[i]._self.parentNode.parentNode != table){
				continue;
			}
			var row = this._items[i];
			if(func(row)){
				row.activate();
			}else{
				row.deactivate();
			}
		}
	};
	/**
	 * @param {Boolean} checked 是否选中
	 */
	this.selectAll = function(checked){
		this._selectMgr.selectAllItems(checked);
		this.dispatchEvent("ItemSelectChange", [this.getActiveNums()]);
	};
	this.cancelAll = function(){
		this._selectMgr.cancelAllActiveItems();
		this._checkall.checked = false;
		this.dispatchEvent("ItemSelectChange", [0]);
	};
	//this.cancelAllActiveItems
});