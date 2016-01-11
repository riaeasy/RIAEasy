define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 99,
	"_riaswVersion": "0.7",
	"actions": {
		"login": "act/login",
		"logout": "act/logout"
	},
	"activeNode": "edtId",
	"caption": "登录",
	"op": "login",
	"style": {
		"height": "13em",
		"padding": "0px",
		"width": "26em"
	},
	"callLogin": function (logged, oper){
	},
	"onSubmit": function (){
		var m = this,
			d = m.inputs.get("value"),
			r = false;
		function _login(result){
			rias.webApp.logged = result ? result.value.logged : false;
			rias.webApp.oper = result ? result.value.oper : undefined;
			m.callLogin(rias.webApp.logged, rias.webApp.oper);
		}
		if(this.op === "login"){
			if(m.actions.login){
				r = rias.xhrPost({
						url: m.actions.login,
						handleAs: "json",
						timeout: rias.webApp.defaultTimeout
					}, d, function(result){
						if(!result.success || result.success < 1){
							_login(null);
							rias.warn("登录失败");
							return false;
						}else{
							_login(result);
						}
					}
				);
			}
		}else if(this.op === "logout"){
			if(m.actions.logout){
				d._idDirty = m.query.code;
				r = rias.xhrPost({
						url: m.actions.logout,
						handleAs: "json",
						timeout: rias.webApp.defaultTimeout
					}, d, function(result){
						if(!result.success || result.success < 1){
							_login(null);
							rias.warn("退出失败");
							return false;
						}else{
							if(result){
								_login(result);
							}
						}
					}
				);
			}
		}else {
			_login(null);
		}
		return r;
	},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.ContentPanel",
			"_riaswIdOfModule": "mTitle",
			"content": "<font color='darkblue'><b>(当前没有开通用户，请直接点击【确定】登录。)</b></font>",
			"region": "top",
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
				"border": "0px solid silver",
				"height": "2em",
				"padding": "0px",
				"width": "100%"
			},
			"cols": 1,
			"region": "center",
			"splitter": false,
			"style": {
				"border": "0px solid silver",
				"padding": "0.5em 3em 0.5em 1em"
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edtId",
					"label": "用户id",
					"name": "code",
					"position": {
						"col": 0,
						"row": 0
					},
					"tooltip": "用户id",
					"value": {
						"$refObj": "oper.operCode"
					},
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
					"name": "pass",
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
			"region": "bottom",
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
					"label": "取消",
					"tooltip": "取消登录操作...",
					"iconClass": "cancelIcon",
					"disabled": false,
					"onClick": function (evt){
							this._riasrModule.cancel();
						}
				}
			]
		}
	]
}
	
});
