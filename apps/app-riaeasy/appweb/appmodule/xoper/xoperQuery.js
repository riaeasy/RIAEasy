define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 327,
	"_riaswVersion": "0.7",
	"query": {
	},
	"_riaswElements": [
		{
			"_riaswType": "riasw.layout.Panel",
			"_riaswIdInModule": "panTitle",
			"class": "infoRegion appPanelShadow",
			"region": "top",
			"_riaswElements": [
				{
					"_riaswType": "riasw.sys.Tag",
					"_riaswIdInModule": "tagInfo",
					"class": "infoText",
					"content": "操作员定义",
					"tagType": "span"
				}
			]
		},
		{
			"_riaswType": "riasw.layout.Fieldset",
			"_riaswIdInModule": "main",
			"caption": "查询结果",
			"class": "appPanelShadow",
			"region": "center",
			"_riaswElements": [
				{
					"_riaswType": "riasw.grid.DGrid",
					"_riaswIdInModule": "grid",
					"cellOpParams": [
						{
							"func": "cellOpOnClick",
							"name": "view",
							"text": "查看",
							"tooltip": "查看缴款户信息"
						},
						{
							"func": "cellOpOnClick",
							"name": "modify",
							"text": "修改",
							"tooltip": "修改缴款户信息"
						},
						{
							"func": "cellOpOnClick",
							"name": "copy",
							"text": "复制",
							"tooltip": "复制并新增"
						}
					],
					"loadDataOnStartup": false,
					"query": {
						"$refObj": "module.query"
					},
					"region": "center",
					"structure": [
						{
							"field": "text",
							"name": "姓名",
							"width": "100px"
						},
						{
							"field": "code",
							"name": "工号",
							"width": "80px"
						},
						{
							"field": "stat",
							"name": "账号状态",
							"width": "80px"
						},
						{
							"field": "typ",
							"name": "操作员类型",
							"width": "80px"
						},
						{
							"field": "dtyp",
							"name": "证件类型",
							"width": "80px"
						},
						{
							"field": "dcode",
							"name": "证件编号",
							"width": "100px"
						},
						{
							"field": "dmobile",
							"name": "手机",
							"width": "100px"
						},
						{
							"field": "dtele",
							"name": "联系电话",
							"width": "100px"
						},
						{
							"field": "demail",
							"name": "email",
							"width": "200px"
						},
						{
							"field": "dstat",
							"name": "工作状态",
							"width": "100px"
						},
						{
							"field": "dinfo",
							"name": "备注",
							"width": "280px"
						}
					],
					"style": {
						"border": "1px #b1badf solid"
					},
					"target": {
						"$refScript": "return rias.desktop.dataServerAddr + 'act/xoper/query';"
					},
					"topTools": [
						"toolRefresh",
						"toolAux",
						"toolAdd",
						"toolDelete"
					],
					"treeColumns": [
					],
					"viewModule": "appmodule/xoper/xoperBase",
					"viewRecordParams": {
						"dockTo": {
							$refScript: "return rias.parentSceneBy(module).appDock;"
						},
						"toggleable": true
					}
				}
			]
		},
		{
			"_riaswType": "riasw.layout.Fieldset",
			"_riaswIdInModule": "qPane",
			"caption": "查询条件",
			"class": "appPanelShadow",
			"region": "right",
			"splitter": true,
			"style": {
				"padding": "0px",
				"width": "19em"
			},
			"toggleable": true,
			"_riaswElements": [
				{
					"_riaswType": "riasw.layout.Panel",
					"_riaswIdInModule": "qBar",
					"region": "top",
					"_riaswElements": [
						{
							"iconClass": "queryIcon",
							"label": "查询",
							"style": {
							},
							"onClick": function (evt){
		var m = this.getOwnerModule(),
			g = m.grid,
			a = m.qForm ? m.qForm.get("value") : undefined,
			q, k;
		if(g){
			q = rias.mixinDeep({}, m.query);
			if(a){
				for(k in a){
					if(a[k]){
						q[k] = a[k];
					}else{
						delete q[k];
					}
				}
			}
			g.refresh(q);
		}
	},
							"_riaswType": "riasw.form.Button",
							"_riaswIdInModule": "btnQuery"
						},
						{
							"_riaswType": "riasw.form.Button",
							"_riaswIdInModule": "btnClear",
							"iconClass": "clearIcon",
							"label": "清除",
							"style": {
							},
							"onClick": function (evt){
		var m = this.getOwnerModule(),
			g = m.grid;
		if(g){
			if(m.qForm && m.qForm.reset){
				m.qForm.reset();
			}
			g.refresh(m.query);
		}
	}
						}
					]
				},
				{
					"_riaswType": "riasw.sys.Form",
					"_riaswIdInModule": "qForm",
					"region": "center",
					"_riaswElements": [
						{
							"_riaswType": "riasw.layout.TablePanel",
							"_riaswIdInModule": "qTable",
							"cellStyle": {
								"border": "0px solid",
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
							"cols": 1,
							"region": "center",
							"_riaswElements": [
								{
									"_riaswType": "riasw.form.TextBox",
									"_riaswIdInModule": "q_idq",
									"label": "操作员id",
									"name": "idq",
									"rc": {
										"col": 1,
										"row": 1
									},
									"tooltip": "操作员id"
								},
								{
									"_riaswType": "riasw.form.TextBox",
									"_riaswIdInModule": "q_code",
									"label": "操作员工号",
									"name": "code",
									"rc": {
										"col": 1,
										"row": 2
									},
									"tooltip": "操作员工号"
								},
								{
									"_riaswType": "riasw.form.TextBox",
									"_riaswIdInModule": "q_text",
									"label": "操作员姓名",
									"name": "text",
									"rc": {
										"col": 1,
										"row": 3
									},
									"tooltip": "操作员姓名"
								}
							]
						}
					]
				}
			]
		}
	]
};
	
});
