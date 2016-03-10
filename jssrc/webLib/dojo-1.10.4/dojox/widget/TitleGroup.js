//>>built

define("dojox/widget/TitleGroup", ["dojo", "dijit/registry", "dijit/_Widget", "dijit/TitlePane"], function (dojo, registry, widget, titlepane) {
    var tp = titlepane.prototype, lookup = function () {
        var parent = this._dxfindParent && this._dxfindParent();
        parent && parent.selectChild(this);
    };
    tp._dxfindParent = function () {
        var n = this.domNode.parentNode;
        if (n) {
            n = registry.getEnclosingWidget(n);
            return n && n instanceof dojox.widget.TitleGroup && n;
        }
        return n;
    };
    dojo.connect(tp, "_onTitleClick", lookup);
    dojo.connect(tp, "_onTitleKey", function (e) {
        if (!(e && e.type && e.type == "keypress" && e.charOrCode == dojo.keys.TAB)) {
            lookup.apply(this, arguments);
        }
    });
    return dojo.declare("dojox.widget.TitleGroup", dijit._Widget, {"class":"dojoxTitleGroup", addChild:function (widget, position) {
        return widget.placeAt(this.domNode, position);
    }, removeChild:function (widget) {
        this.domNode.removeChild(widget.domNode);
        return widget;
    }, selectChild:function (widget) {
        widget && dojo.query("> .dijitTitlePane", this.domNode).forEach(function (n) {
            var tp = registry.byNode(n);
            tp && tp !== widget && tp.open && tp.toggle();
        });
        return widget;
    }});
});

