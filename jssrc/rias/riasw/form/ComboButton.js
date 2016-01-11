//RIAStudio client runtime widget - ComboButton

define([
	"rias",
	"dijit/form/ComboButton",
	"rias/riasw/form/_BusyButtonMixin",
	"dijit/Menu",
	"dijit/MenuItem",
	"rias/riasw/form/DropDownButton"
], function(rias, ComboButton, _BusyButtonMixin) {

	rias.theme.loadCss([
		"form/Button.css"
	]);

	var riasType = "rias.riasw.form.ComboButton";
	var Widget = rias.declare(riasType, [ComboButton, _BusyButtonMixin], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswComboButtonIcon",
		iconClass16: "riaswComboButtonIcon16",
		defaultParams: {
			//content: "<span></span>",
			type: "button",
			tabIndex: 0,
			showLabel: true,
			optionsTitle: "combo options",
			scrollOnFocus: true
		},
		initialSize: {},
		resizable: "none",
		//allowedChild: "",
		"property": {
			"type": {
				"datatype": "string",
				"defaultValue": "button",
				"hidden": true
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
			"dropDown": {
				"datatype": "object",
				"title": "Popup",
				"isData": true
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
			"iconClass": {
				"datatype": "string",
				"title": "Icon Class"
			},
			"optionsTitle": {
				"datatype": "string",
				"defaultValue": "combo options",
				"description": "Text that describes the options menu (accessibility)",
				"hidden": false
			},
			"dropDownPosition": {
				"datatype": "array",
				"description": "TODO: changes the direction of the arrow and placement of menu.",
				"option": [
					{
						"value": "[before]"
					},
					{
						"value": "[after]"
					},
					{
						"value": "[above]"
					},
					{
						"value": "[below]"
					}
				],
				"title": "Dropdown Position",
				"hidden": true
			},
			"scrollOnFocus": {
				"datatype": "boolean",
				"description": "On focus, should this widget scroll into view?",
				"hidden": false,
				"defaultValue": true
			},
			"isContainer": {
				"datatype": "boolean",
				"description": "Just a flag indicating that this widget descends from dijit._Container",
				"hidden": false
			}
		}
	};

	return Widget;

});