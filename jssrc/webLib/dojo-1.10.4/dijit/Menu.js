//>>built

define("dijit/Menu", ["require", "dojo/_base/array", "dojo/_base/declare", "dojo/dom", "dojo/dom-attr", "dojo/dom-geometry", "dojo/dom-style", "dojo/keys", "dojo/_base/lang", "dojo/on", "dojo/sniff", "dojo/_base/window", "dojo/window", "./popup", "./DropDownMenu", "dojo/ready"], function (require, array, declare, dom, domAttr, domGeometry, domStyle, keys, lang, on, has, win, winUtils, pm, DropDownMenu, ready) {
    if (has("dijit-legacy-requires")) {
        ready(0, function () {
            var requires = ["dijit/MenuItem", "dijit/PopupMenuItem", "dijit/CheckedMenuItem", "dijit/MenuSeparator"];
            require(requires);
        });
    }
    return declare("dijit.Menu", DropDownMenu, {constructor:function () {
        this._bindings = [];
    }, targetNodeIds:[], selector:"", contextMenuForWindow:false, leftClickToOpen:false, refocus:true, postCreate:function () {
        if (this.contextMenuForWindow) {
            this.bindDomNode(this.ownerDocumentBody);
        } else {
            array.forEach(this.targetNodeIds, this.bindDomNode, this);
        }
        this.inherited(arguments);
    }, _iframeContentWindow:function (iframe_el) {
        return winUtils.get(this._iframeContentDocument(iframe_el)) || this._iframeContentDocument(iframe_el)["__parent__"] || (iframe_el.name && document.frames[iframe_el.name]) || null;
    }, _iframeContentDocument:function (iframe_el) {
        return iframe_el.contentDocument || (iframe_el.contentWindow && iframe_el.contentWindow.document) || (iframe_el.name && document.frames[iframe_el.name] && document.frames[iframe_el.name].document) || null;
    }, bindDomNode:function (node) {
        node = dom.byId(node, this.ownerDocument);
        var cn;
        if (node.tagName.toLowerCase() == "iframe") {
            var iframe = node, window = this._iframeContentWindow(iframe);
            cn = win.body(window.document);
        } else {
            cn = (node == win.body(this.ownerDocument) ? this.ownerDocument.documentElement : node);
        }
        var binding = {node:node, iframe:iframe};
        domAttr.set(node, "_dijitMenu" + this.id, this._bindings.push(binding));
        var doConnects = lang.hitch(this, function (cn) {
            var selector = this.selector, delegatedEvent = selector ? function (eventType) {
                return on.selector(selector, eventType);
            } : function (eventType) {
                return eventType;
            }, self = this;
            return [on(cn, delegatedEvent(this.leftClickToOpen ? "click" : "contextmenu"), function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                if ((new Date()).getTime() < this._lastKeyDown + 500) {
                    return;
                }
                self._scheduleOpen(this, iframe, {x:evt.pageX, y:evt.pageY}, evt.target);
            }), on(cn, delegatedEvent("keydown"), function (evt) {
                if (evt.keyCode == 93 || (evt.shiftKey && evt.keyCode == keys.F10) || (this.leftClickToOpen && evt.keyCode == keys.SPACE)) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    self._scheduleOpen(this, iframe, null, evt.target);
                    this._lastKeyDown = (new Date()).getTime();
                }
            })];
        });
        binding.connects = cn ? doConnects(cn) : [];
        if (iframe) {
            binding.onloadHandler = lang.hitch(this, function () {
                var window = this._iframeContentWindow(iframe), cn = win.body(window.document);
                binding.connects = doConnects(cn);
            });
            if (iframe.addEventListener) {
                iframe.addEventListener("load", binding.onloadHandler, false);
            } else {
                iframe.attachEvent("onload", binding.onloadHandler);
            }
        }
    }, unBindDomNode:function (nodeName) {
        var node;
        try {
            node = dom.byId(nodeName, this.ownerDocument);
        }
        catch (e) {
            return;
        }
        var attrName = "_dijitMenu" + this.id;
        if (node && domAttr.has(node, attrName)) {
            var bid = domAttr.get(node, attrName) - 1, b = this._bindings[bid], h;
            while ((h = b.connects.pop())) {
                h.remove();
            }
            var iframe = b.iframe;
            if (iframe) {
                if (iframe.removeEventListener) {
                    iframe.removeEventListener("load", b.onloadHandler, false);
                } else {
                    iframe.detachEvent("onload", b.onloadHandler);
                }
            }
            domAttr.remove(node, attrName);
            delete this._bindings[bid];
        }
    }, _scheduleOpen:function (delegatedTarget, iframe, coords, target) {
        if (!this._openTimer) {
            this._openTimer = this.defer(function () {
                delete this._openTimer;
                this._openMyself({target:target, delegatedTarget:delegatedTarget, iframe:iframe, coords:coords});
            }, 1);
        }
    }, _openMyself:function (args) {
        var target = args.target, iframe = args.iframe, coords = args.coords, byKeyboard = !coords;
        this.currentTarget = args.delegatedTarget;
        if (coords) {
            if (iframe) {
                var ifc = domGeometry.position(iframe, true), window = this._iframeContentWindow(iframe), scroll = domGeometry.docScroll(window.document);
                var cs = domStyle.getComputedStyle(iframe), tp = domStyle.toPixelValue, left = (has("ie") && has("quirks") ? 0 : tp(iframe, cs.paddingLeft)) + (has("ie") && has("quirks") ? tp(iframe, cs.borderLeftWidth) : 0), top = (has("ie") && has("quirks") ? 0 : tp(iframe, cs.paddingTop)) + (has("ie") && has("quirks") ? tp(iframe, cs.borderTopWidth) : 0);
                coords.x += ifc.x + left - scroll.x;
                coords.y += ifc.y + top - scroll.y;
            }
        } else {
            coords = domGeometry.position(target, true);
            coords.x += 10;
            coords.y += 10;
        }
        var self = this;
        var prevFocusNode = this._focusManager.get("prevNode");
        var curFocusNode = this._focusManager.get("curNode");
        var savedFocusNode = !curFocusNode || (dom.isDescendant(curFocusNode, this.domNode)) ? prevFocusNode : curFocusNode;
        function closeAndRestoreFocus() {
            if (self.refocus && savedFocusNode) {
                savedFocusNode.focus();
            }
            pm.close(self);
        }
        pm.open({popup:this, x:coords.x, y:coords.y, onExecute:closeAndRestoreFocus, onCancel:closeAndRestoreFocus, orient:this.isLeftToRight() ? "L" : "R"});
        this.focus();
        if (!byKeyboard) {
            this.defer(function () {
                this._cleanUp(true);
            });
        }
        this._onBlur = function () {
            this.inherited("_onBlur", arguments);
            pm.close(this);
        };
    }, destroy:function () {
        array.forEach(this._bindings, function (b) {
            if (b) {
                this.unBindDomNode(b.node);
            }
        }, this);
        this.inherited(arguments);
    }});
});

