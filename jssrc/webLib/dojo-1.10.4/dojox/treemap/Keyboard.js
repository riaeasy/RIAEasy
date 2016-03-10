//>>built

define("dojox/treemap/Keyboard", ["dojo/_base/array", "dojo/_base/lang", "dojo/_base/event", "dojo/_base/declare", "dojo/on", "dojo/keys", "dojo/dom-attr", "./_utils", "dijit/_FocusMixin"], function (arr, lang, event, declare, on, keys, domAttr, utils, _FocusMixin) {
    return declare("dojox.treemap.Keyboard", _FocusMixin, {tabIndex:"0", _setTabIndexAttr:"domNode", constructor:function () {
    }, postCreate:function () {
        this.inherited(arguments);
        this.own(on(this.domNode, "keydown", lang.hitch(this, this._onKeyDown)));
        this.own(on(this.domNode, "mousedown", lang.hitch(this, this._onMouseDown)));
    }, createRenderer:function (item, level, kind) {
        var renderer = this.inherited(arguments);
        domAttr.set(renderer, "tabindex", "-1");
        return renderer;
    }, _onMouseDown:function (e) {
        this.domNode.focus();
    }, _onKeyDown:function (e) {
        var selected = this.get("selectedItem");
        if (!selected) {
            return;
        }
        var renderer = this.itemToRenderer[this.getIdentity(selected)];
        var parent = renderer.parentItem;
        var children, childrenI, selectedI;
        if (e.keyCode != keys.UP_ARROW && e.keyCode != keys.NUMPAD_MINUS && e.keyCode != keys.NUMPAD_PLUS) {
            children = (e.keyCode == keys.DOWN_ARROW) ? selected.children : parent.children;
            if (children) {
                childrenI = utils.initElements(children, lang.hitch(this, this._computeAreaForItem)).elements;
                selectedI = childrenI[arr.indexOf(children, selected)];
                childrenI.sort(function (a, b) {
                    return b.size - a.size;
                });
            } else {
                return;
            }
        }
        var newSelected;
        switch (e.keyCode) {
          case keys.LEFT_ARROW:
            newSelected = children[childrenI[Math.max(0, arr.indexOf(childrenI, selectedI) - 1)].index];
            break;
          case keys.RIGHT_ARROW:
            newSelected = children[childrenI[Math.min(childrenI.length - 1, arr.indexOf(childrenI, selectedI) + 1)].index];
            break;
          case keys.DOWN_ARROW:
            newSelected = children[childrenI[0].index];
            break;
          case keys.UP_ARROW:
            newSelected = parent;
            break;
          case keys.NUMPAD_PLUS:
            if (!this._isLeaf(selected) && this.drillDown) {
                this.drillDown(renderer);
                event.stop(e);
            }
            break;
          case keys.NUMPAD_MINUS:
            if (!this._isLeaf(selected) && this.drillUp) {
                this.drillUp(renderer);
                event.stop(e);
            }
            break;
        }
        if (newSelected) {
            if (!this._isRoot(newSelected)) {
                this.set("selectedItem", newSelected);
                event.stop(e);
            }
        }
    }});
});

