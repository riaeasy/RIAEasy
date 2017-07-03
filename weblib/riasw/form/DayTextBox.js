//RIAStudio client runtime widget - DateTextBox

define([
	"riasw/riaswBase",
	"riasw/form/DateTextBox",
	"riasw/form/TextBox",
	"dojox/widget/DailyCalendar"
], function(rias, DateTextBox, TextBox, DailyCalendar) {

	var riaswType = "riasw.form.DayTextBox";
	var Widget = rias.declare(riaswType, [DateTextBox], {

		popupClass: DailyCalendar,
		constraints: {
			datePattern: "yyyy/MM/dd",
			locale: "",
			selector: "date",
			fullYear: true
		},

		parse: function(displayVal){
			return displayVal;
		},

		format: function(value){
			return value.getDate ? value.getDate() : value;
		},
		validator: function(value){
			var num = Number(value);
			var isInt = /(^-?\d\d*$)/.test(String(value));
			return value == "" || value == null || (isInt && num >= 1 && num <= 31);
		},

		_setValueAttr: function(value, priorityChange, formattedValue){
			if(value){
				if(value.getDate){
					value = value.getDate();
				}
			}
			//TextBox.prototype._setValueAttr.call(this, value, priorityChange, formattedValue);
			this.inherited(arguments);
		},

		openDropDown: function(){
			this.inherited(arguments);

			this.dropDown.onValueSelected = rias.hitch(this, function(value){
				this.focus(); // focus the textbox before the popup closes to avoid reopening the popup
				setTimeout(rias.hitch(this, "closeDropDown"), 1); // allow focus time to take

				//TextBox.prototype._setValueAttr.call(this, String(value.getDate()), true, String(value.getDate()));
				this.set("value", value, true, value);
			});
		}

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
				"description": "Enter date in format yyyy/MM/dd"
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