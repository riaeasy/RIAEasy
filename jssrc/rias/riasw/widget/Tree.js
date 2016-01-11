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

	rias.theme.loadCss([
		"widget/Tree.css"
	]);

	dndSelector.extend({
		onClickPress: function(e){

			// ignore mouse or touch on expando node
			if(this.current && this.current.isExpandable && this.tree.isExpandoNode(e.target, this.current)){ return; }

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

			var copy = dndCommon.getCopyKeyState(e), id = treeNode.id;

			// if shift key is not pressed, and the node is already in the selection,
			// delay deselection until onmouseup so in the case of DND, deselection
			// will be canceled by onmousemove.
			if(!this.singular && !e.shiftKey && this.selection[id]){
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

		templateString:
			'<div class="dijitTreeNode" role="presentation">' +
				'<div data-dojo-attach-point="rowNode" class="dijitTreeRow" role="presentation">' +
				'<span data-dojo-attach-point="expandoNode" class="dijitInline dijitTreeExpando" role="presentation"></span>' +
				'<span data-dojo-attach-point="expandoNodeText" class="dijitExpandoText" role="presentation"></span>' +
				'<span data-dojo-attach-point="contentNode" class="dijitTreeContent" role="presentation">' +
				'<span role="presentation" class="dijitInline dijitIcon dijitTreeIcon" data-dojo-attach-point="iconNode"></span>' +
				'<span data-dojo-attach-point="labelNode,focusNode" class="dijitTreeLabel" role="treeitem" tabindex="-1" aria-selected="false" id="${id}_label"></span>' +
				'</span>' +
				'</div>' +
				'<div data-dojo-attach-point="containerNode" class="dijitTreeNodeContainer" role="presentation" style="display: none;" aria-labelledby="${id}_label"></div>' +
				'</div>',

		isFocusable: function(){
			return !this.disabled && this.focusNode && (rias.dom.getStyle(this.domNode, "display") != "none");
		},
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
					if( true  || rias.a11y.hasDefaultTabStop(node)){    // see #11064 about webkit bug
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
			if(this._loadDeferred){
				this._loadDeferred.cancel("destroy node");//resolve(false);
				delete this._loadDeferred;
			}
			if(this._expandDeferred){
				this._expandDeferred.cancel("destroy node");//resolve(false);
				delete this._expandDeferred;
			}
			if(this._collapseDeferred){
				this._collapseDeferred.cancel("destroy node");//resolve(false);
				delete this._collapseDeferred;
			}
			this.inherited(arguments);
		},
		removeChild: function(/* treeNode */ node){
			this.inherited(arguments);

			if(!this.tree._beingDestroyed){///避免 collapse
				var children = this.getChildren();
				if(children.length == 0){
					this.isExpandable = false;
					this.collapse();
				}

				rias.forEach(children, function(child){
					child._updateLayout();
				});
			}
		}//,
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
			rias.after(wipeIn, "onEnd", function(){
				def.resolve(true);
			}, true);
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
			rias.after(wipeOut, "onEnd", function(){
				def.resolve(true);
			}, true);
			wipeOut.play();

			return shimmedPromise(def);		// dojo/promise/Promise
		}*/
	});

	_Widget.extend({
		destroyRecursive: function(){
			this._beingDestroyed = true;///设置 _beingDestroyed
			// A tree is treated as a leaf, not as a node with children (like a grid),
			// but defining destroyRecursive for back-compat.
			this.destroy();
		},
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
			return new (this.nodeRender || _Widget._TreeNode)(args);
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
					this._publish("execute", { item: nodeWidget.item, node: nodeWidget, evt: e });
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
		},
		clear: function(){
			var self = this,
				d = rias.newDeferred(),
				m = self.model;
			self.dndController.setSelection([]);
			m.store.revert();
			m.store.close();
			m.root.children = [];
			m.root.size = 0;

			if(self._curSearch){
				self._curSearch.timer.remove();
				delete self._curSearch;
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
					d.resolve(newNodes);
				}, function(e){
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

	var Widget = rias.declare("rias.riasw.widget.Tree", [_Widget], {

		nodeRender: _Widget._TreeNode,

		noDnd: false,
		lazyLoad: true,

		postMixInProperties: function(){
			this.inherited(arguments);
			if(this.noDnd){
				this.dndController = dndSelector;
			}else{
				this.dndController = dndSource;
			}
			this.dndParams = ["itemCreator", "isSource", "accept", "copyOnly",
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
				noDnd: false,
				lazyLoad: true,
				childrenAttr: ["children"]
			}, params);
			if(!params.model){
				params.model = {
					_riaswType: "rias.riasw.widget.TreeModel"
				}
			}
			if(!params.model._riaswIdOfModule && params._riaswIdOfModule){
				params.model._riaswIdOfModule = params._riaswIdOfModule + "_model"
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
						_riaswType: "rias.riasw.store.JsonRestStore"
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