//>>built

define("dijit/_KeyNavMixin", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom-attr", "dojo/keys", "dojo/_base/lang", "dojo/on", "dijit/registry", "dijit/_FocusMixin"], function (array, declare, domAttr, keys, lang, on, registry, _FocusMixin) {
    return declare("dijit._KeyNavMixin", _FocusMixin, {tabIndex:"0", childSelector:null, postCreate:function () {
        this.inherited(arguments);
        domAttr.set(this.domNode, "tabIndex", this.tabIndex);
        if (!this._keyNavCodes) {
            var keyCodes = this._keyNavCodes = {};
            keyCodes[keys.HOME] = lang.hitch(this, "focusFirstChild");
            keyCodes[keys.END] = lang.hitch(this, "focusLastChild");
            keyCodes[this.isLeftToRight() ? keys.LEFT_ARROW : keys.RIGHT_ARROW] = lang.hitch(this, "_onLeftArrow");
            keyCodes[this.isLeftToRight() ? keys.RIGHT_ARROW : keys.LEFT_ARROW] = lang.hitch(this, "_onRightArrow");
            keyCodes[keys.UP_ARROW] = lang.hitch(this, "_onUpArrow");
            keyCodes[keys.DOWN_ARROW] = lang.hitch(this, "_onDownArrow");
        }
        var self = this, childSelector = typeof this.childSelector == "string" ? this.childSelector : lang.hitch(this, "childSelector");
        this.own(on(this.domNode, "keypress", lang.hitch(this, "_onContainerKeypress")), on(this.domNode, "keydown", lang.hitch(this, "_onContainerKeydown")), on(this.domNode, "focus", lang.hitch(this, "_onContainerFocus")), on(this.containerNode, on.selector(childSelector, "focusin"), function (evt) {
            self._onChildFocus(registry.getEnclosingWidget(this), evt);
        }));
    }, _onLeftArrow:function () {
    }, _onRightArrow:function () {
    }, _onUpArrow:function () {
    }, _onDownArrow:function () {
    }, focus:function () {
        this.focusFirstChild();
    }, _getFirstFocusableChild:function () {
        return this._getNextFocusableChild(null, 1);
    }, _getLastFocusableChild:function () {
        return this._getNextFocusableChild(null, -1);
    }, focusFirstChild:function () {
        this.focusChild(this._getFirstFocusableChild());
    }, focusLastChild:function () {
        this.focusChild(this._getLastFocusableChild());
    }, focusChild:function (widget, last) {
        if (!widget) {
            return;
        }
        if (this.focusedChild && widget !== this.focusedChild) {
            this._onChildBlur(this.focusedChild);
        }
        widget.set("tabIndex", this.tabIndex);
        widget.focus(last ? "end" : "start");
    }, _onContainerFocus:function (evt) {
        if (evt.target !== this.domNode || this.focusedChild) {
            return;
        }
        this.focus();
    }, _onFocus:function () {
        domAttr.set(this.domNode, "tabIndex", "-1");
        this.inherited(arguments);
    }, _onBlur:function (evt) {
        domAttr.set(this.domNode, "tabIndex", this.tabIndex);
        if (this.focusedChild) {
            this.focusedChild.set("tabIndex", "-1");
            this.lastFocusedChild = this.focusedChild;
            this._set("focusedChild", null);
        }
        this.inherited(arguments);
    }, _onChildFocus:function (child) {
        if (child && child != this.focusedChild) {
            if (this.focusedChild && !this.focusedChild._destroyed) {
                this.focusedChild.set("tabIndex", "-1");
            }
            child.set("tabIndex", this.tabIndex);
            this.lastFocused = child;
            this._set("focusedChild", child);
        }
    }, _searchString:"", multiCharSearchDuration:1000, onKeyboardSearch:function (item, evt, searchString, numMatches) {
        if (item) {
            this.focusChild(item);
        }
    }, _keyboardSearchCompare:function (item, searchString) {
        var element = item.domNode, text = item.label || (element.focusNode ? element.focusNode.label : "") || element.innerText || element.textContent || "", currentString = text.replace(/^\s+/, "").substr(0, searchString.length).toLowerCase();
        return (!!searchString.length && currentString == searchString) ? -1 : 0;
    }, _onContainerKeydown:function (evt) {
        var func = this._keyNavCodes[evt.keyCode];
        if (func) {
            func(evt, this.focusedChild);
            evt.stopPropagation();
            evt.preventDefault();
            this._searchString = "";
        } else {
            if (evt.keyCode == keys.SPACE && this._searchTimer && !(evt.ctrlKey || evt.altKey || evt.metaKey)) {
                evt.stopImmediatePropagation();
                evt.preventDefault();
                this._keyboardSearch(evt, " ");
            }
        }
    }, _onContainerKeypress:function (evt) {
        if (evt.charCode <= keys.SPACE || evt.ctrlKey || evt.altKey || evt.metaKey) {
            return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        this._keyboardSearch(evt, String.fromCharCode(evt.charCode).toLowerCase());
    }, _keyboardSearch:function (evt, keyChar) {
        var matchedItem = null, searchString, numMatches = 0, search = lang.hitch(this, function () {
            if (this._searchTimer) {
                this._searchTimer.remove();
            }
            this._searchString += keyChar;
            var allSameLetter = /^(.)\1*$/.test(this._searchString);
            var searchLen = allSameLetter ? 1 : this._searchString.length;
            searchString = this._searchString.substr(0, searchLen);
            this._searchTimer = this.defer(function () {
                this._searchTimer = null;
                this._searchString = "";
            }, this.multiCharSearchDuration);
            var currentItem = this.focusedChild || null;
            if (searchLen == 1 || !currentItem) {
                currentItem = this._getNextFocusableChild(currentItem, 1);
                if (!currentItem) {
                    return;
                }
            }
            var stop = currentItem;
            do {
                var rc = this._keyboardSearchCompare(currentItem, searchString);
                if (!!rc && numMatches++ == 0) {
                    matchedItem = currentItem;
                }
                if (rc == -1) {
                    numMatches = -1;
                    break;
                }
                currentItem = this._getNextFocusableChild(currentItem, 1);
            } while (currentItem != stop);
        });
        search();
        this.onKeyboardSearch(matchedItem, evt, searchString, numMatches);
    }, _onChildBlur:function () {
    }, _getNextFocusableChild:function (child, dir) {
        var wrappedValue = child;
        do {
            if (!child) {
                child = this[dir > 0 ? "_getFirst" : "_getLast"]();
                if (!child) {
                    break;
                }
            } else {
                child = this._getNext(child, dir);
            }
            if (child != null && child != wrappedValue && child.isFocusable()) {
                return child;
            }
        } while (child != wrappedValue);
        return null;
    }, _getFirst:function () {
        return null;
    }, _getLast:function () {
        return null;
    }, _getNext:function (child, dir) {
        if (child) {
            child = child.domNode;
            while (child) {
                child = child[dir < 0 ? "previousSibling" : "nextSibling"];
                if (child && "getAttribute" in child) {
                    var w = registry.byNode(child);
                    if (w) {
                        return w;
                    }
                }
            }
        }
        return null;
    }});
});

