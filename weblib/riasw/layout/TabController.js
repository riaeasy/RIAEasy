
//RIAStudio client runtime widget - TabController

define([
	"riasw/riaswBase",
	"riasw/form/Button",
	"riasw/layout/_PanelWidget",
	"riasw/sys/_TemplatedMixin",
	"riasw/layout/_TabControllerMixin"
], function(rias, Button, _PanelWidget, _TemplatedMixin, _TabControllerMixin){

	var _riasType = "riasw.layout._TabButton";
	var TabButton = rias.declare(_riasType, [Button], {
		// summary:
		//		A tab (the thing you click to select a pane).
		// description:
		//		Contains the title of the pane, and optionally a close-button to destroy the pane.
		//		This is an internal widget and should not be instantiated directly.
		// tags:
		//		private

		templateString:
			'<div data-dojo-attach-point="focusNode,buttonNode" class="dijitReset" data-dojo-attach-event="onclick:_onClick" role="presentation">' +
				//'<div data-dojo-attach-point="badgeNode" class="${badgeClass}"></div>'+
				//'<div data-dojo-attach-point="iconNode" class="riaswButtonIcon riaswNoIcon"></div>' +
				//'<div data-dojo-attach-point="labelNode" class="riaswButtonLabel riaswNoLabel"></div>' +
				//'<div data-dojo-attach-point="closeNode" class="riaswTabCloseNode" data-dojo-attach-event="onclick:_onClose" role="presentation"></div>' +
			'</div>',

		baseClass: "riaswTab",
		//cssStateNodes: {
		//	closeNode: "riaswTabCloseNode"/// 移到 _setClosableAttr
		//},

		tabIndex: "-1",

		// closable: Boolean
		//		When true, display close button for this tab
		closable: false,

		_aria_attr: "aria-selected",

		// Button superclass maps name to a this.valueNode, but we don't have a this.valueNode attach point
		_setNameAttr: "focusNode",

		// Override _FormWidgetMixin.scrollOnFocus.
		// Don't scroll the whole tab container into view when the button is focused.
		scrollOnFocus: false,

		_setTargetWidgetAttr: function(widget){
			///TODO:zensst.以后考虑 label 和 iconClass 改变时的 containerLayout
			var self = this;
			rias.forEach(self._hBadge, function(item){
				item.remove();
			});
			if(rias.is(widget, "riasw.sys._WidgetBase")){
				widget.controlButton = self;
				self._hBadge = self.own(
					widget.watch('title', function(name, oldValue, newValue){
						self.set("label", newValue);
					}),
					widget.watch('label', function(name, oldValue, newValue){
						self.set("label", newValue);
					}),
					widget.watch('caption', function(name, oldValue, newValue){
						self.set("label", newValue);
					}),
					///不应该响应 widget.showCaption，而应该采用 button.showLabel
					//widget.watch('showCaption', function(name, oldValue, newValue){
					//	self.set("showLabel", newValue);
					//}),
					widget.watch('closable', function(name, oldValue, newValue){
						self.set("closable", newValue);
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
					})
				);
				self._set("targetWidget", widget);
				self.set("label", widget.get("caption") || widget.get("label") || widget.get("title"));
				///不应该响应 widget.showCaption，而应该采用 button.showLabel
				//self.set("showLabel", widget.get("showCaption"));
				self.set("closable", widget.get("closable"));
				self.set("disabled", widget.get("disabled"));
				self.set("textdir", widget.get("textdir"));
				self.set("tooltip", widget.get("tooltip"));
				self.set("iconClass", widget.get("iconClass"));
				self.set("badgeStyle", widget.get("badgeStyle"));
				self.set("badgeColor", widget.get("badgeColor"));
				self.set("badge", widget.get("badge"));
			}else{
				self._set("targetWidget", null);
				///这里不应该初始化 caption 等，而应该保持设计值。
				self._hBadge = undefined;
			}
		},
		buildRendering: function(){
			this.inherited(arguments);
			//(this.focusNode || this.domNode).setAttribute("role", "tab");
			rias.dom.setAttr(this.focusNode, "role", "tab");
			rias.dom.setSelectable(this.focusNode, false);
		},
		_onDestroy: function(){
			rias.forEach(this._hBadge, function(item){
				item.remove();
			});
			this._hBadge = undefined;
			if(this.targetWidget){
				this.targetWidget.controlButton = undefined;
				this.targetWidget = undefined;
			}
			this.inherited(arguments);
		},

		startup: function(){
			this.inherited(arguments);
			var n = this.domNode;

			// Required to give IE6 a kick, as it initially hides the
			// tabs until they are focused on.
			this.defer(function(){
				n.className = n.className;
			}, 1);
		},

		_setClosableAttr: function(/*Boolean*/ value){
			// summary:
			//		Hide/show close button
			value = !!value;
			this._set("closable", value);
			if(value){
				if(!this.closeNode){
					this.closeNode = rias.dom.place('<div data-dojo-attach-point="closeNode" class="riaswTabCloseNode" role="presentation">', this.domNode);
					this._trackMouseState(this.closeNode, "riaswTabCloseNode");
					this.own(rias.on(this.closeNode, rias.touch.press, rias.hitch(this, "_onClose")));
				}
			}else{
				if(this.closeNode){
					rias.dom.destroy(this.closeNode);
				}
			}
			rias.dom.toggleClass(this.domNode, "riaswTabClosable", value);
			if(this.closeNode){
				rias.dom.toggleClass(this.closeNode, "riaswHidden", !value);
			}
		},

		_onClick: function(e){
			e.stopPropagation();
			e.preventDefault();
			if(!this.disabled){
				if(this.targetWidget){
					this.controller.targetContainer.selectChild(this.targetWidget, true);
				}
			}
			return false;
		},

		_onClose: function(e){
			if(e){
				rias.stopEvent(e);
			}
			if(!this.disabled){
				if(this.targetWidget){
					var ctrl = this.controller;
					rias.when(ctrl.targetContainer.closeChild(this.targetWidget), function(result){
						if(ctrl.currentTarget){
							var b = ctrl.currentTarget.controlButton;
							if(b){
								rias.dom.focus(b.focusNode || b.domNode);
							}
						}
					});
				}
			}
			return false;
		}

	});

	var riaswType = "riasw.layout.TabController";
	var Widget = rias.declare(riaswType, [_PanelWidget, _TemplatedMixin, _TabControllerMixin], {
		// summary:
		//		Set of tabs (the things with titles and a close button, that you click to show a tab panel).
		//		Used internally by `riasw/layout/TabPanel`.
		// description:
		//		Lets the user select the currently shown pane in a TabContainer or StackContainer.
		//		TabController also monitors the TabContainer, and whenever a pane is
		//		added or deleted updates itself accordingly.
		// tags:
		//		private

		_riasdRefChildren: {
			items: "_docked",
			add: "addChild",
			remove: "removeChild"
		},

		baseClass: "riaswTabController",
		//使用 _TabControllerMixin 的 templateString
		//templateString: "<div role='tablist' data-dojo-attach-point='containerNode' data-dojo-attach-event='onkeydown:onkeydown'></div>",

		// buttonCtor: Constructor
		//		The tab widget to create to correspond to each page
		buttonCtor: TabButton,

		postCreate: function(){
			var self = this;
			self.inherited(arguments);

			// Listen to notifications from StackContainer.  This is tricky because the StackContainer may not have
			// been created yet, so abstracting it through topics.
			// Note: for TabContainer we can do this through bubbled events instead of topics; maybe that's
			// all we support for 2.0?
			self.own(
				rias.subscribe(self.targetContainer.id + "-addChild", rias.hitch(self, "doAddChild")),
				rias.subscribe(self.targetContainer.id + "-removeChild", rias.hitch(self, "doRemoveChild")),
				rias.subscribe(self.targetContainer.id + "-selectChild", rias.hitch(self, "doSelectChild")),
				rias.subscribe(self.targetContainer.id + "-containerKeyDown", rias.hitch(self, "doContainerKeyDown"))
			);
		},

		_setupChild: function(button, /*int*/ insertIndex){
			this.inherited(arguments);
			if(button){
				var wrapper = button.targetWidget._wrapper;
				wrapper.removeAttribute("aria-label");
				button._labelledby0 = wrapper.getAttribute("aria-labelledby");
				wrapper.setAttribute("aria-labelledby", button.id);
			}
		},
		doAddChild: function(/*_WidgetBase*/ page, /*Integer?*/ insertIndex){
			var button = page.controlButton;
			if(button){
				this.addChild(button, insertIndex);
			}else{
				button = this._createButton({
					//ownerDocument: this.ownerDocument,
					ownerRiasw: page,
					targetWidget: page,
					dir: page.dir,
					lang: page.lang,
					textDir: page.textDir || this.textDir,
					//id: page._riaswIdInModule ? this.id + "_" + page._riaswIdInModule : "",/// page 属于不同 Module 时，_riaswIdInModule 可能相同
					//name: page._riaswIdInModule ? this.id + "_" + page._riaswIdInModule : "",/// page 属于不同 Module 时，_riaswIdInModule 可能相同
					label: page.caption || page.title,
					showLabel: true,
					tooltip: page.tooltip || page.caption || page.title,
					tooltipPositions: this.targetContainer._tabPosition === "left" ? ["after-centered", "before-centered"]
						: this.targetContainer._tabPosition === "right" ? ["before-centered", "after-centered"]
						: this.targetContainer._tabPosition === "bottom" ? ["above-centered", "below-centered"]
						: undefined,
					disabled: (page.disabled == undefined ? false : !!page.disabled),
					closable: (page.closable == undefined ? false : !!page.closable),
					iconClass: page.iconClass,
					badgeStyle: page.badgeStyle,
					badgeColor: page.badgeColor,
					badge: page.badge
				});
				this.addChild(button, insertIndex);
			}
			//this.targetContainer.resize();
			if(this.targetContainer._canUpdateSize()){///需要忽略 _checkNeedResizeContent
				this.targetContainer._resizeContent();
			}
			if(!this.currentTarget){
				this.doSelectChild(page);
			}
		},
		doRemoveChild: function(/*_WidgetBase*/ page){
			this.removeChild(page.controlButton);
			if(this.targetContainer._canUpdateSize()){///需要忽略 _checkNeedResizeContent
				this.targetContainer._resizeContent();
			}
		},

		doSelectChild: function(/*_WidgetBase*/ page, /*Boolean*/ containerFocused){
			this.selectChild(page, containerFocused);
		},

		doContainerKeyDown: function(/*Object*/ info){
			// summary:
			//		Called when there was a keydown on the container
			// tags:
			//		private
			info.e._targetWidget = info.targetWidget;
			this.onkeydown(info.e);
		}

	});

	Widget.TabButton = TabButton;	// for monkey patching

	return Widget;
});
