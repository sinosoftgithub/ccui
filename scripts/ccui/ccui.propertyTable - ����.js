(function($) {
	$.widget("ccui.propertyTable",{
		/**
		 * widget 组件初始化方法
		 */
		_init:function(){
			this.element.addClass('ccui-propertyTable disabled');
			this._initAction();
			this.element.find('li').each(function(){
				var propertyName = this.firstChild.nodeValue;
				this.firstChild.nodeValue = '';//清空文本值
				$(this).prepend('<table width="100%" cellspacing="0" cellspadding="0"><tr><td class="name '+this.className+'">'+propertyName+'</td><td class="value">&nbsp;</td></tr></table>');
			});
			
			$('body',document).click(function(){
				$.ccui.editorFactory.closeEditor();
			});
		},
		
		_initAction:function(){
			var self = this;
			this.element.bind('click',function(event){
				if($(this).hasClass('disabled')){
					return;
				}
				$.ccui.editorFactory.closeEditor();
				var clickElement = $(event.srcElement||event.target);
				if(clickElement.is('.propertyGroup')){
					clickElement.toggleClass('expanded');
					clickElement.parents('li.propertyGroup').toggleClass('expanded');
				}else if(clickElement.is('.value')){
					var propertyElement = clickElement.parents('li.property'),
						editor = propertyElement.attr('editor'),
						id = propertyElement.attr('id'),
						editorName = propertyElement.attr('editorName')||id;
					$.ccui.editorFactory.open(editor,editorName,clickElement,self.editorChange);
					return false;
				}
			});
		},
		
		_setProperty:function(property,value){
			if(value&&value!=this._getProperty(property)){
				this.element.find('li#'+property+' .value:first').text(value).attr('title',value);
			}
		},
		
		_getProperty:function(property){
			var value = this.element.find('li#'+property+' .value:first').text();
			return value;
		},
		
		setProperty:function(property,value){
			this._setProperty(property,value);
		},
		
		fillProperties:function(propertyMap,editorChange){
			this.activeEditor();
			this.reset();
			this.editorChange = editorChange;//供编辑器回调设置使用
			var value = null;
			for(var property in propertyMap){
				value = propertyMap[property];
				if(value){
					this._setProperty(property,value);
				}
				value = null;
			}
		},
		/**
		 * 是表格成为可编辑状态
		 */
		activeEditor:function(){
			this.element.removeClass('disabled');
		},
		
		reset:function(){
			this.element.find('li').not('.propertyGroup').find('.value').html('&nbsp;');
		},
		
		destory:function(){
			
		}
	});
})(jQuery);

/**********************************************************************************/
(function (jQuery){
	var fieldEditor = {
		fieldType:'',
		
		init:function(){
			var cName = 'editor-'+this.fieldType;
			this.fieldElement = $('<div class="'+cName+'"/>').bind('click',function(){return false;});
			$('body',document).append(this.fieldElement);
			this.fieldElement[this.fieldType]($.extend({property:cName},this.fieldOptions));
		},
		
		open:function(value,bindElement,closeAction){
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
		close:function(){
			//关闭
			var value = this.fieldElement.fieldValue();
			if(this.bindElement){
				this.beforeClose&&this.beforeClose(this.property,value);
				this.bindElement.html(value).attr('title',this.bindElement.text());
				this.bindElement = null;
			}
			this.fieldElement.hide().fieldReset();
		}
	};
	//继承自fieldEditor
	var textEditor = $.extend({},fieldEditor,{
		fieldType:'fieldText'
	});
	
	var selectEditor = $.extend({},fieldEditor,{
		fieldType:'fieldSelect'
	});
	//
	var dialogEditor = {
		init:function(){
			this.dialogElement = $('<div class="editor-dialog"/>');
			$('body',document).append(this.dialogElement);
			if($.isFunction(this.dialogOptions.initContent)){
				this.dialogOptions.initContent(this.dialogElement);
			}
			this.dialogElement.dialog(this.dialogOptions);
		},
		open:function(value,bindElement){
			this.bindElement = bindElement;
			this.dialogOptions.setValue(value);
			this.dialogElement.dialog('open');
		},
		close:function(){
			var value = this.dialogOptions.getValue();
			if(this.bindElement){
				this.beforeClose&&this.beforeClose(this.property,value);
				this.bindElement.html(value).attr('title',this.bindElement.text());
				this.bindElement = null;
			}
			this.dialogElement.dialog('close');
		}
	};
	
	var editors = {
		input:[],
		select:[],
		dialog:[]
	};
	
	var selectOptionsMap = [];//存储select的初始化条件
	var dialogOptionsMap = [];//存储dialog的初始化条件
	/**
	 * 添加编辑框
	 */
    this.add = function(editor){
    	switch(editor){
    		case 'input':
    			break;
    		case 'select':
    			break;
    		case 'dialog':
    			break;
    		default:
    			;
    	}
        return jQuery;
	};
	/**
	 * 打开编辑框
	 */
	this.open = function(editor,editorName,bindElement,closeAction){
		if(!editor)return;
		//关闭当前的编辑器
		this.closeEditor();
		//打开新的编辑器
		//if(editor=='input')editorName='input';
		if(!editors[editor][editorName]){
			_initEditor(editor,editorName,closeAction,bindElement);//初始化编辑器
		}
		if(editors[editor][editorName])editors[editor][editorName].open(bindElement.text(),bindElement,closeAction);//打开编辑器
		this.current = {editor:editor,editorName:editorName};//设置为当前编辑器
		$.ccui.log.info('打开编辑框:'+editor+editorName);
	};
	
	this.closeEditor = function(){
		if(this.current){
			editors[this.current.editor][this.current.editorName]&&editors[this.current.editor][this.current.editorName].close();
		}
	};
	//注册下拉编辑器
	this.registSelect = function(editorName,selectOptions){
		selectOptionsMap[editorName] = selectOptions;
	};
	
	//注册弹出框
	this.registDialog = function(editorName,dialogOptions){
		dialogOptionsMap[editorName] = dialogOptions;
	};
	
	function _initEditor(editor,editorName,closeAction,bindElement){
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
	}
	
    jQuery.ccui.editorFactory = this;
    return jQuery;    
})(jQuery);