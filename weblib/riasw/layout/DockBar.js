define([
	"riasw/riaswBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/layout/_PanelWidget",
	"riasw/form/Button",
	"riasw/layout/_TabControllerMixin"
], function(rias, _TemplatedMixin, _PanelWidget, Button, _TabControllerMixin){

	///由于 css 加载的延迟，造成如果 domNode 的 css 有 padding、margin、border，可能显示不正确，最好移到 _PabelBase 中加载。
	//rias.theme.loadThemeCss([
	//	"riasw/layout/DockBar.css"
	//]);

	var DockNode = rias.declare("riasw.layout.DockNode", [Button], {

		templateString:
			'<div data-dojo-attach-point="focusNode,buttonNode" class="dijitReset" data-dojo-attach-event="ondijitclick:_onClick,onmouseenter:_onMouseEnter,onmouseleave:_onMouseLeave" role="presentation">'+
				//'<div data-dojo-attach-point="badgeNode" class="${badgeClass}"></div>'+
				'<div data-dojo-attach-point="closeNode" class="${badgeClass} riaswDockCloseNode" data-dojo-attach-event="onclick: _onClose">'+
					'<div data-dojo-attach-point="closeNodeText" class="riaswBadgeText riaswBadgeBlack">X</div>'+
				'</div>'+
				///建议保留 iconNode，便于定位
				'<div data-dojo-attach-point="iconNode" class="riaswButtonIcon riaswNoIcon"></div>'+
				///建议保留 labelNode，便于定位
				'<div data-dojo-attach-point="labelNode" class="riaswButtonLabel riaswNoLabel"></div>'+
			'</div>',

		baseClass: "riaswButton riaswDockNode",

		targetWidget: null,

		_onDestroy: function(){
			if(this._autoToggleDelay){
				this._autoToggleDelay.remove();
				this._autoToggleDelay = undefined;
			}
			rias.forEach(this._hBadge, function(item){
				item.remove();
			});
			this._hBadge = undefined;
			if(this.targetWidget){
				this.targetWidget.dockNode = this.targetWidget.controlButton = undefined;
				if(!this.targetWidget.isDestroyed(true) && !this.targetWidget.isClosed() && rias.isFunction(this.targetWidget.restore)){
					this.targetWidget.restore(false);
				}
				this.targetWidget = undefined;
			}
			this.inherited(arguments);
		},

		setTargetState: function(){
			if(!this.targetWidget){
				return;
			}
			var sh = this.targetWidget.isShowing(),
				se = !!this.targetWidget.get("selected");
			/// focused 容易改变、丢失，用 selected
			if(se){
				this.controller.selectChild(this.targetWidget);
			//}else if(this.checked){
			//	this.controller.selectChild(null);
			}
			rias.dom.toggleClass(this.domNode, "riaswDockNodeSelected", se);
			rias.dom.toggleClass(this.domNode, "riaswDockNodeShown", sh);
			rias.dom.toggleClass(this.domNode, "riaswDockNodeHidden", !sh);
			/*if(sh){
				rias.dom.setStyle(this.domNode, "background-color", rias.dom.getStyle(this.targetWidget.captionNode, "background-color"));
			}else{
				rias.dom.setStyle(this.domNode, "background-color", "");
			}*/
		},
		_setTargetWidgetAttr: function(widget){
			///TODO:zensst.以后考虑 label 和 iconClass 改变时的 containerLayout
			var self = this;
			rias.forEach(self._hBadge, function(item){
				item.remove();
			});
			if(rias.is(widget, _PanelWidget)){
				widget.dockNode = widget.controlButton = self;
				self._hBadge = self.own(
					//widget.watch('title', function(name, oldValue, newValue){
					//	self.set("label", newValue);
					//}),
					widget.watch('caption', function(name, oldValue, newValue){
						self.set("label", newValue);
					}),
					widget.watch('disabled', function(name, oldValue, newValue){
						self.set("disabled", newValue);
					}),
					widget.watch('textdir', function(name, oldValue, newValue){
						self.set("textdir", newValue);
					}),
					widget.watch('tooltip', function(name, oldValue, newValue){
						self.set("tooltip", newValue);
					}),
					widget.watch('iconClass', function(name, oldValue, newValue){
						self.set("iconClass", newValue);
					}),
					widget.watch('badgeStyle', function(name, oldValue, newValue){
						self.set("badgeStyle", newValue);
					}),
					widget.watch('badgeColor', function(name, oldValue, newValue){
						self.set("badgeColor", newValue);
					}),
					widget.watch('badge', function(name, oldValue, newValue){
						self.set("badge", newValue);
					}),
					/// focused 容易改变、丢失，用 selected
					widget.watch('selected', function(name, oldValue, newValue){
						self.setTargetState();
					}),
					//widget.watch('focused', function(name, oldValue, newValue){
					//	self.setTargetState();
					//}),
					widget.watch('displayState', function(name, oldValue, newValue){
						self.setTargetState();
					})
				);
				self._set("targetWidget", widget);
				self.set("label", widget.get("caption"));
				self.set("disabled", widget.get("disabled"));
				self.set("textdir", widget.get("textdir"));
				self.set("tooltip", widget.get("tooltip"));
				self.set("iconClass", widget.get("iconClass"));
				self.set("badgeStyle", widget.get("badgeStyle"));
				self.set("badgeColor", widget.get("badgeColor"));
				self.set("badge", widget.get("badge"));
				self.setTargetState();
			}else{
				self._set("targetWidget", null);
				///这里不应该初始化 caption 等，而应该保持设计值。
				self._hBadge = undefined;
			}
		},

		toggleTarget: function(disableAutoFocus){
			var target = this.targetWidget,
				_autoFocus = target.autoFocus;

			target.autoFocus = !disableAutoFocus;
			if(target && !target._playing){
				if(target.isHidden() || target.isCollapsed() || !target.get("visible")){
					target.restore(true).always(function(){
						target.autoFocus = _autoFocus;
					});///已经包含 focus
				}else if(!this.checked){
					target.set("selected", true);///已经包含 focus
					target.autoFocus = _autoFocus;
				}else if(rias.isFunction(target.toggle)){
					target.toggle().always(function(){
						target.autoFocus = _autoFocus;
					});
				}
			}
		},
		_onClick: function(e){
			if(this.inherited(arguments) != false){
				e.stopPropagation();
				e.preventDefault();
				///需要 defer 以保证正确的 target.select 和 focusStack
				this.defer(function(){
					this.toggleTarget();
				});
			}
			return false;
		},
		_onClose: function(e){
			if(e){
				rias.stopEvent(e);
			}
			if(!this.disabled){
				var target = this.targetWidget;
				if(target && !target._playing){
					if(rias.isFunction(target.close)){
						target.close();
					}
				}
			}
			return false;
		},

		_onMouseEnter: function(e){
			var self = this,
				target = self.targetWidget;
			if(target){
				/*if(target.displayStateOnHover && !self._autoToggleDelay && !target._playing){
					self._autoToggleDelay = self.defer(function(){
						if(self._autoToggleDelay){
							self._autoToggleDelay.remove();
							self._autoToggleDelay = undefined;
						}

						this.toggleTarget();

					}, rias.autoToggleDuration);
				}*/
				target._onMouseEnter(e, true);
				if(target.closable){
					//rias.dom.visible(self.closeNode, true);
					rias.dom.addClass(this.closeNode, "riaswBadgeVisible");
				}
			}
		},
		_onMouseLeave: function(e){
			//if(this._autoToggleDelay){
			//	this._autoToggleDelay.remove();
			//	this._autoToggleDelay = undefined;
			//}
			if(this.targetWidget){
				this.targetWidget._onMouseLeave(e, true);
			}
			//rias.dom.visible(this.closeNode, false);
			rias.dom.removeClass(this.closeNode, "riaswBadgeVisible");
		}

	});

	var riaswType = "riasw.layout.DockBar";
	var Widget = rias.declare(riaswType, [_PanelWidget, _TemplatedMixin, _TabControllerMixin], {

		_riasdRefChildren: {///用于设计期 非 _riaswElements 辅助。
			items: "_targetWidgets",
			add: "addTarget",
			remove: "removeTarget"
		},

		//使用 _TabControllerMixin 的 templateString
		//templateString: '<div class="DockBar"><ul data-dojo-attach-point="containerNode" class="dijitReset riaswDockBarList"></ul></div>',
		baseClass: "riaswDockBar",

		buttonCtor: DockNode,

		postMixInProperties: function(){
			this.inherited(arguments);
			if(!this._targetWidgets){
				this._targetWidgets = [];
			}
		},
		_onDestroy: function(){
			this.inherited(arguments);
			this._targetWidgets.lenth = 0;
		},
		startup: function(){
			this.inherited(arguments);
		},

		_setRegionAttr: function(value){
			this.inherited(arguments, [value]);
			rias.forEach(this.getChildren(), function(node){
				node.tooltipPositions = this.region === "left" ? ["after-centered", "before-centered"]
					: this.region === "right" ? ["before-centered", "after-centered"]
					: this.region === "bottom" ? ["above-centered", "below-centered"]
					: undefined;
			});
		},

		_setupChild: function(node, /*int*/ insertIndex){
			this.inherited(arguments);
			if(node){
				var wrapper = node.targetWidget.domNode;
				wrapper.removeAttribute("aria-label");
				node._labelledby0 = wrapper.getAttribute("aria-labelledby");
				wrapper.setAttribute("aria-labelledby", node.id);
			}
		},
		findNodeByTarget: function(targetWidget){
			return rias.filter(this.getChildren(), function(child){
				return child.targetWidget === targetWidget;
			})[0];
		},
		addTarget: function(targetWidget){
			if(!rias.is(targetWidget, _PanelWidget)){
				return;
			}
			var node = this.findNodeByTarget(targetWidget);
			if(node){
				return node;
			}
			this._targetWidgets.push(targetWidget);
			node = this._createButton(rias.mixinDeep(targetWidget.makeDockNodeArgs(), {
				ownerRiasw: targetWidget,
				targetWidget: targetWidget,
				dir: targetWidget.dir,
				lang: targetWidget.lang,
				textDir: targetWidget.textDir || this.textDir,
				//id: targetWidget._riaswIdInModule ? this.id + "_" + targetWidget._riaswIdInModule : "",/// page 属于不同 Module 时，_riaswIdInModule 可能相同
				//name: targetWidget._riaswIdInModule ? this.id + "_" + targetWidget._riaswIdInModule : "",/// page 属于不同 Module 时，_riaswIdInModule 可能相同
				label: targetWidget.caption || targetWidget.title,
				showLabel: true,
				tooltip: targetWidget.tooltip || targetWidget.caption || targetWidget.title,
				tooltipPositions: this.region === "left" ? ["after-centered", "before-centered"]
					: this.region === "right" ? ["before-centered", "after-centered"]
					: this.region === "bottom" ? ["above-centered", "below-centered"]
					: undefined,
				disabled: (targetWidget.disabled == undefined ? false : !!targetWidget.disabled),
				closable: (targetWidget.closable == undefined ? false : !!targetWidget.closable),
				iconClass: targetWidget.iconClass,
				badgeStyle: targetWidget.badgeStyle,
				badgeColor: targetWidget.badgeColor,
				badge: targetWidget.badge
			}));
			this.addChild(node);
			node.startup();
			return node;
		},
		removeTarget: function(targetWidget){
			var node = this.findNodeByTarget(targetWidget);
			rias.removeItems(this._targetWidgets, targetWidget);
			this.removeChild(node);
			return node;
		}

	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		allowedChild: "riasw.layout.DockNode",
		"property": {
		}
	};

	return Widget;

});