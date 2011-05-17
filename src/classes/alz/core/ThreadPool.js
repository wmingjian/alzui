_package("alz.core");

_import("alz.core.Plugin");

/**
 * 伪线程池，线程调度管理器
 */
_class("ThreadPool", Plugin, function(){
	this._init = function(){
		_super._init.call(this);
		this._suspend = false;  //是否暂停整个运行时环境
		this._tid = 1;          //线程唯一编号
		this._hash = {};        //模拟线程池(哈希表)
	};
	this.dispose = function(){
		for(var k in this._hash){
			this._hash[k].func = null;
			this._hash[k].agent = null;
			//this._hash[k].dispose();
			delete this._hash[k];
		}
		_super.dispose.apply(this);
	};
	/**
	 * 创建并启动一个线程
	 * @param {Number} msec 启动延迟时间
	 * @param {Object} agent 代理对象
	 * @param {Function|String} func 匿名函数或者代理对象的方法名
	 * @return {Number} 定时器id
	 */
	this._createThread = function(msec, agent, func){
		var f = typeof func == "string" ? agent[func] : func;
		//var cbid = runtime._task.add(agent, func);
		var thread = {
		//"cbid"    : cbid,        //回调任务编号
			"id"      : this._tid++, //线程编号
			"type"    : "",          //类型
			"status"  : "wait",      //状态(wait|ready|done|cancel|quit) -- 和任务对象的状态保持一致，方便以后实现统一
			"agent"   : agent,       //代理对象
			"func"    : f,           //要执行的代码
			"timer"   : 0,           //定时器句柄
			"msec"    : msec,        //时间间隔
			"time_add": new Date().getTime()  //当前时间
		};
		this._hash[thread.id] = thread;
		if(!this._suspend){
			this._start(thread);
		}
		return thread;
	};
	/**
	 * 暂停所有线程的执行
	 */
	this.suspend = function(){
		if(this._suspend) return false;
		this._suspend = true;
		//暂停池子里还没有执行的线程
		for(var k in this._hash){
			var thread = this._hash[k];
			if(thread.timer != 0){
				window.clearTimeout(thread.timer);
				thread.timer = 0;
			}
		}
		return true;
	};
	/**
	 * 恢复所有线程的执行
	 */
	this.resume = function(){
		if(!this._suspend) return false;
		this._suspend = false;
		//恢复池子里暂停的线程
		for(var k in this._hash){
			var thread = this._hash[k];
			switch(thread.status){
			case "ready":
				this.run(thread);
				break;
			case "wait":
			default:
				this._start(thread);
				break;
			}
			//delete this._hash[k];
		}
		return true;
	};
	/**
	 * 启动一个线程
	 */
	this._start = function(thread){
		var _this = this;
		thread.status = "wait";
		thread.timer = window.setTimeout(function(){
			thread.status = "ready";
			if(!_this._suspend){
				_this.run(thread);
			}
		}, thread.msec);
	};
	/**
	 * 重新启动一个线程
	 */
	this._restart = function(thread){
		this._start(thread);
	};
	/**
	 * 停止一个线程
	 */
	this._stop = function(thread, reserve){
		thread.status = "done";
		if(!reserve){
			delete this._hash[thread.id];  //移除
		}
		if(thread.timer != 0){
			window.clearTimeout(thread.timer);
			thread.timer = 0;
			return true;
		}
		return false;
	};
	/**
	 * 运行一个线程
	 */
	this.run = function(thread){
		var ret;
		if(runtime.getConfData("core_shield")){
			try{
				ret = thread.func.apply(thread.agent);
				//ret = runtime._task.execute(thread.cbid);
			}catch(ex){
				runtime.log("[ThreadPool::startTimer*]" + ex.message);
				runtime.getActiveApp().showOperationFailed();  //[TODO]不一定是APP的错误
			}
		}else{
			ret = thread.func.apply(thread.agent);
			//ret = runtime._task.execute(thread.cbid);
		}
		if(ret === true){
			this._restart(thread);  //重新启动
		}else{
			this._stop(thread);
		}
	};
	/**
	 * 重启一个线程(停止&启动)
	 */
	this.restart = function(tid){
		if(tid in this._hash){
			var thread = this._hash[tid];
			this._stop(thread, true);
			this._start(thread);
		}
	};
	/**
	 * 启动一个定时器
	 * [TODO]msec == 0时，是不是需要特别考虑一下
	 * @param {Number} msec 启动延迟时间(毫秒)
	 * @param {Object} agent 代理对象
	 * @param {Function|String} func 匿名函数或者代理对象的方法名
	 * @return {Number} 定时器id
	 */
	this.startThread = function(msec, agent, func){
		return this._createThread(msec, agent, func).id;
	};
	/**
	 * 停止一个定时器
	 */
	this.stopThread = function(tid){
		if(tid <= 0 || tid >= this._tid){  //tid超出正常范围
			console.error("[ThreadPool::stopThread]tid=" + tid);
			return false;
		}
		if(tid in this._hash){
			return this._stop(this._hash[tid]);
		}
		return false;
	};
});