//>>built

define("dojox/mobile/viewRegistry", ["dojo/_base/array", "dojo/dom-class", "dijit/registry"], function (array, domClass, registry) {
    var viewRegistry = {length:0, hash:{}, initialView:null, add:function (view) {
        this.hash[view.id] = view;
        this.length++;
    }, remove:function (id) {
        if (this.hash[id]) {
            delete this.hash[id];
            this.length--;
        }
    }, getViews:function () {
        var arr = [];
        for (var i in this.hash) {
            arr.push(this.hash[i]);
        }
        return arr;
    }, getParentView:function (view) {
        for (var v = view.getParent(); v; v = v.getParent()) {
            if (domClass.contains(v.domNode, "mblView")) {
                return v;
            }
        }
        return null;
    }, getChildViews:function (parent) {
        return array.filter(this.getViews(), function (v) {
            return this.getParentView(v) === parent;
        }, this);
    }, getEnclosingView:function (node) {
        for (var n = node; n && n.tagName !== "BODY"; n = n.parentNode) {
            if (n.nodeType === 1 && domClass.contains(n, "mblView")) {
                return registry.byNode(n);
            }
        }
        return null;
    }, getEnclosingScrollable:function (node) {
        for (var w = registry.getEnclosingWidget(node); w; w = w.getParent()) {
            if (w.scrollableParams && w._v) {
                return w;
            }
        }
        return null;
    }};
    return viewRegistry;
});

