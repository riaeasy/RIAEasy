//RIAStudio client runtime widget - TreeModel

define([
	"rias",
	"rias/riasw/store/StoreBase",
	"rias/riasw/store/ObjectStore",
	"dijit/tree/ForestStoreModel",
	"dijit/tree/TreeStoreModel"
], function(rias, StoreBase, ObjectStore, ForestStoreModel, Model) {

	Model._meta.ctor = function(params){
	};
	Model.extend({
		postCreate: function(/*Object?*/params){
			//rias.mixin(this, params);

			this.connects = [];

			var store = this.store;
			//delete params.store;
			if(!store.getFeatures && rias.isInstanceOf(store, StoreBase)){
				this.store = new ObjectStore({
					ownerRiasw: store,
					idProperty: store.idAttribute || "id",
					labelProperty: store.labelAttribute || "label",
					objectStore: store
				});
			}
			if(!this.store.getFeatures()['dojo.data.api.Identity']){
				throw new Error("dijit.tree.TreeStoreModel: store must support dojo.data.Identity");
			}

			// if the store supports Notification, subscribe to the notification events
			if(this.store.getFeatures()['dojo.data.api.Notification']){
				this.connects = this.connects.concat([
					rias.after(this.store, "onNew", rias.hitch(this, "onNewItem"), true),
					rias.after(this.store, "onDelete", rias.hitch(this, "onDeleteItem"), true),
					rias.after(this.store, "onSet", rias.hitch(this, "onSetItem"), true)
				]);
			}
			this.inherited(arguments);
		}
	});

	var riasType = "rias.riasw.widget.TreeModel";

	var Widget = rias.declare(riasType, [rias.ObjectBase, ForestStoreModel], {

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

		getChildren: function(/*dojo.data.Item*/parentItem, /*function(items, size)*/onComplete, /*function*/ onError, /*Object*/queryObj){
			var self = this;
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
						query: self.query,
						onBegin: function(size){
							self.root.size = size;
						},
						onComplete: function(items){
							onComplete(items, queryObj, self.root.size);
						},
						onError: onError
					});
				}else{
					var store = self.store;
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
					if(self.store && self.store.serverStore && !self._isChildrenLoaded(parentItem)){
						self.childrenSize = 0;
						self.store.fetch({
							start: start,
							count: count,
							sort: sort,
							query: rias.mixin({parentId: parentId}, self.query || {}),
							onBegin: function(size){
								self.childrenSize = size;
							},
							onComplete: function(items){
								onComplete(items, queryObj, self.childrenSize);
							},
							onError: onError
						});
					}else{
						self.inherited(arguments);
					}
				}
			}else{
				self.inherited(arguments);
			}
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

		//overwritten
		onNewItem: function(item, parentInfo){ },

		onDeleteItem: function(item){ }
	});

	Widget._riasdMeta = {
		visual: false,
		iconClass: "riaswTreeModelIcon",
		iconClass16: "riaswTreeModelIcon16",
		defaultParams: function(params){
			params = rias.mixinDeep({}, {
				rootId: "$root$",
				rootLabel: "ROOT",
				labelType: "html",
				childrenAttrs: ["children"],
				deferItemLoadingUntilExpand: true
			}, params);
			if(!params.store){
				params.store = {
					_riaswType: "rias.riasw.store.JsonRestStore"
				}
			}
			if(params.idAttribute){
				params.store.idAttribute = params.idAttribute;
				//delete params.idAttribute;
			}
			if(params.labelAttribute){
				params.store.labelAttribute = params.labelAttribute;
				//delete params.labelAttribute;
			}
			if(params.target){
				params.store.target = params.target;
				//delete params.target;
			}
			return params;
		},
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