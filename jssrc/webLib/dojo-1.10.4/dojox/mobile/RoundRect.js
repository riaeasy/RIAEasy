//>>built

define("dojox/mobile/RoundRect", ["dojo/_base/declare", "dojo/dom-class", "./Container"], function (declare, domClass, Container) {
    return declare("dojox.mobile.RoundRect", Container, {shadow:false, baseClass:"mblRoundRect", buildRendering:function () {
        this.inherited(arguments);
        if (this.shadow) {
            domClass.add(this.domNode, "mblShadow");
        }
    }});
});

