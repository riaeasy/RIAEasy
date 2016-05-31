
//RIAStudio client runtime widget - DGrid


/// ///dgrid.ColumnSet._putScroller 中 grid._listeners.push(on)
/// ///dgrid.Editor._createEditor 中 grid._listeners.push(on)
/// ///dgrid.Keyboard.postCreate 中 grid._listeners.push(on)
/// ///dgrid.OnDemandList.postCreate 中 grid._listeners.push(on)
/// ///dgrid.Selection._initSelectionEvents 中 grid._listeners.push(on)
/// ///dgrid.Tree.expand 中 grid._listeners.push(on)

define([
	"rias",

	"dgrid/List",
	"dgrid/Grid",
	"dgrid/_StoreMixin",
	"dgrid/OnDemandList",
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
	"dgrid/extensions/DnD",
	//"dgrid/extensions/Pagination",

	"dgrid/util/misc",
	"dojo/has!touch?dgrid/util/touch"

], function(rias,
			List, Grid, _StoreMixin,
			OnDemandList, OnDemandGrid, CellSelection, ColumnSet, Editor, Keyboard, Selection, Selector, Tree,
			//GridFromHtml, GridWithColumnSetsFromHtml,
			ColumnHider, ColumnResizer, ColumnReorder, CompoundColumns, //DijitRegistry, Dnd, Pagination,
			DnD,
			miscUtil, touchUtil) {

	var _WidgetBase = rias.getObject("dijit._WidgetBase");
	var autoId = 0;
	function generateId() {
		return "riaswDGrid_" + autoId++;
	}

	rias.theme.loadRiasCss([
		"grid/dgrid/dgrid.css",
		"grid/dgrid/dgridskin.css"
	], false, function(){
		rias.theme.addCssRule('.dgrid-scrollbar-width', 'width: ' + rias.theme.scrollbarWidth + 'px');
		rias.theme.addCssRule('.dgrid-scrollbar-height', 'height: ' + rias.theme.scrollbarHeight + 'px');

		if (rias.theme.scrollbarWidth !== 17) {
			// for modern browsers, we can perform a one-time operation which adds
			// a rule to account for scrollbar width in all grid headers.
			rias.theme.addCssRule('.dgrid-header-row', 'right: ' + rias.theme.scrollbarWidth + 'px');
			rias.theme.addCssRule('.dgrid-footer-summary-row', 'right: ' + rias.theme.scrollbarWidth + 'px');
			// add another for RTL grids
			rias.theme.addCssRule('.dgrid-rtl-swap .dgrid-header-row', 'left: ' + rias.theme.scrollbarWidth + 'px');
			rias.theme.addCssRule('.dgrid-rtl-swap .dgrid-footer-summary-row', 'left: ' + rias.theme.scrollbarWidth + 'px');
		}
	});

	miscUtil.addCssRule = function(selector, css){
		return rias.theme.addCssRule(selector, css);
	};

	_StoreMixin.extend({
		refreshOnSetCollection: true,

		_setCollection: function (collection) {
			// summary:
			//		Assigns a new collection to the list/grid, sets up tracking
			//		if applicable, and tells the list/grid to refresh.

			if (this._renderedCollection) {
				this.cleanup();
				this._cleanupCollection({
					// Only clear the dirty hash if the collection being used is actually from a different store
					// (i.e. not just a re-sorted / re-filtered version of the same store)
					shouldRevert: !collection || collection.storage !== this._renderedCollection.storage
				});
			}

			this.collection = collection;

			// Avoid unnecessary rendering and processing before the grid has started up
			if (this._started) {
				// Once startup is called, List.startup sets the sort property which calls _StoreMixin._applySort
				// which sets the collection property again.  So _StoreMixin._applySort will be executed again
				// after startup is called.
				if (collection) {
					var renderedCollection = collection;
					if (this.sort && this.sort.length > 0) {
						renderedCollection = collection.sort(this.sort);
					}

					if (renderedCollection.track && this.shouldTrackCollection) {
						renderedCollection = renderedCollection.track();
						this._rows = [];

						this._observerHandle = this._observeCollection(
							renderedCollection,
							this.contentNode,
							{ rows: this._rows }
						);
					}

					this._renderedCollection = renderedCollection;
				}
				if(this.refreshOnSetCollection != false){
					this.refresh();
				}
			}
		},

		save: function () {
			///
			// Keep track of the store and puts
			var self = this,
				store = this.collection,
				dirty = this.dirty,
				dfd = rias.newDeferred(),
				results = {},
				getFunc = function (id) {
					// returns a function to pass as a step in the promise chain,
					// with the id variable closured
					var data;
					return (self.getBeforePut || !(data = self.row(id).data)) ?
						function () {
							return store.get(id);
						} :
						function () {
							return data;
						};
				};

			// function called within loop to generate a function for putting an item
			function putter(id, dirtyObj) {
				// Return a function handler
				return function (object) {
					///TODO:zensst.改为只提交 dirtyObj 的 dirtyField
					var colsWithSet = self._columnsWithSet,
						updating = self._updating,
						key, data;

					if (typeof object.set === 'function') {
						object.set(dirtyObj);
					} else {
						// Copy dirty props to the original, applying setters if applicable
						for (key in dirtyObj) {
							object[key] = dirtyObj[key];
						}
					}

					// Apply any set methods in column definitions.
					// Note that while in the most common cases column.set is intended
					// to return transformed data for the key in question, it is also
					// possible to directly modify the object to be saved.
					for (key in colsWithSet) {
						data = colsWithSet[key].set(object);
						if (data !== undefined) {
							object[key] = data;
						}
					}

					updating[id] = true;
					///强置 _idDirty
					object._idDirty = id;
					///需要刷新 row.data
					data = self.row(id).data;
					for (key in dirtyObj) {
						data[key] = dirtyObj[key];
					}
					// Put it in the store, returning the result/promise
					return store.put(object).then(function (result) {
						// Clear the item now that it's been confirmed updated
						delete dirty[id];
						delete updating[id];
						results[id] = result;
						return results;
					});
				};
			}

			var promise = dfd.then(function () {
				// Ensure empty object is returned even if nothing was dirty, for consistency
				return results;
			});

			// For every dirty item, grab the ID
			for (var id in dirty) {
				// Create put function to handle the saving of the the item
				var put = putter(id, dirty[id]);

				// Add this item onto the promise chain,
				// getting the item from the store first if desired.
				promise = promise.then(getFunc(id)).then(put);
			}

			// Kick off and return the promise representing all applicable get/put ops.
			// If the success callback is fired, all operations succeeded; otherwise,
			// save will stop at the first error it encounters.
			dfd.resolve();
			return promise;
		}

	});

	List.extend({

		postscript: function(/*Object?*/params, /*DomNode|String*/srcNodeRef){
			var grid = this;

			(this._Row = function (id, object, element) {
				this.id = id;
				this.data = object;
				this.element = element;
			}).prototype.remove = function () {
				grid.removeRow(this.element);
			};

			if (srcNodeRef) {
				// normalize srcNodeRef and store on instance during create process.
				// Doing this in postscript is a bit earlier than dijit would do it,
				// but allows subclasses to access it pre-normalized during create.
				this.srcNodeRef = srcNodeRef = srcNodeRef.nodeType ? srcNodeRef : byId(srcNodeRef);
			}

			///改为 inherited _WidgetBase
			this.inherited(arguments);
		},
		create: function (params, srcNodeRef) {
			///增加_introspect。以匹配 dijit._WidgetBase
			this._introspect();

			this.ownerDocument = this.ownerDocument || (srcNodeRef ? srcNodeRef.ownerDocument : rias.dom.doc);
			this.ownerDocumentBody = rias.dom.body(this.ownerDocument);
			var domNode = this.domNode = srcNodeRef || rias.dom.create('div'),
				cls;

			if (params) {
				this.params = params;
				rias.safeMixin(this, params);
				//rias.mixin(this, params);

				// Check for initial class or className in params or on domNode
				cls = params['class'] || params.className || domNode.className;
			}

			// ensure arrays and hashes are initialized
			this.sort = this.sort || [];
			this._listeners = [];
			this._rowIdToObject = {};

			this.postMixInProperties && this.postMixInProperties();

			// Apply id to widget and domNode,
			// from incoming node, widget params, or autogenerated.
			this.id = domNode.id = domNode.id || this.id || generateId();
			rias.registry.add(this);

			// Perform initial rendering, and apply classes if any were specified.
			this.buildRendering();
			if (cls) {
				//setClass.call(this, cls);
				rias.dom.replaceClass(this.domNode, cls, this._class || '');
				// Store for later retrieval/removal.
				this._class = cls;
			}

			if(this.domNode){
				// Copy attributes listed in attributeMap into the [newly created] DOM for the widget.
				// Also calls custom setters for all attributes with custom setters.
				///dgrid 自身处理了 params，不建议这里 _applyAttributes。
				//this._applyAttributes();///需要在 buildRendering 之后。

				// If srcNodeRef was specified, then swap out original srcNode for this widget's DOM tree.
				// For 2.0, move this after postCreate().  postCreate() shouldn't depend on the
				// widget being attached to the DOM since it isn't when a widget is created programmatically like
				// new MyWidget({}).	See #11635.
				var source = this.srcNodeRef;
				if(source && source.parentNode && this.domNode !== source){
					source.parentNode.replaceChild(this.domNode, source);
				}

			}
			// Note: for 2.0 may want to rename widgetId to dojo._scopeName + "_widgetId",
			// assuming that dojo._scopeName even exists in 2.0
			this.domNode.setAttribute("widgetId", this.id);
			this.postCreate(params);
			// remove srcNodeRef instance property post-create
			delete this.srcNodeRef;

			///匹配 dijit
			this._created = true;

			// to preserve "it just works" behavior, call startup if we're visible
			if (this.domNode.offsetHeight) {
				this.startup();
			}
		},
		buildRendering: function () {
			var domNode = this.domNode,
				addUiClasses = this.addUiClasses,
				self = this,
				headerNode,
				bodyNode,
				footerNode,
				isRTL;

			// Detect RTL on html/body nodes; taken from dojo/dom-geometry
			isRTL = this.isRTL = (rias.dom.docBody.dir || rias.dom.doc.documentElement.dir || rias.dom.docBody.style.direction).toLowerCase() === 'rtl';

			// Clear out className (any pre-applied classes will be re-applied via the
			// class / className setter), then apply standard classes/attributes
			domNode.className = '';

			domNode.setAttribute('role', 'grid');
			rias.dom.addClass(domNode, 'dgrid dgrid-' + this.listType + (addUiClasses ? ' ui-widget' : ''));

			///增加 topTools
			if(this.topTools){
				this.topToolsNode = this.topTools.domNode;
				rias.dom.place(this.topToolsNode, domNode, "first");
				rias.dom.addClass(this.topToolsNode, 'dgrid-header dgrid-header-tools' + (addUiClasses ? ' ui-widget-header' : ''));
			}
			// Place header node (initially hidden if showHeader is false).
			headerNode = this.headerNode = rias.dom.create('div', {
				className: 'dgrid-header dgrid-header-row' + (addUiClasses ? ' ui-widget-header' : '') + (this.showHeader ? '' : ' dgrid-header-hidden')
			}, domNode);

			bodyNode = this.bodyNode = rias.dom.create('div', {
				className: 'dgrid-scroller'
			}, domNode);

			// Firefox 4+ adds overflow: auto elements to the tab index by default;
			// force them to not be tabbable, but restrict this to Firefox,
			// since it breaks accessibility support in other browsers
			if (rias.has('ff')) {
				bodyNode.tabIndex = -1;
			}

			/*this.headerScrollNode = rias.dom.create('div', {
				className: 'dgrid-header dgrid-header-scroll dgrid-scrollbar-width' + (addUiClasses ? ' ui-widget-header' : '')
			}, domNode);*/

			// Place footer node (initially hidden if showFooter is false).
			footerNode = this.footerNode = rias.dom.create('div', {
				className: 'dgrid-footer' + (this.showFooter ? '' : ' dgrid-footer-hidden')
			}, domNode);

			if (isRTL) {
				domNode.className += ' dgrid-rtl' + (rias.has('dom-rtl-scrollbar-left') ? ' dgrid-rtl-swap' : '');
			}

			///增加 this._listeners.push(
			this._listeners.push(rias.on(bodyNode, 'scroll', function (event) {
				if (self.showHeader) {
					// keep the header aligned with the body
					headerNode.scrollLeft = event.scrollLeft || bodyNode.scrollLeft;
				}
				// re-fire, since browsers are not consistent about propagation here
				event.stopPropagation();
				rias.on.emit(domNode, 'scroll', {scrollTarget: bodyNode});
			}));
			this.configStructure();
			this.renderHeader();

			this.contentNode = this.touchNode = rias.dom.create('div', {
				className: 'dgrid-content' + (addUiClasses ? ' ui-widget-content' : '')
			}, this.bodyNode);

			// add window resize handler, with reference for later removal if needed
			///增加 this._listeners.push(
			this._listeners.push(this._resizeHandle = rias.dom.Viewport.on("resize", miscUtil.throttleDelayed(function(){
				if (this._started) {
					this.resize();
				}
			}, this)));

			///匹配 dijit
			/*if (this.baseClass) {
				var classes = this.baseClass.split(" ");
				if (!this.isLeftToRight()) {
					classes = classes.concat(rias.map(classes, function (name) {
						return name + "Rtl";
					}));
				}
				rias.dom.addClass(this.domNode, classes);
			}*/
			this.inherited(arguments);
		},
		postCreate: function () {
			///匹配 dijit
			this.inherited(arguments);
		},
		startup: function () {
			if (this._started) {
				return;
			}
			/// inherited _WidgetBase
			this.inherited(arguments);
			this._started = true;
			// apply sort (and refresh) now that we're ready to render
			this.set('sort', this.sort);
			var widget = this.getParent();
			// If we have a parent layout container widget, it will handle resize,
			// so remove the window resize listener added by List.
			///增加
			if (widget && widget.isLayoutContainer) {
				this._resizeHandle.remove();
			}
			this.resize();
		},
		destroy: function (preserveDom) {
			///增加 topTools
			if(this.topTools){
				rias.destroy(this.topTools);
			}
			// Remove any event listeners and other such removables
			if (this._listeners) { // Guard against accidental subsequent calls to destroy
				for (var i = this._listeners.length; i--;) {
					this._listeners[i].remove();
				}
				this._listeners = null;
			}

			///增加 inherited _WidgetBase
			this.inherited(arguments);

			this._started = false;
			this.cleanup();

			// destroy DOM
			///已经 inherited _WidgetBase
			//rias.dom.destroy(this.domNode);
		},

		get: function (/*String*/ name /*, ... */) {
			var fn = '_get' + name.charAt(0).toUpperCase() + name.slice(1);

			if (typeof this[fn] === 'function') {
				return this[fn].apply(this, [].slice.call(arguments, 1));
			}

			///允许使用 _getXXXAttr
			//if (!rias.has('dojo-built') && typeof this[fn + 'Attr'] === 'function') {
			//	console.warn('dgrid: Use ' + fn + ' instead of ' + fn + 'Attr for getting ' + name);
			//}
			return this.inherited(arguments);
		},
		set: function (/*String*/ name, /*Object*/ value /*, ... */) {
			if (typeof name === 'object') {
				for (var k in name) {
					this.set(k, name[k]);
				}
			}else {
				var fn = '_set' + name.charAt(0).toUpperCase() + name.slice(1);

				if (typeof this[fn] === 'function') {
					this[fn].apply(this, [].slice.call(arguments, 1));
				}else {
					///允许使用 _setXXXAttr
					//if (!rias.has('dojo-built') && typeof this[fn + 'Attr'] === 'function') {
					//	console.warn('dgrid: Use ' + fn + ' instead of ' + fn + 'Attr for setting ' + name);
					//}
					this.inherited(arguments);
				}
			}

			return this;
		},

		_internalResize: function(box){
			///增加
			//console.debug(this.id, box);
			rias.dom.setMarginBox(this.domNode, box);
			rias.dom.fixedNode(this.domNode, this.fixed || {});
			box = rias.dom.getMarginBox(this.domNode);
			return box;
		},
		resize: function (changeSize, resultSize) {
			///增加======================begin
			if(this.isDestroyed(true)){
				return;
			}
			var v,
				box;
			v = this._started && this.get("visible");
			if(!v){
				//this._needResize = true;
				this._changeSize = rias.mixin(this._changeSize, changeSize);
				this._resultSize = rias.mixin(this._resultSize, resultSize);
				return;
			}
			this._wasResized = true;
			box = resultSize || {};

			box = rias.mixin(this._changeSize, changeSize, box);
			this._changeSize = undefined;
			this._resultSize = undefined;

			box = this._internalResize(box);
			//this._needResize = undefined;
			///=============================end

			var bodyNode = this.bodyNode,
				headerNode = this.headerNode,
				footerSummaryNode = this.footerSummaryNode,
				footerNode = this.footerNode,
				headerHeight = headerNode.offsetHeight,
				footerHeight = this.showFooter ? footerNode.offsetHeight : 0;

			///修改，去掉 has('dom-scrollbar-width') 等
			if(this.headerScrollNode){
				this.headerScrollNode.style.top = (this.topToolsNode ? this.topToolsNode.offsetHeight : 0) + "px";
				this.headerScrollNode.style.height = headerHeight + "px";
			}
			if(footerSummaryNode){
				footerSummaryNode.style.bottom = footerHeight + "px";
				//this.footerSummaryScrollNode.style.bottom = footerHeight + "px";
				//this.footerSummaryScrollNode.style.height = footerSummaryNode.offsetHeight + "px";
			}

			//bodyNode.style.height = (this.domNode.clientHeight - rias.theme.scrollbarHeight
			//	- (this.topToolsNode ? this.topToolsNode.offsetHeight : 0)
			//	- headerHeight
			//	- (footerSummaryNode ? footerSummaryNode.offsetHeight : 0)
			//	- footerHeight) + 'px';
			bodyNode.style.marginTop = (this.topToolsNode ? headerHeight + this.topToolsNode.offsetHeight : headerHeight) + 'px';
			bodyNode.style.marginBottom = ((footerSummaryNode ? footerSummaryNode.offsetHeight : 0) + footerHeight) + 'px';

			///增加
			this.adjustVScroll();

			return box;
		},

		///增加
		adjustVScroll: function(){
			//rias.dom.toggleClass(this.headerScrollNode, "dgrid-scrollbar-width", !!this.bodyNode.style.overflow);
			if(this.contentNode.scrollHeight > this.contentNode.offsetHeight){
				rias.dom.visible(this.headerScrollNode, true);
				this.headerNode.style.right = "";
			}else{
				rias.dom.visible(this.headerScrollNode, false);
				this.headerNode.style.right = "0";
			}
		},
		renderArray: function (results, beforeNode, options) {
			// summary:
			//		Renders an array of objects as rows, before the given node.

			options = options || {};
			var self = this,
				start = options.start || 0,
				rowsFragment = rias.dom.doc.createDocumentFragment(),
				rows = [],
				container,
				i = 0,
				len = results.length;

			if (!beforeNode) {
				this._lastCollection = results;
			}

			// Insert a row for each item into the document fragment
			while (i < len) {
				///增加 options.rowNum
				options.rowNum = start + 1;
				rows[i] = this.insertRow(results[i], rowsFragment, null, start++, options);
				i++;
			}

			// Insert the document fragment into the appropriate position
			container = beforeNode ? beforeNode.parentNode : self.contentNode;
			if (container && container.parentNode &&
				(container !== self.contentNode || len)) {
				container.insertBefore(rowsFragment, beforeNode || null);
				if (len) {
					self.adjustRowIndices(rows[len - 1]);
				}
			}

			return rows;
		}

	});

	OnDemandList.extend({
		postCreate: function () {
			this.inherited(arguments);
			var self = this;
			// check visibility on scroll events
			///增加 this._listeners.push(
			this._listeners.push(rias.on(this.bodyNode, 'scroll',
				miscUtil[this.pagingMethod](function (event) {
					self._processScroll(event);
				}, null, this.pagingDelay)
			));
		}
	});

	var colsetidAttr = 'data-dgrid-column-set-id';

	function getColumnSetSubRows(subRows, columnSetId, startRow) {
		// Builds a subRow collection that only contains columns that correspond to
		// a given column set id.
		if (!subRows || !subRows.length) {
			return;
		}
		var subset = [],
			idPrefix = columnSetId + '-',
			i = startRow || 0,
			numRows = subRows.length;
		for (; i < numRows; i++) {
			var row = subRows[i];
			var subsetRow = [];
			subsetRow.className = row.className;
			for (var k = 0, numCols = row.length; k < numCols; k++) {
				var column = row[k];
				// The column id begins with the column set id.
				//if (column.id != null && column.id.indexOf(idPrefix) === 0) {
				if (column.id != null && column._columnSetPrefix === idPrefix) {
					column.columnSetId = columnSetId;
					subsetRow.push(column);
				}
			}
			subset.push(subsetRow);
		}
		return subset;
	}
	ColumnSet.extend({
		///增加
		postMixInProperties: function(){
			///增加 this._columnSetRules 判断
			this._columnSetRules = {};
			///增加 this._columnSizes 判断，this._columnSizes 在多个地方使用、创建。
			if(!this._columnSizes){
				this._columnSizes = {};
			}
			this.inherited(arguments);
		},
		///增加
		startup: function(){
			///增加 onColumnResize
			var self = this;
			if (this._started) {
				return;
			}
			/// inherited _WidgetBase
			this.inherited(arguments);
			this._started = true;

			///增加 this._listeners.push(
			this._listeners.push(rias.on(this.domNode, "dgrid-columnresize", function(evt){
				self._calColumnSet();
			}));
		},
		///增加
		destroy: function () {
			this.inherited(arguments);

			///增加 this._columnSizes
			var name;
			for (name in this._columnSizes) {
				this._columnSizes[name].remove();
			}
			///增加 this._columnSetRules
			for (name in this._columnSetRules) {
				this._columnSetRules[name].remove();
			}
			this._columnSetScrollerNode = undefined;
		},

		styleColumnSet: function (colsetId, css, /*String*/parentCss) {
			// summary:
			//		Dynamically creates a stylesheet rule to alter a columnset's style.

			///增加 this._columnSetRules
			parentCss = parentCss || "";
			var sId = colsetId + parentCss,
				rule = this._columnSetRules[sId];
			if (rule) {
				rule.set(css);
			}else{
				rule = this.addCssRule('#' + miscUtil.escapeCssIdentifier(this.domNode.id) + " " + parentCss + ' .dgrid-column-set-' + miscUtil.escapeCssIdentifier(colsetId, '-'), css);
				this._columnSetRules[sId] = rule;
			}
			if(this._columnSetScrollers){
				///增加 _columnSetScrollers 的判断
				this._positionScrollers();
			}
			return rule;
		},

		///增加
		_configColumns: function (prefix, rowColumns) {
			for (var i = 0, l = this.columnSets.length; i < l; i++) {
				var columnSet = this.columnSets[i];
				for (var j = 0; j < columnSet.length; j++) {
					for (var k = 0; k < columnSet[j].length; k++) {
						columnSet[j][k]._columnSetPrefix = i + "-";
					}
				}
			}
			return this.inherited(arguments);
		},
		createRowCells: function (tag, each, subRows, object, options) {
			var row = rias.dom.create('table', { className: 'dgrid-row-table' });
			var tbody = rias.dom.create('tbody', null, row);
			var tr = rias.dom.create('tr', null, tbody);
			var i, l, cell,
				columnSetId;///增加 columnSetId
			for (i = 0, l = this.columnSets.length; i < l; i++) {
				// iterate through the columnSets
				columnSetId = i;
				cell = rias.dom.create(tag, {
					className: 'dgrid-column-set-cell dgrid-column-set-' + i
				}, tr);
				cell = rias.dom.create('div', {
					className: 'dgrid-column-set'
				}, cell);
				cell.setAttribute(colsetidAttr, columnSetId);
				var subset = getColumnSetSubRows(subRows || this.subRows, columnSetId) || this.columnSets[i];
				cell.appendChild(this.inherited(arguments, [tag, each, subset, object, options]));
			}
			return row;
		},

		///增加
		adjustVScroll: function(){
			this.inherited(arguments);
			if(this._columnSetScrollers){
				this._positionScrollers();
			}
		},

		_positionScrollers: function () {
			var domNode = this.domNode,
				scrollers = this._columnSetScrollers,
				scrollerContents = this._columnSetScrollerContents,
				columnSets = this.columnSets,
				footerSummaryNode = this.footerSummaryNode,
				footerHeight = this.showFooter ? this.footerNode.offsetHeight : 0,
				scrollerWidth = 0,
				numScrollers = 0, // tracks number of visible scrollers (sets w/ overflow)
				i, l, columnSetElement, contentWidth;

			for (i = 0, l = columnSets.length; i < l; i++) {
				// iterate through the columnSets
				columnSetElement = rias.dom.query('.dgrid-column-set[' + colsetidAttr + '="' + i + '"]', domNode)[0];
				scrollerWidth = columnSetElement.offsetWidth;
				contentWidth = columnSetElement.firstChild.offsetWidth;
				scrollerContents[i].style.width = contentWidth + 'px';
				scrollers[i].style.width = scrollerWidth + 'px';

				if (rias.has('ie') < 9) {
					// IE seems to need scroll to be set explicitly
					scrollers[i].style.overflowX = contentWidth > scrollerWidth ? 'scroll' : 'auto';
				}

				// Keep track of how many scrollbars we're showing
				if (contentWidth > scrollerWidth) {
					numScrollers++;
				}
			}

			numScrollers = (numScrollers ? rias.theme.scrollbarHeight : 0);
			if(footerSummaryNode){
				footerSummaryNode.style.bottom = (footerHeight + numScrollers) + "px";
				//this.footerSummaryScrollNode.style.bottom = (footerHeight + numScrollers) + "px";
				//this.footerSummaryScrollNode.style.height = footerSummaryNode.offsetHeight + "px";
			}
			this._columnSetScrollerNode.style.bottom = footerHeight + 'px';

			// Align bottom of body node depending on whether there are scrollbars
			/// 已经设置了 marginBottom
			this.bodyNode.style.bottom = numScrollers + 'px';
		},
		_putScroller: function (columnSet, i) {
			// function called for each columnSet
			var scroller = this._columnSetScrollers[i] = rias.dom.create('span', {
				// IE8 needs dgrid-scrollbar-height class for scrollbar to be visible,
				// but for some reason IE11's scrollbar arrows become unresponsive, so avoid applying it there
				className: 'dgrid-column-set-scroller dgrid-column-set-scroller-' + i + (rias.has('ie') < 9 ? ' dgrid-scrollbar-height' : '')
			}, this._columnSetScrollerNode);
			scroller.setAttribute(colsetidAttr, i);

			this._columnSetScrollerContents[i] = rias.dom.create('div', {
				className: 'dgrid-column-set-scroller-content'
			}, scroller);
			///增加 this._listeners.push(
			this._listeners.push(rias.on(scroller, 'scroll', rias.hitch(this, '_onColumnSetScroll')));
		},

		///增加
		_calColumnSet: function(){
			function _getsw(node, sw){
				var w = 0;
				if(sw.indexOf("em") >= 0){
					rias.theme.testElement(node, function(el){
						w += (parseFloat(sw) * rias.dom.getPadExtents(el).t);
					});
				}else{
					w += parseFloat(sw);
				}
				return rias.dom.box2marginBox(node, {w: w}).w;
			}
			var self = this,
				cols, col, colw, w, s,// ws,
				i, l, rule;
			rias.dom.removeClass(this.headerNode, "dgrid-header-hidden");
			for (i = 0, l = this.columnSets.length - 1; i < l; i++) {
				///最后一个 columnSets 不能设置
				if(this.columnSetWidths && this.columnSetWidths[i]){
					this.styleColumnSet(i, {
						width: rias.isNumber(this.columnSetWidths[i]) ? this.columnSetWidths[i] + "px" : this.columnSetWidths[i]
					});
				}else{
					cols = getColumnSetSubRows(this.subRows && this.subRows.headerRows, i) || this.columnSets[i];
					w = 0;
					rias.forEach(cols[0], function(column, idx){
						if (rule = self._columnSizes[column.id]) {
							colw = rule.get("width");
							colw = _getsw(column.headerNode, colw);
						}else {
							colw = 0;
							s = (rias.dom.styleToObject(column.headerNode.style).width) || column.width;
							if(s){
								colw = _getsw(column.headerNode, s);
							}else if(column._riasrOpColumn){
								rias.forEach(column._riasrOpColumn, function(item){
									colw += _getsw(column.headerNode, (item.text + " ").length + "em");
								});
								colw += 10;
							}else{
								colw = rias.dom.getMarginBox(column.headerNode).w;
							}
							rule = self.addCssRule('#' + miscUtil.escapeCssIdentifier(self.domNode.id) +
								' .dgrid-column-' + miscUtil.escapeCssIdentifier(column.id, '-'),
								'width: ' + rias.dom.marginBox2box(column.headerNode, {w: colw}).w + 'px;');
							self._columnSizes[column.id] = rule;
						}
						w += colw;
					});
					this.styleColumnSet(i, {
						width: w + "px"
					});
				}
			}
			if(!this.showHeader){
				rias.dom.addClass(this.headerNode, "dgrid-header-hidden");
			}
		},
		///增加
		_internalResize: function(box){
			box = this.inherited(arguments);
			this._calColumnSet();
			return box;
		},

		_setColumnSets: function (columnSets) {
			this._destroyColumns();
			this.columnSets = columnSets;
			///需要判断 this.keepScrollPosition
			var scrolls = this._columnSetScrollLefts;
			this._updateColumns();
			if(this.keepScrollPosition){
				for(var id in scrolls){
					if(scrolls[id]){
						this._scrollColumnSet(id, scrolls[id]);
					}
				}
			}
		},
		_onColumnSetCellFocus: function (event, columnSetNode) {
			var focusedNode = event.target;
			/// 排除 resize-handle
			if(focusedNode.className.indexOf("dgrid-resize-handle") >= 0){
				return;
			}
			var columnSetId = columnSetNode.getAttribute(colsetidAttr),
				// columnSetNode's offsetLeft is not always correct,
				// so get the columnScroller to check offsetLeft against
				columnScroller = this._columnSetScrollers[columnSetId],
				elementEdge = focusedNode.offsetLeft - columnScroller.scrollLeft + focusedNode.offsetWidth;

			if (elementEdge > columnSetNode.offsetWidth || columnScroller.scrollLeft > focusedNode.offsetLeft) {
				this._scrollColumnSet(columnSetNode, focusedNode.offsetLeft);
			}
		}

	});

	ColumnReorder.extend({
		///增加
		onColumnReorder: function(evt){
		},
		///增加
		postCreate: function () {
			var self = this;

			this.inherited(arguments);

			///增加 onColumnReorder
			this._listeners.push(rias.on(this.domNode, "dgrid-columnreorder", function(evt){
				return self.onColumnReorder(evt) != false;
			}));
		},
		renderHeader: function () {
			function makeDndTypePrefix(gridId) {
				return 'dgrid-' + gridId + '-';
			}
			var dndTypePrefix = makeDndTypePrefix(this.id),
				csLength, cs;

			this.inherited(arguments);

			// After header is rendered, set up a dnd source on each of its subrows.

			this._columnDndSources = [];

			/// 保持与 Grid.renderHeader 和 _createHeaderRowCell 一致，
			/// 增加使用 this.subRows.headerRows
			if (this.columnSets) {
				// Iterate columnsets->subrows->columns.
				if(this.subRows && this.subRows.headerRows){
					for (cs = 0, csLength = this.columnSets.length; cs < csLength; cs++) {
						rias.forEach(getColumnSetSubRows(this.subRows.headerRows, cs, 1), function (subRow, sr) {
							this._initSubRowDnd(subRow, dndTypePrefix + cs + '-' + sr);
						}, this);
					}
				}else{
					for (cs = 0, csLength = this.columnSets.length; cs < csLength; cs++) {
						rias.forEach(this.columnSets[cs], function (subRow, sr) {
							this._initSubRowDnd(subRow, dndTypePrefix + cs + '-' + sr);
						}, this);
					}
				}
			}
			else {
				// Iterate subrows->columns.
				rias.forEach(this.subRows, function (subRow, sr) {
					this._initSubRowDnd(subRow, dndTypePrefix + sr);
				}, this);
			}
		}
	});
	ColumnResizer.extend({
		///增加
		postMixInProperties: function(){
			///增加 this._columnSizes 判断，this._columnSizes 在多个地方使用、创建。
			if(!this._columnSizes){
				this._columnSizes = {};
			}
			this.inherited(arguments);
		},
		onColumnResize: function(evt){
		},
		///增加
		postCreate: function () {
			var self = this;

			this.inherited(arguments);

			///增加 onColumnResize
			this._listeners.push(rias.on(this.domNode, "dgrid-columnresize", function(evt){
				return self.onColumnResize(evt) != false;
			}));
		},
		configStructure: function () {
			var oldSizes = this._oldColumnSizes = rias.mixin({}, this._columnSizes), // shallow clone
				k;

			this._resizedColumns = false;
			///改到 postMixInProperties 中
			//this._columnSizes = {};

			this.inherited(arguments);

			// Remove old column styles that are no longer relevant; this is specifically
			// done *after* calling inherited so that _columnSizes will contain keys
			// for all columns in the new structure that were assigned widths.
			for (k in oldSizes) {
				if (!(k in this._columnSizes)) {
					oldSizes[k].remove();
				}
			}
			delete this._oldColumnSizes;
		},
		_configColumn: function (column) {
			this.inherited(arguments);

			var colId = column.id,
				rule;

			///允许 column.width 为 string
			if ('width' in column) {
				// Update or add a style rule for the specified width
				if (rule = this._columnSizes[colId]) {///改为取 this._columnSizes，因为 this._oldColumnSizes 有可能被 delete
					rule.set('width', (rias.isNumber(column.width) ? column.width + 'px;' : column.width));
				}else {
					///改为用 this.addCssRule
					rule = this.addCssRule('#' + miscUtil.escapeCssIdentifier(this.domNode.id) +
						' .dgrid-column-' + miscUtil.escapeCssIdentifier(colId, '-'),
						'width: ' + (rias.isNumber(column.width) ? column.width + 'px;' : column.width + ';'));
				}
				this._columnSizes[colId] = rule;
			}
		}
	});
	var activeGrid, // references grid for which the menu is currently open
		bodyListener; // references pausable event handler for body mousedown
	ColumnHider.extend({
		///增加
		onColumnStateChange: function(evt){
		},
		///增加
		postCreate: function () {
			var self = this;

			this.inherited(arguments);

			///增加 onColumnStateChange
			this._listeners.push(rias.on(this.domNode, "dgrid-columnstatechange", function(evt){
				self.onColumnStateChange(evt);
			}));
		},

		_renderHiderMenuEntries: function () {
			// summary:
			//		Iterates over subRows for the sake of adding items to the
			//		column hider menu.

			var subRows = this.subRows,
				first = true,
				srLength, cLength, sr, c;

			delete this._columnHiderFirstCheckbox;

			for (sr = 0, srLength = subRows.length; sr < srLength; sr++) {
				for (c = 0, cLength = subRows[sr].length; c < cLength; c++) {
					this._renderHiderMenuEntry(subRows[sr][c]);
					if (first) {
						///如果第一列是 unhidable，则取不到 _columnHiderFirstCheckbox，故需要判断是否取到 _columnHiderFirstCheckbox
						//first = false;
						this._columnHiderFirstCheckbox = this._columnHiderCheckboxes[subRows[sr][c].id];
						if(this._columnHiderFirstCheckbox){
							first = false;
						}
					}
				}
			}
		},
		renderHeader: function () {
			var grid = this,
				hiderMenuNode = this.hiderMenuNode,
				//hiderToggleNode = this.hiderToggleNode,
				id;

			function stopPropagation(event) {
				event.stopPropagation();
			}
			function getColumnIdFromCheckbox(cb, grid) {
				// Given one of the checkboxes from the hider menu,
				// return the id of the corresponding column.
				// (e.g. gridIDhere-hider-menu-check-colIDhere -> colIDhere)
				return cb.id.substr(grid.id.length + 18);
			}

			this.inherited(arguments);

			if (!hiderMenuNode) {
				// First run
				// Assume that if this plugin is used, then columns are hidable.
				// Create the toggle node.
				/*hiderToggleNode = this.hiderToggleNode = rias.dom.create('button', {
					'aria-label': this.i18nColumnHider.popupTriggerLabel,
					className: 'ui-icon dgrid-hider-toggle',
					type: 'button'
				}, this.domNode);

				this._listeners.push(rias.on(hiderToggleNode, 'click', function (e) {
					grid._toggleColumnHiderMenu(e);
				}));*/

				// Create the column list, with checkboxes.
				hiderMenuNode = this.hiderMenuNode = rias.dom.create('div', {
					'aria-label': this.i18nColumnHider.popupLabel,
					className: 'dgrid-hider-menu',
					id: this.id + '-hider-menu',
					role: 'dialog'
				});

				this._listeners.push(rias.on(hiderMenuNode, 'keyup', function (e) {
					///TODO:zensst.无法 stopPropagation
					var charOrCode = e.charCode || e.keyCode;
					if (charOrCode ===  27) {//ESCAPE
						grid._toggleColumnHiderMenu(e);
						//hiderToggleNode.focus();
					}
					///增加
					stopPropagation(e);
				}));

				// Make sure our menu is initially hidden, then attach to the document.
				hiderMenuNode.style.display = 'none';
				hiderMenuNode.style.top = (this.topToolsNode ? this.topToolsNode.offsetHeight : 0) + "px";
				this.domNode.appendChild(hiderMenuNode);

				// Hook up delegated listener for modifications to checkboxes.
				this._listeners.push(rias.on(hiderMenuNode,
					'.dgrid-hider-menu-check:' + (rias.has('ie') < 9 ? 'click' : 'change'),
					function (e) {
						//grid._updateColumnHiddenState(getColumnIdFromCheckbox(e.target, grid), !e.target.checked);
						grid._updateColumnHiddenState(getColumnIdFromCheckbox(e.target, grid), !e.target.checked);
					}
				));

				// Stop click events from propagating from menu or trigger nodes,
				// so that we can simply track body clicks for hide without
				// having to drill-up to check.
				this._listeners.push(
					rias.on(hiderMenuNode, 'mousedown', stopPropagation)//,
					//rias.on(hiderToggleNode, 'mousedown', stopPropagation)
				);

				// Hook up top-level mousedown listener if it hasn't been yet.
				if (!bodyListener) {
					bodyListener = rias.on.pausable(document, 'mousedown', function (e) {
						// If an event reaches this listener, the menu is open,
						// but a click occurred outside, so close the dropdown.
						activeGrid && activeGrid._toggleColumnHiderMenu(e);
					});
					bodyListener.pause(); // pause initially; will resume when menu opens
				}
			}
			else { // subsequent run
				// Remove active rules, and clear out the menu (to be repopulated).
				for (id in this._columnHiderRules) {
					this._columnHiderRules[id].remove();
				}
				hiderMenuNode.innerHTML = '';
			}

			this._columnHiderCheckboxes = {};
			this._columnHiderRules = {};

			// Populate menu with checkboxes/labels based on current columns.
			this._renderHiderMenuEntries();
		},
		_toggleColumnHiderMenu: function () {
			var hidden = this._hiderMenuOpened, // reflects hidden state after toggle
				hiderMenuNode = this.hiderMenuNode,
				domNode = this.domNode,
				firstCheckbox;

			// Show or hide the hider menu
			hiderMenuNode.style.display = (hidden ? 'none' : '');

			// Adjust height of menu
			if (hidden) {
				// Clear the set size
				hiderMenuNode.style.height = '';
			}
			else {
				// Adjust height of the menu if necessary
				// Why 12? Based on menu default paddings and border, we need
				// to adjust to be 12 pixels shorter. Given the infrequency of
				// this style changing, we're assuming it will remain this
				// static value of 12 for now, to avoid pulling in any sort of
				// computed styles.
				if (hiderMenuNode.offsetHeight > domNode.offsetHeight - 12) {
					hiderMenuNode.style.height = (domNode.offsetHeight - 12) + 'px';
				}
				// focus on the first checkbox
				(firstCheckbox = this._columnHiderFirstCheckbox) && firstCheckbox.focus();
			}

			// Pause or resume the listener for clicks outside the menu
			bodyListener[hidden ? 'pause' : 'resume']();
			// Update activeGrid appropriately
			activeGrid = hidden ? null : this;

			// Toggle the instance property
			this._hiderMenuOpened = !hidden;
		}

	});

	Selection.extend({
		///增加
		onSelect: function(evt){
		},
		onDeselect: function(evt){
		},
		///增加
		postCreate: function () {
			var self = this;
			this.inherited(arguments);

			///增加 onSelect、onDeselect
			this._listeners.push(rias.on(this.domNode, "dgrid-select", function(evt){
				self.onSelect(evt);
			}));
			this._listeners.push(rias.on(this.domNode, "dgrid-deselect", function(evt){
				self.onDeselect(evt);
			}));

			this._initSelectionEvents();

			// Force selectionMode setter to run
			var selectionMode = this.selectionMode;
			this.selectionMode = '';
			this._setSelectionMode(selectionMode);
		},
		_initSelectionEvents: function () {
			// summary:
			//		Performs first-time hookup of event handlers containing logic
			//		required for selection to operate.

			var grid = this,
				contentNode = this.contentNode,
				selector = this.selectionDelegate;

			this._selectionEventQueues = {
				deselect: [],
				select: []
			};

			if (rias.has('touch') && !rias.has('pointer') && this.selectionTouchEvents) {
				// Listen for taps, and also for mouse/keyboard, making sure not
				// to trigger both for the same interaction
				grid._listeners.push(rias.on(contentNode, touchUtil.selector(selector, this.selectionTouchEvents), function (evt) {
					grid._handleSelect(evt, this);
					grid._ignoreMouseSelect = this;
				}));
				grid._listeners.push(rias.on(contentNode, rias.on.selector(selector, this.selectionEvents), function (event) {
					if (grid._ignoreMouseSelect !== this) {
						grid._handleSelect(event, this);
					}
					else if (event.type === upType) {
						grid._ignoreMouseSelect = null;
					}
				}));
			}
			else {
				// Listen for mouse/keyboard actions that should cause selections
				grid._listeners.push(rias.on(contentNode, rias.on.selector(selector, this.selectionEvents), function (event) {
					grid._handleSelect(event, this);
				}));
			}

			// Also hook up spacebar (for ctrl+space)
			if (this.addKeyHandler) {
				this.addKeyHandler(32, function (event) {
					grid._handleSelect(event, event.target);
				});
			}

			// If allowSelectAll is true, bind ctrl/cmd+A to (de)select all rows,
			// unless the event was received from an editor component.
			// (Handler further checks against _allowSelectAll, which may be updated
			// if selectionMode is changed post-init.)
			if (this.allowSelectAll) {
				this.on('keydown', function (event) {
					if (event[ctrlEquiv] && event.keyCode === 65 &&
						!/\bdgrid-input\b/.test(event.target.className)) {
						event.preventDefault();
						grid[grid.allSelected ? 'clearSelection' : 'selectAll']();
					}
				});
			}

			// Update aspects if there is a collection change
			if (this._setCollection) {
				this.before(this, '_setCollection', function (collection) {
					grid._updateDeselectionAspect(collection);
				});
			}
			this._updateDeselectionAspect();
		},

		///增加
		getSelectedIds: function(){
			var result = [],
				selection = this.selection, p;
			for(p in selection){
				if(selection[p]){
					result.push(p);
				}
			}
			return result;
		}
	});

	///增加 键盘操作
	if(!("13" in Keyboard.defaultKeyMap)){
		Keyboard.defaultKeyMap["13"] = Keyboard.moveFocusRight;
	}
	Editor.extend({
		postCreate: function () {
			var self = this;

			this.inherited(arguments);

			///增加 onDataChange、onShowEditor、onHideEditor
			this._listeners.push(rias.on(this.domNode, "dgrid-datachange", function(evt){
				return self._onDataChange(evt) != false;
			}));
			this._listeners.push(rias.on(this.domNode, "dgrid-editor-show", function(evt){
				self._onShowEditor(evt);
			}));
			this._listeners.push(rias.on(this.domNode, "dgrid-editor-hide", function(evt){
				self._onHideEditor(evt);
			}));

			this.on('.dgrid-input:focusin', function () {
				self._focusedEditorCell = self.cell(this);
			});
			this._editorFocusoutHandle = rias.on.pausable(this.domNode, '.dgrid-input:focusout', function () {
				self._focusedEditorCell = null;
			});
			this._listeners.push(this._editorFocusoutHandle);
		},
		_configureEditorColumn: function (column) {
			// summary:
			//		Adds editing capability to a column's cells.

			var editor = column.editor;
			var self = this;

			var originalRenderCell = column.renderCell || this._defaultRenderCell;
			var editOn = column.editOn;
			var isWidget = typeof editor !== 'string';

			if (editOn) {
				// Create one shared widget/input to be swapped into the active cell.
				this._editorInstances[column.id] = this._createSharedEditor(column, originalRenderCell);
			}
			else if (isWidget) {
				// Append to array iterated in removeRow
				this._alwaysOnWidgetColumns.push(column);
			}

			column.renderCell = editOn ? function (object, value, cell, options) {
				// TODO: Consider using event delegation
				// (Would require using dgrid's focus events for activating on focus,
				// which we already advocate in docs for optimal use)

				if (!options || !options.alreadyHooked) {
					var listener = rias.on(cell, editOn, function (evt, args) {
						self._activeOptions = options;
						///修改为 when
						var c = self.edit(this);
						rias.when(c, function(cmp){
							if(cmp && evt){
								rias.on.emit(cmp.focusNode || cmp.domNode || cmp, evt.type, evt);
							}
						});
					});
					if (self._editorRowListeners) {
						self._editorRowListeners[column.id] = listener;
					}
					else {
						// We're in refreshCell since _editorRowListeners doesn't exist,
						// so the row should exist
						var row = self.row(object);
						self._editorCellListeners[row.element.id][column.id] = listener;
					}
				}
				///增加 "dgrid-cell-canedit"
				if (!column.canEdit || column.canEdit(object, value)) {
					rias.dom.toggleClass(cell, "dgrid-cell-canedit", true);
				}

				// initially render content in non-edit mode
				return originalRenderCell.call(column, object, value, cell, options);

			} : function (object, value, cell, options) {
				// always-on: create editor immediately upon rendering each cell
				if (!column.canEdit || column.canEdit(object, value)) {
					// _createEditor also needs the object for when this is invoked via refreshCell, to get the row
					var cmp = self._createEditor(column, object);
					self._showEditor(cmp, column, cell, value);
					// Maintain reference for later use.
					cell[isWidget ? 'widget' : 'input'] = cmp;
					///增加 "dgrid-cell-canedit"
					rias.dom.toggleClass(cell, "dgrid-cell-canedit", true);
				}
				else {
					return originalRenderCell.call(column, object, value, cell, options);
				}
			};
		},
		_createEditor: function (column, object) {
			// Creates an editor instance based on column definition properties,
			// and hooks up events.
			var editor = column.editor,
				editOn = column.editOn,
				self = this,
				Widget = typeof editor !== 'string' && editor,
				args,
				cmp,
				node,
				tagName,
				tagArgs = {};

			args = column.editorArgs || {};
			if (typeof args === 'function') {
				args = args.call(this, column);
			}

			if (Widget) {
				///增加 ownerRiasw
				args.ownerRiasw = self;
				//if(!args.id && (arguments.length < 2)){
				//	///有 object 时，是定位到 cell，无法获取 cell 的 id
				//	args.id = self.id + "_editor_" + column._columnSetPrefix + column.id;//this.collection.getIdentity(object)
				//}
				cmp = new Widget(args);
				if(arguments.length < 2){
					///无 object 时，是共用，缺少定位。
					cmp.domNode.parentNode.removeChild(cmp.domNode);
				}
				rias.dom.addClass(cmp.domNode, "dgrid-cell-editor");
				/// node 改为 domNode，因为有些 Editor 的 focusNode 只是 domNode 的子节点，赋值 css width:100% 会导致不准确
				//node = cmp.focusNode || cmp.domNode;
				node = cmp.domNode;
				// Add dgrid-input to className to make consistent with HTML inputs.
				node.className += ' dgrid-input';

				// For editOn editors, connect to onBlur rather than onChange, since
				// the latter is delayed by setTimeouts in Dijit and will fire too late.
				cmp.on(editOn ? 'blur' : 'change', function () {
					if (!cmp._dgridIgnoreChange) {
						self._updatePropertyFromEditor(column, this, {type: 'widget'});
					}
				});
			}
			else {
				// considerations for standard HTML form elements
				if (!this._hasInputListener) {
					// register one listener at the top level that receives events delegated
					this._hasInputListener = true;
					this.on('change', function (evt) {
						self._handleEditorChange(evt);
					});
					// also register a focus listener
				}

				if (editor === 'textarea') {
					tagName = 'textarea';
				}
				else {
					tagName = 'input';
					tagArgs.type = editor;
				}
				cmp = node = rias.dom.create(tagName, rias.mixin(tagArgs, {
					className: 'dgrid-cell-editor dgrid-input',
					name: column.field,
					tabIndex: isNaN(column.tabIndex) ? -1 : column.tabIndex
				}, args));

				if (rias.has('ie') < 9) {
					// IE<9 doesn't fire change events for all the right things,
					// and it doesn't bubble.
					var listener;
					if (editor === 'radio' || editor === 'checkbox') {
						// listen for clicks since IE doesn't fire change events properly for checks/radios
						listener = rias.on(cmp, 'click', function (evt) {
							self._handleEditorChange(evt, column);
						});
					}
					else {
						listener = rias.on(cmp, 'change', function (evt) {
							self._handleEditorChange(evt, column);
						});
					}

					if (editOn) {
						// Shared editor handlers are maintained in _editorColumnListeners, since they're not per-row
						this._editorColumnListeners.push(listener);
					}
					else if (this._editorRowListeners) {
						this._editorRowListeners[column.id] = listener;
					}
					// If editRowListeners doesn't exist and this is an always-on editor,
					// then we're here from renderCell via refreshCell, and the row should exist
					else {
						this._editorCellListeners[this.row(object).element.id][column.id] = listener;
					}
				}
			}

			if (column.autoSelect) {
				var selectNode = cmp.focusNode || cmp;
				if (selectNode.select) {
					///增加 this._listeners.push(
					this._listeners.push(rias.on(selectNode, 'focus', function () {
						// setTimeout is needed for always-on editors on WebKit,
						// otherwise selection is reset immediately afterwards
						setTimeout(function () {
							selectNode.select();
						}, 10);
					}));
				}
			}

			return cmp;
		},
		_startupEditor: function (cmp, column, cellElement, value) {
			// summary:
			//		Handles editor widget startup logic and updates the editor's value.

			if (cmp.domNode) {
				// For widgets, ensure startup is called before setting value, to maximize compatibility
				// with flaky widgets like dijit/form/Select.
				if (!cmp._started) {
					cmp.startup();
				}else if(rias.isFunction(cmp.resize)){
					///需要 resize
					cmp.resize();
				}

				// Set value, but ensure it isn't processed as a user-generated change.
				// (Clear flag on a timeout to wait for delayed onChange to fire first)
				cmp._dgridIgnoreChange = true;
				cmp.set('value', value);
				setTimeout(function () {
					cmp._dgridIgnoreChange = false;
				}, 0);
			}

			// track previous value for short-circuiting or in case we need to revert
			cmp._dgridLastValue = value;
			// if this is an editor with editOn, also update _activeValue
			// (_activeOptions will have been updated previously)
			if (this._activeCell) {
				this._activeValue = value;
				// emit an event immediately prior to placing a shared editor
				rias.on.emit(cellElement, 'dgrid-editor-show', {
					grid: this,
					cell: this.cell(cellElement),
					column: column,
					editor: cmp,
					bubbles: true,
					cancelable: false
				});
			}
		},

		onDataChange: function(evt){
		},
		_onDataChange: function(evt){
			this.onDataChange(evt);
		},
		onShowEditor: function(evt){
		},
		_onShowEditor: function(evt){
			this.onShowEditor(evt);
		},
		onHideEditor: function(evt){
		},
		_onHideEditor: function(evt){
			this.onHideEditor(evt);
		},

		refresh: function () {
			for (var id in this._editorInstances) {
				var editorInstanceDomNode = this._editorInstances[id].domNode;
				if (editorInstanceDomNode && editorInstanceDomNode.parentNode) {
					// Remove any editor widgets from the DOM before List destroys it, to avoid issues in IE (#1100)
					editorInstanceDomNode.parentNode.removeChild(editorInstanceDomNode);
				}
			}

			/// 增加 return
			return this.inherited(arguments);
		}
	});

	Tree.extend({

		_destroyColumns: function () {
			this.inherited(arguments);
			var listeners = this._treeColumnListeners;

			for (var i = listeners.length; i--;) {
				listeners[i].remove();
			}
			this._treeColumnListeners = [];

			///begin================================///
			///需要重置，以能够重新处理（生成） treeColumn
			///reset somethings
			if(this._treeColumn){
				this._treeColumn._isConfiguredTreeColumn = undefined;
				this._treeColumn.renderCell = this._originalRenderCell;
			}
			this._originalRenderCell = undefined;
			///end=================================///

			this._treeColumn = null;
		},

		_configureTreeColumn: function (column) {
			// summary:
			//		Adds tree navigation capability to a column.
			var grid = this;
			var colSelector = '.dgrid-content .dgrid-column-' + column.id;
			var clicked; // tracks row that was clicked (for expand dblclick event handling)

			if (column._isConfiguredTreeColumn) {
				return;
			}

			this._treeColumn = column;
			if (!column._isConfiguredTreeColumn) {
				var originalRenderCell = column.renderCell || this._defaultRenderCell;
				///begin================================///
				///保存，以在 _destroyColumns 中重置
				///save the original renderCell call
				column._originalRenderCell = originalRenderCell;
				///end=================================///

				column._isConfiguredTreeColumn = true;
				column.renderCell = function (object, value, td, options) {
					// summary:
					//		Renders a cell that can be expanded, creating more rows

					var level = options && 'queryLevel' in options ? options.queryLevel : 0,
						mayHaveChildren = !grid.collection.mayHaveChildren || grid.collection.mayHaveChildren(object),
						expando, node;

					expando = column.renderExpando(level, mayHaveChildren, grid._expanded[grid.collection.getIdentity(object)], object);
					expando.level = level;
					expando.mayHaveChildren = mayHaveChildren;

					node = originalRenderCell.call(column, object, value, td, options);
					if (node && node.nodeType) {
						td.appendChild(expando);
						td.appendChild(node);
					}
					else {
						td.insertBefore(expando, td.firstChild);
					}
				};

				if (typeof column.renderExpando !== 'function') {
					column.renderExpando = this._defaultRenderExpando;
				}
			}

			// Set up the event listener once and use event delegation for better memory use.
			var treeColumnListeners = this._treeColumnListeners;
			if (treeColumnListeners.length === 0) {
				// Set up the event listener once and use event delegation for better memory use.
				treeColumnListeners.push(this.on(column.expandOn ||
					'.dgrid-expando-icon:click,' + colSelector + ':dblclick,' + colSelector + ':keydown',
					function (event) {
						var row = grid.row(event);
						if ((!grid.collection.mayHaveChildren || grid.collection.mayHaveChildren(row.data)) &&
							(event.type !== 'keydown' || event.keyCode === 32) && !(event.type === 'dblclick' &&
							clicked && clicked.count > 1 && row.id === clicked.id &&
							event.target.className.indexOf('dgrid-expando-icon') > -1)) {
							grid.expand(row);
						}

						// If the expando icon was clicked, update clicked object to prevent
						// potential over-triggering on dblclick (all tested browsers but IE < 9).
						if (event.target.className.indexOf('dgrid-expando-icon') > -1) {
							if (clicked && clicked.id === grid.row(event).id) {
								clicked.count++;
							}
							else {
								clicked = {
									id: grid.row(event).id,
									count: 1
								};
							}
						}
					})
				);

				if (rias.has('touch')) {
					// Also listen on double-taps of the cell.
					treeColumnListeners.push(this.on(touchUtil.selector(colSelector, touchUtil.dbltap),
						function () {
							grid.expand(this);
						}));
				}
			}
		},

		expand: function (target, expand, noTransition) {

			if (!this._treeColumn) {
				return;
			}

			var grid = this,
				row = target.element ? target : this.row(target),
				isExpanded = !!this._expanded[row.id],
				hasTransitionend = rias.has('transitionend'),
				promise;

			target = row.element;
			target = target.className.indexOf('dgrid-expando-icon') > -1 ? target : rias.dom.query('.dgrid-expando-icon', target)[0];

			noTransition = noTransition || !this.enableTreeTransitions;

			if (target && target.mayHaveChildren && (noTransition || expand !== isExpanded)) {
				// toggle or set expand/collapsed state based on optional 2nd argument
				var expanded = expand === undefined ? !this._expanded[row.id] : expand;

				// update the expando display
				rias.dom.replaceClass(target, 'ui-icon-triangle-1-' + (expanded ? 'se' : 'e'),
					'ui-icon-triangle-1-' + (expanded ? 'e' : 'se'));
				rias.dom.toggleClass(row.element, 'dgrid-row-expanded', expanded);

				var rowElement = row.element,
					container = rowElement.connected,
					containerStyle,
					scrollHeight,
					options = {};

				if (!container) {
					// if the children have not been created, create a container, a preload node and do the
					// query for the children
					container = options.container = rowElement.connected =
						rias.dom.create('div', { className: 'dgrid-tree-container' }, rowElement, 'after');
					var query = function (options) {
						var childCollection = grid._renderedCollection.getChildren(row.data),
							results;
						if (grid.sort && grid.sort.length > 0) {
							childCollection = childCollection.sort(grid.sort);
						}
						if (childCollection.track && grid.shouldTrackCollection) {
							container._rows = options.rows = [];

							childCollection = childCollection.track();

							// remember observation handles so they can be removed when the parent row is destroyed
							container._handles = [
								childCollection.tracking,
								grid._observeCollection(childCollection, container, options)
							];
						}
						if ('start' in options) {
							var rangeArgs = {
								start: options.start,
								end: options.start + options.count
							};
							results = childCollection.fetchRange(rangeArgs);
						} else {
							results = childCollection.fetch();
						}
						return results;
					};
					// Include level information on query for renderQuery case
					if ('level' in target) {
						container.level = query.level = target.level + 1;
					}

					// Add the query to the promise chain
					if (this.renderQuery) {
						promise = this.renderQuery(query, options);
					}
					else {
						// If not using OnDemandList, we don't need preload nodes,
						// but we still need a beforeNode to pass to renderArray,
						// so create a temporary one
						var firstChild = rias.dom.create('div', null, container);
						promise = this._trackError(function () {
							return grid.renderQueryResults(
									query(options),
									firstChild,
									rias.mixin({ rows: options.rows },
										'level' in query ? { queryLevel: query.level } : null
									)
								).then(function (rows) {
									rias.dom.destroy(firstChild);
									return rows;
								});
						});
					}

					if (hasTransitionend) {
						// Update height whenever a collapse/expand transition ends.
						// (This handler is only registered when each child container is first created.)
						///增加 this._listeners.push(
						this._listeners.push(rias.on(container, hasTransitionend, this._onTreeTransitionEnd));
					}
				}

				// Show or hide all the children.

				container.hidden = !expanded;
				containerStyle = container.style;

				// make sure it is visible so we can measure it
				if (!hasTransitionend || noTransition) {
					containerStyle.display = expanded ? 'block' : 'none';
					containerStyle.height = '';
					///需要重新调整 Scroll
					this.adjustVScroll();
				}
				else {
					if (expanded) {
						containerStyle.display = 'block';
						scrollHeight = container.scrollHeight;
						containerStyle.height = '0px';
					}
					else {
						// if it will be hidden we need to be able to give a full height
						// without animating it, so it has the right starting point to animate to zero
						rias.dom.addClass(container, 'dgrid-tree-resetting');
						containerStyle.height = container.scrollHeight + 'px';
					}
					// Perform a transition for the expand or collapse.
					setTimeout(rias.hitch(this, function () {
						rias.dom.removeClass(container, 'dgrid-tree-resetting');
						containerStyle.height = expanded ? (scrollHeight ? scrollHeight + 'px' : 'auto') : '0px';
						///需要重新调整 Scroll
						this.defer(rias.hitch(this, this.adjustVScroll), 350);
					}), 0);
				}

				// Update _expanded map.
				if (expanded) {
					this._expanded[row.id] = true;
				}
				else {
					delete this._expanded[row.id];
				}
			}

			// Always return a promise
			return rias.when(promise);
		},

		insertRow: function (object, container, beforeNode, i, options) {
			options = options || {};

			var level = options.queryLevel = 'queryLevel' in options ? options.queryLevel :
				'level' in container ? container.level : 0;

			var rowElement = this.inherited(arguments);

			// Auto-expand (shouldExpand) considerations
			var self = this,
				row = this.row(rowElement),
				expanded = this.shouldExpand(row, level, this._expanded[row.id]);

			if (expanded) {
				///修改为全部展开
				if(!this._expandedDeferred){
					this._expandedDeferred = this.expand(rowElement, true, true);
				}else{
					this._expandedDeferred = rias.when(this._expandedDeferred, function(rows){
						return self.expand(rowElement, true, true);
					});
				}
			}

			if (expanded || (!this.collection.mayHaveChildren || this.collection.mayHaveChildren(object))) {
				rias.dom.addClass(rowElement, 'dgrid-row-expandable');
			}

			return rowElement; // pass return value through
		},
		///增加
		destroy: function () {
			if(this._expandedDeferred){
				this._expandedDeferred.cancel();
				this._expandedDeferred = undefined;
			}

			this.inherited(arguments);
		}

	});

	Grid.extend({
		///增加
		postMixInProperties: function(){
			///增加 this._columnStyles 。
			if(!this._columnStyles){
				this._columnStyles = {};
			}
			this.inherited(arguments);
		},
		///增加
		postCreate: function () {
			var self = this;

			this.inherited(arguments);

			///增加 onSort，貌似没起作用
			this._listeners.push(rias.on(this.domNode, "dgrid-sort", function(evt){
				self.onSort(evt);
			}));
		},
		onSort: function(evt){
		},
		destroy: function () {
			// Run _destroyColumns first to perform any column plugin tear-down logic.
			this._destroyColumns();
			if (this._sortListener) {
				this._sortListener.remove();
			}
			///增加 this._columnStyles 。
			for (var name in this._columnStyles) {
				this._columnStyles[name].remove();
			}

			this.inherited(arguments);
		},
		styleColumn: function (colId, css, /*String*/parentCss) {
			///增加 this._columnStyles
			parentCss = parentCss || "";
			var sId = colId + parentCss,
				rule = this._columnStyles[sId];
			if (rule) {
				rule.set(css);
			}else{
				rule = this.addCssRule('#' + miscUtil.escapeCssIdentifier(this.domNode.id) + " " + parentCss + ' .dgrid-column-' + miscUtil.escapeCssIdentifier(colId, '-'), css);
				this._columnStyles[sId] = rule;
			}
			return rule;
		},
		///增加
		_configColumn: function (column, rowColumns, prefix) {
			var style = {},
				b;
			///增加 cell 的 style
			if(column.style){
				rias.mixinDeep(style, rias.dom.styleToObject(column.style));
				b = 1;
			}
			if(column.align){
				style["text-align"] = column.align;
				b = 1;
			}
			if(b){
				this.styleColumn(column.id, style, " .dgrid-content");
				this.styleColumn(column.id, style, " .dgrid-footer-summary-row");
			}
			this.inherited(arguments);
		},
		_defaultRenderCell: function (object, value, td) {
			if (this.formatter) {
				// Support formatter, with or without formatterScope
				var formatter = this.formatter,
					formatterScope = this.grid.formatterScope;
				/// 增加 try..catch
				/// 改为 when
				try{
					rias.when(typeof formatter === 'string' && formatterScope ?
						formatterScope[formatter](value, object) : this.formatter(value, object), function(result){
						td.innerHTML = result;
					}, function(){
						td.appendChild(rias.dom.doc.createTextNode(value));
					});
				}catch(e){
					console.error(rias.captureStackTrace(e));
					td.appendChild(rias.dom.doc.createTextNode(value));
				}
			}
			else if (value != null) {
				td.appendChild(rias.dom.doc.createTextNode(value));
			}
		},

		resize: function (changeSize, resultSize) {
			/// 增加 box 判断，即 visible
			var box = this.inherited(arguments);
			if(box){
				// extension of List.resize to allow accounting for
				// column sizes larger than actual grid area
				var headerTableNode = this.headerNode.firstChild,
					contentNode = this.contentNode,
					width;
				// Force contentNode width to match up with header width.
				contentNode.style.width = ''; // reset first
				if (contentNode && headerTableNode) {
					if ((width = headerTableNode.offsetWidth) > contentNode.offsetWidth) {
						// update size of content node if necessary (to match size of rows)
						// (if headerTableNode can't be found, there isn't much we can do)
						contentNode.style.width = width + 'px';
					}
				}
			}
			return box;
		}
	});

	return Grid;

});