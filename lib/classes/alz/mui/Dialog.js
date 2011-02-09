_package("alz.mui");

_import("alz.mui.Component");

_class("Dialog", Component, function(){
	this._init = function(){
		_super._init.call(this);
		this._app = null;
		this._skin = null;
		this._head = null;
		this._btnClose = null;
		this._body = null;
		this._borders = null;
	};
	this.create = function(parent, caption){
		this._caption = caption;
		return _super.create.apply(this, arguments);
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
		//this._skin = this._createElement("div");
		this._self.className = "wui-Dialog2";
		//this._self.appendChild(this._skin);
		//this.setStyleProperty("border", "2px outset");  //runtime.ie ? "2px outset" : "2px solid #97A4B2"
		//this.setStyleProperty("backgroundColor", "buttonface");  //runtime.ie ? "buttonface" : "#B9C4D0"
		if(runtime.ff){
			this.setStyleProperty("MozBorderLeftColors", "ThreeDLightShadow ThreeDHighlight");
			this.setStyleProperty("MozBorderTopColors", "ThreeDLightShadow ThreeDHighlight");
			this.setStyleProperty("MozBorderRightColors", "ThreeDDarkShadow ThreeDShadow");
			this.setStyleProperty("MozBorderBottomColors", "ThreeDDarkShadow ThreeDShadow");
		}
		var str = "<div class=\"skin\"></div>"
			+ "<div class=\"head\" html=\"true\" aui=\"{align:'top',height:18;}\">"
			+ "<label class=\"caption\">{$caption}</label><div class=\"icon\"></div>"
			+ "</div>"
			+ "<div class=\"body\" aui=\"{align:'client'}\"></div>";
		str = str.replace(/\{\$caption\}/g, this._caption);
		str = str.replace(/\{\$pathAui\}/g, runtime.pathAui);
		this._self.innerHTML = str;
		this.bind(obj);
		//this.setOpacity(0.7);
	};
	this.bind = function(obj){
		_super.bind.apply(this, arguments);
		//this.fixedOffset();  //计算坐标修正的偏移量
		var nodes = this._dom.selectNodes(this._self, "*");
		this._skin = nodes[0];
		this._head = nodes[1];
		this._btnClose = this._dom.selectNodes(this._head, "*")[1];
		this._body = nodes[2];
		this._head._dlg = this;
		this._head.onmousedown = function(ev){return this._dlg.onMouseDown(ev || this._dlg._win.event);};
		this._head.onselectstart = function(ev){return false;};
		if(this._btnClose){
			this._btnClose.style.backgroundPosition = "-48px 0px";
			this._btnClose._dlg = this;
			this._btnClose.onselectstart = function(ev){return false;};
			this._btnClose.ondragstart = function(ev){return false;};
			this._btnClose.onmousedown = function(ev){
				ev = ev || this._dlg._win.event;
				//this.src = runtime.pathAui + "lib/images/AWindow_closedown.gif";
				this.style.backgroundPosition = "-48px -14px";
				if(runtime.ie) this.setCapture();
				this.onMouseMove = function(ev){
					ev = ev || this._dlg._win.event;
					var target = ev.srcElement || ev.target;
					if(target == this){
						//this.src = runtime.pathAui + "lib/images/AWindow_closedown.gif";
						this.style.backgroundPosition = "-48px -14px";
					}else{
						//this.src = runtime.pathAui + "lib/images/AWindow_closeup.gif";
						this.style.backgroundPosition = "-48px 0px";
					}
				};
				this.onMouseUp = function(ev){
					ev = ev || this._dlg._win.event;
					var target = ev.srcElement || ev.target;
					//this.src = runtime.pathAui + "lib/images/AWindow_closeup.gif";
					this.style.backgroundPosition = "-48px 0px";
					this.onMouseMove = null;
					this.onMouseUp = null;
					if(runtime.ie){
						this.releaseCapture();
					}
					if(target == this){
						this._dlg.close();  //关闭对话框
					}
				};
				ev.cancelBubble = true;
			};
		}
		this._createBorders();
	};
	this.dispose = function(){
		if(this._disposed) return;
		if(this._borders){
			for(var i = 0, len = this._borders.length; i < len; i++){
				this._borders[i] = null;
			}
		}
		this._body = null;
		this._btnClose.onmousedown = null;
		this._btnClose.ondragstart = null;
		this._btnClose.onselectstart = null;
		this._btnClose._dlg = null;
		this._btnClose = null;
		this._head.onselectstart = null;
		this._head.onmousedown = null;
		this._head._dlg = null;
		this._head = null;
		this._app = null;
		_super.dispose.apply(this);
	};
	this.setApp = function(v){
		this._app = v;
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
		var cursors = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
		for(var i = 0, len = cursors.length; i < len; i++){
			var o = this._createElement2(this._self, "div", "", {
				"position": "absolute",
				"overflow": "hidden",
				"zIndex"  : 3,
				"cursor"  : cursors[i] + "-resize"
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
		//this._head.onmousemove = function(ev){return this._dlg.onMouseMove(ev || this._dlg._win.event);};
		//this._head.onmouseup   = function(ev){return this._dlg.onMouseUp(ev || this._dlg._win.event);};
		this.setCapture(true);
		//var pos = this._dom.getPos(ev.srcElement, this._self);
		//window.document.title = pos.x + "+" + ev.offsetX + "=" + (pos.x + ev.offsetX) + "#" + ev.clientX
		//								+ "|" + pos.y + "+" + ev.offsetY + "=" + (pos.y + ev.offsetY) + "#" + ev.clientY;
		this._offsetX = ev.offsetX;  //ns 浏览器的问题
		this._offsetY = ev.offsetY;
		if(runtime._workspace._fixed != "fixed"){
			if(runtime._workspace._mousemoveForFixed){
				runtime._workspace._mousemoveForFixed(this, ev);
			}
			/* 直接使用默认值，可以省去自动修正过程，但是不能保证一定是通用的
			if(runtime.ie || runtime.safari){
				runtime._workspace._fixedX = 0;
				runtime._workspace._fixedY = 0;
				runtime._workspace._fixed = "fixed";
			}else if(runtime.opera){
				runtime._workspace._fixedX = 2;
				runtime._workspace._fixedY = 2;
				runtime._workspace._fixed = "fixed";
			}else{  //runtime.moz
				if(this._mousemoveForFixed) this._mousemoveForFixed(ev);
			}
			*/
		}
		//this.onMouseMove(ev);
	};
	this.onMouseMove = function(ev){
		var rect = runtime._workspace.getViewPort();
		var x = rect.x + Math.min(rect.w - this._paddingLeft, Math.max(0, ev.clientX - runtime._workspace._borderLeftWidth)) - runtime._workspace._fixedX - this._offsetX - this._paddingLeft;
		var y = rect.y + Math.min(rect.h - this._paddingTop, Math.max(0, ev.clientY - runtime._workspace._borderTopWidth)) - runtime._workspace._fixedY - this._offsetY - this._paddingTop;
		if(runtime.ie || runtime.safari || runtime.chrome || runtime.opera){
			x -= this._borderLeftWidth;
			y -= this._borderTopWidth;
		}else if(runtime.moz){
		}
		/*
		var str = "boxModel=" + runtime.getBoxModel()
			//+ "\nrect={x:" + rect.x + ",y:" + rect.y + ",w:" + rect.w + ",h:" + rect.h + "}"
			+ "\nfixedX=" + runtime._workspace._fixedX + ",_borderLeftWidth=" + this._borderLeftWidth
			+ "\nfixedY=" + runtime._workspace._fixedY + ",_borderTopWidth=" + this._borderTopWidth
			//+ "\nruntime._workspace._borderLeftWidth=" + runtime._workspace._borderLeftWidth
			//+ "\nruntime._workspace._borderTopWidth=" + runtime._workspace._borderTopWidth
			+ "\nthis._offsetX=" + this._offsetX
			+ "\nthis._offsetY=" + this._offsetY
			+ "\nev.clientX=" + ev.clientX + ",x=" + x + ","
			+ "\nev.clientY=" + ev.clientY + ",y=" + y + ",";
		this._body.childNodes[1].value = str;
		*/
		this.moveTo(x, y);
	};
	this.onMouseUp = function(ev){
		this._head.onmousemove = null;
		this._head.onmouseup = null;
		//if(runtime.ie) this._head.releaseCapture();
		this.setCapture(false);
	};
	this.setClientBgColor = function(color){
		this._body.style.backgroundColor = color;
	};
});