//>>built

define("dojox/mobile/_ScrollableMixin", ["dojo/_base/kernel", "dojo/_base/config", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/window", "dojo/dom", "dojo/dom-class", "dijit/registry", "./scrollable"], function (dojo, config, declare, lang, win, dom, domClass, registry, Scrollable) {
    var cls = declare("dojox.mobile._ScrollableMixin", Scrollable, {fixedHeader:"", fixedFooter:"", _fixedAppFooter:"", scrollableParams:null, allowNestedScrolls:true, appBars:true, constructor:function () {
        this.scrollableParams = {};
    }, destroy:function () {
        this.cleanup();
        this.inherited(arguments);
    }, startup:function () {
        if (this._started) {
            return;
        }
        if (this._fixedAppFooter) {
            this._fixedAppFooter = dom.byId(this._fixedAppFooter);
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
            if (node.parentNode == this.domNode) {
                this.isLocalFooter = true;
                node.style.bottom = "0px";
            }
            params.fixedFooterHeight = node.offsetHeight;
        }
        this.scrollType = this.scrollType || config.mblScrollableScrollType || 0;
        this.init(params);
        if (this.allowNestedScrolls) {
            for (var p = this.getParent(); p; p = p.getParent()) {
                if (p && p.scrollableParams) {
                    this.dirLock = true;
                    p.dirLock = true;
                    break;
                }
            }
        }
        this._resizeHandle = this.subscribe("/dojox/mobile/afterResizeAll", function () {
            if (this.domNode.style.display === "none") {
                return;
            }
            var elem = win.doc.activeElement;
            if (this.isFormElement(elem) && dom.isDescendant(elem, this.containerNode)) {
                this.scrollIntoView(elem);
            }
        });
        this.inherited(arguments);
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
            var fixed = node.getAttribute("fixed") || node.getAttribute("data-mobile-fixed") || (registry.byNode(node) && registry.byNode(node).fixed);
            if (fixed === "top") {
                domClass.add(node, "mblFixedHeaderBar");
                if (local) {
                    node.style.top = "0px";
                    this.fixedHeader = node;
                }
                return fixed;
            } else {
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
        }
        return null;
    }});
    return cls;
});

