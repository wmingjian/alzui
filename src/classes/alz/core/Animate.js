_package("alz.core");

/**
 * 一个元素的一个动画效果代理
 */
_class("Animate", "", function(){
	this.props = ("backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth "
		+ "borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize "
		+ "fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight "
		+ "maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft "
		+ "paddingRight paddingTop right textIndent top width wordSpacing zIndex "
		+ "borderBottomLeftRadius borderTopRightRadius borderTopLeftRadius borderTopRightRadius").split(" ");
	var div = document.createElement("div");
	/*
	var divStyle = div.style;
	var transTag = divStyle.MozTransform === "" ? "Moz" :
			(divStyle.WebkitTransform === "" ? "Webki" :
			(divStyle.OTransform === "" ? "O" :
			false)),
	var matrixFilter = !transTag && divStyle.filter === "",
	*/
	this._init = function(engine, data){
		_super._init.call(this);
		this._engine = engine;  //动画引擎
		this._data = data;    //动画数据
		this._func = null;    //动画函数
		this._target = null;  //目标值
		this._current = {};   //当前值
		this._dur = 0;        //时长
		this._startTime = 0;
		this._start = 0;      //开始时间
		this._stop = 0;       //结束时间

		this._started = false;
		this._stopped = false;

		this._msec = 10;      //定时器步长
		this._timer = 0;      //定时器
	};
	this.init = function(){
		var comp = runtime._element.style(this._data.element);  //实际值
		this._target = this.normalize(this._data.style);
		this._func = this._engine.getEffectFunc(this._data.func);
		for(var k in this._target){
			this._current[k] = this.parse(comp[k]);
		}
		this._dur = this._data.speed || 200;
		this._startTime = new Date().getTime();
		this._start = this._data.start || 0;
		this._stop  = this._data.start + this._dur;
		//this.start();
	};
	this.dispose = function(){
		for(var k in this._current){
			delete this._current[k];
		}
		this._target = null;
		this._func = null;
		this._data = null;
		this._engine = null;
		_super.dispose.apply(this);
	};
	/*
	 * from:http://github.com/madrobby/emile/
	 */
	this.interpolate = function(source, target, pos){
		if(isNaN(source)){
			source = 0;
		}
		return (source + (target - source) * pos).toFixed(3);
	};
	/*
	 * 转换为rgb(255,255,255)格式
	 */
	this.color = function(source, target, pos){
		function s(str, p, c){
			if(typeof str != "string"){
				str = "" + str;
			}
			return str.substr(p, c || 1);
		}
		var i = 2, j, c, tmp, v = [], r = [];
		while(j = 3, c = arguments[i - 1], i--){
			if(s(c, 0) == "r"){
				c = c.match(/\d+/g);
				while(j--){
					v.push(~ ~c[j]);
				}
			}else{
				if(c.length == 4){
					c = "#" + s(c, 1) + s(c, 1) + s(c, 2) + s(c, 2) + s(c, 3) + s(c, 3);
				}
				while(j--){
					v.push(parseInt(s(c, 1 + j * 2, 2), 16));
				}
			}
		}
		while(j--){
			tmp = ~ ~(v[j + 3] + (v[j] - v[j + 3]) * pos);
			r.push(tmp < 0 ? 0 : tmp > 255 ? 255 : tmp);
		}
		return "rgb(" + r.join(",") + ")";
	};
	this.parse = function(prop){
		if(!prop){
			prop = "0";  //IE下取不到没有设定的样式
		}
		var p = parseFloat(prop);
		var q = prop.replace(/^[\-\d\.]+/, "");
		return isNaN(p)
			? {"a": this, "f": "color"      , "v": q, "u": ""}
			: {"a": this, "f": "interpolate", "v": p, "u": q };
	};
	/**
	 * 把json描述的样式应用到实际元素el上计算出实际的字符串表示的样式
	 * [TODO]这种属性值还不能正确解析(border-top-right-radius:0px 0px;)
	 * @param {HTMLElement} el
	 * @param {Object} style
	 */
	this._formatStyle = function(el, style){
		var comp = runtime._element.style(this._data.element);
		var sb = [];
		for(var k in style){
			var v = style[k];
			if(v.charAt(1) == "="){  //相对数值计算
				var a = parseInt(comp[k]);
				var b = parseInt(v.substr(2));
				v = (v.charAt(0) == "-" ? a - b : a + b) + "px";
			}
			sb.push(k + ":" + v);
		}
		return sb.join(";");
	};
	/**
	 * 样式名标准化
	 */
	this.normalize = function(style){
		if(typeof style == "object"){
			style = this._formatStyle(this._data.element, style);
		}
		var rules = {};
		div.innerHTML = '<div style="' + style + '"></div>';
		var style = div.childNodes[0].style;
		for(var i = 0, len = this.props.length; i < len; i++){
			var k = this.props[i];
			var v = style[k];
			if(v){
				rules[k] = this.parse(v);
			}
		}
		return rules;
	};
	/**
	 * 开始播放动画
	 */
	this.start = function(){
		var _this = this;
		this._timer = window.setInterval(function(){
			_this.step();
		}, this._msec);
	};
	/**
	 * 停止播放动画
	 */
	this.stop = function(){
		this.onStop();
		this._engine.deQueue(this._data.element, "fx");
	};
	/**
	 * 播放一帧动画
	 */
	this.step = function(){
		var t = new Date().getTime() - this._startTime;  //当前时间距开始时间的差
		this.onStep(t);
		if(t > this._stop){  //判断是否结束
			this.stop();
		}
	};
	this.onStart = function(){
		this._started = true;
		if(this._data["onstart"]){
			this._data["onstart"].apply(this._data.element);
		}
		//在onstart事件执行完毕之后才能正确获取元素的实际样式
		var comp = runtime._element.style(this._data.element);  //实际值
		this._target = this.normalize(this._data.style);
		this._func = this._engine.getEffectFunc(this._data.func);
		for(var k in this._target){
			this._current[k] = this.parse(comp[k]);
		}
	};
	this.onStop = function(){
		if(this._stopped) return;
		this._stopped = true;
		if(this._timer != 0){
			window.clearInterval(this._timer);
			this._timer = 0;
		}
		if(this._data["onstop"]){
			this._data["onstop"].apply(this._data.element);
		}
	};
	/**
	 * [TODO]通过对onStep的同步来达到复杂动画的内部协同
	 * @param {Date} t 当前时间
	 */
	this.onStep = function(t){
		if(this._data["onstep"]){
			this._data["onstep"].apply(this._data.element);
		}
		var x = t <= this._stop ? (t - this._start) / this._dur : 1;  //x坐标[0-1]
		//console.log("x=" + x);
		for(var k in this._target){
			var o = this._target[k];
			var n = o.a[o.f].call(o.a, this._current[k].v, o.v, this._func(x));
			/*
			this.arr.push({"t": t, "s": this._func(x)});
			if(k == "opacity"){
				console.log(
					"t=" + t
					+ ",x=" + x
					+ ",c.v=" + this._current[k].v
					+ ",o.v=" + o.v
					+ ",this._func(x)=" + this._func(x)
					+ ",n=" + n
				);
				console.log(k + "=" + (n + o.u));
			}
			*/
			runtime._element.css(this._data.element, k, n + o.u);  //调整一个style属性
		}
		return x;
	};
});