//RIAStudio client runtime widget - FileInput

define([
	"rias",
	"dojox/form/FileInput"
], function(rias, _Widget) {

	//rias.loadRiasCss(["dojox/form/resources/FileInput.css"]);

	var riasType = "rias.riasw.form.FileInput";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswFileInputIcon",
		iconClass16: "riaswFileInputIcon16",
		defaultParams: {
			//content: "<input></input>",
			type: "text",
			name: "uploadFile",
			label: rias.i18n.action.browse,
			cancelText: rias.i18n.action.cancel
		},
		initialSize: {},
		resizable: "width",
		//allowedChild: "",
		"property": {
			"type": {
				"datatype": "string",
				"defaultValue": "text",
				"hidden": true
			},
			"name": {
				"datatype": "string",
				"defaultValue": "uploadFile",
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
				"hidden": true
			},
			"intermediateChanges": {
				"datatype": "boolean",
				"hidden": true
			},
			"label": {
				"datatype": "string",
				"defaultValue": "Browse ...",
				"title": "Label"
			},
			"cancelText": {
				"datatype": "string",
				"defaultValue": "Cancel",
				"title": "Cancel Text"
			},
			"scrollOnFocus": {
				"datatype": "boolean",
				"description": "On focus, should this widget scroll into view?",
				"hidden": false
			}
		}
	};

	return Widget;

});