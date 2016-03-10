//>>built

define("dijit/form/NumberTextBox", ["dojo/_base/declare", "dojo/_base/lang", "dojo/i18n", "dojo/string", "dojo/number", "./RangeBoundTextBox"], function (declare, lang, i18n, string, number, RangeBoundTextBox) {
    var getDecimalInfo = function (constraints) {
        var constraints = constraints || {}, bundle = i18n.getLocalization("dojo.cldr", "number", i18n.normalizeLocale(constraints.locale)), pattern = constraints.pattern ? constraints.pattern : bundle[(constraints.type || "decimal") + "Format"];
        var places;
        if (typeof constraints.places == "number") {
            places = constraints.places;
        } else {
            if (typeof constraints.places === "string" && constraints.places.length > 0) {
                places = constraints.places.replace(/.*,/, "");
            } else {
                places = (pattern.indexOf(".") != -1 ? pattern.split(".")[1].replace(/[^#0]/g, "").length : 0);
            }
        }
        return {sep:bundle.decimal, places:places};
    };
    var NumberTextBoxMixin = declare("dijit.form.NumberTextBoxMixin", null, {pattern:function (constraints) {
        return "(" + (this.focused && this.editOptions ? this._regExpGenerator(lang.delegate(constraints, this.editOptions)) + "|" : "") + this._regExpGenerator(constraints) + ")";
    }, value:NaN, editOptions:{pattern:"#.######"}, _formatter:number.format, _regExpGenerator:number.regexp, _decimalInfo:getDecimalInfo(), postMixInProperties:function () {
        this.inherited(arguments);
        this._set("type", "text");
    }, _setConstraintsAttr:function (constraints) {
        var places = typeof constraints.places == "number" ? constraints.places : 0;
        if (places) {
            places++;
        }
        if (typeof constraints.max != "number") {
            constraints.max = 9 * Math.pow(10, 15 - places);
        }
        if (typeof constraints.min != "number") {
            constraints.min = -9 * Math.pow(10, 15 - places);
        }
        this.inherited(arguments, [constraints]);
        if (this.focusNode && this.focusNode.value && !isNaN(this.value)) {
            this.set("value", this.value);
        }
        this._decimalInfo = getDecimalInfo(constraints);
    }, _onFocus:function () {
        if (this.disabled || this.readOnly) {
            return;
        }
        var val = this.get("value");
        if (typeof val == "number" && !isNaN(val)) {
            var formattedValue = this.format(val, this.constraints);
            if (formattedValue !== undefined) {
                this.textbox.value = formattedValue;
            }
        }
        this.inherited(arguments);
    }, format:function (value, constraints) {
        var formattedValue = String(value);
        if (typeof value != "number") {
            return formattedValue;
        }
        if (isNaN(value)) {
            return "";
        }
        if (!("rangeCheck" in this && this.rangeCheck(value, constraints)) && constraints.exponent !== false && /\de[-+]?\d/i.test(formattedValue)) {
            return formattedValue;
        }
        if (this.editOptions && this.focused) {
            constraints = lang.mixin({}, constraints, this.editOptions);
        }
        return this._formatter(value, constraints);
    }, _parser:number.parse, parse:function (value, constraints) {
        var v = this._parser(value, lang.mixin({}, constraints, (this.editOptions && this.focused) ? this.editOptions : {}));
        if (this.editOptions && this.focused && isNaN(v)) {
            v = this._parser(value, constraints);
        }
        return v;
    }, _getDisplayedValueAttr:function () {
        var v = this.inherited(arguments);
        return isNaN(v) ? this.textbox.value : v;
    }, filter:function (value) {
        if (value == null || typeof value == "string" && value == "") {
            return NaN;
        } else {
            if (typeof value == "number" && !isNaN(value) && value != 0) {
                value = number.round(value, this._decimalInfo.places);
            }
        }
        return this.inherited(arguments, [value]);
    }, serialize:function (value, options) {
        return (typeof value != "number" || isNaN(value)) ? "" : this.inherited(arguments);
    }, _setBlurValue:function () {
        var val = lang.hitch(lang.delegate(this, {focused:true}), "get")("value");
        this._setValueAttr(val, true);
    }, _setValueAttr:function (value, priorityChange, formattedValue) {
        if (value !== undefined && formattedValue === undefined) {
            formattedValue = String(value);
            if (typeof value == "number") {
                if (isNaN(value)) {
                    formattedValue = "";
                } else {
                    if (("rangeCheck" in this && this.rangeCheck(value, this.constraints)) || this.constraints.exponent === false || !/\de[-+]?\d/i.test(formattedValue)) {
                        formattedValue = undefined;
                    }
                }
            } else {
                if (!value) {
                    formattedValue = "";
                    value = NaN;
                } else {
                    value = undefined;
                }
            }
        }
        this.inherited(arguments, [value, priorityChange, formattedValue]);
    }, _getValueAttr:function () {
        var v = this.inherited(arguments);
        if (isNaN(v) && this.textbox.value !== "") {
            if (this.constraints.exponent !== false && /\de[-+]?\d/i.test(this.textbox.value) && (new RegExp("^" + number._realNumberRegexp(lang.delegate(this.constraints)) + "$").test(this.textbox.value))) {
                var n = Number(this.textbox.value);
                return isNaN(n) ? undefined : n;
            } else {
                return undefined;
            }
        } else {
            return v;
        }
    }, isValid:function (isFocused) {
        if (!this.focused || this._isEmpty(this.textbox.value)) {
            return this.inherited(arguments);
        } else {
            var v = this.get("value");
            if (!isNaN(v) && this.rangeCheck(v, this.constraints)) {
                if (this.constraints.exponent !== false && /\de[-+]?\d/i.test(this.textbox.value)) {
                    return true;
                } else {
                    return this.inherited(arguments);
                }
            } else {
                return false;
            }
        }
    }, _isValidSubset:function () {
        var hasMinConstraint = (typeof this.constraints.min == "number"), hasMaxConstraint = (typeof this.constraints.max == "number"), curVal = this.get("value");
        if (isNaN(curVal) || (!hasMinConstraint && !hasMaxConstraint)) {
            return this.inherited(arguments);
        }
        var integerDigits = curVal | 0, valNegative = curVal < 0, hasDecimal = this.textbox.value.indexOf(this._decimalInfo.sep) != -1, maxDigits = this.maxLength || 20, remainingDigitsCount = maxDigits - this.textbox.value.length, fractionalDigitStr = hasDecimal ? this.textbox.value.split(this._decimalInfo.sep)[1].replace(/[^0-9]/g, "") : "";
        var normalizedValueStr = hasDecimal ? integerDigits + "." + fractionalDigitStr : integerDigits + "";
        var ninePaddingStr = string.rep("9", remainingDigitsCount), minPossibleValue = curVal, maxPossibleValue = curVal;
        if (valNegative) {
            minPossibleValue = Number(normalizedValueStr + ninePaddingStr);
        } else {
            maxPossibleValue = Number(normalizedValueStr + ninePaddingStr);
        }
        return !((hasMinConstraint && maxPossibleValue < this.constraints.min) || (hasMaxConstraint && minPossibleValue > this.constraints.max));
    }});
    var NumberTextBox = declare("dijit.form.NumberTextBox", [RangeBoundTextBox, NumberTextBoxMixin], {baseClass:"dijitTextBox dijitNumberTextBox"});
    NumberTextBox.Mixin = NumberTextBoxMixin;
    return NumberTextBox;
});

