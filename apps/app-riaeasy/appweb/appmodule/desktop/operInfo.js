define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 182,
	"caption": "oper",
	"initFocusedChild": "module.btnSubmit",
	"style": {
		"color": "navy",
		"font-size": "1.1em",
		"height": "20em",
		"maring": "0.5em",
		"padding": "0.5em",
		"width": "20em"
	},
	"widgetCss": "operInfo",
	"actions": function (){
		return {
		};
	},
	"afterLoadedAll": function (loadOk){
		this.btnAutoShowLog.set("checked", !!rias.desktopBy(this).autoShowConsole);
		this.btnAutoShowMsg.set("checked", !!rias.desktopBy(this).autoShowMsg);
	},
	"onShow": function (){
		var m = this,
			desktop = rias.desktopBy(this);
		m.set("value", desktop.oper);
		m.btnModi.set("disabled", !desktop.oper || !desktop.oper.logged);
	},
	"_riaswElements": [
		{
			"_riaswType": "riasw.layout.ContentPanel",
			"_riaswIdInModule": "mTitle",
			"content": "当前登录信息：",
			"region": "top",
			"style": {
				"padding": "4px"
			}
		},
		{
			"_riaswType": "riasw.layout.TablePanel",
			"_riaswIdInModule": "infos",
			"cellStyle": {
				"border": "0px solid",
				"height": "2.5em"
			},
			"childParams": {
				"labelWidth": "5em",
				"showLabel": true
			},
			"childStyle": {
				"height": "2em",
				"line-height": "2em",
				"padding": "0px",
				"width": "100%"
			},
			"colWidths": [
				"5%",
				"35%",
				"55%",
				"5%"
			],
			"cols": 4,
			"region": "center",
			"splitter": false,
			"style": {
				"padding": "0px"
			},
			"_riaswElements": [
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edtId",
					"label": "登录名",
					"name": "code",
					"rc": {
						"col": 2,
						"colSpan": 2,
						"row": 1
					},
					"readOnly": true,
					"tooltip": "用户登录名"
				},
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edtPass",
					"label": "称谓",
					"name": "name",
					"rc": {
						"col": 2,
						"colSpan": 2,
						"row": 2
					},
					"readOnly": true,
					"tooltip": "称谓"
				},
				{
					"_riaswType": "riasw.form.DropDownButton",
					"_riaswIdInModule": "btnModi",
					"disabled": false,
					"iconClass": "loginIcon",
					"label": {
						"$refObj": "rias.i18n.desktop.modiPassword"
					},
					"rc": {
						"col": 2,
						"colSpan": 1,
						"row": 3
					},
					"style": {
						"border-width": "0px",
						"height": "2.5em",
						"width": "auto",
						"line-height": "2.2em"
					},
					"tooltip": {
						"$refObj": "rias.i18n.desktop.modiPassword"
					},
					"isLoaded": function (){
						return false;
					},
					"onLoadDropDown": function (){
						var desktop = rias.desktopBy(this);
						return (this.dropDown = {
							"moduleMeta": "appmodule/desktop/modiPassword",
							"caption": this.label + " - " + desktop.oper.code + "/" + desktop.oper.name,
							"resizable": false
						});
					}
				},
				{
					"_riaswType": "riasw.form.Button",
					"_riaswIdInModule": "btnClearPersist",
					"disabled": false,
					"iconClass": "clearIcon",
					"label": {
						"$refObj": "rias.i18n.desktop.clearPersist"
					},
					"rc": {
						"col": 3,
						"colSpan": 1,
						"row": 3
					},
					"style": {
						"border-width": "0px",
						"height": "2.5em",
						"line-height": "2.2em",
						"width": "auto"
					},
					"tooltip": {
						"$refObj": "rias.i18n.desktop.clearPersist"
					},
					"onClick": function (evt){
		var m = this.ownerModule();
		rias.confirm({
			content: rias.i18n.desktop.confirmClearPersist,
			caption: rias.i18n.action.confirm,
			onSubmit: function(){
				rias.desktopBy(this).clearPersist();
			}
		}, m, this);
	}
				},
				{
					"_riaswType": "riasw.form.CheckButton",
					"_riaswIdInModule": "btnAutoShowLog",
					"disabled": false,
					"iconClass": "consoleIcon",
					"label": {
						"$refObj": "rias.i18n.desktop.autoShowConsole"
					},
					"rc": {
						"col": 3,
						"colSpan": 1,
						"row": 4
					},
					"style": {
						"border-width": "0px",
						"height": "2.5em",
						"line-height": "2.2em",
						"width": "auto"
					},
					"tooltip": {
						"$refObj": "rias.i18n.desktop.autoShowConsole"
					},
					"onChange": function (value){
		var d = rias.desktopBy(this);
		d.autoShowConsole = !!value;
		d.setPersist("autoShowConsole", d.autoShowConsole);
	}
				},
				{
					"_riaswType": "riasw.form.CheckButton",
					"_riaswIdInModule": "btnAutoShowMsg",
					"disabled": false,
					"iconClass": "messageIcon",
					"label": {
						"$refObj": "rias.i18n.desktop.autoShowMsg"
					},
					"rc": {
						"col": 3,
						"colSpan": 1,
						"row": 5
					},
					"style": {
						"border-width": "0px",
						"height": "2.5em",
						"line-height": "2.2em",
						"width": "auto"
					},
					"tooltip": {
						"$refObj": "rias.i18n.desktop.autoShowMsg"
					},
					"onChange": function (value){
		var d = rias.desktopBy(this);
		d.autoShowMsg = !!value;
		d.setPersist("autoShowMsg", d.autoShowMsg);
	}
				},
				{
					"_riaswType": "riasw.form.Button",
					"_riaswIdInModule": "btnSubmit",
					"class": "riaswButtonOk",
					"disabled": false,
					"iconClass": "exitIcon",
					"label": {
						"$refObj": "rias.i18n.action.close"
					},
					"rc": {
						"col": 2,
						"colSpan": 2,
						"row": 7
					},
					"style": {
						"height": "2.5em",
						"line-height": "2.0em"
					},
					"tooltip": {
						"$refObj": "rias.i18n.action.close"
					},
					"onClick": function (evt){
		this.ownerModule().submit(evt);
	}
				}
			]
		}
	]
};
	
});
