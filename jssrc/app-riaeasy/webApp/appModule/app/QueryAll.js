define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 155,
	"_riaswVersion": "0.7",
	"caption": "综合查询",
	"region": "center",
	"actions": function (){
		return {
		};
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
					"childParams": {
						"labelWidth": "10em",
						"showLabel": true
					},
					"childStyle": {
					},
					"colWidths": [
						"1em",
						"25em",
						"25em"
					],
					"cols": 4,
					"region": "top",
					"splitter": false,
					"style": {
						"height": "3em",
						"padding": "4px 1em"
					},
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.form.TextBox",
							"_riaswIdOfModule": "q_idall",
							"label": "编号 / 电话 / 证件编号",
							"labelWidth": "10em",
							"name": "idall",
							"position": {
								"col": 1,
								"row": 0
							},
							"showLabel": true,
							"style": {
								"height": "2em",
								"width": "100%"
							},
							"tooltip": "编号 / 电话 / 证件编号 的模糊查询",
							"onKeyDown": function (evt){
			var m = this._riasrModule;
			if(evt.keyCode == rias.keys.ENTER){
			}
		},
							"onChange": function (newValue){
			var m = this._riasrModule;
		}
						},
						{
							"_riaswType": "rias.riasw.form.TextBox",
							"_riaswIdOfModule": "q_textall",
							"label": "户名 / 姓名 / 地址",
							"labelWidth": "10em",
							"name": "textall",
							"position": {
								"col": 2,
								"row": 0
							},
							"showLabel": true,
							"style": {
								"height": "2em",
								"width": "100%"
							},
							"tooltip": " 户名 / 姓名 / 地址 的模糊查询",
							"onKeyDown": function (evt){
			var m = this._riasrModule;
			if(evt.keyCode == rias.keys.ENTER){
			}
		},
							"onChange": function (newValue){
			var m = this._riasrModule;
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
							"style": {
							},
							"onClick": function (evt){
		var m = this._riasrModule;
	}
						},
						{
							"_riaswType": "rias.riasw.form.Button",
							"_riaswIdOfModule": "btnClear",
							"iconClass": "clearIcon",
							"label": "清除",
							"position": {
								"col": 3,
								"row": 0
							},
							"style": {
							},
							"onClick": function (evt){
		var m = this._riasrModule;
		m.q_idall.set("value", "");
		m.q_textall.set("value", "");
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
		}
	}
				}
			]
		}
	]
}
	
});
