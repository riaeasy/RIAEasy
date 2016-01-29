//RIAStudio client runtime widget - SplitContainer

define([
	"rias",
	"dijit/layout/SplitContainer"
], function(rias, _Widget) {

	var riasType = "rias.riasw.layout.SplitContainer";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswSplitContainerIcon",
		iconClass16: "riaswSplitContainerIcon16",
		defaultParams: {
			//content: "<span></span>",
			//doLayout: true,
			//duration: rias.defaultDuration
		},
		initialSize: {},
		//allowedChild: "",
		"property": {
			"activeSizing": {
				"datatype": "boolean",
				"defaultValue": false,
				"hidden": false
			},
			"persist": {
				"datatype": "boolean",
				"description": "Remembers the selected child across sessions"
			},
			"sizerWidth": {
				"datatype": "number",
				"defaultValue": 7,
				"hidden": false
			},
			"orientation": {
				"datatype": "string",
				"hidden": false,
				"defaultValue": "horizontal"
			}
		},
		"childProperties": {
			"sizeMin": {
				"datatype": "number",
				"defaultValue": 10
			},
			"sizeShare": {
				"datatype": "number",
				"defaultValue": 10
			}
		}
	};

	return Widget;
});