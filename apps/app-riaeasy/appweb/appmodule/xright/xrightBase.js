define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 559,
	"_riaswType": "riasw.sys.Module",
	"_riaswVersion": "0.7",
	"actionType": "",
	"query": {
	},
	"style": {
		"height": "25em",
		"padding": "0px",
		"width": "56em"
	},
	"target": {
		"$refScript": "return rias.desktop.dataServerAddr + 'act/xright/query';"
	},
	"afterLoadedAll": function (loadOk){
			var m = this;
		if(loadOk){
			rias.forEach(m.getValueWidgets(), function(child){
				child.set("disabled", m.initDisabled || child.disabled);
				child.set("readOnly", m.initReadOnly || child.readOnly);
			});
			m.loadData(m.query).then(function(){
			});
		}
		},
	"loadData": function (query){
			var m = this,
				s = m._store,
				d = rias.newDeferred();
			if(query){
				rias.when(s.query(query), function(items){
					if(items.length > 0){
						m.set("value", items[0]);
					}else{
						m.reset();
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
				v = m.get("value"),
				d = rias.newDeferred();
			function _cb(result){
				if(!result.success || result.success < 1){
					rias.warn("提交处理失败", m);
					d.reject(0);
				}else{
					d.resolve(1);
				}
			}
			if(m.edt_typ.item){
				v.typ = m.edt_typ.item.dval;
			}else{
				delete v.typ;
			}
			if(m.edt_stat.item){
				v.stat = m.edt_stat.item.dval;
			}else{
				delete v.stat;
			}
			if(m.target){
				if(m.actionType === "add" || m.actionType === "copy"){
					rias.xhr.post(m.target, v, _cb);
				}else if(m.actionType === "modify"){
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
	"_riaswElements": [
		{
			"_riaswType": "riasw.layout.TablePanel",
			"_riaswIdInModule": "table",
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
			"_riaswElements": [
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edt_id",
					"label": "菜单/权限id",
					"name": "id",
					"rc": {
						"col": 1,
						"row": 2
					}
				},
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edt_text",
					"label": "菜单/权限名称",
					"name": "text",
					"rc": {
						"col": 2,
						"row": 2
					}
				},
				{
					"_riaswType": "riasw.form.ButtonBox",
					"_riaswIdInModule": "edt_dicon",
					"label": "图标",
					"name": "dicon",
					"pageSize": 16,
					"rc": {
						"col": 3,
						"row": 2
					},
					"query": {
						"parentCode": "xdictdtyp"
					},
					"queryExpr": "${0}%",
					"store": {
						"_riaswType": "riasw.store.JsonXhrStore",
						"idProperty": "dval",
						"labelProperty": "text",
						"target": "act/xdict/query"
					}
				},
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edt_idp",
					"label": "上级id",
					"name": "idp",
					"rc": {
						"col": 1,
						"row": 3
					}
				},
				{
					"_riaswType": "riasw.form.NumberSpinner",
					"_riaswIdInModule": "edt_ord",
					"label": "顺序号",
					"name": "ord",
					"rc": {
						"col": 2,
						"row": 3
					}
				},
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edt_children",
					"disabled": true,
					"label": "子项数",
					"name": "children",
					"rc": {
						"col": 3,
						"row": 3
					}
				},
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edt_code",
					"label": "编码",
					"name": "code",
					"rc": {
						"col": 1,
						"row": 4
					}
				},
				{
					"_riaswType": "riasw.form.ComboBox",
					"_riaswIdInModule": "edt_typ",
					"label": "类型",
					"name": "typ",
					"pageSize": 16,
					"rc": {
						"col": 2,
						"row": 4
					},
					"query": {
						"parentCode": "xrighttyp"
					},
					"queryExpr": "${0}%",
					"searchAttr": "text",
					"store": {
						"_riaswType": "riasw.store.JsonXhrStore",
						"idProperty": "dval",
						"labelProperty": "text",
						"target": "act/xdict/query"
					}
				},
				{
					"_riaswType": "riasw.form.ComboBox",
					"_riaswIdInModule": "edt_stat",
					"label": "状态",
					"name": "stat",
					"pageSize": 16,
					"rc": {
						"col": 3,
						"row": 4
					},
					"query": {
						"parentCode": "xdictstat"
					},
					"queryExpr": "${0}%",
					"searchAttr": "text",
					"store": {
						"_riaswType": "riasw.store.JsonXhrStore",
						"idProperty": "dval",
						"labelProperty": "text",
						"target": "act/xdict/query"
					}
				},
				{
					"_riaswType": "riasw.form.TextArea",
					"_riaswIdInModule": "edt_dcmd",
					"label": "运行(js)",
					"name": "dcmd",
					"rc": {
						"col": 1,
						"colSpan": 3,
						"row": 5
					},
					"style": {
						"height": "15em"
					}
				},
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edt_dinfo",
					"label": "备注",
					"name": "dinfo",
					"rc": {
						"col": 1,
						"colSpan": 3,
						"row": 6
					}
				}
			]
		},
		{
			"_riaswType": "riasw.store.JsonXhrStore",
			"_riaswIdInModule": "_store",
			"idProperty": "id",
			"target": {
				"$refScript": "return module.target;"
			}
		}
	]
}
	
});
