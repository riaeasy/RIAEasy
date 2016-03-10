//>>built

define("dijit/form/_FormValueMixin", ["dojo/_base/declare", "dojo/dom-attr", "dojo/keys", "dojo/_base/lang", "dojo/on", "./_FormWidgetMixin"], function (declare, domAttr, keys, lang, on, _FormWidgetMixin) {
    return declare("dijit.form._FormValueMixin", _FormWidgetMixin, {readOnly:false, _setReadOnlyAttr:function (value) {
        domAttr.set(this.focusNode, "readOnly", value);
        this._set("readOnly", value);
    }, postCreate:function () {
        this.inherited(arguments);
        if (this._resetValue === undefined) {
            this._lastValueReported = this._resetValue = this.value;
        }
    }, _setValueAttr:function (newValue, priorityChange) {
        this._handleOnChange(newValue, priorityChange);
    }, _handleOnChange:function (newValue, priorityChange) {
        this._set("value", newValue);
        this.inherited(arguments);
    }, undo:function () {
        this._setValueAttr(this._lastValueReported, false);
    }, reset:function () {
        this._hasBeenBlurred = false;
        this._setValueAttr(this._resetValue, true);
    }});
});

