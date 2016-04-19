
//RIAStudio client runtime widget - StackController

define([
	"rias",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_Container",
	"rias/riasw/form/ToggleButton",
	"dojo/touch"	// for normalized click handling, see dojoClick property setting in postCreate()
], function(rias, _Widget, _TemplatedMixin, _Container, ToggleButton){

	var _riasType = "rias.riasw.layout._StackButton";
	var StackButton = rias.declare(_riasType, ToggleButton, {
		// summary:
		//		Internal widget used by StackContainer.
		// description:
		//		The button-like or tab-like object you click to select or delete a page
		// tags:
		//		private

		// Override _FormWidget.tabIndex.
		// StackContainer buttons are not in the tab order by default.
		// Probably we should be calling this.startupKeyNavChildren() instead.
		tabIndex: "-1",

		// closeButton: Boolean
		//		When true, display close button for this tab
		closeButton: false,

		_aria_attr: "aria-selected",

		//watchTargetState: true,

		buildRendering: function(/*Event*/ evt){
			//this.isRiaswTextVertical = /left|right/.test(this.tabPosition);
			this.iconLayoutTop = /left|right/.test(this.tabPosition);
			this.inherited(arguments);
			(this.focusNode || this.domNode).setAttribute("role", "tab");
		},

		postCreate: function(){
			var self = this,
				page = self.page;
			self.inherited(arguments);
			//if(self.watchTargetState){
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
			//}
		}
	});


	var riasType = "rias.riasw.layout.StackController";
	var Widget = rias.declare(riasType, [_Widget, _TemplatedMixin, _Container], {
		// summary:
		//		Set of buttons to select a page in a `dijit/layout/StackContainer`
		// description:
		//		Monitors the specified StackContainer, and whenever a page is
		//		added, deleted, or selected, updates itself accordingly.

		baseClass: "dijitStackController",

		templateString: "<span role='tablist' data-dojo-attach-point='containerNode' data-dojo-attach-event='onkeydown'></span>",

		// containerId: [const] String
		//		The id of the page container that I point to
		containerId: "",

		// buttonWidget: [const] Constructor
		//		The button widget to create to correspond to each page
		buttonWidget: StackButton,

		// buttonWidgetCloseClass: String
		//		CSS class of [x] close icon, used by event delegation code to tell when close button was clicked
		buttonWidgetCloseClass: "dijitStackCloseButton",

		page2button: function(/*dijit|riasWidget*/page){
			// summary:
			//		Returns the button corresponding to the pane w/the given id.
			// tags:
			//		protected
			return rias.by(this.id + "_" + (page._riaswIdOfModule ? page._riaswIdOfModule : page.id));
		},

		buildRendering: function(){
			this.inherited(arguments);
		},
		postCreate: function(){
			var self = this;
			self.inherited(arguments);

			// Listen to notifications from StackContainer.  This is tricky because the StackContainer may not have
			// been created yet, so abstracting it through topics.
			// Note: for TabContainer we can do this through bubbled events instead of topics; maybe that's
			// all we support for 2.0?
			self.own(
				rias.subscribe(self.containerId + "-startup", rias.hitch(self, "onStartup")),
				rias.subscribe(self.containerId + "-addChild", rias.hitch(self, "onAddChild")),
				rias.subscribe(self.containerId + "-removeChild", rias.hitch(self, "onRemoveChild")),
				rias.subscribe(self.containerId + "-selectChild", rias.hitch(self, "onSelectChild")),
				rias.subscribe(self.containerId + "-containerKeyDown", rias.hitch(self, "onContainerKeyDown"))
			);

			// Listen for click events to select or close tabs.
			// No need to worry about ENTER/SPACE key handling: tabs are selected via left/right arrow keys,
			// and closed via shift-F10 (to show the close menu).
			// Also, add flag to use normalized click handling from dojo/touch
			self.containerNode.dojoClick = true;
			self.own(rias.on(self.containerNode, 'click', function(evt){
				var button = rias.registry.getEnclosingWidget(evt.target);
				if(button != self.containerNode && !button.disabled && button.page){
					for(var target = evt.target; target !== self.containerNode; target = target.parentNode){
						if(rias.dom.hasClass(target, self.buttonWidgetCloseClass)){
							self.onCloseButtonClick(button.page);
							break;
						}else if(target == button.domNode){
							self.onButtonClick(button.page);
							break;
						}
					}
				}
			}));
		},

		onStartup: function(/*Object*/ info){
			// summary:
			//		Called after StackContainer has finished initializing
			// tags:
			//		private
			var self = this;
			self.textDir = info.textDir;
			rias.forEach(info.children, self.onAddChild, self);
			if(info.selected){
				// Show button corresponding to selected pane (unless selected
				// is null because there are no panes)
				self.onSelectChild(info.selected);
			}

			// Reflect events like page title changes to tab buttons
			var containerNode = rias.by(self.containerId).containerNode,
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
						var button = self.page2button(evt.detail && evt.detail.widget);
						if(button){
							button.set(buttonAttr, evt.detail.newValue);
						}
					});
				};
			for(var attr in paneToButtonAttr){
				self.own(connectFunc(attr, paneToButtonAttr[attr]));
			}
		},

		destroy: function(preserveDom){
			// Since the buttons are internal to the StackController widget, destroy() should remove them.
			// When #5796 is fixed for 2.0 can get rid of this function completely.
			this.destroyDescendants(preserveDom);
			this.inherited(arguments);
		},

		onAddChild: function(/*dijit/_WidgetBase*/ page, /*Integer?*/ insertIndex){
			var button = page.controlButton;
			if(button){
				this.addChild(button, insertIndex);
			}else{
				var Cls = rias.isString(this.buttonWidget) ? rias.getObject(this.buttonWidget) : this.buttonWidget;
				button = new Cls({
					ownerRiasw: this,
					id: this.id + "_" + (page._riaswIdOfModule ? page._riaswIdOfModule : page.id),
					name: this.id + "_" + (page._riaswIdOfModule ? page._riaswIdOfModule : page.id), // note: must match id used in page2button()
					label: page.caption || page.title,
					disabled: (page.disabled == undefined ? true : !!page.disabled),
					ownerDocument: this.ownerDocument,
					dir: page.dir,
					tabPosition: this.tabPosition,
					lang: page.lang,
					textDir: page.textDir || this.textDir,
					showLabel: (page.showCaption == undefined ? true : !!page.showCaption),
					iconClass: page.iconClass || "dijitNoIcon",
					closeButton: (page.closable == undefined ? true : !!page.closable),
					tooltip: page.tooltip || page.caption || page.title,
					//watchTargetState: (page.watchTargetState != undefined ? page.watchTargetState : true),
					page: page
				});
				this.addChild(button, insertIndex);
				page.controlButton = button;	// this value might be overwritten if two tabs point to same container
			}
			if(!this._currentChild){
				this.onSelectChild(page);
			}
			var labelledby = page._wrapper.getAttribute("aria-labelledby") ?
				page._wrapper.getAttribute("aria-labelledby") + " " + button.id : button.id;
			page._wrapper.removeAttribute("aria-label");
			page._wrapper.setAttribute("aria-labelledby", labelledby);
		},

		onRemoveChild: function(/*dijit/_WidgetBase*/ page){
			// summary:
			//		Called whenever a page is removed from the container.
			//		Remove the button corresponding to the page.
			// tags:
			//		private

			if(this._currentChild === page){
				this._currentChild = null;
			}

			var button = this.page2button(page);
			if(button){
				this.removeChild(button);
				button.destroy();
			}
			page.controlButton = undefined;
		},

		onSelectChild: function(/*dijit/_WidgetBase*/ page){
			// summary:
			//		Called when a page has been selected in the StackContainer, either by me or by another StackController
			// tags:
			//		private

			if(!page){
				return;
			}

			if(this._currentChild){
				var oldButton = this.page2button(this._currentChild);
				oldButton.set('checked', false);
				oldButton.focusNode.setAttribute("tabIndex", "-1");
			}

			var newButton = this.page2button(page);
			newButton.set('checked', true);
			this._currentChild = page;
			newButton.focusNode.setAttribute("tabIndex", "0");
			var container = rias.by(this.containerId);
		},

		onButtonClick: function(/*dijit/_WidgetBase*/ page){
			// summary:
			//		Called whenever one of my child buttons is pressed in an attempt to select a page
			// tags:
			//		private

			var button = this.page2button(page);

			// For TabContainer where the tabs are <span>, need to set focus explicitly when left/right arrow
			rias.dom.focus(button.focusNode);

			if(this._currentChild && this._currentChild === page){
				//In case the user clicked the checked button, keep it in the checked state because it remains to be the selected stack page.
				button.set('checked', true);
			}
			var container = rias.by(this.containerId);
			container.selectChild(page, true);
		},

		onCloseButtonClick: function(/*dijit/_WidgetBase*/ page){
			// summary:
			//		Called whenever one of my child buttons [X] is pressed in an attempt to close a page
			// tags:
			//		private

			var container = rias.by(this.containerId);
			container.closeChild(page);
			if(this._currentChild){
				var b = this.page2button(this._currentChild);
				if(b){
					rias.dom.focus(b.focusNode || b.domNode);
				}
			}
		},

		// TODO: this is a bit redundant with forward, back api in StackContainer
		adjacent: function(/*Boolean*/ forward){
			// summary:
			//		Helper for onkeydown to find next/previous button
			// tags:
			//		private

			if(!this.isLeftToRight() && (!this.tabPosition || /top|bottom/.test(this.tabPosition))){
				forward = !forward;
			}
			// find currently focused button in children array
			var children = this.getChildren();
			var idx = rias.indexOf(children, this.page2button(this._currentChild)),
				current = children[idx];

			// Pick next/previous non-disabled button to focus on.   If we get back to the original button it means
			// that all buttons must be disabled, so return current child to avoid an infinite loop.
			var child;
			do{
				idx = (idx + (forward ? 1 : children.length - 1)) % children.length;
				child = children[idx];
			}while(child.disabled && child != current);

			return child; // dijit/_WidgetBase
		},

		onkeydown: function(/*Event*/ e, /*Boolean?*/ fromContainer){
			// summary:
			//		Handle keystrokes on the page list, for advancing to next/previous button
			//		and closing the current page if the page is closable.
			// tags:
			//		private

			if(this.disabled || e.altKey){
				return;
			}
			var forward = null;
			if(e.ctrlKey || !e._djpage){
				switch(e.keyCode){
					case rias.keys.LEFT_ARROW:
					case rias.keys.UP_ARROW:
						if(!e._djpage){
							forward = false;
						}
						break;
					case rias.keys.PAGE_UP:
						if(e.ctrlKey){
							forward = false;
						}
						break;
					case rias.keys.RIGHT_ARROW:
					case rias.keys.DOWN_ARROW:
						if(!e._djpage){
							forward = true;
						}
						break;
					case rias.keys.PAGE_DOWN:
						if(e.ctrlKey){
							forward = true;
						}
						break;
					case rias.keys.HOME:
						// Navigate to first non-disabled child
						var children = this.getChildren();
						for(var idx = 0; idx < children.length; idx++){
							var child = children[idx];
							if(!child.disabled){
								this.onButtonClick(child.page);
								break;
							}
						}
						e.stopPropagation();
						e.preventDefault();
						break;
					case rias.keys.END:
						// Navigate to last non-disabled child
						var children = this.getChildren();
						for(var idx = children.length - 1; idx >= 0; idx--){
							var child = children[idx];
							if(!child.disabled){
								this.onButtonClick(child.page);
								break;
							}
						}
						e.stopPropagation();
						e.preventDefault();
						break;
					case rias.keys.DELETE:
					case "W".charCodeAt(0):    // ctrl-W
						if(this._currentChild.closable &&
							(e.keyCode == rias.keys.DELETE || e.ctrlKey)){
							this.onCloseButtonClick(this._currentChild);

							// avoid browser tab closing
							e.stopPropagation();
							e.preventDefault();
						}
						break;
					case rias.keys.TAB:
						if(e.ctrlKey){
							this.onButtonClick(this.adjacent(!e.shiftKey).page);
							e.stopPropagation();
							e.preventDefault();
						}
						break;
				}
				// handle next/previous page navigation (left/right arrow, etc.)
				if(forward !== null){
					this.onButtonClick(this.adjacent(forward).page);
					e.stopPropagation();
					e.preventDefault();
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

	Widget.StackButton = StackButton;	// for monkey patching

	return Widget;
});
