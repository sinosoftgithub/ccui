;
(function($) {
	$.ccui = {
		version : 1.0,
		_is_debug : false,
		log : {
			info : function(a) {
				$.ccui.log._append('info', a)
			},
			error : function(a) {
				$.ccui.log._append('error', a)
			},
			_append : function(a, b) {
				if ($.ccui._is_debug == false)
					return;
				var c = $('#ccui-out');
				if (c.length == 0) {
					c = $('<div id="ccui-out"/>').appendTo($('body', document))
							.dialog({
										title : 'ˤ³�¢',
										width : 500,
										height : 300
									})
				}
				var d = c.children().length + 1;
				$('<div class="out-item ' + a + '">[' + a + '-' + d + ']' + b
						+ '</div>').prependTo(c)[0];
				if (d > 100) {
					$(c.find('div:last')).remove()
				}
			}
		},
		resource : {},
		serverConfig : {
			contextPath : '',
			path : '',
			convertArray : []
		},
		datasParse : function(a) {
			var b = a;
			if (b.message) {
				alert(b.code)
			}
			return b
		},
		propertyPassed : function(a) {
			return true
		},
		getProperty : function(a, b) {
			var c = a, properties = b.split(/\./);
			for (var i = 0; i < properties.length; i++) {
				c = c[properties[i]]
			}
			return c
		},
		getPropertyParamter : function(a, b) {
			var c = [];
			var d = [];
			if (typeof(b) == 'string') {
				d.push(b)
			} else if (typeof(b) == 'object' && b.length) {
				d = b
			}
			for (var i = 0; i < d.length; i++) {
				c.push('&');
				c.push($.ccui.connectKeyValue('property:' + a, d[i]))
			}
			if (c.length == 0)
				return '';
			return c.slice(1).join('')
		},
		addUrlPropertyParameter : function(a, b, c) {
			return $.ccui.addUrlParameter(a, 'property:' + b, c)
		},
		addUrlParameter : function(a, b, c) {
			if (b && c != null) {
				if (a.indexOf('?') == -1) {
					a += '?'
				} else {
					a += '&'
				}
				a += (b + '=' + encodeURIComponent(c))
			}
			return a
		},
		connectKeyValue : function(a, b) {
			var c = '';
			if (a && b) {
				c = (a + '=' + encodeURIComponent(b))
			}
			return c
		},
		ajax : function(b, c) {
			c = (c || $.browser.msie) ? true : false;
			if (c && b.url) {
				b.url = $.ccui.addUrlParameter(b.url, 'ccui-timeStamp',
						(new Date()).getTime())
			}
			if ($.ccui.serverConfig.contextPath) {
				b.url = $.ccui.serverConfig.contextPath + '/' + b.url
			}
			$.ccui.log.info(b.url);
			$.ajax($.extend({}, {
				dataType : 'json',
				contentType : 'application/x-www-form-urlencoded;charset=UTF-8',
				error : function(a) {
					$.ccui.log.error('µٖ·¡¾' + this.url + '¡¿·Ď˒쳣')
				}
			}, b))
		},
		time : {
			startTimes : [],
			start : function() {
				this.startTimes.push(new Date().getTime())
			},
			end : function(a) {
				a = (a + 'ºŊ±£º') || '';
				var b = this.startTimes.pop();
				if (b) {
					var c = new Date().getTime();
					$.ccui.log.info(a + (c - b) + 'ms')
				}
			}
		},
		baseWidget : {
			_init : function() {
				this._before();
				this._initWidget();
				this._after()
			},
			_before : function() {
			},
			_initWidget : function() {
			},
			_after : function() {
			},
			_fillInitHtml : function(a) {
				this.element.empty().html(a)
			}
		}
	};
	$.widget("ccui.panel", {
		uuid : 0,
		_init : function() {
			this.id = 'C-'
					+ (this.element.attr('id') || ('ccui-panel-' + this.uuid++));
			if (this.options.initHtml == true) {
				var a = document.createElement('div');
				a.setAttribute('id', this.id);
				this.element.before(a);
				this._html(a);
				a = null
			}
			$('#' + this.id).width(this.options.width).addClass('ccui-panel');
			this.createHeader();
			this.createCenter();
			this.createFooter();
			if (jQuery.isFunction(this.options.after)) {
				this.options.after.apply()
			}
		},
		_html : function(a) {
			a.innerHTML = ('<div class="ccui-panel-tl"><div class="ccui-panel-tr"><div class="ccui-panel-tc"><div class="ccui-panel-header ccui-unselectable" style="-moz-user-select: none;"><span class="ccui-panel-header-text"></span><span class="message"></span></div></div></div></div><div class="ccui-panel-bwrap"><div class="ccui-panel-ml"><div class="ccui-panel-mr"><div class="ccui-panel-mc"><div class="ccui-panel-body"></div></div></div></div></div><div class="ccui-panel-bl"><div class="ccui-panel-br"><div class="ccui-panel-bc"><div align="center" class="ccui-panel-footer"></div></div></div></div>');
			a = null
		},
		createHeader : function() {
			var b = this, panelId = this.id;
			$('#' + panelId).find('.ccui-panel-header-text')
					.text(this.options.caption || '');
			if (this.options.minimize == true) {
				var c = $('<div class="ccui-panel-minimize"/>');
				$('#' + panelId).find('.ccui-panel-header').click(function() {
					if ($(this).find('.ccui-panel-minimize:first')
							.toggleClass('max').is('.max')) {
						var a = ($('#' + panelId).innerHeight() - this.offsetHeight)
								* -1;
						$('#' + panelId).find('.ccui-panel-bwrap:first').hide();
						$('#' + panelId).find('.ccui-panel-bl:first').hide()
					} else {
						$('#' + panelId).find('.ccui-panel-bwrap:first').show();
						$('#' + panelId).find('.ccui-panel-bl:first').show();
						var a = $('#' + panelId).innerHeight()
								- this.offsetHeight
					}
					if ($.isFunction(b.options.afterMinimize)) {
						b.options.afterMinimize(a)
					}
				})
			}
		},
		createCenter : function() {
			$('#' + this.id + ' .ccui-panel-body:first').append(this.element)
		},
		createFooter : function() {
			var a = this.options.buttons;
			if (!a) {
				return
			}
			for (var b in a) {
				this.addButton(b, a[b])
			}
		},
		addButton : function(a, b) {
			var c = this;
			if ($.isFunction(b)) {
				var d = $('<input class="ccui-button" type="button" value="'
						+ a + '"/>').click(function() {
							b()
						});
				$('#' + this.id + ' .ccui-panel-footer').append(d);
				d = null
			}
		},
		destroy : function() {
			var a = $('#' + this.id), help = $('<div class="p"/>');
			a.before(help);
			help.before(this.element);
			help.remove();
			a.remove();
			this.element.removeClass('ccui-panel');
			this.element.removeData('panel');
			a = null;
			help = null
		},
		title : function(a, b) {
			var c = $('#' + this.id + ' .ccui-panel-header-text:first');
			if (a) {
				c.html(a)
			} else {
				if (b) {
					var d = c.html().replace(b, '');
					c.html(d)
				}
			}
			c = null
		},
		showMessage : function(a) {
			if (a)
				a = "--" + a;
			$('#' + this.id + ' .ccui-panel-header .message:first').html(a)
		},
		width : function(a) {
			this.element.width(a);
			$('#' + this.id).width(a)
		}
	});
	$.extend($.ccui.panel, {
				defaults : {
					initHtml : true,
					width : '100%'
				}
			});
	$.widget("ccui.lazyLoad", {
		_init : function() {
			this.execute()
		},
		execute : function() {
			this.showLoading();
			function load(a, b) {
				return (function() {
					b.execute.apply(a[0]);
					a.lazyLoad('hideLoading')
				})
			}
			var c = load(this.element, this.options);
			window.setTimeout(c, this.options.lazyTime)
		},
		showLoading : function() {
			this.element.addClass('loading');
			var a = this._getLoadCoverHelper();
			var b = this.options.height || this.element.outerHeight() || 200;
			a.find('span:first').html(this.options.message);
			a.css({
						width : this.element.width(),
						height : b,
						left : this.element.position().left,
						top : this.element.position().top
					}).show()
		},
		hideLoading : function() {
			this.element.removeClass('loading');
			this._getLoadCoverHelper().remove()
		},
		_getLoadCoverHelper : function() {
			var a = 'ccui-loadCover' + this.element.attr('id');
			var b = $('#' + a);
			if (b.length == 0) {
				b = $('<div class="ccui-loadCover" id="'
						+ a
						+ '" style="position:absolute;border:1pt solid silver;"><span></span>¼Ԕٖή..</div>')
						.appendTo(this.element.parent())
			}
			return b
		}
	});
	$.extend($.ccui.lazyLoad, {
				defaults : {
					lazyTime : 0,
					message : '',
					execute : function() {
					}
				}
			})
})(jQuery);
(function($) {
	var q = {
		field_prefix : 'field-',
		field_desc_prefix : 'field-desc-',
		noRealization : '\u5b50\u7c7b\u672a\u5b9e\u73b0\u8be5\u65b9\u6cd5'
	};
	var r = $.ccui.log;
	$.widget("ccui.fieldLayout", {
		_init : function() {
			this.element.addClass('ccui-fieldLayout').width(this.options.width);
			this._initFields()
		},
		_initFields : function() {
			var p = this, fields = this.options.fields;
			if (!$.isArray(fields))
				return;
			var i = this.options.columns, rows = fields.length / i, filterTable = document
					.createElement('table');
			filterTable.width = this.options.width;
			filterTable.tablelayout = 'fixed';
			filterTable.border = 0;
			filterTable.cellSpacing = this.options.showBorder ? 1 : 0;
			filterTable.cellPadding = 0;
			filterTable.bgColor = '#99BBE8';
			var j = (this.options.description == 'show') ? 3 : 2;
			var k = i * j;
			this.element.append(filterTable);
			var l = 0;
			$(fields).each(function(a) {
				var b = $.extend({
					id : p.options.prefix + this.property,
					popDescription : (p.options.description == 'pop')
							? true
							: false,
					type : 'fieldText',
					nextField : ((a < fields.length - 1) && fields[a + 1].type != 'fieldHidden')
							? p.options.prefix + fields[a + 1].property
							: false,
					prevField : (a > 0 && fields[a - 1].type != 'fieldHidden')
							? p.options.prefix + fields[a - 1].property
							: false,
					column : 1
				}, this);
				if (b.parentField) {
					b.parentField = p.options.prefix + b.parentField
				}
				var c = $('<div></div>')[b.type](b), column = Math.min(
						b.column, i);
				if (b.type == 'fieldHidden') {
					p.element.append(c)
				} else {
					l = l + column * j;
					var d = Math.ceil(l / k) - 1;
					if (d > 0) {
						var e = filterTable.rows[d - 1];
						var f = e.cells.length;
						if (f < k) {
							appendTds(e, -f);
							l += (k - f) / j
						}
					}
					if (d >= filterTable.rows.length) {
						filterTable.insertRow(d)
					}
					var g = column * j - 1;
					var h = $(filterTable.rows[d])
							.append('<td class="field-label" width="10%" nowrap="nowrap" valign="top"><label for="v-'
									+ b.id
									+ '" class="caption '
									+ (b.readonly ? 'readonly' : '')
									+ ' '
									+ (b.notNull ? 'notNull' : '')
									+ '">'
									+ this.caption
									+ '£º</label></td><td id="field-'
									+ l
									+ '" class="field-content" valign="middle" colspan="'
									+ g + '"/>');
					h.find('>td#field-' + l).append(c);
					if (p.options.description == 'show') {
						h.append('<td class="field-desc" valign="middle" >'
								+ (b.description || '') + '</td>')
					}
					if (g > 1) {
						appendTds(h, g - 1, true)
					}
				}
				c = null
			});
			var m = $(filterTable.rows[filterTable.rows.length - 1]);
			var n = k - m.find('td').length;
			if (n > 0) {
				m.append('<td colspan="' + n + '"/>')
			}
			filterTable = null
		},
		fieldValue : function(a, b, c) {
			return this.element.find('#' + this.options.prefix + a).fieldValue(
					b, c)
		},
		fillFields : function(b) {
			var p = this;
			this.reset();
			this.element.find('.ccui-field').each(function() {
				var a = this.getAttribute('id')
						.substring(p.options.prefix.length).split(/\./);
				if (a.length > 1) {
					value = b;
					for (var i = 0; i < a.length; i++) {
						value = value[a[i]];
						if (value == null)
							break
					}
				} else {
					value = b[a[0]]
				}
				if (value != null)
					$(this).fieldValue(value)
			})
		},
		reset : function() {
			this.element.find('.ccui-field').each(function() {
						$(this).fieldReset()
					})
		},
		getRecord : function() {
			var p = this, record = new s();
			this.element.find('.ccui-field').each(function() {
				var a = this.getAttribute('id'), property = a
						.substring(p.options.prefix.length), value = $(this)
						.fieldValue();
				record.setProperty(property, value)
			});
			$.ccui.log.info(record);
			return record
		}
	});
	var s = function() {
		this._init()
	};
	s.prototype = {
		_init : function() {
		},
		setProperty : function(a, b) {
			var c = a.split(/\./), propertyLength = c.length;
			if (propertyLength > 1) {
				var d = this;
				for (var i = 0; i < propertyLength; i++) {
					if (i == propertyLength - 1) {
						d[c[i]] = b
					} else {
						if (!d[c[i]]) {
							d[c[i]] = {}
						}
						d = d[c[i]]
					}
				}
			} else {
				this[a] = b
			}
		},
		getProperty : function(a) {
			return this[a]
		},
		toString : function() {
			return JSON.stringify(this)
		}
	};
	function appendTds(a, b, c) {
		if (b == 0)
			return;
		for (var i = 0; i < b; i++) {
			a.append('<td ' + (c == true ? ' style="display:none;" ' : '')
					+ '/>')
		}
	}
	$.extend($.ccui.fieldLayout, {
				defaults : {
					prefix : '',
					description : 'pop',
					columns : 2,
					width : 800,
					getter : ['fieldValue']
				}
			});
	$.extend(jQuery.fn, {
				fieldValue : function(a) {
					var b = getInstance(this);
					if (b) {
						if (arguments.length == 0) {
							return b.getValue()
						} else {
							b.setValue(a)
						}
					}
					return null
				},
				fieldShow : function() {
					var a = getInstance(this);
					if (a) {
						return a.getText() || a.getValue()
					}
					return null
				},
				fieldReset : function(a) {
					var b = getInstance(this);
					if (b) {
						if (a == true && b.options.escapeReset == true) {
							return
						}
						b.reset()
					}
				},
				fieldFocus : function() {
					var a = getInstance(this);
					if (a) {
						a.fieldFocus()
					}
				},
				fieldValidate : function() {
					var a = getInstance(this);
					if (a) {
						return a.validate()
					}
					return true
				}
			});
	function getInstance(a) {
		if (a.is('.ccui-field')) {
			var b = $.data(a[0], a.attr('fieldType'));
			return b
		}
		return null
	}
	function noRealizationError(a, b) {
	}
	$.ccui.field = {
		_init : function() {
			this.element.addClass('ccui-field').attr('fieldType',
					this.widgetName).attr('id', this.options.id);
			this._initField();
			this._initDescription()
		},
		_initDescription : function() {
			if (this.options.popDescription == true && this.options.description) {
				$('body', document)
						.append('<div class="field-description" id="'
								+ q.field_desc_prefix + this.options.id
								+ '" style="position:absolute;display:none;">'
								+ this.options.description + '</div>')
			}
		},
		destory : function() {
			this.element.removeClass('ccui-field').removeAttr('fieldType');
			this._destoryField();
			$.widget.prototype.destroy.apply(this, arguments)
		},
		nextField : function() {
			if (this.options.nextField
					&& typeof(this.options.nextField) == 'string') {
				return $(document.getElementById(this.options.nextField))
			}
			return null
		},
		prevField : function() {
			if (this.options.prevField
					&& typeof(this.options.prevField) == 'string') {
				return $(document.getElementById(this.options.prevField))
			}
			return null
		},
		_validateNotNull : function() {
			if (this.options.notNull == null)
				return true;
			var a = this.getValue();
			if (this.options.notNull == true && (a == '' || a == null)) {
				this._validateError('');
				return false
			}
			this._validateSuccess();
			return true
		},
		regexps : {
			integer : '^-?[1-9]\\d*$',
			number : function(a) {
				var b = '^-?([1-9]\\d*\\.\\d*|0\\.\\d*[1-9]\\d*|0?\\.0+|0)$';
				if (a) {
					b = '^-?(0|[1-9]*)+(\\.[0-9]{1,' + a + '})?$'
				}
				return b
			},
			text : '^\\w+$',
			email : '\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*',
			phone : '\\d{3}-\\d{8}|\\d{4}-\\d{7}',
			url : '[a-zA-z]+://[^\\s]*'
		},
		_validateSuccess : function(a) {
			this.element.removeClass('validate-error')
					.addClass('validate-success').removeAttr('title');
			return true
		},
		_validateError : function(a) {
			this.element.removeClass('validate-success')
					.addClass('validate-error').attr('title', a);
			return false
		},
		_initField : function() {
			noRealizationError(this.widgetName, '_initField')
		},
		_destoryField : function() {
			noRealizationError(this.widgetName, '_destoryField')
		},
		validate : function() {
			return this._validateNotNull()
		},
		fieldFocus : function() {
			noRealizationError(this.widgetName, 'fieldFocus')
		},
		fieldBlur : function() {
			noRealizationError(this.widgetName, 'fieldBlur')
		},
		setValue : function(a) {
			noRealizationError(this.widgetName, 'setValue')
		},
		getValue : function() {
			noRealizationError(this.widgetName, 'getValue')
		},
		reset : function() {
			noRealizationError(this.widgetName, 'reset')
		}
	};
	$.ccui.field.defaults = {
		readonly : false,
		input : 'text',
		width : 200
	};
	$.widget("ccui.fieldLabel", $.extend({}, $.ccui.field, {
						_initField : function() {
							this.element
									.append('<span></span><input type="hidden" name="'
											+ this.options.property
											+ '"></input>')
						},
						validate : function() {
							return true
						},
						fieldFocus : function() {
							this.element.find('input:first').focus()
						},
						fieldBlur : function() {
						},
						setValue : function(a) {
							var b = this.options.show(a);
							this.element.find('span:first').html(b);
							this.element.find('input:first').val(a)
						},
						getValue : function() {
							return this.element.find('input:first').val()
						},
						reset : function() {
						}
					}));
	$.extend($.ccui.fieldLabel, {
				defaults : $.extend({}, $.ccui.field.defaults, {
							show : function(a) {
								return a
							}
						})
			});
	$.ccui.inputField = $.extend({}, $.ccui.field, {
				_initField : function() {
					var p = this, o = this.options;
					this.element.width(this.options.width).html('<input '
							+ (this.options.readonly
									? 'readonly="readonly"'
									: '')
							+ ' id="v-'
							+ this.options.id
							+ '" name="'
							+ this.options.property
							+ '" '
							+ (this.options.maxLength ? 'size="'
									+ this.options.maxLength + '"' : '')
							+ ' type="' + this.options.input + '" />');
					this.element.find('>input:first').css({
								width : this.options.width
							}).bind('focus', function(e) {
						$('#' + q.field_desc_prefix + o.id).css({
									top : $(this).offset().top
											+ $(this).outerHeight(),
									left : $(this).offset().left
								}).show()
					}).bind('blur', function(e) {
								p.fieldBlur()
							}).bind('keyup', function(e) {
								switch (e.keyCode) {
									case $.ui.keyCode.DOWN :
										var a = p.nextField();
										if (a && a.length > 0) {
											if (!$.browser.msie)
												p.fieldBlur();
											a.fieldFocus()
										}
										break;
									case $.ui.keyCode.UP :
										var b = p.prevField();
										if (b && b.length > 0) {
											if (!$.browser.msie)
												p.fieldBlur();
											b.fieldFocus()
										}
										break;
									case $.ui.keyCode.ENTER :
										break;
									default :
										p._validatingRemove();
										p.validate()
								}
							});
					this._initInput()
				},
				setValue : function(a) {
					this.element.find('input').val(a)
				},
				getValue : function() {
					return this.element.find('input').val()
				},
				reset : function() {
					this.element.find('input').val('');
					this._validatingRemove();
					this.element.removeClass('validate-success')
							.removeClass('validate-fail')
				},
				validate : function() {
					if (!this._validateNotNull()) {
						return false
					}
					var a = this.getValue();
					if (this.options.minLength
							&& a.length < this.options.minLength) {
						this._validateError('');
						return false
					}
					if (this.options.maxLength
							&& a.length > this.options.maxLength) {
						this._validateError('');
						return false
					}
					var b;
					var c = this.options.fractionLength || 0;
					if (this.options.expression) {
						b = expression
					} else {
						switch (this.options.dataType) {
							case 'integer' :
								b = this.regexps.integer;
								break;
							case 'number' :
								b = this.regexps.number(c);
								break;
							case 'text' :
								b = this.regexps.text;
								break;
							case 'email' :
								b = this.regexps.email;
								break;
							case 'phone' :
								b = this.regexps.phone;
								break;
							case 'url' :
								b = this.regexps.url;
								break;
							default :
						}
					}
					if (!b || !a)
						return true;
					var d = new RegExp(b);
					if (!d.test(a)) {
						this._validateError('');
						return false
					} else {
						this._validateSuccess();
						return true
					}
				},
				fieldFocus : function() {
					this.element.find('input').focus()
				},
				fieldBlur : function() {
					var p = this, o = this.options;
					$('#' + q.field_desc_prefix + o.id).hide();
					window.setTimeout(function() {
								if (o.readonly != true && o.checkUrl
										&& !p.element.is('.validating')
										&& !p.element.is('.validating-pass')
										&& !p.element.is('.validating-fail')
										&& p.validate()) {
									var c = p.getValue(), src = $.ccui
											.addUrlParameter(o.checkUrl,
													'property:' + o.property, c);
									$.ccui.log.info('checkUrl¼풩א...:' + src);
									p._validatingInitiate();
									$.ccui.ajax({
												url : src,
												success : function(a) {
													var b = a.message;
													if (!b)
														return;
													if (b.code == '000001') {
														p._validatingFail('ҩ֤²»ͨ¹�																	'+ b.message)
													} else {
														p._validatingPass(b.message)
													}
												}
											})
								}
							})
				},
				_validatingInitiate : function() {
					this.element.addClass('validating')
				},
				_validatingPass : function(a) {
					this.element.removeClass('validating')
							.removeClass('validating-fail')
							.addClass('validating-pass').attr('title', a)
				},
				_validatingFail : function(a) {
					this.element.removeClass('validating')
							.removeClass('validate-success')
							.removeClass('validating-pass')
							.addClass('validating-fail').attr('title', a)
				},
				_validatingRemove : function() {
					this.element.removeClass('validating')
							.removeClass('validating-pass')
							.removeClass('validating-fail')
				}
			});
	$.extend($.ccui.inputField, {
				defaults : $.extend({}, $.ccui.field.defaults, {})
			});
	$.widget("ccui.fieldText", $.extend({}, $.ccui.inputField, {
						_initInput : function() {
						},
						_destoryField : function() {
							$('#' + q.field_desc_prefix + o.property).remove()
						}
					}));
	$.extend($.ccui.fieldText, {
				defaults : $.extend({}, $.ccui.inputField.defaults, {})
			});
	$.widget("ccui.fieldHidden", $.extend({}, $.ccui.inputField, {
						_initInput : function() {
						}
					}));
	$.extend($.ccui.fieldHidden, {
				defaults : {
					readonly : false,
					input : 'hidden'
				}
			});
	$.widget("ccui.fieldPassword", $.extend({}, $.ccui.inputField, {
						_initInput : function() {
						}
					}));
	$.extend($.ccui.fieldPassword, {
				defaults : {
					readonly : false,
					input : 'password',
					width : 200
				}
			});
	$.widget("ccui.fieldDate", $.extend({}, $.ccui.field, {
						_initField : function() {
							var p = this;
							var c = $('<input type="text"/>')
									.appendTo(this.element).bind('keyup',
											function(e) {
												switch (e.keyCode) {
													case $.ui.keyCode.DOWN :
														var a = p.nextField();
														if (a && a.length > 0) {
															p.fieldBlur();
															a.fieldFocus()
														}
														break;
													case $.ui.keyCode.UP :
														var b = p.prevField();
														if (b && b.length > 0) {
															p.fieldBlur();
															b.fieldFocus()
														}
														break;
													case $.ui.keyCode.ENTER :
														break;
													default :
												}
											});
							if (!c.datepicker)
								return;
							c.datepicker({
								changeYear : true,
								changeMonth : true,
								duration : 'fast',
								showOn : 'both',
								buttonImage : $.ccui.serverConfig.path
										+ 'images/calendar.gif',
								buttonImageOnly : true
							}).css({
										width : (this.options.width - 22)
									})
						},
						validate : function() {
						},
						fieldFocus : function() {
							this.element.find('input').datepicker("show",
									'fast')
						},
						fieldBlur : function() {
							$.ccui.log.info('blurdate');
							this.element.find('input').datepicker("hide")
						},
						setValue : function(a) {
							return this.element.find('input:first').val(a)
						},
						getValue : function() {
							return this.element.find('input:first').val()
						},
						reset : function() {
							this.element.find('input:first').val('')
						}
					}));
	$.extend($.ccui.fieldDate, {
				defaults : $.extend({}, $.ccui.field.defaults, {
							dataFormate : ''
						})
			});
	$.ccui.collectionField = $.extend({}, $.ccui.field, {});
	$.ccui.collectionField.defaults = $.extend({}, $.ccui.field.defaults, {
				code : 'value',
				show : 'text'
			});
	$.widget("ccui.fieldSelect", $.extend({}, $.ccui.collectionField, {
		_initField : function() {
			var p = this;
			this.children = [];
			this.options.width -= 16;
			this.element.append('<input readonly="readonly" style="width:'
					+ (this.options.width) + 'px" id="v-' + this.options.id
					+ '" type="text" />' + '<input  name="'
					+ this.options.property + '" type="hidden" />').css({
						width : this.options.width
					}).addClass('fieldSelect').bind('click', function(e) {
						if ($(this).is('.expanded')) {
							p._collapse()
						} else {
							p._expand()
						}
					});
			this.optionsPanel = $('<div class="fieldSelect-panel"/>').bind(
					'mouseover', function() {
						p.selecting = true
					}).bind('mouseout', function() {
						p.selecting = false;
						p.element.find('input:first').focus()
					}).appendTo($('body', document));
			if (this.options.notNull != true) {
				var c = {};
				c[this.options.code] = 'nullItem';
				c[this.options.show] = '-';
				this._addItem(c)
			}
			if (this.options.items) {
				this._addItems(this.options.items)
			}
			this.element.find('input:first').bind('blur', function(e) {
						p.fieldBlur()
					}).bind('keyup', function(e) {
						switch (e.keyCode) {
							case $.ui.keyCode.DOWN :
								if (!p._nextItem()) {
									var a = p.nextField();
									if (a && a.length > 0) {
										p.fieldBlur();
										a.fieldFocus()
									}
								}
								break;
							case $.ui.keyCode.UP :
								if (!p._prevItem()) {
									var b = p.prevField();
									if (b && b.length > 0) {
										p.fieldBlur();
										b.fieldFocus()
									}
								}
								break;
							case $.ui.keyCode.ENTER :
								p._collapse();
							default :
						}
					});
			var d = this.getParent();
			if (d != null)
				d.fieldSelect('addChild', this)
		},
		addChild : function(a) {
			this.children.push(a)
		},
		getParent : function() {
			var a;
			if (this.options.parentField) {
				a = $(document.getElementById(this.options.parentField));
				if (a.is('.ccui-field.fieldSelect')) {
					return a
				}
			}
			return null
		},
		_getPosition : function() {
			return {
				left : this.element.offset().left,
				top : this.element.offset().top + this.element.outerHeight()
						- 1,
				width : this.element.width() + 16
			}
		},
		_expand : function(a, b) {
			if (this.element.is('.expanded'))
				return;
			this.element.find('input:first').focus();
			this.element.addClass('expanded');
			this.optionsPanel.css(this._getPosition()).show();
			if (this.options.src && !this.element.is('.loaded')) {
				this._loadSrc(this.options.src, a)
			} else {
			}
		},
		_collapse : function() {
			this.element.removeClass('expanded');
			this.optionsPanel.hide()
		},
		_loadSrc : function(c, d) {
			if (!c)
				return;
			var e = this.getParent();
			if (e != null) {
				var f = e.fieldValue();
				if (f == null || f == '')
					return;
				c = $.ccui.addUrlParameter(c, 'property:'
								+ e.find('input:hidden').attr('name'), f)
			}
			$.ccui.log.info('fieldSelect.loadSrc:' + c);
			var p = this;
			this.optionsPanel.empty();
			$.ccui.ajax({
						url : c,
						success : function(a) {
							p.element.addClass('loaded');
							var b = $.ccui.datasParse(a);
							if ($.isArray(b.records)) {
								p._addItems(b.records)
							}
							if ($.isFunction(d)) {
								d.apply(this)
							}
						}
					})
		},
		_loadByParent : function() {
			var a = this.element.attr('tempValue');
			if (a != null && a != '') {
				this.setValue(a)
			}
		},
		_addItems : function(a) {
			var p = this;
			$(a).each(function(i) {
						p._addItem(this)
					})
		},
		_addItem : function(a) {
			var p = this;
			var b = a[this.options.show], code = a[this.options.code], toolTip = a[this.options.toolTip]
					|| b;
			if (code != null
					&& b != null
					&& this.optionsPanel.find('.item[value=' + code + ']').length == 0) {
				var c = $('<div class="item" title="' + toolTip + '" value="'
						+ code + '">' + b + '</div>').bind('mouseover',
						function() {
							$(this).addClass('over')
						}).bind('mouseout', function() {
							$(this).removeClass('over')
						}).bind('click', function() {
							p._collapse();
							p.setValue(this.getAttribute('value'))
						});
				this.optionsPanel.append(c)
			}
		},
		_prevItem : function() {
			var a = this.optionsPanel.find('.item.selected');
			var b = a.prev();
			if (b && b.length > 0) {
				this._setValue(b.attr('value'));
				return true
			} else {
				return false
			}
		},
		_nextItem : function() {
			var a = this.optionsPanel.find('.item.selected');
			var b = null;
			if (a.length == 0) {
				b = this.optionsPanel.find('.item:first')
			} else {
				b = a.next()
			}
			if (b && b.length > 0) {
				this._setValue(b.attr('value'));
				return true
			} else {
				return false
			}
		},
		_setValue : function(a) {
			if (this.optionsPanel.find('.item[value=' + a + ']').length == 0)
				return;
			var b = this.optionsPanel.find('.item[value=' + a + ']').text();
			this.element.find('input:text').val(b).attr('title', b);
			this.element.find('input:hidden').val(a);
			var c = this.optionsPanel.find('.selected');
			if (c.length == 0 || c.attr('value') != a) {
				c.removeClass('selected');
				this.optionsPanel.find('.item[value=' + a + ']')
						.addClass('selected');
				this._change(a, c.attr('value'))
			}
		},
		_change : function(a, b) {
			$(this.children).each(function() {
						this.reset();
						this._loadByParent();
						this.element.removeClass('loaded')
					});
			if ($.isFunction(this.options.onSelect)) {
				this.options.onSelect.apply(this, [a, b])
			}
		},
		fieldFocus : function() {
			var p = this;
			this._expand();
			this.element.find('input:first').focus()
		},
		fieldBlur : function() {
			if (this.selecting == true)
				return;
			this._collapse()
		},
		setValue : function(a) {
			var p = this;
			if (this.options.src && !this.element.is('.loaded')) {
				this.element.attr('tempValue', a);
				this._loadSrc(this.options.src, function() {
							p._setValue(a);
							p.element.removeAttr('tempValue')
						})
			} else {
				this._setValue(a)
			}
		},
		getValue : function() {
			return this.element.find('input:hidden').val()
		},
		reset : function() {
			this.element.find('input:text').val('');
			this.element.find('input:hidden').val('');
			this.optionsPanel.find('.selected').removeClass('selected')
		},
		_destoryField : function() {
			this.element.removeClass('fieldSelect');
			$(this.children).each(function() {
						this.destory()
					});
			this.children = []
		}
	}));
	$.extend($.ccui.fieldSelect, {
				defaults : $.extend({}, $.ccui.collectionField.defaults, {})
			})
})(jQuery);
(function($) {
	$.widget("ccui.form", {
		_init : function() {
			var a = this, o = this.options, element = this.element, buttons = this
					.getButtons();
			element.html('<div class="fieldContainer"/>').addClass('ccui-form')
					.css({
								margin : 0
							});
			this.initFields();
			if (o.dialog == true) {
				element.dialog({
							autoOpen : false,
							title : o.caption,
							modal : true,
							width : o.width + 6,
							height : o.height,
							height : element.outerHeight() + 100,
							minHeight : element.outerHeight() + 100,
							overlay : {
								opacity : 0.2,
								background : "#A8A8A8"
							},
							buttons : buttons
						})
			} else {
				element.panel({
							caption : o.caption,
							initHtml : o.initHtml,
							width : o.width,
							buttons : buttons,
							minimize : true,
							afterMinimize : o.afterMinimize
						})
			}
			element = null
		},
		getButtons : function() {
			var a = this;
			var o = this.options;
			var b = o.buttons;
			var c = {};
			for (var d in b) {
				var e = b[d];
				switch (d) {
					case 'submit' :
						c[e] = function() {
							a.submit();
							if (o.dialog) {
								$(this).dialog("close")
							}
						};
						break;
					case 'reset' :
						c[e] = function() {
							a.reset(true)
						};
						break;
					case 'close' :
						if (o.dialog) {
							c[e] = function() {
								$(this).dialog("close")
							}
						}
						break;
					default :
						c[d] = e
				}
			}
			return c
		},
		initFields : function() {
			var o = this.options;
			this.element.find('.fieldContainer').fieldLayout({
						columns : o.columns,
						width : o.width - 25,
						fields : o.fields,
						prefix : o.property
					})
		},
		_getParams : function() {
			var o = this.options, params = [];
			this.element.find('.ccui-field').each(function() {
				var a = $(this).attr('id').substring(o.property.length), value = $(this)
						.fieldValue();
				params.push('&');
				params.push($.ccui.getPropertyParamter(a, value))
			});
			if (params.length == 0)
				return '';
			$.ccui.log.info(params.join('').substring(1));
			return params.join('').substring(1)
		},
		fieldValue : function(a, b) {
			var c = this.fieldContainer.find('.ccui-field[@ref-property=' + a
					+ ']');
			if (c == null)
				return;
			if (!b) {
				return c.fieldValue()
			} else {
				c.fieldValue(b)
			}
		},
		submit : function() {
			var o = this.options, self = this, params = this._getParams();
			if (!this.validate())
				return;
			if ($.isFunction(self.options.beforeSubmit)) {
				self.options.beforeSubmit.apply(self)
			}
			url = o.action;
			if (this.actionType) {
				url = $.ccui.addUrlParameter(url, 'request:actionType',
						this.actionType)
			}
			url = $.ccui.addUrlParameter(url, 'inject:type', o.property);
			$.ccui.log.info('form submit:' + url + '<br/> params:');
			$.ccui.ajax({
						type : o.ajaxType,
						url : url,
						dataType : o.srcType,
						data : params,
						success : function(a) {
							if ($.ccui.datasParse(a)) {
								var b = self.options.afterSubmit;
								if ($.isFunction(b)) {
									b()
								} else if (window[b]) {
									window[b]()
								}
								b = null;
								self.element.dialog('close')
							}
						}
					})
		},
		reset : function(a) {
			this.element.find('.ccui-field').each(function() {
						$(this).fieldReset(a)
					})
		},
		validate : function() {
			var a = true;
			this.element.find('.ccui-field').each(function() {
						if ($(this).fieldValidate() == false) {
							a = false
						}
					});
			return a
		},
		fieldFills : function(a) {
			this.currentRecord = a;
			this.element.find('.fieldContainer').fieldLayout('fillFields', a)
		},
		reFieldFills : function() {
			if (this.currentRecord) {
				this.fieldFills(this.currentRecord)
			} else {
				this.reset()
			}
		},
		find : function(c, d) {
			var e = this, o = this.options;
			$.ccui.ajax({
						url : c,
						success : function(a) {
							var b = a.record;
							if (b)
								e.fieldFills(b);
							if ($.isFunction(d)) {
								d(b, e)
							}
						}
					})
		},
		open : function(a) {
			if (this.options.dialog) {
				this.actionType = a;
				$(this.element.dialog('open'))
			}
		},
		close : function() {
			if (o.dialog) {
				this.element.dialog('close')
			}
		},
		setTitle : function(a) {
			if (this.options.dialog == true) {
			} else {
				this.element.panel('title', a);
				this.fieldContainer.hide().show()
			}
		},
		width : function(a) {
		}
	});
	$.extend($.ccui.form, {
				defaults : {
					ajaxType : 'POST',
					srcType : 'json',
					dialog : false,
					columns : 2,
					width : 800,
					height : 350,
					property : 'record',
					buttons : {
						'submit' : '͡½»',
						'reset' : 'ט׃',
						'close' : '¹رӧ'
					}
				}
			})
})(jQuery);
(function($) {
	$.widget("ccui.tree", $.extend({}, $.ui.mouse, {
		_init : function() {
			this.element.addClass('ccui-tree');
			this.root = this.element.find('li:first');
			this._initLast();
			this._initAction();
			if (this.options.dragDrop) {
				this._mouseInit()
			}
		},
		_initAction : function() {
			this.element.bind('click', function(a) {
						var b = $(a.srcElement || a.target);
						if (b.is('li.treeNode>span>a')) {
							$(this).tree('selectedNode', b.parent().parent());
							return false
						} else if (b.is('li.treeNode>span')) {
						} else if (b.is('.triggerHandle')) {
							$(this).tree('triggerNode', b.parent())
						}
					}).bind('dblclick', function(a) {
						var b = $(a.srcElement || a.target), nodeElement;
						if (b.is('li.treeNode>span>a')) {
							nodeElement = b.parent().parent()
						} else if (b.is('li.treeNode>span')) {
							nodeElement = b.parent()
						}
						if (nodeElement) {
							$(this).tree('triggerNode', nodeElement)
						}
					}).bind('mouseover', function(a) {
						var b = $(a.srcElement || a.target);
						if (b.is('.triggerHandle')) {
							return false
						} else {
							var c;
							if (b.is('li.treeNode')) {
								c = b
							} else if (b.is('li.treeNode>span>a')) {
								c = b.parent().parent()
							} else if (b.is('li.treeNode>span')) {
								c = b.parent()
							}
							if (c && $('>.triggerHandle', c).length == 0) {
								c.prepend('<div class="triggerHandle"></div>')
							}
						}
					})
		},
		_initLast : function() {
			this.root.find('ul').find('>li:last').addClass('last')
		},
		triggerNode : function(a) {
			a.toggleClass('expanded')
		},
		selectedNode : function(a) {
			var b = this.element.find('li.selected');
			if (b[0] != a[0]) {
				b.removeClass('selected');
				a.addClass('selected');
				if ($.isFunction(this.options.onSelect)) {
					this.options.onSelect.apply(this.element[0], [this
									._uiHash()])
				}
			}
		},
		selectedById : function(a) {
			var b = this.element.find('#' + a);
			if (b.length > 0) {
				this.selectedNode(b)
			}
		},
		setNodeText : function(a, b) {
			var c = this.element.find('#' + a);
			if (c.length > 0) {
				c.find('>span>a').text(b)
			}
		},
		addNodeChild : function(a, b) {
			var c = this.element.find('#' + a);
			if (c.length > 0 && this.element.find('#' + b.id).length == 0) {
				c.find('>ul>li:last').removeClass('last');
				c.find('>ul').append(this._makeNodeHtml($.extend({
							'last' : 'last'
						}, b)))
			}
		},
		removeNode : function(a) {
			var b = this.element.find('#' + a);
			if (b.hasClass('last')) {
				prevElement = b.prev();
				if (prevElement.length > 0) {
					prevElement.addClass('last')
				} else {
					b.parent().parent().removeClass('expandable')
							.removeClass('expanded')
				}
			}
			this.element.find('li#' + a).remove()
		},
		_makeNodeHtml : function(a) {
			var b = [], classNames = [];
			if (a.last)
				classNames.push(a.last);
			if (a.iconClass)
				classNames.push(a.iconClass);
			b.push('<li id="' + a.id + '" ');
			b.push('class="treeNode ' + classNames.join(' ') + '"');
			b.push('>');
			b.push('<span><a href="#">');
			b.push(a.text);
			b.push('</a></span>');
			b.push('</li>');
			return b.join('')
		},
		onClick : function(a, b, c) {
			if ($.isFunction(this.options.onClick)) {
				this.options.onClick.apply(this.element, [this._uiHash()])
			}
		},
		goOpenPath : function(a, b) {
			this.root.treeNode('openPath', a, b)
		},
		expandAll : function(a) {
			var b = this.getSelected() || this.root;
			b.treeNode('expandAll', a)
		},
		collapseAll : function(a) {
			var b = this.getSelected() || this.root;
			b.treeNode('collapseAll', a)
		},
		addNode : function(a, b, c, d) {
			var e = this.getSelected();
			e.treeNode('addNode', a, b, c, d)
		},
		checkedTreeNodes : function(a) {
			var p = this;
			this.clearCheckedTreeNodes();
			$(a).each(function() {
						p.element.find('#' + this).treeNode('checked');
						p.checkedIds[this] = true
					})
		},
		clearCheckedTreeNodes : function() {
			this.checkedIds = [];
			this.element.find('li.checked').removeClass('checked')
					.addClass('unchecked');
			this.element.find('li.partchecked').removeClass('partchecked')
					.addClass('unchecked')
		},
		resetOriginalChecked : function() {
			if (!this.checkedIds) {
				return
			}
			var a = [];
			for (var b in this.checkedIds) {
				if (this.checkedIds[b]) {
					a.push(b)
				}
			}
			this.checkedTreeNodes(a)
		},
		_uiHash : function() {
			return {
				selected : this.getSelected()
			}
		},
		getSelected : function() {
			var a = this.element.find('li.selected');
			if (a.length === 0)
				return null;
			return a
		},
		getOriginalCheckedIds : function() {
			return this.checkedIds
		},
		getCurrentCheckedIds : function() {
			var b = $.extend({}, this.checkedIds);
			this.element.find('li.treeNode').not('.root').each(function() {
						var a = $(this), d = a.attr('id');
						if (a.is('.checked,.partchecked')) {
							b[d] = true
						} else {
							delete b[d]
						}
					});
			var c = [];
			for (var d in b) {
				c.push(d)
			}
			return c
		},
		_mouseStart : function(a) {
			var b = $(a.srcElement || a.target);
			if (b.is('li>span>a')) {
				this.currentDrag = b.parent().parent();
				this.helper = this._createHelper(a, b)
			}
			return true
		},
		_mouseDrag : function(a) {
			if (this.helper) {
				var b = $(a.srcElement || a.target);
				this.position = this._generatePosition(a);
				this.helper.css(this.position);
				if (b.is('li>span>a')) {
					var c = this._getDropMarker();
					this.currentDrop = b.parent().parent();
					if (this.currentDrop[0] == this.currentDrag[0]
							|| this.currentDrop[0] == this.currentDrag.parent()
									.parent()[0]) {
						this.helper.addClass('drop-no');
						c.removeClass();
						return false
					} else {
						this.helper.removeClass('drop-no')
					}
					var d = a.pageY - b.offset().top - 8;
					var e = {
						left : b.offset().left - c.parent().offset().left - 10
					};
					if (d < -3) {
						e.top = b.offset().top - c.parent().offset().top - 4;
						c[0].className = 'ccui-tree-drop-marker marker-top'
					} else if (d > 2) {
						e.top = b.offset().top + 12 - c.parent().offset().top;
						c[0].className = 'ccui-tree-drop-marker marker-bottom'
					} else {
						e.top = b.offset().top + 4 - c.parent().offset().top;
						c[0].className = 'ccui-tree-drop-marker marker-middle'
					}
					if ($.browser.msie) {
						e.top -= 6
					}
					c.css(e);
					var f = this.helper.offsetParent(), oScrollTop = f
							.scrollTop();
					tScrollTop = this.helper[0].offsetTop - f.innerHeight();
					if (oScrollTop < tScrollTop) {
						f.scrollTop(tScrollTop)
					} else if (this.helper[0].offsetTop < oScrollTop + 30) {
						f.scrollTop(oScrollTop - 20)
					}
				}
			}
			return false
		},
		_mouseStop : function(c) {
			if (this.helper)
				this.helper.remove();
			if (this.currentDrop && this.currentDrag
					&& !this.helper.is('.drop-no')) {
				this.options.onDrop = $.isFunction(this.options.onDrop)
						? this.options.onDrop
						: function(a, b) {
							$(this).tree('dropNode')
						};
				this._trigger('onDrop', c, {
							dragNode : this.currentDrag,
							dropNode : this.currentDrop,
							dragParent : this._getDragParent()
						})
			} else {
				this.currentDrop = null;
				this.currentDrag = null
			}
			this._getDropMarker().removeClass();
			this.helper = null;
			return false
		},
		_getDropMarker : function() {
			return $('#' + this.element.attr('id') + '-tree-drop-marker')
		},
		_getDragParent : function() {
			var a, dropMarker = this._getDropMarker();
			if (dropMarker.is('.marker-middle')) {
				a = this.currentDrop
			} else {
				a = this.currentDrop.parent().parent()
			}
			return a
		},
		dropNode : function() {
			if (this.currentDrag && this.currentDrop)
				this._dropNode()
		},
		_dropNode : function() {
			var p = this, dropMarker = this._getDropMarker(), selectedNode = this
					.getSelected();
			if (selectedNode)
				selectedNode.removeClass('selected');
			if (p.currentDrag.is('.last')) {
				p.currentDrag.removeClass('last');
				var a = p.currentDrag.prev();
				if (a.length > 0) {
					a.addClass('last')
				} else {
					p.currentDrag.parent().parent().removeClass('collapsable')
				}
			}
			if (dropMarker.is('.marker-top') && !p.currentDrop.is('.root')) {
				p._dropBefore()
			} else if (dropMarker.is('.marker-middle')) {
				if (p.currentDrop.is('.expandable')) {
					p.currentDrop.treeNode('expand', function() {
								p._dropChild()
							})
				} else {
					p._dropChild()
				}
			} else if (dropMarker.is('.marker-bottom')
					&& !p.currentDrop.is('.root')) {
				p._dropAfter()
			}
		},
		_dropBefore : function() {
			this.currentDrop.before(this.currentDrag);
			this.currentDrag.treeNode('selected');
			this.currentDrop = null;
			this.currentDrag = null
		},
		_dropChild : function() {
			var a = this.currentDrop.find('>ul');
			if (a.length == 0) {
				a = $('<ul></ul>').appendTo(this.currentDrop)
			} else {
				a.find('>li:last').removeClass('last')
			}
			if (a.children().length == 0) {
				this.currentDrop.addClass('collapsable')
			}
			a.append(this.currentDrag.addClass('last'));
			this.currentDrag.treeNode('selected');
			this.currentDrop = null;
			this.currentDrag = null
		},
		_dropAfter : function() {
			this.currentDrop.after(this.currentDrag);
			if (this.currentDrop.is('.last')) {
				this.currentDrop.removeClass('last');
				this.currentDrag.addClass('last')
			}
			this.currentDrag.treeNode('selected');
			this.currentDrop = null;
			this.currentDrag = null
		},
		_mouseCapture : function(a) {
			return true
		},
		_createHelper : function(a, b) {
			var o = this.options;
			var c = $('<span class="drop-yes" id="tree-drop-helper"></span>')
					.append(b.clone());
			if (!c.parents('body').length)
				c.appendTo((o.appendTo == 'parent'
						? b[0].parentNode.parentNode
						: o.appendTo));
			if (c[0] != this.element[0]
					&& !(/(fixed|absolute)/).test(c.css("position")))
				c.css("position", "absolute");
			return c
		},
		_generatePosition : function(a) {
			var b = a.pageX;
			var c = a.pageY;
			return {
				top : c + 10 - this.element.offset().top,
				left : b + 5 - this.element.offset().left
			}
		},
		destroy : function() {
			this.element.removeClass('ccui-tree').removeData(this.widgetName)
		}
	}));
	$.extend($.ccui.tree, {
				defaults : {
					showRoot : true,
					idAttr : 'value',
					textAttr : 'text',
					distance : 1,
					delay : 0,
					appendTo : 'parent'
				},
				getter : ['getSelected', 'getOriginalCheckedIds',
						'getCurrentCheckedIds']
			})
})(jQuery);
(function($) {
	$.widget("ccui.layout", {
		_init : function() {
			var p = this;
			this.element.addClass('ccui-layout');
			this._initPanes();
			$(window).bind('resize', function() {
						p._generateSize()
					})
		},
		_initPanes : function() {
			var p = this, o = this.options;
			$(this.options.panes).each(function() {
				var c = this.region, axis, pane = p.element.find('>.pane.' + c);
				if (c == 'north' || c == 'south') {
					axis = 'y';
					pane.height((this.height || 100) + 'px')
				} else if (c == 'west' || c == 'east') {
					axis = 'x';
					pane.width((this.width || 200) + 'px')
				} else {
					axis = 'x'
				}
				pane.wrapInner('<div class="content"/>').addClass(axis
						+ '-pane');
				var d, splitOptions = {};
				if (this.split && c != 'center') {
					d = $('<div minSize="175" maxSize="400" id="split-' + c
							+ '" class="layout-split ' + axis + '-split"/>');
					p.element.append(d);
					splitOptions = $.extend({}, {
								containment : 'parent',
								helper : 'clone',
								axis : axis,
								delay : 10,
								start : function(e, a) {
									$('.ccui-cover-split').css({
												cursor : $(this).css('cursor'),
												width : '100%',
												height : p.element
														.outerHeight()
											}).show()
								},
								stop : function(e, a) {
									var b = this.getAttribute('id')
											.substring('split-'.length);
									$('.ccui-cover-split').hide()
								}
							})
				}
				if (d) {
					d.draggable(splitOptions);
					d = null
				}
				pane = null
			});
			this._generateSize()
		},
		_generateSize : function() {
			var a = this._getParentSize().width, height = this._getParentSize().height, westWidth = this.element
					.find('>.pane.west').outerWidth(), eastWidth = this.element
					.find('>.pane.east').outerWidth(), northHeight = this.element
					.find('>.pane.north').outerHeight(), southHeight = this.element
					.find('>.pane.south').outerHeight(), yHeight = height
					- northHeight - southHeight, oCenterWidth = this.element
					.find('>.pane.center .content').width(), centerWidth = a
					- westWidth - eastWidth;
			this.element.css({
						width : a,
						height : height
					});
			this.element.find('>.pane.x-pane').css('height', yHeight);
			this.element.find('>.pane.center').width(centerWidth);
			this.element.find('>#split-north').css('top', northHeight - 3);
			this.element.find('>#split-south').css('top',
					northHeight + yHeight - 3);
			this.element.find('>#split-west').css({
						height : yHeight,
						'top' : northHeight,
						left : westWidth - 3
					});
			this.element.find('>#split-east').css({
						height : yHeight,
						'top' : northHeight,
						left : westWidth + centerWidth - 3
					});
			this.element.find('>.pane.center .content iframe')
					.width(centerWidth);
			this.element.find('>.pane.center .content iframe').height(yHeight);
			$.ccui.log.info(oCenterWidth + '---' + centerWidth);
			if ($.isFunction(this.options.onResize)) {
				this.options.onResize(centerWidth, yHeight)
			}
		},
		_getParentSize : function() {
			return {
				width : $(window).width(),
				height : $(window).height()
			}
		},
		maxCenter : function() {
			this.element.find('>.pane').hide();
			this.element.find('>.layout-split').hide();
			this.element.find('>.pane.center').show()
					.css(this._getParentSize())
		},
		restoreCenter : function() {
			var a = this._getParentSize().width, height = this._getParentSize().height, westWidth = this.element
					.find('>.pane.west').outerWidth(), eastWidth = this.element
					.find('>.pane.east').outerWidth(), northHeight = this.element
					.find('>.pane.north').outerHeight(), southHeight = this.element
					.find('>.pane.south').outerHeight(), yHeight = height
					- northHeight - southHeight, centerWidth = a - westWidth
					- eastWidth;
			this.element.find('>.pane').show();
			this.element.find('>.layout-split').show();
			this.element.find('>.pane.center').css({
						width : centerWidth,
						height : yHeight
					})
		},
		destory : function() {
		}
	});
	$.extend($.ccui.layout, {
				defaults : {}
			})
})(jQuery);