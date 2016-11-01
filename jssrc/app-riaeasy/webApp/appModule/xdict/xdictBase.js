define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 558,
	"_riaswType": "rias.riasw.studio.Module",
	"_riaswVersion": "0.7",
	"op": "query",
	"query": {
	},
	"style": {
		"height": "12em",
		"padding": "0px",
		"width": "56em"
	},
	"target": {
		"$refScript": "return rias.webApp.dataServerAddr + 'act/xdict/query';"
	},
	"afterLoaded": function (/*{widgets: widgets, parent: parent, module: m}*/result){
		var m = this;
		rias.forEach(m.table._widgets, function(child){
			child.set("disabled", m.initDisabled || child.disabled);
			child.set("readOnly", m.initReadOnly || child.readOnly);
		});
		m.loadData(m.query).then(function(){
		});
	},
	"loadData": function (query){
		var m = this,
			s = m._store,
			d = rias.newDeferred();
		if(query){
			rias.when(s.query(query), function(items){
				if(items.length > 0){
					m.table.set("value", items[0]);
				}else{
					m.table.reset();
				}
				d.resolve(items);
			}, function(err){
				console.error("error loading the data: ", query, err);
				d.resolve(m, err);
			});
		}else{
			d.resolve(m);
		}
		return d.promise;
	},
	"onSubmit": function (){
		var m = this,
			v = m.table.get("value"),
			d = rias.newDeferred();
		function _cb(result){
			if(!result.success || result.success < 1){
				m.canClose = false;
				rias.warn("提交处理失败", null, m);
				d.reject(0);
			}else{
				m.canClose = true;
				d.resolve(1);
				if(rias.webApp.datas){
					rias.webApp.datas.loadXdict();
				}
			}
		}
		m.edt_typ.item ? v.typ = m.edt_typ.item.dval : delete v.typ;
		m.edt_stat.item ? v.stat = m.edt_stat.item.dval : delete v.stat;
		m.edt_dtyp.item ? v.dtyp = m.edt_dtyp.item.dval : delete v.dtyp;
		if(m.target){
			if(m.op === "add" || m.op === "copy"){
				rias.xhr.post(m.target, v, _cb);
			}else if(m.op === "modify"){
				v._idDirty = m.query.id;
				rias.xhr.put(m.target, v, _cb);
			}else{
				d.resolve(1);
			}
		}else{
			d.resolve(1);
		}
		return d.promise;
	},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.TablePanel",
			"_riaswIdOfModule": "table",
			"cellStyle": {
				"border": "0px solid darkblue",
				"padding": "1px"
			},
			"childParams": {
				"labelWidth": "6em",
				"showLabel": true
			},
			"childStyle": {
				"height": "2em",
				"width": "100%"
			},
			"colWidths": [
				"33%",
				"33%",
				"30%",
				"4%"
			],
			"cols": 4,
			"region": "center",
			"style": {
				"margin": "auto"
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edt_id",
					"label": "条目id",
					"name": "id",
					"position": {
						"col": 0,
						"row": 1
					}
				},
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edt_text",
					"label": "条目名称",
					"name": "text",
					"position": {
						"col": 1,
						"row": 1
					}
				},
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edt_idp",
					"label": "上级id",
					"name": "idp",
					"position": {
						"col": 0,
						"row": 2
					}
				},
				{
					"_riaswType": "rias.riasw.form.NumberSpinner",
					"_riaswIdOfModule": "edt_ord",
					"label": "顺序号",
					"name": "ord",
					"position": {
						"col": 1,
						"row": 2
					}
				},
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edt_children",
					"disabled": true,
					"label": "子项数",
					"name": "children",
					"position": {
						"col": 2,
						"row": 2
					}
				},
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edt_code",
					"label": "条目编码",
					"name": "code",
					"position": {
						"col": 0,
						"row": 3
					}
				},
				{
					"_riaswType": "rias.riasw.form.FilteringSelect",
					"_riaswIdOfModule": "edt_typ",
					"displaySearch": true,
					"label": "条目类型",
					"labelAttr": "text",
					"name": "typ",
					"position": {
						"col": 1,
						"row": 3
					},
					"query": {
						"parentCode": "xdicttyp"
					},
					"queryExpr": "${0}*",
					"searchAttr": "dval",
					"store": {
						"$refObj": "rias.webApp.datas.xdict"
					}
				},
				{
					"_riaswType": "rias.riasw.form.FilteringSelect",
					"_riaswIdOfModule": "edt_stat",
					"displaySearch": true,
					"label": "条目状态",
					"labelAttr": "text",
					"name": "stat",
					"position": {
						"col": 2,
						"row": 3
					},
					"query": {
						"parentCode": "xdictstat"
					},
					"queryExpr": "${0}*",
					"searchAttr": "dval",
					"store": {
						"$refObj": "rias.webApp.datas.xdict"
					}
				},
				{
					"_riaswType": "rias.riasw.form.FilteringSelect",
					"_riaswIdOfModule": "edt_dtyp",
					"displaySearch": true,
					"editable": true,
					"label": "值类型",
					"labelAttr": "text",
					"name": "dtyp",
					"position": {
						"col": 0,
						"row": 4
					},
					"query": {
						"parentCode": "xdictdtyp"
					},
					"queryExpr": "${0}*",
					"searchAttr": "dval",
					"store": {
						"$refObj": "rias.webApp.datas.xdict"
					}
				},
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edt_dval",
					"label": "值",
					"name": "dval",
					"position": {
						"col": 1,
						"colSpan": 2,
						"row": 4
					}
				},
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edt_dinfo",
					"label": "备注",
					"name": "dinfo",
					"position": {
						"col": 0,
						"colSpan": 3,
						"row": 5
					}
				}
			]
		},
		{
			"idProperty": "id",
			"target": {
				"$refScript": "return module.target;"
			},
			"_riaswType": "rias.riasw.store.JsonXhrStore",
			"_riaswIdOfModule": "_store"
		}
	]
}
	
});
