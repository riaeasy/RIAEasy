//RIAStudio client runtime widget - MultiSelect

define([
	"rias",
	"dijit/form/MultiSelect"
], function(rias, _Widget) {

	var riasType = "rias.riasw.form.MultiSelect";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswMultiSelectIcon",
		iconClass16: "riaswMultiSelectIcon16",
		defaultParams: {
			//content: "<select multiple='true'></select>",
			width: "200px",
			height: "auto",
			type: "text",
			size: 7
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
				"title": "Name"
			},
			"alt": {
				"datatype": "string",
				"hidden": true
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
				"hidden": true
			},
			"size": {
				"datatype": "number",
				"defaultValue": 7,
				"title": "Size"
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