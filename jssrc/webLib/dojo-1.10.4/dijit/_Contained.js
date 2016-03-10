//>>built

define("dijit/_Contained", ["dojo/_base/declare", "./registry"], function (declare, registry) {
    return declare("dijit._Contained", null, {_getSibling:function (which) {
        var node = this.domNode;
        do {
            node = node[which + "Sibling"];
        } while (node && node.nodeType != 1);
        return node && registry.byNode(node);
    }, getPreviousSibling:function () {
        return this._getSibling("previous");
    }, getNextSibling:function () {
        return this._getSibling("next");
    }, getIndexInParent:function () {
        var p = this.getParent();
        if (!p || !p.getIndexOfChild) {
            return -1;
        }
        return p.getIndexOfChild(this);
    }});
});

