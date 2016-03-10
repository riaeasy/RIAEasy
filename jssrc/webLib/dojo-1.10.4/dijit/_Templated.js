//>>built

define("dijit/_Templated", ["./_WidgetBase", "./_TemplatedMixin", "./_WidgetsInTemplateMixin", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/kernel"], function (_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, array, declare, lang, kernel) {
    lang.extend(_WidgetBase, {waiRole:"", waiState:""});
    return declare("dijit._Templated", [_TemplatedMixin, _WidgetsInTemplateMixin], {widgetsInTemplate:false, constructor:function () {
        kernel.deprecated(this.declaredClass + ": dijit._Templated deprecated, use dijit._TemplatedMixin and if necessary dijit._WidgetsInTemplateMixin", "", "2.0");
    }, _processNode:function (baseNode, getAttrFunc) {
        var ret = this.inherited(arguments);
        var role = getAttrFunc(baseNode, "waiRole");
        if (role) {
            baseNode.setAttribute("role", role);
        }
        var values = getAttrFunc(baseNode, "waiState");
        if (values) {
            array.forEach(values.split(/\s*,\s*/), function (stateValue) {
                if (stateValue.indexOf("-") != -1) {
                    var pair = stateValue.split("-");
                    baseNode.setAttribute("aria-" + pair[0], pair[1]);
                }
            });
        }
        return ret;
    }});
});

