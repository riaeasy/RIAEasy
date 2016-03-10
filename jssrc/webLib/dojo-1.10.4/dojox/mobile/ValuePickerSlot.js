//>>built

define("dojox/mobile/ValuePickerSlot", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/event", "dojo/_base/lang", "dojo/_base/window", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-attr", "dojo/touch", "dijit/_WidgetBase", "./iconUtils", "dojo/has", "require"], function (array, declare, event, lang, win, domClass, domConstruct, domAttr, touch, WidgetBase, iconUtils, has, BidiValuePickerSlot) {
    var ValuePickerSlot = declare(0 ? "dojox.mobile.NonBidiValuePickerSlot" : "dojox.mobile.ValuePickerSlot", WidgetBase, {items:[], labels:[], labelFrom:0, labelTo:0, zeroPad:0, value:"", step:1, readOnly:false, tabIndex:"0", plusBtnLabel:"", plusBtnLabelRef:"", minusBtnLabel:"", minusBtnLabelRef:"", baseClass:"mblValuePickerSlot", buildRendering:function () {
        this.inherited(arguments);
        this.initLabels();
        if (this.labels.length > 0) {
            this.items = [];
            for (var i = 0; i < this.labels.length; i++) {
                this.items.push([i, this.labels[i]]);
            }
        }
        this.plusBtnNode = domConstruct.create("div", {className:"mblValuePickerSlotPlusButton mblValuePickerSlotButton", title:"+"}, this.domNode);
        this.plusIconNode = domConstruct.create("div", {className:"mblValuePickerSlotIcon"}, this.plusBtnNode);
        iconUtils.createIcon("mblDomButtonGrayPlus", null, this.plusIconNode);
        this.inputAreaNode = domConstruct.create("div", {className:"mblValuePickerSlotInputArea"}, this.domNode);
        this.inputNode = domConstruct.create("input", {className:"mblValuePickerSlotInput", readonly:this.readOnly}, this.inputAreaNode);
        this.minusBtnNode = domConstruct.create("div", {className:"mblValuePickerSlotMinusButton mblValuePickerSlotButton", title:"-"}, this.domNode);
        this.minusIconNode = domConstruct.create("div", {className:"mblValuePickerSlotIcon"}, this.minusBtnNode);
        iconUtils.createIcon("mblDomButtonGrayMinus", null, this.minusIconNode);
        domAttr.set(this.plusBtnNode, "role", "button");
        this._setPlusBtnLabelAttr(this.plusBtnLabel);
        this._setPlusBtnLabelRefAttr(this.plusBtnLabelRef);
        domAttr.set(this.inputNode, "role", "textbox");
        var registry = require("dijit/registry");
        var inputAreaNodeId = registry.getUniqueId("dojo_mobile__mblValuePickerSlotInput");
        domAttr.set(this.inputNode, "id", inputAreaNodeId);
        domAttr.set(this.plusBtnNode, "aria-controls", inputAreaNodeId);
        domAttr.set(this.minusBtnNode, "role", "button");
        domAttr.set(this.minusBtnNode, "aria-controls", inputAreaNodeId);
        this._setMinusBtnLabelAttr(this.minusBtnLabel);
        this._setMinusBtnLabelRefAttr(this.minusBtnLabelRef);
        if (this.value === "" && this.items.length > 0) {
            this.value = this.items[0][1];
        }
        this._initialValue = this.value;
    }, startup:function () {
        if (this._started) {
            return;
        }
        this._handlers = [this.connect(this.plusBtnNode, touch.press, "_onTouchStart"), this.connect(this.minusBtnNode, touch.press, "_onTouchStart"), this.connect(this.plusBtnNode, "onkeydown", "_onClick"), this.connect(this.minusBtnNode, "onkeydown", "_onClick"), this.connect(this.inputNode, "onchange", lang.hitch(this, function (e) {
            this._onChange(e);
        }))];
        this.inherited(arguments);
        this._set(this.plusBtnLabel);
    }, initLabels:function () {
        if (this.labelFrom !== this.labelTo) {
            var a = this.labels = [], zeros = this.zeroPad && Array(this.zeroPad).join("0");
            for (var i = this.labelFrom; i <= this.labelTo; i += this.step) {
                a.push(this.zeroPad ? (zeros + i).slice(-this.zeroPad) : i + "");
            }
        }
    }, spin:function (steps) {
        var pos = -1, v = this.get("value"), len = this.items.length;
        for (var i = 0; i < len; i++) {
            if (this.items[i][1] === v) {
                pos = i;
                break;
            }
        }
        if (v == -1) {
            return;
        }
        pos += steps;
        if (pos < 0) {
            pos += (Math.abs(Math.ceil(pos / len)) + 1) * len;
        }
        var newItem = this.items[pos % len];
        this.set("value", newItem[1]);
    }, setInitialValue:function () {
        this.set("value", this._initialValue);
    }, _onClick:function (e) {
        if (e && e.type === "keydown" && e.keyCode !== 13) {
            return;
        }
        if (this.onClick(e) === false) {
            return;
        }
        var node = e.currentTarget;
        if (node === this.plusBtnNode || node === this.minusBtnNode) {
            this._btn = node;
        }
        this.spin(this._btn === this.plusBtnNode ? 1 : -1);
    }, onClick:function () {
    }, _onChange:function (e) {
        if (this.onChange(e) === false) {
            return;
        }
        var v = this.get("value"), a = this.validate(v);
        this.set("value", a.length ? a[0][1] : this.value);
    }, onChange:function () {
    }, validate:function (value) {
        return array.filter(this.items, function (a) {
            return (a[1] + "").toLowerCase() == (value + "").toLowerCase();
        });
    }, _onTouchStart:function (e) {
        this._conn = [this.connect(win.body(), touch.move, "_onTouchMove"), this.connect(win.body(), touch.release, "_onTouchEnd")];
        this.touchStartX = e.touches ? e.touches[0].pageX : e.clientX;
        this.touchStartY = e.touches ? e.touches[0].pageY : e.clientY;
        domClass.add(e.currentTarget, "mblValuePickerSlotButtonSelected");
        this._btn = e.currentTarget;
        if (this._timer) {
            this._timer.remove();
            this._timer = null;
        }
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
        this._timer = this.defer(function () {
            this._interval = setInterval(lang.hitch(this, function () {
                this.spin(this._btn === this.plusBtnNode ? 1 : -1);
            }), 60);
            this._timer = null;
        }, 1000);
        event.stop(e);
    }, _onTouchMove:function (e) {
        var x = e.touches ? e.touches[0].pageX : e.clientX;
        var y = e.touches ? e.touches[0].pageY : e.clientY;
        if (Math.abs(x - this.touchStartX) >= 4 || Math.abs(y - this.touchStartY) >= 4) {
            if (this._timer) {
                this._timer.remove();
                this._timer = null;
            }
            if (this._interval) {
                clearInterval(this._interval);
                this._interval = null;
            }
            array.forEach(this._conn, this.disconnect, this);
            domClass.remove(this._btn, "mblValuePickerSlotButtonSelected");
        }
    }, _onTouchEnd:function (e) {
        if (this._timer) {
            this._timer.remove();
            this._timer = null;
        }
        array.forEach(this._conn, this.disconnect, this);
        domClass.remove(this._btn, "mblValuePickerSlotButtonSelected");
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        } else {
            this._onClick(e);
        }
    }, _getKeyAttr:function () {
        var val = this.get("value");
        var item = array.filter(this.items, function (item) {
            return item[1] === val;
        })[0];
        return item ? item[0] : null;
    }, _getValueAttr:function () {
        return this.inputNode.value;
    }, _setValueAttr:function (value) {
        this._spinToValue(value, true);
    }, _spinToValue:function (value, applyValue) {
        if (this.get("value") == value) {
            return;
        }
        this.inputNode.value = value;
        if (applyValue) {
            this._set("value", value);
        }
        var parent = this.getParent();
        if (parent && parent.onValueChanged) {
            parent.onValueChanged(this);
        }
    }, _setTabIndexAttr:function (tabIndex) {
        this.plusBtnNode.setAttribute("tabIndex", tabIndex);
        this.minusBtnNode.setAttribute("tabIndex", tabIndex);
    }, _setAria:function (node, attr, value) {
        if (value) {
            domAttr.set(node, attr, value);
        } else {
            domAttr.remove(node, attr);
        }
    }, _setPlusBtnLabelAttr:function (plusBtnLabel) {
        this._setAria(this.plusBtnNode, "aria-label", plusBtnLabel);
    }, _setPlusBtnLabelRefAttr:function (plusBtnLabelRef) {
        this._setAria(this.plusBtnNode, "aria-labelledby", plusBtnLabelRef);
    }, _setMinusBtnLabelAttr:function (minusBtnLabel) {
        this._setAria(this.minusBtnNode, "aria-label", minusBtnLabel);
    }, _setMinusBtnLabelRefAttr:function (minusBtnLabelRef) {
        this._setAria(this.minusBtnNode, "aria-labelledby", minusBtnLabelRef);
    }});
    return 0 ? declare("dojox.mobile.ValuePickerSlot", [ValuePickerSlot, BidiValuePickerSlot]) : ValuePickerSlot;
});

