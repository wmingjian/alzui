_package("alz.mui");

_import("alz.mui.ListItem");

/**
 * 数据行组件(视图)
 */
_class("DataRow", ListItem, function(){
	/**
	 * 根据cell结构数据创建一组cell对象
	 */
	this.createCells = function(cellsInfo){
		for(var i = 0, len = cellsInfo.length; i < len; i++){
			this._createElement2(this._self, "td", cellsInfo[i][0], {
				"innerHTML": cellsInfo[i][1]
			});
		}
		//this._checkbox = this._self.childNodes[0].childNodes[0].childNodes[0];
	};
	this.init_callback = function(){
		this._checkbox.onmousedown = function(ev){
			ev = ev || window.event;
			ev.cancelBubble = true;
		};
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._checkbox){
			this._checkbox.onmousedown = null;
		}
		_super.dispose.apply(this);
	};
});