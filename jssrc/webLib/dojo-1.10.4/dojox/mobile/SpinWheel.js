//>>built

define("dojox/mobile/SpinWheel", ["dojo/_base/declare", "dojo/_base/array", "dojo/dom-construct", "./_PickerBase", "./SpinWheelSlot"], function (declare, array, domConstruct, PickerBase) {
    return declare("dojox.mobile.SpinWheel", PickerBase, {baseClass:"mblSpinWheel", buildRendering:function () {
        this.inherited(arguments);
        domConstruct.create("div", {className:"mblSpinWheelBar"}, this.domNode);
    }, startup:function () {
        if (this._started) {
            return;
        }
        this.centerPos = Math.round(this.domNode.offsetHeight / 2);
        this.inherited(arguments);
    }, resize:function () {
        this.centerPos = Math.round(this.domNode.offsetHeight / 2);
        array.forEach(this.getChildren(), function (child) {
            child.resize && child.resize();
        });
    }, addChild:function (widget, insertIndex) {
        this.inherited(arguments);
        if (this._started) {
            widget.setInitialValue();
        }
    }});
});

