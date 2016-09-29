//RIAStudio client runtime widget - TimeTextBox

define([
	"rias",
	//"dijit/form/DateTextBox",
	"rias/riasw/form/_DateTimeTextBox",///extend(templateString)
	"dijit/_TimePicker"
], function(rias, _Widget, _TimePicker) {

	var riaswType = "rias.riasw.form.TimeTextBox";
	var Widget = rias.declare(riaswType, [_Widget], {
		popupClass: _TimePicker,
		constraints: {
			datePattern: "HH:mm:ss",
			locale: "",
			selector: "time",
			fullYear: true
		},

		baseClass: "riaswTextBox riaswComboBox riaswTimeTextBox",
		_selector: "time",

		/*=====
				// constraints: __Constraints
				constraints:{},
		=====*/

		// value: Date
		//		The value of this widget as a JavaScript Date object.  Note that the date portion implies time zone and daylight savings rules.
		//
		//		Example:
		// |	new dijit/form/TimeTextBox({value: stamp.fromISOString("T12:59:59", new Date())})
		//
		//		When passed to the parser in markup, must be specified according to locale-independent
		//		`stamp.fromISOString` format.
		//
		//		Example:
		// |	<input data-dojo-type='dijit/form/TimeTextBox' value='T12:34:00'>
		value: new Date(""),		// value.toString()="NaN"
		//FIXME: in markup, you have no control over daylight savings

		// Add scrollbars if necessary so that dropdown doesn't cover the <input>
		maxHeight: -1,

		_onKey: function(evt){
			if(this.disabled || this.readOnly){ return; }
			this.inherited(arguments);

			// If the user has backspaced or typed some numbers, then filter the result list
			// by what they typed.  Maybe there's a better way to detect this, like _handleOnChange()?
			switch(evt.keyCode){
				case rias.keys.ENTER:
				case rias.keys.TAB:
				case rias.keys.ESCAPE:
				case rias.keys.DOWN_ARROW:
				case rias.keys.UP_ARROW:
					// these keys have special meaning
					break;
				default:
					// defer() because the keystroke hasn't yet appeared in the <input>,
					// so the get('displayedValue') call below won't give the result we want.
					this.defer(function(){
						// set this.filterString to the filter to apply to the drop down list;
						// it will be used in openDropDown()
						var val = this.get('displayedValue');
						this.filterString = (val && !this.parse(val, this.constraints)) ? val.toLowerCase() : "";

						// close the drop down and reopen it, in order to filter the items shown in the list
						// and also since the drop down may need to be repositioned if the number of list items has changed
						// and it's being displayed above the <input>
						if(this._opened){
							this.closeDropDown();
						}
						this.openDropDown();
					});
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTimeTextBoxIcon",
		iconClass16: "riaswTimeTextBoxIcon16",
		defaultParams: {
			//content: "<input type='text'></input>",
			invalidMessage: rias.i18n.message.invalid,
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
			},			"rangeMessage": {
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