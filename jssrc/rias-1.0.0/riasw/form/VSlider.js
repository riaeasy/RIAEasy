//RIAStudio client runtime widget - VerticalSlider

define([
	"rias",
	"dijit/form/VerticalSlider"
], function(rias, _Widget) {

	var riasType = "rias.riasw.form.VSlider";

	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswVerticalSliderIcon",
		iconClass16: "riaswVerticalSliderIcon16",
		defaultParams: {
			//content: "<div></div>",
			type: "text",
			value: 0,
			showButtons: true,
			minimum: 0,
			maximum: 100,
			discreteValues: null,
			pageIncrement: 2,
			clickSelect: true,
			slideDuration: 200
		},
		initialSize: {},
		resizable: "height",
		allowedChild: "dijit.form.VerticalRuleLabels, dijit.form.VerticalRule",
		"property": {
			"type": {
				"datatype": "string",
				"defaultValue": "text",
				"description": "Corresponds to the native HTML <input> element's attribute.",
				"hidden": true
			},
			"name": {
				"datatype": "string",
				"title": "Name",
				"description": "Name used when submitting form; same as \"name\" attribute or plain HTML elements."
			},
			"alt": {
				"datatype": "string",
				"hidden": true,
				"description": "Corresponds to the native HTML <input> element's attribute."
			},
			"value": {
				"datatype": "number",
				"defaultValue": 0,
				"title": "Value",
				"description": "Corresponds to the native HTML <input> element's attribute."
			},
			"tabIndex": {
				"datatype": "number",
				"defaultValue": "0",
				"title": "Tab Index",
				"description": "Order fields are traversed when user hits the tab key."
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled",
				"description": "Determines if this widget should respond to user input."
			},
			"intermediateChanges": {
				"datatype": "boolean",
				"title": "Intermediate Changes",
				"description": "Fires onChange for each value change or only on demand."
			},
			"scrollOnFocus": {
				"datatype": "boolean",
				"title": "Scroll on Focus",
				"description": "Determines if this this widget scroll into view on focus.",
				"hidden": false,
				"defaultValue": true
			},
			"showButtons": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Show Buttons",
				"description": "Show increment/decrement buttons at the ends of the slider."
			},
			"minimum": {
				"datatype": "number",
				"defaultValue": 0,
				"title": "Minimum Value",
				"description": "The minimum value the slider can be set to."
			},
			"maximum": {
				"datatype": "number",
				"defaultValue": 100,
				"title": "Maximum Value",
				"description": "The maximum value the slider can be set to."
			},
			"discreteValues": {
				"datatype": "number",
				"defaultValue": null,
				"title": "Discrete Values",
				"description": "If specified, indicates that the slider handle has only 'discreteValues' possible positions, and that after dragging the handle, it will snap to the nearest possible position. Thus, the slider has only 'discreteValues' possible values."
			},
			"pageIncrement": {
				"datatype": "number",
				"defaultValue": 2,
				"title": "Page Increment",
				"description": "If discreteValues is also specified, this indicates the amount of clicks (ie, snap positions) that the slider handle is moved via pageup/pagedown keys. If discreteValues is not specified, it indicates the number of pixels."
			},
			"clickSelect": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Click Select",
				"description": "Determines if clicking the slider bar changes the value or not"
			},
			"slideDuration": {
				"datatype": "number",
				"defaultValue": 200,
				"title": "Slide Duration",
				"description": "The time in ms to take to animate the slider handle from 0% to 100%, when clicking the slider bar to make the handle move.. Default is registry.defaultDuration."
			}
		}
	};

	return Widget;

});