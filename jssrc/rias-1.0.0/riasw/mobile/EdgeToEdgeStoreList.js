
//RIAStudio client runtime widget - EdgeToEdgeStoreList

define([
	"rias",
	"dojox/mobile/EdgeToEdgeStoreList",
	"rias/riasw/mobile/ListItem",
	///"rias/riasw/mobile/_StoreMixin", //貌似 mixin 的类，修改基类不起作用，改为直接在这里 覆盖
	"dojox/mobile/_EditableListMixin",
	"rias/riasw/mobile/EdgeToEdgeList"
], function(rias, _Widget, ListItem){

	rias.theme.loadRiasCss([
		"EdgeToEdgeList.css"
	], true);

	var riasType = "rias.riasw.mobile.EdgeToEdgeStoreList";
	var Widget = rias.declare(riasType, [_Widget], {

		itemRenderer: ListItem,
		pageSize: 0,
		pagePosition: 0,

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
		},

		clear: function(){
			this._items = [];
			this.pagePosition = 0;
			this.destroyDescendants();
		},

		generateList: function(/*Array*/items){
			this.inherited(arguments);
		},
		generateListNext: function(){
			this.append = false;
			if(this.pageSize > 0){
				this.pagePosition = this.pagePosition >= 0 ? this.pagePosition : 0;
				if(this.pagePosition + this.pageSize < this._items.length){
					this.pagePosition += this.pageSize;
					this.generateList(this._items.slice(
						this.pagePosition,
						this.pagePosition + this.pageSize
					));
				}
			}else{
				this.generateList(this._items);
			}
		},
		generateListPrior: function(){
			this.append = false;
			if(this.pageSize > 0){
				this.pagePosition = this.pagePosition >= 0 ? this.pagePosition : 0;
				if(this.pagePosition >= this.pageSize){
					this.pagePosition -= this.pageSize;
					if(this.pagePosition < 0){
						this.pagePosition = 0;
					}
					this.generateList(this._items.slice(
						this.pagePosition,
						this.pagePosition + this.pageSize
					));
				}
			}else{
				this.generateList(this._items);
			}
		},
		onComplete: function(/*Array*/items){
			// summary:
			//		A handler that is called after the fetch completes.
			this._items = items;
			this.pagePosition = 0;
			if(this.pageSize > 0){
				items = this._items.slice(0, this.pageSize);
			}
			//this.inherited("onComplete", arguments, [items]);
			this.generateList(items);
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswEdgeToEdgeListIcon",
		iconClass16: "riaswEdgeToEdgeListIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
