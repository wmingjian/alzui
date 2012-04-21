_package("alz.mui");

/**
 * 列表条目选择动作管理
 */
_class("SelectionManager", "", function(){
	var listener = {
		"mouseover": function(ev){
			//this._parent._activeItems.indexOf(this) == -1
			if(!this._active){  //如果不是焦点
				if(this._css.hover && this._css.hover.className){  //hover状态可能不存在
					this._self.className = this._css.hover.className;
				}
			}
		},
		"mouseout": function(ev){
			if(!this._active){  //如果不是焦点
				if(this._css.normal && this._css.normal.className){
					this._self.className = this._css.normal.className;
				}
			}
		},
		"mousedown": function(ev){
			var ctrlKey = ev.ctrlKey;
			var shiftKey = ev.shiftKey;
			if(!this._parent._multiple){
				ctrlKey = false;
				shiftKey = false;
			}
			this._parent._selectMgr.selectItem(this, ctrlKey, shiftKey);
			if(this._parent.onMousedown){
				this._parent.onMousedown(ev);
			}
		},
		"click": function(ev){
			ev.cancelBubble = true;
			return false;
		}
	};
	SelectionManager.SINGLE   = 1;
	SelectionManager.MULTIPLE = 2;
	this._init = function(){
		_super._init.call(this);
		this._list = null;  //{GroupList}
		this._activeItems = [];  //当前激活的列表项目
		this._lastActiveItem = null;  //{GroupItem}最后一次单选激活的列表项目
		this._defaultSelectMode = SelectionManager.SINGLE;
	};
	this.init = function(index){
		if(typeof index == "number"){
			this._lastActiveItem = this._list.getItem(index);  //默认激活第一个列表项目
			this.selectItem(this._list.getItem(index));
		}
	};
	this.dispose = function(){
		if(this._disposed) return;
		this.unbindEvent();
		this._lastActiveItem = null;
		this._activeItems.length = 0;
		this._list = null;
		_super.dispose.apply(this);
	};
	this.setBindList = function(list){
		this._list = list;
	};
	this.itemBindEvent = function(item){
		if(!item._evFlag){
			item._evFlag = true;
			runtime.getDom().addEventListener(item._itemDom, "", listener, item);
		}
	};
	this.itemUnbindEvent = function(item){
		if(item._evFlag){
			runtime.getDom().removeEventListener(item._itemDom, "", listener, item);
			item._evFlag = false;
		}
	};
	this.bindEvent = function(){
		var items = this._list.getItems();
		for(var i = 0, len = items.length; i < len; i++){
			this.itemBindEvent(items[i]);
		}
	};
	this.unbindEvent = function(){
		var items = this._list.getItems();
		for(var i = 0, len = items.length; i < len; i++){
			if(items[i]._evFlag){
				if(items[i]._itemDom){ //RQFM-6383 IE7通讯录首页，查找功能有的时候搜索结果不准确
					runtime.getDom().removeEventListener(items[i]._itemDom, "", listener, items[i]);
				}
				items[i]._evFlag = false;
			}
		}
	};
	this.getActiveItems = function(){
		return this._activeItems;
	};
	this.getActiveNums = function(){
		return this._activeItems.length;
	};
	this.getListener = function(){
		return listener;
	};
	/**
	 * 选择指定的列表项目
	 * @param item {HTMLElement} 要选择的列表项目
	 * @param ctrlKey {Boolean} Ctrl键是否按下，支持多选时使用
	 * @param shiftKey {Boolean} Shift键是否按下，支持多选时使用
	 * @param fireChangeEvent {Boolean} 是否触发 onselectchanage 事件
	 * @param forceSelect {Boolean} 是否强制选择
	 */
	this.selectItem = function(item, ctrlKey, shiftKey, fireChangeEvent, forceSelect){
		if(typeof fireChangeEvent == "undefined"){
			fireChangeEvent = true;
		}
		forceSelect = forceSelect || false;

		if(!ctrlKey && !shiftKey){
			this._lastActiveItem = item;
		}
		/*
		if(this._list._selectionMode == 1){
			if(item._active){
				this._list.activeItem(item, false);
				this._activeItems.removeAt(this._activeItems.indexOf(item));
			}else{
				this._list.activeItem(item, true);
				this._activeItems.push(item);  //[TODO]是否保存列表条目的原始顺序？
			}
		}else{
		*/
			if(!this._list._multiple){  //如果不允许多选
				ctrlKey = false;
				shiftKey = false;
			}else{
				ctrlKey = ctrlKey || this._defaultSelectMode == SelectionManager.MULTIPLE;
			}
			var start, end;
			if(shiftKey){
				start = Math.min(this._lastActiveItem.getIndex(), item.getIndex());
				end = Math.max(this._lastActiveItem.getIndex(), item.getIndex());
			}
			var list = [];   //活动的列表项目
			var list0 = [];  //每个列表项目的状态(true|false)
			var items = this._list.getItems();
			for(var i = 0, len = items.length; i < len; i++){
				var obj = items[i];
				if(shiftKey && i >= start && i <= end){
					list.push(obj);
					list0.push(true);
					continue;
				}
				if(ctrlKey){
					if(obj == item){
						if(!obj._active) list.push(obj);
						list0.push(!obj._active);
					}else{
						if(obj._active) list.push(obj);
						list0.push(obj._active);
					}
					continue;
				}
				if(this._list._selectionMode == 0){
					if(obj == item) list.push(obj);
					list0.push(obj == item);
				}else{  //this._list._selectionMode == 1
					if(obj == item){
						if(!obj._active || forceSelect){  //不活动的 或 强制活动的
							list.push(obj);
						}
						list0.push(!obj._active || forceSelect);
					}else{
						if(obj._active){
							list.push(obj);
						}
						if(this._list._multiple){
							list0.push(obj._active);  //其他 Item 不变化
						}else{
							list0.push(false);
						}
					}
				}
			}
			this.selectItems(list, list0);
		//}
		if(this._list.onItemCancel && !item._active){
			this._list.onItemCancel(item);
		}
		if(this._list.onSelectChange && fireChangeEvent){
			this._list.onSelectChange(item._active ? item : this._activeItems[0]);
		}
	};
	/**
	 * 选择一组项目
	 */
	this.selectItems = function(list, list0){
		this._activeItems = list;
		//[TODO]如何对上面过程进行优化，对不需要调整的 Item，应该可以不进行操作
		var items = this._list.getItems();
		for(var i = 0, len = list0.length; i < len; i++){
			this._list.activeItem(items[i], list0[i]);
		}
	};
	/**
	 * 把全部项目设置为选中或非选中状态
	 * @param checked {Boolean} 是否选中
	 */
	this.selectAllItems = function(checked){
		var items0 = [];
		var items = this._list.getItems();
		for(var i = 0, len = items.length; i < len; i++){
			this._list.activeItem(items[i], checked);
			items0.push(items[i]);
		}
		if(checked){
			//不能使用items这个引用，因为它是 this._list 的一个属性，在全选删除一个组
			//的联系人的时候会产生删除两次的错误
			this._activeItems = items0;
			this._lastActiveItem = this._activeItems[this._activeItems.length - 1];
		}else{
			this._activeItems = [];
			this._lastActiveItem = null;
		}
		if(this._list.onSelectChange){
			this._list.onSelectChange(this._lastActiveItem);
		}
	};
	/**
	 * 把全部项目置为非选中状态
	 */
	this.cancelAllActiveItems = function(){
		var items = this._activeItems;
		for(var i = 0, len = items.length; i < len; i++){
			this._list.activeItem(items[i], false);
		}
		this._activeItems.length = 0;
	};
	/**
	 * 把某个项目置为非选中状态
	 */
	this.cancelItem = function(item){
		this._list.activeItem(item, false);
		for(var i = 0, len = this._activeItems.length; i < len; i++){
			if(this._activeItems[i] == item){
				this._activeItems.removeAt(i);
			}
		}
	};
});