define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 58,
	"_riaswVersion": "0.7",
	"query": {
	},
	"region": "center",
	"_riaswElements": [
		{
			"_riaswType": "riasw.layout.CaptionPanel",
			"_riaswIdInModule": "qPane",
			"caption": "查询条件",
			"region": "top",
			"style": {
				"height": "6em",
				"padding": "0px"
			},
			"toggleable": true,
			"_riaswElements": [
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "q_idq",
					"label": "id",
					"labelWidth": "5em",
					"name": "idq",
					"rc": {
						"col": 1,
						"row": 1
					},
					"showLabel": true,
					"style": {
						"width": "15em"
					},
					"tooltip": "角色id"
				},
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "q_text",
					"label": "角色名",
					"labelWidth": "5em",
					"name": "text",
					"rc": {
						"col": 2,
						"row": 1
					},
					"style": {
						"width": "15em"
					},
					"showLabel": true,
					"tooltip": "角色名"
				},
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
			"_riaswType": "riasw.layout.Panel",
			"_riaswIdInModule": "panRole",
			"caption": "查询结果",
			"gutters": true,
			"region": "center",
			"style": {
				"height": "6em",
				"padding": "0px"
			},
			"toggleable": true,
			"_riaswElements": [
				{
					"_riaswType": "riasw.layout.CaptionPanel",
					"_riaswIdInModule": "panGrid",
					"caption": "角色信息",
					"region": "center",
					"style": {
					},
					"toggleable": true,
					"_riaswElements": [
						{
							"_riaswType": "riasw.grid.DGrid",
							"_riaswIdInModule": "grid",
							"cellOpParams": [
								{
									"func": "cellOpOnClick",
									"name": "modify",
									"text": "修改",
									"tooltip": "修改详细信息"
								}
							],
							"loadDataOnStartup": false,
							"query": {
								"$refObj": "module.query"
							},
							"region": "center",
							"structure": [
								{
									"field": "id",
									"name": "id",
									"width": "5em"
								},
								{
									"field": "text",
									"name": "角色名",
									"width": "8em"
								},
								{
									"field": "stat",
									"name": "状态",
									"width": "4em"
								},
								{
									"field": "typ",
									"name": "类型",
									"width": "4em"
								},
								{
									"field": "dinfo",
									"name": "备注",
									"width": "20em"
								}
							],
							"style": {
								"border": "1px #b1badf solid"
							},
							"target": {
								"$refScript": "return rias.desktop.dataServerAddr + 'act/xrole/query';"
							},
							"topTools": [
								"toolRefresh",
								"toolAux",
								"toolAdd",
								"toolDelete"
							],
							"treeColumns": [
							],
							"viewModule": "appmodule/xrole/xroleBase",
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
					"_riaswType": "riasw.layout.CaptionPanel",
					"_riaswIdInModule": "panRights",
					"caption": "权限信息",
					"region": "right",
					"style": {
						"width": "30em"
					},
					"toggleable": true
				}
			]
		}
	]
};
	
});
