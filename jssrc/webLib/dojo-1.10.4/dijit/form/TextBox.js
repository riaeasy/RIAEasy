//>>built

require({cache:{"url:dijit/form/templates/TextBox.html":"<div class=\"dijit dijitReset dijitInline dijitLeft\" id=\"widget_${id}\" role=\"presentation\"\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class=\"dijitReset dijitInputInner\" data-dojo-attach-point='textbox,focusNode' autocomplete=\"off\"\n\t\t\t${!nameAttrSetting} type='${type}'\n\t/></div\n></div>\n"}});
define("dijit/form/TextBox", ["dojo/_base/declare", "dojo/dom-construct", "dojo/dom-style", "dojo/_base/kernel", "dojo/_base/lang", "dojo/on", "dojo/sniff", "./_FormValueWidget", "./_TextBoxMixin", "dojo/text!./templates/TextBox.html", "../main"], function (declare, domConstruct, domStyle, kernel, lang, on, has, _FormValueWidget, _TextBoxMixin, template, dijit) {
    var TextBox = declare("dijit.form.TextBox" + (0 ? "_NoBidi" : ""), [_FormValueWidget, _TextBoxMixin], {templateString:template, _singleNodeTemplate:"<input class=\"dijit dijitReset dijitLeft dijitInputField\" data-dojo-attach-point=\"textbox,focusNode\" autocomplete=\"off\" type=\"${type}\" ${!nameAttrSetting} />", _buttonInputDisabled:has("ie") ? "disabled" : "", baseClass:"dijitTextBox", postMixInProperties:function () {
        var type = this.type.toLowerCase();
        if (this.templateString && this.templateString.toLowerCase() == "input" || ((type == "hidden" || type == "file") && this.templateString == this.constructor.prototype.templateString)) {
            this.templateString = this._singleNodeTemplate;
        }
        this.inherited(arguments);
    }, postCreate:function () {
        this.inherited(arguments);
        if (has("ie") < 9) {
            this.defer(function () {
                try {
                    var s = domStyle.getComputedStyle(this.domNode);
                    if (s) {
                        var ff = s.fontFamily;
                        if (ff) {
                            var inputs = this.domNode.getElementsByTagName("INPUT");
                            if (inputs) {
                                for (var i = 0; i < inputs.length; i++) {
                                    inputs[i].style.fontFamily = ff;
                                }
                            }
                        }
                    }
                }
                catch (e) {
                }
            });
        }
    }, _setPlaceHolderAttr:function (v) {
        this._set("placeHolder", v);
        if (!this._phspan) {
            this._attachPoints.push("_phspan");
            this._phspan = domConstruct.create("span", {className:"dijitPlaceHolder dijitInputField"}, this.textbox, "after");
            this.own(on(this._phspan, "mousedown", function (evt) {
                evt.preventDefault();
            }), on(this._phspan, "touchend, pointerup, MSPointerUp", lang.hitch(this, function () {
                this.focus();
            })));
        }
        this._phspan.innerHTML = "";
        this._phspan.appendChild(this._phspan.ownerDocument.createTextNode(v));
        this._updatePlaceHolder();
    }, _onInput:function (evt) {
        this.inherited(arguments);
        this._updatePlaceHolder();
    }, _updatePlaceHolder:function () {
        if (this._phspan) {
            this._phspan.style.display = (this.placeHolder && !this.textbox.value) ? "" : "none";
        }
    }, _setValueAttr:function (value, priorityChange, formattedValue) {
        this.inherited(arguments);
        this._updatePlaceHolder();
    }, getDisplayedValue:function () {
        kernel.deprecated(this.declaredClass + "::getDisplayedValue() is deprecated. Use get('displayedValue') instead.", "", "2.0");
        return this.get("displayedValue");
    }, setDisplayedValue:function (value) {
        kernel.deprecated(this.declaredClass + "::setDisplayedValue() is deprecated. Use set('displayedValue', ...) instead.", "", "2.0");
        this.set("displayedValue", value);
    }, _onBlur:function (e) {
        if (this.disabled) {
            return;
        }
        this.inherited(arguments);
        this._updatePlaceHolder();
        if (has("mozilla")) {
            if (this.selectOnClick) {
                this.textbox.selectionStart = this.textbox.selectionEnd = undefined;
            }
        }
    }, _onFocus:function (by) {
        if (this.disabled || this.readOnly) {
            return;
        }
        this.inherited(arguments);
        this._updatePlaceHolder();
    }});
    if (has("ie") < 9) {
        TextBox.prototype._isTextSelected = function () {
            var range = this.ownerDocument.selection.createRange();
            var parent = range.parentElement();
            return parent == this.textbox && range.text.length > 0;
        };
        dijit._setSelectionRange = _TextBoxMixin._setSelectionRange = function (element, start, stop) {
            if (element.createTextRange) {
                var r = element.createTextRange();
                r.collapse(true);
                r.moveStart("character", -99999);
                r.moveStart("character", start);
                r.moveEnd("character", stop - start);
                r.select();
            }
        };
    }
    if (0) {
        TextBox = declare("dijit.form.TextBox", TextBox, {_setPlaceHolderAttr:function (v) {
            this.inherited(arguments);
            this.applyTextDir(this._phspan);
        }});
    }
    return TextBox;
});

