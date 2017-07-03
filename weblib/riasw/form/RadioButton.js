//RIAStudio client runtime widget - CheckButton

define([
	"riasw/riaswBase",
	"riasw/form/CheckButton",
	"riasw/form/_RadioButtonMixin"
], function(rias, CheckButton, _RadioButtonMixin) {

	//rias.theme.loadThemeCss([
	//	"riasw/form/Button.css"
	//]);

	var riaswType = "riasw.form.RadioButton";
	var Widget = rias.declare(riaswType, [CheckButton, _RadioButtonMixin], {

		baseClass: "riaswButton riaswRadioButton",
		checkNodeClass: "riaswRadioBox"

	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "none",
		//allowedChild: "",
		"property": {
			"name": {
				"datatype": "string",
				"title": "Name"
			},
			"alt": {
				"datatype": "string",
				"hidden": true
			},
			"value": {
				"datatype": "string",
				"defaultValue": "on",
				"title": "Value"
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled"
			},
			"readOnly": {
				"datatype": "boolean",
				"title": "Read Only"
			},
			"intermediateChanges": {
				"datatype": "boolean",
				"hidden": true
			},
			"label": {
				"datatype": "string",
				"hidden": true
			},
			"iconClass": {
				"datatype": "string",
				"hidden": true
			},
			"checked": {
				"datatype": "boolean",
				"title": "Checked"
			}
		}
	};

	return Widget;

});