//>>built

define("dijit/form/_ListBase", ["dojo/_base/declare", "dojo/on", "dojo/window"], function (declare, on, winUtils) {
    return declare("dijit.form._ListBase", null, {selected:null, _listConnect:function (eventType, callbackFuncName) {
        var self = this;
        return self.own(on(self.containerNode, on.selector(function (eventTarget, selector, target) {
            return eventTarget.parentNode == target;
        }, eventType), function (evt) {
            self[callbackFuncName](evt, this);
        }));
    }, selectFirstNode:function () {
        var first = this.containerNode.firstChild;
        while (first && first.style.display == "none") {
            first = first.nextSibling;
        }
        this._setSelectedAttr(first, true);
    }, selectLastNode:function () {
        var last = this.containerNode.lastChild;
        while (last && last.style.display == "none") {
            last = last.previousSibling;
        }
        this._setSelectedAttr(last, true);
    }, selectNextNode:function () {
        var selectedNode = this.selected;
        if (!selectedNode) {
            this.selectFirstNode();
        } else {
            var next = selectedNode.nextSibling;
            while (next && next.style.display == "none") {
                next = next.nextSibling;
            }
            if (!next) {
                this.selectFirstNode();
            } else {
                this._setSelectedAttr(next, true);
            }
        }
    }, selectPreviousNode:function () {
        var selectedNode = this.selected;
        if (!selectedNode) {
            this.selectLastNode();
        } else {
            var prev = selectedNode.previousSibling;
            while (prev && prev.style.display == "none") {
                prev = prev.previousSibling;
            }
            if (!prev) {
                this.selectLastNode();
            } else {
                this._setSelectedAttr(prev, true);
            }
        }
    }, _setSelectedAttr:function (node, scroll) {
        if (this.selected != node) {
            var selectedNode = this.selected;
            if (selectedNode) {
                this.onDeselect(selectedNode);
            }
            if (node) {
                if (scroll) {
                    winUtils.scrollIntoView(node);
                }
                this.onSelect(node);
            }
            this._set("selected", node);
        } else {
            if (node) {
                this.onSelect(node);
            }
        }
    }});
});

