define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 57,
	"activeWidget": "btnOk",
	"caption": "oper",
	"style": {
		"color": "navy",
		"font-size": "14px",
		"height": "15em",
		"maring": "0.5em",
		"padding": "0.5em",
		"width": "20em"
	},
	"widgetCss": "operInfo",
	"actions": function (){
		return {
		};
	},
	"afterLoaded": function (){
	},
	"onShow": function (){
		var m = this;
		m.infos.set("value", rias.webApp.oper);
		m.btnModi.set("disabled", !rias.webApp.oper || !rias.webApp.oper.logged);
	},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.TablePanel",
			"_riaswIdOfModule": "infos",
			"cellStyle": {
				"border": "0px solid",
				"height": "2.5em"
			},
			"childParams": {
				"labelWidth": "4em",
				"showLabel": true
			},
			"childStyle": {
				"height": "2em",
				"padding": "0px",
				"width": "100%"
			},
			"colWidths": [
				"5%",
				"45%",
				"45%",
				"5%"
			],
			"cols": 4,
			"region": "center",
			"splitter": false,
			"style": {
				"padding": "0px"
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edtId",
					"label": "登录名",
					"name": "code",
					"position": {
						"col": 1,
						"colSpan": 2,
						"row": 0
					},
					"readOnly": true,
					"tooltip": "用户登录名"
				},
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edtPass",
					"label": "称谓",
					"name": "name",
					"position": {
						"col": 1,
						"colSpan": 2,
						"row": 1
					},
					"readOnly": true,
					"tooltip": "称谓"
				},
				{
					"_riaswType": "rias.riasw.form.DropDownButton",
					"_riaswIdOfModule": "btnModi",
					"attachStyle": {
						"labelNode": {
							"height": "2em",
							"line-height": "2em",
							"width": "100%"
						}
					},
					"disabled": false,
					"dropDown": {
						"actionBar": [
						],
						"dialogType": "modal",
						"maxable": false,
						"moduleMeta": "appModule/app/modiPassword",
						"resizable": false
					},
					"label": {
						"$refObj": "rias.i18n.webApp.modiPassword"
					},
					"position": {
						"col": 2,
						"colSpan": 1,
						"row": 2
					},
					"style": {
						"border-width": "0px",
						"height": "2em"
					},
					"tooltip": {
						"$refObj": "rias.i18n.webApp.modiPassword"
					},
					"beforeDropDown": function (args){
		args.caption = this.label + " - " + rias.webApp.oper.code + "/" + rias.webApp.oper.name;
	}
				},
				{
					"_riaswType": "rias.riasw.form.Button",
					"_riaswIdOfModule": "btnOk",
					"attachStyle": {
						"labelNode": {
							"height": "3em",
							"line-height": "3em",
							"width": "100%"
						}
					},
					"disabled": false,
					"label": {
						"$refObj": "rias.i18n.action.ok"
					},
					"position": {
						"col": 1,
						"colSpan": 2,
						"row": 4
					},
					"style": {
						"height": "3em"
					},
					"tooltip": {
						"$refObj": "rias.i18n.action.ok"
					},
					"widgetCss": "highlightBtn",
					"onClick": function (evt){
		this._riasrModule.submit();
	}
				}
			]
		}
	]
}
	
});
