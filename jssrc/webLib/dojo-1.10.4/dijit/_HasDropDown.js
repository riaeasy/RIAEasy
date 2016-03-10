//>>built

define("dijit/_HasDropDown", ["dojo/_base/declare", "dojo/_base/Deferred", "dojo/dom", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style", "dojo/has", "dojo/keys", "dojo/_base/lang", "dojo/on", "dojo/touch", "./registry", "./focus", "./popup", "./_FocusMixin"], function (declare, Deferred, dom, domAttr, domClass, domGeometry, domStyle, has, keys, lang, on, touch, registry, focus, popup, _FocusMixin) {
    return declare("dijit._HasDropDown", _FocusMixin, {_buttonNode:null, _arrowWrapperNode:null, _popupStateNode:null, _aroundNode:null, dropDown:null, autoWidth:true, forceWidth:false, maxHeight:-1, dropDownPosition:["below", "above"], _stopClickEvents:true, _onDropDownMouseDown:function (e) {
        if (this.disabled || this.readOnly) {
            return;
        }
        if (e.type != "MSPointerDown" && e.type != "pointerdown") {
            e.preventDefault();
        }
        this.own(on.once(this.ownerDocument, touch.release, lang.hitch(this, "_onDropDownMouseUp")));
        this.toggleDropDown();
    }, _onDropDownMouseUp:function (e) {
        var dropDown = this.dropDown, overMenu = false;
        if (e && this._opened) {
            var c = domGeometry.position(this._buttonNode, true);
            if (!(e.pageX >= c.x && e.pageX <= c.x + c.w) || !(e.pageY >= c.y && e.pageY <= c.y + c.h)) {
                var t = e.target;
                while (t && !overMenu) {
                    if (domClass.contains(t, "dijitPopup")) {
                        overMenu = true;
                    } else {
                        t = t.parentNode;
                    }
                }
                if (overMenu) {
                    t = e.target;
                    if (dropDown.onItemClick) {
                        var menuItem;
                        while (t && !(menuItem = registry.byNode(t))) {
                            t = t.parentNode;
                        }
                        if (menuItem && menuItem.onClick && menuItem.getParent) {
                            menuItem.getParent().onItemClick(menuItem, e);
                        }
                    }
                    return;
                }
            }
        }
        if (this._opened) {
            if (dropDown.focus && (dropDown.autoFocus !== false || (e.type == "mouseup" && !this.hovering))) {
                this._focusDropDownTimer = this.defer(function () {
                    dropDown.focus();
                    delete this._focusDropDownTimer;
                });
            }
        } else {
            if (this.focus) {
                this.defer("focus");
            }
        }
    }, _onDropDownClick:function (e) {
        if (this._stopClickEvents) {
            e.stopPropagation();
            e.preventDefault();
        }
    }, buildRendering:function () {
        this.inherited(arguments);
        this._buttonNode = this._buttonNode || this.focusNode || this.domNode;
        this._popupStateNode = this._popupStateNode || this.focusNode || this._buttonNode;
        var defaultPos = {"after":this.isLeftToRight() ? "Right" : "Left", "before":this.isLeftToRight() ? "Left" : "Right", "above":"Up", "below":"Down", "left":"Left", "right":"Right"}[this.dropDownPosition[0]] || this.dropDownPosition[0] || "Down";
        domClass.add(this._arrowWrapperNode || this._buttonNode, "dijit" + defaultPos + "ArrowButton");
    }, postCreate:function () {
        this.inherited(arguments);
        var keyboardEventNode = this.focusNode || this.domNode;
        this.own(on(this._buttonNode, touch.press, lang.hitch(this, "_onDropDownMouseDown")), on(this._buttonNode, "click", lang.hitch(this, "_onDropDownClick")), on(keyboardEventNode, "keydown", lang.hitch(this, "_onKey")), on(keyboardEventNode, "keyup", lang.hitch(this, "_onKeyUp")));
    }, destroy:function () {
        if (this._opened) {
            this.closeDropDown(true);
        }
        if (this.dropDown) {
            if (!this.dropDown._destroyed) {
                this.dropDown.destroyRecursive();
            }
            delete this.dropDown;
        }
        this.inherited(arguments);
    }, _onKey:function (e) {
        if (this.disabled || this.readOnly) {
            return;
        }
        var d = this.dropDown, target = e.target;
        if (d && this._opened && d.handleKey) {
            if (d.handleKey(e) === false) {
                e.stopPropagation();
                e.preventDefault();
                return;
            }
        }
        if (d && this._opened && e.keyCode == keys.ESCAPE) {
            this.closeDropDown();
            e.stopPropagation();
            e.preventDefault();
        } else {
            if (!this._opened && (e.keyCode == keys.DOWN_ARROW || ((e.keyCode == keys.ENTER || (e.keyCode == keys.SPACE && (!this._searchTimer || (e.ctrlKey || e.altKey || e.metaKey)))) && ((target.tagName || "").toLowerCase() !== "input" || (target.type && target.type.toLowerCase() !== "text"))))) {
                this._toggleOnKeyUp = true;
                e.stopPropagation();
                e.preventDefault();
            }
        }
    }, _onKeyUp:function () {
        if (this._toggleOnKeyUp) {
            delete this._toggleOnKeyUp;
            this.toggleDropDown();
            var d = this.dropDown;
            if (d && d.focus) {
                this.defer(lang.hitch(d, "focus"), 1);
            }
        }
    }, _onBlur:function () {
        this.closeDropDown(false);
        this.inherited(arguments);
    }, isLoaded:function () {
        return true;
    }, loadDropDown:function (loadCallback) {
        loadCallback();
    }, loadAndOpenDropDown:function () {
        var d = new Deferred(), afterLoad = lang.hitch(this, function () {
            this.openDropDown();
            d.resolve(this.dropDown);
        });
        if (!this.isLoaded()) {
            this.loadDropDown(afterLoad);
        } else {
            afterLoad();
        }
        return d;
    }, toggleDropDown:function () {
        if (this.disabled || this.readOnly) {
            return;
        }
        if (!this._opened) {
            this.loadAndOpenDropDown();
        } else {
            this.closeDropDown(true);
        }
    }, openDropDown:function () {
        var dropDown = this.dropDown, ddNode = dropDown.domNode, aroundNode = this._aroundNode || this.domNode, self = this;
        var retVal = popup.open({parent:this, popup:dropDown, around:aroundNode, orient:this.dropDownPosition, maxHeight:this.maxHeight, onExecute:function () {
            self.closeDropDown(true);
        }, onCancel:function () {
            self.closeDropDown(true);
        }, onClose:function () {
            domAttr.set(self._popupStateNode, "popupActive", false);
            domClass.remove(self._popupStateNode, "dijitHasDropDownOpen");
            self._set("_opened", false);
        }});
        if (this.forceWidth || (this.autoWidth && aroundNode.offsetWidth > dropDown._popupWrapper.offsetWidth)) {
            var widthAdjust = aroundNode.offsetWidth - dropDown._popupWrapper.offsetWidth;
            var resizeArgs = {w:dropDown.domNode.offsetWidth + widthAdjust};
            if (lang.isFunction(dropDown.resize)) {
                dropDown.resize(resizeArgs);
            } else {
                domGeometry.setMarginBox(ddNode, resizeArgs);
            }
            if (retVal.corner[1] == "R") {
                dropDown._popupWrapper.style.left = (dropDown._popupWrapper.style.left.replace("px", "") - widthAdjust) + "px";
            }
        }
        domAttr.set(this._popupStateNode, "popupActive", "true");
        domClass.add(this._popupStateNode, "dijitHasDropDownOpen");
        this._set("_opened", true);
        this._popupStateNode.setAttribute("aria-expanded", "true");
        this._popupStateNode.setAttribute("aria-owns", dropDown.id);
        if (ddNode.getAttribute("role") !== "presentation" && !ddNode.getAttribute("aria-labelledby")) {
            ddNode.setAttribute("aria-labelledby", this.id);
        }
        return retVal;
    }, closeDropDown:function (focus) {
        if (this._focusDropDownTimer) {
            this._focusDropDownTimer.remove();
            delete this._focusDropDownTimer;
        }
        if (this._opened) {
            this._popupStateNode.setAttribute("aria-expanded", "false");
            if (focus && this.focus) {
                this.focus();
            }
            popup.close(this.dropDown);
            this._opened = false;
        }
    }});
});

