//RIAStudio client runtime widget - Grid

///修改 gridx/support/GotoPagePane.js 为继承至 ContentPane
define([
	"rias",
	"rias/riasw/grid/gridx/getGridXRiasd",
	//"rias/riasw/mobile/scrollable",
	"gridx/Grid",
	"gridx/modules/Body",// GridX 已默认
	'gridx/support/query',
	"gridx/core/model/cache/Sync",//在 defaultParams() 中选择
	"gridx/core/model/cache/Async",//在 defaultParams() 中选择
	'gridx/modules/Bar',//需要扩展
	'gridx/support/LinkPager',//需要扩展
	'gridx/support/LinkSizer',//需要扩展
	'gridx/modules/CellWidget',//需要扩展
	'gridx/modules/ColumnLock',//需要扩展
	"rias/riasw/form/NumberTextBox", "gridx/support/GotoPageButton",//需要扩展
	'gridx/modules/select/_RowCellBase',//需要扩展
	'gridx/modules/extendedSelect/_Base',//需要扩展
	'gridx/modules/extendedSelect/Cell',//需要扩展
	'gridx/modules/extendedSelect/Row',//需要扩展
	'gridx/modules/extendedSelect/Column',//在 defaultParams() 中设置
	//"gridx/core/model/extensions/FormatSort",///服务器端 sort 不能用
	"gridx/core/model/extensions/Mark",
	"gridx/core/model/extensions/Modify",
	"gridx/core/model/extensions/Move",
	"gridx/core/model/extensions/Query",
	"gridx/core/model/extensions/Sort",
	//'rias/riasw/grid/gridx/ReloadButton',
	//"gridx/modules/Header",// GridX 已默认
	//"gridx/modules/View",// GridX 已默认
	//"gridx/modules/VLayout",// GridX 已默认
	//"gridx/modules/HLayout",// GridX 已默认
	//"gridx/modules/VScroller",// GridX 已默认
	//"gridx/modules/HScroller",// GridX 已默认
	//"gridx/modules/ColumnWidth",// GridX 已默认
	//"gridx/modules/Focus",// GridX 已默认
	'gridx/modules/ColumnResizer',
	'gridx/modules/VirtualVScroller',//在 defaultParams() 中设置
	'gridx/modules/SingleSort',//在 defaultParams() 中设置
	'gridx/modules/NestedSort',//在 defaultParams() 中设置
	//'gridx/modules/Sort',//不需要显式
	'gridx/modules/select/Row',//在 defaultParams() 中设置
	'gridx/modules/select/Column',//在 defaultParams() 中设置
	'gridx/modules/select/Cell',//在 defaultParams() 中设置
	'gridx/modules/move/Row',//在 defaultParams() 中设置
	'gridx/modules/move/Column',
	'gridx/modules/dnd/Row',//在 defaultParams() 中设置
	'gridx/modules/dnd/Column',//在 defaultParams() 中设置
	'gridx/modules/Pagination',//在 defaultParams() 中设置
	'gridx/modules/pagination/PaginationBar',//在 defaultParams() 中设置
	'gridx/modules/pagination/PaginationBarDD',//在 defaultParams() 中设置
	'gridx/modules/Filter',
	'gridx/modules/filter/FilterBar',
	//'gridx/modules/filter/QuickFilter',//暂时不用
	'gridx/modules/Edit',
	'gridx/modules/RowHeader',
	'gridx/modules/IndirectSelect',//在 defaultParams() 中设置
	'gridx/modules/IndirectSelectColumn',//在 defaultParams() 中设置
	//'gridx/modules/Persist',//暂时不用
	'gridx/modules/Menu',
	'gridx/modules/Dod',
	'gridx/modules/Tree',
	'gridx/modules/RowLock',
	//'gridx/modules/ToolBar',//兼容老版本，可以不用
	'gridx/modules/SummaryBar',//在 defaultParams() 中设置
	//'gridx/modules/NavigableCell',//不需要显式
	'gridx/modules/TouchScroll',//在 defaultParams() 中设置
	'gridx/modules/TouchVScroller',//在 defaultParams() 中设置
	'gridx/modules/HiddenColumns',//暂时不用
	//'gridx/modules/GroupHeader',//要影响 Column.width，暂时不用
	//'gridx/modules/PagedBody',//该模块有问题，运行速度很慢
	//'gridx/modules/AutoPagedBody',//该模块有问题，运行速度很慢
	'gridx/modules/HeaderMenu'
	//'gridx/modules/SlantedHeader',//暂时不用
	//'gridx/modules/ExpandableColumn',//暂时不用
	//'gridx/modules/Layer',//暂时不用
	//'gridx/modules/StructureSwitch'//暂时不用
], function(rias, getGridXRiasd, //scrrollable,
			_Widget, Body, query, Sync, Async, Bar, LinkPager, LinkSizer, CellWidget, ColumnLock, NumberTextBox, GotoPageButton,
			SelectRowCellBase, ExtendedSelectBase, ExtendedSelectCell, ExtendedSelectRow) {

	//定义默认的模块，适用于桌面浏览器，modile Grid另行定义
	var modules = [
		//"gridx/modules/Header",// GridX 已默认
		//"gridx/modules/View",// GridX 已默认
		//"gridx/modules/Body",// GridX 已默认
		//"gridx/modules/VLayout",// GridX 已默认
		//"gridx/modules/HLayout",// GridX 已默认
		//"gridx/modules/VScroller",// GridX 已默认
		//"gridx/modules/HScroller",// GridX 已默认
		//"gridx/modules/ColumnWidth",// GridX 已默认
		//"gridx/modules/Focus",// GridX 已默认
		//"gridx/core/model/cache/Sync",//在 defaultParams() 中设置
		//"gridx/core/model/cache/Async",//在 defaultParams() 中设置
		{
			moduleClass: 'gridx/modules/ColumnResizer',
			minWidth: 20,
			detectWidth: 3///列调整的感知宽度
		},
		//'gridx/modules/VirtualVScroller',//在 defaultParams() 中设置
		//'gridx/modules/SingleSort',//在 defaultParams() 中设置
		//'gridx/modules/NestedSort',//在 defaultParams() 中设置
		//'gridx/modules/Sort',//不需要显式
		'gridx/modules/ColumnLock',
		//'gridx/modules/select/Row',//在 defaultParams() 中设置
		//'gridx/modules/select/Column',//在 defaultParams() 中设置
		//'gridx/modules/select/Cell',//在 defaultParams() 中设置
		//'gridx/modules/extendedSelect/Row',//在 defaultParams() 中设置
		//'gridx/modules/extendedSelect/Column',//在 defaultParams() 中设置
		//'gridx/modules/extendedSelect/Cell',//在 defaultParams() 中设置
		//'gridx/modules/move/Row',//在 defaultParams() 中设置
		'gridx/modules/move/Column',
		//'gridx/modules/dnd/Row',//在 defaultParams() 中设置
		//'gridx/modules/dnd/Column',//在 defaultParams() 中设置
		'gridx/modules/Pagination',//在 defaultParams() 中设置
		//'gridx/modules/pagination/PaginationBar',//在 defaultParams() 中设置
		//'gridx/modules/pagination/PaginationBarDD',//在 defaultParams() 中设置
		//'gridx/modules/Filter',//在 defaultParams() 中设置
		//'gridx/modules/filter/FilterBar',//在 defaultParams() 中设置
		//'gridx/modules/filter/QuickFilter',//暂时不用
		'gridx/modules/CellWidget',
		//'gridx/modules/Edit',//在 defaultParams() 中设置
		//{moduleClass: 'gridx/modules/RowHeader', width: "28px"},//在 defaultParams() 中设置
		//'gridx/modules/IndirectSelect',//在 defaultParams() 中设置
		//'gridx/modules/IndirectSelectColumn',//在 defaultParams() 中设置
		//'gridx/modules/Persist',//暂时不用
		'gridx/modules/Menu',
		//'gridx/modules/Dod',//在 defaultParams() 中设置
		//'gridx/modules/Tree',//在 defaultParams() 中设置
		'gridx/modules/RowLock',
		//'gridx/modules/ToolBar',//兼容老版本，可以不用
		//'gridx/modules/SummaryBar',//在 defaultParams() 中设置
		//'gridx/modules/Bar',//不需要显式
		//'gridx/modules/NavigableCell',//不需要显式
		//'gridx/modules/TouchScroll',//在 defaultParams() 中设置
		//'gridx/modules/TouchVScroller',//在 defaultParams() 中设置
		'gridx/modules/HiddenColumns',//暂时不用
		//'gridx/modules/GroupHeader',//要影响 Column.width，暂时不用
		//'gridx/modules/PagedBody',//该模块有问题，运行速度很慢
		//'gridx/modules/AutoPagedBody',//该模块有问题，运行速度很慢
		'gridx/modules/HeaderMenu'
		//'gridx/modules/SlantedHeader',//暂时不用
		//'gridx/modules/ExpandableColumn',//暂时不用
		//'gridx/modules/Layer',//暂时不用
		//'gridx/modules/StructureSwitch'//暂时不用
	];
	function addM(params, m){
		if(!rias.isArray(m)){
			m = [m];
		}
		for(var i = 0, l = m.length; i < l; i++){
			if(rias.indexOf(params.modules, m[i]) < 0){
				params.modules.push(m[i]);
			}
		}
	}
	var modelExt = [
		//"gridx/core/model/extensions/FormatSort",///服务器端 sort 不能用
		"gridx/core/model/extensions/Sort",
		//"gridx/core/model/extensions/Query",
		//"gridx/core/model/extensions/Move",///FIXME:zensst。加载后 url 生成不正确
		"gridx/core/model/extensions/Mark",
		"gridx/core/model/extensions/Modify"
	];
	function addModelExt(params, m){
		if(!params.modelExtensions){
			params.modelExtensions = [];
		}
		if(!rias.isArray(m)){
			m = [m];
		}
		for(var i = 0, l = m.length; i < l; i++){
			if(rias.indexOf(params.modelExtensions, m[i]) < 0){
				params.modelExtensions.push(m[i]);
			}
		}
	}

	_Widget.extend({
		query: query,
		_childWidgets: {},
		clear: function(queryUrl, clearStore, clearView){
			var g = this;
			clearView = (clearView === undefined) || !!clearView;
			clearStore = (clearStore === undefined) || !!clearStore;
			if(clearStore){
				g.model.clearCache();
				g.store.close();//gridx的cache.clear()后是否有必要？
			}
			if(clearStore || clearView){
				g.body.unrenderRows(g.body.renderCount);
				g.view._clear();
			}
			//g.select.row.clear(true);///必须设为true，否则会触发 onChange，导致提前 query
		},
		destroy: function(){//ToDo:zensst.隐藏 dod 时，删除，释放资源。
			var w;
			for(w in this._childWidgets){
				this._childWidgets[w].destroyRecursive();
				delete this._childWidgets[w];
			}
			this.inherited(arguments);
		}
	});

	Body.extend({
		_loadFail: function(e){
			console.error(e);
			var en = this.grid.emptyNode;
			if(/Timeout/ig.test(e.message)){
				en.innerHTML = "网络超时，请重试...";
			}else{
				en.innerHTML = this.arg('loadFailInfo', this.grid.nls.loadFailInfo);
			}
			en.style.zIndex = 1;
			this.domNode.innerHTML = '';
			this._err = e;
			this.onEmpty();
			this.onLoadFail(e);
		}
	});

	//增加plugin的grid属性，用于plugin的事件函数取grid。
	Bar.extend({
		load: function(args, startup){
			var t = this;
			function _child(p){
				rias.forEach(p.getChildren(), function(c){
					_child(c);
				});
				if(!p.grid){
					p.grid = t.grid;
				}
			}
			t._init();
			t.loaded.callback();
			startup.then(function(){
				t._forEachPlugin(function(plugin){
					_child(plugin);
					if(plugin && plugin.startup){
						plugin.startup();
					}
				});
				setTimeout(function(){
					t.grid.vLayout.reLayout();
				}, 10);
			});
		},
		_normalizePlugin: function(def){
			if(!def || !rias.isObject(def) || rias.isFunction(def)){
				//def is a constructor or class name
				def = {
					pluginClass: def
				};
			}else if(def.domNode){
				//def is a widget
				def = {
					plugin: def
				};
			}else{
				//def is a configuration object.
				//Shallow copy, so user's input won't be changed.
				def = rias.mixin({}, def);
			}
			if(rias.isString(def.pluginClass)){
				try{
					def.pluginClass = rias.require(def.pluginClass);
				}catch(e){
					console.error(e);
				}
			}
			if(rias.isFunction(def.pluginClass)){
				def.grid = this.grid;
			}else{
				def.pluginClass = null;
			}
			if(!def.ownerRiasw){
				def.ownerRiasw = this.grid;
			}
			return def;
		}
	});
	//增加 LinkPager 的 <span> 中页码前后空格。
	LinkPager.extend({
		refresh: function(){
			var t = this,
				p = t.grid.pagination,
				pageCount = p.pageCount(),
				currentPage = p.currentPage(),
				count = t.visibleSteppers,
				sb = [], tabIndex = t._tabIndex,
				disableNext = false,
				disablePrev = false,
				ellipsis = '<span class="gridxPagerStepperEllipsis">&hellip;</span>',
				substitute = rias.substitute,
				stepper = function(page){
					return ['<span class="gridxPagerStepperBtn gridxPagerPage ',
						currentPage == page ? 'gridxPagerStepperBtnActive' : '',
						'" pageindex="', page,
						'" title="', substitute(t.pageIndexTitle, [page + 1]),
						'" aria-label="', substitute(t.pageIndexTitle, [page + 1]),
						'" tabindex="', tabIndex, '">&nbsp;', substitute(t.pageIndex, [page + 1]),
						'&nbsp;</span>'].join('');
				};
			if(typeof count != 'number' || count <= 0){
				count = 3;
			}
			if(pageCount){
				var firstPage = currentPage - Math.floor((count - 1) / 2),
					lastPage = firstPage + count - 1;
				if(firstPage < 1){
					firstPage = 1;
					lastPage = count - 1;
				}else if(pageCount > count && firstPage >= pageCount - count){
					firstPage = pageCount - count;
				}
				if(lastPage >= pageCount - 1){
					lastPage = pageCount - 2;
				}
				sb.push(stepper(0));
				if(pageCount > 2){
					if(firstPage > 1){
						sb.push(ellipsis);
					}
					for(var i = firstPage; i <= lastPage; ++i){
						sb.push(stepper(i));
					}
					if(lastPage < pageCount - 2){
						sb.push(ellipsis);
					}
				}
				if(pageCount > 1){
					sb.push(stepper(pageCount - 1));
				}
			}
			t._pageBtnContainer.innerHTML = sb.join('');

			if(!currentPage || currentPage === pageCount - 1){
				disablePrev = !currentPage || pageCount <= 1;
				disableNext = currentPage || pageCount <= 1;
			}
			rias.dom.toggleClass(t._nextPageBtn, 'gridxPagerStepperBtnDisable gridxPagerNextPageDisable', disableNext);
			rias.dom.toggleClass(t._prevPageBtn, 'gridxPagerStepperBtnDisable gridxPagerPrevPageDisable', disablePrev);

			t.grid.vLayout.reLayout();
			if(t.focused){
				t._focusNextBtn();
			}
		}
	});
	//增加 LinkSizer 的 <span> 中页码前后空格。
	LinkSizer.extend({
		refresh: function(){
			var t = this,
				sb = [],
				tabIndex = t._tabIndex,
				separator = t.sizeSeparator,
				currentSize = t.grid.pagination.pageSize(),
				substitute = rias.substitute;
			for(var i = 0, len = t.sizes.length; i < len; ++i){
				var pageSize = t.sizes[i],
					isAll = false;
				//pageSize might be invalid inputs, so be strict here.
				if(!(pageSize > 0)){
					pageSize = 0;
					isAll = true;
				}
				sb.push('<span class="gridxPagerSizeSwitchBtn ',
					currentSize === pageSize ? 'gridxPagerSizeSwitchBtnActive' : '',
					'" pagesize="', pageSize,
					'" title="', isAll ? t.pageSizeAllTitle : substitute(t.pageSizeTitle, [pageSize]),
					'" aria-label="', isAll ? t.pageSizeTitle : substitute(t.pageSizeTitle, [pageSize]),
					'" tabindex="', tabIndex, '">&nbsp;', isAll ? t.pageSizeAll : substitute(t.pageSize, [pageSize]),
					'&nbsp;</span>',
					//Separate the "separator, so we can pop the last one.
					'<span class="gridxPagerSizeSwitchSeparator">' + separator + '</span>');
			}
			sb.pop();
			t.domNode.innerHTML = sb.join('');
			t.grid.vLayout.reLayout();
		}
	});
	//增加 ownerRiasw
	///TODO:zensst. 由于 真实的 CellWidget 未 publish，只能修改源文件。一共三处：postMixInProperties 和 2个 ownerRiasw。
	/*CellWidget.extend({
		_prepareCellWidget: function(cell){
			var col = cell.column.def(),
				widget = this._getSpecialWidget(cell);
			if(!widget){
				widget = col._backupWidgets.shift();
				if(!widget){
					widget = new CellWidget({
						//ownerRiasw: this.grid,
						content: col.userDecorator(),
						setCellValue: col.setCellValue
					});
					this.onCellWidgetCreated(widget, cell.column);
				}
				col._cellWidgets[cell.row.id] = widget;
			}
			widget.cell = cell;
			widget.setValue(cell.data(), cell.rawData(), true);
			return widget;
		},
		_getSpecialWidget: function(cell){
			var rowDecs = this._decorators[cell.row.id];
			if(rowDecs){
				var cellDec = rowDecs[cell.column.id];
				if(cellDec){
					if(!cellDec.widget && cellDec.decorator){
						try{
							var widget = cellDec.widget = new CellWidget({
								//ownerRiasw: this.grid,
								content: cellDec.decorator(cell.data(), cell.row.id, cell.row.visualIndex(), cell),
								setCellValue: cellDec.setCellValue
							});
							this.onCellWidgetCreated(widget, cell.column);
						}catch(e){
							console.error('Edit:', e);
						}
					}
					return cellDec.widget;
				}
			}
			return null;
		}
	});*/
	//修改，取消 return
	ColumnLock.extend({
		lock: function(/*Integer*/count){
			if(this.grid.columnWidth && this.grid.columnWidth.arg('autoResize')){ return; }
			if(count >= this.grid._columns.length){
				console.warn('Warning: lock count is larger than columns count, do nothing.');
				return;
			}
			var i = 0,
				totalCount = 0;

			for(i = 0; i < count; i++){
				totalCount += 8 + parseInt(this.grid._columns[i].width, 10);
			}
			if(this.grid.bodyNode.clientWidth - totalCount < 10){
				console.warn('Warning: locked total columns width exceed grid width, do nothing.');
				//return;///return 后，导致动态创建 gridx 的时候有可能界面混乱，改为继续执行。
			}
			this.unlock();

			if(count){
				rias.dom.addClass(this.grid.domNode, 'gridxColumnLock');
			}

			this.count = count;
			this._updateUI();
		},
		_lockColumns: function(rowNode){
			// summary:
			//	Lock columns for one row
			/// 判断 rowNode.firstChild
			if(!this.count || this.count >= this.grid._columns.length || !rowNode.firstChild || !rowNode.firstChild.rows){
				return;
			}

			var isHeader = rias.dom.hasClass(rowNode, 'gridxHeaderRowInner');
			var ltr = this.grid.isLeftToRight();
			var r = rowNode.firstChild.rows[0], i;
			rowNode.firstChild.style.height = 'auto';	//Remove the height of the last locked state.
			for(i = 0; i < this.count; i++){
				rias.dom.setStyle(r.cells[i], 'height', 'auto');
			}

			var h1 = rias.dom.getContentBox(r.cells[r.cells.length - 1]).h,
				h2 = rias.dom.getMarginBox(r.cells[r.cells.length - 1]).h;

			//FIX ME: has('ie')is not working under IE 11
			//use has('trident') here to judget IE 11
			if(rias.has('ie') > 8 || rias.has('trident') > 4 ){
				//in IE 9 +, sometimes computed height will contain decimal pixels like 34.4 px,
				//so that the locked cells will have different height with the unlocked ones.
				//plus the height by 1 can force IE to ceil the decimal to integer like from 34.4px to 35px
				var h3 = rias.dom.getComputedStyle(rowNode.firstChild).height;
				if(String(h3).toString().indexOf('.') >= 0){		//decimal
					h2++;
					h1++;
				}
			}
			rias.dom.setStyle(rowNode.firstChild, 'height', h2 + 'px');

			var lead = isHeader ? this.grid.hLayout.lead : 0,
				pl = lead,
				cols = this.grid._columns;
			for(i = 0; i < this.count; i++){
				var cell = r.cells[i],
					s;
				rias.dom.addClass(cell, 'gridxLockedCell');

				s = {height: h1 + 'px'};
				s[ltr ? 'left' : 'right'] = pl + 'px';
				rias.dom.setStyle(cell, s);

				pl += cell.offsetWidth;
			}
			rowNode.style[ltr ? 'paddingLeft' : 'paddingRight'] = pl - lead + 'px';
			rowNode.style.width = this.grid.bodyNode.offsetWidth - pl + lead + 'px';

			//This is useful for virtual scrolling.
			rowNode.scrollLeft = this.grid.hScroller ? this.grid.hScroller.domNode.scrollLeft : 0;

			if(rias.dom.hasClass(rowNode, 'gridxRow')){
				var rowid = rowNode.getAttribute('rowid') + '';
				this.grid.body.onRowHeightChange(rowid);
			}
		}
	});
	//用 clear 代替 clearMark
	SelectRowCellBase.extend({
		selectById: function(rowId, columnId){
			var t = this,
				m = t.model,
				type = t._getMarkType(columnId),
				item = t._type == 'row' ? rowId : [rowId, columnId];
			if(t.arg('enabled') && t._isSelectable(item)){
				if(!t.arg('multiple')){
					//m.clearMark(type);
					t.clear(rowId);
				}
				m.markById(rowId, 1, type);
				m.when();
			}
		}
	});
	//需要判断 g.domNode
	ExtendedSelectBase.extend({
		load: function(){
			var t = this, g = t.grid, doc = rias.doc;
			g.domNode.setAttribute('aria-multiselectable', true);
			t._refSelectedIds = [];
			t.subscribe('gridClearSelection_' + g.id, function(type){
				if(type != t._type){
					t.clear();
				}
			});
			t.batchConnect(
				[g.body, 'onRender', '_onRender'],
				[doc, 'onmouseup', '_end'],
				[doc, 'onkeydown', function(e){
					if(g.domNode && e.keyCode == rias.keys.SHIFT){
						rias.dom.setSelectable((rias.has('ie') > 9  || rias.has('trident') > 5)? doc.body : g.domNode, false);
					}
				}],
				[doc, 'onkeyup', function(e){
					if(g.domNode && e.keyCode == rias.keys.SHIFT){
						rias.dom.setSelectable((rias.has('ie') > 9  || rias.has('trident') > 5) ? doc.body : g.domNode, true);
					}
				}]
			);
			t._init();
			t.loaded.callback();
		}
	});
	//需要判断 e
	ExtendedSelectCell.extend({
		_onMoveToCell: function(rowVisIndex, colIndex, e){
			if(e && e.shiftKey){
				var t = this,
					g = t.grid,
					rid = t._getRowId(rowVisIndex),
					cid = g._columns[colIndex].id;
				//t._start(createItem(rid, rowVisIndex, cid, colIndex), g._isCtrlKey(e), 1);	//1 as true
				t._start({
					rid: rid,
					r: rowVisIndex,
					cid: cid,
					c: colIndex
				}, g._isCtrlKey(e), 1);	//1 as true
				t._end();
			}
		}
	});
	//需要判断 e
	ExtendedSelectRow.extend({
		_onMoveToCell: function(rowVisIndex, colIndex, e){
			var t = this;
			if(t.arg('triggerOnCell') && e && e.shiftKey && (e.keyCode == rias.keys.UP_ARROW || e.keyCode == rias.keys.DOWN_ARROW)){
				t._start({row: rowVisIndex}, t.grid._isCtrlKey(e), 1);	//1 as true
				t._end();
			}
		}
	});

	rias.theme.loadCss([
		"form/Button.css",
		"gridx/extend/Gridx.css"
	]);

	var riasType = "rias.riasw.grid.GridX";
	var Widget = rias.declare(riasType, [_Widget], {

		startup: function(){
			var self = this;
			this.inherited(arguments);
			if(this.onRowSelectionChange){
				this.own(rias.after(this.select.row, 'onSelectionChange', function(newId, oldId){
					self.onRowSelectionChange(newId, oldId);
				}, true));
			}
			if(this.onColumnSelectionChange){
				this.own(rias.after(this.select.column, 'onSelectionChange', function(newId, oldId){
					self.onColumnSelectionChange(newId, oldId);
				}, true));
			}
			if(this.onCellSelectionChange){
				this.own(rias.after(this.select.cell, 'onSelectionChange', function(newId, oldId){
					self.onCellSelectionChange(newId, oldId);
				}, true));
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswGridIcon",
		iconClass16: "riaswGridIcon16",
		defaultParams: function(params){
			var p = getGridXRiasd(params);// rias.mixinDeep({}, params);
			p.modules = rias.concat(p.modules || [], modules, true);
			p.modelExt = rias.concat(p.modelExt || [], modelExt, true);
			addModelExt(p, p.modelExt);

			if(p.cache){
				p.cacheClass = p.cache;
				delete p.cache;
			}
			if(!p.cacheClass){
				p.cacheClass = "gridx/core/model/cache/Async";
			}
			if(!p.store){
				if(~p.cacheClass.indexOf("Async")){
					p.store = {
						_riaswType: "rias.riasw.store.JsonRestStore"
					};
				}else{
					p.store = {
						_riaswType: "rias.riasw.store.MemoryStore"
					};
				}
			}

			if(p.edit){
				addM(p, ['gridx/modules/Edit']);
			}
			delete p.edit;

			if((p.extendedSelect || p.extendedSelect === undefined) && (p.selectRowMultiple || p.selectRowMultiple === undefined)){
				addM(p, [
					'gridx/modules/extendedSelect/Row',
					'gridx/modules/extendedSelect/Column',
					'gridx/modules/extendedSelect/Cell'
				]);
			}else{
				/*if(p.extendedSelectRow){
					addM(p, ['gridx/modules/extendedSelect/Row']);
					delete p.extendedSelectRow;
				}else{
					addM(p, ['gridx/modules/select/Row']);
				}
				if(p.extendedSelectColumn){
					addM(p, ['gridx/modules/extendedSelect/Column']);
					delete p.extendedSelectColumn;
				}else{
					addM(p, ['gridx/modules/select/Column']);
				}
				if(p.extendedSelectCell){
					addM(p, ['gridx/modules/extendedSelect/Cell']);
					delete p.extendedSelectCell;
				}else{
					addM(p, ['gridx/modules/select/Cell']);
				}*/
				addM(p, [
					'gridx/modules/select/Row',
					'gridx/modules/select/Column',
					'gridx/modules/select/Cell'
				]);
			}
			delete p.extendedSelect;
			delete p.extendedSelectRow;
			delete p.extendedSelectColumn;
			delete p.extendedSelectCell;
			if(p.indirectSelectColumn){
				addM(p, ['gridx/modules/IndirectSelectColumn']);
			}else if(p.indirectSelect === undefined || p.indirectSelect){
				addM(p, [{
					moduleClass: 'gridx/modules/RowHeader',
					width: "28px"
				}, 'gridx/modules/IndirectSelect']);
			}
			delete p.indirectSelectColumn;
			delete p.indirectSelect;
			if(p.rowHeader){
				addM(p, [{
					moduleClass: 'gridx/modules/RowHeader',
					width: "28px"
				}]);
			}
			delete p.rowHeader;

			if(!p.pagination){
				addM(p, ['gridx/modules/SummaryBar']);
			}else{
				addM(p, [{
					moduleClass: 'gridx/modules/Pagination',
					initialPage: 0,
					initialPageSize: p.pageSize ? p.pageSize : 15
				}]);
				if(p.paginationBarDD){
					addM(p, ['gridx/modules/pagination/PaginationBarDD']);
					delete p.paginationBarDD;
				}else{
					addM(p, [{
						moduleClass: 'gridx/modules/pagination/PaginationBar',
						numberTextBoxClass: NumberTextBox,
						visibleSteppers: 7,
						sizeSeparator: "|",
						position: "bottom",
						sizes: p.pageSizes ? p.pageSizes : [15, 30, 60]
					}]);
				}
			}
			delete p.pagination;
			delete p.pageSize;
			delete p.pageSizes;

			if(p.singleSort){
				addM(p, ['gridx/modules/SingleSort']);
			}else{
				addM(p, ['gridx/modules/NestedSort']);
			}
			delete p.singleSort;

			if(p.filter){
				addM(p, [{
					moduleClass: 'gridx/modules/Filter',
					serverMode: true
				},{
					moduleClass: 'gridx/modules/filter/FilterBar',
					maxRuleCount: Infinity,
					closeFilterBarButton: true,
					defineFilterButton: true,
					tooltipDelay: 300,
					ruleCountToConfirmClearFilter: 2
				}]);
			}
			delete p.filter;

			if(p.tree){
				p.store.isTreeStore = true;
				addM(p, [rias.mixinDeep({
					moduleClass: 'gridx/modules/Tree',
					nested: false
				}, p.tree)]);
			}
			delete p.tree;

			if(p.dod){
				addM(p, [rias.mixinDeep({
					moduleClass: 'gridx/modules/Dod',
					useAnimation: true,
					duration: rias.defaultDuration,
					//autoClose: true,
					defaultShow: false,
					showExpando: true
				}, p.dod)]);
			}
			delete p.dod;
			if(p.dnd){
				addM(p, ['gridx/modules/dnd/Row', 'gridx/modules/dnd/Column']);
			}
			delete p.dnd;
			/*if(p.touch){
				addM(p, ['gridx/modules/TouchVScroller']);
			}else{
				addM(p, ['gridx/modules/VirtualVScroller']);
			}*/
			delete p.touch;

			p = rias.mixinDeep({
				query: {
				},
				pageSize: 15,
				pageSizes: [15, 30, 100],
				//content: "<table></table>",
				structure: [
					{field: 'id',       name: 'ID',     width: 'auto'},
					{field: 'label',    name: 'Label',  width: 'auto'}
				],
				autoWidth: false,
				autoHeight: false,
				headerDefaultColumnWidth: 50,
				selectRowTriggerOnCell: false,
				selectRowMultiple: true//,
				//vScrollerLazy: true,
				//vScrollerLazyTimeout: 200,
				//vScrollerBuffSize: 200
			}, p);
			return p;
		},
		initialSize: {},
		style: "min-width:1em; min-height:1em;",
		"property": {
			"autoWidth": {
				"datatype": "boolean",
				"description": "Grid attribute",
				"defaultValue": true,
				"hidden": true
			},
			"autoHeight": {
				"datatype": "boolean",
				"description": "Grid attribute",
				"defaultValue": true,
				"hidden": true
			},

			"headerDefaultColumnWidth": {
				"datatype": "number",
				"description": "Header attribute",
				"defaultValue": 50,
				"hidden": true
			},

			"vScrollerLazy": {
				"datatype": "boolean",
				"description": "VScroller attribute",
				"defaultValue": true,
				"hidden": true
			},
			"vScrollerLazyTimeout": {
				"datatype": "number",
				"description": "VScroller attribute",
				"defaultValue": 200,
				"hidden": true
			},
			"vScrollerBuffSize": {
				"datatype": "number",
				"description": "VScroller attribute",
				"defaultValue": 5,
				"hidden": true
			},

			modules: {
				"datatype": "array",
				"defaultValue": "[]",
				"option": [
					{"value": "gridx/modules/AutoScroll"},
					{"value": "gridx/modules/Bar"},
					{"value": "gridx/modules/CellWidget"},
					{"value": "gridx/modules/ColumnGroupResizer"},//要影响 Column.width，暂时不用
					{"value": "gridx/modules/ColumnLock"},
					{"value": "gridx/modules/ColumnResizer"},
					{"value": "gridx/modules/Dod"},
					{"value": "gridx/modules/Edit"},
					{"value": "gridx/modules/Filter"},
					//{"value": "gridx/modules/GroupHeader"},//要影响 Column.width，暂时不用
					{"value": "gridx/modules/HeaderMenu"},
					{"value": "gridx/modules/HiddenColumns"},
					{"value": "gridx/modules/IndirectSelect"},
					{"value": "gridx/modules/IndirectSelectColumn"},
					{"value": "gridx/modules/Menu"},
					{"value": "gridx/modules/NavigableCell"},
					{"value": "gridx/modules/NestedSort"},
					{"value": "gridx/modules/PageBody"},
					{"value": "gridx/modules/Pagination"},
					{"value": "gridx/modules/Persist"},
					{"value": "gridx/modules/Printer"},
					{"value": "gridx/modules/RowHeader"},
					{"value": "gridx/modules/RowLock"},
					{"value": "gridx/modules/SingleSort"},
					{"value": "gridx/modules/SummaryBar"},
					{"value": "gridx/modules/TitleBar"},
					{"value": "gridx/modules/ToolBar"},
					{"value": "gridx/modules/TouchScroll"},
					{"value": "gridx/modules/TouchVScroller"},
					{"value": "gridx/modules/Tree"},
					{"value": "gridx/modules/VirtualVScroller"}
				],
				"description": "Modules"
			},

			"columnResizerMinWidth": {
				"datatype": "number",
				"description": "ColumnResizer attribute",
				"defaultValue": 10,
				"hidden": true
			},
			"columnResizerDetectWidth": {
				"datatype": "number",
				"description": "ColumnResizer attribute",
				"defaultValue": 20,
				"hidden": true
			},

			"treeNested": {
				"datatype": "boolean",
				"description": "Tree attribute",
				"defaultValue": true,
				"hidden": true
			},

			"columnLockCount": {
				"datatype": "number",
				"description": "ColumnLock attribute",
				"defaultValue": 1,
				"hidden": true
			},

			"dodUseAnimation": {
				"datatype": "boolean",
				"description": "Dod attribute",
				"defaultValue": true,
				"hidden": true
			},
			"dodDuration": {
				"datatype": "number",
				"description": "Dod attribute",
				"defaultValue": 300,
				"hidden": true
			},
			"dodDefaultShow": {
				"datatype": "boolean",
				"description": "Dod attribute",
				"defaultValue": true,
				"hidden": true
			},
			"dodShowExpando": {
				"datatype": "boolean",
				"description": "Dod attribute",
				"defaultValue": true,
				"hidden": true
			},
			"dodAutoClose": {
				"datatype": "boolean",
				"description": "Dod attribute",
				"defaultValue": true,
				"hidden": true
			},

			"sortPreSort": {
				"datatype": "json",
				"description": "Sort attribute",
				"hidden": true
			},

			"filterBarMaxRuleCount": {
				"datatype": "number",
				"description": "FilterBar attribute",
				"defaultValue":0,
				"hidden": true
			},
			"filterBarCloseFilterBarButton": {
				"datatype": "boolean",
				"description": "FilterBar attribute",
				"defaultValue": true,
				"hidden": true
			},
			"filterBarDefineFilterButton": {
				"datatype": "boolean",
				"description": "FilterBar attribute",
				"defaultValue": true,
				"hidden": true
			},
			"filterBarTooltipDelay": {
				"datatype": "number",
				"description": "FilterBar attribute",
				"defaultValue": 300,
				"hidden": true
			},
			"filterBarRuleCountToConfirmClearFilter": {
				"datatype": "number",
				"description": "FilterBar attribute",
				"defaultValue": 2,
				"hidden": true
			},

			"paginationInitialPage": {
				"datatype": "number",
				"description": "Pagination attribute",
				"defaultValue": 0,
				"hidden": true
			},
			"paginationInitialPageSize": {
				"datatype": "number",
				"description": "Pagination attribute",
				"defaultValue": 10,
				"hidden": true
			},

			"paginationBarVisibleSteppers": {
				"datatype": "number",
				"description": "PaginationBar attribute",
				"defaultValue": 5,
				"hidden": true
			},
			"paginationBarSizeSeparator": {
				"datatype": "string",
				"description": "PaginationBar attribute",
				"defaultValue": "|",
				"hidden": true
			},
			"paginationBarPosition": {
				"datatype": "string",
				"description": "PaginationBar attribute",
				"option": [
					{
						"value": "top"
					},
					{
						"value": "bottom"
					}
				],
				"hidden": true
			},
			"paginationBarSizes": {
				"datatype": "array",
				"description": "PaginationBar attribute",
				"defaultValue": "[10, 20, 50, 200, 0]",
				"hidden": true
			},
			"paginationBarDescription": {
				"datatype": "boolean",
				"description": "PaginationBar attribute",
				"hidden": true
			},
			"paginationBarSizeSwitch": {
				"datatype": "boolean",
				"description": "PaginationBar attribute",
				"hidden": true
			},
			"paginationBarStepper": {
				"datatype": "boolean",
				"description": "PaginationBar attribute",
				"hidden": true
			},
			"paginationBarGotoButton": {
				"datatype": "boolean",
				"description": "PaginationBar attribute",
				"hidden": true
			},

			"rowHeaderWidth": {
				"datatype": "string",
				"description": "RowHeader attribute",
				"defaultValue": "20px",
				"hidden": true
			},

			"selectRowTriggerOnCell": {
				"datatype": "boolean",
				"description": "SelectRow attribute",
				"hidden": true
			},
			"selectRowMultiple": {
				"datatype": "boolean",
				"description": "SelectRow attribute",
				"hidden": true
			},

			"selectColumnMultiple": {
				"datatype": "boolean",
				"description": "SelectColumn attribute",
				"hidden": true
			},

			"selectCellMultiple": {
				"datatype": "boolean",
				"description": "SelectCell attribute",
				"hidden": true
			},

			"moveCellCopy": {
				"datatype": "boolean",
				"description": "MoveCell attribute",
				"hidden": true
			}
		}
	};

	return Widget;

});