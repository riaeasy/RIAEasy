
define([
	"rias",
	"rias/riasw/html/Tag",
	"rias/riasw/form/Button",
	"rias/riasw/grid/GridX"
], function(rias, Tag){

	var style = {
			//border: "",
			padding: "0px",
			//margin: "",
			width: "100px",
			height: "100px"
		},
		query = {
		},
		target = "",
		viewModule = "",
		pageSize = 15,
		pageSizes = [15, 30, 100],
		structure = [],
		treeColumns = [],
		topBtns = [],
		cellOpParams = [];

	var SPECIAL_CHARS = ['<a', 'a/>', '&', '!', '#', '*', '^', '%'];
	var toSpecialchars = function(str){
		var i, c,
			len = str.length,
			spLen = SPECIAL_CHARS.length,
			newStr = [];

		for(i = 0; i < len; i++){
			c = str.charCodeAt(i);
			newStr.push(SPECIAL_CHARS[c % spLen]);
		}

		return newStr.join('');
	};
	function textDecorator(){
		return [
			"<div dojoType='dijit.form.TextBox' class='gridxHasGridCellValue' style='width: 100%;'></div>",
			"<button>Button</button>",
			"<a href='www.riastudio.cn'>RIAStudio</a>"
		].join('');
	}
	function linkDecorator(data, rowId, rowIndex){
		return ["<a href='http://www.google.com.hk/search?q=", encodeURI(data), "'>[Google]  ", data, "</a><br />",
			"<a href='http://bing.com/search?q=", encodeURI(data), "'>[Bing]  ", data, "</a><br />",
			"<a href='http://search.yahoo.com/search?p=", encodeURI(data), "'>[Yahoo]  ", data, "</a>"
		].join('');
	}
	function progressDecorator(){
		return [
			"<div data-dojo-type='dijit.ProgressBar' data-dojo-props='maximum: 1' class='gridxHasGridCellValue' style='width: 100%;'></div>"
		].join('');
	}
	function dateDecorator(){
		return [
			"<div dojoType='dijit.form.DateTextBox' data-dojo-attach-point='dateBox' class='gridxHasGridCellValue' style='width: 100%;'></div>"
		].join('');
	}
	function timeDecorator(){
		return [
			"<div dojoType='dijit.form.TimeTextBox' data-dojo-attach-point='timeBox' class='gridxHasGridCellValue' style='width: 100%;'></div>"
		].join('');
	}
	function datetimeDecorator(){
		return [
			"<div dojoType='dijit.form.TextBox' data-dojo-attach-point='datetimeBox' class='gridxHasGridCellValue' style='width: 100%;'></div>"
		].join('');
	}
	var decorators = {
		"text": function(data){
			return data;
		},
		"link": linkDecorator,
		"progress": progressDecorator,
		"date": timeDecorator,
		"time": timeDecorator,
		"datetime": timeDecorator
	};

	//FIXME:zensst.树表格和查询过滤有冲突，不能共存。有重复的行记录。
	return function(params){
		var gp = rias.mixinDeep({
				//afterBodyRefresh: function(){
				//}
			}, params, {
				_riaswType: "rias.riasw.grid.GridX"
			}),
			i, l;

		/*gp.onModulesLoaded = function(){
			var g = this;
			if(g.body && g.body.refresh){
				g.own(rias.after(g.body, "refresh", function(results){
					return results.then(function(){
						if(rias.isFunction(g.afterBodyRefresh)){
							g.afterBodyRefresh();
						}
					});
				}, false));
			}
		};*/

		gp._riaswIdOfModule = gp._riaswIdOfModule || "grid";
		//gp.columnLockCount = gp.columnLockCount || 1;///移到 cellOpParams 中处理。
		gp.pagination = gp.pagination || true;
		gp.filter = gp.filter || false;
		gp.edit = gp.edit || false;
		gp.style = gp.style || style;
		gp.target = gp.target || target;
		gp.query = gp.query || query;
		gp.viewModule = gp.viewModule || viewModule;
		gp.pageSize = gp.pageSize || pageSize;
		gp.pageSizes = gp.pageSizes || pageSizes;
		gp.store = rias.mixinDeep({
			_riaswType: "rias.riasw.store.JsonRestStore",
			idAttribute: 'id',
			labelAttribute: 'label',
			target: gp.target || target
		}, gp.store);

		gp.topBtns = gp.topBtns || topBtns;
		var _topBar = {
				_riaswType: "rias.riasw.layout.Panel",
				//_riaswIdOfModule: gp._riaswIdOfModule + "_topBar",
				style: {
					width: "auto",
					height: "auto",
					"border-bottom": "1px solid lightgray"
				}
			},
			_btnRefresh = {
				_riaswType: "rias.riasw.form.Button",
				_riaswIdOfModule: gp._riaswIdOfModule + "_btnRefresh",
				label: rias.i18n.action.refresh,
				tooltip: rias.i18n.action.refresh,
				iconClass: "refreshIcon",
				onClick: function(evt){
					this.grid.refresh();
				}
			},
			_btnAdd = {
				_riaswType: "rias.riasw.form.Button",
				_riaswIdOfModule: gp._riaswIdOfModule + "_btnAdd",
				label: rias.i18n.action.add,
				tooltip: rias.i18n.action.add,
				iconClass: "addIcon",
				onClick: function(evt){
					this.grid.addRecord(this.grid, this);
				}
			},
			_btnDele = {
				_riaswType: "rias.riasw.form.Button",
				_riaswIdOfModule: gp._riaswIdOfModule + "_btnDele",
				label: rias.i18n.action.dele,
				tooltip: rias.i18n.action.dele,
				iconClass: "deleIcon",
				onClick: function(evt){
					this.grid.deleteRecoreds(this.grid, this.grid.select.row.getSelected(), this);
				}
			},
			btn, _btn;
		l = gp.topBtns.length;
		//_btnRefresh.placeAt(_topBar);
		_topBar._riaswChildren = [_btnRefresh];
		for(i = 0; i < l; i++){
			_btn = undefined;
			btn = gp.topBtns.shift();// gp.topBtns[i];
			if(rias.isObjectSimple(btn)){
				_btn = rias.mixinDeep({}, btn.name === "btnAdd" ? _btnAdd : btn.name === "btnDelete" ? _btnDele : {
					_riaswType: "rias.riasw.form.Button",
					//_riaswIdOfModule: "btnCancel",
					//label: rias.i18n.action.cancel,
					//tooltip: rias.i18n.action.cancel,
					//iconClass: "cancelIcon",
					onClick: function(evt){
					}
				}, btn);
			}else if(rias.isString(btn)){
				if(btn == "btnAdd"){
					_btn = _btnAdd;
				}else if(btn == "btnDelete"){
					_btn = _btnDele;
				}
			}else if(btn != "btnRefresh"){
				if(rias.isDijit(btn) || rias.isRiasd(btn)){
					_btn = btn;
				}
			}
			if(_btn){
				_topBar._riaswChildren.push(_btn);
			}
		}
		gp.barTop = [_topBar];
		gp.btnRefresh = {
			"$refScript": "return module." + gp._riaswIdOfModule + "_btnRefresh;"
		};
		gp.btnAdd = {
			"$refScript": "return module." + gp._riaswIdOfModule + "_btnAdd;"
		};
		gp.btnDelete = {
			"$refScript": "return module." + gp._riaswIdOfModule + "_btnDele;"
		};

		gp.opColumnWidth = gp.opColumnWidth || "8em";
		//gp.cellOpParams = gp.cellOpParams;// || cellOpParams;
		if(rias.isArray(gp.cellOpParams)){
			gp.structure = [
				{field: gp.store.idAttribute,		name: "操作",			width: gp.opColumnWidth,
					//expandLevel: 'all',
					widgetsInCell: true,
					navigable: true,
					allowEventBubble: true,
					decorator: function(){
						var grid = gp;//arguments.callee.caller.arguments[0].grid;
						var str/* = "<a href='javascript:void(0)' "
								+ "data-dojo-type='rias.riasw.html.Tag' "
								+ "data-dojo-attach-point='view' "
								+ "data-dojo-props='ownerRiasw: \"" + gp._riaswIdOfModule + "\", tagType: \"a\", name: \"view\", tooltip: \"查看详细信息\"'>"
								+ "</a>"*/,
							s = "<a href='javascript:void(0)' "
								+ "data-dojo-type='rias.riasw.html.Tag' "
								+ "data-dojo-attach-point='${0}' "
								+ "data-dojo-props='tagType: \"a\", name: \"${0}\", tooltip: \"${1}\"'>${2}"
								+ "</a>",
							item, i, l = grid.cellOpParams.length;
						str = "";
						for(i = 0; i < l; i++){
							item = grid.cellOpParams[i];
							if(item && item.name){
								str = str + (str ? "  " : "") + rias.substitute(s, [item.name, item.tooltip, item.text]);
							}
						}
						return str;
					},
					setCellValue: function(gridData, storeData, widget){
						//appendChild(plugin.domNode)
						var cell = widget,
							grid = widget.cell.grid,
							module = grid._riasrModule,
							item, i, l = grid.cellOpParams.length;
						function _click(evt){
							item = {
								func: "cellOpOnClick"
							};//evt.target是innerHtml，this才是A
							for(i = 0; i < l; i++){
								if(grid.cellOpParams[i].name === this.name){
									item = grid.cellOpParams[i];
								}
							}
							if(item.func == "cellOpOnClick"){
								//grid.cellOpOnClick(grid, this.name, widget);//这里的this是evt的this
								grid.cellOpOnClick.apply(grid, [grid, this.name, widget]);
							}else if(rias.isFunction(item.func)){
								//rias.hitch(module, item.func)(grid, this.name, widget);//这里的this是evt的this
								item.func.apply(module, [grid, this.name, widget]);
							}else if(rias.isFunction(module[item.func])){
								//module[item.func](grid, this.name, widget);//这里的this是evt的this
								module[item.func].apply(module, [grid, this.name, widget]);
							}else{
								console.warn("no widget.item.onClick function of [" + this.name + "]");
							}
						}
						//widget.view.domNode.innerHTML = "<color='darkblue'><b>" + gridData + "</b>";
						//widget.view.domNode.innerHTML = "查看";
						//widget.view.domNode.onclick = _click;
						for(i = 0; i < l; i++){
							item = grid.cellOpParams[i];
							widget[item.name].opParams = item;
							if(item && item.name && widget[item.name]){
								if(item.visible === undefined || item.visible == true ||
										(rias.isFunction(item.visible) && item.visible.apply(this, [module, grid, this.name, widget]))){
									widget[item.name].domNode.onclick = _click;
									if(item.disabled === true || (rias.isFunction(item.disabled) && item.disabled.apply(module, [grid, this.name, widget]))){
										rias.dom.setAttr(widget[item.name].domNode, "disabled", true);
										rias.dom.setAttr(widget[item.name].domNode, "aria-disabled", true);
									}
								}else{
									rias.dom.visible(widget[item.name].domNode, false);
								}
							}
						}
						if(rias.isFunction(gp.setCellOpValue)){
							gp.setCellOpValue.apply(grid, [gridData, storeData, widget]);
						}
					}
				}
			].concat(structure).concat(gp.structure);
			gp.columnLockCount = gp.columnLockCount || 1;
		}else{
			gp.structure = structure.concat(gp.structure);
			gp.columnLockCount = gp.columnLockCount || 0;
		}
		for(i = 0, l = gp.structure.length; i < l; i++){
			if(rias.isString(gp.structure[i].format) || rias.isFunction(gp.structure[i].format)){
				gp.structure[i].formatter = function(rawData, rowId){
					var //module = grid._riasrModule,
						col = this,
						v;
					//if(rias.isFunction(module[col.formatter])){
					//	return module[col.formatter](rawData, rowId);
					//}
					if(rawData[col.field] === undefined){
						return rawData[col.field];
					}
					try{
						if(rias.isFunction(col.format)){
							return col.format.apply(this, [rawData, rowId]);
						}else if(rias.isString(col.format)){
							switch(col.format){
								case "text":
									return rawData[col.field];
								case "date":
									return rias.formatDatetime(rawData[col.field], rias.datetime.defaultDateFormatStr);
								case "time":
									return rias.formatDatetime(rawData[col.field], rias.datetime.defaultTimeFormatStr);
								case "datetime":
									return rias.formatDatetime(rawData[col.field], rias.datetime.defaultFormatStr);
								case "boolean":
									return (rawData[col.field] != false ? "是" : "否");
								default:
									if(/^number/.test(col.format)){
										v = rawData[col.field];
										return rias.toFixed(v, rias.toInt(col.format.substring(6), 0));
									}
									return rawData[col.field];
							}
						}
					}catch(e){
						return e;
					}
				}
			}
		}

		var a;
		gp.treeColumns = gp.treeColumns || treeColumns;
		if(gp.treeColumns && gp.treeColumns.length > 0){
			a = rias.queryRiasdParams(gp.structure, "name", gp.treeColumns[0]);//FIXME:zensst.支持多个.
			if(a.length > 0){
				a[0].expandLevel = "all";
			}
			gp.tree = {
				nested: false
			};
		}
		delete gp.treeColumns;

		gp.cellOpOnClick = function(grid, name, widget){
			var g = grid,
				id = widget.cell.row[gp.store.idAttribute],
				d = widget.cell.model.byId(id),
				params = widget[name].opParams,
				meta = {
					dialogType: "top",
					ownerRiasw: g,
					around: widget,
					positions: ["after-centered", "below", "above", "before"],
					moduleMeta: g.viewModule,
					resizable: false,
					//restrictPadding: 0,
					//maxable: false,
					query: {
						id: id
					},
					initData: g.opInitData,
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
						g.refresh();
						def.resolve(1);
						return def.promise;
					}
				};
			d = (d && d.item[gp.store.labelAttribute] ? "[" + d.item[gp.store.labelAttribute] + "]" : "");
			if(name == "modify"){
				rias.show(rias.mixinDeep({
					_riaswIdOfModule: (g._riaswIdOfModule ? g._riaswIdOfModule + "_modi_" + id : undefined),
					caption: params.tooltip + id + d,
					actionBar: [
						"btnSave",
						"btnCancel"
					],
					initDisabled: false,
					initReadOnly: false
				}, meta, params.moduleParams));
			}else if(name == "copy"){
				rias.show(rias.mixinDeep({
					_riaswIdOfModule: (g._riaswIdOfModule ? g._riaswIdOfModule + "_modi_" + id : undefined),
					caption: params.tooltip + id + d,
					actionBar: [
						"btnSave",
						"btnCancel"
					],
					initDisabled: false,
					initReadOnly: false
				}, meta, params.moduleParams));
			}else{
				rias.show(rias.mixinDeep({
					_riaswIdOfModule: (g._riaswIdOfModule ? g._riaswIdOfModule + "_view_" + id : undefined),
					caption: params.tooltip + id + d,
					actionBar: [
						"btnClose"
					],
					initDisabled: true,
					initReadOnly: true
				}, meta, params.moduleParams));
			}
		};
		gp.refresh = function(query){
			var g = this;
			//g.select.row.clear();
			//if(g.model.clearLazyData){
			//	g.model.clearLazyData();//?是否需要
			//}
			//g.model.clearCache();
			g.clear();
			if(query){
				g.query = query;
			}
			g.model._cache.options.query = g.query;
			//g.model.when(g.query, function(){
				//console.debug("refresh");
				//rias.message({
				//	dialogType: "tip",
				//	ownerRiasw: g,
				//	around: g.btnRefresh && rias.dom.visible(g.btnRefresh) ? g.btnRefresh : undefined,
				//	content: "成功载入数据.",
				//	autoClose: 1000
				//});
			//});
			g.body.refresh();
		};
		gp.addRecord = function(grid, around){
			var g = grid;
			rias.show({
				ownerRiasw: g,
				_riaswIdOfModule: (g._riaswIdOfModule ? g._riaswIdOfModule + "_add" : undefined),
				moduleMeta: g.viewModule,
				dialogType: "modal",
				around: around,
				autoClose: 0,
				caption: rias.i18n.action.add,
				query: {
					//id: ""
				},
				initData: g.opInitData,
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
					var m = this,
						d = rias.newDeferred();
					g.refresh();
					d.resolve(1);
					return d.promise;
				}
			});
		};
		gp.deleteRecoreds = function(grid, ids, around){
			var g = grid;
			ids = (rias.isArray(ids) ? ids : rias.isString(ids) ? [ids] : []);
			if(ids.length){
				rias.choose({
					_riaswIdOfModule: g._riaswIdOfModule + "_dele",
					ownerRiasw: g,
					dialogType: "modal",
					around: around,
					autoClose: 0,
					content: "是否删除[" + ids + "]?",
					caption: rias.i18n.action.dele,
					onSubmit: function(mr){
						//if(mr){
							rias.xhrDelete(g.target, {
									_idDirty: ids.join(",")//[101, 10101, 010102]
								}, function(result){
									if(!result.success || result.success < 1){
										rias.warn("删除失败...");
									}else{
										g.refresh();
									}
								}
							);
						//}
						return 1;
					}
				});
			}
		};

		return gp;

	};

});