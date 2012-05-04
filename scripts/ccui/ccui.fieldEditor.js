(function($) {
	$.widget("ccui.fieldEditor",{
	 
		options:{fieldType:'',
		editors : {
		input:[],
		select:[],
		dialog:[]
	},
	 selectOptionsMap : [],//�洢select�ĳ�ʼ������
	 dialogOptionsMap : [],//�洢dialog�ĳ�ʼ������},
			},
		
		 _open:function(value,bindElement,closeAction){
			if(this.options.fieldType=='fieldText')this.options.beforeClose = closeAction;
			this.options.bindElement = bindElement;
			var pos = {
				position:'absolute',
				top:bindElement.offset().top-(($.browser.msie)?2:0),
				left:bindElement.offset().left,
				width:bindElement.width(),
				height:bindElement.outerHeight()
			};
			//if(this.fieldType=='fieldSelect')pos.width-=18;
			this.options.fieldElement.css(pos).show().fieldValue(value);
		},
		 _destroy:function(){
			//�ر�
			if(this.options.fieldElement){
			var value = this.options.fieldElement.fieldValue();
			if(this.options.bindElement){
				this.options.beforeClose&&this.options.beforeClose(this.options.property,value);
				this.options.bindElement.html(value).attr('title',this.options.bindElement.text());
				this.options.bindElement = null;
			}
			this.options.fieldElement.hide().fieldReset();
		}
		},
		
		open : function(editor,editorName,bindElement,closeAction){
		if(!editor)return;
		if(!this.options.editors[editor][editorName]){
			this._initEditor(editor,editorName,closeAction,bindElement);//��ʼ���༭��
		}
		this._open(bindElement.text(),bindElement,closeAction);//�򿪱༭��
	},
	
	//ע�������༭��
	registSelect : function(editorName,selectOptions){
		selectOptionsMap[editorName] = selectOptions;
	},
	
	//ע�ᵯ����
	registDialog : function(editorName,dialogOptions){
		dialogOptionsMap[editorName] = dialogOptions;
	},
	
	_initEditor : function(editor,editorName,closeAction,bindElement){
		var fieldOptions = {property:editor+'-'+editorName,width:95};
		//alert(editorName);
		switch(editor){
    		case 'input':
    		this._setOptions({property:editorName,fieldOptions:fieldOptions,beforeClose:closeAction,fieldType:'fieldText'});
    			break;
    		case 'select':
    			var selectOptions = $.extend({},fieldOptions,selectOptionsMap[editorName]);
    			if(!selectOptions){
    				$.ccui.log.info('ȱ�ٱ�Ҫ��fieldSelect�ĳ�ʼ������');
    				//throw new Error('');
    			}
    			this._setOptions({property:editorName,fieldOptions:fieldOptions,beforeClose:closeAction,fieldType:'fieldSelect'});
    			break;
    		case 'dialog':
    			var dialogOptions = $.extend({
    				autoOpen:false,
    				modal: true,
    				overlay: { opacity: 0.2, background: "#A8A8A8" },
    				buttons:{
    					'ȷ��':function(){
    						this.options.editors[editor][editorName].close();
    					},
    					'�ر�':function(){$(this).dialog('close');}
    				},
    				setValue:function(value){
    					//����ֵ
    				},
    				getValue:function(){
    					return '';
    				}
    			},dialogOptionsMap[editorName]);
    			this._setOptions({property:editorName,fieldOptions:fieldOptions,beforeClose:closeAction,fieldType:'fieldSelect'});
    			break;
    		default:
    			;
    	}
    	var cName = 'editor-'+this.options.fieldType;
			this.options.fieldElement = $('<div class="'+cName+'"/>').bind('click',function(){return false;});
			$('body',document).append(this.options.fieldElement);
			this.options.fieldElement[this.options.fieldType]($.extend({property:cName},this.options.fieldOptions));
	}
	
	});
})(jQuery);
