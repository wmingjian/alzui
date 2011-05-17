_package("alz.core");

/**
 * 接口: 可配置的
 */
_interface("IConfigurable", "", function(_property){
	/*
	 * 配置信息
	 */
	this.__conf = {
		"plugin": {},  //插件       格式: {id:s,clazz:s}
		"model" : {},  //数据模型   格式: {id:s,clazz:s}
		"taglib": {},  //标签库     格式: {id:s,clazz:s}
		"popup" : {},  //弹出式组件 格式: {id:s,clazz:s,tpl:s}
		"dialog": {},  //对话框组件 格式: {id:s,clazz:s,tpl:s}
		"pane"  : {},  //面板组件   格式: {id:s,clazz:s,tpl:s}
	};
	/**
	 * 注册配置数据
	 * @param {LibContext} cxt 上下文环境
	 * @param {Object} data 配置数据
	 */
	this.__conf__ = function(cxt, data){
		for(var k in data){
			var hash;
			if(!(k in this.__conf)){
				hash = this.__conf[k] = {};
			}else{
				hash = this.__conf[k];
			}
			for(var i = 0, len = data[k].length; i < len; i++){
				var item = data[k][i];
				var name = item.clazz;
				if(typeof name === "string"){
					if(name in cxt && typeof cxt[name] === "function"){
						item.clazz = cxt[name];
					}else{
						console.log("[IConf::__conf__]clazz not found");
					}
				}
				hash[item.id] = item;
			}
		}
	};
	this.findConf = function(type, k){
		if(arguments.length == 1){
			return this.__conf[type];
		}else{
			var hash = this.__conf[type];
			return hash[k in hash ? k : type];  //默认值和type参数一直
		}
	};
});