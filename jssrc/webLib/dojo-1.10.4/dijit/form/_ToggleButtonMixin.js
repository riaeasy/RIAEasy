//>>built

define("dijit/form/_ToggleButtonMixin", ["dojo/_base/declare", "dojo/dom-attr"], function (declare, domAttr) {
    return declare("dijit.form._ToggleButtonMixin", null, {checked:false, _aria_attr:"aria-pressed", _onClick:function (evt) {
        var original = this.checked;
        this._set("checked", !original);
        var ret = this.inherited(arguments);
        this.set("checked", ret ? this.checked : original);
        return ret;
    }, _setCheckedAttr:function (value, priorityChange) {
        this._set("checked", value);
        var node = this.focusNode || this.domNode;
        if (this._created) {
            if (domAttr.get(node, "checked") != !!value) {
                domAttr.set(node, "checked", !!value);
            }
        }
        node.setAttribute(this._aria_attr, String(value));
        this._handleOnChange(value, priorityChange);
    }, postCreate:function () {
        this.inherited(arguments);
        var node = this.focusNode || this.domNode;
        if (this.checked) {
            node.setAttribute("checked", "checked");
        }
        if (this._resetValue === undefined) {
            this._lastValueReported = this._resetValue = this.checked;
        }
    }, reset:function () {
        this._hasBeenBlurred = false;
        this.set("checked", this.params.checked || false);
    }});
});

