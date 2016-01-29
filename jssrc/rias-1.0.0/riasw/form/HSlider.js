//RIAStudio client runtime widget - HorizontalSlider

define([
	"rias",
	"dijit/form/HorizontalSlider"
], function(rias, _Widget) {

	var riasType = "rias.riasw.form.HSlider";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswHorizontalSliderIcon",
		iconClass16: "riaswHorizontalSliderIcon16",
		defaultParams: {
			//content: "<div></div>",
			type: "text",
			value: 0,
			tabIndex: 0,
			scrollOnFocus: true,
			showButtons: true,
			minimum: 0,
			discreteValues: null,
			pageIncrement: 2,
			clickSelect: true,
			slideDuration: 200
		},
		initialSize: {},
		resizable: "width",
		allowedChild: "dijit.form.HorizontalRuleLabels, dijit.form.HorizontalRule",
		"property": {
			"type": {
				"datatype": "string",
				"defaultValue": "text",
				"description": "Corresponds to the native HTML <input> element's attribute. From dijit.form._FormWidgetMixin.",
				"hidden": true
			},
			"name": {
				"datatype": "string",
				"title": "Name",
				"description": "Name used when submitting form; same as \"name\" attribute or plain HTML elements. From dijit.form._FormWidgetMixin."
			},
			"alt": {
				"datatype": "string",
				"hidden": true,
				"description": "Corresponds to the native HTML <input> element's attribute. From dijit.form._FormWidgetMixin."
			},
			"value": {
				"datatype": "number",
				"defaultValue": 0,
				"title": "Value",
				"description": "Corresponds to the native HTML <input> element's attribute. From dijit.form._FormWidgetMixin."
			},
			"tabIndex": {
				"datatype": "number",
				"defaultValue": "0",
				"title": "Tab Index",
				"description": "Order fields are traversed when user hits the tab key. From dijit.form._FormWidgetMixin."
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled",
				"description": "Determines if this widget should respond to user input. From dijit.form._FormWidgetMixin."
			},
			"intermediateChanges": {
				"datatype": "boolean",
				"title": "Intermediate Changes",
				"description": "Fires onChange for each value change or only on demand. From dijit.form._FormWidgetMixin."
			},
			"scrollOnFocus": {
				"datatype": "boolean",
				"title": "Scroll on Focus",
				"description": "Determines if this this widget scroll into view on focus. From dijit.form._FormWidgetMixin.",
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