//RIAStudio client runtime widget - HorizontalRule

define([
	"rias",
	"dijit/form/HorizontalRule",
	"dijit/form/HorizontalSlider"
], function(rias, _Widget) {

	var riasType = "rias.riasw.form.HRule";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswHorizontalRuleIcon",
		iconClass16: "riaswHorizontalRuleIcon16",
		defaultParams: {
			//content: "<div></div>",
			container: "bottomDecoration",
			count: 3
		},
		initialSize: {},
		//resizable: "none",
		allowedChild: "none",
		allowedParent: "rias.riasw.HSlider, dijit.form.HorizontalSlider",
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
				"description": "For HorizontalSlider, this is either \"topDecoration\" or \"bottomDecoration\",\nand indicates whether this rule goes above or below the slider.",
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
				"description": "CSS style to apply to individual hash marks"
			}
		}
	};

	return Widget;

});