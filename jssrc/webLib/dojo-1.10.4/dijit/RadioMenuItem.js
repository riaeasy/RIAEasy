//>>built

define("dijit/RadioMenuItem", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom-class", "dojo/query!css2", "./CheckedMenuItem", "./registry"], function (array, declare, domClass, query, CheckedMenuItem, registry) {
    return declare("dijit.RadioButtonMenuItem", CheckedMenuItem, {baseClass:"dijitMenuItem dijitRadioMenuItem", role:"menuitemradio", checkedChar:"*", group:"", _setGroupAttr:"domNode", _setCheckedAttr:function (checked) {
        this.inherited(arguments);
        if (!this._created) {
            return;
        }
        if (checked && this.group) {
            array.forEach(this._getRelatedWidgets(), function (widget) {
                if (widget != this && widget.checked) {
                    widget.set("checked", false);
                }
            }, this);
        }
    }, _onClick:function (evt) {
        if (!this.disabled && !this.checked) {
            this.set("checked", true);
            this.onChange(true);
        }
        this.onClick(evt);
    }, _getRelatedWidgets:function () {
        var ary = [];
        query("[group=" + this.group + "][role=" + this.role + "]").forEach(function (menuItemNode) {
            var widget = registry.getEnclosingWidget(menuItemNode);
            if (widget) {
                ary.push(widget);
            }
        });
        return ary;
    }});
});

