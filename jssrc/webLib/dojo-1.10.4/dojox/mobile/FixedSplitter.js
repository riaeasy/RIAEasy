//>>built

define("dojox/mobile/FixedSplitter", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/window", "dojo/dom-class", "dojo/dom-geometry", "dijit/_Contained", "dijit/_Container", "dijit/_WidgetBase", "dojo/has"], function (array, declare, win, domClass, domGeometry, Contained, Container, WidgetBase, has) {
    return declare("dojox.mobile.FixedSplitter", [WidgetBase, Container, Contained], {orientation:"H", variablePane:-1, screenSizeAware:false, screenSizeAwareClass:"dojox/mobile/ScreenSizeAware", baseClass:"mblFixedSplitter", startup:function () {
        if (this._started) {
            return;
        }
        domClass.add(this.domNode, this.baseClass + this.orientation);
        var parent = this.getParent(), f;
        if (!parent || !parent.resize) {
            var _this = this;
            f = function () {
                _this.defer(function () {
                    _this.resize();
                });
            };
        }
        if (this.screenSizeAware) {
            require([this.screenSizeAwareClass], function (module) {
                module.getInstance();
                f && f();
            });
        } else {
            f && f();
        }
        this.inherited(arguments);
    }, resize:function () {
        var paddingTop = domGeometry.getPadExtents(this.domNode).t;
        var wh = this.orientation === "H" ? "w" : "h", tl = this.orientation === "H" ? "l" : "t", props1 = {}, props2 = {}, i, c, h, a = [], offset = 0, total = 0, children = array.filter(this.domNode.childNodes, function (node) {
            return node.nodeType == 1;
        }), idx = this.variablePane == -1 ? children.length - 1 : this.variablePane;
        for (i = 0; i < children.length; i++) {
            if (i != idx) {
                a[i] = domGeometry.getMarginBox(children[i])[wh];
                total += a[i];
            }
        }
        if (this.orientation == "V") {
            if (this.domNode.parentNode.tagName == "BODY") {
                if (array.filter(win.body().childNodes, function (node) {
                    return node.nodeType == 1;
                }).length == 1) {
                    h = (win.global.innerHeight || win.doc.documentElement.clientHeight);
                }
            }
        }
        var l = (h || domGeometry.getMarginBox(this.domNode)[wh]) - total;
        if (this.orientation === "V") {
            l -= paddingTop;
        }
        props2[wh] = a[idx] = l;
        c = children[idx];
        domGeometry.setMarginBox(c, props2);
        c.style[this.orientation === "H" ? "height" : "width"] = "";
        if (0 && (this.orientation == "H" && !this.isLeftToRight())) {
            offset = l;
            for (i = children.length - 1; i >= 0; i--) {
                c = children[i];
                props1[tl] = l - offset;
                domGeometry.setMarginBox(c, props1);
                if (this.orientation === "H") {
                    c.style.top = paddingTop + "px";
                } else {
                    c.style.left = "";
                }
                offset -= a[i];
            }
        } else {
            if (this.orientation === "V") {
                offset = offset ? offset + paddingTop : paddingTop;
            }
            for (i = 0; i < children.length; i++) {
                c = children[i];
                props1[tl] = offset;
                domGeometry.setMarginBox(c, props1);
                if (this.orientation === "H") {
                    c.style.top = paddingTop + "px";
                } else {
                    c.style.left = "";
                }
                offset += a[i];
            }
        }
        array.forEach(this.getChildren(), function (child) {
            if (child.resize) {
                child.resize();
            }
        });
    }, _setOrientationAttr:function (orientation) {
        var s = this.baseClass;
        domClass.replace(this.domNode, s + orientation, s + this.orientation);
        this.orientation = orientation;
        if (this._started) {
            this.resize();
        }
    }});
});

