//RIAStudio client runtime widget - Tree

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_KeyNavContainer",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/_CssStateMixin",
	"riasw/tree/TreeNode",
	"riasw/tree/TreeModel",
	"riasw/tree/_dndSelector",
	"riasw/tree/dndSource"
], function(rias, _WidgetBase, _KeyNavContainer, _TemplatedMixin, _CssStateMixin, TreeNode, TreeModel, _dndSelector, dndSource) {

	//rias.theme.loadThemeCss([
	//	"riasw/tree/Tree.css"
	//]);

	var riaswType = "riasw.tree.Tree";
	var Widget = rias.declare(riaswType, [_WidgetBase, _KeyNavContainer, _TemplatedMixin, _CssStateMixin], {
		// summary:
		//		This widget displays hierarchical data from a store.

		templateString:
			'<div role="tree">'+
				'<div class="dijitInline riaswTreeIndent" style="position: absolute; top: -9999px" data-dojo-attach-point="indentDetector"></div>'+
				'<div class="riaswTreeExpando riaswTreeExpandoLoading" data-dojo-attach-point="rootLoadingIndicator"></div>'+
				'<div data-dojo-attach-point="containerNode" class="riaswTreeContainer" role="presentation"></div>'+
			'</div>',

		baseClass: "riaswTree",

		// model: [const] riasw/tree/model
		//		Interface to read tree data, get notifications of changes to tree data,
		//		and for handling drop operations (i.e drag and drop onto the tree)
		model: null,
		// query: [deprecated] anything
		//		Deprecated.  User should specify query to the model directly instead.
		//		Specifies datastore query to return the root item or top items for the tree.
		query: null,

		// label: [deprecated] String
		//		Deprecated.  Use riasw/tree/Model directly instead.
		//		Used in conjunction with query parameter.
		//		If a query is specified (rather than a root node id), and a label is also specified,
		//		then a fake root node is created and displayed, with this label.
		label: "",

		rootItems: null,
		// showRoot: [const] Boolean
		//		Should the root node be displayed, or hidden?
		showRoot: true,
		// childrenAttr: [deprecated] String[]
		//		Deprecated.   This information should be specified in the model.
		//		One ore more attributes that holds children of a tree node
		childrenAttr: ["children"],
		// Implement _KeyNavContainer.childSelector, to identify which nodes are navigable
		childSelector: ".riaswTreeRow",

		// paths: String[][] or Item[][]
		//		Full paths from rootNode to selected nodes expressed as array of items or array of ids.
		//		Since setting the paths may be asynchronous (because of waiting on dojo.data), set("paths", ...)
		//		returns a Promise to indicate when the set is complete.
		paths: [],
		// path: String[] or Item[]
		//		Backward compatible singular variant of paths.
		//path: [],
		// selectedItems: [readonly] Item[]
		//		The currently selected items in this tree.
		//		This property can only be set (via set('selectedItems', ...)) when that item is already
		//		visible in the tree.   (I.e. the tree has already been expanded to show that node.)
		//		Should generally use `paths` attribute to set the selected items instead.
		selectedItems: null,
		// selectedItem: [readonly] Item
		//		Backward compatible singular variant of selectedItems.
		//selectedItem: null,
		selectedNodes: null,

		autoFocusWhenSelectNode: true,
		selectionMode: "none",
		noDnd: false,
		// dndCtor: [protected] Function|String
		//		Class to use as as the dnd controller.  Specifying this class enables DnD.
		//		Generally you should specify this as riasw/tree/dndSource.
		//		Setting of riasw/tree/_dndSelector handles selection only (no actual DnD).
		dndCtor: dndSource,

		// _nodePixelIndent: Integer
		//		Number of pixels to indent tree nodes (relative to parent node).
		//		Default is 19 but can be overridden by setting CSS class riaswTreeIndent
		//		and calling resize() or startup() on tree after it's in the DOM.
		_nodePixelIndent: 19,

		loadRootOnStartup: true,

		// autoExpand: Boolean
		//		Fully expand the tree on load.   Overrides `persist`.
		autoExpand: false,
		// openOnClick: Boolean
		//		If true, clicking a folder node's label will open it, rather than calling onClick()
		openOnClick: true,
		// openOnDblClick: Boolean
		//		If true, double-clicking a folder node's label will open it, rather than calling onDblClick()
		openOnDblClick: false,
		expandOnClick: true,
		collapseOnClick: false,
		expandOnEnter: false,
		collapseOnEnter: false,

		_publish: function(/*String*/ topicName, /*Object*/ message){
			// summary:
			//		Publish a message for this widget/topic
			rias.publish(this.id, rias.mixin({
				tree: this,
				event: topicName
			}, message || {}));	// publish
		},

		postMixInProperties: function(){
			//if(this.autoExpand){
				// There's little point in saving opened/closed state of nodes for a Tree
				// that initially opens all it's nodes.
			//	this.persist = false;
			//}

			this.inherited(arguments);

			this._itemNodesMap = {};
			this.selectedItems = [];
			this.selectedNodes = [];

			// 废弃
			//if(!this.cookieName && this.id){
			//	this.cookieName = this.id + "SaveStateCookie";
			//}

			if(this.noDnd){
				this.dndCtor = _dndSelector;
			}
			this.dndParams = rias.mixin({
				//declare the above items so they can be pulled from the tree's markup
				/*=====
				 itemCreator: function(nodes, target, source){
				 // summary:
				 //		Returns objects passed to `Tree.model.newItem()` based on DnD nodes
				 //		dropped onto the tree.   Developer must override this method to enable
				 //		dropping from external sources onto this Tree, unless the Tree.model's items
				 //		happen to look like {id: 123, name: "Apple" } with no other attributes.
				 //
				 //		For each node in nodes[], which came from source, create a hash of name/value
				 //		pairs to be passed to Tree.model.newItem().  Returns array of those hashes.
				 // nodes: DomNode[]
				 //		The DOMNodes dragged from the source container
				 // target: DomNode
				 //		The target TreeNode.rowNode
				 // source: dojo/dnd/Source
				 //		The source container the nodes were dragged from, perhaps another Tree or a plain dojo/dnd/Source
				 // returns: Object[]
				 //		Array of name/value hashes for each new item to be added to the Tree, like:
				 // |	[
				 // |		{ id: 123, label: "apple", foo: "bar" },
				 // |		{ id: 456, label: "pear", zaz: "bam" }
				 // |	]
				 // tags:
				 //		extension
				 return [{}];
				 },
				 =====*/
				//itemCreator: null,
				isSource: false,
				accept: [],
				copyOnly: false,
				singular: true,
				// onDndDrop: [protected] Function
				//		Parameter to _dndController, see `riasw/tree/dndSource.onDndDrop()`.
				//		Generally this doesn't need to be set.
				//onDndDrop: null,
				// onDndCancel: [protected] Function
				//		Parameter to _dndController, see `riasw/tree/dndSource.onDndCancel()`.
				//		Generally this doesn't need to be set.
				//onDndCancel: null,
				/*=====
				 checkAcceptance: function(source, nodes){
				 // summary:
				 //		Checks if the Tree itself can accept nodes from this source
				 // source: riasw/tree/dndSource
				 //		The source which provides items
				 // nodes: DOMNode[]
				 //		Array of DOM nodes corresponding to nodes being dropped, riaswTreeRow nodes if
				 //		source is a riasw/tree/Tree.
				 // tags:
				 //		extension
				 return true;	// Boolean
				 },
				 =====*/
				//checkAcceptance: null,
				/*=====
				 checkItemAcceptance: function(target, source, position){
				 // summary:
				 //		Stub function to be overridden if one wants to check for the ability to drop at the node/item level
				 // description:
				 //		In the base case, this is called to check if target can become a child of source.
				 //		When betweenThreshold is set, position="before" or "after" means that we
				 //		are asking if the source node can be dropped before/after the target node.
				 // target: DOMNode
				 //		The riaswTreeRoot DOM node inside of the TreeNode that we are dropping on to
				 //		Use rias.by(target) or rias.rt.getEnclosingWidget(target) to get the TreeNode.
				 // source: riasw/tree/dndSource
				 //		The (set of) nodes we are dropping
				 // position: String
				 //		"over", "before", or "after"
				 // tags:
				 //		extension
				 return true;	// Boolean
				 },
				 =====*/
				//checkItemAcceptance: null,
				// dragThreshold: Integer
				//		Number of pixels mouse moves before it's considered the start of a drag operation
				dragThreshold: 8,
				// betweenThreshold: Integer
				//		Set to a positive value to allow drag and drop "between" nodes.
				//
				//		If during DnD mouse is over a (target) node but less than betweenThreshold
				//		pixels from the bottom edge, dropping the the dragged node will make it
				//		the next sibling of the target node, rather than the child.
				//
				//		Similarly, if mouse is over a target node but less that betweenThreshold
				//		pixels from the top edge, dropping the dragged node will make it
				//		the target node's previous sibling rather than the target node's child.
				betweenThreshold: 5
			}, this.dndParams);
		},
		postCreate: function(){
			this._openedNodes = {};

			// Catch events on TreeNodes
			var self = this;
			this.own(
				rias.on(this.containerNode, rias.on.selector(".riaswTreeNode", rias.touch.enter), function(evt){
					self._onNodeMouseEnter(rias.by(this), evt);
				}),
				rias.on(this.containerNode, rias.on.selector(".riaswTreeNode", rias.touch.leave), function(evt){
					self._onNodeMouseLeave(rias.by(this), evt);
				}),
				rias.on(this.containerNode, rias.on.selector(".riaswTreeRow", rias.a11yclick.press), function(evt){
					self._onNodePress(rias.by(this), evt);
				}),
				rias.on(this.containerNode, rias.on.selector(".riaswTreeRow", rias.a11yclick.click), function(evt){
					self._onClick(rias.by(this), evt);
				}),
				rias.on(this.containerNode, rias.on.selector(".riaswTreeRow", "dblclick"), function(evt){
					self._onDblClick(rias.by(this), evt);
				})
			);

			// monitor changes to items
			this.after(this.model, "onChange", rias.hitch(this, "_onItemChange"), true);
			this.after(this.model, "onChildrenChange", rias.hitch(this, "_onItemChildrenChange"), true);
			this.after(this.model, "onDelete", rias.hitch(this, "_onItemDelete"), true);

			this.inherited(arguments);

			this._dndController = new this.dndCtor(this, this.dndParams);
			this._dndController.singular = this.selectionMode !== "multiple";
			if(this.loadRootOnStartup){
				this.load();
			}
		},
		_onDestroy: function(){
			this.clear();

			if(this._adjustWidthsTimer){
				this._adjustWidthsTimer.remove();
				delete this._adjustWidthsTimer;
			}
			if(this._dndController){
				rias.destroy(this._dndController);
				this._dndController = undefined;
			}
			this.rootNode = null;
			this.inherited(arguments);
		},
		//destroyRecursive: function(){
		//	// A tree is treated as a leaf, not as a node with children (like a grid),
		//	// but defining destroyRecursive for back-compat.
		//	//this.destroy();
		//	this.inherited(arguments);
		//},

		_setModelAttr: function(value){
			if(rias.isRiaswParam(value)){
				if(!value.ownerRiasw){
					value.ownerRiasw = this;
				}
				value = rias.newRiasw(value);
			}
			if(rias.is(value, TreeModel)){
				if(this.rootItems){
					value.queryRoot = this.rootItems.query;
					value.additionItems = this.rootItems.items;
				}
				if(!value.getOwnerRiasw()){
					value.setOwnerRiasw(this);
				}
			}else{
				value = undefined;
			}
			this._set("model", value);
		},

		_loadPersist: function(args){
			this.inherited(arguments);
			var p = this.getPersist("opened");
			if(p){
				rias.forEach(p.split(','), function(item){
					this._openedNodes[item] = true;
				}, this);
			}
			///不要用 set，以至 deferred
			//this.set("paths", this.getPersist("paths"));
			this.paths = this.getPersist("paths");
		},
		setPersist_opened: function(){
			var ary = [];
			for(var id in this._openedNodes){
				ary.push(id);
			}
			this.setPersist("opened", ary.join(","));
		},
		//setPersist_paths: function(){
		//	this.setPersist("paths", this.get("paths"));
		//},
		_savePersist: function(args){
			var ary = [];
			for(var id in this._openedNodes){
				ary.push(id);
			}
			this.setPersist({
				paths: this.get("paths"),
				opened: ary.join(",")
			});
			this.inherited(arguments);
		},

		_createTreeNode: function(/*Object*/ args){
			// summary:
			//		creates a TreeNode
			// description:
			//		Developers can override this method to define their own TreeNode class;
			//		However it will probably be removed in a future release in favor of a way
			//		of just specifying a widget for the label, rather than one that contains
			//		the children too.
			args.disabled = args.disabled || args.item.disabled;
			args.selectionMode = this.selectionMode;

			return new (this.nodeRender || TreeNode)(args);
		},
		clear: function(){
			var self = this,
				d = rias.newDeferred(),
				m = self.model;
			self.loaded = false;
			/// setSelection 会设置 paths、selectedNodes、selectedItems，并 savePersist，不建议 clear
			//if(self._dndController && self._dndController.setSelection){
			//	self._dndController.setSelection([]);
			//}
			if(m.store){
				m.store.revert();
			}
			if(m.root){
				m.root.children = [];
				m.root.size = 0;
			}

			if(self._curSearch){
				self._curSearch.timer.remove();
				self._curSearch = undefined;
			}
			if(this.expandChildrenDeferred){
				this.expandChildrenDeferred.cancel("clear cancel - " + this.id);
				this.expandChildrenDeferred = undefined;
			}

			if(self.rootNode){
				self.rootNode.destroy();
				self.rootNode = null;
				self._itemNodesMap = {};
				d.resolve(self.rootNode);
			}else{
				d.resolve(self.rootNode);
			}
			return d.promise;
		},
		onLoad: function(){
			// summary:
			//		Called when tree finishes loading and expanding.
			// description:
			//		If persist == true the loading may encompass many levels of fetches
			//		from the data store, each asynchronous.   Waits for all to finish.
			// tags:
			//		callback
		},
		load: function(paths){
			var self = this,
				d = rias.newDeferred("riasw.tree.Tree.load", rias.defaultDeferredTimeout, function(){
					this.cancel();
				});

			function _doLoad(){
				self.expandChildrenDeferred = rias.newDeferred();
				// Promise that resolves when all pending operations complete.
				self.expandChildrenDeferred.then(function(){
					self.loaded = true;
					self.loading = false;
					self.set("paths", paths).then(function(newNodes){
						self.loadPathsError = false;
						self.onLoad();
						d.resolve(newNodes);
					}, function(e){
						self.loadPathsError = true;
						console.warn(self.id, e);
						d.resolve(e);
					});
				}, function(e){
					self.loaded = false;
					d.reject(e);
				});

				self.model.store.whenInited(function(result){
					if(result != false){
						self.model.getRoot(
							function(item){
								var rn = (self.rootNode = self._createTreeNode({
									ownerRiasw: self,
									_riaswIdInModule: self._riaswIdInModule ? self._riaswIdInModule + "_" + "$root$" : undefined,
									_riaswAttachPoint: "$root$",
									item: item,
									tree: self,
									isExpandable: true,
									label: self.label || self.getLabel(item),
									labelType: self.model.labelType || "text",
									textDir: self.textDir,
									indent: self.showRoot ? 0 : -1
								}));

								if(!self.showRoot){
									rn.rowNode.style.display = "none";
									// if root is not visible, move tree role to the invisible
									// root node's containerNode, see #12135
									self.domNode.setAttribute("role", "presentation");
									self.domNode.removeAttribute("aria-expanded");
									self.domNode.removeAttribute("aria-multiselectable");

									// move the aria-label or aria-labelledby to the element with the role
									if(self["aria-label"]){
										rn.containerNode.setAttribute("aria-label", self["aria-label"]);
										self.domNode.removeAttribute("aria-label");
									}else if(self["aria-labelledby"]){
										rn.containerNode.setAttribute("aria-labelledby", self["aria-labelledby"]);
										self.domNode.removeAttribute("aria-labelledby");
									}
									rn.labelNode.setAttribute("role", "presentation");
									rn.labelNode.removeAttribute("aria-selected");
									rn.containerNode.setAttribute("role", "tree");
									rn.containerNode.setAttribute("aria-expanded", "true");
									rn.containerNode.setAttribute("aria-multiselectable", !self._dndController.singular);
								}else{
									self.domNode.setAttribute("aria-multiselectable", !self._dndController.singular);
									self.rootLoadingIndicator.style.display = "none";
								}

								//self.containerNode.appendChild(rn.domNode);
								self.addChild(rn);

								var identity = self.model.getIdentity(item);
								if(self._itemNodesMap[identity]){
									self._itemNodesMap[identity].push(rn);
								}else{
									self._itemNodesMap[identity] = [rn];
								}

								rn._updateRootLast();		// sets "riaswTreeNodeIsRoot" CSS classname

								// Load top level children, and if persist==true, all nodes that were previously opened
								self._expandNode(rn).then(function(){
									// Then, select the nodes specified by params.paths[], assuming Tree hasn't been deleted.
									if(!self._destroyed){
										self.rootLoadingIndicator.style.display = "none";
										if(self.expandChildrenDeferred){
											self.expandChildrenDeferred.resolve(true);
										}
									}
								});
							},
							function(err){
								console.error(self, ": error loading root: ", err);
							}
						);
					}
				});
			}

			self.loaded = false;
			self.loading = true;
			self.loadPathsError = false;
			this.loadPersist();
			paths = (paths == undefined ? this.get("paths") : rias.isArray(paths) ? paths : [paths]);
			paths = rias.map(paths, function(path){
				return rias.map(path, function(item){
					return item && rias.isObject(item) ? self.model.getIdentity(item) : item;
				});
			});
			if(self.rootNode){
				self.clear().then(_doLoad);
			}else{
				_doLoad();
			}
			return d.promise;
		},
		refresh: function(paths){
			return this.load.apply(this, arguments);
		},

		// Functions for converting an item to a TreeNode
		onGetLabel: function(/*dojo/data/Item*/ item){
			// summary:
			//		Overridable function to get the label for a tree node (given the item)
			// tags:
			//		extension
			return this.model.getLabel(item);	// String
		},
		getLabel: function(/*dojo/data/Item*/ item){
			return this.onGetLabel(item);
		},
		getIconClass: function(item, opened){
			if(item.iconClass){
				if(rias.isArray(item.iconClass)){
					return item.iconClass.join(" ");
				}else if(rias.isString(item.iconClass)){
					return item.iconClass;
				}
			}
			return (!item || (item.itemType === "folder") || !this.model || this.model.mayHaveChildren(item)) ? (opened ? "openedFolderIcon" : "closedFolderIcon") : "fileIcon";
		},
		getLabelClass: function(/*===== item, opened =====*/){
			// summary:
			//		Overridable function to return CSS class name to display label
			// item: dojo/data/Item
			// opened: Boolean
			// returns: String
			//		CSS class name
			// tags:
			//		extension
		},
		getRowClass: function(/*===== item, opened =====*/){
			// summary:
			//		Overridable function to return CSS class name to display row
			// item: dojo/data/Item
			// opened: Boolean
			// returns: String
			//		CSS class name
			// tags:
			//		extension
		},
		getIconStyle: function(/*===== item, opened =====*/){
			// summary:
			//		Overridable function to return CSS styles to display icon
			// item: dojo/data/Item
			// opened: Boolean
			// returns: Object
			//		Object suitable for input to dojo.style() like {backgroundImage: "url(...)"}
			// tags:
			//		extension
		},
		getLabelStyle: function(/*===== item, opened =====*/){
			// summary:
			//		Overridable function to return CSS styles to display label
			// item: dojo/data/Item
			// opened: Boolean
			// returns:
			//		Object suitable for input to dojo.style() like {color: "red", background: "green"}
			// tags:
			//		extension
		},
		getRowStyle: function(/*===== item, opened =====*/){
			// summary:
			//		Overridable function to return CSS styles to display row
			// item: dojo/data/Item
			// opened: Boolean
			// returns:
			//		Object suitable for input to dojo.style() like {background-color: "#bbb"}
			// tags:
			//		extension
		},
		getTooltip: function(/*dojo/data/Item*/ /*===== item =====*/){
			// summary:
			//		Overridable function to get the tooltip for a tree node (given the item)
			// tags:
			//		extension
			return "";	// String
		},

		isSelectNode: function(node, widget){
			return rias.dom.isDescendant(node, widget.selectNodeIcon || widget.selectNode);
		},
		isExpandoNode: function(node, widget){
			// summary:
			//		check whether a dom node is the expandoNode for a particular TreeNode widget
			return rias.dom.isDescendant(node, widget.expandoNode) || rias.dom.isDescendant(node, widget.expandoNodeText);
		},

		// These just get passed to the model; they are here for back-compat
		mayHaveChildren: function(/*dojo/data/Item*/ /*===== item =====*/){
			// summary:
			//		Deprecated.   This should be specified on the model itself.
			//
			//		Overridable function to tell if an item has or may have children.
			//		Controls whether or not +/- expando icon is shown.
			//		(For efficiency reasons we may not want to check if an element actually
			//		has children until user clicks the expando node)
			// tags:
			//		deprecated
		},
		getItemChildren: function(/*===== parentItem, onComplete =====*/){
			// summary:
			//		Deprecated.   This should be specified on the model itself.
			//
			//		Overridable function that return array of child items of given parent item,
			//		or if parentItem==null then return top items in tree
			// tags:
			//		deprecated
		},
		getNodesByItem: function(/*Item or id*/ item){
			// summary:
			//		Returns all tree nodes that refer to an item
			// returns:
			//		Array of tree nodes that refer to passed item

			if(!item){
				return [];
			}
			var identity = rias.isString(item) ? item : this.model.getIdentity(item);
			// return a copy so widget don't get messed up by changes to returned array
			return [].concat(this._itemNodesMap[identity]);
		},

		_setSelectionModeAttr: function(value){
			switch (value) {
				case "single":
				case "radio":
					value = "single";
					break;
				case "multiple":
				case "extended":
				case "checkbox":
					value = "multiple";
					break;
				default:
					value = "none";
			}
			if(this._dndController){
				this._dndController.singular = value !== "multiple";
			}
			this._set("selectionMode", value);
			if(this.loaded){
				this.load();
			}
		},
		_setSelectedNodeAttr: function(node){
			this.set('selectedNodes', [node]);
		},
		_setSelectedNodesAttr: function(nodes){
			// summary:
			//		Marks the specified TreeNodes as selected.
			// nodes: TreeNode[]
			//		TreeNodes to mark.
			if(this._dndController && this._dndController.setSelection){
				this._dndController.setSelection(nodes);
			}else{
				this.selectedNodes = nodes;
			}
		},
		_setSelectedItemAttr: function(/*Item or id*/ item){
			this.set('selectedItems', [item]);
		},
		_setSelectedItemsAttr: function(/*Items or ids*/ items){
			// summary:
			//		Select tree nodes related to passed items.
			//		WARNING: if model use multi-parented items or desired tree node isn't already loaded
			//		behavior is undefined. Use set('paths', ...) instead.
			var tree = this;
			function _do(){
				var identities = rias.map(items, function(item){
					return (!item || rias.isString(item)) ? item : tree.model.getIdentity(item);
				});
				var nodes = [];
				rias.forEach(identities, function(id){
					nodes = nodes.concat(tree._itemNodesMap[id] || []);
				});
				tree.set('selectedNodes', nodes);
			}
			if(!tree.expandChildrenDeferred){
				return _do();
			}
			return (tree.expandChildrenDeferred.promise.always(function(){
				_do();
			}));
		},
		_getPathsAttr: function(){
			var self = this;
			return rias.map(self.paths, function(path){
				return rias.map(path, function(item){
					return item && rias.isObject(item) ? self.model.getIdentity(item) : item;
				});
			});
		},
		_setPathsAttr: function(/*Item[][]|String[][]*/ paths){
			// summary:
			//		Select the tree nodes identified by passed paths.
			// paths:
			//		Array of arrays of items or item id's
			// returns:
			//		Promise to indicate when the set is complete

			var self = this;
			function selectPath(path, nodes){
				// Traverse path, returning Promise for node at the end of the path.
				// The next path component should be among "nodes".
				var nextPath = path.shift();
				var nextNode = rias.filter(nodes, function(node){
					return node.getIdentity() === nextPath;
				})[0];
				if(!!nextNode){
					if(path.length){
						return self._expandNode(nextNode).then(function(){
							return selectPath(path, nextNode.getChildren());
						});
					}else{
						// Successfully reached the end of this path
						return nextNode;
					}
				}else{
					throw new Widget.PathError("Could not expand path at " + nextPath);
				}
			}

			if(this.expandChildrenDeferred){
				return this.expandChildrenDeferred.promise.always(function(){
					// We may need to wait for some nodes to expand, so setting
					// each path will involve a Deferred. We bring those deferreds
					// together with a dojo/promise/all.
					return rias.all(rias.map(paths, function(path){
						// normalize path to use identity
						path = rias.map(path, function(item){
							return item && rias.isObject(item) ? self.model.getIdentity(item) : item;
						});

						if(path.length){
							return selectPath(path, [self.rootNode]);
						}else{
							throw new Widget.PathError("Empty path");
						}
					}));
				}).then(function(newNodes){
						// After all expansion is finished, set the selection to last element from each path
						self.set("selectedNodes", newNodes);///包含 _set("paths")
						return self.paths;
					});
			}
			return rias.when(self.paths);
		},
		onSelectItems: function(items, nodes){},

		_nodeState: function(node, expanded){
			// summary:
			//		Query or set expanded state for an node
			var path = rias.map(node.getTreePath(), function(item){
				return this.model.getIdentity(item);
			}, this).join("/");
			if(arguments.length === 1){
				return !!this._openedNodes[path];
			}else{
				var save = !!this._openedNodes[path] !== expanded;
				if(expanded){
					this._openedNodes[path] = true;
				}else{
					delete this._openedNodes[path];
				}
				if(save){
					///这里不应该 save paths
					this.setPersist_opened();
				}
			}
		},
		_collapseNode: function(/*TreeNode*/ node){
			// summary:
			//		Called when the user has requested to collapse the node
			// returns:
			//		Promise that resolves when the node has finished closing

			if(node._expandNodeDeferred){
				delete node._expandNodeDeferred;
			}

			if(node.state === "Loading"){
				// ignore clicks while we are in the process of loading data
				return;
			}

			if(node.isExpanded){
				var ret = node.collapse();

				this.onCloseNode(node.item, node);
				this._nodeState(node, false);

				this._startPaint(ret);	// after this finishes, need to reset widths of TreeNodes

				return ret;
			}
		},
		_expandNode: function(/*TreeNode*/ node){
			var self= this;
			if(node._expandNodeDeferred){
				// there's already an expand in progress, or completed, so just return
				return node._expandNodeDeferred;	// dojo/_base/Deferred
			}
			var model = this.model,
				item = node.item;
			// Load data if it's not already loaded
			if(!node._loadDeferred){
				// need to load all the children before expanding
				node.markProcessing();
				// Setup deferred to signal when the load and expand are finished.
				// Save that deferred in this._expandDeferred as a flag that operation is in progress.
				node._loadDeferred = rias.newDeferred();

				//Lazy Get the children
				model.getChildren(
					item,
					function(items){
						node.unmarkProcessing();

						// Display the children and also start expanding any children that were previously expanded
						// (if this.persist == true).   The returned Deferred will fire when those expansions finish.
						node.setChildItems(items).then(function(){
							node._loadDeferred.resolve(items);
						});
					},
					function(err){
						console.error(self, ": error loading " + node.label + " children: ", err);
						if(!node.isDestroyed()){
							node._loadDeferred.reject(err);
						}
					},
					{
						start: 0,
						parentId: model.getIdentity(item)
					}
				);
			}

			// Expand the node after data has loaded
			var def = node._loadDeferred.then(function(){
				// seems like these should be inside of then(), but left here for back-compat about
				// when this.isOpen flag gets set (ie, at the beginning of the animation)
				var d = node.expand();
				self.onOpenNode(node.item, node);
				self._nodeState(node, true);
				return d;
			});

			self._startPaint(def);	// after this finishes, need to reset widths of TreeNodes

			return def;	// dojo/_base/Deferred
		},
		collapseNode: function(/*TreeNode*/ node){
			this._collapseNode(node);
		},
		expandNode: function(/*TreeNode*/ node){
			this._expandNode(node);
		},
		expandAll: function(){
			// summary:
			//		Expand all nodes in the tree
			// returns:
			//		Promise that resolves when all nodes have expanded
			var self = this;
			function expand(node){
				// Expand the node
				if(!node){
					return true;
				}
				return self._expandNode(node).then(function(){
					// When node has expanded, call expand() recursively on each non-leaf child
					var childBranches = rias.filter(node.getChildren() || [], function(node){
						return node.isExpandable;
					});

					// And when all those recursive calls finish, signal that I'm finished
					return rias.all(rias.map(childBranches, expand));
				});
			}
			return expand(this.rootNode);
		},
		collapseAll: function(){
			// summary:
			//		Collapse all nodes in the tree
			// returns:
			//		Promise that resolves when all nodes have collapsed
			var self = this;
			function collapse(node){
				// Collapse children first
				var childBranches = rias.filter(node.getChildren() || [], function(node){
						return node.isExpandable;
					}),
					defs = rias.all(rias.map(childBranches, collapse));

				// And when all those recursive calls finish, collapse myself, unless I'm the invisible root node,
				// in which case collapseAll() is finished
				if(!node || !node.isExpanded || (node === self.rootNode && !self.showRoot)){
					return defs;
				}else{
					// When node has collapsed, signal that call is finished
					return defs.then(function(){
						return self._collapseNode(node);
					});
				}
			}
			return collapse(this.rootNode);
		},

		_adjustWidths: function(){
			// summary:
			//		Size container to match widest TreeNode, so that highlighting with scrolling works (#13141, #16132)

			if(this._adjustWidthsTimer){
				this._adjustWidthsTimer.remove();
				delete this._adjustWidthsTimer;
			}

			this.containerNode.style.width = "auto";
			this.containerNode.style.width = this.domNode.scrollWidth > this.domNode.offsetWidth ? "auto" : "100%";
		},
		_outstandingPaintOperations: 0,
		_startPaint: function(/*Promise|Boolean*/ p){
			// summary:
			//		Called at the start of an operation that will change what's displayed.
			// p:
			//		Promise that tells when the operation will complete.  Alternately, if it's just a Boolean, it signifies
			//		that the operation was synchronous, and already completed.

			this._outstandingPaintOperations++;
			if(this._adjustWidthsTimer){
				this._adjustWidthsTimer.remove();
				delete this._adjustWidthsTimer;
			}

			var self = this,
				oc = function(){
					self._outstandingPaintOperations--;

					if(self._outstandingPaintOperations <= 0 && !self._adjustWidthsTimer && self._started){
						// Use defer() to avoid a width adjustment when another operation will immediately follow,
						// such as a sequence of opening a node, then it's children, then it's grandchildren, etc.
						self._adjustWidthsTimer = self.defer("_adjustWidths");
					}
				};
			rias.when(p, oc, oc);
		},
		_resize: function(box){
			/// 不需要 inherited 的 child.resize
			if(box){
				rias.dom.setMarginBox(this.domNode, box);
			}
			this._nodePixelIndent = rias.dom.getPosition(this.indentDetector).w || this._nodePixelIndent;

			// resize() may be called before this.rootNode is created, so wait until it's available
			var self = this;
			if(this.expandChildrenDeferred){
				this.expandChildrenDeferred.then(function(){
					// If tree has already loaded, then reset indent for all the nodes
					if(self.rootNode){
						self.rootNode.set('indent', self.showRoot ? 0 : -1);
					}

					// Also, adjust widths of all rows to match width of Tree
					self._adjustWidths();
				});
			}
			rias.forEach(this.getChildren(), function(child){
				if(child.resize){
					child.resize();
				}
			}, this);
			return box;
		},
		resize: function(changeSize){
			this.inherited(arguments);
		},

		/////////// Keyboard and Mouse handlers ////////////////////
		_onDownArrow: function(/*Event*/ evt, /*TreeNode*/ node){
			// summary:
			//		down arrow pressed; get next visible node, set focus there

			var nextNode = this._getNextChild(node);
			if(nextNode && nextNode.isTreeNode){
				this.focusNode(nextNode);
			}
		},
		_onUpArrow: function(/*Event*/ evt, /*TreeNode*/ node){
			// summary:
			//		Up arrow pressed; move to previous visible node

			// if younger siblings
			var previousSibling = node.getPreviousSibling();
			if(previousSibling){
				node = previousSibling;
				// if the previous node is expanded, dive in deep
				while(node.isExpandable && node.isExpanded && node.hasChildren()){
					// move to the last child
					var children = node.getChildren();
					node = children[children.length - 1];
				}
			}else{
				// if this is the first child, return the parent
				// unless the parent is the root of a tree with a hidden root
				var parent = node.getParent();
				if(!(!this.showRoot && parent === this.rootNode)){
					node = parent;
				}
			}

			if(node && node.isTreeNode){
				this.focusNode(node);
			}
		},
		_onRightArrow: function(/*Event*/ evt, /*TreeNode*/ node){
			// summary:
			//		Right arrow pressed; go to child node

			// if not expanded, expand, else move to 1st child
			if(node.isExpandable && !node.isExpanded){
				this._expandNode(node);
			}else if(node.hasChildren()){
				node = node.getChildren()[0];
				if(node && node.isTreeNode){
					this.focusNode(node);
				}
			}
		},
		_onLeftArrow: function(/*Event*/ evt, /*TreeNode*/ node){
			// summary:
			//		Left arrow pressed.
			//		If not collapsed, collapse, else move to parent.

			if(node.isExpandable && node.isExpanded){
				this._collapseNode(node);
			}else{
				var parent = node.getParent();
				if(parent && parent.isTreeNode && !(!this.showRoot && parent === this.rootNode)){
					this.focusNode(parent);
				}
			}
		},
		focusLastChild: function(){
			// summary:
			//		End key pressed; go to last visible node.

			var node = this._getLastChild();
			if(node && node.isTreeNode){
				this.focusNode(node);
			}
		},
		_getFirstSelected: function(checkFocusable){
			var c,
				children = this.get("selectedNodes");
			for(var i = 0, l = children.length; i < l; i++){
				c = children[i];
				if(c && (!checkFocusable || c.isFocusable())){
					return children[i];
				}
			}
			return null;
		},
		_getFirstChild: function(){
			// summary:
			//		Returns the first child.
			// tags:
			//		abstract extension
			return !this.rootNode || this.showRoot ? this.rootNode : this.rootNode.getChildren()[0];
		},
		_getLastChild: function(){
			// summary:
			//		Returns the last descendant.
			// tags:
			//		abstract extension
			var node = this.rootNode;
			while(node && node.isExpanded){
				var c = node.getChildren();
				if(!c.length){
					break;
				}
				node = c[c.length - 1];
			}
			return node;
		},
		// Tree only searches forward so dir parameter is unused
		_getNextChild: function(node){
			// summary:
			//		Returns the next descendant, compared to "child".
			// node: Widget
			//		The current widget
			// tags:
			//		abstract extension

			if(node.isExpandable && node.isExpanded && node.hasChildren()){
				// if this is an expanded node, get the first child
				return node.getChildren()[0];
			}else{
				// find a parent node with a sibling
				while(node && node.isTreeNode){
					var returnNode = node.getNextSibling();
					if(returnNode){
						return returnNode;
					}
					node = node.getParent();
				}
				return null;
			}
		},
		/*focus: function(){
			// summary:
			//		Default focus() implementation: focus the previously focused child, or first child.
			//		Some applications may want to change this method to focus the [first] selected child.

			if(this.focusedChild){
				this.focusNode(this.focusedChild);
			}else if(this.lastFocusedChild){
				this.focusNode(this.lastFocusedChild);
			}else{
				if(this.selectedNodes[0]){
					this.focusNode(this.selectedNodes[0]);
				}else{
					this.focusFirstChild();
				}
			}
		},*/

		_onNodePress: function(/*TreeNode*/ nodeWidget, /*Event*/ e){
			// Touching a node should focus it, even if you touch the expando node or the edges rather than the label.
			// Especially important to avoid _KeyNavContainer._onContainerFocus() causing the previously focused TreeNode
			// to get focus
			this.focusNode(nodeWidget);
		},
		__click: function(/*TreeNode*/ nodeWidget, /*Event*/ e, /*Boolean*/doOpen, /*String*/func){
			//console.debug(nodeWidget.id, nodeWidget.disabled);
			if(!nodeWidget.disabled){
				var domElement = e.target,
					isExpandoClick = this.isExpandoNode(domElement, nodeWidget);

				if(nodeWidget.isExpandable && (doOpen || isExpandoClick)){
					// expando node was clicked, or label of a folder node was clicked; open it
					this._onExpandoClick({node: nodeWidget});
				}
				if(!isExpandoClick){
					//this._publish("execute", {///用 onSubmit？
					//	item: nodeWidget.item,
					//	node: nodeWidget,
					//	evt: e
					//});
					this[func](nodeWidget.item, nodeWidget, e);
					this.focusNode(nodeWidget);
				}
			}
			e.stopPropagation();
			e.preventDefault();
		},
		_onClick: function(/*TreeNode*/ nodeWidget, /*Event*/ e){
			// summary:
			//		Translates click events into commands for the controller to process
			this.__click(nodeWidget, e, this.openOnClick && (!nodeWidget.isExpanded && this.expandOnClick || nodeWidget.isExpanded && this.collapseOnClick), 'onClick');
		},
		_onDblClick: function(/*TreeNode*/ nodeWidget, /*Event*/ e){
			// summary:
			//		Translates double-click events into commands for the controller to process
			this.__click(nodeWidget, e, this.openOnDblClick, 'onDblClick');
		},
		_onExpandoClick: function(/*Object*/ message){
			// summary:
			//		User clicked the +/- icon; expand or collapse my children.
			var node = message.node;

			// If we are collapsing, we might be hiding the currently focused node.
			// Also, clicking the expando node might have erased focus from the current node.
			// For simplicity's sake just focus on the node with the expando.
			this.focusNode(node);

			if(node.isExpanded){
				this._collapseNode(node);
			}else{
				this._expandNode(node);
			}
		},
		onClick: function(/*===== item, node, evt =====*/){
			// summary:
			//		Callback when a tree node is clicked
			// item: Object
			//		Object from the dojo/store corresponding to this TreeNode
			// node: TreeNode
			//		The TreeNode itself
			// evt: Event
			//		The event
			// tags:
			//		callback
		},
		onDblClick: function(/*===== item, node, evt =====*/){
			// summary:
			//		Callback when a tree node is double-clicked
			// item: Object
			//		Object from the dojo/store corresponding to this TreeNode
			// node: TreeNode
			//		The TreeNode itself
			// evt: Event
			//		The event
			// tags:
			//		callback
		},
		onOpenNode: function(/*===== item, node =====*/){
			// summary:
			//		Callback when a node is opened
			// item: dojo/data/Item
			// node: TreeNode
			// tags:
			//		callback
		},
		onCloseNode: function(/*===== item, node =====*/){
			// summary:
			//		Callback when a node is closed
			// item: Object
			//		Object from the dojo/store corresponding to this TreeNode
			// node: TreeNode
			//		The TreeNode itself
			// tags:
			//		callback
		},

		////////////////// Miscellaneous functions ////////////////
		focusNode: function(/* _tree.Node */ node){
			// summary:
			//		Focus on the specified node (which must be visible)
			// tags:
			//		protected

			var scrollLeft = this.domNode.scrollLeft;
			this.focusChild(node);
			this.domNode.scrollLeft = scrollLeft;
		},
		_onNodeMouseEnter: function(/*_WidgetBase*/ /*===== node =====*/){
			// summary:
			//		Called when mouse is over a node (onmouseenter event),
			//		this is monitored by the DND code
		},
		_onNodeMouseLeave: function(/*_WidgetBase*/ /*===== node =====*/){
			// summary:
			//		Called when mouse leaves a node (onmouseleave event),
			//		this is monitored by the DND code
		},

		//////////////// Events from the model //////////////////////////
		_onItemChange: function(/*Item*/ item){
			// summary:
			//		Processes notification of a change to an item's scalar values like label
			var model = this.model,
				identity = model.getIdentity(item),
				nodes = this._itemNodesMap[identity];

			if(nodes){
				var label = this.getLabel(item),
					tooltip = this.getTooltip(item);
				rias.forEach(nodes, function(node){
					node.set({
						item: item, // theoretically could be new JS Object representing same item
						label: label,
						tooltip: tooltip
					});
					node._updateItemClasses(item);
				});
			}
		},
		_onItemChildrenChange: function(/*dojo/data/Item*/ parent, /*dojo/data/Item[]*/ newChildrenList){
			// summary:
			//		Processes notification of a change to an item's children
			var model = this.model,
				identity = model.getIdentity(parent),
				parentNodes = this._itemNodesMap[identity];

			if(parentNodes){
				rias.forEach(parentNodes, function(parentNode){
					parentNode.setChildItems(newChildrenList);
				});
			}
		},
		_onItemDelete: function(/*Item*/ item){
			// summary:
			//		Processes notification of a deletion of an item.
			//		Not called from new dojo.store interface but there's cleanup code in setChildItems() instead.

			var model = this.model,
				identity = model.getIdentity(item),
				nodes = this._itemNodesMap[identity];

			if(nodes){
				rias.forEach(nodes, function(node){
					// Remove node from set of selected nodes (if it's selected)
					if(this._dndController.removeTreeNode){
						this._dndController.removeTreeNode(node);
					}

					var parent = node.getParent();
					if(parent){
						// if node has not already been orphaned from a _onSetItem(parent, "children", ..) call...
						parent.removeChild(node);
					}

					node.destroyRecursive();
				}, this);
				delete this._itemNodesMap[identity];

				// If we've orphaned the focused node then move focus to the root node
				//if(this.lastFocusedChild && !rias.dom.isDescendant(this.lastFocusedChild, this.domNode)){
				//	delete this.lastFocusedChild;
				//}
				//if(this.focusedChild && !rias.dom.isDescendant(this.focusedChild, this.domNode)){
				//	this.focus();
				//}
				///这里不应该 save paths
				//this.setPersist_opened();
			}
		}

	});

	if(rias.has("riasw-bidi")){
		Widget.extend({
			_onSetTextDir: function(textDir){
				this.inherited(arguments);
				this.rootNode.set("textDir", textDir);
			}
		});
	}

	Widget.PathError = rias.createError("TreePathError");

	Widget.makeParams = function(params){
		params = rias.mixinDeep({}, {
			autoExpand: false,
			showRoot: true,
			noDnd: true,
			lazyLoad: true,
			childrenAttr: ["children"]
		}, params);

		if(!params.model){
			params.model = {
				_riaswType: "riasw.tree.TreeModel"
			};
		}
		if(!params.model._riaswType){
			params.model._riaswType = "riasw.tree.TreeModel";
		}
		if(params.store){
			if(!params.model.store){
				params.model.store = params.store;
			}
			delete params.store;
		}else if(!params.model.store){
			params.model.store = {
				_riaswType: "riasw.store.JsonXhrStore"
			};
		}
		if(params.target){
			params.model.store.target = params.target;
			//delete params.target;
		}
		if(params.query){
			params.model.query = params.query;
		}
		if(!params.model.store._riaswType){
			params.model.store._riaswType = params.model.store.target ? "riasw.store.JsonXhrStore" : "riasw.store.MemoryStore";
		}
		if(params.idProperty){
			params.model.store.idProperty = params.idProperty;
			//delete params.idProperty;
		}
		if(params.labelProperty){
			params.model.store.labelProperty = params.labelProperty;
			//delete params.labelProperty;
		}
		if(params.rootId){
			params.model.rootId = params.rootId;
		}
		if(params.rootLabel){
			params.model.rootLabel = params.rootLabel;
		}
		return params;
	};
	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		"property": {
			"model": {
				"datatype": ["riasw"],
				"hidden": true,
				"isData": true
			},
			"query": {
				"datatype": "json",
				"hidden": true
			},
			"label": {
				"datatype": "string",
				"hidden": true
			},
			"autoExpand": {
				"datatype": "boolean",
				"defaultValue": false,
				"title": "Auto Expand"
			},
			"showRoot": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Show Root"
			},
			"childrenAttr": {
				"datatype": "array",
				"defaultValue": "[\"children\"]",
				"hidden": true
			},
			"openOnClick": {
				"datatype": "boolean"
			},
			"openOnDblClick": {
				"datatype": "boolean",
				"description": "If true, double-clicking a folder node's label will open it, rather than calling onDblClick()"
			},
			"dndCtor": {
				"datatype": "string",
				"description": "Class name to use as as the dnd controller.  Specifying this class enables DnD.\nGenerally you should specify this as \"riasw.tree.dndSource\".",
				"defaultValue": "riasw.tree.dndSource",
				"hidden": true
			},
			"dndParams": {
				"datatype": "array",
				"hidden": true
			},
			"dragThreshold": {
				"datatype": "number",
				"description": "Number of pixels mouse moves before it's considered the start of a drag operation",
				"hidden": true
			},
			"betweenThreshold": {
				"datatype": "number",
				"description": "Set to a positive value to allow drag and drop \"between\" nodes.\n\nIf during DnD mouse is over a (target) node but less than betweenThreshold\npixels from the bottom edge, dropping the the dragged node will make it\nthe next sibling of the target node, rather than the child.\n\nSimilarly, if mouse is over a target node but less that betweenThreshold\npixels from the top edge, dropping the dragged node will make it\nthe target node's previous sibling rather than the target node's child.",
				"hidden": true
			}
		}
	};

	return Widget;

});