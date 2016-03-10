//>>built

define("dojox/mobile/dh/HtmlContentHandler", ["dojo/_base/kernel", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/Deferred", "dojo/dom-class", "dojo/dom-construct", "dijit/registry", "../lazyLoadUtils"], function (dojo, array, declare, Deferred, domClass, domConstruct, registry, lazyLoadUtils) {
    return declare("dojox.mobile.dh.HtmlContentHandler", null, {parse:function (content, target, refNode) {
        if (this.execScript) {
            content = this.execScript(content);
        }
        var container = domConstruct.create("div", {innerHTML:content, style:{visibility:"hidden"}});
        target.insertBefore(container, refNode);
        return Deferred.when(lazyLoadUtils.instantiateLazyWidgets(container), function () {
            var view, i, len;
            for (i = 0, len = container.childNodes.length; i < len; i++) {
                var n = container.firstChild;
                if (!view && n.nodeType === 1) {
                    view = registry.byNode(n);
                }
                target.insertBefore(container.firstChild, refNode);
            }
            target.removeChild(container);
            if (!view || !domClass.contains(view.domNode, "mblView")) {
                console.log("HtmlContentHandler.parse: invalid view content");
                return null;
            }
            return view.id;
        });
    }});
});

