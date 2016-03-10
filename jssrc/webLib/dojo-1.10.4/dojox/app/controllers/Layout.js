//>>built

define("dojox/app/controllers/Layout", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/window", "dojo/query", "dojo/dom-geometry", "dojo/dom-attr", "dojo/dom-style", "dijit/registry", "./LayoutBase", "../utils/layout", "../utils/constraints", "dojo/sniff"], function (declare, lang, array, win, query, domGeom, domAttr, domStyle, registry, LayoutBase, layout, constraints, has) {
    return declare("dojox.app.controllers.Layout", LayoutBase, {constructor:function (app, events) {
    }, onResize:function () {
        this._doResize(this.app);
        this.resizeSelectedChildren(this.app);
    }, resizeSelectedChildren:function (w) {
        for (var hash in w.selectedChildren) {
            if (w.selectedChildren[hash] && w.selectedChildren[hash].domNode) {
                this.app.log("in Layout resizeSelectedChildren calling resizeSelectedChildren calling _doResize for w.selectedChildren[hash].id=" + w.selectedChildren[hash].id);
                this._doResize(w.selectedChildren[hash]);
                array.forEach(w.selectedChildren[hash].domNode.children, function (child) {
                    if (registry.byId(child.id) && registry.byId(child.id).resize) {
                        registry.byId(child.id).resize();
                    }
                });
                this.resizeSelectedChildren(w.selectedChildren[hash]);
            }
        }
    }, initLayout:function (event) {
        this.app.log("in app/controllers/Layout.initLayout event=", event);
        this.app.log("in app/controllers/Layout.initLayout event.view.parent.name=[", event.view.parent.name, "]");
        if (!event.view.domNode.parentNode || (has("ie") == 8 && !event.view.domNode.parentElement)) {
            if (this.app.useConfigOrder) {
                event.view.parent.domNode.appendChild(event.view.domNode);
            } else {
                this.addViewToParentDomByConstraint(event);
            }
        }
        domAttr.set(event.view.domNode, "data-app-constraint", event.view.constraint);
        this.inherited(arguments);
    }, addViewToParentDomByConstraint:function (event) {
        var newViewConstraint = event.view.constraint;
        if (newViewConstraint === "bottom") {
            event.view.parent.domNode.appendChild(event.view.domNode);
        } else {
            if (newViewConstraint === "top") {
                event.view.parent.domNode.insertBefore(event.view.domNode, event.view.parent.domNode.firstChild);
            } else {
                if (event.view.parent.domNode.children.length > 0) {
                    for (var childIndex in event.view.parent.domNode.children) {
                        var child = event.view.parent.domNode.children[childIndex];
                        var dir = domStyle.get(event.view.parent.domNode, "direction");
                        var isltr = (dir === "ltr");
                        var LEADING_VIEW = isltr ? "left" : "right";
                        var TRAILING_VIEW = isltr ? "right" : "left";
                        if (child.getAttribute && child.getAttribute("data-app-constraint")) {
                            var previousViewConstraint = child.getAttribute("data-app-constraint");
                            if (previousViewConstraint === "bottom" || (previousViewConstraint === TRAILING_VIEW) || (previousViewConstraint !== "top" && (newViewConstraint === LEADING_VIEW))) {
                                event.view.parent.domNode.insertBefore(event.view.domNode, child);
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (!event.view.domNode.parentNode || (has("ie") == 8 && !event.view.domNode.parentElement)) {
            event.view.parent.domNode.appendChild(event.view.domNode);
        }
    }, _doResize:function (view) {
        var node = view.domNode;
        if (!node) {
            this.app.log("Warning - View has not been loaded, in Layout _doResize view.domNode is not set for view.id=" + view.id + " view=", view);
            return;
        }
        var mb = {};
        if (!("h" in mb) || !("w" in mb)) {
            mb = lang.mixin(domGeom.getMarginBox(node), mb);
        }
        if (view !== this.app) {
            var cs = domStyle.getComputedStyle(node);
            var me = domGeom.getMarginExtents(node, cs);
            var be = domGeom.getBorderExtents(node, cs);
            var bb = (view._borderBox = {w:mb.w - (me.w + be.w), h:mb.h - (me.h + be.h)});
            var pe = domGeom.getPadExtents(node, cs);
            view._contentBox = {l:domStyle.toPixelValue(node, cs.paddingLeft), t:domStyle.toPixelValue(node, cs.paddingTop), w:bb.w - pe.w, h:bb.h - pe.h};
        } else {
            view._contentBox = {l:0, t:0, h:win.global.innerHeight || win.doc.documentElement.clientHeight, w:win.global.innerWidth || win.doc.documentElement.clientWidth};
        }
        this.inherited(arguments);
    }, layoutView:function (event) {
        if (event.view) {
            this.inherited(arguments);
            if (event.doResize) {
                this._doResize(event.parent || this.app);
                this._doResize(event.view);
            }
        }
    }, _doLayout:function (view) {
        if (!view) {
            console.warn("layout empty view.");
            return;
        }
        this.app.log("in Layout _doLayout called for view.id=" + view.id + " view=", view);
        var children;
        var selectedChild = constraints.getSelectedChild(view, view.constraint);
        if (selectedChild && selectedChild.isFullScreen) {
            console.warn("fullscreen sceen layout");
        } else {
            children = query("> [data-app-constraint]", view.domNode).map(function (node) {
                var w = registry.getEnclosingWidget(node);
                if (w) {
                    w._constraint = domAttr.get(node, "data-app-constraint");
                    return w;
                }
                return {domNode:node, _constraint:domAttr.get(node, "data-app-constraint")};
            });
            if (selectedChild) {
                children = array.filter(children, function (c) {
                    return c.domNode && c._constraint;
                }, view);
            }
        }
        if (view._contentBox) {
            layout.layoutChildren(view.domNode, view._contentBox, children);
        }
    }});
});

