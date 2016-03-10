//>>built

require({cache:{"url:dijit/templates/MenuSeparator.html":"<tr class=\"dijitMenuSeparator\" role=\"separator\">\n\t<td class=\"dijitMenuSeparatorIconCell\">\n\t\t<div class=\"dijitMenuSeparatorTop\"></div>\n\t\t<div class=\"dijitMenuSeparatorBottom\"></div>\n\t</td>\n\t<td colspan=\"3\" class=\"dijitMenuSeparatorLabelCell\">\n\t\t<div class=\"dijitMenuSeparatorTop dijitMenuSeparatorLabel\"></div>\n\t\t<div class=\"dijitMenuSeparatorBottom\"></div>\n\t</td>\n</tr>\n"}});
define("dijit/MenuSeparator", ["dojo/_base/declare", "dojo/dom", "./_WidgetBase", "./_TemplatedMixin", "./_Contained", "dojo/text!./templates/MenuSeparator.html"], function (declare, dom, _WidgetBase, _TemplatedMixin, _Contained, template) {
    return declare("dijit.MenuSeparator", [_WidgetBase, _TemplatedMixin, _Contained], {templateString:template, buildRendering:function () {
        this.inherited(arguments);
        dom.setSelectable(this.domNode, false);
    }, isFocusable:function () {
        return false;
    }});
});

