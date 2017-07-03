define([
	"riasw/riaswBase"
], function(rias){

	// module:
	//		riasw/sys/_HasDropDown

	//var _focusDelay = 8;

	return rias.declare("riasw.sys._HasDropDown", null, {
		// summary:
		//		Mixin for widgets that need drop down ability.

		// _dropDownButton: [protected] DomNode
		//		The button/icon/node to click to display the drop down.
		//		Can be set via a data-dojo-attach-point assignment.
		//		If missing, then either focusNode or domNode (if focusNode is also missing) will be used.
		_dropDownButton: null,

		// _popupStateNode: [protected] DomNode
		//		The node to set the aria-expanded class on.
		//		Can be set via a data-dojo-attach-point assignment.
		//		If missing, then focusNode or _dropDownButton (if focusNode is missing) will be used.
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

		// popupPositions: [const] String[]
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
		//		The list is popupPositions is tried, in order, until a position is found where the drop down fits
		//		within the viewport.
		//
		popupPositions: ["below-alt", "above-alt", "after-centered", "before-centered"],

		// _stopClickEvents: Boolean
		//		When set to false, the click events will not be stopped, in
		//		case you want to use them in your subclass
		_stopClickEvents: true,

		//增加
		_closeDropDownAction: "",
		//openOnfocus: true,

		_onDropDownMouseDown: function(e){
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
			if(e.type !== "MSPointerDown"){
				e.preventDefault();
			}

			this.own(rias.on.once(this.ownerDocument, rias.touch.release, rias.hitch(this, "_onDropDownMouseUp")));

			this._mouseDownTarget = e.target;
			//this.toggleDropDown(e);
		},

		//修改
		_onDropDownMouseUp: function(e){
			/*var dropDown = this.dropDown;

			if(dropDown && e && this._opened){
				// This code deals with the corner-case when the drop down covers the original widget,
				// because it's so large.  In that case mouse-up shouldn't select a value from the menu.
				// Find out if our target is somewhere in our dropdown widget,
				// but not over our _dropDownButton (the clickable node)
				var c = rias.dom.getPosition(this._dropDownButton, true);
				if(!(e.pageX >= c.x && e.pageX <= c.x + c.w) || !(e.pageY >= c.y && e.pageY <= c.y + c.h)){
					var t = e.target;
					if(rias.dom.contains(dropDown.domNode, t)){
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
				if(dropDown.focus && (dropDown.autoFocus !== false || (e.type === "mouseup" && !this.hovering))){
					// Do it on a delay so that we don't steal back focus from the dropdown.
					this._focusDropDownTimer = this.defer(function(){
						dropDown.focus(true, true);
						this._focusDropDownTimer = undefined;
					}, _focusDelay);
				}
			}else{
				// The drop down arrow icon probably can't receive focus, but widget itself should get focus.
				// defer() needed to make it work on IE (test DateTextBox)
				if(this.focus){
					this.defer("focus", _focusDelay, true);
				}
			}*/
			if(e.target === this._mouseDownTarget){
				this.toggleDropDown(e);
			}
			delete this._mouseDownTarget;
		},
		_onDropDownClick: function(/*Event*/ e){
			// The drop down was already opened on mousedown/keydown; just need to stop the event
			/// 由于子类有可能用 valueNode.click 冒泡，且，_dropDownButton 有可能是 domNode、focusNode，响应 click 可能有冲突，故不能在这里 toggleDropDown
			if(this._stopClickEvents){
				e.stopPropagation();
				e.preventDefault();
			}
		},

		buildRendering: function(){
			this.inherited(arguments);

			this._dropDownButton = this._dropDownButton || this.focusNode || this.domNode;
			this._popupStateNode = this._popupStateNode || this.focusNode || this._dropDownButton;
		},

		postCreate: function(){
			// summary:
			//		set up nodes and connect our mouse and keyboard events

			this.inherited(arguments);

			var keyboardEventNode = this.focusNode || this.domNode;
			this.own(
				rias.on(this._dropDownButton, rias.touch.press, rias.hitch(this, "_onDropDownMouseDown")),
				rias.on(this._dropDownButton, "click", rias.hitch(this, "_onDropDownClick")),
				rias.on(keyboardEventNode, "keydown", rias.hitch(this, "_onKey")),
				rias.on(keyboardEventNode, "keyup", rias.hitch(this, "_onKeyUp"))
			);
		},

		//修改
		_onDestroy: function(){
			// If dropdown is open, close it, to avoid leaving riasw/focus in a strange state.
			// Put focus back on me to avoid the focused node getting destroyed, which flummoxes IE.
			this.closeDropDown(true);///即使 dropDown 没有 hide/close/destroy，下一步也 destroy
			if(this.dropDown){
				// Destroy the drop down, unless it's already been destroyed.  This can happen because
				// the drop down is a direct child of <body> even though it's logically my child.
				if(this.dropDown.getOwnerRiasw && this.dropDown.getOwnerRiasw() === this){
					rias.destroy(this.dropDown);///如果是 属于 this 的，可以让 inherited 自动释放，如果不是，则不应该 destroy
				}
				delete this.dropDown;
			}
			this.inherited(arguments);
		},

		//修改
		_onKey: function(/*Event*/ e){
			// summary:
			//		Callback when the user presses a key while focused on the button node

			var d = this.dropDown,
				target = e.target;
			if(!d || this.disabled || this.readOnly){
				return;
			}
			if(this._opened && d.handleKey){
				if(d.handleKey(e) === false){
					/* false return code means that the drop down handled the key */
					e.stopPropagation();
					e.preventDefault();
					return;
				}
			}
			if(this._opened && e.keyCode === rias.keys.ESCAPE){
				this.closeDropDown(true);
				e.stopPropagation();
				e.preventDefault();
			}else if(!this.isOpened() &&
				(e.keyCode === rias.keys.DOWN_ARROW ||
					// ignore unmodified SPACE if _KeyNavMixin has active searching in progress
					( (e.keyCode === rias.keys.ENTER || (e.keyCode === rias.keys.SPACE && (!this._searchTimer || (e.ctrlKey || e.altKey || e.metaKey)))) &&
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
		_onKeyUp: function(evt){
			if(this._toggleOnKeyUp){
				delete this._toggleOnKeyUp;
				this.toggleDropDown(evt);
			}
		},

		/*focus: function(){
			///不能准确判断是新的 focus 还是 closeDropDown 触发的 focus，即，不能正确判断是否应该 open，还是放弃，应用中自行处理。
			this.inherited(arguments);
			if(!this.disabled && !this.readOnly){
				if(this.openOnfocus && !this.get("editable")){
					if(!this.isOpened()){
						this.defer(this.loadAndOpenDropDown, 1000);///有可能是前一个 dropDown.destroy 触发，此时尚未 destroy 完毕，需要 defer。
					}
				}
			}
		},*/
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
		isOpened: function(){
			return this._opening || this._opened;
		},

		//修改
		toggleDropDown: function(e){
			// summary:
			//		Callback when the user presses the down arrow button or presses
			//		the down arrow key to open/close the drop down.
			//		Toggle the drop-down widget; if it is up, close it, if not, open it
			// tags:
			//		protected

			if(this.disabled || this.readOnly){
				return rias.when(false);
			}
			rias._debounce(this.id + ".toggleDropDown", function(){
				///由于存在 focus()，及 focus.setNewStack 切换，会触发 onBlur，导致 closeDropDown
				if(!this.isOpened()){
					this.loadAndOpenDropDown();
				}else{
					this.closeDropDown(true);	// refocus button to avoid hiding node w/focus
				}
			}, this, 33)();
		},
		onLoadDropDown: function(){
			return this.dropDown;
		},
		loadDropDown: function(){
			return rias.when(this.onLoadDropDown());
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
				d = rias.newDeferred("_HasDropDown.loadAndOpenDropDown", rias.defaultDeferredTimeout, function(){
					this.cancel();
				}),
				afterLoad = function(dropDown){
					if(!self.isDestroyed()){
						self.openDropDown();
						d.resolve(self.dropDown);
					}else{
						d.cancel(self.id + " destroyed.");
					}
				};
			if(!this.isLoaded()){
				this.loadDropDown().then(afterLoad);
			}else{
				afterLoad(this.dropDown);
			}
			return d.promise;
		},
		//增加
		beforeCloseDropDown: function(dropDown){
		},
		//修改
		openDropDown: function(){
			var self = this,
				dd = self.dropDown, ddNode, ddId, pos,
				around = self._aroundNode || self.domNode;

			function _size(popNode){
				// Set width of drop down if necessary, so that dropdown width + width of scrollbar (from popup wrapper)
				// matches width of aroundNode
				if(self.forceWidth || self.autoWidth){
					if(popNode && self.autoWidth && around.offsetWidth > popNode.offsetWidth){
						// If dropdown is right-aligned then compensate for width change by changing horizontal position
						if(pos.corner[1] === "R"){
							popNode.style.left = (popNode.style.left.replace("px", "") - around.offsetWidth + popNode.offsetWidth) + "px";
						}
						var resizeArgs = rias.dom.getMarginBox(ddNode);
						resizeArgs = rias.dom.box2marginBox(ddNode, rias.dom.getBoxOfStyle(resizeArgs, ddNode.style));
						resizeArgs.w = around.offsetWidth;
						if(rias.isFunction(dd.resize)){
							dd.resize(resizeArgs);
						}else{
							rias.dom.setMarginBox(ddNode, resizeArgs);
						}
					}
				}
			}
			function _dialog(dd, _hide){
				ddId = dd.id;
				ddNode = dd.domNode;
				self.dropDown = dd;
				dd.set("submitValue", self.get("value"));
				var _oldPopupParent = ddNode._riasrPopupOwner,
					_popupArgs = dd.popupArgs;
				if(_hide){
					self._closeDropDownAction = "hide";
					ddNode._riasrPopupOwner = self;
					if(!dd.popupArgs){
						dd.popupArgs = {};
					}
					dd.popupArgs.around = around;
					dd.popupArgs.lockPosition = true;
					if(!dd.popupArgs.parent){
						dd.popupArgs.parent = rias.desktop;
					}
					if(!dd.popupArgs.popupPositions){
						dd.popupArgs.popupPositions = self.popupPositions;
					}
				}else{
					self._closeDropDownAction = "close";
				}
				var _hshow = dd.before(dd, "_onShow", function(){/// onShow 可被运行期覆盖
					_hshow.remove();
					_after();
				});
				var _hPos = dd.after(dd, "_afterLoadedAllAndShown", function(){/// afterLoadedAll 之后，style 才正确
					pos = dd._initPos;
					_size(dd.domNode);
				});
				dd.whenHide(function(formResult){
					if(rias.formResult.isSubmit(formResult)){
						/// 有可能出现切换 focus，导致 blur 后 closeDropDown，故此时应该用 this.get("submitValue")，即 dd.get("submitValue")。
						//self.set("value", self.dropDown.get("submitValue"));
						self.set("value", dd.get("submitValue"));
					}
					ddNode._riasrPopupOwner = _oldPopupParent;
					dd.popupArgs = _popupArgs;
					_hPos.remove();
					self.closeDropDown(true);
					_close();
				});
				dd.show();
			}
			function _popup(dd, _hide){
				ddId = dd.id;
				ddNode = dd.domNode;
				self.dropDown = dd;
				rias.dom.addClass(ddNode, "riaswDropDown");
				dd.set("submitValue", self.get("value"));
				if(_hide){
					self._closeDropDownAction = "hide";
				}else{
					self._closeDropDownAction = "close";
				}

				pos = rias.popupManager.popup({
					popup: dd,
					popupOwner: self,
					around: around,
					popupPositions: dd.popupPositions || self.popupPositions,
					maxHeight: self.maxHeight,
					focus: dd.autoFocus != undefined ? dd.autoFocus : true,
					onShow: function(){
						_size(dd._popupWrapper);
						_after();
					},
					onSubmit: function(){
						if(rias.isFunction(dd.submit)){
							self.set("value", dd.get("submitValue"));
						}else{
							self.set("value", dd.get("value"));
						}
						self.closeDropDown(true);
					},
					onCancel: function(){
						self.closeDropDown(true);
					},
					onHide: function(){
						rias.dom.removeClass(ddNode, "riaswDropDown");
						rias.dom.removeClass(self._popupStateNode, "riaswHasDropDownOpen");
						_close();
					}
				});
			}
			function _after(){
				self._set("_opened", true);// use set() because _CssStateMixin is watching
				self._opening = false;

				rias.dom.addClass(self._popupStateNode, "riaswHasDropDownOpen");
				self._popupStateNode.setAttribute("aria-expanded", "true");
				self._popupStateNode.setAttribute("aria-owns", ddId);

				if(ddNode){
					// Set aria-labelledby on dropDown if it's not already set to something more meaningful
					if(ddNode.getAttribute("role") !== "presentation" && !ddNode.getAttribute("aria-labelledby")){
						ddNode.setAttribute("aria-labelledby", self.id);
					}
				}
				//console.debug("focus - afterPopup - " + dd.id);
				//if(dd.focus){
				//	dd.defer(dd.focus);
				//}
			}
			function _close(){
				self._set("_opened", false);
				self._opening = false;
				/*if(self._closeDropDownAction !== "hide"){
					if(self._dropDownParams){
						self.dropDown = self._dropDownParams;
						delete self._dropDownParams;
					}else{
						delete self.dropDown;
					}
				}*/
			}

			this._opening = true;
			this._closeDropDownAction = "";
			/*delete this._dropDownParams;
			if(dd){
				if(rias.isFunction(dd)){
					this._dropDownParams = dd;
					dd = dd.apply(self, []);
				}else if(rias.isString(dd)){
					this._dropDownParams = dd;
					dd = rias.$obj(this, dd, this.id + ".dropDown");
				}else if(dd.$refObj){
					this._dropDownParams = dd;
					dd = rias.$obj(this, dd.$refObj, this.id + ".dropDown");
				}else if(dd.$refScript){
					this._dropDownParams = dd;
					dd = rias.$script(this, dd.$refScript, this.id + ".dropDown");
				}else if(rias.isObjectSimple(dd)){
					this._dropDownParams = dd;
				}
			}*/
			if(rias.isObjectSimple(dd)){
				var args = rias.mixinDeep({}, dd);
				args.reCreate = false;
				args.ownerRiasw = self;
				if(!args._riaswIdInModule && self._riaswIdInModule){
					args._riaswIdInModule = self._riaswIdInModule + "_popup";
				}
				if(!args.actionType){
					args.actionType = "select";
				}
				if(!args._riaswType || args._riaswType === "riasw.sys.Dialog"){
					//args._riaswType = "riasw.sys.Dialog";
					args.dialogType = args.dialogType ? args.dialogType : "dropDown";// "modal";
					args.movable = false;///有可能 dialogType 不是 dropDown，需要强行设置
					if(args.initDisplayState == undefined){
						args.initDisplayState = "hidden";
					}
					//args.autoFocus = false;
					//if(args.selected == undefined){
					//	args.selected = args.autoFocus != false;
					//}
					args.popupArgs = rias.mixin({
						parent: args.parent != undefined ? args.parent : rias.desktop,
						around: around,
						popupPositions: args.popupPositions || self.popupPositions,
						lockPosition: true,
						maxHeight: args.maxHeight,
						padding: args.padding
					}, args.popupArgs);
					delete args.parent;
					delete args.around;
					delete args.popupPositions;
					delete args.maxHeight;
					delete args.padding;
					delete args.x;
					delete args.y;
					args.actionBar = args.actionBar ? args.actionBar : [
						"btnSubmit",
						"btnAbort"
					];
					try{
						dd = rias.showSelect(args);
					}catch(e){
						console.error(e);
						rias.error(e.message);
						rias.destroy(dd);
						dd = undefined;
						self._opening = false;
					}
					if(dd){
						_dialog(dd, false);
					}
				}else{
					try{
						dd = rias.newRiasw(args);
						dd.startup();
					}catch(e){
						console.error(e);
						rias.error(e.message);
						rias.destroy(dd);
						dd = undefined;
						self._opening = false;
					}
					if(dd){
						_popup(dd, false);
					}
				}
			}else if(rias.is(dd, "riasw.sys.Dialog")){
				_dialog(dd, true);
			}else if(rias.isRiasw(dd) || rias.isDomNode(dd)){
				_popup(dd, true);
			}else{
				self._opening = false;
			}

			return self.dropDown;
		},
		//修改
		closeDropDown: function(/*Boolean*/ focus){
			// summary:
			//		Closes the drop down on this widget
			// focus:
			//		If true, refocuses the button widget
			// tags:
			//		protected
			var self = this,
				dd = this.dropDown;

			if(this._focusDropDownTimer){
				this._focusDropDownTimer.remove();
				delete this._focusDropDownTimer;
			}

			if(this._opening){
				console.debug(this.id + ".closeDropDown when _opening.");
			}
			if(this.isOpened()){
				this.beforeCloseDropDown(dd);
				this._popupStateNode.setAttribute("aria-expanded", "false");
				if(focus && this.focus){
					///这里需要先 focus 以阻止 onBlur，故不应该用 defer。需要注意的是：此时 dropDown 尚未 destroy 完毕。
					//this.defer("focus", _focusDelay, true);
					this.focus();
				}
				if(dd){
					if(rias.is(dd, "riasw.sys.Dialog")){
						if(this._closeDropDownAction === "hide"){
							dd.hide();
						}else{
							dd.close();
						}
					}else{
						rias.popupManager.hide(dd).then(function(){
							if(self._closeDropDownAction !== "hide"){
								rias.destroy(dd);
							}
						});
					}
				}
				this.set("_opened", false);
				this._opening = false;
			}
		}
	});
});
