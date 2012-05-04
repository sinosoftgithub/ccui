(function($) {
	$.widget("ccui.menu",{
		popOptions:{},
		_init:function(){
			this.element.addClass('ccui-menu').disableSelection();
			if(this.options.isPop){
				this.element.addClass('pop');
			}
			var p = this;
			if(this.options.src){
				p._loadHtml();
			}else{
				p._initMenu();
			}
			
			$('body',document).bind('click',function(){
				$('.ccui-menu .expanded').removeClass('expanded');
				$('.ccui-menu.pop').hide();
			});
		},
		
		_loadHtml:function(){
			var p = this;
			this.element.load(this.options.src,function(){
				p._initMenu();
			});
		},
		
		_initMenu:function(){
			$.ccui.time.start();
			var p = this;
			
			this.element.bind('click',function(event){
				var target = $(event.target||event.srcElement);
				var clickLi = target.parents('li:first');
				if(clickLi.hasClass('disabled')){return false;}
				
				if(clickLi.hasClass('v-menuBar')){//垂直菜单栏
					$('li.expanded',this).not(clickLi).removeClass('expanded');
					clickLi.toggleClass('expanded');
				}else if(clickLi.hasClass('menuBar')){
					$('li.expanded',this).not(clickLi).removeClass('expanded');
					clickLi.toggleClass('expanded');
				}else if(clickLi.hasClass('menuItem')){//执行动作
					//
					var command = clickLi.attr('command'),
						action  = clickLi.attr('action'),
						checkOk;
					if(clickLi.hasClass('check')){
						clickLi.toggleClass('ok');
					}
					if(command&&$.isFunction(p.options.command)){
						p.options.command.apply(this,[event,$.extend({
							command:command
						},p.popOptions)]);
					}
					
					if(action&&$.actionFactory){
						$.actionFactory.execute(action,{ok:clickLi.hasClass('ok')});
					}
					//关闭ui
					if(!clickLi.hasClass('expandable')){
						if($(this).hasClass('pop')){//弹出菜单
							$(this).hide();
						}else{
							clickLi.parents('li.expanded').removeClass('expanded');
						}
					}
				}
				
				clickLi = null;
				return false;
			}).bind('mouseover',function(event){
				var target = $(event.target||event.srcElement);
				var overLi = target.parents('li:first');
				if(overLi.hasClass('menuBar')){
					var openLi = $('.menuBar.expanded',this).removeClass('expanded');
					if(openLi.length>0){
						overLi.addClass('expanded');
						overLi.focus();
					}
				}else if(overLi.hasClass('menuItem')){
					overLi.parent().find('>li.expanded').not(overLi).removeClass('expanded');
					if(overLi.hasClass('expandable')){
						overLi.addClass('expanded');
						var top = overLi.offset().top-overLi.offsetParent().offset().top-5,
							left = overLi.offset().left+overLi.width()-overLi.offsetParent().offset().left-5;
						overLi.find('>ul').css({
							left:left,
							top:top
						});
					}
				}
			});
			$.ccui.time.end('初始化菜单耗时');
		},
		/**
		 * 显示弹出菜单
		 */
		show:function(x,y,options){
			var group = options.type;
			if(group){
				this.element.find('li.menuItem,li.split').hide();
				this.element.find('.'+group).show();
			}
			this.popOptions = $.extend({},options);
			this.element.css({left:x+'px',top:y+'px'}).show();
		},
		/**
		 * 关闭弹出菜单
		 */
		close:function(){
			this.element.hide();
			this.popOptions = null;
		},
		
		active:function(actives){
			if(!actives){return;}
			for(var i=0;i<actives.length;i++){
				this.element.find('li.disabled#'+actives[i]).removeClass('disabled');
			}
		},
		
		disable:function(disables){
			if(!disables){return;}
			for(var i=0;i<disables.length;i++){
				this.element.find('li.menuItem#'+disables[i]).addClass('disabled');
			}
		}
	});
	
	$.extend($.ccui.menu,{
		defaults:{
			isPop:false
		}
	});
	
})(jQuery);