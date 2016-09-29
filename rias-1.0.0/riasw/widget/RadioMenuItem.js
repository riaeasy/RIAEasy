//RIAStudio client runtime widget - RadioMenuItem

define([
	"rias",
	"dijit/RadioMenuItem"
], function(rias, _Widget) {

	//rias.theme.loadThemeCss([
	//	"riasw/widget/Menu.css"
	//]);

	var riaswType = "rias.riasw.widget.RadioMenuItem";
	var Widget = rias.declare(riaswType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswRadioMenuItemIcon",
		iconClass16: "riaswRadioMenuItemIcon16",
		defaultParams: {
			//content: "<span></span>",
			//label: "RadioMenuItem",
			accelKey: ""
		},
		initialSize: {},
		resizable: "none",
		allowedParent: "rias.riasw.Menu, dijit.Menu",
		allowedChild: "",
		"property": {
			"label": {
				"datatype": "string",
				"title": "Label"
			},
			"iconClass": {
				"datatype": "string",
				"title": "Icon Class"
			},
			"accelKey": {
				"datatype": "string",
				"title": "Shortcut Key"
			},
			"checked": {
				"datatype": "boolean",
				"title": "Checked"
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled"
			}
		}
	};

	return Widget;
});