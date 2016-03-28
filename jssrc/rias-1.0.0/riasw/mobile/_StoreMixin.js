
//RIAStudio client runtime widget - RoundRectStoreList

define([
	"rias",
	"dojox/mobile/_StoreMixin"
], function(rias, Widget){

	//var Widget = rias.getObject("dojox.mobile._StoreMixin");
	Widget.extend({

		autoRefresh: true,

		setStore: function(/*dojo/store/api/Store*/store, /*Object*/query, /*Object*/queryOptions){
			// summary:
			//		Sets the store to use with this widget.
			if(store === this.store){ return null; }
			if(store){
				store.getValue = function(item, property){
					return item[property];
				};
			}
			this.store = store;
			this._setQuery(query, queryOptions);
			return (this.autoRefresh === false ? null : this.refresh());
		},

		setQuery: function(/*Object*/query, /*Object*/queryOptions){
			this._setQuery(query, queryOptions);
			return (this.autoRefresh === false ? null : this.refresh());
		}

	});

	return Widget;

});
