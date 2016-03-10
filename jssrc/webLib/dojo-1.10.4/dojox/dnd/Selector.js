//>>built

define("dojox/dnd/Selector", ["dojo", "dojox", "dojo/dnd/Selector"], function (dojo, dojox) {
    return dojo.declare("dojox.dnd.Selector", dojo.dnd.Selector, {conservative:true, isSelected:function (node) {
        var id = dojo.isString(node) ? node : node.id, item = this.getItem(id);
        return item && this.selected[id];
    }, selectNode:function (node, add) {
        if (!add) {
            this.selectNone();
        }
        var id = dojo.isString(node) ? node : node.id, item = this.getItem(id);
        if (item) {
            this._removeAnchor();
            this.anchor = dojo.byId(node);
            this._addItemClass(this.anchor, "Anchor");
            this.selection[id] = 1;
            this._addItemClass(this.anchor, "Selected");
        }
        return this;
    }, deselectNode:function (node) {
        var id = dojo.isString(node) ? node : node.id, item = this.getItem(id);
        if (item && this.selection[id]) {
            if (this.anchor === dojo.byId(node)) {
                this._removeAnchor();
            }
            delete this.selection[id];
            this._removeItemClass(this.anchor, "Selected");
        }
        return this;
    }, selectByBBox:function (left, top, right, bottom, add) {
        if (!add) {
            this.selectNone();
        }
        this.forInItems(function (data, id) {
            var node = dojo.byId(id);
            if (node && this._isBoundedByBox(node, left, top, right, bottom)) {
                this.selectNode(id, true);
            }
        }, this);
        return this;
    }, _isBoundedByBox:function (node, left, top, right, bottom) {
        return this.conservative ? this._conservativeBBLogic(node, left, top, right, bottom) : this._liberalBBLogic(node, left, top, right, bottom);
    }, shift:function (toNext, add) {
        var selectedNodes = this.getSelectedNodes();
        if (selectedNodes && selectedNodes.length) {
            this.selectNode(this._getNodeId(selectedNodes[selectedNodes.length - 1].id, toNext), add);
        }
    }, _getNodeId:function (nodeId, toNext) {
        var allNodes = this.getAllNodes(), newId = nodeId;
        for (var i = 0, l = allNodes.length; i < l; ++i) {
            if (allNodes[i].id == nodeId) {
                var j = Math.min(l - 1, Math.max(0, i + (toNext ? 1 : -1)));
                if (i != j) {
                    newId = allNodes[j].id;
                }
                break;
            }
        }
        return newId;
    }, _conservativeBBLogic:function (node, left, top, right, bottom) {
        var c = dojo.coords(node), t;
        if (left > right) {
            t = left;
            left = right;
            right = t;
        }
        if (top > bottom) {
            t = top;
            top = bottom;
            bottom = t;
        }
        return c.x >= left && c.x + c.w <= right && c.y >= top && c.y + c.h <= bottom;
    }, _liberalBBLogic:function (node, left, top, right, bottom) {
        var c = dojo.position(node), xBounded, yBounded, tlx, tly, brx, bry, leftGreater = false, bottomGreater = false, nodeTlx = c.x, nodeTly = c.y, nodeBrx = c.x + c.w, nodeBry = c.y + c.h;
        if (left < right) {
            tlx = left;
            tly = top;
        } else {
            leftGreater = true;
            tlx = right;
            tly = bottom;
        }
        if (top < bottom) {
            bottomGreater = true;
            brx = right;
            bry = bottom;
        } else {
            brx = left;
            bry = top;
            tlx = right;
            tly = bottom;
        }
        if (leftGreater && bottomGreater) {
            brx = left;
            bry = bottom;
            tlx = right;
            tly = top;
        }
        xBounded = (nodeTlx >= tlx || nodeBrx <= brx) && (tlx <= nodeBrx && brx >= nodeTlx) || (nodeTlx <= tlx && nodeBrx >= brx);
        yBounded = (tly <= nodeBry && bry >= nodeTly) || (nodeBry >= bry && nodeTly <= bry);
        return xBounded && yBounded;
    }});
});

