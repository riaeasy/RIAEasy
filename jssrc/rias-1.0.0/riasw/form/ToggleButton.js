//RIAStudio client runtime widget - ToggleButton

define([
	"rias",
	"rias/riasw/form/Button",
	"dijit/form/_ToggleButtonMixin"
], function(rias, Button, _ToggleButtonMixin) {

	//rias.theme.loadRiasCss([
	//	"form/Button.css"
	//]);

	var riasType = "rias.riasw.form.ToggleButton";
	var Widget = rias.declare(riasType, [Button, _ToggleButtonMixin], {

		baseClass: "dijitToggleButton dijitButtonNode",

		cssStateNodes: {
			//"buttonNode": "dijitButtonNode",
			"titleNode": "dijitButtonContents"
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswToggleButtonIcon",
		iconClass16: "riaswToggleButtonIcon16",
		defaultParams: {
			//content: "<input type='button'></input>",
			label: "ToggleButton",
			iconClass: "dijitCheckBoxIcon",
			tabIndex: 0,
			showLabel: true,
			scrollOnFocus: true
		},
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
			"tabIndex": {
				"datatype": "string",
				"defaultValue": "0",
				"title": "Tab Index"
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
			"iconClass": {
				"datatype": "string",
				"defaultValue": "dijitCheckBoxIcon",
				"title": "Icon Class"
			},
			"checked": {
				"datatype": "boolean",
				"title": "Checked"
			},
			"scrollOnFocus": {
				"datatype": "boolean",
				"description": "On focus, should this widget scroll into view?",
				"hidden": false,
				"defaultValue": true
			}
		}
	};

	return Widget;

});