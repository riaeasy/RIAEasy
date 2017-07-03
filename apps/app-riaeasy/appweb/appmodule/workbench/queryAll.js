define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 180,
	"_riaswVersion": "0.7",
	"caption": "综合查询",
	"actions": function (){
		return {
		};
	},
	"_riaswElements": [
		{
			"_riaswIdInModule": "main",
			"_riaswType": "riasw.layout.Panel",
			"region": "center",
			"design": "headline",
			"gutters": true,
			"style": {
				"padding": "0px"
			},
			"_riaswElements": [
				{
					"_riaswType": "riasw.sys.Toolbar",
					"_riaswIdInModule": "inputs",
					"cellStyle": {
						"border": "0px solid",
						"height": "2.5em"
					},
					"childParams": {
						"labelWidth": "10em",
						"showLabel": true
					},
					"childStyle": {
						"height": "2em",
						"line-height": "2em",
						"width": "100%"
					},
					"colWidths": [
						"25em",
						"25em"
					],
					"cols": 3,
					"region": "top",
					"splitter": false,
					"style": {
						"padding": "4px 1em"
					},
					"_riaswElements": [
						{
							"_riaswType": "riasw.form.TextBox",
							"_riaswIdInModule": "q_idall",
							"label": "编号 / 电话 / 证件编号",
							"labelWidth": "11em",
							"name": "idall",
							"rc": {
								"col": 1,
								"row": 1
							},
							"style": {
								"height": "2em",
								"line-height": "2em",
								"width": "25em"
							},
							"showLabel": true,
							"tooltip": "编号 / 电话 / 证件编号 的模糊查询",
							"onKeyDown": function (evt){
			//var m = this.ownerModule();
			if(evt.keyCode === rias.keys.ENTER){
			}
		},
							"onChange": function (newValue){
			//var m = this.ownerModule();
		}
						},
						{
							"_riaswType": "riasw.form.TextBox",
							"_riaswIdInModule": "q_textall",
							"label": "户名 / 姓名 / 地址",
							"labelWidth": "10em",
							"name": "textall",
							"rc": {
								"col": 2,
								"row": 1
							},
							"style": {
								"height": "2em",
								"line-height": "2em",
								"width": "25em"
							},
							"showLabel": true,
							"tooltip": " 户名 / 姓名 / 地址 的模糊查询",
							"onKeyDown": function (evt){
			//var m = this.ownerModule();
			if(evt.keyCode === rias.keys.ENTER){
			}
		},
							"onChange": function (newValue){
			//var m = this.ownerModule();
		}
						},
						{
							"_riaswType": "riasw.form.Button",
							"_riaswIdInModule": "btnSearch",
							"iconClass": "queryIcon",
							"label": "模糊查询",
							"rc": {
								"col": 3,
								"row": 1
							},
							"style": {
								"line-height": "normal",
								"width": "auto"
							},
							"onClick": function (evt){
		//var m = this.ownerModule();
	}
						},
						{
							"_riaswType": "riasw.form.Button",
							"_riaswIdInModule": "btnClear",
							"iconClass": "clearIcon",
							"label": "清除",
							"rc": {
								"col": 3,
								"row": 1
							},
							"style": {
								"line-height": "normal",
								"width": "auto"
							},
							"onClick": function (evt){
		var m = this.ownerModule();
		m.q_idall.set("value", "");
		m.q_textall.set("value", "");
	}
						}
					]
				},
				{
					"_riaswType": "riasw.layout.TabPanel",
					"_riaswIdInModule": "tabs",
					"region": "center",
					"style": {
						"padding": "0px"
					},
					"onShowChild": function (page){
		//var m = this.ownerModule();
		//m._currGrid = page || m.tabs.selectedChild;
		//if(m._currGrid){
		//}
	}
				}
			]
		}
	]
};
	
});
