//>>built

define("dojox/mobile/FormLayout", ["dojo/_base/declare", "dojo/dom-class", "./Container", "dojo/has", "require"], function (declare, domClass, Container, has, BidiFormLayout) {
    var FormLayout = declare(0 ? "dojox.mobile.NonBidiFormLayout" : "dojox.mobile.FormLayout", Container, {columns:"auto", rightAlign:false, baseClass:"mblFormLayout", buildRendering:function () {
        this.inherited(arguments);
        if (this.columns == "auto") {
            domClass.add(this.domNode, "mblFormLayoutAuto");
        } else {
            if (this.columns == "single") {
                domClass.add(this.domNode, "mblFormLayoutSingleCol");
            } else {
                if (this.columns == "two") {
                    domClass.add(this.domNode, "mblFormLayoutTwoCol");
                }
            }
        }
        if (this.rightAlign) {
            domClass.add(this.domNode, "mblFormLayoutRightAlign");
        }
    }});
    return 0 ? declare("dojox.mobile.FormLayout", [FormLayout, BidiFormLayout]) : FormLayout;
});

