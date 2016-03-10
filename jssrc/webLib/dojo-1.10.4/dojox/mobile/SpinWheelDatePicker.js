//>>built

define("dojox/mobile/SpinWheelDatePicker", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom-class", "./_DatePickerMixin", "./SpinWheel", "./SpinWheelSlot"], function (array, declare, domClass, DatePickerMixin, SpinWheel, SpinWheelSlot) {
    return declare("dojox.mobile.SpinWheelDatePicker", [SpinWheel, DatePickerMixin], {slotClasses:[SpinWheelSlot, SpinWheelSlot, SpinWheelSlot], slotProps:[{labelFrom:1970, labelTo:2038}, {}, {}], buildRendering:function () {
        this.initSlots();
        this.inherited(arguments);
        domClass.add(this.domNode, "mblSpinWheelDatePicker");
        this._conn = [this.connect(this.slots[0], "onFlickAnimationEnd", "_onYearSet"), this.connect(this.slots[1], "onFlickAnimationEnd", "_onMonthSet"), this.connect(this.slots[2], "onFlickAnimationEnd", "_onDaySet")];
    }, disableValues:function (daysInMonth) {
        array.forEach(this.slots[2].panelNodes, function (panel) {
            for (var i = 27; i < 31; i++) {
                domClass.toggle(panel.childNodes[i], "mblSpinWheelSlotLabelGray", i >= daysInMonth);
            }
        });
    }});
});

