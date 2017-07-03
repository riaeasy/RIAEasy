define([
	"riasw/hostDojo",
	"riasw/BackgroundIframe"
], function(rias, BackgroundIframe){

	// module:
	//		riasw/PopupManger

	var _dom = rias.dom;

	var PopupManager = rias.declare("riasw.PopupManger", null, {
		// summary:
		//		Used to show drop downs (ex: the select list of a ComboBox)
		//		or popups (ex: right-click context menus).

		// _stack: _WidgetBase[]
		//		Stack of currently popped up widgets.
		//		(someone opened _stack[0], and then it opened _stack[1], etc.)
		_stack: [],

		// _beginZIndex: Number
		//		Z-index of the first popup.   (If first popup opens other
		//		popups they get a higher z-index.)
		_beginZIndex: 1000,

		_idGen: 1,

		_repositionAll: function(){
			// summary:
			//		If screen has been scrolled, reposition all the popups in the stack.
			//		Then set timer to check again later.

			if(this._firstAroundNode){	// guard for when clearTimeout() on IE doesn't work
				var oldPos = this._firstAroundPosition,
					newPos = _dom.getPosition(this._firstAroundNode, true),
					dx = newPos.x - oldPos.x,
					dy = newPos.y - oldPos.y;

				if(dx || dy){
					this._firstAroundPosition = newPos;
					for(var i = 0; i < this._stack.length; i++){
						var style = this._stack[i].wrapper.style;
						///这里，wrapper 的 top/left 都是 px，可以用 parseFloat，无需用 rias.dom.toPixelValue
						style.top = (parseFloat(style.top) + dy) + "px";
						if(style.right === "auto"){
							style.left = (parseFloat(style.left) + dx) + "px";
						}else{
							style.right = (parseFloat(style.right) - dx) + "px";
						}
					}
				}

				this._aroundMoveListener = setTimeout(rias.hitch(this, "_repositionAll"), dx || dy ? 30 : 150);
			}
		},
		_createWrapper: function(/*Widget*/ widget){
			// summary:
			//		Initialization for widgets that will be used as popups.
			//		Puts widget inside a wrapper DIV (if not already in one),
			//		and returns pointer to that wrapper DIV.

			var wrapper = widget._popupWrapper,
				node = widget.domNode;

			if(!wrapper){
				// Create wrapper <div> for when this widget [in the future] will be used as a popup.
				// This is done early because of IE bugs where creating/moving DOM nodes causes focus
				// to go wonky, see tests/robot/Toolbar.html to reproduce
				wrapper = _dom.create("div", {
					"class": "riaswPopup",
					style: {
						display: "none"
					},
					role: "region",
					"aria-label": widget["aria-label"] || widget.label || widget.name || widget.id
				}, widget.ownerDocumentBody);
				wrapper.appendChild(node);

				var s = node.style;
				s.display = "";
				s.visibility = "";
				s.position = "";
				s.top = "0px";

				widget._popupWrapper = wrapper;
				var _hDestroy = rias.after(widget, "_afterDestroyed", function(){
					_hDestroy.remove();
					_hDestroy = undefined;
					// summary:
					//		Function to destroy wrapper when popup widget is destroyed.
					//		Left in this scope to avoid memory leak on IE8 on refresh page, see #15206.
					if(widget._popupWrapper){
						_dom.destroy(widget._popupWrapper);
						delete widget._popupWrapper;
					}
				}, true);

				// Workaround iOS problem where clicking a Menu can focus an <input> (or click a button) behind it.
				// Need to be careful though that you can still focus <input>'s and click <button>'s in a TooltipDialog.
				// Also, be careful not to break (native) scrolling of dropdown like ComboBox's options list.
				if("ontouchend" in document) {
					rias.on(wrapper, "touchend", function (evt){
						if(!/^(input|button|textarea)$/i.test(evt.target.tagName)) {
							evt.preventDefault();
						}
					});
				}

				// Calling evt.preventDefault() suppresses the native click event on most browsers.  However, it doesn't
				// suppress the synthetic click event emitted by dojo/touch.  In order for clicks in popups to work
				// consistently, always use dojo/touch in popups.  See #18150.
				wrapper.dojoClick = true;
			}

			return wrapper;
		},
		moveOffScreen: function(/*Widget*/ widget){
			// summary:
			//		Moves the popup widget off-screen.
			//		Do not use this method to hide popups when not in use, because
			//		that will create an accessibility issue: the offscreen popup is
			//		still in the tabbing order.

			// Create wrapper if not already there
			var wrapper = this._createWrapper(widget);

			// Besides setting visibility:hidden, move it out of the viewport, see #5776, #10111, #13604
			var ltr = _dom.isBodyLtr(widget.ownerDocument),
				style = {
					visibility: "hidden",
					top: "-9999px",
					display: ""
				};
			style[ltr ? "left" : "right"] = "-9999px";
			style[ltr ? "right" : "left"] = "auto";
			_dom.setStyle(wrapper, style);

			return wrapper;
		},
		getTopPopup: function(){
			// summary:
			//		Compute the closest ancestor popup that's *not* a child of another popup.
			//		Ex: For a TooltipDialog with a button that spawns a tree of menus, find the popup of the button.
			var stack = this._stack;
			for(var pi = stack.length - 1; pi > 0 && stack[pi].popupOwner === stack[pi - 1].widget; pi--){
				/* do nothing, just trying to get right value for pi */
			}
			return stack[pi];
		},
		popup: function(/*__OpenArgs*/ args){
			// summary:
			//		Popup the widget at the specified position
			//
			// example:
			//		opening at the mouse position
			//		|		popupManager.popup({popup: menuWidget, x: evt.pageX, y: evt.pageY});
			//
			// example:
			//		opening the widget as a dropdown
			//		|		popupManager.popup({popupOwner: this, popup: menuWidget, around: this.domNode, onHide: function(){...}});
			//
			//		Note that whatever widget called popupManager.popup() should also listen to its own _onBlur callback
			//		(fired from riasw/focus.js) to know that focus has moved somewhere else and thus the popup should be closed.

			if(!args.popupOwner){
				args.popupOwner = rias.desktop;
			}

			var stack = this._stack,
				widget = args.popup,
				node = widget.domNode,
			//positions = args.popupPositions || args.orient || ["below", "below-alt", "above", "above-alt"],
			//ltr = args.popupOwner && args.popupOwner.isLeftToRight ? args.popupOwner.isLeftToRight() : isBodyLtr(widget.ownerDocument),
			//viewport = getEffectiveBox(this.ownerDocument),
				around = args.around,
				id = (args.around && args.around.id) ? (args.around.id + "_dropdown") : ("popup_" + this._idGen++);

			// If we are opening a new popup that isn't a child of a currently opened popup, then
			// hide currently opened popup(s).   This should happen automatically when the old popups
			// gets the _onBlur() event, except that the _onBlur() event isn't reliable on IE, see [22198].
			while(stack.length && (!args.popupOwner || !_dom.isDescendant(args.popupOwner.domNode, stack[stack.length - 1].widget.domNode))){
				this.hide(stack[stack.length - 1].widget);
			}

			// Get pointer to popup wrapper, and create wrapper if it doesn't exist.  Remove display:none (but keep
			// off screen) so we can do sizing calculations.
			var wrapper = this.moveOffScreen(widget);
			if(widget.startup && !widget._started){
				widget.startup(); // this has to be done after being added to the DOM
			}
			_dom.setAttr(wrapper, {
				id: id,
				style: {
					zIndex: this._beginZIndex + stack.length
				},
				"class": "riaswPopup " + (widget.baseClass || widget["class"] || "").split(" ")[0] + "Popup"//,
				//riaswPopupParent: args.popupOwner ? args.popupOwner.id : ""
			});
			wrapper._riasrPopupOwner = args.popupOwner;
			wrapper.style.visibility = "visible";
			node.style.visibility = "visible";	// counteract effects from _HasDropDown
			if(rias.has("config-bgIframe") && !widget.bgIframe){
				// setting widget.bgIframe triggers cleanup in _WidgetBase.destroyRendering()
				widget.bgIframe = new BackgroundIframe(wrapper);
			}

			if(stack.length === 0 && around){
				// First element on stack. Save position of aroundNode and setup listener for changes to that position.
				this._firstAroundNode = around;
				this._firstAroundPosition = _dom.getPosition(around, true);
				this._aroundMoveListener = setTimeout(rias.hitch(this, "_repositionAll"), 150);
			}
			stack.push({
				widget: widget,
				wrapper: wrapper,
				popupOwner: args.popupOwner,
				onSubmit: args.onSubmit,
				onCancel: args.onCancel,
				onHide: args.onHide,
				onShow: args.onShow,
				handlers: handlers
			});

			///handlers 在 popupManager.hide 中释放。
			var handlers = [];
			if(args.onShow){
				if(widget._onShow){
					handlers.push(widget.after("_onShow", function(){
						var h = rias.defer(function(){
							h.remove();
							args.onShow();
						}, 9);
					}));
				}else if(widget.onShow){
					handlers.push(widget.on("show", function(){
						var h = rias.defer(function(){
							h.remove();
							args.onShow();
						}, 9);
					}));
				}
			}
			// provide default escape and tab key handling
			// (this will work for any widget, not just menu)
			handlers.push(rias.on(wrapper, "keydown", rias.hitch(this, function(evt){
				if(evt.keyCode === rias.keys.ESCAPE && args.onCancel){
					evt.stopPropagation();
					evt.preventDefault();
					args.onCancel();
				}else if(evt.keyCode === rias.keys.TAB){
					evt.stopPropagation();
					evt.preventDefault();
					var topPopup = this.getTopPopup();
					if(topPopup && topPopup.onCancel){
						topPopup.onCancel();
					}
				}
			})));
			// watch for cancel/submit events on the popup and notify the caller
			// (for a menu, "submit" means clicking an item)
			if(args.onCancel){
				if(widget.afterAbort){
					handlers.push(widget.after("afterAbort", function(){
						return args.onCancel();/// apply ?
					}));
				}else if(widget.onCancel){
					handlers.push(widget.on("cancel", args.onCancel));
				}
			}
			function _execute(){
				var topPopup = self.getTopPopup();
				if(topPopup && topPopup.onSubmit){
					topPopup.onSubmit();
				}
			}
			var self = this;
			if(widget.afterSubmit){
				handlers.push(widget.after("afterSubmit", function(){
					_execute();
				}));
			}else{
				handlers.push(widget.after(widget.onSubmit ? "onSubmit" : "onChange", _execute));///注意：是 onSubmit，不是 onsubmit
			}

			var best;
			function _show(){
				rias.when(widget.show(), function(){
					//args.popupOwner: riasWidget
					//args.around: riasWidget or domNode
					//args.popupPositions: around:["below", "below-alt", "above", "above-alt"] or at:["MM", "TL", "TR"...]
					//args.maxHeight: Number(without "px")
					//args.padding: Number(without "px")
					//args.x: Number(without "px")
					//args.y: Number(without "px")
					args = rias.mixin({}, args);///只需要 mixin，不要 mixinDeep
					args.restrictPadding = args.restrictPadding || widget.restrictPadding;
					if(!(args.restrictPadding >= 0)){
						args.restrictPadding = 0;///默认需要 restrict
					}
					delete args.parent;
					best = _dom.placeAndPosition(wrapper, widget, args);

					if(args.focus && widget.focus){
						widget.focus();
					}
				});

			}

			if(rias.isFunction(widget.refresh)){/// _ContentMixin
				widget.refresh();
				if(rias.isFunction(widget.whenLoadedAll)){/// _ContentMixin
					widget.whenLoadedAll(function(loadOk){
						if(loadOk){
							_show();
						}
					});
				}else{
					_show();
				}
			}else{
				_show();
			}
			return best;
		},
		hide: function(/*Widget?*/ popup){
			// summary:
			//		hide specified popup and any popups that it parented.
			//		If no popup is specified, closes all popups.

			function _do(top){
				var h;
				if(top.handlers){
					while((h = top.handlers.pop())){
						h.remove();
					}
				}
				// Hide the widget and it's wrapper unless it has already been destroyed in above onHide() etc.
				if(top.widget){
					h = top.widget.domNode;
					if(h){
						if(top.widget._popupWrapper){
							_dom.setStyle(top.widget._popupWrapper, {
								display: "none",
								height: "auto",			// popup() may have limited the height to fit in the viewport,
								overflowY: "visible",	// and set overflowY to "auto".
								border: ""				// popup() may have moved border from popup to wrapper.
							});
						}
						if("_originalStyle" in h){
							h.style.cssText = h._originalStyle;
						}
					}
				}
				if(top.onHide){
					top.onHide();
				}

				if(stack.length === 0 && self._aroundMoveListener){
					clearTimeout(self._aroundMoveListener);
					self._firstAroundNode = self._firstAroundPosition = self._aroundMoveListener = null;
				}

				d.resolve();
			}

			var self = this,
				stack = this._stack,
				cancelled = false,
				d = rias.newDeferred("popupManager.hide", rias.debugDeferredTimeout ? rias.defaultDeferredTimeout : 0, function(){
					this.cancel();
				});

			// Basically work backwards from the top of the stack closing popups
			// until we hit the specified popup, but IIRC there was some issue where closing
			// a popup would cause others to hide too.  Thus if we are trying to hide B in [A,B,C]
			// closing C might hide B indirectly and then the while() condition will run where stack==[A]...
			// so the while condition is constructed defensively.
			while(!cancelled && (popup && rias.some(stack, function(elem){
				return elem.widget === popup;
			}) || !popup && stack.length)){
				var top = stack.pop(),
					widget = top.widget;

				if (widget.bgIframe) {
					// push the iframe back onto the stack.
					widget.bgIframe.destroy();
					delete widget.bgIframe;
				}

				if(widget._checkCanHide){
					widget._checkCanHide().always(rias.hitch(top, function(result){
					/// 因为在 while 循环中，top 和 widget 等在 promise 后是可变的，需要用 hitch 来明确
						if(result != false){
							this.widget.hide().always(rias.hitch(this, function(result){
								_do(this);
								return result;
							}));
						}else{
							cancelled = true;
							d.cancel(this.widget.id + " _checkCanHide() false.");
						}
						return result;
					}));
				}else if(widget.hide){
					/// onClose 只做 destroy 判断
					if(widget.hide() != false){
						_do(top);
					}else{
						cancelled = true;
						d.cancel(widget.id + " hide() false.");
					}
				}else{
					_do(top);
				}
			}
			return d.promise;
		}
	});

	return new PopupManager();

});
