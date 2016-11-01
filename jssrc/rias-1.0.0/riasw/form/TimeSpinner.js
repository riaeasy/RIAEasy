//RIAStudio client runtime widget - TimeSpinner

define([
	"rias",
	"rias/riasw/form/_Spinner"
], function(rias, _Widget) {

	var riaswType = "rias.riasw.form.TimeSpinner";
	var Widget = rias.declare(riaswType, [_Widget], {

		// summary:
		//		Time Spinner
		// description:
		//		This widget is the same as a normal NumberSpinner, but for the time component of a date object instead

		baseClass: "riaswTextBox riaswSpinner riaswTimeSpinner",

		constraints: {
			datePattern: "HH:mm:ss",
			locale: "",
			selector: "time",
			fullYear: true
		},

		required: false,

		adjust: function(/*Object*/ val, /*Number*/ delta){
			return rias.date.add(val, "minute", delta)
		},

		//FIXME should we allow for constraints in this widget?
		isValid: function(){return true;},

		smallDelta: 5,

		largeDelta: 30,

		timeoutChangeRate: 0.50,

		parse: function(time, locale){
			return rias.dateLocale.parse(time, {selector:"time", formatLength:"short"});
		},

		format: function(time, locale){
			if(rias.isString(time)){ return time; }
			return rias.dateLocale.format(time, {selector:"time", formatLength:"short"});
		},

		serialize: rias.date.toISOString,

		value: "12:00 AM",

		_onKeyDown: function(e){
			// TODO: this code is just copied from NumberSpinner
			if((e.keyCode == rias.keys.HOME || e.keyCode == rias.keys.END) && !(e.ctrlKey || e.altKey || e.metaKey)
				&& typeof this.get('value') != 'undefined' /* gibberish, so HOME and END are default editing keys*/){
				var value = this.constraints[(e.keyCode == rias.keys.HOME ? "min" : "max")];
				if(value){
					this._setValueAttr(value,true);
				}
				// eat home or end key whether we change the value or not
				rias.event.stop(e);
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTimeSpinnerIcon",
		iconClass16: "riaswTimeSpinnerIcon16",
		defaultParams: {
			//content: "<input type='text'></input>",
			required: true,
			invalidMessage: rias.i18n.message.invalid,
			rangeMessage: rias.i18n.message.range,
			constraints: {
				datePattern: "HH:mm:ss",
				locale: "",
				selector: "time",
				fullYear: true
			}
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