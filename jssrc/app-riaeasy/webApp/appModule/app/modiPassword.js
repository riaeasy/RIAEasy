define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 82,
	"_riaswType": "rias.riasw.studio.Module",
	"activeWidget": "edtText1",
	"caption": "修改密码",
	"requires": [
		"rias/riasw/layout/TablePanel",
		"rias/riasw/form/ValidationTextBox",
		"rias/riasw/form/CheckButton"
	],
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
		var m = this;
		this.edtText1.silentSetValue("");
		this.edtText2.silentSetValue("");
	},
	"onShow": function (){
	},
	"onSubmit": function (){
		var m = this,
			data = m.inputs.get("value");
		if(data.text1 !== data.text2){
			info("两次输入的密码不一致，请重输。");
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
				m.canClose = false;
				rias.warn("提交处理失败", null, m);
			}else{
				m.canClose = true;
			}
		});*/
		return rias.message("未实现");
	},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.TablePanel",
			"_riaswIdOfModule": "inputs",
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
					"_riaswType": "rias.riasw.form.ValidationTextBox",
					"_riaswIdOfModule": "edtText1",
					"intermediateChanges": true,
					"label": "新密码",
					"name": "text1",
					"position": {
						"col": 1,
						"colSpan": 2,
						"row": 0
					},
					"required": true,
					"tooltip": "第一次输入新密码",
					"type": "password",
					"value": "password",
					"onKeyDown": function (evt){
		var m = this._riasrModule;
		if(evt.keyCode == rias.keys.ENTER){
			if(this.isValid()){
				m.edtText2.focus();
				m.edtText2.select();
			}
		}
	}
				},
				{
					"_riaswType": "rias.riasw.form.ValidationTextBox",
					"_riaswIdOfModule": "edtText2",
					"label": "再次输入",
					"name": "text2",
					"intermediateChanges": true,
					"position": {
						"col": 1,
						"colSpan": 2,
						"row": 1
					},
					"tooltip": "第二次输入新密码",
					"type": "password",
					"value": "value",
					"onKeyDown": function (evt){
		var m = this._riasrModule;
		if(evt.keyCode == rias.keys.ENTER){
			if(this.isValid()){
				m.btnOk.set("disabled", false);
				m.btnOk.focus();
			}else{
				m.btnOk.set("disabled", true);
			}
		}
	},
					"onChange": function (evt){
		var m = this._riasrModule;
				m.btnOk.set("disabled", !this.isValid());
	},
					"validator": function (){
		var m = this._riasrModule;
		return m.edtText2.get("value") && m.edtText1.get("value") === m.edtText2.get("value");
	}
				},
				{
					"_riaswType": "rias.riasw.form.CheckButton",
					"_riaswIdOfModule": "ckText",
					"checked": false,
					"label": "显示密码明文",
					"position": {
						"col": 1,
						"colSpan": 2,
						"row": 2
					},
					"style": {
						"margin-left": "4.5em",
						"width": "auto"
					},
					"tooltip": "显示密码明文",
					"onClick": function (){
		/// 设置 type ，IE8 有可能出错
		var m = this._riasrModule;
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
					"_riaswType": "rias.riasw.form.Button",
					"_riaswIdOfModule": "btnOk",
					"attachStyle": {
						"labelNode": {
							"height": "3em",
							"line-height": "3em",
							"width": "100%"
						}
					},
					"disabled": true,
					"label": "保存",
					"position": {
						"col": 1,
						"colSpan": 1,
						"row": 4
					},
					"style": {
						"border-width": "1px",
						"height": "3em"
					},
					"tooltip": "保存新密码...",
					"widgetCss": "highlightBtn",
					"onClick": function (evt){
		this._riasrModule.submit();
	}
				},
				{
					"_riaswType": "rias.riasw.form.Button",
					"_riaswIdOfModule": "btnCancel",
					"attachStyle": {
						"labelNode": {
							"height": "3em",
							"line-height": "3em",
							"width": "100%"
						}
					},
					"disabled": false,
					"label": "取消",
					"position": {
						"col": 2,
						"colSpan": 1,
						"row": 4
					},
					"style": {
						"border-width": "1px",
						"height": "3em"
					},
					"tooltip": "取消...",
					"widgetCss": "normalBtn",
					"onClick": function (evt){
		this._riasrModule.cancel();
	}
				}
			]
		}
	]
}
	
});
