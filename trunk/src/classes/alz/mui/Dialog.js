_package("alz.mui");

_import("alz.mui.BaseWindow");

/**
 * 对话框组件
 */
_class("Dialog", BaseWindow, function(){
	var KEY_ESC = 27;
	this._init = function(){
		_super._init.call(this);
		//对话框的双态特性，和PaneAppContent相似，主要用来屏蔽环境差异
		this._ownerApp = null;  //身在曹营
		//this._app = null;     //心在汉
		this._skin = null;
		this._caption = "对话框标题";
	};
	this.create2 = function(conf, parent, app, params, ownerApp){
		_super.create2.apply(this, arguments);
		this.setOwnerApp(ownerApp);
	};
	this.create = function(parent, app, params, tpl){
		this.setParent2(parent);
		//this.setOwnerApp(ownerApp);
		this.setApp(app);
		var obj = this.createTplElement(parent, tpl);  //"dialog2.xml"
		/*
		tpl = runtime.formatTpl(tpl, {
			"caption": params.caption,
			"pathAui": runtime._pathAui
		});
		*/
		if(this._conf.bg){
			obj.style.backgroundImage = "url(res/images/dlg/" + this._conf.bg + ")";
		}
		this.init(obj);
		return obj;
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		//this._skin = this._createElement("div");
		//this._self.appendChild(this._skin);
		//this.fixedOffset();  //计算坐标修正的偏移量
		this.initActionElements();
		//this._skin = this._self.childNodes[0];
		if(this._btnClose){
			var _this = this;
			this._btnClose.style.backgroundPosition = "-48px 0px";
			this._btnClose.onselectstart = function(ev){return false;};
			this._btnClose.ondragstart = function(ev){return false;};
			this._btnClose.onmousedown = function(ev){
				ev = ev || window.event;
				//this.src = runtime._pathAui + "lib/images/AWindow_closedown.gif";
				this.style.backgroundPosition = "-48px -14px";
				if(runtime.ie) this.setCapture();
				this.onMouseMove = function(ev){
					ev = ev || window.event;
					var target = ev.srcElement || ev.target;
					if(target == this){
						//this.src = runtime._pathAui + "lib/images/AWindow_closedown.gif";
						this.style.backgroundPosition = "-48px -14px";
					}else{
						//this.src = runtime._pathAui + "lib/images/AWindow_closeup.gif";
						this.style.backgroundPosition = "-48px 0px";
					}
				};
				this.onMouseUp = function(ev){
					ev = ev || window.event;
					var target = ev.srcElement || ev.target;
					//this.src = runtime._pathAui + "lib/images/AWindow_closeup.gif";
					this.style.backgroundPosition = "-48px 0px";
					this.onMouseMove = null;
					this.onMouseUp = null;
					if(runtime.ie){
						this.releaseCapture();
					}
					if(target == this){
						_this.close();  //关闭对话框
					}
				};
				ev.cancelBubble = true;
			};
		}
		//this.createBorders();
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._btnClose){
			this._btnClose.onmousedown = null;
			this._btnClose.ondragstart = null;
			this._btnClose.onselectstart = null;
			this._btnClose = null;
		}
		this._ownerApp = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setOwnerApp = function(v){
		this._ownerApp = v;
	};
	this.showModal = function(v){
		_super.showModal.apply(this, arguments);
		this.moveToCenter();
		runtime._workspace.setActiveDialog(v ? this : null);
	};
	this.show = function(){
		this.setVisible(true);
	};
	this.resize = function(w, h){
		//_super.resize.apply(this, arguments);
		this._dom.resizeElement(this._self, w, h);
		var ww = this.getInnerWidth();
		var hh = this.getInnerHeight();
		//this._dom.resize(this._self);
		this._dom.setWidth(this._head, w - 8);
		this._dom.setWidth(this._body, w - 8);
		this._dom.setHeight(this._body, hh - 4 - 19);
		this._dom.resizeElement(this._skin, w, h);
		if(/*this._resizable && */this._borders){
			this.resizeBorder(w, h);
		}
	};
	this.close = function(){
		if(this._modal){
			this.showModal(false);
		}else{
			this.setVisible(false);
		}
	};
	/*
	 * [TODO]TT差出来的这两像素可能是由于 BODY 的默认边框宽度计算不准确导致的
	 */
	/*
	this.fixedOffset = function(){
		//window.alert(runtime.getBoxModel() + "|" + runtime.ie + "|" + runtime.tt + "|" + this._borderLeftWidth);
		if(runtime.getBoxModel() == 0){
			if(runtime.ie){
				this._fixedX = this._borderLeftWidth - (runtime.tt ? 2 : 0);
				this._fixedY = this._borderTopWidth - (runtime.tt ? 2 : 0);
			}else if(runtime.moz){
				this._fixedX = -5;
				this._fixedY = -5;
			}else if(runtime.opera){
				this._fixedX = -5;
				this._fixedY = -5;
			}else{  //safari [TODO]
				this._fixedX = -5;
				this._fixedY = -5;
			}
		}else{
			if(runtime.ie){
				this._fixedX = this._borderLeftWidth - (runtime.tt ? 2 : 0);
				this._fixedY = this._borderTopWidth - (runtime.tt ? 2 : 0);
			}else if(runtime.moz){
				this._fixedX = this._paddingLeft - (runtime.ff ? 5 : 4);
				this._fixedY = this._paddingTop - (runtime.ff ? 5 : 4);
			}else if(runtime.opera){
				this._fixedX = this._paddingLeft + 2;
				this._fixedY = this._paddingTop + 2;
			}else{  //safari
				this._fixedX = this._paddingLeft;
				this._fixedY = this._paddingTop;
			}
		}
	};
	*/
	this.onMouseDown = function(ev){
		//if(runtime.ie) this._head.setCapture();
		//var _this = this;
		//this.addListener(this._head, "mousemove", this, "onMouseMove");
		//this.addListener(this._head, "mouseup", this, "onMouseUp");
		this.setCapture(true);
		//var pos = this._dom.getPos(ev.srcElement, this._self);
		//window.document.title = pos.x + "+" + ev.offsetX + "=" + (pos.x + ev.offsetX) + "#" + ev.clientX
		//								+ "|" + pos.y + "+" + ev.offsetY + "=" + (pos.y + ev.offsetY) + "#" + ev.clientY;
		this._offsetX = ev.offsetX;  //ns 浏览器的问题
		this._offsetY = ev.offsetY;
		var workspace = runtime._workspace;
		if(workspace._fixed != "fixed"){
			if(workspace._mousemoveForFixed){
				workspace._mousemoveForFixed(this, ev);
			}
			/* 直接使用默认值，可以省去自动修正过程，但是不能保证一定是通用的
			if(runtime.ie || runtime.safari){
				workspace._fixedX = 0;
				workspace._fixedY = 0;
				workspace._fixed = "fixed";
			}else if(runtime.opera){
				workspace._fixedX = 2;
				workspace._fixedY = 2;
				workspace._fixed = "fixed";
			}else{  //runtime.moz
				if(this._mousemoveForFixed) this._mousemoveForFixed(ev);
			}
			*/
		}
	};
	this.onMouseMove = function(ev){
		var workspace = runtime._workspace;
		var rect = workspace.getViewPort();
		var x = rect.x + Math.min(rect.w - this._paddingLeft, Math.max(0, ev.clientX - workspace._borderLeftWidth)) - workspace._fixedX - this._offsetX - this._paddingLeft;
		var y = rect.y + Math.min(rect.h - this._paddingTop, Math.max(0, ev.clientY - workspace._borderTopWidth)) - workspace._fixedY - this._offsetY - this._paddingTop;
		if(runtime.ie || runtime.safari || runtime.chrome || runtime.opera){
			x -= this._borderLeftWidth;
			y -= this._borderTopWidth;
		}else if(runtime.moz){
		}
		/*
		var str = "boxModel=" + runtime.getBoxModel()
			//+ "\nrect={x:" + rect.x + ",y:" + rect.y + ",w:" + rect.w + ",h:" + rect.h + "}"
			+ "\nfixedX=" + workspace._fixedX + ",_borderLeftWidth=" + this._borderLeftWidth
			+ "\nfixedY=" + workspace._fixedY + ",_borderTopWidth=" + this._borderTopWidth
			//+ "\nworkspace._borderLeftWidth=" + workspace._borderLeftWidth
			//+ "\nworkspace._borderTopWidth=" + workspace._borderTopWidth
			+ "\nthis._offsetX=" + this._offsetX
			+ "\nthis._offsetY=" + this._offsetY
			+ "\nev.clientX=" + ev.clientX + ",x=" + x + ","
			+ "\nev.clientY=" + ev.clientY + ",y=" + y + ",";
		this._body.childNodes[1].value = str;
		*/
		this.moveTo(x, y);
	};
	this.onMouseUp = function(ev){
		//this.removeListener(this._head, "mousemove");
		//this.removeListener(this._head, "mouseup");
		//if(runtime.ie) this._head.releaseCapture();
		this.setCapture(false);
	};
	this.setCaption = function(v){
		if(this._caption === v) return;
		this._caption = v;
		if(this._self){
			this._title.innerHTML = runtime.encodeHTML(v);
		}
	};
	this.onKeyUp = function(ev){
		switch(ev.keyCode){
		case KEY_ESC:
			this.close();  //关闭对话框
			break;
		}
	};
	this.setClientBgColor = function(color){
		this._body.style.backgroundColor = color;
	};
	this.do_dlg_ok = function(act, sender){
		this.callback(act, sender);
	};
	//点击取消
	this.do_dlg_cancel = function(act, sender){
		this.showModal(false);
		this.callback(act, sender);
	};
});