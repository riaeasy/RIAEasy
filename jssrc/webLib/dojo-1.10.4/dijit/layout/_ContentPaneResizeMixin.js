//>>built

define("dijit/layout/_ContentPaneResizeMixin", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style", "dojo/_base/lang", "dojo/query", "../registry", "../Viewport", "./utils"], function (array, declare, domClass, domGeometry, domStyle, lang, query, registry, Viewport, layoutUtils) {
    return declare("dijit.layout._ContentPaneResizeMixin", null, {doLayout:true, isLayoutContainer:true, startup:function () {
        if (this._started) {
            return;
        }
        var parent = this.getParent();
        this._childOfLayoutWidget = parent && parent.isLayoutContainer;
        this._needLayout = !this._childOfLayoutWidget;
        this.inherited(arguments);
        if (this._isShown()) {
            this._onShow();
        }
        if (!this._childOfLayoutWidget) {
            this.own(Viewport.on("resize", lang.hitch(this, "resize")));
        }
    }, _checkIfSingleChild:function () {
        if (!this.doLayout) {
            return;
        }
        var candidateWidgets = [], otherVisibleNodes = false;
        query("> *", this.containerNode).some(function (node) {
            var widget = registry.byNode(node);
            if (widget && widget.resize) {
                candidateWidgets.push(widget);
            } else {
                if (!/script|link|style/i.test(node.nodeName) && node.offsetHeight) {
                    otherVisibleNodes = true;
                }
            }
        });
        this._singleChild = candidateWidgets.length == 1 && !otherVisibleNodes ? candidateWidgets[0] : null;
        domClass.toggle(this.containerNode, this.baseClass + "SingleChild", !!this._singleChild);
    }, resize:function (changeSize, resultSize) {
        this._resizeCalled = true;
        this._scheduleLayout(changeSize, resultSize);
    }, _scheduleLayout:function (changeSize, resultSize) {
        if (this._isShown()) {
            this._layout(changeSize, resultSize);
        } else {
            this._needLayout = true;
            this._changeSize = changeSize;
            this._resultSize = resultSize;
        }
    }, _layout:function (changeSize, resultSize) {
        delete this._needLayout;
        if (!this._wasShown && this.open !== false) {
            this._onShow();
        }
        if (changeSize) {
            domGeometry.setMarginBox(this.domNode, changeSize);
        }
        var cn = this.containerNode;
        if (cn === this.domNode) {
            var mb = resultSize || {};
            lang.mixin(mb, changeSize || {});
            if (!("h" in mb) || !("w" in mb)) {
                mb = lang.mixin(domGeometry.getMarginBox(cn), mb);
            }
            this._contentBox = layoutUtils.marginBox2contentBox(cn, mb);
        } else {
            this._contentBox = domGeometry.getContentBox(cn);
        }
        this._layoutChildren();
    }, _layoutChildren:function () {
        this._checkIfSingleChild();
        if (this._singleChild && this._singleChild.resize) {
            var cb = this._contentBox || domGeometry.getContentBox(this.containerNode);
            this._singleChild.resize({w:cb.w, h:cb.h});
        } else {
            var children = this.getChildren(), widget, i = 0;
            while (widget = children[i++]) {
                if (widget.resize) {
                    widget.resize();
                }
            }
        }
    }, _isShown:function () {
        if (this._childOfLayoutWidget) {
            if (this._resizeCalled && "open" in this) {
                return this.open;
            }
            return this._resizeCalled;
        } else {
            if ("open" in this) {
                return this.open;
            } else {
                var node = this.domNode, parent = this.domNode.parentNode;
                return (node.style.display != "none") && (node.style.visibility != "hidden") && !domClass.contains(node, "dijitHidden") && parent && parent.style && (parent.style.display != "none");
            }
        }
    }, _onShow:function () {
        this._wasShown = true;
        if (this._needLayout) {
            this._layout(this._changeSize, this._resultSize);
        }
        this.inherited(arguments);
    }});
});

