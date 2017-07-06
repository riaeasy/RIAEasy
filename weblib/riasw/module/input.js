define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 45,
	"_riaswVersion": "0.7",
	"iconClass": "inputIcon",
	"infos": "",
	"initFocusedChild": "module.edt_val",
	"style": {
		"font-size": "1.1em",
		"padding": "0px",
		"width": "25em"
	},
	"value": "",
	"onRestore": function (){
			this._oldValue = this.get("submitValue");
			this.edt_val.silentSetValue(this._oldValue);
			this.lbInfos.set("label", this.infos);
			this.lbOldValue.set("label", "原来的值: <span style='color:darkblue;font-weight:bold'>" + (this._oldValue ? this._oldValue : "(无)") + "</span>");
			this.set("modified", false);
		},
	"_riaswElements": [
		{
			"_riaswType": "riasw.sys.Label",
			"_riaswIdInModule": "lbInfos",
			"layoutPriority": 0,
			"style": {
				"padding": "0.25em"
			}
		},
		{
			"_riaswType": "riasw.sys.ToolbarLineBreak",
			"_riaswIdInModule": "toolbarLineBreak1"
		},
		{
			"_riaswType": "riasw.sys.Label",
			"_riaswIdInModule": "lbOldValue",
			"layoutPriority": 1,
			"style": {
				"padding": "0.25em"
			}
		},
		{
			"_riaswType": "riasw.layout.Panel",
			"_riaswIdInModule": "_editWidgets",
			"layoutPriority": 2,
			"style": {
				"height": "3em",
				"padding": "1em"
			},
			"_riaswElements": [
				{
					"_riaswType": "riasw.form.TextBox",
					"_riaswIdInModule": "edt_val",
					"label": "请输入：",
					"labelWidth": "4em",
					"name": "value",
					"showLabel": true,
					"style": {
						"height": "2em",
						"width": "100%",
						"padding": "0 2em 0 1em"
					},
					"onFocus": function (){
						this.select();
					},
					"onKeyDown": function (evt){
						var m = this.getOwnerModule();
						if(evt.keyCode === rias.keys.ENTER){
							if(m.btnSubmit){
								m.btnSubmit.focus();
							}else if(m.btnAbort){
								m.btnAbort.focus();
							}
						}
					},
					"onChange": function (newValue){
						var m = this.getOwnerModule();
						if(!m.contentLoaded){
							return;
						}
						m.set("submitValue", this.get("value"));
						if(m.btnSubmit){
							m.btnSubmit.focus();
						}else if(m.btnAbort){
							m.btnAbort.focus();
						}
					}
				}
			]
		}
	]
};
	
});
