//RIAStudio client runtime widget - DateTextBox

define([
	"riasw/riaswBase",
	"riasw/form/_DateTimeTextBox",
	"riasw/widget/Calendar"
], function(rias, _DateTimeTextBox, Calendar) {

	var riaswType = "riasw.form.DateTextBox";
	var Widget = rias.declare(riaswType, [_DateTimeTextBox], {

		constraints: {
			datePattern: "yyyy/MM/dd",
			locale: "",
			selector: "date",
			fullYear: true
		},

		baseClass: "riaswTextBox riaswComboBox riaswDateTextBox",

		popupClass: Calendar,
		// flag to _HasDropDown to make drop down Calendar width == <input> width
		autoWidth: false,
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
				"description": "Enter date in format yyyy/mm/dd"
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
			"constraints": {
				"datatype": "json",
				"defaultValue": "\"{\\\"locale\\\":\\\"\\\",\\\"selector\\\":\\\"date\\\",\\\"fullYear\\\":true}\"",
				"title": "Constraints",
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
			"state": {
				"datatype": "string",
				"description": "Shows current state (ie, validation result) of input (Normal, Warning, or Error)",
				"hidden": true
			}
		}
	};

	return Widget;

});