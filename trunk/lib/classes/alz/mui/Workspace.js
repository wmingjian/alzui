_package("alz.mui");

_import("alz.mui.Container");
_import("alz.mui.ModalPanel");

_class("Workspace", Container, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._fixedX = 0;
		this._fixedY = 0;
		this._fixedOff = null;
		this._fixed = null;
		this._testFixDiv = null;
		this._modalPanel = null;
		this._popup = null;
		this._captureComponent = null;
		this._tipMouse = null;
		this._activeDialog = null;
	};
	this.__init = function(obj, domBuildType){
		_super.__init.apply(this, arguments);
		this.onMouseMove = this._mousemoveForNormal;
		//this.onMouseMove = this._mousemoveForFixed;
		//this._self.ondragstart = function(ev){return false;};
		//this._self.onselectstart = function(ev){return false;};
		this._modalPanel = new ModalPanel();
		this._modalPanel.create(this);
		this._modalPanel.setVisible(false);
		/*
		var rect = this.getViewPort();
		//alert(rect.x + "," + rect.y + "," + rect.w + "," + rect.h);
		var div = this._createElement("div");
		div.style.position = "absolute";
		div.style.border = "10px";
		div.style.left = (rect.x - 10) + "px";
		div.style.top = (rect.y - 10) + "px";
		div.style.width = (rect.w + 20) + "px";
		div.style.height = (rect.h + 20) + "px";
		div.style.backgroundColor = "#DDDDDD";
		div.style.zIndex = "200";  // + runtime.getNextZIndex();
		var d = this._createElement("div");
		d.style.width = "100%";
		d.style.height = "100px";
		d.style.backgroundColor = "#AAAAAA";
		var _this = this;
		d.onmousedown = function(ev){return _this._mousemoveForFixed(ev || runtime.getWindow().event);};
		div.appendChild(d);
		this.onMouseDown = this._mousemoveForFixed;
		this._testFixDiv = this._self.appendChild(div);
		*/
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		//������󶨹��������п����õ����¼�
		//����
		/*
		runtime.bindEventListener(this._self, "resize", function(ev){
			alert();
		});
		*/
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activeDialog = null;
		this._tipMouse = null;
		this._captureComponent = null;
		this._popup = null;
		if(this._modalPanel){
			this._modalPanel.dispose();
			this._modalPanel = null;  //ģ̬�Ի����õ�ģ̬���
		}
		this._testFixDiv = null;
		//this._self.onselectstart = null;
		//this._self.ondragstart = null;
		_super.dispose.apply(this);
	};
	this.setStyleProperty = function(name, value){
		if(this._self.tagName == "BODY" && (name == "width" || name == "height")){
			return;  //���Զ� style ���� width,height ������
		}
		_super.setStyleProperty.apply(this, arguments);
	};
	this.resize = function(w, h){
		_super.resize.call(this, w, h);
		if(this._modalPanel && this._modalPanel.getVisible()){
			this._modalPanel.resize(w, h);  //����ģ̬���Ĵ�С
		}
	};
	this.getModalPanel = function(){
		return this._modalPanel;
	};
	this.setPopup = function(v, pos){
		try{
		if(v){
			if(this._popup){
				this._popup.setVisible(false);
				//this._popup.setZIndex(1);
				this._popup = null;
			}
			this._popup = v;
			this._popup.setZIndex(10);
			this._popup.setVisible(true);
			this._popup.moveTo(pos.x, pos.y);
		}else{  //��ԭ�ɰ�
			this._popup.setVisible(false);
			//this._popup.setZIndex(1);
			this._popup = null;
		}
		}catch(ex){
			this._win._alert(ex.description);
		}
	};
	this.setCaptureComponent = function(v){
		this._captureComponent = v;
	};
	this.setActiveDialog = function(v){
		this._activeDialog = v;
	};
	this.eventHandle = function(ev){
		var ret;
		var type = {
			"keydown"  : "KeyDown",
			"keypress" : "KeyPress",
			"keyup"    : "KeyUp",
			"mousedown": "MouseDown",
			"mousemove": "MouseMove",
			"mouseup"  : "MouseUp"
		};
		var evtype = "on" + type[ev.type];
		if(this._captureComponent && this._captureComponent[evtype]){
			this.onMouseMove(ev);
			return this._captureComponent[evtype](ev);
		}
		if(typeof this[evtype] == "function"){
			ret = this[evtype](ev);
		}
		return ret;
	};
	this.onKeyUp = function(ev){
		var ret;
		if(this._activeDialog && this._activeDialog.onKeyUp){
			ret = this._activeDialog.onKeyUp(ev);
		}
		return ret;
	};
	this.onMouseDown = function(ev){
		if(this._popup){
			switch(this._popup._className){
			case "Popup":
				if(this._popup.getVisible()){
					this.setPopup(null);
				}
				break;
			case "Dialog":
				break;
			}
		}
	};
	this.onMouseMove = null;
	this.onMouseUp = function(ev){
	};
	/**
	 * ƫ���������������� getPos ��������ȷ�ԣ�����������Ͳ���ȷ���������Ҳ������
	 * [TODO]�ڵ�һ��onMouseMove�¼���ִ������ƫ�����ļ���
	 */
	/*
	this._mousemoveForFixed = function(ev){
		var obj = runtime._testDiv;
		var pos = this._dom.getPos(obj, this._self);
		if(this._fixed == null){
			//alert((pos.x + ev.offsetX) + "," + (pos.y + ev.offsetY) + "|" + ev.clientX + "," + ev.clientY);
			this._offsetX = ev.offsetX;
			this._offsetY = ev.offsetY;
			this._fixedOff = {x: pos.x + ev.offsetX, y: pos.y + ev.offsetY};
			this._fixed = "fixing";
			//this.onMouseMove(ev);
			var rect = this.getViewPort();
			var x = rect.x + Math.min(rect.w - this._paddingLeft, Math.max(0, ev.clientX - this._borderLeftWidth)) - this._fixedX - this._offsetX - this._paddingLeft;
			var y = rect.y + Math.min(rect.h - this._paddingTop, Math.max(0, ev.clientY - this._borderTopWidth)) - this._fixedY - this._offsetY - this._paddingTop;
			obj.style.left = (-2000 + x) + "px";
			obj.style.top = (-2000 + y) + "px";
			this._mousemoveForFixed(ev);
		}else if(this._fixed == "fixing"){
			//this._fixedOff = {x: ev.clientX, y: ev.clientY};
			this._fixedX = pos.x + ev.offsetX - this._fixedOff.x;
			this._fixedY = pos.y + ev.offsetY - this._fixedOff.y;
			//alert("&&&&" + this._fixedX + "," + this._fixedY);
			this._fixed = "fixed";
			this.onMouseMove = this._mousemoveForNormal;  //ת�����������¼�
		}else{  //fixed
			ev.cancelBubble = true;
		}
		obj = null;
	};
	*/
	this._mousemoveForFixed = function(dlg, ev){
		var obj = ev.srcElement;
		var pos = dlg._dom.getPos(obj, this._self);
		if(this._fixed == null){
			//alert((pos.x + ev.offsetX) + "," + (pos.y + ev.offsetY) + "|" + ev.clientX + "," + ev.clientY);
			this._fixedOff = {
				pos_x: pos.x,
				pos_y: pos.y,
				o: ev.srcElement,
				ev_offsetX: ev.offsetX,
				ev_offsetY: ev.offsetY,
				x: pos.x + ev.offsetX,
				y: pos.y + ev.offsetY
			};
			this._fixed = "fixing";
			dlg.onMouseMove(ev);
		}else if(this._fixed == "fixing"){
			if(ev.srcElement != this._fixedOff.o || ev.offsetX != this._fixedOff.ev_offsetX || ev.offsetY != this._fixedOff.ev_offsetY){
				alert("[Workspace::_mousemoveForFixed]fixing unexpect");
			}
			this._fixedX = pos.x - this._fixedOff.pos_x;  //pos.x + ev.offsetX - (this._fixedOff.pos_x + this._fixedOff.ev_offsetX)
			this._fixedY = pos.y - this._fixedOff.pos_y;  //pos.y + ev.offsetY - (this._fixedOff.pos_y + this._fixedOff.ev_offsetY)
			//window.document.title = this._fixedX + "," + this._fixedY + "|" + dlg._borderLeftWidth + "," + dlg._borderTopWidth;
			this._fixed = "fixed";
			dlg.onMouseMove(ev);
			this._mousemoveForFixed = null;
		}
		obj = null;
	};
	this._mousemoveForNormal = function(ev){
		if(runtime._debug){  //�������״̬�Ļ������� MouseEvent ����Ϣ
			if(!this._tipMouse){
				this._tipMouse = this._createElement(!runtime.ns ? "div" : "textarea");  //NS ���������⣬���� textarea
				this._tipMouse.style.position = "absolute";
				this._tipMouse.style.border = "1px solid #AAAAAA";
				this._tipMouse.style.font = "12px ����";
				this._tipMouse.style.zIndex = "1000";
				//this._tipMouse.style.backgroundColor = "buttonface";
				//this._tipMouse.style.filter = "Alpha(Opacity=90)";
				if(runtime.ns){
					this._tipMouse.readOnly = true;
					this._tipMouse.style.width = "150px";
					this._tipMouse.style.height = "300px";
				}
				this._self.appendChild(this._tipMouse);
			}
			var o = {
				/*
				"type":1,
				"target":1,
				"reason":1,
				"cancelBubble":1,
				"returnValue":1,
				"srcFilter":1,
				"fromElement":1,
				"toElement":1,
				*/
				//mouse event
				"button":1,
				"screenX":1,
				"screenY":1,
				"clientX":1,
				"clientY":1,
				"offsetX":1,
				"offsetY":1,
				"x":1,
				"y":1/*,
				//key event
				"altKey":1,
				"ctrlKey":1,
				"shiftKey":1,
				"keyCode":1
				*/
			};
			//var a = this.forIn(ev);
			var a = [];
			for(var k in o) a.push(k + "=" + ev[k]);
			var off = {x:0,y:0};
			for(var el = ev.srcElement; el; el = el.offsetParent){
				off.x += el.offsetLeft + parseInt0(el.currentStyle.borderLeftWidth);
				off.y += el.offsetTop + parseInt0(el.currentStyle.borderTopWidth);
				a.push("off(x=" + el.offsetLeft + ",y=" + el.offsetTop + "),border(blw=" + parseInt0(el.currentStyle.borderLeftWidth) + ",btw=" + parseInt0(el.currentStyle.borderTopWidth) + ")");
			}
			a.push("OFF(x=" + off.x + ",y=" + off.y + "),OFF+offset(x=" + (off.x + ev.offsetX) + ",y=" + (off.y + ev.offsetY) + ")");
			this._tipMouse.style.left = (ev.clientX - this._borderLeftWidth + 4) + "px";
			this._tipMouse.style.top = (ev.clientY - this._borderTopWidth + 4) + "px";
			if(runtime.ns){
				this._tipMouse.value = a.join("\n");
			}else{
				this._tipMouse.innerHTML = a.join("<br />");
			}
		}
	};
});