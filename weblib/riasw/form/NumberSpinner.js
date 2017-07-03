//RIAStudio client runtime widget - NumberSpinner

define([
	"riasw/riaswBase",
	"riasw/form/_Spinner",
	"riasw/form/NumberTextBoxMixin"
], function(rias, _Spinner, NumberTextBoxMixin) {

	var riaswType = "riasw.form.NumberSpinner";
	var Widget = rias.declare(riaswType, [_Spinner, NumberTextBoxMixin], {

		// summary:
		//		Extends NumberTextBox to add up/down arrows and pageup/pagedown for incremental change to the value
		//
		// description:
		//		A `riasw/form/NumberTextBox` extension to provide keyboard accessible value selection
		//		as well as icons for spinning direction. When using the keyboard, the typematic rules
		//		apply, meaning holding the key will gradually increase or decrease the value and
		//		accelerate.
		//
		// example:
		//	| new NumberSpinner({ constraints:{ max:300, min:100 }}, "someInput");

		baseClass: "riaswTextBox riaswSpinner riaswNumberTextBox",

		required: true,
		value: 0,

		adjust: function(/*Object*/ val, /*Number*/ delta){
			// summary:
			//		Change Number val by the given amount
			// tags:
			//		protected

			var tc = this.constraints,
				v = isNaN(val),
				gotMax = !isNaN(tc.max),
				gotMin = !isNaN(tc.min)
				;
			if(v && delta !== 0){ // blank or invalid value and they want to spin, so create defaults
				val = (delta > 0) ?
					gotMin ? tc.min : gotMax ? tc.max : 0 :
					gotMax ? this.constraints.max : gotMin ? tc.min : 0
				;
			}
			var newval = val + delta;
			if(v || isNaN(newval)){
				return val;
			}
			if(gotMax && (newval > tc.max)){
				newval = tc.max;
			}
			if(gotMin && (newval < tc.min)){
				newval = tc.min;
			}
			return newval;
		},

		_onKeyDown: function(e){
			if(this.disabled || this.readOnly){
				return;
			}
			if((e.keyCode === rias.keys.HOME || e.keyCode === rias.keys.END) && !(e.ctrlKey || e.altKey || e.metaKey)
				&& typeof this.get('value') != 'undefined' /* gibberish, so HOME and END are default editing keys*/){
				var value = this.constraints[(e.keyCode === rias.keys.HOME ? "min" : "max")];
				if(typeof value === "number"){
					this.set("value", value, false);
				}
				// eat home or end key whether we change the value or not
				e.stopPropagation();
				e.preventDefault();
			}
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
			"alt": {
				"datatype": "string",
				"hidden": true
			},
			"value": {
				"datatype": "string",
				"title": "Value",
				"defaultValue": "0"
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
				"defaultValue": true,
				"title": "Required",
				"hidden": false
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
			"defaultTimeout": {
				"datatype": "number",
				"defaultValue": 500,
				"title": "Default Timeout"
			},
			"timeoutChangeRate": {
				"datatype": "number",
				"defaultValue": 0.9,
				"title": "Timeout Change Rate"
			},
			"smallDelta": {
				"datatype": "number",
				"defaultValue": 1,
				"title": "Small Delta"
			},
			"largeDelta": {
				"datatype": "number",
				"defaultValue": 10,
				"title": "Large Delta"
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