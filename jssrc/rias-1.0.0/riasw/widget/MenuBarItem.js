//RIAStudio client runtime widget - MenuBarItem

define([
	"rias",
	"dijit/MenuBarItem"
], function(rias, _Widget) {

	rias.theme.loadRiasCss([
		"widget/Menu.css"
	]);

	var riasType = "rias.riasw.widget.MenuBarItem";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswMenuBarItemIcon",
		iconClass16: "riaswMenuBarItemIcon16",
		defaultParams: {
			//content: "<span></span>",
			label: "MenuBarItem"
		},
		initialSize: {},
		resizable: "none",
		allowedParent: "rias.riasw.MenuBar, dijit.MenuBar",
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
				"title": "Shortcut Key",
				"defaultValue": ""
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled"
			}
		}
	};

	return Widget;

});