define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 20,
	"_riaswType": "rias.riasw.studio.Module",
	"_riaswVersion": "0.7",
	"caption": "角色信息",
	"op": "query",
	"query": {
	},
	"style": {
		"height": "6em",
		"padding": "0px",
		"width": "56em"
	},
	"target": {
		"$refScript": "return rias.webApp.dataServerAddr + 'act/xrole/query';"
	},
	"afterLoaded": function (/*{widgets: widgets, parent: parent, module: m}*/result){
		var m = this;
		m.loadData(m.query);
	},
	"loadData": function (query){
		var m = this,
			s = m._store;
		if(query){
			rias.when(s.query(query)).then(function(items){
				if(items.length > 0){
					m.table.set("value", items[0]);
				}else{
					m.table.reset();
				}
			}, function(err){
				console.error("error loading the data: ", query, err);
			});
		}else{
			rias.warn("缺少查询条件.", null, m);
		}
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
					rias.webApp.datas.loadXoper();
				}
			}
		}
		if(m.target){
			if(m.op === "add"){
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
				"height": "2.2em"
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
				"30%",
				"40%",
				"30%"
			],
			"cols": 3,
			"region": "center",
			"style": {
				"height": "100%",
				"margin": "auto",
				"width": "60em"
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edt_id",
					"label": "检索字(id)",
					"name": "id",
					"position": {
						"col": 0,
						"row": 0
					},
					"readOnly": false
				},
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edt_text",
					"label": "角色名",
					"name": "text",
					"position": {
						"col": 1,
						"row": 0
					}
				},
				{
					"_riaswType": "rias.riasw.form.ComboBox",
					"_riaswIdOfModule": "edt_typ",
					"label": "类型",
					"name": "typ",
					"pageSize": 16,
					"position": {
						"col": 2,
						"row": 0
					},
					"query": {
						"parentCode": "/^s*$|xroletyp/"
					},
					"queryExpr": "${0}*",
					"searchAttr": "text",
					"store": {
						"$refObj": "rias.webApp.datas.xdict"
					}
				},
				{
					"_riaswType": "rias.riasw.form.ComboBox",
					"_riaswIdOfModule": "edt_stat",
					"label": "状态",
					"name": "stat",
					"pageSize": 16,
					"position": {
						"col": 0,
						"row": 1
					},
					"query": {
						"parentCode": "/^s*$|xrolestat/"
					},
					"queryExpr": "${0}*",
					"searchAttr": "text",
					"store": {
						"$refObj": "rias.webApp.datas.xdict"
					}
				},
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edt_dinfo",
					"label": "备注",
					"name": "dinfo",
					"position": {
						"col": 1,
						"colSpan": 2,
						"row": 1
					}
				}
			]
		},
		{
			"_riaswType": "rias.riasw.store.JsonXhrStore",
			"_riaswIdOfModule": "_store",
			"idProperty": "id",
			"target": {
				"$refScript": "return module.target;"
			}
		}
	]
}
	
});
