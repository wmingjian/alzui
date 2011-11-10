_package("alz.core");

_import("alz.core.Animate");

/**
 * 一组动画
 */
_class("AnimateData", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._engine = null;
		this._cbid = -1;
		this._msec = 10;  //定时器步长
		this._timer = 0;  //定时器
		this._startTime = 0;  //总开始时间
		this._stopTime = 0;   //总结束时间
		this._list = [];  //一组动画列表
		//this._startList = [];  //按开始时间排序的动画列表
		//this._stopList = [];   //按结束时间排序的动画列表
		this._stopped = false;
	};
	this.create = function(engine, data, cbid){
		this._engine = engine;
		this._cbid = cbid || -1;
		this._startTime = new Date().getTime();
		for(var i = 0, len = data.length; i < len; i++){
			this.add(data[i]);
			//var a = data[i];
			//this.animate(a[0], a[1], a[3], a[4], a[5]);
		}
	};
	this.dispose = function(){
		if(this._timer != 0){
			this.stop();
		}
		/*
		for(var i = 0, len = this._stopList.length; i < len; i++){
			this._stopList[i] = null;
		}
		this._stopList = [];
		for(var i = 0, len = this._startList.length; i < len; i++){
			this._startList[i] = null;
		}
		this._startList = [];
		*/
		for(var i = 0, len = this._list.length; i < len; i++){
			this._list[i].dispose();
			this._list[i] = null;
		}
		this._list = [];
		this._startTime = 0;
		this._stopTime = 0;
		this._engine = null;
		_super.dispose.apply(this);
	};
	this.add = function(data){
		if(typeof data[4] != "string") data[4] = "easeNone";
		var nodes = data[0] instanceof Array ? data[0] : [data[0]];  //jQuery
		for(var i = 0, len = nodes.length; i < len; i++){
			var adata = {
				"element" : nodes[i]._self || nodes[i],  //目标元素
				"style"   : data[1],  //目标值
				"start"   : data[2],  //开始时间
				"speed"   : data[3],  //时长
				"func"    : data[4],  //动画效果
				"onstart" : data[5],  //onstart回调函数
				"onstop"  : data[6],  //onstop回调函数  [TODO]回调函数被重复执行了多次
				"onstep"  : data[7]   //onstep回调函数
			};
			var obj = new Animate(this._engine, adata);
			obj.init();
			//obj.start();
			//this.enQueue(nodes[i], "fx", {"agent": obj, "func": "init"});
			this._stopTime  = Math.max(obj._stop, this._stopTime);
			this._list.push(obj);
			//this._startList.push(obj);
			//this._stopList.push(obj);
		}
	};
	this._start = function(){
		this._d1 = new Date().getTime();
		if(this.step()){
			if(this._timer == 0){
				this._timer = runtime.startTimer(this._msec, this, "_start");
			}
			return true;
		}else{
			this.stop();
			this.dispose();
		}
	};
	/**
	 * 开始播放动画
	 */
	this.start = function(){
		//console.log("start");
		this._start();
	};
	/**
	 * 停止播放动画
	 */
	this.stop = function(){
		if(this._stopped) return;
		this._stopped = true;
		runtime.stopTimer(this._timer);
		for(var i = 0, len = this._list.length; i < len; i++){
			var a = this._list[i];
			if(!a._stopped){
				a.onStop();
			}
		}
		if(this._cbid != -1){
			runtime._task.execute(this._cbid);
		}
	};
	/**
	 * 播放一帧动画
	 */
	this.step = function(){
		this._d2 = new Date().getTime();
		this._startTime += this._d2 - this._d1;  //为了step方法能够设置断点
		var t = new Date().getTime() - this._startTime;  //当前时间距开始时间的差
		for(var i = 0, len = this._list.length; i < len; i++){
			var a = this._list[i];
			//console.log("----a._start=" + a._start + ",t=" + t + ",a._stop=" + a._stop);
			if(t < a._start){
			}else if(a._start <= t && t <= a._stop){
				if(!a._started){
					//a.arr = [];
					a.onStart();
				}
				var x = a.onStep(t, this._msec);
				if(x === 1){
					a.onStop();
					//this._stopped = true;
				}
			}else if(t > a._stop){  //结束后，只需执行一次onStep
				if(!this._stopped){
					var x = a.onStep(t, this._msec);  //[TO-DO]可能会重复一次x=1的情况
					runtime.assert(x === 1, "error");
					a.onStop();
					//this._stopped = true;
				}
				a.onStop();
				//runtime._debugPane.showTable(a.arr);
			}
		}
		//console.log(t + "<" + this._stopTime + "=" + (t < this._stopTime));
		return t < this._stopTime;  //判断是否结束
	};
});