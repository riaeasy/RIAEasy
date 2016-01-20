//RIAStudio client runtime widget - StoreBase

define([
	"rias",
	"dojo/store/Cache",
	"dojo/store/Observable",
	"dojo/store/util/QueryResults"
], function(rias, Cache, Observable, QueryResults) {

	rias.getObject("rias.riasw.store", true);
	rias.riasw.store.Cache = Cache;
	rias.riasw.store.Observable = Observable;

	var riasType = "rias.riasw.store.StoreBase";
	var Widget = rias.declare(riasType, [rias.ObjectBase], {

		childrenAttribute: 'children',

		postCreate: function(args) {
			this.clearOnClose = true;
			this.idProperty = args.idAttribute || "id";
			this.labelProperty = args.labelAttribute || "id";
			///FIXME:zensst. Observable 是委托出来的 store，需要修改。
			Observable(this);
			/*results.observe(function(object, removedFrom, insertedInto){
				if(removedFrom == -1){
					self.onNew(object);
				}
				else if(insertedInto == -1){
					self.onDelete(object);
				}else{
					for(var i in object){
						if(i != self.objectStore.idProperty){
							self.onSet(object, i, null, object[i]);
						}
					}
				}
			});*/
			if(this.isTreeStore){
				delete this.isTreeStore;
				this.childrenAttribute = (this.childrenAttribute ? this.childrenAttribute : "children");
				this.hasChildren = function(id, item){
					var c = item ? item[this.childrenAttribute] : undefined;
					c = rias.isNumber(c) ? c : c ? c.length : 0;
					return (c > 0);
				};
				this.getChildren = function(item, options){
					var self = this,
						d = rias.newDeferred();
					if(options){
						var start = options.start || 0,
							count = options.count,
							parentId = options.parentId,
							sort = options.sort;

						if(rias.isArray(item.children)){
							d.resolve(item.children);
						}else if(rias.isNumber(item.children) && item.children > 0){
							if(self.fetch){
								self.fetch({
									start: start,
									count: count,
									sort: sort,
									query: rias.mixin({parentId: parentId}, this.query || {}),
									onBegin: function(size){
										item.children = size;
									},
									onComplete: function(items){
										d.resolve(items);
									},
									onError: options.onError
								});
							}else{
								rias.when(this.query(rias.mixin({parentId: parentId}, this.query || {}), options), function(items){
									item.children = items.length;
									d.resolve(items);
								}, options.onError);
							}
						}else{
							d.resolve([]);
						}
					}else{
						d.resolve([]);
					}
					return d;
				};
			}
		}

	});

	return Widget;

});