_package("alz.mui");

_import("alz.mui.Pane");

/**
 * 对话框组件
 */
_class("Dialog", Pane, function(){
	var KEY_ESC = 27;
	var CURSORS = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
	this._init = function(){
		_super._init.call(this);
		this._conf = null;
		//对话框的双态特性，和PaneAppContent相似，主要用来屏蔽环境差异
		this._ownerApp = null;  //身在曹营
		this._app = null;       //心在汉
		this._params = null;
		this._skin = null;
		this._head = null;
		this._body = null;
		this._caption = "对话框标题";
		this._req = null;
		this._btnClose = null;
		this._borders = null;   //{Array}
	};
	this.create2 = function(conf, parent, app, params, ownerApp){
		this.setConf(conf);
		this.setParent2(parent);
		this.setApp(app);
		this.setParams(params);
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
		this._head = this._self.childNodes[1];
		//this._btnClose = this._dom.selectNodes(this._head, "*")[1];
		//this._body = this._self.childNodes[2];
		var _this = this;
		this._head.onmousedown = function(ev){
			return _this.onMouseDown(ev || _this._win.event);
		};
		this._head.onselectstart = function(ev){
			return false;
		};
		if(this._btnClose){
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
		//this._createBorders();
	};
	this.reset = function(params){
		this.setParams(params);
	};
	this.rendered = function(){
		_super.rendered.apply(this);
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._borders){
			for(var i = 0, len = this._borders.length; i < len; i++){
				this._borders[i] = null;
			}
		}
		if(this._btnClose){
			this._btnClose.onmousedown = null;
			this._btnClose.ondragstart = null;
			this._btnClose.onselectstart = null;
			this._btnClose = null;
		}
		this._req = null;
		this._body = null;
		this._head.onselectstart = null;
		this._head.onmousedown = null;
		this._head = null;
		this._params = null;
		this._app = null;
		this._ownerApp = null;
		this._conf = null;
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	this.setConf = function(v){
		this._conf = v;
	};
	this.setOwnerApp = function(v){
		this._ownerApp = v;
	};
	this.setApp = function(v){
		this._app = v;
	};
	this.setParams = function(v){
		this._params = v;
	};
	this.setReq = function(v){
		this._req = v;
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
			this._resizeBorder(w, h);
		}
	};
	this.close = function(){
		if(this._modal){
			this.showModal(false);
		}else{
			this.setVisible(false);
		}
	};
	this._createBorders = function(){
		this._borders = [];
		for(var i = 0, len = CURSORS.length; i < len; i++){
			var o = this._createElement2(this._self, "div", "", {
				"position": "absolute",
				"overflow": "hidden",
				"zIndex"  : 3,
				"cursor"  : CURSORS[i] + "-resize"
			});
			//if(i % 2 == 0) o.style.backgroundColor = "red";
			this._borders.push(o);
			o = null;
		}
	};
	this._resizeBorder = function(w, h){
		var bw4 = 4, bw8 = 8;
		this._setElementRect(this._borders[0], 0    , 0    , bw8    , bw8);
		this._setElementRect(this._borders[1], bw8  , 0    , w-2*bw8, bw4);
		this._setElementRect(this._borders[2], w-bw8, 0    , bw8    , bw8);

		this._setElementRect(this._borders[3], 0    , bw8  , bw4    , h-2*bw8);
		this._setElementRect(this._borders[4], w-bw4, bw8  , bw4    , h-2*bw8);

		this._setElementRect(this._borders[5], 0    , h-bw8, bw8    , bw8);
		this._setElementRect(this._borders[6], bw8  , h-bw4, w-2*bw8, bw4);
		this._setElementRect(this._borders[7], w-bw8, h-bw8, bw8    , bw8);
	};
	this._setElementRect = function(obj, x, y, w, h, bg){
		obj.style.left   = x + "px";
		obj.style.top    = y + "px";
		obj.style.width  = w + "px";
		obj.style.height = h + "px";
	};
	/**
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
		//this._head.onmousemove = function(ev){return _this.onMouseMove(ev || window.event);};
		//this._head.onmouseup   = function(ev){return _this.onMouseUp(ev || window.event);};
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
		workspace = null;
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
		workspace = null;
	};
	this.onMouseUp = function(ev){
		this._head.onmousemove = null;
		this._head.onmouseup = null;
		//if(runtime.ie) this._head.releaseCapture();
		this.setCapture(false);
	};
	this.setCaption = function(v){
		if(this._caption === v) return;
		this._caption = v;
		if(this._self){
			this._head.childNodes[0].innerHTML = runtime.encodeHTML(v);
		}
	};
	this.onKeyUp = function(ev){
		switch(ev.keyCode){
		case KEY_ESC:
			this.close();  //关闭对话框
			break;
		}
	};
	this.callback = function(){
		var args = [this];  //回调函数的第一个参数一定是对话框组件本身
		for(var i = 0, len = arguments.length; i < len; i++){
			args.push(arguments[i]);
		}
		if(this._req){
			this._req.func.apply(this._req.agent, args);
			this._req = null;  //只允许被调用一次
		}
	};
	this.do_dlg_ok = function(act, sender){
		this.callback(act, sender);
	};
	//点击取消
	this.do_dlg_cancel = function(act, sender){
		//this.setVisible(false);
		this.showModal(false);
		this.callback(act, sender);
	};
	this.setClientBgColor = function(color){
		this._body.style.backgroundColor = color;
	};
});