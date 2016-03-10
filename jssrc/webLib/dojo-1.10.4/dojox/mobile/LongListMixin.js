//>>built

define("dojox/mobile/LongListMixin", ["dojo/_base/array", "dojo/_base/lang", "dojo/_base/declare", "dojo/sniff", "dojo/dom-construct", "dojo/dom-geometry", "dijit/registry", "./common", "./viewRegistry"], function (array, lang, declare, has, domConstruct, domGeometry, registry, dm, viewRegistry) {
    return declare("dojox.mobile.LongListMixin", null, {pageSize:20, maxPages:5, unloadPages:1, startup:function () {
        if (this._started) {
            return;
        }
        this.inherited(arguments);
        if (!this.editable) {
            this._sv = viewRegistry.getEnclosingScrollable(this.domNode);
            if (this._sv) {
                this._items = this.getChildren();
                this._clearItems();
                this.containerNode = domConstruct.create("div", null, this.domNode);
                this.connect(this._sv, "scrollTo", lang.hitch(this, this._loadItems), true);
                this.connect(this._sv, "slideTo", lang.hitch(this, this._loadItems), true);
                this._topDiv = domConstruct.create("div", null, this.domNode, "first");
                this._bottomDiv = domConstruct.create("div", null, this.domNode, "last");
                this._reloadItems();
            }
        }
    }, _loadItems:function (toPos) {
        var sv = this._sv;
        var h = sv.getDim().d.h;
        if (h <= 0) {
            return;
        }
        var cury = -sv.getPos().y;
        var posy = toPos ? -toPos.y : cury;
        var visibleYMin = Math.min(cury, posy), visibleYMax = Math.max(cury, posy) + h;
        while (this._loadedYMin > visibleYMin && this._addBefore()) {
        }
        while (this._loadedYMax < visibleYMax && this._addAfter()) {
        }
    }, _reloadItems:function () {
        this._clearItems();
        this._loadedYMin = this._loadedYMax = 0;
        this._firstIndex = 0;
        this._lastIndex = -1;
        this._topDiv.style.height = "0px";
        this._loadItems();
    }, _clearItems:function () {
        var c = this.containerNode;
        array.forEach(registry.findWidgets(c), function (item) {
            c.removeChild(item.domNode);
        });
    }, _addBefore:function () {
        var i, count;
        var oldBox = domGeometry.getMarginBox(this.containerNode);
        for (count = 0, i = this._firstIndex - 1; count < this.pageSize && i >= 0; count++, i--) {
            var item = this._items[i];
            domConstruct.place(item.domNode, this.containerNode, "first");
            if (!item._started) {
                item.startup();
            }
            this._firstIndex = i;
        }
        var newBox = domGeometry.getMarginBox(this.containerNode);
        this._adjustTopDiv(oldBox, newBox);
        if (this._lastIndex - this._firstIndex >= this.maxPages * this.pageSize) {
            var toRemove = this.unloadPages * this.pageSize;
            for (i = 0; i < toRemove; i++) {
                this.containerNode.removeChild(this._items[this._lastIndex - i].domNode);
            }
            this._lastIndex -= toRemove;
            newBox = domGeometry.getMarginBox(this.containerNode);
        }
        this._adjustBottomDiv(newBox);
        return count == this.pageSize;
    }, _addAfter:function () {
        var i, count;
        var oldBox = null;
        for (count = 0, i = this._lastIndex + 1; count < this.pageSize && i < this._items.length; count++, i++) {
            var item = this._items[i];
            domConstruct.place(item.domNode, this.containerNode);
            if (!item._started) {
                item.startup();
            }
            this._lastIndex = i;
        }
        if (this._lastIndex - this._firstIndex >= this.maxPages * this.pageSize) {
            oldBox = domGeometry.getMarginBox(this.containerNode);
            var toRemove = this.unloadPages * this.pageSize;
            for (i = 0; i < toRemove; i++) {
                this.containerNode.removeChild(this._items[this._firstIndex + i].domNode);
            }
            this._firstIndex += toRemove;
        }
        var newBox = domGeometry.getMarginBox(this.containerNode);
        if (oldBox) {
            this._adjustTopDiv(oldBox, newBox);
        }
        this._adjustBottomDiv(newBox);
        return count == this.pageSize;
    }, _adjustTopDiv:function (oldBox, newBox) {
        this._loadedYMin -= newBox.h - oldBox.h;
        this._topDiv.style.height = this._loadedYMin + "px";
    }, _adjustBottomDiv:function (newBox) {
        var h = this._lastIndex > 0 ? (this._loadedYMin + newBox.h) / this._lastIndex : 0;
        h *= this._items.length - 1 - this._lastIndex;
        this._bottomDiv.style.height = h + "px";
        this._loadedYMax = this._loadedYMin + newBox.h;
    }, _childrenChanged:function () {
        if (!this._qs_timer) {
            this._qs_timer = this.defer(function () {
                delete this._qs_timer;
                this._reloadItems();
            });
        }
    }, resize:function () {
        this.inherited(arguments);
        if (this._items) {
            this._loadItems();
        }
    }, addChild:function (widget, insertIndex) {
        if (this._items) {
            if (typeof insertIndex == "number") {
                this._items.splice(insertIndex, 0, widget);
            } else {
                this._items.push(widget);
            }
            this._childrenChanged();
        } else {
            this.inherited(arguments);
        }
    }, removeChild:function (widget) {
        if (this._items) {
            this._items.splice(typeof widget == "number" ? widget : this._items.indexOf(widget), 1);
            this._childrenChanged();
        } else {
            this.inherited(arguments);
        }
    }, getChildren:function () {
        if (this._items) {
            return this._items.slice(0);
        } else {
            return this.inherited(arguments);
        }
    }, _getSiblingOfChild:function (child, dir) {
        if (this._items) {
            var index = this._items.indexOf(child);
            if (index >= 0) {
                index = dir > 0 ? index++ : index--;
            }
            return this._items[index];
        } else {
            return this.inherited(arguments);
        }
    }, generateList:function (items) {
        if (this._items && !this.append) {
            array.forEach(this.getChildren(), function (child) {
                child.destroyRecursive();
            });
            this._items = [];
        }
        this.inherited(arguments);
    }});
});

