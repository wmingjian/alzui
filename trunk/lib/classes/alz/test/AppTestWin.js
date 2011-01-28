_package("alz.test");

_import("alz.core.Application");
_import("alz.mui.Window");
_import("alz.mui.Console");

_class("AppTestWin", Application, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._console = null;
		this._win1 = null;
		this._win2 = null;
	};
	this.init = function(){
		_super.init.apply(this, arguments);
		this.createConsole();
		switch(runtime.getConfData("action")){
		case "index" : this.test_index();break;
		case "window": this.test_window();break;
		case "table" : this.test_table();break;
		}
	};
	this.dispose = function(){
		if(this._win1){
			this._win2.dispose();
			this._win2 = null;
			this._win1.dispose();
			this._win1 = null;
		}
		this._console.dispose();
		this._console = null;
		_super.dispose.apply(this);
	};
	this.onResize = function(w, h){
		if(this._win1){
			w -= 220;
			h -= 220;
			this._win1.resize(w, h);
			this._win2.resize(w, h);
		}
	};
	this.getLogTime = function(){
		return "[" + new Date().toMyString(3) + "]";  //hh:mm:ss
	};
	this.createConsole = function(){
		this._console = new Console();
		this._console.create(document.body, null/*this*/);
		this._console.resize(640, 100);
		this._console._self.setAttribute("_align", "bottom");
		var _this = this;
		//打印之前缓存的日志信息
		for(var i = 0, len = runtime._log.length; i < len; i++){
			this._console.print(runtime._log[i] + "\n", "log");
		}
		//重定义系统级输出函数
		runtime.log = function(msg){
			_this._console.print(_this.getLogTime() + msg + "\n", "log");
		};
		runtime.warning = function(msg){
			_this._console.print(msg + "\n", "warn");
		};
		runtime.error = function(msg){
			_this._console.print(msg + "\n", "err");
		};
		//控制台开始实际工作
		runtime.warning(this.getLogTime() + "Now start the actual work of the console.");
		this._console.start(this, function(text){
			this.interpret(text);
		});
	};
	this.interpret = function(text){
		try{
			var v = null;
			with(__context__){
				v = eval(text);
			}
			if(typeof v == "object" && v !== null){
				this._console.print(runtime.forIn(v).join("\n") + "\n");
			}
		}catch(ex){
			//window.alert(ex.message);
			//this._console.print(runtime.forIn(ex).join("#") + "\n");
			this._console.print(ex.name + "," + ex.message + "\n");
			return false;
		}
	};
	this.test_index = function(){
	};
	this.test_window = function(){
		this._win1 = new Window();
		this._win1.init($("win1"), $("body1"));
		this._win1._self.style.zIndex = runtime.getNextZIndex();
		this._win2 = new Window();
		this._win2.init($("win2"), $("body2"));
		this._win2._self.style.zIndex = runtime.getNextZIndex();
		var _this = this;
		this._win1._self.getElementsByTagName("input")[0].checked = true;
		this._win1._self.getElementsByTagName("input")[0].onclick = function(){
			_this._win1.setResizable(this.checked);
		};
		this._win2._self.getElementsByTagName("input")[0].checked = true;
		this._win2._self.getElementsByTagName("input")[0].onclick = function(){
			_this._win2.setResizable(this.checked);
		};
	};
	this.test_table = function(){
		var sb = [];
		sb.push('<table class="wui-Table" border="0" cellspacing="0" cellpadding="0">');
		sb.push('<thead>');
		sb.push('<tr><th>id</th><th>name</th><th>value</th><th>col3</th><th>col4</th><th>col5</th><th>col6</th><th>col7</th><th>col8</th><th>col9</th><th>col10</th></tr>');
		sb.push('</thead>');
		sb.push('<tbody>');
		for(var i = 0, len = 100; i < len; i++){
			sb.push('<tr><td>' + i + '</td><td>name' + i + '</td><td>value' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td><td>' + i + '</td></tr>');
		}
		sb.push('</tbody>');
		sb.push('</table>');
		$("tbl1").innerHTML = sb.join("");
	};
});