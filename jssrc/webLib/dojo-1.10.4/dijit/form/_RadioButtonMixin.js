//>>built

define("dijit/form/_RadioButtonMixin", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom-attr", "dojo/_base/lang", "dojo/query!css2", "../registry"], function (array, declare, domAttr, lang, query, registry) {
    return declare("dijit.form._RadioButtonMixin", null, {type:"radio", _getRelatedWidgets:function () {
        var ary = [];
        query("input[type=radio]", this.focusNode.form || this.ownerDocument).forEach(lang.hitch(this, function (inputNode) {
            if (inputNode.name == this.name && inputNode.form == this.focusNode.form) {
                var widget = registry.getEnclosingWidget(inputNode);
                if (widget) {
                    ary.push(widget);
                }
            }
        }));
        return ary;
    }, _setCheckedAttr:function (value) {
        this.inherited(arguments);
        if (!this._created) {
            return;
        }
        if (value) {
            array.forEach(this._getRelatedWidgets(), lang.hitch(this, function (widget) {
                if (widget != this && widget.checked) {
                    widget.set("checked", false);
                }
            }));
        }
    }, _getSubmitValue:function (value) {
        return value == null ? "on" : value;
    }, _onClick:function (e) {
        if (this.checked || this.disabled) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
        if (this.readOnly) {
            e.stopPropagation();
            e.preventDefault();
            array.forEach(this._getRelatedWidgets(), lang.hitch(this, function (widget) {
                domAttr.set(this.focusNode || this.domNode, "checked", widget.checked);
            }));
            return false;
        }
        return this.inherited(arguments);
    }});
});

