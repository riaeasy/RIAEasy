
//RIAStudio client runtime widget - DGrid

define([
	"riasw/riaswBase",
	"dojo/i18n!./nls/dgrid",
	"riasw/sys/Menu",
	"riasw/sys/MenuItem",
	"riasw/store/JsonXhrStore",
	"riasw/store/MemoryStore"
], function(rias, i18n, Menu, MenuItem) {

	if(rias.desktop){
		rias.on(rias.desktop.domNode, "dgrid-error", function(evt){
			evt.preventDefault(); // Suppress console.error
			console.error("document received dgrid-error: ", evt.error ? evt.error : evt);
		});
	}

	return function(params){
		var df = rias.newDeferred(), dfs = [],
			p = rias.mixinDeep({}, params),
			treeColumns = (rias.isArray(p.treeColumns) ? p.treeColumns : rias.isString(p.treeColumns) ? [p.treeColumns] : []),
			opColumn = [],
			set1 = [], set2 = [];

		if(!p._riaswIdInModule){
			p._riaswIdInModule = "grid";
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
				ed, errs = "";
			function _getEditor(c){
				return rias.requireRiaswCtor(c.editor, function(err){
					errs += err;
				}).then(function(ctor){
						return (c.editor = ctor);
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
							};
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
					}else{
						col.className = "dgrid-datacell" + (col.className ? " " + col.className : "");
						if(col.fixed){
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
			if(rias.isRiasObject(p.store)){
				p.collection = p.store;
			}else if(rias.isObjectSimple(p.store)){
				p.collection = rias.mixinDeep({
					_riaswType: p.target ? "riasw.store.JsonXhrStore" : "riasw.store.MemoryStore",
					//_riaswIdInModule: p._riaswIdInModule + "_store",
					_riaswAttachPoint: "_store",
					idProperty: 'id',
					labelProperty: 'label'
				}, p.store);
			}else{
				p.collection = {
					_riaswType: p.target ? "riasw.store.JsonXhrStore" : "riasw.store.MemoryStore",
					//_riaswIdInModule: p._riaswIdInModule + "_store",
					_riaswAttachPoint: "_store",
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
				label: "",//i18n.action,
				field: "id",
				//width: p.opColumnWidth || "9em",
				//resizable: false,
				sortable: false,
				reorderable: false,
				unhidable: true,
				renderCell: asButton ? function(data, cellData, cell, options){
					var grid = this.grid,
						module = grid.getOwnerModule(),
						item, n, i, l;
					for(i = 0, l = opColumn.length; i < l; i++){
						item = opColumn[i];
						if(item && item.name){
							n = item.name;
							item = rias.dom.create("button", {
								//"class": "dgrid-opcolumn-button",
								grid: grid,
								name: n,
								title: item.tooltip,
								innerHTML: item.text,
								click: function(evt){
									//console.debug("click:" + this.name, data.id);
									var func = this.opParams.func;
									if(!func || func === "cellOpOnClick"){
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
								(rias.isFunction(item.opParams.visible) && item.opParams.visible.apply(module, [grid, n, cell, data]))){
								if(item.opParams.disabled === true || (rias.isFunction(item.opParams.disabled) && item.opParams.disabled.apply(module, [grid, n, cell, data]))){
									rias.dom.setAttr(item, "disabled", true);
									rias.dom.setAttr(item, "aria-disabled", true);
									rias.dom.addClass(item, "riaswButtonDisabled");
								}
							}else{
								rias.dom.visible(item, false);
							}
							cell["_op_" + n] = item;
							cell.appendChild(item);
						}
					}
				} : function(data, cellData, cell, options){
					var grid = this.grid,
						module = grid.getOwnerModule(),
						btn;
					function _do(){
						var menu = new Menu({
							ownerRiasw: grid,
							onBlur: function(){
								if(menu){
									rias.popupManager.hide(menu);
								}
							},
							onMouseLeave: function(){
								if(menu){
									rias.popupManager.hide(menu);
								}
							},
							dir: grid.dir,
							lang: grid.lang,
							textDir: grid.textDir
						});
						rias.forEach(opColumn, function(item){
							if(item && item.name){
								var n = item.name,
									menuItem = new MenuItem({
									ownerRiasw: menu,
									label: item.label || item.text || i18n[n] || n,
									tooltip: item.label || item.text || i18n[n] || n,
									iconClass: item.iconClass || n === "view" ? "viewDialogIcon" : n === "modify" ? "editIcon" : n === "copy" ? "copyIcon" : "",
									disabled: item.disabled === true || (rias.isFunction(item.disabled) && item.disabled.apply(module, [grid, n, cell, data])),
									dir: menu.dir,
									lang: menu.lang,
									textDir: menu.textDir,
									onClick: function(evt){
										//console.debug("click:" + this.name, data.id);
										var func = this.opParams.func;
										if(!func || func === "cellOpOnClick"){
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
									(rias.isFunction(item.visible) && item.visible.apply(module, [grid, n, cell, data]))){
									///
								}else{
									rias.dom.visible(menuItem, false);
								}
								cell["_op_" + n] = menuItem;
								menu.addChild(menuItem);
							}
						}, this);
						rias.popupManager.popup({
							popup: menu,
							popupOwner: btn,
							around: btn,
							popupPositions: ["after", "before"],
							focus: true,
							onHide: function(){
								rias.destroy(menu);
								menu = undefined;
							}
						});
					}
					///注意，btn 是 domNode，不是 widget
					btn = rias.dom.create("button", {
						//"class": "dgrid-opcolumn-button",
						//name: "btnOp",
						//title: grid.cellOpText || i18n.action,
						innerHTML: grid.cellOpText || i18n.action,
						mouseover: function(evt){
							_do(evt);
						},
						click: function(evt){
							_do(evt);
						}
					});
					btn.grid = grid;
					cell._btnOp = btn;
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
					ownerRiasw: grid,
					dialogType: "top",
					popupArgs: {
						parent: grid.viewModuleParent || grid.getOwnerModule(),
						around: {
							x: r.element.offsetWidth >> 1,
							y: rias.dom.getPosition(cell).y
						},// cell,
						popupPositions: ["after-centered", "below", "above", "before"]
					},
					moduleMeta: grid.viewModule,
					resizable: false,
					//maxable: false,
					query: {
						id: id
					},
					actionType: name,
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
			if(name === "modify"){
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
				rias.showDialog(rias.mixinDeep({}, meta, {
					//_riaswIdInModule: grid._riaswIdInModule + "_modifyDlg_" + id,
					_riaswAttachPoint: "_modifyDlg_" + id,
					initData: initData,
					initDisabled: false,
					initReadOnly: false,
					caption: opParams.tooltip + id + d,
					iconClass: "editIcon",
					actionBar: [
						"btnSubmit",
						"btnAbort"
					]
				}, mParams));
			}else if(name === "copy"){
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
				rias.showDialog(rias.mixinDeep({}, meta, {
					//_riaswIdInModule: grid._riaswIdInModule + "_copyDlg_" + id,
					_riaswAttachPoint: "_copyDlg_" + id,
					initData: initData,
					initDisabled: false,
					initReadOnly: false,
					caption: opParams.tooltip + id + d,
					iconClass: "editIcon",
					actionBar: [
						"btnSubmit",
						"btnAbort"
					]
				}, mParams));
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
				rias.showDialog(rias.mixinDeep({}, meta, {
					//_riaswIdInModule: grid._riaswIdInModule + "_viewDlg_" + id,
					_riaswAttachPoint: "_viewDlg_" + id,
					//"class": "riaswDialogTypeTip",
					dialogType: "tip",
					closeDelay: -1,
					hiddenConnector: true,
					initData: initData,
					initDisabled: true,
					initReadOnly: true,
					caption: opParams.tooltip + id + d,
					iconClass: "viewDialogIcon",
					actionBar: [
						"btnClose"
					]
				}, mParams));
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
				label: "#",
				field: "rownum",
				width: treeColumns.length > 0 ? "6em" : "4em",
				//minWidth: 20,
				align: "right",
				//resizable: false,
				sortable: false,
				reorderable: false,
				unhidable: true,
				renderCell: function(data, cellData, cell, options){
					var //grid = this.grid,
					//module = grid.getOwnerModule(),
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

		rias.all(dfs).then(function(){
			df.resolve(p);
		});

		return df.promise;
	};

});