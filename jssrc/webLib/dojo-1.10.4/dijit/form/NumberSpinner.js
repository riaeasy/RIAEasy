//>>built

define("dijit/form/NumberSpinner", ["dojo/_base/declare", "dojo/keys", "./_Spinner", "./NumberTextBox"], function (declare, keys, _Spinner, NumberTextBox) {
    return declare("dijit.form.NumberSpinner", [_Spinner, NumberTextBox.Mixin], {baseClass:"dijitTextBox dijitSpinner dijitNumberTextBox", adjust:function (val, delta) {
        var tc = this.constraints, v = isNaN(val), gotMax = !isNaN(tc.max), gotMin = !isNaN(tc.min);
        if (v && delta != 0) {
            val = (delta > 0) ? gotMin ? tc.min : gotMax ? tc.max : 0 : gotMax ? this.constraints.max : gotMin ? tc.min : 0;
        }
        var newval = val + delta;
        if (v || isNaN(newval)) {
            return val;
        }
        if (gotMax && (newval > tc.max)) {
            newval = tc.max;
        }
        if (gotMin && (newval < tc.min)) {
            newval = tc.min;
        }
        return newval;
    }, _onKeyDown:function (e) {
        if (this.disabled || this.readOnly) {
            return;
        }
        if ((e.keyCode == keys.HOME || e.keyCode == keys.END) && !(e.ctrlKey || e.altKey || e.metaKey) && typeof this.get("value") != "undefined") {
            var value = this.constraints[(e.keyCode == keys.HOME ? "min" : "max")];
            if (typeof value == "number") {
                this._setValueAttr(value, false);
            }
            e.stopPropagation();
            e.preventDefault();
        }
    }});
});

