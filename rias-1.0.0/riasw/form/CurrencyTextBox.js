//RIAStudio client runtime widget - CurrencyTextBox

define([
	"rias",
	"rias/riasw/form/NumberTextBox"
], function(rias, _Widget) {

	var riaswType = "rias.riasw.form.CurrencyTextBox";
	var Widget = rias.declare(riaswType, [_Widget], {

		// summary:
		//		A validating currency textbox
		// description:
		//		CurrencyTextBox is similar to `dijit/form/NumberTextBox` but has a few
		//		extra features related to currency:
		//
		//		1. After specifying the currency type (american dollars, euros, etc.) it automatically
		//			sets parse/format options such as how many decimal places to show.
		//		2. The currency mark (dollar sign, euro mark, etc.) is displayed when the field is blurred
		//			but erased during editing, so that the user can just enter a plain number.

		// currency: [const] String
		//		the [ISO4217](http://en.wikipedia.org/wiki/ISO_4217) currency code, a three letter sequence like "USD"
		currency: "",

		/*=====
		 // constraints: CurrencyTextBox.__Constraints
		 //		Despite the name, this parameter specifies both constraints on the input
		 //		(including minimum/maximum allowed values) as well as
		 //		formatting options.  See `dijit/form/CurrencyTextBox.__Constraints` for details.
		 constraints: {},
		 ======*/

		baseClass: "riaswTextBox riaswCurrencyTextBox",

		// Override NumberTextBox._formatter to deal with currencies, ex: converts "123.45" to "$123.45"
		_formatter: rias.currency.format,

		_parser: rias.currency.parse,

		_regExpGenerator: rias.currency.regexp,

		parse: function(/*String*/ value, /*Object*/ constraints){
			// summary:
			//		Parses string value as a Currency, according to the constraints object
			// tags:
			//		protected extension
			var v = this.inherited(arguments);
			if(isNaN(v) && /\d+/.test(value)){ // currency parse failed, but it could be because they are using NumberTextBox format so try its parse
				v = rias.hitch(rias.delegate(this, { _parser: _Widget.prototype._parser }), "inherited")(arguments);
			}
			return v;
		},

		_setConstraintsAttr: function(/*Object*/ constraints){
			if(!constraints.currency && this.currency){
				constraints.currency = this.currency;
			}
			this.inherited(arguments, [ rias.currency._mixInDefaults(rias.mixin(constraints, { exponent: false })) ]); // get places
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswCurrencyTextBoxIcon",
		iconClass16: "riaswCurrencyTextBoxIcon16",
		defaultParams: {
			//content: "<input type='text'></input>",
			type: "text",
			invalidMessage: rias.i18n.message.invalid,
			rangeMessage: rias.i18n.message.range,
			constraints: {currency: "", locale: "", type: "currency"},
			editOptions: {pattern: "#.######"}
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