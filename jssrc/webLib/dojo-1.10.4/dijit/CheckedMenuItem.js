//>>built

require({cache:{"url:dijit/templates/CheckedMenuItem.html":"<tr class=\"dijitReset\" data-dojo-attach-point=\"focusNode\" role=\"${role}\" tabIndex=\"-1\" aria-checked=\"${checked}\">\n\t<td class=\"dijitReset dijitMenuItemIconCell\" role=\"presentation\">\n\t\t<span class=\"dijitInline dijitIcon dijitMenuItemIcon dijitCheckedMenuItemIcon\" data-dojo-attach-point=\"iconNode\"></span>\n\t\t<span class=\"dijitMenuItemIconChar dijitCheckedMenuItemIconChar\">${!checkedChar}</span>\n\t</td>\n\t<td class=\"dijitReset dijitMenuItemLabel\" colspan=\"2\" data-dojo-attach-point=\"containerNode,labelNode,textDirNode\"></td>\n\t<td class=\"dijitReset dijitMenuItemAccelKey\" style=\"display: none\" data-dojo-attach-point=\"accelKeyNode\"></td>\n\t<td class=\"dijitReset dijitMenuArrowCell\" role=\"presentation\">&#160;</td>\n</tr>\n"}});
define("dijit/CheckedMenuItem", ["dojo/_base/declare", "dojo/dom-class", "./MenuItem", "dojo/text!./templates/CheckedMenuItem.html", "./hccss"], function (declare, domClass, MenuItem, template) {
    return declare("dijit.CheckedMenuItem", MenuItem, {baseClass:"dijitMenuItem dijitCheckedMenuItem", templateString:template, checked:false, _setCheckedAttr:function (checked) {
        this.domNode.setAttribute("aria-checked", checked ? "true" : "false");
        this._set("checked", checked);
    }, iconClass:"", role:"menuitemcheckbox", checkedChar:"&#10003;", onChange:function () {
    }, _onClick:function (evt) {
        if (!this.disabled) {
            this.set("checked", !this.checked);
            this.onChange(this.checked);
        }
        this.onClick(evt);
    }});
});

