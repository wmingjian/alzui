_package("alz.mui");

_import("alz.mui.Container");

_class("Pane", Container, function(_super){
	this._init = function(){
		_super._init.call(this);
		this._components = [];
	};
	this.init = function(obj){
		_super.init.apply(this, arguments);
	};
	this.dispose = function(){
		if(this._disposed) return;
		for(var i = 0, len = this._components.length; i < len; i++){
			this._components[i].dispose();
			this._components[i] = null;
		}
		this._components = [];
		_super.dispose.apply(this);
	};
	/**
	 * ��ʼ������е� Action �������
	 * ֧�ֵ� Action ��������У�
	 *   ��  �� FORM
	 *   �����ӣ� A
	 *   ��ť  �� INPUT(type=button)
	 *   ��ѡ�� INPUT(type=checkbox)
	 *   �б�� SELECT
	 */
	this.initComponents = function(element){
		var tags = ["FORM", "A", "SELECT", "INPUT"];
		for(var i = 0, len = tags.length; i < len; i++){
			var nodes = element.getElementsByTagName(tags[i]);
			for(var j = 0, len1 = nodes.length; j < len1; j++){
				var node = nodes[j];
				if(node.getAttribute("_action")){
					var component;
					switch(tags[i]){
					case "FORM":
						component = new FormElement();
						break;
					case "A":
						component = new LinkLabel();
						break;
					case "SELECT":
						component = new ComboBox();
						break;
					case "INPUT":
						switch(node.type){
						case "button":
							component = new Button();
							break;
						case "checkbox":
							component = new CheckBox();
							break;
						default:
							continue;
						}
						//application._buttons[btn._action] = btn;
						break;
					}
					component.init(node);
					//application._actionManager.add(component);
					this._components.push(component);
				}
				node = null;
			}
			nodes = null;
		}
	};
	/**
	 * Action ����ģ��
	 * [TODO]
	 * 1)���������� Action ����ֻ������Ķ���ѹ�붯��ջ�������ܹ���֤��ȷ�Ķ�����
	 *   �˻��ơ�
	 */
	this.doAction = function(action){
	};
});