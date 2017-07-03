//RIAStudio client runtime widget - TimeTextBox

define([
	"riasw/riaswBase",
	"riasw/form/_DateTimeTextBox",
	"riasw/form/_TimePicker"
], function(rias, _DateTimeTextBox, _TimePicker) {

	var riaswType = "riasw.form.TimeTextBox";
	var Widget = rias.declare(riaswType, [_DateTimeTextBox], {
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
		// |	new riasw/form/TimeTextBox({value: stamp.fromISOString("T12:59:59", new Date())})
		//
		//		When passed to the parser in markup, must be specified according to locale-independent
		//		`stamp.fromISOString` format.
		//
		//		Example:
		// |	<input data-dojo-type='riasw/form/TimeTextBox' value='T12:34:00'>
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
						if(this.isOpened()){
							this.closeDropDown();
						}
						this.openDropDown();
					});
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
				"format": "time",
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
				"title": "Required",
				"hidden": true
			},
			"constraints": {
				"datatype": "json",
				"defaultValue": "\"{\\\"locale\\\":\\\"\\\",\\\"selector\\\":\\\"time\\\",\\\"fullYear\\\":true}\"",
				"title": "Constraints",
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
			"state": {
				"datatype": "string",
				"description": "Shows current state (ie, validation result) of input (Normal, Warning, or Error)",
				"hidden": true
			}
		}
	};

	return Widget;

});