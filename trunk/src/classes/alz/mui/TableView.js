_package("alz.mui");

_import("alz.mui.Component");

/**
 * 表视图组件
 */
_class("TableView", Component, function(){
	this._init = function(){
		_super._init.call(this);
	};
	this.create = function(parent){
		var sb = [];
		sb.push('<table class="mui-Table" border="1" bordercolor="gray" cellspacing="0" cellpadding="1">');
		sb.push('<thead>');
		sb.push('<tr><th>id</th><th>name</th><th>value</th><th>col3</th><th>col4</th><th>col5</th><th>col6</th><th>col7</th><th>col8</th><th>col9</th><th>col10</th></tr>');
		sb.push('</thead>');
		sb.push('<tbody>');
		for(var i = 0, len = 100; i < len; i++){
			sb.push('<tr><td>' + i + '</td><td>name' + i + '</td><td>value' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td></tr>');
		}
		sb.push('</tbody>');
		sb.push('</table>');
		var tpl = sb.join("");
		var obj = runtime.dom.createDomElement(tpl, parent._self);
		//parent.appendChild(obj);
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		_super.dispose.apply(this);
	};
});