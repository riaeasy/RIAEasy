
//RIAStudio client runtime widget - TabController

define([
	"rias",
	"rias/riasw/form/ToggleButton",
	"rias/riasw/layout/_PanelBase",
	"dijit/_TemplatedMixin",
	"rias/riasw/layout/_TabControllerMixin"
], function(rias, ToggleButton, _PanelBase, _TemplatedMixin, _TabControllerMixin){

	var _riasType = "rias.riasw.layout._TabButton";
	var TabButton = rias.declare(_riasType + (rias.has("dojo-bidi") ? "_NoBidi" : ""), [ToggleButton], {
		// summary:
		//		A tab (the thing you click to select a pane).
		// description:
		//		Contains the title of the pane, and optionally a close-button to destroy the pane.
		//		This is an internal widget and should not be instantiated directly.
		// tags:
		//		private

		// baseClass: String
		//		The CSS class applied to the domNode.
		baseClass: "riaswTab",

		// Apply riaswTabCloseButtonHover when close button is hovered
		cssStateNodes: {
			closeNode: "riaswTabCloseButton"
		},

		templateString:
			'<span role="presentation" data-dojo-attach-point="focusNode,buttonNode,containerNode" data-dojo-attach-event="onclick:_onClick">' +
				'<span data-dojo-attach-point="badgeNode" class="${badgeClass}"></span>'+
				'<span role="presentation" data-dojo-attach-point="iconNode" class="dijitInline dijitIcon riaswButtonIconNode"></span>' +
				'<span data-dojo-attach-point="labelNode" class="riaswButtonText"></span>' +
				'<span role="presentation" data-dojo-attach-point="closeNode" class="dijitInline riaswTabCloseButton riaswTabCloseIcon" data-dojo-attach-event="onclick:_onClose">' +
					'<span data-dojo-attach-point="closeText" class="riaswTabCloseText">[x]</span>' +
				'</span>' +
			'</span>',

		tabIndex: "-1",

		// closeButton: Boolean
		//		When true, display close button for this tab
		closeButton: false,

		_aria_attr: "aria-selected",

		// Button superclass maps name to a this.valueNode, but we don't have a this.valueNode attach point
		_setNameAttr: "focusNode",

		// Override _FormWidget.scrollOnFocus.
		// Don't scroll the whole tab container into view when the button is focused.
		scrollOnFocus: false,

		buildRendering: function(){
			this.inherited(arguments);
			(this.focusNode || this.domNode).setAttribute("role", "tab");
			rias.dom.setSelectable(this.containerNode, false);
		},
		postCreate: function(){
			var self = this,
				page = self.page;
			self.inherited(arguments);
			self.own(
				page.watch('caption', function(name, oldValue, newValue){
					self.set("label", newValue);
				}),
				page.watch('tooltip', function(name, oldValue, newValue){
					self.set("tooltip", newValue);
				}),
				page.watch('iconClass', function(name, oldValue, newValue){
					self.set("iconClass", newValue);
				}),
				page.watch('badgeStyle', function(name, oldValue, newValue){
					self.set("badgeStyle", newValue);
				}),
				page.watch('badgeColor', function(name, oldValue, newValue){
					self.set("badgeColor", newValue);
				}),
				page.watch('badge', function(name, oldValue, newValue){
					self.set("badge", newValue);
					//}),
					//page.watch('displayState', function(name, oldValue, newValue){
					//	self.setTargetState(newValue);
				})
			);
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

		_setCloseButtonAttr: function(/*Boolean*/ disp){
			// summary:
			//		Hide/show close button
			this._set("closeButton", disp);
			rias.dom.toggleClass(this.domNode, "dijitClosable", !!disp);
			this.closeNode.style.display = disp ? "" : "none";
			if(disp){
				if(this.closeNode){
					rias.dom.setAttr(this.closeNode, "title", rias.i18n.action.close);
				}
			}
		},

		_setDisabledAttr: function(/*Boolean*/ disabled){
			// summary:
			//		Make tab selected/unselectable

			this.inherited(arguments);

			// Don't show tooltip for close button when tab is disabled
			if(this.closeNode){
				if(disabled){
					rias.dom.removeAttr(this.closeNode, "title");
				}else{
					rias.dom.setAttr(this.closeNode, "title", rias.i18n.action.close);
				}
			}
		},

		_setLabelAttr: function(/*String*/ content){
			///注意 if(has("dojo-bidi")) 是两个不同的类
			this.inherited(arguments);
			if(!this.showLabel && !this.params.title){
				this.iconNode.alt = rias.trim(this.containerNode.innerText || this.containerNode.textContent || '');
			}
			if(rias.has("dojo-bidi")){
				this.applyTextDir(this.iconNode, this.iconNode.alt);
			}
		},

		_onClick: function(e){
			e.stopPropagation();
			e.preventDefault();
			if(!this.disabled){
				if(this.page){
					this.ownerController.ownerContainer.selectChild(this.page, true);
				}
			}
			return false;
		},

		_onClose: function(e){
			e.stopPropagation();
			e.preventDefault();
			if(!this.disabled){
				if(this.page){
					var ctrl = this.ownerController;
					rias.when(ctrl.ownerContainer.closeChild(this.page), function(result){
						if(ctrl._currentTarget){
							var b = ctrl._currentTarget.controllButton;
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

	if(rias.has("dojo-bidi")){
		TabButton = rias.declare(_riasType, TabButton, {
			_setLabelAttr: function(/*String*/ content){
				this.inherited(arguments);
				this.applyTextDir(this.iconNode, this.iconNode.alt);
			}
		});
	}

	var riaswType = "rias.riasw.layout.TabController";
	var Widget = rias.declare(riaswType, [_PanelBase, _TemplatedMixin, _TabControllerMixin], {
		// summary:
		//		Set of tabs (the things with titles and a close button, that you click to show a tab panel).
		//		Used internally by `dijit/layout/TabContainer`.
		// description:
		//		Lets the user select the currently shown pane in a TabContainer or StackContainer.
		//		TabController also monitors the TabContainer, and whenever a pane is
		//		added or deleted updates itself accordingly.
		// tags:
		//		private

		baseClass: "riaswTabController",
		//使用 _TabControllerMixin 的 templateString
		//templateString: "<div role='tablist' data-dojo-attach-point='containerNode' data-dojo-attach-event='onkeydown:onkeydown'></div>",

		ownerContainer: null,

		// buttonWidget: Constructor
		//		The tab widget to create to correspond to each page
		buttonWidget: TabButton,
		// buttonWidgetCloseClass: String
		//		Class of [x] close icon, used by event delegation code to tell when close button was clicked
		buttonWidgetCloseClass: "riaswTabCloseButton",

		postCreate: function(){
			var self = this;
			self.inherited(arguments);

			// Listen to notifications from StackContainer.  This is tricky because the StackContainer may not have
			// been created yet, so abstracting it through topics.
			// Note: for TabContainer we can do this through bubbled events instead of topics; maybe that's
			// all we support for 2.0?
			self.own(
				rias.subscribe(self.ownerContainer.id + "-startup", rias.hitch(self, "doStartup")),
				rias.subscribe(self.ownerContainer.id + "-addChild", rias.hitch(self, "doAddChild")),
				rias.subscribe(self.ownerContainer.id + "-removeChild", rias.hitch(self, "doRemoveChild")),
				rias.subscribe(self.ownerContainer.id + "-selectChild", rias.hitch(self, "onSelectChild")),
			rias.subscribe(self.ownerContainer.id + "-containerKeyDown", rias.hitch(self, "onContainerKeyDown"))
			);
		},
		/*destroy: function(preserveDom){
			// Since the buttons are internal to the StackController widget, destroy() should remove them.
			// When #5796 is fixed for 2.0 can get rid of this function completely.
			this.destroyDescendants(preserveDom);
			this.inherited(arguments);
		},*/

		doStartup: function(info){
			var self = this;
			self.textDir = info.textDir;
			rias.forEach(info.children, self.doAddChild, self);
			if(info.selected){
				// Show button corresponding to selected pane (unless selected
				// is null because there are no panes)
				self.onSelectChild(info.selected);
			}

			// Reflect events like page title changes to tab buttons
			var containerNode = self.ownerContainer.containerNode,
				paneToButtonAttr = {
					"title": "label",
					"label": "label",
					"showcaption": "showLabel",
					"iconclass": "iconClass",
					"closable": "closeButton",
					"tooltip": "title",
					"disabled": "disabled",
					"textdir": "textdir"
				},
				connectFunc = function(attr, buttonAttr){
					return rias.on(containerNode, "attrmodified-" + attr, function(evt){
						var button = evt.detail && evt.detail.widget;
						button = button.controllButton;
						if(button){
							button.set(buttonAttr, evt.detail.newValue);
						}
					});
				};
			for(var attr in paneToButtonAttr){
				self.own(connectFunc(attr, paneToButtonAttr[attr]));
			}

			this.own(rias.on(this.containerNode, "attrmodified-label, attrmodified-iconclass", function(evt){
				self.resize();
			}));
		},
		doAddChild: function(/*dijit/_WidgetBase*/ page, /*Integer?*/ insertIndex, noresize){
			var button = page.controllButton;
			if(button){
				this.addChild(button, insertIndex, noresize);
			}else{
				var Cls = rias.isString(this.buttonWidget) ? rias.getObject(this.buttonWidget) : this.buttonWidget;
				button = this.createButton(Cls, {
					id: this.id + "_" + (page._riaswIdOfModule ? page._riaswIdOfModule : page.id),
					name: this.id + "_" + (page._riaswIdOfModule ? page._riaswIdOfModule : page.id),
					label: page.caption || page.title,
					disabled: (page.disabled == undefined ? false : !!page.disabled),
					ownerDocument: this.ownerDocument,
					dir: page.dir,
					lang: page.lang,
					textDir: page.textDir || this.textDir,
					showLabel: true,// (page.showCaption == undefined ? true : !!page.showCaption),
					iconClass: page.iconClass || "dijitNoIcon",
					closeButton: (page.closable == undefined ? false : !!page.closable),
					tooltip: page.tooltip || page.caption || page.title,
					page: page
				});
				this.addChild(button, insertIndex, noresize);
				page.controllButton = button;	// this value might be overwritten if two tabs point to same container
			}
			if(!this._currentTarget){
				this.onSelectChild(page);
			}
			var labelledby = page._wrapper.getAttribute("aria-labelledby") ?
				page._wrapper.getAttribute("aria-labelledby") + " " + button.id : button.id;
			page._wrapper.removeAttribute("aria-label");
			page._wrapper.setAttribute("aria-labelledby", labelledby);
		},
		doRemoveChild: function(/*dijit/_WidgetBase*/ page, noresize){
			if(this._currentTarget === page){
				this._currentTarget = null;
			}
			var button = page.controllButton;
			if(button){
				if(this._selectedButtonNode === button.domNode){
					this._selectedButtonNode = null;
				}
				this.removeChild(button, noresize);
				rias.destroy(button);
			}
			page.controllButton = undefined;
		},

		onSelectChild: function(/*dijit/_WidgetBase*/ page, /*Boolean*/ tabContainerFocused){
			if(!page){
				return;
			}

			var button;
			if(this._currentTarget){
				button = this._currentTarget.controllButton;
				if(button){
					button.set('checked', false);
					button.focusNode.setAttribute("tabIndex", "-1");
				}
			}

			button = page.controllButton;
			if(!button){
				return;
			}
			button.set('checked', true);
			this._currentTarget = page;
			button.focusNode.setAttribute("tabIndex", "0");

			var node = button.domNode;
			// Save the selection
			if(node != this._selectedButtonNode){
				this._selectedButtonNode = node;
				// Scroll to the selected tab, except on startup, when scrolling is handled in resize()
				if(this._postResize){
					var sl = this._getScroll();

					if(sl > (this._isTabV ? node.offsetTop : node.offsetLeft) ||
						sl + this._getSize(this.scrollNode) < (this._isTabV ? node.offsetTop : node.offsetLeft) + this._getSize(node)){
						var anim = this.createSmoothScroll();
						if(tabContainerFocused){
							anim.onEnd = function(){
								// Focus is on hidden tab or previously selected tab label.  Move to current tab label.
								button.focus();
							};
						}
						anim.play();
					}else if(tabContainerFocused){
						// Focus is on hidden tab or previously selected tab label.  Move to current tab label.
						button.focus();
					}
				}
			}
		},

		onContainerKeyDown: function(/*Object*/ info){
			// summary:
			//		Called when there was a keydown on the container
			// tags:
			//		private
			info.e._djpage = info.page;
			this.onkeydown(info.e);
		}

	});

	Widget.TabButton = TabButton;	// for monkey patching

	return Widget;
});
