//RIAStudio client runtime widget - DateTextBox

define([
	"rias",
	//"dijit/form/DateTextBox",
	"rias/riasw/form/_DateTimeTextBox",///extend(templateString)
	"rias/riasw/widget/Calendar"
], function(rias, _Widget, Calendar) {

	var riasType = "rias.riasw.form.DateTextBox";
	var Widget = rias.declare(riasType, [_Widget], {

		constraints: {
			datePattern: "yyyy-MM-dd",
			locale: "",
			selector: "date",
			fullYear: true
		},

		baseClass: "dijitTextBox dijitComboBox dijitDateTextBox",
		popupClass: Calendar,
		_selector: "date",

		// Prevent scrollbar on Calendar dropdown.  On iPad it often gets a scrollbar unnecessarily because Viewport
		// thinks the keyboard is showing.  Even if the keyboard is showing, it disappears when the calendar gets focus.
		maxHeight: Infinity,

		// value: Date
		//		The value of this widget as a JavaScript Date object, with only year/month/day specified.
		//		If specified in markup, use the format specified in `stamp.fromISOString`.
		//		set("value", ...) accepts either a Date object or a string.
		value: new Date("")	// value.toString()="NaN"

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswDateTextBoxIcon",
		iconClass16: "riaswDateTextBoxIcon16",
		defaultParams: {
			//content: "<input type='text'></input>",
			tabIndex: 0,
			invalidMessage: rias.i18n.message.invalid,
			rangeMessage: rias.i18n.message.range,
			constraints: {
				datePattern: "yyyy-MM-dd",
				locale: "",
				selector: "date",
				fullYear: true
			},
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
			"value": {
				"datatype": "string",
				"format": "date",
				"title": "Value",
				"description": "Enter date in format yyyy-mm-dd"
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
				"title": "Max Length",
				"hidden": true
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
				"defaultValue": "\"{\\\"locale\\\":\\\"\\\",\\\"selector\\\":\\\"date\\\",\\\"fullYear\\\":true}\"",
				"title": "Constraints",
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
				"hidden": true
			},
			"datePackage": {
				"datatype": "string",
				"description": "JavaScript namespace to find calendar routines.  Uses Gregorian calendar routines at dojo.date, by default.",
				"hidden": true
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