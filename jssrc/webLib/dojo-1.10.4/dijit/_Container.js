//>>built

define("dijit/_Container", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom-construct", "dojo/_base/kernel"], function (array, declare, domConstruct, kernel) {
    return declare("dijit._Container", null, {buildRendering:function () {
        this.inherited(arguments);
        if (!this.containerNode) {
            this.containerNode = this.domNode;
        }
    }, addChild:function (widget, insertIndex) {
        var refNode = this.containerNode;
        if (insertIndex > 0) {
            refNode = refNode.firstChild;
            while (insertIndex > 0) {
                if (refNode.nodeType == 1) {
                    insertIndex--;
                }
                refNode = refNode.nextSibling;
            }
            if (refNode) {
                insertIndex = "before";
            } else {
                refNode = this.containerNode;
                insertIndex = "last";
            }
        }
        domConstruct.place(widget.domNode, refNode, insertIndex);
        if (this._started && !widget._started) {
            widget.startup();
        }
    }, removeChild:function (widget) {
        if (typeof widget == "number") {
            widget = this.getChildren()[widget];
        }
        if (widget) {
            var node = widget.domNode;
            if (node && node.parentNode) {
                node.parentNode.removeChild(node);
            }
        }
    }, hasChildren:function () {
        return this.getChildren().length > 0;
    }, _getSiblingOfChild:function (child, dir) {
        kernel.deprecated(this.declaredClass + "::_getSiblingOfChild() is deprecated. Use _KeyNavMixin::_getNext() instead.", "", "2.0");
        var children = this.getChildren(), idx = array.indexOf(children, child);
        return children[idx + dir];
    }, getIndexOfChild:function (child) {
        return array.indexOf(this.getChildren(), child);
    }});
});

