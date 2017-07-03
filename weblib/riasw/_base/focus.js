define([
	"rias/riasBase",
	"riasw/hostDojo",
	"dojo/Evented",
	"dojo/dom-construct"/// 需要 aspect
], function(rias, _rias, Evented, domConstruct){

	// module:
	//		riasw/focus

	// Time of the last focusin event
	var lastFocusin,
		// Time of the last touch/mousedown or focusin event
		lastTouchOrFocusin;

	var FocusManager = rias.declare([rias.Stateful, Evented], {
		// summary:
		//		Tracks the currently focused node, and which widgets are currently "active".
		//		Access via require(["riasw/focus"], function(focus){ ... }).
		//
		//		A widget is considered active if it or a descendant widget has focus,
		//		or if a non-focusable node of this widget or a descendant was recently clicked.
		//
		//		Call focus.watch("currNode", callback) to track the current focused DOMNode,
		//		or focus.watch("activeStack", callback) to track the currently focused stack of widgets.
		//
		//		Call focus.on("widget-blur", func) or focus.on("widget-focus", ...) to monitor when
		//		when widgets become active/inactive
		//
		//		Finally, focus(node) will focus a node, suppressing errors if the node doesn't exist.

		// currNode: DomNode
		//		Currently focused item on screen
		currNode: null,

		// activeStack: _WidgetBase[]
		//		List of currently active widgets (focused widget and it's ancestors)
		activeStack: [],

		constructor: function(){
			// Don't leave currNode/prevNode pointing to bogus elements
			var self = this,
				check = function(node){
					if(rias.dom.isDescendant(self.currNode, node)){
						self.set("currNode", null);
					}
					if(rias.dom.isDescendant(self.prevNode, node)){
						self.set("prevNode", null);
					}
				};
			this._hDomEmpty = rias.before(domConstruct, "empty", check);
			this._hDomDestroy = rias.before(domConstruct, "destroy", check);
		},

		registerIframe: function(/*DomNode*/ iframe){
			// summary:
			//		Registers listeners on the specified iframe so that any click
			//		or focus event on that iframe (or anything in it) is reported
			//		as a focus/click event on the `<iframe>` itself.
			// description:
			//		Currently only used by editor.
			// returns:
			//		Handle with remove() method to deregister.
			return this.registerWin(iframe.contentWindow, iframe);
		},

		registerWin: function(/*Window?*/targetWindow, /*DomNode?*/ effectiveNode){
			// summary:
			//		Registers listeners on the specified window (either the main
			//		window or an iframe's window) to detect when the user has clicked somewhere
			//		or focused somewhere.
			// description:
			//		Users should call registerIframe() instead of this method.
			// targetWindow:
			//		If specified this is the window associated with the iframe,
			//		i.e. iframe.contentWindow.
			// effectiveNode:
			//		If specified, report any focus events inside targetWindow as
			//		an event on effectiveNode, rather than on evt.target.
			// returns:
			//		Handle with remove() method to deregister.

			// TODO: make this function private in 2.0; Editor/users should call registerIframe(),

			// Listen for blur and focus events on targetWindow's document.
			var self = this,
				body = targetWindow.document && targetWindow.document.body;

			if(body){
				// Listen for touches or mousedowns... could also use dojo/touch.press here.
				var event = rias.has("pointer-events") ? "pointerdown" : rias.has("MSPointer") ? "MSPointerDown" :
					rias.has("touch-events") ? "mousedown, touchstart" : "mousedown";
				var mdh = rias.on(targetWindow.document, event, function(evt){
					// workaround weird IE bug where the click is on an orphaned node
					// (first time clicking a Select/DropDownButton inside a TooltipDialog).
					// actually, strangely this is happening on latest chrome too.
					if(evt && evt.target && evt.target.parentNode == null){
						return;
					}

					self._onTouchNode(effectiveNode || evt.target, "mouse");
				});

				var fih = rias.on(body, 'focusin', function(evt){
					// When you refocus the browser window, IE gives an event with an empty srcElement
					if(!evt.target.tagName) { return; }

					// IE reports that nodes like <body> have gotten focus, even though they have tabIndex=-1,
					// ignore those events
					var tag = evt.target.tagName.toLowerCase();
					if(tag === "#document" || tag === "body"){ return; }

					if(rias.a11y.isFocusable(evt.target)){
						self._onFocusNode(effectiveNode || evt.target);
					}else{
						// Previous code called _onTouchNode() for any activate event on a non-focusable node.   Can
						// probably just ignore such an event as it will be handled by onmousedown handler above, but
						// leaving the code for now.
						self._onTouchNode(effectiveNode || evt.target);
					}
				});

				var foh = rias.on(body, 'focusout', function(evt){
					self._onBlurNode(effectiveNode || evt.target);
				});

				return {
					remove: function(){
						mdh.remove();
						fih.remove();
						foh.remove();
						mdh = fih = foh = null;
						body = null;	// prevent memory leak (apparent circular reference via closure)
					}
				};
			}
		},

		_currNodeSetter: function(value){
			/// 继承自 Stateful，用 _currNodeSetter
			///this._set("currNode", value);/// Stateful 没必要 _set
			this.set("prevNode", this.currNode);
			this.currNode = value;
			//console.debug(this.currNode ? this.currNode.id : "[no id]", this.currNode);
		},

		_onBlurNode: function(){
			// summary:
			//		Called when focus leaves a node.
			//		Usually ignored, _unless_ it *isn't* followed by touching another node,
			//		which indicates that we tabbed off the last field on the page,
			//		in which case every widget is marked inactive

			var self = this,
				now = (new Date()).getTime();
			//console.debug("_onBlurNode - " + (now - lastFocusin) + " - " + node.id);

			// IE9+ and chrome have a problem where focusout events come after the corresponding focusin event.
			// For chrome problem see https://bugs.dojotoolkit.org/ticket/17668.
			// IE problem happens when moving focus from the Editor's <iframe> to a normal DOMNode.
			if(now < lastFocusin + 100){
				return;
			}

			// If the blur event isn't followed by a focus event, it means the user clicked on something unfocusable,
			// so clear focus.
			if(this._clearFocusTimer){
				clearTimeout(this._clearFocusTimer);
			}
			this._clearFocusTimer = setTimeout(function(){
				///还是用 watch("currNode") 的 publish("focusedNode") 好些
				self.set("currNode", null);
			}, 0);

			// Unset timer to zero-out widget stack; we'll reset it below if appropriate.
			if(this._clearActiveWidgetsTimer){
				clearTimeout(this._clearActiveWidgetsTimer);
				delete this._clearActiveWidgetsTimer;
			}

			if(now < lastTouchOrFocusin + 100){
				// This blur event is coming late (after the call to _onTouchNode() rather than before.
				// So let _onTouchNode() handle setting the widget stack.
				// See https://bugs.dojotoolkit.org/ticket/17668
				return;
			}

			// If the blur event isn't followed (or preceded) by a focus or touch event then mark all widgets as inactive.
			this._clearActiveWidgetsTimer = setTimeout(function(){
				delete self._clearActiveWidgetsTimer;
				self._setStack([]);
			}, 0);
		},
		_onTouchNode: function(/*DomNode*/ node, /*String*/ by){

			// Keep track of time of last focusin or touch event.
			lastTouchOrFocusin = (new Date()).getTime();
			//console.debug("_onTouchNode - " + node.id);

			if(this._clearActiveWidgetsTimer){
				// forget the recent blur event
				clearTimeout(this._clearActiveWidgetsTimer);
				delete this._clearActiveWidgetsTimer;
			}

			// if the click occurred on the scrollbar of a dropdown, treat it as a click on the dropdown,
			// even though the scrollbar is technically on the popup wrapper (see #10631)
			///取 popupWrapper 的 widget.domNode
			if(rias.dom.containsClass(node, "riaswPopup")){
				node = node.firstChild;
			}

			// compute stack of active widgets (ex: ComboButton --> Menu --> MenuItem)
			var newStack = [],
				newFocused = node;
			try{
				while(node){
					var parent = rias.by(node._riasrPopupOwner),
						id, widget;
					///只要有 widget，就 focus
					///widget = rias.by(node);/// rias.by 导致子节点也会定位到 widget。
					id = node.getAttribute && node.getAttribute("widgetId");
					widget = id && rias.by(id);
					//if(widget && by !== "mouse" && !widget.get("disabled")){
					if(widget && !(by === "mouse" && widget.get("disabled"))){
						newStack.unshift(id);
					}
					if(parent){
						node = parent.domNode;
						//}else if(owner){
						//	widget = owner;
						//	node = widget.domNode;
					}else if(node.tagName && node.tagName.toLowerCase() === "body"){
						// is this the root of the document or just the root of an iframe?
						if(node === rias.dom.body()){
							// node is the root of the main document
							break;
						}
						// otherwise, find the iframe this node refers to (can't access it via parentNode,
						// need to do this trick instead). window.frameElement is supported in IE/FF/Webkit
						node = rias.dom.getWindow(node.ownerDocument).frameElement;
					}else{
						// if this node is the root node of a widget, then add widget id to stack,
						// except ignore clicks on disabled widgets (actually focusing a disabled widget still works,
						// to support MenuItem)
						/*id = node.getAttribute && node.getAttribute("widgetId");
						 widget = id && rias.by(id);
						 if(widget && !(by == "mouse" && widget.get("disabled"))){
						 newStack.unshift(id);
						 }*/
						node = node.parentNode;
					}
				}
			}catch(e){ /* squelch */ }

			this._setStack(newStack, by, newFocused);
		},
		_onFocusNode: function(/*DomNode*/ node){
			// summary:
			//		Callback when node is focused

			if(!node){
				return;
			}

			if(node.nodeType === 9){/// 9 是 Documnet
				// Ignore focus events on the document itself.  This is here so that
				// (for example) clicking the up/down arrows of a spinner
				// (which don't get focus) won't cause that widget to blur. (FF issue)
				return;
			}

			// Keep track of time of last focusin event.
			lastFocusin = (new Date()).getTime();

			// There was probably a blur event right before this event, but since we have a new focus,
			// forget about the blur
			if(this._clearFocusTimer){
				clearTimeout(this._clearFocusTimer);
				delete this._clearFocusTimer;
			}

			if(node !== this.currNode){
				///还是用 watch("currNode") 的 publish("focusedNode") 好些
				this.set("currNode", node);
			}
			this._onTouchNode(node);
		},
		_setStack: function (newStack, by, newFocused) {
			var oldStack = this.activeStack,
				lastOldIdx = oldStack.length - 1,
				lastNewIdx = newStack.length - 1;
			//console.debug("_setStack - new, old:\n", newStack, oldStack);
			if (newStack[lastNewIdx] === oldStack[lastOldIdx] && lastOldIdx === lastNewIdx) {
				/// 如果 length 不同也需要重置。
				/// 没有 newStack 时，不处理。
				return;
			}
			this.set("activeStack", newStack);
			rias.dom.focusedStack = newStack;
			var //oldWidget = rias.by(oldStack[lastOldIdx]),
			//newWidget = rias.by(newStack[lastNewIdx]),
			//focusableNode,
				widget, i;
			/// 修改 dijit 原来的重置机制，允许长度不同时重置。
			/// 全部扫描一遍，排除已经 focused。
			for (i = lastOldIdx; i >= 0; i--) {
				widget = rias.by(oldStack[i]);
				if(widget && newStack.indexOf(oldStack[i]) < 0){
					widget._hasBeenBlurred = true;
					widget.set("focused", false);
					//console.debug("_onBlur:", i, widget.id);
					if (widget._focusManager === this) {
						widget._onBlur(by, i, newStack, oldStack);
					}
					//this.emit("widget-blur", widget, by);
				}
			}
			for (i = lastNewIdx; i >= 0; i--) {
				//for (i = 0; i <= lastNewIdx; i++) {
				widget = rias.by(newStack[i]);
				if(widget && oldStack.indexOf(newStack[i]) < 0){
					widget.set("focused", true);
					//console.debug("_onFocus:", i, widget.id);
					if (widget._focusManager === this) {
						widget._onFocus(by, i, newStack, oldStack);
					}
					//this.emit("widget-focus", widget, by);
				}
			}
		},
		focus: function(/*Object|DomNode */ handle){
			if(!handle){
				return;
			}

			var node = "node" in handle ? handle.node : handle;		// because handle is either DomNode or a composite object

			//console.debug("focus - " + node.id);
			if(node){
				///允许使用 _WidgetBase
				if(rias.isRiasw(node)){
					/// Tree.focusNode 是 function
					node = (rias.isDomNode(node.focusNode) ? node.focusNode : node.containerNode || node.domNode);
				}
				var focusNode = (node.tagName && node.tagName.toLowerCase() === "iframe") ? node.contentWindow : node;
				if(focusNode && focusNode.focus){
					try{
						// Gecko throws sometimes if setting focus is impossible,
						// node not displayed or something like that
						focusNode.focus();
					}catch(e){/*quiet*/}
				}
				this._onFocusNode(node);
			}
		}

	});

	var singleton = new FocusManager();

	// register top window and all the iframes it contains
	rias.ready(function(){
		var handle = singleton.registerWin(rias.dom.getWindow(document));
		//if(rias.has("ie")){
			rias.on(window, "unload", function(){
				if(handle){// because this gets called twice when doh.robot is running
					handle.remove();
					handle = null;
				}
				singleton._hDomEmpty.remove();
				singleton._hDomEmpty = undefined;
				singleton._hDomDestroy.remove();
				singleton._hDomDestroy = undefined;

				singleton = null;/// Stateful 和 Evented 是简单对象。
			});
		//}
	});

	/// focus 是 singleton，如果需要扩展，不能用 extend，只能用 safeMixin
	//rias.safeMixin(focus, {
	//});
	return singleton;
});
