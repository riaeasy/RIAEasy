//>>built

define("dojox/form/manager/_DisplayMixin", ["dojo/_base/kernel", "dojo/dom-style", "dojo/_base/declare"], function (dojo, domStyle, declare) {
    return declare("dojox.form.manager._DisplayMixin", null, {gatherDisplayState:function (names) {
        var result = this.inspectAttachedPoints(function (name, node) {
            return domStyle.get(node, "display") != "none";
        }, names);
        return result;
    }, show:function (state, defaultState) {
        if (arguments.length < 2) {
            defaultState = true;
        }
        this.inspectAttachedPoints(function (name, node, value) {
            domStyle.set(node, "display", value ? "" : "none");
        }, state, defaultState);
        return this;
    }, hide:function (state) {
        return this.show(state, false);
    }});
});

