_package("alz.core");

_import("alz.core.Plugin");
_import("alz.core.AnimateData");

/**
 * 由陈超群同学提供，参考部分jQuery，madrobby/emile源码，整合Easing效果库
 *
 * 动画引擎 animate 动画效果模块(插件)
 * 动画组件，使元素可以产生动画效果
 *
 * TO:CSS3支持,rotate旋转支持,目前还没有实现如jquery的队列机制,同时执行好几个动画会有问题
 */
_class("AnimationEngine", Plugin, function(){
	this._init = function(){
		_super._init.call(this);
		this._ad = null;  //{AnimateData}
	};
	this.create = function(name, app){
		_super.create.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._ad){
			this._ad.dispose();
			this._ad = null;
		}
		_super.dispose.apply(this);
	};
	this._easing = (function(){
		var PI = Math.PI;
		var abs = Math.abs;
		var pow = Math.pow;
		var sin = Math.sin;
		var cos = Math.cos;
		var sqrt = Math.sqrt;
		var asin = Math.asin;
		var BACK_CONST = 1.70158;
		var Easing = {
			/**
			 * Uniform speed between points.
			 */
			easeNone: function(t){
				//return t;
				return (-cos(t * PI) / 2) + 0.5;
			},
			/**
			 * Begins slowly and accelerates towards end. (quadratic)
			 */
			easeIn: function(t){
				return t * t;
			},
			/**
			 * Begins quickly and decelerates towards end.  (quadratic)
			 */
			easeOut: function(t){
				return (2 - t) * t;
			},
			/**
			 * Begins slowly and decelerates towards end. (quadratic)
			 */
			easeBoth: function(t){
				return (t *= 2) < 1 ?
					.5 * t * t :
					.5 * (1 - (--t) * (t - 2));
			},
			/**
			 * Begins slowly and accelerates towards end. (quartic)
			 */
			easeInStrong: function(t){
				return t * t * t * t;
			},
			/**
			 * Begins quickly and decelerates towards end.  (quartic)
			 */
			easeOutStrong: function(t){
				return 1 - (--t) * t * t * t;
			},
			/**
			 * Begins slowly and decelerates towards end. (quartic)
			 */
			easeBothStrong: function(t){
				return (t *= 2) < 1 ?
					.5 * t * t * t * t :
					.5 * (2 - (t -= 2) * t * t * t);
			},
			/**
			 * Snap in elastic effect.
			 */
			elasticIn: function(t){
				var p = .3, s = p / 4;
				if(t === 0 || t === 1) return t;
				return -(pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
			},
			/**
			 * Snap out elastic effect.
			 */
			elasticOut: function(t){
				var p = .3, s = p / 4;
				if(t === 0 || t === 1) return t;
				return pow(2, -10 * t) * sin((t - s) * (2 * PI) / p) + 1;
			},
			/**
			 * Snap both elastic effect.
			 */
			elasticBoth: function(t){
				var p = .45, s = p / 4;
				if(t === 0 || (t *= 2) === 2) return t;
				if(t < 1){
					return -.5 * (pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
				}
				return pow(2, -10 * (t -= 1)) * sin((t - s) * (2 * PI) / p) * .5 + 1;
			},
			/**
			 * Backtracks slightly, then reverses direction and moves to end.
			 */
			backIn: function(t){
				if(t === 1) t -= .001;
				return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
			},
			/**
			 * Overshoots end, then reverses and comes back to end.
			 */
			backOut: function(t){
				return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
			},
			/**
			* Backtracks slightly, then reverses direction, overshoots end,
			* then reverses and comes back to end.
			*/
			backBoth: function(t){
				if((t *= 2) < 1){
					return .5 * (t * t * (((BACK_CONST *= (1.525)) + 1) * t - BACK_CONST));
				}
				return .5 * ((t -= 2) * t * (((BACK_CONST *= (1.525)) + 1) * t + BACK_CONST) + 2);
			},
			/**
			 * Bounce off of start.
			 */
			bounceIn: function(t){
				return 1 - Easing.bounceOut(1 - t);
			},
			/**
			* Bounces off end.
			*/
			bounceOut: function(t){
				var s = 7.5625, r;
				if(t < (1 / 2.75)){
					r = s * t * t;
				}else if(t < (2 / 2.75)){
					r = s * (t -= (1.5 / 2.75)) * t + .75;
				}else if(t < (2.5 / 2.75)){
					r = s * (t -= (2.25 / 2.75)) * t + .9375;
				}else{
					r = s * (t -= (2.625 / 2.75)) * t + .984375;
				}
				return r;
			},
			/**
			 * Bounces off start and end.
			 */
			bounceBoth: function(t){
				if(t < .5){
					return Easing.bounceIn(t * 2) * .5;
				}
				return Easing.bounceOut(t * 2 - 1) * .5 + .5;
			}
			/*
			// simple linear tweening - no easing
			// t: current time, b: beginning value, c: change in value, d: duration
			linearTween, function(t, b, c, d){
				return c*t/d + b;
			},
			///////////// QUADRATIC EASING: t^2 ///////////////////
			// quadratic easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in value, d: duration
			// t and d can be in frames or seconds/milliseconds
			easeInQuad: function(t, b, c, d){
				return c*(t/=d)*t + b;
			},
			// quadratic easing out - decelerating to zero velocity
			easeOutQuad: function(t, b, c, d){
				return -c *(t/=d)*(t-2) + b;
			},
			// quadratic easing in/out - acceleration until halfway, then deceleration
			easeInOutQuad: function(t, b, c, d){
				if((t/=d/2) < 1) return c/2*t*t + b;
				return -c/2 * ((--t)*(t-2) - 1) + b;
			},
			///////////// CUBIC EASING: t^3 ///////////////////////
			// cubic easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in value, d: duration
			// t and d can be frames or seconds/milliseconds
			easeInCubic: function(t, b, c, d){
				return c*(t/=d)*t*t + b;
			},
			// cubic easing out - decelerating to zero velocity
			easeOutCubic: function(t, b, c, d){
				return c*((t=t/d-1)*t*t + 1) + b;
			},
			// cubic easing in/out - acceleration until halfway, then deceleration
			easeInOutCubic: function(t, b, c, d){
				if((t/=d/2) < 1) return c/2*t*t*t + b;
				return c/2*((t-=2)*t*t + 2) + b;
			},
			///////////// QUARTIC EASING: t^4 /////////////////////
			// quartic easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in value, d: duration
			// t and d can be frames or seconds/milliseconds
			easeInQuart: function(t, b, c, d){
				return c*(t/=d)*t*t*t + b;
			},
			// quartic easing out - decelerating to zero velocity
			easeOutQuart: function(t, b, c, d){
				return -c * ((t=t/d-1)*t*t*t - 1) + b;
			},
			// quartic easing in/out - acceleration until halfway, then deceleration
			easeInOutQuart: function(t, b, c, d){
				if((t/=d/2) < 1) return c/2*t*t*t*t + b;
				return -c/2 * ((t-=2)*t*t*t - 2) + b;
			},
			///////////// QUINTIC EASING: t^5  ////////////////////
			// quintic easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in value, d: duration
			// t and d can be frames or seconds/milliseconds
			easeInQuint: function(t, b, c, d){
				return c*(t/=d)*t*t*t*t + b;
			},
			// quintic easing out - decelerating to zero velocity
			easeOutQuint: function(t, b, c, d){
				return c*((t=t/d-1)*t*t*t*t + 1) + b;
			},
			// quintic easing in/out - acceleration until halfway, then deceleration
			easeInOutQuint: function(t, b, c, d){
				if((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
				return c/2*((t-=2)*t*t*t*t + 2) + b;
			},
			///////////// SINUSOIDAL EASING: sin(t) ///////////////
			// sinusoidal easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in position, d: duration
			easeInSine: function(t, b, c, d){
				return -c * cos(t/d * (PI/2)) + c + b;
			},
			// sinusoidal easing out - decelerating to zero velocity
			easeOutSine: function(t, b, c, d){
				return c * sin(t/d * (PI/2)) + b;
			},
			// sinusoidal easing in/out - accelerating until halfway, then decelerating
			easeInOutSine: function(t, b, c, d){
				return -c/2 * (cos(PI*t/d) - 1) + b;
			},
			///////////// EXPONENTIAL EASING: 2^t /////////////////
			// exponential easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in position, d: duration
			easeInExpo: function(t, b, c, d){
				return (t==0) ? b : c * pow(2, 10 * (t/d - 1)) + b;
			},
			// exponential easing out - decelerating to zero velocity
			easeOutExpo: function(t, b, c, d){
				return (t==d) ? b+c : c * (-pow(2, -10 * t/d) + 1) + b;
			},
			// exponential easing in/out - accelerating until halfway, then decelerating
			easeInOutExpo: function(t, b, c, d){
				if(t==0) return b;
				if(t==d) return b+c;
				if((t/=d/2) < 1) return c/2 * pow(2, 10 * (t - 1)) + b;
				return c/2 * (-pow(2, -10 * --t) + 2) + b;
			},
			/////////// CIRCULAR EASING: sqrt(1-t^2) //////////////
			// circular easing in - accelerating from zero velocity
			// t: current time, b: beginning value, c: change in position, d: duration
			easeInCirc: function(t, b, c, d){
				return -c * (sqrt(1 - (t/=d)*t) - 1) + b;
			},
			// circular easing out - decelerating to zero velocity
			easeOutCirc: function(t, b, c, d){
				return c * sqrt(1 - (t=t/d-1)*t) + b;
			},
			// circular easing in/out - acceleration until halfway, then deceleration
			easeInOutCirc: function(t, b, c, d){
				if((t/=d/2) < 1) return -c/2 * (sqrt(1 - t*t) - 1) + b;
				return c/2 * (sqrt(1 - (t-=2)*t) + 1) + b;
			},
			/////////// ELASTIC EASING: exponentially decaying sine wave  //////////////
			// t: current time, b: beginning value, c: change in value, d: duration, a: amplitude (optional), p: period (optional)
			// t and d can be in frames or seconds/milliseconds
			easeInElastic: function(t, b, c, d, a, p){
				if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
				if(a < abs(c)){ a=c; var s=p/4; }
				else var s = p/(2*PI) * asin(c/a);
				return -(a*pow(2,10*(t-=1)) * sin( (t*d-s)*(2*PI)/p )) + b;
			},
			easeOutElastic: function(t, b, c, d, a, p){
				if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
				if(a < abs(c)){ a=c; var s=p/4; }
				else var s = p/(2*PI) * asin(c/a);
				return a*pow(2,-10*t) * sin( (t*d-s)*(2*PI)/p ) + c + b;
			},
			easeInOutElastic: function(t, b, c, d, a, p){
				if(t==0) return b;  if((t/=d/2)==2) return b+c;  if(!p) p=d*(.3*1.5);
				if(a < abs(c)){ a=c; var s=p/4; }
				else var s = p/(2*PI) * asin(c/a);
				if(t < 1) return -.5*(a*pow(2,10*(t-=1)) * sin( (t*d-s)*(2*PI)/p )) + b;
				return a*pow(2,-10*(t-=1)) * sin( (t*d-s)*(2*PI)/p )*.5 + c + b;
			},
			/////////// BACK EASING: overshooting cubic easing: (s+1)*t^3 - s*t^2  //////////////
			// back easing in - backtracking slightly, then reversing direction and moving to target
			// t: current time, b: beginning value, c: change in value, d: duration, s: overshoot amount (optional)
			// t and d can be in frames or seconds/milliseconds
			// s controls the amount of overshoot: higher s means greater overshoot
			// s has a default value of 1.70158, which produces an overshoot of 10 percent
			// s==0 produces cubic easing with no overshoot
			easeInBack: function(t, b, c, d, s){
				if(s == undefined) s = 1.70158;
				return c*(t/=d)*t*((s+1)*t - s) + b;
			},
			// back easing out - moving towards target, overshooting it slightly, then reversing and coming back to target
			easeOutBack: function(t, b, c, d, s){
				if(s == undefined) s = 1.70158;
				return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
			},
			// back easing in/out - backtracking slightly, then reversing direction and moving to target,
			// then overshooting target, reversing, and finally coming back to target
			easeInOutBack: function(t, b, c, d, s){
				if(s == undefined) s = 1.70158;
				if((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
				return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
			},
			/////////// BOUNCE EASING: exponentially decaying parabolic bounce  //////////////
			// bounce easing in
			// t: current time, b: beginning value, c: change in position, d: duration
			easeInBounce: function(t, b, c, d){
				return c - Easing.easeOutBounce (d-t, 0, c, d) + b;
			},
			// bounce easing out
			easeOutBounce: function(t, b, c, d){
				if((t/=d) < (1/2.75)){
					return c*(7.5625*t*t) + b;
				}else if(t < (2/2.75)){
					return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
				}else if(t < (2.5/2.75)){
					return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
				}else{
					return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
				}
			},
			// bounce easing in/out
			easeInOutBounce: function(t, b, c, d){
				if(t < d/2) return Easing.easeInBounce (t*2, 0, c, d) * .5 + b;
				return Easing.easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
			}
			*/
		};
		return Easing;
	})();
	this.getEffectFunc = function(name){
		return this._easing[name in this._easing ? name : "easeNone"];
	};
	//针对单个元素动画的队列
	this.getQueue = function(el, type){
		var q = runtime._element.data(el, type);
		//Speed up dequeue by getting out quickly if this is just a lookup
		return q || [];
	};
	/**
	 * 入队
	 * @param {HTMLElement} el
	 * @param {String} type "fx"
	 * @param {Function} data
	 */
	this.enQueue = function(el, type, data){
		var q = runtime._element.data(el, type) || runtime._element.data(el, type, data instanceof Array ? data : [data]);
		q.push(data);
		if(this.getQueue(el, "fx")[0] !== "inprogress"){
			this.deQueue(el, type);
		}
		return q;
	};
	//出队
	this.deQueue = function(el, type){
		var queue = this.getQueue(el, type);
		var obj = queue.shift();
		//如果fx队列正在dequeued，删除队首的哨兵
		if(obj === "inprogress"){
			obj = queue.shift();
		}
		if(obj){
			//添加一个哨兵，用来防止自动出队
			if(type === "fx"){
				queue.unshift("inprogress");
			}
			obj.agent[obj.func].call(obj.agent, el/*, this, function(){this.deQueue(el, type);}*/);
		}
	};
	/**
	 * 运行批量动画
	 * @param {Array} data [el, style, start, speed, easingfun, onstart, onstop, onstep]
	 */
	this.run = function(data, agent, func){
		var cbid = runtime._task.add(agent, func);
		if(this._ad){
			this._ad.dispose();
		}
		this._ad = new AnimateData();
		this._ad.create(this, data, cbid);
		this._ad.start();
	};
	/**
	 * 动画主函数
	 * animate(el, "width:100px", 5, "bounceOut", function(){});
	 */
	this.animate = function(el, style, speed, easingfun, agent, func){
		var data = [[el, style, 0, speed, easingfun, null, null, null]];
		this.run(data, agent, func);
	};
	/*
	 * 旋转
	 */
	this.rotate = function(){
		//暂时未实现
	};
	//Node animate
	var speeds = {
		"slow"    : 600,
		"fast"    : 200,
		"_default": 400  //Default speed
	};
	var FX = {
		"show" : ["overflow", "opacity", "height", "width"],
		"fade" : ["opacity"],
		"slide": ["overflow", "height"]
	};
	var effects = {
		"show"     : ["show"  , 1],
		"hide"     : ["show"  , 0],
		"toggle"   : ["toggle"],
		"fadeIn"   : ["fade"  , 1],
		"fadeOut"  : ["fade"  , 0],
		"slideDown": ["slide" , 1],
		"slideUp"  : ["slide" , 0]
	};
	function createFunc(k){
		return function(el, speed, agent, func){
			if(typeof el != "object"){
				runtime.error("[AnimationEngine::createFunc*]error");
				return;
			}
			/*
			if(k == "fadeIn"){  //[TODO]fixed
				el.style.opacity = "1";
				el.style.display = "";
			}else if(k == "fadeOut"){
				el.style.opacity = "0";
				el.style.display = "none";
			}
			*/
			var element = runtime._element;
			//if(!element.data(el, "height")){
				element.data(el, "height" , element.height(el));
				element.data(el, "width"  , element.width(el));
				element.data(el, "opacity", element.css(el, "opacity"));
			//}
			if(!speed){
				speed = speeds._default;
			}else if(typeof speed == "string"){
				speed = speeds[speed];
			}else if(typeof speed == "function" || typeof speed == "object"){
				func = agent;
				agent = speed;
			}
			this._runFx(el, effects[k][0], speed, effects[k][1], agent, func/*, [el]*/);
		};
	}
	for(var k in effects){
		this[k] = createFunc(k);
	}
	this._runFx = function(el, action, speed, display, agent, func){
		/*
		if(display || action === "toggle"){
			el.style.display = "";
		}
		*/
		if(action === "toggle"){
			display = runtime._element.css(el, "height") === "0px" ? 1 : 0;
			action = "show";
		}
		var style = [];
		var oldW = runtime._element.data(el, "width");
		var oldH = runtime._element.data(el, "height");
		var oldOp = runtime._element.data(el, "opacity");
		//var _this = this;
		//FX[action].forEach(function(p){});
		var arr = FX[action];
		for(var i = 0, len = arr.length; i < len; i++){
			switch(arr[i]){
			case "overflow":
				runtime._element.css(el, "overflow", "hidden");
				break;
			case "opacity":
				var s = display ? oldOp + ";" : "0;";
				style.push("opacity:" + s);
				if(display) runtime._element.css(el, "opacity", "0");
				break;
			case "height":
				var s = display ? oldH + "px;" : "0px;";
				style.push("height:" + s);
				if(display) runtime._element.css(el, "height", "0px");
				break;
			case "width":
				var s = display ? oldW + "px;" : "0px";
				style.push("width:" + s);
				if(display) runtime._element.css(el, "width", "0px");
				break;
			}
		}
		//分析最终样式后进行动画
		this.animate(el, style.join(""), speed, "easeIn", agent, func);
		//this, function(){if(!display){el.style.display = "none";}}
	};
	/*
	/ *
	 * 链式
	 * /
	["hide","show","slideDown","slideUp","fadeIn","fadeOut","animate"].forEach(function(p){
		B.extend(p, function(){
			for(var i = 0, len = this.nodes.length; i < len; i++){
				var el = this.nodes[i];
				B[p].apply(el, [el].concat(arguments));
			}
			return this;
		});
	});
	*/
});