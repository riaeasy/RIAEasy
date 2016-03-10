//>>built

define("dojox/mobile/SpinWheelTimePicker", ["dojo/_base/declare", "dojo/dom-class", "./_TimePickerMixin", "./SpinWheel", "./SpinWheelSlot"], function (declare, domClass, TimePickerMixin, SpinWheel, SpinWheelSlot) {
    return declare("dojox.mobile.SpinWheelTimePicker", [SpinWheel, TimePickerMixin], {slotClasses:[SpinWheelSlot, SpinWheelSlot], slotProps:[{labelFrom:0, labelTo:23, style:{width:"50px", textAlign:"right"}}, {labelFrom:0, labelTo:59, zeroPad:2, style:{width:"40px", textAlign:"right"}}], buildRendering:function () {
        this.inherited(arguments);
        domClass.add(this.domNode, "mblSpinWheelTimePicker");
    }});
});

