_package("alz.core");

_import("alz.core.EventTarget");
_import("alz.core.TableIndex");
_import("alz.core.TableFilter");
_import("alz.core.DataChangeEvent");

/**
 * 元数据表
 */
_class("MetaTable", EventTarget, function(){
	this._init = function(key){
		_super._init.call(this);
	//this._parent = null;
	//this._listeners = [];     //数据监听组件列表
		this._conf = null;        //配置信息
		this._id = "";            //数据表ID标识
		this._primaryKey = key || "id";
		this._hash = {};          //(哈希表)数据列表
		this._list = [];        //数据数组(当含有排序信息后，可以当作主索引使用)
		this._hashIndex = {};     //索引哈希(每个元素是一个TableIndex对象)
		this._filters = {};       //过滤器及过滤器对应的结果
	};
	this.create = function(parent, id, path){
		var index = this.createIndex("+" + this._primaryKey);
		this._list = index.getList();  //主索引
		this._parent = parent;
		this._id = id;
		this._path = path;
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var k in this._filters){
			this._filters[k] = null;
			delete this._filters[k];
		}
		for(var k in this._hashIndex){
			this._hashIndex[k].dispose();
			delete this._hashIndex[k];
		}
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i] = null;
		}
		//this._list = this._list.splice(0, this._list.length);
		this._list = [];
		for(var k in this._hash){
			delete this._hash[k];
		}
		//this._parent = null;
		_super.dispose.apply(this);
	};
	this.exists = function(id){
		return id in this._hash;
	};
	this.setConf = function(v){
		this._conf = v;
	};
	this.getId = function(){
		return this._id;
	};
	this.getPrimaryKey = function(){
		return this._primaryKey;
	};
	this.getMaxId = function(){
		return this._maxId;
	};
	this.getLength = function(){
		return this._list.length;
	};
	this.getItem = function(id){
		return this._hash[id];
	};
	this.getList = function(){
		return this._list;
	};
	this.getListByFilter = function(filter){
		var arr = [];
		for(var i = 0, len = this._list.length; i < len; i++){
			var item = this._list[i];
			if(filter(item)){
				arr.push(item);
			}
			item = null;
		}
		return arr;
	};
	this.getIndex2 = function(key){
		if(key in this._hashIndex){
			return this._hashIndex[key];
		}else{
			return this.createIndex(key);
		}
	};
	/**
	 * 创建一个索引
	 * @param {String} 要索引的key
	 * @return {TableIndex}
	 */
	this.createIndex = function(key){
		var ti = new TableIndex();
		ti.create(this, key);
		this._hashIndex[key] = ti;
		return ti;
	};
	/**
	 * 创建一个过滤器
	 * @param {String} key 排序的字段
	 * @param {Function} filter 过滤器函数
	 * @return {TableFilter}
	 */
	this.createFilter = function(key, filter){
		var tf = new TableFilter();
		tf.create(this, key, filter);
		this._filters[key] = tf;
		return tf;
	};
	this._insertIndex = function(item){
		var key = this._primaryKey;
		var id = item[key];
		var list = this._list;
		for(var i = 0, len = list.length; i < len; i++){
			if(list[i][key] > id){
				return i;
			}
		}
		return list.length;
	};
	//在有序表R[1..n]中进行二分查找，成功时返回结点的位置，失败时返回零
	this.binSearch = function(K, start, end){
		var R = this._list;
		var key = this._primaryKey;
		var low = start || 0;
		var high = end || R.length - 1;
		if(R.length == 0) return 0;
		if(low == high){
			return K < R[low][key] ? low : low + 1;
		}else{
			if(K < R[low][key]) return low;
			if(K > R[high][key]) return high + 1;
			var mid;  //置当前查找区间上、下界的初值
			while(low <= high){  //当前查找区间R[low..high]非空
				mid = Math.floor((low + high) / 2);
				if(K == R[mid][key]){
					//alert("[MetaTable::binSearch]error");
					return mid;  //查找成功返回
				}
				if(K < R[mid][key]){
					if(mid == low){
						return mid;
					}
					//high = mid - 1;  //继续在R[low..mid-1]中查找
					high = mid;
				}else{
					if(mid == low){
						return mid + 1;
					}
					//low = mid + 1;  //继续在R[mid+1..high]中查找
					low = mid;
				}
			}
		}
		return 0;  //当low>high时表示查找区间为空，查找失败
	};
	this._append = function(item){
		var key = this._primaryKey;
		var id = item[key];
		if(id in this._hash) return null;
		this._hash[id] = item;
		//插入元素到对应的位置
		//var n = this._insertIndex(item);
		var n = this.binSearch(id);
		if(n == 0){
			this._list.unshift(item);
		}else if(n >= this._list.length){
			this._list.push(item);
		}else{
			var arr0 = this._list.slice(0, n);
			var arr1 = this._list.slice(n);
			this._list = arr0.concat(item, arr1);
		}
		return item;
	};
	/**
	 * 添加一条记录
	 */
	this.append = function(item){
		var ret = this._append(item);
		if(ret){
			/*
			var ev = new Event("ItemAdd");
			ev.data = ret;
			this.dispatchEvent(ev);
			ev = null;
			*/
		}
		return ret;
	};
	/**
	 * 添加N条记录
	 */
	this.appends = function(items){
		var arr = [];
		for(var i = 0, len = items.length; i < len; i++){
			var ret = this._append(items[i]);
			if(ret){
				arr.push(ret);
			}
		}
		if(arr.length > 0){
			/*
			var ev = new Event("ItemsAdd");
			ev.data = arr;
			this.dispatchEvent(ev);
			ev = null;
			*/
		}
	};
	/**
	 * 更新一条记录
	 */
	/**
	 * 删除N条记录
	 * @param ids {Array}
	 */
	this.deleteRecords = function(ids){
		for(var i = 0, len = ids.length; i < len; i++){
			this.deleteRecord(ids[i]);
		}
	};
	this.pop = function(){
		var item = this._list.pop();
		delete this._hash[item[this._primaryKey]];
		return item;
	};
	this.dump = function(){
		var sb = [];
		for(var i = 0, len = this._list.length; i < len; i++){
			sb.push(this._list[i][this._primaryKey]);
		}
		return sb;
	};
	/**
	 * 执行回调函数
	 * @param {Number} cbid 回调函数编号
	 * @param {JsonObject} data 传递给回调函数的参数
	 */
	this.callback = function(cbid, data){
		runtime._task.execute(cbid, [data]);
	};
	/**
	 * 添加一条记录
	 */
	this.insertRecord = function(data, list){
		data[this._primaryKey] = parseInt(data[this._primaryKey]);  //默认主键数字型
		var id = data[this._primaryKey];
		//1)保证主键(id)唯一性
		if(id in this._hash){  //如果已经存在，忽略
			runtime.warning("新增记录(type=" + this._id + ")已经存在id=" + id);
		}else{  //新增
			var item = data;  //runtime.clone(data);
			if(id > this._maxId){
				this._maxId = id;
			}
			this._hash[id] = item;  //2)存储到hash中
			//3)更新主索引和其他索引
			//var n = this.insertPos(this._list, item, this._primaryKey);
			for(var k in this._hashIndex){
				this._hashIndex[k].updateIndex("add", item);
			}
			//[TODO]4)更新过滤器
			if(list){  //批量添加忽略数据监听
				//this._list.push(item);
				list.push(item);
			}else{
				this.dispatchEvent(new DataChangeEvent(this._id + "_add", item));
			}
		}
		/* for test
		function dump(list){
			var sb = [];
			for(var i = 0, len = list.length; i < len; i++){
				sb.push(list[i][this._primaryKey]);
			}
			runtime.log(sb.join(","));
		}
		dump(this._list);
		*/
		return this._hash[id];
	};
	/**
	 * 添加N条记录
	 */
	this.insertRecords = function(data){
		var list = [];
		for(var i = 0, len = data.length; i < len; i++){
			var record = data[i];
			this.insertRecord(record, list);
		}
		/* for test
		var n = 0;
		for(var i = 0, len = data.length; i < len;){
			if(n % 2 == 1){
				this.insertRecord(data[i], list);
				i++;
			}else{
				this.insertRecord(data[len - 1], list);
				len--;
			}
			n++;
		}
		*/
		this.dispatchEvent(new DataChangeEvent(this._id + "_adds", list));
	};
});