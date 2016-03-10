//>>built

define("dojox/mobile/app/_FormWidget", ["dijit", "dojo", "dojox", "dojo/require!dojo/window,dijit/_WidgetBase,dijit/focus"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.mobile.app._FormWidget");
    dojo.experimental("dojox.mobile.app._FormWidget");
    dojo.require("dojo.window");
    dojo.require("dijit._WidgetBase");
    dojo.require("dijit.focus");
    dojo.declare("dojox.mobile.app._FormWidget", dijit._WidgetBase, {name:"", alt:"", value:"", type:"text", disabled:false, intermediateChanges:false, scrollOnFocus:false, attributeMap:dojo.delegate(dijit._WidgetBase.prototype.attributeMap, {value:"focusNode", id:"focusNode", alt:"focusNode", title:"focusNode"}), postMixInProperties:function () {
        this.nameAttrSetting = this.name ? ("name=\"" + this.name.replace(/'/g, "&quot;") + "\"") : "";
        this.inherited(arguments);
    }, postCreate:function () {
        this.inherited(arguments);
        this.connect(this.domNode, "onmousedown", "_onMouseDown");
    }, _setDisabledAttr:function (value) {
        this.disabled = value;
        dojo.attr(this.focusNode, "disabled", value);
        if (this.valueNode) {
            dojo.attr(this.valueNode, "disabled", value);
        }
    }, _onFocus:function (e) {
        if (this.scrollOnFocus) {
            dojo.window.scrollIntoView(this.domNode);
        }
        this.inherited(arguments);
    }, isFocusable:function () {
        return !this.disabled && !this.readOnly && this.focusNode && (dojo.style(this.domNode, "display") != "none");
    }, focus:function () {
        this.focusNode.focus();
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
    }, onChange:function (newValue) {
    }, _onChangeActive:false, _handleOnChange:function (newValue, priorityChange) {
        this._lastValue = newValue;
        if (this._lastValueReported == undefined && (priorityChange === null || !this._onChangeActive)) {
            this._resetValue = this._lastValueReported = newValue;
        }
        if ((this.intermediateChanges || priorityChange || priorityChange === undefined) && ((typeof newValue != typeof this._lastValueReported) || this.compare(newValue, this._lastValueReported) != 0)) {
            this._lastValueReported = newValue;
            if (this._onChangeActive) {
                if (this._onChangeHandle) {
                    clearTimeout(this._onChangeHandle);
                }
                this._onChangeHandle = setTimeout(dojo.hitch(this, function () {
                    this._onChangeHandle = null;
                    this.onChange(newValue);
                }), 0);
            }
        }
    }, create:function () {
        this.inherited(arguments);
        this._onChangeActive = true;
    }, destroy:function () {
        if (this._onChangeHandle) {
            clearTimeout(this._onChangeHandle);
            this.onChange(this._lastValueReported);
        }
        this.inherited(arguments);
    }, _onMouseDown:function (e) {
        if (this.isFocusable()) {
            var mouseUpConnector = this.connect(dojo.body(), "onmouseup", function () {
                if (this.isFocusable()) {
                    this.focus();
                }
                this.disconnect(mouseUpConnector);
            });
        }
    }, selectInputText:function (element, start, stop) {
        var _window = dojo.global;
        var _document = dojo.doc;
        element = dojo.byId(element);
        if (isNaN(start)) {
            start = 0;
        }
        if (isNaN(stop)) {
            stop = element.value ? element.value.length : 0;
        }
        dijit.focus(element);
        if (_window["getSelection"] && element.setSelectionRange) {
            element.setSelectionRange(start, stop);
        }
    }});
    dojo.declare("dojox.mobile.app._FormValueWidget", dojox.mobile.app._FormWidget, {readOnly:false, attributeMap:dojo.delegate(dojox.mobile.app._FormWidget.prototype.attributeMap, {value:"", readOnly:"focusNode"}), _setReadOnlyAttr:function (value) {
        this.readOnly = value;
        dojo.attr(this.focusNode, "readOnly", value);
    }, postCreate:function () {
        this.inherited(arguments);
        if (this._resetValue === undefined) {
            this._resetValue = this.value;
        }
    }, _setValueAttr:function (newValue, priorityChange) {
        this.value = newValue;
        this._handleOnChange(newValue, priorityChange);
    }, _getValueAttr:function () {
        return this._lastValue;
    }, undo:function () {
        this._setValueAttr(this._lastValueReported, false);
    }, reset:function () {
        this._hasBeenBlurred = false;
        this._setValueAttr(this._resetValue, true);
    }});
});

