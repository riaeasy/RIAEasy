define([
	"rias",
	"dijit/_FocusMixin"
], function(rias, _FocusMixin){

	// module:
	//		rias/riasw/widget/_HasDropDown

	return rias.declare("rias.riasw.widget._HasDropDown", _FocusMixin, {
		// summary:
		//		Mixin for widgets that need drop down ability.

		// _buttonNode: [protected] DomNode
		//		The button/icon/node to click to display the drop down.
		//		Can be set via a data-dojo-attach-point assignment.
		//		If missing, then either focusNode or domNode (if focusNode is also missing) will be used.
		_buttonNode: null,

		// _arrowWrapperNode: [protected] DomNode
		//		Will set CSS class dijitUpArrow, dijitDownArrow, dijitRightArrow etc. on this node depending
		//		on where the drop down is set to be positioned.
		//		Can be set via a data-dojo-attach-point assignment.
		//		If missing, then _buttonNode will be used.
		_arrowWrapperNode: null,

		// _popupStateNode: [protected] DomNode
		//		The node to set the aria-expanded class on.
		//		Also sets popupActive class but that will be removed in 2.0.
		//		Can be set via a data-dojo-attach-point assignment.
		//		If missing, then focusNode or _buttonNode (if focusNode is missing) will be used.
		_popupStateNode: null,

		// _aroundNode: [protected] DomNode
		//		The node to display the popup around.
		//		Can be set via a data-dojo-attach-point assignment.
		//		If missing, then domNode will be used.
		_aroundNode: null,

		// dropDown: [protected] Widget
		//		The widget to display as a popup.  This widget *must* be
		//		defined before the startup function is called.
		dropDown: null,

		// autoWidth: [protected] Boolean
		//		Set to true to make the drop down at least as wide as this
		//		widget.  Set to false if the drop down should just be its
		//		default width.
		autoWidth: true,

		// forceWidth: [protected] Boolean
		//		Set to true to make the drop down exactly as wide as this
		//		widget.  Overrides autoWidth.
		forceWidth: false,

		// maxHeight: [protected] Integer
		//		The max height for our dropdown.
		//		Any dropdown taller than this will have scrollbars.
		//		Set to 0 for no max height, or -1 to limit height to available space in viewport
		maxHeight: -1,

		// dropDownPosition: [const] String[]
		//		This variable controls the position of the drop down.
		//		It's an array of strings with the following values:
		//
		//		- before: places drop down to the left of the target node/widget, or to the right in
		//		  the case of RTL scripts like Hebrew and Arabic
		//		- after: places drop down to the right of the target node/widget, or to the left in
		//		  the case of RTL scripts like Hebrew and Arabic
		//		- above: drop down goes above target node
		//		- below: drop down goes below target node
		//
		//		The list is positions is tried, in order, until a position is found where the drop down fits
		//		within the viewport.
		//
		dropDownPosition: ["below", "above"],

		// _stopClickEvents: Boolean
		//		When set to false, the click events will not be stopped, in
		//		case you want to use them in your subclass
		_stopClickEvents: true,

		//增加
		_isDialogPanel: false,

		_onDropDownMouseDown: function(/*Event*/ e){
			// summary:
			//		Callback when the user mousedown/touchstart on the arrow icon.

			if(this.disabled || this.readOnly){
				return;
			}

			// Prevent default to stop things like text selection, but don't stop propagation, so that:
			//		1. TimeTextBox etc. can focus the <input> on mousedown
			//		2. dropDownButtonActive class applied by _CssStateMixin (on button depress)
			//		3. user defined onMouseDown handler fires
			//
			// Also, don't call preventDefault() on MSPointerDown event (on IE10) because that prevents the button
			// from getting focus, and then the focus manager doesn't know what's going on (#17262)
			if(e.type != "MSPointerDown" && e.type != "pointerdown"){
				e.preventDefault();
			}

			this.own(rias.on.once(this.ownerDocument, rias.touch.release, rias.hitch(this, "_onDropDownMouseUp")));

			this.toggleDropDown();
		},

		//修改
		_onDropDownMouseUp: function(e){
			var dropDown = this._dropDown,///需要取运行期 _dropDown
				overMenu = false;

			if(e && this._opened){
				// This code deals with the corner-case when the drop down covers the original widget,
				// because it's so large.  In that case mouse-up shouldn't select a value from the menu.
				// Find out if our target is somewhere in our dropdown widget,
				// but not over our _buttonNode (the clickable node)
				var c = rias.dom.position(this._buttonNode, true);
				if(!(e.pageX >= c.x && e.pageX <= c.x + c.w) || !(e.pageY >= c.y && e.pageY <= c.y + c.h)){
					var t = e.target;
					while(t && !overMenu){
						if(rias.dom.containsClass(t, "dijitPopup")){
							overMenu = true;
						}else{
							t = t.parentNode;
						}
					}
					if(overMenu){
						t = e.target;
						if(dropDown.onItemClick){
							var menuItem;
							while(t && !(menuItem = rias.by(t))){
								t = t.parentNode;
							}
							if(menuItem && menuItem.onClick && menuItem.getParent){
								menuItem.getParent().onItemClick(menuItem, e);
							}
						}
						return;
					}
				}
			}
			if(dropDown && this._opened){
				// Focus the dropdown widget unless it's a menu (in which case autoFocus is set to false).
				// Even if it's a menu, we need to focus it if this is a fake mouse event caused by the user typing
				// SPACE/ENTER while using JAWS.  Jaws converts the SPACE/ENTER key into mousedown/mouseup events.
				// If this.hovering is false then it's presumably actually a keyboard event.
				if(dropDown.focus && (dropDown.autoFocus !== false || (e.type == "mouseup" && !this.hovering))){
					// Do it on a delay so that we don't steal back focus from the dropdown.
					this._focusDropDownTimer = this.defer(function(){
						dropDown.focus();
						this._focusDropDownTimer = undefined;
					});
				}
			}else{
				// The drop down arrow icon probably can't receive focus, but widget itself should get focus.
				// defer() needed to make it work on IE (test DateTextBox)
				if(this.focus){
					this.defer("focus");
				}
			}
		},

		_onDropDownClick: function(/*Event*/ e){
			// The drop down was already opened on mousedown/keydown; just need to stop the event
			if(this._stopClickEvents){
				e.stopPropagation();
				e.preventDefault();
			}
		},

		buildRendering: function(){
			this.inherited(arguments);

			this._buttonNode = this._buttonNode || this.focusNode || this.domNode;
			this._popupStateNode = this._popupStateNode || this.focusNode || this._buttonNode;

			// Add a class to the "dijitDownArrowButton" type class to _buttonNode so theme can set direction of arrow
			// based on where drop down will normally appear
			var defaultPos = {
				"after": this.isLeftToRight() ? "Right" : "Left",
				"before": this.isLeftToRight() ? "Left" : "Right",
				"above": "Up",
				"below": "Down",
				"left": "Left",
				"right": "Right"
			}[this.dropDownPosition[0]] || this.dropDownPosition[0] || "Down";
			rias.dom.addClass(this._arrowWrapperNode || this._buttonNode, "dijit" + defaultPos + "ArrowButton");
		},

		postCreate: function(){
			// summary:
			//		set up nodes and connect our mouse and keyboard events

			this.inherited(arguments);

			var keyboardEventNode = this.focusNode || this.domNode;
			this.own(
				rias.on(this._buttonNode, rias.touch.press, rias.hitch(this, "_onDropDownMouseDown")),
				rias.on(this._buttonNode, "click", rias.hitch(this, "_onDropDownClick")),
				rias.on(keyboardEventNode, "keydown", rias.hitch(this, "_onKey")),
				rias.on(keyboardEventNode, "keyup", rias.hitch(this, "_onKeyUp"))
			);
		},

		//修改
		destroy: function(){
			// If dropdown is open, close it, to avoid leaving dijit/focus in a strange state.
			// Put focus back on me to avoid the focused node getting destroyed, which flummoxes IE.
			if(this._opened){
				this.closeDropDown(true);
			}

			if(this._dropDown){
				// Destroy the drop down, unless it's already been destroyed.  This can happen because
				// the drop down is a direct child of <body> even though it's logically my child.
				rias.destroy(this._dropDown);
				delete this._dropDown;
			}
			this.inherited(arguments);
		},

		//修改
		_onKey: function(/*Event*/ e){
			// summary:
			//		Callback when the user presses a key while focused on the button node

			if(this.disabled || this.readOnly){
				return;
			}
			var d = this._dropDown, target = e.target;
			if(d && this._opened && d.handleKey){
				if(d.handleKey(e) === false){
					/* false return code means that the drop down handled the key */
					e.stopPropagation();
					e.preventDefault();
					return;
				}
			}
			if(d && this._opened && e.keyCode == keys.ESCAPE){
				this.closeDropDown();
				e.stopPropagation();
				e.preventDefault();
			}else if(!this._opened &&
				(e.keyCode == keys.DOWN_ARROW ||
					// ignore unmodified SPACE if _KeyNavMixin has active searching in progress
					( (e.keyCode == keys.ENTER || (e.keyCode == keys.SPACE && (!this._searchTimer || (e.ctrlKey || e.altKey || e.metaKey)))) &&
						//ignore enter and space if the event is for a text input
						((target.tagName || "").toLowerCase() !== 'input' ||
							(target.type && target.type.toLowerCase() !== 'text'))))){
				// Toggle the drop down, but wait until keyup so that the drop down doesn't
				// get a stray keyup event, or in the case of key-repeat (because user held
				// down key for too long), stray keydown events
				this._toggleOnKeyUp = true;
				e.stopPropagation();
				e.preventDefault();
			}
		},
		//修改
		_onKeyUp: function(){
			if(this._toggleOnKeyUp){
				delete this._toggleOnKeyUp;
				this.toggleDropDown();
				var d = this._dropDown;	// drop down may not exist until toggleDropDown() call
				if(d && d.focus){
					this.defer(lang.hitch(d, "focus"), 1);
				}
			}
		},

		_onBlur: function(){
			// summary:
			//		Called magically when focus has shifted away from this widget and it's dropdown

			// Close dropdown but don't focus my <input>.  User may have focused somewhere else (ex: clicked another
			// input), and even if they just clicked a blank area of the screen, focusing my <input> will unwantedly
			// popup the keyboard on mobile.
			this.closeDropDown(false);

			this.inherited(arguments);
		},

		isLoaded: function(){
			// summary:
			//		Returns true if the dropdown exists and it's data is loaded.  This can
			//		be overridden in order to force a call to loadDropDown().
			// tags:
			//		protected

			return true;
		},

		loadDropDown: function(/*Function*/ loadCallback){
			// summary:
			//		Creates the drop down if it doesn't exist, loads the data
			//		if there's an href and it hasn't been loaded yet, and then calls
			//		the given callback.
			// tags:
			//		protected

			// TODO: for 2.0, change API to return a Deferred, instead of calling loadCallback?
			loadCallback();
		},

		//修改
		loadAndOpenDropDown: function(){
			// summary:
			//		Creates the drop down if it doesn't exist, loads the data
			//		if there's an href and it hasn't been loaded yet, and
			//		then opens the drop down.  This is basically a callback when the
			//		user presses the down arrow button to open the drop down.
			// returns: Deferred
			//		Deferred for the drop down widget that
			//		fires when drop down is created and loaded
			// tags:
			//		protected
			var self = this,
				d = rias.newDeferred("_HasDropDown.loadAndOpenDropDown", rias.defaultDeferredTimeout << 1, function(){
					this.cancel();
				}),
				afterLoad = function(){
					self.openDropDown();
					d.resolve(self._dropDown);
				};
			if(!this.isLoaded()){
				this.loadDropDown(afterLoad);
			}else{
				afterLoad();
			}
			return d;
		},

		//修改
		toggleDropDown: function(){
			// summary:
			//		Callback when the user presses the down arrow button or presses
			//		the down arrow key to open/close the drop down.
			//		Toggle the drop-down widget; if it is up, close it, if not, open it
			// tags:
			//		protected

			if(this.disabled || this.readOnly){
				return;
			}
			var self = this;
			///由于存在 focus()，及 focus.setNewStack 切换，会触发 onBlur，导致 closeDropDown
			//this.defer(function(){
			if(!self._opened){
				self.loadAndOpenDropDown();
			}else{
				self.closeDropDown(true);	// refocus button to avoid hiding node w/focus
			}
			//}, 30);
		},

		//增加
		beforeDropDown: function(argsOr_dropDown){
		},
		//增加
		beforeCloseDropDown: function(_dropDown){
		},
		//修改
		openDropDown: function(){
			var self = this,
				dd = self.dropDown, ddNode, ddId, retVal,
				around = self._aroundNode || self.domNode;

			function _size(popNode){
				// Set width of drop down if necessary, so that dropdown width + width of scrollbar (from popup wrapper)
				// matches width of aroundNode
				if(self.forceWidth || (self.autoWidth && around.offsetWidth > popNode.offsetWidth)){
					//this._origStyle = ddNode.style.cssText;
					var resizeArgs = rias.dom.getMarginBox(ddNode);
					resizeArgs = rias.dom.getBoxOfStyle(resizeArgs, ddNode.style);
					resizeArgs.w = around.offsetWidth;
					if(rias.isFunction(dd.resize)){
						dd.resize(resizeArgs);
					}else{
						rias.dom.setMarginBox(ddNode, resizeArgs);
					}
					// If dropdown is right-aligned then compensate for width change by changing horizontal position
					if(retVal.corner[1] == "R"){
						popNode.style.left = (popNode.style.left.replace("px", "") - around.offsetWidth + popNode.offsetWidth) + "px";
					}
				}
			}
			function _makeDropDown(args){
				args = rias.mixinDeep({}, args);
				args.ownerRiasw = self;
				args.ownerEditor = self;
				!args._riaswIdOfModule && self._riaswIdOfModule && (args._riaswIdOfModule = self._riaswIdOfModule + "_popup");
				args.dialogType = args.dialogType ? args.dialogType : "modal";
				args.parent = (args.parent != undefined ? args.parent : rias.dom.webAppNode);
				args.popupParent = self;
				//args.id = self.id + "_popup";
				args.around = around;
				//if(!args.region){
				//	args.region = "";
				//}
				if(!args.op){
					args.op = "select";
				}
				args.afterLoadedAllAndShown = function(){
					this.inheritedMeta(arguments);
					retVal = dd._initPos;
					_size(dd.domNode);
				};

				self.beforeDropDown(args);
				rias.decodeRiaswParams(self._riasrModule, args);
				dd = self._dropDown = rias.select(args);
				ddId = dd.id;
				ddNode = dd.domNode;
				self._isDialogPanel = true;

				dd.whenClose(function(closeResult){
					self.closeDropDown(true);
				});
				return dd;
			}
			function _popup(){
				retVal = rias.dom.openPopup({
					parent: self,
					popup: dd,
					around: around,
					orient: self.dropDownPosition,
					maxHeight: self.maxHeight,
					onExecute: function(){
						self.closeDropDown(true);
					},
					onCancel: function(){
						self.closeDropDown(true);
					},
					onClose: function(){
						rias.dom.setAttr(self._popupStateNode, "popupActive", false);
						rias.dom.removeClass(self._popupStateNode, "dijitHasDropDownOpen");
						self._set("_opened", false);	// use set() because _CssStateMixin is watching
					}
				});
				_size(dd._popupWrapper);
			}

			this._isDialogPanel = false;
			if(dd){
				if(rias.isFunction(dd)){
					dd = dd.apply(self, []);
				}else if(rias.isString(dd) || dd.$refObj || dd.$refScript){
					dd = rias.by(dd);
				}
			}
			if(rias.isDijit(dd) || rias.isDomNode(dd)){
				ddId = dd.id;
				ddNode = dd.domNode;
				self.beforeDropDown(dd);
				this._dropDown = dd;
				if(rias.isFunction(dd.refresh)){
					/*var handler = dropDown.on("load", function(){
					 handler.remove();
					 ///增加 hitch
					 rias.hitch(self, callback)();
					 });*/
					dd.refresh();		// tell it to load
					if(rias.isFunction(dd.whenLoadedAll)){
						dd.whenLoadedAll(function(result){
							if(result){
								_popup();
							}
						});
					}else{
						_popup();
					}
				}else{
					_popup();
				}
			}else if(rias.isObjectSimple(dd)){
				_makeDropDown(dd);
			}

			if(ddNode){
				rias.dom.setAttr(self._popupStateNode, "popupActive", "true");
				rias.dom.addClass(self._popupStateNode, "dijitHasDropDownOpen");
				self._set("_opened", true);	// use set() because _CssStateMixin is watching

				self._popupStateNode.setAttribute("aria-expanded", "true");
				self._popupStateNode.setAttribute("aria-owns", ddId);

				// Set aria-labelledby on _dropDown if it's not already set to something more meaningful
				if(ddNode.getAttribute("role") !== "presentation" && !ddNode.getAttribute("aria-labelledby")){
					ddNode.setAttribute("aria-labelledby", self.id);
				}
			}

			return retVal;
		},
		//修改
		closeDropDown: function(/*Boolean*/ focus){
			// summary:
			//		Closes the drop down on this widget
			// focus:
			//		If true, refocuses the button widget
			// tags:
			//		protected

			this.beforeCloseDropDown(this._dropDown);

			if(this._focusDropDownTimer){
				this._focusDropDownTimer.remove();
				delete this._focusDropDownTimer;
			}

			if(this._opened){
				this._popupStateNode.setAttribute("aria-expanded", "false");
				if(focus && this.focus){
					this.focus();
				}
				if(this._isDialogPanel){
					this._dropDown.close();
				}else{
					rias.dom.closePopup(this._dropDown);
				}
				this._opened = false;
			}

			//if(this._origStyle){
			//	this._dropDown.domNode.style.cssText = this._origStyle;
			//	delete this._origStyle;
			//}

			if(this._dropDown){
				this._dropDown = undefined;
			}
		}
	});
});
