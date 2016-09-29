//RIAStudio client runtime widget - VerticalRuleLabels

define([
	"rias",
	"dijit/form/VerticalRuleLabels",
	"dijit/form/VerticalSlider"
], function(rias, _Widget) {

	var riaswType = "rias.riasw.form.VRuleLabels";
	var Widget = rias.declare(riaswType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswVerticalRuleLabelsIcon",
		iconClass16: "riaswVerticalRuleLabelsIcon16",
		defaultParams: {
			//content: "<ol></ol>",
			container: "rightDecoration",
			count: 3,
			labels: [],
			numericMargin: 0,
			minimum: 0,
			maximum: 1,
			constraints: {
				pattern: "#%"
			}
		},
		initialSize: {},
		//resizable: "none",
		allowedChild: "none",
		allowedParent: "rias.riasw.VSlider, dijit.form.VerticalSlider",
		style: "min-width:1em; min-height:1em; width:3em;",
		"property": {
			"count": {
				"datatype": "number",
				"defaultValue": 3,
				"title": "Count",
				"description": "Number of hash marks to generate (From VerticalRule)"
			},
			"container": {
				"datatype": "string",
				"title": "Container",
				"description": "This is either \"leftDecoration\" or \"rightDecoration\",\nto indicate whether this rule goes to the left or to the right of the slider.\nNote that on RTL system, \"leftDecoration\" would actually go to the right, and vice-versa. (From VerticalRule)",
				"option": [
					{
						"value": "leftDecoration"
					},
					{
						"value": "rightDecoration"
					}
				],
				"hidden": false
			},
			"ruleStyle": {
				"datatype": "string",
				"title": "Rule Style",
				"description": "CSS style to apply to individual hash marks (From VerticalRule)"
			},
			"labelStyle": {
				"datatype": "string",
				"title": "Label Style",
				"description": "CSS style to apply to individual text labels"
			},
			"labels": {
				"datatype": "array",
				"defaultValue": "[]",
				"title": "Labels",
				"description": "Array of text labels to render - evenly spaced from left-to-right or bottom-to-top. Alternately, minimum and maximum can be specified, to get numeric labels."
			},
			"numericMargin": {
				"datatype": "number",
				"defaultValue": 0,
				"title": "Numeric Margin",
				"description": "Number of generated numeric labels that should be rendered as '' on the ends when labels[] are not specified"
			},
			"minimum": {
				"datatype": "number",
				"defaultValue": 0,
				"title": "Minimum Value",
				"description": "Bottom-most label value for generated numeric labels when labels[] are not specified"
			},
			"maximum": {
				"datatype": "number",
				"defaultValue": 1,
				"title": "Maximum Value",
				"description": "Top-most label value for generated numeric labels when labels[] are not specified"
			},
			"constraints": {
				"datatype": "json",
				"defaultValue": "\"{\\\"pattern\\\":\\\"#%\\\"}\"",
				"description": "pattern, places, lang, et al (see dojo.number) for generated numeric labels when labels[] are not specified",
				"hidden": true
			}
		}
	};

	return Widget;

});