//>>built

define("dijit/form/_TextBoxMixin", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom", "dojo/has", "dojo/keys", "dojo/_base/lang", "dojo/on", "../main"], function (array, declare, dom, has, keys, lang, on, dijit) {
    var _TextBoxMixin = declare("dijit.form._TextBoxMixin" + (0 ? "_NoBidi" : ""), null, {trim:false, uppercase:false, lowercase:false, propercase:false, maxLength:"", selectOnClick:false, placeHolder:"", _getValueAttr:function () {
        return this.parse(this.get("displayedValue"), this.constraints);
    }, _setValueAttr:function (value, priorityChange, formattedValue) {
        var filteredValue;
        if (value !== undefined) {
            filteredValue = this.filter(value);
            if (typeof formattedValue != "string") {
                if (filteredValue !== null && ((typeof filteredValue != "number") || !isNaN(filteredValue))) {
                    formattedValue = this.filter(this.format(filteredValue, this.constraints));
                } else {
                    formattedValue = "";
                }
                if (this.compare(filteredValue, this.filter(this.parse(formattedValue, this.constraints))) != 0) {
                    formattedValue = null;
                }
            }
        }
        if (formattedValue != null && ((typeof formattedValue) != "number" || !isNaN(formattedValue)) && this.textbox.value != formattedValue) {
            this.textbox.value = formattedValue;
            this._set("displayedValue", this.get("displayedValue"));
        }
        this.inherited(arguments, [filteredValue, priorityChange]);
    }, displayedValue:"", _getDisplayedValueAttr:function () {
        return this.filter(this.textbox.value);
    }, _setDisplayedValueAttr:function (value) {
        if (value == null) {
            value = "";
        } else {
            if (typeof value != "string") {
                value = String(value);
            }
        }
        this.textbox.value = value;
        this._setValueAttr(this.get("value"), undefined);
        this._set("displayedValue", this.get("displayedValue"));
    }, format:function (value) {
        return value == null ? "" : (value.toString ? value.toString() : value);
    }, parse:function (value) {
        return value;
    }, _refreshState:function () {
    }, onInput:function () {
    }, __skipInputEvent:false, _onInput:function (evt) {
        this._processInput(evt);
        if (this.intermediateChanges) {
            this.defer(function () {
                this._handleOnChange(this.get("value"), false);
            });
        }
    }, _processInput:function (evt) {
        this._refreshState();
        this._set("displayedValue", this.get("displayedValue"));
    }, postCreate:function () {
        this.textbox.setAttribute("value", this.textbox.value);
        this.inherited(arguments);
        function handleEvent(e) {
            var charOrCode;
            if (e.type == "keydown") {
                charOrCode = e.keyCode;
                switch (charOrCode) {
                  case keys.SHIFT:
                  case keys.ALT:
                  case keys.CTRL:
                  case keys.META:
                  case keys.CAPS_LOCK:
                  case keys.NUM_LOCK:
                  case keys.SCROLL_LOCK:
                    return;
                }
                if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                    switch (charOrCode) {
                      case keys.NUMPAD_0:
                      case keys.NUMPAD_1:
                      case keys.NUMPAD_2:
                      case keys.NUMPAD_3:
                      case keys.NUMPAD_4:
                      case keys.NUMPAD_5:
                      case keys.NUMPAD_6:
                      case keys.NUMPAD_7:
                      case keys.NUMPAD_8:
                      case keys.NUMPAD_9:
                      case keys.NUMPAD_MULTIPLY:
                      case keys.NUMPAD_PLUS:
                      case keys.NUMPAD_ENTER:
                      case keys.NUMPAD_MINUS:
                      case keys.NUMPAD_PERIOD:
                      case keys.NUMPAD_DIVIDE:
                        return;
                    }
                    if ((charOrCode >= 65 && charOrCode <= 90) || (charOrCode >= 48 && charOrCode <= 57) || charOrCode == keys.SPACE) {
                        return;
                    }
                    var named = false;
                    for (var i in keys) {
                        if (keys[i] === e.keyCode) {
                            named = true;
                            break;
                        }
                    }
                    if (!named) {
                        return;
                    }
                }
            }
            charOrCode = e.charCode >= 32 ? String.fromCharCode(e.charCode) : e.charCode;
            if (!charOrCode) {
                charOrCode = (e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode >= 48 && e.keyCode <= 57) || e.keyCode == keys.SPACE ? String.fromCharCode(e.keyCode) : e.keyCode;
            }
            if (!charOrCode) {
                charOrCode = 229;
            }
            if (e.type == "keypress") {
                if (typeof charOrCode != "string") {
                    return;
                }
                if ((charOrCode >= "a" && charOrCode <= "z") || (charOrCode >= "A" && charOrCode <= "Z") || (charOrCode >= "0" && charOrCode <= "9") || (charOrCode === " ")) {
                    if (e.ctrlKey || e.metaKey || e.altKey) {
                        return;
                    }
                }
            }
            if (e.type == "input") {
                if (this.__skipInputEvent) {
                    this.__skipInputEvent = false;
                    return;
                }
            } else {
                this.__skipInputEvent = true;
            }
            var faux = {faux:true}, attr;
            for (attr in e) {
                if (!/^(layer[XY]|returnValue|keyLocation)$/.test(attr)) {
                    var v = e[attr];
                    if (typeof v != "function" && typeof v != "undefined") {
                        faux[attr] = v;
                    }
                }
            }
            lang.mixin(faux, {charOrCode:charOrCode, _wasConsumed:false, preventDefault:function () {
                faux._wasConsumed = true;
                e.preventDefault();
            }, stopPropagation:function () {
                e.stopPropagation();
            }});
            if (this.onInput(faux) === false) {
                faux.preventDefault();
                faux.stopPropagation();
            }
            if (faux._wasConsumed) {
                return;
            }
            this.defer(function () {
                this._onInput(faux);
            });
        }
        this.own(on(this.textbox, "keydown, keypress, paste, cut, input, compositionend", lang.hitch(this, handleEvent)), on(this.domNode, "keypress", function (e) {
            e.stopPropagation();
        }));
    }, _blankValue:"", filter:function (val) {
        if (val === null) {
            return this._blankValue;
        }
        if (typeof val != "string") {
            return val;
        }
        if (this.trim) {
            val = lang.trim(val);
        }
        if (this.uppercase) {
            val = val.toUpperCase();
        }
        if (this.lowercase) {
            val = val.toLowerCase();
        }
        if (this.propercase) {
            val = val.replace(/[^\s]+/g, function (word) {
                return word.substring(0, 1).toUpperCase() + word.substring(1);
            });
        }
        return val;
    }, _setBlurValue:function () {
        this._setValueAttr(this.get("value"), true);
    }, _onBlur:function (e) {
        if (this.disabled) {
            return;
        }
        this._setBlurValue();
        this.inherited(arguments);
    }, _isTextSelected:function () {
        return this.textbox.selectionStart != this.textbox.selectionEnd;
    }, _onFocus:function (by) {
        if (this.disabled || this.readOnly) {
            return;
        }
        if (this.selectOnClick && by == "mouse") {
            this._selectOnClickHandle = on.once(this.domNode, "mouseup, touchend", lang.hitch(this, function (evt) {
                if (!this._isTextSelected()) {
                    _TextBoxMixin.selectInputText(this.textbox);
                }
            }));
            this.own(this._selectOnClickHandle);
            this.defer(function () {
                if (this._selectOnClickHandle) {
                    this._selectOnClickHandle.remove();
                    this._selectOnClickHandle = null;
                }
            }, 500);
        }
        this.inherited(arguments);
        this._refreshState();
    }, reset:function () {
        this.textbox.value = "";
        this.inherited(arguments);
    }});
    if (0) {
        _TextBoxMixin = declare("dijit.form._TextBoxMixin", _TextBoxMixin, {_setValueAttr:function () {
            this.inherited(arguments);
            this.applyTextDir(this.focusNode);
        }, _setDisplayedValueAttr:function () {
            this.inherited(arguments);
            this.applyTextDir(this.focusNode);
        }, _onInput:function () {
            this.applyTextDir(this.focusNode);
            this.inherited(arguments);
        }});
    }
    _TextBoxMixin._setSelectionRange = dijit._setSelectionRange = function (element, start, stop) {
        if (element.setSelectionRange) {
            element.setSelectionRange(start, stop);
        }
    };
    _TextBoxMixin.selectInputText = dijit.selectInputText = function (element, start, stop) {
        element = dom.byId(element);
        if (isNaN(start)) {
            start = 0;
        }
        if (isNaN(stop)) {
            stop = element.value ? element.value.length : 0;
        }
        try {
            element.focus();
            _TextBoxMixin._setSelectionRange(element, start, stop);
        }
        catch (e) {
        }
    };
    return _TextBoxMixin;
});

