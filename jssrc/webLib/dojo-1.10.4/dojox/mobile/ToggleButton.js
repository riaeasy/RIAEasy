//>>built

define("dojox/mobile/ToggleButton", ["dojo/_base/declare", "dojo/dom-class", "dijit/form/_ToggleButtonMixin", "./Button"], function (declare, domClass, ToggleButtonMixin, Button) {
    return declare("dojox.mobile.ToggleButton", [Button, ToggleButtonMixin], {baseClass:"mblToggleButton", _setCheckedAttr:function () {
        this.inherited(arguments);
        var newStateClasses = (this.baseClass + " " + this["class"]).replace(/(\S+)\s*/g, "$1Checked ").split(" ");
        domClass[this.checked ? "add" : "remove"](this.focusNode || this.domNode, newStateClasses);
    }});
});

