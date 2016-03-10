//>>built

define("dijit/tree/_dndSelector", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/kernel", "dojo/_base/lang", "dojo/dnd/common", "dojo/dom", "dojo/mouse", "dojo/on", "dojo/touch", "../a11yclick", "./_dndContainer"], function (array, declare, kernel, lang, dndCommon, dom, mouse, on, touch, a11yclick, _dndContainer) {
    return declare("dijit.tree._dndSelector", _dndContainer, {constructor:function () {
        this.selection = {};
        this.anchor = null;
        this.events.push(on(this.tree.domNode, touch.press, lang.hitch(this, "onMouseDown")), on(this.tree.domNode, touch.release, lang.hitch(this, "onMouseUp")), on(this.tree.domNode, touch.move, lang.hitch(this, "onMouseMove")), on(this.tree.domNode, a11yclick.press, lang.hitch(this, "onClickPress")), on(this.tree.domNode, a11yclick.release, lang.hitch(this, "onClickRelease")));
    }, singular:false, getSelectedTreeNodes:function () {
        var nodes = [], sel = this.selection;
        for (var i in sel) {
            nodes.push(sel[i]);
        }
        return nodes;
    }, selectNone:function () {
        this.setSelection([]);
        return this;
    }, destroy:function () {
        this.inherited(arguments);
        this.selection = this.anchor = null;
    }, addTreeNode:function (node, isAnchor) {
        this.setSelection(this.getSelectedTreeNodes().concat([node]));
        if (isAnchor) {
            this.anchor = node;
        }
        return node;
    }, removeTreeNode:function (node) {
        var newSelection = array.filter(this.getSelectedTreeNodes(), function (selectedNode) {
            return !dom.isDescendant(selectedNode.domNode, node.domNode);
        });
        this.setSelection(newSelection);
        return node;
    }, isTreeNodeSelected:function (node) {
        return node.id && !!this.selection[node.id];
    }, setSelection:function (newSelection) {
        var oldSelection = this.getSelectedTreeNodes();
        array.forEach(this._setDifference(oldSelection, newSelection), lang.hitch(this, function (node) {
            node.setSelected(false);
            if (this.anchor == node) {
                delete this.anchor;
            }
            delete this.selection[node.id];
        }));
        array.forEach(this._setDifference(newSelection, oldSelection), lang.hitch(this, function (node) {
            node.setSelected(true);
            this.selection[node.id] = node;
        }));
        this._updateSelectionProperties();
    }, _setDifference:function (xs, ys) {
        array.forEach(ys, function (y) {
            y.__exclude__ = true;
        });
        var ret = array.filter(xs, function (x) {
            return !x.__exclude__;
        });
        array.forEach(ys, function (y) {
            delete y["__exclude__"];
        });
        return ret;
    }, _updateSelectionProperties:function () {
        var selected = this.getSelectedTreeNodes();
        var paths = [], nodes = [];
        array.forEach(selected, function (node) {
            var ary = node.getTreePath();
            nodes.push(node);
            paths.push(ary);
        }, this);
        var items = array.map(nodes, function (node) {
            return node.item;
        });
        this.tree._set("paths", paths);
        this.tree._set("path", paths[0] || []);
        this.tree._set("selectedNodes", nodes);
        this.tree._set("selectedNode", nodes[0] || null);
        this.tree._set("selectedItems", items);
        this.tree._set("selectedItem", items[0] || null);
    }, onClickPress:function (e) {
        if (this.current && this.current.isExpandable && this.tree.isExpandoNode(e.target, this.current)) {
            return;
        }
        if (e.type == "mousedown" && mouse.isLeft(e)) {
            e.preventDefault();
        }
        var treeNode = e.type == "keydown" ? this.tree.focusedChild : this.current;
        if (!treeNode) {
            return;
        }
        var copy = dndCommon.getCopyKeyState(e), id = treeNode.id;
        if (!this.singular && !e.shiftKey && this.selection[id]) {
            this._doDeselect = true;
            return;
        } else {
            this._doDeselect = false;
        }
        this.userSelect(treeNode, copy, e.shiftKey);
    }, onClickRelease:function (e) {
        if (!this._doDeselect) {
            return;
        }
        this._doDeselect = false;
        this.userSelect(e.type == "keyup" ? this.tree.focusedChild : this.current, dndCommon.getCopyKeyState(e), e.shiftKey);
    }, onMouseMove:function () {
        this._doDeselect = false;
    }, onMouseDown:function () {
    }, onMouseUp:function () {
    }, _compareNodes:function (n1, n2) {
        if (n1 === n2) {
            return 0;
        }
        if ("sourceIndex" in document.documentElement) {
            return n1.sourceIndex - n2.sourceIndex;
        } else {
            if ("compareDocumentPosition" in document.documentElement) {
                return n1.compareDocumentPosition(n2) & 2 ? 1 : -1;
            } else {
                if (document.createRange) {
                    var r1 = doc.createRange();
                    r1.setStartBefore(n1);
                    var r2 = doc.createRange();
                    r2.setStartBefore(n2);
                    return r1.compareBoundaryPoints(r1.END_TO_END, r2);
                } else {
                    throw Error("dijit.tree._compareNodes don't know how to compare two different nodes in this browser");
                }
            }
        }
    }, userSelect:function (node, multi, range) {
        if (this.singular) {
            if (this.anchor == node && multi) {
                this.selectNone();
            } else {
                this.setSelection([node]);
                this.anchor = node;
            }
        } else {
            if (range && this.anchor) {
                var cr = this._compareNodes(this.anchor.rowNode, node.rowNode), begin, end, anchor = this.anchor;
                if (cr < 0) {
                    begin = anchor;
                    end = node;
                } else {
                    begin = node;
                    end = anchor;
                }
                var nodes = [];
                while (begin != end) {
                    nodes.push(begin);
                    begin = this.tree._getNext(begin);
                }
                nodes.push(end);
                this.setSelection(nodes);
            } else {
                if (this.selection[node.id] && multi) {
                    this.removeTreeNode(node);
                } else {
                    if (multi) {
                        this.addTreeNode(node, true);
                    } else {
                        this.setSelection([node]);
                        this.anchor = node;
                    }
                }
            }
        }
    }, getItem:function (key) {
        var widget = this.selection[key];
        return {data:widget, type:["treeNode"]};
    }, forInSelectedItems:function (f, o) {
        o = o || kernel.global;
        for (var id in this.selection) {
            f.call(o, this.getItem(id), id, this);
        }
    }});
});

