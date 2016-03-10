//>>built

define("dijit/form/_ButtonMixin", ["dojo/_base/declare", "dojo/dom", "dojo/has", "../registry"], function (declare, dom, has, registry) {
    var ButtonMixin = declare("dijit.form._ButtonMixin" + (0 ? "_NoBidi" : ""), null, {label:"", type:"button", __onClick:function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (!this.disabled) {
            this.valueNode.click(e);
        }
        return false;
    }, _onClick:function (e) {
        if (this.disabled) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
        if (this.onClick(e) === false) {
            e.preventDefault();
        }
        var cancelled = e.defaultPrevented;
        if (!cancelled && this.type == "submit" && !(this.valueNode || this.focusNode).form) {
            for (var node = this.domNode; node.parentNode; node = node.parentNode) {
                var widget = registry.byNode(node);
                if (widget && typeof widget._onSubmit == "function") {
                    widget._onSubmit(e);
                    e.preventDefault();
                    cancelled = true;
                    break;
                }
            }
        }
        return !cancelled;
    }, postCreate:function () {
        this.inherited(arguments);
        dom.setSelectable(this.focusNode, false);
    }, onClick:function () {
        return true;
    }, _setLabelAttr:function (content) {
        this._set("label", content);
        var labelNode = this.containerNode || this.focusNode;
        labelNode.innerHTML = content;
    }});
    if (0) {
        ButtonMixin = declare("dijit.form._ButtonMixin", ButtonMixin, {_setLabelAttr:function () {
            this.inherited(arguments);
            var labelNode = this.containerNode || this.focusNode;
            this.applyTextDir(labelNode);
        }});
    }
    return ButtonMixin;
});

