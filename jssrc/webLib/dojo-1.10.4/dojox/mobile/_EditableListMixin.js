//>>built

define("dojox/mobile/_EditableListMixin", ["dojo/_base/array", "dojo/_base/connect", "dojo/_base/declare", "dojo/_base/event", "dojo/_base/window", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style", "dojo/touch", "dojo/dom-attr", "dijit/registry", "./ListItem"], function (array, connect, declare, event, win, domClass, domGeometry, domStyle, touch, domAttr, registry, ListItem) {
    return declare("dojox.mobile._EditableListMixin", null, {rightIconForEdit:"mblDomButtonGrayKnob", deleteIconForEdit:"mblDomButtonRedCircleMinus", isEditing:false, destroy:function () {
        if (this._blankItem) {
            this._blankItem.destroy();
        }
        this.inherited(arguments);
    }, _setupMoveItem:function (node) {
        domStyle.set(node, {width:domGeometry.getContentBox(node).w + "px", top:node.offsetTop + "px"});
        domClass.add(node, "mblListItemFloat");
    }, _resetMoveItem:function (node) {
        this.defer(function () {
            domClass.remove(node, "mblListItemFloat");
            domStyle.set(node, {width:"", top:""});
        });
    }, _onClick:function (e) {
        if (e && e.type === "keydown" && e.keyCode !== 13) {
            return;
        }
        if (this.onClick(e) === false) {
            return;
        }
        var item = registry.getEnclosingWidget(e.target);
        for (var n = e.target; n !== item.domNode; n = n.parentNode) {
            if (n === item.deleteIconNode) {
                connect.publish("/dojox/mobile/deleteListItem", [item]);
                this.onDeleteItem(item);
                break;
            }
        }
    }, onClick:function () {
    }, _onTouchStart:function (e) {
        if (this.getChildren().length <= 1) {
            return;
        }
        if (!this._blankItem) {
            this._blankItem = new ListItem();
        }
        var item = this._movingItem = registry.getEnclosingWidget(e.target);
        this._startIndex = this.getIndexOfChild(item);
        var rightIconPressed = false;
        for (var n = e.target; n !== item.domNode; n = n.parentNode) {
            if (n === item.rightIconNode) {
                rightIconPressed = true;
                domAttr.set(item.rightIconNode, "aria-grabbed", "true");
                domAttr.set(this.domNode, "aria-dropeffect", "move");
                break;
            }
        }
        if (!rightIconPressed) {
            return;
        }
        var ref = item.getNextSibling();
        ref = ref ? ref.domNode : null;
        this.containerNode.insertBefore(this._blankItem.domNode, ref);
        this._setupMoveItem(item.domNode);
        this.containerNode.appendChild(item.domNode);
        if (!this._conn) {
            this._conn = [this.connect(this.domNode, touch.move, "_onTouchMove"), this.connect(win.doc, touch.release, "_onTouchEnd")];
        }
        this._pos = [];
        array.forEach(this.getChildren(), function (c, index) {
            this._pos.push(domGeometry.position(c.domNode, true).y);
        }, this);
        this.touchStartY = e.touches ? e.touches[0].pageY : e.pageY;
        this._startTop = domGeometry.getMarginBox(item.domNode).t;
        event.stop(e);
    }, _onTouchMove:function (e) {
        var y = e.touches ? e.touches[0].pageY : e.pageY;
        var index = this._pos.length - 1;
        for (var i = 1; i < this._pos.length; i++) {
            if (y < this._pos[i]) {
                index = i - 1;
                break;
            }
        }
        var item = this.getChildren()[index];
        var blank = this._blankItem;
        if (item !== blank) {
            var p = item.domNode.parentNode;
            if (item.getIndexInParent() < blank.getIndexInParent()) {
                p.insertBefore(blank.domNode, item.domNode);
            } else {
                p.insertBefore(item.domNode, blank.domNode);
            }
        }
        this._movingItem.domNode.style.top = this._startTop + (y - this.touchStartY) + "px";
    }, _onTouchEnd:function (e) {
        var startIndex = this._startIndex;
        var endIndex = this.getIndexOfChild(this._blankItem);
        var ref = this._blankItem.getNextSibling();
        ref = ref ? ref.domNode : null;
        if (ref === null) {
            endIndex--;
        }
        this.containerNode.insertBefore(this._movingItem.domNode, ref);
        this.containerNode.removeChild(this._blankItem.domNode);
        this._resetMoveItem(this._movingItem.domNode);
        array.forEach(this._conn, connect.disconnect);
        this._conn = null;
        this.onMoveItem(this._movingItem, startIndex, endIndex);
        domAttr.set(this._movingItem.rightIconNode, "aria-grabbed", "false");
        domAttr.remove(this.domNode, "aria-dropeffect");
    }, startEdit:function () {
        this.isEditing = true;
        domClass.add(this.domNode, "mblEditableRoundRectList");
        array.forEach(this.getChildren(), function (child) {
            if (!child.deleteIconNode) {
                child.set("rightIcon", this.rightIconForEdit);
                if (child.rightIconNode) {
                    domAttr.set(child.rightIconNode, "role", "button");
                    domAttr.set(child.rightIconNode, "aria-grabbed", "false");
                }
                child.set("deleteIcon", this.deleteIconForEdit);
                child.deleteIconNode.tabIndex = child.tabIndex;
                if (child.deleteIconNode) {
                    domAttr.set(child.deleteIconNode, "role", "button");
                }
            }
            child.rightIconNode.style.display = "";
            child.deleteIconNode.style.display = "";
            if (typeof child.rightIconNode.style.msTouchAction != "undefined") {
                child.rightIconNode.style.msTouchAction = "none";
            }
        }, this);
        if (!this._handles) {
            this._handles = [this.connect(this.domNode, touch.press, "_onTouchStart"), this.connect(this.domNode, "onclick", "_onClick"), this.connect(this.domNode, "onkeydown", "_onClick")];
        }
        this.onStartEdit();
    }, endEdit:function () {
        domClass.remove(this.domNode, "mblEditableRoundRectList");
        array.forEach(this.getChildren(), function (child) {
            child.rightIconNode.style.display = "none";
            child.deleteIconNode.style.display = "none";
            if (typeof child.rightIconNode.style.msTouchAction != "undefined") {
                child.rightIconNode.style.msTouchAction = "auto";
            }
        });
        if (this._handles) {
            array.forEach(this._handles, this.disconnect, this);
            this._handles = null;
        }
        this.isEditing = false;
        this.onEndEdit();
    }, onDeleteItem:function (item) {
    }, onMoveItem:function (item, from, to) {
    }, onStartEdit:function () {
    }, onEndEdit:function () {
    }});
});

