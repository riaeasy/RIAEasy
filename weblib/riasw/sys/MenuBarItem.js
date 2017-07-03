//RIAStudio client runtime widget - MenuBarItem

define([
	"riasw/riaswBase",
	"riasw/sys/MenuItem"
], function(rias, MenuItem) {

	var _MenuBarItemMixin = rias.declare("riasw.sys._MenuBarItemMixin", null, {
		templateString:
			'<div class="dijitReset dijitInline riaswMenuItem riaswMenuItemLabel" data-dojo-attach-point="focusNode" role="menuitem" tabIndex="-1">' +
				'<span data-dojo-attach-point="containerNode,textDirNode"></span>' +
			'</div>',

		// Map widget attributes to DOMNode attributes.
		_setIconClassAttr: null	// cancel MenuItem setter because we don't have a place for an icon
	});

	//rias.theme.loadThemeCss([
	//	"riasw/sys/Menu.css"
	//]);

	var riaswType = "riasw.sys.MenuBarItem";
	var Widget = rias.declare(riaswType, [MenuItem, _MenuBarItemMixin], {
		// summary:
		//		Item in a MenuBar that's clickable, and doesn't spawn a submenu when pressed (or hovered)
	});
	Widget._MenuBarItemMixin = _MenuBarItemMixin;	// dojox.mobile is accessing this

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