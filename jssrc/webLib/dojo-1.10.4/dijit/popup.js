//>>built

define("dijit/popup", ["dojo/_base/array", "dojo/aspect", "dojo/_base/declare", "dojo/dom", "dojo/dom-attr", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dojo/has", "dojo/keys", "dojo/_base/lang", "dojo/on", "./place", "./BackgroundIframe", "./Viewport", "./main"], function (array, aspect, declare, dom, domAttr, domConstruct, domGeometry, domStyle, has, keys, lang, on, place, BackgroundIframe, Viewport, dijit) {
    function destroyWrapper() {
        if (this._popupWrapper) {
            domConstruct.destroy(this._popupWrapper);
            delete this._popupWrapper;
        }
    }
    var PopupManager = declare(null, {_stack:[], _beginZIndex:1000, _idGen:1, _repositionAll:function () {
        if (this._firstAroundNode) {
            var oldPos = this._firstAroundPosition, newPos = domGeometry.position(this._firstAroundNode, true), dx = newPos.x - oldPos.x, dy = newPos.y - oldPos.y;
            if (dx || dy) {
                this._firstAroundPosition = newPos;
                for (var i = 0; i < this._stack.length; i++) {
                    var style = this._stack[i].wrapper.style;
                    style.top = (parseFloat(style.top) + dy) + "px";
                    if (style.right == "auto") {
                        style.left = (parseFloat(style.left) + dx) + "px";
                    } else {
                        style.right = (parseFloat(style.right) - dx) + "px";
                    }
                }
            }
            this._aroundMoveListener = setTimeout(lang.hitch(this, "_repositionAll"), dx || dy ? 10 : 50);
        }
    }, _createWrapper:function (widget) {
        var wrapper = widget._popupWrapper, node = widget.domNode;
        if (!wrapper) {
            wrapper = domConstruct.create("div", {"class":"dijitPopup", style:{display:"none"}, role:"region", "aria-label":widget["aria-label"] || widget.label || widget.name || widget.id}, widget.ownerDocumentBody);
            wrapper.appendChild(node);
            var s = node.style;
            s.display = "";
            s.visibility = "";
            s.position = "";
            s.top = "0px";
            widget._popupWrapper = wrapper;
            aspect.after(widget, "destroy", destroyWrapper, true);
            if ("ontouchend" in document) {
                on(wrapper, "touchend", function (evt) {
                    if (!/^(input|button|textarea)$/i.test(evt.target.tagName)) {
                        evt.preventDefault();
                    }
                });
            }
        }
        return wrapper;
    }, moveOffScreen:function (widget) {
        var wrapper = this._createWrapper(widget);
        var ltr = domGeometry.isBodyLtr(widget.ownerDocument), style = {visibility:"hidden", top:"-9999px", display:""};
        style[ltr ? "left" : "right"] = "-9999px";
        style[ltr ? "right" : "left"] = "auto";
        domStyle.set(wrapper, style);
        return wrapper;
    }, hide:function (widget) {
        var wrapper = this._createWrapper(widget);
        domStyle.set(wrapper, {display:"none", height:"auto", overflow:"visible", border:""});
        var node = widget.domNode;
        if ("_originalStyle" in node) {
            node.style.cssText = node._originalStyle;
        }
    }, getTopPopup:function () {
        var stack = this._stack;
        for (var pi = stack.length - 1; pi > 0 && stack[pi].parent === stack[pi - 1].widget; pi--) {
        }
        return stack[pi];
    }, open:function (args) {
        var stack = this._stack, widget = args.popup, node = widget.domNode, orient = args.orient || ["below", "below-alt", "above", "above-alt"], ltr = args.parent ? args.parent.isLeftToRight() : domGeometry.isBodyLtr(widget.ownerDocument), around = args.around, id = (args.around && args.around.id) ? (args.around.id + "_dropdown") : ("popup_" + this._idGen++);
        while (stack.length && (!args.parent || !dom.isDescendant(args.parent.domNode, stack[stack.length - 1].widget.domNode))) {
            this.close(stack[stack.length - 1].widget);
        }
        var wrapper = this.moveOffScreen(widget);
        if (widget.startup && !widget._started) {
            widget.startup();
        }
        var maxHeight, popupSize = domGeometry.position(node);
        if ("maxHeight" in args && args.maxHeight != -1) {
            maxHeight = args.maxHeight || Infinity;
        } else {
            var viewport = Viewport.getEffectiveBox(this.ownerDocument), aroundPos = around ? domGeometry.position(around, false) : {y:args.y - (args.padding || 0), h:(args.padding || 0) * 2};
            maxHeight = Math.floor(Math.max(aroundPos.y, viewport.h - (aroundPos.y + aroundPos.h)));
        }
        if (popupSize.h > maxHeight) {
            var cs = domStyle.getComputedStyle(node), borderStyle = cs.borderLeftWidth + " " + cs.borderLeftStyle + " " + cs.borderLeftColor;
            domStyle.set(wrapper, {overflowY:"scroll", height:maxHeight + "px", border:borderStyle});
            node._originalStyle = node.style.cssText;
            node.style.border = "none";
        }
        domAttr.set(wrapper, {id:id, style:{zIndex:this._beginZIndex + stack.length}, "class":"dijitPopup " + (widget.baseClass || widget["class"] || "").split(" ")[0] + "Popup", dijitPopupParent:args.parent ? args.parent.id : ""});
        if (stack.length == 0 && around) {
            this._firstAroundNode = around;
            this._firstAroundPosition = domGeometry.position(around, true);
            this._aroundMoveListener = setTimeout(lang.hitch(this, "_repositionAll"), 50);
        }
        if (has("config-bgIframe") && !widget.bgIframe) {
            widget.bgIframe = new BackgroundIframe(wrapper);
        }
        var layoutFunc = widget.orient ? lang.hitch(widget, "orient") : null, best = around ? place.around(wrapper, around, orient, ltr, layoutFunc) : place.at(wrapper, args, orient == "R" ? ["TR", "BR", "TL", "BL"] : ["TL", "BL", "TR", "BR"], args.padding, layoutFunc);
        wrapper.style.visibility = "visible";
        node.style.visibility = "visible";
        var handlers = [];
        handlers.push(on(wrapper, "keydown", lang.hitch(this, function (evt) {
            if (evt.keyCode == keys.ESCAPE && args.onCancel) {
                evt.stopPropagation();
                evt.preventDefault();
                args.onCancel();
            } else {
                if (evt.keyCode == keys.TAB) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    var topPopup = this.getTopPopup();
                    if (topPopup && topPopup.onCancel) {
                        topPopup.onCancel();
                    }
                }
            }
        })));
        if (widget.onCancel && args.onCancel) {
            handlers.push(widget.on("cancel", args.onCancel));
        }
        handlers.push(widget.on(widget.onExecute ? "execute" : "change", lang.hitch(this, function () {
            var topPopup = this.getTopPopup();
            if (topPopup && topPopup.onExecute) {
                topPopup.onExecute();
            }
        })));
        stack.push({widget:widget, wrapper:wrapper, parent:args.parent, onExecute:args.onExecute, onCancel:args.onCancel, onClose:args.onClose, handlers:handlers});
        if (widget.onOpen) {
            widget.onOpen(best);
        }
        return best;
    }, close:function (popup) {
        var stack = this._stack;
        while ((popup && array.some(stack, function (elem) {
            return elem.widget == popup;
        })) || (!popup && stack.length)) {
            var top = stack.pop(), widget = top.widget, onClose = top.onClose;
            if (widget.bgIframe) {
                widget.bgIframe.destroy();
                delete widget.bgIframe;
            }
            if (widget.onClose) {
                widget.onClose();
            }
            var h;
            while (h = top.handlers.pop()) {
                h.remove();
            }
            if (widget && widget.domNode) {
                this.hide(widget);
            }
            if (onClose) {
                onClose();
            }
        }
        if (stack.length == 0 && this._aroundMoveListener) {
            clearTimeout(this._aroundMoveListener);
            this._firstAroundNode = this._firstAroundPosition = this._aroundMoveListener = null;
        }
    }});
    return (dijit.popup = new PopupManager());
});

