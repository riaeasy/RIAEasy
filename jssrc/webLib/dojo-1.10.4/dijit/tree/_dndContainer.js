//>>built

define("dijit/tree/_dndContainer", ["dojo/aspect", "dojo/_base/declare", "dojo/dom-class", "dojo/_base/lang", "dojo/on", "dojo/touch"], function (aspect, declare, domClass, lang, on, touch) {
    return declare("dijit.tree._dndContainer", null, {constructor:function (tree, params) {
        this.tree = tree;
        this.node = tree.domNode;
        lang.mixin(this, params);
        this.containerState = "";
        domClass.add(this.node, "dojoDndContainer");
        this.events = [on(this.node, touch.enter, lang.hitch(this, "onOverEvent")), on(this.node, touch.leave, lang.hitch(this, "onOutEvent")), aspect.after(this.tree, "_onNodeMouseEnter", lang.hitch(this, "onMouseOver"), true), aspect.after(this.tree, "_onNodeMouseLeave", lang.hitch(this, "onMouseOut"), true), on(this.node, "dragstart, selectstart", function (evt) {
            evt.preventDefault();
        })];
    }, destroy:function () {
        var h;
        while (h = this.events.pop()) {
            h.remove();
        }
        this.node = this.parent = null;
    }, onMouseOver:function (widget) {
        this.current = widget;
    }, onMouseOut:function () {
        this.current = null;
    }, _changeState:function (type, newState) {
        var prefix = "dojoDnd" + type;
        var state = type.toLowerCase() + "State";
        domClass.replace(this.node, prefix + newState, prefix + this[state]);
        this[state] = newState;
    }, _addItemClass:function (node, type) {
        domClass.add(node, "dojoDndItem" + type);
    }, _removeItemClass:function (node, type) {
        domClass.remove(node, "dojoDndItem" + type);
    }, onOverEvent:function () {
        this._changeState("Container", "Over");
    }, onOutEvent:function () {
        this._changeState("Container", "");
    }});
});

