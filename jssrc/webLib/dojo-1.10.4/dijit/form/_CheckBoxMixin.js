//>>built

define("dijit/form/_CheckBoxMixin", ["dojo/_base/declare", "dojo/dom-attr"], function (declare, domAttr) {
    return declare("dijit.form._CheckBoxMixin", null, {type:"checkbox", value:"on", readOnly:false, _aria_attr:"aria-checked", _setReadOnlyAttr:function (value) {
        this._set("readOnly", value);
        domAttr.set(this.focusNode, "readOnly", value);
    }, _setLabelAttr:undefined, _getSubmitValue:function (value) {
        return (value == null || value === "") ? "on" : value;
    }, _setValueAttr:function (newValue) {
        newValue = this._getSubmitValue(newValue);
        this._set("value", newValue);
        domAttr.set(this.focusNode, "value", newValue);
    }, reset:function () {
        this.inherited(arguments);
        this._set("value", this._getSubmitValue(this.params.value));
        domAttr.set(this.focusNode, "value", this.value);
    }, _onClick:function (e) {
        if (this.readOnly) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
        return this.inherited(arguments);
    }});
});

