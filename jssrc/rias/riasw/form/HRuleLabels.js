//RIAStudio client runtime widget - HorizontalRuleLabels

define([
	"rias",
	"dijit/form/HorizontalRuleLabels",
	"dijit/form/HorizontalSlider"
], function(rias, _Widget) {

	var riasType = "rias.riasw.form.HRuleLabels";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswHorizontalRuleLabelsIcon",
		iconClass16: "riaswHorizontalRuleLabelsIcon16",
		defaultParams: {
			//content: "<ol></ol>",
			container: "bottomDecoration",
			count: 3,
			labels: [],
			numericMargin: 0,
			minimum: 0,
			maximum: 1,
			constraints: {pattern: "#%"}
		},
		initialSize: {},
		//resizable: "none",
		allowedChild: "none",
		allowedParent: "rias.riasw.HSlider, dijit.form.HorizontalSlider",
		style: "min-width:1em; min-height:1em; width:3em;",
		property: {
			"count": {
				"datatype": "number",
				"defaultValue": 3,
				"title": "Count",
				"description": "Number of hash marks to generate. (From HorizontalRule)"
			},
			"container": {
				"datatype": "string",
				"title": "Container",
				"description": "For HorizontalSlider, this is either \"topDecoration\" or \"bottomDecoration\",\nand indicates whether this rule goes above or below the slider. (From HorizontalRule)",
				"option": [
					{
						"value": "bottomDecoration"
					},
					{
						"value": "topDecoration"
					}
				],
				"hidden": false
			},
			"ruleStyle": {
				"datatype": "string",
				"title": "Rule Style",
				"description": "CSS style to apply to individual hash marks. (From HorizontalRule)"
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
				"description": "Leftmost label value for generated numeric labels when labels[] are not specified"
			},
			"maximum": {
				"datatype": "number",
				"defaultValue": 1,
				"title": "Maximum Value",
				"description": "Rightmost label value for generated numeric labels when labels[] are not specified"
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