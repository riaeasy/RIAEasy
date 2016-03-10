//>>built

require({cache:{"url:dijit/templates/Dialog.html":"<div class=\"dijitDialog\" role=\"dialog\" aria-labelledby=\"${id}_title\">\n\t<div data-dojo-attach-point=\"titleBar\" class=\"dijitDialogTitleBar\">\n\t\t<span data-dojo-attach-point=\"titleNode\" class=\"dijitDialogTitle\" id=\"${id}_title\"\n\t\t\t\trole=\"heading\" level=\"1\"></span>\n\t\t<span data-dojo-attach-point=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" data-dojo-attach-event=\"ondijitclick: onCancel\" title=\"${buttonCancel}\" role=\"button\" tabindex=\"-1\">\n\t\t\t<span data-dojo-attach-point=\"closeText\" class=\"closeText\" title=\"${buttonCancel}\">x</span>\n\t\t</span>\n\t</div>\n\t<div data-dojo-attach-point=\"containerNode\" class=\"dijitDialogPaneContent\"></div>\n\t${!actionBarTemplate}\n</div>\n\n"}});
define("dijit/Dialog", ["require", "dojo/_base/array", "dojo/aspect", "dojo/_base/declare", "dojo/Deferred", "dojo/dom", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style", "dojo/_base/fx", "dojo/i18n", "dojo/keys", "dojo/_base/lang", "dojo/on", "dojo/ready", "dojo/sniff", "dojo/window", "dojo/dnd/Moveable", "dojo/dnd/TimedMoveable", "./focus", "./_base/manager", "./_Widget", "./_TemplatedMixin", "./_CssStateMixin", "./form/_FormMixin", "./_DialogMixin", "./DialogUnderlay", "./layout/ContentPane", "./layout/utils", "dojo/text!./templates/Dialog.html", "./a11yclick", "dojo/i18n!./nls/common"], function (require, array, aspect, declare, Deferred, dom, domClass, domGeometry, domStyle, fx, i18n, keys, lang, on, ready, has, winUtils, Moveable, TimedMoveable, focus, manager, _Widget, _TemplatedMixin, _CssStateMixin, _FormMixin, _DialogMixin, DialogUnderlay, ContentPane, utils, template) {
    var resolvedDeferred = new Deferred();
    resolvedDeferred.resolve(true);
    var _DialogBase = declare("dijit._DialogBase" + (0 ? "_NoBidi" : ""), [_TemplatedMixin, _FormMixin, _DialogMixin, _CssStateMixin], {templateString:template, baseClass:"dijitDialog", cssStateNodes:{closeButtonNode:"dijitDialogCloseIcon"}, _setTitleAttr:{node:"titleNode", type:"innerHTML"}, open:false, duration:manager.defaultDuration, refocus:true, autofocus:true, _firstFocusItem:null, _lastFocusItem:null, draggable:true, _setDraggableAttr:function (val) {
        this._set("draggable", val);
    }, maxRatio:0.9, closable:true, _setClosableAttr:function (val) {
        this.closeButtonNode.style.display = val ? "" : "none";
        this._set("closable", val);
    }, postMixInProperties:function () {
        var _nlsResources = i18n.getLocalization("dijit", "common");
        lang.mixin(this, _nlsResources);
        this.inherited(arguments);
    }, postCreate:function () {
        domStyle.set(this.domNode, {display:"none", position:"absolute"});
        this.ownerDocumentBody.appendChild(this.domNode);
        this.inherited(arguments);
        aspect.after(this, "onExecute", lang.hitch(this, "hide"), true);
        aspect.after(this, "onCancel", lang.hitch(this, "hide"), true);
        this._modalconnects = [];
    }, onLoad:function () {
        this.resize();
        this._position();
        if (this.autofocus && DialogLevelManager.isTop(this)) {
            this._getFocusItems();
            focus.focus(this._firstFocusItem);
        }
        this.inherited(arguments);
    }, focus:function () {
        this._getFocusItems();
        focus.focus(this._firstFocusItem);
    }, _endDrag:function () {
        var nodePosition = domGeometry.position(this.domNode), viewport = winUtils.getBox(this.ownerDocument);
        nodePosition.y = Math.min(Math.max(nodePosition.y, 0), (viewport.h - nodePosition.h));
        nodePosition.x = Math.min(Math.max(nodePosition.x, 0), (viewport.w - nodePosition.w));
        this._relativePosition = nodePosition;
        this._position();
    }, _setup:function () {
        var node = this.domNode;
        if (this.titleBar && this.draggable) {
            this._moveable = new ((has("ie") == 6) ? TimedMoveable : Moveable)(node, {handle:this.titleBar});
            aspect.after(this._moveable, "onMoveStop", lang.hitch(this, "_endDrag"), true);
        } else {
            domClass.add(node, "dijitDialogFixed");
        }
        this.underlayAttrs = {dialogId:this.id, "class":array.map(this["class"].split(/\s/), function (s) {
            return s + "_underlay";
        }).join(" "), _onKeyDown:lang.hitch(this, "_onKey"), ownerDocument:this.ownerDocument};
    }, _size:function () {
        this.resize();
    }, _position:function () {
        if (!domClass.contains(this.ownerDocumentBody, "dojoMove")) {
            var node = this.domNode, viewport = winUtils.getBox(this.ownerDocument), p = this._relativePosition, bb = p ? null : domGeometry.position(node), l = Math.floor(viewport.l + (p ? p.x : (viewport.w - bb.w) / 2)), t = Math.floor(viewport.t + (p ? p.y : (viewport.h - bb.h) / 2));
            domStyle.set(node, {left:l + "px", top:t + "px"});
        }
    }, _onKey:function (evt) {
        if (evt.keyCode == keys.TAB) {
            this._getFocusItems();
            var node = evt.target;
            if (this._firstFocusItem == this._lastFocusItem) {
                evt.stopPropagation();
                evt.preventDefault();
            } else {
                if (node == this._firstFocusItem && evt.shiftKey) {
                    focus.focus(this._lastFocusItem);
                    evt.stopPropagation();
                    evt.preventDefault();
                } else {
                    if (node == this._lastFocusItem && !evt.shiftKey) {
                        focus.focus(this._firstFocusItem);
                        evt.stopPropagation();
                        evt.preventDefault();
                    }
                }
            }
        } else {
            if (this.closable && evt.keyCode == keys.ESCAPE) {
                this.onCancel();
                evt.stopPropagation();
                evt.preventDefault();
            }
        }
    }, show:function () {
        if (this.open) {
            return resolvedDeferred.promise;
        }
        if (!this._started) {
            this.startup();
        }
        if (!this._alreadyInitialized) {
            this._setup();
            this._alreadyInitialized = true;
        }
        if (this._fadeOutDeferred) {
            this._fadeOutDeferred.cancel();
            DialogLevelManager.hide(this);
        }
        var win = winUtils.get(this.ownerDocument);
        this._modalconnects.push(on(win, "scroll", lang.hitch(this, "resize", null)));
        this._modalconnects.push(on(this.domNode, "keydown", lang.hitch(this, "_onKey")));
        domStyle.set(this.domNode, {opacity:0, display:""});
        this._set("open", true);
        this._onShow();
        this.resize();
        this._position();
        var fadeIn;
        this._fadeInDeferred = new Deferred(lang.hitch(this, function () {
            fadeIn.stop();
            delete this._fadeInDeferred;
        }));
        var promise = this._fadeInDeferred.promise;
        fadeIn = fx.fadeIn({node:this.domNode, duration:this.duration, beforeBegin:lang.hitch(this, function () {
            DialogLevelManager.show(this, this.underlayAttrs);
        }), onEnd:lang.hitch(this, function () {
            if (this.autofocus && DialogLevelManager.isTop(this)) {
                this._getFocusItems();
                focus.focus(this._firstFocusItem);
            }
            this._fadeInDeferred.resolve(true);
            delete this._fadeInDeferred;
        })}).play();
        return promise;
    }, hide:function () {
        if (!this._alreadyInitialized || !this.open) {
            return resolvedDeferred.promise;
        }
        if (this._fadeInDeferred) {
            this._fadeInDeferred.cancel();
        }
        var fadeOut;
        this._fadeOutDeferred = new Deferred(lang.hitch(this, function () {
            fadeOut.stop();
            delete this._fadeOutDeferred;
        }));
        this._fadeOutDeferred.then(lang.hitch(this, "onHide"));
        var promise = this._fadeOutDeferred.promise;
        fadeOut = fx.fadeOut({node:this.domNode, duration:this.duration, onEnd:lang.hitch(this, function () {
            this.domNode.style.display = "none";
            DialogLevelManager.hide(this);
            this._fadeOutDeferred.resolve(true);
            delete this._fadeOutDeferred;
        })}).play();
        if (this._scrollConnected) {
            this._scrollConnected = false;
        }
        var h;
        while (h = this._modalconnects.pop()) {
            h.remove();
        }
        if (this._relativePosition) {
            delete this._relativePosition;
        }
        this._set("open", false);
        return promise;
    }, resize:function (dim) {
        if (this.domNode.style.display != "none") {
            this._checkIfSingleChild();
            if (!dim) {
                if (this._shrunk) {
                    if (this._singleChild) {
                        if (typeof this._singleChildOriginalStyle != "undefined") {
                            this._singleChild.domNode.style.cssText = this._singleChildOriginalStyle;
                            delete this._singleChildOriginalStyle;
                        }
                    }
                    array.forEach([this.domNode, this.containerNode, this.titleBar, this.actionBarNode], function (node) {
                        if (node) {
                            domStyle.set(node, {position:"static", width:"auto", height:"auto"});
                        }
                    });
                    this.domNode.style.position = "absolute";
                }
                var viewport = winUtils.getBox(this.ownerDocument);
                viewport.w *= this.maxRatio;
                viewport.h *= this.maxRatio;
                var bb = domGeometry.position(this.domNode);
                if (bb.w >= viewport.w || bb.h >= viewport.h) {
                    dim = {w:Math.min(bb.w, viewport.w), h:Math.min(bb.h, viewport.h)};
                    this._shrunk = true;
                } else {
                    this._shrunk = false;
                }
            }
            if (dim) {
                domGeometry.setMarginBox(this.domNode, dim);
                var layoutNodes = [];
                if (this.titleBar) {
                    layoutNodes.push({domNode:this.titleBar, region:"top"});
                }
                if (this.actionBarNode) {
                    layoutNodes.push({domNode:this.actionBarNode, region:"bottom"});
                }
                var centerSize = {domNode:this.containerNode, region:"center"};
                layoutNodes.push(centerSize);
                var contentDim = utils.marginBox2contentBox(this.domNode, dim);
                utils.layoutChildren(this.domNode, contentDim, layoutNodes);
                if (this._singleChild) {
                    var cb = utils.marginBox2contentBox(this.containerNode, centerSize);
                    this._singleChild.resize({w:cb.w, h:cb.h});
                } else {
                    this.containerNode.style.overflow = "auto";
                    this._layoutChildren();
                }
            } else {
                this._layoutChildren();
            }
            if (!1 && !dim) {
                this._position();
            }
        }
    }, _layoutChildren:function () {
        array.forEach(this.getChildren(), function (widget) {
            if (widget.resize) {
                widget.resize();
            }
        });
    }, destroy:function () {
        if (this._fadeInDeferred) {
            this._fadeInDeferred.cancel();
        }
        if (this._fadeOutDeferred) {
            this._fadeOutDeferred.cancel();
        }
        if (this._moveable) {
            this._moveable.destroy();
        }
        var h;
        while (h = this._modalconnects.pop()) {
            h.remove();
        }
        DialogLevelManager.hide(this);
        this.inherited(arguments);
    }});
    if (0) {
        _DialogBase = declare("dijit._DialogBase", _DialogBase, {_setTitleAttr:function (title) {
            this._set("title", title);
            this.titleNode.innerHTML = title;
            this.applyTextDir(this.titleNode);
        }, _setTextDirAttr:function (textDir) {
            if (this._created && this.textDir != textDir) {
                this._set("textDir", textDir);
                this.set("title", this.title);
            }
        }});
    }
    var Dialog = declare("dijit.Dialog", [ContentPane, _DialogBase], {});
    Dialog._DialogBase = _DialogBase;
    var DialogLevelManager = Dialog._DialogLevelManager = {_beginZIndex:950, show:function (dialog, underlayAttrs) {
        ds[ds.length - 1].focus = focus.curNode;
        var zIndex = ds[ds.length - 1].dialog ? ds[ds.length - 1].zIndex + 2 : Dialog._DialogLevelManager._beginZIndex;
        domStyle.set(dialog.domNode, "zIndex", zIndex);
        DialogUnderlay.show(underlayAttrs, zIndex - 1);
        ds.push({dialog:dialog, underlayAttrs:underlayAttrs, zIndex:zIndex});
    }, hide:function (dialog) {
        if (ds[ds.length - 1].dialog == dialog) {
            ds.pop();
            var pd = ds[ds.length - 1];
            if (ds.length == 1) {
                DialogUnderlay.hide();
            } else {
                DialogUnderlay.show(pd.underlayAttrs, pd.zIndex - 1);
            }
            if (dialog.refocus) {
                var focus = pd.focus;
                if (pd.dialog && (!focus || !dom.isDescendant(focus, pd.dialog.domNode))) {
                    pd.dialog._getFocusItems();
                    focus = pd.dialog._firstFocusItem;
                }
                if (focus) {
                    try {
                        focus.focus();
                    }
                    catch (e) {
                    }
                }
            }
        } else {
            var idx = array.indexOf(array.map(ds, function (elem) {
                return elem.dialog;
            }), dialog);
            if (idx != -1) {
                ds.splice(idx, 1);
            }
        }
    }, isTop:function (dialog) {
        return ds[ds.length - 1].dialog == dialog;
    }};
    var ds = Dialog._dialogStack = [{dialog:null, focus:null, underlayAttrs:null}];
    focus.watch("curNode", function (attr, oldNode, node) {
        var topDialog = ds[ds.length - 1].dialog;
        if (node && topDialog && !topDialog._fadeOutDeferred && node.ownerDocument == topDialog.ownerDocument) {
            do {
                if (node == topDialog.domNode || domClass.contains(node, "dijitPopup")) {
                    return;
                }
            } while (node = node.parentNode);
            topDialog.focus();
        }
    });
    if (has("dijit-legacy-requires")) {
        ready(0, function () {
            var requires = ["dijit/TooltipDialog"];
            require(requires);
        });
    }
    return Dialog;
});

