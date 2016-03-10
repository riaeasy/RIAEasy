//>>built

define("dijit/layout/BorderContainer", ["dojo/_base/array", "dojo/cookie", "dojo/_base/declare", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dojo/keys", "dojo/_base/lang", "dojo/on", "dojo/touch", "../_WidgetBase", "../_Widget", "../_TemplatedMixin", "./LayoutContainer", "./utils"], function (array, cookie, declare, domClass, domConstruct, domGeometry, domStyle, keys, lang, on, touch, _WidgetBase, _Widget, _TemplatedMixin, LayoutContainer, layoutUtils) {
    var _Splitter = declare("dijit.layout._Splitter", [_Widget, _TemplatedMixin], {live:true, templateString:"<div class=\"dijitSplitter\" data-dojo-attach-event=\"onkeydown:_onKeyDown,press:_startDrag,onmouseenter:_onMouse,onmouseleave:_onMouse\" tabIndex=\"0\" role=\"separator\"><div class=\"dijitSplitterThumb\"></div></div>", constructor:function () {
        this._handlers = [];
    }, postMixInProperties:function () {
        this.inherited(arguments);
        this.horizontal = /top|bottom/.test(this.region);
        this._factor = /top|left/.test(this.region) ? 1 : -1;
        this._cookieName = this.container.id + "_" + this.region;
    }, buildRendering:function () {
        this.inherited(arguments);
        domClass.add(this.domNode, "dijitSplitter" + (this.horizontal ? "H" : "V"));
        if (this.container.persist) {
            var persistSize = cookie(this._cookieName);
            if (persistSize) {
                this.child.domNode.style[this.horizontal ? "height" : "width"] = persistSize;
            }
        }
    }, _computeMaxSize:function () {
        var dim = this.horizontal ? "h" : "w", childSize = domGeometry.getMarginBox(this.child.domNode)[dim], center = array.filter(this.container.getChildren(), function (child) {
            return child.region == "center";
        })[0];
        var spaceAvailable = domGeometry.getContentBox(center.domNode)[dim] - 10;
        return Math.min(this.child.maxSize, childSize + spaceAvailable);
    }, _startDrag:function (e) {
        if (!this.cover) {
            this.cover = domConstruct.place("<div class=dijitSplitterCover></div>", this.child.domNode, "after");
        }
        domClass.add(this.cover, "dijitSplitterCoverActive");
        if (this.fake) {
            domConstruct.destroy(this.fake);
        }
        if (!(this._resize = this.live)) {
            (this.fake = this.domNode.cloneNode(true)).removeAttribute("id");
            domClass.add(this.domNode, "dijitSplitterShadow");
            domConstruct.place(this.fake, this.domNode, "after");
        }
        domClass.add(this.domNode, "dijitSplitterActive dijitSplitter" + (this.horizontal ? "H" : "V") + "Active");
        if (this.fake) {
            domClass.remove(this.fake, "dijitSplitterHover dijitSplitter" + (this.horizontal ? "H" : "V") + "Hover");
        }
        var factor = this._factor, isHorizontal = this.horizontal, axis = isHorizontal ? "pageY" : "pageX", pageStart = e[axis], splitterStyle = this.domNode.style, dim = isHorizontal ? "h" : "w", childCS = domStyle.getComputedStyle(this.child.domNode), childStart = domGeometry.getMarginBox(this.child.domNode, childCS)[dim], max = this._computeMaxSize(), min = Math.max(this.child.minSize, domGeometry.getPadBorderExtents(this.child.domNode, childCS)[dim] + 10), region = this.region, splitterAttr = region == "top" || region == "bottom" ? "top" : "left", splitterStart = parseInt(splitterStyle[splitterAttr], 10), resize = this._resize, layoutFunc = lang.hitch(this.container, "_layoutChildren", this.child.id), de = this.ownerDocument;
        this._handlers = this._handlers.concat([on(de, touch.move, this._drag = function (e, forceResize) {
            var delta = e[axis] - pageStart, childSize = factor * delta + childStart, boundChildSize = Math.max(Math.min(childSize, max), min);
            if (resize || forceResize) {
                layoutFunc(boundChildSize);
            }
            splitterStyle[splitterAttr] = delta + splitterStart + factor * (boundChildSize - childSize) + "px";
        }), on(de, "dragstart", function (e) {
            e.stopPropagation();
            e.preventDefault();
        }), on(this.ownerDocumentBody, "selectstart", function (e) {
            e.stopPropagation();
            e.preventDefault();
        }), on(de, touch.release, lang.hitch(this, "_stopDrag"))]);
        e.stopPropagation();
        e.preventDefault();
    }, _onMouse:function (e) {
        var o = (e.type == "mouseover" || e.type == "mouseenter");
        domClass.toggle(this.domNode, "dijitSplitterHover", o);
        domClass.toggle(this.domNode, "dijitSplitter" + (this.horizontal ? "H" : "V") + "Hover", o);
    }, _stopDrag:function (e) {
        try {
            if (this.cover) {
                domClass.remove(this.cover, "dijitSplitterCoverActive");
            }
            if (this.fake) {
                domConstruct.destroy(this.fake);
            }
            domClass.remove(this.domNode, "dijitSplitterActive dijitSplitter" + (this.horizontal ? "H" : "V") + "Active dijitSplitterShadow");
            this._drag(e);
            this._drag(e, true);
        }
        finally {
            this._cleanupHandlers();
            delete this._drag;
        }
        if (this.container.persist) {
            cookie(this._cookieName, this.child.domNode.style[this.horizontal ? "height" : "width"], {expires:365});
        }
    }, _cleanupHandlers:function () {
        var h;
        while (h = this._handlers.pop()) {
            h.remove();
        }
    }, _onKeyDown:function (e) {
        this._resize = true;
        var horizontal = this.horizontal;
        var tick = 1;
        switch (e.keyCode) {
          case horizontal ? keys.UP_ARROW : keys.LEFT_ARROW:
            tick *= -1;
          case horizontal ? keys.DOWN_ARROW : keys.RIGHT_ARROW:
            break;
          default:
            return;
        }
        var childSize = domGeometry.getMarginSize(this.child.domNode)[horizontal ? "h" : "w"] + this._factor * tick;
        this.container._layoutChildren(this.child.id, Math.max(Math.min(childSize, this._computeMaxSize()), this.child.minSize));
        e.stopPropagation();
        e.preventDefault();
    }, destroy:function () {
        this._cleanupHandlers();
        delete this.child;
        delete this.container;
        delete this.cover;
        delete this.fake;
        this.inherited(arguments);
    }});
    var _Gutter = declare("dijit.layout._Gutter", [_Widget, _TemplatedMixin], {templateString:"<div class=\"dijitGutter\" role=\"presentation\"></div>", postMixInProperties:function () {
        this.inherited(arguments);
        this.horizontal = /top|bottom/.test(this.region);
    }, buildRendering:function () {
        this.inherited(arguments);
        domClass.add(this.domNode, "dijitGutter" + (this.horizontal ? "H" : "V"));
    }});
    var BorderContainer = declare("dijit.layout.BorderContainer", LayoutContainer, {gutters:true, liveSplitters:true, persist:false, baseClass:"dijitBorderContainer", _splitterClass:_Splitter, postMixInProperties:function () {
        if (!this.gutters) {
            this.baseClass += "NoGutter";
        }
        this.inherited(arguments);
    }, _setupChild:function (child) {
        this.inherited(arguments);
        var region = child.region, ltr = child.isLeftToRight();
        if (region == "leading") {
            region = ltr ? "left" : "right";
        }
        if (region == "trailing") {
            region = ltr ? "right" : "left";
        }
        if (region) {
            if (region != "center" && (child.splitter || this.gutters) && !child._splitterWidget) {
                var _Splitter = child.splitter ? this._splitterClass : _Gutter;
                if (lang.isString(_Splitter)) {
                    _Splitter = lang.getObject(_Splitter);
                }
                var splitter = new _Splitter({id:child.id + "_splitter", container:this, child:child, region:region, live:this.liveSplitters});
                splitter.isSplitter = true;
                child._splitterWidget = splitter;
                var before = region == "bottom" || region == (this.isLeftToRight() ? "right" : "left");
                domConstruct.place(splitter.domNode, child.domNode, before ? "before" : "after");
                splitter.startup();
            }
        }
    }, layout:function () {
        this._layoutChildren();
    }, removeChild:function (child) {
        var splitter = child._splitterWidget;
        if (splitter) {
            splitter.destroy();
            delete child._splitterWidget;
        }
        this.inherited(arguments);
    }, getChildren:function () {
        return array.filter(this.inherited(arguments), function (widget) {
            return !widget.isSplitter;
        });
    }, getSplitter:function (region) {
        return array.filter(this.getChildren(), function (child) {
            return child.region == region;
        })[0]._splitterWidget;
    }, resize:function (newSize, currentSize) {
        if (!this.cs || !this.pe) {
            var node = this.domNode;
            this.cs = domStyle.getComputedStyle(node);
            this.pe = domGeometry.getPadExtents(node, this.cs);
            this.pe.r = domStyle.toPixelValue(node, this.cs.paddingRight);
            this.pe.b = domStyle.toPixelValue(node, this.cs.paddingBottom);
            domStyle.set(node, "padding", "0px");
        }
        this.inherited(arguments);
    }, _layoutChildren:function (changedChildId, changedChildSize) {
        if (!this._borderBox || !this._borderBox.h) {
            return;
        }
        var childrenAndSplitters = [];
        array.forEach(this._getOrderedChildren(), function (pane) {
            childrenAndSplitters.push(pane);
            if (pane._splitterWidget) {
                childrenAndSplitters.push(pane._splitterWidget);
            }
        });
        var dim = {l:this.pe.l, t:this.pe.t, w:this._borderBox.w - this.pe.w, h:this._borderBox.h - this.pe.h};
        layoutUtils.layoutChildren(this.domNode, dim, childrenAndSplitters, changedChildId, changedChildSize);
    }, destroyRecursive:function () {
        array.forEach(this.getChildren(), function (child) {
            var splitter = child._splitterWidget;
            if (splitter) {
                splitter.destroy();
            }
            delete child._splitterWidget;
        });
        this.inherited(arguments);
    }});
    BorderContainer.ChildWidgetProperties = {splitter:false, minSize:0, maxSize:Infinity};
    lang.mixin(BorderContainer.ChildWidgetProperties, LayoutContainer.ChildWidgetProperties);
    lang.extend(_WidgetBase, BorderContainer.ChildWidgetProperties);
    BorderContainer._Splitter = _Splitter;
    BorderContainer._Gutter = _Gutter;
    return BorderContainer;
});

