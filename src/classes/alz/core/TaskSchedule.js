_package("alz.core");

_import("alz.core.Task");
_import("alz.core.Plugin");

/**
 * 任务调度器
 * 单个JS操作花费的总时间（最大值）不应该超过100毫秒。——摘自《高性能JavaScript》
 */
_class("TaskSchedule", Plugin, function(){
	this._init = function(){
		_super._init.call(this);
		this._status = "free";   //调度循环的状态(free|planned|running)
		this._tid = 1;           //任务唯一编号
		this._hash = {};         //待执行任务列表(数据请求的回调队列){agent,func}
		this._undoHash = {};     //需要要处理的任务列表
		//this._undoQueue = [];  //未完成任务队列
		//this._stack = [];      //当前任务栈
	};
	this.create = function(name, app){
		_super.create.apply(this, arguments);
		//这是全局第一个定时器
		runtime.startTimer(60, this, function(){
			//if(this._undoHash.length > 0){  //有任务才检查
				this.checkThread();
			//}
			return true;
		});
	};
	this.dispose = function(){
		//this._stack 应该为空
		//this._undoHash 应该为空
		/*
		for(var i = 0, len = this._undoQueue.length; i < len; i++){
			this._undoQueue[i] = null;
		}
		this._undoQueue = [];
		*/
		for(var k in this._hash){
			this._hash[k].dispose();
			delete this._hash[k];
		}
		_super.dispose.apply(this);
	};
	/* *
	 * 添加一条任务
	 */
	/*
	this.addTask = function(type, agent, func){
		this._undoQueue.push({
			"type"  : type,    //任务类型
			"status": "wait",  //状态(wait,done)
			"agent" : agent,   //代理对象
			"func"  : func     //回调函数
		});
	};
	*/
	/* *
	 * 运行任务调度算法
	 */
	/*
	this.run = function(type){
		var tasks = [];
		for(var i = 0, len = this._undoQueue.length; i < len; i++){
			var task = this._undoQueue[i];
			if(task.type == type && task.status == "wait"){
				tasks.push(task);  //[TODO]需要从队列中移除
			}
		}
		for(var i = 0, len = tasks.length; i < len; i++){
			var task = tasks[i];
			task.func.apply(task.agent);
			task.status = "done";
			task = null;
		}
		if(this._undoQueue.length >= 20){  //延迟批量清理策略
			var i = 0;
			while(i < this._undoQueue.length){
				var task = this._undoQueue[i];
				if(task.type == type && (task.status == "done" || task.status == "quit")){
					this._undoQueue.splice(i, 1);
				}else{
					i++;
				}
			}
		}
	};
	*/
	//this.addWaitFor = function(){
	//};
	/**
	 * 添加一个任务依赖的其他任务
	 * @param {Number} tid
	 * @param {Object} agent
	 * @param {Function|String} func
	 */
	this.addDependence = function(tid, agent, func){
		var tid2 = this.add(agent, func);
		this._hash[tid].dependence.push(tid2);
	};
	/**
	 * 添加一个任务
	 */
	this.add = function(agent, func, args, type){
		var tid;
		switch(typeof agent){
		case "number":  //tid
			return agent;
			//tid = agent;
			//break;
		case "object":
			switch(typeof func){
			case "function": /*func = func;*/break;
			case "string"  :
				if(agent === null){
					runtime.error("[TaskSchedule::add]param type error(agent === null)");
				}
				func = agent[func];
				break;
			default:
				runtime.error("[TaskSchedule::add]param type error(func)");
				break;
			}
			tid = this._tid++;
			break;
		case "function":
			func = agent;
			agent = null;
			tid = this._tid++;
			break;
		case "undefined":
		default:
			runtime.error("[TaskSchedule::add]param type error (agent)");
			break;
		}
		//this.addTask("", agent, func);
		var task = new Task();
		task.create(this, tid, agent, func, args, type);
		this._hash[tid] = task;
		return tid;
	};
	/**
	 * 移除一个任务
	 */
	this.remove = function(tid){
		if(!(tid in this._hash)){
			console.log("----error");
		}
		if(tid in this._undoHash){
			console.log("####error");
		}
		this._hash[tid].dispose();
		delete this._hash[tid];
	};
	/**
	 * 执行一个任务
	 */
	this.execute = function(tid, args){
		var task = this._hash[tid];
		var ret = task.invoke(args);  //task.staus = "done";
		if(task.type != "event"){
			this.addUndo(tid, task);
			this.checkThread();
		}
		return ret;
	};
	this.addUndo = function(tid, task){
		if(tid in this._undoHash) return;
		this._undoHash[tid] = task;
	};
	/**
	 * 向任务发送所需数据(状态会变更为ready)
	 */
	this.send = function(tid, data){
		//console.log("send " + tid);
		var task = this._hash[tid];
		if(task.status != "wait"){
			console.log("[TaskSchedule::send]task status error(task.status=" + task.status + ")");
		}
		task.ret = data;
		task.status = "ready";
		this.addUndo(tid, task);
	};
	/**
	 * 任务准备就绪
	 */
	this.ready = function(tid){
		//console.log("ready " + tid);
		var task = this._hash[tid];
		task.status = "ready";
		this.addUndo(tid, task);
	};
	/**
	 * 取消任务
	 */
	this.cancel = function(tid){
		//console.log("cancel " + tid);
		var task = this._hash[tid];
		task.status = "cancel";
		this.addUndo(tid, task);
	};
	/**
	 * 完成任务
	 */
	this.done = function(tid){
		//console.log("done " + tid);
		this._hash[tid].status = "done";
	};
	this.checkThread = function(){
		switch(this._status){
		case "free":
			//if(this._undoHash.length > 0){  //有任务才启动执行计划
				runtime.startTimer(0, this, "runloop");
				this._status = "planned";
			//}
			break;
		case "planned":
		case "running":
			break;
		}
	};
	/**
	 * 检查栈顶任务是否已有返回值？
	 */
	this.runloop = function(){
		this._status = "running";
		var hash = this._undoHash;
		this._undoHash = {};
		for(var tid in hash){
			//if(!(tid in this._hash)){
			//	console.log("error=" + tid);
			//	continue;
			//}
			var task = hash[tid];
			switch(task.status){
			case "cancel":
				task.time_begin =
				task.time_end = new Date();
				task.status = "quit";  //放弃
				this.remove(tid);
				break;
			case "ready":
				task.invoke(task.ret ? [task.ret] : []);
				task.ret = null;
				this.remove(tid);
				break;
			case "quit":
			case "done":
				this.remove(tid);
				break;
			case "wait":
				break;
			default:
				console.log("[warning]runloop status error(" + task.status + ")");
				break;
			}
			delete hash[tid];
		}
		/*
		for(var tid in this._undoHash){
			console.log("====" + tid);
		}
		*/
		this._status = "free";
		/*
		if(window.__deck){
			var visible = false;
			for(var k in __deck._hash){
				if(__deck._hash[k].getVisible()){
					visible = true;
				}
			}
			if(!visible){
				console.log("visible==false");
			}
		}
		*/
	};
	/*
	//检查栈顶任务是否已有返回值？
	this.runloop = function(){
		this._status = "running";
		var exit = false;
		while(this._stack.length > 0 && !exit){
			var task = this.top();
			switch(task.status){
			case "cancel":
				this.pop();
				task.time_begin =
				task.time_end = new Date();
				task.status = "quit";  //放弃
				break;
			case "ready":
				this.pop();  //提前出栈，放置后面的流程有压栈动作
				task.invoke(task.ret ? [task.ret] : []);
				task.ret = null;
				break;
			case "quit":
			case "done":
				this.pop();
				break;
			case "wait":
			default:
				exit = true;  //退出
				if(task.status != "wait"){
					console.log("[warning]runloop status error(" + task.status + ")");
				}
				break;
			}
		}
		this._status = "free";
	};
	this.top = function(){
		return this._stack[this._stack.length - 1];
	};
	this.pop = function(){
		//console.log("pop " + this.top().id);
		return this._stack.pop();
	};
	//任务压栈
	this.pushtask = function(agent, func, args){
		var tid;
		if(typeof agent == "number"){  //要和顶部的任务一致才行
			tid = agent;
		}else{
			tid = this.add(agent, func, args);
			//console.log("pushtask " + tid);
			this._stack.push(this._hash[tid]);  //任务压栈
		}
		return tid;
	};
	/ **
	 * 遇到错误结果时，任务出栈
	 * /
	this.poptask = function(tid, data){
		var task = this.top();
		if(task.id == tid){
			this.pop();  //提前出栈，放置后面的流程有压栈动作
			if(task.status == "cancel"){  //已经取消的任务，放弃处理
				task.time_begin =
				task.time_end = new Date();
				task.status = "quit";  //放弃
			}else if(task.status == "done"){
			}else{
				task.invoke(data ? [data] : []);
			}
			this.checkThread();
		}else{
			//console.log("[poptask]error");
		}
	};
	//取消栈顶任务
	this.cancelTop = function(){
		if(this._stack.length > 0){
			var task = this.top();
			task.status = "cancel";
			return task.id;
		}
	};
	this.begin = function(){
	};
	this.end = function(){
	};
	*/
});