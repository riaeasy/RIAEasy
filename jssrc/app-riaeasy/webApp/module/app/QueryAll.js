define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 77,
	"_riaswVersion": "0.7",
	"region": "center",
	"actions": {
		"dacc": "act/dacc/queryAll",
		"dmeter": "act/dmeter/queryAll"
	},
	"caption": "综合查询",
	"events": [
		{
			"event": "click",
			"func": "btnSearchOnClick",
			"widget": "btnSearch"
		}
	],
	"_queryGrid": function (grid){
		var m = this,
			a = {
				idall: m.q_idall.get("value"),
				textall: m.q_textall.get("value")
			},
			key;
		function _query(g){
			var q = g.query;
			if(a){
				for(key in a){
					if(a[key]){
						q[key] = a[key];
					}else{
						delete q[key];
					}
				}
			}
			g.refreshGrid();
		}
		//_query(grid);
		_query(m.daccGrid);
		_query(m.dmeterGrid);
	},
	"_riaswChildren": [
		{
			"_riaswIdOfModule": "main",
			"_riaswType": "rias.riasw.layout.Panel",
			"region": "center",
			"design": "headline",
			"gutters": true,
			"style": {
				"padding": "0px"
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.layout.TablePanel",
					"_riaswIdOfModule": "inputs",
					"cellStyle": {
						"border": "0px solid",
						"height": "3em"
					},
					"childLabelWidth": "10em",
					"childShowLabel": true,
					"childStyle": {
						"height": "2em",
						"width": "100%"
					},
					"colWidths": [
						"5%",
						"30%",
						"30%",
						"30%"
					],
					"cols": 4,
					"region": "top",
					"splitter": false,
					"style": {
						"border": "0px solid silver",
						"padding": "4px 1em"
					},
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.form.TextBox",
							"_riaswIdOfModule": "q_idall",
							"label": "id / 电话 / 证件编号",
							"name": "idall",
							"position": {
								"col": 1,
								"row": 0
							},
							"tooltip": "id / 电话 / 证件编号 的模糊查询",
							"onKeyDown": function (evt){
			var m = this._riasrModule;
			if(evt.keyCode == rias.keys.ENTER){
				if(m._currGrid){
					m._queryGrid(m._currGrid);
				}
			}
		},
							"onChange": function (newValue){
			var m = this._riasrModule;
			if(m._currGrid){
				//m._queryGrid(m._currGrid);
			}
		}
						},
						{
							"_riaswType": "rias.riasw.form.TextBox",
							"_riaswIdOfModule": "q_textall",
							"label": "户名 / 姓名 / 地址",
							"name": "textall",
							"position": {
								"col": 2,
								"row": 0
							},
							"tooltip": " 户名 / 姓名 / 地址 的模糊查询",
							"onKeyDown": function (evt){
			var m = this._riasrModule;
			if(evt.keyCode == rias.keys.ENTER){
				if(m._currGrid){
					m._queryGrid(m._currGrid);
				}
			}
		},
							"onChange": function (newValue){
			var m = this._riasrModule;
			if(m._currGrid){
				m._queryGrid(m._currGrid);
			}
		}
						},
						{
							"_riaswType": "rias.riasw.form.Button",
							"_riaswIdOfModule": "btnSearch",
							"iconClass": "queryIcon",
							"label": "模糊查询",
							"position": {
								"col": 3,
								"row": 0
							},
							"onClick": function (evt){
			var m = this._riasrModule;
			if(m._currGrid){
				m._queryGrid(m._currGrid);
			}
		}
						}
					]
				},
				{
					"_riaswType": "rias.riasw.layout.TabPanel",
					"_riaswIdOfModule": "tabs",
					"region": "center",
					"style": {
						"padding": "0px"
					},
					"onShowChild": function (page){
		var m = this._riasrModule;
		m._currGrid = page || m.tabs.selectedChildWidget;
		if(m._currGrid){
			//m._queryGrid(m._currGrid);
		}
	},
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.grid.GridX",
							"_riaswIdOfModule": "daccGrid",
							"cellIdOps": [
								{
									"func": "cellIdOnClick",
									"name": "view",
									"text": "查看",
									"tooltip": "查看详细信息"
								}
							],
							"query": {
							},
							"region": "center",
							"structure": [
								{
									"field": "code",
									"name": "缴款户编号",
									"width": "100px"
								},
								{
									"field": "text",
									"name": "名称",
									"width": "160px"
								},
								{
									"field": "daddr",
									"name": "地址",
									"width": "200px"
								},
								{
									"field": "stat",
									"name": "状态",
									"width": "100px"
								},
								{
									"field": "typ",
									"name": "缴款户类型",
									"width": "100px"
								},
								{
									"field": "dtyp",
									"name": "默认缴款类型",
									"width": "100px"
								},
								{
									"field": "dtypclass",
									"name": "缴款户集群",
									"width": "160px"
								},
								{
									"field": "dbank",
									"name": "开户行",
									"width": "120px"
								},
								{
									"field": "daccount",
									"name": "帐号",
									"width": "180px"
								},
								{
									"field": "dname",
									"name": "发票名",
									"width": "180px"
								},
								{
									"field": "dinfo",
									"name": "备注",
									"width": "280px"
								}
							],
							"style": {
								"border": "1px #b1badf solid",
								"height": "100%",
								"region": "center",
								"weith": "100%"
							},
							"target": {
								"$refScript": "return module.actions.dacc;"
							},
							"caption": "缴款户信息",
							"treeColumns": [
							],
							"viewModule": "appModule/dacc/daccForm"
						},
						{
							"_riaswType": "rias.riasw.grid.GridX",
							"_riaswIdOfModule": "dmeterGrid",
							"cellIdOps": [
								{
									"func": "cellIdOnClick",
									"name": "view",
									"text": "查看",
									"tooltip": "查看详细信息"
								}
							],
							"query": {
							},
							"region": "center",
							"structure": [
								{
									"field": "code",
									"name": "用户编号",
									"width": "100px"
								},
								{
									"field": "dcontact",
									"name": "默认客户姓名",
									"width": "220px"
								},
								{
									"field": "text",
									"name": "安装地址",
									"width": "260px"
								},
								{
									"field": "dmobile",
									"name": "手机",
									"width": "120px"
								},
								{
									"field": "dtele",
									"name": "其他联系方式",
									"width": "180px"
								},
								{
									"field": "stat",
									"name": "状态",
									"width": "100px"
								},
								{
									"field": "typ",
									"name": "基表类型",
									"width": "100px"
								},
								{
									"field": "dtyp",
									"name": "计费类型",
									"width": "100px"
								},
								{
									"field": "dval",
									"name": "量程",
									"width": "80px"
								},
								{
									"field": "dcodetyp",
									"name": "证件类型",
									"width": "80px"
								},
								{
									"field": "dcode",
									"name": "证件编号",
									"width": "120px"
								},
								{
									"field": "daddr",
									"name": "证件地址",
									"width": "260px"
								},
								{
									"field": "demail",
									"name": "email",
									"width": "180px"
								},
								{
									"field": "dinfo",
									"name": "备注",
									"width": "280px"
								}
							],
							"style": {
								"border": "1px #b1badf solid",
								"height": "100%",
								"region": "center",
								"weith": "100%"
							},
							"target": {
								"$refScript": "return module.actions.dmeter;"
							},
							"caption": "基表信息",
							"treeColumns": [
							],
							"viewModule": "appModule/dmeter/dmeterForm"
						}
					]
				}
			]
		}
	]
}
	
});
