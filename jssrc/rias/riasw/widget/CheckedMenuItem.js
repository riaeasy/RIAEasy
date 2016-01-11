//RIAStudio client runtime widget - CheckedMenuItem

define([
	"rias",
	"dijit/CheckedMenuItem"
], function(rias, _Widget) {

	rias.theme.loadCss([
		"widget/Menu.css"
	]);

	var riasType = "rias.riasw.widget.CheckedMenuItem";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswCheckedMenuItemIcon",
		iconClass16: "riaswCheckedMenuItemIcon16",
		defaultParams: {
			//content: "<span></span>",
			label: "CheckedMenuItem",
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