//RIAStudio client runtime widget - ToggleButton

define([
	"riasw/riaswBase",
	"riasw/form/Button",
	"riasw/form/_ToggleButtonMixin"
], function(rias, Button, _ToggleButtonMixin) {

	//rias.theme.loadThemeCss([
	//	"riasw/form/Button.css"
	//]);

	var riaswType = "riasw.form.ToggleButton";
	var Widget = rias.declare(riaswType, [Button, _ToggleButtonMixin], {

		baseClass: "riaswButton riaswToggleButton",

		checked: false,
		showCheckNode: false

	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "none",
		allowedChild: "",
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
				"title": "Value"
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled"
			},
			"readOnly": {
				"datatype": "boolean",
				"hidden": true
			},
			"intermediateChanges": {
				"datatype": "boolean",
				"hidden": true
			},
			"label": {
				"datatype": "string",
				"title": "Label"
			},
			"showLabel": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Show Label"
			},
			"checked": {
				"datatype": "boolean",
				"title": "Checked"
			}
		}
	};

	return Widget;

});