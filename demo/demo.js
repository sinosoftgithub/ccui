$(function(){
	//$.ccui._is_debug=true;
	//初始化工作流核心组件
	$('#editor-workflow').workflow({
		propertyTable:'#application-propertyTable',
		onSelect:function(){//监听选择节点的函数
			var id = $('.click',this).attr('id');
			$('#tree-workflow-element').tree('selectedById',id);
		},
		propertyChangeCommand:function(event,ui){//监听属性发生变化的函数
			$('body',document).application('executeCommand','setProperty',$.extend({
				event:event
			},ui));
		},
		moveCommand:function(event,ui){
			$('body',document).application('executeCommand','move',$.extend({
				event:event
			},ui));
		},//集成鼠标动作的move命令
		addTransitionCommand:function(event,ui){
			$('body',document).application('executeCommand','addTransition',$.extend({
				event:event
			},ui));
		}//集成鼠标动作的addTransition命令
	});
	//ie和chrome需要手动延时刷新线条
	if($.browser.msie||/chrome/.test(navigator.userAgent.toLowerCase())){
		window.setTimeout(function(){
			$('#editor-workflow').workflow('refresh');
		},100);
	}
	//初始化属性表格
	$('#application-propertyTable').propertyTable({
	});
	
	//初始化属性编辑器
	//$('body').fieldEditor({
	//});
	
	$('#application-layout').layout({
		appendTo:'body',
		panes:[{
			region:'north',
			height:'65',
			split:true
		},{
			region:'west',
			width:'200',
			split:true
		},{
			region:'center'
		},{
			region:'east',
			width:'225',
			split:true
		},{
			region:'south',
			height:'30',
			split:true
		}],
		onResize:function(width,height){
			$('#editor-workflow,#editor-workflow .bg').css({width:(width-6),height:(height-6)});
			$('#editor-workflow').click();
		}
	});
	
	//初始化application组件
	$('body',document).application({
		afterCommand:function(){
			var commands 	 = $(this).application('getCommands'),
				undoCommands = $(this).application('getUndoCommands'),
				actives = [],
				disables = [];
			if(commands.length>0){
				actives.push('undo');
			}else{
				disables.push('undo');
			}
			
			if(undoCommands.length>0){
				actives.push('redo');
			}else{
				disables.push('redo');
			}
			actives.push('save');//
			activesAndDisables(actives,disables);
		}
	})//初始化Application
	//注册application 的 addNode 命令
	.application('registerCommand','addNode',{
		getTitle:function(){
			return 'ADD NODE:'+this.options.type;
		},
		exec:function(){
			//执行的动作
			var nodeId;
			nodeId = $('#editor-workflow').workflow('addNode',this.options.id,this.options.text,this.options.type,this.options.offset);
			if(!nodeId){
				return false;//执行动作不成功返回false
			}
			//增加树节点 addNode:function(id,text,type,record)
			
			$('#tree-workflow-element').tree('addNodeChild','node',{
				id:nodeId,
				text:nodeId,
				iconClass:this.options.type
			});
			if(!this.options.id){
				this.options.id = nodeId;
			}
		},
		undo:function(){
			//撤销的动作
			$('#editor-workflow').workflow('removeNode',this.options.id);
			//删除树中的节点
			$('#tree-workflow-element').tree('removeNode',this.options.id);
		},
		defaults:{
			text:'新增',
			offset:{left:340,top:89}
		}
	//注册application 的 move 命令
	}).application('registerCommand','move',{
		getTitle:function(){
			return '移动元素';
		},
		exec:function(isRedo){
			//执行的动作
			var o = this.options;
			if(o.event){//事件驱动的动作,不重复执行操作。
				o.event = null;
				if(o.selectorPath[0]=='.ui-selected'){//
					var selectorPath=[],
						moveElements = [];
					$('#editor-workflow').find(o.selectorPath.join(' ')).each(function(){
						moveElements.push('#'+this.getAttribute('id'));
					});
					selectorPath.push(moveElements.join());
					selectorPath.push('.ui-selected');
					o.selectorPath = selectorPath;
				}
			}else{
				$('#editor-workflow').workflow('move',o.selectorPath,o.position,o.originalPosition);
			}
		},
		undo:function(){
			var o = this.options;
			$('#editor-workflow').workflow('move',o.selectorPath,o.originalPosition,o.position);
		}
	//注册application 的 addTransition 命令
	}).application('registerCommand','addTransition',{
		getTitle:function(){
			return '新增连线';
		},
		exec:function(){
			var o = this.options;
			if(o.event){//事件驱动的动作,不重复执行操作。
				o.event = null;
			}else{
				this.options.id = $('#editor-workflow').workflow('addTransition',o.fromId,o.toId);
			}
			if(!this.options.id){//事件驱动中id也放置在options中了
				return false;
			}
			
			var transitionId = o.fromId+'-'+o.toId;
			$('#tree-workflow-element').tree('addNodeChild','transition',{
				id:transitionId,
				text:transitionId,
				iconClass:'transition'
			});
		},
		undo:function(){
			var o = this.options;
			$('#editor-workflow').workflow('removeTransition',o.fromId,o.toId);
			
			var transitionId = o.fromId+'-'+o.toId;
			$('#tree-workflow-element').tree('removeNode',transitionId);
		}
	}).application('registerCommand','setProperty',{
		getTitle:function(){
			return '设置属性'+this.options.property;
		},
		exec:function(){
			var o = this.options;
			if(o.value==o.oldValue)return false;
			if(o.event){//事件驱动的动作,不重复执行操作。
				o.event = null;
			}else{
				$('#editor-workflow').workflow('setProperty',o.selectorPath,o.property,o.value);
			}
			if(o.property=='text'){
				//设置树上的文本
				$('#tree-workflow-element').tree('setNodeText',o.selectorPath[0],o.value);
			}
		},
		undo:function(){
			var o = this.options;
			$('#editor-workflow').workflow('setProperty',o.selectorPath,o.property,o.oldValue);
			if(o.property=='text'){
				$('#tree-workflow-element').tree('setNodeText',o.selectorPath[0],o.oldValue);
			}
		}
	});
	//初始化menu
	$('#application-menu').menu({
		command:function(event,ui){
			$('body',document).application('executeCommand',ui.command);
			//处理菜单的一些可操作性
		}
	});
	//初始化toolbar
	$('#application-toolbar').toolbar({
		command:function(event,ui){
			$('body',document).application('executeCommand',ui.command);
		}
	});
	//初始化palette
	$('#application-palette').palette({
		drop:function(event,ui){
			var offset = {
					left:event.pageX-ui.drop.offset().left+ui.drop.scrollLeft(),
					top:event.pageY-ui.drop.offset().top+ui.drop.scrollTop()
				},
				text = ui.text;
			$('body',document).application('executeCommand','addNode',{text:text,offset:offset,type:text});
		}
	});
	//初始化帮助弹出框
	$('#dialog-help').dialog({
		autoOpen:false,
		buttons:{
			'关闭':function(){
				$(this).dialog('close');
			}
		}
	});
	//action 注册
	//打开帮助窗口
	$.actionFactory.register('help',function(){
		$('#dialog-help').dialog('open');
	});
	
	$.actionFactory.register('save',function(){
		//保存的动作
		activesAndDisables(null,['save']);
	});//
	//显示/隐藏palette
	$.actionFactory.register('showPalette',function(options){
		if(options.ok){
			$('#application-palette').show();
		}else{
			$('#application-palette').hide();
		}
	});
	
	/****************************其他函数*****************************************/
	//菜单和工具栏的active和disable
	function activesAndDisables(actives,disables){
		$('#application-menu').menu('active',actives).menu('disable',disables);
		$('#application-toolbar').toolbar('active',actives).toolbar('disable',disables);
	}
	initWorkElementsTree();
	function initWorkElementsTree(){
		var nodesHtmls = ['<ul>'];
		$('#editor-workflow .node').each(function(){
			var id = this.getAttribute('id');
			nodesHtmls.push('<li class="treeNode '+this.className.split(' ')[1]+'" id="'+id+'"><span><a href="#">'+($(this).text()||id)+'</a></span></li>');
		});
		nodesHtmls.push('</ul>');
		$('#tree-workflow-element #node').append(nodesHtmls.join(''));
		
		var transHtmls = ['<ul>'];
		$('#editor-workflow .transition').each(function(){
			var id = this.getAttribute('id');
			transHtmls.push('<li class="treeNode transition" id="'+id+'"><span><a href="#">'+(id)+'</a></span></li>');
		});
		transHtmls.push('</ul>');
		$('#tree-workflow-element #transition').append(transHtmls.join(''));
		//
		$('#tree-workflow-element').tree({
			onSelect:function(ui){
				var id = $('.treeNode.selected').attr('id');
				$('#editor-workflow').workflow('selected',id);
			}
		});//.tree('expandAll');
	}
});