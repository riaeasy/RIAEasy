//>>built

define("dojox/form/manager/_ValueMixin", ["dojo/_base/lang", "dojo/_base/kernel", "dojo/_base/declare"], function (lang, dojo, declare) {
    return declare("dojox.form.manager._ValueMixin", null, {elementValue:function (name, value) {
        if (name in this.formWidgets) {
            return this.formWidgetValue(name, value);
        }
        if (this.formNodes && name in this.formNodes) {
            return this.formNodeValue(name, value);
        }
        return this.formPointValue(name, value);
    }, gatherFormValues:function (names) {
        var result = this.inspectFormWidgets(function (name) {
            return this.formWidgetValue(name);
        }, names);
        if (this.inspectFormNodes) {
            lang.mixin(result, this.inspectFormNodes(function (name) {
                return this.formNodeValue(name);
            }, names));
        }
        lang.mixin(result, this.inspectAttachedPoints(function (name) {
            return this.formPointValue(name);
        }, names));
        return result;
    }, setFormValues:function (values) {
        if (values) {
            this.inspectFormWidgets(function (name, widget, value) {
                this.formWidgetValue(name, value);
            }, values);
            if (this.inspectFormNodes) {
                this.inspectFormNodes(function (name, node, value) {
                    this.formNodeValue(name, value);
                }, values);
            }
            this.inspectAttachedPoints(function (name, node, value) {
                this.formPointValue(name, value);
            }, values);
        }
        return this;
    }});
});

