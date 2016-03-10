//>>built

define("dojox/mobile/ScrollableView", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom-class", "dojo/dom-construct", "dijit/registry", "./View", "./_ScrollableMixin"], function (array, declare, domClass, domConstruct, registry, View, ScrollableMixin) {
    return declare("dojox.mobile.ScrollableView", [View, ScrollableMixin], {scrollableParams:null, keepScrollPos:false, constructor:function () {
        this.scrollableParams = {noResize:true};
    }, buildRendering:function () {
        this.inherited(arguments);
        domClass.add(this.domNode, "mblScrollableView");
        this.domNode.style.overflow = "hidden";
        this.domNode.style.top = "0px";
        this.containerNode = domConstruct.create("div", {className:"mblScrollableViewContainer"}, this.domNode);
        this.containerNode.style.position = "absolute";
        this.containerNode.style.top = "0px";
        if (this.scrollDir === "v") {
            this.containerNode.style.width = "100%";
        }
    }, startup:function () {
        if (this._started) {
            return;
        }
        if (this.fixedFooter && !this.isLocalFooter) {
            this._fixedAppFooter = this.fixedFooter;
            this.fixedFooter = "";
        }
        this.reparent();
        this.inherited(arguments);
    }, resize:function () {
        this.inherited(arguments);
        array.forEach(this.getChildren(), function (child) {
            if (child.resize) {
                child.resize();
            }
        });
        this._dim = this.getDim();
        if (this._conn) {
            this.resetScrollBar();
        }
    }, isTopLevel:function (e) {
        var parent = this.getParent && this.getParent();
        return (!parent || !parent.resize);
    }, addFixedBar:function (widget) {
        var c = widget.domNode;
        var fixed = this.checkFixedBar(c, true);
        if (!fixed) {
            return;
        }
        this.domNode.appendChild(c);
        if (fixed === "top") {
            this.fixedHeaderHeight = c.offsetHeight;
            this.isLocalHeader = true;
        } else {
            if (fixed === "bottom") {
                this.fixedFooterHeight = c.offsetHeight;
                this.isLocalFooter = true;
                c.style.bottom = "0px";
            }
        }
        this.resize();
    }, reparent:function () {
        var i, idx, len, c;
        for (i = 0, idx = 0, len = this.domNode.childNodes.length; i < len; i++) {
            c = this.domNode.childNodes[idx];
            if (c === this.containerNode || this.checkFixedBar(c, true)) {
                idx++;
                continue;
            }
            this.containerNode.appendChild(this.domNode.removeChild(c));
        }
    }, onAfterTransitionIn:function (moveTo, dir, transition, context, method) {
        this.flashScrollBar();
    }, getChildren:function () {
        var children = this.inherited(arguments);
        var fixedWidget;
        if (this.fixedHeader && this.fixedHeader.parentNode === this.domNode) {
            fixedWidget = registry.byNode(this.fixedHeader);
            if (fixedWidget) {
                children.push(fixedWidget);
            }
        }
        if (this.fixedFooter && this.fixedFooter.parentNode === this.domNode) {
            fixedWidget = registry.byNode(this.fixedFooter);
            if (fixedWidget) {
                children.push(fixedWidget);
            }
        }
        return children;
    }, _addTransitionPaddingTop:function (value) {
        this.domNode.style.paddingTop = value + "px";
        this.containerNode.style.paddingTop = value + "px";
    }, _removeTransitionPaddingTop:function () {
        this.domNode.style.paddingTop = "";
        this.containerNode.style.paddingTop = "";
    }});
});

