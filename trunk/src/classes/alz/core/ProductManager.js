_package("alz.core");

/**
 * ��Ʒ������Ϣ��������
 */
_class("ProductManager", "", function(){
	this._init = function(){
		_super._init.call(this);
		/**
		 * ��Ʒ��������
		 * {
		 *   name: "sinamail-5.0",  //��Ʒ����
		 *   tpl: [],   //ģ��
		 *   skin: [],  //Ƥ��
		 *   paper: []  //��ֽ
		 * }
		 */
		this._products = {};  //��Ʒ�������ݣ���ʽ[{name:"",tpl:[],skin:[],paper:[]},...]
		this._activeProduct = null;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._activeProduct = null;
		for(var k in this._products){
			delete this._products[k];
		}
		_super.dispose.apply(this);
	};
	this.destroy = function(){
	};
	/**
	 * ע��һ����Ʒ��������
	 * @param {JsonObject} data ��Ʒ���ö���
	 */
	this.regProduct = function(data){
		if(data.name in this._products){
			window.alert("[ERROR]��Ʒ" + data.name + "�Ѿ�ע�����");
		}else{
			this._products[data.name] = data;
			this._activeProduct = data;
		}
	};
	this.getActiveProduct = function(){
		if(this._activeProduct){
			return this._activeProduct;
		}
		for(var k in this._products){
			return this._products[k];
		}
		runtime.log("[WebRuntime::getProduct]data_xxx.jsδ����ȷ���أ�ϵͳ�޷��������У����飡");
		return {
			"name" : "",  //��Ʒ����
			"tpl"  : [],  //ģ��
			"skin" : [],  //Ƥ��
			"paper": [],  //��ֽ
			"app"  : []   //APP����
		};
		//return null;
	};
});