//>>built

require({cache:{"url:dojox/form/resources/PasswordValidator.html":"<div dojoAttachPoint=\"containerNode\">\n\t<input type=\"hidden\" name=\"${name}\" value=\"\" dojoAttachPoint=\"focusNode\" />\n</div>"}});
define("dojox/form/PasswordValidator", ["dojo/_base/array", "dojo/_base/lang", "dojo/dom-attr", "dojo/i18n", "dojo/query", "dojo/keys", "dijit/form/_FormValueWidget", "dijit/form/ValidationTextBox", "dojo/text!./resources/PasswordValidator.html", "dojo/i18n!./nls/PasswordValidator", "dojo/_base/declare"], function (array, lang, domAttr, i18n, query, keys, FormValueWidget, ValidationTextBox, template, formNlsPasswordValidator, declare) {
    var _ChildTextBox = declare("dojox.form._ChildTextBox", ValidationTextBox, {containerWidget:null, type:"password", reset:function () {
        ValidationTextBox.prototype._setValueAttr.call(this, "", true);
        this._hasBeenBlurred = false;
    }, postCreate:function () {
        this.inherited(arguments);
        if (!this.name) {
            domAttr.remove(this.focusNode, "name");
        }
        this.connect(this.focusNode, "onkeypress", "_onChildKeyPress");
    }, _onChildKeyPress:function (e) {
        if (e && e.keyCode == keys.ENTER) {
            this._setBlurValue();
        }
    }});
    var _OldPWBox = declare("dojox.form._OldPWBox", _ChildTextBox, {_isPWValid:false, _setValueAttr:function (newVal, priority) {
        if (newVal === "") {
            newVal = _OldPWBox.superclass.attr.call(this, "value");
        }
        if (priority !== null) {
            this._isPWValid = this.containerWidget.pwCheck(newVal);
        }
        this.inherited(arguments);
        this.containerWidget._childValueAttr(this.containerWidget._inputWidgets[1].get("value"));
    }, isValid:function (isFocused) {
        return this.inherited("isValid", arguments) && this._isPWValid;
    }, _update:function (e) {
        if (this._hasBeenBlurred) {
            this.validate(true);
        }
        this._onMouse(e);
    }, _getValueAttr:function () {
        if (this.containerWidget._started && this.containerWidget.isValid()) {
            return this.inherited(arguments);
        }
        return "";
    }, _setBlurValue:function () {
        var value = ValidationTextBox.prototype._getValueAttr.call(this);
        this._setValueAttr(value, (this.isValid ? this.isValid() : true));
    }});
    var _NewPWBox = declare("dojox.form._NewPWBox", _ChildTextBox, {required:true, onChange:function () {
        this.containerWidget._inputWidgets[2].validate(false);
        this.inherited(arguments);
    }});
    var _VerifyPWBox = declare("dojox.form._VerifyPWBox", _ChildTextBox, {isValid:function (isFocused) {
        return this.inherited("isValid", arguments) && (this.get("value") == this.containerWidget._inputWidgets[1].get("value"));
    }});
    return declare("dojox.form.PasswordValidator", FormValueWidget, {required:true, _inputWidgets:null, oldName:"", templateString:template, _hasBeenBlurred:false, isValid:function (isFocused) {
        return array.every(this._inputWidgets, function (i) {
            if (i && i._setStateClass) {
                i._setStateClass();
            }
            return (!i || i.isValid());
        });
    }, validate:function (isFocused) {
        return array.every(array.map(this._inputWidgets, function (i) {
            if (i && i.validate) {
                i._hasBeenBlurred = (i._hasBeenBlurred || this._hasBeenBlurred);
                return i.validate();
            }
            return true;
        }, this), function (item) {
            return item;
        });
    }, reset:function () {
        this._hasBeenBlurred = false;
        array.forEach(this._inputWidgets, function (i) {
            if (i && i.reset) {
                i.reset();
            }
        }, this);
    }, _createSubWidgets:function () {
        var widgets = this._inputWidgets, msg = i18n.getLocalization("dojox.form", "PasswordValidator", this.lang);
        array.forEach(widgets, function (i, idx) {
            if (i) {
                var p = {containerWidget:this}, c;
                if (idx === 0) {
                    p.name = this.oldName;
                    p.invalidMessage = msg.badPasswordMessage;
                    c = _OldPWBox;
                } else {
                    if (idx === 1) {
                        p.required = this.required;
                        c = _NewPWBox;
                    } else {
                        if (idx === 2) {
                            p.invalidMessage = msg.nomatchMessage;
                            c = _VerifyPWBox;
                        }
                    }
                }
                widgets[idx] = new c(p, i);
            }
        }, this);
    }, pwCheck:function (password) {
        return false;
    }, postCreate:function () {
        this.inherited(arguments);
        var widgets = this._inputWidgets = [];
        array.forEach(["old", "new", "verify"], function (i) {
            widgets.push(query("input[pwType=" + i + "]", this.containerNode)[0]);
        }, this);
        if (!widgets[1] || !widgets[2]) {
            throw new Error("Need at least pwType=\"new\" and pwType=\"verify\"");
        }
        if (this.oldName && !widgets[0]) {
            throw new Error("Need to specify pwType=\"old\" if using oldName");
        }
        this.containerNode = this.domNode;
        this._createSubWidgets();
        this.connect(this._inputWidgets[1], "_setValueAttr", "_childValueAttr");
        this.connect(this._inputWidgets[2], "_setValueAttr", "_childValueAttr");
    }, _childValueAttr:function (v) {
        this.set("value", this.isValid() ? v : "");
    }, _setDisabledAttr:function (value) {
        this.inherited(arguments);
        array.forEach(this._inputWidgets, function (i) {
            if (i && i.set) {
                i.set("disabled", value);
            }
        });
    }, _setRequiredAttribute:function (value) {
        this.required = value;
        domAttr.set(this.focusNode, "required", value);
        this.focusNode.setAttribute("aria-required", value);
        this._refreshState();
        array.forEach(this._inputWidgets, function (i) {
            if (i && i.set) {
                i.set("required", value);
            }
        });
    }, _setValueAttr:function (v) {
        this.inherited(arguments);
        domAttr.set(this.focusNode, "value", v);
    }, _getValueAttr:function () {
        return this.value || "";
    }, focus:function () {
        var f = false;
        array.forEach(this._inputWidgets, function (i) {
            if (i && !i.isValid() && !f) {
                i.focus();
                f = true;
            }
        });
        if (!f) {
            this._inputWidgets[1].focus();
        }
    }});
});

