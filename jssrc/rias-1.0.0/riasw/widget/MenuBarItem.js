//RIAStudio client runtime widget - MenuBarItem

define([
	"rias",
	"rias/riasw/widget/MenuItem"
], function(rias, MenuItem) {

	var _MenuBarItemMixin = rias.declare("rias.riasw.widget._MenuBarItemMixin", null, {
		templateString:
			'<div class="dijitReset dijitInline dijitMenuItem dijitMenuItemLabel" data-dojo-attach-point="focusNode" role="menuitem" tabIndex="-1">' +
				'<span data-dojo-attach-point="containerNode,textDirNode"></span>' +
			'</div>',

		// Map widget attributes to DOMNode attributes.
		_setIconClassAttr: null	// cancel MenuItem setter because we don't have a place for an icon
	});

	//rias.theme.loadThemeCss([
	//	"riasw/widget/Menu.css"
	//]);

	var riaswType = "rias.riasw.widget.MenuBarItem";
	var Widget = rias.declare(riaswType, [MenuItem, _MenuBarItemMixin], {
		// summary:
		//		Item in a MenuBar that's clickable, and doesn't spawn a submenu when pressed (or hovered)
	});
	Widget._MenuBarItemMixin = _MenuBarItemMixin;	// dojox.mobile is accessing this

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswMenuBarItemIcon",
		iconClass16: "riaswMenuBarItemIcon16",
		defaultParams: {
			//content: "<span></span>",
			//label: "MenuBarItem"
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