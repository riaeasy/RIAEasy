//>>built

require({cache:{"url:dijit/templates/Menu.html":"<table class=\"dijit dijitMenu dijitMenuPassive dijitReset dijitMenuTable\" role=\"menu\" tabIndex=\"${tabIndex}\"\n\t   cellspacing=\"0\">\n\t<tbody class=\"dijitReset\" data-dojo-attach-point=\"containerNode\"></tbody>\n</table>\n"}});
define("dijit/DropDownMenu", ["dojo/_base/declare", "dojo/keys", "dojo/text!./templates/Menu.html", "./_MenuBase"], function (declare, keys, template, _MenuBase) {
    return declare("dijit.DropDownMenu", _MenuBase, {templateString:template, baseClass:"dijitMenu", _onUpArrow:function () {
        this.focusPrev();
    }, _onDownArrow:function () {
        this.focusNext();
    }, _onRightArrow:function (evt) {
        this._moveToPopup(evt);
        evt.stopPropagation();
        evt.preventDefault();
    }, _onLeftArrow:function (evt) {
        if (this.parentMenu) {
            if (this.parentMenu._isMenuBar) {
                this.parentMenu.focusPrev();
            } else {
                this.onCancel(false);
            }
        } else {
            evt.stopPropagation();
            evt.preventDefault();
        }
    }});
});

