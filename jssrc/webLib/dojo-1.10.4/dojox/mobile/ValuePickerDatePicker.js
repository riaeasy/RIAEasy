//>>built

define("dojox/mobile/ValuePickerDatePicker", ["dojo/_base/declare", "dojo/dom-class", "dojo/dom-attr", "./_DatePickerMixin", "./ValuePicker", "./ValuePickerSlot"], function (declare, domClass, domAttr, DatePickerMixin, ValuePicker, ValuePickerSlot) {
    return declare("dojox.mobile.ValuePickerDatePicker", [ValuePicker, DatePickerMixin], {readOnly:false, yearPlusBtnLabel:"", yearPlusBtnLabelRef:"", yearMinusBtnLabel:"", yearMinusBtnLabelRef:"", monthPlusBtnLabel:"", monthPlusBtnLabelRef:"", monthMinusBtnLabel:"", monthMinusBtnLabelRef:"", dayPlusBtnLabel:"", dayPlusBtnLabelRef:"", dayMinusBtnLabel:"", dayMinusBtnLabelRef:"", slotClasses:[ValuePickerSlot, ValuePickerSlot, ValuePickerSlot], slotProps:[{labelFrom:1970, labelTo:2038, style:{width:"87px"}}, {style:{width:"72px"}}, {style:{width:"72px"}}], buildRendering:function () {
        var p = this.slotProps;
        p[0].readOnly = p[1].readOnly = p[2].readOnly = this.readOnly;
        this._setBtnLabels(p);
        this.initSlots();
        this.inherited(arguments);
        domClass.add(this.domNode, "mblValuePickerDatePicker");
        this._conn = [this.connect(this.slots[0], "_spinToValue", "_onYearSet"), this.connect(this.slots[1], "_spinToValue", "_onMonthSet"), this.connect(this.slots[2], "_spinToValue", "_onDaySet")];
    }, disableValues:function (daysInMonth) {
        var items = this.slots[2].items;
        if (this._tail) {
            this.slots[2].items = items = items.concat(this._tail);
        }
        this._tail = items.slice(daysInMonth);
        items.splice(daysInMonth);
    }, _setBtnLabels:function (slotProps) {
        slotProps[0].plusBtnLabel = this.yearPlusBtnLabel;
        slotProps[0].plusBtnLabelRef = this.yearPlusBtnLabelRef;
        slotProps[0].minusBtnLabel = this.yearMinusBtnLabel;
        slotProps[0].minusBtnLabelRef = this.yearMinusBtnLabelRef;
        slotProps[1].plusBtnLabel = this.monthPlusBtnLabel;
        slotProps[1].plusBtnLabelRef = this.monthPlusBtnLabelRef;
        slotProps[1].minusBtnLabel = this.monthMinusBtnLabel;
        slotProps[1].minusBtnLabelRef = this.monthMinusBtnLabelRef;
        slotProps[2].plusBtnLabel = this.dayPlusBtnLabel;
        slotProps[2].plusBtnLabelRef = this.dayPlusBtnLabelRef;
        slotProps[2].minusBtnLabel = this.dayMinusBtnLabel;
        slotProps[2].minusBtnLabelRef = this.dayMinusBtnLabelRef;
    }});
});

