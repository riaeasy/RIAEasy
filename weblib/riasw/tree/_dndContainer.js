define([
	"riasw/riaswBase"
], function(rias){

	// module:
	//		riasw/tree/_dndContainer

	/*=====
	 var __Args = {
	 // summary:
	 //		A dict of parameters for Tree source configuration.
	 // isSource: Boolean?
	 //		Can be used as a DnD source. Defaults to true.
	 // accept: String[]
	 //		List of accepted types (text strings) for a target; defaults to
	 //		["text", "treeNode"]
	 // copyOnly: Boolean?
	 //		Copy items, if true, use a state of Ctrl key otherwise,
	 // dragThreshold: Number
	 //		The move delay in pixels before detecting a drag; 0 by default
	 // betweenThreshold: Integer
	 //		Distance from upper/lower edge of node to allow drop to reorder nodes
	 };
	 =====*/

	return rias.declare("riasw.tree._dndContainer", null, {

		// summary:
		//		This is a base class for `riasw/tree/_dndSelector`, and isn't meant to be used directly.
		//		It's modeled after `dojo/dnd/Container`.
		// tags:
		//		protected

		/*=====
		 // current: TreeNode
		 //		The currently hovered TreeNode.  Not set to anything for keyboard operation.  (TODO: change?)
		 current: null,
		 =====*/

		constructor: function(tree, params){
			// summary:
			//		A constructor of the Container
			// tree: Node
			//		Node or node's id to build the container on
			// params: __Args
			//		A dict of parameters, which gets mixed into the object
			// tags:
			//		private
			this.tree = tree;
			this.node = tree.domNode;	// TODO: rename; it's not a TreeNode but the whole Tree
			rias.mixin(this, params);

			// states
			this.containerState = "";
			rias.dom.addClass(this.node, "dojoDndContainer");

			// set up events
			this.events = [
				// Mouse (or touch) enter/leave on Tree itself
				rias.on(this.node, rias.touch.enter, rias.hitch(this, "onOverEvent")),
				rias.on(this.node, rias.touch.leave, rias.hitch(this, "onOutEvent")),

				// switching between TreeNodes
				rias.after(this.tree, "_onNodeMouseEnter", rias.hitch(this, "onMouseOver"), true),
				rias.after(this.tree, "_onNodeMouseLeave", rias.hitch(this, "onMouseOut"), true),

				// cancel text selection and text dragging
				rias.on(this.node, "dragstart, selectstart", function(evt){
					evt.preventDefault();
				})
			];
		},
		destroy: function(){
			///注意：_dndContainer 没有继承自 Destroyable
			// summary:
			//		Prepares this object to be garbage-collected

			var h;
			while((h = this.events.pop())){
				h.remove();
			}

			// this.clearItems();
			this.node = this.parent = null;
		},

		_addItemClass: function(node, type){
			// summary:
			//		Adds a class with prefix "dojoDndItem"
			// node: Node
			//		A node
			// type: String
			//		A variable suffix for a class name
			rias.dom.addClass(node, "dojoDndItem" + type);
		},
		_removeItemClass: function(node, type){
			// summary:
			//		Removes a class with prefix "dojoDndItem"
			// node: Node
			//		A node
			// type: String
			//		A variable suffix for a class name
			rias.dom.removeClass(node, "dojoDndItem" + type);
		},
		_changeState: function(type, newState){
			// summary:
			//		Changes a named state to new state value
			// type: String
			//		A name of the state to change
			// newState: String
			//		new state
			var prefix = "dojoDnd" + type;
			var state = type.toLowerCase() + "State";
			//domClass.replace(this.node, prefix + newState, prefix + this[state]);
			rias.dom.replaceClass(this.node, prefix + newState, prefix + this[state]);
			this[state] = newState;
		},

		// mouse events
		onMouseOver: function(widget /*===== , evt =====*/){
			// summary:
			//		Called when mouse is moved over a TreeNode
			// widget: TreeNode
			// evt: Event
			// tags:
			//		protected
			this.current = widget;
		},

		onMouseOut: function(/*===== widget, evt =====*/){
			// summary:
			//		Called when mouse is moved away from a TreeNode
			// widget: TreeNode
			// evt: Event
			// tags:
			//		protected
			this.current = null;
		},

		onOverEvent: function(){
			// summary:
			//		This function is called once, when mouse is over our container
			// tags:
			//		protected
			this._changeState("Container", "Over");
		},

		onOutEvent: function(){
			// summary:
			//		This function is called once, when mouse is out of our container
			// tags:
			//		protected
			this._changeState("Container", "");
		}
	});
});
