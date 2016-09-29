//RIAStudio client runtime widget - PopupMenuBarItem

define([
	"rias",
	"dijit/PopupMenuBarItem"
], function(rias, _Widget) {

	//rias.theme.loadThemeCss([
	//	"riasw/widget/Menu.css"
	//]);

	var riaswType = "rias.riasw.widget.PopupMenuBarItem";
	var Widget = rias.declare(riaswType, [_Widget], {
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