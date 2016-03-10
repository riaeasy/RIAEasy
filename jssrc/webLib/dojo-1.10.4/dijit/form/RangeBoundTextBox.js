//>>built

define("dijit/form/RangeBoundTextBox", ["dojo/_base/declare", "dojo/i18n", "./MappedTextBox", "dojo/i18n!./nls/validate"], function (declare, i18n, MappedTextBox) {
    var RangeBoundTextBox = declare("dijit.form.RangeBoundTextBox", MappedTextBox, {rangeMessage:"", rangeCheck:function (primitive, constraints) {
        return ("min" in constraints ? (this.compare(primitive, constraints.min) >= 0) : true) && ("max" in constraints ? (this.compare(primitive, constraints.max) <= 0) : true);
    }, isInRange:function () {
        return this.rangeCheck(this.get("value"), this.constraints);
    }, _isDefinitelyOutOfRange:function () {
        var val = this.get("value");
        if (val == null) {
            return false;
        }
        var outOfRange = false;
        if ("min" in this.constraints) {
            var min = this.constraints.min;
            outOfRange = this.compare(val, ((typeof min == "number") && min >= 0 && val != 0) ? 0 : min) < 0;
        }
        if (!outOfRange && ("max" in this.constraints)) {
            var max = this.constraints.max;
            outOfRange = this.compare(val, ((typeof max != "number") || max > 0) ? max : 0) > 0;
        }
        return outOfRange;
    }, _isValidSubset:function () {
        return this.inherited(arguments) && !this._isDefinitelyOutOfRange();
    }, isValid:function (isFocused) {
        return this.inherited(arguments) && ((this._isEmpty(this.textbox.value) && !this.required) || this.isInRange(isFocused));
    }, getErrorMessage:function (isFocused) {
        var v = this.get("value");
        if (v != null && v !== "" && (typeof v != "number" || !isNaN(v)) && !this.isInRange(isFocused)) {
            return this.rangeMessage;
        }
        return this.inherited(arguments);
    }, postMixInProperties:function () {
        this.inherited(arguments);
        if (!this.rangeMessage) {
            this.messages = i18n.getLocalization("dijit.form", "validate", this.lang);
            this.rangeMessage = this.messages.rangeMessage;
        }
    }});
    return RangeBoundTextBox;
});

