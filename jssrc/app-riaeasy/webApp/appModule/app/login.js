define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 110,
	"_riaswType": "rias.riasw.studio.Module",
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
	"onSubmit": function (){
		var m = this,
			d = m.inputs.get("value"),
			r = false;
		function _after(result){
			rias.webApp.logged = result ? result.value.logged : false;
			rias.webApp.oper = result ? result.value.oper : undefined;
			m.set("_riasrModuleResult", rias.webApp.logged);
		}
		if(this.op === "login"){
			if(m.actions().login){
				r = rias.xhrPost({
						url: m.actions().login,
						handleAs: "json",
						timeout: rias.webApp.defaultTimeout
					}, d, function(result){
						if(!result.success || result.success < 1){
							_after(null);
							rias.warn("登录失败");
						}else{
							_after(result);
						}
					}, function(e){
						rias.warn("登录失败.\n" + e);
						_after(null);
					}
				);
			}
		}else if(this.op === "logout"){
			if(m.actions().logout){
				d._idDirty = m.query.code;
				r = rias.xhrPost({
						url: m.actions().logout,
						handleAs: "json",
						timeout: rias.webApp.defaultTimeout
					}, d, function(result){
						if(!result.success || result.success < 1){
							rias.warn("退出失败");
						}
						_after(null);
					}, function(e){
						rias.warn("退出失败.\n" + e);
						_after(null);
					}
				);
			}
		}else {
			_after(null);
		}
		return r;
	},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.ContentPanel",
			"_riaswIdOfModule": "mTitle",
			"content": "<font color='darkblue'><b>(当前没有开通用户，请直接点击【确定】登录。)</b></font>",
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
					"label": "用户id",
					"name": "code",
					"position": {
						"col": 0,
						"row": 0
					},
					"tooltip": "用户id",
					"value": "developer",
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
