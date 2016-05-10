
//RIAStudio client runtime widget - DGrid

define([
	"rias",
	"rias/riasw/grid/DGridBase",
	"rias/riasw/grid/dgrid/_Store",
	"rias/riasw/grid/dgrid/SummaryFooter",
	"rias/riasw/grid/DGridParamExt",

	//"dgrid/util/misc",
	//"dojo/has!touch?dgrid/util/touch",
	"dgrid/List",
	"dgrid/Grid",
	"dgrid/OnDemandGrid",
	"dgrid/CellSelection",
	"dgrid/ColumnSet",
	"dgrid/Editor",
	"dgrid/Keyboard",
	"dgrid/Selection",
	"dgrid/Selector",
	"dgrid/Tree",
	//"dgrid/GridFromHtml",
	//"dgrid/GridWithColumnSetsFromHtml",
	"dgrid/extensions/ColumnHider",
	"dgrid/extensions/ColumnResizer",
	"dgrid/extensions/ColumnReorder",
	"dgrid/extensions/CompoundColumns",
	//"dgrid/extensions/DijitRegistry",
	//"dgrid/extensions/Dnd",
	//"dgrid/extensions/Pagination",

	"dstore/Trackable"

], function(rias, DGridBase, _Store, SummaryFooter, DGridParamExt,
            //misc, touchUtil,
            List, Grid, OnDemandGrid, CellSelection, ColumnSet, Editor, Keyboard, Selection, Selector, Tree,
            //GridFromHtml, GridWithColumnSetsFromHtml,
            ColumnHider, ColumnResizer, ColumnReorder, CompoundColumns, //DijitRegistry, //Dnd, //Pagination,
            Trackable) {

	var _WidgetBase = rias.getObject("dijit._WidgetBase");

	var riasType = "rias.riasw.grid.DGrid";
	var Widget = rias.declare(riasType, [_WidgetBase, OnDemandGrid, SummaryFooter,
		ColumnResizer, ColumnHider, ColumnReorder, CompoundColumns, ColumnSet, //Pagination,
		Keyboard, Selection, Selector, Editor, Tree], {

		_loadingMessage: "<span class='riaswModuleLoading'><span class='dijitInline riaswModuleLoadingIcon'></span>${0}</span>",
		_errorMessage: "<span class='riaswModuleLoading'><span class='dijitInline riaswModuleLoadingError'></span>${0}</span>",
		loadingMessage: rias.i18n.message.loading,
		errorMessage: rias.i18n.message.loadError,

		postMixInProperties: function(){
			this.loadingMessage = rias.substitute(this._loadingMessage, [this.loadingMessage]);
			this.errorMessage = rias.substitute(this._errorMessage, [this.errorMessage]);
			this.inherited(arguments);
		},
		postCreate: function(){
			var self = this;

			this.inherited(arguments);

			/// Keyboard.postCreate 太长，改在这里 on
			this.own(rias.on(this.domNode, "dgrid-refresh-complete", function(evt){
				self.afterRefresh(evt);
			}), rias.on(this.domNode, "dgrid-cellfocusin", function(evt){
				self.onCellFocusin(evt);
			}), rias.on(this.domNode, "dgrid-cellfocusout", function(evt){
				self.onCellFocusout(evt);
			}));

		},
		afterRefresh: function(){
		},
		onCellFocusin: function(){
		},
		onCellFocusout: function(){
		},
		_createHeaderRowCell: function (cellElement, column) {
			if(column._riasrRowNumColumn){
				this._riasrRowNumColumn = column;
			}else if(column._riasrOpColumn){
				this._riasrOpColumn = column;
			}else if(column._riasrSelectorColumn){
				this._riasrSelectorColumn = column;
			}
			this.inherited(arguments);
		},
		renderHeader: function () {
			this._riasrRowNumColumn = undefined;
			this._riasrOpColumn = undefined;
			this._riasrSelectorColumn = undefined;
			this.inherited(arguments);
			rias.dom.place(this.hiderToggleNode, this.headerNode);
		},

		_setCollection: function (collection) {
			var queryObject = collection.queryObject;
			if(!collection.fetchRange){
				collection = new _Store({
					idAttribute: collection.idAttribute,
					labelAttribute: collection.labelAttribute,
					objectStore: collection
				});
			}
			collection.queryObject = queryObject;
			if(!collection.track){
				collection = Trackable.create(collection);
			}
			if(!collection.idAttribute){
				collection.idAttribute = "id";
			}
			if(!collection.labelAttribute){
				collection.labelAttribute = "label";
			}
			this.inherited(arguments);
		},
		//getStore: function(){
		//	return this.collection && this.collection.objectStore ? this.collection.objectStore : this.collection;
		//},
		refresh: function(query){
			var self = this,
				store = this.collection;
			if(query){
				this._queryObject0 = query;
			}
			store.queryObject = rias.mixinDeep({}, this._queryObject0);

			rias.when(this.inherited(arguments), function(){
				var summary = {
					rownum: rias.toNumber(self._total, 0)
				};
				if(store){
					if(store.getSummary){
						summary = rias.mixin(summary, store.getSummary());
					}
				}
				self.set('summary', summary);
			});
		},

		resize: function(changeSize, resultSize){
			var box = this.inherited(arguments);
			if(box && box.h){
				this.farOffRemoval = rias.min(box.h, 2000);
			}
			return box;
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswGridIcon",
		iconClass16: "riaswGridIcon16",
		defaultParams: function(params, module){
			return rias.when(DGridParamExt(params, module), function(p){
				return rias.mixinDeep({
					indent: 1,
					inline: true,
					listType: "grid",
					cellNavigation: true,
					tabableHeader: true,
					showHeader: true,
					showFooter: true,

					minRowsPerPage: 25,
					maxRowsPerPage: 250,
					maxEmptySpace: Infinity,
					bufferRows: 10,
					farOffRemoval: 1000,
					queryRowsOverlap: 0,
					pagingMethod: 'debounce',
					pagingDelay: 50,
					//rowsPerPage: 25,
					//pagingLinks: 3,
					//keepCurrentPage: true,
					keepScrollPosition: true,
					deselectOnRefresh: false,
					rowHeight: 0,

					collection: null
				}, p);
			});
		},
		initialSize: {},
		"property": {
		}
	};

	return Widget;

});