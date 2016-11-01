
//RIAStudio client runtime widget - DGrid

define([
	"rias",
	"rias/riasw/layout/Panel",
	"rias/riasw/widget/Menu",
	"rias/riasw/widget/MenuItem"
], function(rias, Panel, Menu, MenuItem) {

	if(rias.webApp){
		rias.on(rias.webApp.domNode, "dgrid-error", function(evt){
			evt.preventDefault(); // Suppress console.error
			console.error("document received dgrid-error: ", evt.error ? rias.captureStackTrace(evt.error) : evt);
		});
	}

	return function(params, module){
		var df = rias.newDeferred(), dfs = [],
			p = rias.mixinDeep({}, params),
			i, l,
			treeColumns = (rias.isArray(p.treeColumns) ? p.treeColumns : rias.isString(p.treeColumns) ? [p.treeColumns] : []),
			opColumn = [], gridOps = [], item,
			set1 = [], set2 = [];

		rias.decodeRiaswParams(module, p);

		if(!p._riaswIdOfModule){
			p._riaswIdOfModule = "grid";
		}

		//不建议默认为 autoSave
		//if(!("autoSave" in p)){
		//	p.autoSave = true;
		//}
		p._customColumnFormatter = function(cellData, data){
			var col = this,
				format = col.format,
				v;
			if(cellData == undefined){
				return "";
			}
			try{
				if(rias.isFunction(format)){
					return format.apply(col, [cellData, data]);
				}else if(rias.isString(format)){
					switch(format){
						case "text":
							return cellData + "";
						case "date":
							return rias.formatDatetime(cellData, rias.datetime.defaultDateFormatStr);
						case "time":
							return rias.formatDatetime(cellData, rias.datetime.defaultTimeFormatStr);
						case "datetime":
							return rias.formatDatetime(cellData, rias.datetime.defaultFormatStr);
						case "boolean":
							return (cellData != false ? "是" : "否");
						default:
							if(/^number/.test(format)){
								v = cellData;
								return rias.toFixed(v, rias.toInt(format.substring(6), 0));
							}
							if(/^field/.test(format)){
								return data[format.substring(5)];
							}
							return cellData;
					}
				}
			}catch(e){
				console.error(e);
				return cellData;
			}
		};
		function _column(arr){
			var col,
				i = arr.length - 1,
				d, ed, errs = "";
			function _getEditor(c){
				return rias.requireRiaswCtor(c.editor, function(err){
					errs += err;
				}).then(function(ctor){
						c.editor = ctor;
					});
			}
			for(; i >= 0; i--){
				col = arr[i];
				if(rias.isArray(col)){
					_column(col);
				}else{
					if(col.children){
						_column(col.children);
					}
					if(!col.label){
						if(col.name){
							col.label = col.name;
							delete col.name;
						}
					}
					if(treeColumns.indexOf(col.field) >= 0){
						col.renderExpando = true;
					}
					if(col.format && !col.formatter){
						col.formatter = function(cellData, data){
							return this.grid._customColumnFormatter.apply(this, arguments || []);
						};
						if(!col.align && /^number/.test(col.format)){
							col.align = "right";
						}
					}
					ed = col.editor;
					if(rias.isString(ed)){
						if(/^rias\.riasw\.|^dijit\.|^dojox\./.test(ed)){
							dfs.push(_getEditor(col));
						}
					}
					if(ed){
						//if(!("autoSave" in col)){
						//	col.autoSave = p.autoSave;///grid 保存 和 col 分离。
						//}
						if(!("autoSelect" in col)){
							col.autoSelect = true;
						}
						//if(!("dismissOnEnter" in col)){
						//	col.dismissOnEnter = true;
						//}
						if(!("canEdit" in col)){
							col.canEdit = function (object, value) {
								return this.grid.get("canEdit");
							}
						}
						if(!("editOn" in col)){
							///强制使用该模式?
							col.editOn = "click, keypress, paste, cut, input, compositionend";
						}
						/*if(!("editorArgs" in col)){
							col.editorArgs = {
								"style": "width: 100%;height:100%;"
							};
						}else{
							if(!col.editorArgs.style){
								col.editorArgs.style = "width: 100%;height:100%;";
							}
						}*/

					}
					if(col.field.toLowerCase() === "rownum"){
						p._rownumColumn = col;
						arr.splice(i, 1);
					}else if(col.fixed){
						//col.resizable = false;
						//col.reorderable = true,/// 保持设计值
						col.unhidable = true;
						col._riasrFixedColumn = true;
						set1.unshift(col);///因为是倒序 for，所以要用 unshift
						arr.splice(i, 1);
					}
				}
			}
		}
		if(!p.columns){
			if(p.structure){
				p.columns = p.structure;
			}else{
				p.columns = [];
			}
		}
		_column(p.columns);
		delete p.structure;
		delete p.treeColumns;

		if(!p.collection){
			if(rias.isRiasw(p.store)){
				p.collection = p.store;
			}else if(rias.isObjectSimple(p.store)){
				p.collection = rias.mixinDeep({
					_riaswType: p.target ? "rias.riasw.store.JsonXhrStore" : "rias.riasw.store.MemoryStore",
					_riaswIdOfModule: p._riaswIdOfModule + "_store",
					idProperty: 'id',
					labelProperty: 'label'
				}, p.store);
			}else{
				p.collection = {
					_riaswType: p.target ? "rias.riasw.store.JsonXhrStore" : "rias.riasw.store.MemoryStore",
					_riaswIdOfModule: p._riaswIdOfModule + "_store",
					idProperty: 'id',
					labelProperty: 'label'
				};
			}
			if(treeColumns.length > 0){
				p.collection.isTreeStore = true;
			}
		}
		if(p.target){
			p.collection.target = p.target;
		}
		if(!("caching" in p)){
			p.caching = false;
		}
		delete p.store;
		p._queryObject0 = p.query;
		if(!p.collection.queryObject && p._queryObject0){
			p.collection.queryObject = p._queryObject0;
		}
		delete p.query;

		//rias.decodeRiaswParam(module, p, "selectionMode", module.id + "." + p._riaswIdOfModule + ".selectionMode");
		if(!p.selectionMode){
			if(p.selectRowTriggerOnCell == false){
				p.selectionMode = "none";
			}else{
				if(p.selectRowMultiple == true){
					p.selectionMode = "toggle";
				}else{
					p.selectionMode = "single";
					//p.selectionMode = "none";
				}
			}
		}
		delete p.selectRowTriggerOnCell;
		delete p.selectRowMultiple;
		if(p.selectionMode !== "none"){
			p.allowSelectAll = p.selectionMode !== "single";
			set1.unshift({
				_riasrSelectorColumn: true,
				id: "_selecol",
				className: "dgrid-selector",
				label: "",
				field: "id",
				width: p.showSelector != false ? "2em" : "0",
				//minWidth: 20,
				resizable: false,
				sortable: false,
				reorderable: false,
				unhidable: true,
				selector: (p.selectionMode === "single" ? "radio" : "checkbox")
			});
		}
		p.deselectOnRefresh = rias.ifnull(p.deselectOnRefresh, false);

		if(rias.isArray(p.cellOpParams)){
			opColumn = opColumn.concat(p.cellOpParams);
		}
		delete p.cellOpParams;
		function _getOpColumn(asButton){
			return {
				_riasrOpColumn: opColumn,
				asButton: !!asButton,
				id: "_opcol",
				className: "dgrid-opcolumn",
				label: "",//rias.i18n.action.action,
				field: "id",
				//width: p.opColumnWidth || "9em",
				//resizable: false,
				sortable: false,
				reorderable: false,
				unhidable: true,
				renderCell: asButton ? function(data, cellData, cell, options){
					var grid = this.grid,
						module = grid._riasrModule,
						item, i, l;
					for(i = 0, l = opColumn.length; i < l; i++){
						item = opColumn[i];
						if(item && item.name){
							item = rias.dom.create("button", {
								//"class": "dgrid-opcolumn-button",
								grid: grid,
								name: item.name,
								title: item.tooltip,
								innerHTML: item.text,
								click: function(evt){
									//console.debug("click:" + this.name, data.id);
									var func = this.opParams.func;
									if(!func || func == "cellOpOnClick"){
										grid.cellOpOnClick.apply(grid, [grid, this.name, cell, data]);
									}else if(rias.isFunction(func)){
										func.apply(module, [grid, this.name, cell, data]);
									}else if(rias.isString(func) && rias.isFunction(module[func])){
										module[func].apply(module, [grid, this.name, cell, data]);
									}else{
										console.warn("error cell.item.onClick function of [" + this.name + "]");
									}
								}
							});
							item.opParams = opColumn[i]; ///rias.dom.create 无法带入。
							if(item.opParams.visible === undefined || item.opParams.visible == true ||
								(rias.isFunction(item.opParams.visible) && item.opParams.visible.apply(module, [grid, item.name, cell, data]))){
								if(item.opParams.disabled === true || (rias.isFunction(item.opParams.disabled) && item.opParams.disabled.apply(module, [grid, item.name, cell, data]))){
									rias.dom.setAttr(item, "disabled", true);
									rias.dom.setAttr(item, "aria-disabled", true);
									rias.dom.addClass(item, "riaswButtonDisabled riaswButtonNodeDisabled");
								}
							}else{
								rias.dom.visible(item, false);
							}
							cell["_op_" + item.name] = item;
							cell.appendChild(item);
						}
					}
				} : function(data, cellData, cell, options){
					var grid = this.grid,
						module = grid._riasrModule,
						btn;
					function _do(){
						var menu = new Menu({
							ownerRiasw: grid,
							onBlur: function(){
								if(menu){
									rias.dom.closePopup(menu);
								}
							},
							onMouseLeave: function(){
								if(menu){
									rias.dom.closePopup(menu);
								}
							},
							dir: grid.dir,
							lang: grid.lang,
							textDir: grid.textDir
						});
						rias.forEach(opColumn, function(item){
							if(item && item.name){
								var menuItem = new MenuItem({
									ownerRiasw: menu,
									label: item.text,
									iconClass: item.iconClass,
									disabled: item.disabled === true || (rias.isFunction(item.disabled) && item.disabled.apply(module, [grid, item.name, cell, data])),
									dir: menu.dir,
									lang: menu.lang,
									textDir: menu.textDir,
									onClick: function(evt){
										//console.debug("click:" + this.name, data.id);
										var func = this.opParams.func;
										if(!func || func == "cellOpOnClick"){
											grid.cellOpOnClick.apply(grid, [grid, this.opParams.name, cell, data]);
										}else if(rias.isFunction(func)){
											func.apply(module, [grid, this.opParams.name, cell, data]);
										}else if(rias.isString(func) && rias.isFunction(module[func])){
											module[func].apply(module, [grid, this.opParams.name, cell, data]);
										}else{
											console.warn("error cell.item.onClick function of [" + this.opParams.name + "]");
										}
									}
								});
								menuItem.opParams = item; ///rias.dom.create 无法带入。
								if(item.visible === undefined || item.visible == true ||
									(rias.isFunction(item.visible) && item.visible.apply(module, [grid, item.name, cell, data]))){
									///
								}else{
									rias.dom.visible(menuItem, false);
								}
								cell["_op_" + item.name] = menuItem;
								menu.addChild(menuItem);
							}
						}, this);
						rias.dom.openPopup({
							parent: module,///
							popup: menu,
							around: btn,
							orient: ["after", "before"],
							focus: true,
							onClose: function(){
								rias.destroy(menu);
								menu = undefined;
							}
						}, module);
					}
					btn = rias.dom.create("button", {
						//"class": "dgrid-opcolumn-button",
						grid: grid,
						name: "btnOp",
						//title: grid.cellOpText || rias.i18n.action.operation,
						innerHTML: grid.cellOpText || rias.i18n.action.operation,
						mouseover: function(evt){
							_do(evt);
						},
						click: function(evt){
							_do(evt);
						}
					});
					cell["_btnOp"] = btn;
					cell.appendChild(btn);
				}
			};
		}
		if(opColumn.length > 0){
			set1.unshift(_getOpColumn());
		}
		delete p.opColumnWidth;
		p.cellOpOnClick = function(grid, name, cell, data){
			var id = data[grid.collection.idProperty],
				r = grid.row(id),
				d = (data[grid.collection.labelProperty] ? "[" + data[grid.collection.labelProperty] + "]" : ""),
				meta = {
					dialogType: "top",
					ownerRiasw: grid,
					parent: grid.viewModuleParent || grid._riasrModule,
					around: {x: r.element.offsetWidth >> 1, y: rias.dom.position(cell).y},// cell,
					positions: ["after-centered", "below", "above", "before"],
					moduleMeta: grid.viewModule,
					resizable: false,
					//restrictPadding: 0,
					//maxable: false,
					query: {
						id: id
					},
					op: name,
					onSubmit: function(){
						return rias.when(this.inheritedMeta(arguments)).always(function(result){
							return grid.refresh().always(function(){
								return result;
							});
						});
					}
				},
				opParams = rias.mixinDeep({}, cell["_op_" + name].opParams),
				mParams = opParams.moduleParams,
				initData = rias.mixinDeep({}, grid.opInitData);
			if(name == "modify"){
				if(rias.isFunction(p.modifyRecordParams)){
					mParams = p.modifyRecordParams.apply(grid, [mParams]);
				}else if(rias.isObject(p.modifyRecordParams)){
					mParams = rias.mixinDeep(mParams, p.modifyRecordParams);
				}
				if(rias.isFunction(p.modifyRecordInitData)){
					initData = p.modifyRecordInitData.apply(grid, [initData]);
				}else if(rias.isObject(p.modifyRecordInitData)){
					initData = rias.mixinDeep(initData, p.modifyRecordInitData);
				}
				rias.show(rias.mixinDeep({
					_riaswIdOfModule: grid._riaswIdOfModule + "_modifyDlg_" + id,
					initData: initData,
					initDisabled: false,
					initReadOnly: false,
					caption: opParams.tooltip + id + d,
					actionBar: [
						"btnSave",
						"btnCancel"
					]
				}, meta, mParams));
			}else if(name == "copy"){
				if(rias.isFunction(p.copyRecordParams)){
					mParams = p.copyRecordParams.apply(grid, [mParams]);
				}else if(rias.isObject(p.copyRecordParams)){
					mParams = rias.mixinDeep(mParams, p.copyRecordParams);
				}
				if(rias.isFunction(p.copyRecordInitData)){
					initData = p.copyRecordInitData.apply(grid, [initData]);
				}else if(rias.isObject(p.copyRecordInitData)){
					initData = rias.mixinDeep(initData, p.copyRecordInitData);
				}
				rias.show(rias.mixinDeep({
					_riaswIdOfModule: grid._riaswIdOfModule + "_copyDlg_" + id,
					initData: initData,
					initDisabled: false,
					initReadOnly: false,
					caption: opParams.tooltip + id + d,
					actionBar: [
						"btnSave",
						"btnCancel"
					]
				}, meta, mParams));
			}else{
				if(rias.isFunction(p.viewRecordParams)){
					mParams = p.viewRecordParams.apply(grid, [mParams]);
				}else if(rias.isObject(p.viewRecordParams)){
					mParams = rias.mixinDeep(mParams, p.viewRecordParams);
				}
				if(rias.isFunction(p.viewRecordInitData)){
					initData = p.viewRecordInitData.apply(grid, [initData]);
				}else if(rias.isObject(p.viewRecordInitData)){
					initData = rias.mixinDeep(initData, p.viewRecordInitData);
				}
				rias.show(rias.mixinDeep({
					_riaswIdOfModule: grid._riaswIdOfModule + "_viewDlg_" + id,
					initData: initData,
					initDisabled: true,
					initReadOnly: true,
					caption: opParams.tooltip + id + d,
					actionBar: [
						"btnClose"
					]
				}, meta, mParams));
			}
		};

		if(treeColumns.length > 0){
			p.collection.isTreeStore = true;
		}
		if(p.showRowNum != false){
			set1.unshift(rias.mixinDeep({
				_riasrRowNumColumn: true,
				id: "_rownumcol",
				className: "dgrid-rownumcolumn",
				label: "",//rias.i18n.riasw.grid.DGrid.rowNumLabel,
				field: "rownum",
				width: treeColumns.length > 0 ? "6em" : "4em",
				//minWidth: 20,
				align: "right",
				//resizable: false,
				sortable: false,
				reorderable: false,
				unhidable: true,
				renderCell: function(data, cellData, cell, options){
					var grid = this.grid,
					//module = grid._riasrModule,
						level;
					level = Number(options && options.queryLevel);
					if(!isNaN(level)){
						///cell.style["text-indent"] = level + "em";/// align: left
						///cell.style["padding-left"] = level + "em";
						cell.style["padding-right"] = (level * 0.5 + 0.5) + "em";
					}
					cell.appendChild(rias.dom.doc.createTextNode(options.rowNum));
				}
			}, p._rownumColumn));
		}else{
			p._rownumColumn = undefined;
		}

		if(set1.length > 0){
			set2 = set2.concat(p.columns);
			delete p.columns;
			p.columnSets = [[set1], [set2]];
		}

		var _btnRefresh = {
				_riaswType: "rias.riasw.form.Button",
				_riaswIdOfModule: p._riaswIdOfModule + "_btnRefresh",
				showLabel: true,
				label: rias.i18n.action.refresh,
				tooltip: rias.i18n.action.refresh,
				iconClass: "refreshIcon",
				onClick: function(evt){
					var grid = this.grid;
					if(grid.get("modified")){
						///不建议 autoSave。
						//if(grid.autoSave){
						//	grid.doSave().always(function(result){
						//		grid.refresh();
						//	});
						//}else{
							rias.choose({
								//parent: m,
								//around: m.btnClearL,
								content: "数据有修改！\n是否提交保存?",
								caption: "确认",
								onCancel: function(){
									return grid.revert();
								},
								onSubmit: function(){
									return grid.doSave();
								},
								afterSubmit: function(result){
									return grid.refresh();
								}
							});
						//}
					}else{
						grid.revert();
					}
				}
			},
			_btnAux = {
				_riaswType: "rias.riasw.form.Button",
				_riaswIdOfModule: p._riaswIdOfModule + "_btnAux",
				//showLabel: false,
				label: rias.i18n.action.aux,
				tooltip: rias.i18n.action.aux,
				iconClass: "auxIcon",
				onClick: function(evt){
					this.grid._toggleColumnHiderMenu(evt);
				}
			},
			_btnAdd = {
				_riaswType: "rias.riasw.form.Button",
				_riaswIdOfModule: p._riaswIdOfModule + "_btnAdd",
				label: rias.i18n.action.add,
				tooltip: rias.i18n.action.add,
				iconClass: "addIcon",
				onClick: function(evt){
					this.grid.addRecord(this.grid, this, this);
				}
			},
			_btnDele = {
				_riaswType: "rias.riasw.form.Button",
				_riaswIdOfModule: p._riaswIdOfModule + "_btnDele",
				label: rias.i18n.action.dele,
				tooltip: rias.i18n.action.dele,
				iconClass: "deleIcon",
				onClick: function(evt){
					this.grid.deleteRecoreds(this.grid, this, this.grid.getSelectedIds(), this);
				}
			},
			_btnEdit = {
				_riaswType: "rias.riasw.form.ToggleButton",
				_riaswIdOfModule: p._riaswIdOfModule + "_btnEdit",
				showLabel: true,
				label: rias.i18n.action.edit,
				tooltip: rias.i18n.action.edit,
				iconClass: "editIcon",
				onClick: function(evt){
					var grid = this.grid;
					this.checked = !!this.checked;
					this.set("label", this.checked ? rias.i18n.action.save : rias.i18n.action.edit);
					this.set("iconClass", this.checked ? "saveIcon" : "editIcon");
					if(this.checked){
						grid.set("canEdit", true);
					}else{
						grid.doSave().always(function(){
							grid.set("canEdit", grid.get("modified"));
							grid.refresh();
						});
					}
				}
			},
			_btnPrint = {
				_riaswType: "rias.riasw.form.Button",
				_riaswIdOfModule: p._riaswIdOfModule + "_btnPrint",
				showLabel: false,
				label: rias.i18n.action.printGrid,
				tooltip: rias.i18n.action.printGrid,
				iconClass: "printIcon",
				onClick: function(evt){
					this.grid.printRecoreds(this.grid, this, this);
				}
			},
			_btnExport = {
				_riaswType: "rias.riasw.form.Button",
				_riaswIdOfModule: p._riaswIdOfModule + "_btnExport",
				label: rias.i18n.action.exportAsXls,
				tooltip: rias.i18n.action.exportAsXls,
				iconClass: "exportIcon",
				onClick: function(evt){
					this.grid.exportRecoreds(this.grid, this, this);
				}
			};
		if(p.topBtns){
			//gridOps = gridOps.concat([_btnRefresh, _btnAux], p.topBtns);
			gridOps = gridOps.concat(p.topBtns);
			delete p.topBtns;
		}
		if(gridOps.length > 0){
			p.topTools = {
				_riaswType: "rias.riasw.layout.Panel",
				_riaswIdOfModule: p._riaswIdOfModule + "_topTools",
				_riaswChildren: []
			};
			for(i = 0, l = gridOps.length; i < l; i++){
				item = gridOps[i];
				if(rias.isObjectSimple(item)){
					item = rias.mixinDeep({}, item.name === "btnRefresh" ? _btnRefresh
						: item.name === "btnAux" ? _btnAux
						: item.name === "btnAdd" ? _btnAdd
						: item.name === "btnDelete" || item.name === "btnDele" ? _btnDele
						: item.name === "btnEdit" ? _btnEdit
						: item.name === "btnPrint" ? _btnPrint
						: item.name === "btnExport" ? _btnExport
						: {
							_riaswType: "rias.riasw.form.Button",
							//_riaswIdOfModule: "btnCancel",
							//label: rias.i18n.action.cancel,
							//tooltip: rias.i18n.action.cancel,
							//iconClass: "cancelIcon",
							onClick: function(evt){
							}
						}, item);
				}else if(rias.isString(item)){
					if(item === "btnRefresh"){
						item = _btnRefresh;
					}else if(item === "btnAux"){
						item = _btnAux;
					}else if(item === "btnAdd"){
						item = _btnAdd;
					}else if(item === "btnDelete" || item === "btnDele"){
						item = _btnDele;
					}else if(item === "btnEdit"){
						item = _btnEdit;
					}else if(item === "btnPrint"){
						item = _btnPrint;
					}else if(item === "btnExport"){
						item = _btnExport;
					}
				//}else{
				//	if(!rias.isDijit(item) && !rias.isRiasd(item)){
				//		item = undefined;
				//	}
				}
				if(item){
					item.grid = {
						$refObj: "module." + p._riaswIdOfModule
					};
					p.topTools._riaswChildren.push(item);
					if(!p[item.name]){
						p[item.name] = {
							$refObj: "module." + item._riaswIdOfModule
						}
					}
				}
			}
		}
		p.addRecord = function(grid, btn, around){
			var mParams = rias.mixinDeep({}, btn.moduleParams),
				initData = rias.mixinDeep({}, grid.opInitData);
			if(rias.isFunction(p.addRecordParams)){
				mParams = p.addRecordParams.apply(grid, [mParams]);
			}else if(rias.isObject(p.addRecordParams)){
				mParams = rias.mixinDeep(mParams, p.addRecordParams);
			}
			if(rias.isFunction(p.addRecordInitData)){
				initData = p.addRecordInitData.apply(grid, [initData]);
			}else if(rias.isObject(p.addRecordInitData)){
				initData = rias.mixinDeep(initData, p.addRecordInitData);
			}
			rias.show({
				ownerRiasw: grid,
				parent: grid.viewModuleParent || grid._riasrModule,
				_riaswIdOfModule: grid._riaswIdOfModule + "_addDlg",
				moduleMeta: grid.viewModule,
				moduleParams: mParams,
				initData: initData,
				dialogType: "modal",
				around: around,
				caption: rias.i18n.action.add,
				query: {
					//id: ""
				},
				op: "add",
				actionBar: [
					"btnSave",
					"btnCancel"
				],
				onSubmit: function(){
					return rias.when(this.inheritedMeta(arguments)).always(function(result){
						return grid.refresh().always(function(){
							return result;
						});
					});
				}
			});
		};
		p.deleteRecoreds = function(grid, btn, ids, around){
			var mParams = rias.mixinDeep({}, btn.moduleParams);
			if(rias.isFunction(p.deleteRecordParams)){
				mParams = p.deleteRecordParams.apply(grid, [mParams]);
			}else if(rias.isObject(p.deleteRecordParams)){
				mParams = rias.mixinDeep(mParams, p.deleteRecordParams);
			}
			ids = (rias.isArray(ids) ? ids : rias.isString(ids) ? [ids] : []);
			if(ids.length){
				rias.choose({
					_riaswIdOfModule: grid._riaswIdOfModule + "_deleDlg",
					ownerRiasw: grid,
					moduleParams: mParams,
					dialogType: "modal",
					around: around,
					content: "是否删除[" + ids + "]?",
					caption: rias.i18n.action.dele,
					onSubmit: function(){
						return rias.when(this.inheritedMeta(arguments)).always(function(result){
							return rias.xhr.dele(grid.target, {
								_idDirty: ids.join(",")//[101, 10101, 010102]
							}).always(function(result){
									if(!result.success || result.success < 1){
										rias.warn("删除失败...", around);
									}
									return grid.refresh().always(function(){
										return result;
									});
								});
						});
					}
				});
			}
		};
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
		p.exportRecoreds = function(grid, btn, around){
			var mParams = rias.mixinDeep({}, btn.moduleParams);
			if(rias.isFunction(p.exportRecordParams)){
				mParams = p.exportRecordParams.apply(grid, [mParams]);
			}else if(rias.isObject(p.exportRecordParams)){
				mParams = rias.mixinDeep(mParams, p.exportRecordParams);
			}
			rias.choose({
				_riaswIdOfModule: grid._riaswIdOfModule + "_exportDlg",
				ownerRiasw: grid,
				moduleParams: mParams,
				dialogType: "modal",
				around: around,
				content: "是否导出当前查询结果为 Excel 文件?" + (grid._total > 9999 ? "<br/>查询结果超过9999行，只能导出前9999行..." : ""),
				caption: rias.i18n.action["export"],
				onSubmit: function(){
					var xlsArgs = rias.mixinDeep({
						_downloadType: "attachment",
						_downloadFileType: "XLS",
						filename: "export",
						title: rias.i18n.action["export"],
						columns: _toXlsColumns(grid.columns)
					});
					if(rias.isFunction(p.toExcelParams)){
						xlsArgs = p.toExcelParams.apply(grid, [xlsArgs]);
					}else if(rias.isObject(p.toExcelParams)){
						xlsArgs = rias.mixinDeep(xlsArgs, p.toExcelParams);
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
			});
		};
		p.printRecoreds = function(grid, btn, around){
			var mParams = rias.mixinDeep({}, btn.moduleParams);
			if(rias.isFunction(p.printRecordParams)){
				mParams = p.printRecordParams.apply(grid, [mParams]);
			}else if(rias.isObject(p.printRecordParams)){
				mParams = rias.mixinDeep(mParams, p.printRecordParams);
			}
			rias.choose({
				_riaswIdOfModule: grid._riaswIdOfModule + "_printDlg",
				ownerRiasw: grid,
				moduleParams: mParams,
				dialogType: "modal",
				around: around,
				content: "是否预览打印当前查询结果?" + (grid._total > 9999 ? "<br/>查询结果超过9999行，只能导出前9999行..." : ""),
				caption: rias.i18n.action["export"],
				onSubmit: function(){
					var xlsArgs = rias.mixinDeep({
						_downloadType: "inline",
						_downloadFileType: "HTML",
						filename: "print",
						title: rias.i18n.action.print,
						columns: _toXlsColumns(grid.columns),
						numrowLabel: grid._riasrRowNumColumn ? grid._riasrRowNumColumn.label : "",
						numrowWidth: grid._riasrRowNumColumn ? rias.toInt(grid._riasrRowNumColumn.headerNode.clientWidth, 56) : ""
					});
					if(rias.isFunction(p.toExcelParams)){
						xlsArgs = p.toExcelParams.apply(grid, [xlsArgs]);
					}else if(rias.isObject(p.toExcelParams)){
						xlsArgs = rias.mixinDeep(xlsArgs, p.toExcelParams);
					}
					/*rias.xhrOpen(grid.target, rias.mixin({}, grid._queryObject0, {
						start: 0,
						count: 9999
					}), xlsArgs);*/
					var data = rias.mixinDeep({}, grid._queryObject0, {
						_method: "TOEXCEL",
						_responseargs: rias.toJson(xlsArgs),
						start: 0,
						count: 9999
					});
					rias.xhr.open(grid.target, data, true);
					return 1;
				}
			});
		};

		rias.all(dfs).then(function(){
			df.resolve(p);
		});

		return df.promise;
	}

});