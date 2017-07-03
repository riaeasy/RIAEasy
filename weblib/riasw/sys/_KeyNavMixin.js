define([
	"riasw/riaswBase"
], function(rias){

	// module:
	//		riasw/sys/_KeyNavMixin

	var keys = rias.keys;

	return rias.declare("riasw.sys._KeyNavMixin", null, {
		// summary:
		//		A mixin to allow arrow key and letter key navigation of child or descendant widgets.
		//		It can be used by riasw/sys/_Container based widgets with a flat list of children,
		//		or more complex widgets like riasw/tree/Tree.
		//
		//		To use this mixin, the subclass must:
		//
		//			- Implement  _getNextChild(), _getFirstChild(), _getLastChild(), _onLeftArrow(), _onRightArrow()
		//			  _onDownArrow(), _onUpArrow() methods to handle home/end/left/right/up/down keystrokes.
		//			  Next and previous in this context refer to a linear ordering of the descendants used
		//			  by letter key search.
		//			- Set all descendants' initial tabIndex to "-1"; both initial descendants and any
		//			  descendants added later, by for example addChild()
		//			- Define childSelector to a function or string that identifies focusable descendant widgets
		//
		//		Also, child widgets must implement a focus() method.

		/*=====
		 // focusedChild: [protected readonly] Widget
		 //		The currently focused child widget, or null if there isn't one
		 focusedChild: null,

		 // _keyNavCodes: Object
		 //		Hash mapping key code (arrow keys and home/end key) to functions to handle those keys.
		 //		Usually not used directly, as subclasses can instead override _onLeftArrow() etc.
		 _keyNavCodes: {},
		 =====*/

		// tabIndex: String
		//		Tab index of the container; same as HTML tabIndex attribute.
		//		Note then when user tabs into the container, focus is immediately
		//		moved to the first item in the container.
		tabIndex: "0",

		// childSelector: [protected abstract] Function||String
		//		Selector (passed to on.selector()) used to identify what to treat as a child widget.   Used to monitor
		//		focus events and set this.focusedChild.   Must be set by implementing class.   If this is a string
		//		(ex: "> *") then the implementing class must require dojo/query.
		childSelector: null,

		_ignoreKeyboardSearch: false,
		_searchString: "",
		// multiCharSearchDuration: Number
		//		If multiple characters are typed where each keystroke happens within
		//		multiCharSearchDuration of the previous keystroke,
		//		search for nodes matching all the keystrokes.
		//
		//		For example, typing "ab" will search for entries starting with
		//		"ab" unless the delay between "a" and "b" is greater than multiCharSearchDuration.
		multiCharSearchDuration: 1000,

		tabThrough: false,
		tabCycle: false,

		postCreate: function(){
			this.inherited(arguments);

			// Set tabIndex on this.domNode.  Will be automatic after #7381 is fixed.
			rias.dom.setAttr(this.domNode, "tabIndex", this.tabIndex);

			if(!this._keyNavCodes){
				var keyCodes = this._keyNavCodes = {};
				keyCodes[keys.HOME] = rias.hitch(this, "focusFirstChild");
				keyCodes[keys.END] = rias.hitch(this, "focusLastChild");
				keyCodes[this.isLeftToRight() ? keys.LEFT_ARROW : keys.RIGHT_ARROW] = rias.hitch(this, "_onLeftArrow");
				keyCodes[this.isLeftToRight() ? keys.RIGHT_ARROW : keys.LEFT_ARROW] = rias.hitch(this, "_onRightArrow");
				keyCodes[keys.UP_ARROW] = rias.hitch(this, "_onUpArrow");
				keyCodes[keys.DOWN_ARROW] = rias.hitch(this, "_onDownArrow");
			}

			var self = this,
				childSelector = typeof this.childSelector === "string" ? this.childSelector
					: rias.hitch(this, "childSelector");
			this.own(
				rias.on(this.domNode, "keypress", rias.hitch(this, "_onContainerKeypress")),
				rias.on(this.domNode, "keydown", rias.hitch(this, "_onContainerKeydown")),
				rias.on(this.domNode, "focus", rias.hitch(this, "_onContainerFocus")),
				rias.on(this.containerNode, rias.on.selector(childSelector, "focusin"), function(evt){
					self._onChildFocus(rias.by(this), evt);
				})
			);
		},
		_onDestroy: function(){
			this.inherited(arguments);
			this.lastFocusedChild = undefined;
			this.focusedChild = undefined;
		},

		_doInitFocusedChild: function(){
			var w = this.initFocusedChild;
			if(!rias.isRiasw(w)){
				w = rias.by(w, this);/// 有可能是 String
			}
			if(!w || !w.isFocusable()){
				w = this._getFirstFocusableChild(true);
			}
			this.set("focusedChild", w);
		},
		_startupChild: function(/*_WidgetBase*/ widget){
			// summary:
			//		Setup for each child widget.
			// description:
			//		Sets tabIndex=-1 on each child, so that the tab key will
			//		leave the container rather than visiting each child.
			//
			//		Note: if you add children by a different method than addChild(), then need to call this manually
			//		or at least make sure the child's tabIndex is -1.
			//
			//		Note: see also _LayoutWidget.setupChild(), which is also called for each child widget.
			// tags:
			//		private

			//widget.set("tabIndex", "-1");
			if(widget !== this.focusedChild){
				if(!this.focusedChild && !widget.tabThrough && widget.isFocusable()){
					this.set("focusedChild", widget);
				}else{
					widget.set("tabIndex", "-1");
				}
			}
		},
		startup: function(){///需要 startup，而不是 onStartup，因为需要先 child.startup
			this.inherited(arguments);
			rias.forEach(this.getChildren(), rias.hitch(this, "_startupChild"));
			this._doInitFocusedChild();
		},

		_getFocusableNode: function(node){
			if(!rias.dom.isDescendant(node, this.domNode)){
				node = undefined;
			}
			if(!rias.a11y.isFocusable(node)){
				if(this.focusedChild){
					node = this.focusedChild.isFocusable();
				}
				if(!node && this.lastFocusedChild){
					node = this.lastFocusedChild.isFocusable();
				}
				if(!node){
					node = this._getFirstFocusableChild(true);
					node = node && node.isFocusable();
				}
			}
			return node;
		},
		_getFocusedChildAttr: function(/*_WidgetBase*/ child){
			if(rias.isString(this.focusedChild)){
				return rias.by(this.focusedChild, this);/// 有可能是 String
			}
			return this.focusedChild;
		},
		/// set("focusedChild", child) 只是设置 focusedChild，而没有 focus。
		_setFocusedChildAttr: function(/*_WidgetBase*/ child){
			// summary:
			//		Called when a child widget gets focus, either by user clicking
			//		it, or programatically by arrow key handling code.
			// description:
			//		It marks that the current node is the selected one, and the previously
			//		selected node no longer is.

			//console.debug("_setFocusedChildAttr - " + this.id + " - " + (child ? child.id : " none"));
			child = rias.by(child);
			//if(!child || !child.isFocusable()){
			//	return;
			//}
			var fc = this.get("focusedChild");
			if(fc && child !== fc){
				///只处理/记录 this.focusedChild 有值的情况
				if(!fc.isDestroyed(false)){
					// mark that the previously focusable node is no longer focusable
					fc.set("tabIndex", "-1");
					this.lastFocusedChild = fc;
				}
			}
			if(child){
				// mark that the new node is the currently selected one
				child.set("tabIndex", this.tabIndex);
			}
			//console.debug("_setFocusedChildAttr - " + (child ? child.id : "undefined"));
			//this.lastFocused = child;		// back-compat for Tree, remove for 2.0
			this._set("focusedChild", child);
		},
		focus: function(child, forceVisible){
			// summary:
			//		Default focus() implementation: focus the first child.
			///放弃 focusFirstChild，改为 inherited
			///一般地，focusedChild destroy 时，会调整 focusedChild，故不用专门判断 next
			if(!this.isDestroyed(true)){
				var w = child === "start" ? this._getFirstChild() : child === "end" ? this._getLastChild() : this.get("focusedChild");
				if(!w || !w.isFocusable()){
					w = this.lastFocusedChild;
				}
				if(!w || !w.isFocusable()){
					w = this._getFirstFocusableChild(true);
				}
				if(w){
					//console.debug("focus - " + this.id + " - " + (w ? w.id : " none"));
					this.focusChild(w, forceVisible);
				}else{
					this.inherited(arguments, [child, forceVisible]);
					//this.focusFirstChild();
				}
			}
		},
		_getNextFocusableChild: function(child, dir){
			///原生代码有错！next 为 null 时会循环。
			// summary:
			//		Returns the next or previous focusable descendant, compared to "child".
			//		Implements and extends _KeyNavMixin._getNextFocusableChild() for a _Container.
			// child: Widget
			//		The current widget
			// dir: Integer
			//		- 1 = after
			//		- -1 = before
			// tags:
			//		abstract extension

			child = rias.by(child);
			var self = this,
				wrappedValue = child;
			function _get(w){
				do{
					if(!w){
						w = self[dir > 0 ? "_getFirstChild" : "_getLastChild"]();
					}else{
						w = self._getNextChild(w, dir);
					}
				}while(w && (w === wrappedValue || w.tabThrough || !w.isFocusable()));
				return w;
			}
			child = _get(child);
			if(!child){
				if(self.tabCycle){
					child = _get();
				}
			}
			return child;
		},
		_getFirstFocusableChild: function(focusSelected){
			// summary:
			//		Returns first child that can be focused.

			if(focusSelected){
				var w = this._getFirstSelected(true);
				if(w){
					return w;
				}
			}
			// Leverage _getNextFocusableChild() to skip disabled children
			return this._getNextFocusableChild(null, 1);	// _WidgetBase
		},
		_getLastFocusableChild: function(){
			// summary:
			//		Returns last child that can be focused.

			// Leverage _getNextFocusableChild() to skip disabled children
			return this._getNextFocusableChild(null, -1);	// _WidgetBase
		},
		focusFirstChild: function(){
			// summary:
			//		Focus the first focusable child in the container.
			// tags:
			//		protected

			this.focusChild(this._getFirstFocusableChild(false));
		},
		focusLastChild: function(){
			// summary:
			//		Focus the last focusable child in the container.
			// tags:
			//		protected

			this.focusChild(this._getLastFocusableChild());
		},
		/// focusChild 是通过 node.focus 来触发 focusStack，从而调用 set("focusedChild", child)
		focusChild: function(/*_WidgetBase*/ widget, forceVisible){
			// summary:
			//		Focus specified child widget.
			// widget:
			//		Reference to container's child widget
			// last:
			//		If true and if widget has multiple focusable nodes, focus the
			//		last one instead of the first one
			// tags:
			//		protected

			if(!widget || widget.isDestroyed(false) || !rias.dom.isDescendant(widget.domNode, this.domNode)){
				this.set("focusedChild", undefined);
				return;
			}

			var fc = this.get("focusedChild");
			if(fc && widget !== fc){
				this._onChildBlur(fc);	// used to be used by _MenuBase
			}
			widget.set("tabIndex", this.tabIndex);	// for IE focus outline to appear, must set tabIndex before focus
			widget.focus(undefined, forceVisible);

			// Don't set focusedChild here, because the focus event should trigger a call to _onChildFocus(), which will
			// set it.   More importantly, _onChildFocus(), which may be executed asynchronously (after this function
			// returns) needs to know the old focusedChild to set its tabIndex to -1.
		},
		_onContainerFocus: function(evt){
			// summary:
			//		Handler for when the container itself gets focus.
			// description:
			//		Initially the container itself has a tabIndex, but when it gets
			//		focus, switch focus to first child.
			//
			//		TODO for 2.0 (or earlier): Instead of having the container tabbable, always maintain a single child
			//		widget as tabbable, Requires code in startup(), addChild(), and removeChild().
			//		That would avoid various issues like #17347.
			// tags:
			//		private

			// Note that we can't use _onFocus() because switching focus from the
			// _onFocus() handler confuses the focus.js code
			// (because it causes _onFocusNode() to be called recursively).
			// Also, _onFocus() would fire when focus went directly to a child widget due to mouse click.

			// Ignore spurious focus events:
			//	1. focus on a child widget bubbles on FF
			//	2. on IE, clicking the scrollbar of a select dropdown moves focus from the focused child item to me
			if(evt.target !== this.domNode || this.focusedChild){
				return;
			}

			this.focus();
		},
		_onFocus: function(by, i, newStack, oldStack){
			// When the container gets focus by being tabbed into, or a descendant gets focus by being clicked,
			// set the container's tabIndex to -1 (don't remove as that breaks Safari 4) so that tab or shift-tab
			// will go to the fields after/before the container, rather than the container itself
			if(newStack && newStack[i] === this.id){
				var w = rias.by(newStack[++i]);
				if(w && rias.dom.isDescendant(w.domNode, this.domNode) && (!this.focusedChild || this.focusedChild !== w)){
					if(w.isFocusable()){
						rias.dom.setAttr(this.domNode, "tabIndex", "-1");
						this.set("focusedChild", w);
					}
				}
			}
			this.inherited(arguments);
		},
		_onBlur: function(by, i, newStack, oldStack){
			// When focus is moved away the container, and its descendant (popup) widgets,
			// then restore the container's tabIndex so that user can tab to it again.
			// Note that using _onBlur() so that this doesn't happen when focus is shifted
			// to one of my child widgets (typically a popup)

			// TODO: for 2.0 consider changing this to blur whenever the container blurs, to be truthful that there is
			// no focused child at that time.
			rias.dom.setAttr(this.domNode, "tabIndex", this.tabIndex);
			//this.set("focusedChild", null);
			this.inherited(arguments);
		},
		_onChildFocus: function(/*_WidgetBase*/ child){
			// summary:
			//		Called when a child widget gets focus, either by user clicking
			//		it, or programatically by arrow key handling code.
			// description:
			//		It marks that the current node is the selected one, and the previously
			//		selected node no longer is.

			this.set("focusedChild", child);
		},
		_onChildBlur: function(/*_WidgetBase*/ /*===== widget =====*/){
			// summary:
			//		Called when focus leaves a child widget to go
			//		to a sibling widget.
			//		Used to be used by MenuBase.js (remove for 2.0)
			// tags:
			//		protected
		},

		_onLeftArrow: function(){
			// summary:
			//		Called on left arrow key, or right arrow key if widget is in RTL mode.
			//		Should go back to the previous child in horizontal container widgets like Toolbar.
			// tags:
			//		extension
		},
		_onRightArrow: function(){
			// summary:
			//		Called on right arrow key, or left arrow key if widget is in RTL mode.
			//		Should go to the next child in horizontal container widgets like Toolbar.
			// tags:
			//		extension
		},
		_onUpArrow: function(){
			// summary:
			//		Called on up arrow key. Should go to the previous child in vertical container widgets like Menu.
			// tags:
			//		extension
		},
		_onDownArrow: function(){
			// summary:
			//		Called on down arrow key. Should go to the next child in vertical container widgets like Menu.
			// tags:
			//		extension
		},

		_onContainerKeydown: function(evt){
			// summary:
			//		When a key is pressed, if it's an arrow key etc. then it's handled here.
			// tags:
			//		private

			var func = this._keyNavCodes[evt.keyCode];
			if(func){
				if(func.apply(this, [evt, this.focusedChild]) != false){
					evt.stopPropagation();
					evt.preventDefault();
				}
				this._searchString = ''; // so a DOWN_ARROW b doesn't search for ab
			}else if(!this._ignoreKeyboardSearch && evt.keyCode === keys.SPACE && this._searchTimer && !(evt.ctrlKey || evt.altKey || evt.metaKey)){
				evt.stopImmediatePropagation(); // stop a11yclick and _HasDropdown from seeing SPACE if we're doing keyboard searching
				evt.preventDefault(); // stop IE from scrolling, and most browsers (except FF) from sending keypress
				this._keyboardSearch(evt, ' ');
			}
		},
		_onContainerKeypress: function(evt){
			// summary:
			//		When a printable key is pressed, it's handled here, searching by letter.
			// tags:
			//		private

			// Ignore:
			// 		- duplicate events on firefox (ex: arrow key that will be handled by keydown handler)
			//		- control sequences like CMD-Q.
			//		- the SPACE key (only occurs on FF)
			//
			// Note: if there's no search in progress, then SPACE should be ignored.   If there is a search
			// in progress, then SPACE is handled in _onContainerKeyDown.
			if(this._ignoreKeyboardSearch || evt.charCode <= keys.SPACE || evt.ctrlKey || evt.altKey || evt.metaKey){
				return;
			}

			evt.preventDefault();
			evt.stopPropagation();

			this._keyboardSearch(evt, String.fromCharCode(evt.charCode).toLowerCase());
		},

		onKeyboardSearch: function(/*_WidgetBase*/ item, /*Event*/ evt, /*String*/ searchString, /*Number*/ numMatches){
			// summary:
			//		When a key is pressed that matches a child item,
			//		this method is called so that a widget can take appropriate action is necessary.
			// tags:
			//		protected
			if(item){
				this.focusChild(item);
			}
		},
		_keyboardSearchCompare: function(/*_WidgetBase*/ item, /*String*/ searchString){
			// summary:
			//		Compares the searchString to the widget's text label, returning:
			//
			//			* -1: a high priority match  and stop searching
			//		 	* 0: not a match
			//		 	* 1: a match but keep looking for a higher priority match
			// tags:
			//		private

			var element = item.domNode,
				text = item.label || (element.focusNode ? element.focusNode.label : '') || element.innerText || element.textContent || "",
				currentString = text.replace(/^\s+/, '').substr(0, searchString.length).toLowerCase();

			return (!!searchString.length && currentString === searchString) ? -1 : 0; // stop searching after first match by default
		},
		_keyboardSearch: function(/*Event*/ evt, /*String*/ keyChar){
			// summary:
			//		Perform a search of the widget's options based on the user's keyboard activity
			// description:
			//		Called on keypress (and sometimes keydown), searches through this widget's children
			//		looking for items that match the user's typed search string.  Multiple characters
			//		typed within 1 sec of each other are combined for multicharacter searching.
			// tags:
			//		private
			var self = this,
				matchedItem = null,
				searchString,
				numMatches = 0,
				search = function(){
					if(self._searchTimer){
						self._searchTimer.remove();
					}
					self._searchString += keyChar;
					var allSameLetter = /^(.)\1*$/.test(self._searchString);
					var searchLen = allSameLetter ? 1 : self._searchString.length;
					searchString = self._searchString.substr(0, searchLen);
					// commented out code block to search again if the multichar search fails after a smaller timeout
					//self._searchTimer = self.defer(function(){ // self is the "failure" timeout
					//	self._typingSlowly = true; // if the search fails, then treat as a full timeout
					//	self._searchTimer = self.defer(function(){ // self is the "success" timeout
					//		self._searchTimer = null;
					//		self._searchString = '';
					//	}, self.multiCharSearchDuration >> 1);
					//}, self.multiCharSearchDuration >> 1);
					self._searchTimer = self.defer(function(){ // self is the "success" timeout
						self._searchTimer = null;
						self._searchString = '';
					}, self.multiCharSearchDuration);
					var currentItem = self.focusedChild || null;
					if(searchLen === 1 || !currentItem){
						currentItem = self._getNextFocusableChild(currentItem, 1); // skip current
						if(!currentItem){
							return;
						} // no items
					}
					var stop = currentItem;
					do{
						var rc = self._keyboardSearchCompare(currentItem, searchString);
						if(!!rc && numMatches++ === 0){
							matchedItem = currentItem;
						}
						if(rc === -1){ // priority match
							numMatches = -1;
							break;
						}
						currentItem = self._getNextFocusableChild(currentItem, 1);
					}while(currentItem && currentItem !== stop);
					// commented out code block to search again if the multichar search fails after a smaller timeout
					//if(!numMatches && (self._typingSlowly || searchLen == 1)){
					//	self._searchString = '';
					//	if(searchLen > 1){
					//		// if no matches and they're typing slowly, then go back to first letter searching
					//		search();
					//	}
					//}
				};

			search();
			// commented out code block to search again if the multichar search fails after a smaller timeout
			//this._typingSlowly = false;
			this.onKeyboardSearch(matchedItem, evt, searchString, numMatches);
		},

		_getFirstSelected: function(checkFocusable){
			return null;
		},
		_getFirstChild: function(){
			// summary:
			//		Returns the first child.
			// tags:
			//		abstract extension

			return null;	// _WidgetBase
		},
		_getLastChild: function(){
			// summary:
			//		Returns the last descendant.
			// tags:
			//		abstract extension

			return null;	// _WidgetBase
		},
		_getNextChild: function(child, dir){
			// summary:
			//		Returns the next descendant, compared to "child".
			// child: Widget
			//		The current widget
			// dir: Integer
			//		- 1 = after
			//		- -1 = before
			// tags:
			//		abstract extension

			if(child){
				child = child.domNode;
				while(child){
					child = child[dir < 0 ? "previousSibling" : "nextSibling"];
					if(child  && "getAttribute" in child){
						var w = rias.by(child);
						if(w){
							return w; // _WidgetBase
						}
					}
				}
			}
			return null;	// _WidgetBase
		}

	});
});
