//RIAStudio client runtime widget - PopupMenuBarItem

define([
	"riasw/riaswBase",
	"riasw/sys/PopupMenuItem",
	"riasw/sys/MenuBarItem"
], function(rias, PopupMenuItem, MenuBarItem) {

	//rias.theme.loadThemeCss([
	//	"riasw/sys/Menu.css"
	//]);

	var riaswType = "riasw.sys.PopupMenuBarItem";
	var Widget = rias.declare(riaswType, [PopupMenuItem, MenuBarItem._MenuBarItemMixin], {
		// summary:
		//		Item in a MenuBar like "File" or "Edit", that spawns a submenu when pressed (or hovered)
	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "none",
		allowedParent: "riasw.sys.MenuBar",
		allowedChild: "",
		"property": {
			"label": {
				"datatype": "string",
				"title": "Label"
			},
			"popup": {
				"datatype": "object",
				"title": "Popup",
				"isData": true
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