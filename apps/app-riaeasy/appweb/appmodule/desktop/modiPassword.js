define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 97,
	"caption": "修改密码",
	"initFocusedChild": "module.edtText1",
	"style": {
		"color": "navy",
		"font-size": "1.1em",
		"height": "16em",
		"maring": "0.5em",
		"padding": "0.5em",
		"width": "20em"
	},
	"widgetCss": "operInfo",
	"actions": function (){
		return {
			//modi: "act/xoper/op221"
		};
	},
	"afterLoadedAll": function (loadOk){
		if(loadOk){
			this.edtText1.silentSetValue("");
			this.edtText2.silentSetValue("");
		}
	},
	"onShow": function (){
	},
	"onSubmit": function (){
		var m = this,
			data = m.get("value");
		if(data.text1 !== data.text2){
			rias.hint("两次输入的密码不一致，请重输。", m);
			return false;
		}
		data = data.text1;
		if(data){
			data = rias.encoding.SimpleAES.encrypt(data, "riaeasy");
		}
		/*return rias.xhr.put(m.actions().modi, {
			text: data
			}, function(result){
			if(!result.success || result.success < 1){
				rias.warn("提交处理失败", m);
			}
		});*/
		return rias.hint("未实现", m);
	},
	"_riaswElements": [
		{
			"_riaswType": "riasw.layout.ContentPanel",
			"_riaswIdInModule": "mTitle",
			"content": "请输入新的密码：",
			"region": "top",
			"style": {
				"padding": "4px"
			}
		},
		{
			"_riaswType": "riasw.layout.TablePanel",
			"_riaswIdInModule": "inputs",
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
			"splitter": false,
			"style": {
				"padding": "0px"
			},
			"_riaswElements": [
				{
					"_riaswType": "riasw.form.ValidationTextBox",
					"_riaswIdInModule": "edtText1",
					"intermediateChanges": true,
					"label": "新密码",
					"name": "text1",
					"rc": {
						"col": 2,
						"colSpan": 2,
						"row": 1
					},
					"required": true,
					"tooltip": "第一次输入新密码",
					"type": "password",
					"value": "password",
					"onKeyDown": function (evt){
		var m = this.getOwnerModule();
		if(evt.keyCode === rias.keys.ENTER){
			rias.stopEvent(evt);
			if(this.isValid()){
				m.edtText2.focus();
				m.edtText2.select();
			}
		}
	}
				},
				{
					"_riaswType": "riasw.form.ValidationTextBox",
					"_riaswIdInModule": "edtText2",
					"label": "再次输入",
					"name": "text2",
					"intermediateChanges": true,
					"rc": {
						"col": 2,
						"colSpan": 2,
						"row": 2
					},
					"tooltip": "第二次输入新密码",
					"type": "password",
					"value": "value",
					"onKeyDown": function (evt){
		var m = this.getOwnerModule();
		if(evt.keyCode === rias.keys.ENTER){
			if(this.isValid()){
				m.btnSubmit.set("disabled", false);
				m.btnSubmit.focus();
			}else{
				m.btnSubmit.set("disabled", true);
			}
			return true;
		}
	},
					"onChange": function (evt){
		var m = this.getOwnerModule();
				m.btnSubmit.set("disabled", !this.isValid());
	},
					"validator": function (){
		var m = this.getOwnerModule();
		return m.edtText2.get("value") && m.edtText1.get("value") === m.edtText2.get("value");
	}
				},
				{
					"_riaswType": "riasw.form.CheckButton",
					"_riaswIdInModule": "ckText",
					"checked": false,
					"label": "显示密码明文",
					"rc": {
						"col": 2,
						"colSpan": 2,
						"row": 3
					},
					"style": {
						"margin-left": "4.5em",
						"width": "auto"
					},
					"tooltip": "显示密码明文",
					"onClick": function (){
		/// 设置 type ，IE8 有可能出错
		var m = this.getOwnerModule();
		if(this.get("checked")){
			rias.dom.removeAttr(m.edtText1.textbox, "type");
			rias.dom.removeAttr(m.edtText2.textbox, "type");
		}else{
			rias.dom.setAttr(m.edtText1.textbox, "type", "password");
			rias.dom.setAttr(m.edtText2.textbox, "type", "password");
		}
	}
				},
				{
					"_riaswType": "riasw.form.Button",
					"_riaswIdInModule": "btnSubmit",
					"class": "riaswButtonOk",
					"disabled": true,
					"iconClass": "saveIcon",
					"label": {
						"$refObj": "rias.i18n.action.save"
					},
					"rc": {
						"col": 2,
						"colSpan": 1,
						"row": 5
					},
					"style": {
						"height": "2.5em",
						"line-height": "2.0em"
					},
					"tooltip": {
						"$refObj": "rias.i18n.action.save"
					},
					"onClick": function (evt){
		this.getOwnerModule().submit(evt);
	}
				},
				{
					"_riaswType": "riasw.form.Button",
					"_riaswIdInModule": "btnAbort",
					"class": "riaswButtonPrimary",
					"disabled": false,
					"iconClass": "abortIcon",
					"label": {
						"$refObj": "rias.i18n.action.abort"
					},
					"rc": {
						"col": 3,
						"colSpan": 1,
						"row": 5
					},
					"style": {
						"height": "2.5em",
						"line-height": "2.0em"
					},
					"tooltip": {
						"$refObj": "rias.i18n.action.abort"
					},
					"onClick": function (evt){
		this.getOwnerModule().abort();
	}
				}
			]
		}
	]
};
	
});
