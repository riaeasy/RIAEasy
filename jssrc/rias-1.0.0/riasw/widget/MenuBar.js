//RIAStudio client runtime widget - MenuBar

define([
	"rias",
	"dijit/MenuBar",
	"dijit/PopupMenuBarItem",
	"dijit/MenuItem"
], function(rias, _Widget) {

	rias.theme.loadCss([
		"widget/Menu.css"
	]);

	var riasType = "rias.riasw.widget.MenuBar";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswMenuBarIcon",
		iconClass16: "riaswMenuBarIcon16",
		defaultParams: {
			//content: "<span></span>"
		},
		initialSize: {},
		resizable: "none",
		allowedChild: "dijit.PopupMenuBarItem, dijit.MenuBarItem",
		"property": {
			"popupDelay": {
				"datatype": "number",
				"defaultValue": 500,
				"title": "Popup Delay"
			},
			"parentMenu": {
				"datatype": "object",
				"description": "pointer to menu that displayed me",
				"hidden": true
			},
			"focusedChild": {
				"datatype": "object",
				"description": "The currently focused child widget, or null if there isn't one",
				"hidden": true
			},
			"tabIndex": {
				"datatype": "number",
				"description": "Tab index of the container; same as HTML tabindex attribute.\nNote then when user tabs into the container, focus is immediately\nmoved to the first item in the container."
			},
			"isContainer": {
				"datatype": "boolean",
				"description": "Just a flag indicating that this widget descends from dijit._Container",
				"defaultValue": true,
				"hidden": true
			}
		}
	};

	return Widget;

});