//>>built

define("dojox/mobile/Pane", ["dojo/_base/array", "dojo/_base/declare", "dijit/_Contained", "dijit/_WidgetBase"], function (array, declare, Contained, WidgetBase) {
    return declare("dojox.mobile.Pane", [WidgetBase, Contained], {baseClass:"mblPane", buildRendering:function () {
        this.inherited(arguments);
        if (!this.containerNode) {
            this.containerNode = this.domNode;
        }
    }, resize:function () {
        array.forEach(this.getChildren(), function (child) {
            if (child.resize) {
                child.resize();
            }
        });
    }});
});

