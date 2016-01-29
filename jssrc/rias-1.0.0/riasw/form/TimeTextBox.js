//RIAStudio client runtime widget - TimeTextBox

define([
	"rias",
	"dijit/form/TimeTextBox",
	"rias/riasw/form/_DateTimeTextBox"///extend(templateString)
], function(rias, _Widget) {

	var riasType = "rias.riasw.form.TimeTextBox";
	var Widget = rias.declare(riasType, [_Widget], {
		constraints: {
			datePattern: "HH:mm:ss",
			locale: "",
			selector: "time",
			fullYear: true
		}
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTimeTextBoxIcon",
		iconClass16: "riaswTimeTextBoxIcon16",
		defaultParams: {
			//content: "<input type='text'></input>",
			tabIndex: 0,
			invalidMessage: rias.i18n.message.invalid,
			constraints: {
				datePattern: "HH:mm:ss",
				locale: "",
				selector: "time",
				fullYear: true
			},
			tooltipPosition: [],
			scrollOnFocus: true
		},
		initialSize: {},
		resizable: "width",
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
				"format": "time",
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
				"title": "Intermediate Changes"
			},
			"trim": {
				"datatype": "boolean",
				"hidden": true
			},
			"uppercase": {
				"datatype": "boolean",
				"hidden": true
			},
			"lowercase": {
				"datatype": "boolean",
				"hidden": true
			},
			"propercase": {
				"datatype": "boolean",
				"hidden": true
			},
			"maxLength": {
				"datatype": "string",
				"title": "Max Length"
			},
			"required": {
				"datatype": "boolean",
				"title": "Required",
				"hidden": true
			},
			"promptMessage": {
				"datatype": "string",
				"title": "Prompt Message",
				"hidden": true
			},
			"invalidMessage": {
				"datatype": "string",
				"defaultValue": "The value entered is not valid.",
				"title": "Invalid Message",
				"hidden": true
			},
			"constraints": {
				"datatype": "json",
				"defaultValue": "\"{\\\"locale\\\":\\\"\\\",\\\"selector\\\":\\\"time\\\",\\\"fullYear\\\":true}\"",
				"title": "Constraints",
				"hidden": true
			},
			"tooltipPosition": {
				"datatype": "array",
				"defaultValue": "[]",
				"title": "Tooltip Positions",
				"hidden": true
			},
			"rangeMessage": {
				"datatype": "string",
				"defaultValue": "This value is out of range.",
				"title": "Range Message",
				"hidden": true
			},
			"popupClass": {
				"datatype": "string",
				"hidden": false
			},
			"datePackage": {
				"datatype": "string",
				"description": "JavaScript namespace to find calendar routines.  Uses Gregorian calendar routines\nat dojo.date, by default.",
				"hidden": false
			},
			"scrollOnFocus": {
				"datatype": "boolean",
				"description": "On focus, should this widget scroll into view?",
				"hidden": false,
				"defaultValue": true
			},
			"state": {
				"datatype": "string",
				"description": "Shows current state (ie, validation result) of input (Normal, Warning, or Error)",
				"hidden": true
			}
		}
	};

	return Widget;

});