
//RIAStudio client runtime widget - DGrid

define([
	"rias",
	"rias/riasw/layout/Panel",
	"rias/riasw/mobile/Button"
], function(rias, Panel, Button) {

	rias.on(rias.webApp.domNode, "dgrid-error", function(evt){
		evt.preventDefault(); // Suppress console.error
		console.error("document received dgrid-error: ", evt.error ? rias.captureStackTrace(evt.error) : evt);
	});

	return function(params){
		var df = rias.newDeferred(), dfs = [],
			p = rias.mixinDeep({}, params),
			i, l, n, b,
			treeColumns = (rias.isArray(p.treeColumns) ? p.treeColumns : rias.isString(p.treeColumns) ? [p.treeColumns] : []),
			opColumn = [], gridOps = [], item,
			set1 = [], set2 = [],
			editon;

		if(!p._riaswIdOfModule){
			p._riaswIdOfModule = "grid";
		}

		//if(p.)
		p._customColumnFormatter = function(cellData, data){
			var col = this,
				field = col.field,
				format = col.format,
				v;
			if(data[field] === undefined){
				return data[field];
			}
			try{
				if(rias.isFunction(format)){
					return format.apply(col, [cellData, data]);
				}else if(rias.isString(format)){
					switch(format){
						case "text":
							return data[field];
						case "date":
							return rias.datetime.format(data[field], rias.datetime.defaultDateFormatStr);
						case "time":
							return rias.datetime.format(data[field], rias.datetime.defaultTimeFormatStr);
						case "datetime":
							return rias.datetime.format(data[field], rias.datetime.defaultFormatStr);
						case "boolean":
							return (data[field] != false ? "是" : "否");
						default:
							if(/^number/.test(format)){
								v = data[field];
								return rias.toFixed(v, rias.toInt(format.substring(6), 0));
							}
							return data[field];
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
							return this.grid._customColumnFormatter.apply(this, arguments);
						};
						if(!col.align && /^number/.test(col.format)){
							col.align = "right";
						}
					}
					ed = col.editor;
					if(rias.isString(ed)){
						if(/^rias\.riasw\.|^dijit\.|^dojox\./.test(ed)){
							d = rias.requireRiaswCtor(ed, function(err){
								errs += err;
							}).then(function(ctor){
								col.editor = ctor;
								});
							dfs.push(d);
						}
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
					_riaswType: p.target ? "rias.riasw.store.JsonRestStore" : "rias.riasw.store.MemoryStore",
					_riaswIdOfModule: p._riaswIdOfModule + "_store",
					idAttribute: 'id',
					labelAttribute: 'label'
				}, p.store);
			}else{
				p.collection = {
					_riaswType: p.target ? "rias.riasw.store.JsonRestStore" : "rias.riasw.store.MemoryStore",
					_riaswIdOfModule: p._riaswIdOfModule + "_store",
					idAttribute: 'id',
					labelAttribute: 'label'
				};
			}
			if(treeColumns.length > 0){
				p.collection.isTreeStore = true;
			}
		}
		if(p.target){
			p.collection.target = p.target;
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
				}
			}
		}
		delete p.selectRowTriggerOnCell;
		delete p.selectRowMultiple;
		if(p.selectionMode !== "none"){
			set1.unshift({
				_riasrSelectorColumn: true,
				id: "_selecol",
				label: "",
				field: "id",
				width: "2em",
				minWidth: 20,
				resizable: false,
				sortable: false,
				reorderable: false,
				unhidable: true,
				selector: (p.selectionMode === "single" ? "radio" : "checkbox")
			});
		}
		p.deselectOnRefresh = rias.ifnull(p.deselectOnRefresh, false);

		if(rias.isArray(p.cellIdOps)){
			opColumn = opColumn.concat(p.cellIdOps);
		}
		delete p.cellIdOps;
		function _getOpColumn(){
			return {
				_riasrOpColumn: opColumn,
				id: "_opcol",
				label: "",//rias.i18n.action.action,
				field: "id",
				className: "dgrid-opcolumn",
				//width: p.opColumnWidth || "9em",
				//resizable: false,
				sortable: false,
				reorderable: false,
				unhidable: true,
				renderCell: function(data, cellData, cell, options){
					var grid = this.grid,
						module = grid._riasrModule,
						item, i, l;
					for(i = 0, l = opColumn.length; i < l; i++){
						item = opColumn[i];
						if(item && item.name){
							item = rias.dom.create("button", {
								//"class": "dgrid-opcolumn-button",
								name: item.name,
								title: item.tooltip,
								innerHTML: item.text,
								click: function(evt){
									//console.debug("click:" + this.name, data.id);
									var func = this.opParams.func;
									if(!func || func == "cellIdOnClick"){
										grid.cellIdOnClick.apply(grid, [grid, this.name, cell, data]);
									}else if(rias.isFunction(func)){
										func.apply(module, [grid, this.name, cell, data]);
									}else if(rias.isString(func) && rias.isFunction(module[func])){
										module[func].apply(module, [grid, this.name, cell, data]);
									}else{
										console.warn("error cell.item.onClick function of [" + this.name + "]");
									}
								}
							});
							item.opParams = opColumn[i];
							if(item && item.name){
								if(item.visible === undefined || item.visible == true ||
									(rias.isFunction(item.visible) && item.visible.apply(module, [grid, item.name, cell, data]))){
									if(item.disabled === true || (rias.isFunction(item.disabled) && item.disabled.apply(module, [grid, item.name, cell, data]))){
										rias.dom.setAttr(item, "disabled", true);
										rias.dom.setAttr(item, "aria-disabled", true);
									}
								}else{
									rias.dom.visible(item, false);
								}
							}
							cell["_op_" + item.name] = item;
							cell.appendChild(item);
						}
					}
				}
			};
		}
		if(opColumn.length > 0){
			set1.unshift(_getOpColumn());
		}
		delete p.opColumnWidth;
		p.cellIdOnClick = function(grid, name, cell, data){
			var id = data[grid.collection.idAttribute],
				d = (data[grid.collection.labelAttribute] ? "[" + data[grid.collection.labelAttribute] + "]" : ""),
				params = cell["_op_" + name].opParams,
				meta = {
					dialogType: "top",
					ownerRiasw: grid,
					parent: grid.viewModuleParent || undefined,
					around: cell,
					positions: ["after-centered", "below", "above", "before"],
					moduleMeta: grid.viewModule,
					resizable: false,
					//restrictPadding: 0,
					//maxable: false,
					query: {
						id: id
					},
					initData: grid.opInitData,
					op: name,
					afterFiler: function(result){
						var m = this;
						if (rias.isFunction(m._riaswModuleMeta.afterFiler)){
							m._riaswModuleMeta.afterFiler.call(m, result);
						}
					},
					onSubmit: function(){
						var m = this,
							def = rias.newDeferred();
						grid.refresh();
						def.resolve(1);
						return def.promise;
					}
				};
			if(name == "modi"){
				rias.show(rias.mixinDeep({
					_riaswIdOfModule: grid._riaswIdOfModule + "_modiDlg_" + id,
					caption: params.tooltip + id + d,
					actionBar: [
						"btnSave",
						"btnCancel"
					],
					disabled: false,
					readOnly: false
				}, meta, params.moduleParams));
			}else if(name == "copy"){
				rias.show(rias.mixinDeep({
					_riaswIdOfModule: grid._riaswIdOfModule + "_copyDlg_" + id,
					caption: params.tooltip + id + d,
					actionBar: [
						"btnSave",
						"btnCancel"
					],
					disabled: false,
					readOnly: false
				}, meta, params.moduleParams));
			}else{
				rias.show(rias.mixinDeep({
					_riaswIdOfModule: grid._riaswIdOfModule + "_viewDlg_" + id,
					caption: params.tooltip + id + d,
					actionBar: [
						"btnClose"
					],
					disabled: true,
					readOnly: true
				}, meta, params.moduleParams));
			}
		};

		if(p.showRowNum != false){
			set1.unshift(rias.mixinDeep({
				_riasrRowNumColumn: true,
				id: "_rownumcol",
				className: "dgrid-rownumcolumn",
				label: "",//rias.i18n.riasw.grid.DGrid.rowNumLabel,
				field: "rownum",
				width: "4em",
				//minWidth: 20,
				align: "right",
				//resizable: false,
				//sortable: false,
				reorderable: false,
				unhidable: true,
				renderCell: function(data, cellData, cell, options){
					var grid = this.grid,
					//module = grid._riasrModule,
						level;
					level = Number(options && options.queryLevel) + 1;
					if(!isNaN(level)){
						///cell.style["text-indent"] = level + "em";/// align: left
						///cell.style["padding-left"] = level + "em";
						cell.style["padding-right"] = level + "em";
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
				grid: {
					$refObj: p._riaswIdOfModule
				},
				label: rias.i18n.action.refresh,
				tooltip: rias.i18n.action.refresh,
				iconClass: "refreshIcon",
				onClick: function(evt){
					this.grid.refresh();
				}
			},
			_btnAdd = {
				_riaswType: "rias.riasw.form.Button",
				_riaswIdOfModule: p._riaswIdOfModule + "_btnAdd",
				grid: {
					$refObj: p._riaswIdOfModule
				},
				label: rias.i18n.action.add,
				tooltip: rias.i18n.action.add,
				iconClass: "addIcon",
				onClick: function(evt){
					this.grid.addRecord(this.grid, this);
				}
			},
			_btnDele = {
				_riaswType: "rias.riasw.form.Button",
				_riaswIdOfModule: p._riaswIdOfModule + "_btnDele",
				grid: {
					$refObj: p._riaswIdOfModule
				},
				label: rias.i18n.action.dele,
				tooltip: rias.i18n.action.dele,
				iconClass: "deleIcon",
				onClick: function(evt){
					this.grid.deleRecoreds(this.grid, this.grid.getSelectedIds(), this);
				}
			};
		if(p.topBtns){
			gridOps = gridOps.concat([_btnRefresh], p.topBtns);
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
					item = rias.mixinDeep({}, item.name === "btnAdd" ? _btnAdd : item.name === "btnDele" ? _btnDele : {
						_riaswType: "rias.riasw.form.Button",
						//_riaswIdOfModule: "btnCancel",
						//label: rias.i18n.action.cancel,
						//tooltip: rias.i18n.action.cancel,
						//iconClass: "cancelIcon",
						onClick: function(evt){
						}
					}, item);
				}else if(rias.isString(item)){
					if(item == "btnAdd"){
						item = _btnAdd;
					}else if(item == "btnDele"){
						item = _btnDele;
					}
				//}else{
				//	if(!rias.isDijit(item) && !rias.isRiasd(item)){
				//		item = undefined;
				//	}
				}
				if(item){
					p.topTools._riaswChildren.push(item);
				}
			}
		}
		p.addRecord = function(grid, around){
			rias.show({
				ownerRiasw: grid,
				parent: grid.viewModuleParent || undefined,
				_riaswIdOfModule: grid._riaswIdOfModule + "_addDlg",
				moduleMeta: grid.viewModule,
				dialogType: "modal",
				around: around,
				autoClose: 0,
				caption: rias.i18n.action.add,
				query: {
					//id: ""
				},
				initData: grid.opInitData,
				op: "add",
				actionBar: [
					"btnSave",
					"btnCancel"
				],
				//afterFiler: function(result){
				//	var m = this;
				//	if (rias.isFunction(m._riaswModuleMeta.afterFiler)){
				//		m._riaswModuleMeta.afterFiler.call(m, result);
				//	}
				//},
				onSubmit: function(){
					var d = rias.newDeferred();
					grid.refresh();
					d.resolve(1);
					return d.promise;
				}
			});
		};
		p.deleRecoreds = function(grid, ids, around){
			ids = (rias.isArray(ids) ? ids : rias.isString(ids) ? [ids] : []);
			if(ids.length){
				rias.choice({
					_riaswIdOfModule: grid._riaswIdOfModule + "_deleDlg",
					ownerRiasw: grid,
					dialogType: "modal",
					around: around,
					autoClose: 0,
					content: "是否删除[" + ids + "]?",
					caption: rias.i18n.action.dele,
					onSubmit: function(mr){
						//if(mr){
						rias.xhrDelete(grid.target, {
								_idDirty: ids.join(",")//[101, 10101, 010102]
							}, function(result){
								if(!result.success || result.success < 1){
									rias.warn("删除失败...");
								}else{
									grid.refresh();
								}
							}
						);
						//}
						return 1;
					}
				});
			}
		};

		rias.all(dfs).then(function(){
			df.resolve(p);
		});

		return df.promise;
	}

});