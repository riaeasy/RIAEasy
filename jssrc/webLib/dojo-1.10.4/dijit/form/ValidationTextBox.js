//>>built

require({cache:{"url:dijit/form/templates/ValidationTextBox.html":"<div class=\"dijit dijitReset dijitInline dijitLeft\"\n\tid=\"widget_${id}\" role=\"presentation\"\n\t><div class='dijitReset dijitValidationContainer'\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t/></div\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class=\"dijitReset dijitInputInner\" data-dojo-attach-point='textbox,focusNode' autocomplete=\"off\"\n\t\t\t${!nameAttrSetting} type='${type}'\n\t/></div\n></div>\n"}});
define("dijit/form/ValidationTextBox", ["dojo/_base/declare", "dojo/_base/kernel", "dojo/_base/lang", "dojo/i18n", "./TextBox", "../Tooltip", "dojo/text!./templates/ValidationTextBox.html", "dojo/i18n!./nls/validate"], function (declare, kernel, lang, i18n, TextBox, Tooltip, template) {
    var ValidationTextBox;
    return ValidationTextBox = declare("dijit.form.ValidationTextBox", TextBox, {templateString:template, required:false, promptMessage:"", invalidMessage:"$_unset_$", missingMessage:"$_unset_$", message:"", constraints:{}, pattern:".*", regExp:"", regExpGen:function () {
    }, state:"", tooltipPosition:[], _deprecateRegExp:function (attr, value) {
        if (value != ValidationTextBox.prototype[attr]) {
            kernel.deprecated("ValidationTextBox id=" + this.id + ", set('" + attr + "', ...) is deprecated.  Use set('pattern', ...) instead.", "", "2.0");
            this.set("pattern", value);
        }
    }, _setRegExpGenAttr:function (newFcn) {
        this._deprecateRegExp("regExpGen", newFcn);
        this._set("regExpGen", this._computeRegexp);
    }, _setRegExpAttr:function (value) {
        this._deprecateRegExp("regExp", value);
    }, _setValueAttr:function () {
        this.inherited(arguments);
        this._refreshState();
    }, validator:function (value, constraints) {
        return (new RegExp("^(?:" + this._computeRegexp(constraints) + ")" + (this.required ? "" : "?") + "$")).test(value) && (!this.required || !this._isEmpty(value)) && (this._isEmpty(value) || this.parse(value, constraints) !== undefined);
    }, _isValidSubset:function () {
        return this.textbox.value.search(this._partialre) == 0;
    }, isValid:function () {
        return this.validator(this.textbox.value, this.get("constraints"));
    }, _isEmpty:function (value) {
        return (this.trim ? /^\s*$/ : /^$/).test(value);
    }, getErrorMessage:function () {
        var invalid = this.invalidMessage == "$_unset_$" ? this.messages.invalidMessage : !this.invalidMessage ? this.promptMessage : this.invalidMessage;
        var missing = this.missingMessage == "$_unset_$" ? this.messages.missingMessage : !this.missingMessage ? invalid : this.missingMessage;
        return (this.required && this._isEmpty(this.textbox.value)) ? missing : invalid;
    }, getPromptMessage:function () {
        return this.promptMessage;
    }, _maskValidSubsetError:true, validate:function (isFocused) {
        var message = "";
        var isValid = this.disabled || this.isValid(isFocused);
        if (isValid) {
            this._maskValidSubsetError = true;
        }
        var isEmpty = this._isEmpty(this.textbox.value);
        var isValidSubset = !isValid && isFocused && this._isValidSubset();
        this._set("state", isValid ? "" : (((((!this._hasBeenBlurred || isFocused) && isEmpty) || isValidSubset) && (this._maskValidSubsetError || (isValidSubset && !this._hasBeenBlurred && isFocused))) ? "Incomplete" : "Error"));
        this.focusNode.setAttribute("aria-invalid", this.state == "Error" ? "true" : "false");
        if (this.state == "Error") {
            this._maskValidSubsetError = isFocused && isValidSubset;
            message = this.getErrorMessage(isFocused);
        } else {
            if (this.state == "Incomplete") {
                message = this.getPromptMessage(isFocused);
                this._maskValidSubsetError = !this._hasBeenBlurred || isFocused;
            } else {
                if (isEmpty) {
                    message = this.getPromptMessage(isFocused);
                }
            }
        }
        this.set("message", message);
        return isValid;
    }, displayMessage:function (message) {
        if (message && this.focused) {
            Tooltip.show(message, this.domNode, this.tooltipPosition, !this.isLeftToRight());
        } else {
            Tooltip.hide(this.domNode);
        }
    }, _refreshState:function () {
        if (this._created) {
            this.validate(this.focused);
        }
        this.inherited(arguments);
    }, constructor:function (params) {
        this.constraints = lang.clone(this.constraints);
        this.baseClass += " dijitValidationTextBox";
    }, startup:function () {
        this.inherited(arguments);
        this._refreshState();
    }, _setConstraintsAttr:function (constraints) {
        if (!constraints.locale && this.lang) {
            constraints.locale = this.lang;
        }
        this._set("constraints", constraints);
        this._refreshState();
    }, _setPatternAttr:function (pattern) {
        this._set("pattern", pattern);
        this._refreshState();
    }, _computeRegexp:function (constraints) {
        var p = this.pattern;
        if (typeof p == "function") {
            p = p.call(this, constraints);
        }
        if (p != this._lastRegExp) {
            var partialre = "";
            this._lastRegExp = p;
            if (p != ".*") {
                p.replace(/\\.|\[\]|\[.*?[^\\]{1}\]|\{.*?\}|\(\?[=:!]|./g, function (re) {
                    switch (re.charAt(0)) {
                      case "{":
                      case "+":
                      case "?":
                      case "*":
                      case "^":
                      case "$":
                      case "|":
                      case "(":
                        partialre += re;
                        break;
                      case ")":
                        partialre += "|$)";
                        break;
                      default:
                        partialre += "(?:" + re + "|$)";
                        break;
                    }
                });
            }
            try {
                "".search(partialre);
            }
            catch (e) {
                partialre = this.pattern;
                console.warn("RegExp error in " + this.declaredClass + ": " + this.pattern);
            }
            this._partialre = "^(?:" + partialre + ")$";
        }
        return p;
    }, postMixInProperties:function () {
        this.inherited(arguments);
        this.messages = i18n.getLocalization("dijit.form", "validate", this.lang);
        this._setConstraintsAttr(this.constraints);
    }, _setDisabledAttr:function (value) {
        this.inherited(arguments);
        this._refreshState();
    }, _setRequiredAttr:function (value) {
        this._set("required", value);
        this.focusNode.setAttribute("aria-required", value);
        this._refreshState();
    }, _setMessageAttr:function (message) {
        this._set("message", message);
        this.displayMessage(message);
    }, reset:function () {
        this._maskValidSubsetError = true;
        this.inherited(arguments);
    }, _onBlur:function () {
        this.displayMessage("");
        this.inherited(arguments);
    }, destroy:function () {
        Tooltip.hide(this.domNode);
        this.inherited(arguments);
    }});
});

