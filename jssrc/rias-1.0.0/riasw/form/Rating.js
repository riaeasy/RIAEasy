//RIAStudio client runtime widget - Rating

define([
	"rias",
	"dojox/form/Rating"
], function(rias, _Widget) {

	//rias.loadRiasCss(["dojox/form/resources/Rating.css"]);

	var riasType = "rias.riasw.form.Rating";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswRatingIcon",
		iconClass16: "riaswRatingIcon16",
		defaultParams: {
			//content: "<span></span>",
			type: "text",
			value: 0,
			tabIndex: 0
			//,scrollOnFocus: true
		},
		initialSize: {},
		resizable: "none",
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
			"value": {
				"datatype": "number",
				"defaultValue": 0,
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
				"hidden": true
			},
			"numStars": {
				"datatype": "number",
				"title": "Number of stars"
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