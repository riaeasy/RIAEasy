
//RIAStudio client runtime widget - DGrid

define([
	"riasw/riaswBase",
	"dojo/i18n!./nls/dgrid",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_CssStateMixin",

	"riasw/grid/DGridBase",
	"riasw/grid/dgrid/_Store",
	"riasw/grid/dgrid/SummaryFooter",
	"riasw/grid/DGridParamExt",
	"riasw/store/Cache",
	"riasw/store/MemoryStore",

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

	"dstore/Trackable",

	"riasw/sys/ToolButton",
	"riasw/sys/ToolbarSeparator",
	"riasw/sys/Toolbar",
	"riasw/form/Button"

], function(rias, i18n, _WidgetBase, _CssStateMixin,
			DGridBase, _Store, SummaryFooter, DGridParamExt, Cache, Memory,
			//misc, touchUtil,
			List, Grid, OnDemandGrid, CellSelection, ColumnSet, Editor, Keyboard, Selection, Selector, Tree,
			//GridFromHtml, GridWithColumnSetsFromHtml,
			ColumnHider, ColumnResizer, ColumnReorder, CompoundColumns, //DijitRegistry, //Dnd, //Pagination,
			Trackable) {

	function _toXlsColumns(columns){
		function getType(format){
			switch(format){
				case "text":
					return "string";
				case "date":
				case "time":
				case "datetime":
					return "date";
				case "boolean":
					return "boolean";
				default:
					if(/^number/.test(format)){
						return "float";
					}
					return "string";
			}
		}
		function getFormat(format){
			switch(format){
				case "date":
					return rias.datetime.defaultDateFormatStr;
				case "time":
					return rias.datetime.defaultTimeFormatStr;
				case "datetime":
					return rias.datetime.defaultFormatStr;
				default:
					if(/^number/.test(format)){
						l = rias.toInt(format.substring(6), 0);
						return "#,##0" + (l > 0 ? "." + rias.rep("0", l) : "");
					}
					return null;
			}
		}
		var ra = [], l;
		rias.forEach(columns, function(col){
			if(!col.hidden && !col._riasrRowNumColumn && !col._riasrOpColumn && !col._riasrSelectorColumn){
				col = {
					"align": col.align,
					"dataIndex": col.field,
					"format": getFormat(col.format),
					"ptFormat": null,
					"dataFormat": null,
					"type": getType(col.format),
					"width": rias.toInt(col.headerNode.clientWidth, 100),
					"hidden": false,
					"headerAlign": null,
					"wrap": true,
					"text": col.label
				};
				ra.push(col);
			}
		});
		return ra;
	}

	var riaswType = "riasw.grid.DGrid";
	var Widget = rias.declare(riaswType, [_WidgetBase, _CssStateMixin,
		OnDemandGrid, ColumnResizer, ColumnHider, ColumnReorder, CompoundColumns, ColumnSet, //Pagination,
		Keyboard, Selection, Selector, Editor, Tree, SummaryFooter], {

		baseClass: "dgrid",

		_loadingMessage: "<span class='riaswModuleLoading'><span class='dijitInline riaswModuleLoadingIcon'></span>${0}</span>",
		_errorMessage: "<span class='riaswModuleLoading'><span class='dijitInline riaswModuleLoadingError'></span>${0}</span>",
		loadingMessage: rias.i18n.message.loading,
		errorMessage: rias.i18n.message.loadError,

		showToolButtonLabel: true,
		showRowNum: true,

		postMixInProperties: function(){
			this._renderDeferreds = [];
			this.loadingMessage = rias.substitute(this._loadingMessage, [this.loadingMessage]);
			this.errorMessage = rias.substitute(this._errorMessage, [this.errorMessage]);
			this.inherited(arguments);
		},
		buildRendering: function () {
			this.inherited(arguments);
			///增加 _topToolBar
			var self = this,
				p = [], i, l, item, hasSave, hasAbort;
			this._topToolBar = rias.newRiasw({
				ownerRiasw: this,
				_riaswType: "riasw.sys.Toolbar",
				//_riaswAttachPoint: "_topToolBar",
				grid: this
			});
			this._topToolBarNode = this._topToolBar.domNode;
			rias.dom.place(this._topToolBarNode, this.domNode, "first");
			rias.dom.addClass(this._topToolBarNode, 'dgrid-header-tools' + (this.addUiClasses ? ' ui-widget-header' : ''));

			function _do(){
				rias.all(this._renderDeferreds).always(function(arr){
					self._renderDeferreds.length = 0;
					self._topToolBar.set("visible", self._topToolBar.getChildren().length > 0);
					self.resize();
				});
			}
			if(this.topTools && this.topTools.length){
				for(i = 0, l = this.topTools.length; i < l; i++){
					item = this.topTools[i];
					if(item && (item === "toolEdit_Save" || item.toolName === "toolEdit_Save")){
						rias.removeItems(p, "toolEdit_Save");
						hasSave = true;
					}
					if(item && (item === "toolEdit_Abort" || item.toolName === "toolEdit_Abort")){
						rias.removeItems(p, "toolEdit_Abort");
						hasAbort = true;
					}
					p.push(item);
					if(item && (item === "toolEdit" || item.toolName === "toolEdit")){
						if(!hasSave){
							p.push("toolEdit_Save");
							hasSave = true;
						}
						if(!hasAbort){
							p.push("toolEdit_Abort");
							hasAbort = true;
						}
					}

				}
				rias.allInOrder(p, rias.debugDeferredTimeout ? rias.defaultDeferredTimeout >> 2 : 0, function(arr){
					this.cancel();
				}, function(item, i){
					return self.addTopTool(item, i);
				}).then(function(results){
						_do();
					});
			}else{
				_do();
			}
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
		_onDestroy: function(){
			rias.forEach(this._renderDeferreds, function(d){
				if(d){
					d.cancel();
				}
			});
			this._renderDeferreds = undefined;
			this.inherited(arguments);
		},

		addTopTool: function(item, index){
			///注意：默认没有 _riaswIdInModule，如果有需求，需要显式指定，特别要注意的是：Dialog 是 Module。
			///_riaswIdInModule 可以通过 toolName 来获取。
			var self = this,
				p = Widget._internalToolParams,
				ps;
			/// ps 需要用 mixinDeep 副本，避免修改 _internalToolParams
			if(rias.isString(item)){
				///已经存在，则忽略，不创建，不改变 parent。
				if(!this[item]){
					ps = item === "toolRefresh" ? p.toolRefresh :
						item === "toolAux" ? p.toolAux :
							item === "toolAdd" ? p.toolAdd :
								item === "toolDelete" ? p.toolDelete :
									item === "toolEdit" ? p.toolEdit :
										item === "toolEdit_Save" ? p.toolEdit_Save :
											item === "toolEdit_Abort" ? p.toolEdit_Abort :
												item === "toolPrint" ? p.toolPrint :
													item === "toolExport" ? p.toolExport :
										item === "|" ? {
											_riaswType: "riasw.sys.ToolbarSeparator"
										} : undefined;
					if(ps){
						ps = rias.mixinDeep({}, ps);
					}
				}
			}else if(rias.isRiaswParam(item)){
				if(!item.toolName || !this[item.toolName]){
					/// 忽略已经存在的
					ps = item.toolName === "toolRefresh" ? p.toolRefresh :
						item.toolName === "toolAux" ? p.toolAux :
							item.toolName === "toolAdd" ? p.toolAdd :
								item.toolName === "toolDelete" ? p.toolDelete :
									item.toolName === "toolEdit" ? p.toolEdit :
										item.toolName === "toolEdit_Save" ? p.toolEdit_Save :
											item.toolName === "toolEdit_Abort" ? p.toolEdit_Abort :
												item.toolName === "toolPrint" ? p.toolPrint :
													item.toolName === "toolExport" ? p.toolExport :
													{
														iconClass: "logoRiaEasyIcon",
														showLabel: false
													};
					ps = rias.mixinDeep({}, ps, item);
				}else{
					this[item.toolName].placeAt(this._topToolBar, index);
				}
			}else if(rias.isRiasw(item)){
				item.placeAt(this._topToolBar, index);
			}
			if(ps){
				ps = rias.mixin({
					_riaswType: "riasw.sys.ToolButton",
					ownerRiasw: this,
					grid: this,
					showLabel: this.showToolButtonLabel
				}, ps);
				///ps 是 riawParams，故不能用 getOwnerRiasw()
				//ps = rias.decodeRiaswParams(this, ps);
				var d = rias.parseRiasws(ps, ps.ownerRiasw, this._topToolBar, index).then(function(result){
					if(result && result.widgets){
						ps = result.widgets[0];
						if(ps.toolName){
							self[ps.toolName] = ps;
						}
					}
					return result;
				});
				this._renderDeferreds.push(d);
				return d;
			}
		},

		_setModifiedAttr: function(value){
			value = !!value;
			if(!value && !rias.isEmpty(this.dirty)){
				value = true;
				console.error(this.id + ".modified cannot set to false with dirty.");
			}
			this._set("modified", value);
		},
		_setCanEditAttr: function(value){
			value = !!value;
			if(value){
				this.refresh();
			}else if(!rias.isEmpty(this.dirty)){
				value = true;
				console.error(this.id + ".canEdit cannot set to false with dirty.");
			}
			this._set("canEdit", value);
			var btn = this.toolEdit;
			if(btn){
				btn.set("checked", value);
				btn.set("disabled", value);
			}
			btn = this.toolEdit_Save;
			if(btn){
				btn.set("visible", value);
				btn.set("disabled", !value);
			}
			btn = this.toolEdit_Abort;
			if(btn){
				btn.set("visible", value);
				btn.set("disabled", !value);
			}
		},
		onSaveError: function(items, err){
			rias.error(this.id + " save error:" + err + "\nThe error dirty:\n" + rias.toJson(items), this);
		},
		_onSaveError: function(items, err){
			console.error(this.id + " save error:" + err + "\nThe error dirty:\n", items);
			this.onSaveError(items, err);
		},
		afterSave: function(results){
		},
		_afterSave: function(results){
			this.afterSave(results);
		},
		doSave: function(onlySet){
			var self = this;
			return self._trackError('save', {
				onlySet: onlySet
			}).always(function(results){
				console.debug(self.id + ".save results:\n", results);
				///这里先设置 modified，可能在 afterSave 中会使用。
				if(rias.isEmpty(self.dirty)){
					self.set("modified", false);
				}else{
					self.set("modified", true);
					self._onSaveError(self.dirty, results);
				}
				self._afterSave(results);
				return results;
			});
		},
		doRevert: function(){
			var self = this;
			return self._trackError('revert').always(function(){
				console.debug(self.id + ".revert.");
				return true;
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
			if(rias.isRiaswParam(collection)){
				if(!collection.ownerRiasw){
					collection.ownerRiasw = this;
				}
				collection = rias.newRiasw(collection);
			}

			var queryObject = collection.queryObject;
			if(!collection.fetchRange){
				collection = new _Store({
					idProperty: collection.idProperty,
					labelProperty: collection.labelProperty,
					objectStore: this.caching ? Cache(collection, new Memory({
						ownerRiasw: this,
						idProperty: collection.idProperty,
						labelProperty: collection.labelProperty
					})) : collection
				});
			}
			collection.queryObject = queryObject;
			if(!collection.track){
				collection = Trackable.create(collection);
			}
			if(!collection.idProperty){
				collection.idProperty = "id";
			}
			if(!collection.labelProperty){
				collection.labelProperty = "label";
			}
			this.inherited(arguments);
		},
		//getStore: function(){
		//	return this.collection && this.collection.objectStore ? this.collection.objectStore : this.collection;
		//},
		refresh: function(query, options){
			var self = this,
				store = this.collection,
				args = arguments;

			function _do(){
				if(query){
					self._queryObject0 = query;
				}
				store.queryObject = rias.mixinDeep({}, self._queryObject0);
				if(self._renderedCollection){
					self._renderedCollection.queryObject = store.queryObject;
				}

				return rias.when(self.inherited(args, rias.argsToArray(args, 1))).then(function(){
					var summary = {
						rownum: rias.toNumber(self._total, 0)
					};
					if(store){
						if(store.getSummary){
							summary = rias.mixin(summary, store.getSummary());
						}
					}
					self.set('summary', summary);
				}, function(e){
					console.error(self.id + " refresh error:", e);
				});
			}

			options = options || {};
			if(!options.silence && this.get("modified")){
				///不建议 autoSave。
				//if(grid.autoSave){
				//	grid.doSave().always(function(result){
				//		grid.refresh();
				//	});
				//}else{
				return rias.choose({
					content: "数据有修改！\n是否提交保存?",
					caption: "确认",
					actionBar: [
						"btnSave",
						"btnAbort",
						"btnCancel"
					],
					onHide: function(){
						if(rias.formResult.isAbort(this.formResult)){
							self.revert();
							_do();
						}
					},
					onSubmit: function(){
						return self.doSave();
					},
					afterSubmit: function(result){
						return _do();
					}
				}, self, options.around);
				//}
			}else{
				if(options.revert){
					self.revert();
				}
				return _do();
			}
		},

		_resize: function(box){
			box = this.inherited(arguments);
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
		},

		///addRecordParams: {},/// addRecordDialog.params
		///addRecordInitData: {},///addRecordInitData
		addRecord: function(moduleParams, around){
			var grid = this,
				mParams = rias.mixinDeep({}, moduleParams),
				initData = rias.mixinDeep({}, grid.opInitData);
			if(rias.isFunction(grid.addRecordParams)){
				mParams = grid.addRecordParams.apply(grid, [mParams]);
			}else if(rias.isObject(grid.addRecordParams)){
				mParams = rias.mixinDeep(mParams, grid.addRecordParams);
			}
			if(rias.isFunction(grid.addRecordInitData)){
				initData = grid.addRecordInitData.apply(grid, [initData]);
			}else if(rias.isObject(grid.addRecordInitData)){
				initData = rias.mixinDeep(initData, grid.addRecordInitData);
			}
			rias.showModal({
				ownerRiasw: grid,
				//_riaswAttachPoint: "_addDlg",
				//dialogType: "top",
				moduleMeta: grid.viewModule,
				moduleParams: mParams,
				initData: initData,
				popupArgs: {
					parent: grid.viewModuleParent || grid.ownerModule()
				},
				caption: i18n.add,
				query: {
					//id: ""
				},
				actionType: "add",
				actionBar: [
					"btnSubmit",
					"btnAbort"
				],
				onSubmit: function(){
					return rias.when(this.inheritedMeta(arguments)).always(function(result){
						return grid.refresh(null, {}).always(function(){
							return result;
						});
					});
				}
			}, grid, around);
		},
		///deleteRecordParams: {},
		deleteRecoreds: function(moduleParams, ids, around){
			var grid = this,
				mParams = rias.mixinDeep({}, moduleParams);
			if(rias.isFunction(grid.deleteRecordParams)){
				mParams = grid.deleteRecordParams.apply(grid, [mParams]);
			}else if(rias.isObject(grid.deleteRecordParams)){
				mParams = rias.mixinDeep(mParams, grid.deleteRecordParams);
			}
			ids = (rias.isArray(ids) ? ids : rias.isString(ids) ? [ids] : []);
			if(ids.length){
				rias.choose({
					//_riaswAttachPoint: "_deleDlg",
					moduleParams: mParams,
					content: "是否删除[" + ids + "]?",
					caption: i18n.dele,
					onSubmit: function(){
						return rias.when(this.inheritedMeta(arguments)).always(function(result){
							return rias.xhr.dele(grid.target, {
								_idDirty: ids.join(",")//[101, 10101, 010102]
							}).always(function(result){
								if(!result.success || result.success < 1){
									rias.warn("删除失败...", grid, around);
								}
								return grid.refresh(null, {}).always(function(){
									return result;
								});
							});
						});
					}
				}, grid, around);
			}
		},
		///exportRecordParams: {},
		///toExcelParams: {},
		exportRecoreds: function(moduleParams, around){
			var grid = this,
				mParams = rias.mixinDeep({}, moduleParams);
			if(rias.isFunction(grid.exportRecordParams)){
				mParams = grid.exportRecordParams.apply(grid, [mParams]);
			}else if(rias.isObject(grid.exportRecordParams)){
				mParams = rias.mixinDeep(mParams, grid.exportRecordParams);
			}
			rias.choose({
				//_riaswAttachPoint: "_exportDlg",
				moduleParams: mParams,
				content: "是否导出当前查询结果为 Excel 文件?" + (grid._total > 9999 ? "<br/>查询结果超过9999行，只能导出前9999行..." : ""),
				caption: i18n["export"],
				onSubmit: function(){
					var xlsArgs = rias.mixinDeep({
						_downloadType: "attachment",
						_downloadFileType: "XLS",
						filename: "export",
						title: i18n["export"],
						columns: _toXlsColumns(grid.columns)
					});
					if(rias.isFunction(grid.toExcelParams)){
						xlsArgs = grid.toExcelParams.apply(grid, [xlsArgs]);
					}else if(rias.isObject(grid.toExcelParams)){
						xlsArgs = rias.mixinDeep(xlsArgs, grid.toExcelParams);
					}
					var data = rias.mixinDeep({}, grid._queryObject0, {
						_method: "TOEXCEL",
						_responseargs: rias.toJson(xlsArgs),
						start: 0,
						count: 9999
					});
					rias.xhr.open(grid.target, data, true);
					return 1;
				}
			}, grid, around);
		},
		///printRecordParams: {},
		printRecoreds: function(moduleParams, around){
			var grid = this,
				mParams = rias.mixinDeep({}, moduleParams);
			if(rias.isFunction(grid.printRecordParams)){
				mParams = grid.printRecordParams.apply(grid, [mParams]);
			}else if(rias.isObject(grid.printRecordParams)){
				mParams = rias.mixinDeep(mParams, grid.printRecordParams);
			}
			rias.choose({
				//_riaswAttachPoint: "_printDlg",
				moduleParams: mParams,
				content: "是否预览打印当前查询结果?" + (grid._total > 9999 ? "<br/>查询结果超过9999行，只能导出前9999行..." : ""),
				caption: i18n.printGrid,
				onSubmit: function(){
					var xlsArgs = rias.mixinDeep({
						_downloadType: "inline",
						_downloadFileType: "HTML",
						filename: "print",
						title: i18n.printGrid,
						columns: _toXlsColumns(grid.columns),
						numrowLabel: grid._riasrRowNumColumn ? grid._riasrRowNumColumn.label : "",
						numrowWidth: grid._riasrRowNumColumn ? rias.toInt(grid._riasrRowNumColumn.headerNode.clientWidth, 56) : ""
					});
					if(rias.isFunction(grid.toExcelParams)){
						xlsArgs = grid.toExcelParams.apply(grid, [xlsArgs]);
					}else if(rias.isObject(grid.toExcelParams)){
						xlsArgs = rias.mixinDeep(xlsArgs, grid.toExcelParams);
					}
					//rias.xhrOpen(grid.target, rias.mixin({}, grid._queryObject0, {
					//	start: 0,
					//	count: 9999
					//}), xlsArgs);
					var data = rias.mixinDeep({}, grid._queryObject0, {
						_method: "TOEXCEL",
						_responseargs: rias.toJson(xlsArgs),
						start: 0,
						count: 9999
					});
					rias.xhr.open(grid.target, data, true);
					return 1;
				}
			}, grid, around);
		}

	});

	Widget._internalToolParams = {
		toolRefresh: {
			_riaswAttachPoint: "toolRefresh",
			toolName: "toolRefresh",
			showLabel: false,
			label: i18n.refresh,
			tooltip: i18n.refresh,
			iconClass: "refreshIcon",
			onClick: function(evt){
				this.grid.refresh(null, {
					around: this
				});
			}
		},
		toolAux: {
			_riaswAttachPoint: "toolAux",
			toolName: "toolAux",
			label: i18n.aux,
			tooltip: i18n.aux,
			iconClass: "pinIcon",
			onClick: function(evt){
				this.grid._toggleColumnHiderMenu(evt);
			}
		},
		toolAdd: {
			_riaswAttachPoint: "toolAdd",
			toolName: "toolAdd",
			label: i18n.add,
			tooltip: i18n.add,
			iconClass: "addIcon",
			onClick: function(evt){
				this.grid.addRecord(this.moduleParams, this);
			}
		},
		toolDelete: {
			_riaswAttachPoint: "toolDelete",
			toolName: "toolDelete",
			label: i18n.dele,
			tooltip: i18n.dele,
			iconClass: "deleIcon",
			onClick: function(evt){
				this.grid.deleteRecoreds(this.moduleParams, this.grid.getSelectedIds(), this);
			}
		},
		toolEdit: {
			//_riaswType: "riasw.form.ToggleButton",
			_riaswAttachPoint: "toolEdit",
			toolName: "toolEdit",
			showLabel: true,
			label: i18n.edit,
			tooltip: i18n.edit,
			iconClass: "editIcon",
			onClick: function(evt){
				var grid = this.grid;
				grid.set("canEdit", !grid.get("canEdit"));
			}
		},
		toolEdit_Save: {
			_riaswAttachPoint: "toolEdit_Save",
			toolName: "toolEdit_Save",
			visible: false,
			disavled: true,
			showLabel: true,
			label: i18n.save,
			tooltip: i18n.save,
			iconClass: "abortIcon",
			onClick: function(evt){
				var grid = this.grid;
				grid.doSave().always(function(){
					grid.set("canEdit", grid.get("modified"));
					grid.refresh(null, {
						silence: true
					});
				});
			}
		},
		toolEdit_Abort: {
			_riaswAttachPoint: "toolEdit_Abort",
			toolName: "toolEdit_Abort",
			visible: false,
			disavled: true,
			showLabel: true,
			label: i18n.abort,
			tooltip: i18n.abort,
			iconClass: "abortIcon",
			onClick: function(evt){
				var grid = this.grid;
				grid.doRevert().always(function(){
					grid.set("canEdit", grid.get("modified"));
					//grid.refresh();///doRevert 已经 refresh
				});
			}
		},
		toolPrint: {
			_riaswAttachPoint: "toolPrint",
			toolName: "toolPrint",
			label: i18n.printGrid,
			tooltip: i18n.printGrid,
			iconClass: "printIcon",
			onClick: function(evt){
				this.grid.printRecoreds(this.moduleParams, this);
			}
		},
		toolExport: {
			_riaswAttachPoint: "toolExport",
			toolName: "toolExport",
			label: i18n.exportAsXls,
			tooltip: i18n.exportAsXls,
			iconClass: "exportIcon",
			onClick: function(evt){
				this.grid.exportRecoreds(this.moduleParams, this);
			}
		}
	};

	Widget.makeParams = function(params){
		return rias.when(DGridParamExt(params), function(p){
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
	};
	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		"property": {
		}
	};

	return Widget;

});