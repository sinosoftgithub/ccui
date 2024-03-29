(function($) {
	$.widget("ccui.propertyTable",{
		
		options:{
		},
		
		_init:function(){
			var self = this;
			this.element.addClass('ccui-propertyTable disabled');
			this._initAction();
			this.element.find('li').each(function(){
				var propertyName = this.firstChild.nodeValue;
				this.firstChild.nodeValue = '';//清空文本值
				$(this).prepend('<table width="100%" cellspacing="0" cellspadding="0"><tr><td class="name '+this.className+'">'+propertyName+'</td><td class="value">&nbsp;</td></tr></table>');
			});
			
			$('body',document).click(function(){
				if(self.currentFieldEditor){
					if(self.currentFieldEditor.fieldEditor){
				self.currentFieldEditor.fieldEditor('destroy');
				self.currentFieldEditor = {};
			}
			}
			});
		},
		
		_initAction:function(){
			var self = this;
			this.element.bind('click',function(event){
				if($(this).hasClass('disabled')){
					return;
				}
				if(self.currentFieldEditor){
					if(self.currentFieldEditor.fieldEditor){
				self.currentFieldEditor.fieldEditor('destroy');
				self.currentFieldEditor = {};
			}
			}
				var clickElement = $(event.srcElement||event.target);
				if(clickElement.is('.propertyGroup')){
					clickElement.toggleClass('expanded');
					clickElement.parents('li.propertyGroup').toggleClass('expanded');
				}else if(clickElement.is('.value')){
					var propertyElement = clickElement.parents('li.property'),
						editor = propertyElement.attr('editor'),
						id = propertyElement.attr('id'),
						editorName = propertyElement.attr('editorName')||id;
					clickElement.fieldEditor();
					clickElement.fieldEditor('open',editor,editorName,clickElement,self.editorChange);
					self.currentFieldEditor = clickElement;
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
		}
		
	});
})(jQuery);
