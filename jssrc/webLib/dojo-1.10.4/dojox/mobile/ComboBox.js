//>>built

define("dojox/mobile/ComboBox", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/window", "dojo/dom-geometry", "dojo/dom-style", "dojo/dom-attr", "dojo/window", "dojo/touch", "dijit/form/_AutoCompleterMixin", "dijit/popup", "./_ComboBoxMenu", "./TextBox", "./sniff"], function (kernel, declare, lang, win, domGeometry, domStyle, domAttr, windowUtils, touch, AutoCompleterMixin, popup, ComboBoxMenu, TextBox, has) {
    kernel.experimental("dojox.mobile.ComboBox");
    return declare("dojox.mobile.ComboBox", [TextBox, AutoCompleterMixin], {dropDownClass:"dojox.mobile._ComboBoxMenu", selectOnClick:false, autoComplete:false, dropDown:null, maxHeight:-1, dropDownPosition:["below", "above"], _throttleOpenClose:function () {
        if (this._throttleHandler) {
            this._throttleHandler.remove();
        }
        this._throttleHandler = this.defer(function () {
            this._throttleHandler = null;
        }, 500);
    }, _onFocus:function () {
        this.inherited(arguments);
        if (!this._opened && !this._throttleHandler) {
            this._startSearchAll();
        }
        if (has("windows-theme")) {
            this.domNode.blur();
        }
    }, onInput:function (e) {
        if (!e || e.charCode !== 0) {
            this._onKey(e);
            this.inherited(arguments);
        }
    }, _setListAttr:function (v) {
        this._set("list", v);
    }, closeDropDown:function () {
        this._throttleOpenClose();
        if (this.endHandler) {
            this.disconnect(this.startHandler);
            this.disconnect(this.endHandler);
            this.disconnect(this.moveHandler);
            clearInterval(this.repositionTimer);
            this.repositionTimer = this.endHandler = null;
        }
        this.inherited(arguments);
        domAttr.remove(this.domNode, "aria-owns");
        domAttr.set(this.domNode, "aria-expanded", "false");
        popup.close(this.dropDown);
        this._opened = false;
        if (has("windows-theme") && this.domNode.disabled) {
            this.defer(function () {
                this.domNode.removeAttribute("disabled");
            }, 300);
        }
    }, openDropDown:function () {
        var wasClosed = !this._opened;
        var dropDown = this.dropDown, ddNode = dropDown.domNode, aroundNode = this.domNode, self = this;
        domAttr.set(dropDown.domNode, "role", "listbox");
        domAttr.set(this.domNode, "aria-expanded", "true");
        if (dropDown.id) {
            domAttr.set(this.domNode, "aria-owns", dropDown.id);
        }
        if (1 && (!has("ios") || has("ios") < 8)) {
            win.global.scrollBy(0, domGeometry.position(aroundNode, false).y);
        }
        if (!this._preparedNode) {
            this._preparedNode = true;
            if (ddNode.style.width) {
                this._explicitDDWidth = true;
            }
            if (ddNode.style.height) {
                this._explicitDDHeight = true;
            }
        }
        var myStyle = {display:"", overflow:"hidden", visibility:"hidden"};
        if (!this._explicitDDWidth) {
            myStyle.width = "";
        }
        if (!this._explicitDDHeight) {
            myStyle.height = "";
        }
        domStyle.set(ddNode, myStyle);
        var maxHeight = this.maxHeight;
        if (maxHeight == -1) {
            var viewport = windowUtils.getBox(), position = domGeometry.position(aroundNode, false);
            maxHeight = Math.floor(Math.max(position.y, viewport.h - (position.y + position.h)));
        }
        popup.moveOffScreen(dropDown);
        if (dropDown.startup && !dropDown._started) {
            dropDown.startup();
        }
        var mb = domGeometry.position(this.dropDown.containerNode, false);
        var overHeight = (maxHeight && mb.h > maxHeight);
        if (overHeight) {
            mb.h = maxHeight;
        }
        mb.w = Math.max(mb.w, aroundNode.offsetWidth);
        domGeometry.setMarginBox(ddNode, mb);
        var retVal = popup.open({parent:this, popup:dropDown, around:aroundNode, orient:has("windows-theme") ? ["above"] : this.dropDownPosition, onExecute:function () {
            self.closeDropDown();
        }, onCancel:function () {
            self.closeDropDown();
        }, onClose:function () {
            self._opened = false;
        }});
        this._opened = true;
        if (wasClosed) {
            var isGesture = false, skipReposition = false, active = false, wrapper = dropDown.domNode.parentNode, aroundNodePos = domGeometry.position(aroundNode, false), popupPos = domGeometry.position(wrapper, false), deltaX = popupPos.x - aroundNodePos.x, deltaY = popupPos.y - aroundNodePos.y, startX = -1, startY = -1;
            this.startHandler = this.connect(win.doc.documentElement, touch.press, function (e) {
                skipReposition = true;
                active = true;
                isGesture = false;
                startX = e.clientX;
                startY = e.clientY;
            });
            this.moveHandler = this.connect(win.doc.documentElement, touch.move, function (e) {
                skipReposition = true;
                if (e.touches) {
                    active = isGesture = true;
                } else {
                    if (active && (e.clientX != startX || e.clientY != startY)) {
                        isGesture = true;
                    }
                }
            });
            this.clickHandler = this.connect(dropDown.domNode, "onclick", function () {
                skipReposition = true;
                active = isGesture = false;
            });
            this.endHandler = this.connect(win.doc.documentElement, touch.release, function () {
                this.defer(function () {
                    skipReposition = true;
                    if (!isGesture && active) {
                        this.closeDropDown();
                    }
                    active = false;
                });
            });
            this.repositionTimer = setInterval(lang.hitch(this, function () {
                if (skipReposition) {
                    skipReposition = false;
                    return;
                }
                var currentAroundNodePos = domGeometry.position(aroundNode, false), currentPopupPos = domGeometry.position(wrapper, false), currentDeltaX = currentPopupPos.x - currentAroundNodePos.x, currentDeltaY = currentPopupPos.y - currentAroundNodePos.y;
                if (Math.abs(currentDeltaX - deltaX) >= 1 || Math.abs(currentDeltaY - deltaY) >= 1) {
                    domStyle.set(wrapper, {left:parseInt(domStyle.get(wrapper, "left")) + deltaX - currentDeltaX + "px", top:parseInt(domStyle.get(wrapper, "top")) + deltaY - currentDeltaY + "px"});
                }
            }), 50);
        }
        if (has("windows-theme")) {
            this.domNode.setAttribute("disabled", true);
        }
        return retVal;
    }, postCreate:function () {
        this.inherited(arguments);
        this.connect(this.domNode, "onclick", "_onClick");
        domAttr.set(this.domNode, "role", "combobox");
        domAttr.set(this.domNode, "aria-expanded", "false");
    }, destroy:function () {
        if (this.repositionTimer) {
            clearInterval(this.repositionTimer);
        }
        this.inherited(arguments);
    }, _onClick:function (e) {
        if (!this._throttleHandler) {
            if (this.opened) {
                this.closeDropDown();
            } else {
                this._startSearchAll();
            }
        }
    }});
});

