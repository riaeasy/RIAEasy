define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 82,
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
			g.refresh();
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
							"_riaswType": "rias.riasw.layout.CaptionPanel",
							"_riaswIdOfModule": "captionPanel1",
							"layoutPriority": 0,
							"region": "center",
							"caption": "any",
							"splitter": false
						}
					]
				}
			]
		}
	]
}
	
});
