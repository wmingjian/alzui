_package("alz.mui");

_import("alz.mui.Component");
_import("alz.mui.TextHistory");
_import("alz.mui.TextItem");

//<div id="d1" class="LineEdit">&gt;window.<span class="cursor">a</span>lert("aaaa");</div>
_class("LineEdit", Component, function(_super){
	var KEY_BACKSPACE = 8;
	var KEY_TAB       = 9;   //\t
	var KEY_ENTER     = 13;  //\n
	var KEY_SHIFT     = 16;
	var KEY_CTRL      = 17;
	var KEY_ALT       = 18;
	var KEY_CAPSLOCK  = 20;
	var KEY_ESC       = 27;
	var KEY_SPACE     = 32;  //" "
	var KEY_PAGE_UP   = 33;
	var KEY_PAGE_DOWN = 34;
	var KEY_END       = 35;
	var KEY_HOME      = 36;
	var KEY_LEFT      = 37;
	var KEY_UP        = 38;
	var KEY_RIGHT     = 39;
	var KEY_DOWN      = 40;
	var KEY_INS       = 45;
	var KEY_DEL       = 46;
	var KEY_CH_0      = 48;
	var KEY_CH_9      = 57;
	var KEY_SEMICOLON = 59;   //;
	var KEY_CH_A      = 65;
	var KEY_CH_Z      = 90;
	var KEY_F1        = 110;  //
	var KEY_F2        = 111;  //
	var KEY_F3        = 112;  //!!!系统搜索键
	var KEY_F4        = 113;  //!!!Drop 地址栏
	var KEY_F5        = 114;  //!!!刷新
	var KEY_F6        = 115;  //!!!输入焦点转入地址栏
	var KEY_F7        = 116;  //
	var KEY_F8        = 117;  //
	var KEY_F9        = 118;  //
	var KEY_F10       = 119;  //
	var KEY_F11       = 120;  //
	var KEY_F12       = 121;  //!!!输入焦点转入菜单
	var KEY_xxx       = 229;
	//var count = 0;
	this._number = "0123456789)!@#$%^&*(";
	this._letter = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	function trim(str){  //strip
		return str.replace(/^\s+|[\s\xA0]+$/g, "");
	}
	/*
	function getInputCursorIndex(){
		var s = document.selection.createRange();
		s.setEndPoint("StartToStart", this._input.createTextRange());
		alert('left:'+(s.text.length)+'\nright:'+(obj.value.length-s.text.length));
		var selection = document.selection;
		var rng = selection.createRange();
		this._input.select();
		rng.setEndPoint("StartToStart", selection.createRange());
		alert(rng.text);
		var pos = rng.text.length;
		rng.collapse(false);
		rng.select();
		return pos;
	}
	*/
	function getCursorIndex(){
		var selection = window.document.selection;
		var rng = selection.createRange();
		this._self.select();
		rng.setEndPoint("StartToStart", selection.createRange());
		this._pos = rng.text.length;
		window.document.title = this._pos;
		rng.collapse(false);  //移到后面
		rng.select();
		rng = null;
	}
	this._init = function(){
		_super._init.call(this);
		this._useInput = false;
		this._input = null;
		this._app = null;
		this._timer = 0;
		this._pos = 0;
		this._history = new TextHistory();  //历史记录管理
		this._cursorType = "gray";  //默认为gray
		this._items = [];
		this._activeItem = null;
		this._start = 0;
		this._end = 80;
		this._col = 4;
		this._iomode = "";  //in|out
	};
	this.create = function(parent, app){
		this._parent = parent;
		if(app) this._app = app;
		var obj = this._createElement("div");
		obj.className = "aui-LineEdit";
		if(parent){
			parent._self.appendChild(obj);
		}
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		var _this = this;
		if(this._useInput){
			this._input = this._createElement("input");
			this._input.type = "text";
			this._input.className = "input";
			this._input.maxLength = "78";
			//if(debug) this._input.style.backgroundColor = "#444444";
			this._input.onkeydown = function(ev){
				return _this.onKeyDown1(ev || window.event, this);
			};
			this._input.onkeyup = function(){
				//_this._timer = window.setTimeout(getCursorIndex, 200);
			};
			this._input.onkeypress = function(ev){
				return _this.onKeyPress(ev || window.event, this);
			};
			//this._input.onfocus = function(){};
			//this._input.onblur = function(){};
			this._input.ondblclick = function(){
				if(_this._timer != 0){
					window.clearTimeout(timer);
					_this._timer = 0;
				}
			};
			this._input.onclick = function(ev){
				ev = ev || window.event;
				//_this._timer = window.setTimeout(getCursorIndex, 200);
				ev.cancelBubble = true;
			};
		}else{
			/*
			if(runtime.moz){
				document.onkeydown = function(ev){
					return _this.onKeyDown(ev || window.event, _this._self);
				};
			}else{
				this._self.onkeydown = function(ev){
					return this._ptr.onKeyDown(ev || window.event, this);
				};
			}
			*/
		}
	};
	this.reinit = function(){
		this._activeItem = null;
		for(var i = 0, len = this._items.length; i < len; i++){
			this._items[i].dispose();
			this._items[i] = null;
		}
		this._items = [];
		this._col = 0;
		this.print(this._parent.getPrompt(), "sys");
		this.setIomode("in");
	};
	this.dispose = function(){
		this._activeItem = null;
		for(var i = 0, len = this._items.length; i < len; i++){
			this._items[i].dispose();
			this._items[i] = null;
		}
		this._items = [];
		this._app = null;
		if(this._useInput){
			this._input.onclick = null;
			this._input.ondblclick = null;
			//this._input.onblur = null;
			//this._input.onfocus = null;
			this._input.onkeypress = null;
			this._input.onkeyup = null;
			this._input.onkeydown = null;
			this._input = null;
		}else{
			this._self.onkeydown = null;
		}
		_super.dispose.apply(this);
	};
	this.setCursorType = function(v){
		this._cursorType = v;
	};
	this.getCursorType = function(){
		return this._cursorType;
	};
	this.getText = function(){
		var sb = [];
		for(var i = 0, len = this._items.length; i < len; i++){
			sb.push(this._items[i].getText());
		}
		return sb.join("");
	};
	this.appendItem = function(type, text){
		var item = new TextItem();
		item.create(this, type, text);
		this._items.push(item);
		this.activeItem(item);
		return item;
	};
	this.setIomode = function(v){
		var oldiomode = this._iomode;
		this._iomode = v;
		if(v == "in"){
			this.appendItem("in", "");
			this._start = this._col;
			this._parent._self.appendChild(this._self);
			this.setFocus();
		}else{  //out
			var item = this._activeItem;
			this.activeItem(null);
			if(oldiomode == "in"){
				item.update();
				var line = this._parent.insertBlankLine();
				this._activeItem = null;
				for(var i = 0, len = this._items.length; i < len; i++){
					var obj = this._items[i]._self;
					obj.parentNode.removeChild(obj);
					line.appendChild(obj);
					obj._ptr = null;
					this._items[i]._self = null;
					this._items[i].dispose();
					this._items[i] = null;
				}
				this._items = [];
			}
			this._parent._self.removeChild(this._self);
		}
		/*
		this._lineEdit.setParent(this._lastLine);
		var obj = this._lineEdit._self;
		if(!obj.parentNode){
			this._lastLine.appendChild(obj);
			this.resize();
		}
		obj = null;
		*/
	};
	this.setWidth = function(v){
		//this._input.style.width = Math.max(0, v) + "px";
	};
	this.getValue = function(){
		return this._input.value;
	};
	this.setValue = function(v){
		this._input.value = v;
	};
	this.getHistoryText = function(num){
		var text = this._history.getText(num);
		if(text){
			this._activeItem.setText(text);
			this._col = this._start + text.length;
		}
	};
	this.activeItem = function(item){
		if(this._activeItem == item) return;
		if(this._activeItem){
			this._activeItem.deactivate();
		}
		if(item){
			item.activate();
		}
		this._activeItem = item;
	};
	/*
	this.setText = function(v){
		var sb = [];
		for(var i = 0, len = this._items.length; i < len; i++){
			sb.push(this._items[i].getText());
		}
		if(v != sb.join("")) window.alert(123123);
		this._text = v;
	};
	this._formatLine = function(){
		var sb = [];
		for(var i = 0, len = this._items.length; i < len; i++){
			sb.push(this._items[i].toHTML());
		}
		return sb.join("");
	};
	this.updateLine = function(){
		this._self.innerHTML = this._formatLine();
		var sb = [];
		//sb.push("row=" + this._row);
		sb.push("col=" + this._col);
		sb.push("start=" + this._start);
		sb.push("curIndex=" + this._history._curIndex);
		sb.push("text=" + this.getText());
		window.status = sb.join(",");
	};
	*/
	this.setFocus = function(){
		if(this._useInput){
			if(!this._input.parentNode) return;
			var rng = this._input.createTextRange();
			rng.collapse(true);
			rng.moveStart('character', this._pos);
			rng.select();
			rng = null;
			var _this = this;
			window.setTimeout(function(){
				try{
					_this._input.focus();
				}catch(ex){
				}
			}, 0);
		}else{
			if(!this._self.parentNode){
				this._parent._self.appendChild(this._self);
			}
			if(this._iomode == "in"){
				//try{
				//	this._self.focus();  //(通过焦点的转换,)重新定位光标的位置
				//}catch(ex){
				//}
				this._activeItem.update();
				this._parent.scrollToBottom();
			}
		}
	};
	this.getFrontText = function(){
		var s = window.document.selection.createRange();
		s.setEndPoint("StartToStart", this._input.createTextRange());
		var text = s.text;
		s = null;
		return text;
	};
	this.addInputText = function(text, value){
		//var rng = this._input.createTextRange();
		//rng.moveEnd("character");
		var rng = window.document.selection.createRange();
		if(value && value.length > 0){
			rng.moveStart("character", -value.length);
		}
		rng.text = text;
		rng = null;
	};
	this.getNumber = function(n){
		return this._number.substr(n, 1);
	};
	this.getChar = function(n){
		return this._letter.substr(n, 1);
	};
	this.isEndLine = function(row){
		//return (row == this._rows.length - 1);
		return true;
	};
	/**
	 * 往行编辑器里面打印一段文本
	 * @param str {String} 要打印的文件内容
	 * @param type {String} 文本的类型
	 *             sys 系统信息
	 *             dbg 调试信息
	 *             in  标准输入
	 *             out 标准输出
	 *             err 错误输出
	 *             log 日志信息
	 */
	this.print = function(str, type){
		if(typeof str == "undefined") window.alert(str);
		if(this._useInput){
			this._input.value = str;
		}else{
			str = str.replace(/\r?\n/g, "\n");
			if(str.indexOf("\n") == -1){
				this.printText(str, type);
			}else{
				var arr = str.split("\n");
				for(var i = 0; i < arr.length; i++){
					if(i < arr.length - 1){
						this._parent.insertLine(arr[i], this._iomode == "in" ? this._self : null, type);
					}else{
						if(arr[i] != ""){
							this.printText(arr[i], type);
						}
					}
				}
				//this._lastLine = this.insertLine(arr[i]);
				//line.style.backgroundColor = getRandomColor();
				//line.innerHTML = runtime.encodeHTML(str);
				//this._self.insertBefore(line, _input.parentNode);
			}
		}
	};
	this.printText = function(str, type){
		this.appendItem(type, str);
		this._col += str.length;
		/*
		var span = this._createElement("span");
		span.className = type;
		span.appendChild(this._createTextNode(str));
		this._self.appendChild(span);
		span = null;
		*/
	};
	this.incCol = function(n){
		if(this._col + n <= 80){
			this._col += n;
			return true;
		}else{
			return false;
		}
	};
	//插入一段不含回车符的字符串
	this.insertText = function(str){
		if(this.incCol(str.length)){
			if(this._col == this.getText().length + str.length){
				this._activeItem.appendText(str);
			}else{
				this._activeItem.appendText(str);
			}
		}
	};
	//事件处理函数
	this.onKeyPress = function(ev, sender){
		var ch = String.fromCharCode(ev.keyCode);
		var v = sender.value;
		if(ch == "\r" && trim(v) != ""){
			var text = v + "\n";
			sender.value = "";
			this._input.parentNode.removeChild(this._input);
			this._history.append(text);
			this.print(text, "in");
			this._parent.getCallback()(text);
		}else if(ch == "."){  //自动完成功能
			if(this._app){
				var nameChain = this._app.getNameChain(this.getFrontText());
				this._app.showFunTip(nameChain);
				//var name = nameChain || "#global";
			}
		}else if(ch == "("){  //语法提示功能
			
		}/*else if(ch == "\t"){
			window.alert(111);
		}*/
	};
	//使用input元素的实现
	this.onKeyDown1 = function(ev, sender){
		var redraw = true;
		var kc = ev.keyCode;
		if(this._app){
			var tip = this._app.getTip();
			if(tip && tip.getVisible()){
				return tip.onKeyDown(ev, sender);
			}
		}
		switch(kc){
		case KEY_TAB:
			this.addInputText("  ");  //'\t'
			ev.cancelBubble = true;
			return false;
		case KEY_ESC:
			this.setValue("");
			ev.cancelBubble = true;
			return false;
		case KEY_LEFT:
			break;
		case KEY_UP:
			if(this._curIndex >= 0){
				if(this._curIndex == this._historys.length){
					this.setValue(this._historys[--this._curIndex]);
				}else if(this._curIndex >= this._historys.length - 1){
					this.setValue(this._historys[--this._curIndex]);
				}else{
					this.setValue(this._historys[this._curIndex--]);
				}
			}
			break;
		case KEY_RIGHT:
			break;
		case KEY_DOWN:
			if(this._curIndex < this._historys.length - 1){
				while(this._curIndex <= -1){
					this._curIndex++;
				}
				this.setValue(this._historys[++this._curIndex]);
			}
			break;
		}
		return true;
	};
	//不使用input元素的实现
	this.onKeyDown = function(ev, sender){
		//var redraw = true;
		var ret;
		var kc = ev.keyCode;
		if(this._app){
			var tip = this._app.getTip();
			if(tip && tip.getVisible()){
				return tip.onKeyDown(ev, sender);
			}
		}
		if(kc >= KEY_CH_0 && kc <= KEY_CH_9){  //如果是数字(或相应特殊字符)
			this.insertText(this.getNumber(kc - KEY_CH_0 + (ev.shiftKey ? 10 : 0)));
		}else if(kc >= KEY_CH_A && kc <= KEY_CH_Z){  //如果是字母
			this.insertText(this.getChar(kc - KEY_CH_A + (ev.shiftKey ? 26 : 0)));
		}else if(kc == 61){
			this.insertText(ev.shiftKey ? "+" : "=");
		}else if(kc == 109){
			this.insertText(ev.shiftKey ? "_" : "-");
		}else if(kc == KEY_SEMICOLON){
			this.insertText(ev.shiftKey ? ":" : ";");
		}else if(kc >= 186 && kc <= 192){
			this.insertText((ev.shiftKey ? ":+<_>?~" : ";=,-./`").substr(kc - 186, 1));
		}else if(kc >= 219 && kc <= 222){
			this.insertText((ev.shiftKey ? "{|}\"" : "[\\]'").substr(kc - 219, 1));
		}else if(kc == KEY_TAB){
			this.insertText("\t");
		}else if(kc == KEY_SPACE){
			this.insertText(" ");
		}else{
			//redraw = this.do_control(ev);
			ret = this.do_control(ev);
		}
		if(this._col < 0){
			window.alert("Error");
		}
		//count++;
		//window.status = "Ln " + this._row + "   Col " + this._col + "|" + count;
		//if(redraw){
		//	this.drawViewPort();
		//}
		return ret || false;
	};
	this.do_control = function(ev){
		var kc = ev.keyCode;
		switch(kc){
		case KEY_ESC:
			if(this._activeItem.getText() == ""){
				
			}else{
				this._activeItem.setText("");
				this._col = this._start;
			}
			break;
		case KEY_ENTER:  //确定输入，而无论光标在哪里
			if(this._col > this._start){
				var text = this.getText().substr(this._start);
				this._history.append(text);
				this.setIomode("out");
				//this.print("\n", "in");
				//this._parent.insertLine(this.getText().substr(0, this._start) + text);
				this._parent.getCallback()(text + "\n");
				//this._parent.insertLine(text);
				//this.reinit();
				/*
				var row = this._rows[this._row];
				var str = row._text.substr(this._col);  //保存行尾被截断的字符串
				row.setText(row._text.substring(0, this._col) + "\n");  //在此断行
				this._row++;  //指向下一行
				this.insertRow(this._row, str);  //插入一空行并赋值为上行截尾字符串
				this._col = 0;  //列定位于新行开始处
				*/
			}
			break;
		case KEY_BACKSPACE:
			if(this._col > this._start){  //如果没有在开始处
				this._activeItem.removeChar(-1);
				this._col--;
			}
			ev.cancelBubble = true;
			return false;  //阻止页面后退
		case KEY_DEL:
			if(this._col < this.getText().length){  //如果没有在行末
				this._activeItem.removeChar();
			}
			break;
		case KEY_HOME:
			this._activeItem.setCursor(0);
			this._col = this._start;
			return false;
		case KEY_END:
			this._activeItem.setCursor(this._activeItem.getTextLength());
			this._col = this.getText().length;
			return false;
		case KEY_LEFT:
			if(this._col > this._start){
				this._activeItem.setCursor(this._activeItem.getCursor() - 1);
				this._col--;
			}
			return false;
		case KEY_RIGHT:
			//if(this.isEndLine(this._row)){  //如果是最后一行的话
				if(this._col < this.getText().length){  //this._rows[this._row].getLength()
					this._activeItem.setCursor(this._activeItem.getCursor() + 1);
					this.incCol(1);
				}else{
					return;  //已在编辑文本的最末端
				}
			/*
			}else{
				if(this._col < this.getText().length - 1){  //this._rows[this._row].getLength() - 1
					this.incCol(1);
				}else{  //光标移到下一行开始
					this._col = 0;
					this._row++;
				}
			}
			*/
			return false;
		case KEY_UP:
			/*
			if(this._row > 0){
				var len = this._rows[this._row - 1].getLength();
				if(this._col > len - 1){  //如果大于上一行的长度
					this._col = len - 1;
				}
				this._row--;
				this.updateLine();
			}
			return false;
			*/
			this.getHistoryText(-1);
			break;
		case KEY_DOWN:
			/*
			if(!this.isEndLine(this._row)){  //如果不是最后一行
				var len = this._rows[this._row + 1].getLength();
				if(this.isEndLine(this._row + 1)){  //如果下一行是最后一行
					if(this._col > len - 1){
						this._col = len;
					}
				}else{
					if(this._col > len - 1){
						this._col = len - 1; //如果大于下一行的长度
					}
				}
				this._row++;
				this.updateLine();
			}
			return false;
			*/
			this.getHistoryText(1);
			break;
		case KEY_SHIFT:
			this._selecting = true;
			this._row0 = this._row;
			this._col0 = this._col;
			return false;
		case KEY_CTRL:
			return false;
		case KEY_ALT:
			return false;
		case KEY_F1:
		case KEY_F2:
		case KEY_F3:  //!!!系统搜索键
		case KEY_F4:  //!!!Drop 地址栏
		case KEY_F5:  //!!!刷新
		case KEY_F6:  //!!!输入焦点转入地址栏
		case KEY_F7:
		case KEY_F8:
		case KEY_F9:
		case KEY_F10:
		case KEY_F11:
		case KEY_F12:  //!!!输入焦点转入菜单
			return;
		default:
			window.alert(kc);
			break;
		}
		return true;
	};
	this.onKeyUp = function(ev, sender){
	};
});