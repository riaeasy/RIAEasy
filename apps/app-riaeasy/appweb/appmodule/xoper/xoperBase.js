define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 15,
	"_riaswVersion": "0.7",
	"caption": "操作员信息",
	"actionType": "",
	"query": {
	},
	"style": {
		"height": "12em",
		"padding": "0px",
		"width": "56em"
	},
	"target": {
		"$refScript": "return rias.desktop.dataServerAddr + 'act/xoper/query';"
	},
	"afterLoadedAll": function (loadOk){
		var m = this;
		if(loadOk){
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
				"35%",
				"35%",
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
					"_riaswIdInModule": "edt_code",
					"label": "操作员工号",
					"name": "code",
					"rc": {
						"col": 1,
						"row": 1
					}
				},
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edt_text",
					"label": "操作员姓名",
					"name": "text",
					"rc": {
						"col": 2,
						"row": 1
					}
				},
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edt_id",
					"label": "检索字(id)",
					"name": "id",
					"rc": {
						"col": 3,
						"row": 1
					},
					"readOnly": true
				},
				{
					"_riaswType": "riasw.form.ComboBox",
					"_riaswIdInModule": "edt_typ",
					"label": "操作员类型",
					"name": "typ",
					"pageSize": 16,
					"rc": {
						"col": 1,
						"row": 2
					},
					"query": {
						"parentCode": "/^s*$|xopertyp/"
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
					"label": "账号状态",
					"name": "stat",
					"pageSize": 16,
					"rc": {
						"col": 2,
						"row": 2
					},
					"query": {
						"parentCode": "/^s*$|xoperstat/"
					},
					"queryExpr": "${0}*",
					"searchAttr": "text",
					"store": {
						"$refObj": "rias.desktop.datas.xdict"
					}
				},
				{
					"_riaswType": "riasw.form.ComboBox",
					"_riaswIdInModule": "edt_dxm",
					"label": "工作状态",
					"name": "dstat",
					"rc": {
						"col": 3,
						"row": 2
					},
					"query": {
						"parentCode": "/^s*$|xoperdstat/"
					},
					"queryExpr": "${0}*",
					"searchAttr": "text",
					"store": {
						"$refObj": "rias.desktop.datas.xdict"
					}
				},
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edt_dmobile",
					"label": "绑定手机",
					"name": "dmobile",
					"rc": {
						"col": 1,
						"row": 3
					}
				},
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edt_dcode",
					"label": "证件编号",
					"name": "dcode",
					"rc": {
						"col": 2,
						"row": 3
					}
				},
				{
					"_riaswType": "riasw.form.ComboBox",
					"_riaswIdInModule": "edt_dtyp",
					"label": "证件类型",
					"name": "dtyp",
					"pageSize": 16,
					"rc": {
						"col": 3,
						"row": 3
					},
					"query": {
						"parentCode": "/^s*$|idcardtyp/"
					},
					"queryExpr": "${0}*",
					"searchAttr": "text",
					"store": {
						"$refObj": "rias.desktop.datas.xdict"
					}
				},
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edt_demail",
					"label": "eMail",
					"name": "demail",
					"rc": {
						"col": 2,
						"colSpan": 2,
						"row": 4
					}
				},
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edt_dtele",
					"label": "其他联系方式",
					"name": "dtele",
					"rc": {
						"col": 1,
						"row": 4
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
						"row": 5
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
};
	
});
