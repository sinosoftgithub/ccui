(function($) {
	$.widget("ccui.toolbar", {
				_init : function() {
					this.element.addClass('ccui-toolbar').disableSelection();
					this._initAction()
				},
				_initAction : function() {
					var p = this;
					this.element.bind('click', function(a) {
								var b = $(a.srcElement || a.target);
								if (b.hasClass('disabled')) {
									return
								}
								if (b.hasClass('toolbarItem')) {
									var c = b.attr('command'), action = b
											.attr('action');
									if ($.isFunction(p.options.command)) {
										p.options.command.apply(this, [a, {
															command : c
														}])
									}
									if (action && $.actionFactory) {
										$.actionFactory.execute(action)
									}
								}
							})
				},
				active : function(a) {
					if (!a) {
						return
					}
					for (var i = 0; i < a.length; i++) {
						this.element.find('li.disabled#' + a[i])
								.removeClass('disabled')
					}
				},
				disable : function(a) {
					if (!a) {
						return
					}
					for (var i = 0; i < a.length; i++) {
						this.element.find('li.toolbarItem#' + a[i])
								.addClass('disabled')
					}
				},
				destroy : function() {
				}
			})
})(jQuery);