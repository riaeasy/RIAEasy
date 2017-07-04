define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 289,
	"_riaswType": "riasw.sys.Module",
	"actionType": "login",
	"caption": {
		"$refObj": "rias.i18n.desktop.login"
	},
	"checkModifiedWhenHide": false,
	"operExpires": 7,
	"requires": [
		"riasw/layout/TablePanel",
		"riasw/layout/ContentPanel",
		"riasw/form/Button",
		"riasw/form/TextBox",
		"riasw/form/CheckButton"
	],
	"style": {
		"color": "navy",
		"font-size": "1.1em",
		"height": "18em",
		"maring": "0.25em",
		"padding": "0.25em",
		"width": "22em"
	},
	"themeCss": [
		"desktop/login.css"
	],
	"widgetCss": "desktopLogin",
	"actions": function (){
		return {
			"login": rias.desktop.dataServerAddr + "act/login",
			"logout": rias.desktop.dataServerAddr + "act/logout"
		};
	},
	"onRestore": function (){
		var m = this,
			oper = rias.cookie("operCode");
		m.ckSaveCode.set("checked", !!oper);
		m.edtId.silentSetValue(oper);
		m.set("modified", false);
		if(m.edtId.get("value")){
			m.edtPass.focus();
			m.edtPass.select();
		}else{
			m.edtId.focus();
			m.edtId.select();
		}
	},
	"onHide": function (){
		if(!rias.formResult.isSubmit(this.formResult)){
			this.edtPass.set("value", "");
		}
	},
	"onSubmit": function (){
		var m = this,
			data = m.get("value");
		m.edtPass.set("value", "");
		if(m.ckSaveCode.get("checked")){
			rias.cookie("operCode", data.code, {
				path: "/" + rias.desktop.appName + "/",
				expires: m.operExpires
			});
		}else{
			rias.cookie("operCode", null, {
				path: "/" + rias.desktop.appName + "/",
				expires: -1
			});
		}
		return rias.desktop.login({
			data: data
		}).always(function(){
			if(!rias.desktop.oper.logged){
				rias.hint("未能登录，请重新登录.", m, m.btnLogin);
			}
			return !!rias.desktop.oper.logged;
		});
	},
	"_riaswElements": [
		{
			"_riaswType": "riasw.layout.ContentPanel",
			"_riaswIdInModule": "mTitle",
			"content": "<font color='darkblue'><b>请输入登录名和密码（可以用 developer 登录，无密码）：</b></font>",
			"region": "top",
			"style": {
				"padding": "4px"
			}
		},
		{
			"_riaswType": "riasw.layout.TablePanel",
			"_riaswIdInModule": "inputs",
			"cellStyle": {
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
				"45%",
				"45%",
				"5%"
			],
			"cols": 4,
			"region": "center",
			"rowHeights": [
				"2.5em",
				"2.5em",
				"2.5em",
				"2em"
			],
			"splitter": false,
			"style": {
				"padding": "1em 1em 0.5em 1em"
			},
			"_riaswElements": [
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edtId",
					"label": "登录名",
					"name": "code",
					"rc": {
						"col": 2,
						"row": 1,
						"colSpan": 2
					},
					"tooltip": "用户登录名",
					"onKeyDown": function (evt){
		var m = this.getOwnerModule();
		if(evt.keyCode === rias.keys.ENTER){
			rias.stopEvent(evt);
			m.edtPass.focus();
			m.edtPass.select();
		}
	}
				},
				{
					"_riaswType": "riasw.form.CheckButton",
					"_riaswIdInModule": "ckSaveCode",
					"checked": true,
					"label": "保存登录名",
					"name": "saveCode",
					"rc": {
						"col": 2,
						"colSpan": 2,
						"row": 2
					},
					"style": {
						"line-height": "normal",
						"margin-left": "5.5em",
						"width": "auto"
					},
					"tooltip": "保存用户登录名"
				},
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edtPass",
					"label": "密码",
					"name": "password",
					"rc": {
						"col": 2,
						"colSpan": 2,
						"row": 3
					},
					"tooltip": "密码",
					"type": "password",
					"onKeyDown": function (evt){
		var m = this.getOwnerModule();
		if(evt.keyCode === rias.keys.ENTER){
			rias.stopEvent(evt);
			m.btnLogin.focus();
		}
	}
				},
				{
					"_riaswType": "riasw.form.Button",
					"_riaswIdInModule": "btnLogin",
					"class": "riaswButtonOk",
					"disabled": false,
					"label": "登  录",
					"rc": {
						"col": 2,
						"colSpan": 2,
						"row": 5
					},
					"style": {
						"height": "2.5em",
						"line-height": "2.0em"
					},
					"tooltip": "提交登录信息...",
					"onClick": function (evt){
		this.getOwnerModule().submit(evt);
	}
				}
			]
		}
	]
};
	
});
