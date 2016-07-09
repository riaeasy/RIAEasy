define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 115,
	"_riaswVersion": "0.7",
	"activeChild": "edtId",
	"caption": "登录",
	"op": "login",
	"style": {
		"padding": "0px",
		"width": "26em"
	},
	"actions": function (){
		return {
			"login": rias.webApp.dataServerAddr + "act/login",
			"logout": rias.webApp.dataServerAddr + "act/logout"
		};
	},
	"onShow": function (){
		var m = this,
			oper = rias.webApp.oper.code;
		if(!oper){
			oper = rias.cookie("operCode") || "developer";
		}
		m.edtId.set("value", oper);
		m.edtId.select();
	},
	"onSubmit": function (){
		var m = this;
		return rias.when(rias.webApp.login(m.inputs.get("value")), function(){
			m.set("_riasrModuleResult", rias.webApp.oper.logged);
			if(!rias.webApp.oper.logged){
				rias.warn({
					dialogType: "modal",
					around: m.btnOk,
					content: "未能登录，请重新登录."
				});
			}
			return !!rias.webApp.oper.logged;
		});
	},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.ContentPanel",
			"_riaswIdOfModule": "mTitle",
			"content": "<font color='darkblue'><b>请输入登录名和密码：(目前没有密码)</b></font>",
			"style": {
				"padding": "4px"
			}
		},
		{
			"_riaswType": "rias.riasw.layout.TablePanel",
			"_riaswIdOfModule": "inputs",
			"cellStyle": {
				"border": "0px solid",
				"height": "2.5em"
			},
			"childLabelWidth": "6em",
			"childShowLabel": true,
			"childStyle": {
				"height": "2em",
				"padding": "0px",
				"width": "100%"
			},
			"cols": 1,
			"splitter": false,
			"style": {
				"padding": "0.5em 3em 0.5em 1em"
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edtId",
					"label": "登录名",
					"name": "code",
					"position": {
						"col": 0,
						"row": 0
					},
					"tooltip": "用户id",
					"onKeyDown": function (evt){
		var m = this._riasrModule;
		if(evt.keyCode == rias.keys.ENTER){
			m.edtPass.focus();
			m.edtPass.select();
		}
	}
				},
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edtPass",
					"label": "密码",
					"name": "password",
					"position": {
						"col": 0,
						"row": 1
					},
					"tooltip": "密码",
					"type": "password",
					"onKeyDown": function (evt){
		var m = this._riasrModule;
		if(evt.keyCode == rias.keys.ENTER){
			m.btnOk.focus();
		}
	}
				}
			]
		},
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "btns",
			"class": "riaswDialogPanelActionBar",
			"style": {
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.form.Button",
					"_riaswIdOfModule": "btnOk",
					"disabled": false,
					"iconClass": "okIcon",
					"label": "确定",
					"tooltip": "提交登录信息...",
					"onClick": function (evt){
		this._riasrModule.submit();
	}
				},
				{
					"_riaswType": "rias.riasw.form.Button",
					"_riaswIdOfModule": "btnCancel",
					"disabled": false,
					"iconClass": "cancelIcon",
					"label": "取消",
					"tooltip": "取消登录操作...",
					"onClick": function (evt){
		this._riasrModule.cancel();
	}
				}
			]
		}
	]
}
	
});
