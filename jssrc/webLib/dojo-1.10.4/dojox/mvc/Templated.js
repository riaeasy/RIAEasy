//>>built

define("dojox/mvc/Templated", ["dojo/_base/declare", "dojo/_base/lang", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "./at"], function (declare, lang, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin) {
    return declare("dojox.mvc.Templated", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {bindings:null, startup:function () {
        var bindings = lang.isFunction(this.bindings) && this.bindings.call(this) || this.bindings;
        for (var s in bindings) {
            var w = this[s], props = bindings[s];
            if (w) {
                for (var prop in props) {
                    w.set(prop, props[prop]);
                }
            } else {
                console.warn("Widget with the following attach point was not found: " + s);
            }
        }
        this.inherited(arguments);
    }});
});

