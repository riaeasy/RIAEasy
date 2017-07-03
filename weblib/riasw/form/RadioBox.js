define([
	"riasw/riaswBase",
	"riasw/form/CheckBox",
	"riasw/form/_RadioButtonMixin"
], function(rias, CheckBox, _RadioButtonMixin){

	// module:
	//		riasw/form/RadioButton

	var riaswType = "riasw.form.RadioBox";
	var Widget = rias.declare(riaswType, [CheckBox, _RadioButtonMixin], {
		// summary:
		//		Same as an HTML radio, but with fancy styling.

		baseClass: "riaswRadioBox"

	});

	/*Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "none",
		allowedChild: "",
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
				"title": "Value"
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled"
			},
			"readOnly": {
				"datatype": "boolean",
				"hidden": true
			},
			"intermediateChanges": {
				"datatype": "boolean",
				"hidden": true
			},
			"label": {
				"datatype": "string",
				"title": "Label"
			},
			"showLabel": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Show Label"
			},
			"checked": {
				"datatype": "boolean",
				"title": "Checked"
			}
		}
	};*/

	return Widget;

});
