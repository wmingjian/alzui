_package("alz.core");

/**
 * DOM Event Model
 * ��Document Object Model (DOM) Level 2 Events Specification��
 * http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113
 */
_class("EventTarget", "", function(){
	this._init = function(){
		_super._init.call(this);
		/**
		 * ���е��¼���Ӧ�����������������󶨣����Ǵ洢�����ӳ�����
		 * [ע��]���ܽ������Էŵ�ԭ����������ȥ����Ȼ��������Ṳ��֮
		 */
		this._eventMaps = {};  //�¼�ӳ���
		//this._listeners = {};
		this._listener = null;
		this._enableEvent = true;
		this._parent = null;  //��������ĸ����
		this._disabled = false;
	};
	this.dispose = function(){
		if(this._disposed) return;
		this._parent = null;
		this._listener = null;
		_super.dispose.apply(this);
	};
	this.setEnableEvent = function(v){
		this._enableEvent = v;
	};
	this.getParent = function(){
		return this._parent;
	};
	this.setParent = function(v){
		this._parent = v;
	};
	this.getDisabled = function(){
		return this._disabled;
	};
	this.setDisabled = function(v){
		if(this._disabled == v) return;
		this._disabled = v;
	};
	this.addEventListener1 = function(eventMap, listener){
		this._listener = listener;
		if(eventMap == "mouseevent"){
			eventMap = "mousedown,mouseup,mousemove,mouseover,mouseout,click,dblclick";
		}else if(eventMap == "keyevent"){
			eventMap = "keydown,keypress,keypressup";
		}
		var maps = eventMap.split(",");
		for(var i = 0, len = maps.length; i < len; i++){
			if(this._self){
				this._self["on" + maps[i]] = function(ev){
					ev = ev || runtime.getWindow().event;
					//if(ev.type == "mousedown") window.alert(121);
					if(this._ptr._enableEvent){  //����������¼���Ӧ���ƣ��򴥷��¼�
						if(ev.type in this._ptr._listener){
							this._ptr._listener[ev.type].call(this._ptr, ev);
						}
					}
				};
			}
		}
		maps = null;
	};
	this.removeEventListener1 = function(eventMap){
		if(eventMap == "mouseevent"){
			eventMap = "mousedown,mouseup,mousemove,mouseover,mouseout,click,dblclick";
		}else if(eventMap == "keyevent"){
			eventMap = "keydown,keypress,keypressup";
		}
		var maps = eventMap.split(",");
		for(var i = 0, len = maps.length; i < len; i++){
			if(this._self){
				this._self["on" + maps[i]] = null;
			}
		}
		maps = null;
		this._listener = null;
	};
	/**
	 * �˷����������¼�Ŀ����ע���¼���������
	 * @java void addEventListener(String type, EventListener listener, boolean useCapture);
	 * [TODO]���type�ĺϷ�ֵ
	 * [TODO]ͬһ���¼���Ӧ������Ӧ�ñ�������
	 */
	this.addEventListener = function(type, eventHandle, useCapture){
		if(!this._eventMaps[type]){
			this._eventMaps[type] = [];  //[TODO]ʹ��{}��ģ�����¼�ִ��˳����޹���
		}
		this._eventMaps[type].push(eventHandle);
	};
	this.removeEventListener = function(type, eventHandle, useCapture){
		if(this._eventMaps[type]){
			var arr = this._eventMaps[type];
			for(var i = 0, len = arr.length; i < len; i++){
				if(eventHandle == null){  //�Ƴ������¼�
					arr[i] = null;
					arr.removeAt(i, 1);
				}else if(arr[i] == eventHandle){
					arr[i] = null;
					arr.removeAt(i, 1);  //�Ƴ�Ԫ��
					break;
				}
			}
		}
	};
	this.dispatchEvent = function(ev){
		var ret = true;
		for(var obj = this; obj; obj = obj._parent){  //Ĭ���¼�����˳��Ϊ��������
			if(obj._disabled){
				ev.cancelBubble = true;
				ret = false;
				break;  //continue;
			}
			if(obj["on" + ev.type]){  //��������ʱ����Ӧ��������
				ret = obj["on" + ev.type](ev);  //Ӧ���ж��¼���Ӧ�����ķ���ֵ����Щ����
				if(ev.cancelBubble){
					return ret;  //�����ֹð�ݣ����˳�
				}
			}else{
				var map = obj._eventMaps[ev.type];
				if(map){  //����¼�ӳ������Ƿ��ж�Ӧ���¼�
					var bCancel = false;
					ev.cancelBubble = false;  //��ԭ
					for(var i = 0, len = map.length; i < len; i++){
						ret = map[i].call(obj, ev);
						bCancel = bCancel || ev.cancelBubble;  //��һ��Ϊ�棬��ֹͣð��
					}
					ev.cancelBubble = false;  //��ԭ
					if(bCancel){
						return ret;  //�����ֹð�ݣ����˳�
					}
				}
			}
			//[TODO]�¼���������ߵ�ʱ��offsetX,offsetY����ҲҪ���ŷ����黯
			ev.sender = obj;
			if(obj._self){  //[TODO] obj �п�����designBox������û��_self����
				ev.offsetX += obj._self.offsetLeft;
				ev.offsetY += obj._self.offsetTop;
			}
		}
		return ret;
	};
});