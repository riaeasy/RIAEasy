//>>built

define("dojox/mvc/Group", ["dojo/_base/declare", "dijit/_WidgetBase", "dojo/_base/lang"], function (declare, _WidgetBase, lang) {
    return declare("dojox.mvc.Group", _WidgetBase, {target:null, startup:function () {
        var parent = null;
        if (lang.isFunction(this.getParent)) {
            if (this.getParent() && this.getParent().removeRepeatNode) {
                this.select = this.getParent().select;
                this.onCheckStateChanged = this.getParent().onCheckStateChanged;
            }
        }
        this.inherited(arguments);
    }, _setTargetAttr:function (value) {
        this._set("target", value);
        if (this.binding != value) {
            this.set("ref", value);
        }
    }});
});

