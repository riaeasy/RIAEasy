define([
	"riasw/riaswBase",
	"dojo/dnd/common",
	"./_dndContainer"
], function(rias, dndCommon, _dndContainer){

	// module:
	//		riasw/tree/_dndSelector

	return rias.declare("riasw.tree._dndSelector", _dndContainer, {
		// summary:
		//		This is a base class for `riasw/tree/dndSource`, and isn't meant to be used directly.
		//		It's based on `dojo/dnd/Selector`.
		// tags:
		//		protected

		/*=====
		// selection: Object
		//		(id to DomNode) map for every TreeNode that's currently selected.
		//		The DOMNode is the TreeNode.rowNode.
		selection: {},
		=====*/

		constructor: function(){
			// summary:
			//		Initialization
			// tags:
			//		private

			this.selection = {};
			this.anchor = null;

			this.events.push(
				// listeners setup here but no longer used (left for backwards compatibility
				rias.on(this.tree.domNode, rias.touch.press, rias.hitch(this,"onMouseDown")),
				rias.on(this.tree.domNode, rias.touch.release, rias.hitch(this,"onMouseUp")),

				// listeners used in this module
				rias.on(this.tree.domNode, rias.touch.move, rias.hitch(this,"onMouseMove")),
				rias.on(this.tree.domNode, rias.a11yclick.press, rias.hitch(this,"onClickPress")),
				rias.on(this.tree.domNode, rias.a11yclick.release, rias.hitch(this,"onClickRelease"))
			);
		},
		destroy: function(){
			///注意：没有继承自 Destroyable
			// summary:
			//		Prepares the object to be garbage-collected
			if(this._focusHandle){
				this._focusHandle.remove();
			}
			this._focusHandle = undefined;
			this.inherited(arguments);
			this.selection = this.anchor = null;
		},

		// singular: Boolean
		//		Allows selection of only one element, if true.
		//		Tree hasn't been tested in singular=true mode, unclear if it works.
		singular: false,

		// methods
		getItem: function(/*String*/ key){
			// summary:
			//		Returns the dojo/dnd/Container._Item (representing a dragged node) by it's key (id).
			//		Called by dojo/dnd/Source.checkAcceptance().
			// tags:
			//		protected

			var widget = this.selection[key];
			return {
				data: widget,
				type: ["treeNode"]
			}; // dojo/dnd/Container._Item
		},
		forInSelectedItems: function(/*Function*/ f, /*Object?*/ o){
			// summary:
			//		Iterates over selected items;
			//		see `dojo/dnd/Container.forInItems()` for details
			o = o || rias.global;
			for(var id in this.selection){
				// console.log("selected item id: " + id);
				f.call(o, this.getItem(id), id, this);
			}
		},
		getSelectedTreeNodes: function(){
			// summary:
			//		Returns a list of selected node(s).
			//		Used by dndSource on the start of a drag.
			// tags:
			//		protected
			var nodes=[], sel = this.selection;
			for(var i in sel){
				nodes.push(sel[i]);
			}
			return nodes;
		},

		addTreeNode: function(/*riasw/tree/TreeNode*/ node, /*Boolean?*/isAnchor){
			// summary:
			//		add node to current selection
			// node: Node
			//		node to add
			// isAnchor: Boolean
			//		Whether the node should become anchor.

			this.setSelection(this.getSelectedTreeNodes().concat( [node] ));
			if(isAnchor){
				this.anchor = node;
			}
			return node;
		},
		removeTreeNode: function(/*riasw/tree/TreeNode*/ node){
			// summary:
			//		remove node and it's descendants from current selection
			// node: Node
			//		node to remove
			var newSelection = rias.filter(this.getSelectedTreeNodes(), function(selectedNode){
				//return !rias.dom.isDescendant(selectedNode.domNode, node.domNode); // also matches when selectedNode == node
				if(!node.selectionMode || node.selectionMode === "cascade"){
					return !rias.dom.isDescendant(selectedNode.domNode, node.domNode); // also matches when selectedNode == node
				}else{
					return selectedNode.domNode !== node.domNode; // also matches when selectedNode == node
				}
			});
			this.setSelection(newSelection);
			return node;
		},
		isTreeNodeSelected: function(/*riasw/tree/TreeNode*/ node){
			// summary:
			//		return true if node is currently selected
			// node: Node
			//		the node to check whether it's in the current selection

			return node.id && !!this.selection[node.id];
		},
		_setDifference: function(xs,ys){
			// summary:
			//		Returns a copy of xs which lacks any objects
			//		occurring in ys. Checks for membership by
			//		modifying and then reading the object, so it will
			//		not properly handle sets of numbers or strings.

			rias.forEach(ys, function(y){
				y.__exclude__ = true;
			});
			var ret = rias.filter(xs, function(x){
				return !x.__exclude__;
			});

			// clean up after ourselves.
			rias.forEach(ys, function(y){
				delete y.__exclude__;
			});
			return ret;
		},
		_debounceSelectFocusDelay: 70,
		_updateSelectionProperties: function(save){
			// summary:
			//		Update the following tree properties from the current selection:
			//		path[s], selectedItem[s], selectedNode[s]

			var selected = this.getSelectedTreeNodes();
			var paths = [], nodes = [];
			rias.forEach(selected, function(node){
				var ary = node.getTreePath();
				nodes.push(node);
				paths.push(ary);
			}, this);
			var tree = this.tree,
				items = rias.map(nodes,function(node){
					return node.item;
				});
			tree._set("paths", paths);
			tree._set("path", paths[0] || []);
			tree._set("selectedNodes", nodes);
			//tree._set("selectedNode", nodes[0] || null);
			tree._set("selectedItems", items);
			//tree._set("selectedItem", items[0] || null);
			if(save){
				///这里需要同时保存 opened 和 paths
				tree.savePersist();
			}
			tree.onSelectItems(items, nodes);
			if(tree.autoFocusWhenSelectNode){
				if(nodes[0]){
					this._focusHandle = rias._debounce(tree.id + ".autoFocusWhenSelectNode", function(){
						this._focusHandle = undefined;
						nodes[0].focus();
					}, this._debounceSelectFocusDelay, this)();
				}
			}
		},
		setSelection: function(/*riasw/tree/TreeNode[]*/ newSelection){
			// summary:
			//		set the list of selected nodes to be exactly newSelection. All changes to the
			//		selection should be passed through this function, which ensures that derived
			//		attributes are kept up to date. Anchor will be deleted if it has been removed
			//		from the selection, but no new anchor will be added by this function.
			// newSelection: Node[]
			//		list of tree nodes to make selected
			var self = this,
				oldSelection = this.getSelectedTreeNodes(),
				save;
			rias.forEach(self._setDifference(oldSelection, newSelection), function(node){
				save = true;
				node.setSelected(false);
				if(self.anchor === node){
					delete self.anchor;
				}
				delete self.selection[node.id];
			});
			rias.forEach(self._setDifference(newSelection, oldSelection), function(node){
				save = true;
				node.setSelected(true);
				self.selection[node.id] = node;
			});
			self._updateSelectionProperties(save);
		},

		selectNone: function(){
			// summary:
			//		Unselects all items
			// tags:
			//		private

			this.setSelection([]);
			return this;	// self
		},
		_compareNodes: function(n1, n2){
			if(n1 === n2){
				return 0;
			}

			if('sourceIndex' in document.documentElement){ //IE
				//TODO: does not yet work if n1 and/or n2 is a text node
				return n1.sourceIndex - n2.sourceIndex;
			}else if('compareDocumentPosition' in document.documentElement){ //FF, Opera
				return n1.compareDocumentPosition(n2) & 2 ? 1: -1;
			}else if(document.createRange){ //Webkit
				var r1 = document.createRange();
				r1.setStartBefore(n1);

				var r2 = document.createRange();
				r2.setStartBefore(n2);

				return r1.compareBoundaryPoints(r1.END_TO_END, r2);
			}else{
				throw Error("riasw.tree.dndSelector._compareNodes don't know how to compare two different nodes in this browser");
			}
		},
		userSelect: function(node, multi, range){
			// summary:
			//		Add or remove the given node from selection, responding
			//		to a user action such as a click or keypress.
			// multi: Boolean
			//		Indicates whether this is meant to be a multi-select action (e.g. ctrl-click)
			// range: Boolean
			//		Indicates whether this is meant to be a ranged action (e.g. shift-click)
			// tags:
			//		protected

			if(this.singular){
				if(this.anchor === node && multi){
					this.selectNone();
				}else{
					this.setSelection([node]);
					this.anchor = node;
				}
			}else{
				if(range && this.anchor){
					var cr = this._compareNodes(this.anchor.rowNode, node.rowNode),
						begin, end, anchor = this.anchor;

					if(cr < 0){ //current is after anchor
						begin = anchor;
						end = node;
					}else{ //current is before anchor
						begin = node;
						end = anchor;
					}
					var nodes = [];
					//add everything betweeen begin and end inclusively
					while(begin !== end){
						nodes.push(begin);
						begin = this.tree._getNextChild(begin);
					}
					nodes.push(end);

					this.setSelection(nodes);
				}else{
					if( this.selection[ node.id ] && multi ){
						this.removeTreeNode( node );
					}else if(multi){
						this.addTreeNode(node, true);
					}else{
						this.setSelection([node]);
						this.anchor = node;
					}
				}
			}
		},

		// selection related events
		onClickPress: function(e){

			// ignore mouse or touch on expando node
			if(this.current && this.current.isExpandable && this.tree.isExpandoNode(e.target, this.current)){
				return;
			}

			if(e.type === "mousedown" && rias.mouse.isLeft(e)){
				// Prevent text selection while dragging on desktop, see #16328.   But don't call preventDefault()
				// for mobile because it will break things completely, see #15838.  Also, don't preventDefault() on
				// MSPointerDown or pointerdown events, because that stops the mousedown event from being generated,
				// see #17709.
				// TODO: remove this completely in 2.0.  It shouldn't be needed since dojo/dnd/Manager already
				// calls preventDefault() for the "selectstart" event.  It can also be achieved via CSS:
				// http://stackoverflow.com/questions/826782/css-rule-to-disable-text-selection-highlighting
				e.preventDefault();
			}

			var treeNode = e.type === "keydown" ? this.tree.focusedChild : this.current;

			if(!treeNode || treeNode.disabled){
				// Click must be on the Tree but not on a TreeNode, happens especially when Tree is stretched to fill
				// a pane of a BorderContainer, etc.
				return;
			}

			var copy = dndCommon.getCopyKeyState(e),
				id = treeNode.id;

			// if shift key is not pressed, and the node is already in the selection,
			// delay deselection until onmouseup so in the case of DND, deselection
			// will be canceled by onmousemove.
			if(treeNode && this.tree.isSelectNode(e.target, treeNode)){
				this._doDeselect = false;
				copy = true;
			}else if(!this.singular && !e.shiftKey && this.selection[id]){
				this._doDeselect = true;
				return;
			}else{
				this._doDeselect = false;
			}
			this.userSelect(treeNode, copy, e.shiftKey);
		},
		onClickRelease: function(e){
			// summary:
			//		Event processor for onmouseup/ontouchend/onkeyup corresponding to a click event
			// e: Event
			//		onmouseup/ontouchend/onkeyup event
			// tags:
			//		protected

			// _doDeselect is the flag to indicate that the user wants to either ctrl+click on
			// an already selected item (to deselect the item), or click on a not-yet selected item
			// (which should remove all current selection, and add the clicked item). This can not
			// be done in onMouseDown, because the user may start a drag after mousedown. By moving
			// the deselection logic here, the user can drag an already selected item.
			if(!this._doDeselect){
				return;
			}
			this._doDeselect = false;
			this.userSelect(e.type === "keyup" ? this.tree.focusedChild : this.current, dndCommon.getCopyKeyState(e), e.shiftKey);
		},
		onMouseMove: function(/*===== e =====*/){
			// summary:
			//		event processor for onmousemove/ontouchmove
			// e: Event
			//		onmousemove/ontouchmove event
			this._doDeselect = false;
		},

		// mouse/touch events that are no longer used
		onMouseDown: function(){
			// summary:
			//		Event processor for onmousedown/ontouchstart
			// e: Event
			//		onmousedown/ontouchstart event
			// tags:
			//		protected
		},
		onMouseUp: function(){
			// summary:
			//		Event processor for onmouseup/ontouchend
			// e: Event
			//		onmouseup/ontouchend event
			// tags:
			//		protected
		}

	});

});
