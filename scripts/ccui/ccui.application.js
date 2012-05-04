(function($) {
	$.widget("ccui.application", {
				_init : function() {
					this.commands = [];
					this.undoCommands = [];
					this.registedCommands = [];
					this.element.addClass('ccui-application');
					this._defaultHtml()
				},
				_defaultHtml : function() {
				},
				executeCommand : function(a, b) {
					if (a == 'redo' || a == 'undo') {
						this[a]();
						if ($.isFunction(this.options.afterCommand)) {
							this.options.afterCommand.apply(this.element[0])
						}
						return
					}
					if (typeof(a) == 'string' && this.registedCommands[a]) {
						b = $.extend({}, a.defaults, b);
						a = $.extend({
									options : b
								}, this.registedCommands[a]);
						this.commands.push(a);
						var c = this.exec();
						if (c !== null && c === false) {
							this.commands.pop()
						} else {
							this.undoCommands = [];
							if ($.isFunction(this.options.afterCommand)) {
								this.options.afterCommand
										.apply(this.element[0])
							}
						}
					}
				},
				exec : function(a) {
					if (this.commands.length > 0) {
						var b = this.commands[this.commands.length - 1], execReturn = b
								.exec(a);
						$.ccui.log.info('执行动作：' + b.getTitle());
						return execReturn
					}
				},
				undo : function() {
					if (this.commands.length > 0) {
						var a = this.commands.pop();
						a.undo();
						this.undoCommands.push(a);
						$.ccui.log.info('撤销动作：' + a.getTitle())
					}
				},
				redo : function() {
					if (this.undoCommands.length > 0) {
						var a = this.undoCommands.pop();
						this.commands.push(a);
						this.exec(true);
						$.ccui.log.info('重做动作：' + a.getTitle())
					}
				},
				registerCommand : function(a, b) {
					this.registedCommands[a] = b
				},
				getCommands : function() {
					return [].concat(this.commands)
				},
				getUndoCommands : function() {
					return [].concat(this.undoCommands)
				},
				destroy : function() {
				}
			});
	$.extend($.ccui.application, {
				defaults : {
					menu : '',
					toolbar : '',
					propertyTable : '',
					type : ''
				},
				getter : ['getCommands', 'getUndoCommands']
			})
})(jQuery);
(function(e) {
	this.version = '(beta)(0.0.1)';
	this.actions = [];
	this.register = function(b, c, d) {
		if (e.isFunction(c)) {
			d = c;
			c = {}
		}
		this.actions[b] = function(a) {
			d.apply(this, [a])
		};
		return e
	};
	this.execute = function(a, b) {
		this.actions[a](b)
	};
	this.remove = function(a) {
		return e
	};
	e.actionFactory = this;
	return e
})(jQuery);