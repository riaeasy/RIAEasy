//>>built

require({cache:{"url:dijit/form/templates/DropDownBox.html":"<div class=\"dijit dijitReset dijitInline dijitLeft\"\n\tid=\"widget_${id}\"\n\trole=\"combobox\"\n\taria-haspopup=\"true\"\n\tdata-dojo-attach-point=\"_popupStateNode\"\n\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer'\n\t\tdata-dojo-attach-point=\"_buttonNode\" role=\"presentation\"\n\t\t><input class=\"dijitReset dijitInputField dijitArrowButtonInner\" value=\"&#9660; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"button presentation\" aria-hidden=\"true\"\n\t\t\t${_buttonInputDisabled}\n\t/></div\n\t><div class='dijitReset dijitValidationContainer'\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t/></div\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class='dijitReset dijitInputInner' ${!nameAttrSetting} type=\"text\" autocomplete=\"off\"\n\t\t\tdata-dojo-attach-point=\"textbox,focusNode\" role=\"textbox\"\n\t/></div\n></div>\n"}});
define("dijit/form/_DateTimeTextBox", ["dojo/date", "dojo/date/locale", "dojo/date/stamp", "dojo/_base/declare", "dojo/_base/lang", "./RangeBoundTextBox", "../_HasDropDown", "dojo/text!./templates/DropDownBox.html"], function (date, locale, stamp, declare, lang, RangeBoundTextBox, _HasDropDown, template) {
    new Date("X");
    var _DateTimeTextBox = declare("dijit.form._DateTimeTextBox", [RangeBoundTextBox, _HasDropDown], {templateString:template, hasDownArrow:true, cssStateNodes:{"_buttonNode":"dijitDownArrowButton"}, _unboundedConstraints:{}, pattern:locale.regexp, datePackage:"", postMixInProperties:function () {
        this.inherited(arguments);
        this._set("type", "text");
    }, compare:function (val1, val2) {
        var isInvalid1 = this._isInvalidDate(val1);
        var isInvalid2 = this._isInvalidDate(val2);
        if (isInvalid1 || isInvalid2) {
            return (isInvalid1 && isInvalid2) ? 0 : (!isInvalid1 ? 1 : -1);
        }
        var fval1 = this.format(val1, this._unboundedConstraints), fval2 = this.format(val2, this._unboundedConstraints), pval1 = this.parse(fval1, this._unboundedConstraints), pval2 = this.parse(fval2, this._unboundedConstraints);
        return fval1 == fval2 ? 0 : date.compare(pval1, pval2, this._selector);
    }, autoWidth:true, format:function (value, constraints) {
        if (!value) {
            return "";
        }
        return this.dateLocaleModule.format(value, constraints);
    }, "parse":function (value, constraints) {
        return this.dateLocaleModule.parse(value, constraints) || (this._isEmpty(value) ? null : undefined);
    }, serialize:function (val, options) {
        if (val.toGregorian) {
            val = val.toGregorian();
        }
        return stamp.toISOString(val, options);
    }, dropDownDefaultValue:new Date(), value:new Date(""), _blankValue:null, popupClass:"", _selector:"", constructor:function (params) {
        params = params || {};
        this.dateModule = params.datePackage ? lang.getObject(params.datePackage, false) : date;
        this.dateClassObj = this.dateModule.Date || Date;
        if (!(this.dateClassObj instanceof Date)) {
            this.value = new this.dateClassObj(this.value);
        }
        this.dateLocaleModule = params.datePackage ? lang.getObject(params.datePackage + ".locale", false) : locale;
        this._set("pattern", this.dateLocaleModule.regexp);
        this._invalidDate = this.constructor.prototype.value.toString();
    }, buildRendering:function () {
        this.inherited(arguments);
        if (!this.hasDownArrow) {
            this._buttonNode.style.display = "none";
        }
        if (!this.hasDownArrow) {
            this._buttonNode = this.domNode;
            this.baseClass += " dijitComboBoxOpenOnClick";
        }
    }, _setConstraintsAttr:function (constraints) {
        constraints.selector = this._selector;
        constraints.fullYear = true;
        var fromISO = stamp.fromISOString;
        if (typeof constraints.min == "string") {
            constraints.min = fromISO(constraints.min);
            if (!(this.dateClassObj instanceof Date)) {
                constraints.min = new this.dateClassObj(constraints.min);
            }
        }
        if (typeof constraints.max == "string") {
            constraints.max = fromISO(constraints.max);
            if (!(this.dateClassObj instanceof Date)) {
                constraints.max = new this.dateClassObj(constraints.max);
            }
        }
        this.inherited(arguments);
        this._unboundedConstraints = lang.mixin({}, this.constraints, {min:null, max:null});
    }, _isInvalidDate:function (value) {
        return !value || isNaN(value) || typeof value != "object" || value.toString() == this._invalidDate;
    }, _setValueAttr:function (value, priorityChange, formattedValue) {
        if (value !== undefined) {
            if (typeof value == "string") {
                value = stamp.fromISOString(value);
            }
            if (this._isInvalidDate(value)) {
                value = null;
            }
            if (value instanceof Date && !(this.dateClassObj instanceof Date)) {
                value = new this.dateClassObj(value);
            }
        }
        this.inherited(arguments, [value, priorityChange, formattedValue]);
        if (this.value instanceof Date) {
            this.filterString = "";
        }
        if (this.dropDown) {
            this.dropDown.set("value", value, false);
        }
    }, _set:function (attr, value) {
        if (attr == "value") {
            if (value instanceof Date && !(this.dateClassObj instanceof Date)) {
                value = new this.dateClassObj(value);
            }
            var oldValue = this._get("value");
            if (oldValue instanceof this.dateClassObj && this.compare(value, oldValue) == 0) {
                return;
            }
        }
        this.inherited(arguments);
    }, _setDropDownDefaultValueAttr:function (val) {
        if (this._isInvalidDate(val)) {
            val = new this.dateClassObj();
        }
        this._set("dropDownDefaultValue", val);
    }, openDropDown:function (callback) {
        if (this.dropDown) {
            this.dropDown.destroy();
        }
        var PopupProto = lang.isString(this.popupClass) ? lang.getObject(this.popupClass, false) : this.popupClass, textBox = this, value = this.get("value");
        this.dropDown = new PopupProto({onChange:function (value) {
            textBox.set("value", value, true);
        }, id:this.id + "_popup", dir:textBox.dir, lang:textBox.lang, value:value, textDir:textBox.textDir, currentFocus:!this._isInvalidDate(value) ? value : this.dropDownDefaultValue, constraints:textBox.constraints, filterString:textBox.filterString, datePackage:textBox.datePackage, isDisabledDate:function (date) {
            return !textBox.rangeCheck(date, textBox.constraints);
        }});
        this.inherited(arguments);
    }, _getDisplayedValueAttr:function () {
        return this.textbox.value;
    }, _setDisplayedValueAttr:function (value, priorityChange) {
        this._setValueAttr(this.parse(value, this.constraints), priorityChange, value);
    }});
    return _DateTimeTextBox;
});

