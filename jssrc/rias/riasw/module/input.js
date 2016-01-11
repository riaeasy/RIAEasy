define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 10,
	"_riaswVersion": "0.7",
	"activeNode": "edt_val",
	"value": "",
	"style": {
		"border": "0px silver solid",
		"height": "11em",
		"padding": "0px",
		"width": "25em"
	},
	"afterFiler": function (result){
			//var m = this;
			//m.edt_val.set("value", m.value);
			this.lbOldValue.set("content", "<font color='darkblue'><b>原来的值: " + this._oldValue + "</b></font>");
		},
	"_setValueAttr": function (value){
			if(!this._oldValue){
				this._oldValue = value ? value : "(无)";
				if(this.lbOldValue){
					this.lbOldValue.set("content", "<font color='darkblue'><b>原来的值: " + this._oldValue + "</b></font>");
				}
			}
			if(this.edt_val){
				this.edt_val.set("value", value);
			}else{
				this._set("value", value);
			}
		},
	"_getValueAttr": function (){
			if(this.edt_val){
				return this.edt_val.get("value");
			}else{
				return this._get("value");
			}
		},
	"onSubmit": function (){
			this.set("value", this.get("value"));
			return this.isValid();
		},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.ContentPanel",
			"_riaswIdOfModule": "lbOldValue",
			"region": "top",
			"style": {
				"padding": "4px"
			}
		},
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "_editWidgets",
			"region": "center",
			"style": {
				"padding": "1em"
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.form.TextBox",
					"_riaswIdOfModule": "edt_val",
					"region": "top",
					"name": "val",
					"label": "请输入：",
					"labelWidth": "4em",
					"showLabel": true,
					"style": {
						"height": "2em",
						"padding": "0"
					},
					"onKeyDown": function (evt){
						var m = this._riasrModule;
						if(evt.keyCode == rias.keys.ENTER){
							m.btnOk.focus();
						}
					},
					"onChange": function (newValue){
						var m = this._riasrModule;
						m.btnOk.focus();
					}
				}
			]
		},
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "btns",
			"region": "bottom",
			"class": "riaswDialogPanelActionBar",
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.form.Button",
					"_riaswIdOfModule": "btnOk",
					"label": "确定",
					"tooltip": "提交输入信息...",
					"iconClass": "okIcon",
					"disabled": false,
					"onClick": function (evt){
						this._riasrModule.submit();
					}
				},
				{
					"_riaswType": "rias.riasw.form.Button",
					"_riaswIdOfModule": "btnCancel",
					"label": "取消",
					"tooltip": "取消输入操作...",
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
