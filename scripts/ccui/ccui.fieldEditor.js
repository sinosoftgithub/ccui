(function($) {
	$.widget("ccui.fieldEditor",{
		/**
		 * widget 组件初始化方法
		 */
		options:{fieldType:''},
		
		_init:function(){
		},
		
		init:function(){
			var cName = 'editor-'+this.fieldType;
			this.fieldElement = $('<div class="'+cName+'"/>').bind('click',function(){return false;});
			$('body',document).append(this.fieldElement);
			this.fieldElement[this.fieldType]($.extend({property:cName},this.fieldOptions));
		},
		
		 _open:function(value,bindElement,closeAction){
			if(this.fieldType=='fieldText')this.beforeClose = closeAction;
			this.bindElement = bindElement;
			var pos = {
				position:'absolute',
				top:bindElement.offset().top-(($.browser.msie)?2:0),
				left:bindElement.offset().left,
				width:bindElement.width(),
				height:bindElement.outerHeight()
			};
			//if(this.fieldType=='fieldSelect')pos.width-=18;
			this.fieldElement.css(pos).show().fieldValue(value);
		},
		 _close:function(){
			//关闭
			var value = this.fieldElement.fieldValue();
			if(this.bindElement){
				this.beforeClose&&this.beforeClose(this.property,value);
				this.bindElement.html(value).attr('title',this.bindElement.text());
				this.bindElement = null;
			}
			this.fieldElement.hide().fieldReset();
		},
		
		open : function(editor,editorName,bindElement,closeAction){
		if(!editor)return;
		//关闭当前的编辑器
		this.closeEditor();
		//打开新的编辑器
		//if(editor=='input')editorName='input';
		if(!editors[editor][editorName]){
			_initEditor(editor,editorName,closeAction,bindElement);//初始化编辑器
		}
		if(editors[editor][editorName])editors[editor][editorName]._open(bindElement.text(),bindElement,closeAction);//打开编辑器
		this.current = {editor:editor,editorName:editorName};//设置为当前编辑器
		$.ccui.log.info('打开编辑框:'+editor+editorName);
	},
	
	  closeEditor : function(){
		if(this.current){
			editors[this.current.editor][this.current.editorName]&&editors[this.current.editor][this.current.editorName]._close();
		}
	},
	//注册下拉编辑器
	registSelect : function(editorName,selectOptions){
		selectOptionsMap[editorName] = selectOptions;
	},
	
	//注册弹出框
	registDialog : function(editorName,dialogOptions){
		dialogOptionsMap[editorName] = dialogOptions;
	},
	
	_initEditor : function(editor,editorName,closeAction,bindElement){
		var fieldOptions = {property:editor+'-'+editorName,width:95};
		//alert(editorName);
		switch(editor){
    		case 'input':
    			editors[editor][editorName] = $.extend({},textEditor,{property:editorName,fieldOptions:fieldOptions,beforeClose:closeAction});
    			break;
    		case 'select':
    			var selectOptions = $.extend({},fieldOptions,selectOptionsMap[editorName]);
    			if(!selectOptions){
    				$.ccui.log.info('缺少必要的fieldSelect的初始化条件');
    				//throw new Error('');
    			}
    			editors[editor][editorName] = $.extend({},selectEditor,{property:editorName,fieldOptions:selectOptions,beforeClose:closeAction});
    			break;
    		case 'dialog':
    			var dialogOptions = $.extend({
    				autoOpen:false,
    				modal: true,
    				overlay: { opacity: 0.2, background: "#A8A8A8" },
    				buttons:{
    					'确定':function(){
    						editors[editor][editorName].close();
    					},
    					'关闭':function(){$(this).dialog('close');}
    				},
    				setValue:function(value){
    					//设置值
    				},
    				getValue:function(){
    					return '';
    				}
    			},dialogOptionsMap[editorName]);
    			editors[editor][editorName] = $.extend({},dialogEditor,{property:editorName,dialogOptions:dialogOptions,beforeClose:closeAction});
    			break;
    		default:
    			;
    	}
    	if(editors[editor][editorName])editors[editor][editorName].init();//初始化编辑器
	},
		
		destory:function(){
			
		}
	});
})(jQuery);
