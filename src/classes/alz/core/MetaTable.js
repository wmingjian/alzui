_package("alz.core");

_class("MetaTable", "", function(){
	this._init = function(key){
		_super._init.call(this);
		this._primaryKey = key || "id";
		this._hash = {};
		this._list = [];
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i] = null;
		}
		//this._list = this._list.splice(0, this._list.length);
		this._list = [];
		for(var k in this._hash){
			delete this._hash[k];
		}
		_super.dispose.apply(this);
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
	this.getLength = function(){
		return this._list.length;
	};
	this.pop = function(){
		var item = this._list.pop();
		delete this._hash[item[this._primaryKey]];
		return item;
	};
	this.exists = function(id){
		return id in this._hash;
	};
	this.getItem = function(id){
		return this._hash[id];
	};
	this.dump = function(){
		var sb = [];
		for(var i = 0, len = this._list.length; i < len; i++){
			sb.push(this._list[i][this._primaryKey]);
		}
		return sb;
	};
});