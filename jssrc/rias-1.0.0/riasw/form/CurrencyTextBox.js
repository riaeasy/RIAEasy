//RIAStudio client runtime widget - CurrencyTextBox

define([
	"rias",
	"dijit/form/CurrencyTextBox",
	"rias/riasw/form/NumberTextBox"///extend(templateString)
], function(rias, _Widget) {

	var riasType = "rias.riasw.form.CurrencyTextBox";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswCurrencyTextBoxIcon",
		iconClass16: "riaswCurrencyTextBoxIcon16",
		defaultParams: {
			//content: "<input type='text'></input>",
			type: "text",
			tabIndex: 0,
			invalidMessage: rias.i18n.message.invalid,
			rangeMessage: rias.i18n.message.range,
			constraints: {currency: "", locale: "", type: "currency"},
			editOptions: {pattern: "#.######"},
			scrollOnFocus: true
		},
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
				"hidden": false
			},
			"promptMessage": {
				"datatype": "string",
				"title": "Prompt Message",
				"hidden": false
			},
			"invalidMessage": {
				"datatype": "string",
				"defaultValue": "The value entered is not valid.",
				"title": "Invalid Message",
				"hidden": false
			},
			"constraints": {
				"datatype": "json",
				"defaultValue": "\"{\\\"currency\\\":\\\"\\\",\\\"locale\\\":\\\"\\\",\\\"type\\\":\\\"currency\\\"}\"",
				"title": "Constraints",
				"hidden": true
			},
			"rangeMessage": {
				"datatype": "string",
				"defaultValue": "This value is out of range.",
				"title": "Range Message",
				"hidden": false
			},
			"editOptions": {
				"datatype": "json",
				"defaultValue": "\"{\\\"pattern\\\":\\\"#.######\\\"}\"",
				"title": "Edit Options",
				"hidden": true
			},
			"currency": {
				"datatype": "string",
				"title": "Currency",
				"defaultValue": "USD"
			},
			"regExp": {
				"datatype": "string",
				"description": "regular expression string used to validate the input\nDo not specify both regExp and regExpGen",
				"hidden": true
			},
			"state": {
				"datatype": "string",
				"description": "Shows current state (ie, validation result) of input (Normal, Warning, or Error)",
				"hidden": true
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