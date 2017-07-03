//RIAStudio client runtime widget - TreeNode

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_Container",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/_CssStateMixin"
], function(rias, _WidgetBase, _Container, _TemplatedMixin, _CssStateMixin) {

	//rias.theme.loadThemeCss([
	//	"riasw/tree/Tree.css"
	//]);

	var riaswType = "riasw.tree.TreeNode";
	var Widget = rias.declare(riaswType, [_WidgetBase, _Container, _TemplatedMixin, _CssStateMixin], {
		// summary:
		//		Single node within a tree.   This class is used internally
		//		by Tree and should not be accessed directly.
		// tags:
		//		private

		// item: [const] Item
		//		the dojo.data entry this tree represents
		item: null,

		// isTreeNode: [protected] Boolean
		//		Indicates that this is a TreeNode.   Used by `riasw.tree.Tree` only,
		//		should not be accessed directly.
		isTreeNode: true,
		// isExpandable: [private] Boolean
		//		This node has children, so show the expando node (+ sign)
		isExpandable: null,
		// isExpanded: [readonly] Boolean
		//		This node is currently expanded (ie, opened)
		isExpanded: false,
		// state: [private] String
		//		Dynamic loading-related stuff.
		//		When an empty folder node appears, it is "NotLoaded" first,
		//		then after dojo.data query it becomes "Loading" and, finally "Loaded"
		state: "NotLoaded",

		// labelType: [const] String
		//		Specifies how to interpret the label.  Can be "html" or "text".
		labelType: "text",
		// label: String
		//		Text of this tree node
		label: "",
		_setLabelAttr: function(val){
			this.labelNode[this.labelType === "html" ? "innerHTML" : "innerText" in this.labelNode ? "innerText" : "textContent"] = val;
			this._set("label", val);
			//if(this.applyTextDir){
			//	this.applyTextDir(this.labelNode);
			//}
			//rias.dom.toggleClass(this.labelNode, "riaswHidden", !val);
			rias.dom.toggleClass(this.labelNode, "riaswNoLabel", !val);
			rias.dom.toggleClass(this.labelNode, "riaswHasLabel", !!val);
		},
		_setTooltipAttr: function(/*String*/ tooltip){
			this.inherited(arguments);
		},

		templateString:
			'<div class="riaswTreeNode" role="presentation">' +
				'<div role="presentation" data-dojo-attach-point="rowNode,focusNode" class="riaswTreeRow" data-dojo-attach-event="onmouseenter:_onToggleMouseEnter,onmouseleave:_onToggleMouseLeave">' +
					'<span role="presentation" data-dojo-attach-point="expandoNode" class="riaswTreeExpando"></span>' +
					//'<span role="presentation" data-dojo-attach-point="expandoNodeText" class="dijitInline riaswTreeNodeExpandoText"></span>' +
					'<span data-dojo-attach-point="selectNodeIcon" class="dijitInline riaswTreeNodeSelectNodeIcon">'+
						'<input role="presentation" data-dojo-attach-point="selectNode" class="dijitInline riaswTreeNodeSelectNode riaswHidden" type="radio" tabindex="-1">' +
					'</span>' +
					'<span role="presentation" data-dojo-attach-point="contentNode" class="dijitInline riaswTreeNodeContent">' +
						'<span role="presentation" data-dojo-attach-point="iconNode" class="riaswButtonIcon riaswNoIcon"></span>' +
						'<span role="treeitem" data-dojo-attach-point="labelNode" class="dijitInline riaswTreeNodeLabel" tabindex="-1" aria-selected="false" id="${id}_label"></span>' +
					'</span>' +
				'</div>' +
				'<div role="presentation" data-dojo-attach-point="containerNode" class="riaswTreeNodeContainer" style="display: none;" aria-labelledby="${id}_label"></div>' +
			'</div>',
		baseClass: "riaswTreeNode",
		cssStateNodes: {
			//expandoNode: "riaswTreeExpando",
			rowNode: "riaswTreeRow"
		},

		tabIndex: "0",
		_setTabIndexAttr: "focusNode", // force copy even when tabIndex default value, needed since Button is <span>
		_setIconClassAttr: null,/// TreeNode 使用 _updateItemClasses 实现
		disabled: false,
		selectionMode: "none",

		// indent: Integer
		//		Levels from this node to the root node
		indent: 0,

		//resize: null,///优化，可以屏蔽

		_setSelectionModeAttr: function(value){
			var node = this.selectNode,
				icon = this.selectNodeIcon;
			switch (value) {
				case "single":
				case "radio":
					value = "single";
					rias.dom.setAttr(node, "type", "radio");
					if(icon){
						rias.dom.removeClass(icon, "riaswHidden");
						rias.dom.removeClass(icon, "riaswCheckBox");
						rias.dom.addClass(icon, "riaswRadioBox");
					}else{
						rias.dom.removeClass(node, "riaswHidden");
					}
					break;
				case "multiple":
				case "extended":
				case "checkbox":
					value = "multiple";
					rias.dom.setAttr(node, "type", "checkbox");
					if(icon){
						rias.dom.removeClass(icon, "riaswHidden");
						rias.dom.removeClass(icon, "riaswRadioBox");
						rias.dom.addClass(icon, "riaswCheckBox");
					}else{
						rias.dom.removeClass(node, "riaswHidden");
					}
					break;
				default:
					value = "none";
					rias.dom.addClass(node, "riaswHidden");
					if(icon){
						rias.dom.addClass(icon, "riaswHidden");
						rias.dom.removeClass(icon, "riaswCheckBox");
						rias.dom.removeClass(icon, "riaswRadioBox");
					}
			}
			this._set("selectionMode", value);
		},
		_setIndentAttr: function(indent){
			// summary:
			//		Tell this node how many levels it should be indented
			// description:
			//		0 for top level nodes, 1 for their children, 2 for their
			//		grandchildren, etc.

			// Math.max() is to prevent negative padding on hidden root node (when indent == -1)
			var pixels = (Math.max(indent, 0) * this.tree._nodePixelIndent) + "px";

			rias.dom.setStyle(this.domNode, "backgroundPosition", pixels + " 0px");	// TODOC: what is this for???
			rias.dom.setStyle(this.rowNode, this.isLeftToRight() ? "paddingLeft" : "paddingRight", pixels);

			rias.forEach(this.getChildren(), function(child){
				child.set("indent", indent + 1);
			});

			this._set("indent", indent);
		},

		buildRendering: function(){
			this.inherited(arguments);

			// set expand icon for leaf
			this._setExpando();

			// set icon and label class based on item
			this._updateItemClasses(this.item);

			if(this.isExpandable){
				this.labelNode.setAttribute("aria-expanded", this.isExpanded);
			}

			//aria-selected should be false on all selectable elements.
			this.setSelected(false);
		},
		_onDestroy: function(){
			if(this._setChildItemsHandle){
				this._setChildItemsHandle.remove();
				this._setChildItemsHandle = undefined;
			}
			if(this._autoToggleDelay){
				this._autoToggleDelay.remove();
				this._autoToggleDelay = undefined;
			}
			if(this._loadDeferred){
				this._loadDeferred.cancel("destroy node");//resolve(false);
				this._loadDeferred = undefined;
			}
			if(this._expandDeferred){
				this._expandDeferred.cancel("destroy node");//resolve(false);
				this._expandDeferred = undefined;
			}
			if(this._collapseDeferred){
				this._collapseDeferred.cancel("destroy node");//resolve(false);
				this._collapseDeferred = undefined;
			}
			this.inherited(arguments);
		},

		markProcessing: function(){
			// summary:
			//		Visually denote that tree is loading data, etc.
			// tags:
			//		private
			this.state = "Loading";
			this._setExpando(true);
		},
		unmarkProcessing: function(){
			// summary:
			//		Clear markup from markProcessing() call
			// tags:
			//		private
			this._setExpando(false);
		},

		_updateItemClasses: function(item){
			// summary:
			//		Set appropriate CSS classes for icon and label dom node
			//		(used to allow for item updates to change respective CSS)
			// tags:
			//		private
			this._applyClassAndStyle(item, "icon", "Icon");
			this._applyClassAndStyle(item, "label", "Label");
			this._applyClassAndStyle(item, "row", "Row");

			//rias.dom.toggleClass(this.domNode, this.baseClass + "Disabled", !!this.disabled);///this.disabled = undefiend 时，是直接翻转

			this.tree._startPaint(true);		// signifies paint started and finished (synchronously)
		},
		_applyClassAndStyle: function(item, lower, upper){
			var clsName = "_" + lower + "Class";
			var nodeName = lower + "Node";
			var oldCls = this[clsName];
			//this[clsName] = this.tree["get" + upper + "Class"](item, this.isExpanded);
			var f = this.tree["get" + upper + "Class"];
			this[clsName] = rias.hitch(this.tree, f)(item, this.isExpanded);
			rias.dom.replaceClass(this[nodeName], this[clsName] || "", oldCls || "");
			oldCls = this.tree["get" + upper + "Style"](item, this.isExpanded) || {};
			rias.dom.setStyle(this[nodeName], oldCls);

			if(lower === "icon"){
				rias.dom.toggleClass(this.iconNode, "riaswNoIcon", !oldCls);
				rias.dom.toggleClass(this.iconNode, "riaswHasIcon", !!oldCls);
				rias.dom.toggleClass(this.domNode, this._baseClass0 + "HasIcon", !!oldCls);
			}
		},

		_updateRootLast: function(){
			// summary:
			//		Set appropriate CSS classes for this.domNode
			// tags:
			//		private

			// if we are hiding the root node then make every first level child look like a root node
			var parent = this.getParent(),
				markAsRoot = !parent || !parent.rowNode || parent.rowNode.style.display === "none";
			rias.dom.toggleClass(this.domNode, "riaswTreeNodeIsRoot", markAsRoot);
			rias.dom.toggleClass(this.domNode, "riaswTreeNodeIsLast", !markAsRoot && !this.getNextSibling());
		},

		_setExpando: function(/*Boolean*/ processing){
			// summary:
			//		Set the right image for the expando node
			// tags:
			//		private

			// apply the appropriate class to the expando node
			if(this.expandoNode){
				var styles = [
						"riaswTreeExpandoLoading",
						"riaswTreeExpandoOpened",
						"riaswTreeExpandoClosed",
						"riaswTreeExpandoLeaf"
					],
					//_a11yStates = ["*", "-", "+", "*"],
					idx = processing ? 0 : (this.isExpandable ? (this.isExpanded ? 1 : 2) : 3);
				rias.dom.replaceClass(this.expandoNode, styles[idx], styles);
				// provide a non-image based indicator for images-off mode
				//this.expandoNodeText.innerHTML = _a11yStates[idx];
			}

		},
		expand: function(){
			// summary:
			//		Show my children
			// returns:
			//		Promise that resolves when expansion is complete

			// If there's already an expand in progress or we are already expanded, just return
			if(this._expandDeferred){
				return this._expandDeferred;		// dojo/promise/Promise
			}

			// cancel in progress collapse operation
			if(this._collapseDeferred){
				this._collapseDeferred.cancel();
				delete this._collapseDeferred;
			}

			// All the state information for when a node is expanded, maybe this should be
			// set when the animation completes instead
			this.isExpanded = true;
			this.labelNode.setAttribute("aria-expanded", "true");
			if(this.tree.showRoot || this !== this.tree.rootNode){
				this.containerNode.setAttribute("role", "group");
			}
			rias.dom.addClass(this.contentNode, 'riaswTreeContentExpanded');
			this._setExpando();
			this._updateItemClasses(this.item);

			if(this === this.tree.rootNode && this.tree.showRoot){
				this.tree.domNode.setAttribute("aria-expanded", "true");
			}

			var wipeIn = rias.fx.wipeIn({
				node: this.containerNode,
				duration: rias.defaultDuration
			});

			// Deferred that fires when expand is complete
			var def = (this._expandDeferred = rias.newDeferred(function(){
				// Canceller
				wipeIn.stop();
			}));

			var _hEnd = rias.after(wipeIn, "onEnd", function(){
				_hEnd.remove();
				_hEnd = undefined;
				def.resolve(true);
			}, true);

			wipeIn.play();

			return def;		// dojo/promise/Promise
		},
		collapse: function(){
			// summary:
			//		Collapse this node (if it's expanded)
			// returns:
			//		Promise that resolves when collapse is complete

			if(this._collapseDeferred){
				// Node is already collapsed, or there's a collapse in progress, just return that Deferred
				return this._collapseDeferred;
			}

			// cancel in progress expand operation
			if(this._expandDeferred){
				this._expandDeferred.cancel();
				delete this._expandDeferred;
			}

			this.isExpanded = false;
			this.labelNode.setAttribute("aria-expanded", "false");
			if(this === this.tree.rootNode && this.tree.showRoot){
				this.tree.domNode.setAttribute("aria-expanded", "false");
			}
			rias.dom.removeClass(this.contentNode, 'riaswTreeContentExpanded');
			this._setExpando();
			this._updateItemClasses(this.item);

			var wipeOut = rias.fx.wipeOut({
				node: this.containerNode,
				duration: rias.defaultDuration
			});

			// Deferred that fires when expand is complete
			var def = (this._collapseDeferred = rias.newDeferred(function(){
				// Canceller
				wipeOut.stop();
			}));

			var _hEnd = rias.after(wipeOut, "onEnd", function(){
				_hEnd.remove();
				_hEnd = undefined;
				def.resolve(true);
			}, true);

			wipeOut.play();

			return def;		// dojo/promise/Promise
		},

		setChildItems: function(/* Object[] */ items){
			// summary:
			//		Sets the child items of this node, removing/adding nodes
			//		from current children to match specified items[] array.
			//		Also, if this.persist == true, expands any children that were previously
			//		opened.
			// returns:
			//		Promise that resolves after all previously opened children
			//		have been expanded again (or fires instantly if there are no such children).

			if(this.isDestroyed()){
				return rias.newDeferredReject(this.tree.id + ".setChildItems was cancelled because of destroyed.");
			}
			var tree = this.tree,
				model = tree.model,
				defs = [];	// list of deferreds that need to fire before I am complete

			var focusedChild = tree.focusedChild;

			// Orphan all my existing children.
			// If items contains some of the same items as before then we will reattach them.
			var oldChildren = this.getChildren();
			rias.forEach(oldChildren, function(child){
				_Container.prototype.removeChild.call(this, child);// Don't call this.removeChild() because that will collapse the tree etc.
			}, this);


			// Deregister mapping from item id --> this node and its descendants
			function remove(node){
				var id = model.getIdentity(node.item),
					ary = tree._itemNodesMap[id];
				if(ary.length === 1){
					delete tree._itemNodesMap[id];
				}else{
					var index = rias.indexOf(ary, node);
					if(index !== -1){
						ary.splice(index, 1);
					}
				}
				rias.forEach(node.getChildren(), remove);
			}

			// All the old children of this TreeNode are subject for destruction if
			//		1) they aren't listed in the new children array (items)
			//		2) they aren't immediately adopted by another node (DnD)
			this._setChildItemsHandle = this.defer(function(){
				rias.forEach(oldChildren, function(node){
					if(!node._destroyed && !node.getParent()){
						// If node is in selection then remove it.
						if(tree._dndController.removeTreeNode){
							tree._dndController.removeTreeNode(node);
						}

						remove(node);

						// Remove any entries involving this node from persist tracking expanded nodes
						var destroyedPath = rias.map(node.getTreePath(), function(item){
							return tree.model.getIdentity(item);
						}).join("/");
						for(var path in tree._openedNodes){
							if(path.substr(0, destroyedPath.length) === destroyedPath){
								delete tree._openedNodes[path];
							}
						}

						// And finally we can destroy the node
						node.destroyRecursive();
					}
				});

				// If we've orphaned the focused node then move focus to the root node
				//if(tree.lastFocusedChild && !rias.dom.isDescendant(tree.lastFocusedChild.domNode, tree.domNode)){
				//	delete tree.lastFocusedChild;
				//}
				//if(focusedChild && !rias.dom.isDescendant(focusedChild.domNode, tree.domNode)){
				//	tree.focus();	// could alternately focus this node (parent of the deleted node)
				//}

				///这里不应该 save paths
				//tree.setPersist_opened();
			});

			this.state = "Loaded";

			if(items && items.length > 0){
				this.isExpandable = true;

				// Create TreeNode widget for each specified tree node, unless one already
				// exists and isn't being used (presumably it's from a DnD move and was recently
				// released
				rias.forEach(items, function(item){    // MARKER: REUSE NODE
					var id = model.getIdentity(item),
						existingNodes = tree._itemNodesMap[id],
						node;
					if(existingNodes){
						for(var i = 0; i < existingNodes.length; i++){
							if(existingNodes[i] && !existingNodes[i].getParent()){
								node = existingNodes[i];
								node.set('indent', this.indent + 1);
								break;
							}
						}
					}
					if(!node){
						node = this.tree._createTreeNode({
							ownerRiasw: this,
							//_riaswIdInModule: this.tree._riaswIdInModule ? this.tree._riaswIdInModule + "_" + id.replace(/\./g, "_") : undefined,
							//_riaswAttachPoint: id.replace(/\./g, "_"),
							item: item,
							tree: tree,
							isExpandable: model.mayHaveChildren(item),
							label: tree.getLabel(item),
							labelType: (tree.model && tree.model.labelType) || "text",
							tooltip: tree.getTooltip(item),
							ownerDocument: tree.ownerDocument,
							dir: tree.dir,
							lang: tree.lang,
							textDir: tree.textDir,
							indent: this.indent + 1
						});
						if(existingNodes){
							existingNodes.push(node);
						}else{
							tree._itemNodesMap[id] = [node];
						}
					}
					this.addChild(node);

					// If node was previously opened then open it again now (this may trigger
					// more data store accesses, recursively)
					if(this.tree.autoExpand || this.tree._nodeState(node)){
						defs.push(tree._expandNode(node));
					}
				}, this);

				// note that updateLayout() needs to be called on each child after
				// _all_ the children exist
				rias.forEach(this.getChildren(), function(child){
					child._updateRootLast();
				});
			}else{
				this.isExpandable = false;
			}

			if(this._setExpando){
				// change expando to/from dot or + icon, as appropriate
				this._setExpando(false);
			}

			// Set leaf icon or folder icon, as appropriate
			this._updateItemClasses(this.item);

			var def = rias.all(defs);
			this.tree._startPaint(def);		// to reset TreeNode widths after an item is added/removed from the Tree
			return def;		// dojo/promise/Promise
		},

		getTreePath: function(){
			var node = this;
			var path = [];
			while(node && node !== this.tree.rootNode){
				path.unshift(node.item);
				node = node.getParent();
			}
			if(this.tree.rootNode){
				path.unshift(this.tree.rootNode.item);
			}

			return path;
		},

		getIdentity: function(){
			return this.tree.model.getIdentity(this.item);
		},

		removeChild: function(/* treeNode */ node){
			if(node && node === this.tree.focusedChild){
				this.tree.set("focusedChild", undefined);
			}
			this.inherited(arguments);

			if(!this.tree.isDestroyed(true) && !this.isDestroyed(true)){///避免 collapse
				var children = this.getChildren();
				if(children.length === 0){
					this.isExpandable = false;
					this.collapse();
				}

				rias.forEach(children, function(child){
					child._updateRootLast();
				});
			}
		},

		setSelected: function(/*Boolean*/ selected){
			// summary:
			//		A Tree has a (single) currently selected node.
			//		Mark that this node is/isn't that currently selected node.
			// description:
			//		In particular, setting a node as selected involves setting tabIndex
			//		so that when user tabs to the tree, focus will go to that node (only).
			selected = this._selected = !!selected;
			if(!this.isDestroyed()){
				rias.dom.setAttr(this.selectNode, "checked", selected);
				rias.dom.setAttr(this.selectNode, "aria-checked", selected ? "true" : "false");
				this.labelNode.setAttribute("aria-selected", selected ? "true" : "false");
				rias.dom.toggleClass(this.rowNode, "riaswTreeRowSelected", selected);
				if(this.selectNodeIcon){
					rias.dom.removeClass(this.selectNodeIcon, "riaswCheckBoxChecked");
					rias.dom.removeClass(this.selectNodeIcon, "riaswRadioBoxChecked");
					if(selected){
						rias.dom.addClass(this.selectNodeIcon, this.get("selectionMode") === "multiple" ? "riaswCheckBoxChecked" : "riaswRadioBoxChecked");
					}
				}
				if(selected){
					if(!this.tree.focusedChild){
						this.tree.set("focusedChild", this);
					}
					//}else{
					//	if(this.tree.focusedChild === this){///还是不改变设置好些
					//		this.tree.set("focusedChild", undefined);
					//	}
				}
			}
		},

		focus: function(){
			rias.dom.focus(this.focusNode);
		},
		_onToggleMouseEnter: function(e){
			var self = this,
				tree = self.tree;
			if(tree && (tree.expandOnEnter || tree.collapseOnEnter) && !self._autoToggleDelay && tree.model.mayHaveChildren(self.item)){
				if((!self._loadDeferred || self._loadDeferred.isFulfilled())
					&& (!self._expandDeferred || self._expandDeferred.isFulfilled())
					&& (!self._collapseDeferred || self._collapseDeferred.isFulfilled())){
					self._autoToggleDelay = self.defer(function(){
						if(self._autoToggleDelay){
							self._autoToggleDelay.remove();
							self._autoToggleDelay = undefined;
						}
						if(self.isExpanded){
							if(tree.collapseOnEnter){
								tree._collapseNode(self);
							}
						}else{
							if(tree.expandOnEnter){
								tree._expandNode(self);
							}
						}
					}, rias.autoToggleDuration);
				}
			}
		},
		_onToggleMouseLeave: function(e){
			if(this._autoToggleDelay){
				this._autoToggleDelay.remove();
				this._autoToggleDelay = undefined;
			}
		}

	});
	if(rias.has("riasw-bidi")){
		Widget.extend({
			_onSetTextDir: function(textDir){
				this.inherited(arguments);
				rias.forEach(this.getChildren(), function(childNode){
					childNode.set("textDir", textDir);
				}, this);
			}
		});
	}

	return Widget;

});