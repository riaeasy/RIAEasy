//>>built

define("dojox/app/widgets/_ScrollableMixin", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/window", "dojo/dom-class", "dijit/registry", "dojo/dom", "dojo/dom-construct", "dojox/mobile/scrollable"], function (declare, lang, array, win, domClass, registry, dom, domConstruct, Scrollable) {
    return declare("dojox.app.widgets._ScrollableMixin", Scrollable, {scrollableParams:null, appBars:true, allowNestedScrolls:true, constructor:function () {
        this.scrollableParams = {noResize:true};
    }, destroy:function () {
        this.cleanup();
        this.inherited(arguments);
    }, startup:function () {
        if (this._started) {
            return;
        }
        this.findAppBars();
        var node, params = this.scrollableParams;
        if (this.fixedHeader) {
            node = dom.byId(this.fixedHeader);
            if (node.parentNode == this.domNode) {
                this.isLocalHeader = true;
            }
            params.fixedHeaderHeight = node.offsetHeight;
        }
        if (this.fixedFooter) {
            node = dom.byId(this.fixedFooter);
            if (node) {
                if (node.parentNode == this.domNode) {
                    this.isLocalFooter = true;
                    node.style.bottom = "0px";
                }
                params.fixedFooterHeight = node.offsetHeight;
            }
        }
        this.init(params);
        this.inherited(arguments);
        this.reparent();
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
    }, resize:function () {
        this.inherited(arguments);
        array.forEach(this.getChildren(), function (child) {
            if (child.resize) {
                child.resize();
            }
        });
    }, findAppBars:function () {
        if (!this.appBars) {
            return;
        }
        var i, len, c;
        for (i = 0, len = win.body().childNodes.length; i < len; i++) {
            c = win.body().childNodes[i];
            this.checkFixedBar(c, false);
        }
        if (this.domNode.parentNode) {
            for (i = 0, len = this.domNode.parentNode.childNodes.length; i < len; i++) {
                c = this.domNode.parentNode.childNodes[i];
                this.checkFixedBar(c, false);
            }
        }
        this.fixedFooterHeight = this.fixedFooter ? this.fixedFooter.offsetHeight : 0;
    }, checkFixedBar:function (node, local) {
        if (node.nodeType === 1) {
            var fixed = node.getAttribute("data-app-constraint") || (registry.byNode(node) && registry.byNode(node)["data-app-constraint"]);
            if (fixed === "bottom") {
                domClass.add(node, "mblFixedBottomBar");
                if (local) {
                    this.fixedFooter = node;
                } else {
                    this._fixedAppFooter = node;
                }
                return fixed;
            }
        }
        return null;
    }});
});

