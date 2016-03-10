//>>built

define("dojox/mobile/_PickerBase", ["dojo/_base/array", "dojo/_base/declare", "dijit/_Contained", "dijit/_Container", "dijit/_WidgetBase", "dojo/has", "require"], function (array, declare, Contained, Container, WidgetBase, has, _BidiPickerBase) {
    var _PickerBase = declare(0 ? "dojox.mobile.NonBidi_PickerBase" : "dojox.mobile._PickerBase", [WidgetBase, Container, Contained], {slotClasses:[], slotProps:[], slotOrder:[], buildRendering:function () {
        this.inherited(arguments);
        this.slots = [];
        for (var i = 0; i < this.slotClasses.length; i++) {
            var idx = this.slotOrder.length ? this.slotOrder[i] : i;
            var slot = new this.slotClasses[idx](this.slotProps[idx]);
            this.addChild(slot);
            this.slots[idx] = slot;
        }
    }, startup:function () {
        if (this._started) {
            return;
        }
        this._duringStartup = true;
        this.inherited(arguments);
        this.reset();
        delete this._duringStartup;
    }, getSlots:function () {
        return this.slots.length ? this.slots : array.filter(this.getChildren(), function (c) {
            return c.declaredClass.indexOf("Slot") !== -1;
        });
    }, _getValuesAttr:function () {
        return array.map(this.getSlots(), function (w) {
            return w.get("value");
        });
    }, _setValuesAttr:function (a) {
        array.forEach(this.getSlots(), function (w, i) {
            w.set("value", a[i]);
        });
    }, _setColorsAttr:function (a) {
        array.forEach(this.getSlots(), function (w, i) {
            w.setColor && w.setColor(a[i]);
        });
    }, reset:function () {
        array.forEach(this.getSlots(), function (w) {
            w.setInitialValue();
        });
    }});
    return 0 ? declare("dojox.mobile._PickerBase", [_PickerBase, _BidiPickerBase]) : _PickerBase;
});

