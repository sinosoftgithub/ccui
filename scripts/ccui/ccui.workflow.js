 /*
 * TODO
 *  <p>初始化的辅助html的生成</p>
 *  <p>初始化节点和transition的html生成</p>
 *	<p>事件监听</p>
 *  <p>transition上的point的移动过程显示</p>
 *  <p>transition的click状态显示</p>
 *  <p>增加node的resizable</p>
 */
(function($) {
	$.widget("ccui.workflow", $.ui.mouse,{
		GUID:0,
		/**
		 * widget 组件初始化方法
		 */
		_init:function(){
			if(this._commandSupport){this._commandSupport();}
			this.element.addClass('ccui-workflow').css({width:this.options.width,height:this.options.height});
			//this.element.append('<canvas class="main"></canvas><canvas class="helper" ></canvas>');
			
			this.element.disableSelection().selectable({//初始化多选
				cancel:'.point,.node,.transitionName,.select-dragging',
				filter:'.point,.node',
				//appendTo:this.element,
				//tolerance:'fit',
				delay:100,
				start:function(event,ui){
					$('.select-dragging',this).hide();
				},
				stop:function(event,ui){
					$('.select-dragging',this).css({
						left:$('.ui-selectable-helper').offset().left+this.scrollLeft-$(this).offset().left,
						top:$('.ui-selectable-helper').offset().top+this.scrollTop-$(this).offset().top,
						width:$('.ui-selectable-helper').width(),
						height:$('.ui-selectable-helper').innerHeight()
					}).show();
				}
			});
			this.GUID = this.element.find('.node').length;
			this._initCanvaContext();//绘画面板支持
			this._refreshTransitions();
			this._mouseInit();//初始鼠标支持
			this._initAction();
		},
		
		refresh:function(){
			this._refreshTransitions();
		},
		
		_initAction:function(){
			var self = this;
			this.element.bind('click',function(event){
				var clickElement = $(event.srcElement||event.target);
				if(!clickElement.is('.point')&&!clickElement.is('.node')){
					$('.select-dragging',this).hide();//
					$('.ui-selected',this).removeClass('ui-selected');
				}
				if(clickElement.is('.point')){clickElement = clickElement.parent();}//处理point的选中
				self._selected(clickElement,event);
				//
				//$(self.options.popMenu).hide();
			}).bind('mousedown',function(event){
				if(event.button==2||($.browser.msie&&event.button===0)){//第二种情况为maxthon
					var downElement = $(event.srcElement||event.target);
					var type,nodeType,id;
					if(downElement.is('.node')){
						type = 'node';
						id = downElement.attr('id');
						nodeType = downElement[0].className.split(' ')[1];
					}else if(downElement.is('.point')){
						type = 'transition';
						id = downElement.parent().attr('id');
					}else{
						type = 'workflow';
					}
					self._popMenuSupport(event,{id:id,type:type,nodeType:nodeType});
				}else{
					if(self.options.popMenu)$(self.options.popMenu).menu('close');
				}
			}).bind('dblclick',function(){
				
			});
		},
		
		_selected:function(clickElement,event){
			if(clickElement[0]!=$('.click',this.element)[0]){
				var type;
				if(clickElement.hasClass('node')){
					type = 'node';
					if(event&&event.shiftKey===true){
						//画线
						var fromId = $('.click',this.element).attr('id'),
							toId   = clickElement.attr('id'),
							id = this._addTransition(fromId,toId,true,event);
						if($.isFunction(this.options.addTransitionCommand)){
							this.options.addTransitionCommand.apply(this.element[0],[event,{
								fromId:fromId,
								toId:toId,
								id:id
							}]);
						}
					}
					$('.click',this.element).removeClass('click');
					clickElement.addClass('click');
					//清理辅助画图面板
					this._clearCanvasHelper();
				}else if(clickElement.hasClass('transition')){
					type = 'transition';
					$('.click',this.element).removeClass('click');
					clickElement.addClass('click');
					//画click状态的transition
					this._refreshClickTransition();
				}
				//
				if(type){
					this._propertiesSupport(event,{type:type,selectorPath:['#'+clickElement.attr('id')]});
					if(event&&$.isFunction(this.options.onSelect)){
						this.options.onSelect.apply(this.element[0]);
					}
				}
			}
		},
		
		selected:function(id){
			var element = this.element.find('#'+id);
			this._selected(element,null);
		},
		
		_propertiesSupport:function(event,data){
			if(data&&data.type){
				var selectorPath = ['.ccui-workflow#'+this.element.attr('id')].concat(data.selectorPath),
					pElement = this.element.find(data.selectorPath.join(' ')),
					propertyValue = this._getPropertyValue(pElement,data);
				//闭包函数,供属性编辑器中的属性值修改后调用
				function propertyChange(selectorPath){
					return function(property,value){
						//var propertyElement = $(selectorPath.join(' '));
						//调用属性修改的函数
						$(selectorPath[0]).workflow('setProperty',selectorPath.slice(1),property,value,event);
					};
				}
				var editorChange = propertyChange(selectorPath);
				if(this.options.propertyTable){//调用属性编辑器的熟悉填充函数
					$(this.options.propertyTable).propertyTable('fillProperties',propertyValue,editorChange);
				}
			}
		},
		
		_getPropertyValue:function(pElement,data){
			var propertyValue =  {
				id:pElement.attr('id'),
				name:pElement.attr('name')||pElement.attr('id'),
				left:pElement.css('left'),
				top:pElement.css('top')
			};
			
			switch(data.type){
				case 'node':
					var nodeType = pElement[0].className.split(' ')[1];
					$.extend(propertyValue,{
						nodeType:nodeType,
						text:pElement.text()
					});
					break;
				case 'transition':
					$.extend(propertyValue,{
						text:pElement.attr('title')
					});
					break;
				default :
			}
			return propertyValue;
		},
		//属性变化
		setProperty:function(selectorPath,property,value,event){
			var propertyElement  = this.element.find(selectorPath.join(' ')),
				oldValue;
				
			switch(property){
				case 'name':
					oldValue = propertyElement.attr('name')||propertyElement.attr('id');
					propertyElement.attr('name',value);
					break;
				case 'text':
					if(propertyElement.hasClass('transition')){
						oldValue = propertyElement.attr('title');
						propertyElement.attr('title',value);
					}else{
						oldValue = propertyElement.text();
						propertyElement.text(value);
					}
					break;
				case 'left':
					oldValue = propertyElement.css('left');
					propertyElement.css('left',value);
					this._refreshTransitions();
					break;
				case 'top':
					oldValue = propertyElement.css('top');
					propertyElement.css('top',value);
					this._refreshTransitions();
					break;
				default:
					
			}
			if(event&&$.isFunction(this.options.propertyChangeCommand)){
				this.options.propertyChangeCommand.apply(this.element[0],[event,{
					selectorPath:selectorPath,
					oldValue:oldValue,
					property:property,
					value:value
				}]);
			}else{
				//设置
				if(this.options.propertyTable){//调用属性编辑器的熟悉填充函数
					$(this.options.propertyTable).propertyTable('setProperty',property,value);
				}
			}
		},
		
		_popMenuSupport:function(event,data){
			if(this.options.popMenu){
				$(this.options.popMenu).menu('show',event.pageX,event.pageY+5,data);
			}
		},
		
		/**
		 * 初始化canva上下文
		 * this.canvaContext 主上下文
		 */
		_initCanvaContext:function(){
			var main = document.createElement('canvas');
			var helper = document.createElement('canvas');
			this.element.append(main).append(helper);
			
			//ie9以下不支持canvas，要使用excanvas.js
			if($.browser.msie&$.browser.version<9){
				G_vmlCanvasManager.initElement(main);
				G_vmlCanvasManager.initElement(helper);
			}
			
			this.canvasContext = main.getContext('2d');
			this.canvasContextHelper = helper.getContext('2d');
			main = null;
			helper = null;
		},
		/**
		 * 设置canvas的区域
		 */
		_calCanvasRect:function(){
			var domEl = this.element[0];
			var canvasRect = {
				width:domEl.scrollWidth,
				height:domEl.scrollHeight
			};
			if(!$.browser.mise){
				//显示指定canvas的高和宽的属性，防止canvas缩放
				this.element.find('canvas').attr('width',canvasRect.width).attr('height',canvasRect.height);
			}
			this.element.find('canvas,.bg').css(canvasRect);
			return canvasRect;
		},
		/**
		 * 刷新流线条
		 */
		_refreshTransitions:function(){
			var self = this,
				canvasRect = this._calCanvasRect();
			this.canvasContext.clearRect(0,0,canvasRect.width,canvasRect.height);
			var transitionsArgs = [];
			this.element.find('.transition').each(function(){
				transitionsArgs.push(self._getTransitionArgs(this));
			});
			
			drawCanvaTransitions(this.canvasContext,transitionsArgs);
			this._refreshClickTransition();
		},
		
		_refreshClickTransition:function(){
			var transElement = this.element.find('.transition.click');
			if(transElement.length===0){return;}
			this._clearCanvasHelper();
			drawCanvaTransitions(this.canvasContextHelper,[this._getTransitionArgs(transElement)],'red');
		},
		
		_getTransitionArgs:function(transElement){
			transElement = $(transElement);
			var	id	  = transElement.attr('id'),
				fromId=transElement.attr('from'),
				toId  = transElement.attr('to'),
				from  = $('#'+fromId,this.element),
				to 	  = $('#'+toId,this.element),
				g     = [];
			$('.point',transElement).each(function(){
				g.push({
					left:this.offsetLeft+2,
					top :this.offsetTop+2
				});
			});
			
			return {
				id:id,
				text:id,
				fromId:fromId,
				toId:toId,
				startPos:getRectCenterPos(calculatePos(from),from.width(),from.outerHeight()),
				endPos:getRectCenterPos(calculatePos(to),to.width(),to.outerHeight()),
				endRect:{width:to.width(),height:to.outerHeight()},
				g:g
			}
		},
		
		_traceTransition:function(pointDom,pointPos){
			//TODO
		},
		
		_clearCanvasHelper:function(){
			this.canvasContextHelper.clearRect(0,0,$('.bg',this.element).width(),$('.bg',this.element).innerHeight());
		},
		
		/*******************开始节点拖动处理***********************************/
		_mouseStart: function(event) {
			var dragElement = this._getElementFromEvent(event);
			$('.select-dragging',this).hide();//
			
			if(dragElement){
				if(event.ctrlKey){
					$.ccui.log.info(event.ctrlKey);
				}else if(event.shiftKey){
					
				}else{
					this.currentDrag = dragElement;
					this.helper = this._createHelper(event,dragElement);
					this.originalPageX = event.pageX;
					this.originalPageY = event.pageY;
					if(dragElement.is('.ui-selected')){
						this.offsetDragX = event.pageX-this.helper.offset().left;
						this.offsetDragY = event.pageY-this.helper.offset().top;
					}else{
						this.offsetDragX = event.pageX-dragElement.offset().left;
						this.offsetDragY = event.pageY-dragElement.offset().top;
					}
					
					this.originalPosition = this._generatePosition(event);
				}
			}
			return true;
		},
		
		_mouseDrag: function(event) {
			if(this.helper){
				this.position = this._generatePosition(event);
				this.helper.css(this.position);
				if(this.currentDrag.hasClass('point')){
					this._traceTransition(this.currentDrag[0],this.position);
				}
			}
			return false;
		},
		
		_mouseStop: function(event) {
			if(this.helper){
				this.helper.empty().hide();//
				var selectorPath = [];
				if(this.helper.is('.select-dragging')){
					selectorPath.push('.ui-selected');
				}else if(this.currentDrag.hasClass('node')){
					selectorPath.push('#'+this.currentDrag.attr('id'));
				}else if(this.currentDrag.hasClass('point')){
					var ponitId = this.currentDrag.attr('id');
					if(!ponitId){
						ponitId = this.currentDrag.parent().attr('id')+'-p';
						this.currentDrag.attr('id',ponitId);
					}
					selectorPath.push('#'+ponitId);
				}
				
				this._move(selectorPath,this.position,this.originalPosition,event);
				if($.isFunction(this.options.moveCommand)){
					this.options.moveCommand.apply(this.element[0],[event,{
						selectorPath:selectorPath,
						position:this.position,
						originalPosition:this.originalPosition
					}]);
				}
				selectorPath = null;
				this.helper = null;
				this.position = null;
				this.currentDrag = null;
				
				this.offsetDragX = null;
				this.offsetDragY = null;
				this.originalPageX = null;
				this.originalPageY = null;
				this.originalPosition = null;
			}
			return false;
		},
		
		_mouseCapture: function(event) { 
			return true; 
		},
		/**
		 *
		 */
		_move:function(selectorPath,position,originalPosition,event){
			if(selectorPath.length<1)return;
			if(selectorPath=='.ui-selected'||selectorPath[1]=='.ui-selected'){
				var moveX = position.left-originalPosition.left,
					moveY = position.top-originalPosition.top;
				this.element.find(selectorPath[0]).each(function(){
					$(this).css({
						left: this.offsetLeft+moveX,
						top	: this.offsetTop+moveY
					});
				});
				this._refreshTransitions();
			}else{
				this.element.find(selectorPath.join(' ')).css(position);
				this._refreshTransitions();
			}
		},
		
		move:function(selectorPath,position,originalPosition){
			this._move(selectorPath,position,originalPosition);
		},
		
		_getElementFromEvent:function(event){
			return $(event.srcElement||event.target);
		},
		
		_generatePosition:function(event){
			return this._dealwithOutPos({
				left:event.pageX-this.offsetDragX,
				top:event.pageY-this.offsetDragY
			});
		},
		
		_dealwithOutPos:function(pos){
			return {
				left:pos.left-this.element.offset().left+this.element.scrollLeft(),
				top :pos.top-this.element.offset().top+this.element.scrollTop()
			};
		},
		
		_createHelper:function(event,dragElement){
			var helper;
			if(dragElement.is('.node')){
				if(dragElement.is('.ui-selected')){
					helper = this.element.find('>.select-dragging');
					//var helperHtmls = [];//.html(helperHtmls.join(''))
					helper.show();
				}else{
					helper = this.element.find('>.node-dragging').css({width:dragElement.width(),height:dragElement.outerHeight()}).show();
				}
			}else if(dragElement.is('.point')){
				helper = this.element.find('>.point-dragging').show();
			}
			return helper;
		},
		/*******************结束节点拖动处理***********************************/
		/**
		 *
		 */
		addNode:function(id,text,type,pos){
			type = (type)?type:'state';
			//只能有一个start
			if((type=='start'||type=='end')&&this.element.find('.node.'+type).length>0){
				return false;
			}
			if(!id){
				id = type+'-'+this.GUID++;
			}
			pos = $.extend({
				left:20,
				top:100
			},pos);
			
			this.element.append('<div id="'+id+'" class="node '+type+'" style="left:'+pos.left+'px;top:'+pos.top+'px">'+text+'</div>');
			return id;
		},
		
		addNodeTransitions:function(nodeTransitionArgs){
			//画线元素
			var length = nodeTransitionArgs.length,
				nodeTransitionArg,
				id,
				htmls = [];
			for(var i=0;i<length;i++){
				nodeTransitionArg = nodeTransitionArgs[i];
				id = nodeTransitionArg.id;
				htmls.push('<div id="'+id+'" ');
				htmls.push(' from="'+nodeTransitionArg.fromId+'"');
				htmls.push(' to="'+nodeTransitionArg.toId+'"');
				htmls.push('class="transition">');
				$(nodeTransitionArg.g).each(function(i){
					htmls.push('<div id="'+id+'-p'+i+'" class="point" style="left:'+(this.left-2)+'px;top:'+(this.top-2)+'px;"></div>');
				});
				htmls.push('</div>');
				id = null;
				nodeTransitionArg = null;
			}
			this.element.append(htmls.join(''));
			//画线条
			drawCanvaTransitions(this.canvasContext,nodeTransitionArgs);
			this._refreshClickTransition();
		},
		
		removeNode:function(id,type){
			if(id){
				this.element.find('#'+id).remove();
				//删除相关线条
				this.element.find('.transition[from='+id+'],.transition[to='+id+']').remove();
				this._refreshTransitions();
			}
		},
		
		getNodeTransitionArgs:function(nodeId){
			var self = this,
				nodeTransitionArgs = [];
			this.element.find('.transition[from='+nodeId+'],.transition[to='+nodeId+']').each(function(){
				nodeTransitionArgs.push(self._getTransitionArgs($(this)));
			});
			return nodeTransitionArgs;
		},
		
		_addTransition:function(fromId,toId,addPoint,event){
			var id 		= fromId+'-'+toId,
			    from 	= $('#'+fromId,this.element),
				to 	 	= $('#'+toId,this.element),
				htmls 	= [];
			if(from.length==1&&to.length==1&&this.element.find('.transition[from='+fromId+'][to='+toId+']').length==0){
				var fromPos = getRectCenterPos(calculatePos(from),from.width(),from.outerHeight()),
					toPos   = getRectCenterPos(calculatePos(to),to.width(),to.outerHeight()),
					centerLeft = Math.min(toPos.left,fromPos.left)+Math.abs(toPos.left-fromPos.left)/2-2,
					centerTop  = Math.min(toPos.top,fromPos.top)+Math.abs(toPos.top-fromPos.top)/2-2;
				htmls.push('<div id="'+id+'" from="'+fromId+'" to="'+toId+'" class="transition">');
				if(addPoint==true){
					var pointTop,pointLeft;
					if(Math.abs(fromPos.top-toPos.top)>20&&Math.abs(fromPos.left-toPos.left)>20){
						pointTop = toPos.top-2;
						pointLeft = fromPos.left-2;
					}else{
						pointTop = centerTop;
						pointLeft = centerLeft;
					}
					htmls.push('<div id="'+id+'-p0" class="point" style="left:'+pointLeft+'px;top:'+pointTop+'px;"></div>');
				}
				htmls.push('</div>');
				this.element.append(htmls.join(''));
				this._refreshTransitions();
				return id;
			}else{
				return false;
			}
		},
		
		addTransition:function(fromId,toId){
			return this._addTransition(fromId,toId,true);
		},
		
		removeTransition:function(fromId,toId){
			this.element.find('.transition[from='+fromId+'][to='+toId+']').remove();
			this._refreshTransitions();
		},
		
		removeTransitionById:function(id){
			this.element.find('#'+id).remove();
			this._refreshTransitions();
		},
		/**
		 * 激活时调用的方法
		 */
		active:function(event){
			if($.browser.msie){
				this._refreshTransitions();
			}
			var clickElement = this.element.find('.click');
			if(clickElement.length>0){
				var type = clickElement.hasClass('node')?clickElement[0].className.split(' ')[1]:'transition';
				this._propertiesSupport(event,{type:type,selectorPath:['#'+clickElement.attr('id')]});
			}
		},
		
		_doSave:function(afterSave){
			//执行保存的操作，使用了ajax时，需要在使函数返回值为false 在ajax回调函数中执行afterSave
			return true;
		},
		_getCopyData:function(){
			var clickElement = this.element.find('.click');
			if(clickElement.length>0){
				
			}
			//,
			//	id = clickElement.attr('id'),
			//	element = $('<div></div>').append(clickElement.clone().attr('id',id+'-copy'));//.appendTo(this.element),
			//	copyData = element.html();
			
			//element.remove();
			//alert(copyData);
			return copyData;
		},
		
		_doCopy:function(){
			
			
		},
		_doPaste:function(clipboardData){
			
		},
		/**
		 * 注销
		 */
		destory:function(){
			//TODO
			this.canvasContext = null;
			this.canvasContextHelper = null;
			$.widget.prototype.destory.apply(this);
		}
	});
	
	//$.extend($ccui.workflow,$.ccui.EditorPart);
	$.extend($.ccui.workflow,{
		defaults:{
			width:800,
			height:500,
			distance: 1,
			delay:100,
			appendTo:'parent'
		},
		commandsCallBack:[
			{name:'propertyChangeCommand',command:'setProperty'},
			{name:'moveCommand',command:'move'},
			{name:'addTransitionCommand',command:'addTransition'}
		],
		getter:['addNode','addTransition','getNodeTransitionArgs','getCommandCallbacks','getCommands','getUndoCommands']
	});
	//计算定位
	function calculatePos(element){
		var offsetParent = element.offsetParent(),
			pos = element.offset();
		//alert(offsetParent.attr('id'));
		return {
			left:pos.left-offsetParent.offset().left+offsetParent.scrollLeft(),
			top :pos.top-offsetParent.offset().top+offsetParent.scrollTop()
		};
	}
	//获得区域的中心位置
	function getRectCenterPos(pos,width,height){
		return {
			left:pos.left+width/2,
			top :pos.top+height/2
		};
	}
	//画流程线集合
	function drawCanvaTransitions(context,transitionsArgs,color){
		$.ccui.time.start();
		context.beginPath();
		if(color)context.strokeStyle = color;
		$(transitionsArgs).each(function(){
			_drawCanvaTransition(context,this.startPos,this.endPos,this.endRect,this.g);
		});
		context.stroke();
		$.ccui.time.end('画线');
	}
	//画直线
	function _drawStraightLine(context,startPos,endPos){
		context.moveTo(startPos.left,startPos.top);
		context.lineTo(endPos.left,endPos.top);
	}
	//画流程线
	function _drawCanvaTransition(context,startPos,endPos,endRect,g){
		if(g&&g.length>0){//有拐点
			for(var i=0;i<g.length;i++){
				_drawStraightLine(context,startPos,g[i]);
				startPos = g[i];
			}
		}
		
		_drawStraightLine(context,startPos,endPos);
		
		var r = 5/Math.sin(30*Math.PI/180);
		//计算正切角度
		var tag = (endPos.top-startPos.top)/(endPos.left-startPos.left);
		tag = isNaN(tag)?0:tag;
		
		var o = Math.atan(tag)/(Math.PI/180)-30;//计算角度
		var rectTag = endRect.height/endRect.width;
		//计算箭头位置
		var xFlag = startPos.top<endPos.top?-1:1,
			yFlag = startPos.left<endPos.left?-1:1,
			arrowTop,
			arrowLeft;
		//按角度判断箭头位置
		if(Math.abs(tag)>rectTag&&xFlag==-1){//top边
			arrowTop  = endPos.top-endRect.height/2;
			arrowLeft = endPos.left+xFlag*endRect.height/2/tag;
		}else if(Math.abs(tag)>rectTag&&xFlag==1){//bottom边
			arrowTop  = endPos.top+endRect.height/2;
			arrowLeft = endPos.left+xFlag*endRect.height/2/tag;
		}else if(Math.abs(tag)<rectTag&&yFlag==-1){//left边
			arrowTop  = endPos.top+yFlag*endRect.width/2*tag;
			arrowLeft = endPos.left-endRect.width/2;
		}else if(Math.abs(tag)<rectTag&&yFlag==1){//right边
			arrowTop  = endPos.top+endRect.width/2*tag;
			arrowLeft = endPos.left+endRect.width/2;
		}
		
		if(arrowLeft&&arrowTop){
			//计算低位偏移
			var lowDeltX = r*Math.cos(o*Math.PI/180);
			var lowDeltY = r*Math.sin(o*Math.PI/180);
			//计算高位偏移
			var o = 90-o-60;//计算角度
			var highDeltX = r*Math.sin(o*Math.PI/180);
			var highDeltY = r*Math.cos(o*Math.PI/180);
			var flag = 1;
			if(startPos.left>endPos.left){
				flag = -1;
			}
			//画箭头
			context.moveTo(arrowLeft,arrowTop);
			context.lineTo(arrowLeft-lowDeltX*flag,arrowTop-lowDeltY*flag);
			context.moveTo(arrowLeft,arrowTop);
			context.lineTo(arrowLeft-highDeltX*flag,arrowTop-highDeltY*flag);
		}
	}
})(jQuery);