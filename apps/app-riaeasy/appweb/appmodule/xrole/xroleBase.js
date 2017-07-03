define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 20,
	"_riaswType": "riasw.sys.Module",
	"_riaswVersion": "0.7",
	"caption": "角色信息",
	"actionType": "",
	"query": {
	},
	"style": {
		"height": "6em",
		"padding": "0px",
		"width": "56em"
	},
	"target": {
		"$refScript": "return rias.desktop.dataServerAddr + 'act/xrole/query';"
	},
	"afterLoadedAll": function (loadOk){
		var m = this;
		if(loadOk){
			m.loadData(m.query);
		}
	},
	"loadData": function (query){
		var m = this,
			s = m._store;
		if(query){
			rias.when(s.query(query)).then(function(items){
				if(items.length > 0){
					m.set("value", items[0]);
				}else{
					m.reset();
				}
			}, function(err){
				console.error("error loading the data: ", query, err);
			});
		}else{
			rias.warn("缺少查询条件.", m);
		}
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
				if(rias.desktop.datas && rias.desktop.datas.loadXoper){
					rias.desktop.datas.loadXoper();
				}
			}
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
			"_riaswElements": [
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edt_id",
					"label": "检索字(id)",
					"name": "id",
					"rc": {
						"col": 1,
						"row": 1
					},
					"readOnly": false
				},
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edt_text",
					"label": "角色名",
					"name": "text",
					"rc": {
						"col": 2,
						"row": 1
					}
				},
				{
					"_riaswType": "riasw.form.ComboBox",
					"_riaswIdInModule": "edt_typ",
					"label": "类型",
					"name": "typ",
					"pageSize": 16,
					"rc": {
						"col": 3,
						"row": 1
					},
					"query": {
						"parentCode": "/^s*$|xroletyp/"
					},
					"queryExpr": "${0}*",
					"searchAttr": "text",
					"store": {
						"$refObj": "rias.desktop.datas.xdict"
					}
				},
				{
					"_riaswType": "riasw.form.ComboBox",
					"_riaswIdInModule": "edt_stat",
					"label": "状态",
					"name": "stat",
					"pageSize": 16,
					"rc": {
						"col": 1,
						"row": 2
					},
					"query": {
						"parentCode": "/^s*$|xrolestat/"
					},
					"queryExpr": "${0}*",
					"searchAttr": "text",
					"store": {
						"$refObj": "rias.desktop.datas.xdict"
					}
				},
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edt_dinfo",
					"label": "备注",
					"name": "dinfo",
					"rc": {
						"col": 2,
						"colSpan": 2,
						"row": 2
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
