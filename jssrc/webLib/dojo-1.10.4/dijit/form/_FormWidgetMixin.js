//>>built

define("dijit/form/_FormWidgetMixin", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom-attr", "dojo/dom-style", "dojo/_base/lang", "dojo/mouse", "dojo/on", "dojo/sniff", "dojo/window", "../a11y"], function (array, declare, domAttr, domStyle, lang, mouse, on, has, winUtils, a11y) {
    return declare("dijit.form._FormWidgetMixin", null, {name:"", alt:"", value:"", type:"text", "aria-label":"focusNode", tabIndex:"0", _setTabIndexAttr:"focusNode", disabled:false, intermediateChanges:false, scrollOnFocus:true, _setIdAttr:"focusNode", _setDisabledAttr:function (value) {
        this._set("disabled", value);
        domAttr.set(this.focusNode, "disabled", value);
        if (this.valueNode) {
            domAttr.set(this.valueNode, "disabled", value);
        }
        this.focusNode.setAttribute("aria-disabled", value ? "true" : "false");
        if (value) {
            this._set("hovering", false);
            this._set("active", false);
            var attachPointNames = "tabIndex" in this.attributeMap ? this.attributeMap.tabIndex : ("_setTabIndexAttr" in this) ? this._setTabIndexAttr : "focusNode";
            array.forEach(lang.isArray(attachPointNames) ? attachPointNames : [attachPointNames], function (attachPointName) {
                var node = this[attachPointName];
                if (has("webkit") || a11y.hasDefaultTabStop(node)) {
                    node.setAttribute("tabIndex", "-1");
                } else {
                    node.removeAttribute("tabIndex");
                }
            }, this);
        } else {
            if (this.tabIndex != "") {
                this.set("tabIndex", this.tabIndex);
            }
        }
    }, _onFocus:function (by) {
        if (by == "mouse" && this.isFocusable()) {
            var focusHandle = this.own(on(this.focusNode, "focus", function () {
                mouseUpHandle.remove();
                focusHandle.remove();
            }))[0];
            var event = has("pointer-events") ? "pointerup" : has("MSPointer") ? "MSPointerUp" : has("touch-events") ? "touchend, mouseup" : "mouseup";
            var mouseUpHandle = this.own(on(this.ownerDocumentBody, event, lang.hitch(this, function (evt) {
                mouseUpHandle.remove();
                focusHandle.remove();
                if (this.focused) {
                    if (evt.type == "touchend") {
                        this.defer("focus");
                    } else {
                        this.focus();
                    }
                }
            })))[0];
        }
        if (this.scrollOnFocus) {
            this.defer(function () {
                winUtils.scrollIntoView(this.domNode);
            });
        }
        this.inherited(arguments);
    }, isFocusable:function () {
        return !this.disabled && this.focusNode && (domStyle.get(this.domNode, "display") != "none");
    }, focus:function () {
        if (!this.disabled && this.focusNode.focus) {
            try {
                this.focusNode.focus();
            }
            catch (e) {
            }
        }
    }, compare:function (val1, val2) {
        if (typeof val1 == "number" && typeof val2 == "number") {
            return (isNaN(val1) && isNaN(val2)) ? 0 : val1 - val2;
        } else {
            if (val1 > val2) {
                return 1;
            } else {
                if (val1 < val2) {
                    return -1;
                } else {
                    return 0;
                }
            }
        }
    }, onChange:function () {
    }, _onChangeActive:false, _handleOnChange:function (newValue, priorityChange) {
        if (this._lastValueReported == undefined && (priorityChange === null || !this._onChangeActive)) {
            this._resetValue = this._lastValueReported = newValue;
        }
        this._pendingOnChange = this._pendingOnChange || (typeof newValue != typeof this._lastValueReported) || (this.compare(newValue, this._lastValueReported) != 0);
        if ((this.intermediateChanges || priorityChange || priorityChange === undefined) && this._pendingOnChange) {
            this._lastValueReported = newValue;
            this._pendingOnChange = false;
            if (this._onChangeActive) {
                if (this._onChangeHandle) {
                    this._onChangeHandle.remove();
                }
                this._onChangeHandle = this.defer(function () {
                    this._onChangeHandle = null;
                    this.onChange(newValue);
                });
            }
        }
    }, create:function () {
        this.inherited(arguments);
        this._onChangeActive = true;
    }, destroy:function () {
        if (this._onChangeHandle) {
            this._onChangeHandle.remove();
            this.onChange(this._lastValueReported);
        }
        this.inherited(arguments);
    }});
});

