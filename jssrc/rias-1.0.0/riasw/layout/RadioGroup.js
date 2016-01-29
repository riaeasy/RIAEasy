//RIAStudio client runtime widget - RadioGroup

define([
	"rias",
	"dojox/layout/RadioGroup",
	"rias/riasw/layout/StackContainer"/// StackContainer.extend().
], function(rias) {

	rias.theme.loadCss([
		"layout/RadioGroup.css"
	]);

	var riasType = "rias.riasw.layout.RadioGroup";
	var Widget = rias.declare(riasType, [dojox.layout.RadioGroup], {///dojox/layout/RadioGroup 没有返回基类
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswRadioGroupIcon",
		iconClass16: "riaswRadioGroupIcon16",
		defaultParams: {
			//content: "<span></span>",
			hasButtons: true,
			//doLayout: true,
			duration: 750,
			buttonClass: "dojox.layout._RadioButton"
		},
		initialSize: {},
		allowedChild: "rias.riasw.Pane, dijit.layout.ContentPane",
		"property": {
			"doLayout": {
				"datatype": "boolean",
				"defaultValue": true,
				"hidden": true
			},
			"duration": {
				"datatype": "number",
				"description": "used for Fade and Slide RadioGroup's, the duration to run the transition animation. does not affect anything in default RadioGroup",
				"hidden": true,
				"defaultValue": 750,
				"title": "Duration"
			},
			"hasButtons": {
				"datatype": "boolean",
				"defaultValue": true,
				"title": "Has Buttons"
			},
			"persist": {
				"datatype": "boolean",
				"description": "Remembers the selected child across sessions\n\n\nBoolean",
				"hidden": false
			},
			"isContainer": {
				"datatype": "boolean",
				"description": "Just a flag indicating that this widget descends from dijit._Container",
				"hidden": true,
				"defaultValue": true
			},
			"buttonClass": {
				"datatype": "string",
				"description": "The full declared className of the Button widget to use for hasButtons",
				"defaultValue": "dojox.layout._RadioButton",
				"hidden": false
			}
		},
		"childProperties": {
			"selected": {
				"datatype": "boolean",
				"title": "Selected"
			},
			"closable": {
				"datatype": "boolean",
				"title": "Closable"
			}
		}
	};

	return Widget;
});