//>>built

define("dojox/form/manager/_EnableMixin", ["dojo/_base/lang", "dojo/_base/kernel", "dojo/dom-attr", "./_Mixin", "dojo/_base/declare"], function (lang, dojo, domAttr, _Mixin, declare) {
    var fm = lang.getObject("dojox.form.manager", true), aa = fm.actionAdapter, ia = fm.inspectorAdapter;
    return declare("dojox.form.manager._EnableMixin", null, {gatherEnableState:function (names) {
        var result = this.inspectFormWidgets(ia(function (name, widget) {
            return !widget.get("disabled");
        }), names);
        if (this.inspectFormNodes) {
            lang.mixin(result, this.inspectFormNodes(ia(function (name, node) {
                return !domAttr.get(node, "disabled");
            }), names));
        }
        return result;
    }, enable:function (state, defaultState) {
        if (arguments.length < 2 || defaultState === undefined) {
            defaultState = true;
        }
        this.inspectFormWidgets(aa(function (name, widget, value) {
            widget.set("disabled", !value);
        }), state, defaultState);
        if (this.inspectFormNodes) {
            this.inspectFormNodes(aa(function (name, node, value) {
                domAttr.set(node, "disabled", !value);
            }), state, defaultState);
        }
        return this;
    }, disable:function (state) {
        var oldState = this.gatherEnableState();
        this.enable(state, false);
        return oldState;
    }});
});

