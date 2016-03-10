//>>built

define("dijit/_MenuBase", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom", "dojo/dom-attr", "dojo/dom-class", "dojo/_base/lang", "dojo/mouse", "dojo/on", "dojo/window", "./a11yclick", "./registry", "./_Widget", "./_CssStateMixin", "./_KeyNavContainer", "./_TemplatedMixin"], function (array, declare, dom, domAttr, domClass, lang, mouse, on, winUtils, a11yclick, registry, _Widget, _CssStateMixin, _KeyNavContainer, _TemplatedMixin) {
    return declare("dijit._MenuBase", [_Widget, _TemplatedMixin, _KeyNavContainer, _CssStateMixin], {selected:null, _setSelectedAttr:function (item) {
        if (this.selected != item) {
            if (this.selected) {
                this.selected._setSelected(false);
                this._onChildDeselect(this.selected);
            }
            if (item) {
                item._setSelected(true);
            }
            this._set("selected", item);
        }
    }, activated:false, _setActivatedAttr:function (val) {
        domClass.toggle(this.domNode, "dijitMenuActive", val);
        domClass.toggle(this.domNode, "dijitMenuPassive", !val);
        this._set("activated", val);
    }, parentMenu:null, popupDelay:500, passivePopupDelay:Infinity, autoFocus:false, childSelector:function (node) {
        var widget = registry.byNode(node);
        return node.parentNode == this.containerNode && widget && widget.focus;
    }, postCreate:function () {
        var self = this, matches = typeof this.childSelector == "string" ? this.childSelector : lang.hitch(this, "childSelector");
        this.own(on(this.containerNode, on.selector(matches, mouse.enter), function () {
            self.onItemHover(registry.byNode(this));
        }), on(this.containerNode, on.selector(matches, mouse.leave), function () {
            self.onItemUnhover(registry.byNode(this));
        }), on(this.containerNode, on.selector(matches, a11yclick), function (evt) {
            self.onItemClick(registry.byNode(this), evt);
            evt.stopPropagation();
        }), on(this.containerNode, on.selector(matches, "focusin"), function () {
            self._onItemFocus(registry.byNode(this));
        }));
        this.inherited(arguments);
    }, onKeyboardSearch:function (item, evt, searchString, numMatches) {
        this.inherited(arguments);
        if (!!item && (numMatches == -1 || (!!item.popup && numMatches == 1))) {
            this.onItemClick(item, evt);
        }
    }, _keyboardSearchCompare:function (item, searchString) {
        if (!!item.shortcutKey) {
            return searchString == item.shortcutKey.toLowerCase() ? -1 : 0;
        }
        return this.inherited(arguments) ? 1 : 0;
    }, onExecute:function () {
    }, onCancel:function () {
    }, _moveToPopup:function (evt) {
        if (this.focusedChild && this.focusedChild.popup && !this.focusedChild.disabled) {
            this.onItemClick(this.focusedChild, evt);
        } else {
            var topMenu = this._getTopMenu();
            if (topMenu && topMenu._isMenuBar) {
                topMenu.focusNext();
            }
        }
    }, _onPopupHover:function () {
        this.set("selected", this.currentPopupItem);
        this._stopPendingCloseTimer();
    }, onItemHover:function (item) {
        if (this.activated) {
            this.set("selected", item);
            if (item.popup && !item.disabled && !this.hover_timer) {
                this.hover_timer = this.defer(function () {
                    this._openItemPopup(item);
                }, this.popupDelay);
            }
        } else {
            if (this.passivePopupDelay < Infinity) {
                if (this.passive_hover_timer) {
                    this.passive_hover_timer.remove();
                }
                this.passive_hover_timer = this.defer(function () {
                    this.onItemClick(item, {type:"click"});
                }, this.passivePopupDelay);
            }
        }
        this._hoveredChild = item;
        item._set("hovering", true);
    }, _onChildDeselect:function (item) {
        this._stopPopupTimer();
        if (this.currentPopupItem == item) {
            this._stopPendingCloseTimer();
            this._pendingClose_timer = this.defer(function () {
                this._pendingClose_timer = null;
                this.currentPopupItem = null;
                item._closePopup();
            }, this.popupDelay);
        }
    }, onItemUnhover:function (item) {
        if (this._hoveredChild == item) {
            this._hoveredChild = null;
        }
        if (this.passive_hover_timer) {
            this.passive_hover_timer.remove();
            this.passive_hover_timer = null;
        }
        item._set("hovering", false);
    }, _stopPopupTimer:function () {
        if (this.hover_timer) {
            this.hover_timer = this.hover_timer.remove();
        }
    }, _stopPendingCloseTimer:function () {
        if (this._pendingClose_timer) {
            this._pendingClose_timer = this._pendingClose_timer.remove();
        }
    }, _getTopMenu:function () {
        for (var top = this; top.parentMenu; top = top.parentMenu) {
        }
        return top;
    }, onItemClick:function (item, evt) {
        if (this.passive_hover_timer) {
            this.passive_hover_timer.remove();
        }
        this.focusChild(item);
        if (item.disabled) {
            return false;
        }
        if (item.popup) {
            this.set("selected", item);
            this.set("activated", true);
            var byKeyboard = /^key/.test(evt._origType || evt.type) || (evt.clientX == 0 && evt.clientY == 0);
            this._openItemPopup(item, byKeyboard);
        } else {
            this.onExecute();
            item._onClick ? item._onClick(evt) : item.onClick(evt);
        }
    }, _openItemPopup:function (from_item, focus) {
        if (from_item == this.currentPopupItem) {
            return;
        }
        if (this.currentPopupItem) {
            this._stopPendingCloseTimer();
            this.currentPopupItem._closePopup();
        }
        this._stopPopupTimer();
        var popup = from_item.popup;
        popup.parentMenu = this;
        this.own(this._mouseoverHandle = on.once(popup.domNode, "mouseover", lang.hitch(this, "_onPopupHover")));
        var self = this;
        from_item._openPopup({parent:this, orient:this._orient || ["after", "before"], onCancel:function () {
            if (focus) {
                self.focusChild(from_item);
            }
            self._cleanUp();
        }, onExecute:lang.hitch(this, "_cleanUp", true), onClose:function () {
            if (self._mouseoverHandle) {
                self._mouseoverHandle.remove();
                delete self._mouseoverHandle;
            }
        }}, focus);
        this.currentPopupItem = from_item;
    }, onOpen:function () {
        this.isShowingNow = true;
        this.set("activated", true);
    }, onClose:function () {
        this.set("activated", false);
        this.set("selected", null);
        this.isShowingNow = false;
        this.parentMenu = null;
    }, _closeChild:function () {
        this._stopPopupTimer();
        if (this.currentPopupItem) {
            if (this.focused) {
                domAttr.set(this.selected.focusNode, "tabIndex", this.tabIndex);
                this.selected.focusNode.focus();
            }
            this.currentPopupItem._closePopup();
            this.currentPopupItem = null;
        }
    }, _onItemFocus:function (item) {
        if (this._hoveredChild && this._hoveredChild != item) {
            this.onItemUnhover(this._hoveredChild);
        }
        this.set("selected", item);
    }, _onBlur:function () {
        this._cleanUp(true);
        this.inherited(arguments);
    }, _cleanUp:function (clearSelectedItem) {
        this._closeChild();
        if (typeof this.isShowingNow == "undefined") {
            this.set("activated", false);
        }
        if (clearSelectedItem) {
            this.set("selected", null);
        }
    }});
});

