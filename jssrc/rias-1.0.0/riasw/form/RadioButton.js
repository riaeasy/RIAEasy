//RIAStudio client runtime widget - CheckButton

define([
	"rias",
	"rias/riasw/form/CheckButton",
	"dijit/form/_RadioButtonMixin"
], function(rias, CheckButton, _RadioButtonMixin) {

	rias.theme.loadRiasCss([
		"form/Button.css"
	]);

	var riasType = "rias.riasw.form.RadioButton";
	var Widget = rias.declare(riasType, [CheckButton, _RadioButtonMixin], {
		baseClass: "riaswRadioButton"
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswRadioButtonIcon",
		iconClass16: "riaswRadioButtonIcon16",
		defaultParams: {
			//content: "<input type='radio' showLabel='true'></input>",
			//value: "on",
			tabIndex: 0,
			scrollOnFocus: true
		},
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