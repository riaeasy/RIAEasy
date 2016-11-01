//RIAStudio client runtime widget - VerticalRule

define([
	"rias",
	"dijit/form/VerticalRule",
	"dijit/form/VerticalSlider"
], function(rias, _Widget) {

	var riaswType = "rias.riasw.form.VRule";
	var Widget = rias.declare(riaswType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswVerticalRuleIcon",
		iconClass16: "riaswVerticalRuleIcon16",
		defaultParams: {
			//content: "<div></div>",
			container: "bottomDecoration",
			count: 3
		},
		initialSize: {},
		//resizable: "none",
		allowedChild: "none",
		allowedParent: "rias.riasw.VSlider, dijit.form.VerticalSlider",
		style: "height:5px;",
		"property": {
			"count": {
				"datatype": "number",
				"defaultValue": 3,
				"title": "Count",
				"description": "Number of hash marks to generate"
			},
			"container": {
				"datatype": "string",
				"title": "Container",
				"description": "This is either \"leftDecoration\" or \"rightDecoration\",\nto indicate whether this rule goes to the left or to the right of the slider.\nNote that on RTL system, \"leftDecoration\" would actually go to the right, and vice-versa.",
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
				"description": "CSS style to apply to individual hash marks"
			}
		}
	};

	return Widget;

});