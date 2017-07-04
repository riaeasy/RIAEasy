define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 34,
	"_riaswVersion": "0.7",
	"caption": "formEdit",
	"onChange": function (newValue, oldValue){
		var m = this,
			s = rias.toJson(m.get("value"), true);
		//s = s.replace("\n\r", "</br>").replace("\r", "</br>").replace("\n", "</br>").replace(" ", "&nbsp;");
		//s = s.replace("\n\r", "</br>").replace("\r", "</br>").replace("\n", "</br>").replace(" ", "&nbsp;");
		if(m.edtValue){
			m.edtValue.set("value", s);
		}
		return true;
	},
	"_riaswElements": [
		{
			"_riaswType": "riasw.layout.CaptionPanel",
			"_riaswIdInModule": "formValue",
			"caption": "The values:",
			"initDisplayState": "collapsed",
			"name": false,
			"region": "left",
			"splitter": true,
			"style": {
				"width": "20em"
			},
			"toggleable": true,
			"_riaswElements": [
				{
					"_riaswType": "riasw.sys.Toolbar",
					"_riaswIdInModule": "valueBtns",
					"region": "top",
					"_riaswElements": [
						{
							"_riaswType": "riasw.form.Button",
							"_riaswIdInModule": "btnRefreshValue",
							"iconClass": "refreshIcon",
							"label": {
								"$refObj": "rias.i18n.action.refresh"
							},
							"style": {
							},
							"onClick": function (){
		var m = this.getOwnerModule();
		m.edtValue.set("value", rias.toJson(m.get("value"), true));
	}
						}
					]
				},
				{
					"_riaswType": "riasw.form.TextArea",
					"_riaswIdInModule": "edtValue",
					"autoName": false,
					"region": "center"
				}
			]
		},
		{
			"_riaswType": "riasw.layout.Fieldset",
			"_riaswIdInModule": "edts",
			"caption": "TablePanel 展示",
			"region": "center",
			"style": {
			},
			"_riaswElements": [
				{
					"_riaswType": "riasw.sys.Toolbar",
					"_riaswIdInModule": "toolbar1",
					"_riaswElements": [
						{
							"_riaswType": "riasw.form.CheckButton",
							"_riaswIdInModule": "ckReadOnly",
							"checked": false,
							"label": "readOnly",
							"onClick": function (){
		var m = this.getOwnerModule(),
		ck = this.checked;
		rias.forEach(m.form.getChildren(), function(child){
			if(child.is("riasw.form._FormWidgetMixin")){
				child.set("readOnly", ck);
			}
		});
	}
						},
						{
							"_riaswType": "riasw.form.CheckButton",
							"_riaswIdInModule": "ckDisabled",
							"checked": false,
							"label": "disabled",
							"onClick": function (){
		var m = this.getOwnerModule(),
		ck = this.checked;
		rias.forEach(m.form.getChildren(), function(child){
			if(child.is("riasw.form._FormWidgetMixin")){
				child.set("disabled", ck);
			}
		});
	}
						},
						{
							"_riaswType": "riasw.form.CheckButton",
							"_riaswIdInModule": "ckEditable",
							"checked": true,
							"label": "editable",
							"onClick": function (){
		var m = this.getOwnerModule(),
		ck = this.checked;
		rias.forEach(m.form.getChildren(), function(child){
			if(child.is("riasw.form.TextBox")){
				child.set("editable", ck);
			}
		});
	}
						}
					]
				},
				{
					"_riaswType": "riasw.sys.Form",
					"_riaswIdInModule": "form",
					"_riaswElements": [
						{
							"_riaswType": "riasw.form.ColorPicker",
							"_riaswIdInModule": "colorPicker1",
							"disabled": false,
							"readOnly": false,
							"value": "blue"
						},
						{
							"_riaswType": "riasw.form.ColorPalette",
							"_riaswIdInModule": "colorPalette1",
							"cellHeight": 12,
							"cellWidth": 11,
							"label": "colorPalette1",
							"rc": {
								"col": 3,
								"colSpan": 1,
								"row": 2,
								"rowSpan": 1
							},
							"readOnly": false,
							"style": {
								"height": "auto",
								"width": "auto"
							},
							"tooltip": "值：",
							"value": "blue"
						}
					]
				}
			]
		}
	]
};
	
});
