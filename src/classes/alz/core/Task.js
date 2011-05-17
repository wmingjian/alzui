_package("alz.core");

/**
 * 一个任务对象
 * 一个任务的状态：
 * wait
 * ready  done
 * cancel quit
 */
_class("Task", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._parent = null;
		this.id         = 0;       //任务编号
		this.type       = "";      //任务类型(event=事件响应任务)
		this.status     = "wait";  //任务状态(wait|ready|done|cancel|quit)
		this.dependence = [];      //任务依赖的其他任务
		this.agent      = null;    //代理对象
		this.func       = null;    //回调函数
		this.args       = [];      //回调传递的参数
		this.ret        = null;    //返回结果（临时存储地）
		this.time_add   = 0;       //添加时间戳
		this.time_begin = 0;       //开始执行时间戳
		this.time_end   = 0;       //结束执行时间戳

		this.total_count = 0;      //累积执行次数
		this.total_time  = 0;      //累积执行时间
	//this.waitfor    = [];      //依赖的其他cbid(当其他的回调执行完毕，当前的回调才会执行)
	};
	this.create = function(parent, id, agent, func, args, type){
		this._parent = parent;
		this.id = id;
		this.agent = agent;
		this.func = func;
		if(args) this.args = args;
		if(type) this.type = type;
		this.time_add = new Date().getTime();
	};
	this.dispose = function(){
		this.ret = null;
		this.args = [];
		this.func = null;
		this.agent = null;
		this._parent = null;
		_super.dispose.apply(this);
	};
	this.invoke = function(args){
		var ret;
		if(this.status != "wait" && this.status != "ready"){
			console.log("invoke----", this);
		}
		args = args ? args.concat(this.args) : this.args;
		var result = true;
		for(var i = 0, len = this.dependence.length; i < len; i++){
			result = result && this._parent.execute(this.dependence[i], args);
		}
		if(result){  //所有依赖任务成功，才执行当前任务
			if(runtime.getConfData("core_shield")){
				try{
					this.time_begin = new Date().getTime();
					ret = this.func.apply(this.agent, args);
					this.time_end = new Date().getTime();
				}catch(ex){
					runtime.error("[Task::invoke]" + ex.message);
					runtime.getActiveApp().showOperationFailed();  //[TODO]不一定是APP的错误
				}
			}else{
				this.time_begin = new Date().getTime();
				ret = this.func.apply(this.agent, args);
				this.time_end = new Date().getTime();
			}
			this.total_count++;  //执行次数
			this.total_time += this.time_end - this.time_begin;  //执行时间
		}else{
			ret = false;
		}
		if(this.type == "event"){
			this.status = "wait";
		}else{
			this.status = "done";  //标识回调已经执行完毕
		}
		return ret;
	};
});