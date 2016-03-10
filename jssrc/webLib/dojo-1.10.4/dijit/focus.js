//>>built

define("dijit/focus", ["dojo/aspect", "dojo/_base/declare", "dojo/dom", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-construct", "dojo/Evented", "dojo/_base/lang", "dojo/on", "dojo/domReady", "dojo/sniff", "dojo/Stateful", "dojo/_base/window", "dojo/window", "./a11y", "./registry", "./main"], function (aspect, declare, dom, domAttr, domClass, domConstruct, Evented, lang, on, domReady, has, Stateful, win, winUtils, a11y, registry, dijit) {
    var lastFocusin;
    var lastTouchOrFocusin;
    var FocusManager = declare([Stateful, Evented], {curNode:null, activeStack:[], constructor:function () {
        var check = lang.hitch(this, function (node) {
            if (dom.isDescendant(this.curNode, node)) {
                this.set("curNode", null);
            }
            if (dom.isDescendant(this.prevNode, node)) {
                this.set("prevNode", null);
            }
        });
        aspect.before(domConstruct, "empty", check);
        aspect.before(domConstruct, "destroy", check);
    }, registerIframe:function (iframe) {
        return this.registerWin(iframe.contentWindow, iframe);
    }, registerWin:function (targetWindow, effectiveNode) {
        var _this = this, body = targetWindow.document && targetWindow.document.body;
        if (body) {
            var event = has("pointer-events") ? "pointerdown" : has("MSPointer") ? "MSPointerDown" : has("touch-events") ? "mousedown, touchstart" : "mousedown";
            var mdh = on(targetWindow.document, event, function (evt) {
                if (evt && evt.target && evt.target.parentNode == null) {
                    return;
                }
                _this._onTouchNode(effectiveNode || evt.target, "mouse");
            });
            var fih = on(body, "focusin", function (evt) {
                if (!evt.target.tagName) {
                    return;
                }
                var tag = evt.target.tagName.toLowerCase();
                if (tag == "#document" || tag == "body") {
                    return;
                }
                if (a11y.isFocusable(evt.target)) {
                    _this._onFocusNode(effectiveNode || evt.target);
                } else {
                    _this._onTouchNode(effectiveNode || evt.target);
                }
            });
            var foh = on(body, "focusout", function (evt) {
                _this._onBlurNode(effectiveNode || evt.target);
            });
            return {remove:function () {
                mdh.remove();
                fih.remove();
                foh.remove();
                mdh = fih = foh = null;
                body = null;
            }};
        }
    }, _onBlurNode:function (node) {
        var now = (new Date()).getTime();
        if (now < lastFocusin + 100) {
            return;
        }
        if (this._clearFocusTimer) {
            clearTimeout(this._clearFocusTimer);
        }
        this._clearFocusTimer = setTimeout(lang.hitch(this, function () {
            this.set("prevNode", this.curNode);
            this.set("curNode", null);
        }), 0);
        if (this._clearActiveWidgetsTimer) {
            clearTimeout(this._clearActiveWidgetsTimer);
        }
        if (now < lastTouchOrFocusin + 100) {
            return;
        }
        this._clearActiveWidgetsTimer = setTimeout(lang.hitch(this, function () {
            delete this._clearActiveWidgetsTimer;
            this._setStack([]);
        }), 0);
    }, _onTouchNode:function (node, by) {
        lastTouchOrFocusin = (new Date()).getTime();
        if (this._clearActiveWidgetsTimer) {
            clearTimeout(this._clearActiveWidgetsTimer);
            delete this._clearActiveWidgetsTimer;
        }
        if (domClass.contains(node, "dijitPopup")) {
            node = node.firstChild;
        }
        var newStack = [];
        try {
            while (node) {
                var popupParent = domAttr.get(node, "dijitPopupParent");
                if (popupParent) {
                    node = registry.byId(popupParent).domNode;
                } else {
                    if (node.tagName && node.tagName.toLowerCase() == "body") {
                        if (node === win.body()) {
                            break;
                        }
                        node = winUtils.get(node.ownerDocument).frameElement;
                    } else {
                        var id = node.getAttribute && node.getAttribute("widgetId"), widget = id && registry.byId(id);
                        if (widget && !(by == "mouse" && widget.get("disabled"))) {
                            newStack.unshift(id);
                        }
                        node = node.parentNode;
                    }
                }
            }
        }
        catch (e) {
        }
        this._setStack(newStack, by);
    }, _onFocusNode:function (node) {
        if (!node) {
            return;
        }
        if (node.nodeType == 9) {
            return;
        }
        lastFocusin = (new Date()).getTime();
        if (this._clearFocusTimer) {
            clearTimeout(this._clearFocusTimer);
            delete this._clearFocusTimer;
        }
        this._onTouchNode(node);
        if (node == this.curNode) {
            return;
        }
        this.set("prevNode", this.curNode);
        this.set("curNode", node);
    }, _setStack:function (newStack, by) {
        var oldStack = this.activeStack, lastOldIdx = oldStack.length - 1, lastNewIdx = newStack.length - 1;
        if (newStack[lastNewIdx] == oldStack[lastOldIdx]) {
            return;
        }
        this.set("activeStack", newStack);
        var widget, i;
        for (i = lastOldIdx; i >= 0 && oldStack[i] != newStack[i]; i--) {
            widget = registry.byId(oldStack[i]);
            if (widget) {
                widget._hasBeenBlurred = true;
                widget.set("focused", false);
                if (widget._focusManager == this) {
                    widget._onBlur(by);
                }
                this.emit("widget-blur", widget, by);
            }
        }
        for (i++; i <= lastNewIdx; i++) {
            widget = registry.byId(newStack[i]);
            if (widget) {
                widget.set("focused", true);
                if (widget._focusManager == this) {
                    widget._onFocus(by);
                }
                this.emit("widget-focus", widget, by);
            }
        }
    }, focus:function (node) {
        if (node) {
            try {
                node.focus();
            }
            catch (e) {
            }
        }
    }});
    var singleton = new FocusManager();
    domReady(function () {
        var handle = singleton.registerWin(winUtils.get(document));
        if (has("ie")) {
            on(window, "unload", function () {
                if (handle) {
                    handle.remove();
                    handle = null;
                }
            });
        }
    });
    dijit.focus = function (node) {
        singleton.focus(node);
    };
    for (var attr in singleton) {
        if (!/^_/.test(attr)) {
            dijit.focus[attr] = typeof singleton[attr] == "function" ? lang.hitch(singleton, attr) : singleton[attr];
        }
    }
    singleton.watch(function (attr, oldVal, newVal) {
        dijit.focus[attr] = newVal;
    });
    return singleton;
});

