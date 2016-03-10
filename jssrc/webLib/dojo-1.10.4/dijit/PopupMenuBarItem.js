//>>built

define("dijit/PopupMenuBarItem", ["dojo/_base/declare", "./PopupMenuItem", "./MenuBarItem"], function (declare, PopupMenuItem, MenuBarItem) {
    var _MenuBarItemMixin = MenuBarItem._MenuBarItemMixin;
    return declare("dijit.PopupMenuBarItem", [PopupMenuItem, _MenuBarItemMixin], {});
});

