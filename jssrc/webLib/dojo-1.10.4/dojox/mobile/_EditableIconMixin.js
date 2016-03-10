//>>built

define("dojox/mobile/_EditableIconMixin", ["dojo/_base/array", "dojo/_base/connect", "dojo/_base/declare", "dojo/_base/event", "dojo/_base/lang", "dojo/_base/window", "dojo/dom-geometry", "dojo/dom-style", "dojo/touch", "dijit/registry", "./IconItem", "./sniff", "./viewRegistry", "./_css3"], function (array, connect, declare, event, lang, win, domGeometry, domStyle, touch, registry, IconItem, has, viewRegistry, css3) {
    return declare("dojox.mobile._EditableIconMixin", null, {deleteIconForEdit:"mblDomButtonBlackCircleCross", threshold:4, destroy:function () {
        if (this._blankItem) {
            this._blankItem.destroy();
        }
        this.inherited(arguments);
    }, startEdit:function () {
        if (!this.editable || this.isEditing) {
            return;
        }
        this.isEditing = true;
        if (!this._handles) {
            this._handles = [this.connect(this.domNode, css3.name("transitionStart"), "_onTransitionStart"), this.connect(this.domNode, css3.name("transitionEnd"), "_onTransitionEnd")];
        }
        var count = 0;
        array.forEach(this.getChildren(), function (w) {
            this.defer(function () {
                w.set("deleteIcon", this.deleteIconForEdit);
                if (w.deleteIconNode) {
                    w._deleteHandle = this.connect(w.deleteIconNode, "onclick", "_deleteIconClicked");
                }
                w.highlight(0);
            }, 15 * count++);
        }, this);
        connect.publish("/dojox/mobile/startEdit", [this]);
        this.onStartEdit();
    }, endEdit:function () {
        if (!this.isEditing) {
            return;
        }
        array.forEach(this.getChildren(), function (w) {
            w.unhighlight();
            if (w._deleteHandle) {
                this.disconnect(w._deleteHandle);
                w._deleteHandle = null;
            }
            w.set("deleteIcon", "");
        }, this);
        this._movingItem = null;
        if (this._handles) {
            array.forEach(this._handles, this.disconnect, this);
            this._handles = null;
        }
        connect.publish("/dojox/mobile/endEdit", [this]);
        this.onEndEdit();
        this.isEditing = false;
    }, scaleItem:function (widget, ratio) {
        domStyle.set(widget.domNode, css3.add({}, {transition:has("android") ? "" : css3.name("transform", true) + " .1s ease-in-out", transform:ratio == 1 ? "" : "scale(" + ratio + ")"}));
    }, _onTransitionStart:function (e) {
        event.stop(e);
    }, _onTransitionEnd:function (e) {
        event.stop(e);
        var w = registry.getEnclosingWidget(e.target);
        w._moving = false;
        domStyle.set(w.domNode, css3.name("transition"), "");
    }, _onTouchStart:function (e) {
        if (!this._blankItem) {
            this._blankItem = new IconItem();
            this._blankItem.domNode.style.visibility = "hidden";
            this._blankItem._onClick = function () {
            };
        }
        var item = this._movingItem = registry.getEnclosingWidget(e.target);
        var iconPressed = false;
        var n;
        for (n = e.target; n !== item.domNode; n = n.parentNode) {
            if (n === item.iconNode) {
                iconPressed = true;
                break;
            }
        }
        if (!iconPressed) {
            return;
        }
        if (!this._conn) {
            this._conn = [this.connect(this.domNode, touch.move, "_onTouchMove"), this.connect(win.doc, touch.release, "_onTouchEnd")];
        }
        this._touchStartPosX = e.touches ? e.touches[0].pageX : e.pageX;
        this._touchStartPosY = e.touches ? e.touches[0].pageY : e.pageY;
        if (this.isEditing) {
            this._onDragStart(e);
        } else {
            this._pressTimer = this.defer(function () {
                this.startEdit();
                this._onDragStart(e);
            }, 1000);
        }
    }, _onDragStart:function (e) {
        this._dragging = true;
        var movingItem = this._movingItem;
        if (movingItem.get("selected")) {
            movingItem.set("selected", false);
        }
        this.scaleItem(movingItem, 1.1);
        var x = e.touches ? e.touches[0].pageX : e.pageX;
        var y = e.touches ? e.touches[0].pageY : e.pageY;
        var enclosingScrollable = viewRegistry.getEnclosingScrollable(movingItem.domNode);
        var dx = 0;
        var dy = 0;
        if (enclosingScrollable) {
            var pos = enclosingScrollable.getPos();
            dx = pos.x;
            dy = pos.y;
            event.stop(e);
        }
        var startPos = this._startPos = domGeometry.position(movingItem.domNode, true);
        this._offsetPos = {x:startPos.x - x - dx, y:startPos.y - y - dy};
        this._startIndex = this.getIndexOfChild(movingItem);
        this.addChild(this._blankItem, this._startIndex);
        this.moveChild(movingItem, this.getChildren().length);
        domStyle.set(movingItem.domNode, {position:"absolute", top:(startPos.y - dy) + "px", left:(startPos.x - dx) + "px", zIndex:100});
    }, _onTouchMove:function (e) {
        var x = e.touches ? e.touches[0].pageX : e.pageX;
        var y = e.touches ? e.touches[0].pageY : e.pageY;
        if (this._dragging) {
            domStyle.set(this._movingItem.domNode, {top:(this._offsetPos.y + y) + "px", left:(this._offsetPos.x + x) + "px"});
            this._detectOverlap({x:x, y:y});
            event.stop(e);
        } else {
            var dx = Math.abs(this._touchStartPosX - x);
            var dy = Math.abs(this._touchStartPosY - y);
            if (dx > this.threshold || dy > this.threshold) {
                this._clearPressTimer();
            }
        }
    }, _onTouchEnd:function (e) {
        this._clearPressTimer();
        if (this._conn) {
            array.forEach(this._conn, this.disconnect, this);
            this._conn = null;
        }
        if (this._dragging) {
            this._dragging = false;
            var movingItem = this._movingItem;
            this.scaleItem(movingItem, 1);
            domStyle.set(movingItem.domNode, {position:"", top:"", left:"", zIndex:""});
            var startIndex = this._startIndex;
            var endIndex = this.getIndexOfChild(this._blankItem);
            this.moveChild(movingItem, endIndex);
            this.removeChild(this._blankItem);
            connect.publish("/dojox/mobile/moveIconItem", [this, movingItem, startIndex, endIndex]);
            this.onMoveItem(movingItem, startIndex, endIndex);
        }
    }, _clearPressTimer:function () {
        if (this._pressTimer) {
            this._pressTimer.remove();
            this._pressTimer = null;
        }
    }, _detectOverlap:function (point) {
        var children = this.getChildren(), blankItem = this._blankItem, blankPos = domGeometry.position(blankItem.domNode, true), blankIndex = this.getIndexOfChild(blankItem), dir = 1, i, w, pos;
        if (this._contains(point, blankPos)) {
            return;
        } else {
            if (point.y < blankPos.y || (point.y <= blankPos.y + blankPos.h && point.x < blankPos.x)) {
                dir = -1;
            }
        }
        for (i = blankIndex + dir; i >= 0 && i < children.length - 1; i += dir) {
            w = children[i];
            if (w._moving) {
                continue;
            }
            pos = domGeometry.position(w.domNode, true);
            if (this._contains(point, pos)) {
                this.defer(function () {
                    this.moveChildWithAnimation(blankItem, dir == 1 ? i + 1 : i);
                });
                break;
            } else {
                if ((dir == 1 && pos.y > point.y) || (dir == -1 && pos.y + pos.h < point.y)) {
                    break;
                }
            }
        }
    }, _contains:function (point, pos) {
        return pos.x < point.x && point.x < pos.x + pos.w && pos.y < point.y && point.y < pos.y + pos.h;
    }, _animate:function (from, to) {
        if (from == to) {
            return;
        }
        var dir = from < to ? 1 : -1;
        var children = this.getChildren();
        var posArray = [];
        var i, j;
        for (i = from; i != to; i += dir) {
            posArray.push({t:(children[i + dir].domNode.offsetTop - children[i].domNode.offsetTop) + "px", l:(children[i + dir].domNode.offsetLeft - children[i].domNode.offsetLeft) + "px"});
        }
        for (i = from, j = 0; i != to; i += dir, j++) {
            var w = children[i];
            w._moving = true;
            domStyle.set(w.domNode, {top:posArray[j].t, left:posArray[j].l});
            this.defer(lang.hitch(w, function () {
                domStyle.set(this.domNode, css3.add({top:"0px", left:"0px"}, {transition:"top .3s ease-in-out, left .3s ease-in-out"}));
            }), j * 10);
        }
    }, removeChildWithAnimation:function (widget) {
        var index = (typeof widget === "number") ? widget : this.getIndexOfChild(widget);
        this.removeChild(widget);
        if (this._blankItem) {
            this.addChild(this._blankItem);
        }
        this._animate(index, this.getChildren().length - 1);
        if (this._blankItem) {
            this.removeChild(this._blankItem);
        }
    }, moveChild:function (widget, insertIndex) {
        this.addChild(widget, insertIndex);
        this.paneContainerWidget.addChild(widget.paneWidget, insertIndex);
    }, moveChildWithAnimation:function (widget, insertIndex) {
        var index = this.getIndexOfChild(this._blankItem);
        this.moveChild(widget, insertIndex);
        this._animate(index, insertIndex);
    }, _deleteIconClicked:function (e) {
        if (this.deleteIconClicked(e) === false) {
            return;
        }
        var item = registry.getEnclosingWidget(e.target);
        this.deleteItem(item);
    }, deleteIconClicked:function () {
    }, deleteItem:function (item) {
        if (item._deleteHandle) {
            this.disconnect(item._deleteHandle);
        }
        this.removeChildWithAnimation(item);
        connect.publish("/dojox/mobile/deleteIconItem", [this, item]);
        this.onDeleteItem(item);
        item.destroy();
    }, onDeleteItem:function (item) {
    }, onMoveItem:function (item, from, to) {
    }, onStartEdit:function () {
    }, onEndEdit:function () {
    }, _setEditableAttr:function (editable) {
        this._set("editable", editable);
        if (editable && !this._touchStartHandle) {
            this._touchStartHandle = this.connect(this.domNode, touch.press, "_onTouchStart");
        } else {
            if (!editable && this._touchStartHandle) {
                this.disconnect(this._touchStartHandle);
                this._touchStartHandle = null;
            }
        }
    }});
});

