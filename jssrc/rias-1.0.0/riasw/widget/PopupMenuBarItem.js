//RIAStudio client runtime widget - PopupMenuBarItem

define([
	"rias",
	"rias/riasw/widget/PopupMenuItem",
	"rias/riasw/widget/MenuBarItem"
], function(rias, PopupMenuItem, MenuBarItem) {

	//rias.theme.loadThemeCss([
	//	"riasw/widget/Menu.css"
	//]);

	var riaswType = "rias.riasw.widget.PopupMenuBarItem";
	var Widget = rias.declare(riaswType, [PopupMenuItem, MenuBarItem], {
		// summary:
		//		Item in a MenuBar like "File" or "Edit", that spawns a submenu when pressed (or hovered)
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswPopupMenuBarItemIcon",
		iconClass16: "riaswPopupMenuBarItemIcon16",
		defaultParams: {
			//content: "<span></span>",
			//label: "Menu"
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