//>>built

define("dojox/mobile/ValuePickerTimePicker", ["dojo/_base/declare", "dojo/dom-class", "./_TimePickerMixin", "./ToolBarButton", "./ValuePicker", "./ValuePickerSlot"], function (declare, domClass, TimePickerMixin, ToolBarButton, ValuePicker, ValuePickerSlot) {
    return declare("dojox.mobile.ValuePickerTimePicker", [ValuePicker, TimePickerMixin], {readOnly:false, is24h:false, hourPlusBtnLabel:"", hourPlusBtnLabelRef:"", minutePlusBtnLabel:"", minutePlusBtnLabelRef:"", hourMinusBtnLabel:"", hourMinusBtnLabelRef:"", minuteMinusBtnLabel:"", minuteMinusBtnLabelRef:"", slotClasses:[ValuePickerSlot, ValuePickerSlot], slotProps:[{labelFrom:0, labelTo:23, style:{width:"72px"}}, {labelFrom:0, labelTo:59, zeroPad:2, style:{width:"72px"}}], buildRendering:function () {
        var p = this.slotProps;
        p[0].readOnly = p[1].readOnly = this.readOnly;
        this._setBtnLabels(p);
        this.inherited(arguments);
        var items = this.slots[0].items;
        this._zero = items.slice(0, 1);
        this._pm = items.slice(13);
        domClass.add(this.domNode, "mblValuePickerTimePicker");
        domClass.add(this.slots[0].domNode, "mblValuePickerTimePickerHourSlot");
        domClass.add(this.slots[1].domNode, "mblValuePickerTimePickerMinuteSlot");
        this.ampmButton = new ToolBarButton();
        this.addChild(this.ampmButton);
        this._conn = [this.connect(this.ampmButton, "onClick", "onBtnClick")];
        this.set("is24h", this.is24h);
    }, to12h:function (a) {
        var h = a[0] - 0;
        var ampm = h < 12 ? "AM" : "PM";
        if (h == 0) {
            h = 12;
        } else {
            if (h > 12) {
                h = h - 12;
            }
        }
        return [h + "", a[1], ampm];
    }, to24h:function (a) {
        var h = a[0] - 0;
        if (a[2] == "AM") {
            h = h == 12 ? 0 : h;
        } else {
            h = h == 12 ? h : h + 12;
        }
        return [h + "", a[1]];
    }, onBtnClick:function () {
        var ampm = this.ampmButton.get("label") == "AM" ? "PM" : "AM";
        var v = this.get("values12");
        v[2] = ampm;
        this.set("values12", v);
        if (this.onValueChanged) {
            this.onValueChanged(this.slots[0]);
        }
    }, _setIs24hAttr:function (is24h) {
        var items = this.slots[0].items;
        if (is24h && items.length != 24) {
            this.slots[0].items = this._zero.concat(items).concat(this._pm);
        } else {
            if (!is24h && items.length != 12) {
                items.splice(0, 1);
                items.splice(12);
            }
        }
        var v = this.get("values");
        this._set("is24h", is24h);
        this.ampmButton.domNode.style.display = is24h ? "none" : "";
        this.set("values", v);
    }, _getValuesAttr:function () {
        var v = this.inherited(arguments);
        return this.is24h ? v : this.to24h([v[0], v[1], this.ampmButton.get("label")]);
    }, _setValuesAttr:function (values) {
        if (this.is24h) {
            this.inherited(arguments);
        } else {
            values = this.to12h(values);
            this.ampmButton.set("label", values[2]);
            this.inherited(arguments);
        }
    }, _getValues12Attr:function () {
        return this.to12h(this._getValuesAttr());
    }, _setValues12Attr:function (values) {
        this.set("values", this.to24h(values));
    }, _setBtnLabels:function (slotProps) {
        slotProps[0].plusBtnLabel = this.hourPlusBtnLabel;
        slotProps[0].plusBtnLabelRef = this.hourPlusBtnLabelRef;
        slotProps[0].minusBtnLabel = this.hourMinusBtnLabel;
        slotProps[0].minusBtnLabelRef = this.hourMinusBtnLabelRef;
        slotProps[1].plusBtnLabel = this.minutePlusBtnLabel;
        slotProps[1].plusBtnLabelRef = this.minutePlusBtnLabelRef;
        slotProps[1].minusBtnLabel = this.minuteMinusBtnLabel;
        slotProps[1].minusBtnLabelRef = this.minuteMinusBtnLabelRef;
    }});
});

