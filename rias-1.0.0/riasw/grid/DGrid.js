
//RIAStudio client runtime widget - DGrid

define([
	"rias",
	"rias/riasw/grid/DGridBase",
	"rias/riasw/grid/dgrid/_Store",
	"rias/riasw/grid/dgrid/SummaryFooter",
	"rias/riasw/grid/DGridParamExt",
	"rias/riasw/store/Cache",
	"rias/riasw/store/MemoryStore",

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

], function(rias, DGridBase, _Store, SummaryFooter, DGridParamExt, Cache, Memory,
			//misc, touchUtil,
			List, Grid, OnDemandGrid, CellSelection, ColumnSet, Editor, Keyboard, Selection, Selector, Tree,
			//GridFromHtml, GridWithColumnSetsFromHtml,
			ColumnHider, ColumnResizer, ColumnReorder, CompoundColumns, //DijitRegistry, //Dnd, //Pagination,
			Trackable) {

	var _WidgetBase = rias.getObject("dijit._WidgetBase");

	var riaswType = "rias.riasw.grid.DGrid";
	var Widget = rias.declare(riaswType, [_WidgetBase, OnDemandGrid,
		ColumnResizer, ColumnHider, ColumnReorder, CompoundColumns, ColumnSet, //Pagination,
		Keyboard, Selection, Selector, Editor, Tree, SummaryFooter], {

		_loadingMessage: "<span class='riaswModuleLoading'><span class='dijitInline riaswModuleLoadingIcon'></span>${0}</span>",
		_errorMessage: "<span class='riaswModuleLoading'><span class='dijitInline riaswModuleLoadingError'></span>${0}</span>",
		loadingMessage: rias.i18n.message.loading,
		errorMessage: rias.i18n.message.loadError,

		showRowNum: true,

		postMixInProperties: function(){
			this.loadingMessage = rias.substitute(this._loadingMessage, [this.loadingMessage]);
			this.errorMessage = rias.substitute(this._errorMessage, [this.errorMessage]);
			this.inherited(arguments);
		},
		postCreate: function(){
			var self = this;

			this.inherited(arguments);

			//self._initAttr(["canEdit"]);

			/// Keyboard.postCreate 太长，改在这里 on
			this.own(rias.on(this.domNode, "dgrid-refresh-complete", function(evt){
				self.afterRefresh(evt);
			}), rias.on(this.domNode, "dgrid-cellfocusin", function(evt){
				self.onCellFocusin(evt);
			}), rias.on(this.domNode, "dgrid-cellfocusout", function(evt){
				self.onCellFocusout(evt);
			}));

		},

		_setModifiedAttr: function(value){
			value = !!value;
			if(!value && !rias.isEmpty(this.dirty)){
				console.error(this.id + ".modified cannot set to false with dirty.");
			}
			this._set("modified", value || !rias.isEmpty(this.dirty));
		},
		_setCanEditAttr: function(value){
			value = !!value;
			if(value){
				this.refresh();
			}else if(!rias.isEmpty(this.dirty)){
				console.error(this.id + ".canEdit cannot set to false with dirty.");
			}
			this._set("canEdit", value || !rias.isEmpty(this.dirty));
		},
		onSaveError: function(items){
			rias.error(this.id + " save error. The error dirty:\n" + rias.toJson(items));
		},
		_onSaveError: function(items){
			console.error(this.id + " save error. The error dirty:\n", items);
			this.onSaveError(items);
		},
		afterSave: function(results){
		},
		_afterSave: function(results){
			this.afterSave(results);
		},
		doSave: function(){
			var self = this;
			return self._trackError('save').always(function(results){
				console.debug(self.id + ".save results:\n", results);
				///这里先设置 modified，可能在 afterSave 中会使用。
				if(rias.isEmpty(self.dirty)){
					self.set("modified", false);
				}else{
					self.set("modified", true);
					self._onSaveError(self.dirty);
				}
				self._afterSave(results);
				return results;
			});
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
			//rias.dom.place(this.hiderToggleNode, this.headerNode);
		},

		_setCollection: function (collection) {
			var queryObject = collection.queryObject;
			if(!collection.fetchRange){
				collection = new _Store({
					idAttribute: collection.idAttribute,
					labelAttribute: collection.labelAttribute,
					objectStore: this.caching ? Cache(collection, new Memory({
						ownerRiasw: this,
						idAttribute: collection.idAttribute,
						labelAttribute: collection.labelAttribute
					})) : collection
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
			if(self._renderedCollection){
				self._renderedCollection.queryObject = store.queryObject;
			}

			return rias.when(this.inherited(arguments)).then(function(){
				var summary = {
					rownum: rias.toNumber(self._total, 0)
				};
				if(store){
					if(store.getSummary){
						summary = rias.mixin(summary, store.getSummary());
					}
				}
				self.set('summary', summary);
			}, function(){

			});
		},

		resize: function(changeSize, resultSize){
			var box = this.inherited(arguments);
			if(box && box.h){
				this.farOffRemoval = rias.min(box.h, 2000);
			}
			return box;
		},

		up: function (row, steps, visible) {
			if (!row.element) {
				row = this.row(row);
			}
			return this.row(this._move(row, -(steps || 1), 'dgrid-row', visible));
		},
		down: function (row, steps, visible) {
			if (!row.element) {
				row = this.row(row);
			}
			return this.row(this._move(row, steps || 1, 'dgrid-row', visible));
		},
		left: function (cell, steps) {
			if (!cell.element) {
				cell = this.cell(cell);
			}
			return this.cell(this._move(cell, -(steps || 1), this.get("canEdit") ? "dgrid-cell-canedit" : 'dgrid-cell'));
		},
		right: function (cell, steps) {
			/// 需要覆盖 ColumnHider.right
			var self = this;
			function _next(c, s) {
				if (!c.element) {
					c = self.cell(c);
				}
				return self.cell(self._move(c, s || 1, self.get("canEdit") ? "dgrid-cell-canedit" : 'dgrid-cell'));
			}
			if (!cell.element) {
				cell = this.cell(cell);
			}
			var nextCell = _next(cell, steps),
				prevCell = cell;

			// Skip over hidden cells
			while (nextCell.column.hidden) {
				nextCell = _next(nextCell, steps > 0 ? 1 : -1);
				if (prevCell.element === nextCell.element) {
					// No further visible cell found - return original
					return cell;
				}
				prevCell = nextCell;
			}
			return nextCell;
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

					getBeforePut: false,
					adjustLastColumn: false,

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