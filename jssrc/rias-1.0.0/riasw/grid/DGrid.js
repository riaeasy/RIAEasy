
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

	var riasType = "rias.riasw.grid.DGrid";
	var Widget = rias.declare(riasType, [_WidgetBase, OnDemandGrid, SummaryFooter,
		ColumnResizer, ColumnHider, ColumnReorder, CompoundColumns, ColumnSet, //Pagination,
		Keyboard, Selection, Selector, Editor, Tree], {

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
		},

		/*_move: function (item, steps, targetClass, visible) {
			var nextSibling, current, element;
			// Start at the element indicated by the provided row or cell object.
			element = current = item.element;
			steps = steps || 1;

			do {
				// Outer loop: move in the appropriate direction.
				if ((nextSibling = current[steps < 0 ? 'previousSibling' : 'nextSibling'])) {
					do {
						// Inner loop: advance, and dig into children if applicable.
						current = nextSibling;
						///TODO:zensst. 跳过部分 cell
						if (current && (current.className + ' ').indexOf(targetClass + ' ') > -1) {
							// Element with the appropriate class name; count step, stop digging.
							element = current;
							steps += steps < 0 ? 1 : -1;
							break;
						}
						// If the next sibling isn't a match, drill down to search, unless
						// visible is true and children are hidden.
					} while ((nextSibling = (!visible || !current.hidden) &&
						current[steps < 0 ? 'lastChild' : 'firstChild']));
				}
				else {
					current = current.parentNode;
					if (!current || current === this.bodyNode || current === this.headerNode) {
						// Break out if we step out of the navigation area entirely.
						break;
					}
				}
			}while (steps);
			// Return the final element we arrived at, which might still be the
			// starting element if we couldn't navigate further in that direction.
			return element;
		},*/
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
			return this.cell(this._move(cell, -(steps || 1), this.canEdit ? "dgrid-cell-canedit" : 'dgrid-cell'));
		},
		right: function (cell, steps) {
			/// 需要覆盖 ColumnHider.right
			var self = this;
			function _next(c, s) {
				if (!c.element) {
					c = self.cell(c);
				}
				return self.cell(self._move(c, s || 1, self.canEdit ? "dgrid-cell-canedit" : 'dgrid-cell'));
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