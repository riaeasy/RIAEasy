
//RIAStudio ClientWidget - sys._ListMixin.

define([
	"riasw/riaswBase"
], function(rias){

	// module:
	//		riasw/sys/_ListMixin

	return rias.declare("riasw.sys._ListMixin", null, {
		// summary:
		//		Focus-less menu to handle UI events consistently.
		//		Abstract methods that must be defined externally:
		//
		//		- onSelect: item is active (mousedown but not yet mouseup, or keyboard arrow selected but no Enter)
		//		- onDeselect:  cancels onSelect
		// tags:
		//		private

		// selected: DOMNode
		//		currently selected node
		selected: null,

		_listConnect: function(/*String|Function*/ eventType, /*String*/ callbackFuncName){
			// summary:
			//		Connects 'containerNode' to specified method of this object
			//		and automatically registers for 'disconnect' on widget destroy.
			// description:
			//		Provide widget-specific analog to 'connect'.
			//		The callback function is called with the normal event object,
			//		but also a second parameter is passed that indicates which list item
			//		actually received the event.
			// returns:
			//		A handle that can be passed to `disconnect` in order to disconnect
			//		before the widget is destroyed.
			// tags:
			//		private

			var self = this;
			return self.own(rias.on(self.containerNode,
				rias.on.selector(
					function(eventTarget, selector, target){
						return eventTarget.parentNode === target;
					},
					eventType
				),
				function(evt){
					self[callbackFuncName](evt, this);
				}
			));
		},

		postCreate: function(){
			this.inherited(arguments);

			// Add flag to use normalized click handling from dojo/touch
			this.domNode.dojoClick = true;

			// For some reason in IE click event is fired immediately after user scrolled combobox control and released
			// his/her finger. As a fix we replace click with tap event that is fired correctly.
			if(!( (rias.has("ie") >= 10 || (!rias.has("ie") && rias.has("trident") > 6)) && typeof(MSGesture) !== "undefined")){
				this._listConnect("click", "_onClick");
			}else{
				this._listConnect(rias.touch.press, "_onPress");

				var self = this,
					tapGesture = new MSGesture(),
					target;

				this._onPress = function(e){
					tapGesture.target = self.domNode;
					tapGesture.addPointer(e.pointerId);
					target = e.target;
				};

				this.on("MSGestureTap", function(e){
					self._onClick(e, target);
				});
			}
			this._listConnect("mousedown", "_onMouseDown");
			this._listConnect("mouseup", "_onMouseUp");
			this._listConnect("mouseover", "_onMouseOver");
			this._listConnect("mouseout", "_onMouseOut");
		},

		_onClick: function(/*Event*/ evt, /*DomNode*/ target){
			this._setSelectedAttr(target, false);
			if(this._deferredClick){
				this._deferredClick.remove();
			}
			this._deferredClick = this.defer(function(){
				this._deferredClick = null;
				this.onClick(target);
			});
		},

		_onMouseDown: function(/*Event*/ evt, /*DomNode*/ target){
			if(this._hoveredNode){
				this.onUnhover(this._hoveredNode);
				this._hoveredNode = null;
			}
			this._isDragging = true;
			this._setSelectedAttr(target, false);
		},

		_onMouseUp: function(/*Event*/ evt, /*DomNode*/ target){
			this._isDragging = false;
			var hoveredNode = this._hoveredNode;
			if(this.selected && target === this.selected){
				this.defer(function(){
					this._onClick(evt, this.selected);
				});
			}else if(hoveredNode){ // drag to select
				this.defer(function(){
					this._onClick(evt, hoveredNode);
				});
			}
		},

		_onMouseOut: function(/*Event*/ evt, /*DomNode*/ target){
			if(this._hoveredNode){
				this.onUnhover(this._hoveredNode);
				this._hoveredNode = null;
			}
			if(this._isDragging){
				this._cancelDrag = (new Date()).getTime() + 1000; // cancel in 1 second if no _onMouseOver fires
			}
		},

		_onMouseOver: function(/*Event*/ evt, /*DomNode*/ target){
			if(this._cancelDrag){
				var time = (new Date()).getTime();
				if(time > this._cancelDrag){
					this._isDragging = false;
				}
				this._cancelDrag = null;
			}
			this._hoveredNode = target;
			this.onHover(target);
			if(this._isDragging){
				this._setSelectedAttr(target, false);
			}
		},

		selectFirstNode: function(){
			// summary:
			//		Select the first displayed item in the list.
			var first = this.containerNode.firstChild;
			while(first && first.style.display === "none"){
				first = first.nextSibling;
			}
			this._setSelectedAttr(first, true);
		},

		selectLastNode: function(){
			// summary:
			//		Select the last displayed item in the list
			var last = this.containerNode.lastChild;
			while(last && last.style.display === "none"){
				last = last.previousSibling;
			}
			this._setSelectedAttr(last, true);
		},

		selectNextNode: function(){
			// summary:
			//		Select the item just below the current selection.
			//		If nothing selected, select first node.
			if(!this.selected){
				this.selectFirstNode();
			}else{
				var next = this.selected.nextSibling;
				while(next && next.style.display === "none"){
					next = next.nextSibling;
				}
				if(!next){
					this.selectFirstNode();
				}else{
					this._setSelectedAttr(next, true);
				}
			}
		},

		selectPreviousNode: function(){
			// summary:
			//		Select the item just above the current selection.
			//		If nothing selected, select last node (if
			//		you select Previous and try to keep scrolling up the list).
			if(!this.selected){
				this.selectLastNode();
			}else{
				var prev = this.selected.previousSibling;
				while(prev && prev.style.display === "none"){
					prev = prev.previousSibling;
				}
				if(!prev){
					this.selectLastNode();
				}else{
					this._setSelectedAttr(prev, true);
				}
			}
		},

		_setSelectedAttr: function(/*DomNode*/ node, /*Boolean*/ scroll){
			// summary:
			//		Does the actual select.
			// node:
			//		The option to select
			// scroll:
			//		If necessary, scroll node into view.  Set to false for mouse/touch to
			//		avoid jumping problems on mobile/RTL, see https://bugs.dojotoolkit.org/ticket/17739.
			if(this.selected !== node){
				if(this.selected){
					this.onDeselect(this.selected);
				}
				if(node){
					if(scroll){
						rias.dom.scrollIntoView(node);
					}
					this.onSelect(node);
				}
				this._set("selected", node);
			}else if(node){
				this.onSelect(node);
			}
		}
	});
});
