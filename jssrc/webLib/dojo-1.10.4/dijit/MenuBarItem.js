//>>built

require({cache:{"url:dijit/templates/MenuBarItem.html":"<div class=\"dijitReset dijitInline dijitMenuItem dijitMenuItemLabel\" data-dojo-attach-point=\"focusNode\"\n\t \trole=\"menuitem\" tabIndex=\"-1\">\n\t<span data-dojo-attach-point=\"containerNode,textDirNode\"></span>\n</div>\n"}});
define("dijit/MenuBarItem", ["dojo/_base/declare", "./MenuItem", "dojo/text!./templates/MenuBarItem.html"], function (declare, MenuItem, template) {
    var _MenuBarItemMixin = declare("dijit._MenuBarItemMixin", null, {templateString:template, _setIconClassAttr:null});
    var MenuBarItem = declare("dijit.MenuBarItem", [MenuItem, _MenuBarItemMixin], {});
    MenuBarItem._MenuBarItemMixin = _MenuBarItemMixin;
    return MenuBarItem;
});

