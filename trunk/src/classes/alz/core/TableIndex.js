_package("alz.core");

_import("alz.core.EventTarget");
_import("alz.core.DataChangeEvent");

/**
 * 数据表索引对象
 */
_class("TableIndex", EventTarget, function(){
	this._init = function(){
		_super._init.call(this);
		this._table = null;  //所属数据表
		this._pkey = "";     //表的主键
		this._asc = "+";  //排序顺序(+:正序,-:逆序)
		this._key = "";  //排序字段
		this._sortFunc = null;  //排序函数
		this._list = null;  //列表数据
	};
	this.create = function(table, key){
		this._table = table;
		this._pkey = this._table.getPrimaryKey();
		var asc = key.charAt(0);
		this._asc = asc == "-" ? "-" : "+";
		this._key = asc == "+" || asc == "-" ? key.substr(1) : key;
		this._sortFunc = this.genSortFunc(this._asc, this._key);
		var arr;
		if(this._asc == "+" && this._key == this._pkey){
			arr = [];
		}else{
			var list = this._table.getList();
			if(list && list.length > 0){
				arr = list.slice(0);  //正序主键索引就是主索引
				arr.sort(this._sortFunc);
			}else{
				arr = [];
			}
		}
		this._list = arr;
	};
	this.dispose = function(){
		this._list = null;
		this._sortFunc = null;
		//this._key = "";
		//this._asc = "";
		this._table = null;
		_super.dispose.apply(this);
	};
	this.getList = function(){
		return this._list;
	};
	this.genSortFunc = function(asc, k){
		var p = this._pkey;
		function sort_p0(a, b){  //主索引使用的比较方法
			var ak = a[p], bk = b[p];
			return ak > bk ? 1 : (ak < bk ? -1 : 0);
		}
		function sort_p1(a, b){
			var ak = a[p], bk = b[p];
			return ak < bk ? 1 : (ak > bk ? -1 : 0);
		}
		if(asc == "+"){  //正序
			return k == p ? sort_p0 : function(a, b){  //其他索引使用的比较方法
				var ak = a[k], bk = b[k];
				return ak > bk ? 1 : (ak < bk ? -1 : sort_p0(a, b));
			};
		}else{  //逆序
			return k == p ? sort_p1 : function(a, b){
				var ak = a[k], bk = b[k];
				return ak < bk ? 1 : (ak > bk ? -1 : sort_p1(a, b));
			};
		}
	};
	/**
	 * 从排序后的数组中使用二分法查找一条记录
	 * @param {Array} list 排过序的数组
	 * @param {Object} item 要查找的记录
	 * @param {Function} func 记录比较函数
	 * @param {String} k 要比较的记录的字段
	 */
	this.binaryFind = function(list, item, func, k){
		if(list.length == 0) return 0;
		var low = 0;
		var high = list.length - 1;
		while(low <= high){
			var mid = Math.floor((low + high) / 2);
			var v = func(list[mid], item, k);
			if(v == 0){
				return mid;
			}
			if(v == 1){
				if(low == high || low == high - 1){  //受floor影响，必须考虑low == high - 1的情况
					return mid;
				}
				high = mid - 1;
			}else{  //v == -1
				if(low == high){
					return mid + 1;
				}
				low = mid + 1;
			}
		}
		return -1;
	};
	this.dumpId = function(){
		var a = [];
		for(var i = 0, len = this._list.length; i < len; i++){
			a.push(this._list[i][this._pkey]);
		}
		console.log(a);
	};
	/**
	 * 更新一个索引对象
	 */
	this.updateIndex = function(act, item){
		//console.log("updateIndex(" + act + "," + item[this._pkey]);
		//二分法查找效率更高
		//var n = this._list.indexOf(item);  //[TODO]记录在主索引中的位置
		var n = this.binaryFind(this._list, item, this._sortFunc, this._key);
		switch(act){
		case "add":
			if(n == -1){
				runtime.error("[TableIndex::updateIndex(add)]error");
			}else if(n >= 0 && n < this._list.length){
				if(this._list[n] === item){
					runtime.error("[TableIndex::updateIndex(add)]数据表存在相等记录");
				}
				this._list.splice(n, 0, item);  //插入记录
			}else{  //n >= this._list.length
				this._list.push(item);
			}
			//this.dumpId();
			//[TODO]怎么传递视图组件中添加记录的位置？
			var ev = new DataChangeEvent(this._table.getId() + "_add", item);
			ev.pos = n;
			this.dispatchEvent(ev);
			break;
		case "mod":
			if(n == -1 || n >= this._list.length){
				runtime.error("[TableIndex::updateIndex(mod)]error");
			}else{  //n >= 0 && n < this._list.length
				//console.log("[TODO]更新索引");
				this.dispatchEvent(new DataChangeEvent(this._table.getId() + "_mod", item));
			}
			break;
		case "del":
			if(n == -1 || n >= this._list.length){
				runtime.error("[TableIndex::updateIndex(del)]error");
			}else{  //n >= 0 && n < this._list.length
				this.dispatchEvent(new DataChangeEvent(this._table.getId() + "_del", item));
				this._list.splice(n, 1);  //删除记录
			}
			break;
		}
	};
	this.dispatchExistRecords = function(){
		for(var i = 0, len = this._list.length; i < len; i++){
			var ev = new DataChangeEvent(this._table.getId() + "_add", this._list[i]);
			ev.pos = i;
			this.dispatchEvent(ev);
		}
	};
	this.getRecordPos = function(id){
		for(var i = 0, len = this._list.length; i < len; i++){
			if(this._list[i][this._pkey] == id){
				return i;
			}
		}
		return -1;
	};
});