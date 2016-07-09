//RIAStudio client runtime widget - Tree

define([
	"rias",
	"dijit/Tree",
	"rias/riasw/widget/TreeModel",
	"dojo/dnd/common",
	"dijit/tree/_dndSelector",
	"dijit/tree/dndSource",
	"dijit/tree/TreeStoreModel"
], function(rias, _Widget, TreeModel, dndCommon, dndSelector, dndSource) {

	rias.theme.loadRiasCss([
		"widget/Tree.css"
	]);

	dndSelector.extend({
		addTreeNode: function(/*dijit/Tree._TreeNode*/ node, /*Boolean?*/isAnchor){
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
		removeTreeNode: function(/*dijit/Tree._TreeNode*/ node){
			// summary:
			//		remove node and it's descendants from current selection
			// node: Node
			//		node to remove
			var newSelection = rias.filter(this.getSelectedTreeNodes(), function(selectedNode){
				if(!node.selectionMode || node.selectionMode === "cascade"){
					return !rias.dom.isDescendant(selectedNode.domNode, node.domNode); // also matches when selectedNode == node
				}else{
					return selectedNode.domNode !== node.domNode; // also matches when selectedNode == node
				}
			});
			this.setSelection(newSelection);
			return node;
		},
		onClickPress: function(e){

			// ignore mouse or touch on expando node
			if(this.current && this.current.isExpandable && this.tree.isExpandoNode(e.target, this.current)){
				return;
			}

			if(e.type == "mousedown" && rias.mouse.isLeft(e)){
				// Prevent text selection while dragging on desktop, see #16328.   But don't call preventDefault()
				// for mobile because it will break things completely, see #15838.  Also, don't preventDefault() on
				// MSPointerDown or pointerdown events, because that stops the mousedown event from being generated,
				// see #17709.
				// TODO: remove this completely in 2.0.  It shouldn't be needed since dojo/dnd/Manager already
				// calls preventDefault() for the "selectstart" event.  It can also be achieved via CSS:
				// http://stackoverflow.com/questions/826782/css-rule-to-disable-text-selection-highlighting
				e.preventDefault();
			}

			var treeNode = e.type == "keydown" ? this.tree.focusedChild : this.current;

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
		}

	});

	function shimmedPromise(/*Deferred|Promise*/ d){
		// summary:
		//		Return a Promise based on given Deferred or Promise, with back-compat addCallback() and addErrback() shims
		//		added (TODO: remove those back-compat shims, and this method, for 2.0)
		return rias.delegate(d.promise || d, {
			addCallback: function(callback){
				this.then(callback);
			},
			addErrback: function(errback){
				this.otherwise(errback);
			}
		});
	}

	_Widget._TreeNode.extend({

		tabIndex: "0",
		_setTabIndexAttr: "focusNode", // force copy even when tabIndex default value, needed since Button is <span>
		disabled: false,
		selectionMode: "none",

		templateString:
			'<div class="dijitTreeNode" role="presentation">' +
				'<div role="presentation" data-dojo-attach-point="rowNode,focusNode" class="dijitTreeRow" data-dojo-attach-event="onclick:toggle,onmouseenter:_onToggleMouseEnter,onmouseleave:_onToggleMouseLeave">' +
					'<span role="presentation" data-dojo-attach-point="expandoNode" class="dijitInline dijitTreeExpando"></span>' +
					'<span role="presentation" data-dojo-attach-point="expandoNodeText" class="dijitExpandoText"></span>' +
					'<input role="presentation" data-dojo-attach-point="selectNode" class="dijitInline dijitTreeSelectNode dijitHidden" type="radio" tabindex="-1">' +
					'<span role="presentation" data-dojo-attach-point="contentNode" class="dijitTreeContent">' +
						'<span role="presentation" data-dojo-attach-point="iconNode" class="dijitInline dijitIcon dijitTreeIcon"></span>' +
						'<span role="treeitem" data-dojo-attach-point="labelNode" class="dijitTreeLabel" tabindex="-1" aria-selected="false" id="${id}_label"></span>' +
					'</span>' +
				'</div>' +
				'<div role="presentation" data-dojo-attach-point="containerNode" class="dijitTreeNodeContainer" style="display: none;" aria-labelledby="${id}_label"></div>' +
			'</div>',

		_setDisabledAttr: function(/*Boolean*/ value){
			value = !!value;
			this._set("disabled", value);
			//rias.dom.setAttr(this.focusNode, 'disabled', value);
			//this.focusNode.setAttribute("aria-disabled", value ? "true" : "false");
			rias.dom.setAttr(this.rowNode, 'disabled', value);
			this.rowNode.setAttribute("aria-disabled", value ? "true" : "false");

			if(value){
				// reset these, because after the domNode is disabled, we can no longer receive
				// mouse related events, see #4200
				this._set("hovering", false);
				this._set("active", false);

				// clear tab stop(s) on this widget's focusable node(s)  (ComboBox has two focusable nodes)
				var attachPointNames = "tabIndex" in this.attributeMap ? this.attributeMap.tabIndex :
					("_setTabIndexAttr" in this) ? this._setTabIndexAttr : ["rowNode"];
				rias.forEach(rias.isArray(attachPointNames) ? attachPointNames : [attachPointNames], function(attachPointName){
					var node = this[attachPointName];
					// complex code because tabIndex=-1 on a <div> doesn't work on FF
					if( true || rias.a11y.hasDefaultTabStop(node)){    // see #11064 about webkit bug
						node.setAttribute('tabIndex', "-1");
					}else{
						node.removeAttribute('tabIndex');
					}
				}, this);
			}else{
				if(this.tabIndex != ""){
					this.set('tabIndex', this.tabIndex);
				}
			}
		},
		_setSelectionModeAttr: function(value){
			var node = this.selectNode;
			switch (value) {
				case "single":
				case "radio":
					value = "single";
					rias.dom.setAttr(node, "type", "radio");
					rias.dom.removeClass(node, "dijitHidden");
					break;
				case "multiple":
				case "extended":
				case "checkbox":
					value = "multiple";
					rias.dom.setAttr(this.selectNode, "type", "checkbox");
					rias.dom.removeClass(node, "dijitHidden");
					break;
				default:
					value = "none";
					rias.dom.addClass(node, "dijitHidden");
			}
			this._set("selectionMode", value);
		},
		_updateItemClasses: function(item){
			// summary:
			//		Set appropriate CSS classes for icon and label dom node
			//		(used to allow for item updates to change respective CSS)
			// tags:
			//		private
			var tree = this.tree,
				model = tree.model;
			if(tree._v10Compat && item === model.root){
				// For back-compat with 1.0, need to use null to specify root item (TODO: remove in 2.0)
				item = null;
			}
			this._applyClassAndStyle(item, "icon", "Icon");
			this._applyClassAndStyle(item, "label", "Label");
			this._applyClassAndStyle(item, "row", "Row");

			//rias.dom.toggleClass(this.domNode, this.baseClass + "Disabled", !!this.disabled);///this.disabled = undefiend 时，是直接翻转

			tree._startPaint(true);		// signifies paint started and finished (synchronously)
		},
		_applyClassAndStyle: function(item, lower, upper){
			var clsName = "_" + lower + "Class";
			var nodeName = lower + "Node";
			var oldCls = this[clsName];
			//this[clsName] = this.tree["get" + upper + "Class"](item, this.isExpanded);
			var f = this.tree["get" + upper + "Class"];
			this[clsName] = rias.hitch(this.tree, f)(item, this.isExpanded);
			rias.dom.replaceClass(this[nodeName], this[clsName] || "", oldCls || "");
			rias.dom.setStyle(this[nodeName], this.tree["get" + upper + "Style"](item, this.isExpanded) || {});
		},
		_setTooltipAttr: function(/*String*/ tooltip){
			this.inherited(arguments);
		},
		destroy: function(){
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
		removeChild: function(/* treeNode */ node){
			this.inherited(arguments);

			if(!this.tree.isDestroyed(true) && !this.isDestroyed(true)){///避免 collapse
				var children = this.getChildren();
				if(children.length == 0){
					this.isExpandable = false;
					this.collapse();
				}

				rias.forEach(children, function(child){
					child._updateLayout();
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
			this._selected = !!selected;
			rias.dom.setAttr(this.selectNode, "checked", !!selected);
			rias.dom.setAttr(this.selectNode, "aria-checked", selected ? "true" : "false");
			this.labelNode.setAttribute("aria-selected", selected ? "true" : "false");
			rias.dom.toggleClass(this.rowNode, "dijitTreeRowSelected", selected);
		},
		/*
		expand: function(){
			var self = this,
				def;
			// If there's already an expand in progress or we are already expanded, just return
			if(self._expandDeferred){
				return shimmedPromise(self._expandDeferred);		// dojo/promise/Promise
			}

			// cancel in progress collapse operation
			if(self._collapseDeferred){
				self._collapseDeferred.resolve(false);
			}

			// All the state information for when a node is expanded, maybe self should be
			// set when the animation completes instead
			self.isExpanded = true;
			self.labelNode.setAttribute("aria-expanded", "true");
			if(self.tree.showRoot || self !== self.tree.rootNode){
				self.containerNode.setAttribute("role", "group");
			}
			rias.dom.addClass(self.contentNode, 'dijitTreeContentExpanded');
			self._setExpando();
			self._updateItemClasses(self.item);

			if(self == self.tree.rootNode && self.tree.showRoot){
				self.tree.domNode.setAttribute("aria-expanded", "true");
			}

			var wipeIn = rias.fx.wipeIn({
				node: self.containerNode,
				duration: rias.defaultDuration
			});
			// Deferred that fires when expand is complete
			def = (self._expandDeferred = rias.newDeferred(function(){
				// Canceller
				wipeIn.stop();
			}));
			self.own(rias.after(wipeIn, "onEnd", function(){
				def.resolve(true);
			}, true));
			wipeIn.play();

			return shimmedPromise(def);		// dojo/promise/Promise
		},
		collapse: function(){
			var self = this,
				def;
			if(self._collapseDeferred){
				// Node is already collapsed, or there's a collapse in progress, just return that Deferred
				return shimmedPromise(self._collapseDeferred);
			}

			// cancel in progress expand operation
			if(self._expandDeferred){
				self._expandDeferred.resolve(false);
			}

			self.isExpanded = false;
			self.labelNode.setAttribute("aria-expanded", "false");
			if(self == self.tree.rootNode && self.tree.showRoot){
				self.tree.domNode.setAttribute("aria-expanded", "false");
			}
			rias.dom.removeClass(self.contentNode, 'dijitTreeContentExpanded');
			self._setExpando();
			self._updateItemClasses(self.item);

			var wipeOut = rias.fx.wipeOut({
				node: self.containerNode,
				duration: rias.defaultDuration
			});
			// Deferred that fires when expand is complete
			def = (self._collapseDeferred = rias.newDeferred(function(){
				// Canceller
				wipeOut.stop();
			}));
			self.own(rias.after(wipeOut, "onEnd", function(){
				def.resolve(true);
			}, true));
			wipeOut.play();

			return shimmedPromise(def);		// dojo/promise/Promise
		},*/

		toggle: function (evt){
			if(evt.target == this.expandoNode){
				return;
			}
			if(this.tree.model.mayHaveChildren(this.item)){
				if(this.isExpanded){
					if(this.tree.collapseOnToggle){
						this.tree._collapseNode(this);
					}
				}else{
					if(this.tree.expandOnToggle){
						this.tree._expandNode(this);
					}
				}
			}
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

	_Widget.extend({

		loadOnStartup: true,

		postCreate: function(){
			this._initState();

			// Catch events on TreeNodes
			var self = this;
			this.own(
				rias.on(this.containerNode, rias.on.selector(".dijitTreeNode", rias.touch.enter), function(evt){
					self._onNodeMouseEnter(rias.registry.byNode(this), evt);
				}),
				rias.on(this.containerNode, rias.on.selector(".dijitTreeNode", rias.touch.leave), function(evt){
					self._onNodeMouseLeave(rias.registry.byNode(this), evt);
				}),
				rias.on(this.containerNode, rias.on.selector(".dijitTreeRow", rias.a11yclick.press), function(evt){
					self._onNodePress(rias.registry.getEnclosingWidget(this), evt);
				}),
				rias.on(this.containerNode, rias.on.selector(".dijitTreeRow", rias.a11yclick), function(evt){
					self._onClick(rias.registry.getEnclosingWidget(this), evt);
				}),
				rias.on(this.containerNode, rias.on.selector(".dijitTreeRow", "dblclick"), function(evt){
					self._onDblClick(rias.registry.getEnclosingWidget(this), evt);
				})
			);

			// Create glue between store and Tree, if not specified directly by user
			if(!this.model){
				this._store2model();
			}

			// monitor changes to items
			this.own(
				rias.after(this.model, "onChange", rias.hitch(this, "_onItemChange"), true),
				rias.after(this.model, "onChildrenChange", rias.hitch(this, "_onItemChildrenChange"), true),
				rias.after(this.model, "onDelete", rias.hitch(this, "_onItemDelete"), true)
			);

			this.inherited(arguments);

			if(this.dndController){
				// TODO: remove string support in 2.0.
				if(rias.isString(this.dndController)){
					this.dndController = rias.getObject(this.dndController);
				}
				var params = {};
				for(var i = 0; i < this.dndParams.length; i++){
					if(this[this.dndParams[i]]){
						params[this.dndParams[i]] = this[this.dndParams[i]];
					}
				}
				this.dndController = new this.dndController(this, params);
			}

			this._load(this.loadOnStartup != false);

			// onLoadDeferred should fire when all commands that are part of initialization have completed.
			// It will include all the set("paths", ...) commands that happen during initialization.
			this.onLoadDeferred = shimmedPromise(this.pendingCommandsPromise);

			this.onLoadDeferred.then(rias.hitch(this, "onLoad"));
		},
		destroy: function(){
			if(this._curSearch){
				this._curSearch.timer.remove();
				this._curSearch = undefined;
			}
			if(this.expandChildrenDeferred){
				this.expandChildrenDeferred.cancel();
			}
			if(this.rootNode){
				this.rootNode.destroyRecursive();
			}
			if(this.dndController && !rias.isString(this.dndController)){
				this.dndController.destroy();
			}
			this.rootNode = null;
			this.inherited(arguments);
		},
		destroyRecursive: function(){
			this._beingDestroyed = true;///设置 _beingDestroyed
			// A tree is treated as a leaf, not as a node with children (like a grid),
			// but defining destroyRecursive for back-compat.
			this.destroy();
		},
		/*startup: function(){
			this.inherited(arguments);
			if(this.loadOnStartup != false){
				this._load();
			}
		},*/
		getIconClass: function(item, opened){
			if(item.iconClass){
				if(rias.isArray(item.iconClass)){
					if(item.iconClass[0]){
						return item.iconClass[0];
					}
				}else if(rias.isString(item.iconClass) && item.iconClass !== ""){
					return item.iconClass;
				}
			}
			return (!item || (item.itemType === "dir") || !this.model || this.model.mayHaveChildren(item)) ? (opened ? "dijitFolderOpened" : "dijitFolderClosed") : "dijitLeaf";
		},

		_load: function(expand){
			// summary:
			//		Initial load of the tree.
			//		Load root node (possibly hidden) and it's children.
			this.model.getRoot(
				rias.hitch(this, function(item){
					var rn = (this.rootNode = this.tree._createTreeNode({
						item: item,
						tree: this,
						isExpandable: true,
						label: this.label || this.getLabel(item),
						labelType: this.model.labelType || "text",
						textDir: this.textDir,
						indent: this.showRoot ? 0 : -1
					}));

					if(!this.showRoot){
						rn.rowNode.style.display = "none";
						// if root is not visible, move tree role to the invisible
						// root node's containerNode, see #12135
						this.domNode.setAttribute("role", "presentation");
						this.domNode.removeAttribute("aria-expanded");
						this.domNode.removeAttribute("aria-multiselectable");

						// move the aria-label or aria-labelledby to the element with the role
						if(this["aria-label"]){
							rn.containerNode.setAttribute("aria-label", this["aria-label"]);
							this.domNode.removeAttribute("aria-label");
						}else if(this["aria-labelledby"]){
							rn.containerNode.setAttribute("aria-labelledby", this["aria-labelledby"]);
							this.domNode.removeAttribute("aria-labelledby");
						}
						rn.labelNode.setAttribute("role", "presentation");
						rn.labelNode.removeAttribute("aria-selected");
						rn.containerNode.setAttribute("role", "tree");
						rn.containerNode.setAttribute("aria-expanded", "true");
						rn.containerNode.setAttribute("aria-multiselectable", !this.dndController.singular);
					}else{
						this.domNode.setAttribute("aria-multiselectable", !this.dndController.singular);
						this.rootLoadingIndicator.style.display = "none";
					}

					this.containerNode.appendChild(rn.domNode);
					var identity = this.model.getIdentity(item);
					if(this._itemNodesMap[identity]){
						this._itemNodesMap[identity].push(rn);
					}else{
						this._itemNodesMap[identity] = [rn];
					}

					rn._updateLayout();		// sets "dijitTreeIsRoot" CSS classname

					if(expand != false){
						// Load top level children, and if persist==true, all nodes that were previously opened
						this._expandNode(rn).then(rias.hitch(this, function(){
							// Then, select the nodes specified by params.paths[], assuming Tree hasn't been deleted.
							if(!this._destroyed){
								this.rootLoadingIndicator.style.display = "none";
								this.expandChildrenDeferred.resolve(true);
							}
						}));
					}
				}),
				rias.hitch(this, function(err){
					console.error(this, ": error loading root: ", err);
				})
			);
		},

		isSelectNode: function(node, widget){
			return rias.dom.isDescendant(node, widget.selectNode);
		},
		__click: function(/*TreeNode*/ nodeWidget, /*Event*/ e, /*Boolean*/doOpen, /*String*/func){
			//console.debug(nodeWidget.id, nodeWidget.disabled);
			if(!nodeWidget.disabled){
				var domElement = e.target,
					isExpandoClick = this.isExpandoNode(domElement, nodeWidget);

				if(nodeWidget.isExpandable && (doOpen || isExpandoClick)){
					// expando node was clicked, or label of a folder node was clicked; open it
					this._onExpandoClick({node: nodeWidget});
				}else{
					this._publish("execute", {
						item: nodeWidget.item,
						node: nodeWidget,
						evt: e
					});
					this[func](nodeWidget.item, nodeWidget, e);
					this.focusNode(nodeWidget);
				}
			}
			e.stopPropagation();
			e.preventDefault();
		},
		resize: function(changeSize){
			var self = this;
			if(changeSize){
				rias.dom.setMarginBox(self.domNode, changeSize);
			}
			self._nodePixelIndent = rias.dom.position(self.tree.indentDetector).w || self._nodePixelIndent;

			// resize() may be called before this.rootNode is created, so wait until it's available
			self.expandChildrenDeferred.then(function(){
				// If tree has already loaded, then reset indent for all the nodes
				if(self.rootNode){
					self.rootNode.set('indent', self.showRoot ? 0 : -1);
				}

				// Also, adjust widths of all rows to match width of Tree
				self._adjustWidths();
			});
		}
	});

	var riasType = "rias.riasw.widget.Tree";
	var Widget = rias.declare(riasType, [_Widget], {

		nodeRender: _Widget._TreeNode,

		selectionMode: "none",
		noDnd: false,
		lazyLoad: true,
		expandOnToggle: true,
		collapseOnToggle: false,
		expandOnEnter: false,
		collapseOnEnter: false,
		///TODO:zensst. 同步 openOnClick 和 openOnDblClick

		//rootItems: {
		//	items: [],
		//	query: {}
		//},
		rootItems: null,

		postCreate: function(){
			if(this.model){
				if(this.rootItems){
					this.model.queryRoot = this.rootItems.query;
					this.model.additionRootItems = this.rootItems.items;
				}
			}
			this.inherited(arguments);
			//this.set("singular", this.singular);
		},
		postMixInProperties: function(){
			this.inherited(arguments);
			if(this.noDnd){
				this.dndController = dndSelector;
			}else{
				this.dndController = dndSource;
			}
			this.dndParams = ["itemCreator", "isSource", "accept", "copyOnly", "singular",
				"onDndDrop", "onDndCancel",
				"checkAcceptance", "checkItemAcceptance",
				"dragThreshold", "betweenThreshold"];
		},

		_setLazyLoadAttr: function(value){
			this._lazyLoad = !!value;
			this._set("lazyLoad", this._lazyLoad);
			if(this._started && !this._lazyLoad){
				this.reload();
			}
		},

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

		_setSingularAttr: function(value){
			value = !!value;
			this._set("singular", value);
			this.dndController.singular = value;
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
			this._set("singular", value !== "multiple");
			this._set("selectionMode", value);
			if(this.loaded){
				this.reload();
			}
		},

		_createTreeNode: function(/*Object*/ args){
			// summary:
			//		creates a TreeNode
			// description:
			//		Developers can override this method to define their own TreeNode class;
			//		However it will probably be removed in a future release in favor of a way
			//		of just specifying a widget for the label, rather than one that contains
			//		the children too.
			args.ownerRiasw = this;
			args.disabled = args.disabled || args.item.disabled;
			args.selectionMode = this.selectionMode;

			return new (this.nodeRender || _Widget._TreeNode)(args);
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
				var queryObj;
				if(self._lazyLoad){
					queryObj = {
						start: 0,
						parentId: model.store.getIdentity(item)
					};
				}
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
						//rias.xhr.error(err);
						node._loadDeferred.reject(err);
					},
					queryObj
				);
			}

			// Expand the node after data has loaded
			var def = node._loadDeferred.then(function(){
				// seems like these should be inside of then(), but left here for back-compat about
				// when this.isOpen flag gets set (ie, at the beginning of the animation)
				var d = node.expand();
				self.onOpen(node.item, node);
				self._state(node, true);
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

		clear: function(){
			var self = this,
				d = rias.newDeferred(),
				m = self.model;
			self.loaded = false;
			self.dndController.setSelection([]);
			m.store.revert();
			m.store.close();
			m.root.children = [];
			m.root.size = 0;

			if(self._curSearch){
				self._curSearch.timer.remove();
				self._curSearch = undefined;
			}
			if(self.rootNode){
				self.rootNode.destroyRecursive();
				self.rootNode = null;
				self._itemNodesMap = {};
				d.resolve(self.rootNode);
			}else{
				d.resolve(self.rootNode);
			}
			return d.promise;
		},
		reload: function(path){
			var self = this,
				d = rias.newDeferred();
			function load(){
				self._load();
				self.set("path", path).then(function(newNodes){
					self.loaded = true;
					d.resolve(newNodes);
				}, function(e){
					self.loaded = true;
					d.resolve(e);
				});
			}
			path = rias.map(path || self.paths[0], function(item){
				return rias.isString(item) ? item : self.model.getIdentity(item);
			});
			if(self.rootNode){
				self.clear().then(load);
			}else{
				load();
			}
			return d.promise;
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTreeIcon",
		iconClass16: "riaswTreeIcon16",
		defaultParams: function(params){
			params = rias.mixinDeep({}, {
				autoExpand: false,
				showRoot: true,
				persist: false,
				isSource: false,
				accept: [],
				dragThreshold:8,
				betweenThreshold:5,
				noDnd: true,
				lazyLoad: true,
				childrenAttr: ["children"]
			}, params);
			if(!params.model){
				params.model = {
					_riaswType: "rias.riasw.widget.TreeModel"
				}
			}
			if(!params.model._riaswType){
				params.model._riaswType = "rias.riasw.widget.TreeModel"
			}
			if(!params.model._riaswIdOfModule && params._riaswIdOfModule){
				params.model._riaswIdOfModule = params._riaswIdOfModule + "_model"
			}
			if(params.rootId){
				params.model.rootId = params.rootId;
			}
			if(params.rootLabel){
				params.model.rootLabel = params.rootLabel;
			}
			if(params.query){
				params.model.query = params.query;
			}
			if(params.store){
				params.model.store = params.store
			}else if(!params.model.store){
				if(params.lazyLoad == false){
					params.model.store = {
						_riaswType: "rias.riasw.store.MemoryStore"
					}
				}else{
					if(params.model.deferItemLoadingUntilExpand === undefined){
						params.model.deferItemLoadingUntilExpand = true;
					}
					params.model.store = {
						_riaswType: "rias.riasw.store.JsonXhrStore"
					}
				}
			}
			if(params.idAttribute){
				params.model.store.idAttribute = params.idAttribute;
				//delete params.idAttribute;
			}
			if(params.labelAttribute){
				params.model.store.labelAttribute = params.labelAttribute;
				//delete params.labelAttribute;
			}
			if(params.target){
				params.model.store.target = params.target;
				//delete params.target;
			}
			return params;
		},
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
			"persist": {
				"datatype": "boolean",
				"description": "Enables/disables use of cookies for state saving."
			},
			"dndController": {
				"datatype": "string",
				"description": "Class name to use as as the dnd controller.  Specifying this class enables DnD.\nGenerally you should specify this as \"dijit.tree.dndSource\".",
				"defaultValue": "dijit.tree.dndSource",
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