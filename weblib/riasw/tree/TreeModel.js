//RIAStudio client runtime widget - TreeModel

define([
	"riasw/riaswBase",
	"riasw/store/StoreBase",
	"riasw/store/ObjectStore",
	"riasw/store/JsonXhrStore",
	"riasw/store/MemoryStore"
], function(rias, StoreBase, ObjectStore) {

	var riaswType = "riasw.tree.TreeModel";

	var Widget = rias.declare(riaswType, [rias.ObjectBase], {

		store: null,
		childrenAttrs: ["children"],
		newItemIdAttr: "id",
		labelAttr: "",

		rootId: "$root$",
		rootLabel: "ROOT",
		root: null,
		query: null,
		queryRoot: null,
		//parentAttr: "parentId",
		additionItems: null,

		constructor: function(params){
			this.root = {
				store: this,
				root: true,
				id: params.rootId,
				label: params.rootLabel,
				children: params.rootChildren	// optional param
			};
		},
		postCreate: function(/*Object?*/params){
			//rias.mixin(this, params);
			if(this.connects){
				delete this.connects;
			}
			var store = this.store;
			//delete params.store;
			if(!store.getFeatures && rias.is(store, StoreBase)){
				this.store = new ObjectStore({
					ownerRiasw: this,
					objectStore: store
				});
			}
			if(!this.store.getFeatures()['dojo.data.api.Identity']){
				throw new Error("riasw.tree.TreeStoreModel: store must support dojo.data.Identity");
			}

			// if the store supports Notification, subscribe to the notification events
			if(this.store.getFeatures()['dojo.data.api.Notification']){
				this.after(this.store, "onNew", rias.hitch(this, "onNewItem"), true);
				this.after(this.store, "onDelete", rias.hitch(this, "onDeleteItem"), true);
				this.after(this.store, "onSet", rias.hitch(this, "onSetItem"), true);
			}
			this.inherited(arguments);
		},
		_onDestroy: function(){
			this.cancelQuery();
			this.inherited(arguments);
		},

		_setStoreAttr: function(value){
			if(rias.isRiaswParam(value)){
				if(!value.ownerRiasw){
					value.ownerRiasw = this;
				}
				value = rias.newRiasw(value);
			}
			this._set("store", value);
		},

		isItem: function(/* anything */ something){
			return (something === this.root) ? true : this.store.isItem(something);
		},
		fetchItemByIdentity: function(/* object */ keywordArgs){
			if(keywordArgs.identity === this.root.id){
				var scope = keywordArgs.scope || rias.global;
				if(keywordArgs.onItem){
					keywordArgs.onItem.call(scope, this.root);
				}
			}else{
				this.store.fetchItemByIdentity(keywordArgs);
			}
		},
		getIdentity: function(/* item */ item){
			return (item === this.root) ? this.root.id : this.store.getIdentity(item);
		},
		onGetLabel: function(/*dojo/data/Item*/ item){
			// summary:
			//		Get the label for an item
			if(this.labelAttr){
				return this.store.getValue(item,this.labelAttr);	// String
			}else{
				return this.store.getLabel(item);	// String
			}
		},
		getLabel: function(/* item */ item){
			return	(item === this.root) ? this.root.label : this.onGetLabel(item);
		},

		cancelQuery: function(){
			if(this.store.cancelQuery){
				this.store.cancelQuery();
			}
		},
		getRoot: function(onItem, onError){
			// summary:
			//		Calls onItem with the root item for the tree, possibly a fabricated item.
			//		Calls onError on error.
			if(this.root){
				onItem(this.root);
			}else{
				this.store.fetch({
					query: this.query,
					onComplete: rias.hitch(this, function(items){
						if(items.length !== 1){
							throw new Error("riasw.tree.TreeStoreModel: root query returned " + items.length +
								" items, but must return exactly one");
						}
						this.root = items[0];
						onItem(this.root);
					}),
					onError: onError
				});
			}
		},
		mayHaveChildren: function(/*dojo.data.Item*/ item){
			//if(item === this.root){
			//	return true;
			//}
			var children = null;
			return item === this.root || rias.some(this.childrenAttrs, function(attr){
				children = this.store.getValue(item, attr);
				if(rias.isArray(children)){
					return children.length > 0;
				}else if(rias.isString(children)){
					return (rias.toInt(children, 0) > 0) || (children.toLowerCase() === "true");
				}else if(rias.isNumber(children)){
					return children > 0;
				}else if(rias.isBoolean(children)){
					return children;
				}else if(this.store.isItem(children)){
					children = this.store.getValues(item, attr);
					return rias.isArray(children) ? children.length > 0 : false;
				}else{
					return false;
				}
			}, this);
		},
		_isChildrenLoaded: function(parentItem){
			// summary:
			//		Check if all children of the given item have been loaded
			var self = this,
				children = null;
			return rias.every(self.childrenAttrs, function(attr){
				children = self.store.getValues(parentItem, attr);
				return rias.every(children, function(c){
					return self.store.isItem(c) && self.store.isItemLoaded(c);
				}, self);
			}, self);
		},
		getChildren: function(/*dojo.data.Item*/parentItem, /*function(items, size)*/onComplete, /*function*/ onError, /*Object*/queryObj){
			var self = this,
				store = self.store;

			function _load(){
				// get children of specified item
				var childItems = [];
				for(var i = 0; i < self.childrenAttrs.length; i++){
					var vals = store.getValues(parentItem, self.childrenAttrs[i]);
					childItems = childItems.concat(vals);
				}

				// count how many items need to be loaded
				var _waitCount = 0;
				//if(!self.deferItemLoadingUntilExpand){
				//	rias.forEach(childItems, function(item){
				//		if(!store.isItemLoaded(item)){
				//			_waitCount++;
				//		}
				//	});
				//}

				if(_waitCount === 0){
					// all items are already loaded (or we aren't loading them).  proceed...
					onComplete(childItems);
				}else{
					// still waiting for some or all of the items to load
					rias.forEach(childItems, function(item, idx){
						if(!store.isItemLoaded(item)){
							store.loadItem({
								item: item,
								onItem: function(item){
									childItems[idx] = item;
									if(--_waitCount === 0){
										// all nodes have been loaded, send them to the tree
										onComplete(childItems);
									}
								},
								onError: onError
							});
						}
					});
				}
			}

			if(queryObj){
				var start = queryObj.start || 0,
					count = queryObj.count,
					parentId = queryObj.parentId,
					sort = queryObj.sort;
				if(parentItem === self.root){
					self.root.size = 0;
					self.store.fetch({
						start: start,
						count: count,
						sort: sort,
						query: self.queryRoot,
						onBegin: function(size){
							self.root.size = self.additionItems ? self.additionItems.length + size : size;
						},
						onComplete: function(items){
							onComplete(self.additionItems ? self.additionItems.concat(items) : items, queryObj, self.root.size);
						},
						onError: onError
					});
				}else{
					if(!store.isItemLoaded(parentItem)){
						var getChildren = rias.hitch(self, arguments.callee);
						store.loadItem({
							item: parentItem,
							onItem: function(parentItem){
								getChildren(parentItem, onComplete, onError, queryObj);
							},
							onError: onError
						});
						return;
					}
					if(self.store && !self._isChildrenLoaded(parentItem)){
						self.childrenSize = 0;
						self.store.fetch({
							start: start,
							count: count,
							sort: sort,
							query: rias.mixin({parentId: parentId}, self.query),
							onBegin: function(size){
								self.childrenSize = size;
							},
							onComplete: function(items){
								onComplete(items, queryObj, self.childrenSize);
							},
							onError: onError
						});
					}else{
						_load();
					}
				}
			}else{
				_load();
			}
		},

		onNewRootItem: function(/* riasw/tree/dndSource.__Item */ /*===== args =====*/){
			// summary:
			//		User can override this method to modify a new element that's being
			//		added to the root of the tree, for example to add a flag like root=true
		},
		onAddToRoot: function(/* item */ item){
			// summary:
			//		Called when item added to root of tree; user must override this method
			//		to modify the item so that it matches the query for top level items
			// example:
			//	|	store.setValue(item, "root", true);
			// tags:
			//		extension
			console.log(this, ": item ", item, " added to root");
		},

		onLeaveRoot: function(/* item */ item){
			// summary:
			//		Called when item removed from root of tree; user must override this method
			//		to modify the item so it doesn't match the query for top level items
			// example:
			//	|	store.unsetAttribute(item, "root");
			// tags:
			//		extension
			console.log(this, ": item ", item, " removed from root");
		},
		newItem: function(/* riasw/tree/dndSource.__Item */ args, /*Item*/ parent, /*int?*/ insertIndex){
			// summary:
			//		Creates a new item.   See dojo/data/api/Write for details on args.
			//		Used in drag & drop when item from external source dropped onto tree.
			if(parent === this.root){
				this.onNewRootItem(args);
				return this.store.newItem(args);
			}else{
				var pInfo = {
					parent: parent,
					attribute: this.childrenAttrs[0]
				}, LnewItem;

				if(this.newItemIdAttr && args[this.newItemIdAttr]){
					// Maybe there's already a corresponding item in the store; if so, reuse it.
					this.fetchItemByIdentity({
						identity: args[this.newItemIdAttr],
						scope: this,
						onItem: function(item){
							if(item){
								// There's already a matching item in store, use it
								this.pasteItem(item, null, parent, true, insertIndex);
							}else{
								// Create new item in the tree, based on the drag source.
								LnewItem=this.store.newItem(args, pInfo);
								if(LnewItem && (insertIndex != undefined)){
									// Move new item to desired position
									this.pasteItem(LnewItem, parent, parent, false, insertIndex);
								}
							}
						}
					});
				}else{
					// [as far as we know] there is no id so we must assume this is a new item
					LnewItem = this.store.newItem(args, pInfo);
					if(LnewItem && (insertIndex != undefined)){
						// Move new item to desired position
						this.pasteItem(LnewItem, parent, parent, false, insertIndex);
					}
				}
			}
		},
		pasteItem: function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem, /*Boolean*/ bCopy, /*int?*/ insertIndex){
			// summary:
			//		Move or copy an item from one parent item to another.
			//		Used in drag & drop
			var store = this.store,
				parentAttr = this.childrenAttrs[0];	// name of "children" attr in parent item
			if(oldParentItem === this.root){
				if(!bCopy){
					// It's onLeaveRoot()'s responsibility to modify the item so it no longer matches
					// this.query... thus triggering an onChildrenChange() event to notify the Tree
					// that this element is no longer a child of the root node
					this.onLeaveRoot(childItem);
				}
			}else{
				// remove child from source item, and record the attribute that child occurred in
				rias.forEach(this.childrenAttrs, function(attr){
					if(store.containsValue(oldParentItem, attr, childItem)){
						if(!bCopy){
							var values = rias.filter(store.getValues(oldParentItem, attr), function(x){
								return x !== childItem;
							});
							store.setValues(oldParentItem, attr, values);
						}
						parentAttr = attr;
					}
				});
			}
			if(newParentItem === this.root){
				// It's onAddToRoot()'s responsibility to modify the item so it matches
				// this.query... thus triggering an onChildrenChange() event to notify the Tree
				// that this element is now a child of the root node
				this.onAddToRoot(childItem);
			}else{
				// modify target item's children attribute to include this item
				if(typeof insertIndex === "number"){
					// call slice() to avoid modifying the original array, confusing the data store
					var childItems = store.getValues(newParentItem, parentAttr).slice();
					childItems.splice(insertIndex, 0, childItem);
					store.setValues(newParentItem, parentAttr, childItems);
				}else{
					store.setValues(newParentItem, parentAttr,
						store.getValues(newParentItem, parentAttr).concat(childItem));
				}
			}
		},

		onChange: function(/*dojo/data/Item*/ /*===== item =====*/){
			// summary:
			//		Callback whenever an item has changed, so that Tree
			//		can update the label, icon, etc.   Note that changes
			//		to an item's children or parent(s) will trigger an
			//		onChildrenChange() so you can ignore those changes here.
			// tags:
			//		callback
		},
		onChildrenChange: function(/*===== parent, newChildrenList =====*/){
			// summary:
			//		Callback to do notifications about new, updated, or deleted items.
			// parent: dojo/data/Item
			// newChildrenList: dojo/data/Item[]
			// tags:
			//		callback
		},
		onDelete: function(/*dojo/data/Item*/ /*===== item =====*/){
			// summary:
			//		Callback when an item has been deleted.
			// description:
			//		Note that there will also be an onChildrenChange() callback for the parent
			//		of this item.
			// tags:
			//		callback
		},

		_requeryTop: function(){
			// reruns the query for the children of the root node,
			// sending out an onSet notification if those children have changed
			var oldChildren = this.root.children || [];
			this.store.fetch({
				query: this.query,
				onComplete: rias.hitch(this, function(newChildren){
					this.root.children = newChildren;

					// If the list of children or the order of children has changed...
					if(oldChildren.length !== newChildren.length ||
						rias.some(oldChildren, function(item, idx){ return newChildren[idx] !== item;})){
						this.onChildrenChange(this.root, newChildren);
					}
				})
			});
		},
		onNewItem: function(/* dojo/data/api/Item */ item, /* Object */ parentInfo){
			// summary:
			//		Handler for when new items appear in the store.  Developers should override this
			//		method to be more efficient based on their app/data.
			// description:
			//		Note that the default implementation requeries the top level items every time
			//		a new item is created, since any new item could be a top level item (even in
			//		addition to being a child of another item, since items can have multiple parents).
			//
			//		If developers can detect which items are possible top level items (based on the item and the
			//		parentInfo parameters), they should override this method to only call _requeryTop() for top
			//		level items.  Often all top level items have parentInfo==null, but
			//		that will depend on which store you use and what your data is like.
			// tags:
			//		extension
			this._requeryTop();

			if(!parentInfo){
				return;
			}

			// Call onChildrenChange() on parent (ie, existing) item with new list of children
			// In the common case, the new list of children is simply parentInfo.newValue or
			// [ parentInfo.newValue ], although if items in the store has multiple
			// child attributes (see `childrenAttr`), then it's a superset of parentInfo.newValue,
			// so call getChildren() to be sure to get right answer.
			this.getChildren(parentInfo.item, rias.hitch(this, function(children){
				this.onChildrenChange(parentInfo.item, children);
			}));
		},
		onDeleteItem: function(/*Object*/ item){
			// summary:
			//		Handler for delete notifications from underlying store

			// check if this was a child of root, and if so send notification that root's children
			// have changed
			if(rias.indexOf(this.root.children, item) !== -1){
				this._requeryTop();
			}

			this.onDelete(item);
		},
		onSetItem: function(/* item */ item,
							/* attribute-name-string */ attribute,
							/* Object|Array */ oldValue,
							/* Object|Array */ newValue){
			// summary:
			//		Updates the tree view according to changes to an item in the data store.
			//		Developers should override this method to be more efficient based on their app/data.
			// description:
			//		Handles updates to an item's children by calling onChildrenChange(), and
			//		other updates to an item by calling onChange().
			//
			//		Also, any change to any item re-executes the query for the tree's top-level items,
			//		since this modified item may have started/stopped matching the query for top level items.
			//
			//		If possible, developers should override this function to only call _requeryTop() when
			//		the change to the item has caused it to stop/start being a top level item in the tree.
			// tags:
			//		extension

			this._requeryTop();

			if(rias.indexOf(this.childrenAttrs, attribute) !== -1){
				// item's children list changed
				this.getChildren(item, rias.hitch(this, function(children){
					// See comments in onNewItem() about calling getChildren()
					this.onChildrenChange(item, children);
				}));
			}else{
				// item's label/icon/etc. changed.
				this.onChange(item);
			}
		}
	});

	Widget.buildParams = function(params){
		params = rias.mixinDeep({}, {
			rootId: "$root$",
			rootLabel: "ROOT",
			labelType: "html",
			childrenAttrs: ["children"]
		}, params);

		if(!params.store){
			params.store = {
				_riaswType: "riasw.store.JsonXhrStore"
			};
		}
		if(params.target){
			params.store.target = params.target;
			//delete params.target;
		}
		if(!params.store._riaswType){
			params.store._riaswType = params.store.target ? "riasw.store.JsonXhrStore" : "riasw.store.MemoryStore";
		}
		if(params.idProperty){
			params.store.idProperty = params.idProperty;
			//delete params.idProperty;
		}
		if(params.labelProperty){
			params.store.labelProperty = params.labelProperty;
			//delete params.labelProperty;
		}
		return params;
	};
	Widget._riasdMeta = {
		visual: false,
		"property": {
			"store": {
				"datatype": "object",
				"title": "Data Store"
			},
			"childrenAttrs": {
				"datatype": "array",
				"defaultValue": "[\"children\"]",
				"title": "Children Attributes"
			},
			"query": {
				"datatype": "json",
				"title": "Query"
			},
			"rootId": {
				"datatype": "string",
				"defaultValue": "$root$",
				"title": "Root ID"
			},
			"rootLabel": {
				"datatype": "string",
				"defaultValue": "ROOT",
				"title": "Root Label"
			},
			"labelAttr": {
				"datatype": "string",
				"description": "If specified, get label for tree node from this attribute, rather\nthan by calling store.getLabel()",
				"hidden": false
			}
		}
	};

	return Widget;

});