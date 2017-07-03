//RIAStudio client runtime widget - NumberTextBox

define([
	"riasw/riaswBase",
	"riasw/form/RangeBoundTextBox",
	"riasw/form/NumberTextBoxMixin"
], function(rias, RangeBoundTextBox, NumberTextBoxMixin) {

	var riaswType = "riasw.form.NumberTextBox";
	var Widget = rias.declare(riaswType, [RangeBoundTextBox, NumberTextBoxMixin], {

		baseClass: "riaswTextBox riaswNumberTextBox"

	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "width",
		//allowedChild: "",
		"property": {
			"type": {
				"datatype": "string",
				"option": [
					{
						"value": "text"
					},
					{
						"value": "password"
					}
				],
				"defaultValue": "text",
				"title": "Type"
			},
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
				"title": "Required"
			},
			"constraints": {
				"datatype": "json",
				"defaultValue": "\"{\\\"locale\\\":\\\"\\\"}\"",
				"title": "Constraints",
				"hidden": true
			},
			"editOptions": {
				"datatype": "json",
				"defaultValue": "\"{\\\"pattern\\\":\\\"#.######\\\"}\"",
				"title": "Edit Options",
				"hidden": true
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