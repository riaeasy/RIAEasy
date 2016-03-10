//>>built

define("dojox/form/YearTextBox", ["dojo/_base/kernel", "dojo/_base/lang", "dojox/widget/YearlyCalendar", "dijit/form/TextBox", "./DateTextBox", "dojo/_base/declare"], function (kernel, lang, YearlyCalendar, TextBox, DateTextBox, declare) {
    kernel.experimental("dojox/form/DateTextBox");
    return declare("dojox.form.YearTextBox", DateTextBox, {popupClass:YearlyCalendar, format:function (value) {
        if (typeof value == "string") {
            return value;
        } else {
            if (value.getFullYear) {
                return value.getFullYear();
            }
        }
        return value;
    }, validator:function (value) {
        return value == "" || value == null || /(^-?\d\d*$)/.test(String(value));
    }, _setValueAttr:function (value, priorityChange, formattedValue) {
        if (value) {
            if (value.getFullYear) {
                value = value.getFullYear();
            }
        }
        TextBox.prototype._setValueAttr.call(this, value, priorityChange, formattedValue);
    }, openDropDown:function () {
        this.inherited(arguments);
        this.dropDown.onValueSelected = lang.hitch(this, function (value) {
            this.focus();
            setTimeout(lang.hitch(this, "closeDropDown"), 1);
            TextBox.prototype._setValueAttr.call(this, value, true, value);
        });
    }, parse:function (value, constraints) {
        return value || (this._isEmpty(value) ? null : undefined);
    }, filter:function (val) {
        if (val && val.getFullYear) {
            return val.getFullYear().toString();
        }
        return this.inherited(arguments);
    }});
});

