_package("alz.core");

_import("alz.core.Plugin");

/**
 * Application�����������
 */
_class("PluginManager", "", function(){
	this._init = function(){
		_super._init.call(this);
		this._plugins = {};
	};
	this.dispose = function(){
		if(this._disposed) return;
		//[TODO]���Ӧ�õĲ��ע�ᵽͬһ���ط�����細��Ӧ�õĲ��ж��ʱ�ᱨ��
		for(var k in this._plugins){
			this._plugins[k].dispose();
			delete this._plugins[k];
		}
		_super.dispose.apply(this);
	};
	/**
	 * �ж�һ������Ƿ��Ѿ�����
	 */
	this.exists = function(name){
		return name in this._plugins;
	};
	/**
	 * ע��һ�������ÿ��APP�����в����������
	 * @param {PlugIn} plugin �����ʵ��
	 */
	this.register = function(plugin){
		this._plugins[plugin.getName()] = plugin;
	};
	/**
	 * ͨ�����ֻ�ȡһ���Ѿ�ע��Ĳ��ʵ��
	 */
	this.getPlugIn = function(name){
		return this._plugins[name];
	};
	/**
	 * ���ò����onResize�¼�
	 * �����в��һ�����������ֵĻ���
	 */
	this.onResize = function(w, h){
		for(var k in this._plugins){
			if(this._plugins[k].onResize){
				this._plugins[k].onResize(w, h);
			}
		}
	};
});