//>>built

define("dijit/tree/dndSource", ["dojo/_base/array", "dojo/_base/declare", "dojo/dnd/common", "dojo/dom-class", "dojo/dom-geometry", "dojo/_base/lang", "dojo/on", "dojo/touch", "dojo/topic", "dojo/dnd/Manager", "./_dndSelector"], function (array, declare, dndCommon, domClass, domGeometry, lang, on, touch, topic, DNDManager, _dndSelector) {
    var dndSource = declare("dijit.tree.dndSource", _dndSelector, {isSource:true, accept:["text", "treeNode"], copyOnly:false, dragThreshold:5, betweenThreshold:0, generateText:true, constructor:function (tree, params) {
        if (!params) {
            params = {};
        }
        lang.mixin(this, params);
        var type = params.accept instanceof Array ? params.accept : ["text", "treeNode"];
        this.accept = null;
        if (type.length) {
            this.accept = {};
            for (var i = 0; i < type.length; ++i) {
                this.accept[type[i]] = 1;
            }
        }
        this.isDragging = false;
        this.mouseDown = false;
        this.targetAnchor = null;
        this.targetBox = null;
        this.dropPosition = "";
        this._lastX = 0;
        this._lastY = 0;
        this.sourceState = "";
        if (this.isSource) {
            domClass.add(this.node, "dojoDndSource");
        }
        this.targetState = "";
        if (this.accept) {
            domClass.add(this.node, "dojoDndTarget");
        }
        this.topics = [topic.subscribe("/dnd/source/over", lang.hitch(this, "onDndSourceOver")), topic.subscribe("/dnd/start", lang.hitch(this, "onDndStart")), topic.subscribe("/dnd/drop", lang.hitch(this, "onDndDrop")), topic.subscribe("/dnd/cancel", lang.hitch(this, "onDndCancel"))];
    }, checkAcceptance:function () {
        return true;
    }, copyState:function (keyPressed) {
        return this.copyOnly || keyPressed;
    }, destroy:function () {
        this.inherited(arguments);
        var h;
        while (h = this.topics.pop()) {
            h.remove();
        }
        this.targetAnchor = null;
    }, _onDragMouse:function (e, firstTime) {
        var m = DNDManager.manager(), oldTarget = this.targetAnchor, newTarget = this.current, oldDropPosition = this.dropPosition;
        var newDropPosition = "Over";
        if (newTarget && this.betweenThreshold > 0) {
            if (!this.targetBox || oldTarget != newTarget) {
                this.targetBox = domGeometry.position(newTarget.rowNode, true);
            }
            if ((e.pageY - this.targetBox.y) <= this.betweenThreshold) {
                newDropPosition = "Before";
            } else {
                if ((e.pageY - this.targetBox.y) >= (this.targetBox.h - this.betweenThreshold)) {
                    newDropPosition = "After";
                }
            }
        }
        if (firstTime || newTarget != oldTarget || newDropPosition != oldDropPosition) {
            if (oldTarget) {
                this._removeItemClass(oldTarget.rowNode, oldDropPosition);
            }
            if (newTarget) {
                this._addItemClass(newTarget.rowNode, newDropPosition);
            }
            if (!newTarget) {
                m.canDrop(false);
            } else {
                if (newTarget == this.tree.rootNode && newDropPosition != "Over") {
                    m.canDrop(false);
                } else {
                    var dropOntoSelf = false, dropOntoParent = false;
                    if (m.source == this) {
                        dropOntoParent = (newDropPosition === "Over");
                        for (var dragId in this.selection) {
                            var dragNode = this.selection[dragId];
                            if (dragNode.item === newTarget.item) {
                                dropOntoSelf = true;
                                break;
                            }
                            if (dragNode.getParent().id !== newTarget.id) {
                                dropOntoParent = false;
                            }
                        }
                    }
                    m.canDrop(!dropOntoSelf && !dropOntoParent && !this._isParentChildDrop(m.source, newTarget.rowNode) && this.checkItemAcceptance(newTarget.rowNode, m.source, newDropPosition.toLowerCase()));
                }
            }
            this.targetAnchor = newTarget;
            this.dropPosition = newDropPosition;
        }
    }, onMouseMove:function (e) {
        if (this.isDragging && this.targetState == "Disabled") {
            return;
        }
        this.inherited(arguments);
        var m = DNDManager.manager();
        if (this.isDragging) {
            this._onDragMouse(e);
        } else {
            if (this.mouseDown && this.isSource && (Math.abs(e.pageX - this._lastX) >= this.dragThreshold || Math.abs(e.pageY - this._lastY) >= this.dragThreshold)) {
                var nodes = this.getSelectedTreeNodes();
                if (nodes.length) {
                    if (nodes.length > 1) {
                        var seen = this.selection, i = 0, r = [], n, p;
                    nextitem:
                        while ((n = nodes[i++])) {
                            for (p = n.getParent(); p && p !== this.tree; p = p.getParent()) {
                                if (seen[p.id]) {
                                    continue nextitem;
                                }
                            }
                            r.push(n);
                        }
                        nodes = r;
                    }
                    nodes = array.map(nodes, function (n) {
                        return n.domNode;
                    });
                    m.startDrag(this, nodes, this.copyState(dndCommon.getCopyKeyState(e)));
                    this._onDragMouse(e, true);
                }
            }
        }
    }, onMouseDown:function (e) {
        this.mouseDown = true;
        this.mouseButton = e.button;
        this._lastX = e.pageX;
        this._lastY = e.pageY;
        this.inherited(arguments);
    }, onMouseUp:function (e) {
        if (this.mouseDown) {
            this.mouseDown = false;
            this.inherited(arguments);
        }
    }, onMouseOut:function () {
        this.inherited(arguments);
        this._unmarkTargetAnchor();
    }, checkItemAcceptance:function () {
        return true;
    }, onDndSourceOver:function (source) {
        if (this != source) {
            this.mouseDown = false;
            this._unmarkTargetAnchor();
        } else {
            if (this.isDragging) {
                var m = DNDManager.manager();
                m.canDrop(false);
            }
        }
    }, onDndStart:function (source, nodes, copy) {
        if (this.isSource) {
            this._changeState("Source", this == source ? (copy ? "Copied" : "Moved") : "");
        }
        var accepted = this.checkAcceptance(source, nodes);
        this._changeState("Target", accepted ? "" : "Disabled");
        if (this == source) {
            DNDManager.manager().overSource(this);
        }
        this.isDragging = true;
    }, itemCreator:function (nodes) {
        return array.map(nodes, function (node) {
            return {"id":node.id, "name":node.textContent || node.innerText || ""};
        });
    }, onDndDrop:function (source, nodes, copy) {
        if (this.containerState == "Over") {
            var tree = this.tree, model = tree.model, target = this.targetAnchor;
            this.isDragging = false;
            var newParentItem;
            var insertIndex;
            var before;
            newParentItem = (target && target.item) || tree.item;
            if (this.dropPosition == "Before" || this.dropPosition == "After") {
                newParentItem = (target.getParent() && target.getParent().item) || tree.item;
                insertIndex = target.getIndexInParent();
                if (this.dropPosition == "After") {
                    insertIndex = target.getIndexInParent() + 1;
                    before = target.getNextSibling() && target.getNextSibling().item;
                } else {
                    before = target.item;
                }
            } else {
                newParentItem = (target && target.item) || tree.item;
            }
            var newItemsParams;
            array.forEach(nodes, function (node, idx) {
                var sourceItem = source.getItem(node.id);
                if (array.indexOf(sourceItem.type, "treeNode") != -1) {
                    var childTreeNode = sourceItem.data, childItem = childTreeNode.item, oldParentItem = childTreeNode.getParent().item;
                }
                if (source == this) {
                    if (typeof insertIndex == "number") {
                        if (newParentItem == oldParentItem && childTreeNode.getIndexInParent() < insertIndex) {
                            insertIndex -= 1;
                        }
                    }
                    model.pasteItem(childItem, oldParentItem, newParentItem, copy, insertIndex, before);
                } else {
                    if (model.isItem(childItem)) {
                        model.pasteItem(childItem, oldParentItem, newParentItem, copy, insertIndex, before);
                    } else {
                        if (!newItemsParams) {
                            newItemsParams = this.itemCreator(nodes, target.rowNode, source);
                        }
                        model.newItem(newItemsParams[idx], newParentItem, insertIndex, before);
                    }
                }
            }, this);
            this.tree._expandNode(target);
        }
        this.onDndCancel();
    }, onDndCancel:function () {
        this._unmarkTargetAnchor();
        this.isDragging = false;
        this.mouseDown = false;
        delete this.mouseButton;
        this._changeState("Source", "");
        this._changeState("Target", "");
    }, onOverEvent:function () {
        this.inherited(arguments);
        DNDManager.manager().overSource(this);
    }, onOutEvent:function () {
        this._unmarkTargetAnchor();
        var m = DNDManager.manager();
        if (this.isDragging) {
            m.canDrop(false);
        }
        m.outSource(this);
        this.inherited(arguments);
    }, _isParentChildDrop:function (source, targetRow) {
        if (!source.tree || source.tree != this.tree) {
            return false;
        }
        var root = source.tree.domNode;
        var ids = source.selection;
        var node = targetRow.parentNode;
        while (node != root && !ids[node.id]) {
            node = node.parentNode;
        }
        return node.id && ids[node.id];
    }, _unmarkTargetAnchor:function () {
        if (!this.targetAnchor) {
            return;
        }
        this._removeItemClass(this.targetAnchor.rowNode, this.dropPosition);
        this.targetAnchor = null;
        this.targetBox = null;
        this.dropPosition = null;
    }, _markDndStatus:function (copy) {
        this._changeState("Source", copy ? "Copied" : "Moved");
    }});
    return dndSource;
});

