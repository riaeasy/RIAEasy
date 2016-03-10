//>>built

require({cache:{"url:dojox/form/resources/TriStateCheckBox.html":"<div class=\"dijit dijitReset dijitInline\" role=\"presentation\"\n\t><div class=\"dojoxTriStateCheckBoxInner\" dojoAttachPoint=\"stateLabelNode\"></div\n\t><input ${!nameAttrSetting} type=\"${type}\" role=\"${type}\" dojoAttachPoint=\"focusNode\"\n\tclass=\"dijitReset dojoxTriStateCheckBoxInput\" dojoAttachEvent=\"onclick:_onClick\"\n/></div>\n"}});
define("dojox/form/TriStateCheckBox", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/array", "dojo/_base/lang", "dojo/_base/event", "dojo/query", "dojo/dom-attr", "dojo/text!./resources/TriStateCheckBox.html", "dijit/form/Button", "dijit/form/_ToggleButtonMixin", "dojo/NodeList-dom"], function (kernel, declare, array, lang, event, query, domAttr, template, Button, _ToggleButtonMixin) {
    return declare("dojox.form.TriStateCheckBox", [Button, _ToggleButtonMixin], {templateString:template, baseClass:"dojoxTriStateCheckBox", type:"checkbox", states:"", _stateLabels:null, stateValue:null, _currentState:0, _stateType:"False", readOnly:false, checked:"", _aria_attr:"aria-checked", constructor:function () {
        this.states = [false, "mixed", true];
        this.checked = false;
        this._stateLabels = {"False":"&#9633;", "True":"&#8730;", "Mixed":"&#9632;"};
        this.stateValues = {"False":false, "True":"on", "Mixed":"mixed"};
    }, _fillContent:function (source) {
    }, postCreate:function () {
        domAttr.set(this.stateLabelNode, "innerHTML", this._stateLabels[this._stateType]);
        this.inherited(arguments);
    }, startup:function () {
        this.set("checked", this.params.checked || this.states[this._currentState]);
        domAttr.set(this.stateLabelNode, "innerHTML", this._stateLabels[this._stateType]);
        this.inherited(arguments);
    }, _setIconClassAttr:null, _setCheckedAttr:function (checked, priorityChange) {
        var stateIndex = array.indexOf(this.states, checked), changed = false;
        if (stateIndex >= 0) {
            this._currentState = stateIndex;
            this._stateType = this._getStateType(checked);
            domAttr.set(this.focusNode, "value", this.stateValues[this._stateType]);
            domAttr.set(this.stateLabelNode, "innerHTML", this._stateLabels[this._stateType]);
            this.inherited(arguments);
        } else {
            console.warn("Invalid state!");
        }
    }, setChecked:function (checked) {
        kernel.deprecated("setChecked(" + checked + ") is deprecated. Use set('checked'," + checked + ") instead.", "", "2.0");
        this.set("checked", checked);
    }, _setStatesAttr:function (states) {
        if (lang.isArray(states)) {
            this._set("states", states);
        } else {
            if (lang.isString(states)) {
                var map = {"true":true, "false":false, "mixed":"mixed"};
                states = states.split(/\s*,\s*/);
                for (var i = 0; i < states.length; i++) {
                    states[i] = map[states[i]] !== undefined ? map[states[i]] : false;
                }
                this._set("states", states);
            }
        }
    }, _setReadOnlyAttr:function (value) {
        this._set("readOnly", value);
        domAttr.set(this.focusNode, "readOnly", value);
    }, _setValueAttr:function (newValue, priorityChange) {
        if (typeof newValue == "string" && (array.indexOf(this.states, newValue) < 0)) {
            if (newValue == "") {
                newValue = "on";
            }
            this.stateValues["True"] = newValue;
            newValue = true;
        }
        if (this._created) {
            this._currentState = array.indexOf(this.states, newValue);
            this.set("checked", newValue, priorityChange);
            domAttr.set(this.focusNode, "value", this.stateValues[this._stateType]);
        }
    }, _setValuesAttr:function (newValues) {
        this.stateValues["True"] = newValues[0] ? newValues[0] : this.stateValues["True"];
        this.stateValues["Mixed"] = newValues[1] ? newValues[1] : this.stateValues["Mixed"];
    }, _getValueAttr:function () {
        return this.stateValues[this._stateType];
    }, reset:function () {
        this._hasBeenBlurred = false;
        this.set("states", this.params.states || [false, "mixed", true]);
        this.stateValues = this.params.stateValues || {"False":false, "True":"on", "Mixed":"mixed"};
        this.set("values", this.params.values || []);
        this.set("checked", this.params.checked || this.states[0]);
    }, _onFocus:function () {
        if (this.id) {
            query("label[for='" + this.id + "']").addClass("dijitFocusedLabel");
        }
        this.inherited(arguments);
    }, _onBlur:function () {
        if (this.id) {
            query("label[for='" + this.id + "']").removeClass("dijitFocusedLabel");
        }
        this.mouseFocus = false;
        this.inherited(arguments);
    }, _onClick:function (e) {
        if (this.readOnly || this.disabled) {
            event.stop(e);
            return false;
        }
        this.click();
        return this.onClick(e);
    }, click:function () {
        if (this._currentState >= this.states.length - 1) {
            this._currentState = 0;
        } else {
            if (this._currentState == -1) {
                this.fixState();
            } else {
                this._currentState++;
            }
        }
        var oldState = this._currentState;
        this.set("checked", this.states[this._currentState]);
        this._currentState = oldState;
        domAttr.set(this.stateLabelNode, "innerHTML", this._stateLabels[this._stateType]);
    }, fixState:function () {
        this._currentState = this.states.length - 1;
    }, _getStateType:function (state) {
        return state ? (state == "mixed" ? "Mixed" : "True") : "False";
    }, _onMouseDown:function () {
        this.mouseFocus = true;
    }});
});

